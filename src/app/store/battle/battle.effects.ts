import { Injectable } from '@angular/core';
import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { AttackService } from '../../services/attack.service';
import { turnCompleted } from './battle.actions';


@Injectable()
export class BattleEffects {
    public turnCompleted$ = this.turnCompletedFn$();

    constructor(
        private actions$: Actions,
        private attackService: AttackService,
    ) {
    }

    private turnCompletedFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(turnCompleted),
            tap(() => this.attackService.initNewTurnOrFinalizeGame()),
        ), { dispatch: false });
    }
}
