#!/usr/bin/env node
// analyze-journey-succession-r279-20261124.js — SUCCESSION r279 (r268 analyzer, rename-only fork + WIT-SIT v4 label: the driver stages both-phase, multi-fresh sittings with a language filter and a skip ledger; the analyzer's WIT-SIT descriptive now tallies !fired records by reason, reports the unscanned list, and flags nonverbal-despite-filter sittings; MOURN-TEMPLATE double-stage exemption and REL bars unchanged).
// r263 = r262 analyzer, renames only, plus (1) the preregistered
// MOURN-TEMPLATE amendment: the two sittings of one double-staged
// death (same seed + deadId, consecutive days, different speakers)
// are ONE instrument event — a same-shape serving across that pair is
// exempt from the village-window clause, printed explicitly as
// MOURN-TEMPLATE-EXEMPT-DOUBLE-STAGE; (2) a WIT-SIT double-stage
// descriptive count. Reads per-seed stdout JSONs by PREFIX env + seed
// args; the pair's arm-leg analysis runs with PREFIX=r263scr over the
// supply-seed list.
// MOURN scan (r245, binding): the 19 name-parameterized mourning shapes
// counted per speaker/shape/dead from the panel's driven transcripts,
// plus exhausted-line servings in mourning sittings. Corpus-proven on
// the r230 corpora (PREFIX=r230): convicts the old code (Amanda,
// world-continues for Ethel d+3 and Maureen d+53) with the exact r230
// baseline counts (opener-expect 5, cope-last-words 4, next-fire-smaller
// 2). See the prereg for the bar.
// Reads evidence/2026-11-22/journey-succession-r263-<seed>.stdout.json.
// PREFIX env override (r187): re-analyze the r169 panel with the revised
// MANTLE-FINE rules — PREFIX=r169 node scripts/analyze-journey-succession-r279-20261124.js 33998 34011 ... 34018
// MANTLE-FINE (binding, r187; REVISED r229 per the r224 metric review;
// REVISED AGAIN r230 per the r229 metric review — GAP-SUBTRACTION):
// per-death flip-at-return + ROLL-BASED fine latency from rec.mantleFine /
// rec.sleepRolls, minus gapDays (days in [entryDay, firstNewRoll.dayBefore)
// with no roll having dayBefore == d — unrecorded transitions, e.g. an
// expedition-path day advance, give no evidence either way; r229 34314
// d41 artifact). Sample-based latency kept as fineLatencySample, the r229
// roll-based value as fineLatencyRoll — both descriptive only; the binding
// verdict judges the gap-adjusted fineLatency. rollCover widened for the
// 0-day-sleep case; GAME vs SAMPLING class.
// DRY-CENSUS (binding, r230): sayTrace fellBack=true entries whose
// returned text is the exact dry line, counted by pick class; honest
// fallbacks (r81 nonverbal narration) listed separately, not counted.
// CAP-NC (binding, r155 revision per r142 metric review): newcomer-probe pair
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
const EVID = path.join(ROOT, 'evidence', process.env.EVID_DATE || '2026-11-24');
const seeds = process.argv.slice(2);
if (!seeds.length) { console.error('usage: node scripts/analyze-journey-succession-r279-20261124.js <seed...>'); process.exit(2); }
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
  const prefix = process.env.PREFIX || 'r263';
  const f = path.join(EVID, `journey-succession-${prefix}-${seed}.stdout.json`);
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
  // r187 OPP newcomer attribution: relPost roster = handoff-day roster;
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
  // --- MANTLE-FINE (r187, binding; REVISED r231 per the r229 metric review — GAP-SUBTRACTION): the 2-day latency question ---
  // Per death (mantleFine wrap records): flippedImmediate = the game flips
  // the bearer synchronously inside playerDeath. fineLatency is ROLL-BASED
  // (r231): the first sleep roll whose bearerBefore is already the new
  // bearer, or whose bearerAfter is, minus the entry day. A roll that
  // STARTS with the new bearer proves the flip was in place before that
  // sleep; a roll that ENDS with the new bearer proves the flip happened
  // during that sleep — both read 0 when the flip was synchronous at the
  // entry-day death. The OLD sample-based latency is kept as
  // fineLatencySample (descriptive only): a 0-day sleep (108->108) followed
  // by a sample tagged by the sleep's dayAfter reads as lat 2 even when
  // the flip was synchronous (r224 34303 Elijah->Javier artifact).
  // coarseLatency = the driver's existing per-day detection day - entry
  // day (leg death: rec.death.day; chain deaths: detectedDay).
  // Classification implements the prereg bar as written: a latency-1 is
  // EXPLAINED by a recorded day-roll at the death boundary — a sleep roll
  // with dayBefore == entryDay and bearerAfter == newIdAfter (the day
  // rolled after the death; the first observation landed the next
  // morning), OR, when a 0-day sleep intervened (a roll with dayBefore ==
  // dayAfter == entryDay), a roll with dayBefore == entryDay+1 and
  // bearerAfter == newIdAfter (the covering roll lands one day later
  // because the 0-day sleep held the counter — r224 artifact). A death
  // with no roll showing the new bearer is HELD-BRIEFLY iff a later
  // mantleFine entry names that bearer as oldId (same-day cascade: the
  // bearer held the mantle within the entry day and died before any
  // sample point — the wrap is the only record, and it proves the flip).
  const mf = rec.mantleFine || [];
  const samples = rec.mantleSamples || [];
  const rolls = rec.sleepRolls || [];
  const mantleRows = mf.map((m, i) => {
    const firstNew = samples.find(s => s.bearer === m.newIdAfter && s.day >= m.entryDay);
    const fineLatencySample = (firstNew && m.newIdAfter != null) ? (firstNew.day - m.entryDay) : null;
    let fineLatencyRoll = null, firstRollNew = null;
    if (m.newIdAfter != null) {
      firstRollNew = rolls.find(r => r.dayBefore >= m.entryDay && (r.bearerBefore === m.newIdAfter || r.bearerAfter === m.newIdAfter));
      if (firstRollNew) fineLatencyRoll = firstRollNew.dayBefore - m.entryDay;
    }
    // GAP-SUBTRACTION (r231, per the r229 metric review; shadow-proven in
    // r229): days d in [entryDay, firstRollNew.dayBefore) with NO roll
    // having dayBefore == d are unrecorded transitions — no evidence
    // either way. The first observed roll after the death already shows
    // the new bearer, so the flip was in place by then; subtract the gap
    // so a missing roll does not read as latency. gapDays <=
    // fineLatencyRoll by construction, so fineLatency never goes negative.
    let gapDays = 0, fineLatency = fineLatencyRoll;
    if (firstRollNew) {
      for (let d = m.entryDay; d < firstRollNew.dayBefore; d++) {
        if (!rolls.some(r => r.dayBefore === d)) gapDays++;
      }
      fineLatency = fineLatencyRoll - gapDays;
    }
    let heldBriefly = false;
    if (fineLatency == null && m.newIdAfter != null) {
      heldBriefly = mf.some((n, j) => j > i && n.oldId === m.newIdAfter);
      if (heldBriefly) fineLatency = 0; // wrap-proven: bearer held the mantle on the entry day
    }
    let coarseDay = null;
    if (i === 0 && death) coarseDay = death.day; // leg death: driver detection day (r41b: +1 for organic)
    const coarseLatency = (coarseDay != null) ? (coarseDay - m.entryDay) : null;
    const zeroDaySleep = rolls.some(r => r.dayBefore === m.entryDay && r.dayAfter === m.entryDay);
    const rollCover = rolls.some(r => r.dayBefore === m.entryDay && r.dayAfter === m.entryDay + 1 && r.bearerAfter === m.newIdAfter)
      || (zeroDaySleep && rolls.some(r => r.dayBefore === m.entryDay + 1 && r.bearerAfter === m.newIdAfter));
    // VILLAGE-OVER (r187, from the r169 metric review): when the bearer
    // who died was the LAST living villager, playerDeath sets
    // over/villageLost and returns WITHOUT flipping (ledger.js) — there
    // is no one to flip TO. The instrument counted a game-over death
    // as a mantle failure; the bar's intent presumes a successor
    // exists. Over-rows are classified apart and excluded from the
    // binding verdict below.
    // SAME-DAY CASCADE (r187, from the r169 metric review): when >=2
    // deaths share an entryDay, the sampler's sleep/post checkpoints
    // catch only the cascade's endpoints, so a latency-1 first sample
    // is sampler lag, not game latency (r169 seed 34013 d89: six
    // earlier deaths shared the day; the UNEXPLAINED-1 row's flip
    // was synchronous at return). A latency-1 row WITH an earlier
    // same-day sibling is SAMPLING-or-CLEAN; one with neither roll
    // cover nor a same-day sibling stays UNEXPLAINED-1 — the bar
    // keeps its teeth for a lone unexplained latency-1.
    const sameDayCascade = mf.some((n, j) => j < i && n.entryDay === m.entryDay);
    const cls = !m.flippedImmediate ? (m.over ? 'VILLAGE-OVER' : 'GAME') : (fineLatency != null && fineLatency >= 2) ? 'GAME-LATE' : (fineLatency === 1 && !rollCover && !sameDayCascade) ? 'UNEXPLAINED-1' : 'SAMPLING-or-CLEAN';
    return { i, entryDay: m.entryDay, returnDay: m.returnDay, cause: m.cause, flippedImmediate: m.flippedImmediate, over: !!m.over, sameDayCascade, fineLatency, fineLatencyRoll, gapDays, fineLatencySample, coarseLatency, rollCover, zeroDaySleep, heldBriefly, firstNewTag: firstNew ? firstNew.tag : null, cls };
  });
  // coarse latency for chain deaths: match chain entries to mantleFine rows by order (chain entries are recorded in death order after the leg death).
  const chainRows = (rec.chainDeaths || []).map((c, j) => {
    const m = mf[j + 1] || null; // mantleFine[0] is the leg death; chain deaths follow in order
    return { deadFirst: c.deadFirst, newFirst: c.newFirst, detectedDay: c.detectedDay, entryDay: m ? m.entryDay : null, coarseLatency: (m && m.entryDay != null) ? (c.detectedDay - m.entryDay) : null };
  });
  for (const r of mantleRows) console.log(`   MANTLE-FINE #${r.i}: entry d${r.entryDay} return d${r.returnDay} cause=${r.cause} flippedImmediate=${r.flippedImmediate} fineLatency=${r.fineLatency} (roll=${r.fineLatencyRoll} gapDays=${r.gapDays} sample=${r.fineLatencySample}) coarseLatency=${r.coarseLatency} rollCover=${r.rollCover} zeroDaySleep=${r.zeroDaySleep} heldBriefly=${r.heldBriefly} firstNewTag=${r.firstNewTag} class=${r.cls}`);
  for (const c of chainRows) console.log(`   MANTLE-COARSE chain: ${c.deadFirst} -> ${c.newFirst} detected d${c.detectedDay} entry d${c.entryDay} coarseLatency=${c.coarseLatency}`);
  const skips = rolls.filter(r => (r.dayAfter - r.dayBefore) > 1);
  const noAdvance = rolls.filter(r => (r.dayAfter - r.dayBefore) === 0);
  if (skips.length) console.log(`   MANTLE day-skips (sleep rolls >1 day): ${skips.map(r => `d${r.dayBefore}->d${r.dayAfter}`).join(', ')}`);
  else console.log(`   MANTLE day-skips: none (sleep rolls: ${rolls.length}; 0-day no-advance sleeps: ${noAdvance.length} — sleep called without rolling the day, not a skip)`);
  // --- CARRIED ---
  const pr = pickTimeRank(rec);
  const incall = (rec.pdCalls || []).some(c => c.deathBeatN > 0);
  console.log(`   CARRIED pick-time rank: ${pr.rank == null ? 'n/a (' + pr.note + ')' : pr.rank} | funeral INCALL beat: ${incall}`);
  console.log(`   relPost bonds=${(rec.relPost && rec.relPost.bonds || []).length} relD14=${(rec.relD14 && rec.relD14.bonds || []).length} relD30=${(rec.relD30 && rec.relD30.bonds || []).length} relEnd=${(rec.relEnd && rec.relEnd.bonds || []).length} relD14.selfId=${(rec.relD14 && rec.relD14.selfId) || 'n/a'}`);
  // --- DRY-CENSUS (r231, machine version of the r187 manual grep) ---
  // A sayTrace entry is a DRY hit iff sayLine fell back to the exact dry
  // line "...Sorry, lost my train of thought." A fellBack with any OTHER
  // return is an honest fallback (r81 foreign-language nonverbal
  // narration) — listed, not counted. nullReturn (silence) is listed
  // separately: same class, different surface.
  const DRY_LINE = '"...Sorry, lost my train of thought."';
  const dryHits = [];
  const honestFallbacks = [];
  const nullReturns = [];
  for (const e of (rec.sayTrace || [])) {
    if (e.nullReturn) { nullReturns.push(e); continue; }
    if (!e.fellBack) continue;
    if (e.returned === DRY_LINE) dryHits.push(e);
    else honestFallbacks.push(e);
  }
  const dryClass = (e) => {
    const p = String(e.pick || '');
    if (p === 'deflect_q') return 'deflect_q';
    if (p.indexOf('confront') !== -1) return 'confront';
    if (p.indexOf('warn') !== -1) return 'warn_you';
    if (p.indexOf('lately') !== -1) return 'ask:lately';
    if (p === 'dlg:doubt' || p.indexOf('doubt') !== -1) return 'dlg:doubt';
    if (p.indexOf('exh') !== -1) return 'exh-closer';
    if (p === 'more' || p === 'dlg:more') return 'base-more';
    if (p.indexOf('agency') !== -1) return 'AGENCY-DRY';
    if (p.indexOf('teach') !== -1) return 'TEACH-DRY';
    if (p.indexOf('opener') !== -1) return 'OPENER-DRY';
    return 'other:' + p;
  };
  const dryCounts = {};
  for (const e of dryHits) { const c = dryClass(e); dryCounts[c] = (dryCounts[c] || 0) + 1; }
  const dryHitsOut = dryHits.map(e => ({ seed, day: e.day, vid: e.vid, pick: e.pick, key: e.key, cls: dryClass(e), sites: e.sites }));
  console.log(`   DRY-CENSUS: dry hits ${dryHits.length} ${JSON.stringify(dryCounts)} | honest fallbacks ${honestFallbacks.length} | null-return silences ${nullReturns.length}`);
  for (const e of dryHits) console.log(`   DRY-HIT seed=${seed} d${e.day} ${e.vid} pick=${e.pick} key=${JSON.stringify(e.key)} sites=${(e.sites || []).join(' ')}`);
  for (const e of honestFallbacks) console.log(`   DRY-HONEST seed=${seed} d${e.day} ${e.vid} pick=${e.pick} returned=${JSON.stringify(e.returned)}`);
  for (const e of nullReturns) console.log(`   DRY-NULL seed=${seed} d${e.day} ${e.vid} pick=${e.pick} key=${JSON.stringify(e.key)}`);
  // --- MOURN-TEMPLATE (r231, binding): scan the driven transcripts for
  // the 10 name-parameterized mourning shapes. A shape is identified by
  // its constant text with the dead name as a wildcard — the same
  // template about a different dead person is the same shape, which is
  // exactly what the pre-fix code hid (name-baked lines deduped as
  // distinct). The sick-death and successor-grief lines are conditional
  // single-fire lines and are NOT in this scan. Multi-name and nameless
  // openers carry no single {mname} and are not in this scan either.
  const MOURN_SHAPES = [
    // The dead-name capture is [^"]+? (never a quote): a mourning line
    // can arrive with a change-ack prefix in the same NPC turn
    // ("You asked me that before…" "Since Ethel died…"), and a (.+?)
    // capture would bleed across the ack's closing quote and swallow
    // the ack text into the dead name (r230-corpus proof caught this:
    // dead="You want to know about that? Okay." "Ethel").
    ['opener:expect-fire', /Since ([^"]+?) died\.\.\. I keep expecting to see ([^"]+?) at the fire\. Stupid\./],
    ['opener:world-continues', /"([^"]+?) is gone and the world just\.\.\. continues\. That's the part I can't stand\./],
    ['opener:owed-favor', /"([^"]+?) owed me a favor\. I keep thinking about collecting\. Stupid\./],
    ['opener:dreamed', /"I dreamed ([^"]+?) was still here\. Woke up angry at the dream\. Stupid\./],
    ['opener:burnt-piece', /"([^"]+?) always took the burnt piece\. Said someone had to\. I take it now\./],
    ['cope:last-words', /I keep turning over the last thing ([^"]+?) said to me\. I can't tell if I'm remembering it right, and that's somehow the worst part\./],
    ['next:name-right', /Nobody says ([^"]+?)'s name right yet\. We will\. Give it a few days\./],
    ['next:fire-smaller', /The fire feels smaller without ([^"]+?)\. The rest of us will have to be bigger\./],
    ['part:pick-up-share', /I'm picking up ([^"]+?)'s share of the work\. Someone should, and it might as well be me\./],
    ['part:habit-for', / for ([^"]+?), now\. Feels right\. Feels like the least I can do\./],
    // REL-MOURN (r245): the 9 relationship-aware shapes. Group 1 is the
    // dead name in every regex (the cope:bond-habit habit slot is a
    // non-capturing group — the habit text varies per speaker and is
    // not the dead). The scan's dead capture and the multi-name
    // exclusion apply unchanged.
    ['opener:bond-person', /"([^"]+?) was my person at this fire\. I keep turning to the wrong empty spot\./],
    ['opener:bond-knew', /"I knew ([^"]+?)\. Really knew them, not the fire/],
    ['opener:vet-treeline', /"We both stood at the treeline\. ([^"]+?) held it\./],
    ['opener:vet-club', /"([^"]+?) killed the things that come at night\. I did too\. That's a small club/],
    ['opener:wit-there', /"I was there when ([^"]+?) fell\. I keep seeing it when I blink/],
    ['opener:wit-saw', /"I saw ([^"]+?) go down\. I did what I could\. It wasn't enough/],
    ['cope:bond-habit', /"I (?:.+?) the way ([^"]+?) used to, when they were the one keeping me steady\./],
    ['next:bond-knew-things', /"([^"]+?) knew things about me nobody else does\. That's gone now/],
    ['part:bond-watch', /"My part\? I carry what ([^"]+?) carried\. Not their work\. Their watch\./],
  ];
  const EXHAUSTED_LINE = '"I\'ve told you everything I know about that."';
  const mournHits = []; // {seed, speaker, dplus, sittingDay, shape, dead, file, rel}
  const mournExhaust = []; // {seed, speaker, dplus, sittingDay, mourningSitting, file}
  const mournHabits = []; // {seed, speaker, dplus, habit} from habit-for servings (HABIT-COLLISION descriptive)
  // REL-MOURN (r245): join each transcript serving to the driver's
  // per-convo relationship snapshot, keyed by (dplus, speaker first
  // name). convoReads vid is the same firstName the transcript
  // filename carries. Exact key first; else the same speaker's
  // greatest label dplus at or below the file dplus — the driver
  // labels the transcript with the ACTUAL days-since but the convoRead
  // with the CHECKPOINT label when a checkpoint fires a day late (r245
  // panel catch: Emma d+46's bond serving joined to nothing because
  // the convoRead says d+45). A serving with no matching convoRead (or
  // a snapshot whose lately event wasn't mourning) is UNJUDGED, never
  // a violation — the REL bars judge only servings whose relationship
  // the driver recorded.
  const relByKey = {};
  const relBySpeaker = {};
  for (const c of (rec.convoReads || [])) {
    if (c && c.rel) {
      relByKey[c.dplus + '|' + c.vid] = c.rel;
      (relBySpeaker[c.vid] = relBySpeaker[c.vid] || []).push({ dplus: c.dplus, rel: c.rel });
    }
  }
  const relFor = (dplus, speaker) => {
    const exact = relByKey[dplus + '|' + speaker];
    if (exact) return exact;
    const list = (relBySpeaker[speaker] || []).filter(e => e.dplus <= dplus).sort((a, b) => b.dplus - a.dplus);
    return list.length ? list[0].rel : null;
  };
  // REL opportunity counts (r245): qualifying driven mourning convos
  // per kind — the denominator the positive arms drew on. Counted from
  // the driver snapshots, not the servings.
  const relOpp = { bondConvos: 0, vetConvos: 0, witConvos: 0, mourningConvos: 0 };
  for (const c of (rec.convoReads || [])) {
    if (c && c.rel) {
      relOpp.mourningConvos++;
      if (c.rel.bondClose) relOpp.bondConvos++;
      if (c.rel.bothVet) relOpp.vetConvos++;
      if (c.rel.witnessed) relOpp.witConvos++;
    }
  }
  const HABIT_FOR_RE = /"I (.+?) for ([^"]+?), now\. Feels right\. Feels like the least I can do\./;
  try {
    const prefix = process.env.PREFIX || 'r263';
    const deathDays = (mf || []).map(m => m.entryDay).filter(d => d != null);
    const firstDeathDay = (death && death.day != null) ? death.day : (deathDays.length ? Math.min(...deathDays) : null);
    const files = fs.readdirSync(EVID).filter(f => f.startsWith(`journey-succession-${prefix}-transcript-${seed}-`) && f.endsWith('.txt'));
    for (const f of files) {
      const m = f.match(/-dplus(\d+)-(?:STRANGER-|NEWCOMER-|WIT-)?(.+)\.txt$/);
      if (!m) continue;
      const dplus = parseInt(m[1], 10);
      const speaker = m[2];
      const sittingDay = (firstDeathDay != null) ? firstDeathDay + dplus : null;
      const text = fs.readFileSync(path.join(EVID, f), 'utf8');
      const lines = text.split('\n');
      const seenInFile = new Set();
      for (const line of lines) {
        if (line.indexOf('NPC:') !== 0) continue;
        for (const [shape, re] of MOURN_SHAPES) {
          const mm = line.match(re);
          if (mm) {
            const dead = (mm[1] || '').trim();
            // MULTI-NAME EXCLUSION (r231 panel catch): the multi-name
            // opener shares the single-name world-continues tail ("X is
            // gone and Y is gone and the world just…"), so the regex
            // captures the mgone list ("Bill is gone and Shaun") as the
            // dead name. A captured name containing " is gone" is the
            // multi-name construction, not a single-name serving — the
            // 10-shape scan covers single-name templates only.
            if (dead.indexOf(' is gone') !== -1) continue;
            // RECAP-PREFIX NORMALIZATION (r262 panel catch): a mourning
            // line can arrive with a recap/change-ack prefix inside the
            // same double-quoted turn ("We never did finish talking
            // about what's been happening — that was 9 days back. Still
            // on your mind? 'Dumisani knew things about me...") — the
            // ([^"]+?) capture then bleeds across the prefix because the
            // name is preceded by a single quote, not a double quote
            // (r262: Ramiro d+54, flagged as a different dead from his
            // d+45 serving about the same Dumisani). Dead names in this
            // scan are first names (single tokens), so take the last
            // whitespace token, stripped of quotes. Applied AFTER the
            // multi-name exclusion above, whose capture legitimately
            // contains spaces.
            const deadName = dead.split(/\s+/).pop().replace(/^['"]+|['"]+$/g, '');
            const k = shape + '|' + deadName;
            if (!seenInFile.has(k)) {
              seenInFile.add(k);
              mournHits.push({ seed, speaker, dplus, sittingDay, shape, dead: deadName, file: f, rel: relFor(dplus, speaker) });
              if (shape === 'part:habit-for') {
                const hm = line.match(HABIT_FOR_RE);
                if (hm) mournHabits.push({ seed, speaker, dplus, habit: (hm[1] || '').trim() });
              }
            }
          }
        }
        if (line.indexOf(EXHAUSTED_LINE) !== -1) {
          // A mourning sitting is one within 10 days after any recorded
          // death on the seed (the bearer-mantle tail). dplus is days
          // since the FIRST death, so sittingDay is exact.
          const mourningSitting = (sittingDay != null) && deathDays.some(d => sittingDay - d >= 0 && sittingDay - d <= 10);
          mournExhaust.push({ seed, speaker, dplus, sittingDay, mourningSitting, file: f });
        }
      }
    }
  } catch (e) { console.log(`   MOURN-SCAN error: ${e.message}`); }
  const mournShapeCounts = {};
  for (const h of mournHits) mournShapeCounts[h.shape] = (mournShapeCounts[h.shape] || 0) + 1;
  console.log(`   MOURN-TEMPLATE: ${mournHits.length} name-parameterized mourning servings ${JSON.stringify(mournShapeCounts)}`);
  for (const h of mournHits) console.log(`   MOURN-HIT seed=${seed} d+${h.dplus} ${h.speaker} shape=${h.shape} dead=${h.dead}`);
  const mournExhaustMourning = mournExhaust.filter(e => e.mourningSitting);
  console.log(`   MOURN-EXHAUST: exhausted-line servings ${mournExhaust.length} (in mourning sittings: ${mournExhaustMourning.length})`);
  for (const e of mournExhaust) console.log(`   MOURN-EXH seed=${seed} d+${e.dplus} ${e.speaker} mourningSitting=${e.mourningSitting} file=${e.file}`);
  panel.push({ seed, cap: cap.status, capEligible, bondedEver, probeVid: np && np.vid, deadlineDplus, arrivals: arrivalsN, firstArrivalDplus, firstBearerNewcomer: firstNewNewcomer, firstBearerPreexisting: firstNewPreexisting, capD14: capD14.status, reqTotal: reqList.length, reqUnbonded: unbondedReq.length, selfReqDayEntries: selfReqDays, npcNew: npcNewTotal, firstBearerNew: firstNewTotal, firstBearerNewUndriven: firstNewUndriven, laterBearerNew: laterNewTotal, pickRank: pr.rank, incall, mantleRows, chainRows, skips: skips.length, dryHits: dryHitsOut, honestFallbacks: honestFallbacks.length, nullReturns: nullReturns.length, mournHits, mournExhaust, mournExhaustMourning: mournExhaustMourning.length, mournHabits, relOpp, corpseCensus: rec.corpseCensus || [], witSits: rec.witSits || [], witUnscanned: rec.witUnscanned || [] });
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
console.log(`CAP-NC binding verdict (r187 newcomer-channel bar): ${capVerdict}`);
console.log(`CAP-NC non-denominator: ${JSON.stringify(eligible.filter(p => !p.capEligible).map(p => p.cap))}`);
console.log(`Descriptive bondedEver (probe pair bonded in ANY snapshot or bondDaily): ${eligible.filter(p => p.bondedEver).length}/${eligible.filter(p => p.probeVid).length} probe-opened seeds.`);
console.log(`Descriptive CAP-D14 (r142 stranger probe): ${JSON.stringify(eligible.map(p => p.capD14))}`);
console.log(`OPP totals: unbonded talk-requests ${eligible.reduce((a, p) => a + (p.reqUnbonded || 0), 0)}; FIRST-bearer new bonds on undriven days ${eligible.reduce((a, p) => a + (p.firstBearerNewUndriven || 0), 0)}; NPC-NPC new bonds ${eligible.reduce((a, p) => a + (p.npcNew || 0), 0)}; newcomer arrivals ${eligible.reduce((a, p) => a + (p.arrivals || 0), 0)}; FIRST-bearer newcomer bonds ${eligible.reduce((a, p) => a + (p.firstBearerNewcomer || 0), 0)} vs pre-existing ${eligible.reduce((a, p) => a + (p.firstBearerPreexisting || 0), 0)}; selfReqDayEntries total ${eligible.reduce((a, p) => a + (p.selfReqDayEntries || 0), 0)} (r133 purge regression check, expect 0).`);
// --- MANTLE-FINE panel verdict (r187 binding bar, REVISED r231: gap-subtraction fineLatency) ---
// r187 revision (r169 metric review): VILLAGE-OVER rows are excluded
// from the binding verdict — a game-over death is not a mantle
// failure — and a latency-1 with an earlier same-day sibling death
// is sampler lag, not game latency (classified SAMPLING-or-CLEAN in
// the row builder above).
const allRows = eligible.flatMap(p => p.mantleRows || []);
const overRows = allRows.filter(r => r.over);
const notFlipped = allRows.filter(r => !r.flippedImmediate && !r.over);
const lateFine = allRows.filter(r => r.fineLatency != null && r.fineLatency >= 2);
const unexplained1 = allRows.filter(r => r.cls === 'UNEXPLAINED-1');
const coarseGaps = allRows.filter(r => r.coarseLatency != null && r.fineLatency != null && r.coarseLatency > r.fineLatency);
console.log(`MANTLE-FINE verdict: deaths observed ${allRows.length} (village-over excluded: ${overRows.length}; flippedImmediate=false: ${notFlipped.length}; fineLatency>=2: ${lateFine.length}; fineLatency==1 unexplained: ${unexplained1.length}; held-briefly same-day cascade bearers: ${allRows.filter(r => r.heldBriefly).length}; coarse>fine sampling gaps: ${coarseGaps.length}; day-skips total: ${eligible.reduce((a, p) => a + (p.skips || 0), 0)}).`);
console.log(`MANTLE-FINE binding verdict: ${notFlipped.length === 0 && lateFine.length === 0 && unexplained1.length === 0 ? 'PASS (mantle flips synchronously at every observed death with a living successor; any coarse latency is sampling)' : 'FAIL — ' + JSON.stringify({ notFlipped: notFlipped.map(r => r.entryDay), lateFine: lateFine.map(r => ({ d: r.entryDay, lat: r.fineLatency })), unexplained1: unexplained1.map(r => r.entryDay) })}`);
console.log(`MANTLE-COARSE (reported): ${JSON.stringify(allRows.map(r => ({ d: r.entryDay, coarse: r.coarseLatency, fine: r.fineLatency, fineRoll: r.fineLatencyRoll, gapDays: r.gapDays, fineSample: r.fineLatencySample, cls: r.cls })))}`);
// --- DRY-CENSUS panel verdict (r231 binding bar, extended per r187 metric review) ---
// Binding classes: the r170 lately bar, the r186 warn fix, the r187
// confront fix, the r192 F1 deflect_q + F3 dlg:doubt fixes, the carried
// same-class sites (exh closers, base more), and the carried
// AGENCY/TEACH/OPENER bars. An 'other:' class is a NEW surface — the
// verdict fails the same way, and the run note files it as the next
// fix item. Honest fallbacks (r81 nonverbal narration) and null-return
// silences are reported, not counted: silence is a separate surface
// from the dry line and needs its own adjudication when it appears.
const allDry = eligible.flatMap(p => p.dryHits || []);
const bindingClasses = ['ask:lately', 'warn_you', 'confront', 'deflect_q', 'dlg:doubt', 'exh-closer', 'base-more', 'AGENCY-DRY', 'TEACH-DRY', 'OPENER-DRY'];
const bindingHits = allDry.filter(e => bindingClasses.indexOf(e.cls) !== -1);
const otherHits = allDry.filter(e => bindingClasses.indexOf(e.cls) === -1);
console.log(`DRY-CENSUS verdict: dry hits ${allDry.length} (binding-class ${bindingHits.length}; other-class ${otherHits.length}; honest fallbacks ${eligible.reduce((a, p) => a + (p.honestFallbacks || 0), 0)}; null-return silences ${eligible.reduce((a, p) => a + (p.nullReturns || 0), 0)}).`);
console.log(`DRY-CENSUS binding verdict: ${allDry.length === 0 ? 'PASS (zero dry lines on the panel)' : 'FAIL — ' + JSON.stringify(allDry.map(e => ({ seed: e.seed, d: e.day, vid: e.vid, pick: e.pick, cls: e.cls })))}`);
console.log(`DRY-CENSUS r192 wild check (deflect_q + dlg:doubt; refusal has no sayTrace pick — covered by its proof test): deflect_q ${allDry.filter(e => e.cls === 'deflect_q').length}, dlg:doubt ${allDry.filter(e => e.cls === 'dlg:doubt').length}, other-class ${otherHits.length}.`);
// --- MOURN-TEMPLATE panel verdict (r231 binding bar) ---
// (a) same speaker, same shape, different dead = the fix did not engage
// for that speaker. (b) different speakers, same shape, same dead,
// within 5 days (dplus difference <= 5, the LINE_FRESH_DAYS window) =
// the village-fresh steering did not engage. The dplus difference is
// the sitting-day difference (both sittings count days since the first
// death on the seed), so it is exact, not approximate.
const allMourn = eligible.flatMap(p => p.mournHits || []);
const mournBySpeakerShape = {};
for (const h of allMourn) {
  const k = h.seed + '|' + h.speaker + '|' + h.shape;
  (mournBySpeakerShape[k] = mournBySpeakerShape[k] || new Set()).add(h.dead);
}
const mournRepeatSameSpeaker = Object.entries(mournBySpeakerShape)
  .filter(([, deads]) => deads.size > 1)
  .map(([k, deads]) => ({ key: k, deads: [...deads] }));
const mournByShapeDead = {};
for (const h of allMourn) {
  const k = h.seed + '|' + h.shape + '|' + h.dead;
  (mournByShapeDead[k] = mournByShapeDead[k] || []).push(h);
}
const mournRepeatVillageWindow = [];
const mournTemplateExempt = []; // r263: double-stage pairs, exempt per prereg (printed, never silently dropped)
// r263: double-stage pairs — the two sittings of one double-staged
// death (same seed + deadId, both fired, different speakers). A
// same-shape serving across that pair is ONE instrument event, not a
// template repeat (prereg amendment): two witnesses grieving the same
// dead person with the same words on consecutive days is shared grief,
// not a template defect. The clause was written for independent wild
// sittings. The exemption touches ONLY that pair — a collision between
// a double-stage sitting and any OTHER sitting still fails.
const doubleStagePairs = new Set();
{
  const witForTemplate = eligible.flatMap(p => (p.witSits || []).map(w => Object.assign({ seed: p.seed }, w)));
  const byDead = {};
  for (const w of witForTemplate) {
    if (!w.fired || !w.deadId) continue;
    (byDead[w.seed + '|' + w.deadId] = byDead[w.seed + '|' + w.deadId] || []).push(w);
  }
  for (const [, ws] of Object.entries(byDead)) {
    if (ws.length < 2) continue;
    if (new Set(ws.map(w => w.speakerFirst)).size < 2) continue;
    for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) {
      if (ws[i].speakerFirst === ws[j].speakerFirst) continue;
      doubleStagePairs.add(ws[i].seed + '|' + ws[i].speakerFirst + '|' + ws[i].dplus + '<>' + ws[j].seed + '|' + ws[j].speakerFirst + '|' + ws[j].dplus);
      doubleStagePairs.add(ws[j].seed + '|' + ws[j].speakerFirst + '|' + ws[j].dplus + '<>' + ws[i].seed + '|' + ws[i].speakerFirst + '|' + ws[i].dplus);
    }
  }
}
for (const [k, hits] of Object.entries(mournByShapeDead)) {
  const speakers = new Set(hits.map(h => h.speaker));
  if (speakers.size < 2) continue;
  for (let i = 0; i < hits.length; i++) for (let j = i + 1; j < hits.length; j++) {
    if (hits[i].speaker !== hits[j].speaker && Math.abs(hits[i].dplus - hits[j].dplus) <= 5) {
      const pairKey = hits[i].seed + '|' + hits[i].speaker + '|' + hits[i].dplus + '<>' + hits[j].seed + '|' + hits[j].speaker + '|' + hits[j].dplus;
      if (doubleStagePairs.has(pairKey)) {
        mournTemplateExempt.push({ key: k, a: `${hits[i].speaker} d+${hits[i].dplus}`, b: `${hits[j].speaker} d+${hits[j].dplus}` });
      } else {
        mournRepeatVillageWindow.push({ key: k, a: `${hits[i].speaker} d+${hits[i].dplus}`, b: `${hits[j].speaker} d+${hits[j].dplus}` });
      }
    }
  }
}
const mournShapeTotals = {};
for (const h of allMourn) mournShapeTotals[h.shape] = (mournShapeTotals[h.shape] || 0) + 1;
console.log(`MOURN-TEMPLATE verdict: servings ${allMourn.length} ${JSON.stringify(mournShapeTotals)}; same-speaker repeats ${mournRepeatSameSpeaker.length}; village-window repeats ${mournRepeatVillageWindow.length}; double-stage exemptions ${mournTemplateExempt.length}.`);
for (const e of mournTemplateExempt) console.log(`   MOURN-TEMPLATE-EXEMPT-DOUBLE-STAGE ${e.key} ${e.a} vs ${e.b}`);
console.log(`MOURN-TEMPLATE binding verdict: ${mournRepeatSameSpeaker.length === 0 && mournRepeatVillageWindow.length === 0 ? 'PASS (no mourning template re-served for a different dead, and none repeated across speakers about the same dead within 5 days)' : 'FAIL — ' + JSON.stringify({ sameSpeaker: mournRepeatSameSpeaker, villageWindow: mournRepeatVillageWindow })}`);
const allMournExhaust = eligible.reduce((a, p) => a + (p.mournExhaustMourning || 0), 0);
console.log(`MOURN-EXHAUST verdict: exhausted-line servings in mourning sittings ${allMournExhaust} (total exhausted servings ${eligible.flatMap(p => p.mournExhaust || []).length}).`);
console.log(`MOURN-EXHAUST binding verdict: ${allMournExhaust === 0 ? 'PASS (no mourning sitting went silent on the exhausted line)' : 'FAIL — the fix starved a mourning opener'}`);
// --- REL-MOURN panel verdicts (r245 binding bars) ---
// Each relationship kind is judged on its servings that carry a driver
// snapshot (rel non-null): the positive arm needs >=1 serving where
// the relationship held; the negative arm needs 0 servings where it
// did not. A kind with 0 judged servings is INSUFFICIENT-DATA on the
// positive arm (the wild rate was zero — finding, not failure); the
// negative arm still holds. Servings without a snapshot are unjudged
// and reported, never counted as violations.
const REL_SHAPES = {
  bond: ['opener:bond-person', 'opener:bond-knew', 'cope:bond-habit', 'next:bond-knew-things', 'part:bond-watch'],
  veteran: ['opener:vet-treeline', 'opener:vet-club'],
  witness: ['opener:wit-there', 'opener:wit-saw'],
};
const REL_GATE = { bond: h => !!(h.rel && h.rel.bondClose), veteran: h => !!(h.rel && h.rel.bothVet), witness: h => !!(h.rel && h.rel.witnessed) };
// Opportunity totals per kind (qualifying driven mourning convos —
// the prereg's unit). The positive arm binds only when the panel
// carried qualifying convos; with none, the arm is INSUFFICIENT-DATA
// (finding, not pass). With qualifying convos and 0 servings, the arm
// is a FAIL — the bar as pre-registered, not re-scored. (r245 REVISION
// per the r232 metric review, adopted: the veteran bar's positive arm
// counts OPENER DRAWS in both-veteran convos, not convos — only an
// opener serving can draw an opener variant, and r232's 14 vet convos
// yielded 6 opener draws. PASS needs >=10 draws; fewer is
// INSUFFICIENT-DATA.)
const OPP_TOTALS = {
  bond: eligible.reduce((a, p) => a + ((p.relOpp || {}).bondConvos || 0), 0),
  veteran: eligible.reduce((a, p) => a + ((p.relOpp || {}).vetConvos || 0), 0),
  witness: eligible.reduce((a, p) => a + ((p.relOpp || {}).witConvos || 0), 0),
};
// r245: opener draws in both-veteran convos — opener-shape servings
// whose convo snapshot shows bothVet. One serving per (file, shape,
// dead) by the scan's dedupe, so this counts true draw opportunities.
const vetOpenerDraws = allMourn.filter(h => h.rel && h.rel.bothVet && h.shape.indexOf('opener:') === 0).length;
// r262: single-fresh witness draws — staged sittings that fired with
// exactly one fresh person corpse AND the lately event naming the
// witnessed dead (rel.witnessed). Only these sittings have the witness
// variant in the pool (multi-name sittings serve the multi-name branch,
// which carries no relationship variants). The REL-WIT positive arm
// binds on this count; the floor is 3 (prereg Q1).
const witDraws = eligible.flatMap(p => p.witSits || []).filter(w => w.fired && w.freshPersonN === 1 && w.latelyWitnessed).length;
for (const kind of ['bond', 'veteran', 'witness']) {
  const hits = allMourn.filter(h => REL_SHAPES[kind].indexOf(h.shape) !== -1);
  const judged = hits.filter(h => h.rel);
  const held = judged.filter(REL_GATE[kind]);
  const unheld = judged.filter(h => !REL_GATE[kind](h));
  const unjudged = hits.filter(h => !h.rel);
  let verdict;
  if (unheld.length > 0) verdict = 'FAIL — ' + JSON.stringify(unheld.map(h => ({ seed: h.seed, d: h.dplus, speaker: h.speaker, shape: h.shape, dead: h.dead, rel: h.rel })));
  else if (kind === 'veteran' && vetOpenerDraws < 10) verdict = `INSUFFICIENT-DATA (${vetOpenerDraws} opener draws in both-veteran convos, below the 10-draw floor; positive arm unmeasurable)`;
  else if (held.length >= 1) verdict = 'PASS (relationship variant fired where the relationship held, never where it did not)';
  else if (kind === 'witness' && witDraws < 3) verdict = `INSUFFICIENT-DATA (${witDraws} single-fresh witness sittings with the lately event naming the witnessed dead, below the 3-draw floor; positive arm unmeasurable)`;
  else if (OPP_TOTALS[kind] === 0) verdict = `INSUFFICIENT-DATA (0 ${kind} convos on the panel; positive arm unmeasurable)`;
  else verdict = `FAIL — positive arm not met (0 ${kind} servings on ${OPP_TOTALS[kind]} qualifying convos; see metric review)`;
  console.log(`REL-${kind.toUpperCase()} verdict: servings ${hits.length} (judged ${judged.length}: held ${held.length}, unheld ${unheld.length}; unjudged ${unjudged.length}${kind === 'veteran' ? `; opener draws in both-veteran convos ${vetOpenerDraws}` : ''}${kind === 'witness' ? `; single-fresh witness draws ${witDraws}` : ''}).`);
  console.log(`REL-${kind.toUpperCase()} binding verdict: ${verdict}`);
  for (const h of held) console.log(`   REL-${kind.toUpperCase()}-HELD seed=${h.seed} d+${h.dplus} ${h.speaker} shape=${h.shape} dead=${h.dead} bondV=${h.rel.bondV} depth=${h.rel.bondDepth} bothVet=${h.rel.bothVet} witnessed=${h.rel.witnessed}`);
}
// REL opportunity descriptives: how many driven mourning servings
// carried each relationship at all (the denominator the positive arms
// drew on). Counts servings, not convos: one convo can serve several
// mourning shapes across its turns.
const relConvos = eligible.reduce((a, p) => a + (p.mournHits || []).filter(h => h.rel).length, 0);
console.log(`REL-OPPORTUNITY descriptive: driven servings with a mourning snapshot ${relConvos}; of those, bond-close ${allMourn.filter(h => h.rel && h.rel.bondClose).length}, both-veteran ${allMourn.filter(h => h.rel && h.rel.bothVet).length}, witnessed ${allMourn.filter(h => h.rel && h.rel.witnessed).length}. Qualifying convos: bond-close ${OPP_TOTALS.bond}, both-veteran ${OPP_TOTALS.veteran}, witnessed ${OPP_TOTALS.witness}.`);
// --- MULTI-NAME SITTING (r262 descriptive, prereg Q12) ---
// Driven mourning sittings that landed in a multi-name window
// (freshPersonN>=2 at the sitting, from the driver's rel snapshot).
// Counted as distinct (seed, speaker, dplus) among mourning servings
// with a snapshot — a sitting that served no mourning shape at all
// does not appear here, so this is a lower bound on multi-name
// sittings. Witness servings among them are the r254 fix's wild
// surface: the variant is in the multi-name pool only when the speaker
// witnessed the latest fresh dead.
const multiSittings = new Set(allMourn.filter(h => h.rel && (h.rel.freshPersonN || 0) >= 2).map(h => h.seed + '|' + h.speaker + '|' + h.dplus));
const multiWitServings = allMourn.filter(h => h.rel && (h.rel.freshPersonN || 0) >= 2 && REL_SHAPES.witness.indexOf(h.shape) !== -1);
const multiWitSittings = new Set(multiWitServings.map(h => h.seed + '|' + h.speaker + '|' + h.dplus));
console.log(`MULTI-NAME SITTING descriptive: driven mourning sittings in multi-name windows (freshPersonN>=2) ${multiSittings.size}; witness-variant servings among them ${multiWitServings.length} on ${multiWitSittings.size} sitting(s).`);
for (const h of multiWitServings) console.log(`   MULTI-NAME-WITNESS seed=${h.seed} d+${h.dplus} ${h.speaker} shape=${h.shape} dead=${h.dead} witnessed=${h.rel.witnessed}`);
// --- WITNESS-CENSUS (r245 diagnostic, prereg Q13) ---
// Per-seed corpse census from the driver's rec.corpseCensus: person
// corpses (kind 'person'/'villager') total, how many carry populated
// witnesses, and their causes. A witnessed corpse is the supply the
// witness mourning variant needs; the bearer corpse (playerDeath,
// ledger.js:744) carries none by construction. Monster corpses are
// reported separately — their witnesses are killers, not mourners.
const allCorpses = eligible.flatMap(p => (p.corpseCensus || []).map(c => Object.assign({ seed: p.seed }, c)));
const personCorpses = allCorpses.filter(c => c.kind === 'person' || c.kind === 'villager');
const witnessedPerson = personCorpses.filter(c => (c.witnessN || 0) > 0);
const monsterCorpses = allCorpses.filter(c => c.kind === 'monster');
const witnessedMonster = monsterCorpses.filter(c => (c.witnessN || 0) > 0);
const witCauseCounts = {};
for (const c of witnessedPerson) witCauseCounts[c.cause || '?'] = (witCauseCounts[c.cause || '?'] || 0) + 1;
console.log(`WITNESS-CENSUS: corpses ${allCorpses.length} (person ${personCorpses.length}, monster ${monsterCorpses.length}); person corpses with witnesses ${witnessedPerson.length} ${JSON.stringify(witCauseCounts)}; monster corpses with witnesses ${witnessedMonster.length}.`);
for (const c of witnessedPerson) console.log(`   WITNESSED-CORPSE seed=${c.seed} ${c.name} cause=${c.cause} witnesses=${(c.witnessNames || []).join(',')}`);
for (const p of eligible) {
  const pc = (p.corpseCensus || []).filter(c => c.kind === 'person' || c.kind === 'villager');
  const wpc = pc.filter(c => (c.witnessN || 0) > 0);
  console.log(`   WITNESS-CENSUS seed=${p.seed}: person corpses ${pc.length}, witnessed ${wpc.length}${pc.length ? ` (causes: ${pc.map(c => c.cause || '?').join(', ')})` : ''}`);
}
console.log(`WITNESS-CENSUS verdict: ${witnessedPerson.length === 0 ? 'SUPPLY-ZERO (no person corpse on the panel carried witnesses — the REL-WIT positive arm is unmeasurable for lack of supply, see prereg audit)' : `SUPPLY-PRESENT (${witnessedPerson.length} witnessed person corpse(s); REL-WIT judges servings against them)`}`);
// --- WIT-SIT (r262 staged witness sittings, prereg Q1) ---
// Per staged sitting: the dead, the speaker, whether the sitting was
// single-fresh (the witness variant is in the pool only then), whether
// the lately event named the staged dead, and whether a witness-variant
// serving fired in that sitting's transcript. The binding verdict is
// REL-WIT above; this section is the staging record.
const allWitSits = eligible.flatMap(p => (p.witSits || []).map(w => Object.assign({ seed: p.seed }, w)));
const witServedByKey = {};
for (const h of allMourn) {
  if ((h.file || '').indexOf('-WIT-') === -1) continue;
  if (REL_SHAPES.witness.indexOf(h.shape) === -1) continue;
  witServedByKey[h.seed + '|' + h.speaker + '|' + h.dplus] = h.shape;
}
for (const w of allWitSits) {
  const served = w.fired ? (witServedByKey[w.seed + '|' + w.speakerFirst + '|' + w.dplus] || null) : null;
  const namedRight = w.fired ? (w.latelyDead === w.deadFirst) : null;
  console.log(`   WIT-SIT seed=${w.seed} d+${w.dplus} dead=${w.deadFirst} cause=${w.cause || '?'} witnesses=${(w.witnesses || []).join(',')} freshPersonN=${w.freshPersonN} fired=${w.fired}${w.fired ? ` speaker=${w.speakerFirst} latelyDead=${w.latelyDead || 'none'} latelyWitnessed=${w.latelyWitnessed} namedStagedDead=${namedRight} witnessServing=${served || 'none'}` : ` reason=${w.reason || '?'}`}`);
}
const witFired = allWitSits.filter(w => w.fired);
const witSingle = witFired.filter(w => w.freshPersonN === 1);
const witMulti = witFired.filter(w => (w.freshPersonN || 0) >= 2);
const witNamedRight = witFired.filter(w => w.latelyDead === w.deadFirst);
const witServedN = witFired.filter(w => witServedByKey[w.seed + '|' + w.speakerFirst + '|' + w.dplus]).length;
const witByDead = {};
for (const w of witFired) (witByDead[w.seed + '|' + (w.deadId || w.deadFirst)] = witByDead[w.seed + '|' + (w.deadId || w.deadFirst)] || []).push(w);
const witDouble = Object.entries(witByDead).filter(([, ws]) => ws.length >= 2);
for (const [k, ws] of witDouble) console.log(`   WIT-SIT-DOUBLE-STAGE ${k} sittings=${ws.length} speakers=${ws.map(w => w.speakerFirst + '(seq' + (w.sitSeq || '?') + ')').join(',')}`);
const witNotFired = allWitSits.filter(w => !w.fired);
const witSkipReasons = {};
for (const w of witNotFired) witSkipReasons[w.reason || '?'] = (witSkipReasons[w.reason || '?'] || 0) + 1;
// r279 WIT-SIT v4: nonverbal-despite-filter — a fired sitting whose
// transcript has zero spoken NPC lines (or whose driver record says
// commLevel 'none') means the language filter failed. The r268
// diagnosis (a nonverbal sitting spending the panel's only draw)
// must never recur silently.
const witNonverbal = witFired.filter(w => {
  if (w.commLevel === 'none') return true;
  try {
    const txt = fs.readFileSync(path.join(EVID, w.transcript || ''), 'utf8');
    return !txt.split('\n').some(ln => /^NPC:/.test(ln));
  } catch (e) { return false; }
});
for (const w of witNonverbal) console.log(`   WIT-SIT-NONVERBAL-DESPITE-FILTER seed=${w.seed} d+${w.dplus} dead=${w.deadFirst} speaker=${w.speakerFirst} commLevel=${w.commLevel || '?'}`);
console.log(`WIT-SIT descriptive: staged ${allWitSits.length} (fired ${witFired.length}: single-fresh ${witSingle.length}, multi-fresh ${witMulti.length}; not-fired ${witNotFired.length} by reason ${JSON.stringify(witSkipReasons)}; nonverbal-despite-filter ${witNonverbal.length}); lately named the staged dead on ${witNamedRight.length}/${witFired.length} fired sittings; witness-variant servings on ${witServedN} sittings; double-staged deaths ${witDouble.length}.`);
// r279 WIT-SIT v4 SKIP LEDGER (unscanned): witnessed non-lineage person
// corpses with NO witSit record at all. A death whose dayDied equals
// the seed's final day is explained (the run may have ended before
// that day's scan ran); any other unexplained entry is a staging
// miss. Lower bound — corpse list capped at 40.
const allUnscanned = eligible.flatMap(p => (p.witUnscanned || []).map(u => Object.assign({ seed: p.seed }, u)));
const unscannedExplained = allUnscanned.filter(u => u.dayDied != null && u.finalDay != null && u.dayDied >= u.finalDay);
const unscannedUnexplained = allUnscanned.filter(u => !(u.dayDied != null && u.finalDay != null && u.dayDied >= u.finalDay));
for (const u of allUnscanned) console.log(`   WIT-UNSCANNED seed=${u.seed} dead=${u.deadFirst} cause=${u.cause || '?'} dayDied=${u.dayDied} finalDay=${u.finalDay} witnesses=${(u.witnessNames || []).join(',')}${unscannedUnexplained.indexOf(u) !== -1 ? ' UNEXPLAINED' : ''}`);
console.log(`WIT-UNSCANNED descriptive: ${allUnscanned.length} witnessed non-lineage person corpses with no witSit record (lower bound — corpse list capped at 40); explained (died on final day) ${unscannedExplained.length}, UNEXPLAINED ${unscannedUnexplained.length}.`);
console.log(`WIT-SIT verdict: ${witFired.length === 0 ? 'NO-STAGING (no sitting fired — witnessed deaths were detected but no living non-bearer witness was available to sit)' : (witServedN >= 1 ? 'STAGED-AND-SERVED (a staged sitting served the witness variant)' : (witDraws >= 3 ? 'STAGED-UNREACHED (draws happened, variant never served — see REL-WIT)' : 'STAGED-INSUFFICIENT (too few single-fresh draws to judge — see REL-WIT)'))}`);
// --- HABIT-COLLISION descriptive (r231 watch item, resolved by
// inspection: habits dedupe per expedition, so a same-seed collision
// would be a generation bug, not a line bug). Two speakers in one seed
// serving habit-for with the same habit text = collision.
const allHabits = eligible.flatMap(p => p.mournHabits || []);
const habitBySeedSpeaker = {};
for (const h of allHabits) {
  const k = h.seed + '|' + h.habit;
  (habitBySeedSpeaker[k] = habitBySeedSpeaker[k] || new Set()).add(h.speaker);
}
const habitCollisions = Object.entries(habitBySeedSpeaker).filter(([, sp]) => sp.size > 1).map(([k, sp]) => ({ key: k, speakers: [...sp] }));
console.log(`HABIT-COLLISION descriptive: habit-for servings ${allHabits.length} (${JSON.stringify(allHabits.map(h => `${h.seed}:${h.speaker}=${h.habit}`))}); same-seed collisions ${habitCollisions.length}.`);
console.log(`HABIT-COLLISION verdict: ${habitCollisions.length === 0 ? 'PASS (no two speakers in one village share a habit text)' : 'FAIL — ' + JSON.stringify(habitCollisions)}`);
