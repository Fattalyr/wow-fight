import { Component, OnInit, Input } from '@angular/core';
import { IBeast, ICharacter } from '../../classes/characters';

@Component({
    selector: 'app-character-card',
    templateUrl: './character-card.component.html',
    styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent implements OnInit {
    @Input()
    character: ICharacter | IBeast;

    @Input()
    party: 'Вы' | 'CPU';

    constructor() {}

    ngOnInit(): void {}
}
