'use strict';
// Prepared settlement proof; actors enter through the actual party join path.
const K = require('./lib'), T = K.reporter('party-fight-deeds');
(async () => {
  const G = await K.load({ seed: Number(process.env.TEST_SEED||36) });
  function ready(alien = false) {
    K.newRun(G);
    G.state.systemArrived = true;
    const s = G.state.scholar, v = G.state.village, me = G.villagerId;
    const ids = v.roster.filter(id => id !== me).slice(0, 5);
    G.ensureVillagerPositions();
    for (const id of v.roster) v.positions[id] = { mx: 8, my: 8 };
    ids.slice(0, 4).forEach((id, i) => { v.positions[id] = { mx: 2 + i % 2, my: 3 + Math.floor(i / 2) }; });
    const foe = K.fight(G, 'hushwolf', { party: true }), f = G.tbfight;
    if (alien) foe.alienPid = 'prepared-alien-player';
    const allies = ids.slice(0, 4).map(id => f.fighters.find(x => x.kind === 'villager' && x.villagerId === id));
    if (allies.some(x => !x)) throw new Error('Prepared people did not join the actual tactical party');
    return { s, v, me, ids, allies, f, foe };
  }
  function xp(id) { const x = G.npcXp(id); return { combat: x.combat || 0, strange: x.strange || 0 }; }
  let c = ready(true), [live, dead, fled, zero] = c.allies;
  dead.alive = false; dead.hp = 0; fled.fled = true; zero.hp = 0;
  c.f.fighters.push({ ...live, key: 'duplicate-person' }, { ...live, key: 'unknown-person', villagerId: 'no-such-person' }, { ...live, key: 'summon', kind: 'ally', villagerId: c.ids[4] }, { ...live, key: 'bearer-alias', villagerId: c.me });
  const before = c.ids.map(xp), pBefore = G.playerTracks().strange.xp;
  G.tbEnd('won');
  T.ok('surviving party member earns the shared victory and actual alien deeds once', xp(c.ids[0]).combat === before[0].combat + 2 && xp(c.ids[0]).strange === before[0].strange + 2);
  T.ok('dead participant and zero-HP stale survivor earn nothing', JSON.stringify(xp(c.ids[1])) === JSON.stringify(before[1]) && JSON.stringify(xp(c.ids[3])) === JSON.stringify(before[3]));
  T.ok('a personal retreat earns survival instead of a group victory', xp(c.ids[2]).combat === before[2].combat + 1 && xp(c.ids[2]).strange === before[2].strange + 2);
  T.ok('absent and summoned actors get no village progression', JSON.stringify(xp(c.ids[4])) === JSON.stringify(before[4]) && !c.v.npcXp['no-such-person']);
  T.ok('the bearer keeps exactly its existing alien contact credit', G.playerTracks().strange.xp === pBefore + 2);
  const settled = JSON.stringify(c.v.npcXp);
  G.tbfight = c.f; G.tbEnd('won');
  T.ok('replaying the settled fight cannot repeat party credit', JSON.stringify(c.v.npcXp) === settled);
  G.tbfight = null;
  for (const result of ['fled', 'calmed', 'routed']) {
    c = ready(); const before = xp(c.ids[0]);
    G.tbEnd(result);
    T.ok(result + ' grants only the existing matching combat deed and no alien XP', xp(c.ids[0]).combat === before.combat + (result === 'routed' ? 0 : 1) && xp(c.ids[0]).strange === before.strange);
  }
  c = ready();
  const ordinary = xp(c.ids[0]); G.tbEnd('won');
  T.ok('an ordinary monster victory earns combat credit without inventing alien contact', xp(c.ids[0]).combat === ordinary.combat + 2 && xp(c.ids[0]).strange === ordinary.strange);
  c = ready(true);
  const defeatBefore = new Map(c.ids.map(id => [id, xp(id)]));
  const credit = G.creditDeed, earned = [];
  G.creditDeed = function (who, deed) {
    const id = who === 'player' || who === this.villagerId ? this.villagerId : who;
    const track = G.trackData().deeds[deed]?.track;
    const total = () => id === this.villagerId ? (this.state.scholar.tracks?.[track]?.xp || 0) : (this.state.village.npcXp?.[id]?.[track] || 0);
    const before = total(), result = credit.apply(this, arguments), n = total() - before;
    if (n > 0) earned.push({ id, deed, n });
    return result;
  };
  const player = G.tbFighter('p'); player.hp = 0; player.alive = false;
  try { G.tbEnd('lost'); } finally { G.creditDeed = credit; }
  const ownStrange = id => id === G.villagerId ? G.playerTracks().strange.xp : xp(id).strange;
  const alienCredits = earned.filter(e => e.deed === 'alien_fight');
  // Defeat also legitimately earns family-death XP and the successor's
  // mantle XP. Keep those separate from the actual alien-fight receipt.
  T.ok('living party survivors retain their own alien credit after the player falls', c.ids.slice(0, 4).every(id => alienCredits.filter(e => e.id === id).reduce((n, e) => n + e.n, 0) === 2 && ownStrange(id) === defeatBefore.get(id).strange + earned.filter(e => e.id === id && G.trackData().deeds[e.deed]?.track === 'strange').reduce((n, e) => n + e.n, 0)));
  T.ok('after defeat, alien credit belongs exactly to the four actual survivors', alienCredits.length === 4 && alienCredits.every(e => c.ids.slice(0, 4).includes(e.id)));
  c = ready(true);
  const x = G.npcXp(c.ids[0]); x.strange = 16; x.granted.strange = 0; x.sheets = [];
  G.tbEnd('fled');
  T.ok('earned alien contact crosses the actual shared threshold and queues its sheet', x.strange === 18 && x.sheets.some(s => s.track === 'strange' && s.level === 1));
  T.ok('crossing a threshold does not bypass the NPC knowledge/choice step', !G.npcHasAbility(c.ids[0], 'second_wind'));
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
