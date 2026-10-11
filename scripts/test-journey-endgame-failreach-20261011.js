#!/usr/bin/env node
// test-journey-endgame-failreach-20261011.js — endgame-leg blank finder (2026-10-11).
// EXHAUSTIVE fail-reachability analysis for the table's played challenges.
// Every path's failure beat promises "failure resolves the story" — but if
// the meter math can never reach the fail condition, the failure text is
// dead code and the path is unfailable-by-design (which may be fine for
// assimilated, but contradicts the design docs for the others).
//
// Method: boots the real engine, constructs a mid-game, re-evals each
// table-<path>.js with a proxy Game that captures its def, then DFS-
// enumerates EVERY choice sequence through the beats (both branches),
// mirroring tableChoose's meter application exactly (ability-mods on
// positive gains only, meter floors). Reports which fail conditions are
// reachable and the shortest choice sequence that fires them.
//
// Relay is excluded from enumeration (verb effects run real relay verbs
// with RNG backfires — analyzed separately in the walkthrough).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(424242);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
// Exclude the path modules here; re-eval them below with the capture proxy.
const boot = order.filter(f => !/table-(feared|indispensable|beloved|witness|defiant|assimilated|relay)\.js/.test(f));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
boot.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
Game.say = function () {};
Game.sysSay = function () {};
Game.save = function () {};
Game.wipe = function () {};

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 105;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 55;
  try { Game.ledgerAdd('protected', 6); Game.ledgerAdd('might', 4); Game.ledgerAdd('killed', 3); } catch (e) {}

  // Capture each path def with a proxy that intercepts tableRegisterPath.
  const captured = {};
  const proxy = new Proxy(Game, {
    get(t, k) {
      if (k === 'tableRegisterPath') return (def) => { captured[def.id] = def; };
      const v = t[k];
      return (typeof v === 'function') ? v.bind(t) : v;
    },
  });
  const savedGame = globalThis.Scattering.Game;
  globalThis.Scattering.Game = proxy;
  for (const pid of ['feared', 'indispensable', 'beloved', 'witness', 'defiant', 'assimilated']) {
    eval(fs.readFileSync(path.join(ROOT, `src/js/table-${pid}.js`), 'utf8'));
  }
  globalThis.Scattering.Game = savedGame;

  // Mirror of tableChoose's meter application (table.js), exactly —
  // including the copy-before-mods (2026-10-11: tableChoose no longer
  // mutates the def's shared effect objects).
  function applyChoice(T, choice) {
    let eff = (typeof choice.effects === 'function') ? choice.effects.call(Game, T) : (choice.effects || {});
    eff = Object.assign({}, eff || {});
    if (T.abilMods) {
      for (const k of Object.keys(eff)) {
        if (eff[k] > 0 && T.abilMods[k + 'Mult']) eff[k] = Math.max(0, Math.floor(eff[k] * T.abilMods[k + 'Mult']));
      }
    }
    for (const k of Object.keys(eff)) {
      if (k === 'grounding' || k === 'sysBond' || k === 'fail' || k === 'goto' || k === 'trial') continue;
      T.meters[k] = (T.meters[k] | 0) + (eff[k] | 0);
    }
    if (T.meterFloors) for (const k of Object.keys(T.meterFloors)) {
      if ((T.meters[k] | 0) < T.meterFloors[k]) T.meters[k] = T.meterFloors[k];
    }
    return eff;
  }
  // Grants at path start, mirroring tableStartPath (grants only; no say).
  function grantAbils(T, def, branch) {
    const ab = def.abilities || {};
    const grantList = (list) => (list || []).forEach(a => {
      T.abils.push(a.id);
      let e = {};
      try { e = (typeof a.grant === 'function') ? a.grant.call(Game, T) : (a.grant || {}); } catch (e2) {}
      for (const k of Object.keys(e || {})) {
        if (k === 'abilMods') Object.assign(T.abilMods, e.abilMods);
        else if (k !== 'grounding' && k !== 'sysBond') T.meters[k] = (T.meters[k] | 0) + (e[k] | 0);
      }
    });
    grantList(ab.shared); grantList(ab[branch] || ab.light);
  }
  function choiceList(def, beat, T) {
    try {
      const cl = (typeof beat.choices === 'function') ? beat.choices.call(Game, T) : (beat.choices || []);
      return cl || [];
    } catch (e) { return []; }
  }

  const results = [];
  for (const pid of Object.keys(captured)) {
    const def = captured[pid];
    for (const branch of ['light', 'dark']) {
      let failSeq = null;
      let visited = 0;
      const beats = def.beats || [];
      function dfs(T, bi, seq) {
        if (failSeq || visited > 200000) return;
        visited++;
        if (bi >= beats.length) return;
        const cl = choiceList(def, beats[bi], T);
        for (const c of cl) {
          const T2 = { meters: Object.assign({}, T.meters), abils: T.abils.slice(), abilMods: Object.assign({}, T.abilMods), meterFloors: Object.assign({}, T.meterFloors || {}), branch: T.branch, callbackUsed: T.callbackUsed, subpoenaUsed: T.subpoenaUsed };
          const eff = applyChoice(T2, c);
          const seq2 = seq.concat([c.id]);
          if (eff.fail) { failSeq = { seq: seq2, fail: eff.fail, meters: Object.assign({}, T2.meters) }; return; }
          dfs(T2, bi + 1, seq2);
          if (failSeq) return;
        }
      }
      const T0 = { meters: {}, abils: [], abilMods: {}, meterFloors: {}, branch, callbackUsed: false, subpoenaUsed: false };
      grantAbils(T0, def, branch);
      dfs(T0, 0, []);
      results.push({ path: pid, branch, reachable: !!failSeq, seq: failSeq && failSeq.seq, fail: failSeq && failSeq.fail, meters: failSeq && failSeq.meters, visited });
    }
  }

  let fails = 0;
  console.log('=== FAIL REACHABILITY (exhaustive choice enumeration) ===');
  // Desired contract (2026-10-11 fix): every path's failure must be
  // reachable by honest play on the branch where the design says it can
  // happen. Light branches are coherent-unfailable (protective terror
  // pledged as shield; genuine love; just trial on a clean record; mutual
  // need with deliberate slack). Assimilated is unfailable by design
  // (docs/TABLE.md: "there is almost no failure here").
  const expect = {
    'feared/light': false, 'feared/dark': true,
    'indispensable/light': false, 'indispensable/dark': true,
    'beloved/light': false, 'beloved/dark': true,
    'witness/light': false, 'witness/dark': true,
    'assimilated/light': false, 'assimilated/dark': false,
    // defiant excluded: state-dependent (stalls when you can't pay) —
    // covered by the walkthrough, not by meter enumeration.
    // relay excluded: verb effects run real relay verbs (RNG backfires) —
    // covered by the walkthrough.
  };
  let bad = 0;
  for (const r of results) {
    const key = r.path + '/' + r.branch;
    if (!(key in expect)) continue;
    const want = expect[key];
    const got = r.reachable;
    if (got === want) {
      fails++;
      console.log(`${got ? 'REACHABLE  ' : 'UNREACHABLE'} ${key} — as designed${got ? `: [${r.seq.join(' -> ')}] => "${r.fail}"` : ` (${r.visited} states)`}`);
    } else {
      bad++;
      console.log(`MISMATCH   ${key}: expected ${want ? 'reachable' : 'unreachable'}, got ${got ? 'reachable' : 'unreachable'}`);
    }
  }
  console.log(`\n${fails}/${Object.keys(expect).length} path-branch combos match the design contract.`);
  if (bad) { console.log('BLANK STILL OPEN: ' + bad + ' mismatches'); process.exit(2); }
  console.log('All failure triggers reachable where the design says they should be.');
})();
