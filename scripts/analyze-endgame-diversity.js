#!/usr/bin/env node
// analyze-endgame-diversity.js — endgame build/path distribution analysis.
// Steve 2026-10-12: now that villages reach national in sims, are endgame
// builds and strategies evenly distributed, or is one overrepresented?
// Reads row JSONs from sweep-winstats-deep.js (extended 2026-10-12 with
// scaleRoad, seasonedLinks, ascended, ascendedN, maxAscScore) and reports:
//
//   - path reach shares: which of the 14 endings (7 paths x light/dark)
//     get reached, among table-firers and among winners
//   - scale-road shares among national-reachers (LEAD/BELONG/COVENANT/
//     TRADE/CONQUEST/none)
//   - ability frequency among national-reachers vs winners
//   - strategy/policy shares among national-reachers and winners
//   - villager-ascension shares (Steve 2026-10-12 design law: every
//     villager must have a potential path to godhood; the player is an
//     advantage, not the only route). Flags it if villagers effectively
//     never ascend in sims — that is a blank to fill, per the endgame
//     build's NPC ascension design.
//
// Small-sample honesty (MEASUREMENT.md): shares are reported with n and a
// confidence label. No distribution claim is made below n=10; claims at
// 10<=n<30 are "suggestive", n>=30 "measured". Never claim a pattern
// from n=3.
//
// Usage: node analyze-endgame-diversity.js <rows.json...> [--out=report.json]
'use strict';
const fs = require('fs');

const PATHS = ['feared', 'indispensable', 'beloved', 'witness', 'defiant', 'assimilated', 'relay'];
const BRANCHES = ['light', 'dark'];

function conf(n) {
  if (n < 10) return 'insufficient data';
  if (n < 30) return 'suggestive';
  return 'measured';
}

function shares(items, key) {
  const counts = {};
  for (const it of items) {
    const k = key(it);
    counts[k] = (counts[k] || 0) + 1;
  }
  const n = items.length;
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    .map(k => ({ k, n: counts[k], share: counts[k] / n }));
}

function verdict(sh, n) {
  // sh: sorted desc share list. Returns {verdict, why}.
  if (n < 10) return { verdict: 'insufficient-data', why: `n=${n} national-reachers/winners — no distribution claim possible` };
  const top = sh[0] || { share: 0, k: 'none' };
  const second = sh[1] || { share: 0 };
  if (top.share >= 0.75 && top.share >= 2 * second.share)
    return { verdict: 'degenerate', why: `${top.k} takes ${(100 * top.share).toFixed(0)}% (n=${n}) — one build/path owns the endgame` };
  if (n >= 30 && top.share >= 0.60 && top.share >= 2 * second.share)
    return { verdict: 'degenerate', why: `${top.k} takes ${(100 * top.share).toFixed(0)}% (n=${n}) — one build/path owns the endgame` };
  if (top.share > 0.50)
    return { verdict: 'skewed', why: `${top.k} takes ${(100 * top.share).toFixed(0)}% (n=${n}) — concentration worth a lever look` };
  if (sh.length >= 2 && sh[0].share + sh[1].share >= 0.80)
    return { verdict: 'skewed', why: `top two take ${(100 * (sh[0].share + sh[1].share)).toFixed(0)}% (n=${n})` };
  return { verdict: 'even', why: `no category above 40% (n=${n}) — the endgame admits many shapes` };
}

const args = process.argv.slice(2);
let outPath = null;
const files = args.filter(a => {
  if (a.startsWith('--out=')) { outPath = a.slice(6); return false; }
  return true;
});
let rows = [];
for (const f of files) {
  try { rows = rows.concat(JSON.parse(fs.readFileSync(f, 'utf8'))); }
  catch (e) { console.error('skip ' + f + ': ' + e.message); }
}

const report = { total: rows.length, sections: {} };
const P = (s) => console.log(s);

P('== ENDGAME DIVERSITY (n=' + rows.length + ' runs) ==');
P('confidence rule: n<10 insufficient-data | 10-29 suggestive | 30+ measured\n');

const national = rows.filter(r => r.rankDay && r.rankDay.national);
const winners = rows.filter(r => r.won);
const tableFired = rows.filter(r => r.tableFired);

