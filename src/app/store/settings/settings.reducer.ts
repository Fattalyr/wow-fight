import { createReducer, on, Action } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import deepUnfreeze from 'deep-unfreeze';
import * as SettingsActions from './settings.actions';
import { NAMES } from '../../models';
import { CHARACTERS_START_DATA } from '../../constants/constants';
import { createCharacter, IBeast, ICharacter } from '../../classes/characters';


const playerPartyId = UUID.UUID();
const cpuPartyId = UUID.UUID();

export interface ISettingsState {
    playerPartyId: string;
    cpuPartyId: string;
    playerCharacter: string; // stringify of ICharacter
    playerBeasts: Array<IBeast | undefined>;
    cpuCharacter: string;    // stringify of ICharacter
    cpuBeasts: Array<IBeast | undefined>;
}

export const settingsFeatureKey = 'settings';

const randomNumber = Math.random();
const playerCharacterName = randomNumber < 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;
const cpuCharacterName = randomNumber >= 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;

const initialState: ISettingsState = {
    playerPartyId,
    cpuPartyId,
    playerCharacter: JSON.stringify(createCharacter(playerCharacterName, playerPartyId, UUID.UUID())),
    playerBeasts: [],
    cpuCharacter: JSON.stringify(createCharacter(cpuCharacterName, cpuPartyId, UUID.UUID())),
    cpuBeasts: [],
};

export interface IFoundBeast {
    beastOwner: 'playerBeasts' | 'cpuBeasts';
    beastIndex: number;
}

function findBeastInState(state: ISettingsState, beast: IBeast): IFoundBeast {
    const playersBeastIndex = state.playerBeasts.findIndex(playerBeast => playerBeast.id === beast.id);
    if (playersBeastIndex > -1) {
        return { beastOwner: 'playerBeasts', beastIndex: playersBeastIndex };
    }

    const cpuBeastIndex = state.cpuBeasts.findIndex(playerBeast => playerBeast.id === beast.id);
    return { beastOwner: 'cpuBeasts', beastIndex: cpuBeastIndex };
}

const settingsReducer = createReducer(
    initialState,
    on(SettingsActions.updatePlayerCharacter, (state: ISettingsState, { playerCharacter }) => {
        const newState = deepUnfreeze(state);
        console.log('update playerCharacter', playerCharacter);
        return { ...newState, playerCharacter: JSON.stringify(playerCharacter) };
    }),
    on(SettingsActions.updateCPUCharacter, (state: ISettingsState, { cpuCharacter }) => {
        const newState = deepUnfreeze(state);
        console.log('update cpuCharacter', cpuCharacter);
        return { ...newState, cpuCharacter: JSON.stringify(cpuCharacter) };
    }),
    on(SettingsActions.addBeast, (state: ISettingsState, { beast }) => {
        const newState = deepUnfreeze(state);
        if (newState.playerPartyId === beast.party) {
            newState.playerBeasts.push(beast);
        } else {
            newState.cpuBeasts.push(beast);
        }
        console.log('add beast', { ...beast });
        return newState;
    }),
    on(SettingsActions.updateBeast, (state: ISettingsState, { beast }) => {
        const newState = deepUnfreeze(state);
        const { beastOwner, beastIndex } = findBeastInState(newState, beast);
        if (beastIndex) { return newState; }
        newState[beastOwner][beastIndex] = beast;
        return newState;
    }),
    on(SettingsActions.toggleCharacters, (state: ISettingsState) => {
        const newState = deepUnfreeze(state);
        const playerCharacter = JSON.parse(newState.playerCharacter);
        const cpuCharacter = JSON.parse(newState.cpuCharacter);
        const newPlayerCharacter = createCharacter(CHARACTERS_START_DATA[ cpuCharacter.self ].self, playerPartyId, UUID.UUID());
        const newCPUCharacter = createCharacter(CHARACTERS_START_DATA[ playerCharacter.self ].self, cpuPartyId, UUID.UUID());
        return { ...newState, playerCharacter: JSON.stringify(newPlayerCharacter), cpuCharacter: JSON.stringify(newCPUCharacter) };
    }),
    on(SettingsActions.packageOfUpdates, (state: ISettingsState, { data}) => {
        const {
            playerCharacter,
            cpuCharacter,
            addedBeasts,
            updatedBeasts,
            removedBeasts
        } = JSON.parse(data);
        const newState = { ...deepUnfreeze(state), playerCharacter, cpuCharacter };

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
    }),
);

export function reducer(state: ISettingsState, action: Action): ISettingsState {
    return settingsReducer(state, action);
}
