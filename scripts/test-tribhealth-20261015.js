#!/usr/bin/env node
// scripts/test-tribhealth-20261015.js — proof for the village-health +
// link-stability gated early tribute pull-forward (loop B, 2026-10-15,
// food-economy axis, claims sim-findings #237).
//
// RED (TRIBHEALTH unset): verb returns 'off', ctx untouched, wrapper dailies
// byte-identical to the parent policies (both roads).
// GREEN (TRIBHEALTH=1): G1 fragile pantry -> silent hold-pantry, base
// discipline still pays on its own timing; G2 healthy pantry + hunger spiral
// (streak 4) -> hold-village, NO early pay; G3 healthy pantry + transient link
// (age 3d) -> hold-link, NO early pay; G4 healthy pantry + eating village +
// seasoned link (age 20d, trust 50) -> early, week current in full, beat names
// the PRE-payment depth, base discipline does NOT double-pay; G5 starvation
// death in trailing-7d telemetry -> hold-village; G6 determinism rerun.
// Green on >=3 seeds before the sweep.
'use strict';
const SEED = parseInt(process.env.SEED || '11', 10);
const ARMED = process.env.TRIBHEALTH === '1';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let passed = 0, failed = 0;
function check(name, cond, detail) {
  const line = `  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}\n`;
  process.stderr.write(line); // stderr survives quietLog's console silencing
  if (cond) passed++; else failed++;
}

async function tribFixture(seed, freshDaysTarget, opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed, mode: 'tribhealth-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (s) => { said.push(String(s)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30; Game.dayPart = 2;
  const v = Game.state.village, day = 30, burn = 2400;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  const freshKcal = Math.round(freshDaysTarget * burn);
  v.pantry = [
    { name: 'Foraged food', kcalEach: 500, units: Math.ceil(freshKcal / 500), safe: true, spoilDay: day + 3 },
    { name: 'Pemmican bars', foodKind: 'pemmican', kcalEach: 500, units: 120, safe: true, spoilDay: day + 120 },
  ];
  if (opts.hungerStreak != null) v.hungryDays = opts.hungerStreak;
  if (opts.starveDeath) {
    Game.state.telemetry = Game.state.telemetry || [];
    Game.state.telemetry.push({ type: 'death', day: 29, kind: 'starved', who: 'villager-x', cause: 'starvation' });
  }
  // Active subordinate link: Haven owes village-east 6,000 kcal/week.
  const ms = Game.mshipState();
  ms.links = ms.links || [];
  ms.links.push({
    id: 'link-trib-fixture', status: 'active', primary: 'village-east', subordinate: 'haven',
    tributeKcalPerWeek: 6000, tributePaidWeek: -1, tributeWeek: -1, tributePaidKcal: 0, arrears: 0,
    obligations: ['tribute', 'aid'], trust: opts.trust != null ? opts.trust : 50,
    day: opts.linkAge != null ? (day - opts.linkAge) : (day - 20),
    history: [{ day: 1, kind: 'formed', note: 'Haven joined village-east as subordinate.' }],
  });
  return { Game, said };
}

function linkOf(Game) {
  return (Game.hierarchyState() || []).find(l => l && l.id === 'link-trib-fixture');
}
function freshDays(Game) { return Game.pantryFreshDays ? Game.pantryFreshDays() : -1; }
function hungerCtx(Game, seedDays) {
  // pre-fill the trailing-window ring as the armed wrapper daily would
  const d = (Game.state.scholar || {}).day || 0;
  const h = [];
  for (let i = 7; i >= 0; i--) h.push({ day: d - i, streak: seedDays });
  return { _thHunger: h };
}
function stateHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const l = linkOf(Game) || {};
  return JSON.stringify([
    s.day, Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0)),
    (v.pantry || []).length, l.tributePaidWeek, Math.round(l.tributePaidKcal || 0), l.arrears || 0,
  ]);
}

