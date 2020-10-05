import { createFeatureSelector, createSelector } from '@ngrx/store';
import { selectAllCharacters, partiesFeatureKey, IPartiesState } from './parties.reducer';
import { CharacterNormalize } from './parties.normalize';
import { INormalizedBeast, INormalizedCharacter } from './parties.models';
import { STATUSES } from '../../models';


export const selectedParties = createFeatureSelector(partiesFeatureKey);

/**
 * @description - Returns all Characters and Beasts.
 */
export const selectCharacters = createSelector(
    selectedParties,
    selectAllCharacters,
    (state: Array<INormalizedCharacter | INormalizedBeast>) => CharacterNormalize.denormalizeBatch(state)
);

/**
 * @description - Returns all Characters and Beasts filtered by Prop and its value.
 */
export const selectCharactersByProp = createSelector(
    selectedParties,
    <T>(state: IPartiesState, { prop, value }: { prop: string, value: T }) =>
        selectAllCharacters(state).filter(character => character[ prop ] === value),
    (state: Array<INormalizedCharacter | INormalizedBeast>) => CharacterNormalize.denormalizeBatch(state)
);

/**
 * @description - Returns one Character or Beast found by Prop and its value.
 */
export const selectCharacterByProp = createSelector(
    selectedParties,
    <T>(state: IPartiesState, { prop, value }: { prop: string, value: T }) =>
        selectAllCharacters(state).find(character => character[prop] === value),
    (state, characterOrBeast: INormalizedCharacter | INormalizedBeast) =>
        CharacterNormalize.denormalize(characterOrBeast)
);

export const selectPlayerCharacter = createSelector(
    selectedParties,
    (state: IPartiesState) => selectCharacterByProp(state, { prop: 'status', value: STATUSES.PLAYER }),
);

export const selectCPUCharacter = createSelector(
    selectedParties,
    (state: IPartiesState) => selectCharacterByProp(state, { prop: 'status', value: STATUSES.CPU }),
);

export const selectPlayerBeasts = createSelector(
    selectedParties,
    (state: IPartiesState) => selectCharactersByProp(state, { prop: 'status', value: STATUSES.PLAYERS_BEAST }),
);

export const selectCPUBeasts = createSelector(
    selectedParties,
    (state: IPartiesState) => selectCharactersByProp(state, { prop: 'status', value: STATUSES.CPUS_BEAST }),
);
