import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ISettingsState, settingsFeatureKey } from './settings.reducer';

export const selectSettings = createFeatureSelector<ISettingsState>(settingsFeatureKey);

export const selectRoundDuration = createSelector(
    selectSettings,
    state => state.roundDuration,
);

export const selectUserCharacter = createSelector(
    selectSettings,
    state => state.userCharacter,
);
