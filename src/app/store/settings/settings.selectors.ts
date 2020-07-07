import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ISettingsState, settingsFeatureKey } from './settings.reducer';

export const selectSettings = createFeatureSelector<ISettingsState>(settingsFeatureKey);

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
    state => state.playerCharacter,
);

export const selectCPUCharacter = createSelector(
    selectSettings,
    state => state.cpuCharacter,
);

export const selectPlayerBeasts = createSelector(
    selectSettings,
    state => state.playerBeasts,
);

export const selectCPUBeasts = createSelector(
    selectSettings,
    state => state.cpuBeasts,
);
