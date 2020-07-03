import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromSettingsReducer from './settings/settings.reducer';

@NgModule({
    imports: [
        StoreModule.forFeature(fromSettingsReducer.settingsFeatureKey, fromSettingsReducer.reducer)
    ]
})
export class AppStateModule {
}
