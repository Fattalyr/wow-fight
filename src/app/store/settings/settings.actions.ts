import { createAction, props } from '@ngrx/store';
import { CharacterClass } from '../../classes/character.class';
import { BeastClass } from '../../classes/beast.class';

export const updatePlayerCharacter = createAction(
    `[ SETTINGS ] Update Player Character`,
    props<{ playerCharacter: CharacterClass }>()
);

export const updateCPUCharacter = createAction(
    `[ SETTINGS ] Update CPU Character`,
    props<{ cpuCharacter: CharacterClass }>()
);

export const addBeast = createAction(
    `[ SETTINGS ] Add New Beast`,
    props<{ beast: BeastClass }>()
);

export const updateBeast = createAction(
    `[ SETTINGS ] Update Beast`,
    props<{ beast: BeastClass }>()
);

export const toggleCharacters = createAction(
    `[ SETTINGS ] Toggle Characters`
);
