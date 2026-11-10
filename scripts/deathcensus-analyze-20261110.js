// scripts/deathcensus-analyze-20261110.js — journey-scale r125 Q1–Q3.
// The survival-attribution comparison: Arm A (r123's published band,
// WITH wideduty) vs Arm B (this run's band on the reverted base,
// WITHOUT wideduty), plus the death-cause census tables for both.
//
// Arm A is read from r123's evidence — NO live sim:
//   journey-scale-r123-trust-<seed>.json  (census.deathLog: the full
//   registerDeath stream — TELEMETRY_FULL=1 in sims, verified rows
//   span d4–end on all four seeds)
//   journey-scale-r123-capture-<seed>.txt (cure lines "is on the mend")
//   journey-scale-r123-wildfights-<seed>.txt (field-fight outcomes)
//   journey-scale-r123-hungerwatch-<seed>.txt (pantry/hungryDays)
// Arm B is read from r125's deathcensus corpora:
//   journey-scale-r125-deathcensus-<seed>.json (instrument finalize)
//   + the same capture/wildfights/hungerwatch shapes.
//
// CLASSIFICATION (the honest part): a deathLog row's `who` is either
// a creature id (monsters.json ∪ animals.json — 180 ids, disjoint)
// or a villager id. `who` in the creature set → creature death
// (a villager killed it). Otherwise → person death with the row's
// cause. A row is AMBIGUOUS — printed verbatim, never silently
// bucketed — when the two signals disagree: a creature-id `who`
// with a person cause, or a person-id `who` with a creature-kill
// cause ('villager combat' / 'combat' / 'expedition').
// Cause buckets (person deaths only): field-fight ('the wild',
// 'monster', 'ambush', 'the night', or a cause naming a creature
// id — 'Gavel'), contest ('contest', 'the arena', 'betrayal',
// 'the table trial', 'the coalition arena'), fever ('sickness',
// /fever/i, or a disease id), wound ("a wound that wouldn't
// close"), thirst ('thirst'), alien ('alien', 'alien_beam',
// 'a stranger'), phoenix ('the phoenix link …'), other (verbatim).
//
// Usage:
//   node scripts/deathcensus-analyze-20261110.js [--arm-a-dir <dir>]
//       [--arm-b-dir <dir>]
//   Defaults: Arm A = evidence/2026-11-09/journey-scale-r123,
//   Arm B = evidence/2026-11-10/journey-scale-r125
//   Exit 0 with tables on stdout; exit 2 on a read error.
//   Also required by scripts/test-deathcensus-20261110.js for the
//   classifier (module.exports).
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEEDS = [97901, 97902, 97903, 97904];

function loadIdSet(file) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', file), 'utf8'));
  const arr = Array.isArray(d) ? d : (d.monsters || d.animals || []);
  return new Set(arr.map(x => x && x.id).filter(Boolean));
}
function creatureIds() {
  // + the one code-defined monster id (sigW3c.js:360 — the Sponsor-
  // creature is built in code, not in monsters.json; without it the
  // five r123 'ad_sponsor' rows classify as ambiguous people).
  return new Set([...loadIdSet('monsters.json'), ...loadIdSet('animals.json'), 'ad_sponsor']);
}

const CREATURE_KILL_CAUSES = new Set(['villager combat', 'combat', 'expedition']);
const FIELD_FIGHT_CAUSES = new Set(['the wild', 'monster', 'ambush', 'the night', 'combat']);
// 'combat' is the fight-death default (game.js:39658 registerDeath +
// corpses.js:238 `opts.cause || 'combat'`): a person row with cause
// 'combat' died in a fight. bucketCause runs for person rows only,
// so this cannot mislabel a creature-kill (those go through
// CREATURE_KILL_CAUSES in classifyRow).
const CONTEST_CAUSES = new Set(['contest', 'the arena', 'betrayal', 'the table trial', 'the coalition arena']);
const ALIEN_CAUSES = new Set(['alien', 'alien_beam', 'a stranger']);

