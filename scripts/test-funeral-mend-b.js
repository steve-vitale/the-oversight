#!/usr/bin/env node
// scripts/test-funeral-mend-b.js — sim-funeral-mend-b proof: the funeral
// mend (hierarchy.js onLeaderDeath + _funeralMend ONLY).
//
// THE BUILD (see evidence/2026-11-14/sim-funeral-mend-b-prereg.md):
//   At the funeral, the village mourns together: the rite mends every
//   link the funeral shook (successionCrisis returned 'shaken'), 1,500
//   kcal of funeral feast per link from the pantry (the tend price),
//   regaining the -8 haircut in full when the pantry pays, proportionally
//   from a thin pantry, nothing when it is empty. The gain routes through
//   _trustGain with the mourning window lifted for the rite itself (the
//   SUCCGRACE-beat pattern); mourning, tribute moves and the neglect snap
//   stand. Voiced: the funeral names the dead, the mended fires and the
//   feast kcal; a shortfall is said aloud. Beat-pending links, peer-league
//   links, grieving links and broken links are skipped — a link gets the
//   beat OR the mend, never both. Flag FUNERALMEND, default ON; '0'
//   restores the old funeral exactly.
//   Counters live at state.village.funeralMendStats (funerals /
//   linksMended / kcalSpent), created only in the mend path — read RAW
//   here, never through a method (recorder lesson).
//
// Cases (one fixture, one process — harness rule: never two harnesses
// in one node process). Fixture pattern from scripts/test-holdbuild-b.js
// (mshipState links, stocked pantry); the funeral is driven directly
// with Game.onLeaderDeath(Game.villagerId). Links are seasoned (40+ days
// old) at encounter-realistic trust (42/45/48); subordinates are real
// other-village ids when setup provides them, so the voiced line names
// real fires.
//   mend-on        3 shaken links 42/45/48, full pantry -> all mended
//                  +8 (net trust unchanged), 4,500 kcal charged,
//                  counters 1/3/4500, voiced line names the dead + all
//                  three villages + the feast; mourning day+7 and the
//                  tribute press-down (4000->3000) still land.
//   mend-off       same fixture, FUNERALMEND=0 -> trusts 34/37/40,
//                  pantry untouched, no counters, no mend line (the
//                  funeral line itself still fires).
//   mend-thin      pantry 2,000 kcal -> A fully mended (+8), B partial
//                  (500 kcal -> +3), C unmended; spent 2,000; shortfall
//                  line names C's fire aloud.
//   mend-beat-skipped  B young (<21d): successionCrisis stages the
//                  grace beat (-8, pendingRenegotiation) and the mend
//                  skips B while A and C mend.
//   mend-grieving  B already inside its mourning window: no new haircut,
//                  no mend; A and C mend; B's trust and mourning stand.
//   mend-covenant-skipped  a covenant link shakes -10 through its own
//                  crisis beat; the mend never touches it; A/B/C mend.
// Static leg (in the 'all' runner, read-only): the tracked modification
// under src/js/ is exactly src/js/hierarchy.js.
// Usage: node scripts/test-funeral-mend-b.js [seed] [case]
//   No case (or 'all'): spawns one child process per case, aggregates,
//   exit 1 if any case fails. Prints one JSON line per case.
//   A single case prints one JSON line and exits 0 (pass) / 1 (fail).
'use strict';
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '7');
const kase = process.argv[3] || 'all';

function out(o) { console.log(JSON.stringify(o)); }

