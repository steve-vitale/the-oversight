#!/usr/bin/env node
// test-journey-landing-r123-observe-react.js — proof test for the r123
// OBSERVE-REACT fix (journey-landing r123 2026-11-10).
//
// The defect (panel r122, 3 sittings; r123: seed 1142 d6 Jenny, turns 5/9):
// the observe choice draws `drawTruthLine('observedReact', vid)` — but NO
// observedReact pool existed in truthLinePools (the only reference in src/
// was the call site, conversation.js:6652). drawTruthLine returns '' for a
// missing pool, so the handler ALWAYS served the hardcoded default
// '"Something on your mind?"'. First observe in a sitting: spoken. Second
// observe in the SAME sitting: the line is already in the per-sitting
// ledger, so sayLine self-blocks and the convoTurn tail fallback
// (conversation.js:7169) serves convoSelfRepeatLine's first entry,
// "I just said — did you miss it?". The accusation fires about a QUESTION
// she asked, not anything she told the player — the want (if any) hasn't
// surfaced yet. Deterministic, not a fluke: any second observe in a sitting
// misfires, unless voiceLine happens to append a closer that changes the
// composed line (r123 1142 d6 turns 13/17 escaped that way; turn 9 did not).
//
// The fix (src/js, truth.js truthLinePools): a real observedReact pool —
// 8 distinct spoken reactions to being watched, drawn without replacement
// per game (like observeCalm), first entry keeping the old default in
// circulation. Repeated observes draw fresh lines and never self-block
// into the accusation.
//
// Cases (each in its own process — never two harnesses in one process):
//   pool    : drawTruthLine('observedReact') 8 times — every draw non-empty
//             and distinct (per-game no-repeat). On unfixed code: '' every
//             time -> FAIL.
//   observe : menu-driven, two observes in one sitting. The second react
//             must differ from the first AND neither may be the "I just
//             said" accusation. On unfixed code the second observe serves
//             the accusation -> FAIL.
//   control : a single observe serves real content — a pool react, never
//             dry, never the accusation. (The first observe was already
//             correct on unfixed code; this pins it against regressions.)
//
// Usage: node scripts/test-journey-landing-r123-observe-react.js [pool|observe|control]
//   Default (no arg): runs all three cases, spawning children for the two
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

const ACCUSATION = 'did you miss it';
const DRY = [
  'lost my train of thought',
  'Never mind — go on',
  'Actually, forget it',
  'Where was I? Gone',
  'went clean out of my head',
  "it's not coming back",
  'Lost it. The thought',
  'that one slipped away from me',
  "Wasn't important",
  "That's the whole of it",
  "pretty much all of it, honestly",
];
const isDry = (t) => DRY.some(d => String(t || '').includes(d));

function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}

function choices(Game, vid) {
  try { return Game.convoChoices(vid) || []; } catch (e) { return []; }
}

// A healthy villager with no acute needs, met days ago so the observe
// verb is offered (relDays >= 4, conversation.js:4991).
function setupCalm(Game, vid) {
  const v = Game.state.village || {};
  v.health = v.health || {};
  v.health[vid] = 100;
  v.sick = v.sick || {};
  delete v.sick[vid];
  v.hunger = v.hunger || {};
  v.hunger[vid] = 0;
  v.energy = v.energy || {};
  v.energy[vid] = 100;
  v.fear = v.fear || {};
  v.fear[vid] = 0;
  v.trust = v.trust || {};
  v.trust[vid] = 90;
  v.promises = v.promises || {};
  delete v.promises[vid];
  v.favorDeclined = v.favorDeclined || {};
  delete v.favorDeclined[vid];
}

