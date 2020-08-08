import { BEASTS, ISpell, NAMES, STATUSES } from '../../models';


export interface INormalizedCharacter {
    self: NAMES;
    id: string;
    status: STATUSES;
    party: string;
    slug: string;
    isAlive: boolean;

    inheritedSelf: NAMES;
    inheritedStrength: number;
    inheritedAgility: number;
    inheritedIntellect: number;
    inheritedStamina: number;
    inheritedSpells: ISpell[];
    inheritedDps?: number;
    inheritedHp?: number;
    inheritedCrit?: number;

    currentSelf: NAMES;
    currentStrength: number;
    currentAgility: number;
    currentIntellect: number;
    currentStamina: number;
    currentSpells: ISpell[];
    currentDps?: number;
    currentHp?: number;
    currentCrit?: number;
}

export interface INormalizedBeast {
    self: BEASTS;
    id: string;
    status: STATUSES;
    party: string;
    slug: string;
    isAlive: boolean;

    inheritedType: BEASTS;
    inheritedDps: number;
    inheritedHp: number;

    currentType: BEASTS;
    currentDps: number;
    currentHp: number;
}
