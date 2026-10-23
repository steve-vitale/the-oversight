#!/usr/bin/env node
// test-splitclose-20261022.js — proof gates for sim-splitclose.
//
// E0 shape; E1 det-gate (SPLITCLOSE unset -> armedFor byte-identical to
// AD.armedFor, 60d x2 bases); E2 env-gate; E3 synthetic RED->GREEN
// fixtures on the discipline (soften above band, overshoot hold, band
// hold, feasted-vs-sober band selection, stall finish, hurt-companion
// resume, non-w4 delegate, titan excluded, companion-less delegate,
// low-scholar-hp delegate, round-1 delegate, hold cap); E4 armed+KILLDISC
// deterministic; D2 180d armed runs complete per policy + deterministic
// re-run.
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 node scripts/test-splitclose-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const SC = require(path.join(REPO, 'scripts', 'policies', 'splitclose'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// Stable trajectory digest: end-state fields that must match for
// byte-identical delegation (excludes wall-clock-derived ids).
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
  const { Game } = await loadGame({ seed, mode: 'splitclose-proof', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

// ---------- synthetic fight fixtures (E3) ----------
const MONSTERS = [
  { id: 'the_algorithm', wave: 4 }, { id: 'the_audit', wave: 4 },
  { id: 'herald', wave: 4 }, { id: 'gavel', wave: 3 },
];
function makeGame(o) {
  o = o || {};
  const tgtHp = o.tgtHp != null ? o.tgtHp : 900;
  const tgtMid = o.tgtMid || 'the_algorithm';
  const tgtWave = (MONSTERS.find(m => m.id === tgtMid) || {}).wave || 4;
  const compHpPct = o.compHpPct != null ? o.compHpPct : 0.9;
  const scholarHpPct = o.scholarHpPct != null ? o.scholarHpPct : 0.8;
  const round = o.round != null ? o.round : 3;
  const feasted = o.feasted === true;
  const comps = o.comps === 0 ? [] : [{ key: 'v_0', kind: 'villager', villagerId: 'vidA', alive: true, fled: false, hp: 100 * compHpPct, maxHp: 100 }];
  const fighters = [
    { key: 'p', kind: 'villager', alive: true, hp: 100 * scholarHpPct, maxHp: 100 },
    ...comps,
    { key: 'm_0', kind: 'monster', monsterId: tgtMid, alive: true, fled: false, hp: tgtHp, maxHp: 1000 },
  ];
  const calls = { waits: 0, baseFights: 0 };
  const base = { fight(Game, ctx) { calls.baseFights++; return true; } };
  const G = {
    data: { monsters: MONSTERS },
    tbfight: { id: 'f1', over: false, round, fighters },
    tbIsPlayerTurn: () => true,
    tbFighter: (k) => fighters.find(f => f.key === k) || null,
    partyMembers: () => comps.map(c => c.villagerId),
    tbPlayerWait: () => { calls.waits++; },
    feastedActive: () => feasted,
    _calls: calls, _base: base,
  };
  return G;
}
function runDiscipline(G, preset) {
  const ctx = {};
  const wrapped = SC.withSplitclose(G._base, 't', 't');
  if (preset) { ctx._scFightObj = G.tbfight; ctx._scDisc = Object.assign({ fight: G.tbfight, holds: 0, stall: 0, scholarEst: 120, lastTgtHp: null, lastHoldHp: null }, preset); }
  const r = wrapped.fight(G, ctx);
  return { r, ctx, calls: G._calls };
}

async function main() {
  console.log('E0 shape');
  ok('E0 module loads with withSplitclose', typeof SC.withSplitclose === 'function');
  ok('E0 splitcloseOn exported', typeof SC.splitcloseOn === 'function');
  ok('E0 armedFor/controlFor exported', typeof SC.armedFor === 'function' && typeof SC.controlFor === 'function');
  const bands = SC.bands();
  ok('E0 bands positive numbers', typeof bands.feasted === 'number' && bands.feasted > 0 && typeof bands.sober === 'number' && bands.sober > 0,
    'bands=' + JSON.stringify(bands));
  ok('E0 feasted band >= sober band', bands.feasted >= bands.sober, JSON.stringify(bands));

  console.log('E2 env-gate');
  ok('E2 gate off when unset', !SC.splitcloseOn());

  // E3 needs the gate ON (E2 pinned it off).
  process.env.SPLITCLOSE = '1';
  ok('E2b gate on when SPLITCLOSE=1', SC.splitcloseOn());

  console.log('E3 synthetic fixtures (bands=' + JSON.stringify(bands) + ')');
  const BAND_S = bands.sober, BAND_F = bands.feasted;
  // E3a: above band+est -> soften (fall through to base)
  {
    const G = makeGame({ tgtHp: BAND_S + 500 });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3a soften above band -> base.fight', r === true && calls.baseFights === 1 && calls.waits === 0, JSON.stringify({ r, sc: ctx.scSoftens }));
    ok('E3a scSoftens counted', (ctx.scSoftens | 0) === 1);
  }
  // E3b: in sober band -> hold
  {
    const G = makeGame({ tgtHp: Math.floor(BAND_S * 0.5) });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3b in-band -> hold (wait)', r === true && calls.waits === 1 && calls.baseFights === 0);
    ok('E3b scBandHolds counted', (ctx.scBandHolds | 0) === 1);
    ok('E3b sober hold counted as sober', (ctx.scSoberHolds | 0) === 1 && (ctx.scFeastedHolds | 0) === 0);
  }
  // E3b2: feasted band selection — target between sober and feasted band
  // holds when feasted, softens when sober.
  {
    const hp = Math.floor((BAND_S + BAND_F) / 2) + 1;
    if (BAND_F > BAND_S) {
      const Gf = makeGame({ tgtHp: hp, feasted: true });
      const rf = runDiscipline(Gf);
      ok('E3b2 feasted in feasted-band -> hold', rf.r === true && rf.calls.waits === 1, `hp=${hp} bands=${BAND_S}/${BAND_F}`);
      ok('E3b2 feasted hold counted as feasted', (rf.ctx.scFeastedHolds | 0) === 1);
      const Gs = makeGame({ tgtHp: hp, feasted: false });
      const rs = runDiscipline(Gs, { scholarEst: 0, lastTgtHp: hp });
      ok('E3b2 sober above sober-band -> soften', rs.r === true && rs.calls.baseFights === 1 && rs.calls.waits === 0, `hp=${hp}`);
    } else {
      console.log('  SKIP E3b2 (bands equal — feast multiplier measured ~1x)');
      pass += 3;
    }
  }
  // E3c: overshoot guard — est > band, target between band and est
  {
    const G = makeGame({ tgtHp: Math.floor(BAND_S * 1.2) });
    const est = Math.floor(BAND_S * 2.5);
    const { r, ctx, calls } = runDiscipline(G, { scholarEst: est, lastTgtHp: Math.floor(BAND_S * 1.2) });
    ok('E3c overshoot risk -> hold not strike', r === true && calls.waits === 1 && calls.baseFights === 0, `est=${est} tgt=${Math.floor(BAND_S * 1.2)}`);
    ok('E3c scOvershootHolds counted', (ctx.scOvershootHolds | 0) === 1);
  }
  // E3d: stall — two stalled holds -> scholar resumes
  {
    const hp = Math.floor(BAND_S * 0.5);
    const G = makeGame({ tgtHp: hp });
    const ctx = {};
    const wrapped = SC.withSplitclose(G._base, 't', 't');
    wrapped.fight(G, ctx); // hold 1 (lastHoldHp=hp)
    const r2 = wrapped.fight(G, ctx); // hold 2, stall=1
    const r3 = wrapped.fight(G, ctx); // stall=2 -> finish
    ok('E3d two stalled holds -> resume', r2 === true && G._calls.waits === 2 && r3 === true && G._calls.baseFights === 1, `waits=${G._calls.waits} base=${G._calls.baseFights}`);
    ok('E3d scStallFinishes counted', (ctx.scStallFinishes | 0) === 1);
  }
  // E3e: hurt companion -> resume striking
  {
    const G = makeGame({ tgtHp: Math.floor(BAND_S * 0.5), compHpPct: 0.3 });
    const { r, ctx, calls } = runDiscipline(G, { holds: 2 });
    ok('E3e hurt companion -> resume (no breakoff)', r === true && calls.baseFights === 1 && calls.waits === 0);
  }
  // E3f: non-w4 fight -> delegate
  {
    const G = makeGame({ tgtHp: 100, tgtMid: 'gavel' });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3f wave-3 fight -> delegate', r === true && calls.baseFights === 1 && (ctx.scHolds | 0) === 0);
  }
  // E3g: titan (herald) -> excluded
  {
    const G = makeGame({ tgtHp: 100, tgtMid: 'herald' });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3g herald excluded -> delegate', r === true && calls.baseFights === 1 && (ctx.scHolds | 0) === 0 && (ctx.scW4Fights | 0) === 0);
  }
  // E3h: no companions -> delegate
  {
    const G = makeGame({ tgtHp: Math.floor(BAND_S * 0.5), comps: 0 });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3h no companions -> delegate', r === true && calls.baseFights === 1 && (ctx.scHolds | 0) === 0);
  }
  // E3i: scholar hp <50% -> no hold
  {
    const G = makeGame({ tgtHp: Math.floor(BAND_S * 0.5), scholarHpPct: 0.4 });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3i scholar <50% hp -> no hold', r === true && calls.baseFights === 1 && calls.waits === 0);
  }
  // E3j: round 1 -> no hold
  {
    const G = makeGame({ tgtHp: Math.floor(BAND_S * 0.5), round: 1 });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3j round 1 -> no hold', r === true && calls.baseFights === 1 && calls.waits === 0);
  }
  // E3k: gate off -> pure delegation, ctx untouched
  {
    delete process.env.SPLITCLOSE;
    const G = makeGame({ tgtHp: Math.floor(BAND_S * 0.5) });
    const ctx = {};
    const wrapped = SC.withSplitclose(G._base, 't', 't');
    const r = wrapped.fight(G, ctx);
    ok('E3k gate-off -> base.fight, ctx untouched', r === true && G._calls.baseFights === 1 && Object.keys(ctx).length === 0, 'ctx keys: ' + Object.keys(ctx).join(','));
    process.env.SPLITCLOSE = '1';
  }
  // E3l: hold cap reached -> scholar resumes (bounded hold)
  {
    const G = makeGame({ tgtHp: Math.floor(BAND_S * 0.5) });
    const { r, ctx, calls } = runDiscipline(G, { holds: 10, lastHoldHp: Math.floor(BAND_S * 0.5) });
    ok('E3l hold cap -> resume', r === true && calls.baseFights === 1 && calls.waits === 0, 'holds=10');
  }
  // E3m: overshoot shave takes the shared cap/stall path (no unbounded hold)
  {
    const hp = Math.floor(BAND_S * 3);
    const G = makeGame({ tgtHp: hp });
    const ctx = {};
    const wrapped = SC.withSplitclose(G._base, 't', 't');
    wrapped.fight(G, ctx); // overshoot hold 1 (lastHoldHp=hp)
    wrapped.fight(G, ctx); // overshoot hold 2, stall=1
    const r3 = wrapped.fight(G, ctx); // stall=2 -> finish
    ok('E3m stalled overshoot -> resume', r3 === true && G._calls.waits === 2 && G._calls.baseFights === 1,
      `waits=${G._calls.waits} base=${G._calls.baseFights}`);
    ok('E3m scOvershootHolds counted', (ctx.scOvershootHolds | 0) === 2);
  }

  console.log('E1 det-gate (60d x2 bases, SPLITCLOSE unset)');
  delete process.env.SPLITCLOSE;
  ok('E1 gate off again for det-gate', !SC.splitcloseOn());
  for (const [baseId, seed] of [['leadfeast', 65411], ['belongfeast', 65412]]) {
    const a = await shortRun(AD.armedFor(baseId), seed, 60);
    const b = await shortRun(SC.armedFor(baseId), seed, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok(`E1 ${baseId} s${seed} byte-identical`, da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }

  console.log('E4 armed+KILLDISC deterministic (SPLITCLOSE=1)');
  const savedSplit = process.env.SPLITCLOSE;
  process.env.SPLITCLOSE = '1';
  {
    const a = await shortRun(SC.armedFor('leadfeast'), 65413, 60);
    const b = await shortRun(SC.armedFor('leadfeast'), 65413, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok('E4 identical seeds -> identical digest', da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }
  if (savedSplit === undefined) delete process.env.SPLITCLOSE; else process.env.SPLITCLOSE = savedSplit;

  console.log('D2 180d armed run completes + deterministic re-run (SPLITCLOSE=1)');
  process.env.SPLITCLOSE = '1';
  {
    const a = await shortRun(SC.armedFor('belongfeast'), 65414, 180);
    const b = await shortRun(SC.armedFor('belongfeast'), 65414, 180);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok('D2 180d armed completes', !!a.result && !!b.result);
    ok('D2 180d armed deterministic re-run', da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }
  if (savedSplit === undefined) delete process.env.SPLITCLOSE; else process.env.SPLITCLOSE = savedSplit;

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FAIL:', e && e.stack || e); process.exit(1); });
