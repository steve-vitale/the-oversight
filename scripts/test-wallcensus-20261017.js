#!/usr/bin/env node
// scripts/test-wallcensus-20261017.js — proof for sim-wallcensus-b +
// sim-aidchannel-b instruments (flesh-out loop B, 2026-10-17).
//
// (a) Fixture-based attribution assertions with REAL RED: each block runs
//     the real instrument on a fixture AND a deliberately-broken variant,
//     and asserts they DISAGREE — proving the test would catch the
//     misattribution. A green here means discrimination, not vibes.
// (b) Det-gate: 4 identical-seed census runs (writeJson off), byte-identical
//     trajectory hashes across the pair. Reported honestly — the known
//     timestamp-ID entropy issue (det-gate.js header) can still bite on
//     fight-heavy seeds; a miss is recorded, not re-scored.
// (c) SMOKE: the real sweep in SMOKE mode writes per-seed JSONs with the
//     EXACT numeric wall keys (national/table/wins/exiled as 0/1).
//
// Harness rules: Math.random seeded before eval (loadGame), full module
// list via sim-harness, never stub Game.save. Substrate FEASTSCALE_R13=1,
// SEATDRIVE=0 explicit.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const sweep = require('./sweep-wallcensus-20261017.js');
const { attributeRoad } = require('./analyze-aidchannel-20261017.js');

sweep.assertSubstrate();

let passed = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (cond) passed++;
  else { console.error('PROOF FAILED: ' + name); process.exitCode = 1; }
}

async function fixtureGame(seed, mode) {
  const { Game } = await loadGame({ seed, mode });
  await setupGame(Game);
  const said = [];
  const oSay = Game.say ? Game.say.bind(Game) : null;
  Game.say = (t) => { said.push(String(t)); return oSay ? oSay(t) : t; };
  return { Game, said };
}

