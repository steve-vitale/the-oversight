#!/usr/bin/env node
// test-trustdelta-20261015.js — proof test for the TRUST-DELTA-BY-SOURCE
// diagnostic instrument (ARM 3, loop B, 2026-10-15, sim-findings #265).
// INSTRUMENT ONLY — no game-code changes. The instrument is
// scripts/trustdelta-lib-20261015.js.
//
// PART A (fixture): forced pantry donation → exactly the donation ticks
//   attribute to 'donations' (the direct write via donateToPantry's stack
//   frame, plus the observe('donate') witness drift), each exactly once.
// PART B (fixture): forced talk events (resolveConsequence with named
//   specs) attribute to 'talk' with the right rc:name detail; forced
//   amends attribute to 'amends'; forced comfort attribute to 'aid'.
// PART C (fixture): gossip/rumor — CANON: Trust ≠ reputation. Forced
//   spreadRumor + spreadGossip + rumor processing must produce ZERO trust
//   ticks and zero gossipViolations.
// PART D (live honesty): s11 60d with the instrument vs pristine — per-day
//   state hashes must be BYTE-IDENTICAL (the r27 instrument-honesty
//   pattern). The instrument never consumes Math.random.
// PART E (SMOKE): 15d competent run — policy.daily fires ≥10× and ≥1 trust
//   tick is observed, else the instrument is measuring nothing.
//
// Usage: node scripts/test-trustdelta-20261015.js
//        SMOKE=1 node scripts/test-trustdelta-20261015.js   # PART E only
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { checkDeterminism } = require('./det-gate');
const { installTrustDelta } = require('./trustdelta-lib-20261015');
const { competent } = require('./policies/competent');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.error('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function rosterVid(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).find(id => id !== Game.villagerId);
}

