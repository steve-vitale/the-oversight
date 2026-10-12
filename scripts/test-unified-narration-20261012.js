#!/usr/bin/env node
// test-unified-narration-20261012.js — proof for the one-surface unification
// (Steve 2026-10-12, on his phone): the green action-feedback card stacked
// above the dark narration box — two text surfaces doing one job, violating
// his "ONE box, ONE format" law. The separate card is retired; the narration
// box (narrationBoxHTML) now renders the latest narration-or-feedback beat.
//
// PART 1 — static one-surface contract on src/js/app.js + src/css/main.css.
// PART 2 — behavioral: the REAL narrationBoxHTML (extracted from the shipped
//          source, run in a stubbed VM) fed realistic beats, incl. Steve's
//          screenshot lines. Asserts one surface, latest-beat-wins, no card.
// PART 3 — engine: the tagged stream both surfaces flow through is
//          well-formed (marked say() -> feedback, unmarked -> narration).
//
// RED on old code: PART 1 checks 1-4 and PART 2 checks 6-9 fail on pristine
// HEAD (separate card rendered; narration box ignored feedback).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'src/css/main.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

console.log('== PART 1 — one-surface contract (static) ==');
check('no ${feedbackHTML()} insertions in render templates',
  !/\$\{feedbackHTML\(\)\}/.test(APP));
check('feedbackHTML() retired to a no-op (no card HTML)',
  /function feedbackHTML\(\) \{\s*\n?\s*return '';\s*\n?\s*\}/.test(APP) &&
  !/function feedbackHTML\(\)[\s\S]*?feedbackcard/.test(APP.match(/function feedbackHTML\(\)[\s\S]*?\n  \}/)[0]));
check('feedbackInner (old card builder) removed',
  !/function feedbackInner\(\)/.test(APP));
check('narrationBoxHTML scans narration OR feedback (latest beat wins)',
  /s === 'narration' \|\| s === 'feedback'/.test(APP) && /let lastBeat = ''/.test(APP));
check('refreshFeedback re-renders .ord-narration via narrationBoxHTML (+contest wiring)',
  /function refreshFeedback\(\)[\s\S]*?querySelector\('\.ord-narration'\)[\s\S]*?narrationBoxHTML\(Game\.state, chatView\)/.test(APP) &&
  /function refreshFeedback\(\)[\s\S]*?data-contest-choice/.test(APP));
check('contest/person/dialogue precedence preserved in narrationBoxHTML',
  /activeContest/.test(APP) && /inlineView\.kind === 'person'/.test(APP) &&
  /if \(chatView\) return dialogueBoxHTML\(chatView\)/.test(APP));
check('no .feedbackcard/.ord-feedback/.fb-line rules left in CSS',
  !/\.feedbackcard/.test(CSS) && !/\.ord-feedback/.test(CSS) && !/\.fb-line/.test(CSS));
check('.narr-syntease variant exists for tease beats',
  /\.narr-syntease/.test(CSS));

// ---- PART 2: run the real narrationBoxHTML in a stubbed VM ----
console.log('== PART 2 — behavioral: real narrationBoxHTML, realistic beats ==');
const m = APP.match(/function narrationBoxHTML\([\s\S]*?\n  \}/);
check('narrationBoxHTML extracts cleanly from shipped source',
  !!m && m[0].includes('lastBeat') && m[0].trimEnd().endsWith('}'));

function entry(text, surface) {
  const e = new String(text);
  e.text = text; e.surface = surface; e.t = Date.now();
  return e;
}
function makeNB(logEntries, opts) {
  opts = opts || {};
  const sandbox = {
    Game: { log: logEntries, state: opts.state || {} },
    window: {},
    esc: s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    contestBoxHTML: () => '<div class="contest-stub">CONTEST</div>',
    personCardHTML: () => '<div class="person-stub">PERSON</div>',
    dialogueBoxHTML: () => '<div class="dialogue-stub">DIALOGUE</div>',
    inlineView: opts.inlineView || null,
    _isSynTeaseLine: opts.isTease || (() => false),
    _synTeaseSet: () => new Set(),
    console,
  };
  vm.createContext(sandbox);
  const nb = vm.runInContext(m[0] + '\nnarrationBoxHTML;', sandbox);
  return nb;
}
const countBoxes = html => (html.match(/dialogue-box/g) || []).length;

