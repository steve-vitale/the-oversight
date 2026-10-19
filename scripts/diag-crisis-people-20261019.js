#!/usr/bin/env node
// diag-crisis-people-20261019.js — CRISIS LEG r25 people-check (SENSE-TESTING LAW).
// Replays the pilot seed to just past its organic crises (first-grave@6,
// breach@17, the-siege@17 on seed 7), then holds full conversations with two
// villagers and sense-reads them: do they talk about the crises like people?
// Does the NPC want something, do options engage/deflect, do endings
// resolve/plant/owe? No fabricated shared history, no filler loops.
// Usage: SEED=7 node scripts/diag-crisis-people-20261019.js
// Output: full transcripts to stderr; JSON summary to stdout.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '7', 10);
const E = (s) => console.error(s);
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))} (day ${dayOf(Game)})`];
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw: ' + e.message + ')'; }
  try {
    const open = (Game.convoChoices(vid) || []).map(x => `[${x.id}] ${(x.text || x.label || '').slice(0, 80)}`);
    out.push(`OPEN CHOICES (${open.length}): ${open.join(' | ')}`);
  } catch (e) {}
  const picked = [];
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const lastPick = picked[picked.length - 1];
    const pool = choices.filter(c => c.id !== lastPick);
    const use = pool.length ? pool : choices;
    // crisis-lately first, then genuine questions, then anything but exits
    let pick = use.find(c => /^alive:event:/.test(c.id));
    if (!pick) pick = use.find(c => /^lately/.test(c.id));
    if (!pick) pick = use.find(c => /^(ask:past|ask:goal|ask:village|ask:plans|ask:feelings)$/.test(c.id));
    if (!pick) pick = use.find(c => !/^(leave|bye|goodbye|more|silence)$/.test(c.id));
    if (!pick || /^(leave|bye|goodbye)$/.test(pick.id)) break;
    picked.push(pick.id);
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 90)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push('\n### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  return out.join('\n');
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-people', narration: true });
  await setupGame(Game);
  const scholarId = (Game.state.scholar || {}).villagerId;
  E(`[SETUP] seed ${SEED}: oracleV2 to day 25 (past first-grave/breach/siege)...`);
  await runDays(Game, oracleV2, { days: 25 });
  E(`[DAY] reached day ${dayOf(Game)}, over=${!!Game.over}`);
  const v = Game.state.village || {};
  const alive = (v.roster || []).filter(id => {
    if (id === scholarId) return false;
    try { return !(Game.vpOf(id) || {}).dead; } catch (e) { return false; }
  });
  E(`[ROSTER] ${alive.length} alive non-scholar villagers`);
  const rec = { seed: SEED, day: dayOf(Game), talked: [] };
  for (const vid of alive.slice(0, 2)) {
    const tag = firstName(rawName(Game, vid));
    E(driveConvo(Game, vid, tag, 12));
    rec.talked.push(tag);
  }
  console.log(JSON.stringify(rec));
})();
