#!/usr/bin/env node
// scripts/sim-tabletalk-sit-a-analyze.js — sim-tabletalk-sit-a analyzer.
// Reads evidence/2026-10-26/perseed-sim-tabletalk-sit-a/s<seed>.json
// rows (pick-time snapshots harvested by sim-tabletalk-sit-a-sweep.js)
// and answers, per fired template, which situation facts the template
// MENTIONS vs which facts were READABLE at pick time but UNUSED.
//
// Mention rules (literal text, never inferred intent):
//   - A fact counts as MENTIONED only if the template's text names that
//     fact's VALUE or state (a number, a class, a named marker, a
//     duration, a seat kind). A generic gesture at the CONCEPT does
//     not count: T3 says "the table doesn't fill the pantry" (the word
//     pantry, no pantry state) and T4 says "the Herald feeds on our
//     stores" (stores in general, no pantry number, no overtime tier).
//     Those are recorded as GESTURE, a third state, so the gap table
//     never over- or under-claims them.
//   - Waiting-generic ("it waits / we wait / the sky is waiting") is
//     NOT a mention of waiting duration: no template ever says how
//     long the wait has lasted, in any phase.
//   - "They're the one who has to sit in it" (T5) is NOT a mention of
//     seat kind: lesser vs full is never named.
//   - The ring (T0) is NOT a mention of seat kind, stage, or arc.
// Facts evaluated per fire (from that fire's snapshot):
//   pantryKcal, pantryClass, pelletOnline, nationProdFired,
//   overtimeTier, waitDurDays (+class), seatKind, stage, rank, pop,
//   announced, arc.
// Readability verdicts per fact (from code + snapshot probes):
//   - pantryKcal/pantryClass: READABLE, picker-native NO —
//     pantryKcalLive(village) is a live read the picker never calls.
//   - pelletOnline: READABLE, picker-native NO — fusionReactorOnline()
//     is a live read the picker never calls.
//   - nationProdFired: READABLE, picker-native NO —
//     state.scaleDiscover.nation is a stored once-only flag the picker
//     never reads.
//   - overtimeTier: READABLE, picker-native NO — overtimeTier() is a
//     live read the picker never calls (pg.overtime is stored).
//   - waitDurDays: OBSERVER-DERIVED, picker-native NO — no pg/state
//     field stores the first waiting day (proven by the per-fire
//     storedWaitingSinceFields probe: all candidates null); the
//     wrapper derives it from first-observed waiting dawn. A future
//     picker can record its own first-seen day with one new field;
//     today it cannot read the duration from state alone.
//   - seatKind: READABLE (live recompute), picker-native NO —
//     tableSeat() recomputes the live seat; no stored invitation-time
//     seat exists, so the seat AT INVITATION is not recoverable if
//     deeds later slip (live seat is what the tableScene prices).
//   - stage/rank/arc/pop/announced: READABLE, picker-native NO —
//     integrationStage()/scaleRank()/pg.arc/pg.tableAnnounced/roster
//     are all live reads the picker never calls.
//   - scholarId: READABLE and picker-native YES — the picker already
//     uses villagerId as its PRNG salt (it just never speaks it).
//   - lastTableTalkDay: picker-native YES (the cooldown), but it is
//     the PREVIOUS fire day, not a duration and not a situation fact
//     any template mentions.
//   - speaker's recent templates: NOT READABLE — havenGrowth stores
//     only lastTableTalkDay (a day, not a template or speaker), so no
//     per-speaker recent-template memory exists to read.
// Writes analysis.json next to the rows and prints the gap table.
// Exit 1 if any row is missing/errored (coverage miss), or if the
// wrapper never intercepted tableWaitTalk on a waiting seed.
// Usage: node scripts/sim-tabletalk-sit-a-analyze.js [--seed <seed>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tabletalk-sit-a');
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

