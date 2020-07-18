import { createAction, props } from '@ngrx/store';
import { IBeast, ICharacter } from '../../classes/characters';
import { IPartyUpdates } from './parties.models';

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

export const playerMoveStarted = createAction(
    `[ PLAYER MOVE ] Started`
);

export const playerMoveCompleted = createAction(
    `[ PLAYER MOVE ] Completed`,
    props<IPartyUpdates>()
);

export const playerBeastsMoveStarted = createAction(
    `[ PLAYER\'S BEASTS MOVE ] Started`
);

export const playerBeastsMoveCompleted = createAction(
    `[ PLAYER\'S BEASTS MOVE ] Completed`,
    props<IPartyUpdates>()
);

export const CPUMoveStarted = createAction(
    `[ CPU MOVE ] Started`
);

export const CPUMoveCompleted = createAction(
    `[ CPU MOVE ] Completed`,
    props<IPartyUpdates>()
);

export const CPUsBeastsMoveStarted = createAction(
    `[ CPU\'s BEASTS MOVE ] Started`
);

export const CPUsBeastsMoveCompleted = createAction(
    `[ CPU\'s BEASTS MOVE ] Completed`,
    props<IPartyUpdates>()
);

export const moveCompleted = createAction(
    `[ MOVE ] Move Completed`
);
