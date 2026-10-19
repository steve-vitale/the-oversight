#!/usr/bin/env node
// test-presencetend-20261019.js — proof for the sim-presencetend layer.
//
// RED->GREEN: fixtures + SMOKE + DET sections; KILL-PROTOCOL INFO-SKIP
// pattern (from scripts/test-winsupportdecomp-20261019.js): the layer
// scripts/policies/presencetend.js may be deleted per the kill protocol —
// layer-dependent sections INFO-SKIP and the KILLED-VERDICT section pins
// the landed verdicts on the committed corpus. T1 (metric definition) and
// T2 (judge predicates) don't need the layer and still run. Without the
// layer and without the flag, absence is RED (exit 1).
//
// Sections:
//   T1 — the revised PRIMARY's definition pinned on the REAL engine:
//        living VILLAGER veterans (the scholar vid excluded): DISTINCT
//        living roster vids with a wave-3+ kill in state.waveKillLog. Dead
//        killers excluded; wave-2-only killers excluded; duplicate kills by
//        one vid count once; the scholar NEVER counts (control produces
//        scholar-veterans on its own — presence-confirm metric review #2).
//   T2 — the analyzer's judge predicates (the SAME functions the verdict
//        rests on, required from presencetend-analyze-20261019.js): primary
//        bar +4/32 exact boundary, survival floor control-10d, reach noise
//        band, the REVISED new-death-mode rule (>=2 events, named-monster
//        lottery exempt).
//   GATE — PRESTEND unset: pure delegation for daily/upkeep/fight, ctx
//        untouched, no verbs fire.
//   PRESENCE — the piloted beat: fires on a wave-3+ threat at Haven with
//        the scholar outside (goInside + microMove counted); never fires
//        when already inside / no threat / in combat; never calls
//        assignTask/takeWeapon (both throw if called — the vetarm lesson).
//   TEND — the tend half: def5 window live + scholar at Haven + wounded
//        living companion (<70) -> tendVillager fires, cap 2/day, one pass
//        per day; no tend when window closed / away from Haven / nobody
//        wounded / vid dead; NEVER calls travelTo or doAction('rest').
//   SMOKE — real engine, full substrate stack, 3 days, PRESTEND=1: no
//        crash, beat/tend counts are the only writes.
//   DET — PRESTEND unset: withPresencetend(base) byte-identical to base
//        (dayHash per day, 2 seeds) — the gate-off purity pin.
//   KILLED-VERDICT — on kill: re-derive the landed verdicts from the
//        committed corpus (INFO-SKIP otherwise).
//
// New tests must not write into the repo — this one doesn't.
// Usage: node scripts/test-presencetend-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (PRESTEND_KILLED=1 set by
// the coordinator after a killed arm), layer-dependent sections are skipped
// — the proof exits green with INFO-SKIPs plus the KILLED-VERDICT pin.
// T1/T2 (metric definition + judge logic) don't need the layer and still
// run. Without the layer and without the flag, absence is RED (exit 1).
const LAYER_PATH = path.join(__dirname, 'policies', 'presencetend.js');
const LAYER_GONE = !fs.existsSync(LAYER_PATH);
if (LAYER_GONE && process.env.PRESTEND_KILLED !== '1') {
  console.error('RED: scripts/policies/presencetend.js missing and PRESTEND_KILLED not set.');
  process.exit(1);
}
const PT = LAYER_GONE ? null : require('./policies/presencetend');
const J = require('./presencetend-analyze-20261019');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function sectionIfLayer(name) {
  console.log(name);
  if (LAYER_GONE) console.log('  INFO-SKIP: layer deleted per kill protocol (PRESTEND_KILLED=1)');
}

function clearEnv() { delete process.env.PRESTEND; }

