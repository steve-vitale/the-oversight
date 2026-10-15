#!/usr/bin/env node
// scripts/test-tribstreak-20261015.js — proof for the hungryStreak-gated early
// tribute pull-forward (loop B, 2026-10-15, food-economy axis, claims
// sim-findings #257).
//
// RED (TRIBSTREAK unset): verb returns 'off', ctx untouched, wrapper dailies
// byte-identical to the parent policies (both roads) — the gate-off wrapper is
// pure delegation.
// GREEN (TRIBSTREAK=1): G1 fragile pantry -> silent hold-pantry, base
// discipline still pays on its own timing; G2 crisis streak (4) -> hold-village,
// NO early pay; G2b hungryDays=0 BUT streak 4 -> hold-village (the divergence
// from the killed tribhealth gate: pantry streak says "fine", the engine's
// signal says "crisis"); G3 transient link (age 3d) -> hold-link, NO early pay;
// G4 healthy pantry + eating village + seasoned link (age 20d, trust 50) ->
// early, week current in full, beat names the PRE-payment depth + the actual
// streak number, base discipline does NOT double-pay; G5 determinism rerun.
// Green on >=3 seeds before the sweep.
'use strict';
const SEED = parseInt(process.env.SEED || '11', 10);
const ARMED = process.env.TRIBSTREAK === '1';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let passed = 0, failed = 0;
function check(name, cond, detail) {
  const line = `  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}\n`;
  process.stderr.write(line); // stderr survives quietLog's console silencing
  if (cond) passed++; else failed++;
}

async function tribFixture(seed, freshDaysTarget, opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed, mode: 'tribstreak-proof' });
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
  // The engine's own individual-hunger signal (game.js villageEats).
  if (opts.hungerStreak != null) Game.progState().hungryStreak = opts.hungerStreak;
  // Pantry-empty streak kept at 0: the divergence check (G2b) needs the pantry
  // streak to say "fine" while the engine signal says "crisis".
  v.hungryDays = opts.hungryDays != null ? opts.hungryDays : 0;
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
function stateHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const l = linkOf(Game) || {};
  return JSON.stringify([
    s.day, Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0)),
    (v.pantry || []).length, l.tributePaidWeek, Math.round(l.tributePaidKcal || 0), l.arrears || 0,
  ]);
}

