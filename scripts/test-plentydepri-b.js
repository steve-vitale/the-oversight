#!/usr/bin/env node
// test-plentydepri-b.js — PLENTYDEPRI proof test (sim-plentydepri-b, 2026-10-21).
//
// Steve's ruling (DECISIONS.md 2026-10-21): SURPLUSFEED's post-hoc share trim
// is REMOVED; the replacement is behavioral and bottom-up — villagers
// deprioritize PRODUCTION at the production decision itself when food is
// plentiful (>4 fresh days, the same plenty definition the duty PRODTHROTTLE
// reads), never a post-hoc trim on the share.
//
// RED (PLENTYDEPRI=0): villagerDayProduction is byte-identical to base —
// surplus untouched, no voice, no ledger, no state writes.
// GREEN (PLENTYDEPRI=1, plentiful pantry): the villager eases off the surplus
// push (produced = needEst + 0.5*(surplus)), their own meal can never shrink
// (eased >= needEst >= real need by construction), the beat voices ONCE per
// day (FOODVOICE2 pattern), and the ledger counts every eased decision.
// Invariants: hungryStreak >= 3 stands the easing down (never into a hunger
// stretch); lean pantry (<=4 fresh days) never eases; no surplus (bad grit
// day) never eases; deterministic — no RNG in the path.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function fixture(freshKcal) {
  const { Game } = await loadGame({ seed: 9001, mode: 'proof-plentydepri', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  v.pantry = [];
  // fresh pile big enough to push pantryFreshDays() well past 4
  if (freshKcal > 0) Game.stockPantry(freshKcal, 'Foraged food');
  const day = (Game.state.scholar || {}).day || 0;
  return { Game, v, day };
}

function villagerOf(Game) {
  const v = Game.state.village;
  for (const id of (v.roster || [])) {
    if (id === Game.villagerId) continue;
    const p = Game.getPerson(id);
    if (p && !p.dead) return { vid: id, person: p };
  }
  throw new Error('no living villager');
}

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };

  // ---------- RED: gate OFF = pure delegation ----------
  {
    process.env.PLENTYDEPRI = '0';
    const { Game, v, day } = await fixture(150000);
    check('RED fixture plentiful (freshDays>4)', Game.pantryFreshDays() > 4);
    check('RED throttle predicate true', Game.prodThrottleEngaged() === true);
    const { vid, person } = villagerOf(Game);
    Game.gritRoll = () => 1.0; // pin the day's grit — deterministic comparison
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    const expected = Game.villagerExpectedDaily(person, vid, v);
    const produced = Game.villagerDayProduction(person, vid, v);
    check('RED production untouched', Math.abs(produced - expected) < 1e-9);
    check('RED no voice', lines.length === 0);
    check('RED no ledger', v._plentyDepri === undefined);
    Game._plentyDepriDayVoice(v);
    check('RED day voice silent gate-off', lines.length === 0);
    check('RED day voice writes no state gate-off', v._plentyDepri === undefined);
    Game.say = oSay;
  }

  // ---------- GREEN: gate ON, plentiful ----------
  {
    process.env.PLENTYDEPRI = '1';
    const fx = await fixture(0); // stock AFTER the day jump — day-1 stacks spoil at day 30
    const Game = fx.Game, v = fx.v;
    Game.state.scholar.day = 30; // settled village: stranger curve saturated
    const day = 30;
    v.pantry = [];
    Game.stockPantry(150000, 'Foraged food');
    const plants = (Game.data.plants || []).slice(0, 8).map(p => p.id);
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      const person = Game.getPerson(id);
      if (!person || person.dead) continue;
      for (const pid of plants) {
        try { Game.villagerLearnsPlant && Game.villagerLearnsPlant(id, pid, 'working'); } catch (e) {}
      }
    }
    Game.gritRoll = () => 1.0;
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    const healthOf = (vid) => {
      const hm = (v.health || {});
      return (hm[vid] !== undefined) ? hm[vid] : 100;
    };
    let easedCount = 0, easedKcal = 0, mathOk = 0;
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      const person = Game.getPerson(id);
      if (!person || person.dead) continue;
      const expected = Game.villagerExpectedDaily(person, id, v);
      const needEst = (person.kcalPerDay || 2000) * (0.7 + 0.3 * healthOf(id) / 100);
      const surplus = Math.max(0, expected - needEst);
      const produced = Game.villagerDayProduction(person, id, v);
      if (surplus > 0) {
        const wantEased = needEst + 0.5 * surplus;
        if (Math.abs(produced - wantEased) < 1e-9) mathOk++;
        if (produced >= needEst) mathOk++;
        easedCount++; easedKcal += (expected - wantEased);
      } else {
        if (Math.abs(produced - expected) < 1e-9) mathOk++;
      }
    }
    check('GREEN roster scanned with surplus to ease', easedCount >= 3);
    check('GREEN surplus halved exactly, own-meal floor intact', mathOk === 2 * easedCount + ((v.roster || []).length - 1 - easedCount));
    check('GREEN production alone voices nothing (voice is day-level)', lines.length === 0);
    // day-level voice: one line after the meal loop, rotating speaker
    Game._plentyDepriDayVoice(v);
    check('GREEN day voice fired exactly once', lines.length === 1);
    check('GREEN voice names the easing', /No point hauling what'll rot|full to bursting|can't take more|wild standing|eating well|Full shelves|Plenty for days|going hungry this week|wild can rest|eat before it turns|Look at all this|^🍽️ \S+ Enough\./.test(lines[0]));
    check('GREEN voice is a choice, not a trim', /Mending the nets|Patching the boots|sitting with the elders|Hauling water|Sharpening the skinning knives|Mending the palisade|Teaching the kids snares|Sitting with the fever cases|Splitting firewood|Rendering fat|Tending the fire|Carving bowls/.test(lines[0]));
    const speakerOf = (l) => { const m = /^🍽️ (\S+)/.exec(l || ''); return m ? m[1] : '?'; };
    const spk1 = speakerOf(lines[0]);
    Game._plentyDepriDayVoice(v); // idempotent: still one line
    check('GREEN day voice idempotent', lines.length === 1);
    const lg = v._plentyDepri;
    check('GREEN ledger counted every eased decision', lg && lg.days[day] && lg.days[day].depri === easedCount);
    check('GREEN ledger kcal = eased-off surplus', lg && Math.abs(lg.days[day].kcal - easedKcal) < 1e-9);
    // next day: voices again, different speaker (day-keyed rotation)
    Game.state.scholar.day = day + 1;
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      const person = Game.getPerson(id);
      if (!person || person.dead) continue;
      Game.villagerDayProduction(person, id, v);
    }
    Game._plentyDepriDayVoice(v);
    check('GREEN voices again next day', lines.length === 2);
    const spk2 = speakerOf(lines[1]);
    check('GREEN speaker rotates across days', spk1 !== '?' && spk2 !== '?' && spk1 !== spk2);
    check('GREEN second day ledger separate', lg.days[day + 1] && lg.days[day + 1].depri === easedCount);
    Game.say = oSay;
  }

  // ---------- INVARIANTS ----------
  // hunger stretch stands the easing down
  {
    process.env.PLENTYDEPRI = '1';
    const { Game, v } = await fixture(150000);
    Game.progState().hungryStreak = 3;
    const { vid, person } = villagerOf(Game);
    Game.gritRoll = () => 1.0;
    const lines = []; Game.say = (s) => { lines.push(String(s)); };
    const expected = Game.villagerExpectedDaily(person, vid, v);
    const produced = Game.villagerDayProduction(person, vid, v);
    check('INVARIANT hunger-stretch: no easing', Math.abs(produced - expected) < 1e-9);
    check('INVARIANT hunger-stretch: silent', lines.length === 0);
    Game._plentyDepriDayVoice(v);
    check('INVARIANT hunger-stretch: day voice silent', lines.length === 0);
    Game.progState().hungryStreak = 0;
  }
  // lean pantry never eases
  {
    process.env.PLENTYDEPRI = '1';
    const { Game, v } = await fixture(0);
    check('INVARIANT fixture lean (freshDays<=4)', Game.pantryFreshDays() <= 4);
    const { vid, person } = villagerOf(Game);
    Game.gritRoll = () => 1.0;
    const lines = []; Game.say = (s) => { lines.push(String(s)); };
    const expected = Game.villagerExpectedDaily(person, vid, v);
    const produced = Game.villagerDayProduction(person, vid, v);
    check('INVARIANT lean pantry: no easing', Math.abs(produced - expected) < 1e-9);
    check('INVARIANT lean pantry: silent', lines.length === 0);
  }
  // no surplus (bad day): nothing to ease
  {
    process.env.PLENTYDEPRI = '1';
    const { Game, v } = await fixture(150000);
    const { vid, person } = villagerOf(Game);
    person.kcalPerDay = 200000; // own need dwarfs any haul
    Game.gritRoll = () => 1.0;
    const lines = []; Game.say = (s) => { lines.push(String(s)); };
    const expected = Game.villagerExpectedDaily(person, vid, v);
    const produced = Game.villagerDayProduction(person, vid, v);
    check('INVARIANT no-surplus: no easing', Math.abs(produced - expected) < 1e-9);
    check('INVARIANT no-surplus: silent', lines.length === 0);
  }
  // determinism: two armed calls on identical state agree exactly
  {
    process.env.PLENTYDEPRI = '1';
    const { Game, v } = await fixture(150000);
    const { vid, person } = villagerOf(Game);
    Game.gritRoll = () => 1.0;
    Game.say = () => {};
    const a = Game.villagerDayProduction(person, vid, v);
    const b = Game.villagerDayProduction(person, vid, v);
    check('INVARIANT deterministic (no RNG in path)', a === b);
  }

  delete process.env.PLENTYDEPRI;
  console.log(fail === 0 ? 'ALL GREEN' : fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
