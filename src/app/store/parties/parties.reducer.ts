import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { UUID } from 'angular2-uuid';
import { createCharacter } from '../../classes/characters';
import { NAMES, STATUSES } from '../../models';
import { INormalizedBeast, INormalizedCharacter } from './parties.models';
import { addCharacter, removeCharacter, toggleCharacters, updateCharacter, updateCharacters } from './parties.actions';
import { CharacterNormalize } from './parties.normalize';


const playerPartyId = UUID.UUID();
const cpuPartyId = UUID.UUID();

export const partiesFeatureKey = 'parties';

const randomNumber = Math.random();
const playerCharacterName = randomNumber < 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;
const cpuCharacterName = randomNumber >= 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;
const startPlayerCharacter = CharacterNormalize
    .normalizeCharacter(createCharacter(playerCharacterName, playerPartyId, STATUSES.PLAYER, UUID.UUID()));
const startCPUCharacter = CharacterNormalize
    .normalizeCharacter(createCharacter(cpuCharacterName, cpuPartyId, STATUSES.CPU, UUID.UUID()));

export interface IPartiesState extends EntityState<INormalizedCharacter | INormalizedBeast> {
    playerPartyId: string;
    cpuPartyId: string;
}

const adapter: EntityAdapter<INormalizedCharacter | INormalizedBeast> = createEntityAdapter<INormalizedCharacter | INormalizedBeast>({
    selectId: character => character.id,
});

const startState: IPartiesState = adapter.getInitialState({
    playerPartyId,
    cpuPartyId,
});

const initialState: IPartiesState = {
    ...startState,
    ids: [
        ...startState.ids,
        startPlayerCharacter.id,
        startCPUCharacter.id,
    ] as string[],
    entities: {
        ...startState.entities,
        [startPlayerCharacter.id]: startPlayerCharacter,
        [startCPUCharacter.id]: startCPUCharacter,
    },
};

const partiesReducerFn = createReducer(
    initialState,
    on(addCharacter,
        (state, { character }) => adapter
            .upsertOne(CharacterNormalize.normalize(character), state)
    ),
    on(updateCharacter,
        (state, { character }) => adapter
            .updateOne({ id: character.id, changes: CharacterNormalize.normalize(character) }, state)
    ),
    on(updateCharacters,
        (state, { characters }) => adapter
            .updateMany(characters.map(character => ({ id: character.id, changes: CharacterNormalize.normalize(character) })), state)
    ),
    on(removeCharacter,
        (state, { characterId }) => adapter
            .removeOne( characterId, state )
    ),
    on(toggleCharacters,
        (state: IPartiesState) => {
            let player;
            let cpu;
            const charactersArray = { ...state.entities };

            for (const id in charactersArray) {
                if (charactersArray[id].status === STATUSES.PLAYER) {
                    player = { ...charactersArray[ id ] };
                    break;
                }
            }

            if (!player) {
                throw new Error('Player instance is not found in store.');
            }

            for (const id in charactersArray) {
                if (charactersArray[id].status === STATUSES.CPU) {
                    cpu = { ...charactersArray[ id ] };
                    break;
                }
            }

            if (!cpu) {
                throw new Error('CPU instance is not found in store.');
            }

            return adapter.updateMany([
                {
                    id: player.id,
                    changes: { ...cpu, status: player.status, id: player.id, party: cpu.party }
                },
                {
                    id: cpu.id,
                    changes: { ...player, status: cpu.status, id: cpu.id, party: cpu.party }
                }
            ], state);
        }
    ),
);

export function reducer(state: IPartiesState, action: Action): IPartiesState {
    return partiesReducerFn(state, action);
}

const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
} = adapter.getSelectors();

export const selectAllCharacters = selectAll;
export const selectCharactersEntities = selectEntities;
