#!/usr/bin/env node
// test-journey-succession-r151-askfavor-bothblocked.js — proof test for the
// r151 BOTH-BLOCKED extension of the r147 ENGAGEBEAT-GUARD fix.
//
// The r147 gap (found on the r151 after-leg, seed 33806 d+45 Katarina):
// the guard returns the need-line only when it is unblocked. When the
// need-line is ALSO run-ledger-blocked — here, spoken by the same villager
// at d+30 and still inside the 48-entry run ledger at d+45 — the guard
// returns the blocked whyLine and the turn dries ("Hm. Never mind — go on.",
// the second deflection-pool line). Proven at unit level by diagnostic
// /tmp/probe-bothblocked.js: with whyLine + need-line both poisoned,
// engageBeat returns the blocked whyLine and sayLine dry-replaces it.
//
// The extension (src/js, convo-wants.js convoFavorNeedLine + the two guards
// that call it): the need-line comes in three fresh phrasings (v0/v1/v2,
// all built from favor.short only, all distinct in first chunk); the
// engageBeat guard AND the dlg:details handler guard try v0, v1, v2 in
// order and return the first unblocked one. Only when ALL THREE are blocked
// does engageBeat return null (r166 — the whyLine NO LONGER goes back to
// the caller: sayLine dry-replaces a blocked whyLine and returns the dry
// line truthy, so no caller fallback ever answered; r165 wild case seed
// 34007 d22 Sofia). Callers fall back to their graceful lines.
// No RNG anywhere in the guard; ledgers untouched.
//
// Cases (each in its own process — never two harnesses in one process):
//   engage-bothblocked : whyLine + need-line v0 poisoned. engageBeat must
//     return v1 ("I still need a hand with ..."), never the blocked
//     whyLine, never a dry line. RED on r147 code (v1 does not exist).
//   engage-allblocked  : whyLine + v0 + v1 + v2 all poisoned. engageBeat
//     returns null (r166: the whyLine no longer goes back — sayLine would
//     dry-replace it and the caller's `!said` fallback never fires, so
//     "the honest exhaustion case" was a dry line in the wild, seed 34007
//     d22 Sofia; callers fall back to their graceful lines instead).
//     (Passed on r147 code too when it asserted the whyLine; updated in
//     r166 as a deliberate design change.)
//   details-bothblocked: talk-request open, dlg:more, dlg:details with
//     whyLine + v0 poisoned. The reply must name the need (v1), never a
//     dry line. RED on r147 code.
//   control            : no poisoning. engageBeat returns the whyLine;
//     convoFavorNeedLine with no variant arg returns v0 (backward compat
//     for the stage-0 ladder); variant 1/2 return the v1/v2 phrasings,
//     all three distinct.
// Usage: node scripts/test-journey-succession-r151-askfavor-bothblocked.js [case]
//   Default (no arg): runs all cases, spawning children for the
//   three non-default cases (separate processes).
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
  const seed = { 'engage-bothblocked': 5521, 'engage-allblocked': 5522, 'details-bothblocked': 5523, control: 5524 }[mode] || 5521;
  const { Game } = await loadGame({ seed, mode: 'succession-r151-askfavor-bothblocked-proof', fullTelemetry: true });
  await setupGame(Game);
  const vid = await setupWounded(Game);
  check(`${mode}: wounded villager set up`, !!vid, `vid=${vid}`);
  if (!vid) return;
  const need = Game.convoFindFavorNeed(vid);
  check(`${mode}: need is heal_help`, !!(need && need.kind === 'heal_help'), `need=${need && need.kind}`);
  if (!need || need.kind !== 'heal_help') return;
  const poison = WHYLINES.map(w => firstChunk(Game, w));

  if (mode === 'engage-bothblocked') {
    poisonRunLedger(Game, poison);
    const c = await openFavorConvo(Game, vid);
    if (!c || !c.want) return;
    const favor = c.want.favor;
    const v0 = Game.convoFavorNeedLine(vid, favor, true);
    poisonRunLedger(Game, [firstChunk(Game, v0)]);
    const def = c.want.def;
    const beat = def && typeof def.engageBeat === 'function' ? def.engageBeat.call(Game, vid) : null;
    check('engage-bothblocked: beat is NOT a dry line', !!beat && !isDry(beat), String(beat || '').slice(0, 120));
    check('engage-bothblocked: beat is NOT any blocked whyLine', !!beat && !WHYLINES.some(w => String(beat).includes(firstChunk(Game, w).replace(/"/g, '').slice(0, 40))), String(beat || '').slice(0, 120));
    check('engage-bothblocked: beat is NOT the blocked v0 need-line', !!beat && beat !== v0, String(beat || '').slice(0, 120));
    check('engage-bothblocked: beat is the v1 phrasing (need a hand)', !!beat && /need a hand with/i.test(beat), String(beat || '').slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'engage-allblocked') {
    poisonRunLedger(Game, poison);
    const c = await openFavorConvo(Game, vid);
    if (!c || !c.want) return;
    const favor = c.want.favor;
    const variants = [0, 1, 2].map(vi => Game.convoFavorNeedLine(vid, favor, true, vi));
    poisonRunLedger(Game, variants.map(nl => firstChunk(Game, nl)));
    const def = c.want.def;
    const beat = def && typeof def.engageBeat === 'function' ? def.engageBeat.call(Game, vid) : 'UNCALLED';
    check('engage-allblocked: beat is null (exhaustion — callers fall back gracefully, r166)', beat === null, String(beat || '').slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'details-bothblocked') {
    const vv = Game.state.village || {};
    vv.talkRequests = vv.talkRequests || {};
    vv.talkRequests[vid] = { line: '"Can we talk? I wanted to ask you something."', day: 1 };
    poisonRunLedger(Game, poison);
    const r = Game.startConvo(vid);
    check('details-bothblocked: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    const choices0 = Game.convoChoices(vid) || [];
    const hasMore = choices0.some(x => x.id === 'dlg:more');
    check('details-bothblocked: dlg:more offered', hasMore, `choices=${choices0.map(x => x.id).join(',')}`);
    if (!hasMore) return;
    Game.convoTurn(vid, 'dlg:more');
    // The favor is only built when dlg:more surfaces the want (a
    // talk-request opener preempts the want opener at open, so
    // c.want.favor is undefined until now) — poison v0 HERE, after
    // more, before details.
    const c1 = Game.convoGet(vid);
    const favor = c1 && c1.want && c1.want.favor;
    check('details-bothblocked: favor built after more', !!favor, `favor=${!!favor}`);
    if (!favor) return;
    const v0 = Game.convoFavorNeedLine(vid, favor, true);
    check('details-bothblocked: v0 computed', !!v0, String(v0 || '').slice(0, 80));
    if (v0) poisonRunLedger(Game, [firstChunk(Game, v0)]);
    const choices = Game.convoChoices(vid) || [];
    const hasDetails = choices.some(x => x.id === 'dlg:details');
    check('details-bothblocked: dlg:details offered', hasDetails, `choices=${choices.map(x => x.id).join(',')}`);
    if (!hasDetails) return;
    Game.convoTurn(vid, 'dlg:details');
    const reply = lastNpcLine(Game, vid);
    check('details-bothblocked: reply is NOT a dry line', !isDry(reply), reply.slice(0, 120));
    check('details-bothblocked: reply is the v1 phrasing (need a hand)', /need a hand with/i.test(reply), reply.slice(0, 120));
    const c2 = Game.convoGet(vid);
    check('details-bothblocked: want still live (not evaporated)', !!(c2 && c2.want && (c2.want.stage || 0) < 3), `stage=${c2 && c2.want && c2.want.stage}`);
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
    const v0 = Game.convoFavorNeedLine(vid, favor, true);
    const v1 = Game.convoFavorNeedLine(vid, favor, true, 1);
    const v2 = Game.convoFavorNeedLine(vid, favor, true, 2);
    check('control: need-line default (no variant arg) is v0', !!v0 && /still need help with/i.test(v0), String(v0 || '').slice(0, 100));
    check('control: v1 is the hand phrasing', !!v1 && /need a hand with/i.test(v1), String(v1 || '').slice(0, 100));
    check('control: v2 names the need as not going away', !!v2 && /isn\'t going away/i.test(v2), String(v2 || '').slice(0, 100));
    check('control: all three variants distinct', !!v0 && !!v1 && !!v2 && v0 !== v1 && v0 !== v2 && v1 !== v2);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['engage-bothblocked', 'engage-allblocked', 'details-bothblocked', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('engage-bothblocked');
    for (const m of ['engage-allblocked', 'details-bothblocked', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r151-askfavor-bothblocked.js'), m],
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
