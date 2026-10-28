#!/usr/bin/env node
// sweep-outflowzero-b.js — unscripted competent-nofeast band for
// sim-outflowzero-b (prereg evidence/2026-10-27/
// sim-outflowzero-b-prereg.md). Measurement only.
//
// Installs scripts/stockdoors-capture.js UNCHANGED (which folds the
// driedhunt _removePantryKcal door in) plus a roster/child census
// after setupGame. Per-seed payload: directCounters (calls /
// callsWithDecrease / records per path), directRecords for the four
// judged paths, census, and wall fields. No ledger closure is judged
// on this band — the band answers leg F3 only: did each path fire,
// or is there a COUNTED non-firing explanation?
//
// Env (asserted FATAL, same gates as the stockdoors band):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1,
//   FEASTSCALE_R13 unset or 0, SEEDS, DAYS=100,
//   PERSEED_DIR (default evidence/2026-10-27/sim-outflowzero-b-corpus).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installStockdoorsCapture } = require('./stockdoors-capture');

if (process.env.FEASTSCALE_R13 === '1') { console.error('FATAL: FEASTSCALE_R13=1 forbidden'); process.exit(2); }
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 required'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 required'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 required'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 required'); process.exit(2); }
const POLICY_ID = 'competent-nofeast';
const SEEDS = (process.env.SEEDS || '9850,9851,9852,9853,9854,9855,9856,9857')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-27', 'sim-outflowzero-b-corpus');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}
function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'outflowzero-b-' + POLICY_ID, fullTelemetry: false });
  const stockdoors = installStockdoorsCapture(Game);
  await setupGame(Game);
  // ROSTER / CHILD CENSUS (leg F3 evidence for the child path).
  const v = Game.state.village;
  const roster = v.roster || [];
  const census = { rosterSize: roster.length, children: [], childrenWithPositions: 0, ages: {} };
  for (const rid of roster) {
    let age = null;
    try { age = Game.npcAge(rid); } catch (e) {}
    census.ages[String(rid)] = age;
    if (typeof age === 'number' && age < 15) {
      census.children.push(String(rid));
      if (v.positions && v.positions[rid]) census.childrenWithPositions++;
    }
  }
  const deaths = [];
  const deathSeen = new Set();
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!deathSeen.has(key)) { deathSeen.add(key); deaths.push({ day, who: who.slice(0, 24), kind, cause }); }
      }
    } catch (e) {}
  };
  const t0 = Date.now();
  const result = await runDays(Game, competent, { days: DAYS, manifest: null });
  const ms = Date.now() - t0;
  const deathCauses = {};
  for (const d of deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const judgedPaths = ['thief.steal_pantry', 'event-take', 'player-take-bulk', 'npc-child-pantry'];
  const judgedRecords = (stockdoors.directRecords || []).filter(r => judgedPaths.includes(r.path));
  return {
    seed, policy: POLICY_ID, plentydepri: 0, depositgate: 1,
    competentFeast: 0, feastscaleR13: 0, stockdoorsOn: true,
    daysAlive: result.days, deaths: deaths.length, deathCauses, deathList: deaths,
    national, table: won, win: won, waveReach, rank, endReason: result.endReason, ms,
    census,
    directCounters: stockdoors.counters,
    judgedRecords,
    judgedRecordCount: judgedRecords.length,
    removePantryKcalRecords: (stockdoors.directRecords || []).filter(r => r.path === 'remove-pantry-kcal').length,
    wrappedPaths: stockdoors.counters.wrappedPaths,
    missingPaths: stockdoors.counters.missingPaths,
  };
}

(async () => {
  const pending = [];
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `outflowzero-b-${POLICY_ID}-s${seed}.json`;
    const c = perSeed.directCounters;
    const summary = `done seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} deaths=${perSeed.deaths} roster=${perSeed.census.rosterSize} children=${perSeed.census.children.length} judgedRecords=${perSeed.judgedRecordCount} calls=${JSON.stringify(c.calls)} (${perSeed.ms}ms)`;
    const data = JSON.stringify(perSeed);
    if (tryWrite(path.join(PERSEED_DIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(PERSEED_DIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
    if (pending.length) { console.error('PENDING STILL ' + pending.length + ' — FAIL LOUDLY'); process.exit(3); }
  }
  console.log('wrote ' + SEEDS.length + ' files to ' + PERSEED_DIR);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
