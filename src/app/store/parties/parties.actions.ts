import { createAction, props } from '@ngrx/store';
import { IBeast, ICharacter } from '../../classes/characters';

export const addCharacter = createAction(
    `[ CHARACTERS ] Add One`,
    props< { character: ICharacter | IBeast }>()
);

export const updateCharacter = createAction(
    `[ CHARACTERS ] Update One`,
    props< { character: ICharacter | IBeast }>()
);

export const updateCharacters = createAction(
    `[ CHARACTERS ] Update Many`,
    props< { characters: Array<ICharacter | IBeast> }>()
);

export const removeCharacter = createAction(
    `[ CHARACTERS ] Remove One`,
    props< { characterId: string }>()
);
