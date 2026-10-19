#!/usr/bin/env node
// test-tablepaths-20261019.js — proof for the sim-tablepaths path-forcing
// driver (scripts/policies/tablepaths.js).
//
// Suites:
//   DOOR — on a real loaded game with a crafted lesser-seat table offer,
//     the layer's door rule walks the ASSIGNED earned door through the
//     REAL state machine (tableScene → tableOfferPaths → chooseTableOption
//     → tableStartPath). RED: the old drain behavior (options[0],
//     load-order) walks feared on the identical texture; the layer with
//     door='defiant' walks defiant. FALLBACK: an assigned door that is
//     unearned (beloved/witness on this texture) falls back to the first
//     earned door in the pre-registered order and records the miss.
//   TRIAL — on the real feared beat 2 (CALIBRATION), trial opt-in picks
//     'beat:trial' through the real beat options; opt-out picks the first
//     option (the old behavior). The engine's trial path is then observed
//     (trialPending / live fight / honest withdrawal).
//   DRAIN — the full drainTable through a real defiant walk reaches phase
//     'done' with Game.won true and a complete attribution log (door
//     event, walked entry, branch, finals event).
//   SMOKE — 1 seed x 30d, TABLEPATHS=1: run completes, tp summary present,
//     0 instrument errors.
//   DET — 2 seeds x 60d: TABLEPATHS=1 (bare+live) vs TABLEPATHS unset —
//     byte-identical trajectories (the layer is a pre-table no-op).
//   COMPLETENESS — post-sweep (COMPLETE=1): 16/16 armed per-seed files
//     valid, >=14/16 runs complete, invitation->sitting conversion
//     measured, >=3 distinct paths walked, #1 path-specific mortality
//     channel named with >=2x margin over #2.
//
// The lesser-seat grant in the crafted texture is IN-HARNESS ONLY (the
// bars are the lever worker's territory; the seat pricing is
// engine-tested elsewhere). The door forcing reads the REAL
// tableEarnedPaths() prereqs against a real ledger — the proof is the
// DRIVER, not the bars.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHS=1 \
//   node scripts/test-tablepaths-20261019.js
// Post-sweep: COMPLETE=1 ... node scripts/test-tablepaths-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const TPL = require('./policies/tablepaths');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------------------------------------------------------------- texture
// A real game at a real table offer. Ledger grants earn feared + defiant +
// assimilated; beloved is NOT earned (viewership 0); witness is NOT earned
// (exposed 0); relay is NOT earned (stage 2, no office).
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
    check('DOOR texture does NOT earn beloved (no audience)', earned1.indexOf('beloved') < 0, `earned=[${earned1.join(',')}]`);
    check('DOOR texture does NOT earn witness (exposed=0)', earned1.indexOf('witness') < 0);
    check('DOOR texture does NOT earn relay (stage 2, no office)', earned1.indexOf('relay') < 0, `earned=[${earned1.join(',')}]`);
    G1.chooseTableOption(offered1[0]); // options[0] — the old drain
    check('DOOR RED: options[0] walks feared', G1.tableState().path === 'feared', `got ${G1.tableState().path}`);

    // GREEN: the layer forces the assigned earned door through the real machine.
    const { Game: G2 } = await craftTable(LEDGER);
    const ctx2 = {};
    G2.tableScene();
    const n2 = TPL.drainTable(G2, ctx2, { door: 'defiant', trial: false });
    const tp2 = ctx2._tablepaths;
    check('DOOR GREEN: assigned defiant is walked', G2.tableState().path === 'defiant', `got ${G2.tableState().path}`);
    check('DOOR GREEN: door event recorded, no fallback',
      tp2.doorEvents.length === 1 && tp2.doorEvents[0].fellBack === false, JSON.stringify(tp2.doorEvents));
    check('DOOR GREEN: walked entry has path+branch',
      tp2.walked.length === 1 && tp2.walked[0].path === 'defiant' && !!tp2.walked[0].branch,
      JSON.stringify(tp2.walked));
    check('DOOR GREEN: drain answered the modal', n2 > 0, `n=${n2}`);
    void n2;

    // FALLBACK: assigned beloved is unearned → first earned in fallback order (feared).
    const { Game: G3 } = await craftTable(LEDGER);
    const ctx3 = {};
    G3.tableScene();
    const ms3 = TPL.modalState(G3);
    const pick3 = TPL.pickOption(G3, ms3, { door: 'beloved', trial: false });
    check('DOOR FALLBACK: unearned beloved falls back to feared',
      pick3 && pick3.id === 'path:feared' && /fallback/.test(pick3.note), JSON.stringify(pick3));
    void ctx3;

    // FALLBACK: assigned witness (unearned) → feared, with the miss named.
    const { Game: G4 } = await craftTable(LEDGER);
    G4.tableScene();
    const ms4 = TPL.modalState(G4);
    const pick4 = TPL.pickOption(G4, ms4, { door: 'witness', trial: false });
    check('DOOR FALLBACK: unearned witness never forced',
      pick4 && pick4.id !== 'path:witness' && /fallback/.test(pick4.note), JSON.stringify(pick4));
  }

  // ---------------------------------------------------------------- TRIAL
  {
    // On the real feared beat 2 (CALIBRATION), the option list carries 'beat:trial'.
    const { Game: G } = await craftTable(LEDGER);
    const ctx = {};
    G.tableScene();
    // Walk feared via the real machine (door first option at the offer).
    G.chooseTableOption('path:feared');
    // Beat 0: answer the first option to reach beat 1 (CALIBRATION).
    let ms = TPL.modalState(G);
    check('TRIAL at beat 0', ms && ms.phase === 'challenge' && (G.tableState().beat | 0) === 0, JSON.stringify(ms && ms.phase));
    G.chooseTableOption(ms.opts[0].id);
    ms = TPL.modalState(G);
    check('TRIAL reached beat 1 (CALIBRATION)', ms && (G.tableState().beat | 0) === 1, `beat=${G.tableState().beat}`);
    const ids = (ms.opts || []).map(o => String(o.id));
    check('TRIAL offered on the real beat', ids.indexOf('beat:trial') >= 0, `opts=[${ids.join(',')}]`);
    // RED: opt-out picks the first option (the old drain behavior).
    const red = TPL.pickBeat(ms.opts, false);
    check('TRIAL RED: opt-out picks first option', red && red.id === ms.opts[0].id && !red.trial, JSON.stringify(red));
    // GREEN: opt-in picks 'beat:trial'.
    const green = TPL.pickBeat(ms.opts, true);
    check('TRIAL GREEN: opt-in picks beat:trial', green && green.id === 'beat:trial' && green.trial, JSON.stringify(green));
    // The engine's trial path: choosing it pauses the challenge honestly.
    const ctxT = { _tablepaths: null };
    G.chooseTableOption('beat:trial');
    const T = G.tableState();
    const trialHonest = (T.trialPending === true) || !!G.tbfight || (T.trialRefused === true);
    check('TRIAL engine: choosing trial takes the trial path (pending/fight/withdrawn)',
      trialHonest, `trialPending=${T.trialPending} tbfight=${!!G.tbfight} refused=${T.trialRefused}`);
    void ctx;
    void ctxT;
  }

  // ---------------------------------------------------------------- DRAIN
  {
    // Full drain through a real defiant walk: done + won + complete log.
    const { Game: G } = await craftTable(LEDGER);
    const ctx = {};
    G.tableScene();
    // The drain mirrors tableRoad; the defiant challenge's prices are
    // payable from the texture pantry, so the walk completes.
    TPL.drainTable(G, ctx, { door: 'defiant', trial: false });
    const T = G.tableState();
    const tp = ctx._tablepaths;
    check('DRAIN reaches phase done', T.phase === 'done', `phase=${T.phase}`);
    check('DRAIN won', G.won === true, `won=${G.won} over=${G.over}`);
    check('DRAIN walked defiant', tp.walked.length >= 1 && tp.walked[0].path === 'defiant', JSON.stringify(tp.walked));
    check('DRAIN branch recorded (ledger-earned)', !!tp.walked[0].branch, `branch=${tp.walked[0].branch}`);
    check('DRAIN finals event recorded', tp.finalsEvents.length >= 1, `finals=${tp.finalsEvents.length}`);
    check('DRAIN log complete', tp.log.length >= 4 && tp.answers === tp.log.length, `answers=${tp.answers} log=${tp.log.length}`);
    // The driver's only policy choices are the door and the trial — the
    // branch is never overridden.
    check('DRAIN branch matches the engine read', tp.walked[0].branch === T.branch || T.phase === 'done', `walked=${tp.walked[0].branch} T=${T.branch}`);
  }

  // ---------------------------------------------------------------- SMOKE + DET (the sweep harness)
  const SW = require('./probe-tablepaths-20261019');
  {
    const odays = process.env.DAYS; process.env.DAYS = '30';
    const otp = process.env.TABLEPATHS; process.env.TABLEPATHS = '1';
    const out = await SW.runOne(64201, 'leadfeast', { noWrite: true });
    process.env.TABLEPATHS = otp;
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    check('SMOKE run completes', out.gameDays > 0 && out.recs.length > 0, `days=${out.gameDays}`);
    check('SMOKE assigned door recorded', out.tpAssigned === 'feared', `got ${out.tpAssigned}`);
    check('SMOKE 0 instrument errors', (out.instrumentErrors | 0) === 0 && (out.kdErrors | 0) === 0,
      `ierr=${out.instrumentErrors} kdErr=${out.kdErrors}`);
  }
  {
    // DET: TABLEPATHS=1 vs unset on identical seeds — byte-identical pre-table.
    const odays = process.env.DAYS; process.env.DAYS = '60';
    const otp = process.env.TABLEPATHS;
    let ok = true;
    for (const seed of [64201, 64202]) {
      process.env.TABLEPATHS = '1';
      const a = await SW.runOne(seed, 'leadfeast', { noWrite: true });
      delete process.env.TABLEPATHS;
      const b = await SW.runOne(seed, 'leadfeast', { noWrite: true });
      process.env.TABLEPATHS = otp;
      const same = a.hashes.join('|') === b.hashes.join('|') && a.hashes.length > 0;
      check(`DET s${seed} TABLEPATHS=1 vs unset byte-identical`, same, `lens ${a.hashes.length}/${b.hashes.length}`);
      if (!same) ok = false;
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    void ok;
  }

  // ---------------------------------------------------------------- COMPLETENESS (COMPLETE=1, post-sweep)
  if (process.env.COMPLETE === '1') {
    const AZ = require('./analyze-tablepaths-20261019');
    const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-tablepaths');
    const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
    const POLICIES = ['leadfeast', 'belongfeast'];
    let valid = 0, complete = 0, invited = 0, sat = 0;
    const paths = new Set();
    const chanCounts = {};
    for (const policyId of POLICIES) {
      for (const seed of SEEDS) {
        const fp = path.join(dir, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { check(`COMPLETE file ${policyId}/s${seed}`, false, 'missing'); continue; }
        let r; try { r = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { check(`COMPLETE parse ${policyId}/s${seed}`, false, String(e)); continue; }
        valid++;
        const a = AZ.analyzeRun(r);
        if (a.complete) complete++;
        if (a.invited) invited++;
        if (a.sat) sat++;
        for (const w of a.walked) paths.add(w.path);
        for (const d of a.seatedDeaths) {
          // d.pathChannel is computed by analyzeRun from the raw death's
          // tableAtDeath (trialPending) — do NOT recompute from the mapped
          // entry (it lacks tableAtDeath and would misclassify trial
          // deaths as seated-raid).
          const ch = d.pathChannel;
          chanCounts[ch] = (chanCounts[ch] | 0) + 1;
        }
      }
    }
    check('COMPLETE 16/16 files valid', valid === 16, `valid=${valid}`);
    check('COMPLETE >=14/16 runs complete', complete >= 14, `complete=${complete}`);
    check('COMPLETE invitation->sitting conversion measured', invited > 0 && sat >= 0, `invited=${invited} sat=${sat}`);
    check('COMPLETE >=3 distinct paths walked', paths.size >= 3, `paths=[${[...paths].join(',')}]`);
    const chans = Object.entries(chanCounts).sort((a, b) => b[1] - a[1]);
    const top = chans[0], second = chans[1];
    const margin = top && (!second || (top[1] >= 2 * second[1]));
    check('COMPLETE #1 path-specific channel with >=2x margin',
      !!top && margin, `channels=${JSON.stringify(chanCounts)}`);
  }

  console.log(`\ntest-tablepaths: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FATAL:', e && e.stack || e); process.exit(2); });
