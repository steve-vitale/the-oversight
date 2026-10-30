#!/usr/bin/env node
// scripts/test-expaware-a.js — sim-expaware-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-30/perseed-expaware-a/s<seed>-fresh.json
//   (fieldparty + w4dpr + breakline + tilejoin + shoutrec recorders
//   index-joined and verified, seeds 75101-75132; joinendlines store
//   is calledHelp-only, checked for errs/overflow but NOT index-joined;
//   evadelog store is evade-only, checked for errs/overflow and
//   cross-checked by (day, vid, mid) multiset against the joined
//   evade rows, NOT index-joined).
// Universe: EVERY joined row, all waves, all channels, all callers.
// Outcome (evadeshape order verbatim): rounds<1 & 'evade' ->
// PRE-CONTACT-EVADE; rounds<1 & mFlee -> PRE-CONTACT-SCATTER;
// rounds<1 & vKill -> PRE-CONTACT-KILL; rounds>=1 & vKill -> KILL;
// rounds>=1 & mFlee -> DRIVE-OFF; rounds>=1 & vFlee -> FLEE;
// rounds>=1 & vDie -> DEATH; else OTHER. Decided from recorded
// (rounds, outcome) only — never from log text, intent, or any
// roster feed.
// WARNED-NARROW (w4meet verbatim): W1 = earlier meeting in the same
// seed with the same mid (corpus order); W2 = trickKnown === true.
// WARNED-EXPANDED: narrow OR W3 (earlier same-mid meeting whose
// mHpLeft equals this meeting's mHpStart, both non-null) OR SCOUT /
// RUMOR / SHOUT — all three UNMEASURED (no per-meeting record in
// any recorder or engine state; they contribute 0 confirmed and are
// counted separately, never proxied by a global "any earlier shout"
// feed, which the perception law refuses).
// AWARENESS-ELIGIBLE: channel 'other' AND expeditionMonster in the
// recorded stack (the only awareness:true call site). Caller 'other'
// + channel 'field' rows (contest/psycho/nomad/alien sites) are
// awareness-INELIGIBLE and never pooled with expedition rows.
// Usage:
//   node scripts/test-expaware-a.js --fixtures
//   node scripts/test-expaware-a.js [--out <path>] (judge corpus)
//   node scripts/test-expaware-a.js --sense (wave-4 first-meeting transcripts)
//   node scripts/test-expaware-a.js --detgate <scratchDir> <seed>
//   node scripts/test-expaware-a.js --taxaudit <evidDir> (1-seed pilot pairs)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [];
for (let s = 75101; s <= 75132; s++) SEEDS.push(s);
const EVID_DEFAULT = path.join(REPO, 'evidence', '2026-10-30', 'perseed-expaware-a');
const UNMEASURED_SIGNALS = ['scout', 'rumor', 'shout'];

