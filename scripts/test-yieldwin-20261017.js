#!/usr/bin/env node
// test-yieldwin-20261017.js — proof for scripts/policies/yieldwin.js
// (flesh-out loop, 2026-10-17, run fleshout-20261017-044712, axis
// scale-onramp, arm sim-yieldwin: deepen the vetrel yield window).
//
// RED->GREEN on the layer:
//   V1 gate honesty: YIELDWIN unset -> pure delegation (no yw ctx keys).
//   V2 YIELDWIN=1 without VETREL=1 -> pure delegation (vetrel required).
//   V3 companion-first: round-1 committed vet fight -> scholar holds
//      (tbPlayerWait), wrapper handles the turn, ywFirstBlood=1.
//   V4 early yield: veteran scholar, tgt at 35% maxHp, companion engaged ->
//      scholar holds, wrapper handles, ywYields=1.
//   V5 no yield above window: tgt at 45% -> delegates (scholar softens).
//   V6 no yield for non-veteran scholar -> delegates (needs own kill).
//   V7 anti-steal: window spent (6 holds), tgt within companion kill range ->
//      holds again, ywStealRefusals=1 (the scholar refuses the killing blow).
//   V8 close: window spent, tgt above kill range -> delegates AND exhausts
//      vetrel's yield counter (no second window).
//   V9 no hold when scholar hurting (hpPct<0.5) -> delegates.
//   V10 hurt companion -> delegates (survival owned by vetrel, not duplicated).
//   V11 det-gate (real harness): gate-off yieldwin-lead byte-identical to
//      vetrel-lead (60d); gate-on deterministic; gate-ON non-vacuous.
// Usage: node scripts/test-yieldwin-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');

// KILL-PROTOCOL INFO-SKIP (coordinator repair 2026-10-17, post-kill
// precedent): the layer was deleted per the kill protocol after the pilot
// PRIMARY NO-GO (armed 6 vs control 6 companionW3, ratio 1.0x; deepened
// yield never fired — evidence/2026-10-17/sim-yieldwin.md). With the
// layer gone the proof is not applicable: INFO-SKIP, exit 0.
if (!fs.existsSync(path.join(__dirname, 'policies', 'yieldwin.js'))) {
  console.log('INFO-SKIP: yieldwin layer deleted per kill protocol (sim-yieldwin PRIMARY NO-GO, evidence/2026-10-17/sim-yieldwin.md) — proof not applicable.');
  process.exit(0);
}

const YW = require('./policies/yieldwin');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- fabricated base (records delegation) ----------
function fakeBase() {
  const rec = { fightCalls: 0, dailyCalls: 0 };
  const base = {
    id: 'fakebase', desc: 'recording fake',
    daily(G, c) { rec.dailyCalls++; },
    fight(G, c) { rec.fightCalls++; return true; },
  };
  return { base, rec };
}

// ---------- fabricated Game with a live vet fight ----------
function stubGame(o) {
  o = o || {};
  const comps = o.comps || [{ id: 'v1', hp: 90, maxHp: 100, wbonus: 0 }];
  const fighters = [
    { key: 'p', kind: 'player', hp: o.scholarHp != null ? o.scholarHp : 100, maxHp: o.scholarMaxHp || 100, alive: true, fled: false },
  ];
  for (const c of comps) {
    fighters.push({
      key: 'v_' + c.id, kind: 'villager', villagerId: c.id,
      hp: c.hp != null ? c.hp : 90, maxHp: c.maxHp || 100,
      alive: true, fled: false, wbonus: c.wbonus || 0,
    });
  }
  fighters.push({
    key: 'm_0', kind: 'monster', monsterId: 'spool',
    hp: o.tgtHp != null ? o.tgtHp : 300, maxHp: o.tgtMaxHp || 300,
    alive: true, fled: false,
  });
  const G = {
    over: false,
    tbfight: { over: false, round: o.round != null ? o.round : 2, fighters },
    villagerId: 'scholar1',
    state: {
      scholar: { hp: 100, health: 100, day: 100, kcal: 500, exiled: false },
      village: { roster: ['scholar1'].concat(comps.map(c => c.id)) },
      // veteran scholar iff the log holds a wave-3+ kill by the scholar
      waveKillLog: o.scholarVet === false ? [] : [{ by: 'scholar1', w: 3 }],
    },
    data: { monsters: [{ id: 'spool', wave: 3 }], items: [] },
    _party: comps.map(c => c.id),
    _waited: 0,
    unlockedWave: () => 3,
    waveCombatReadiness: () => ({ veterans: 0, demand: { veterans: 2 } }), // bar unmet
    partyMembers: function () { return this._party.slice(); },
    tbIsPlayerTurn: () => true,
    tbFighter: (k) => fighters.find(f => f.key === k),
    tbPlayerWait: function () { this._waited++; },
  };
  return G;
}
function stubCtx() { return {}; }
function withEnv(fn) {
  const oldV = process.env.VETREL, oldY = process.env.YIELDWIN;
  process.env.VETREL = '1'; process.env.YIELDWIN = '1';
  try { return fn(); } finally {
    if (oldV === undefined) delete process.env.VETREL; else process.env.VETREL = oldV;
    if (oldY === undefined) delete process.env.YIELDWIN; else process.env.YIELDWIN = oldY;
  }
}

