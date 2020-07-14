import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { deleteBattle, turnCompleted } from './battle.actions';
import { IPossibleAttack, CraftedSpells } from '../../models';


export const battleFeatureKey = 'battle';

export interface ITurnActivity {
    craftedSpells?: CraftedSpells;
    calledBeasts?: string[]; // UUID of IBeast
    characterAttacked: IPossibleAttack | undefined;
    beastsAttacked?: IPossibleAttack[];
    critFired: boolean | null;
}

export interface ITurn {
    roundNumber: number;
    playersActivities: ITurnActivity;
    cpusActivities: ITurnActivity;
}

export interface ITurnActivitiesState extends EntityState<ITurn> {
}

const adapter: EntityAdapter<ITurn> = createEntityAdapter<ITurn>({
    selectId: turn => turn.roundNumber,
});

const initialState: ITurnActivitiesState = adapter.getInitialState({});

const turnActivitiesReducerFn = createReducer(
    initialState,
    on(turnCompleted,
        (state, { turn }) => adapter.addOne(turn, state)
    ),
    on(deleteBattle,
        (state) => adapter.removeAll(state)
    ),
);

export function reducer(state: ITurnActivitiesState, action: Action): ITurnActivitiesState {
    return turnActivitiesReducerFn(state, action);
}

const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
} = adapter.getSelectors();

export const selectAllTurns = selectAll;
export const selectAllTurnsNumber = selectTotal;
