#!/usr/bin/env node
// scripts/test-evadeshape-a.js — sim-evadeshape-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-30/perseed-evadeshape-a/s<seed>-fresh.json
//   (fieldparty + w4dpr + breakline + shoutrec + tilejoin recorders
//   joined by fight-order index and verified, seeds 75101-75132;
//   joinendlines store is calledHelp-only, checked for errs/overflow
//   but NOT index-joined; evadelog store is evade-only, checked for
//   errs/overflow and cross-checked by (day, vid, mid) multiset
//   against the joined evade rows, NOT index-joined).
// Universe: EVERY joined row, all waves, all channels, all callers.
// Outcome (prereg order, evade FIRST): rounds<1 & 'evade' ->
// PRE-CONTACT-EVADE; rounds<1 & mFlee -> PRE-CONTACT-SCATTER;
// rounds<1 & vKill -> PRE-CONTACT-KILL; rounds>=1 & vKill -> KILL;
// rounds>=1 & mFlee -> DRIVE-OFF; rounds>=1 & vFlee -> FLEE
// (breakline branch sub-split); rounds>=1 & vDie -> DEATH; else
// OTHER. Evade vs flee vs drive-off vs scatter are decided from
// recorded (rounds, outcome) only — never from log text, intent,
// or any roster feed.
// WARNED (prereg): W1 = earlier meeting in the same seed with the
// same mid (corpus order); W2 = fieldparty trickKnown === true;
// W3 (sub-signal, only where both HP reads exist) = earlier same-
// mid meeting whose mHpLeft equals this meeting's mHpStart.
// UNWARNED = neither W1 nor W2. Scout sightings, rumors, and
// pre-contact shouts are UNMEASURED (no recorder captures them).
// PARTY (recorded state only): solo-tile = filtered tile length 0;
// tile-mates = length >= 1; joined = joinedAllyVid OR allyFromStart;
// crew size reported alongside, never substituted.
// AFTER-EVADE (per evade, corpus order per seed): next same-mid
// meeting (any vid), next same-mid-same-vid meeting, and the
// narrow same-individual candidate (next same-mid meeting with
// non-null mHpStart equal to the evade's mHpLeft — candidate only,
// never identity proof: a fresh spawn can share the HP).
// Usage:
//   node scripts/test-evadeshape-a.js --fixtures
//   node scripts/test-evadeshape-a.js [--out <path>] (judge corpus)
//   node scripts/test-evadeshape-a.js --sense (print ALL evade lines)
//   node scripts/test-evadeshape-a.js --detgate <scratchDir> <seed>
//   node scripts/test-evadeshape-a.js --taxaudit (distinct outcome pairs)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyBranch } = require('./breakline-lib');
const SEEDS = [];
for (let s = 75101; s <= 75132; s++) SEEDS.push(s);
const EVID_DEFAULT = path.join(REPO, 'evidence', '2026-10-30', 'perseed-evadeshape-a');

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
  if (rounds < 1 && out === 'evade') return { cls: 'PRE-CONTACT-EVADE', sub: 'evade' };
  if (rounds < 1 && out === 'mFlee') return { cls: 'PRE-CONTACT-SCATTER', sub: 'mFlee' };
  if (rounds < 1 && out === 'vKill') return { cls: 'PRE-CONTACT-KILL', sub: 'vKill' };
  if (rounds >= 1 && out === 'vKill') return { cls: 'KILL', sub: 'vKill' };
  if (rounds >= 1 && out === 'mFlee') return { cls: 'DRIVE-OFF', sub: 'mFlee' };
  if (rounds >= 1 && out === 'vFlee') return { cls: 'FLEE', sub: String(o.branch || 'UNKNOWN-BRANCH') };
  if (rounds >= 1 && out === 'vDie') return { cls: 'DEATH', sub: 'vDie' };
  return { cls: 'OTHER', sub: String(out) };
}
function evadeDamageAnomaly(j) {
  return (j.bl.mDealt | 0) !== 0 || (j.bl.vTaken | 0) !== 0;
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
function shortfallOf(rd, demand) {
  if (!rd) return { short: ['readiness-null'], blocked: null };
  const short = [];
  if ((rd.armored | 0) < demand.armored) short.push(`armored ${rd.armored}/${demand.armored}`);
  if ((rd.armed | 0) < demand.armed) short.push(`armed ${rd.armed}/${demand.armed}`);
  if ((rd.tricks | 0) < demand.tricks) short.push(`tricks ${rd.tricks}/${demand.tricks}`);
  if ((rd.veterans | 0) < demand.veterans) short.push(`veterans ${rd.veterans}/${demand.veterans}`);
  return { short, blocked: !rd.ready };
}
// after-evade helpers: list is the seed's joined rows in corpus order,
// idx is the evade's index. Rows are plain {mid, vid, day, mHpStart,
// mHpLeft, outcomeCls} for fixture use; real rows are mapped to this
// shape before calling.
function afterEvade(list, idx) {
  const ev = list[idx];
  let nextType = null, nextSame = null;
  for (let j = idx + 1; j < list.length; j++) {
    const r = list[j];
    if (r.mid !== ev.mid) continue;
    if (!nextType) nextType = { dayGap: r.day - ev.day, outcomeCls: r.outcomeCls, vid: r.vid, sameVid: r.vid === ev.vid, mHpStart: r.mHpStart, mHpLeft: r.mHpLeft };
    if (r.vid === ev.vid && !nextSame) nextSame = { dayGap: r.day - ev.day, outcomeCls: r.outcomeCls, mHpStart: r.mHpStart, mHpLeft: r.mHpLeft };
    if (nextType && nextSame) break;
  }
  const candidate = (nextType && nextType.mHpStart != null && ev.mHpLeft != null && nextType.mHpStart === ev.mHpLeft);
  return { nextType, nextSame, sameIndividualCandidate: !!candidate };
}
function multisetKey(day, vid, mid) { return `${day}|${vid}|${mid}`; }
function multisetDiff(aKeys, bKeys) {
  const count = (ks) => { const m = {}; for (const k of ks) m[k] = (m[k] || 0) + 1; return m; };
  const a = count(aKeys), b = count(bKeys);
  let diff = 0;
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff += Math.abs((a[k] || 0) - (b[k] || 0));
  return diff;
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
  eq('evade', classifyOutcome({ outcome: 'evade', rounds: 0 }).cls, 'PRE-CONTACT-EVADE');
  eq('evade rounds>=1 is not evade', classifyOutcome({ outcome: 'evade', rounds: 1 }).cls, 'OTHER');
  eq('pre-contact scatter', classifyOutcome({ outcome: 'mFlee', rounds: 0 }).cls, 'PRE-CONTACT-SCATTER');
  eq('drive-off differs from scatter', classifyOutcome({ outcome: 'mFlee', rounds: 3 }).cls, 'DRIVE-OFF');
  eq('flee differs from evade', classifyOutcome({ outcome: 'vFlee', rounds: 2, branch: 'FLOOR-BRANCH' }).cls, 'FLEE');
  eq('pre-contact kill', classifyOutcome({ outcome: 'vKill', rounds: 0 }).cls, 'PRE-CONTACT-KILL');
  eq('fought kill', classifyOutcome({ outcome: 'vKill', rounds: 3 }).cls, 'KILL');
  eq('death', classifyOutcome({ outcome: 'vDie', rounds: 2 }).cls, 'DEATH');
  eq('other unknown outcome', classifyOutcome({ outcome: 'truce', rounds: 2 }).cls, 'OTHER');
  eq('other round0 vDie', classifyOutcome({ outcome: 'vDie', rounds: 0 }).cls, 'OTHER');
  eq('other round0 vFlee', classifyOutcome({ outcome: 'vFlee', rounds: 0 }).cls, 'OTHER');
  eq('shape wild', shapeOf({ channel: 'field' }), 'wild');
  eq('shape raid', shapeOf({ channel: 'raid' }), 'raid');
  eq('shape other', shapeOf({ channel: 'other' }), 'other');
  eq('shape unknown', shapeOf({ channel: 'expedition' }), 'OTHER');
  eq('tile present', tilePresent({ tile: [{ vid: 'a', deadKnown: false }] }), true);
  eq('tile dead excluded', tilePresent({ tile: [{ vid: 'a', deadKnown: true }] }), false);
  eq('tile empty', tilePresent({ tile: [] }), false);
  eq('tile count excludes dead', tileCount({ tile: [{ vid: 'a', deadKnown: true }, { vid: 'b', deadKnown: false }] }), 1);
  eq('warned unwarned', warnedOf([], { mid: 'eulogy', mHpStart: 900, trickKnown: false }),
    { warned: false, w1: false, w2: false, w3: false, priorTypeCount: 0 });
  eq('warned prior-type only', warnedOf([{ mid: 'eulogy', mHpLeft: 800 }], { mid: 'eulogy', mHpStart: 900, trickKnown: false }),
    { warned: true, w1: true, w2: false, w3: false, priorTypeCount: 1 });
  eq('warned trick only', warnedOf([], { mid: 'audit', mHpStart: 1100, trickKnown: true }),
    { warned: true, w1: false, w2: true, w3: false, priorTypeCount: 0 });
  eq('warned re-meet hp continuity', warnedOf([{ mid: 'eulogy', mHpLeft: 853 }], { mid: 'eulogy', mHpStart: 853, trickKnown: false }),
    { warned: true, w1: true, w2: false, w3: true, priorTypeCount: 1 });
  eq('warned W3 N/A on null mHpStart (evade expedition)', warnedOf([{ mid: 'eater', mHpLeft: 1107 }], { mid: 'eater', mHpStart: null, trickKnown: false }),
    { warned: true, w1: true, w2: false, w3: false, priorTypeCount: 1 });
  eq('warned other-type ignored', warnedOf([{ mid: 'audit', mHpLeft: 1000 }], { mid: 'eulogy', mHpStart: 900, trickKnown: false }),
    { warned: false, w1: false, w2: false, w3: false, priorTypeCount: 0 });
  eq('warned trick null is unwarned', warnedOf([], { mid: 'eulogy', mHpStart: 900, trickKnown: null }),
    { warned: false, w1: false, w2: false, w3: false, priorTypeCount: 0 });
  eq('join ok', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'v', day: 5 }), true);
  eq('join mid mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'b', vid: 'v', day: 5 }), false);
  eq('join vid mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'w', day: 5 }), false);
  eq('join day mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'v', day: 6 }), false);
  const dem = { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 };
  eq('shortfall all met', shortfallOf({ armored: 3, armed: 5, tricks: 4, veterans: 1, ready: true }, dem),
    { short: [], blocked: false });
  eq('shortfall two bars', shortfallOf({ armored: 1, armed: 5, tricks: 2, veterans: 0, ready: false }, dem),
    { short: ['armored 1/3', 'tricks 2/3', 'veterans 0/1'], blocked: true });
  eq('shortfall null readiness', shortfallOf(null, dem), { short: ['readiness-null'], blocked: null });
  const live = readDemand();
  eq('demand parses integers', [live.armored, live.armorP, live.armed, live.tricks, live.veterans].every(v => Number.isInteger(v)), true);
  // Evade-damage anomaly flag (synthetic breakline-shaped rows).
  eq('evade anomaly clean', evadeDamageAnomaly({ bl: { mDealt: 0, vTaken: 0 } }), false);
  eq('evade anomaly dealt', evadeDamageAnomaly({ bl: { mDealt: 5, vTaken: 0 } }), true);
  eq('evade anomaly taken', evadeDamageAnomaly({ bl: { mDealt: 0, vTaken: 3 } }), true);
  // After-evade logic.
  const L = [
    { mid: 'eater', vid: 'v1', day: 51, mHpStart: null, mHpLeft: 1107, outcomeCls: 'PRE-CONTACT-EVADE' },
    { mid: 'audit', vid: 'v2', day: 60, mHpStart: 1100, mHpLeft: 900, outcomeCls: 'FLEE' },
    { mid: 'eater', vid: 'v2', day: 70, mHpStart: 1107, mHpLeft: 1000, outcomeCls: 'FLEE' },
    { mid: 'eater', vid: 'v1', day: 90, mHpStart: 1000, mHpLeft: 900, outcomeCls: 'DEATH' },
  ];
  const ae = afterEvade(L, 0);
  eq('after next-type gap+outcome', [ae.nextType.dayGap, ae.nextType.outcomeCls, ae.nextType.sameVid], [19, 'FLEE', false]);
  eq('after next-same-villager', [ae.nextSame.dayGap, ae.nextSame.outcomeCls], [39, 'DEATH']);
  eq('after same-individual candidate (hp continuity)', ae.sameIndividualCandidate, true);
  const ae2 = afterEvade(L.slice(0, 2), 0);
  eq('after NONE when no re-meeting', [ae2.nextType, ae2.nextSame, ae2.sameIndividualCandidate], [null, null, false]);
  const L3 = [
    { mid: 'eater', vid: 'v1', day: 51, mHpStart: null, mHpLeft: 1107, outcomeCls: 'PRE-CONTACT-EVADE' },
    { mid: 'eater', vid: 'v2', day: 70, mHpStart: 900, mHpLeft: 800, outcomeCls: 'FLEE' },
  ];
  eq('after candidate false on hp mismatch', afterEvade(L3, 0).sameIndividualCandidate, false);
  eq('multiset diff zero', multisetDiff(['1|a|x', '2|b|y'], ['2|b|y', '1|a|x']), 0);
  eq('multiset diff counts dupes', multisetDiff(['1|a|x', '1|a|x'], ['1|a|x']), 1);
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
    && Object.values(r.joinendlines.diag.overflow || {}).every(v => (v | 0) === 0)
    && storeOk(r.evadelog));
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
  // Full joined universe, all waves; warned priors over ALL meetings.
  const U = [];
  for (const seed of SEEDS) {
    const prior = [];
    for (const j of joinedBySeed[seed]) {
      const w = warnedOf(prior, { mid: j.fp.mid, mHpStart: j.bl.mHpStart, trickKnown: j.fp.trickKnown });
      prior.push({ mid: j.fp.mid, mHpLeft: j.bl.mHpLeft });
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
        scholarLed: !!(j.fp.leader && j.fp.leader.isScholar),
        wave: (j.fp.wave | 0) }));
    }
  }
  const evades = U.filter(j => j.oc.cls === 'PRE-CONTACT-EVADE');
  const byWave = {};
  for (const j of evades) byWave[j.wave] = (byWave[j.wave] || 0) + 1;
  const byOutcomeAll = {};
  for (const j of U) byOutcomeAll[j.oc.cls] = (byOutcomeAll[j.oc.cls] || 0) + 1;
  const otherCount = U.filter(j => j.oc.cls === 'OTHER').length;
  const shapeOtherCount = U.filter(j => j.shape === 'OTHER').length;
  const evadeAnomalies = evades.filter(j => evadeDamageAnomaly(j));
  // Evadelog cross-check per seed + distinct lines.
  let evadelogMismatch = 0, evadelogBadLines = 0;
  const evadelogLines = [];
  const distinctLines = {};
  for (const r of rows) {
    const elKeys = (r.evadelog.meetings || []).map(m => multisetKey(m.day, m.vid, m.mid));
    const joinedEv = evades.filter(j => j.seed === r.seed).map(j => multisetKey(j.fp.day, j.fp.vid, j.fp.mid));
    evadelogMismatch += multisetDiff(elKeys, joinedEv);
    for (const m of (r.evadelog.meetings || [])) {
      evadelogLines.push({ seed: r.seed, day: m.day, vid: m.vid, mid: m.mid, wave: m.wave, log: m.log || [] });
      if ((m.log || []).length !== 1) evadelogBadLines++;
      for (const line of (m.log || [])) distinctLines[line] = (distinctLines[line] || 0) + 1;
    }
  }
  // Death-format matchability: does any deathsDetail who equal a meeting vid?
  const deathsMatchableBySeed = {};
  for (const r of rows) {
    const vids = new Set((r.fieldparty.meetings || []).map(m => m.vid));
    const whoVals = (r.deathsDetail || []).map(d => d.who);
    deathsMatchableBySeed[r.seed] = whoVals.some(w => vids.has(String(w)));
  }
  const deathsMatchableSeeds = Object.values(deathsMatchableBySeed).filter(Boolean).length;
  // After-evade per evade.
  const evadeDetail = [];
  const seedU = {};
  for (const j of U) (seedU[j.seed] = seedU[j.seed] || []).push(j);
  for (const seed of SEEDS) {
    const list = seedU[seed];
    const row = rows.find(r => r.seed === seed);
    const plain = list.map(j => ({ mid: j.fp.mid, vid: j.fp.vid, day: j.fp.day, mHpStart: j.bl.mHpStart, mHpLeft: j.bl.mHpLeft, outcomeCls: j.oc.cls }));
    list.forEach((j, idx) => {
      if (j.oc.cls !== 'PRE-CONTACT-EVADE') return;
      const ae = afterEvade(plain, idx);
      const laterSameVid = list.slice(idx + 1).filter(x => x.fp.vid === j.fp.vid);
      const lastLater = laterSameVid.length ? laterSameVid[laterSameVid.length - 1].fp.day : null;
      let deathMatch = null;
      if (deathsMatchableBySeed[seed]) {
        const hit = (row.deathsDetail || []).filter(d => String(d.who) === String(j.fp.vid) && (d.day | 0) > (j.fp.day | 0));
        if (hit.length) deathMatch = hit[0];
      }
      // Repeat-evader counts (same vid, same seed).
      const vidEvades = list.filter(x => x.oc.cls === 'PRE-CONTACT-EVADE' && x.fp.vid === j.fp.vid).length;
      evadeDetail.push({ seed: j.seed, day: j.fp.day, part: j.fp.part, mid: j.fp.mid, wave: j.wave,
        caller: j.fp.caller, shape: j.shape, scholarLed: j.scholarLed,
        leaderVid: j.fp.vid, leaderFirst: j.dp.leaderFirst,
        party: j.party, tileCount: j.tileCount, crewSize: (j.fp.crew || []).length,
        joinedAllyVid: j.bl.joinedAllyVid, allyFromStart: j.bl.allyFromStart,
        intent: j.bl.intent, intentWhy: j.fp.intentWhy, gear: j.gear,
        mHpLeft: j.bl.mHpLeft, mHpStart: j.bl.mHpStart, vHpLeft: j.bl.vHpLeft,
        trickKnown: j.fp.trickKnown, warned: j.warned, damageAnomaly: evadeDamageAnomaly(j),
        nextType: ae.nextType, nextSame: ae.nextSame, sameIndividualCandidate: ae.sameIndividualCandidate,
        laterSameVidMeetings: laterSameVid.length, lastLaterDay: lastLater,
        deathMatch, vidEvadeCountInSeed: vidEvades });
    });
  }
  const countBy = (list, keyFn) => {
    const m = {};
    for (const j of list) { const k = keyFn(j); m[k] = (m[k] || 0) + 1; }
    return m;
  };
  const evByShape = countBy(evades, j => j.shape);
  const evByParty = countBy(evades, j => j.party);
  const evByCaller = countBy(evades, j => j.fp.caller);
  const evByBeast = countBy(evades, j => j.fp.mid);
  const evByIntent = countBy(evades, j => j.bl.intent);
  const evWarned = evades.filter(j => j.warned.warned).length;
  const evW1 = evades.filter(j => j.warned.w1).length;
  const evW2 = evades.filter(j => j.warned.w2).length;
  const evW3 = evades.filter(j => j.warned.w3).length;
  const evByWaveWarned = {};
  for (const j of evades) {
    const t = evByWaveWarned[j.wave] = evByWaveWarned[j.wave] || { n: 0, warned: 0 };
    t.n++; if (j.warned.warned) t.warned++;
  }
  const evByWaveParty = {};
  for (const j of evades) {
    const t = evByWaveParty[j.wave] = evByWaveParty[j.wave] || {};
    t[j.party] = (t[j.party] || 0) + 1;
  }
  const ev4 = evades.filter(j => j.wave === 4);
  const U4 = U.filter(j => j.wave === 4);
  const nextTypeGaps = evadeDetail.filter(d => d.nextType).map(d => d.nextType.dayGap);
  const nextSameGaps = evadeDetail.filter(d => d.nextSame).map(d => d.nextSame.dayGap);
  const med = (arr) => {
    if (!arr.length) return null;
    const s = arr.slice().sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const nextTypeOutcomes = countBy(evadeDetail.filter(d => d.nextType), d => d.nextType.outcomeCls);
  const nextSameOutcomes = countBy(evadeDetail.filter(d => d.nextSame), d => d.nextSame.outcomeCls);
  const repeatEvaders = {};
  for (const d of evadeDetail) {
    const k = `${d.seed}|${d.leaderVid}`;
    repeatEvaders[k] = Math.max(repeatEvaders[k] || 0, d.vidEvadeCountInSeed);
  }
  const repeat3plus = Object.entries(repeatEvaders).filter(([, n]) => n >= 3);
  const perSeed = {};
  for (const seed of SEEDS) {
    const list = U.filter(j => j.seed === seed);
    const row = rows.find(r => r.seed === seed);
    const evList = evades.filter(j => j.seed === seed);
    const w4list = U4.filter(j => j.seed === seed);
    perSeed[seed] = {
      n: list.length, evades: evList.length, wave4meetings: w4list.length,
      wave4evades: evList.filter(j => j.wave === 4).length,
      unlocked4: (row.waveReach || 1) >= 4 ? 1 : 0,
      waveReach: row.waveReach || 1,
      days: row.days, endReason: row.endReason, won: row.won,
      nationalEver: row.nationalEver, table: row.table, entered: row.entered,
      evByWave: countBy(evList, j => String(j.wave)),
      firstEvade: evList[0] ? { day: evList[0].fp.day, mid: evList[0].fp.mid, wave: evList[0].wave, shape: evList[0].shape, caller: evList[0].fp.caller, party: evList[0].party, leaderFirst: evList[0].dp.leaderFirst } : null,
    };
  }
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
  // Supplementary breakdowns (same corpus, same legs): channel shape of
  // the evade phenomenon vs the scatter phenomenon, wave-4 meeting
  // shape/outcome, and evader gear/scholar summary.
  const byChannel = {};
  for (const j of U) {
    const t = byChannel[j.shape] = byChannel[j.shape] || { meetings: 0, evades: 0, scatters: 0 };
    t.meetings++;
    if (j.oc.cls === 'PRE-CONTACT-EVADE') t.evades++;
    if (j.oc.cls === 'PRE-CONTACT-SCATTER') t.scatters++;
  }
  const byWaveMeetings = countBy(U, j => String(j.wave));
  const scatterByWave = {};
  for (const j of U.filter(x => x.oc.cls === 'PRE-CONTACT-SCATTER')) scatterByWave[j.wave] = (scatterByWave[j.wave] || 0) + 1;
  const w4ByShape = countBy(U4, j => j.shape);
  const w4ByOutcome = countBy(U4, j => j.oc.cls);
  const evArmorPs = evades.map(j => j.gear.armorP).filter(v => v != null);
  const evArmorSorted = evArmorPs.slice().sort((a, b) => a - b);
  const evGear = { armed: evades.filter(j => j.gear.armed).length,
    scholarLed: evades.filter(j => j.scholarLed).length,
    veteranW3: evades.filter(j => j.gear.veteranW3).length,
    armorPMin: evArmorSorted.length ? evArmorSorted[0] : null,
    armorPMedian: evArmorSorted.length ? evArmorSorted[Math.floor(evArmorSorted.length / 2)] : null,
    armorPMax: evArmorSorted.length ? evArmorSorted[evArmorSorted.length - 1] : null };
  const deathMatchPlayerTrue = evadeDetail.filter(d => d.deathMatch && d.deathMatch.player).length;
  const completeness = corpusOk && joinErrors === 0 && otherCount === 0 && evadelogMismatch === 0;
  return { corpusOk, joinTotal, joinErrors, branchMismatches, waveDisagree,
    universeN: U.length, evadeN: evades.length, wave4N: U4.length, wave4EvadeN: ev4.length,
    byOutcomeAll, byWave, evByShape, evByParty, evByCaller, evByBeast, evByIntent,
    evWarned, evW1, evW2, evW3, evByWaveWarned, evByWaveParty,
    evadeAnomalies: evadeAnomalies.length,
    evadelogMismatch, evadelogBadLines, evadelogLines: evadelogLines.length,
    distinctLines: Object.entries(distinctLines).map(([line, n]) => ({ line, n })),
    deathsMatchableSeeds, deathsMatchableBySeed,
    evadeDetail, nextTypeGaps, nextSameGaps,
    nextTypeMedianGap: med(nextTypeGaps), nextSameMedianGap: med(nextSameGaps),
    nextTypeNone: evadeDetail.filter(d => !d.nextType).length,
    nextSameNone: evadeDetail.filter(d => !d.nextSame).length,
    nextTypeOutcomes, nextSameOutcomes,
    sameIndividualCandidates: evadeDetail.filter(d => d.sameIndividualCandidate).length,
    deathMatches: evadeDetail.filter(d => d.deathMatch).length,
    laterMeetingsAny: evadeDetail.filter(d => d.laterSameVidMeetings > 0).length,
    repeat3plus: repeat3plus.map(([k, n]) => ({ key: k, n })),
    otherCount, shapeOtherCount, demand, perSeed,
    byChannel, byWaveMeetings, scatterByWave, w4ByShape, w4ByOutcome,
    evGear, deathMatchPlayerTrue,
    wall: { won, wonFull, nationalEver, nationalFinal, table: tableN, entered,
      wave1reach: waveReachCount(1), wave2reach: waveReachCount(2), wave3reach: waveReachCount(3),
      wave4reach: waveReachCount(4), wave5reach: waveReachCount(5),
      medianDays, daysSorted, deaths, starv, deathsByCause,
      contactSeeds: Object.values(perSeed).filter(p => p.wave4meetings > 0).length,
      evadeSeeds: Object.values(perSeed).filter(p => p.evades > 0).length },
    completeness,
    perSeedRows: rows.map(r => ({ seed: r.seed, days: r.days,
      endReason: r.endReason, won: r.won, waveReach: r.waveReach,
      nationalEver: r.nationalEver, deaths: r.deathTotal,
      fpMeetings: (r.fieldparty.meetings || []).length,
      evadelogMeetings: (r.evadelog.meetings || []).length })) };
}