function shapeOf(fp) {
  const c = fp && fp.channel;
  if (c === 'field') return 'wild';
  if (c === 'raid') return 'raid';
  if (c === 'other') return 'other';
  return 'OTHER';
}
function classifyOutcome(o) {
  const rounds = (o.rounds | 0);
  const out = o.outcome;
  if (rounds < 1 && out === 'evade') return 'PRE-CONTACT-EVADE';
  if (rounds < 1 && out === 'mFlee') return 'PRE-CONTACT-SCATTER';
  if (rounds < 1 && out === 'vKill') return 'PRE-CONTACT-KILL';
  if (rounds >= 1 && out === 'vKill') return 'KILL';
  if (rounds >= 1 && out === 'mFlee') return 'DRIVE-OFF';
  if (rounds >= 1 && out === 'vFlee') return 'FLEE';
  if (rounds >= 1 && out === 'vDie') return 'DEATH';
  return 'OTHER';
}
function awarenessEligible(j) {
  return j.channel === 'other' && /expeditionMonster/.test(j.stack || '');
}
// Sub-caller for caller 'other' + channel 'field' rows, from stack[3].
function subCaller(j) {
  if (j.caller !== 'other') return j.caller;
  if (j.channel === 'other') return 'expedition';
  const parts = (j.stack || '').split(',');
  const fn = parts[3] || '';
  if (fn === '_cxBlood') return 'contest-blood';
  if (fn === '_cxOther') return 'contest-other';
  if (fn === 'psychoViolenceTick') return 'psycho';
  return 'other-unknown';
}
function joinPairOk(a, b) {
  return !!a && !!b && a.mid === b.mid && a.vid === b.vid && a.day === b.day;
}
function storeOk(s) {
  return !!s && Array.isArray(s.meetings) && s.diag && s.diag.errs === 0
    && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
}
function dmgStats(rows) {
  const ds = rows.map(r => (r.mDealt | 0)).sort((a, b) => a - b);
  if (!ds.length) return { n: 0, mean: 0, median: 0, total: 0, gt0: 0, gt0Share: 0 };
  const total = ds.reduce((t, x) => t + x, 0);
  const gt0 = ds.filter(x => x > 0).length;
  return { n: ds.length, mean: total / ds.length, median: ds[Math.floor(ds.length / 2)], total, gt0, gt0Share: gt0 / ds.length };
}
// Annotate warned signals. rows: seed's joined rows in corpus order.
// seen: mid -> [{vid, mHpLeft}]. Returns per-row signal object.
function warnedSignals(rows) {
  const seen = {};
  return rows.map(r => {
    const prior = seen[r.mid] || [];
    const w1 = prior.length > 0;
    const w1personal = prior.some(p => p.vid === r.vid);
    const w1villageOnly = w1 && !w1personal;
    const w2 = r.trickKnown === true;
    const w3 = (r.mHpStart != null) && prior.some(p => p.mHpLeft != null && p.mHpLeft === r.mHpStart);
    const narrow = w1 || w2;
    const expanded = narrow || w3; // scout/rumor/shout UNMEASURED: +0
    (seen[r.mid] = seen[r.mid] || []).push({ vid: r.vid, mHpLeft: r.mHpLeft });
    return { w1, w1personal, w1villageOnly, w2, w3, narrow, expanded,
      w3only: (!narrow && w3), unmeasured: UNMEASURED_SIGNALS.slice() };
  });
}

