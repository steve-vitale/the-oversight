#!/usr/bin/env node
// sweep-medicdiag-a.js — MEDIC CENSUS recorder (measurement only)
// (sim-medicdiag-a, 2026-11-07, oversight-flesh-out-loop run
// fleshout-20261108T0015Z, Loop A, axis food-economy. The fever anatomy
// (sim-feveranat-a) proved healer presence is the strongest survival
// signal in the corpus (3 deaths in 87 healer-present episodes vs 20 in
// 80 absent) but could not say WHO the healer was — its snapshots record
// only a boolean healerPresent plus a roster-wide medicCount, and the
// scholar counts as a healer whenever they hold a healing ability. This
// recorder re-runs the SAME 8 seeds under the SAME competent policy and
// records, per day, the medic detail the feveranat recorder lacked: every
// roster medic's occupation, Haven-vs-field place, availability, and
// npcHasAbility holdings for triage / herbal_remedy / field_medicine, plus
// whether the Haven healer is the scholar or a village medic. DIAG ONLY:
// zero src/js, no lever, no default flip.
//
// DESIGN (declared, not duplicated): this is a COMPACT recorder, not a
// copy of sweep-feveranat-a.js. It shares only the harness pattern
// (loadGame/setupGame/runDays, competent FIXED, env FATAL-asserted,
// registerDeath CALLS THROUGH, writeRobust fresh-child writer, stdout to
// the caller's pipe) and the fingerprint construction, so its fingerprints
// must equal the feveranat bare fingerprints seed-for-seed — that equality
// is the proof the trajectories are identical and the medicDetail joins
// the feveranat corpus day-by-day. The feveranat event wrappers (onsets,
// ends, treats, diagnoses, cures, flows, meals) are NOT re-implemented:
// the census reads them from the feveranat corpus itself.
'use strict';
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  // Env discipline is enforced for the CLI run (require.main === module);
  // the proof test requires this module in-process with env set by the test.
  if (require.main === module) {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
}
const BARE = process.env.MEDICDIAG_BARE === '1';
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [96301, 96302, 96303, 96304, 96305, 96306, 96307, 96308];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'medicdiag-a-corpus', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'medicdiag-a-corpus');

const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;
const HOLD_IDS = ['triage', 'herbal_remedy', 'field_medicine'];

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// Writes go through a FRESH child process per attempt. Host EPERM-flap
// denial is STICKY per process once a write fails (2026-11-07: an in-process
// retry loop failed 300/300 over ~10 min while fresh processes wrote 1.5MB
// files 5/5 in the same minute). Retrying in-process is futile; each child
// reads the payload from stdin (a pipe, never a filesystem write), writes +
// readback-verifies + renames, and exits 0/1/3.
const CHILD_WRITER = `
// NOTE: with node -e, argv has NO script filename: args are argv[1]/argv[2].
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

async function oneRun(seed, days, opts) {
  const bare = !!(opts && opts.bare);
  const { Game } = await loadGame({ seed, mode: 'medicdiag-a-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), medicDays: [] };
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
  // Fever helpers bound to this run's Game (all pure reads; no RNG, no writes).
  const npcName = (vid) => {
    try { const p = Game.getPerson && Game.getPerson(vid); if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
    return 'Someone';
  };

  // --- deaths: CALL-THROUGH capture (kept even in BARE mode: the documented
  // exception — it performs no Game-state writes and consumes no RNG, it only
  // appends to the external W array, so it cannot change the trajectory) ---
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
          let whoName = who.slice(0, 24);
          try {
            const nm = Game.npcName && Game.npcName(who);
            if (nm && nm !== 'Someone') whoName = String(nm).slice(0, 24);
          } catch (e) {}
          W.deaths.push({ day, who: who.slice(0, 24), whoName, kind, cause,
            isPlayer: whoId ? (whoId === Game.villagerId) : false });
        }
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
      const sick = v.sick || {};
      // Physical camp groups: Haven residents vs the travelling field camp.
      // Away residents are in neither — they cannot lend hands anywhere.
      let havenSet = new Set(), fieldSet = new Set();
      try { havenSet = new Set(G.campPeopleIds ? (G.campPeopleIds('haven') || []) : []); } catch (e) {}
      try { fieldSet = new Set(G.campPeopleIds ? (G.campPeopleIds('here') || []) : []); } catch (e) {}
      let healerId = null;
      try { healerId = G.campHealerId ? G.campHealerId('haven') : null; } catch (e) {}
      const medics = [];
      for (const id of roster) {
        if (id === G.villagerId) continue;
        let p = null;
        try { p = G.getPerson(id); } catch (e) {}
        if (!p) continue;
        const occ = String(p.formerOccupation || '');
        if (!MED_OCC.test(occ.toLowerCase())) continue;
        const rec = sick[id] || null;
        const sev = rec ? (rec.severity || 1) : 0;
        const holds = {};
        for (const hid of HOLD_IDS) {
          try { holds[hid] = !!(G.npcHasAbility && G.npcHasAbility(id, hid)); } catch (e) { holds[hid] = false; }
        }
        const place = havenSet.has(id) ? 'haven' : (fieldSet.has(id) ? 'field' : 'away');
        medics.push({ vid: String(id).slice(0, 24), name: npcName(id), occ: occ.slice(0, 24),
          place, alive: !p.dead, sevSick: sev,
          available: !p.dead && !(sev >= 2), holds });
      }
      const havenMedics = medics.filter(m => m.place === 'haven' && m.alive);
      W.medicDays.push({ day: dayOf(), pop: roster.length,
        sickCountNPC: Object.keys(sick).length,
        healerPresent: healerId != null,
        healerIsScholar: healerId != null && healerId === G.villagerId,
        healerVid: healerId == null ? null : String(healerId).slice(0, 24),
        havenMedicCount: havenMedics.length,
        havenMedicAvailable: havenMedics.filter(m => m.available).length,
        medicCount: medics.filter(m => m.alive && m.available).length,
        medics });
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
    daysAlive: result.days, villageDays: W.medicDays.length,
    deathCauses, deathRows: W.deaths,
    medicDays: W.medicDays, national,
    table: won, win: won,
    waveReach,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave,
    deathRowCount: W.deaths.length, medicDayCount: W.medicDays.length, ms,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly 96301-96308, got: ' + (process.env.SEEDS || '(unset)'));
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
    writeRobust(path.join(PERSEED_DIR, `medicdiag-a-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} medicDays=${diag.medicDayCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // BARE pass (G2 neutrality): same seeds/days/policy, recorders skipped.
  const bareRows = [];
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `medicdiag-a-bare-s${seed}.json`),
      JSON.stringify(fingerprint));
    console.log(`bare seed=${seed} days=${fingerprint.daysAlive} end=${fingerprint.endReason} deaths=${Object.values(fingerprint.deathCauses).reduce((a, b) => a + b, 0)}`);
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

module.exports = { oneRun, BATCH, DAYS, writeRobust };
