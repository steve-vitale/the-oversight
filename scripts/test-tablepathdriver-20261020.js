#!/usr/bin/env node
// test-tablepathdriver-20261020.js — proof for the sim-tablepathdriver arm
// (scripts/policies/tablepathdriver.js + scripts/policies/relaydark.js).
//
// Suites:
//   DOOR — on a real loaded game with a crafted lesser-seat table offer,
//     the layer's door rule walks the ASSIGNED earned door through the
//     REAL state machine (tableScene → tableOfferPaths → chooseTableOption
//     → tableStartPath). RED: the old drain behavior (options[0],
//     load-order) walks feared on the identical texture; the layer with
//     door='defiant' walks defiant. INDISPENSABLE/WITNESS: assigned but
//     unearned (lesser seat / exposed=0) — the layer NEVER forces them;
//     it falls back to the first earned door in the 7-order and records
//     the engine's own why-string (the documented finding, not a driver
//     failure).
//   DRAIN — the full drainTable through a real defiant walk reaches phase
//     'done' with Game.won true and a complete attribution log (door
//     event, walked entry, branch, finals event, branch margins).
//   RELAYDARK — the dark-relay road:
//     * REAL-VERB (harness): on a real loaded game with networkLive set
//       (the relay's real precondition — the proof is the road, not
//       link-earning), 30 layer-dailies drive claim → deepen →
//       reroute-efficient → rewrite/skim through the REAL verbs; asserts
//       the unlock chain (delayed>=3 → rewrite, routed>=15 → skim), lean
//       going total, darkUses accumulating, grounding eroding, bond >= 2.
//     * DONE-PREDICATE: with grounding set to 45 (in-harness — the sweep
//       earns it via holding days), one more daily completes the road.
//     * STOPS: tablePreview non-null → quiet (stoppedTable); grounding at
//       the floor → floorStop, no more verbs; gate off → pure no-op.
//   SMOKE — 1 seed x 30d, TABLEPATHDRIVER=1 + RELAYDARK=1: run completes,
//     assigned door recorded, 0 instrument errors.
//   DET — 2 seeds x 60d: layers-ON twice byte-identical (no unseeded RNG
//     in the new layers).
//   COMPLETENESS — post-sweep (COMPLETE=1): 16/16 armed per-seed files
//     valid, invitation→sitting conversion measured, the five PRIMARY legs
//     judged from the corpus (via the analyzer).
//
// The lesser-seat grant and networkLive in the crafted textures are
// IN-HARNESS ONLY (the bars are the lever worker's territory; the seat
// pricing and link-earning are engine-tested elsewhere). The door forcing
// and the verb sequencing read the REAL engine — the proof is the DRIVER
// and the ROAD, not the bars.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 RELAYDARK=1 \
//   node scripts/test-tablepathdriver-20261020.js
// Post-sweep: COMPLETE=1 ... node scripts/test-tablepathdriver-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const TPD = require('./policies/tablepathdriver');
const RD = require('./policies/relaydark');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------------------------------------------------------------- texture
// A real game at a real table offer. Ledger grants earn feared + defiant +
// assimilated; beloved is NOT earned (viewership 0); witness is NOT earned
// (exposed 0); indispensable is NOT earned (lesser seat); relay is NOT
// earned (stage 2, no office).
async function craftTable(ledger) {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 777001 });
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
  Game.state.village.viewership = 0;
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

const LEDGER = { might: 9, killed: 3, protected: 8, defiance: 6, embrace: 2, foodShared: 6, foodHoarded: 0, showmanship: 8 };

function offerDoorIds(Game) {
  const tc = Game.state.scholar.tableChoices;
  return ((tc && tc.options) || []).map(o => String(o.id));
}

