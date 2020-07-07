import { Component, Input, OnInit } from '@angular/core';
import { IPossibilities } from '../constants/constants';

@Component({
    selector: 'app-attack',
    templateUrl: './attack.component.html',
    styleUrls: ['./attack.component.scss']
})
export class AttackComponent implements OnInit {
    @Input()
    attackVectors: IPossibilities;

    @Input()
    enemies = 1;

    constructor() { }

    ngOnInit(): void {
    }

}
