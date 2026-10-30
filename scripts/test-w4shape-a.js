#!/usr/bin/env node
// scripts/test-w4shape-a.js — sim-w4shape-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-29/perseed-w4shape-a/s<seed>-fresh.json
//   (fieldparty + w4dpr + breakline + shoutrec + tilejoin recorders,
//   seeds 75101-75108; joinendlines store is calledHelp-only, so it is
//   checked for errs/overflow but NOT index-joined).
// Join: per seed, fp/dp/bl/sr/tj join by fight-order index; VERIFIED
// (mid, vid, day must match at every index); join errors must be 0.
// Universe: every joined row with fieldparty wave == 4, all channels,
// all callers, scholar-led flagged, never dropped.
// Shape = fieldparty channel verbatim: field -> wild, raid -> raid,
// other -> other. Wild-judged sub-count (breakline comparability):
// channel field AND caller in {resolve, patrol, aid} AND leader NOT
// scholar.
// Outcome (prereg order): rounds<1 & mFlee -> PRE-CONTACT-SCATTER;
// rounds<1 & vKill -> PRE-CONTACT-KILL; rounds>=1 & vKill -> KILL;
// rounds>=1 & mFlee -> DRIVE-OFF; rounds>=1 & vFlee -> FLEE (sub-split
// by recomputed breakline branch); rounds>=1 & vDie -> DEATH; else OTHER.
// Tile-mate presence: fieldparty tile filtered to deadKnown !== true,
// length >= 1 (breakline convention), reported only, never a decision
// input (perception law).
// Gear: fieldparty leader (armed, armorP, veteranW3) + w4dpr loadoutPost
// (melee, ranged, carriedWeapons), falling back to loadoutPre, with the
// source disclosed.
// Usage:
//   node scripts/test-w4shape-a.js --fixtures   (synthetic taxonomy proof)
//   node scripts/test-w4shape-a.js [--out <path>] (judge the corpus)
//   node scripts/test-w4shape-a.js --sense       (print wave-4 fight logs)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyBranch } = require('./breakline-lib');
const SEEDS = [];
for (let s = 75101; s <= 75108; s++) SEEDS.push(s);
const WILD_CALLERS = ['resolve', 'patrol', 'aid'];

function shapeOf(fp) {
  const c = fp && fp.channel;
  if (c === 'field') return 'wild';
  if (c === 'raid') return 'raid';
  if (c === 'other') return 'other';
  return 'OTHER';
}
function isWildJudged(fp) {
  return fp && fp.channel === 'field' && WILD_CALLERS.indexOf(fp.caller) >= 0
    && !(fp.leader && fp.leader.isScholar);
}
function tilePresent(fp) {
  const tile = (fp.tile || []).filter(t => t.deadKnown !== true);
  return tile.length >= 1;
}
function tileCount(fp) {
  return (fp.tile || []).filter(t => t.deadKnown !== true).length;
}
// classifyOutcome takes {outcome, rounds, branch} and returns
// {cls, sub}. Branch is the recomputed breakline branch reason.
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

