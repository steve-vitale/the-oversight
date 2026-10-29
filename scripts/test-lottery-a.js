#!/usr/bin/env node
// scripts/test-lottery-a.js — sim-lottery-a analyzer (pure reads).
// Judges the LOTTERY-COMPETITION lever on the funnel band.
// Usage:
//   EVID=<corpus dir> SEEDS=75101,...,75108 node scripts/test-lottery-a.js [--out <path>] [--sense]
//   REF_EVID=<predecessor corpus dir> adds the determinism check
//   (base corpus returns channels must equal the reference rows
//   exactly, per seed). The arm corpus is EXPECTED to differ, so
//   pass REF_EVID only for the base corpus.
// Primary metric (prereg): take rate = HUNT takes / offered picks
// over survivor-triple windows, funnel definition verbatim:
//   triple = judgedA meeting (wave-4, field, caller
//   resolve/patrol/aid, non-scholar leader, outcome vFlee)
//   grouped by (seed, vid, mid); anchor = first meeting.
//   offered = post-anchor picks with candidate.mid == triple mid.
//   takes   = post-anchor picks with chosen.kind == HUNT and
//             chosen.huntMid == triple mid.
//   departures = triple-window returns departures with
//   objective.kind == HUNT and huntMid == triple mid at
//   part >= anchor part. Pick-linked departures (departure part
//   >= a HUNT pick's part for the same huntDay) are reported
//   alongside, per the prereg metric-review note.
// Guards: starvation deaths, median days, death total, wall.
// Exit 1 on corpus invalidity or join errors. Exit 0 otherwise;
// GO/NO-GO is printed, never encoded in the exit code alone,
// because the prereg judges the numbers, not the script.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyTriple, isPostAnchorPick } = require('./test-funnel-a');

