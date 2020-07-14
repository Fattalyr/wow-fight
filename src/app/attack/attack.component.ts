import { Component, OnInit, Input, ChangeDetectionStrategy, forwardRef, ChangeDetectorRef, } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IAvailableAttackVectors, IPossibleAttack } from '../models';
import { AttackService } from '../services/attack.service';
import { IBeast, ICharacter } from '../classes/characters';


@Component({
    selector: 'app-attack',
    templateUrl: './attack.component.html',
    styleUrls: ['./attack.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AttackComponent),
        multi: true
    }],
})
export class AttackComponent implements OnInit {
    @Input('attackVectors')
    set attackVectors(value: IAvailableAttackVectors) {
        this._attackVectors = value;
        this.listOfPossibleAttacks = this.attackService.calculatePossibleAttacks(value);
    }
    get attackVectors(): IAvailableAttackVectors {
        return this._attackVectors;
    }

    constructor(
        private cd: ChangeDetectorRef,
        private attackService: AttackService,
    ) { }
    // tslint:disable-next-line:variable-name
    private _attackVectors: IAvailableAttackVectors;

    @Input()
    private allEntities: (ICharacter | IBeast)[];

    @Input()
    public playerCharacter: ICharacter;

    public listOfPossibleAttacks: IPossibleAttack[];

    public attacksControl = new FormControl('', {});

    public value: IPossibleAttack;

    private onChange: (value: IPossibleAttack) => void;

    private onTouched: (value: IPossibleAttack) => void;

    ngOnInit(): void {
    }

    public writeValue(value: IPossibleAttack): void {
        this.value = value;
    }

    public getEnemyName(target: string): string {
        const enemy = this.allEntities.find(entity => entity.id === target);
        if (!enemy) {
            throw Error('Не найдена цель заклинания.');
        }
        return enemy.self;
    }

    public changeAttack(attack: IPossibleAttack): void {
        this.writeValue(attack);
        this.onChange(attack);
        this.cd.detectChanges();
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
