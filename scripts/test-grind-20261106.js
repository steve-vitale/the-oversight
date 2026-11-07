// test-grind-20261106.js — proof for the grind characterization
// (arm sim-grind-a, run fleshout-loop-a-20261106T2256Z).
// Fixture tests for the analyzer's pure functions + the 87008 d131 grind
// shape reproduced from the COMMITTED partydamage corpus (no re-run) +
// live harness legs (driver subprocesses into /tmp, never into evidence/):
// a real seed carries field rows with instance ids and TB traces, and the
// instrument is neutral (off-mode == on-mode on days/endReason/kill-log
// length). Exit non-zero on any failure.
// Usage: node scripts/test-grind-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'grind-analyze-20261106'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function trace(opts) {
  const o = opts || {};
  return Object.assign({
    seq: 1, tbSeq: 1, day: 80, mid: 'reunion', mids: ['reunion'], wave: 4,
    entryHp: 1000, entryMaxHp: 1200, entryFrac: 0.833, fighters: ['scholar'],
    alliesAtEntry: 0, partyAtEntry: 0, hits: [], turns: [], verbs: [],
    outcome: 'lost', ending: 'scholar-death', mHpLeft: 800, mHpLeftFrac: 0.667,
    rounds: 6, scholarHpEnd: 0, scholarHpFracEnd: 0,
    rallyRound: null, rallyOk: null, scholarStruckRallyRound: null,
  }, o);
}
function fieldRow(opts) {
  const o = opts || {};
  return Object.assign({
    seq: 1, day: 80, vid: 'villager_a', isScholar: false, scholarAtFight: 'scholar_x',
    mid: 'reunion', wave: 4, instId: 'w1', instIds: ['w1'],
    entryHp: 500, entryMaxHp: 1200, entryFrac: 0.417, regenSuspect: false,
    rounds: 3, outcome: 'vFlee', vTaken: 40, mDealt: 18, vHpLeft: 60, mHpLeft: 482,
    mHpLeftFrac: 0.402, volley: null, contactFinishAttempted: false,
    contactFinishKill: false, contactFinishBeastHp: null, contactFinishDmg: null,
    committedFinish: false, corneredHold: false, optsKeys: [], log: [],
  }, o);
}

// ---------- 1. tbChainGroup: exact-continuation linking ----------
(function () {
  const traces = [
    trace({ seq: 1, day: 100, entryHp: 900, entryMaxHp: 1200, mHpLeft: 820 }),
    trace({ seq: 2, day: 101, entryHp: 484, entryMaxHp: 1200, mHpLeft: 404 }),
    trace({ seq: 3, day: 101, entryHp: 404, entryMaxHp: 1200, mHpLeft: 273 }),
    trace({ seq: 4, day: 101, entryHp: 273, entryMaxHp: 1200, mHpLeft: 127 }),
    trace({ seq: 5, day: 101, entryHp: 127, entryMaxHp: 1200, mHpLeft: 41 }),
    trace({ seq: 6, day: 101, entryHp: 1825, entryMaxHp: 2405, mHpLeft: 1689 }),
  ];
  const segs = AN.tbChainGroup(traces, 4);
  const chain4 = segs.find(function (s) { return s.fights === 4; });
  check('tbchain-finds-4-chain', !!chain4, JSON.stringify(segs.map(function (s) { return s.fights; })));
  check('tbchain-entries', !!chain4 && JSON.stringify(chain4.entries) === JSON.stringify([484, 404, 273, 127]), chain4 && JSON.stringify(chain4.entries));
  check('tbchain-exits', !!chain4 && JSON.stringify(chain4.exits) === JSON.stringify([404, 273, 127, 41]), chain4 && JSON.stringify(chain4.exits));
  check('tbchain-final-41', !!chain4 && chain4.finalHp === 41, chain4 && String(chain4.finalHp));
  check('tbchain-deaths', !!chain4 && chain4.scholarDeaths === 4, chain4 && String(chain4.scholarDeaths));
  check('tbchain-no-kill', !!chain4 && chain4.kills === 0, chain4 && String(chain4.kills));
  check('tbchain-sameday-refights', !!chain4 && chain4.sameDayRefights === 3, chain4 && String(chain4.sameDayRefights));
  const big = segs.find(function (s) { return s.maxHp === 2405; });
  check('tbchain-other-beast-separate', !!big && big.fights === 1 && big.entries[0] === 1825, big && JSON.stringify(big.entries));
  const solo = segs.find(function (s) { return s.maxHp === 1200 && s.fights === 1; });
  check('tbchain-broken-link-splits', !!solo && solo.entries[0] === 900 && solo.exits[0] === 820, solo && JSON.stringify(solo.entries));
  check('tbchain-segments-total', segs.length === 3, String(segs.length));
})();

