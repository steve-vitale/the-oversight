#!/usr/bin/env node
// sim-foreignhelp-b-analyze.js — aggregate the perseed-foreignhelp corpus
// into the #872 gate census. Reads evidence/2026-10-24/perseed-foreignhelp
// s<seed>-<lead|belong>-<mode>.json files and prints JSON + human summary.
// Usage: node scripts/sim-foreignhelp-b-analyze.js [MODE] [EVID-DIR]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const MODE = process.argv[2] || 'baseline';
const EVID = process.argv[3] || path.join(REPO, 'evidence', '2026-10-24', 'perseed-foreignhelp');
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));

const files = fs.readdirSync(EVID).filter(x => new RegExp(`^s703\\d+-(lead|belong)-${MODE}\\.json$`).test(x)).sort();
if (!files.length) { console.error(`No ${MODE} corpus files in ${EVID}`); process.exit(2); }

const agg = {
  mode: MODE, configs: files.length, configsByPolicy: {},
  crisesRaised: 0, crisesResolved: 0, crisesLiveAtEnd: 0,
  resolveByHow: {}, callsByTier: {}, callsTotal: 0,
  asksByViaVerdict: {}, asksTotal: 0, arrivalsByResult: {}, arrivalsTotal: 0,
  crisesWithHelpAtDoor: 0, crisesWithAttracted: 0, attractedTotal: 0,
  crisesWithAnyCall: 0, crisesWithNoCall: 0,
  gateNoCallNoLinks: 0, gateNoCallHasLinks: 0,
  gateCalledNoAsk: 0, gateAskedRefused: 0, gateAcceptedNotArrived: 0, gateArrived: 0,
  raiseLinksZero: 0, raiseLinksTotal: 0, raiseBestTrustLt35: 0, raiseBestTrustGe35: 0,
  raiseStageGe2: 0, raiseCryHeld: 0, raiseSnaps: 0,
  wall: { national: 0, table: 0, won: 0, wave5: 0, wave4: 0 },
  survivalByPolicy: {}, perConfig: [],
};
const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

