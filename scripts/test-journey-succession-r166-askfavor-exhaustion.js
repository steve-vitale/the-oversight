#!/usr/bin/env node
// test-journey-succession-r166-askfavor-exhaustion.js — proof test for the
// r166 ALL-BLOCKED fix (journey-succession r165 finding).
//
// The r165 wild case (seed 34007 d22 Sofia, pantry-run favor): the favor's
// whyLine (1-of-9 whyBits x whyTails combo) was run-ledger-blocked AND all
// three need-line phrasings were blocked — not by another villager, but by
// Sofia herself IN THIS SITTING: the opener/resume/ask turns had already
// spoken v0 ("I need help with the pantry run."), v1 ("I still need a
// hand with the pantry run.") and v2 ("The pantry run isn't going away —
// I need help."). The r147/r151 ladder was fully exhausted before the
// details turn started, engageBeat returned the blocked whyLine, sayLine
// dry-replaced it, and the player asking "Tell me why you need this."
// heard "...Sorry, lost my train of thought." — a DRY CENSUS miss
// (favor whyLine via dlg:details).
//
// The r147 comment claimed the whyLine "goes back to the caller, whose
// existing fallback answers" — that is false on current master: sayLine
// returns the dry line TRUTHY, so the caller's `!said` check never fires
// and no fallback answers. The fix (src/js, convo-wants.js
// ask_favor.engageBeat): when the whyLine AND all three need phrasings
// are blocked, return null instead of the blocked whyLine. Every
// engageBeat caller falls back to its own graceful line (dlg:details'
// "It's... complicated", dlg:help's nowant pool, dlg:more's dry pool,
// the alive:want resume's "Here's the thing"); dlg:comfort falls back
// to its comfort pool (convo-dialogue.js, r166). Ledgers untouched.
//
// Cases (each in its own process — never two harnesses in one process):
//   engage-allblocked : whyLine + v0 + v1 + v2 all poisoned. engageBeat
//     must return null, never the blocked whyLine. RED on unfixed code
//     (returns the whyLine).
//   details-allblocked: talk-request open, dlg:more, dlg:details with
//     whyLine + v0 + v1 + v2 poisoned. The reply must be the graceful
//     line ("It's... complicated" / "I don't have the words"), never a
//     dry line, and the want must stay live. RED on unfixed code
//     (reply is the dry line).
//   control           : no poisoning. engageBeat returns the whyLine;
//     details speaks the why (the fix must not change the unblocked
//     path).
// Usage: node scripts/test-journey-succession-r166-askfavor-exhaustion.js [case]
//   Default (no arg): runs all cases, spawning children for the
//   two non-default cases (separate processes).
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

async function setupWounded(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 1) return null;
  const vid = roster[0];
  v.health = v.health || {};
  v.health[vid] = 50;
  v.sick = v.sick || {};
  delete v.sick[vid];
  v.promises = v.promises || {};
  delete v.promises[vid];
  v.favorDeclined = v.favorDeclined || {};
  delete v.favorDeclined[vid];
  try {
    const n = (typeof Game.npcNeeds === 'function') ? Game.npcNeeds(vid) : {};
    if ((n.hunger || 0) > 70 && v.hunger) v.hunger[vid] = 0;
    if ((n.energy || 0) < 30 && v.energy) v.energy[vid] = 100;
    if ((n.fear || 0) > 70 && v.fear) v.fear[vid] = 0;
  } catch (e) {}
  v.trust = v.trust || {};
  v.trust[vid] = 90;
  return vid;
}

function poisonRunLedger(Game, chunks) {
  const rl = Game.convoRunLedger();
  for (const k of chunks) if (k && !rl.includes(k)) rl.push(k);
  while (rl.length > 48) rl.shift();
}

function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}

const WHYLINES = [
  '"It\'s getting worse, not better. If it festers I\'m no good to anyone — can\'t haul, can\'t hunt, can\'t watch. Just clean it out and wrap it tight."',
  '"It keeps getting worse. I can\'t haul or hunt with it like this — and if it festers, I\'m done for. Please, clean it out and bind it tight."',
  '"Every day it\'s angrier. I need it cleaned before it turns — I can\'t work a wound like this. Wrap it tight when you\'re done."',
];