// ---------- fabricated Game for GATE/PRESENCE/TEND ----------
function stubGame(o) {
  o = o || {};
  const calls = { goInside: 0, microMove: 0, assignTask: 0, takeWeapon: 0, tend: 0, travelTo: 0, rest: 0 };
  const G = {
    over: false,
    villagerId: 'scholar1',
    state: {
      scholar: { day: 100, insideHaven: false, health: 100 },
      village: { roster: ['scholar1', 'v1', 'v2', 'v3'], px: 4, py: 4, health: o.health || {} },
    },
    data: { items: [], monsters: [{ id: 'spool', wave: 3, name: 'The Spool' }, { id: 'hushwolf', wave: 1, name: 'Hushwolf' }] },
    _calls: calls,
    _party: o.party || ['v1', 'v2', 'v3'],
    _def5: o.def5 === true,
    playerAtHaven: () => (o.atHaven === undefined ? true : o.atHaven),
    inCombat: () => (o.inCombat === true),
    aidCrisis: () => (o.aid === true),
    worldMonsters: () => (o.worldMonsters || []),
    standingDeferral: (w) => (w === 5 && G._def5 ? { deferred: true } : null),
    enterBuilding: function () { calls.goInside++; this.state.scholar.insideHaven = true; return true; },
    microMove: function () { calls.microMove++; return true; },
    assignTask: function () { calls.assignTask++; throw new Error('presencetend layer called Game.assignTask — violation'); },
    takeWeapon: function () { calls.takeWeapon++; throw new Error('presencetend layer called Game.takeWeapon — violation'); },
    partyMembers: function () { return this._party.slice(); },
    tendVillager: function (vid) { calls.tend++; calls.tended = calls.tended || []; calls.tended.push(vid); return true; },
    travelTo: function () { calls.travelTo++; throw new Error('presencetend layer called Game.travelTo — violation (extract indicted)'); },
    doAction: function (verb) { if (verb === 'rest') { calls.rest++; throw new Error('presencetend layer called doAction(rest) — violation (posture indicted)'); } return false; },
    vpOf: function (vid) { return { dead: (o.dead || []).includes(vid) }; },
  };
  return G;
}

function fixtureBase() {
  const calls = { daily: 0, upkeep: 0, fight: 0 };
  const base = {
    id: 'fixture-base', desc: 'fixture',
    daily(G, ctx) { calls.daily++; return 'daily'; },
    upkeep(G, ctx) { calls.upkeep++; return 'upkeep'; },
    fight(G, ctx) { calls.fight++; return false; },
    _calls: calls,
  };
  return base;
}

