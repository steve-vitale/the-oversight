// test-tendbelow-confirm-driver-20261104.js — tend-below-seasoned-bar driver
// with a DECISION-TIME tend classifier (arm sim-tendbelow-confirm-b).
// Two legs on identical fresh seeds:
//   POLICY=leadcourt-tendthrough RUN=tendbelow-confirm-base   (baseline leg)
//   POLICY=leadcourt-tendbelow-b RUN=tendbelow-confirm-armed  (armed leg)
// Death-aware 300d horizon, diplo instrument REUSED verbatim
// (zero src/js). Per-seed JSON goes to
// evidence/2026-11-04/perseed-tendbelow-confirm-b/ (sims write once, on
// purpose). Refuses to overwrite an existing per-seed file. The
// daily snapshot never calls villageStandingTotal or
// unlockedWave (side-effecting); ONE end-of-run unlockedWave
// call is made AFTER the run and reported separately
// (endUnlockedWave, endCallMovedPeak) — never counted as a
// natural door-open.
//
// DECISION-TIME WRAPPER (the tendseason classifier fix): after
// the diplo instrument wraps Game.tendLink, this driver wraps it
// a second time (outer, call-through, RNG-neutral). The outer
// wrapper runs synchronously inside the policy's tend call: it
// reads Game.hierarchyState(), finds the live link by id, copies
// link.trust/link.day and the scholar day BEFORE calling
// through, computes seasoned = (age >= 30) && (trust >= 40),
// then captures the inner return (paid kcal: > 0 = grain sent,
// 0 = refused) and records one tendDecisionEvent. The policy's
// own predicate reads the same live link in the same synchronous
// call stack, so no intra-day trust move can intervene between
// the policy's decision and this record — the tendseason
// snapshot mislabel (snapshot trust 46, decision trust 38) is
// structurally impossible here. Snapshot-based tend
// classification is NOT used anywhere in this arm.
// Usage:
//   DAYS=300 SEEDS=91301,91302 POLICY=leadcourt-tendbelow-b RUN=tendbelow-confirm-armed node scripts/test-tendbelow-confirm-driver-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Installs the decision-time tend wrapper over Game.tendLink.
// Returns { events, restore } where restore() puts back the
// previously installed tendLink (the instrument-wrapped one).
// Call-through: the inner function is always invoked and its
// return value passed back unchanged; throws propagate.
function installDecisionWrapper(Game, errors) {
  const events = [];
  if (typeof Game.tendLink !== 'function') {
    if (errors) errors.push('decision-wrapper: tendLink not a function');
    return { events: events, restore: function () {} };
  }
  const inner = Game.tendLink;
  Game.tendLink = function (linkId) {
    let pre = null;
    try {
      const day = gday(Game);
      const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      let found = null;
      for (let i = 0; i < links.length; i++) {
        if (links[i] && String(links[i].id) === String(linkId)) { found = links[i]; break; }
      }
      if (found) {
        const age = day - (found.day || 0);
        pre = { trust: found.trust, day: found.day, age: age,
          seasoned: age >= 30 && (found.trust || 0) >= 40 };
      }
    } catch (e) { if (errors) errors.push('decision-wrapper pre-read: ' + String(e.message).slice(0, 80)); }
    let ret;
    try { ret = inner.apply(this, arguments); } catch (e) { throw e; }
    try {
      events.push({ day: gday(Game), link: linkId,
        preTrust: pre ? pre.trust : null, preDay: pre ? pre.day : null,
        preAge: pre ? pre.age : null, preSeasoned: pre ? pre.seasoned : null,
        paid: (typeof ret === 'number' ? ret : null),
        cls: pre == null ? 'unknown' : (pre.seasoned ? 'seasoned' : 'below') });
    } catch (e) { if (errors) errors.push('decision-wrapper record: ' + String(e.message).slice(0, 80)); }
    return ret;
  };
  return { events: events, restore: function () { Game.tendLink = inner; } };
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '300', 10) || 300;
const POLICY = process.env.POLICY || '';
const RUN = process.env.RUN || '';
const MAP = {
  'leadcourt-tendthrough': { run: 'tendbelow-confirm-base', file: 'leadcourt-tendthrough', exp: 'leadcourtTendthrough' },
  'leadcourt-tendbelow-b': { run: 'tendbelow-confirm-armed', file: 'leadcourt-tendbelow-b', exp: 'leadcourtTendbelowB' },
};

async function oneRun(seed) {
  const policy = require(path.join(REPO, 'scripts', 'policies', MAP[POLICY].file))[MAP[POLICY].exp];
  const { Game } = await loadGame({ seed: seed, mode: RUN, fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  const dw = installDecisionWrapper(Game, errors);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let peakBeforeEndCall = null, endUnlockedWave = null, peakAfterEndCall = null;
  try { peakBeforeEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { endUnlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('endUnlockedWave: ' + String(e.message).slice(0, 80)); }
  try { peakAfterEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { dw.restore(); } catch (e) { errors.push('decision-restore: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  const out = {
    seed: seed, policy: POLICY, arm: 'tendbelow', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    peakBeforeEndCall: peakBeforeEndCall, peakAfterEndCall: peakAfterEndCall,
    endCallMovedPeak: (peakBeforeEndCall != null && peakAfterEndCall != null && (peakAfterEndCall | 0) > (peakBeforeEndCall | 0)),
    daily: t.daily, proposalEvents: t.proposalEvents, courtshipEvents: t.courtshipEvents,
    travelCalls: t.travelCalls, linkFormedEvents: t.linkFormedEvents,
    deathEvents: t.deathEvents, sayLines: t.sayLines, wrapCounts: t.wrapCounts,
    tendDecisionEvents: dw.events,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function main() {
  if (!SEEDS.length) { console.error('TENDBELOW STOP: SEEDS required.'); process.exit(2); }
  if (!MAP[POLICY] || MAP[POLICY].run !== RUN) { console.error('TENDBELOW STOP: POLICY/RUN mismatch (allowed: leadcourt-tendthrough/tendbelow-confirm-base, leadcourt-tendbelow-b/tendbelow-confirm-armed).'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-tendbelow-confirm-b');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'tendbelow-confirm-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('TENDBELOW STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  const AN = require(path.join(REPO, 'scripts', 'test-tendbelow-confirm-analyze-20261104'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'tendbelow-confirm-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = AN.summarizeLeg(out);
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      firstDiploDay: s.firstDiploDay, diploDays: s.diploDays, holdShare: s.holdShare,
      drops: s.drops.length, recoveries: s.recoveries.length, trajectory: s.trajectory,
      classified: s.classified, errors: out.instrumentErrors.length,
      everW4: s.everW4, everW5: s.everW5, tendTotal: s.tendTotal,
      tendDecisionTotal: s.tendDecisionTotal, tendBelow: s.tendBelowBar,
      tendSeasoned: s.tendSeasoned, tendUnknown: s.tendUnknown,
      tendPaid: s.tendPaidCount, tendPaidKcal: s.tendPaidKcal,
      file: path.relative(REPO, file),
    }));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { installDecisionWrapper: installDecisionWrapper, gday: gday };