const TEMPLATES = [
  { id: 'T0', key: 'ring of pale light', label: "The table's set. The ring of pale light — it's just sitting there." },
  { id: 'T1', key: "Nobody's sleeping", label: "Nobody's sleeping. The sky is waiting ..." },
  { id: 'T2', key: 'Too many angles', label: 'Did you see their faces? Too many angles.' },
  { id: 'T3', key: 'check the snares', label: 'It waits. We wait. Somebody should check the snares.' },
  { id: 'T4', key: 'Herald feeds', label: "It eats while we deliberate. The Herald feeds on our stores." },
  { id: 'T5', key: 'Why them?', label: "Why them? ... they're the one who has to sit in it." },
];
// Mention map: fact -> 'mentioned' | 'gesture' | 'ignored' per template.
// Grounded in the literal pool text (havenGrowth.js tableWaitTalk pool).
const MENTIONS = {
  T0: { pantry: 'ignored', pellet: 'ignored', nationProd: 'ignored', overtime: 'ignored', waitDur: 'ignored', seatKind: 'ignored', stage: 'ignored', rank: 'ignored', pop: 'ignored', announced: 'ignored', waitingGeneric: 'mentioned' },
  T1: { pantry: 'ignored', pellet: 'ignored', nationProd: 'ignored', overtime: 'ignored', waitDur: 'ignored', seatKind: 'ignored', stage: 'ignored', rank: 'ignored', pop: 'ignored', announced: 'ignored', waitingGeneric: 'mentioned' },
  T2: { pantry: 'ignored', pellet: 'ignored', nationProd: 'ignored', overtime: 'ignored', waitDur: 'ignored', seatKind: 'ignored', stage: 'ignored', rank: 'ignored', pop: 'ignored', announced: 'ignored', waitingGeneric: 'ignored' },
  T3: { pantry: 'gesture', pellet: 'ignored', nationProd: 'ignored', overtime: 'ignored', waitDur: 'ignored', seatKind: 'ignored', stage: 'ignored', rank: 'ignored', pop: 'ignored', announced: 'ignored', waitingGeneric: 'mentioned' },
  T4: { pantry: 'gesture', pellet: 'ignored', nationProd: 'ignored', overtime: 'gesture', waitDur: 'ignored', seatKind: 'ignored', stage: 'ignored', rank: 'ignored', pop: 'ignored', announced: 'ignored', waitingGeneric: 'ignored' },
  T5: { pantry: 'ignored', pellet: 'ignored', nationProd: 'ignored', overtime: 'ignored', waitDur: 'ignored', seatKind: 'ignored', stage: 'ignored', rank: 'ignored', pop: 'ignored', announced: 'ignored', waitingGeneric: 'ignored' },
};
// Readability verdicts (see header for the evidence per fact).
const READABILITY = {
  pantryKcal: { verdict: 'readable', pickerNative: false, via: 'pantryKcalLive(village)' },
  pantryClass: { verdict: 'readable', pickerNative: false, via: 'pantryKcalLive(village), classed by analyst thresholds (empty 0 / low 1-999 / ok 1000+)' },
  pelletOnline: { verdict: 'readable', pickerNative: false, via: 'fusionReactorOnline()' },
  nationProdFired: { verdict: 'readable', pickerNative: false, via: 'state.scaleDiscover.nation {day, via} (once-only _sdFire flag)' },
  overtimeTier: { verdict: 'readable', pickerNative: false, via: 'overtimeTier() / pg.overtime (stored), overtimeStanding() for penalty' },
  waitDurDays: { verdict: 'observer-derived', pickerNative: false, via: 'NO stored first-waiting-day field (all storedWaitingSinceFields candidates null on every fire); wrapper derives first-observed waiting dawn; a future picker needs one new first-seen field' },
  seatKind: { verdict: 'readable-live-only', pickerNative: false, via: 'tableSeat() live recompute; NO stored invitation-time seat — live seat is what the tableScene prices' },
  stage: { verdict: 'readable', pickerNative: false, via: 'integrationStage()' },
  rank: { verdict: 'readable', pickerNative: false, via: 'scaleRank()' },
  pop: { verdict: 'readable', pickerNative: false, via: 'village.roster.length' },
  announced: { verdict: 'readable', pickerNative: false, via: 'pg.tableAnnounced (stored boolean)' },
  arc: { verdict: 'readable', pickerNative: false, via: 'pg.arc (stored)' },
  scholarId: { verdict: 'readable', pickerNative: true, via: 'villagerId — already the picker PRNG salt, never spoken by any template' },
  speakerRecentTemplates: { verdict: 'not-readable', pickerNative: false, via: 'havenGrowth stores only lastTableTalkDay (a day); no template/speaker history is stored anywhere' },
};
const FACTS = ['pantryKcal', 'pantryClass', 'pelletOnline', 'nationProdFired', 'overtimeTier', 'waitDurDays', 'seatKind', 'stage', 'rank', 'pop', 'announced', 'arc'];
const MENTION_FACT = { pantryKcal: 'pantry', pantryClass: 'pantry', pelletOnline: 'pellet', nationProdFired: 'nationProd', overtimeTier: 'overtime', waitDurDays: 'waitDur', seatKind: 'seatKind', stage: 'stage', rank: 'rank', pop: 'pop', announced: 'announced', arc: 'announced' };

