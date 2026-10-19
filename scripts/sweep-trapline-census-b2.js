#!/usr/bin/env node
// scripts/sweep-trapline-census-b2.js — event-tracked NPC trapper census
// (arm sim-trapline-census-b2, loop B food-economy axis, run
// fleshout-loop-b-20261019T1030Z, instrument-only diagnostic).
//
// Named next from #581 (sim-pitstaff-b2, pitstaff 0-for-2 — do NOT re-run
// staffing): INSTRUMENT the live NPC trapper economy, don't staff it.
// Per #603: track join/vid-appearance EVENTS, never roster snapshots —
// transient trappers must be counted. Per #613: joiners arriving WITH
// knowsPit learned-via-apprenticeship are a second sustain path —
// classify join origin (background-trapper / learned-in-run /
// pre-run-learned). Per #612: probe the learner-gate mismatch — the
// ambient teach chore picks learners at random among villagers present,
// the pit_lesson needs a hungry-or-novice learner; measure how often pit
// attempts die at the need gate (the engine-hook evidence).
//
// INSTRUMENT-ONLY: zero game-code changes. Wrappers are passive
// (record-and-delegate); the instrument introduces no RNG and no Date.now,
// so trajectories stay deterministic (proven by the det-gate in
// scripts/test-trapline-census-b2.js).
//
// 16 fresh-seed runs (7931-7938; verified zero genuine hits in evidence/,
// scripts/, hidden_files/ before sims — 7901-7908 were consumed by
// sim-cookbulk-b) x {leadfeast, belongfeast}, 180d death-aware, on the
// live substrate. No off-side: this is a census, not a lever.
//
// Env contract (asserted up front, SWEEP STOPS on mismatch):
//   FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat).
// Base SHA frozen: 6143e6cd680f37e85174ee6114f36a5bfe6c154c
//
// Per-run JSON ->
//   evidence/2026-10-19/perseed-trapline-census-b2/<policy>-s<seed>.json
//
// Census (per run):
//   day0: every roster villager with knowsPit (vid, name, occ, age);
//     scholar occupation + pit_trap recipe level/via (background L3 grant)
//   joins: vid-appearance events (day, occ, age, knowsPit, origin,
//     rejoin?) — events, never snapshots
//   ledger: per-knowsPit-vid appearance-to-departure — catches (species,
//     kcal), teaches, lessons taught/learned, depart via death | exit |
//     exit-eor | survived | scholar-succession (a holder who inherits the
//     scholar's mantle leaves the NPC roster without dying — the daily
//     tick watches Game.villagerId for this);
//     ZERO unattributed transitions (any pit event on a vid with no
//     appear record, or any holder with no recorded depart)
//   apprenticeships: pit_lesson tele (teacher, learner, need) +
//     teach-chore call wrapper (learner hunger/novice state pre-call,
//     result taught/topic/need/failed) — the #612 mismatch data
//   pit_teach beats, pit_overhear, npc_pit catches with kcal + species,
//     holder deaths/exits (cause bucketed)
//   transcript: say lines mentioning pit/trap/snare/teach/join (bounded)
//   wall: maxScale/national, table, wins, wave reach, arc, survival
//   deaths: bucketed
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-trapline-census-b2.js [policy]
//   policy: both (default) | leadfeast | belongfeast
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('ENV MISMATCH: FEASTSCALE_R13 must be 1'); process.exit(1); }
if (process.env.SEATDRIVE !== '0') { console.error('ENV MISMATCH: SEATDRIVE must be 0 (explicit pre-seat)'); process.exit(1); }

const BASE_SHA = '6143e6cd680f37e85174ee6114f36a5bfe6c154c';
const SEEDS = [7931, 7932, 7933, 7934, 7935, 7936, 7937, 7938];
const POLICIES = (process.argv[2] && process.argv[2] !== 'both') ? [process.argv[2]] : ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-trapline-census-b2');
const TRAPPER_OCCS = new Set(['hunting_guide', 'trail_crew', 'rancher']);
const TRANSCRIPT_CAP = 600;
const SAYKEY = /pit|trap|snare|teach|walk someone|walks in|joined|Haven grows|trust/i;

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

