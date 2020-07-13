import { Component, OnInit, Input } from '@angular/core';
import { BeastClass } from '../../classes/beast.class';
import { CharacterClass } from '../../classes/character.class';

@Component({
    selector: 'app-character-card',
    templateUrl: './character-card.component.html',
    styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent implements OnInit {
    @Input()
    character: CharacterClass | BeastClass;

    @Input()
    party: 'Вы' | 'CPU';

    constructor() {}

    ngOnInit(): void {}
}
