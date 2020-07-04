import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromSettingsReducer from './settings/settings.reducer';
import * as fromBattleReducer from './battle/battle.reducer';

@NgModule({
    imports: [
        StoreModule.forFeature(fromSettingsReducer.settingsFeatureKey, fromSettingsReducer.reducer),
        StoreModule.forFeature(fromBattleReducer.battleFeatureKey, fromBattleReducer.reducer),
    ]
})
export class AppStateModule {
}
