import { Injectable } from '@angular/core';
import { IAvailableAttackVectors, IPossibleAttack } from '../models';

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
}
