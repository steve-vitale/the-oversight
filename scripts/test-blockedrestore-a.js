#!/usr/bin/env node
// scripts/test-blockedrestore-a.js — sim-blockedrestore-a fixtures.
// Plain node (no jest): classification rules on synthetic tbend
// events, floor-marker corroboration, anchor shape, substrate
// identity (draftflag row minus additive fields == chainclose row),
// per-seed reconciliation on a synthetic corpus, and analyzer
// determinism (seed 75102 run twice into scratch dirs, byte-identical,
// scratch removed). Run: node scripts/test-blockedrestore-a.js
// Exit non-zero on any failure; prints FIXTURES-PASS n/n on green.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { classify, blockerOf, analyze } = require('./analyze-blockedrestore-a.js');
const REPO = path.join(__dirname, '..');
const DRAFT = path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
const CHAIN = path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108,
  75109, 75110, 75111, 75112, 75113, 75114, 75115, 75116];

let pass = 0, total = 0, failures = [];
function check(name, cond, extra) {
  total++;
  if (cond) pass++;
  else failures.push(name + (extra ? ' :: ' + extra : ''));
}
function ev(over) {
  return Object.assign({ result: 'lost', restored: false, occupantBefore: null,
    occupantSameAsOriginBefore: false, originInWorldBefore: -1, originInWorldAfter: -1,
    occupantAfter: null, origin: { uid: 29, id: 'suburb', hp: 960, maxHp: 1300, wave: 4,
      tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false } }, over);
}
function occ(over) {
  return Object.assign({ uid: 33, id: 'callback', hp: 1, maxHp: 260, wave: 3,
    tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false }, over);
}

// 1. Classification rules (prereg, game.js tbEnd restore block).
check('lost lingerer restored', classify(ev({ restored: true })) === 'RESTORED');
check('lost lingerer blocked 1-HP', classify(ev({ occupantBefore: occ() })) === 'BLOCKED');
check('lost lingerer blocked high-HP', classify(ev({ occupantBefore: occ({ hp: 400 }) })) === 'BLOCKED');
check('lost lingerer occupant-null unmeasured', classify(ev()) === 'UNMEASURED-cause');
check('won never restored by design', classify(ev({ result: 'won', restored: false })) === 'BY-DESIGN-NOT-RESTORED');
check('routed lingerer by design', classify(ev({ result: 'routed' })) === 'BY-DESIGN-NOT-RESTORED');
check('routed non-lingerer blocked', classify(ev({ result: 'routed',
  origin: { uid: 7, id: 'wild', hp: 50, maxHp: 50, wave: 1, tx: 4, ty: 4, lingering: false, raidBorn: false, titan: false },
  occupantBefore: occ() })) === 'BLOCKED');
check('routed non-lingerer occupant-null unmeasured', classify(ev({ result: 'routed',
  origin: { uid: 7, id: 'wild', hp: 50, maxHp: 50, wave: 1, tx: 4, ty: 4, lingering: false, raidBorn: false, titan: false } })) === 'UNMEASURED-cause');
check('routed titan eligible blocked', classify(ev({ result: 'routed',
  origin: { uid: 9, id: 'titan', hp: 500, maxHp: 500, wave: 4, tx: 4, ty: 4, lingering: true, raidBorn: false, titan: true },
  occupantBefore: occ() })) === 'BLOCKED');
check('fled lingerer blocked', classify(ev({ result: 'fled', occupantBefore: occ() })) === 'BLOCKED');
check('same-as-origin is not blocked', classify(ev({ occupantBefore: occ({ uid: 29 }),
  occupantSameAsOriginBefore: true, originInWorldBefore: 3 })) === 'UNMEASURED-cause');
check('already-in-world is not blocked', classify(ev({ occupantBefore: occ(),
  originInWorldBefore: 2 })) === 'UNMEASURED-cause');
check('blocker fields stated', (() => { const b = blockerOf(ev({ occupantBefore: occ() }));
  return b && b.uid === 33 && b.hp === 1 && b.wave === 3 && b.tx === 4 && b.ty === 4; })());
