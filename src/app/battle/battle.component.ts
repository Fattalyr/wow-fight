import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import deepUnfreeze from 'deep-unfreeze';
import isEqual from 'lodash.isequal';
import {
    selectCPUBeasts,
    selectCPUCharacter,
    selectCPUPartyId,
    selectPlayerBeasts,
    selectPlayerCharacter,
    selectPlayerPartyId,
    selectSettings,
} from '../store/settings/settings.selectors';
import { selectTotalTurns, selectTurns } from '../store/battle/battle.selectors';
import {
    NAMES,
    SPELLS,
    CraftedSpells,
    IAttacks,
    IAvailableAttackVectors,
    IBeastsData,
    IPossibleAttack,
    ISpell,
    Party,
    SPELL_TARGET,
    Vector,
} from '../models';
import { ITurn, ITurnActivity } from '../store/battle/battle.reducer';
import { AttackService } from '../services/attack.service';
import { addBeast, updateCPUCharacter, updatePlayerCharacter } from '../store/settings/settings.actions';
import { playerPassedTurn, turnCompleted } from '../store/battle/battle.actions';
import { createBeast, IBeast, ICharacter } from '../classes/characters';


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

    private playerCharacter: ICharacter;

    private cpuCharacter: ICharacter;

    private playerBeasts: IBeast[] = [];

    private cpuBeasts: IBeast[] = [];

    private immutablePlayerCharacter: ICharacter;

    private immutableCpuCharacter: ICharacter;

    constructor(
        private store: Store,
        private attackService: AttackService,
    ) { }

    ngOnInit(): void {
        this.attackService
            .characterUpdatesFlow$
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe();

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
                distinctUntilChanged(isEqual),
                // filter(([
                //     playerCharacter,
                //     cpuCharacter,
                //     playerBeasts,
                //     cpuBeasts
                // ]) => !isEqual(playerCharacter, this.playerCharacter)
                //     || !isEqual(cpuCharacter, this.cpuCharacter)
                //     || !this.beastsAreEqual(playerBeasts, this.playerBeasts)
                //     || !this.beastsAreEqual(cpuBeasts, this.cpuBeasts)
                // ),
                map(([
                    playerCharacter,
                    cpuCharacter,
                    playerBeasts,
                    cpuBeasts
                ]) => {
                    this.immutablePlayerCharacter = playerCharacter;
                    this.immutableCpuCharacter = cpuCharacter;

                    return {
                        playerParty: [ ...deepUnfreeze(playerBeasts), { ...deepUnfreeze(playerCharacter) } ],
                        cpuParty: [ ...deepUnfreeze(cpuBeasts), { ...deepUnfreeze(cpuCharacter) } ],
                        playerCharacter: { ...deepUnfreeze(playerCharacter) } as ICharacter,
                        cpuCharacter: { ...deepUnfreeze(cpuCharacter) } as ICharacter,
                        playerBeasts: [ ...deepUnfreeze(playerBeasts) ],
                        cpuBeasts: [ ...deepUnfreeze(cpuBeasts) ],
                    };
                }),
                tap(({ playerParty, cpuParty, playerCharacter, cpuCharacter, playerBeasts, cpuBeasts }) => {
                    this.allEntities = [ ...playerParty, ...cpuParty ];
                    this.playerPartyEntities = playerParty;
                    this.cpuPartyEntities = cpuParty;
                    this.playerCharacter = playerCharacter;
                    this.cpuCharacter = cpuCharacter;
                    this.playerBeasts = playerBeasts;
                    this.cpuBeasts = cpuBeasts;
                }),
                map(({
                    playerParty,
                    cpuParty,
                    playerCharacter,
                    cpuCharacter,
                    playerBeasts,
                    cpuBeasts
                }) => ({
                    playerParty,
                    cpuParty,
                    playerCharacter,
                    cpuCharacter,
                })),
                take(25),
            );

        combinePartyValues$
            .pipe(
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
                map(({ value }) => {
                    this.playerAttacks = value;
                    this.attackService.playerAttacks = value;
                    return value;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();

        this.newTurnInit$
            .pipe(
                map((value: IAttacks) => deepUnfreeze(value)),
                filter(() => this.turnIsCalculating),
                map(({ cpuAttackVector, playerAttackVector }): ITurn => {
                    const playerActivity = this.calculateActivity(this.playerCharacter, playerAttackVector);
                    const cpuActivity = this.calculateActivity(this.cpuCharacter, cpuAttackVector);

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
                    const {
                        updatedPlayerCharacter,
                        updatedCpuCharacter,
                        updatedPlayerParty,
                        updatedCpuParty
                    } = this.attackService.applyAttack(turn, playerCharacter, cpuCharacter, playerParty, cpuParty, Vector.PLAYER_VS_CPU);

                    return {
                        turn,
                        playerParty: updatedPlayerParty,
                        cpuParty: updatedCpuParty,
                        playerCharacter: updatedPlayerCharacter,
                        cpuCharacter: updatedCpuCharacter,
                    };
                }),
                tap(val => console.log(val)),
                takeUntil(this.destroy$),
                finalize(() => this.turnIsCalculating = false),
            )
            .subscribe(({
                turn,
                playerParty,
                cpuParty,
                playerCharacter,
                cpuCharacter
            }) => {
                this.store.dispatch(turnCompleted({ turn }));
                console.log(playerCharacter);
                console.log(this.playerCharacter);
                if (!isEqual(playerCharacter, this.immutablePlayerCharacter)) {
                    this.store.dispatch(updatePlayerCharacter({ playerCharacter }));
                }
                if (!isEqual(cpuCharacter, this.immutableCpuCharacter)) {
                    this.store.dispatch(updateCPUCharacter({ cpuCharacter }));
                }
                this.playerAttacks = null;
                this.cpuAttacks = null;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    private calculateAttackVectors(
        turns: ITurn[],
        character: ICharacter,
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

    private calculateActivity(character: ICharacter, attack: IPossibleAttack): ITurnActivity {
        const target = this.allEntities.find(entity => entity.id === attack.target);
        const hit = attack.hit;
        const turnActivity = deepUnfreeze({
            craftedSpells: this.reduceSpells(character.castedSpells),
            characterAttacked: { ...attack, damage: 0 },
            critFired: hit ? Math.random() <= character.currentData.crit : null,
        });
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
        const newBeast = createBeast(spell.calledBeast.type, party);
        this.store.dispatch(addBeast({ beast: newBeast }));
        return { ...spell.calledBeast, id: newBeast.id };
    }

    public turnRound(): void {
        // this.turnIsCalculating = true;
        // this.defineCPUAttackVector();
        //
        // this.newTurnInitSubject$.next(
        //     {
        //         cpuAttackVector: this.cpuAttacks,
        //         playerAttackVector: this.playerAttacks,
        //     }
        // );
        this.store.dispatch(playerPassedTurn());
    }
}
