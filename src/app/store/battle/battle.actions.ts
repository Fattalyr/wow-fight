import { createAction, props } from '@ngrx/store';
import { ITurn } from './battle.reducer';
import { MOVING_STATUS } from '../../models';

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

export const nextMove = createAction(
    `[ MOVE ] Next Move`,
    props<{ move: MOVING_STATUS }>()
);

export const playerMove = createAction(
    `[ PLAYER MOVE ] Executing`
);

export const playerBeastsMove = createAction(
    `[ PLAYER\'S BEASTS MOVE ] Executing`
);

export const CPUMove = createAction(
    `[ CPU MOVE ] Executing`
);

export const CPUsBeastsMove = createAction(
    `[ CPU\'s BEASTS MOVE ] Executing`
);
