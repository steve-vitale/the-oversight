// @ontology
// system: keepsakes
// description: Keepsake growth (docs/COHERENCE-SPINE.md "Keepsakes: the growth model", Steve 2026-10-14). Keepsakes (class sentimental) are worn in the four accessory slots acc1-acc4 and compete with accessory gear for them. Bond grows ONLY while worn (+1/day, +3 at story moments); in the pack a keepsake is dormant. Levels by bond: L0 <10 nothing, L1 >=10 a small passive from its lane (resolve/anchor/quiet_luck), L2 >=25 a once-per-fight combat action from that lane, L3 >=50 the System's 1-of-3 enhancement offer or its secret evolution. A keepsake whose kin relative was Taken turns its place/name reveal into a clue (the thread home), and Game.keepsakeTakenKin() names those people for the endgame.
// provides:
//   - keepsakeLane(item) -> 'resolve' | 'anchor' | 'quiet_luck'
//   - keepsakeLevel(item) -> 0..3 (by bond; 3 = evolution unlocked)
//   - keepsakePowerLevel(item) -> level its powers answer at (+1 with Keeper's Oath, god-path keeper)
//   - keepsakeLevelText(item) -> short honest line for the item card
//   - keepsakeIsWorn(item) -> boolean (in acc1-acc4)
//   - wornKeepsakes() -> own keepsakes worn in accessory slots
//   - keepsakePassive(lane) -> boolean (an own worn L1+ keepsake of that lane)
//   - equipAccessory(idx, slot?) -> wear a keepsake or accessory (def.slot 'acc') in a free acc slot
//   - keepsakeGrow(r, gain, why) -> bond gain (worn only) + level beats + L3 offer
//   - relicOfferThresholds(r) -> [50] for keepsakes, [10, 25, 50] for other relics
//   - keepsakeActionDef(actionId) / keepsakeActionReady(actionId) / keepsakeActivatables()
//   - keepsakeLuckyBreak(where) -> true when a miss becomes a hit (L2 Lucky Break, L1 quiet luck)
//   - keepsakeHoldsGround(fighter) -> true when forced movement must not move this fighter (L2 Hold)
//   - keepsakeAnchorPursuit() -> extra chaser stamina lost per barrier crossing (anchor L1/L2)
//   - keepsakeTakenKin() -> [{itemId, name, relation, bond, level, clue}]
//   - keepsakeClues() -> [{kind:'place'|'name', itemId, kinName, relation, text}]
//   - migrateKeepsakes() -> idempotent old-save migration
// rules:
//   - worn_only_growth: bond accrues only while the keepsake is worn in acc1-acc4; the pack is dormant (memory intact, no growth) (code: keepsakeGrow, game.js accrueRelicBond, Steve 2026-10-14 STEVE-ANSWERS "Sentimental items need to compete with accessory gear")
//   - shared_slots: keepsakes and accessory gear share the same four slots; a full set refuses with an explanation, never silently swaps (code: equipAccessory)
//   - unequip_keeps_bond: taking a keepsake off moves the whole instance back to the pack — bond, enhancements, reveals intact (code: unequip wrap)
//   - levels: L1 bond>=10 passive, L2 bond>=25 action, L3 bond>=50 evolution offer; keepsakes no longer get offers at 10/25 (code: KS_LEVELS, relicOfferThresholds)
//   - powers_worn_only: L1 passives, L2 actions and L3 enhancements of a keepsake work only while it is worn and only for its owner (code: keepsakePassive, keepsakeActionReady, game.js hasRelicEnhancement)
//   - once_per_fight: each keepsake action fires once per fight; state lives on the fight object so it never leaks (code: tbfight.ksUsed)
//   - thread_home: a keepsake whose kin relative (player lifeseed) was Taken records the link; its place/name reveal becomes a clue (code: keepsakeThreadCheck, keepsakeTakenKin)
//   - old_saves: chosen enhancements survive; old 10/25 offers stay chosen; up to four keepsakes are auto-worn into free accessory slots so nothing goes dormant on load (code: migrateKeepsakes)
// consumes:
//   - relicItems, offerRelicEnhancement, playFlashback, isKeepsake, itemDef (game.js / progression.js)
//   - takenKinOf, lifeseedKin, vpOf (lifeseed.js / conversation.js)
//   - worldKinEntry, worldRegionName (world.js)
//   - cureStatus, tbfight, tbFighter (statusEffects.js / game.js)
//   - useAbility, _actionAvailable (abilityActions.js; impls registered on its published impl/precheck tables)
(function () {
  'use strict';
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const ACC = ['acc1', 'acc2', 'acc3', 'acc4'];
  // Bond needed per level (COHERENCE-SPINE.md table).
  const KS_LEVELS = [0, 10, 25, 50];

  // LANES: which pool each keepsake grows along. Authored here (not in the
  // hot items.json) from each keepsake's own story and enhancement offers;
  // def.keepsakeLane in data wins if it is ever added. Unlisted keepsakes
  // default to resolve (30 keepsakes already reveal "+resolve").
  //   anchor     — home, ground, a place to get back to
  //   quiet_luck — small things breaking your way
  //   resolve    — holding together
  const LANE_BY_ID = {
    mothers_ring: 'anchor', tote_bag: 'anchor', bus_schedule: 'anchor', locket: 'anchor',
    trail_compass: 'anchor', home_key: 'anchor', boot_stone: 'anchor', winter_coat_button: 'anchor',
    bus_map: 'anchor', dog_tags: 'anchor', thermos: 'anchor',
    lucky_coin: 'quiet_luck', search_locket: 'quiet_luck', knife_roll: 'quiet_luck',
    buskers_harmonica: 'quiet_luck', mixtape: 'quiet_luck', hard_candy: 'quiet_luck',
    paperback: 'quiet_luck', dead_phone: 'quiet_luck', energy_bar_wrapper: 'quiet_luck',
    photo_album: 'quiet_luck',
  };

  const LANES = {
    resolve: {
      label: 'resolve',
      passive: 'trauma lands a quarter lighter',
      action: 'steady',
    },
    anchor: {
      label: 'anchor',
      passive: 'chasers tire faster when you flee',
      action: 'hold',
    },
    quiet_luck: {
      label: 'quiet luck',
      passive: '1 in 5 misses lands anyway',
      action: 'lucky_break',
    },
  };

  // L2 ACTIONS: same shape as abilities.json actions, run through
  // Game.useAbility('keepsake', id). Small kcal cost; the tap is your turn
  // (the combat bar treats every ability tap as the action).
  const ACTIONS = {
    steady: {
      id: 'steady', lane: 'resolve', context: 'combat', name: 'Steady',
      cost: { turn: true, kcal: 40 },
      effect: 'Hold it and breathe: clear fear and stun on yourself. Once per fight.',
    },
    hold: {
      id: 'hold', lane: 'anchor', context: 'combat', name: 'Hold',
      cost: { turn: true, kcal: 40 },
      effect: 'Nothing moves you this fight, and your next flee through the edge cannot be cut off (the relentless still follow). Once per fight.',
    },
    lucky_break: {
      id: 'lucky_break', lane: 'quiet_luck', context: 'combat', name: 'Lucky Break',
      cost: { turn: true, kcal: 40 },
      effect: 'Your next miss this fight becomes a hit. Once per fight.',
    },
  };

  function warn(msg) {
    try { if (typeof console !== 'undefined') console.warn('[keepsakes] ' + msg); } catch (e2) { /* console gone: nothing left to tell */ }
  }

  const methods = {
    // ---------- identity ----------
    keepsakeLane(item) {
      try {
        const def = this.itemDef ? this.itemDef(item) : {};
        if (def.keepsakeLane && LANES[def.keepsakeLane]) return def.keepsakeLane;
        return LANE_BY_ID[def.id || (item && (item.itemId || item.id))] || 'resolve';
      } catch (e) { warn('keepsakeLane: ' + e.message); return 'resolve'; }
    },
    keepsakeLevel(item) {
      if (!item || !(this.isKeepsake && this.isKeepsake(item))) return 0;
      const b = item.bond || 0;
      let lv = 0;
      for (let i = 1; i < KS_LEVELS.length; i++) if (b >= KS_LEVELS[i]) lv = i;
      return lv;
    },
    // keepsakePowerLevel(item): the level its POWERS answer at. Keeper's
    // Oath (caregiver/keeper payoff, god-path 2026-10-14) lifts every worn
    // keepsake one level (cap 3); growth, beats and offers still read the
    // true bond level (keepsakeLevel).
    keepsakePowerLevel(item) {
      const lv = this.keepsakeLevel(item);
      try {
        if (item && this.hasAbility && this.hasAbility('keepers_oath')) return Math.min(3, lv + 1);
      } catch (e) { warn('keepsakePowerLevel: ' + e.message); }
      return lv;
    },
    keepsakeLevelText(item) {
      try {
        const lv = this.keepsakeLevel(item);
        const lane = LANES[this.keepsakeLane(item)];
        const worn = this.keepsakeIsWorn(item);
        const next = KS_LEVELS[Math.min(3, lv + 1)];
        const parts = [`Keepsake level ${lv}/3 (bond ${item.bond || 0}${lv < 3 ? ', next at ' + next : ''})`];
        if (lv >= 1) parts.push(`L1 ${lane.label}: ${lane.passive}`);
        if (lv >= 2) parts.push(`L2 action: ${ACTIONS[lane.action].name}`);
        if (lv >= 3) parts.push('L3: evolved');
        parts.push(worn ? 'worn: growing' : 'in the pack: dormant');
        return parts.join(' · ');
      } catch (e) { warn('keepsakeLevelText: ' + e.message); return ''; }
    },
    keepsakeIsWorn(item) {
      if (!item) return false;
      const eq = (this.state.scholar || {}).equipped || {};
      for (const sl of ACC) if (eq[sl] === item) return true;
      return false;
    },
    // keepsakeMine: the owner-lock (Steve 2026-10-09) — a stranger's keepsake
    // in your hands is just stuff. Same grammar as accrueRelicBond.
    keepsakeMine(item) {
      try {
        const id = item.itemId || item.id;
        const owner = item.owner || (((this.getPerson && this.getPerson(this.villagerId)) || {}).keepsakeOwner || {})[id];
        return !owner || owner === this.villagerId;
      } catch (e) { warn('keepsakeMine: ' + e.message); return true; }
    },
    wornKeepsakes() {
      const eq = (this.state.scholar || {}).equipped || {};
      const out = [];
      for (const sl of ACC) {
        const it = eq[sl];
        if (it && this.isKeepsake(it) && this.keepsakeMine(it)) out.push(it);
      }
      return out;
    },
    keepsakePassive(lane) {
      try {
        return this.wornKeepsakes().some(it => this.keepsakePowerLevel(it) >= 1 && this.keepsakeLane(it) === lane);
      } catch (e) { warn('keepsakePassive: ' + e.message); return false; }
    },

    // ---------- the slot competition ----------
    // equipAccessory(idx, slot?): wear a keepsake or an accessory (data
    // slot 'acc') in a free acc slot. All four full: refuse and say so —
    // the competition is a decision, never a silent swap.
    equipAccessory(idx, slot) {
      const s = this.state.scholar;
      const inv = s.inventory || [];
      const item = inv[idx];
      if (!item) return null;
      const def = this.itemDef(item);
      const keepsake = this.isKeepsake(item);
      if (!keepsake && !(def && (def.slot === 'acc' || ACC.indexOf(def.slot) !== -1))) {
        this.say("That isn't something you wear as an accessory.");
        return null;
      }
      s.equipped = s.equipped || {};
      let target = (slot && ACC.indexOf(slot) !== -1) ? slot : null;
      if (target && s.equipped[target]) { this.say(`Your ${target} slot is taken — take that off first.`); return null; }
      if (!target) target = ACC.find(sl => !s.equipped[sl]) || null;
      if (!target) {
        this.say('All four accessory slots are full. Keepsakes and accessories share the same four — take one off first.');
        return null;
      }
      // The whole instance moves: bond, enhancements, reveals, owner.
      const worn = Object.assign({}, item, { itemId: def.id || item.itemId || item.id, name: item.name || def.name, units: 1, accessory: true });
      if ((item.units || 1) > 1) item.units -= 1; else inv.splice(idx, 1);
      s.equipped[target] = worn;
      const used = ACC.filter(sl => s.equipped[sl]).length;
      this.say(keepsake
        ? `You wear the ${worn.name} close. (accessory ${used}/4 — worn keepsakes grow; in the pack they only remember)`
        : `You put on the ${worn.name}. (accessory ${used}/4)`);
      return target;
    },

    // ---------- growth ----------
    relicOfferThresholds(r) {
      return (this.isKeepsake && this.isKeepsake(r)) ? [KS_LEVELS[3]] : [10, 25, 50];
    },
    // keepsakeGrow(r, gain, why): the one place keepsake bond moves. Worn
    // and yours, or nothing happens (dormant). Fires the level beats and the
    // L3 offer. Returns the gain actually applied.
    keepsakeGrow(r, gain, why) {
      try {
        if (!r || !gain) return 0;
        if (!this.isKeepsake(r)) return 0;
        if (!this.keepsakeIsWorn(r)) return 0;
        if (!this.keepsakeMine(r)) return 0;
        const before = this.keepsakeLevel(r);
        // MOURNER'S BOND (caregiver/keeper, god-path 2026-10-14): grief is
        // attention — keepsake.bond_mult scales the growth.
        try { gain = Math.max(1, Math.round(this.modTarget('keepsake.bond_mult', gain, {}))); } catch (e) { warn('bond_mult: ' + e.message); }
        r.bond = (r.bond || 0) + gain;
        const after = this.keepsakeLevel(r);
        try { if (this.checkKeepsakeReveal) this.checkKeepsakeReveal(r); } catch (e) { warn('reveal: ' + e.message); }
        if (after > before) this.keepsakeLevelBeat(r, before, after);
        this.keepsakeMaybeOffer(r);
        return gain;
      } catch (e) { warn('keepsakeGrow: ' + e.message); return 0; }
    },
    keepsakeMaybeOffer(r) {
      const s = this.state.scholar;
      if (!this.state.systemArrived || s.relicChoices) return false;
      for (const t of this.relicOfferThresholds(r)) {
        if ((r.bond || 0) >= t && !(r.bondOffered || []).includes(t)) {
          this.offerRelicEnhancement(r, t);
          return true;
        }
      }
      return false;
    },
    keepsakeLevelBeat(r, before, after) {
      const nm = r.name || 'it';
      const lane = LANES[this.keepsakeLane(r)];
      for (let lv = before + 1; lv <= after; lv++) {
        if (lv === 1) {
          // The memory opens (the flashback + its reveal), once per item.
          try {
            if (!r.flashbackPlayed && this.playFlashback) {
              r.flashbackPlayed = true;
              this.playFlashback(r, this.itemDef(r));
            }
          } catch (e) { warn('flashback: ' + e.message); }
          this.keepsakeThreadCheck(r);
          this.say(`💛 The ${nm} is starting to do something. (Keepsake L1 — ${lane.label}: ${lane.passive}, while worn.)`);
        } else if (lv === 2) {
          const a = ACTIONS[lane.action];
          this.say(`💛 The ${nm} has become something you can reach for. (Keepsake L2 — new combat action: ${a.name}. ${a.effect})`);
        }
        // L3 is the System's offer (keepsakeMaybeOffer) — it speaks for itself.
      }
      r.ksLevelSeen = Math.max(r.ksLevelSeen || 0, after);
    },

    // ---------- the thread home ----------
    // keepsakeKinPerson(item): the player's lifeseed person this keepsake
    // belongs to, or null.
    keepsakeKinPerson(item) {
      try {
        const def = this.itemDef(item);
        if (!def.kin || def.kin === 'none') return null;
        if (item.memoryOf) return null; // a dead villager's keepsake: their kin, not yours
        if (!this.keepsakeMine(item)) return null;
        const vp = this.vpOf ? this.vpOf(this.villagerId) : null;
        const people = (vp && vp.lifeseed && vp.lifeseed.people) || [];
        return people.find(p => p.relation === def.kin) || null;
      } catch (e) { warn('keepsakeKinPerson: ' + e.message); return null; }
    },
    keepsakeKinTaken(item) {
      const p = this.keepsakeKinPerson(item);
      if (!p) return null;
      // Same test as lifeseed.js takenKinOf — one definition of "Taken".
      let taken = [];
      try { taken = this.takenKinOf ? this.takenKinOf(this.villagerId) : []; } catch (e) { warn('takenKinOf: ' + e.message); }
      return taken.some(t => t.name === p.name && t.relation === p.relation) ? p : null;
    },
    // keepsakeThreadCheck(r): record the link (item -> taken person) and
    // turn a place/name reveal into a clue. Idempotent.
    keepsakeThreadCheck(r) {
      try {
        const p = this.keepsakeKinTaken(r);
        if (!p) return false;
        const first = String(p.name || '').split(' ')[0] || 'them';
        r.takenKin = { name: p.name, relation: p.relation };
        // WORLD (docs/WORLD-REGIONS.md §5): the kin has a place in the world
        // registry. The region rides along hidden; keepsakeClues names it
        // only once the village has heard of that region.
        let kinRegion = null;
        try { const wk = this.worldKinEntry ? this.worldKinEntry(this.villagerId, p) : null; kinRegion = wk ? wk.region : null; } catch (e) { warn('worldKinEntry: ' + e.message); }
        if (kinRegion) r.takenKin.region = kinRegion;
        const def = this.itemDef(r);
        const rev = def.reveals || null;
        const st = this.state;
        st.keepsakeThread = st.keepsakeThread || { clues: [] };
        const clues = st.keepsakeThread.clues;
        if (rev && (rev.type === 'place' || rev.type === 'name') && !clues.some(c => c.itemId === def.id)) {
          if (rev.type === 'place') {
            const cx = st.codex = st.codex || {};
            cx.places = cx.places || [];
            let e = cx.places.find(x => x.id === rev.id);
            if (!e) { e = { id: rev.id, note: rev.note || '' }; cx.places.push(e); }
            e.clue = true; e.kin = p.name; e.relation = p.relation; e.itemId = def.id;
            clues.push({ kind: 'place', itemId: def.id, placeId: rev.id, kinName: p.name, relation: p.relation, region: kinRegion,
              text: `${first} was Taken. The ${r.name || def.name} remembers a place: ${rev.note || rev.id}` });
          } else {
            const pg = this.progState ? this.progState() : null;
            if (pg) {
              pg.seeking = pg.seeking || [];
              let e = pg.seeking.find(x => x.id === rev.id);
              if (!e) { e = { id: rev.id, note: rev.note || '' }; pg.seeking.push(e); }
              e.name = p.name; e.relation = p.relation; e.taken = true; e.itemId = def.id;
            }
            clues.push({ kind: 'name', itemId: def.id, kinName: p.name, relation: p.relation, region: kinRegion,
              text: `Seek ${p.name} — your ${p.relation}, Taken at the Scattering. The ${r.name || def.name} still says their name.` });
          }
          this.say(`🧵 THE THREAD HOME — ${clues[clues.length - 1].text}`);
          try { if (this.recordMoment) this.recordMoment(`A keepsake became a clue: ${p.name}.`); } catch (e) { warn('recordMoment: ' + e.message); }
        }
        return true;
      } catch (e) { warn('keepsakeThreadCheck: ' + e.message); return false; }
    },
    // keepsakeTakenKin(): every keepsake you own (worn or pack) whose kin
    // relative was Taken. For THE HOSTS / the Table: the people your bonded
    // keepsakes belong to come home by name.
    keepsakeTakenKin() {
      const out = [];
      try {
        const s = this.state.scholar || {};
        const all = (s.inventory || []).filter(i => i && this.isKeepsake(i));
        for (const sl of Object.keys(s.equipped || {})) {
          const it = s.equipped[sl];
          if (it && this.isKeepsake(it)) all.push(it);
        }
        const clues = ((this.state.keepsakeThread || {}).clues) || [];
        for (const it of all) {
          const p = this.keepsakeKinTaken(it);
          if (!p) continue;
          const id = it.itemId || it.id;
          out.push({ itemId: id, name: p.name, relation: p.relation, bond: it.bond || 0,
            level: this.keepsakeLevel(it), clue: clues.some(c => c.itemId === id) });
        }
      } catch (e) { warn('keepsakeTakenKin: ' + e.message); }
      return out;
    },
    // keepsakeClues(): the thread-home clues. A clue's kin region (world
    // registry) is named (regionName) only once that region is known.
    keepsakeClues() {
      const clues = (((this.state || {}).keepsakeThread || {}).clues || []).slice();
      const regs = (((this.state || {}).world || {}).regions) || {};
      return clues.map(c => {
        if (!c || !c.region || !(regs[c.region] && regs[c.region].known)) return c;
        const name = this.worldRegionName ? this.worldRegionName(c.region) : c.region;
        return Object.assign({}, c, { regionName: name, text: c.text + ` Last trace: ${name}.` });
      });
    },

    // ---------- L1 passives (hooks) ----------
    // quiet luck: L2 Lucky Break turns the next miss into a hit; L1 gives a
    // 1-in-5 chance on any miss. Called at each player-miss site.
    keepsakeLuckyBreak(where) {
      try {
        const f = this.tbfight;
        if (f && f.ksLucky) {
          f.ksLucky = false;
          this.say(`🍀 Lucky Break — it should have missed. It didn't. (keepsake${where ? ', ' + where : ''})`);
          return true;
        }
        if (this.keepsakePassive('quiet_luck') && Math.random() < 0.2) {
          this.say('🍀 Quiet luck — the miss lands anyway. Small things break your way. (keepsake)');
          return true;
        }
      } catch (e) { warn('keepsakeLuckyBreak: ' + e.message); }
      return false;
    },
    keepsakeHoldsGround(fighter) {
      try {
        const f = this.tbfight;
        if (!f || !f.ksHold) return false;
        if (fighter && fighter.kind && fighter.kind !== 'player') return false;
        this.say('⚓ Hold — your feet stay planted. Nothing moves you. (keepsake)');
        return true;
      } catch (e) { warn('keepsakeHoldsGround: ' + e.message); return false; }
    },
    keepsakeAnchorPursuit() {
      try {
        const f = this.tbfight;
        if (f && f.ksHold) return 99; // L2 Hold: the flee can't be cut off
        return this.keepsakePassive('anchor') ? 1 : 0;
      } catch (e) { warn('keepsakeAnchorPursuit: ' + e.message); return 0; }
    },

    // ---------- L2 actions (bridged into abilityActions.js) ----------
    keepsakeActionDef(actionId) {
      const a = ACTIONS[actionId];
      if (!a) return null;
      return { ability: { id: 'keepsake', name: 'Keepsake' }, action: a };
    },
    // keepsakeActionReady(actionId): the worn keepsake that grants it, or null.
    keepsakeActionReady(actionId) {
      const a = ACTIONS[actionId];
      if (!a) return null;
      return this.wornKeepsakes().find(it => this.keepsakePowerLevel(it) >= 2 && this.keepsakeLane(it) === a.lane) || null;
    },
    keepsakeActivatables() {
      const out = [];
      try {
        const inCombat = this.inCombat && this.inCombat();
        if (!inCombat) return out;
        const seen = {};
        for (const it of this.wornKeepsakes()) {
          if (this.keepsakePowerLevel(it) < 2) continue;
          const a = ACTIONS[LANES[this.keepsakeLane(it)].action];
          if (seen[a.id]) continue;
          seen[a.id] = 1;
          const avail = this._actionAvailable ? this._actionAvailable('keepsake', a) : { ok: true };
          out.push({
            abilityId: 'keepsake', actionId: a.id, id: 'keepsake.' + a.id, target: 'none',
            name: `${a.name} (${it.name || 'keepsake'})`, desc: a.effect, context: 'combat',
            cost: a.cost, available: avail.ok, why: avail.why || null, combat: true, keepsake: true,
          });
        }
      } catch (e) { warn('keepsakeActivatables: ' + e.message); }
      return out;
    },

    // ---------- old saves ----------
    // migrateKeepsakes(): idempotent. Old saves grew keepsakes in the pack
    // and offered enhancements at 10/25/50. Keep every chosen enhancement
    // and every recorded offer; mark already-played flashbacks and seen
    // levels so nothing re-fires; wear up to four keepsakes (highest bond
    // first) in free accessory slots so the growth and the enhancements
    // they already earned do not go dormant on load.
    migrateKeepsakes() {
      try {
        const s = this.state && this.state.scholar;
        if (!s) return false;
        const all = (s.inventory || []).filter(i => i && this.isKeepsake(i));
        for (const sl of ACC) if (s.equipped && s.equipped[sl] && this.isKeepsake(s.equipped[sl])) all.push(s.equipped[sl]);
        for (const it of all) {
          it.enhancements = it.enhancements || [];
          it.bondOffered = it.bondOffered || [];
          if (it.bondOffered.length && !it.flashbackPlayed) it.flashbackPlayed = true;
          if (it.ksLevelSeen == null) it.ksLevelSeen = this.keepsakeLevel(it);
        }
        if (s.ksGrowthV >= 1) return false;
        s.ksGrowthV = 1;
        s.equipped = s.equipped || {};
        const pack = (s.inventory || []).map((it, idx) => ({ it, idx }))
          .filter(x => x.it && this.isKeepsake(x.it) && this.keepsakeMine(x.it))
          .sort((a, b) => (b.it.bond || 0) - (a.it.bond || 0));
        const free = ACC.filter(sl => !s.equipped[sl]);
        const picked = pack.slice(0, free.length);
        // splice from the back so indices stay valid
        picked.sort((a, b) => b.idx - a.idx);
        const _say = this.say;
        this.say = function () {}; // migration is bookkeeping, not a scene
        try {
          for (const x of picked) this.equipAccessory(x.idx);
        } finally { this.say = _say; }
        return true;
      } catch (e) { warn('migrateKeepsakes: ' + e.message); return false; }
    },
  };

  Object.assign(Game, methods);

  // ---------- engine bridges ----------
  const IMPLS = globalThis.AbilityActionImpls;
  const PRE = globalThis.AbilityActionPrechecks;
  function onceFight(id) {
    return function (game) {
      const f = game.tbfight;
      if (!f || f.over) return { ok: false, why: 'No fight.' };
      if ((f.ksUsed || {})[id]) return { ok: false, why: 'Already used this fight.' };
      if (!game.keepsakeActionReady(id)) return { ok: false, why: 'No worn keepsake strong enough.' };
      return { ok: true };
    };
  }
  if (PRE) {
    PRE['keepsake.steady'] = onceFight('steady');
    PRE['keepsake.hold'] = onceFight('hold');
    PRE['keepsake.lucky_break'] = onceFight('lucky_break');
  }
  function mark(game, id) {
    const f = game.tbfight;
    f.ksUsed = f.ksUsed || {};
    f.ksUsed[id] = true;
    const it = game.keepsakeActionReady(id);
    return (it && it.name) || 'keepsake';
  }
  if (IMPLS) {
    IMPLS['keepsake.steady'] = function (game) {
      const nm = mark(game, 'steady');
      const pf = game.tbFighter ? game.tbFighter('p') : null;
      const cleared = [];
      ['fear', 'stun', 'stun_full'].forEach(function (id) {
        try { if (game.cureStatus && game.cureStatus(pf || 'scholar', id, 'Steady')) cleared.push(id); }
        catch (e) { warn('steady cure ' + id + ': ' + e.message); }
      });
      if (pf && (pf.stunned || pf.stunFull)) { pf.stunned = 0; pf.stunFull = 0; if (cleared.indexOf('stun') === -1) cleared.push('stun'); }
      game.say(`💛 You close your hand around the ${nm}. Breathe. ` +
        (cleared.length ? 'The fear lets go; your feet are yours again. ' : 'Nothing had hold of you — but you are steadier for it. ') + '(Steady)');
      return true;
    };
    IMPLS['keepsake.hold'] = function (game) {
      const nm = mark(game, 'hold');
      game.tbfight.ksHold = true;
      game.say(`⚓ You touch the ${nm} and remember the way home. Nothing moves you this fight, and the edge will let you go. (Hold)`);
      return true;
    };
    IMPLS['keepsake.lucky_break'] = function (game) {
      const nm = mark(game, 'lucky_break');
      game.tbfight.ksLucky = true;
      game.say(`🍀 You rub the ${nm}. Your next miss this fight will land. (Lucky Break)`);
      return true;
    };
  } else {
    warn('AbilityActionImpls missing — keepsake actions unwired (load keepsakes.js after abilityActions.js)');
  }

  // activatableAbilities: keepsake actions sit with the other combat actions.
  const _acts = Game.activatableAbilities;
  Game.activatableAbilities = function () {
    const out = _acts ? (_acts.apply(this, arguments) || []) : [];
    try { return out.concat(this.keepsakeActivatables()); }
    catch (e) { warn('activatableAbilities: ' + e.message); return out; }
  };

  // equip: an accessory slot routes to equipAccessory.
  const _equip = Game.equip;
  Game.equip = function (itemIdx, slot) {
    if (ACC.indexOf(slot) !== -1) return this.equipAccessory(itemIdx, slot);
    return _equip.call(this, itemIdx, slot);
  };
  // unequip: an accessory comes off whole — bond, enhancements, reveals.
  const _unequip = Game.unequip;
  Game.unequip = function (slot) {
    const s = this.state.scholar;
    const eq = (s.equipped || {})[slot];
    if (eq && eq.accessory) {
      const back = Object.assign({}, eq);
      delete back.accessory;
      s.inventory.push(back);
      delete s.equipped[slot];
      this.say(this.isKeepsake(back)
        ? `You take off the ${back.name} and pack it away. It keeps its memory, but it won't grow in the pack.`
        : `Unequipped ${back.name}.`);
      return null;
    }
    return _unequip.call(this, slot);
  };

  // resolve L1: a floor under trauma — each blow lands a quarter lighter
  // (at least 1 point off anything of 2+).
  const _addTrauma = Game.addTrauma;
  Game.addTrauma = function (n) {
    let amt = (n == null) ? 5 : n;
    try {
      if (amt >= 2 && this.keepsakePassive('resolve')) {
        const cut = Math.max(1, Math.round(amt * 0.25));
        amt -= cut;
        if (!this._ksResolveToldDay || this._ksResolveToldDay !== (this.state.scholar || {}).day) {
          this._ksResolveToldDay = (this.state.scholar || {}).day;
          const it = this.wornKeepsakes().find(x => this.keepsakeLane(x) === 'resolve' && this.keepsakeLevel(x) >= 1);
          this.say(`💛 The ${it ? it.name : 'keepsake'} against your chest. It still hurts — a little less. (resolve: −${cut} trauma)`);
        }
      }
    } catch (e) { warn('addTrauma: ' + e.message); }
    return _addTrauma.call(this, amt);
  };

  // New runs: your keepsakes start worn (free accessory slots, highest bond
  // first) — the opening gamble is already around your neck.
  const _newGame = Game.newGame;
  Game.newGame = function () {
    const r = _newGame.apply(this, arguments);
    try { this.migrateKeepsakes(); } catch (e) { warn('newGame migrate: ' + e.message); }
    return r;
  };
  const _load = Game.load;
  Game.load = function () {
    const r = _load.apply(this, arguments);
    try { if (r !== false) this.migrateKeepsakes(); } catch (e) { warn('load migrate: ' + e.message); }
    return r;
  };
})();
