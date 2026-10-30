#!/usr/bin/env node
// scripts/test-w4meet-a.js — sim-w4meet-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-29/perseed-w4meet-a/s<seed>-fresh.json
//   (fieldparty + w4dpr + breakline + shoutrec + tilejoin recorders,
//   seeds 75101-75116; joinendlines store is calledHelp-only, so it is
//   checked for errs/overflow but NOT index-joined).
// Join: per seed, fp/dp/bl/sr/tj join by fight-order index; VERIFIED
// (mid, vid, day must match at every index); join errors must be 0.
// Universe: every joined row with fieldparty wave == 4, all channels,
// all callers, scholar-led flagged, never dropped.
// Shape = fieldparty channel verbatim: field -> wild, raid -> raid,
// other -> other. Outcome (w4shape order): rounds<1 & mFlee ->
// PRE-CONTACT-SCATTER; rounds<1 & vKill -> PRE-CONTACT-KILL;
// rounds>=1 & vKill -> KILL; rounds>=1 & mFlee -> DRIVE-OFF;
// rounds>=1 & vFlee -> FLEE (breakline branch sub-split);
// rounds>=1 & vDie -> DEATH; else OTHER.
// WARNED (prereg, fixed before judged analysis): W1 = an earlier
// meeting in the same seed with the same mid (corpus order); W2 =
// fieldparty trickKnown === true at the meeting; W3 (sub-signal of
// W1) = an earlier meeting with the same mid whose mHpLeft equals
// this meeting's mHpStart (wound continuity). UNWARNED = neither W1
// nor W2. Scout sightings, rumors, and pre-contact shouts are NOT
// captured by any recorder in the stack and are UNMEASURED here.
// PARTY (recorded state only, no engine "party" object exists):
// solo-tile = filtered tile length 0; tile-mates = length >= 1;
// joined = joinedAllyVid non-null OR allyFromStart true; crew size =
// fieldparty crew length, reported alongside, never substituted.
// READINESS (w5counts-a exact-count method at meeting time):
// fieldparty readiness = Game.waveCombatReadiness(4) at the meeting;
// demand read LIVE from src/js/standing.js readyDemand[4] at
// analysis time. A full-demand meeting-gate blocks iff ready false.
// Usage:
//   node scripts/test-w4meet-a.js --fixtures
//   node scripts/test-w4meet-a.js [--out <path>] (judge the corpus)
//   node scripts/test-w4meet-a.js --sense (print wave-4 fight logs:
//     all when fought <= 40, else the prereg stratified sample)
//   node scripts/test-w4meet-a.js --detgate <scratchDir> <seed>
//     (byte-compare scratch row vs corpus row)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyBranch } = require('./breakline-lib');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);

