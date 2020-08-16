import { Injectable } from '@angular/core';
import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
import { AttackService } from '../../services/attack.service';
import {
    playerJustHasStartedMove,
    playerMoveStarted,
    playerMoveCompleted,
    playerBeastsMoveStarted,
    playerBeastsMoveCompleted,
    CPUMoveStarted,
    CPUMoveCompleted,
    CPUsBeastsMoveStarted,
    CPUsBeastsMoveCompleted,
    moveCompleted,
} from './parties.actions';


@Injectable()
export class PartiesEffects {
    public startMove$ = this.startMoveFn$();
    public playerMoveStarted$ = this.playerMoveStartedFn$();
    public cpuMoveStarted$ = this.CPUMoveStartedFn$();
    public playersBeastsMoveStarted$ = this.playersBeastsMoveStartedFn$();
    public cpuBeastsMoveStarted$ = this.CPUsBeastsMoveStartedFn$();
    public moveCompleted$ = this.moveCompletedFn$();

    constructor(
        private actions$: Actions,
        private attackService: AttackService,
    ) {
    }

    private startMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerJustHasStartedMove),
            map(() => playerMoveStarted()),
        ));
    }

    private playerMoveStartedFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerMoveStarted),
            map((val) => {
                this.attackService.initNewTurn();
                this.attackService.playerIsMoving();
                return val;
            }),
            switchMap(() => this.actions$.pipe(ofType(playerMoveCompleted))),
            map(() => playerBeastsMoveStarted()),
        ));
    }

    private playersBeastsMoveStartedFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerBeastsMoveStarted),
            map((val) => {
                this.attackService.playersBeastsAreMoving();
                return val;
            }),
            switchMap(() => this.actions$.pipe(ofType(playerBeastsMoveCompleted))),
            map(() => CPUMoveStarted()),
        ));
    }

    private CPUMoveStartedFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(CPUMoveStarted),
            map((val) => {
                this.attackService.CPUIsMoving();
                return val;
            }),
            switchMap(() => this.actions$.pipe(ofType(CPUMoveCompleted))),
            map(() => CPUsBeastsMoveStarted()),
        ));
    }

    private CPUsBeastsMoveStartedFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(CPUsBeastsMoveStarted),
            map((val) => {
                this.attackService.CPUsBeastsAreMoving();
                return val;
            }),
            switchMap(() => this.actions$.pipe(ofType(CPUsBeastsMoveCompleted))),
            map(() => moveCompleted()),
        ));
    }

    private moveCompletedFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(moveCompleted),
            tap(() => this.attackService.saveTurn()),
        ), { dispatch: false });
    }
}
