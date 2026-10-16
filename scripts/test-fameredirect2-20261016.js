#!/usr/bin/env node
// FAMEREDIRECT2 PROOF (fleshout-b, 2026-10-16).
//
// THE LEVER: the killed FAMINEREDIRECT arm (sim-findings.md + evidence/
// 2026-10-14/sim-famredirect-b.md) redirected wood/water/stone → food at
// <2 fresh pantry days and traded starvation for thirst (thirst 1→16).
// This arm revives it POLICY-SIDE ONLY (zero src/js): when the famine
// signal fires (Game.pantryFreshDays() < 2, the engine's honest pantry
// accounting), the leader's honest assignTask verb redirects WOOD+STONE
// duties to food work (forage→garden→fish round-robin). WATER duties are
// NEVER redirected — the named difference from the killed arm.
//
// Env-gated: FAMREDIRECT2=1 (default OFF). Gate off = pure delegation of
// the base policy; the gate is read once per upkeep call.
//
// PHASES:
//   RED  1. gate off, famined pantry: no redirect, no ledger, no beat.
//        2. gate off, famined pantry, WATER duty: untouched (layer absent).
//        3. gate ON, UNFAMINED pantry (>=2 fresh days): no redirect, no beat.
//   GREEN 4. gate on, famined: wood → forage (rotation first), ledger counted.
//        5. gate on, famined: stone → garden (rotation advances), water STAYS.
//        6. condensed beat: names pantry state + decision + consequence +
//           the water exclusion; fires once per day across repeated calls.
//   DET-GATE 7. wrapped policy with gate OFF runs a 15-day trajectory
//        byte-identical to the bare base policy on the same seed.
//   SMOKE 8. short live run armed: the layer drives (no crash, checks ran).
//
// Shared kit (sim-harness loadGame): seeded RNG before eval, deterministic
// clock, window stubbed then deleted. Never stubs Game.save.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { runDays } = require('./sim-harness');
const fam2 = require('./policies/fameredirect2');
const { leadcourt } = require('./policies/leadcourt');

const SEED = parseInt(process.env.SEED || '20261016', 10);
const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

// Pantry fixture: burnHistory = [1500] → measured draw 1.5k kcal/day; each
// fresh kcal item with spoilDay in the future counts toward pantryFreshKcal.
function freshItem(Game, kcal, daysLeft) {
  return {
    name: 'Foraged greens', kcalEach: 500, units: Math.max(1, Math.ceil(kcal / 500)),
    safe: true, spoilDay: (Game.state.scholar.day || 10) + daysLeft,
  };
}
function setPantry(Game, kcal) {
  const v = Game.state.village;
  v.burnHistory = [1500, 1500, 1500, 1500, 1500, 1500, 1500];
  v.pantry = [freshItem(Game, kcal, 5)];
}

