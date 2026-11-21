#!/usr/bin/env node
// test-convo-raise-opener-variety-r248-20261121.js — PROOF (journey-scale r248):
// Every link raise opened with the same sentence.
//
// BEFORE (wild evidence — journey-scale r247, 11/11 raise talks; r248
// pilot, 6/6 offered raise talks): the opener was always
// "I've heard good things about {V}. We should link with them — we'd be
// stronger together." The accept reply got per-`how` pools in r243
// (linkAcceptLine), but the opener never did: linkRaiseLine returned ONE
// fixed line per `how`, and in the scale leg `how` is (almost) always
// rumor/told (villagers learn of other villages by rumor, never by
// visiting), so the rumor line was the only opener anyone ever heard.
//
// AFTER (the fix, src/js/bond-initiation.js linkRaiseLine): per-`how`
// pools — pool[0] is the pre-r248 line verbatim, so no existing wording
// changes — with the first-unledgered pick + R148-style rotation
// (linkAcceptLine precedent, LINK_RAISE_ROTATION store per `how`).
// Every new variant keeps the "We should link with them — we'd be
// stronger together." tail the analyzer's RAISE_LINE classifier reads —
// except the pre-existing default pool[0], which never matched it and is
// left verbatim (see Part C note).
//
// FIXTURE NOTES: one fresh game per part (r247 pattern — a stated line in
// one part must not run-ledger-block the next). Each part runs a 5-day
// competent smoke run first: the build_standing drive only exists once
// goals are assigned in play (0 knowers at setup on every probed seed;
// 1 knower on seed 7 at day 5, 2 on seed 42). Staging needs a knower
// with build_standing >= 1, village trust >= 20, lore for the village,
// and no pending raise (bond-test pattern). Between stagings the pending
// raise is DECLINED (consumes it, no proposeLink side effect); the
// 14-day cooldown is per villager+village, so each staging uses a fresh
// pair. Seeds: 7 (Part A), 42 (Parts B+C).
// Exit 0 = green, 1 = failure.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