function loadCorpus(evidDir) {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-fresh.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return rows;
}
function buildJoined(rows) {
  const joined = [];
  const problems = { joinErrors: 0, lengthMismatch: 0 };
  const storeChecks = [];
  for (const r of rows) {
    const ok = r.days > 0 && storeOk(r.fieldparty) && storeOk(r.w4dpr)
      && storeOk(r.breakline) && (r.tilejoin === null || storeOk(r.tilejoin))
      && storeOk(r.shoutrec) && storeOk(r.joinendlines) && storeOk(r.evadelog);
    storeChecks.push({ seed: r.seed, ok });
    const fp = r.fieldparty.meetings;
    const dp = r.w4dpr.meetings, bl = r.breakline.meetings;
    const tj = r.tilejoin ? r.tilejoin.meetings : null;
    const sr = r.shoutrec.meetings;
    if (dp.length !== fp.length || bl.length !== fp.length || sr.length !== fp.length
      || (tj && tj.length !== fp.length)) problems.lengthMismatch++;
    const seedRows = [];
    for (let i = 0; i < fp.length; i++) {
      const m = fp[i];
      const checks = [dp[i], bl[i], sr[i]];
      if (tj) checks.push(tj[i]);
      for (const c of checks) if (!joinPairOk(m, c)) problems.joinErrors++;
      const j = { seed: r.seed, idx: i, day: m.day, part: m.part, vid: m.vid,
        mid: m.mid, wave: m.wave, caller: m.caller, stack: m.stack,
        channel: m.channel, shape: shapeOf(m), mHpStart: m.mHpStart,
        mHpLeft: m.mHpLeft, outcome: m.outcome, rounds: m.rounds,
        mDealt: m.mDealt, vTaken: m.vTaken, trickKnown: m.trickKnown,
        branch: (bl[i] && bl[i].branch) || null,
        log: (dp[i] && Array.isArray(dp[i].log)) ? dp[i].log : [],
        leaderFirst: (dp[i] && dp[i].leaderFirst) || null,
        intent: m.intent, calledHelp: !!m.calledHelp,
        joinedAllyVid: m.joinedAllyVid || null,
        allyFromStart: !!m.allyFromStart };
      j.cls = classifyOutcome(j);
      j.preContact = (j.rounds | 0) < 1;
      j.awareness = awarenessEligible(j);
      j.subCaller = subCaller(j);
      seedRows.push(j);
    }
    const sigs = warnedSignals(seedRows);
    seedRows.forEach((j, i) => { j.sig = sigs[i]; });
    joined.push(...seedRows);
  }
  return { joined, problems, storeChecks };
}
function evadelogCrosscheck(rows, joined) {
  // Multiset (seed, day, vid, mid) of evadelog rows vs joined evades.
  const key = (s, d, v, m) => [s, d, v, m].join('|');
  const a = {}, b = {};
  for (const r of rows) for (const e of (r.evadelog.meetings || [])) {
    const k = key(r.seed, e.day, e.vid, e.mid); a[k] = (a[k] || 0) + 1;
  }
  for (const j of joined) if (j.cls === 'PRE-CONTACT-EVADE') {
    const k = key(j.seed, j.day, j.vid, j.mid); b[k] = (b[k] || 0) + 1;
  }
  let diff = 0;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) diff += Math.abs((a[k] || 0) - (b[k] || 0));
  const totalA = Object.values(a).reduce((t, x) => t + x, 0);
  const totalB = Object.values(b).reduce((t, x) => t + x, 0);
  return { evadelog: totalA, joinedEvades: totalB, multisetDiff: diff };
}
function countBy(rows, fn) {
  const m = {};
  for (const r of rows) { const k = fn(r); m[k] = (m[k] || 0) + 1; }
  return m;
}
function analyze(evidDir) {
  const rows = loadCorpus(evidDir);
  const { joined, problems, storeChecks } = buildJoined(rows);
  const xl = evadelogCrosscheck(rows, joined);
  const otherCls = joined.filter(j => j.cls === 'OTHER').length;
  const completeness = rows.length === SEEDS.length
    && rows.every(r => r.days > 0)
    && storeChecks.every(s => s.ok)
    && problems.joinErrors === 0 && problems.lengthMismatch === 0
    && xl.multisetDiff === 0 && otherCls === 0;
  const w4 = joined.filter(j => j.wave === 4);
  const w4unclassified = w4.filter(j => !j.sig || (j.sig.narrow !== true && j.sig.narrow !== false)
    || (j.sig.expanded !== true && j.sig.expanded !== false)).length;
  const classification = w4unclassified === 0
    && w4.every(j => j.sig.unmeasured.length === 3);
  // Caller census
  const callerChannel = countBy(joined, j => j.caller + '/' + j.channel);
  const callerAware = {};
  for (const j of joined) {
    const k = j.caller + '/' + j.channel;
    callerAware[k] = callerAware[k] || { n: 0, aware: 0, evade: 0, scatter: 0, preKill: 0, fought: 0 };
    callerAware[k].n++;
    if (j.awareness) callerAware[k].aware++;
    if (j.cls === 'PRE-CONTACT-EVADE') callerAware[k].evade++;
    if (j.cls === 'PRE-CONTACT-SCATTER') callerAware[k].scatter++;
    if (j.cls === 'PRE-CONTACT-KILL') callerAware[k].preKill++;
    if (!j.preContact) callerAware[k].fought++;
  }
  const subCallerCounts = countBy(joined, j => j.subCaller + '/' + j.channel);
  const preByCallerWave = {};
  for (const j of joined) {
    const k = j.subCaller + '/w' + j.wave;
    preByCallerWave[k] = preByCallerWave[k] || { n: 0, evade: 0, scatter: 0, preKill: 0, fought: 0 };
    preByCallerWave[k].n++;
    if (j.cls === 'PRE-CONTACT-EVADE') preByCallerWave[k].evade++;
    if (j.cls === 'PRE-CONTACT-SCATTER') preByCallerWave[k].scatter++;
    if (j.cls === 'PRE-CONTACT-KILL') preByCallerWave[k].preKill++;
    if (!j.preContact) preByCallerWave[k].fought++;
  }
  // Wave-4 warned tables, both definitions
  function w4table(def) {
    const key = def === 'narrow' ? 'narrow' : 'expanded';
    const warned = w4.filter(j => j.sig[key]);
    const unwarned = w4.filter(j => !j.sig[key]);
    const byCls = (rs) => countBy(rs, j => j.cls);
    const byChannel = (rs) => countBy(rs, j => j.channel);
    return {
      warned: { n: warned.length, cls: byCls(warned), channel: byChannel(warned),
        fought: warned.filter(j => !j.preContact).length,
        preContact: warned.filter(j => j.preContact).length, dmg: dmgStats(warned) },
      unwarned: { n: unwarned.length, cls: byCls(unwarned), channel: byChannel(unwarned),
        fought: unwarned.filter(j => !j.preContact).length,
        preContact: unwarned.filter(j => j.preContact).length, dmg: dmgStats(unwarned) },
    };
  }
  const w4narrow = w4table('narrow');
  const w4expanded = w4table('expanded');
  const w4signals = {
    w1: w4.filter(j => j.sig.w1).length,
    w1personal: w4.filter(j => j.sig.w1personal).length,
    w1villageOnly: w4.filter(j => j.sig.w1villageOnly).length,
    w2: w4.filter(j => j.sig.w2).length,
    w3: w4.filter(j => j.sig.w3).length,
    w3only: w4.filter(j => j.sig.w3only).length,
    narrow: w4.filter(j => j.sig.narrow).length,
    expanded: w4.filter(j => j.sig.expanded).length,
    unmeasuredPerMeeting: 3,
  };
  // Wave-4 first meetings per (seed, mid)
  const firstSeen = new Set();
  const firstMeetings = [];
  for (const j of w4) {
    const k = j.seed + '|' + j.mid;
    if (!firstSeen.has(k)) { firstSeen.add(k); firstMeetings.push(j); }
  }
  // Wall numbers (report-only)
  const days = rows.map(r => r.days).sort((a, b) => a - b);
  const wall = {
    won: rows.reduce((t, r) => t + (r.won ? 1 : 0), 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver ? 1 : 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal ? 1 : 0), 0),
    table: rows.reduce((t, r) => t + (r.table ? 1 : 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered ? 1 : 0), 0),
    waveReach: { 1: rows.filter(r => (r.waveReach || 1) >= 1).length,
      2: rows.filter(r => (r.waveReach || 1) >= 2).length,
      3: rows.filter(r => (r.waveReach || 1) >= 3).length,
      4: rows.filter(r => (r.waveReach || 1) >= 4).length,
      5: rows.filter(r => (r.waveReach || 1) >= 5).length },
    medianDays: days[Math.floor(days.length / 2)],
    daysSorted: days,
    deathTotal: rows.reduce((t, r) => t + (r.deathTotal || 0), 0),
  };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const perSeed = rows.map(r => ({ seed: r.seed, days: r.days, end: r.endReason,
    won: r.won, waveReach: r.waveReach, nationalEver: r.nationalEver,
    w4meetings: joined.filter(j => j.seed === r.seed && j.wave === 4).length,
    w4first: firstMeetings.filter(j => j.seed === r.seed).length }));
  return { completeness, classification, problems, storeChecks, evadelogCrosscheck: xl,
    otherCls, total: joined.length, w4n: w4.length,
    callerChannel, callerAware, subCallerCounts, preByCallerWave,
    w4signals, w4narrow, w4expanded,
    w4byChannel: countBy(w4, j => j.channel),
    w4byCaller: countBy(w4, j => j.caller),
    w4bySubCaller: countBy(w4, j => j.subCaller),
    w4cls: countBy(w4, j => j.cls),
    firstMeetings: firstMeetings.map(j => ({ seed: j.seed, day: j.day, mid: j.mid,
      vid: j.vid, leaderFirst: j.leaderFirst, channel: j.channel, caller: j.caller,
      subCaller: j.subCaller, cls: j.cls, outcome: j.outcome, rounds: j.rounds,
      mDealt: j.mDealt, vTaken: j.vTaken, narrow: j.sig.narrow, expanded: j.sig.expanded,
      w1: j.sig.w1, w1personal: j.sig.w1personal, w2: j.sig.w2, w3: j.sig.w3,
      log: j.log })),
    wall, deathsByCause, perSeed };
}

