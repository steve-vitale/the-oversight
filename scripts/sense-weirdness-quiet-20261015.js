#!/usr/bin/env node
// sense-weirdness-quiet-20261015.js — focused sense-test of the r16 fix in a
// quiet moment (no naming debate, no grief): one villager contracts
// croakbelly through the REAL villagerMonsterWeirdness eat-time roll path,
// then full transcripts with the quirked villager + 2 healthy ones.
// Do the conversations carry the transformation?
// Usage: SEED=6101 node scripts/sense-weirdness-quiet-20261015.js
'use strict';
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const SEED = parseInt(process.env.SEED || '6101', 10);
const E = (s) => console.error(s);
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } });
}
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))}`];
  let latelyKind = 'unknown';
  try { const ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; latelyKind = ev ? ev.kind : 'none'; } catch (e) {}
  out.push(`[latelyKind=${latelyKind}]`);
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw)'; }
  for (let t = 0; t < maxTurns; t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
    if (!choices.length) break;
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => c.id === 'alive:event:weirdness');
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    out.push(`> [${pick.id}] ${pick.text}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push('(turn threw)'); break; }
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.push('(ended)'); break; }
    for (const e of (c.transcript || []).slice(-2)) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 450)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return out.join('\n');
}
async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-weirdness', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 20 });
  const roster = livingRoster(Game).filter(id => id !== Game.villagerId);
  const qvid = roster[0], h1 = roster[1], h2 = roster[2];
  // REAL eat-time path: the same call the meal loop makes, real 100% roll
  // via chanceOverride (the roll itself is what we're bypassing, not the
  // downstream machinery — applyStatus, say-line, codex, remember).
  const hit = Game.villagerMonsterWeirdness(qvid, { plantId: 'meat_belltoad', foodState: 'cleaned', name: 'belltoad meat' }, 1.0);
  E(`[STAGE] d${dayOf(Game)}: ${firstName(rawName(Game, qvid))} <- croakbelly via real eat path (hit=${hit})`);
  try {
    const p = Game.getPerson(qvid);
    E(`[CHECK] hasStatus croakbelly: ${Game.hasStatus(p, 'croakbelly')}`);
  } catch (e) { E('[CHECK] threw: ' + e.message); }
  await runDays(Game, oracleV2, { days: 1 });
  for (const [vid, tag] of [[qvid, 'quirked'], [h1, 'healthy'], [h2, 'healthy']]) {
    E(driveConvo(Game, vid, tag));
    E('');
  }
}
main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
