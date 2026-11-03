// tbleth-analyze-20261103.js — TB lethality decomposition analyzer
// (arm sim-tbleth-a). Reads evidence/2026-11-03/perseed-tbleth-a/
// per-seed JSONs, classifies every TB exposure, reconciles every
// wave-4 monster damage ledger (startHp + hpDelta sum vs endHp),
// and prints pooled split tables + a ranked factor table.
// Usage: node scripts/tbleth-analyze-20261103.js [glob-dir]
// (defaults to evidence/2026-11-03/perseed-tbleth-a, RUN=tbleth files)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
if (require.main !== module) {
  // Required as a library (proof test): export classifiers only.
  // Function declarations below are hoisted, so this is safe.
  module.exports = { classify: classify, ledgerFor: ledgerFor, summarize: summarize };
  return;
}
const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-03', 'perseed-tbleth-a');
const files = fs.readdirSync(dir).filter(function (f) { return /-tbleth\.json$/.test(f); }).sort();
if (!files.length) { console.error('TBLETH ANALYZE: no per-seed files in ' + dir); process.exit(2); }

function classify(ex) {
  if (!ex.end) return 'tb-unended';
  const r = ex.end.result;
  const kills = (ex.kills || []).length;
  if ((r === 'won' || r === 'routed') && kills > 0) return 'kill';
  if (r === 'lost' && kills > 0) return 'pyrrhic';
  if (r === 'lost') return 'fighter-died';
  if (r === 'fled') return 'fled';
  return 'tb-other:' + r;
}

function ledgerFor(ex) {
  // Per wave-4 monster fighter: startHp (first-seen), dealt = sum of
  // hpDelta on that fighter (negative), endHp from the tbEnd pre-call
  // snapshot (matched by fighter key, falling back to mid).
  const rows = [];
  const endMonsters = (ex.end && ex.end.monsters) || [];
  for (const m of (ex.monsters || [])) {
    if (m.wave !== 4 && m.mid) {
      // Only wave-4 bodies enter the ledger; non-W4 pack members are
      // listed separately by the caller if needed.
    }
    if (m.wave != null && m.wave !== 4) continue;
    const dealt = (ex.hits || []).filter(function (h) {
      return h.targetKind === 'monster' && h.targetKey === m.key && h.hpDelta != null;
    }).reduce(function (s, h) { return s + h.hpDelta; }, 0);
    const dealtBy = {};
    for (const h of (ex.hits || [])) {
      if (h.targetKind !== 'monster' || h.targetKey !== m.key || h.hpDelta == null) continue;
      dealtBy[h.sourceClass || 'other'] = (dealtBy[h.sourceClass || 'other'] || 0) + (-h.hpDelta);
    }
    const end = endMonsters.find(function (e) { return e.key === m.key; }) ||
      endMonsters.find(function (e) { return e.mid === m.mid; });
    const endHp = end ? end.hp : null;
    const expected = (m.hpStart != null ? m.hpStart : null) + dealt;
    const gap = (endHp != null && expected != null) ? (endHp - expected) : null;
    rows.push({ key: m.key, mid: m.mid, joinedMidFight: !!m.joinedMidFight,
      hpStart: m.hpStart, maxHp: m.maxHp, dealt: -dealt, dealtBy: dealtBy,
      endHp: endHp, endAlive: end ? !!end.alive : null, gap: gap });
  }
  return rows;
}

function summarize(ex) {
  const cls = classify(ex);
  const ledger = ledgerFor(ex);
  const dealtBy = {};
  const takenBy = {};
  const dealtPerRound = {};
  const takenPerRound = {};
  for (const h of (ex.hits || [])) {
    if (h.hpDelta == null) continue;
    const amt = -h.hpDelta; // positive = damage stuck
    if (h.targetKind === 'monster') {
      dealtBy[h.sourceClass || 'other'] = (dealtBy[h.sourceClass || 'other'] || 0) + amt;
      const rk = 'r' + (h.round == null ? '?' : h.round);
      dealtPerRound[rk] = dealtPerRound[rk] || {};
      dealtPerRound[rk][h.sourceClass || 'other'] = (dealtPerRound[rk][h.sourceClass || 'other'] || 0) + amt;
    } else {
      const who = (h.targetKey === 'p') ? 'leader' : 'ally';
      takenBy[who] = (takenBy[who] || 0) + amt;
      const rk = 'r' + (h.round == null ? '?' : h.round);
      takenPerRound[rk] = takenPerRound[rk] || {};
      takenPerRound[rk][who] = (takenPerRound[rk][who] || 0) + amt;
    }
  }
  const roundsWithHits = new Set((ex.hits || []).map(function (h) { return h.round; })).size;
  const gaps = ledger.filter(function (r) { return r.gap !== 0 && r.gap != null; });
  return {
    seq: ex.seq, seed: ex._seed, day: ex.day, mid: ex.mid, cls: cls,
    partySizeStart: ex.partySizeStart,
    leadGear: ex.leadGear, party: ex.party,
    trickKnown: ex.trickKnown, shoutUses: ex.shoutUses, offerFoodUses: ex.offerFoodUses,
    abilityUses: (ex.abilityUses || []).map(function (a) { return a.args && a.args[0]; }),
    roundsSurvived: ex.end ? ex.end.round : null, roundsWithHits: roundsWithHits,
    hits: (ex.hits || []).length, dealtBy: dealtBy, takenBy: takenBy,
    dealtPerRound: dealtPerRound, takenPerRound: takenPerRound,
    ledger: ledger, ledgerOpen: gaps.length > 0, gaps: gaps,
    endHumansDead: ex.end ? ex.end.humansDead : null,
    endHumansFled: ex.end ? ex.end.humansFled : null,
    kills: (ex.kills || []).length, transcriptLines: (ex.transcript || []).length,
    transcriptOverflow: !!ex.transcriptOverflow,
    scholarStart: ex.scholarStart,
  };
}

