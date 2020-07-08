import { UUID } from 'angular2-uuid';
import { EntityClass } from './entity.class';
import { ICalculatedParams, ICharacterData } from '../models';
import { MULTIPLIERS } from '../constants/constants';


export class CharacterClass extends EntityClass {
    private multipliers = MULTIPLIERS;
    public inheritedData: ICharacterData;
    public currentData: ICharacterData;

    constructor(characterData: ICharacterData, party: string, slug: string) {
        super();
        const calculatedParams = this.calculateBasicParams(characterData);
        this.self = characterData.self;
        this.inheritedData = { ...characterData, ...calculatedParams };
        this.currentData = { ...characterData, ...calculatedParams };
        this.isAlive = true;
        this.party = party;
        this.id = UUID.UUID();
        this.slug = slug;
        this.spellbound = [];
        this.castedSpells = [];
    }

    public calculateBasicParams(characterData: ICharacterData): ICalculatedParams {
        const character: ICalculatedParams = { dps: 0, hp: 0, crit: 0 };

        for (const param in character) {
            for (const property in this.multipliers) {
                if (param in this.multipliers[property]) {
                    character[param] += this.multipliers[property][param] * characterData[property];
                }
            }
        }

        return character;
    }

    public updateCalculatedDataByCurrentData(): void {
        this.currentData = { ...this.currentData, ...this.calculateBasicParams(this.currentData) };
    }
}
