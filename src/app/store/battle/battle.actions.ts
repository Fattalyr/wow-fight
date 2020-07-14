import { createAction, props } from '@ngrx/store';
import { ITurn } from './battle.reducer';
import { MOVING_QUERY } from '../../models';

export const turnCompleted = createAction(
    `[ BATTLE ] Turn Completed`,
    props<{ turn: ITurn }>()
);

export const deleteBattle = createAction(
    `[ BATTLE ] Delete Battle`
);

export const playerPassedTurn = createAction(
    `[ MOVE ] Player Passed Turn`,
);

export const playerIsMoving = createAction(
    `[ MOVE ] Now Attacking: ${ MOVING_QUERY.PLAYER }`
);

export const CPUIsMoving = createAction(
    `[ MOVE ] Now Attacking: ${ MOVING_QUERY.CPU }`
);

export const playersBeastsAreMoving = createAction(
    `[ MOVE ] Now Attackoing: ${ MOVING_QUERY.PLAYERS_BEASTS }`
);

export const CPUsBeastsAreMoving = createAction(
    `[ MOVE ] Now Attackoing: ${ MOVING_QUERY.CPUS_BEASTS }`
);
