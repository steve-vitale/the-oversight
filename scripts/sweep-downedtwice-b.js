#!/usr/bin/env node
'use strict';
// sweep-downedtwice-b.js — guardrail driver, arm sim-downedtwice-b
// (finding #2634: a downed companion struck again, "goes down" twice).
//
// Runs the competent policy verbatim, 150d death-aware, on a seed band,
// on the CURRENT checkout (control = pre-fix code, armed = post-fix
// code — the two legs differ only by the fieldFights.js fix, run in
// the same worktree before / after the fix commit). The fieldFight wrap
// is a PURE READ: it scans each fight's rec.log after the call for the
// downed-targeting invariants (a "goes down!" repeat for one ally in
// one fight; a hit line — or a strike line — naming an ally after that
// ally's "goes down!" in the same fight). The wrap draws no RNG and
// writes no game state, so the instrument cannot move a trajectory.
//
// Per-seed JSON carries the wall metrics (won, scaleRank, standing,
// wave unlocks, survival, deaths, endReason) plus the downed census,
// so the balanced-panel builder can map the contract metrics from it.
//
// Usage (control leg, BEFORE the fix commit):
//   SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 \
//   MODE=ctl OUTDIR=evidence/2026-11-21/perseed-downedtwice-b-control \
//   SEEDS=106801,...,106808 RUN=downedtwice-b node scripts/sweep-downedtwice-b.js
// Armed leg: same, with MODE=arm and the -armed OUTDIR, AFTER the fix.
// Exit 0 = all seeds wrote per-seed files, 0 instrument errors.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { stdSnapshot } = require(path.join(REPO, 'scripts', 'sweep-compare'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'downedtwice-b';
const MODE = process.env.MODE || 'ctl';
const OUTDIR = process.env.OUTDIR || ('perseed-downedtwice-b-' + MODE);

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
// FIX_PRESENT: the downedtwice fix is present when the fall block is
// transition-gated (was-live capture) AND the pick indexes _liveAllies.
// Each corpus file self-describes which code it ran under.
let FIX_PRESENT = false;
try {
  const ff = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  FIX_PRESENT = /var _hWasLive = _hHp > 0;/.test(ff) && /_liveAllies\[Math\.floor\(RR\(\) \* _liveAllies\.length\)\]/.test(ff);
} catch (e) {}

// Scan one fight record for the downed-targeting invariants. Pure read.
function auditFight(rec) {
  const log = rec.log || [];
  const downAt = {};
  const problems = [];
  let downCount = 0;
  for (let i = 0; i < log.length; i++) {
    const line = String(log[i]);
    const dm = line.match(/^(.+) goes down!$/);
    if (dm) {
      downCount++;
      if (downAt[dm[1]] != null) problems.push({ kind: 'repeat-goes-down', name: dm[1], line: i, firstAt: downAt[dm[1]] });
      else downAt[dm[1]] = i;
      continue;
    }
    const hm = line.match(/^R\d+: .* hits (.+?) for \d+ \(\d+ left\)/);
    if (hm && downAt[hm[1]] != null) problems.push({ kind: 're-hit', name: hm[1], line: i, firstAt: downAt[hm[1]] });
    const sm = line.match(/^R\d+: (.+?) strikes for /);
    if (sm && downAt[sm[1]] != null) problems.push({ kind: 'strike-after-down', name: sm[1], line: i, firstAt: downAt[sm[1]] });
  }
  return { problems: problems, downCount: downCount, downNames: Object.keys(downAt) };
}

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

