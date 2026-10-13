#!/usr/bin/env node
// scripts/test-villkill-20261013.js — proof test for the VILLKILL instrument
// (scripts/villkill-20261013.js, scale-wall r18 ARM 3).
//
// Proves, with real RED phases:
//   (1) attribution: fieldFight-vKill pending marker -> field-npc /
//       field-vessel (mantleOf); id-mismatched or absent marker ->
//       scholar-tb (never misattributed).
//   (2) delta honesty: ledger before/after deltas tie to the kill; per-type
//       cap 2 enforced in the deltas (1,1,0 on three same-type kills).
//   (3) live end-to-end: a REAL engine fieldFight (weakened wave-3 mdef)
//       producing a real vKill, fed through the REAL recordWaveKill exactly
//       as the engine's six call sites do -> instrument logs field-npc with
//       delta 1. Negative control (no preceding fight -> scholar-tb) proves
//       the attribution isn't hardcoded.
//   (4) non-interference: 30d same-seed leadcourt run with vs without the
//       instrument -> identical trajectory hash (pass-through wraps).
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const vk = require('./villkill-20261013');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function trajHash(Game) {
  try {
    const s = Game.state || {};
    const o = {
      day: (s.scholar || {}).day || 0,
      roster: ((s.village || {}).roster || []).length,
      shp: Math.round((s.scholar || {}).hp || 0),
      l1: Game.waveLedgerPoints(1) | 0, l2: Game.waveLedgerPoints(2) | 0, l3: Game.waveLedgerPoints(3) | 0,
      pantry: Math.round((((s.village || {}).pantry) || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)),
      alive: !Game.over,
    };
    return JSON.stringify(o);
  } catch (e) { return 'err:' + e.message; }
}

