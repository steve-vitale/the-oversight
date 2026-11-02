#!/usr/bin/env node
// sim-titanghost-a-probe.js — titan-ghost probe (B1) + present-titan control.
// Replays ONE seed on the heraldkill substrate (tableseat-nowait +
// fullseat-diag + wavegate-diag, NO heraldarr2 capture) for DAYS=180 in a
// throwaway process, counts post-kill Herald escalation say lines, then
// probes the titan road: soundTitanCall('herald') once + titanCommitOwn
// through both taps, then one fresh-day titanMusterUpkeep call to measure
// upkeep charged against the probe-formed muster. The probe NEVER continues
// the run after calling, so probe calls cannot contaminate any judged
// timeline. Outputs one JSON line to stdout (progress to stderr).
//
//   LEANLINKRESCUE=1 TABLESEATNOWAIT=1 FULLSEAT=1 WAVEGATE=1 \
//     node scripts/sim-titanghost-a-probe.js <seed> <killDay> <kill|control> \
//     > evidence/2026-11-02/perseed-titanghost-a/<tag>-s<seed>.json
//
// kill:    killDay = the heraldkill kill day; escalation lines counted only
//          when day > killDay and the line names THE HERALD.
// control: killDay is ignored for escalation (reported as informational
//          total); the judged outputs are call/commit/upkeep equality
//          before vs after on a seed whose Herald is alive at end.
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));
const WG = require(path.join(REPO, 'scripts', 'policies', 'wavegate-diag'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));

for (const k of ['LEANLINKRESCUE', 'TABLESEATNOWAIT', 'FULLSEAT', 'WAVEGATE']) {
  if (process.env[k] !== '1') { console.error('TITANGHOST STOP: ' + k + '=1 is required.'); process.exit(2); }
}
const seed = parseInt(process.argv[2], 10);
const killDay = parseInt(process.argv[3], 10);
const mode = process.argv[4];
if (!Number.isFinite(seed) || !Number.isFinite(killDay) || (mode !== 'kill' && mode !== 'control')) {
  console.error('usage: sim-titanghost-a-probe.js <seed> <killDay> <kill|control>');
  process.exit(2);
}
const DAYS = 180;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const wg = WG.withWavegateDiag(tableseatNowait, 'wavegate-diag', 'tableseat-nowait + wave-gate recorder');
  return FD.withFullseatDiag(wg, 'fullseat-diag', 'tableseat-nowait + full-seat recorder');
}

function titanSnap(Game) {
  try {
    const st = (Game.state || {}).titans || {};
    const omen = (st.omens || {}).herald || null;
    const muster = (st.musters || {}).herald || null;
    const m = (Game.worldMonsters() || []).find(x => x && x.id === 'herald') || null;
    const allMusters = {};
    Object.keys(st.musters || {}).forEach(function (tid) {
      const mm = st.musters[tid];
      allMusters[tid] = mm ? { allies: (mm.allies || []).length, haven: (mm.haven || []).length } : null;
    });
    return {
      heraldPresent: !!m, heraldTile: m ? { x: m.tx, y: m.ty } : null,
      omenStage: omen ? (omen.stage != null ? omen.stage : null) : null,
      omenResolved: omen ? !!omen.resolved : null,
      slainHerald: !!(st.slain || {}).herald,
      musterAllies: muster ? (muster.allies || []).length : null,
      musterHaven: muster ? (muster.haven || []).length : null,
      allMusters: allMusters,
    };
  } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
}

function endFields(Game) {
  const out = {};
  try { out.rank = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null; } catch (e) { out.rank = null; }
  try { out.wave = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null; } catch (e) { out.wave = null; }
  try { out.packKcal = (typeof Game.playerPackKcal === 'function') ? Game.playerPackKcal() : null; } catch (e) { out.packKcal = null; }
  try { out.tableEntered = !!(Game.state && Game.state.table && Game.state.table.entered); } catch (e) { out.tableEntered = null; }
  try { out.won = !!(Game.state && Game.state.won); } catch (e) { out.won = null; }
  return out;
}

