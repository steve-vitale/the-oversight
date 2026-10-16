#!/usr/bin/env node
// PROOF (sim-crumbguard-b, 2026-10-16): the GUARDED whole-piece take for
// finding #121. Steve's ruling 2026-10-14: the no-fractionating rule STANDS,
// but the floor1 rounding's crumbs break starving villagers with food in the
// pantry is a TUNING BUG — tune the distribution floor so a full piece gets
// taken when a villager is hungry. The literal always-take (CRUMB-FIX) was
// KILLED at confirm this morning: on marginal pantries the whole-piece take
// is the lethal move (s88 autopsy: two 2,813-kcal takes drained a 5,626-kcal
// pantry to 0 in one day -> 4 empty-pantry starvations in the dying tail).
//
// THE LEVER: at the floor1/stoppedForCrumbs break (game.js pantryDraw), a
// hungry villager takes the full piece ONLY IF pantryFreshKcalAfterTake
// stays >= a floor of 2 days' village need, computed from the engine's own
// daily-need accounting (villageDayBurn: 7-day rolling honest-net burn,
// roster x 1000 fallback — the same accounting the league-granary famine
// draw uses). Else the stoppedForCrumbs refusal stands. Gate: CRUMBFLOOR=1
// (measurement default OFF).
//
// The proof artifact is the villager's meal outcome, not assertions alone:
// RED shows the refusal on the old code; the UNGUARDED phase shows the
// killed variant draining the marginal fixture (the s88 mechanism); GREEN
// shows the guard taking on a rich pantry and refusing on a marginal one.
//
// Fixtures:
//   RICH:    s66-d46 shape — want=1218, pantry 500 + 4x2000 (8,500 fresh),
//            burnHistory ~= 2,450/day -> floor 4,900. After a 2000 take the
//            pantry holds 6,500 >= 4,900 -> TAKE.
//   MARGINAL: s88 shape — want=1716, pantry 500 + 2x2813 (6,126 fresh),
//            burnHistory ~= 5,050/day -> floor 10,100. After a 2813 take the
//            pantry holds 2,813 < 10,100 -> REFUSE (stoppedForCrumbs).
//
// Usage (RED-verification uses the patch dance under ~/workspace, NEVER git
// stash on the hot shared repo):
//   git diff src/js/game.js > ~/workspace/crumbguard-fix.patch
//   git checkout HEAD -- src/js/game.js
//   PHASE=red node scripts/test-crumbguard-20261016.js
//   git apply ~/workspace/crumbguard-fix.patch
//   CRUMBFLOOR=1 PHASE=green node scripts/test-crumbguard-20261016.js
//   PHASE=gateoff node scripts/test-crumbguard-20261016.js
//   CRUMBFLOOR=1 PHASE=unguarded node scripts/test-crumbguard-20261016.js
//   PHASE=detgate DETOUT=<path> node scripts/test-crumbguard-20261016.js
//   SMOKE=1 node scripts/test-crumbguard-20261016.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const SEED = 42;
const RICH_WANT = 1218;   // Nino's s66-d46 need
const MARG_WANT = 1716;   // Emilio's s88 need

function spoilDayOf(Game, plus) {
  return (((Game.state.scholar || {}).day) || 1) + plus;
}
// RICH fixture: one 500-kcal piece that fits, then 4 x 2000 (8,000 fresh).
function richPantry(Game) {
  const d = spoilDayOf(Game, 0);
  return [
    { name: 'small cut', kcalEach: 500, units: 1, spoilDay: d + 280, safe: true },
    { name: 'big cut', kcalEach: 2000, units: 4, spoilDay: d + 290, safe: true },
  ];
}
// MARGINAL fixture: s88 shape — 500 + 2 x 2813 (6,126 fresh).
function margPantry(Game) {
  const d = spoilDayOf(Game, 0);
  return [
    { name: 'small cut', kcalEach: 500, units: 1, spoilDay: d + 280, safe: true },
    { name: 'big cut', kcalEach: 2813, units: 2, spoilDay: d + 290, safe: true },
  ];
}
function freshLeft(v) {
  return (v.pantry || []).reduce((t, it) => t + (it.kcalEach || 0) * Math.max(0, it.units || 0), 0);
}

