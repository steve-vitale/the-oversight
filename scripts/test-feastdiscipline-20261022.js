#!/usr/bin/env node
// test-feastdiscipline-20261022.js — proof gates for sim-feastdiscipline.
//
// E0 shape; E1 det-gate (FEASTDISC unset -> disciplinedFor byte-identical
// to AD.armedFor, 60d x2 bases, ARMORYDRIVE=1 both sides); E2 env-gate;
// E3 synthetic RED->GREEN fixtures on the beat (threat/armed/feasted/
// haven/combat/window/pantry/plan guards, one-pass-per-day, wave-3-only
// no-fire, base.upkeep delegation, gate-off pure delegation); E4
// armed+deterministic; D2 180d armed run completes + deterministic re-run.
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 \
//   node scripts/test-feastdiscipline-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.FEASTDISC === '1') { console.error('PROOF STOP: run with FEASTDISC unset (the proof sets it itself for the armed fixtures).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'feastdiscipline'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function digest(Game, result) {
  const st = Game.state || {};
  const s = st.scholar || {};
  const v = st.village || {};
  return JSON.stringify({
    day: s.day || 0,
    alive: !!Game.villagerId,
    hp: Math.round(s.hp || 0),
    pop: ((v.roster || []).length),
    pantry: Math.round((st.pantry && st.pantry.kcal) || 0),
    wkl: (st.waveKillLog || []).length,
    uw: (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 0),
    over: !!Game.over, won: !!Game.won,
    deaths: (result && result.samples && result.samples.deaths || []).length,
  });
}

