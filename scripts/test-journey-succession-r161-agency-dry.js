#!/usr/bin/env node
// test-journey-succession-r161-agency-dry.js — proof test for the r161
// AGENCY-DRY fix (journey-succession r161, Lane B leg 7).
//
// The gap (found on the r157 after-leg: 33912 d52 Priya "an old
// trapline", 33925 d31 Marvin "a cellar full of jars", 33927 d52
// Marcus "a spring that runs clear"; pinned from current-master code
// before any r161 play): the agency place-sharing line
// ("<place> — I'll show you on the map sometime. It's real.") is a
// diegetic act — the place is SPENT (k.places.pop()) and the 'taught'
// deed + trust +2 fire BEFORE the line is emitted — but the emission
// (villager-agency.js agencyTurn) passes NO options to sayLine, so the
// run-ledger block applies. The place pool is five shared strings
// (villager-agency.js:613), so two villagers who both learned places
// compose the IDENTICAL line for the same place; when the second asks
// inside the 48-entry window, sayLine run-blocks it and substitutes
// "...Sorry, lost my train of thought." — while the place is already
// popped (lost forever) and the deed recorded. The narration
// contradicts the action: the villager had a real place to share, the
// lesson landed in the book, and the screen says the speaker lost
// their train of thought. Same diegetic-act class as the r86
// skill-lesson and r157 teach defects.
// The fix: pass { diegeticAct: true } when speaking the agency PLACE
// line — the r86/r157 exemption, in the owner file. Two villagers
// telling you about the same real trapline is the same lesson from
// another person, not a parrot bug. The monster and plant lines cannot
// collide (codex-deduped: taught monsters become 'observed', taught
// plants reach level 1), so the exemption applies to the place branch
// only. The generic fallback line ("Saw things with too many joints")
// is NOT exempted: no consequence rides on it, so a dry there falls
// honestly to the closers.
//
// Cases (each in its own process — never two harnesses in one process):
//   agency-blocked : A shares X (speaks), B shares X (same place —
//     same composed string, same five-place pool). B's narration must
//     SPEAK (no dry line). RED on unfixed code (B dries); GREEN on
//     fixed code. Also asserts the place was SPENT for B (k.places
//     empty after) and the deed recorded — the defect's core on
//     unfixed code (lesson landed, narration dried).
//   agency-control : A shares X, B shares Y (different place).
//     Both speak on unfixed AND fixed code. (Pins the speak path.)
//   agency-window  : A shares X, the run ledger is slid 50 entries
//     (X's key out of the 48-entry window), B shares X. Both speak
//     on unfixed AND fixed code. (Pins the window mechanism.)
// Usage: node scripts/test-journey-succession-r161-agency-dry.js [case]
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

// The agency place line, composed exactly as agencyTurn does.
const placeLine = (place) => `"${place} — I'll show you on the map sometime. It's real."`;

function transcriptTexts(Game, vid) {
  const c = Game.convoGet(vid);
  return ((c && c.transcript) || []).map(t => String(t.text || ''));
}

// Run fn with Math.random pinned to a constant, as in the r157 proof
// test: startConvo opener draws land deterministically.
function pinned(fn) {
  const orig = Math.random;
  Math.random = () => 0.1;
  try { return fn(); } finally { Math.random = orig; }
}

// Both villagers know ONLY the given places (same string for the
// collision case); no teachable plants, no fought monsters, no
// explorer news — so the ask can only spend a place.
function stagePlaces(Game, vids, placesByVid) {
  const st = Game.agencyState();
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.explorerNews = v.explorerNews || {};
  for (const vid of vids) {
    st.know[vid] = { plants: 0, monsters: 0, places: (placesByVid[vid] || []).slice(), fought: [] };
    st.teachable[vid] = [];
    v.trust[vid] = 50;
    delete v.explorerNews[vid];
  }
}

function agencyTurn(Game, vid) {
  const r = pinned(() => Game.startConvo(vid));
  const opened = !!(r && !r.refused);
  if (opened) pinned(() => Game.convoTurn(vid, 'agency:ask_field'));
  const texts = transcriptTexts(Game, vid);
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return { opened, texts };
}

