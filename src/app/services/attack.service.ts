import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import deepUnfreeze from 'deep-unfreeze';
import {
    CraftedSpells,
    IAvailableAttackVectors,
    IPossibleAttack,
    ISpell,
    Party,
    SPELLS,
} from '../models';
import { IActivity, ITurn, } from '../store/battle/battle.reducer';
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
import {
    addBeast,
    packageOfUpdates,
    updateCPUCharacter,
    updatePlayerCharacter,
} from '../store/settings/settings.actions';
import { ATTACK_METHOD } from '../constants/constants';


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
    public playersAvailableAttackVectors: IAvailableAttackVectors;
    public cpusAvailableAttackVectors: IAvailableAttackVectors;
    private turns$ = this.store.pipe(select(selectTurns));
    public playerAttacks: IPossibleAttack;
    public cpuAttacks: IPossibleAttack;
    public roundNumber: number;

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
                this.playersAvailableAttackVectors = this.calculateAttackVectors(this.turns, this.playerCharacter, this.cpuParty);
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

        if (method === ATTACK_METHOD.HIT) {
            resultActivity.damage = character.currentData.dps * (critFired ? 1.5 : 1);
        } else if (method === ATTACK_METHOD.SPELL && attack?.spell?.HPDelta) {
            resultActivity.spell = attack.spell;
            resultActivity.damage = attack.spell.HPDelta;
        } else if (method === ATTACK_METHOD.SPELL && attack?.spell?.callBeast) {
            resultActivity.spell = attack.spell;
            resultActivity.calledBeasts = [ createBeast(attack.spell.calledBeast.type, character.party) ];
        }

        return resultActivity;
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

    public applyActivity({
        assaulterId,
        targetId,
        method,
        spell,
        damage,
        critFired,
        calledBeasts
    }: IActivity): void {
        const all = this.allEntities;
        const assaulter = all.find(entity => entity.id === assaulterId);
        const defending = all.find(entity => entity.id === targetId);

        if (method === ATTACK_METHOD.HIT) {
            defending.currentData.hp -= damage;
        } else if (method === ATTACK_METHOD.SPELL) {
            assaulter.castedSpells[spell.spellName] = spell.coolDown;
            defending.castedSpells[spell.spellName] = spell.duration;

            if (spell.reduceHP) {
                const diff = defending.currentData.hp - damage;
                const resultIsHigherZero = diff >= 0;
                defending.currentData.hp = resultIsHigherZero
                    ? diff
                    : 0;
                if (!resultIsHigherZero) {
                    defending.isAlive = false;
                }
            } else if (spell.addHP) {
                const diff = defending.currentData.hp + damage;
                const resultIsLowerMax = diff <= defending.inheritedData.hp;
                defending.currentData.hp = resultIsLowerMax
                    ? diff
                    : defending.inheritedData.hp;
            }

            if (spell.calledBeast) {
                for (const beast of calledBeasts) {
                    if (beast.party === this.playerCharacter.party) {
                        this.playersBeasts = [ ...this.playersBeasts, beast ];
                    } else {
                        this.cpusBeasts = [ ...this.cpusBeasts, beast ];
                    }
                }
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

        const playerActivity = this.realizeAttack(this.playerCharacter, this.playerAttacks);
        console.log('playerActivity', playerActivity);
        this.turn.playerPartyActivities.push(playerActivity);
        this.applyActivity(playerActivity);

        this.store.dispatch(packageOfUpdates({
            data: JSON.stringify({
                playerCharacter: this.playerCharacter,
                cpuCharacter: this.cpuCharacter,
                addedBeasts: playerActivity.calledBeasts,
                updatedBeasts: [],
                removedBeasts: [],
            })
        }));
    }

    public CPUIsMoving(): void {
        console.log(' ');
        console.log('======================');
        console.log(' ');
        console.log('CPU is moving');

        this.defineCPUAttackVector();
        const cpuActivity = this.realizeAttack(this.cpuCharacter, this.playerAttacks);
        console.log('cpuActivity', cpuActivity);
        this.turn.cpuPartyActivities.push(cpuActivity);
        this.applyActivity(cpuActivity);

        this.store.dispatch(packageOfUpdates({
            data: JSON.stringify({
                playerCharacter: JSON.stringify(this.playerCharacter),
                cpuCharacter: JSON.stringify(this.cpuCharacter),
                addedBeasts: cpuActivity.calledBeasts,
                updatedBeasts: [],
                removedBeasts: [],
            })
        }));
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

    public getTurn(): ITurn {
        return this.turn;
    }
}
