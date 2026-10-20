#!/usr/bin/env node
// analyze-relaydarkcost-20261020.js — offline read-only attribution +
// pairing instrument for sim-relaydarkcost.
//
// The wintrack 100%-attribution path, driverless: wins via the canonical
// endRec.tb.path/branch (the engine's own win record; missing or
// null = UNEXPLAINED, never guessed); non-wins via the three stall
// classes (pre-table-collapse / invitation-window-collapse /
// no-invitation-stall). No tablepathdriver walked recorder dependency
// (sibling arm is fixing that recorder this run).
//
// For every paired run (same seed x policy, control vs road-armed) it
// assembles the delta fact bundle: road activity (claimDay, doneDay,
// verb counts, grounding at end, stoppedTable), the day-exact break
// chain (death channels + days, pantry/roster trajectory notes from
// recs), and the control contrast. The ROAD-ROLE JUDGMENT
// (CAUSED / CONTRIBUTED / RULED-OUT) is made by the agent against the
// pre-registered criteria in evidence/2026-10-20/sim-relaydarkcost.md
// and recorded in the report JSON's `judgment` fields + the evidence
// file — the instrument assembles facts, it never judges.
//
// Usage: node scripts/analyze-relaydarkcost-20261020.js
// Output: evidence/2026-10-20/relaydarkcost-judgment.json (+ console report)
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20');
const CORP = path.join(EVID, 'perseed-relaydarkcost');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const SIDES = ['control', 'roadarmed'];

