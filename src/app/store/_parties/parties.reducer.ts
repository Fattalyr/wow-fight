import { Action, createReducer, on } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import deepUnfreeze from 'deep-unfreeze';
import * as PartiesActions from './parties.actions';
import { NAMES } from '../../models';
import { CHARACTERS_START_DATA } from '../../constants/constants';
import { createCharacter, IBeast, NORMALIZATION_MAP } from '../../classes/characters';
import { IPartyState } from './parties.models';
import { CharacterNormalizeService } from './character-normalize.service';


const playerPartyId = UUID.UUID();
const cpuPartyId = UUID.UUID();

export const settingsFeatureKey = 'parties';

const randomNumber = Math.random();
const playerCharacterName = randomNumber < 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;
const cpuCharacterName = randomNumber >= 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;

const initialState: IPartyState = {
    ...CharacterNormalizeService.normalizePlayer(createCharacter(playerCharacterName, playerPartyId, UUID.UUID())),
    ...CharacterNormalizeService.normalizeCPU(createCharacter(cpuCharacterName, cpuPartyId, UUID.UUID())),
    playerPartyId,
    cpuPartyId,
    playerBeasts: [],
    cpuBeasts: [],
    playerPassedTurn: false,
};

export interface IFoundBeast {
    beastOwner: 'playerBeasts' | 'cpuBeasts';
    beastIndex: number;
}

function findBeastInState(state: IPartyState, beast: IBeast): IFoundBeast {
    const playersBeastIndex = state.playerBeasts.findIndex(playerBeast => playerBeast.id === beast.id);
    if (playersBeastIndex > -1) {
        return { beastOwner: 'playerBeasts', beastIndex: playersBeastIndex };
    }

    const cpuBeastIndex = state.cpuBeasts.findIndex(playerBeast => playerBeast.id === beast.id);
    return { beastOwner: 'cpuBeasts', beastIndex: cpuBeastIndex };
}

const saveChangesOfAllCharactersAndBeasts = (state: IPartyState, updates) => {
    const {
        addedBeasts,
        updatedBeasts,
        removedBeasts
    } = updates;

    console.log('updates', updates);

    const unfrozenUpdates = { ...updates }; // deepUnfreeze(updates);

    const playerCharacter = CharacterNormalizeService.deNormalize(updates, NORMALIZATION_MAP.PLAYER);
    const cpuCharacter = CharacterNormalizeService.deNormalize(updates, NORMALIZATION_MAP.CPU);

    delete unfrozenUpdates.addedBeasts;
    delete unfrozenUpdates.updatedBeasts;
    delete unfrozenUpdates.removedBeasts;

    const characters = { ...unfrozenUpdates };

    const newState = { ...deepUnfreeze(state), ...characters };

    if (addedBeasts.length) {
        for (const addingBeast of addedBeasts) {
            const theBeastIsFromPlayersParty = addingBeast.party === playerCharacter.party;
            let partyOfBeast = theBeastIsFromPlayersParty
                ? newState.playerBeasts
                : newState.cpuBeasts;
            if (partyOfBeast.findIndex(beast => beast.id === addingBeast.id) > -1) {
                continue;
            }
            partyOfBeast = [ ...partyOfBeast, addingBeast ];
            if (theBeastIsFromPlayersParty) {
                newState.playerBeasts = partyOfBeast;
            } else {
                newState.cpuBeasts = partyOfBeast;
            }
        }
    }

    if (updatedBeasts.length) {
        for (const updatingBeast of updatedBeasts) {
            const theBeastIsFromPlayersParty = updatingBeast.party === playerCharacter.party;
            const partyOfBeast = theBeastIsFromPlayersParty
                ? newState.playerBeasts
                : newState.cpuBeasts;
            const index = partyOfBeast.findIndex(beast => beast.id === updatingBeast.id);
            if (index < 0) {
                throw new Error('Обновляемое существо не найдено в стеке.');
            }
            partyOfBeast[index] = updatingBeast;
            if (theBeastIsFromPlayersParty) {
                newState.playerBeasts = partyOfBeast;
            } else {
                newState.cpuBeasts = partyOfBeast;
            }
        }
    }

    if (removedBeasts.length) {
        for (const removingBeast of removedBeasts) {
            const theBeastIsFromPlayersParty = removingBeast.party === playerCharacter.party;
            const partyOfBeast = theBeastIsFromPlayersParty
                ? newState.playerBeasts
                : newState.cpuBeasts;
            const index = partyOfBeast.findIndex(beast => beast.id === removingBeast.id);
            if (index < 0) {
                throw new Error('Удаляемое существо не найдено в стеке.');
            }
            partyOfBeast.splice(index, 1);
            if (theBeastIsFromPlayersParty) {
                newState.playerBeasts = partyOfBeast;
            } else {
                newState.cpuBeasts = partyOfBeast;
            }
        }
    }

    return newState;
};

