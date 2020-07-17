import { createAction, props } from '@ngrx/store';
import { IBeast, ICharacter } from '../../classes/characters';
import { IPartyUpdates } from './parties.models';
import { ITurn } from '../battle/battle.reducer';

export const updatePlayerCharacter = createAction(
    `[ PARTIES ] Update Player Character`,
    props<{ playerCharacter: ICharacter }>()
);

export const updateCPUCharacter = createAction(
    `[ PARTIES ] Update CPU Character`,
    props<{ cpuCharacter: ICharacter }>()
);

export const addBeast = createAction(
    `[ PARTIES ] Add New Beast`,
    props<{ beast: IBeast }>()
);

export const updateBeast = createAction(
    `[ PARTIES ] Update Beast`,
    props<{ beast: IBeast }>()
);

export const toggleCharacters = createAction(
    `[ PARTIES ] Toggle Characters`
);

export const playerJustHasStartedMove = createAction(
    `[ MOVE ] Player Just Has Started Move`,
);

export const moveCompleted = createAction(
    `[ MOVE ] Move Completed`,
    props<{ turn: ITurn }>()
);

export const packageOfUpdates = createAction(
    `[ PARTIES ] Package Of Updates`,
    props<IPartyUpdates>()
);

export const playerMove = createAction(
    `[ PLAYER MOVE ] Executing`
);

export const playerBeastsMove = createAction(
    `[ PLAYER\'S BEASTS MOVE ] Executing`
);

export const CPUMove = createAction(
    `[ CPU MOVE ] Executing`
);

export const CPUsBeastsMove = createAction(
    `[ CPU\'s BEASTS MOVE ] Executing`
);