function snapshotComplete(s) {
  if (!s) return { complete: false, missing: ['snapshot-absent'] };
  const missing = [];
  if (s.pantryKcal === null || s.pantryKcal === undefined) missing.push('pantry');
  if (s.waitDurDays === null || s.waitDurDays === undefined) missing.push('waitDur');
  if (!s.seatKind) missing.push('seatKind');
  if (s.stage === null || s.stage === undefined) missing.push('stage');
  return { complete: missing.length === 0, missing };
}
function pickerNativeComplete(s) {
  // Same four fields, but waitDur counts ONLY if a stored field existed.
  // The probe records that on every fire, so this is always incomplete
  // for waitDur — reported as the picker-native gap, not as a snapshot
  // failure of the instrument.
  if (!s) return { complete: false, missing: ['snapshot-absent'] };
  const missing = [];
  if (s.pantryKcal === null || s.pantryKcal === undefined) missing.push('pantry');
  const stored = s.storedWaitingSinceFields || {};
  const anyStored = ['tableWaitingSince', 'waitingSince', 'tableWaitStart', 'firstWaitingDay', 'waitingStarted', 'tableWaitDay', 'tableInvitationDay'].some(k => stored[k] !== null && stored[k] !== undefined);
  if (!anyStored) missing.push('waitDur (no stored field)');
  if (!s.seatKind) missing.push('seatKind');
  if (s.stage === null || s.stage === undefined) missing.push('stage');
  return { complete: missing.length === 0, missing };
}

