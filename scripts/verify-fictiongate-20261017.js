#!/usr/bin/env node
// scripts/verify-fictiongate-20261017.js — fresh-seed verification that the
// honesty split from sim-fictiongate-b (#385/#391, landed 2026-10-16 at
// justice.js:137-158) HOLDS on current master. READ-ONLY: zero src/js edits.
//
// THE SPLIT: the cold-shoulder 0->1 beat's journal line is gated on the
// dated-voluntary ledger agreeing — trailing-7d voluntary net < 0 (the
// freeloader-clock reading: (giveRate7 - takeRate7) * 7). Meal-driven heat
// fires "The village has gone quiet around me. I don't know why — I've
// eaten only what was set before me."; honest-ledger heat fires "The
// village has gone quiet around me. I know why."
//
// PART A — constructed fixtures on the real engine (same driver pattern as
//   scripts/test-fictiongate-20261016.js):
//   A1 clean ledger (16000 kcal cumulative, all meals, takeHist empty) ->
//      the MEAL-AWARE line (0 honest-line voicings on a clean ledger).
//   A2 real-drip ledger (same cumulative; 3000 kcal voluntary takes in the
//      trailing window) -> the HONEST line (>=1 honest-line firing on a
//      real drip: mechanism coverage).
// PART B — fresh-seed pilot: 4 fresh seeds x {leadfeast, belongfeast} x 25d
//   with LEDGERDIAG=1 (8 runs). Every cold-shoulder firing is classified by
//   the instrument's voluntaryNet7 at the firing day:
//     clean (vn7 >= 0, meal-driven) -> meal-aware line required
//     honest (vn7 < 0, real drip)   -> honest line required
//   Every firing's journal text must be one of the two known lines.
//
// PRE-REGISTERED (docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: 0 honest-line voicings on clean-ledger armings across >=8
//   runs AND >=1 honest-line firing on a real-drip arming.
//   Horizon: 25d pilot, death-aware-ish (runs end on village loss; LEDGERDIAG
//   handles mid-day ends). Seeds: [517, 628, 739, 850] x 2 policies, fresh
//   (distinct from the fictiongate proof's seeds). SEATDRIVE=0, FEASTSCALE_R13=1.
// SMOKE=1: PART A + 1 seed x 1 policy x 25d.
'use strict';
const SMOKE = process.env.SMOKE === '1';
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (!process.env[k]) { console.log(`  (test default: ${k}=1)`); process.env[k] = '1'; }
}
if (!process.env.SEATDRIVE) { console.log('  (test default: SEATDRIVE=0)'); process.env.SEATDRIVE = '0'; }

const HONEST_LINE = 'The village has gone quiet around me. I know why.';
const MEAL_LINE = "The village has gone quiet around me. I don't know why \u2014 I've eaten only what was set before me.";
const SAY_LINE = 'Something has shifted. Conversations stop when you approach the fire. Nobody meets your eyes for long.';

let fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}

async function driveScenario(opts) {
  opts = opts || {};
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const out = { said: [], journaled: [] };
  let result = null;
  await quietLog(async () => {
    const { Game } = await loadGame({ seed: 555017, mode: 'fictiongate-verify-fixture' });
    await setupGame(Game);
    const vid = Game.villagerId;
    const v = Game.state.village;
    const day = (Game.state.scholar || {}).day || 0;
    v.takes = v.takes || {}; v.gives = v.gives || {};
    v.takes[vid] = opts.cumTakes != null ? opts.cumTakes : 16000;
    v.gives[vid] = opts.cumGives != null ? opts.cumGives : 0;
    v.takeHist = v.takeHist || {}; v.giveHist = v.giveHist || {};
    v.takeHist[vid] = (opts.volTakes || []).map(e => ({ day: e.day != null ? e.day : day, kcal: e.kcal }));
    v.giveHist[vid] = (opts.volGives || []).map(e => ({ day: e.day != null ? e.day : day, kcal: e.kcal }));
    const j = Game.justiceState();
    j.stage = 0; j.crimes = []; j.amendsCredit = 0;
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
    };
  });
  return result;
}

async function partA() {
  console.log('PART A — constructed fixtures on the real engine');
  const a1 = await driveScenario({ volTakes: [] });
  check('A1 preconditions (heat 25, no error)', a1.heatBefore === 25 && a1.tickErr === null, `heat=${a1.heatBefore}`);
  check('A1 stage 0->1 fires', a1.stageAfter === 1, `stage=${a1.stageAfter}`);
  const a1j = a1.journaled.filter(n => n.cat === 'village' && n.key === 'mood').map(n => n.text);
  check('A1 clean ledger -> meal-aware line (not the honest line)', a1j.length === 1 && a1j[0] === MEAL_LINE, JSON.stringify(a1j[0] || null));

  const a2 = await driveScenario({ volTakes: [{ kcal: 1500 }, { kcal: 1500 }] });
  check('A2 preconditions (heat 25, no error)', a2.heatBefore === 25 && a2.tickErr === null, `heat=${a2.heatBefore}`);
  check('A2 stage 0->1 fires', a2.stageAfter === 1, `stage=${a2.stageAfter}`);
  const a2j = a2.journaled.filter(n => n.cat === 'village' && n.key === 'mood').map(n => n.text);
  check('A2 real drip -> honest line', a2j.length === 1 && a2j[0] === HONEST_LINE, JSON.stringify(a2j[0] || null));

  // Mechanics parity: only the journal text differs.
  check('A3 mechanics parity (heat/stage/say identical, journal is the only delta)',
    a1.heatBefore === a2.heatBefore && a1.stageAfter === a2.stageAfter &&
    a1.said.some(t => t === SAY_LINE) && a2.said.some(t => t === SAY_LINE) && a1j[0] !== a2j[0]);
}

