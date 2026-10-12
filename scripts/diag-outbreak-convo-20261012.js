#!/usr/bin/env node
// diag-outbreak-convo-20261012.js — PEOPLE CHECK: outbreak conversations.
// Sets up a village mid-outbreak (4 sick villagers), then holds full
// natural-path conversations with TWO sick villagers and dumps the complete
// transcripts. SENSE-TESTING LAW: read for meaning, coherence, relevance —
// does each NPC want something, do options engage/deflect, does it resolve?
// Usage: SEED=20261012 node scripts/diag-outbreak-convo-20261012.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '20261012', 10);
const pname = (Game, vid) => { try { return Game.displayName(vid); } catch (e) { return String(vid).slice(0, 10); } };

function drive(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 16;
  const out = [];
  out.push(`## ${tag} — talking to ${pname(Game, vid)}\n`);
  Game.startConvo(vid);
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /how|feeling|holding|news|day|worried|afraid|sick|fever|tents/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 90)}`);
    try { Game.convoTurn(vid, pick.id); }
    catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push(`FINAL: want=${(c.want && c.want.id) || 'none'} resolution=${(c.want && c.want.resolution) || 'n/a'}`);
  out.push(`\n### FULL TRANSCRIPT (${(c.transcript || []).length} exchanges)`);
  for (const e of (c.transcript || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
  return out.join('\n');
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'outbreak-convo' });
  await setupGame(Game);
  const v = Game.state.village;
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  // OUTBREAK: 4 sick villagers
  v.sick = v.sick || {};
  const defs = [
    { name: 'gut rot', daysLeft: 5, severity: 2 },
    { name: 'the fever', daysLeft: 4, severity: 1 },
    { name: 'wound fever', daysLeft: 6, severity: 3 },
    { name: 'gut rot', daysLeft: 4, severity: 2 },
  ];
  const sickIds = ids.slice(0, 4);
  sickIds.forEach((id, i) => { v.sick[id] = defs[i]; });
  v.trust = v.trust || {};
  for (const id of sickIds) v.trust[id] = 35;
  console.log(`outbreak: ${sickIds.map(id => pname(Game, id)).join(', ')} are sick\n`);
  console.log(drive(Game, sickIds[0], 'OUTBREAK-1 — gut rot sev2, first sick villager'));
  console.log('\n\n' + '='.repeat(70) + '\n');
  console.log(drive(Game, sickIds[2], 'OUTBREAK-2 — wound fever sev3, third sick villager'));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
