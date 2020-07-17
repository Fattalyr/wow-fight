import { createFeatureSelector, createSelector } from '@ngrx/store';
import { settingsFeatureKey } from './parties.reducer';
import { CharacterNormalizeService } from './character-normalize.service';
import { NORMALIZATION_MAP } from '../../classes/characters';
import { IPartyState } from './parties.models';

export const selectSettings = createFeatureSelector<IPartyState>(settingsFeatureKey);

export const selectPlayerPartyId = createSelector(
    selectSettings,
    state => state.playerPartyId,
);

export const selectCPUPartyId = createSelector(
    selectSettings,
    state => state.cpuPartyId,
);

export const selectPlayerCharacter = createSelector(
    selectSettings,
    state => CharacterNormalizeService.deNormalize(state, NORMALIZATION_MAP.PLAYER),
);

export const selectCPUCharacter = createSelector(
    selectSettings,
    state => CharacterNormalizeService.deNormalize(state, NORMALIZATION_MAP.CPU),
);

export const selectPlayerBeasts = createSelector(
    selectSettings,
    state => state.playerBeasts,
);

export const selectCPUBeasts = createSelector(
    selectSettings,
    state => state.cpuBeasts,
);

export const selectAllCharactersAndBeasts = createSelector(
    selectSettings,
    state => [
        CharacterNormalizeService.deNormalize(state, NORMALIZATION_MAP.PLAYER),
        state.playerBeasts,
        CharacterNormalizeService.deNormalize(state, NORMALIZATION_MAP.CPU),
        state.cpuBeasts,
    ],
);
