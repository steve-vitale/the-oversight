#!/usr/bin/env node
// test-dismissal-20261018.js — proof for the sim-dismissal b2 dismissal-shape
// census (flesh-out loop, axis scale-onramp, arm sim-dismissal,
// run fleshout-20261018T0122Z).
//
//   PURE  — classifyFights over synthetic fixtures: every class
//           (b2-dismissal routed/fled, b1-performer-died, a2-pyrrhic,
//           attributed won/routed, won-unattributed, attribution-gap,
//           unattributed, instrument-error, not-in-universe, attributed-cross);
//           hpShape (struck lead vs unscathed pack); replayLedger
//           (perTypeCap binding, D1 vs D2, fight-order, unknown->1pt);
//           rungsOf (the unlockedWave ladder); counterfactual (w2/w3 rung
//           flips, war-source unmoved on w1/w2-only dismissals).
//   RED   — gate-off det: the armed composition (withReposition(vetrelLead))
//           with REPOSITION/VETREL unset is byte-identical to vetrelLead
//           gate-off is byte-identical to leadfeast (s204, 60d); belong side
//           likewise. A gate-off delta is a loud failure of the "composition
//           is the landed instruments" claim.
//   GREEN — gate ON (REPOSITION=1 VETREL=1): a 60d run records dismissal
//           fields (kindByMid, waveByMid, knownAtStart, hpByMid, wklSameDay),
//           the ledger snapshot is well-formed, and the counterfactual runs
//           over the real classified rows.
//   DET   — replayLedger + counterfactual byte-identical across runs
//           (JSON-stable).
//   SMOKE — 20d instrumented armed run completes schema-clean; restore()
//           returns tbEnd and say to their originals.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness);
// child processes for process isolation only where noted (the trajectory
// comparisons run in-process like the perfsurvive proof's, one harness at
// a time); no Game.save stub; no hardcoded absolute paths (ROOT from
// __dirname); no concurrent jest.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}
function jstable(x) { return JSON.stringify(x); }

const { classifyFights, hpShape, replayLedger, rungsOf, counterfactual } =
  require('./analyze-dismissal-20261018');

function mkFight(over) {
  return Object.assign({
    seq: 1, day: 10, started: true, result: 'routed',
    mids: ['hushwolf'], kindByMid: { hushwolf: 'strike_lead' },
    waveByMid: { hushwolf: 1 }, knownAtStart: { hushwolf: 1 },
    perfs: { hushwolf: 1 },
    mortality: { hushwolf: { dead: 0, alive: 3 } },
    hpByMid: { hushwolf: [{ hp: 30, maxHp: 100, fled: true }, { hp: 100, maxHp: 100, fled: true }, { hp: 95, maxHp: 100, fled: true }] },
    pAlive: true, wklSameDay: {},
  }, over || {});
}

