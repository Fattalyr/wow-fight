import { Injectable } from '@angular/core';
import { Actions, createEffect, CreateEffectMetadata, ofType } from '@ngrx/effects';
import { combineLatest, } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import {
    selectCPUBeasts,
    selectCPUCharacter,
    selectPlayerBeasts,
    selectPlayerCharacter,
} from '../settings/settings.selectors';
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
        private store: Store,
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
