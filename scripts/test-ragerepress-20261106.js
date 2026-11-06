// test-ragerepress-20261106.js — proof for the rage re-press lever
// (arm sim-ragerepress-b, run fleshout-loop-b-20261106T1730Z).
// Fixture tests for the analyzer's pure functions + policy unit fakes
// (hold-ground, cascade order, no waveKillLog read) + live harness legs
// (driver subprocesses into /tmp, never into evidence/): a wave-4 TB
// fight on a real seed carries a per-turn trace with hits, verbs, and a
// finishing classification; the instrument is neutral (off-mode ==
// on-mode on days/endReason/kill-log length); the same seed run twice
// is byte-identical. Exit non-zero on any failure.
// Usage: node scripts/test-ragerepress-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'ragerepress-analyze-20261106'));
const PD = require(path.join(REPO, 'scripts', 'policies', 'competent-ragerepress-b'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function hit(r, actor, actorKind, tgtKind, dmg) {
  return { r: r, actor: actor, actorKind: actorKind, src: actor, srcLabel: 'test', tgt: tgtKind === 'monster' ? 'm_0' : 'p', tgtKind: tgtKind, req: dmg, dmg: dmg, hpAfter: 100, maxHp: 100 };
}
function trace(opts) {
  const o = opts || {};
  return Object.assign({
    seq: 1, tbSeq: 1, day: 80, mid: 'the_congregation', mids: ['the_congregation'], wave: 4,
    entryHp: 1000, entryMaxHp: 1000, entryFrac: 1, fighters: ['scholar', 'ally1'],
    alliesAtEntry: 1, partyAtEntry: 1, hits: [], turns: [], verbs: [],
    outcome: 'lost', ending: 'scholar-death', mHpLeft: 800, mHpLeftFrac: 0.8,
    rounds: 6, scholarHpEnd: 0, scholarHpFracEnd: 0,
    rallyRound: null, rallyOk: null, scholarStruckRallyRound: null,
  }, o);
}

// ---------- 1. tracePresent ----------
check('trace-present-turns', AN.tracePresent(trace({ turns: [{ r: 1, actor: 'm_0' }] })) === true);
check('trace-present-verbs', AN.tracePresent(trace({ verbs: [{ r: 1, verb: 'strike', ok: true }] })) === true);
check('trace-absent-empty', AN.tracePresent(trace({ turns: [], verbs: [] })) === false);
check('trace-absent-null', AN.tracePresent(null) === false);

// ---------- 2. damageByRound: sides split, unknown actor -> other ----------
(function () {
  const tr = trace({ hits: [
    hit(1, 'p', 'player', 'monster', 40),
    hit(1, 'm_0', 'monster', 'player', 25),
    hit(2, 'a1', 'ally', 'monster', 15),
    hit(2, 'm_0', 'monster', 'ally', 10),
    hit(2, null, null, 'monster', 5), // round-wrap / status-tick hit: other, never silently player-side
  ] });
  const by = AN.damageByRound(tr);
  check('dmg-round1-player', by[1].player === 40 && by[1].monster === 25, JSON.stringify(by[1]));
  check('dmg-round2-ally-counts-player-side', by[2].player === 15 && by[2].monster === 10, JSON.stringify(by[2]));
  check('dmg-round2-unknown-other', by[2].other === 5, JSON.stringify(by[2]));
})();

// ---------- 3. bestRoundComposition: scholar vs ally split + ability verbs ----------
(function () {
  // Best round is round 2: scholar 40 + ally 60 = 100, with a rage press.
  const tr = trace({ ending: 'scholar-death', entryHp: 1000, rounds: 3,
    verbs: [{ r: 2, verb: 'ability', ok: true, aid: 'rage', act: 'unleash_rage' },
      { r: 1, verb: 'strike', ok: true }, { r: 2, verb: 'strike', ok: true }],
    hits: [hit(1, 'p', 'player', 'monster', 30),
      hit(2, 'p', 'player', 'monster', 40), hit(2, 'a1', 'ally', 'monster', 60),
      hit(3, 'p', 'player', 'monster', 20)] });
  const c = AN.bestRoundComposition(tr);
  check('bestround-picks-max', c && c.round === 2 && c.total === 100, JSON.stringify(c));
  check('bestround-scholar-ally-split', c && c.scholar === 40 && c.ally === 60, JSON.stringify(c));
  check('bestround-ability-verbs', c && c.abilityVerbs.length === 1 && c.abilityVerbs[0] === 'rage:unleash_rage', JSON.stringify(c));
  check('bestround-share-of-entry', c && Math.abs(c.shareOfEntry - 0.1) < 1e-9, JSON.stringify(c));
  // One-off spike: best round is scholar-only, one strike.
  const spike = trace({ seq: 2, ending: 'scholar-death', entryHp: 1000, rounds: 2,
    verbs: [{ r: 1, verb: 'strike', ok: true }],
    hits: [hit(1, 'p', 'player', 'monster', 159), hit(2, 'p', 'player', 'monster', 10)] });
  const c2 = AN.bestRoundComposition(spike);
  check('bestround-spike-scholar-only', c2 && c2.round === 1 && c2.scholar === 159 && c2.ally === 0 && c2.strikes === 1, JSON.stringify(c2));
  check('bestround-empty-null', AN.bestRoundComposition(trace({ hits: [] })) === null);
})();

// ---------- 4. sizeNextLever: finishprobe-shaped generous bound ----------
(function () {
  const noFlip = trace({ ending: 'scholar-death', entryHp: 1000, rounds: 6,
    hits: [hit(1, 'p', 'player', 'monster', 50), hit(2, 'p', 'player', 'monster', 50),
      hit(3, 'p', 'player', 'monster', 50), hit(4, 'p', 'player', 'monster', 50),
      hit(5, 'p', 'player', 'monster', 50), hit(6, 'p', 'player', 'monster', 50)] });
  const flip = trace({ seq: 2, ending: 'scholar-death', entryHp: 1000, rounds: 6,
    hits: [hit(1, 'p', 'player', 'monster', 200), hit(2, 'p', 'player', 'monster', 200),
      hit(3, 'p', 'player', 'monster', 200), hit(4, 'p', 'player', 'monster', 200),
      hit(5, 'p', 'player', 'monster', 200), hit(6, 'p', 'player', 'monster', 200)] });
  const s = AN.sizeNextLever([noFlip, flip]);
  check('sizing-flips-one', s.flips === 1 && s.lostFights === 2, JSON.stringify(s));
  check('sizing-ceiling-rate', Math.abs(s.ceilingRate - 0.5) < 1e-9, JSON.stringify(s));
})();

// ---------- 5. analyzeLeg: classification + log-based kill rate + pyrrhic ----------
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ragerepress-fixture-'));
  function runFile(seed, policy, tbFights, traces, kills) {
    return {
      seed: seed, policy: policy, days: 100, endReason: 'village-lost', won: false,
      scaleRank: 'regional', unlockedWave: 4, standing: 150, readiness5: { veterans: 0 },
      waveKillLog: kills || [], daily: [], instrumentErrors: [], tbFights: tbFights, traces: traces,
      wavesFaced: { strike: 2, cancellation: 0 },
    };
  }
  const tbRow = { seq: 1, day: 80, mid: 'the_congregation', wave: 4, alliesAtEntry: 1, partyAtEntry: 1, outcome: 'lost', rounds: 6 };
  const tr = trace({ tbSeq: 1, turns: [{ r: 1, actor: 'm_0' }] });
  const f1 = path.join(dir, 'a.json');
  fs.writeFileSync(f1, JSON.stringify(runFile(1, 'baseline', [tbRow], [tr])));
  const tbRow2 = { seq: 2, day: 90, mid: 'the_strike', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'won', rounds: 3 };
  const f2 = path.join(dir, 'b.json');
  fs.writeFileSync(f2, JSON.stringify(runFile(2, 'baseline', [tbRow, tbRow2], [tr])));
  const legs = AN.analyzeLeg([f1, f2]);
  const L = legs.baseline;
  check('analyze-tb-fight-count', L.tbFights === 3, 'tbFights=' + L.tbFights);
  check('analyze-unclassified-one', L.unclassified === 1, 'unclassified=' + L.unclassified);
  check('analyze-ending-counted', L.endings['scholar-death'] === 2, JSON.stringify(L.endings));
  check('analyze-trace-present', L.tracePresent === 2, 'tracePresent=' + L.tracePresent);
  check('analyze-w4faced-per-type-map', L.w4faced === 2, 'w4faced=' + L.w4faced);
  check('analyze-w5faced-per-type-map', L.w5faced === 0, 'w5faced=' + L.w5faced);
  check('analyze-kill-rate-zero-no-kills', L.tbKillRate === 0, 'tbKillRate=' + L.tbKillRate);
  // Pyrrhic: an 'unfinished' trace + a same-day wave-4 log kill by one of
  // the fight's fighters counts as a TB kill; a log kill by a stranger does not.
  const pyr = trace({ seq: 3, tbSeq: 3, day: 95, mid: 'the_eater', ending: 'unfinished',
    outcome: 'unfinished', turns: [{ r: 1, actor: 'm_0' }],
    hits: [hit(1, 'p', 'player', 'monster', 800)] });
  const tbRow3 = { seq: 3, day: 95, mid: 'the_eater', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'unfinished', rounds: 9 };
  const f3 = path.join(dir, 'c.json');
  fs.writeFileSync(f3, JSON.stringify(runFile(3, 'ragerepress', [tbRow3], [pyr],
    [{ day: 95, w: 4, by: 'scholar', mid: 'the_eater' }, { day: 95, w: 4, by: 'a_stranger', mid: 'the_eater' }])));
  const legs2 = AN.analyzeLeg([f3]);
  const L2 = legs2.ragerepress;
  check('analyze-pyrrhic-matched', L2.tbKillMatched === 1 && L2.pyrrhicKills === 1,
    'matched=' + L2.tbKillMatched + ' pyrrhic=' + L2.pyrrhicKills);
  check('analyze-pyrrhic-kill-rate', L2.tbKillRate === 1, 'tbKillRate=' + L2.tbKillRate);
  check('analyze-log-kills-counted', L2.logW4Kills === 2, 'logW4Kills=' + L2.logW4Kills);
  // Midnight-spanning pyrrhic: an 'unfinished' trace on day 95 whose
  // wave-4 log kill is dated day 96 (waveKillLog 'd' key) still matches
  // — the sim-ragerepress-b midnight correction (fight day OR day+1).
  const pyrMid = trace({ seq: 4, tbSeq: 4, day: 95, mid: 'the_eater', ending: 'unfinished',
    outcome: 'unfinished', turns: [{ r: 1, actor: 'm_0' }],
    hits: [hit(1, 'p', 'player', 'monster', 800)] });
  const tbRow4 = { seq: 4, day: 95, mid: 'the_eater', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'unfinished', rounds: 9 };
  const f4 = path.join(dir, 'd.json');
  fs.writeFileSync(f4, JSON.stringify(runFile(4, 'ragerepress', [tbRow4], [pyrMid],
    [{ d: 96, w: 4, by: 'scholar', mid: 'the_eater' }])));
  const legs3 = AN.analyzeLeg([f4]);
  const L3 = legs3.ragerepress;
  check('analyze-pyrrhic-midnight-matched', L3.tbKillMatched === 1 && L3.pyrrhicKills === 1,
    'matched=' + L3.tbKillMatched + ' pyrrhic=' + L3.pyrrhicKills);
  // A day+2 kill must NOT match: the window is fight day OR day+1 only.
  const f5 = path.join(dir, 'e.json');
  fs.writeFileSync(f5, JSON.stringify(runFile(5, 'ragerepress', [tbRow4], [pyrMid],
    [{ d: 97, w: 4, by: 'scholar', mid: 'the_eater' }])));
  const legs4 = AN.analyzeLeg([f5]);
  const L4 = legs4.ragerepress;
  check('analyze-pyrrhic-dayplus2-no-match', L4.tbKillMatched === 0 && L4.pyrrhicKills === 0,
    'matched=' + L4.tbKillMatched + ' pyrrhic=' + L4.pyrrhicKills);
  fs.rmSync(dir, { recursive: true, force: true });
})();

