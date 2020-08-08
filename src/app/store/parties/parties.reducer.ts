import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { UUID } from 'angular2-uuid';
import { NAMES } from '../../models';
import { IBeast, ICharacter } from '../../classes/characters';
import { addCharacter, removeCharacter, updateCharacter, updateCharacters } from './parties.actions';


const playerPartyId = UUID.UUID();
const cpuPartyId = UUID.UUID();

export const partiesFeatureKey = 'parties';

const randomNumber = Math.random();
const playerCharacterName = randomNumber < 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;
const cpuCharacterName = randomNumber >= 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;

export interface IPartiesState extends EntityState<ICharacter | IBeast> {
    playerPartyId: string;
    cpuPartyId: string;
}

const adapter: EntityAdapter<ICharacter | IBeast> = createEntityAdapter<ICharacter | IBeast>({
    selectId: character => character.id,
});

const initialState: IPartiesState = adapter.getInitialState({
    playerPartyId,
    cpuPartyId,
});

const partiesReducerFn = createReducer(
    initialState,
    on(addCharacter,
        (state, { character }) => adapter.upsertOne(character, state)
    ),
    on(updateCharacter,
        (state, { character }) => adapter.updateOne({ id: character.id, changes: character }, state)
    ),
    on(updateCharacters,
        (state, { characters }) => adapter.updateMany(characters.map(character => ({ id: character.id, changes: character })), state)
    ),
    on(removeCharacter,
        (state, { characterId }) => adapter.removeOne( characterId, state )
    ),
);

export function reducer(state: IPartiesState, action: Action): IPartiesState {
    return partiesReducerFn(state, action);
}