async function boot() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crumbguard-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) { check.fails = (check.fails || 0) + 1; }
}
function verdict(phase) {
  const f = check.fails || 0;
  console.log(f === 0 ? `\n${phase}: ALL GREEN` : `\n${phase}: ${f} FAILURE(S)`);
  if (f) process.exit(1);
}

async function phaseRed() {
  console.log('PHASE=red — pristine engine, the s66-d46 shape');
  const Game = await boot();
  const v = { pantry: richPantry(Game) };
  const out = Game.pantryDraw(v, RICH_WANT, { round: 'floor1' });
  const remaining = RICH_WANT - out.taken;
  const left = freshLeft(v);
  console.log(`  draw: want=${RICH_WANT} taken=${out.taken} remaining=${remaining} freshLeft=${left} shortOfFresh=${out.shortOfFresh}`);
  check('took only the fitting piece (500)', out.taken === 500, 'taken=' + out.taken);
  check('need remains (718 > 0)', remaining === 718, 'remaining=' + remaining);
  check('8,000 fresh kcal still in pantry', left === 8000, 'left=' + left);
  check('not genuine exhaustion (shortOfFresh=false)', out.shortOfFresh === false);
  check('no guard counters on pristine (crumbFloorOn absent)', typeof Game.crumbFloorOn !== 'function' || Game.crumbFloorOn() === false);
  check('pristine crumbs-left starvation FIRES: hungry with 8000 fresh left uneaten',
    out.taken === 500 && remaining > 0 && left === 8000 && out.shortOfFresh === false);
  // Marginal fixture on pristine: refusal too (both refuse; the difference is the guard).
  const vm = { pantry: margPantry(Game) };
  const outm = Game.pantryDraw(vm, MARG_WANT, { round: 'floor1' });
  console.log(`  marginal: want=${MARG_WANT} taken=${outm.taken} freshLeft=${freshLeft(vm)}`);
  check('marginal fixture refused on pristine (500 only)', outm.taken === 500, 'taken=' + outm.taken);
  verdict('RED');
}

// Test-local replication of the KILLED literal CRUMB-FIX rule (always take
// the full piece at the crumb break) — not game.js; demonstrates the s88
// drain mechanism on the marginal fixture: two draws drain 6,126 -> 0.
function unguardedDrain(pantryItems, wants) {
  const items = pantryItems.map(i => ({ ...i }));
  let pantry = items;
  const takes = [];
  for (const want of wants) {
    let need = want, taken = 0, drewAny = false;
    for (const item of pantry) {
      if (need <= 0) break;
      const ek = item.kcalEach;
      let units = Math.floor(need / ek);
      if (units <= 0) {
        if (!drewAny) units = 1;
        else units = 1; // the KILLED literal rule: always take
      }
      units = Math.min(item.units, units);
      if (units <= 0) continue;
      taken += units * ek; item.units -= units; need -= units * ek;
      drewAny = true;
    }
    pantry = items.filter(i => i.units > 0);
    takes.push(taken);
  }
  const left = pantry.reduce((t, i) => t + i.kcalEach * i.units, 0);
  return { takes, left };
}

async function phaseUnguarded() {
  console.log('PHASE=unguarded — the KILLED literal rule on the s88 marginal fixture');
  const { takes, left } = unguardedDrain(margPantry({ state: { scholar: { day: 1 } } }), [MARG_WANT, 1459]);
  console.log(`  two whole-piece takes: ${takes.join(' + ')} kcal; pantry left: ${left}`);
  check('first villager takes a whole 2813 piece (ate 3313 vs 1716 need)', takes[0] === 500 + 2813, 'took=' + takes[0]);
  check('second villager takes the last 2813 (!drewAny path)', takes[1] === 2813, 'took=' + takes[1]);
  check('pantry drained 6,126 -> 0 in one day (the s88 mechanism)', left === 0, 'left=' + left);
  console.log('  This is the drain sim-crumbs-b measured: 5,626 -> 0 in a day,');
  console.log('  then 4 empty-pantry starvations in the dying tail. The guard refuses this.');
  verdict('UNGUARDED');
}

