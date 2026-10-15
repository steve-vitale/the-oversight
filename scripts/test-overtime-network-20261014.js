#!/usr/bin/env node
// test-overtime-network-20261014.js — the Table's waiting cost and the key
// (Steve 2026-10-14: "waiting should have a cost- but also an opportunity for
// the truly powerful ... Something that has to be fought across the entire
// map ... a key to unlock the best ending for humans at the table.").
//
//  1. Overtime: tiers rise weekly only while the Table exists and is unseated
//     (not before day 90 / announcement; stops when seated); telemetry + aloud.
//  2. Reruns: wave-4/5 fights scale by tier (HP, damage, pack, label); tier 0
//     is unchanged; raids/cap/seat price reflect the tier.
//  3. The key needs BOTH overtime >= keyTier AND herald+nielsen+finale slain.
//  4. The Network: one node per map sector, march in order, coalition gate,
//     dead stay dead, ends with networkFallen (+tele); a spent coalition loses it.
//  5. The Table offers THE HOSTS on every path only with the key.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('overtime-network');

function coalition(n) {
  const allies = [];
  for (let i = 0; i < n; i++) allies.push({ villageId: 'tv' + (i % 10), vid: 'tb' + i, name: 'Blade ' + i, hp: 100, outfitted: [], gearValue: 0, wbonus: 3, varmor: 3 });
  return { allies, haven: [], day: 100, outfitted: {} };
}

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const s = Game.state.scholar, pg = Game.progState();
  Game.state.systemArrived = true;
  Game.tableSeat = () => ({ seat: 'lesser', detail: {} });
  Game.say = () => {}; Game.sysSay = () => {};
  const dawn = () => { s.day++; Game.overtimeTick(); };

  T.section('1. overtime clock');
  pg.tableWaiting = true;
  s.day = 60;
  for (let i = 0; i < 20; i++) dawn();
  T.ok('before day 90 (table not announced): no clock, tier 0', Game.overtimeTier() === 0 && !pg.overtimeStarted);
  s.day = 90; Game.tableAnnounce();
  T.ok('announced at day 90', pg.tableAnnounced === true);
  for (let i = 0; i < 7; i++) dawn();
  T.ok('6 unseated days after the announcement dawn: still tier 0', Game.overtimeTier() === 0, 'tier ' + Game.overtimeTier());
  dawn();
  T.ok('7 unseated days: tier 1', Game.overtimeTier() === 1);
  for (let i = 0; i < 14; i++) dawn();
  T.ok('21 unseated days: tier 3', Game.overtimeTier() === 3);
  const tiers = K.teleEvents(Game, 'overtime_tier').map(e => e.tier);
  T.ok('tele overtime_tier fired once per tier (1,2,3)', tiers.join(',') === '1,2,3', tiers.join(','));
  for (let i = 0; i < 80; i++) dawn();
  T.ok('tier caps at 6', Game.overtimeTier() === 6);
  pg.overtime = 3; pg.overtimeDays = 21;
  pg.tableDone = true;
  for (let i = 0; i < 30; i++) dawn();
  T.ok('seated (tableDone): the tier stops rising', Game.overtimeTier() === 3);
  pg.tableDone = false;
  const pv = Game.tablePreview();
  T.ok('seat price shows the cost honestly (tier 3 = standing -12)', pv && pv.overtime === 3 && pv.standingCost === 12, JSON.stringify(pv));
  pg.overtimeLosses = 2;
  T.ok('Haven losses lower it further (-12 -6)', Game.overtimeStanding().penalty === 18);
  pg.overtimeLosses = 0;

  T.section('2. reruns');
  pg.overtime = 0;
  const base = (Game.data.monsters.find(m => m.id === 'cancellation') || {}).hp;
  let mf = K.fight(Game, 'cancellation');
  const n0 = Game.tbfight.fighters.filter(f => f.kind === 'monster').length;
  T.ok('tier 0: cancellation untouched (HP in data range, no label)', mf.hp <= base[1] && !/RERUN/.test(mf.name) && !Game.tbfight.otTier);
  const pf0 = Game.tbFighter('p'); pf0.hp = 500; pf0.maxHp = 500;
  Game.tbDamage('p', 100, 'test', mf.key, { undodgeable: true });
  const drop0 = 500 - pf0.hp;
  Game.tbEnd('fled');
  pg.overtime = 2;
  mf = K.fight(Game, 'cancellation');
  const ms = Game.tbfight.fighters.filter(f => f.kind === 'monster');
  T.ok('tier 2: HP x1.5 (above the data max)', mf.hp >= Math.round(base[0] * 1.5) && mf.hp > base[1], 'hp ' + mf.hp);
  T.ok('tier 2: "RERUN ×2" label', /RERUN ×2/.test(mf.name), mf.name);
  T.ok('tier 2: +1 in the pack', ms.length === n0 + 1 && ms.every(m => m.otTier === 2), ms.length + ' vs ' + n0);
  const pf2 = Game.tbFighter('p'); pf2.hp = 500; pf2.maxHp = 500;
  Game.tbDamage('p', 100, 'test', mf.key, { undodgeable: true });
  T.ok('tier 2: its hits land harder', (500 - pf2.hp) > drop0, `${500 - pf2.hp} vs ${drop0}`);
  Game.tbEnd('fled');
  mf = K.fight(Game, 'hushwolf');
  T.ok('wave-1 monsters are not reruns', !Game.tbfight.otTier && !/RERUN/.test((mf || {}).name || ''));
  Game.tbEnd('fled');
  const rk = Game.overtimeRaidKnobs();
  T.ok('raids sooner and likelier at tier 2 (cooldown 5, skip 0.70)', rk && rk.cooldown === 5 && Math.abs(rk.skip - 0.70) < 1e-9, JSON.stringify(rk));
  pg.overtime = 0;
  T.ok('tier 0: raid knobs off (old behaviour)', Game.overtimeRaidKnobs() === null);

  T.section('3. the key');
  Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
  const st = Game.state.titans;
  st.slain = { herald: true, finale: true };
  pg.overtime = 3;
  T.ok('tier 3 but only two titans: no key', Game.networkKeyReady() === false);
  pg.overtime = 2; st.slain.nielsen = true;
  T.ok('all three titans but tier 2: no key', Game.networkKeyReady() === false);
  T.ok('tier 2 airs the uncast apocalypse (the third titan)', Game.overtimeThirdTitan() === (Game.titanCast().apocalypse === 'finale' ? 'nielsen' : 'finale'));
  pg.overtime = 3;
  T.ok('tier 3 + all three titans: the key is ready', Game.networkKeyReady() === true);
  Game.state.worldMonsters = [];
  pg.overtimeLastDay = -1; pg.tableDone = false;
  Game.overtimeTick();
  T.ok('the overtime dawn summons THE NETWORK', pg.networkSummoned === true && Game.networkCampaign().summoned);

  T.section('4. the network');
  const nodes = Game.networkNodes();
  const sectors = new Set(nodes.map(n => n.sector.join(',')));
  T.ok('one node per 3x3 sector of the 9x9 map (9 nodes, 9 sectors)', nodes.length === 9 && sectors.size === 9);
  T.ok('the heart is last', nodes[8].piece === 'heart');
  const pieces = Game.worldMonsters().filter(m => m.networkNode);
  T.ok('every piece is on the map, inside its own sector', pieces.length === 9 && pieces.every(m => {
    const n = nodes.find(x => x.id === m.networkNode);
    return Math.floor(m.tx / 3) === n.sector[0] && Math.floor(m.ty / 3) === n.sector[1];
  }), pieces.map(m => m.networkNode + '@' + m.tx + ',' + m.ty).join(' '));
  T.ok('piece defs are campaign-only, bigger than the finale', ['network_tower', 'network_limb', 'network_heart'].every(id => {
    const d = Game.data.monsters.find(m => m.id === id); return d && d.campaignOnly && d.hp[0] > 2200;
  }));
  const goTo = (node) => { const t = Game.networkCampaign().tiles[node.id]; Game.map.px = t.x; Game.map.py = t.y; s.mx = 1; s.my = 4; };
  goTo(nodes[0]);
  T.ok('first node refused without 20 blades', Game.startCombat('network_tower') == null && !Game.tbfight);
  st.musters.the_network = coalition(20);
  goTo(nodes[2]);
  T.ok('march in order: the third mast refuses while the first stands', Game.startCombat('network_tower') == null);
  let marched = 0, okAll = true, beforeHeart = -1;
  for (const node of nodes) {
    goTo(node);
    const r = Game.startCombat(node.monster);
    if (!r) { okAll = false; break; }
    if (marched === 0) {
      const f = Game.tbfight;
      T.ok('node fight: 12x12, the piece + its wave-5 escort + the coalition', f.gridSize === 12 &&
        f.fighters.some(x => x.mdef && x.mdef.id === node.monster) && f.fighters.some(x => x.mdef && x.mdef.id === node.escorts[0]) &&
        f.fighters.filter(x => x.kind === 'ally').length === 20);
    }
    const ally = Game.tbfight.fighters.find(x => x.kind === 'ally' && x.alive);
    if (ally) ally.alive = false; // one blade falls per node
    Game.tbEnd('won');
    marched++;
    if (marched === 8) beforeHeart = Game._networkTest.survivors();
  }
  T.ok('the whole march resolves (9 nodes won)', okAll && marched === 9, 'marched ' + marched);
  T.ok('the dead stay dead (one per node: 20 - 8 = 12 blades reach the heart)', beforeHeart === 12, 'had ' + beforeHeart);
  T.ok('networkFallen set, pieces gone, tele network_fallen', pg.networkFallen === true && !Game.worldMonsters().some(m => m.networkNode) && K.teleEvents(Game, 'network_fallen').length === 1);

  // a spent coalition loses the key
  const c = Game.networkCampaign();
  Object.assign(c, { summoned: true, started: true, idx: 0, cleared: [], lost: false, done: false });
  const savedFallen = pg.networkFallen; pg.networkFallen = false;
  st.musters.the_network = coalition(5);
  Game._networkTest.resolve({ node: nodes[0].id, result: 'lost', allies: [{ vid: 'tb0', villageId: 'tv0', name: 'Blade 0', alive: false }] });
  T.ok('a loss below the floor (4 < 5) loses the key for the run', c.lost === true && pg.networkLost === true && !pg.networkFallen);
  pg.networkFallen = savedFallen; pg.networkLost = false;

  T.section('5. THE HOSTS');
  const offer = (fallen, branch) => {
    pg.networkFallen = fallen;
    const Ts = Game.tableState();
    Ts.path = 'assimilated'; Ts.branch = branch; Ts.phase = 'challenge';
    Game.tableFinals();
    return ((s.tableChoices || {}).options || []).map(o => o.id);
  };
  T.ok('no key: no HOSTS option', offer(false, 'light').indexOf('final:hosts') < 0);
  const paths = ['feared', 'indispensable', 'beloved', 'witness', 'defiant', 'assimilated', 'relay'];
  T.ok('with the key: every path offers THE HOSTS, light and dark', paths.every(p => ['light', 'dark'].every(b => {
    pg.networkFallen = true; const Ts = Game.tableState(); Ts.path = p; Ts.branch = b; Game.tableFinals();
    return ((s.tableChoices || {}).options || []).some(o => o.id === 'final:hosts');
  })));
  T.ok('each path flavors the dinner with its own line', new Set(paths.map(p => Game.tableHostsLines(p, 'light')[1])).size === 7);
  T.ok('light = An Open Table, dark = The New Network', Game.tableHostsLines('feared', 'light').some(l => /AN OPEN TABLE/.test(l)) && Game.tableHostsLines('feared', 'dark').some(l => /THE NEW NETWORK/.test(l)));
  offer(true, 'light');
  s.day = Math.max(s.day, 120); pg.tableDone = true;
  Game.chooseTableOption('final:hosts');
  T.ok('choosing it wins: the Taken (adults + pod children) come home', Game.won === true && Game.state.village.takenReturned === true && Game.state.village.kidsReturned === true);
  const tw = K.teleEvents(Game, 'table_won').pop() || {};
  T.ok('table_won carries the key flag', tw.key === true && tw.hosts === true, JSON.stringify(tw));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
