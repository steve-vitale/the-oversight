#!/usr/bin/env node
// sweep-counterwired-20261016.js — the sim-counterwired census sweep.
// DIAGNOSTIC INSTRUMENT. Zero src/js changes, zero policy changes — read-only
// attach to the engine (tele wrap counts/captures counter + death events;
// state reads at end). 8 FRESH seeds × {leadfeast, belongfeast} = 16 runs,
// 180d death-aware, pre-seat substrate, SEATDRIVE=0 explicit.
//
// Measures (on current master 0020b96a):
//   (a) counter discovery by wave — species, channel (trick/taught/observed/
//       scholar-observed), actor (scholar via vid='player' vs villagers)
//   (b) discovery→kill conversion by wave — kills of a discovered species
//       after discovery vs before; brute-force kills of the same species;
//       kills with a trickSummary (counter-executed) vs without
//   (c) survival differential — runs with a wave-3+ trick known vs not:
//       field-death rate, median survival
//   (d) whether non-scholar villagers ever execute counters (trickLog on
//       villager-kills in waveKillLog)
//   (e) the wiring verdict inputs: wave reach, monsterCounters, villagerTricks,
//       villageSlain per type, waveKillLog attribution
//
// Per-seed JSONs: evidence/2026-10-16/perseed-counterwired/<policy>-s<seed>.json
// Schema (LOUD class, telemetry-aligned): numeric national/table/wins/exiled.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 SEEDS=611,612,... POLICIES=leadfeast,belongfeast
//   DAYS=180 node scripts/sweep-counterwired-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TF = require('./policies/tribfloor');
const CENSUS = require('./census-counterwired-20261016.js');

// ---- substrate guards (same pre-seat stack as the sibling arm) ----
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required explicitly (pre-seat substrate).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [611, 612, 613, 614, 616, 617, 618, 701]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-counterwired');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'counterwired-beats');
const BEAT_CAP = 3000;
const BEAT_LEN = 300;
const COUNTER_BEAT = /COUNTER LEARNED|💡|trick| Trick/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const scholarVid = (Game) => { try { return (Game.state.scholar || {}).villagerId || 'player'; } catch (e) { return 'player'; } };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

async function oneRun(seed, policyId) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '0';
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'counterwired', fullTelemetry: false });
  await setupGame(Game);

  // ---- read-only attach ----
  const discovered = [];  // {day, id, via}
  const observed = [];    // {day, id, vid, n}
  const deaths = [];      // {day, kind, who, cause, player}
  const fights = [];      // {day, vs, wave}
  let sayBeats = [];
  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'counter_discovered') discovered.push({ day: gday(Game), id: data && data.id, via: data && data.via });
      else if (type === 'counter_observed') observed.push({ day: gday(Game), id: data && data.id, vid: data && data.vid, n: data && data.n });
      else if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
      else if (type === 'combat_start') fights.push({ day: gday(Game), vs: data && data.vs, wave: data && data.wave });
    } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (COUNTER_BEAT.test(s)) {
        if (sayBeats.length < BEAT_CAP) sayBeats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
      }
    } catch (e) {}
    return _s(t);
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  Game.tele = _t; Game.say = _s;

  // ---- end-of-run state reads (all read-only) ----
  const st = Game.state || {};
  const sid = scholarVid(Game);
  const byWave = {};
  const monsterById = {};
  try { for (const m of (Game.data.monsters || [])) monsterById[m.id] = m.wave || 1; } catch (e) {}

  const kills = (st.waveKillLog || []).map(k => ({
    d: k.d, mid: k.mid, w: k.w || monsterById[k.mid] || null,
    byScholar: k.by === sid || k.by === 'player',
    by: k.by, via: k.via, trick: k.trick || null,  // trickSummary: non-null = counter-executed kill
  }));
  for (const k of kills) {
    const w = 'w' + (k.w || '?');
    byWave[w] = byWave[w] || { kills: 0, scholarKills: 0, villagerKills: 0, trickKills: 0, trickKillsV: 0 };
    byWave[w].kills++;
    if (k.byScholar) byWave[w].scholarKills++; else byWave[w].villagerKills++;
    if (k.trick) { byWave[w].trickKills++; if (!k.byScholar) byWave[w].trickKillsV++; }
  }

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  // Also scan the scale sample history via fights? Keep it simple: final + invite-day.
  const inviteDay = (() => { try { const pg = Game.progState ? Game.progState() : {}; return pg.tableInviteDay != null ? pg.tableInviteDay : null; } catch (e) { return null; } })();

  const wavesFaced = [...new Set(fights.map(f => f.wave).filter(w => w != null))].sort();
  const maxWave = result.maxWaveUnlocked || 1;
  const fCounters = Object.keys(st.monsterCounters || {});
  const fTricks = Object.keys(st.villagerTricks || {});
  const w3plusTrick = fTricks.some(id => (monsterById[id] || 1) >= 3) || fCounters.some(id => (monsterById[id] || 1) >= 3);

  const out = {
    seed, policyId, mode: 'counterwired', substrate: 'pre-seat (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0)',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    wins: !!Game.won ? 1 : 0, national, table, exiled: 0,
    maxWave, wavesFaced, inviteDay,
    medianNote: 'aggregate in analyzer',
    counterDiscovered: discovered,
    counterObserved: observed,
    nDiscovered: discovered.length, nObserved: observed.length,
    discoveriesByWave: discovered.reduce((o, e) => { const w = 'w' + (monsterById[e.id] || '?'); o[w] = (o[w] || 0) + 1; return o; }, {}),
    discoveriesByVia: discovered.reduce((o, e) => { o[e.via || '?'] = (o[e.via || '?'] || 0) + 1; return o; }, {}),
    finalMonsterCounters: fCounters,
    finalVillagerTricks: fTricks,
    wave3plusTrickKnown: w3plusTrick ? 1 : 0,
    villageSlain: st.villageSlain || {},
    villageCounterObs: st.villageCounterObs || {},
    kills, killsByWave: byWave,
    deaths: deaths.length,
    deathCauses: deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    fightsByWave: fights.reduce((o, f) => { const w = 'w' + (f.wave || '?'); o[w] = (o[w] || 0) + 1; return o; }, {}),
    beatsDropped: Math.max(0, sayBeats.length - BEAT_CAP),
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  const beats = sayBeats.slice(0, 800);
  if (beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(beats, null, 1));
  }
  console.log(`  [${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} won=${out.wins} disc=${discovered.length} (w1/w2 only? ${Object.keys(out.discoveriesByWave).sort().join(',')}) w3+trick=${w3plusTrick ? 1 : 0} deaths=${deaths.length}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      await oneRun(seed, policyId);
    }
  }
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-counterwired/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun };
