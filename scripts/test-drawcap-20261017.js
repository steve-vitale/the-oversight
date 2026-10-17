#!/usr/bin/env node
// scripts/test-drawcap-20261017.js — PROOF for the DRAWCAP arm
// (loop B, 2026-10-17, food-economy axis — finding #422 named next).
//
// The overdraw4 vehicle rebuilt (aid + feast, fresh-first pre-draw, siege
// gate, no tribute, NO floor — the floor is dead) with the CAP variant:
// when fresh-days < 6 at verb-planning time, the day's LAYER outflow
// (aid kcal + feast cost) is capped at 1x villageDayBurn (roster pop x 2000),
// aid-first within the cap.
//
// RED:
//   R0. gate-off: DRAWCAP unset -> pure delegation, byte-identical to the
//       base policy over 20d (the layer changes nothing when off).
//   R-naive (foil): a naive cap that only budgets the feast cost (ignoring
//       aid-first) WRONGLY allows a feast the real cap holds — the foil
//       fails the priority fixture, the real capAllows passes it.
// GREEN (DRAWCAP=1):
//   G1. cap binds vs holds (pure capAllows): aid+deep-feast over 1x burn
//       HELD; aid+normal-feast FIRES; aid alone FIRES.
//   G2. fd 5.x cap-day vs fd 7.x free-day: the cap branch is EVALUATED on
//       the cap-day (osCapDays counted) and SKIPPED on the free-day; the
//       free-day keeps the vehicle's one-verb/day rule.
//   G3. aid priority: with a thin link present, the aid fires in daily and
//       the feast yields on a free-day; aid plans before the feast.
//   G4. fresh-first ordering: the aid's pre-draw takes soonest-spoiling
//       food first (finding #199 — the G10 check).
//   G5. rollback on tend refusal: a refused tend restores the pantry
//       byte-identical (pre-draw undone, no partial drain).
//   G6. tribute-untouched negative: static (no payTribute call in the layer
//       outside comments) + behavioral (Game.payTribute wrapped, 0 calls
//       across a full daily+upkeep with an owed-tribute link present).
//   G7. thin check: a FAT subordinate is skipped (no aid); a THIN one is
//       tended (aid fires, trust/notes move).
//   G8. cap-hold path: a feast the cap refuses is HELD — osCapHeld counted,
//       NO cause line narrated; a cap-fitting feast on the same day fires.
//   G9. cap vacuity on the engine's cost formula (FINDING, not a failure):
//       for every realistic roster pop (1..30), aid + max-formula feast
//       (400xpop) fits inside 1x burn (2000xpop) — the cap cannot bind on
//       engine-realistic costs. Predicts the sweep's (b) engagement check.
// DET-GATE: 3 seeds x 2 reps (DRAWCAP=1), 40d, byte-identical per-day
//   hashes on rerun (r27 rule).
// SMOKE: layer-live markers honest (id, _dcFeastEvents, DRAWCAP honored).
//
// Policy-side only: no src/js changes.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-drawcap-20261017.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
let DC = null;
try { DC = require('./policies/drawcap'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: drawcap layer deleted per kill protocol (NO-GO 2026-10-17: PRIMARY + CO-PRIMARY fail, cap invisible)');
    process.exit(0);
  }
  throw e;
}

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

function addSubLink(Game, id, pantryKcal, population, mourningUntil) {
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id, name: id, pantryKcal, population, day: 0, roster: new Array(population).fill(0).map((_, i) => id + '_v' + i) },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  const link = {
    id: 'link_' + id, primary: 'haven', subordinate: id,
    day: 0, trust: 30, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: mourningUntil || 0,
  };
  m.links.push(link);
  return link;
}

// An owed-tribute link (haven is subordinate): the layer must never pay it.
function addOwedTributeLink(Game) {
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'bigkeep', name: 'bigkeep', pantryKcal: 50000, population: 20, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  m.links.push({
    id: 'link_owed', primary: 'bigkeep', subordinate: 'haven',
    day: 0, trust: 50, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: 0,
  });
}

// freshKcalTarget fresh-days of fresh food on a 24k/day burn.
async function buildWorld(seed, freshKcal, opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed, mode: 'drawcap-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', freshKcal, opts.spoilDays || 3)];
  v.lastRaidDay = 0;
  return { Game, said };
}

function fdOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }
function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function pantryJSON(Game) { return JSON.stringify(Game.state.village.pantry); }

