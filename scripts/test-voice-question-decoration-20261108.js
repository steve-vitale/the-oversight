#!/usr/bin/env node
// test-voice-question-decoration-20261108.js — dialog audit defect #5.
// voiceLine must not stack discourse openers / temperament tags onto
// authored questions (day-1 curious openers).
//
// Repros (dialog-coherence-audit.md):
//   seed 1 Benoit: "Practical view: Okay, real question: what's the funniest…"
//   seed 99 Toan:  "I feel like — Where are you from…"
//   seed 7 Brayden: "…laughed? Extremely normal, all of it."
//
// GREEN: authored questions stay undecorated under forced voice draws;
//   soft address closers (", friend.") still fold on plain questions.
// RED (pre-fix): openers lead multi-clause questions; semantic closers
//   answer the ask.
'use strict';
const path = require('path');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

const Q_LAUGH = '"Okay, real question: what\'s the funniest thing you\'ve seen since we got here? I desperately need it."';
const Q_ORIGIN = '"Where are you from — originally? Before all this."';
const Q_PLAIN = '"When\'s the last time you really laughed?"';
const Q_SOFT = '"Are you coming with us?"';

// Stacked openers / fighting closers from characterGen voice pools + DNA.
const STACKED_OPEN = /^(Practical view: |I feel like — |Here's what I think — |The way I read it — |Listen to me — |Hear me out — |Funny thing — |Real talk — |Bottom line: |Short version — )/i;
const FIGHT_CLOSE = /Extremely normal, all of it\.|It'll pass\.|Give it time\.|Allegedly\.|That's my read\.|Worth considering\.|Do you understand\?|Don't look away from this\./i;

function forceVoice(Game, vid, line, n) {
  const out = [];
  const orig = Math.random;
  try {
    for (let i = 0; i < n; i++) {
      // Pass p-gate; second draw would prefer opener on non-questions.
      let call = 0;
      Math.random = () => (call++ === 0 ? 0 : 0.1);
      out.push(Game.voiceLine(vid, line));
    }
  } finally { Math.random = orig; }
  return out;
}

function forceCloser(Game, vid, closer, line) {
  const origPick = Game.convoPickCycle;
  const origRand = Math.random;
  const queue = [0.1, 0.9];
  let qi = 0;
  Game.convoPickCycle = () => closer;
  Math.random = () => queue[(qi++) % queue.length];
  try { return Game.voiceLine(vid, line); }
  finally { Game.convoPickCycle = origPick; Math.random = origRand; }
}

async function main() {
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };
  const ok = (m, cond, detail) => {
    if (cond) console.log('  ok  ' + m);
    else fail(m + (detail ? ' — ' + detail : ''));
  };

  const { Game } = await loadGame({ seed: 1, mode: 'voice-q-decoration' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');

  // --- Forced draws on audit authored questions ---
  for (const [label, line] of [['laugh', Q_LAUGH], ['origin', Q_ORIGIN], ['plain', Q_PLAIN]]) {
    const samples = forceVoice(Game, vid, line, 80);
    const stacked = samples.filter(s => s !== line && (STACKED_OPEN.test(String(s).replace(/^"/, '')) || FIGHT_CLOSE.test(s)));
    const anyChange = samples.some(s => s !== line && (STACKED_OPEN.test(String(s).replace(/^"/, '')) || /Extremely normal|It'll pass|Give it time|Allegedly|That's my read|Worth considering|Do you understand|Don't look away/i.test(s)));
    ok(label + ': no stacked opener / fighting closer', !anyChange && stacked.length === 0,
      stacked.slice(0, 2).join(' | '));
    // Multi-clause authored questions must stay exact (no decoration at all).
    if (label !== 'plain') {
      ok(label + ': authored question unchanged', samples.every(s => s === line),
        samples.find(s => s !== line));
    }
  }

  // Fighting closers in the live pool must be filtered off plain questions.
  // (Stubbing convoPickCycle would bypass the soft filter — pin the pool.)
  const savedVoice = Game.data.characterGen.voice;
  const savedMarkers = Game.convoSpeechMarkers;
  const savedTemper = Game.npcTemper;
  const savedAgeSet = Game.npcVoiceSet;
  const savedAgeBand = Game.npcAgeBand;
  Game.data.characterGen.voice = {
    profiles: {
      steady: {
        p: 1,
        open: ['Practical view: ', 'I feel like — '],
        close: ['Extremely normal, all of it.', 'It\'ll pass.', 'Allegedly.'],
      },
    },
    ageSets: {},
  };
  Game.convoSpeechMarkers = () => null;
  Game.npcTemper = () => 'steady';
  Game.npcVoiceSet = () => null;
  Game.npcAgeBand = () => 'adult';
  for (const line of [Q_PLAIN, Q_LAUGH, Q_ORIGIN]) {
    const samples = forceVoice(Game, vid, line, 40);
    ok('fighting-only pool leaves ' + line.slice(0, 28) + '… undecorated',
      samples.every(s => s === line), samples.find(s => s !== line));
  }
  // Soft address closer still folds (succession contract) when it is the
  // only surviving closer.
  Game.data.characterGen.voice = {
    profiles: { steady: { p: 1, open: [], close: [', friend.'] } },
    ageSets: {},
  };
  const soft = forceCloser(Game, vid, ', friend.', Q_SOFT);
  ok('soft ", friend." still folds on plain question',
    soft === '"Are you coming with us, friend?"', soft);
  Game.data.characterGen.voice = savedVoice;
  Game.convoSpeechMarkers = savedMarkers;
  Game.npcTemper = savedTemper;
  Game.npcVoiceSet = savedAgeSet;
  Game.npcAgeBand = savedAgeBand;

  // Live want-opener path (seed-1 day-1 shape): curious opener is an authored
  // question; voiceLine must not stack on the way out of convoOpening.
  const cg = (Game.data.characterGen || {}).convo || {};
  const qLaugh = (cg.questions || []).find(q => q.id === 'q_laugh');
  if (!qLaugh || !qLaugh.q) throw new Error('missing q_laugh');
  const live = forceVoice(Game, vid, qLaugh.q, 60);
  ok('live q_laugh want text never stacks Practical view / I feel like',
    live.every(s => s === qLaugh.q || (!STACKED_OPEN.test(String(s).replace(/^"/, '')) && !FIGHT_CLOSE.test(s))),
    live.find(s => s !== qLaugh.q));
  ok('live q_laugh stays undecorated', live.every(s => s === qLaugh.q),
    live.find(s => s !== qLaugh.q));

  console.log(fails ? `\n${fails} FAIL(s)` : '\nPASS test-voice-question-decoration-20261108');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
