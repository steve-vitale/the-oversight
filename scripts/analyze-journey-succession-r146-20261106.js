#!/usr/bin/env node
// analyze-journey-succession-r146-20261106.js — SUCCESSION r146 NEWCOMER-CHANNEL CAP.
// Reads evidence/2026-11-06/journey-succession-r146-<seed>.stdout.json.
// CAP-NC (binding, r146 revision per r142 metric review): newcomer-probe pair
// bonded by deadlineDplus = max(arrivalDplus, probeDplus) + 14, scored on the
// ELIGIBLE subset only. Denominator: probe opened AND the run observed the
// deadline (some bondDaily entry with dplus >= deadlineDplus) AND the probe
// bearer still holds at the deadline (last bondDaily entry with dplus <=
// deadlineDplus has bearerId === probe.bearerId). Bonding is read off
// bondDaily (pair key in newBearer while the probe bearer holds), because
// snapshots relD14/relD30/relEnd may not align with the per-seed deadline.
// Panel stop rule (run-side): stop when 3 eligible seeds are collected or
// after 8 seeds. PASS: >=3 eligible AND >=3 bonded AND bonded/eligible >=
// 2/3. CAPACITY DEFECT: >=3 eligible AND 0 bonded. Otherwise
// INSUFFICIENT-DATA (descriptive, not re-scored). The r142 stranger-probe
// CAP-D14 is kept as a DESCRIPTIVE line only (saturation datapoint).
// Descriptive extra: bond key in ANY snapshot (relD14 / relD30 / relEnd) or
// ANY bondDaily entry regardless of bearer survival — capacity evidence that
// survives a later death. OPP: talk requests to the bearer (self-requests
// excluded, reported separately — selfReqDayEntries is now ALSO the
// regression check on the r133 self-talk purge, expect 0) + daily bond
// diffs over d+0..d+30, split FIRST-bearer vs LATER-bearer via
// bondDaily.bearerId (r137 instrument fix; r133 mixed them), plus newcomer
// arrivals and FIRST-bearer bonds with newcomers vs pre-existing partners.
// CARRIED (reported, not scored): pick-time rank, funeral INCALL.
// Analyzer only; reads JSON.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-11-06');
const seeds = process.argv.slice(2);
if (!seeds.length) { console.error('usage: node scripts/analyze-journey-succession-r146-20261106.js <seed...>'); process.exit(2); }
const pairKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
function bondAt(snap, a, b) {
  if (!snap) return null;
  const k = pairKey(a, b);
  for (const x of (snap.bonds || [])) if (x.key === k) return x;
  return null;
}
function pickTimeRank(rec) {
  // pickCtxs entries carry the npcIds() calls inside the death (r119 PICKCTX2).
  // r146 CORRECTION: npcIds() returns ROSTER order, not trust order
  // (betrayal.js:98 — filter only, no sort); the core sorts the returned
  // list by trust itself (ledger.js:846). The pre-r146 analyzer read the
  // successor's index in the RAW list, i.e. roster position, and called
  // it "rank" — on this panel that read 9/2/8 while the trust-sorted
  // rank is 1 on all 28 handoffs. The rank below replicates the core's
  // sort exactly (stable sort by the call's captured trust map, desc),
  // so it measures the rule "trust decides", not roster position.
  for (const pc of (rec.pickCtxs || [])) {
    const calls = pc.npcCalls || pc.calls || [];
    for (const c of calls) {
      const list = c.sorted || c.trustSorted || c.list || null;
      if (!list) continue;
      const trust = c.trust || {};
      const sorted = list.slice().sort((a, b) => {
        const ia = (typeof a === 'string' ? a : (a.id || a.vid));
        const ib = (typeof b === 'string' ? b : (b.id || b.vid));
        return (trust[ib] || 0) - (trust[ia] || 0);
      });
      const ids = sorted.map(e => (typeof e === 'string' ? e : (e.id || e.vid)));
      const i = ids.indexOf(pc.newId);
      if (i >= 0) return { rank: i + 1, nCalls: calls.length, note: 'npcCalls (trust-sorted)' };
    }
    if (pc.pickTimeRank != null) return { rank: pc.pickTimeRank, nCalls: calls.length, note: 'pickTimeRank field' };
  }
  return { rank: null, note: 'no npcCalls in pickCtxs; keys=' + Object.keys((rec.pickCtxs || [])[0] || {}).join(',') };
}
const panel = [];
for (const seed of seeds) {
  const f = path.join(EVID, `journey-succession-r146-${seed}.stdout.json`);
  if (!fs.existsSync(f)) { console.log(`\n== seed ${seed}: MISSING RECORD ==`); panel.push({ seed, missing: true }); continue; }
  const rec = JSON.parse(fs.readFileSync(f, 'utf8'));
  const death = rec.death || null;
  const skipped = !death || !death.passed;
  console.log(`\n== seed ${seed}: ${skipped ? 'SKIPPED (no handoff)' : `handoff d${death.day} ${death.oldFirst} -> ${death.newFirst} (${death.scripted ? 'scripted' : 'organic'})`}`);
  if (skipped) { console.log('   notes:', (rec.notes || []).slice(-2).join(' | ')); panel.push({ seed, skipped: true }); continue; }
  const firstBearerId = rec.origSuccId || null;
  // --- CAP-NC (binding): newcomer-probe pair bonded by deadlineDplus ---
  const np = rec.newcomerProbe || null;
  const bdAll = rec.bondDaily || [];
  let cap = null;
  let capEligible = false;
  let bondedEver = false;
  let deadlineDplus = null;
  if (!np) cap = { status: 'no-probe-record' };
  else if (np.none) cap = { status: 'no-newcomer-arrival', arrivals: Object.keys(np.seen || {}).length, relPostRosterN: np.relPostRosterN };
  else if (np.bondedBefore) { cap = { status: 'bonded-before-probe', probe: np, bondedEver: true }; bondedEver = true; }
  else if (np.refused) cap = { status: 'probe-refused', probe: np };
  else {
    deadlineDplus = np.deadlineDplus;
    const pk = pairKey(np.bearerId, np.vidId);
    let bondedByDeadline = false, bondedEverBd = false;
    for (const d of bdAll) {
      const inBearer = (d.newBearer || []).some(b => b.key === pk);
      const inEither = inBearer || (d.newNpc || []).some(b => b.key === pk);
      if (inEither) bondedEverBd = true;
      if (inBearer && d.dplus <= deadlineDplus && d.bearerId === np.bearerId) bondedByDeadline = true;
    }
    const snapBonded = !!(bondAt(rec.relD14, np.bearerId, np.vidId) || bondAt(rec.relD30, np.bearerId, np.vidId) || bondAt(rec.relEnd, np.bearerId, np.vidId));
    bondedEver = bondedEverBd || snapBonded;
    const observedDeadline = bdAll.some(d => d.dplus >= deadlineDplus);
    const atDeadline = [...bdAll].filter(d => d.dplus <= deadlineDplus).pop();
    const holderAtDeadline = atDeadline ? atDeadline.bearerId : null;
    if (!observedDeadline) cap = { status: 'village-ended-before-deadline', probe: np, bondedEver, deadlineDplus };
    else if (holderAtDeadline !== np.bearerId) cap = { status: 'second-handoff-before-deadline', probe: np, bondedEver, deadlineDplus, holderAtDeadline };
    else {
      capEligible = true;
      cap = { status: bondedByDeadline ? 'bonded-by-deadline' : 'not-bonded-by-deadline', probe: np, bondedByDeadline, bondedEver, deadlineDplus };
    }
  }
  console.log(`   CAP-NC: ${cap.status} (newcomer-probe: ${np && !np.none ? `${np.vid} arrived d+${np.arrivalDplus} probe d+${np.probeDplus} deadline d+${np.deadlineDplus} trust=${np.trust} want=${np.want} refused=${np.refused}${np.viaCheckpoint ? ' viaCheckpoint' : ''}` : (np ? np.none : 'none')}) bondedEver=${bondedEver}`);
  // --- CAP-D14 (descriptive only): r142 stranger-probe, saturation datapoint ---
  const probe = rec.strangerProbe || null;
  const bearerId = probe && probe.bearerId;
  let capD14 = null;
  if (!probe) capD14 = { status: 'no-probe-record' };
  else if (probe.none) capD14 = { status: 'no-stranger-pool' };
  else if (probe.refused) capD14 = { status: 'probe-refused', probe };
  else {
    const d14 = bondAt(rec.relD14, bearerId, probe.vidId);
    const d30 = bondAt(rec.relD30, bearerId, probe.vidId);
    const end = bondAt(rec.relEnd, bearerId, probe.vidId);
    const d14Ever = !!(d14 || d30 || end);
    if (!rec.relD14) capD14 = { status: 'village-ended-before-d14', probe, bondedEver: d14Ever };
    else if (rec.relD14.selfId !== bearerId) capD14 = { status: 'second-handoff-before-d14', probe, bondedEver: d14Ever, relD14Bearer: rec.relD14.selfId };
    else capD14 = { status: d14 ? 'bonded-d14' : 'not-bonded-by-d14', probe, bondedEver: d14Ever };
  }
  console.log(`   CAP-D14 (descriptive): ${capD14.status} (probe: ${probe && !probe.none ? `${probe.vid} trust=${probe.trust} want=${probe.want} refused=${probe.refused}` : (probe ? probe.none : 'none')}) bondedEver=${capD14.bondedEver != null ? capD14.bondedEver : 'n/a'}`);
  // --- OPP d+0..d+30 ---
  const tq = (rec.talkreqDaily || []).filter(d => d.dplus <= 30);
  const bd = (rec.bondDaily || []).filter(d => d.dplus <= 30);
  const seenReq = new Map(); let selfReqDays = 0;
  for (const d of tq) {
    for (const r of (d.reqs || [])) {
      if (r.selfRequest) { selfReqDays++; continue; }
      const k = r.who + '|' + (r.day == null ? '?' : r.day);
      if (!seenReq.has(k)) seenReq.set(k, { who: r.whoName, day: r.day, bonded: r.bondedToBearer });
    }
  }
  const reqList = [...seenReq.values()];
  const unbondedReq = reqList.filter(r => r.bonded === false);
  const drivenDays = new Set((rec.convoReads || []).map(c => c.dplus));
  // r146 OPP newcomer attribution: relPost roster = handoff-day roster;
  // a bond partner outside it is a newcomer.
  const relPostRoster = new Set(Object.keys((rec.relPost && rec.relPost.affinityNames) || {}));
  const isNewcomerId = (id) => id != null && !relPostRoster.has(id);
  const newcomerSeen = rec._newcomerSeen || {};
  const arrivalDplus = Object.values(newcomerSeen).map(s => s.dplus);
  const arrivalsN = Object.keys(newcomerSeen).length;
  const firstArrivalDplus = arrivalDplus.length ? Math.min(...arrivalDplus) : null;
  let npcNewTotal = 0;
  let firstNewTotal = 0, firstNewDriven = 0, firstNewUndriven = 0;
  let firstNewNewcomer = 0, firstNewPreexisting = 0;
  let laterNewTotal = 0;
  const perDayNpc = [];
  for (const d of bd) {
    npcNewTotal += (d.newNpc || []).length; perDayNpc.push((d.newNpc || []).length);
    const isFirst = firstBearerId != null && d.bearerId === firstBearerId;
    const n = (d.newBearer || []).length;
    if (isFirst) {
      firstNewTotal += n;
      if (drivenDays.has(d.dplus)) firstNewDriven += n;
      else firstNewUndriven += n;
      for (const b of (d.newBearer || [])) {
        const parts = String(b.key || '').split('|');
        const partner = parts[0] === d.bearerId ? parts[1] : parts[0];
        if (isNewcomerId(partner)) firstNewNewcomer++;
        else firstNewPreexisting++;
      }
    } else {
      laterNewTotal += n;
    }
  }
  perDayNpc.sort((a, b) => a - b);
  const med = perDayNpc.length ? perDayNpc[Math.floor(perDayNpc.length / 2)] : 0;
  console.log(`   OPP talk-requests (distinct, d+0..d+30, self excluded): total=${reqList.length} unbonded=${unbondedReq.length} selfReqDayEntries=${selfReqDays}${selfReqDays ? ' <-- REGRESSION? r133 purge should clear these' : ''}`);
  if (unbondedReq.length) console.log(`       unbonded requesters: ${unbondedReq.map(r => `${r.who}(d${r.day})`).join(', ')}`);
  console.log(`   OPP bonds d+0..d+30: NPC-NPC new=${npcNewTotal} over ${bd.length} bond-days (median/day=${med}); FIRST-bearer new=${firstNewTotal} (driven-days=${firstNewDriven}, undriven-days=${firstNewUndriven}); LATER-bearer new=${laterNewTotal}`);
  console.log(`   OPP newcomers: arrivals=${arrivalsN} first-arrival d+${firstArrivalDplus}; FIRST-bearer new bonds with newcomers=${firstNewNewcomer} vs pre-existing=${firstNewPreexisting}`);
  // --- CARRIED ---
  const pr = pickTimeRank(rec);
  const incall = (rec.pdCalls || []).some(c => c.deathBeatN > 0);
  console.log(`   CARRIED pick-time rank: ${pr.rank == null ? 'n/a (' + pr.note + ')' : pr.rank} | funeral INCALL beat: ${incall}`);
  console.log(`   relPost bonds=${(rec.relPost && rec.relPost.bonds || []).length} relD14=${(rec.relD14 && rec.relD14.bonds || []).length} relD30=${(rec.relD30 && rec.relD30.bonds || []).length} relEnd=${(rec.relEnd && rec.relEnd.bonds || []).length} relD14.selfId=${(rec.relD14 && rec.relD14.selfId) || 'n/a'}`);
  panel.push({ seed, cap: cap.status, capEligible, bondedEver, probeVid: np && np.vid, deadlineDplus, arrivals: arrivalsN, firstArrivalDplus, firstBearerNewcomer: firstNewNewcomer, firstBearerPreexisting: firstNewPreexisting, capD14: capD14.status, reqTotal: reqList.length, reqUnbonded: unbondedReq.length, selfReqDayEntries: selfReqDays, npcNew: npcNewTotal, firstBearerNew: firstNewTotal, firstBearerNewUndriven: firstNewUndriven, laterBearerNew: laterNewTotal, pickRank: pr.rank, incall });
}
console.log('\n=== PANEL ===');
for (const p of panel) console.log(JSON.stringify(p));
const eligible = panel.filter(p => !p.skipped && !p.missing);
const capDenom = eligible.filter(p => p.capEligible);
const bondedDeadline = capDenom.filter(p => p.cap === 'bonded-by-deadline');
console.log(`CAP-NC verdict: bonded-by-deadline ${bondedDeadline.length}/${capDenom.length} eligible seeds.`);
const capVerdict = capDenom.length >= 3 && bondedDeadline.length >= 3 && bondedDeadline.length / capDenom.length >= 2 / 3 ? 'PASS (capacity holds)'
  : capDenom.length >= 3 && bondedDeadline.length === 0 ? 'CAPACITY DEFECT (0 bonded of >=3 eligible)'
  : 'INSUFFICIENT-DATA (<3 eligible, or bonded fraction below the pass line)';
