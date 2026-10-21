#!/usr/bin/env node
// test-social-r35-helpspendout-20261020.js -- PROOF TEST (journey-social r35).
// BLANK (transcript-caught, pilot r35): when an ask_favor want sits in a
// settled state (fulfilled/thanked/broken/acknowledged/declined/moot) and was
// never engaged (stage < 2, so the beat pool's NO-REPEAT-OFFER suppression
// doesn't apply), the "How can I help?" (dlg:help) choice answered honestly
// once — "It's already handled. Thank you for asking." — and then the menu
// RE-OFFERED it every turn. The NPC parroted the dead reply verbatim x5+ in
// one sitting (s3204 d39 Leo, s3205 d54 Elena, s3206 d45 Nino, s3207 d53
// Hannah). The r31 recap class: an exhausted topic must spend out of the
// menu per sitting, not cycle verbatim.
// FIX (src/js/convo-dialogue.js): the settled-favor branch of the dlg:help
// handler calls convoSpendChoice(vid, 'dlg:help') — the choice leaves the
// menu for this sitting via the pre-existing spent-ledger filter (the same
// filter r31's recap test proves). c.spent resets per sitting, so a fresh
// conversation re-arms the offer honestly.
// This test drives the REAL turn dispatch (Game.convoTurn) and asserts the
// fix's ledger write — the menu filter itself is r31-proven machinery.
// GREEN: (1) the settled pick answers "already handled"; (2) the handler
// writes spent['dlg:help']; (3) a fresh sitting resets the ledger.
// RED (pre-fix): (2) fails — the ledger is never written, so the menu keeps
// re-offering the dead choice (pilot: verbatim x5+).
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 777035, mode: 'help-spendout-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // Pin a settled, never-engaged ask_favor want: the exact pilot shape
  // (settled favor + stage < 2 slips past the beat pool's wantEngaged guard).
  c.want = { id: 'ask_favor', stage: 1, favor: { id: 'f-proof', kind: 'food', state: 'fulfilled' } };

  // The settled pick through the real turn dispatch.
  const r1 = safe(() => Game.convoTurn(vid, 'dlg:help'), null);
  const line1 = r1 && r1.line ? String(r1.line) : String(r1);
  console.log('help pick 1:', line1);
  if (!/already handled/i.test(line1)) fail('settled help pick did not say "already handled": ' + line1);

  // The fix's ledger write: the choice is spent for this sitting.
  const spent = (Game.convoGet(vid).spent || {})['dlg:help'];
  console.log('spent[dlg:help] after settled pick:', !!spent);
  if (!spent) fail('settled help pick did not spend dlg:help (menu will re-offer the dead choice)');

  // Fresh sitting: the per-sitting ledger resets (r31 discipline).
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  const spent2 = Game.convoGet(vid).spent || {};
  console.log('fresh-sitting spent ledger:', JSON.stringify(spent2));
  if (spent2['dlg:help']) fail('dlg:help spend leaked across sittings');
  Game.endConvo(vid, 'left');

  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — settled help spends out per sitting');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
