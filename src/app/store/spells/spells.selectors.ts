import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ICastedSpell, selectAllSpells as selectAll, spellsFeatureKey } from './spells.reducer';

export const selectedSpells = createFeatureSelector(spellsFeatureKey);

export const selectAllSpells = createSelector(
    selectedSpells,
    selectAll
);

export const selectSpell = createSelector(
    selectedSpells,
    <T>(state: ICastedSpell[], { prop, value }: { prop: string, value: T }) =>
        state.find(spell => spell[ prop ] === value)
);

export const selectSpells = createSelector(
    selectedSpells,
    <T>(state: ICastedSpell[], { prop, value }: { prop: string, value: T }) =>
        state.filter(spell => spell[ prop ] === value)
);
