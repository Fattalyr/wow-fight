export enum NAMES {
    GULDAN = 'Гул\'Дан',
    NERZHUL = 'Нер\'Зул',
}

export const FIGHTERS_START_DATA = {
    [NAMES.GULDAN]: {
        strength: 30,
        agility: 20,
        intellect: 150,
        stamina: 120,
    },
    [NAMES.NERZHUL]: {
        strength: 40,
        agility: 50,
        intellect: 120,
        stamina: 160,
    },
};

export const multipliers = {
    strength: {
        dps: 1.5,
        hp: 2,
        crit: 0,
    },
    agility: {
        dps: 1,
        hp: 0,
        crit: 0.002,
    },
    intellect: {
        dps: 1,
        hp: 0,
        crit: 0.0005,
    },
    stamina: {
        dps: 0,
        hp: 10,
        crit: 0,
    },
};
