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
import { NAMES, BEASTS, IAvailableAttackVectors, CraftedSpells, SPELLS, ISpell, IPossibleAttack, } from '../models';
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

    public currentTurn: ITurn;

    public turnNumber: number;

    private destroy$ = new Subject<void>();

    public playerPartyEntities: (CharacterClass | BeastClass)[] = [];

    public cpuPartyEntities: (CharacterClass | BeastClass)[] = [];

    public allEntities: (CharacterClass | BeastClass)[] = [];

    public playersAvailableAttackVectors: IAvailableAttackVectors;

    public cpusAvailableAttackVectors: IAvailableAttackVectors;

    public playerAttacks: IPossibleAttack;

    public cpuAttacks: IPossibleAttack;

    public form: FormGroup = new FormGroup({
        playerAttacksControl: new FormControl(),
    });

    private playerCharacter: CharacterClass;

    private cpuCharacter: CharacterClass;

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
                tap(({ playerParty, cpuParty, playerCharacter, cpuCharacter }) => {
                    this.allEntities = [ ...playerParty, ...cpuParty ];
                    this.playerPartyEntities = playerParty;
                    this.cpuPartyEntities = cpuParty;
                    this.playerCharacter = playerCharacter;
                    this.cpuCharacter = cpuCharacter;
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
    }

    ngOnDestroy(): void {
        this.destroy$.next();
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
        const random = (Math.random() * 100000) % length;
        this.cpuAttacks = possibleAttacks[random];
    }

    private calculateActivity(character: CharacterClass, attack: IPossibleAttack): ITurnActivity {
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
            if (attack.spell) {
                this.castSpell(character, turnActivity, attack);
            }
        }
        return turnActivity;
    }

    private castSpell(character: CharacterClass, turn: ITurnActivity, attack: IPossibleAttack): void {
        const spell = attack.spell;
        if (!spell) {
            return;
        }
        const target = spell.target === 'self'
            ? character
            : this.allEntities.find(entity => entity.id === attack.target);
        target.spellbound = { ...target.spellbound, [spell.spellName]: spell.duration };
        character.castedSpells = { ...character.castedSpells, [spell.spellName]: spell.coolDown };
        turn.craftedSpells = { ...turn.craftedSpells, [spell.spellName]: spell.coolDown };
        if (spell.reduceHP) {
            attack.damage = spell.HPDelta;
        } else if (spell.addHP) {
            attack.damage = -spell.HPDelta;
        } else if (spell.callBeast) {
            const beast = new BeastClass(spell.calledBeast, character.party);
            this.store.dispatch(
                addBeast({ beast })
            );
            turn.calledBeasts.push(beast.id);
        }
    }

    public turnRound(): void {
        this.defineCPUAttackVector();
        const playerActivity = this.calculateActivity(this.playerCharacter, this.playerAttacks);
        console.log('playerActivity');
        console.dir(playerActivity);
        // this.store.dispatch(turnCompleted({
        //     roundNumber: this.turnNumber,
        //     playersActivities: ITurnActivity;
        //     cpusActivities: ITurnActivity;
        //     playerCharacter: NAMES;
        //     cpuCharacter: NAMES;
        // }));
    }
}
