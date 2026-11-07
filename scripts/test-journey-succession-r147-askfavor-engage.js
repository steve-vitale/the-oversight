#!/usr/bin/env node
// test-journey-succession-r147-askfavor-engage.js — proof test for the r147
// ENGAGEBEAT-GUARD fix (journey-succession r146 qualifier).
//
// The r146 gap: the r146 fix guarded the favor's whyLine only in the
// dlg:details handler at stage >= 2 (and the stage-0 re-ask ladder). The
// same whyLine reaches the player UNGUARDED through ask_favor.engageBeat,
// which every other path calls: dlg:details at stage 0/1 (the menu offers
// it whenever the favor is unstated — menuOptions gates only on
// !favorExplained), dlg:help, dlg:comfort-completing, and the
// conversation.js engage paths. When the whyLine is run-ledger-blocked
// (same kind, another villager, or the same villager's earlier sitting),
// sayLine dries and the player hears "...Sorry, lost my train of
// thought" (details) or the self-repeat deflection "I just said — did
// you miss it?" (help) for a real, live need. Sightings on FIXED r146
// code: 33803 Omar d+14 (details), 33806 Ivy d+7 (details), 33806 David
// d+45 (details, water_haul whyLine), 33806 David d+53 (help,
// water_haul whyLine).
//
// The fix (src/js, convo-wants.js ask_favor.engageBeat — ONE guard at the
// source): when returning favor.whyLine, if convoWouldBlock(vid, wl)
// then return convoFavorNeedLine(vid, favor, true) when that itself is
// not blocked; otherwise return wl and let the caller's existing fallback
// handle it. Ledgers untouched; no trust/consequence flow changes.
//
// Cases (each in its own process — never two harnesses in one process):
//   engage  : wounded villager, whyLine pre-poisoned in the run ledger.
//             Call the want def's engageBeat directly; it must return the
//             need-naming line, never the blocked whyLine.
//   details1: same setup, talk-request open, dlg:more (stage 1, like
//             Omar) then dlg:details; the reply must name the need,
//             never a dry line.
//   control : no poisoning. engageBeat returns the whyLine itself;
//             details speaks the why (the fix must not change the
//             unblocked path).
//   ledger  : sayLine itself is untouched — the same line spoken twice in
//             one sitting still dry-replaces the second (c._sayFellBack).
//
// NO menu-driven dlg:help case (prereg amendment 2026-11-07): on the
// current base dlg:help for ask_favor is offered only through the
// resume-opener shape, which needs a stored favor + no live seed + an
// open thread + a 65% RNG gate — every construction fails in the unit
// harness (see scripts/diag-r147-helpmenu.js, diag-r147-resume.js).
// The `engage` case IS the dlg:help guard's proof at the source:
// dlg:help calls exactly this engageBeat and speaks its return value.
// The dlg:help turn itself is judged at the SIM level by the after-leg
// dry census across the full panel.
// Usage: node scripts/test-journey-succession-r147-askfavor-engage.js [engage|details1|control|ledger]
//   Default (no arg): runs all four cases, spawning children for the
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
  // heal_help need: health < 60, no higher-priority need. Health 50 gives
  // 'cut' (the Linh r146 shape).
  v.health = v.health || {};
  v.health[vid] = 50;
  v.sick = v.sick || {};
  delete v.sick[vid];
  v.promises = v.promises || {};
  delete v.promises[vid];
  v.favorDeclined = v.favorDeclined || {};
  delete v.favorDeclined[vid];
  // Keep hunger from outranking the wound (food_share needs hunger > 70).
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

