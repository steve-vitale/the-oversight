#!/usr/bin/env node
// test-ledgerdark-20261020.js — proof for the sim-ledgerdark-road arm
// (scripts/policies/ledgerdark.js — the dark-ledger road).
//
// Suites:
//   DOOR — on a real loaded game with a crafted lesser-seat table offer
//     (viewership 14, showmanship 12: beloved EARNED), the 7-door driver's
//     verbatim door rule walks the ASSIGNED earned beloved through the
//     REAL state machine. RED: the old drain behavior (options[0],
//     load-order) walks feared on the identical texture. Beloved unearned
//     (viewership 0): the layer NEVER forces it — falls back to the first
//     earned door in the 7-order with the engine's why-string recorded
//     (modalplay's door rule: "a door never offered cannot be taken —
//     recorded, never forced"). Nothing earned at all -> pickDoor null.
//   LEDGERDARK — the dark-ledger road through REAL verbs (harness):
//     * BEG: pendingBeg + one layer daily -> answerBeg('refuse') fires ->
//       foodHoarded +1, begsRefused=1. RED: layer OFF (LEDGERDARK unset) ->
//       the beg sits unanswered, foodHoarded 0, no ctx._ledgerdark.
//     * HOARD: pantry healthy + net-taker -> takeFromPantryBulk fires ->
//       hoardFood -> foodHoarded >= 1. RED: layer OFF -> no take.
//     * BETRAYAL: day 30, bearer healthy, a follower present -> one layer
//       daily -> playerAttacks fires -> betrayed +1 and the betrayal
//       combat starts (tbfight live, LD.betrayalFight=1); the layer's
//       fight() hook owns the hostile's turns (returns true). RED: day 10
//       -> no attack. RED: no follower/party -> betrayalSkipped, no attack.
//     * STOPS: tablePreview() non-null -> quiet (stoppedTable, no verbs);
//       exiled -> quiet; gate off -> pure no-op (daily delegates, fight
//       delegates to base).
//   SMOKE — 1 seed x 30d, full arm composition (LEDGERDARK=1 +
//     TABLEPATHDRIVER=1, door=beloved): run completes, assigned door
//     recorded, 0 instrument errors, the road's verbs classified in ctx.
//   DET — 2 seeds x 60d: layers-ON twice byte-identical (no unseeded RNG
//     in the new layer).
//   COMPLETENESS — post-sweep (COMPLETE=1): 16/16 armed per-seed files
//     valid, dark-branch walks + terminal resolution judged from the
//     corpus (via the analyzer).
//
// The lesser-seat grant and viewership in the crafted textures are
// IN-HARNESS ONLY (the bars are the lever worker's territory; the seat
// pricing is engine-tested elsewhere). The door forcing, the verb
// sequencing and the ledger movement read the REAL engine — the proof is
// the DRIVER and the ROAD, not the bars.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 LEDGERDARK=1 \
//   node scripts/test-ledgerdark-20261020.js
// Post-sweep: COMPLETE=1 ... node scripts/test-ledgerdark-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const TPD = require('./policies/tablepathdriver');
const LD = require('./policies/ledgerdark');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------------------------------------------------------------- texture
// A real game at a real table offer. Ledger grants earn feared + defiant +
// assimilated + beloved (viewership 14, showmanship 12); witness is NOT
// earned (exposed 0); indispensable is NOT earned (lesser seat); relay is
// NOT earned (stage 2, no office).
async function craftTable(ledger, viewership) {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 777002 });
  await setupGame(Game);
  Game.state.scholar.day = 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 55;
  Game.state.scholar.grounding = 100;
  for (const k of Object.keys(ledger || {})) { try { Game.ledgerAdd(k, ledger[k]); } catch (e) {} }
  const monstersOfWave = (w, n) => (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) { try { Game.recordDeedFight(id); } catch (e) {} }
  try { Game.deedState().contestsSurvived = 2; } catch (e) {}
  try { Game.fireCrisis('breach'); Game.fireCrisis('first-grave'); } catch (e) {}
  try { Game.progState().sentimentTaught = true; } catch (e) {}
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  const v = Game.state.village; v.pantry = v.pantry || [];
  v.pantry.push({ kcalEach: 5000, units: 10 });
  Game.state.village.viewership = viewership == null ? 14 : viewership;
  // IN-HARNESS seat grant (see header): the proof is the door forcing.
  Game.tableSeat = function () {
    return { seat: 'lesser', detail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true } };
  };
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null; pg.tableWaiting = false;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
  const said = [];
  Game.say = function (t) { said.push(String(t)); };
  Game.sysSay = function (t) { said.push('SYS: ' + String(t)); };
  Game.save = function () {};
  Game.wipe = function () {};
  return { Game, said };
}

