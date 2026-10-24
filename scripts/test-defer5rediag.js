#!/usr/bin/env node
// test-defer5rediag.js — proof for the defer5rediag instrument (arm
// sim-defer5-rediag, run fleshout-20261023T2217Z, axis scale-onramp).
//
// E1 RED->GREEN: classify() gates correctly on known SYNTHETIC bar
//    trajectories (never-met / met-then-lost / met-but-not-simultaneous /
//    gate-released / never-bound / pathological UNEXPLAINED).
// E2 byte-identical determinism: one real config run twice through the
//    harness — all judged fields byte-identical.
// E3 the C1 freshness gate: the sweep's banned blocks cover the task's
//    five named blocks + every other prior-corpus block, and the fresh
//    70111-70122 band passes.
// E4 w5gates-lib.js is UNMODIFIED vs git HEAD (the read-only instrument).
// E5 non-vacuous: the analyzer's denominator is non-empty on the real
//    corpus and the attribution recompute agrees with the stored vectors
//    (runs after the sweep; skips with a clear message if no corpus yet).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'defer5rediag-analyze'));

let fails = 0;
function check(name, cond, extra) {
  if (cond) console.log(`  PASS ${name}`);
  else { console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); fails++; }
}

// ---------- synthetic trajectory builder ----------
function synthTraceRow(o) {
  return Object.assign({ d: 180, uw: 3, raw: 250, capped: 250, peak: 3, l2: 6,
    r4: { armored: 3, armed: 5, tricks: 3, veterans: 1, short: [], ready: true },
    r5: { armored: 0, armed: 0, tricks: 0, veterans: 0, short: ['armored', 'armed', 'veterans'], ready: false },
    w4faced: 2 }, o);
}
function synthConfig(o) {
  return Object.assign({
    seed: 99999, base: 'leadfeast', maxWave: 4,
    defer5HeldDays: 40, defer4HeldDays: 5,
    overlapDays: 0, firstOverlapDay: null,
    gateVector: { attr: { binding: 'defer5' }, dist: { defer5: { armor: 4, weapons: 6, tricks: 0, veterans: 2 } } },
    gateTrace: [synthTraceRow({})],
    sensors5: {
      armored:  { release: null, peak: 0, lastMet: null },
      armed:    { release: null, peak: 0, lastMet: null },
      tricks:   { release: 60, peak: 12, lastMet: 180 },
      veterans: { release: null, peak: 0, lastMet: null },
    },
    sensors4: {},
  }, o);
}

function row(d, r5, capped, o) {
  return synthTraceRow(Object.assign({ d, capped,
    r5: Object.assign({ armored: 0, armed: 0, tricks: 0, veterans: 0, short: [], ready: false }, r5),
  }, o || {}));
}
function R5(a, m, t, v) {
  const met = a >= 4 && m >= 6 && t >= 3 && v >= 2;
  const short = [];
  if (a < 4) short.push('armored'); if (m < 6) short.push('armed');
  if (t < 3) short.push('tricks'); if (v < 2) short.push('veterans');
  return { armored: a, armed: m, tricks: t, veterans: v, short, ready: met };
}

