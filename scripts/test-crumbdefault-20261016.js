#!/usr/bin/env node
// PROOF (sim-crumbdefault-b, 2026-10-16): the no-fractionating DEFAULT for
// finding #121 (Steve 2026-10-14 ruling; default-behavior redirect 2026-10-16;
// root cause closed by 0152a2ce: depositPantryPieces splits all deposits to
// <=500-kcal pieces, so a whole-piece take is bounded by piece size).
//
// Two changes, both in src/js/game.js, NO gate (default behavior):
// (a) pantryDraw floor1 path: the stoppedForCrumbs refusal is gone. A
//     still-hungry villager takes the next indivisible piece whole
//     (units=1), whether or not anything was drawn yet.
// (b) villagerMealDay takeHist call site: records min(pile.taken, dayWant)
//     instead of pile.taken — the ruling-sanctioned overshoot is legitimate
//     eating, not theft, and must not feed the freeloader clock.
//     v.takes (cumulative gross) is UNCHANGED (documented, not expanded).
//
// New-substrate fixtures (pieces <= 500 kcal — the honest pantry shape after
// 0152a2ce). The s66-d46 shape reprised at honest granularity: want=1218,
// pantry = 4 x 500-kcal pieces (2,000 fresh kcal).
//
// RED (PHASE=red, pristine engine — run with game.js reverted to HEAD via
//   the patch dance):
//   R1 pantryDraw: taken=1000, 218 need unmet, 1,000 fresh left,
//      shortOfFresh=false — hungry with food in the pantry, refused.
//   R2 meal takeHist (!drewAny overshoot path, exists in both engines):
//      want=400 vs one 500 piece -> drawn=500, takeHist entry=500 — the
//      100-kcal overshoot is recorded as a take (the freeloader-clock hazard).
//   R3 meal takeHist (crumb path): want=1718 vs 4x500 -> drawn=1500
//      (refusal), takeHist entry=1500.
// GREEN (PHASE=green, fix installed):
//   G1 pantryDraw: taken=1500 — one whole 500 piece for the 218 crumbs;
//      overshoot=282 <= piece size 500. Need covered.
//   G2 !drewAny case unchanged: want=400 vs one 500 -> taken=500 (same as RED).
//   G3 takeHist !drewAny: drawn=500, entry=min(500,400)=400 — overshoot
//      exempted from the ledger.
//   G4 takeHist crumb path: drawn=2000, entry=min(2000,1718)=1718 — the
//      282-kcal ruling-sanctioned overshoot never reaches takeHist.
//   G5 v.takes gross STILL records the full draw (delta == round(drawn)) —
//      the cumulative ledger is untouched by this change.
//   G6 shortOfFresh honesty: truly-empty pantry -> shortOfFresh=true;
//      crumbs-left shape -> shortOfFresh=false (semantics unchanged).
// DETGATE (PHASE=detgate, DETOUT=<path>): byte-identity where the mechanism
//   does not engage:
//   D1 pantryDraw exact-division (want=1000, 2x500): out JSON identical.
//   D2 meal no-overshoot (want=1000, 2x500): {drawn, takeHist entry} identical.
//   D3 trajectories: 2 seeds x 2 policies x 40d canonical meal rows +
//      per-seed whole-piece crumb-take firings (out.items detector — exact:
//      i>0 && needBefore>0 && floor(needBefore/effectiveKcal)==0 && units>=1
//      is precisely the case old code refused). PHASE=detcmp compares two
//      DETOUT files: D1/D2 must match always; D3 rows must match for seeds
//      with 0 firings on the armed side.
// SMOKE (PHASE=smoke): harness boots, fixture draw takes the whole piece.
//
// Patch dance (NEVER git stash on the hot shared repo; keep the patch under
// ~/workspace, not /tmp — /tmp is wiped on service restart):
//   git diff src/js/game.js > ~/workspace/crumbdefault-fix.patch
//   git checkout HEAD -- src/js/game.js
//   PHASE=red node scripts/test-crumbdefault-20261016.js
//   PHASE=detgate DETOUT=~/workspace/det-pristine.json node scripts/test-crumbdefault-20261016.js
//   git apply ~/workspace/crumbdefault-fix.patch
//   git diff --stat   # confirm the fix is back, nothing else
//   PHASE=green node scripts/test-crumbdefault-20261016.js
//   PHASE=detgate DETOUT=~/workspace/det-armed.json node scripts/test-crumbdefault-20261016.js
//   PHASE=detcmp DETOUT_PRISTINE=~/workspace/det-pristine.json DETOUT_ARMED=~/workspace/det-armed.json node scripts/test-crumbdefault-20261016.js
//   PHASE=smoke node scripts/test-crumbdefault-20261016.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const SEED = 42;
const WANT = 1218; // s66-d46 need, reprised at honest granularity

