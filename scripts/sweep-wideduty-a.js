#!/usr/bin/env node
// sweep-wideduty-a.js — WIDEN THE DUTY recorder (measurement only)
// (sim-wideduty-a, 2026-11-09, oversight-flesh-out-loop run
// fleshout-20261109T1015Z, Loop A, axis food-economy, blank #2 from
// sim-medheadcount-a. The DIAG question: how often is the Haven medic
// duty actually HELD, and by whom — occupation-medic only (current
// code) vs the trained population the duty ignores? This recorder
// re-runs the SAME 8 seeds under the SAME competent policy and records,
// per day: the duty holder (Game.medicDutyHolder(), a pure read),
// whether the holder is trained-only (no medical occupation), how many
// roster members WOULD be eligible under the widened predicate
// (occupation OR wound_care/herbal_medicine skill OR
// triage/herbal_remedy/field_medicine ability — all pure reads of the
// npcSkills/npcAbilities stores), the medheadcount headcounts for
// continuity, cumulative duty cures (v.medicDutyCures), deaths by cause,
// and the wall numbers.
//
// DESIGN: compact recorder sharing only the harness pattern of
// sweep-medheadcount-a.js (loadGame/setupGame/runDays, competent FIXED,
// env FATAL-asserted, registerDeath CALLS THROUGH, writeRobust
// fresh-child writer). Fingerprints are built the same way so the
// before leg can be compared seed-for-seed with the medheadcount
// corpus. RECORDER NEUTRALITY: pure reads only — never skillsKnownBy
// (it seeds occupation skills and diverges trajectories; the
// medheadcount recorder-contamination lesson). medicDutyHolder() is a
// pure read (getPerson + campPeopleIds + regex/skill/ability reads).
'use strict';
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  if (require.main === module) {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
}
const BARE = process.env.WIDEDUTY_BARE === '1';
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
// BATCH: the pilot band by default; the confirm band overrides via
// WIDEDUTY_SEEDS (comma list, e.g. 96401..96412 — fresh band named in
// the prereg). SEEDS must equal BATCH exactly (the FATAL below).
const BATCH = (process.env.WIDEDUTY_SEEDS || '96301,96302,96303,96304,96305,96306,96307,96308')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-09', 'wideduty-a-corpus', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-09', 'wideduty-a-corpus');

const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;
const MED_SKILLS = ['wound_care', 'herbal_medicine'];
const MED_ABILS = ['triage', 'herbal_remedy', 'field_medicine'];

// Mirror of the widened eligibility predicate (game.js
// isMedicDutyEligible, sim-wideduty-a): occupation-medic OR medical
// skill OR medical ability. Pure reads only — npcKnowsSkill reads the
// npcSkills store, npcHasAbility reads npcAbilities + the skill lane.
// On the BEFORE leg this counts who WOULD be eligible; on the AFTER
// leg it counts who IS eligible. The game predicate is the authority;
// this mirror exists only so the recorder can count the potential.
function isEligible(G, id) {
  if (!id || id === G.villagerId) return false;
  let p = null;
  try { p = G.getPerson(id); } catch (e) {}
  if (!p || p.dead) return false;
  if (MED_OCC.test(String(p.formerOccupation || '').toLowerCase())) return true;
  try {
    if (G.npcKnowsSkill && (G.npcKnowsSkill(id, 'wound_care') || G.npcKnowsSkill(id, 'herbal_medicine'))) return true;
  } catch (e) {}
  try {
    if (G.npcHasAbility && (G.npcHasAbility(id, 'triage') || G.npcHasAbility(id, 'herbal_remedy') || G.npcHasAbility(id, 'field_medicine'))) return true;
  } catch (e) {}
  return false;
}

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// Fresh-child writer (EPERM-flap discipline, copied from
// sweep-medheadcount-a.js): host write denial is STICKY per process once a
// write fails; each child reads the payload from stdin, writes +
// readback-verifies + renames, and exits 0/1/3.
const CHILD_WRITER = `
const fs = require('fs');
const tmp = process.argv[1], dest = process.argv[2];
let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { data += c; });
process.stdin.on('end', () => {
  try {
    fs.writeFileSync(tmp, data);
    const back = fs.readFileSync(tmp, 'utf8');
    if (back.length !== data.length) process.exit(3);
    fs.renameSync(tmp, dest);
    process.exit(0);
  } catch (e) { process.exit(1); }
});
`;
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 300; i++) {
    const r = child_process.spawnSync(process.execPath,
      ['-e', CHILD_WRITER, tmp, filePath],
      { input: data, encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status === 0) return;
    if (i === 299) { console.error('WRITE FAIL LOUDLY', filePath, 'child status=' + r.status); process.exit(2); }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500 + Math.floor(Math.random() * 2500));
  }
}