function personInfo(Game, vid) {
  let person = null, vp = null;
  try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
  try { vp = Game.vpOf ? Game.vpOf(vid) : null; } catch (e) {}
  let name = String(vid).slice(0, 14);
  try { name = Game.displayName(vid) || name; } catch (e) {}
  return {
    vid: String(vid).slice(0, 14),
    name,
    occ: String((person && (person.occupationId || person.formerOccupation)) || '?'),
    age: person && person.age != null ? person.age : null,
    knowsPit: !!(vp && vp.knowsPit),
    dead: !!(person && person.dead),
  };
}

// Learner gate state, read BEFORE a teach attempt (same reads as the
// engine's own gate: npcNeeds hunger >= 60; agency tracking xp < 8).
function learnerState(Game, learnerVid) {
  let hunger = null, hungry = null, novice = null, pitTaught = null, knowsPit = null;
  try { hunger = (Game.npcNeeds(learnerVid).hunger || 0); hungry = hunger >= 60; } catch (e) {}
  try {
    const lag = Game.agencyOf ? Game.agencyOf(learnerVid) : null;
    const lxp = lag && lag.xp ? lag.xp[learnerVid] : null;
    novice = !lxp || (lxp.tracking || 0) < 8;
  } catch (e) {}
  try { const lvp = Game.vpOf ? Game.vpOf(learnerVid) : null; pitTaught = !!(lvp && lvp.pitTaught); knowsPit = !!(lvp && lvp.knowsPit); } catch (e) {}
  return { hunger, hungry, novice, pitTaught, knowsPit };
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const runDaysN = opts.days || DAYS;
  const outdir = opts.outdir || OUTDIR;
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: true });
  await setupGame(Game);
  const me = Game.villagerId;

  const cen = {
    joins: [], teaches: [], overhears: [], lessons: [], catches: [],
    deaths: [], teachCalls: [], transcript: [],
    ledger: {},          // vid -> holder ledger entry
    unattributed: [],    // ledger violations (must be empty)
  };
  // vid -> first day seen on roster (any appearance). me excluded.
  const seen = {};
  // vids with a death event (vid -> day).
  const deadVids = {};
  // vids whose pit_lesson learner record exists (vid -> {day, teacher, need}).
  const learnedPit = {};

  function holderAppear(vid, day, via, origin) {
    if (cen.ledger[vid]) return cen.ledger[vid];
    const e = {
      vid, appearDay: day, via, origin,
      catches: [], teaches: [], lessonsTaught: [], lessonsLearned: [],
      depart: null, departDay: null, departCause: null,
    };
    cen.ledger[vid] = e;
    return e;
  }
  function ensureHolder(vid, day, what) {
    if (!cen.ledger[vid]) {
      cen.unattributed.push({ day, what, vid });
    }
    return cen.ledger[vid] || null;
  }

  // --- day-0 census ---
  const day0 = { holders: [], scholarOcc: '?', scholarPitLevel: 0, scholarPitVia: null };
  try {
    const myvp = Game.vpOf ? Game.vpOf(me) : null;
    day0.scholarOcc = (myvp && myvp.occupationId) || '?';
    const rk = ((Game.state.codex || {}).recipes || {}).pit_trap || {};
    day0.scholarPitLevel = rk.level || 0;
    day0.scholarPitVia = rk.via || null;
  } catch (e) {}
  try {
    const roster = ((Game.state.village || {}).roster || []);
    for (const vid of roster) {
      if (vid === me) continue;
      seen[vid] = 0;
      const pi = personInfo(Game, vid);
      if (pi.knowsPit && !pi.dead) {
        holderAppear(pi.vid, 0, 'day0', TRAPPER_OCCS.has(pi.occ) ? 'background-trapper' : 'background-other');
        day0.holders.push({ vid: pi.vid, name: pi.name, occ: pi.occ, age: pi.age });
      }
    }
  } catch (e) {}

  // --- wrappers ---
  const oSay = Game.say ? Game.say.bind(Game) : null;
  if (oSay) {
    Game.say = function (text) {
      try {
        if (cen.transcript.length < TRANSCRIPT_CAP && SAYKEY.test(String(text))) {
          cen.transcript.push(`[d${(((this.state || {}).scholar || {}).day || 0)}] ${text}`);
        }
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
  }

  const oTele = Game.tele;
  Game.tele = function (t, d) {
    try {
      const day = ((this.state || {}).scholar || {}).day || 0;
      if (t === 'pit_teach') {
        const pi = personInfo(this, d && d.teacher);
        cen.teaches.push({ day, teacher: pi.name, tocc: pi.occ, trust: ((this.state.village.trust || {})[(d || {}).teacher] ?? null) });
        const e = ensureHolder(pi.vid, day, 'pit_teach');
        if (e) e.teaches.push({ day });
      } else if (t === 'pit_overhear') {
        const pi = personInfo(this, d && d.teacher);
        cen.overhears.push({ day, teacher: pi.name, tocc: pi.occ });
        const e = ensureHolder(pi.vid, day, 'pit_overhear');
        if (e) e.teaches.push({ day, kind: 'overhear' });
      } else if (t === 'pit_lesson') {
        const tp = personInfo(this, d && d.teacher), lp = personInfo(this, d && d.learner);
        const st = learnerState(this, d && d.learner); // at tele time == gate-check time
        const need = d && d.need;
        cen.lessons.push({
          day, teacher: tp.name, tocc: tp.occ, learner: lp.name, locc: lp.occ, need,
          learnerHunger: st.hunger, learnerHungry: st.hungry, learnerNovice: st.novice,
          needMismatch: need === 'hunger' ? !st.hungry : (need === 'novice' ? !st.novice : true),
        });
        const lk = String(d && d.learner).slice(0, 14);
        learnedPit[lk] = { day, teacher: tp.vid, need };
        const te = ensureHolder(tp.vid, day, 'pit_lesson(teacher)');
        if (te) te.lessonsTaught.push({ day, learner: lp.name, locc: lp.occ, need });
        // The lesson IS the learner's appear event (the only in-run grant
        // path is this apprenticeship — villager-agency.js:1149) — never
        // an unattributed transition.
        const le = holderAppear(lk, day, 'lesson', 'learned-in-run');
        le.lessonsLearned.push({ day, teacher: tp.name, tocc: tp.occ, need });
      } else if (t === 'npc_pit') {
        const pi = personInfo(this, d && d.vid);
        cen.catches.push({ day, trapper: pi.name, tocc: pi.occ, species: (d && d.species) || '?', kcal: (d && d.kcal) || 0 });
        const e = ensureHolder(pi.vid, day, 'npc_pit');
        if (e) e.catches.push({ day, species: (d && d.species) || '?', kcal: (d && d.kcal) || 0 });
      } else if (t === 'death') {
        const who = String((d && d.who) || '').slice(0, 14);
        deadVids[who] = day;
        cen.deaths.push({ day, who, kind: (d && d.kind) || '?', cause: (d && d.cause) || '?', player: !!(d && d.player) });
        const e = cen.ledger[who];
        if (e && !e.depart) { e.depart = 'death'; e.departDay = day; e.departCause = (d && d.cause) || '?'; }
      }
    } catch (e) {}
    return oTele.apply(this, arguments);
  };

  // #612 probe: wrap every ambient teach-chore call. Pre-call learner
  // state is read BEFORE delegating (the lesson may mutate xp).
  const oTeach = Game.agencyTeachVillager ? Game.agencyTeachVillager.bind(Game) : null;
  if (oTeach) {
    Game.agencyTeachVillager = function (teacherVid, learnerVid) {
      let pre = null;
      try {
        const day = ((this.state || {}).scholar || {}).day || 0;
        const tvp = this.vpOf ? this.vpOf(teacherVid) : null;
        const lst = learnerState(this, learnerVid);
        pre = { day, teacher: String(teacherVid).slice(0, 14), tKnowsPit: !!(tvp && tvp.knowsPit), learner: String(learnerVid).slice(0, 14), lst };
      } catch (e) {}
      let res = null;
      try { res = oTeach.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (pre) {
          pre.res = res ? { taught: !!res.taught, topic: res.topic || null, need: res.need || null, failed: !!res.failed } : null;
          cen.teachCalls.push(pre);
        }
      } catch (e) {}
      return res;
    };
  }

  // --- daily: join/vid-appearance events + exits + successions ---
  let seeded = false, prevPresent = new Set();
  let prevScholar = me; // scholar-succession watch: a holder who becomes the
  // scholar leaves the NPC roster without dying (ledger.js playerDeath ->
  // this.villagerId = newId). Without this watch it misreads as 'exit'.
  const lastDay = {}; // vid -> last day present on roster
  const base_daily = base.daily;
  const policy = Object.assign({}, base);
  policy.daily = (G, ctx) => {
    const r = base_daily ? base_daily(G, ctx) : undefined;
    try {
      const day = ((G.state.scholar || {}).day || 0);
      if (G.villagerId !== prevScholar) {
        const nk = String(G.villagerId).slice(0, 14);
        const e = cen.ledger[nk];
        if (e && !e.depart) { e.depart = 'scholar-succession'; e.departDay = day; e.departCause = 'became-scholar'; }
        prevScholar = G.villagerId;
      }
      const roster = ((G.state.village || {}).roster || []);
      const present = new Set();
      for (const vid of roster) {
        if (vid === G.villagerId) continue;
        present.add(vid);
        const vk = String(vid).slice(0, 14);
        const pi = personInfo(G, vid);
        if (!(vid in seen)) {
          // FIRST appearance in this run: the join event (#603: events,
          // never snapshots).
          seen[vid] = day;
          let origin = 'n/a', rejoin = false;
          if (pi.knowsPit && !pi.dead) {
            if (TRAPPER_OCCS.has(pi.occ)) origin = 'background-trapper';
            else if (learnedPit[vk]) origin = 'learned-in-run';
            else origin = 'pre-run-learned';
            holderAppear(vk, day, 'join', origin);
          }
          cen.joins.push({ day, vid: vk, name: pi.name, occ: pi.occ, age: pi.age, knowsPit: pi.knowsPit, origin, rejoin, young: pi.age != null && pi.age < 16 });
        } else if (lastDay[vid] != null && lastDay[vid] < day - 1) {
          // REJOIN: absent at least one full daily tick, now back.
          let origin = 'n/a';
          if (pi.knowsPit && !pi.dead && !cen.ledger[vk]) {
            origin = learnedPit[vk] ? 'learned-in-run' : 'pre-run-learned';
            holderAppear(vk, day, 'rejoin', origin);
          }
          cen.joins.push({ day, vid: vk, name: pi.name, occ: pi.occ, age: pi.age, knowsPit: pi.knowsPit, origin, rejoin: true, young: pi.age != null && pi.age < 16 });
        }
        lastDay[vid] = day;
      }
      if (!seeded) { seeded = true; prevPresent = present; return r; }
      // exits: present yesterday, absent today, no death event, not the new
      // scholar -> genuine disappearance (succession is handled above)
      for (const vid of prevPresent) {
        if (present.has(vid)) continue;
        const vk = String(vid).slice(0, 14);
        const e = cen.ledger[vk];
        if (deadVids[vk] != null) {
          if (e && !e.depart) { e.depart = 'death'; e.departDay = deadVids[vk]; }
        } else {
          cen.deaths.push({ day, who: vk, kind: 'exit', cause: 'left-village', player: false });
          if (e && !e.depart) { e.depart = 'exit'; e.departDay = day; e.departCause = 'left-village'; }
        }
      }
      prevPresent = present;
    } catch (e) {}
    return r;
  };

  let result;
  const drive = async () => { result = await runDays(Game, policy, { days: runDaysN }); };
  if (opts.quiet === false) await drive(); else await quietLog(drive);

  // end-of-run: holders neither departed nor present -> exit-eor
  const monsterNames = new Set();
  try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}
  const finalRoster = new Set();
  try { for (const vid of ((Game.state.village || {}).roster || [])) finalRoster.add(String(vid).slice(0, 14)); } catch (e) {}
  for (const vk of Object.keys(cen.ledger)) {
    const e = cen.ledger[vk];
    if (!e.depart) {
      if (deadVids[vk] != null) { e.depart = 'death'; e.departDay = deadVids[vk]; }
      else if (!finalRoster.has(vk)) { e.depart = 'exit-eor'; e.departDay = result.days; e.departCause = 'absent-at-end'; }
      else { e.depart = 'survived'; e.departDay = result.days; }
    }
  }

  // --- aggregates ---
  const deathBuckets = {};
  let playerDeaths = 0, villagerDeaths = 0;
  const holderDeaths = [];
  for (const ev of cen.deaths) {
    if ((ev.kind || '') === 'monster') continue;
    const b = bucket(ev.cause, monsterNames);
    deathBuckets[b] = (deathBuckets[b] || 0) + 1;
    if (ev.who === String(me).slice(0, 14)) playerDeaths++; else villagerDeaths++;
    const e = cen.ledger[ev.who];
    if (e && e.depart === 'death' && ev.kind !== 'exit') {
      holderDeaths.push({ name: null, vid: ev.who, origin: e.origin, day: ev.day, cause: ev.cause, bucket: b });
    }
  }
  // fill holder death names
  for (const h of holderDeaths) {
    try { h.name = Game.displayName ? Game.displayName(h.vid) : h.vid; } catch (e) { h.name = h.vid; }
  }

  const catches = cen.catches;
  const pitKcal = catches.reduce((t, c) => t + (c.kcal || 0), 0);
  const boarCatches = catches.filter(c => c.species === 'wild_boar');
  const boarKcal = boarCatches.reduce((t, c) => t + (c.kcal || 0), 0);

  // catch attribution by holder origin
  const kcalByOrigin = {}, catchesByOrigin = {};
  for (const c of catches) {
    const vk = Object.keys(cen.ledger).find(k => { const e = cen.ledger[k]; return e.catches.some(x => x.day === c.day && x.kcal === c.kcal && x.species === c.species); });
    const o = vk ? cen.ledger[vk].origin : 'UNATTRIBUTED';
    catchesByOrigin[o] = (catchesByOrigin[o] || 0) + 1;
    kcalByOrigin[o] = (kcalByOrigin[o] || 0) + (c.kcal || 0);
  }

  // #612: learner-gate mismatch from teachCalls
  const p612 = { teachCalls: cen.teachCalls.length, pitTeacherCalls: 0, pitEligible: 0, gateNeedFail: 0, gateNeedPass: 0, gate85Fail: 0, teleNeedMismatch: 0, topicSplit: {} };
  for (const tc of cen.teachCalls) {
    const rs = tc.res || {};
    if (rs.taught) p612.topicSplit[rs.topic || '?'] = (p612.topicSplit[rs.topic || '?'] || 0) + 1;
    if (!tc.tKnowsPit) continue;
    p612.pitTeacherCalls++;
    const eligible = !tc.lst.knowsPit && !tc.lst.pitTaught;
    if (!eligible) continue;
    p612.pitEligible++;
    const needy = !!(tc.lst.hungry || tc.lst.novice);
    if (!needy) { p612.gateNeedFail++; continue; }
    p612.gateNeedPass++;
    if (rs.topic !== 'pit') p612.gate85Fail++; // passed gate but lost the 85% or took another branch
  }
  p612.teleNeedMismatch = cen.lessons.filter(l => l.needMismatch).length;
  p612.mismatchRate = p612.pitEligible ? Math.round(p612.gateNeedFail / p612.pitEligible * 1000) / 10 : null;

  let maxScale = 'village';
  try { if (Game.scaleRank) maxScale = Game.scaleRank(); } catch (e) {}
  let won = false, tableWaiting = false, maxArc = 1;
  try { won = !!Game.won; } catch (e) {}
  try { const ps = Game.progState() || {}; tableWaiting = !!ps.tableWaiting; maxArc = ps.arc || 1; } catch (e) {}

  const rec = {
    baseSHA: BASE_SHA, seed, policy: policyId, days: result.days, endReason: result.endReason,
    env: { feastscale: process.env.FEASTSCALE_R13, seatdrive: process.env.SEATDRIVE, pitknowledge: process.env.PITKNOWLEDGE || 'unset' },
    day0,
    joins: cen.joins,
    firings: { teaches: cen.teaches.length, overhears: cen.overhears.length, lessons: cen.lessons.length, catches: catches.length },
    pit: {
      catches: catches.length, kcal: pitKcal, kcalPer100d: result.days ? Math.round((pitKcal / result.days) * 1000) / 10 : 0,
      boar: boarCatches.length, boarKcal, boarShare: catches.length ? Math.round(boarCatches.length / catches.length * 1000) / 10 : 0,
      avgBoarKcal: boarCatches.length ? Math.round(boarKcal / boarCatches.length) : 0,
      species: catches.reduce((o, c) => { o[c.species] = (o[c.species] || 0) + 1; return o; }, {}),
      kcalByOrigin, catchesByOrigin,
    },
    p612,
    teaches: cen.teaches, overhears: cen.overhears, lessons: cen.lessons,
    teachCalls: cen.teachCalls,
    ledger: cen.ledger,
    unattributed: cen.unattributed,
    holderDeaths,
    transcript: cen.transcript,
    wall: { maxScale, won, tableWaiting, maxWaveUnlocked: result.maxWaveUnlocked || 0, maxArc },
    deaths: { player: playerDeaths, villager: villagerDeaths, buckets: deathBuckets },
  };
  fs.mkdirSync(outdir, { recursive: true });
  const fn = path.join(outdir, `${policyId}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(rec, null, 1));
  if (opts.progress !== false) console.log(`done: ${policyId} s${seed} days=${result.days}(${result.endReason}) holders0=${day0.holders.length} joins=${cen.joins.length}(pit:${cen.joins.filter(j => j.knowsPit).length}) teaches=${cen.teaches.length} lessons=${cen.lessons.length} catches=${catches.length} kcal=${pitKcal} boar=${boarCatches.length} unattrib=${cen.unattributed.length} teachCalls=${cen.teachCalls.length} p612miss=${p612.mismatchRate}% w=${result.maxWaveUnlocked || 0} won=${won}`);
  return rec;
}

if (require.main === module) {
(async () => {
  // base-sha freeze check
  try {
    const { execSync } = require('child_process');
    const head = String(execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..') })).trim();
    if (head !== BASE_SHA) { console.error(`BASE SHA MISMATCH: frozen ${BASE_SHA}, worktree ${head} — sweep stops`); process.exit(1); }
  } catch (e) { console.error('BASE SHA CHECK FAILED', e.message); process.exit(1); }
  const runs = [];
  for (const seed of SEEDS) {
    for (const pid of POLICIES) {
      try { runs.push(await runOne(seed, pid)); }
      catch (e) { console.error(`FATAL ${pid}/s${seed}`, e); process.exit(1); }
    }
  }
  const joins = runs.flatMap(r => r.joins.map(j => Object.assign({ seed: r.seed, policy: r.policy }, j)));
  const pitJoins = joins.filter(j => j.knowsPit);
  const origins = {};
  for (const j of pitJoins) origins[j.origin] = (origins[j.origin] || 0) + 1;
  const catches = runs.reduce((t, r) => t + r.pit.catches, 0);
  const kcal = runs.reduce((t, r) => t + r.pit.kcal, 0);
  const boar = runs.reduce((t, r) => t + r.pit.boar, 0);
  const days = runs.reduce((t, r) => t + r.days, 0);
  const lessons = runs.reduce((t, r) => t + r.firings.lessons, 0);
  const teaches = runs.reduce((t, r) => t + r.firings.teaches, 0);
  const unattrib = runs.reduce((t, r) => t + r.unattributed.length, 0);
  const tcs = runs.reduce((t, r) => t + r.p612.teachCalls, 0);
  const elig = runs.reduce((t, r) => t + r.p612.pitEligible, 0);
  const needFail = runs.reduce((t, r) => t + r.p612.gateNeedFail, 0);
  const teleMis = runs.reduce((t, r) => t + r.p612.teleNeedMismatch, 0);
  const surv = runs.map(r => r.days).sort((a, b) => a - b);
  const med = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  console.log(`SUMMARY n=${runs.length} joins=${joins.length} pitJoins=${pitJoins.length} origins=${JSON.stringify(origins)} lessons=${lessons} teaches=${teaches} catches=${catches} kcal=${kcal} kcalPer100d=${days ? Math.round(kcal / days * 10000) / 100 : 0} boar=${boar} unattrib=${unattrib} teachCalls=${tcs} p612eligible=${elig} p612needFail=${needFail} p612miss=${elig ? Math.round(needFail / elig * 1000) / 10 : 'n/a'}% teleNeedMismatch=${teleMis} medSurv=${med} maxSurv=${surv[surv.length - 1]} wins=${runs.filter(r => r.wall.won).length} national=${runs.filter(r => r.wall.maxScale === 'national' || r.wall.maxScale === 'global').length} table=${runs.filter(r => r.wall.tableWaiting).length} wave4=${runs.filter(r => r.wall.maxWaveUnlocked >= 4).length} wave5=${runs.filter(r => r.wall.maxWaveUnlocked >= 5).length}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
} // end require.main guard

module.exports = { runOne, BASE_SHA, SEEDS, POLICIES, OUTDIR };
