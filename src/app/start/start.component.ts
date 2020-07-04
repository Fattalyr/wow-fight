import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectRoundDuration, selectUserCharacter, selectSettings } from '../store/settings/settings.selectors';
import { updateRoundDuration, updateUserCharacter } from '../store/settings/settings.actions';
import { NAMES } from '../constants/constants';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  public names = NAMES;

  public roundDurationValues = [ 3, 5, 10 ];

  public form: FormGroup = new FormGroup({
      roundDuration: new FormControl(),
  });

  public roundDuration$ = this.store.pipe(
      select(selectRoundDuration)
  );

  public userCharacter$ = this.store.pipe(
      select(selectUserCharacter)
  );

  public fullState$ = this.store.pipe(
      select(selectSettings)
  );

  constructor(
      private store: Store,
      private router: Router,
  ) { }

  ngOnInit(): void {
      this.form.controls.roundDuration.valueChanges.subscribe(roundDuration =>
          this.store.dispatch(updateRoundDuration({ roundDuration }))
      );
  }

  public updateUserCharacter(name: NAMES): void {
      this.store.dispatch(updateUserCharacter({ userCharacter: name }));
  }

  public navigateToBattle(): void {
      this.router.navigate([ 'battle' ]);
  }

}
