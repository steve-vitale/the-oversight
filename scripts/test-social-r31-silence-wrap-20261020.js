#!/usr/bin/env node
// test-social-r31-silence-wrap-20261020.js -- PROOF TEST (journey-social r31).
// The mood-silence pools are tiny (2 lines warm/cool/tense) and
// convoPickCycle's exhaustion reset alternates them: 3+ consecutive silences
// in one sitting served verbatim repeats (transcript: journey-social r30,
// seed 2012, Dale, day 16 — warm A,B,A,B,A across turns 3-7, an L2'
// violation). The r31 fix is count-aware: each pool line serves once per
// sitting per band, then the NPC names the repeated silence honestly (said
// once), then the moment is spent — the energy budget drains so the
// EXISTING convoMaybeWinddown machinery closes it naturally (r18 dry-streak
// precedent). Silence stays available (canon); it just stops narrating
// itself in circles.
// GREEN = 5 consecutive warm-band silences: no verbatim NPC content line
// repeats (the bare "..." past the escalation is the absence of speech,
// exempt), the escalation names the silence, and the budget is spent so the
// winddown fires.
// RED (pre-fix) = the 3rd/5th silence re-serve the 1st verbatim.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 777032, mode: 'silence-wrap-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  Game.startConvo(vid);
  // Part A: the line generator, pinned to the warm band (c.mood >= 2).
  const lines = [];
  for (let i = 0; i < 5; i++) {
    Game.convoGet(vid).mood = 2;
    const ms = Game.convoMoodSilence(vid);
    lines.push(String(ms && ms.line));
    console.log(`silence ${i + 1}:`, lines[i], ms && ms.spent ? '(spent)' : '');
  }

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };
  const BARE = '"..."';
  // L2' bar over CONTENT lines: no verbatim repeat among NPC lines other
  // than the bare-silence marker.
  const content = lines.filter(l => l && l !== BARE);
  const seen = new Set();
  content.forEach((l) => {
    if (seen.has(l)) fail(`verbatim content repeat: ${l}`);
    seen.add(l);
  });
  // The pool's two lines both served before any escalation.
  if (content.length < 3) fail(`expected pool lines + escalation, got ${content.length} content lines`);
  // The escalation names the repeated silence honestly (said once).
  const esc = content.filter(l => /quiet's getting|tell me something|on your mind/i.test(l));
  if (esc.length !== 1) fail(`expected exactly one escalation line, got ${esc.length}`);

  // Part B: past the escalation, the turn spends the energy budget so the
  // winddown fires. Drive 4 real silence turns (pool, pool, escalation,
  // past-escalation) with the band pinned.
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  for (let i = 0; i < 4; i++) {
    Game.convoGet(vid).mood = 2;
    const r = safe(() => Game.convoTurn(vid, 'silence'), null);
    if (r && r.ended) break;
  }
  const c = Game.convoGet(vid);
  if (!(c.winddownQueued || c.windingDown || !c.active)) {
    fail(`budget not spent after exhausted silence (budget=${c.budget} exchanges=${c.exchanges})`);
  } else {
    console.log(`winddown state: queued=${!!c.winddownQueued} winding=${!!c.windingDown} active=${!!c.active}`);
  }
  Game.endConvo(vid, 'left');
  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — silence never cycles; the moment winds down');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