function sourceOf(id) {
  id = String(id || '');
  if (id.indexOf('visjoin_') === 0) return 'visitor';
  if (id.indexOf('app_') === 0) return 'application';
  if (id.indexOf('gen_') === 0) return 'spawn';
  if (id.indexOf('bg_') === 0 || id.indexOf('seed_') === 0) return 'background';
  return 'other';
}

async function oneRun(seed, days, opts) {
  const bare = !!(opts && opts.bare);
  const { Game } = await loadGame({ seed, mode: 'wideduty-a-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), days: [], lessons: [], joins: [], medicDeaths: [] };
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
  let prevRoster = new Set();
  let lessonSeen = new Set();
  let spawnRecorded = false;

  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const whoId = String((opts && (opts.villagerId || '')) || '');
        const who = whoId || String((opts && opts.name) || '?');
        const day = dayOf();
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          W.deaths.push({ day, who: who.slice(0, 24), kind, cause,
            isPlayer: whoId ? (whoId === Game.villagerId) : false });
        }
        try {
          const p = Game.getPerson && Game.getPerson(whoId);
          if (p && MED_OCC.test(String(p.formerOccupation || '').toLowerCase())) {
            W.medicDeaths.push({ day, who: who.slice(0, 24),
              occ: String(p.formerOccupation || '').slice(0, 24) });
          }
        } catch (e) {}
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  if (!bare) policy.daily = (G, ctx) => {
    try {
      const v = (G.state || {}).village || {};
      const roster = v.roster || [];
      const day = dayOf();
      const cur = new Set(roster);
      for (const id of cur) {
        if (!prevRoster.has(id)) {
          let occ = '';
          try { const p = G.getPerson && G.getPerson(id); occ = String((p && p.formerOccupation) || ''); } catch (e) {}
          W.joins.push({ day, vid: String(id).slice(0, 24), source: sourceOf(id),
            occ: occ.slice(0, 24), isMedic: MED_OCC.test(occ.toLowerCase()) });
        }
      }
      prevRoster = cur;
      if (!spawnRecorded) {
        spawnRecorded = true;
        W.spawn = { day, pop: roster.length,
          medics: roster.filter(id => {
            try { const p = G.getPerson && G.getPerson(id); return p && MED_OCC.test(String(p.formerOccupation || '').toLowerCase()); } catch (e) { return false; }
          }).length };
      }
      const lessons = (v.skillLessons || []).filter(l => l && MED_SKILLS.indexOf(l.skill) >= 0);
      for (const l of lessons) {
        const k = [l.day, l.teacher, l.learner, l.skill].join('|');
        if (lessonSeen.has(k)) continue;
        lessonSeen.add(k);
        W.lessons.push({ day: l.day, teacher: String(l.teacher || '').slice(0, 24),
          learner: String(l.learner || '').slice(0, 24), skill: l.skill });
      }
      // Per-day duty + headcount snapshot (pure reads only).
      let duty = null;
      try { duty = G.medicDutyHolder ? G.medicDutyHolder() : null; } catch (e) {}
      let dutyTrained = false;
      if (duty) {
        try {
          const p = G.getPerson(duty);
          dutyTrained = !MED_OCC.test(String((p && p.formerOccupation) || '').toLowerCase());
        } catch (e) {}
      }
      const cures = (v.medicDutyCures || { ability: 0, medicine: 0 });
      let medicCount = 0, eligibleCount = 0, wcHolders = 0, hmHolders = 0;
      let triageHolders = 0, triageNonMedic = 0, herbalRemedyHolders = 0, fieldMedHolders = 0;
      for (const id of roster) {
        if (id === G.villagerId) continue;
        let p = null;
        try { p = G.getPerson(id); } catch (e) {}
        if (!p || p.dead) continue;
        const isMedic = MED_OCC.test(String(p.formerOccupation || '').toLowerCase());
        if (isMedic) medicCount++;
        if (isEligible(G, id)) eligibleCount++;
        let knows = [];
        try { knows = (((G.state || {}).village || {}).npcSkills || {})[id] || []; } catch (e) { knows = []; }
        if (knows.indexOf('wound_care') >= 0) wcHolders++;
        if (knows.indexOf('herbal_medicine') >= 0) hmHolders++;
        let hasTriage = false, hasHerbal = false, hasField = false;
        try { hasTriage = !!(G.npcHasAbility && G.npcHasAbility(id, 'triage')); } catch (e) {}
        try { hasHerbal = !!(G.npcHasAbility && G.npcHasAbility(id, 'herbal_remedy')); } catch (e) {}
        try { hasField = !!(G.npcHasAbility && G.npcHasAbility(id, 'field_medicine')); } catch (e) {}
        if (hasTriage) { triageHolders++; if (!isMedic) triageNonMedic++; }
        if (hasHerbal) herbalRemedyHolders++;
        if (hasField) fieldMedHolders++;
      }
      W.days.push({ day, pop: roster.length, medicCount, eligibleCount,
        dutyHeld: duty ? 1 : 0, dutyTrained: dutyTrained ? 1 : 0,
        dutyHolder: duty ? String(duty).slice(0, 24) : null,
        curesAbility: cures.ability || 0, curesMedicine: cures.medicine || 0,
        wcHolders, hmHolders,
        triageHolders, triageNonMedic, herbalRemedyHolders, fieldMedHolders });
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const finalPop = (() => { try { return (((Game.state || {}).village || {}).roster || []).length; } catch (e) { return null; } })();
  const deathKeys = W.deaths.map(d => d.day + '|' + d.who + '|' + d.cause).sort();
  const fingerprint = { seed, daysAlive: result.days, endReason: result.endReason,
    rank, maxWave, national, table: won, win: won,
    deathCauses, deathKeys, finalPop };
  if (bare) return { seed, perSeed: null, diag: null, fingerprint };

  const perSeed = {
    seed, policy: 'competent',
    plentydepri: 1, depositgate: 1,
    daysAlive: result.days, villageDays: W.days.length,
    deathCauses, deathRows: W.deaths,
    spawn: W.spawn || null,
    days: W.days, lessons: W.lessons, joins: W.joins, medicDeaths: W.medicDeaths,
    national, table: won, win: won, waveReach,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave,
    deathRowCount: W.deaths.length, dayCount: W.days.length,
    lessonCount: W.lessons.length, joinCount: W.joins.length, ms,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly ' + BATCH.join(',') + ', got: ' + (process.env.SEEDS || '(unset)'));
    process.exit(2);
  }
  if (DAYS !== 150) {
    console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
    process.exit(2);
  }
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag, fingerprint } = await oneRun(seed, DAYS, { bare: false });
    rows.push({ seed: s, perSeed, diag, fingerprint });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `wideduty-a-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} days=${diag.dayCount} lessons=${diag.lessonCount} joins=${diag.joinCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // Bare fingerprints prove recorder neutrality. The pilot band runs
  // them; the confirm band skips them (WIDEDUTY_NO_BARE=1) — the
  // recorder is the same instrument already proven neutral on the
  // pilot band, and the confirm band is a before/after comparison, not
  // a new instrument.
  const bareRows = [];
  if (process.env.WIDEDUTY_NO_BARE !== '1') {
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `wideduty-a-bare-s${seed}.json`),
      JSON.stringify(fingerprint));
    console.log(`bare seed=${seed} days=${fingerprint.daysAlive} end=${fingerprint.endReason} deaths=${Object.values(fingerprint.deathCauses).reduce((a, b) => a + b, 0)}`);
  }
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  let merged = rows;
  try {
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      const bySeed = new Map();
      for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
      for (const r of rows) bySeed.set(r.seed, r);
      merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
    }
  } catch (e) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a - b);
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged, bare: bareRows }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows, ' + bareRows.length + ' bare)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, BATCH, DAYS, writeRobust, isEligible };
