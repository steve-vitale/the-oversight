#!/usr/bin/env node
// scripts/sweep-casualtyseq-20261015.js — the post-wave-4-unlock casualty
// sequence (sim-casualtyseq, 2026-10-15, scale-onramp axis).
//
// DIAGNOSTIC ARM, instrument-only: 8 seeds [111..888] x {leadfeast,
// belongfeast} on the ARMED win-side stack (tribfloor base -> withWinDefer
// -> withSeatDrive; policies imported from ./policies/seatdrive.js, same
// ids as the sim-seatdrive sweep), 180d death-aware, zero src/js changes.
//
// For EVERY run that unlocks wave 4, the instrument records the unlock day
// and then EVERY subsequent death, in order: day, raw cause, death family
// (holdloss-lib classifyDeathFamily), requested taxonomy (combat /
// villager-combat / starvation / disease / exile / other), inter-death
// interval, roster before/after, pantry kcal + pantry-days at the death
// beat, scholar state (alive/exiled/hp) at the death beat. Post-unlock
// daily trajectory rows (roster, pantry) feed the median-roster-trajectory
// question. All deaths pre-unlock are also recorded for the pre-unlock
// cause-share comparison (unlock-30d window).
//
// The death wrapper reads engine state before AND after calling the
// original registerDeath — reads only, never writes game code. Beats
// (death/funeral language) are captured for the SENSE-TESTING read.
//
// Modes:
//   SMOKE=1      15d x {leadfeast,belongfeast}: samples collect, no crash.
//   DETGATE=1    D1 gate determinism (60d x2 byte-identical trajectory hash
//                with the instrument attached); D2 instrument ON vs OFF
//                byte-identical 60d; D3 deaths captured on a 60d run
//                (non-empty when the village dies).
//   ANALYZE=1    re-analyze persisted per-seed JSONs, no sims (recovery).
//   default      the 16-run suite -> evidence/2026-10-15/perseed-casualtyseq/,
//                evidence/2026-10-15/casualtyseq-runs.json.
//
// Env:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 node scripts/sweep-casualtyseq-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const HL = require('./holdloss-lib-20261015');
const RB = require('./readinessbind-lib');
const SD = require('./policies/seatdrive');

