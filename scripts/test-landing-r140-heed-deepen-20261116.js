#!/usr/bin/env node
'use strict';
// Proof: warn_you heed goes silent (journey-landing r140, 2026-11-16).
//
// Defect (r139 F1, reproduced live on the r140 BEFORE pilot — seed 1175
// day 12, Nino): the player picks "I'll be careful." and the NPC cycles
// the 3 acknowledgment lines, then goes SILENT — the no-repeat ledger in
// sayLine blocks the 4th+ picks and the heed handler passes no fallback,
// so sayLine returns null and the turn speaks nothing; the want never
// leaves stage 2 (the sitting only ends on the wind-down budget, the
// want resolving as 'engaged', never 'heeded'). Nino heard back 3 times
// for 6 heed picks, then 2 silent turns, then a wind-down dismissal.
//
// Fix (src/js/convo-dialogue.js, same shape as the dlg:stay deepen):
// the 4th heed deepens — the fear gets said out loud (5-variant deepen
// pool) — and the want resolves as 'heeded' via convoWantEngage 'commit'
// (the warn_you def already maps commit -> 'heeded', closeLine "Good.
// Just — be careful. I mean it."); plus a lazy fallback on the heed
// sayLine so a blocked heed still speaks instead of going silent.
//
// RED (pre-fix): heeds 4+ are silent (transcript gains no THEM entry),
// the want stays stage 2, resolution is not 'heeded', and the 4th line
// IS one of the 3 ack lines (phantom repeat in the driver file).
// GREEN (post-fix): 4 heed picks, 0 silent turns, heeds 1-3 are the 3
// distinct ack lines, heed 4 is a deepen line (not an ack line), the
// want is stage 3 / 'heeded', and dlg:heed is no longer offered.
//
// Staging: recentAttacks=1 + trust 50 makes warn_you the natural want
// (r182 pattern); the want is re-hung if the weighted pick drifts.
// c.budget is raised so the sitting has room for 4 heed picks — staging
// only, it does not touch the handler under test.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const ACK = [
  '"Good. I mean it — watch yourself out there."',
  '"Promise me that. Please."',
  '"Thank you. I needed to hear you say it."',
];

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 1175 });
  K.newRun(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const commAble = roster.filter(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  });
  v.trust = v.trust || {};
  for (const id of commAble) { try { v.trust[id] = 50; } catch (e) {} }
  v.recentAttacks = 1;

  // Find a speaker whose natural want pick is warn_you (weighted
  // lottery; recentAttacks=1 makes it the heavyweight, but the pick
  // varies by villager — the r182 test's single-speaker assertion is
  // lottery luck on its seed). The def comes from the natural pick, so
  // the sitting under test is a real warn_you want, not a hand-built one.
  let speaker = null, warnDef = null;
  for (const id of commAble) {
    try {
      const w = Game.convoSelectWant(id);
      if (w && w.id === 'warn_you') { speaker = id; warnDef = w.def; break; }
    } catch (e) {}
  }
  check('a villager naturally picks warn_you with recent attacks', !!speaker,
    `commAble=${commAble.length}`);
  if (!speaker) { console.log(`\n=== RESULT: ${pass} pass, 1 fail ===`); process.exit(1); }
  console.log(`speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  const opened = Game.startConvo(speaker);
  check('sitting opens', !!opened && !opened.refused && !opened.ended);
  const c = Game.convoGet(speaker);
  if (!c.want || c.want.id !== 'warn_you') {
    c.want = { id: 'warn_you', def: warnDef, stage: 1 };
    console.log('[probe] want re-hung to warn_you stage 1');
  }
  // Room for 4 heed picks: the wind-down budget would otherwise swallow
  // a later heed turn (Nino's sitting wound down on the 6th heed).
  try { c.budget = 20; } catch (e) {}
  check('want is warn_you stage 1', c.want.id === 'warn_you' && (c.want.stage || 0) === 1,
    `want=${c.want.id} stage=${c.want.stage}`);

  // The sitting may open on another want's hanging question (pendingQ) —
  // the want menu is suppressed while a question hangs. Answer it (an
  // ans: choice clears pendingQ without deflecting the want) so the
  // warn_you menu — and dlg:heed — is offered.
  for (let t = 0; t < 4; t++) {
    let choices = [];
    try { choices = Game.convoChoices(speaker) || []; } catch (e) { break; }
    const ans = (choices || []).find(ch => ch && ch.id && ch.id.indexOf('ans:') === 0);
    if (!ans) break;
    const r = Game.convoTurn(speaker, ans.id);
    if (r.ended) break;
  }

  // ---- Drive dlg:heed picks while offered (up to 8) ----
  const spoken = [];
  let silent = 0, heeds = 0;
  for (let t = 0; t < 8; t++) {
    let choices = [];
    try { choices = Game.convoChoices(speaker) || []; } catch (e) { break; }
    const heed = (choices || []).find(ch => ch && ch.id === 'dlg:heed');
    if (!heed) break;
    const before = (Game.convoGet(speaker).transcript || []).filter(e => e && e.who === 'them').length;
    const r = Game.convoTurn(speaker, 'dlg:heed');
    heeds++;
    const after = (Game.convoGet(speaker).transcript || []).filter(e => e && e.who === 'them').length;
    const line = String((r && r.line) || '');
    if (after === before) silent++;
    spoken.push(line);
    console.log(`heed ${heeds}: spoken=${after > before} line=${line.slice(0, 90)}`);
    if (r.ended) break;
  }
  console.log(`heeds=${heeds} silent=${silent} wantStage=${c.want.stage} resolution=${c.want.resolution}`);

  // ---- Assertions (GREEN shape) ----
  check('the sitting accepted exactly 4 heed picks (want resolved, menu closed)', heeds === 4,
    `heeds=${heeds}`);
  check('zero silent turns — every heed was spoken', silent === 0, `silent=${silent}`);
  // R150 UPDATE (2026-11-23, r274): the r150 fix changed heed 1 on
  // purpose — the first heed now states the warning via
  // convoWantWarning instead of answering with a generic ack line.
  // Heeds 2-3 are the ack fallbacks (the warning is already delivered,
  // so the handler skips the warning call). The deepen arc (heed 4)
  // is unchanged.
  check('heed 1 states the warning (r150), heeds 2-3 are distinct ack lines',
    heeds >= 3 && !ACK.includes(spoken[0]) && ACK.includes(spoken[1]) && ACK.includes(spoken[2]) &&
    spoken[1] !== spoken[2],
    `spoken[0..2]=${JSON.stringify(spoken.slice(0, 3).map(s => s.slice(0, 40)))}`);
  check('heed 4 is a deepen line, not one of the 3 ack lines',
    heeds >= 4 && !ACK.includes(spoken[3]),
    `spoken[3]=${(spoken[3] || '').slice(0, 120)}`);
  check('no line repeats within the sitting',
    new Set(spoken).size === spoken.length,
    `spoken=${JSON.stringify(spoken.map(s => s.slice(0, 40)))}`);
  check('the want resolved at stage 3', (c.want.stage || 0) === 3, `stage=${c.want.stage}`);
  check("the want resolved as 'heeded'", c.want.resolution === 'heeded',
    `resolution=${c.want.resolution}`);
  let afterChoices = [];
  try { afterChoices = Game.convoChoices(speaker) || []; } catch (e) {}
  check('dlg:heed is no longer offered after the want resolves',
    !(afterChoices || []).some(ch => ch && ch.id === 'dlg:heed'),
    `choices=${(afterChoices || []).map(ch => ch.id).join(',')}`);

  try { Game.endConvo(speaker, 'left'); } catch (e) {}
  console.log(`\n=== RESULT: ${pass} pass ===`);
  process.exit(0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
