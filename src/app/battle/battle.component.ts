import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { map, tap, takeUntil, } from 'rxjs/operators';
import {
    selectCPUBeasts,
    selectCPUCharacter,
    selectCPUPartyId,
    selectPlayerBeasts,
    selectPlayerCharacter,
    selectPlayerPartyId,
    selectSettings,
} from '../store/parties/parties.selectors';
import { selectTotalTurns, selectTurns } from '../store/battle/battle.selectors';
import {
    NAMES,
    IPossibleAttack,
    Party,
} from '../models';
import { AttackService } from '../services/attack.service';
import { playerJustHasStartedMove } from '../store/parties/parties.actions';


@Component({
    selector: 'app-battle',
    templateUrl: './battle.component.html',
    styleUrls: ['./battle.component.scss']
})
export class BattleComponent implements OnInit, OnDestroy {

    public names = NAMES;

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

    public playerBeasts$ = this.store.pipe(
        select(selectPlayerBeasts)
    );

    public cpuBeasts$ = this.store.pipe(
        select(selectCPUBeasts)
    );

    public fullState$ = this.store.pipe(
        select(selectSettings)
    );

    public turns$ = this.store.pipe(
        select(selectTurns)
    );

    public total$ = this.store.pipe(
        select(selectTotalTurns)
    );

    public turnNumber: number;

    private destroy$ = new Subject<void>();

    public allEntities: Party = [];

    public playerAttack: IPossibleAttack;

    public form: FormGroup = new FormGroup({
        playerAttacksControl: new FormControl(),
    });

    constructor(
        private store: Store,
        private attackService: AttackService,
    ) { }

    ngOnInit(): void {
        this.attackService
            .characterUpdatesFlow$
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe();

        this.total$
            .pipe(
                map((total: number) => {
                    this.turnNumber = total + 1;
                    return total;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();

        this.form
            .get('playerAttacksControl')
            .valueChanges
            .pipe(
                map(({ value }) => {
                    console.log('value', value);
                    this.playerAttack = value;
                    this.attackService.setPlayerAttack(value);
                    return value;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    public turnRound(): void {
        this.store.dispatch(playerJustHasStartedMove());
    }
}