// ---------- 6. Policy unit fakes: hold ground, cascade order, no log read ----------
(function () {
  // Fake wave-4 TB fight: scholar at full HP vs an 800-HP beast. Competent
  // would walk away at fight start (800 > 2.5 * 100); this policy must strike.
  function fakeGame(opts) {
    const o = opts || {};
    const p = { key: 'p', kind: 'player', hp: 100, maxHp: 100, mx: 4, my: 4, moveLeft: 3, acted: false };
    const m = { key: 'm_0', kind: 'monster', hp: 800, maxHp: 1000, alive: true, fled: false,
      mx: 5, my: 5, monsterId: 'the_eater', mdef: { id: 'the_eater', wave: 4 } };
    const fighters = [p, m].concat(o.allies || []);
    const f = { round: 1, over: false, fighters: fighters, order: ['p', 'm_0'], turnIdx: 0 };
    const calls = { strikes: [], flees: 0, rallies: 0, abilities: [], moves: [], waits: 0 };
    let logRead = false;
    const state = { scholar: { day: 80, kcal: 3000 } };
    Object.defineProperty(state, 'waveKillLog', { get: function () { logRead = true; return [{ day: 1, w: 4, by: 'poisoned' }]; } });
    const G = {
      tbfight: f, state: state, map: { px: 4, py: 4 },
      tbIsPlayerTurn: function () { return true; },
      tbFighter: function (k) { return k === 'p' ? p : (k === 'm_0' ? m : null); },
      tbAfterPlayerAction: function () { p.acted = true; },
      tbPlayerStrike: function (k) { calls.strikes.push(k); p.acted = true; return true; },
      tbPlayerMove: function (x, y) { p.mx = x; p.my = y; return true; },
      tbPlayerWait: function () { calls.waits++; p.acted = true; return true; },
      tbPlayerRally: function () { calls.rallies++; p.acted = true; return true; },
      tbBarrierExit: function () { calls.flees++; return false; },
      tbPlayerFlee: function () { calls.flees++; return false; },
      hasAbility: function (aid) { return (o.abilities || []).indexOf(aid) >= 0; },
      _actionAvailable: function () { return { ok: true }; },
      useAbility: function (aid, act) { calls.abilities.push(aid + ':' + act); p.acted = true; return true; },
      equippedWeapon: function () { return { range: 1 }; },
      findPath: function () { return [[5, 5]]; },
      data: { abilities: CASCADE_DEFS },
    };
    return { G: G, p: p, m: m, calls: calls, wasLogRead: function () { return logRead; } };
  }
  const CASCADE_DEFS = PD.CASCADE.map(function (s) {
    return { id: s.aid, actions: [{ id: s.act, cost: { kcal: 0 } }] };
  });
  // (a) Hold ground: full-HP scholar vs 800-HP wave-4 beast strikes, never flees.
  const a = fakeGame({});
  const ctxA = {};
  const rA = PD.ragerepressPolicy.fight(a.G, ctxA);
  check('policy-holdground-strikes', rA === true && a.calls.strikes.length === 1 && a.calls.strikes[0] === 'm_0',
    JSON.stringify(a.calls));
  check('policy-holdground-never-flees', a.calls.flees === 0, 'flees=' + a.calls.flees);
  check('policy-never-reads-kill-log', a.wasLogRead() === false, 'logRead=' + a.wasLogRead());
  // (b) Cascade order: holding all five abilities, the first press is patient_aim.
  const b = fakeGame({ abilities: ['patient_aim', 'freeze_tag', 'hogtie', 'rage', 'war_cry'] });
  const ctxB = {};
  PD.ragerepressPolicy.fight(b.G, ctxB);
  check('policy-cascade-aim-first', b.calls.abilities.length === 1 && b.calls.abilities[0] === 'patient_aim:take_aim',
    JSON.stringify(b.calls.abilities));
  check('policy-cascade-press-once-per-turn', b.calls.strikes.length === 0, 'strikes=' + b.calls.strikes.length);
  // (c) Second turn: aim already pressed, next press is freeze_tag.
  b.p.acted = false;
  PD.ragerepressPolicy.fight(b.G, ctxB);
  check('policy-cascade-freeze-second', b.calls.abilities.length === 2 && b.calls.abilities[1] === 'freeze_tag:tag',
    JSON.stringify(b.calls.abilities));
  // (d) Non-wave-4 fight delegates to the staged base (no w4 hook): a wave-2
  // monster must NOT run this policy's hold-ground path — the staged
  // policy's own fight runs instead (competent strikes it normally on the
  // fake). The proof is that the ragerepress w4 branch never fired:
  // no rrW4plusFights counter was set on the ctx.
  const d = fakeGame({});
  d.m.mdef = { id: 'the_grief_counselor', wave: 2 };
  const ctxD = {};
  PD.ragerepressPolicy.fight(d.G, ctxD);
  check('policy-nonw4-delegates', ctxD.rrW4plusFights == null, 'rrW4plusFights=' + ctxD.rrW4plusFights);
  // (e) Rally on turn 1 with an ally present.
  const e = fakeGame({ allies: [{ key: 'a_0', kind: 'ally', alive: true, fled: false, mx: 4, my: 5, villagerId: 'ally1' }] });
  const rE = PD.ragerepressPolicy.fight(e.G, {});
  check('policy-rally-turn1-with-ally', rE === true && e.calls.rallies === 1, JSON.stringify(e.calls));
  // (f) CASCADE frozen order is the prereg order.
  check('policy-cascade-order', JSON.stringify(PD.CASCADE.map(function (s) { return s.aid; })) ===
    JSON.stringify(['patient_aim', 'freeze_tag', 'hogtie', 'rage', 'war_cry']));
  // (g) RAGE RE-PRESS (the one change in this arm): holding ONLY rage, the
  // policy presses it on turn 1 AND again on turn 2 — the second press is
  // counted as a re-press. The partydamage policy would have struck on
  // turn 2 instead (rage capped at once per fight).
  const g = fakeGame({ abilities: ['rage'] });
  const ctxG = {};
  PD.ragerepressPolicy.fight(g.G, ctxG);
  check('policy-rage-first-press', g.calls.abilities.length === 1 && g.calls.abilities[0] === 'rage:unleash_rage',
    JSON.stringify(g.calls.abilities));
  g.p.acted = false;
  PD.ragerepressPolicy.fight(g.G, ctxG);
  check('policy-rage-repress-second-turn', g.calls.abilities.length === 2 && g.calls.abilities[1] === 'rage:unleash_rage',
    JSON.stringify(g.calls.abilities));
  check('policy-rage-repress-counted', ctxG.rrRageRepresses === 1 && ctxG.rrRagePresses === 2,
    'represses=' + ctxG.rrRageRepresses + ' presses=' + ctxG.rrRagePresses);
  check('policy-rage-repress-stats', PD.ragerepressStats().rageRepresses >= 1,
    JSON.stringify(PD.ragerepressStats()));
  // (h) The cap still holds for every OTHER cascade ability: holding
  // patient_aim + rage, turn 1 presses aim, turn 2 presses rage — aim is
  // never pressed twice in the fight.
  const h = fakeGame({ abilities: ['patient_aim', 'rage'] });
  const ctxH = {};
  PD.ragerepressPolicy.fight(h.G, ctxH);
  h.p.acted = false;
  PD.ragerepressPolicy.fight(h.G, ctxH);
  const aimCount = h.calls.abilities.filter(function (a) { return a.indexOf('patient_aim') === 0; }).length;
  const rageCount = h.calls.abilities.filter(function (a) { return a.indexOf('rage:') === 0; }).length;
  check('policy-aim-still-capped', aimCount === 1 && rageCount === 1, JSON.stringify(h.calls.abilities));
})();

