#!/usr/bin/env node
// Seat-taker choice + seat-varying Witness beats — Triage A6 proof
// (Steve 2026-10-26, item 495). Player-only path choice + player chooses
// who sits (own character or another villager); the Witness scenario
// varies by seat while its choices, swing meter, and failure rules stay
// the same. Self-pick must match the pre-change text exactly.
//
// Run: node scripts/test-seattaker-gap.js [seed]   (default seed 7;
// run once per seed — never two harnesses in one process)
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const K = require(path.join(ROOT, 'scripts/godpath/lib'));

const SEED = parseInt(process.argv[2] || process.env.SEED || '7', 10);
const store = new Map();
global.localStorage = {
  getItem: k => store.get(String(k)) ?? null,
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: k => store.delete(String(k)),
  key: i => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const G = await K.load({ seed: SEED });
  let s, pg;
  const transcript = [];
  const origSay = G.say, origSysSay = G.sysSay;
  G.say = function (t) { transcript.push(String(t)); try { return origSay && origSay.call(this, t); } catch (e) {} };
  G.sysSay = function (t) { transcript.push(String(t)); try { return origSysSay && origSysSay.call(this, t); } catch (e) {} };

  function fullSeatFixture() {
    G.tbfight = null; G.over = false; G.won = false;
    K.newRun(G);
    s = G.state.scholar; pg = G.progState();
    s.day = 100; s.kcal = 1800; s.health = 100; s.integration = 80;
    s.insideHaven = true; s.monster = null;
    try { G.playerTile().type = 'haven'; } catch (e) {}
    G.state.systemArrived = true; G.state.networkLive = true; G.state.nationalLive = true;
    pg.arc = 4; pg.tableWaiting = true; pg.tableDone = false; pg.table = {};
    pg.sentimentTaught = true; pg.feastSurgeUsed = true;
    pg.crises = { raid: true, illness: true, famine: true };
    // Full seat, from the real fields deedGateReady reads: waves
    // 5/5/4/3/2 distinct fought, 3 contests, 3 crises, stage >= 2,
    // food-thesis deeds, national standing. Nothing here stubs tableSeat.
    const faced = {};
    for (const [w, n] of [[1, 5], [2, 5], [3, 4], [4, 3], [5, 2]]) {
      const ms = G.data.monsters.filter(m => m.wave === w).slice(0, n);
      for (const m of ms) faced[m.id] = w;
    }
    pg.deeds = { wavesFaced: faced, contestsSurvived: 3 };
    transcript.length = 0;
  }
  function witnessLedger() {
    pg.ledger = { might: 2, brokerage: 2, showmanship: 1, embrace: 0, defiance: 1, exposed: 4, unified: 2, fractured: 0, foodShared: 2, foodHoarded: 0, protected: 5, killed: 1, betrayed: 0 };
    G.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
    G.state.village.favorLedger = {};
  }
  function fearedLedger() {
    pg.ledger = { might: 6, brokerage: 1, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 2, fractured: 0, foodShared: 2, foodHoarded: 0, protected: 6, killed: 2, betrayed: 0 };
    G.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
    G.state.village.favorLedger = {};
  }
  const tc = () => G.state.scholar.tableChoices;
  const TT = () => G.tableState();
  // The real Haven seat button handler, extracted from app.js exactly
  // the way test-table-entry.js does it — not a re-implementation.
  function havenSeatButton() {
    const source = K.readSrc('src/js/app.js');
    const handler = source.split('\n').find(l => l.includes("document.querySelectorAll('[data-table-seat]')"));
    if (!handler) throw Error('Missing actual seat binding in app.js');
    const button = {};
    new Function('Game', 'document', 'refresh', handler)(G, { querySelectorAll: () => [button] }, () => {});
    return button;
  }
  // Pick a villager sitter who (a) has ascension notes to voice and
  // (b) shares no first name with the two villagers who would testify
  // about them, so the witness-exclusion check cannot false-positive.
  function pickSitter() {
    const villagers = (G.data.villagers || []).filter(v => v && v.id !== G.villagerId && !v.dead);
    for (const v of villagers) {
      let sc = null;
      try { sc = G.villagerAscensionScore(v.id); } catch (e) {}
      if (!sc || !sc.notes || !sc.notes.length) continue;
      const first = (v.name || '').split(' ')[0];
      const candidates = villagers.filter(x => x.id !== v.id).slice(0, 2).map(x => (x.name || '').split(' ')[0]);
      if (candidates.indexOf(first) >= 0) continue;
      return { vid: v.id, name: v.name, first, notes: sc.notes };
    }
    return null;
  }

  console.log('— seed ' + SEED + ': full-seat fixture is the real gate —');
  fullSeatFixture(); witnessLedger();
  const gate = G.deedGateReady();
  ok(gate && gate.ok === true, 'full seat: deedGateReady reports ok (no stub)', JSON.stringify(gate));
  ok(G.tableSeat().seat === 'full', 'full seat: tableSeat reports full', JSON.stringify(G.tableSeat()));
  ok(G.tablePreview() && G.tablePreview().ready === true, 'full seat: preview ready at Haven');

  console.log('— G1: the Haven button offers the seat-taker choice —');
  const button = havenSeatButton();
  button.onclick();
  const seatOpts = (tc() && tc().options) || [];
  const sitter = pickSitter();
  ok(!!sitter, 'a villager sitter with ascension notes exists', JSON.stringify(sitter));
  ok(seatOpts.some(o => o.id === 'seat:self'), 'choice offers sitting yourself');
  ok(sitter && seatOpts.some(o => o.id === 'seat:' + sitter.vid), 'choice offers the villager sitter');
  ok(seatOpts.length >= 2, 'choice offers more than one sitter', 'options=' + seatOpts.length);
  ok(!TT().tableDone && !TT().endingKey, 'choosing the seat has not locked anything yet');

  console.log('— G4: a sitter choice never chooses a path —');
  G.chooseTableOption('seat:' + sitter.vid);
  ok(TT().seatTaker && TT().seatTaker.id === sitter.vid && TT().seatTaker.self === false, 'sitter recorded before the doors', JSON.stringify(TT().seatTaker));
  ok(TT().path === null && TT().phase === 'paths', 'no path chosen after the sitter choice');
  ok((tc().options || []).every(o => String(o.id).indexOf('path:') === 0), 'doors offered are paths only, for the player to pick');
  const other = (G.data.villagers || []).find(v => v && v.id !== G.villagerId && v.id !== sitter.vid && !v.dead);
  const swap = G.tableChooseSeatTaker(other.id);
  ok(swap.ok === false && TT().seatTaker.id === sitter.vid, 'sitter cannot be swapped once the sitting has begun');

  console.log('— G2: the villager sitter plays the Witness scenario —');
  G.chooseTableOption('path:witness');
  ok(TT().branch === 'light', 'witness light branch (ledger)');
  let prompt = (tc() && tc().prompt) || '';
  ok(prompt.indexOf(sitter.first) >= 0 && prompt.indexOf('reads them now') >= 0, 'V1: opening is read by the sitter', prompt.slice(0, 220));
  ok(prompt.indexOf("you're about to see it") < 0, 'V1: self-voiced opening is gone for a sitter');
  ok(sitter.notes.every(n => prompt.indexOf(n) >= 0), 'V1: sitter standing notes are named', JSON.stringify(sitter.notes));
  G.chooseTableOption('beat:cold');
  prompt = (tc() && tc().prompt) || '';
  ok(prompt.indexOf('argues *' + sitter.first + '*') >= 0, 'V2: the defense argues the sitter', prompt.slice(0, 220));
  const sworn = [...prompt.matchAll(/([A-Z][a-z]+), sworn:/g)].map(m => m[1]);
  ok(sworn.length === 2, 'V2: two witnesses testify', JSON.stringify(sworn));
  ok(sworn.indexOf(sitter.first) < 0, 'V2: the sitter never testifies about themselves', JSON.stringify(sworn));
  G.chooseTableOption('beat:let');
  prompt = (tc() && tc().prompt) || '';
  ok(prompt.indexOf('to ' + sitter.first) >= 0 && prompt.indexOf('NAME YOUR TERMS') >= 0, 'V3: the settlement is offered to the sitter by name', prompt.slice(0, 220));
  G.chooseTableOption('beat:public');
  ok(TT().phase === 'finals', 'witness finals reached with a villager sitter');
  ok(transcript.some(t => t.indexOf('THE SEAT') >= 0 && t.indexOf(sitter.first) >= 0), 'sitting names the villager sitter aloud');

  console.log('— G3: self-pick is byte-identical to the old Witness text —');
  fullSeatFixture(); witnessLedger();
  const r2 = G.tableOfferSeatTaker();
  ok(r2 && r2.choosingSeat === true, 'seat-taker sheet offered on a fresh sitting');
  G.chooseTableOption('seat:self');
  ok(TT().seatTaker && TT().seatTaker.self === true, 'self recorded as the sitter');
  G.chooseTableOption('path:witness');
  prompt = (tc() && tc().prompt) || '';
  ok(prompt.indexOf("you're about to see it. How do you read them?") >= 0, 'self beat 1: original opening unchanged', prompt.slice(0, 220));
  G.chooseTableOption('beat:cold');
  prompt = (tc() && tc().prompt) || '';
  ok(prompt.indexOf('It argues *you*') >= 0, 'self beat 2: original defense framing unchanged');
  G.chooseTableOption('beat:let');
  prompt = (tc() && tc().prompt) || '';
  ok(prompt.indexOf('it offers a private settlement. Justice, or quiet. "NAME YOUR TERMS," it says, "AND WE WILL VANISH INTO THEM."') >= 0, 'self beat 3: original settlement unchanged');
  ok(!transcript.some(t => t.indexOf('THE SEAT') >= 0), 'self sitting adds no sitter line');

  console.log('— G3b: direct tableTakeSeat still commits as the player —');
  fullSeatFixture(); witnessLedger();
  const r3 = G.tableTakeSeat();
  ok(r3.ok === true && pg.tableDone && TT().phase === 'paths', 'direct take-seat commits the doors');
  ok(TT().seatTaker && TT().seatTaker.self === true, 'direct take-seat defaults to the player character');

  console.log('— Feared trial: self stages a real fight, sitter withdraws honestly —');
  fullSeatFixture(); fearedLedger();
  G.tableTakeSeat();
  G.chooseTableOption('path:feared');
  G.chooseTableOption('beat:mercy');
  const trialOpt = (tc().options || []).some(o => o.id === 'beat:trial');
  ok(trialOpt, 'self: trial by combat is offered');
  G.chooseTableOption('beat:trial');
  ok(G.inCombat() && G.tableTrialFight(), 'self: trial stages a real fight');
  try { G.tbEnd('fled'); } catch (e) {}
  fullSeatFixture(); fearedLedger();
  G.tableOfferSeatTaker();
  const sitter2 = pickSitter();
  ok(!!sitter2, 'second sitting: a villager sitter exists');
  G.chooseTableOption('seat:' + sitter2.vid);
  G.chooseTableOption('path:feared');
  G.chooseTableOption('beat:mercy');
  transcript.length = 0;
  G.chooseTableOption('beat:trial');
  ok(!G.inCombat(), 'sitter: no bearer fight is staged in the sitter\'s name');
  ok(transcript.some(t => t.indexOf('TRIAL WITHHELD') >= 0), 'sitter: trial withdrawal is said aloud');
  ok(!(tc().options || []).some(o => o.id === 'beat:trial'), 'sitter: trial door is withdrawn for this walk');
  ok(TT().phase === 'challenge' && TT().beat === 1, 'sitter: calibration continues without the trial');

  console.log('— G1b: dead and away villagers are never offered the seat —');
  fullSeatFixture(); witnessLedger();
  const deadV = (G.data.villagers || []).find(v => v && v.id !== G.villagerId && !v.dead);
  const awayV = (G.data.villagers || []).find(v => v && v.id !== G.villagerId && v.id !== deadV.id && !v.dead);
  deadV.dead = true;
  G.state.village.away = G.state.village.away || {}; G.state.village.away[awayV.id] = true;
  G.tableOfferSeatTaker();
  const opts2 = (tc() && tc().options) || [];
  ok(!opts2.some(o => o.id === 'seat:' + deadV.id), 'dead villager is not offered the seat');
  ok(!opts2.some(o => o.id === 'seat:' + awayV.id), 'away villager is not offered the seat');
  ok(opts2.some(o => o.id === 'seat:self'), 'self is still offered when others are excluded');

  console.log('— G5: no champion or god-raising system was built —');
  const tableSrc = fs.readFileSync(path.join(ROOT, 'src/js/table.js'), 'utf8');
  const witSrc = fs.readFileSync(path.join(ROOT, 'src/js/table-witness.js'), 'utf8');
  const fearedSrc = fs.readFileSync(path.join(ROOT, 'src/js/table-feared.js'), 'utf8');
  ok(!/godRaising|god-raising system|tableRegisterChampion|championSystem/.test(tableSrc + witSrc + fearedSrc), 'no champion/god-raising registry or system in the changed table files');
  ok(!/tableChampion/.test(tableSrc + witSrc + fearedSrc), 'no new tableChampion method (the trial champion is pre-existing, untouched)');

  console.log(`\nseattaker-gap (seed ${SEED}): ${pass} passed, ${fail} failed`);
  if (fail) console.log('failing: ' + failures.join(' | '));
  if (fail) process.exitCode = 1;
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
