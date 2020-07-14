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
