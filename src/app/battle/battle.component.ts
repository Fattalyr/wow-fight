import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { map, tap, switchMap, takeUntil, } from 'rxjs/operators';
import { selectCPUCharacter, selectPlayerCharacter, selectSettings } from '../store/settings/settings.selectors';
import { selectTotalTurns, selectTurns } from '../store/battle/battle.selectors';
import { BEASTS, BEASTS_DATA, CHARACTERS_START_DATA, IAvailableSpells, IPossibilities, MULTIPLIERS, NAMES, } from '../constants/constants';
import { ITurn } from '../store/battle/battle.reducer';
import { CharacterClass } from '../classes/character.class';
import { BeastClass } from '../classes/beast.class';

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

    public playerCharacter$ = this.store.pipe(
        select(selectPlayerCharacter)
    );

    public cpuCharacter$ = this.store.pipe(
        select(selectCPUCharacter)
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

    public defaultPossibilities: IPossibilities;

    public currentPossibilities: IPossibilities;

    public currentTurn: ITurn;

    public enemies: Array<NAMES | BEASTS> = [];

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

        // this.playerCharacter$
        //     .pipe(
        //         tap((playerCharacter: NAMES) => this.defaultPossibilities = this.setDefaultPossibilities(playerCharacter)),
        //         switchMap(playerCharacter => this.cpuCharacter$
        //             .pipe(
        //                 map((cpuCharacter: NAMES) => [ playerCharacter, cpuCharacter ]),
        //             )
        //         ),
        //         switchMap(([ playerCharacter, cpuCharacter ]) => this.turns$
        //             .pipe(
        //                 tap((turns: ITurn[]) => this.currentTurn = this.calculateCurrentTurn(turns, playerCharacter, cpuCharacter)),
        //             ),
        //         ),
        //         takeUntil(this.destroy$),
        //     )
        //     .subscribe();
    }

    private initCurrentProps(): void {
        this.currentProps = { ...this.calculatedProps };
    }

    private setDefaultPossibilities(userCharacter: NAMES): IPossibilities {
        const spellsNames = Object.keys(this.characterData[userCharacter].spells);
        const availableSpells: IAvailableSpells = {};

        for (const spell of spellsNames) {
            availableSpells[spell] = true;
        }

        return {
            canHit: true,
            spells: availableSpells,
        };
    }

    private calculateCurrentTurn(turns: ITurn[], playerCharacter: NAMES, cpuCharacter: NAMES): ITurn {
        const len = turns.length;
        if (len === 0) {
            return {
                userTurnAvailable: true,
                roundNumber: 1,
                playersActivities: { critFired: false, target: null, },
                cpusActivities: { critFired: false, target: null, },
                playerCharacter,
                cpuCharacter,
            };
        }

        const lastTurn = turns[len - 1];
        const currentTurn = {
            userTurnAvailable: true,
            roundNumber: len + 1,
            playersActivities: { critFired: false, target: null, },
            cpusActivities: { critFired: false, target: null, },
            playerCharacter,
            cpuCharacter,
        };


    }

    public turnRound(): void {

    }

    ngOnDestroy(): void {

    }

}
