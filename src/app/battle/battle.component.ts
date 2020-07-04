import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectRoundDuration, selectSettings, selectUserCharacter } from '../store/settings/settings.selectors';
import { NAMES } from '../constants/constants';

@Component({
    selector: 'app-battle',
    templateUrl: './battle.component.html',
    styleUrls: ['./battle.component.scss']
})
export class BattleComponent implements OnInit {

    public names = NAMES;

    public form: FormGroup = new FormGroup({
        roundDuration: new FormControl(),
    });

    public roundDuration$ = this.store.pipe(
        select(selectRoundDuration)
    );

    public userCharacter$ = this.store.pipe(
        select(selectUserCharacter)
    );

    public fullState$ = this.store.pipe(
        select(selectSettings)
    );

    constructor(
        private store: Store,
    ) { }

    ngOnInit(): void {
    }

    public turnRound() {

    }

}
