import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { addSpell, updateSpell, removeSpell, removeBatch, updateSpells } from './spells.actions';
import { SPELLS } from '../../models';


export const spellsFeatureKey = 'spells';

export interface ICastedSpell {
    id: string; // uuid
    spellName: SPELLS;
    initiator: string; // uuid
    target: string;    // uuid
    duration: number;
    coolDown: number;
    canNotAttacks?: boolean;
    addHP?: boolean;
    reduceHP?: boolean;
    calledBeast?: string;
    HPDelta?: number;
    roundNumber: number;
}

export interface ISpellsState extends EntityState<ICastedSpell>{}

const adapter: EntityAdapter<ICastedSpell> = createEntityAdapter<ICastedSpell>({
    selectId: spell => spell.id
});

const initialState: ISpellsState = adapter.getInitialState({});

const spellReducerFn = createReducer(
    initialState,
    on(addSpell,
        (state, { spell }) => adapter.upsertOne(spell, state)
    ),
    on(updateSpell,
        (state, { spell }) => adapter.updateOne({ id: spell.id, changes: spell }, state)
    ),
    on(updateSpells,
        (state, { spells }) => adapter.updateMany(spells.map(spell => ({ id: spell.id, changes: spell })), state)
    ),
    on(removeSpell,
        (state, { spellId }) => adapter.removeOne(spellId, state)
    ),
    on(removeBatch,
        (state, { spells }) => adapter.removeMany(spells, state)
    ),
);

export function reducer(state: ISpellsState, action: Action): ISpellsState {
    return spellReducerFn(state, action);
}

const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
} = adapter.getSelectors();

export const selectSpells = selectEntities;
export const selectAllSpells = selectAll;
