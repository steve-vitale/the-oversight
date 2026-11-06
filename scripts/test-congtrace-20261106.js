// test-congtrace-20261106.js — proof for the Congregation-kill trace
// (arm sim-congtrace-a, run fleshout-20261106T1515Z).
// Fixture tests for the analyzer's pure functions + live harness legs
// (driver subprocesses into /tmp, never into evidence/): the stageally
// driver re-runs seed 53006 staged 150d on current master and the
// headline numbers reproduce the confirm evidence (2 wave-4 kills: d89
// Strike by Olivia Bennett, d149 Congregation by gen_y8hmuwz; 150d
// survived; standing 175; same succession days); the same seed run
// twice is byte-identical (determinism); the recorder's damage account
// is proven on fixture fights (wounded entry, one-shot, incomplete
// account that must NOT close). Exit non-zero on any failure.
// Usage: node scripts/test-congtrace-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'congtrace-analyze-20261106'));
const CORPUS_FILE = path.join(REPO, 'evidence', '2026-11-06', 'perseed-stageally-confirm-b', 'stageally-s53006-stageally-confirm-staged.json');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function hit(r, actor, actorKind, tgtKind, dmg, srcLabel) {
  return { r: r, actor: actor, actorKind: actorKind, src: actor, srcLabel: srcLabel || 'strike', tgt: tgtKind === 'monster' ? 'm_0' : 'p', tgtKind: tgtKind, req: dmg, dmg: dmg, hpAfter: 100, maxHp: 100 };
}
function trace(opts) {
  const o = opts || {};
  return Object.assign({
    seq: 16, tbSeq: 16, day: 149, mid: 'congregation', mids: ['congregation'], wave: 4,
    entryHp: 1000, entryMaxHp: 1000, entryFrac: 1, fighters: ['gen_y8hmuwz'],
    alliesAtEntry: 0, partyAtEntry: 0, hits: [], turns: [], verbs: [],
    outcome: 'won', ending: 'kill', mHpLeft: 0, mHpLeftFrac: 0,
    rounds: 1, scholarHpEnd: 76, scholarHpFracEnd: 0.764,
    rallyRound: null, rallyOk: null, scholarStruckRallyRound: null,
  }, o);
}

// ---------- 1. damageAccount: wounded entry (fightinterior-b shape) ----------
(function () {
  // 51005 d66 Reunion shape: entered at 123 HP, died in 5 rounds to
  // 154 total damage (scholar 138 + ally 16). Account must close.
  const tr = trace({ day: 66, mid: 'reunion', entryHp: 123, entryMaxHp: 850, entryFrac: 0.145, rounds: 5,
    hits: [hit(1, 'p', 'player', 'monster', 40), hit(2, 'p', 'player', 'monster', 50),
      hit(3, 'p', 'player', 'monster', 48), hit(4, 'a1', 'ally', 'monster', 16)],
    verbs: [{ r: 1, verb: 'strike', ok: true }] });
  const a = AN.damageAccount(tr);
  check('account-wounded-entry-closes', a.closes === true, JSON.stringify({ closes: a.closes, total: a.toMonsterTotal, shortfall: a.shortfall }));
  check('account-wounded-entry-hp', a.entryHp === 123 && a.entryFrac === 0.145, JSON.stringify(a.entryHp));
  check('account-wounded-scholar-total', a.bySource.scholar === 138, JSON.stringify(a.bySource));
  check('account-wounded-ally-total', a.bySource.ally === 16, JSON.stringify(a.bySource));
  check('account-wounded-per-round', a.byRound[1].scholar === 40 && a.byRound[4].ally === 16, JSON.stringify(a.byRound));
})();

// ---------- 2. damageAccount: one-shot (fresh entry, single huge hit) ----------
(function () {
  const tr = trace({ entryHp: 1000, rounds: 1,
    hits: [hit(1, 'p', 'player', 'monster', 1000)],
    verbs: [{ r: 1, verb: 'strike', ok: true }] });
  const a = AN.damageAccount(tr);
  check('account-oneshot-closes', a.closes === true, JSON.stringify({ total: a.toMonsterTotal }));
  check('account-oneshot-scholar-1000', a.bySource.scholar === 1000, JSON.stringify(a.bySource));
})();

