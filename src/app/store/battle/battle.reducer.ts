import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { deleteBattle, turnCompleted } from './battle.actions';
import { SPELLS, IBeastsData } from '../../models';


export const battleFeatureKey = 'battle';

export interface IBeastsAttack {
    beast: string;  // UUID of BeastClass
    target: string; // UUID of CharacterClass or BeastClass
}

export interface IBeastsDamages {
    beast: string;  // UUID of BeastClass
    damage: number | undefined; // Количество урона
}

export interface ITurnActivity {
    target: string | null; // UUID of CharacterClass or BeastClass
    meleeDamage?: boolean;
    craftedSpells?: SPELLS[];
    spellContinues?: number[];
    calledBeasts?: string[]; // UUID of BeastClass
    calledBeastsParams?: IBeastsData[];
    beastsDamages?: IBeastsDamages[];
    beastsTargets: IBeastsAttack[];
    critFired: boolean | null;
}

export interface ITurn {
    userTurnAvailable: boolean;
    roundNumber: number;
    playersActivities: ITurnActivity;
    cpusActivities: ITurnActivity;
    playerCharacter: string; // UUID of CharacterClass
    cpuCharacter: string;    // UUID of BeastClass
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