const all = [];
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const ex of (data.exposures || [])) { ex._seed = data.seed; all.push({ seed: data.seed, days: data.days, endReason: data.endReason, ex: ex, sum: summarize(ex) }); }
  all._meta = all._meta || {};
  all._meta[f] = { seed: data.seed, days: data.days, end: data.endReason, spawnsW4: data.spawnsW4,
    tbCalls: data.tbCalls, fieldCallsW4: data.fieldCallsW4, killsW4: data.killsW4,
    unlinked: (data.unlinkedKills || []).length, orphans: (data.orphanTbEnds || []).length,
    errors: (data.instrumentErrors || []).length, notes: data.notes };
}

function sum(obj, k) { return Object.keys(obj || {}).reduce(function (s, x) { return s + (obj[x][k] || 0); }, 0); }
const byClass = {};
const byParty = { solo: [], ally: [] };
const byKind = {};
const byOutcome = {};
for (const row of all) {
  const s = row.sum;
  byClass[s.cls] = (byClass[s.cls] || 0) + 1;
  (s.partySizeStart <= 1 ? byParty.solo : byParty.ally).push(row);
  byKind[s.mid] = byKind[s.mid] || [];
  byKind[s.mid].push(row);
  byOutcome[s.cls] = byOutcome[s.cls] || [];
  byOutcome[s.cls].push(row);
}
function killRate(rows) {
  const k = rows.filter(function (r) { return r.sum.cls === 'kill'; }).length;
  return rows.length ? (k + '/' + rows.length + ' = ' + (k / rows.length).toFixed(3)) : 'n/a';
}
function avg(rows, fn) {
  if (!rows.length) return 'n/a';
  const v = rows.map(fn).filter(function (x) { return x != null && isFinite(x); });
  if (!v.length) return 'n/a';
  return (v.reduce(function (a, b) { return a + b; }, 0) / v.length).toFixed(1);
}
const totalDealt = {};
const totalTaken = {};
for (const row of all) {
  for (const k of Object.keys(row.sum.dealtBy)) totalDealt[k] = (totalDealt[k] || 0) + row.sum.dealtBy[k];
  for (const k of Object.keys(row.sum.takenBy)) totalTaken[k] = (totalTaken[k] || 0) + row.sum.takenBy[k];
}
const ledgerOpen = all.filter(function (r) { return r.sum.ledgerOpen; });
const unended = all.filter(function (r) { return r.sum.cls === 'tb-unended'; });

const out = {
  files: files, exposures: all.length,
  classes: byClass,
  killRateOverall: killRate(all),
  killRateSolo: killRate(byParty.solo),
  killRateAlly: killRate(byParty.ally),
  byKind: Object.keys(byKind).map(function (k) { return { kind: k, n: byKind[k].length, killRate: killRate(byKind[k]) }; }),
  avgRoundsSurvived: avg(all, function (r) { return r.sum.roundsSurvived; }),
  avgRoundsSurvivedLost: avg(byOutcome['fighter-died'] || [], function (r) { return r.sum.roundsSurvived; }),
  avgRoundsSurvivedKill: avg(byOutcome.kill || [], function (r) { return r.sum.roundsSurvived; }),
  totalDealtBySource: totalDealt, totalTakenByTarget: totalTaken,
  ledgerOpenCount: ledgerOpen.length, unendedCount: unended.length,
  perSeed: Object.keys(all._meta || {}).map(function (f) { return all._meta[f]; }),
  rows: all.map(function (r) { return { seed: r.seed, seq: r.sum.seq, day: r.sum.day, mid: r.sum.mid, cls: r.sum.cls,
    party: r.sum.partySizeStart, rounds: r.sum.roundsSurvived, dealtBy: r.sum.dealtBy, takenBy: r.sum.takenBy,
    ledger: r.sum.ledger, ledgerOpen: r.sum.ledgerOpen, trickKnown: r.sum.trickKnown,
    shouts: r.sum.shoutUses, offers: r.sum.offerFoodUses, abilities: r.sum.abilityUses,
    transcriptLines: r.sum.transcriptLines }; }),
};
console.log(JSON.stringify(out, null, 2));
