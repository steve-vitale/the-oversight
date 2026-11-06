#!/usr/bin/env node
// test-journey-succession-r146-askfavor.js — proof test for the r146
// ASK_FAVOR WANT-FIZZLE fix (journey-succession r142/r143 blank).
//
// The fizzle: when the bearer asks about a need — "Is there something
// you need? Really." (alive:want:ask_favor, stage 0) or "Tell me why you
// need this." (dlg:details, stage >= 2) — the NPC answers "...Sorry, lost
// my train of thought." and the want evaporates. SAYTRACE on the r146
// before-leg (seed 33702, Linh d+30, dlg:details) attributes it: the
// heal_help whyLine is a PER-KIND CONSTANT, run-ledger-blocked
// (preRun=true, preSelf=false) because another villager recently said
// the same string. The stage-0 ladder (r53 guard: opener -> followup ->
// whyLine -> original) exhausts the same way: the followup shares one
// first-chunk per kind ("About {short} —") and the whyLine is the same
// constant.
//
// Cases (each in its own process — never two harnesses in one process):
//   details : wounded villager, whyLine pre-poisoned in the run ledger.
//             startConvo states the ask; pick dlg:details; the reply must
//             be a real answer naming the need, never a dry line.
//   ask     : wounded villager, opener + followup + whyLine first-chunks
//             pre-poisoned. startConvo; pick alive:want:ask_favor; the
//             reply must state the ask, never a dry line.
//   control : same setup, NO poisoning. Both picks speak the real lines
//             (the fix must not change the unblocked path).
//   ledger  : sayLine itself is untouched — the same line spoken twice in
//             one sitting still dry-replaces the second (c._sayFellBack).
//
// The fix (src/js): per-instance whyLine variants in FAVOR_KINDS for the
// fixed-whyLine kinds + a need-naming fresh fallback rung in the two
// handlers (checked with convoWouldBlock; the dry pool only as last
// resort). The ledgers themselves are untouched.
// Usage: node scripts/test-journey-succession-r146-askfavor.js [details|ask|control|ledger]
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
  // heal_help need: health < 60, no higher-priority need. Wound vs cut
  // splits at health < 40; 50 gives 'cut' (the Linh r146 shape).
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

function driveToWant(Game, vid, wantId, maxTurns) {
  // The want question joins the menu only once the opening thread is
  // spent (Tyler's shape: more/react/recap/party/subject, then the want
  // question). Drive non-want picks until it appears, like the journey
  // driver does; never pick the want itself here.
  for (let t = 0; t < (maxTurns || 6); t++) {
    const choices = Game.convoChoices(vid) || [];
    if (choices.some(x => x.id === 'alive:want:' + wantId)) return true;
    const next = choices.find(x => x.id === 'dlg:subject')
      || choices.find(x => x.id === 'dlg:more')
      || choices.find(x => x.id === 'dlg:react')
      || choices.find(x => x.id === 'silence');
    if (!next) return false;
    try { Game.convoTurn(vid, next.id); } catch (e) { return false; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) return false;
  }
  const choices = Game.convoChoices(vid) || [];
  return choices.some(x => x.id === 'alive:want:' + wantId);
}

