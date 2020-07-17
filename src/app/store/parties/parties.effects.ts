import { Injectable } from '@angular/core';
import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';
import { combineLatest, interval } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { selectAllCharactersAndBeasts, } from '../parties/parties.selectors';
import { AttackService } from '../../services/attack.service';
import {
    CPUMove,
    CPUsBeastsMove,
    moveCompleted, packageOfUpdates,
    playerBeastsMove,
    playerJustHasStartedMove,
    playerMove,
} from './parties.actions';


@Injectable()
export class PartiesEffects {
    public startMove$ = this.startMoveFn$();
    public playerMove$ = this.playerMoveFn$();
    public cpuMove$ = this.CPUMoveFn$();
    public playersBeastsMove$ = this.playersBeastsMoveFn$();
    public cpuBeastsMove$ = this.CPUsBeastsMoveFn$();
    public moveCompleted$ = this.moveCompletedFn$();

    constructor(
        private actions$: Actions,
        private attackService: AttackService,
    ) {
    }

    private startMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerJustHasStartedMove),
            tap(() => console.log('PASSED TURN')),
            map(() => playerMove()),
        ));
    }

    private playerMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerMove),
            map((val) => {
                this.attackService.initNewTurn();
                this.attackService.playerIsMoving();
                return val;
            }),
            switchMap(() => this.actions$.pipe(ofType(packageOfUpdates))),
            map(() => playerBeastsMove()),
        ));
    }

    private playersBeastsMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerBeastsMove),
            map((val) => {
                this.attackService.playersBeastsAreMoving();
                return val;
            }),
            switchMap(() => this.actions$.pipe(ofType(packageOfUpdates))),
            map(() => CPUMove()),
        ));
    }

    private CPUMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(CPUMove),
            map((val) => {
                this.attackService.CPUIsMoving();
                return val;
            }),
            switchMap(() => this.actions$.pipe(ofType(packageOfUpdates))),
            map(() => CPUsBeastsMove()),
        ));
    }

    private CPUsBeastsMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(CPUsBeastsMove),
            map((val) => {
                this.attackService.CPUsBeastsAreMoving();
                return val;
            }),
            switchMap(() => this.actions$.pipe(ofType(packageOfUpdates))),
            map(() => moveCompleted({ turn: this.attackService.getTurn() })),
        ));
    }

    private moveCompletedFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(moveCompleted),
        ), { dispatch: false });
    }
}
