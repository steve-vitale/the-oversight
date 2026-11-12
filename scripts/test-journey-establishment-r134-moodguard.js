#!/usr/bin/env node
// test-journey-establishment-r134-moodguard.js — proof test for the r134
// mood-guard pool rewrite (journey-establishment r134 2026-11-12).
//
// r133's people check: "Something in them almost softens — then doesn't.
// Not yet." 11x and "They hear the warmth in it." 11x, both rising, firing
// as generic go-on responses — e.g. after a gossip line about Joyce humming
// at the beans, where nothing soft was happening. Mechanism (read from
// code, src/js/convo-mood.js convoMoodShift guard branch): when a
// villager's recent lived memory (last 5 days) holds a hurt, the FIRST
// warming move (+mood consequence) per conversation is absorbed — mood
// does not move — and one of a 2-line pool is queued as a held beat,
// flushed after the turn's line. The defect: a small agree (warming by
// the numbers) gets the same heavy "almost softens" line as a real
// comfort — the beat claims an emotional near-miss the scene didn't earn —
// and the 2-line pool recurred verbatim across villagers (11x each).
//
// The fix (src/js/convo-mood.js, guard pool only): 6 observational lines
// that describe the villager holding the moment at arm's length instead
// of claiming softening/warmth the exchange didn't contain. Same trigger,
// same once-per-conversation, same absorbed move — only the spoken lines
// change. The mechanic passes no weight, so no line claims a particular
// weight of feeling.
//
// This test proves the fix:
//   source : the guard pool is exactly the 6 new lines (read through the
//            SAME regex the analyzer uses to count them — a pool change
//            without a counter change fails here first); neither old line
//            survives in the pool call; the fallback is the new line; the
//            grace pool is untouched; the once-per-conversation guard and
//            the band-crossing path are intact; the driver is the r133
//            driver with a tag rename only.
//   live   : on a harness-loaded Game, per seed (2501, 2502, 2503 — each
//            in its own process, one harness per process): a villager
//            with a recent hurt absorbs the first warming move (mood
//            unchanged, guard beat is one of the 6 new lines — printed,
//            read by the author per §4); the second warming move lands;
//            a villager with no hurt warms immediately; a villager with
//            recent kindness absorbs the first cooling move (grace beat,
//            mood unchanged); flushing the beat changes no mood or trust
//            (the beat is display-only).
//   analyzer: synthetic corpora through the REAL r134 analyzer prove the
//            Q2a/Q2b verdict lines (GO at equal per-convo rates + 6
//            distinct lines; NO-GO on breadth when the AFTER panel uses
//            only 1 distinct line) and the REGRESSION-CLEAN line on
//            identical corpora.
//   det-gate: the r134 driver run twice on 5d seed 2501 (HUNTSTAFF=2)
//            reproduces byte-identical funnel keys AND practice snapshots
//            AND cook/mend logs (the pool change draws one RNG pick per
//            guard beat either way, so trajectories cannot diverge on the
//            line text); granting rows still carry the preserver-units
//            fields (the r133 cap instrumentation is intact).
//
// Usage: node scripts/test-journey-establishment-r134-moodguard.js
//        (live-seed mode, spawned by the main mode:
//         node scripts/test-journey-establishment-r134-moodguard.js --live-seed 2501)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r134-20261112.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r134-20261112.js');
const MOOD_SRC = fs.readFileSync(path.join(ROOT, 'src', 'js', 'convo-mood.js'), 'utf8');
const DRIVER_SRC = fs.readFileSync(DRIVER, 'utf8');

