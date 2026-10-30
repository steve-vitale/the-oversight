#!/usr/bin/env node
// analyze-linkgen-a.js — band aggregator for sim-linkgen-a.
// Usage: node scripts/analyze-linkgen-a.js <legdir-competent> <legdir-leadcourt> [outfile]
// Prints verdict vs prereg, stage tables, linked-village table, wall numbers.
'use strict';
const fs = require('fs');
const path = require('path');

function loadDir(dir) {
  const rows = [];
  fs.readdirSync(dir).filter(function (f) { return /^s\d+\.json$/.test(f); }).sort().forEach(function (f) {
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  });
  return rows;
}

function stageOfSeed(row) {
  const props = (row.proposals || []).filter(function (p) { return p.outcome !== 'ALREADY-LINKED' && p.outcome !== 'BLOCKED-PENDING'; });
  const activeEnd = (row.final && row.final.links || []).filter(function (l) { return l.status === 'active'; }).length;
  if (activeEnd >= 3 && row.policy === 'leadcourt') return 'REACHED';
  if (!props.length) return 'NO-ATTEMPT';
  if (activeEnd >= 1 && props.some(function (p) { return p.outcome === 'ACCEPT'; })) return 'REACHED';
  const counts = {};
  props.forEach(function (p) { counts[p.outcome] = (counts[p.outcome] || 0) + 1; });
  // Pipeline order for ties: BLOCKED-UNKNOWN > SHUT-DOOR > DECLINE > COUNTER-UNANSWERED.
  const order = ['BLOCKED-UNKNOWN', 'SHUT-DOOR', 'DECLINE', 'COUNTER'];
  // COUNTER outcomes need the counter-resolution split: answered vs unanswered.
  const answered = {};
  (row.counters || []).forEach(function (c) { if (c.targetId) answered[c.targetId] = true; });
  let counterUnanswered = 0, counterAnswered = 0;
  props.forEach(function (p) {
    if (p.outcome !== 'COUNTER') return;
    if (answered[p.targetId]) counterAnswered++; else counterUnanswered++;
  });
  const votes = Object.assign({}, counts);
  votes.COUNTER = counterUnanswered; // unanswered counters are the blocking stage
  let best = null, bestN = -1;
  order.forEach(function (o) {
    if ((votes[o] || 0) > bestN) { bestN = votes[o]; best = o; }
  });
  if (best === 'COUNTER') return 'COUNTER-UNANSWERED';
  return best || 'NO-ATTEMPT';
}

function linkedVillagesOf(rows) {
  // Union of three formation records: snapshot linkDay (first/peak/final
  // snapshots), ACCEPT proposal events, and counter-link events. A link
  // that forms and breaks between snapshot landmarks would otherwise be
  // missed by snapshots alone (e.g. a seed with linksEnd < formed).
  const out = [];
  rows.forEach(function (r) {
    const byId = {};
    (r.villages || []).forEach(function (v) { byId[v.id] = v; });
    const formed = {};
    (r.proposals || []).forEach(function (p) {
      if (p.outcome === 'ACCEPT') formed[p.targetId] = Math.min(formed[p.targetId] == null ? Infinity : formed[p.targetId], p.day);
    });
    (r.counters || []).forEach(function (c) {
      if (c.retKind === 'link' && c.targetId) formed[c.targetId] = Math.min(formed[c.targetId] == null ? Infinity : formed[c.targetId], c.day);
    });
    Object.keys(byId).forEach(function (vid) {
      const v = byId[vid];
      const evDay = formed[vid];
      if (v.linkDay != null || v.linkedAtEnd || evDay != null) {
        const copy = Object.assign({}, v);
        if (copy.linkDay == null && evDay != null) copy.linkDay = evDay;
        copy.formedByEvent = evDay != null;
        out.push({ seed: r.seed, policy: r.policy, v: copy });
      }
    });
  });
  return out;
}

function summarizeLeg(rows, label) {
  const stages = {};
  rows.forEach(function (r) { const s = stageOfSeed(r); stages[s] = (stages[s] || 0) + 1; });
  const outcomes = {};
  rows.forEach(function (r) { (r.proposals || []).forEach(function (p) { outcomes[p.outcome] = (outcomes[p.outcome] || 0) + 1; }); });
  const attempts = rows.filter(function (r) { return (r.proposals || []).filter(function (p) { return p.outcome !== 'ALREADY-LINKED' && p.outcome !== 'BLOCKED-PENDING'; }).length > 0; }).length;
  const linkedVillages = linkedVillagesOf(rows);
  const wall = {
    won: rows.filter(function (r) { return r.won; }).length + '/' + rows.length,
    nationalEver: rows.filter(function (r) { return r.nationalEver; }).length + '/' + rows.length,
    nationalFinal: rows.filter(function (r) { return r.nationalFinal; }).length + '/' + rows.length,
    tableWaiting: rows.filter(function (r) { return r.tableWaiting; }).length + '/' + rows.length,
    tableEntered: rows.filter(function (r) { return r.tableEntered; }).length + '/' + rows.length,
    wave4: rows.filter(function (r) { return (r.waveUnlocked || 0) >= 4; }).length + '/' + rows.length,
    wave5: rows.filter(function (r) { return (r.waveUnlocked || 0) >= 5; }).length + '/' + rows.length,
    medianSurvival: median(rows.map(function (r) { return r.gameDays; })),
    maxSurvival: Math.max.apply(null, rows.map(function (r) { return r.gameDays; })),
    deaths: rows.reduce(function (t, r) { return t + (r.deathCount || 0); }, 0),
  };
  const instrErr = rows.reduce(function (t, r) { return t + ((r.instrumentErrors || []).length); }, 0);
  return { label: label, n: rows.length, stages: stages, outcomes: outcomes, attempts: attempts, linkedVillages: linkedVillages, wall: wall, instrErr: instrErr };
}