async function runSeed(seed) {
  const errors = [];
  const census = { fights: 0, fightsWithDown: 0, goesDownLines: 0, repeatGoesDown: 0, reHitLines: 0, strikeAfterDown: 0, problems: [] };
  const { Game, manifest } = await loadGame({ seed: seed, mode: 'downedtwice-' + MODE, fullTelemetry: false });
  // Field-fight wrap: observe only. Installed before setupGame so every
  // fight in the run is censused, including early ones.
  try {
    const origFF = Game.fieldFight;
    if (typeof origFF === 'function') {
      Game.fieldFight = function (vid, mdef, m, opts) {
        const rec = origFF.apply(this, arguments);
        try {
          census.fights++;
          const a = auditFight(rec || {});
          census.goesDownLines += a.downCount;
          if (a.downCount > 0) census.fightsWithDown++;
          for (const p of a.problems) {
            if (p.kind === 'repeat-goes-down') census.repeatGoesDown++;
            else if (p.kind === 're-hit') census.reHitLines++;
            else if (p.kind === 'strike-after-down') census.strikeAfterDown++;
            if (census.problems.length < 10) {
              census.problems.push({
                seed: seed, day: (Game.state && Game.state.scholar && Game.state.scholar.day) || null,
                vid: vid, mid: mdef && mdef.id, wave: (mdef && mdef.wave) || null,
                outcome: rec && rec.outcome, rounds: rec && rec.rounds,
                kind: p.kind, name: p.name,
                excerpt: (rec.log || []).slice(Math.max(0, p.line - 1), p.line + 2).map(String),
              });
            }
          }
        } catch (e) { errors.push('downed-census: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else errors.push('fieldFight-wrap: not a function');
  } catch (e) { errors.push('fieldFight-wrap-install: ' + String(e.message).slice(0, 80)); }

  const selection = await setupGame(Game);
  if (selection && selection.status === 'excluded') return { seed: seed, excluded: true, selection: selection };

  const base = competent;
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const origDaily = base.daily;
  policy.daily = function (G, ctx) {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.tableEntered) hist.everEntered = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };

  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: manifest, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  return {
    seed: seed, arm: 'downedtwice-b', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, fixPresent: FIX_PRESENT,
    policySha: POLICY_SHA, policy: 'competent',
    substrate: {
      senseexped: process.env.SENSEEXPED || null, partysize4: process.env.PARTYSIZE4 || null,
      vetreengage: process.env.VETREENGAGE || null, fleerepair2: process.env.FLEEREPAIR2 || null,
      fightally2: process.env.FIGHTALLY2 || null, allyslot3: process.env.ALLYSLOT3 || null,
    },
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxRank: Object.keys(RANK_ORDER).find(function (k) { return RANK_ORDER[k] === hist.maxRank; }) || 'village',
    maxArc: hist.maxArc, table: hist.everTable || end.tableWaiting ? 1 : 0,
    entered: hist.everEntered || end.tableEntered ? 1 : 0,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    deaths: deaths, downedCensus: census, instrumentErrors: errors,
  };
}

async function main() {
  if (MODE !== 'ctl' && MODE !== 'arm') { console.error('DOWNEDTWICE STOP: MODE must be ctl|arm, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!SEEDS.length) { console.error('DOWNEDTWICE STOP: SEEDS env required (comma list)'); process.exit(2); }
  const outDir = path.join(REPO, OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  let bad = 0;
  for (const seed of SEEDS) {
    const out = await runSeed(seed);
    const fp = path.join(outDir, 'downedtwice-b-s' + seed + '.json');
    fs.writeFileSync(fp, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: seed, mode: MODE, fixPresent: out.fixPresent, days: out.days, gameDays: out.gameDays,
      endReason: out.endReason, won: out.won, scaleRank: out.scaleRank, standing: out.standing,
      maxWave: out.maxWave, deaths: (out.deaths || []).length,
      downed: out.downedCensus ? { fights: out.downedCensus.fights, withDown: out.downedCensus.fightsWithDown, goesDown: out.downedCensus.goesDownLines, repeats: out.downedCensus.repeatGoesDown, reHits: out.downedCensus.reHitLines } : null,
      errors: (out.instrumentErrors || []).length,
    }));
    if ((out.instrumentErrors || []).length) bad++;
  }
  if (bad) { console.error('DOWNEDTWICE: ' + bad + ' seed(s) with instrument errors'); process.exitCode = 1; }
}
main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
