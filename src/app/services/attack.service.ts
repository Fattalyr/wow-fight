import { Injectable } from '@angular/core';
import {
    SPELLS,
    IAvailableAttackVectors,
    IPossibleAttack,
    ISpellAttackResult,
    ITUpdatedParties,
    Party,
    Vector,
} from '../models';
import { ITurn, ITurnActivity } from '../store/battle/battle.reducer';
import { createBeast, ICharacter } from '../classes/characters';

@Injectable({
    providedIn: 'root'
})
export class AttackService {
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
}
