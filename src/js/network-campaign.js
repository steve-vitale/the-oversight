// @ontology
// system: network-campaign
// description: THE NETWORK — the key to the best human ending (Steve 2026-10-14: "Something else on the scale of titan class but even bigger. Something that has to be fought across the entire map ... Should be almost impossible to get."). Summoned when Overtime reaches the_network.keyTier AND the herald, nielsen and finale are all slain. The broadcast given a body: one piece in each 3x3 sector of the 9x9 map (4 masts, 4 limbs, the heart in the middle), fought in data order with ONE coalition by the finale's march rules — 20 blades to start, upkeep 1000 kcal/blade/day, the dead stay dead, camp between nodes, no new blades once the march begins. A loss pauses the march if the coalition still fields the floor; below it the key is lost for the run. The heart falling sets pg.networkFallen (the key), which adds THE HOSTS to every Table path.
// provides:
//   - networkNodes() -> the node list (titans.json the_network.campaign.nodes)
//   - networkCampaign() -> campaign state {summoned, started, idx, cleared, lost, done, tiles}
//   - networkSummon() -> place every piece on the map, said aloud
//   - networkCurrentNode() -> the node the march faces next
//   - networkNodeTile(node) -> {x,y} inside the node's map sector
//   - networkStatus() -> short Haven line for app.js
//   - _networkTest (test hooks)
// rules:
//   - one_node_per_sector: the 9x9 map is 9 sectors; each holds exactly one piece (code: networkNodeTile)
//   - march_in_order: only the current node can be fought; others refuse aloud (code: startCombat wrap)
//   - one_coalition: soundTitanCall for the network refuses once the march starts (code: soundTitanCall wrap)
//   - dead_stay_dead: campaignGrieve removes the fallen from the muster after every node (code: networkResolve)
//   - coalition_must_survive: a loss leaving fewer than floor blades ends the campaign; the key is lost (code: networkResolve)
//   - pieces_hold_their_ground: network pieces never wander and do not crowd the roaming cap (code: wanderWorldMonsters / worldMonsterCap wraps)
// consumes:
//   - titanDef, titanMusterReady, titanMusterState, soundTitanCall, titanInjectAllies, titanReleaseCommitted (titans.js)
//   - campaignGrieve, campaignCamp, campaignInjectMonster, campaignSurvivors (finale-campaign.js)
//   - spawnWorldMonster, removeWorldMonster, worldMonsters, isSafeTile, monsterAt, playerMonster, startCombat, tbEnd (game.js)
// Load AFTER finale-campaign.js (its tbEnd wrap must be inside ours).
(function () {
  'use strict';
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const NET = 'the_network';

  function def() { try { return Game.titanDef ? Game.titanDef(NET) : null; } catch (e) { console.warn('network def', e); return null; } }
  function campCfg() { return (def() || {}).campaign || {}; }
  function nodes() { return campCfg().nodes || []; }
  function pieceIds() { const o = {}; nodes().forEach(n => { o[n.monster] = 1; }); return o; }
  function tst() {
    Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
    const st = Game.state.titans;
    st.omens = st.omens || {}; st.musters = st.musters || {}; st.slain = st.slain || {};
    st.campaigns = st.campaigns || {};
    return st;
  }
  function camp() {
    const st = tst();
    st.campaigns.network = st.campaigns.network || { summoned: false, started: false, idx: 0, cleared: [], lost: false, done: false, tiles: {} };
    return st.campaigns.network;
  }
  function survivors() {
    let n = 0;
    try { n = Game.campaignSurvivors ? Game.campaignSurvivors(NET) : 0; } catch (e) { console.warn('network survivors', e); }
    try {
      const m = tst().musters[NET];
      const roster = (Game.state.village || {}).roster || [];
      n += ((m && m.haven) || []).filter(h => h && roster.indexOf(h.vid) >= 0).length;
    } catch (e) { console.warn('network haven blades', e); }
    return n;
  }
  function current() { const c = camp(); return nodes()[c.idx] || null; }
  function nodeById(id) { return nodes().find(n => n.id === id) || null; }

  // One piece per 3x3 sector of the 9x9 world; prefer the sector's centre,
  // never a village (safe) tile, never stacked on another monster.
  function nodeTile(node) {
    const sx = (node.sector || [1, 1])[0], sy = (node.sector || [1, 1])[1];
    const cx = sx * 3 + 1, cy = sy * 3 + 1;
    const cands = [];
    for (let y = sy * 3; y < sy * 3 + 3; y++) for (let x = sx * 3; x < sx * 3 + 3; x++) {
      const d = Math.abs(x - cx) + Math.abs(y - cy);
      let ok = true;
      try { if (Game.isSafeTile && Game.isSafeTile(x, y)) ok = false; } catch (e) { console.warn('network safe tile', e); }
      try { if (Game.monsterAt && Game.monsterAt(x, y)) ok = false; } catch (e) { console.warn('network monsterAt', e); }
      cands.push({ x, y, d, ok });
    }
    cands.sort((a, b) => (b.ok - a.ok) || (a.d - b.d));
    return { x: cands[0].x, y: cands[0].y };
  }

  function networkSummon() {
    const pg = Game.progState();
    const c = camp();
    if (c.summoned) return false;
    c.summoned = true; pg.networkSummoned = true;
    const st = tst();
    // located at once (stage 2): the council / call / commit buttons appear
    st.omens[NET] = { stage: 2, day: (Game.state.scholar || {}).day || 0, warned: {}, resolved: true };
    nodes().forEach(n => {
      const t = nodeTile(n);
      c.tiles[n.id] = t;
      try { Game.spawnWorldMonster(n.monster, t.x, t.y, { titan: true, networkNode: n.id, homeTx: t.x, homeTy: t.y }); } catch (e) { console.warn('network spawn', n.id, e); }
    });
    const d = def() || {};
    try { Game.sysSay('WE INTERRUPT THIS PROGRAM. ...No. We ARE this program. Folks — meet THE NETWORK. It was never on the map. It IS the map. (Ratings: off the chart. The chart is also the Network.)'); } catch (e) { console.warn('network sysSay', e); }
    const first = nodes()[0];
    const ft = first ? c.tiles[first.id] : null;
    Game.say(`📡 THE NETWORK — ${d.threat || 'nine pieces across the map.'} First: ${first ? first.title : '?'}${ft ? ` (tile ${ft.x},${ft.y})` : ''}. The march needs ${d.minAllies || 20} blades. Sound the call. Sit at the Table and the march is over.`);
    try { if (Game.recordMoment) Game.recordMoment('The Network was summoned. The whole map is one monster.'); } catch (e) { console.warn('network moment', e); }
    try { Game.tele('network_summoned', { tier: Game.overtimeTier ? Game.overtimeTier() : null }); } catch (e) { console.warn('network tele', e); }
    try { if (Game.save) Game.save(); } catch (e) { console.warn('network save', e); }
    return true;
  }

  function removePieces(onlyId) {
    try {
      Game.worldMonsters().filter(w => w.networkNode && (!onlyId || w.networkNode === onlyId)).forEach(w => Game.removeWorldMonster(w));
    } catch (e) { console.warn('network removePieces', e); }
  }

  function networkFall() {
    const pg = Game.progState();
    const c = camp();
    const st = tst();
    c.done = true; pg.networkFallen = true;
    st.slain[NET] = true; st.musters[NET] = null;
    try { if (Game.titanReleaseCommitted) Game.titanReleaseCommitted(NET); } catch (e) { console.warn('network release', e); }
    removePieces();
    Game.say('🌅 THE NETWORK FALLS. Every screen in the sky goes to static, then to sky. For the first time since the Scattering, nobody is watching. The show is off the air.');
    Game.say('The coalition walks home across a map that is only a map again. Whatever the Table offers now, it cannot price you: the thing that did the pricing is dead.');
    try { if (Game.recordMoment) Game.recordMoment('The Network fell. The show went off the air.'); } catch (e) { console.warn('network moment', e); }
    try { if (Game.ledgerAdd) Game.ledgerAdd('titan', 'slew:' + NET); } catch (e) { console.warn('network ledger', e); }
    try { Game.tele('network_fallen', { day: (Game.state.scholar || {}).day || 0, survivors: survivors() }); } catch (e) { console.warn('network tele', e); }
  }

  function networkLose(n) {
    const pg = Game.progState();
    const c = camp();
    c.lost = true; pg.networkLost = true;
    tst().musters[NET] = null;
    try { if (Game.titanReleaseCommitted) Game.titanReleaseCommitted(NET); } catch (e) { console.warn('network release', e); }
    removePieces();
    Game.say(`💀 The coalition is spent — ${n} blades left, the march needs ${campCfg().floor || 5}. The Network stays on the air. The pieces fold back into the sky. The key is lost for this run.`);
    try { if (Game.recordMoment) Game.recordMoment('The Network broke the coalition. The show goes on.'); } catch (e) { console.warn('network moment', e); }
    try { Game.tele('network_lost', { node: (current() || {}).id || null }); } catch (e) { console.warn('network tele', e); }
  }

  function networkResolve(snap) {
    const c = camp();
    const node = nodeById(snap.node);
    if (!node) return;
    try { if (Game.campaignGrieve) Game.campaignGrieve(snap, NET); } catch (e) { console.warn('network grieve', e); }
    const n = survivors();
    if (snap.result === 'won') {
      removePieces(node.id);
      c.cleared.push(node.id);
      c.idx++;
      if (node.piece === 'heart' || c.idx >= nodes().length) { networkFall(); return; }
      try { if (Game.campaignCamp) Game.campaignCamp(NET); } catch (e) { console.warn('network camp', e); }
      const nx = current();
      const t = nx ? c.tiles[nx.id] : null;
      Game.say(`🏕️ ${node.title} is down (${c.idx}/${nodes().length}). The coalition camps: you heal half of what you lost, the blades a quarter. ${n} blades march on. Next: ${nx ? nx.title : '?'}${t ? ` (tile ${t.x},${t.y})` : ''}.`);
      try { if (Game.recordMoment) Game.recordMoment(`The Network: ${node.title} fell (${n} blades left).`); } catch (e) { console.warn('network moment', e); }
      return;
    }
    if (n < (campCfg().floor || 5)) { networkLose(n); return; }
    Game.say(`💀 ${node.title} holds. The coalition falls back in good order — the dead stay dead. (${n} blades. Re-face it when ready. No new fires will answer.)`);
  }

  // ---------- wraps ----------
  if (Game.startCombat && !Game.startCombat.__networkWrapped) {
    const orig = Game.startCombat;
    const w = function (monsterId) {
      const mid = monsterId || this.pendingMonsterId;
      if (!mid || !pieceIds()[mid]) return orig.apply(this, arguments);
      const c = camp();
      const refuse = (msg) => { this.say(msg); return null; };
      if (!c.summoned || c.lost || c.done) return refuse('⛔ The piece is static now — nothing to fight.');
      const cur = current();
      let here = null;
      try { const pm = this.playerMonster ? this.playerMonster() : null; if (pm && pm.networkNode) here = nodeById(pm.networkNode); } catch (e) { console.warn('network here', e); }
      const node = here || cur;
      if (!cur || node.id !== cur.id) {
        const t = cur ? c.tiles[cur.id] : null;
        return refuse(`⛔ ${node.title} will not engage yet. The march goes in order: next is ${cur ? cur.title : '?'}${t ? ` (tile ${t.x},${t.y})` : ''}.`);
      }
      const d = def() || {};
      if (!c.started) {
        if (!this.titanMusterReady(NET)) {
          const m = this.titanMusterState ? this.titanMusterState(NET) : null;
          const have = m ? (m.allies || []).length + (m.haven || []).length : 0;
          return refuse(`⛔ THE NETWORK notices you the way a broadcast notices one viewer. The march needs ${d.minAllies || 20} blades (you have ${have}). Sound the call.`);
        }
      } else {
        const need = cur.piece === 'heart' ? (campCfg().heartMinSurvivors || 10) : (campCfg().floor || 5);
        const n = survivors();
        if (n < need) return refuse(`⛔ ${cur.title} needs ${need} surviving blades — the march has ${n}.`);
      }
      const r = orig.apply(this, arguments);
      if (r === null || r === undefined) return r;
      c.started = true;
      try {
        this.tbfight.gridSize = 12;
        (cur.escorts || []).forEach(e => { try { this.campaignInjectMonster(e); } catch (e2) { console.warn('network escort', e, e2); } });
        if (this.titanInjectAllies) this.titanInjectAllies(NET);
        this.state.titans._fight = { campaign: 'network:' + cur.id, titan: null, day: (this.state.scholar || {}).day || 0 };
        this.say(`📡 ${cur.title} — node ${c.idx + 1} of ${nodes().length}. ${cur.piece === 'heart' ? 'The heart hungers like the Finale did: feed it, or end it first.' : 'It brought one of the season\'s own monsters. Their counters still work.'}`);
      } catch (e) { console.warn('network setup', e); }
      return r;
    };
    w.__networkWrapped = true;
    Game.startCombat = w;
  }
  if (Game.tbEnd && !Game.tbEnd.__networkWrapped) {
    const orig = Game.tbEnd;
    const w = function (result) {
      let snap = null;
      try {
        const tf = Game.state.titans && Game.state.titans._fight;
        if (tf && typeof tf.campaign === 'string' && tf.campaign.indexOf('network:') === 0 && this.tbfight && this.tbfight.fighters) {
          snap = {
            node: tf.campaign.slice(8), result,
            allies: this.tbfight.fighters.filter(f => f.kind === 'ally')
              .map(f => ({ key: f.key, name: f.name, villageId: f.villageId, vid: f.vid || f.villagerId, alive: !!f.alive })),
          };
        }
      } catch (e) { console.warn('network snap', e); }
      const r = orig.apply(this, arguments);
      if (snap) {
        try { Game.state.titans._fight = null; networkResolve(snap); } catch (e) { console.warn('network resolve', e); }
      }
      return r;
    };
    w.__networkWrapped = true;
    Game.tbEnd = w;
  }
  if (Game.soundTitanCall && !Game.soundTitanCall.__networkWrapped) {
    const orig = Game.soundTitanCall;
    const w = function (titanId) {
      if (titanId === NET && camp().started) {
        this.say('📯 The call goes out — and nobody new answers. The march against the Network is the one you started with.');
        return null;
      }
      return orig.apply(this, arguments);
    };
    w.__networkWrapped = true;
    Game.soundTitanCall = w;
  }
  if (Game.wanderWorldMonsters && !Game.wanderWorldMonsters.__networkWrapped) {
    const orig = Game.wanderWorldMonsters;
    const w = function () {
      const r = orig.apply(this, arguments);
      try {
        for (const m of this.worldMonsters()) {
          if (m.networkNode && m.homeTx != null && (m.tx !== m.homeTx || m.ty !== m.homeTy)) { m.tx = m.homeTx; m.ty = m.homeTy; }
        }
      } catch (e) { console.warn('network hold ground', e); }
      return r;
    };
    w.__networkWrapped = true;
    Game.wanderWorldMonsters = w;
  }
  if (Game.worldMonsterCap && !Game.worldMonsterCap.__networkWrapped) {
    const orig = Game.worldMonsterCap;
    const w = function () {
      let n = 0;
      try { n = this.worldMonsters().filter(m => m.networkNode).length; } catch (e) { console.warn('network cap', e); }
      return orig.apply(this, arguments) + n;
    };
    w.__networkWrapped = true;
    Game.worldMonsterCap = w;
  }

  Game.networkNodes = nodes;
  Game.networkCampaign = camp;
  Game.networkCurrentNode = current;
  Game.networkNodeTile = nodeTile;
  Object.assign(Game, {
    networkSummon,
    networkStatus() {
      const c = camp();
      if (!c.summoned) return null;
      if (c.done) return '📡 The Network is off the air. The key is yours.';
      if (c.lost) return '📡 The Network stays on the air. The key is lost.';
      const cur = current();
      const t = cur ? c.tiles[cur.id] : null;
      return `📡 THE NETWORK — node ${c.idx + 1}/${nodes().length}: ${cur ? cur.title : '?'}${t ? ` (tile ${t.x},${t.y})` : ''}${c.started ? ` · ${survivors()} blades` : ''}.`;
    },
  });
  Game._networkTest = { resolve: networkResolve, survivors, fall: networkFall };
})();
