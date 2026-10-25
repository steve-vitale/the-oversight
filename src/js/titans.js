// @ontology
// system: titans
// description: The TITAN CLASS (Steve 2026-10-11) — the threat ladder that justifies the scale ladder. Three titans total, 1-2 per run: the Herald (wave 4, tutorial), one mid wave-5, the Finale (apocalypse). A titan is a FLAG (src/data/titans.json), never just HP. No solo fights — hard gate, not a stat check. Coalition warfare: allied villages commit named faces who fight blow-by-blow; they can die, and it costs. The call to arms, the war council, outfitting (real gear, real costs), and THE TURN (outfitted allies can turn — driven by real trust/opinion vs temptation, telegraphed, never random). The player's contribution is LOGISTICS: an army marches on its stomach.
// provides:
//   - isTitan(mid) / titanDef(mid) / titanCast()
//   - titanDawnTick() -> omen staging, escalation, muster upkeep, turn tick (called guarded from game.js dawn)
//   - titanWarCouncil(titanId) -> played beat: faces, intel, System ODDS (entertainment, not truth)
//   - soundTitanCall(titanId) -> the call to arms; allies answer aloud
//   - titanCommitOwn(titanId) -> the player commits HAVEN ITSELF: up to 3 named
//     villagers march with the muster (two-tap confirm). They leave the
//     workforce (isEngaged covers titanCommitted), eat from the muster upkeep,
//     count toward the hard gate, fight blow-by-blow as kind 'ally', and can
//     die (tbVillagerFalls + grief). Released on victory/defeat.
//   - titanVolunteers() -> available haven villagers by standing (commit pool)
//   - titanSelfActions() / titanSelfDo(id) -> the player-facing surface: war
//     council, call, and commit buttons in the camp self bar (app.js)
//   - titanOutfit(villageId, itemIds[]) -> real gear transfer; real effectiveness
//   - titanMusterState(titanId) / titanMusterReady(titanId)
//   - titanHavenBlades(muster)
//   - titanPlacementTile(offset) -> a free, non-village tile inside the travel map
//   - titanLeaveArena() -> map a large battlefield back to its world node
//   - titanReleaseCommitted(titanId) -> Haven's committed come home (shared with network-campaign.js)
//   - titanStandDown(titanId) -> break an out-of-combat muster, release its workforce and stop upkeep
//   - _titanTest (test hooks: internals exposed for proof tests)
//   - titanTemptation(villageId) -> {temptation, loyalty, verdict} (the turn's math, visible at council)
// rules:
//   - titan_is_a_flag: src/data/titans.json, never HP alone. A 2200-HP non-titan is a stat check; a titan is a coalition event. (code: titans.js)
//   - no_solo_titans: startCombat on a titan without a complete muster is HARD-REFUSED (said aloud), never a likely death. (code: titans.js)
//   - titans_never_wander: monsterWavePool excludes titans. They arrive by omen only. (code: titans.js)
//   - faces_not_units: allied fighters are named people from allied rosters. Never a management screen. (code: titans.js)
//   - fights_are_real: coalition combat is blow-by-blow (kind:'ally' fighters), never RNG tables. (code: titans.js)
//   - ally_death_costs: a dead ally marks their home roster, costs trust, and the alliance remembers. (code: titans.js)
//   - the_turn_is_earned: temptation (gear value + visible resources) vs loyalty (trust + opinion). Telegraph via gossip + council. Never random. (code: titans.js)
//   - commit_own_is_explicit: Haven's blades join only via the player's two-tap titanCommitOwn (never auto-committed by the call). Up to 3, named, said aloud; they leave the workforce (titanCommitted reads as engaged), eat from muster upkeep, count toward the hard gate, and can die. (code: titans.js)
//   - stolen_gear_is_lost: the loot law holds. No refunds except by force. (code: titans.js)
//   - odds_are_entertainment: the System's posted odds are wrong on purpose. That's the joke. (code: titans.js)
//   - knowledge_gates_titans: omen stages 0 (something) -> 1 (named) -> 2 (located). No name before exposure. (code: titans.js)