function analyze(seeds) {
  const missing = [];
  const rows = [];
  for (const seed of seeds) {
    const p = path.join(OUTDIR, `s${seed}.json`);
    if (!fs.existsSync(p)) { missing.push(seed); continue; }
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (r.error) { missing.push(seed); continue; }
    rows.push(r);
  }
  const fires = [];
  for (const r of rows) for (const f of (r.fires || [])) fires.push(Object.assign({ seed: r.seed }, f));
  const countBy = (arr, fn) => { const o = {}; for (const x of arr) { const k = fn(x); o[k] = (o[k] || 0) + 1; } return o; };
  const completeFlags = fires.map(f => snapshotComplete(f.snapshot));
  const pickerFlags = fires.map(f => pickerNativeComplete(f.snapshot));
  const perTemplate = {};
  for (const t of TEMPLATES) {
    const ls = fires.filter(f => f.template === t.id);
    const mentioned = [], gesture = [], unused = [];
    for (const fact of FACTS) {
      const m = (MENTIONS[t.id] || {})[MENTION_FACT[fact]] || 'ignored';
      if (m === 'mentioned') mentioned.push(fact);
      else if (m === 'gesture') gesture.push(fact);
      else unused.push(fact);
    }
    // Readable-but-unused = facts whose mention state is ignored or
    // gesture AND which were actually readable on that template's fires.
    // (All listed facts were readable on every fire — verified below
    // by the per-fire probe counts; gesture facts are still unused as
    // values, since no template states a value.)
    const probeCounts = {};
    for (const fact of FACTS) {
      probeCounts[fact] = ls.filter(f => {
        const s = f.snapshot || {};
        if (fact === 'pantryKcal') return s.pantryKcal !== null && s.pantryKcal !== undefined;
        if (fact === 'waitDurDays') return s.waitDurDays !== null && s.waitDurDays !== undefined;
        if (fact === 'seatKind') return !!s.seatKind;
        if (fact === 'stage') return s.stage !== null && s.stage !== undefined;
        if (fact === 'pelletOnline') return s.pelletOnline !== null && s.pelletOnline !== undefined;
        if (fact === 'nationProdFired') return true; // boolean flag always present (false = not yet fired)
        if (fact === 'overtimeTier') return s.overtimeTier !== null && s.overtimeTier !== undefined;
        if (fact === 'rank') return !!s.rank;
        if (fact === 'pop') return s.pop !== null && s.pop !== undefined;
        if (fact === 'announced') return true;
        if (fact === 'arc') return s.arc !== null && s.arc !== undefined;
        if (fact === 'pantryClass') return !!s.pantryClass && s.pantryClass !== 'unknown';
        return false;
      }).length;
    }
    perTemplate[t.id] = {
      label: t.label, fires: ls.length,
      speakers: countBy(ls, f => f.speaker),
      seatKinds: countBy(ls, f => (f.snapshot || {}).seatKind || 'null'),
      stages: countBy(ls, f => String((f.snapshot || {}).stage)),
      waitDurClasses: countBy(ls, f => (f.snapshot || {}).waitDurClass || 'n/a'),
      pantryClasses: countBy(ls, f => (f.snapshot || {}).pantryClass || 'unknown'),
      pelletOnlineCount: ls.filter(f => f.snapshot && f.snapshot.pelletOnline).length,
      nationProdCount: ls.filter(f => f.snapshot && f.snapshot.nationProdFired).length,
      overtimeTierMax: ls.reduce((m, f) => Math.max(m, (f.snapshot && f.snapshot.overtimeTier) || 0), 0),
      mentioned, gesture, readableButUnused: unused.concat(gesture.map(g => g + ' (gesture-only)')),
      probeCounts,
      lines: ls.map(f => ({ seed: f.seed, day: f.day, speaker: f.speaker, listener: f.listener, text: f.text, snapshot: f.snapshot })),
    };
  }
  const storedFieldEverPresent = fires.some(f => {
    const st = (f.snapshot && f.snapshot.storedWaitingSinceFields) || {};
    return ['tableWaitingSince', 'waitingSince', 'tableWaitStart', 'firstWaitingDay', 'waitingStarted', 'tableWaitDay', 'tableInvitationDay'].some(k => st[k] !== null && st[k] !== undefined);
  });
  const analysis = {
    generated: new Date().toISOString(),
    seedsCovered: rows.map(r => r.seed),
    seedsMissing: missing,
    totalFires: fires.length,
    templateCounts: countBy(fires, f => f.template),
    snapshotCompleteness: {
      complete: completeFlags.filter(x => x.complete).length,
      total: fires.length,
      pct: fires.length ? (completeFlags.filter(x => x.complete).length / fires.length) : 0,
      incompleteFires: fires.map((f, i) => ({ f, missing: completeFlags[i].missing })).filter(x => x.missing.length).map(x => ({ seed: x.f.seed, day: x.f.day, template: x.f.template, missing: x.missing })),
    },
    pickerNativeCompleteness: {
      complete: pickerFlags.filter(x => x.complete).length,
      total: fires.length,
      note: 'waitDur can never be picker-native today: no stored first-waiting-day field exists on any fire.',
    },
    storedWaitingSinceFieldEverPresent: storedFieldEverPresent,
    wrapperInterceptedSeeds: rows.filter(r => r.wrapperIntercepted).map(r => r.seed),
    tableWaitCalls: rows.reduce((a, r) => a + (r.tableWaitCalls || 0), 0),
    tableWaitCallsWaiting: rows.reduce((a, r) => a + (r.tableWaitCallsWaiting || 0), 0),
    perSeed: {},
    perTemplate,
    readability: READABILITY,
    mentions: MENTIONS,
    fires,
  };
  for (const r of rows) {
    const ls = fires.filter(f => f.seed === r.seed);
    analysis.perSeed[r.seed] = {
      days: r.days, endReason: r.endReason, won: r.won, maxRank: r.maxRank,
      finalRank: r.finalRank, waveReach: r.waveReach, deathTotal: r.deathTotal,
      table: r.table, entered: r.entered,
      firstWaitingDay: r.firstWaitingDay, firstWaitingDayWrap: r.firstWaitingDayWrap,
      waitingDays: r.waitingDays, firesideCount: r.firesideCount, firesCount: ls.length,
      templateCounts: countBy(ls, f => f.template),
      tableWaitCalls: r.tableWaitCalls, tableWaitCallsWaiting: r.tableWaitCallsWaiting,
      markers: r.markers,
    };
  }
  return analysis;
}

