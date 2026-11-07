#!/usr/bin/env node
// test-journey-succession-r155-opener-skip.js — proof test for the r155
// OPENER-SKIP fix (journey-succession r155, Lane B leg 7).
//
// The gap (found on the r151 after-leg, seed 33806 d+45 Katarina, and
// reproduced on the r155 before-leg, seeds 33803/33806, current master):
// three opening beats in conversation.js startConvo speak a SINGLE fixed
// line through sayLine with no convoWouldBlock guard, so a run-ledger
// block dry-replaces the opening with "...Sorry, lost my train of
// thought." — right after a live opener, before the player picks anything.
//   (a) the knowledge-trade SEEDING line (conversation.js:5620) — one
//       fixed string; dried 3x on r151's 33806 (Ella d56, Katarina d80,
//       Katarina d86) and 2x on the r155 before-leg (33803 d62 Owen,
//       33806 d39 Ivy). The old code ALSO set traderMentioned=true on
//       the dry line, so the mechanic read as introduced although the
//       player never heard it.
//   (b) the staged bond-proposal beat (conversation.js:5565) — 33803
//       d77 Caleb dried ("I've been thinking. You and me — we should
//       be bonded...").
//   (c) the staged link-raise beat (conversation.js:5570) — 33806 d39
//       Ivy dried ("I've heard good things about Stonebridge...").
// The talk-request opener itself already has the r19 OPENER SKIP
// (convoOpening #1: a blocked request line is skipped, not delivered) —
// but startConvo's beat block re-spoke the same blocked line unguarded.
// The fix (r19 shape): skip the blocked beat; the pending stays staged
// and the request stays undelivered, so it fires next conversation once
// the 48-entry ledger slides. Holding it instead would only defer the
// same blocked sayLine to the goon turn (held beats speak via sayLine).
//
// Cases (each in its own process — never two harnesses in one process):
//   trade-blocked : trader + taught plant, seed line poisoned. startConvo
//     must NOT dry, must NOT speak the seed, must NOT mark traderMentioned.
//     RED on unfixed code (dry line + mentioned=true).
//   trade-control : same setup, no poison. The seed speaks and
//     traderMentioned becomes true. (Passes on unfixed code too: pins the
//     speak path.)
//   bond-blocked  : staged bond proposal + talk request, proposal line
//     poisoned. Sitting 1 speaks the request (delivered); sitting 2
//     re-speaks the raw line as the beat — startConvo must NOT dry, must
//     NOT speak the proposal, pending must stay staged. RED on unfixed code.
//   link-blocked  : staged link raise + talk request, raise line
//     poisoned. Same assertions as bond-blocked. RED on unfixed code.
//   beats-control : staged bond + link proposals, no poison. Both lines
//     are spoken (bond as the talk-request opener; link as its beat) and
//     no dry line appears. (Passes on unfixed code too: pins the paths.)
// Usage: node scripts/test-journey-succession-r155-opener-skip.js [case]
//   Default (no arg): runs all cases, spawning children for the
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

