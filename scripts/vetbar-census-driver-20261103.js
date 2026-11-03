// vetbar-census-driver-20261103.js — supplementary census driver (arm
// sim-vetbar-a). Same policy (competent VERBATIM), same seeds, same 140d
// death-aware horizon as the run-1 pilot; only the instrument differs.
// Per-seed JSON to evidence/2026-11-03/perseed-vetbar-census-a/; refuses
// to overwrite. Prints a per-seed summary incl. trajectory identity vs
// the run-1 pilot file (days, endReason, kill rows must match exactly).
// Usage:
//   DAYS=140 SEEDS=99101,99102 RUN=vetbar-census node scripts/vetbar-census-driver-20261103.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'vetbar-census-instrument-20261103'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'vetbar-census';
if (!SEEDS.length) { console.error('VETBAR-CENSUS STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-vetbar-census-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'census-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('VETBAR-CENSUS STOP: refusing to overwrite ' + file); process.exit(3); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-vetbar-census', fullTelemetry: false });
  const errors = [];
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
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  const st = Game.state || {};
  // Trajectory identity vs run-1 pilot file.
  let identity = 'no-run1-file';
  try {
    const run1 = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-03', 'perseed-vetbar-a', 'vetbar-s' + seed + '-vetbar-pilot.json'), 'utf8'));
    const sameKills = JSON.stringify((run1.killRows || []).map(function (r) { return [r.day, r.mid, r.by, r.via]; }))
      === JSON.stringify(t.killRows.map(function (r) { return [r.day, r.mid, r.by, r.via]; }));
    identity = (run1.days === result.days && run1.endReason === result.endReason && sameKills) ? 'MATCH' : 'DIVERGED';
  } catch (e) { identity = 'run1-read-error: ' + String(e.message).slice(0, 60); }
  const last = t.daily[t.daily.length - 1] || {};
  const tbByResult = {};
  t.tbEnds.forEach(function (r) { tbByResult[r.result] = (tbByResult[r.result] || 0) + 1; });
  const fieldByOutcome = {};
  t.fields.forEach(function (r) { fieldByOutcome[r.outcome] = (fieldByOutcome[r.outcome] || 0) + 1; });
  const w4MonsterKilled = t.tbEnds.filter(function (r) { return r.monsters.some(function (m) { return !m.alive; }); }).length;
  return {
    seed: seed, run: RUN, anchorCommit: ANCHOR, days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1, identity: identity,
    spawnsW4: t.spawns.length, startsW4: t.starts.length,
    tbEndsW4: t.tbEnds.length, tbByResult: tbByResult, tbMonsterKilledFights: w4MonsterKilled,
    fieldsW4: t.fields.length, fieldByOutcome: fieldByOutcome,
    killsW4: t.killRows.length, facedW4End: (last.facedW4 || []).length, facedW4: last.facedW4 || [],
    wrapCounts: t.wrapCounts, instrumentErrors: t.instrumentErrors.concat(errors),
    spawns: t.spawns, starts: t.starts, tbEnds: t.tbEnds, fields: t.fields, killRows: t.killRows, daily: t.daily,
  };
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'census-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, end: out.endReason, identity: out.identity,
      spawnsW4: out.spawnsW4, startsW4: out.startsW4, tbEndsW4: out.tbEndsW4,
      tbByResult: out.tbByResult, tbKilledFights: out.tbMonsterKilledFights,
      fieldsW4: out.fieldsW4, fieldByOutcome: out.fieldByOutcome,
      killsW4: out.killsW4, facedW4: out.facedW4End, errors: out.instrumentErrors.length,
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
