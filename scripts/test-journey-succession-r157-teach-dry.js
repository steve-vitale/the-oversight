#!/usr/bin/env node
// test-journey-succession-r157-teach-dry.js — proof test for the r157
// TEACH-DRY fix (journey-succession r157, Lane B leg 7).
//
// The gap (found on the r155 after-leg, seed 33803 d+53 Brian, and
// pinned from current-master code before any r157 play): the plant-teach
// narration ("You show them <plant> — where it grows, how to tell it
// apart. <teachreact>") is a diegetic act — villagerLearnsPlant +
// taughtByPlayer + trust +2 all fire BEFORE the line is emitted — but
// the emission (conversation.js:6966) exempts only skill_learn: /
// skill_teach: (the r86 skill-lesson exemption) from the run-ledger
// block. The plant-teach 'teach' choice is NOT covered, although the
// comment at 6944-6963 explicitly notes "teach / tell-me drops share
// the ledger but ride different handlers and are not touched here".
// When the same plant is taught twice within the 48-entry run-ledger
// window with the same teachreact variant (per-villager cycle, so two
// villagers both open on variant 0), the second narration is
// run-blocked and dry-replaced with "...Sorry, lost my train of
// thought." — while the lesson has already landed. The narration
// contradicts the action: the player showed them, the villager learned,
// trust moved, and the screen says the speaker lost their train of
// thought. Same diegetic-act class as the r86 skill-lesson defect
// (Stella/Bark armor, seed 42254 day 80).
// The fix: extend lessonOutcome to include choiceId === 'teach' — one
// line, transcript/copy class, the exemption the skill lessons already
// carry. A repeated teach of the same plant to the same villager in
// one sitting cannot happen (teachable filters out plants they already
// know); a same-plant teach to another villager reads as the same
// lesson from another person, not a parrot bug — the r86 justification.
//
// The r157 before-leg panel did NOT reproduce the dry in the wild:
// 25 teach narrations spoke across the 3 repro seeds + smoke, zero
// dried — the repeats were spaced beyond the 48-entry window and the
// teachreact variants differed (the collision needs same plant + same
// variant inside the window). Per the r147 rule the wild turns drop
// out of the denominator, recorded, NOT re-scored; the fix decision
// rests on the mechanism, reproduced deterministically here (the r155
// precedent: "REPRO verdict (mechanism): PASS").
//
// Cases (each in its own process — never two harnesses in one process):
//   teach-blocked : A teaches X (speaks), B teaches X (same composed
//     string — same plant, same teachreact variant forced via B's cycle
//     staging; in the wild the variant draw is chance, and the village
//     freshness filter normally steers villagers to different variants,
//     which is why the wild collision is rare). B's narration must
//     SPEAK (no dry line). RED on unfixed code (B dries); GREEN on
//     fixed code. Also asserts the lesson LANDED for B even where the
//     narration dried (taughtByPlayer) — the defect's core on unfixed
//     code.
//   teach-control : A teaches X, B teaches Y (different plant).
//     Both speak on unfixed AND fixed code. (Pins the speak path.)
//   teach-window  : A teaches X, the run ledger is slid 50 entries
//     (X's key out of the 48-entry window), B teaches X. Both speak
//     on unfixed AND fixed code. (Pins the window mechanism.)
// Usage: node scripts/test-journey-succession-r157-teach-dry.js [case]
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

function transcriptTexts(Game, vid) {
  const c = Game.convoGet(vid);
  return ((c && c.transcript) || []).map(t => String(t.text || ''));
}

// Run fn with Math.random pinned to a constant: the teachreact pick
// (convoPickCycle -> convoPick, random draw over fresh variants) lands
// on slot 0 for every villager, so two villagers teaching the same
// plant compose IDENTICAL strings — the wild collision, staged.
function pinned(fn) {
  const orig = Math.random;
  Math.random = () => 0.1;
  try { return fn(); } finally { Math.random = orig; }
}

