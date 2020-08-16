import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromPartiesReducer from './parties/parties.reducer';
import * as fromBattleReducer from './battle/battle.reducer';
import * as fromSpellsReducer from './spells/spells.reducer';
import { PartiesEffects } from './parties/parties.effects';
import { BattleEffects } from './battle/battle.effects';


@NgModule({
    imports: [
        StoreModule.forFeature(fromPartiesReducer.partiesFeatureKey, fromPartiesReducer.reducer),
        StoreModule.forFeature(fromBattleReducer.battleFeatureKey, fromBattleReducer.reducer),
        StoreModule.forFeature(fromSpellsReducer.spellsFeatureKey, fromSpellsReducer.reducer),
        EffectsModule.forRoot([ PartiesEffects, BattleEffects ]),
    ]
})
export class AppStoreModule {
}