async function phaseGreen() {
  console.log('PHASE=green — guard installed, CRUMBFLOOR=1');
  const Game = await boot();
  check('crumbFloorOn() is true with CRUMBFLOOR=1', Game.crumbFloorOn() === true);
  // villageDayBurn is the engine's own accounting: 7-day rolling honest net.
  const vb = { burnHistory: [5000, 5200, 4900, 5100, 5050], roster: new Array(9).fill(0) };
  check('villageDayBurn averages the 7-day honest net (5050)',
    Game.villageDayBurn(vb) === 5050, 'got=' + Game.villageDayBurn(vb));
  check('villageDayBurn fallback = roster x 1000 when no history',
    Game.villageDayBurn({ roster: new Array(9).fill(0) }) === 9000, 'got=' + Game.villageDayBurn({ roster: new Array(9).fill(0) }));

  // RICH: pantry stays 6,500 >= floor 4,900 after a 2000 take -> TAKE.
  const v = { pantry: richPantry(Game), burnHistory: [2400, 2500, 2300, 2600, 2450] };
  const out = Game.pantryDraw(v, RICH_WANT, { round: 'floor1' });
  const remaining = RICH_WANT - out.taken;
  console.log(`  rich: want=${RICH_WANT} taken=${out.taken} remaining=${remaining} guardTakes=${out.crumbGuardTakes || 0}`);
  check('full piece taken for crumbs on a rich pantry (500 + 2000)', out.taken === 2500, 'taken=' + out.taken);
  check('need covered (remaining <= 0)', remaining <= 0, 'remaining=' + remaining);
  check('exactly one guarded crumb take recorded', out.crumbGuardTakes === 1);
  check('the piece was indivisible (one 2000 unit)', out.items[1] && out.items[1].units === 1 && out.items[1].effectiveKcal === 2000);
  check('shortOfFresh=false (not exhaustion)', out.shortOfFresh === false);

  // MARGINAL: pantry would fall 5,626 -> 2,813, floor 10,100 -> REFUSE.
  const vm = { pantry: margPantry(Game), burnHistory: [5000, 5200, 4900, 5100, 5050] };
  const outm = Game.pantryDraw(vm, MARG_WANT, { round: 'floor1' });
  const leftm = freshLeft(vm);
  console.log(`  marginal: want=${MARG_WANT} taken=${outm.taken} freshLeft=${leftm} refusals=${outm.crumbGuardRefusals || 0}`);
  check('marginal pantry: whole piece REFUSED (guard holds)', outm.taken === 500, 'taken=' + outm.taken);
  check('guard refusal recorded', outm.crumbGuardRefusals === 1, 'refusals=' + outm.crumbGuardRefusals);
  check('5,626 fresh still in pantry (not drained)', leftm === 5626, 'left=' + leftm);
  check('shortOfFresh=false (crumbs left, not exhaustion)', outm.shortOfFresh === false);

  // The already-working !drewAny case is untouched.
  const v2 = { pantry: [{ name: 'big cut', kcalEach: 2000, units: 2, spoilDay: spoilDayOf(Game, 290), safe: true }] };
  const out2 = Game.pantryDraw(v2, 400, { round: 'floor1' });
  check('!drewAny whole-piece case unchanged (400 want -> 2000 taken)', out2.taken === 2000 && !out2.crumbGuardTakes, 'taken=' + out2.taken);

  // Sense beat: narrate the meal the way a player would read it.
  console.log('\n  SENSE BEAT — Nino, want 1218, pantry 500 + 4x2000, burn ~2,430/day:');
  console.log('  "Nino draws a 500-kcal cut, still hungry for 718 — the pantry holds');
  console.log('   four 2000-kcal pieces and the village burns ~2,430 a day. Taking one');
  console.log('   whole piece leaves 6,500 — above the two-day floor of 4,900. He');
  console.log('   eats 2500 against a 1218 need: over-fed by one indivisible piece,');
  console.log('   never a broken one, never the pantry\'s throat cut."');
  verdict('GREEN');
}