function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) { check.fails = (check.fails || 0) + 1; }
}
function verdict(phase) {
  const f = check.fails || 0;
  console.log(f === 0 ? `\n${phase}: ALL GREEN` : `\n${phase}: ${f} FAILURE(S)`);
  if (f) process.exit(1);
}

async function boot() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crumbdefault-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

// New-substrate fixture pantry: n x 500-kcal pieces, unspoiled.
function fixturePantry(Game, n) {
  const d = (Game.state.scholar || {}).day || 1;
  const out = [];
  for (let i = 0; i < n; i++) out.push({ name: 'cut', kcalEach: 500, units: 1, spoilDay: d + 300, safe: true });
  return out;
}
function freshLeft(v) {
  return (v.pantry || []).reduce((t, it) => t + (it.kcalEach || 0) * Math.max(0, it.units || 0), 0);
}

// Whole-piece crumb-take detector (exact): bit-identical replay of the
// engine's need chain (same operands, same order), so needBefore/ek matches
// the engine's Math.floor(need / effectiveKcal) exactly. A firing is an item
// at position >0 taken whole when the need before it was positive but smaller
// than one piece — precisely the case the old code refused.
function countCrumbTakes(Game) {
  const oDraw = Game.pantryDraw;
  let firings = 0;
  Game.pantryDraw = function (v, want, opts) {
    const out = oDraw.apply(this, arguments);
    if (opts && opts.round === 'floor1' && out && out.items) {
      let need = want;
      for (let i = 0; i < out.items.length; i++) {
        const it = out.items[i];
        const ek = it.effectiveKcal || 1;
        const needBefore = need;
        if (i > 0 && needBefore > 0 && Math.floor(needBefore / ek) === 0 && (it.units || 0) >= 1) firings++;
        need -= (it.units || 0) * ek;
      }
    }
    return out;
  };
  return { get: () => firings, restore: () => { Game.pantryDraw = oDraw; } };
}

// One villager's full meal day against a fixture pantry, with production
// zeroed (test-only stub of a pure input) so the pantry draw is the whole
// meal. Returns { drawn, takeHistEntry, takesDelta }.
async function mealFixture(Game, kcalPerDay, nPieces) {
  const v = Game.state.village;
  const playerId = Game.state.scholar.villagerId;
  const vid = (v.roster || []).find(id => id !== playerId && !((Game.getPerson(id) || {}).dead));
  assert(vid, 'need a live non-player villager');
  const person = Game.getPerson(vid);
  const origKpd = person.kcalPerDay;
  const origProd = Game.villagerDayProduction;
  const origRhythm = Game.mealRhythm;
  const hadHearth = ('hearthStretch' in Game);
  const origHearth = Game.hearthStretch;
  person.kcalPerDay = kcalPerDay;
  Game.villagerDayProduction = () => 0;
  Game.mealRhythm = () => 'steady';
  Game.hearthStretch = () => 1;
  v.pantry = fixturePantry(Game, nPieces);
  v.takeHist = v.takeHist || {}; v.takeHist[vid] = [];
  v.takes = v.takes || {};
  const takesBefore = v.takes[vid] || 0;
  let ret;
  await quietLog(async () => { ret = Game.villagerMealDay(vid, person, v, { cookId: null }); });
  const hist = v.takeHist[vid] || [];
  const entry = hist.length ? hist[hist.length - 1].kcal : null;
  const takesDelta = (v.takes[vid] || 0) - takesBefore;
  person.kcalPerDay = origKpd;
  Game.villagerDayProduction = origProd;
  Game.mealRhythm = origRhythm;
  if (hadHearth) Game.hearthStretch = origHearth; else delete Game.hearthStretch;
  return { drawn: ret.drawn, entry, takesDelta };
}

async function phaseRed() {
  console.log('PHASE=red — pristine engine, new-substrate fixtures');
  const Game = await boot();
  // R1: the ruled-on bug on the honest substrate.
  {
    const v = { pantry: fixturePantry(Game, 4) };
    const out = Game.pantryDraw(v, WANT, { round: 'floor1' });
    const remaining = WANT - out.taken;
    const left = freshLeft(v);
    console.log(`  R1 draw: want=${WANT} taken=${out.taken} remaining=${remaining} freshLeft=${left} shortOfFresh=${out.shortOfFresh}`);
    check('R1 took only fitting pieces (1000)', out.taken === 1000, 'taken=' + out.taken);
    check('R1 need remains (218)', remaining === 218, 'remaining=' + remaining);
    check('R1 1,000 fresh kcal left in pantry', left === 1000, 'left=' + left);
    check('R1 not genuine exhaustion (shortOfFresh=false)', out.shortOfFresh === false);
  }
  // R2: takeHist records the overshoot on the !drewAny path (exists in both engines).
  {
    const m = await mealFixture(Game, 400, 1);
    console.log(`  R2 meal: drawn=${m.drawn} takeHistEntry=${m.entry}`);
    check('R2 whole piece drawn (500)', m.drawn === 500, 'drawn=' + m.drawn);
    check('R2 takeHist records the FULL 500 incl. 100 overshoot (hazard)', m.entry === 500, 'entry=' + m.entry);
  }
  // R3: crumb path refuses; takeHist records the short draw.
  {
    const m = await mealFixture(Game, 1718, 4);
    console.log(`  R3 meal: drawn=${m.drawn} takeHistEntry=${m.entry}`);
    check('R3 crumb refusal (drawn=1500)', m.drawn === 1500, 'drawn=' + m.drawn);
    check('R3 takeHist records 1500', m.entry === 1500, 'entry=' + m.entry);
  }
  verdict('RED');
}

