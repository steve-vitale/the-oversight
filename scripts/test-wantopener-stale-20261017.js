#!/usr/bin/env node
// test-wantopener-stale-20261017.js — proof test for the seek_taken "pool
// narrowness" blank (scale r4, Bakhyt 8707): after all 3 fresh opener
// variants are ledger-blocked, the want went permanently mute — the goal
// fallback hijacked the topic (thread 'goal') and the dlg:more handler's
// unconditional convoWantEngage(vid,'engage') credited the want for
// conversations that never touched it (stage 0 -> 2, resolution 'engaged'
// on legacy-goal content, zero Taking lines spoken).
//
// Root cause: convoPickCycle never returns null on exhaustion — it resets
// and re-picks — so a long-lived want's opener variants all end up in the
// no-repeat ledgers, and every future opener is skipped. Three compounding
// defects:
//   (a) no stale-opener fallback: the want reframes never; it falls through
//       to the goal fallback forever (thread 'goal', want never surfaces);
//   (b) thread-incoherent engagement: dlg:more / dlg:askwhy engaged the live
//       want even when the thread wasn't the want's (dlg:comfort did too for
//       non-comfort wants);
//   (c) the takenWantDay 3-day gate was consumed inside opener() — which ran
//       even when the opener was skipped — so a muted want also burned its
//       re-draw gate on conversations where it never surfaced.
//
// Fix: (a) def.staleOpener(vid) reframe when every fresh variant is
// ledger-blocked (seek_taken gets state-aware lines; generic fallback for
// wants without one); (b) engagement only when the thread IS the want's
// ('want'/'small'; comfort also for comfort-kind wants); (c) takenWantDay
// moves to def.onSurfaced — set only when the opener actually speaks.
//
// TEST 1 — stale reframe: with all 3 fresh variants ledger-blocked,
//   convoOpening must return thread 'want' (a stale reframe), not fall
//   through to 'goal'/'small'.
// TEST 2 — thread-coherent engagement: with the opener AND the stale
//   opener exhausted (want genuinely un-surfaceable this conversation),
//   a dlg:more on the fallback thread must NOT engage the want; the
//   conversation must resolve 'unestablished', never 'engaged'.
//
// RED (pre-fix): TEST 1 falls through (thread 'goal'); TEST 2 engages
//   (stage 0 -> 2, resolution 'engaged').
// GREEN (post-fix): TEST 1 reframes (thread 'want', stale content);
//   TEST 2 leaves the want at stage 0, resolution 'unestablished'.
// RNG is seeded by loadGame (mulberry32 BEFORE eval) — deterministic.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function blockKey(Game, vid, line) {
  const c = Game.convoGet(vid);
  c.saidLines = c.saidLines || [];
  let key = String(line || '');
  try { key = Game.convoSplitBeats(line)[0].trim(); } catch (e) {}
  if (key && c.saidLines.indexOf(key) === -1) c.saidLines.push(key);
}