// V1: gate honesty — YIELDWIN unset -> pure delegation, ctx untouched.
{
  delete process.env.YIELDWIN; process.env.VETREL = '1';
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v1', 't');
  const G = stubGame({}); const ctx = stubCtx();
  const r = w.fight(G, ctx);
  check('V1 gate-off (YIELDWIN unset): pure delegation',
    r === true && rec.fightCalls === 1 && G._waited === 0 &&
    ctx._ywState === undefined && ctx.ywYields === undefined && ctx.ywFirstBlood === undefined,
    `delegated=${rec.fightCalls} waited=${G._waited}`);
  delete process.env.VETREL;
}

// V2: YIELDWIN=1 without VETREL=1 -> pure delegation (vetrel required).
{
  process.env.YIELDWIN = '1'; delete process.env.VETREL;
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v2', 't');
  const G = stubGame({}); const ctx = stubCtx();
  w.fight(G, ctx);
  check('V2 YIELDWIN=1 without VETREL=1: pure delegation',
    rec.fightCalls === 1 && G._waited === 0 && ctx._ywState === undefined,
    `delegated=${rec.fightCalls}`);
  delete process.env.YIELDWIN;
}

// V3: companion-first — round 1, fresh fight -> scholar holds once.
withEnv(() => {
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v3', 't');
  const G = stubGame({ round: 1 }); const ctx = stubCtx();
  const r = w.fight(G, ctx);
  check('V3 companion-first: round-1 hold, wrapper handles',
    r === true && G._waited === 1 && rec.fightCalls === 0 && ctx.ywFirstBlood === 1,
    `waited=${G._waited} delegated=${rec.fightCalls} firstBlood=${ctx.ywFirstBlood}`);
  // second player turn of the SAME fight (same tbfight object): no second first-hold
  const waitedBefore = G._waited;
  w.fight(G, ctx);
  check('V3b companion-first fires once per fight', ctx.ywFirstBlood === 1 && G._waited === waitedBefore,
    `firstBlood=${ctx.ywFirstBlood} extraWaits=${G._waited - waitedBefore}`);
});

// V3c: the companion-first hold mirrors vetrel's veteran-aware commit
// (its fight() doesn't run on the hold turn — no stale _huntCommit).
withEnv(() => {
  const { base } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v3c', 't');
  const Gv = stubGame({ round: 1 }); const ctxv = stubCtx(); ctxv._huntCommit = 'STALE';
  w.fight(Gv, ctxv);
  const Gn = stubGame({ round: 1, scholarVet: false }); const ctxn = stubCtx(); ctxn._huntCommit = 'STALE';
  w.fight(Gn, ctxn);
  check('V3c companion-first mirrors hunt commit (vet=false, nonvet=true)',
    ctxv._huntCommit === false && ctxn._huntCommit === true,
    `vet=${ctxv._huntCommit} nonvet=${ctxn._huntCommit}`);
});

