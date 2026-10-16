#!/usr/bin/env node
// sweep-sigportfix-20261016.js — fight-level measurement for the sim-sigportfix
// arm (run fleshout-20261016T1715Z, axis scale-onramp).
//
// 8 FRESH seeds (911, 912, 914, 918, 919, 920, 921, 922 — verified 0
// `-s<seed>.json` hits across evidence/ before running) x 2 roads
// (audit-road, editor-road) x control/armed.
//
// control = pre-fix behavior: Game.sigW4FieldMonster/sigW5FieldMonster are
//   swapped for the VERBATIM pre-fix implementations extracted from
//   `git show a3f9e124^` (the inversion: audit halved the MONSTER's damage;
//   editor zeroed the MONSTER's damage).
// armed = current tree (honest ports: audit taxes the VILLAGER's strike via
//   rec.auditTaxRounds; editor cuts the VILLAGER's swing via rec.editorCuts).
//
// Each cell drives a REAL G.fieldFight (villager vs weakMdef 60-HP clone,
// no tricks known, abilities stripped, villager HP 400) through the actual
// engine — including the villager-strike consumption block in fieldFights.js.
// Per-seed JSON written to evidence/2026-10-16/sigportfix-s<seed>.json.
// Analysis printed at the end.
//
// NOTE on the pre-registered village-level substrate (180d, leadfeast/
// belongfeast): wave-4 field fights require village standing >= 100, which
// no 180d competent-policy sim reaches (the scale wall itself — see the
// standing directive). A village-level sweep would measure ~zero audit/editor
// fights. The fight-level instrument below IS the measurement; the
// substitution is documented in the evidence metric-review section per
// MEASUREMENT.md §14.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const EVID = path.join(ROOT, 'evidence', '2026-10-16');
const SEEDS = [911, 912, 914, 918, 919, 920, 921, 922];

function extractOld(fname, key) {
  const txt = execSync(`git show a3f9e124^:src/js/${fname}`, { cwd: ROOT }).toString();
  const ki = txt.indexOf(key);
  if (ki < 0) throw new Error('key not found: ' + key);
  const pi = txt.indexOf('(', ki);
  let pd = 0, pj = pi;
  for (;; pj++) { const c = txt[pj]; if (c === '(') pd++; else if (c === ')') { pd--; if (!pd) break; } }
  const bi = txt.indexOf('{', pj);
  let depth = 0, k = bi;
  for (;; k++) { const c = txt[k]; if (c === '{') depth++; else if (c === '}') { depth--; if (!depth) break; } }
  return 'function ' + txt.slice(pi, pj + 1) + ' ' + txt.slice(bi, k + 1);
}
const OLD_W4_SRC = extractOld('sigW4.js', 'sigW4FieldMonster: function');
const OLD_W5_SRC = extractOld('sigW5.js', '\n    sigW5FieldMonster(');

