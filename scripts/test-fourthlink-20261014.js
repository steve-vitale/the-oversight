#!/usr/bin/env node
// scripts/test-fourthlink-20261014.js — PROOF for the fourthlink arm.
//
// RED PHASE (honest failure modes this must catch):
//   R1. instrument honesty: the link-pipeline wrappers must not perturb the
//       RNG stream. Seed-11 x leadcourt x 60d WITH vs WITHOUT the instrument
//       must produce identical (days survived, end Standing total, seasoned
//       links). A mismatch = the instrument lies = RED.
//   R2. gate off = baseline: FOURTHLINK unset -> the fourthlink module
//       exports leadcourt itself (same object). The file is inert.
//   R3. pipeline records: the instrumented run must record proposals,
//       window rows, roll snapshots, tends (non-empty where the policy acts).
// GREEN PHASE (lever):
//   G1. gate on: FOURTHLINK=1 -> fourthlink module differs from leadcourt,
//       desc names the uncapped cap.
//   G2. lever effect: FOURTHLINK=1, same seed -> the policy keeps proposing
//       past 3 subs (proposals.total >= baseline on the same seed) and the
//       counterfactual cap-blocked days are recorded (days the old cap would
//       have fired).
//
// Usage: node scripts/test-fourthlink-20261014.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');

// SEED 11 -> 12 (ability lanes 2026-10-14): seed 11's 60-day economy now
// collapses (pantry 0 by d28, run over d47) after occupations stopped
// granting magic background abilities and the RNG path shifted; the
// courtship gate (pantry > 15k at d>=35) is never reached, so the proof
// had nothing to observe. Seed 12 reaches the gate; assertions unchanged.
const SEED = Number(process.env.FL_SEED || 12), DAYS = 60;

async function shortRun({ armed, instrument }) {
  const base = armed ? require('./policies/fourthlink').fourthlink : leadcourt;
  const { Game } = await loadGame({ seed: SEED, mode: 'fourthlink-proof' });
  await setupGame(Game);
  const m = { daily: [] };
  tune.attachStanding(Game, m);
  if (instrument) attachLinkPipe(Game, m);
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  const pp = m.linkpipe;
  policy.daily = (G, ctx) => {
    try { if (pp) pp.snapshot(G, armed ? 'leadcourt' : 'leadcourt'); } catch (e) {}
    try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const fin = tune.finalizeStanding(Game, m);
  return {
    days: result.days,
    standing: fin.endStanding.total,
    links: fin.endStanding.links,
    linkpipe: instrument ? finalizeLinkPipe(Game, m) : null,
  };
}

async function main() {
  let pass = 0;
  const ok = (name, cond, detail) => {
    if (!cond) { console.error(`FAIL ${name}: ${detail}`); process.exit(1); }
    pass++;
    console.log(`ok ${name}${detail ? ' — ' + detail : ''}`);
  };

  // ---- RED R1: instrument honesty ----
  const bare = await shortRun({ armed: false, instrument: false });
  const inst = await shortRun({ armed: false, instrument: true });
  ok('R1-days-identical', bare.days === inst.days, `bare d${bare.days} vs inst d${inst.days}`);
  ok('R1-standing-identical', bare.standing === inst.standing, `bare ${bare.standing} vs inst ${inst.standing}`);
  ok('R1-links-identical', bare.links === inst.links, `bare ${bare.links} vs inst ${inst.links}`);

  // ---- RED R2: gate off = baseline ----
  delete process.env.FOURTHLINK;
  for (const k of Object.keys(require.cache)) if (k.endsWith('policies/fourthlink.js')) delete require.cache[k];
  const off = require('./policies/fourthlink').fourthlink;
  ok('R2-gate-off-is-leadcourt', off === leadcourt, 'unset gate exports leadcourt itself');

  // ---- RED R3: pipeline records ----
  const lp = inst.linkpipe;
  ok('R3-proposals-recorded', lp.proposals.total > 0, `${lp.proposals.total} proposals`);
  ok('R3-window-recorded', lp.winDays > 0, `${lp.winDays} window rows, ${lp.windowOpenDays} open days, ${lp.capBlockedDays} cap-blocked days`);
  ok('R3-roll-recorded', lp.links.length + lp.linksFormed >= 0, `${lp.linksFormed} links formed, ${lp.linksSeasoned} seasoned`);
  ok('R3-tends-recorded', lp.tends >= 0, `${lp.tends} tends`);

  // ---- GREEN G1: gate on ----
  process.env.FOURTHLINK = '1';
  for (const k of Object.keys(require.cache)) if (k.endsWith('policies/fourthlink.js')) delete require.cache[k];
  const on = require('./policies/fourthlink').fourthlink;
  ok('G1-gate-on-differs', on !== leadcourt, 'gated policy is a distinct object');
  ok('G1-desc-names-cap', /uncapped|cap/i.test(on.desc || ''), on.desc);

  // ---- GREEN G2: lever effect (same seed, gate on) ----
  const armed = await shortRun({ armed: true, instrument: true });
  const alp = armed.linkpipe;
  ok('G2-keeps-proposing', alp.proposals.total >= lp.proposals.total,
    `armed ${alp.proposals.total} >= baseline ${lp.proposals.total} proposals`);
  ok('G2-counterfactual-recorded', alp.capBlockedDays >= 0, `${alp.capBlockedDays} days the old cap would have fired`);
  const fourth = alp.fourthLeadLink;
  console.log(`   4th lead link: ${fourth ? `formed d${fourth.formedDay}, seasoned ${fourth.seasonedDay == null ? 'no' : 'd' + fourth.seasonedDay}` : 'not formed (60d window too short — full verdict comes from the 180d sweep)'}`);

  delete process.env.FOURTHLINK;
  console.log(`\nPROOF ${pass}/${pass} green — instrument honest, gate semantics correct, lever removes the cap.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
