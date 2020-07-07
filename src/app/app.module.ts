import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartComponent } from './start/start.component';
import { AppStateModule } from './store/app-state.module';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { BattleComponent } from './battle/battle.component';
import { AttackComponent } from './attack/attack.component';
import { RoundPipe } from './pipes/round.pipe';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    BattleComponent,
    AttackComponent,
    RoundPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatButtonModule,
    StoreModule.forRoot({}, {}),
    StoreDevtoolsModule.instrument({ maxAge: 50, logOnly: environment.production }),

    AppStateModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
