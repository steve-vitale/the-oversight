#!/usr/bin/env node
// test-bufferdepri-b.js — PLENTYDEPRI=2 buffer-aware easing proof
// (sim-bufferdepri-b, 2026-10-23, axis food-economy).
//
// The lever: PLENTYDEPRI=2 = buffer-aware easing. The plenty-depri ease
// STANDS DOWN when the pantry buffer is thin. The engine's plenty definition
// is binary (>4 fresh days; duty-PRODTHROTTLE's own line), so "thin" is read
// from the engine's OWN deep-reserve sensor — pantryDaysEstimate() (whole
// pantry at the measured burn rate) — against the SAME >4 line. No new
// threshold: the design question is documented in the evidence file.
//
// RED (PLENTYDEPRI=0): gate unreachable — production untouched, no voice,
//   no ledger, no state writes (same as the landed PD=1 test's RED).
// GREEN (PLENTYDEPRI=1): easing math + day voice byte-identical to the landed
//   behavior (test-plentydepri-b.js expectations re-asserted here).
// PD=2 buffer-CLEAR (thick buffer): eases EXACTLY like PD=1 — same math,
//   same ledger keys, same voice.
// PD=2 buffer-THIN (fresh plentiful, deep reserve <=4d): NO easing — the
//   villager keeps hauling; the ledger counts the stand-down (standDown +
//   standDownKcal + standDownVids); the day voice speaks the stand-down line
//   ONCE (never silent); own meal untouched; deterministic (no RNG).
// DET-GATE: (a) gate-off (PD=0) full-run legs never engage — no ledger, no
//   plentydepri voice lines; (b) unset == PD=1 byte-identical trajectories
//   (PD=1 is the landed default; the change must not move it); (c) PD=2 ==
//   PD=1 on thick-buffer fixtures at the unit level (the only delta is the
//   buffer gate). At PD=0 the new branch is unreachable by short-circuit on
//   _plentyDepriOn(), so gate-off trajectories cannot diverge from the
//   landed commit; the diff is confined to the gate region (cited in the
//   evidence file).
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

// freshKcal stocked as fresh food; roster of 12 => fallback burn 24000/d.
// 150000 => freshDays 6.25, deep estimate 6  (buffer CLEAR)
// 100000 => freshDays 4.17, deep estimate 4  (buffer THIN: plentiful fresh,
//            deep reserve at/below the same >4 line)
async function fixture(freshKcal) {
  const { Game } = await loadGame({ seed: 9001, mode: 'proof-bufferdepri', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  v.pantry = [];
  if (freshKcal > 0) Game.stockPantry(freshKcal, 'Foraged food');
  return { Game, v };
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

function fp(Game) {
  const st = Game.state || {};
  const s = JSON.stringify(st, (k, v) => (k === 'ms' || k === '_ms' || k === 'pacing' || k === 'lastTs' || k === 'dayMinutes' || k === 'totalMin' ? 0 : v));
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 24);
}

const healthOf = (v, vid) => { const hm = (v.health || {}); return (hm[vid] !== undefined) ? hm[vid] : 100; };

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };

  // ---------- RED: PD=0 — gate unreachable ----------
  {
    process.env.PLENTYDEPRI = '0';
    const { Game, v } = await fixture(150000);
    check('RED fixture plentiful (freshDays>4)', Game.pantryFreshDays() > 4);
    const { vid, person } = villagerOf(Game);
    Game.gritRoll = () => 1.0;
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    const expected = Game.villagerExpectedDaily(person, vid, v);
    const produced = Game.villagerDayProduction(person, vid, v);
    check('RED production untouched', Math.abs(produced - expected) < 1e-9);
    check('RED no voice', lines.length === 0);
    check('RED no ledger', v._plentyDepri === undefined);
    check('RED buffer gate method exists', typeof Game._plentyDepriBufferClear === 'function');
    Game._plentyDepriDayVoice(v);
    check('RED day voice silent gate-off', lines.length === 0);
    check('RED day voice writes no state gate-off', v._plentyDepri === undefined);
    Game.say = oSay;
  }

  // ---------- GREEN: PD=1 unchanged (landed behavior re-asserted) ----------
  {
    process.env.PLENTYDEPRI = '1';
    const { Game, v } = await fixture(150000);
    Game.state.scholar.day = 30;
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
    let easedCount = 0, mathOk = 0;
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      const person = Game.getPerson(id);
      if (!person || person.dead) continue;
      const expected = Game.villagerExpectedDaily(person, id, v);
      const needEst = (person.kcalPerDay || 2000) * (0.7 + 0.3 * healthOf(v, id) / 100);
      const surplus = Math.max(0, expected - needEst);
      const produced = Game.villagerDayProduction(person, id, v);
      if (surplus > 0) {
        const wantEased = needEst + 0.5 * surplus;
        if (Math.abs(produced - wantEased) < 1e-9) mathOk++;
        if (produced >= needEst) mathOk++;
        easedCount++;
      } else {
        if (Math.abs(produced - expected) < 1e-9) mathOk++;
      }
    }
    check('PD1 roster scanned with surplus to ease', easedCount >= 3);
    check('PD1 surplus halved exactly, own-meal floor intact', mathOk === 2 * easedCount + ((v.roster || []).length - 1 - easedCount));
    const lg = v._plentyDepri;
    check('PD1 ledger has no stand-down keys', lg && lg.days[day] && lg.days[day].standDown === undefined && lg.days[day].standDownVids === undefined);
    Game._plentyDepriDayVoice(v);
    check('PD1 day voice fired exactly once (ease voice)', lines.length === 1);
    check('PD1 voice names the easing, not the buffer', !/stores behind are thin|back shelves fill|deep pantry needs feeding|thin tomorrow/.test(lines[0]));
    Game.say = oSay;
  }

  // ---------- PD=2 buffer-CLEAR: eases exactly like PD=1 ----------
  {
    process.env.PLENTYDEPRI = '2';
    const { Game, v } = await fixture(150000);
    Game.state.scholar.day = 30;
    const day = 30;
    v.pantry = [];
    Game.stockPantry(150000, 'Foraged food');
    check('PD2-CLEAR fixture plentiful', Game.pantryFreshDays() > 4);
    check('PD2-CLEAR buffer reads clear (deep>4)', Game.pantryDaysEstimate() > 4);
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
    let easedCount = 0, mathOk = 0, easedKcal = 0;
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      const person = Game.getPerson(id);
      if (!person || person.dead) continue;
      const expected = Game.villagerExpectedDaily(person, id, v);
      const needEst = (person.kcalPerDay || 2000) * (0.7 + 0.3 * healthOf(v, id) / 100);
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
    check('PD2-CLEAR eased exactly like PD=1', easedCount >= 3 && mathOk === 2 * easedCount + ((v.roster || []).length - 1 - easedCount));
    const lg = v._plentyDepri;
    check('PD2-CLEAR ledger depri count matches', lg && lg.days[day] && lg.days[day].depri === easedCount);
    check('PD2-CLEAR ledger kcal matches', lg && Math.abs(lg.days[day].kcal - easedKcal) < 1e-9);
    check('PD2-CLEAR no stand-down recorded', lg && (lg.days[day].standDown || 0) === 0);
    Game._plentyDepriDayVoice(v);
    check('PD2-CLEAR day voice fired exactly once (ease voice)', lines.length === 1);
    Game.say = oSay;
  }

  // ---------- PD=2 buffer-THIN: stand-down, ledger, voice (RED->GREEN) ----------
  {
    process.env.PLENTYDEPRI = '2';
    const { Game, v } = await fixture(100000);
    Game.state.scholar.day = 30;
    const day = 30;
    v.pantry = [];
    Game.stockPantry(100000, 'Foraged food');
    check('PD2-THIN fixture plentiful (freshDays>4)', Game.pantryFreshDays() > 4);
    check('PD2-THIN buffer reads thin (deep<=4, same >4 line)', Game.pantryDaysEstimate() <= 4);
    check('PD2-THIN sensor alone would ease (prodThrottleEngaged)', Game.prodThrottleEngaged() === true);
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
    let stoodCount = 0, mathOk = 0, stoodKcal = 0;
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      const person = Game.getPerson(id);
      if (!person || person.dead) continue;
      const expected = Game.villagerExpectedDaily(person, id, v);
      const needEst = (person.kcalPerDay || 2000) * (0.7 + 0.3 * healthOf(v, id) / 100);
      const surplus = Math.max(0, expected - needEst);
      const produced = Game.villagerDayProduction(person, id, v);
      if (surplus > 0) {
        if (Math.abs(produced - expected) < 1e-9) mathOk++; // kept hauling: full production
        if (produced >= needEst) mathOk++;
        stoodCount++; stoodKcal += (expected - (needEst + 0.5 * surplus));
      } else {
        if (Math.abs(produced - expected) < 1e-9) mathOk++;
      }
    }
    check('PD2-THIN roster scanned with surplus at stake', stoodCount >= 3);
    check('PD2-THIN no easing: production untouched, own-meal floor intact', mathOk === 2 * stoodCount + ((v.roster || []).length - 1 - stoodCount));
    check('PD2-THIN production alone voices nothing (day-level voice)', lines.length === 0);
    const lg = v._plentyDepri;
    check('PD2-THIN ledger counted every stand-down', lg && lg.days[day] && lg.days[day].standDown === stoodCount);
    check('PD2-THIN ledger stand-down kcal = would-be-eased', lg && Math.abs((lg.days[day].standDownKcal || 0) - stoodKcal) < 1e-9);
    check('PD2-THIN ledger stand-down vids recorded', lg && (lg.days[day].standDownVids || []).length === stoodCount);
    check('PD2-THIN ledger eased side empty', lg && (lg.days[day].depri || 0) === 0);
    Game._plentyDepriDayVoice(v);
    check('PD2-THIN stand-down voice fired exactly once', lines.length === 1);
    check('PD2-THIN voice names the thin buffer', /stores behind are thin|back shelves fill|deep pantry needs feeding|thin tomorrow/.test(lines[0]));
    check('PD2-THIN voice is a keep-hauling choice', /keep hauling|doesn.t rest|haul until|Keep bringing it in/.test(lines[0]));
    const spk = (l) => { const m = /^🍽️ (\S+)/.exec(l || ''); return m ? m[1] : '?'; };
    const spk1 = spk(lines[0]);
    Game._plentyDepriDayVoice(v);
    check('PD2-THIN stand-down voice idempotent', lines.length === 1);
    // next day: voices again (rotation guard per-day)
    Game.state.scholar.day = day + 1;
    for (const id of (v.roster || [])) {
      if (id === Game.villagerId) continue;
      const person = Game.getPerson(id);
      if (!person || person.dead) continue;
      Game.villagerDayProduction(person, id, v);
    }
    Game._plentyDepriDayVoice(v);
    check('PD2-THIN voices again next day', lines.length === 2);
    check('PD2-THIN speaker is a real villager', spk1 !== '?' && spk1 !== 'Someone');
    Game.say = oSay;
  }

  // ---------- PD=2 invariants carried over ----------
  {
    process.env.PLENTYDEPRI = '2';
    const { Game, v } = await fixture(150000);
    Game.progState().hungryStreak = 3;
    const { vid, person } = villagerOf(Game);
    Game.gritRoll = () => 1.0;
    const lines = []; Game.say = (s) => { lines.push(String(s)); };
    const expected = Game.villagerExpectedDaily(person, vid, v);
    const produced = Game.villagerDayProduction(person, vid, v);
    check('PD2 hunger-stretch: no easing, no stand-down', Math.abs(produced - expected) < 1e-9 && v._plentyDepri === undefined);
    Game.progState().hungryStreak = 0;
  }
  {
    process.env.PLENTYDEPRI = '2';
    const { Game, v } = await fixture(0);
    check('PD2 fixture lean', Game.pantryFreshDays() <= 4);
    const { vid, person } = villagerOf(Game);
    Game.gritRoll = () => 1.0;
    const expected = Game.villagerExpectedDaily(person, vid, v);
    const produced = Game.villagerDayProduction(person, vid, v);
    check('PD2 lean pantry: untouched, silent, no ledger', Math.abs(produced - expected) < 1e-9 && v._plentyDepri === undefined);
  }
  {
    process.env.PLENTYDEPRI = '2';
    const { Game, v } = await fixture(150000);
    const { vid, person } = villagerOf(Game);
    Game.gritRoll = () => 1.0;
    Game.say = () => {};
    const a = Game.villagerDayProduction(person, vid, v);
    const b = Game.villagerDayProduction(person, vid, v);
    check('PD2 deterministic (no RNG in path)', a === b);
  }

  // ---------- DET-GATE: full-run trajectories ----------
  async function runFp(envVal, seed) {
    if (envVal === 'UNSET') delete process.env.PLENTYDEPRI; else process.env.PLENTYDEPRI = envVal;
    const { Game } = await loadGame({ seed, mode: 'detgate-bufferdepri', fullTelemetry: false });
    await setupGame(Game);
    await runDays(Game, Object.assign({}, leadfeast), { days: 40, manifest: null });
    const v = Game.state.village || {};
    const lg = v._plentyDepri;
    const engaged = lg ? Object.values(lg.days || {}).reduce((t, d) => t + (d.depri || 0), 0) : 0;
    return fp(Game) + ':engaged=' + engaged + ':ledger=' + (lg ? 'yes' : 'no');
  }
  {
    const a = await runFp('0', 9001), b = await runFp('0', 9002);
    const c = await runFp('0', 9001);
    check('DETGATE PD=0 deterministic across runs', a === c);
    check('DETGATE PD=0 ledger absent (gate-off legs never engage)', /ledger=no/.test(a) && /ledger=no/.test(b));
    const u1 = await runFp('UNSET', 9003), p1 = await runFp('1', 9003);
    check('DETGATE unset == PD=1 byte-identical (PD=1 is the landed default)', u1 === p1);
    const t1 = await runFp('2', 9004), t2 = await runFp('2', 9004);
    check('DETGATE PD=2 deterministic across runs', t1 === t2);
  }

  delete process.env.PLENTYDEPRI;
  console.log(fail === 0 ? 'ALL GREEN' : fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