async function openConvo(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  let first = null;
  for (const vid of roster) {
    try { setupCalm(Game, vid); } catch (e) {}
    let r = null;
    try { r = Game.startConvo(vid); } catch (e) { continue; }
    if (!r || r.refused) continue;
    const c = Game.convoGet(vid);
    // We met days ago: relDays >= 4 arms the observe verb.
    try { if (c) c.firstDay = ((Game.state.scholar || {}).day || 1) - 5; } catch (e) {}
    if (!first) first = { vid, c };
    // Prefer a convo that opens with a question to answer: the subject
    // menu (where observe lives) is only reachable past the opener.
    // A high-trust villager may open on a secret thread instead — skip
    // those for this test (the secret thread is not what is under test).
    const ch = choices(Game, vid);
    if (ch.some(x => x.id && x.id.indexOf('ans:') === 0)) return { vid, c, hasQuestion: true };
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  return first;
}

// The opening question must be answered (or deflected) before the subject
// menu — where the observe verb lives — is reachable: at open, the menu
// is only the answer choices + deflect + leave/silence.
function answerOpening(Game, vid, hasQuestion) {
  if (!hasQuestion) return true; // no opening question — nothing to answer.
  const ch = choices(Game, vid);
  const ans = ch.find(x => x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) { Game.convoTurn(vid, ans.id); return true; }
  if (ch.some(x => x.id === 'deflect_q')) { Game.convoTurn(vid, 'deflect_q'); return true; }
  return false;
}

// Page the menu until the named choice is offered (menu:more is
// navigation, never a spoken line), then pick it. Returns true if picked.
function pickWhenOffered(Game, vid, id, maxTurns) {
  for (let turn = 0; turn < (maxTurns || 12); turn++) {
    const c = Game.convoGet(vid);
    if (!c || !c.active) return false;
    const ch = choices(Game, vid);
    if (ch.some(x => x.id === id)) { Game.convoTurn(vid, id); return true; }
    const subj = ch.find(x => x.id === 'dlg:subject');
    if (subj) { Game.convoTurn(vid, 'dlg:subject'); continue; }
    const more = ch.find(x => x.id === 'menu:more');
    if (more) { Game.convoTurn(vid, 'menu:more'); continue; }
    const goon = ch.find(x => x.id === 'goon' || x.id === 'dlg:more');
    if (goon) { Game.convoTurn(vid, goon.id); continue; }
    return false;
  }
  return false;
}

async function runCase(mode) {
  const seed = { pool: 5711, observe: 5712, control: 5713 }[mode] || 5711;
  const { Game } = await loadGame({ seed, mode: 'landing-r123-observe-react-proof', fullTelemetry: true });
  await setupGame(Game);

  if (mode === 'pool') {
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    const vid = roster[0];
    check('pool: roster villager exists', !!vid);
    if (!vid) return;
    const seen = [];
    for (let i = 0; i < 8; i++) {
      let line = '';
      try { line = Game.drawTruthLine('observedReact', vid) || ''; } catch (e) { line = ''; }
      seen.push(line);
    }
    check('pool: all 8 draws non-empty', seen.every(s => s && s.length > 0), `draws=${JSON.stringify(seen).slice(0, 200)}`);
    check('pool: all 8 draws distinct (no-repeat)', new Set(seen).size === 8, `distinct=${new Set(seen).size}`);
    check('pool: no draw is the self-repeat accusation', seen.every(s => !s.includes(ACCUSATION)), '');
    return;
  }

  const opened = await openConvo(Game);
  check(`${mode}: convo opened`, !!opened, opened ? `vid=${opened.vid}` : 'no villager found');
  if (!opened) return;
  const { vid } = opened;
  const opened2 = answerOpening(Game, vid, opened.hasQuestion);
  check(`${mode}: opening question answered/deflected`, opened2);

  if (mode === 'control') {
    const picked = pickWhenOffered(Game, vid, 'observe', 12);
    check('control: observe offered within 12 turns', picked);
    if (!picked) return;
    const line = lastNpcLine(Game, vid);
    check('control: single observe serves real content (not dry)', !!line && !isDry(line), line.slice(0, 120));
    check('control: single observe is NOT the accusation', !line.includes(ACCUSATION), line.slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'observe') {
    const picked1 = pickWhenOffered(Game, vid, 'observe', 12);
    check('observe: first observe offered within 12 turns', picked1);
    if (!picked1) return;
    const line1 = lastNpcLine(Game, vid);
    check('observe: first react is real content (not dry)', !!line1 && !isDry(line1), line1.slice(0, 120));
    check('observe: first react is NOT the accusation', !line1.includes(ACCUSATION), line1.slice(0, 120));
    const picked2 = pickWhenOffered(Game, vid, 'observe', 12);
    check('observe: second observe offered within 12 turns', picked2);
    if (!picked2) return;
    const line2 = lastNpcLine(Game, vid);
    check('observe: second react differs from the first', line2 !== line1, `1=${line1.slice(0, 80)} 2=${line2.slice(0, 80)}`);
    check('observe: second react is NOT the accusation', !line2.includes(ACCUSATION), line2.slice(0, 120));
    check('observe: second react is real content (not dry)', !!line2 && !isDry(line2), line2.slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['pool', 'observe', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('pool');
    for (const m of ['observe', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-landing-r123-observe-react.js'), m],
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