// ---------- 3. damageAccount: incomplete — must NOT close ----------
(function () {
  // Entry 1000, only 200 damage recorded, monster ends at 0: the
  // account must NOT close — a non-tbDamage kill path would hide here.
  const tr = trace({ entryHp: 1000, rounds: 1,
    hits: [hit(1, 'p', 'player', 'monster', 200)],
    verbs: [{ r: 1, verb: 'strike', ok: true }] });
  const a = AN.damageAccount(tr);
  check('account-incomplete-not-closed', a.closes === false, JSON.stringify({ closes: a.closes, total: a.toMonsterTotal }));
  check('account-incomplete-shortfall-800', a.shortfall === 800, 'shortfall=' + a.shortfall);
})();

// ---------- 4. damageAccount: monster-side damage is not kill damage ----------
(function () {
  const tr = trace({ entryHp: 1000, rounds: 2,
    hits: [hit(1, 'p', 'player', 'monster', 600), hit(1, 'm_0', 'monster', 'player', 70),
      hit(2, 'p', 'player', 'monster', 400), hit(2, 'm_0', 'monster', 'player', 60)],
    verbs: [{ r: 1, verb: 'strike', ok: true }, { r: 2, verb: 'strike', ok: true }] });
  const a = AN.damageAccount(tr);
  check('account-monster-side-separate', a.bySource.monsterSide === 130 && a.toMonsterTotal === 1000, JSON.stringify(a.bySource));
  check('account-monster-side-closes', a.closes === true, JSON.stringify({ closes: a.closes }));
})();

// ---------- 5. damageAccount: heresy trick bucket ----------
(function () {
  const tr = trace({ entryHp: 1000, rounds: 1,
    hits: [hit(1, 'p', 'player', 'monster', 25, 'heresy')],
    verbs: [{ r: 1, verb: 'ability', ok: true, aid: 'heresy' }] });
  const a = AN.damageAccount(tr);
  check('account-heresy-trick-bucket', a.bySource.trick === 25 && a.bySource.scholar === 0, JSON.stringify(a.bySource));
  check('account-heresy-not-closed', a.closes === false, JSON.stringify({ closes: a.closes }));
})();

// ---------- 6. compareTrajectories: identical runs reproduce ----------
(function () {
  const corpus = JSON.parse(fs.readFileSync(CORPUS_FILE, 'utf8'));
  const c = AN.compareTrajectories(corpus, corpus);
  check('compare-identical-reproduced', c.reproduced === true, JSON.stringify(c));
  check('compare-identical-kills', JSON.stringify(c.w4kills.corpus) === JSON.stringify(AN.CORPUS_W4_KILLS), JSON.stringify(c.w4kills.corpus));
  check('compare-identical-days', c.days.corpus === 150 && c.endReason.corpus === 'survived' && c.standing.corpus === 175,
    JSON.stringify({ days: c.days, end: c.endReason, standing: c.standing }));
})();

// ---------- 7. compareTrajectories: ledger diff is named, not hidden ----------
(function () {
  const corpus = JSON.parse(fs.readFileSync(CORPUS_FILE, 'utf8'));
  const shifted = JSON.parse(JSON.stringify(corpus));
  shifted.waveKillLog = shifted.waveKillLog.filter(function (e) { return !(e.d === 149 && e.mid === 'congregation'); });
  const c = AN.compareTrajectories(corpus, shifted);
  check('compare-missing-kill-not-reproduced', c.reproduced === false, JSON.stringify(c.w4kills));
  check('compare-missing-kill-named', c.w4kills.fresh.length === 1 && c.w4kills.fresh[0].day === 89, JSON.stringify(c.w4kills.fresh));
  const moved = JSON.parse(JSON.stringify(corpus));
  moved.daily = moved.daily.map(function (d) {
    return (d.day === 138) ? Object.assign({}, d, { scholarId: 'someone_else' }) : d;
  });
  const c2 = AN.compareTrajectories(corpus, moved);
  check('compare-succession-shift-not-reproduced', c2.reproduced === false, JSON.stringify(c2.successionDays));
})();

// ---------- 8. findTrace / nearestEquivalentKill fixtures ----------
(function () {
  const run = {
    endScholarId: 'gen_y8hmuwz', waveKillLog: [{ d: 89, mid: 'strike', w: 4, by: 'olivia_bennett', via: 'player' }],
    traces: [trace({ day: 89, mid: 'strike', entryHp: 900, rounds: 10,
      hits: [hit(1, 'p', 'player', 'monster', 900)] })],
  };
  const tr = AN.findTrace(run, 89, 'strike');
  check('findTrace-found', !!tr && tr.mid === 'strike', 'found=' + !!tr);
  check('findTrace-missing-null', AN.findTrace(run, 149, 'congregation') === null);
  const ne = AN.nearestEquivalentKill(run);
  check('nearest-equivalent-traced', !!ne.traced && ne.traced.kill.day === 89, JSON.stringify(ne.traced && ne.traced.kill));
  check('nearest-equivalent-account-closes', ne.traced.account.closes === true, JSON.stringify(ne.traced.account && ne.traced.account.closes));
})();

