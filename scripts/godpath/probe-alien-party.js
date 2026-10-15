'use strict';
// Prepared construction diagnostic, not a natural fight or a balance result.
const K = require('./lib');
(async () => {
  const G = await K.load({ seed: 36 });
  K.newRun(G); G.state.systemArrived = true;
  const v = G.state.village, id = v.roster.find(x => x !== G.villagerId);
  G.ensureVillagerPositions();
  for (const who of v.roster) v.positions[who] = { mx: 8, my: 8 };
  v.positions[id] = { mx: 2, my: 3 };
  v.health = v.health || {}; v.health[id] = 77;
  G.state.scholar.mx = 2; G.state.scholar.my = 4;
  const pid = G.data.alienPlayers[0].id, advance = G.tbAdvance;
  // Inspect the real builder before any actor takes a turn.
  G.tbAdvance = () => {};
  try {
    const started = G.apStartEncounter(pid);
    const ally = G.tbfight?.fighters.find(x => x.villagerId === id);
    process.stdout.write(JSON.stringify({ prepared: true, advancePaused: true,
      started, alien: pid, who: id, worldHealth: v.health[id],
      fighter: ally ? { hp: ally.hp, maxHp: ally.maxHp,
        wbonus: ally.wbonus ?? null, varmor: ally.varmor ?? null } : null,
    }, null, 2) + '\n');
  } finally { G.tbAdvance = advance; }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