function fixtures() {
  let checks = 0, fails = 0;
  const eq = (name, got, want) => {
    checks++;
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      fails++;
      console.log(`  FIXTURE-FAIL ${name}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
    }
  };
  // Outcome taxonomy (prereg order).
  eq('pre-contact scatter', classifyOutcome({ outcome: 'mFlee', rounds: 0 }).cls, 'PRE-CONTACT-SCATTER');
  eq('pre-contact kill', classifyOutcome({ outcome: 'vKill', rounds: 0 }).cls, 'PRE-CONTACT-KILL');
  eq('fought kill', classifyOutcome({ outcome: 'vKill', rounds: 3 }).cls, 'KILL');
  eq('drive-off', classifyOutcome({ outcome: 'mFlee', rounds: 3 }).cls, 'DRIVE-OFF');
  eq('flee hopeless sub', classifyOutcome({ outcome: 'vFlee', rounds: 2, branch: 'HOPELESS-BRANCH' }).sub, 'HOPELESS-BRANCH');
  eq('flee floor sub', classifyOutcome({ outcome: 'vFlee', rounds: 1, branch: 'FLOOR-BRANCH' }).sub, 'FLOOR-BRANCH');
  eq('flee learn sub', classifyOutcome({ outcome: 'vFlee', rounds: 3, branch: 'LEARN-BRANCH' }).sub, 'LEARN-BRANCH');
  eq('flee cap sub', classifyOutcome({ outcome: 'vFlee', rounds: 15, branch: 'CAP' }).sub, 'CAP');
  eq('flee trick sub', classifyOutcome({ outcome: 'vFlee', rounds: 4, branch: 'TRICK-EXIT' }).sub, 'TRICK-EXIT');
  eq('death', classifyOutcome({ outcome: 'vDie', rounds: 2 }).cls, 'DEATH');
  eq('other unknown outcome', classifyOutcome({ outcome: 'truce', rounds: 2 }).cls, 'OTHER');
  eq('other round0 vDie', classifyOutcome({ outcome: 'vDie', rounds: 0 }).cls, 'OTHER');
  eq('other null outcome', classifyOutcome({ outcome: null, rounds: 1 }).cls, 'OTHER');
  // Shape mapping.
  eq('shape wild', shapeOf({ channel: 'field' }), 'wild');
  eq('shape raid', shapeOf({ channel: 'raid' }), 'raid');
  eq('shape other', shapeOf({ channel: 'other' }), 'other');
  eq('shape unknown', shapeOf({ channel: 'expedition' }), 'OTHER');
  // Wild-judged filter.
  eq('wild-judged resolve', isWildJudged({ channel: 'field', caller: 'resolve', leader: { isScholar: false } }), true);
  eq('wild-judged patrol', isWildJudged({ channel: 'field', caller: 'patrol', leader: { isScholar: null } }), true);
  eq('wild-judged aid', isWildJudged({ channel: 'field', caller: 'aid', leader: { isScholar: false } }), true);
  eq('wild-judged scholar excluded', isWildJudged({ channel: 'field', caller: 'resolve', leader: { isScholar: true } }), false);
  eq('wild-judged sortie excluded', isWildJudged({ channel: 'field', caller: 'sortie', leader: { isScholar: false } }), false);
  eq('wild-judged raid excluded', isWildJudged({ channel: 'raid', caller: 'resolve', leader: { isScholar: false } }), false);
  // Tile-presence rule (deadKnown excluded).
  eq('tile present', tilePresent({ tile: [{ vid: 'a', deadKnown: false }] }), true);
  eq('tile dead excluded', tilePresent({ tile: [{ vid: 'a', deadKnown: true }] }), false);
  eq('tile empty', tilePresent({ tile: [] }), false);
  eq('tile null deadKnown counts', tilePresent({ tile: [{ vid: 'a', deadKnown: null }] }), true);
  eq('tile count excludes dead', tileCount({ tile: [{ vid: 'a', deadKnown: true }, { vid: 'b', deadKnown: false }] }), 1);
  console.log(fails === 0 ? `FIXTURES-PASS (${checks} checks, 0 fails)` : `FIXTURES-FAIL (${checks} checks, ${fails} fails)`);
  return fails === 0;
}

function analyze(evidDir) {
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
  const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && storeOk(r.fieldparty) && storeOk(r.w4dpr) && storeOk(r.breakline)
    && storeOk(r.shoutrec) && (r.tilejoin === null || storeOk(r.tilejoin))
    && r.joinendlines && r.joinendlines.diag.errs === 0
    && Object.values(r.joinendlines.diag.overflow || {}).every(v => (v | 0) === 0));
  let joinErrors = 0, joinTotal = 0, branchMismatches = 0, waveDisagree = 0;
  const joined = [];
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [],
      bl = r.breakline.meetings || [], sr = r.shoutrec.meetings || [],
      tj = (r.tilejoin && r.tilejoin.meetings) || [];
    const lens = [fp.length, dp.length, bl.length, sr.length, tj.length];
    const n = Math.min.apply(null, lens);
    for (const L of lens) joinErrors += Math.abs(L - fp.length);
    for (let i = 0; i < n; i++) {
      joinTotal++;
      const a = fp[i], b = dp[i], c = bl[i], d = sr[i], e = tj[i];
      if (a.mid !== b.mid || a.vid !== b.vid || a.day !== b.day
        || a.mid !== c.mid || a.vid !== c.vid || a.day !== c.day
        || a.mid !== d.mid || a.vid !== d.vid || a.day !== d.day
        || a.mid !== e.mid || a.vid !== e.vid || a.day !== e.day) { joinErrors++; continue; }
      if ((b.wave | 0) !== (a.wave | 0) || (c.wave | 0) !== (a.wave | 0)) waveDisagree++;
      const recomputed = classifyBranch(c);
      if (recomputed.reason !== c.branch) branchMismatches++;
      joined.push({ seed: r.seed, fp: a, dp: b, bl: c, sr: d, tj: e, branch: recomputed.reason });
    }
  }
  const U = joined.filter(j => (j.fp.wave | 0) === 4);
  const table = {};
  for (const j of U) {
    const shape = shapeOf(j.fp);
    const oc = classifyOutcome({ outcome: j.bl.outcome, rounds: j.bl.rounds, branch: j.branch });
    const party = tilePresent(j.fp) ? 'party' : 'solo';
    j.shape = shape; j.oc = oc; j.party = party;
    j.gear = gearOf(j.dp, j.fp);
    j.scholarLed = !!(j.fp.leader && j.fp.leader.isScholar);
    j.wildJudged = isWildJudged(j.fp);
    table[shape] = table[shape] || { n: 0, byOutcome: {}, byParty: {}, fought: 0, kills: 0, preKills: 0 };
    const t = table[shape];
    t.n++;
    t.byOutcome[oc.cls] = (t.byOutcome[oc.cls] || 0) + 1;
    t.byParty[party] = t.byParty[party] || {};
    t.byParty[party][oc.cls] = (t.byParty[party][oc.cls] || 0) + 1;
    if ((j.bl.rounds | 0) >= 1) t.fought++;
    if (oc.cls === 'KILL') t.kills++;
    if (oc.cls === 'PRE-CONTACT-KILL') t.preKills++;
  }
  const byOutcome = {}, byShapeOutcome = {}, byParty = {};
  for (const j of U) {
    byOutcome[j.oc.cls] = (byOutcome[j.oc.cls] || 0) + 1;
    byParty[j.party] = byParty[j.party] || {};
    byParty[j.party][j.oc.cls] = (byParty[j.party][j.oc.cls] || 0) + 1;
  }
  const fleeSub = {};
  for (const j of U.filter(x => x.oc.cls === 'FLEE')) fleeSub[j.oc.sub] = (fleeSub[j.oc.sub] || 0) + 1;
  const killsFought = U.filter(j => j.oc.cls === 'KILL').length;
  const killsPre = U.filter(j => j.oc.cls === 'PRE-CONTACT-KILL').length;
  const otherCount = U.filter(j => j.oc.cls === 'OTHER').length;
  const perSeed = {};
  for (const seed of SEEDS) {
    const list = U.filter(j => j.seed === seed);
    const first = list[0] || null;
    perSeed[seed] = {
      n: list.length,
      byOutcome: list.reduce((m, j) => { m[j.oc.cls] = (m[j.oc.cls] || 0) + 1; return m; }, {}),
      kills: list.filter(j => j.oc.cls === 'KILL').length,
      first: first ? { day: first.fp.day, channel: first.fp.channel, shape: first.shape,
        caller: first.fp.caller, mid: first.fp.mid, leaderVid: first.fp.vid,
        scholarLed: first.scholarLed, outcome: first.bl.outcome, outcomeCls: first.oc.cls,
        rounds: first.bl.rounds, party: first.party, tileCount: tileCount(first.fp),
        mHpStart: first.bl.mHpStart, gear: first.gear } : null,
    };
  }
  const firstMetAll = {};
  for (const seed of SEEDS) firstMetAll[seed] = perSeed[seed].first;
  const foughtList = U.filter(j => (j.bl.rounds | 0) >= 1);
  const detailList = U.map(j => ({ seed: j.seed, day: j.fp.day, part: j.fp.part,
    mid: j.fp.mid, caller: j.fp.caller, shape: j.shape, wildJudged: j.wildJudged,
    scholarLed: j.scholarLed, leaderVid: j.fp.vid, outcome: j.bl.outcome,
    outcomeCls: j.oc.cls, fleeSub: j.oc.sub, rounds: j.bl.rounds,
    mHpStart: j.bl.mHpStart, mHpLeft: j.bl.mHpLeft, mDealt: j.bl.mDealt,
    vTaken: j.bl.vTaken, party: j.party, tileCount: tileCount(j.fp),
    tileUnknown: j.fp.tileUnknown, calledHelp: j.bl.calledHelp,
    joinedAllyVid: j.bl.joinedAllyVid, intent: j.bl.intent, gear: j.gear,
    hasLog: !!(j.dp.log && j.dp.log.length) }));
  // Wall numbers.
  const won = rows.reduce((t, r) => t + r.won, 0);
  const wonFull = rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length;
  const nationalEver = rows.reduce((t, r) => t + r.nationalEver, 0);
  const nationalFinal = rows.reduce((t, r) => t + r.nationalFinal, 0);
  const tableN = rows.reduce((t, r) => t + r.table, 0);
  const entered = rows.reduce((t, r) => t + r.entered, 0);
  const deaths = rows.reduce((t, r) => t + r.deathTotal, 0);
  const waveReachCount = (w) => rows.filter(r => (r.waveReach || 1) >= w).length;
  const daysSorted = rows.map(r => r.days).sort((a, b) => a - b);
  const medianDays = daysSorted[Math.floor(daysSorted.length / 2)];
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const completeness = corpusOk && joinErrors === 0 && otherCount === 0;
  const result = { corpusOk, joinTotal, joinErrors, branchMismatches, waveDisagree,
    universeN: U.length, foughtN: foughtList.length, byShape: table, byOutcome,
    byParty, fleeSub, killsFought, killsPre, otherCount,
    wildJudgedN: U.filter(j => j.wildJudged).length,
    scholarLedN: U.filter(j => j.scholarLed).length,
    perSeed, firstMetAll, detailList,
    wall: { won, wonFull, nationalEver, nationalFinal, table: tableN, entered,
      wave4reach: waveReachCount(4), wave5reach: waveReachCount(5),
      medianDays, daysSorted, deaths, deathsByCause },
    completeness, perSeedRows: rows.map(r => ({ seed: r.seed, days: r.days,
      endReason: r.endReason, won: r.won, waveReach: r.waveReach,
      nationalEver: r.nationalEver, deaths: r.deathTotal,
      fpMeetings: (r.fieldparty.meetings || []).length })) };
  return result;
}

function sense(evidDir) {
  const res = analyze(evidDir);
  // Re-read rows for logs: detailList lacks logs, so rebuild from corpus.
  const rows = {};
  for (const seed of SEEDS) rows[seed] = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
  const U = [];
  for (const seed of SEEDS) {
    const r = rows[seed];
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [], bl = r.breakline.meetings || [];
    const n = Math.min(fp.length, dp.length, bl.length);
    for (let i = 0; i < n; i++) {
      if ((fp[i].wave | 0) !== 4) continue;
      if ((bl[i].rounds | 0) < 1) continue;
      U.push({ seed, day: fp[i].day, mid: fp[i].mid, caller: fp[i].caller,
        channel: fp[i].channel, outcome: bl[i].outcome, rounds: bl[i].rounds,
        log: dp[i].log || [] });
    }
  }
  console.log(`SENSE-CANDIDATES fought-wave4=${U.length}`);
  for (const m of U) {
    console.log(`\n--- s${m.seed} d${m.day} ${m.mid} caller=${m.caller} channel=${m.channel} outcome=${m.outcome} rounds=${m.rounds} logLines=${m.log.length} ---`);
    for (const line of m.log) console.log('  ' + line);
  }
  return U.length;
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-w4shape-a');
  if (args.indexOf('--fixtures') >= 0) { process.exit(fixtures() ? 0 : 1); }
  if (args.indexOf('--sense') >= 0) { sense(evidDir); return; }
  const fx = fixtures();
  const res = analyze(evidDir);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 1) + '\n');
  console.log('=== sim-w4shape-a census ===');
  console.log(`corpusOk=${res.corpusOk} joins=${res.joinTotal} joinErrors=${res.joinErrors} branchMismatches=${res.branchMismatches} waveDisagree=${res.waveDisagree}`);
  console.log(`UNIVERSE wave-4 meetings=${res.universeN} fought=${res.foughtN} wildJudged=${res.wildJudgedN} scholarLed=${res.scholarLedN}`);
  console.log(`KILLS fought=${res.killsFought} pre-contact=${res.killsPre} OTHER=${res.otherCount}`);
  console.log('BY-SHAPE:');
  for (const [shape, t] of Object.entries(res.byShape)) console.log(`  ${shape}: n=${t.n} fought=${t.fought} kills=${t.kills} preKills=${t.preKills} byOutcome=${JSON.stringify(t.byOutcome)} byParty=${JSON.stringify(t.byParty)}`);
  console.log(`BY-OUTCOME: ${JSON.stringify(res.byOutcome)}`);
  console.log(`BY-PARTY: ${JSON.stringify(res.byParty)}`);
  console.log(`FLEE-SUB: ${JSON.stringify(res.fleeSub)}`);
  console.log('PER-SEED:');
  for (const seed of SEEDS) {
    const p = res.perSeed[seed];
    console.log(`  s${seed} n=${p.n} kills=${p.kills} byOutcome=${JSON.stringify(p.byOutcome)} first=${p.first ? `d${p.first.day} ${p.first.shape}/${p.first.caller} ${p.first.mid} ${p.first.outcomeCls} r${p.first.rounds} ${p.first.party}` : 'none'}`);
  }
  const w = res.wall;
  console.log(`WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.nationalEver} natFinal=${w.nationalFinal} table=${w.table} entered=${w.entered} wave4reach=${w.wave4reach} wave5reach=${w.wave5reach} median=${w.medianDays} days=${JSON.stringify(w.daysSorted)} deaths=${w.deaths}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(w.deathsByCause)}`);
  console.log(`COMPLETENESS=${res.completeness ? 'PASS' : 'FAIL'} FIXTURES=${fx ? 'PASS' : 'FAIL'}`);
  const go = res.completeness && fx;
  console.log(go ? 'MACHINE-LEGS-PASS (sense judged separately)' : 'MACHINE-LEGS-FAIL');
  if (!go) process.exit(1);
}
if (require.main === module) main();
module.exports = { classifyOutcome, shapeOf, isWildJudged, tilePresent, tileCount, gearOf, fixtures, analyze };
