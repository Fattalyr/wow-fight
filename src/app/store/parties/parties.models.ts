import { IBeast } from '../../classes/characters';
import { BEASTS, CraftedSpells, ISpell, NAMES } from '../../models';

export interface IPartyState {
    playerPartyId: string;
    cpuPartyId: string;
    playerBeasts: Array<IBeast | undefined>;
    cpuBeasts: Array<IBeast | undefined>;
    playerPassedTurn: boolean;

    /* Player Character */
    playerSelf: BEASTS | NAMES;
    playerId: string;
    playerParty: string;
    playerSlug: string;
    playerSpellbound: CraftedSpells;
    playerCastedSpells: CraftedSpells;
    playerIsAlive: boolean;
    /* Player Character: { inheritedData: ... } */
    playerInheritedSelf: NAMES;
    playerInheritedStrength: number;
    playerInheritedAgility: number;
    playerInheritedIntellect: number;
    playerInheritedStamina: number;
    playerInheritedSpells: ISpell[];
    playerInheritedDps?: number;
    playerInheritedHp?: number;
    playerInheritedCrit?: number;
    /* Player Character: { currentData: ... } */
    playerCurrentSelf: NAMES;
    playerCurrentStrength: number;
    playerCurrentAgility: number;
    playerCurrentIntellect: number;
    playerCurrentStamina: number;
    playerCurrentSpells: ISpell[];
    playerCurrentDps?: number;
    playerCurrentHp?: number;
    playerCurrentCrit?: number;

    /* CPU Character */
    cpuSelf: BEASTS | NAMES;
    cpuId: string;
    cpuParty: string;
    cpuSlug: string;
    cpuSpellbound: CraftedSpells;
    cpuCastedSpells: CraftedSpells;
    cpuIsAlive: boolean;
    /* CPU Character: { inheritedData: ... } */
    cpuInheritedSelf: NAMES;
    cpuInheritedStrength: number;
    cpuInheritedAgility: number;
    cpuInheritedIntellect: number;
    cpuInheritedStamina: number;
    cpuInheritedSpells: ISpell[];
    cpuInheritedDps?: number;
    cpuInheritedHp?: number;
    cpuInheritedCrit?: number;
    /* CPU Character: { currentData: ... } */
    cpuCurrentSelf: NAMES;
    cpuCurrentStrength: number;
    cpuCurrentAgility: number;
    cpuCurrentIntellect: number;
    cpuCurrentStamina: number;
    cpuCurrentSpells: ISpell[];
    cpuCurrentDps?: number;
    cpuCurrentHp?: number;
    cpuCurrentCrit?: number;
}

export interface IPartyUpdates {
    playerPartyId: string;
    cpuPartyId: string;
    playerBeasts: Array<IBeast | undefined>;
    cpuBeasts: Array<IBeast | undefined>;

    /* Player Character */
    playerSelf: BEASTS | NAMES;
    playerId: string;
    playerParty: string;
    playerSlug: string;
    playerSpellbound: CraftedSpells;
    playerCastedSpells: CraftedSpells;
    playerIsAlive: boolean;
    /* Player Character: { inheritedData: ... } */
    playerInheritedSelf: NAMES;
    playerInheritedStrength: number;
    playerInheritedAgility: number;
    playerInheritedIntellect: number;
    playerInheritedStamina: number;
    playerInheritedSpells: ISpell[];
    playerInheritedDps?: number;
    playerInheritedHp?: number;
    playerInheritedCrit?: number;
    /* Player Character: { currentData: ... } */
    playerCurrentSelf: NAMES;
    playerCurrentStrength: number;
    playerCurrentAgility: number;
    playerCurrentIntellect: number;
    playerCurrentStamina: number;
    playerCurrentSpells: ISpell[];
    playerCurrentDps?: number;
    playerCurrentHp?: number;
    playerCurrentCrit?: number;

    /* CPU Character */
    cpuSelf: BEASTS | NAMES;
    cpuId: string;
    cpuParty: string;
    cpuSlug: string;
    cpuSpellbound: CraftedSpells;
    cpuCastedSpells: CraftedSpells;
    cpuIsAlive: boolean;
    /* CPU Character: { inheritedData: ... } */
    cpuInheritedSelf: NAMES;
    cpuInheritedStrength: number;
    cpuInheritedAgility: number;
    cpuInheritedIntellect: number;
    cpuInheritedStamina: number;
    cpuInheritedSpells: ISpell[];
    cpuInheritedDps?: number;
    cpuInheritedHp?: number;
    cpuInheritedCrit?: number;
    /* CPU Character: { currentData: ... } */
    cpuCurrentSelf: NAMES;
    cpuCurrentStrength: number;
    cpuCurrentAgility: number;
    cpuCurrentIntellect: number;
    cpuCurrentStamina: number;
    cpuCurrentSpells: ISpell[];
    cpuCurrentDps?: number;
    cpuCurrentHp?: number;
    cpuCurrentCrit?: number;

    addedBeasts: IBeast[];
    updatedBeasts: IBeast[];
    removedBeasts: IBeast[];
}