const flags = { R13: process.env.FEASTSCALE_R13 === '1', TF: process.env.TRIBFLOOR === '1', SG: process.env.SUCCGRACE === '1', RD: process.env.RAIDDENSITY === '1', WP: process.env.WINPURSUIT === '1', WD: process.env.WINDEFER === '1', SDV: process.env.SEATDRIVE === '1' };
const missing = Object.entries(flags).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('CASUALTYSEQ FATAL: substrate flags required: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 (missing: ' + missing.join(',') + ').');
  process.exit(2);
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [111, 222, 333, 444, 555, 666, 777, 888]).filter(Number.isFinite);
const POLICIES = (process.env.POLICYIDS ? process.env.POLICYIDS.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']).filter(s => ['leadfeast', 'belongfeast'].includes(s));
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-casualtyseq');
const TRAJ_DAYS = 60; // post-unlock trajectory window

function policyFor(pid) { return pid === 'leadfeast' ? SD.leadseat : SD.belongseat; }

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// --- engine reads (read-only; the survdiff sampler's conventions) ---
function livingRoster(Game) {
  try {
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    return (v.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
}
function hpOf(Game, vid) {
  try {
    const h = ((Game.state.village || {}).health || {})[vid];
    if (h === undefined || h === null) return null;
    return +h;
  } catch (e) { return null; }
}
function pantryKcal(Game) {
  try {
    let k = 0;
    for (const it of (((Game.state.village || {}).pantry) || [])) k += ((it && it.kcalEach) || 0) * ((it && it.units) || 1);
    return Math.round(k);
  } catch (e) { return 0; }
}
function pantryDays(Game) {
  try { return Game.pantryDaysEstimate ? Math.min(999, Game.pantryDaysEstimate()) : 0; } catch (e) { return 0; }
}
function scholarState(Game) {
  const s = { alive: true, exiled: false, hp: null, joinedVillage: false };
  try {
    const sch = (Game.state || {}).scholar || {};
    s.exiled = !!sch.exiled;
    s.joinedVillage = !!sch.joinedVillage;
  } catch (e) {}
  try {
    const sid = Game.villagerId;
    if (sid && typeof Game.getPerson === 'function') {
      const p = Game.getPerson(sid);
      s.alive = !(p && p.dead);
    }
    const hp = hpOf(Game, Game.villagerId);
    if (hp !== null) s.hp = hp;
  } catch (e) {}
  return s;
}
function standingAt(Game) {
  const s = { uw: 1, raw: 0, gated: 0, war: 0, diplomacy: 0, plenty: 0 };
  try { s.uw = Game.unlockedWave ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  try {
    const b = Game.villageStanding ? Game.villageStanding() : null;
    if (b) { s.war = b.war | 0; s.diplomacy = b.diplomacy | 0; s.plenty = b.plenty | 0; s.raw = s.war + s.diplomacy + s.plenty; }
  } catch (e) {}
  try { s.gated = Game.villageStandingTotal ? (Game.villageStandingTotal() | 0) : s.raw; } catch (e) {}
  return s;
}
function dominantRoad(s) {
  const r = (s && s.raw) | 0;
  if (!r) return 'none';
  const lanes = [['blood', s.war / r], ['bonds', s.diplomacy / r], ['bread', s.plenty / r]].sort((a, b) => b[1] - a[1]);
  if (lanes[1][1] >= 0.4) return 'hybrid';
  return lanes[0][0];
}

// Requested taxonomy: combat | villager-combat | starvation | disease | exile | other.
// - combat: the SCHOLAR died with a combat/monster family cause.
// - villager-combat: a villager died with a combat/monster family cause.
// - starvation / disease (sickness family): scholar or villager.
// - exile: not a death — scholar-exile run exit, recorded on the run record.
// - other: wounds, or unclassifiable (raw preserved).
function classifyTaxonomy(death) {
  const fam = death.family;
  const scholar = !!death.player;
  if (fam === 'combat' || fam === 'monster') return scholar ? 'combat' : 'villager-combat';
  if (fam === 'starvation') return 'starvation';
  if (fam === 'sickness') return 'disease';
  return 'other';
}

// Beat capture: death/funeral/wave language for the SENSE-TESTING read.
// Ring buffer (sim-findings #303 lesson — fixed caps bias against late-game events).
const BEAT_RE = /funeral|buried|bury |grave|wake|mourning|mourn|grief|eulogy|the dead hold|dead hold no|treaties|fray|silence answered|grief delays|succession|verdict|died|dead|death|killed|slain|fallen|mirror draft|wave 4|wave 5|reunion|the eater|exile|banish/i;
function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 5000) t.beats.splice(0, 1000);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

// Death capture: wrap registerDeath; read BEFORE calling orig (victim's
// pre-death vitals + roster-before) and AFTER (roster-after). Reads only.
// Also merges the harness tele death rows (result.samples.deaths) later,
// deduped by day|id|cause — the survdiff D2-verified convention.
function attachDeaths(Game, t) {
  t.deathsRaw = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      let pre = null;
      try {
        const o = opts || {};
        const vid = String(o.villagerId || o.monsterId || '').slice(0, 24);
        pre = {
          day: gday(Game), kind: String(o.kind || '?'),
          vid, name: String(o.name || '?').slice(0, 40),
          cause: String(o.cause || '?').slice(0, 80),
          victimHp: vid ? hpOf(Game, vid) : null,
          rosterBefore: livingRoster(Game).length,
          pantryKcal: pantryKcal(Game), pantryDays: pantryDays(Game),
          scholar: scholarState(Game),
        };
      } catch (e) { pre = null; }
      const r = origReg(opts);
      try {
        const rec = Object.assign({ rosterAfter: livingRoster(Game).length }, pre || { day: gday(Game), kind: '?', vid: '?', name: '?', cause: '?', unobservable: true });
        rec.player = /player|scholar/i.test(rec.kind);
        if (t.deathsRaw.length < 800) t.deathsRaw.push(rec);
      } catch (e) {}
      return r;
    };
  }
}

async function oneRun(seed, pid, days, opts) {
  opts = opts || {};
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '1';
  const base = policyFor(pid);
  const { Game } = await loadGame({ seed, mode: 'casualtyseq-' + pid });
  await setupGame(Game);

  const t = { beats: [], deathsRaw: [] };
  if (opts.instrument !== false) { attachBeats(Game, t); attachDeaths(Game, t); }

  const hashes = [];
  const traj = [];
  let unlockDay = null, unlockState = null;
  const stAtUnlock = () => ({ rosterN: livingRoster(Game).length, pantryKcal: pantryKcal(Game), pantryDays: pantryDays(Game), scholar: scholarState(Game), standing: standingAt(Game) });

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      hashes.push(RB.trajectoryHash(G));
      const st = standingAt(G);
      if (unlockDay === null && st.uw >= 4) {
        unlockDay = gday(G);
        unlockState = Object.assign(stAtUnlock(), { road: dominantRoad(st) });
      }
      if (unlockDay !== null && gday(G) - unlockDay <= TRAJ_DAYS) {
        traj.push({ day: gday(G), rosterN: livingRoster(G).length, pantryKcal: pantryKcal(G), pantryDays: pantryDays(G), scholarAlive: scholarState(G).alive, scholarExiled: scholarState(G).exiled });
      }
    } catch (e) {}
  };

  const result = await quietLog(async () => runDays(Game, policy, { days, sampleEvery: 10 }));
  const daysRan = result.days;
  const endReason = result.endReason;
  const finalScholar = scholarState(Game);

  // Merge wrap + tele death sources, dedupe on day|id|cause (survdiff convention).
  const seen = new Set(), deaths = [];
  const addDeath = (d) => {
    const id = String(d.vid || d.who || '?').split('/')[0];
    const k = d.day + '|' + id + '|' + (d.cause || '');
    if (seen.has(k)) return;
    seen.add(k);
    const fam = HL.classifyDeathFamily(d.cause).family;
    deaths.push(Object.assign({}, d, { family: fam, taxonomy: classifyTaxonomy({ family: fam, player: !!d.player }) }));
  };
  for (const d of (t.deathsRaw || [])) addDeath(d);
  for (const d of (((result.samples || {}).deaths) || [])) {
    addDeath({ day: d.day, vid: String(d.who || '').slice(0, 24), name: String(d.who || '').slice(0, 40), cause: String(d.cause || ''), player: !!d.player, rosterBefore: null, rosterAfter: null, pantryKcal: null, pantryDays: null, scholar: null, victimHp: null, tele: true });
  }
  deaths.sort((a, b) => (a.day | 0) - (b.day | 0));

  // Self-consistency guard (survdiff repair lesson): every death day in
  // [1, engine-final-day]. The engine's own day can run a couple of days
  // past runDays' day counter when the village dies mid-processing
  // (belongfeast-s555: engine day 72 at daysRan=70) — so the guard
  // references the engine's final day, not runDays'. A drift note goes
  // in the console for the evidence trail.
  const finalEngineDay = gday(Game);
  if (finalEngineDay > daysRan + 1) console.log(`  [drift] engine day ${finalEngineDay} > daysRan ${daysRan} (run ${pid}-s${seed})`);
  const badDays = deaths.filter(d => !(d.day >= 1 && d.day <= finalEngineDay + 1));
  if (badDays.length) throw new Error('CASUALTYSEQ FATAL: death day out of range: ' + JSON.stringify(badDays.slice(0, 3)) + ' (engineDay=' + finalEngineDay + ', daysRan=' + daysRan + ')');

  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');

  // Post-unlock sequence with inter-death intervals + roster before/after.
  let postDeaths = [];
  if (unlockDay !== null) {
    const pd = deaths.filter(d => d.day >= unlockDay);
    let prevDay = unlockDay;
    postDeaths = pd.map(d => {
      const interval = (d.day | 0) - prevDay;
      prevDay = d.day | 0;
      return Object.assign({ post: true, interval }, d);
    });
  }
  const preWindowDeaths = unlockDay !== null ? deaths.filter(d => d.day >= unlockDay - 30 && d.day < unlockDay) : [];

  return {
    policy: pid, seed, unlockDay: unlockDay === null ? null : unlockDay,
    unlockState, daysRan, endReason, trajHash,
    finalScholar, scholarFinal: finalScholar,
    deaths, postDeaths, preWindowDeaths,
    dailyTraj: traj,
    beats: t.beats,
    exile: finalScholar.exiled,
  };
}