async function partA() {
  console.log('PART A — forced pantry donation attribution');
  const { Game } = await loadGame({ seed: 11, mode: 'trustdelta-fixture', fullTelemetry: false });
  await setupGame(Game);
  const track = installTrustDelta(Game);
  const vid = rosterVid(Game);
  // a real food item the scholar can donate (pantry cap wrapper rejects
  // donations into a full pantry — clear it so the gift lands)
  Game.state.village.pantry = [];
  Game.state.scholar.inventory.push({ id: 'smoked-meat', name: 'smoked meat', kcalEach: 500, units: 4, edible: true });
  const idx = Game.state.scholar.inventory.length - 1;
  const t0 = track.ticks.length;
  const panKcal = () => (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const panBefore = panKcal(), invBefore = Game.state.scholar.inventory.length;
  Game.donateToPantry(idx); // NB: donateToPantry returns null on success by design
  const newTicks = track.ticks.slice(t0);
  check('donateToPantry moved food to pantry', panKcal() > panBefore && Game.state.scholar.inventory.length < invBefore,
    `pantry ${panBefore}->${panKcal()}`);
  check('ticks recorded', newTicks.length >= 1, 'n=' + newTicks.length);
  const donTicks = newTicks.filter(t => t.source === 'donations');
  check('donation tick attributed to donations', donTicks.length >= 1,
    JSON.stringify(newTicks.map(t => t.source + ':' + t.detail)));
  // exactly once per distinct detail
  const donDetails = donTicks.map(t => t.detail);
  check('donation details distinct', new Set(donDetails).size === donDetails.length,
    JSON.stringify(donDetails));
  check('donation tick applied > 0', donTicks.some(t => t.applied > 0),
    JSON.stringify(donTicks.map(t => t.applied)));
}

async function partB() {
  console.log('PART B — named talk/amends/comfort attribution');
  const { Game } = await loadGame({ seed: 22, mode: 'trustdelta-fixture', fullTelemetry: false });
  await setupGame(Game);
  const track = installTrustDelta(Game);
  const vid = rosterVid(Game);
  const t0 = track.ticks.length;
  Game.resolveConsequence(vid, { trust: 4, temper: 'kind', name: 'dlg:details' });
  Game.resolveConsequence(vid, { trust: 4, temper: 'kind', name: 'makeAmends' });
  Game.resolveConsequence(vid, { trust: 8, temper: 'kind', name: 'comfort' });
  const newTicks = track.ticks.slice(t0).filter(t => t.applied !== 0);
  const talk = newTicks.filter(t => t.source === 'talk' && /dlg:details/.test(t.detail));
  const amends = newTicks.filter(t => t.source === 'amends' && /makeAmends/.test(t.detail));
  const aid = newTicks.filter(t => t.source === 'aid' && /comfort/.test(t.detail));
  check('dlg:details → talk', talk.length === 1, JSON.stringify(newTicks.map(t => t.source + ':' + t.detail)));
  check('makeAmends → amends', amends.length === 1, 'n=' + amends.length);
  check('comfort → aid', aid.length === 1, 'n=' + aid.length);
}

async function partC() {
  console.log('PART C — gossip/rumor moves REP only, never trust (CANON)');
  const { Game } = await loadGame({ seed: 33, mode: 'trustdelta-fixture', fullTelemetry: false });
  await setupGame(Game);
  const track = installTrustDelta(Game);
  const v = Game.state.village || {};
  const vid = rosterVid(Game);
  const other = (v.roster || []).find(id => id !== Game.villagerId && id !== vid);
  const t0 = track.ticks.length;
  Game.spreadRumor(vid, 'untrustworthy', other);
  Game.spreadGossip();
  // process the gossip queue a few times (rumor hops)
  try { Game.spreadGossip(); Game.spreadGossip(); } catch (e) {}
  const newTicks = track.ticks.slice(t0);
  check('zero trust ticks from rumor machinery', newTicks.length === 0,
    JSON.stringify(newTicks.slice(0, 5).map(t => t.source + ':' + t.detail + ':' + t.applied)));
  check('zero gossipViolations', track.gossipViolations.length === 0,
    JSON.stringify(track.gossipViolations.slice(0, 3)));
  // and the rumor actually did something to REP (the fixture isn't vacuous)
  let repMoved = false;
  try {
    const r = Game.repOf ? Game.repOf(vid) : null;
    repMoved = !!r && Object.values(r).some(x => Math.abs(x || 0) > 0);
  } catch (e) {}
  check('rumor machinery ran (REP state touched)', repMoved || (Game.state.village.gossip || []).length > 0);
}

async function partD() {
  console.log('PART D — instrument honesty: armed-vs-pristine det-gate (s11, 60d)');
  // Identical seeds; the ONLY difference is installTrustDelta. Hash each
  // day's scholar vitals + full trust map; sequences must be byte-identical.
  async function runHashes(withInstr) {
    const { Game } = await loadGame({ seed: 11, mode: 'trustdelta-h' + (withInstr ? '1' : '0'), fullTelemetry: false });
    await setupGame(Game);
    if (withInstr) installTrustDelta(Game);
    const hs = [];
    const od = Game.endDay ? Game.endDay.bind(Game) : null;
    if (od) {
      Game.endDay = function () {
        const r = od.apply(this, arguments);
        try {
          const s = Game.state.scholar || {}, v = Game.state.village || {};
          const tk = Object.keys(v.trust || {}).sort().map(k => k + '=' + v.trust[k]).join(',');
          hs.push([s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (v.roster || []).length, tk].join('|'));
        } catch (e) { hs.push('ERR'); }
        return r;
      };
    }
    await quietLog(async () => { await runDays(Game, competent, { days: 60 }); });
    return hs;
  }
  const [h0, h1] = [await runHashes(false), await runHashes(true)];
  const same = h0.length === h1.length && h0.every((h, i) => h === h1[i]);
  check('byte-identical armed-vs-pristine (60d)', same,
    same ? h0.length + ' days' : ('pristine=' + h0.length + ' armed=' + h1.length));
}

async function partE() {
  console.log('PART E (SMOKE) — policy drives, instrument measures');
  const { Game } = await loadGame({ seed: 44, mode: 'trustdelta-smoke', fullTelemetry: false });
  await setupGame(Game);
  const track = installTrustDelta(Game);
  let dailyCalls = 0;
  const od = competent.daily;
  const policy = Object.assign({}, competent);
  policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: 15 }); });
  check('policy.daily fires >= 10x', dailyCalls >= 10, 'calls=' + dailyCalls);
  check('>= 1 trust tick observed', track.ticks.length >= 1, 'ticks=' + track.ticks.length);
  check('no instrument errors', track.instrErrors.length === 0, JSON.stringify(track.instrErrors.slice(0, 3)));
}

async function main() {
  const smokeOnly = process.env.SMOKE === '1';
  try {
    if (!smokeOnly) {
      await partA();
      await partB();
      await partC();
    }
    await partE();
    if (!smokeOnly) await partD();
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main();
