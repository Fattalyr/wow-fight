import { createAction, props } from '@ngrx/store';
import { CharacterClass } from '../../classes/character.class';
import { BeastClass } from '../../classes/beast.class';
import { IBeastMutableCopy, ICharacterMutableCopy } from '../../models';

export const updatePlayerCharacter = createAction(
    `[ SETTINGS ] Update Player Character`,
    props<{ playerCharacter: CharacterClass | ICharacterMutableCopy }>()
);

export const updateCPUCharacter = createAction(
    `[ SETTINGS ] Update CPU Character`,
    props<{ cpuCharacter: CharacterClass | ICharacterMutableCopy }>()
);

export const addBeast = createAction(
    `[ SETTINGS ] Add New Beast`,
    props<{ beast: BeastClass | IBeastMutableCopy }>()
);

export const updateBeast = createAction(
    `[ SETTINGS ] Update Beast`,
    props<{ beast: BeastClass | IBeastMutableCopy }>()
);

export const toggleCharacters = createAction(
    `[ SETTINGS ] Toggle Characters`
);