function e1() {
  console.log('E1: classify() on known synthetic bar trajectories');
  // A: the coincidence trap — every bar met at some point, armor window
  // (d40-90) and veterans window (d110-130) disjoint, 0 overlap days.
  const A = synthConfig({
    gateTrace: [
      row(40, R5(4, 7, 12, 0), 250), row(90, R5(4, 7, 12, 0), 250),
      row(110, R5(0, 0, 12, 2), 250), row(130, R5(0, 0, 12, 2), 250),
      row(180, R5(0, 0, 12, 0), 250),
    ],
    gateVector: { attr: { binding: 'defer5' }, dist: { defer5: { armor: 4, weapons: 6, tricks: 0, veterans: 2 } } },
  });
  const cA = AN.classify(A);
  check('coincidence trap -> met-but-not-simultaneous', cA.channel === 'met-but-not-simultaneous', JSON.stringify(cA));

  // B: armor NEVER met (peak 3 < 4) -> capacity shortfall.
  const B = synthConfig({
    gateTrace: [
      row(40, R5(3, 7, 12, 0), 250), row(110, R5(3, 0, 12, 2), 250),
      row(180, R5(3, 0, 12, 0), 250),
    ],
    gateVector: { attr: { binding: 'defer5' }, dist: { defer5: { armor: 1, weapons: 6, tricks: 0, veterans: 2 } } },
  });
  const cB = AN.classify(B);
  check('never-met armor -> bar-never-met:armored', cB.channel === 'bar-never-met:armored', JSON.stringify(cB));

  // C: all four bars coincided d20-150, but capped<200 the whole window
  // (standing never crossed 200); veterans lost by end.
  const C = synthConfig({
    gateTrace: [
      row(20, R5(5, 8, 12, 2), 150), row(150, R5(5, 8, 12, 2), 150),
      row(160, R5(5, 8, 12, 0), 250), row(180, R5(5, 8, 12, 0), 250),
    ],
    gateVector: { attr: { binding: 'defer5' }, dist: { defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 2 } } },
  });
  const cC = AN.classify(C);
  check('overlap before standing -> overlap-before-standing', cC.channel === 'overlap-before-standing', JSON.stringify(cC));
  check('C: veterans flavor met-then-lost in bars', cC.bars && cC.bars.veterans === 'met-then-lost', JSON.stringify(cC.bars));

  // D: held mid-run (30 held days), door later opened -> gate-released.
  const D = synthConfig({ defer5HeldDays: 30, maxWave: 5,
    gateVector: { attr: { binding: 'unlocked' } },
    gateTrace: [row(180, R5(5, 8, 12, 2), 250, { uw: 5, peak: 5 })] });
  check('released door -> gate-released', AN.classify(D).channel === 'gate-released', JSON.stringify(AN.classify(D)));

  // E: never bound -> never-bound (excluded from the denominator).
  const E = synthConfig({ defer5HeldDays: 0, defer4HeldDays: 0,
    gateVector: { attr: { binding: 'w3rung' } },
    gateTrace: [row(40, R5(0, 0, 0, 0), 50, { uw: 2, raw: 50, capped: 50, peak: 2, l2: 2 })] });
  check('never bound -> never-bound', AN.classify(E).channel === 'never-bound', JSON.stringify(AN.classify(E)));

  // F: pathological — coincidence day WITH capped>=200 but end binding
  // still defer5 (engine would have released) -> UNEXPLAINED, never
  // silently absorbed.
  const F = synthConfig({
    gateTrace: [
      row(100, R5(5, 8, 12, 2), 250),
      row(180, R5(0, 0, 12, 0), 250),
    ],
    gateVector: { attr: { binding: 'defer5' }, dist: { defer5: { armor: 4, weapons: 6, tricks: 0, veterans: 2 } } },
  });
  check('pathological -> UNEXPLAINED', AN.classify(F).channel === 'UNEXPLAINED', JSON.stringify(AN.classify(F)));
}

function e3() {
  console.log('E3: C1 freshness gate');
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'defer5rediag-sweep.js'), 'utf8');
  const m = src.match(/BANNED = \[([\s\S]*?)\];/);
  check('sweep carries a BANNED list', !!m);
  if (!m) return;
  const nums = m[1].split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const ranges = [];
  for (let i = 0; i < nums.length; i += 2) ranges.push([nums[i], nums[i + 1]]);
  const covers = (lo, hi) => ranges.some(([a, b]) => lo >= a && hi <= b);
  // The task's five named blocks.
  check('bans 68901-68912', covers(68901, 68912));
  check('bans 68501-68508', covers(68501, 68508));
  check('bans 68401-68408', covers(68401, 68408));
  check('bans 65511-65522', covers(65511, 65522));
  check('bans every other prior block (66301-66316, 67501-67532, 92801-92816)', covers(66301, 66316) && covers(67501, 67532) && covers(92801, 92816));
  const fresh = (s) => !ranges.some(([a, b]) => s >= a && s <= b);
  check('fresh band 70111-70122 passes', [70111,70112,70113,70114,70115,70116,70117,70118,70119,70120,70121,70122].every(fresh));
  // Cross-check against actual perseed corpora: no s701* anywhere EXCEPT
  // this run's own corpus (perseed-defer5rediag — excluded).
  let hits = 0;
  try {
    hits = execSync(`find ${REPO}/evidence -path '*perseed*' -name 's701*.json' 2>/dev/null | grep -v perseed-defer5rediag | wc -l`).toString().trim() | 0;
  } catch (e) {}
  check('no s701*.json in any prior perseed corpus (own corpus excluded)', hits === 0, `hits=${hits}`);
}