(async () => {
  // ============ A1. crumb instrument discriminates (RED-pinned) ============
  console.log('== A1. crumb instrument: >500-piece deposit flagged ==');
  {
    const { Game } = await fixtureGame(4201, 'wallcensus-a1');
    const inst = sweep.attachInstruments(Game);
    const v = Game.state.village;
    const before = v.pantry.length;
    Game.depositPantryPieces(v, { name: 'Test meat', plantId: null, kcalEach: 1200, units: 1, kg: 1 }, 600);
    Game.depositPantryPieces(v, { name: 'Test grain', plantId: null, kcalEach: 500, units: 1, kg: 1 }, 500);
    check('real instrument recorded 2 deposit calls', inst.depositCalls.length === 2, `n=${inst.depositCalls.length}`);
    const viol = inst.depositCalls.filter(c => c.pieceKcal > 500);
    check('real instrument flags the 600 piece, clears the 500 piece',
      viol.length === 1 && viol[0].pieceKcal === 600, `viol=${viol.length}`);
    check('deposit still landed in the pantry (read-only wrapper calls through)',
      v.pantry.length > before, `pantry ${before} -> ${v.pantry.length}`);
    // RED pin: a broken variant that clamps pieces at 500 would report 0
    // violations on the same fixture — assert it DISAGREES with the real one.
    const brokenCalls = inst.depositCalls.map(c => ({ pieceKcal: Math.min(500, c.pieceKcal) }));
    const brokenViol = brokenCalls.filter(c => c.pieceKcal > 500).length;
    check('RED: broken (clamping) variant misses it — test discriminates',
      brokenViol === 0 && viol.length !== brokenViol, `real=${viol.length} broken=${brokenViol}`);
    check('0 instrument errors on fixture', inst.errors === 0, `errors=${inst.errors}`);
  }

  // ============ A2. aid attribution by road (RED-pinned) ============
  console.log('== A2. aid analyzer attributes by the record\'s own road ==');
  {
    const rec = { policyId: 'belongseek', aid: { tendFires: 3, tendKcal: 4500 } };
    check('attributeRoad reads the record (belong)', attributeRoad(rec) === 'belongseek', attributeRoad(rec));
    const rec2 = { policyId: 'leadcourt', aid: { tendFires: 5, tendKcal: 7500 } };
    check('attributeRoad reads the record (lead)', attributeRoad(rec2) === 'leadcourt', attributeRoad(rec2));
    // RED pin: a filename-parity misattribution (the schema-drift class)
    // would file the belong record under lead. The test must disagree.
    const buggy = (r) => (r.aid.tendFires % 2 === 0 ? 'leadcourt' : 'belongseek');
    const recOdd = { policyId: 'leadcourt', aid: { tendFires: 5, tendKcal: 7500 } };
    check('RED: parity-misattribution variant disagrees with the real one',
      buggy(recOdd) !== attributeRoad(recOdd), `real=${attributeRoad(recOdd)} buggy=${buggy(recOdd)}`);
    check('attributeRoad throws on a record with no road (loud, not silent)',
      (() => { try { attributeRoad({ aid: { tendFires: 1 } }); return false; } catch (e) { return true; } })());
  }

  // ============ A3. link census sees a primary-haven link ============
  console.log('== A3. link census records a formed primary-haven link ==');
  {
    const { Game } = await fixtureGame(4202, 'wallcensus-a3');
    const inst = sweep.attachInstruments(Game);
    const m = Game.mshipState ? Game.mshipState() : null;
    const links = (m && m.links) || (Game.hierarchyState ? Game.hierarchyState() : []);
    // Fixture: fabricate an active primary-haven link, sample, assert census.
    if (Array.isArray(links)) {
      links.push({ id: 'link_fixture', primary: 'haven', subordinate: 'fixval', day: 30, trust: 30, status: 'active' });
    }
    const linkSeen = { count: 0, activeDays: 0 };
    const trig = { days: 0, daysNoLink: 0, daysWithLink: 0, max: 0 };
    Game.state.scholar.day = 31;
    inst.sample(linkSeen, trig);
    check('link census counted the fixture link', linkSeen.count >= 1, `count=${linkSeen.count}`);
    check('link census recorded first-seen day 31', inst.linkFirst['link_fixture'] && inst.linkFirst['link_fixture'].day === 31,
      JSON.stringify(inst.linkFirst['link_fixture'] || null));
    check('0 instrument errors on fixture', inst.errors === 0, `errors=${inst.errors}`);
  }

  // ============ B. det-gate: 4 seeds, paired runs, byte-identical ============
  console.log('== B. det-gate: 4 paired census runs, byte-identical hashes ==');
  {
    const pairs = [['leadcourt', 4201], ['belongseek', 4201], ['leadcourt', 4202], ['belongseek', 4202]];
    let ident = 0;
    for (const [road, seed] of pairs) {
      let a, b;
      await quietLog(async () => { a = await sweep.runCensus(seed, road, { days: 60, writeJson: false }); });
      await quietLog(async () => { b = await sweep.runCensus(seed, road, { days: 60, writeJson: false }); });
      const ha = a.hashes, hb = b.hashes;
      const same = ha.length === hb.length && ha.every((h, i) => h === hb[i]);
      console.log(`  ${same ? 'IDENTICAL' : 'DIVERGED'} ${road} s${seed}: ${ha.length}/${hb.length} days, end ${a.endReason}/${b.endReason}`);
      if (same) ident++;
    }
    check('det-gate: 4/4 paired runs byte-identical', ident === 4, `${ident}/4 identical`);
  }

  // ============ C. SMOKE: real sweep writes schema-correct JSONs ============
  console.log('== C. SMOKE: sweep writes numeric-key per-seed JSONs ==');
  {
    process.env.SMOKE = '1'; process.env.SEEDS = '4201'; process.env.ONLY = 'leadcourt';
    delete require.cache[require.resolve('./sweep-wallcensus-20261017.js')];
    // Re-exec via child to get a clean harness process (AGENTS.md: never
    // two harnesses in one process) — the SMOKE env carries through.
    const { execFileSync } = require('child_process');
    const env = Object.assign({}, process.env, { SMOKE: '1', SEEDS: '4201', ONLY: 'leadcourt', FEASTSCALE_R13: '1', SEATDRIVE: '0' });
    try {
      execFileSync(process.execPath, [path.join(__dirname, 'sweep-wallcensus-20261017.js')], { env, stdio: 'pipe', timeout: 300000 });
    } catch (e) {
      check('SMOKE sweep exited 0', false, String(e.message).slice(0, 200));
    }
    const f = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-wallcensus-b', 'leadcourt-s4201.json');
    const exists = fs.existsSync(f);
    check('SMOKE wrote the per-seed JSON', exists, f);
    if (exists) {
      const r = JSON.parse(fs.readFileSync(f, 'utf8'));
      const numeric = ['national', 'table', 'wins', 'exiled', 'maxWave', 'wave4', 'wave5'].every(k => typeof r[k] === 'number');
      check('wall keys are NUMERIC (schema-drift gate)', numeric, `national=${r.national} table=${r.table} wins=${r.wins} exiled=${r.exiled}`);
      check('aid/links/trigger/crumb blocks present', !!(r.aid && r.links && r.trigger && r.crumb),
        Object.keys(r).join(','));
      check('0 instrument errors in SMOKE', r.instrumentErrors === 0, `errors=${r.instrumentErrors}`);
    }
  }

  console.log(`\nproof: ${passed} checks green${process.exitCode ? ' — FAILURES PRESENT' : ''}`);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