function printReport(a) {
  console.log('=== sim-tabletalk-sit-a pick-time snapshot analysis ===');
  console.log(`seeds covered: ${a.seedsCovered.join(',')}  missing: ${a.seedsMissing.length ? a.seedsMissing.join(',') : 'none'}`);
  console.log(`fires: ${a.totalFires}  template counts: ${JSON.stringify(a.templateCounts)}`);
  console.log(`snapshot complete (pantry+waitDur+seatKind+stage): ${a.snapshotCompleteness.complete}/${a.snapshotCompleteness.total} (${Math.round(a.snapshotCompleteness.pct * 100)}%)`);
  console.log(`picker-native complete: ${a.pickerNativeCompleteness.complete}/${a.pickerNativeCompleteness.total} — ${a.pickerNativeCompleteness.note}`);
  console.log(`stored waiting-since field ever present: ${a.storedWaitingSinceFieldEverPresent}`);
  console.log(`tableWaitTalk calls: ${a.tableWaitCalls} total, ${a.tableWaitCallsWaiting} while waiting; intercepted seeds: ${a.wrapperInterceptedSeeds.join(',')}`);
  console.log('--- per-template gap ---');
  for (const t of TEMPLATES) {
    const g = a.perTemplate[t.id];
    console.log(`  ${t.id} (${g.fires} fires): mentioned=[${g.mentioned.join(',') || 'none'}] gesture=[${g.gesture.join(',') || 'none'}] readable-but-unused=[${g.readableButUnused.join(', ')}]`);
    console.log(`      seats=${JSON.stringify(g.seatKinds)} stages=${JSON.stringify(g.stages)} waitDur=${JSON.stringify(g.waitDurClasses)} pantry=${JSON.stringify(g.pantryClasses)} pelletOnline=${g.pelletOnlineCount}/${g.fires} nationProd=${g.nationProdCount}/${g.fires} overtimeTierMax=${g.overtimeTierMax}`);
  }
  console.log('--- per seed ---');
  for (const seed of Object.keys(a.perSeed).sort()) {
    const s = a.perSeed[seed];
    console.log(`  ${seed}: ${s.days}d ${s.endReason} won=${s.won ? 1 : 0} rank ${s.maxRank}/${s.finalRank} wave=${s.waveReach} deaths=${s.deathTotal} table=${s.table ? 1 : 0} entered=${s.entered ? 1 : 0} firstWait=${s.firstWaitingDay} (wrap ${s.firstWaitingDayWrap}) waitDays=${s.waitingDays} fires=${s.firesCount} templates=${JSON.stringify(s.templateCounts)}`);
  }
}

function main() {
  let seeds = SEEDS;
  const si = process.argv.indexOf('--seed');
  if (si >= 0) seeds = [parseInt(process.argv[si + 1], 10)].filter(Number.isFinite);
  const a = analyze(seeds);
  fs.writeFileSync(path.join(OUTDIR, 'analysis.json'), JSON.stringify(a, null, 1) + '\n');
  printReport(a);
  if (a.seedsMissing.length) {
    console.error('TABLETALK-SIT ANALYSIS COVERAGE MISS (not a zero): ' + a.seedsMissing.join(','));
    process.exit(1);
  }
  const waitingSeeds = seeds.filter(s => (a.perSeed[s] || {}).table);
  const notIntercepted = waitingSeeds.filter(s => !a.wrapperInterceptedSeeds.includes(s));
  if (notIntercepted.length) {
    console.error('TABLETALK-SIT ANALYSIS INTERCEPTION MISS: tableWaitTalk wrapper never ran on waiting seeds: ' + notIntercepted.join(','));
    process.exit(1);
  }
  console.log('TABLETALK-SIT ANALYSIS PASS: all requested seeds harvested, wrapper intercepted on all waiting seeds.');
}
if (require.main === module) main();
module.exports = { analyze, classify: null, TEMPLATES, MENTIONS, READABILITY, printReport };
