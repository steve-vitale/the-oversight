#!/usr/bin/env node
// scripts/test-journey-crisis-r216-funeral-partial-20261115.js — journey-crisis
// r216 proof: the funeral-mend voice must not over-claim on a partial
// payment (panel finding: seed 14461 d96 600 kcal -> +3, d110 1,000 kcal
// -> +5, seed 14464 d71 900 kcal/link -> +5 each — all three public lines
// said "(Trust mended — the -8 bought back with grain.)" while the
// mechanics restored only part of the -8; the ledger note records the
// true gain, the public line does not).
//
// THE FIX (hierarchy.js _funeralMend ONLY): when every mended link got
// the full +8, the line stays verbatim. When any mended link was partial,
// the line states the true total gain and does not claim the full -8:
// "(Trust +N — the feast could not buy back the full -8.)"
//
// Fixture pattern from scripts/test-funeral-mend-b.js (same setup,
// same 3-link shape); the funeral is driven directly with
// Game.onLeaderDeath(Game.villagerId).
//   partial-claim   pantry 2,000 kcal (A full +8, B partial 500 -> +3,
//                   C shorted): the mend line must NOT claim "-8 bought
//                   back" and MUST carry the true total gain (+11).
//   partial-single  pantry 600 kcal, 1 shaken link (the 14461 d96 shape):
//                   gain +3; the mend line must NOT claim "-8 bought back"
//                   and MUST carry "+3".
//   full-claim      pantry 100,000 kcal (control): all three +8; the mend
//                   line keeps the verbatim "-8 bought back" claim.
// Usage: node scripts/test-journey-crisis-r216-funeral-partial-20261115.js [seed] [case]
//   No case (or 'all'): spawns one child process per case, aggregates,
//   exit 1 if any case fails. Prints one JSON line per case.
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '7');
const kase = process.argv[3] || 'all';

function out(o) { console.log(JSON.stringify(o)); }

async function setup() {
  const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed, mode: 'funeralpartial-r216-' + kase, fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
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
  const said = [];
  const origSay = Game.say;
  Game.say = function () {
    try { if (typeof arguments[0] === 'string') said.push(String(arguments[0])); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const ovName = (id) => { try { return Game._ovName ? Game._ovName(id) : id; } catch (e) { return id; } };
  return { Game, v, day, subId, mkLink, stockPantry, pantryKcal, said, ovName };
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
  if (kase === 'partial-claim') {
    const t = await setup();
    const { la, lb, lc } = baseLinks(t, [42, 45, 48]);
    t.stockPantry(2); // 2,000 kcal: A full (1,500), B partial (500), C none
    let err = null;
    try { t.Game.onLeaderDeath(t.Game.villagerId); } catch (e) { err = e && e.message; }
    const mendLine = t.said.find(function (s) { return /funeral feast/.test(s); });
    // Mechanics: A 42 (full +8), B 40 (45-8+3), C 40 (48-8, unmended).
    // Voice: total gain +11; the line must NOT claim the full -8.
    const pass = !err && !!mendLine
      && la.trust === 42 && lb.trust === 40 && lc.trust === 40
      && !/-8 bought back/.test(mendLine)
      && /\+11/.test(mendLine);
    out({ seed, case: kase, pass, err, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      mendLine: mendLine ? mendLine.slice(0, 260) : null });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'partial-single') {
    const t = await setup();
    const mship = t.Game.mshipState();
    mship.links = mship.links || [];
    const la = t.mkLink('flink-a', t.subId(0, 'village-a'), 42);
    mship.links.push(la);
    // 600 kcal in the pantry: the single link gets 600 -> +3 (the 14461 d96 shape).
    t.v.pantry = [{ itemId: 'grain-test', kcalEach: 100, units: 6, spoilDay: 99999 }];
    let err = null;
    try { t.Game.onLeaderDeath(t.Game.villagerId); } catch (e) { err = e && e.message; }
    const mendLine = t.said.find(function (s) { return /funeral feast/.test(s); });
    // Mechanics: A 37 (42-8+3). Voice: must carry +3, must not claim -8.
    const pass = !err && !!mendLine
      && la.trust === 37
      && !/-8 bought back/.test(mendLine)
      && /\+3/.test(mendLine);
    out({ seed, case: kase, pass, err, trustA: la.trust,
      mendLine: mendLine ? mendLine.slice(0, 260) : null });
    process.exit(pass ? 0 : 1);
  }
  if (kase === 'full-claim') {
    const t = await setup();
    const { la, lb, lc } = baseLinks(t, [42, 45, 48]);
    t.stockPantry(100);
    let err = null;
    try { t.Game.onLeaderDeath(t.Game.villagerId); } catch (e) { err = e && e.message; }
    const mendLine = t.said.find(function (s) { return /funeral feast/.test(s); });
    // Control: all three full +8; the verbatim claim stays.
    const pass = !err && !!mendLine
      && la.trust === 42 && lb.trust === 45 && lc.trust === 48
      && /-8 bought back/.test(mendLine);
    out({ seed, case: kase, pass, err, trustA: la.trust, trustB: lb.trust, trustC: lc.trust,
      mendLine: mendLine ? mendLine.slice(0, 260) : null });
    process.exit(pass ? 0 : 1);
  }
  out({ seed, case: kase, pass: false, err: 'unknown case' });
  process.exit(2);
}

function runAll() {
  const cases = ['partial-claim', 'partial-single', 'full-claim'];
  const results = [];
  let failed = false;
  for (const c of cases) {
    try {
      const o = execFileSync('node', [path.join(repo, 'scripts', 'test-journey-crisis-r216-funeral-partial-20261115.js'), String(seed), c],
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
  for (const r of results) console.log(JSON.stringify(r));
  console.log(JSON.stringify({ seed, case: 'all', pass: !failed, cases: results.map(r => r.case + ':' + (r.pass ? 'PASS' : 'FAIL')) }));
  process.exit(failed ? 1 : 0);
}

if (kase === 'all') runAll();
else runCase().catch(e => { console.error('FUNERAL-PARTIAL-R216 FAILED:', (e && e.stack) || e); process.exit(1); });
