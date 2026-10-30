#!/usr/bin/env node
// test-rankconv-sense-b.js — DIAG sense read for sim-rankconv-b.
// Re-runs one seed under competent play (deterministic: same trajectory
// as the gate leg) and captures what the gate recorder did not: the
// day-stamped death list and villager-roster snapshots on the days
// around the seed's standing jumps. Read-only: no src/js, no policy
// defaults, no game defaults changed. The recorder reads state; it
// never decides for villagers (PERCEPTION LAW).
// Usage: node scripts/test-rankconv-sense-b.js <seed> <out-json>
// Refuses to overwrite an existing output file.
'use strict';
const fs = require('fs');
async function main() {
  const seed = parseInt(process.argv[2], 10);
  const out = process.argv[3];
  if (!Number.isFinite(seed) || !out) { console.error('usage: node scripts/test-rankconv-sense-b.js <seed> <out-json>'); process.exit(2); }
  if (fs.existsSync(out)) { console.error('REFUSING to overwrite: ' + out); process.exit(3); }
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { competent } = require('./policies/competent');
  const { Game, manifest } = await loadGame({ seed, mode: 'rankconv-sense', fullTelemetry: false });
  await setupGame(Game);
  const WATCH = new Set([1, 30, 60, 100, 103, 110, 150, 159, 160, 180]);
  const snapshots = {};
  const rosterSnap = () => {
    try {
      const v = Game.state.village || {}, a = v.agency || {};
      return (v.roster || []).map((vid) => {
        const p = (Game.data.villagers || []).find((x) => x.id === vid) || (Game.data.background_survivors || []).find((x) => x.id === vid);
        const name = p ? (p.name || p.id) : String(vid);
        return { name: String(name).slice(0, 24), occ: (p && (p.occupationId || p.formerOccupation)) || '?', profile: (a.profiles && a.profiles[vid]) || '?', abilities: ((v.npcAbilities && v.npcAbilities[vid]) || []).slice(0, 4) };
      });
    } catch (e) { return []; }
  };
  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      const day = (Game.state.scholar || {}).day || 0;
      if (WATCH.has(day) && !snapshots[day]) {
        snapshots[day] = {
          day, scholar: safeName(), rank: safeFn(() => Game.scaleRank()),
          standing: safeFn(() => Game.villageStanding()),
          pantryKcal: safeFn(() => ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)),
          roster: rosterSnap(),
        };
      }
    } catch (e) {}
  };
  function safeName() { try { const s = Game.state.scholar; const p = s ? Game.getPerson(Game.villagerId) : null; return p ? (p.name || Game.villagerId) : String(Game.villagerId); } catch (e) { return '?'; } }
  function safeFn(fn) { try { return fn(); } catch (e) { return null; } }
  const result = await runDays(Game, policy, { days: 180, manifest, sampleEvery: 10 });
  const deaths = (result.samples.deaths || []).map((d) => ({ day: d.day, kind: d.kind, who: d.who, cause: d.cause, player: !!d.player }));
  const row = { lever: 'sim-rankconv-b-sense', policy: 'competent', seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason, snapshots, deaths, scholarDeaths: deaths.filter((d) => d.player) };
  fs.writeFileSync(out, JSON.stringify(row, null, 1));
  console.log(`[rankconv-sense seed ${seed}] days=${row.days} end=${row.endReason} snapshots=${Object.keys(snapshots).length} deaths=${deaths.length} scholarDeaths=${row.scholarDeaths.length} -> ${out}`);
}
if (require.main === module) main().catch((e) => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
