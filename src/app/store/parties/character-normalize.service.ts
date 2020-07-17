import { Injectable } from '@angular/core';
import {
    ICharacter,
    IBeast,
    INormalizedPlayer,
    NORMALIZATION_MAP,
    INormalizedCPU,
} from '../../classes/characters';
import { ICharacterData } from '../../models';
import { IPartyState } from './parties.models';

@Injectable({
    providedIn: 'root'
})
export class CharacterNormalizeService {
    public static normalizePlayer(character: ICharacter): INormalizedPlayer {
        return {
            playerSelf: character.self,
            playerId: character.id,
            playerParty: character.party,
            playerSlug: character.slug,
            playerSpellbound: character.spellbound,
            playerCastedSpells: character.castedSpells,
            playerIsAlive: character.isAlive,
            playerInheritedSelf: character.inheritedData.self,
            playerInheritedStrength: character.inheritedData.strength,
            playerInheritedAgility: character.inheritedData.agility,
            playerInheritedIntellect: character.inheritedData.intellect,
            playerInheritedStamina: character.inheritedData.stamina,
            playerInheritedSpells: character.inheritedData.spells,
            playerInheritedDps: character.inheritedData.dps,
            playerInheritedHp: character.inheritedData.hp,
            playerInheritedCrit: character.inheritedData.crit,
            playerCurrentSelf: character.currentData.self,
            playerCurrentStrength: character.currentData.strength,
            playerCurrentAgility: character.currentData.agility,
            playerCurrentIntellect: character.currentData.intellect,
            playerCurrentStamina: character.currentData.stamina,
            playerCurrentSpells: character.currentData.spells,
            playerCurrentDps: character.currentData.dps,
            playerCurrentHp: character.currentData.hp,
            playerCurrentCrit: character.currentData.crit,
        };
    }

    public static normalizeCPU(character: ICharacter): INormalizedCPU {
        return {
            cpuSelf: character.self,
            cpuId: character.id,
            cpuParty: character.party,
            cpuSlug: character.slug,
            cpuSpellbound: character.spellbound,
            cpuCastedSpells: character.castedSpells,
            cpuIsAlive: character.isAlive,
            cpuInheritedSelf: character.inheritedData.self,
            cpuInheritedStrength: character.inheritedData.strength,
            cpuInheritedAgility: character.inheritedData.agility,
            cpuInheritedIntellect: character.inheritedData.intellect,
            cpuInheritedStamina: character.inheritedData.stamina,
            cpuInheritedSpells: character.inheritedData.spells,
            cpuInheritedDps: character.inheritedData.dps,
            cpuInheritedHp: character.inheritedData.hp,
            cpuInheritedCrit: character.inheritedData.crit,
            cpuCurrentSelf: character.currentData.self,
            cpuCurrentStrength: character.currentData.strength,
            cpuCurrentAgility: character.currentData.agility,
            cpuCurrentIntellect: character.currentData.intellect,
            cpuCurrentStamina: character.currentData.stamina,
            cpuCurrentSpells: character.currentData.spells,
            cpuCurrentDps: character.currentData.dps,
            cpuCurrentHp: character.currentData.hp,
            cpuCurrentCrit: character.currentData.crit,
        };
    }

    public static deNormalize(data: INormalizedPlayer | INormalizedCPU | IPartyState, map: NORMALIZATION_MAP): ICharacter {
        const inheritedData: ICharacterData = {
            self: data[map + 'InheritedSelf'],
            strength: data[map + 'InheritedStrength'],
            agility: data[map + 'InheritedAgility'],
            intellect: data[map + 'InheritedIntellect'],
            stamina: data[map + 'InheritedStamina'],
            spells: data[map + 'InheritedSpells'],
            dps: data[map + 'InheritedDps'],
            hp: data[map + 'InheritedHp'],
            crit: data[map + 'InheritedCrit'],
        };
        const currentData: ICharacterData = {
            self: data[map + 'CurrentSelf'],
            strength: data[map + 'CurrentStrength'],
            agility: data[map + 'CurrentAgility'],
            intellect: data[map + 'CurrentIntellect'],
            stamina: data[map + 'CurrentStamina'],
            spells: data[map + 'CurrentSpells'],
            dps: data[map + 'CurrentDps'],
            hp: data[map + 'CurrentHp'],
            crit: data[map + 'CurrentCrit'],
        };

        return {
            self: data[map + 'Self'],
            id: data[map + 'Id'],
            party: data[map + 'Party'],
            slug: data[map + 'Slug'],
            spellbound: data[map + 'Spellbound'],
            castedSpells: data[map + 'CastedSpells'],
            isAlive: data[map + 'IsAlive'],
            currentData,
            inheritedData,
        };
    }
}
