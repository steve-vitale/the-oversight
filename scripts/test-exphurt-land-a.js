'use strict';
// test-exphurt-land-a.js — proof for sim-exphurt-land-a
// (oversight-flesh-out-loop, run fleshout-20261104T1933Z, axis
// food-economy). Must be green BEFORE the judged re-run.
// Two parts: (A) pure — seed-band refusal, fixed-capture proof on
// the real 24-a corpus, LAND judgment branches, static hook proof;
// (B) harness — direct Game.expeditionReturn calls proving the live
// hook: hurt clause + word "hurt" at hp 1..7, absent + template
// byte-identical when healthy, encounters-hurt-but-healed reads
// healthy, player-away stays silent. No game code, no RNG in part
// A; part B seeds Math.random BEFORE eval (modules capture it at
// load) and evals the FULL src/js list in index.html order (minus
// DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js),
// per the task's harness rule. Never stubs Game.save.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
// The sweep module enforces its shipped-default env gates at load;
// give it exactly the pre-registered band so the require succeeds.
// Requiring it runs no sim (main guarded).
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
process.env.DAYS = '100';
process.env.SEEDS = [...Array(24)].map((_, i) => 99933 + i).join(',');
const sweep = require('./sweep-exphurt-land-a');
const land = require('./exphurt-land-a-lib');

let n = 0;
const eq = (a, b, msg) => { n++; assert.deepStrictEqual(a, b, msg); };
const ok = (c, msg) => { n++; assert.ok(c, msg); };

// ---- (A1) BAND: exactly the matched 24-a band, 99933–99956. ----
const BAND = [...Array(24)].map((_, i) => 99933 + i);
eq(sweep.BAND, BAND, 'BAND is exactly 99933-99956');
eq(sweep.BAND.length, 24, 'BAND has 24 seeds');
eq(sweep.DAYS, 100, 'DAYS is exactly 100');
eq(sweep.validateSeeds(BAND), true, 'accepts the exact band');
eq(sweep.validateSeeds([99917, 99918, 99919, 99920, 99921, 99922, 99923, 99924]), false, 'refuses confirm HALF1');
eq(sweep.validateSeeds([99925, 99926, 99927, 99928, 99929, 99930, 99931, 99932]), false, 'refuses confirm HALF2');
eq(sweep.validateSeeds([99901, 99902, 99903, 99904, 99905, 99906, 99907, 99908]), false, 'refuses prior pilot band');
eq(sweep.validateSeeds(BAND.slice(0, 23)), false, 'refuses a 23-seed prefix');
eq(sweep.validateSeeds([...BAND, 99957]), false, 'refuses band plus one extra seed');
eq(sweep.validateSeeds([]), false, 'refuses empty list');
eq(sweep.validateSeeds(BAND.slice().reverse()), false, 'refuses reversed band (order matters)');

