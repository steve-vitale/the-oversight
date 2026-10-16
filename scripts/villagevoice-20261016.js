// scripts/villagevoice-20261016.js — sim-villagevoice: sample villager
// behavior out of long sims and judge whether villagers act like people.
// DIAGNOSTIC INSTRUMENT ONLY — zero src/js changes, zero policy changes.
// Wraps Game.say (all beats) + Game.tele (death/contest/table events) and
// snapshots roster state via policy.daily. Classifies beats AFTER the run
// with scripts/villagevoice-lib-20261016.js.
//
// Substrate (the current winning stack, per brief):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//   WINDEFER=1 ; SEATDRIVE unset (= ON per c004b9dd).
// Policies: leadfeast / belongfeast (scripts/policies/feastscale.js).
// Seeds: 8 FRESH — verified 0 per-seed JSON hits across evidence/ before run:
//   118,128,138,148,158,168,178,188. Horizon: 180d death-aware (runDays).
//
// Outputs:
//   evidence/2026-10-16/perseed-villagevoice/{policy}-s{seed}.json
//     — numeric wall-metric keys: national/table/wins/exiled + days,
//       deaths, maxWave, wave45, beatCount.
//   evidence/2026-10-16/villagevoice-beats/{policy}-s{seed}.json
//     — beats [{d,t}], classified distribution, events, roster snapshots.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { extractText, classify } = require('./villagevoice-lib-20261016');

const REQUIRED_ENV = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER'];
for (const k of REQUIRED_ENV) {
  if (process.env[k] !== '1') { console.error(`villagevoice: need ${k}=1`); process.exit(2); }
}
if ('SEATDRIVE' in process.env) { console.error('villagevoice: SEATDRIVE must be UNSET (default ON per c004b9dd)'); process.exit(2); }

const SEEDS = [118, 128, 138, 148, 158, 168, 178, 188];
const POLICIES = { leadfeast, belongfeast };
const DAYS = 180;
const ROOT = path.join(__dirname, '..');
const PERSEED_DIR = path.join(ROOT, 'evidence', '2026-10-16', 'perseed-villagevoice');
const BEATS_DIR = path.join(ROOT, 'evidence', '2026-10-16', 'villagevoice-beats');
for (const d of [PERSEED_DIR, BEATS_DIR]) fs.mkdirSync(d, { recursive: true });

const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const RANK_ORDER = { village: 1, regional: 2, national: 3, global: 4 };

function personRow(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (!p) return { vid: String(vid), missing: true };
    let name = null;
    try { name = Game.displayName ? Game.displayName(vid) : (p.name || String(vid)); } catch (e) { name = p.name || String(vid); }
    return {
      vid: String(vid),
      name: String(name || vid).slice(0, 40),
      occ: (p.occupationId || p.formerOccupation || p.occupation || '?').slice(0, 40),
      dead: !!p.dead,
      trust: (Game.state.village && Game.state.village.trust) ? (Game.state.village.trust[vid] | 0) : null,
    };
  } catch (e) { return { vid: String(vid), err: true }; }
}

function rosterSnapshot(Game) {
  try {
    const roster = (Game.state.village || {}).roster || [];
    return roster.map((vid) => personRow(Game, vid));
  } catch (e) { return []; }
}

