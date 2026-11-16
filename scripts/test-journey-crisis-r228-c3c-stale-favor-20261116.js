#!/usr/bin/env node
'use strict';
// Proof: resume opener names the CURRENT favor, never the stale one
// (journey-crisis r228, C3c watch — open since r208, UNMEASURED on the
// r216 and r223 panels: no qualifying case in the wild).
//
// THE HOLE (read from code, not guessed): convoResumeOpener builds its
// label via convoThreadAbout(vid, o.tid, o.label || o.tid) — and
// convoThreadAbout returns the passed label whenever it is non-empty,
// so the STORED snapshot label wins over the live derivation. The favor
// can change between planting and resuming (r208: Hank d10 forage ->
// d34 wound care), so a `want` thread planted under "that wound care"
// resumes as "that wound care" after the favor moved on to a food
// share — the NPC names a favor nobody asked for anymore. The r208
// freshness rule (re-derive want labels live) was applied to close
// lines (convoNoteTopic) and lapse lines, but NEVER to the resume
// opener — nor to the resume-offer Yes follow-through (line 7352:
// `(o && o.label) || ...`) nor to the alive-menu thread offer
// (convo-scene.js:401: same stored-label-first call). All three sites
// share the hole; all three go through the one fix.
//
// GREEN (post-fix): the resume opener re-derives the want label live
// (convoTopicLabel names the ledger's current open favor, else the
// live need scan, else the generic 'that favor' — never a stale
// specific). Non-want threads keep their stored label.
//
// Staging (same shape as the r201 settled-favor proof): plant the
// `want` thread under wound care with the heal_help favor asked in the
// ledger, then change the favor, advance 5 days (inside the 14-day
// window), and call convoResumeOpener directly — looping past its
// 0.65 random gate — with the sitting's want staged as the favor ask
// (the wild shape: the villager still has an open favor). Uses the
// shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const WOUND_BEAT = 'My arm still burns where the beast caught me. I need someone to look at it.';
const ASK_FAVOR_WANT = { id: 'ask_favor', def: {} };

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

const ASKED_LABELS = {
  food_share: 'that food share', forage_help: 'that foraging help',
  sick_help: 'that sickness help', heal_help: 'that wound care',
  water_haul: 'that water haul', watch_shift: 'that watch shift',
  stay_close: 'that night together', snare_mend: 'that snare mending',
};

