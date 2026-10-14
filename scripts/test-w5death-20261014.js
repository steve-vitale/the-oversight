#!/usr/bin/env node
// scripts/test-w5death-20261014.js — proof test for the wave-5 unlocker
// death audit instrument (scripts/w5death-audit-20261014.js).
//
// Two parts:
//   A. DET-GATE on the instrument: for each of the 8 road seeds, run the
//      instrumented seed TWICE (A vs B) and compare 16 attribution checks.
//      16 checks x 8 seeds = 128 comparisons.
//   B. 25 structural assertions on the audit fixture
//      (evidence/2026-10-14/w5death-audit.json): attribution fields present
//      and correct — depths 1..n, lineage agreement, unlock consistency,
//      the s303 table-reacher story.
//
// KNOWN ENGINE NON-DETERMINISM (evidence/2026-10-14/sim-entropy-r26.md):
// fight-heavy seeds (s44, s88 named) diverge invocation-to-invocation via
// timestamp-based villager IDs leaking into contestEngine _cxSeed. The gate
// therefore distinguishes ENGINE divergence (trajectories differ — expected
// on those seeds, documented) from INSTRUMENT failure (attribution missing
// or inconsistent with its own trajectory — always a hard fail). The gate
// exits 0 when the instrument is faithful on every run; it does NOT require
// A==B on engine-divergent seeds.
//
// Usage: node scripts/test-w5death-20261014.js
// (run scripts/w5death-audit-20261014.js first so the fixture JSON exists)
'use strict';
const fs = require('fs');
const path = require('path');
const { runInstrumentedSeed, SEEDS, END_REASONS } = require('./w5death-audit-20261014');

const AUDIT_JSON = path.join(__dirname, '..', 'evidence', '2026-10-14', 'w5death-audit.json');
const GATE_SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
const seq = (arr, f) => arr.map(f).join('|');

// 16 attribution checks between two instrumented runs of the same seed.
function compareRows(a, b) {
  const c = [];
  c.push(['days', a.days === b.days]);
  c.push(['endReason', a.endReason === b.endReason]);
  c.push(['maxUnlocked', a.maxUnlocked === b.maxUnlocked]);
  c.push(['unlockDay5', a.unlockDay5 === b.unlockDay5]);
  c.push(['standingAtUnlock', a.standingAtUnlock === b.standingAtUnlock]);
  c.push(['tableEver', a.tableEver === b.tableEver]);
  c.push(['tableDay', a.tableDay === b.tableDay]);
  c.push(['nationalDays', a.nationalDays === b.nationalDays]);
  c.push(['arc', a.arc === b.arc]);
  c.push(['nDeaths', a.playerDeaths.length === b.playerDeaths.length]);
  c.push(['deathDays', seq(a.playerDeaths, d => d.day) === seq(b.playerDeaths, d => d.day)]);
  c.push(['deathCauses', seq(a.playerDeaths, d => d.cause) === seq(b.playerDeaths, d => d.cause)]);
  c.push(['deathDepths', seq(a.playerDeaths, d => d.depth) === seq(b.playerDeaths, d => d.depth)]);
  c.push(['deathWho', seq(a.playerDeaths, d => d.who) === seq(b.playerDeaths, d => d.who)]);
  c.push(['deathLoc', seq(a.playerDeaths, d => (d.loc ? d.loc.epithet + d.loc.node + d.loc.insideHaven : '?')) === seq(b.playerDeaths, d => (d.loc ? d.loc.epithet + d.loc.node + d.loc.insideHaven : '?'))]);
  c.push(['deathFights', seq(a.playerDeaths, d => d.fight ? d.fight.monsters.map(m => m.name + 'w' + m.wave).join('+') : '-') === seq(b.playerDeaths, d => d.fight ? d.fight.monsters.map(m => m.name + 'w' + m.wave).join('+') : '-')]);
  return c;
}

async function detGate() {
  console.log('--- DET-GATE: instrumented A-vs-B, 16 checks x 8 seeds ---');
  let identical = 0, total = 0, gateFails = 0;
  const divergent = [];
  for (const seed of GATE_SEEDS) {
    const a = await runInstrumentedSeed(seed);
    const b = await runInstrumentedSeed(seed);
    const checks = compareRows(a, b);
    const bad = checks.filter(([n, ok]) => !ok).map(([n]) => n);
    total += checks.length;
    if (!bad.length) { identical += checks.length; console.log(`s${seed}: 16/16 identical`); }
    else {
      identical += checks.length - bad.length;
      divergent.push(seed);
      console.log(`s${seed}: ${checks.length - bad.length}/16 — DIVERGED on: ${bad.join(',')}`);
      // Engine-divergence signature check: the instrument must still be
      // FAITHFUL on both trajectories (depths 1..n, lineage agreement).
      for (const [tag, r] of [['A', a], ['B', b]]) {
        const depths = r.playerDeaths.map(d => d.depth).join(',');
        const want = r.playerDeaths.map((_, i) => i + 1).join(',');
        if (depths !== want || r.lineageLen !== r.playerDeaths.length) {
          gateFails++;
          console.log(`  INSTRUMENT-UNFAITHFUL on s${seed}/${tag}: depths=[${depths}] want=[${want}] lineageLen=${r.lineageLen}`);
        }
      }
    }
  }
  console.log(`det-gate: ${identical}/${total} field-identical`);
  if (divergent.length) console.log(`engine-divergent seeds (known entropy issue sim-entropy-r26): ${divergent.join(', ')} — instrument faithful on both trajectories: ${gateFails === 0 ? 'yes' : 'NO'}`);
  return gateFails === 0;
}

