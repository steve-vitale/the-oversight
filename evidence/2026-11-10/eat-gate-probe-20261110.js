// eat-gate-probe-20261110.js — instrument the EAT gate inputs per objPick.
// Usage: node evidence/2026-11-10/eat-gate-probe-20261110.js <repoRoot> <outRowsJson>
// Runs seed 84101, 30d, competent — the person-trust pin conditions — and
// records, per objPick call: day, vid, scholar?, hunger, energy, live pantry,
// away flag, and the kind picked. Prints one JSON summary line.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2];
const OUT = process.argv[3];
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));

(async () => {
  const { Game } = await loadGame({ seed: 84101, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const rows = [];
  const orig = Game.objPick;
  Game.objPick = function (vid, hx, hy) {
    const v = Game.state.village;
    let hunger = null, energy = null;
    try { const n = Game.npcNeeds(vid); hunger = (n && n.hunger) || 0; energy = (n && n.energy) || 0; } catch (e) {}
    let pantry = null;
    try { pantry = Game.pantryKcalLive(v); } catch (e) {}
    const away = !!((v.away || {})[vid]);
    const day = (Game.state.scholar && Game.state.scholar.day) || 0;
    const part = (typeof Game.dayPart === 'number') ? Game.dayPart : null;
    const o = orig.apply(this, arguments);
    rows.push({ day, part, vid, scholar: vid === Game.villagerId, hunger, energy, pantry, away, kind: o && o.kind });
    return o;
  };
  const policy = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  await runDays(Game, policy, { days: 30, quiet: true });

  const kinds = {};
  for (const r of rows) kinds[r.kind] = (kinds[r.kind] || 0) + 1;
  const npc = rows.filter(r => !r.scholar);
  const gatePass = npc.filter(r => (r.hunger || 0) > 55 && (r.pantry || 0) > 500);
  const eatRows = npc.filter(r => r.kind === 'EAT');
  const gatePassEat = gatePass.filter(r => r.kind === 'EAT').length;
  const gatePassRest = gatePass.filter(r => r.kind === 'REST').length;
  const gatePassOther = gatePass.filter(r => r.kind !== 'EAT' && r.kind !== 'REST').length;
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
  const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const hungers = npc.map(r => r.hunger || 0);
  const pantries = npc.map(r => (r.pantry == null ? 0 : r.pantry));
  // Per-day live pantry at first NPC pick of the day.
  const byDay = {};
  for (const r of npc) { if (byDay[r.day] === undefined) byDay[r.day] = r.pantry; }
  const summary = {
    repo: REPO,
    totalPicks: rows.length,
    npcPicks: npc.length,
    scholarPicks: rows.length - npc.length,
    awayPicks: npc.filter(r => r.away).length,
    kinds,
    npcEAT: eatRows.length,
    gatePass: gatePass.length,
    gatePassEat, gatePassRest, gatePassOther,
    hungerMean: mean(hungers), hungerMedian: med(hungers),
    hungerGt55: hungers.filter(h => h > 55).length,
    pantryMean: mean(pantries), pantryMedian: med(pantries),
    pantryGt500: pantries.filter(p => p > 500).length,
    pantryByDay: byDay,
    awayEAT: npc.filter(r => r.away && r.kind === 'EAT').length,
  };
  fs.writeFileSync(OUT, JSON.stringify(rows));
  console.log('PROBE ' + JSON.stringify(summary));
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