function gameEval(seed, js) {
  const tmpFile = '/tmp/sigportfix-sweep-' + seed + '-' + process.pid + '.js';
  const code = `
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 800); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString();
    const lines = r.trim().split('\n');
    return JSON.parse(lines[lines.length - 1] || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

const FIGHT_JS = `
  const OLD_W4_SRC = ${JSON.stringify(OLD_W4_SRC)};
  const OLD_W5_SRC = ${JSON.stringify(OLD_W5_SRC)};
  const sayShim = (game, s) => { try { game.say(s); } catch (e) {} };
  const mkOld = (src) => new Function('say', 'return (' + src + ');')(sayShim);
  const origW4 = Game.sigW4FieldMonster, origW5 = Game.sigW5FieldMonster;
  function setupFighter() {
    const vs = Game.data.villagers || [];
    const v = vs.find(x => !x.dead) || vs[0];
    try { Game.state.village = Game.state.village || {}; Game.state.village.health = Game.state.village.health || {}; Game.state.village.health[v.id] = 400; } catch (e) {}
    try { v.abilities = []; } catch (e) {}
    return v;
  }
  function weakMdef(mid) {
    const base = Game.data.monsters.find(m => m.id === mid);
    const c = Object.assign({}, base);
    c.hp = [60, 60];
    return c;
  }
  function summarize(mid, useOld) {
    const v = setupFighter();
    const mdef = weakMdef(mid);
    // intent: 'engage' without trick knowledge — stub villageKnowsTrick so
    // the learn-first withdrawal doesn't end the fight on round 3, while
    // state.villagerTricks stays empty so NO trick actions fire (pure
    // strike loop; the ports' tax/cut land unopposed). Harness-only stub.
    const origVKT = Game.villageKnowsTrick;
    Game.villageKnowsTrick = function () { return true; };
    if (useOld) { Game.sigW4FieldMonster = mkOld(OLD_W4_SRC); Game.sigW5FieldMonster = mkOld(OLD_W5_SRC); }
    else { Game.sigW4FieldMonster = origW4; Game.sigW5FieldMonster = origW5; }
    const rec = Game.fieldFight(v.id, mdef, null, { noFlee: true });
    Game.sigW4FieldMonster = origW4; Game.sigW5FieldMonster = origW5;
    Game.villageKnowsTrick = origVKT;
    const log = rec.log || [];
    // the engine logs a SHORT name (first name); derive it from the log
    let vName = 'Villager';
    for (const ln of log) { const sm = /^R\d+: (.+?) strikes for/.exec(ln); if (sm) { vName = sm[1]; break; } }
    const perRound = {};
    const rkey = (line) => { const m = /^R(\\d+):/.exec(line); return m ? m[1] : null; };
    let villagerDmg = 0, monsterDmg = 0, taxedStrikes = 0, cuts = 0;
    const attrLines = [];
    for (const line of log) {
      const rk = rkey(line);
      if (!rk) continue;
      perRound[rk] = perRound[rk] || { vd: 0, md: 0 };
      let m = /strikes for (\\d+)/.exec(line);
      if (m) { const d = +m[1]; villagerDmg += d; perRound[rk].vd += d; }
      const hp = line.indexOf(' hits ' + vName + ' for ');
      if (hp >= 0) {
        const dm = / for (\\d+)/.exec(line.slice(hp));
        if (dm) { const d = +dm[1]; monsterDmg += d; perRound[rk].md += d; }
      }
      if (line.includes('(audited')) taxedStrikes++;
      if (line.includes('cutting-room floor')) cuts++;
      if (line.includes('best trick is taxed') || line.includes('nothing to tax') ||
          line.includes('CUT') || line.includes('scissors poise') || line.includes('film strips show')) {
        attrLines.push(line);
      }
    }
    const died = log.join(' ').match(/dies|slain|killed/i) && (rec.outcome || '').match(/vDie|vdie/i);
    return {
      outcome: rec.outcome, rounds: rec.rounds,
      // authoritative engine counters (no log parsing): mDealt = villager's
      // damage to the monster; vTaken = monster's damage to the villager
      villagerDmg: rec.mDealt | 0, monsterDmg: rec.vTaken | 0,
      villagerDmgParsed: villagerDmg,
      taxedStrikes, cuts,
      villagerDied: !!died || /vDie/i.test(rec.outcome || ''),
      attrLines: attrLines.slice(0, 12),
    };
  }
  out.fights = {
    audit: { control: summarize('audit', true), fixed: summarize('audit', false) },
    editor: { control: summarize('editor', true), fixed: summarize('editor', false) },
  };
`;

console.log('seeds: ' + SEEDS.join(','));
const perSeed = {};
for (const s of SEEDS) {
  const o = gameEval(s, FIGHT_JS);
  if (o.__err || o.__crash) {
    console.log(`seed ${s}: ERROR ${o.__err || o.__crash}`);
    continue;
  }
  perSeed[s] = o.fights;
  const fp = path.join(EVID, `sigportfix-s${s}.json`);
  fs.writeFileSync(fp, JSON.stringify({ seed: s, run: 'fleshout-20261016T1715Z', arm: 'sim-sigportfix', fights: o.fights }, null, 1));
  console.log(`seed ${s}: wrote ${fp}`);
}

// ---------- analysis ----------
function agg(road, arm) {
  const a = { vd: 0, md: 0, taxed: 0, cuts: 0, died: 0, n: 0 };
  for (const s of SEEDS) {
    const f = perSeed[s] && perSeed[s][road] && perSeed[s][road][arm];
    if (!f) continue;
    a.n++; a.vd += f.villagerDmg; a.md += f.monsterDmg;
    a.taxed += f.taxedStrikes; a.cuts += f.cuts;
    if (f.villagerDied) a.died++;
  }
  return a;
}
console.log('\n== SWEEP ANALYSIS (8 seeds x 2 roads x control/armed) ==');
for (const road of ['audit', 'editor']) {
  const c = agg(road, 'control'), f = agg(road, 'fixed');
  console.log(`\n-- ${road.toUpperCase()} road (${c.n} seeds) --`);
  console.log(`  villager dmg dealt : control ${c.vd}  vs  fixed ${f.vd}  (Δ ${f.vd - c.vd})`);
  console.log(`  monster dmg dealt  : control ${c.md}  vs  fixed ${f.md}  (Δ ${f.md - c.md})`);
  console.log(`  taxed strikes      : control ${c.taxed}  vs  fixed ${f.taxed}`);
  console.log(`  cuts landed        : control ${c.cuts}  vs  fixed ${f.cuts}`);
  console.log(`  villager deaths    : control ${c.died}  vs  fixed ${f.died}`);
}
console.log('\nPredicted directions (pre-registered):');
console.log('  audit : villager dmg DOWN (tax halves villager strikes) AND monster dmg UP (control halved monster dmg on audit rounds)');
console.log('  editor: villager dmg DOWN (cut rounds zero the swing) AND monster dmg UP (control zeroed monster dmg on cut rounds)');
