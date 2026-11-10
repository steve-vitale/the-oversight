#!/usr/bin/env node
// medcure-ev-driver-20261110.js — DISEASE / MEDIC-CURE re-measure recorder
// WITH EVENT CAPTURE (sim-medcure-ev-b, 2026-11-10,
// oversight-flesh-out-loop-b run fleshout-loop-b-20261110T2046Z, Loop B,
// winnability chain. Coverage Program Tier 1 #4.)
//
// WHY THIS FILE EXISTS: sim-medcure-b (1930Z) went instrument NO-GO on G2 —
// 79/82 duty-cure events had no episode to join, 0/14 wound-fever cures
// joined — because villageSicknessTick() runs inside endDay() <- sleep(),
// AFTER the day's policy.daily snapshot, and onset then villagerCareTick
// -> medicDutyCureAttempt happen in the same tick. A villager who contracts
// wound fever and is cured in the same tick never appears in any daily
// snapshot. This driver adds TICK-PHASE EVENT CAPTURE: call-through
// wrappers on villageSicknessTick (preTick/postTick snapshots) and
// villagerCareTick (preCare/postCare snapshots) of v.sick, so same-tick
// onset+cure episodes exist in the record. The pre-care snapshot sees
// EVERY record alive at cure time (the care tick's only deletion is the
// duty cure; tending only decrements daysLeft), and the pre-tick snapshot
// sees every record alive at progression time (same-tick onset+death via
// sickness damage is impossible — progression precedes onset in the tick).
// DIAG + MEASUREMENT: zero src/js; the recorder itself is the instrument.
//
// DESIGN (declared, not duplicated): this is the medcure-b driver
// (scripts/medcure-driver-20261110.js) plus the two tick wrappers and the
// tickEvents stream. Everything else is unchanged: the daily snapshot
// (sickMap, pharmacy direct read), death capture via the registerDeath
// call-through, duty-cure events via the medicDutyCureAttempt call-through
// (channel read off the v.medicDutyCures counter diff), the Game.say
// sample, the BARE neutrality pass, the fresh-child writeRobust writer,
// stdout to the caller's pipe. The wrappers share the documented
// exception of the existing ones: pure reads + external appends only, no
// Game-state writes, no RNG — so they cannot change the trajectory (G3
// proves it on all 8 seeds).
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
const BARE = process.env.MEDCURE_BARE === '1';
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [160501, 160502, 160503, 160504, 160505, 160506, 160507, 160508];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-10', 'medcure-ev-b-corpus', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-10', 'medcure-ev-b-corpus');

