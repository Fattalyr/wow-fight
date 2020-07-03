import { createAction, props } from '@ngrx/store';
import { NAMES } from '../../constants/constants';

export const updateRoundDuration = createAction(
    `[ SETTINGS ] Update Round Duration`,
    props<{ roundDuration: number }>()
);

export const updateUserCharacter = createAction(
    `[ SETTINGS ] Update User Character`,
    props<{ userCharacter: NAMES }>()
);
