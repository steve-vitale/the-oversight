// @ontology
// system: finale-campaign
// description: THE FINALE is a three-node campaign, not one fight (Steve 2026-10-11: "super special"). Node 1 THE COMMERCIAL BREAK (9x9 skirmish: the commercial break + spoiler + network_note trio — kill the production staff, take their tools). Node 2 THE OPENING CREDITS (12x12: the finale still ARRIVING, weaker card [100,140], 5-round fuse). Node 3 THE HEART (12x12: the full finale in two parts — part two at bloodied brings sky-fall zones, the credits rolling in from the edges, accelerated growth, and THE ENCORE). 20 blades to start the march (the largest army in the game); the heart demands 10 survivors or a re-muster at trust cost. Crew spoils become one-shot combat buttons in the heart. Dead allies stay dead across nodes; the coalition camps and partially heals between nodes.
// provides:
//   - finaleCampaignPlace(titanId)
//   - titanEntryGate(titanId)
//   - finaleCampaign() / finaleReinforce() / finaleNodeReady()
//   - fiFinaleHeart(game, m) (MonsterBehaviorHooks — wraps sigW5 fiFinale)
//   - tbFiRedPen() / tbFiLeakedScript() / tbFiBadNote() (crew-spoil buttons)
//   - finaleCampaignButtons() (heart-fight combat buttons)
//   - campaignGrieve(snap, tid) / campaignCamp(tid) / campaignInjectMonster(mid) / campaignSurvivors(tid) — the march rules, shared with THE NETWORK (network-campaign.js)
//   - _finaleTest (test hooks)
// rules:
//   - campaign_is_a_march: three nodes in order; the opening refuses until the crew is cleared, the heart until the opening is cleared. (code: titanEntryGate)
//   - twenty_blades: the march starts at 20 allied blades — the largest army in the game. (code: finale-campaign.js)
//   - dead_stay_dead: allies slain in a node leave the muster; the next node marches with survivors. (code: finaleResolveNode)
//   - camp_between: the coalition camps between nodes — player heals 50% of missing, allies 25%. Said aloud. (code: finaleInterlude)
//   - heart_floor: the heart demands 10 surviving blades; below that, re-muster (finaleReinforce) at trust cost. (code: titanEntryGate)
//   - encore_costs: the encore's sacrifice takes items only — memories no longer satisfy it. (code: tbFiSacrifice wrap)
//   - spoils_are_earned: the crew's tools (Red Pen, Leaked Script, Bad Note) are one-shot buttons in the heart only. (code: finaleCampaignButtons)
//   - part_two_is_different: bloodied (<50%) starts part two — sky-fall zones, the credits, faster growth, the encore. Never the same fight twice. (code: fiFinaleHeart)

