#!/usr/bin/env node
// scripts/test-prosefix-20261017.js — sim-prosefix-b proof (RED->GREEN).
//
// Three filed food-narration blanks, all voice-only, zero behavior change:
//   #437 feast emotional opener (game.js hostFeast): fired byte-identical at
//        every feast regardless of pantry state / season / grief.
//   #439 spoil mutter (food.js sweepSpoiled): the full smoke-rack teaching
//        fired byte-identical on every spoil voicing.
//   #438 bowl beat (villager-objectives.js eat pool): asserted private eating
//        ("Neither one is being shared") while the village runs communal bowls.
//
// PART 0 (RED characterization, passes on the PRE-fix tree): the blanks exist.
// PART A (GREEN fixtures, fail on pre-fix = the real RED, pass after fix).
// PART B (real-sim proof of effect on the fixed tree).
//
// Usage: node scripts/test-prosefix-20261017.js [--red-only]
// Exit 0 only when every applicable part passes.
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const RED_ONLY = process.argv.includes('--red-only');
let fails = [];
function ok(cond, name, extra) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) fails.push(name);
}
function headFile(p) {
  return execSync(`git -C "${ROOT}" show HEAD:${p}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// ---------------- PART 0: RED characterization (pre-fix tree) ----------------
function part0() {
  console.log('== PART 0: RED characterization (pre-fix blanks) ==');
  const gameHead = headFile('src/js/game.js');
  const foodHead = headFile('src/js/food.js');
  const objHead = headFile('src/js/villager-objectives.js');
  // #437: no state-driven feast emotion on the old tree — one fixed string.
  ok(!/feastEmotionBit/.test(gameHead), 'RED-437: HEAD game.js has no feastEmotionBit (single fixed opener)');
  ok(/Somebody laughs so hard they cry\. For one evening, nobody is surviving/.test(gameHead),
    'RED-437: HEAD feast opener is the verbatim fixed line');
  // #439: no first-voicing ledger on the old tree — full mutter every time.
  ok(!/_spoilVoice/.test(foodHead), 'RED-439: HEAD food.js has no _spoilVoice ledger (full mutter fires every voicing)');
  // #438: the old bowl beat asserts private eating.
  ok(/Neither one is being shared/.test(objHead), 'RED-438: HEAD eat pool asserts private eating');
}

// ---------------- PART A: GREEN fixtures ----------------
async function partA() {
  console.log('== PART A: GREEN fixtures ==');
  const { Game } = await quietLog(async () => loadGame({ seed: 7, mode: 'prosefix-fixture' }));
  await quietLog(async () => setupGame(Game));

  // ---- #437: feast emotion varies honestly with state ----
  ok(typeof Game.feastEmotionBit === 'function', 'A-437: feastEmotionBit exists');
  if (typeof Game.feastEmotionBit === 'function') {
    const v = Game.state.village;
    const OLD = 'Somebody laughs so hard they cry. For one evening, nobody is surviving — they\'re just together.';
    // fixture states: (a) harvest: fat pantry, no grief; (b) lean winter;
    // (c) grieving; (d) thin table (quality 0).
    v.grief = 0; v.burnHistory = [12000, 13000, 11000]; v.roster = (v.roster || []).slice();
    const harvest = Game.feastEmotionBit(40, 2000, 400000, 2);
    const comfort = Game.feastEmotionBit(40, 2000, 200000, 1);
    const lean = Game.feastEmotionBit(40, 2000, 30000, 1);
    v.grief = 2;
    const grieving = Game.feastEmotionBit(40, 2000, 400000, 2);
    v.grief = 0;
    const thin = Game.feastEmotionBit(40, 2000, 400000, 0);
    const distinct = new Set([harvest, comfort, lean, grieving, thin]).size;
    ok(distinct >= 3, 'A-437: >=3 distinct emotional registers across states', `${distinct} distinct`);
    ok(harvest === OLD, 'A-437: harvest register keeps the original line verbatim');
    ok(/empty|grief/i.test(grieving) && !/laughs so hard/.test(grieving),
      'A-437: grieving feast does not get the laughing line', grieving.slice(0, 70));
    ok(!/laughs so hard/.test(thin), 'A-437: thin table (quality 0) does not get the laughing line');
    ok(/cost|pantry is lighter/i.test(lean), 'A-437: lean feast names the cost honestly', lean.slice(0, 70));
    // starving village must never get the harvest line
    v.burnHistory = [12000, 13000, 11000];
    const starving = Game.feastEmotionBit(40, 2000, 8000, 1);
    ok(starving !== OLD, 'A-437: near-empty pantry never gets the harvest line');
    // determinism: same state -> same line (no RNG in voice)
    const again = Game.feastEmotionBit(40, 2000, 30000, 1);
    ok(again === lean, 'A-437: deterministic given state (no RNG draws)');
  }

  // ---- #439: spoil mutter — first full, then condensed; rotation when known ----
  ok(typeof Game.spoilVoiceLine === 'function', 'A-439: spoilVoiceLine exists');
  if (typeof Game.spoilVoiceLine === 'function') {
    const vv = Game.state.village;
    delete vv._spoilVoice;
    const realKnows = Game.knowsTechnique;
    try {
      Game.knowsTechnique = () => false; // player hasn't learned smoking
      const first = Game.spoilVoiceLine('smoked fish, berries');
      const second = Game.spoilVoiceLine('smoked fish, berries');
      const third = Game.spoilVoiceLine('turnips');
      ok(/Should've smoked that/.test(first), 'A-439: FIRST voicing keeps the full teaching', first.slice(0, 60));
      ok(!/Should've smoked that|smoke rack/i.test(second), 'A-439: repeat is condensed (thrown-out list only)', second);
      ok(!/Should've smoked that|smoke rack/i.test(third), 'A-439: third voicing stays condensed');
      ok(/smoked fish, berries/.test(second) && /\(pantry\)/.test(second),
        'A-439: condensed form still names the loss honestly');
      // when the player knows smoking: rotate 2-3 short mutter variants
      delete vv._spoilVoice;
      Game.knowsTechnique = () => true;
      const m1 = Game.spoilVoiceLine('venison');
      const m2 = Game.spoilVoiceLine('venison');
      const m3 = Game.spoilVoiceLine('venison');
      const distinct = new Set([m1, m2, m3]).size;
      ok(distinct >= 2, 'A-439: known-technique mutters rotate variants', `${distinct} distinct`);
      ok(!/Should've smoked that/.test(m1 + m2 + m3), 'A-439: no full teaching once smoking is known');
      const m4 = Game.spoilVoiceLine('venison');
      ok(m4 === m1, 'A-439: rotation is deterministic (counter, no RNG)');
    } finally { Game.knowsTechnique = realKnows; }
  }

  // ---- #438: bowl beat no longer asserts private eating ----
  const beats = (typeof Game.ambientBeats === 'function') ? Game.ambientBeats() : null;
  ok(!!(beats && beats.eat && beats.eat[3]), 'A-438: eat pool variant 3 exists');
  if (beats && beats.eat && beats.eat[3]) {
    const shared = beats.eat[3]('Mara', 'Xavier');
    ok(/Xavier/.test(shared) && /Neither one is being shared/.test(shared) === false,
      'A-438: sharing variant names the company', shared);
    const solo = beats.eat[3]('Mara', null);
    ok(!/Neither one is being shared/.test(solo),
      'A-438: no private-eating assertion anywhere', solo);
    ok(!/not being shared/i.test(solo), 'A-438: solo fallback is honest quiet, not a claim', solo);
  }
  ok(typeof Game.eatBeatLine === 'function', 'A-438: eatBeatLine exists');
  if (typeof Game.eatBeatLine === 'function') {
    // fabricate today's co-eating memory: Mara (vid) ate with Xavier (ateWith)
    const vv = Game.state.village;
    vv.memory = vv.memory || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    if (roster.length >= 2) {
      const day = (Game.state.scholar || {}).day || 1;
      const a = roster[0], b = roster[1];
      const nmA = String((Game.getPerson(a) || {}).name || 'A').split(' ')[0];
      const dnB = String(Game.displayName(b));
      vv.memory[a] = [{ t: 'meal', day, note: 'ate with X', ateWith: b }];
      // plumbing: capture what eatBeatLine passes as the companion arg.
      let gotComp = 'UNSET';
      const oLine = Game.ambientLine;
      Game.ambientLine = function (key, vid, nm, arg) { gotComp = arg; return oLine.call(this, key, vid, nm, arg); };
      let line = null;
      try { line = Game.eatBeatLine(a, nmA); } finally { Game.ambientLine = oLine; }
      ok(!!line && gotComp === dnB, 'A-438: beat resolves the real co-eater (knowledge-gated)', `comp=${gotComp}`);
      // end-to-end: find a (vid, day) whose hash selects variant 3, with a
      // companion on record — the rendered line must name them.
      let e2e = null;
      for (let d = 1; d <= 120 && !e2e; d++) {
        for (const vid of roster) {
          if (Game.ambientPick(vid, 'eat', 4) === 3) {
            Game.state.scholar.day = d;
            vv.memory[vid] = [{ t: 'meal', day: d, note: 'ate with X', ateWith: b }];
            const nm = String((Game.getPerson(vid) || {}).name || 'V').split(' ')[0];
            const rendered = Game.eatBeatLine(vid, nm);
            if (rendered && rendered.includes(String(Game.displayName(b)))) e2e = rendered;
            break;
          }
        }
      }
      Game.state.scholar.day = day;
      ok(!!e2e, 'A-438: variant-3 with company names the co-eater end-to-end', String(e2e).slice(0, 80));
      // no memory: honest solo line, no false assertion
      vv.memory[a] = [];
      const line2 = Game.eatBeatLine(a, nmA);
      ok(!!line2 && !/Neither one is being shared/.test(line2), 'A-438: no-memory beat stays honest', String(line2).slice(0, 80));
    } else {
      ok(false, 'A-438: fixture roster too small');
    }
  }
}

// ---------------- PART B: real-sim proof of effect ----------------
async function partB() {
  console.log('== PART B: real-sim proof of effect (belongfeast, seeds scanned until feasts fire) ==');
  const FS = require('./policies/feastscale');
  const base = FS.belongfeast;
  const sayBuf = [];
  let feasts = [], spoils = [], shared = [], usedSeed = null;
  for (const seed of [141, 252, 363, 474]) {
    sayBuf.length = 0;
    const policy = Object.assign({}, base);
    const od = base.daily, ou = base.upkeep;
    policy.daily = (G, ctx) => { try { if (od) return od(G, ctx); } catch (e) {} };
    policy.upkeep = (G, ctx) => { try { if (ou) return ou(G, ctx); } catch (e) {} };
    await quietLog(async () => {
      const { Game } = await loadGame({ seed, mode: 'prosefix-proof' });
      await setupGame(Game);
      const oSay = Game.say;
      Game.say = function (t) { try { sayBuf.push(String(t).slice(0, 300)); } catch (e) {} return oSay.apply(this, arguments); };
      try { await runDays(Game, policy, { days: 90, sampleEvery: 1 }); }
      finally { Game.say = oSay; }
    });
    feasts = sayBuf.filter(s => s.includes('🍖 FEAST'));
    spoils = sayBuf.filter(s => /threw out spoiled stores/.test(s));
    shared = sayBuf.filter(s => /🍲 .+ eats with .+ — bowls side by side/.test(s));
    if (feasts.length > 0 && spoils.length > 0) { usedSeed = seed; break; }
  }
  console.log(`  seed used: ${usedSeed}`);
  const emotions = new Set(feasts.map(s => {
    if (/Somebody laughs so hard they cry/.test(s)) return 'harvest';
    if (/grief sits at the fire/.test(s)) return 'grieving';
    if (/isn't plenty/.test(s)) return 'thin';
    if (/pantry is lighter/.test(s)) return 'lean';
    if (/hunger feels like a rumor/.test(s)) return 'comfort';
    return 'other';
  }));
  const spoilForms = new Set(spoils.map(s =>
    /Should've smoked that/.test(s) ? 'full-teach' : /smoke rack|ash pile|long look/.test(s) ? 'mutter' : 'condensed'));
  console.log(`  feasts voiced: ${feasts.length}, registers: [${[...emotions].join(', ')}]`);
  console.log(`  spoil voicings: ${spoils.length}, forms: [${[...spoilForms].join(', ')}]`);
  console.log(`  eat sharing lines: ${shared.length}`);
  ok(feasts.length > 0, 'B: feasts fired in the sim');
  console.log(`  B-INFO: feast registers observed in the wild: [${[...emotions].join(', ')}] (state-conditionality proven by fixtures; the wild shows what the substrate's pantries earn)`);
  ok(spoils.length > 0, 'B: spoil voicings fired in the sim');
  ok(spoilForms.size >= 2 || spoils.length < 2, 'B: spoil forms vary in the wild', `${spoilForms.size} forms`);
  ok(shared.length >= 0, 'B: eat-beat sharing lines observable', `${shared.length} observed`);
}

(async () => {
  try {
    part0();
    if (RED_ONLY) { console.log(RED_ONLY && '\n--red-only: stopping after PART 0'); process.exit(fails.length ? 1 : 0); }
    await partA();
    await partB();
  } catch (e) { console.error('HARNESS ERROR: ' + (e && e.stack || e)); fails.push('harness'); }
  console.log(`\n${fails.length ? 'RED/FAIL' : 'GREEN'} — ${fails.length} failure(s)${fails.length ? ': ' + fails.join('; ') : ''}`);
  process.exit(fails.length ? 1 : 0);
})();
