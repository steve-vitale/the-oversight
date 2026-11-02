#!/usr/bin/env node
// sim-titanghost-b2-snap.js — snapshot-diff twin instrument for B2.
// WHY (metric review, sim-titanghost-a): the trustbleed replay captures
// each day's NEW link.history entries by slicing from the previous
// snapshot's length (hist.slice(seen)). Once a link's history saturates
// the 40-entry cap, length stops growing and the slice goes empty — the
// replay stream misses entries for ALL kinds after ~day 90 on 90111,
// before and after alike. This instrument replays the IDENTICAL twin
// (same policy chain, same MODE=intervene intervention, same seed/days
// as trustbleed-replay-20261101.js) but snapshots the FULL link.history
// each day and diffs by multiset: cap shifts only remove already-counted
// old entries, so each day's new entries are counted exactly.
// Observation is read-only (copies only, no game writes), so the twin
// timeline must match the replay's trust series exactly — the analyzer
// verifies that, proving the instrument change did not move the game.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   MODE=intervene DAYS=180 SEEDS=90111 node scripts/sim-titanghost-b2-snap.js > out.json 2> out.log
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error(`TITANGHOST SNAP STOP: ${k}=1 is required.`); process.exit(2); }
}
const MODE = process.env.MODE || 'intervene';
if (MODE !== 'intervene') { console.error('TITANGHOST SNAP STOP: MODE must be intervene.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}
function otherIdOf(link) {
  if (!link) return null;
  if (link.subordinate === 'haven') return link.primary;
  if (link.primary === 'haven') return link.subordinate;
  return link.subordinate || link.primary || null;
}
function entryKey(h) {
  return [h.day, h.kind, (h.amount == null ? '' : h.amount), String(h.note || '')].join('|');
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);
  const hungerLines = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && /muster is hungry/i.test(arg)) {
          hungerLines.push({ day: ((Game.state || {}).scholar || {}).day || 0, line: String(arg).slice(0, 500) });
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) { t.instrumentErrors.push('say-wrap: ' + String(e && e.message)); }

  // Full-history snapshots + multiset diffs.
  const series = []; // {day, links: [{id, villageId, status, trust}]}
  const newEntries = []; // {day, linkId, villageId, kind, amount, note}
  let prevSnap = null; // Map linkId -> Map key -> count
  function snapshotDay() {
    try {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      let links = [];
      try { links = Game.hierarchyState ? Game.hierarchyState() : []; } catch (e) { links = []; }
      const snap = new Map();
      const rows = (links || []).map(function (l) {
        const hist = Array.isArray(l.history) ? l.history : [];
        const counts = new Map();
        for (const h of hist) {
          const k = entryKey(h);
          counts.set(k, (counts.get(k) || 0) + 1);
        }
        snap.set(l.id, counts);
        if (prevSnap) {
          const prev = prevSnap.get(l.id) || new Map();
          for (const [k, c] of counts) {
            const d = c - (prev.get(k) || 0);
            for (let i = 0; i < d; i++) {
              const parts = k.split('|');
              newEntries.push({ day: day, linkId: l.id, villageId: otherIdOf(l), kind: parts[1], amount: parts[2] === '' ? null : parseInt(parts[2], 10), note: parts.slice(3).join('|') });
            }
          }
        }
        return { id: l.id, villageId: otherIdOf(l), status: l.status || null, trust: (l.trust == null ? null : l.trust) };
      });
      prevSnap = snap;
      series.push({ day, links: rows });
    } catch (e) { t.instrumentErrors.push('snapshotDay: ' + String(e && e.message)); }
  }

  const post = { sounded: false, day: null, actualAllies: null };
  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const snaps = mstore.refusals;
      const last = snaps.length ? snaps[snaps.length - 1] : null;
      const curDay = ((Game.state || {}).scholar || {}).day || 0;
      if (!post.sounded && last && last.day === curDay && r === null) {
        post.sounded = true;
        post.day = curDay;
        const muster = Game.soundTitanCall('herald');
        post.actualAllies = ((muster && muster.allies) || []).length;
        Game.titanCommitOwn('herald');
        Game.titanCommitOwn('herald');
        console.error('SNAP sounded seed=' + seed + ' day=' + curDay + ' actual=' + post.actualAllies);
      }
    } catch (e) { post.error = String(e && e.message); }
    return r;
  };

  let result;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) { const r = policy.daily(Gm, ctx); snapshotDay(); return r; },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  let rank = null;
  try { rank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  return { seed, mode: MODE, anchorCommit: ANCHOR, post, series, hungerLines, newEntries,
    instrumentErrors: t.instrumentErrors, endReason: result.endReason, days: result.days,
    gameDays: ((Game.state || {}).scholar || {}).day || 0, endScaleRank: rank };
}

(async () => {
  if (!SEEDS.length) { console.error('TITANGHOST SNAP STOP: SEEDS env required.'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, snap: r }));
      console.error(`done s${seed} sounded=${r.post.sounded} day=${r.post.day} seriesDays=${r.series.length} hungerLines=${r.hungerLines.length} newEntries=${r.newEntries.length} end=${r.endReason} days=${r.gameDays}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
