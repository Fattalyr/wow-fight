import { createFeatureSelector, createSelector } from '@ngrx/store';
import { selectAllCharacters, partiesFeatureKey, IPartiesState } from './parties.reducer';
import { CharacterNormalize } from './parties.normalize';
import { INormalizedBeast, INormalizedCharacter } from './parties.models';
import { STATUSES } from '../../models';


export const selectedCharacters = createFeatureSelector(partiesFeatureKey);

/**
 * @description - Returns all Characters and Beasts.
 */
export const selectCharacters = createSelector(
    selectedCharacters,
    selectAllCharacters,
    (state: Array<INormalizedCharacter | INormalizedBeast>) => CharacterNormalize.denormalizeBatch(state)
);

/**
 * @description - Returns all Characters and Beasts filtered by Prop and its value.
 */
export const selectCharactersByProp = createSelector(
    selectedCharacters,
    <T>(state: IPartiesState, { prop, value }: { prop: string, value: T }) =>
        selectAllCharacters(state).filter(character => character[ prop ] === value),
    (state: Array<INormalizedCharacter | INormalizedBeast>) => CharacterNormalize.denormalizeBatch(state)
);

/**
 * @description - Returns one Character or Beast found by Prop and its value.
 */
export const selectCharacterByProp = createSelector(
    selectedCharacters,
    <T>(state: IPartiesState, { prop, value }: { prop: string, value: T }) =>
        selectAllCharacters(state).find(character => character[prop] === value),
    (state, characterOrBeast: INormalizedCharacter | INormalizedBeast) =>
        CharacterNormalize.denormalize(characterOrBeast)
);

export const selectPlayerCharacter = createSelector(
    selectedCharacters,
    (state: IPartiesState) => selectCharacterByProp(state, { prop: 'status', value: STATUSES.PLAYER }),
);

export const selectCPUCharacter = createSelector(
    selectedCharacters,
    (state: IPartiesState) => selectCharacterByProp(state, { prop: 'status', value: STATUSES.CPU }),
);

export const selectPlayerBeasts = createSelector(
    selectedCharacters,
    (state: IPartiesState) => selectCharactersByProp(state, { prop: 'status', value: STATUSES.PLAYERS_BEAST }),
);

export const selectCPUBeasts = createSelector(
    selectedCharacters,
    (state: IPartiesState) => selectCharactersByProp(state, { prop: 'status', value: STATUSES.CPUS_BEAST }),
);
