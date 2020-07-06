import { createFeatureSelector, createSelector } from '@ngrx/store';
import { battleFeatureKey, selectAllTurns, selectAllTurnsNumber } from './battle.reducer';

export const selectTurns = createSelector(
    createFeatureSelector(battleFeatureKey),
    selectAllTurns,
);

export const selectTotalTurns = createSelector(
    createFeatureSelector(battleFeatureKey),
    selectAllTurnsNumber,
);
