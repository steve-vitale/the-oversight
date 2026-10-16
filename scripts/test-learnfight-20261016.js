#!/usr/bin/env node
'use strict';
// test-learnfight-20261016.js — pre-sweep proof for the LEARN-VS-FIGHT
// village-channel lever (flesh-out loop, 2026-10-16, sim-learnfight,
// scale-onramp axis).
//
// The lever: scripts/policies/learnfight.js (env-gated LEARNFIGHT=1,
// default OFF, ZERO src/js changes) wrapping the tribfloor->windefer chain
// (WD.withWinDefer(TF.leadfeast/belongfeast, id 'leadfeast-windefer'/
// 'belongfeast-windefer'). Plus a policy-side extension in
// scripts/policies/competent.js honoring ctx._learnFight (the proven
// _huntCommit/_w5Commit/_observeFarm pattern — gate off = byte-identical).
//
// CONTEXT: sim-observefarm was killed at pilot — scholar-expedition
// observation farming has no supply (50 hunts, 0 engagements). The
// funnel's supply lives in the channels that come TO the village (raids
// via havenRaidTick, treeline stalkers, wild encounters at Haven). When a
// wave-3+ trick-bearer whose trick is undiscovered comes to the village,
// the scholar takes a WITNESS posture (disengages at fight start, healthy)
// instead of engaging blade-first. Party-aware (#353): never while
// villagers are committed to the same fight — hold instead.
//
// Proves, before any sweep spend:
//   (a) layer-live markers honest on BOTH sides;
//   (b) gate-off det-gate: the withLearnFight composition is byte-identical
//       to the naked tribfloor->windefer composition on identical seeds
//       (pins the competent.js extension inert when the gate is off);
//   (c) SMOKE: one 20d run per side, markers honest, run completes;
//   (d) unit checks: learnLive gating (uw>=3, table-busy), trickTargetOf
//       (wave-3+ sig targeted when unknown; known skipped; waves 1-2
//       skipped; unknown mids skipped), villagersCommitted (alive
//       villager -> hold; fled villager -> no hold; monsters only ->
//       no hold);
//   (e) wrapper contract: gate off -> _learnFight false; learn-fight ->
//       _learnFight true; party-committed -> hold (lfHeld=1, flag false);
//       away-from-haven -> false; hurt scholar -> false;
//   (f) fight-side: the competent.js _learnFight extension fires the
//       witness posture through the REAL competent.fight (flee called,
//       lfWitnessed=1, honest narration); party-hold never fires it;
//       gate-off never fires it;
//   (g) instrument honesty: villagerTricks written only by
//       _trickObservation; counter_discovered tele fires from the funnel.
//
// KILL-PROTOCOL path: if the layer file is absent (killed arm), this proof
// INFO-SKIPs cleanly (exit 0) — instruments + evidence land without it.
//
// Env-helper discipline: withEnv is sync-only, wraps sync functions only.
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-learnfight-20261016.js
//   SEEDS="161,272" DAYS=30 node scripts/test-learnfight-20261016.js   # targeted det-gate
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');
const LF_PATH = (() => { try { return require.resolve('./policies/learnfight'); } catch (e) { return null; } })();
if (!LF_PATH) {
  console.log('== learnfight pre-sweep proof ==');
  console.log('INFO-SKIP: layer absent (scripts/policies/learnfight.js not found).');
  process.exit(0);
}
const LF = require(LF_PATH);

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') { console.error('PROOF STOP: SEATDRIVE must NOT be set for the learnfight substrate.'); process.exit(2); }

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