const DRY = [
  '"...Sorry, lost my train of thought."',
  '"Hm. Never mind — go on."',
  '"...Actually, forget it."',
  '"...Where was I? Gone. Ask me something else."',
  '"Huh. That went clean out of my head."',
  '"...No, it\'s not coming back. What were you saying?"',
  '"Lost it. The thought, I mean. Go on."',
  '"...Sorry — that one slipped away from me."',
];
const isDry = (t) => DRY.some(d => String(t || '').includes(d.replace(/"/g, '')));

function firstChunk(Game, line) {
  try { return Game.convoSplitBeats(line)[0].trim(); } catch (e) { return String(line); }
}

function poisonRunLedger(Game, chunks) {
  const rl = Game.convoRunLedger();
  for (const k of chunks) if (k && !rl.includes(k)) rl.push(k);
  while (rl.length > 48) rl.shift();
}

function transcriptTexts(Game, vid) {
  const c = Game.convoGet(vid);
  return ((c && c.transcript) || []).map(t => String(t.text || ''));
}

const TRADE_SEED = '"...I should say, I trade in what I know. My knowledge for yours. Or food, if you\'re short on secrets."';

// The opener must not own the reply, or the beats defer instead of
// speaking: give the villager a taught plant so the taughtref opener
// fires (opThread 'taughtref'), and stub Math.random to 0.1 during
// startConvo so the taughtref (0.4) and seeding (0.5) rolls pass.
// Trust 30 keeps the secret hook (trust>=40) out of the way.
function setupTrader(Game) {
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster.find(id => { try { return Game.isKnowledgeTrader(id); } catch (e) { return false; } });
  if (!vid) return null;
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.trust[vid] = 30;
  const plant = ((Game.data.plants || [])[0] || {}).id || 'serviceberry';
  v.taughtByPlayer = v.taughtByPlayer || {};
  v.taughtByPlayer[vid] = [plant];
  return vid;
}

function setupPlain(Game) {
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster.find(id => { try { return !Game.isKnowledgeTrader(id); } catch (e) { return false; } });
  if (!vid) return roster[0] || null;
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.trust[vid] = 30;
  const plant = ((Game.data.plants || [])[0] || {}).id || 'serviceberry';
  v.taughtByPlayer = v.taughtByPlayer || {};
  v.taughtByPlayer[vid] = [plant];
  return vid;
}

function stageBond(Game, vid) {
  const v = Game.state.village;
  v.bondRequests = v.bondRequests || {};
  const pending = { vid, day: (Game.state.scholar || {}).day || 1, kind: 'bond' };
  v.bondRequests[vid] = pending;
  const line = Game.bondProposalLine(vid);
  pending.line = line;
  v.talkRequests = v.talkRequests || {};
  v.talkRequests[vid] = { line: '__NAME__: ' + line, day: pending.day, bondProposal: true };
  return line;
}

function stageLink(Game, vid) {
  const v = Game.state.village;
  v.linkRaises = v.linkRaises || {};
  const pending = { vid, villageId: 'village_1', day: (Game.state.scholar || {}).day || 1, kind: 'link' };
  v.linkRaises[vid] = pending;
  const line = Game.linkRaiseLine(vid);
  pending.line = line;
  v.talkRequests = v.talkRequests || {};
  v.talkRequests[vid] = { line: '__NAME__: ' + line, day: pending.day, linkRaise: true };
  return line;
}

// startConvo with Math.random pinned to 0.1 (taughtref + seeding rolls
// pass); restores the harness stream afterwards.
function openPinned(Game, vid) {
  const orig = Math.random;
  Math.random = () => 0.1;
  try {
    return Game.startConvo(vid);
  } finally {
    Math.random = orig;
  }
}

async function runCase(mode) {
  const seed = { 'trade-blocked': 5527, 'trade-control': 5528, 'bond-blocked': 5527, 'link-blocked': 5528, 'beats-control': 5529 }[mode] || 5527;
  const { Game } = await loadGame({ seed, mode: 'succession-r155-opener-skip-proof', fullTelemetry: true });
  await setupGame(Game);

  if (mode === 'trade-blocked' || mode === 'trade-control') {
    const vid = setupTrader(Game);
    check(`${mode}: knowledge trader found`, !!vid, `vid=${vid}`);
    if (!vid) return;
    if (mode === 'trade-blocked') poisonRunLedger(Game, [firstChunk(Game, TRADE_SEED)]);
    const r = openPinned(Game, vid);
    check(`${mode}: convo opened`, !!(r && !r.refused), `refused=${r && r.refused}`);
    const texts = transcriptTexts(Game, vid);
    const c = Game.convoGet(vid);
    if (mode === 'trade-blocked') {
      check('trade-blocked: no dry line at open', !texts.some(isDry), texts.slice(0, 3).join(' | ').slice(0, 200));
      check('trade-blocked: seed NOT spoken', !texts.some(t => t.includes('trade in what I know')), texts.slice(0, 3).join(' | ').slice(0, 200));
      check('trade-blocked: traderMentioned stays false', !(c && c.traderMentioned), `traderMentioned=${c && c.traderMentioned}`);
    } else {
      check('trade-control: seed spoken', texts.some(t => t.includes('trade in what I know')), texts.slice(0, 4).join(' | ').slice(0, 240));
      check('trade-control: traderMentioned true', !!(c && c.traderMentioned), `traderMentioned=${c && c.traderMentioned}`);
      check('trade-control: no dry line at open', !texts.some(isDry), texts.slice(0, 3).join(' | ').slice(0, 200));
    }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'bond-blocked' || mode === 'link-blocked') {
    const vid = setupPlain(Game);
    check(`${mode}: villager found`, !!vid, `vid=${vid}`);
    if (!vid) return;
    const line = mode === 'bond-blocked' ? stageBond(Game, vid) : stageLink(Game, vid);
    check(`${mode}: staged line built`, !!line, String(line || '').slice(0, 80));
    if (!line) return;
    // SITTING 1 (unpoisoned): the talk-request opener speaks the staged
    // line and marks it delivered; the player does not answer, so the
    // pending stays staged. SITTING 2 (raw line poisoned): the request
    // is already delivered, so the opener falls through to the taughtref
    // opener and the beat block re-speaks the raw line — the exact
    // configuration that dried on the r155 before-leg (33803 d77 Caleb:
    // the request had been delivered in an earlier sitting). Poison the
    // RAW line's first chunk (the beat's sayLine key), not the rendered
    // talk-request line (name-prefixed, a different key).
    const r1 = openPinned(Game, vid);
    check(`${mode}: sitting 1 opened`, !!(r1 && !r1.refused), `refused=${r1 && r1.refused}`);
    const t1 = transcriptTexts(Game, vid);
    check(`${mode}: sitting 1 speaks the staged line`, t1.some(t => t.includes(String(line).replace(/^"|"$/g, '').slice(0, 40))), t1.slice(0, 2).join(' | ').slice(0, 200));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    poisonRunLedger(Game, [firstChunk(Game, line)]);
    const r = openPinned(Game, vid);
    check(`${mode}: sitting 2 opened`, !!(r && !r.refused), `refused=${r && r.refused}`);
    const texts = transcriptTexts(Game, vid);
    const bare = String(line).replace(/^"|"$/g, '').slice(0, 40);
    check(`${mode}: no dry line at open`, !texts.some(isDry), texts.slice(0, 3).join(' | ').slice(0, 200));
    check(`${mode}: staged line NOT spoken`, !texts.some(t => t.includes(bare)), texts.slice(0, 3).join(' | ').slice(0, 200));
    if (mode === 'bond-blocked') {
      check('bond-blocked: pending stays staged', !!Game.pendingBondProposal(vid), `pending=${!!Game.pendingBondProposal(vid)}`);
      check('bond-blocked: request was delivered in sitting 1', !!((Game.state.village.talkRequests || {})[vid] || {}).delivered, `delivered=${((Game.state.village.talkRequests || {})[vid] || {}).delivered}`);
    } else {
      check('link-blocked: pending stays staged', !!Game.pendingLinkRaise(vid), `pending=${!!Game.pendingLinkRaise(vid)}`);
      check('link-blocked: request was delivered in sitting 1', !!((Game.state.village.talkRequests || {})[vid] || {}).delivered, `delivered=${((Game.state.village.talkRequests || {})[vid] || {}).delivered}`);
    }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'beats-control') {
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    const vids = roster.filter(id => { try { return !Game.isKnowledgeTrader(id); } catch (e) { return false; } }).slice(0, 2);
    check('beats-control: two villagers found', vids.length >= 2, `found=${vids.length}`);
    if (vids.length < 2) return;
    const [vb, vl] = vids;
    for (const vid of [vb, vl]) {
      const v = Game.state.village;
      v.trust = v.trust || {};
      v.trust[vid] = 30;
      const plant = ((Game.data.plants || [])[0] || {}).id || 'serviceberry';
      v.taughtByPlayer = v.taughtByPlayer || {};
      v.taughtByPlayer[vid] = [plant];
    }
    const bondLine = stageBond(Game, vb);
    const linkLine = stageLink(Game, vl);
    check('beats-control: bond line built', !!bondLine, String(bondLine || '').slice(0, 80));
    check('beats-control: link line built', !!linkLine, String(linkLine || '').slice(0, 80));
    const rb = openPinned(Game, vb);
    check('beats-control: bond convo opened', !!(rb && !rb.refused), `refused=${rb && rb.refused}`);
    const tb = transcriptTexts(Game, vb);
    check('beats-control: bond line spoken (as opener)', tb.some(t => t.includes(String(bondLine).replace(/^"|"$/g, '').slice(0, 40))), tb.slice(0, 3).join(' | ').slice(0, 220));
    check('beats-control: bond open has no dry line', !tb.some(isDry), tb.slice(0, 3).join(' | ').slice(0, 200));
    try { Game.endConvo(vb, 'left'); } catch (e) {}
    const rl = openPinned(Game, vl);
    check('beats-control: link convo opened', !!(rl && !rl.refused), `refused=${rl && rl.refused}`);
    const tl = transcriptTexts(Game, vl);
    check('beats-control: link line spoken (opener or beat)', tl.some(t => t.includes(String(linkLine).replace(/^"|"$/g, '').slice(0, 40))), tl.slice(0, 3).join(' | ').slice(0, 220));
    check('beats-control: link open has no dry line', !tl.some(isDry), tl.slice(0, 3).join(' | ').slice(0, 200));
    try { Game.endConvo(vl, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  const all = ['trade-blocked', 'trade-control', 'bond-blocked', 'link-blocked', 'beats-control'];
  if (mode && all.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('trade-blocked');
    for (const m of all.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r155-opener-skip.js'), m],
          { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
        console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
        if (/FAIL/.test(out)) fails++;
      } catch (e) {
        check(`${m} child run passes`, false, String((e.stdout || e.message || e)).slice(0, 300));
      }
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