async function main() {
  console.log('PURE — classifier fixtures');
  {
    // 1. b2 dismissal: routed, perfs, scholar alive, all alive, no ledger.
    const c = classifyFights([mkFight()], []);
    ok(c.rows.length === 1 && c.rows[0].cls === 'b2-dismissal', 'b2-dismissal: routed hushwolf/strike_lead, 0 deaths, no wkl');
    ok(c.unattributed === 0 && c.instrumentErrors === 0, 'b2 row fully attributed, no instrument errors');
    // 2. b2 fled variant: lockpick_raccoon bribed out.
    const c2 = classifyFights([mkFight({ mids: ['lockpick_raccoon'], result: 'fled',
      kindByMid: { lockpick_raccoon: 'offer_food' }, waveByMid: { lockpick_raccoon: 1 },
      knownAtStart: { lockpick_raccoon: 1 }, perfs: { lockpick_raccoon: 1 },
      mortality: { lockpick_raccoon: { dead: 0, alive: 1 } },
      hpByMid: { lockpick_raccoon: [{ hp: 40, maxHp: 40, fled: true }] } })], []);
    ok(c2.rows.length === 1 && c2.rows[0].cls === 'b2-dismissal', 'b2-dismissal: fled lockpick_raccoon/offer_food');
    // 3. b1 performer-died.
    const c3 = classifyFights([mkFight({ mids: ['gallowdeer'], result: 'lost', pAlive: false,
      kindByMid: { gallowdeer: 'move_windup' }, waveByMid: { gallowdeer: 1 },
      knownAtStart: { gallowdeer: 0 }, perfs: { gallowdeer: 3 },
      mortality: { gallowdeer: { dead: 0, alive: 1 } },
      hpByMid: { gallowdeer: [{ hp: 60, maxHp: 160, fled: false }] } })], []);
    ok(c3.rows[0].cls === 'b1-performer-died', 'b1: lost, scholar dead, monster alive');
    // 4. a2 pyrrhic: lost, scholar dead, monster dead too.
    const c4 = classifyFights([mkFight({ day: 10, result: 'lost', pAlive: false,
      mortality: { hushwolf: { dead: 1, alive: 0 } },
      hpByMid: { hushwolf: [{ hp: 0, maxHp: 100, fled: false }] } })], []);
    ok(c4.rows[0].cls === 'a2-pyrrhic', 'a2: lost, scholar dead AND monster dead');
    // 5. attributed: routed + wkl trick entry.
    const c5 = classifyFights([mkFight()], [{ d: 10, mid: 'hushwolf', trick: 'strike_lead', by: 'p', via: 'player' }]);
    ok(c5.rows[0].cls === 'attributed', 'attributed: routed fight with trick-tagged wkl entry');
    // 5b. REGRESSION (proof GREEN caught it): won + perfs + FINAL-wkl trick
    // entry => attributed. The instrument's pre-ledger snapshot cannot see
    // entries the engine writes inside tbEnd; joining at analysis time over
    // the final waveKillLog resolves the s5501 drumbelly_tanuki case.
    const c5b = classifyFights([mkFight({ result: 'won',
      mortality: { hushwolf: { dead: 1, alive: 0 } },
      hpByMid: { hushwolf: [{ hp: 0, maxHp: 100, fled: false }] } })],
      [{ d: 10, mid: 'hushwolf', trick: 'strike_lead', by: 'p', via: 'player' }]);
    ok(c5b.rows[0].cls === 'attributed', 'regression: won fight + final-wkl trick entry => attributed (not won-unattributed)');
    // 6. won + perfs + no wkl => won-unattributed (counts as unattributed).
    const c6 = classifyFights([mkFight({ result: 'won' })], []);
    ok(c6.rows[0].cls === 'won-unattributed' && c6.unattributed === 1, 'won-unattributed flagged and counted');
    // 7. routed + dead monster + NO wkl entry => attribution-gap.
    const c7 = classifyFights([mkFight({ mortality: { hushwolf: { dead: 1, alive: 2 } } })], []);
    ok(c7.rows[0].cls === 'attribution-gap', 'attribution-gap: routed with a death but no ledger entry');
    // 8. missing result => unattributed.
    const c8 = classifyFights([mkFight({ result: null })], []);
    ok(c8.rows[0].cls === 'unattributed' && c8.unattributed === 1, 'null result => unattributed');
    // 9. instrument error: no start capture.
    const c9 = classifyFights([{ seq: 9, started: false, result: 'routed' }]);
    ok(c9.instrumentErrors === 1 && c9.rows.length === 0, 'started:false => instrument error, no rows');
    // 10. no perfs => not in universe.
    const c10 = classifyFights([mkFight({ perfs: {} })], []);
    ok(c10.rows.length === 0, 'no perfs => not in the performed universe');
    // 11. mixed fight: one b2 mid + one attributed mid in the same fight.
    const c11 = classifyFights([mkFight({
      mids: ['hushwolf', 'belltoad'],
      kindByMid: { hushwolf: 'strike_lead', belltoad: 'shout' },
      waveByMid: { hushwolf: 1, belltoad: 1 },
      knownAtStart: { hushwolf: 1, belltoad: 1 },
      perfs: { hushwolf: 1, belltoad: 2 },
      mortality: { hushwolf: { dead: 0, alive: 3 }, belltoad: { dead: 1, alive: 0 } },
      hpByMid: { hushwolf: [{ hp: 100, maxHp: 100, fled: true }], belltoad: [{ hp: 0, maxHp: 60, fled: false }] },
    })], [{ d: 10, mid: 'belltoad', trick: 'shout', by: 'p', via: 'player' }]);
    const byMid = {};
    for (const r of c11.rows) byMid[r.mid] = r.cls;
    ok(byMid.hushwolf === 'b2-dismissal' && byMid.belltoad === 'attributed', 'mixed fight: hushwolf b2, belltoad attributed');
  }
  console.log('PURE — hpShape');
  {
    const s = hpShape([{ hp: 30, maxHp: 100, fled: true }, { hp: 100, maxHp: 100, fled: true }, { hp: 95, maxHp: 100, fled: true }]);
    ok(s.n === 3 && s.minPct === 30 && s.maxPct === 100 && s.fled === 3, 'hpShape: struck lead 30% vs unscathed pack');
    const s0 = hpShape([]);
    ok(s0.n === 0 && s0.minPct === null, 'hpShape: empty => null shape');
  }
  console.log('PURE — replayLedger');
  const CFG = { pointsPerKill: 1, pointsPerCounterKill: 2, perTypeCap: 2 };
  {
    // perTypeCap binding on a farmed species (D2: 2pts/dead, cap 2).
    const r = replayLedger(CFG, { 1: 0 }, { 1: {} }, [
      { mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 5, seq: 1 },
      { mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 6, seq: 2 },
      { mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 7, seq: 3 },
    ], true);
    ok(r.points[1] === 2 && r.deeds.map(d => d.scored).join(',') === '2,0,0', 'perTypeCap=2 binds: 3 known hushwolf dismissals score 2,0,0');
    // D1: no mastery — 1pt each, cap still binds.
    const r1 = replayLedger(CFG, { 1: 0 }, { 1: {} }, [
      { mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 5, seq: 1 },
      { mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 6, seq: 2 },
      { mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 7, seq: 3 },
    ], false);
    ok(r1.points[1] === 2 && r1.deeds.map(d => d.scored).join(',') === '1,1,0', 'D1: 1pt/dead, cap binds at 1,1,0');
    // Unknown trick => base point even on D2.
    const r2 = replayLedger(CFG, { 1: 0 }, { 1: {} }, [
      { mid: 'voice_mimic_radio', wave: 2, knownAtStart: 0, day: 9, seq: 1 },
    ], true);
    ok(r2.points[2] === 1 && r2.deeds[0].points === 1, 'unknown-at-start dismissal scores 1 on D2');
    // Existing ledger fills the cap room: hushwolf already at 1 => room 1.
    const r3 = replayLedger(CFG, { 1: 1 }, { 1: { hushwolf: 1 } }, [
      { mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 9, seq: 1 },
    ], true);
    ok(r3.points[1] === 2 && r3.deeds[0].scored === 1, 'cap room respected against actual ledger state');
    // Fight order: out-of-order input sorts by day,seq.
    const r4 = replayLedger(CFG, { 1: 0 }, { 1: {} }, [
      { mid: 'belltoad', wave: 1, knownAtStart: 1, day: 9, seq: 2 },
      { mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 5, seq: 1 },
    ], false);
    ok(r4.deeds[0].mid === 'hushwolf' && r4.deeds[1].mid === 'belltoad', 'deeds applied in fight order');
  }
  console.log('PURE — rungsOf + counterfactual');
  const CFGB = {
    barsPerWave: { 1: 5, 2: 4, 3: 4, 4: 3, 5: 2 }, wave2DayFloor: 8, dayFloor: 25,
    pointsPerKill: 1, pointsPerCounterKill: 2, perTypeCap: 2,
    warPerKill: 25, t4: 100, t5: 200, plentyCapT5: 100,
  };
  function snap(over) {
    return Object.assign({
      day: 30,
      cfg: CFGB,
      ledgerPoints: { 1: 4, 2: 3, 3: 0, 4: 0, 5: 0 },
      ledgerPerType: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} },
      standing: { war: 0, diplomacy: 0, plenty: 0 },
      gated: 0, rd4Ready: false, rd5Ready: false, peak: 0, w4faced: false,
    }, over || {});
  }
  {
    ok(rungsOf(CFGB, 30, { 1: 5, 2: 0, 3: 0, 4: 0, 5: 0 }, 0, 100, 200, false) === 2, 'rungs: w1 bar full day30 => wave 2');
    ok(rungsOf(CFGB, 7, { 1: 5, 2: 0, 3: 0, 4: 0, 5: 0 }, 0, 100, 200, false) === 1, 'rungs: day floor binds w2 at day7');
    ok(rungsOf(CFGB, 30, { 1: 5, 2: 4, 3: 0, 4: 0, 5: 0 }, 150, 100, 200, false) === 4, 'rungs: w3 rung + standing>=t4 => wave 4');
    ok(rungsOf(CFGB, 30, { 1: 5, 2: 4, 3: 0, 4: 0, 5: 0 }, 250, 100, 200, true) === 5, 'rungs: +t5 +w4faced => wave 5');
    ok(rungsOf(CFGB, 30, { 1: 5, 2: 4, 3: 0, 4: 0, 5: 0 }, 99, 100, 200, false) === 3, 'rungs: standing<t4 holds at 3');
    // Counterfactual: one known hushwolf dismissal flips the w1 bar 4->5 (D1) / 4->6 (D2).
    const dis = [{ mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 10, seq: 1 }];
    const cf = counterfactual(snap(), dis);
    ok(cf.actualWave === 1 && cf.d1Wave === 2 && cf.d2Wave === 2, 'counterfactual: dismissal flips w2 rung (actual 1, D1 2, D2 2)');
    ok(cf.d1.rungs.w2.flipped && !cf.d1.rungs.w3.flipped, 'rung-flip detail: w2 flipped, w3 not');
    ok(cf.d1.deedPoints === 1 && cf.d2.deedPoints === 2, 'D1 scores 1pt, D2 scores 2pt (known)');
    // War source unmoved: w1/w2-only dismissals add no blood standing.
    ok(cf.d2.war === 0, 'w1/w2 dismissals move no standing war (blood source w3+ only)');
    // No-flip case: bar already full.
    const cf2 = counterfactual(snap({ ledgerPoints: { 1: 5, 2: 3, 3: 0, 4: 0, 5: 0 } }), dis);
    ok(cf2.actualWave === 2 && cf2.d1Wave === 2 && !cf2.d1.rungs.w2.flipped, 'no flip when the bar is already full');
    // Deed below the cap room: cap saturated type contributes nothing.
    const cf3 = counterfactual(snap({ ledgerPerType: { 1: { hushwolf: 2 }, 2: {}, 3: {}, 4: {}, 5: {} } }), dis);
    ok(cf3.d1.deedPoints === 0 && cf3.d1Wave === 1, 'saturated per-type cap: dismissal scores nothing');
  }
  console.log('DET — replay stability');
  {
    const dis = [{ mid: 'hushwolf', wave: 1, knownAtStart: 1, day: 10, seq: 1 }, { mid: 'belltoad', wave: 1, knownAtStart: 0, day: 12, seq: 4 }];
    const a = jstable(replayLedger(CFG, { 1: 1 }, { 1: { hushwolf: 1 } }, dis, true));
    const b = jstable(replayLedger(CFG, { 1: 1 }, { 1: { hushwolf: 1 } }, dis, true));
    ok(a === b && a.length > 0, 'replayLedger byte-identical across runs');
    const c = jstable(counterfactual(snap(), dis));
    const d = jstable(counterfactual(snap(), dis));
    ok(c === d && c.length > 0, 'counterfactual byte-identical across runs');
  }
  console.log('RED — gate-off det: composition is the landed instruments');
  {
    const { dayHash } = require('./det-gate');
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const { leadfeast, belongfeast } = require('./policies/feastscale');
    const { vetrelLead, vetrelBelong } = require('./policies/vetrel');
    const { withReposition } = require('./policies/reposition');
    const armedLead = withReposition(vetrelLead, 'reposition-vetrel-lead', 'det');
    const armedBelong = withReposition(vetrelBelong, 'reposition-vetrel-belong', 'det');
    async function trajectory(seed, rp, vt, policyObj) {
      if (rp) process.env.REPOSITION = '1'; else delete process.env.REPOSITION;
      if (vt) process.env.VETREL = '1'; else delete process.env.VETREL;
      const { Game } = await loadGame({ seed, mode: 'dismissal-det', fullTelemetry: false });
      await setupGame(Game);
      const hs = [];
      const oDaily = policyObj.daily;
      const policy = Object.assign({}, policyObj, {
        daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
      });
      await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
      return hs.join('|');
    }
    const tA = await trajectory(204, false, false, armedLead);
    const tB = await trajectory(204, false, false, vetrelLead);
    const tC = await trajectory(204, false, false, leadfeast);
    ok(tA === tB && tA === tC && tA.length > 0, `RED det-gate: gate-off armedLead == vetrelLead == leadfeast (s204) len=${tA.length}`);
    const tD = await trajectory(204, false, false, armedBelong);
    const tE = await trajectory(204, false, false, vetrelBelong);
    const tF = await trajectory(204, false, false, belongfeast);
    ok(tD === tE && tD === tF && tD.length > 0, `RED det-gate: gate-off armedBelong == vetrelBelong == belongfeast (s204) len=${tD.length}`);
    const tOn1 = await trajectory(204, true, true, armedLead);
    const tOn2 = await trajectory(204, true, true, armedLead);
    ok(tOn1 === tOn2 && tOn1.length > 0, 'gate-on deterministic (identical armed 60d byte-identical)');
    delete process.env.REPOSITION; delete process.env.VETREL;
  }
  console.log('GREEN — gate ON records dismissal fields on a real run');
  {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const { vetrelLead } = require('./policies/vetrel');
    const { withReposition } = require('./policies/reposition');
    const { attachDismissalCapture } = require('./dismissal-instrument-20261018');
    const armed = withReposition(vetrelLead, 'reposition-vetrel-lead', 'green');
    process.env.REPOSITION = '1'; process.env.VETREL = '1';
    process.env.SEATDRIVE = '0'; process.env.FEASTSCALE_R13 = '1';
    const { Game } = await loadGame({ seed: 5501, mode: 'dismissal-green', fullTelemetry: true });
    await setupGame(Game);
    const cap = attachDismissalCapture(Game);
    await quietLog(async () => runDays(Game, armed, { days: 60, sampleEvery: 30 }));
    const cls = classifyFights(cap.tbFights, (Game.state || {}).waveKillLog || []);
    const b2 = cls.rows.filter(r => r.cls === 'b2-dismissal');
    ok(cap.tbFights.length > 0, `instrument captured ${cap.tbFights.length} TB fights`);
    const allHaveShape = cls.rows.every(r =>
      r.kind != null && r.wave >= 1 && ('knownAtStart' in r) && Array.isArray(r.hpByMid));
    ok(allHaveShape, 'every classified row carries kind/wave/knownAtStart/hpByMid');
    const wklOk = cls.rows.every(r => Array.isArray(r.wklEntries));
    ok(wklOk, 'every row carries its wkl join');
    console.log(`  info: ${b2.length} b2 dismissal rows on the 60d green run (pool ${b2.length > 0 ? 'NONEMPTY' : 'empty — census would mark unmeasurable'})`);
    ok(cls.unattributed === 0, `0 unattributed rows (got ${cls.unattributed})`);
    ok(cls.instrumentErrors === 0, `0 instrument errors (got ${cls.instrumentErrors})`);
    // Ledger snapshot well-formed.
    const L = Game.ledgerState ? Game.ledgerState() : null;
    ok(L && (L[1].points | 0) >= 0 && typeof L[1].perType === 'object', 'ledger snapshot well-formed');
    const cf = counterfactual({
      day: ((Game.state || {}).scholar || {}).day || 0, cfg: CFGB,
      ledgerPoints: { 1: Game.waveLedgerPoints(1), 2: Game.waveLedgerPoints(2), 3: Game.waveLedgerPoints(3), 4: Game.waveLedgerPoints(4), 5: Game.waveLedgerPoints(5) },
      ledgerPerType: { 1: L[1].perType, 2: L[2].perType, 3: L[3].perType, 4: L[4].perType, 5: L[5].perType },
      standing: { war: 0, diplomacy: 0, plenty: 0 }, gated: 0, rd4Ready: false, rd5Ready: false, peak: 0, w4faced: false,
    }, cls.rows.filter(r => r.cls === 'b2-dismissal').map(r => ({ mid: r.mid, wave: r.wave, knownAtStart: r.knownAtStart, day: r.day, seq: r.seq })));
    ok(typeof cf.d1Wave === 'number' && typeof cf.d2Wave === 'number', 'counterfactual runs over real classified rows');
    cap.restore();
    ok(typeof Game.tbEnd === 'function' && typeof Game.say === 'function', 'restore() returns tbEnd and say');
    delete process.env.REPOSITION; delete process.env.VETREL;
  }
  console.log('SMOKE — 20d instrumented armed run completes schema-clean');
  {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const { vetrelBelong } = require('./policies/vetrel');
    const { withReposition } = require('./policies/reposition');
    const { attachDismissalCapture } = require('./dismissal-instrument-20261018');
    const armed = withReposition(vetrelBelong, 'reposition-vetrel-belong', 'smoke');
    process.env.REPOSITION = '1'; process.env.VETREL = '1';
    process.env.SEATDRIVE = '0'; process.env.FEASTSCALE_R13 = '1';
    const { Game } = await loadGame({ seed: 5502, mode: 'dismissal-smoke', fullTelemetry: true });
    await setupGame(Game);
    const cap = attachDismissalCapture(Game);
    const result = await quietLog(async () => runDays(Game, armed, { days: 20, sampleEvery: 10 }));
    cap.restore();
    const keys = ['seq', 'day', 'result', 'mids', 'kindByMid', 'waveByMid', 'knownAtStart', 'perfs', 'mortality', 'hpByMid', 'pAlive', 'wklSameDay'];
    const schemaOk = cap.tbFights.every(f => keys.every(k => k in f));
    ok(result.days > 0 && schemaOk, `20d armed run completes schema-clean (${result.days}d, ${cap.tbFights.length} fights)`);
    delete process.env.REPOSITION; delete process.env.VETREL;
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FAILED:', e && e.stack || e); process.exit(1); });