async function main() {
  // ---------------------------------------------------------------- DOOR
  {
    // RED: the old drain behavior — options[0] at the door offer.
    const { Game: G1 } = await craftTable(LEDGER);
    G1.tableScene();
    const offered1 = offerDoorIds(G1);
    check('DOOR texture offers feared first (load order)', offered1[0] === 'path:feared', `got ${offered1[0]}`);
    const earned1 = G1.tableEarnedPaths().filter(p => p.earned).map(p => p.id);
    check('DOOR texture earns feared+defiant+assimilated',
      earned1.indexOf('feared') >= 0 && earned1.indexOf('defiant') >= 0 && earned1.indexOf('assimilated') >= 0,
      `earned=[${earned1.join(',')}]`);
    check('DOOR texture does NOT earn indispensable (lesser seat)', earned1.indexOf('indispensable') < 0, `earned=[${earned1.join(',')}]`);
    check('DOOR texture does NOT earn witness (exposed=0)', earned1.indexOf('witness') < 0);
    G1.chooseTableOption(offered1[0]); // options[0] — the old drain
    check('DOOR RED: options[0] walks feared', G1.tableState().path === 'feared', `got ${G1.tableState().path}`);

    // GREEN: the layer forces the assigned earned door through the real machine.
    const { Game: G2 } = await craftTable(LEDGER);
    const ctx2 = {};
    G2.tableScene();
    TPD.drainTable(G2, ctx2, { door: 'defiant', trial: false });
    const tp2 = ctx2._tablepathdriver;
    check('DOOR GREEN: assigned defiant is walked', G2.tableState().path === 'defiant', `got ${G2.tableState().path}`);
    check('DOOR GREEN: door event recorded, no fallback',
      tp2.doorEvents.length === 1 && tp2.doorEvents[0].fellBack === false, JSON.stringify(tp2.doorEvents));
    check('DOOR GREEN: walked entry has path+branch',
      tp2.walked.length === 1 && tp2.walked[0].path === 'defiant' && !!tp2.walked[0].branch,
      JSON.stringify(tp2.walked));

    // INDISPENSABLE: assigned but unearned — NEVER forced; falls back with
    // the engine's why-string recorded.
    const { Game: G3 } = await craftTable(LEDGER);
    G3.tableScene();
    const ms3 = TPD.modalState(G3);
    const pick3 = TPD.pickOption(G3, ms3, { door: 'indispensable', trial: false });
    check('DOOR INDISPENSABLE: never forced when unearned',
      pick3 && pick3.id !== 'path:indispensable' && /fallback/.test(pick3.note), JSON.stringify(pick3));
    check('DOOR INDISPENSABLE: engine why-string recorded',
      pick3 && pick3.doorEvent && /full seat/i.test(pick3.doorEvent.missWhy || ''),
      JSON.stringify(pick3 && pick3.doorEvent && pick3.doorEvent.missWhy));
    check('DOOR INDISPENSABLE: falls back to defiant (7-order)',
      pick3 && pick3.id === 'path:defiant', JSON.stringify(pick3 && pick3.id));

    // WITNESS: assigned but unearned (exposed=0) — never forced.
    const { Game: G4 } = await craftTable(LEDGER);
    G4.tableScene();
    const ms4 = TPD.modalState(G4);
    const pick4 = TPD.pickOption(G4, ms4, { door: 'witness', trial: false });
    check('DOOR WITNESS: never forced when unearned',
      pick4 && pick4.id !== 'path:witness' && /fallback/.test(pick4.note), JSON.stringify(pick4));
    check('DOOR WITNESS: engine why-string recorded',
      pick4 && pick4.doorEvent && /exposures on record/.test(pick4.doorEvent.missWhy || ''),
      JSON.stringify(pick4 && pick4.doorEvent && pick4.doorEvent.missWhy));
  }

  // ---------------------------------------------------------------- DRAIN
  {
    // Full drain through a real defiant walk: done + won + complete log +
    // the engine's branch margins captured at door-walk.
    const { Game: G } = await craftTable(LEDGER);
    const ctx = {};
    G.tableScene();
    TPD.drainTable(G, ctx, { door: 'defiant', trial: false });
    const T = G.tableState();
    const tp = ctx._tablepathdriver;
    check('DRAIN reaches phase done', T.phase === 'done', `phase=${T.phase}`);
    check('DRAIN won', G.won === true, `won=${G.won} over=${G.over}`);
    check('DRAIN walked defiant', tp.walked.length >= 1 && tp.walked[0].path === 'defiant', JSON.stringify(tp.walked));
    check('DRAIN branch recorded (ledger-earned, never overridden)', !!tp.walked[0].branch, `branch=${tp.walked[0].branch}`);
    check('DRAIN finals event recorded', tp.finalsEvents.length >= 1, `finals=${tp.finalsEvents.length}`);
    check('DRAIN branch margins captured (engine tableBranch)',
      tp.branchMargins && tp.branchMargins.feared && typeof tp.branchMargins.feared.dark === 'number',
      JSON.stringify(Object.keys(tp.branchMargins || {})));
    check('DRAIN log complete', tp.log.length >= 4 && tp.answers === tp.log.length, `answers=${tp.answers} log=${tp.log.length}`);
  }

  // ---------------------------------------------------------------- RELAYDARK
  {
    // REAL-VERB: the dark road through the real verb surface. networkLive
    // is set in-harness (the relay's real precondition — the proof is the
    // road, not link-earning); stage 2 via systemArrived + integration.
    const { loadGame, setupGame } = require('./sim-harness');
    const { Game } = await loadGame({ seed: 777002 });
    await setupGame(Game);
    Game.state.scholar.day = 60;
    Game.state.systemArrived = true;
    Game.state.scholar.integration = 55; // stage 2
    Game.state.scholar.grounding = 100;
    Game.state.networkLive = true; // the relay's real precondition
    const said = [];
    Game.say = function (t) { said.push(String(t)); };
    Game.sysSay = function (t) { said.push('SYS: ' + String(t)); };
    Game.save = function () {};
    const ctx = {};
    // 30 layer-dailies (the layer does one verb per call).
    for (let i = 0; i < 30; i++) RD.relayDarkDaily(Game, ctx, { active: true });
    const rd = ctx._relaydark || {};
    const st = RD.relayState(Game);
    check('RELAYDARK REAL-VERB: relay claimed', rd.claimed === 1, JSON.stringify({ claimed: rd.claimed, claimFailed: rd.claimFailed }));
    check('RELAYDARK REAL-VERB: bond >= 2 via deepen', (st.bond | 0) >= 2, `bond=${st.bond} deepens=${rd.deepens}`);
    check('RELAYDARK REAL-VERB: efficient unlocked rewrite+skim (delayed>=3, routed>=15)',
      st.hasRewrite && st.hasSkim, `hasRewrite=${st.hasRewrite} hasSkim=${st.hasSkim} efficients=${rd.efficients}`);
    check('RELAYDARK REAL-VERB: dark uses accumulate', st.darkUses >= 6, `darkUses=${st.darkUses} rewrites=${rd.rewrites} skims=${rd.skims}`);
    check('RELAYDARK REAL-VERB: lean driven total (band dark)',
      st.lean != null && st.lean <= -40, `lean=${st.lean} band=${st.band}`);
    check('RELAYDARK REAL-VERB: grounding eroding (the two-way cost)',
      st.grounding != null && st.grounding < 100, `grounding=${st.grounding}`);
    check('RELAYDARK REAL-VERB: light uses stay 0 (no light verbs)',
      st.lightUses === 0, `lightUses=${st.lightUses}`);
    check('RELAYDARK REAL-VERB: no verb errors', (rd.verbError | 0) === 0 && (rd.nullVerbs | 0) < 25, `verbError=${rd.verbError} nullVerbs=${rd.nullVerbs}`);

    // DONE-PREDICATE: with grounding at 45 (in-harness — the sweep earns
    // it via holding days), one more daily completes the road.
    Game.state.scholar.grounding = 45;
    RD.relayDarkDaily(Game, ctx, { active: true });
    check('RELAYDARK DONE: road completes at targets', (ctx._relaydark.done | 0) === 1, JSON.stringify({ done: ctx._relaydark.done, lean: ctx._relaydark.lean, grounding: ctx._relaydark.grounding }));

    // STOPS: tablePreview non-null → quiet.
    const ctx2 = {};
    Game.tablePreview = function () { return { ready: true, seat: 'lesser' }; };
    RD.relayDarkDaily(Game, ctx2, { active: true });
    check('RELAYDARK STOP: quiet once the invitation stages', (ctx2._relaydark.stoppedTable | 0) === 1 && (ctx2._relaydark.claimed | 0) === 0, JSON.stringify(ctx2._relaydark));
    delete Game.tablePreview;

    // FLOOR: grounding at/below the floor → no more verbs (stub Game —
    // the floor branch is layer logic; the verbs are engine-tested above).
    // lean is ABOVE the dark target here so the completion check does not
    // fire first — the floor must stop the verbs on its own.
    const verbs = [];
    const stub = {
      over: false,
      progState: () => ({}),
      tablePreview: () => null,
      relayHeldByBearer: () => true,
      relayLean: () => -10, relayBand: () => 'grey',
      grounding: () => 30, sysBond: () => 3, integrationStage: () => 2,
      switchboard: () => ({ delayed: 9, routed: 20 }),
      relayHas: () => true,
      relayDeepen: () => { verbs.push('deepen'); return 'deepened'; },
      relayReroute: () => { verbs.push('reroute'); return 'rerouted'; },
      relayRewrite: () => { verbs.push('rewrite'); return 'rewritten'; },
      relaySkim: () => { verbs.push('skim'); return 'skimmed'; },
      state: { scholar: { relayAbils: { rewrite: { uses: 9 }, skim: { uses: 9 } }, day: 70 } },
    };
    const ctx3 = {};
    RD.relayDarkDaily(stub, ctx3, { active: true });
    check('RELAYDARK FLOOR: no verbs at/below the grounding floor',
      verbs.length === 0 && (ctx3._relaydark.floorStop | 0) === 1, `verbs=[${verbs.join(',')}] floorStop=${ctx3._relaydark.floorStop}`);

    // GATE-OFF: pure no-op (no ctx writes beyond the shell, no verbs).
    const ctx4 = {};
    const verbs4 = [];
    const stub4 = Object.assign({}, stub, {
      relayDeepen: () => { verbs4.push('deepen'); return null; },
      state: { scholar: { relayAbils: {}, day: 70 } },
    });
    const envWas = process.env.RELAYDARK;
    delete process.env.RELAYDARK;
    const before = JSON.stringify(ctx4);
    RD.relayDarkDaily(stub4, ctx4, { active: true });
    if (envWas === undefined) delete process.env.RELAYDARK; else process.env.RELAYDARK = envWas;
    check('RELAYDARK GATE-OFF: pure no-op', verbs4.length === 0 && JSON.stringify(ctx4) === before,
      `verbs=${verbs4.length} ctxChanged=${JSON.stringify(ctx4) !== before}`);
  }

  // ---------------------------------------------------------------- SMOKE + DET (the sweep harness)
  const SW = require('./probe-tablepathdriver-20261020');
  {
    // SMOKE on a relay-assigned seed (leadfeast s64203 → idx 2 → 'relay'):
    // the dark road is active, so both layer summaries must be present.
    const odays = process.env.DAYS; process.env.DAYS = '30';
    const otp = process.env.TABLEPATHDRIVER, ord = process.env.RELAYDARK;
    process.env.TABLEPATHDRIVER = '1'; process.env.RELAYDARK = '1';
    const out = await SW.runOne(64203, 'leadfeast', { noWrite: true });
    process.env.TABLEPATHDRIVER = otp; process.env.RELAYDARK = ord;
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    check('SMOKE run completes', out.gameDays > 0 && out.recs.length > 0, `days=${out.gameDays}`);
    check('SMOKE assigned door recorded (rotation)', out.tpAssigned === 'relay', `got ${out.tpAssigned}`);
    check('SMOKE 0 instrument errors', (out.instrumentErrors | 0) === 0 && (out.kdErrors | 0) === 0,
      `ierr=${out.instrumentErrors} kdErr=${out.kdErrors}`);
    check('SMOKE layer summaries present', !!out.tpdSummary && !!out.rdSummary, `tpd=${!!out.tpdSummary} rd=${!!out.rdSummary}`);
    check('SMOKE dark road active on relay run', !!(out.rdSummary || {}).active, `active=${(out.rdSummary || {}).active}`);
  }
  {
    // DET: layers-ON twice byte-identical (no unseeded RNG in the new layers).
    const odays = process.env.DAYS; process.env.DAYS = '60';
    const otp = process.env.TABLEPATHDRIVER, ord = process.env.RELAYDARK;
    process.env.TABLEPATHDRIVER = '1'; process.env.RELAYDARK = '1';
    let ok = true;
    for (const seed of [64201, 64202]) {
      for (const policyId of ['leadfeast']) {
        const a = await SW.runOne(seed, policyId, { noWrite: true });
        const b = await SW.runOne(seed, policyId, { noWrite: true });
        const same = a.hashes.join('|') === b.hashes.join('|') && a.hashes.length > 0;
        check(`DET s${seed} ${policyId} layers-ON twice byte-identical`, same, `lens ${a.hashes.length}/${b.hashes.length}`);
        if (!same) ok = false;
      }
    }
    process.env.TABLEPATHDRIVER = otp; process.env.RELAYDARK = ord;
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    void ok;
  }

  // ---------------------------------------------------------------- COMPLETENESS (COMPLETE=1, post-sweep)
  if (process.env.COMPLETE === '1') {
    const AZ = require('./analyze-tablepathdriver-20261020');
    const dir = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tablepathdriver');
    let valid = 0, complete = 0, invited = 0, sat = 0;
    const paths = new Set();
    const relayWalks = [], defWalks = [];
    let indProbes = 0, witProbes = 0, margins = 0, darkBand = 0, relayRoadSats = 0;
    for (const policyId of AZ.POLICIES) {
      for (const seed of AZ.SEEDS) {
        const fp = path.join(dir, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { check(`COMPLETE file ${policyId}/s${seed}`, false, 'missing'); continue; }
        let r; try { r = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { check(`COMPLETE parse ${policyId}/s${seed}`, false, String(e)); continue; }
        valid++;
        const a = AZ.analyzeRun({ policyId, seed, r });
        complete++;
        if (a.invited) invited++;
        if (a.sat) sat++;
        for (const wk of a.walked) {
          paths.add(wk.path);
          if (wk.path === 'relay') relayWalks.push(a.terminal);
          if (wk.path === 'defiant') defWalks.push(a.terminal);
        }
        if (a.assigned === 'indispensable' && (a.doorEvents || []).length > 0) indProbes++;
        if (a.assigned === 'witness' && (a.doorEvents || []).length > 0) witProbes++;
        if (Object.keys(a.branchMargins || {}).length > 0) margins++;
        if (a.assigned === 'relay' && a.rdActive && a.sat) {
          relayRoadSats++;
          if ((a.relayAtSit || {}).band === 'dark') darkBand++;
        }
      }
    }
    check('COMPLETE 16/16 files valid', valid === 16, `valid=${valid}`);
    check('COMPLETE invitation->sitting conversion measured', invited > 0 && sat >= 0, `invited=${invited} sat=${sat}`);
    const rOK = relayWalks.length >= 4 && relayWalks.filter(Boolean).length >= Math.ceil(relayWalks.length * 0.75);
    check('COMPLETE relay walks terminal ≥3/4', rOK, `walks=${relayWalks.length} terminal=${relayWalks.filter(Boolean).length}`);
    const dOK = defWalks.length >= 4 && defWalks.filter(Boolean).length >= Math.ceil(defWalks.length * 0.75);
    check('COMPLETE defiant walks terminal ≥3/4', dOK, `walks=${defWalks.length} terminal=${defWalks.filter(Boolean).length}`);
    check('COMPLETE indispensable/witness ≥2 probes each w/ engine why', indProbes >= 2 && witProbes >= 2, `ind=${indProbes} wit=${witProbes}`);
    check('COMPLETE ledger-dark margins on ≥3 sittings', margins >= 3, `margins=${margins}`);
    check('COMPLETE relay/dark band on ≥1 dark-road sitting', darkBand >= 1, `darkBand=${darkBand} roadSats=${relayRoadSats}`);
  }

  console.log(`\ntest-tablepathdriver: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FATAL:', e && e.stack || e); process.exit(2); });