function plantName(Game, pid) {
  const def = (Game.data.plants || []).find(p => p.id === pid) || {};
  return def.name || pid;
}

// Scholar knows ONLY the given plants (L1+); both villagers know none
// of them; trust 50 keeps every gate out of the way.
function stageTeachable(Game, vids, pids) {
  const cx = Game.state.codex.plants = {};
  for (const pid of pids) cx[pid] = { identifiedDay: 0, level: 1, harvests: 0, tastings: 0 };
  const v = Game.state.village;
  v.trust = v.trust || {};
  for (const vid of vids) {
    v.trust[vid] = 50;
    for (const store of ['familiar', 'taught', 'plantKnowledge']) {
      const lst = (v[store] || {})[vid];
      if (lst) for (const pid of pids) { const i = lst.indexOf(pid); if (i !== -1) lst.splice(i, 1); }
    }
    v.taughtByPlayer = v.taughtByPlayer || {};
    v.taughtByPlayer[vid] = [];
  }
}

function teachTurn(Game, vid, preTeach) {
  const r = pinned(() => Game.startConvo(vid));
  const opened = !!(r && !r.refused);
  if (opened) {
    if (typeof preTeach === 'function') preTeach(Game, vid);
    pinned(() => Game.convoTurn(vid, 'teach'));
  }
  const texts = transcriptTexts(Game, vid);
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return { opened, texts };
}

// The teachreact pool (conversation.js teach branch). convoPick draws
// a RANDOM fresh variant per villager, and villageLineFresh filters the
// variant the other villager just used — so two villagers teaching the
// same plant normally draw DIFFERENT variants and never collide. The
// wild collision (r155 Brian d+53) happens when the village-freshness
// window slides and both draw the same variant. Stage exactly that:
// pre-seed B's teachreact cycle with every variant EXCEPT the one A
// drew, so B's pick is forced to A's variant and the composed lines
// are identical. The staging controls which variant B draws (chance
// in the wild); the defect under test is the emission blocking the
// identical composed line.
const TEACHREACT = [
  'Their eyes widen. "I never knew that."',
  '"Huh." They turn it over in their mind. "I\'ll remember that one."',
  'They nod slowly, committing it to memory. "Good to know. Really good to know."',
  'A short laugh. "And I\'ve been walking past it for weeks."',
];
function forceSameVariant(Game, vid, aLine) {
  const variant = String(aLine || '').split('how to tell it apart. ')[1] || '';
  const c = Game.convoGet(vid);
  c.said = c.said || {};
  c.said['teachreact'] = TEACHREACT.filter(v => v !== variant);
  return variant;
}

function twoVillagers(Game) {
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  return roster.slice(0, 2);
}

