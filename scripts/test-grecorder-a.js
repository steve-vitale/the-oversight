// test-grecorder-a.js — proof for sim-grecorder-a (G-class recorder
// victim identity). The vetattrition DIAG went NO-GO because the
// cascade recorder's deaths rows carried no vid and no veteran flag
// (23/69 G drops unresolvable). This test proves the fix:
//   §0  unit: annotateDeathVictims on a synthetic Game stub —
//       pyrrhic same-day kills count, later kills excluded, monster
//       rows null, person/villager kinds annotated.
//   §1  end-to-end, 2 smoke seeds (150d, competent-answercourt-b):
//       the new-recorder cascade output vs the vetfirst instrument on
//       the SAME seeds (separate child processes — never two harnesses
//       in one node process):
//       - every death row carries vid/veteran/w4kills/w5kills/maxWave
//         (nulls on monster rows);
//       - original fields byte-identical to raw samples.deaths rows;
//       - victim ids match vetfirst regDeaths row-for-row
//         (day + villagerId, both directions) with matching cause;
//       - veteran flags agree with vetfirst vetsW4 snapshots
//         (vid in some snapshot's killers with firstDay <= death day);
//       - w4/w5 kill counts and maxWave agree with the vetfirst-side
//         log-derived counts exactly;
//       - zero instrument errors on both sides.
// Runner sources are generated into /tmp (pid-unique) and spawned as
// child processes; the judged corpora are written by the driver itself
// into evidence/, never by this test.
// Usage: node scripts/test-grecorder-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { annotateDeathVictims } = require(path.join(REPO, 'scripts', 'cascade-driver-20261115'));

