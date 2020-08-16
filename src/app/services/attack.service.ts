import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import deepUnfreeze from 'deep-unfreeze';
import { CraftedSpells, IAvailableAttackVectors, IPossibleAttack, ISpell, Party, SPELLS, STATUSES } from '../models';
import { IActivity, ITurn } from '../store/battle/battle.reducer';
import { createBeast, IBeast, ICharacter } from '../classes/characters';
import { map, switchMap } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import { selectTurns } from '../store/battle/battle.selectors';
import {
    CPUMoveCompleted,
    CPUsBeastsMoveCompleted,
    playerBeastsMoveCompleted,
    playerMoveCompleted,
} from '../store/parties/parties.actions';
import { ATTACK_METHOD } from '../constants/constants';
import { IPartyUpdates } from '../store/_parties/parties.models';
import { turnCompleted } from '../store/battle/battle.actions';
import { ICastedSpell } from '../store/spells/spells.reducer';
import { addSpell, removeBatch, updateSpells } from '../store/spells/spells.actions';
import { combineLatest } from 'rxjs';
import { selectCharacters } from '../store/parties/parties.selectors';
import { selectAllSpells, selectSpells } from '../store/spells/spells.selectors';


@Injectable({
    providedIn: 'root'
})
export class AttackService {
    private playerCharacter: ICharacter;
    private cpuCharacter: ICharacter;
    private playersBeasts: IBeast[];
    private cpusBeasts: IBeast[];
    public allEntities: Party = [];
    private playerParty: Party = [];
    private cpuParty: Party = [];
    private turns: ITurn[] = [];
    private turn: ITurn;
    private spells: ICastedSpell[] = [];
    public playersAvailableAttackVectors: IAvailableAttackVectors;
    public cpusAvailableAttackVectors: IAvailableAttackVectors;
    private turns$ = this.store.pipe(select(selectTurns));
    public playerAttacks: IPossibleAttack;
    public roundNumber: number;

    constructor(
        private store: Store,
        private router: Router,
    ) {}