async function runCase(mode) {
  const seed = { 'teach-blocked': 5721, 'teach-control': 5722, 'teach-window': 5723 }[mode] || 5721;
  const { Game } = await loadGame({ seed, mode: 'succession-r157-teach-dry-proof', fullTelemetry: true });
  await setupGame(Game);
  const plants = (Game.data.plants || []).map(p => p.id).filter(Boolean);
  check(`${mode}: plants data present`, plants.length >= 2, `n=${plants.length}`);
  if (plants.length < 2) return;
  const [X, Y] = plants;
  const vids = twoVillagers(Game);
  check(`${mode}: two villagers found`, vids.length >= 2, `found=${vids.length}`);
  if (vids.length < 2) return;
  const [A, B] = vids;
  const xname = plantName(Game, X);
  const yname = plantName(Game, Y);

  if (mode === 'teach-blocked' || mode === 'teach-window') {
    stageTeachable(Game, [A, B], [X]);
    check(`${mode}: scholar knows ${X}`, !!Game.plantKnown(X), `plantKnown=${!!Game.plantKnown(X)}`);
    const ta = teachTurn(Game, A);
    check(`${mode}: A convo opened`, ta.opened, `refused=${!ta.opened}`);
    check(`${mode}: A speaks the teach narration`, ta.texts.some(t => t.includes(`You show them ${xname} —`)), ta.texts.slice(0, 4).join(' | ').slice(0, 240));
    check(`${mode}: A has no dry line`, !ta.texts.some(isDry), ta.texts.slice(0, 4).join(' | ').slice(0, 200));
    const aLine = ta.texts.find(t => t.includes(`You show them ${xname} —`)) || '';
    if (mode === 'teach-window') {
      // Slide the run ledger 50 entries: X's composed line leaves the
      // 48-entry window, so B's identical teach speaks even unfixed.
      const rl = Game.convoRunLedger();
      for (let i = 0; i < 50; i++) rl.push(`__r157-window-filler-${i}__`);
      while (rl.length > 48) rl.shift();
      check('teach-window: A line slid out of the ledger', !rl.some(k => String(k).includes(`You show them ${xname}`)), `ledger=${rl.length}`);
    }
    const tb = teachTurn(Game, B, (G, vid) => forceSameVariant(G, vid, aLine));
    check(`${mode}: B convo opened`, tb.opened, `refused=${!tb.opened}`);
    check(`${mode}: B speaks the teach narration`, tb.texts.some(t => t.includes(`You show them ${xname} —`)), tb.texts.slice(0, 4).join(' | ').slice(0, 240));
    check(`${mode}: B has no dry line`, !tb.texts.some(isDry), tb.texts.slice(0, 4).join(' | ').slice(0, 200));
    if (mode === 'teach-blocked') {
      // The defect's core: on unfixed code B's narration dries while
      // the lesson still lands. Assert the lesson lands either way.
      const taughtB = (Game.state.village.taughtByPlayer || {})[B] || [];
      check('teach-blocked: B still learned the plant (lesson landed)', taughtB.indexOf(X) !== -1, `taughtByPlayer[B]=${JSON.stringify(taughtB)}`);
      if (aLine) {
        const bLine = tb.texts.find(t => t.includes(`You show them ${xname} —`)) || '';
        check('teach-blocked: B speaks the SAME composed line as A', bLine === aLine, `A=${aLine.slice(0, 80)} B=${bLine.slice(0, 80)}`);
      }
    }
    return;
  }

  if (mode === 'teach-control') {
    stageTeachable(Game, [A, B], [X, Y]);
    const ta = teachTurn(Game, A);
    check('teach-control: A convo opened', ta.opened, `refused=${!ta.opened}`);
    check('teach-control: A speaks a teach narration', ta.texts.some(t => t.includes('You show them ')), ta.texts.slice(0, 4).join(' | ').slice(0, 240));
    // B teaches the OTHER plant: no collision by construction. Force
    // the pick by removing X from B's teachable set — B already knows
    // X from... no: B does not know X, so teachable[0] is X again.
    // Instead: teach X to B FIRST in a throwaway sitting is wrong.
    // Simplest deterministic control: A taught X; give B the Y-only
    // scholar by clearing X from the codex between sittings (the
    // scholar's knowledge is staged state, not the mechanic under
    // test — the mechanic is the emission, and B's line differs).
    const cx = Game.state.codex.plants;
    delete cx[X];
    const tb = teachTurn(Game, B);
    check('teach-control: B convo opened', tb.opened, `refused=${!tb.opened}`);
    check('teach-control: B speaks the Y teach narration', tb.texts.some(t => t.includes(`You show them ${yname} —`)), tb.texts.slice(0, 4).join(' | ').slice(0, 240));
    check('teach-control: B has no dry line', !tb.texts.some(isDry), tb.texts.slice(0, 4).join(' | ').slice(0, 200));
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  const all = ['teach-blocked', 'teach-control', 'teach-window'];
  if (mode && all.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('teach-blocked');
    for (const m of all.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r157-teach-dry.js'), m],
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
