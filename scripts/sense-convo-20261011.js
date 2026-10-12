#!/usr/bin/env node
// sense-convo-20261011.js — hold ONE full conversation to natural end and
// print the transcript for human reading (SENSE-TESTING LAW).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const seed = parseInt(process.env.SEED || '424242', 10);
  const { Game } = await loadGame({ seed, mode: 'sense', fullTelemetry: false });
  await setupGame(Game);
  const spoken = [];
  const keepSay = Game.say;
  Game.say = function (t) { spoken.push(String(t)); return keepSay ? keepSay.call(this, t) : t; };
  const roster = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const vid = roster[2];
  console.log('talking to: ' + Game.displayName(vid) + ' (goal: ' + (Game.npcGoal ? Game.npcGoal(vid) : '?') + ', temper: ' + (Game.npcTemper ? Game.npcTemper(vid) : '?') + ')');
  Game.talkTo(vid);
  for (let turn = 0; turn < 14; turn++) {
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { console.log('(ended naturally after ' + turn + ' turns)'); break; }
    const choices = (Game.convoChoices(vid) || []).filter(x => x && x.id && String(x.id) !== 'leave');
    if (!choices.length) break;
    const agency = choices.find(x => String(x.id).indexOf('agency:') === 0);
    const pick = agency || choices[0];
    console.log('--- player picks: ' + pick.id + ' — "' + (pick.label || pick.text || '').slice(0, 80) + '"');
    try { Game.convoTurn(vid, pick.id); } catch (e) { console.log('convoTurn threw: ' + e.message); break; }
  }
  try { const c2 = Game.convoGet(vid); if (c2 && c2.active) Game.endConvo(vid, 'left'); } catch (e) {}
  console.log('\n===== TRANSCRIPT =====');
  const t = (Game.convoGet(vid) || {}).transcript || [];
  for (const beat of t.slice(-24)) {
    const who = beat.speaker === 'player' || beat.who === 'player' ? 'YOU' : 'NPC';
    console.log(who + ': ' + String(beat.text || beat.line || JSON.stringify(beat)).slice(0, 300));
  }
  console.log('\n===== trust: ' + JSON.stringify((Game.state.village.trust || {})[vid]) + ' =====');
})();
