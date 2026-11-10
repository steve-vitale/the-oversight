// doorwalk-feared-transcript-20261110.js — full say-stream transcript
// capture for the walked doors (arm sim-doorwalk-feared-b, Lane B leg 4
// endgame). The judged pilot driver captures Game.say lines through a
// keyword filter; the witness beats' prose contains no filter keyword,
// so their lines never reached the corpora (the relay miss of doorwalk
// metric review #5, same class). THIS script re-runs the walked seeds
// with the SAME policy and env as the judged armed leg and records EVERY
// Game.say line from day 85 onward, plus the door-verb calls with option
// text — a sense-test read, not a re-score. Trajectories must reproduce
// the pilot armed corpora exactly (days, won, walked path, sit day);
// any divergence is reported, not smoothed.
// Usage:
//   SEEDS=53003,53004,53006,53007,53008 node scripts/doorwalk-feared-transcript-20261110.js
// Writes evidence/2026-11-10/table-transcripts-doorwalk-feared-b-s<seed>.json
// (refuses to overwrite).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const DOORWALK = require(path.join(REPO, 'scripts', 'policies', 'competent-doorwalk-b'));

function expandSeeds(raw) {
  const out = [];
  (raw || '').split(',').forEach(function (part) {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\.\.(\d+)$/);
    if (m) { for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) out.push(s); }
    else if (Number.isFinite(parseInt(t, 10))) out.push(parseInt(t, 10));
  });
  return out;
}
const SEEDS = expandSeeds(process.env.SEEDS);
if (!SEEDS.length) { console.error('TRANSCRIPT STOP: SEEDS required.'); process.exit(2); }
process.env.TAKESEAT_B = '1';
process.env.DOORWALK_B = '1';
process.env.DOORWALK_ROTATION = 'feared-witness';

const outDir = path.join(REPO, 'evidence', '2026-11-10');
fs.mkdirSync(outDir, { recursive: true });

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  process.env.DOORWALK_SEED = String(seed);
  const { Game } = await loadGame({ seed: seed, mode: 'competent-doorwalk-feared-b-transcript', fullTelemetry: false });
  const lines = [];
  const verbs = [];
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && gday(Game) >= 85) lines.push({ day: gday(Game), line: String(arg) });
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  await setupGame(Game);
  ['tableTakeSeat', 'chooseTableOption'].forEach(function (name) {
    try {
      const inner = Game[name];
      if (typeof inner !== 'function') { errors.push('verb-missing-' + name); return; }
      Game[name] = function () {
        let arg = null;
        try { arg = (arguments.length && arguments[0] != null) ? String(arguments[0]) : null; } catch (e) {}
        let ret;
        try { ret = inner.apply(this, arguments); } catch (e) { throw e; }
        try {
          const tc = ((Game.state || {}).scholar || {}).tableChoices;
          const opts = (tc && tc.options) || [];
          verbs.push({ day: gday(Game), call: name, arg: arg,
            offeredFull: opts.map(function (o) { return { id: String(o.id || ''), label: o.label != null ? String(o.label) : null }; }) });
        } catch (e2) { errors.push('verb-record: ' + String(e2.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('verb-install-' + name + ': ' + String(e.message).slice(0, 80)); }
  });
  try { DOORWALK.resetDoorwalkStats(); } catch (e) {}
  try { DOORWALK.resetTakeseatStats(); } catch (e) {}
  let result = null;
  await quietLog(async function () { result = await runDays(Game, DOORWALK.doorwalk, { days: 150, manifest: undefined, sampleEvery: 30 }); });
  const dw = DOORWALK.doorwalkStats();
  const ts = DOORWALK.takeseatStats();
  const st = Game.state || {};
  return {
    seed: seed, days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    sitDay: ts.seatDay, sitKind: ts.seatKind,
    walked: dw.walked || [], answers: dw.answers | 0, log: dw.log || [],
    lines: lines, verbs: verbs, errors: errors,
  };
}

(async function () {
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'table-transcripts-doorwalk-feared-b-s' + seed + '.json');
    if (fs.existsSync(file)) { console.error('TRANSCRIPT STOP: refusing to overwrite ' + file); process.exit(3); }
    const out = await oneRun(seed);
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({ seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      sitDay: out.sitDay, walked: out.walked, answers: out.answers, lines: out.lines.length, errors: out.errors.length,
      file: path.relative(REPO, file) }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