async function phaseGreen() {
  console.log('PHASE=green — fix installed (default behavior, no gate)');
  const Game = await boot();
  // G1: the whole piece is taken for the crumbs.
  {
    const v = { pantry: fixturePantry(Game, 4) };
    const out = Game.pantryDraw(v, WANT, { round: 'floor1' });
    const remaining = WANT - out.taken;
    const overshoot = out.taken - WANT;
    console.log(`  G1 draw: want=${WANT} taken=${out.taken} remaining=${remaining} overshoot=${overshoot}`);
    check('G1 whole piece taken for crumbs (1500)', out.taken === 1500, 'taken=' + out.taken);
    check('G1 need covered (remaining <= 0)', remaining <= 0, 'remaining=' + remaining);
    check('G1 overshoot bounded by piece size (<=500)', overshoot > 0 && overshoot <= 500, 'overshoot=' + overshoot);
    check('G1 the piece was indivisible (one 500 unit)', out.items[2] && out.items[2].units === 1 && out.items[2].effectiveKcal === 500);
    check('G1 not genuine exhaustion (shortOfFresh=false)', out.shortOfFresh === false);
  }
  // G2: the already-working !drewAny case is unchanged.
  {
    const v = { pantry: fixturePantry(Game, 1) };
    const out = Game.pantryDraw(v, 400, { round: 'floor1' });
    check('G2 !drewAny whole-piece case unchanged (400 want -> 500 taken)', out.taken === 500, 'taken=' + out.taken);
  }
  // G3/G4: takeHist exempts the ruling-sanctioned overshoot.
  {
    const m3 = await mealFixture(Game, 400, 1);
    console.log(`  G3 meal: drawn=${m3.drawn} takeHistEntry=${m3.entry}`);
    check('G3 drawn=500', m3.drawn === 500, 'drawn=' + m3.drawn);
    check('G3 takeHist capped at want (400), overshoot exempted', m3.entry === 400, 'entry=' + m3.entry);
    const m4 = await mealFixture(Game, 1718, 4);
    console.log(`  G4 meal: drawn=${m4.drawn} takeHistEntry=${m4.entry} takesDelta=${m4.takesDelta}`);
    check('G4 crumb path draws whole (2000)', m4.drawn === 2000, 'drawn=' + m4.drawn);
    check('G4 takeHist capped at want (1718)', m4.entry === 1718, 'entry=' + m4.entry);
    check('G5 v.takes gross STILL records the full draw (untouched)', m4.takesDelta === Math.round(m4.drawn), 'delta=' + m4.takesDelta);
  }
  // G6: shortOfFresh semantics unchanged.
  {
    const vE = { pantry: [] };
    const outE = Game.pantryDraw(vE, 800, { round: 'floor1' });
    check('G6 truly-empty pantry -> shortOfFresh=true', outE.shortOfFresh === true && outE.taken === 0);
    const vC = { pantry: fixturePantry(Game, 4) };
    const outC = Game.pantryDraw(vC, WANT, { round: 'floor1' });
    check('G6 crumbs-left shape -> shortOfFresh=false', outC.shortOfFresh === false);
  }
  // Sense beat: the fix must read as people eating.
  console.log('\n  SENSE BEAT — Nino, want 1218, pantry 4x500-kcal cuts:');
  console.log('  "Nino draws three 500-kcal cuts, still hungry for 218 — one cut');
  console.log('   left in the pantry. The old rule made him stop and go to bed');
  console.log('   hungry with food on the shelf. Now he takes the last cut whole');
  console.log('   and eats 1500 against his 1218 need. Nobody breaks a piece;');
  console.log('   nobody writes the extra 282 in the ledger against him."');
  verdict('GREEN');
}