async function fixture() {
  const { Game } = await loadGame({ seed: SEED, mode: 'famredirect2-proof', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  Game.state.scholar.day = 10;
  Game.say = (t) => { (Game._said = Game._said || []).push(String(t)); };
  Game._said = [];
  const vids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  return { Game, vids: vids.slice(0, 4) };
}
function freshDays(Game) {
  return (typeof Game.pantryFreshDays === 'function') ? Game.pantryFreshDays() : -1;
}

(async () => {
  // ---- RED 1: gate off, famined pantry — mechanism provably inert ----
  console.log('== RED 1. gate off + famined pantry: no redirect, no ledger, no beat ==');
  delete process.env.FAMREDIRECT2;
  {
    const { Game, vids } = await fixture();
    const [woodVid, stoneVid, waterVid] = vids;
    setPantry(Game, 1500); // 1.0 fresh days — real famine
    const ctx = {};
    Game.state.village.assignments = {
      [woodVid]: { task: 'wood' }, [stoneVid]: { task: 'stone' }, [waterVid]: { task: 'water' },
    };
    check('sanity: famine signal is live', freshDays(Game) < 2, 'freshDays=' + freshDays(Game).toFixed(2));
    fam2.famineRedirect2(Game, ctx);
    const asg = Game.state.village.assignments;
    check('[RED] gate off: wood duty unchanged', asg[woodVid].task === 'wood', 'task=' + asg[woodVid].task);
    check('[RED] gate off: stone duty unchanged', asg[stoneVid].task === 'stone', 'task=' + asg[stoneVid].task);
    check('[RED] gate off: water duty unchanged', asg[waterVid].task === 'water', 'task=' + asg[waterVid].task);
    check('[RED] gate off: no redirect counters', !(ctx.fam2Redirects > 0), 'fam2Redirects=' + (ctx.fam2Redirects || 0));
    check('[RED] gate off: no famine beat', !(Game._said || []).some(s => /shelves hold/i.test(s)), 'said=' + (Game._said || []).length);
  }

  // ---- RED 3: gate ON, UNFAMINED pantry — no redirect ----
  console.log('== RED 3. gate on + unfamined pantry (>=2d): no redirect ==');
  process.env.FAMREDIRECT2 = '1';
  {
    const { Game, vids } = await fixture();
    const [woodVid] = vids;
    setPantry(Game, 4500); // 3.0 fresh days — neutral band
    const ctx = {};
    Game.state.village.assignments = { [woodVid]: { task: 'wood' } };
    check('sanity: no famine signal', freshDays(Game) >= 2, 'freshDays=' + freshDays(Game).toFixed(2));
    fam2.famineRedirect2(Game, ctx);
    check('[RED] gate on, unfamined: wood duty unchanged',
      Game.state.village.assignments[woodVid].task === 'wood');
    check('[RED] gate on, unfamined: no redirect counters', !(ctx.fam2Redirects > 0));
  }

  // ---- GREEN 4: gate on, famined — wood redirects, ledger counted ----
  console.log('== GREEN 4. gate on + famined: wood → food, ledger, honest beat ==');
  process.env.FAMREDIRECT2 = '1';
  {
    const { Game, vids } = await fixture();
    const [woodVid] = vids;
    setPantry(Game, 1500);
    const ctx = {};
    Game.state.village.assignments = { [woodVid]: { task: 'wood' } };
    fam2.famineRedirect2(Game, ctx);
    const asg = Game.state.village.assignments;
    const got = asg[woodVid].task;
    check('wood duty redirects to a food task', fam2.FOOD_ROTATION.indexOf(got) >= 0, 'task=' + got);
    check('first rotation slot = forage', got === 'forage', 'task=' + got);
    check('redirect counted', (ctx.fam2Redirects || 0) === 1, 'fam2Redirects=' + (ctx.fam2Redirects || 0));
    check('wood-source counted', (ctx.fam2Redir_wood || 0) === 1);
    check('signal counted', (ctx.fam2Signals || 0) === 1);
    const beat = (Game._said || []).filter(s => /shelves hold/i.test(s));
    check('exactly one famine beat', beat.length === 1, 'beats=' + beat.length);
    const b = beat[0] || '';
    check('beat names the pantry state', /shelves hold .*day/.test(b), b.slice(0, 90));
    check('beat names the decision', /leave the wood run and stone work/.test(b), b.slice(60, 170));
    check('beat names the consequence', /head for food instead/.test(b), b.slice(120, 220));
    check('beat names the water exclusion', /Water crews stay on the water/.test(b), b.slice(160, 280));
    // ledger mirror
    fam2.syncLedger(Game, ctx);
    const L = Game.state.village.fam2Ledger || {};
    check('village ledger mirrors counters', L.redirects === 1 && L.redir_wood === 1 && L.signals === 1,
      JSON.stringify(L));
  }

  // ---- GREEN 5: stone redirects too; rotation advances; WATER STAYS ----
  console.log('== GREEN 5. stone redirects; rotation advances; water NEVER redirects ==');
  {
    const { Game, vids } = await fixture();
    const [woodVid, stoneVid, waterVid, patrolVid] = vids;
    setPantry(Game, 1500);
    const ctx = {};
    Game.state.village.assignments = {
      [woodVid]: { task: 'wood' }, [stoneVid]: { task: 'stone' },
      [waterVid]: { task: 'water' }, [patrolVid]: { task: 'patrol' },
    };
    fam2.famineRedirect2(Game, ctx);
    const asg = Game.state.village.assignments;
    check('stone duty redirects to a food task', fam2.FOOD_ROTATION.indexOf(asg[stoneVid].task) >= 0,
      'task=' + asg[stoneVid].task);
    check('stone took the SECOND rotation slot (garden)', asg[stoneVid].task === 'garden',
      'task=' + asg[stoneVid].task);
    check('stone-source counted', (ctx.fam2Redir_stone || 0) === 1);
    check('WATER DUTY UNTOUCHED — the whole point of the arm', asg[waterVid].task === 'water',
      'task=' + asg[waterVid].task);
    check('non-material duty (patrol) untouched', asg[patrolVid].task === 'patrol');
    check('redirects counted x2', (ctx.fam2Redirects || 0) === 2, 'fam2Redirects=' + (ctx.fam2Redirects || 0));
  }

  // ---- GREEN 6: condensed beat — once per day across repeated calls ----
  console.log('== GREEN 6. condensed beat: one per day, refires next day ==');
  {
    const { Game, vids } = await fixture();
    const [woodVid] = vids;
    setPantry(Game, 1500);
    const ctx = {};
    Game.state.village.assignments = { [woodVid]: { task: 'wood' } };
    fam2.famineRedirect2(Game, ctx);
    Game.state.village.assignments = { [woodVid]: { task: 'wood' } };
    fam2.famineRedirect2(Game, ctx); // second signal, same day
    let beats = (Game._said || []).filter(s => /shelves hold/i.test(s));
    check('same-day repeat: still one beat', beats.length === 1, 'beats=' + beats.length);
    Game.state.scholar.day = 11; // next day
    Game.state.village.assignments = { [woodVid]: { task: 'wood' } };
    fam2.famineRedirect2(Game, ctx);
    beats = (Game._said || []).filter(s => /shelves hold/i.test(s));
    check('next day: beat refires', beats.length === 2, 'beats=' + beats.length);
  }

  // ---- DET-GATE 7: gate off — wrapped policy byte-identical to base ----
  console.log('== DET-GATE 7. gate off: wrapped policy trajectory == base policy ==');
  delete process.env.FAMREDIRECT2;
  async function trajectoryHash(policy) {
    const { Game } = await loadGame({ seed: 44, mode: 'famredirect2-detgate', fullTelemetry: false });
    await quietLog(async () => { await setupGame(Game); });
    const rows = [];
    const p2 = Object.assign({}, policy, {
      daily(G, ctx) {
        try {
          rows.push([
            (G.state.scholar || {}).day || 0,
            (G.state.village.roster || []).length,
            Math.round((((G.state.village || {}).pantry) || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)),
            (typeof G.unlockedWave === 'function') ? (G.unlockedWave() | 0) : -1,
            (G.state.village.water || {}).clean || 0,
          ]);
        } catch (e) {}
        if (policy.daily) { try { return policy.daily(G, ctx); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async () => { result = await runDays(Game, p2, { days: 15, sampleEvery: 1 }); });
    return JSON.stringify({ rows, days: result.days, endReason: result.endReason });
  }
  const hBase = await trajectoryHash(leadcourt);
  const hWrapped = await trajectoryHash(fam2.leadcourtFam2);
  check('det-gate: gate-off wrapped policy byte-identical to base',
    hBase === hWrapped, 'len=' + hBase.length + '/' + hWrapped.length);

  // ---- SMOKE 8: short live run armed — the layer drives without crashing ----
  console.log('== SMOKE 8. armed 25d live run: layer drives ==');
  process.env.FAMREDIRECT2 = '1';
  {
    const { Game } = await loadGame({ seed: 55, mode: 'famredirect2-smoke', fullTelemetry: false });
    await quietLog(async () => { await setupGame(Game); });
    let result = null;
    await quietLog(async () => {
      result = await runDays(Game, Object.assign({}, fam2.leadcourtFam2), { days: 25, sampleEvery: 5 });
    });
    const L = (Game.state.village || {}).fam2Ledger || {};
    check('smoke: 25 days simulated', (result.gameDays || 0) >= 15, 'gameDays=' + (result.gameDays || 0));
    check('smoke: signal reads happened (layer live)', (L.checked || 0) > 0, 'checked=' + (L.checked || 0));
    check('smoke: run completed without a fatal layer error', !!result.endReason || (result.days || 0) > 0,
      'endReason=' + (result.endReason || 'n/a'));
    console.log('    (ledger: ' + JSON.stringify(L) + ')');
  }

  console.log(fails.length ? `\nPROOF RESULT: ${fails.length} FAIL — ${fails.join('; ')}` : '\nPROOF RESULT: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
})();
