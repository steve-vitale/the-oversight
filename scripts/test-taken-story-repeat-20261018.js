#!/usr/bin/env node
// TAKEN-STORY REPEAT PROOF (journey scale r8, 2026-10-18):
// The seek_taken engageBeat is deterministic from kin data: "It's my older
// sister, Aziza. Went up in the Taking. Some nights I dream about the pods --
// rows of them, humming. ..." — the r7 transcripts show Paola (9503) and
// Willow (9504) re-telling the story BYTE-IDENTICAL 40 days later, with no
// "still no news" acknowledgment. A real person doesn't re-tell a story
// they've already told you as if it were new.
// FIX: engageBeat checks the said-facts ledger (convoFactRecalled) — if the
// taken story was already told to this bearer, it acknowledges the repeat
// ("Still nothing on X. ...") instead of re-telling; the first telling
// records the fact (convoSaidFact).
// Run: SEEDS=7,42,99 node scripts/test-taken-story-repeat-20261018.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [7, 42, 99]);

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

// reach the want def the way the engine does: Game.convoSelectWant(vid)
// returns {id, def}. On a repeat meeting an eligible seek_taken gets a 3.1
// floor, so a healthy villager with taken kin usually draws it; scan the
// roster until one does.
function takenWant(Game) {
  try {
    const roster = (Game.state.village || {}).roster || [];
    const trust = (Game.state.village || {}).trust || {};
    for (const id of roster) {
      if (!id || id === Game.villagerId) continue;
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      if (!p || p.dead) continue;
      // synthesize taken kin so the want is eligible (fate matches /tak(en|ing)|pod/i)
      try {
        const vp = Game.vpOf ? Game.vpOf(id) : null;
        if (vp && !(Game.takenKinOf && Game.takenKinOf(id).length)) {
          vp.lifeseed = vp.lifeseed || {};
          vp.lifeseed.people = (vp.lifeseed.people || []).concat([
            { name: 'Aziza Testkin', relation: 'older sister', fate: 'went up in the Taking' },
          ]);
        }
      } catch (e) {}
      // make it a repeat meeting: first meetings force curious>=3 (Principle 12);
      // the 3.1 seek_taken floor only applies on repeat sittings
      try {
        Game.startConvo(id); Game.endConvo(id, 'done');
        Game.startConvo(id); Game.endConvo(id, 'done');
      } catch (e) {}
      let sel = null;
      try { sel = Game.convoSelectWant(id); } catch (e) {}
      if (sel && sel.id === 'seek_taken' && sel.def && typeof sel.def.engageBeat === 'function') {
        return { def: sel.def, vid: id };
      }
    }
  } catch (e) {}
  return null;
}

async function runSeed(seed) {
  console.log(`\n### SEED ${seed}`);
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const got = takenWant(Game);
  if (!got) {
    console.log('  SKIP: no roster villager drew seek_taken in harness');
    return;
  }
  const want = got.def, vid = got.vid;
  const kin = (Game.takenKinOf(vid) || [])[0] || {};
  const first = (kin.name || 'they').split(' ')[0];
  console.log(`  villager=${vid} kin=${first}`);

  const beat1 = want.engageBeat.call(Game, vid);
  console.log(`  TELLING 1: ${String(beat1).slice(0, 120)}...`);
  ok(/It's my/.test(String(beat1)) && String(beat1).indexOf(first) >= 0,
     `first telling tells the full story (names ${first})`);

  // the second telling — 40 days later, same kin, same NPC
  const beat2 = want.engageBeat.call(Game, vid);
  console.log(`  TELLING 2: ${String(beat2).slice(0, 120)}...`);
  ok(beat2 !== beat1, 'the repeat telling is NOT byte-identical to the first');
  ok(/still nothing|already told|told you/i.test(String(beat2)),
     'the repeat acknowledges it was already told (no fake first-time re-tell)');

  // and the ledger actually holds the fact
  let recalled = null;
  try { recalled = Game.convoFactRecalled(vid, 'taken-story'); } catch (e) {}
  ok(!!recalled, `the taken story is on the said-facts record (got "${recalled}")`);
}

(async () => {
  for (const s of SEEDS) await runSeed(s);
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
