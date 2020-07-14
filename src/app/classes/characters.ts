import { UUID } from 'angular2-uuid';
import { BEASTS, CraftedSpells, IBeastsData, ICalculatedParams, ICharacterData, NAMES } from '../models';
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