const NEW_POOL = [
  'They hear you out, but something in them stays guarded.',
  'They nod — and keep their distance, for now.',
  'The moment passes without landing. Not yet.',
  'They take it in and give nothing back. Not yet.',
  'Something in them stays shut, for now.',
  'They let the words sit there, unanswered.',
];
const NEW_FALLBACK = 'Not yet. They keep their distance.';
const OLD_LINES = [
  "Something in them almost softens — then doesn't. Not yet.",
  "They hear the warmth in it. They're not ready to let it in.",
];
// The grace pool (convo-mood.js, untouched by this fix) — the live grace
// check asserts the beat is one of these 4 lines.
const GRACE_POOL = [
  "That could have stung. They let it pass — you've been kind before.",
  'They give you the benefit of the doubt. This time.',
  "That could have stung. They've known you long enough to let it pass.",
  "A friend doesn't flinch at one sharp word. They let it go.",
];

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function finish() {
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}

// The analyzer's pool-extraction regex, verbatim (scripts/
// analyze-journey-establishment-r134-20261112.py _new_guard_counts).
function poolFromSource(src) {
  const m = src.match(/convoPickCycle\(vid, 'moodguard', \[(.*?)\]\)/s);
  if (!m) return null;
  const found = [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1].replace(/\\'/g, "'"));
  return found;
}

// ================= live-seed mode (one harness per process) =================
if (process.argv.includes('--live-seed')) {
  const seed = parseInt(process.argv[process.argv.indexOf('--live-seed') + 1], 10);
  (async () => {
    const { loadGame, setupGame } = require('./sim-harness');
    let Game;
    try {
      ({ Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: false }));
      await setupGame(Game);
    } catch (e) {
      check(`live-seed-${seed}-loads`, false, 'loadGame/setupGame: ' + (e && e.message));
      finish();
      return;
    }
    check(`live-seed-${seed}-loads`, !!Game && typeof Game.convoMoodShift === 'function');
    const day = () => (Game.state.scholar || {}).day || 1;
    const living = (Game.state.village.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
    if (living.length < 3) { check(`live-seed-${seed}-has-villagers`, false, `only ${living.length} living villagers`); finish(); return; }
    const mem = (vid) => {
      Game.state.village.memory = Game.state.village.memory || {};
      Game.state.village.memory[vid] = Game.state.village.memory[vid] || [];
      return Game.state.village.memory[vid];
    };
    const trustOf = (vid) => ((Game.state.village.trust || {})[vid] ?? 10);
    function openConvo(vid) {
      const r = Game.startConvo(vid);
      const c = Game.convoGet(vid);
      return { r, c, ok: !!(c && c.active) };
    }
    // --- GUARD: recent hurt absorbs the first warming move ---
    try {
      const vid = living[0];
      const { c, ok } = openConvo(vid);
      check(`live-seed-${seed}-guard-convo-opens`, ok);
      if (!ok) { finish(); return; }
      mem(vid).push({ t: 'promise_broken', day: day() });
      check(`live-seed-${seed}-guard-receptivity-negative`, Game.convoMoodReceptivity(vid) < 0,
        `receptivity=${Game.convoMoodReceptivity(vid)}`);
      const mood0 = c.mood || 0;
      const trust0 = trustOf(vid);
      Game.convoMoodShift(vid, +1);
      const beat = c.moodBeat;
      console.log(`GUARD LINE seed ${seed}: ${beat}`);
      check(`live-seed-${seed}-guard-absorbs-first-warming-move`, (c.mood || 0) === mood0 && c.moodGuardUsed === true,
        `mood ${mood0} -> ${c.mood}, guardUsed=${c.moodGuardUsed}`);
      check(`live-seed-${seed}-guard-beat-is-new-pool-line`, NEW_POOL.indexOf(beat) !== -1, `beat=${JSON.stringify(beat)}`);
      check(`live-seed-${seed}-guard-beat-not-old-line`, OLD_LINES.indexOf(beat) === -1, `beat=${JSON.stringify(beat)}`);
      // Flushing the beat is display-only: no mood or trust moves.
      Game.convoMoodFlush(vid);
      check(`live-seed-${seed}-guard-flush-changes-nothing`, (c.mood || 0) === mood0 && trustOf(vid) === trust0,
        `mood ${c.mood} trust ${trustOf(vid)}`);
      check(`live-seed-${seed}-guard-beat-held`, (c.heldBeats || []).some(h => h.text === beat && h.moodBeat === true),
        `heldBeats=${JSON.stringify((c.heldBeats || []).map(h => h.text))}`);
      // Second warming move lands (guard spent).
      Game.convoMoodShift(vid, +1);
      check(`live-seed-${seed}-guard-second-move-lands`, (c.mood || 0) === mood0 + 1,
        `mood ${mood0} -> ${c.mood}`);
      try { Game.endConvo(vid, 'done'); } catch (e) {}
    } catch (e) {
      check(`live-seed-${seed}-guard`, false, 'guard checks threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
    }
    // --- NO HURT: warming move lands immediately ---
    try {
      const vid = living[1];
      const { c, ok } = openConvo(vid);
      if (!ok) { check(`live-seed-${seed}-nohurt-convo-opens`, false); }
      else {
        const mood0 = c.mood || 0;
        Game.convoMoodShift(vid, +1);
        check(`live-seed-${seed}-nohurt-warms-immediately`, (c.mood || 0) === mood0 + 1 && !c.moodGuardUsed,
          `mood ${mood0} -> ${c.mood}, guardUsed=${c.moodGuardUsed}`);
        check(`live-seed-${seed}-nohurt-no-guard-beat`, !c.moodBeat || NEW_POOL.indexOf(c.moodBeat) === -1,
          `beat=${JSON.stringify(c.moodBeat)}`);
        try { Game.endConvo(vid, 'done'); } catch (e) {}
      }
    } catch (e) {
      check(`live-seed-${seed}-nohurt`, false, 'no-hurt checks threw: ' + (e && e.message));
    }
    // --- GRACE: recent kindness absorbs the first cooling move ---
    try {
      const vid = living[2];
      const { c, ok } = openConvo(vid);
      if (!ok) { check(`live-seed-${seed}-grace-convo-opens`, false); }
      else {
        mem(vid).push({ t: 'gift', day: day() });
        check(`live-seed-${seed}-grace-receptivity-positive`, Game.convoMoodReceptivity(vid) > 0,
          `receptivity=${Game.convoMoodReceptivity(vid)}`);
        const mood0 = c.mood || 0;
        Game.convoMoodShift(vid, -1);
        const beat = c.moodBeat;
        console.log(`GRACE LINE seed ${seed}: ${beat}`);
        check(`live-seed-${seed}-grace-absorbs-first-cooling-move`, (c.mood || 0) === mood0 && c.moodGraceUsed === true,
          `mood ${mood0} -> ${c.mood}, graceUsed=${c.moodGraceUsed}`);
        check(`live-seed-${seed}-grace-beat-is-grace-pool-line`, typeof beat === 'string' && GRACE_POOL.indexOf(beat) !== -1,
          `beat=${JSON.stringify(beat)}`);
        try { Game.endConvo(vid, 'done'); } catch (e) {}
      }
    } catch (e) {
      check(`live-seed-${seed}-grace`, false, 'grace checks threw: ' + (e && e.message));
    }
    finish();
  })();
  return;
}

// ================= main mode: source checks =================
const pool = poolFromSource(MOOD_SRC);
check('A analyzer-regex-finds-guard-pool', Array.isArray(pool), 'moodguard call not found by the analyzer regex');
check('B guard-pool-is-six-new-lines', Array.isArray(pool) && pool.length === 6 &&
  NEW_POOL.every(l => pool.indexOf(l) !== -1),
  `pool=${JSON.stringify(pool)}`);
check('C guard-pool-has-no-softens-or-warmth', Array.isArray(pool) &&
  !pool.some(l => /soften|warmth/i.test(l)), `pool=${JSON.stringify(pool)}`);
check('D old-lines-gone-from-guard-pool', Array.isArray(pool) &&
  OLD_LINES.every(l => pool.indexOf(l) === -1), `pool=${JSON.stringify(pool)}`);
check('E guard-fallback-is-new-line', MOOD_SRC.includes(`|| '${NEW_FALLBACK}'`),
  'fallback line not found');
check('F grace-pool-untouched', /That could have stung\. They let it pass/.test(MOOD_SRC) &&
  /They give you the benefit of the doubt\. This time\./.test(MOOD_SRC));
check('G guard-once-per-conversation-intact', /if \(delta > 0 && rec < 0 && !c\.moodGuardUsed\)/.test(MOOD_SRC) &&
  /c\.moodGuardUsed = true/.test(MOOD_SRC) &&
  /c\.moodBeat = this\.convoPickCycle\(vid, 'moodguard'/.test(MOOD_SRC));
check('H band-crossing-path-intact', /const before = bandOf\(c\.mood \|\| 0\)/.test(MOOD_SRC) &&
  /if \(before !== after\) c\.moodBeat = this\.convoMoodBeat\(vid, before, after\)/.test(MOOD_SRC));
check('I driver-is-r133-clone-tag-rename', /TAG=r134-after/.test(DRIVER_SRC) &&
  /const TAG = process\.env\.TAG \|\| 'r134'/.test(DRIVER_SRC) &&
  /withHuntStaff\(withDelegate\(competent, 'competent-delegate'\), 'competent-hunt'\)/.test(DRIVER_SRC));

// ================= analyzer synthetic corpora (r133 pattern) =================
const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
const SEEDS16 = [2501, 2502, 2503, 2504, 2505, 2506, 2507, 2508, 2509, 2510, 2511, 2512, 2513, 2514, 2515, 2516];
function villager(id, name, occ, comp, prac, spec, food, skills, alive) {
  const c = {}, p = {}, s = {}, f = {};
  for (const t of TASKS) { c[t] = comp[t] != null ? comp[t] : 1.0; p[t] = (prac && prac[t]) || 0; }
  for (const t of SPECS) { s[t] = (spec && spec[t] != null) ? spec[t] : 0; f[t] = (food && food[t]) || 0; }
  return { id, name, alive: alive !== false, occ, competence: c, practice: p, specialist: s, foodXp: f, npcSkills: (skills || []).slice() };
}
function snap(day, villagers) { return villagers ? { day, snap: villagers } : null; }
function dailyRows() {
  const rows = [];
  for (let d = 2; d <= 43; d++) rows.push({ day: d, alive: 8, roster: 12, pantryKcal: 20000, over: false, wave: 1, ledger2: 0 });
  return rows;
}
function baseSeed(seed, practice) {
  return { seed, run: 'r134-after', days: 42, endDay: 43, gameOver: false, startCensus: [],
    holdingsStart: [], holdingsEnd: [], practice: practice || { d1: null, d14: null, d28: null, dEnd: null },
    playerAbilitiesEnd: [], aliveAt40: 8, aliveEnd: 8, waveReached: 1, pantryKcalEnd: 20000,
    deaths: [{ day: 20, who: 'X', cause: 'monster', kind: 'monster', player: false }],
    census: [], daily: dailyRows(), matTrace: [], craftLog: [], npcCraftLog: [],
    huntLog: [], careLog: [], healerLog: [], treatLog: [], cookLog: [], mendLog: [],
    huntStaff: { layerOn: true, prepOn: true, assignments: 0, assignLog: [], refusalLog: [], woundLog: [], prepLog: [] },
    huntEligEnd: [], huntEligEver: [], leanTrace: [],
    guardrails: { deaths: 1, popAlive: 8, pantryKcal: 20000 }, c3: { starvationDeaths: 0 },
    playerPackArmor: [], playerEquipped: [], playerRecipes: {},
    contestTele: [], contestCounts: {}, waveSysLines: [], teleTypes: {}, skillRows: [],
    skillCounts: {}, teachDays: [], teleAll: [], playerCodexSkills: {}, avCraftEnd: {} };
}
function convoTxt(lines, tag) {
  // 4 held convos per seed; guard lines appear as THEM lines after a YOU pick.
  let out = `=== ${tag} PEOPLE CHECK (4 held convos, end of run) ===\n`;
  const names = [['Ana', 'v1', 'forager'], ['Ben', 'v2', 'cook'], ['Cid', 'v3', 'smith'], ['Dee', 'v4', 'hunter']];
  for (const [nm, id, occ] of names) {
    out += `\n-- ${nm} (${id}) occ=${occ} --\nOPENING: hello\n`;
    for (const ln of lines) {
      out += `YOU: [agree] yes\nTHEM: ${ln}\n`;
    }
    out += `(ended by engine)\nclosing: goodbye\n`;
  }
  return out;
}
function corpus(dir, afterLines) {
  // BEFORE (r134-before) and AFTER (r134-after) JSONs are IDENTICAL — the
  // regression must read CLEAN. Only the convo files differ: BEFORE
  // carries the 2 old lines, AFTER carries the supplied lines.
  // (Amendment 1: the analyzer's BEFORE tag is r134-before, not
  // r133-after — the test's synthetic corpora must write the same tag
  // the analyzer loads, or BEFORE reads as 0 convos / missing JSONs.)
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  for (const seed of SEEDS16) {
    const practice = mk();
    fs.writeFileSync(path.join(dir, `journey-establishment-r134-before-seed${seed}.json`), JSON.stringify(baseSeed(seed, practice)));
    fs.writeFileSync(path.join(dir, `journey-establishment-r134-after-seed${seed}.json`), JSON.stringify(baseSeed(seed, practice)));
    // BEFORE: 2 old lines, 1 each per convo = 8 lines / 4 convos per seed.
    fs.writeFileSync(path.join(dir, `journey-establishment-r134-before-convo-seed${seed}.txt`), convoTxt(OLD_LINES, 'r134-before'));
    // AFTER: the supplied lines, 1 each per convo (same count, same rate).
    fs.writeFileSync(path.join(dir, `journey-establishment-r134-after-convo-seed${seed}.txt`), convoTxt(afterLines, 'r134-after'));
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r134-moodguard-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
// GO corpus: AFTER uses all 6 new lines (rotated across seeds so the
// panel sees every line), same per-convo rate as BEFORE (2 lines/convo).
withDir((dir) => {
  // Rewrite the AFTER convo files per seed to rotate the pool: seed i
  // uses lines starting at i so all 6 appear across the panel.
  corpus(dir, NEW_POOL.slice(0, 2));
  for (let i = 0; i < SEEDS16.length; i++) {
    const seed = SEEDS16[i];
    const rot = [NEW_POOL[i % 6], NEW_POOL[(i + 1) % 6]];
    fs.writeFileSync(path.join(dir, `journey-establishment-r134-after-convo-seed${seed}.txt`), convoTxt(rot, 'r134-after'));
  }
  const out = runAnalyzer(dir);
  check('J analyzer-go-corpus-q2a', /Q2a GUARD COUNT: per-convo ratio AFTER\/BEFORE=1\.00 \(bar 0\.75-1\.25\) -> GO/.test(out), out.slice(out.indexOf('Q2 GUARD COUNTER')));
  check('K analyzer-go-corpus-q2b', /Q2b BREADTH: distinct guard lines AFTER=6 \(bar >=4\) -> GO/.test(out), out.slice(out.indexOf('Q2 GUARD COUNTER')));
  check('L analyzer-go-corpus-q2-verdict', /Q2 verdict: GO/.test(out), out.slice(out.indexOf('Q2 GUARD COUNTER')));
  check('M analyzer-go-corpus-regression-clean', /REGRESSION verdict: CLEAN/.test(out), out.slice(out.indexOf('REGRESSION verdict')));
});
// NO-GO corpus (breadth): AFTER uses only 1 distinct new line.
withDir((dir) => {
  corpus(dir, [NEW_POOL[0]]);
  const out = runAnalyzer(dir);
  check('N analyzer-nogo-corpus-q2b', /Q2b BREADTH: distinct guard lines AFTER=1 \(bar >=4\) -> NO-GO/.test(out), out.slice(out.indexOf('Q2 GUARD COUNTER')));
  check('O analyzer-nogo-corpus-q2-verdict', /Q2 verdict: NO-GO/.test(out), out.slice(out.indexOf('Q2 GUARD COUNTER')));
});

// ================= live seeds (subprocesses, one harness each) =================
for (const seed of [2501, 2502, 2503]) {
  try {
    const out = execFileSync(process.execPath, [__filename, '--live-seed', String(seed)],
      { encoding: 'utf8', timeout: 600000, cwd: ROOT });
    const m = out.match(/(\d+) passed, (\d+) failed/);
    const ok = m && parseInt(m[2], 10) === 0;
    check(`P live-seed-${seed}-green`, ok, out);
    // Sense-read (§4): the guard + grace lines the test printed.
    for (const line of out.split('\n')) {
      if (line.startsWith('GUARD LINE') || line.startsWith('GRACE LINE')) console.log('  ' + line);
    }
  } catch (e) {
    check(`P live-seed-${seed}-green`, false, 'live-seed subprocess failed: ' + (e && e.message) + '\n' + (e && e.stdout || ''));
  }
}

// ================= det-gate: r134 driver twice, 5d seed 2501 =================
(function detGate() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r134-detgate-'));
  try {
    const run = (tag) => {
      const env = Object.assign({}, process.env, { SEEDS: '2501', DAYS: '5', TAG: tag, EVID: dir, HUNTSTAFF: '2' });
      execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
      return JSON.parse(fs.readFileSync(path.join(dir, `journey-establishment-${tag}-seed2501.json`), 'utf8'));
    };
    let a, b;
    try { a = run('r134-detgate-a'); } catch (e) { check('Q det-gate-first-run', false, 'first driver run exit/timeout: ' + (e && e.message)); return; }
    try { b = run('r134-detgate-b'); } catch (e) { check('Q det-gate-second-run', false, 'second driver run exit/timeout: ' + (e && e.message)); return; }
    check('Q det-gate-both-runs', !!a && !!b);
    const strip = (o) => { const c = Object.assign({}, o); delete c.run; return c; };
    check('R det-gate-outputs-identical', JSON.stringify(strip(a)) === JSON.stringify(strip(b)),
      'two runs of the same driver/seed produce byte-identical JSON (minus the run tag)');
    const keys = ['endDay', 'aliveEnd', 'aliveAt40', 'waveReached', 'pantryKcalEnd'];
    const diffs = [];
    for (const k of keys) if (a[k] !== b[k]) diffs.push(`${k}: run-a=${a[k]} run-b=${b[k]}`);
    if (JSON.stringify(a.practice) !== JSON.stringify(b.practice)) diffs.push('practice snapshots differ');
    if (JSON.stringify(a.cookLog) !== JSON.stringify(b.cookLog)) diffs.push('cookLog differs');
    if (JSON.stringify(a.mendLog) !== JSON.stringify(b.mendLog)) diffs.push('mendLog differs');
    if (JSON.stringify(a.deaths) !== JSON.stringify(b.deaths)) diffs.push('deaths differ');
    if (JSON.stringify(a.guardrails) !== JSON.stringify(b.guardrails)) diffs.push('guardrails differ');
    check('S det-gate-funnel-practice-logs-identical', diffs.length === 0, diffs.join('; ') || 'funnel/practice/cookLog/mendLog/deaths/guardrails identical');
    check('T det-gate-snapshots-present', !!b.practice && !!b.practice.d1 && b.practice.d1.snap.length > 0 && !!b.practice.dEnd,
      `practice keys=${Object.keys(b.practice || {})}`);
    // r133 cap instrumentation intact: granting rows carry units fields.
    const granting = (b.cookLog || []).filter(r => (r.fxPreserverAfter || 0) > (r.fxPreserverBefore || 0));
    const missing = granting.filter(r => r.fxPreserverUnitsAfter == null);
    check('U det-gate-units-fields-present', missing.length === 0,
      `${granting.length} granting rows, ${missing.length} missing units fields`);
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
})();

finish();
