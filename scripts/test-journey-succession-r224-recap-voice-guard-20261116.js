#!/usr/bin/env node
// test-journey-succession-r224-recap-voice-guard-20261116.js — proof test
// for the r224 F4b fix (journey-succession r224, the r218-leftover seam).
//
// The r218 panel's second sighting of the recap splice (first: r209's
// Maya, "Let me be straight — Still on that question."): Benjamin d+14
// (34291), "Between us — Still on what's been happening." — a
// reframe-prefix + "Still on <topic>" splice. 1 of 19 "Still on" recap
// lines on the panel carries it; the other 18 are clean.
//
// Root cause (traced this run): `convoRecapLine` (conversation.js)
// returns a first (non-reframed) recap through `voiceLine`, and a
// "Still on X." body is itself a re-anchor — a voice opener stacked on
// it doubles the discourse marker. The openers come from the
// temperament/age/voice-state pools voiceLine merges ("Let me be
// straight — " bold, "Between us — " close-state). Fix: a RE-ANCHOR
// guard inside voiceLine, same pattern as the existing FAVOR-HEADS
// guard — lines matching `^"Still on ` never take an opener (trailing
// closers still fold; an empty closer pool returns the line
// undecorated, which the existing `if (!bit) return line` already
// handles). This kills the splice class everywhere voiceLine is called,
// not just recaps.
//
// Cases (each in its own process — never two harnesses in one process):
//   still-on-no-opener: voiceLine on a "Still on X." line, swept
//     across the whole roster x10 — ZERO results may carry a leading
//     discourse opener (fixed) — on unfixed code the sweep catches
//     opener-prefixed lines ~1 in 8 calls.
//   normal-line-still-voiced: voiceLine on a plain recap line, same
//     sweep — at least one result IS decorated (the guard must not
//     disable voiceLine entirely).
//   recap-direct: real `convoRecapLine` calls on staged two-entry
//     same-thread logs, one fresh sitting per call — every observed
//     "Still on" recap must carry no opener prefix, and at least 5
//     must be observed (else the case is inconclusive, not a pass).
// Usage: node scripts/test-journey-succession-r224-recap-voice-guard-20261116.js [still-on-no-opener|normal-line-still-voiced|recap-direct]
//   Default (no arg): runs all three cases, spawning children for the
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

// A voiceLine result on a "Still on X." line is clean when it is the
// input unchanged or a trailing-closer decoration — either way it must
// still START with the re-anchor itself. Any leading discourse opener
// breaks that prefix.
function isStillOnClean(out, input) {
  return out === input || out.indexOf('"Still on ') === 0;
}

async function setupBase(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.trust = v.trust || {};
  for (const vid of roster) v.trust[vid] = 90;
  return roster;
}

async function runCase(mode) {
  const seed = { 'still-on-no-opener': 5571, 'normal-line-still-voiced': 5572, 'recap-direct': 5573 }[mode] || 5571;
  const { Game } = await loadGame({ seed, mode: 'succession-r224-recap-voice-guard-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupBase(Game);

  if (mode === 'still-on-no-opener') {
    const input = '"Still on what happened."';
    let total = 0, spliced = [], decorated = 0;
    for (const vid of roster) {
      for (let i = 0; i < 10; i++) {
        const out = Game.voiceLine(vid, input);
        total++;
        if (out !== input) decorated++;
        if (!isStillOnClean(out, input)) spliced.push(out);
      }
    }
    check(`${mode}: ${total} voiceLine calls on a Still-on line`, total > 0, `roster=${roster.length}`);
    check(`${mode}: ZERO carry a leading discourse opener`, spliced.length === 0, spliced.length ? `e.g. ${spliced[0]}` : `${decorated} decorated (closers only)`);
    return;
  }

  if (mode === 'normal-line-still-voiced') {
    const input = '"We were talking about the pantry."';
    let total = 0, decorated = 0;
    for (const vid of roster) {
      for (let i = 0; i < 10; i++) {
        const out = Game.voiceLine(vid, input);
        total++;
        if (out !== input) decorated++;
      }
    }
    check(`${mode}: voiceLine still decorates ordinary lines sometimes`, decorated > 0, `${decorated}/${total} decorated`);
    return;
  }

  if (mode === 'recap-direct') {
    let observed = 0, spliced = [];
    for (let round = 0; round < 3; round++) {
      for (const vid of roster) {
        try {
          const r = Game.startConvo(vid);
          if (!(r && !r.refused)) continue;
          const c = Game.convoGet(vid);
          // Two same-thread entries force the "Still on X." form.
          c.threadLog = [{ thread: 'past' }, { thread: 'past' }];
          // Fresh recap state per call: a repeat would reframe ("As I
          // said — ..."), which is the honest r155 reframe, not a splice
          // — and would mask the first-recap voiceLine path under test.
          c._recapSaid = {};
          c._recapPresses = 0;
          const line = Game.convoRecapLine(vid);
          if (typeof line === 'string' && line.indexOf('Still on ') !== -1) {
            observed++;
            // A clean first recap starts with the re-anchor itself; a
            // spliced one buries it behind a discourse opener.
            if (line.indexOf('"Still on ') !== 0) spliced.push(line);
          }
          try { Game.endConvo(vid, 'left'); } catch (e) {}
        } catch (e) { try { Game.endConvo(vid, 'left'); } catch (e2) {} }
      }
    }
    check(`${mode}: at least 5 Still-on recaps observed (else inconclusive)`, observed >= 5, `observed=${observed}`);
    check(`${mode}: ZERO observed Still-on recaps carry a leading opener`, spliced.length === 0, spliced.length ? `e.g. ${spliced[0]}` : `observed=${observed}`);
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['still-on-no-opener', 'normal-line-still-voiced', 'recap-direct'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('still-on-no-opener');
    for (const m of ['normal-line-still-voiced', 'recap-direct']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r224-recap-voice-guard-20261116.js'), m],
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
