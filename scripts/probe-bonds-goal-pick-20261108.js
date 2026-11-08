// probe-bonds-goal-pick-20261108.js — OVE-30 / utilization census #7
// Measure-only: does the dawn goal layer ever pick `bonds` as top, or do
// bond_proposed events fire only via the warmth window (bondDriveLive)?
//
// No policy/food/Loop B edits. One-off probe (not a permanent collector).
// Harness rule: one loadGame per process — driver spawns one child per seed.
//
// Usage:
//   SEEDS=7,42,99,1234,555,777,2026,31337 DAYS=60 POLICY=capable \
//     node scripts/probe-bonds-goal-pick-20261108.js
//   SEED=7 DAYS=60 POLICY=capable node scripts/probe-bonds-goal-pick-20261108.js --one
//
// Prints one JSON summary (driver) or one per-seed JSON line (--one).
'use strict';
const path = require('path');
const { spawnSync, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

const GOAL_IDS = ['party_up', 'gear_up', 'bank_veterans', 'build_standing',
  'food_security', 'bonds', 'knowledge', 'safety'];

function sha12() {
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); }
  catch (e) { return 'unknown'; }
}

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function install(Game) {
  const t = {
    biasCalls: 0,
    topHist: Object.create(null),
    bondsTopCalls: 0,
    bondsTopTransitions: 0,
    bondProposed: [],
    daily: [],
    instrumentErrors: [],
    wrapCounts: Object.create(null),
  };
  for (const id of GOAL_IDS) t.topHist[id] = 0;
  t.topHist['(null)'] = 0;
  const orig = {};
  function err(where, e) {
    try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 120)); }
    catch (e2) {}
  }
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }

  function storedTop(vid) {
    try {
      const st = Game.vgoalState ? Game.vgoalState(vid) : null;
      return (st && st.top) || null;
    } catch (e) { return null; }
  }
  function gateOpen(vid) {
    try { return !!(Game.vgoalGate && Game.vgoalGate(vid, 'bonds') > 0); }
    catch (e) { return false; }
  }
  function bondsWeight(vid) {
    try {
      const w = Game.vgoalWeights ? Game.vgoalWeights(vid) : null;
      return w && typeof w.bonds === 'number' ? w.bonds : null;
    } catch (e) { return null; }
  }

  // Dawn/objPick goal commitment: vgoalBiasCands returns the (possibly new) top.
  if (typeof Game.vgoalBiasCands === 'function') {
    orig.vgoalBiasCands = Game.vgoalBiasCands;
    Game.vgoalBiasCands = function (vid, cands) {
      count('vgoalBiasCands');
      let top = null;
      try { top = orig.vgoalBiasCands.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        t.biasCalls++;
        const key = top == null ? '(null)' : String(top);
        t.topHist[key] = (t.topHist[key] || 0) + 1;
        if (top === 'bonds') t.bondsTopCalls++;
      } catch (e) { err('vgoalBiasCands-row', e); }
      return top;
    };
  } else {
    err('install.vgoalBiasCands', new Error('missing'));
  }

  // Track commitment flips into bonds via vgoalTop (same arithmetic; catches
  // callers that refresh top without biasCands).
  if (typeof Game.vgoalTop === 'function') {
    orig.vgoalTop = Game.vgoalTop;
    Game.vgoalTop = function (vid, weights) {
      count('vgoalTop');
      const before = storedTop(vid);
      let top = null;
      try { top = orig.vgoalTop.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (top === 'bonds' && before !== 'bonds') t.bondsTopTransitions++;
      } catch (e) { err('vgoalTop-row', e); }
      return top;
    };
  }

  if (typeof Game.tele === 'function') {
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'bond_proposed' && data && typeof data === 'object') {
          const init = data.initiator || null;
          const top = init ? storedTop(init) : null;
          const open = init ? gateOpen(init) : false;
          const wBonds = init ? bondsWeight(init) : null;
          t.bondProposed.push({
            day: dayOf(Game),
            initiator: init,
            target: data.target || null,
            kind: data.kind || 'person',
            outcome: data.outcome || null,
            chance: data.chance == null ? null : data.chance,
            initiatorTop: top,
            initiatorBondsGate: open,
            initiatorBondsW: wBonds,
            path: (top === 'bonds') ? 'bonds_goal_top' : 'warmth_not_bonds_top',
          });
        }
      } catch (e) { err('tele', e); }
      return r;
    };
  } else {
    err('install.tele', new Error('missing'));
  }

  function snapshot() {
    const snap = {
      day: dayOf(Game),
      living: 0,
      tops: Object.create(null),
      bondsGateOpenN: 0,
      bondsTopN: 0,
      bondsWeightPosN: 0,
      trustedAnyoneN: 0,
      maxTrust: 0,
      personTrustEntries: 0,
    };
    for (const id of GOAL_IDS) snap.tops[id] = 0;
    snap.tops['(null)'] = 0;
    try {
      const me = Game.villagerId;
      const roster = (((Game.state || {}).village || {}).roster || []).filter(function (id) {
        return id !== me;
      });
      let living = 0;
      for (let i = 0; i < roster.length; i++) {
        const vid = roster[i];
        let dead = false;
        try {
          const p = Game.getPerson ? Game.getPerson(vid) : null;
          if (p && p.dead) dead = true;
        } catch (e) {}
        if (dead) continue;
        living++;
        const top = storedTop(vid);
        const key = top == null ? '(null)' : String(top);
        snap.tops[key] = (snap.tops[key] || 0) + 1;
        if (top === 'bonds') snap.bondsTopN++;
        if (gateOpen(vid)) snap.bondsGateOpenN++;
        const w = bondsWeight(vid);
        if (w != null && w > 0) snap.bondsWeightPosN++;
      }
      snap.living = living;
    } catch (e) { err('snapshot.roster', e); }
    try {
      if (typeof Game.personTrustCensus === 'function') {
        const c = Game.personTrustCensus();
        if (c) {
          snap.trustedAnyoneN = c.trustedAnyoneN || 0;
          snap.maxTrust = c.maxTrust || 0;
          snap.personTrustEntries = c.entries || 0;
        }
      }
    } catch (e) { err('snapshot.census', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(orig).forEach(function (n) {
      try { Game[n] = orig[n]; } catch (e) {}
    });
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

function summarizeSeed(row) {
  const proposed = row.bondProposed || [];
  let warmth = 0, withBondsTop = 0, gateOpenAtPropose = 0;
  let personN = 0, linkN = 0, personWarmth = 0, personWithBondsTop = 0;
  for (let i = 0; i < proposed.length; i++) {
    const p = proposed[i];
    if (p.path === 'bonds_goal_top') withBondsTop++;
    else warmth++;
    if (p.initiatorBondsGate) gateOpenAtPropose++;
    if (p.kind === 'link') linkN++;
    else {
      personN++;
      if (p.path === 'bonds_goal_top') personWithBondsTop++;
      else personWarmth++;
    }
  }
  const daily = row.daily || [];
  let daysGateOpen = 0, daysAnyBondsTop = 0, peakGate = 0, peakBondsTop = 0;
  let peakTrusted = 0, peakMaxTrust = 0;
  for (let i = 0; i < daily.length; i++) {
    const d = daily[i];
    if ((d.bondsGateOpenN || 0) > 0) daysGateOpen++;
    if ((d.bondsTopN || 0) > 0) daysAnyBondsTop++;
    if ((d.bondsGateOpenN || 0) > peakGate) peakGate = d.bondsGateOpenN;
    if ((d.bondsTopN || 0) > peakBondsTop) peakBondsTop = d.bondsTopN;
    if ((d.trustedAnyoneN || 0) > peakTrusted) peakTrusted = d.trustedAnyoneN;
    if ((d.maxTrust || 0) > peakMaxTrust) peakMaxTrust = d.maxTrust;
  }
  return {
    seed: row.seed,
    days: row.days,
    endReason: row.endReason,
    biasCalls: row.biasCalls,
    bondsTopCalls: row.bondsTopCalls,
    bondsTopTransitions: row.bondsTopTransitions,
    topHist: row.topHist,
    bondProposedN: proposed.length,
    proposedPersonN: personN,
    proposedLinkN: linkN,
    proposedWarmthNotBondsTop: warmth,
    proposedWithBondsTop: withBondsTop,
    proposedPersonWarmthNotBondsTop: personWarmth,
    proposedPersonWithBondsTop: personWithBondsTop,
    proposedWhileGateOpen: gateOpenAtPropose,
    daysGateOpen: daysGateOpen,
    daysAnyBondsTop: daysAnyBondsTop,
    peakGateOpenN: peakGate,
    peakBondsTopN: peakBondsTop,
    peakTrustedAnyoneN: peakTrusted,
    peakMaxTrust: peakMaxTrust,
    instrumentErrors: (row.instrumentErrors || []).length,
  };
}

async function runOne() {
  const seed = parseInt(process.env.SEED || '7', 10);
  const days = parseInt(process.env.DAYS || '60', 10) || 60;
  const policyId = process.env.POLICY || 'capable';
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const policyMod = require(path.join(REPO, 'scripts', 'policies', policyId));
  const policy = policyMod[policyId] || policyMod.capable || policyMod.competent;
  if (!policy) throw new Error('policy missing: ' + policyId);

  const { Game } = await loadGame({ seed: seed, mode: 'bonds-goal-pick-' + policyId, fullTelemetry: false });
  await setupGame(Game);
  const inst = install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); }
      finally {
        try {
          const d = dayOf(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) {
          inst.t.instrumentErrors.push('daily-snap: ' + String(e.message).slice(0, 80));
        }
      }
    },
  });

  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, wrapped, { days: days, sampleEvery: 30 });
  });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}

  const out = {
    seed: seed,
    policy: policyId,
    days: result && result.days,
    gameDays: dayOf(Game),
    endReason: result && result.endReason,
    won: !!(Game && Game.won),
    over: !!(Game && Game.over),
    biasCalls: inst.t.biasCalls,
    bondsTopCalls: inst.t.bondsTopCalls,
    bondsTopTransitions: inst.t.bondsTopTransitions,
    topHist: inst.t.topHist,
    bondProposed: inst.t.bondProposed,
    daily: inst.t.daily,
    instrumentErrors: inst.t.instrumentErrors,
    wrapCounts: inst.t.wrapCounts,
    sha: sha12(),
  };
  console.log(JSON.stringify(out));
}