// Steve's screenshot, verbatim beats: narration grant, then a travel action's
// feedback. The unified box must show the travel beat — in the ONE box.
{
  const nb = makeNB([
    entry("The Touch. It was always there. Now you've named it, and naming it makes it yours on purpose. (Your first ability — it deepens with use.)", 'narration'),
    entry('Travel 1 tile to meadow. – Open ground – Grasshoppers rise…', 'feedback'),
  ]);
  const html = nb({}, null);
  check('latest feedback beat renders (screenshot case)', html.includes('Travel 1 tile to meadow'));
  check('older narration beat replaced (one message at a time)', !html.includes('The Touch'));
  check('exactly one text surface in output', countBoxes(html) === 1);
  check('no second-surface markup leaks', !/feedbackcard|ord-feedback/.test(html));
  console.log('      unified box now reads: ' + html.replace(/<[^>]*>/g, '').slice(0, 90) + '…');
}
{
  const nb = makeNB([
    entry('You cut the fallen tree. (+4 wood)', 'feedback'),
    entry('A hushwolf howls far off, and the village holds its breath.', 'narration'),
  ]);
  const html = nb({}, null);
  check('latest narration beat renders when newest', html.includes('hushwolf howls'));
  check('feedback beat replaced, still one surface', !html.includes('fallen tree') && countBoxes(html) === 1);
}
{
  const nb = makeNB([]);
  check('empty log renders nothing', nb({}, null) === '');
}
{
  // HTML-tag glue fix preserved: </p> boundaries become spaces.
  const nb = makeNB([entry('It slams through!</p><p>A woman screams.', 'feedback')]);
  const html = nb({}, null);
  check('</p> boundaries become spaces, tags stripped',
    html.includes('It slams through! A woman screams.'));
}
{
  // Synergy tease keeps its accent inside the one box.
  const nb = makeNB([entry('Something wants to happen when you do whatever you just did. (2/3)', 'feedback')],
    { isTease: () => true });
  const html = nb({}, null);
  check('tease beat keeps purple accent + mark in the one box',
    html.includes('narr-syntease') && html.includes('🌀'));
}
{
  // Contest takeover untouched: active contest still owns the surface.
  const nb = makeNB([entry('Travel 1 tile to meadow.', 'feedback')],
    { state: { activeContest: { phases: [{ text: 'x', choices: [] }], phase: 'mid' } } });
  check('active contest still takes over the surface', nb({}, null).includes('CONTEST'));
}
{
  // Dialogue (chatView) still takes precedence over beats.
  const nb = makeNB([entry('Travel 1 tile to meadow.', 'feedback')]);
  check('open conversation still takes precedence', nb({}, { vid: 'v1' }).includes('DIALOGUE'));
}

// ---- PART 3: engine stream well-formed (sim-harness) ----
// NOTE: sim-harness stubs Game.say to a no-op (narration silenced for sims),
// so PART 3 exercises Game.emit — the single write path both surfaces flow
// through — plus a static check on the encounters.js say-tagging override.
// (Skipped when sim-harness is unavailable, e.g. RED-checks against a bare
// HEAD tree — PART 3 tests the unchanged engine premise, not the fix.)
console.log('== PART 3 — engine tagged stream (sim-harness) ==');
let harness = null;
try { harness = require('./sim-harness'); } catch (e) { console.log('  (sim-harness unavailable — skipping PART 3)'); }
const ENC = fs.readFileSync(path.join(ROOT, 'src/js/encounters.js'), 'utf8');
function mulberry(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
(async () => {
  check('engine say() tags post-mark emissions as feedback (source)',
    /feedbackMode \? 'feedback' : 'narration'/.test(ENC));
  if (!harness) {
    console.log(`\n==== ${pass}/${pass + fail} checks passed (PART 3 skipped) ====`);
    if (fail) process.exit(1);
    return;
  }
  const { loadGame, setupGame } = harness;
  Math.random = mulberry(7);
  const { Game } = await loadGame({ seed: 7, mode: 'competent', fullTelemetry: false });
  await setupGame(Game);
  const base = (Game.log || []).length;
  Game.emit('Ambient world narration.', 'narration');
  Game.emit('You cut the fallen tree. (+4 wood)', 'feedback');
  Game.feedback('Explicit feedback path.');
  const tail = (Game.log || []).slice(base);
  const surf = tail.map(e => (e && e.surface) || 'narration');
  check('emit(narration) + emit/feedback(feedback) share one interleaved log',
    tail.length === 3 && surf.join(',') === 'narration,feedback,feedback');
  check('entry .text survives the tagged round-trip',
    /You cut the fallen tree/.test(String(tail[1].text || tail[1])));
  // The unified box consumes the tail's latest entry:
  const latest = String(tail[tail.length - 1].text || tail[tail.length - 1]);
  check('latest beat is the action result (what the one box shows)', /Explicit feedback path/.test(latest));

  console.log(`\n==== ${pass}/${pass + fail} checks passed ====`);
  if (fail) { console.log('FAILURES PRESENT'); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
