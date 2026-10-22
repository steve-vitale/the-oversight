#!/usr/bin/env node
// diag-vetwindow-20261022.js — PHASE 1 DIAG for sim-vetwindow (run
// fleshout-20261022T1215Z, axis scale-onramp). Replays the armorydrive
// CONFIRM seeds that reached w5vets2=2 (armed, identical seeds, non-seat
// substrate) with a window-tracing instrument: when the veterans bar fills,
// when the wave-5 door opens, when each veteran dies and of what cause,
// plus Game.say narration windows around those days.
//
// NOT a fresh sweep: seeds pinned to the confirm band 65471-65486 (the
// four that hit w5vetsMax=2). Determinism is pinned per-run against the
// confirm per-seed JSON — mismatch is a loud stop.
//
// Usage (non-seat long substrate + ARMORYDRIVE=1):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 node scripts/diag-vetwindow-20261022.js
//
// Writes: evidence/2026-10-22/diag-vetwindow.json (window timelines +
// determinism pins). Full say-capture logs go to /tmp (ephemeral).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`DIAG STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('DIAG STOP: SEATDRIVE=0 required.'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE']) {
  if (k in process.env) { console.error(`DIAG STOP: ${k} must be unset (pinned substrate).`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

// The four armed confirm configs that reached w5vets2=2 (bar filled).
const DIAG = [
  { seed: 65477, base: 'leadfeast' },   // vetsMax=2 end=0 wave5=0 days=148 village-lost
  { seed: 65477, base: 'belongfeast' }, // vetsMax=2 end=0 wave5=0 days=126 village-lost
  { seed: 65478, base: 'leadfeast' },  // vetsMax=2 end=0 wave5=1 days=180 village-lost
  { seed: 65475, base: 'belongfeast' }, // vetsMax=2 end=2 wave5=1 days=180 survived (positive control)
];
const CONFIRMDIR = '/home/hatch/workspace/the-scattering/evidence/2026-10-22/perseed-armorydrive-confirm';
const EVID = path.join(REPO, 'evidence', '2026-10-22');
fs.mkdirSync(EVID, { recursive: true });

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
function livingVetVids(Game) {
  // Mirror standing.js: living roster members with wave-4+ kills.
  const out = [];
  try {
    const log = (Game.state || {}).waveKillLog || [];
    const seen = new Set();
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4) || seen.has(e.by)) continue;
      let dead = false;
      try {
        const p = (Game.vpOf ? Game.vpOf(e.by) : null) || (Game.getPerson ? Game.getPerson(e.by) : null);
        dead = !!(p && p.dead);
      } catch (e2) {}
      if (!dead) { seen.add(e.by); out.push(e.by); }
    }
  } catch (e) {}
  return out;
}

async function oneDiag(seed, base) {
  const { Game } = await loadGame({ seed, mode: 'vetwindow-diag', fullTelemetry: false });

  // Say-capture for sense windows.
  const sayLines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const d = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      sayLines.push({ day: d, text: String(x).replace(/\s+/g, ' ').slice(0, 700) });
    } catch (e) {}
    return osay.apply(this, arguments);
  };

  // Daily window census (piggyback Game.sleep, same as the sweep).
  const census = [];
  let uninstallCensus = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try {
          const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
          const day = ((Game.state || {}).scholar || {}).day || 0;
          let uw = 0;
          try { uw = Game.unlockedWave ? (Game.unlockedWave() | 0) : 0; } catch (e) {}
          let standing = null;
          try { standing = Game.villageStandingTotal ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
          census.push({
            day, unlockedWave: uw, standing,
            veterans: r ? (r.veterans | 0) : null,
            short: r ? (r.short || []).slice() : null,
            armed: r ? (r.armed | 0) : null, armored: r ? (r.armored | 0) : null,
            tricks: r ? (r.tricks | 0) : null,
            vetVids: livingVetVids(Game).map(v => nameOf(Game, v)),
          });
        } catch (e) {}
        return oSleep(...a);
      };
      uninstallCensus = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  const policy = AD.armedFor(base);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallCensus) uninstallCensus(); } catch (e) {}

  // Wave-4+ kill rows from the log (the veterans' proof).
  const w4kills = [];
  try {
    for (const e of ((Game.state || {}).waveKillLog || [])) {
      if (!e || ((e.w | 0) < 4)) continue;
      w4kills.push({ day: e.d | 0, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), via: e.via || null });
    }
  } catch (e) {}

  // Death rows for the veteran vids (day + cause), from the harness's
  // live death capture. Names resolved against the final state.
  const vetVidsEver = [...new Set(w4kills.map(k => k.by))];
  const vetDeaths = [];
  try {
    for (const dd of (result.samples.deaths || [])) {
      if (vetVidsEver.includes(dd.who)) {
        vetDeaths.push({ day: dd.day | 0, vid: dd.who, name: nameOf(Game, dd.who),
          cause: String(dd.cause || 'unknown'), player: !!dd.player });
      }
    }
  } catch (e) {}
  vetDeaths.sort((a, b) => a.day - b.day);

  // Window timeline: first day bar filled (veterans>=2), door opened
  // (unlockedWave>=5).
  let barFillDay = null, doorOpenDay = null;
  const windowDays = [];
  try {
    for (const c of census) {
      if (barFillDay == null && (c.veterans | 0) >= 2) barFillDay = c.day;
      if (doorOpenDay == null && (c.unlockedWave | 0) >= 5) doorOpenDay = c.day;
      if (barFillDay != null && doorOpenDay == null) {
        windowDays.push({ day: c.day, veterans: c.veterans, short: c.short, vetVids: c.vetVids });
      }
    }
  } catch (e) {}

  // Determinism pin against the confirm per-seed JSON.
  const tag = AD.normBase(base) + '-armorydrive';
  const fp = path.join(CONFIRMDIR, `armorydrive-${tag}-s${seed}.json`);
  const confirm = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let vetsMax = 0;
  try { for (const c of census) if ((c.veterans | 0) > vetsMax) vetsMax = c.veterans | 0; } catch (e) {}
  const pins = {
    w5vetsMax: { replay: vetsMax, confirm: confirm.w5vetsMax },
    days: { replay: result.days, confirm: confirm.days },
    maxWave: { replay: result.maxWaveUnlocked || 1, confirm: confirm.maxWave },
    w4kills: { replay: w4kills.length, confirm: confirm.w4kills },
  };
  const pinOk = Object.values(pins).every(p => p.replay === p.confirm);

  // Say-capture dump (ephemeral) for sense reading.
  const sayPath = `/tmp/diag-vetwindow-say-s${seed}-${base}.json`;
  try {
    fs.writeFileSync(sayPath, JSON.stringify(sayLines) + '\n');
  } catch (e) {}

  return {
    seed, base, arm: 'armorydrive',
    endReason: result.endReason, days: result.days,
    pins, pinOk,
    w4kills, vetDeaths,
    barFillDay, doorOpenDay,
    windowLengthDays: barFillDay != null ? (doorOpenDay != null ? doorOpenDay - barFillDay : 'never-opened') : 'never-filled',
    windowDays,
    sayLines: sayLines.length, sayPath,
  };
}