function runDriver() {
  const seeds = (process.env.SEEDS || '7,42,99,1234,555,777,2026,31337')
    .split(',').map(function (s) { return parseInt(s.trim(), 10); })
    .filter(Number.isFinite);
  const days = process.env.DAYS || '60';
  const policyId = process.env.POLICY || 'capable';
  const sha = sha12();
  const rows = [];
  const summaries = [];
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    const r = spawnSync(process.execPath, [__filename, '--one'], {
      cwd: REPO,
      encoding: 'utf8',
      env: Object.assign({}, process.env, {
        SEED: String(seed),
        DAYS: String(days),
        POLICY: policyId,
      }),
      timeout: 600000,
      maxBuffer: 32 * 1024 * 1024,
    });
    if (r.status !== 0) {
      console.error(JSON.stringify({
        seed: seed, error: 'child_failed', status: r.status,
        stderr: String(r.stderr || '').slice(0, 400),
      }));
      process.exitCode = 1;
      continue;
    }
    const lines = String(r.stdout || '').trim().split('\n').filter(Boolean);
    let row = null;
    try { row = JSON.parse(lines[lines.length - 1]); }
    catch (e) {
      console.error(JSON.stringify({ seed: seed, error: 'bad_json', stdout: String(r.stdout || '').slice(0, 200) }));
      process.exitCode = 1;
      continue;
    }
    rows.push(row);
    const s = summarizeSeed(row);
    summaries.push(s);
    console.error(JSON.stringify(s));
  }

  // Aggregate
  const agg = {
    sha: sha,
    policy: policyId,
    daysRequested: parseInt(days, 10),
    seeds: seeds,
    nSeeds: summaries.length,
    biasCalls: 0,
    bondsTopCalls: 0,
    bondsTopTransitions: 0,
    topHist: Object.create(null),
    bondProposedN: 0,
    proposedPersonN: 0,
    proposedLinkN: 0,
    proposedWarmthNotBondsTop: 0,
    proposedWithBondsTop: 0,
    proposedPersonWarmthNotBondsTop: 0,
    proposedPersonWithBondsTop: 0,
    proposedWhileGateOpen: 0,
    seedsWithBondsTopCall: 0,
    seedsWithBondsTopDay: 0,
    seedsWithGateOpen: 0,
    seedsWithBondProposed: 0,
    seedsWithPersonBondProposed: 0,
    seedsWithWarmthOnlyProposals: 0,
    peakTrustedAnyoneN: 0,
    peakMaxTrust: 0,
  };
  for (const id of GOAL_IDS) agg.topHist[id] = 0;
  agg.topHist['(null)'] = 0;

  for (let i = 0; i < summaries.length; i++) {
    const s = summaries[i];
    agg.biasCalls += s.biasCalls || 0;
    agg.bondsTopCalls += s.bondsTopCalls || 0;
    agg.bondsTopTransitions += s.bondsTopTransitions || 0;
    agg.bondProposedN += s.bondProposedN || 0;
    agg.proposedPersonN += s.proposedPersonN || 0;
    agg.proposedLinkN += s.proposedLinkN || 0;
    agg.proposedWarmthNotBondsTop += s.proposedWarmthNotBondsTop || 0;
    agg.proposedWithBondsTop += s.proposedWithBondsTop || 0;
    agg.proposedPersonWarmthNotBondsTop += s.proposedPersonWarmthNotBondsTop || 0;
    agg.proposedPersonWithBondsTop += s.proposedPersonWithBondsTop || 0;
    agg.proposedWhileGateOpen += s.proposedWhileGateOpen || 0;
    if ((s.bondsTopCalls || 0) > 0) agg.seedsWithBondsTopCall++;
    if ((s.daysAnyBondsTop || 0) > 0) agg.seedsWithBondsTopDay++;
    if ((s.daysGateOpen || 0) > 0) agg.seedsWithGateOpen++;
    if ((s.bondProposedN || 0) > 0) agg.seedsWithBondProposed++;
    if ((s.proposedPersonN || 0) > 0) agg.seedsWithPersonBondProposed++;
    if ((s.proposedWarmthNotBondsTop || 0) > 0 && (s.proposedWithBondsTop || 0) === 0) {
      agg.seedsWithWarmthOnlyProposals++;
    }
    if ((s.peakTrustedAnyoneN || 0) > agg.peakTrustedAnyoneN) agg.peakTrustedAnyoneN = s.peakTrustedAnyoneN;
    if ((s.peakMaxTrust || 0) > agg.peakMaxTrust) agg.peakMaxTrust = s.peakMaxTrust;
    const th = s.topHist || {};
    for (const k of Object.keys(th)) agg.topHist[k] = (agg.topHist[k] || 0) + th[k];
  }

  // Verdict helpers (measurement language for the store doc)
  let opportunity = 'closed';
  if (agg.seedsWithGateOpen > 0 || agg.peakTrustedAnyoneN > 0) opportunity = 'open';
  let lottery = 'never';
  if (agg.bondsTopCalls > 0) lottery = 'fires';
  let warmthBypass = 'unknown';
  if (agg.bondProposedN > 0) {
    warmthBypass = (agg.proposedWarmthNotBondsTop > 0) ? 'yes_warmth_without_bonds_top' : 'no_all_with_bonds_top';
  }
  let defect = 'none_seen';
  // Clear wiring defect: bonds gate never opens despite person-trust writers
  // claiming opportunity, OR gate opens but bias hook never runs.
  if (agg.biasCalls === 0) defect = 'instrument_or_hook_dead';
  else if (agg.peakMaxTrust === 0 && agg.seedsWithGateOpen === 0) {
    defect = 'person_trust_still_dark'; // unexpected on tip with person-trust.js
  } else if (agg.seedsWithGateOpen > 0 && agg.bondsTopCalls === 0) {
    // Gate open but bonds never wins max-weight — may be weight competition
    // (policy/character shape), not missing wiring. Flag as measure for Muse.
    defect = 'none_wiring_weights_may_lose';
  }

  const out = {
    probe: 'bonds-goal-pick-20261108',
    sha: sha,
    method: {
      policy: policyId,
      days: parseInt(days, 10),
      seeds: seeds,
      hooks: ['vgoalBiasCands top histogram', 'vgoalTop bonds transitions',
        'tele bond_proposed + initiator top/gate', 'daily vgoals + personTrustCensus'],
      distinction: 'bonds_goal_top = initiator stored top === bonds; warmth_not_bonds_top = proposeBond warmth window without bonds top',
    },
    aggregate: agg,
    perSeed: summaries,
    verdict: {
      opportunity: opportunity,
      bondsLottery: lottery,
      warmthBypass: warmthBypass,
      gameDefect: defect,
    },
  };
  console.log(JSON.stringify(out, null, 2));
}

if (process.argv.indexOf('--one') !== -1) {
  runOne().catch(function (e) {
    console.error(e && e.stack || e);
    process.exit(1);
  });
} else {
  runDriver();
}