(function () {
  // ATTACH PATTERN (crisis 2026-10-11): game.js only sets
  // globalThis.Scattering.Game — read it from Scattering, bail if absent.
  var Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  var R = Math.random;

  // ---------- campaign state ----------

  function titanSt() {
    try {
      Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
      Game.state.titans.campaigns = Game.state.titans.campaigns || {};
      return Game.state.titans;
    } catch (e) { return { campaigns: {} }; }
  }

  function finaleCampaign() {
    var st = titanSt();
    st.campaigns.finale = st.campaigns.finale || { started: false, crew: false, opening: false };
    return st.campaigns.finale;
  }

  // muster(tid): the campaign's muster — the finale's by default. THE
  // NETWORK (2026-10-14) reuses the same march rules on its own muster.
  function muster(tid) {
    try { return (titanSt().musters || {})[tid || 'finale'] || null; } catch (e) { return null; }
  }

  function survivors(tid) {
    var m = muster(tid);
    return m ? (m.allies || []).length : 0;
  }

  function heartFloor() {
    try {
      var def = Game.titanDef ? Game.titanDef('finale') : null;
      return (def && def.campaign && def.campaign.heartMinSurvivors) || 10;
    } catch (e) { return 10; }
  }

  // ---------- placement: the march, not a lair ----------

  function finaleCampaignPlace(titanId) {
    try {
      var px = Game.map ? Game.map.px : 4, py = Game.map ? Game.map.py : 4;
      var tx = Math.max(0, px + 3), ty = Math.max(0, py);
      var c = finaleCampaign();
      c.started = false; c.crew = false; c.opening = false;
      var mon = Game.spawnWorldMonster({ id: 'finale_crew' }, tx, ty, { titan: true });
      Game.say('📺 Scouts found the broadcast tower — ' + tx + ' east of here. THE FINALE does not arrive alone: first, its crew. THE COMMERCIAL BREAK (node 1 of 3). Kill the production staff and the finale airs without a safety net — no one left to call "cut." The march needs 20 allied blades. Sound the call.');
      try { if (Game.recordMoment) Game.recordMoment('The finale campaign begins: the commercial break located.'); } catch (e) {}
      return mon;
    } catch (e) { return null; }
  }

  // ---------- entry gate: the march has its own arithmetic ----------

  function titanEntryGate(titanId) {
    if (titanId !== 'finale') return null;
    var c = finaleCampaign();
    if (!c.started) return null; // no campaign: the flat 20-gate applies
    if (!c.crew) {
      return { ok: false, reason: '⛔ THE HEART is not here yet. The sky is still showing commercials — kill THE COMMERCIAL BREAK first (node 1 of 3). The march goes in order.' };
    }
    if (!c.opening) {
      return { ok: false, reason: '⛔ THE HEART is not here yet. THE OPENING CREDITS are still rolling (node 2 of 3). Finish the arrival first.' };
    }
    var n = survivors();
    var floor = heartFloor();
    if (n < floor) {
      return { ok: false, reason: '⛔ THE HEART demands ' + floor + ' surviving blades — the march has ' + n + '. Sound the call again (finaleReinforce) if anyone still answers, or the campaign ends here.' };
    }
    return { ok: true };
  }

  // A campaign node (re-)face needs a fieldable force. The first face needs
  // the full 20 (titanMusterReady); re-faces march with survivors, floor 5.
  function finaleNodeReady() {
    return survivors() >= 5;
  }

  // Re-muster: sound the call again. Villages are reluctant the second time
  // (trust -3 per answering village) and THE TURN watches (temptation math
  // already counts the gear). Said aloud.
  function finaleReinforce() {
    var before = survivors();
    var known = {};
    ((muster() || {}).allies || []).forEach(function (a) { known[a.villageId + ':' + a.vid] = true; });
    var ms = null;
    try { ms = Game.soundTitanCall('finale'); } catch (e) {}
    if (!ms) { Game.say('No one answers. The fires are cold.'); return null; }
    var after = survivors();
    var joined = (ms.allies || []).filter(function (a) { return !known[a.villageId + ':' + a.vid]; });
    if (!joined.length) { Game.say('No new blades answer. The people already marching cannot be counted twice.'); return ms; }
    try {
      var seen = {};
      (ms.allies || []).forEach(function (a) {
        if (known[a.villageId + ':' + a.vid]) return;
        if (seen[a.villageId]) return;
        seen[a.villageId] = 1;
        var links = [];
        try { links = Game.hierarchyState ? Game.hierarchyState() : []; } catch (e) {}
        links.forEach(function (l) {
          if (!l || l.status !== 'active') return;
          var other = null;
          try { other = Game._linkOther ? Game._linkOther(l, 'haven') : null; } catch (e2) {}
          if (other === a.villageId) l.trust = Math.max(0, (l.trust || 0) - 3);
        });
      });
    } catch (e) {}
    Game.say('📯 The call goes out again — thinner, hoarser. ' + joined.length + ' new blades join the march (' + before + ' → ' + after + '). The villages count their dead first. (trust −3 per answering fire — reluctance is remembered.)');
    try { if (Game.recordMoment) Game.recordMoment('The finale muster reinforced: ' + before + ' → ' + after + '.'); } catch (e) {}
    return ms;
  }

  // ---------- combat integration ----------

  function finaleMonsterDef(mid) {
    try { return (Game.data.monsters || []).find(function (m) { return m.id === mid; }) || null; } catch (e) { return null; }
  }

  function freeSpotNear(f, gmax, sx, sy) {
    var taken = {};
    f.fighters.forEach(function (x) { taken[x.mx + ',' + x.my] = 1; });
    for (var r = 0; r <= gmax; r++) {
      for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        var nx = sx + dx, ny = sy + dy;
        if (nx < 0 || nx > gmax || ny < 0 || ny > gmax) continue;
        if (!taken[nx + ',' + ny]) return { x: nx, y: ny };
      }
    }
    return { x: sx, y: sy };
  }

  function injectMonster(mid) {
    var f = Game.tbfight;
    if (!f || !f.fighters) return null;
    var mdef = finaleMonsterDef(mid);
    if (!mdef) return null;
    var gmax = Game.tbGridMax ? Game.tbGridMax() : 8;
    var anchor = null;
    try {
      anchor = f.fighters.filter(function (x) { return x.kind === 'monster'; })[0] || null;
    } catch (e) {}
    var sx = anchor ? anchor.mx : gmax, sy = anchor ? anchor.my : 0;
    var spot = freeSpotNear(f, gmax, sx, sy);
    var hp = mdef.hp[0] + Math.floor(R() * (mdef.hp[1] - mdef.hp[0] + 1));
    f.spawnSeq = (f.spawnSeq || 0) + 1;
    var key = 'm_crew_' + f.spawnSeq;
    var name = mdef.name;
    try { name = Game.monsterDisplayName ? Game.monsterDisplayName(mid) : mdef.name; } catch (e) {}
    var fighter = {
      key: key, kind: 'monster', id: mid, monsterId: mid,
      name: name, emoji: mdef.emoji || '👹',
      hp: hp, maxHp: hp, speed: mdef.speed || 3, mx: spot.x, my: spot.y,
      alive: true, fled: false, telegraph: null, mdef: mdef,
      hesitate: 0, blind: 0, stunned: 0, threatQueue: [],
    };
    f.fighters.push(fighter);
    try { f.order.push(key); } catch (e) {}
    return fighter;
  }

  function markFight(node) {
    try {
      var tf = (Game.state.titans && Game.state.titans._fight) || {};
      tf.campaign = node;
      // crew/opening are campaign nodes, NOT titan fights — tf.titan stays
      // null so titans.js's titan resolve (keyed off tf.titan) stays out.
      // The heart IS the titan fight: titans.js owns its resolve.
      tf.titan = (node === 'finale_heart') ? 'finale' : null;
      tf.day = tf.day || ((Game.state.scholar || {}).day || 0);
      Game.state.titans._fight = tf;
    } catch (e) {}
  }

  function finaleCrewSetup() {
    // the trio: the break itself + the spoiler + the network note
    injectMonster('spoiler');
    injectMonster('network_note');
    try { if (Game.titanInjectAllies) Game.titanInjectAllies('finale'); } catch (e) {}
    markFight('finale_crew');
    Game.say('📺 THE COMMERCIAL BREAK — node 1 of 3. The venue itself fights, and it brought the SPOILER and the NETWORK NOTE. Kill the production staff: their tools become yours in the heart.');
    try { if (Game.recordMoment) Game.recordMoment('The commercial break: the crew fight begins.'); } catch (e) {}
  }

  function finaleOpeningSetup() {
    try { Game.tbfight.gridSize = 12; } catch (e) {}
    try { if (Game.titanInjectAllies) Game.titanInjectAllies('finale'); } catch (e) {}
    markFight('finale_opening');
    Game.say('📼 THE OPENING CREDITS — node 2 of 3. It is still ARRIVING — the Herald\'s lesson made flesh. Same hunger, smaller card: 5 rounds to [100,140]. Kill the credits and the sky OPENS.');
    try { if (Game.recordMoment) Game.recordMoment('The opening credits: the finale arrives.'); } catch (e) {}
  }

  function finaleHeartSetup() {
    markFight('finale_heart');
    try {
      Game.tbfight.fiCrewSpoils = { redpen: 1, script: 1, badnote: 1 };
    } catch (e) {}
    Game.say('🌌 THE HEART — node 3 of 3. The sky stops pretending. This is the run\'s apocalypse — everything built was for this. The crew\'s tools are yours now: the Red Pen, the Leaked Script, the Bad Note. One use each. Make them count.');
    try { if (Game.recordMoment) Game.recordMoment('The heart: the finale proper begins.'); } catch (e) {}
  }

  function finaleWrapCombat() {
    if (!Game.startCombat || Game.startCombat.__finaleWrapped) return;
    var orig = Game.startCombat;
    var wrapped = function (mid) {
      // ---- pre-gates ----
      if (mid === 'finale_crew') {
        var c0 = finaleCampaign();
        if (!c0.started) {
          // first face: the full muster gate
          if (!Game.titanMusterReady('finale')) {
            var def0 = Game.titanDef ? Game.titanDef('finale') : null;
            var need0 = (def0 && def0.minAllies) || 20;
            var have0 = 0;
            try { have0 = ((titanSt().musters || {}).finale || { allies: [] }).allies.length; } catch (e) {}
            Game.say('⛔ THE COMMERCIAL BREAK does not notice you the way prey notices a hunter. The march needs ' + need0 + ' allied blades (you have ' + have0 + '). Sound the call. This is not courage. This is arithmetic.');
            return null;
          }
          c0.started = true;
        } else if (!finaleNodeReady()) {
          Game.say('⛔ The march cannot field a force — ' + survivors() + ' blades left, need 5. Sound the call again (finaleReinforce) if anyone still answers.');
          return null;
        }
      }
      if (mid === 'finale_opening') {
        var c1 = finaleCampaign();
        if (!c1.crew) {
          Game.say('⛔ THE OPENING CREDITS will not roll until the crew is dead. Kill THE COMMERCIAL BREAK first — node 1 of 3.');
          return null;
        }
        if (!finaleNodeReady()) {
          Game.say('⛔ The march cannot field a force — ' + survivors() + ' blades left, need 5. Sound the call again (finaleReinforce) if anyone still answers.');
          return null;
        }
      }
      var r = orig.apply(this, arguments);
      if (r === null || r === undefined) return r;
      try {
        if (mid === 'finale_crew') { finaleCrewSetup(); try { Game.audioEvent('fiCrewQuiet', {}); } catch (e2) {} }
        else if (mid === 'finale_opening') { finaleOpeningSetup(); try { Game.audioEvent('fiOpeningSting', {}); } catch (e2) {} }
        else if (mid === 'finale') finaleHeartSetup();
      } catch (e) {}
      return r;
    };
    wrapped.__finaleWrapped = true;
    Game.startCombat = wrapped;
  }

  // ---------- node resolution ----------

  // Dead allies leave the muster (faces stay dead), home rosters marked,
  // trust cost paid, grief said aloud. Shared by crew/opening resolves.
  function finaleGrieve(snap, tid) {
    var dead = (snap.allies || []).filter(function (a) { return !a.alive; });
    if (!dead.length) return;
    var seenVillages = {};
    dead.forEach(function (a) {
      try {
        var ov = Game._otherVillage ? Game._otherVillage(a.villageId) : null;
        var roster = (ov && ov.roster) || [];
        for (var i = 0; i < roster.length; i++) {
          if (roster[i] && roster[i].id === a.vid) { roster[i].alive = false; break; }
        }
        var links = [];
        try { links = Game.hierarchyState ? Game.hierarchyState() : []; } catch (e) {}
        var link = links.filter(function (l) {
          if (!l || l.status !== 'active') return false;
          var other = null;
          try { other = Game._linkOther ? Game._linkOther(l, 'haven') : a.villageId; } catch (e2) {}
          return other === a.villageId;
        })[0];
        if (link) {
          link.trust = Math.max(0, (link.trust || 0) - 10);
          if (link.theirSpeaker && link.theirSpeaker.id === a.vid) {
            try { if (Game._designateSpeaker) Game._designateSpeaker(link); } catch (e) {}
            Game.say('🕯️ ' + a.name + ' — their speaker — fell. ' + ((ov && ov.name) || 'Their fire') + ' names another. The link holds, thinner. (trust −10 — they count their dead.)');
          }
        }
        if (!seenVillages[a.villageId]) {
          seenVillages[a.villageId] = 1;
          Game.say('🕯️ ' + a.name + ' of ' + ((ov && ov.name) || 'an allied fire') + ' did not get up. They were a face at your fire. The alliance remembers.');
        }
      } catch (e) {}
    });
    // remove the dead from the muster — the next node marches with survivors
    try {
      var m = muster(tid);
      if (m) {
        var deadVids = {};
        dead.forEach(function (a) { deadVids[a.vid] = 1; });
        m.allies = (m.allies || []).filter(function (a) { return !deadVids[a.vid]; });
      }
    } catch (e) {}
  }

  // campaignCamp(tid): the coalition camps between nodes — player +50% of
  // missing health, allies +25%. Shared by the finale and THE NETWORK.
  function campaignCamp(tid) {
    try {
      var s = Game.state.scholar;
      var maxH = Game.maxHealth ? Game.maxHealth() : 100;
      var missing = Math.max(0, maxH - (s.health || 0));
      s.health = Math.min(maxH, (s.health || 0) + Math.round(missing * 0.5));
      var m = muster(tid);
      (m ? m.allies : []).forEach(function (a) {
        var am = Math.max(0, 100 - (a.hp || 0));
        a.hp = Math.min(100, (a.hp || 0) + Math.round(am * 0.25));
      });
    } catch (e) { console.warn('campaignCamp', e); }
    return survivors(tid);
  }

  function finaleInterlude(node) {
    // the coalition camps: partial healing, said aloud
    campaignCamp('finale');
    if (node === 'finale_crew') {
      Game.say('🏕️ The coalition makes camp among the dead air. You sleep in your armor. (+50% of missing health; allies +25%.) The broadcast tower is dark. Ahead, the sky is half-arrived — THE OPENING CREDITS roll over a world that isn\'t ready. (' + survivors() + ' blades march on.)');
    } else if (node === 'finale_opening') {
      Game.say('🏕️ The coalition makes camp under the open sky. The credits are dead. Above you, the sky STOPS PRETENDING — it gets bigger, and bigger, and then it is just... here. THE HEART. (' + survivors() + ' blades march on. This is the run\'s apocalypse.)');
    }
    try { if (Game.recordMoment) Game.recordMoment('The coalition camps after ' + node + ' (' + survivors() + ' blades).'); } catch (e) {}
  }

  function finaleSpawnNext(mid, dx, label) {
    try {
      var px = Game.map ? Game.map.px : 4, py = Game.map ? Game.map.py : 4;
      var tx = Math.max(0, px + dx), ty = Math.max(0, py);
      var mon = Game.spawnWorldMonster({ id: mid }, tx, ty, { titan: true });
      Game.say(label + ' — ' + tx + ' east of here.');
      try { if (Game.recordMoment) Game.recordMoment(label + ' located.'); } catch (e) {}
      return mon;
    } catch (e) { return null; }
  }

  function finaleResolveNode(snap) {
    var node = snap.campaign;
    if (node !== 'finale_crew' && node !== 'finale_opening' && node !== 'finale_heart') return;
    if (node === 'finale_heart') {
      // titans.js titanResolveFight owned victory/defeat + grief for the
      // heart (it keys off tf.titan='finale'); the campaign just closes.
      if (snap.result === 'won') {
        try { titanSt().campaigns.finale = { started: false, crew: false, opening: false, done: true }; } catch (e) {}
      }
      return;
    }
    finaleGrieve(snap);
    var c = finaleCampaign();
    if (snap.result === 'won') {
      // the cleared node's world monster leaves the map (the next node spawns
      // further east) — like titanVictory does for the heart. On defeat/flee
      // it stays: the node is re-faceable.
      try {
        var nodeMid = node === 'finale_crew' ? 'finale_crew' : 'finale_opening';
        var wms = Game.worldMonsters().filter(function (w) { return w.id === nodeMid; });
        wms.forEach(function (w) { Game.removeWorldMonster(w); });
      } catch (e) {}
      if (node === 'finale_crew') {
        c.crew = true;
        finaleInterlude('finale_crew');
        finaleSpawnNext('finale_opening', 5, '📼 THE OPENING CREDITS roll');
        Game.say('The production staff is dead. The finale has no one left to call "cut." Its tools are yours now.');
      } else if (node === 'finale_opening') {
        c.opening = true;
        finaleInterlude('finale_opening');
        finaleSpawnNext('finale', 7, '🌌 THE HEART arrives');
      } else if (node === 'finale_heart') {
        // titans.js titanVictory handled the slaying; the campaign is done
        try { titanSt().campaigns.finale = { started: false, crew: false, opening: false, done: true }; } catch (e) {}
      }
    } else {
      // defeat/flee: the campaign pauses. The muster HOLDS (the coalition
      // licks its wounds — it does not disband from one lost node), the
      // node stays to be re-faced. The dead stay dead.
      Game.say('💀 The node holds. The coalition falls back in good order — the muster holds, the dead stay dead. (' + survivors() + ' blades. Re-face the node when ready, or reinforce.)');
      try { if (Game.recordMoment) Game.recordMoment('The finale campaign pauses at ' + node + '.'); } catch (e) {}
    }
  }

  function finaleWrapEnd() {
    if (!Game.tbEnd || Game.tbEnd.__finaleWrapped) return;
    var orig = Game.tbEnd;
    var wrapped = function (result) {
      var snap = null;
      try {
        var tf = Game.state.titans && Game.state.titans._fight;
        if (tf && tf.campaign && this.tbfight && this.tbfight.fighters) {
          snap = {
            campaign: tf.campaign,
            result: result,
            allies: this.tbfight.fighters.filter(function (f) { return f.kind === 'ally'; })
              // injected ally fighters carry their id as villagerId (titanInjectAllies), not vid
              .map(function (f) { return { key: f.key, name: f.name, villageId: f.villageId, vid: f.vid || f.villagerId, alive: !!f.alive }; }),
          };
        }
      } catch (e) {}
      var r = orig.apply(this, arguments);
      try {
        if (snap) {
          try { Game.state.titans._fight = null; } catch (e) {}
          finaleResolveNode(snap);
        }
      } catch (e) {}
      return r;
    };
    wrapped.__finaleWrapped = true;
    Game.tbEnd = wrapped;
  }

  // ---------- THE HEART, part two ----------

  function fiSkyZones(f, n) {
    var gmax = 11; // the heart is always 12x12
    var zones = [];
    var tries = 0;
    while (zones.length < n && tries < 60) {
      tries++;
      var x = Math.floor(R() * 10), y = Math.floor(R() * 10); // 3x3 fits in 0..11
      var clash = zones.some(function (z) { return Math.abs(z.x - x) < 3 && Math.abs(z.y - y) < 3; });
      if (!clash) zones.push({ x: x, y: y });
    }
    return zones;
  }

  function fiInZone(fx, fy, z) {
    return fx >= z.x && fx <= z.x + 2 && fy >= z.y && fy <= z.y + 2;
  }

  function fiResolveSky(game, f, m) {
    var zones = f.fiSkyArmed || [];
    if (!zones.length) return;
    f.fiSkyArmed = [];
    var hit = [];
    f.fighters.forEach(function (x) {
      if (!x.alive || x.fled) return;
      if (x.kind !== 'player' && x.kind !== 'ally' && x.kind !== 'villager') return;
      for (var i = 0; i < zones.length; i++) {
        if (fiInZone(x.mx, x.my, zones[i])) { hit.push(x); break; }
      }
    });
    if (!hit.length) {
      game.say('🌠 The sky falls where you were standing. It hits nothing but set dressing. (MOVE works.)');
      return;
    }
    game.say('🌠 THE SKY FALLS — ' + hit.length + ' caught standing under it.');
    var self = game;
    hit.forEach(function (x) {
      var dmg = 40 + Math.floor(R() * 21);
      var landed = self.tbDamage(x.key, dmg, 'the falling sky', m.key, { undodgeable: true, sigW5NoMult: true });
      game.say('— ' + (x.name || x.key) + ' takes ' + landed + '.');
    });
    if (game.tbEndCheck()) return;
  }

  function fiArmSky(game, f) {
    var n = 2 + (f.fighters.filter(function (x) { return (x.kind === 'ally' || x.kind === 'player') && x.alive; }).length > 12 ? 1 : 0);
    var zones = fiSkyZones(f, n);
    f.fiSkyArmed = zones;
    game.say('🌌 The sky marks ' + zones.length + ' zones: ' + zones.map(function (z) { return '(' + z.x + '–' + (z.x + 2) + ',' + z.y + '–' + (z.y + 2) + ')'; }).join(' ') + ' — MOVE. (They fall on its next turn.)');
  }

  function fiCreditsBurn(game, f, m) {
    // the credits roll in from the edges: edge tiles burn
    var gmax = 11;
    var burned = [];
    f.fighters.forEach(function (x) {
      if (!x.alive || x.fled) return;
      if (x.kind !== 'player' && x.kind !== 'ally' && x.kind !== 'villager') return;
      if (x.mx === 0 || x.mx === gmax || x.my === 0 || x.my === gmax) burned.push(x);
    });
    if (!burned.length) return;
    game.say('🎞️ The credits roll over ' + burned.length + ' standing at the edge of the world.');
    var self = game;
    burned.forEach(function (x) {
      var dmg = 10 + Math.floor(R() * 11);
      var landed = self.tbDamage(x.key, dmg, 'the rolling credits', m.key, { undodgeable: true, sigW5NoMult: true });
      game.say('— ' + (x.name || x.key) + ' takes ' + landed + '. (Get IN — the middle is safe.)');
    });
    if (game.tbEndCheck()) return;
  }

  function fiFinaleHeart(game, m) {
    var f = game.tbfight;
    if (!f || f.over) return false;
    // the bad note wears off
    if ((m.fiNoteVuln || 0) > 0) m.fiNoteVuln--;
    // part-two arena, before the hunger: resolve last round's sky, arm
    // this round's, burn the credits
    var wasPartTwo = !!m.fiPartTwo;
    if (wasPartTwo) {
      fiResolveSky(game, f, m);
      if (f.over) return true;
      fiArmSky(game, f);
      fiCreditsBurn(game, f, m);
      if (f.over) return true;
    }
    // the original hunger, underneath it all
    var HB = (typeof globalThis !== 'undefined' && globalThis.MonsterBehaviorHooks) || {};
    var orig = HB.__fiFinaleOrig || null;
    var r = (typeof orig === 'function') ? orig(game, m) : false;
    // part-two trigger: bloodied, once — AFTER orig, so orig's fiInit reset
    // doesn't wipe the accelerated growth and the encore keeps its full fuse
    if (!m.fiPartTwo && m.alive && m.hp <= (m.maxHp || m.hp) * 0.5) {
      m.fiPartTwo = true;
      f.fiCredits = true;
      try { game.audioEvent('fiPartTwo', {}); } catch (err) {}
      game.say('🌌 THE FINALE, PART TWO — the sky gets LOWER. The credits roll in from the edges of the world (edge tiles burn [10,20] — get IN, the middle is safe). The sky itself starts falling (marked 3x3 zones, [40,60] — MOVE). And it grows FASTER now.');
      // accelerated growth in part two (on top of orig's)
      m.fiGrowth = (m.fiGrowth || 0) + 1;
      // THE ENCORE: if the countdown already resolved (fed or fallen), the
      // finale demands a second ending. No other monster does this.
      if (m.fiDeclared && !(m.fiCountdown > 0)) {
        m.fiEncore = true;
        m.fiCountdown = 3;
        m.fiCardRange = [120, 170];
        try { game.audioEvent('fiEncore', {}); } catch (err) {}
        game.say('🌌 THE ENCORE — "DID YOU REALLY THINK ONE ENDING WAS ENOUGH?" The title card rises AGAIN. 3 rounds to [120,170]. It has tasted your memories — this time it wants the REAL thing. (The encore takes items only.)');
      }
      try { game.tbRefreshTelegraphUI(); } catch (err2) {}
    } else if (wasPartTwo) {
      // accelerated growth every part-two round
      m.fiGrowth = (m.fiGrowth || 0) + 1;
    }
    return r;
  }

  // ---------- crew spoils: one-shot buttons in the heart ----------

  function fiHeartMonster(game) {
    try {
      var f = game.tbfight;
      if (!f) return null;
      var ms = f.fighters.filter(function (x) {
        return x.kind === 'monster' && x.alive && !x.fled && x.mdef && x.mdef.id === 'finale';
      });
      return ms.length ? ms[0] : null;
    } catch (e) { return null; }
  }

  function finaleCampaignButtons() {
    var f = null;
    try { f = Game.tbfight; } catch (e) {}
    if (!f || f.over) return '';
    if (!fiHeartMonster(Game)) return '';
    var sp = f.fiCrewSpoils;
    if (!sp) return '';
    var p = null;
    try { p = Game.tbFighter('p'); } catch (e) {}
    var dis = (p && p.acted) ? 'disabled' : '';
    var out = [];
    var btn = function (fn, label, title) {
      return '<button class="self-btn" data-finale="' + fn + '" ' + dis + ' title="' + title + '">' + label + '</button>';
    };
    if (sp.redpen > 0 && (f.fiSkyArmed || []).length) out.push(btn('tbFiRedPen', '🖊️ Red Pen', 'Cross out the sky\'s plans — cancel all marked zones (one use)'));
    if (sp.script > 0) {
      var m0 = fiHeartMonster(Game);
      if (m0 && (m0.fiCountdown || 0) > 0) out.push(btn('tbFiLeakedScript', '📜 Leaked Script', 'Read the leaked script — the title card waits one more round (one use)'));
    }
    if (sp.badnote > 0) out.push(btn('tbFiBadNote', '💡 Bad Note', 'Give it a note — its strikes land softer for 2 rounds (one use)'));
    return out.join('');
  }

  function spoilUsed(key) {
    try {
      var sp = Game.tbfight.fiCrewSpoils;
      if (sp && sp[key] > 0) { sp[key]--; return true; }
    } catch (e) {}
    return false;
  }

  var finaleMethods = {
    // THE RED PEN (crew spoil): cross out the sky's plans.
    tbFiRedPen: function () {
      var f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      var p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      if (!(f.fiSkyArmed || []).length) { this.say('The sky has no plans to cross out. (Wait for it to mark zones.)'); return false; }
      if (!spoilUsed('redpen')) { this.say('The Red Pen is dry. (One use — it\'s gone.)'); return false; }
      p.acted = true;
      f.fiSkyArmed = [];
      this.say('🖊️ You uncap the Red Pen and CROSS OUT the sky\'s plans. The marked zones dissolve into margin notes. Somewhere, a producer screams. (One use — the pen is dry.)');
      try { this.audioEvent('fiRedPen', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },
    // THE LEAKED SCRIPT (crew spoil): the title card waits.
    tbFiLeakedScript: function () {
      var f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      var p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      var m = fiHeartMonster(this);
      if (!m || (m.fiCountdown || 0) <= 0) { this.say('No countdown running — nothing to delay.'); return false; }
      if (!spoilUsed('script')) { this.say('The script\'s pages are blank. (One use — it\'s gone.)'); return false; }
      p.acted = true;
      m.fiCountdown++;
      this.say('📜 You read from the Leaked Script: "...AND THEN THE TITLE CARD WAITS." The card hesitates — one more round. The spoiler would be proud. (One use — the pages go blank.)');
      try { this.audioEvent('fiScript', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },
    // THE BAD NOTE (crew spoil): it takes suggestions. This is a mistake — for it.
    tbFiBadNote: function () {
      var f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      var p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      var m = fiHeartMonster(this);
      if (!m) { this.say('Nothing here to note.'); return false; }
      if (!spoilUsed('badnote')) { this.say('The memo pad is empty. (One use — it\'s gone.)'); return false; }
      p.acted = true;
      m.fiNoteVuln = 2;
      this.say('💡 You lean in, helpful as anything: "Have you considered making the big hit... smaller?" The finale WRITES IT DOWN. Its strikes land softer for 2 rounds. (It takes suggestions. This is a mistake. One use.)');
      try { this.audioEvent('fiBadNote', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },
    finaleCampaignButtons: finaleCampaignButtons,
  };

  // ---------- wires: sacrifice, buttons, pool, hooks ----------

  function finaleWires() {
    // the sacrifice works in the opening too (sigW5 only knows 'finale'):
    // swap in a finder that knows the campaign.
    try {
      var HB0 = (typeof globalThis !== 'undefined' && globalThis.MonsterBehaviorHooks) || null;
      if (HB0 && HB0.fiFinale && !HB0.__fiFinaleOrig) {
        HB0.__fiFinaleOrig = HB0.fiFinale;
        HB0.fiFinaleHeart = fiFinaleHeart;
      }
    } catch (e) {}

    // tbFiSacrifice: the encore takes items only (memories no longer satisfy).
    if (Game.tbFiSacrifice && !Game.tbFiSacrifice.__finaleWrapped) {
      var origSac = Game.tbFiSacrifice;
      var sacWrapped = function (kind) {
        var m = fiHeartMonster(this);
        if (m && m.fiEncore && kind === 'memory') {
          this.say('🎁 You reach for a food memory — the finale turns away. "TASTED THOSE. They tasted like cake. This time I want the REAL thing." (The encore takes items only.)');
          return false;
        }
        return origSac.apply(this, arguments);
      };
      sacWrapped.__finaleWrapped = true;
      Game.tbFiSacrifice = sacWrapped;
    }

    // combat buttons: append the crew-spoil buttons to the sigW5 strip
    if (Game.sigW5CombatButtons && !Game.sigW5CombatButtons.__finaleWrapped) {
      var origBtns = Game.sigW5CombatButtons;
      var btnsWrapped = function () {
        var out = origBtns.apply(this, arguments);
        try { out += finaleCampaignButtons(); } catch (e) {}
        return out;
      };
      btnsWrapped.__finaleWrapped = true;
      Game.sigW5CombatButtons = btnsWrapped;
    }

    // wire the spoil buttons (one insertion point alongside data-sigw5)
    if (Game.sigW5WireCombat && !Game.sigW5WireCombat.__finaleWrapped) {
      var origWire = Game.sigW5WireCombat;
      var wireWrapped = function (on, rerender) {
        origWire.apply(this, arguments);
        try {
          document.querySelectorAll('[data-finale]').forEach(function (b) {
            b.onclick = function () {
              try { Game[b.dataset.finale](); } catch (e) {}
              rerender();
            };
          });
        } catch (e) {}
      };
      wireWrapped.__finaleWrapped = true;
      Game.sigW5WireCombat = wireWrapped;
    }

    // the wave pool never contains campaign nodes — they arrive by march only
    if (Game.monsterWavePool && !Game.monsterWavePool.__finaleWrapped) {
      var origPool = Game.monsterWavePool;
      var poolWrapped = function () {
        var pool = origPool.apply(this, arguments);
        return pool.filter(function (m) { return !m.campaignOnly; });
      };
      poolWrapped.__finaleWrapped = true;
      Game.monsterWavePool = poolWrapped;
    }

    finaleWrapCombat();
    finaleWrapEnd();
  }

  // ---------- attach ----------

  Object.assign(Game, {
    finaleCampaignPlace: finaleCampaignPlace,
    titanEntryGate: titanEntryGate,
    finaleCampaign: finaleCampaign,
    finaleReinforce: finaleReinforce,
    finaleNodeReady: finaleNodeReady,
  });
  // THE NETWORK (2026-10-14) marches by the same rules on its own muster.
  Game.campaignGrieve = finaleGrieve;
  Game.campaignCamp = campaignCamp;
  Game.campaignInjectMonster = injectMonster;
  Game.campaignSurvivors = survivors;
  Object.assign(Game, finaleMethods);

  // test hooks
  Game._finaleTest = {
    campaign: finaleCampaign,
    finaleGrieve: finaleGrieve,
    finaleInterlude: finaleInterlude,
    finaleResolveNode: finaleResolveNode,
    injectMonster: injectMonster,
    fiInZone: fiInZone,
    fiSkyZones: fiSkyZones,
    survivors: survivors,
    heartFloor: heartFloor,
  };

  try { finaleWires(); } catch (e) {}
})();