async function runCase(mode) {
  const seed = { details: 4411, ask: 4412, control: 4413, ledger: 4414 }[mode] || 4411;
  const { Game } = await loadGame({ seed, mode: 'succession-r146-askfavor-proof', fullTelemetry: true });
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

  // The heal_help variant space (convo-wants.js FAVOR_KINDS): the ask
  // line is 3 problems x 3 asks = 9 WHOLE-LINE keys (lines are < 260
  // chars, so convoSplitBeats returns [line] and sayLine's key is the
  // whole line, not the first sentence). The followup is 4 whole-line
  // re-ask variants sharing the fixed short 'this wound'; the whyLine
  // is one fixed string. Poison ALL of them to force the r53 ladder
  // (line -> followup -> whyLine -> original) to exhaust — the Tyler
  // condition. Health 50 gives 'cut' in the ask line.
  const whyLine = '"It\'s getting worse, not better. If it festers I\'m no good to anyone — can\'t haul, can\'t hunt, can\'t watch. Just clean it out and wrap it tight."';
  const problems = [
    `This cut — I can't clean it properly one-handed.`,
    `My cut needs a second pair of hands.`,
    `I can't reach this properly.`,
  ];
  const asks = [
    `Could you take a look?`,
    `Will you help me clean it?`,
    `Could you clean it out for me? Please.`,
  ];
  const poison = [firstChunk(Game, whyLine)];
  for (const p of problems) for (const a of asks) poison.push(firstChunk(Game, `"${p} ${a}"`));
  for (const r of [
    `"About this wound — still need hands. Are you in?"`,
    `"About this wound — I still haven't found anyone. Any chance?"`,
    `"About this wound — I hate to ask twice, but it's still open. Will you?"`,
    `"About this wound — the need hasn't gone anywhere. I'm still asking."`,
  ]) poison.push(firstChunk(Game, r));

  if (mode === 'details') {
    // Poison ONLY the whyLine: the opener must state the ask, then the
    // details pick must answer it (James/Linh shape).
    poisonRunLedger(Game, [firstChunk(Game, whyLine)]);
    const r = Game.startConvo(vid);
    check('details: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    const c0 = Game.convoGet(vid);
    check('details: want is ask_favor', !!(c0 && c0.want && c0.want.id === 'ask_favor'), `want=${c0 && c0.want && c0.want.id}`);
    const opener = lastNpcLine(Game, vid);
    check('details: opener states the ask (not dry)', !!opener && !isDry(opener), opener.slice(0, 90));
    const choices = Game.convoChoices(vid) || [];
    const hasDetails = choices.some(x => x.id === 'dlg:details');
    check('details: dlg:details offered', hasDetails, `choices=${choices.map(x => x.id).join(',')}`);
    if (!hasDetails) return;
    Game.convoTurn(vid, 'dlg:details');
    const reply = lastNpcLine(Game, vid);
    check('details: reply is NOT a dry line', !isDry(reply), reply.slice(0, 120));
    check('details: reply names the need (wound/cut)', /wound|cut/i.test(reply), reply.slice(0, 120));
    const c = Game.convoGet(vid);
    check('details: want still live (not evaporated)', !!(c && c.want && (c.want.stage || 0) < 3), `stage=${c && c.want && c.want.stage}`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'ask') {
    // Poison the whole ladder: opener line variants + followup + whyLine.
    // The want must stay STAGE 0 until the player asks — so the convo
    // opens on their talk request, not on the want (Tyler's shape: the
    // opening beats were recap/party, the want question came later).
    const v = Game.state.village || {};
    v.talkRequests = v.talkRequests || {};
    v.talkRequests[vid] = { line: '"Can we talk? I wanted to ask you something."', day: 1 };
    poisonRunLedger(Game, poison);
    const r = Game.startConvo(vid);
    check('ask: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    const c0 = Game.convoGet(vid);
    check('ask: want still stage 0 at open', !!(c0 && c0.want && (c0.want.stage || 0) === 0), `stage=${c0 && c0.want && c0.want.stage} want=${c0 && c0.want && c0.want.id}`);
    const found = driveToWant(Game, vid, 'ask_favor', 6);
    const choices = Game.convoChoices(vid) || [];
    const wantChoice = choices.find(x => x.id === 'alive:want:ask_favor');
    check('ask: alive:want:ask_favor offered', !!wantChoice, `found=${found} choices=${choices.map(x => x.id).join(',')}`);
    if (!wantChoice) return;
    Game.convoTurn(vid, 'alive:want:ask_favor');
    const reply = lastNpcLine(Game, vid);
    check('ask: reply is NOT a dry line', !isDry(reply), reply.slice(0, 120));
    check('ask: reply states a need (wound/cut/food/water/help)', /wound|cut|food|water|help|hand/i.test(reply), reply.slice(0, 120));
    const c = Game.convoGet(vid);
    check('ask: want surfaced (stage >= 1)', !!(c && c.want && (c.want.stage || 0) >= 1), `stage=${c && c.want && c.want.stage}`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'control') {
    // No poisoning: both paths must speak the real lines (the fix must
    // not change the unblocked path). Same talk-request open as 'ask',
    // then ask pick + details pick in the SAME convo.
    const v = Game.state.village || {};
    v.talkRequests = v.talkRequests || {};
    v.talkRequests[vid] = { line: '"Can we talk? I wanted to ask you something."', day: 1 };
    const r = Game.startConvo(vid);
    check('control: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    const found = driveToWant(Game, vid, 'ask_favor', 6);
    const choices = Game.convoChoices(vid) || [];
    const wantChoice = choices.find(x => x.id === 'alive:want:ask_favor');
    check('control: alive:want:ask_favor offered', !!wantChoice, `found=${found} choices=${choices.map(x => x.id).join(',')}`);
    if (wantChoice) {
      Game.convoTurn(vid, 'alive:want:ask_favor');
      const reply = lastNpcLine(Game, vid);
      check('control: ask reply is NOT a dry line', !isDry(reply), reply.slice(0, 120));
      check('control: ask reply states the ask', /wound|cut|look|clean/i.test(reply), reply.slice(0, 120));
    }
    const choices2 = Game.convoChoices(vid) || [];
    const hasDetails = choices2.some(x => x.id === 'dlg:details');
    check('control: dlg:details offered after the ask', hasDetails, `choices=${choices2.map(x => x.id).join(',')}`);
    if (hasDetails) {
      Game.convoTurn(vid, 'dlg:details');
      const reply2 = lastNpcLine(Game, vid);
      check('control: details reply is NOT a dry line', !isDry(reply2), reply2.slice(0, 120));
      check('control: details reply gives the why', /angrier|worse|festers|turns|can't work|no good/i.test(reply2), reply2.slice(0, 120));
    }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['details', 'ask', 'control', 'ledger'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('details');
    for (const m of ['ask', 'control', 'ledger']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r146-askfavor.js'), m],
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