function freshWant(Game, vid, id, def) {
  const c = Game.convoGet(vid);
  c.want = { id, def, stage: 0, fromSeed: false };
  return c.want;
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'proof-wantopener-stale' });
  await setupGame(Game);
  // DETERMINISTIC VOICE: voiceLine randomly adds discourse markers, so the
  // ledger key of a voiced line is non-deterministic. The mechanism under
  // test (opener exhaustion -> stale reframe; thread-coherent engagement)
  // doesn't depend on markers — stub to identity for exact ledger keys.
  const realVoiceLine = Game.voiceLine;
  Game.voiceLine = (vid, line) => line;
  let fails = 0;
  const fail = (m) => { fails++; console.log('  FAIL:', m); };

  // Fixture: a villager mourning taken kin, on a repeat meeting so the
  // GRIEF FLOOR (3.1) selects seek_taken.
  const cands = Game.villagersMourningTaken();
  if (!cands.length) throw new Error('no villagers mourning taken kin on seed 7');
  let vid = null, want = null;
  for (const id of cands) {
    Game.convoGet(id).count = 5;
    const w = Game.convoSelectWant(id);
    if (w && w.id === 'seek_taken') { vid = id; want = w; break; }
  }
  if (!vid) throw new Error('seek_taken not selected for any mourning candidate');
  console.log('fixture: villager mourning taken kin, seek_taken selected');

  // TEST 0 — fixture sanity: unblocked, the want opener fires.
  {
    freshWant(Game, vid, want.id, want.def);
    const res = Game.convoOpening(vid, Game.convoGet(vid).want);
    if (!res || res.thread !== 'want') fail(`TEST 0 sanity: unblocked opener -> thread '${res && res.thread}' (expected 'want')`);
    else console.log('TEST 0 ok: unblocked want opener fires (thread want)');
  }

  // TEST 1 — exhaust all 3 fresh variants, then the want must reframe.
  {
    const c = Game.convoGet(vid);
    for (let i = 0; i < 3; i++) {
      const opener = Game.convoWantOpener(vid, { id: want.id, def: want.def });
      if (opener && opener.line) blockKey(Game, vid, Game.voiceLine(vid, opener.line));
    }
    freshWant(Game, vid, want.id, want.def);
    const res = Game.convoOpening(vid, c.want);
    const line = (res && res.line) || '';
    if (!res || res.thread !== 'want') {
      fail(`TEST 1 stale reframe: thread '${res && res.thread}' (expected 'want') — want went mute behind ledger-blocked openers`);
    } else if (!/pod|humming|taken/i.test(line)) {
      fail(`TEST 1 stale reframe: thread want but line is not Taking content: ${line.slice(0, 80)}`);
    } else {
      console.log(`TEST 1 ok: stale opener reframes (thread want): ${line.slice(0, 90)}...`);
    }
  }

  // TEST 2 — the Bakhyt shape, established deterministically: the opener
  // chain is exhausted (want genuinely un-surfaceable this conversation),
  // the conversation sits on the GOAL thread (the fall-through topic whose
  // beats the false engagement rode on), the want is live at stage 0.
  // Pressing "tell me more" must not engage the want.
  {
    const c = Game.convoGet(vid);
    let res = null, guard = 0;
    while (guard++ < 14) {
      freshWant(Game, vid, want.id, want.def);
      res = Game.convoOpening(vid, c.want);
      if (!res || res.thread !== 'want') break;
      blockKey(Game, vid, res.line);
    }
    if (res && res.thread === 'want') {
      fail('TEST 2 setup: opener chain never fell through after 14 blocks');
    } else {
      // Establish the conversation on the goal thread, as the fall-through
      // does (trust 100, as in Bakhyt's case).
      Game.state.village.trust[vid] = 100;
      c.active = true; c.thread = 'goal'; c.depth = 1; c.transcript = [];
      c.pendingQ = null; c.reactiveQ = null; c.genericQ = null;
      c.threadDryFor = null;
      freshWant(Game, vid, want.id, want.def);
      const w0 = c.want.stage || 0;
      const ids = (Game.convoChoices(vid) || []).map(x => x.id);
      if (ids.indexOf('dlg:more') === -1) {
        fail(`TEST 2 setup: dlg:more not offered on the goal thread [${ids.slice(0, 10).join(',')}]`);
      } else if (!Game.convoThreadBeat(vid)) {
        // Guard against a vacuous pass: the engagement path only runs when
        // a beat lands. (Proven non-null for goal threads in the live
        // Bakhyt transcript; this asserts the fixture has beats.)
        fail('TEST 2 setup: no goal-thread beat available — engagement path untestable');
      } else {
        const turn = Game.convoTurn(vid, 'dlg:more');
        const dry = /pretty much all of it|wish there was more|whole of it/.test(turn.line || '');
        if (dry) {
          fail('TEST 2 setup: dlg:more went dry — engagement path untestable');
        } else {
          const stage = c.want.stage;
          Game.endConvo(vid, 'done');
          const resolution = c.want.resolution;
          if (stage >= 2 || resolution === 'engaged') {
            fail(`TEST 2 thread-coherent engagement: dlg:more on the goal thread engaged the want (stage ${w0} -> ${stage}, resolution '${resolution}') — false engagement`);
          } else {
            console.log(`TEST 2 ok: dlg:more on the goal thread left the want at stage ${stage}, resolution '${resolution}'`);
          }
        }
      }
    }
  }

  if (fails) { console.log(`\nRED: ${fails} failing assertion(s)`); process.exit(1); }
  console.log('\nGREEN: stale opener reframes; engagement is thread-coherent');
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