    public characterUpdatesFlow$ = combineLatest([
        this.store.select(selectCharacters),
        this.store.select(selectAllSpells)
    ])
        .pipe(
            map(([ characters, spells ]) => {
                this.playerCharacter = characters.find(character => character.status === STATUSES.PLAYER) as ICharacter;
                this.cpuCharacter = characters.find(character => character.status === STATUSES.CPU) as ICharacter;
                this.playersBeasts = characters.filter(beast => beast.status === STATUSES.PLAYERS_BEAST) as IBeast[];
                this.cpusBeasts = characters.filter(beast => beast.status === STATUSES.CPUS_BEAST) as IBeast[];
                this.playerParty = [ this.playerCharacter, ...this.playersBeasts ];
                this.cpuParty = [ this.cpuCharacter, ...this.cpusBeasts ];
                this.allEntities = [ ...this.playerParty, ...this.cpuParty ];
                // this.playersAvailableAttackVectors = this.calculateAttackVectors(this.turns, this.playerCharacter, this.cpuParty);
                this.spells = [ ...spells ];
                return {
                    playerCharacter: this.playerCharacter,
                    cpuCharacter: this.cpuCharacter,
                    playerParty: this.playerParty,
                    cpuParty: this.cpuParty,
                    spells: this.spells,
                };
            }),
            switchMap(({ playerParty, cpuParty, playerCharacter, cpuCharacter, spells }) => this.turns$
                .pipe(
                    map(turns => {
                        this.roundNumber = turns.length + 1;
                        this.turns = turns;
                        // this.cpusAvailableAttackVectors = this.calculateAttackVectors(turns, cpuCharacter, playerParty);
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

    public setPlayerAttack(value: IPossibleAttack): void {
        this.playerAttacks = value;
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

    private realizeAttack(character: ICharacter | IBeast, attack: IPossibleAttack): IActivity {
        const target = this.allEntities.find(entity => entity.id === attack.target);
        const method = attack.hit
            ? ATTACK_METHOD.HIT
            : (attack.spell
                ? ATTACK_METHOD.SPELL
                : ATTACK_METHOD.SKIP);
        let critFired: boolean = null;

        if (method === ATTACK_METHOD.HIT && 'crit' in character.currentData) {
            critFired = Math.random() <= character.currentData.crit;
        }

        const resultActivity: IActivity = {
            assaulterId: character.id,
            targetId: target.id,
            method,
            critFired,
        };

        // if (method === ATTACK_METHOD.SPELL) {
        //     resultActivity.spell = attack.spell;
        // }
        //
        // if (method === ATTACK_METHOD.HIT) {
        //     resultActivity.damage = character.currentData.dps * (critFired ? 1.5 : 1);
        // } else if (method === ATTACK_METHOD.SPELL && attack?.spell?.HPDelta) {
        //     resultActivity.damage = attack.spell.HPDelta;
        // } else if (method === ATTACK_METHOD.SPELL && attack?.spell?.callBeast) {
        //     const status = character.status === STATUSES.PLAYER ? STATUSES.PLAYERS_BEAST : STATUSES.CPUS_BEAST;
        //     resultActivity.calledBeasts = [ createBeast(attack.spell.calledBeast.type, character.party, status) ];
        // }

        return resultActivity;
    }

    // private calculateAttackVectors(
    //     turns: ITurn[],
    //     assaulter: ICharacter | IBeast,
    //     availableEnemies: Party
    // ): IAvailableAttackVectors {
    //     const len = turns.length;
    //     const enemies: string[] = [];
    //     const availableSpells = 'spells' in assaulter.inheritedData && assaulter.inheritedData.spells
    //         ? [ ...assaulter.inheritedData.spells ]
    //         : [];
    //
    //     for (const enemy of availableEnemies) {
    //         enemies.push(enemy.id);
    //     }
    //
    //     if (len === 0) {
    //         return {
    //             canHit: true,
    //             spells: availableSpells,
    //             availableEnemies: enemies,
    //         };
    //     }
    //
    //     const castedByCharacterSpells: CraftedSpells = this.reduceSpells(assaulter.castedSpells);
    //     const castedSpellNames: string[] = Object.keys(castedByCharacterSpells);
    //     let canSpell: ISpell[] = [];
    //
    //     if (castedSpellNames.length === 0) {
    //         canSpell = availableSpells;
    //     } else {
    //         for (const spell in availableSpells) {
    //             if (castedSpellNames[availableSpells[spell].spellName] === undefined) {
    //                 canSpell.push(availableSpells[spell]);
    //             }
    //         }
    //     }
    //
    //     return {
    //         canHit: !Object.keys(assaulter.spellbound).includes(SPELLS.FEAR),
    //         spells: [ ...canSpell ],
    //         availableEnemies: enemies,
    //     };
    // }

    public calculatePossibleAttacks(availableVectors: IAvailableAttackVectors): IPossibleAttack[] {
        const availableAttacks: IPossibleAttack[] = [];
        console.log('availableVectors', availableVectors);

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

    private applyHit({
         targetId,
         damage,
    }: IActivity): void {
        const all = this.allEntities;
        const defending = all.find(entity => entity.id === targetId);
        defending.currentData.hp -= damage;
    }

    private createSpell(activity: IActivity): ICastedSpell {
        const {
            duration,
            coolDown,
            canNotAttacks,
            calledBeast
        } = activity.spell;
        const { calledBeasts } = activity;

        if (calledBeast) {
            for (const beast of calledBeasts) {
                if (beast.party === this.playerCharacter.party) {
                    this.playersBeasts = [ ...this.playersBeasts, beast ];
                } else {
                    this.cpusBeasts = [ ...this.cpusBeasts, beast ];
                }
            }
        }

        return {
            id: UUID.UUID(),
            spellName: activity.spell.spellName,
            initiator: activity.assaulterId,
            target: activity.targetId,
            duration,
            coolDown,
            canNotAttacks,
            addHP: activity.spell?.addHP,
            reduceHP: activity.spell?.reduceHP,
            calledBeast: calledBeasts && calledBeasts.length ? calledBeasts[0].id : undefined,
            HPDelta: activity.spell?.HPDelta,
            roundNumber: this.roundNumber,
        } as ICastedSpell;
    }

    private applySpell(spell: ICastedSpell): void {
        const all = this.allEntities;
        const defending = all.find(entity => entity.id === spell.target);

        if (spell.reduceHP) {
            const diff = defending.currentData.hp - spell.HPDelta;
            const resultIsHigherZero = diff >= 0;
            defending.currentData.hp = resultIsHigherZero
                ? diff
                : 0;
            if (!resultIsHigherZero) {
                defending.isAlive = false;
            }
        } else if (spell.addHP) {
            const diff = defending.currentData.hp + spell.HPDelta;
            const resultIsLowerMax = diff <= defending.inheritedData.hp;
            defending.currentData.hp = resultIsLowerMax
                ? diff
                : defending.inheritedData.hp;
        }
    }

    private applyPreviousSpellsOf(id: string): void {
        const spells = this.spells.filter(spell => spell.initiator === id);
        if (!spells) { return; }
        const spellsForRemoving: string[] = [];
        const spellsForUpdating: ICastedSpell[] = [];

        for (const spell of spells) {
            this.applySpell(spell);
            if (spell.duration <= 0) {
                spellsForRemoving.push(spell.id);
            } else {
                spellsForUpdating.push({
                    ...spell,
                    coolDown: spell.coolDown > 1 ? spell.coolDown - 1 : 0,
                    duration: spell.duration - 1,
                });
            }
        }

        if (spellsForRemoving.length) {
            this.store.dispatch(removeBatch({ spells: spellsForRemoving }));
        }
        if (spellsForUpdating.length) {
            this.store.dispatch(updateSpells({ spells: spellsForUpdating }));
        }
    }

    private defineCPUAttackVector(availableAttacks: IAvailableAttackVectors): IPossibleAttack {
        const possibleAttacks = this.calculatePossibleAttacks(availableAttacks);
        const length = possibleAttacks.length;
        if (length === 0) {
            throw new Error('CPU не имеет векторов атак.');
        }
        const random = Math.round(Math.random() * 100000) % length;
        return possibleAttacks[random];
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
            },
            playerPartyActivities: [],
            cpuPartyActivities: [],
        };
    }

    public playerIsMoving(): void {
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('Player is moving');

        // const playerActivity = this.realizeAttack(this.playerCharacter, this.playerAttacks);
        // this.turn.playerPartyActivities.push(playerActivity);
        // console.log('playerActivity', playerActivity);
        //
        // this.applyPreviousSpellsOf(this.playerCharacter.id);
        //
        // if (playerActivity.method === ATTACK_METHOD.HIT) {
        //     this.applyHit(playerActivity);
        // } else if (playerActivity.method === ATTACK_METHOD.SPELL) {
        //     const newSpell = this.createSpell(playerActivity);
        //     this.applySpell(newSpell);
        //     this.store.dispatch(addSpell({ spell: newSpell }));
        // }

        // this.store.dispatch(playerMoveCompleted({
        //     ...CharacterNormalizeService.normalizePlayer(this.playerCharacter),
        //     ...CharacterNormalizeService.normalizeCPU(this.cpuCharacter),
        //     addedBeasts: playerActivity.calledBeasts || [],
        //     updatedBeasts: [],
        //     removedBeasts: [],
        // } as IPartyUpdates));
    }

    public CPUIsMoving(): void {
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('CPU is moving');

        // const attack = this.defineCPUAttackVector(this.cpusAvailableAttackVectors);
        // console.log('attack', attack);
        // const cpuActivity = this.realizeAttack(this.cpuCharacter, attack);
        // this.turn.cpuPartyActivities.push(cpuActivity);
        // console.log('cpuActivity', cpuActivity);
        //
        // this.applyPreviousSpellsOf(this.cpuCharacter.id);
        //
        // if (cpuActivity.method === ATTACK_METHOD.HIT) {
        //     this.applyHit(cpuActivity);
        // } else if (cpuActivity.method === ATTACK_METHOD.SPELL) {
        //     const newSpell = this.createSpell(cpuActivity);
        //     this.applySpell(newSpell);
        //     this.store.dispatch(addSpell({ spell: newSpell }));
        // }

        // this.store.dispatch(CPUMoveCompleted({
        //     ...CharacterNormalizeService.normalizePlayer(this.playerCharacter),
        //     ...CharacterNormalizeService.normalizeCPU(this.cpuCharacter),
        //     addedBeasts: cpuActivity.calledBeasts || [],
        //     updatedBeasts: [],
        //     removedBeasts: [],
        // } as IPartyUpdates));
    }

    public playersBeastsAreMoving(): void {
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('Player\'s beasts are moving');

        // const playerBeastActivities = [];
        //
        // for (const playersBeast of this.playersBeasts) {
        //     const playersBeastsAvailableAttackVectors = this.calculateAttackVectors(this.turns, playersBeast, this.cpuParty);
        //     const attack = this.defineCPUAttackVector(playersBeastsAvailableAttackVectors);
        //     const beastActivity = this.realizeAttack(playersBeast, attack);
        //     this.applyPreviousSpellsOf(playersBeast.id);
        //
        //     if (beastActivity.method === ATTACK_METHOD.HIT) {
        //         this.applyHit(beastActivity);
        //     } else if (beastActivity.method === ATTACK_METHOD.SPELL) {
        //         const newSpell = this.createSpell(beastActivity);
        //         this.applySpell(newSpell);
        //         this.store.dispatch(addSpell({ spell: newSpell }));
        //     }
        //
        //     playerBeastActivities.push(beastActivity);
        // }
        //
        // this.turn.playerPartyActivities = [ ...this.turn.playerPartyActivities, ...playerBeastActivities ];

        // this.store.dispatch(playerBeastsMoveCompleted({
        //     ...CharacterNormalizeService.normalizePlayer(this.playerCharacter),
        //     ...CharacterNormalizeService.normalizeCPU(this.cpuCharacter),
        //     addedBeasts: [],
        //     updatedBeasts: [],
        //     removedBeasts: [],
        // } as IPartyUpdates));
    }

    public CPUsBeastsAreMoving(): void {
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('CPU\'s beasts are moving');

        // const cpuBeastActivities = [];
        //
        // for (const cpusBeast of this.cpusBeasts) {
        //     const cpusBeastsAvailableAttackVectors = this.calculateAttackVectors(this.turns, cpusBeast, this.cpuParty);
        //     const attack = this.defineCPUAttackVector(cpusBeastsAvailableAttackVectors);
        //     const beastActivity = this.realizeAttack(cpusBeast, attack);
        //     this.applyPreviousSpellsOf(cpusBeast.id);
        //
        //     if (beastActivity.method === ATTACK_METHOD.HIT) {
        //         this.applyHit(beastActivity);
        //     } else if (beastActivity.method === ATTACK_METHOD.SPELL) {
        //         const newSpell = this.createSpell(beastActivity);
        //         this.applySpell(newSpell);
        //         this.store.dispatch(addSpell({ spell: newSpell }));
        //     }
        //
        //     cpuBeastActivities.push(beastActivity);
        // }
        //
        // this.turn.playerPartyActivities = [ ...this.turn.playerPartyActivities, ...cpuBeastActivities ];

        // this.store.dispatch(CPUsBeastsMoveCompleted({
        //     ...CharacterNormalizeService.normalizePlayer(this.playerCharacter),
        //     ...CharacterNormalizeService.normalizeCPU(this.cpuCharacter),
        //     addedBeasts: [],
        //     updatedBeasts: [],
        //     removedBeasts: [],
        // } as IPartyUpdates));
    }

    public getTurn(): ITurn {
        return this.turn;
    }

    public saveTurn(): void {
        console.log('TURN', this.turn);
        this.store.dispatch(turnCompleted({ turn: this.turn }));
    }

    public initNewTurnOrFinalizeGame(): void {
        if (this.playerCharacter.isAlive && this.cpuCharacter.isAlive) {
            this.initNewTurn();
        } else {
            this.router.navigate(['/result']);
        }
    }
}