function twoVillagers(Game) {
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  return roster.slice(0, 2);
}

async function runCase(mode) {
  const seed = { 'agency-blocked': 5821, 'agency-control': 5822, 'agency-window': 5823 }[mode] || 5821;
  const { Game } = await loadGame({ seed, mode: 'succession-r161-agency-dry-proof', fullTelemetry: true });
  await setupGame(Game);
  const vids = twoVillagers(Game);
  check(`${mode}: two villagers found`, vids.length >= 2, `found=${vids.length}`);
  if (vids.length < 2) return;
  const [A, B] = vids;
  const X = 'an old trapline';
  const Y = 'a spring that runs clear';
  const xLine = placeLine(X);

  if (mode === 'agency-blocked' || mode === 'agency-window') {
    stagePlaces(Game, [A, B], { [A]: [X], [B]: [X] });
    const ta = agencyTurn(Game, A);
    check(`${mode}: A convo opened`, ta.opened, `refused=${!ta.opened}`);
    check(`${mode}: A speaks the place line`, ta.texts.some(t => t.includes(xLine)), ta.texts.slice(0, 4).join(' | ').slice(0, 240));
    check(`${mode}: A has no dry line`, !ta.texts.some(isDry), ta.texts.slice(0, 4).join(' | ').slice(0, 200));
    if (mode === 'agency-window') {
      // Slide the run ledger 50 entries: X's key out of the 48-entry
      // window, so B's identical place line speaks even unfixed.
      const rl = Game.convoRunLedger();
      for (let i = 0; i < 50; i++) rl.push(`__r161-window-filler-${i}__`);
      while (rl.length > 48) rl.shift();
      check('agency-window: A line slid out of the ledger', !rl.some(k => String(k).includes(xLine)), `ledger=${rl.length}`);
    }
    const tb = agencyTurn(Game, B);
    check(`${mode}: B convo opened`, tb.opened, `refused=${!tb.opened}`);
    check(`${mode}: B speaks the place line`, tb.texts.some(t => t.includes(xLine)), tb.texts.slice(0, 4).join(' | ').slice(0, 240));
    check(`${mode}: B has no dry line`, !tb.texts.some(isDry), tb.texts.slice(0, 4).join(' | ').slice(0, 200));
    if (mode === 'agency-blocked') {
      // The defect's core: on unfixed code B's narration dries while
      // the place is already spent and the deed recorded. Assert the
      // place was spent either way, and B speaks the SAME line as A.
      const st = Game.agencyState();
      const bPlaces = ((st.know[B] || {}).places || []);
      check('agency-blocked: B place spent (lesson landed)', bPlaces.length === 0, `places[B]=${JSON.stringify(bPlaces)}`);
      const bLine = tb.texts.find(t => t.includes(xLine)) || '';
      check('agency-blocked: B speaks the SAME place line as A', bLine === xLine, `B=${bLine.slice(0, 80)}`);
    }
    return;
  }

  if (mode === 'agency-control') {
    stagePlaces(Game, [A, B], { [A]: [X], [B]: [Y] });
    const ta = agencyTurn(Game, A);
    check('agency-control: A convo opened', ta.opened, `refused=${!ta.opened}`);
    check('agency-control: A speaks the X place line', ta.texts.some(t => t.includes(placeLine(X))), ta.texts.slice(0, 4).join(' | ').slice(0, 240));
    check('agency-control: A has no dry line', !ta.texts.some(isDry), ta.texts.slice(0, 4).join(' | ').slice(0, 200));
    const tb = agencyTurn(Game, B);
    check('agency-control: B convo opened', tb.opened, `refused=${!tb.opened}`);
    check('agency-control: B speaks the Y place line', tb.texts.some(t => t.includes(placeLine(Y))), tb.texts.slice(0, 4).join(' | ').slice(0, 240));
    check('agency-control: B has no dry line', !tb.texts.some(isDry), tb.texts.slice(0, 4).join(' | ').slice(0, 200));
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  const all = ['agency-blocked', 'agency-control', 'agency-window'];
  if (mode && all.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('agency-blocked');
    for (const m of all.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r161-agency-dry.js'), m],
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