function fixtures() {
  let pass = 0, fail = 0;
  const eq = (name, a, b) => {
    const ok = JSON.stringify(a) === JSON.stringify(b);
    if (ok) pass++; else { fail++; console.log('FAIL ' + name + ': got ' + JSON.stringify(a) + ' want ' + JSON.stringify(b)); }
  };
  // Taxonomy
  eq('evade', classifyOutcome({ rounds: 0, outcome: 'evade' }), 'PRE-CONTACT-EVADE');
  eq('scatter', classifyOutcome({ rounds: 0, outcome: 'mFlee' }), 'PRE-CONTACT-SCATTER');
  eq('preKill', classifyOutcome({ rounds: 0, outcome: 'vKill' }), 'PRE-CONTACT-KILL');
  eq('kill', classifyOutcome({ rounds: 3, outcome: 'vKill' }), 'KILL');
  eq('driveoff', classifyOutcome({ rounds: 2, outcome: 'mFlee' }), 'DRIVE-OFF');
  eq('flee', classifyOutcome({ rounds: 2, outcome: 'vFlee' }), 'FLEE');
  eq('death', classifyOutcome({ rounds: 2, outcome: 'vDie' }), 'DEATH');
  eq('pre-vDie OTHER', classifyOutcome({ rounds: 0, outcome: 'vDie' }), 'OTHER');
  eq('pre-vFlee OTHER', classifyOutcome({ rounds: 0, outcome: 'vFlee' }), 'OTHER');
  eq('unknown OTHER', classifyOutcome({ rounds: 1, outcome: 'bogus' }), 'OTHER');
  // Shape
  eq('shape wild', shapeOf({ channel: 'field' }), 'wild');
  eq('shape raid', shapeOf({ channel: 'raid' }), 'raid');
  eq('shape other', shapeOf({ channel: 'other' }), 'other');
  eq('shape OTHER', shapeOf({ channel: 'weird' }), 'OTHER');
  // Awareness eligibility
  eq('aware expedition', awarenessEligible({ channel: 'other', stack: 'x,fieldFight,expeditionMonster' }), true);
  eq('ineligible contest', awarenessEligible({ channel: 'field', stack: 'x,fieldFight,_cxBlood' }), false);
  eq('ineligible other-field', awarenessEligible({ channel: 'field', stack: 'x,fieldFight,psychoViolenceTick' }), false);
  eq('ineligible other-chan-noexp', awarenessEligible({ channel: 'other', stack: 'x,fieldFight,somethingElse' }), false);
  // Sub-caller
  eq('sub expedition', subCaller({ caller: 'other', channel: 'other', stack: 'a,b,expeditionMonster' }), 'expedition');
  eq('sub contest-blood', subCaller({ caller: 'other', channel: 'field', stack: 'classifyCaller,Object,fieldFight,_cxBlood,eval' }), 'contest-blood');
  eq('sub contest-other', subCaller({ caller: 'other', channel: 'field', stack: 'classifyCaller,Object,fieldFight,_cxOther,eval' }), 'contest-other');
  eq('sub psycho', subCaller({ caller: 'other', channel: 'field', stack: 'classifyCaller,Object,fieldFight,psychoViolenceTick,corruptionTick' }), 'psycho');
  eq('sub resolve passthrough', subCaller({ caller: 'resolve', channel: 'field', stack: 'x' }), 'resolve');
  // Join rule
  eq('join ok', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'v', day: 5 }), true);
  eq('join mid mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'b', vid: 'v', day: 5 }), false);
  eq('join vid mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'w', day: 5 }), false);
  eq('join day mismatch', joinPairOk({ mid: 'a', vid: 'v', day: 5 }, { mid: 'a', vid: 'v', day: 6 }), false);
  // Warned signals: W1/W2/W3, personal/village split, ordering, W3 N/A
  const mk = (mid, vid, mHpStart, mHpLeft, trickKnown) => ({ mid, vid, mHpStart, mHpLeft, trickKnown });
  const seq = [
    mk('eater', 'v1', 100, 80, false),   // first contact: unwarned both
    mk('eater', 'v2', 80, 60, false),    // W1 village-only + W3 (80==80) -> expanded only
    mk('eater', 'v2', 50, 40, false),    // W1 personal, no W3 (50 != 80,60)
    mk('strike', 'v1', 90, 90, true),    // W2 -> narrow
    mk('strike', 'v1', null, 70, false), // W1 personal; W3 N/A (null start)
    mk('fresh', 'v9', 70, 70, false),    // first contact, unwarned
  ];
  const sigs = warnedSignals(seq);
  eq('sig0 unwarned', [sigs[0].narrow, sigs[0].expanded], [false, false]);
  eq('sig1 w3only', [sigs[1].w1, sigs[1].w1personal, sigs[1].w1villageOnly, sigs[1].w3, sigs[1].narrow, sigs[1].expanded, sigs[1].w3only], [true, false, true, true, true, true, false]);
  // NOTE sig1: W1 true already makes it narrow; the W3-only case needs W1 absent — covered below.
  eq('sig2 personal', [sigs[2].w1personal, sigs[2].w1villageOnly, sigs[2].w3], [true, false, false]);
  eq('sig3 w2', [sigs[3].w2, sigs[3].narrow], [true, true]);
  eq('sig4 w3NA', [sigs[4].w1personal, sigs[4].w3], [true, false]);
  eq('sig5 fresh', [sigs[5].narrow, sigs[5].expanded], [false, false]);
  eq('unmeasured always 3', sigs.map(s => s.unmeasured.length), [3, 3, 3, 3, 3, 3]);
  eq('unmeasured contributes 0', sigs[5].expanded, false);
  // True W3-only: prior meeting with DIFFERENT mid cannot give W1; W3 needs same mid, so
  // W3-only arises only when W1 is... W1 is same-mid-any-prior, so any W3 implies W1.
  // This is a structural fact the evidence must state: expanded-minus-narrow is EMPTY
  // unless W1 is defined differently. Verify: W3 => W1 on the same rows.
  const seq2 = [mk('eater', 'v1', 100, 80, false), mk('eater', 'v2', 80, 10, false)];
  const s2 = warnedSignals(seq2);
  eq('w3 implies w1', [s2[1].w3, s2[1].w1], [true, true]);
  // Damage aggregation
  eq('dmg empty', dmgStats([]), { n: 0, mean: 0, median: 0, total: 0, gt0: 0, gt0Share: 0 });
  eq('dmg basic', dmgStats([{ mDealt: 0 }, { mDealt: 10 }, { mDealt: 20 }]), { n: 3, mean: 10, median: 10, total: 30, gt0: 2, gt0Share: 2 / 3 });
  console.log(`FIXTURES: pass=${pass} fail=${fail}`);
  if (fail) process.exit(1);
  console.log('FIXTURES-PASS');
}

function sense(evidDir) {
  const a = analyze(evidDir);
  const fms = a.firstMeetings;
  console.log(`WAVE-4 FIRST MEETINGS: ${fms.length} (seed|mid pairs)`);
  for (const f of fms) {
    console.log(`--- s${f.seed} d${f.day} ${f.mid} vid=${f.vid} (${f.leaderFirst || '?'}) chan=${f.channel} caller=${f.caller}/${f.subCaller} cls=${f.cls} narrow=${f.narrow} expanded=${f.expanded} W1=${f.w1} W1p=${f.w1personal} W2=${f.w2} W3=${f.w3} dmg=${f.mDealt} taken=${f.vTaken}`);
    for (const line of (f.log || [])) console.log('    | ' + line);
  }
  return fms;
}
function taxaudit(evidDir) {
  const p = path.join(evidDir, 's75101-fresh.json');
  const r = JSON.parse(fs.readFileSync(p, 'utf8'));
  const pairs = {};
  for (const m of r.fieldparty.meetings) {
    const k = (m.rounds < 1 ? 'rounds<1' : 'rounds>=1') + ' x ' + m.outcome;
    pairs[k] = (pairs[k] || 0) + 1;
  }
  const covered = { 'rounds<1 x evade': 1, 'rounds<1 x mFlee': 1, 'rounds<1 x vKill': 1,
    'rounds>=1 x vKill': 1, 'rounds>=1 x mFlee': 1, 'rounds>=1 x vFlee': 1, 'rounds>=1 x vDie': 1 };
  let uncovered = 0;
  for (const k of Object.keys(pairs)) if (!covered[k]) { uncovered++; console.log('UNCOVERED PAIR: ' + k + ' n=' + pairs[k]); }
  console.log('TAXAUDIT pairs: ' + JSON.stringify(pairs) + ' uncovered=' + uncovered);
  if (uncovered) process.exit(1);
  console.log('TAXAUDIT-PASS');
}
function detgate(scratchDir, seed) {
  const a = fs.readFileSync(path.join(scratchDir, `s${seed}-fresh.json`));
  const b = fs.readFileSync(path.join(EVID_DEFAULT, `s${seed}-fresh.json`));
  const same = a.equals(b);
  console.log(`DETGATE seed=${seed} bytes scratch=${a.length} corpus=${b.length} identical=${same}`);
  if (!same) { console.log('DETGATE-FAIL'); process.exit(1); }
  console.log('DETGATE-PASS');
}
function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--fixtures') { fixtures(); return; }
  if (args[0] === '--sense') { sense(EVID_DEFAULT); return; }
  if (args[0] === '--taxaudit') { taxaudit(args[1] || EVID_DEFAULT); return; }
  if (args[0] === '--detgate') { detgate(args[1], args[2]); return; }
  let out = null;
  const oi = args.indexOf('--out');
  if (oi >= 0) out = args[oi + 1];
  const a = analyze(EVID_DEFAULT);
  const legs = {
    COMPLETENESS: a.completeness ? 'PASS' : 'FAIL',
    CLASSIFICATION: a.classification ? 'PASS' : 'FAIL',
    WAVE4N: a.w4n >= 20 ? 'PASS(' + a.w4n + ')' : 'INSUFFICIENT-DATA(' + a.w4n + ')',
    OTHER: a.otherCls,
    TOTAL: a.total,
  };
  console.log('MACHINE-LEGS: ' + JSON.stringify(legs));
  console.log('CALLER-CHANNEL: ' + JSON.stringify(a.callerChannel));
  console.log('CALLER-AWARE: ' + JSON.stringify(a.callerAware, null, 1));
  console.log('SUBCALLER: ' + JSON.stringify(a.subCallerCounts));
  console.log('W4-SIGNALS: ' + JSON.stringify(a.w4signals));
  console.log('W4-NARROW: ' + JSON.stringify(a.w4narrow, null, 1));
  console.log('W4-EXPANDED: ' + JSON.stringify(a.w4expanded, null, 1));
  console.log('W4-CLS: ' + JSON.stringify(a.w4cls) + ' BY-CHANNEL: ' + JSON.stringify(a.w4byChannel) + ' BY-CALLER: ' + JSON.stringify(a.w4byCaller));
  console.log('FIRST-MEETINGS: ' + a.firstMeetings.length);
  console.log('WALL: ' + JSON.stringify(a.wall));
  if (!a.completeness || !a.classification) { console.log('MACHINE-LEGS-FAIL'); process.exit(1); }
  console.log('MACHINE-LEGS-PASS');
  if (out) fs.writeFileSync(out, JSON.stringify(a, null, 1) + '\n');
}
if (require.main === module) main();
module.exports = { classifyOutcome, shapeOf, awarenessEligible, subCaller, warnedSignals, dmgStats, joinPairOk };