function bucketCause(cause, creatureSet) {
  if (cause == null || cause === '') return 'other:(none)';
  const c = String(cause);
  if (FIELD_FIGHT_CAUSES.has(c)) return 'field-fight';
  if (CONTEST_CAUSES.has(c)) return 'contest';
  // Sickness-path causes (villageSicknessTick → hurtVillager): the
  // generic label, the disease id (villagerDiseaseId: wound_fever,
  // gutrot, disease, radiation_sickness), or the food-poisoning name
  // (sickCause falls back to s.name: 'food poisoning (…)', 'bad
  // belly', 'spoiled gut', 'poisoned (…)' ). All are fever deaths
  // for the Q3 mechanism question; the raw string stays on the row.
  if (c === 'sickness' || /fever/i.test(c)
    || c === 'wound_fever' || c === 'gutrot' || c === 'disease' || c === 'radiation_sickness'
    || /food poisoning|bad belly|spoiled gut|poisoned/i.test(c)) return 'fever';
  if (c === "a wound that wouldn't close") return 'wound';
  if (c === 'thirst') return 'thirst';
  if (ALIEN_CAUSES.has(c)) return 'alien';
  if (c.indexOf('the phoenix link') === 0) return 'phoenix';
  if (c === 'schism') return 'schism';
  if (c === 'hunting' || c === 'injuries') return 'other:' + c;
  if (creatureSet && creatureSet.has(c.toLowerCase())) return 'field-fight'; // killer named as the cause ('Gavel')
  return 'other:' + c;
}

// Classify one death row {who, cause, day, player?}.
// Returns {kind: 'person'|'creature'|'ambiguous', bucket, row}.
function classifyRow(row, creatureSet) {
  const who = row.who == null ? null : String(row.who);
  const cause = row.cause == null ? null : String(row.cause);
  const isCreatureWho = who != null && creatureSet.has(who);
  const isCreatureCause = cause != null && CREATURE_KILL_CAUSES.has(cause);
  if (isCreatureWho && !isCreatureCause) return { kind: 'creature', bucket: 'creature-kill', row };
  if (isCreatureWho && isCreatureCause) return { kind: 'creature', bucket: 'creature-kill', row };
  if (!isCreatureWho && isCreatureCause) return { kind: 'ambiguous', bucket: 'ambiguous', row };
  if (!isCreatureWho) return { kind: 'person', bucket: bucketCause(cause, creatureSet), row };
  return { kind: 'ambiguous', bucket: 'ambiguous', row };
}

function countCures(capturePath) {
  // DUTY CURES — the medic-duty holder curing a sick villager aloud:
  // "Herbal remedy on X: … (Duc cured them…)" / "Field medicine on X: …".
  // (r123's note counted these — 97902: 22, 97903: 24 by this rule.)
  // NOT the hide-curing lines ("Scrape it, cure it…") and NOT the
  // natural-recovery "is on the mend" lines (counted separately as
  // mends — the sickness tick's own recovery narration).
  try {
    const txt = fs.readFileSync(capturePath, 'utf8');
    const c = txt.match(/Herbal remedy on|Field medicine on/g);
    const m = txt.match(/is on the mend/g);
    return { cures: c ? c.length : 0, mends: m ? m.length : 0 };
  } catch (e) { return { cures: null, mends: null }; }
}

function analyzeArmA(dir) {
  const creatureSet = creatureIds();
  const perSeed = {};
  for (const seed of SEEDS) {
    const trust = JSON.parse(fs.readFileSync(path.join(dir, `journey-scale-r123-trust-${seed}.json`), 'utf8'));
    const c = trust.census || {};
    const rows = (c.deathLog || []).map(r => ({ who: r.who, cause: r.cause, day: r.day, player: !!r.player }));
    const classified = rows.map(r => classifyRow(r, creatureSet));
    const person = classified.filter(x => x.kind === 'person');
    const creature = classified.filter(x => x.kind === 'creature');
    const ambiguous = classified.filter(x => x.kind === 'ambiguous');
    const byBucket = {};
    for (const p of person) byBucket[p.bucket] = (byBucket[p.bucket] || 0) + 1;
    const byDay = {};
    for (const p of person) byDay[p.row.day] = (byDay[p.row.day] || 0) + 1;
    const multi = Object.keys(byDay).map(k => ({ day: +k, deaths: byDay[k] })).filter(x => x.deaths >= 3).sort((a, b) => a.day - b.day);
    const cureCounts = countCures(path.join(dir, `journey-scale-r123-capture-${seed}.txt`));
    perSeed[seed] = {
      seed, livedDays: c.day, popAlive: c.popAlive, popTotal: c.popTotal,
      horizonAlive: (c.day || 0) > 140, // still simulating at the leg horizon (day 140)
      personDeaths: person.length, creatureDeaths: creature.length,
      ambiguous: ambiguous.map(a => a.row),
      bearerDeaths: person.filter(p => p.row.player).length,
      byBucket, multiDeathDays: multi,
      cures: cureCounts.cures, mends: cureCounts.mends,
      deathRows: rows.length,
    };
  }
  return { arm: 'A (r123, WITH wideduty)', perSeed };
}

