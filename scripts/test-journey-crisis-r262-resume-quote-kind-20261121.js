#!/usr/bin/env node
'use strict';
// Proof: a resume opener never quotes a dead favor's words under a new
// favor's label (journey-crisis r262, fix 3 — r261 blemish 5: recall
// label imprecision).
//
// THE MISMATCH (r261 panel, Suarni 14583 d48): a `want` thread planted
// d39 under wound care (heal_help) resumes d48 with the label "that
// foraging help" — the ledger favor changed, and convoOpenThreadLabel
// re-derived correctly (r228) — but the opener still quoted the
// thread's d39 snippet ("Let me sit with all that. We'll pick it up
// later."), which belongs to the wound conversation. Label and quote
// disagree about which favor the thread is.
//
// GREEN (post-fix): when the favor changed kind since planting, the
// opener still names the CURRENT favor (r228 / C3c preserved) but drops
// the stale quote. When the favor is unchanged, the quote is kept —
// the snippet is the thread's own memory. Staging mirrors the r228
// proof (test-journey-crisis-r228-c3c-stale-favor-20261116.js): plant
// the want thread under wound care with a wound snippet, change the
// favor to the villager's live need, advance 5 days, call
// convoResumeOpener directly (looping past its 0.65 random gate).
// Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const WOUND_BEAT = 'My arm still burns where the beast caught me. I need someone to look at it.';
const ASK_FAVOR_WANT = { id: 'ask_favor', def: {} };

const ASKED_LABELS = {
  food_share: 'that food share', forage_help: 'that foraging help',
  sick_help: 'that sickness help', heal_help: 'that wound care',
  water_haul: 'that water haul', watch_shift: 'that watch shift',
  stay_close: 'that night together', snare_mend: 'that snare mending',
};

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

// Plant the want thread under wound care with the wound snippet, then
// change the ledger favor to the villager's live need (or keep it), advance
// `daysLater` days, stage the sitting's want as the favor ask, and pull the
// resume opener. Returns { line, liveKind, liveLabel }.
function stageResume(Game, vid, daysLater, keepFavor) {
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.trust[vid] = 50;
  const opened = Game.startConvo(vid);
  assert(opened && !opened.refused && !opened.ended, 'conversation opens for ' + vid);
  const c = Game.convoGet(vid);
  v.health = v.health || {};
  v.health[vid] = 50; // wound live at plant time
  Game.convoStoreFavor({ kind: 'heal_help', state: 'asked', vid });
  Game.convoThreadOpen(vid, 'want', 'that wound care', 'walked away mid-thread', WOUND_BEAT);
  const open = Game.convoOpenThreads(vid);
  assert(open.length === 1 && open[0].tid === 'want' && open[0].label === 'that wound care',
    'want thread planted under that wound care');
  let liveKind = 'heal_help';
  if (!keepFavor) {
    v.health[vid] = 100; // wound treated — the villager's NEW ask is the live need
    const need = Game.convoFindFavorNeed(vid);
    assert(need && need.kind && ASKED_LABELS[need.kind],
      'villager has a live favor need to ask for (got: ' + JSON.stringify(need) + ')');
    assert(need.kind !== 'heal_help', 'new need must differ from the planted favor (got heal_help)');
    Game.convoStoreFavor({ kind: need.kind, state: 'asked', vid });
    liveKind = need.kind;
  }
  Game.state.scholar.day = (Game.state.scholar.day || 1) + daysLater;
  c.want = ASK_FAVOR_WANT;
  let rs = null;
  for (let i = 0; i < 40 && !rs; i++) rs = Game.convoResumeOpener(vid);
  return { line: rs ? rs.line : null, liveKind, liveLabel: ASKED_LABELS[liveKind] };
}

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const speakers = [];
  for (const id of roster) {
    try { if (Game.commLevel(id).level !== 'full') continue; } catch (e) { continue; }
    speakers.push(id);
    if (speakers.length >= 6) break;
  }
  check('enough full-comm speakers for 3 cases', speakers.length >= 3, 'found ' + speakers.length);

  // ---- 1. favor changed kind: opener names the NEW favor, drops the old quote. ----
  const r1 = stageResume(Game, speakers[0], 5, false);
  console.log('  wound->' + r1.liveKind + ', +5d -> ' + JSON.stringify(r1.line));
  check('changed favor: resume names the current favor',
    typeof r1.line === 'string' && r1.line.includes(r1.liveLabel),
    'got: ' + r1.line + ' (live: ' + r1.liveLabel + ')');
  check('changed favor: resume never names the stale favor',
    typeof r1.line === 'string' && !r1.line.includes('wound care'),
    'got: ' + r1.line + ' (live: ' + r1.liveLabel + ')');
  check('changed favor: resume drops the old favor\'s quoted snippet',
    typeof r1.line === 'string' && !r1.line.includes('My arm still burns'),
    'got: ' + r1.line);

  // ---- 2. control — favor unchanged: the specific label AND the quote both fire. ----
  const r2 = stageResume(Game, speakers[1], 5, true);
  console.log('  wound unchanged, +5d -> ' + JSON.stringify(r2.line));
  check('unchanged favor: resume still names the wound care',
    typeof r2.line === 'string' && r2.line.includes('wound care'), 'got: ' + r2.line);
  check('unchanged favor: resume keeps the thread\'s own quoted snippet',
    typeof r2.line === 'string' && r2.line.includes('My arm still burns'), 'got: ' + r2.line);

  // ---- 3. guard — the r228 helper still re-derives (no overreach into the label). ----
  const opened3 = Game.startConvo(speakers[2]);
  assert(opened3 && !opened3.refused && !opened3.ended, 'conversation opens for case 3');
  Game.convoGet(speakers[2]).want = ASK_FAVOR_WANT;
  const need3 = Game.convoFindFavorNeed(speakers[2]);
  assert(need3 && need3.kind && ASKED_LABELS[need3.kind] && need3.kind !== 'heal_help',
    'case 3 villager needs a live non-wound favor (got: ' + JSON.stringify(need3) + ')');
  Game.convoStoreFavor({ kind: need3.kind, state: 'asked', vid: speakers[2] });
  const h1 = Game.convoOpenThreadLabel(speakers[2],
    { tid: 'want', label: 'that wound care', day: 1, why: 'unfinished business' });
  console.log('  helper, want + ' + need3.kind + ' ledger -> ' + JSON.stringify(h1));
  check('helper: want thread still re-derives to the current favor',
    h1 === ASKED_LABELS[need3.kind], 'got: ' + h1);

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
