#!/usr/bin/env node
// test-relaymantle-20261020.js — proof for sim-relaymantle (flesh-out loop,
// 2026-10-20): the two #5 probe-hygiene fixes + the parameterized road.
//
// PROVES:
//   ORDERING — the done-before-invitation fix: a road that completed the
//     same day the invitation staged is recorded done=1 (the pilot's
//     ordering left done=0 on leadfeast-s64203 though the state was fully
//     dark). The layer still goes quiet (no verbs past the invitation).
//   WALKCAP — the `walked` derivation fix: a door the engine accepts into
//     'conscript' (the relay/feared-dark dark-conscript offer — the
//     transition the pilot's after.phase==='challenge' condition missed)
//     is captured as a walk at the source, with branch + the engine's live
//     tableBranch signals.
//   FLOOR — the floor parameterizes: floor=44 stops verbs at grounding 40
//     where floor=32 keeps driving.
//   DELEGATION — road-off delegates to the base byte-neutrally (ctx
//     untouched, base.daily called exactly once).
//   REAL-VERB — the reordered layer still plays the road through the real
//     verb surface (claim → deepen → reroute → rewrite/skim to the dark
//     band), 30 dailies on a real game.
//   SMOKE + DET — the sweep harness on the new probe.
//   COMPLETENESS — post-sweep (COMPLETE=1): 64/64 per-seed files valid
//     (4 arms × 16), replication bar, walk consistency, zero engine errors.
//
// POLICY-SIDE — zero src/js changes.
// Usage: node scripts/test-relaymantle-20261020.js
// Post-sweep: COMPLETE=1 node scripts/test-relaymantle-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const RM = require('./policies/relaymantle');
const TPD = require('./policies/tablepathdriver');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------------------------------------------------------------- texture
// A real game at a real table offer (the pilot's craftTable). Ledger grants
// earn feared + defiant + assimilated; beloved is NOT earned (viewership
// 0); witness is NOT earned (exposed 0); indispensable is NOT earned
// (lesser seat); relay is NOT earned (stage 2, no office).
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
// DARKFEAR: killed >> protected + betrayed > 0 → tableBranch('feared').branch === 'dark'.
const LEDGER_DARKFEAR = { might: 9, killed: 20, protected: 1, betrayed: 2, defiance: 6, embrace: 2, foodShared: 6, foodHoarded: 0, showmanship: 8 };

function stubRoad(over) {
  const verbs = [];
  const stub = {
    over: !!over,
    progState: () => ({}),
    tablePreview: () => null,
    relayHeldByBearer: () => true,
    relayLean: () => -60, relayBand: () => 'dark',
    grounding: () => 40, sysBond: () => 3, integrationStage: () => 3,
    switchboard: () => ({ delayed: 9, routed: 20 }),
    relayHas: () => true,
    relayDeepen: () => { verbs.push('deepen'); return 'deepened'; },
    relayReroute: () => { verbs.push('reroute'); return 'rerouted'; },
    relayRewrite: () => { verbs.push('rewrite'); return 'rewritten'; },
    relaySkim: () => { verbs.push('skim'); return 'skimmed'; },
    state: { scholar: { relayAbils: { rewrite: { uses: 8 }, skim: { uses: 8 } }, day: 70 } },
    verbs,
  };
  return stub;
}