P(`runs: ${rows.length} | national-reachers: ${national.length} (${conf(national.length)}) | ` +
  `table fired: ${tableFired.length} | wins: ${winners.length} (${conf(winners.length)})`);
report.sections.funnel = { runs: rows.length, national: national.length, tableFired: tableFired.length, wins: winners.length };

// ---- 1. path shares (14 endings) ----
P('\n-- endgame path shares (table-firers) --');
const pathSh = shares(tableFired, r => (r.tablePath || '?') + '/' + (r.tableBranch || '?'));
for (const s of pathSh) P(`  ${s.k}: ${s.n} (${(100 * s.share).toFixed(1)}%)`);
const pv = verdict(pathSh, tableFired.length);
P(`  verdict: ${pv.verdict} — ${pv.why}`);
report.sections.paths = { shares: pathSh, verdict: pv };
if (winners.length) {
  P('\n-- winning paths --');
  const wsh = shares(winners, r => (r.tablePath || '?') + '/' + (r.tableBranch || '?'));
  for (const s of wsh) P(`  ${s.k}: ${s.n} (${(100 * s.share).toFixed(1)}%)`);
  const wv = verdict(wsh, winners.length);
  P(`  verdict: ${wv.verdict} — ${wv.why}`);
  report.sections.winningPaths = { shares: wsh, verdict: wv };
}

// ---- 2. scale-road shares ----
P('\n-- scale-road shares (national-reachers) --');
const roadSh = shares(national, r => r.scaleRoad || 'unknown');
for (const s of roadSh) P(`  ${s.k}: ${s.n} (${(100 * s.share).toFixed(1)}%)`);
const rv = verdict(roadSh, national.length);
P(`  verdict: ${rv.verdict} — ${rv.why}`);
report.sections.scaleRoads = { shares: roadSh, verdict: rv };

// ---- 3. ability frequency: national-reachers vs winners ----
function abilityFreq(rs) {
  const c = {};
  for (const r of rs) for (const a of (r.abilities || [])) c[a] = (c[a] || 0) + 1;
  const n = rs.length || 1;
  return Object.keys(c).sort((a, b) => c[b] - c[a]).map(k => ({ k, n: c[k], share: c[k] / n }));
}
P('\n-- ability frequency: national-reachers (top 12) --');
const afN = abilityFreq(national).slice(0, 12);
for (const s of afN) P(`  ${s.k}: ${s.n}/${national.length} (${(100 * s.share).toFixed(1)}%)`);
P('confidence: ' + conf(national.length));
report.sections.abilitiesNational = afN;
if (winners.length) {
  P('\n-- ability frequency: winners (top 12) --');
  const afW = abilityFreq(winners).slice(0, 12);
  for (const s of afW) P(`  ${s.k}: ${s.n}/${winners.length} (${(100 * s.share).toFixed(1)}%)`);
  P('confidence: ' + conf(winners.length));
  report.sections.abilitiesWinners = afW;
  // overlap: which winner abilities were already common at national?
  const natSet = {};
  for (const s of abilityFreq(national)) natSet[s.k] = s.share;
  P('\n-- winner abilities vs national baseline --');
  for (const s of afW) {
    const base = natSet[s.k];
    const tag = base == null ? 'never seen at national — win-specific?' :
      (s.share >= 2 * base ? 'overrepresented in wins' : 'in line with national baseline');
    P(`  ${s.k}: win ${(100 * s.share).toFixed(0)}% vs national ${base == null ? '—' : (100 * base).toFixed(0) + '%'} — ${tag}`);
  }
}

// ---- 4. strategy/policy shares ----
P('\n-- policy shares (national-reachers) --');
const polSh = shares(national, r => r.policy || '?');
for (const s of polSh) P(`  ${s.k}: ${s.n} (${(100 * s.share).toFixed(1)}%)`);
const polv = verdict(polSh, national.length);
P(`  verdict: ${polv.verdict} — ${polv.why}`);
report.sections.policies = { shares: polSh, verdict: polv };
if (winners.length) {
  P('\n-- policy shares (winners) --');
  const wpol = shares(winners, r => r.policy || '?');
  for (const s of wpol) P(`  ${s.k}: ${s.n} (${(100 * s.share).toFixed(1)}%)`);
  const wpolv = verdict(wpol, winners.length);
  P(`  verdict: ${wpolv.verdict} — ${wpolv.why}`);
  report.sections.winningPolicies = { shares: wpol, verdict: wpolv };
}