const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;

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
  const { Game } = await loadGame({ seed, mode: 'medcure-ev-b-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), dayRows: [], tickEvents: [],
    cureEvents: [], sayLines: [], instrumentErrors: [], lastSnapshotDay: 0 };
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
  // Helpers bound to this run's Game (all pure reads; no RNG, no writes).
  const npcName = (vid) => {
    try { const p = Game.getPerson && Game.getPerson(vid); if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
    return 'Someone';
  };
  const diseaseIdOf = (rec) => {
    try { return (Game.villagerDiseaseId ? Game.villagerDiseaseId(rec) : null) || null; } catch (e) { return null; }
  };
  const countMedics = (roster) => {
    let n = 0;
    for (const id of roster) {
      if (id === Game.villagerId) continue;
      let p = null;
      try { p = Game.getPerson(id); } catch (e) {}
      if (!p || p.dead) continue;
      if (MED_OCC.test(String(p.formerOccupation || '').toLowerCase())) n++;
    }
    return n;
  };
  // Tick-phase snapshot of v.sick: the event-capture primitive. Pure reads
  // only. `afterDay` is the day of the most recent daily snapshot, so the
  // analyzer can order a tick against the daily series even if scholar.day
  // has already incremented inside endDay.
  const snapSick = (phase) => {
    try {
      const v = (Game.state || {}).village || {};
      const sick = v.sick || {};
      const roster = ((v.roster || []).slice()).map(String);
      let healerId = null;
      try { healerId = Game.campHealerId ? Game.campHealerId('haven') : null; } catch (e) {}
      const sickRows = [];
      for (const vid of Object.keys(sick)) {
        const rec = sick[vid] || {};
        sickRows.push({ vid: String(vid).slice(0, 24), name: String(rec.name || '?').slice(0, 32),
          diseaseId: diseaseIdOf(rec), daysLeft: (rec.daysLeft == null ? null : rec.daysLeft),
          severity: (rec.severity == null ? null : rec.severity),
          diagnosed: !!rec.diagnosed });
      }
      return { day: dayOf(), afterDay: W.lastSnapshotDay, phase,
        healerPresent: healerId != null,
        healerVid: healerId == null ? null : String(healerId).slice(0, 24),
        medicCount: countMedics(roster), roster, sick: sickRows };
    } catch (e) {
      W.instrumentErrors.push({ day: dayOf(), kind: 'tick-snapshot-error', phase,
        message: String((e && e.message) || e).slice(0, 120) });
      return null;
    }
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

  // --- tick wrappers: EVENT CAPTURE (recorded leg only). villageSicknessTick
  // wraps the safetynet-wrapped version installed at load and calls through;
  // villagerCareTick is called only from inside it, so the four phases nest
  // preTick < preCare < postCare < postTick per tick. Pure reads + external
  // appends; no Game writes, no RNG. try/finally so a throwing tick still
  // records its exit snapshot. ---
  if (!bare) {
    const oVST = Game.villageSicknessTick;
    if (typeof oVST === 'function') Game.villageSicknessTick = function () {
      const pre = snapSick('preTick');
      if (pre) W.tickEvents.push(pre);
      try { return oVST.apply(this, arguments); }
      finally {
        const post = snapSick('postTick');
        if (post) W.tickEvents.push(post);
      }
    };
    const oVCT = Game.villagerCareTick;
    if (typeof oVCT === 'function') Game.villagerCareTick = function () {
      const pre = snapSick('preCare');
      if (pre) W.tickEvents.push(pre);
      try { return oVCT.apply(this, arguments); }
      finally {
        const post = snapSick('postCare');
        if (post) W.tickEvents.push(post);
      }
    };
  }

  // --- duty cures: CALL-THROUGH capture (recorded leg only). The wrapper
  // reads the disease id BEFORE the call (the cure deletes the record),
  // diffs v.medicDutyCures before/after for the channel, and appends to the
  // external W array. It writes no Game state and consumes no RNG. ---
  const oCure = Game.medicDutyCureAttempt;
  if (!bare && typeof oCure === 'function') Game.medicDutyCureAttempt = function (holder, pid, nm) {
    let did = null, before = null;
    try {
      const v = (Game.state || {}).village || {};
      const rec = (v.sick || {})[pid];
      did = rec ? diseaseIdOf(rec) : null;
      const c = v.medicDutyCures || {};
      before = { ability: c.ability || 0, medicine: c.medicine || 0 };
    } catch (e) {}
    const ret = oCure.apply(this, arguments);
    try {
      if (ret === true) {
        const v = (Game.state || {}).village || {};
        const c = v.medicDutyCures || {};
        const after = { ability: c.ability || 0, medicine: c.medicine || 0 };
        let channel = null;
        if (before && after.ability === before.ability + 1 && after.medicine === before.medicine) channel = 'ability';
        else if (before && after.medicine === before.medicine + 1 && after.ability === before.ability) channel = 'medicine';
        if (!channel) {
          W.instrumentErrors.push({ day: dayOf(), kind: 'cure-no-counter-diff',
            holder: String(holder || '').slice(0, 24), patient: String(pid || '').slice(0, 24), diseaseId: did });
        } else {
          W.cureEvents.push({ day: dayOf(), kind: 'dutyCure', channel,
            holder: String(holder || '').slice(0, 24), holderName: npcName(holder),
            who: String(pid || '').slice(0, 24), whoName: npcName(pid), diseaseId: did });
        }
      }
    } catch (e) {}
    return ret;
  };

  // --- say sample: CALL-THROUGH capture of death/cure/fever lines
  // (recorded leg only). The wrapper appends matching lines (day + text)
  // to the external W array, capped at 600/seed; it writes no Game state
  // and consumes no RNG. This is the sense-testing transcript source —
  // the prereg's sense-testing leg reads these lines, not counts. ---
  const SAY_RE = /succumbed|died of|has died|cured them|breaks within the day|is going to make it|on the mend|burning up|no healer|fever/i;
  const oSay = Game.say;
  if (!bare && typeof oSay === 'function') Game.say = function (line) {
    try {
      const s = String(arguments.length === 1 ? line : Array.prototype.join.call(arguments, ' '));
      if (SAY_RE.test(s) && W.sayLines.length < 600) W.sayLines.push({ day: dayOf(), line: s.slice(0, 280) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  if (!bare) policy.daily = (G, ctx) => {
    W.lastSnapshotDay = dayOf();
    try {
      const v = (G.state || {}).village || {};
      const roster = v.roster || [];
      const sick = v.sick || {};
      let healerId = null;
      try { healerId = G.campHealerId ? G.campHealerId('haven') : null; } catch (e) {}
      const medicCount = countMedics(roster);
      // Pharmacy: DIRECT read of v.stash.medicine (never stashState(),
      // which initializes state). Missing stash = no pharmacy.
      const meds = ((v.stash || {}).medicine) || [];
      let abx = 0, antip = 0;
      for (const m of meds) {
        if (!m) continue;
        if (m.medType === 'antibiotics') abx += (m.doses || 0);
        else if (m.medType === 'antiparasitic') antip += (m.doses || 0);
      }
      const sickRows = [];
      for (const vid of Object.keys(sick)) {
        const rec = sick[vid] || {};
        sickRows.push({ vid: String(vid).slice(0, 24), name: String(rec.name || '?').slice(0, 32),
          diseaseId: diseaseIdOf(rec), daysLeft: (rec.daysLeft == null ? null : rec.daysLeft),
          severity: (rec.severity == null ? null : rec.severity),
          diagnosed: !!rec.diagnosed });
      }
      const cures = (v.medicDutyCures || {});
      W.dayRows.push({ day: dayOf(), pop: roster.length,
        healerPresent: healerId != null,
        healerIsScholar: healerId != null && healerId === G.villagerId,
        healerVid: healerId == null ? null : String(healerId).slice(0, 24),
        medicCount,
        sickCountNPC: sickRows.length,
        sick: sickRows,
        dutyVid: (v.medicDuty != null && String(v.medicDuty)) || null,
        dutyCures: { ability: cures.ability || 0, medicine: cures.medicine || 0 },
        pharmacy: { antibiotics: abx, antiparasitic: antip, total: abx + antip } });
    } catch (e) {
      W.instrumentErrors.push({ day: dayOf(), kind: 'snapshot-error', message: String((e && e.message) || e).slice(0, 120) });
    }
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

  const vEnd = (Game.state || {}).village || {};
  const curesEnd = (vEnd.medicDutyCures || {});
  const tickPhaseCounts = { preTick: 0, preCare: 0, postCare: 0, postTick: 0 };
  for (const te of W.tickEvents) if (te.phase in tickPhaseCounts) tickPhaseCounts[te.phase]++;
  const perSeed = {
    seed, policy: 'competent',
    plentydepri: 1, depositgate: 1,
    daysAlive: result.days, villageDays: W.dayRows.length,
    deathCauses, deathRows: W.deaths,
    dayRows: W.dayRows, tickEvents: W.tickEvents, tickPhaseCounts,
    cureEvents: W.cureEvents, sayLines: W.sayLines,
    instrumentErrors: W.instrumentErrors,
    finalDutyCures: { ability: curesEnd.ability || 0, medicine: curesEnd.medicine || 0 },
    national, table: won, win: won, waveReach,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave,
    deathRowCount: W.deaths.length, dayRowCount: W.dayRows.length,
    tickEventCount: W.tickEvents.length,
    cureEventCount: W.cureEvents.length, sayLineCount: W.sayLines.length, instrumentErrorCount: W.instrumentErrors.length, ms,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly 160501-160508, got: ' + (process.env.SEEDS || '(unset)'));
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
    writeRobust(path.join(PERSEED_DIR, `medcure-ev-b-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} dayRows=${diag.dayRowCount} tickEvents=${diag.tickEventCount} cures=${diag.cureEventCount} sayLines=${diag.sayLineCount} instrErr=${diag.instrumentErrorCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // BARE pass (neutrality): same seeds/days/policy, recorders skipped.
  const bareRows = [];
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `medcure-ev-b-bare-s${seed}.json`),
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