function analyzeArmB(dir) {
  const creatureSet = creatureIds();
  const perSeed = {};
  for (const seed of SEEDS) {
    const dc = JSON.parse(fs.readFileSync(path.join(dir, `journey-scale-r125-deathcensus-${seed}.json`), 'utf8'));
    const s = dc.summary || {};
    const person = (dc.deaths || []).map(d => ({
      who: d.vid, cause: d.cause, day: d.day, player: false,
      // A named monster on the row (monsterId/monsterName) means a
      // monster killed them even when the cause string is the
      // monster's per-fight display name ('Old Loud' for the Gavel).
      bucket: (d.monsterId || d.monsterName) ? 'field-fight' : bucketCause(d.cause, creatureSet),
    }));
    const byBucket = {};
    for (const p of person) byBucket[p.bucket] = (byBucket[p.bucket] || 0) + 1;
    const daily = dc.daily || [];
    const dutyDays = daily.filter(d => d.dutyHolder != null).length;
    const healerDays = daily.filter(d => d.healerId != null).length;
    const sickDays = daily.reduce((t, d) => t + (d.sickCount || 0), 0);
    const cureCountsB = countCures(path.join(dir, `journey-scale-r125-capture-${seed}.txt`));
    // livedDays: the trust census end day, the SAME definition Arm A
    // uses (r123's published 488) — the last daily row can sit a day
    // early when the final deaths land in the post-run drain.
    let trustDay = null;
    try { const t = JSON.parse(fs.readFileSync(path.join(dir, `journey-scale-r125-trust-${seed}.json`), 'utf8')); trustDay = (t.census || {}).day; } catch (e) { trustDay = null; }
    const livedDays = (trustDay != null) ? trustDay : (daily.length ? daily[daily.length - 1].day : null);
    perSeed[seed] = {
      seed,
      livedDays,
      horizonAlive: (livedDays || 0) > 140, // still simulating at the leg horizon (day 140)
      popAlive: daily.length ? daily[daily.length - 1].alive : null,
      personDeaths: person.length,
      creatureDeaths: s.teleMonster != null ? s.teleMonster : null,
      ambiguous: [],
      bearerDeaths: null, // bearer deaths need the scholar-vid join; reported separately below if present
      byBucket, multiDeathDays: s.multiDeathDays || [],
      cures: cureCountsB.cures, mends: cureCountsB.mends,
      deathRows: (dc.deaths || []).length,
      dutyDays, healerDays, sickDays,
      booksClose: s.booksClose, unattributed: s.unattributed,
      telePerson: s.telePerson, telePersonHaven: s.telePersonHaven,
      teleOnly: s.teleOnly, fallenOnly: s.fallenOnly,
      rosteredDeaths: s.rosteredDeaths, guestDeaths: s.guestDeaths,
      joins: s.joins, leavers: s.leavers,
      errors: (dc.errors || []).length,
    };
  }
  return { arm: 'B (r125, WITHOUT wideduty)', perSeed };
}

function bandTotals(perSeed) {
  const t = { livedDays: 0, alive: 0, personDeaths: 0, byBucket: {}, cures: 0, mends: 0 };
  for (const seed of SEEDS) {
    const s = perSeed[seed];
    t.livedDays += (s.livedDays || 0);
    // Q1's "alive" is alive AT THE HORIZON (day 140), not alive at
    // the last snapshot — a village that ends at d114 with 4 people
    // standing at its last snapshot was not alive at d140.
    t.alive += s.horizonAlive ? 1 : 0;
    t.personDeaths += (s.personDeaths || 0);
    for (const k of Object.keys(s.byBucket || {})) t.byBucket[k] = (t.byBucket[k] || 0) + (s.byBucket[k] || 0);
    t.cures += (s.cures || 0);
    t.mends += (s.mends || 0);
  }
  return t;
}

