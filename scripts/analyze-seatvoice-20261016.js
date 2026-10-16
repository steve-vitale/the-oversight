#!/usr/bin/env node
'use strict';
// scripts/analyze-seatvoice-20261016.js — analyze the seatvoice captures.
// Reads evidence/2026-10-16/{perseed-seatvoice,seatvoice-beats}, applies the
// PRE-REGISTERED verdict rule EXACTLY (evidence/2026-10-16/sim-seatvoice.md),
// and prints every villager-voiced table beat in full for the sense-reads.
//
// THE BINDING RULE: a beat is VILLAGER-VOICED iff the villagevoice lib's cat
// is in {dialogue-with-stakes, goal-driven, routine-honest} OR
// event-reaction/template-fingerprint with villagerBeat=true — AND never
// system-voice, never scholar-action (second-person narrator is narration,
// not a villager's mouth, even when it names the collective — the "You won.
// Say it plainly" beat).
// A beat is TABLE-RELATED iff the table-topic overlay fired (b.tr).
const fs = require('fs');
const path = require('path');
const { stanceOf, contextOf, tableTopic } = require('./seatvoice-table-20261016');
const ROOT = path.join(__dirname, '..');
const PERSEED = path.join(ROOT, 'evidence', '2026-10-16', 'perseed-seatvoice');
const BEATS = path.join(ROOT, 'evidence', '2026-10-16', 'seatvoice-beats');

const VOICE_CATS = ['dialogue-with-stakes', 'goal-driven', 'routine-honest'];
function villagerVoiced(b) {
  if (!b || !b.c) return false;
  if (VOICE_CATS.includes(b.c)) return true;
  if ((b.c === 'event-reaction' || b.c === 'template-fingerprint') && b.vb) return true;
  return false;
}

const files = fs.readdirSync(BEATS).filter((f) => f.endsWith('.json')).sort();
const runs = files.map((f) => JSON.parse(fs.readFileSync(path.join(BEATS, f), 'utf8')));

// SANITY (pre-registered): the runs must actually sit.
const sittings = runs.filter((r) => r.seat && r.seat.sitDay != null).length;
console.log(`SANITY: sittings=${sittings}/${runs.length}`);
if (sittings === 0) { console.error('STOP: 0 sittings.'); process.exit(2); }

let beats = 0, villagerBeats = 0, unclassified = 0;
let tableRelated = 0, villagerVoicedTable = 0, topDownTable = 0;
const vvtBeats = []; // villager-voiced table beats, full records
const tdBeats = [];  // top-down table beats, sampled
const stanceDist = {}, ctxDist = {}, relDist = { before: 0, same: 0, after: 0, nosit: 0 };
const catDist = {};
for (const r of runs) {
  const sitDay = r.seat ? r.seat.sitDay : null;
  for (const b of r.beats) {
    beats++;
    if (!b.c) { unclassified++; continue; }
    catDist[b.c] = (catDist[b.c] || 0) + 1;
    if (b.vb) villagerBeats++;
    // Recompute the topic from text (the overlay gained phrases after the
    // sweep — the stored b.tr used the older rule).
    const tp = tableTopic(b.t);
    b.tr = tp.related;
    b.trWhy = tp.reasons;
    if (!b.tr) continue;
    tableRelated++;
    if (villagerVoiced(b)) {
      villagerVoicedTable++;
      const st = stanceOf(b.t).stances;
      const cx = contextOf(b.t);
      const rel = sitDay != null ? (b.d - sitDay) : null;
      vvtBeats.push({ run: `${r.policyId}-s${r.seed}`, d: b.d, sit: sitDay, rel, t: b.t, cat: b.c, stances: st, ctx2: cx, why: b.trWhy });
      const st0 = st[0] || 'unjudged';
      stanceDist[st0] = (stanceDist[st0] || 0) + 1;
      ctxDist[cx] = (ctxDist[cx] || 0) + 1;
      if (rel == null) relDist.nosit++;
      else if (rel < 0) relDist.before++;
      else if (rel === 0) relDist.same++;
      else relDist.after++;
    } else {
      topDownTable++;
      if (tdBeats.length < 60) tdBeats.push({ run: `${r.policyId}-s${r.seed}`, d: b.d, t: b.t, cat: b.c, why: b.trWhy });
    }
  }
}

console.log(`\nCOVERAGE: runs=${runs.length} beats=${beats} villagerBeats(lib)=${villagerBeats} unclassified=${unclassified}`);
console.log(`CATS: ${JSON.stringify(catDist)}`);
console.log(`TOPIC: tableRelated=${tableRelated} villagerVoicedTable=${villagerVoicedTable} topDownTable=${topDownTable}`);
console.log(`STANCES: ${JSON.stringify(stanceDist)}`);
console.log(`CONTEXTS: ${JSON.stringify(ctxDist)}`);
console.log(`SEAT-DAY RELATION: ${JSON.stringify(relDist)}`);

// Per-run wall + voice table (recomputed with the exact rule)
console.log('\nPER-RUN:');
for (const r of runs) {
  let tr = 0, vt = 0;
  for (const b of r.beats) { if (b.tr) { tr++; if (villagerVoiced(b)) vt++; } }
  const ps = JSON.parse(fs.readFileSync(path.join(PERSEED, `${r.policyId}-s${r.seed}.json`), 'utf8'));
  console.log(`  ${r.policyId}-s${r.seed}: win=${ps.won ? 1 : 0} inv=d${ps.inviteDay} sit=d${ps.sitDay} seat=${ps.seatType} end=${ps.endReason} beats=${ps.beatCount} vill=${ps.villagerBeats} tabRel=${tr} villTab=${vt} topTab=${tr - vt}`);
}

console.log(`\n=== VILLAGER-VOICED TABLE BEATS (${vvtBeats.length}) — full text ===`);
vvtBeats.sort((a, b) => (a.run < b.run ? -1 : a.run > b.run ? 1 : a.d - b.d));
for (const b of vvtBeats) {
  const rel = b.rel == null ? 'nosit' : (b.rel < 0 ? `d${b.rel}` : b.rel === 0 ? 'sitday' : `+d${b.rel}`);
  console.log(`[${b.run} d${b.d} rel=${rel} ${b.cat} stances=${(b.stances || []).join('/') || 'unjudged'} ctx=${b.ctx2} why=${(b.why || []).join(',')}]`);
  console.log(`  ${b.t}`);
}

console.log(`\n=== TOP-DOWN TABLE BEATS (sample of ${topDownTable}, showing ${tdBeats.length}) ===`);
for (const b of tdBeats) {
  console.log(`[${b.run} d${b.d} ${b.cat} why=${(b.why || []).join(',')}] ${b.t.slice(0, 220)}`);
}

console.log(`\n=== VERDICT (pre-registered rule) ===`);
if (villagerVoicedTable > 0) {
  console.log(`FILLED: ${villagerVoicedTable} villager-voiced table beat(s) across ${runs.length} runs. Quoted above; coherence judged in the evidence file sense-reads.`);
} else {
  console.log(`CONFIRMED ABSENT: 0 villager-voiced table beats across ${runs.length} runs / ${beats} beats (${villagerBeats} villager beats) / ${tableRelated} table-related beats (top-down ${topDownTable}). The #372 blank persists on the winning substrate.`);
}