// The analyzer's spoken-raise classifier (analyze-journey-scale-r248):
// a THEM line counts as the raise spoken iff it matches this.
const RAISE_LINE = /We should link with .* — we'd be stronger together\./;
const RUMOR_POOL = [
  '"I\'ve heard good things about {V}. We should link with them — we\'d be stronger together."',
  '"Word is {V} holds together. We should link with them — we\'d be stronger together."',
  '"They speak well of {V} wherever I\'ve asked. We should link with them — we\'d be stronger together."',
];
const VISIT_POOL = [
  '"I\'ve been to {V}. I know their fires. We should link with them — we\'d be stronger together."',
  '"I\'ve sat by {V}\'s fires myself. We should link with them — we\'d be stronger together."',
];
const SEEN_POOL = [
  '"I\'ve seen {V}\'s fires from the road. We should link with them — we\'d be stronger together."',
  '"I\'ve watched {V}\'s fires from the road — they\'re holding. We should link with them — we\'d be stronger together."',
];
const DEFAULT_POOL = [
  '"We should link with {V}. I know them. We\'d be stronger together."',
  '"I know {V} — good people. We should link with them — we\'d be stronger together."',
];

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails++;
}
function withVillage(line, vname) { return line.replace('{V}', vname); }
// Normalize a staged line by blanking the village name: the defect is
// the opener TEXT repeating, and the village name differs on every
// staging by construction — comparing full lines would "vary" even on
// unfixed code. Distinctness is judged on the normalized template.
function normLine(line, vname) { return line.split(vname).join('{V}'); }

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-raise-opener-r248', fullTelemetry: false });
  await setupGame(Game);
  await quietLog(async function () { await runDays(Game, competent, { days: 5, manifest: undefined, sampleEvery: 30 }); });
  return Game;
}
function findKnower(Game, exclude) {
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) { return id !== Game.villagerId && !(exclude || {})[id]; });
  for (const id of roster) {
    try {
      if (((Game.state.village.sick || {})[id])) continue;
      if (Game.pendingLinkRaise && Game.pendingLinkRaise(id)) continue;
      const treq = ((Game.state.village.talkRequests || {})[id]);
      if (treq && !treq.delivered) continue;
      const w = Game.vgoalWeights ? Game.vgoalWeights(id) : null;
      if (w && (w.build_standing || 0) >= 1) return id;
    } catch (e) {}
  }
  return null;
}
function vnameOf(Game, villageId) {
  const ovs = (Game.state || {}).otherVillages || [];
  for (const o of ovs) if (o && o.id === villageId) return o.name || o.id;
  return villageId;
}
// Stage one raise for (knower, villageId, how) and return the opener line,
// declining the pending raise afterwards so the next staging is clean.
// Returns null if the stage was refused (caller asserts).
function stageOnce(Game, knower, villageId, how) {
  try { Game.state.village.trust = Game.state.village.trust || {}; Game.state.village.trust[knower] = 25; } catch (e) {}
  if (how === null) {
    // Default pool: lore with NO how. recordVillageLore requires a how,
    // so the entry is written as scene state directly (state.village.
    // villageLore[knower][village] — the storage villageLoreOf reads).
    // Live play never produces a how-less entry (every record carries
    // one), so this branch is a fail-safe, not a live path.
    try {
      const vil = Game.state.village;
      vil.villageLore = vil.villageLore || {};
      vil.villageLore[knower] = vil.villageLore[knower] || {};
      vil.villageLore[knower][villageId] = { day: 0 };
    } catch (e) {}
  } else {
    // Clear any smoke-run lore for this pair first (scene setup): the
    // test stages a raise OF THIS how, and recordVillageLore refuses to
    // overwrite a higher-rank how (e.g. a 'visit' entry blocks 'rumor').
    try {
      const vil0 = Game.state.village;
      if (vil0.villageLore && vil0.villageLore[knower]) delete vil0.villageLore[knower][villageId];
    } catch (e) {}
    try { if (Game.recordVillageLore) Game.recordVillageLore(knower, villageId, { how: how }); } catch (e) {}
  }
  const raised = Game.stageLinkRaise(knower, villageId);
  if (!raised || !raised.line) return null;
  const line = raised.line;
  try { Game.declineLinkRaise(knower); } catch (e) {}
  return line;
}

