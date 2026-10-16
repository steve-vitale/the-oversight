// @ontology
// system: godverbs
// description: THE GOD VERBS IN PLAY (2026-10-15). Steve: "Paint a path towards functional godhood. If they learn and experiment enough, people can get there and it's scary good." Until today ascension changed narration, sprite and the ending key only: 9 of the 10 god verbs had no caller. This module puts each god's ONE verb (src/data/godpaths.json god.verb + god.play) into real play for whoever ascended, the player and villagers through the same functions ("when in doubt we treat them the same way"): combat actions in the fight grid (the pseudo-ability 'god' through useAbility), reactive passives in tbDamage, daily actions out of a fight, and the villager's own cast in tactical and off-screen fights. Every verb burns food (kcal; a villager's belly at kcal/25 hunger) and keeps its weakness. The numbers live in god.play.
// provides:
//   - holderGod(who) -> god id for 'player' or a villager id (the first ascension), or null
//   - fighterGod(fighter) -> god id of a fight participant on our side, or null
//   - godPlay(godId) -> the god's play data (godpaths.json god.play)
//   - godActionDef(actionId) / godActionReady(actionId) / godActivatables() -> the 'god' pseudo-ability for useAbility and the action bar
//   - godVillagerCast(game, v) -> a villager god's verb on their turn (wraps tbVillagerAbility, before the subclass verbs)
//   - godDaily(game) -> dawn: day verbs refresh, Gilded Guard regen, the Audit, No Lies' knowing and its trust price, villager gardens
// consumes:
//   - Game.data.godpaths (god.play), state.scholar.godhood, state.village.npcGodhood
//   - useAbility (abilityActions.js), tbDamage, tbRoundWrap, tbMonsterTurn, startCombat, tbEnd, endDay, maybeCheatDeath, addHealth, removeVillager, springAmbush, lieLive, getActiveLie
//   - Scattering.Godpath hooks (allyWouldFall, onAllyFell, damageMult, dodgeBonus, villagerStrikeMult, absorbVillagerHit, fieldBegin/Act/Incoming/AllyShare/CheatDeath)
//   - Scattering.Godhood market verbs (namePrice, buyPassage, guardAbsorb, guardRegen, auditCollect, resetFightVerbs, resetDayVerbs)
//   - Scattering.combat.nearestEnemy (monster aim)
// rules:
//   - ambush_ally_parity: a living player receives an NPC hunter's allied opening strike through scholar state; existing armed strikes are preserved, and no player input is automated (code: terms)
//   - same_function: every verb runs for the player or a villager fighter through one implementation (code: actor, VERB_IMPL)
//   - food_powered: every verb pays kcal (player) or belly (villager, kcal/25 hunger, refused at hunger >= 80); the player's hunger gate (500 kcal) applies to passives too (code: canPay, pay)
//   - weakness_enforced: brawler beams feed no pain; ward is the priority target and self-heals at half; hunter terms end on contact; between phases are retreats; all-seeing's foresight never covers the holder; voice's fall stuns the field; phoenix needs fuel; market coins never stop beams and titans never haggle; garden hits soft and draws aim (code: preHit, damageMult wrap, termsContact, addHealth wrap)
//   - never_skips_dinner: no verb feeds its own holder (Feed the Multitude feeds other bellies; the phoenix cannot rise through starvation) (code: feedMultitude, phoenixPlayer)
//   - table_never_reads_godhood: nothing here is read by table*.js (code: scripts/godpath/ladder.js)
//   - never_silent: every verb narrates; errors are reported via warn (code: warn)
(function () {
  'use strict';
  const S = globalThis.Scattering = globalThis.Scattering || {};
  const Game = S.Game;
  if (!Game) return;

  const _warned = {};
  function warn(msg, e) {
    const k = String(msg);
    if (_warned[k]) return;
    _warned[k] = true;
    console.warn('[godverbs] ' + msg + (e ? ': ' + ((e && e.message) || e) : ''));
  }
  const cheb = (a, b) => Math.max(Math.abs((a.mx || 0) - (b.mx || 0)), Math.abs((a.my || 0) - (b.my || 0)));
  const HUNGER_GATE_KCAL = 500;
  const V_HUNGER_GATE = 80;

  // ---------------- data ----------------
  let _idx = null, _idxKey = null;
  function gpData() { return (Game.data && Game.data.godpaths) || S.GODPATHS || null; }
  function index() {
    const D = gpData();
    if (_idx && _idxKey === D) return _idx;
    const gods = {}, actions = {};
    for (const pid of Object.keys((D && D.paths) || {})) {
      const g = D.paths[pid].god || {};
      if (!g.id) continue;
      const play = g.play || {};
      gods[g.id] = { id: g.id, path: pid, name: g.name, verb: g.verb, play };
      for (const a of (play.actions || [])) actions[a.id] = { godId: g.id, act: a };
    }
    _idx = { gods, actions }; _idxKey = D;
    return _idx;
  }
  function godPlay(godId) { const g = index().gods[godId]; return (g && g.play) || {}; }
  function godName(godId) { const g = index().gods[godId]; return (g && g.name) || godId; }

  // ---------------- who holds a god ----------------
  function holderGod(who) {
    try {
      if (who === 'player' || who == null) {
        const g = (Game.state.scholar || {}).godhood;
        return (g && g.active && g.active.length && index().gods[g.active[0]]) ? g.active[0] : null;
      }
      const rec = (((Game.state.village || {}).npcGodhood) || {})[who];
      return (rec && rec.active && rec.active.length && index().gods[rec.active[0]]) ? rec.active[0] : null;
    } catch (e) { warn('holderGod', e); return null; }
  }
  function isOurs(fi) { return !!fi && (fi.kind === 'player' || fi.kind === 'villager' || fi.kind === 'ally'); }
  function isFoeF(fi) { return !!fi && (fi.kind === 'monster' || fi.kind === 'hostile'); }
  function fighterGod(fi) {
    if (!isOurs(fi)) return null;
    if (fi.kind === 'player' || fi.key === 'p') return holderGod('player');
    return fi.villagerId ? holderGod(fi.villagerId) : null;
  }
  function liveMons(f) { return ((f && f.fighters) || []).filter(m => isFoeF(m) && m.alive && !m.fled); }
  function liveOurs(f) { return ((f && f.fighters) || []).filter(x => isOurs(x) && x.alive && !x.fled); }
  function holdersIn(f, godId) { return liveOurs(f).filter(x => fighterGod(x) === godId); }
  function nm(m) { try { return Game.encSubject ? Game.encSubject(m) : (m.name || 'it'); } catch (e) { return (m && m.name) || 'it'; } }
  function isTitanish(m) {
    try {
      const md = (m && m.mdef) || {};
      if (md.titan || md.isTitan || m.titan) return true;
      if (Game.isTitan && md.id && Game.isTitan(md.id)) return true;
      return !!(Game.fighterSize && Game.fighterSize(m) >= 3);
    } catch (e) { warn('isTitanish', e); return false; }
  }
  function titanFight(f) { return !!(f && (f.titan || liveMons(f).some(isTitanish))); }
  function GV(f) {
    if (!f) return null;
    f._gv = f._gv || { uses: {}, beam: {}, titanPain: {}, rallied: {}, phased: {}, strains: {}, collapsed: {}, echoes: 0, terms: null, truth: null, firstBlow: false, saidHeal: false };
    return f._gv;
  }
  function actor(fi) {
    const isP = !fi || fi.key === 'p' || fi.kind === 'player';
    const p = isP ? (Game.tbFighter && Game.tbFighter('p')) : fi;
    return { p, isP, vid: isP ? null : (fi.villagerId || null), name: isP ? 'You' : ((fi && fi.name) || 'Someone') };
  }
  function line(C, pl, vl) { try { Game.say(C.isP ? pl : vl); } catch (e) { warn('say', e); } }
  function tele(ev, data) { try { Game.tele && Game.tele(ev, data); } catch (e) { warn('tele ' + ev, e); } }

  // ---------------- food ----------------
  function canPay(C, kcal) {
    try {
      if (C.isP) { const s = Game.state.scholar; return (s.kcal || 0) >= Math.max(HUNGER_GATE_KCAL, kcal); }
      if (!C.vid) return true; // a foreign blade: their camp feeds them (march upkeep)
      const tier = Game.villageFoodTier ? Game.villageFoodTier() : 'secure';
      if (tier === 'starving') return false;
      const n = Game.npcNeeds && Game.npcNeeds(C.vid);
      return !n || ((n.hunger || 0) + kcal / 25) < V_HUNGER_GATE;
    } catch (e) { warn('canPay', e); return false; }
  }
  function pay(C, kcal) {
    try {
      if (C.isP) { const s = Game.state.scholar; s.kcal = Math.max(0, (s.kcal || 0) - kcal); return; }
      if (!C.vid) return;
      const n = Game.npcNeeds && Game.npcNeeds(C.vid);
      if (n) n.hunger = Math.min(100, (n.hunger || 0) + Math.round(kcal / 25));
    } catch (e) { warn('pay', e); }
  }

  // ---------------- per-fight bookkeeping ----------------
  function used(f, who, id) { const g = GV(f); return (g.uses[who.key + ':' + id] || 0); }
  function markUsed(f, who, id) { const g = GV(f); const k = who.key + ':' + id; g.uses[k] = (g.uses[k] || 0) + 1; }
  function painPool(f, fi) {
    const g = GV(f);
    const taken = (fi.key === 'p') ? ((Game.state.scholar || {}).fightDamageTaken || 0) : (fi._taken || 0);
    return Math.max(0, taken - (g.beam[fi.key] || 0));
  }
  function isBeam(label, src) {
    try {
      if (/beam|\bray\b|laser|glare|searchlight/i.test(String(label || ''))) return true;
      const tg = src && src.telegraph;
      if (!tg) return false;
      if (tg.angle != null) return true;
      return /beam|sweep/i.test(String((tg.pattern || {}).type || ''));
    } catch (e) { warn('isBeam', e); return false; }
  }

  // ---------------- hunter: the terms ----------------
  function termsLive(f, fi) {
    const g = f && f._gv;
    if (!g || !g.terms || g.terms.broken || !fi || g.terms.key !== fi.key) return null;
    return g.terms;
  }
  function termsContact(f) {
    try {
      const g = f && f._gv;
      if (!g || !g.terms || g.terms.broken) return;
      const h = (f.fighters || []).find(x => x.key === g.terms.key);
      if (!h || !h.alive) return;
      const adj = liveMons(f).find(m => cheb(m, h) <= 1);
      if (!adj) return;
      g.terms.broken = true;
      const C = actor(h);
      line(C, `${nm(adj)} reaches you. The terms are over: now you're just a person with a bow. (Choose the Terms: contact)`,
        `${nm(adj)} reaches ${C.name}. The terms are over. (Choose the Terms: contact)`);
    } catch (e) { warn('termsContact', e); }
  }

  // ---------------- all-seeing: the reading ----------------
  function readAloud(f) {
    try {
      const g = f && f._gv;
      if (!g || !g.truth) return;
      const h = (f.fighters || []).find(x => x.key === g.truth.key);
      if (!h || !h.alive || h.fled) { g.truth = null; return; }
      for (const m of liveMons(f)) {
        let hint = '';
        try { hint = Game._stanceHint ? Game._stanceHint(m) : ''; } catch (e) { warn('stanceHint', e); }
        if (m.telegraph && !hint) hint = `it is winding up${m.telegraph.attackName ? ' ' + m.telegraph.attackName : ''}.`;
        if (hint) Game.say(`👁 ${nm(m)}: ${hint} (No Lies)`);
      }
    } catch (e) { warn('readAloud', e); }
  }

  // ---------------- the verbs (actor = fighter; player or villager) ----------------
  const VERB_IMPL = {
    // One-Person Army
    turn_the_pain(fi, act, target) {
      const C = actor(fi), f = Game.tbfight, p = C.p, P = godPlay('one_person_army');
      let pool = painPool(f, p);
      if (pool <= 0) { if (C.isP) Game.say('Nothing to give back yet: you have to be hurt first. (Turn the Pain)'); return false; }
      const reach = act.reach || 1;
      let m = target ? Game.tbFighter(target) : null;
      if (!m || !isFoeF(m) || !m.alive || m.fled || cheb(m, p) > reach) {
        m = liveMons(f).filter(x => cheb(x, p) <= reach).sort((a, b) => (b.hp || 0) - (a.hp || 0))[0];
      }
      if (!m) { if (C.isP) Game.say('It has to be a blow: get next to it first. (Turn the Pain)'); return false; }
      const g = GV(f);
      let titanBonus = 0;
      if (isTitanish(m)) titanBonus = g.titanPain[m.key] || 0;
      const total = Math.round(pool + titanBonus);
      const landed = Game.tbDamage(m.key, total, C.isP ? 'you' : C.name, p.key, { quiet: true, _gvPain: true });
      line(C, `Every wound you took this fight comes back at once: ${landed} into ${nm(m)}. No cap.${titanBonus ? ` (${titanBonus} of it is what it did to your people.)` : ''} (Turn the Pain)`,
        `${C.name} gives back every wound at once: ${landed} into ${nm(m)}. No cap. (Turn the Pain)`);
      tele('god_verb', { god: 'one_person_army', verb: 'turn_the_pain', who: C.isP ? 'player' : C.vid, dealt: landed, pool: total });
      try { Game.tbEndCheck && Game.tbEndCheck(); } catch (e) { warn('endcheck pain', e); }
      return true;
    },
    // Apex Predator
    terms(fi, act, target) {
      const C = actor(fi), f = Game.tbfight, p = C.p, P = godPlay('apex_predator');
      const g = GV(f);
      const kind = act.terms;
      const mons = liveMons(f);
      if (!mons.length) return false;
      g.terms = { kind, key: p.key, broken: false };
      if (kind === 'ambush') {
        const mult = P.ambushMult || 3;
        if (C.isP) {
          const s = Game.state.scholar;
          // An ally's opening and your own opening are the same ambush,
          // just as the NPC caster replaces their borrowed next strike.
          if (s._nextStrikes && s._nextStrikes._apexAlly) delete s._nextStrikes;
          s.ambushReady = { mult: Math.max(mult, (s.ambushReady && s.ambushReady.mult) || 0) };
        }
        else p._nextStrikes = { mult, n: 1, label: 'AMBUSH' };
        for (const m of mons) m.hesitate = Math.max(m.hesitate || 0, 1);
        let armed = 0;
        for (const a of liveOurs(f)) {
          const allyId = a.kind === 'player' ? Game.villagerId : a.villagerId;
          if (a === p || (allyId && allyId === (C.isP ? Game.villagerId : C.vid))) continue;
          // Player strikes consume scholar state, NPC strikes fighter state.
          // Do not displace an already armed opening or other next strikes.
          const hold = a.kind === 'player' ? Game.state.scholar : a;
          if (hold._nextStrikes || hold.ambushReady) continue;
          hold._nextStrikes = { mult: P.allyAmbushMult || 2, n: 1, label: 'AMBUSH' }; armed++;
          if (a.kind === 'player') hold._nextStrikes._apexAlly = true;
        }
        line(C, `You chose this fight before it knew it was one. Nothing sees you; every foe loses its first turn, and your next strike hits x${mult}.${armed ? ` ${armed} all${armed === 1 ? 'y strikes' : 'ies strike'} from cover too.` : ''} (Choose the Terms: Ambush)`,
          `${C.name} chose this fight before it knew it was one: every foe loses its first turn, and their next strike hits x${mult}.${armed ? ` ${armed} all${armed === 1 ? 'y strikes' : 'ies strike'} from cover too.` : ''} (Choose the Terms: Ambush)`);
      } else if (kind === 'range') {
        const want = P.rangeDist || 4;
        let moved = 0;
        for (const m of mons) {
          let steps = 0;
          for (let i = 0; i < 8 && cheb(m, p) < want; i++) {
            let dx = Math.sign(m.mx - p.mx), dy = Math.sign(m.my - p.my);
            if (!dx && !dy) dx = 1;
            const opts = [[dx, dy], [dx, 0], [0, dy]];
            let stepped = false;
            for (const [ox, oy] of opts) {
              if (!ox && !oy) continue;
              if (Game.tbCanOccupy && Game.tbCanOccupy(m, m.mx + ox, m.my + oy)) { m.mx += ox; m.my += oy; stepped = true; break; }
            }
            if (!stepped) break;
            steps++;
          }
          if (steps) moved++;
        }
        line(C, `The fight starts where you say: ${moved} foe${moved === 1 ? '' : 's'} driven back to your distance. From two tiles or more you hit x${P.rangeMult || 1.5} until something reaches you. (Choose the Terms: Range)`,
          `${C.name} sets the distance: ${moved} foe${moved === 1 ? '' : 's'} driven back. (Choose the Terms: Range)`);
      } else {
        const root = P.groundRoot || 2;
        for (const m of mons) m._frozen = Math.max(m._frozen || 0, root);
        line(C, `The ground is yours: every foe is rooted ${root} rounds${mons.some(isTitanish) ? ', even the titan' : ''}, and you dodge +${Math.round((P.groundDodge || 0.25) * 100)}% until contact. (Choose the Terms: Ground)`,
          `${C.name} picks the ground: every foe rooted ${root} rounds. (Choose the Terms: Ground)`);
      }
      tele('god_verb', { god: 'apex_predator', verb: 'terms_' + kind, who: C.isP ? 'player' : C.vid });
      try { Game.tbRefreshTelegraphUI && Game.tbRefreshTelegraphUI(); } catch (e) { warn('refresh', e); }
      return true;
    },
    // All-Seeing
    no_lies(fi) {
      const C = actor(fi), f = Game.tbfight, p = C.p;
      GV(f).truth = { key: p.key };
      line(C, 'You say what they will do before they do it, out loud, every round. Your people hear the truth in time. You still have to take your own hits. (No Lies)',
        `${C.name} starts saying what the monsters will do before they do it. Everyone listens. (No Lies)`);
      readAloud(f);
      tele('god_verb', { god: 'all_seeing', verb: 'no_lies', who: C.isP ? 'player' : C.vid });
      return true;
    },
    // Voice of the Relay
    rally_cry(fi) {
      const C = actor(fi), f = Game.tbfight, p = C.p, P = godPlay('voice_of_the_relay');
      const allies = liveOurs(f).filter(x => x !== p && x.kind !== 'player');
      if (!allies.length && C.isP) { Game.say('No one in the fight to hear you. (Rally Cry)'); return false; }
      const rr = P.rallyRounds || 3;
      for (const m of liveMons(f)) m.hesitate = Math.max(m.hesitate || 0, 1);
      line(C, `You speak and every ally hears it at once. ${allies.length} act${allies.length === 1 ? 's' : ''} NOW, emboldened. Every foe hesitates. (Speak and Be Heard)`,
        `${C.name} speaks and every ally hears it at once. Every foe hesitates. (Speak and Be Heard)`);
      for (const v of allies) {
        v.rallyBuff = Math.max(v.rallyBuff || 0, rr); v.rallied = Math.max(v.rallied || 0, rr);
        v._nextStrikes = { mult: P.strikeMult || 1.5, n: 2, label: 'RALLY CRY' };
        if (!v.alive || v.fled) continue;
        try { v._gpCommanded = true; Game.tbVillagerTurn(v); } catch (e) { warn('rally turn', e); } finally { delete v._gpCommanded; }
        if (Game.tbEndCheck && Game.tbEndCheck()) break;
      }
      if (C.isP && P.grounding) { try { Game.addGrounding && Game.addGrounding(-P.grounding, 'the voice'); } catch (e) { warn('grounding', e); } }
      tele('god_verb', { god: 'voice_of_the_relay', verb: 'rally_cry', who: C.isP ? 'player' : C.vid, allies: allies.length });
      return true;
    },
    // Market God
    buy_passage(fi, act, target) {
      const C = actor(fi), f = Game.tbfight, p = C.p;
      let m = target ? Game.tbFighter(target) : null;
      if (!m || !isFoeF(m) || !m.alive || m.fled) m = liveMons(f).filter(x => !isTitanish(x)).sort((a, b) => (b.hp || 0) - (a.hp || 0))[0];
      if (!m) { if (C.isP) Game.say('The big ones don\'t haggle. Nothing here takes coin. (Buy Passage: not titans)'); return false; }
      if (isTitanish(m)) { if (C.isP) Game.say(`${nm(m)} looks at the coin and keeps coming. The big ones don't haggle. (Buy Passage: not titans)`); return false; }
      const wave = ((m.mdef || {}).wave) || m.wave || 1;
      if (C.isP) {
        const r = Game.marketBuyPassage ? Game.marketBuyPassage(Object.assign(m, { wave })) : null;
        if (!r || !r.ok) return false;
        tele('god_verb', { god: 'market_god', verb: 'buy_passage', who: 'player', wave, marker: !!r.marker });
      } else {
        const prices = { 1: 1000, 2: 2500, 3: 5000, 4: 10000 };
        const price = prices[Math.min(5, wave)] || 0;
        const rec = vGodRec(C.vid);
        if (price && canPay(C, price)) pay(C, price);
        else if (rec) rec.marketDebt = (rec.marketDebt || 0) + 1;
        m.fled = true; m.alive = false;
        Game.say(`${C.name} names a price. ${nm(m)} takes it and LEAVES. (Buy Passage${price && !(rec && rec.marketDebt) ? '' : ': the market remembers'})`);
        tele('god_verb', { god: 'market_god', verb: 'buy_passage', who: C.vid, wave });
      }
      try { Game.tbEndCheck && Game.tbEndCheck(); } catch (e) { warn('endcheck passage', e); }
      return true;
    },
  };
  function vGodRec(vid) { try { return ((Game.state.village || {}).npcGodhood || {})[vid] || null; } catch (e) { return null; } }

  // ---------------- day verbs (player; villagers via godDaily) ----------------
  function feedMultitude(who) {
    const v = Game.state.village || {}, s = Game.state.scholar || {};
    const ids = (v.roster || []).filter(id => id !== Game.villagerId && id !== who && !((Game.vpOf && Game.vpOf(id)) || {}).dead);
    let fed = 0;
    for (const id of ids) {
      try { const n = Game.npcNeeds(id); if (n) { n.hunger = 0; fed++; } } catch (e) { warn('feed needs', e); }
    }
    v.harvestDay = s.day || 0;
    return fed;
  }
  const DAY_IMPL = {
    feed_multitude() {
      const fed = feedMultitude('player');
      if (!fed) { Game.say('No one in camp to feed. (Feed the Multitude)'); return false; }
      Game.say(`You ask, and the land answers through your hands. ${fed} bellies full in Haven, and every fight today starts with the party fed. None of it is yours to eat. (Feed the Multitude)`);
      tele('god_verb', { god: 'living_garden', verb: 'feed_multitude', who: 'player', fed });
      return true;
    },
    be_heard() {
      const v = Game.state.village || {}, s = Game.state.scholar || {}, P = godPlay('voice_of_the_relay');
      const ids = (v.roster || []).filter(id => id !== Game.villagerId);
      for (const id of ids) { try { Game.bumpTrust && Game.bumpTrust(id, P.trust || 2, 'the voice'); } catch (e) { warn('voice trust', e); } }
      v.voiceDay = s.day || 0;
      if (P.grounding) { try { Game.addGrounding && Game.addGrounding(-P.grounding, 'the voice'); } catch (e) { warn('grounding', e); } }
      Game.say(`You speak once and every ally hears it at once, no runner, no garble. ${ids.length} in Haven stand straighter; every fight today starts rallied. A little less of you is left. (Speak and Be Heard)`);
      tele('god_verb', { god: 'voice_of_the_relay', verb: 'be_heard', who: 'player', heard: ids.length });
      return true;
    },
    name_price(target) {
      const id = (typeof target === 'string' && target) ? target : marketPick();
      if (!id) { Game.say('You can\'t think of anything the market could bring that you lack. (Name Your Price)'); return false; }
      const r = Game.marketNamePrice ? Game.marketNamePrice(id) : null;
      if (!r || !r.ok) return false;
      tele('god_verb', { god: 'market_god', verb: 'name_price', who: 'player', item: id, marker: !!r.marker });
      return true;
    },
  };
  // marketPick(): "You don't find what you need — it finds you." The best
  // weapon you lack that the market sells (tier 1-3), else nothing.
  function marketPick() {
    try {
      const tiers = S.ITEM_TIER || {};
      let cur = 0;
      try { const w = Game.equippedWeapon && Game.equippedWeapon(); cur = (w && (w.bonus || (w.weapon && w.weapon.bonus))) || 0; } catch (e) { warn('equippedWeapon', e); }
      let best = null;
      for (const it of ((Game.data || {}).items || [])) {
        const t = tiers[it.id] || 0;
        if (!t || t > 3 || !it.weapon || !(it.weapon.bonus > cur)) continue;
        if (!best || it.weapon.bonus > best.weapon.bonus) best = it;
      }
      return best ? best.id : null;
    } catch (e) { warn('marketPick', e); return null; }
  }

  // ---------------- the 'god' pseudo-ability (player) ----------------
  function playerGodAction(actionId) {
    const a = index().actions[actionId];
    if (!a) return null;
    return holderGod('player') === a.godId ? a : null;
  }
  function dayKey() { return (Game.state.scholar || {}).day || 0; }
  function precheck(actionId, target) {
    const a = playerGodAction(actionId);
    if (!a) return { ok: false, why: 'Not your god.' };
    const act = a.act, f = Game.tbfight, s = Game.state.scholar;
    if (act.context === 'combat') {
      if (!f || f.over) return { ok: false, why: 'Only in a fight.' };
      const p = Game.tbFighter('p');
      if (!p || !p.alive) return { ok: false, why: 'You are down.' };
      if (act.perFight && used(f, p, actionId.indexOf('terms_') === 0 ? 'terms' : actionId) >= act.perFight) return { ok: false, why: `${act.name}: once per fight.` };
      if (actionId === 'turn_the_pain') {
        if (painPool(f, p) <= 0) return { ok: false, why: 'Nothing to give back yet.' };
        if (!liveMons(f).some(m => cheb(m, p) <= (act.reach || 1))) return { ok: false, why: 'It has to be a blow: get next to it.' };
      }
      if (act.terms) {
        const g = GV(f);
        if ((f.round || 1) > 1 || g.firstBlow) return { ok: false, why: 'The terms are set before the first blow.' };
      }
      if (actionId === 'buy_passage' && !liveMons(f).some(m => !isTitanish(m))) return { ok: false, why: 'The big ones don\'t haggle.' };
      if (actionId === 'rally_cry' && !liveOurs(f).some(x => x.kind !== 'player')) return { ok: false, why: 'No one in the fight to hear you.' };
      return { ok: true };
    }
    if (f && !f.over) return { ok: false, why: 'Not in the middle of a fight.' };
    if (act.perDay && ((s._godDay || {})[actionId]) === dayKey()) return { ok: false, why: `${act.name}: once a day.` };
    if (actionId === 'feed_multitude' && !(Game.state.village.roster || []).some(id => id !== Game.villagerId && !((Game.vpOf && Game.vpOf(id)) || {}).dead)) {
      return { ok: false, why: 'No one in camp to feed.' };
    }
    if (actionId === 'name_price') {
      if (!target && !marketPick()) return { ok: false, why: 'Nothing you lack that the market can bring.' };
      const used2 = (((s.godhood || {}).capstoneUsed) || {}).namePrice;
      if (used2) return { ok: false, why: 'Name Your Price: once a day.' };
    }
    return { ok: true };
  }
  function runPlayer(actionId, target) {
    const a = playerGodAction(actionId);
    if (!a) return false;
    const act = a.act, f = Game.tbfight;
    let r;
    if (act.context === 'combat') {
      const p = Game.tbFighter('p');
      const impl = act.terms ? VERB_IMPL.terms : VERB_IMPL[actionId];
      if (!impl) { warn('no impl for ' + actionId); return false; }
      r = impl(p, act, target);
      if (r !== false) markUsed(f, p, act.terms ? 'terms' : actionId);
    } else {
      const impl = DAY_IMPL[actionId];
      if (!impl) { warn('no day impl for ' + actionId); return false; }
      r = impl(target);
      if (r !== false && act.perDay) { const s = Game.state.scholar; s._godDay = s._godDay || {}; s._godDay[actionId] = dayKey(); }
    }
    return r;
  }

  const methods = {
    godPlay(godId) { return godPlay(godId); },
    holderGod(who) { return holderGod(who); },
    fighterGod(fi) { return fighterGod(fi); },
    godActionDef(actionId) {
      const a = index().actions[actionId];
      if (!a) return null;
      return { ability: { id: 'god', name: godName(a.godId) }, action: a.act };
    },
    godActionReady(actionId) { return !!playerGodAction(actionId); },
    godActivatables() {
      const out = [];
      try {
        const gid = holderGod('player');
        if (!gid) return out;
        const inCombat = !!(this.inCombat && this.inCombat());
        for (const act of (godPlay(gid).actions || [])) {
          const combat = act.context === 'combat';
          if (combat !== inCombat) continue;
          const avail = this._actionAvailable ? this._actionAvailable('god', act) : { ok: true };
          out.push({
            abilityId: 'god', actionId: act.id, id: 'god.' + act.id, target: 'none',
            name: `✦ ${act.name}`, desc: act.effect || '', context: act.context, cost: act.cost || {},
            available: avail.ok, why: avail.why || null, combat, god: gid,
          });
        }
      } catch (e) { warn('godActivatables', e); }
      return out;
    },
  };
  Object.assign(Game, methods);

  // engine bridge: impls + prechecks for useAbility('god', id)
  const IMPLS = globalThis.AbilityActionImpls;
  const PRE = globalThis.AbilityActionPrechecks;
  function registerGodActions() {
    if (!IMPLS || !PRE) { warn('AbilityActionImpls missing: god verbs unwired (load godverbs.js after abilityActions.js)'); return 0; }
    let n = 0;
    for (const id of Object.keys(index().actions)) {
      IMPLS['god.' + id] = function (game, target) { return runPlayer(id, target); };
      PRE['god.' + id] = function (game, target) { return precheck(id, target); };
      n++;
    }
    return n;
  }

  // ---------------- villagers cast their verb ----------------
  // godVillagerCast(game, v): the villager god's read of the turn (same
  // spirit as V_PLAN in godpath.js). true = the turn is spent; 'free' = act on.
  function godVillagerCast(game, v) {
    try {
      const f = game.tbfight;
      if (!f || f.over || !v || !v.alive || v.fled || v._gpCommanded) return false;
      const gid = fighterGod(v);
      if (!gid) return false;
      const P = godPlay(gid), C = actor(v);
      const mons = liveMons(f);
      if (!mons.length) return false;
      const near = mons.slice().sort((a, b) => cheb(a, v) - cheb(b, v))[0];
      const d = near ? cheb(near, v) : 99;
      const hp = (v.hp || 0) / Math.max(1, v.maxHp || 1);
      const actBy = (id) => (P.actions || []).find(a => a.id === id);
      const tryCast = (id, implKey, act, target) => {
        const k = act.terms ? 'terms' : id;
        if (act.perFight && used(f, v, k) >= act.perFight) return false;
        const kcal = (act.cost && act.cost.kcal) || 40;
        if (!canPay(C, kcal)) return false;
        const r = VERB_IMPL[implKey](v, act, target);
        markUsed(f, v, k);
        if (r === false) return false;
        pay(C, kcal);
        try { game.npcWitnessAbility && game.npcWitnessAbility('god_' + gid, liveOurs(f).map(a => a.villagerId).filter(Boolean), C.vid); } catch (e) { warn('witness', e); }
        return (act.cost && act.cost.turn) ? true : 'free';
      };
      if (gid === 'one_person_army') {
        const act = actBy('turn_the_pain');
        if (act && d <= (act.reach || 1) && painPool(f, v) >= (P.villagerCastAt || 0.35) * (v.maxHp || 30)) return tryCast('turn_the_pain', 'turn_the_pain', act, null);
      } else if (gid === 'apex_predator') {
        const g = GV(f);
        if ((f.round || 1) <= 1 && !g.firstBlow && !g.terms) {
          const kind = mons.length >= 3 ? 'terms_ground' : (d <= 4 ? 'terms_ambush' : 'terms_range');
          const act = actBy(kind);
          if (act) return tryCast(kind, 'terms', act, null);
        }
      } else if (gid === 'all_seeing') {
        const act = actBy('no_lies');
        if (act && !GV(f).truth && liveOurs(f).length >= 2) return tryCast('no_lies', 'no_lies', act, null);
      } else if (gid === 'voice_of_the_relay') {
        const act = actBy('rally_cry');
        if (act && liveOurs(f).filter(x => x !== v && x.kind !== 'player').length >= 1) return tryCast('rally_cry', 'rally_cry', act, null);
      } else if (gid === 'market_god') {
        const act = actBy('buy_passage');
        if (act && hp < 0.35 && near && d <= 2 && !isTitanish(near)) return tryCast('buy_passage', 'buy_passage', act, near.key);
      }
      return false;
    } catch (e) { warn('godVillagerCast', e); return false; }
  }

  // ---------------- reactive passives: before a hit lands ----------------
  // preHit(game, t, dmg, label, sourceKey, opts) -> damage that still goes
  // to t through the normal path, or {done: n} when this module applied it.
  function preHit(game, t, dmg, label, sourceKey, opts) {
    const f = game.tbfight;
    if (!f || !t || !t.alive || !(dmg > 0) || (opts && opts._gv)) return dmg;
    const g = GV(f);
    const src = sourceKey ? game.tbFighter(sourceKey) : null;
    const fromFoe = !src || isFoeF(src);
    // ECHO: an echo is already dead. Its hits land on the echo only, and it
    // breaks apart instead of dying twice (no second fall, no second death).
    if (t._echo) {
      t.hp -= dmg;
      if (t.hp <= 0) {
        t.hp = 0; t.alive = false; t._echo = null;
        game.say(`The echo of ${t.name} breaks apart. That was the last of them. (Raise Echo)`);
      }
      return { done: dmg };
    }
    if (!isOurs(t) || !fromFoe) return dmg;
    // PHASE OUT (the Between): one hit, any size, passes through empty air.
    const tg = fighterGod(t);
    if (tg === 'the_between') {
      const P = godPlay('the_between').passive || {};
      const C = actor(t);
      const big = dmg >= (t.hp || 0) || dmg >= (P.minFrac || 0.25) * (t.maxHp || 100);
      const titanRound = src && isTitanish(src) && g.phased[t.key] === (f.round || 1);
      if (titanRound) { game.say(`${nm(src)} hits the place ${C.isP ? 'you were' : C.name + ' was'}. Still not there. (Phase Out)`); return { done: 0 }; }
      if (big && !g.phased[t.key] && canPay(C, P.kcal || 100)) {
        pay(C, P.kcal || 100);
        g.phased[t.key] = f.round || 1;
        phaseRetreat(game, f, t, src, P.retreat || 3);
        line(C, `The blow lands where you were. You are simply not there: ${Math.round(dmg)} damage into empty air, and you are somewhere else. Phasing is a retreat; you hold no ground. (Phase Out)`,
          `The blow lands where ${C.name} was. ${C.name} is simply not there. (Phase Out)`);
        tele('god_verb', { god: 'the_between', verb: 'phase_out', who: C.isP ? 'player' : C.vid, negated: Math.round(dmg) });
        return { done: 0 };
      }
    }
    // TAKE THE WOUND (the Undying Ward): a big hit on an ally lands on the Ward.
    {
      for (const w of holdersIn(f, 'undying_ward')) {
        if (w === t || g.collapsed[w.key]) continue;
        const P = godPlay('undying_ward'), PP = P.passive || {};
        const big = dmg >= (t.hp || 0) || dmg >= (PP.minFrac || 0.25) * (t.maxHp || 30);
        if (!big) continue;
        const C = actor(w);
        if (!canPay(C, PP.kcal || 60)) continue;
        pay(C, PP.kcal || 60);
        const before = w.hp;
        w.hp = Math.max(1, (w.hp || 0) - dmg);
        const took = before - w.hp;
        if (C.isP) {
          const s = game.state.scholar;
          s.health = w.hp;
          s.fightDamageTaken = (s.fightDamageTaken || 0) + took;
        } else w._taken = (w._taken || 0) + took;
        w._taken = C.isP ? ((w._taken || 0) + took) : w._taken;
        g.strains[w.key] = (g.strains[w.key] || 0) + 1;
        const n = g.strains[w.key], max = PP.strains || 3;
        line(C, `${t.name}'s wound is yours now: ${took} into you, and you keep standing (${w.hp} HP). (Take the Wound ${n}/${max})`,
          `${C.name} takes ${t.name}'s wound: ${took} lands on ${C.name}, who keeps standing. (Take the Wound ${n}/${max})`);
        tele('god_verb', { god: 'undying_ward', verb: 'take_the_wound', who: C.isP ? 'player' : C.vid, saved: t.villagerId || t.key, took });
        if (n >= max) {
          g.collapsed[w.key] = true;
          if (C.isP) { w.stunned = Math.max(w.stunned || 0, 1); w.stunFull = 1; }
          else { w.fled = true; }
          line(C, 'Three wounds carried. You collapse: alive, but out. You lose your next turn. (Take the Wound)',
            `Three wounds carried. ${C.name} collapses: alive, but out of the fight. (Take the Wound)`);
        }
        return { done: 0 };
      }
    }
    // NO LIES: allies hear the truth in time (never the holder: still fragile).
    if (g.truth && t.key !== g.truth.key && src && isFoeF(src)) {
      const P = godPlay('all_seeing');
      if (Math.random() < (P.allyDodge || 0.5)) {
        const reader = (f.fighters || []).find(x => x.key === g.truth.key);
        game.say(`${t.kind === 'player' ? 'You' : t.name} heard it called a breath early and ${t.kind === 'player' ? 'are' : 'is'} already gone. It misses. (No Lies${reader && reader.kind !== 'player' ? ': ' + reader.name : ''})`);
        return { done: 0 };
      }
    }
    return dmg;
  }
  function phaseRetreat(game, f, t, src, range) {
    try {
      const gmax = game.tbGridMax ? game.tbGridMax() : 8;
      const mons = liveMons(f);
      let best = -1, dest = null;
      for (let x = Math.max(0, t.mx - range); x <= Math.min(gmax, t.mx + range); x++) {
        for (let y = Math.max(0, t.my - range); y <= Math.min(gmax, t.my + range); y++) {
          if (x === t.mx && y === t.my) continue;
          if (game.tbCanOccupy && !game.tbCanOccupy(t, x, y)) continue;
          const dmin = mons.length ? Math.min(...mons.map(m => cheb(m, { mx: x, my: y }))) : 9;
          if (dmin > best) { best = dmin; dest = { x, y }; }
        }
      }
      if (dest) {
        t.mx = dest.x; t.my = dest.y;
        if (t.kind === 'player') { game.state.scholar.mx = t.mx; game.state.scholar.my = t.my; }
        else if (t.kind === 'villager' && game.tbVillagerSyncPos) game.tbVillagerSyncPos(t);
      }
      // you cannot phase and hold ground in the same breath
      if (t.kind === 'player') { f.ksHold = false; }
      t._aegis = null;
      try { game.tbRefreshTelegraphUI && game.tbRefreshTelegraphUI(); } catch (e) { warn('refresh', e); }
    } catch (e) { warn('phaseRetreat', e); }
  }

  // ---------------- after a hit lands ----------------
  function postHit(game, t, landed, label, sourceKey, wasAlive) {
    const f = game.tbfight;
    if (!f || !t) return;
    const g = GV(f);
    const src = sourceKey ? game.tbFighter(sourceKey) : null;
    if (landed > 0 && isOurs(t) && src && isFoeF(src)) {
      if (isBeam(label, src)) g.beam[t.key] = (g.beam[t.key] || 0) + landed;
      if (isTitanish(src) && t.kind !== 'player') g.titanPain[src.key] = (g.titanPain[src.key] || 0) + landed;
    }
    if (landed > 0 && isFoeF(t) && src && isOurs(src)) g.firstBlow = true;
    if (!isOurs(t)) return;
    const tg = fighterGod(t);
    // PARTY (One-Person Army): allies see you bleed and fight harder.
    if (tg === 'one_person_army' && t.alive && !g.rallied[t.key]) {
      const P = godPlay('one_person_army');
      if ((t.hp || 0) / Math.max(1, t.maxHp || 100) < (P.partyRallyAt || 0.5)) {
        g.rallied[t.key] = true;
        const near = liveOurs(f).filter(x => x !== t && x.kind !== 'player' && cheb(x, t) <= 3);
        for (const v of near) { v.rallyBuff = Math.max(v.rallyBuff || 0, P.partyRallyRounds || 3); v.rallied = Math.max(v.rallied || 0, P.partyRallyRounds || 3); }
        if (near.length) game.say(`${near.length} all${near.length === 1 ? 'y sees' : 'ies see'} ${t.kind === 'player' ? 'you' : t.name} bleed and come in harder for it. (The One-Person Army)`);
      }
    }
    // THE SINGLE POINT OF FAILURE (Voice of the Relay): the network goes dark.
    if (tg === 'voice_of_the_relay' && wasAlive && !t.alive) {
      const field = liveOurs(f).filter(x => x !== t && x.kind !== 'player');
      for (const v of field) { v.stunned = Math.max(v.stunned || 0, 1); v.rallyBuff = 0; }
      if (field.length) game.say(`The voice everyone was listening for stops. ${field.length} all${field.length === 1 ? 'y freezes' : 'ies freeze'}, waiting for a word that doesn't come. (Voice of the Relay: the network goes dark)`);
    }
  }

  // ---------------- raise echo (Shepherd) ----------------
  function raiseEcho(game, t) {
    try {
      const f = game.tbfight;
      if (!f || !t || t._echoed || t.kind === 'player') return false;
      const g = GV(f);
      const titan = titanFight(f);
      const P = godPlay('shepherd_of_the_dead').passive || {};
      for (const h of holdersIn(f, 'shepherd_of_the_dead')) {
        if (h === t) continue;
        if (!titan && used(f, h, 'raise_echo') >= 1) continue;
        const C = actor(h);
        const kcal = (titan && used(f, h, 'raise_echo') >= 1) ? (P.titanKcal || 100) : (P.kcal || 150);
        if (!canPay(C, kcal)) continue;
        pay(C, kcal);
        markUsed(f, h, 'raise_echo');
        const rounds = P.rounds || 3;
        t.alive = true; t.fled = false; t.hp = t.maxHp || 30; t._echoed = true;
        t._echo = { fade: (f.round || 1) + rounds };
        t._nextStrikes = { mult: P.strikeMult || 2, n: 99, label: 'ECHO' };
        t.rallied = Math.max(t.rallied || 0, rounds);
        g.echoes++;
        line(C, `${t.name} falls, and you won't let them leave yet. Their echo stands back up: themselves, their weapon, their voice, hitting x${P.strikeMult || 2}, for ${rounds} rounds. Then they're gone for good. (Raise Echo)`,
          `${t.name} falls, and ${C.name} won't let them leave yet. Their echo stands back up for ${rounds} rounds. (Raise Echo)`);
        tele('god_verb', { god: 'shepherd_of_the_dead', verb: 'raise_echo', who: C.isP ? 'player' : C.vid, echo: t.villagerId || t.key, titan });
        return true;
      }
      return false;
    } catch (e) { warn('raiseEcho', e); return false; }
  }
  function fadeEchoes(game, f, all) {
    for (const x of ((f && f.fighters) || [])) {
      if (!x._echo) continue;
      if (all || (f.round || 1) >= x._echo.fade) {
        x._echo = null;
        if (x.alive) { x.alive = false; x.hp = 0; if (!all) game.say(`${x.name}'s echo fades. They are gone now, for good. (Raise Echo)`); }
      }
    }
  }

  // ---------------- the Unkillable ----------------
  function phoenixPlayer(game) {
    const s = game.state.scholar, P = godPlay('unkillable').passive || {};
    if (holderGod('player') !== 'unkillable' || (s.health || 0) > 0 || game.state.phoenixLink) return false;
    if ((s.kcal || 0) < (P.kcal || 500)) {
      game.say(`🔥 The phoenix stirs and finds nothing to burn in you: no fuel, no fire. Your death sticks. (Phoenix: ${P.kcal || 500} kcal)`);
      return false;
    }
    s.kcal -= (P.kcal || 500);
    game.say(`🔥 The Unkillable does not stay down. The fire takes ${P.kcal || 500} kcal of you and goes looking for someone else to burn. (Phoenix)`);
    tele('god_verb', { god: 'unkillable', verb: 'phoenix', who: 'player' });
    return !!game.phoenixPlayerTrigger();
  }
  function phoenixVillagerTactical(game, t) {
    try {
      if (!t || !t.villagerId || holderGod(t.villagerId) !== 'unkillable' || game.state.phoenixLink) return false;
      const P = godPlay('unkillable').passive || {};
      const C = actor(t);
      if (!canPay(C, P.kcal || 500)) return false;
      const f = game.tbfight;
      const inFight = new Set(((f && f.fighters) || []).map(x => x.villagerId).filter(Boolean));
      const living = (game.phoenixLivingVillagers ? game.phoenixLivingVillagers() : []).filter(id => id !== t.villagerId && !inFight.has(id));
      if (!living.length) return false;
      pay(C, P.kcal || 500);
      const victim = living[Math.floor(Math.random() * living.length)];
      game.phoenixLinkBeat && game.phoenixLinkBeat(false, t.villagerId, victim, 'burn');
      game.phoenixResolveBurn(false, t.villagerId, victim, {});
      t.hp = 1; t.fled = true; // they crawl out of the ash somewhere else
      tele('god_verb', { god: 'unkillable', verb: 'phoenix', who: t.villagerId, burned: victim });
      return true;
    } catch (e) { warn('phoenixVillagerTactical', e); return false; }
  }

  // Sight is a daily, food-powered faculty; an empty stomach sees ordinary lies.
  function sightReady() {
    if (holderGod('player') !== 'all_seeing') return false;
    const s = Game.state.scholar, day = s.day || 0;
    if ((s.kcal || 0) < HUNGER_GATE_KCAL) return false;
    if (s._godSightDay === day) return true;
    const cost = godPlay('all_seeing').dailyKcal || 60;
    const C = { isP: true };
    if (!canPay(C, cost)) return false;
    pay(C, cost); s._godSightDay = day;
    Game.say(`(No Lies: the day's sight burns ${cost} kcal.)`);
    return true;
  }

  // ---------------- dawn ----------------
  function godDaily(game) {
    try {
      const s = game.state.scholar, v = game.state.village || {};
      const G = S.Godhood;
      // the player's day verbs, the coins, the Audit
      if (G && s.godhood) {
        try { G.resetDayVerbs && G.resetDayVerbs(s); } catch (e) { warn('resetDayVerbs', e); }
        try { if (G.auditDue && G.auditDue(s) && game.marketAuditCollect) game.marketAuditCollect(); } catch (e) { warn('audit', e); }
      }
      // villager market gods: coins return one a dawn; three markers and the Audit takes their best thing
      for (const vid of Object.keys(v.npcGodhood || {})) {
        if (holderGod(vid) !== 'market_god') continue;
        const rec = v.npcGodhood[vid];
        try { G && G.guardRegen && G.guardRegen({ godhood: rec }); } catch (e) { warn('v guardRegen', e); }
        if ((rec.marketDebt || 0) >= 3) {
          rec.marketDebt = 0;
          const pp = game.getPerson ? game.getPerson(vid) : null;
          const took = pp && (pp.items || []).length ? pp.items.pop() : null;
          const n = game.npcNeeds && game.npcNeeds(vid);
          if (!took && n) n.hunger = Math.min(100, (n.hunger || 0) + 40);
          game.say(`The Audit calls on ${game.displayName ? game.displayName(vid) : vid}. It takes ${took ? 'the finest thing they own' : 'food out of their mouth'}. The ledger closes. (Market God)`);
        }
      }
      // NO LIES: you know every live lie at dawn, and the liars feel your gaze.
      if (sightReady()) {
        const P = godPlay('all_seeing');
        for (const vid of (v.roster || [])) {
          if (vid === game.villagerId) continue;
          let lies = null;
          try { lies = game.npcLies ? game.npcLies(vid) : null; } catch (e) { warn('npcLies', e); }
          const live = lies ? Object.keys(lies).filter(k => lies[k] && lies[k].told && !lies[k].confessed) : [];
          if (!live.length) continue;
          try { game.bumpTrust && game.bumpTrust(vid, -(P.trustCostPerDay || 1), 'the gaze'); } catch (e) { warn('gaze trust', e); }
          s._godKnown = s._godKnown || {};
          for (const k of live) {
            const key = vid + ':' + k;
            if (s._godKnown[key]) continue;
            s._godKnown[key] = true;
            const L = lies[k];
            const who = game.displayName ? game.displayName(vid) : vid;
            try { game.addDoubt && game.addDoubt(vid, 'observation', `${who} says ${L.told}. You know it's ${L.truth}.`, [`No Lies: ${who} is lying about their ${k}`, `the truth: ${L.truth}`], { field: k, eventBacked: true }); } catch (e) { warn('addDoubt', e); }
            game.say(`👁 ${who} has been telling people "${L.told}". You know it isn't true. (No Lies)`);
          }
        }
      }
      // villager gardens feed Haven when it's hungry (same verb, their belly pays)
      const day = s.day || 0;
      for (const vid of (v.roster || [])) {
        if (vid === game.villagerId || holderGod(vid) !== 'living_garden' || v.harvestDay === day) continue;
        const C = { isP: false, vid, name: game.displayName ? game.displayName(vid) : vid };
        let need = false;
        try {
          const tier = game.villageFoodTier ? game.villageFoodTier() : 'secure';
          need = tier !== 'abundant' || (v.roster || []).some(id => ((game.npcNeeds(id) || {}).hunger || 0) >= 50);
        } catch (e) { warn('garden need', e); }
        const kcal = ((godPlay('living_garden').actions || [])[0] || {}).cost ? godPlay('living_garden').actions[0].cost.kcal : 200;
        if (!need || !canPay(C, kcal)) continue;
        pay(C, kcal);
        const fed = feedMultitude(vid);
        game.say(`${C.name} kneels and asks. The land answers: ${fed} bellies full in Haven today. (Feed the Multitude)`);
        tele('god_verb', { god: 'living_garden', verb: 'feed_multitude', who: vid, fed });
      }
    } catch (e) { warn('godDaily', e); }
  }

  // ======================= WIRING (wraps; no game.js rewrites) =======================
  const _acts = Game.activatableAbilities;
  Game.activatableAbilities = function () {
    const out = _acts ? (_acts.apply(this, arguments) || []) : [];
    try { return out.concat(this.godActivatables()); } catch (e) { warn('activatableAbilities', e); return out; }
  };

  const _td = Game.tbDamage;
  Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
    const t = this.tbFighter ? this.tbFighter(targetKey) : null;
    let d = dmg;
    try { d = preHit(this, t, dmg, sourceLabel, sourceKey, opts); } catch (e) { warn('preHit', e); d = dmg; }
    if (d && typeof d === 'object') return d.done;
    const wasAlive = !!(t && t.alive);
    let beam = false;
    try { beam = isBeam(sourceLabel, sourceKey ? this.tbFighter(sourceKey) : null); } catch (e) { warn('beam', e); }
    const prevBeam = this._gvBeamHit;
    this._gvBeamHit = beam;
    let landed;
    try { landed = _td.call(this, targetKey, d, sourceLabel, sourceKey, opts); }
    finally { this._gvBeamHit = prevBeam; }
    try { postHit(this, t, landed || 0, sourceLabel, sourceKey, wasAlive); } catch (e) { warn('postHit', e); }
    return landed;
  };

  // GILDED GUARD: wealth doesn't stop a beam you can't buy off.
  if (S.Godhood && S.Godhood.guardAbsorb) {
    const _ga = S.Godhood.guardAbsorb;
    S.Godhood.guardAbsorb = function (sch, dmg) {
      if (Game._gvBeamHit) {
        if (!Game._gvBeamSaid) { Game._gvBeamSaid = true; try { Game.say('The coins swing up into the light and it goes straight through them. Wealth doesn\'t stop a beam. (Gilded Guard)'); } catch (e) { warn('say', e); } }
        return { absorbed: 0, coinsLeft: S.Godhood.guardCoins ? S.Godhood.guardCoins(sch) : 0, shattered: 0 };
      }
      return _ga.apply(this, arguments);
    };
  }

  const _sc = Game.startCombat;
  if (typeof _sc === 'function') {
    Game.startCombat = function () {
      try { const s = this.state && this.state.scholar; if (s && s.godhood && S.Godhood && S.Godhood.resetFightVerbs) S.Godhood.resetFightVerbs(s); } catch (e) { warn('resetFightVerbs', e); }
      this._gvBeamSaid = false;
      const r = _sc.apply(this, arguments);
      try {
        const f = this.tbfight;
        if (f) GV(f);
      } catch (e) { warn('startCombat', e); }
      return r;
    };
  }
  // the day's word and the day's harvest reach every ally on the field,
  // including coalition blades injected after the fight began
  function today() { return (Game.state.scholar || {}).day || 0; }
  function fedToday() { return ((Game.state.village || {}).harvestDay) === today(); }
  const _vt = Game.tbVillagerTurn;
  if (typeof _vt === 'function') {
    Game.tbVillagerTurn = function (v) {
      try {
        const f = this.tbfight;
        if (f && v && !v._gvVoiced && ((this.state.village || {}).voiceDay) === today()) {
          v._gvVoiced = true;
          v.rallyBuff = Math.max(v.rallyBuff || 0, 4); v.rallied = Math.max(v.rallied || 0, 4);
          const g = GV(f);
          if (!g.saidVoice) { g.saidVoice = true; this.say('Your word from this morning is still in their ears: your people fight rallied. (Speak and Be Heard)'); }
        }
        if (f && v && fedToday()) { const g = GV(f); if (!g.saidFed) { g.saidFed = true; this.say('Everyone here ate this morning because the garden asked: the party fights fed. (Feed the Multitude)'); } }
      } catch (e) { warn('villager turn', e); }
      return _vt.apply(this, arguments);
    };
  }
  const _rw = Game.tbRoundWrap;
  if (typeof _rw === 'function') {
    Game.tbRoundWrap = function (f) {
      const r = _rw.apply(this, arguments);
      try { if (f && f._gv) { fadeEchoes(this, f, false); termsContact(f); readAloud(f); } } catch (e) { warn('round wrap', e); }
      return r;
    };
  }
  const _mt = Game.tbMonsterTurn;
  if (typeof _mt === 'function') {
    Game.tbMonsterTurn = function (m) {
      const r = _mt.apply(this, arguments);
      try { const f = this.tbfight; if (f && f._gv && f._gv.terms) termsContact(f); } catch (e) { warn('monster turn', e); }
      return r;
    };
  }
  const _te = Game.tbEnd;
  if (typeof _te === 'function') {
    Game.tbEnd = function () {
      try {
        const f = this.tbfight, s = (this.state || {}).scholar;
        if (f && s && s._nextStrikes && s._nextStrikes._apexAlly) delete s._nextStrikes;
        if (f && f._gv) fadeEchoes(this, f, true);
      } catch (e) { warn('tbEnd gods', e); }
      return _te.apply(this, arguments);
    };
  }
  // the Ward heals itself at half mid-fight
  const _ah = Game.addHealth;
  if (typeof _ah === 'function') {
    Game.addHealth = function (n) {
      try {
        const f = this.tbfight;
        if (n > 0 && f && !f.over && holderGod('player') === 'undying_ward') {
          const mult = godPlay('undying_ward').selfHealMult || 0.5;
          const g = GV(f);
          n = Math.max(1, Math.round(n * mult));
          if (!g.saidHeal) { g.saidHeal = true; this.say(`(The Undying Ward mends itself slowly mid-fight: heals at x${mult}.)`); }
        }
      } catch (e) { warn('addHealth', e); }
      return _ah.call(this, n);
    };
  }
  // the light draws the aim: Ward, Garden and the Between are aimed at first
  if (S.combat && typeof S.combat.nearestEnemy === 'function') {
    const _ne = S.combat.nearestEnemy;
    S.combat.nearestEnemy = function (fighters, fi) {
      const best = _ne.apply(this, arguments);
      try {
        if (!best || !fi || !isFoeF(fi) || !Game.tbfight) return best;
        let pick = null, pd = 99;
        for (const o of fighters) {
          if (!o.alive || o.fled || !isOurs(o)) continue;
          const gid = fighterGod(o);
          if (!gid || !godPlay(gid).aggro) continue;
          const d = cheb(o, fi);
          if (d <= best.d + 2 && d < pd) { pick = o; pd = d; }
        }
        return pick ? { f: pick, d: pd } : best;
      } catch (e) { warn('nearestEnemy', e); return best; }
    };
  }
  // cheating death: the phoenix (player)
  const _md = Game.maybeCheatDeath;
  if (typeof _md === 'function') {
    Game.maybeCheatDeath = function () {
      const r = _md.apply(this, arguments);
      if (r) return r;
      try { return phoenixPlayer(this); } catch (e) { warn('phoenix player', e); return r; }
    };
  }
  // villager phoenix off a fight (the clause's own road, never spent)
  const _rv = Game.removeVillager;
  if (typeof _rv === 'function') {
    Game.removeVillager = function (vid, how) {
      try {
        if (how === 'killed' && !this._phoenixResolving && !((this.state.village.dyingLinks || {})[vid]) && holderGod(vid) === 'unkillable' && !this.state.phoenixLink) {
          const P = godPlay('unkillable').passive || {};
          const C = { isP: false, vid, name: vid };
          if (canPay(C, P.kcal || 500)) {
            pay(C, P.kcal || 500);
            if (this.phoenixVillagerTrigger(vid)) { tele('god_verb', { god: 'unkillable', verb: 'phoenix', who: vid }); return; }
          }
        }
      } catch (e) { warn('phoenix villager', e); }
      return _rv.apply(this, arguments);
    };
  }
  // NO LIES: a villager cannot tell the All-Seeing a lie
  for (const name of ['lieLive', 'getActiveLie']) {
    const orig = Game[name];
    if (typeof orig !== 'function') continue;
    Game[name] = function () {
      try { if (sightReady()) return name === 'lieLive' ? false : null; } catch (e) { warn(name, e); }
      return orig.apply(this, arguments);
    };
  }
  const _sa = Game.springAmbush;
  if (typeof _sa === 'function') {
    Game.springAmbush = function (plot) {
      try {
        if (plot && this.isPlayer && this.isPlayer(plot.target) && sightReady()) {
          plot.sprung = true; plot.active = false; plot.foiled = true;
          const who = this.displayName ? this.displayName(plot.leader) : plot.leader;
          this.say(`👁 You see it the moment the invitation is made: ${who} and the others, the places they'd stand. You don't go. (No Lies: an ambush that needs a lie never springs)`);
          try { this.addDoubt && this.addDoubt(plot.leader, 'observation', `${who} planned to ambush you.`, ['No Lies: you saw the plot'], { eventBacked: true }); } catch (e) { warn('ambush doubt', e); }
          tele('god_verb', { god: 'all_seeing', verb: 'no_lies_ambush', who: 'player' });
          return { ambush: false, foiled: true, plot };
        }
      } catch (e) { warn('springAmbush', e); }
      return _sa.apply(this, arguments);
    };
  }
  const _ed = Game.endDay;
  if (typeof _ed === 'function') {
    Game.endDay = function () {
      const r = _ed.apply(this, arguments);
      try { if (!this.over && this.state && this.state.systemArrived) godDaily(this); } catch (e) { warn('dawn', e); }
      return r;
    };
  }
  // villagers: the god verb before the hand-written abilities and the subclass verbs
  const _tva = Game.tbVillagerAbility;
  if (typeof _tva === 'function') {
    Game.tbVillagerAbility = function (v) {
      const c = godVillagerCast(this, v);
      if (c === true) return true;
      return _tva.apply(this, arguments);
    };
  }

  // ---------------- S.Godpath hooks (strike mults, dodges, falls, field fights) ----------------
  const GP = S.Godpath;
  if (GP) {
    const _dm = GP.damageMult;
    GP.damageMult = function (game, target) {
      let m = _dm ? _dm.apply(this, arguments) : 1;
      try { m *= strikeMult(game, game.tbFighter && game.tbFighter('p'), target); } catch (e) { warn('damageMult', e); }
      return m;
    };
    const _db = GP.dodgeBonus;
    GP.dodgeBonus = function (game) {
      let b = _db ? _db.apply(this, arguments) : 0;
      try {
        const f = game.tbfight, p = game.tbFighter && game.tbFighter('p');
        const T = termsLive(f, p);
        if (T && T.kind === 'ground') b += godPlay('apex_predator').groundDodge || 0.25;
      } catch (e) { warn('dodgeBonus', e); }
      return b;
    };
    const _vsm = GP.villagerStrikeMult;
    GP.villagerStrikeMult = function (game, v, target) {
      let m = _vsm ? _vsm.apply(this, arguments) : 1;
      try {
        m *= strikeMult(game, v, target);
        // FED (Feed the Multitude, PARTY/TITAN): the day's harvest is in every
        // belly on our side; a blade not already topped up hits with the overcharge.
        if (v && isOurs(v) && fedToday() && !(v.villagerId && GP.villagerPowerMult && GP.villagerPowerMult(game, v.villagerId) > 1)) m *= (game.overchargeMult ? game.overchargeMult() : 1.25);
      } catch (e) { warn('villagerStrikeMult', e); }
      return m;
    };
    const _avh = GP.absorbVillagerHit;
    GP.absorbVillagerHit = function (game, t, final) {
      let out = _avh ? _avh.apply(this, arguments) : final;
      try {
        if (!(out > 0) || !t || !t.villagerId) return out;
        const f = game.tbfight;
        const T = termsLive(f, t);
        if (T && T.kind === 'ground' && Math.random() < (godPlay('apex_predator').groundDodge || 0.25)) { game.say(`${t.name} reads the ground and isn't there. (Choose the Terms: Ground)`); return 0; }
        if (holderGod(t.villagerId) === 'market_god' && S.Godhood && S.Godhood.guardAbsorb) {
          const gr = S.Godhood.guardAbsorb({ godhood: vGodRec(t.villagerId) }, out);
          if (gr.absorbed > 0) { out -= gr.absorbed; game.say(`Coins flash around ${t.name}: the Gilded Guard takes ${gr.absorbed}. (Market God)`); }
        }
      } catch (e) { warn('absorbVillagerHit', e); }
      return out;
    };
    const _awf = GP.allyWouldFall;
    GP.allyWouldFall = function (game, t) {
      const r = _awf ? _awf.apply(this, arguments) : false;
      if (r || !t || t.hp > 0) return r;
      try { if (phoenixVillagerTactical(game, t)) return true; } catch (e) { warn('phoenix tactical', e); }
      return r;
    };
    const _oaf = GP.onAllyFell;
    GP.onAllyFell = function (game, t) {
      const r = _oaf ? _oaf.apply(this, arguments) : undefined;
      try { raiseEcho(game, t); } catch (e) { warn('raise echo hook', e); }
      return r;
    };
    // ---- off-screen field fights (fieldFights.js): the verbs in that engine's terms ----
    const _fb = GP.fieldBegin;
    GP.fieldBegin = function (game, vid, vAbs) {
      let G = _fb ? _fb.apply(this, arguments) : null;
      try {
        const gid = holderGod(vid);
        if (!gid) return G;
        if (!G) {
          let tier = 'secure';
          try { tier = game.villageFoodTier ? game.villageFoodTier() : 'secure'; } catch (e) { warn('tier', e); }
          G = { vid, held: {}, used: {}, tier, nextMult: 0, nextN: 0, absorb: 0, absorbCap: 0, missUntil: 0, missP: 0, harry: 0, birds: 0, blindUntil: 0, cheated: false, holdBonus: 0, strikeMult: 1, dodge: 0, armorAdd: 0, power: GP.villagerPowerMult ? GP.villagerPowerMult(game, vid) : 1, detAdd: 0, detMul: 1 };
        }
        G.god = gid; G.gv = {};
        if (gid === 'living_garden') G.strikeMult = (G.strikeMult || 1) * (godPlay(gid).strikeMult || 0.8);
      } catch (e) { warn('fieldBegin', e); }
      return G;
    };
    const _fa = GP.fieldAct;
    GP.fieldAct = function (G, c) {
      try {
        if (G && G.god && c && c.lead && c.lead.hp > 0 && G.tier !== 'starving') {
          const gid = G.god, P = godPlay(gid), C = { isP: false, vid: G.vid, name: c.vName };
          const act = (id) => (P.actions || []).find(a => a.id === id);
          const kc = (a) => (a && a.cost && a.cost.kcal) || 100;
          const L = c.log, pw = G.power || 1;
          const fieldPain = Math.max(0, (c.taken || 0) - (c.beamTaken || 0));
          if (gid === 'one_person_army' && c.vHp > 0 && !G.gv.pain && fieldPain >= (P.villagerCastAt || 0.35) * c.vHpMax && canPay(C, kc(act('turn_the_pain')))) {
            G.gv.pain = true; pay(C, kc(act('turn_the_pain')));
            const d = Math.round(fieldPain * pw);
            c.lead.hp -= d; if (c.lead.hp <= 0) c.lead.alive = false;
            L.push('R' + c.round + ': every wound ' + c.vName + ' took comes back at once — ' + d + ' into the ' + c.mName + '. (Turn the Pain)');
            tele('god_verb', { god: gid, verb: 'turn_the_pain', who: G.vid, field: true, dealt: d });
            return { consumed: true, abStun: 0, dealt: d };
          }
          if (gid === 'apex_predator' && !G.gv.terms && c.round <= 1 && canPay(C, kc(act('terms_ambush')))) {
            G.gv.terms = true; pay(C, kc(act('terms_ambush')));
            G.nextMult = Math.max(G.nextMult || 0, P.ambushMult || 3); G.nextN = Math.max(G.nextN || 0, 1);
            L.push('R' + c.round + ': ' + c.vName + ' chose this fight before it knew it was one. (Choose the Terms: Ambush)');
            tele('god_verb', { god: gid, verb: 'terms_ambush', who: G.vid, field: true });
            const o = _fa ? _fa.apply(this, arguments) : { consumed: false, abStun: 0 };
            o.abStun = (o.abStun || 0) + 1;
            return o;
          }
          if (gid === 'voice_of_the_relay' && !G.gv.rally && c.allyIn && c.allyHp > 0 && canPay(C, kc(act('rally_cry')))) {
            G.gv.rally = true; pay(C, kc(act('rally_cry')));
            L.push('R' + c.round + ': ' + c.vName + ' speaks and the ally hears it at once. (Speak and Be Heard)');
            tele('god_verb', { god: gid, verb: 'rally_cry', who: G.vid, field: true });
            return { consumed: true, abStun: 1, extraAlly: 3 };
          }
          if (gid === 'all_seeing' && !G.gv.truth && c.allyIn && canPay(C, kc(act('no_lies')))) {
            G.gv.truth = true; pay(C, kc(act('no_lies')));
            L.push('R' + c.round + ': ' + c.vName + ' says what it will do before it does it. The ally listens. (No Lies)');
            tele('god_verb', { god: gid, verb: 'no_lies', who: G.vid, field: true });
          }
        }
      } catch (e) { warn('fieldAct god', e); }
      return _fa ? _fa.apply(this, arguments) : { consumed: false, abStun: 0 };
    };
    const _fi = GP.fieldIncoming;
    GP.fieldIncoming = function (G, total, c) {
      try {
        if (G && G.god && total > 0) {
          const C = { isP: false, vid: G.vid, name: c.vName };
          if (G.god === 'the_between' && !G.gv.phased) {
            const PP = godPlay('the_between').passive || {};
            if ((total >= (c.vHp || 0) || total >= (PP.minFrac || 0.25) * c.vHpMax) && canPay(C, PP.kcal || 100)) {
              G.gv.phased = true; pay(C, PP.kcal || 100);
              c.log.push('  the blow lands where ' + c.vName + ' was. They are simply not there. (Phase Out)');
              tele('god_verb', { god: 'the_between', verb: 'phase_out', who: G.vid, field: true });
              return 0;
            }
          }
          if (G.god === 'market_god' && S.Godhood && S.Godhood.guardAbsorb) {
            // Tactical hits already carry _gvBeamHit. Field fights carry
            // the actual beam component explicitly, including mixed antlers.
            const beam = Math.max(0, Math.min(total, c.beamDamage || 0));
            if (beam > 0 && !G.gv.beamSaid) {
              G.gv.beamSaid = true;
              c.log.push('  the light passes straight through the coins. Wealth does not stop a beam. (Gilded Guard)');
            }
            const gr = S.Godhood.guardAbsorb({ godhood: vGodRec(G.vid) }, total - beam);
            if (gr.absorbed > 0) { c.log.push('  coins flash: the Gilded Guard takes ' + gr.absorbed + '.'); total -= gr.absorbed; }
          }
        }
      } catch (e) { warn('fieldIncoming god', e); }
      return _fi ? _fi.call(this, G, total, c) : total;
    };
    const _fs = GP.fieldAllyShare;
    GP.fieldAllyShare = function (G, share) {
      let s2 = _fs ? _fs.apply(this, arguments) : share;
      try { if (G && G.gv && G.gv.truth && s2 > 0) s2 = Math.round(s2 * (1 - (godPlay('all_seeing').allyDodge || 0.5))); } catch (e) { warn('fieldAllyShare god', e); }
      return s2;
    };
    const _fcd = GP.fieldCheatDeath;
    GP.fieldCheatDeath = function (G, c) {
      const r = _fcd ? _fcd.apply(this, arguments) : null;
      if (r) return r;
      try {
        if (G && G.god === 'unkillable' && !G.gv.phoenix && !Game.state.phoenixLink) {
          const PP = godPlay('unkillable').passive || {};
          const C = { isP: false, vid: G.vid, name: c.vName };
          const living = (Game.phoenixLivingVillagers ? Game.phoenixLivingVillagers() : []).filter(id => id !== G.vid);
          if (living.length && canPay(C, PP.kcal || 500)) {
            G.gv.phoenix = true; pay(C, PP.kcal || 500);
            const victim = living[Math.floor(Math.random() * living.length)];
            c.log.push(c.vName + ' should be dead. The phoenix finds someone else to burn. (Phoenix)');
            Game.phoenixResolveBurn(false, G.vid, victim, {});
            tele('god_verb', { god: 'unkillable', verb: 'phoenix', who: G.vid, burned: victim, field: true });
            return 1;
          }
        }
      } catch (e) { warn('fieldCheatDeath god', e); }
      return r;
    };
    S.Godpath.godVillagerCast = godVillagerCast;
  } else {
    warn('S.Godpath missing: villager casts, strike mults and field fights unwired (load godverbs.js after godpath.js)');
  }
  // strikeMult(game, fi, target): the god's own outgoing-strike terms.
  function strikeMult(game, fi, target) {
    if (!fi) return 1;
    const gid = fighterGod(fi);
    if (!gid) return 1;
    const f = game.tbfight;
    const P = godPlay(gid);
    let m = 1;
    if (gid === 'apex_predator') {
      const T = termsLive(f, fi);
      if (T && T.kind === 'range' && target && cheb(target, fi) >= 2) m *= P.rangeMult || 1.5;
    } else if (gid === 'all_seeing') {
      if (f && f._gv && f._gv.truth && f._gv.truth.key === fi.key && target && target.telegraph) m *= P.strikeMult || 1.5;
    } else if (gid === 'living_garden') {
      m *= P.strikeMult || 0.8;
    }
    return m;
  }

  S.GodVerbs = { holderGod, fighterGod, godPlay, godDaily, godVillagerCast, VERB_IMPL, DAY_IMPL, registerGodActions, marketPick, painPool };
  // the data loads after the scripts (Game.init): register once it's there
  const _init = Game.init;
  if (typeof _init === 'function') {
    Game.init = async function () {
      const r = await _init.apply(this, arguments);
      try { registerGodActions(); } catch (e) { warn('registerGodActions', e); }
      return r;
    };
  }
  if (Game.data && Game.data.godpaths) { try { registerGodActions(); } catch (e) { warn('registerGodActions (eager)', e); } }
})();