function e4() {
  console.log('E4: w5gates-lib.js UNMODIFIED vs HEAD');
  let out = '';
  try { out = execSync(`git diff HEAD --stat -- scripts/w5gates-lib.js`, { cwd: REPO }).toString().trim(); } catch (e) { out = 'ERR:' + e.message; }
  check('no working-tree diff on w5gates-lib.js', out === '', out);
  const shaFile = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'w5gates-lib.js'))).digest('hex');
  const blob = execSync(`git show HEAD:scripts/w5gates-lib.js`, { cwd: REPO });
  const shaBlob = crypto.createHash('sha256').update(blob).digest('hex');
  check('sha256 matches HEAD blob', shaFile === shaBlob, `${shaFile.slice(0,12)} vs ${shaBlob.slice(0,12)}`);
}

async function e2() {
  console.log('E2: byte-identical determinism (one real config x2)');
  process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1';
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  process.env.SEATDRIVE = '0'; process.env.KILLDISC = '1';
  process.env.ARMORYDRIVE = '1'; process.env.ARMORVILLAGE = '1';
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
  const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));
  async function judged(seed) {
    const { Game } = await loadGame({ seed, mode: 'defer5rediag-det', fullTelemetry: false });
    const policy = AV.armedFor('leadfeast');
    const trace = [];
    const wrapped = Object.assign({}, policy, {
      daily(G, ctx) { try { trace.push(G5.dailyGateTrace(G)); } catch (e) {} return policy.daily(G, ctx); },
    });
    await setupGame(Game);
    let result;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: 180, manifest: undefined, sampleEvery: 30 }); });
    const gv = G5.gateVector(Game);
    return JSON.stringify({
      traceDays: trace.length, lastTrace: trace[trace.length - 1],
      binding: gv && gv.attr && gv.attr.binding,
      dist: gv && gv.dist,
      w4faced: gv && gv.w4faced, maxWave: result.maxWaveUnlocked, days: result.days,
      nKillLog: (Game.state.waveKillLog || []).length,
    });
  }
  const a = await judged(70111);
  const b = await judged(70111);
  check('two identical runs byte-identical on judged fields', a === b, 'judged fields differ');
}

function e5() {
  console.log('E5: non-vacuous corpus attribution');
  const dir = path.join(REPO, 'evidence', '2026-10-23', 'perseed-defer5rediag');
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.json')); } catch (e) {}
  if (!files.length) { console.log('  SKIP corpus not written yet (run the sweep first)'); return; }
  const corpus = AN.load();
  const denom = corpus.map(c => AN.classify(c)).filter(x => x.channel !== 'never-bound');
  check('denominator non-empty', denom.length > 0, `denom=${denom.length}`);
  check('attribution recompute agrees with stored vectors', denom.every(x => !x.mismatch), 'mismatches present');
  const unnamed = denom.filter(x => x.channel === 'UNEXPLAINED');
  check('0 unexplained configs', unnamed.length === 0, `unexplained=${unnamed.length}`);
}

(async () => {
  e1(); e3(); e4();
  await e2();
  e5();
  console.log(fails === 0 ? 'ALL GATES GREEN' : `${fails} GATE(S) RED`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('TEST FAILED:', (e && e.stack) || e); process.exit(1); });
