#!/usr/bin/env node
// sweep-tricktag-20261016.js — the sim-tricktag measurement sweep.
// 8 FRESH seeds (951-958) x {leadfeast, belongfeast} x {control, armed} =
// 32 runs, 180d death-aware, pre-seat courtship substrate, SEATDRIVE=0
// explicit. Own in-sweep control: control runs with TRICKTAG_OFF=1 (the
// pre-fix tagging), armed with the fix on — identical seeds, one process,
// flag flipped per run (read at call time, no reload needed).
//
// Per-seed JSONs: evidence/2026-10-16/perseed-tricktag/
//   <policy>-s<seed>-<arm>.json  (arm = control|armed)
// Schema (telemetry-aligned): numeric national/table/wins/exiled, plus
// kills (waveKillLog entries), killsByChannel, trajHash (det-gate:
// waveKillLog EXCLUDED — it is supposed to differ), wall metrics.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 SEEDS=951,..,958 POLICIES=leadfeast,belongfeast
//   DAYS=180 node scripts/sweep-tricktag-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TF = require('./policies/tribfloor');

// ---- substrate guards (pre-seat courtship stack) ----
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required explicitly (pre-seat substrate).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [951, 952, 953, 954, 955, 956, 957, 958]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = ['control', 'armed'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-tricktag');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'tricktag-beats');
const BEAT_CAP = 400;
const COMBAT_BEAT = /BELLOW|shout|strikes|kills|☠|falls|COUNTER LEARNED|💡|trick/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const scholarVid = (Game) => { try { return (Game.state.scholar || {}).villagerId || 'player'; } catch (e) { return 'player'; } };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

function trajHash(Game) {
  const st = Game.state || {};
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {},
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
    tales: (st.killerTales || []).length,
    rank: (Game.scaleRank ? Game.scaleRank() : null),
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  return x.toString(16);
}

async function oneRun(seed, policyId, arm) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '0';
  process.env.TRICKTAG_OFF = arm === 'control' ? '1' : '0';
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'tricktag', fullTelemetry: false });
  await setupGame(Game);

  const sid = scholarVid(Game);
  const deaths = [];
  const sayBeats = [];
  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
    } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (COMBAT_BEAT.test(s) && sayBeats.length < BEAT_CAP) sayBeats.push({ day: gday(Game), text: s.slice(0, 280) });
    } catch (e) {}
    return _s(t);
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  Game.tele = _t; Game.say = _s;

  const st = Game.state || {};
  const monsterById = {};
  try { for (const m of (Game.data.monsters || [])) monsterById[m.id] = m.wave || 1; } catch (e) {}

  const kills = (st.waveKillLog || []).map(k => ({
    d: k.d, mid: k.mid, w: k.w || monsterById[k.mid] || null,
    by: k.by, byScholar: k.by === sid || k.by === 'player',
    via: k.via, trick: k.trick || null,
  }));
  const killsByChannel = st.waveKillByChannel || {};

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}

  const out = {
    seed, policyId, arm, mode: 'tricktag',
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0)',
    tricktagOff: arm === 'control' ? 1 : 0,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    wins: !!Game.won ? 1 : 0, national, table, exiled: 0,
    maxWave: result.maxWaveUnlocked || 1,
    trajHash: trajHash(Game),
    nKills: kills.length,
    killsByVia: kills.reduce((o, k) => { o[k.via || '?'] = (o[k.via || '?'] || 0) + 1; return o; }, {}),
    killsByChannel,
    companionKills: kills.filter(k => k.via === 'companion'),
    trickKills: kills.filter(k => k.trick),
    companionTrickKills: kills.filter(k => k.via === 'companion' && k.trick),
    kills,
    deaths: deaths.length,
    deathCauses: deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    scholarDeath: deaths.some(d => d.player) ? 1 : 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${arm}.json`), JSON.stringify(out, null, 1));
  if (sayBeats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${arm}.json`), JSON.stringify(sayBeats, null, 1));
  }
  console.log(`  [${policyId} s${seed} ${arm}] days=${result.days} end=${result.endReason} nat=${national} table=${table} won=${out.wins} kills=${kills.length} comp=${out.companionKills.length} trick=${out.trickKills.length} hash=${out.trajHash}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const arm of ARMS) {
        await oneRun(seed, policyId, arm);
      }
    }
  }
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-tricktag/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun };
