#!/usr/bin/env node
// scripts/sense-refusestaff-b.js — sense-test the hunt-duty refusal beat.
//
// Runs the FIXED layer on a refusal-heavy seed with the proven-safe
// pattern (Game.say wrap + narration:false — sim-huntstaff-b5 named
// next 5: engagements/wounds/deaths byte-identical to the sweep) and
// prints the refusal beats with surrounding transcript context.
//
// SENSE-TESTING LAW: judge whether the refusal reads as a person
// deciding, not a stat gate. Meaning, coherence, relevance — never
// just counts.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-refusestaff-b.js
//   [seed] [policy] [days]
'use strict';
const HS = require('./policies/huntstaff');
const HE = require('./policies/huntengage');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEED = parseInt(process.argv[2] || '6206', 10);
const POLICY = process.argv[3] || 'leadfeast';
const DAYS = parseInt(process.argv[4] || '60', 10);

(async () => {
  process.env.HUNTSTAFF = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const base = POLICY === 'leadfeast' ? leadfeast : belongfeast;
  const policy = HS.withHuntStaff(base, POLICY + '+huntstaff', 'sense');
  const { Game } = await loadGame({ seed: SEED, mode: 'leanwinter', fullTelemetry: false, narration: false });
  await setupGame(Game);
  const said = [];
  const gday = () => { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } };
  const noopSay = Game.say;
  Game.say = function (msg) { said.push({ day: gday(), msg: String(msg) }); };
  const t = {};
  HE.observeGame(Game, t);
  let runCtx = null;
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => { runCtx = ctx; return oDaily ? oDaily(G, ctx) : undefined; };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  Game.say = noopSay;
  delete process.env.HUNTSTAFF;

  const refusals = (runCtx && runCtx._hsRefusalLog) || [];
  console.log(`seed ${SEED} ${POLICY}: ${refusals.length} refusals, ${(runCtx._hsAssignLog || []).length} assignments`);
  for (const r of refusals) {
    console.log(`\n=== refusal d${r.day}: ${r.name} (${r.reason}; wound d${r.woundDay} -${r.woundDmg}) ===`);
    const ctx3 = said.filter(s => s.day >= r.day - 2 && s.day <= r.day + 2);
    // print a tight window: the 3 lines before the beat, the beat, 6 after
    const bi = ctx3.findIndex(s => /hold them back/.test(s.msg));
    const lo = Math.max(0, bi - 3), hi = Math.min(ctx3.length, bi + 7);
    for (let i = lo; i < hi; i++) {
      const s = ctx3[i];
      const mark = /hold them back/.test(s.msg) ? '>>> ' : '    ';
      console.log(`${mark}d${s.day} ${s.msg.slice(0, 220)}`);
    }
  }
  // byte-identity check vs the sweep corpus (the wrap must not perturb)
  const fs = require('fs'), path = require('path');
  const corp = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evidence', '2026-10-18',
    'perseed-refusestaff-b', `fixed-${POLICY}-s${SEED}.json`), 'utf8'));
  const sameRef = JSON.stringify(refusals) === JSON.stringify(corp.refusalLog);
  const sameAsg = JSON.stringify(runCtx._hsAssignLog || []) === JSON.stringify(corp.huntDutyLog);
  console.log(`\nidentity vs sweep corpus: refusals ${sameRef ? 'IDENTICAL' : 'DIVERGED'}; assignments ${sameAsg ? 'IDENTICAL' : 'DIVERGED'}`);
})().catch(e => { console.error('SENSE FAILED', e); process.exit(1); });