async function partB() {
  const seeds = SMOKE ? [517] : [517, 628, 739, 850];
  const policies = SMOKE ? ['leadfeast'] : ['leadfeast', 'belongfeast'];
  console.log(`PART B — fresh-seed pilot (${seeds.length} seeds x ${policies.length} policies x 25d, LEDGERDIAG=1)`);
  process.env.LEDGERDIAG = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { installLedgerDiag } = require('./ledgerdiag-lib-20261016');
  const SD = require('./policies/seatdrive');
  const PMAP = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };
  const norm = (t) => String(t || '').replace(/^📓 (Journal|Codex): /, '');
  let nRuns = 0, nFirings = 0, badText = 0, instrBad = 0;
  let cleanArmings = 0, cleanHonestVoicings = 0, honestArmings = 0, honestHonestVoicings = 0;
  const transcripts = [];
  for (const seed of seeds) {
    for (const pid of policies) {
      const base = PMAP[pid];
      const policy = Object.assign({}, base);
      const od = base.daily;
      let track = null;
      policy.daily = (G, ctx) => { try { track.dawn(G); } catch (e) {} return od ? od(G, ctx) : undefined; };
      let fin = null;
      await quietLog(async () => {
        const { Game } = await loadGame({ seed, mode: 'fictiongate-verify-pilot' });
        await setupGame(Game);
        track = installLedgerDiag(Game);
        if (!track.on) throw new Error('LEDGERDIAG did not arm');
        // Ground-truth classifier: the engine's OWN trailing-7d reading at
        // the exact tick the journal beat fires (hook on top of the
        // ledgerdiag wrapper; call-through). This removes the dawn-day
        // off-by-one between the instrument's row and the tick's reading.
        const oJ = Game.journalNote;
        const tickReads = [];
        Game.journalNote = function (cat, key, text) {
          try {
            const t = String(text || '');
            if (/gone quiet around me/.test(t)) {
              let net7 = null;
              try {
                const vid = (Game.state.scholar || {}).villagerId || Game.villagerId;
                if (typeof Game.takeRate7 === 'function' && typeof Game.giveRate7 === 'function')
                  net7 = (Game.giveRate7(vid) - Game.takeRate7(vid)) * 7;
              } catch (e) {}
              tickReads.push({ day: ((Game.state.scholar || {}).day || 0), net7, text: t.slice(0, 120) });
            }
          } catch (e) {}
          return oJ.apply(this, arguments);
        };
        await runDays(Game, policy, { days: 25 });
        Game.journalNote = oJ;
        try { track.dawn(Game); } catch (e) {}
        fin = track.finalize();
        fin.tickReads = tickReads;
        track.uninstall();
      });
      nRuns++;
      if (fin && fin.instrErrors && fin.instrErrors.length) instrBad++;
      // Primary classification: the engine's own tick-time reading
      // (fin.tickReads). The instrument's dawn-day voluntaryNet7 is reported
      // as the secondary for context.
      const ticks = (fin && fin.tickReads) || [];
      for (const tr of ticks) {
        const t = norm(tr.text);
        if (t !== HONEST_LINE && t !== MEAL_LINE) { badText++; continue; }
        nFirings++;
        const cls = typeof tr.net7 === 'number' && tr.net7 >= 0 ? 'clean'
          : typeof tr.net7 === 'number' && tr.net7 < 0 ? 'honest' : 'unknown';
        const mismatch = (cls === 'clean' && t === HONEST_LINE) || (cls === 'honest' && t === MEAL_LINE);
        if (cls === 'clean') {
          cleanArmings++;
          if (t === HONEST_LINE) cleanHonestVoicings++;
        } else if (cls === 'honest') {
          honestArmings++;
          if (t === HONEST_LINE) honestHonestVoicings++;
        }
        if (mismatch || transcripts.length < 10) transcripts.push(`${mismatch ? 'MISMATCH ' : ''}seed ${seed} ${pid} d${tr.day} engineNet7=${tr.net7} cls=${cls} -> "${t}"`);
      }
      console.log(`    seed ${seed} ${pid}: journalBeats=${ticks.length} instrErr=${(fin && fin.instrErrors || []).length}`);
    }
  }
  console.log('  firing transcripts:');
  transcripts.forEach(t => console.log('   - ' + t));
  check('B1 instrument clean (0 errors)', instrBad === 0, `${instrBad}`);
  check('B2 every firing text is a known line', badText === 0, `${badText} unknown`);
  check(`B3 PRIMARY: 0 honest-line voicings on clean-ledger armings (${cleanArmings} clean armings)`, cleanHonestVoicings === 0,
    `${cleanHonestVoicings} honest voicings on ${cleanArmings} clean armings`);
  check(`B4 PRIMARY: >=1 honest-line firing on a real-drip arming (${honestArmings} honest armings)`, honestHonestVoicings >= 1,
    `${honestHonestVoicings} honest voicings on ${honestArmings} honest armings`);
  check('B5 >=8 runs completed', nRuns >= 8, `${nRuns} runs`);
  return { nRuns, nFirings, cleanArmings, cleanHonestVoicings, honestArmings, honestHonestVoicings };
}

async function main() {
  await partA();
  await partB();
  console.log(fails.length ? `\nRESULT: RED — ${fails.length} failing: ${fails.join(', ')}` : '\nRESULT: GREEN — the honesty split holds on current master');
  process.exit(fails.length ? 1 : 0);
}

if (require.main === module) {
  main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
}
