import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import deepUnfreeze from 'deep-unfreeze';
import {
    SPELLS,
    IAvailableAttackVectors,
    IPossibleAttack,
    ISpellAttackResult,
    ITUpdatedParties,
    Party,
    Vector, CraftedSpells, ISpell, IAttacks, SPELL_TARGET, IBeastsData,
} from '../models';
import { ITurn, ITurnActivity } from '../store/battle/battle.reducer';
import { createBeast, IBeast, ICharacter } from '../classes/characters';
import { combineLatest, Subject } from 'rxjs';
import {
    selectCPUBeasts,
    selectCPUCharacter,
    selectPlayerBeasts,
    selectPlayerCharacter,
} from '../store/settings/settings.selectors';
import { map, switchMap, tap } from 'rxjs/operators';
import { selectTurns } from '../store/battle/battle.selectors';
import { addBeast, updateCPUCharacter, updatePlayerCharacter } from '../store/settings/settings.actions';


@Injectable({
    providedIn: 'root'
})
export class AttackService {
    private playerCharacter: ICharacter;
    private cpuCharacter: ICharacter;
    private playersBeasts: IBeast[];
    private cpusBeasts: IBeast[];
    private allEntities: Party = [];
    private playerParty: Party = [];
    private cpuParty: Party = [];
    private turns: ITurn[] = [];
    private turn: ITurn;
    public playersAvailableAttackVectors: IAvailableAttackVectors;
    public cpusAvailableAttackVectors: IAvailableAttackVectors;
    private turns$ = this.store.pipe(select(selectTurns));
    public playerAttacks: IPossibleAttack;
    public cpuAttacks: IPossibleAttack;
    public roundNumber: number;

    private newTurnInitSubject$ = new Subject<IAttacks>();
    public newTurnInit$ = this.newTurnInitSubject$.asObservable();

    constructor(private store: Store) {}

    public characterUpdatesFlow$ = combineLatest([
        this.store.select(selectPlayerCharacter),
        this.store.select(selectCPUCharacter),
        this.store.select(selectPlayerBeasts),
        this.store.select(selectCPUBeasts),
    ])
        .pipe(
            map(([
                playerCharacter,
                cpuCharacter,
                playersBeasts,
                cpusBeasts
            ]) => {
                this.playerCharacter = deepUnfreeze(playerCharacter);
                this.cpuCharacter = deepUnfreeze(cpuCharacter);
                this.playersBeasts = deepUnfreeze(playersBeasts);
                this.cpusBeasts = deepUnfreeze(cpusBeasts);
                this.playerParty = [ this.playerCharacter, ...this.playersBeasts ];
                this.cpuParty = [ this.cpuCharacter, ...this.cpusBeasts ];
                this.allEntities = [ ...this.playerParty, ...this.cpuParty ];
                return {
                    playerCharacter: this.playerCharacter,
                    cpuCharacter: this.cpuCharacter,
                    playerParty: this.playerParty,
                    cpuParty: this.cpuParty,
                };
            }),
            switchMap(({ playerParty, cpuParty, playerCharacter, cpuCharacter }) => this.turns$
                .pipe(
                    map(turns => {
                        this.roundNumber = turns.length + 1;
                        this.turns = turns;
                        this.playersAvailableAttackVectors = this.calculateAttackVectors(turns, playerCharacter, cpuParty);
                        this.cpusAvailableAttackVectors = this.calculateAttackVectors(turns, cpuCharacter, playerParty);
                        return {
                            turns,
                            playerCharacter,
                            playerParty,
                            cpuCharacter,
                            cpuParty,
                        };
                    }),
                )
            ),
        );

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

    private calculateSpellDamage(spell: ISpell): number {
        return spell.HPDelta;
    }

