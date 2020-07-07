import { EntityClass } from './entity.class';
import { ICalculatedParams, ICharacterData, MULTIPLIERS } from '../constants/constants';
import { UUID } from 'angular2-uuid';


export class CharacterClass extends EntityClass {
    private multipliers = MULTIPLIERS;
    public inheritedData: ICharacterData;
    public currentData: ICharacterData;
    public calculatedData: ICalculatedParams;

    constructor(characterData: ICharacterData, party: string) {
        super();
        this.self = characterData.self;
        this.inheritedData = { ...characterData };
        this.currentData = { ...characterData };
        this.calculatedData = this.calculateBasicParams(this.currentData);
        this.isAlive = true;
        this.party = party;
        this.id = UUID.UUID();
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
        this.calculatedData = this.calculateBasicParams(this.currentData);
    }
}