async function main() {
  let TS;
  try { TS = require('./policies/tribstreak'); }
  catch (e) {
    console.log('INFO-SKIP: tribstreak layer absent (deleted per kill protocol); proof pre-kill RED->GREEN — see evidence/2026-10-15/sim-tribstreak-b.md');
    process.exit(0);
  }
  const { tribstreaklead, tribstreakbelong, gateOn, tribstreakVerb } = TS;
  const { leadcourt } = require('./policies/leadcourt');
  const { belongseek } = require('./policies/belongseek');
  const week = Math.floor(30 / 7); // 4

  if (!ARMED) {
    console.log(`== tribstreak RED proof (gate off, seed ${SEED}) ==`);
    await quietLog(async () => {
      const { Game } = await tribFixture(SEED, 6.25, { hungerStreak: 4 });
      const ctx = {};
      const verdict = tribstreakVerb(Game, ctx);
      check('R1 verb off gate-off', verdict === 'off', 'verdict=' + verdict);
      check('R1 ctx untouched', ctx.tsEarly === undefined && ctx.tsHoldVillage === undefined,
        JSON.stringify({ tsEarly: ctx.tsEarly, tsHoldVillage: ctx.tsHoldVillage }));
      check('R1 gateOn() false', gateOn() === false);

      const a = await tribFixture(SEED, 6.25);
      const b = await tribFixture(SEED, 6.25);
      const ca = {}, cb = {};
      tribstreakbelong.daily(a.Game, ca);
      belongseek.daily(b.Game, cb);
      check('R2 belong wrapper daily byte-identical to parent daily',
        stateHash(a.Game) === stateHash(b.Game), 'hash=' + stateHash(a.Game).slice(0, 60));
      check('R2 no layer counters gate-off', ca.tsEarly === undefined && ca.tsHoldPantry === undefined);

      const c = await tribFixture(SEED, 6.25);
      const d = await tribFixture(SEED, 6.25);
      const cc = {}, cd = {};
      tribstreaklead.daily(c.Game, cc);
      leadcourt.daily(d.Game, cd);
      check('R3 lead wrapper daily byte-identical to parent daily',
        stateHash(c.Game) === stateHash(d.Game));
    });
  } else {
    console.log(`== tribstreak GREEN proof (armed, seed ${SEED}) ==`);
    await quietLog(async () => {
      // G1: fragile pantry (~3.75 fresh-days) -> hold-pantry, SILENT;
      // the base discipline's own tribute step still pays the week on its timing.
      const f1 = await tribFixture(SEED, 3.75);
      const ctx1 = {};
      const verdict1 = tribstreakVerb(f1.Game, ctx1);
      check('G1 fragile fixture fresh-days < 4', freshDays(f1.Game) < 4,
        'fresh-days=' + freshDays(f1.Game).toFixed(2));
      check('G1 verb verdict hold-pantry', verdict1 === 'held' && ctx1.tsHoldPantry === 1,
        'verdict=' + verdict1 + ' tsHoldPantry=' + ctx1.tsHoldPantry);
      const earlySays1 = f1.said.filter(s => /pull tribute forward/i.test(s));
      check('G1 hold is SILENT (no layer beat)', earlySays1.length === 0, 'layer-beats=' + earlySays1.length);
      belongseek.daily(f1.Game, ctx1);
      const l1 = linkOf(f1.Game);
      check('G1 base discipline still pays on its timing', l1.tributePaidWeek === week,
        'tributePaidWeek=' + l1.tributePaidWeek);

      // G2: healthy pantry + hunger CRISIS (streak 4) -> hold-village, NO early pay.
      const f2 = await tribFixture(SEED, 6.25, { hungerStreak: 4 });
      const ctx2 = {};
      const verdict2 = tribstreakVerb(f2.Game, ctx2);
      const l2 = linkOf(f2.Game);
      check('G2 hunger crisis (streak 4) -> hold-village, no early pay',
        verdict2 === 'held' && ctx2.tsHoldVillage === 1 && l2.tributePaidWeek === -1,
        'verdict=' + verdict2 + ' tsHoldVillage=' + ctx2.tsHoldVillage);

      // G2b: THE DIVERGENCE from the killed tribhealth gate — pantry streak 0
      // ("fine") while the engine's signal says crisis. The old gate would
      // have paid; the new gate must hold.
      const f2b = await tribFixture(SEED, 6.25, { hungerStreak: 4, hungryDays: 0 });
      const ctx2b = {};
      const verdict2b = tribstreakVerb(f2b.Game, ctx2b);
      check('G2b hungryDays=0 + streak 4 -> hold-village (old gate divergence)',
        verdict2b === 'held' && ctx2b.tsHoldVillage === 1,
        'verdict=' + verdict2b + ' tsHoldVillage=' + ctx2b.tsHoldVillage);

      // G3: healthy pantry + transient link (age 3d) -> hold-link, NO early pay.
      const f3 = await tribFixture(SEED, 6.25, { linkAge: 3 });
      const ctx3 = {};
      const verdict3 = tribstreakVerb(f3.Game, ctx3);
      const l3 = linkOf(f3.Game);
      check('G3 transient link -> hold-link, no early pay',
        verdict3 === 'held' && ctx3.tsHoldLink === 1 && l3.tributePaidWeek === -1,
        'verdict=' + verdict3 + ' tsHoldLink=' + ctx3.tsHoldLink);

      // G4: healthy pantry + eating village + seasoned link -> EARLY, in full.
      const f4 = await tribFixture(SEED, 6.25, { linkAge: 20, trust: 50, hungerStreak: 0 });
      const ctx4 = {};
      const preDepth = freshDays(f4.Game);
      const verdict4 = tribstreakVerb(f4.Game, ctx4);
      const l4 = linkOf(f4.Game);
      check('G4 seasoned link + healthy village -> early', verdict4 === 'early' && ctx4.tsEarly === 1,
        'verdict=' + verdict4);
      check('G4 week paid in full via engine verb',
        l4.tributePaidWeek === week && l4.tributePaidKcal >= 6000,
        `paidWeek=${l4.tributePaidWeek} paidKcal=${Math.round(l4.tributePaidKcal)}`);
      const beat = f4.said.find(s => /pull tribute forward/i.test(s)) || '';
      check('G4 beat names the PRE-payment depth',
        /~([\d.]+) days of fresh/.test(beat) && Math.abs(parseFloat(beat.match(/~([\d.]+) days of fresh/)[1]) - preDepth) < 0.15,
        'beat=' + beat.slice(0, 100));
      check('G4 beat names the actual streak number',
        /hungriest streak in the ledger is 0 days/.test(beat), 'beat=' + beat.slice(0, 120));
      // base discipline must NOT double-pay after the early pay
      tribstreakbelong.daily(f4.Game, ctx4);
      const l4b = linkOf(f4.Game);
      check('G4 base discipline does not double-pay',
        l4b.tributePaidWeek === week && Math.round(l4b.tributePaidKcal) === Math.round(l4.tributePaidKcal),
        'paidKcal=' + Math.round(l4b.tributePaidKcal));

      // G5: crisis-boundary — streak 2 pays (below the crisis line), streak 3 holds.
      const f5a = await tribFixture(SEED, 6.25, { hungerStreak: 2 });
      const c5a = {};
      check('G5 streak 2 (below crisis line) -> early',
        tribstreakVerb(f5a.Game, c5a) === 'early', 'verdict pinned');
      const f5b = await tribFixture(SEED, 6.25, { hungerStreak: 3 });
      const c5b = {};
      check('G5 streak 3 (crisis line) -> hold-village',
        tribstreakVerb(f5b.Game, c5b) === 'held' && c5b.tsHoldVillage === 1, 'verdict pinned');

      // G6: determinism rerun of the whole GREEN path
      const f6a = await tribFixture(SEED, 6.25, { linkAge: 20, trust: 50 });
      const f6b = await tribFixture(SEED, 6.25, { linkAge: 20, trust: 50 });
      const c6a = {}, c6b = {};
      const va = tribstreakVerb(f6a.Game, c6a), vb = tribstreakVerb(f6b.Game, c6b);
      check('G6 deterministic rerun', va === vb && stateHash(f6a.Game) === stateHash(f6b.Game),
        'va=' + va + ' vb=' + vb);
    });
  }
  console.log(`\n== ${failed === 0 ? 'ALL PASS' : 'FAILURES PRESENT'}: ${passed} passed, ${failed} failed ==`);
  process.exit(failed ? 1 : 0);
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