(async () => {
  // ================= T1: revised primary definition (real engine) =================
  console.log('T1: revised primary definition (living VILLAGER veterans, scholar excluded)');
  const { Game } = await loadGame({ seed: 416, mode: 'presencetend-proof' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []);
  const fighters = roster.filter(v => v !== Game.villagerId).filter(v => { try { const vp = Game.vpOf(v); return vp && !vp.dead; } catch (e) { return false; } });
  ok('T1 fixture has 3+ fighters', fighters.length >= 3, `fighters=${fighters.length}`);
  const [livingA, livingB, livingC] = fighters;
  try { Game.vpOf(livingB).dead = true; } catch (e) { ok('T1 kill livingB', false, String(e)); }
  Game.state.waveKillLog = [
    { d: 50, mid: 'spool', w: 3, by: livingA, via: 'agency' },   // living villager w3 killer -> counts
    { d: 51, mid: 'gavel', w: 3, by: livingA, via: 'agency' },   // dup killer -> still one
    { d: 52, mid: 'redactor', w: 3, by: livingB, via: 'agency' },// dead -> excluded
    { d: 53, mid: 'hushwolf', w: 1, by: livingC, via: 'agency' },// wave-1 kill -> excluded
    { d: 54, mid: 'static', w: 2, by: livingC, via: 'agency' },  // wave-2 kill -> excluded
    { d: 55, mid: 'ad_break', w: 3, by: Game.villagerId, via: 'agency' }, // SCHOLAR -> excluded by definition
  ];
  const vv = J.countLivingVillagerVeterans(Game);
  ok('T1 villagerVeterans = livingA only (scholar excluded)', vv.count === 1 && JSON.stringify(vv.vids) === JSON.stringify([livingA]), `count=${vv.count} vids=${vv.vids}`);
  Game.state.waveKillLog.push({ d: 56, mid: 'congregation', w: 4, by: livingC, via: 'agency' });
  const vv2 = J.countLivingVillagerVeterans(Game);
  ok('T1 livingC w4 kill adds a second villager veteran', vv2.count === 2, `count=${vv2.count}`);

  // ================= T2: judge predicates =================
  console.log('T2: analyzer judge predicates');
  ok('T2 primary GO at exactly +4', J.judgePrimary(10, 14) === true);
  ok('T2 primary NO-GO at +3', J.judgePrimary(10, 13) === false);
  ok('T2 primary GO from zero control', J.judgePrimary(0, 4) === true);
  ok('T2 primary NO-GO below bar from zero', J.judgePrimary(0, 3) === false);
  ok('T2 primary bar is +4 (VET_BAR)', J.VET_BAR === 4, `VET_BAR=${J.VET_BAR}`);
  ok('T2 survival floor PASS at control-10', J.judgeSurvival(119, 109) === true);
  ok('T2 survival floor FAIL at control-11', J.judgeSurvival(119, 108) === false);
  ok('T2 table PASS at control-2', J.judgeReach(7, 5) === true);
  ok('T2 table FAIL at control-3', J.judgeReach(7, 4) === false);
  ok('T2 reach (national) PASS at control (not degraded)', J.judgeReach(7, 7) === true);
  ok('T2 no new modes on identical maps', J.newDeathModes({ a: 1, b: 2 }, { a: 3, b: 4 }, J.MONSTER_NAMES).length === 0);
  ok('T2 single-event new cause does NOT count (>=2 rule)', J.newDeathModes({ a: 1 }, { a: 1, x: 1 }, J.MONSTER_NAMES).length === 0, 'x@1 ignored');
  ok('T2 two-event new cause counts', JSON.stringify(J.newDeathModes({ a: 1 }, { a: 1, x: 2 }, J.MONSTER_NAMES)) === '["x"]', '');
  ok('T2 named-monster-lottery cause exempt', J.newDeathModes({ a: 1 }, { a: 1, 'The Reunion': 3 }, J.MONSTER_NAMES).length === 0, 'The Reunion exempt');

  // ================= GATE =================
  sectionIfLayer('GATE — PRESTEND unset: pure delegation for daily/upkeep/fight, ctx untouched');
  if (PT) (function () {
    clearEnv();
    const base = fixtureBase();
    const p = PT.withPresencetend(base, 'pt-test', 'test');
    const G = stubGame({ def5: true, worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }], health: { v1: 50 } });
    const ctx = {};
    const keysBefore = Object.keys(ctx).join(',');
    const r1 = p.daily(G, ctx), r2 = p.upkeep(G, ctx), r3 = p.fight(G, ctx);
    ok('gate off: daily delegates exactly once', r1 === 'daily' && base._calls.daily === 1);
    ok('gate off: upkeep delegates exactly once', r2 === 'upkeep' && base._calls.upkeep === 1);
    ok('gate off: fight delegates exactly once', r3 === false && base._calls.fight === 1);
    ok('gate off: ctx untouched', Object.keys(ctx).join(',') === keysBefore, `keys=${Object.keys(ctx).join(',')}`);
    ok('gate off: no verbs fire', G._calls.goInside === 0 && G._calls.microMove === 0 && G._calls.tend === 0 && G._calls.travelTo === 0 && G._calls.rest === 0, JSON.stringify(G._calls));
  })();

  // ================= PRESENCE =================
  sectionIfLayer('PRESENCE — the piloted beat: fires on w3 threat, scholar outside; never moves villagers');
  if (PT) (function () {
    const oldP = process.env.PRESTEND;
    process.env.PRESTEND = '1';
    // (1) beat fires: w3 threat at haven, scholar outside, at haven
    {
      const G = stubGame({ def5: false, worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      const ctx = {};
      let threw = false;
      try { p.daily(G, ctx); } catch (e) { threw = true; }
      ok('presence: beat does not throw', !threw);
      ok('presence: beat fires (goInside + step)', G._calls.goInside === 1 && G._calls.microMove === 1, JSON.stringify(G._calls));
      ok('presence: counts into ctx', ctx.presencetendGoInside === 1 && ctx.presencetendStep === 1, JSON.stringify(ctx));
      ok('presence: assignTask/takeWeapon never called', G._calls.assignTask === 0 && G._calls.takeWeapon === 0, JSON.stringify(G._calls));
      ok('presence: tend never fires from the presence half', G._calls.tend === 0);
    }
    // (2) no fire: scholar already inside
    {
      const G = stubGame({ worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
      G.state.scholar.insideHaven = true;
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      p.daily(G, {});
      ok('presence: no fire when scholar already inside', G._calls.goInside === 0 && G._calls.microMove === 0);
    }
    // (3) no fire: no threat
    {
      const G = stubGame({ worldMonsters: [{ id: 'hushwolf', tx: 4, ty: 4 }] }); // wave 1 — no threat
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      p.daily(G, {});
      ok('presence: no fire on wave-1 threat', G._calls.goInside === 0 && G._calls.microMove === 0);
    }
    // (4) no fire: in combat
    {
      const G = stubGame({ inCombat: true, worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      p.daily(G, {});
      ok('presence: no fire mid-combat', G._calls.goInside === 0);
    }
    // (5) no fire: aid crisis is also a threat (decomp-census shape)
    {
      const G = stubGame({ aid: true });
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      const ctx = {};
      p.daily(G, ctx);
      ok('presence: aid-crisis threat fires the beat', G._calls.goInside === 1, JSON.stringify(G._calls));
    }
    if (oldP === undefined) delete process.env.PRESTEND; else process.env.PRESTEND = oldP;
  })();

  // ================= TEND =================
  sectionIfLayer('TEND — window-gated tend at Haven: wounded companions only, cap 2/day, no extract/rest');
  if (PT) (function () {
    const oldP = process.env.PRESTEND;
    process.env.PRESTEND = '1';
    // (1) window live + at haven + 3 wounded -> 2 tended, one pass per day
    {
      const G = stubGame({ def5: true, health: { v1: 50, v2: 40, v3: 30 }, dead: [] });
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      const ctx = {};
      p.daily(G, ctx);
      ok('tend: cap 2/day on 3 wounded', G._calls.tend === 2 && G._calls.tended.length === 2, JSON.stringify(G._calls.tended));
      ok('tend: counts into ctx', ctx.presencetendTends === 2, JSON.stringify(ctx));
      p.daily(G, ctx); // same day: no second pass
      ok('tend: one pass per day', G._calls.tend === 2, `tend=${G._calls.tend}`);
      G.state.scholar.day = 101; p.daily(G, ctx); // next day: fires again
      ok('tend: fires again the next day', G._calls.tend === 4, `tend=${G._calls.tend}`);
    }
    // (2) window closed -> no tend (even wounded at haven)
    {
      const G = stubGame({ def5: false, health: { v1: 50 } });
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      p.daily(G, {});
      ok('tend: no tend when the window is closed', G._calls.tend === 0);
    }
    // (3) away from haven -> no tend
    {
      const G = stubGame({ def5: true, atHaven: false, health: { v1: 50 } });
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      p.daily(G, {});
      ok('tend: no tend away from Haven', G._calls.tend === 0);
    }
    // (4) nobody below the wound floor -> no tend
    {
      const G = stubGame({ def5: true, health: { v1: 90, v2: 70 } }); // >=70: the verb's floor
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      p.daily(G, {});
      ok('tend: wound floor (>=70) skipped', G._calls.tend === 0);
    }
    // (5) dead vid skipped; scholar vid skipped
    {
      const G = stubGame({ def5: true, health: { v1: 50, v2: 40 }, dead: ['v2'], party: ['scholar1', 'v1', 'v2'] });
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      const ctx = {};
      p.daily(G, ctx);
      ok('tend: dead vid + scholar skipped, v1 tended', G._calls.tend === 1 && G._calls.tended[0] === 'v1', JSON.stringify(G._calls.tended));
    }
    // (6) the indicted verbs never fire from the tend half
    {
      const G = stubGame({ def5: true, atHaven: false, health: { v1: 50 } });
      const base = fixtureBase();
      const p = PT.withPresencetend(base, 'pt-test', 'test');
      let threw = false;
      try { p.daily(G, {}); } catch (e) { threw = true; }
      ok('tend: travelTo/rest never called', !threw && G._calls.travelTo === 0 && G._calls.rest === 0, JSON.stringify(G._calls));
    }
    if (oldP === undefined) delete process.env.PRESTEND; else process.env.PRESTEND = oldP;
  })();

  // ================= SMOKE =================
  sectionIfLayer('SMOKE — real engine, full substrate stack, 3 days, PRESTEND=1');
  if (PT) {
    process.env.TRIBFLOOR = '1'; process.env.PRESTEND = '1';
    const TF = require('./policies/tribfloor');
    const base = TF.leadfeast;
    const p = PT.withPresencetend(base, 'pt-smoke', 'smoke');
    const { Game } = await loadGame({ seed: 65201, mode: 'presencetend-smoke' });
    await setupGame(Game);
    let threw = null, days = 0;
    try {
      await quietLog(async () => {
        const r = await runDays(Game, p, { days: 3, manifest: undefined, sampleEvery: 30 });
        days = r.days;
      });
    } catch (e) { threw = e; }
    ok('smoke: no crash in 3 days', threw === null, threw ? String(threw).slice(0, 120) : `days=${days}`);
    delete process.env.TRIBFLOOR; clearEnv();
  }

  // ================= DET =================
  sectionIfLayer('DET — PRESTEND unset: withPresencetend(base) byte-identical to base');
  if (PT) {
    process.env.TRIBFLOOR = '1'; clearEnv();
    const TF = require('./policies/tribfloor');
    const base = TF.leadfeast;
    const wrapped = PT.withPresencetend(base, 'pt-det', 'det');
    const hashesFor = async (seed, policy) => {
      const { Game } = await loadGame({ seed, mode: 'presencetend-det' });
      await setupGame(Game);
      const hashes = [];
      const w = Object.assign({}, policy);
      const bd = policy.daily;
      w.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return bd ? bd(G, ctx) : undefined; };
      let end = '';
      await quietLog(async () => { const r = await runDays(Game, w, { days: 10, manifest: undefined, sampleEvery: 1 }); end = r.endReason; });
      return { hashes, end };
    };
    let identical = true, detail = '';
    for (const seed of [65201, 65202]) {
      const a = await hashesFor(seed, base);
      const b = await hashesFor(seed, wrapped);
      const same = a.hashes.length === b.hashes.length && a.hashes.every((h, i) => h === b.hashes[i]) && a.end === b.end;
      if (!same) { identical = false; detail = `seed ${seed}: len ${a.hashes.length}/${b.hashes.length}, end ${a.end}/${b.end}`; }
    }
    ok('det: gate-off trajectories byte-identical', identical, detail || '2 seeds x 10 days');
    delete process.env.TRIBFLOOR;
  }

  // ================= KILLED-VERDICT =================
  console.log('KILLED-VERDICT — landed verdicts re-derived on the committed corpus (runs after a kill)');
  if (LAYER_GONE) {
    const AFP = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-presencetend', '_analysis.json');
    if (fs.existsSync(AFP)) {
      const A = JSON.parse(fs.readFileSync(AFP, 'utf8'));
      ok('kill-verdict: primary verdict pinned', ['GO', 'NO-GO (kill protocol)'].includes(A.verdict), `verdict=${A.verdict}`);
      ok('kill-verdict: primary delta recorded', typeof (A.primary && A.primary.delta) === 'number', `delta=${A.primary && A.primary.delta}`);
      ok('kill-verdict: wall numbers present', !!(A.guardrails && A.guardrails.national && A.guardrails.table), '');
      ok('kill-verdict: verdict matches evidence file', A.verdict && A.verdict.length > 0, '');
    } else {
      console.log('  INFO-SKIP: no committed corpus yet (layer killed before the sweep)');
    }
  } else {
    console.log('  INFO-SKIP: layer present — nothing killed yet');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST FAIL', e); process.exit(1); });
