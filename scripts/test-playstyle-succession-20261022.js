#!/usr/bin/env node
// scripts/test-playstyle-succession-20261022.js — PROOF for rogue P1
// "character playstyle differentiation at succession" (Steve 2026-10-22:
// each character should feel like a completely different way to play —
// even one the player didn't choose).
//
// BEFORE (audited 2026-10-22, ledger.js playerDeath + villager-build.js
// mantleBecome): the successor received their own abilities / tracks /
// skills / knowledge / gear, but the PERSONAL behavior record rode along —
// scholar.playstyle (behavior axes: leader/social/generous...), scholar.stats
// + practice + passives (the practiced body) were never reset. The handoff
// was a stat swap: the new bearer <redacted> the dead bearer's habits and
// practiced body, and relic-enhancement affinity + the leadership notice
// kept segmenting on the OLD person. The recognized god-path class crossed
// silently when already recognized as a villager (npcGodpath carried, no
// handoff line).
//
// AFTER (this change): playstyle / practice / passives reset; stats rebuilt
// from the SUCCESSOR's own former occupation (occupationStatBonuses — which
// also fixes the dead `this.lifeseed` reference at new-game); the dead
// bearer's dominant axis is filed in the lineage entry; the handoff names the
// new bearer's recognized class (System voice on change, one file-update line
// when already known).
//
// Usage:
//   node scripts/test-playstyle-succession-20261022.js        # scenario A: class recognized AT the handoff
//   SCENARIO=B node scripts/test-playstyle-succession-20261022.js  # scenario B: class already recognized as a villager
// No other ENV. Deterministic seed. Exits 0 when every assertion passes.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SCENARIO = process.env.SCENARIO || 'A';
const KIT = ['iron_stomach', 'extra_stomach', 'deep_reserves']; // survivalist/furnace x3 -> classifies

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { failures++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  // narration:true keeps say/sysSay live — the handoff's fiction IS the
  // observable effect under test (the System's voice included).
  const { Game } = await loadGame({ seed: 20261022, mode: 'playstyle-succession', narration: true });
  await setupGame(Game);
  const s = Game.state.scholar, v = Game.state.village;
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t) { try { lines.push(String(t)); } catch (e) {} return origSay(t); };
  Game.state.systemArrived = true; // the System's voice is live for the handoff

  const oldId = Game.villagerId;
  const oldName = ((Game.data.villagers || []).find(x => x.id === oldId) || {}).name || 'the scholar';
  const oldKit = (s.abilities || []).map(a => a.id || a);

  // The old bearer's personal record: real behavior, a practiced body.
  Game.notePlaystyle('leader', 5);
  Game.notePlaystyle('social', 4);
  s.stats = { str: 9, end: 8, per: 5, agi: 5, pre: 6 };
  s.passives = { trail_eyes: 2 };
  s.practice = { str: 3 };
  check('pre: dominant playstyle is the old bearer\'s', Game.dominantPlaystyle() === 'leader', Game.dominantPlaystyle());

  // Choose the successor deterministically: highest trust wins the mantle.
  const pool = Game.npcIds().filter(id => id !== oldId);
  if (!pool.length) { console.log('FAIL setup: no living NPC candidates'); process.exit(1); }
  const succId = pool[0];
  const succChar = (Game.data.villagers || []).find(x => x.id === succId) || {};
  const succName = succChar.name || 'someone';
  v.trust = v.trust || {};
  for (const id of Object.keys(v.trust)) v.trust[id] = 0;
  v.trust[succId] = 90;
  // The successor's own kit: three survivalist/furnace magic abilities.
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[succId] = KIT.slice();
  v.npcXp = v.npcXp || {};
  if (SCENARIO === 'B') {
    // Already recognized as a villager: the handoff must name the carried class once.
    v.npcGodpath = v.npcGodpath || {};
    v.npcGodpath[succId] = { path: 'survivalist', subclass: 'furnace', since: 0, god: 'unkillable' };
  } else if (v.npcGodpath) { delete v.npcGodpath[succId]; }
  // The successor's own past: a line cook's body, not the old bearer's.
  succChar.formerOccupation = 'line cook';
  const expectedStats = { str: 5, end: 5, per: 5, agi: 5, pre: 5 };
  // (works on pre-change code too: falls back to the food-category table)
  const occBonuses = (typeof Game.occupationStatBonuses === 'function')
    ? Game.occupationStatBonuses(Game.occCategory('line cook'))
    : { end: 2, str: 1 };
  for (const [k, n] of Object.entries(occBonuses)) expectedStats[k] = 5 + n;

  Game.playerDeath('a test fall');

  const ns = Game.state.scholar;
  const blob = lines.join('\n');
  const succFirst = String(succName).split(' ')[0];

  // A1 — identity coherence: the mantle moved to the chosen successor.
  check('A1 identity: villagerId is the successor', Game.villagerId === succId && ns.villagerId === succId,
    `${oldName} -> ${succName}`);

  // A2 — the behavior record is the NEW bearer's (empty until THEY act).
  check('A2 playstyle reset (no borrowed habits)',
    Object.keys(ns.playstyle || {}).length === 0 && Game.dominantPlaystyle() === null,
    `playstyle=${JSON.stringify(ns.playstyle)} dominant=${Game.dominantPlaystyle()}`);

  // A3 — the body is the successor's: 5-base + THEIR occupation, no borrowed practice.
  const statsOk = ['str', 'end', 'per', 'agi', 'pre'].every(k => (ns.stats || {})[k] === expectedStats[k]);
  check('A3 body record: stats from successor\'s trade, practice/passives cleared',
    statsOk && Object.keys(ns.practice || {}).length === 0 && Object.keys(ns.passives || {}).length === 0,
    `stats=${JSON.stringify(ns.stats)} expected=${JSON.stringify(expectedStats)}`);

  // A4 — the kit is the successor's own, not the old bearer's.
  const newKit = (ns.abilities || []).map(a => a.id || a);
  const sameSet = (a, b) => a.length === b.length && a.every(id => b.includes(id));
  check('A4 own kit (not the dead bearer\'s)',
    KIT.every(id => newKit.includes(id)) && !sameSet(oldKit, newKit),
    `old=[${oldKit.join(',')}] new=[${newKit.join(',')}]`);

  // A5 — the held abilities segment the new bearer <redacted> a path.
  check('A5 path segmentation: godpath class from held kit',
    !!(ns.godpath && ns.godpath.path === 'survivalist' && ns.godpath.subclass === 'furnace'),
    `godpath=${JSON.stringify(ns.godpath)}`);

  // A6 — the handoff reads as the new person: face, trade, and THEIR hands.
  const faceOk = blob.includes('You wake up somebody else') && blob.includes(succFirst);
  const handsOk = /hands know different work/i.test(blob) && blob.includes('Iron Stomach');
  check('A6 handoff names the new face and their hands', faceOk && handsOk);

  // A7 — the path is named in the fiction.
  if (SCENARIO === 'B') {
    check('A7 path named (already-recognized class)',
      blob.includes('The System updates its file') && /furnace/i.test(blob),
      'file-update line present');
  } else {
    // Fresh recognition narrates in the System's voice; the class line names
    // subclass + god ("Furnace of the Unkillable"), not the path id.
    check('A7 path named (fresh recognition)',
      /THE SYSTEM has a word for what you are becoming/i.test(blob) && /unkillable/i.test(blob),
      'System recognition line present');
  }

  // A8 — the village remembers who led how: lineage carries the old axis.
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const last = lin[lin.length - 1] || {};
  check('A8 lineage files the dead bearer\'s dominant axis',
    last.villagerId === oldId && last.playstyle === 'leader',
    `lineage last=${JSON.stringify({ v: last.villagerId === oldId, playstyle: last.playstyle })}`);

  // A9 — the office still passes: Codex + integration survive the handoff.
  check('A9 office passes (Codex/integration intact)',
    !!(Game.state.codex && Game.state.systemArrived),
    'codex present, system still arrived');

  console.log(failures === 0 ? `\nALL PASS (scenario ${SCENARIO})` : `\n${failures} FAILURES (scenario ${SCENARIO})`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
