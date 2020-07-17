import { createAction, props } from '@ngrx/store';
import { IBeast, ICharacter } from '../../classes/characters';

export const updatePlayerCharacter = createAction(
    `[ SETTINGS ] Update Player Character`,
    props<{ playerCharacter: string }>()
);

export const updateCPUCharacter = createAction(
    `[ SETTINGS ] Update CPU Character`,
    props<{ cpuCharacter: string }>()
);

export const addBeast = createAction(
    `[ SETTINGS ] Add New Beast`,
    props<{ beast: IBeast }>()
);

export const updateBeast = createAction(
    `[ SETTINGS ] Update Beast`,
    props<{ beast: IBeast }>()
);

export const toggleCharacters = createAction(
    `[ SETTINGS ] Toggle Characters`
);

/**
 * @description {
 *       playerCharacter: ICharacter,
 *       cpuCharacter: ICharacter,
 *       addedBeasts: IBeast[],
 *       updatedBeasts: IBeast[],
 *       removedBeasts: IBeast[]
 *   }
 */
export const packageOfUpdates = createAction(
    `[ SETTINGS ] Package Of Updates`,
    props<{ data: string }>()
);