// ---------- 2. fieldChainGroup: instance identity ----------
(function () {
  const rows = [
    fieldRow({ seq: 1, day: 50, instId: 'w1', entryHp: 300, mHpLeft: 282, outcome: 'mFlee', mDealt: 18 }),
    fieldRow({ seq: 2, day: 50, instId: 'w1', entryHp: 282, mHpLeft: 260, outcome: 'vFlee', mDealt: 22 }),
    fieldRow({ seq: 3, day: 51, instId: 'w1', entryHp: 260, mHpLeft: 0, outcome: 'vKill', mDealt: 260, contactFinishAttempted: true, contactFinishKill: true }),
    fieldRow({ seq: 4, day: 50, instId: 'w2', mid: 'audit', entryHp: 1100, mHpLeft: 1050, outcome: 'vFlee' }),
  ];
  const g = AN.fieldChainGroup(rows);
  check('fieldchain-one-instance-chain', g.instanceChains.length === 1, String(g.instanceChains.length));
  const c = g.instanceChains[0];
  check('fieldchain-entries', !!c && JSON.stringify(c.entries) === JSON.stringify([300, 282, 260]), c && JSON.stringify(c.entries));
  check('fieldchain-kill-counted', !!c && c.kills === 1 && c.contactFinishKills === 1, c && JSON.stringify(c));
  check('fieldchain-sameday-refight', !!c && c.sameDayRefights === 1, c && String(c.sameDayRefights));
  check('fieldchain-sameday-groups', g.sameDayGroups.length === 1 && g.sameDayGroups[0].fights === 2, JSON.stringify(g.sameDayGroups));
  // Regen suspect: entry above the instance's previous exit.
  const regen = [
    fieldRow({ seq: 1, day: 50, instId: 'w9', entryHp: 300, mHpLeft: 200, regenSuspect: false }),
    fieldRow({ seq: 2, day: 52, instId: 'w9', entryHp: 250, mHpLeft: 240, regenSuspect: true }),
  ];
  const g2 = AN.fieldChainGroup(regen);
  check('fieldchain-regen-flagged', g2.instanceChains.length === 1 && g2.instanceChains[0].regenSuspect === 1, JSON.stringify(g2.instanceChains));
})();

// ---------- 3. fieldDist: outcomes, tail bucket, finisher flags ----------
(function () {
  const rows = [
    fieldRow({ seq: 1, entryHp: 100, entryMaxHp: 1200, entryFrac: 0.083, rounds: 0, outcome: 'mFlee', mHpLeft: 94, contactFinishAttempted: true, contactFinishKill: false, contactFinishBeastHp: 100, contactFinishDmg: 6 }),
    fieldRow({ seq: 2, entryHp: 1200, entryMaxHp: 1200, entryFrac: 1, rounds: 3, outcome: 'vDie', mHpLeft: 1150, mDealt: 50 }),
    fieldRow({ seq: 3, entryHp: 60, entryMaxHp: 1200, entryFrac: 0.05, rounds: 0, outcome: 'vKill', mHpLeft: 0, contactFinishAttempted: true, contactFinishKill: true, contactFinishBeastHp: 60, contactFinishDmg: 60 }),
    fieldRow({ seq: 4, entryHp: 800, entryMaxHp: 1200, entryFrac: 0.667, rounds: 5, outcome: 'vFlee', mHpLeft: 770, committedFinish: true, mDealt: 30 }),
  ];
  const d = AN.fieldDist(rows, 4);
  check('fielddist-n', d.n === 4, String(d.n));
  check('fielddist-outcomes', d.outcomes.vKill === 1 && d.outcomes.vDie === 1 && d.outcomes.mFlee === 1 && d.outcomes.vFlee === 1, JSON.stringify(d.outcomes));
  check('fielddist-tail-bucket', d.entryFracBuckets.tail_lt015 === 2, JSON.stringify(d.entryFracBuckets));
  check('fielddist-contact-attempts', d.contactFinishAttempted === 2, String(d.contactFinishAttempted));
  check('fielddist-contact-kills', d.contactFinishKills === 1, String(d.contactFinishKills));
  check('fielddist-committed', d.committedFinish === 1, String(d.committedFinish));
  check('fielddist-dmg-median', d.dmgPerFight.median === 40, JSON.stringify(d.dmgPerFight));
  check('fielddist-rounds-median', d.rounds.median === 1.5, JSON.stringify(d.rounds));
  // A contact-finish kill (rounds 0, no volley) is NOT a volley kill:
  // the old rounds===0 proxy double-counted it.
  check('fielddist-volley-kill-shape', d.volleyKills === 0, String(d.volleyKills));
  const volleyOnly = AN.fieldDist([fieldRow({ seq: 9, entryHp: 90, entryMaxHp: 1200, entryFrac: 0.075, rounds: 0, outcome: 'vKill', mHpLeft: 0, mDealt: 90, volley: { shots: 3, hits: 3, dmg: 90, ammoLeft: 0 } })], 4);
  check('fielddist-volley-kill-counted', volleyOnly.volleyKills === 1, String(volleyOnly.volleyKills));
})();

