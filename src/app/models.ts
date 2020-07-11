import {CharacterClass} from "./classes/character.class";
import {BeastClass} from "./classes/beast.class";

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

export interface IAttacks {
    cpuAttackVector: IPossibleAttack;
    playerAttackVector: IPossibleAttack;
}

export type Party = (CharacterClass | BeastClass | ICharacterMutableCopy)[];

export interface ITUpdatedParties {
    updatedPlayerCharacter: ICharacterMutableCopy;
    updatedCpuCharacter: ICharacterMutableCopy;
    updatedPlayerParty: Party;
    updatedCpuParty: Party;
}

export enum Vector {
    PLAYER_VS_CPU = 'player -> cpu',
    CPU_VS_PLAYER = 'cpu -> player',
    CPUS_BEAST_VS_PLAYER = 'cpu\'s beast -> player',
    PLAYERS_BEAST_VS_CPU = 'player\'s beast -> cpu',
    CPUS_BEAST_VS_PLAYERS_BEAST = 'cpu\'s beast -> player\'s beast',
    PLAYERS_BEAST_VS_CPUS_BEAST = 'player\'s beast -> cpu\'s beast',
}