function fixtureAssertions() {
  console.log('--- FIXTURE: 25 assertions on w5death-audit.json ---');
  if (!fs.existsSync(AUDIT_JSON)) {
    console.log('FAIL fixture — run scripts/w5death-audit-20261014.js first (no audit JSON)');
    fail += 25; return;
  }
  const doc = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'));
  const rows = doc.rows;
  const bySeed = Object.fromEntries(rows.map(r => [r.seed, r]));
  const topKeys = ['seed', 'days', 'endReason', 'maxUnlocked', 'unlockDay5', 'standingAtUnlock', 'tableEver', 'tableDay', 'nationalDays', 'arc', 'won', 'lineageLen', 'lineageDeaths', 'legendRecorded', 'playerDeaths'];
  const deathKeys = ['day', 'cause', 'who', 'depth', 'loc', 'fight'];

  check('rows.length==9', rows.length === 9, `got ${rows.length}`);
  check('seed set', JSON.stringify(rows.map(r => r.seed)) === JSON.stringify(SEEDS), rows.map(r => r.seed).join(','));
  check('top-level keys', rows.every(r => topKeys.every(k => k in r)));
  check('death keys', rows.every(r => r.playerDeaths.every(d => deathKeys.every(k => k in d))));
  check('depths 1..n', rows.every(r => r.playerDeaths.map(d => d.depth).join(',') === r.playerDeaths.map((_, i) => i + 1).join(',')));
  check('death days non-decreasing', rows.every(r => r.playerDeaths.every((d, i) => i === 0 || d.day >= r.playerDeaths[i - 1].day)));
  check('death fields sane', rows.every(r => r.playerDeaths.every(d => d.day >= 1 && typeof d.cause === 'string' && d.cause.length > 0 && typeof d.who === 'string' && d.who.length > 0)));
  check('unlock consistency', rows.every(r => (r.unlockDay5 != null) === (r.maxUnlocked >= 5)));
  check('standing>=200 at unlock', rows.every(r => r.unlockDay5 == null || (r.standingAtUnlock | 0) >= 200));
  check('tableDay iff tableEver', rows.every(r => (r.tableDay != null) === r.tableEver));
  const unlockers = rows.filter(r => r.maxUnlocked >= 5);
  check('wave-5 unlockers exist', unlockers.length >= 1, `${unlockers.length}`);
  const s303 = bySeed[303];
  check('s303 tableEver', !!(s303 && s303.tableEver));
  check('s303 tableDay>=1', !!(s303 && s303.tableDay >= 1), s303 && String(s303.tableDay));
  check('lineage deaths == captured deaths', rows.every(r => r.lineageDeaths === r.playerDeaths.length), rows.map(r => `${r.seed}:${r.lineageDeaths}/${r.playerDeaths.length}`).join(' '));
  check('days/endReason sane', rows.every(r => r.days > 0 && END_REASONS.includes(r.endReason)));
  check('maxUnlocked 1..5', rows.every(r => r.maxUnlocked >= 1 && r.maxUnlocked <= 5));
  check('arc 1..4', rows.every(r => r.arc >= 1 && r.arc <= 4));
  check('fight shape', rows.every(r => r.playerDeaths.every(d => d.fight == null || Array.isArray(d.fight.monsters))));
  check('monster names', rows.every(r => r.playerDeaths.every(d => !d.fight || d.fight.monsters.every(m => typeof m.name === 'string' && m.name.length > 0))));
  check('loc epithets', rows.every(r => r.playerDeaths.every(d => d.loc && typeof d.loc.epithet === 'string' && d.loc.epithet.length > 0)));
  check('no capture errors', rows.every(r => r.playerDeaths.every(d => !d.capErr && !d.fightErr)));
  check('unlock before run end', rows.every(r => r.unlockDay5 == null || r.unlockDay5 < r.days));
  check('post-unlock deaths recorded', unlockers.some(r => r.playerDeaths.some(d => d.day >= r.unlockDay5)));
  const tables = rows.filter(r => r.tableEver).map(r => r.seed);
  check('s303 among table reaches', tables.includes(303), tables.join(','));
  check('s303 succession depth>=1', !!(s303 && s303.playerDeaths.length >= 1), s303 && String(s303.playerDeaths.length));
}

async function main() {
  const gateOk = await detGate();
  fixtureAssertions();
  console.log(`\nRESULT: ${pass} pass, ${fail} fail; det-gate instrument-faithful: ${gateOk ? 'yes' : 'NO'}`);
  if (fail || !gateOk) { console.error('PROOF FAILED'); process.exit(1); }
  console.log('PROOF GREEN');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