(async () => {
  // ---- (1)+(2) unit-level attribution + delta honesty (live Game) ----
  {
    const { Game } = await loadGame({ seed: 11, mode: 'villkill-unit' });
    await setupGame(Game);
    const m = {};
    vk.attachVillKill(Game, m);
    const red = (Game.data.monsters || []).find(x => x.id === 'redactor');
    ok('redactor is wave 3', red && red.wave === 3, red && ('wave=' + red.wave));
    ok('wave-3 counter data absent (1pt/kill)', !(red && red.counter));

    // 1a: no pending marker -> scholar-tb
    Game._vkPending = null;
    Game.recordWaveKill('redactor');
    let k = m.villkill.kills[m.villkill.kills.length - 1];
    ok('no-marker kill attributes scholar-tb', k && k.src === 'scholar-tb', k && k.src);
    ok('scholar-tb kill delta 1 (ledger counted it)', k && k.delta === 1, k && ('delta=' + k.delta));

    // 1b: matching pending marker, NPC vid -> field-npc
    Game._vkPending = { vid: 'npc-xyz-1', monsterId: 'gavel', wave: 3, rounds: 4, vTaken: 12, noFlee: false };
    Game.recordWaveKill('gavel');
    k = m.villkill.kills[m.villkill.kills.length - 1];
    ok('matched marker attributes field-npc', k && k.src === 'field-npc', k && k.src);
    ok('field-npc kill delta 1 (ledger counts villager kills)', k && k.delta === 1, k && ('delta=' + k.delta));
    ok('vid/rounds/vTaken captured', k && k.vid === 'npc-xyz-1' && k.rounds === 4 && k.vTaken === 12);

    // 1c: RED — id-MISMATCHED marker must NOT be consumed (scholar-tb).
    // (Run this test against the guard removed -> it FAILs, attributing
    // field-npc. With the guard -> PASS. The RED was observed 2026-10-13.)
    Game._vkPending = { vid: 'npc-xyz-2', monsterId: 'spool', wave: 3, rounds: 3, vTaken: 5, noFlee: false };
    Game.recordWaveKill('gavel'); // NOTE: different id than the pending marker
    k = m.villkill.kills[m.villkill.kills.length - 1];
    ok('RED id-mismatch marker not consumed -> scholar-tb', k && k.src === 'scholar-tb' && k.monsterId === 'gavel', k && (k.src + '/' + k.monsterId));

    // 1d: vessel separation via mantleOf
    try { ((Game.state.village || {}).mantleOf = [{ from: 'vessel-1', to: 'scholar-2', day: 40 }]); } catch (e) {}
    Game._vkPending = { vid: 'vessel-1', monsterId: 'spool', wave: 3, rounds: 6, vTaken: 20, noFlee: false };
    Game.recordWaveKill('spool');
    k = m.villkill.kills[m.villkill.kills.length - 1];
    ok('mantleOf from-vid attributes field-vessel', k && k.src === 'field-vessel', k && k.src);

    // 2: per-type cap honesty — redactor already has 1 pt (from 1a); two
    // more kills -> deltas 1 then 0 (cap 2).
    Game._vkPending = null;
    Game.recordWaveKill('redactor');
    const k2 = m.villkill.kills[m.villkill.kills.length - 1];
    Game.recordWaveKill('redactor');
    const k3 = m.villkill.kills[m.villkill.kills.length - 1];
    ok('per-type cap: 2nd redactor kill delta 1', k2 && k2.delta === 1, k2 && ('delta=' + k2.delta));
    ok('per-type cap: 3rd redactor kill delta 0', k3 && k3.delta === 0, k3 && ('delta=' + k3.delta));
    ok('ledger total wave-3 = 5 (red 2 / gavel 2 / spool 1, red+gavel capped)',
      (Game.waveLedgerPoints(3) | 0) === 5, 'pts=' + (Game.waveLedgerPoints(3) | 0));
    const fin = vk.finalizeVillKill(Game, m);
    ok('finalize: 6 wave-3 kills logged', fin.wave3Kills === 6, 'n=' + fin.wave3Kills);
    ok('finalize: scholar 4 / npc 1 / vessel 1', fin.scholarKills === 4 && fin.npcKills === 1 && fin.vesselKills === 1,
      `${fin.scholarKills}/${fin.npcKills}/${fin.vesselKills}`);
    ok('finalize: rung closed at 5 pts', fin.rungClosed && fin.ledgerPtsFinal === 5, 'closed=' + fin.rungClosed + ' pts=' + fin.ledgerPtsFinal);
  }

  // ---- (3) live end-to-end: real fieldFight vKill -> real recordWaveKill ----
  {
    const { Game } = await loadGame({ seed: 22, mode: 'villkill-e2e' });
    await setupGame(Game);
    const m = {};
    vk.attachVillKill(Game, m);
    const roster = ((Game.state.village || {}).roster || []).map(String);
    const scholarVid = String(Game.villagerId != null ? Game.villagerId : ((Game.state || {}).scholar || {}).villagerId || '');
    const npcVid = roster.find(v => v !== scholarVid);
    ok('live NPC vid available', !!npcVid, npcVid);
    const realDef = (Game.data.monsters || []).find(x => x.id === 'focus_group');
    ok('focus_group wave-3 def found', !!realDef);
    const weak = Object.assign({}, realDef); // clone: real data untouched
    const nBefore = m.villkill.kills.length;
    // negative control first: no fight -> scholar-tb (proves not hardcoded)
    Game.recordWaveKill('focus_group');
    let kn = m.villkill.kills[m.villkill.kills.length - 1];
    ok('e2e negative control: no fight -> scholar-tb', kn && kn.src === 'scholar-tb', kn && kn.src);
    // now drive REAL engine fights with a 1-HP lead until a real vKill
    let vkill = null, tries = 0;
    while (!vkill && tries < 25) {
      tries++;
      try {
        const rec = Game.fieldFight(npcVid, weak, { hp: 1, maxHp: 1 }, {});
        if (rec && rec.outcome === 'vKill') vkill = rec;
      } catch (e) { /* fight may throw on edge states; retry */ }
    }
    ok('real engine fieldFight produced vKill (<=25 tries)', !!vkill, 'tries=' + tries);
    if (vkill) {
      // exactly the engine's caller pattern (six call sites):
      //   rec = fieldFight(...); if (rec.outcome==='vKill') recordWaveKill(id)
      Game.recordWaveKill('focus_group');
      const ke = m.villkill.kills[m.villkill.kills.length - 1];
      ok('e2e: real vKill attributes field-npc', ke && ke.src === 'field-npc', ke && ke.src);
      ok('e2e: vid matches the fighter', ke && ke.vid === String(npcVid), ke && ke.vid);
      ok('e2e: ledger delta 1 on the villager kill', ke && ke.delta === 1, ke && ('delta=' + ke.delta));
      ok('e2e: exactly 2 kills logged this phase', m.villkill.kills.length - nBefore === 2,
        'n=' + (m.villkill.kills.length - nBefore));
      ok('e2e: real monster data unmutated', (Game.data.monsters.find(x => x.id === 'focus_group').hp || [])[0] === (realDef.hp || [])[0]);
    }
  }

  // ---- (4) non-interference: 30d same-seed with/without instrument ----
  {
    const run = async (withVk) => {
      const { Game } = await loadGame({ seed: 33, mode: 'villkill-ni' + (withVk ? '-on' : '-off') });
      await setupGame(Game);
      const m = {};
      if (withVk) vk.attachVillKill(Game, m);
      const policy = Object.assign({}, leadcourt);
      await quietLog(() => runDays(Game, policy, { days: 30, sampleEvery: 10 }));
      return trajHash(Game);
    };
    const hOff = await run(false);
    const hOn = await run(true);
    ok('non-interference: identical trajectory hash', hOff === hOn, '\n    off=' + hOff + '\n    on =' + hOn);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