// ---- 5. villager ascension ----
P('\n-- villager ascension (table-firing runs) --');
const tf = tableFired;
const withAsc = tf.filter(r => (r.ascendedN | 0) > 0);
P(`runs with >=1 villager ascension: ${withAsc.length}/${tf.length} (confidence: ${conf(tf.length)})`);
const allAsc = [];
for (const r of tf) for (const a of (r.ascended || [])) allAsc.push(Object.assign({ _policy: r.policy, _seed: r.seed }, a));
P(`total ascensions: ${allAsc.length}`);
if (allAsc.length) {
  const noteC = {};
  for (const a of allAsc) for (const nt of (a.notes || [])) noteC[nt] = (noteC[nt] || 0) + 1;
  P('distinguishing notes (what ascended villagers had):');
  for (const k of Object.keys(noteC).sort((a, b) => noteC[b] - noteC[a]).slice(0, 10))
    P(`  ${k}: ${noteC[k]}/${allAsc.length}`);
  const abC = {};
  for (const a of allAsc) for (const ab of (a.abilities || [])) abC[ab] = (abC[ab] || 0) + 1;
  P('ascended-villager abilities (top 10):');
  for (const k of Object.keys(abC).sort((a, b) => abC[b] - abC[a]).slice(0, 10))
    P(`  ${k}: ${abC[k]}/${allAsc.length}`);
  const facN = allAsc.filter(a => (a.facilitated || []).length > 0).length;
  P(`facilitated by player: ${facN}/${allAsc.length} | unbacked (outshone): ${allAsc.length - facN}/${allAsc.length}`);
}
const maxScores = tf.map(r => r.maxAscScore | 0);
const medMax = maxScores.length ? maxScores.slice().sort((a, b) => a - b)[Math.floor(maxScores.length / 2)] : 0;
P(`median max villager ascension score (all table runs): ${medMax} (bar is 45)`);
let ascFlag;
if (tf.length >= 10 && withAsc.length === 0)
  ascFlag = 'BLANK: villagers effectively never ascend in sims — NPC ascension is decoration. Per Steve 2026-10-12 law (every villager must have a potential path to godhood), this is a blank to fill.';
else if (tf.length >= 10 && withAsc.length / tf.length < 0.2)
  ascFlag = `SKEWED: only ${withAsc.length}/${tf.length} table runs saw a villager ascend — the player's advantage may be the only route in practice. Worth a lever look.`;
else if (tf.length >= 10)
  ascFlag = `healthy: ${withAsc.length}/${tf.length} table runs had villager ascensions — the law holds in sims.`;
else
  ascFlag = `insufficient data (n=${tf.length} table runs) — cannot judge the ascension law yet.`;
P('ascension-law verdict: ' + ascFlag);
report.sections.ascension = { runsWithAscension: withAsc.length, tableRuns: tf.length, totalAscensions: allAsc.length, medianMaxScore: medMax, verdict: ascFlag };

// ---- overall ----
P('\n== OVERALL DIVERSITY VERDICT ==');
const verdicts = [pv.verdict, rv.verdict, polv.verdict];
let overall;
if (verdicts.every(v => v === 'insufficient-data'))
  overall = 'insufficient-data: the endgame is barely reached in sims — distribution cannot be judged yet. This is expected while national is rare; re-run when national-reachers >= 10.';
else if (verdicts.indexOf('degenerate') >= 0)
  overall = 'degenerate: at least one axis is owned by a single build/path/strategy — Steve 2026-10-12: fix the balance, the endgame must admit many shapes.';
else if (verdicts.indexOf('skewed') >= 0)
  overall = 'skewed: concentration on at least one axis — worth a lever look, not yet a verdict.';
else
  overall = 'even: no axis shows concentration at current confidence.';
P(overall);
report.overall = overall;

if (outPath) {
  fs.writeFileSync(outPath, JSON.stringify(report, null, 1));
  P('\nwrote ' + outPath);
}