// V4: early yield — veteran scholar, tgt at 35% -> holds.
withEnv(() => {
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v4', 't');
  const G = stubGame({ round: 2, tgtHp: 105, tgtMaxHp: 300 }); // 35% — above vetrel's 20%, inside yieldwin's 40%
  const ctx = stubCtx();
  const r = w.fight(G, ctx);
  check('V4 early yield at 35%: scholar holds (tbPlayerWait)',
    r === true && G._waited === 1 && rec.fightCalls === 0 && ctx.ywYields === 1,
    `waited=${G._waited} yields=${ctx.ywYields}`);
});

// V5: no yield above the window — tgt at 45% -> delegates (soften).
withEnv(() => {
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v5', 't');
  const G = stubGame({ round: 3, tgtHp: 135, tgtMaxHp: 300 }); // 45% > 40% window
  const ctx = stubCtx();
  w.fight(G, ctx);
  check('V5 above window (45%): delegates, scholar softens',
    rec.fightCalls === 1 && G._waited === 0 && (ctx.ywYields || 0) === 0,
    `delegated=${rec.fightCalls}`);
});

// V6: non-veteran scholar -> no yield (needs own kill), delegates.
withEnv(() => {
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v6', 't');
  const G = stubGame({ round: 3, tgtHp: 60, tgtMaxHp: 300, scholarVet: false }); // 20%: vetrel would yield, non-vet must not
  const ctx = stubCtx();
  w.fight(G, ctx);
  check('V6 non-veteran scholar: no yield, delegates',
    rec.fightCalls === 1 && G._waited === 0 && (ctx.ywYields || 0) === 0,
    `delegated=${rec.fightCalls}`);
});

// between-turn companion chips (the stub doesn't simulate combat): the
// monster takes damage on the companions' intervening turns, which is
// what resets the stall counter on the real engine.
function chip(G, dmg) {
  const m = G.tbfight.fighters.find(f => f.key === 'm_0');
  if (m) m.hp = Math.max(1, m.hp - dmg);
}

// V7: anti-steal — 6 holds spent, tgt within companion kill range -> holds.
withEnv(() => {
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v7', 't');
  // one companion, wbonus 0 -> E=6, killRange=12; start at 60 HP, chip 8/turn
  const G = stubGame({ round: 3, tgtHp: 60, tgtMaxHp: 300, comps: [{ id: 'v1', hp: 90, maxHp: 100, wbonus: 0 }] });
  const ctx = stubCtx();
  for (let i = 0; i < 6; i++) { const r = w.fight(G, ctx); if (!r) break; chip(G, 8); }
  const holdsBefore = ctx.ywYields || 0;
  // monster now at 12 HP: in window (<=120) and within kill range (<=12)
  const r7 = w.fight(G, ctx); // 7th: window spent, tgt <= killRange -> anti-steal hold
  check('V7 anti-steal: 7th turn holds, steal refused',
    holdsBefore === 6 && r7 === true && ctx.ywStealRefusals === 1 && rec.fightCalls === 0,
    `holds=${holdsBefore} refusals=${ctx.ywStealRefusals} delegated=${rec.fightCalls}`);
});

// V8: close — 6 holds spent, tgt above kill range -> delegates + exhausts vetrel's counter.
withEnv(() => {
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v8', 't');
  // start at 100 HP, chip 8/turn -> 52 HP after 6 holds: in window, above killRange
  const G = stubGame({ round: 3, tgtHp: 100, tgtMaxHp: 300, comps: [{ id: 'v1', hp: 90, maxHp: 100, wbonus: 0 }] });
  const ctx = stubCtx();
  for (let i = 0; i < 6; i++) { w.fight(G, ctx); chip(G, 8); }
  w.fight(G, ctx); // 7th: closes the window
  const exhausted = ctx._vetYieldState && ctx._vetYieldState.turns >= 99;
  check('V8 window close: delegates and exhausts vetrel yield counter',
    rec.fightCalls === 1 && exhausted && (ctx.ywStealRefusals || 0) === 0,
    `delegated=${rec.fightCalls} vetrelExhausted=${!!exhausted}`);
  // 8th turn: stays closed — no re-hold
  const waitedBefore = G._waited;
  w.fight(G, ctx);
  check('V8b closed window stays closed', G._waited === waitedBefore && rec.fightCalls === 2,
    `extraWaits=${G._waited - waitedBefore}`);
});