// feast fixture: dusk, at haven, contribution met, base feast blocked so the
// layer's verb alone is measured; plan cost overridden to `cost`.
function feastFixture(Game, ctx, cost) {
  Game.mshipState().links = Game.mshipState().links || [];
  Game.dayPart = 2; // dusk
  const day = Game.state.scholar.day;
  ctx._fsLastFeastDay = day; // block the base feastscale's own feast
  ctx._tribHist = [{ day: day - 1, kcal: 2000 }];
  const realPlan = Game.feastPlan();
  const fake = Object.assign({}, realPlan, { ok: true, cost, have: cost * 2 });
  Game.feastPlan = function () { return fake; };
  return fake;
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'drawcap-det' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes;
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

  console.log('== drawcap proof — RED (gate-off + naive foil) -> GREEN ==');

  // ---------- R0: gate-off = pure delegation, byte-identical ----------
  console.log('== R0. DRAWCAP unset: pure delegation, byte-identical to base ==');
  {
    delete process.env.DRAWCAP;
    const { leadfeast } = require('./policies/feastscale');
    const hBase = await runHashes(leadfeast, 4101, 20);
    const hLayer = await runHashes(DC.drawcaplead, 4101, 20);
    check('R0: gate-off layer byte-identical to leadfeast (20d)',
      hBase.length === hLayer.length && hBase.every((h, i) => h === hLayer[i]),
      `n=${hBase.length}/${hLayer.length}`);
    process.env.DRAWCAP = '1';
  }

  // ---------- R-naive: the foil ----------
  console.log('== R-naive. naive cap (feast-only budget) fails the aid-first fixture ==');
  {
    const naiveCapAllows = (feastCost, pop) => feastCost <= Math.max(1, pop | 0) * 2000;
    // aid 1500 already paid today, feast cost 23000, pop 12 -> cap 24000.
    // Naive: 23000 <= 24000 -> ALLOWS (wrong: day's outflow would be 24500).
    // Real:  1500 + 23000 = 24500 > 24000 -> HOLDS.
    const naive = naiveCapAllows(23000, 12);
    const real = DC.capAllows(1500, 23000, 12);
    check('R-naive: naive cap allows what aid-first must hold (foil fails)',
      naive === true && real === false, `naive=${naive} real=${real}`);
  }

  // ---------- G1: cap binds vs holds (pure) ----------
  console.log('== G1. capAllows: binds vs holds ==');
  {
    check('G1: aid(1500) + deep feast(23000) over 1x burn(24000) HELD',
      DC.capAllows(1500, 23000, 12) === false);
    check('G1: aid(1500) + normal feast(3828) FIRES',
      DC.capAllows(1500, 3828, 12) === true);
    check('G1: aid alone (0+1500) FIRES', DC.capAllows(0, 1500, 12) === true);
    check('G1: villageDayBurnOf == pop*2000', DC.villageDayBurnOf({ state: { village: { roster: new Array(12) } } }) === 24000);
  }

  // ---------- G2: fd 5.x cap-day vs fd 7.x free-day ----------
  console.log('== G2. cap branch evaluated on fd<6, skipped on fd>=6 ==');
  {
    // burn ~24k/day: 5.3d -> 127k; 7.5d -> 180k.
    for (const [label, kcal, expectCap] of [['cap-day', 127000, true], ['free-day', 180000, false]]) {
      const { Game } = await buildWorld(42, kcal);
      const fd = fdOf(Game);
      const ctx = {};
      DC.drawcapbelong.setup(Game, ctx);
      const isCapDay = DC.capDayOf(Game);
      check(`G2 (${label}): fd=${fd.toFixed(2)} -> capDay=${isCapDay}`,
        (fd < 6) === isCapDay && isCapDay === expectCap, `fd=${fd.toFixed(2)}`);
      // drive the aid leg to observe the cap branch evaluation
      addSubLink(Game, 'thinval', 1000, 10, 0);
      const before = ctx.osCapDays || 0;
      Game.dayPart = 1;
      DC._internals.fireAid(Game, ctx);
      const evaluated = (ctx.osCapDays || 0) > before;
      check(`G2 (${label}): cap branch ${expectCap ? 'EVALUATED' : 'SKIPPED'} at aid planning`,
        evaluated === expectCap, `osCapDays ${before}->${ctx.osCapDays || 0}`);
    }
  }

  // ---------- G3: aid priority ----------
  console.log('== G3. aid priority: aid fires first, feast yields on free-day ==');
  {
    const { Game } = await buildWorld(43, 180000); // fd ~7.5 free-day
    addSubLink(Game, 'thinval', 1000, 10, 0);
    const ctx = {};
    DC.drawcaplead.setup(Game, ctx);
    Game.dayPart = 1;
    const link = DC._internals.aidCandidacy(Game);
    check('G3: thin link is the aid candidate', !!link && link.subordinate === 'thinval');
    const fired = DC._internals.fireAid(Game, ctx);
    check('G3: aid FIRES in daily', fired === true && ctx.osAid === 1, `osAid=${ctx.osAid}`);
    // now dusk: feast candidacy must yield (one verb/day on free-days)
    feastFixture(Game, ctx, 4000);
    const cand = DC._internals.feastCandidacy(Game, ctx);
    check('G3: feast YIELDS on the aid-day (free-day one-verb rule)', cand === null);
    check('G3: no cap-hold counted for the yield (it is a yield, not a hold)',
      (ctx.osCapHeld || 0) === 0, `osCapHeld=${ctx.osCapHeld || 0}`);
  }

  // ---------- G4: fresh-first ordering ----------
  console.log('== G4. fresh-first ordering: soonest-spoiling drawn first ==');
  {
    const { Game, said } = await buildWorld(44, 0);
    const day = Game.state.scholar.day;
    // three lots: spoils tomorrow (1000), in 3d (100000), in 10d (100000)
    Game.state.village.pantry = [
      { name: 'soon', kcalEach: 500, units: 2, safe: true, spoilDay: day + 1 },      // 1000
      { name: 'mid', kcalEach: 500, units: 200, safe: true, spoilDay: day + 3 },     // 100000
      { name: 'late', kcalEach: 500, units: 200, safe: true, spoilDay: day + 10 },   // 100000
    ];
    addSubLink(Game, 'thinval', 1000, 10, 0);
    const ctx = {};
    DC.drawcaplead.setup(Game, ctx);
    Game.dayPart = 1;
    const draw = DC.preDraw(Game, 1500);
    const names = draw.items.map(e => (e.item && e.item.name) || '?');
    check('G4: pre-draw takes the soonest-spoiling lot first',
      names[0] === 'soon' && draw.taken === 1500, `drawn=[${names.join(',')}] taken=${draw.taken}`);
    draw.cancel();
  }

  // ---------- G5: rollback on tend refusal ----------
  console.log('== G5. rollback on tend refusal: pantry restored byte-identical ==');
  {
    const { Game } = await buildWorld(45, 150000);
    addSubLink(Game, 'thinval', 1000, 10, 0);
    const ctx = {};
    DC.drawcaplead.setup(Game, ctx);
    Game.dayPart = 1;
    const before = pantryJSON(Game);
    // engine refuses the tend (stub): the layer must roll back the pre-draw.
    const realTend = Game.tendLink;
    Game.tendLink = function () { return 0; };
    let fired = false;
    await quietLog(async () => { fired = DC._internals.fireAid(Game, ctx); });
    Game.tendLink = realTend;
    check('G5: refused aid does NOT confirm', fired === false && (ctx.osAid || 0) === 0);
    check('G5: pantry byte-identical after rollback', pantryJSON(Game) === before);
  }

  // ---------- G6: tribute-untouched negative ----------
  console.log('== G6. tribute timing untouched: the layer never pays tribute ==');
  {
    const fs = require('fs');
    const src = fs.readFileSync(require.resolve('./policies/drawcap.js'), 'utf8');
    const codeLines = src.split('\n').filter(l => !l.trim().startsWith('//'));
    const code = codeLines.join('\n');
    check('G6 (static): no payTribute call in the layer',
      !/\bpayTribute\s*\(/.test(code),
      'payTribute appears only as Game.payTribute = (wrapper save/restore), never called');
    const { Game } = await buildWorld(46, 150000);
    addSubLink(Game, 'thinval', 1000, 10, 0);
    addOwedTributeLink(Game); // haven OWES bigkeep: a payer would pay here
    let tributeCalls = 0;
    const realPay = Game.payTribute;
    Game.payTribute = function () { tributeCalls++; return realPay.apply(this, arguments); };
    const ctx = {};
    const pol = DC.drawcaplead;
    pol.setup(Game, ctx);
    Game.dayPart = 1;
    await quietLog(async () => { pol.daily(Game, ctx); });
    Game.dayPart = 2;
    await quietLog(async () => { if (pol.upkeep) pol.upkeep(Game, ctx); });
    Game.payTribute = realPay;
    check('G6 (behavioral): 0 payTribute calls across daily+upkeep', tributeCalls === 0, `calls=${tributeCalls}`);
  }

  // ---------- G7: thin check ----------
  console.log('== G7. thin check: fat sub skipped, thin sub tended ==');
  {
    const { Game } = await buildWorld(47, 150000);
    addSubLink(Game, 'fatkeep', 200000, 10, 0); // 200000 >= 5*10*2000 -> FAT
    const ctx = {};
    DC.drawcaplead.setup(Game, ctx);
    check('G7: fat subordinate is NOT an aid candidate', DC._internals.aidCandidacy(Game) === null);
    addSubLink(Game, 'thinval', 1000, 10, 0); // THIN
    const link = DC._internals.aidCandidacy(Game);
    check('G7: thin subordinate IS the aid candidate', !!link && link.subordinate === 'thinval');
    Game.dayPart = 1;
    const fired = DC._internals.fireAid(Game, ctx);
    check('G7: aid fires to the thin sub', fired === true && ctx.osAidKcal >= 1000, `osAidKcal=${ctx.osAidKcal}`);
  }

  // ---------- G8: cap-hold path ----------
  console.log('== G8. cap-hold: counted, never narrated ==');
  {
    const { Game, said } = await buildWorld(48, 127000); // fd ~5.3 cap-day
    addSubLink(Game, 'thinval', 1000, 10, 0);
    const ctx = {};
    DC.drawcaplead.setup(Game, ctx);
    Game.dayPart = 1;
    DC._internals.fireAid(Game, ctx); // morning aid: 1500 of the 24000 cap consumed
    check('G8: aid fired (cap-day)', ctx.osAid === 1, `osAid=${ctx.osAid}`);
    const saidBefore = said.length;
    const capHeldBefore = ctx.osCapHeld || 0;
    // dusk: a feast that would overflow the cap (1500 + 30000 > 24000)
    feastFixture(Game, ctx, 30000);
    const cand = DC._internals.feastCandidacy(Game, ctx);
    check('G8: over-cap feast HELD (candidacy null)', cand === null);
    check('G8: cap-hold COUNTED', (ctx.osCapHeld || 0) === capHeldBefore + 1, `osCapHeld=${ctx.osCapHeld}`);
    check('G8: cap-hold NOT narrated (no cause line)', said.length === saidBefore, `said +${said.length - saidBefore}`);
    // same day, cap-fitting feast fires
    feastFixture(Game, ctx, 4000); // 1500 + 4000 <= 24000
    const cand2 = DC._internals.feastCandidacy(Game, ctx);
    check('G8: cap-fitting feast still fires', !!cand2);
  }

  // ---------- G9: cap vacuity on the engine's cost formula (FINDING) ----------
  console.log('== G9. cap vacuity on engine-realistic costs (finding, not failure) ==');
  {
    let allFit = true, worst = 0;
    for (let pop = 1; pop <= 30; pop++) {
      const maxFeast = 400 * pop; // cost formula: max(1500, 400x(n+1)), n+1 <= pop
      const fits = DC.capAllows(1500, maxFeast, pop);
      if (!fits) allFit = false;
      worst = Math.max(worst, (1500 + maxFeast) / (pop * 2000));
    }
    check('G9: aid + max-formula feast fits inside 1x burn for pop 1..30',
      allFit, `worst outflow/cap ratio=${worst.toFixed(3)}`);
    console.log('  NOTE (finding): the cap cannot bind on engine-realistic costs — ' +
      'same vacuity class as the sim-floorday3 floor. The sweep\'s (b) check is expected to fail; ' +
      'the CAP is the kill candidate, not the layer.');
  }

  // ---------- DET-GATE: 3 seeds x 2 reps, byte-identical ----------
  console.log('== DET-GATE. 3 seeds x 2 reps (DRAWCAP=1), 40d byte-identical ==');
  {
    process.env.DRAWCAP = '1';
    for (const seed of [4101, 4102, 4103]) {
      const a = await runHashes(DC.drawcaplead, seed, 40);
      const b = await runHashes(DC.drawcaplead, seed, 40);
      check(`det-gate seed ${seed}: rerun byte-identical`,
        a.length === b.length && a.every((h, i) => h === b[i]), `n=${a.length}/${b.length}`);
    }
  }

  // ---------- SMOKE ----------
  console.log('== SMOKE. layer-live markers honest ==');
  {
    process.env.DRAWCAP = '1';
    const { Game } = await buildWorld(49, 150000);
    const ctx = {};
    DC.drawcapbelong.setup(Game, ctx);
    check('SMOKE: id + feast-event log present when DRAWCAP=1',
      DC.drawcapbelong.id === 'drawcapbelong' && Array.isArray(ctx._dcFeastEvents));
    delete process.env.DRAWCAP;
    const { Game: g2 } = await buildWorld(50, 150000);
    const ctx2 = {};
    DC.drawcapbelong.setup(g2, ctx2);
    check('SMOKE: no layer state when DRAWCAP unset (pure delegation)',
      !Array.isArray(ctx2._dcFeastEvents));
    process.env.DRAWCAP = '1';
  }

  console.log(fails.length ? `\nPROOF FAILED: ${fails.join('; ')}` : '\nPROOF GREEN — all checks passed.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
