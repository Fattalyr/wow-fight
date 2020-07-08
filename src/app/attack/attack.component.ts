import { Component, Input, OnInit } from '@angular/core';
import { IAvailableAttackVectors } from '../constants/constants';

@Component({
    selector: 'app-attack',
    templateUrl: './attack.component.html',
    styleUrls: ['./attack.component.scss']
})
export class AttackComponent implements OnInit {
    @Input()
    attackVectors: IAvailableAttackVectors;

    @Input()
    enemies = 1;

    constructor() { }

    ngOnInit(): void {
    }

}