const partiesReducer = createReducer(
    initialState,
    on(PartiesActions.updatePlayerCharacter, (state: IPartyState, { playerCharacter }) => {
        const newState = deepUnfreeze(state);
        return { ...newState, ...CharacterNormalizeService.normalizePlayer(playerCharacter) };
    }),
    on(PartiesActions.updateCPUCharacter, (state: IPartyState, { cpuCharacter }) => {
        const newState = deepUnfreeze(state);
        return { ...newState, ...CharacterNormalizeService.normalizeCPU(cpuCharacter) };
    }),
    on(PartiesActions.addBeast, (state: IPartyState, { beast }) => {
        const newState = deepUnfreeze(state);
        if (newState.playerPartyId === beast.party) {
            newState.playerBeasts.push(beast);
        } else {
            newState.cpuBeasts.push(beast);
        }
        console.log('add beast', { ...beast });
        return newState;
    }),
    on(PartiesActions.updateBeast, (state: IPartyState, { beast }) => {
        const newState = deepUnfreeze(state);
        const { beastOwner, beastIndex } = findBeastInState(newState, beast);
        if (beastIndex) { return newState; }
        newState[beastOwner][beastIndex] = beast;
        return newState;
    }),
    on(PartiesActions.toggleCharacters, (state: IPartyState) => {
        const newState = deepUnfreeze(state);
        const playerCharacter = CharacterNormalizeService.deNormalize(state, NORMALIZATION_MAP.PLAYER);
        const cpuCharacter = CharacterNormalizeService.deNormalize(state, NORMALIZATION_MAP.CPU);
        const newPlayerCharacter = createCharacter(CHARACTERS_START_DATA[ cpuCharacter.self ].self, playerPartyId, UUID.UUID());
        const newCPUCharacter = createCharacter(CHARACTERS_START_DATA[ playerCharacter.self ].self, cpuPartyId, UUID.UUID());
        return {
            ...newState,
            ...CharacterNormalizeService.normalizePlayer(newPlayerCharacter),
            ...CharacterNormalizeService.normalizeCPU(newCPUCharacter),
        };
    }),
    on(PartiesActions.playerMoveCompleted, saveChangesOfAllCharactersAndBeasts),
    on(PartiesActions.playerBeastsMoveCompleted, saveChangesOfAllCharactersAndBeasts),
    on(PartiesActions.CPUMoveCompleted, saveChangesOfAllCharactersAndBeasts),
    on(PartiesActions.CPUsBeastsMoveCompleted, saveChangesOfAllCharactersAndBeasts),
    on(PartiesActions.playerJustHasStartedMove, (state) => ({
        ...state,
        playerPassedTurn: true,
    })),
    on(PartiesActions.moveCompleted, (state) => ({
        ...state,
        playerPassedTurn: false,
    })),
);

export function reducer(state: IPartyState, action: Action): IPartyState {
    return partiesReducer(state, action);
}
