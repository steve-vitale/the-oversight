#!/usr/bin/env node
// scripts/sweep-pithear-b.js — pit_overhear recount-hook pilot
// (arm sim-pithear-b, loop B food-economy axis, run fleshout-loop-b-20261019T0317Z).
//
// BEFORE/AFTER on identical seeds: the recount hook (scholar.missedPitLesson
// marked by the teach-chore block when a landed pit apprenticeship finds the
// scholar away; consumed by returnToVillage as the apprentice's retelling)
// vs the unmodified channel (watched overhear only).
//
// 8 fresh seeds (9551-9558; verified zero genuine hits in evidence/ +
// scripts/ before sims) x {leadfeast, belongfeast} x {armed, control} =
// 32 runs, 180d death-aware, paired by seed+policy.
//
// The SIDE is the code in the tree: run with the hook committed in the
// worktree for `armed`, with HEAD's game.js + villager-objectives.js for
// `control`. The script ASSERTS the tree matches the requested side and
// refuses otherwise (no silent mislabeling).
//
// Env contract (asserted up front, SWEEP STOPS on mismatch):
//   FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat), PITKNOWLEDGE unset
//   (channel ON both sides).
//
// Per-run JSON -> evidence/2026-10-19/perseed-pithear-b/<side>-<policy>-s<seed>.json
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-pithear-b.js <side> [policy]
//   side: armed | control
//   policy: both (default) | leadfeast | belongfeast
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('ENV MISMATCH: FEASTSCALE_R13 must be 1'); process.exit(1); }
if (process.env.SEATDRIVE !== '0') { console.error('ENV MISMATCH: SEATDRIVE must be 0 (explicit pre-seat)'); process.exit(1); }
if (process.env.PITKNOWLEDGE === '0') { console.error('ENV MISMATCH: PITKNOWLEDGE must be unset (channel ON)'); process.exit(1); }

const SIDE = process.argv[2];
if (SIDE !== 'armed' && SIDE !== 'control') { console.error('usage: sweep-pithear-b.js <armed|control> [policy]'); process.exit(1); }
// TREE/SIDE CONTRACT: the hook must be present iff side=armed.
const voSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'villager-objectives.js'), 'utf8');
const gSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
const hasHook = voSrc.includes('pitLessonRecount()') && gSrc.includes('this.pitLessonRecount()');
if ((SIDE === 'armed') !== hasHook) {
  console.error(`TREE/SIDE MISMATCH: side=${SIDE} but hook present=${hasHook}. Refusing.`);
  process.exit(1);
}
console.log(`tree/side contract ok: side=${SIDE} hook=${hasHook}`);

const SEEDS = [9551, 9552, 9553, 9554, 9555, 9556, 9557, 9558];
const POLICIES = (process.argv[3] && process.argv[3] !== 'both') ? [process.argv[3]] : ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-pithear-b');

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

function bucket(cause, monsterNames) {
  const c = String(cause || 'unknown').toLowerCase();
  if (monsterNames && monsterNames.has(c.replace(/_/g, ' '))) return 'monster:' + c;
  if (/starv|hunger|famine/.test(c)) return 'starvation';
  if (/dehydrat|thirst|water/.test(c)) return 'dehydration';
  if (/disease|sick|infection|fever|plague/.test(c)) return 'disease';
  if (/wound|bleed|maul|gore|bite|claw/.test(c)) return 'wounds';
  if (/cold|hypotherm|freeze|heat/.test(c)) return 'exposure';
  if (/combat|fight|kill|murder|executed/.test(c)) return 'violence';
  if (/poison|venom/.test(c)) return 'poison';
  if (/drown/.test(c)) return 'drowning';
  if (/own pit/.test(c)) return 'own-pit-trap';
  if (/age|old/.test(c)) return 'age';
  return 'other:' + c.slice(0, 24);
}

