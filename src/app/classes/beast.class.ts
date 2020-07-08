import { UUID } from 'angular2-uuid';
import { EntityClass } from './entity.class';
import { IBeastsData } from '../models';


export class BeastClass extends EntityClass {
    public inheritedData: IBeastsData;
    public currentData: IBeastsData;

    constructor(beastParams: IBeastsData, party: string) {
        super();
        this.self = beastParams.type;
        this.inheritedData = { ...beastParams };
        this.currentData = { ...beastParams };
        this.party = party;
        this.id = UUID.UUID();
        this.isAlive = true;
        this.spellbound = [];
        this.castedSpells = [];
    }
}
