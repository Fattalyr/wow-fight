import { BEASTS, IBeastsData, ICharacterData, NAMES } from '../constants/constants';


export class EntityClass {
    public self: BEASTS | NAMES;
    public id: string;
    public party: string;
    public inheritedData: IBeastsData | ICharacterData;
    public currentData: IBeastsData | ICharacterData;

    // tslint:disable-next-line:variable-name
    private _isAlive: boolean;
    public get isAlive(): boolean {
        return this._isAlive;
    }
    public set isAlive(value: boolean) {
        if (value !== this._isAlive) {
            this._isAlive = value;
        }
        if (value === this.isDead || this.isDead === undefined) {
            this._isDead = !value;
        }
    }

    // tslint:disable-next-line:variable-name
    private _isDead: boolean;
    public get isDead(): boolean {
        return this._isDead;
    }
    public set isDead(value: boolean) {
        if (value !== this._isDead) {
            this._isDead = value;
        }
        if (value === this.isAlive || this.isAlive === undefined) {
            this._isAlive = !value;
        }
    }
}