(function () {
  // ATTACH PATTERN (crisis 2026-10-11): game.js only sets
  // globalThis.Scattering.Game — a bare `Game` is a ReferenceError at load
  // LOAD-TIME BINDING (2026-10-12, combat-matrix + crisis legs converging):
  // bare `Game` here is a ReferenceError in every environment — game.js's
  // `const Game` is IIFE-scoped, never a global. Without this binding the
  // whole titan system silently never loaded (the IIFE threw at
  // Object.assign(Game, ...) and nothing attached). Sanctioned pattern
  // (betrayal.js, pods.js): read it from Scattering, bail if absent.
  var Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  var R = Math.random;

  // ---------- data ----------

  function titanDefs() {
    try {
      var raw = (Game.data && Game.data.titans) || {};
      var defs = {};
      Object.keys(raw).forEach(function (k) {
        if (k.charAt(0) !== '_') defs[k] = raw[k];
      });
      return defs;
    } catch (e) { return {}; }
  }

  // Per-run cast: the Herald + ONE apocalypse. Never all three.
  // Apocalypse pick: high-showmanship runs get the Nielsen (the ratings titan);
  // others get the Finale. Different endings get different climaxes.
  function titanCast() {
    var st = titanState();
    if (st.cast) return st.cast;
    var showmanship = 0;
    try { showmanship = (Game.state.ledger && Game.state.ledger.showmanship) || 0; } catch (e) {}
    var apocalypse = showmanship >= 20 ? 'nielsen' : 'finale';
    st.cast = { herald: 'herald', apocalypse: apocalypse }; // 2026-10-12: Herald is its own titan, not the Eater (Steve)
    return st.cast;
  }

  function titanState() {
    try {
      Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
      return Game.state.titans;
    } catch (e) { return { omens: {}, musters: {}, slain: {}, cast: null }; }
  }

  function titanOmen(titanId) {
    var st = titanState();
    st.omens[titanId] = st.omens[titanId] || { stage: 0, day: 0, warned: {} };
    return st.omens[titanId];
  }

  // ---------- engagement-outcome record (2026-10-21, backlog #784) ----------
  // One structured record per titan muster engagement, appended to
  // state.titans.outcomes. Outcomes: 'refused' (hard gate, no fight),
  // 'fought' (a coalition fight started — resolved in place to 'slain' /
  // 'fled' at tbEnd), 'stood-down' (the muster broke before the fight —
  // the census's evaded class). Pure log writes: no game logic reads
  // this array, no RNG is drawn, no behavior changes. The wave-4/titan
  // census and the table audit join to it instead of guessing from
  // omens/musters (which cannot distinguish "never mustered" from "the
  // coalition broke and ran").
  function titanOutcomeDay() {
    try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
  }
  function titanOutcomeLog() {
    var st = titanState();
    st.outcomes = st.outcomes || [];
    return st.outcomes;
  }
  function titanRecordOutcome(titanId, outcome, detail) {
    try {
      titanOutcomeLog().push({
        titan: titanId,
        day: titanOutcomeDay(),
        outcome: outcome, // 'refused' | 'fought' | 'stood-down'
        detail: detail || null,
      });
    } catch (e) {}
  }
  function titanResolveOutcome(titanId, outcome, result) {
    // Terminal for the most recent open 'fought' record of this titan.
    // Resolved in place so the census has exactly one record per
    // encounter; a terminal with no open 'fought' record (e.g. a dissolve
    // path that never called tbEnd) is written standalone so it never
    // inflates 'unresolved'.
    try {
      var recs = titanOutcomeLog();
      for (var i = recs.length - 1; i >= 0; i--) {
        var r = recs[i];
        if (r && r.titan === titanId && r.outcome === 'fought') {
          r.outcome = outcome; // 'slain' | 'fled'
          r.endDay = titanOutcomeDay();
          r.result = (result === undefined || result === null) ? null : String(result);
          return;
        }
      }
      recs.push({ titan: titanId, day: titanOutcomeDay(), outcome: outcome, result: (result === undefined || result === null) ? null : String(result), orphan: true });
    } catch (e) {}
  }

  // ---------- dawn tick: omens, escalation, upkeep, the turn ----------

  function titanDawnTick() {
    try {
      titanReconcileBearer();
      var day = (Game.state.scholar || {}).day || 0;
      var cast = titanCast();
      // Herald omen: wave 4 unlocked + regional+
      var wave = 1;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      var rank = 'village';
      try { rank = Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) {}
      var rankOk4 = ['regional', 'national', 'global'].indexOf(rank) >= 0;
      var rankOk5 = ['national', 'global'].indexOf(rank) >= 0;
      if (wave >= 4 && rankOk4) titanMaybeOmen(cast.herald, day, 0.10);
      if (wave >= 5 && rankOk5) titanMaybeOmen(cast.apocalypse, day, 0.08);
      // OVERTIME (Steve 2026-10-14: "waiting should have a cost"): a run
      // that keeps the Table waiting gets the OTHER climax too — the
      // apocalypse this run did not cast airs as a rerun. Without it,
      // "all three titans slain" (the key's gate) could never happen.
      var live = [cast.herald, cast.apocalypse];
      var third = (typeof Game.overtimeThirdTitan === 'function') ? Game.overtimeThirdTitan() : null;
      if (third) {
        var otc = 0.25;
        try { otc = ((Game.data.titans || {})._overtime || {}).thirdTitanOmenChance || 0.25; } catch (e) { console.warn('titans overtime cfg', e); }
        titanMaybeOmen(third, day, otc);
        live.push(third);
      }
      // advance omens, escalation, muster upkeep, turn tick
      live.forEach(function (tid) {
        titanAdvanceOmen(tid, day);
        titanEscalate(tid, day);
      });
      titanMusterUpkeep(day);
      titanTurnTick(day);
    } catch (e) {}
  }

  function titanMaybeOmen(titanId, day, p) {
    var st = titanState();
    if (st.slain[titanId]) return;
    var o = st.omens[titanId];
    if (o) return;
    if (R() < p) {
      st.omens[titanId] = { stage: 0, day: day, warned: {} };
      var def = titanDefs()[titanId];
      Game.say('🔭 Scouts come back pale. ' + (def ? def.omen0 : 'Something big is moving out there.'));
      try { if (Game.recordMoment) Game.recordMoment('Titan omen: something stirs.'); } catch (e) {}
    }
  }

  function titanAdvanceOmen(titanId, day) {
    var st = titanState();
    var o = st.omens[titanId];
    if (!o || st.slain[titanId]) return;
    var def = titanDefs()[titanId];
    if (!def) return;
    // stage 0 -> 1 (heard/named): gossip names it
    if (o.stage === 0 && day - o.day >= 4 && R() < 0.35) {
      o.stage = 1;
      Game.say('📻 ' + (def.omen1 || ('They name it: ' + def.title + '.')));
    }
    // stage 1 -> 2 (located): scouts find the lair — the titan is placed
    if (o.stage === 1 && day - o.day >= 9 && R() < 0.4) {
      o.stage = 2;
      o.day = day;
      titanPlace(titanId);
    }
  }

  // Preserve the intended eastward march where it fits. At the edge, choose
  // the closest legal site rather than placing an objective outside travelTargets.
  function titanPlacementTile(offset) {
    var map = Game.map, tiles = map && map.tiles;
    if (!tiles) return null;
    var px = map.px, py = map.py, targetX = px + offset, sites = [];
    for (var y = 0; y < Math.min(9, tiles.length); y++) {
      for (var x = 0; x < Math.min(9, (tiles[y] || []).length); x++) {
        if (!tiles[y][x] || (x === px && y === py) || Game.isSafeTile(x, y) || Game.monsterAt(x, y)) continue;
        sites.push({ x: x, y: y, d: Math.abs(x - targetX) + Math.abs(y - py) });
      }
    }
    sites.sort(function (a, b) { return a.d - b.d || b.x - a.x || a.y - b.y; });
    return sites.length ? { x: sites[0].x, y: sites[0].y } : null;
  }

  // Old saves may already contain an out-of-map lair. Repair only those
  // coordinates, retaining the same monster, damage, muster and campaign.
  function titanRepairPlacements() {
    var defs = titanDefs(), changed = false;
    var ids = Object.keys(defs).map(function (tid) { return defs[tid].monster; });
    ids.push('finale_crew', 'finale_opening');
    Game.worldMonsters().forEach(function (m) {
      if (m.networkNode || ids.indexOf(m.id) < 0) return;
      if (Number.isInteger(m.tx) && Number.isInteger(m.ty) && m.tx >= 0 && m.tx < 9 && m.ty >= 0 && m.ty < 9 &&
          Game.map.tiles[m.ty] && Game.map.tiles[m.ty][m.tx]) return;
      var site = titanPlacementTile(3);
      if (!site) { console.warn('titan placement repair: no free map tile', m.id); return; }
      m.tx = site.x; m.ty = site.y;
      changed = true;
      if (m.homeTx !== undefined) m.homeTx = site.x;
      if (m.homeTy !== undefined) m.homeTy = site.y;
      Game.say('🗺️ Scouts correct their map — ' + m.id.replace(/_/g, ' ') + ' is at tile ' + site.x + ',' + site.y + '.');
    });
    if (changed) Game.syncMonsterAlias();
  }

  function titanPlace(titanId) {
    try {
      // FINALE CAMPAIGN (2026-10-12): the finale arrives as a three-node
      // march, not one lair. The campaign module places its own nodes.
      if (titanId === 'finale' && typeof Game.finaleCampaignPlace === 'function') {
        return Game.finaleCampaignPlace(titanId);
      }
      var def = titanDefs()[titanId];
      var site = titanPlacementTile(3);
      if (!site) { console.warn('titan placement: no free map tile', titanId); return null; }
      var tx = site.x, ty = site.y;
      var mon = Game.spawnWorldMonster(def.monster, tx, ty, { titan: true });
      Game.say('🗺️ Scouts found its lair — tile ' + tx + ',' + ty + '. ' + def.title + ' — ' + (def.epithet || '') + '. It is WAITING. You cannot face it alone. Sound the call.');
      try { if (Game.recordMoment) Game.recordMoment(def.title + ' located. The coalition must answer.'); } catch (e) {}
      return mon;
    } catch (e) { return null; }
  }

  // Escalation: an unanswered titan feeds. Said aloud, real costs.
  function titanEscalate(titanId, day) {
    var st = titanState();
    var o = st.omens[titanId];
    if (!o || o.stage < 2 || st.slain[titanId]) return;
    if (o.resolved) return;
    // every 5 days unanswered, it strikes
    if ((day - o.day) % 5 !== 0) return;
    var def = titanDefs()[titanId];
    if (R() < 0.45) {
      // raids Haven's pantry
      var take = 2000 + Math.floor(R() * 2000);
      var got = 0;
      try { got = Game.playerPackSpend ? Game.playerPackSpend(take) : 0; } catch (e) {}
      Game.say('🌪️ ' + def.title + ' fed in the night — ' + got.toLocaleString() + ' kcal gone from your stores. It is eating the realm while you deliberate.');
    } else {
      // strikes an allied village: trust cost
      var links = titanAlliedLinks();
      if (!links.length) return;
      var link = links[Math.floor(R() * links.length)];
      var ov = null;
      try { ov = Game._otherVillage(Game._linkOther(link, 'haven')); } catch (e) {}
      var nm = (ov && ov.name) || 'an allied fire';
      link.trust = Math.max(0, (link.trust || 0) - 5);
      // journey-scale r36: book the move — the say line is heard in the
      // moment, but a player scrolling back could never find the −5.
      // Note only; the number above is unchanged.
      try { if (Game._linkNote) Game._linkNote(link, 'titan', def.title + ' struck ' + nm + ' in the night — trust −5; they notice who wasn\'t there.'); } catch (e) {}
      Game.say('🌪️ ' + def.title + ' struck ' + nm + ' in the night. They bled while the coalition talked. (trust −5 — they notice who wasn\'t there.)');
    }
    try { if (Game.recordMoment) Game.recordMoment(def.title + ' struck unanswered.'); } catch (e) {}
  }

  // ---------- allies ----------

  function titanAlliedLinks() {
    try {
      var links = Game.hierarchyState ? Game.hierarchyState() : [];
      return links.filter(function (l) { return l && l.status === 'active'; });
    } catch (e) { return []; }
  }

  function titanLinkOther(link) {
    try {
      if (Game._linkOther) return Game._linkOther(link, 'haven');
      return link.primary === 'haven' ? link.subordinate : link.primary;
    } catch (e) { return null; }
  }

  // One real person, one blade. Old saves can contain repeated calls' copies.
  function titanUniqueAllies(muster) {
    var seen = {};
    return ((muster && muster.allies) || []).filter(function (a) {
      if (!a || !a.vid) return false;
      var key = a.villageId + ':' + a.vid;
      if (seen[key]) return false;
      var ov = Game._otherVillage ? Game._otherVillage(a.villageId) : null;
      var person = ov && (ov.roster || []).find(function (r) { return r.id === a.vid; });
      if ((a.hp !== undefined && a.hp <= 0) || (person && (!person.alive || (person.health !== undefined && person.health <= 0)))) return false;
      seen[key] = true;
      return true;
    });
  }

  function titanNormalizeMuster(muster) {
    var unique = titanUniqueAllies(muster), byId = {};
    unique.forEach(function (a) { byId[a.villageId + ':' + a.vid] = a; });
    (muster.allies || []).forEach(function (a) {
      if (!a) return;
      var first = byId[a.villageId + ':' + a.vid];
      if (!first || first === a) return;
      // Real donations on old duplicate records still belong to this person.
      // Keep the actual item objects instead of deleting gifted equipment.
      first.outfitted = first.outfitted || [];
      (a.outfitted || []).forEach(function (g) { if (first.outfitted.indexOf(g) < 0) first.outfitted.push(g); });
      if (first.outfitted.length) {
        var wb = 0, ar = 0;
        first.outfitted.forEach(function (g) {
          var d = (Game.data.items || []).find(function (x) { return x.id === (g.itemId || g.id); });
          if (d && d.weapon) wb += d.weapon.bonus || 0;
          if (d && d.armor) ar += typeof d.armor === 'number' ? d.armor : 10;
        });
        first.wbonus = wb; first.varmor = Math.min(ar, 40);
        first.gearValue = first.outfitted.reduce(function (n, g) { return n + titanGearValue(g); }, 0);
      }
      first.hp = Math.min(first.hp == null ? 100 : first.hp, a.hp == null ? 100 : a.hp);
    });
    muster.allies = unique;
  }

  // Named faces from an allied roster: speaker first, then free living adults.
  // Missing age is retained for old saves; generated rosters carry real ages.
  function titanAlliedFaces(villageId, n, excluded) {
    var faces = [];
    try {
      var ov = Game._otherVillage(villageId);
      var roster = (ov && ov.roster) || [];
      var link = titanAlliedLinks().filter(function (l) { return titanLinkOther(l) === villageId; })[0];
      var speakerId = link && link.theirSpeaker ? link.theirSpeaker.id : null;
      var ordered = roster.filter(function (r) { return r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0) && !(excluded && excluded[villageId + ':' + r.id]); });
      ordered.sort(function (a, b) { return (a.id === speakerId ? -1 : 0) - (b.id === speakerId ? -1 : 0); });
      for (var i = 0; i < Math.min(n, ordered.length); i++) {
        faces.push({ id: ordered[i].id, name: ordered[i].name || 'a fighter', villageId: villageId, hp: ordered[i].health === undefined ? 100 : ordered[i].health });
      }
    } catch (e) { console.warn('titan allied faces', villageId, e); }
    return faces;
  }

  // ---------- war council ----------

  function titanWarCouncil(titanId) {
    var def = titanDefs()[titanId];
    if (!def) return null;
    var o = titanOmen(titanId);
    Game.say('⚔️ WAR COUNCIL — ' + def.title + '. The leaders sit as faces, not pieces.');
    var links = titanAlliedLinks();
    if (!links.length) {
      Game.say('No one sits with you. You have no coalition. The council is one chair.');
      return { allies: 0 };
    }
    links.forEach(function (link) {
      var vid = titanLinkOther(link);
      var ov = null;
      try { ov = Game._otherVillage(vid); } catch (e) {}
      var nm = (ov && ov.name) || 'them';
      var speaker = (link.theirSpeaker && link.theirSpeaker.name) || 'their speaker';
      var t = titanTemptation(vid);
      var loyalty = t.loyalty >= 70 ? 'steadfast' : t.loyalty >= 40 ? 'watchful' : 'hungry';
      Game.say('— ' + speaker + ' of ' + nm + ' (trust ' + (link.trust || 0) + ', ' + loyalty + '). Scouts: ' + (t.intel || 'they will fight.'));
    });
    // scout intel: honest, knowledge-gated (counter hint only if known)
    var hint = '';
    try {
      var known = Game.monsterCounterKnown ? Game.monsterCounterKnown(def.monster) : false;
      hint = known && def.counter_hint ? ' The scouts know its weakness: ' + def.counter_hint : ' Its weakness is unknown — the scouts came back pale.';
    } catch (e) {}
    Game.say('Scouts report: ' + def.threat + hint);
    // System ODDS: entertainment, not truth. Deliberately miscalibrated.
    var oddsN = 8 + Math.floor(R() * 20);
    Game.sysSay('"ODDS ARE UP! ' + def.title + ' vs the Haven coalition — ' + oddsN + ' to 1! The gamblers are THRILLED! (Our models have never seen a titan. Neither have you. This is fine.)"');
    try { if (Game.recordMoment) Game.recordMoment('War council sat for ' + def.title + '.'); } catch (e) {}
    return { allies: links.length };
  }

  // ---------- the call to arms ----------

  function soundTitanCall(titanId) {
    var def = titanDefs()[titanId];
    if (!def) return null;
    var st = titanState();
    var muster = st.musters[titanId] = st.musters[titanId] || { allies: [], haven: [], day: (Game.state.scholar || {}).day || 0, outfitted: {} };
    titanNormalizeMuster(muster);
    var committed = {};
    Object.keys(st.musters).forEach(function (tid) {
      if (st.slain[tid]) return;
      titanUniqueAllies(st.musters[tid]).forEach(function (a) { committed[a.villageId + ':' + a.vid] = true; });
    });
    Game.say('📯 THE CALL GOES OUT — ' + def.title + ' must fall, and no one fire can do it.');
    var links = titanAlliedLinks();
    var answered = 0;
    links.forEach(function (link) {
      var vid = titanLinkOther(link);
      var ov = null;
      try { ov = Game._otherVillage(vid); } catch (e) {}
      var nm = (ov && ov.name) || 'them';
      var trust = link.trust || 0;
      var opinion = (ov && ov.opinion) || 0;
      // refusal: fear, hatred, arrears, recent grief — said aloud with reasons
      if (trust < 25 || opinion < -10 || (link.arrears || 0) > 0) {
        var why = trust < 25 ? 'they do not trust this coalition with their people' :
          opinion < -10 ? 'old blood between you' : 'debts unpaid between you';
        link.trust = Math.max(0, trust - 8);
        Game.say('— ' + nm + ' REFUSES. ' + why + '. (trust −8 — refusals are remembered.)');
        return;
      }
      var cfg = (Game.data.titans || {})._coalition || {};
      var quota = trust >= (cfg.trustedAt || 70) && opinion >= (cfg.trustedOpinion == null ? 10 : cfg.trustedOpinion)
        ? (cfg.trustedBlades || 6) : (cfg.baseBlades || 2);
      var already = muster.allies.filter(function (a) { return a.villageId === vid; }).length;
      if (already >= quota) { Game.say('— ' + nm + '\u2019s volunteers already march. No new blades join.'); return; }
      var faces = titanAlliedFaces(vid, quota - already, committed);
      if (!faces.length) {
        Game.say('— ' + nm + ' has no free fighters to send. Their fire is thin.');
        return;
      }
      faces.forEach(function (f) {
        muster.allies.push({ villageId: vid, vid: f.id, name: f.name, hp: f.hp, outfitted: [], gearValue: 0 });
        committed[vid + ':' + f.id] = true;
      });
      answered++;
      Game.say('— ' + nm + ' answers! ' + faces.map(function (f) { return f.name; }).join(' and ') + ' will march. (trust holds — they are counting on you.)');
      if (quota === (cfg.baseBlades || 2)) Game.say('Closer bonds with ' + nm + ' could bring more volunteers. For now, these are the people they can spare.');
    });
    // HAVEN'S OWN (2026-10-13): the call no longer auto-commits anyone from
    // Haven. Committing your own people is the player's verb now —
    // titanCommitOwn, two taps, said aloud, costly. The muster tracks
    // muster.haven as [{vid}] (never bare ids).
    try { if (Game.recordMoment) Game.recordMoment('The call went out against ' + def.title + ': ' + answered + ' fires answered.'); } catch (e) {}
    return muster;
  }

  // ---------- titanCommitOwn: Haven sends its own ----------

  // The commit pool: available Haven villagers, best standing first. Same
  // availability bar as _availableRepresentative (hierarchy.js): not away,
  // not traveling with the player, not engaged — and isEngaged covers
  // titanCommitted, so the already-marched can't volunteer twice.
  function titanVolunteers() {
    var out = [];
    try {
      var v = Game.state.village || {};
      var me = Game.villagerId;
      var withYou = {};
      try {
        var tw = Game.travelingWith ? Game.travelingWith() : [];
        for (var i = 0; i < tw.length; i++) withYou[tw[i]] = 1;
      } catch (e) {}
      var nodeAway = {};
      try { var va = v.away || {}; for (var k in va) nodeAway[k] = 1; } catch (e2) {}
      (v.roster || []).forEach(function (id) {
        if (!id || id === me) return;
        try { if (Game.isMember && !Game.isMember(id)) return; } catch (e) { return; }
        try { if (Game._isAwayVid && Game._isAwayVid(id)) return; } catch (e) {}
        if (nodeAway[id] || withYou[id]) return;
        try { if (Game.isEngaged && Game.isEngaged(id)) return; } catch (e) {}
        out.push(id);
      });
      out.sort(function (a, b) {
        var sa = 0, sb = 0;
        try { sa = Game.linkStanding ? Game.linkStanding(a) : 0; } catch (e) {}
        try { sb = Game.linkStanding ? Game.linkStanding(b) : 0; } catch (e) {}
        return sb - sa;
      });
    } catch (e) {}
    return out;
  }

  function titanBladeName(vid) {
    try {
      var n = Game.displayName ? Game.displayName(vid) : null;
      if (n) return String(n).split(' ')[0];
    } catch (e) {}
    return 'Someone';
  }

  function titanHavenBlades(muster) {
    var roster = ((Game.state || {}).village || {}).roster || [], seen = {};
    return ((muster && muster.haven) || []).map(function (h) { return typeof h === 'string' ? { vid: h } : h; }).filter(function (h) {
      if (!h || !h.vid || h.vid === Game.villagerId || seen[h.vid] || roster.indexOf(h.vid) < 0) return false;
      seen[h.vid] = true;
      return true;
    });
  }

  // You become that villager, not that villager plus their old NPC role.
  // Also reconciles old saves before a dawn upkeep/injection can count it.
  function titanReconcileBearer() {
    var state = Game.state || {}, st = state.titans, v = state.village || {};
    if (v.titanCommitted) delete v.titanCommitted[Game.villagerId];
    Object.keys((st && st.musters) || {}).forEach(function (tid) {
      var m = st.musters[tid];
      if (m) m.haven = titanHavenBlades(m);
    });
  }

  // titanCommitOwn(titanId): the player commits Haven itself to the titan.
  // Up to 3 named villagers march. Legible (two taps, names said aloud, cost
  // stated up front), costly (they leave the workforce, eat 1000 kcal/day
  // each from the muster upkeep, and can die — tbVillagerFalls removes them
  // from Haven's roster), consequential (they count toward the hard gate and
  // fight blow-by-blow via titanInjectAllies).
  function titanCommitOwn(titanId) {
    var def = titanDefs()[titanId];
    if (!def) return null;
    var st = titanState();
    if (st.slain[titanId]) { Game.say('It is already dead. The committed have nothing left to march against.'); return null; }
    if (titanId === 'the_network' && st.campaigns && st.campaigns.network && st.campaigns.network.started) {
      if (st.pendingCommit && st.pendingCommit.indexOf(titanId + ':') === 0) st.pendingCommit = null;
      Game.say('📯 No new blades join the Network march — not even Haven\u2019s. The coalition is the one you started with.');
      return null;
    }
    var o = titanOmen(titanId);
    if (!o || o.stage < 2) {
      Game.say('There is nothing located to march against — the sky is quiet. You commit no one into the dark.');
      return null;
    }
    var muster = st.musters[titanId] = st.musters[titanId] || { allies: [], haven: [], day: (Game.state.scholar || {}).day || 0, outfitted: {} };
    var blades = titanHavenBlades(muster);
    // hygiene: the dead don't march (roster already dropped them)
    var v = Game.state.village || {};
    var roster = v.roster || [];
    muster.haven = blades = blades.filter(function (h) { return h && roster.indexOf(h.vid) >= 0; });
    if (blades.length >= 3) {
      Game.say('Haven\u2019s blades already march — ' + blades.map(function (h) { return titanBladeName(h.vid); }).join(', ') + '. Haven cannot empty itself; the coalition is the many, our part is the few.');
      return muster;
    }
    var have = {};
    blades.forEach(function (h) { have[h.vid] = 1; });
    var cands = titanVolunteers().filter(function (id) { return !have[id]; }).slice(0, 3 - blades.length);
    if (!cands.length) {
      Game.say('No one is free to march — every able body is away, engaged, or already committed. ' + def.title + ' waits. The coalition will have to be enough.');
      return null;
    }
    var names = cands.map(titanBladeName).join(', ');
    // TWO TAPS (the attackConfirm idiom): the first tap names the volunteers
    // and states the cost honestly. The second tap sends them.
    var pendKey = titanId + ':' + cands.join(',');
    if (st.pendingCommit !== pendKey) {
      st.pendingCommit = pendKey;
      Game.say('\uD83D\uDEE1\uFE0F ' + names + (cands.length === 1 ? ' steps' : ' step') + ' forward. ' +
        (cands.length === 1 ? 'They will' : 'They will') + ' march with the muster, eat from your stores (1000 kcal/day each), and stand in front of ' + def.title + '. ' +
        'They can die — Haven does not get them back, and the fire will be quieter. Tap again \u2014 Haven sends its own.');
      return 'confirm';
    }
    st.pendingCommit = null;
    cands.forEach(function (id) { muster.haven.push({ vid: id }); });
    v.titanCommitted = v.titanCommitted || {};
    cands.forEach(function (id) { v.titanCommitted[id] = titanId; });
    Game.say('\uD83D\uDEE1\uFE0F Haven commits its own: ' + names + ' march' + (cands.length === 1 ? 'es' : '') + ' with the muster. Not loaned. Not asked-for. Ours. The coalition counts ' + (muster.allies.length + muster.haven.length) + ' blades against ' + def.title + ' — it needs ' + def.minAllies + '.');
    try { if (Game.recordMoment) Game.recordMoment('Haven committed its own blades against ' + def.title + ': ' + names + '.'); } catch (e) {}
    try { if (Game.ledgerAdd) Game.ledgerAdd('titan', 'commit-own:' + titanId + ':' + cands.length); } catch (e) {}
    try { if (Game.save) Game.save(); } catch (e) {}
    return muster;
  }

  // The player-facing surface (app.js self bar, phoenixLinkActions pattern):
  // war council, the call, and the commit — camp verbs, never combat verbs.
  function titanSelfActions() {
    var acts = [];
    try {
      if (Game.tbfight) return acts;
      titanRepairPlacements();
      var st = titanState();
      var defs = titanDefs();
      Object.keys(defs).forEach(function (tid) {
        if (st.slain[tid]) return;
        var o = st.omens[tid];
        if (!o || o.stage < 2) return;
        var def = defs[tid];
        acts.push({
          id: 'titan:council:' + tid,
          label: '\u2694\uFE0F War council \u2014 ' + def.title,
          hint: 'Sit the council. Faces, scout intel, the System\u2019s odds (entertainment, not truth).'
        });
        var muster = st.musters[tid];
        var march = st.campaigns || {};
        var networkStarted = tid === 'the_network' && march.network && march.network.started;
        var havenN = muster ? titanHavenBlades(muster).length : 0;
        var alliedN = muster ? (muster.allies || []).length : 0;
        if (havenN < 3 && !networkStarted) {
          var pend = st.pendingCommit && st.pendingCommit.indexOf(tid + ':') === 0;
          acts.push(pend ? {
            id: 'titan:commit:' + tid,
            label: '\uD83D\uDEE1\uFE0F Send them \u2014 tap again',
            hint: 'Confirm: Haven\u2019s volunteers march. They eat, they bleed, they can die.'
          } : {
            id: 'titan:commit:' + tid,
            label: '\uD83D\uDEE1\uFE0F Commit Haven\u2019s blades',
            hint: 'Up to 3 of ours march with the muster (' + alliedN + ' allied + ' + havenN + ' ours so far). They eat, they bleed, they can die.'
          });
        }
        if (muster) {
          acts.push({
            id: 'titan:standdown:' + tid,
            label: '\uD83D\uDD4A\uFE0F Stand the muster down',
            hint: 'Break the muster (' + (alliedN + havenN) + ' blades). Haven\u2019s committed come home, upkeep stops, answering fires lose 5 trust. The titan stays unanswered.'
          });
        }
        var finaleStarted = tid === 'finale' && march.finale && march.finale.started;
        if (!networkStarted && (!alliedN || !titanMusterReady(tid))) {
          acts.push({
            id: finaleStarted ? 'titan:reinforce:finale' : 'titan:call:' + tid,
            label: finaleStarted ? '\uD83D\uDCEF Call for reinforcements' : '\uD83D\uDCEF Sound the call',
            hint: finaleStarted ? 'New people can answer at a cost of 3 trust per answering fire. The dead stay dead.' : 'The call to arms \u2014 allied fires answer aloud, or refuse aloud. Refusals are remembered.'
          });
        }
      });
    } catch (e) {}
    return acts;
  }

  function titanSelfDo(id) {
    var m = /^titan:(council|call|commit|reinforce|standdown):(.+)$/.exec(id || '');
    if (!m) return null;
    if (m[1] === 'council') return Game.titanWarCouncil(m[2]);
    if (m[1] === 'call') return Game.soundTitanCall(m[2]);
    if (m[1] === 'commit') return titanCommitOwn(m[2]);
    if (m[1] === 'reinforce' && m[2] === 'finale' && Game.finaleReinforce) return Game.finaleReinforce();
    if (m[1] === 'standdown') return titanStandDown(m[2]);
    return null;
  }

  // release the committed: victory, defeat, or the muster breaking. The
  // survivors come home; the flag clears so the workforce returns.
  function titanReleaseCommitted(titanId) {
    try {
      var v = Game.state.village || {};
      if (!v.titanCommitted) return;
      Object.keys(v.titanCommitted).forEach(function (vid) {
        if (v.titanCommitted[vid] === titanId) delete v.titanCommitted[vid];
      });
    } catch (e) {}
  }

  function titanStandDown(titanId) {
    if (Game.tbfight && !Game.tbfight.over) {
      Game.say('Finish or leave the fight before standing the muster down.');
      return null;
    }
    var def = titanDefs()[titanId];
    if (!def) return null;
    var st = titanState();
    var muster = st.musters[titanId];
    if (!muster) {
      Game.say('No muster stands against ' + def.title + '. There is nothing to stand down.');
      return null;
    }
    titanNormalizeMuster(muster);
    var o = st.omens[titanId];
    if (!o || st.slain[titanId]) return null;
    var havenN = titanHavenBlades(muster).length;
    var byVillage = {};
    (muster.allies || []).forEach(function (a) {
      if (a.villageId === 'haven') return;
      (byVillage[a.villageId] = byVillage[a.villageId] || []).push(a.name || 'a blade');
    });
    titanReleaseCommitted(titanId);
    st.musters[titanId] = null;
    if (st.pendingCommit && st.pendingCommit.indexOf(titanId + ':') === 0) st.pendingCommit = null;
    Object.keys(byVillage).forEach(function (vid) {
      var link = titanAlliedLinks().filter(function (l) { return titanLinkOther(l) === vid; })[0];
      if (link) link.trust = Math.max(0, (link.trust || 0) - 5);
    });
    var answered = Object.keys(byVillage).length;
    var line = '\uD83D\uDD4A\uFE0F THE MUSTER BREAKS \u2014 ' + def.title + ' still stands, unanswered, but the blades go home.';
    if (havenN) line += ' ' + havenN + ' of Haven\u2019s own come' + (havenN === 1 ? 's' : '') + ' home.';
    if (answered) {
      line += ' ' + answered + ' allied fire' + (answered === 1 ? '' : 's') +
        ' walk' + (answered === 1 ? 's' : '') + ' home thinner (trust \u22125 \u2014 they bled for a fight that never came).';
    } else {
      line += ' No one answered the call, so no one carries the cost \u2014 except the realm the titan still feeds on.';
    }
    line += ' The lair waits. Sound the call again when the coalition is real.';
    Game.say(line);
    try { if (Game.recordMoment) Game.recordMoment('The muster against ' + def.title + ' stood down \u2014 the blades went home.'); } catch (e) { console.warn('[titan] stand down', e); }
    try { if (Game.ledgerAdd) Game.ledgerAdd('titan', 'standdown:' + titanId); } catch (e) { console.warn('[titan] stand down', e); }
    titanRecordOutcome(titanId, 'stood-down', { haven: havenN, allied: answered });
    try { if (Game.save) Game.save(); } catch (e) { console.warn('[titan] stand down', e); }
    return true;
  }

  // ---------- outfitting: real gear, real costs, real effectiveness ----------

  function titanGearValue(item) {
    var v = 0;
    try {
      var def = null;
      if (Game.data && Game.data.items) def = Game.data.items.find(function (x) { return x.id === (item.itemId || item.id); });
      if (def) {
        if (def.weapon && def.weapon.bonus) v += def.weapon.bonus * 10;
        if (def.armor) v += (typeof def.armor === 'number' ? def.armor : 20) * 8;
        v += (def.lootTier || 0) * 150;
      }
      v += (item.kcalEach || 0) * (item.units || 0) * 0.5;
    } catch (e) {}
    return Math.round(v);
  }

  // titanOutfit(villageId, itemIndexes[]): transfer REAL items from the player's
  // inventory to an allied force. Items leave. Effectiveness is real.
  function titanOutfit(titanId, villageId, itemIndexes) {
    var st = titanState();
    var muster = st.musters[titanId];
    if (!muster) { Game.say('No muster stands. Sound the call first.'); return null; }
    var inv = [];
    try { inv = Game.state.scholar.inventory || []; } catch (e) {}
    var force = muster.allies.filter(function (a) { return a.villageId === villageId; });
    if (!force.length) { Game.say('They march with no one. There is no force to outfit.'); return null; }
    var given = [];
    var idxs = (itemIndexes || []).slice().sort(function (a, b) { return b - a; });
    idxs.forEach(function (ix) {
      var it = inv[ix];
      if (!it || it.bonded) return;
      // split: whole stack or single unit? Whole non-food stacks; food by units stays pack logic. Keep simple: whole item.
      inv.splice(ix, 1);
      given.push(it);
    });
    if (!given.length) { Game.say('Nothing to give — or nothing you can part with.'); return null; }
    // distribute across the force's fighters; compute effectiveness
    var givenCount = given.length;
    var per = Math.floor(given.length / force.length), rem = given.length % force.length;
    force.forEach(function (f, i) {
      var n = per + (i < rem ? 1 : 0);
      for (var k = 0; k < n; k++) {
        var g = given.pop();
        if (!g) break;
        f.outfitted.push(g);
        f.gearValue += titanGearValue(g);
      }
      // effectiveness: recompute from outfitted gear
      var wb = 0, ar = 0;
      f.outfitted.forEach(function (g) {
        var def = null;
        try { def = Game.data.items.find(function (x) { return x.id === (g.itemId || g.id); }); } catch (e) {}
        if (def && def.weapon && def.weapon.bonus) wb += def.weapon.bonus;
        if (def && def.armor) ar += (typeof def.armor === 'number' ? def.armor : 10);
      });
      f.wbonus = wb; f.varmor = Math.min(ar, 40);
    });
    var totalV = force.reduce(function (s, f) { return s + f.gearValue; }, 0);
    var ov = null;
    try { ov = Game._otherVillage(villageId); } catch (e) {}
    Game.say('🎒 Outfitted ' + ((ov && ov.name) || 'them') + ': ' + givenCount + ' piece' + (givenCount === 1 ? '' : 's') + ' left your pack — for good. Their blades are heavier now (+' + force.reduce(function (s, f) { return s + (f.wbonus || 0); }, 0) + ' strike, +' + force.reduce(function (s, f) { return s + (f.varmor || 0); }, 0) + ' guard across the force). What you gave is gone. What it bought is real.');
    try { if (Game.recordMoment) Game.recordMoment('Outfitted the ' + ((ov && ov.name) || 'allied') + ' force (' + totalV + ' value).'); } catch (e) {}
    // telegraph: arming someone is SEEN. Gossip notices.
    titanTelegraphArming(titanId, villageId);
    return { given: givenCount, value: totalV };
  }

  function titanTelegraphArming(titanId, villageId) {
    try {
      var ov = Game._otherVillage(villageId);
      var nm = (ov && ov.name) || 'them';
      var t = titanTemptation(villageId);
      if (t.verdict === 'watch') {
        Game.say('👀 Gossip at the fire: "' + nm + ' has been looking at your armory the way you look at a full pantry." Someone saw the giving and did the math.');
        var o = titanOmen(titanId);
        o.warned[villageId] = (o.warned[villageId] || 0) + 1;
      }
    } catch (e) {}
  }

  // ---------- temptation vs loyalty: the turn's math, visible at council ----------

  function titanTemptation(villageId) {
    var st = titanState();
    var loyalty = 50, temptation = 0, intel = '';
    try {
      var link = titanAlliedLinks().filter(function (l) { return titanLinkOther(l) === villageId; })[0];
      var ov = Game._otherVillage(villageId);
      var trust = link ? (link.trust || 0) : 0;
      var opinion = (ov && ov.opinion) || 0;
      loyalty = Math.max(0, Math.min(100, trust + opinion / 2 + 25));
      // temptation: gear value given + visible resources
      var gearV = 0;
      Object.keys(st.musters).forEach(function (tid) {
        var m = st.musters[tid];
        (m.allies || []).forEach(function (a) {
          if (a.villageId === villageId) gearV += (a.gearValue || 0);
        });
      });
      var packK = 0;
      try { packK = Game.playerPackKcal ? Game.playerPackKcal() : 0; } catch (e) {}
      // scaling (Steve 2026-10-11): temptation is real but slow. ~4000 value
      // of gear (a well-outfitted force) = 50 temptation; 15000 kcal visible
      // pack = 10. It only beats loyalty when trust has cratered.
      temptation = Math.max(0, Math.min(100, gearV / 80 + packK / 1500));
      intel = loyalty >= 70 ? 'they would die for this coalition' :
        loyalty >= 40 ? 'they weigh it daily' : 'their eyes keep drifting to your stores';
    } catch (e) {}
    var verdict = temptation > loyalty + 15 ? 'turn' : temptation > loyalty - 5 ? 'watch' : 'steadfast';
    return { loyalty: Math.round(loyalty), temptation: Math.round(temptation), verdict: verdict, intel: intel };
  }

  // The turn tick: never random. Driven by the real numbers, telegraphed first.
  function titanTurnTick(day) {
    var st = titanState();
    Object.keys(st.musters).forEach(function (titanId) {
      var muster = st.musters[titanId];
      if (!muster || st.slain[titanId]) return;
      var byVillage = {};
      (muster.allies || []).forEach(function (a) {
        (byVillage[a.villageId] = byVillage[a.villageId] || []).push(a);
      });
      Object.keys(byVillage).forEach(function (vid) {
        var t = titanTemptation(vid);
        var o = titanOmen(titanId);
        if (t.verdict === 'turn' && (o.warned[vid] || 0) >= 1 && !muster.turned) {
          titanTurn(titanId, vid);
        }
      });
    });
  }

  function titanTurn(titanId, villageId) {
    var st = titanState();
    var muster = st.musters[titanId];
    var def = titanDefs()[titanId];
    var ov = null;
    try { ov = Game._otherVillage(villageId); } catch (e) {}
    var nm = (ov && ov.name) || 'them';
    // remove their fighters from the muster — the gear goes WITH them. Loot law: lost.
    var seized = [];
    muster.allies = (muster.allies || []).filter(function (a) {
      if (a.villageId === villageId) {
        seized.push(a);
        return false;
      }
      return true;
    });
    var gearN = seized.reduce(function (s, a) { return s + (a.outfitted || []).length; }, 0);
    muster.turned = muster.turned || {};
    muster.turned[villageId] = true;
    // trust craters; the alliance remembers
    var link = titanAlliedLinks().filter(function (l) { return titanLinkOther(l) === villageId; })[0];
    if (link) {
      link.trust = 0;
      try { if (Game._linkNote) Game._linkNote(link, 'betrayal', 'Turned on the coalition muster — seized outfitted gear.'); } catch (e) {}
    }
    Game.say('🔪 THE TURN — ' + nm + ' takes the gear and walks. ' + seized.map(function (a) { return a.name; }).join(' and ') + ' were faces at your fire. Now they are gone, and ' + gearN + ' pieces of your gear with them. No refunds. No take-backs except by force. The gossip warned you. The council showed you. You read it — or you didn\'t.');
    try { if (Game.recordMoment) Game.recordMoment(nm + ' turned on the coalition — seized the outfitting.'); } catch (e) {}
    try { if (Game.ledgerAdd) Game.ledgerAdd('titan', 'turned:' + villageId); } catch (e) {}
  }

  // ---------- muster: food is the player's contribution ----------

  function titanMusterUpkeep(day) {
    var st = titanState();
    Object.keys(st.musters).forEach(function (titanId) {
      var muster = st.musters[titanId];
      if (!muster || st.slain[titanId]) return;
      titanNormalizeMuster(muster);
      if (!muster.allies.length && !titanHavenBlades(muster).length) return;
      if (muster.lastUpkeep === day) return;
      muster.lastUpkeep = day;
      // An army marches on its stomach: 1000 kcal/day per blade — allies AND
      // Haven's committed (2026-10-13). Your own people eat from your stores too.
      var need = ((muster.allies || []).length + titanHavenBlades(muster).length) * 1000;
      var got = 0;
      try { got = Game.playerPackSpend ? Game.playerPackSpend(need) : 0; } catch (e) {}
      if (got < need) {
        var hasAllies = (muster.allies || []).some(function(a) { return a.villageId !== 'haven'; });
        Game.say('🍽️ The muster is hungry — ' + got.toLocaleString() + ' of ' + need.toLocaleString() + ' kcal fed. Bellies remember who feeds them.' + (hasAllies ? ' (loyalty strains when the food runs thin.)' : ''));
        // hunger strains loyalty: small trust erosion across mustered links
        var seen = {};
        muster.allies.forEach(function (a) {
          if (seen[a.villageId]) return;
          seen[a.villageId] = 1;
          var link = titanAlliedLinks().filter(function (l) { return titanLinkOther(l) === a.villageId; })[0];
          if (link) link.trust = Math.max(0, (link.trust || 0) - 2);
        });
      }
    });
  }

  function titanMusterReady(titanId) {
    var st = titanState();
    var muster = st.musters[titanId];
    var def = titanDefs()[titanId];
    if (!muster || !def) return false;
    var turned = muster.turned ? Object.keys(muster.turned).length : 0;
    // HAVEN COUNTS (2026-10-13): committed Haven blades are allied blades —
    // the player's own commitment moves the hard gate. The coalition is
    // still mostly the many (cap 3 ours), never a solo with extra steps.
    var alive = titanUniqueAllies(muster).length + new Set(titanHavenBlades(muster).map(function (h) { return h.vid; })).size;
    return alive >= def.minAllies;
  }

  // ---------- combat integration ----------

  function titanWrapCombat() {
    if (!Game.startCombat || Game.startCombat.__titanWrapped) return;
    var orig = Game.startCombat;
    var wrapped = function (mid) {
      // TABLE-TRIAL BYPASS (2026-10-12): when the galactic table summons the
      // champion (table-feared's trial-by-combat), the open-world finale
      // campaign gates — three-node march order, muster of 20 allied blades
      // — do NOT apply. The table issues the challenge; the System brings the
      // champion to the ring directly, as a single blow-by-blow fight. The
      // flag is consumed here (never leaks into open-world combat): the
      // campaign march, muster marking, and ally injection are all skipped.
      if (mid === 'finale' && (Game._tableTrialDirect || (arguments[1] && arguments[1].tableTrial))) {
        Game._tableTrialDirect = false;
        return orig.call(this, mid, Object.assign({}, arguments[1], { tableTrial: true }));
      }
      var mdef = null;
      try { mdef = (Game.data.monsters || []).find(function (m) { return m.id === mid; }); } catch (e) {}
      var titanId = mid && titanDefs()[mid] ? mid : null;
      if (titanId) {
        // ENTRY GATE OVERRIDE (finale-campaign 2026-10-12): the finale's
        // three-node march has its own gate (campaign progression + surviving
        // muster). When the override answers, it replaces the flat minAllies
        // gate below — never both.
        var gateAns = null;
        try { gateAns = (typeof Game.titanEntryGate === 'function') ? Game.titanEntryGate(titanId) : null; } catch (e) {}
        if (gateAns && !gateAns.ok) {
          Game.say(gateAns.reason);
          titanRecordOutcome(titanId, 'refused', { gate: 'campaign', reason: gateAns.reason });
          return null;
        }
        // HARD GATE: no solo titans. Not a likely death — a refusal.
        if (!gateAns && !titanMusterReady(titanId)) {
          var def = titanDefs()[titanId];
          var have = 0;
          try { have = (titanState().musters[titanId] || { allies: [] }).allies.length; } catch (e) {}
          Game.say('⛔ ' + def.title + ' does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster ' + def.minAllies + ' allied blades (you have ' + have + '). This is not courage. This is arithmetic.');
          titanRecordOutcome(titanId, 'refused', { gate: 'muster', have: have, need: def.minAllies });
          return null;
        }
        // mark the fight so tbEnd can resolve it
        try { Game.state.titans._fight = { titan: titanId, day: (Game.state.scholar || {}).day || 0 }; } catch (e) {}
      }
      var r = orig.apply(this, arguments);
      // inject allied fighters after the fight is built
      if (titanId && r !== null) {
        try { titanInjectAllies(titanId); } catch (e) {}
        // the engagement began: one 'fought' record per fight, resolved in
        // place to 'slain'/'fled' at tbEnd (titanResolveFight)
        var blades = 0;
        try { blades = titanUniqueAllies(titanState().musters[titanId] || { allies: [] }).length; } catch (e) {}
        titanRecordOutcome(titanId, 'fought', { blades: blades });
      }
      return r;
    };
    wrapped.__titanWrapped = true;
    Game.startCombat = wrapped;

    // monsterWavePool: titans never wander. They arrive by omen only.
    if (Game.monsterWavePool && !Game.monsterWavePool.__titanWrapped) {
      var origPool = Game.monsterWavePool;
      var poolWrapped = function () {
        var pool = origPool.apply(this, arguments);
        var defs = titanDefs();
        return pool.filter(function (m) { return !defs[m.id]; });
      };
      poolWrapped.__titanWrapped = true;
      Game.monsterWavePool = poolWrapped;
    }

    // tbEnd: resolve titan victory/defeat + allied deaths
    if (Game.tbEnd && !Game.tbEnd.__titanWrapped) {
      var origEnd = Game.tbEnd;
      var endWrapped = function (result) {
        var snap = null;
        try {
          var tf = Game.state.titans._fight;
          if (tf && this.tbfight && this.tbfight.fighters && !(this.tableTrialFight && this.tableTrialFight())) {
            snap = {
              titan: tf.titan,
              result: result,
              allies: this.tbfight.fighters.filter(function (f) { return f.kind === 'ally'; })
                // injected ally fighters carry their id as villagerId (titanInjectAllies), not vid
                .map(function (f) { return { key: f.key, name: f.name, villageId: f.villageId, vid: f.vid || f.villagerId, alive: !!f.alive }; })
            };
          }
        } catch (e) {}
        var r = origEnd.apply(this, arguments);
        try {
          if (snap) {
            Game.state.titans._fight = null;
            titanResolveFight(snap);
          }
        } catch (e) {}
        return r;
      };
      endWrapped.__titanWrapped = true;
      Game.tbEnd = endWrapped;
    }
  }

  function titanPrepareArena(muster) {
    var f = Game.tbfight;
    if (!f || (Game.tableTrialFight && Game.tableTrialFight())) return;
    if (f.coalitionArena) { f.gridSize = f.coalitionArena.gridSize; return; }
    if (muster.allies.length + titanHavenBlades(muster).length < 10) return;
    var cfg = (Game.data.titans || {})._coalition || {};
    var grid = cfg.arenaGrid || 24, size = cfg.titanFootprint || 10;
    var s = Game.state.scholar;
    f.gridSize = grid;
    f.coalitionArena = {gridSize:grid,origin:{mx:s.mx,my:s.my,bearer:Game.villagerId,tx:Game.map.px,ty:Game.map.py},corpseIds:(Game.state.corpses || []).map(function(c){return c.id;})};
    var lead = f.fighters.find(function(m){return m.kind === 'monster';});
    f.fighters.forEach(function(m){
      // Campaign venues and Network nodes are also the army's main opponent;
      // their ordinary escorts keep their own smaller bodies.
      if (m.kind !== 'monster') return;
      if (m === lead || Game.isTitan(m.monsterId || (m.mdef && m.mdef.id))) m.battleSize = size;
      var max = grid - Game.fighterSize(m), x = Math.min(max,m.mx), y = Math.min(max,m.my), spot = null;
      for (var r = 0; !spot && r < grid; r++) for (var dy = -r; dy <= r && !spot; dy++) for (var dx = -r; dx <= r; dx++) {
        var nx=x+dx,ny=y+dy;
        if(nx>=0&&ny>=0&&nx<=max&&ny<=max&&Game.tbCanOccupy(m,nx,ny)){spot={x:nx,y:ny};break;}
      }
      if(!spot){delete m.battleSize;console.warn('No legal titan footprint in coalition arena');return;}
      m.mx=spot.x;m.my=spot.y;
    });
  }

  function titanLeaveArena() {
    var f=Game.tbfight,a=f&&f.coalitionArena;
    if(!a||a.returned)return;
    var o=a.origin;
    var detail=Game.genDetail(o.tx,o.ty);
    function worldPoint(x,y){
      var cx=Math.max(0,Math.min(8,Math.round(x*8/(a.gridSize-1)))),cy=Math.max(0,Math.min(8,Math.round(y*8/(a.gridSize-1))));
      for(var r=0;r<9;r++)for(var dy=-r;dy<=r;dy++)for(var dx=-r;dx<=r;dx++){
        var nx=cx+dx,ny=cy+dy;
        if(nx>=0&&ny>=0&&nx<=8&&ny<=8&&detail[ny][nx]!=='door'&&!Game.cellProps(detail[ny][nx]).blocks)return{mx:nx,my:ny};
      }
      return{mx:o.mx,my:o.my};
    }
    f.fighters.forEach(function(p){var q=worldPoint(p.mx,p.my);p.mx=q.mx;p.my=q.my;});
    (Game.state.corpses||[]).forEach(function(c){
      if(a.corpseIds.indexOf(c.id)>=0||!c.node||c.node.x!==o.tx||c.node.y!==o.ty)return;
      var q=worldPoint(c.mx,c.my);c.mx=q.mx;c.my=q.my;
    });
    if(Game.villagerId===o.bearer&&Game.map.px===o.tx&&Game.map.py===o.ty){Game.state.scholar.mx=o.mx;Game.state.scholar.my=o.my;}
    a.returned=true;
  }

  function titanInjectAllies(titanId) {
    var st = titanState();
    var muster = st.musters[titanId];
    if (!muster || !Game.tbfight || !Game.tbfight.fighters) return;
    titanNormalizeMuster(muster);
    titanPrepareArena(muster);
    var fighters = Game.tbfight.fighters;
    // The shared placement validates terrain, doors and full enemy bodies.
    var p = null;
    try { p = Game.tbFighter('p'); } catch (e) {}
    var px = p ? p.mx : 4, py = p ? p.my : 4;
    // GRID SIZE (Steve 2026-10-11): titan fights use 12x12 — spread allies across the full grid.
    var _gmax = (Game.tbGridMax ? Game.tbGridMax() : 8);
    var spot = 0;
    function placeBlade(o) {
      if (!o || !(o.hp > 0)) return;
      // A Haven member can already be present as a nearby villager or party
      // member. They are one person, never an additional coalition body.
      if (fighters.some(function (f) { return f.villagerId === o.villagerId && (f.villageId || 'haven') === (o.villageId || 'haven'); })) return;
      o.mx = Math.max(0, Math.min(_gmax, Game.tbfight.coalitionArena ? px - 4 + (spot % 6) * 2 : px - 3 + (spot % 4)));
      o.my = Math.max(0, Math.min(_gmax, Game.tbfight.coalitionArena ? py + 2 + Math.floor(spot / 6) * 2 : py + 1 + Math.floor(spot / 4)));
      fighters.push(o);
      Game.tbPlaceHumans(fighters, _gmax);
      if (fighters.indexOf(o) < 0) return;
      if (Array.isArray(Game.tbfight.order) && Game.tbfight.order.indexOf(o.key) < 0) {
        Game.tbfight.order.push(o.key); Game.tbfight.orderDirty = true;
      }
      spot++;
    }
    muster.allies.forEach(function (a) {
      placeBlade({
        key: 'a_' + a.vid, kind: 'ally', villagerId: a.vid, villageId: a.villageId,
        name: a.name, emoji: '🛡️',
        hp: a.hp === undefined ? 100 : a.hp, maxHp: Math.max(100, a.hp || 0), speed: (Game.villagerSpeed ? Game.villagerSpeed(a.vid) : 3), mx: 4, my: 4,
        alive: true, fled: false, ai: 'brave',
        wbonus: a.wbonus || 0, varmor: a.varmor || 0,
      });
    });
    // HAVEN'S OWN (2026-10-13): committed blades fight too — this was the
    // vestige (muster.haven tracked, never injected). Villagers, not heroes:
    // brave AI, modest swing. Their deaths go through tbVillagerFalls.
    titanHavenBlades(muster).forEach(function (h) {
      placeBlade(Game.tbHumanFighter(h.vid, 'ally', {mx:4,my:4}, {
        key: 'a_h_' + h.vid, villageId: 'haven', emoji: '🛡️', ai: 'brave',
      }));
    });
    var count = fighters.filter(function (f) { return f.kind === 'ally' && f.alive && !f.fled; }).length;
    Game.say('🛡️ ' + count + ' allies join you on the field.');
  }

  function titanSyncAllyHealth(f) {
    if (!f || f.kind !== 'ally' || !f.villageId || f.villageId === 'haven' || !Number.isFinite(f.hp)) return;
    var hp = Math.max(0, f.hp), st = titanState();
    Object.keys(st.musters || {}).forEach(function (tid) {
      var m = st.musters[tid];
      for (var a of (m && m.allies) || []) if (a.vid === f.villagerId && a.villageId === f.villageId) a.hp = hp;
    });
    var home = Game._otherVillage(f.villageId);
    for (var person of (home && home.roster) || []) if (person.id === f.villagerId) person.health = hp;
  }

  function titanResolveFight(snap) {
    var st = titanState();
    var def = titanDefs()[snap.titan];
    if (!def) return;
    // allied deaths: mark home rosters, cost trust, grief aloud
    var dead = snap.allies.filter(function (a) { return !a.alive; });
    var seenVillages = {};
    dead.forEach(function (a) {
      try {
        var ov = Game._otherVillage(a.villageId);
        var roster = (ov && ov.roster) || [];
        for (var i = 0; i < roster.length; i++) {
          if (roster[i] && roster[i].id === a.vid) { roster[i].alive = false; break; }
        }
        // speaker succession: reuse the mirror beat if the speaker fell
        var link = titanAlliedLinks().filter(function (l) { return titanLinkOther(l) === a.villageId; })[0];
        if (link) {
          link.trust = Math.max(0, (link.trust || 0) - 10);
          if (link.theirSpeaker && link.theirSpeaker.id === a.vid) {
            try { if (Game._designateSpeaker) Game._designateSpeaker(link); } catch (e) {}
            Game.say('🕯️ ' + a.name + ' — their speaker — fell. ' + ((ov && ov.name) || 'Their fire') + ' names another. The link holds, thinner. (trust −10 — they count their dead.)');
          }
        }
        if (!seenVillages[a.villageId]) {
          seenVillages[a.villageId] = 1;
          var homeName = (ov && ov.name) || (a.villageId === 'haven' ? 'Haven' : 'an allied fire');
          Game.say('🕯️ ' + a.name + ' of ' + homeName + ' did not get up. They were a face at your fire. The alliance remembers.');
        }
      } catch (e) {}
    });
    // HAVEN'S OWN dead (2026-10-13): tbVillagerFalls already took them off
    // Haven's roster mid-fight. The fire feels it: cheer drops, said aloud.
    var havenDead = dead.filter(function (a) { return a.villageId === 'haven'; }).length;
    if (havenDead > 0) {
      try {
        var vv = Game.state.village || {};
        vv.cheer = Math.max(0, (vv.cheer || 0) - 2 * havenDead);
        Game.say('🕯️ The fire is quieter tonight — Haven sent its own, and ' + (havenDead === 1 ? 'one is' : havenDead + ' are') + ' not coming home.');
      } catch (e) {}
    }
    titanReleaseCommitted(snap.titan);
    if (snap.result === 'won') {
      titanVictory(snap.titan, def);
      titanResolveOutcome(snap.titan, 'slain', snap.result);
    } else {
      // defeat: the titan remains, the muster breaks
      Game.say('💀 ' + def.title + ' remains. The coalition breaks and runs. The muster is spent — sound the call again, if anyone still answers.');
      st.musters[snap.titan] = null;
      try { if (Game.recordMoment) Game.recordMoment(def.title + ' broke the coalition.'); } catch (e) {}
      titanResolveOutcome(snap.titan, 'fled', snap.result);
    }
  }

  function titanVictory(titanId, def) {
    var st = titanState();
    st.slain[titanId] = true;
    st.musters[titanId] = null;
    // remove the world monster
    try {
      var wm = Game.worldMonsters().find(function (m) { return m.id === def.monster; });
      if (wm) Game.removeWorldMonster(wm);
    } catch (e) {}
    Game.say('🌅 ' + def.title + ' FALLS. The realm exhales. ' + (def.role === 'herald' ? 'That was the herald. The sky is still getting bigger.' : 'The sky stops getting bigger.'));
    // strategic drop: realm secured, table path opened, world state changed
    try { if (Game.ledgerAdd) Game.ledgerAdd('titan', 'slew:' + titanId); } catch (e) {}
    try { if (Game.recordMoment) Game.recordMoment(def.title + ' slain by the coalition.'); } catch (e) {}
    try {
      if (Game.state) {
        Game.state.viewership = (Game.state.viewership || 0) + 10;
      }
    } catch (e) {}
    Game.sysSay('"UNBELIEVABLE! ' + def.title + ' — SLAIN! The ratings are HISTORIC! The sponsors are weeping! WE are weeping! (We do not weep. Moving on!)"');
    // relic drop: apex-tier, LOW rate, on its own terms. Never a fountain.
    if (def.relic && R() < 0.25) {
      titanGrantRelic(def.relic);
    } else {
      Game.say('The titan leaves nothing but quiet. (The relics are rare — the realm secured is the real prize.)');
    }
    // survivors return, said aloud
    Game.say('The coalition walks home. Fewer than marched out. The fires will tell this one for years.');
  }

  function titanGrantRelic(relic) {
    try {
      var s = Game.state.scholar;
      s.inventory = s.inventory || [];
      s.inventory.push({ id: relic.id, itemId: relic.id, name: relic.name, units: 1, titanRelic: true, relicEffect: relic.effect, desc: relic.desc });
      Game.say('✨ RELIC — ' + relic.name + '. ' + relic.desc);
      try { if (Game.recordMoment) Game.recordMoment('Titan relic claimed: ' + relic.name + '.'); } catch (e) {}
    } catch (e) {}
  }

  // ---------- attach ----------

  var methods = {
    isTitan: function (mid) { return !!(titanDefs()[mid]); },
    titanDef: function (mid) { return titanDefs()[mid] || null; },
    titanCast: titanCast,
    titanDawnTick: titanDawnTick,
    titanWarCouncil: titanWarCouncil,
    soundTitanCall: soundTitanCall,
    titanCommitOwn: titanCommitOwn,
    titanVolunteers: titanVolunteers,
    titanSelfActions: titanSelfActions,
    titanSelfDo: titanSelfDo,
    titanStandDown: titanStandDown,
    titanOutfit: titanOutfit,
    titanTemptation: titanTemptation,
    titanMusterReady: titanMusterReady,
    titanHavenBlades: titanHavenBlades,
    titanPlacementTile: titanPlacementTile,
    titanLeaveArena: titanLeaveArena,
    titanMusterState: function (titanId) { return titanState().musters[titanId] || null; },
    // exposed for the finale campaign (allied injection into campaign nodes)
    titanInjectAllies: titanInjectAllies,
    titanSyncAllyHealth: titanSyncAllyHealth,
    // exposed for THE NETWORK (network-campaign.js): the committed come home
    titanReleaseCommitted: titanReleaseCommitted,
  };

  Object.assign(Game, methods);

  // ledger.js sets the new bearer before calling mantleBecome. Keep role
  // cleanup here with the muster rather than duplicating it in the ledger.
  if (Game.mantleBecome) {
    var become = Game.mantleBecome;
    Game.mantleBecome = function () {
      var result = become.apply(this, arguments);
      titanReconcileBearer();
      return result;
    };
  }

  // test hooks (proof tests exercise internals without faking combat)
  Game._titanTest = {
    titanInjectAllies: titanInjectAllies,
    titanResolveFight: titanResolveFight,
    titanTurn: titanTurn,
    titanTurnTick: titanTurnTick,
    titanVictory: titanVictory,
    titanGearValue: titanGearValue,
    titanEscalate: titanEscalate,
    titanMusterUpkeep: titanMusterUpkeep,
    titanOmen: titanOmen,
    titanState: titanState,
    titanTemptation: titanTemptation,
    titanCommitOwn: titanCommitOwn,
    titanVolunteers: titanVolunteers,
    titanReleaseCommitted: titanReleaseCommitted,
    titanRecordOutcome: titanRecordOutcome,
    titanResolveOutcome: titanResolveOutcome,
    titanOutcomeLog: titanOutcomeLog,
  };

  // wraps must apply after game.js defines the originals
  try { titanWrapCombat(); } catch (e) {}

  // dawn hook: game.js calls this guarded (same pattern as podIntrusionTick)
  Game.titanDawnTick = titanDawnTick;
})();