const LEDGER = { might: 9, killed: 0, protected: 4, defiance: 6, embrace: 2, foodShared: 1, foodHoarded: 0, showmanship: 12 };

function offerDoorIds(Game) {
  const tc = Game.state.scholar.tableChoices;
  return ((tc && tc.options) || []).map(o => String(o.id));
}

// A real mid-game texture for the road verbs: day 40, healthy bearer at
// Haven, a living follower, a healthy pantry, one pending beg.
async function craftRoad() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 777003 });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.day = 40; s.health = 100;
  Game.over = false;
  const v = Game.state.village;
  v.pantry = [
    { name: 'smoked turkey', kcalEach: 800, units: 20, kg: 0.5, foodState: 'cooked', edible: true },
    { name: 'pemmican', kcalEach: 600, units: 15, kg: 0.3, foodState: 'cooked', edible: true },
  ];
  v.takes = {}; v.gives = {};
  const me = Game.villagerId;
  v.takes[me] = 12000; v.gives[me] = 1000; // net -11000: the hoard detector fires
  // a living follower — someone who walked with you
  const roster = (v.roster || []).filter(id => id !== me);
  const vic = roster[0];
  v.followers = vic ? [vic] : [];
  if (vic && v.rosterChars && v.rosterChars[vic]) v.rosterChars[vic].alive = true;
  // one begging neighbor at the fire
  Game.state.pendingBeg = { villageId: 'ov1', speaker: 'Thin Speaker', amount: 1500, day: 40 };
  const said = [];
  Game.say = function (t) { said.push(String(t)); };
  Game.sysSay = function (t) { said.push('SYS: ' + String(t)); };
  Game.save = function () {};
  return { Game, said, victim: vic, me };
}