// A stub Game for wrapper/extension unit checks. Knobs: wave defs, known
// set, haven presence, scholar hp, fighters, unlocked wave, table state.
const MONS = [
  { id: 'spool', wave: 3 },
  { id: 'chorus_line', wave: 3 },
  { id: 'redactor', wave: 3 },
  { id: 'reunion', wave: 4 },
  { id: 'highbeam_deer', wave: 1 },
  { id: 'static', wave: 2 },
];
const TRICK_DEFS = { spool: {}, chorus_line: {}, redactor: {}, reunion: {} };
function mkGame(o) {
  o = o || {};
  const known = o.known || new Set();
  const said = [];
  const pObj = { hp: o.php == null ? 100 : o.php, maxHp: 100, mx: 4, my: 4, moveLeft: 1, acted: false, kind: 'player', key: 'p' };
  const fighters = [{ key: 'p' }].concat(o.fighters || []);
  fighters[0] = Object.assign(fighters[0], pObj);
  return {
    said,
    unlockedWave: () => (o.uw == null ? 3 : o.uw),
    progState: () => (o.tableBusy ? { tableWaiting: true } : {}),
    playerAtHaven: () => (o.haven == null ? true : o.haven),
    maxHealth: () => 100,
    state: { scholar: { hp: o.php == null ? 100 : o.php } },
    data: { monsters: MONS },
    villagerTrickDefs: () => TRICK_DEFS,
    villageKnowsTrick: (mid) => known.has(mid),
    monsterDisplayName: (mid) => 'the ' + String(mid).replace(/_/g, ' '),
    say: (m) => { said.push(String(m)); },
    map: { px: 4, py: 4 },
    tbfight: o.noFight ? null : {
      over: false, round: 1,
      fighters,
    },
    tbIsPlayerTurn: () => true,
    tbFighter: (k) => (k === 'p' ? pObj : null),
    tbPlayerMove: () => true,
    tbPlayerStrike: () => true,
    tbAfterPlayerAction: () => {},
    equippedWeapon: () => ({ range: 1 }),
  };
}
const MON = (mid, extra) => Object.assign({ key: 'm_0', kind: 'monster', hp: 100, maxHp: 100, monsterId: mid, mx: 6, my: 6, alive: true }, extra || {});
const VIL = (extra) => Object.assign({ key: 'v_0', kind: 'villager', villagerId: 'v1', hp: 80, maxHp: 100, alive: true, mx: 3, my: 3 }, extra || {});

async function detGateOnce(seed, policyId, days) {
  const runs = [];
  for (const armed of [false, true]) {
    Object.assign(process.env, SUBSTRATE);
    if (armed) process.env.LEARNFIGHT = '1'; else delete process.env.LEARNFIGHT;
    const policy = armed ? (policyId === 'leadfeast' ? LF.leadseat : LF.belongseat) : nakedBase(policyId);
    const { Game } = await loadGame({ seed, mode: `learnfight-detgate-${armed ? 'armed' : 'control'}` });
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
    delete process.env.LEARNFIGHT;
  }
  return runs;
}

