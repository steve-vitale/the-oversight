#!/usr/bin/env node
// scripts/sweep-pitapprentice-b.js — apprentice-matching hook measurement
// (arm sim-pitapprentice-b, loop B, run fleshout-loop-b; answers findings #612).
//
// BEFORE/AFTER on identical seeds: the engine-side apprentice-matching hook
// (agencyMatchApprentice — teach chore prefers a need-gated pit/snare-eligible
// learner when the teacher knows the craft) vs the hook disabled.
//
// 8 fresh seeds (6801-6808; verified zero genuine hits in evidence/ +
// scripts/ before sims) x {leadfeast, belongfeast} x {armed, control} =
// 32 runs, 180d death-aware, paired by seed+policy.
//
// The SIDE is the env flag: control runs PITAPPRENTICE=0 (the hook-off chore
// path is the untouched master pick(here) line — proven byte-identical by the
// det-gate in test-pitapprentice-b.js); armed runs with the flag unset (hook
// default-ON). The script ASSERTS the tree/side/env contract and refuses
// otherwise (no silent mislabeling).
//
// Env contract (asserted up front, SWEEP STOPS on mismatch):
//   FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat), PITKNOWLEDGE unset
//   (channel ON both sides).
//
// Per-run JSON -> evidence/2026-10-22/perseed-pitapprentice-b/<side>-<policy>-s<seed>.json
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-pitapprentice-b.js <side> [policy]
//   side: armed | control   (control also needs PITAPPRENTICE=0 in env)
//   policy: both (default) | leadfeast | belongfeast
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('ENV MISMATCH: FEASTSCALE_R13 must be 1'); process.exit(1); }
if (process.env.SEATDRIVE !== '0') { console.error('ENV MISMATCH: SEATDRIVE must be 0 (explicit pre-seat)'); process.exit(1); }
if (process.env.PITKNOWLEDGE === '0') { console.error('ENV MISMATCH: PITKNOWLEDGE must be unset (channel ON)'); process.exit(1); }

const SIDE = process.argv[2];
if (SIDE !== 'armed' && SIDE !== 'control') { console.error('usage: sweep-pitapprentice-b.js <armed|control> [policy]'); process.exit(1); }
// TREE/SIDE/ENV CONTRACT: the hook must be in the tree; the env flag must match the side.
const vaSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'villager-agency.js'), 'utf8');
if (!vaSrc.includes('agencyMatchApprentice')) { console.error('TREE MISMATCH: agencyMatchApprentice not in villager-agency.js'); process.exit(1); }
const flagOff = process.env.PITAPPRENTICE === '0';
if ((SIDE === 'armed') === flagOff) {
  console.error(`ENV/SIDE MISMATCH: side=${SIDE} but PITAPPRENTICE=${process.env.PITAPPRENTICE || 'unset'}. Refusing.`);
  process.exit(1);
}
console.log(`tree/side/env contract ok: side=${SIDE} PITAPPRENTICE=${process.env.PITAPPRENTICE || 'unset'}`);

