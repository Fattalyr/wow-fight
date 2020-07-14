import { Injectable } from '@angular/core';
import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AttackService } from '../../services/attack.service';
import { playerPassedTurn } from './battle.actions';


@Injectable()
export class BattleEffects {
    public getBattle$ = this.getBattleFn$();

    constructor(
        private actions$: Actions,
        private attackService: AttackService,
    ) {
    }

    private getBattleFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerPassedTurn),
            tap(() => console.log('MOVING NOW !')),
        ));
    }
}
