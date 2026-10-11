#!/usr/bin/env node
// sense-travel-20261011.js — SENSE-TESTING transcript capture (travel lever).
// Scripted: form a young subordinate link, kill the player, capture the
// grief beat + its three answers; capture refuseTheScale copy; capture the
// Regional Dawn first-link beat. Human-judged for meaning/coherence.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

async function main() {
  const { Game } = await loadGame({ seed: 777, mode: 'sense', fullTelemetry: false });
  await setupGame(Game);
  const say = [];
  const osay = Game.say;
  Game.say = function (m) { if (typeof m === 'string') say.push(m); return osay.apply(this, arguments); };
  await runDays(Game, competent, { days: 25 });
  const dump = (tag) => { console.log('==== ' + tag + ' ===='); for (const m of say.splice(0)) console.log(m + '\n'); };

  // 1. Regional Dawn: first link
  const v1 = (Game.state.otherVillages || []).find(v => Game.knowsVillage(v));
  console.log('village:', v1.name);
  const l1 = Game._formLink(v1.id, { asSubordinate: true, tributeKcalPerWeek: 4000 }, { score: 70, reasons: [] });
  Game.stageFirstAccord(l1);
  dump('REGIONAL DAWN (first link beat)');
  console.log('accord answer gift:', Game.answerAccord('gift'));

  // 2. grief beat on the young link
  const v2 = (Game.state.otherVillages || []).find(v => v.id !== v1.id && Game.knowsVillage(v));
  const l2 = Game._formLink(v2.id, { asSubordinate: true, tributeKcalPerWeek: 4000 }, { score: 70, reasons: [] });
  say.length = 0;
  Game.onLeaderDeath(Game.villagerId);
  dump('GRIEF BEAT (young link, first death)');
  console.log('answer gift:', Game.answerRenegotiation(l2.id, 'gift'));
  dump('GRIEF BEAT ANSWER: gift');

  // 3. coalesced death (fixed engine): second death while grieving
  say.length = 0;
  const l3v = (Game.state.otherVillages || []).find(v => v.id !== v1.id && v.id !== v2.id && Game.knowsVillage(v));
  let l3 = null;
  if (l3v) {
    l3 = Game._formLink(l3v.id, { asSubordinate: true, tributeKcalPerWeek: 4000 }, { score: 70, reasons: [] });
    Game.onLeaderDeath(Game.villagerId);
    say.length = 0;
    const r = Game.onLeaderDeath(Game.villagerId);
    console.log('second death returns:', r, '| trust:', l3.trust);
    dump('COALESCED DEATH (no new beat expected)');
  }

  // 4. refuse the scale
  say.length = 0;
  console.log('refuseTheScale:', Game.refuseTheScale());
  dump('REFUSE THE SCALE');
  console.log('scaleRefused:', !!Game.state.scaleRefused, 'rank:', Game.scaleRank());
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
