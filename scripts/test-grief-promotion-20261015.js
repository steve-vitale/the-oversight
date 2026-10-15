#!/usr/bin/env node
// Proof test: ACUTE GRIEF promotion (journey-social r16 2026-10-15).
// r15 proved the grief conversation thread is structurally unreachable:
// 0 grief-thread convos in 3,908 conversations across 8 runs with 43
// villager deaths (grief opener was fallback #4 behind the want opener).
// The fix inserts an ACUTE-GRIEF gate in convoOpening after unfinished
// business (#3): while v.grief > 0 (a death within ~3 days) the grief
// thread displaces the DEFAULT want/small-talk opening — but never a
// concrete commitment (talk requests, the table, unfinished business)
// and never an acute bodily need (ask_favor urgency >= 4 owns the opening).
//
// RED (pre-fix): with v.grief = 3, nobody opens with the grief thread.
// GREEN (post-fix): villagers open with the grief thread during the window;
//   acute favor needs and pending talk requests still own the opening.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

const GRIEF_LINES = [
  '"Have you — sorry. I keep thinking about them."',
  '"It\'s quiet today. Wrong kind of quiet."',
];

function threadOf(Game, vid) {
  try {
    const c = Game.convoGet(vid);
    return { thread: c && c.thread, line: ((c && c.transcript) || [])[0] };
  } catch (e) { return {}; }
}
function openerText(Game, vid) {
  try {
    const tr = (Game.convoGet(vid) || {}).transcript || [];
    for (const t of tr) if (t.who !== 'you' && t.text) return String(t.text);
  } catch (e) {}
  return '';
}

async function main() {
  // ACUTE case runs on a FRESH game: the favor system won't re-surface
  // ask_favor for a villager who has already sat once (decline-tracking),
  // so this must be a first sitting.
  {
    const lg = await loadGame({ seed: SEED, fullTelemetry: true });
    const Game = lg.Game;
    await setupGame(Game);
    const v = Game.state.village;
    v.grief = 3; // acute window open AND an acute bodily need
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    let acuteChecked = 0, acuteGriefLeak = 0;
    for (const vid of roster) {
      try { Game.npcNeeds(vid).hunger = 95; } catch (e) { continue; }
      Game.startConvo(vid);
      const c = Game.convoGet(vid) || {};
      const wantId = (c.want || {}).id || null;
      if (wantId === 'ask_favor') {
        acuteChecked++;
        if (c.thread === 'grief') acuteGriefLeak++;
      }
      Game.endConvo(vid, 'done');
      try { Game.npcNeeds(vid).hunger = 20; } catch (e) {}
    }
    console.log(`  acute-favor cases checked: ${acuteChecked}, grief leaks: ${acuteGriefLeak}`);
    ok(acuteChecked > 0, 'at least one acute-favor (hunger 95) case exercised');
    ok(acuteGriefLeak === 0, 'acute favor need owns the opening — grief never displaces it');
  }

  const lg = await loadGame({ seed: SEED, fullTelemetry: true });
  const Game = lg.Game;
  await setupGame(Game);
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length > 4, `roster has ${roster.length} NPCs`);

  // 1. baseline: no grief window -> nobody opens with grief
  v.grief = 0;
  let baselineGrief = 0;
  for (const vid of roster) {
    Game.startConvo(vid);
    const { thread } = threadOf(Game, vid);
    if (thread === 'grief') baselineGrief++;
    Game.endConvo(vid, 'done');
  }
  ok(baselineGrief === 0, `no-grief baseline: 0/${roster.length} grief opens`);

  // 2. acute window: v.grief = 3 -> villagers open with the grief thread
  v.grief = 3;
  const griefers = [];
  for (const vid of roster) {
    Game.startConvo(vid);
    const { thread } = threadOf(Game, vid);
    if (thread === 'grief') griefers.push(vid);
    Game.endConvo(vid, 'done');
  }
  console.log(`  grief opens during acute window: ${griefers.length}/${roster.length}`);
  ok(griefers.length > 0, 'acute window: at least one villager opens with the grief thread');
  // observable effect: the opener line is one of the grief lines
  let linesHonest = 0;
  for (const vid of griefers.slice(0, 3)) {
    Game.startConvo(vid); // second sitting: pool already consumed this sitting? ledger is per-life; re-sit re-opens
    const txt = openerText(Game, vid);
    if (GRIEF_LINES.some(l => txt.indexOf(l.slice(1, 20)) !== -1)) linesHonest++;
    Game.endConvo(vid, 'done');
  }
  ok(linesHonest > 0 || griefers.length === 0, 'grief opener line is the promoted grief copy');
  // but show a real transcript for the sense record
  if (griefers.length) {
    const vid = griefers[0];
    Game.startConvo(vid);
    const txt = openerText(Game, vid);
    console.log(`  sample opener (${Game.displayName(vid)}): ${txt}`);
    Game.endConvo(vid, 'done');
  }

  // 4. concrete commitments win: a pending talk request owns the opening, not grief
  v.grief = 3;
  const rq = roster[0];
  v.talkRequests = v.talkRequests || {};
  v.talkRequests[rq] = { line: '"I need to talk to you. (Talk to them.)"', delivered: false };
  Game.startConvo(rq);
  const rth = threadOf(Game, rq).thread;
  Game.endConvo(rq, 'done');
  ok(rth === 'request', `pending talk request owns the opening (thread=${rth})`);

  // 5. grief window passes: grief = 0 again -> no grief opens (the promotion is window-gated)
  v.grief = 0;
  let staleGrief = 0;
  for (const vid of roster.slice(0, 4)) {
    Game.startConvo(vid);
    if (threadOf(Game, vid).thread === 'grief') staleGrief++;
    Game.endConvo(vid, 'done');
  }
  ok(staleGrief === 0, 'grief window over: no grief opens');

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