// ---------- 4. tailStats: damage/round in the tail ----------
(function () {
  function hit(dmg) { return { r: 1, actor: 'p', actorKind: 'player', src: 'p', srcLabel: 'test', tgt: 'm_0', tgtKind: 'monster', req: dmg, dmg: dmg, hpAfter: 100, maxHp: 1200 }; }
  const tails = [
    trace({ seq: 1, day: 90, entryHp: 127, entryMaxHp: 1200, entryFrac: 0.106, rounds: 4, mHpLeft: 41, hits: [hit(40), hit(46)] }),
    trace({ seq: 2, day: 90, entryHp: 100, entryMaxHp: 1200, entryFrac: 0.083, rounds: 2, mHpLeft: 0, ending: 'kill', hits: [hit(60), hit(40)] }),
  ];
  const t = AN.tailStats(tails, 4);
  check('tail-n', t.n === 2, String(t.n));
  check('tail-kills', t.kills === 1, String(t.kills));
  check('tail-dpr-median', Math.abs(t.dmgPerRoundMedian - 35.75) < 1e-9, String(t.dmgPerRoundMedian));
  check('tail-dmg-fight-median', t.dmgPerFightMedian === 93, String(t.dmgPerFightMedian));
  check('tail-rounds-median', t.roundsMedian === 3, String(t.roundsMedian));
})();

// ---------- 5. grindWindows: deaths on grind days vs elsewhere ----------
(function () {
  const seed = {
    traces: [
      trace({ seq: 1, day: 100, entryHp: 484, mHpLeft: 404 }),
      trace({ seq: 2, day: 100, entryHp: 404, mHpLeft: 273 }),
      trace({ seq: 3, day: 105, entryHp: 900, mHpLeft: 820 }),
    ],
    fieldFights: [],
    scholarDeaths: [
      { day: 100, scholarId: 'a' }, { day: 100, scholarId: 'b' },
      { day: 103, scholarId: 'c' },
    ],
  };
  const w = AN.grindWindows(seed);
  check('windows-grind-days', JSON.stringify(w.grindDays) === JSON.stringify([100]), JSON.stringify(w.grindDays));
  check('windows-deaths-split', w.scholarDeathsOnGrindDays === 2 && w.scholarDeathsElsewhere === 1, JSON.stringify(w));
})();