for (const f of files) {
  const d = load(path.join(EVID, f));
  const pol = d.base === 'belongfeast' ? 'belong' : 'lead';
  agg.configsByPolicy[pol] = (agg.configsByPolicy[pol] || 0) + 1;
  const fh = d.fh || { calls: [], asks: [], arrivals: [], raiseSnaps: [], resolveSnaps: [] };
  const raised = (d.crisisEvents || []).filter(e => e.event === 'raised').length;
  const resolved = fh.resolveSnaps.length;
  agg.crisesRaised += raised; agg.crisesResolved += resolved; agg.crisesLiveAtEnd += Math.max(0, raised - resolved);
  for (const rs of fh.resolveSnaps) {
    agg.resolveByHow[rs.how || '?'] = (agg.resolveByHow[rs.how || '?'] || 0) + 1;
    const calls = rs.calls || [];
    if (calls.length) agg.crisesWithAnyCall++; else agg.crisesWithNoCall++;
    for (const c of calls) { agg.callsByTier[c.tier || '?'] = (agg.callsByTier[c.tier || '?'] || 0) + 1; agg.callsTotal++; }
    if ((rs.helpAtDoor || 0) > 0) { agg.crisesWithHelpAtDoor++; agg.gateArrived++; }
    else if (calls.length) {
      // Called but no help at door: asked-refused vs accepted-not-arrived is
      // split by the global ask verdicts below; per-crisis we can only say
      // "called, no arrival" here — refined by ask-join in the notes.
      agg.gateCalledNoAsk++;
    }
    if ((rs.attracted || 0) > 0) { agg.crisesWithAttracted++; agg.attractedTotal += rs.attracted; }
  }
  for (const a of fh.asks) {
    const k = `${a.via || '?'}:${a.verdict || '?'}`;
    agg.asksByViaVerdict[k] = (agg.asksByViaVerdict[k] || 0) + 1; agg.asksTotal++;
    if (a.verdict === 'refused') agg.gateAskedRefused++;
  }
  for (const a of fh.arrivals) { agg.arrivalsByResult[a.result || '?'] = (agg.arrivalsByResult[a.result || '?'] || 0) + 1; agg.arrivalsTotal++; }
  for (const s of fh.raiseSnaps) {
    agg.raiseSnaps++;
    agg.raiseLinksTotal += (s.links || []).length;
    if (!(s.links || []).length) agg.raiseLinksZero++;
    const best = (s.links || []).reduce((m, l) => Math.max(m, l.trust == null ? -1 : l.trust), -1);
    if (best >= 35) agg.raiseBestTrustGe35++; else agg.raiseBestTrustLt35++;
    if ((s.integrationStage || 0) >= 2) agg.raiseStageGe2++;
    if ((s.cryAbilities || []).length) agg.raiseCryHeld++;
  }
  // Gate split for no-call crises: join raiseSnaps by order to resolveSnaps
  // is unreliable (raises include live-at-end); instead use raiseSnap link
  // counts as the precondition denominator and no-call crises as numerator.
  agg.wall.national += d.national || 0; agg.wall.table += d.table || 0; agg.wall.won += d.won || 0;
  if ((d.maxWave || 1) >= 5) agg.wall.wave5++;
  if ((d.maxWave || 1) >= 4) agg.wall.wave4++;
  (agg.survivalByPolicy[pol] = agg.survivalByPolicy[pol] || []).push(d.gameDays || 0);
  agg.perConfig.push({ file: f, seed: d.seed, policy: pol, raised, resolved,
    calls: (fh.calls || []).length, asks: (fh.asks || []).length, arrivals: (fh.arrivals || []).length,
    helpAtDoorCrises: fh.resolveSnaps.filter(r => (r.helpAtDoor || 0) > 0).length,
    national: d.national || 0, table: d.table || 0, won: d.won || 0, maxWave: d.maxWave || 1,
    gameDays: d.gameDays || 0, endReason: d.endReason || null,
    instrumentErrors: (d.instrumentErrors || []).length });
}
// Refine: no-call gate split — crises with no call AND no links at raise
// cannot be separated per-crisis without an id join, so report the two
// denominators honestly: no-call crises vs raises with zero links.
agg.gateNoCallNoLinks = null; // not joinable per-crisis; see raiseLinksZero + crisesWithNoCall
agg.medianSurvivalByPolicy = {};
for (const p of Object.keys(agg.survivalByPolicy)) agg.medianSurvivalByPolicy[p] = med(agg.survivalByPolicy[p]);
agg.medianSurvivalAll = med(agg.perConfig.map(c => c.gameDays));
agg.seedsWithArrival = [...new Set(agg.perConfig.filter(c => c.helpAtDoorCrises > 0).map(c => c.seed))].length;

console.log(JSON.stringify(agg, null, 1));
console.log('\n--- HUMAN SUMMARY ---');
console.log(`mode=${MODE} configs=${agg.configs} raised=${agg.crisesRaised} resolved=${agg.crisesResolved} liveAtEnd=${agg.crisesLiveAtEnd}`);
console.log(`calls total=${agg.callsTotal} by tier=${JSON.stringify(agg.callsByTier)}; crises with any call=${agg.crisesWithAnyCall}, with no call=${agg.crisesWithNoCall}`);
console.log(`asks total=${agg.asksTotal} by via:verdict=${JSON.stringify(agg.asksByViaVerdict)}`);
console.log(`arrivals (aidHelpArrived events)=${agg.arrivalsTotal} by result=${JSON.stringify(agg.arrivalsByResult)}; crises with helpAtDoor>0=${agg.crisesWithHelpAtDoor}`);
console.log(`raiseSnaps=${agg.raiseSnaps} zero-link raises=${agg.raiseLinksZero} bestTrust>=35 raises=${agg.raiseBestTrustGe35} bestTrust<35 raises=${agg.raiseBestTrustLt35} stage>=2 raises=${agg.raiseStageGe2} cry-held raises=${agg.raiseCryHeld}`);
console.log(`wall: national=${agg.wall.national}/${agg.configs} table=${agg.wall.table}/${agg.configs} won=${agg.wall.won} wave4=${agg.wall.wave4} wave5=${agg.wall.wave5} medianSurvival=${JSON.stringify(agg.medianSurvivalByPolicy)} all=${agg.medianSurvivalAll}`);
console.log(`seeds with >=1 arrival crisis: ${agg.seedsWithArrival}`);
