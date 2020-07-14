import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { deleteBattle, playerPassedTurn, turnCompleted } from './battle.actions';
import { IPossibleAttack, CraftedSpells, MOVING_QUERY } from '../../models';


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
    playerPassedTurn: boolean; // Игрок нажал кнопку "Сделать ход" и теперь происходят действия по цепочке.
    movingQuery: MOVING_QUERY[];
    movingCurrentStage: MOVING_QUERY;
}

const adapter: EntityAdapter<ITurn> = createEntityAdapter<ITurn>({
    selectId: turn => turn.roundNumber,
});

const initialState: ITurnActivitiesState = adapter.getInitialState({
    playerPassedTurn: false,
    movingQuery: [
        MOVING_QUERY.WAITING,
        MOVING_QUERY.PLAYER,
        MOVING_QUERY.PLAYERS_BEASTS,
        MOVING_QUERY.CPU,
        MOVING_QUERY.CPUS_BEASTS,
    ],
    movingCurrentStage: MOVING_QUERY.PLAYER,
});

const turnActivitiesReducerFn = createReducer(
    initialState,
    on(turnCompleted,
        (state, { turn }) => adapter.addOne(turn, state)
    ),
    on(deleteBattle,
        (state) => adapter.removeAll(state)
    ),
    on(playerPassedTurn, (state) => ({
        ...state,
        playerPassedTurn: true,
    })),
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
