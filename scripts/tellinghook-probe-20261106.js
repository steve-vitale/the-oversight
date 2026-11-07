'use strict';
// tellinghook-probe-20261106.js — probe for the narrated-telling hook
// (evidence/2026-11-06/sim-durablepair-a-prereg.md, part b). Re-runs ONE
// drive64 seed deterministically on a DRIVE-BRANCH checkout (the drive
// build lives only there; this script refuses a drive-less root), with
// Game.say wrapped, capturing EVERY say line across the full 150d plus
// the wave-4 kill log, killer death days and driveSeek counters at end.
// READ-ONLY with respect to trajectory: wrapping say changes nothing
// (output only). The hook itself is narration-only by the same token.
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel \
//   WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1 \
//   node scripts/tellinghook-probe-20261106.js <drive-root> <seed> <out.json>
// DRIVESEEK=0 selects the OFF arm; unset selects ON (the drive). The
// <drive-root> must contain the drive code (villager-objectives.js with
// objTellHuntSite); otherwise the script exits 2 with a clear message.
// A telling line is a SAY line matching /tells the hall/ — the hook's
// sentence. Compare the unpatched and patched probe outputs on the same
// seed: telling lines must appear with the patch, and driveSeek counters,
// kills and pair outcome must be byte-identical without it.
const fs = require('fs');
const path = require('path');

const driveRoot = process.argv[2];
const SEED = parseInt(process.argv[3] || '0', 10);
const outPath = process.argv[4];
if (!driveRoot || !SEED) {
  console.error('usage: node scripts/tellinghook-probe-20261106.js <drive-root> <seed> <out.json>');
  process.exit(2);
}
try {
  const objs = fs.readFileSync(path.join(driveRoot, 'src', 'js', 'villager-objectives.js'), 'utf8');
  if (!objs.includes('objTellHuntSite')) {
    console.error('STOP: drive code absent in ' + driveRoot + ' (no objTellHuntSite) — this probe runs on the drive branch only.');
    process.exit(2);
  }
} catch (e) {
  console.error('STOP: cannot read drive root ' + driveRoot + ': ' + (e && e.message));
  process.exit(2);
}
const { loadGame, setupGame, runDays } = require(path.join(driveRoot, 'scripts', 'sim-harness'));
const { competent } = require(path.join(driveRoot, 'scripts', 'policies', 'competent'));

(async () => {
  const { Game, manifest } = await loadGame({ seed: SEED, mode: 'tellinghook-probe', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push('[d' + day + '] ' + String(x).slice(0, 700));
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  const policy = Object.assign({}, competent);
  await runDays(Game, policy, { days: 150, manifest, sampleEvery: 10 });
  const st = Game.state || {};
  const v = st.village || {};
  const log = (st.waveKillLog || []).filter(e => e && (e.w || 0) >= 4);
  const byName = {};
  for (const p of (Game.data || {}).villagers || []) if (p && p.id) byName[p.id] = p.name || p.id;
  for (const p of (Game.data || {}).background_survivors || []) if (p && p.id && !byName[p.id]) byName[p.id] = p.name || p.id;
  const kills = log.map(e => ({
    day: (e.d != null ? e.d : e.day) || 0, wave: e.w, by: e.by,
    byName: byName[e.by] || e.by, type: e.mid || e.type || null,
  })).sort((a, b) => a.day - b.day);
  const deathDay = {};
  for (const f of (v.fallen || [])) if (f && f.villagerId) deathDay[f.villagerId] = f.day || 0;
  const tellingLines = lines.filter(l => /tells the hall/.test(l));
  const out = {
    seed: SEED, arm: process.env.DRIVESEEK === '0' ? 'off' : 'on',
    days: (st.scholar || {}).day || 0,
    kills, driveSeek: v.driveSeek || {},
    killersDeathDay: kills.reduce((o, k) => { if (deathDay[k.by] !== undefined) o[k.by] = deathDay[k.by]; return o; }, {}),
    sayLinesTotal: lines.length,
    tellingLines,
    tellingCount: tellingLines.length,
  };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  console.log(JSON.stringify({
    seed: SEED, arm: out.arm, days: out.days, kills: kills.length,
    sayLines: lines.length, tellingCount: tellingLines.length,
    dsTold: (v.driveSeek || {}).told || 0, dsSeeks: (v.driveSeek || {}).seeks || 0,
    dsScoutSeen: (v.driveSeek || {}).scoutSeen || 0, dsScoutEmpty: (v.driveSeek || {}).scoutEmpty || 0,
  }));
})().catch(e => { console.error('probe error: ' + (e && e.stack || e)); process.exit(1); });
