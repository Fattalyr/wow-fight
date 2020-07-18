import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromSettingsReducer from './parties/parties.reducer';
import * as fromBattleReducer from './battle/battle.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PartiesEffects } from './parties/parties.effects';
import { BattleEffects } from './battle/battle.effects';


@NgModule({
    imports: [
        StoreModule.forFeature(fromSettingsReducer.settingsFeatureKey, fromSettingsReducer.reducer),
        StoreModule.forFeature(fromBattleReducer.battleFeatureKey, fromBattleReducer.reducer),
        EffectsModule.forRoot([ PartiesEffects, BattleEffects ]),
    ]
})
export class AppStoreModule {
}