function persistRow(row) {
  fs.mkdirSync(EVID, { recursive: true });
  const p = path.join(EVID, row.policy + '-s' + row.seed + '.json');
  fs.writeFileSync(p, JSON.stringify(row, null, 1));
  return p;
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const pid of POLICIES) {
    const row = await oneRun(111, pid, 15);
    check(pid + ': run completes', !!(row && row.daysRan >= 15), `days=${row.daysRan}`);
    check(pid + ': deaths instrumented', Array.isArray(row.deaths), `deaths=${row.deaths.length}`);
    check(pid + ': beats instrumented', Array.isArray(row.beats) && row.beats.length > 0, `beats=${row.beats.length}`);
    const anyTax = row.deaths.every(d => !!d.taxonomy);
    check(pid + ': taxonomy always assigned', anyTax, `n=${row.deaths.length}`);
  }
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  // D1: determinism with the instrument attached.
  const a = await oneRun(222, 'leadfeast', 60);
  const b = await oneRun(222, 'leadfeast', 60);
  check('D1: trajectory hash identical (seed 222, 60d)', a.trajHash === b.trajHash, `${a.trajHash.slice(0, 12)} vs ${b.trajHash.slice(0, 12)}`);
  check('D1: death rows identical', JSON.stringify(a.deaths) === JSON.stringify(b.deaths), `a=${a.deaths.length} b=${b.deaths.length}`);
  // D2: instrument ON vs OFF byte-identical.
  const c = await oneRun(333, 'belongfeast', 60, { instrument: false });
  const d = await oneRun(333, 'belongfeast', 60);
  check('D2: ON vs OFF byte-identical', c.trajHash === d.trajHash, `${c.trajHash.slice(0, 12)} vs ${d.trajHash.slice(0, 12)}`);
  // D3: deaths captured on a 60d run (non-empty when the village dies).
  check('D3: deaths captured (seed 333)', d.deaths.length > 0 || d.daysRan >= 60, `deaths=${d.deaths.length} days=${d.daysRan}`);
  const e = await oneRun(333, 'belongfeast', 60);
  check('D3: death rows day-stamped in range', e.deaths.every(x => x.day >= 1 && x.day <= 61), `n=${e.deaths.length}`);
  if (fails.length) { console.error('DETGATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('DETGATE green (D1 D2 D3).');
}

function median(xs) {
  const a = (xs || []).filter(x => typeof x === 'number' && isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

// --- analysis over persisted rows ---
function analyze(rows) {
  const out = { nRuns: rows.length };
  const unlocking = rows.filter(r => r.unlockDay !== null);
  out.nUnlocking = unlocking.length;
  out.noUnlock = rows.filter(r => r.unlockDay === null).map(r => ({ policy: r.policy, seed: r.seed, daysRan: r.daysRan, endReason: r.endReason }));

  const postDeaths = [];
  for (const r of unlocking) for (const d of (r.postDeaths || [])) postDeaths.push(Object.assign({ policy: r.policy, seed: r.seed, unlockDay: r.unlockDay }, d));
  out.postDeathsN = postDeaths.length;

  // (a) classification completeness + cause shares
  const taxCounts = {};
  const others = [];
  for (const d of postDeaths) {
    taxCounts[d.taxonomy] = (taxCounts[d.taxonomy] | 0) + 1;
    if (d.taxonomy === 'other') others.push({ run: d.policy + '-s' + d.seed, day: d.day, family: d.family, raw: d.cause, name: d.name });
  }
  const unclassified = postDeaths.filter(d => !d.taxonomy);
  out.a = {
    classified: postDeaths.length - unclassified.length,
    total: postDeaths.length,
    completeness: postDeaths.length ? +(((postDeaths.length - unclassified.length) / postDeaths.length) * 100).toFixed(2) : 100,
    causeShares: taxCounts,
    otherN: others.length,
    others,
  };

  // (b) inter-death intervals
  const intervals = postDeaths.map(d => d.interval).filter(x => typeof x === 'number');
  out.b = {
    n: intervals.length,
    median: median(intervals),
    min: intervals.length ? Math.min.apply(null, intervals) : null,
    max: intervals.length ? Math.max.apply(null, intervals) : null,
    mean: intervals.length ? +(intervals.reduce((s, x) => s + x, 0) / intervals.length).toFixed(2) : null,
    dist: binIntervals(intervals),
    zeroDayClusters: intervals.filter(x => x === 0).length, // multi-death same-day beats
  };

  // (c) median roster trajectory unlock+0..+60 (N per offset)
  const traj = [];
  for (let off = 0; off <= TRAJ_DAYS; off += 5) {
    const vals = [];
    for (const r of unlocking) {
      const target = r.unlockDay + off;
      const rows2 = (r.dailyTraj || []).filter(x => x.day === target);
      if (rows2.length) vals.push(rows2[rows2.length - 1].rosterN);
      else {
        // carry: last known row before end
        const last = (r.dailyTraj || []).filter(x => x.day <= target).pop();
        if (last && r.daysRan >= target) vals.push(last.rosterN);
      }
    }
    traj.push({ offset: off, n: vals.length, medianRoster: median(vals) });
  }
  out.c = { trajectory: traj, unlockMedianRoster: median(unlocking.map(r => (r.unlockState || {}).rosterN)) };

  // (d) cause shares: post-unlock window (unlock -> unlock+60/death/end) vs pre-unlock window (unlock-30 -> unlock)
  const postW = {};
  for (const d of postDeaths) { if (d.day - d.unlockDay <= TRAJ_DAYS) postW[d.taxonomy] = (postW[d.taxonomy] | 0) + 1; }
  const preW = {};
  for (const r of unlocking) for (const d of (r.preWindowDeaths || [])) preW[d.taxonomy] = (preW[d.taxonomy] | 0) + 1;
  const preAll = {};
  for (const r of unlocking) for (const d of (r.deaths || [])) if (d.day < r.unlockDay) preAll[d.taxonomy] = (preAll[d.taxonomy] | 0) + 1;
  out.d = { postWindow: postW, preWindow30: preW, preUnlockAll: preAll };

  // (e) hidden-driver candidates (pre-registered heuristics)
  const candidates = [];
  for (const d of postDeaths) {
    if (d.taxonomy === 'starvation' && (d.pantryDays | 0) >= 7) {
      candidates.push({ type: 'starvation-with-food', run: d.policy + '-s' + d.seed, day: d.day, name: d.name, pantryKcal: d.pantryKcal, pantryDays: d.pantryDays, cause: d.cause });
    }
    if ((d.family === 'combat' || d.family === 'monster') && (d.victimHp | 0) >= 95) {
      candidates.push({ type: 'fullhp-combat-death', run: d.policy + '-s' + d.seed, day: d.day, name: d.name, hp: d.victimHp, cause: d.cause, note: 'flagged for fight-proximity review against the run beats' });
    }
  }
  out.e = { n: candidates.length, candidates };

  // run-level census for the evidence narrative
  out.census = unlocking.map(r => ({
    run: r.policy + '-s' + r.seed,
    unlockDay: r.unlockDay, road: (r.unlockState || {}).road || null,
    postDeathsN: (r.postDeaths || []).length,
    daysRan: r.daysRan, endReason: r.endReason,
    scholarAliveEnd: !!(r.scholarFinal && r.scholarFinal.alive),
    exiled: !!r.exile,
  }));
  return out;
}

function binIntervals(xs) {
  const bins = { '0': 0, '1': 0, '2-3': 0, '4-7': 0, '8-14': 0, '15-30': 0, '31+': 0 };
  for (const x of xs) {
    if (x === 0) bins['0']++;
    else if (x === 1) bins['1']++;
    else if (x <= 3) bins['2-3']++;
    else if (x <= 7) bins['4-7']++;
    else if (x <= 14) bins['8-14']++;
    else if (x <= 30) bins['15-30']++;
    else bins['31+']++;
  }
  return bins;
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  if (process.env.DETGATE === '1') { await detGate(); return; }
  if (process.env.ANALYZE === '1') {
    const rows = [];
    for (const pid of POLICIES) for (const seed of SEEDS) {
      const p = path.join(EVID, pid + '-s' + seed + '.json');
      if (fs.existsSync(p)) rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
      else console.log('  MISSING: ' + pid + '-s' + seed);
    }
    const a = analyze(rows);
    console.log(JSON.stringify(a, null, 1));
    fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-15', 'casualtyseq-analysis.json'), JSON.stringify(a, null, 1));
    return;
  }
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      console.log(`-- ${pid} s${seed}`);
      const row = await oneRun(seed, pid, DAYS);
      const p = persistRow(row);
      rows.push(row);
      console.log(`   days=${row.daysRan} end=${row.endReason} unlock4=${row.unlockDay} postDeaths=${row.postDeaths.length} beats=${row.beats.length}`);
    }
  }
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-15', 'casualtyseq-runs.json'),
    JSON.stringify(rows.map(r => ({ policy: r.policy, seed: r.seed, unlockDay: r.unlockDay, daysRan: r.daysRan, endReason: r.endReason, postDeathsN: (r.postDeaths || []).length })), null, 1));
  const a = analyze(rows);
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-15', 'casualtyseq-analysis.json'), JSON.stringify(a, null, 1));
  console.log('ANALYSIS SUMMARY: ' + JSON.stringify({ nUnlocking: a.nUnlocking, postDeathsN: a.postDeathsN, completeness: a.a.completeness, causeShares: a.a.causeShares, intervalMedian: a.b.median, intervalRange: [a.b.min, a.b.max] }));
}

// Export the attach functions so a future proof test can import them
// (survdiff metric-review lesson: the sweep's wiring needs proof coverage).
module.exports = { attachBeats, attachDeaths, gday, livingRoster, scholarState, classifyTaxonomy, analyze };

if (require.main === module) {
  main().catch(e => { console.error('CASUALTYSEQ FATAL: ' + (e && e.stack || e)); process.exit(1); });
}
