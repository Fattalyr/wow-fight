import { createFeatureSelector, createSelector } from '@ngrx/store';
import { battleFeatureKey, selectAllTurns } from './battle.reducer';

export const selectTurns = createSelector(
    createFeatureSelector(battleFeatureKey),
    selectAllTurns,
);
