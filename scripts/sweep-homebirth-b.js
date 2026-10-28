#!/usr/bin/env node
// sweep-homebirth-b.js — unscripted home-population band for sim-homebirth-b
// (prereg evidence/2026-10-28/sim-homebirth-b-prereg.md).
// Measurement only: zero src/js changes. Adapted from
// scripts/sweep-childbirth-b.js (same harness pattern: loadGame/setupGame/
// runDays, sequential seeds in one process, same env gates), with the
// childbirth census replaced by a home-population census:
//   (a) home census at setup AND at end (roster ids, npcAge per id,
//       children age < 15, min age, positions count);
//   (b) roster diff: end ids minus start ids (= joiners, each with end
//       age: adult / child / unknown — null ages are NEVER defaulted)
//       and start ids minus end ids (= leavers);
//   (c) arrivedDay cross-check: v.arrivedDay keys at end (application
//       path) vs joiners (visitor-invite path sets no arrivedDay);
//   (d) distant census at end: every otherVillages[] entry with a
//       generated roster — roster size, living children, living
//       birthDay members, village day, birth news lines;
//   (e) max scholar day reached, end reason, wall fields (national/
//       table/wins, wave reach, arc via progState, four-realm via
//       vests proxy: any vest recorded => fourRealm, same convention
//       as sweep-completion-r7 — here vests are NOT instrumented, so
//       fourRealm is reported as unknown, never 0-by-default).
// Narration stays SILENCED (harness default, as in childbirth): the
// judged claims are state-based (roster diff, arrivedDay, village
// days), not say-lines. A separate narration sense probe (not
// judged) captures arrival voice verbatim.
// Env (asserted FATAL, same gates as the childbirth band):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1,
//   FEASTSCALE_R13 unset or 0, SEEDS, DAYS=180,
//   POLICY (competent | competent-warmoff — sets COMPETENT_WARM),
//   PERSEED_DIR (default evidence/2026-10-28/sim-homebirth-b-corpus).
'use strict';
const fs = require('fs');
const path = require('path');
// POLICY VARIANT ORDER FIX (homebirth-b, warmoff-v1 was invalid):
// policies/competent.js reads COMPETENT_WARM ONCE at require time, so
// the warmoff assignment MUST precede the require — v1 set it after
// the require and silently re-ran the primary policy under a warmoff
// label (first 3 seeds byte-identical to primary; killed, deleted,
// re-run under this fix). The FATAL gates below check env the shell
// already set, so their position after the requires is harmless.
const POLICY_EARLY = process.env.POLICY || 'competent';
if (POLICY_EARLY === 'competent-warmoff') process.env.COMPETENT_WARM = '0';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.FEASTSCALE_R13 === '1') { console.error('FATAL: FEASTSCALE_R13=1 forbidden'); process.exit(2); }
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 required'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 required'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 required'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 required'); process.exit(2); }
const POLICY = POLICY_EARLY;
if (POLICY !== 'competent' && POLICY !== 'competent-warmoff') { console.error('FATAL: POLICY must be competent or competent-warmoff'); process.exit(2); }
const POLICY_ID = POLICY === 'competent' ? 'competent-nofeast' : 'competent-nofeast-warmoff';
const SEEDS = (process.env.SEEDS || '10510,10511,10512,10513,10514,10515,10516,10517')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-28', 'sim-homebirth-b-corpus');

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
  const roster = (v.roster || []).slice();
  const out = { rosterSize: roster.length, rosterIds: roster.map(String), children: [], ages: {}, minAge: null, positionsTotal: v.positions ? Object.keys(v.positions).length : 0 };
  for (const rid of roster) {
    let age = null;
    try { age = Game.npcAge(rid); } catch (e) {}
    out.ages[String(rid)] = (typeof age === 'number' && isFinite(age)) ? age : null;
    if (typeof age === 'number' && age < 15) out.children.push(String(rid));
  }
  const known = Object.values(out.ages).filter(a => a !== null);
  out.minAge = known.length ? Math.min(...known) : null;
  return out;
}
function distantCensus(Game) {
  const villages = Game.state.otherVillages || [];
  const out = [];
  for (const vil of villages) {
    if (!vil.roster) continue;
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
  const { Game } = await loadGame({ seed, mode: 'homebirth-b-' + POLICY_ID, fullTelemetry: false });
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
  const arc = (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })();
  const censusEnd = homeCensus(Game);
  const startSet = new Set(censusStart.rosterIds);
  const endSet = new Set(censusEnd.rosterIds);
  const joiners = censusEnd.rosterIds.filter(id => !startSet.has(id)).map(id => {
    const age = censusEnd.ages[id];
    return { id, age, cls: age === null ? 'unknown' : (age < 15 ? 'child' : 'adult') };
  });
  const leavers = censusStart.rosterIds.filter(id => !endSet.has(id));
  const arrivedDay = (() => { try { return Object.assign({}, (Game.state.village || {}).arrivedDay || {}); } catch (e) { return {}; } })();
  const arrivedJoiners = joiners.filter(j => Object.prototype.hasOwnProperty.call(arrivedDay, j.id)).length;
  const distant = distantCensus(Game);
  const scholarDay = (Game.state.scholar || {}).day || 0;
  const maxDistantDay = distant.reduce((a, d) => Math.max(a, d.day || 0), 0);
  const birthLines = distant.flatMap(d => d.birthLines);
  return {
    seed, policy: POLICY_ID, plentydepri: 0, depositgate: 1,
    competentFeast: 0, competentWarm: POLICY === 'competent-warmoff' ? 0 : 1, feastscaleR13: 0,
    daysAlive: result.days, maxScholarDay: scholarDay, deaths: deaths.length, deathCauses, deathList: deaths,
    national, table: won, win: won, waveReach, maxWave, arc, rank, endReason: result.endReason, ms,
    fourRealm: null, fourRealmNote: 'vests not instrumented in this sweep; fourRealm unknown, never 0-by-default',
    census: censusStart, censusEnd, joiners, leavers,
    arrivedDayKeys: Object.keys(arrivedDay), arrivedJoiners,
    distant, distantVillages: distant.length,
    distantChildren: distant.reduce((a, d) => a + d.children, 0),
    distantBirths: distant.reduce((a, d) => a + d.births, 0),
    maxDistantDay, birthLines,
    gateReached: (Math.max(scholarDay, maxDistantDay) >= 270) || birthLines.length > 0,
    homeChildrenStart: censusStart.children.length, homeChildrenEnd: censusEnd.children.length,
  };
}

(async () => {
  const pending = [];
  for (const seed of SEEDS) {
    const perSeed = await oneRun(seed);
    const name = `homebirth-b-${POLICY_ID}-s${seed}.json`;
    const summary = `done seed=${seed} policy=${POLICY_ID} days=${perSeed.daysAlive} end=${perSeed.endReason} rank=${perSeed.rank} wave=${perSeed.maxWave} arc=${perSeed.arc} homeChildren=${perSeed.homeChildrenStart}/${perSeed.homeChildrenEnd} joiners=${perSeed.joiners.length} (adult=${perSeed.joiners.filter(j => j.cls === 'adult').length} child=${perSeed.joiners.filter(j => j.cls === 'child').length} unknown=${perSeed.joiners.filter(j => j.cls === 'unknown').length}) leavers=${perSeed.leavers.length} distantVillages=${perSeed.distantVillages} distantChildren=${perSeed.distantChildren} distantBirths=${perSeed.distantBirths} maxDay=${Math.max(perSeed.maxScholarDay, perSeed.maxDistantDay)} birthLines=${perSeed.birthLines.length} (${perSeed.ms}ms)`;
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
