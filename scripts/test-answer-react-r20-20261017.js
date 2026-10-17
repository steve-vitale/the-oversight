#!/usr/bin/env node
// test-answer-react-r20-20261017.js — journey-social r20 proof test.
//
// BLANK: the NPC asks the player a direct question (ans: choice); the player
// answers; the NPC's acknowledgment (react) is run-ledger-blocked and
// sayLine dry-replaces it -> "...Sorry, lost my train of thought." The NPC
// asked YOU something and didn't listen to the answer. Transcript-caught in
// r20 (1405-competent-sample-day45: Rafael asks "So what's your plan here?",
// player answers "One day at a time.", NPC: "...Sorry, lost my train of
// thought."). M3 people-check soft-FAIL.
//
// RED (pre-fix): forced-blocked react -> deflection line.
// GREEN (post-fix): falls back to the generic "Huh. Okay." acknowledgment
//   (first unblocked of [specific react, generic] wins — the r19 opener
//   pattern); dry only when BOTH are blocked.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [4242, 4243, 4244];
let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name); }
}
function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who !== 'you' && tr[i].text) return String(tr[i].text);
  }
  return '';
}
// NPC lines added by one convoTurn (the react is the FIRST new NPC line;
// a qd.follow follow-up beat may trail it).
function newNpcLines(Game, vid, before) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  return tr.slice(before).filter(e => e.who !== 'you' && e.text).map(e => String(e.text));
}
function expectedReact(Game, vid, qid, aid) {
  const cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'characterGen.json'), 'utf8'));
  const qd = (cg.convo.questions || []).find(q => q.id === qid);
  const ad = qd && (qd.answers || []).find(a => a.id === aid);
  let react = (ad && ad.react) || '"Huh. Okay."';
  const regionNow = (Game.homeRegion || (Game.state.scholar || {}).homeRegion) || 'there';
  react = react.replaceAll('{region}', regionNow);
  // NOTE: voiceLine is stubbed to identity by the caller during the turn
  // (it consumes Math.random for voice decoration — orthogonal to the
  // no-repeat block decision under test). Both sides use the stub.
  return Game.voiceLine(vid, Game.fillTalkLine(react, Game.vpOf(vid)));
}
function ledgerKey(Game, line) {
  return Game.convoSplitBeats(line)[0].trim();
}
function livingIds(Game) {
  const vv = Game.state.village || {};
  return (vv.roster || []).filter(id => {
    if (id === Game.villagerId) return false;
    try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
    return true;
  });
}
function findAnsChoice(Game, vid) {
  const choices = Game.convoChoices(vid) || [];
  return choices.find(x => x && /^ans:/.test(String(x.id || '')) && !/honest_pass/.test(String(x.id || ''))) || null;
}

async function oneSeed(seed) {
  console.log('seed ' + seed + ':');
  const { Game } = await loadGame({ seed, mode: 'test-answer-react-r20' });
  await setupGame(Game);
  let cases = 0;
  for (const vid of livingIds(Game)) {
    if (cases >= 3) break;
    Game.startConvo(vid);
    const pick = findAnsChoice(Game, vid);
    if (!pick) { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
    const parts = String(pick.id).split(':');
    const qid = parts[1], aid = parts[2];
    // Force the RED: pre-block the specific react in the run ledger.
    // voiceLine is stubbed to identity on both sides (it consumes RNG for
    // voice decoration; the block decision is what's under test).
    const _vl = Game.voiceLine;
    Game.voiceLine = function (vid2, line) { return line; };
    let reactOut, isDefl, blockedBefore, blockedAfter, isGeneric, gotGeneric, genericBlocked;
    try {
      const reactLine = expectedReact(Game, vid, qid, aid);
      const key = ledgerKey(Game, reactLine);
      const rl = Game.convoRunLedger();
      blockedBefore = Game.convoWouldBlock(vid, reactLine);
      isGeneric = /^"?Huh\. Okay\.\"?$/.test(key.replace(/^"+|"+$/g, ''));
      if (!rl.includes(key)) rl.push(key);
      blockedAfter = Game.convoWouldBlock(vid, reactLine);
      // Is the generic fallback ALSO blocked (e.g. an earlier villager said
      // "Huh. Okay." this run)? Then dry is the correct outcome.
      const genericLineProbe = Game.fillTalkLine('"Huh. Okay."', Game.vpOf(vid));
      genericBlocked = Game.convoWouldBlock(vid, genericLineProbe);
      const trBefore = ((Game.convoGet(vid) || {}).transcript || []).length;
      Game.convoTurn(vid, pick.id);
      const fresh = newNpcLines(Game, vid, trBefore);
      reactOut = fresh[0] || '';
      isDefl = Game.convoIsDeflectionLine(reactOut);
      const genericLine = Game.fillTalkLine('"Huh. Okay."', Game.vpOf(vid));
      gotGeneric = reactOut.replace(/^"+|"+$/g, '').trim() === genericLine.replace(/^"+|"+$/g, '').trim()
        || /Huh\. Okay\./.test(reactOut);
    } finally {
      Game.voiceLine = _vl;
    }
    // Sanity: my key computation must match the game's own block decision.
    ok(!blockedBefore && blockedAfter, 'key computation matches convoWouldBlock (qid=' + qid + ')');
    cases++;
    if (isGeneric || genericBlocked) {
      // The specific react IS the generic, or the generic is also blocked
      // (an earlier villager said it this run): dry is the CORRECT outcome
      // even post-fix.
      ok(isDefl, 'answer goes dry honestly when all acks blocked (qid=' + qid + ')');
      console.log('    (all-blocked) react: ' + reactOut.slice(0, 60));
    } else {
      // Post-fix GREEN: falls back to the generic acknowledgment.
      ok(gotGeneric && !isDefl, 'blocked react falls back to generic ack, not dry (qid=' + qid + ')');
      console.log('    react: ' + reactOut.slice(0, 80) + (isDefl ? ' [DRY]' : ''));
    }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  ok(cases >= 2, 'at least 2 answer cases exercised (got ' + cases + ')');
}

async function main() {
  for (const s of SEEDS) await oneSeed(s);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
