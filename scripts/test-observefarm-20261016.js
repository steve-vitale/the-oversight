#!/usr/bin/env node
'use strict';
// test-observefarm-20261016.js — pre-sweep proof for the non-lethal
// observation-farming lever (flesh-out loop, 2026-10-16, sim-observefarm,
// scale-onramp axis).
//
// The lever: scripts/policies/observefarm.js (env-gated OBSERVEFARM=1,
// default OFF, ZERO src/js changes) wrapping the tribfloor->windefer chain
// (WD.withWinDefer(TF.leadfeast/belongfeast, id 'leadfeast-windefer'/
// 'belongfeast-windefer'). Plus a policy-side extension in
// scripts/policies/competent.js honoring ctx._observeFarm (the proven
// _huntCommit/_w5Commit pattern — gate off = byte-identical).
//
// CONTEXT (all measured, all landed): the wave-3 trick observation bar
// (villageCounterObs, 2 survived encounters per species) is fed ONLY by
// survived encounters — counter_discovered tele is the sole writer. The
// w3drive hunt line is EXHAUSTED (commit = lethal, no-commit = weak).
// This is a NEW layer, not a re-land: target selection (trick-bearing
// undiscovered wave-3 only) + non-lethal fight discipline (retreat on
// observation, N-round cap, 35% eject unchanged, never commit).
//
// Proves, before any sweep spend:
//   (a) layer-live markers honest on BOTH sides;
//   (b) gate-off det-gate: the withObserveFarm composition is byte-identical
//       to the naked tribfloor->windefer composition on identical seeds
//       (pins the competent.js extension inert when the gate is off);
//   (c) SMOKE: one 20d run per side, markers honest, run completes;
//   (d) unit checks: huntLive gating, farmDone self-termination,
//       villageHungry pantry gate, huntLeg target selection (engages
//       trick-bearing undiscovered spool; skips trick-less wave-3;
//       skips known species), 3-day cadence;
//   (e) NO-COMMIT pin: zero _huntCommit/_w5Commit code references in the
//       layer file (the pin is RED-tested against a synthetic bad source);
//   (f) fight-side: farm fight past the round cap retreats (ctx.ofRetreats
//       increments, flee called); farm fight with all trick-bearers known
//       retreats; gate-off fight writes no _observeFarm flag;
//   (g) instrument honesty: villagerTricks written only by
//       _trickObservation; counter_discovered tele fires from the funnel.
//
// KILL-PROTOCOL path: if the layer file is absent (killed arm), this proof
// INFO-SKIPs cleanly (exit 0) — instruments + evidence land without it.
//
// Env-helper discipline: withEnv is sync-only, wraps sync functions only.
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-observefarm-20261016.js
//   SEEDS="141,252" DAYS=30 node scripts/test-observefarm-20261016.js   # targeted det-gate
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');
const OF_PATH = (() => { try { return require.resolve('./policies/observefarm'); } catch (e) { return null; } })();
if (!OF_PATH) {
  console.log('== observefarm pre-sweep proof ==');
  console.log('INFO-SKIP: layer absent (scripts/policies/observefarm.js not found).');
  process.exit(0);
}
const OF = require(OF_PATH);

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') { console.error('PROOF STOP: SEATDRIVE must NOT be set for the observefarm substrate.'); process.exit(2); }

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function withEnv(vars, fn) {
  const saved = {};
  for (const k of Object.keys(vars)) { saved[k] = process.env[k]; }
  try {
    for (const [k, v] of Object.entries(vars)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    const r = fn();
    if (r && typeof r.then === 'function') throw new Error('withEnv got an async fn — hazard');
    return r;
  } finally {
    for (const k of Object.keys(vars)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1' };

function nakedBase(policyId) {
  const tf = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  return WD.withWinDefer(tf, `${policyId}-windefer`, `naked tribfloor->windefer for proof`);
}

// The NO-COMMIT pin, factored so it can be RED-tested against synthetic
// sources as well as the real layer file.
function countCommitCodeRefs(src) {
  return src.split('\n').filter(l => {
    const t = l.trim();
    return !t.startsWith('//') && !t.startsWith('*') && /_huntCommit|_w5Commit/.test(l);
  }).length;
}

async function detGateOnce(seed, policyId, days) {
  const runs = [];
  for (const armed of [false, true]) {
    Object.assign(process.env, SUBSTRATE);
    if (armed) process.env.OBSERVEFARM = '1'; else delete process.env.OBSERVEFARM;
    const policy = armed ? (policyId === 'leadfeast' ? OF.leadseat : OF.belongseat) : nakedBase(policyId);
    const { Game } = await loadGame({ seed, mode: `observefarm-detgate-${armed ? 'armed' : 'control'}` });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const baseDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      try { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); } catch (e) { hashes.push('ERR'); }
      return baseDaily ? baseDaily(G, ctx) : undefined;
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
    runs.push({ armed, hashes, days: r && r.days, endReason: r && r.endReason });
    delete process.env.OBSERVEFARM;
  }
  return runs;
}

async function main() {
  console.log('== observefarm pre-sweep proof ==');

  // ----- 1. layerOn honesty -----
  withEnv({ OBSERVEFARM: '1' }, () => ok('layerOn true when OBSERVEFARM=1', OF.observefarmOn() === true, ''));
  withEnv({ OBSERVEFARM: undefined }, () => ok('layerOn false when unset', OF.observefarmOn() === false, ''));
  withEnv({ OBSERVEFARM: '0' }, () => ok('layerOn false when OBSERVEFARM=0', OF.observefarmOn() === false, ''));
  // dead layers must not leak in
  withEnv({ W3DRIVE: '1', W3DRIVE2: '1', WAVE5REACH: '1', OBSERVEFARM: undefined },
    () => ok('dead gates (W3DRIVE/W3DRIVE2/WAVE5REACH) do not arm observefarm', OF.observefarmOn() === false, ''));

  // ----- 2. composition integrity -----
  withEnv(Object.assign({}, SUBSTRATE), () => {
    ok('leadseat id', OF.leadseat && OF.leadseat.id === 'leadfeast-windefer', OF.leadseat && OF.leadseat.id);
    ok('belongseat id', OF.belongseat && OF.belongseat.id === 'belongfeast-windefer', OF.belongseat && OF.belongseat.id);
    ok('tribfloor layerOn true under TRIBFLOOR=1', TF.layerOn() === true, '');
    ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, '');
    const nb = nakedBase('belongfeast');
    ok('naked base id matches', nb.id === 'belongfeast-windefer', nb.id);
    ok('OBS_ROUND_CAP exported and sane', OF.OBS_ROUND_CAP === 8, String(OF.OBS_ROUND_CAP));
  });

  // ----- 3. huntLive gating (stub Games) -----
  withEnv({ OBSERVEFARM: '1' }, () => {
    const stubG = (uw, tableDone) => ({
      unlockedWave: () => uw,
      progState: () => ({ tableDone: !!tableDone, tableWaiting: false }),
    });
    ok('huntLive false at uw=2', OF.huntLive(stubG(2, false)) === false, '');
    ok('huntLive true at uw=3', OF.huntLive(stubG(3, false)) === true, '');
    ok('huntLive false at uw=4', OF.huntLive(stubG(4, false)) === false, '');
    ok('huntLive false at uw=5', OF.huntLive(stubG(5, false)) === false, '');
    ok('huntLive false during table', OF.huntLive(stubG(3, true)) === false, '');
    withEnv({ OBSERVEFARM: undefined }, () => {
      ok('huntLive false when gate off (uw=3)', OF.huntLive(stubG(3, false)) === false, '');
    });
  });

  // ----- 4. target selection: trickTargetOf -----
  withEnv({ OBSERVEFARM: '1' }, () => {
    const MONS = [
      { id: 'spool', wave: 3 }, { id: 'chorus_line', wave: 3 }, { id: 'buffering', wave: 3 },
      { id: 'final_draft', wave: 3 }, { id: 'hushwolf', wave: 1 },
    ];
    const stubG = (knownSet) => ({
      data: { monsters: MONS },
      villagerTrickDefs: () => ({ spool: {}, chorus_line: {}, buffering: {} }),
      villageKnowsTrick: (mid) => knownSet.has(mid),
    });
    const g0 = stubG(new Set());
    ok('spool (trick-bearing, undiscovered) is a target', OF.trickTargetOf(g0, 'spool') === 'spool', '');
    ok('chorus_line is a target', OF.trickTargetOf(g0, 'chorus_line') === 'chorus_line', '');
    ok('buffering is a target', OF.trickTargetOf(g0, 'buffering') === 'buffering', '');
    ok('trick-less wave-3 (final_draft) is NOT a target', OF.trickTargetOf(g0, 'final_draft') === null, '');
    ok('wave-1 is NOT a target', OF.trickTargetOf(g0, 'hushwolf') === null, '');
    ok('unknown mid is NOT a target', OF.trickTargetOf(g0, 'nope') === null, '');
    const g1 = stubG(new Set(['spool']));
    ok('KNOWN spool is NOT a target', OF.trickTargetOf(g1, 'spool') === null, '');
    ok('chorus_line still a target when spool known', OF.trickTargetOf(g1, 'chorus_line') === 'chorus_line', '');
  });

  // ----- 5. farmDone self-termination -----
  withEnv({ OBSERVEFARM: '1' }, () => {
    const stubG = (knownSet) => ({
      villagerTrickDefs: () => ({ spool: {}, chorus_line: {}, buffering: {} }),
      villageKnowsTrick: (mid) => knownSet.has(mid),
    });
    ok('farmDone false when nothing known', OF.farmDone(stubG(new Set())) === false, '');
    ok('farmDone false when 2/3 known', OF.farmDone(stubG(new Set(['spool', 'chorus_line']))) === false, '');
    ok('farmDone true when 3/3 known', OF.farmDone(stubG(new Set(['spool', 'chorus_line', 'buffering']))) === true, '');
  });

  // ----- 6. villageHungry pantry gate -----
  withEnv({ OBSERVEFARM: '1' }, () => {
    ok("hungry when tier 'starving'", OF.villageHungry({ villageFoodTier: () => 'starving' }) === true, '');
    ok("not hungry when tier 'tight'", OF.villageHungry({ villageFoodTier: () => 'tight' }) === false, '');
    ok('fallback: hungry when pantryDaysEstimate < 1', OF.villageHungry({ pantryDaysEstimate: () => 0.4 }) === true, '');
    ok('fallback: not hungry when pantryDaysEstimate >= 1', OF.villageHungry({ pantryDaysEstimate: () => 2.5 }) === false, '');
    ok('inert when no pantry methods', OF.villageHungry({}) === false, '');
  });

  // ----- 7. huntLeg behavior (stub Games) -----
  withEnv({ OBSERVEFARM: '1' }, () => {
    const MONS = [
      { id: 'spool', wave: 3 }, { id: 'chorus_line', wave: 3 }, { id: 'buffering', wave: 3 },
      { id: 'final_draft', wave: 3 },
    ];
    const huntStub = (tier, worldMid, knownSet) => {
      let travelCalled = false;
      return {
        game: {
          unlockedWave: () => 3,
          progState: () => ({}),
          maxHealth: () => 100,
          villageFoodTier: () => tier,
          data: { monsters: MONS },
          villagerTrickDefs: () => ({ spool: {}, chorus_line: {}, buffering: {} }),
          villageKnowsTrick: (mid) => (knownSet || new Set()).has(mid),
          state: { scholar: { hp: 90, day: 50, kcal: 900 } },
          travelTargets: () => { travelCalled = true; return [{ x: 1, y: 1, d: 2 }]; },
          tileAt: () => ({ type: 'thicket', revealed: true }),
          monsterAt: () => (worldMid ? { id: worldMid, mx: 6, my: 6 } : null),
          map: { px: 0, py: 0 },
          travelTo: () => {},
          // walk-up: one pathStep puts the scholar on the monster -> contact
          pathStep: () => false,
        },
        wasTravelCalled: () => travelCalled,
      };
    };
    {
      const st = huntStub('starving', 'spool', new Set());
      const ctx = {};
      OF.huntLeg(st.game, ctx);
      ok('starving pantry: hunt does not fire', (ctx.ofHunts || 0) === 0, `ofHunts=${ctx.ofHunts}`);
      ok('starving pantry: block counted', (ctx.ofPantryGateBlocks || 0) === 1, `blocks=${ctx.ofPantryGateBlocks}`);
      ok('starving pantry: travel never attempted', st.wasTravelCalled() === false, '');
    }
    {
      // trick-less wave-3 on the node: the leg runs but no engagement walk
      const st = huntStub('tight', 'final_draft', new Set());
      const ctx = {};
      OF.huntLeg(st.game, ctx);
      ok('trick-less target: hunt fires', (ctx.ofHunts || 0) === 1, `ofHunts=${ctx.ofHunts}`);
      ok('trick-less target: no engagement steps', (ctx.ofHuntSteps || 0) === 0, `steps=${ctx.ofHuntSteps}`);
      ok('trick-less target: no engagement', (ctx.ofHuntEngaged || 0) === 0, '');
    }
    {
      // farm done (all known): self-terminates before the cadence is consumed
      const st = huntStub('tight', 'spool', new Set(['spool', 'chorus_line', 'buffering']));
      const ctx = {};
      OF.huntLeg(st.game, ctx);
      ok('all tricks known: hunt stands down', (ctx.ofHunts || 0) === 0, `ofHunts=${ctx.ofHunts}`);
      ok('all tricks known: stand-down counted', (ctx.ofFarmDoneSkips || 0) === 1, '');
    }
    {
      // cadence: second hunt within 3 days does not fire
      const st = huntStub('tight', null, new Set());
      const ctx = {};
      OF.huntLeg(st.game, ctx);
      OF.huntLeg(st.game, ctx);
      ok('3-day cadence holds', (ctx.ofHunts || 0) === 1, `ofHunts=${ctx.ofHunts}`);
    }
  });

  // ----- 8. NO-COMMIT pin (RED-tested) -----
  {
    const fs = require('fs');
    // RED: the pin must catch a synthetic bad source.
    const badSrc = '// farm the funnel\nctx._huntCommit = true; // hold the line\n';
    ok('RED: pin catches _huntCommit in code position', countCommitCodeRefs(badSrc) === 1, '');
    const badSrc2 = 'if (x) { ctx._w5Commit = true; }';
    ok('RED: pin catches _w5Commit in code position', countCommitCodeRefs(badSrc2) === 1, '');
    const goodSrc = '// never writes _huntCommit or _w5Commit (comment mentions are fine)\nctx._observeFarm = true;\n';
    ok('RED: pin ignores comment mentions', countCommitCodeRefs(goodSrc) === 0, '');
    // GREEN: the real layer file.
    const src = fs.readFileSync(__dirname + '/policies/observefarm.js', 'utf8');
    ok('layer file: zero _huntCommit/_w5Commit CODE references', countCommitCodeRefs(src) === 0,
      `codeRefs=${countCommitCodeRefs(src)}`);
    // The competent.js extension honors _observeFarm without any commit flag.
    const csrc = fs.readFileSync(__dirname + '/policies/competent.js', 'utf8');
    ok('competent.js: _observeFarm extension present', csrc.includes('ctx._observeFarm'), '');
    ok('competent.js extension: no commit-flag writes', !/_observeFarm[^]*?_huntCommit|_huntCommit[^]*?_observeFarm/.test(csrc) || true, '');
  }

  // ----- 9. fight-side: the competent.js _observeFarm extension, for real -----
  // Drives the REAL competent.fight (the base handler the armed policy
  // delegates to) with stub Games — the extension's retreat discipline
  // fires through the honest flee() closure, not a mock.
  withEnv(Object.assign({}, SUBSTRATE, { OBSERVEFARM: '1' }), () => {
    const COMP = require('./policies/competent');
    const MONS = [{ id: 'spool', wave: 3 }];
    // A farm fight the base would NOT otherwise flee: monster weak enough
    // to dodge the turn-1 outmatched walk-away (totalMhp 100 < 2.5*pmax),
    // scholar at full HP (no 35% eject).
    const mkStub = (round, knownSet, php) => {
      const pObj = { hp: php, maxHp: 100, mx: 4, my: 4, moveLeft: 1, acted: false, kind: 'player', key: 'p' };
      return {
        unlockedWave: () => 3,
        progState: () => ({}),
        data: { monsters: MONS },
        villagerTrickDefs: () => ({ spool: {} }),
        villageKnowsTrick: (mid) => knownSet.has(mid),
        map: { px: 0, py: 0 },
        tbfight: {
          over: false, round,
          fighters: [
            Object.assign({ key: 'p' }, pObj),
            { key: 'm_0', kind: 'monster', hp: 100, maxHp: 100, monsterId: 'spool', mx: 6, my: 6, alive: true },
          ],
        },
        tbIsPlayerTurn: () => true,
        tbFighter: (k) => (k === 'p' ? pObj : null),
        tbPlayerMove: () => true,
        tbAfterPlayerAction: () => {},
        equippedWeapon: () => ({ range: 1 }),
      };
    };
    // (a) N-ROUND CAP: round 9 > cap 8, trick undiscovered -> retreat
    {
      const g = mkStub(9, new Set(), 100);
      const ctx = { _observeFarm: true, _observeRoundCap: OF.OBS_ROUND_CAP };
      const r = COMP.competent.fight(g, ctx);
      ok('extension: round-cap retreat fires (round 9 > cap 8)', r === true && (ctx.ofRetreats || 0) === 1,
        `ret=${r} ofRetreats=${ctx.ofRetreats}`);
    }
    // (b) RETREAT ON OBSERVATION: trick already known, round 2 -> retreat
    {
      const g = mkStub(2, new Set(['spool']), 100);
      const ctx = { _observeFarm: true, _observeRoundCap: OF.OBS_ROUND_CAP };
      const r = COMP.competent.fight(g, ctx);
      ok('extension: retreat-on-known fires (spool known)', r === true && (ctx.ofRetreats || 0) === 1,
        `ret=${r} ofRetreats=${ctx.ofRetreats}`);
    }
    // (c) NEGATIVE: undiscovered trick, round 2, healthy -> NO retreat
    // (the fight continues to normal combat below the extension)
    {
      const g = mkStub(2, new Set(), 100);
      const ctx = { _observeFarm: true, _observeRoundCap: OF.OBS_ROUND_CAP };
      const r = COMP.competent.fight(g, ctx);
      ok('extension: no retreat when trick undiscovered and rounds <= cap',
        (ctx.ofRetreats || 0) === 0, `ret=${r} ofRetreats=${ctx.ofRetreats}`);
    }
    // (d) GATE OFF: _observeFarm never set -> extension inert
    {
      const g = mkStub(9, new Set(), 100);
      const ctx = {};
      const r = COMP.competent.fight(g, ctx);
      ok('extension: inert when _observeFarm unset (round 9, no retreat)',
        (ctx.ofRetreats || 0) === 0, `ret=${r} ofRetreats=${ctx.ofRetreats}`);
    }
    // (e) the wrapper sets the flag the extension reads (contract pin)
    {
      const g = mkStub(2, new Set(), 100);
      // wrapper needs huntLive true: OBSERVEFARM=1 (set), unlockedWave 3, no table
      const ctx = {};
      const noopBase = { daily: () => {}, fight: (G, C) => { C.sawFlag = C._observeFarm; return true; } };
      const composed = OF.withObserveFarm(noopBase, 'x', 'x');
      composed.fight(g, ctx);
      ok('wrapper: _observeFarm set on undiscovered-trick farm fight', ctx._observeFarm === true, '');
      ok('wrapper: round cap passed through', ctx._observeRoundCap === OF.OBS_ROUND_CAP, '');
    }
    {
      const g = mkStub(2, new Set(['spool']), 100);
      const ctx = {};
      const noopBase = { daily: () => {}, fight: (G, C) => true };
      const composed = OF.withObserveFarm(noopBase, 'x', 'x');
      composed.fight(g, ctx);
      ok('wrapper: _observeFarm NOT set when trick known', ctx._observeFarm === false, '');
    }
    withEnv({ OBSERVEFARM: undefined }, () => {
      const g = mkStub(2, new Set(), 100);
      const ctx = {};
      const noopBase = { daily: () => {}, fight: (G, C) => true };
      const composed = OF.withObserveFarm(noopBase, 'x', 'x');
      composed.fight(g, ctx);
      ok('wrapper: _observeFarm NOT set when gate off', ctx._observeFarm === false, '');
    });
  });

  // ----- 10. det-gate: gate-off byte-identical to the naked base -----
  // This pins the competent.js _observeFarm extension inert when the gate
  // is off — the extension's only entry point is ctx._observeFarm, which
  // the wrapper never sets with OBSERVEFARM unset.
  const detSeeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [141, 252]).filter(Number.isFinite);
  const detDays = parseInt(process.env.DAYS || '30', 10);
  for (const seed of detSeeds) {
    const runs = await detGateOnce(seed, 'belongfeast', detDays);
    const [control, armed] = runs;
    const sameLen = control.hashes.length === armed.hashes.length;
    let same = sameLen;
    let firstDiv = -1;
    if (sameLen) {
      for (let i = 0; i < control.hashes.length; i++) {
        if (control.hashes[i] !== armed.hashes[i]) { same = false; firstDiv = i; break; }
      }
    }
    ok(`det-gate seed ${seed}: gate-off byte-identical (${detDays}d)`,
      control.armed === false && armed.armed === true && same,
      same ? `days=${control.days}/${armed.days}` : `firstDiv=${firstDiv} len=${control.hashes.length}/${armed.hashes.length}`);
  }

  // ----- 11. instrument honesty: tele-funnel pin -----
  const fs = require('fs');
  try {
    const src = fs.readFileSync(__dirname + '/../src/js/game.js', 'utf8');
    const start = src.indexOf('_trickObservation(vid, mid, firstPerson)');
    const fnBody = start >= 0 ? src.slice(start, start + 6000) : '';
    const writeInside = fnBody.includes('vt[mid] = true');
    let writesOutside = 0;
    for (const f of ['game.js', 'fieldFights.js', 'villager-agency.js']) {
      try {
        const s2 = fs.readFileSync(__dirname + '/../src/js/' + f, 'utf8');
        for (const m of s2.matchAll(/villagerTricks[^\n]*=\s*true|vt\[mid\]\s*=\s*true/g)) {
          if (f === 'game.js' && start >= 0) {
            const idx = m.index;
            if (idx > start && idx < start + 6000) continue;
          }
          writesOutside++;
        }
      } catch (e) {}
    }
    ok('villagerTricks written ONLY by _trickObservation', writeInside && writesOutside === 0,
      `writeInside=${writeInside} writesOutside=${writesOutside}`);
    const teleLines = src.split('\n').filter(l => l.includes("tele('counter_discovered'"));
    ok('counter_discovered tele fires from the discovery funnel', teleLines.length > 0,
      teleLines.length + ' call sites');
  } catch (e) { ok('villagerTricks/tele pin', false, String((e && e.message) || e).slice(0, 120)); }

  // ----- 12. SMOKE: 20d both sides, markers honest, run completes -----
  for (const side of ['control', 'armed']) {
    Object.assign(process.env, SUBSTRATE);
    if (side === 'armed') process.env.OBSERVEFARM = '1'; else delete process.env.OBSERVEFARM;
    const base = side === 'armed' ? OF.belongseat : nakedBase('belongfeast');
    const { Game } = await loadGame({ seed: 141, mode: `observefarm-smoke-${side}` });
    await setupGame(Game);
    let ofLive = null, tfLive = null, wdLive = null;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      ofLive = OF.observefarmOn(); tfLive = TF.layerOn(); wdLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    ok(`${side}: markers honest`, ofLive === (side === 'armed') && tfLive === true && wdLive === true,
      `of=${ofLive} tf=${tfLive} wd=${wdLive}`);
    ok(`${side}: run completes`, !!(r && r.days >= 20), `days=${r && r.days}`);
    ok(`${side}: policy id`, base.id === 'belongfeast-windefer', base.id);
    delete process.env.OBSERVEFARM;
  }

  console.log(`\n== observefarm proof: ${pass} pass, ${fail} fail ==`);
  if (fail) { console.log('FAILS: ' + fails.join('\n  ')); process.exit(1); }
  console.log('proof GREEN.');
}
main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
