#!/usr/bin/env node
// analyze-journey-succession-r133-20261104.js — SUCCESSION r133 OPPORTUNITY vs CAPACITY.
// Reads evidence/2026-11-04/journey-succession-r133-<seed>.stdout.json.
// CAP: stranger-probe pair bonded by relEnd. OPP: talk requests to the
// bearer (self-requests excluded, reported separately) + daily bond diffs
// (bearer-involved vs NPC-NPC-only) over d+0..d+30. CARRIED (reported, not
// scored): pick-time rank, funeral INCALL. Analyzer only; reads JSON.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-11-04');
const seeds = process.argv.slice(2);
if (!seeds.length) { console.error('usage: node scripts/analyze-journey-succession-r133-20261104.js <seed...>'); process.exit(2); }
const pairKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
function bondAt(snap, a, b) {
  if (!snap) return null;
  const k = pairKey(a, b);
  for (const x of (snap.bonds || [])) if (x.key === k) return x;
  return null;
}
function pickTimeRank(rec) {
  // pickCtxs entries carry the npcIds() calls inside the death (r119 PICKCTX2).
  for (const pc of (rec.pickCtxs || [])) {
    const calls = pc.npcCalls || pc.calls || [];
    for (const c of calls) {
      const list = c.sorted || c.trustSorted || c.list || null;
      if (!list) continue;
      const ids = list.map(e => (typeof e === 'string' ? e : (e.id || e.vid)));
      const i = ids.indexOf(pc.newId);
      if (i >= 0) return { rank: i + 1, nCalls: calls.length, note: 'npcCalls' };
    }
    if (pc.pickTimeRank != null) return { rank: pc.pickTimeRank, nCalls: calls.length, note: 'pickTimeRank field' };
  }
  return { rank: null, note: 'no npcCalls in pickCtxs; keys=' + Object.keys((rec.pickCtxs || [])[0] || {}).join(',') };
}
const panel = [];
for (const seed of seeds) {
  const f = path.join(EVID, `journey-succession-r133-${seed}.stdout.json`);
  if (!fs.existsSync(f)) { console.log(`\n== seed ${seed}: MISSING RECORD ==`); panel.push({ seed, missing: true }); continue; }
  const rec = JSON.parse(fs.readFileSync(f, 'utf8'));
  const death = rec.death || null;
  const skipped = !death || !death.passed;
  console.log(`\n== seed ${seed}: ${skipped ? 'SKIPPED (no handoff)' : `handoff d${death.day} ${death.oldFirst} -> ${death.newFirst} (${death.scripted ? 'scripted' : 'organic'})`}`);
  if (skipped) { console.log('   notes:', (rec.notes || []).slice(-2).join(' | ')); panel.push({ seed, skipped: true }); continue; }
  // --- CAP ---
  const probe = rec.strangerProbe || null;
  const bearerId = probe && probe.bearerId;
  const sameBearerEnd = rec.relEndOrigId && rec.relEndFinalId && rec.relEndOrigId === rec.relEndFinalId && rec.relEndFinalId === bearerId;
  let cap = null;
  if (!probe) cap = { status: 'no-probe-record' };
  else if (probe.none) cap = { status: 'no-stranger-pool' };
  else if (probe.refused) cap = { status: 'probe-refused', probe };
  else if (!sameBearerEnd) cap = { status: 'second-handoff-before-relEnd', probe };
  else {
    const d14 = bondAt(rec.relD14, bearerId, probe.vidId);
    const d30 = bondAt(rec.relD30, bearerId, probe.vidId);
    const end = bondAt(rec.relEnd, bearerId, probe.vidId);
    const first = d14 ? 'd14' : (d30 ? 'd30' : (end ? 'end' : 'never'));
    cap = { status: first === 'never' ? 'not-bonded-by-end' : 'bonded-' + first, probe, d14: !!d14, d30: !!d30, end: !!end };
  }
  console.log(`   CAP: ${cap.status} (probe: ${probe && !probe.none ? `${probe.vid} trust=${probe.trust} want=${probe.want} refused=${probe.refused}` : (probe ? probe.none : 'none')})`);
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
  let bearerNewTotal = 0, bearerNewDriven = 0, bearerNewUndriven = 0, npcNewTotal = 0;
  const perDayNpc = [];
  for (const d of bd) {
    npcNewTotal += (d.newNpc || []).length; perDayNpc.push((d.newNpc || []).length);
    bearerNewTotal += (d.newBearer || []).length;
    if (drivenDays.has(d.dplus)) bearerNewDriven += (d.newBearer || []).length;
    else bearerNewUndriven += (d.newBearer || []).length;
  }
  perDayNpc.sort((a, b) => a - b);
  const med = perDayNpc.length ? perDayNpc[Math.floor(perDayNpc.length / 2)] : 0;
  console.log(`   OPP talk-requests (distinct, d+0..d+30, self excluded): total=${reqList.length} unbonded=${unbondedReq.length} selfReqDayEntries=${selfReqDays}`);
  if (unbondedReq.length) console.log(`       unbonded requesters: ${unbondedReq.map(r => `${r.who}(d${r.day})`).join(', ')}`);
  console.log(`   OPP bonds d+0..d+30: NPC-NPC new=${npcNewTotal} over ${bd.length} bond-days (median/day=${med}); bearer new=${bearerNewTotal} (driven-days=${bearerNewDriven}, undriven-days=${bearerNewUndriven})`);
  // --- CARRIED ---
  const pr = pickTimeRank(rec);
  const incall = (rec.pdCalls || []).some(c => c.deathBeatN > 0);
  console.log(`   CARRIED pick-time rank: ${pr.rank == null ? 'n/a (' + pr.note + ')' : pr.rank} | funeral INCALL beat: ${incall}`);
  console.log(`   relPost bonds=${(rec.relPost && rec.relPost.bonds || []).length} relD14=${(rec.relD14 && rec.relD14.bonds || []).length} relD30=${(rec.relD30 && rec.relD30.bonds || []).length} relEnd=${(rec.relEnd && rec.relEnd.bonds || []).length}`);
  panel.push({ seed, cap: cap.status, probeVid: probe && probe.vid, reqTotal: reqList.length, reqUnbonded: unbondedReq.length, selfReqDayEntries: selfReqDays, npcNew: npcNewTotal, bearerNew: bearerNewTotal, bearerNewUndriven, pickRank: pr.rank, incall });
}
console.log('\n=== PANEL ===');
for (const p of panel) console.log(JSON.stringify(p));
const eligible = panel.filter(p => !p.skipped && !p.missing);
const bonded = eligible.filter(p => String(p.cap).startsWith('bonded-'));
console.log(`CAP verdict: bonded-by-end ${bonded.length}/${eligible.length} eligible seeds (bar: >=3 of 4 pilot seeds with opened probe + same-bearer relEnd).`);
console.log(`OPP totals: unbonded talk-requests ${eligible.reduce((a, p) => a + (p.reqUnbonded || 0), 0)}; bearer new bonds on undriven days ${eligible.reduce((a, p) => a + (p.bearerNewUndriven || 0), 0)}; NPC-NPC new bonds ${eligible.reduce((a, p) => a + (p.npcNew || 0), 0)}.`);
