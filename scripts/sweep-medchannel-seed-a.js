#!/usr/bin/env node
// sweep-medchannel-seed-a.js — MEDICINE-CHANNEL SEEDED-STASH recorder (measurement only)
// (sim-medchannel-seed-a, 2026-11-09, oversight-flesh-out-loop run
// fleshout-20261109T1815Z, Loop A, axis food-economy. Prereg:
// evidence/2026-11-09/sim-medchannel-seed-a-prereg.md, committed BEFORE
// any judged computation.)
//
// The Haven medic duty's medicine channel (medicDutyCureAttempt channel 2,
// game.js) has 0 cures on 20 seeds because the Haven pharmacy never holds
// doses. This recorder re-runs the SAME 8 fresh seeds (95205-95208) under
// the SAME competent policy twice: BEFORE (no seeding — expect 0 medicine
// cures, replicating the known 0/20) and AFTER / SEEDED (the pharmacy is
// stocked at run start with 20 antibiotics + 20 antiparasitic doses, so
// the channel can fire). The seeder is driver-side instrumentation in this
// file only — zero src/js — and is env-gated (MEDCHANNEL_SEED=1).
//
// DESIGN (declared, not duplicated): this is a COMPACT recorder sharing
// only the harness pattern (loadGame/setupGame/runDays, competent FIXED,
// env FATAL-asserted, registerDeath CALLS THROUGH, writeRobust fresh-child
// writer, stdout to the caller's pipe) with sweep-medicduty-a.js, plus the
// fingerprint construction. The deltas are: (1) the seeder; (2) a
// medicDutyCureAttempt wrapper that records every duty cure as an EVENT
// (disease, kind, diagnosed-ness, holder abilities held at cure time, the
// say-line spoken) with pre/post stash-dose snapshots, so the analyzer can
// join each medicine cure to its dose spend and classify it
// ability-available vs medicine-unique; (3) a stashLog wrapper recording
// medicine takes with taker, so the dose balance reconciles; (4) a daily
// snapshot carrying pharmacy doses remaining and cumulative duty cures.
//
// REACHABLE SET (prereg, verified from code): NPC sick records carry only
// 'wound fever' / 'gut rot' / 'tick fever' / 'radiation sickness', so the
// duty's reachable medicine cures are wound_fever (antibiotics) and gutrot
// (antiparasitic) only. Lockjaw / trichinosis never present as NPC
// patients. Any observed trichinosis / alien / trembles medicine cure is
// recorded as-is and fails G1 — the recorder does not filter.
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
const SEEDED = process.env.MEDCHANNEL_SEED === '1';
const LEG = process.env.LEG || (SEEDED ? 'seeded' : 'before');
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [95205, 95206, 95207, 95208, 95209, 95210, 95211, 95212];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const CORPUS_DIR = path.join(__dirname, '..', 'evidence', '2026-11-09', 'medchannel-seed-a-corpus');
const OUT = path.join(CORPUS_DIR, `sweep-medchannel-seed-a-${LEG}.json`);
const PERSEED_DIR = CORPUS_DIR;

const SEED_DOSES = { antibiotics: 20, antiparasitic: 20 };
// Item shapes are exactly the game's own (game.js:210-211).
const SEED_ENTRIES = [
  { id: 'med_antibiotics', name: 'Antibiotics (amoxicillin)', medType: 'antibiotics', doses: 20 },
  { id: 'med_antiparasitic', name: 'Antiparasitic (mebendazole)', medType: 'antiparasitic', doses: 20 },
];

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

// The seeder: measurement instrumentation, not a game change. Pushes the
// two medicine entries into the Haven pharmacy stash. Returns the doses
// seeded per kind. Pure stash write at run start; no game rule touched.
function seedStash(Game) {
  const st = Game.stashState();
  const meds = (st.medicine = st.medicine || []);
  for (const e of SEED_ENTRIES) meds.push({ id: e.id, name: e.name, medType: e.medType, doses: e.doses });
  return { antibiotics: SEED_DOSES.antibiotics, antiparasitic: SEED_DOSES.antiparasitic };
}

function medDoses(Game) {
  const out = { antibiotics: 0, antiparasitic: 0 };
  try {
    const st = Game.stashState ? Game.stashState() : null;
    for (const m of ((st && st.medicine) || [])) {
      if (m && (m.medType === 'antibiotics' || m.medType === 'antiparasitic')) {
        out[m.medType] += (m.doses || 0);
      }
    }
  } catch (e) {}
  return out;
}

const ABILITIES = ['herbal_remedy', 'field_medicine', 'triage'];

