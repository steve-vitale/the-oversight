#!/usr/bin/env node
// PROOF (journey establishment r16, 2026-10-18): a conversation turn must
// NEVER return a null line.
//
// RED (pre-fix): the winddown 'more' branch (conversation.js, base convoTurn)
//   does done(beat || this.convoPickCycle(vid, 'exh', ...)) — when the thread
//   is dry AND the exhausted pool is fully ledger-blocked, convoPickCycle
//   returns null and the turn returns { line: null }. Observed live in
//   r15 (seed 61, Wilhelm): "YOU: [more] \"One more thing —\"" ->
//   "THEM: null" — a null line that would reach the phone UI.
// GREEN (post-fix): the branch falls back to a dry admission
//   ("That's the whole of it. Sorry."), matching the dlg:more dry pattern.
//
// Reproduces the ledger-saturated state deterministically: the no-repeat
// ledger (v.conv[vid].said) persists across conversations by design, so a
// much-talked-to villager can have every exhausted line said — and
// convoPickCycle's own reset can't recover when the pool is covered.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const fails = [];
  const ok = (cond, label) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + label); if (!cond) fails.push(label); };

  const roster = ((Game.state.village || {}).roster || []).filter(id => {
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return false; }
  });
  if (!roster.length) { console.log('SKIP: no living villager'); process.exit(2); }
  const vid = roster[0];

  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  c.thread = null; // dry thread: convoThreadBeat returns null
  // saturate the no-repeat ledger so convoPickCycle('exh') -> null
  const pool = (((Game.data || {}).characterGen || {}).convo || {}).exhausted || [];
  ok(pool.length > 0, 'exhausted pool non-empty (' + pool.length + ' lines)');
  c.said = c.said || {};
  c.said['exh'] = pool.slice();
  c.said['exh_shadow'] = pool.slice(); // covers convoPickCycle's own reset

  let r = null;
  try { r = Game.convoTurn(vid, 'more'); }
  catch (e) { ok(false, "convoTurn('more') threw: " + e.message); }

  ok(!!r, 'convoTurn returned a result object');
  ok(r && typeof r.line === 'string' && r.line.length > 0,
    'turn line is a non-empty string (RED: null -> "THEM: null" in transcript)');
  if (r && typeof r.line === 'string') console.log('   more line: ' + r.line.slice(0, 80));
  try { Game.endConvo(vid, 'done'); } catch (e) { /* test-only */ }

  // SIBLING (r16): the 'agree' branch has the same shape —
  // convoPick(agree:temp) || convoPickCycle(agreefill) can both null.
  Game.startConvo(vid);
  const c2 = Game.convoGet(vid);
  c2.genericQ = null; c2.reactiveQ = null; // force the bare-acknowledgment path
  // saturate: every agree-line key the branch can consult
  const cgA = (((Game.data || {}).characterGen || {}).convo || {}).agreeReacts || {};
  const agreePool = ['"Yeah."', '"Mm."', '"Right."', 'Nods along.'];
  c2.said = c2.said || {};
  for (const k of Object.keys(cgA)) {
    const arr = Array.isArray(cgA[k]) ? cgA[k] : [cgA[k]];
    c2.said['agree:' + k] = arr.slice();
    c2.said['agree:' + k + '_shadow'] = arr.slice();
  }
  c2.said['agreefill'] = agreePool.slice();
  c2.said['agreefill_shadow'] = agreePool.slice();
  let r2 = null;
  try { r2 = Game.convoTurn(vid, 'agree'); }
  catch (e) { ok(false, "convoTurn('agree') threw: " + e.message); }
  ok(r2 && typeof r2.line === 'string' && r2.line.length > 0,
    "agree turn line is a non-empty string (sibling of the 'more' null)");
  if (r2 && typeof r2.line === 'string') console.log('   agree line: ' + r2.line.slice(0, 80));
  try { Game.endConvo(vid, 'done'); } catch (e) { /* test-only */ }

  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
