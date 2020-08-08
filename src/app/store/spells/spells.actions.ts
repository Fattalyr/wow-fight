import { createAction, props } from '@ngrx/store';
import { ICastedSpell } from './spells.reducer';

export const addSpell = createAction(
    `[ SPELLS ] Add One`,
    props<{ spell: ICastedSpell }>()
);

export const updateSpell = createAction(
    `[ SPELLS ] Update One`,
    props<{ spell: ICastedSpell }>()
);

export const updateSpells = createAction(
    `[ SPELLS ] Update Many`,
    props<{ spells: ICastedSpell[] }>()
);

export const removeSpell = createAction(
    `[ SPELLS ] Remove One`,
    props<{ spellId: string }>()
);

export const removeBatch = createAction(
    `[ SPELLS ] Remove Batch`,
    props<{ spells: string[] }>()
);