console.log(`CAP-NC binding verdict (r146 newcomer-channel bar): ${capVerdict}`);
console.log(`CAP-NC non-denominator: ${JSON.stringify(eligible.filter(p => !p.capEligible).map(p => p.cap))}`);
console.log(`Descriptive bondedEver (probe pair bonded in ANY snapshot or bondDaily): ${eligible.filter(p => p.bondedEver).length}/${eligible.filter(p => p.probeVid).length} probe-opened seeds.`);
console.log(`Descriptive CAP-D14 (r142 stranger probe): ${JSON.stringify(eligible.map(p => p.capD14))}`);
console.log(`OPP totals: unbonded talk-requests ${eligible.reduce((a, p) => a + (p.reqUnbonded || 0), 0)}; FIRST-bearer new bonds on undriven days ${eligible.reduce((a, p) => a + (p.firstBearerNewUndriven || 0), 0)}; NPC-NPC new bonds ${eligible.reduce((a, p) => a + (p.npcNew || 0), 0)}; newcomer arrivals ${eligible.reduce((a, p) => a + (p.arrivals || 0), 0)}; FIRST-bearer newcomer bonds ${eligible.reduce((a, p) => a + (p.firstBearerNewcomer || 0), 0)} vs pre-existing ${eligible.reduce((a, p) => a + (p.firstBearerPreexisting || 0), 0)}; selfReqDayEntries total ${eligible.reduce((a, p) => a + (p.selfReqDayEntries || 0), 0)} (r133 purge regression check, expect 0).`);
