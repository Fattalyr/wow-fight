import { Injectable } from '@angular/core';
import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';
import { combineLatest, interval } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import {
    selectAllCharactersAndBeasts,
    selectCPUBeasts,
    selectCPUCharacter,
    selectPlayerBeasts,
    selectPlayerCharacter,
} from '../settings/settings.selectors';
import { AttackService } from '../../services/attack.service';
import {
    CPUMove,
    CPUsBeastsMove,
    nextMove,
    playerBeastsMove,
    playerMove,
    playerPassedTurn,
    turnCompleted,
} from './battle.actions';
import { MOVING_QUERY } from '../../constants/constants';
import { MOVING_STATUS } from '../../models';


@Injectable()
export class BattleEffects {
    public startMove$ = this.startMoveFn$();
    public getMove$ = this.nextMoveFn$();

    constructor(
        private actions$: Actions,
        private attackService: AttackService,
        private store: Store,
    ) {
    }

    private startMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(playerPassedTurn),
            map(() => {
                const status = MOVING_QUERY[1];
                // return nextMove({ move: status });
                return playerMove();
            }),
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
            switchMap(() => this.store.select(selectAllCharactersAndBeasts)),
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
            switchMap(() => this.store.select(selectAllCharactersAndBeasts)),
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
            switchMap(() => this.store.select(selectAllCharactersAndBeasts)),
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
            switchMap(() => this.store.select(selectAllCharactersAndBeasts)),
            map(() => turnCompleted({ turn: this.attackService.getTurn() })),
        ));
    }

    private nextMoveFn$(): CreateEffectMetadata {
        return createEffect(() => this.actions$.pipe(
            ofType(nextMove),
            distinctUntilChanged((a, b) => a.move === b.move),
            filter(({ move }) => move !== MOVING_STATUS.WAITING),
            map(({ move }) => {
                const stepIndex = MOVING_QUERY.findIndex(status => status === move);
                if (stepIndex === 1) {
                    this.attackService.initNewTurn();
                }
                const nextIndex = (stepIndex + 1) % MOVING_QUERY.length;
                const currentPlayer = MOVING_QUERY[ stepIndex ];
                const nextPlayer = MOVING_QUERY[ nextIndex ];
                let nextMoving: () => void;

                switch (currentPlayer) {
                    case MOVING_STATUS.PLAYER:
                        nextMoving = this.attackService.playerIsMoving;
                        break;
                    case MOVING_STATUS.CPU:
                        nextMoving = this.attackService.CPUIsMoving;
                        break;
                    case MOVING_STATUS.PLAYERS_BEASTS:
                        nextMoving = this.attackService.playersBeastsAreMoving;
                        break;
                    case MOVING_STATUS.CPUS_BEASTS:
                        nextMoving = this.attackService.CPUsBeastsAreMoving;
                        break;
                    default:
                        nextMoving = () => {};
                        break;
                }

                nextMoving.bind(this.attackService)();

                return { nextPlayer, currentPlayer };
            }),
            switchMap(({ nextPlayer, }) => interval(2000)
                .pipe(map(() => ({ nextPlayer, }))),
            ),
            switchMap(({ nextPlayer, }) => combineLatest([
                this.store.select(selectPlayerCharacter),
                this.store.select(selectCPUCharacter),
                this.store.select(selectPlayerBeasts),
                this.store.select(selectCPUBeasts),
            ])
                .pipe(
                    map(([
                        playerCharacter,
                        cpuCharacter,
                        playerBeasts,
                        cpuBeast
                    ]) => {
                        console.log(' ');
                        console.log(
                            playerCharacter,
                            cpuCharacter,
                            playerBeasts,
                            cpuBeast
                        );
                        console.log(' ');
                        return {
                            playerCharacter,
                            cpuCharacter,
                            playerBeasts,
                            cpuBeast,
                            nextPlayer,
                        };
                    }),
                )
            ),
            map(({ nextPlayer }) => nextMove({ move: nextPlayer })),
        ));
    }
}
