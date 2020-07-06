import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { selectRoundDuration, selectSettings, selectUserCharacter } from '../store/settings/settings.selectors';
import { selectTotalTurns, selectTurns } from '../store/battle/battle.selectors';
import { CHARACTERS_START_DATA, MULTIPLIERS, NAMES } from '../constants/constants';
import { map, tap, takeUntil, } from 'rxjs/operators';

@Component({
    selector: 'app-battle',
    templateUrl: './battle.component.html',
    styleUrls: ['./battle.component.scss']
})
export class BattleComponent implements OnInit, OnDestroy {

    public names = NAMES;

    public characterData = CHARACTERS_START_DATA;

    private multipliers = MULTIPLIERS;

    public calculatedProps = {
        [NAMES.GULDAN]: {
            hp: 0,
            dps: 0,
            crit: 0,
        },
        [NAMES.NERZHUL]: {
            hp: 0,
            dps: 0,
            crit: 0,
        },
    };

    public currentProps = {
        [NAMES.GULDAN]: {
            hp: 0,
            dps: 0,
            crit: 0,
        },
        [NAMES.NERZHUL]: {
            hp: 0,
            dps: 0,
            crit: 0,
        },
    };

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

    public turns$ = this.store.pipe(
        select(selectTurns)
    );

    public total$ = this.store.pipe(
        select(selectTotalTurns)
    );

    private destroy$ = new Subject<void>();

    constructor(
        private store: Store,
    ) {
        for (const unit in this.calculatedProps) {
            const characterParams = { dps: 0, hp: 0, crit: 0 };
            const character = this.calculatedProps[unit];

            for (const param in character) {
                for (const property in this.multipliers) {
                    if (param in this.multipliers[property]) {
                        characterParams[param] += this.multipliers[property][param] * this.characterData[unit][property];
                    }
                }
            }
            this.calculatedProps[unit] = characterParams;
        }
    }

    ngOnInit(): void {
        this.total$
            .pipe(
                map((total: number) => {
                    if (total === 0) {
                        this.initCurrentProps();
                    }
                    return total;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    private initCurrentProps(): void {
        this.currentProps = { ...this.calculatedProps };
    }

    public turnRound(): void {

    }

    ngOnDestroy(): void {

    }

}