check('anchor shape blocked', (() => { const a = ev({ occupantBefore: occ() });
  return classify(a) === 'BLOCKED' && blockerOf(a).uid === 33 && blockerOf(a).hp === 1; })());
check('no-origin sentinel', classify({ result: 'lost', restored: false }) === 'NO-ORIGIN');

// 2. Synthetic-corpus pipeline: classification + reconciliation + pattern rule.
(function syntheticCorpus() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blockedrestore-test-'));
  try {
    const mkRow = (seed, tbends, meetings) => ({
      seed, days: 100, won: 0, nationalEver: 0, nationalFinal: 0, table: 0, entered: 0,
      waveReach: 1, deathTotal: 0,
      draftflag: { events: tbends, diag: { errs: 0, errors: [], overflow: {},
        tbEndTotal: tbends.length, tbEndWithOrigin: tbends.length } },
      scholarmelt: { meetings: meetings || [] } });
    const rowA = mkRow(75101, [
      { type: 'tbend', seq: 1, day: 50, result: 'lost', restored: false,
        origin: { uid: 29, id: 'suburb', hp: 960, maxHp: 1300, wave: 4, tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false },
        occupantBefore: occ(), occupantSameAsOriginBefore: false, originInWorldBefore: -1, originInWorldAfter: -1, occupantAfter: occ() },
      { type: 'tbend', seq: 2, day: 60, result: 'lost', restored: true,
        origin: { uid: 30, id: 'audit', hp: 825, maxHp: 1100, wave: 4, tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false },
        occupantBefore: null, occupantSameAsOriginBefore: false, originInWorldBefore: -1, originInWorldAfter: 0, occupantAfter: null },
      { type: 'tbend', seq: 3, day: 70, result: 'won', restored: false,
        origin: { uid: 31, id: 'wild', hp: 10, maxHp: 50, wave: 1, tx: 4, ty: 4, lingering: false, raidBorn: false, titan: false },
        occupantBefore: null, occupantSameAsOriginBefore: false, originInWorldBefore: -1, originInWorldAfter: -1, occupantAfter: null },
    ], [{ result: 'dissolved-no-tbend', fightSeq: 9 }]);
    const rowB = mkRow(75102, [
      { type: 'tbend', seq: 1, day: 40, result: 'lost', restored: false,
        origin: { uid: 5, id: 'beast', hp: 100, maxHp: 200, wave: 2, tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false },
        occupantBefore: null, occupantSameAsOriginBefore: false, originInWorldBefore: -1, originInWorldAfter: -1, occupantAfter: null },
    ], []);
    fs.writeFileSync(path.join(dir, 's75101-fresh.json'), JSON.stringify(rowA));
    fs.writeFileSync(path.join(dir, 's75102-fresh.json'), JSON.stringify(rowB));
    fs.writeFileSync(path.join(dir, 'census-s75101.json'), JSON.stringify({ seed: 75101, snapshots: [{ day: 100, monsters: [] }] }));
    fs.writeFileSync(path.join(dir, 'census-s75102.json'), JSON.stringify({ seed: 75102, snapshots: [{ day: 100, monsters: [] }] }));
    const res = analyze(dir, [75101, 75102]);
    check('synthetic total tbend', res.totals.tbendEvents === 4, String(res.totals.tbendEvents));
    check('synthetic lost total', res.totals.lostTotal === 3, String(res.totals.lostTotal));
    check('synthetic lost blocked 1', res.totals.lostByClass.BLOCKED === 1, JSON.stringify(res.totals.lostByClass));
    check('synthetic lost restored 1', res.totals.lostByClass.RESTORED === 1);
    check('synthetic lost unmeasured 1', res.totals.lostByClass['UNMEASURED-cause'] === 1);
    check('synthetic by-design won 1', res.totals.byClass['BY-DESIGN-NOT-RESTORED'] === 1);
    check('synthetic dissolved counted', res.totals.dissolvedTotal === 1);
    check('synthetic reconciliation match', res.reconciliation.every(r => r.match));
    check('synthetic pattern insufficient (n<4)', res.pattern === 'INSUFFICIENT-DATA', res.pattern);
    check('synthetic floor corroboration absent without draft rows', res.blockedRows[0].blocker.floorDraftRow === false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
})();

// 3. Floor corroboration: blocker uid with a hpAfter==1 draft row.
(function floorCorroboration() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blockedrestore-floor-'));
  try {
    const row = { seed: 75101, days: 100, won: 0, nationalEver: 0, nationalFinal: 0, table: 0,
      entered: 0, waveReach: 1, deathTotal: 0,
      draftflag: { events: [
        { type: 'raid', seq: 1, day: 10, fired: true, drafts: [{ uid: 33, hpAfter: 1 }] },
        { type: 'tbend', seq: 2, day: 50, result: 'lost', restored: false,
          origin: { uid: 29, id: 'suburb', hp: 960, maxHp: 1300, wave: 4, tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false },
          occupantBefore: occ(), occupantSameAsOriginBefore: false, originInWorldBefore: -1, originInWorldAfter: -1, occupantAfter: occ() },
      ], diag: { errs: 0, errors: [], overflow: {}, tbEndTotal: 1, tbEndWithOrigin: 1 } },
      scholarmelt: { meetings: [] } };
    fs.writeFileSync(path.join(dir, 's75101-fresh.json'), JSON.stringify(row));
    fs.writeFileSync(path.join(dir, 'census-s75101.json'), JSON.stringify({ seed: 75101, snapshots: [{ day: 100, monsters: [] }] }));
    const res = analyze(dir, [75101]);
    check('floor corroboration true with hpAfter==1 draft row', res.blockedRows[0].blocker.floorDraftRow === true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
})();

// 4. Substrate identity: draftflag row minus additive fields == chainclose row.
function canon(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
}
for (const seed of SEEDS) {
  const d = JSON.parse(fs.readFileSync(path.join(DRAFT, `s${seed}-fresh.json`), 'utf8'));
  const c = JSON.parse(fs.readFileSync(path.join(CHAIN, `s${seed}-fresh.json`), 'utf8'));
  const stripped = {};
  for (const k of Object.keys(d)) if (!['draftflag', 'scholarmelt', 'removal'].includes(k)) stripped[k] = d[k];
  check(`substrate identity s${seed}`, canon(stripped) === canon(c));
}

// 5. Determinism: analyzer on seed 75102 twice into scratch dirs, byte-identical, scratch removed.
(function determinism() {
  const d1 = fs.mkdtempSync(path.join(os.tmpdir(), 'blockedrestore-det1-'));
  const d2 = fs.mkdtempSync(path.join(os.tmpdir(), 'blockedrestore-det2-'));
  try {
    const o1 = path.join(d1, 'a.json'), o2 = path.join(d2, 'a.json');
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-blockedrestore-a.js'),
      '--dir', DRAFT, '--out', o1, '--seeds', '75102'], { stdio: 'pipe' });
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-blockedrestore-a.js'),
      '--dir', DRAFT, '--out', o2, '--seeds', '75102'], { stdio: 'pipe' });
    check('determinism seed 75102 byte-identical',
      fs.readFileSync(o1, 'utf8') === fs.readFileSync(o2, 'utf8'));
    const one = JSON.parse(fs.readFileSync(o1, 'utf8'));
    check('determinism pilot tbend rows present', one.totals.tbendEvents === one.perSeed[0].tbendEvents
      && one.totals.tbendEvents > 0, String(one.totals.tbendEvents));
    check('determinism pilot reconciliation', one.reconciliation.every(r => r.match));
  } finally {
    fs.rmSync(d1, { recursive: true, force: true });
    fs.rmSync(d2, { recursive: true, force: true });
  }
  check('determinism scratch removed', !fs.existsSync(d1) && !fs.existsSync(d2));
})();

console.log(`FIXTURES-${failures.length ? 'FAIL' : 'PASS'} ${pass}/${total}`);
if (failures.length) { for (const f of failures) console.log('  FAIL: ' + f); process.exit(1); }