async function setup() {
  const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed, mode: 'funeralmend-b-' + kase, fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = (v.px == null ? 4 : v.px), hy = (v.py == null ? 4 : v.py);
  const npcs = (v.roster || []).filter(id => id !== Game.villagerId);
  if (v.assignments) for (const k of Object.keys(v.assignments)) delete v.assignments[k];
  Game._outdoorCrew = [];
  v.health = v.health || {};
  v.trust = v.trust || {};
  for (const id of (v.roster || [])) v.health[id] = 100;
  const day = (Game.state.scholar || {}).day || 0;
  const others = ((Game.state.otherVillages || []).map(function (x) { return x.id; })).filter(Boolean);
  const subId = function (i, fb) { return others[i] || fb; };
  const mkLink = (id, sub, trust, ageDays) => ({
    id, status: 'active', primary: 'haven', subordinate: sub,
    trust, day: day - (ageDays == null ? 40 : ageDays), history: [],
    tributeKcalPerWeek: 4000,
  });
  const stockPantry = (units) => {
    v.pantry = [{ itemId: 'grain-test', kcalEach: 1000, units, spoilDay: 99999 }];
  };
  const pantryKcal = () => ((v.pantry || []).reduce(function (t, it) { return t + (it.kcalEach || 0) * (it.units || 0); }, 0));
  const fmStats = () => {
    try { return JSON.parse(JSON.stringify((Game.state.village || {}).funeralMendStats || null)); } catch (e) { return null; }
  };
  const said = [];
  const origSay = Game.say;
  Game.say = function () {
    try { if (typeof arguments[0] === 'string') said.push(String(arguments[0])); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const ovName = (id) => { try { return Game._ovName ? Game._ovName(id) : id; } catch (e) { return id; } };
  return { Game, v, hx, hy, day, subId, mkLink, stockPantry, pantryKcal, fmStats, said, ovName };
}

function baseLinks(t, trusts) {
  const mship = t.Game.mshipState();
  mship.links = mship.links || [];
  const la = t.mkLink('flink-a', t.subId(0, 'village-a'), trusts[0]);
  const lb = t.mkLink('flink-b', t.subId(1, 'village-b'), trusts[1]);
  const lc = t.mkLink('flink-c', t.subId(2, 'village-c'), trusts[2]);
  mship.links.push(la, lb, lc);
  return { la, lb, lc };
}

async function runCase() {
  if (kase === 'mend-on' || kase === 'mend-off') {
    const t = await setup();
    const { la, lb, lc } = baseLinks(t, [42, 45, 48]);
    t.stockPantry(100);
    const beforePantry = t.pantryKcal();
    if (kase === 'mend-off') process.env.FUNERALMEND = '0';
    let err = null, ret = null;
    try { ret = t.Game.onLeaderDeath(t.Game.villagerId); } catch (e) { err = e && e.message; }
    const fm = t.fmStats();
    const mendLine = t.said.find(function (s) { return /funeral feast/.test(s); });
    const funeralLine = t.said.find(function (s) { return /is dead — and the dead hold no treaties/.test(s); });
    let pass;
    if (kase === 'mend-on') {
      pass = !err && !!funeralLine && !!mendLine
        && la.trust === 42 && lb.trust === 45 && lc.trust === 48
        && t.pantryKcal() === beforePantry - 4500
        && fm && fm.funerals === 1 && fm.linksMended === 3 && fm.kcalSpent === 4500
        && /4,500/.test(mendLine)
        && [la, lb, lc].every(function (l) { return t.ovName(t.Game._linkOther(l, 'haven')) && mendLine.indexOf(t.ovName(t.Game._linkOther(l, 'haven'))) !== -1; })
        && [la, lb, lc].every(function (l) { return l.mourningUntil === t.day + 7; })
        && [la, lb, lc].every(function (l) { return l.tributeKcalPerWeek === 3000; });
    } else {
      pass = !err && !!funeralLine && !mendLine
        && la.trust === 34 && lb.trust === 37 && lc.trust === 40
        && t.pantryKcal() === beforePantry && fm === null
        && [la, lb, lc].every(function (l) { return l.mourningUntil === t.day + 7; });
    }
    out({ seed, case: kase, pass, err, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      pantryBefore: beforePantry, pantryAfter: t.pantryKcal(), fm,
      mendLine: mendLine ? mendLine.slice(0, 200) : null, funeralLine: !!funeralLine,
      mourningA: la.mourningUntil, tributeA: la.tributeKcalPerWeek });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'mend-thin') {
    const t = await setup();
    const { la, lb, lc } = baseLinks(t, [42, 45, 48]);
    t.stockPantry(2); // 2,000 kcal: A full (1,500), B partial (500), C none
    let err = null;
    try { t.Game.onLeaderDeath(t.Game.villagerId); } catch (e) { err = e && e.message; }
    const fm = t.fmStats();
    const mendLine = t.said.find(function (s) { return /funeral feast/.test(s); });
    const shortLine = t.said.find(function (s) { return /could not feed/.test(s); });
    const pass = !err && !!mendLine && !!shortLine
      && la.trust === 42 && lb.trust === 40 && lc.trust === 40
      && t.pantryKcal() === 0
      && fm && fm.funerals === 1 && fm.linksMended === 2 && fm.kcalSpent === 2000
      && shortLine.indexOf(t.ovName(t.Game._linkOther(lc, 'haven'))) !== -1;
    out({ seed, case: kase, pass, err, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      pantryAfter: t.pantryKcal(), fm, mendLine: mendLine ? mendLine.slice(0, 200) : null,
      shortLine: shortLine ? shortLine.slice(0, 200) : null });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'mend-beat-skipped') {
    const t = await setup();
    const mship = t.Game.mshipState();
    mship.links = mship.links || [];
    const la = t.mkLink('flink-a', t.subId(0, 'village-a'), 42);
    const lb = t.mkLink('flink-b', t.subId(1, 'village-b'), 45, 10); // young: grace beat
    const lc = t.mkLink('flink-c', t.subId(2, 'village-c'), 48);
    mship.links.push(la, lb, lc);
    t.stockPantry(100);
    const beforePantry = t.pantryKcal();
    let err = null;
    try { t.Game.onLeaderDeath(t.Game.villagerId); } catch (e) { err = e && e.message; }
    const fm = t.fmStats();
    const pass = !err
      && la.trust === 42 && lc.trust === 48
      && lb.trust === 37 && !!lb.pendingRenegotiation // beat staged, mend skipped
      && t.pantryKcal() === beforePantry - 3000
      && fm && fm.funerals === 1 && fm.linksMended === 2 && fm.kcalSpent === 3000;
    out({ seed, case: kase, pass, err, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      beatB: !!lb.pendingRenegotiation, pantryAfter: t.pantryKcal(), fm });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'mend-grieving') {
    const t = await setup();
    const { la, lb, lc } = baseLinks(t, [42, 45, 48]);
    lb.mourningUntil = t.day + 7; // already grieving from an earlier death
    t.stockPantry(100);
    const beforePantry = t.pantryKcal();
    let err = null;
    try { t.Game.onLeaderDeath(t.Game.villagerId); } catch (e) { err = e && e.message; }
    const fm = t.fmStats();
    const pass = !err
      && la.trust === 42 && lc.trust === 48
      && lb.trust === 45 && lb.mourningUntil === t.day + 7 // no new haircut, no mend
      && t.pantryKcal() === beforePantry - 3000
      && fm && fm.funerals === 1 && fm.linksMended === 2 && fm.kcalSpent === 3000;
    out({ seed, case: kase, pass, err, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      mourningB: lb.mourningUntil, pantryAfter: t.pantryKcal(), fm });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'mend-covenant-skipped') {
    const t = await setup();
    const { la, lb, lc } = baseLinks(t, [42, 45, 48]);
    const mship = t.Game.mshipState();
    const cov = { id: 'flink-cov', status: 'active', kind: 'covenant',
      a: 'haven', b: t.subId(3, 'village-d'), trust: 45, day: t.day - 40, history: [] };
    mship.links.push(cov);
    t.stockPantry(100);
    const beforePantry = t.pantryKcal();
    let err = null;
    try { t.Game.onLeaderDeath(t.Game.villagerId); } catch (e) { err = e && e.message; }
    const fm = t.fmStats();
    const pass = !err
      && la.trust === 42 && lb.trust === 45 && lc.trust === 48
      && cov.trust === 35 && !!cov.pendingCovenantCrisis // its own crisis beat, mend skipped
      && t.pantryKcal() === beforePantry - 4500
      && fm && fm.funerals === 1 && fm.linksMended === 3 && fm.kcalSpent === 4500;
    out({ seed, case: kase, pass, err, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      trustCov: cov.trust, crisisCov: !!cov.pendingCovenantCrisis, pantryAfter: t.pantryKcal(), fm });
    process.exit(pass ? 0 : 1);
  }
  out({ seed, case: kase, pass: false, err: 'unknown case' });
  process.exit(2);
}

function runAll() {
  const cases = ['mend-on', 'mend-off', 'mend-thin', 'mend-beat-skipped', 'mend-grieving', 'mend-covenant-skipped'];
  const results = [];
  let failed = false;
  for (const c of cases) {
    try {
      const o = execFileSync('node', [path.join(repo, 'scripts', 'test-funeral-mend-b.js'), String(seed), c],
        { cwd: repo, encoding: 'utf8', timeout: 120000 });
      const line = (o || '').trim().split('\n').filter(Boolean).pop();
      const r = JSON.parse(line);
      results.push(r);
      if (!r.pass) failed = true;
    } catch (e) {
      const o = (e && e.stdout) || '';
      const line = String(o).trim().split('\n').filter(Boolean).pop();
      let r = null;
      try { r = JSON.parse(line); } catch (_) {}
      results.push(r || { seed, case: c, pass: false, err: String((e && e.message) || e).slice(0, 200) });
      failed = true;
    }
  }
  // Static leg: the tracked modification under src/js/ is exactly
  // hierarchy.js (or nothing, on a reverted tree — the leg's value is
  // confinement: no OTHER src/js file may be touched). Diff the branch
  // against its merge-base (not the worktree), so the leg still holds
  // once the build is committed.
  try {
    const base = execSync('git merge-base HEAD master', { cwd: repo, encoding: 'utf8' }).trim();
    const names = execSync(`git diff --name-only ${base} HEAD -- src/js/`, { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    const staticPass = names.length === 0 || (names.length === 1 && names[0] === 'src/js/hierarchy.js');
    results.push({ seed, case: 'static-src-diff', pass: staticPass, files: names });
    if (!staticPass) failed = true;
  } catch (e) {
    results.push({ seed, case: 'static-src-diff', pass: false, err: String((e && e.message) || e).slice(0, 200) });
    failed = true;
  }
  for (const r of results) console.log(JSON.stringify(r));
  console.log(JSON.stringify({ seed, case: 'all', pass: !failed, cases: results.map(r => r.case + ':' + (r.pass ? 'PASS' : 'FAIL')) }));
  process.exit(failed ? 1 : 0);
}

if (kase === 'all') runAll();
else runCase().catch(e => { console.error('FUNERALMEND-B FAILED:', (e && e.stack) || e); process.exit(1); });