async function main() {
  let TH;
  try { TH = require('./policies/tribhealth'); }
  catch (e) {
    console.log('INFO-SKIP: tribhealth layer absent (deleted per kill protocol); proof pre-kill RED->GREEN — see evidence/2026-10-15/sim-tribhealth-b.md');
    process.exit(0);
  }
  const { tribhealthlead, tribhealthbelong, gateOn, tribhealthVerb } = TH;
  const { leadcourt } = require('./policies/leadcourt');
  const { belongseek } = require('./policies/belongseek');
  const week = Math.floor(30 / 7); // 4

  if (!ARMED) {
    console.log(`== tribhealth RED proof (gate off, seed ${SEED}) ==`);
    await quietLog(async () => {
      const { Game } = await tribFixture(SEED, 6.25);
      const ctx = {};
      const verdict = tribhealthVerb(Game, ctx);
      check('R1 verb off gate-off', verdict === 'off', 'verdict=' + verdict);
      check('R1 ctx untouched', ctx.thEarly === undefined && ctx.thHoldVillage === undefined,
        JSON.stringify({ thEarly: ctx.thEarly, thHoldVillage: ctx.thHoldVillage }));
      check('R1 gateOn() false', gateOn() === false);

      const a = await tribFixture(SEED, 6.25);
      const b = await tribFixture(SEED, 6.25);
      const ca = {}, cb = {};
      tribhealthbelong.daily(a.Game, ca);
      belongseek.daily(b.Game, cb);
      check('R2 belong wrapper daily byte-identical to parent daily',
        stateHash(a.Game) === stateHash(b.Game), 'hash=' + stateHash(a.Game).slice(0, 60));
      check('R2 no layer counters gate-off', ca.thEarly === undefined && ca.thHoldPantry === undefined);

      const c = await tribFixture(SEED, 6.25);
      const d = await tribFixture(SEED, 6.25);
      const cc = {}, cd = {};
      tribhealthlead.daily(c.Game, cc);
      leadcourt.daily(d.Game, cd);
      check('R3 lead wrapper daily byte-identical to parent daily',
        stateHash(c.Game) === stateHash(d.Game));
    });
  } else {
    console.log(`== tribhealth GREEN proof (armed, seed ${SEED}) ==`);
    await quietLog(async () => {
      // G1: fragile pantry (~3.75 fresh-days) -> hold-pantry, SILENT;
      // the base discipline's own tribute step still pays the week on its timing.
      const f1 = await tribFixture(SEED, 3.75);
      const ctx1 = hungerCtx(f1.Game, 0);
      const verdict1 = tribhealthVerb(f1.Game, ctx1);
      check('G1 fragile fixture fresh-days < 4', freshDays(f1.Game) < 4,
        'fresh-days=' + freshDays(f1.Game).toFixed(2));
      check('G1 verb verdict hold-pantry', verdict1 === 'held' && ctx1.thHoldPantry === 1,
        'verdict=' + verdict1 + ' thHoldPantry=' + ctx1.thHoldPantry);
      const earlySays1 = f1.said.filter(s => /pull tribute forward/i.test(s));
      check('G1 hold is SILENT (no layer beat)', earlySays1.length === 0, 'layer-beats=' + earlySays1.length);
      belongseek.daily(f1.Game, ctx1);
      const l1 = linkOf(f1.Game);
      check('G1 base discipline still pays on its timing', l1.tributePaidWeek === week,
        'tributePaidWeek=' + l1.tributePaidWeek);

      // G2: healthy pantry + hunger spiral (streak 4) -> hold-village, NO early pay.
      const f2 = await tribFixture(SEED, 6.25, { hungerStreak: 4 });
      const ctx2 = hungerCtx(f2.Game, 4);
      const verdict2 = tribhealthVerb(f2.Game, ctx2);
      const l2 = linkOf(f2.Game);
      check('G2 hunger spiral -> hold-village, no early pay',
        verdict2 === 'held' && ctx2.thHoldVillage === 1 && l2.tributePaidWeek === -1,
        'verdict=' + verdict2 + ' thHoldVillage=' + ctx2.thHoldVillage);

      // G3: healthy pantry + transient link (age 3d) -> hold-link, NO early pay.
      const f3 = await tribFixture(SEED, 6.25, { linkAge: 3 });
      const ctx3 = hungerCtx(f3.Game, 0);
      const verdict3 = tribhealthVerb(f3.Game, ctx3);
      const l3 = linkOf(f3.Game);
      check('G3 transient link -> hold-link, no early pay',
        verdict3 === 'held' && ctx3.thHoldLink === 1 && l3.tributePaidWeek === -1,
        'verdict=' + verdict3 + ' thHoldLink=' + ctx3.thHoldLink);

      // G4: healthy pantry + eating village + seasoned link -> EARLY, week current in full.
      const f4 = await tribFixture(SEED, 6.25, { linkAge: 20, trust: 50 });
      const ctx4 = hungerCtx(f4.Game, 0);
      const preDepth = freshDays(f4.Game);
      const verdict4 = tribhealthVerb(f4.Game, ctx4);
      const l4 = linkOf(f4.Game);
      check('G4 seasoned link + healthy village -> early', verdict4 === 'early' && ctx4.thEarly === 1,
        'verdict=' + verdict4);
      check('G4 week paid in full via engine verb',
        l4.tributePaidWeek === week && l4.tributePaidKcal >= 6000,
        `paidWeek=${l4.tributePaidWeek} paidKcal=${Math.round(l4.tributePaidKcal)}`);
      const beat = f4.said.find(s => /pull tribute forward/i.test(s)) || '';
      check('G4 beat names the PRE-payment depth',
        /~([\d.]+) days of fresh/.test(beat) && Math.abs(parseFloat(beat.match(/~([\d.]+) days/)[1]) - preDepth) < 0.15,
        'beat=' + beat.slice(0, 90));
      check('G4 beat names the village-health signal',
        /eating well|no hunger stretch/i.test(beat), 'beat=' + beat.slice(0, 90));
      // base discipline must NOT double-pay after the early pay
      tribhealthbelong.daily(f4.Game, ctx4);
      const l4b = linkOf(f4.Game);
      check('G4 base discipline does not double-pay',
        l4b.tributePaidWeek === week && Math.round(l4b.tributePaidKcal) === Math.round(l4.tributePaidKcal),
        'paidKcal=' + Math.round(l4b.tributePaidKcal));

      // G5: starvation death in trailing-7d telemetry -> hold-village.
      const f5 = await tribFixture(SEED, 6.25, { starveDeath: true });
      const ctx5 = hungerCtx(f5.Game, 0);
      const verdict5 = tribhealthVerb(f5.Game, ctx5);
      const l5 = linkOf(f5.Game);
      check('G5 starvation death trailing-7d -> hold-village',
        verdict5 === 'held' && ctx5.thHoldVillage === 1 && l5.tributePaidWeek === -1,
        'verdict=' + verdict5 + ' thHoldVillage=' + ctx5.thHoldVillage);

      // G6: determinism rerun of the whole GREEN path
      const f6a = await tribFixture(SEED, 6.25, { linkAge: 20, trust: 50 });
      const f6b = await tribFixture(SEED, 6.25, { linkAge: 20, trust: 50 });
      const c6a = hungerCtx(f6a.Game, 0), c6b = hungerCtx(f6b.Game, 0);
      const va = tribhealthVerb(f6a.Game, c6a), vb = tribhealthVerb(f6b.Game, c6b);
      check('G6 deterministic rerun', va === vb && stateHash(f6a.Game) === stateHash(f6b.Game),
        'va=' + va + ' vb=' + vb);
    });
  }
  console.log(`\n== ${failed === 0 ? 'ALL PASS' : 'FAILURES PRESENT'}: ${passed} passed, ${failed} failed ==`);
  process.exit(failed ? 1 : 0);
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