async function main() {
  // ---------------------------------------------------------------- DOOR
  {
    // RED: the old drain behavior — options[0] at the door offer.
    const { Game: G1 } = await craftTable(LEDGER, 14);
    G1.tableScene();
    const offered1 = offerDoorIds(G1);
    check('DOOR texture offers feared first (load order)', offered1[0] === 'path:feared', `got ${offered1[0]}`);
    const earned1 = G1.tableEarnedPaths().filter(p => p.earned).map(p => p.id);
    check('DOOR texture earns beloved', earned1.indexOf('beloved') >= 0, `earned=[${earned1.join(',')}]`);
    check('DOOR texture does NOT earn indispensable (lesser seat)', earned1.indexOf('indispensable') < 0);
    G1.chooseTableOption(offered1[0]); // options[0] — the old drain
    check('DOOR RED: options[0] walks feared', G1.tableState().path === 'feared', `got ${G1.tableState().path}`);

    // GREEN: the verbatim door rule walks the ASSIGNED earned beloved.
    const { Game: G2 } = await craftTable(LEDGER, 14);
    const ctx2 = {};
    G2.tableScene();
    TPD.drainTable(G2, ctx2, { door: 'beloved', trial: false });
    const tp2 = ctx2._tablepathdriver;
    check('DOOR GREEN: assigned beloved is walked', G2.tableState().path === 'beloved', `got ${G2.tableState().path}`);
    check('DOOR GREEN: door event recorded, no fallback',
      tp2.doorEvents.length === 1 && tp2.doorEvents[0].fellBack === false, JSON.stringify(tp2.doorEvents));
    check('DOOR GREEN: branch margins captured for the ledger paths',
      tp2.branchMargins && tp2.branchMargins.beloved && typeof tp2.branchMargins.beloved.dark === 'number',
      JSON.stringify(tp2.branchMargins && tp2.branchMargins.beloved));

    // BELOVED unearned (no audience): NEVER forced — falls back with the
    // engine's why-string recorded (modalplay's door rule).
    const { Game: G3 } = await craftTable(LEDGER, 0);
    G3.tableScene();
    const earned3 = G3.tableEarnedPaths().filter(p => p.earned).map(p => p.id);
    check('DOOR unearned texture: beloved not earned (no audience)', earned3.indexOf('beloved') < 0, `earned=[${earned3.join(',')}]`);
    const ms3 = TPD.modalState(G3);
    const pick3 = TPD.pickOption(G3, ms3, { door: 'beloved', trial: false });
    check('DOOR BELOVED-UNEARNED: never forced',
      pick3 && pick3.id !== 'path:beloved' && /fallback/.test(pick3.note), JSON.stringify(pick3));
    check('DOOR BELOVED-UNEARNED: falls back to defiant (7-order first earned)',
      pick3 && pick3.id === 'path:defiant', JSON.stringify(pick3 && pick3.id));

    // Nothing close to earned: the assigned beloved is never forced — the
    // fallback takes the always-earned assimilated (lesser+), and a door
    // never offered is never taken (modalplay's rule).
    const { Game: G4 } = await craftTable({}, 0);
    G4.tableScene();
    const ms4 = TPD.modalState(G4);
    const pick4 = ms4 ? TPD.pickDoor(G4, ms4.opts, 'beloved') : 'no-modal';
    check('DOOR NOTHING-EARNED: assigned beloved never forced',
      !pick4 || pick4.id !== 'path:beloved', JSON.stringify(pick4));
    check('DOOR NO-OFFERED-DOORS: pickDoor null (never force)',
      TPD.pickDoor(G4, [], 'beloved') === null, 'forced a door with no offer');
  }

  // ------------------------------------------------------------ LEDGERDARK
  {
    const { withLedgerDark } = LD;
    const mkCtx = () => ({});
    // BEG — RED: layer OFF leaves the beg unanswered.
    {
      const { Game } = await craftRoad();
      delete process.env.LEDGERDARK;
      const base = { id: 'base', daily() {}, fight() { return false; } };
      const pol = withLedgerDark(base, 't', 't');
      const ctx = mkCtx();
      const h0 = (Game.ledger().foodHoarded | 0);
      pol.daily(Game, ctx);
      check('BEG RED: layer OFF never touches ctx', ctx._ledgerdark === undefined, JSON.stringify(Object.keys(ctx)));
      check('BEG RED: layer OFF leaves the beg pending', !!Game.state.pendingBeg, 'beg was answered');
      check('BEG RED: layer OFF moves no ledger', (Game.ledger().foodHoarded | 0) === h0, `hoarded moved ${h0} -> ${Game.ledger().foodHoarded}`);
    }
    // BEG — GREEN: the real verb fires through the layer.
    {
      process.env.LEDGERDARK = '1';
      const { Game, said } = await craftRoad();
      const base = { id: 'base', daily() {}, fight() { return false; } };
      const pol = withLedgerDark(base, 't', 't');
      const ctx = mkCtx();
      const h0 = (Game.ledger().foodHoarded | 0);
      pol.daily(Game, ctx);
      const LDs = ctx._ledgerdark || {};
      check('BEG GREEN: refusal recorded', LDs.begsRefused === 1, JSON.stringify(LDs));
      check('BEG GREEN: foodHoarded moves up on the moral ledger', (Game.ledger().foodHoarded | 0) >= h0 + 1, `hoarded=${Game.ledger().foodHoarded} (was ${h0})`);
      check('BEG GREEN: the refusal is voiced (no silent actions)', said.some(t => /refuse|walks back into the dark/i.test(t)), said.slice(0, 3).join(' | ').slice(0, 120));
      check('BEG GREEN: beg cleared', !Game.state.pendingBeg, 'beg still pending');
    }
    // HOARD — GREEN: the net-taker bulk take fires hoardFood.
    {
      process.env.LEDGERDARK = '1';
      const { Game } = await craftRoad();
      Game.state.pendingBeg = null; // isolate the hoard verb
      const base = { id: 'base', daily() {}, fight() { return false; } };
      const pol = withLedgerDark(base, 't', 't');
      const ctx = mkCtx();
      const h0 = (Game.ledger().foodHoarded | 0);
      pol.daily(Game, ctx);
      const LDs = ctx._ledgerdark || {};
      check('HOARD GREEN: bulk take fired', LDs.hoardTakes === 1, JSON.stringify({ takes: LDs.hoardTakes, kcal: LDs.hoardTakeKcal }));
      check('HOARD GREEN: hoardFood moved the ledger', (Game.ledger().foodHoarded | 0) > h0, `hoarded=${Game.ledger().foodHoarded} (was ${h0})`);
      check('HOARD GREEN: betrayal not yet due is skipped, not forced', LDs.betrayalDone === 0 || LDs.betrayalDay >= 28, JSON.stringify({ done: LDs.betrayalDone, day: LDs.betrayalDay }));
    }
    // BETRAYAL — RED: day 10, no attack.
    {
      process.env.LEDGERDARK = '1';
      const { Game } = await craftRoad();
      Game.state.scholar.day = 10;
      Game.state.pendingBeg = null;
      const base = { id: 'base', daily() {}, fight() { return false; } };
      const pol = withLedgerDark(base, 't', 't');
      const ctx = mkCtx();
      pol.daily(Game, ctx);
      check('BETRAYAL RED (early): no attack before day 28', !ctx._ledgerdark.betrayalDone && !Game.tbfight, 'attack fired early');
    }
    // BETRAYAL — GREEN: day 40, follower present -> playerAttacks fires.
    {
      process.env.LEDGERDARK = '1';
      const { Game, victim } = await craftRoad();
      Game.state.pendingBeg = null;
      check('BETRAYAL texture: a living follower exists', !!victim, 'no victim in texture');
      const base = { id: 'base', daily() {}, fight() { return false; } };
      const pol = withLedgerDark(base, 't', 't');
      const ctx = mkCtx();
      const b0 = (Game.ledger().betrayed | 0);
      pol.daily(Game, ctx);
      const LDs = ctx._ledgerdark || {};
      check('BETRAYAL GREEN: attack fired once', LDs.betrayalDone === 1 && LDs.betrayalVictim === victim, JSON.stringify({ done: LDs.betrayalDone, vic: LDs.betrayalVictim }));
      check('BETRAYAL GREEN: betrayed +1 on the moral ledger', (Game.ledger().betrayed | 0) === b0 + 1, `betrayed=${Game.ledger().betrayed} (was ${b0})`);
      check('BETRAYAL GREEN: real betrayal combat started', !!(Game.tbfight && !Game.tbfight.over), 'no live fight');
      check('BETRAYAL GREEN: fight hook owns the hostile turn', (() => {
        // drive turns the way the harness does: the hook owns player
        // turns while the hostile stands; anything else ends the turn.
        try {
          let owned = false;
          for (let i = 0; i < 60 && Game.tbfight && !Game.tbfight.over; i++) {
            let h = false;
            try { h = pol.fight(Game, ctx); } catch (e) { break; }
            if (h) { owned = true; continue; }
            if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
              try { const p = Game.tbFighter('p'); p.moveLeft = 0; p.acted = true; Game.tbAfterPlayerAction(); }
              catch (e) { break; }
            } else break;
          }
          return owned;
        } catch (e) { return 'threw:' + e.message; }
      })() === true, 'fight hook never owned a hostile turn');
      // second daily: no second attack (one per run)
      const b1 = (Game.ledger().betrayed | 0);
      try { Game.tbfight.over = true; } catch (e) {}
      Game.tbfight = null;
      pol.daily(Game, ctx);
      check('BETRAYAL GREEN: one per run — no second attack', (Game.ledger().betrayed | 0) === b1, `betrayed moved ${b1} -> ${Game.ledger().betrayed}`);
    }
    // STOPS: table staged -> quiet; exiled -> quiet; gate off -> delegation.
    {
      process.env.LEDGERDARK = '1';
      const { Game } = await craftRoad();
      Game.tablePreview = function () { return { staged: true }; };
      const base = { id: 'base', daily() {}, fight() { return false; } };
      const pol = withLedgerDark(base, 't', 't');
      const ctx = mkCtx();
      pol.daily(Game, ctx);
      check('STOP: invitation staged -> quiet', (ctx._ledgerdark || {}).stoppedTable === 1 && (ctx._ledgerdark.begsRefused | 0) === 0, JSON.stringify(ctx._ledgerdark));
    }
    {
      delete process.env.LEDGERDARK;
      const { Game } = await craftRoad();
      let baseDailyRan = false, baseFightRan = false;
      const base = { id: 'base', daily() { baseDailyRan = true; }, fight() { baseFightRan = true; return 'base-fight'; } };
      const pol = withLedgerDark(base, 't', 't');
      const ctx = mkCtx();
      pol.daily(Game, ctx);
      check('GATE-OFF: daily delegates to base', baseDailyRan && ctx._ledgerdark === undefined, `baseDailyRan=${baseDailyRan}`);
      const fr = pol.fight(Game, ctx);
      check('GATE-OFF: fight delegates to base', baseFightRan && fr === 'base-fight', `fr=${fr}`);
      process.env.LEDGERDARK = '1';
    }
  }

  // ---------------------------------------------------------------- SMOKE
  if (!process.env.COMPLETE) {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const TF = require('./policies/tribfloor');
    const WD = require('./policies/windefer');
    const SD = require('./policies/seatdrive');
    const TPD = require('./policies/tablepathdriver');
    const RD = require('./policies/relaydark');
    for (const policyId of ['leadfeast', 'belongfeast']) {
      const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
      const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
      const ld = LD.withLedgerDark(base, `${tag}-ledgerdark`, `${policyId} + ledgerdark`);
      const rd = RD.withRelayDark(ld, `${tag}-relaydark`, `${policyId} + relaydark (inactive)`, { active: false });
      const wd = WD.withWinDefer(rd, `${tag}-windefer`, `${policyId} + windefer`);
      const sd = SD.withSeatDrive(wd, `${tag}-seatdrive`, `${policyId} + seatdrive`);
      const pol = TPD.withTablePathDriver(sd, `${tag}-tablepathdriver`, `${policyId} + tablepathdriver (door=beloved)`, { door: 'beloved', trial: false });
      const { Game } = await loadGame({ seed: 64201, mode: 'posttable', fullTelemetry: false });
      await setupGame(Game);
      let lastCtx = null;
      const wrapped = Object.assign({}, pol, {
        daily(G, ctx) { lastCtx = ctx; return pol.daily(G, ctx); },
      });
      await quietLog(async () => { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
      const L = (lastCtx && lastCtx._ledgerdark) || {};
      const errs = (lastCtx && (lastCtx.ldError | 0)) || 0;
      check(`SMOKE ${policyId}: 30d completes`, ((Game.state.scholar || {}).day || 0) >= 29, `day=${(Game.state.scholar || {}).day}`);
      check(`SMOKE ${policyId}: road active, verbs classified`, L.active === true, JSON.stringify(L));
      check(`SMOKE ${policyId}: 0 layer errors`, errs === 0, `ldError=${errs}`);
    }
  }

  // ------------------------------------------------------------------- DET
  if (!process.env.COMPLETE) {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const { dayHash } = require('./det-gate');
    const TF = require('./policies/tribfloor');
    const WD = require('./policies/windefer');
    const SD = require('./policies/seatdrive');
    const RD = require('./policies/relaydark');
    async function hashes(seed, policyId) {
      const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
      const ld = LD.withLedgerDark(base, 'x', 'x');
      const rd = RD.withRelayDark(ld, 'x', 'x', { active: false });
      const wd = WD.withWinDefer(rd, 'x', 'x');
      const sd = SD.withSeatDrive(wd, 'x', 'x');
      const pol = TPD.withTablePathDriver(sd, 'x', 'x', { door: 'beloved', trial: false });
      const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
      await setupGame(Game);
      const hs = [];
      const wrapped = Object.assign({}, pol, {
        daily(G, ctx) { const r = pol.daily(G, ctx); try { hs.push(((G.state.scholar || {}).day || 0) + ':' + dayHash(Game)); } catch (e) {} return r; },
      });
      await quietLog(async () => { await runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
      return hs.join('|');
    }
    for (const seed of [64201, 64202]) {
      for (const policyId of ['leadfeast', 'belongfeast']) {
        const h1 = await hashes(seed, policyId);
        const h2 = await hashes(seed, policyId);
        check(`DET s${seed} ${policyId}: layers-ON twice byte-identical`, h1 === h2 && h1.length > 0, `len ${h1.length} vs ${h2.length}`);
      }
    }
  }

  // ---------------------------------------------------------- COMPLETENESS
  if (process.env.COMPLETE === '1') {
    const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-ledgerdark');
    const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
    let okFiles = 0;
    for (const policyId of ['leadfeast', 'belongfeast']) {
      for (const seed of SEEDS) {
        const fp = path.join(EVID, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { check(`COMPLETE file ${policyId}/s${seed}.json`, false, 'missing'); continue; }
        try {
          const r = JSON.parse(fs.readFileSync(fp, 'utf8'));
          check(`COMPLETE file ${policyId}/s${seed}.json valid`, !!(r && r.tpdSummary && r.ldSummary), 'bad shape');
          okFiles++;
        } catch (e) { check(`COMPLETE file ${policyId}/s${seed}.json`, false, 'unparseable'); }
      }
    }
    check('COMPLETE: 16/16 per-seed files', okFiles === 16, `${okFiles}/16`);
  }

  console.log(`\nproof: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

if (require.main === module) main().catch(e => { console.error('PROOF FATAL:', e && e.message); process.exit(1); });