function median(a) {
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

function main() {
  const cdir = process.argv[2], ldir = process.argv[3], out = process.argv[4];
  if (!cdir || !ldir) { console.error('usage: analyze-linkgen-a.js <competent-dir> <leadcourt-dir> [outfile]'); process.exit(2); }
  const comp = summarizeLeg(loadDir(cdir), 'competent');
  const lead = summarizeLeg(loadDir(ldir), 'leadcourt');
  const linked = lead.linkedVillages;
  const genEver = linked.filter(function (x) { return x.v.generatedEver; }).length;
  const neverGen = linked.filter(function (x) { return !x.v.generatedEver; }).length;
  const stillUngen = linked.filter(function (x) { return x.v.linkedAtEnd && !x.v.finalGenerated; }).length;
  const genEvents = [];
  loadDir(ldir).forEach(function (r) { (r.catchUps || []).forEach(function (c) { if (c.generatedAfter && !c.generatedBefore) genEvents.push({ seed: r.seed, c: c }); }); });
  const nonApproachGens = genEvents.filter(function (g) { return g.c.dist == null || g.c.dist > 2; });
  const loreOnly = [];
  loadDir(ldir).forEach(function (r) { (r.catchUps || []).forEach(function (c) { if (c.loreOnlyApproach) loreOnly.push({ seed: r.seed, c: c }); }); });
  const perSeed = {};
  [comp, lead].forEach(function (leg) {
    perSeed[leg.label] = loadDir(leg.label === 'competent' ? cdir : ldir).map(function (r) {
      return { seed: r.seed, gameDays: r.gameDays, end: r.endReason, proposals: (r.proposals || []).length,
        outcomes: (r.proposals || []).map(function (p) { return p.outcome; }),
        stage: stageOfSeed(r), linksEnd: (r.final && r.final.links || []).filter(function (l) { return l.status === 'active'; }).length,
        genEvents: (r.genEvents || []).length, catchUps: (r.catchUps || []).length,
        maxRank: r.maxRank, wave: r.waveUnlocked, won: r.won, instrErr: (r.instrumentErrors || []).length };
    });
  });
  const result = {
    competent: comp, leadcourt: lead,
    linkedVillages: { total: linked.length, generatedEver: genEver, neverGenerated: neverGen, stillUngeneratedAtEnd: stillUngen },
    generationEvents: { total: genEvents.length, nonApproach: nonApproachGens.length, nonApproachDetail: nonApproachGens },
    loreOnlyApproaches: loreOnly,
    linkedDetail: linked.map(function (x) {
      return { seed: x.seed, village: x.v.id, name: x.v.name, linkDay: x.v.linkDay, linkedAtEnd: x.v.linkedAtEnd,
        generatedEver: x.v.generatedEver, firstGenDay: x.v.firstGenDay, firstGenTrigger: x.v.firstGenTrigger,
        finalGenerated: x.v.finalGenerated, finalRosterSize: x.v.finalRosterSize, finalAliveAdults: x.v.finalAliveAdults,
        catchUpCount: x.v.catchUpCount, loreOnlyApproaches: x.v.loreOnlyApproaches, firstKnown: x.v.firstKnown };
    }),
    perSeed: perSeed,
  };
  // Verdict vs prereg.
  const compStageTop = Object.keys(comp.stages).sort(function (a, b) { return comp.stages[b] - comp.stages[a]; })[0];
  const diag1 = (comp.stages[compStageTop] || 0) >= 6 && lead.attempts >= 6;
  const diag2a = linked.length >= 12 && (genEver > linked.length / 2 || neverGen > linked.length / 2);
  const diag2b = linked.length >= 12 && nonApproachGens.length === 0;
  result.verdict = {
    q1Stage: compStageTop, q1StageCount: comp.stages[compStageTop], q1LeadAttempts: lead.attempts,
    diag1: diag1, diag2majority: diag2a, diag2triggerRule: diag2b, diag2: diag2a || diag2b,
  };
  console.log(JSON.stringify(result, null, 2));
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = { stageOfSeed };
