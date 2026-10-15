#!/usr/bin/env node
'use strict';
// test-beatmenu-null-label-20261015.js — proof for the null-label guard
// (journey deepening r12, 2026-10-15).
//
// SENSE-CAUGHT: seed 8502 day 60 — the turn-1 menu offered
// `YOU: [dlg:help] null`. Root cause: beatMenuResponses picks the reply label
// via convoPickCycle; when every variant in the entry's `v` pool was already
// said this conversation (the no-repeat ledger), convoPick returns null and
// the choice went out as { id: 'dlg:help', label: null }. On the live UI,
// esc(null) renders a button literally labeled "null" (app.js esc = String).
// The sibling want-menu path already falls back (|| labels[0]); the beat
// path didn't.
//
// FIX: beatMenuResponses falls back to entry.v[0] (then entry.id) when the
// cycle is exhausted — a repeated player-voice label is honest; a "null"
// button is a lie.
//
// REAL-RED: fixture opens a conversation, poisons the convo's said-ledger
// with every label the menu can offer (forcing full pool exhaustion), then
// calls beatMenuResponses again and asserts NO choice carries a null/empty
// label. Pre-fix this fails (the exhausted pool yields label: null).
// GREEN: the fallback supplies a real label on every choice.
//
// Usage: node scripts/test-beatmenu-null-label-20261015.js
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; fails.push(name); console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 31337, mode: 'test-beatmenu-null-label-20261015' });
  if (loadFails && loadFails.length) { ok('module load', false, loadFails.join('; ')); return; }
  ok('module load', true);
  await setupGame(Game);

  const player = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== player);
  let vid = null, menu1 = null;
  for (const cand of roster) {
    try {
      const r0 = Game.startConvo(cand);
      if (!r0) continue;
      const c = Game.convoGet(cand);
      // steer the beat to a non-question tag ('offer'/'small') with no live
      // want, so beatMenuResponses builds the reply-pool menu directly —
      // the machinery under test, not the question/want machinery.
      c.want = null;
      c.lastBeat = { tag: 'offer', topic: 'small', line: 'x' };
      const m = Game.beatMenuResponses(cand);
      if (m && m.length) { vid = cand; menu1 = m; break; }
      Game.endConvo(cand, 'left');
    } catch (e) { try { Game.endConvo(cand, 'left'); } catch (e2) {} }
  }
  if (!vid) { ok('fixture conversation with menu', false, 'no talkable NPC with a beat menu'); return; }
  ok('fixture conversation with menu', menu1.length > 0);

  // poison the no-repeat ledger: every label the menu can offer is "said"
  const c = Game.convoGet(vid);
  c.said = c.said || {};
  const labels = menu1.map(x => x && x.label).filter(l => l != null && String(l).trim() !== '');
  c.said['poison'] = labels.slice();
  // also poison a second fresh menu's worth, in case the first menu drew subsets
  let menu2 = Game.beatMenuResponses(vid);
  const more = (menu2 || []).map(x => x && x.label).filter(l => l != null && String(l).trim() !== '');
  c.said['poison'] = c.said['poison'].concat(more.filter(l => c.said['poison'].indexOf(l) === -1));
  ok('poisoned ledger covers the offered labels', c.said['poison'].length > 0);

  // the contract: EVERY choice must carry a real, non-empty label
  menu2 = Game.beatMenuResponses(vid);
  const bad = (menu2 || []).filter(x => !x || x.label == null || String(x.label).trim() === '');
  ok('no null/empty labels under full pool exhaustion', bad.length === 0,
    bad.length ? `bad ids: ${bad.map(x => x && x.id).join(', ')}` : '');

  // sanity: the menu still offers real choices (we didn't fix it by emptying it)
  ok('menu still offers choices', (menu2 || []).length > 0);

  try { Game.endConvo(vid, 'left'); } catch (e) {}
  console.log(fail ? `\n${fail} FAIL(s): ${fails.join('; ')}` : '\nALL GREEN');
  if (fail) process.exitCode = 1;
}
main().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
