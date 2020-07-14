import { createAction, props } from '@ngrx/store';
import { IBeast, ICharacter } from '../../classes/characters';

export const updatePlayerCharacter = createAction(
    `[ SETTINGS ] Update Player Character`,
    props<{ playerCharacter: ICharacter }>()
);

export const updateCPUCharacter = createAction(
    `[ SETTINGS ] Update CPU Character`,
    props<{ cpuCharacter: ICharacter }>()
);

export const addBeast = createAction(
    `[ SETTINGS ] Add New Beast`,
    props<{ beast: IBeast }>()
);

export const updateBeast = createAction(
    `[ SETTINGS ] Update Beast`,
    props<{ beast: IBeast }>()
);

export const toggleCharacters = createAction(
    `[ SETTINGS ] Toggle Characters`
);