const SEEDS = [86001, 86002, 86003, 86004, 86005, 86006, 86007, 86008];
const POLICIES = (process.argv[3] && process.argv[3] !== 'both') ? [process.argv[3]] : ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-pitapprentice-b');

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
    hookPicks: 0, hookPit: 0, hookSnare: 0,
    pitLessons: 0, snareLessons: 0, plantLessons: 0, monsterLessons: 0,
    pitLessonRuns: [], // days of landed pit lessons
    matchedTopics: {},
    deaths: [],
  };

  // engagement instrument: the hook's preferential pick (sweep tooling only)
  try {
    const oMatch = Game.agencyMatchApprentice.bind(Game);
    Game.agencyMatchApprentice = function (t, c) {
      const m = oMatch(t, c);
      if (m && m.learner) { cen.hookPicks++; if (m.topic === 'pit') cen.hookPit++; if (m.topic === 'snare') cen.hookSnare++; }
      return m;
    };
  } catch (e) {}

  // lesson instrument: villager-to-villager lessons by topic.
  // NOTE: the chore attaches lesson.matchedTopic AFTER agencyTeachVillager
  // returns, so matchedTopic is read at end-of-run off the stored result
  // objects (same reference the chore mutates) — not synchronously.
  const taughtResults = [];
  try {
    const oTeach = Game.agencyTeachVillager.bind(Game);
    Game.agencyTeachVillager = function (t, l) {
      const r = oTeach(t, l);
      try {
        if (r && r.taught) {
          taughtResults.push(r);
          if (r.topic === 'pit') { cen.pitLessons++; cen.pitLessonRuns.push(((this.state || {}).scholar || {}).day || 0); }
          else if (r.topic === 'snare') cen.snareLessons++;
          else cen.plantLessons++;
        }
      } catch (e) {}
      return r;
    };
  } catch (e) {}

  const oTele = Game.tele;
  Game.tele = function (t, d) {
    try {
      const day = ((this.state || {}).scholar || {}).day || 0;
      if (t === 'death') cen.deaths.push({ day, who: String((d && d.who) || '').slice(0, 14), kind: (d && d.kind) || '?', cause: (d && d.cause) || '?', player: !!(d && d.player) });
    } catch (e) {}
    return oTele.apply(this, arguments);
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, Object.assign({}, base), { days: DAYS }); });

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

  let endScale = 'village';
  try { if (Game.scaleRank) endScale = Game.scaleRank(); } catch (e) {}
  let won = false, tableWaiting = false, maxArc = 1;
  try { won = !!Game.won; } catch (e) {}
  try { const ps = Game.progState() || {}; tableWaiting = !!ps.tableWaiting; maxArc = ps.arc || 1; } catch (e) {}
  let knowsPitEnd = 0, knowsSnareEnd = 0;
  try {
    for (const id of ((Game.state.village || {}).roster || [])) {
      const p = Game.vpOf(id);
      if (p && !p.dead) { if (p.knowsPit) knowsPitEnd++; if (p.knowsSnare) knowsSnareEnd++; }
    }
  } catch (e) {}
  // matchedTopic is attached by the chore after the teach call returns;
  // read it now (end of run) off the stored result objects.
  for (const r of taughtResults) {
    try { if (r && r.matchedTopic) cen.matchedTopics[r.matchedTopic] = (cen.matchedTopics[r.matchedTopic] || 0) + 1; } catch (e) {}
  }

  const rec = {
    seed, side: SIDE, policy: policyId, days: result.days, endReason: result.endReason,
    env: { feastscale: '1', seatdrive: '0', pitknowledge: 'unset(on)', pitapprentice: flagOff ? '0(off)' : 'unset(on)' },
    hook: { picks: cen.hookPicks, pit: cen.hookPit, snare: cen.hookSnare, matchedTopics: cen.matchedTopics },
    lessons: {
      pit: cen.pitLessons, pitDays: cen.pitLessonRuns,
      snare: cen.snareLessons, plants: cen.plantLessons,
    },
    knowEnd: { knowsPit: knowsPitEnd, knowsSnare: knowsSnareEnd },
    wall: { endScale, won, tableWaiting, maxWaveUnlocked: result.maxWaveUnlocked || 0, maxArc },
    deaths: { player: playerDeaths, villager: villagerDeaths, buckets: deathBuckets },
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const fn = path.join(OUTDIR, `${SIDE}-${policyId}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(rec, null, 1));
  console.log(`done: ${SIDE} ${policyId} s${seed} days=${result.days} hook=${cen.hookPicks}(p${cen.hookPit}/s${cen.hookSnare}) pitL=${cen.pitLessons} snareL=${cen.snareLessons} plantL=${cen.plantLessons} scale=${endScale} w=${result.maxWaveUnlocked || 0} won=${won}`);
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
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  const isNat = s => s === 'national' || s === 'global';
  const starv = runs.reduce((t, r) => t + ((r.deaths.buckets || {}).starvation || 0), 0);
  console.log(`SUMMARY side=${SIDE} n=${n} hookPicks=${runs.reduce((t, r) => t + r.hook.picks, 0)} pitLessons=${runs.reduce((t, r) => t + r.lessons.pit, 0)} snareLessons=${runs.reduce((t, r) => t + r.lessons.snare, 0)} plantLessons=${runs.reduce((t, r) => t + r.lessons.plants, 0)} pitRuns=${runs.filter(r => r.lessons.pit > 0).length} medianDays=${med(runs.map(r => r.days))} starv=${starv} wins=${runs.filter(r => r.wall.won).length} national=${runs.filter(r => isNat(r.wall.endScale)).length} table=${runs.filter(r => r.wall.tableWaiting).length} wave4=${runs.filter(r => r.wall.maxWaveUnlocked >= 4).length} wave5=${runs.filter(r => r.wall.maxWaveUnlocked >= 5).length}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
