import { IBeast, ICharacter } from './classes/characters';


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

export interface IBeastMutableCopy {
    inheritedData: IBeastsData;
    currentData: IBeastsData;
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

export interface IAttacks {
    cpuAttackVector: IPossibleAttack;
    playerAttackVector: IPossibleAttack;
}

export type Party = (ICharacter | IBeast)[];

export interface ITUpdatedParties {
    updatedPlayerCharacter: ICharacter;
    updatedCpuCharacter: ICharacter;
    updatedPlayerParty: Party;
    updatedCpuParty: Party;
}

export enum Vector {
    PLAYER_VS_CPU = 'player -> cpu',
    CPU_VS_PLAYER = 'cpu -> player',
    CPUS_BEAST_VS_PLAYERS_PARTY = 'cpu\'s beast -> player\'s party',
    PLAYERS_BEAST_VS_CPUS_PARTY = 'player\'s beast -> cpu\'s party',
}

export interface ISpellAttackResult {
    assaulter: ICharacter;
    defending: ICharacter;
    assaulterParty: Party;
    defendingParty: Party;
}

export enum MOVING_QUERY {
    WAITING= 'waiting',
    PLAYER = 'player',
    CPU = 'CPU',
    PLAYERS_BEASTS = 'player\'s bests',
    CPUS_BEASTS = 'cpu\'s bests',
}