async function main() {
  const envWas = process.env.RELAYMANTLE;
  process.env.RELAYMANTLE = '1';

  // ---------------------------------------------------------------- ORDERING (the #5 done-before-invitation fix)
  {
    // Targets met (lean -60 ≤ -44, grounding 40 ≤ 48, darkUses 16 ≥ 6,
    // bond 3 ≥ 2) AND the invitation already staged: the pilot's ordering
    // (invitation-stop first) records done=0; the fix records done=1.
    const s1 = stubRoad(false);
    s1.tablePreview = () => ({ ready: true, seat: 'lesser' });
    const ctx1 = {};
    RM.relayMantleDaily(s1, ctx1, { active: true });
    const rm1 = ctx1._relaymantle || {};
    check('ORDERING: done=1 when targets met even with the invitation staged',
      (rm1.done | 0) === 1 && rm1.doneDay === 70, JSON.stringify({ done: rm1.done, doneDay: rm1.doneDay }));
    check('ORDERING: no verbs fire past the invitation (the road still ends where the table begins)',
      s1.verbs.length === 0, `verbs=[${s1.verbs.join(',')}]`);

    // Control: targets NOT met (lean -10) + invitation staged → done=0,
    // stoppedTable=1, no verbs.
    const s2 = stubRoad(false);
    s2.tablePreview = () => ({ ready: true, seat: 'lesser' });
    s2.relayLean = () => -10; s2.relayBand = () => 'grey';
    const ctx2 = {};
    RM.relayMantleDaily(s2, ctx2, { active: true });
    const rm2 = ctx2._relaymantle || {};
    check('ORDERING control: incomplete road + staged invitation → done=0, stoppedTable=1',
      (rm2.done | 0) === 0 && (rm2.stoppedTable | 0) === 1, JSON.stringify({ done: rm2.done, stoppedTable: rm2.stoppedTable }));
    check('ORDERING control: no verbs', s2.verbs.length === 0, `verbs=[${s2.verbs.join(',')}]`);

    // No invitation, targets met → done=1 (the common pre-table case).
    const s3 = stubRoad(false);
    const ctx3 = {};
    RM.relayMantleDaily(s3, ctx3, { active: true });
    check('ORDERING: done=1 pre-invitation at targets',
      ((ctx3._relaymantle || {}).done | 0) === 1, JSON.stringify(ctx3._relaymantle));
  }

  // ---------------------------------------------------------------- WALKCAP (the #5 walked-derivation fix)
  {
    // Synthetic: a paths→conscript door transition (the relay/feared-dark
    // dark-conscript offer) + a plain paths→challenge door.
    const C = { tableChoices: [
      { day: 100, id: 'path:relay',
        before: { phase: 'paths', path: null, branch: null },
        after: { phase: 'conscript', path: 'relay', branch: 'dark' },
        branchSignals: { branch: 'dark', band: 'dark', dark: 8, light: 1, notes: [] } },
      { day: 100, id: 'conscript:no',
        before: { phase: 'conscript', path: 'relay', branch: 'dark' },
        after: { phase: 'challenge', path: 'relay', branch: 'dark' },
        branchSignals: null },
      { day: 101, id: 'path:feared',
        before: { phase: 'paths', path: null, branch: null },
        after: { phase: 'challenge', path: 'feared', branch: 'light' },
        branchSignals: { branch: 'light', band: null, dark: 1, light: 5, notes: [] } },
    ], instrumentErrors: 0 };
    // deriveWalks is exported by the probe — require it lazily (the probe
    // module's substrate guard runs at require time; env is set below).
    const oldWalks = C.tableChoices.filter(c => String(c.id).indexOf('path:') === 0 && c.after.path && c.after.phase === 'challenge');
    check('WALKCAP synthetic: the pilot\'s too-narrow condition misses the conscript door',
      oldWalks.length === 1 && oldWalks[0].id === 'path:feared', JSON.stringify(oldWalks.map(w => w.id)));
  }

  // ---------------------------------------------------------------- FLOOR (parameterized floor)
  {
    // grounding 40, lean -30 (NOT done — the floor must stop the verbs on
    // its own), bond 0 (would deepen if allowed).
    const mk = () => {
      const s = stubRoad(false);
      s.relayLean = () => -30; s.relayBand = () => 'grey';
      s.grounding = () => 40; s.sysBond = () => 0;
      return s;
    };
    const sA = mk(); const ctxA = {};
    RM.relayMantleDaily(sA, ctxA, { active: true, floor: 44 });
    const rmA = ctxA._relaymantle || {};
    check('FLOOR 44: verbs stop at grounding 40 (≤44)',
      sA.verbs.length === 0 && (rmA.floorStop | 0) === 1 && rmA.floorStopDay === 70,
      `verbs=[${sA.verbs.join(',')}] floorStop=${rmA.floorStop}`);
    const sB = mk(); const ctxB = {};
    RM.relayMantleDaily(sB, ctxB, { active: true, floor: 32 });
    const rmB = ctxB._relaymantle || {};
    check('FLOOR 32: verbs continue at grounding 40 (>32)',
      sB.verbs.length === 1 && sB.verbs[0] === 'deepen' && (rmB.floorStop | 0) === 0,
      `verbs=[${sB.verbs.join(',')}] floorStop=${rmB.floorStop}`);
    check('FLOOR: minGrounding recorded while active',
      rmB.minGrounding === 40, `minGrounding=${rmB.minGrounding}`);
    check('FLOOR: the floor used is recorded',
      rmA.floor === 44 && rmB.floor === 32, `floors=${rmA.floor},${rmB.floor}`);
  }

  // ---------------------------------------------------------------- DELEGATION (road-off)
  {
    delete process.env.RELAYMANTLE;
    let baseCalls = 0;
    const base = { daily: (Game, ctx) => { baseCalls++; return 'base'; } };
    const wrapped = RM.withRelayMantle(base, 'x', 'x', { active: true });
    const ctx = {};
    const r = wrapped.daily({}, ctx);
    check('DELEGATION road-off: base.daily called exactly once, ctx untouched',
      r === 'base' && baseCalls === 1 && ctx._relaymantle === undefined,
      `calls=${baseCalls} ctxKeys=[${Object.keys(ctx).join(',')}]`);
    process.env.RELAYMANTLE = '1';
  }

  // ---------------------------------------------------------------- REAL-VERB (the reordered layer on a real game)
  {
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
    for (let i = 0; i < 30; i++) RM.relayMantleDaily(Game, ctx, { active: true });
    const rm = ctx._relaymantle || {};
    const st = RM.relayState(Game);
    check('REAL-VERB: relay claimed', rm.claimed === 1, JSON.stringify({ claimed: rm.claimed, claimFailed: rm.claimFailed }));
    check('REAL-VERB: bond >= 2 via deepen', (st.bond | 0) >= 2, `bond=${st.bond} deepens=${rm.deepens}`);
    check('REAL-VERB: efficient unlocked rewrite+skim (delayed>=3, routed>=15)',
      st.hasRewrite && st.hasSkim, `hasRewrite=${st.hasRewrite} hasSkim=${st.hasSkim} efficients=${rm.efficients}`);
    check('REAL-VERB: dark uses accumulate', st.darkUses >= 6, `darkUses=${st.darkUses} rewrites=${rm.rewrites} skims=${rm.skims}`);
    check('REAL-VERB: lean driven total (band dark)',
      st.lean != null && st.lean <= -40, `lean=${st.lean} band=${st.band}`);
    check('REAL-VERB: grounding eroding (the two-way cost)',
      st.grounding != null && st.grounding < 100, `grounding=${st.grounding}`);
    check('REAL-VERB: light uses stay 0 (no light verbs)',
      st.lightUses === 0, `lightUses=${st.lightUses}`);
    check('REAL-VERB: no verb errors', (rm.verbError | 0) === 0 && (rm.nullVerbs | 0) < 25, `verbError=${rm.verbError} nullVerbs=${rm.nullVerbs}`);
    // DONE-PREDICATE: grounding at 45 (in-harness — the sweep earns it via
    // holding days), one more daily completes the road.
    Game.state.scholar.grounding = 45;
    RM.relayMantleDaily(Game, ctx, { active: true });
    check('REAL-VERB DONE: road completes at targets', (ctx._relaymantle.done | 0) === 1,
      JSON.stringify({ done: ctx._relaymantle.done, lean: ctx._relaymantle.lean, grounding: ctx._relaymantle.grounding }));
  }

  // ---------------------------------------------------------------- WALKCAP REAL (dark-feared door through the real machine)
  {
    const { Game } = await craftTable(LEDGER_DARKFEAR);
    const branch = Game.tableBranch('feared');
    check('WALKCAP REAL texture: feared branch is dark on the dark ledger',
      branch.branch === 'dark', `branch=${branch.branch} dark=${branch.dark} light=${branch.light}`);
    // Install the walk-capture wrapper BEFORE the choice (the probe does
    // this in policy.setup). Require the probe lazily — env first.
    const E = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'NODEWITNESS', 'KILLDISC', 'TABLEPATHDRIVER', 'RELAYMANTLE'];
    const saved = {};
    for (const k of E) { saved[k] = process.env[k]; process.env[k] = '1'; }
    process.env.RELAYMANTLE_FLOOR = '32'; process.env.RELAYMANTLE_ALL = '1';
    const SW = require('./probe-relaymantle-20261020');
    const C = { tableChoices: [], instrumentErrors: 0 };
    SW.installWalkCapture(Game, C);
    Game.tableScene();
    const offered = ((Game.state.scholar.tableChoices || {}).options || []).map(o => String(o.id));
    check('WALKCAP REAL texture: feared offered', offered.indexOf('path:feared') >= 0, `offered=[${offered.join(',')}]`);
    Game.chooseTableOption('path:feared');
    const ch = C.tableChoices[0] || {};
    check('WALKCAP REAL: the choice was captured', !!ch.id, `choices=${C.tableChoices.length}`);
    check('WALKCAP REAL: feared-dark door goes paths → conscript (the pilot-missed transition)',
      ch.after && ch.after.phase === 'conscript' && ch.after.path === 'feared',
      JSON.stringify(ch.after));
    const walks = SW.deriveWalks(C);
    check('WALKCAP REAL: walk captured at the source with branch',
      walks.length === 1 && walks[0].path === 'feared' && walks[0].branch === 'dark',
      JSON.stringify(walks));
    check('WALKCAP REAL: the engine\'s live branch signals captured at walk time',
      walks[0] && walks[0].branchSignals && walks[0].branchSignals.dark > walks[0].branchSignals.light,
      JSON.stringify(walks[0] && walks[0].branchSignals));
    const oldWalks = C.tableChoices.filter(c => String(c.id).indexOf('path:') === 0 && c.after.path && c.after.phase === 'challenge');
    check('WALKCAP REAL: the pilot\'s too-narrow condition misses this walk',
      oldWalks.length === 0, `oldWalks=${oldWalks.length}`);
    for (const k of E) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
    delete process.env.RELAYMANTLE_FLOOR; delete process.env.RELAYMANTLE_ALL;
    // Answer the conscript so the game is left in a clean state (not asserted).
    try { Game.chooseTableOption('conscript:no'); } catch (e) {}
  }

  // ---------------------------------------------------------------- SMOKE + DET (the sweep harness)
  {
    const E = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'NODEWITNESS', 'KILLDISC', 'TABLEPATHDRIVER', 'RELAYMANTLE'];
    const saved = {};
    for (const k of E) { saved[k] = process.env[k]; process.env[k] = '1'; }
    process.env.RELAYMANTLE_FLOOR = '32'; process.env.RELAYMANTLE_ALL = '1';
    const SW = require('./probe-relaymantle-20261020');
    {
      // SMOKE on a relay-assigned seed (leadfeast s64203 → idx 2 → 'relay'):
      // the mantle road is active, so both layer summaries must be present.
      const odays = process.env.DAYS; process.env.DAYS = '30';
      const out = await SW.runOne(64203, 'leadfeast', { noWrite: true });
      if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
      check('SMOKE run completes', out.gameDays > 0 && out.recs.length > 0, `days=${out.gameDays}`);
      check('SMOKE assigned door recorded (rotation)', out.tpAssigned === 'relay', `got ${out.tpAssigned}`);
      check('SMOKE 0 instrument errors', (out.instrumentErrors | 0) === 0 && (out.kdErrors | 0) === 0,
        `ierr=${out.instrumentErrors} kdErr=${out.kdErrors}`);
      check('SMOKE layer summaries present', !!out.tpdSummary && !!out.rmSummary, `tpd=${!!out.tpdSummary} rm=${!!out.rmSummary}`);
      check('SMOKE mantle road active on relay run', !!(out.rmSummary || {}).active, `active=${(out.rmSummary || {}).active}`);
      check('SMOKE walks is an array (source-captured)', Array.isArray(out.walks), `walks=${JSON.stringify(out.walks)}`);
      check('SMOKE mantle join present', !!out.mantle && Array.isArray(out.mantle.midRoadDeaths), `mantle=${JSON.stringify(out.mantle)}`);
      check('SMOKE daily recs carry relay state (road-on)', !!(out.recs[0] || {}).relay, `relay=${JSON.stringify((out.recs[0] || {}).relay)}`);
    }
    {
      // DET: road-ON twice byte-identical (no unseeded RNG in the new layer/capture).
      const odays = process.env.DAYS; process.env.DAYS = '60';
      let ok = true;
      for (const seed of [64201, 64202]) {
        for (const policyId of ['leadfeast']) {
          const a = await SW.runOne(seed, policyId, { noWrite: true });
          const b = await SW.runOne(seed, policyId, { noWrite: true });
          const same = a.hashes.join('|') === b.hashes.join('|') && a.hashes.length > 0;
          check(`DET s${seed} ${policyId} road-ON twice byte-identical`, same, `lens ${a.hashes.length}/${b.hashes.length}`);
          if (!same) ok = false;
        }
      }
      if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
      void ok;
    }
    for (const k of E) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
    delete process.env.RELAYMANTLE_FLOOR; delete process.env.RELAYMANTLE_ALL;
  }

  // ---------------------------------------------------------------- COMPLETENESS (COMPLETE=1, post-sweep)
  if (process.env.COMPLETE === '1') {
    const AZ = require('./analyze-relaymantle-20261020');
    let valid = 0;
    let walkMismatch = 0, engineErrors = 0;
    const perArm = {};
    for (const arm of AZ.ARMS) {
      const dir = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-relaymantle', arm);
      perArm[arm] = { n: 0 };
      for (const policyId of AZ.POLICIES) {
        for (const seed of AZ.SEEDS) {
          const fp = path.join(dir, policyId, `s${seed}.json`);
          if (!fs.existsSync(fp)) { check(`COMPLETE file ${arm}/${policyId}/s${seed}`, false, 'missing'); continue; }
          let r; try { r = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { check(`COMPLETE parse ${arm}/${policyId}/s${seed}`, false, String(e)); continue; }
          valid++; perArm[arm].n++;
          const a = AZ.analyzeRun({ policyId, seed, r });
          if (a.walkConsistency !== 'ok') walkMismatch++;
          engineErrors += a.engineErrors;
        }
      }
    }
    check('COMPLETE 64/64 files valid (4 arms × 16)', valid === 64, `valid=${valid}`);
    for (const arm of AZ.ARMS) check(`COMPLETE arm ${arm} 16/16`, perArm[arm].n === 16, `n=${perArm[arm].n}`);
    check('COMPLETE walk consistency (source-captured walks == drain doorEvents)', walkMismatch === 0, `mismatches=${walkMismatch}`);
    check('COMPLETE zero engine errors', engineErrors === 0, `engineErrors=${engineErrors}`);
    // Replication bar inputs (the analyzer judges the verdict).
    const f32 = AZ.armMeasures('floor32');
    check('COMPLETE replication: floor32 done ≥ 3/16', f32.done >= 3, `done=${f32.done}`);
    check('COMPLETE replication: floor32 darkSit ≥ 3/16', f32.darkSit >= 3, `darkSit=${f32.darkSit}`);
  }

  if (envWas === undefined) delete process.env.RELAYMANTLE; else process.env.RELAYMANTLE = envWas;
  console.log(`\ntest-relaymantle: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FATAL:', e && e.stack || e); process.exit(2); });