function printArm(a) {
  console.log(`\n===== ${a.arm} =====`);
  console.log('seed  lived  aliveEnd  personDeaths  bearerDeaths  cures  buckets');
  for (const seed of SEEDS) {
    const s = a.perSeed[seed];
    console.log(`${seed}  ${String(s.livedDays).padStart(5)}  ${String(s.popAlive).padStart(5)}  ${String(s.personDeaths).padStart(12)}  ${String(s.bearerDeaths == null ? '-' : s.bearerDeaths).padStart(12)}  ${String(s.cures == null ? '-' : s.cures).padStart(5)}  ${JSON.stringify(s.byBucket)}`);    if (s.multiDeathDays && s.multiDeathDays.length) console.log(`      multi-death days: ${s.multiDeathDays.map(m => 'd' + m.day + 'x' + m.deaths).join(', ')}`);
    if (s.ambiguous && s.ambiguous.length) console.log(`      AMBIGUOUS rows: ${JSON.stringify(s.ambiguous)}`);
    if (s.booksClose === false) console.log(`      RECONCILIATION FAILED (booksClose=false, unattributed=${s.unattributed}, errors=${s.errors})`);
    if (s.dutyDays != null) console.log(`      duty-held days=${s.dutyDays} healer-present days=${s.healerDays} sick-days=${s.sickDays} joins=${s.joins} leavers=${s.leavers} telePerson=${s.telePerson}`);
  }
  const t = bandTotals(a.perSeed);
  console.log(`BAND  lived=${t.livedDays} aliveAtHorizon=${t.alive}/4 personDeaths=${t.personDeaths} cures=${t.cures} buckets=${JSON.stringify(t.byBucket)}`);
  return t;
}

function main() {
  const args = process.argv.slice(2);
  const opt = (name, def) => { const i = args.indexOf(name); return (i >= 0 && args[i + 1]) ? args[i + 1] : def; };
  const dirA = opt('--arm-a-dir', path.join(ROOT, 'evidence', '2026-11-09', 'journey-scale-r123'));
  const dirB = opt('--arm-b-dir', path.join(ROOT, 'evidence', '2026-11-10', 'journey-scale-r125'));
  let a = null, b = null;
  try { a = analyzeArmA(dirA); } catch (e) { console.error('ARM A READ ERROR: ' + (e && e.message)); process.exitCode = 2; }
  try { b = analyzeArmB(dirB); } catch (e) { console.error('ARM B READ ERROR (band may be incomplete): ' + (e && e.message)); process.exitCode = 2; }
  let ta = null, tb = null;
  if (a) ta = printArm(a);
  if (b) tb = printArm(b);
  if (ta && tb) {
    console.log('\n===== Q1 ATTRIBUTION (binding bars) =====');
    console.log(`lived days: A=${ta.livedDays} B=${tb.livedDays} delta=${tb.livedDays - ta.livedDays} (bar: B>=548 AND >=1 alive => IMPLICATED; B<=488 AND 0 alive => EXONERATED; else INCONCLUSIVE)`);
    console.log(`alive at horizon (d140): A=${ta.alive}/4 B=${tb.alive}/4`);
    console.log(`person deaths: A=${ta.personDeaths} B=${tb.personDeaths}`);
    console.log(`fever+wound deaths: A=${(ta.byBucket.fever || 0) + (ta.byBucket.wound || 0)} B=${(tb.byBucket.fever || 0) + (tb.byBucket.wound || 0)}`);
    console.log(`field-fight deaths: A=${ta.byBucket['field-fight'] || 0} B=${tb.byBucket['field-fight'] || 0}`);
    console.log(`cures: A=${ta.cures} B=${tb.cures}`);
    const verdict = (tb.livedDays >= 548 && tb.alive >= 1) ? 'WIDEDUTY-IMPLICATED'
      : (tb.livedDays <= 488 && tb.alive === 0) ? 'WIDEDUTY-EXONERATED' : 'INCONCLUSIVE';
    console.log(`VERDICT-INPUT: ${verdict}`);
  }
}

if (require.main === module) main();
module.exports = { creatureIds, classifyRow, bucketCause, analyzeArmA, analyzeArmB, bandTotals };
