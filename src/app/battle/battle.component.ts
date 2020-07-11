import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import {
    map,
    tap,
    switchMap,
    takeUntil,
    filter,
    finalize,
} from 'rxjs/operators';
import {
    selectPlayerCharacter,
    selectCPUCharacter,
    selectPlayerBeasts,
    selectCPUBeasts,
    selectPlayerPartyId,
    selectCPUPartyId,
    selectSettings
} from '../store/settings/settings.selectors';
import { selectTotalTurns, selectTurns } from '../store/battle/battle.selectors';
import { turnCompleted } from '../store/battle/battle.actions';
import {
    NAMES,
    BEASTS,
    SPELL_TARGET,
    IAvailableAttackVectors,
    CraftedSpells,
    SPELLS,
    ISpell,
    IPossibleAttack,
    ICharacterMutableCopy,
    IBeastsData,
    IAttacks,
    Party,
    Vector,
    ITUpdatedParties,
} from '../models';
import { ITurn, ITurnActivity } from '../store/battle/battle.reducer';
import { CharacterClass } from '../classes/character.class';
import { BeastClass } from '../classes/beast.class';
import { AttackService } from '../services/attack.service';
import { addBeast } from '../store/settings/settings.actions';


@Component({
    selector: 'app-battle',
    templateUrl: './battle.component.html',
    styleUrls: ['./battle.component.scss']
})
export class BattleComponent implements OnInit, OnDestroy {

    public names = NAMES;

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

    public turnIsCalculating = false;

    private newTurnInitSubject$ = new Subject<IAttacks>();
    public newTurnInit$ = this.newTurnInitSubject$.asObservable();

    public turnNumber: number;

    private destroy$ = new Subject<void>();

    public playerPartyEntities: Party = [];

    public cpuPartyEntities: Party = [];

    public allEntities: Party = [];

    public playersAvailableAttackVectors: IAvailableAttackVectors;

    public cpusAvailableAttackVectors: IAvailableAttackVectors;

    public playerAttacks: IPossibleAttack;

    public cpuAttacks: IPossibleAttack;

    public form: FormGroup = new FormGroup({
        playerAttacksControl: new FormControl(),
    });

    private playerCharacter: ICharacterMutableCopy;

    private cpuCharacter: ICharacterMutableCopy;

    constructor(
        private store: Store,
        private attackService: AttackService,
    ) { }