// ---------- 9. Live legs (stageally driver subprocesses, /tmp only) ----------
// Seed 53006 staged, 150d, on current master: the determinism leg.
// Headlines must reproduce the confirm evidence (2 wave-4 kills: d89
// Strike, d149 Congregation; 150d survived; standing 175; same
// succession days). A second identical run must be byte-identical.
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'congtrace-live-'));
  const env = Object.assign({}, process.env, { REPO: REPO });
  function runDriver(extraEnv) {
    const e = Object.assign({}, env, extraEnv || {});
    return execFileSync('node', [path.join(REPO, 'scripts', 'stageally-driver-20261106.js')], {
      cwd: REPO, env: e, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 900000,
    });
  }
  const corpus = JSON.parse(fs.readFileSync(CORPUS_FILE, 'utf8'));
  try {
    const out1 = path.join(tmp, 'leg1');
    runDriver({ SEEDS: '53006', DAYS: '150', RUN: 'congtrace-proof-staged', OUTDIR: out1, POLICY: 'staged' });
    const f1 = path.join(out1, 'stageally-s53006-congtrace-proof-staged.json');
    check('live-leg1-wrote', fs.existsSync(f1));
    const leg1 = JSON.parse(fs.readFileSync(f1, 'utf8'));
    check('live-leg1-zero-instrument-errors', (leg1.instrumentErrors || []).length === 0, JSON.stringify((leg1.instrumentErrors || []).slice(0, 3)));
    const c = AN.compareTrajectories(corpus, leg1);
    check('live-headline-days', c.days.same && leg1.days === 150, JSON.stringify(c.days));
    check('live-headline-end', c.endReason.same && leg1.endReason === 'survived', JSON.stringify(c.endReason));
    check('live-headline-standing', c.standing.same && leg1.standing === 175, JSON.stringify(c.standing));
    check('live-kill-ledger-two-kills', JSON.stringify(c.w4kills.fresh) === JSON.stringify(AN.CORPUS_W4_KILLS), JSON.stringify(c.w4kills.fresh));
    check('live-kill-d149-congregation', c.w4kills.fresh.some(function (k) { return k.day === 149 && k.mid === 'congregation' && k.by === 'gen_y8hmuwz'; }), JSON.stringify(c.w4kills.fresh));
    check('live-succession-days-match', c.successionDays.same, JSON.stringify(c.successionDays));
    check('live-scholar-deaths-match', c.scholarDeaths.same, JSON.stringify(c.scholarDeaths));
    check('live-reproduced', c.reproduced === true, JSON.stringify({ kills: c.w4kills.same, succ: c.successionDays.same, deaths: c.scholarDeaths.same }));
    const d149 = AN.findTbFight(leg1, 149, 'congregation');
    check('live-d149-tb-row-one-round', !!d149 && d149.rounds === 1 && d149.outcome === 'won', JSON.stringify(d149));
    check('live-d149-tb-row-solo', !!d149 && d149.alliesAtEntry === 0 && d149.partyAtEntry === 0, JSON.stringify(d149));

    // Determinism: same seed, same driver, second run byte-identical.
    const out2 = path.join(tmp, 'leg2');
    runDriver({ SEEDS: '53006', DAYS: '150', RUN: 'congtrace-proof-staged', OUTDIR: out2, POLICY: 'staged' });
    const f2 = path.join(out2, 'stageally-s53006-congtrace-proof-staged.json');
    const b1 = fs.readFileSync(f1, 'utf8');
    const b2 = fs.readFileSync(f2, 'utf8');
    check('live-determinism-identical', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);
  } catch (e) {
    fail++;
    console.log('FAIL live-legs :: ' + (e && e.message ? String(e.message).slice(0, 400) : String(e)));
    if (e && e.stdout) console.log('--- driver stdout (tail) ---\n' + String(e.stdout).slice(-2000));
    if (e && e.stderr) console.log('--- driver stderr (tail) ---\n' + String(e.stderr).slice(-2000));
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