// ---- (A2) CAPTURE PROOF on the real 24-a corpus. ----
const DIR24 = path.join(ROOT, 'evidence', '2026-11-04', 'perseed-exphurt-24-a');
const files24 = fs.readdirSync(DIR24).filter((f) => /^exphurt-24-a-competent-s\d+\.json$/.test(f)).sort();
eq(files24.length, 24, '24-a corpus has 24 per-seed files');
const s46 = JSON.parse(fs.readFileSync(path.join(DIR24, 'exphurt-24-a-competent-s99946.json'), 'utf8'));
const fixed46 = land.fixedClosingLinesForSeed(s46.cases, s46.transcript);
const billDay4 = fixed46.find((c) => c.name === 'Bill' && c.closeDay === 4 && c.closePart === 2);
ok(billDay4, 'Bill day-4 close case exists in fixed corpus');
eq(billDay4.fixedClosingLines.length, 2, 'Bill day-4-part-2 pair now captured (2 lines, was 0)');
eq(billDay4.fixedClosingLines[0].isHurthome, true, 'pair line 1 is the hurthome line');
eq(billDay4.fixedClosingLines[1].isExpeditionReturn, true, 'pair line 2 is the expeditionReturn line');
ok(billDay4.fixedClosingLines[0].line.indexOf('with a limp returns from the wilds hurt (health 2/100)') !== -1, 'pair line 1 is the descriptive-form hurt line');
ok(billDay4.fixedClosingLines[1].line.indexOf('with a limp is back from far past the west') !== -1, 'pair line 2 is the descriptive-form homecoming line');
eq(billDay4.fixedClosingLines[1].mentionsHurt, false, 'pre-hook homecoming line mentions no hurt (the blank, captured not invented)');
eq(billDay4.fixedClosingAmbiguous, false, 'Bill pair attribution is unambiguous');
// Exactly ONE case changes across the whole 24-a corpus re-judge.
const changed = [];
for (const f of files24) {
  const s = JSON.parse(fs.readFileSync(path.join(DIR24, f), 'utf8'));
  const fixed = land.fixedClosingLinesForSeed(s.cases, s.transcript);
  for (let i = 0; i < fixed.length; i++) {
    if ((s.cases[i].closingLines || []).length !== fixed[i].fixedClosingLines.length) {
      changed.push({ seed: s.seed, name: s.cases[i].name, outcome: s.cases[i].outcome });
    }
    eq(fixed[i].fixedClosingAmbiguous, false, `no ambiguous attribution in ${f}`);
  }
}
eq(changed, [{ seed: 99946, name: 'Bill', outcome: 'returned-hurt' }], 'exactly one case changes in the 24-a re-judge: Bill s99946');
// Non-returned cases never gain closing lines (scan ticks, not returns).
const s39 = JSON.parse(fs.readFileSync(path.join(DIR24, 'exphurt-24-a-competent-s99939.json'), 'utf8'));
for (const fc of land.fixedClosingLinesForSeed(s39.cases, s39.transcript)) {
  if (fc.outcome !== 'returned-hurt' && !(typeof fc.outcome === 'string' && fc.outcome.indexOf('returned') === 0)) {
    eq(fc.fixedClosingLines, [], `non-returned case ${fc.outcome} gets no closing lines`);
  }
}

// ---- (A3) LAND JUDGMENT branches, verbatim from the prereg. ----
const GO = { M1: 0.9, medianDelta: 0, errors: 0, checkQuickGreen: true, diffOnlyLineBlock: true, healthyByteIdentical: true };
eq(land.judgeLand(GO), 'GO', 'all legs pass is GO');
eq(land.judgeLand(Object.assign({}, GO, { M1: 0.80 })), 'GO', 'M1 exactly 0.80 is GO');
eq(land.judgeLand(Object.assign({}, GO, { M1: 0.79 })), 'NO-GO', 'M1 below 0.80 is NO-GO');
eq(land.judgeLand(Object.assign({}, GO, { medianDelta: -5 })), 'GO', 'delta exactly -5 is GO');
eq(land.judgeLand(Object.assign({}, GO, { medianDelta: -6 })), 'NO-GO', 'delta below -5 is NO-GO');
eq(land.judgeLand(Object.assign({}, GO, { checkQuickGreen: false })), 'NO-GO', 'check --quick red is NO-GO');
eq(land.judgeLand(Object.assign({}, GO, { diffOnlyLineBlock: false })), 'NO-GO', 'diff beyond the line block is NO-GO');
eq(land.judgeLand(Object.assign({}, GO, { healthyByteIdentical: false })), 'NO-GO', 'healthy template drift is NO-GO');
eq(land.judgeLand(Object.assign({}, GO, { errors: 1 })), 'INSUFFICIENT-DATA', 'instrument errors are INSUFFICIENT-DATA, never scored');
eq(land.judgeLand(Object.assign({}, GO, { M1: null })), 'INSUFFICIENT-DATA', 'null M1 is never GO');

// ---- (A4) STATIC HOOK PROOF on the live source. ----
const src = fs.readFileSync(path.join(ROOT, 'src', 'js', 'villager-agency.js'), 'utf8');
const fnStart = src.indexOf('expeditionReturn(vid, playerAtHaven) {');
const fnEnd = src.indexOf('// ---------- 3. DEEDS', fnStart);
ok(fnStart !== -1 && fnEnd > fnStart, 'expeditionReturn found in villager-agency.js');
const fn = src.slice(fnStart, fnEnd);
const pickCount = (fn.match(/pick\(dirs\)/g) || []).length;
eq(pickCount, 1, 'pick(dirs) appears exactly once in expeditionReturn');
ok(fn.indexOf("this.say(`🧭 ${nm} is back from ${dist >= 4 ? 'far past' : 'past'} the ${pick(dirs)}${suffix} (Ask them what they saw.)`);") !== -1, 'homecoming say template is the pre-hook template, unchanged');
ok(fn.indexOf("(this.state.village.health || {})[vid]") !== -1, 'predicate reads hp as (this.state.village.health||{})[vid]');
ok(fn.indexOf('hpAtReturn >= 1 && hpAtReturn <= 7') !== -1, 'predicate gate is hp 1..7');
ok(fn.indexOf("bits.push('hurt on the way home')") !== -1, 'hurt clause push present');
const iHaven = fn.indexOf('if (playerAtHaven) {');
const iHp = fn.indexOf('hpAtReturn');
const iSay = fn.indexOf('this.say(`🧭');
ok(iHaven !== -1 && iHaven < iHp && iHp < iSay, 'hurt push sits inside the playerAtHaven block, before the say');
const gateLines = fn.slice(fn.indexOf('var hpAtReturn'), fn.indexOf("bits.push('hurt on the way home')"));
ok(gateLines.indexOf('encounters') === -1, 'predicate does not use encounters-includes-hurt');