async function phaseGateoff() {
  console.log('PHASE=gateoff — guard installed, CRUMBFLOOR unset: identical to RED');
  const Game = await boot();
  check('crumbFloorOn() is false with gate unset', Game.crumbFloorOn() === false);
  const v = { pantry: richPantry(Game), burnHistory: [2400, 2500, 2300, 2600, 2450] };
  const out = Game.pantryDraw(v, RICH_WANT, { round: 'floor1' });
  const remaining = RICH_WANT - out.taken;
  const left = freshLeft(v);
  console.log(`  draw: want=${RICH_WANT} taken=${out.taken} remaining=${remaining} freshLeft=${left}`);
  check('taken=500 (pristine shape)', out.taken === 500);
  check('remaining=718 (pristine shape)', remaining === 718);
  check('freshLeft=8000 (pristine shape)', left === 8000);
  check('shortOfFresh=false (pristine shape)', out.shortOfFresh === false);
  check('no guard counters (pristine shape)', !out.crumbGuardTakes && !out.crumbGuardRefusals);
  verdict('GATEOFF');
}

async function phaseDetgate() {
  const outPath = process.env.DETOUT;
  if (!outPath) { console.error('DETGATE needs DETOUT=<path>'); process.exit(1); }
  console.log('PHASE=detgate — 2 seeds x 2 policies x 40d, canonical row JSON -> ' + outPath);
  const fs = require('fs');
  const seeds = [101, 202];
  const pids = ['leadcourt', 'belongseek'];
  const all = [];
  for (const pid of pids) {
    const base = pid === 'leadcourt' ? leadcourt : belongseek;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'crumbguard-detgate-' + pid, fullTelemetry: false });
      await setupGame(Game);
      const cen = installShareCensus(Game);
      const policy = Object.assign({}, base);
      let result = null;
      await quietLog(async () => { result = await runDays(Game, policy, { days: 40, manifest: undefined, sampleEvery: 10 }); });
      const rows = cen.rows.map(r => {
        const c = classify(r);
        return [r.day, r.vid, Math.round(r.ate), Math.round(r.drew), Math.round(r.need), r.path, c.starved ? 1 : 0, c.starvePath || '-'].join(',');
      }).join('\n');
      cen.uninstall();
      all.push(`## ${pid} s${seed} days=${result.days}\n${rows}`);
      console.log(`  [${pid} s${seed}] days=${result.days} rows=${cen.rows.length}`);
    }
  }
  fs.writeFileSync(outPath, all.join('\n') + '\n');
  console.log('  wrote ' + outPath);
}

async function phaseSmoke() {
  console.log('PHASE=smoke — harness boots, gate responds');
  const Game = await boot();
  check('Game.pantryDraw exists', typeof Game.pantryDraw === 'function');
  check('Game.crumbFloorOn exists', typeof Game.crumbFloorOn === 'function');
  check('Game.villageDayBurn exists', typeof Game.villageDayBurn === 'function');
  check('Game.crumbGuardAllows exists', typeof Game.crumbGuardAllows === 'function');
  const gate = process.env.CRUMBFLOOR === '1';
  check(`crumbFloorOn() === ${gate} (CRUMBFLOOR=${process.env.CRUMBFLOOR || '<unset>'})`, Game.crumbFloorOn() === gate);
  const v = { pantry: richPantry(Game), burnHistory: [2400, 2500, 2300, 2600, 2450] };
  const out = Game.pantryDraw(v, RICH_WANT, { round: 'floor1' });
  const expect = gate ? 2500 : 500;
  check(`fixture draw taken=${expect}`, out.taken === expect, 'taken=' + out.taken);
  verdict('SMOKE');
}

async function main() {
  const phase = process.env.PHASE || 'all';
  if (phase === 'red' || phase === 'all') await phaseRed();
  if (phase === 'green') await phaseGreen();
  if (phase === 'gateoff') await phaseGateoff();
  if (phase === 'unguarded') await phaseUnguarded();
  if (phase === 'detgate') await phaseDetgate();
  if (phase === 'smoke' || phase === 'all') await phaseSmoke();
  if (phase === 'all') {
    console.log('\nNOTE: PHASE=all covers red+smoke only. Run green/gateoff/unguarded/detgate');
    console.log('with the patch-dance recipe in the header (never git stash).');
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