    private callSpellBeast(spell: ISpell, party: string): IBeastsData {
        const newBeast = createBeast(spell.calledBeast.type, party);
        this.store.dispatch(addBeast({ beast: newBeast }));
        return { ...spell.calledBeast, id: newBeast.id };
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

    public calculatePossibleAttacks(availableVectors: IAvailableAttackVectors): IPossibleAttack[] {
        const availableAttacks: IPossibleAttack[] = [];

        for (const enemy of availableVectors.availableEnemies) {
            if (availableVectors.canHit) {
                availableAttacks.push({ target: enemy, hit: true });
            }
            if (availableVectors.spells.length > 0) {
                for (const spell of availableVectors.spells) {
                    availableAttacks.push({ target: enemy, spell, });
                }
            }
        }

        return availableAttacks;
    }

    private castSpell(
        assaulter: ICharacter,
        defending: ICharacter,
        assaulterParty: Party,
        defendingParty: Party,
        activity: ITurnActivity
    ): ISpellAttackResult {
        const spell = activity.characterAttacked.spell;
        assaulter.castedSpells[spell.spellName] = spell.coolDown;
        if (spell.target === assaulter.id) {
            if (spell.spellName === SPELLS.ANCESTRAL_SPIRIT) {
                assaulter.currentData.hp = (assaulter.currentData.hp + spell.HPDelta) > assaulter.inheritedData.hp
                    ? assaulter.inheritedData.hp
                    : assaulter.currentData.hp + spell.HPDelta;
            } else if (spell.spellName === SPELLS.REBIRTH) {
                const beast = createBeast(spell.calledBeast.type, assaulter.party);
                assaulterParty.push(beast);
            }
        } else if (spell.target === defending.id) {
            defending.spellbound[spell.spellName] = spell.duration;
            if (spell.spellName === SPELLS.FILTH) {
                defending.currentData.hp = (defending.currentData.hp - spell.HPDelta) < 0
                    ? 0
                    : defending.currentData.hp - spell.HPDelta;
                if (defending.currentData.hp === 0) {
                    defending.isAlive = false;
                }
            }
        }
        return {
            assaulter,
            defending,
            assaulterParty,
            defendingParty,
        };
    }

    private applyHit(
        defending: ICharacter,
        assaulter: ICharacter,
        assaulterActivity: ITurnActivity
    ): ICharacter {
        const critFired = assaulterActivity.critFired;
        const cpuCharactersUpdatedHp = defending.currentData.hp - assaulter.currentData.dps * (critFired ? 1.5 : 1);
        const HPDiffIsPositive = cpuCharactersUpdatedHp > 0;
        if (HPDiffIsPositive) {
            defending.currentData.hp = cpuCharactersUpdatedHp;
        } else {
            defending.currentData.hp = 0;
            defending.isAlive = false;
        }
        return defending;
    }

    public applyAttack(
        turn: ITurn,
        playerCharacter: ICharacter,
        cpuCharacter: ICharacter,
        playerParty: Party,
        cpuParty: Party,
        vector: Vector
    ): ITUpdatedParties {
        if (vector === Vector.PLAYER_VS_CPU) {
            const activity = turn.playersActivities;

            if (activity.characterAttacked.hit) {
                cpuCharacter = this.applyHit(cpuCharacter, playerCharacter, activity);

                return {
                    updatedPlayerCharacter: playerCharacter,
                    updatedCpuCharacter: cpuCharacter,
                    updatedPlayerParty: playerParty,
                    updatedCpuParty: cpuParty,
                };
            } else if (activity.characterAttacked.spell) {
                const {
                    assaulter,
                    defending,
                    assaulterParty,
                    defendingParty
                } = this.castSpell(playerCharacter, cpuCharacter, playerParty, cpuParty, activity);

                return {
                    updatedPlayerCharacter: assaulter,
                    updatedCpuCharacter: defending,
                    updatedPlayerParty: assaulterParty,
                    updatedCpuParty: defendingParty,
                };
            }
        } else if (vector === Vector.CPU_VS_PLAYER) {
            const activity = turn.cpusActivities;

            if (activity.characterAttacked.hit) {
                playerCharacter = this.applyHit(playerCharacter, cpuCharacter, activity);

                return {
                    updatedPlayerCharacter: playerCharacter,
                    updatedCpuCharacter: cpuCharacter,
                    updatedPlayerParty: playerParty,
                    updatedCpuParty: cpuParty,
                };
            } else if (activity.characterAttacked.spell) {
                const {
                    assaulter,
                    defending,
                    assaulterParty,
                    defendingParty
                } = this.castSpell(cpuCharacter, playerCharacter, cpuParty, playerParty, turn.cpusActivities);

                return {
                    updatedPlayerCharacter: defending,
                    updatedCpuCharacter: assaulter,
                    updatedPlayerParty: defendingParty,
                    updatedCpuParty: assaulterParty,
                };
            }
        }
    }

    private defineCPUAttackVector(): void {
        const possibleAttacks = this.calculatePossibleAttacks(this.cpusAvailableAttackVectors);
        const length = possibleAttacks.length;
        if (length === 0) {
            throw new Error('CPU не имеет векторов атак.');
        }
        const random = Math.round(Math.random() * 100000) % length;
        this.cpuAttacks = possibleAttacks[random];
    }

    public initNewTurn(): void {
        this.turn = {
            roundNumber: this.roundNumber,
            playersActivities: {
                characterAttacked: undefined,
                critFired: null,
            },
            cpusActivities: {
                characterAttacked: undefined,
                critFired: null,
            }
        };
    }

    public playerIsMoving(): void {
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('Player is moving');

        console.log('this.turn', this);

        this.turn.playersActivities = this.calculateActivity(this.playerCharacter, this.playerAttacks);

        const {
            updatedPlayerCharacter,
            updatedCpuCharacter,
            updatedPlayerParty,
            updatedCpuParty
        } = this.applyAttack(
            this.turn,
            this.playerCharacter,
            this.cpuCharacter,
            this.playerParty,
            this.cpuParty,
            Vector.PLAYER_VS_CPU
        );

        this.store.dispatch(updatePlayerCharacter({ playerCharacter: updatedPlayerCharacter }));
        this.store.dispatch(updateCPUCharacter({ cpuCharacter: updatedCpuCharacter }));
    }

    public CPUIsMoving(): void {
        this.defineCPUAttackVector();
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('CPU is moving');
    }

    public playersBeastsAreMoving(): void {
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('Player\'s beast are moving');
    }

    public CPUsBeastsAreMoving(): void {
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('CPU\'s beast are moving');
    }
}