async function main() {
  console.log('== learnfight pre-sweep proof ==');

  // ----- 1. layerOn honesty -----
  withEnv({ LEARNFIGHT: '1' }, () => ok('layerOn true when LEARNFIGHT=1', LF.learnfightOn() === true, ''));
  withEnv({ LEARNFIGHT: undefined }, () => ok('layerOn false when unset', LF.learnfightOn() === false, ''));
  withEnv({ LEARNFIGHT: '0' }, () => ok('layerOn false when LEARNFIGHT=0', LF.learnfightOn() === false, ''));
  withEnv({ W3DRIVE: '1', W3DRIVE2: '1', WAVE5REACH: '1', OBSERVEFARM: '1', LEARNFIGHT: undefined },
    () => ok('dead/other gates do not arm learnfight', LF.learnfightOn() === false, ''));

  // ----- 2. composition integrity -----
  withEnv(Object.assign({}, SUBSTRATE), () => {
    ok('leadseat id matches control id', LF.leadseat.id === 'leadfeast-windefer', LF.leadseat.id);
    ok('belongseat id matches control id', LF.belongseat.id === 'belongfeast-windefer', LF.belongseat.id);
    ok('desc names the lever', /witness/i.test(LF.leadseat.desc || ''), LF.leadseat.desc);
  });

  // ----- 3. learnLive gating -----
  withEnv({ LEARNFIGHT: '1' }, () => {
    ok('learnLive true at uw=3', LF.learnLive(mkGame({ uw: 3 })) === true, '');
    ok('learnLive true at uw=5', LF.learnLive(mkGame({ uw: 5 })) === true, '');
    ok('learnLive false at uw=2', LF.learnLive(mkGame({ uw: 2 })) === false, '');
    ok('learnLive false when table busy', LF.learnLive(mkGame({ uw: 3, tableBusy: true })) === false, '');
  });
  withEnv({ LEARNFIGHT: undefined }, () => {
    ok('learnLive false when gate off', LF.learnLive(mkGame({ uw: 3 })) === false, '');
  });

  // ----- 4. trickTargetOf -----
  withEnv({ LEARNFIGHT: '1' }, () => {
    const g = mkGame({});
    ok('targets undiscovered wave-3 spool', LF.trickTargetOf(g, 'spool') === true, '');
    ok('targets undiscovered wave-3 redactor', LF.trickTargetOf(g, 'redactor') === true, '');
    ok('targets undiscovered wave-4 reunion', LF.trickTargetOf(g, 'reunion') === true, '');
    ok('skips KNOWN spool', LF.trickTargetOf(mkGame({ known: new Set(['spool']) }), 'spool') === false, '');
    ok('skips wave-1 highbeam_deer (no def)', LF.trickTargetOf(g, 'highbeam_deer') === false, '');
    ok('skips wave-2 static (no def)', LF.trickTargetOf(g, 'static') === false, '');
    ok('skips unknown mid', LF.trickTargetOf(g, 'nope_not_real') === false, '');
    ok('skips null mid', LF.trickTargetOf(g, null) === false, '');
  });

  // ----- 5. villagersCommitted -----
  ok('villager committed: alive villager fighter', LF.villagersCommitted({ fighters: [MON('spool'), VIL()] }) === true, '');
  ok('not committed: fled villager', LF.villagersCommitted({ fighters: [MON('spool'), VIL({ fled: true })] }) === false, '');
  ok('not committed: dead villager', LF.villagersCommitted({ fighters: [MON('spool'), VIL({ alive: false, hp: 0 })] }) === false, '');
  ok('not committed: monsters only', LF.villagersCommitted({ fighters: [MON('spool')] }) === false, '');
  ok('not committed: empty', LF.villagersCommitted({ fighters: [] }) === false, '');

  // ----- 6. wrapper contract -----
  withEnv({ LEARNFIGHT: '1' }, () => {
    const noopBase = { daily: () => {}, fight: (G, C) => true };
    // (a) learn-fight: undiscovered spool at haven, healthy, alone -> mark set
    {
      const g = mkGame({ fighters: [MON('spool')] });
      const ctx = {};
      LF.withLearnFight(noopBase, 'x', 'x').fight(g, ctx);
      ok('wrapper: _learnFight set on learn-fight', ctx._learnFight === true, '');
    }
    // (b) party-committed -> hold, not mark
    {
      const g = mkGame({ fighters: [MON('spool'), VIL()] });
      const ctx = {};
      LF.withLearnFight(noopBase, 'x', 'x').fight(g, ctx);
      ok('wrapper: party-committed holds (flag false)', ctx._learnFight === false, '');
      ok('wrapper: party-committed holds (lfHeld=1)', ctx.lfHeld === 1, `lfHeld=${ctx.lfHeld}`);
    }
    // (c) known trick -> no mark
    {
      const g = mkGame({ known: new Set(['spool']), fighters: [MON('spool')] });
      const ctx = {};
      LF.withLearnFight(noopBase, 'x', 'x').fight(g, ctx);
      ok('wrapper: no mark when trick known', ctx._learnFight === false, '');
    }
    // (d) away from haven -> no mark (expedition channel untouched)
    {
      const g = mkGame({ haven: false, fighters: [MON('spool')] });
      const ctx = {};
      LF.withLearnFight(noopBase, 'x', 'x').fight(g, ctx);
      ok('wrapper: no mark away from haven', ctx._learnFight === false, '');
    }
    // (e) hurt scholar -> no mark (base eject owns hurt fights)
    {
      const g = mkGame({ php: 40, fighters: [MON('spool')] });
      const ctx = {};
      LF.withLearnFight(noopBase, 'x', 'x').fight(g, ctx);
      ok('wrapper: no mark when scholar hurt', ctx._learnFight === false, '');
    }
    // (f) trick-less wave-3... (no def) -> no mark
    {
      const g = mkGame({ fighters: [MON('highbeam_deer')] });
      const ctx = {};
      LF.withLearnFight(noopBase, 'x', 'x').fight(g, ctx);
      ok('wrapper: no mark on non-trick monster', ctx._learnFight === false, '');
    }
    // (g) mid-fight villager join clears a stale mark
    {
      const g = mkGame({ fighters: [MON('spool')] });
      const ctx = { _learnFight: true };
      g.tbfight.fighters.push(VIL());
      LF.withLearnFight(noopBase, 'x', 'x').fight(g, ctx);
      ok('wrapper: mid-fight villager join clears mark', ctx._learnFight === false, '');
    }
  });
  withEnv({ LEARNFIGHT: undefined }, () => {
    const g = mkGame({ fighters: [MON('spool')] });
    const ctx = {};
    const noopBase = { daily: () => {}, fight: (G, C) => true };
    LF.withLearnFight(noopBase, 'x', 'x').fight(g, ctx);
    ok('wrapper: _learnFight NOT set when gate off', ctx._learnFight === false, '');
    ok('wrapper: lfHeld NOT counted when gate off', (ctx.lfHeld || 0) === 0, '');
  });

  // ----- 7. fight-side: the competent.js _learnFight extension, for real -----
  // Drives the REAL competent.fight (the base handler the armed policy
  // delegates to) with stub Games — the witness posture fires through the
  // honest flee() closure, not a mock.
  withEnv(Object.assign({}, SUBSTRATE, { LEARNFIGHT: '1' }), () => {
    const COMP = require('./policies/competent');
    // (a) WITNESS: new fight, undiscovered spool at haven, healthy, alone.
    // The base would NOT flee this (totalMhp 100 < 2.5*pmax, full HP) —
    // it would strike. The extension witnesses instead.
    {
      const g = mkGame({ fighters: [MON('spool')] });
      const ctx = { _learnFight: true };
      const r = COMP.competent.fight(g, ctx);
      ok('extension: witness fires (handled)', r === true, `ret=${r}`);
      ok('extension: lfWitnessed=1', ctx.lfWitnessed === 1, `lfWitnessed=${ctx.lfWitnessed}`);
      ok('extension: narrates honestly (witness posture)', g.said.some(s => /witness posture/i.test(s)),
        JSON.stringify(g.said).slice(0, 120));
      ok('extension: narration names the beast via descriptor', g.said.some(s => /spool/i.test(s)),
        JSON.stringify(g.said).slice(0, 120));
    }
    // (b) PARTY HOLD: flag never set when villagers committed (wrapper
    // contract) — extension with flag false falls through to base combat,
    // no witness beat.
    {
      const g = mkGame({ fighters: [MON('spool'), VIL()] });
      const ctx = { _learnFight: false };
      const r = COMP.competent.fight(g, ctx);
      ok('extension: no witness when flag false (party hold path)', (ctx.lfWitnessed || 0) === 0,
        `ret=${r} lfWitnessed=${ctx.lfWitnessed}`);
      ok('extension: no witness narration when flag false',
        !g.said.some(s => /witness posture/i.test(s)), JSON.stringify(g.said).slice(0, 120));
    }
    // (c) GATE OFF: flag never set -> extension inert, base fights normally.
    {
      const g = mkGame({ fighters: [MON('spool')] });
      const ctx = {};
      const r = COMP.competent.fight(g, ctx);
      ok('extension: inert when _learnFight unset', (ctx.lfWitnessed || 0) === 0, `ret=${r}`);
    }
    // (d) full path: wrapper marks, extension fires (contract pin)
    {
      const g = mkGame({ fighters: [MON('spool')] });
      const ctx = {};
      const wrappedBase = { daily: () => {}, fight: (G, C) => COMP.competent.fight(G, C) };
      const r = LF.withLearnFight(wrappedBase, 'x', 'x').fight(g, ctx);
      ok('wrapper+extension: witness fires end-to-end', r === true && ctx.lfWitnessed === 1,
        `ret=${r} lfWitnessed=${ctx.lfWitnessed}`);
    }
    // (e) full path, party committed: wrapper holds, extension never fires
    {
      const g = mkGame({ fighters: [MON('spool'), VIL()] });
      const ctx = {};
      const wrappedBase = { daily: () => {}, fight: (G, C) => COMP.competent.fight(G, C) };
      const r = LF.withLearnFight(wrappedBase, 'x', 'x').fight(g, ctx);
      ok('wrapper+extension: party hold end-to-end (no witness)', (ctx.lfWitnessed || 0) === 0 && ctx.lfHeld === 1,
        `ret=${r} lfWitnessed=${ctx.lfWitnessed} lfHeld=${ctx.lfHeld}`);
    }
    // (f) WITHDRAWAL PERSISTS: turn 2 of the same witness-fight keeps
    // fleeing (no strike, no re-narration). The seed-161 bug was a
    // one-turn flee followed by normal combat (narrated witness, then
    // killed the spool anyway) — a strike spy catches the regression:
    // the old code strikes on turn 2, the fixed code never does.
    {
      const g = mkGame({ fighters: [MON('spool')] });
      let strikes = 0;
      g.tbPlayerStrike = () => { strikes++; return true; };
      const ctx = { _learnFight: true };
      const r1 = COMP.competent.fight(g, ctx);
      const saidAfterT1 = g.said.length;
      // turn 2: same fight object, wrapper still marks _learnFight
      ctx._learnFight = true;
      const r2 = COMP.competent.fight(g, ctx);
      ok('extension: turn-1 witness fires', r1 === true && ctx.lfWitnessed === 1, `ret=${r1}`);
      ok('extension: turn-2 keeps withdrawing (handled, no re-narration, NO strike)',
        r2 === true && ctx.lfWitnessed === 1 && g.said.length === saidAfterT1 && strikes === 0,
        `ret=${r2} lfWitnessed=${ctx.lfWitnessed} said=${g.said.length}/${saidAfterT1} strikes=${strikes}`);
      ok('extension: witness-fight handle held', ctx._lfWitnessFight === g.tbfight, '');
    }
    // (g) WITHDRAWAL STOPS when the wrapper clears the mark mid-fight
    // (villager joined): the base owns the fight again — on this stub the
    // base strikes the adjacent monster (not outmatched, healthy). A
    // strike spy distinguishes "fell through to base" from "kept
    // withdrawing".
    {
      const g = mkGame({ fighters: [MON('spool', { mx: 5, my: 4 })] });
      let strikes = 0;
      g.tbPlayerStrike = () => { strikes++; return true; };
      const ctx = { _learnFight: true };
      COMP.competent.fight(g, ctx); // turn 1: witness fires (flee, no strike)
      const strikesAfterT1 = strikes;
      ctx._learnFight = false; // wrapper cleared it (villager joined)
      COMP.competent.fight(g, ctx); // turn 2: base takes over, strikes
      ok('extension: turn-1 witness does not strike', strikesAfterT1 === 0, `strikes=${strikesAfterT1}`);
      ok('extension: withdrawal stops when mark clears (base strikes)', strikes > strikesAfterT1,
        `strikes=${strikes} after t1=${strikesAfterT1}`);
    }
    // (h) STALE HANDLE: a new fight object clears the old witness handle.
    {
      const g = mkGame({ fighters: [MON('spool')] });
      const ctx = { _learnFight: true, _lfWitnessFight: { id: 'old-fight' } };
      COMP.competent.fight(g, ctx);
      ok('extension: stale witness handle cleared on new fight', ctx._lfWitnessFight === g.tbfight,
        '');
    }
  });

  // ----- 8. det-gate: gate-off byte-identical to the naked base -----
  // Pins the competent.js _learnFight extension inert when the gate is off —
  // the extension's only entry point is ctx._learnFight, which the wrapper
  // never sets with LEARNFIGHT unset.
  const detSeeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [161, 272]).filter(Number.isFinite);
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

  // ----- 9. instrument honesty: tele-funnel pin -----
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
    // the layer invents no knowledge: no state writes in the layer file
    const lsrc = fs.readFileSync(__dirname + '/policies/learnfight.js', 'utf8');
    const stateWrites = lsrc.split('\n').filter(l => {
      const t = l.trim();
      return !t.startsWith('//') && /Game\.state\.\w+\s*=|\.villageCounterObs|villagerTricks\s*=/.test(l);
    });
    ok('layer file: zero game-state writes', stateWrites.length === 0, `${stateWrites.length} lines`);
  } catch (e) { ok('villagerTricks/tele pin', false, String((e && e.message) || e).slice(0, 120)); }

  // ----- 10. SMOKE: 20d both sides, markers honest, run completes -----
  for (const side of ['control', 'armed']) {
    Object.assign(process.env, SUBSTRATE);
    if (side === 'armed') process.env.LEARNFIGHT = '1'; else delete process.env.LEARNFIGHT;
    const base = side === 'armed' ? LF.belongseat : nakedBase('belongfeast');
    const { Game } = await loadGame({ seed: 161, mode: `learnfight-smoke-${side}` });
    await setupGame(Game);
    let lfLive = null, tfLive = null, wdLive = null;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      lfLive = LF.learnfightOn(); tfLive = TF.layerOn(); wdLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    ok(`${side}: markers honest`, lfLive === (side === 'armed') && tfLive === true && wdLive === true,
      `lf=${lfLive} tf=${tfLive} wd=${wdLive}`);
    ok(`${side}: run completes`, !!(r && r.days >= 20), `days=${r && r.days}`);
    ok(`${side}: policy id`, base.id === 'belongfeast-windefer', base.id);
    delete process.env.LEARNFIGHT;
  }

  console.log(`\n== learnfight proof: ${pass} pass, ${fail} fail ==`);
  if (fail) { console.log('FAILS: ' + fails.join('\n  ')); process.exit(1); }
  console.log('proof GREEN.');
}
main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
