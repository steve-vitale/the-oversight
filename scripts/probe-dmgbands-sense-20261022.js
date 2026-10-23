#!/usr/bin/env node
// probe-dmgbands-sense-20261022.js — SENSE-TESTING LAW probe for
// sim-dmg-bands. Re-runs one corpus config with narration capture and
// prints 2-3 wave-4 fight transcripts (by encounter day + monster name)
// for a human read: do companions read as people fighting?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 DMGBANDS=1 \
//   SEED=65562 POLICIES=leadfeast node scripts/probe-dmgbands-sense-20261022.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const FS = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));
const DB = require(path.join(REPO, 'scripts', 'dmgbands-instrument-20261022'));

const SEED = parseInt(process.env.SEED || '65562', 10);
const POLICY = (process.env.POLICIES || 'leadfeast').split(',')[0].trim();
const NPRINT = parseInt(process.env.NPRINT || '3', 10);

async function main() {
  const policy = POLICY === 'belongfeast' ? FS.belongfeast : FS.leadfeast;
  // NOTE: narration must be ON in loadGame (sim-harness silences say/sysSay
  // by default), and the capture wraps Game.say/Game.sysSay — the game's
  // narration entry points, not Game.emit. (Fixed 2026-10-22: first probe
  // run captured 0 lines.)
  const { Game } = await loadGame({ seed: SEED, mode: 'dmgbands-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = DB.install(Game, t);
  // Narration capture: wrap say/sysSay (the game's narration channels).
  const lines = [];
  const oSay = Game.say ? Game.say.bind(Game) : null;
  const oSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  function cap(day, kind, msg) {
    try {
      if (lines.length < 200000) lines.push({ day: ((Game.state || {}).scholar || {}).day || 0, kind: kind || '', msg: String(msg == null ? '' : msg) });
    } catch (e) {}
  }
  if (oSay) Game.say = function (msg, a, b) { cap(0, 'say', msg); return oSay(msg, a, b); };
  if (oSys) Game.sysSay = function (msg, a, b) { cap(0, 'sys', msg); return oSys(msg, a, b); };
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  uninstall();
  try { if (oSay) Game.say = oSay; } catch (e) {}
  try { if (oSys) Game.sysSay = oSys; } catch (e) {}

  const enc = t.enc.map(e => DB.encJSON(e)).filter(e => e.mechanism === 'tb');
  console.log(`seed=${SEED} policy=${POLICY} tbEncounters=${enc.length} lines=${lines.length}`);
  const shown = enc.slice(0, NPRINT);
  for (const e of shown) {
    const needle = e.mid.replace(/_/g, ' ');
    const win = lines.filter(l => l.day === e.day);
    const hit = win.filter(l => l.msg.toLowerCase().includes(needle));
    console.log(`\n===== d${e.day} ${e.mid} (band ${e.band}, pool ${e.pool}) kill=${e.kill} by=${e.killByName || e.killBy} sch=${Math.round(e.dmgScholar)} comp=${Math.round(e.dmgCompanion)} other=${Math.round(e.dmgOther)} staged=[${(e.stagedNames || []).join(',')}] =====`);
    if (!hit.length) { console.log('(no narration lines matched the monster name on this day; first 40 narration lines of the day:)'); }
    const out = hit.length ? hit : win.slice(0, 40);
    // Print a bounded window around the first hit to keep the fight whole.
    let start = 0;
    if (hit.length) {
      const firstIdx = win.indexOf(hit[0]);
      start = Math.max(0, firstIdx - 15);
    }
    for (const l of win.slice(start, start + 90)) console.log(`  d${l.day} ${l.msg}`);
  }
}

main().catch(e => { console.error('PROBE FAIL:', e && e.stack || e); process.exit(1); });