// ---------- 7. Live legs (driver subprocesses, /tmp only) ----------
// Seed 55002 reaches wave-4 TB fights by day 72 on the finishprobe band
// (day-72 Congregation, 18 rounds) — a 90d smoke proves the recorder and
// the policy on a real fight without touching the judged band.
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ragerepress-live-'));
  const env = Object.assign({}, process.env, { REPO: REPO });
  function runDriver(extraEnv) {
    return execFileSync('node', [path.join(REPO, 'scripts', 'ragerepress-driver-20261106.js')], {
      cwd: REPO, env: Object.assign({}, env, extraEnv || {}),
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 600000,
    });
  }
  try {
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'baseline'), POLICY: 'baseline' });
    const baseFile = path.join(tmp, 'baseline', 'ragerepress-s55002-proof-baseline.json');
    check('live-baseline-wrote', fs.existsSync(baseFile));
    const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
    const w4 = (base.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    check('live-baseline-wave4-traces', w4.length >= 1, 'w4 traces=' + w4.length);
    check('live-baseline-traces-have-hits', w4.filter(function (x) { return (x.hits || []).length > 0; }).length >= 1);
    check('live-baseline-traces-have-turns', w4.filter(function (x) { return (x.turns || []).length > 0; }).length >= 1);
    check('live-baseline-all-traces-classified', w4.filter(function (x) { return AN.ENDINGS.indexOf(x.ending) >= 0; }).length === w4.length);
    check('live-baseline-zero-instrument-errors', (base.instrumentErrors || []).length === 0, JSON.stringify((base.instrumentErrors || []).slice(0, 3)));

    // Determinism: same seed, same policy, second run must be byte-identical.
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'baseline2'), POLICY: 'baseline' });
    const base2File = path.join(tmp, 'baseline2', 'ragerepress-s55002-proof-baseline.json');
    const b1 = fs.readFileSync(baseFile, 'utf8');
    const b2 = fs.readFileSync(base2File, 'utf8');
    check('live-determinism-identical', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);

    // Neutrality: instrument OFF must match ON on days/endReason/kill-log length.
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'off'), POLICY: 'baseline', RAGEREPRESS_OFF: '1' });
    const off = JSON.parse(fs.readFileSync(path.join(tmp, 'off', 'ragerepress-s55002-proof-baseline.json'), 'utf8'));
    check('live-neutrality-days', off.days === base.days, 'off=' + off.days + ' on=' + base.days);
    check('live-neutrality-end', off.endReason === base.endReason, 'off=' + off.endReason + ' on=' + base.endReason);
    check('live-neutrality-kills', (off.waveKillLog || []).length === (base.waveKillLog || []).length,
      'off=' + (off.waveKillLog || []).length + ' on=' + (base.waveKillLog || []).length);

    // Armed smoke: the ragerepress leg must strike in wave-4 fights and
    // never flee one (hold ground), with traces classified and no errors.
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-armed', OUTDIR: path.join(tmp, 'armed'), POLICY: 'ragerepress' });
    const armed = JSON.parse(fs.readFileSync(path.join(tmp, 'armed', 'ragerepress-s55002-proof-armed.json'), 'utf8'));
    const w4a = (armed.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    check('live-armed-wave4-traces', w4a.length >= 1, 'w4 traces=' + w4a.length);
    const armedStrikes = w4a.reduce(function (n, x) { return n + (x.verbs || []).filter(function (v) { return v.verb === 'strike' && v.ok; }).length; }, 0);
    check('live-armed-strikes-in-w4', armedStrikes >= 1, 'strikes=' + armedStrikes);
    const armedFlees = w4a.reduce(function (n, x) { return n + (x.verbs || []).filter(function (v) { return v.verb === 'flee'; }).length; }, 0);
    check('live-armed-never-flees-w4', armedFlees === 0, 'flees=' + armedFlees);
    check('live-armed-zero-instrument-errors', (armed.instrumentErrors || []).length === 0, JSON.stringify((armed.instrumentErrors || []).slice(0, 3)));
    check('live-armed-stats-strikes', (armed.ragerepressStats && armed.ragerepressStats.strikes) >= 1,
      JSON.stringify(armed.ragerepressStats));
    check('live-armed-stats-rage-counters-present',
      armed.ragerepressStats && typeof armed.ragerepressStats.ragePresses === 'number' &&
      typeof armed.ragerepressStats.rageRepresses === 'number',
      JSON.stringify(armed.ragerepressStats));
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