async function oneRun(seed, days, opts) {
  const bare = !!(opts && opts.bare);
  const seeded = !!(opts && opts.seeded);
  const { Game } = await loadGame({ seed, mode: 'medchannel-seed-a-competent', fullTelemetry: false });
  await setupGame(Game);
  let seededDoses = { antibiotics: 0, antiparasitic: 0 };
  if (seeded) seededDoses = seedStash(Game);
  const day0Doses = medDoses(Game);
  const W = { deaths: [], deathSeen: new Set(), daily: [],
    cureEvents: { medicine: [], ability: [] }, cureLines: [], stashTakes: [],
    anomalies: [], _inCureCall: false, _lastCureLine: null };
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
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

  if (!bare) {
    // --- say wrapper: records ONLY medicine-cure lines (pure observation).
    const oSay = Game.say;
    if (typeof oSay === 'function') Game.say = function () {
      const line = String((arguments && arguments[0]) || '');
      try {
        if (line.indexOf('from the pharmacy stores') >= 0) {
          W.cureLines.push({ day: dayOf(), line });
        }
        if (W._inCureCall) W._lastCureLine = line;
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
    // --- stashLog wrapper: records medicine takes with taker (pure observation).
    const oLog = Game.stashLog;
    if (typeof oLog === 'function') Game.stashLog = function (kind, what, qty, vid) {
      try {
        if (/antibiotic|antiparasitic/i.test(String(what || ''))) {
          W.stashTakes.push({ day: dayOf(), kind: String(kind || ''), what: String(what || ''), qty: qty || 0, vid: vid == null ? null : String(vid).slice(0, 24) });
        }
      } catch (e) {}
      return oLog.apply(this, arguments);
    };
    // --- medicDutyCureAttempt wrapper: pre/post snapshot around the
    // call-through; records each duty cure as an event. No RNG consumed,
    // no Game-state writes — observation only.
    const oCure = Game.medicDutyCureAttempt;
    if (typeof oCure === 'function') Game.medicDutyCureAttempt = function (holder, pid, nm) {
      const v = (this.state || {}).village || {};
      const rec = (v.sick || {})[pid] || null;
      const preCures = { ability: (((v.medicDutyCures || {}).ability) || 0), medicine: (((v.medicDutyCures || {}).medicine) || 0) };
      const preDoses = medDoses(this);
      let did = null, diagnosed = false, holderAbilities = [];
      try { did = (this.villagerDiseaseId && rec) ? this.villagerDiseaseId(rec) : null; } catch (e) {}
      try { diagnosed = !!(rec && (rec.diagnosed || (this.villageKnowsDisease && this.villageKnowsDisease(did)))); } catch (e) {}
      try { holderAbilities = ABILITIES.filter(ab => this.npcHasAbility && this.npcHasAbility(holder, ab)); } catch (e) {}
      W._inCureCall = true; W._lastCureLine = null;
      let ret = false;
      try { ret = oCure.apply(this, arguments); } finally { W._inCureCall = false; }
      try {
        const postCures = { ability: (((v.medicDutyCures || {}).ability) || 0), medicine: (((v.medicDutyCures || {}).medicine) || 0) };
        const postDoses = medDoses(this);
        const dMed = postCures.medicine - preCures.medicine;
        const dAb = postCures.ability - preCures.ability;
        if (ret && dMed === 1 && dAb === 0) {
          // Kind = which stash entry decremented. Expect exactly one.
          const spent = [];
          for (const k of ['antibiotics', 'antiparasitic']) if (postDoses[k] < preDoses[k]) spent.push({ kind: k, n: preDoses[k] - postDoses[k] });
          if (spent.length !== 1 || spent[0].n !== 1) {
            W.anomalies.push({ day: dayOf(), type: 'medicine-cure-dose-mismatch', patient: String(pid).slice(0, 24), diseaseId: did, spent, preDoses, postDoses });
          }
          W.cureEvents.medicine.push({ seed, day: dayOf(), patient: String(pid).slice(0, 24),
            patientName: npcName(pid), diseaseId: did, diseaseName: rec ? (rec.name || null) : null,
            kind: spent.length ? spent[0].kind : null, diagnosed,
            holder: String(holder).slice(0, 24), holderName: npcName(holder),
            holderAbilities, dosesBefore: preDoses, dosesAfter: postDoses,
            sayLine: W._lastCureLine });
        } else if (ret && dAb === 1 && dMed === 0) {
          W.cureEvents.ability.push({ seed, day: dayOf(), patient: String(pid).slice(0, 24),
            patientName: npcName(pid), diseaseId: did, diseaseName: rec ? (rec.name || null) : null,
            diagnosed, holder: String(holder).slice(0, 24), holderName: npcName(holder),
            holderAbilities, sayLine: W._lastCureLine });
        } else if (ret) {
          W.anomalies.push({ day: dayOf(), type: 'cure-counter-mismatch', patient: String(pid).slice(0, 24), diseaseId: did, dMed, dAb, preCures, postCures });
        }
      } catch (e) {}
      return ret;
    };
  }

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  if (!bare) policy.daily = (G, ctx) => {
    try {
      const v = (G.state || {}).village || {};
      const sick = v.sick || {};
      let healerId = null;
      try { healerId = G.campHealerId ? G.campHealerId('haven') : null; } catch (e) {}
      const dutyVid = (v.medicDuty != null && String(v.medicDuty)) || null;
      W.daily.push({ day: dayOf(), pop: (v.roster || []).length,
        sickCountNPC: Object.keys(sick).length,
        healerPresent: healerId != null,
        healerIsScholar: healerId != null && healerId === G.villagerId,
        healerVid: healerId == null ? null : String(healerId).slice(0, 24),
        dutyVid, dutyHeld: dutyVid != null,
        dutyHolderName: dutyVid ? npcName(dutyVid) : null,
        dutyBlocked: (v.medicDutyBlocked || 0),
        dutyCures: { ability: ((v.medicDutyCures || {}).ability || 0),
          medicine: ((v.medicDutyCures || {}).medicine || 0) },
        medDoses: medDoses(G) });
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
  const finalMedDoses = medDoses(Game);
  const finalDutyCures = (() => { try { const c = ((Game.state || {}).village || {}).medicDutyCures || {}; return { ability: c.ability || 0, medicine: c.medicine || 0 }; } catch (e) { return { ability: 0, medicine: 0 }; } })();
  const deathKeys = W.deaths.map(d => d.day + '|' + d.who + '|' + d.cause).sort();
  const fingerprint = { seed, leg: LEG, seeded, daysAlive: result.days, endReason: result.endReason,
    rank, maxWave, national, table: won, win: won,
    deathCauses, deathKeys, finalPop,
    finalMedDoses, finalDutyCures,
    // Cure counts come from the GAME counters (finalDutyCures), never from
    // the recorder's W.cureEvents — otherwise the bare fingerprint (no
    // recorder) would read 0 by construction and neutrality could never
    // pass. W.cureEvents is the recorder's event detail; the fingerprint
    // is game state only.
    medicineCures: finalDutyCures.medicine, abilityCures: finalDutyCures.ability };
  if (bare) return { seed, perSeed: null, diag: null, fingerprint };

  const perSeed = {
    seed, policy: 'competent', leg: LEG, seeded,
    plentydepri: 1, depositgate: 1,
    seededDoses, day0Doses,
    daysAlive: result.days, villageDays: W.daily.length,
    deathCauses, deathRows: W.deaths,
    daily: W.daily, cureEvents: W.cureEvents, cureLines: W.cureLines,
    stashTakes: W.stashTakes, anomalies: W.anomalies,
    finalMedDoses, finalDutyCures, national,
    table: won, win: won,
    waveReach,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave,
    deathRowCount: W.deaths.length, dailyCount: W.daily.length, ms,
    medicineCures: W.cureEvents.medicine.length, abilityCures: W.cureEvents.ability.length,
    anomalies: W.anomalies.length,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (LEG !== 'before' && LEG !== 'seeded') {
    console.error('FATAL: LEG must be before|seeded, got: ' + LEG);
    process.exit(2);
  }
  if ((LEG === 'seeded') !== SEEDED) {
    console.error('FATAL: LEG=seeded requires MEDCHANNEL_SEED=1; LEG=before requires it unset/0');
    process.exit(2);
  }
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly 95205-95212, got: ' + (process.env.SEEDS || '(unset)'));
    process.exit(2);
  }
  if (DAYS !== 150) {
    console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
    process.exit(2);
  }
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag, fingerprint } = await oneRun(seed, DAYS, { bare: false, seeded: SEEDED });
    rows.push({ seed: s, perSeed, diag, fingerprint });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `medchannel-seed-a-${LEG}-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} leg=${LEG} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} daily=${diag.dailyCount} medCures=${diag.medicineCures} abCures=${diag.abilityCures} anomalies=${diag.anomalies} finalDoses=${JSON.stringify(perSeed.finalMedDoses)} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // BARE pass (neutrality): same seeds/days/policy, recorders skipped,
  // seeding KEPT when LEG=seeded so bare-vs-recorded trajectories match.
  const bareRows = [];
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true, seeded: SEEDED });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `medchannel-seed-a-bare-${LEG}-s${seed}.json`),
      JSON.stringify(fingerprint));
    console.log(`bare seed=${seed} leg=${LEG} days=${fingerprint.daysAlive} end=${fingerprint.endReason} deaths=${Object.values(fingerprint.deathCauses).reduce((a, b) => a + b, 0)} medCures=${fingerprint.medicineCures} abCures=${fingerprint.abilityCures}`);
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
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', leg: LEG, seeded: SEEDED, days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged, bare: bareRows }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows, ' + bareRows.length + ' bare)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, seedStash, medDoses, SEED_DOSES, BATCH, DAYS, writeRobust };
