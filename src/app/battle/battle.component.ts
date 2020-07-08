import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { map, tap, switchMap, takeUntil, } from 'rxjs/operators';
import {
    selectCPUBeasts,
    selectCPUCharacter,
    selectCPUPartyId, selectPlayerBeasts,
    selectPlayerCharacter,
    selectPlayerPartyId,
    selectSettings
} from '../store/settings/settings.selectors';
import { selectTotalTurns, selectTurns } from '../store/battle/battle.selectors';
import { turnCompleted } from '../store/battle/battle.actions';
import { NAMES, BEASTS, IAvailableAttackVectors, CraftedSpells, SPELLS, ISpell, } from '../models';
import {
    CHARACTERS_START_DATA,
    BEASTS_DATA,
    MULTIPLIERS,
} from '../constants/constants';
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

    public playerPartyId$ = this.store.pipe(
        select(selectPlayerPartyId)
    );

    public cpuPartyId$ = this.store.pipe(
        select(selectCPUPartyId)
    );

    public playerBeasts$ = this.store.pipe(
        select(selectPlayerBeasts)
    );

    public cpuBeasts$ = this.store.pipe(
        select(selectCPUBeasts)
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

    public currentTurn: ITurn;

    public enemies: string[] = [];

    public turnNumber: number;

    private destroy$ = new Subject<void>();

    public playerPartyEntities: (CharacterClass | BeastClass)[] = [];

    public cpuPartyEntities: (CharacterClass | BeastClass)[] = [];

    public playersAvailableAttackVectors: IAvailableAttackVectors;

    public cpusAvailableAttackVectors: IAvailableAttackVectors;

    constructor(
        private store: Store,
    ) { }

    ngOnInit(): void {
        this.total$
            .pipe(
                map((total: number) => {
                    this.turnNumber = total + 1;
                    if (total === 0) {
                        this.initCurrentProps();
                    }
                    return total;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();

        combineLatest([
            this.playerCharacter$,
            this.cpuCharacter$,
            this.playerBeasts$,
            this.cpuBeasts$,
        ])
            .pipe(
                map(([
                     playerCharacter,
                     cpuCharacter,
                     playerBeasts,
                     cpuBeasts
                ]) => ({
                    playerParty: [ ...playerBeasts, playerCharacter ],
                    cpuParty: [...cpuBeasts, cpuCharacter],
                    playerCharacter,
                    cpuCharacter,
                })),
                switchMap(({ playerParty, cpuParty, playerCharacter, cpuCharacter }) => this.turns$
                    .pipe(
                        tap(turns => {
                            this.playersAvailableAttackVectors = this.calculateAttackVectors(turns, playerCharacter, cpuParty);
                            this.cpusAvailableAttackVectors = this.calculateAttackVectors(turns, cpuCharacter, playerParty);
                        }),
                    )
                ),
                takeUntil(this.destroy$),
            )
            .subscribe();

        combineLatest([
            this.playerCharacter$,
            this.cpuCharacter$,
        ])
            .pipe(

                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    private initCurrentProps(): void {
        this.currentProps = { ...this.calculatedProps };
    }

    private calculateAttackVectors(
        turns: ITurn[],
        character: CharacterClass,
        availableEnemies: (CharacterClass | BeastClass)[]
    ): IAvailableAttackVectors {
        const len = turns.length;
        const enemies: string[] = [];

        for (const enemy of availableEnemies) {
            enemies.push(enemy.id);
        }

        if (len === 0) {
            return {
                canHit: true,
                spells: [ ...character.inheritedData.spells ],
                availableEnemies: enemies,
            };
        }

        const castedByCharacterSpells: CraftedSpells = this.reduceSpells(character.castedSpells);
        const castedSpellNames: string[] = Object.keys(castedByCharacterSpells);
        let canSpell: ISpell[] = [];

        if (castedSpellNames.length === 0) {
            canSpell = [ ...character.inheritedData.spells ];
        } else {
            for (const spell in character.inheritedData.spells) {
                if (castedSpellNames[character.inheritedData.spells[spell].spellName] === undefined) {
                    canSpell.push(character.inheritedData.spells[spell]);
                }
            }
        }

        return {
            canHit: !Object.keys(character.spellbound).includes(SPELLS.FEAR),
            spells: [ ...canSpell ],
            availableEnemies: enemies,
        };
    }

    private reduceSpells(craftedSpells: CraftedSpells): CraftedSpells {
        const reducedSpells: CraftedSpells = [];
        if (craftedSpells.length > 0) {
            for (const spellName in craftedSpells) {
                if (craftedSpells[ spellName ] > 0) {
                    reducedSpells[ spellName ] = craftedSpells[ spellName ] - 1;
                }
            }
        }
        return reducedSpells;
    }

    public turnRound(): void {
        // this.store.dispatch(turnCompleted({
        //     userTurnAvailable: false,
        //     roundNumber: this.turnNumber,
        //     playersActivities: ITurnActivity;
        //     cpusActivities: ITurnActivity;
        //     playerCharacter: NAMES;
        //     cpuCharacter: NAMES;
        // }));
    }



}
