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
    playerCharacter: ICharacter;
    playerBeasts: Array<IBeast | undefined>;
    cpuCharacter: ICharacter;
    cpuBeasts: Array<IBeast | undefined>;
}

export const settingsFeatureKey = 'settings';

const randomNumber = Math.random();
const playerCharacterName = randomNumber < 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;
const cpuCharacterName = randomNumber >= 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;

const initialState: ISettingsState = {
    playerPartyId,
    cpuPartyId,
    playerCharacter: createCharacter(playerCharacterName, playerPartyId, UUID.UUID()),
    playerBeasts: [],
    cpuCharacter: createCharacter(cpuCharacterName, cpuPartyId, UUID.UUID()),
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
        console.log('update playerCharacter', { ...playerCharacter });
        return { ...state, playerCharacter };
    }),
    on(SettingsActions.updateCPUCharacter, (state: ISettingsState, { cpuCharacter }) => {
        console.log('update cpuCharacter', { ...cpuCharacter });
        return { ...state, cpuCharacter };
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
        const newPlayerCharacter = createCharacter(CHARACTERS_START_DATA[ newState.cpuCharacter.self ].self, playerPartyId, UUID.UUID());
        const newCPUCharacter = createCharacter(CHARACTERS_START_DATA[ newState.playerCharacter.self ].self, cpuPartyId, UUID.UUID());
        return { ...newState, playerCharacter: newPlayerCharacter, cpuCharacter: newCPUCharacter };
    })
);

export function reducer(state: ISettingsState, action: Action): ISettingsState {
    return settingsReducer(state, action);
}