async function main() {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const escLines = [];
  let callWindow = null;
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (txt) {
      try {
        const raw = txt != null ? String(txt) : '';
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (/fed in the night|struck .* in the night/.test(raw)) escLines.push({ day, text: raw.slice(0, 300) });
        if (callWindow) callWindow.push({ day, text: raw.slice(0, 500) });
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  }
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const scholarDay = ((Game.state || {}).scholar || {}).day || 0;
  const snapBefore = titanSnap(Game);
  const endBefore = endFields(Game);
  const postKillEscalation = mode === 'kill'
    ? escLines.filter(l => l.day > killDay && /THE HERALD/.test(l.text))
    : escLines.filter(l => /THE HERALD/.test(l.text));
  const out = {
    seed, killDay, mode, anchorCommit: ANCHOR, runDays: DAYS,
    scholarDay, endReason: result.endReason,
    snapBeforeCall: snapBefore, endBefore: endBefore,
    postKillEscalation: postKillEscalation,
    escalationTotalHerald: escLines.filter(l => /THE HERALD/.test(l.text)).length,
  };
  // Probe calls (throwaway: never continue the run afterwards).
  const summarize = (r) => {
    if (r === null || r === undefined) return 'null';
    if (r === 'confirm') return 'confirm';
    if (typeof r === 'object') return 'muster(allies=' + ((r.allies || []).length) + ',haven=' + ((r.haven || []).length) + ')';
    return String(r).slice(0, 120);
  };
  callWindow = [];
  let callRet = null, callErr = null;
  try { callRet = Game.soundTitanCall ? Game.soundTitanCall('herald') : null; } catch (e) { callErr = String((e && e.message) || e).slice(0, 200); }
  const callLines = callWindow; callWindow = [];
  let commit1 = null, commit1Err = null, commit2 = null, commit2Err = null;
  try { commit1 = Game.titanCommitOwn ? Game.titanCommitOwn('herald') : null; } catch (e) { commit1Err = String((e && e.message) || e).slice(0, 200); }
  const commit1Lines = callWindow; callWindow = [];
  try { commit2 = Game.titanCommitOwn ? Game.titanCommitOwn('herald') : null; } catch (e) { commit2Err = String((e && e.message) || e).slice(0, 200); }
  const commit2Lines = callWindow; callWindow = null;
  const snapAfter = titanSnap(Game);
  // Upkeep probe: one fresh-day upkeep call; pack delta = upkeep charged.
  // Herald-muster-only reading: if any non-herald muster stands, the delta
  // is flagged (analyzer treats it as mixed, not herald-only).
  let packBefore = null, packAfter = null, upkeepErr = null;
  try { packBefore = (typeof Game.playerPackKcal === 'function') ? Game.playerPackKcal() : null; } catch (e) { packBefore = null; }
  try {
    if (Game._titanTest && Game._titanTest.titanMusterUpkeep) Game._titanTest.titanMusterUpkeep(scholarDay + 1);
  } catch (e) { upkeepErr = String((e && e.message) || e).slice(0, 200); }
  try { packAfter = (typeof Game.playerPackKcal === 'function') ? Game.playerPackKcal() : null; } catch (e) { packAfter = null; }
  const otherMusters = Object.keys(snapAfter.allMusters || {}).filter(function (tid) {
    return tid !== 'herald' && snapAfter.allMusters[tid] !== null;
  });
  out.callProbe = {
    callReturn: summarize(callRet), callErr, callLines,
    commit1Return: summarize(commit1), commit1Err, commit1Lines,
    commit2Return: summarize(commit2), commit2Err, commit2Lines,
    snapAfterProbe: snapAfter,
    upkeep: {
      packBefore: packBefore, packAfter: packAfter,
      charged: (packBefore != null && packAfter != null) ? (packBefore - packAfter) : null,
      otherMustersStanding: otherMusters, upkeepErr: upkeepErr,
    },
  };
  process.stdout.write(JSON.stringify(out) + '\n');
}

main().catch(function (e) { console.error('TITANGHOST PROBE FAIL: ' + (e && e.stack ? e.stack : e)); process.exit(1); });
