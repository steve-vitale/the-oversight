#!/usr/bin/env node
// scripts/sweep-witnesource-20261017.js — exposure-source pilot sweep
// (arm sim-witnesource, 2026-10-17).
//
// 8 FRESH seeds x {leadfeast, belongfeast} x {armed, control} = 32 runs,
// 180d death-aware (win truncates ~d90), identical-seed armed/control pairs.
// SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT, TAKESEAT=1, MODALPLAY=1
// (both arms sit via takeseat AND answer the modal — the winning road, so
// the table is reached and the witness door can be offered).
// ARMED: EXPOSURE unset (default ON — the layer). CONTROL: EXPOSURE=0.
// SWEEP STOP on substrate mismatch.
//
// PRE-REGISTERED (evidence/2026-10-17/sim-witnesource.md header — binding):
//   PRIMARY = runs with ledger.exposed >= 3 (bar armed), armed - control.
//   GO iff >= +3/16.
//   Guardrails: national >= control-2; median survival >= control-10d;
//   no new death mode; det-gate (proof test); SMOKE green.
//
// Per run: exposed, exposureRecord (kinds), witness earned/offered (via
// tableEarnedPaths when seated), wins, national, survival days, death
// causes, instrument errors.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1 MODALPLAY=1 node scripts/sweep-witnesource-20261017.js
// Targeted: SEEDS="76202,76203" ONLY="leadfeast" ARM="armed" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1 MODALPLAY=1 node scripts/sweep-witnesource-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadtakeseat, belongtakeseat } = require('./policies/takeseat');
const { leadmodalplay, belongmodalplay } = require('./policies/modalplay');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '0') fails.push('SEATDRIVE=0 required EXPLICIT');
  if (process.env.TAKESEAT !== '1') fails.push('TAKESEAT=1 required (both arms sit)');
  if (process.env.MODALPLAY !== '1') fails.push('MODALPLAY=1 required (both arms answer)');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [76202, 76203, 76207, 76213, 76214, 76215, 76216, 76217]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const BASES = { leadfeast: leadmodalplay, belongfeast: belongmodalplay };
const ROADS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => s in BASES) : ['leadfeast', 'belongfeast'];
const ARMS = process.env.ARM ? String(process.env.ARM).split(',').map(s => s.trim()).filter(s => s === 'armed' || s === 'control') : ['armed', 'control'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-witnesource');
if (!SMOKE) fs.mkdirSync(EVID, { recursive: true });

function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function runOne(seed, road, arm) {
  const useLayer = arm === 'armed';
  const policy = BASES[road];
  const prevExp = process.env.EXPOSURE;
  if (useLayer) delete process.env.EXPOSURE; else process.env.EXPOSURE = '0';
  try {
    const { Game } = await loadGame({ seed, mode: `witnesource-${road}-${arm}` });
    await setupGame(Game);
    const deaths = [];
    const _tele = Game.tele;
    Game.tele = function (type, data) {
      let r; try { r = _tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'death') deaths.push({ day: dayOf(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
      } catch (e) {}
      return r;
    };
    // witness-door offer probe: after the run, price the paths
    await quietLog(() => runDays(Game, policy, { days: EFF_DAYS }));
    let exposed = 0, records = [];
    try { exposed = Game.ledger().exposed | 0; } catch (e) {}
    try {
      records = (Game.exposureRecord() || []).map(r => ({ day: r.day, kind: r.kind, charge: r.charge }));
    } catch (e) {}
    let witnessEarned = false, witnessOffered = false, witnessStrength = 0, seat = 'none';
    try {
      const priced = Game.tableEarnedPaths();
      const w = priced.find(p => p.id === 'witness');
      if (w) { witnessEarned = !!w.earned; witnessStrength = w.strength | 0; }
      // offered = the table was reached and priced (seat != none)
      const st = Game.tableSeat ? Game.tableSeat() : {};
      seat = (st && st.seat) || 'none';
      witnessOffered = seat !== 'none' && !!w;
    } catch (e) {}
    let national = false;
    try { national = !!(Game.state.village && Game.state.village.maxRank && Game.state.village.maxRank >= 3); } catch (e) {}
    // fallback: hierarchy rank
    try {
      const h = Game.hierarchyState ? Game.hierarchyState() : null;
      if (h && h.rank) national = national || /national/i.test(String(h.rank));
    } catch (e) {}
    const kinds = {};
    for (const r of records) kinds[r.kind] = (kinds[r.kind] || 0) + 1;
    const row = {
      seed, road, arm, days: dayOf(Game), won: !!Game.won,
      exposed, nRecords: records.length, kinds,
      barArmed: exposed >= 3,
      witnessEarned, witnessOffered, witnessStrength, seat,
      national, deaths: deaths.length,
      deathCauses: deaths.reduce((m, d) => { const k = d.cause || d.kind || 'unknown'; m[k] = (m[k] || 0) + 1; return m; }, {}),
    };
    if (!SMOKE) fs.writeFileSync(path.join(EVID, `witnesource-${road}-${arm}-s${seed}.json`), JSON.stringify(row, null, 1));
    return row;
  } finally {
    if (prevExp == null) delete process.env.EXPOSURE; else process.env.EXPOSURE = prevExp;
  }
}

(async () => {
  assertSubstrate();
  const rows = [];
  for (const seed of SEEDS) {
    for (const road of ROADS) {
      for (const arm of ARMS) {
        const r = await runOne(seed, road, arm);
        rows.push(r);
        console.log(`s${seed} ${road} ${arm}: d${r.days} won=${r.won} exposed=${r.exposed} recs=${r.nRecords} ${JSON.stringify(r.kinds)} bar=${r.barArmed} witEarn=${r.witnessEarned} nat=${r.national}`);
      }
    }
  }
  const armed = rows.filter(r => r.arm === 'armed');
  const control = rows.filter(r => r.arm === 'control');
  const sum = rs => ({
    n: rs.length,
    barArmed: rs.filter(r => r.barArmed).length,
    witEarn: rs.filter(r => r.witnessEarned).length,
    wins: rs.filter(r => r.won).length,
    national: rs.filter(r => r.national).length,
    medSurv: rs.map(r => r.days).sort((a, b) => a - b)[Math.floor(rs.length / 2)],
    exposed: rs.map(r => r.exposed),
  });
  console.log('\nARMED:', JSON.stringify(sum(armed)));
  console.log('CONTROL:', JSON.stringify(sum(control)));
  console.log(`PRIMARY (bar armed diff): ${sum(armed).barArmed - sum(control).barArmed} (GO iff >= +3)`);
  if (!SMOKE) fs.writeFileSync(path.join(__dirname, '..', 'evidence', DATE, 'witnesource-sweep-summary-20261017.json'), JSON.stringify({ rows, armed: sum(armed), control: sum(control) }, null, 1));
})().catch(e => { console.error('SWEEP FAIL', e); process.exit(1); });