// ---- (B) HARNESS: live expeditionReturn calls via sim-harness. ----
// loadGame seeds Math.random BEFORE eval and evals the FULL src/js
// list in index.html order (minus DOM-only app.js/sprites.js/
// tile-scenes.js/move-anim.js/drama.js) — the task's harness rule,
// through the sanctioned loader (a bare manual eval leaves
// Game.state null: init() is what builds the village). narration:
// true keeps Game.say live so the test can capture the line.
const { loadGame, setupGame } = require('./sim-harness');
async function mainB() {
  const { Game } = await loadGame({ seed: 20261104, mode: 'exphurt-land-a-proof', fullTelemetry: false, narration: true });
  await setupGame(Game);
  ok(typeof Game.expeditionReturn === 'function', 'Game.expeditionReturn exists after full eval');

  const v = Game.state.village;
  const ev = (v.roster || []).filter((id) => id !== Game.villagerId)[0];
  ok(ev, 'a non-player roster villager exists for direct calls');
  function returnLine(hp, playerAtHaven, encounters) {
    const ag = Game.agencyState();
    ag.exped[ev] = { dist: 2, finds: [{ kcal: 120 }], encounters: encounters || ['a strange track'] };
    v.health = v.health || {};
    v.health[ev] = hp;
    const said = [];
    const origSay = Game.say;
    Game.say = (t) => { said.push(String(t)); };
    try { Game.expeditionReturn(ev, playerAtHaven); } finally { Game.say = origSay; }
    return said.filter((l) => /is back from (far )?past the/.test(l));
  }
  const HURT_RE = /^🧭 .+ is back from past the (north|south|east|west) \(\+120 kcal for the pantry, 1 story, hurt on the way home\) \(Ask them what they saw\.\)$/;
  const HEALTHY_RE = /^🧭 .+ is back from past the (north|south|east|west) \(\+120 kcal for the pantry, 1 story\) \(Ask them what they saw\.\)$/;
  for (const hp of [1, 7]) {
    const lines = returnLine(hp, true);
    eq(lines.length, 1, `hp ${hp}: exactly one homecoming line`);
    ok(HURT_RE.test(lines[0]), `hp ${hp}: hurt clause present, word "hurt" in line`);
    ok(/hurt/i.test(lines[0]), `hp ${hp}: classifier sees hurt`);
  }
  for (const hp of [0, 8, 50]) {
    const lines = returnLine(hp, true);
    eq(lines.length, 1, `hp ${hp}: exactly one homecoming line`);
    ok(HEALTHY_RE.test(lines[0]), `hp ${hp}: healthy template byte-identical (no clause)`);
    ok(!/hurt/i.test(lines[0]), `hp ${hp}: no hurt word when healthy`);
  }
  {
    // Hurt mid-trip but healed before return: encounters say 'hurt',
    // hp healthy — the predicate is hp, not encounters.
    const lines = returnLine(50, true, ['hurt']);
    eq(lines.length, 1, 'encounters-hurt but healed: exactly one homecoming line');
    ok(HEALTHY_RE.test(lines[0]), 'encounters-hurt but healed reads as healthy (no clause)');
  }
  {
    // Player-away gate unchanged: no homecoming line at all.
    const lines = returnLine(5, false);
    eq(lines.length, 0, 'player-away: no homecoming line (gate unchanged)');
  }
  console.log(`test-exphurt-land-a: ${n}/${n} green`);
}
mainB().catch((e) => { console.error('HARNESS PART FAILED', e); process.exit(1); });