(async function main() {
  // --- Part A (seed 7): the rumor defect, fail-before/pass-after. ---
  // Three rumor raises, one knower, three villages. On UNFIXED code all
  // three lines are the single rumor opener (distinct == 1); on fixed
  // code the pool + rotation serve at least two distinct lines.
  {
    const Game = await freshGame(7);
    const ovs = (Game.state || {}).otherVillages || [];
    check('A0 three villages to raise to', ovs.length >= 3, 'ovs=' + ovs.length);
    const knower = findKnower(Game, {});
    check('A0 knower with build_standing >= 1', !!knower, knower || 'none');
    if (ovs.length >= 3 && knower) {
      const lines = [];
      for (let i = 0; i < 3; i++) {
        const line = stageOnce(Game, knower, ovs[i].id, 'rumor');
        check('A1 rumor raise ' + (i + 1) + ' stages', !!line, line || 'refused');
        if (line) lines.push(line);
      }
      const names = ovs.slice(0, 3).map(o => vnameOf(Game, o.id));
      const poolLines = new Set();
      for (let i = 0; i < 3; i++) for (const p of RUMOR_POOL) poolLines.add(withVillage(p, names[i]));
      check('A2 every staged line is a rumor-pool line', lines.every(l => poolLines.has(l)), JSON.stringify(lines));
      const distinct = new Set(lines.map((l, i) => normLine(l, names[i]))).size;
      check('A3 rumor openers vary (>=2 distinct templates in 3 stagings)', distinct >= 2, 'distinct=' + distinct + ' ' + JSON.stringify(lines.map((l, i) => normLine(l, names[i]))));
      check('A4 every staged line matches the analyzer RAISE_LINE', lines.every(l => RAISE_LINE.test(l)), JSON.stringify(lines));
    }
  }

  // --- Part B (seed 42): visit + seen-nearby pools. ---
  // 'visit' lore needs actual travel, so no smoke-run tick can have
  // staged a visit raise in 5 days: the visit rotation store is
  // pristine, and the FIRST staged visit line must be the pre-r248
  // line verbatim (preservation), with the second staging varying.
  {
    const Game = await freshGame(42);
    const ovs = (Game.state || {}).otherVillages || [];
    check('B0 three villages to raise to', ovs.length >= 3, 'ovs=' + ovs.length);
    const k1 = findKnower(Game, {});
    check('B0 first knower', !!k1, k1 || 'none');
    const k2 = k1 ? findKnower(Game, { [k1]: true }) : null;
    check('B0 second knower', !!k2, k2 || 'none');
    if (ovs.length >= 3 && k1 && k2) {
      const v0 = vnameOf(Game, ovs[0].id), v1 = vnameOf(Game, ovs[1].id);
      const visitLines = [stageOnce(Game, k1, ovs[0].id, 'visit'), stageOnce(Game, k1, ovs[1].id, 'visit')];
      check('B1 both visit raises stage', visitLines.every(Boolean), JSON.stringify(visitLines));
      check('B2 first visit line is the pre-r248 line verbatim', visitLines[0] === withVillage(VISIT_POOL[0], v0), visitLines[0] || 'null');
      check('B3 visit openers vary (normalized template)', normLine(visitLines[0], v0) !== normLine(visitLines[1], v1), JSON.stringify(visitLines));
      check('B4 visit lines match RAISE_LINE', visitLines.every(l => l && RAISE_LINE.test(l)), JSON.stringify(visitLines));
      const seenLines = [stageOnce(Game, k2, ovs[0].id, 'seen-nearby'), stageOnce(Game, k2, ovs[1].id, 'seen-nearby')];
      check('B5 both seen-nearby raises stage', seenLines.every(Boolean), JSON.stringify(seenLines));
      check('B6 first seen-nearby line is the pre-r248 line verbatim', seenLines[0] === withVillage(SEEN_POOL[0], v0), seenLines[0] || 'null');
      check('B7 seen-nearby openers vary (normalized template)', normLine(seenLines[0], v0) !== normLine(seenLines[1], v1), JSON.stringify(seenLines));
      check('B8 seen-nearby lines match RAISE_LINE', seenLines.every(l => l && RAISE_LINE.test(l)), JSON.stringify(seenLines));
      // --- Part C (same game, default pool): how-less lore. ---
      // The default branch is a fail-safe: live lore always carries a
      // how (recordVillageLore requires one), so this never fires in
      // live play. The pool still varies, and pool[0] is the pre-r248
      // line verbatim. NOTE: default pool[0] predates the analyzer's
      // RAISE_LINE classifier and does NOT match it (no em-dash tail);
      // it is left verbatim here — a future fix to that line must
      // update this test deliberately, not silently.
      const dLines = [stageOnce(Game, k2, ovs[2].id, null), stageOnce(Game, k1, ovs[2].id, null)];
      check('C1 both default raises stage', dLines.every(Boolean), JSON.stringify(dLines));
      check('C2 first default line is the pre-r248 line verbatim', dLines[0] === withVillage(DEFAULT_POOL[0], vnameOf(Game, ovs[2].id)), dLines[0] || 'null');
      check('C3 default openers vary (normalized template)', normLine(dLines[0], vnameOf(Game, ovs[2].id)) !== normLine(dLines[1], vnameOf(Game, ovs[2].id)), JSON.stringify(dLines));
      check('C4 second default line matches RAISE_LINE', !!(dLines[1] && RAISE_LINE.test(dLines[1])), dLines[1] || 'null');
    }
  }

  console.log(fails === 0 ? '\nALL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH', e && e.stack || e); process.exit(1); });