async function shortRun(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'feastdisc-proof', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

// ---------- synthetic Game fixtures (E3) ----------
function makeGame(o) {
  o = o || {};
  const calls = { feasts: 0, baseUpkeeps: 0, baseDailys: 0 };
  const wave = o.wave == null ? 4 : o.wave;
  const G = {
    state: {
      scholar: { day: o.day != null ? o.day : 60, prog: o.unarmed ? {} : { feastSurge: 1.5 } },
      village: {},
    },
    dayPart: o.part != null ? o.part : 2,
    data: { monsters: [{ id: 'm_w4', wave: 4 }, { id: 'm_w3', wave: 3 }] },
    tbfight: null,
    over: false,
    inCombat: () => !!o.inCombat,
    playerAtHaven: () => !!o.atHaven,
    unlockedWave: () => wave,
    waveCombatReadiness: (w) => ({ veterans: o.vetsMet ? 2 : 0, demand: { veterans: 2 } }),
    feastedActive: () => !!o.feasted,
    travelTargets: () => (o.targets || []).map(t => ({ x: t.x, y: t.y })),
    monsterAt: (x, y) => {
      const t = (o.targets || []).find(t => t.x === x && t.y === y);
      return t ? { id: t.mid } : null;
    },
    feastPlan: () => (o.planOk === false
      ? { ok: false, why: o.planWhy || 'nope' }
      : { ok: true, cost: 2000, have: (o.pantryHave != null ? o.pantryHave : 10000) }),
    hostFeast: () => { calls.feasts++; return o.feastOk === false ? { ok: false, why: 'refused' } : { ok: true }; },
    _calls: calls,
  };
  return G;
}
function setGate(on) {
  if (on) process.env.FEASTDISC = '1';
  else delete process.env.FEASTDISC;
}

(async () => {
  console.log('E0 shape');
  setGate(false);
  const p = FD.disciplinedFor('leadfeast');
  ok('disciplinedFor returns a policy', p && p.id === 'lead-feastdisc' && typeof p.daily === 'function' && typeof p.upkeep === 'function');
  ok('belong base tags', FD.disciplinedFor('belongfeast').id === 'belong-feastdisc');
  let threw = false;
  try { FD.disciplinedFor('nope'); } catch (e) { threw = true; }
  ok('unknown base throws', threw);
  ok('exports present', ['fdOn', 'stagingWindowLive', 'feastArmed', 'feastedNow', 'wave4Imminent', 'feastDisciplineBeat', 'withFeastDiscipline', 'disciplinedFor', 'resetTele'].every(k => typeof FD[k] === 'function'));

  console.log('E2 env-gate');
  setGate(false);
  ok('fdOn false when unset', FD.fdOn() === false);
  setGate(true);
  ok('fdOn true when 1', FD.fdOn() === true);
  setGate(false);

  console.log('E3 fixtures (gate on unless noted)');
  const baseFire = () => ({ atHaven: true, targets: [{ x: 1, y: 2, mid: 'm_w4' }] });
  // fires
  setGate(true); FD.resetTele();
  {
    const G = makeGame(baseFire());
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('fires when armed+threat+havenside-dusk', G._calls.feasts === 1 && ctx.fdFeasts === 1);
    ok('tele counts the staged feast', FD.tele().feastsStaged === 1);
  }
  // one pass per day
  setGate(true); FD.resetTele();
  {
    const G = makeGame(baseFire());
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    FD.feastDisciplineBeat(G, ctx);
    ok('one staging pass per day', G._calls.feasts === 1);
  }
  // next day fires again
  setGate(true); FD.resetTele();
  {
    const G = makeGame(baseFire());
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    G.state.scholar.day = 61;
    FD.feastDisciplineBeat(G, ctx);
    ok('fires again the next day', G._calls.feasts === 2);
  }
  // no threat
  setGate(true); FD.resetTele();
  {
    const G = makeGame({ atHaven: true, targets: [] });
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('no feast without a wave-4 threat', G._calls.feasts === 0 && FD.tele().skippedNoThreat === 1);
  }
  // wave-3 only
  setGate(true); FD.resetTele();
  {
    const G = makeGame({ atHaven: true, targets: [{ x: 1, y: 2, mid: 'm_w3' }] });
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('wave-3-only is not a threat', G._calls.feasts === 0);
  }
  // unarmed
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { unarmed: true }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('no feast when devotion unarmed', G._calls.feasts === 0 && FD.tele().skippedUnarmed === 1);
  }
  // already feasted
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { feasted: true }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('no feast while the window is live', G._calls.feasts === 0 && FD.tele().skippedFeasted === 1);
  }
  // not at haven
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { atHaven: false }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('no feast off the haven', G._calls.feasts === 0);
  }
  // wrong dayPart
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { part: 0 }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('dawn is not dusk', G._calls.feasts === 0);
  }
  // in combat
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { inCombat: true }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('no feast in combat', G._calls.feasts === 0);
  }
  // window closed: wave < 4
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { wave: 3 }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('window closed pre-wave-4', G._calls.feasts === 0);
  }
  // window closed: vets bar met
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { vetsMet: true }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('window closed when the vets bar is met', G._calls.feasts === 0);
  }
  // pantry thin
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { pantryHave: 2000 }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('never feasts into famine (buffer gate)', G._calls.feasts === 0 && FD.tele().skippedPantry === 1);
  }
  // plan not ok
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { planOk: false, planWhy: 'thin stores' }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('honest plan refusal skips', G._calls.feasts === 0 && FD.tele().skippedPlan === 1 && /thin stores/.test(ctx.fdPlanWhy || ''));
  }
  // hostFeast refusal
  setGate(true); FD.resetTele();
  {
    const G = makeGame(Object.assign(baseFire(), { feastOk: false }));
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    ok('hostFeast refusal counted, not thrown', ctx.fdFeastFailed === 1 && FD.tele().feastsFailed === 1);
  }
  // base.upkeep delegation
  setGate(true); FD.resetTele();
  {
    const calls = { u: 0 };
    const base = { id: 'b', daily() {}, upkeep() { calls.u++; } };
    const w = FD.withFeastDiscipline(base, 'w', 'w');
    const G = makeGame({ atHaven: false });
    w.upkeep(G, {});
    ok('base.upkeep runs under the wrapper', calls.u === 1);
  }
  // base without upkeep
  setGate(true); FD.resetTele();
  {
    const base = { id: 'b', daily() {} };
    const w = FD.withFeastDiscipline(base, 'w', 'w');
    let crashed = false;
    try { w.upkeep(makeGame({ atHaven: false }), {}); } catch (e) { crashed = true; }
    ok('missing base.upkeep is fine', !crashed);
  }
  // gate-off pure delegation
  setGate(false); FD.resetTele();
  {
    const G = makeGame(baseFire());
    const ctx = {};
    FD.feastDisciplineBeat(G, ctx);
    const teleZero = Object.values(FD.tele()).every(v => v === 0);
    ok('gate off: beat silent, tele zero, ctx untouched', G._calls.feasts === 0 && teleZero && Object.keys(ctx).length === 0);
  }
  // gate-off upkeep: base.upkeep runs, beat silent
  setGate(false); FD.resetTele();
  {
    const calls = { u: 0 };
    const base = { id: 'b', daily() {}, upkeep() { calls.u++; } };
    const w = FD.withFeastDiscipline(base, 'w', 'w');
    const ctx = {};
    w.upkeep(makeGame(baseFire()), ctx);
    ok('gate off: upkeep delegates purely', calls.u === 1 && G0zero(ctx));
    function G0zero(c) { return Object.keys(c).length === 0 && Object.values(FD.tele()).every(v => v === 0); }
  }

  console.log('E1 det-gate (FEASTDISC unset — byte-identical to AD.armedFor)');
  setGate(false); FD.resetTele();
  for (const b of ['leadfeast', 'belongfeast']) {
    const a = await shortRun(FD.disciplinedFor(b), 4242, 60);
    const c = await shortRun(AD.armedFor(b), 4242, 60);
    ok(`det-gate ${b} 60d byte-identical`, digest(a.Game, a.result) === digest(c.Game, c.result),
      digest(a.Game, a.result) + ' vs ' + digest(c.Game, c.result));
  }
  ok('det-gate tele untouched', Object.values(FD.tele()).every(v => v === 0));

  console.log('E4 armed determinism (FEASTDISC=1, 60d, same seed twice)');
  setGate(true); FD.resetTele();
  {
    const a = await shortRun(FD.disciplinedFor('leadfeast'), 4243, 60);
    setGate(true); FD.resetTele();
    const b = await shortRun(FD.disciplinedFor('leadfeast'), 4243, 60);
    ok('armed re-run deterministic', digest(a.Game, a.result) === digest(b.Game, b.result));
    ok('armed 60d completes', (a.Game.state.scholar.day || 0) > 0 || a.Game.over);
  }

  console.log('D2 180d armed run completes + deterministic re-run');
  setGate(true); FD.resetTele();
  {
    const a = await shortRun(FD.disciplinedFor('belongfeast'), 4244, 180);
    setGate(true); FD.resetTele();
    const b = await shortRun(FD.disciplinedFor('belongfeast'), 4244, 180);
    ok('armed 180d re-run deterministic', digest(a.Game, a.result) === digest(b.Game, b.result));
    console.log('   digest:', digest(a.Game, a.result));
    console.log('   tele:', JSON.stringify(FD.tele()));
  }

  setGate(false);
  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL', e); process.exit(1); });
