import { Injectable } from '@angular/core';
import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';
import { map, tap, switchMap, filter, distinctUntilChanged } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AttackService } from '../../services/attack.service';
import { nextMove, playerPassedTurn } from './battle.actions';
import { MOVING_QUERY } from '../../constants/constants';
import { MOVING_STATUS } from '../../models';



@Injectable()
export class BattleEffects {
    public getBattle$ = this.getBattleFn$();
    public getMove$ = this.nextMoveFn$();

    constructor(
        private actions$: Actions,
        private attackService: AttackService,
    ) {
    }

    private getBattleFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerPassedTurn),
            map(() => {
                const status = MOVING_QUERY[1];
                return nextMove({ move: status });
            }),
        ));
    }

    private nextMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(nextMove),
            distinctUntilChanged((a, b) => a.move === b.move),
            filter(({ move }) => move !== MOVING_STATUS.WAITING),
            map(({ move }) => {
                const stepIndex = MOVING_QUERY.findIndex(status => status === move);
                const nextIndex = (stepIndex + 1) % MOVING_QUERY.length;
                return nextMove({ move: MOVING_QUERY[ nextIndex ] });
            }),
        ));
    }
}