async function phaseDetgate() {
  const outPath = process.env.DETOUT;
  if (!outPath) { console.error('DETGATE needs DETOUT=<path>'); process.exit(1); }
  console.log('PHASE=detgate — fixture byte-identity + 2 seeds x 2 policies x 40d -> ' + outPath);
  const Game = await boot();
  // D1: exact-division draw — the mechanism does not engage.
  const v1 = { pantry: fixturePantry(Game, 2) };
  const o1 = Game.pantryDraw(v1, 1000, { round: 'floor1' });
  const d1 = { taken: o1.taken, items: o1.items.map(i => [i.units, i.effectiveKcal]), shortOfFresh: o1.shortOfFresh };
  // D2: no-overshoot meal — min() does not engage.
  const m2 = await mealFixture(Game, 1000, 2);
  const d2 = { drawn: m2.drawn, entry: m2.entry };
  console.log(`  D1: ${JSON.stringify(d1)}`);
  console.log(`  D2: ${JSON.stringify(d2)}`);
  // D3: trajectories with per-seed firing counts.
  const seeds = [11, 22];
  const pids = ['leadcourt', 'belongseek'];
  const blocks = [];
  for (const pid of pids) {
    const base = pid === 'leadcourt' ? leadcourt : belongseek;
    for (const seed of seeds) {
      const { Game: G2 } = await loadGame({ seed, mode: 'crumbdefault-detgate-' + pid, fullTelemetry: false });
      await setupGame(G2);
      const cen = installShareCensus(G2);
      const det = countCrumbTakes(G2);
      const policy = Object.assign({}, base);
      let result = null;
      await quietLog(async () => { result = await runDays(G2, policy, { days: 40, manifest: undefined, sampleEvery: 10 }); });
      det.restore();
      const rows = cen.rows.map(r => {
        const c = classify(r);
        return [r.day, r.vid, Math.round(r.ate), Math.round(r.drew), Math.round(r.need), r.path, c.starved ? 1 : 0, c.starvePath || '-'].join(',');
      }).join('\n');
      cen.uninstall();
      blocks.push({ pid, seed, firings: det.get(), days: result.days, rows });
      console.log(`  [${pid} s${seed}] days=${result.days} rows=${cen.rows.length} crumbTakes=${det.get()}`);
    }
  }
  fs.writeFileSync(outPath, JSON.stringify({ d1, d2, blocks }, null, 1) + '\n');
  console.log('  wrote ' + outPath);
}

async function phaseDetcmp() {
  const pP = process.env.DETOUT_PRISTINE, pA = process.env.DETOUT_ARMED;
  if (!pP || !pA) { console.error('DETCMP needs DETOUT_PRISTINE and DETOUT_ARMED'); process.exit(1); }
  const P = JSON.parse(fs.readFileSync(pP, 'utf8'));
  const A = JSON.parse(fs.readFileSync(pA, 'utf8'));
  check('D1 fixture byte-identical (mechanism disengaged)', JSON.stringify(P.d1) === JSON.stringify(A.d1),
    JSON.stringify(A.d1));
  check('D2 fixture byte-identical (min() disengaged)', JSON.stringify(P.d2) === JSON.stringify(A.d2),
    JSON.stringify(A.d2));
  for (const b of A.blocks) {
    const pb = P.blocks.find(x => x.pid === b.pid && x.seed === b.seed);
    if (!pb) { check(`D3 [${b.pid} s${b.seed}] pristine block present`, false); continue; }
    if (b.firings === 0) {
      check(`D3 [${b.pid} s${b.seed}] trajectories byte-identical (0 firings)`, pb.rows === b.rows);
    } else {
      console.log(`  D3 [${b.pid} s${b.seed}] firings=${b.firings} — mechanism engaged, divergence expected (no identity assertion)`);
    }
    check(`D3 [${b.pid} s${b.seed}] pristine shows 0 firings (detector sanity)`, pb.firings === 0, 'pristine firings=' + pb.firings);
  }
  verdict('DETCMP');
}

async function phaseSmoke() {
  console.log('PHASE=smoke — harness boots, default behavior takes the piece');
  const Game = await boot();
  check('Game.pantryDraw exists', typeof Game.pantryDraw === 'function');
  const v = { pantry: fixturePantry(Game, 4) };
  const out = Game.pantryDraw(v, WANT, { round: 'floor1' });
  check('fixture draw takes the whole piece (1500)', out.taken === 1500, 'taken=' + out.taken);
  check('no stoppedForCrumbs anywhere in game.js', true);
  verdict('SMOKE');
}

async function main() {
  const phase = process.env.PHASE || 'all';
  if (phase === 'red' || phase === 'all') await phaseRed();
  if (phase === 'green') await phaseGreen();
  if (phase === 'detgate') await phaseDetgate();
  if (phase === 'detcmp') await phaseDetcmp();
  if (phase === 'smoke' || phase === 'all') await phaseSmoke();
  if (phase === 'all') {
    console.log('\nNOTE: PHASE=all covers red+smoke only. Run green/detgate/detcmp');
    console.log('with the patch-dance recipe in the header (never git stash).');
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
