// tendexact-driver-20261110.js — tend-exactness pilot driver
// (arm sim-tendexact-a, run fleshout-20261110T1215Z). Band 150201-150208,
// 150d death-aware, two legs through ONE driver, same substrate on both:
//   POLICY=answermail -> competent + answer-the-mail (the tend substrate)
//   RUN=tendexact-base  -> BASE code (fix off): the control leg. Run BEFORE
//                          the fix is applied in the worktree.
//   RUN=tendexact-armed -> FIXED code (fix on): the armed leg. Run AFTER
//                          the fix commit.
// Instrument: scripts/trustgrowth-instrument-20261109.js v2 reused
// VERBATIM (setter event log + seq intervals + _trustGain wrap, applied =
// actual move). The per-seed JSON carries the same fields as the
// answermail corpus, plus tendPaid (per-tend paid kcal, from the policy
// STATS events) and cappedTends (tend gains with requested 8, applied < 8
// — trust lost to the 100 cap, #2073, measured only). Per-seed JSON goes
// to evidence/2026-11-10/perseed-tendexact-a/, or $OUTDIR when set
// (proof legs use /tmp). Refuses to overwrite an existing per-seed file.
// Usage:
//   DAYS=150 SEEDS=150201..150208 RUN=tendexact-base POLICY=answermail node scripts/tendexact-driver-20261110.js
//   DAYS=150 SEEDS=150201..150208 RUN=tendexact-armed POLICY=answermail node scripts/tendexact-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const AM = require(path.join(REPO, 'scripts', 'policies', 'competent-answermail-a'));
const INST = require(path.join(REPO, 'scripts', 'trustgrowth-instrument-20261109'));

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
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'tendexact-base';
const POLICY_NAME = process.env.POLICY || 'answermail';
if (!SEEDS.length) { console.error('TENDEXACT STOP: SEEDS required.'); process.exit(2); }
if (POLICY_NAME !== 'answermail') { console.error('TENDEXACT STOP: POLICY must be answermail.'); process.exit(2); }
const policy = AM.answermailPolicy;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-tendexact-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'tendexact-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('TENDEXACT STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-answermail-tendexact', fullTelemetry: false });
  const trustSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/trust|tribute|tend|bond|polity|realm|season|link|accord|gesture|grain|grief/i.test(arg) && trustSays.length < 300) trustSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
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

  try { AM.resetAnswermailStats(); } catch (e) { errors.push('am-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let amStats = null;
  try { amStats = AM.answermailStats(); } catch (e) { errors.push('am-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}

  // Per-tend paid kcal (the primary metric), straight from the policy
  // STATS events — tendLink's return value per tend.
  const tendPaid = [];
  try {
    (amStats.events || []).forEach(function (ev) {
      if (ev && ev.kind === 'tend' && ev.detail && typeof ev.detail.paid === 'number') {
        tendPaid.push({ day: ev.day, linkId: ev.detail.linkId || null, paid: ev.detail.paid });
      }
    });
  } catch (e) { errors.push('tendPaid: ' + String(e.message).slice(0, 80)); }
  // Trust lost to the 100 cap (#2073, measure only): tend gains whose
  // requested +8 was capped short (applied < requested), classified by
  // the tendLink stack frame, as the trustgrowth analyzer does.
  const cappedTends = [];
  try {
    (t.gains || []).forEach(function (g) {
      if (g && g.requested === 8 && typeof g.applied === 'number' && g.applied < 8
        && typeof g.stack === 'string' && /tendLink/.test(g.stack)) {
        cappedTends.push({ day: g.day, linkId: g.linkId || null, requested: g.requested, applied: g.applied, lost: 8 - g.applied });
      }
    });
  } catch (e) { errors.push('cappedTends: ' + String(e.message).slice(0, 80)); }

  const out = {
    seed: seed, arm: 'tendexact', run: RUN, policy: POLICY_NAME, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    daily: t.daily, gains: t.gains, events: t.events, trustSays: trustSays, sayCount: sayCount,
    teleDeaths: (result.samples && result.samples.deaths) || null,
    answermailStats: amStats,
    tendPaid: tendPaid, cappedTends: cappedTends,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'tendexact-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const am = out.answermailStats || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      links: last.linkTotal != null ? last.linkTotal : null,
      accordAnswers: am.accordAnswers | 0, tends: am.tends | 0,
      tendPaid: out.tendPaid.map(function (x) { return x.paid; }),
      tendExact: out.tendPaid.filter(function (x) { return x.paid === 1500; }).length,
      tendOverpaid: out.tendPaid.filter(function (x) { return x.paid > 1500; }).length,
      cappedTends: out.cappedTends.length,
      capTrustLost: out.cappedTends.reduce(function (s, c) { return s + c.lost; }, 0),
      renegAnswers: am.renegotiationAnswers | 0, demandAnswers: am.demandAnswers | 0,
      starvation: ((out.teleDeaths || []).filter(function (e) { return e && e.cause === 'starvation'; })).length,
      deaths: (out.teleDeaths || []).length,
      gains: out.gains.length, events: out.events.length, snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
