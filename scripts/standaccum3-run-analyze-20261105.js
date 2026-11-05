// standaccum3-run-analyze-20261105.js — run + analyze IN PROCESS (arm
// sim-standaccum3-b). Fallback for the host write flap (EPERM): this
// driver NEVER writes corpus files — it runs each seed, analyzes the
// in-memory row with the same analyzeSeed() the file analyzer uses,
// and prints ONLY small summaries to stdout (tool capture, a pipe).
// Full dayTables print ONLY for interesting seeds (flat-20,
// gatedPeak >= 199, premise L>=2, or readyDays > 0); standing-says
// samples print ONLY for those seeds (cap 40 lines). No src/js.
// Usage:
//   DAYS=150 SEEDS=99191,99192 RUN=standaccum3-pilot node scripts/standaccum3-run-analyze-20261105.js
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'standaccum3-instrument-20261105'));
const AN = require(path.join(REPO, 'scripts', 'standaccum3-analyze-20261105'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'standaccum3-pilot';
if (!SEEDS.length) { console.error('STANDACCUM3 STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-standaccum3', fullTelemetry: false });
  const fightSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/fought|slain|killed|veteran|blood your|HELD|draft waits|stood and fought|Standing|next act|fifth draft|WAVE LEDGER|feast|RATINGS ARE UP/i.test(arg) && fightSays.length < 300) fightSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  return {
    seed: seed, arm: 'standaccum3', run: RUN, anchorCommit: ANCHOR, instrumentOff: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    standingBreakdown: fin ? fin.standingBreakdown : null,
    w3pts: fin ? fin.w3pts : null, w4pts: fin ? fin.w4pts : null, w5pts: fin ? fin.w5pts : null,
    perType3: fin ? fin.perType3 : null, perType4: fin ? fin.perType4 : null, perType5: fin ? fin.perType5 : null,
    feastLog: fin ? fin.feastLog : null,
    fights: t.fights, daily: t.daily, fightSays: fightSays, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
}

(async function () {
  const summaries = [];
  for (const seed of SEEDS) {
    const row = await oneRun(seed);
    const s = AN.analyzeSeed(row);
    const interesting = s.flat20 || (s.gatedPeak != null && s.gatedPeak >= 199) || s.living2Days.length > 0;
    const summary = {
      seed: s.seed, days: s.days, endReason: s.endReason,
      won: s.won, scaleRank: s.scaleRank, unlockedWave: s.unlockedWave, maxWave: s.maxWave,
      w2plusFights: s.w2plusFights, w3fights: s.w3fights, w3kills: s.w3kills, w3killRate: s.w3killRate, w3outcomes: s.w3outcomes,
      w4fights: s.w4fights, w5fights: s.w5fights, killsByWave: s.killsByWave,
      endRaw: s.endRaw, endGated: s.endGated, rawPeak: s.rawPeak, gatedPeak: s.gatedPeak,
      endWar: s.endWar, endDiplomacy: s.endDiplomacy, endPlenty: s.endPlenty,
      endWarPts: s.endWarPts, endW3pts: s.endW3pts, endW4pts: s.endW4pts, endW5pts: s.endW5pts,
      endLinks: s.endLinks, endLinksSeasoned: s.endLinksSeasoned, endLinksRegionalDirect: s.endLinksRegionalDirect,
      endLinksTotal: s.endLinksTotal, endFeasts: s.endFeasts, endFeastQualityHist: s.endFeastQualityHist,
      endPerType3: s.endPerType3, endPerType4: s.endPerType4,
      endCapped: s.endCapped, endPeak: s.endPeak,
      flatBand: s.flatBand, winW2Fights: s.winW2Fights, flat20: s.flat20, failedClauses: s.failedClauses,
      sameShape: s.sameShape, activityTracking: s.activityTracking,
      killersEver: s.killersEver, killers: s.killers,
      maxLiving: s.maxLiving, living2Days: s.living2Days,
      mismatchDays: s.mismatchDays, snapshotDays: s.snapshotDays,
      instrumentErrors: s.instrumentErrors, sayCount: row.sayCount,
    };
    summaries.push(summary);
    console.log('SA3-SEED ' + JSON.stringify(summary));
    if (interesting) {
      if (process.env.SA3_DAYTABLE === '1') console.log('SA3-DAYTABLE ' + seed + ' ' + JSON.stringify(s.dayTable));
      // Standing-says: lines mentioning standing/ledger/feast/draft,
      // plus lines around the gated-peak day — the standing story.
      const peakDay = s.dayTable.reduce(function (m, d) { return (d.gated > (m.gated || 0)) ? d : m; }, { day: 0, gated: 0 }).day;
      const keyDays = {};
      [peakDay].concat(s.killers.map(function (k) { return k.firstDay; }), s.killers.map(function (k) { return k.deathDay; }))
        .forEach(function (d) { if (d != null) for (let o = -5; o <= 5; o++) keyDays[d + o] = true; });
      const keySays = row.fightSays.filter(function (x) {
        return keyDays[x.day] || /Standing|WAVE LEDGER|feast|next act|fifth draft|RATINGS ARE UP/i.test(x.line);
      }).slice(0, 40);
      console.log('SA3-SAYS ' + seed + ' ' + JSON.stringify(keySays));
    }
  }
  console.log('SA3-DONE ' + JSON.stringify({ n: summaries.length, flatSeeds: summaries.filter(function (s) { return s.flat20; }).map(function (s) { return s.seed; }) }));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