    ngOnInit(): void {
        this.total$
            .pipe(
                map((total: number) => {
                    this.turnNumber = total + 1;
                    return total;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();

        const combinePartyValues$ = combineLatest([
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
                    playerCharacter: { ...playerCharacter } as ICharacterMutableCopy,
                    cpuCharacter: { ...cpuCharacter } as ICharacterMutableCopy,
                }))
            );

        combinePartyValues$
            .pipe(
                tap(({ playerParty, cpuParty, playerCharacter, cpuCharacter }) => {
                    this.allEntities = [ ...playerParty, ...cpuParty ];
                    this.playerPartyEntities = playerParty;
                    this.cpuPartyEntities = cpuParty;
                    this.playerCharacter = { ...playerCharacter } as ICharacterMutableCopy;
                    this.cpuCharacter = { ...cpuCharacter } as ICharacterMutableCopy;
                }),
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

        this.form
            .get('playerAttacksControl')
            .valueChanges
            .pipe(
                tap(({ value }) => this.playerAttacks = value),
                takeUntil(this.destroy$),
            )
            .subscribe();

        this.newTurnInit$
            .pipe(
                filter(() => this.turnIsCalculating),
                map(({ cpuAttackVector, playerAttackVector }): ITurn => {
                    const playerActivity = this.calculateActivity(this.playerCharacter, playerAttackVector);
                    const cpuActivity = this.calculateActivity(this.cpuCharacter, cpuAttackVector);
                    console.log(' ');
                    console.log('player', this.playerCharacter.id);
                    console.log('playerActivity', playerActivity);
                    console.log('cpu', this.cpuCharacter.id);
                    console.log('cpuActivity', cpuActivity);
                    // this.store.dispatch(
                    //     turnCompleted({
                    //         turn: {
                    //             roundNumber: this.turnNumber,
                    //             playersActivities: playerActivity,
                    //             cpusActivities: cpuActivity,
                    //         }
                    //     })
                    // );
                    return {
                        roundNumber: this.turnNumber,
                        playersActivities: playerActivity,
                        cpusActivities: cpuActivity,
                    };
                }),
                switchMap((turn: ITurn) => combinePartyValues$
                    .pipe(
                        map(({
                            playerParty,
                            cpuParty,
                            playerCharacter,
                            cpuCharacter,
                        }) => ({
                            turn,
                            playerParty,
                            cpuParty,
                            playerCharacter,
                            cpuCharacter,
                        })),
                    ),
                ),
                /**
                 * @description Применяем атаку пользователя.
                 */
                map(({ turn, playerParty, cpuParty, playerCharacter, cpuCharacter }) => {
                    const { roundNumber, playersActivities, cpusActivities } = turn;

                    const {
                        updatedPlayerCharacter,
                        updatedCpuCharacter,
                        updatedPlayerParty,
                        updatedCpuParty
                    } = this.applyAttack(playerCharacter, turn, cpuCharacter, playerParty, cpuParty);
                }),
                takeUntil(this.destroy$),
                finalize(() => this.turnIsCalculating = false),
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    private calculateAttackVectors(
        turns: ITurn[],
        character: ICharacterMutableCopy,
        availableEnemies: Party
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
                if (craftedSpells[spellName] > 0) {
                    reducedSpells[spellName] = craftedSpells[spellName] - 1;
                }
            }
        }
        return reducedSpells;
    }

    private defineCPUAttackVector(): void {
        const possibleAttacks = this.attackService.calculatePossibleAttacks(this.cpusAvailableAttackVectors);
        const length = possibleAttacks.length;
        if (length === 0) {
            throw new Error('CPU не имеет векторов атак.');
        }
        const random = Math.round(Math.random() * 100000) % length;
        this.cpuAttacks = possibleAttacks[random];
    }

    private calculateActivity(character: ICharacterMutableCopy, attack: IPossibleAttack): ITurnActivity {
        const target = this.allEntities.find(entity => entity.id === attack.target);
        const hit = attack.hit;
        const turnActivity = {
            craftedSpells: this.reduceSpells(character.castedSpells),
            characterAttacked: { ...attack, damage: 0 },
            critFired: hit ? Math.random() <= character.currentData.crit : null,
        };
        if (!target) {
            throw new Error('Не найдена цель атаки.');
        }
        if (hit) {
            turnActivity.characterAttacked.damage = character.currentData.dps * (turnActivity.critFired ? 1.5 : 1);
        } else {
            if (attack?.spell?.HPDelta) {
                turnActivity.characterAttacked.damage = this.calculateSpellDamage(attack.spell);
                if (attack.spell.target === SPELL_TARGET.SELF) {
                    turnActivity.characterAttacked.target = character.id;
                }
            } else if (attack?.spell?.callBeast) {
                turnActivity.characterAttacked.spell.calledBeast = this.callSpellBeast(attack.spell, character.party);
            }
        }
        return turnActivity;
    }

    private calculateSpellDamage(spell: ISpell): number {
        return spell.HPDelta;
    }

    private callSpellBeast(spell: ISpell, party: string): IBeastsData {
        const newBeast = new BeastClass(spell.calledBeast, party);
        this.store.dispatch(addBeast({ beast: newBeast }));
        return { ...spell.calledBeast, id: newBeast.id };
    }

    private applyAttack(
        turn: ITurn,
        playerCharacter: ICharacterMutableCopy,
        cpuCharacter: ICharacterMutableCopy,
        playerParty: Party,
        cpuParty: Party,
        vector: Vector
    ): ITUpdatedParties {
        /**
         * @description Простые атаки
         */
        if (
            [
                Vector.CPUS_BEAST_VS_PLAYER,
                Vector.PLAYERS_BEAST_VS_CPU,
                Vector.CPUS_BEAST_VS_PLAYERS_BEAST,
                Vector.PLAYERS_BEAST_VS_CPUS_BEAST
            ].includes(vector)
        ) {
            if (vector === Vector.CPUS_BEAST_VS_PLAYER) {

            }
        }
    }

    public turnRound(): void {
        this.turnIsCalculating = true;
        this.defineCPUAttackVector();

        this.newTurnInitSubject$.next(
            {
                cpuAttackVector: this.cpuAttacks,
                playerAttackVector: this.playerAttacks,
            }
        );
    }
}
