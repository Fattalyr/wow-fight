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

export interface ISpellParams {
    spellName: SPELLS;
    duration: number;
    target: 'self' | 'enemy';
    canNotAttacks: boolean;
    addHP: boolean;
    reduceHP: boolean;
    callBeast: boolean;
    coolDown: number;
    HPDelta?: number;
    calledBeastType?: BEASTS;
    calledBeastParams?: ICalledBeastsParams;
}

export const SPELL_FEAR: ISpellParams = {
    spellName: SPELLS.FEAR,
    duration: 3,
    target: 'enemy',
    canNotAttacks: true,
    addHP: false,
    reduceHP: false,
    callBeast: false,
    coolDown: 60,
};

export const SPELL_FILTH: ISpellParams = {
    spellName: SPELLS.FILTH,
    duration: 1,
    target: 'enemy',
    canNotAttacks: false,
    addHP: false,
    reduceHP: true,
    HPDelta: 200,
    callBeast: false,
    coolDown: 10,
};

export const SPELL_ANCESTRAL_SPIRIT: ISpellParams = {
    spellName: SPELLS.ANCESTRAL_SPIRIT,
    duration: 1,
    target: 'self',
    canNotAttacks: false,
    addHP: true,
    reduceHP: false,
    HPDelta: 500,
    callBeast: false,
    coolDown: 10,
};

export const SPELL_REBIRTH: ISpellParams = {
    spellName: SPELLS.REBIRTH,
    duration: 1,
    target: 'self',
    canNotAttacks: false,
    addHP: false,
    reduceHP: false,
    callBeast: true,
    coolDown: 10,
    calledBeastType: BEASTS.SKELETON,
    calledBeastParams: {
        damage: 100,
        hp: 300,
    }
};

export const CHARACTERS_START_DATA = {
    [NAMES.GULDAN]: {
        strength: 30,
        agility: 20,
        intellect: 150,
        stamina: 120,
        spells: [
            SPELL_FEAR,
            SPELL_FILTH,
        ],
    },
    [NAMES.NERZHUL]: {
        strength: 40,
        agility: 50,
        intellect: 120,
        stamina: 160,
        spells: [
            SPELL_ANCESTRAL_SPIRIT,
            SPELL_REBIRTH,
        ],
    },
};

export const multipliers = {
    strength: {
        dps: 1.5,
        hp: 2,
        crit: 0,
    },
    agility: {
        dps: 1,
        hp: 0,
        crit: 0.002,
    },
    intellect: {
        dps: 1,
        hp: 0,
        crit: 0.0005,
    },
    stamina: {
        dps: 0,
        hp: 10,
        crit: 0,
    },
};

export interface ICalledBeastsParams {
    damage: number;
    hp: number;
}
