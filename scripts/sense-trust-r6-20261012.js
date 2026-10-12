#!/usr/bin/env node
// sense-trust-r6-20261012.js — SENSE-TESTING for the moot afterlife (2026-10-12).
// Captures a full petition-moot transcript (interview -> moot -> count ->
// verdict) and then checks the next-day conversation surface: does
// convoWhatsAlive offer "About the moot over the petitioners..."?
// Usage: SEED=11 node scripts/sense-trust-r6-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const seed = parseInt(process.env.SEED || '11', 10);
  const { Game } = await loadGame({ seed, mode: 'proof', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  const v = Game.state.village;

  // make room
  let guard = 0;
  while (Game.havenRoom() < 3 && guard++ < 20) {
    const cands = (v.roster || []).filter(id => id !== Game.villagerId);
    if (!cands.length) break;
    try { Game.removeVillager(cands[0], 'sense-room'); }
    catch (e) { v.roster = (v.roster || []).filter(id => id !== cands[0]); }
  }

  const pet = {
    id: 'pet_sense_r6', day: (Game.state.scholar || {}).day || 0,
    cause: 'famine-flight', originName: 'Grayhollow', originVillage: 'ov_gray',
    petitioners: [
      { name: 'Wren Ashdown', occupation: 'forager', temperament: 'steady' },
      { name: 'Tomas Reed', occupation: 'hunter', temperament: 'bold' },
    ],
    interviews: [],
  };
  Game.state.pendingPetition = pet;
  // interview like a real player would
  Game.petitionInterview(pet.id, 'why');
  Game.petitionInterview(pet.id, 'bring');
  Game.conductPetitionMoot(pet.id);
  Game.answerPetition(pet.id, 'accept');

  console.log('=== MOOT TRANSCRIPT (say log) ===');
  for (const l of lines) console.log(l.replace(/<[^>]*>/g, '').slice(0, 300));
  console.log('=== END TRANSCRIPT ===\n');

  // next day: talk to a voter — is the moot a live topic?
  if (typeof Game.advanceDay === 'function') Game.advanceDay();
  const voter = (pet.vote && pet.vote.votes && pet.vote.votes[0] && pet.vote.votes[0].vid) || null;
  if (voter && typeof Game.convoWhatsAlive === 'function') {
    const alive = Game.convoWhatsAlive(voter) || [];
    console.log(`Voter: ${Game.displayName(voter)}`);
    console.log('WhatsAlive items:');
    for (const it of alive.slice(0, 6)) console.log('  -', (it.label || '').slice(0, 120));
    const mootItem = alive.find(it => String(it.id || '').indexOf('alive:memory:petition_moot') === 0);
    console.log(mootItem ? 'MOOT MEMORY IS A LIVE TOPIC: yes' : 'MOOT MEMORY IS A LIVE TOPIC: no');
    // take the topic if offered — open the conversation first, like a player would
    if (mootItem && typeof Game.convoTurn === 'function' && typeof Game.talkTo === 'function') {
      try { Game.talkTo(voter); } catch (e) {}
      Game.say = function (t) { lines.push('[CONVO] ' + String(t)); };
      let turnRes = null;
      try { turnRes = Game.convoTurn(voter, mootItem.id); } catch (e) { lines.push('[CONVO] turn error: ' + (e && e.message)); }
      console.log('\n=== CONVO TURN ON THE MOOT TOPIC ===');
      console.log('turn result:', JSON.stringify(turnRes).slice(0, 400));
      for (const l of lines.filter(x => x.indexOf('[CONVO]') === 0).slice(-12))
        console.log(l.slice(8).replace(/<[^>]*>/g, '').slice(0, 300));
      try { Game.endConvo(voter, 'left'); } catch (e) {}
    }
  } else {
    console.log('no voter / no convoWhatsAlive');
  }
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
