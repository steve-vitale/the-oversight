#!/usr/bin/env node
// sense-fight-assess-r1.js — sense-testing for the scale-wall r3 lever.
// The lever touches only the scholar's fight/forage policy (turn-1 hook +
// forage destination filter). Verify villagers still act like people: sample
// roster (occupations/backstories), drive one full conversation per villager
// with 2 villagers, and judge the transcripts for meaning/coherence.
// Usage: COMPETENT_FIGHT_ASSESS=1 SEED=11 DAYS=25 node scripts/sense-fight-assess-r1.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent.js');

const SEED = parseInt(process.env.SEED || '11', 10);
const DAYCAP = parseInt(process.env.DAYS || '25', 10);

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }

async function driveOne(Game, vid) {
  const out = { vid, name: vname(Game, vid), turns: 0, transcript: [], error: null };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  for (let t = 0; t < 12; t++) {
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) { break; }
    if (!c) break;
    const tr = c.transcript || [];
    for (const line of tr.slice(out.transcript.length)) {
      out.transcript.push({ who: line.who, text: String(line.text || '').slice(0, 220) });
    }
    out.turns = t + 1;
    const choices = (c.choices || []).filter(ch => ch && !ch.disabled);
    if (!choices.length) { out.naturalEnd = true; break; }
    // pick the first non-leave choice; leave when only leave remains
    let pick = choices.find(ch => !/leave|goodbye|bye/i.test(ch.label || ch.text || ''));
    if (!pick) { try { Game.endConvo(vid); } catch (e) {} out.naturalEnd = true; break; }
    try { Game.convoChoose(vid, pick.id != null ? pick.id : pick.label); }
    catch (e) { try { Game.chooseConvo && Game.chooseConvo(vid, pick.id); } catch (e2) { break; } }
  }
  return out;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-fassess' });
  await setupGame(Game);
  const policy = Object.assign({}, competent);
  await runDays(Game, policy, { days: DAYCAP, sampleEvery: 25 });
  const day = ((Game.state || {}).scholar || {}).day || 0;
  console.log(`seed=${SEED} gate=${process.env.COMPETENT_FIGHT_ASSESS || 'off'} day=${day}`);
  // roster sample
  const roster = (((Game.state || {}).village || {}).roster || []).slice(0, 6);
  for (const vid of roster) {
    let info = {};
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      info = { name: vname(Game, vid), occ: p && (p.occupation || p.job), backstory: String((p && (p.backstory || p.bio)) || '').slice(0, 120) };
    } catch (e) { info = { name: vname(Game, vid) }; }
    console.log('VILLAGER:', JSON.stringify(info));
  }
  // two full conversations
  for (const vid of roster.slice(0, 2)) {
    const conv = await driveOne(Game, vid);
    console.log(`\n--- convo with ${conv.name} (${conv.turns} turns, naturalEnd=${!!conv.naturalEnd}) ---`);
    if (conv.error) console.log('ERROR:', conv.error);
    for (const l of conv.transcript.slice(0, 14)) console.log(`  [${l.who}] ${l.text}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