// Stage one resume-opener decision for a villager:
// open a conversation, plant the want thread under `plantLabel` with the
// `plantFavor` in the ledger, then replace the ledger favor with a NEW
// favor built from the villager's own LIVE need (convoFindFavorNeed —
// the faithful wild shape: a villager only asks for a need that is
// really there), advance `daysLater` days, stage the sitting's want as
// the favor ask, and pull the resume opener (looping past the 0.65
// gate). Returns { line, liveKind, liveLabel } — the live favor the
// opener must name. A ledger favor staged WITHOUT its underlying need
// is not faithful: the r108 liveness guard (convoTopicLabel) correctly
// refuses to name it, and the opener falls back to the live scan.
function stageResume(Game, vid, plantLabel, plantFavor, daysLater) {
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.trust[vid] = 50;
  const opened = Game.startConvo(vid);
  assert(opened && !opened.refused && !opened.ended, 'conversation opens for ' + vid);
  const c = Game.convoGet(vid);
  // The plant favor is faithful only with its wound behind it: heal_help
  // need is live while health < 60 (convoFavorNeedGate).
  v.health = v.health || {};
  v.health[vid] = 50;
  Game.convoStoreFavor({ kind: plantFavor.kind, state: plantFavor.state, vid });
  Game.convoThreadOpen(vid, 'want', plantLabel, 'walked away mid-thread', WOUND_BEAT);
  const open = Game.convoOpenThreads(vid);
  assert(open.length === 1 && open[0].tid === 'want' && open[0].label === plantLabel,
    'want thread planted under ' + plantLabel);
  // The wound got treated (health restored), so heal_help is no longer
  // live — the villager's NEW ask is whatever need is live now. That is
  // the discriminating shape: old favor gone, new favor real.
  v.health[vid] = 100;
  const need = Game.convoFindFavorNeed(vid);
  assert(need && need.kind && ASKED_LABELS[need.kind],
    'villager has a live favor need to ask for (got: ' + JSON.stringify(need) + ')');
  assert(need.kind !== 'heal_help', 'new need must differ from the planted favor (got heal_help)');
  Game.convoStoreFavor({ kind: need.kind, state: 'asked', vid });
  Game.state.scholar.day = (Game.state.scholar.day || 1) + daysLater;
  c.want = ASK_FAVOR_WANT;
  let rs = null;
  for (let i = 0; i < 40 && !rs; i++) rs = Game.convoResumeOpener(vid);
  return { line: rs ? rs.line : null, liveKind: need.kind, liveLabel: ASKED_LABELS[need.kind] };
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
  check('enough full-comm speakers for 6 cases', speakers.length >= 6, 'found ' + speakers.length);
  const day0 = Game.state.scholar.day || 1;

  // ---- 1. favor changed to the villager's live need: resume names the NEW favor. ----
  const r1 = stageResume(Game, speakers[0], 'that wound care',
    { kind: 'heal_help', state: 'asked' }, 5);
  console.log('  wound->' + r1.liveKind + ', +5d -> ' + JSON.stringify(r1.line));
  check('changed favor: resume names the current favor',
    typeof r1.line === 'string' && r1.line.includes(r1.liveLabel),
    'got: ' + r1.line + ' (live: ' + r1.liveLabel + ')');
  check('changed favor: resume never names the stale favor',
    typeof r1.line === 'string' && (r1.liveKind === 'heal_help' || !r1.line.includes('wound care')),
    'got: ' + r1.line + ' (live: ' + r1.liveLabel + ')');

  // ---- 2. favor fulfilled, no new favor: resume agrees with the LIVE derivation. ----
  // The live label depends on the villager's current needs (live scan) —
  // whatever it is, the opener must agree with it, never the stored
  // snapshot. Compute it before pulling the opener.
  const v2 = Game.state.village;
  v2.trust = v2.trust || {};
  v2.trust[speakers[1]] = 50;
  const opened2 = Game.startConvo(speakers[1]);
  assert(opened2 && !opened2.refused && !opened2.ended, 'conversation opens for case 2');
  const c2 = Game.convoGet(speakers[1]);
  v2.health = v2.health || {};
  v2.health[speakers[1]] = 50; // wound live at plant time
  Game.convoStoreFavor({ kind: 'heal_help', state: 'asked', vid: speakers[1] });
  Game.convoThreadOpen(speakers[1], 'want', 'that wound care', 'walked away mid-thread', WOUND_BEAT);
  v2.health[speakers[1]] = 100; // wound treated — the favor is done
  Game.convoStoreFavor({ kind: 'heal_help', state: 'fulfilled', vid: speakers[1] });
  Game.state.scholar.day = (Game.state.scholar.day || 1) + 5;
  c2.want = ASK_FAVOR_WANT;
  const expectedLive2 = Game.convoTopicLabel(speakers[1], 'want');
  let rs2 = null;
  for (let i = 0; i < 40 && !rs2; i++) rs2 = Game.convoResumeOpener(speakers[1]);
  const l2 = rs2 ? rs2.line : null;
  console.log('  wound fulfilled, +5d -> ' + JSON.stringify(l2) + ' (live label: ' + JSON.stringify(expectedLive2) + ')');
  check('fulfilled favor: resume agrees with the live derivation',
    typeof l2 === 'string' && typeof expectedLive2 === 'string' && l2.includes(expectedLive2),
    'got: ' + l2 + ' vs live: ' + expectedLive2);
  check('fulfilled favor: resume never names the stored snapshot when it differs',
    typeof l2 === 'string' && (expectedLive2 === 'that wound care' || !l2.includes('wound care')),
    'got: ' + l2 + ' vs live: ' + expectedLive2);

  // ---- 3. control — favor unchanged, wound still live: the specific label still fires. ----
  const v3 = Game.state.village;
  v3.trust = v3.trust || {};
  v3.trust[speakers[2]] = 50;
  const opened3 = Game.startConvo(speakers[2]);
  assert(opened3 && !opened3.refused && !opened3.ended, 'conversation opens for case 3');
  const c3 = Game.convoGet(speakers[2]);
  v3.health = v3.health || {};
  v3.health[speakers[2]] = 50; // wound live, and it stays live
  Game.convoStoreFavor({ kind: 'heal_help', state: 'asked', vid: speakers[2] });
  Game.convoThreadOpen(speakers[2], 'want', 'that wound care', 'walked away mid-thread', WOUND_BEAT);
  Game.state.scholar.day = (Game.state.scholar.day || 1) + 5;
  c3.want = ASK_FAVOR_WANT;
  let rs3 = null;
  for (let i = 0; i < 40 && !rs3; i++) rs3 = Game.convoResumeOpener(speakers[2]);
  const l3 = rs3 ? rs3.line : null;
  console.log('  wound unchanged, +5d -> ' + JSON.stringify(l3));
  check('unchanged favor: resume still names the wound care',
    typeof l3 === 'string' && l3.includes('wound care'), 'got: ' + l3);

  // ---- 4. helper direct (alive-menu path): same freshness, no conversation needed. ----
  // The new favor must be the villager's live need (same faithfulness
  // rule as case 1): a ledger favor without its need behind it is
  // correctly refused by the r108 liveness guard. The helper reads the
  // sitting's want (convoTopicLabel's ask_favor branch), so each case
  // opens a conversation and stages the favor-ask want — the shape the
  // menu and resume paths actually run in.
  const opened4a = Game.startConvo(speakers[3]);
  assert(opened4a && !opened4a.refused && !opened4a.ended, 'conversation opens for case 4a');
  Game.convoGet(speakers[3]).want = ASK_FAVOR_WANT;
  const need4 = Game.convoFindFavorNeed(speakers[3]);
  assert(need4 && need4.kind && ASKED_LABELS[need4.kind] && need4.kind !== 'heal_help',
    'case 4 villager needs a live non-wound favor (got: ' + JSON.stringify(need4) + ')');
  Game.convoStoreFavor({ kind: need4.kind, state: 'asked', vid: speakers[3] });
  const h1 = Game.convoOpenThreadLabel(speakers[3],
    { tid: 'want', label: 'that wound care', day: day0, why: 'unfinished business' });
  console.log('  helper, want + ' + need4.kind + ' ledger -> ' + JSON.stringify(h1));
  check('helper: want thread re-derives to the current favor',
    h1 === ASKED_LABELS[need4.kind], 'got: ' + h1);
  const opened4b = Game.startConvo(speakers[4]);
  assert(opened4b && !opened4b.refused && !opened4b.ended, 'conversation opens for case 4b');
  Game.convoGet(speakers[4]).want = ASK_FAVOR_WANT;
  v.health = v.health || {};
  v.health[speakers[4]] = 50; // wound live, so the wound-care favor is faithful
  Game.convoStoreFavor({ kind: 'heal_help', state: 'asked', vid: speakers[4] });
  const h2 = Game.convoOpenThreadLabel(speakers[4],
    { tid: 'want', label: 'that wound care', day: day0, why: 'unfinished business' });
  console.log('  helper, want + wound ledger -> ' + JSON.stringify(h2));
  check('helper: unchanged favor keeps its specific label',
    h2 === 'that wound care', 'got: ' + h2);

  // ---- 5. non-want thread keeps its stored label (no overreach). ----
  const h3 = Game.convoOpenThreadLabel(speakers[5],
    { tid: 'past', label: 'their past', day: day0, why: 'unfinished business' });
  console.log('  helper, past thread -> ' + JSON.stringify(h3));
  check('helper: non-want thread keeps its stored label',
    h3 === 'their past', 'got: ' + h3);

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