async function runOne(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: true });
  await setupGame(Game);

  const cen = {
    overhears: [], // {day, teacher, via}
    teaches: [], lessons: [], grants: [],
    markings: 0, // missedPitLesson null->set transitions observed
    deaths: [],
  };
  let hadMissed = false;

  const oTele = Game.tele;
  Game.tele = function (t, d) {
    try {
      const day = ((this.state || {}).scholar || {}).day || 0;
      if (t === 'pit_overhear') cen.overhears.push({ day, teacher: String((d && d.teacher) || '').slice(0, 14), via: (d && d.via) || 'watched' });
      else if (t === 'pit_teach') cen.teaches.push({ day });
      else if (t === 'pit_lesson') cen.lessons.push({ day, need: d && d.need });
      else if (t === 'death') cen.deaths.push({ day, who: String((d && d.who) || '').slice(0, 14), kind: (d && d.kind) || '?', cause: (d && d.cause) || '?', player: !!(d && d.player) });
    } catch (e) {}
    return oTele.apply(this, arguments);
  };

  const oGrant = Game.grantKnowledge.bind(Game);
  Game.grantKnowledge = function (domain, id, level, source) {
    let r = false;
    try { r = oGrant(domain, id, level, source); } catch (e) { throw e; }
    try {
      if (r === true && domain === 'recipe' && id === 'pit_trap') {
        cen.grants.push({ day: ((Game.state.scholar || {}).day || 0), level, via: (source && source.type) || '?', by: (source && source.by) || null });
      }
    } catch (e) {}
    return r;
  };

  const base_daily = base.daily;
  const policy = Object.assign({}, base);
  policy.daily = (G, ctx) => {
    const r = base_daily ? base_daily(G, ctx) : undefined;
    try {
      const m = !!((G.state.scholar || {}).missedPitLesson);
      if (m && !hadMissed) cen.markings++;
      hadMissed = m;
    } catch (e) {}
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS }); });

  const monsterNames = new Set();
  try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}
  const deathBuckets = {};
  let playerDeaths = 0, villagerDeaths = 0;
  const me = Game.villagerId;
  for (const ev of cen.deaths) {
    if ((ev.kind || '') === 'monster') continue;
    const b = bucket(ev.cause, monsterNames);
    deathBuckets[b] = (deathBuckets[b] || 0) + 1;
    if (ev.who === String(me).slice(0, 14)) playerDeaths++; else villagerDeaths++;
  }

  let maxScale = 'village';
  try { if (Game.scaleRank) maxScale = Game.scaleRank(); } catch (e) {}
  let won = false, tableWaiting = false, maxArc = 1;
  try { won = !!Game.won; } catch (e) {}
  try { const ps = Game.progState() || {}; tableWaiting = !!ps.tableWaiting; maxArc = ps.arc || 1; } catch (e) {}

  const watched = cen.overhears.filter(o => o.via === 'watched').length;
  const recounted = cen.overhears.filter(o => o.via === 'recount').length;
  const rec = {
    seed, side: SIDE, policy: policyId, days: result.days, endReason: result.endReason,
    env: { feastscale: process.env.FEASTSCALE_R13, seatdrive: process.env.SEATDRIVE, pitknowledge: 'unset(on)' },
    chain: {
      lessons: cen.lessons.length,            // pit apprenticeships landed
      markings: cen.markings,                 // missed-while-away markings
      overhears: cen.overhears.length,
      overhearsWatched: watched,
      overhearsRecounted: recounted,
      teaches: cen.teaches.length,            // pit_teach beat
      grants: cen.grants,                     // pit_trap grants by via type
    },
    wall: { maxScale, won, tableWaiting, maxWaveUnlocked: result.maxWaveUnlocked || 0, maxArc },
    deaths: { player: playerDeaths, villager: villagerDeaths, buckets: deathBuckets },
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const fn = path.join(OUTDIR, `${SIDE}-${policyId}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(rec, null, 1));
  console.log(`done: ${SIDE} ${policyId} s${seed} days=${result.days} lessons=${cen.lessons.length} marks=${cen.markings} oh=${cen.overhears.length}(w${watched}/r${recounted}) grants=${cen.grants.map(g => g.via).join(',') || '-'} w=${result.maxWaveUnlocked || 0} won=${won}`);
  return rec;
}

(async () => {
  const runs = [];
  for (const seed of SEEDS) {
    for (const pid of POLICIES) {
      try { runs.push(await runOne(seed, pid)); }
      catch (e) { console.error(`FATAL ${SIDE}/${pid}/s${seed}`, e); process.exit(1); }
    }
  }
  const n = runs.length;
  const oh = runs.reduce((t, r) => t + r.chain.overhears, 0);
  const ohW = runs.reduce((t, r) => t + r.chain.overhearsWatched, 0);
  const ohR = runs.reduce((t, r) => t + r.chain.overhearsRecounted, 0);
  const lessons = runs.reduce((t, r) => t + r.chain.lessons, 0);
  const marks = runs.reduce((t, r) => t + r.chain.markings, 0);
  const teaches = runs.reduce((t, r) => t + r.chain.teaches, 0);
  const grants = {};
  for (const r of runs) for (const g of r.chain.grants) grants[g.via] = (grants[g.via] || 0) + 1;
  const days = runs.map(r => r.days).sort((a, b) => a - b);
  const med = days.length % 2 ? days[days.length >> 1] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
  const isNat = s => s === 'national' || s === 'global';
  console.log(`SUMMARY side=${SIDE} n=${n} lessons=${lessons} marks=${marks} overhears=${oh}(w${ohW}/r${ohR}) teaches=${teaches} grants=${JSON.stringify(grants)} medianDays=${med} wins=${runs.filter(r => r.wall.won).length} national=${runs.filter(r => isNat(r.wall.maxScale)).length} table=${runs.filter(r => r.wall.tableWaiting).length} wave4=${runs.filter(r => r.wall.maxWaveUnlocked >= 4).length} wave5=${runs.filter(r => r.wall.maxWaveUnlocked >= 5).length}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
