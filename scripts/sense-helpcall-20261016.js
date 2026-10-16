#!/usr/bin/env node
'use strict';
// sense-helpcall-20261016.js — villager liveness sample for the sim-helpcall
// arm (SENSE-TESTING LAW: villagers must act like people — goals, routines,
// differentiation, reactions to events).
//
// Runs one armed seed 60d and prints: villager snapshots (occupation,
// profile, xp tracks, kills, expeditions) at d30/d60, plus any aid/raid
// beats. A living village shows differentiation (xp tracks diverging,
// occupations doing their jobs, kills/expeditions spread) — a robotic one
// shows flat zeros.
//
// Run: SEATDRIVE=0 FEASTSCALE_R13=1 NODEWITNESS=1 HELPCALL=1 node scripts/sense-helpcall-20261016.js
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const HC = require('./policies/helpcall');

for (const k of [['SEATDRIVE', '0'], ['FEASTSCALE_R13', '1'], ['NODEWITNESS', '1'], ['HELPCALL', '1']]) {
  if (process.env[k[0]] !== k[1]) { console.error(`SUBSTRATE: ${k[0]} must be ${k[1]}`); process.exit(2); }
}

function snap(Game) {
  const out = [];
  try {
    const v = Game.state.village || {};
    for (const vid of (v.roster || [])) {
      let person = null, ag = null;
      try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      try { ag = Game.agencyOf ? Game.agencyOf(vid) : null; } catch (e) {}
      const axp = ((ag || {}).xp || {})[vid] || {};
      const astats = ((ag || {}).stats || {})[vid] || {};
      out.push({
        name: (person && (person.name || person.id || vid) || String(vid)).slice(0, 22),
        occ: ((person && (person.occupationId || person.formerOccupation)) || '?').slice(0, 16),
        xp: [axp.tracking || 0, axp.survival || 0, axp.bravery || 0].join('/'),
        kills: astats.monsterKills || 0, exped: astats.expeditions || 0,
        dead: !!(person && person.dead),
      });
    }
  } catch (e) {}
  return out;
}

(async () => {
  const { Game } = await loadGame({ seed: 955, mode: 'helpcall-sense', fullTelemetry: false });
  await setupGame(Game, null, 'courtship');
  const policy = Object.assign({}, HC.leadhc);
  const base = policy.daily;
  const snaps = {};
  policy.daily = (G, ctx) => {
    const d = (G.state.scholar || {}).day || 0;
    if (d === 30 || d === 60) snaps[d] = snap(G);
    return base(G, ctx);
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 60, manifest: { seed: 955 } }); });
  snaps.end = snap(Game);
  for (const d of [30, 60, 'end']) {
    const rows = snaps[d] || [];
    const living = rows.filter(r => !r.dead);
    console.log(`\n--- day ${d}: ${living.length} living of ${rows.length} ---`);
    for (const r of living.slice(0, 14)) {
      console.log(`  ${r.name.padEnd(22)} ${r.occ.padEnd(16)} xp(t/s/b)=${r.xp} kills=${r.kills} exped=${r.exped}`);
    }
    const xpTot = living.reduce((t, r) => t + r.xp.split('/').reduce((a, b) => a + (+b), 0), 0);
    const killers = living.filter(r => r.kills > 0).length;
    console.log(`  [liveness] total xp=${xpTot} villagers-with-kills=${killers}/${living.length}`);
  }
  console.log(`\nrun: gameDays=${result.gameDays} end=${result.endReason}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