function taxAudit(evidDir) {
  const pairs = {};
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(p)) continue;
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const m of (r.breakline.meetings || [])) {
      const bucket = (m.rounds | 0) < 1 ? 'rounds<1' : 'rounds>=1';
      const k = `${bucket} x ${m.outcome}`;
      pairs[k] = (pairs[k] || 0) + 1;
    }
  }
  const covered = {};
  for (const k of Object.keys(pairs)) {
    const [bucket, outcome] = k.split(' x ');
    covered[k] = classifyOutcome({ outcome, rounds: bucket === 'rounds<1' ? 0 : 1 }).cls;
  }
  return { pairs, covered };
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || EVID_DEFAULT;
  if (args.indexOf('--fixtures') >= 0) { process.exit(fixtures() ? 0 : 1); }
  if (args.indexOf('--taxaudit') >= 0) {
    const t = taxAudit(evidDir);
    console.log('TAXAUDIT distinct (rounds-bucket x outcome) pairs:');
    for (const [k, n] of Object.entries(t.pairs).sort()) console.log(`  ${k}: n=${n} -> ${t.covered[k]}`);
    const uncovered = Object.entries(t.covered).filter(([, cls]) => cls === 'OTHER');
    console.log(uncovered.length ? `TAXAUDIT-UNCOVERED: ${JSON.stringify(uncovered)}` : 'TAXAUDIT-COVERED (no OTHER pairs)');
    process.exit(uncovered.length ? 1 : 0);
  }
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
    const res = analyze(evidDir);
    console.log(`SENSE evade-lines=${res.evadelogLines} badLineCounts=${res.evadelogBadLines} distinctLines=${res.distinctLines.length}`);
    for (const d of res.distinctLines) console.log(`  DISTINCT x${d.n}: ${d.line}`);
    // Full line inventory is printed by a separate pass over the corpus
    // rows (evadelog store order) so the reader sees every line.
    for (const seed of SEEDS) {
      const r = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
      for (const m of (r.evadelog.meetings || [])) {
        for (const line of (m.log || [])) console.log(`s${seed} d${m.day} ${m.mid} w${m.wave} vid=${m.vid}: ${line}`);
      }
    }
    return;
  }
  const fx = fixtures();
  const res = analyze(evidDir);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 1) + '\n');
  console.log('=== sim-evadeshape-a census ===');
  console.log(`DEMAND w4 (live from standing.js): ${JSON.stringify(res.demand)}`);
  console.log(`corpusOk=${res.corpusOk} joins=${res.joinTotal} joinErrors=${res.joinErrors} branchMismatches=${res.branchMismatches} waveDisagree=${res.waveDisagree}`);
  console.log(`UNIVERSE meetings=${res.universeN} EVADES=${res.evadeN} (${(100 * res.evadeN / Math.max(1, res.universeN)).toFixed(1)}%) wave4meetings=${res.wave4N} wave4evades=${res.wave4EvadeN}`);
  console.log(`BY-OUTCOME-ALL: ${JSON.stringify(res.byOutcomeAll)}`);
  console.log(`EVADES-BY-WAVE: ${JSON.stringify(res.byWave)}`);
  console.log(`EVADES-BY-SHAPE: ${JSON.stringify(res.evByShape)} BY-PARTY: ${JSON.stringify(res.evByParty)} BY-CALLER: ${JSON.stringify(res.evByCaller)}`);
  console.log(`EVADES-BY-BEAST: ${JSON.stringify(res.evByBeast)} BY-INTENT: ${JSON.stringify(res.evByIntent)}`);
  console.log(`EVADES WARNED=${res.evWarned}/${res.evadeN} W1=${res.evW1} W2=${res.evW2} W3=${res.evW3} anomalies=${res.evadeAnomalies}`);
  console.log(`EVADES-BY-WAVE-WARNED: ${JSON.stringify(res.evByWaveWarned)} BY-WAVE-PARTY: ${JSON.stringify(res.evByWaveParty)}`);
  console.log(`EVADELOG: lines=${res.evadelogLines} mismatch=${res.evadelogMismatch} badLineCounts=${res.evadelogBadLines} distinctLines=${res.distinctLines.length}`);
  console.log(`BY-CHANNEL: ${JSON.stringify(res.byChannel)} BY-WAVE-MEETINGS: ${JSON.stringify(res.byWaveMeetings)} SCATTER-BY-WAVE: ${JSON.stringify(res.scatterByWave)}`);
  console.log(`WAVE4-BY-SHAPE: ${JSON.stringify(res.w4ByShape)} WAVE4-BY-OUTCOME: ${JSON.stringify(res.w4ByOutcome)}`);
  console.log(`EVADER-GEAR: ${JSON.stringify(res.evGear)} deathMatchPlayerTrue=${res.deathMatchPlayerTrue}`);
  console.log(`AFTER-EVADE: nextType medianGap=${res.nextTypeMedianGap} none=${res.nextTypeNone}/${res.evadeN} outcomes=${JSON.stringify(res.nextTypeOutcomes)}; nextSame medianGap=${res.nextSameMedianGap} none=${res.nextSameNone}/${res.evadeN} outcomes=${JSON.stringify(res.nextSameOutcomes)}; sameIndividualCandidates=${res.sameIndividualCandidates}`);
  console.log(`VILLAGER-AFTERMATH: laterMeetingsAny=${res.laterMeetingsAny}/${res.evadeN} deathMatches=${res.deathMatches} deathsMatchableSeeds=${res.deathsMatchableSeeds}/32 repeatEvaders3plus=${JSON.stringify(res.repeat3plus)}`);
  console.log(`TAXONOMY-OTHER=${res.otherCount} SHAPE-OTHER=${res.shapeOtherCount}`);
  console.log('PER-SEED:');
  for (const seed of SEEDS) {
    const p = res.perSeed[seed];
    console.log(`  s${seed} days=${p.days} waveReach=${p.waveReach} unlocked4=${p.unlocked4} meetings=${p.n} evades=${p.evades} w4meetings=${p.wave4meetings} w4evades=${p.wave4evades} evByWave=${JSON.stringify(p.evByWave)} firstEvade=${p.firstEvade ? `d${p.firstEvade.day} ${p.firstEvade.mid} w${p.firstEvade.wave} ${p.firstEvade.shape}/${p.firstEvade.caller} ${p.firstEvade.party}` : 'none'}`);
  }
  const w = res.wall;
  console.log(`WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.nationalEver} natFinal=${w.nationalFinal} table=${w.table} entered=${w.entered} w1=${w.wave1reach} w2=${w.wave2reach} w3=${w.wave3reach} w4reach=${w.wave4reach} w5reach=${w.wave5reach} contactSeeds=${w.contactSeeds} evadeSeeds=${w.evadeSeeds} median=${w.medianDays} days=${JSON.stringify(w.daysSorted)} deaths=${w.deaths} starv=${w.starv}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(w.deathsByCause)}`);
  console.log(`COMPLETENESS=${res.completeness ? 'PASS' : 'FAIL'} FIXTURES=${fx ? 'PASS' : 'FAIL'}`);
  const go = res.completeness && fx;
  console.log(go ? 'MACHINE-LEGS-PASS (sense judged separately)' : 'MACHINE-LEGS-FAIL');
  if (!go) process.exit(1);
}
if (require.main === module) main();
module.exports = { classifyOutcome, shapeOf, tilePresent, tileCount, gearOf, warnedOf, joinPairOk, readDemand, shortfallOf, fixtures, analyze, afterEvade, multisetDiff, evadeDamageAnomaly, taxAudit };
