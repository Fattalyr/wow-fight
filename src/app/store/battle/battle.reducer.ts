import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { BEASTS, SPELLS, ICalledBeastsParams, NAMES } from '../../constants/constants';
import { deleteBattle, turnCompleted } from './battle.actions';


export const battleFeatureKey = 'battle';

export interface ITurnActivity {
    target: NAMES | BEASTS | null;
    meleeDamage?: boolean;
    craftedSpells?: SPELLS[];
    spellContinues?: number[];
    calledBeasts?: BEASTS[];
    calledBeastsParams?: ICalledBeastsParams[];
    beastsDamages?: boolean;
    critFired: boolean;
}

export interface ITurn {
    userTurnAvailable: boolean;
    roundNumber: number;
    playersActivities: ITurnActivity;
    cpusActivities: ITurnActivity;
    playerCharacter: NAMES;
    cpuCharacter: NAMES;
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
