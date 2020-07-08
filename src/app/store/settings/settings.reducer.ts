import { createReducer, on, Action } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import * as SettingsActions from './settings.actions';
import { CharacterClass } from '../../classes/character.class';
import { BeastClass } from '../../classes/beast.class';
import { NAMES } from '../../models';
import { CHARACTERS_START_DATA } from '../../constants/constants';


const playerPartyId = UUID.UUID();
const cpuPartyId = UUID.UUID();

export interface ISettingsState {
    playerPartyId: string;
    cpuPartyId: string;
    playerCharacter: CharacterClass;
    playerBeasts: Array<BeastClass | undefined>;
    cpuCharacter: CharacterClass;
    cpuBeasts: Array<BeastClass | undefined>;
}

export const settingsFeatureKey = 'settings';

const randomNumber = Math.random();
const playerCharacterName = randomNumber < 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;
const cpuCharacterName = randomNumber >= 0.5 ? NAMES.NERZHUL : NAMES.GULDAN;

const initialState: ISettingsState = {
    playerPartyId,
    cpuPartyId,
    playerCharacter: new CharacterClass(CHARACTERS_START_DATA[ playerCharacterName ], playerPartyId, randomNumber < 0.5 ? 'nerzhul' : 'guldan'),
    playerBeasts: [],
    cpuCharacter: new CharacterClass(CHARACTERS_START_DATA[ cpuCharacterName ], cpuPartyId, randomNumber >= 0.5 ? 'nerzhul' : 'guldan'),
    cpuBeasts: [],
};

export interface IFoundBeast {
    beastOwner: 'playerBeasts' | 'cpuBeasts';
    beastIndex: number;
}

function findBeastInState(state: ISettingsState, beast: BeastClass): IFoundBeast {
    const playersBeastIndex = state.playerBeasts.findIndex(playerBeast => playerBeast.id === beast.id);
    if (playersBeastIndex > -1) {
        return { beastOwner: 'playerBeasts', beastIndex: playersBeastIndex };
    }

    const cpuBeastIndex = state.cpuBeasts.findIndex(playerBeast => playerBeast.id === beast.id);
    return { beastOwner: 'cpuBeasts', beastIndex: cpuBeastIndex };
}

const settingsReducer = createReducer(
    initialState,
    on(SettingsActions.updatePlayerCharacter, (state: ISettingsState, { playerCharacter }) => ({ ...state, playerCharacter })),
    on(SettingsActions.updateCPUCharacter, (state: ISettingsState, { cpuCharacter }) => ({ ...state, cpuCharacter })),
    on(SettingsActions.addBeast, (state: ISettingsState, { beast }) => {
        const newState = { ...state };
        if (newState.playerPartyId === beast.party) {
            newState.playerBeasts.push(beast);
        } else {
            newState.cpuBeasts.push(beast);
        }
        return newState;
    }),
    on(SettingsActions.updateBeast, (state: ISettingsState, { beast }) => {
        const newState = { ...state };
        const { beastOwner, beastIndex } = findBeastInState(newState, beast);
        if (beastIndex) { return newState; }
        newState[beastOwner][beastIndex] = beast;
        return newState;
    }),
    on(SettingsActions.toggleCharacters, (state: ISettingsState) => {
        const newPlayerCharacter = new CharacterClass(
            CHARACTERS_START_DATA[ state.cpuCharacter.self ],
            playerPartyId,
            state.playerCharacter.slug === 'nerzhul' ? 'guldan' : 'nerzhul'
        );
        const newCPUCharacter = new CharacterClass(
            CHARACTERS_START_DATA[ state.playerCharacter.self ],
            cpuPartyId,
            state.cpuCharacter.slug === 'nerzhul' ? 'guldan' : 'nerzhul'
        );
        return { ...state, playerCharacter: newPlayerCharacter, cpuCharacter: newCPUCharacter };
    })
);

export function reducer(state: ISettingsState, action: Action): ISettingsState {
    return settingsReducer(state, action);
}
