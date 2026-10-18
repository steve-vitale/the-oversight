#!/usr/bin/env node
// sense-crisis-deathoncam-20261018.js — CRISIS LEG r23, M3: people check.
// Stages a villager death in a televised contest (real _contestDie watch
// path), then talks to 4 living villagers and SENSE-reads the output:
// does the village's conversation carry the on-camera death — lately
// beats, menu choices, named grief? Output: full transcripts to stderr,
// JSON verdicts to stdout.
// Usage: SEED=2210 node scripts/sense-crisis-deathoncam-20261018.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '2210', 10);
const E = (s) => console.error(s);

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}

async function talk(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 10;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))}`];
  let latelyKind = 'none';
  try { const ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; latelyKind = ev ? (ev.kind || 'unknown') : 'none'; } catch (e) {}
  out.push(`[latelyKind=${latelyKind}]`);
  try { Game.startConvo(vid); } catch (e) { out.push('(startConvo threw: ' + e.message + ')'); return { vid, tag, latelyKind, lines: out }; }
  for (let t = 0; t < maxTurns; t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { out.push('(convoChoices threw)'); break; }
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const lbl = (c) => ((c.label || '') + ' ' + (c.id || ''));
    const pick = choices.find(c => /mourn|grief|grave|dead|died|contest|arena|show|broadcast|camera|gone|funeral|lately/i.test(lbl(c)))
      || choices.find(c => /ask:lately|lately/i.test(c.id || ''))
      || choices.find(c => !/^(leave|silence|bye|goodbye)$/.test(c.id || ''));
    if (!pick) { out.push('(no usable choice)'); break; }
    out.push(`> YOU PICK [${pick.id}] "${(pick.label || '').slice(0, 90)}"`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push('(convoTurn threw: ' + e.message + ')'); break; }
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    for (const e2 of (c.transcript || []).slice(-2)) out.push(`  ${(e2.who === 'you' ? 'YOU' : 'NPC')}: ${String(e2.text || '').slice(0, 220)}`);
    if (/^(leave|silence|bye|goodbye)$/.test(pick.id)) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return { vid, tag, latelyKind, lines: out };
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, narration: true });
  await setupGame(Game);
  const pool = Game.contestPool() || [];
  const contest = pool.find(c => c.cat === 'blood');
  if (!contest) { console.log(JSON.stringify({ seed: SEED, error: 'no blood contest' })); process.exit(2); }
  const vids = (Game.npcIds() || []).filter(id => id !== Game.villagerId);
  const victim = vids[0];
  const vname = firstName(rawName(Game, victim));
  E(`# staging: ${vname} dies on camera in ${contest.name}`);
  // Replicate the REAL post-contest state: fireContest plants v.lastContest
  // (r17 — the 'show' lately event), the watch-death runs the real choke
  // point (blood-on-air, gossip, roster removal). Only the interactive
  // arena sequence is skipped (not RNG-drivable deterministically).
  try {
    Game.state.village.lastContest = { day: (Game.state.scholar || {}).day || 1, name: contest.name || contest.id, ids: [victim] };
  } catch (e) {}
  Game._contestDie({ participant: victim, contestId: contest.id, phase: 'x', phaseIdx: 0, phases: [], _refused: false }, 'the staged arena');

  const listeners = (Game.npcIds() || []).filter(id => id !== Game.villagerId && Game.isMember(id)).slice(0, 4);
  const convos = [];
  for (const lid of listeners) convos.push(await talk(Game, lid, `post-death (seed ${SEED})`));
  for (const c of convos) { E(''); for (const l of c.lines) E(l); }

  const DEATHRE = new RegExp(vname + '|contest|arena|died|dead|gone|mourn|grave|camera|broadcast', 'i');
  const verdicts = convos.map(c => ({
    vid: String(c.vid).slice(0, 12),
    latelyKind: c.latelyKind,
    carriesDeath: c.lines.some(l => DEATHRE.test(l)),
  }));
  console.log(JSON.stringify({ seed: SEED, victim: vname, contest: contest.name, verdicts }, null, 1));
})().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(2); });
