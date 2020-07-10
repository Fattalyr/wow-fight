export enum NAMES {
    GULDAN = 'Гул\'Дан',
    NERZHUL = 'Нер\'Зул',
}

export enum BEASTS {
    SKELETON = 'скелет',
}

export enum SPELLS {
    FEAR = 'страх',
    FILTH = 'скверна',
    ANCESTRAL_SPIRIT = 'дух предков',
    REBIRTH = 'возрождение',
}

export interface ISpell {
    spellName: SPELLS;
    duration: number;
    target: 'self' | 'enemy';
    canNotAttacks: boolean;
    addHP: boolean;
    reduceHP: boolean;
    callBeast: boolean;
    coolDown: number;
    HPDelta?: number;
    calledBeast?: IBeastsData;
}

export interface ICalculatedParams {
    dps: number;
    hp: number;
    crit: number;
}

export interface IAvailableAttackVectors {
    canHit: boolean;
    spells: ISpell[] | undefined[];
    availableEnemies?: string[];
}

export interface IBeastsData {
    type: BEASTS;
    dps: number;
    hp: number;
}

export interface ICharacterData {
    self: NAMES;
    strength: number;
    agility: number;
    intellect: number;
    stamina: number;
    spells: ISpell[];
    dps?: number;
    hp?: number;
    crit?: number;
}

export type CraftedSpells = {
    [n: string]: number; // SPELLS-значения, number - длительность
} | undefined[];

export interface IPossibleAttack {
    target: string;
    hit?: boolean;
    spell?: ISpell;
    damage?: number;
}

export interface IMultipliers {
    strength: ICalculatedParams;
    agility: ICalculatedParams;
    intellect: ICalculatedParams;
    stamina: ICalculatedParams;
}

export interface ICharacterMutableCopy {
    multipliers: IMultipliers;
    inheritedData: ICharacterData;
    currentData: ICharacterData;
    calculateBasicParams: (characterData: ICharacterData) => ICalculatedParams;
    updateCalculatedDataByCurrentData: () => void;
    self: BEASTS | NAMES;
    id: string;
    party: string;
    slug: string;
    spellbound: CraftedSpells;
    castedSpells: CraftedSpells;
    _isAlive: boolean;
    isAlive: boolean;
    _isDead: boolean;
    isDead: boolean;
}