// ---------- 6. 87008 fixture: reproduce the d131 grind from the committed corpus ----------
(function () {
  const file = path.join(REPO, 'evidence', '2026-11-06', 'perseed-partydamage-b', 'partydamage-s87008-partydamage-armed.json');
  if (!fs.existsSync(file)) { check('fixture-87008-exists', false, 'corpus file missing'); return; }
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  const reunion = (d.traces || []).filter(function (t) { return t.mid === 'reunion'; });
  const segs = AN.tbChainGroup(reunion, 4);
  const chain = segs.find(function (s) { return s.maxHp === 1200 && s.fights === 4; });
  check('fixture-87008-chain-found', !!chain, JSON.stringify(segs.map(function (s) { return [s.maxHp, s.fights, s.entries]; })));
  check('fixture-87008-entries', !!chain && JSON.stringify(chain.entries) === JSON.stringify([484, 404, 273, 127]), chain && JSON.stringify(chain.entries));
  check('fixture-87008-final-41', !!chain && chain.finalHp === 41, chain && String(chain.finalHp));
  check('fixture-87008-all-scholar-death', !!chain && chain.scholarDeaths === 4 && chain.kills === 0, chain && JSON.stringify(chain));
  check('fixture-87008-chain-days', !!chain && chain.firstDay === 131 && chain.lastDay === 131, chain && (chain.firstDay + '-' + chain.lastDay));
  const big = segs.find(function (s) { return s.maxHp === 2405; });
  check('fixture-87008-other-beast-separate', !!big && big.fights === 1 && big.entries[0] === 1825 && big.exits[0] === 1689, big && JSON.stringify(big));
  const d131deaths = (d.scholarDeaths || []).filter(function (x) { return x.day === 131; }).length;
  check('fixture-87008-six-deaths-d131', d131deaths === 6, String(d131deaths));
  check('fixture-87008-village-lost-next-day', d.endReason === 'village-lost' && d.days === 132, d.endReason + '/' + d.days);
  const tail = AN.tailStats(reunion, 4);
  check('fixture-87008-tail-has-127-fight', tail.entries.some(function (e) { return e.entryHp === 127 && e.mHpLeft === 41; }), JSON.stringify(tail.entries));
})();

// ---------- 7. live smoke: driver into /tmp, neutrality off vs on ----------
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'grind-proof-'));
  const outdir = path.join(tmp, 'out');
  function runDriver(env) {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'grind-driver-20261106.js')], {
      cwd: REPO, env: Object.assign({}, process.env, env), stdio: 'pipe', timeout: 600000,
    });
  }
  runDriver({ DAYS: '30', SEEDS: '99641', RUN: 'grind-proof-on', OUTDIR: outdir });
  const onFile = path.join(outdir, 'grind-s99641-grind-proof-on.json');
  check('live-on-file-exists', fs.existsSync(onFile), onFile);
  if (!fs.existsSync(onFile)) return;
  const on = JSON.parse(fs.readFileSync(onFile, 'utf8'));
  check('live-on-days', on.days > 0 && on.days <= 30, String(on.days));
  check('live-fieldfights-array', Array.isArray(on.fieldFights), typeof on.fieldFights);
  check('live-fieldfights-present', on.fieldFights.length > 0, String(on.fieldFights.length));
  check('live-field-row-shape', on.fieldFights.every(function (r) { return r.day != null && r.mid && r.outcome; }), 'row missing day/mid/outcome');
  check('live-field-inst-ids', on.fieldFights.filter(function (r) { return r.entryHp != null; }).every(function (r) { return r.instId != null; }), 'entry-HP row without instId');
  check('live-traces-array', Array.isArray(on.traces), typeof on.traces);
  check('live-no-instrument-errors', on.instrumentErrors.length === 0, JSON.stringify(on.instrumentErrors.slice(0, 3)));
  runDriver({ DAYS: '30', SEEDS: '99641', RUN: 'grind-proof-off', OUTDIR: outdir, GRIND_OFF: '1' });
  const offFile = path.join(outdir, 'grind-s99641-grind-proof-off.json');
  check('live-off-file-exists', fs.existsSync(offFile), offFile);
  if (!fs.existsSync(offFile)) return;
  const off = JSON.parse(fs.readFileSync(offFile, 'utf8'));
  check('live-neutral-days', off.days === on.days, 'on ' + on.days + ' vs off ' + off.days);
  check('live-neutral-end', off.endReason === on.endReason, 'on ' + on.endReason + ' vs off ' + off.endReason);
  check('live-neutral-killlog', (off.waveKillLog || []).length === (on.waveKillLog || []).length, 'on ' + (on.waveKillLog || []).length + ' vs off ' + (off.waveKillLog || []).length);
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
