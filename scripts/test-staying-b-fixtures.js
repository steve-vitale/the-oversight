#!/usr/bin/env node
// scripts/test-staying-b-fixtures.js — sim-staying-b fixture gate.
// Proof fixtures for the PARTY-AS-ONE-BODY rule (see prereg). Leader
// kitted machete+bow+arrows, fed-shape as in fieldability-a (same kit,
// same day-120 setup, no damage abilities, no tricks known); exactly
// ONE tile ally (the wild wave-4 shape: size 2); vs four wave-4
// species at two beast states: FRESH (minimum roll HP, maxHp = HP)
// and WOUNDED (300 HP on a fresh-min maxHp — the judged-set wounded
// shape, so the 15% break line stays honest). Party cell opts:
// allyFromStart + tileParty + tileAllies (on base code the tile
// opts are inert and the cell degrades to an old-rule from-start
// party — the correct T-stage comparison). Solo cell: no allies.
// Modes: --write-base-solo (write solo outcomes JSON, run BEFORE
// any game edit) | --gate (judge the fixture gate, needs the base
// solo file for the identity leg) | --sense (print 2 transcripts)
// | (no args: run all cells, print gate numbers, no verdict).
// --out <path> writes the full cell JSON (staged-build ablation:
// run after each build stage and save the output separately).
// Exit 0 on a completed matrix; --gate exits 1 on a gate failure
// (a failed gate is a completed measurement — the caller, not the
// exit code, decides the arm's fate; the gate lines print GATE-GO
// or GATE-NO-GO explicitly).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const KIT_ARMOR = ['hide_armor', 'skull_helm', 'canvas_pants', 'work_gloves', 'good_boots'];
const SPECIES = [
  { mid: 'herald', fresh: 700 },
  { mid: 'influencer', fresh: 850 },
  { mid: 'audit', fresh: 1100 },
  { mid: 'eater', fresh: 950 },
];
const SEEDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function med(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
// EPERM flap (2026-10-28/29 class: write(2) returns EPERM intermittently,
// across /tmp and workspace dirs): retry file writes instead of losing
// a completed matrix to a single denied write. Print first, write second.
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}

async function fightCell(mid, hp, maxHp, party, rngSeed, wantLog) {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'staying-b-fixtures', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  try { G.state.scholar.day = 120; } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (roster.length < 2) throw new Error('fewer than 2 roster villagers');
  const leader = roster[0], ally = roster[1];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (!vp) throw new Error('no villager record ' + vid);
    vp.items = (vid === leader ? ['machete', 'bow'] : []).concat(KIT_ARMOR);
    if (vid === leader) vp.items.push({ itemId: 'arrow', units: 5, name: 'arrow' });
    vp.equipped = {};
    if (vid === leader) {
      vp.equipped.melee = { itemId: 'machete', name: 'machete' };
      vp.equipped.ranged = { itemId: 'bow', name: 'bow' };
    }
  }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {};
  vv.health[leader] = 100; vv.health[ally] = 100;
  const def = (G.data.monsters || []).find(m => m && m.id === mid);
  if (!def) throw new Error('monster def not found: ' + mid);
  const entity = { id: def.id, hp: hp, maxHp: maxHp, tx: 2, ty: 2 };
  const opts = party
    ? { allies: 1, allyVids: [ally], allyFromStart: true, tileParty: true, tileAllies: [ally], rng: mulberry32(rngSeed) }
    : { allies: 0, allyVids: [], rng: mulberry32(rngSeed) };
  const rec = G.fieldFight(leader, def, entity, opts);
  const row = { mid, hp, maxHp, party: !!party, outcome: rec.outcome, rounds: rec.rounds,
    mDealt: rec.mDealt, vTaken: rec.vTaken, allyDealt: rec.allyDealt, allyTaken: rec.allyTaken,
    vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft,
    tileJoined: rec.tileJoined != null ? rec.tileJoined : null,
    partySizeAchieved: rec.partySizeAchieved != null ? rec.partySizeAchieved : null,
    partyHold: !!rec.partyHold, fleeHopeless: !!rec.fleeHopeless, fleeLearn: !!rec.fleeLearn,
    calledHelp: !!rec.calledHelp };
  if (wantLog) row.log = (rec.log || []).slice();
  return row;
}