let pass = 0, fail = 0;
const failures = [];
function ok(cond, label, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(label + (detail ? ' — ' + detail : '')); console.error('FAIL: ' + label + (detail ? ' — ' + detail : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---------------- §0 unit: annotateDeathVictims ----------------
(function () {
  const stubGame = {
    state: {
      waveKillLog: [
        { d: 10, mid: 'herald', w: 4, by: 'alice', via: 'player' },
        { d: 20, mid: 'reunion', w: 4, by: 'alice', via: 'wild' },
        { d: 30, mid: 'eater', w: 4, by: 'alice', via: 'wild' }, // after death day 25: excluded
        { d: 25, mid: 'suburb', w: 5, by: 'bob', via: 'player' }, // pyrrhic same-day kill
        { d: 5, mid: 'gallowdeer', w: 1, by: 'carol', via: 'wild' }, // wave 1: never counts
        { d: 40, mid: 'herald', w: 4, by: null, via: 'wild' }, // unknown killer
      ],
    },
    data: { villagers: [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }] },
    getPerson: function (vid) { return { name: vid === 'alice' ? 'Alice A' : vid === 'bob' ? 'Bob B' : vid }; },
  };
  const rows = annotateDeathVictims([
    { day: 25, kind: 'villager', who: 'alice', cause: 'the wild', player: true },
    { day: 25, kind: 'villager', who: 'bob', cause: 'monster', player: false },
    { day: 12, kind: 'person', who: 'carol', cause: 'the wild', player: false },
    { day: 40, kind: 'monster', who: 'herald', cause: 'villager combat', player: false },
    { day: 3, kind: 'villager', who: 'dave', cause: 'starvation', player: false },
  ], stubGame);
  ok(rows.length === 5, '§0 row count');
  const a = rows[0];
  ok(a.vid === 'alice' && a.veteran === true, '§0 alice veteran', JSON.stringify(a));
  ok(a.w4kills === 2 && a.w5kills === 0 && a.maxWave === 4, '§0 alice counts (later kill excluded)', JSON.stringify(a));
  ok(a.name === 'Alice A', '§0 alice name via getPerson', JSON.stringify(a));
  ok(a.day === 25 && a.kind === 'villager' && a.who === 'alice' && a.cause === 'the wild' && a.player === true, '§0 alice original fields untouched');
  const b = rows[1];
  ok(b.veteran === true && b.w4kills === 1 && b.w5kills === 1 && b.maxWave === 5, '§0 bob pyrrhic same-day w5 kill counts (w5 is w4+)', JSON.stringify(b));
  const c = rows[2];
  ok(c.veteran === false && c.w4kills === 0 && c.w5kills === 0 && c.maxWave === 1, '§0 carol wave-1 kill never counts as veteran (maxWave 1 = highest kill wave)', JSON.stringify(c));
  const m = rows[3];
  ok(m.vid === null && m.veteran === null && m.w4kills === null && m.w5kills === null && m.maxWave === null, '§0 monster row nulls', JSON.stringify(m));
  const d = rows[4];
  ok(d.veteran === false && d.w4kills === 0 && d.name === 'dave', '§0 unknown villager: no kills, name falls back to vid', JSON.stringify(d));
  const noLog = annotateDeathVictims([{ day: 1, kind: 'villager', who: 'x', cause: 'the wild', player: false }], { state: {} });
  ok(noLog[0].veteran === false && noLog[0].w4kills === 0, '§0 missing waveKillLog: veteran false, not an error');
})();

// ---------------- §1 end-to-end: cascade vs vetfirst ----------------
const CASCADE_RUNNER = [
  "'use strict';",
  "const fs = require('fs'); const path = require('path');",
  "const REPO = process.env.REPO; const SEED = parseInt(process.env.SEED, 10);",
  "const POLICY = process.env.POLICY || 'competent-answercourt-b'; const OUT = process.env.OUT;",
  "const { oneRun } = require(path.join(REPO, 'scripts', 'cascade-driver-20261115'));",
  "(async function () {",
  "  const out = await oneRun(SEED, POLICY);",
  "  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\\n');",
  "  console.log(JSON.stringify({ seed: out.seed, days: out.days, deaths: out.deaths.length, errors: out.instrumentErrors.length }));",
  "})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });",
  "",
].join('\n');

const VETFIRST_RUNNER = [
  "'use strict';",
  "const fs = require('fs'); const path = require('path');",
  "const REPO = process.env.REPO; const SEED = parseInt(process.env.SEED, 10);",
  "const DAYS = parseInt(process.env.DAYS || '150', 10); const OUT = process.env.OUT;",
  "const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));",
  "const { answercourtPolicy } = require(path.join(REPO, 'scripts', 'policies', 'competent-answercourt-b'));",
  "const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));",
  "function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }",
  "(async function () {",
  "  const { Game } = await loadGame({ seed: SEED, mode: 'cascade-competent-answercourt-b', fullTelemetry: false });",
  "  const vf = VF.install(Game); const errors = []; let lastSnapDay = -1;",
  "  const wrapped = Object.assign({}, answercourtPolicy, { daily: function (Gm, ctx) {",
  "    try { return answercourtPolicy.daily(Gm, ctx); } finally {",
  "      try { const d = gday(Game); if (d !== lastSnapDay) { lastSnapDay = d; vf.snapshot(); } } catch (e) { errors.push('snapshot: ' + e.message); }",
  "    } } });",
  "  await setupGame(Game); let result = null;",
  "  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });",
  "  try { vf.snapshot(); } catch (e) {}",
  "  try { vf.uninstall(); } catch (e) { errors.push('uninstall: ' + e.message); }",
  "  fs.writeFileSync(OUT, JSON.stringify({ seed: SEED, regDeaths: vf.t.deaths, daily: vf.t.daily,",
  "    instrumentErrors: (vf.t.instrumentErrors || []).concat(errors),",
  "    samplesDeaths: ((result && result.samples) || {}).deaths || [] }, null, 2) + '\\n');",
  "  console.log(JSON.stringify({ seed: SEED, regDeaths: vf.t.deaths.length, snaps: vf.t.daily.length, errors: vf.t.instrumentErrors.length }));",
  "})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });",
  "",
].join('\n');

function runChild(runnerSrc, env) {
  const file = path.join('/tmp', 'grecorder-runner-' + process.pid + '-' + Math.random().toString(36).slice(2, 8) + '.js');
  fs.writeFileSync(file, runnerSrc);
  try {
    const r = spawnSync(process.execPath, [file], { env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: 900000, maxBuffer: 64 * 1024 * 1024 });
    if (r.error) return { ok: false, error: String(r.error) };
    if (r.status !== 0) return { ok: false, error: 'exit ' + r.status + ': ' + (r.stderr || r.stdout || '').slice(-2000) };
    return { ok: true, stdout: r.stdout };
  } finally { try { fs.unlinkSync(file); } catch (e) {} }
}

function logDerivedCounts(daily) {
  // Final snapshot's waveKillLog copy = end-of-run log.
  const last = daily && daily.length ? daily[daily.length - 1] : null;
  return (last && Array.isArray(last.waveKillLog)) ? last.waveKillLog : [];
}

const SMOKE_SEEDS = [100541, 100542];
for (const seed of SMOKE_SEEDS) {
  const tag = 'seed ' + seed;
  const casOut = path.join('/tmp', 'grecorder-cascade-' + process.pid + '-' + seed + '.json');
  const vfOut = path.join('/tmp', 'grecorder-vetfirst-' + process.pid + '-' + seed + '.json');
  const cas = runChild(CASCADE_RUNNER, { REPO: REPO, SEED: String(seed), POLICY: 'competent-answercourt-b', OUT: casOut });
  ok(cas.ok, '§1 ' + tag + ' cascade runner completes', cas.error || '');
  if (!cas.ok) continue;
  const vf = runChild(VETFIRST_RUNNER, { REPO: REPO, SEED: String(seed), DAYS: '150', OUT: vfOut });
  ok(vf.ok, '§1 ' + tag + ' vetfirst runner completes', vf.error || '');
  if (!vf.ok) continue;
  let casD, vfD;
  try { casD = JSON.parse(fs.readFileSync(casOut, 'utf8')); } catch (e) { ok(false, '§1 ' + tag + ' cascade output parses', String(e)); continue; }
  try { vfD = JSON.parse(fs.readFileSync(vfOut, 'utf8')); } catch (e) { ok(false, '§1 ' + tag + ' vetfirst output parses', String(e)); continue; }
  ok(Array.isArray(casD.instrumentErrors) && casD.instrumentErrors.length === 0, '§1 ' + tag + ' cascade zero instrument errors', JSON.stringify(casD.instrumentErrors));
  ok(Array.isArray(vfD.instrumentErrors) && vfD.instrumentErrors.length === 0, '§1 ' + tag + ' vetfirst zero instrument errors', JSON.stringify(vfD.instrumentErrors));

  // (a) new fields present with the right types on every row.
  let fieldBad = 0;
  for (const d of (casD.deaths || [])) {
    if (d.kind === 'villager' || d.kind === 'person') {
      if (typeof d.vid !== 'string' || d.vid !== d.who) fieldBad++;
      if (typeof d.veteran !== 'boolean') fieldBad++;
      if (!Number.isInteger(d.w4kills) || !Number.isInteger(d.w5kills)) fieldBad++;
      if (!(d.maxWave === null || Number.isInteger(d.maxWave))) fieldBad++;
      if (typeof d.name !== 'string') fieldBad++;
    } else {
      if (!(d.vid === null && d.veteran === null && d.w4kills === null && d.w5kills === null && d.maxWave === null)) fieldBad++;
    }
  }
  ok(fieldBad === 0, '§1 ' + tag + ' new fields present/typed on all ' + (casD.deaths || []).length + ' death rows', fieldBad + ' bad rows');

  // (b) original fields byte-identical to raw samples.deaths rows.
  const raw = (casD.samples && casD.samples.deaths) || [];
  const stripped = (casD.deaths || []).map(function (d) { return { day: d.day, kind: d.kind, who: d.who, cause: d.cause, player: d.player }; });
  const rawStripped = raw.map(function (d) { return { day: d.day, kind: d.kind, who: d.who, cause: d.cause, player: !!d.player }; });
  ok(eq(stripped, rawStripped), '§1 ' + tag + ' annotated rows keep original fields identical (' + stripped.length + ' rows)');

  // (c) victim ids match regDeaths row-for-row (day + villagerId, both ways) with matching cause.
  const casPeople = (casD.deaths || []).filter(function (d) { return d.kind === 'villager' || d.kind === 'person'; });
  const regPeople = (vfD.regDeaths || []).filter(function (d) { return d.villagerId; });
  const key = function (day, vid) { return day + '|' + vid; };
  const casSet = {};
  casPeople.forEach(function (d) { casSet[key(d.day, d.vid)] = d; });
  const regSet = {};
  regPeople.forEach(function (d) { regSet[key(d.day, d.villagerId)] = d; });
  const casOnly = Object.keys(casSet).filter(function (k) { return !regSet[k]; });
  const regOnly = Object.keys(regSet).filter(function (k) { return !casSet[k]; });
  ok(casOnly.length === 0 && regOnly.length === 0, '§1 ' + tag + ' victim ids match regDeaths row-for-row (' + casPeople.length + ' vs ' + regPeople.length + ')',
    'cascade-only: ' + JSON.stringify(casOnly.slice(0, 5)) + ' vetfirst-only: ' + JSON.stringify(regOnly.slice(0, 5)));
  let causeBad = 0;
  Object.keys(casSet).forEach(function (k) {
    if (regSet[k] && String(regSet[k].cause || '') !== String(casSet[k].cause || '')) causeBad++;
  });
  ok(causeBad === 0, '§1 ' + tag + ' death causes agree with regDeaths', causeBad + ' mismatches');

  // (d) veteran flags agree with vetsW4 snapshots; counts agree with the log.
  const vfLog = logDerivedCounts(vfD.daily);
  ok(vfLog.length > 0, '§1 ' + tag + ' vetfirst final waveKillLog non-empty (' + vfLog.length + ' entries)');
  function logCounts(vid, day) {
    let w4 = 0, w5 = 0, maxW = null;
    for (const e of vfLog) {
      if (!e || e.by !== vid) continue;
      if ((e.d | 0) > day) continue;
      const w = e.w | 0;
      if (w >= 4) w4++;
      if (w >= 5) w5++;
      if (maxW === null || w > maxW) maxW = w;
    }
    return { w4: w4, w5: w5, maxWave: maxW };
  }
  const snapVet = {}; // vid -> earliest firstDay it appears as a vetsW4 killer
  (vfD.daily || []).forEach(function (s) {
    const killers = (s.vetsW4 && s.vetsW4.killers) || [];
    killers.forEach(function (k) {
      if (snapVet[k.by] === undefined || k.firstDay < snapVet[k.by]) snapVet[k.by] = k.firstDay;
    });
  });
  let vetBad = 0, countBad = 0;
  const bornDead = [];
  for (const d of casPeople) {
    const snapVeteran = snapVet[d.vid] !== undefined && snapVet[d.vid] <= d.day;
    if (snapVeteran !== d.veteran) {
      // Born-dead (vetfirst's own case): the victim became a veteran in
      // the fight that killed them — their first w4+ kill is ON the
      // death day, after the day's snapshot, so no vetsW4 snapshot ever
      // shows them. Agreement iff the log's earliest w4+ kill day for
      // the vid equals the death day.
      if (d.veteran && !snapVeteran) {
        let firstW4 = null;
        for (const e of vfLog) {
          if (!e || e.by !== d.vid || (e.w | 0) < 4) continue;
          if (firstW4 === null || (e.d | 0) < firstW4) firstW4 = e.d | 0;
        }
        if (firstW4 === d.day) { bornDead.push({ vid: d.vid, name: d.name, day: d.day, cause: d.cause }); continue; }
      }
      vetBad++;
      console.error('VET-DISAGREE seed ' + seed + ': ' + JSON.stringify({ vid: d.vid, name: d.name, day: d.day, cause: d.cause, cascadeVeteran: d.veteran, snapFirstDay: snapVet[d.vid] === undefined ? null : snapVet[d.vid] }));
    }
    const lc = logCounts(d.vid, d.day);
    if (lc.w4 !== d.w4kills || lc.w5 !== d.w5kills || lc.maxWave !== d.maxWave) countBad++;
  }
  if (bornDead.length) console.log('seed ' + seed + ': born-dead veteran deaths (flagged veteran, never in a snapshot): ' + JSON.stringify(bornDead));
  ok(vetBad === 0, '§1 ' + tag + ' veteran flags agree with vetsW4 snapshots (' + casPeople.length + ' person deaths)', vetBad + ' disagreements');
  ok(countBad === 0, '§1 ' + tag + ' w4/w5 counts + maxWave agree with vetfirst log', countBad + ' disagreements');

  // (e) attached waveKillLog matches the vetfirst final log (same multiset).
  const casLog = (casD.waveKillLog || []).map(function (e) { return [e.d, e.mid, e.w, e.by].join('|'); }).sort();
  const vfLogKeys = vfLog.map(function (e) { return [e.d, e.mid, e.w, e.by].join('|'); }).sort();
  ok(eq(casLog, vfLogKeys), '§1 ' + tag + ' attached waveKillLog matches vetfirst final log (' + casLog.length + ' entries)');

  try { fs.unlinkSync(casOut); } catch (e) {}
  try { fs.unlinkSync(vfOut); } catch (e) {}
  console.log('seed ' + seed + ': deaths=' + (casD.deaths || []).length + ' people=' + casPeople.length +
    ' veterans=' + casPeople.filter(function (d) { return d.veteran; }).length +
    ' vetDeathsByCause=' + JSON.stringify(casPeople.filter(function (d) { return d.veteran; }).reduce(function (a, d) { a[d.cause || '?'] = (a[d.cause || '?'] || 0) + 1; return a; }, {})));
}

console.log('test-grecorder-a: ' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.error('FAILURES:\n' + failures.join('\n')); process.exitCode = 1; }
