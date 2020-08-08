import { INormalizedBeast, INormalizedCharacter } from './parties.models';
import { IBeast, ICharacter } from '../../classes/characters';

export class CharacterNormalize {
    public static normalize(character: ICharacter | IBeast): INormalizedCharacter | INormalizedBeast {
        if ([ 'player', 'CPU' ].includes(character.status)) {
            return this.normalizeCharacter(character as ICharacter);
        }
        return this.normalizeBeast(character as IBeast);
    }

    public static normalizeCharacter(character: ICharacter): INormalizedCharacter {
        return {
            self: character.self,
            id: character.id,
            status: character.status,
            party: character.party,
            slug: character.slug,
            isAlive: character.isAlive,

            inheritedSelf: character.inheritedData.self,
            inheritedStrength: character.inheritedData.strength,
            inheritedAgility: character.inheritedData.agility,
            inheritedIntellect: character.inheritedData.intellect,
            inheritedStamina: character.inheritedData.stamina,
            inheritedSpells: character.inheritedData.spells,
            inheritedDps: character.inheritedData.dps,
            inheritedHp: character.inheritedData.hp,
            inheritedCrit: character.inheritedData.crit,

            currentSelf: character.currentData.self,
            currentStrength: character.currentData.strength,
            currentAgility: character.currentData.agility,
            currentIntellect: character.currentData.intellect,
            currentStamina: character.currentData.stamina,
            currentSpells: character.currentData.spells,
            currentDps: character.currentData.dps,
            currentHp: character.currentData.hp,
            currentCrit: character.currentData.crit,
        };
    }

    public static normalizeBeast(beast: IBeast): INormalizedBeast {
        return {
            self: beast.self,
            id: beast.id,
            status: beast.status,
            party: beast.party,
            slug: beast.slug,
            isAlive: beast.isAlive,

            inheritedType: beast.inheritedData.type,
            inheritedDps: beast.inheritedData.dps,
            inheritedHp: beast.inheritedData.hp,

            currentType: beast.currentData.type,
            currentDps: beast.currentData.dps,
            currentHp: beast.currentData.hp,
        };
    }
}