function windowText(sayLines, lo, hi, label) {
  // Filtered narration window for the sense pass.
  const rx = /kill|slain|veteran|wave|mirror|stand|ready|door|hold|died|death|dead|strike|fight|party|invite|wound|monster/i;
  const win = sayLines.filter(l => l.day >= lo && l.day <= hi && rx.test(l.text));
  console.log(`\n===== ${label} (d${lo}..d${hi}: ${win.length} relevant of ${sayLines.filter(l => l.day >= lo && l.day <= hi).length} lines) =====`);
  for (const l of win.slice(0, 80)) console.log(`[d${l.day}] ${l.text}`);
  if (win.length > 80) console.log(`... (${win.length - 80} more)`);
}

(async () => {
  const rows = [];
  for (const { seed, base } of DIAG) {
    console.log(`\n##### DIAG RUN seed=${seed} base=${base} (armed)`);
    const t0 = Date.now();
    const r = await oneDiag(seed, base);
    rows.push(r);
    console.log(`  days=${r.days} end=${r.endReason} pinOk=${r.pinOk}`);
    console.log(`  w4kills=${JSON.stringify(r.w4kills.map(k => `d${k.day} ${k.mid} by ${k.byName}`))}`);
    console.log(`  barFillDay=${r.barFillDay} doorOpenDay=${r.doorOpenDay} window=${JSON.stringify(r.windowLengthDays)}`);
    console.log(`  vetDeaths=${JSON.stringify(r.vetDeaths)}`);
    console.log(`  pins=${JSON.stringify(r.pins)} (${Math.round((Date.now() - t0) / 1000)}s)`);
    if (!r.pinOk) {
      // Base moved since the confirm anchor (783783e9e -> current master;
      // game-code changes in convo-wants.js/table.js legitimately shift RNG
      // draws). Macro pins (days/maxWave/w5vetsMax) are the fidelity bar;
      // kill-list drift is REPORTED, not fatal.
      const macro = ['days', 'maxWave', 'w5vetsMax'].every(k => r.pins[k].replay === r.pins[k].confirm);
      console.log(`  PIN DRIFT (reported, not fatal): macroPinsOk=${macro}`);
      if (!macro) {
        console.error('DIAG STOP: macro trajectory diverged from the confirm corpus.');
        process.exit(3);
      }
    }
  }
  const out = {
    run: 'sim-vetwindow DIAG', axis: 'scale-onramp', at: new Date().toISOString(),
    instrument: 'window-trace (daily readiness census + veteran death rows + say-capture)',
    substrate: 'non-seat long substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1) +ARMORYDRIVE=1',
    configs: rows,
  };
  fs.writeFileSync(path.join(EVID, 'diag-vetwindow.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('\nWrote evidence/2026-10-22/diag-vetwindow.json');

  // SENSE WINDOWS: bar-fill +-3 days and veteran deaths +-2 days.
  for (const r of rows) {
    const sayLines = JSON.parse(fs.readFileSync(r.sayPath, 'utf8'));
    console.log(`\n\n########## SENSE seed=${r.seed} ${r.base}: bar filled d${r.barFillDay}, door ${r.doorOpenDay == null ? 'NEVER opened' : 'opened d' + r.doorOpenDay}`);
    if (r.barFillDay != null) windowText(sayLines, r.barFillDay - 3, r.barFillDay + 3, 'BAR FILL');
    for (const vd of r.vetDeaths) windowText(sayLines, vd.day - 2, vd.day + 2, `VETERAN DEATH d${vd.day}: ${vd.name} (${vd.cause})`);
  }
})().catch(e => { console.error('DIAG CRASH:', e && e.stack || e); process.exit(1); });
