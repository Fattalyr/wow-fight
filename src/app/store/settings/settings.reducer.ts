import { createReducer, on, Action } from '@ngrx/store';
import { NAMES } from '../../constants/constants';
import * as SettingsActions from './settings.actions';

export interface ISettingsState {
    roundDuration: number;
    userCharacter: NAMES;
}

export const settingsFeatureKey = 'settings';

const initialState: ISettingsState = {
    roundDuration: 5,
    userCharacter: Math.random() < 0.5 ? NAMES.NERZHUL : NAMES.GULDAN,
};

const settingsReducer = createReducer(
    initialState,
    on(SettingsActions.updateRoundDuration, (state: ISettingsState, { roundDuration }) => ({ ...state, roundDuration })),
    on(SettingsActions.updateUserCharacter, (state: ISettingsState, { userCharacter }) => ({ ...state, userCharacter })),
);

export function reducer(state: ISettingsState, action: Action): ISettingsState {
    return settingsReducer(state, action);
}
