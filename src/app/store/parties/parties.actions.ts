import { createAction, props } from '@ngrx/store';
import { IBeast, ICharacter } from '../../classes/characters';

export const addCharacter = createAction(
    `[ PARTIES ] Add One`,
    props< { character: ICharacter | IBeast }>()
);

export const updateCharacter = createAction(
    `[ PARTIES ] Update One`,
    props< { character: ICharacter | IBeast }>()
);

export const updateCharacters = createAction(
    `[ PARTIES ] Update Many`,
    props< { characters: Array<ICharacter | IBeast> }>()
);

export const removeCharacter = createAction(
    `[ PARTIES ] Remove One`,
    props< { characterId: string }>()
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
    `[ PLAYER MOVE ] Completed`
);

export const playerBeastsMoveStarted = createAction(
    `[ PLAYER\'S BEASTS MOVE ] Started`
);

export const playerBeastsMoveCompleted = createAction(
    `[ PLAYER\'S BEASTS MOVE ] Completed`
);

export const CPUMoveStarted = createAction(
    `[ CPU MOVE ] Started`
);

export const CPUMoveCompleted = createAction(
    `[ CPU MOVE ] Completed`
);

export const CPUsBeastsMoveStarted = createAction(
    `[ CPU\'s BEASTS MOVE ] Started`
);

export const CPUsBeastsMoveCompleted = createAction(
    `[ CPU\'s BEASTS MOVE ] Completed`
);

export const moveCompleted = createAction(
    `[ MOVE ] Move Completed`
);
