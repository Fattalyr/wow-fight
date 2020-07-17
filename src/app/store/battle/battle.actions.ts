import { createAction, props } from '@ngrx/store';
import { ITurn } from './battle.reducer';

export const turnCompleted = createAction(
    `[ BATTLE ] Turn Completed`,
    props<{ turn: ITurn }>()
);

export const deleteBattle = createAction(
    `[ BATTLE ] Delete Battle`
);
