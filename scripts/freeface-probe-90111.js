#!/usr/bin/env node
// freeface-probe-90111.js — DIAG probe (not a judged sim): re-run seed
// 90111 on the freeface stack to day 90 and dump the raw
// state.otherVillages entries + active links, to distinguish
// "roster is an empty array" from "roster missing" from "village
// object missing" for Stonebridge/Thornfield. Read-only: captures
// state snapshots, writes nothing to game state, prints one JSON
// object to stdout.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 node scripts/freeface-probe-90111.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'x');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'x');
}

function snap(Game, day) {
  const ovs = ((Game.state || {}).otherVillages || []).map(ov => ({
    id: ov.id, name: ov.name, hasRoster: Array.isArray(ov.roster),
    rosterLen: Array.isArray(ov.roster) ? ov.roster.length : null,
    rosterKeys: Array.isArray(ov.roster) && ov.roster.length ? Object.keys(ov.roster[0]).sort() : null,
    opinion: ov.opinion, keys: Object.keys(ov).sort(),
  }));
  let links = [];
  try { links = Game.hierarchyState().filter(l => l && l.status === 'active').map(l => {
    let vid = null;
    try { vid = Game._linkOther(l, 'haven'); } catch (e) {}
    return { villageId: vid, trust: l.trust, status: l.status, speaker: l.theirSpeaker || null, arrears: l.arrears || 0 };
  }); } catch (e) { links = [{ error: String(e) }]; }
  return { day, otherVillages: ovs, links };
}

(async () => {
  const policy = policyFor();
  const { Game } = await loadGame({ seed: 90111, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const snaps = {};
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      const day = (Gm.state.scholar || {}).day || 0;
      if (day === 80 || day === 87) snaps[day] = snap(Gm, day);
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { await runDays(Game, wrapped, { days: 90, manifest: undefined, sampleEvery: 30 }); });
  console.log(JSON.stringify({ seed: 90111, snaps, endDay: (Game.state.scholar || {}).day || 0 }, null, 2));
})();
