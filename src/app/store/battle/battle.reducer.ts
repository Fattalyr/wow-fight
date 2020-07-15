import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { deleteBattle, nextMove, playerPassedTurn, turnCompleted } from './battle.actions';
import { IPossibleAttack, CraftedSpells, MOVING_STATUS, ISpell } from '../../models';
import { ATTACK_METHOD } from '../../constants/constants';
import { IBeast } from '../../classes/characters';


export const battleFeatureKey = 'battle';

export interface ITurnActivity {
    craftedSpells?: CraftedSpells;
    calledBeasts?: string[]; // UUID of IBeast
    characterAttacked: IPossibleAttack | undefined;
    beastsAttacked?: IPossibleAttack[];
    critFired: boolean | null;
}

export interface IActivity {
    assaulterId: string; // Id героя или призванной твари.
    targetId: string; // Id цели.
    method: ATTACK_METHOD;
    critFired?: boolean;
    spell?: ISpell;
    damage?: number;
    calledBeasts?: IBeast[];
}

export interface ITurn {
    roundNumber: number;
    playersActivities: ITurnActivity;
    cpusActivities: ITurnActivity;

    playerPartyActivities: IActivity[];
    cpuPartyActivities: IActivity[];
}

export interface ITurnActivitiesState extends EntityState<ITurn> {
    playerPassedTurn: boolean; // Игрок нажал кнопку "Сделать ход" и теперь происходят действия по цепочке.
    movingCurrentStage: MOVING_STATUS;
}

const adapter: EntityAdapter<ITurn> = createEntityAdapter<ITurn>({
    selectId: turn => turn.roundNumber,
});

const initialState: ITurnActivitiesState = adapter.getInitialState({
    playerPassedTurn: false,
    movingCurrentStage: MOVING_STATUS.WAITING,
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
    on(nextMove, (state, { move }) => ({
        ...state,
        movingCurrentStage: move,
    }))
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