async function runOne(policyId, seed) {
  const base = POLICIES[policyId];
  const { Game } = await loadGame({ seed, mode: `villagevoice-${policyId}` });
  await setupGame(Game);
  const beats = [];
  const events = [];
  let rosterStart = null;

  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = extractText(msg);
      if (t) beats.push({ d: day(Game), t });
    } catch (e) {}
    return origSay(msg);
  };
  const origTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'death' || type === 'contest_fired' || type === 'contest_end' || type === 'snare_overhear' || type === 'snare_lesson') {
        let who = null;
        try {
          const wid = (data && (data.who || data.vid)) || null;
          if (wid) { const p = personRow(Game, wid); who = p.name || String(wid); }
        } catch (e) {}
        events.push({ d: day(Game), type, who, cause: (data && (data.cause || data.kind)) || null });
      }
    } catch (e) {}
    return origTele.apply(this, arguments);
  };

  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, everTable: false, exiled: false, maxWaveDay: {} };
  const oDaily = base.daily;
  const snaps = [];
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (day(G) % 30 === 0) snaps.push({ d: day(G), roster: rosterSnapshot(G) });
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    return r;
  };

  rosterStart = rosterSnapshot(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const rosterEnd = rosterSnapshot(Game);

  // post-run classification: name set = union of every name seen in snapshots + events
  const names = [];
  for (const s of [rosterStart, rosterEnd, ...snaps.map((x) => x.roster)]) {
    for (const p of (s || [])) {
      if (p.name && !names.includes(p.name)) names.push(p.name);
      if (p.name) { const first = p.name.split(' ')[0]; if (!names.includes(first)) names.push(first); }
    }
  }
  for (const e of events) if (e.who && !names.includes(e.who)) names.push(e.who);
  const seen = new Map();
  const dist = {};
  let villagerBeats = 0, sensed = 0, unattributed = 0;
  const deathDay = {};
  for (const e of events) if (e.type === 'death' && e.who) deathDay[e.who] = Math.min(deathDay[e.who] ?? 1e9, e.d);
  for (const b of beats) {
    const c = classify(b.t, { names, seen, deathDay, beatDay: b.d });
    b.c = c.cat;
    if (c.base) b.base = c.base;
    if (!c.cat) { unattributed++; continue; }
    dist[c.cat] = (dist[c.cat] || 0) + 1;
    if (c.villagerBeat) {
      villagerBeats++;
      if (['dialogue-with-stakes', 'goal-driven', 'event-reaction', 'routine-honest', 'template-fingerprint'].includes(c.cat)) sensed++;
    }
  }

  const deaths = {};
  try { for (const d of (result.samples.deaths || [])) { const k = String(d.cause || d.kind || 'unknown'); deaths[k] = (deaths[k] || 0) + 1; } } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  const ps = {
    seed, policyId, side: policyId === 'leadfeast' ? 'lead' : 'belong',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: endInfo.won ? 1 : 0,
    maxWave: result.maxWaveUnlocked || 1, wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    beatCount: beats.length,
    villagerBeats, sensed,
  };
  fs.writeFileSync(path.join(PERSEED_DIR, `${policyId}-s${seed}.json`), JSON.stringify(ps, null, 1));
  fs.writeFileSync(path.join(BEATS_DIR, `${policyId}-s${seed}.json`), JSON.stringify({
    seed, policyId, distribution: dist, villagerBeats, sensed, unattributed,
    events, rosterStart, snaps, rosterEnd,
    beats,
  }));
  return ps;
}

(async () => {
  const out = [];
  for (const policyId of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      const ps = await runOne(policyId, seed);
      out.push(ps);
      console.log(`  [${policyId} s${seed}] d=${ps.days} ${ps.endReason} nat=${ps.national} tab=${ps.table} win=${ps.wins} wave=${ps.maxWave} ex=${ps.exiled} beats=${ps.beatCount} vill=${ps.villagerBeats} sensed=${ps.sensed}`);
    }
  }
  const agg = (f) => out.reduce((a, r) => a + (f(r) ? 1 : 0), 0);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  console.log(`\nwall: national ${agg(r => r.national)}/16 table ${agg(r => r.table)}/16 won ${agg(r => r.wins)}/16 wave4+ ${agg(r => r.wave45)}/16 medianDays ${med(out.map(r => r.days))} maxDays ${Math.max(...out.map(r => r.days))} exiled ${agg(r => r.exiled)}/16`);
  const vb = out.reduce((a, r) => a + r.villagerBeats, 0);
  const sb = out.reduce((a, r) => a + r.sensed, 0);
  console.log(`voice: villagerBeats=${vb} sensed=${sb} share=${vb ? (100 * sb / vb).toFixed(1) : 0}% (PRIMARY GO: >=95%, zero unattributed)`);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