function shapeOf(fp) {
  const c = fp && fp.channel;
  if (c === 'field') return 'wild';
  if (c === 'raid') return 'raid';
  if (c === 'other') return 'other';
  return 'OTHER';
}
function tileCount(fp) {
  return (fp.tile || []).filter(t => t.deadKnown !== true).length;
}
function tilePresent(fp) { return tileCount(fp) >= 1; }
function classifyOutcome(o) {
  const rounds = (o.rounds | 0);
  const out = o.outcome;
  if (rounds < 1 && out === 'mFlee') return { cls: 'PRE-CONTACT-SCATTER', sub: 'mFlee' };
  if (rounds < 1 && out === 'vKill') return { cls: 'PRE-CONTACT-KILL', sub: 'vKill' };
  if (rounds >= 1 && out === 'vKill') return { cls: 'KILL', sub: 'vKill' };
  if (rounds >= 1 && out === 'mFlee') return { cls: 'DRIVE-OFF', sub: 'mFlee' };
  if (rounds >= 1 && out === 'vFlee') return { cls: 'FLEE', sub: String(o.branch || 'UNKNOWN-BRANCH') };
  if (rounds >= 1 && out === 'vDie') return { cls: 'DEATH', sub: 'vDie' };
  return { cls: 'OTHER', sub: String(out) };
}
function gearOf(dp, fp) {
  const post = dp && dp.loadoutPost;
  const pre = dp && dp.loadoutPre;
  const usePost = post && (post.melee != null || post.ranged != null || (post.carriedWeapons || []).length);
  const load = usePost ? post : pre;
  return {
    armed: fp && fp.leader ? fp.leader.armed : null,
    armorP: fp && fp.leader ? fp.leader.armorP : null,
    veteranW3: fp && fp.leader ? fp.leader.veteranW3 : null,
    melee: load ? load.melee : null,
    ranged: load ? load.ranged : null,
    carriedWeapons: load ? (load.carriedWeapons || []) : [],
    loadoutSource: usePost ? 'post' : 'pre',
  };
}
// warnedOf(priorMeetings, meeting): priorMeetings are earlier joined
// rows for the same seed in corpus order, each {mid, mHpLeft}.
// meeting is {mid, mHpStart, trickKnown}.
function warnedOf(prior, m) {
  const same = prior.filter(p => p.mid === m.mid);
  const w1 = same.length > 0;
  const w2 = m.trickKnown === true;
  const w3 = same.some(p => p.mHpLeft != null && m.mHpStart != null && p.mHpLeft === m.mHpStart);
  return { warned: w1 || w2, w1, w2, w3, priorTypeCount: same.length };
}
function joinPairOk(a, b) {
  return a && b && a.mid === b.mid && a.vid === b.vid && a.day === b.day;
}
function readDemand() {
  const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8');
  const m = src.match(/4:\s*\{\s*armored:\s*(\d+),\s*armorP:\s*(\d+),\s*armed:\s*(\d+),\s*tricks:\s*(\d+),\s*veterans:\s*(\d+)\s*\}/);
  if (!m) throw new Error('readyDemand[4] not found in standing.js');
  return { armored: +m[1], armorP: +m[2], armed: +m[3], tricks: +m[4], veterans: +m[5] };
}
// shortfallOf(readiness, demand): per-bar deficits; blocked iff !ready.
function shortfallOf(rd, demand) {
  if (!rd) return { short: ['readiness-null'], blocked: null };
  const short = [];
  if ((rd.armored | 0) < demand.armored) short.push(`armored ${rd.armored}/${demand.armored}`);
  if ((rd.armed | 0) < demand.armed) short.push(`armed ${rd.armed}/${demand.armed}`);
  if ((rd.tricks | 0) < demand.tricks) short.push(`tricks ${rd.tricks}/${demand.tricks}`);
  if ((rd.veterans | 0) < demand.veterans) short.push(`veterans ${rd.veterans}/${demand.veterans}`);
  return { short, blocked: !rd.ready };
}

function fixtures() {
  let checks = 0, fails = 0;
  const eq = (name, got, want) => {
    checks++;
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      fails++;
      console.log(`  FIXTURE-FAIL ${name}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
    }
  };
  eq('pre-contact scatter', classifyOutcome({ outcome: 'mFlee', rounds: 0 }).cls, 'PRE-CONTACT-SCATTER');
  eq('pre-contact kill', classifyOutcome({ outcome: 'vKill', rounds: 0 }).cls, 'PRE-CONTACT-KILL');
  eq('fought kill', classifyOutcome({ outcome: 'vKill', rounds: 3 }).cls, 'KILL');
  eq('drive-off', classifyOutcome({ outcome: 'mFlee', rounds: 3 }).cls, 'DRIVE-OFF');
  eq('flee hopeless sub', classifyOutcome({ outcome: 'vFlee', rounds: 2, branch: 'HOPELESS-BRANCH' }).sub, 'HOPELESS-BRANCH');
  eq('flee floor sub', classifyOutcome({ outcome: 'vFlee', rounds: 1, branch: 'FLOOR-BRANCH' }).sub, 'FLOOR-BRANCH');
  eq('death', classifyOutcome({ outcome: 'vDie', rounds: 2 }).cls, 'DEATH');
  eq('other unknown outcome', classifyOutcome({ outcome: 'truce', rounds: 2 }).cls, 'OTHER');
  eq('other round0 vDie', classifyOutcome({ outcome: 'vDie', rounds: 0 }).cls, 'OTHER');
  eq('shape wild', shapeOf({ channel: 'field' }), 'wild');
  eq('shape raid', shapeOf({ channel: 'raid' }), 'raid');
  eq('shape other', shapeOf({ channel: 'other' }), 'other');
  eq('shape unknown', shapeOf({ channel: 'expedition' }), 'OTHER');
  eq('tile present', tilePresent({ tile: [{ vid: 'a', deadKnown: false }] }), true);
  eq('tile dead excluded', tilePresent({ tile: [{ vid: 'a', deadKnown: true }] }), false);
  eq('tile empty', tilePresent({ tile: [] }), false);
  eq('tile count excludes dead', tileCount({ tile: [{ vid: 'a', deadKnown: true }, { vid: 'b', deadKnown: false }] }), 1);
  // Warned signals.
  eq('warned unwarned', warnedOf([], { mid: 'eulogy', mHpStart: 900, trickKnown: false }),
    { warned: false, w1: false, w2: false, w3: false, priorTypeCount: 0 });
  eq('warned prior-type only', warnedOf([{ mid: 'eulogy', mHpLeft: 800 }], { mid: 'eulogy', mHpStart: 900, trickKnown: false }),
    { warned: true, w1: true, w2: false, w3: false, priorTypeCount: 1 });
  eq('warned trick only', warnedOf([], { mid: 'audit', mHpStart: 1100, trickKnown: true }),
    { warned: true, w1: false, w2: true, w3: false, priorTypeCount: 0 });
  eq('warned re-meet hp continuity', warnedOf([{ mid: 'eulogy', mHpLeft: 853 }], { mid: 'eulogy', mHpStart: 853, trickKnown: false }),
    { warned: true, w1: true, w2: false, w3: true, priorTypeCount: 1 });
  eq('warned other-type ignored', warnedOf([{ mid: 'audit', mHpLeft: 1000 }], { mid: 'eulogy', mHpStart: 900, trickKnown: false }),
    { warned: false, w1: false, w2: false, w3: false, priorTypeCount: 0 });
  eq('warned trick null is unwarned', warnedOf([], { mid: 'eulogy', mHpStart: 900, trickKnown: null }),
    { warned: false, w1: false, w2: false, w3: false, priorTypeCount: 0 });
  // Join rule.
  eq('join ok', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'v', day: 5 }), true);
  eq('join mid mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'b', vid: 'v', day: 5 }), false);
  eq('join vid mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'w', day: 5 }), false);
  eq('join day mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'v', day: 6 }), false);
  // Readiness shortfall vs demand 3/5/3/1.
  const dem = { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 };
  eq('shortfall all met', shortfallOf({ armored: 3, armed: 5, tricks: 4, veterans: 1, ready: true }, dem),
    { short: [], blocked: false });
  eq('shortfall two bars', shortfallOf({ armored: 1, armed: 5, tricks: 2, veterans: 0, ready: false }, dem),
    { short: ['armored 1/3', 'tricks 2/3', 'veterans 0/1'], blocked: true });
  eq('shortfall ready false dominates', shortfallOf({ armored: 3, armed: 5, tricks: 3, veterans: 1, ready: false }, dem).blocked, true);
  eq('shortfall null readiness', shortfallOf(null, dem), { short: ['readiness-null'], blocked: null });
  // Demand citation parses live (structure check only — values asserted in evidence).
  const live = readDemand();
  eq('demand parses integers', [live.armored, live.armorP, live.armed, live.tricks, live.veterans].every(v => Number.isInteger(v)), true);
  console.log(fails === 0 ? `FIXTURES-PASS (${checks} checks, 0 fails)` : `FIXTURES-FAIL (${checks} checks, ${fails} fails)`);
  return fails === 0;
}

function analyze(evidDir) {
  const demand = readDemand();
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
  const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && storeOk(r.fieldparty) && storeOk(r.w4dpr) && storeOk(r.breakline)
    && storeOk(r.shoutrec) && (r.tilejoin === null || storeOk(r.tilejoin))
    && r.joinendlines && r.joinendlines.diag.errs === 0
    && Object.values(r.joinendlines.diag.overflow || {}).every(v => (v | 0) === 0));
  let joinErrors = 0, joinTotal = 0, branchMismatches = 0, waveDisagree = 0;
  const joinedBySeed = {};
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [],
      bl = r.breakline.meetings || [], sr = r.shoutrec.meetings || [],
      tj = (r.tilejoin && r.tilejoin.meetings) || [];
    const lens = [fp.length, dp.length, bl.length, sr.length, tj.length];
    const n = Math.min.apply(null, lens);
    for (const L of lens) joinErrors += Math.abs(L - fp.length);
    const list = [];
    for (let i = 0; i < n; i++) {
      joinTotal++;
      const a = fp[i], b = dp[i], c = bl[i], d = sr[i], e = tj[i];
      if (!joinPairOk(a, b) || !joinPairOk(a, c) || !joinPairOk(a, d) || !joinPairOk(a, e)) { joinErrors++; continue; }
      if ((b.wave | 0) !== (a.wave | 0) || (c.wave | 0) !== (a.wave | 0)) waveDisagree++;
      const recomputed = classifyBranch(c);
      if (recomputed.reason !== c.branch) branchMismatches++;
      list.push({ seed: r.seed, fp: a, dp: b, bl: c, sr: d, tj: e, branch: recomputed.reason });
    }
    joinedBySeed[r.seed] = list;
  }
  // Warned signals need corpus order per seed (joined order = fight order).
  const U = [];
  for (const seed of SEEDS) {
    const prior = [];
    for (const j of joinedBySeed[seed]) {
      const w = warnedOf(prior, { mid: j.fp.mid, mHpStart: j.bl.mHpStart, trickKnown: j.fp.trickKnown });
      prior.push({ mid: j.fp.mid, mHpLeft: j.bl.mHpLeft });
      if ((j.fp.wave | 0) !== 4) continue;
      const shape = shapeOf(j.fp);
      const oc = classifyOutcome({ outcome: j.bl.outcome, rounds: j.bl.rounds, branch: j.branch });
      const tc = tileCount(j.fp);
      const joined = !!(j.bl.joinedAllyVid || j.bl.allyFromStart);
      const party = joined ? 'joined' : (tc >= 1 ? 'tile-mates' : 'solo-tile');
      const rd = j.fp.readiness || null;
      const sf = shortfallOf(rd, demand);
      U.push(Object.assign(j, { shape, oc, party, tileCount: tc, joined,
        warned: w, readiness: rd, shortfall: sf.short, blocked: sf.blocked,
        gear: gearOf(j.dp, j.fp),
        scholarLed: !!(j.fp.leader && j.fp.leader.isScholar) }));
    }
  }
  const byShape = {};
  for (const j of U) {
    const t = byShape[j.shape] = byShape[j.shape] || { n: 0, fought: 0, kills: 0, preKills: 0, byOutcome: {}, byParty: {}, warned: 0, w1: 0, w2: 0, w3: 0, blocked: 0, ready: 0 };
    t.n++;
    t.byOutcome[j.oc.cls] = (t.byOutcome[j.oc.cls] || 0) + 1;
    t.byParty[j.party] = t.byParty[j.party] || {};
    t.byParty[j.party][j.oc.cls] = (t.byParty[j.party][j.oc.cls] || 0) + 1;
    if ((j.bl.rounds | 0) >= 1) t.fought++;
    if (j.oc.cls === 'KILL') t.kills++;
    if (j.oc.cls === 'PRE-CONTACT-KILL') t.preKills++;
    if (j.warned.warned) t.warned++;
    if (j.warned.w1) t.w1++;
    if (j.warned.w2) t.w2++;
    if (j.warned.w3) t.w3++;
    if (j.blocked === true) t.blocked++;
    if (j.readiness && j.readiness.ready) t.ready++;
  }
  const byOutcome = {}, byParty = {}, byBeast = {};
  for (const j of U) {
    byOutcome[j.oc.cls] = (byOutcome[j.oc.cls] || 0) + 1;
    byParty[j.party] = byParty[j.party] || {};
    byParty[j.party][j.oc.cls] = (byParty[j.party][j.oc.cls] || 0) + 1;
    byBeast[j.fp.mid] = byBeast[j.fp.mid] || { n: 0, seeds: {} };
    byBeast[j.fp.mid].n++;
    byBeast[j.fp.mid].seeds[j.seed] = true;
  }
  const fleeSub = {};
  for (const j of U.filter(x => x.oc.cls === 'FLEE')) fleeSub[j.oc.sub] = (fleeSub[j.oc.sub] || 0) + 1;
  const otherCount = U.filter(j => j.oc.cls === 'OTHER').length;
  const shapeOtherCount = U.filter(j => j.shape === 'OTHER').length;
  const perSeed = {};
  for (const seed of SEEDS) {
    const list = U.filter(j => j.seed === seed);
    const row = rows.find(r => r.seed === seed);
    const first = list[0] || null;
    perSeed[seed] = {
      n: list.length,
      unlocked4: (row.waveReach || 1) >= 4 ? 1 : 0,
      waveReach: row.waveReach || 1,
      days: row.days, endReason: row.endReason, won: row.won,
      nationalEver: row.nationalEver, table: row.table, entered: row.entered,
      byOutcome: list.reduce((m, j) => { m[j.oc.cls] = (m[j.oc.cls] || 0) + 1; return m; }, {}),
      kills: list.filter(j => j.oc.cls === 'KILL').length,
      warned: list.filter(j => j.warned.warned).length,
      blocked: list.filter(j => j.blocked === true).length,
      first: first ? { day: first.fp.day, part: first.fp.part, channel: first.fp.channel, shape: first.shape,
        caller: first.fp.caller, mid: first.fp.mid, leaderVid: first.fp.vid,
        leaderFirst: first.dp.leaderFirst, scholarLed: first.scholarLed,
        outcome: first.bl.outcome, outcomeCls: first.oc.cls, rounds: first.bl.rounds,
        party: first.party, tileCount: first.tileCount, mHpStart: first.bl.mHpStart,
        warned: first.warned, readiness: first.readiness, blocked: first.blocked,
        gear: first.gear } : null,
    };
  }
  const detailList = U.map(j => ({ seed: j.seed, day: j.fp.day, part: j.fp.part,
    mid: j.fp.mid, caller: j.fp.caller, shape: j.shape,
    scholarLed: j.scholarLed, leaderVid: j.fp.vid, leaderFirst: j.dp.leaderFirst,
    outcome: j.bl.outcome, outcomeCls: j.oc.cls, fleeSub: j.oc.sub, rounds: j.bl.rounds,
    mHpStart: j.bl.mHpStart, mHpLeft: j.bl.mHpLeft, mDealt: j.bl.mDealt,
    vTaken: j.bl.vTaken, party: j.party, tileCount: j.tileCount,
    tileUnknown: j.fp.tileUnknown, crewSize: (j.fp.crew || []).length,
    engineAllies: j.bl.engineAllies, allyFromStart: j.bl.allyFromStart,
    calledHelp: j.bl.calledHelp, joinedAllyVid: j.bl.joinedAllyVid,
    allyDealt: j.bl.allyDealt, allyTaken: j.bl.allyTaken,
    intent: j.bl.intent, intentWhy: j.fp.intentWhy, gear: j.gear,
    mTile: j.fp.mTile, trickKnown: j.fp.trickKnown,
    warned: j.warned, readiness: j.readiness,
    villageArmed: j.fp.villageArmed, villageArmored10: j.fp.villageArmored10,
    villageVeterans: j.fp.villageVeterans, shortfall: j.shortfall, blocked: j.blocked,
    hasLog: !!(j.dp.log && j.dp.log.length) }));
  const won = rows.reduce((t, r) => t + r.won, 0);
  const wonFull = rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length;
  const nationalEver = rows.reduce((t, r) => t + r.nationalEver, 0);
  const nationalFinal = rows.reduce((t, r) => t + r.nationalFinal, 0);
  const tableN = rows.reduce((t, r) => t + r.table, 0);
  const entered = rows.reduce((t, r) => t + r.entered, 0);
  const deaths = rows.reduce((t, r) => t + r.deathTotal, 0);
  const starv = rows.reduce((t, r) => t + r.starvationDeaths, 0);
  const waveReachCount = (w) => rows.filter(r => (r.waveReach || 1) >= w).length;
  const daysSorted = rows.map(r => r.days).sort((a, b) => a - b);
  const medianDays = daysSorted[Math.floor(daysSorted.length / 2)];
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const completeness = corpusOk && joinErrors === 0 && otherCount === 0;
  return { corpusOk, joinTotal, joinErrors, branchMismatches, waveDisagree,
    universeN: U.length, foughtN: U.filter(j => (j.bl.rounds | 0) >= 1).length,
    byShape, byOutcome, byParty, byBeast, fleeSub,
    killsFought: U.filter(j => j.oc.cls === 'KILL').length,
    killsPre: U.filter(j => j.oc.cls === 'PRE-CONTACT-KILL').length,
    otherCount, shapeOtherCount,
    warnedTotal: U.filter(j => j.warned.warned).length,
    w1Total: U.filter(j => j.warned.w1).length,
    w2Total: U.filter(j => j.warned.w2).length,
    w3Total: U.filter(j => j.warned.w3).length,
    blockedTotal: U.filter(j => j.blocked === true).length,
    readyTotal: U.filter(j => j.readiness && j.readiness.ready).length,
    demand, perSeed, detailList,
    wall: { won, wonFull, nationalEver, nationalFinal, table: tableN, entered,
      wave1reach: waveReachCount(1), wave2reach: waveReachCount(2), wave3reach: waveReachCount(3),
      wave4reach: waveReachCount(4), wave5reach: waveReachCount(5),
      medianDays, daysSorted, deaths, starv, deathsByCause,
      contactSeeds: Object.values(perSeed).filter(p => p.n > 0).length },
    completeness,
    perSeedRows: rows.map(r => ({ seed: r.seed, days: r.days,
      endReason: r.endReason, won: r.won, waveReach: r.waveReach,
      nationalEver: r.nationalEver, deaths: r.deathTotal,
      fpMeetings: (r.fieldparty.meetings || []).length })) };
}

function senseList(evidDir) {
  const res = analyze(evidDir);
  const rows = {};
  for (const seed of SEEDS) rows[seed] = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
  const fought = [];
  for (const seed of SEEDS) {
    const r = rows[seed];
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [], bl = r.breakline.meetings || [];
    const n = Math.min(fp.length, dp.length, bl.length);
    for (let i = 0; i < n; i++) {
      if ((fp[i].wave | 0) !== 4) continue;
      if ((bl[i].rounds | 0) < 1) continue;
      fought.push({ seed, day: fp[i].day, mid: fp[i].mid, caller: fp[i].caller,
        channel: fp[i].channel, outcome: bl[i].outcome, rounds: bl[i].rounds,
        log: dp[i].log || [] });
    }
  }
  if (fought.length <= 40) return { rule: 'ALL', list: fought };
  // Stratified sample (prereg): all raid + other, >= 3 wild per outcome
  // class present, >= 1 per distinct beast type.
  const picked = [], seen = new Set();
  const take = (m) => { const k = `${m.seed}/${m.day}/${m.mid}`; if (!seen.has(k)) { seen.add(k); picked.push(m); } };
  for (const m of fought) if (m.channel !== 'field') take(m);
  const byOutcome = {};
  for (const m of fought) (byOutcome[m.outcome] = byOutcome[m.outcome] || []).push(m);
  for (const cls of Object.keys(byOutcome)) byOutcome[cls].slice(0, 3).forEach(take);
  const byBeast = {};
  for (const m of fought) (byBeast[m.mid] = byBeast[m.mid] || []).push(m);
  for (const t of Object.keys(byBeast)) take(byBeast[t][0]);
  return { rule: 'STRATIFIED', list: picked, foughtN: fought.length };
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-w4meet-a');
  if (args.indexOf('--fixtures') >= 0) { process.exit(fixtures() ? 0 : 1); }
  if (args.indexOf('--detgate') >= 0) {
    const scratchDir = args[args.indexOf('--detgate') + 1];
    const seed = args[args.indexOf('--detgate') + 2];
    const a = fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`));
    const b = fs.readFileSync(path.join(scratchDir, `s${seed}-fresh.json`));
    const same = a.equals(b);
    console.log(same ? `DETGATE-PASS seed=${seed}` : `DETGATE-FAIL seed=${seed} corpusBytes=${a.length} scratchBytes=${b.length}`);
    process.exit(same ? 0 : 1);
  }
  if (args.indexOf('--sense') >= 0) {
    const s = senseList(evidDir);
    console.log(`SENSE-RULE=${s.rule} fought-wave4=${s.foughtN != null ? s.foughtN : s.list.length} printed=${s.list.length}`);
    for (const m of s.list) {
      console.log(`\n--- s${m.seed} d${m.day} ${m.mid} caller=${m.caller} channel=${m.channel} outcome=${m.outcome} rounds=${m.rounds} logLines=${m.log.length} ---`);
      for (const line of m.log) console.log('  ' + line);
    }
    return;
  }
  const fx = fixtures();
  const res = analyze(evidDir);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 1) + '\n');
  console.log('=== sim-w4meet-a census ===');
  console.log(`DEMAND w4 (live from standing.js): ${JSON.stringify(res.demand)}`);
  console.log(`corpusOk=${res.corpusOk} joins=${res.joinTotal} joinErrors=${res.joinErrors} branchMismatches=${res.branchMismatches} waveDisagree=${res.waveDisagree}`);
  console.log(`UNIVERSE wave-4 meetings=${res.universeN} fought=${res.foughtN} shapeOTHER=${res.shapeOtherCount} taxonomyOTHER=${res.otherCount}`);
  console.log(`KILLS fought=${res.killsFought} pre-contact=${res.killsPre}`);
  console.log(`WARNED total=${res.warnedTotal}/${res.universeN} W1=${res.w1Total} W2=${res.w2Total} W3=${res.w3Total}`);
  console.log(`GATE blocked=${res.blockedTotal}/${res.universeN} ready=${res.readyTotal}/${res.universeN}`);
  console.log('BY-SHAPE:');
  for (const [shape, t] of Object.entries(res.byShape)) console.log(`  ${shape}: n=${t.n} fought=${t.fought} kills=${t.kills} preKills=${t.preKills} byOutcome=${JSON.stringify(t.byOutcome)} byParty=${JSON.stringify(t.byParty)} warned=${t.warned} w1=${t.w1} w2=${t.w2} w3=${t.w3} blocked=${t.blocked} ready=${t.ready}`);
  console.log(`BY-OUTCOME: ${JSON.stringify(res.byOutcome)}`);
  console.log(`BY-PARTY: ${JSON.stringify(res.byParty)}`);
  console.log(`BY-BEAST: ${JSON.stringify(Object.fromEntries(Object.entries(res.byBeast).map(([k, v]) => [k, { n: v.n, seeds: Object.keys(v.seeds) }])))}`);
  console.log(`FLEE-SUB: ${JSON.stringify(res.fleeSub)}`);
  console.log('PER-SEED (unlock vs contact):');
  for (const seed of SEEDS) {
    const p = res.perSeed[seed];
    console.log(`  s${seed} days=${p.days} waveReach=${p.waveReach} unlocked4=${p.unlocked4} meetings=${p.n} kills=${p.kills} warned=${p.warned} blocked=${p.blocked} byOutcome=${JSON.stringify(p.byOutcome)} first=${p.first ? `d${p.first.day} ${p.first.shape}/${p.first.caller} ${p.first.mid} ${p.first.outcomeCls} r${p.first.rounds} ${p.first.party}` : 'none'}`);
  }
  const w = res.wall;
  console.log(`WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.nationalEver} natFinal=${w.nationalFinal} table=${w.table} entered=${w.entered} w1=${w.wave1reach} w2=${w.wave2reach} w3=${w.wave3reach} w4reach=${w.wave4reach} w5reach=${w.wave5reach} contactSeeds=${w.contactSeeds} median=${w.medianDays} days=${JSON.stringify(w.daysSorted)} deaths=${w.deaths} starv=${w.starv}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(w.deathsByCause)}`);
  console.log(`COMPLETENESS=${res.completeness ? 'PASS' : 'FAIL'} FIXTURES=${fx ? 'PASS' : 'FAIL'}`);
  const go = res.completeness && fx;
  console.log(go ? 'MACHINE-LEGS-PASS (sense judged separately)' : 'MACHINE-LEGS-FAIL');
  if (!go) process.exit(1);
}
if (require.main === module) main();
module.exports = { classifyOutcome, shapeOf, tilePresent, tileCount, gearOf, warnedOf, joinPairOk, readDemand, shortfallOf, fixtures, analyze, senseList };
