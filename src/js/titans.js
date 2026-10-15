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
//   - titanReleaseCommitted(titanId) -> Haven's committed come home (shared with network-campaign.js)
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

  // ---------- dawn tick: omens, escalation, upkeep, the turn ----------

  function titanDawnTick() {
    try {
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

  function titanPlace(titanId) {
    try {
      // FINALE CAMPAIGN (2026-10-12): the finale arrives as a three-node
      // march, not one lair. The campaign module places its own nodes.
      if (titanId === 'finale' && typeof Game.finaleCampaignPlace === 'function') {
        return Game.finaleCampaignPlace(titanId);
      }
      var def = titanDefs()[titanId];
      var px = Game.map ? Game.map.px : 4, py = Game.map ? Game.map.py : 4;
      // lair: 3 tiles out, clamped to the region map (tiles are region coords)
      var tx = Math.max(0, px + 3), ty = Math.max(0, py);
      var mon = Game.spawnWorldMonster(def.monster, tx, ty, { titan: true });
      Game.say('🗺️ Scouts found its lair — ' + tx + ' east of here. ' + def.title + ' — ' + (def.epithet || '') + '. It is WAITING. You cannot face it alone. Sound the call.');
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

  // Named faces from an allied roster: speaker first, then other living members.
  function titanAlliedFaces(villageId, n) {
    var faces = [];
    try {
      var ov = Game._otherVillage(villageId);
      var roster = (ov && ov.roster) || [];
      var link = titanAlliedLinks().filter(function (l) { return titanLinkOther(l) === villageId; })[0];
      var speakerId = link && link.theirSpeaker ? link.theirSpeaker.id : null;
      var ordered = roster.filter(function (r) { return r && r.alive; });
      ordered.sort(function (a, b) { return (a.id === speakerId ? -1 : 0) - (b.id === speakerId ? -1 : 0); });
      for (var i = 0; i < Math.min(n, ordered.length); i++) {
        faces.push({ id: ordered[i].id, name: ordered[i].name || 'a fighter', villageId: villageId });
      }
    } catch (e) {}
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
      var faces = titanAlliedFaces(vid, 2);
      if (!faces.length) {
        Game.say('— ' + nm + ' has no fighters to send. Their fire is thin.');
        return;
      }
      faces.forEach(function (f) {
        muster.allies.push({ villageId: vid, vid: f.id, name: f.name, hp: 100, outfitted: [], gearValue: 0 });
      });
      answered++;
      Game.say('— ' + nm + ' answers! ' + faces.map(function (f) { return f.name; }).join(' and ') + ' will march. (trust holds — they are counting on you.)');
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
    return (muster && muster.haven) || [];
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
        var havenN = muster ? titanHavenBlades(muster).length : 0;
        var alliedN = muster ? (muster.allies || []).length : 0;
        if (havenN < 3) {
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
        if (!alliedN) {
          acts.push({
            id: 'titan:call:' + tid,
            label: '\uD83D\uDCEF Sound the call',
            hint: 'The call to arms \u2014 allied fires answer aloud, or refuse aloud. Refusals are remembered.'
          });
        }
      });
    } catch (e) {}
    return acts;
  }

  function titanSelfDo(id) {
    var m = /^titan:(council|call|commit):(.+)$/.exec(id || '');
    if (!m) return null;
    if (m[1] === 'council') return Game.titanWarCouncil(m[2]);
    if (m[1] === 'call') return Game.soundTitanCall(m[2]);
    if (m[1] === 'commit') return titanCommitOwn(m[2]);
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
      if (!muster || st.slain[titanId] || !muster.allies.length) return;
      if (muster.lastUpkeep === day) return;
      muster.lastUpkeep = day;
      // An army marches on its stomach: 1000 kcal/day per blade — allies AND
      // Haven's committed (2026-10-13). Your own people eat from your stores too.
      var need = ((muster.allies || []).length + titanHavenBlades(muster).length) * 1000;
      var got = 0;
      try { got = Game.playerPackSpend ? Game.playerPackSpend(need) : 0; } catch (e) {}
      if (got < need) {
        Game.say('🍽️ The muster is hungry — ' + got.toLocaleString() + ' of ' + need.toLocaleString() + ' kcal fed. Bellies remember who feeds them. (loyalty strains when the food runs thin.)');
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
    var alive = (muster.allies || []).length + titanHavenBlades(muster).length;
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
      if (mid === 'finale' && Game._tableTrialDirect) {
        Game._tableTrialDirect = false;
        return orig.apply(this, arguments);
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
          return null;
        }
        // HARD GATE: no solo titans. Not a likely death — a refusal.
        if (!gateAns && !titanMusterReady(titanId)) {
          var def = titanDefs()[titanId];
          var have = 0;
          try { have = (titanState().musters[titanId] || { allies: [] }).allies.length; } catch (e) {}
          Game.say('⛔ ' + def.title + ' does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster ' + def.minAllies + ' allied blades (you have ' + have + '). This is not courage. This is arithmetic.');
          return null;
        }
        // mark the fight so tbEnd can resolve it
        try { Game.state.titans._fight = { titan: titanId, day: (Game.state.scholar || {}).day || 0 }; } catch (e) {}
      }
      var r = orig.apply(this, arguments);
      // inject allied fighters after the fight is built
      if (titanId && r !== null) {
        try { titanInjectAllies(titanId); } catch (e) {}
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
          if (tf && this.tbfight && this.tbfight.fighters) {
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

  function titanInjectAllies(titanId) {
    var st = titanState();
    var muster = st.musters[titanId];
    if (!muster || !Game.tbfight || !Game.tbfight.fighters) return;
    var fighters = Game.tbfight.fighters;
    // free spots near the player
    var taken = {};
    fighters.forEach(function (f) { taken[f.mx + ',' + f.my] = 1; });
    var p = null;
    try { p = Game.tbFighter('p'); } catch (e) {}
    var px = p ? p.mx : 4, py = p ? p.my : 4;
    // GRID SIZE (Steve 2026-10-11): titan fights use 12x12 — spread allies across the full grid.
    var _gmax = (Game.tbGridMax ? Game.tbGridMax() : 8);
    var _gsize = _gmax + 1;
    var spot = 0;
    function placeBlade(o) {
      var nx = Math.max(0, Math.min(_gmax, px - 3 + (spot % 4))), ny = Math.max(0, Math.min(_gmax, py + 1 + Math.floor(spot / 4)));
      var k = 0;
      while (taken[nx + ',' + ny] && k < 40) { nx = (nx + 1) % _gsize; if (nx === 0) ny = (ny + 1) % _gsize; k++; }
      taken[nx + ',' + ny] = 1;
      o.mx = nx; o.my = ny;
      fighters.push(o);
      // TURN ORDER (diagnosis-endgame 2026-10-15): startCombat built
      // tbfight.order before the coalition arrived, and the turn loop walks
      // f.order — blades pushed only into fighters never took a turn (every
      // titan, Finale and Network blade stood still). Join the order now
      // (as finale-campaign injectMonster does); re-sort by speed next round.
      if (Array.isArray(Game.tbfight.order) && Game.tbfight.order.indexOf(o.key) < 0) {
        Game.tbfight.order.push(o.key);
        Game.tbfight.orderDirty = true;
      }
      spot++;
    }
    muster.allies.forEach(function (a) {
      placeBlade({
        key: 'a_' + a.vid, kind: 'ally', villagerId: a.vid, villageId: a.villageId,
        name: a.name, emoji: '🛡️',
        hp: a.hp || 100, maxHp: 100, speed: (Game.villagerSpeed ? Game.villagerSpeed(a.vid) : 3), mx: 4, my: 4,
        alive: true, fled: false, ai: 'brave',
        wbonus: a.wbonus || 0, varmor: a.varmor || 0,
      });
    });
    // HAVEN'S OWN (2026-10-13): committed blades fight too — this was the
    // vestige (muster.haven tracked, never injected). Villagers, not heroes:
    // brave AI, modest swing. Their deaths go through tbVillagerFalls.
    // SPEED NOTE: flat speed 3 (the villager tactical speed); real per-
    // villager combat speed (blitz-combatstats) had not landed in this tree.
    var havenNames = [];
    titanHavenBlades(muster).forEach(function (h) {
      var nm = titanBladeName(h.vid);
      havenNames.push(nm);
      placeBlade({
        key: 'a_h_' + h.vid, kind: 'ally', villagerId: h.vid, villageId: 'haven',
        name: nm, emoji: '🛡️',
        hp: 100, maxHp: 100, speed: 3, mx: 4, my: 4,
        alive: true, fled: false, ai: 'brave',
        wbonus: 3, varmor: 0,
      });
    });
    var names = muster.allies.map(function (a) { return a.name; }).join(', ');
    Game.say('🛡️ The coalition stands with you: ' + names + (havenNames.length ? ' — and Haven\u2019s own: ' + havenNames.join(', ') : '') + '. Faces, not units. Blow by blow.');
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
    } else {
      // defeat: the titan remains, the muster breaks
      Game.say('💀 ' + def.title + ' remains. The coalition breaks and runs. The muster is spent — sound the call again, if anyone still answers.');
      st.musters[snap.titan] = null;
      try { if (Game.recordMoment) Game.recordMoment(def.title + ' broke the coalition.'); } catch (e) {}
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
    titanOutfit: titanOutfit,
    titanTemptation: titanTemptation,
    titanMusterReady: titanMusterReady,
    titanMusterState: function (titanId) { return titanState().musters[titanId] || null; },
    // exposed for the finale campaign (allied injection into campaign nodes)
    titanInjectAllies: titanInjectAllies,
    // exposed for THE NETWORK (network-campaign.js): the committed come home
    titanReleaseCommitted: titanReleaseCommitted,
  };

  Object.assign(Game, methods);

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
  };

  // wraps must apply after game.js defines the originals
  try { titanWrapCombat(); } catch (e) {}

  // dawn hook: game.js calls this guarded (same pattern as podIntrusionTick)
  Game.titanDawnTick = titanDawnTick;
})();
