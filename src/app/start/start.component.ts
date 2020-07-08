import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    selectSettings,
    selectPlayerCharacter,
    selectCPUCharacter,
    selectPlayerPartyId,
    selectCPUPartyId,
} from '../store/settings/settings.selectors';
import { toggleCharacters } from '../store/settings/settings.actions';
import { NAMES } from '../models';


@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {

    public names = NAMES;

    public form: FormGroup = new FormGroup({
        roundDuration: new FormControl(),
    });

    public playerCharacter$ = this.store.pipe(
        select(selectPlayerCharacter)
    );

    public cpuCharacter$ = this.store.pipe(
        select(selectCPUCharacter)
    );

    public playerPartyId$ = this.store.pipe(
        select(selectPlayerPartyId)
    );

    public cpuPartyId$ = this.store.pipe(
        select(selectCPUPartyId)
    );

    public fullState$ = this.store.pipe(
        select(selectSettings)
    );

    public playerCharacterName: NAMES;

    private destroy$ = new Subject<void>();

    constructor(
        private store: Store,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.playerCharacter$
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    public updatePlayerCharacter(name: NAMES): void {
        if (name !== this.playerCharacterName) {
            this.store.dispatch(toggleCharacters());
        }
        this.playerCharacterName = name;
    }

    public navigateToBattle(): void {
        this.router.navigate([ 'battle' ]);
    }

}
