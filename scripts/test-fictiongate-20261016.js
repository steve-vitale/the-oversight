#!/usr/bin/env node
// scripts/test-fictiongate-20261016.js — proof for the cold-shoulder
// fiction gate (loop B sim-fictiongate-b, 2026-10-16, food-economy axis;
// sim-findings #385/#391).
//
// THE BUG: the stage 0->1 cold-shoulder beat (justice.js:137) always fires
// the journal line "The village has gone quiet around me. I know why." —
// even when the dated-voluntary ledger is clean and the heat is meal-driven
// (the village's own bowls manufactured the charge: v.takes includes the
// undated communal bowls, game.js:26632, while takeHist holds voluntary
// takes only). The scholar internalizes a charge the bowls made up; and the
// same beat is true and false in the same run (#391: leadfeast-s214 d14
// meal-driven, d28-d113 honest).
//
// THE FIX (VOICE ONLY): at the 0->1 transition, gate the honest line on the
// dated-voluntary ledger agreeing — trailing-7d voluntary net < 0 (the
// freeloader-clock reading: engine takeRate7/giveRate7 over the dated
// takeHist/giveHist; succession resets both at ledger.js:841-844). When the
// dated ledger is clean, fire a distinct meal-aware line. Stage, heat,
// timing, the say line, and the journalNote dedup: untouched.
//
// PART A — constructed scenarios on the REAL engine (sim-harness),
//   driving the actual justiceTick transition:
//   A1 clean ledger (cumulative takes 16000, all meals, takeHist empty) ->
//      expect the MEAL-AWARE line. RED before the fix (honest fires).
//   A2 honest ledger (same cumulative; takeHist sums -3000 in-window) ->
//      expect the HONEST line (passes before AND after; post-fix guard).
//   A3 mechanics parity: stage 0->1, pre-tick heat, and the say text are
//      identical across A1/A2 — ONLY the journal text may differ.
//   A4 fallback: takeRate7/giveRate7 unavailable -> the pre-fix honest line
//      (old behavior preserved where the ledger is unreadable).
// PART B — pilot det-gate: 2 seeds x {leadfeast,belongfeast} x 25d with
//   LEDGERDIAG=1: the trigger path must be exercised (>=1 cold-shoulder
//   firing), instrument recon clean, every journal firing's text one of the
//   two known lines.
// SMOKE=1: PART A + 1 seed x 1 policy x 25d pilot.
//
// Usage:
//   node scripts/test-fictiongate-20261016.js
//   SMOKE=1 node scripts/test-fictiongate-20261016.js
'use strict';
const path = require('path');
const REPO = path.resolve(__dirname, '..');
const SMOKE = process.env.SMOKE === '1';

const HONEST_LINE = 'The village has gone quiet around me. I know why.';
const MEAL_LINE = "The village has gone quiet around me. I don't know why \u2014 I've eaten only what was set before me.";
const SAY_LINE = 'Something has shifted. Conversations stop when you approach the fire. Nobody meets your eyes for long.';

let fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' \u2014 ' + detail : ''}`);
  if (!cond) fails.push(name);
}

// Build a constructed cold-shoulder scenario on the real engine and drive
// the actual justiceTick transition. opts: { volTakes: [{day,kcal}...],
// volGives, cumTakes, cumGives, dropRates }.
async function driveScenario(opts) {
  opts = opts || {};
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const out = { said: [], journaled: [] };
  let result = null;
  await quietLog(async () => {
    const { Game } = await loadGame({ seed: 424242, mode: 'fictiongate-fixture' });
    await setupGame(Game);
    const vid = Game.villagerId;
    const v = Game.state.village;
    const day = (Game.state.scholar || {}).day || 0;
    // The cumulative book: meals-inflated takes, the engine's justiceHeat
    // reads v.takes/v.gives (justice.js:101-106).
    v.takes = v.takes || {}; v.gives = v.gives || {};
    v.takes[vid] = opts.cumTakes != null ? opts.cumTakes : 16000;
    v.gives[vid] = opts.cumGives != null ? opts.cumGives : 0;
    // The dated-voluntary ledger: voluntary takes only (the bowls never
    // write takeHist — game.js:26632).
    v.takeHist = v.takeHist || {}; v.giveHist = v.giveHist || {};
    v.takeHist[vid] = (opts.volTakes || []).map(e => ({ day: e.day != null ? e.day : day, kcal: e.kcal }));
    v.giveHist[vid] = (opts.volGives || []).map(e => ({ day: e.day != null ? e.day : day, kcal: e.kcal }));
    // Deterministic heat: no crimes, no amends, default trust (no ambient).
    const j = Game.justiceState();
    j.stage = 0; j.crimes = []; j.amendsCredit = 0;
    if (opts.dropRates) { Game.takeRate7 = undefined; Game.giveRate7 = undefined; }
    const heatBefore = Game.justiceHeat();
    const oSay = Game.say, oJournal = Game.journalNote;
    Game.say = function (t) { try { out.said.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
    Game.journalNote = function (cat, key, text) { try { out.journaled.push({ cat, key, text: String(text) }); } catch (e) {} return oJournal.apply(this, arguments); };
    let tickErr = null;
    try { Game.justiceTick(); } catch (e) { tickErr = e; }
    Game.say = oSay; Game.journalNote = oJournal;
    result = {
      heatBefore, stageAfter: Game.justiceState().stage,
      said: out.said.slice(), journaled: out.journaled.slice(), tickErr,
      // The gate's own reading, for the record (engine window e.day >= day-6).
      volNet7: (function () {
        try {
          const hT = (v.takeHist[vid] || []), hG = (v.giveHist[vid] || []);
          let t = 0, g = 0;
          for (const e of hT) if (e && e.day >= day - 6) t += e.kcal || 0;
          for (const e of hG) if (e && e.day >= day - 6) g += e.kcal || 0;
          return g - t;
        } catch (e) { return null; }
      })(),
    };
  });
  return result;
}

async function partA() {
  console.log('PART A \u2014 constructed cold-shoulder scenarios on the real engine');
  // A1: clean dated ledger — 16000 kcal cumulative, every bite a bowl.
  const a1 = await driveScenario({ volTakes: [] });
  check('A1 preconditions (heat 25, transition armed)', a1.heatBefore === 25 && a1.tickErr === null,
    `heat=${a1.heatBefore} err=${a1.tickErr && a1.tickErr.message}`);
  check('A1 stage 0->1 fires', a1.stageAfter === 1, `stage=${a1.stageAfter}`);
  check('A1 say line unchanged', a1.said.some(t => t === SAY_LINE), `said ${a1.said.length}`);
  const a1j = a1.journaled.filter(n => n.cat === 'village' && n.key === 'mood').map(n => n.text);
  check('A1 clean ledger -> meal-aware line', a1j.length === 1 && a1j[0] === MEAL_LINE,
    `volNet7=${a1.volNet7} journal=${JSON.stringify(a1j[0] || null)}`);

  // A2: honest ledger — same cumulative, but 3000 kcal of voluntary takes
  // in the trailing window (the drip is real).
  const a2 = await driveScenario({ volTakes: [{ kcal: 1500 }, { kcal: 1500 }] });
  check('A2 preconditions (heat 25, transition armed)', a2.heatBefore === 25 && a2.tickErr === null,
    `heat=${a2.heatBefore} err=${a2.tickErr && a2.tickErr.message}`);
  check('A2 stage 0->1 fires', a2.stageAfter === 1, `stage=${a2.stageAfter}`);
  const a2j = a2.journaled.filter(n => n.cat === 'village' && n.key === 'mood').map(n => n.text);
  check('A2 honest ledger -> honest line', a2.volNet7 === -3000 && a2j.length === 1 && a2j[0] === HONEST_LINE,
    `volNet7=${a2.volNet7} journal=${JSON.stringify(a2j[0] || null)}`);

  // A3: mechanics parity — the ONLY delta between the clean and honest
  // cases is the journal text.
  check('A3 stage math identical (heat/stage/say)',
    a1.heatBefore === a2.heatBefore && a1.stageAfter === a2.stageAfter &&
    a1.said.some(t => t === SAY_LINE) && a2.said.some(t => t === SAY_LINE),
    `heat ${a1.heatBefore}/${a2.heatBefore} stage ${a1.stageAfter}/${a2.stageAfter}`);
  check('A3 journal text is the only delta',
    a1j[0] !== a2j[0] && [MEAL_LINE, HONEST_LINE].includes(a1j[0]) && [MEAL_LINE, HONEST_LINE].includes(a2j[0]),
    `clean=${JSON.stringify(a1j[0])} honest=${JSON.stringify(a2j[0])}`);

  // A4: ledger unreadable -> pre-fix honest line (fallback preserves old behavior).
  const a4 = await driveScenario({ volTakes: [], dropRates: true });
  const a4j = a4.journaled.filter(n => n.cat === 'village' && n.key === 'mood').map(n => n.text);
  check('A4 fallback (no rate fns) -> honest line', a4.stageAfter === 1 && a4j.length === 1 && a4j[0] === HONEST_LINE,
    `journal=${JSON.stringify(a4j[0] || null)}`);
}

async function partB() {
  const seeds = SMOKE ? [137] : [137, 248];
  const policies = SMOKE ? ['leadfeast'] : ['leadfeast', 'belongfeast'];
  console.log(`PART B \u2014 pilot det-gate (${seeds.length} seeds x ${policies.length} policies x 25d, LEDGERDIAG=1)`);
  process.env.LEDGERDIAG = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { installLedgerDiag } = require('./ledgerdiag-lib-20261016');
  const SD = require('./policies/seatdrive');
  const PMAP = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };
  let totalFirings = 0, badText = 0, reconBad = 0, instrBad = 0;
  // journalNote voices twice: the raw note text AND its own say-echo
  // ("📓 Codex: <text>"). Normalize the echo before comparing.
  const norm = (t) => String(t || '').replace(/^📓 (Journal|Codex): /, '');
  for (const seed of seeds) {
    for (const pid of policies) {
      const base = PMAP[pid];
      const policy = Object.assign({}, base);
      const od = base.daily;
      let track = null;
      policy.daily = (G, ctx) => { try { track.dawn(G); } catch (e) {} return od ? od(G, ctx) : undefined; };
      let fin = null;
      await quietLog(async () => {
        const { Game } = await loadGame({ seed, mode: 'fictiongate-pilot' });
        await setupGame(Game);
        track = installLedgerDiag(Game);
        if (!track.on) throw new Error('LEDGERDIAG did not arm');
        await runDays(Game, policy, { days: 25 });
        try { track.dawn(Game); } catch (e) {}
        fin = track.finalize();
        track.uninstall();
      });
      const cs = (fin && fin.coldShoulder) || {};
      totalFirings += cs.nFirings || 0;
      for (const f of (cs.firings || [])) {
        for (const b of (f.beats || [])) {
          if (b.cls === 'COLD_SHOULDER_JOURNAL' && norm(b.text) !== HONEST_LINE && norm(b.text) !== MEAL_LINE) badText++;
        }
      }
      if (fin && fin.recon && fin.recon.tr7Mismatch !== 0) reconBad++;
      if (fin && fin.instrErrors && fin.instrErrors.length) instrBad++;
      console.log(`    seed ${seed} ${pid}: firings=${cs.nFirings || 0} recon=${fin && fin.recon ? fin.recon.tr7Mismatch : '?'} instrErr=${(fin && fin.instrErrors || []).length}`);
    }
  }
  check('B1 trigger path exercised (>=1 cold-shoulder firing)', totalFirings >= 1, `${totalFirings} firings`);
  check('B2 every journal firing text is a known line', badText === 0, `${badText} unknown`);
  check('B3 instrument recon clean', reconBad === 0 && instrBad === 0, `reconBad=${reconBad} instrBad=${instrBad}`);
}

async function main() {
  await partA();
  await partB();
  console.log(fails.length ? `\nRESULT: RED \u2014 ${fails.length} failing: ${fails.join(', ')}` : '\nRESULT: GREEN \u2014 all fixtures pass');
  process.exit(fails.length ? 1 : 0);
}

if (require.main === module) {
  main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
}
module.exports = { HONEST_LINE, MEAL_LINE, SAY_LINE,
  normBeat: (t) => String(t || '').replace(/^📓 (Journal|Codex): /, '') };
