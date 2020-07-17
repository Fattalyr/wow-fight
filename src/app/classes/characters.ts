import { UUID } from 'angular2-uuid';
import { BEASTS, CraftedSpells, IBeastsData, ICalculatedParams, ICharacterData, ISpell, NAMES } from '../models';
import { BEASTS_DATA, CHARACTERS_START_DATA, MULTIPLIERS } from '../constants/constants';


export interface IEntity {
    self: BEASTS | NAMES;
    id: string;
    party: string;
    inheritedData: IBeastsData | ICharacterData;
    currentData: IBeastsData | ICharacterData;
    slug: string;
    spellbound: CraftedSpells;
    castedSpells: CraftedSpells;
    isAlive: boolean;
}

export interface IBeast extends IEntity {
    inheritedData: IBeastsData;
    currentData: IBeastsData;
}

export interface ICharacter extends IEntity {
    inheritedData: ICharacterData;
    currentData: ICharacterData;
}

export function calculateBasicParams(characterData: ICharacterData): ICalculatedParams {
    const calculatedParams: ICalculatedParams = { dps: 0, hp: 0, crit: 0 };
    const multipliers = MULTIPLIERS;

    for (const param in calculatedParams) {
        for (const property in multipliers) {
            if (param in multipliers[property]) {
                calculatedParams[param] += multipliers[property][param] * characterData[property];
            }
        }
    }

    return calculatedParams;
}

export function createBeast(name: BEASTS, party: string, id?: string): IBeast {
    if (!id) {
        id = UUID.UUID();
    }
    const slug = name === BEASTS.SKELETON ? 'skeleton' : '';
    const beastData = BEASTS_DATA[ name ];
    return {
        self: beastData.type,
        inheritedData: { ...beastData, },
        currentData: { ...beastData, },
        isAlive: true,
        party,
        id,
        slug,
        spellbound: [],
        castedSpells: [],
    };
}

export function createCharacter(name: NAMES, party: string, id?: string): ICharacter {
    if (!id) {
        id = UUID.UUID();
    }
    const characterData = CHARACTERS_START_DATA[ name ];
    const calculatedParams = calculateBasicParams(characterData);
    const slug = name === NAMES.GULDAN
        ? 'guldan'
        : 'nerzhul';
    return {
        self: characterData.self,
        inheritedData: { ...characterData, ...calculatedParams },
        currentData: { ...characterData, ...calculatedParams },
        isAlive: true,
        party,
        id,
        slug,
        spellbound: [],
        castedSpells: [],
    };
}

export enum NORMALIZATION_MAP {
    PLAYER = 'player',
    CPU = 'cpu',
}

export interface INormalizedPlayer {
    /* Player Character */
    playerSelf: NAMES | BEASTS;
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
}

export interface INormalizedCPU {
    /* CPU Character */
    cpuSelf: NAMES | BEASTS;
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