async function openFavorConvo(Game, vid) {
  const r = Game.startConvo(vid);
  check('convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
  const c = Game.convoGet(vid);
  check('want is ask_favor', !!(c && c.want && c.want.id === 'ask_favor'), `want=${c && c.want && c.want.id}`);
  const opener = lastNpcLine(Game, vid);
  check('opener states the ask (not dry)', !!opener && !isDry(opener), opener.slice(0, 90));
  return c;
}

async function runCase(mode) {
  const seed = { 'engage-allblocked': 5525, 'details-allblocked': 5526, control: 5527 }[mode] || 5525;
  const { Game } = await loadGame({ seed, mode: 'succession-r166-askfavor-exhaustion-proof', fullTelemetry: true });
  await setupGame(Game);
  const vid = await setupWounded(Game);
  check(`${mode}: wounded villager set up`, !!vid, `vid=${vid}`);
  if (!vid) return;
  const need = Game.convoFindFavorNeed(vid);
  check(`${mode}: need is heal_help`, !!(need && need.kind === 'heal_help'), `need=${need && need.kind}`);
  if (!need || need.kind !== 'heal_help') return;
  const poison = WHYLINES.map(w => firstChunk(Game, w));

  if (mode === 'engage-allblocked') {
    poisonRunLedger(Game, poison);
    const c = await openFavorConvo(Game, vid);
    if (!c || !c.want) return;
    const favor = c.want.favor;
    const variants = [0, 1, 2].map(vi => Game.convoFavorNeedLine(vid, favor, true, vi));
    poisonRunLedger(Game, variants.map(nl => firstChunk(Game, nl)));
    const def = c.want.def;
    const beat = def && typeof def.engageBeat === 'function' ? def.engageBeat.call(Game, vid) : 'UNCALLED';
    check('engage-allblocked: beat is null (exhaustion — callers fall back gracefully)', beat === null, String(beat || '').slice(0, 120));
    check('engage-allblocked: beat is NOT the blocked whyLine', beat !== favor.whyLine, String(beat || '').slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'details-allblocked') {
    const vv = Game.state.village || {};
    vv.talkRequests = vv.talkRequests || {};
    vv.talkRequests[vid] = { line: '"Can we talk? I wanted to ask you something."', day: 1 };
    poisonRunLedger(Game, poison);
    const r = Game.startConvo(vid);
    check('details-allblocked: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    const choices0 = Game.convoChoices(vid) || [];
    const hasMore = choices0.some(x => x.id === 'dlg:more');
    check('details-allblocked: dlg:more offered', hasMore, `choices=${choices0.map(x => x.id).join(',')}`);
    if (!hasMore) return;
    Game.convoTurn(vid, 'dlg:more');
    // The favor is only built when dlg:more surfaces the want (a
    // talk-request opener preempts the want opener at open, so
    // c.want.favor is undefined until now) — poison all three need
    // phrasings HERE, after more, before details.
    const c1 = Game.convoGet(vid);
    const favor = c1 && c1.want && c1.want.favor;
    check('details-allblocked: favor built after more', !!favor, `favor=${!!favor}`);
    if (!favor) return;
    const variants = [0, 1, 2].map(vi => Game.convoFavorNeedLine(vid, favor, true, vi));
    check('details-allblocked: need variants computed', variants.every(Boolean), variants.map(String).join(' | ').slice(0, 120));
    poisonRunLedger(Game, variants.map(nl => firstChunk(Game, nl)));
    const choices = Game.convoChoices(vid) || [];
    const hasDetails = choices.some(x => x.id === 'dlg:details');
    check('details-allblocked: dlg:details offered', hasDetails, `choices=${choices.map(x => x.id).join(',')}`);
    if (!hasDetails) return;
    Game.convoTurn(vid, 'dlg:details');
    const reply = lastNpcLine(Game, vid);
    check('details-allblocked: reply is NOT a dry line', !isDry(reply), reply.slice(0, 120));
    check('details-allblocked: reply is the graceful line', /complicated|don\'t have the words/i.test(reply), reply.slice(0, 120));
    const c2 = Game.convoGet(vid);
    check('details-allblocked: want still live (not evaporated)', !!(c2 && c2.want && (c2.want.stage || 0) < 3), `stage=${c2 && c2.want && c2.want.stage}`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'control') {
    const c = await openFavorConvo(Game, vid);
    if (!c || !c.want) return;
    const favor = c.want.favor;
    const def = c.want.def;
    const beat = def && typeof def.engageBeat === 'function' ? def.engageBeat.call(Game, vid) : null;
    check('control: engageBeat returns the whyLine itself', !!beat && WHYLINES.some(w => String(beat).includes(w.replace(/"/g, '').slice(1, 40))), String(beat || '').slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['engage-allblocked', 'details-allblocked', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('engage-allblocked');
    for (const m of ['details-allblocked', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r166-askfavor-exhaustion.js'), m],
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
