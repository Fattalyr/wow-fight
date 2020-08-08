import { IBeast, ICharacter } from './classes/characters';


export enum NAMES {
    GULDAN = 'Гул\'Дан',
    NERZHUL = 'Нер\'Зул',
}

export enum BEASTS {
    SKELETON = 'скелет',
}

export enum STATUSES {
    PLAYER = 'player',
    CPU = 'CPU',
    PLAYERS_BEAST = 'player\'s beast',
    CPUS_BEAST = 'CPU\'s beast',
}

export enum SPELLS {
    FEAR = 'страх',
    FILTH = 'скверна',
    ANCESTRAL_SPIRIT = 'дух предков',
    REBIRTH = 'возрождение',
}

export enum SPELL_TARGET {
    SELF = 'self',
    ENEMY = 'enemy',
}

export interface ISpell {
    spellName: SPELLS;
    duration: number;
    target: SPELL_TARGET;
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
    id?: string;
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

export type Party = (ICharacter | IBeast)[];

export interface IAttackResult {
    assaulter: ICharacter;
    defending: ICharacter;
    assaulterParty: Party;
    defendingParty: Party;
}

export enum MOVING_STATUS {
    WAITING = 'waiting',
    PLAYER = 'player',
    CPU = 'CPU',
    PLAYERS_BEASTS = 'player\'s beasts',
    CPUS_BEASTS = 'cpu\'s beasts',
}
