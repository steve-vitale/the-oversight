#!/usr/bin/env node
// sweep-childbirth-b.js — unscripted competent-nofeast births band for
// sim-childbirth-b (prereg evidence/2026-10-28/sim-childbirth-b-prereg.md).
// Measurement only. Adapted from scripts/sweep-outflowzero-b.js (same
// policy, same stockdoors capture installed UNCHANGED), extended with:
//   (a) home census at setup AND at end,
//   (b) distant census at end: every otherVillages[] entry with a
//       generated roster — roster size, living children (age < 15),
//       births (members with birthDay set), village day reached, and
//       any birth news lines,
//   (c) npc-child-pantry calls/records from the capture.
// Env (asserted FATAL, same gates as the outflowzero band):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1,
//   FEASTSCALE_R13 unset or 0, SEEDS, DAYS=300,
//   PERSEED_DIR (default evidence/2026-10-28/sim-childbirth-b-corpus).
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
const SEEDS = (process.env.SEEDS || '10410,10411,10412,10413,10414,10415,10416,10417')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '300', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-28', 'sim-childbirth-b-corpus');

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
function homeCensus(Game) {
  const v = Game.state.village;
  const roster = v.roster || [];
  const out = { rosterSize: roster.length, children: [], childrenWithPositions: 0, ages: {} };
  for (const rid of roster) {
    let age = null;
    try { age = Game.npcAge(rid); } catch (e) {}
    out.ages[String(rid)] = age;
    if (typeof age === 'number' && age < 15) {
      out.children.push(String(rid));
      if (v.positions && v.positions[rid]) out.childrenWithPositions++;
    }
  }
  out.positionsTotal = v.positions ? Object.keys(v.positions).length : 0;
  return out;
}
function distantCensus(Game) {
  const villages = Game.state.otherVillages || [];
  const out = [];
  for (const vil of villages) {
    if (!vil.roster) continue; // never generated (never approached / joined)
    let children = 0, births = 0, living = 0;
    const birthLines = [];
    for (const p of vil.roster) {
      if (!p.alive) continue;
      living++;
      if (typeof p.age === 'number' && p.age < 15) children++;
      if (p.birthDay !== undefined && p.birthDay !== null) births++;
    }
    for (const line of (vil.news || [])) {
      if (/baby was born/i.test(String(line))) birthLines.push(String(line).slice(0, 160));
    }
    out.push({
      id: String(vil.id), name: String(vil.name || '?').slice(0, 40),
      day: vil.day || 0, rosterSize: vil.roster.length, living,
      children, births, birthLines: birthLines.slice(0, 5),
    });
  }
  return out;
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'childbirth-b-' + POLICY_ID, fullTelemetry: false });
  const stockdoors = installStockdoorsCapture(Game);
  await setupGame(Game);
  const censusStart = homeCensus(Game);
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
  const childRecords = (stockdoors.directRecords || []).filter(r => r.path === 'npc-child-pantry');
  const childCalls = (stockdoors.counters && stockdoors.counters.calls && stockdoors.counters.calls['npc-child-pantry']) || 0;
  return {
    seed, policy: POLICY_ID, plentydepri: 0, depositgate: 1,
    competentFeast: 0, feastscaleR13: 0, stockdoorsOn: true,
    daysAlive: result.days, deaths: deaths.length, deathCauses, deathList: deaths,
    national, table: won, win: won, waveReach, rank, endReason: result.endReason, ms,
    census: censusStart, censusEnd: homeCensus(Game),
    distant: distantCensus(Game),
    childCalls, childRecords, childRecordCount: childRecords.length,
    judgedRecordCount: childRecords.length,
    directCounters: stockdoors.counters,
    wrappedPaths: stockdoors.counters.wrappedPaths,
    missingPaths: stockdoors.counters.missingPaths,
  };
}

(async () => {
  const pending = [];
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `childbirth-b-${POLICY_ID}-s${seed}.json`;
    const summary = `done seed=${seed} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.waveReach.length} deaths=${perSeed.deaths} homeChildren=${perSeed.censusEnd.children.length} distantVillages=${perSeed.distant.length} distantChildren=${perSeed.distant.reduce((a, d) => a + d.children, 0)} distantBirths=${perSeed.distant.reduce((a, d) => a + d.births, 0)} childCalls=${perSeed.childCalls} childRecords=${perSeed.childRecordCount} (${perSeed.ms}ms)`;
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