// V9: scholar hurting (hpPct<0.5) -> no hold, delegates.
withEnv(() => {
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v9', 't');
  const G = stubGame({ round: 3, tgtHp: 60, tgtMaxHp: 300, scholarHp: 40, scholarMaxHp: 100 });
  const ctx = stubCtx();
  w.fight(G, ctx);
  check('V9 scholar hurting: no hold, delegates',
    rec.fightCalls === 1 && G._waited === 0, `delegated=${rec.fightCalls}`);
});

// V10: hurt companion -> delegates (survival owned by vetrel).
withEnv(() => {
  const { base, rec } = fakeBase();
  const w = YW.withYieldWin(base, 'yw-v10', 't');
  const G = stubGame({ round: 3, tgtHp: 60, tgtMaxHp: 300, comps: [{ id: 'v1', hp: 30, maxHp: 100, wbonus: 0 }] }); // 30% < 40%
  const ctx = stubCtx();
  w.fight(G, ctx);
  check('V10 hurt companion: delegates to vetrel survival',
    rec.fightCalls === 1 && G._waited === 0, `delegated=${rec.fightCalls}`);
});

console.log(`\nfixtures: ${pass} pass, ${fail} fail`);
if (fail) { process.exit(1); }

// V11: det-gate (real harness).
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const VR = require('./policies/vetrel');
  async function trajectory(seed, env, policyObj) {
    if (env.vetrel) process.env.VETREL = '1'; else delete process.env.VETREL;
    if (env.yieldwin) process.env.YIELDWIN = '1'; else delete process.env.YIELDWIN;
    process.env.SEATDRIVE = '0';
    process.env.FEASTSCALE_R13 = '1';
    const { Game } = await loadGame({ seed, mode: 'yieldwin-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const base = policyObj;
    const oDaily = base.daily;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  // gate-off: YIELDWIN unset, VETREL=1 — yieldwin-lead must be byte-identical to vetrel-lead.
  const tOff1 = await trajectory(204, { vetrel: true, yieldwin: false }, YW.yieldwinLead);
  const tOff2 = await trajectory(204, { vetrel: true, yieldwin: false }, VR.vetrelLead);
  check('V11a det-gate: gate-off yieldwin-lead byte-identical to vetrel-lead (s204)',
    tOff1 === tOff2 && tOff1.length > 0, `len=${tOff1.length}`);
  const tOff3 = await trajectory(315, { vetrel: true, yieldwin: false }, YW.yieldwinBelong);
  const tOff4 = await trajectory(315, { vetrel: true, yieldwin: false }, VR.vetrelBelong);
  check('V11b det-gate: gate-off yieldwin-belong byte-identical to vetrel-belong (s315)',
    tOff3 === tOff4 && tOff3.length > 0, `len=${tOff3.length}`);
  // gate-on deterministic.
  const tOn1 = await trajectory(204, { vetrel: true, yieldwin: true }, YW.yieldwinLead);
  const tOn2 = await trajectory(204, { vetrel: true, yieldwin: true }, YW.yieldwinLead);
  check('V11c det-gate: gate-on deterministic (identical armed 60d)', tOn1 === tOn2 && tOn1.length > 0);
  // gate-ON non-vacuous on the real harness: the armed trajectory must move
  // on at least one of three seeds (differs from its own gate-off twin).
  // (Stub fixtures V3/V4/V7 already prove the mechanics; this proves they
  // fire in the wild. Per-seed results are logged honestly.)
  let engagedSeeds = 0;
  for (const s of [204, 315, 122]) {
    const off = await trajectory(s, { vetrel: true, yieldwin: false }, YW.yieldwinBelong);
    const on = await trajectory(s, { vetrel: true, yieldwin: true }, YW.yieldwinBelong);
    const moved = on !== off && on.length > 0 && off.length > 0;
    if (moved) engagedSeeds++;
    console.log(`  info V11d seed s${s}: ${moved ? 'ENGAGED (armed != gate-off)' : 'no divergence in 60d'}`);
  }
  check('V11d det-gate: gate-ON engages on real fights (>=1 of 3 seeds diverges)',
    engagedSeeds >= 1, `engaged=${engagedSeeds}/3`);

  delete process.env.VETREL;
  delete process.env.YIELDWIN;
  try { delete globalThis.Scattering; } catch (e) {}
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