// The heal_help whyLine variant space (r146): three hash-keyed variants.
// Poison ALL THREE first-chunks so whichever variant this villager's hash
// picks is blocked — the r146 panel condition (another villager said it).
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
  const seed = { engage: 5511, details1: 5513, control: 5514, ledger: 5515 }[mode] || 5511;
  const { Game } = await loadGame({ seed, mode: 'succession-r147-askfavor-engage-proof', fullTelemetry: true });
  await setupGame(Game);
  const vid = await setupWounded(Game);
  check(`${mode}: wounded villager set up`, !!vid, `vid=${vid}`);
  if (!vid) return;
  const need = Game.convoFindFavorNeed(vid);
  check(`${mode}: need is heal_help`, !!(need && need.kind === 'heal_help'), `need=${need && need.kind}`);
  if (!need || need.kind !== 'heal_help') return;

  if (mode === 'ledger') {
    // SayLine untouched: same line twice in one sitting dries the 2nd.
    const r = Game.startConvo(vid);
    check('ledger: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    const line = '"A line no other test speaks, about the old fence."';
    const c = Game.convoGet(vid);
    Game.sayLine(vid, line);
    const fell1 = !!(c && c._sayFellBack);
    Game.sayLine(vid, line);
    const fell2 = !!(c && c._sayFellBack);
    check('ledger: first speak lands (no fellBack)', !fell1);
    check('ledger: second speak dry-replaces (fellBack)', fell2);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  const poison = WHYLINES.map(w => firstChunk(Game, w));

  if (mode === 'engage') {
    // Poison all three whyLine variants, then call engageBeat directly.
    poisonRunLedger(Game, poison);
    const c = await openFavorConvo(Game, vid);
    if (!c || !c.want) return;
    const def = c.want.def;
    check('engage: want def has engageBeat', !!(def && typeof def.engageBeat === 'function'));
    if (!def || typeof def.engageBeat !== 'function') return;
    const beat = def.engageBeat.call(Game, vid);
    check('engage: beat is NOT a dry line', !!beat && !isDry(beat), String(beat || '').slice(0, 120));
    check('engage: beat is NOT any blocked whyLine', !!beat && !WHYLINES.some(w => String(beat).includes(firstChunk(Game, w).replace(/"/g, '').slice(0, 40))), String(beat || '').slice(0, 120));
    check('engage: beat names the need (wound/cut)', !!beat && /wound|cut/i.test(beat), String(beat || '').slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'details1') {
    // Omar's shape (r146 transcript 33803 d+14): the convo opens on a
    // talk request, so the want stays stage 0; dlg:more surfaces it
    // (stage 1, favor stated); dlg:details at stage 1 is the path the
    // r146 stage>=2 guard does NOT cover — it falls to engageBeat.
    const vv = Game.state.village || {};
    vv.talkRequests = vv.talkRequests || {};
    vv.talkRequests[vid] = { line: '"Can we talk? I wanted to ask you something."', day: 1 };
    poisonRunLedger(Game, poison);
    const r = Game.startConvo(vid);
    check('details1: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    const c0 = Game.convoGet(vid);
    check('details1: want still stage 0 at open', !!(c0 && c0.want && (c0.want.stage || 0) === 0), `stage=${c0 && c0.want && c0.want.stage} want=${c0 && c0.want && c0.want.id}`);
    const choices0 = Game.convoChoices(vid) || [];
    const hasMore = choices0.some(x => x.id === 'dlg:more');
    check('details1: dlg:more offered', hasMore, `choices=${choices0.map(x => x.id).join(',')}`);
    if (!hasMore) return;
    Game.convoTurn(vid, 'dlg:more');
    const c1 = Game.convoGet(vid);
    // dlg:more surfaces the deferred want (thread flips to 'want',
    // stage 2): the details turn now goes through convoThreadBeat,
    // which calls engageBeat directly — the r146 stage>=2 guard in
    // the dlg:details handler sits inside `if (!raw)` and is BYPASSED
    // whenever the thread beat is non-null. That bypass is the path
    // under test (on unfixed code the reply dries even at stage 2).
    check('details1: stage is 2 after more, thread want (thread-beat path)', !!(c1 && c1.want && (c1.want.stage || 0) === 2 && c1.thread === 'want'), `stage=${c1 && c1.want && c1.want.stage} thread=${c1 && c1.thread}`);
    const opener2 = lastNpcLine(Game, vid);
    check('details1: more surfaces the ask (not dry)', !!opener2 && !isDry(opener2), opener2.slice(0, 120));
    const choices = Game.convoChoices(vid) || [];
    const hasDetails = choices.some(x => x.id === 'dlg:details');
    check('details1: dlg:details offered', hasDetails, `choices=${choices.map(x => x.id).join(',')}`);
    if (!hasDetails) return;
    Game.convoTurn(vid, 'dlg:details');
    const reply = lastNpcLine(Game, vid);
    check('details1: reply is NOT a dry line', !isDry(reply), reply.slice(0, 120));
    check('details1: reply names the need (wound/cut)', /wound|cut/i.test(reply), reply.slice(0, 120));
    const c2 = Game.convoGet(vid);
    check('details1: want still live (not evaporated)', !!(c2 && c2.want && (c2.want.stage || 0) < 3), `stage=${c2 && c2.want && c2.want.stage}`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'control') {
    // No poisoning: engageBeat returns the whyLine itself; details speaks
    // the why (the fix must not change the unblocked path). dlg:help is
    // not menu-offered after a stated ask (see header), so the handler
    // path is proven through dlg:details here and through the sim legs.
    const c = await openFavorConvo(Game, vid);
    if (!c || !c.want) return;
    const def = c.want.def;
    const beat = def && typeof def.engageBeat === 'function' ? def.engageBeat.call(Game, vid) : null;
    check('control: engageBeat returns the whyLine itself', !!beat && WHYLINES.some(w => String(beat).includes(w.replace(/"/g, '').slice(1, 40))), String(beat || '').slice(0, 120));
    const choices = Game.convoChoices(vid) || [];
    const hasDetails = choices.some(x => x.id === 'dlg:details');
    if (hasDetails) {
      Game.convoTurn(vid, 'dlg:details');
      const reply = lastNpcLine(Game, vid);
      check('control: details reply is the why (not dry)', !isDry(reply) && /worse|angrier|healing|festers|turns/i.test(reply), reply.slice(0, 120));
    } else {
      check('control: dlg:details offered', false, `choices=${choices.map(x => x.id).join(',')}`);
    }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['engage', 'details1', 'control', 'ledger'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('engage');
    for (const m of ['details1', 'control', 'ledger']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r147-askfavor-engage.js'), m],
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
