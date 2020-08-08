import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromSettingsReducer from './_parties/parties.reducer';
import * as fromBattleReducer from './battle/battle.reducer';
import * as fromSpellsReducer from './spells/spells.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PartiesEffects } from './_parties/parties.effects';
import { BattleEffects } from './battle/battle.effects';


@NgModule({
    imports: [
        StoreModule.forFeature(fromSettingsReducer.settingsFeatureKey, fromSettingsReducer.reducer),
        StoreModule.forFeature(fromBattleReducer.battleFeatureKey, fromBattleReducer.reducer),
        StoreModule.forFeature(fromSpellsReducer.spellsFeatureKey, fromSpellsReducer.reducer),
        EffectsModule.forRoot([ PartiesEffects, BattleEffects ]),
    ]
})
export class AppStoreModule {
}