function readRun(side, policy, seed) {
  const fp = path.join(CORP, side, policy, `s${seed}.json`);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

// Stall/wine attribution for one run (driverless). Returns {cls, why}.
// cls: win | pre-table-collapse | invitation-window-collapse |
//      no-invitation-stall | sat-no-win | UNEXPLAINED.
function attributeRun(r) {
  if (!r) return { cls: 'MISSING', why: 'no per-seed JSON' };
  if (r.won) {
    const tb = (r.endRec && r.endRec.tb) || null;
    const p = tb && tb.path, b = tb && tb.branch;
    if (p) return { cls: 'win', why: `endRec.tb ${p}/${b == null ? '?' : b}`, path: p, branch: b,
      finalDay: r.tableDoneDay != null ? r.tableDoneDay : r.gameDays };
    return { cls: 'UNEXPLAINED', why: 'won but endRec.tb.path null' };
  }
  if (r.satEver) {
    return { cls: 'sat-no-win', why: `sat d${r.sittingDay} (${r.seatAtSit}), phases=[${(r.phaseTrace || []).join(',')}], end=${r.endReason}` };
  }
  if (r.tableDay != null) {
    const deaths = (r.deathsAttributed && r.deathsAttributed.attributed) || [];
    const chan = {};
    for (const d of deaths) chan[d.channel] = (chan[d.channel] || 0) + 1;
    return { cls: 'invitation-window-collapse',
      why: `table announced d${r.tableDay}, village ended d${r.gameDays} (${r.endReason}), never sat; deaths=${JSON.stringify(chan)}` };
  }
  if (r.endReason === 'village-lost' || (r.gameDays || 0) < 180) {
    const deaths = (r.deathsAttributed && r.deathsAttributed.attributed) || [];
    const chan = {};
    for (const d of deaths) chan[d.channel] = (chan[d.channel] || 0) + 1;
    return { cls: 'pre-table-collapse',
      why: `village ended d${r.gameDays} (${r.endReason}) before any table announcement; deaths=${JSON.stringify(chan)}` };
  }
  return { cls: 'no-invitation-stall',
    why: `survived to d${r.gameDays}, table never announced (national=${r.national}, maxWave=${r.maxWave})` };
}

// Delta class for a paired run.
function deltaClass(a, b) { // a=control, b=roadarmed
  if (a.cls === 'win' && b.cls === 'win') {
    if (a.path !== b.path || a.branch !== b.branch) return 'PATH-CHANGE';
    return 'BOTH-WIN';
  }
  if (a.cls === 'win' && b.cls !== 'win') return 'BREAK';
  if (a.cls !== 'win' && b.cls === 'win') return 'FIX';
  if (a.cls === b.cls) return 'SAME-LOSS';
  return 'LOSS-CHANGE';
}

// Road-activity fact bundle from the armed run.
function roadBundle(r) {
  const rd = r.rdSummary || {};
  const re = r.relayAtEnd || {};
  const verbs = (rd.deepens | 0) + (rd.efficients | 0) + (rd.rewrites | 0) + (rd.skims | 0);
  return {
    active: !!rd.active, claimed: !!rd.claimed, claimDay: rd.claimDay,
    done: !!rd.done, doneDay: rd.doneDay, floorStop: !!rd.floorStop,
    stoppedTable: !!rd.stoppedTable,
    verbs, deepens: rd.deepens | 0, efficients: rd.efficients | 0,
    rewrites: rd.rewrites | 0, skims: rd.skims | 0,
    leanEnd: re.lean != null ? re.lean : rd.lean,
    groundingEnd: re.grounding != null ? re.grounding : rd.grounding,
    darkUsesEnd: re.darkUses != null ? re.darkUses : (rd.darkUses | 0),
    bond: re.bond != null ? re.bond : (rd.bond | 0),
    rdError: rd.rdError | 0, verbError: rd.verbError | 0, nullVerbs: rd.nullVerbs | 0,
  };
}

// Break-chain fact bundle: the last-30-day death list + pantry/roster at
// collapse, for the agent's judgment read.
function breakBundle(r) {
  const deaths = ((r.deathsAttributed && r.deathsAttributed.attributed) || [])
    .map(d => ({ day: d.day, who: d.name || d.who, channel: d.channel, cause: d.cause }))
    .sort((x, y) => x.day - y.day);
  const recs = r.recs || [];
  const tail = recs.slice(-30).map(x => ({
    d: x.d, pantry: x.st ? x.st.pantry : null, roster: x.st ? x.st.roster : null,
    alive: !!x.alive, won: !!x.won, tbPhase: x.tb ? x.tb.phase : null, tbWaiting: x.tb ? !!x.tb.waiting : null,
  }));
  return { deaths, tail };
}

function main() {
  const report = { generated_utc: new Date().toISOString(), sides: SIDES, seeds: SEEDS,
    policies: POLICIES, runs: {}, pairs: [], attribution: { total: 0, unexplained: 0, missing: 0 }, deltas: {} };
  // Per-run attribution (all 32).
  for (const side of SIDES) for (const policy of POLICIES) for (const seed of SEEDS) {
    const r = readRun(side, policy, seed);
    const attr = attributeRun(r);
    report.runs[`${side}/${policy}/s${seed}`] = { attr: attr.cls, why: attr.why,
      path: attr.path || null, branch: attr.branch || null,
      gameDays: r ? r.gameDays : null, won: r ? !!r.won : null,
      tableDay: r ? r.tableDay : null, sittingDay: r ? r.sittingDay : null,
      maxWave: r ? r.maxWave : null, national: r ? !!r.national : null,
      instrumentErrors: r ? (r.instrumentErrors | 0) : null,
      unverifiable: r && r.deathsAttributed ? (r.deathsAttributed.unverifiableCount | 0) : null,
    };
    report.attribution.total++;
    if (attr.cls === 'UNEXPLAINED') report.attribution.unexplained++;
    if (attr.cls === 'MISSING') report.attribution.missing++;
  }
  // Pairing + delta bundles.
  for (const policy of POLICIES) for (const seed of SEEDS) {
    const a = readRun('control', policy, seed);
    const b = readRun('roadarmed', policy, seed);
    const aa = attributeRun(a), ba = attributeRun(b);
    const dc = (aa.cls === 'MISSING' || ba.cls === 'MISSING') ? 'MISSING' : deltaClass(aa, ba);
    report.deltas[dc] = (report.deltas[dc] || 0) + 1;
    const pair = { policy, seed, delta: dc,
      control: { attr: aa.cls, why: aa.why, path: aa.path || null, branch: aa.branch || null, gameDays: a ? a.gameDays : null },
      armed: { attr: ba.cls, why: ba.why, path: ba.path || null, branch: ba.branch || null, gameDays: b ? b.gameDays : null },
      road: b ? roadBundle(b) : null,
      judgment: null, judgmentWhy: null,
    };
    if (dc === 'BREAK' || dc === 'FIX' || dc === 'PATH-CHANGE' || dc === 'LOSS-CHANGE') {
      pair.breakChain = b ? breakBundle(b) : null;
      pair.controlChain = a ? breakBundle(a) : null;
    }
    report.pairs.push(pair);
  }
  const fp = path.join(EVID, 'relaydarkcost-judgment.json');
  fs.writeFileSync(fp, JSON.stringify(report, null, 1));
  // Console summary.
  console.log(`runs attributed: ${report.attribution.total}, unexplained=${report.attribution.unexplained}, missing=${report.attribution.missing}`);
  console.log('delta classes:', JSON.stringify(report.deltas));
  for (const p of report.pairs) {
    if (p.delta === 'BREAK' || p.delta === 'FIX' || p.delta === 'PATH-CHANGE' || p.delta === 'LOSS-CHANGE') {
      const rd = p.road || {};
      console.log(`  ${p.delta} ${p.policy} s${p.seed}: control=${p.control.attr}${p.control.path ? ' ' + p.control.path + '/' + p.control.branch : ''}(d${p.control.gameDays}) armed=${p.armed.attr}${p.armed.path ? ' ' + p.armed.path + '/' + p.armed.branch : ''}(d${p.armed.gameDays}) | road: claimDay=${rd.claimDay} verbs=${rd.verbs} done=${rd.done} stoppedTable=${rd.stoppedTable} groundingEnd=${rd.groundingEnd}`);
    }
  }
  console.log(`wrote ${fp}`);
}

if (require.main === module) main();
module.exports = { attributeRun, deltaClass, roadBundle, readRun };
