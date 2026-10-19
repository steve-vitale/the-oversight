#!/usr/bin/env node
// test-succession-seed-inherit-20261019.js — PROOF for journey-succession r26:
// "the seed names the dead."
//
// A want-seed planted in the predecessor's conversation (e.g. the NPC's
// unanswered question, walked away from) is stamped inh=<old name> at the
// handoff (ledger.js). But the seed follow-up opener framed it as the
// SUCCESSOR's unfinished business: "About that question — ..." addressed to
// a bearer who never asked — fabricated shared history.
//
// FIX (conversation.js seedLine composition): when the live seed resolves
// via inheritedName() to a predecessor, the follow-up names them once:
// "I asked Kevin about the first week — Kevin's gone. <re-hung question>".
// Favor seeds excluded (convoFavorFollowup names the predecessor itself);
// one-shot via inheritedSeedAcked, mirroring the favor's inheritedAcked.
//
// RED: pre-fix tree -> the opener is the bare "About ..." with no name.
// GREEN: fix -> the opener names the predecessor; a seed planted AFTER the
// death (no stamp) keeps the old framing (control).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '5101', 10);
let pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.error('FAIL:', name); } }

function openerText(Game, vid) {
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  const txt = tr.map(e => String(e.text)).join(' | ');
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return txt;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-seed-inherit-proof' });
  await setupGame(Game);
  await runDays(Game, competent, { days: 10 });
  const v = Game.state.village || {};
  const oldId = Game.villagerId;
  const oldName = ((Game.data.villagers || []).find(x => x.id === oldId) || {}).name || 'Old';
  const oldFirst = oldName.split(' ')[0];
  const roster = (v.roster || []).filter(id => id !== oldId);
  const other = roster[0];
  const ctrl = roster[1];

  // plant a curious seed as the old bearer did plant path, no stamp)
  Game.convoPlantSeed(other, { wantId: 'curious', note: 'the first week', qid: null });

  // force the mantle to the plant target
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 5;
  v.trust[other] = 100;

  Game.playerDeath('the probe');
  const newId = Game.villagerId;
  ok(newId === other && newId !== oldId, 'mantle passed to plant target');

  const seed = (v.convoSeeds || {})[other];
  ok(seed && seed.inh === oldName, `seed stamped inh=${seed && seed.inh}`);

  // the seed follow-up must surface within a few conversations (grief or
  // other commitments may claim the first opener — the seed stays planted)
  let inheritedOpener = null, bareOpener = null;
  for (let round = 0; round < 4 && !inheritedOpener; round++) {
    const txt = openerText(Game, other);
    if (/the first week/i.test(txt)) {
      if (new RegExp('I asked ' + oldFirst + ' about', 'i').test(txt)) inheritedOpener = txt;
      else if (/^"About the first week/i.test(txt) || /"About that question/i.test(txt)) bareOpener = txt;
    }
  }
  if (inheritedOpener) console.log('INHERITED OPENER:', inheritedOpener.slice(0, 220));
  if (bareOpener) console.log('BARE OPENER:', bareOpener.slice(0, 220));
  ok(!!inheritedOpener, 'seed follow-up names the predecessor');
  ok(!bareOpener, 'no bare "About ..." opener without the predecessor named');
  ok(!!(seed && seed.inheritedSeedAcked), 'one-shot flag set on the live seed');

  // CONTROL: a seed planted AFTER the death (the successor's own walkaway)
  // keeps the old framing — no predecessor to name.
  Game.convoPlantSeed(ctrl, { wantId: 'curious', note: 'the storehouse', qid: null });
  let ctrlOpener = null;
  for (let round = 0; round < 4 && !ctrlOpener; round++) {
    const txt = openerText(Game, ctrl);
    if (/the storehouse/i.test(txt)) ctrlOpener = txt;
  }
  if (ctrlOpener) console.log('CONTROL OPENER:', ctrlOpener.slice(0, 200));
  ok(!!ctrlOpener && !/I asked .* about/i.test(ctrlOpener),
    'post-death seed keeps the un-prefixed framing');

  console.log(`\nseed-inherit-proof: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