function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  return s[Math.floor(s.length / 2)];
}
function loadWaveMap() {
  const map = {};
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const arr = Array.isArray(raw) ? raw : (raw.monsters || raw.data || []);
    for (const d of (arr || [])) if (d && d.id) map[d.id] = (d.wave | 0) || null;
  } catch (e) {}
  return map;
}
function main() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-lottery-base');
  const seeds = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const refDir = process.env.REF_EVID || null;
  const rows = [];
  const problems = [];
  const joinErrors = [];
  for (const seed of seeds) {
    const p = path.join(evidDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(p)) { problems.push(`missing s${seed}-fresh.json`); continue; }
    let r;
    try { r = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { problems.push(`seed ${seed}: unparsable`); continue; }
    rows.push(r);
    if (!(r.days > 0)) problems.push(`seed ${seed}: days<=0`);
    for (const key of ['fieldparty', 'returns', 'funnel']) {
      const st = r[key];
      if (!st) { problems.push(`seed ${seed}: no ${key}`); continue; }
      if (st.diag && st.diag.errs !== 0) problems.push(`seed ${seed} (${key}): errs=${st.diag.errs}`);
      if (st.diag && Object.values(st.diag.overflow || {}).some(v => (v | 0) !== 0)) problems.push(`seed ${seed} (${key}): overflow`);
    }
    const fpMs = ((r.fieldparty || {}).meetings || []);
    const rtMs = ((r.returns || {}).meetings || []);
    if (fpMs.length !== rtMs.length) joinErrors.push(`seed ${seed}: meeting count fieldparty=${fpMs.length} returns=${rtMs.length}`);
    else for (let i = 0; i < fpMs.length; i++) {
      if (fpMs[i].mid !== rtMs[i].mid || fpMs[i].vid !== rtMs[i].vid || fpMs[i].day !== rtMs[i].day) {
        joinErrors.push(`seed ${seed} idx ${i}: fp/rt mismatch`); break;
      }
    }
  }
  // Determinism vs reference (base corpus only).
  let detDiffs = null;
  if (refDir) {
    detDiffs = [];
    for (const r of rows) {
      const rp = path.join(refDir, `s${r.seed}-fresh.json`);
      if (!fs.existsSync(rp)) { detDiffs.push(`s${r.seed}: reference row missing`); continue; }
      const ref = JSON.parse(fs.readFileSync(rp, 'utf8'));
      const eq = (a, b, label) => { if (JSON.stringify(a) !== JSON.stringify(b)) detDiffs.push(`s${r.seed}: ${label} differs`); };
      eq((r.fieldparty || {}).meetings, (ref.fieldparty || {}).meetings, 'fieldparty.meetings');
      eq((r.returns || {}).meetings, (ref.returns || {}).meetings, 'returns.meetings');
      eq((r.returns || {}).departures, (ref.returns || {}).departures, 'returns.departures');
      eq((r.returns || {}).drops, (ref.returns || {}).drops, 'returns.drops');
      for (const k of ['won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'starvationDeaths', 'days', 'endReason']) {
        if (r[k] !== ref[k]) detDiffs.push(`s${r.seed}: wall field ${k} base=${r[k]} ref=${ref[k]}`);
      }
    }
  }
  const waveMap = loadWaveMap();
  const joined = [];
  for (const r of rows) {
    const fpMs = ((r.fieldparty || {}).meetings || []);
    const rtMs = ((r.returns || {}).meetings || []);
    for (let i = 0; i < fpMs.length; i++) joined.push({ fp: Object.assign({ seed: r.seed }, fpMs[i]), rt: rtMs[i] || null, seed: r.seed, index: i });
  }
  const judgedA = joined.filter(j => (j.fp.wave | 0) === 4 && j.fp.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(j.fp.caller) >= 0 && !(j.fp.leader && j.fp.leader.isScholar));
  const tripleMap = new Map();
  for (const j of judgedA) {
    if (j.fp.outcome !== 'vFlee') continue;
    const key = `${j.seed}|${j.fp.vid}|${j.fp.mid}`;
    if (!tripleMap.has(key)) tripleMap.set(key, []);
    tripleMap.get(key).push(j);
  }
  const triples = [];
  for (const [key, meetings] of tripleMap) {
    meetings.sort((a, b) => ((a.fp.day - b.fp.day) || ((a.fp.part | 0) - (b.fp.part | 0))));
    const anchorJ = meetings[0];
    const seed = anchorJ.seed, vid = anchorJ.fp.vid, mid = anchorJ.fp.mid;
    const row = rows.find(r => r.seed === seed);
    const anchorRt = anchorJ.rt;
    const anchorPart = anchorRt ? (anchorRt.part | 0) : (anchorJ.fp.part | 0);
    const vidPicks = (((row.funnel || {}).picks || []).filter(p => p.vid === vid));
    const vidNotes = (((row.funnel || {}).notes || []).filter(n => n.vid === vid));
    const vidDeps = (((row.returns || {}).departures || []).filter(d => d.vid === vid));
    const vidDrops = (((row.returns || {}).drops || []).filter(d => d.dropped && d.vid === vid));
    const vidDeaths = ((row.deathsList || []).filter(d => d.who === vid));
    const vidLeaves = vidDeps.filter(d => d.objective && d.objective.kind === 'LEAVE');
    const postPicks = vidPicks.filter(p => isPostAnchorPick(p, anchorPart, anchorRt, mid));
    const windowNotes = vidNotes.filter(n => (n.part | 0) >= (anchorPart | 0));
    const windowDrops = vidDrops.filter(d => (d.part | 0) >= (anchorPart | 0));
    const windowDeps = vidDeps.filter(d => (d.part | 0) >= (anchorPart | 0));
    const laterMeetings = judgedA.filter(j => j.seed === seed && j.fp.vid === vid && j.fp.mid === mid
      && !(j.fp.day === anchorJ.fp.day && (j.fp.part | 0) === (anchorJ.fp.part | 0)))
      .map(j => ({ day: j.fp.day, part: j.fp.part, vid: j.fp.vid, mid: j.fp.mid, outcome: j.fp.outcome }));
    const trace = { seed, vid, mid, anchor: { day: anchorJ.fp.day, part: anchorPart, rt: anchorRt, fp: anchorJ.fp },
      picks: postPicks, departures: windowDeps, drops: windowDrops, notes: windowNotes,
      meetings: laterMeetings, deaths: vidDeaths, leaves: vidLeaves };
    let cls = { stage: '?', cls: '?', sub: 'classify-error' };
    try { cls = classifyTriple(trace); } catch (e) { cls.sub = `classify threw: ${String(e && e.message || e)}`; }
    const offered = postPicks.filter(p => p.candidate && p.candidate.mid === mid);
    const takes = postPicks.filter(p => p.chosen && p.chosen.kind === 'HUNT' && p.chosen.huntMid === mid);
    const deps = windowDeps.filter(d => d.objective && d.objective.kind === 'HUNT' && d.objective.huntMid === mid);
    const pickLinkedDeps = deps.filter(d => takes.some(pk => pk.chosen && pk.chosen.huntDay === d.objective.huntDay && (pk.part | 0) <= (d.part | 0)));
    const offeredByAge = {};
    const takesByAge = {};
    for (const p of offered) {
      const age = p.day - (p.candidate.day | 0);
      offeredByAge[age] = (offeredByAge[age] || 0) + 1;
      if (p.chosen && p.chosen.kind === 'HUNT') takesByAge[age] = (takesByAge[age] || 0) + 1;
    }
    const chosenKinds = {};
    for (const p of offered) { const k = (p.chosen && p.chosen.kind) || 'null'; chosenKinds[k] = (chosenKinds[k] || 0) + 1; }
    triples.push({ seed, vid, mid, anchorDay: anchorJ.fp.day, anchorPart,
      stage: cls.stage, cls: cls.cls, sub: cls.sub,
      counts: { picks: postPicks.length, offered: offered.length, takes: takes.length,
        departures: deps.length, pickLinkedDepartures: pickLinkedDeps.length,
        dropsMid: windowDrops.filter(d => d.mid === mid).length, laterMeetings: laterMeetings.length },
      offeredByAge, takesByAge, chosenKinds,
      offeredPicks: offered.map(p => ({ day: p.day, part: p.part, age: p.day - (p.candidate.day | 0), chosen: p.chosen && p.chosen.kind, huntDay: p.chosen && p.chosen.huntDay || null })),
      takesDetail: takes.map(p => ({ day: p.day, part: p.part, huntDay: p.chosen.huntDay })),
      departuresDetail: deps.map(d => ({ day: d.day, part: d.part, huntDay: d.objective.huntDay, tx: d.objective.tx, ty: d.objective.ty })),
    });
  }
  triples.sort((a, b) => (a.seed - b.seed) || (a.vid < b.vid ? -1 : 1) || (a.mid < b.mid ? -1 : 1));
  const offeredTotal = triples.reduce((t, x) => t + x.counts.offered, 0);
  const takesTotal = triples.reduce((t, x) => t + x.counts.takes, 0);
  const depsTotal = triples.reduce((t, x) => t + x.counts.departures, 0);
  const pickLinkedTotal = triples.reduce((t, x) => t + x.counts.pickLinkedDepartures, 0);
  const takeRate = offeredTotal ? takesTotal / offeredTotal : null;
  const allDeps = [];
  const allDrops = [];
  for (const r of rows) {
    for (const d of (((r.returns || {}).departures) || [])) allDeps.push(Object.assign({ seed: r.seed }, d));
    for (const d of (((r.returns || {}).drops) || [])) allDrops.push(Object.assign({ seed: r.seed }, d));
  }
  const huntDepsW4 = allDeps.filter(d => d.objective && d.objective.kind === 'HUNT' && waveMap[d.objective.huntMid] === 4);
  const huntDropsW4 = allDrops.filter(d => d.dropped && waveMap[d.mid] === 4);
  const wall = {
    won: rows.reduce((t, r) => t + (r.won ? 1 : 0), 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver || 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered || 0), 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
    deathTotal: rows.reduce((t, r) => t + (r.deathTotal || 0), 0),
  };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const classCounts = {};
  for (const t of triples) classCounts[t.cls] = (classCounts[t.cls] || 0) + 1;
  const goTake = takeRate !== null && takeRate >= 0.25;
  const goDeps = depsTotal >= 3;
  const goDet = detDiffs === null || detDiffs.length === 0;
  console.log('=== sim-lottery-a analyzer ===');
  console.log(`corpus: rows=${rows.length}/${seeds.length} ok=${problems.length === 0} ${problems.join('; ')}`);
  console.log(`JOIN: errors=${joinErrors.length} ${joinErrors.slice(0, 5).join('; ')}`);
  if (detDiffs !== null) console.log(`DETERMINISM vs reference: ${goDet ? 'PASS' : 'FAIL'} ${detDiffs.slice(0, 10).join('; ')}`);
  console.log(`TRIPLES: ${triples.length} classes=${JSON.stringify(classCounts)}`);
  console.log(`PRIMARY: offered=${offeredTotal} takes=${takesTotal} takeRate=${takeRate === null ? 'n/a' : (takeRate * 100).toFixed(1) + '%'} departures=${depsTotal} (pickLinked=${pickLinkedTotal})`);
  console.log(`GO: take>=25% ${goTake ? 'PASS' : 'FAIL'} | departures>=3 ${goDeps ? 'PASS' : 'FAIL'}${detDiffs === null ? '' : ` | determinism ${goDet ? 'PASS' : 'FAIL'}`}`);
  console.log(`CORPUS-WIDE W4 HUNT: departures=${huntDepsW4.length} trueDrops=${huntDropsW4.length}`);
  console.log(`WALL: won=${wall.won} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} starv=${wall.starvationTotal} deaths=${wall.deathTotal}`);
  console.log('PER-TRIPLE:');
  for (const t of triples) {
    console.log(`  [s${t.seed} ${t.vid} ${t.mid} anchor d${t.anchorDay}] ${t.stage}/${t.cls} offered=${t.counts.offered} takes=${t.counts.takes} deps=${t.counts.departures} (linked=${t.counts.pickLinkedDepartures}) chosen=${JSON.stringify(t.chosenKinds)} offeredByAge=${JSON.stringify(t.offeredByAge)} takesByAge=${JSON.stringify(t.takesByAge)} :: ${t.sub}`);
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify({ corpusOk: problems.length === 0, problems, joinErrors,
      detDiffs, judgedA: judgedA.length, triples, classCounts,
      offered: offeredTotal, takes: takesTotal, takeRate, departures: depsTotal, pickLinkedDepartures: pickLinkedTotal,
      corpusW4: { departures: huntDepsW4.length, drops: huntDropsW4.length },
      wall, deathsByCause, goTake, goDeps, goDet }, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  if (process.argv.indexOf('--sense') >= 0) {
    // Print the richest triple trace verbatim: most offered picks.
    const rich = triples.slice().sort((a, b) => b.counts.offered - a.counts.offered)[0];
    if (rich) {
      const row = rows.find(r => r.seed === rich.seed);
      const picks = (((row.funnel || {}).picks || []).filter(p => p.vid === rich.vid && (p.part | 0) > (rich.anchorPart | 0)));
      console.log(`SENSE-TRIPLE s${rich.seed} ${rich.vid} ${rich.mid} anchor d${rich.anchorDay}:`);
      for (const p of picks) {
        console.log(`  PICK d${p.day} part=${p.part} chosen=${p.chosen && p.chosen.kind}${p.chosen && p.chosen.huntMid ? '/' + p.chosen.huntMid : ''} candidate=${p.candidate ? p.candidate.mid + '@(' + p.candidate.tx + ',' + p.candidate.ty + ')/day' + p.candidate.day : 'null'} pre=${JSON.stringify(p.preSightings)} gates=${JSON.stringify(p.gates)}`);
      }
      const deps = (((row.returns || {}).departures || []).filter(d => d.vid === rich.vid && (d.part | 0) >= (rich.anchorPart | 0)));
      for (const d of deps) console.log(`  DEP d${d.day} part=${d.part} ${d.objective && d.objective.kind} ${d.objective && d.objective.huntMid ? d.objective.huntMid + ' huntDay=' + d.objective.huntDay : ''} -> (${d.objective && d.objective.tx},${d.objective && d.objective.ty})`);
      const drops = (((row.returns || {}).drops || []).filter(d => d.vid === rich.vid && (d.part | 0) >= (rich.anchorPart | 0)));
      for (const d of drops) console.log(`  DROP d${d.day} part=${d.part} ${d.mid} dropped=${d.dropped}`);
    }
  }
  if (problems.length) { console.log('CENSUS: FAIL'); process.exit(1); }
  if (joinErrors.length) { console.log('JOIN: FAIL'); process.exit(1); }
}
if (require.main === module) main();
module.exports = {};
