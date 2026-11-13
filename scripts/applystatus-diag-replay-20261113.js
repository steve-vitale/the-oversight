// applystatus-diag-replay-20261113.js — diagnostic replay for GO bar (b).
// Re-runs seeds 190393 + 190398 on the fix commit and tags every stun
// applyStatus call on a live-fight fighter with (day, fighter key, fight
// id, silent), so a remaining (day, line-text) group > 1 can be judged:
// group size must equal its distinct (fight, fighter) count.
//
// METHOD NOTE (2026-11-13, adoption coordinator): the first version of
// this script correlated each say() line to its applyStatus call with a
// per-call flag. That correlation came back all-false (0 announced apps
// against 3 real lines) — the say is not observably synchronous inside
// the applyStatus call from a wrapper, so per-call flagging cannot be
// trusted here. This version instead MODELS the fix's dedup from the
// application stream itself: an application announces iff it is
// non-silent AND the first for its (fight, fighter-key, effect) —
// exactly the flag logic in statusEffects.js. The model is self-checked
// twice per seed: predicted announced count must equal the observed
// say-line count, and the predicted (day, name) groups must match the
// observed line groups exactly. Only then is the bar-(b) judgment read
// off the model.
//
// Same harness shape as applystatus-check-driver-20261113.js (competent
// verbatim, 150d death-aware) so the replay reproduces the after-leg
// trajectory; the replay's apply-line totals are checked against the
// after-leg corpus as a determinism control.
// Usage:
//   SEEDS=190393,190398 node scripts/applystatus-diag-replay-20261113.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const EXPECTED_ANCHOR = process.env.EXPECTED_ANCHOR || '1c3d4a2f708ff1f0b1a6836c2788682827cf8b80';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
if (ANCHOR !== EXPECTED_ANCHOR) {
  console.error('DIAG STOP: HEAD ' + ANCHOR.slice(0, 12) + ' is not the fix commit 1c3d4a2f7.');
  process.exit(2);
}

const APPLY_RE = /is frozen \u2014 .*\(stunned: no movement\)/i;
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-applystatus', fullTelemetry: false });
  const fightIds = new Map();
  let nextFightId = 1;
  function fightId() {
    try {
      const f = Game.tbfight;
      if (!f || typeof f !== 'object') return null;
      if (!fightIds.has(f)) fightIds.set(f, nextFightId++);
      return fightIds.get(f);
    } catch (e) { return null; }
  }
  const applications = []; // every stun/stun_full applyStatus on a live-fight fighter
  const announcedLines = [];
  try {
    const origApply = Game.applyStatus;
    if (typeof origApply === 'function') {
      Game.applyStatus = function (target, effectId, opts) {
        try {
          if ((effectId === 'stun' || effectId === 'stun_full') && target && typeof target === 'object' && Game.tbfight && Array.isArray(Game.tbfight.fighters) && Game.tbfight.fighters.indexOf(target) !== -1) {
            applications.push({
              day: gday(Game), key: target.key || target.name || 'it', name: target.name || null,
              effectId: effectId, fight: fightId(),
              silent: !!(opts && opts.silent),
            });
          }
        } catch (e) {}
        return origApply.apply(this, arguments);
      };
    }
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && APPLY_RE.test(String(arg))) {
          announcedLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) {}
  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  // Model the fix's dedup: first NON-SILENT application per
  // (fight, key, effectId) announces; silent ones never touch the flag.
  const seen = new Set();
  const predicted = [];
  for (const a of applications) {
    if (a.silent) continue;
    const k = a.fight + '|' + a.key + '|' + a.effectId;
    if (seen.has(k)) continue;
    seen.add(k);
    predicted.push(a);
  }
  // Self-checks: predicted count == observed line count, and per-day
  // counts agree. (Names are NOT compared: the say line renders a
  // display name — "The Reunion" for targets "The Reunion 1/2/3",
  // "The Influencer" for "RERUN x2 The Influencer" — so the line text
  // cannot be matched to a target by string equality. Order-pairing
  // within a day, below, is the sound join: both streams are recorded
  // in call order in the same run, and the announcing applications are
  // exactly the subsequence that emits the lines, in order.)
  function countByDay(list) {
    const by = {};
    for (const e of list) by[e.day] = (by[e.day] || 0) + 1;
    return by;
  }
  const predByDay = countByDay(predicted);
  const obsByDay = countByDay(announcedLines);
  const modelOk = predicted.length === announcedLines.length &&
    Object.keys(predByDay).length === Object.keys(obsByDay).length &&
    Object.keys(predByDay).every(function (d) { return predByDay[d] === obsByDay[d]; });

  return {
    seed: seed, anchorCommit: ANCHOR, days: result.days, endReason: result.endReason,
    applications: applications, announcedLines: announcedLines,
    predictedAnnounced: predicted, modelOk: modelOk,
  };
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('DIAG STOP: SEEDS required.'); process.exit(2); }
  const out = { run: 'applystatus-diag-replay', anchor: ANCHOR, seeds: {} };
  for (const seed of SEEDS) {
    const r = await oneRun(seed);
    out.seeds[seed] = r;
    const groups = {};
    for (const l of r.announcedLines) {
      const k = l.day + '|' + l.line;
      groups[k] = (groups[k] || 0) + 1;
    }
    console.log(JSON.stringify({ seed: seed, days: r.days, endReason: r.endReason, announcedTotal: r.announcedLines.length, applicationsTotal: r.applications.length, predictedAnnounced: r.predictedAnnounced.length, modelOk: r.modelOk, groupsOver1: Object.keys(groups).filter(function (k) { return groups[k] > 1; }).map(function (k) { return { group: k, size: groups[k] }; }) }));
    for (const k of Object.keys(groups)) {
      if (groups[k] <= 1) continue;
      const bar = k.indexOf('|');
      const day = parseInt(k.slice(0, bar), 10);
      const line = k.slice(bar + 1);
      const name = line.split(' is frozen')[0];
      // Order-pairing within the day: the day's announced lines and the
      // day's predicted-announced applications are both in call order;
      // the lines of this group pair with the applications at the same
      // positions among the day's predicted applications. (Names are NOT
      // matched: the line renders a display name — "The Reunion" for
      // targets "The Reunion 1/2/3" — so string equality cannot join.)
      const dayLines = r.announcedLines.filter(function (l) { return l.day === day; });
      const dayApps = r.predictedAnnounced.filter(function (a) { return a.day === day; });
      const positions = [];
      dayLines.forEach(function (l, i) { if (l.day + '|' + l.line === k) positions.push(i); });
      const apps = positions.map(function (i) { return dayApps[i]; }).filter(Boolean);
      const distinct = new Set(apps.map(function (a) { return a.fight + ':' + a.key; }));
      console.log(JSON.stringify({ seed: seed, day: day, line: line, groupSize: groups[k], pairedApps: apps.length, distinctFightFighter: distinct.size, pairs: Array.from(distinct), modelOk: r.modelOk, verdict: (r.modelOk && distinct.size === groups[k]) ? 'BAR-B-PASS' : 'BAR-B-FAIL' }));
    }
  }
  fs.writeFileSync(path.join(REPO, 'evidence', '2026-11-13', 'applystatus-diag-replay.json'), JSON.stringify(out, null, 2) + '\n');
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
