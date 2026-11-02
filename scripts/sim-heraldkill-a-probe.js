#!/usr/bin/env node
// sim-heraldkill-a-probe.js — post-kill titan-road probe (DIAG ONLY).
// Replays ONE seed on the heraldsteer substrate (tableseat-nowait +
// fullseat-diag + wavegate-diag, NO heraldarr2 capture) in a throwaway
// process, then probes the titan road at a post-kill state. The probe
// NEVER continues the run after calling, so probe calls cannot
// contaminate any judged timeline. Outputs one JSON line to stdout
// (progress to stderr).
//
//   LEANLINKRESCUE=1 TABLESEATNOWAIT=1 FULLSEAT=1 WAVEGATE=1 \
//     node scripts/sim-heraldkill-a-probe.js <seed> <killDay> <mode> \
//     > evidence/2026-11-01/perseed-heraldkill-a/s<seed>-probe-<mode>.json
//
// Modes:
//   early — run to killDay+3 (loop-days killDay+2): snapshot Herald
//     presence, omen stage, slain flag, muster state, and the scholar
//     awayNews window (kill/death narration, if still in the 8-entry
//     window). No calls are made in early mode.
//   full  — run the full DAYS=180, count post-kill escalation say lines,
//     snapshot the same state, then call soundTitanCall('herald') once
//     and drive titanCommitOwn through both taps, recording returns +
//     say lines. Then stop.
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));
const WG = require(path.join(REPO, 'scripts', 'policies', 'wavegate-diag'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));

for (const k of ['LEANLINKRESCUE', 'TABLESEATNOWAIT', 'FULLSEAT', 'WAVEGATE']) {
  if (process.env[k] !== '1') { console.error('PROBE STOP: ' + k + '=1 is required.'); process.exit(2); }
}
const seed = parseInt(process.argv[2], 10);
const killDay = parseInt(process.argv[3], 10);
const mode = process.argv[4];
if (!Number.isFinite(seed) || !Number.isFinite(killDay) || (mode !== 'early' && mode !== 'full')) {
  console.error('usage: sim-heraldkill-a-probe.js <seed> <killDay> <early|full>');
  process.exit(2);
}
const DAYS = mode === 'full' ? 180 : (killDay + 2);

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
    return {
      heraldPresent: !!m, heraldTile: m ? { x: m.tx, y: m.ty } : null,
      omenStage: omen ? (omen.stage != null ? omen.stage : null) : null,
      omenDay: omen ? (omen.day != null ? omen.day : null) : null,
      omenResolved: omen ? !!omen.resolved : null,
      slainHerald: !!(st.slain || {}).herald,
      slainKeys: Object.keys(st.slain || {}),
      musterAllies: muster ? (muster.allies || []).length : null,
      musterHaven: muster ? (muster.haven || []).length : null,
      musterDay: muster ? (muster.day != null ? muster.day : null) : null,
    };
  } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
}

async function main() {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  // Say wrapper: count post-kill escalation lines + capture call-window lines.
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
  const awayNews = (((Game.state || {}).scholar || {}).awayNews || []).slice();
  const out = {
    seed, killDay, mode, anchorCommit: ANCHOR, runDays: DAYS,
    scholarDay, endReason: result.endReason,
    snapBeforeCall: titanSnap(Game), awayNews,
    postKillEscalation: escLines.filter(l => l.day > killDay),
  };
  if (mode === 'full') {
    // Call probe: sound the call once, record return + lines, then commit taps.
    callWindow = [];
    let callRet = null, callErr = null;
    try { callRet = Game.soundTitanCall ? Game.soundTitanCall('herald') : null; } catch (e) { callErr = String((e && e.message) || e).slice(0, 200); }
    const callLines = callWindow; callWindow = [];
    let commit1 = null, commit1Err = null, commit2 = null, commit2Err = null;
    try { commit1 = Game.titanCommitOwn ? Game.titanCommitOwn('herald') : null; } catch (e) { commit1Err = String((e && e.message) || e).slice(0, 200); }
    const commit1Lines = callWindow; callWindow = [];
    try { commit2 = Game.titanCommitOwn ? Game.titanCommitOwn('herald') : null; } catch (e) { commit2Err = String((e && e.message) || e).slice(0, 200); }
    const commit2Lines = callWindow; callWindow = null;
    const summarize = (r) => {
      if (r === null || r === undefined) return 'null';
      if (r === 'confirm') return 'confirm';
      if (typeof r === 'object') return 'muster(allies=' + ((r.allies || []).length) + ',haven=' + ((r.haven || []).length) + ')';
      return String(r).slice(0, 120);
    };
    out.callProbe = {
      callReturn: summarize(callRet), callErr, callLines,
      commitTap1: summarize(commit1), commit1Err, commit1Lines,
      commitTap2: summarize(commit2), commit2Err, commit2Lines,
    };
    out.snapAfterCall = titanSnap(Game);
    try {
      const st = (Game.state || {}).titans || {};
      const outs = st.outcomes || [];
      out.titanOutcomesHerald = outs.filter(o => o && o.titan === 'herald').map(o => ({ outcome: o.outcome, day: o.day || null }));
    } catch (e) { out.titanOutcomesHerald = []; }
  }
  console.log(JSON.stringify(out));
}
main().catch(e => { console.error('PROBE FAIL: ' + ((e && e.stack) || e)); process.exit(1); });