async function runCells() {
  const out = [];
  for (const sp of SPECIES) {
    for (const cell of [{ name: 'WOUNDED', hp: 300, maxHp: sp.fresh }, { name: 'FRESH', hp: sp.fresh, maxHp: sp.fresh }]) {
      for (const s of SEEDS) {
        const r = await fightCell(sp.mid, cell.hp, cell.maxHp, true, 9000 + s * 131 + cell.hp);
        out.push(Object.assign({ cell: cell.name }, r));
      }
      for (const s of SEEDS) {
        const r = await fightCell(sp.mid, cell.hp, cell.maxHp, false, 9000 + s * 131 + cell.hp);
        out.push(Object.assign({ cell: cell.name }, r));
      }
    }
  }
  return out;
}

function summarize(cells) {
  const partyW = cells.filter(c => c.party && c.cell === 'WOUNDED');
  const partyF = cells.filter(c => c.party && c.cell === 'FRESH');
  const soloW = cells.filter(c => !c.party && c.cell === 'WOUNDED');
  const soloF = cells.filter(c => !c.party && c.cell === 'FRESH');
  const kills = (arr) => arr.filter(c => c.outcome === 'vKill').length;
  const drives = (arr) => arr.filter(c => c.outcome === 'mFlee').length;
  const dies = (arr) => arr.filter(c => c.outcome === 'vDie').length;
  return {
    partyWounded: { n: partyW.length, kills: kills(partyW), drives: drives(partyW), dies: dies(partyW),
      roundsMed: med(partyW.map(c => c.rounds)), mDealtMed: med(partyW.map(c => c.mDealt)),
      outcomes: partyW.map(c => c.outcome).join('/') },
    partyFresh: { n: partyF.length, kills: kills(partyF), drives: drives(partyF), dies: dies(partyF),
      roundsMed: med(partyF.map(c => c.rounds)), mDealtMed: med(partyF.map(c => c.mDealt)),
      outcomes: partyF.map(c => c.outcome).join('/') },
    soloWounded: { n: soloW.length, kills: kills(soloW), drives: drives(soloW), dies: dies(soloW),
      roundsMed: med(soloW.map(c => c.rounds)), mDealtMed: med(soloW.map(c => c.mDealt)) },
    soloFresh: { n: soloF.length, kills: kills(soloF), drives: drives(soloF), dies: dies(soloF),
      roundsMed: med(soloF.map(c => c.rounds)), mDealtMed: med(soloF.map(c => c.mDealt)) },
    partyHoldCount: cells.filter(c => c.party && c.partyHold).length,
    soloKey: cells.filter(c => !c.party).map(c => [c.mid, c.cell, c.outcome, c.rounds, c.mDealt, c.vTaken].join('|')).join('\n'),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
  const baseSoloPath = path.join(__dirname, '..', 'evidence', '2026-10-29', 'staying-b-base-solo.json');
  if (args.indexOf('--sense') >= 0) {
    const hold = await fightCell('influencer', 300, 850, true, 9000 + 2 * 131 + 300, true);
    const flee = await fightCell('audit', 1100, 1100, true, 9000 + 3 * 131 + 1100, true);
    console.log('--- SENSE 1: wounded influencer party (hold shape) ---');
    console.log(`outcome=${hold.outcome} rounds=${hold.rounds} mDealt=${hold.mDealt} vTaken=${hold.vTaken} partyHold=${hold.partyHold}`);
    for (const l of (hold.log || [])) console.log('  ' + l);
    console.log('--- SENSE 2: fresh audit party ---');
    console.log(`outcome=${flee.outcome} rounds=${flee.rounds} mDealt=${flee.mDealt} vTaken=${flee.vTaken} partyHold=${flee.partyHold}`);
    for (const l of (flee.log || [])) console.log('  ' + l);
    console.log('SENSE-COMPLETE');
    return;
  }
  if (args.indexOf('--write-base-solo') >= 0) {
    const cells = await runCells();
    const s = summarize(cells);
    console.log(`partyWounded kills=${s.partyWounded.kills}/40 drives=${s.partyWounded.drives} dies=${s.partyWounded.dies} roundsMed=${s.partyWounded.roundsMed} mDealtMed=${s.partyWounded.mDealtMed} (base-code party cell: old-rule from-start party)`);
    console.log(`partyFresh kills=${s.partyFresh.kills}/40 drives=${s.partyFresh.drives} dies=${s.partyFresh.dies} roundsMed=${s.partyFresh.roundsMed} mDealtMed=${s.partyFresh.mDealtMed}`);
    console.log(`soloWounded kills=${s.soloWounded.kills}/40 roundsMed=${s.soloWounded.roundsMed} mDealtMed=${s.soloWounded.mDealtMed}`);
    console.log(`soloFresh kills=${s.soloFresh.kills}/40 roundsMed=${s.soloFresh.roundsMed} mDealtMed=${s.soloFresh.mDealtMed}`);
    // Print the solo key to stdout too, so a write-flap failure cannot
    // lose the identity baseline: it can be reconstructed from the log.
    console.log('SOLOKEY-BEGIN');
    console.log(s.soloKey);
    console.log('SOLOKEY-END');
    writeFileRetry(baseSoloPath, JSON.stringify({ soloKey: s.soloKey, soloCells: cells.filter(c => !c.party) }, null, 1) + '\n');
    console.log('BASE-SOLO-WRITTEN ' + baseSoloPath);
    if (outPath) writeFileRetry(outPath, JSON.stringify({ summary: s, cells }, null, 1) + '\n');
    return;
  }
  const cells = await runCells();
  const s = summarize(cells);
  console.log(`PARTY-WOUNDED: kills=${s.partyWounded.kills}/40 drives=${s.partyWounded.drives} dies=${s.partyWounded.dies} roundsMed=${s.partyWounded.roundsMed} mDealtMed=${s.partyWounded.mDealtMed}`);
  console.log(`  outcomes: ${s.partyWounded.outcomes}`);
  console.log(`PARTY-FRESH: kills=${s.partyFresh.kills}/40 drives=${s.partyFresh.drives} dies=${s.partyFresh.dies} roundsMed=${s.partyFresh.roundsMed} mDealtMed=${s.partyFresh.mDealtMed}`);
  console.log(`  outcomes: ${s.partyFresh.outcomes}`);
  console.log(`SOLO-WOUNDED: kills=${s.soloWounded.kills}/40 roundsMed=${s.soloWounded.roundsMed} mDealtMed=${s.soloWounded.mDealtMed}`);
  console.log(`SOLO-FRESH: kills=${s.soloFresh.kills}/40 roundsMed=${s.soloFresh.roundsMed} mDealtMed=${s.soloFresh.mDealtMed}`);
  console.log(`PARTY-HOLD lines fired: ${s.partyHoldCount} party fights`);
  if (outPath) {
    writeFileRetry(outPath, JSON.stringify({ summary: s, cells }, null, 1) + '\n');
    console.log('wrote ' + outPath);
  }
  if (args.indexOf('--gate') >= 0) {
    let identity = null;
    if (fs.existsSync(baseSoloPath)) {
      const base = JSON.parse(fs.readFileSync(baseSoloPath, 'utf8'));
      const baseKey = base.soloKey != null ? base.soloKey : (Array.isArray(base.soloLines) ? base.soloLines.join('\n') : null);
      identity = (baseKey === s.soloKey);
      console.log(`SOLO-IDENTITY: ${identity ? 'PASS (solo fixtures byte-identical to base)' : 'FAIL (solo fixtures differ from base — see evidence)'}`);
      if (!identity) {
        const bl = (baseKey || '').split('\n'), cl = s.soloKey.split('\n');
        for (let i = 0; i < Math.max(bl.length, cl.length); i++) if (bl[i] !== cl[i]) console.log(`  DIFF row ${i}: base=${bl[i]} armed=${cl[i]}`);
      }
    } else {
      console.log('SOLO-IDENTITY: NO-BASELINE (run --write-base-solo on base code first)');
    }
    const gateA = s.partyWounded.kills >= 20;
    const gateB = s.partyFresh.roundsMed != null && s.partyFresh.roundsMed >= 4;
    const gateC = identity === true;
    console.log(`GATE (a) wounded kills>=20: ${gateA ? 'PASS' : 'FAIL'} (${s.partyWounded.kills}/40)`);
    console.log(`GATE (b) fresh roundsMed>=4: ${gateB ? 'PASS' : 'FAIL'} (${s.partyFresh.roundsMed})`);
    console.log(`GATE (c) solo identity: ${gateC ? 'PASS' : 'FAIL'}`);
    console.log(`FIXTURE-GATE: ${gateA && gateB && gateC ? 'GATE-GO (pilot may run)' : 'GATE-NO-GO (no pilot; kill the game code)'}`);
    if (!(gateA && gateB && gateC)) process.exit(1);
  }
  console.log('FIXTURES-COMPLETE');
}
main().catch(e => { console.error('FIXTURES-FAIL', e && e.stack || e); process.exit(1); });
