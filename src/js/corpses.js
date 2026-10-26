// @ontology
// system: corpses
// description: Corpse system. Dead bodies persist, can be butchered, buried, or left.
// provides:
//   - buryCorpse(cid)
//   - corpseAt(x, y)
//   - corpseDesc(c)
//   - examineCorpse(cid)
//   - lootCorpse(cid)
//   - corpseTakeItem(cid, idx)
//   - corpseUseItem(cid, idx)
//   - corpseEatItem(cid, idx)
//   - registerDeath(vid, cause)
//   - corpseStage(c)
//   - corpseIsPerson(c): 'person' + 'villager' kinds are sapient dead (Steve 2026-10-09)
//   - corpseGlyph(c)
//   - knowsDeath(vid)
//   - generatePossessions(vid)
//   - payRespects(cid)
//   - codexDeathSync()
//   - recoverBearer(): overnight, the village recovers the dead bearer's body to the fire and digs the grave; burial stays the successor's act (journey-succession r9 2026-10-12)
// rules:
//   - the_village_brings_its_bearer_home: the death beat's "somebody else starts digging" is real — one day after the bearer's death the village recovers the body to the fire and digs the grave (v.pendingBurials, fired from endDay). The death pack rides home on the corpse; the filling of the grave is the successor's (code: recoverBearer, Steve's loot-as-action law untouched)
//   - sapient_dead_carry_their_gear: villager corpses hold the dead person's actual carried + stashed gear as the lootable death pack — nothing auto-transfers (code: generatePossessions, Steve 2026-10-09)
//   - sentimentals_die_with_them: sentimental items are buried with the body, never lootable, and grant no bond to non-owners (code: generatePossessions, Steve 2026-10-09)
//   - hide_handling_teaches: taking an animal hide (corpse loot per-item or batch, butchering a carcass, taking rawhide from the stash) teaches hide_armor L1 — handling the material teaches the shape, breaking the hide_armor circular dependency (code: noteHideHandled, 2026-10-13; predicate + butcher/stash wiring 2026-10-16)
//   - ash_pile: a phoenix victim's corpse is flagged ash -- no body, no decay, no disease, no trauma (ashes aren't gross); carried gear ONLY (never stashed) as the lootable pack; pocketing it fires loot_ash (amplified theft; worse still when the bearer takes their own victim's gear); the ash description states the village norm (code: phoenixAshDeath/phoenixAshGearPack in game.js, Steve 2026-10-09)
// consumes:
//   - state.corpses
/* CORPSE SYSTEM
 *
 * Steve's design: "One of the most essential parts of knowledge is confirming
 * the knowledge of death." Death is knowledge — and bodies persist.
 *
 * 1. CORPSES PERSIST — when a person or monster dies, a corpse entity stays at
 *    the location: who it was, what they carried, when they died.
 * 2. REAL-TIME DECAY — fresh -> stiff -> bloating -> rotting -> bones, on the
 *    game clock. Each stage changes the description, what's lootable, disease
 *    risk, and grossness.
 * 3. LOOTING HAS WEIGHT — bodies are lootable, but looting the dead costs
 *    trauma scaled by how well you knew them and how fresh they are. The
 *    existing trauma system carries it; no second system. Fresh is worse
 *    mentally, safer physically; rotten is the reverse.
 * 4. DISEASE FROM ROT — handling bloating+ corpses risks illness (existing
 *    disease pattern: honest roll, health damage, a message).
 * 5. DEATH IS KNOWLEDGE — confirming a death is a knowledge event. Early you
 *    learn by witnessing, finding the body, or being told. When the codex
 *    reaches attunement 2, death knowledge syncs in real time — the codex
 *    just knows, no checking or asking required.
 * 6. PARTY AUTO-NOTIFY — party members' deaths tell you immediately.
 * 7. SOCIAL CONSEQUENCES — looting a fresh person-corpse where others can see
 *    costs trust and seeds gossip. The village watches.
 *
 * Humane, not edgy: the grossness serves weight. Death should feel like
 * death, not a loot pinata. No gore for gore's sake; the horror is recognition.
 *
 * Self-attaching module: attaches methods to Game. game.js gets tiny hooks
 * in tbDamage's death branches (marked CORPSE SYSTEM). app.js renders corpse
 * glyphs + cell-tap actions. index.html loads this after food.js.
 */
(function () {
  'use strict';
  const G = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.Game)
    ? globalThis.Scattering.Game
    : (typeof Game !== 'undefined' ? Game : null);
  if (!G) return;

  // ---------- decay ----------

  // stages by days since death. Real time = game clock.
  var STAGES = [
    { id: 'fresh',    until: 1, diseaseP: 0.02, diseaseDmg: 4,  traumaMult: 1.5,
      glyphPerson: '😔', glyphMonster: '👹', glyphAnimal: '🐾' },
    { id: 'stiff',    until: 2, diseaseP: 0.05, diseaseDmg: 6,  traumaMult: 1.25,
      glyphPerson: '😔', glyphMonster: '👹', glyphAnimal: '🐾' },
    { id: 'bloating', until: 4, diseaseP: 0.15, diseaseDmg: 10, traumaMult: 1.0,
      glyphPerson: '😵', glyphMonster: '💀', glyphAnimal: '💀' },
    { id: 'rotting',  until: 8, diseaseP: 0.25, diseaseDmg: 14, traumaMult: 0.7,
      glyphPerson: '😵', glyphMonster: '💀', glyphAnimal: '💀' },
    { id: 'bones',    until: 1e9, diseaseP: 0.03, diseaseDmg: 4, traumaMult: 0.4,
      glyphPerson: '🦴', glyphMonster: '🦴', glyphAnimal: '🦴' },
  ];

  var methods = {

    // ---------- storage ----------

    corpses() {
      this.state.corpses = this.state.corpses || [];
      return this.state.corpses;
    },

    corpseStage(c) {
      if (c.ash) return 0; // ASH (Steve 2026-10-09): ashes don't decay. No rot, ever.
      const days = (this.state.scholar.day || 0) - (c.dayDied || 0);
      for (let i = 0; i < STAGES.length; i++) {
        if (days < STAGES[i].until) return i;
      }
      return STAGES.length - 1;
    },

    corpseStageInfo(c) { return STAGES[this.corpseStage(c)]; },

    corpseAt(cx, cy) {
      const px = this.map.px, py = this.map.py;
      return this.corpses().filter(c =>
        !c.buried && c.node.x === px && c.node.y === py && c.mx === cx && c.my === cy);
    },

    // corpseIsPerson: 'person' and 'villager' kinds are both sapient dead.
    // Every villager death registers kind 'villager' (starvation, thirst,
    // wounds, player death, phoenix) -- bare kind === 'person' gates missed
    // them all: no witness path, wrong glyph, wrong voice. (Steve 2026-10-09)
    corpseIsPerson(c) {
      return !!c && (c.kind === 'person' || c.kind === 'villager');
    },

    corpseGlyph(c) {
      if (c.ash) return '⚱️'; // ASH (Steve 2026-10-09): a pile of ashes, not a body.
      const st = this.corpseStageInfo(c);
      if (this.corpseIsPerson(c)) return st.glyphPerson;
      if (c.kind === 'monster') return st.glyphMonster;
      return st.glyphAnimal;
    },

    // ---------- death registration ----------

    // fightWitnesses: who's alive and present when someone dies in combat.
    // Villagers in the fight + the player (you saw it happen).
    fightWitnesses(excludeVid) {
      const out = [];
      try {
        const f = this.tbfight;
        if (!f) return out;
        for (const o of f.fighters) {
          if (!o.alive || o.fled) continue;
          if (o.kind === 'villager' && o.villagerId && o.villagerId !== excludeVid) out.push(o.villagerId);
        }
        // you were there
        if (this.villagerId && this.villagerId !== excludeVid) out.push(this.villagerId);
      } catch (e) {}
      return out;
    },

    // registerDeath: THE hook. Call whenever someone/something dies.
    // opts: {kind:'person'|'monster'|'animal', villagerId?, monsterId?, monsterName?,
    //        name, mx, my, cause, killerId?, items?}
    registerDeath(opts) {
      opts = opts || {};
      // DOUBLE-DEATH GUARD (journey-social 2026-10-11): two systems can both
      // process the same death (observed: a field-fight kill and a disease
      // tick on the same day → two fallen entries, two corpses, double
      // grief/gossip/tele). A villager dies once — the second registration
      // is a no-op. (The phoenix link carries its own guard for the same
      // class; this is the choke point for everything else.)
      if (opts.villagerId) {
        try {
          const vv = this.state.village || {};
          vv.deathSeen = vv.deathSeen || {};
          if (vv.deathSeen[opts.villagerId]) {
            // TELEFLAG (2026-10-16, sim-findings #400/#403): key player deaths
            // BEFORE the no-op decision. A villager-death path can register the
            // scholar's death before playerDeath does (observed belongfeast-s529):
            // the guard then no-ops playerDeath's registerDeath call and the
            // death tele would never carry player:true. Record the flag before
            // the no-op: repair the already-fired death tele in place so it
            // carries player:true. Still exactly one registration, one corpse,
            // one fallen entry, one death tele — no double-counting. (The sim
            // harness's live death capture reads player lazily off the tele
            // record, so the repair is visible to harness teles too.)
            if (opts.player) {
              try {
                const tel = this.state.telemetry || [];
                for (let i = tel.length - 1; i >= 0; i--) {
                  const e = tel[i];
                  if (e && e.type === 'death' && String(e.who) === String(opts.villagerId)) { e.player = true; break; }
                }
              } catch (e2) {}
            }
            return null;
          }
          vv.deathSeen[opts.villagerId] = (this.state.scholar || {}).day || 0;
        } catch (e) {}
      }
      // AUDIO (Steve 2026-10-12): a person's death is a moment — the knock.
      // Fires once per death (guarded above). Monster deaths already voice
      // at the kill site (monsterDown/deathAudio); this is for people.
      if (opts.kind === 'person' || opts.kind === 'villager') {
        try { this.audioEvent('villagerDeath'); } catch (e) {}
        // UNIFIED TRACKS (2026-10-14): a death in the family is System
        // contact — the strange track. PARITY (Steve 2026-10-14: "Yes any
        // death for strange path"): every living member of the village gets
        // the same deed, the player and each villager alike (per-day cap per
        // doer). The bearer's own death credits the villagers; the successor
        // also gets the mantle deed.
        try {
          if (opts.villagerId && this.creditDeed) {
            if (!opts.player && opts.villagerId !== this.villagerId) this.creditDeed('player', 'death_in_family');
            for (const rid of (((this.state.village || {}).roster) || []).slice()) {
              if (rid === opts.villagerId || rid === this.villagerId) continue;
              this.creditDeed(rid, 'death_in_family');
            }
          }
        } catch (eT) { console.warn('[tracks] death deed', eT); }
      }
      // SIM TELEMETRY (2026-10-09): THE death hook — cause-of-death analysis
      // across world runs. kind covers person/monster/animal; wave for monsters.
      // PLAYER FLAG (scale-wall r17 2026-10-13): opts.player (set by
      // ledger.js playerDeath) rides ONLY into this tele record — the corpse,
      // grief, gossip, and funeral paths below key on kind, untouched. The
      // sampler keys player deaths 'player:<cause>' so scholar successions
      // become attributable. Telemetry-only: zero gameplay effect.
      try {
        let wave = null;
        if (opts.monsterId && this.data && this.data.monsters) {
          const md = this.data.monsters.find(m => m.id === opts.monsterId);
          if (md) wave = md.wave || null;
        }
        this.tele('death', { kind: opts.kind || '?', who: opts.villagerId || opts.monsterId || opts.name || '?', cause: opts.cause || '?', wave: wave, player: !!opts.player });
      } catch (e) {}
      const s = this.state.scholar;
      const corpse = {
        id: 'corpse_' + (s.day || 0) + '_' + Math.random().toString(36).slice(2, 8),
        kind: opts.kind || 'person',
        name: opts.name || 'someone',
        villagerId: opts.villagerId || null,
        monsterId: opts.monsterId || null,
        descriptor: opts.descriptor || null,
        // NODE OVERRIDE (break-it 2026-10-09): deaths off the player's tile
        // (villager-vs-monster field fights) register where they happened,
        // not where the player stands — corpses are node-scoped (corpseAt).
        node: opts.node || { x: this.map.px, y: this.map.py },
        mx: opts.mx != null ? opts.mx : (s.mx || 4),
        my: opts.my != null ? opts.my : (s.my || 4),
        dayDied: s.day || 0,
        cause: opts.cause || 'combat',
        killerId: opts.killerId || null,
        items: opts.items || this.generatePossessions(opts),
        looted: false,
        buried: false,
        deathKnown: false,
        respectsPaid: false,
        witnesses: opts.witnesses || [],
      };
      const list = this.corpses();
      list.push(corpse);
      // bones persist as markers, but cap the list
      if (list.length > 40) {
        const idx = list.findIndex(c => this.corpseStage(c) === 4);
        if (idx >= 0) list.splice(idx, 1);
      }

      // KNOWLEDGE: did you see it happen?
      const sawIt = (opts.witnesses || []).includes(this.villagerId) || !!opts.youWitnessed;
      if (sawIt) corpse.deathKnown = true;

      // PARTY: your people tell you immediately. No codex stage required.
      this.partyDeathNotify(corpse);

      // CODEX: at attunement 2, death knowledge syncs in real time.
      this.codexDeathSync(corpse);

      // GOSSIP: the village learns, distorted, along social lines.
      // GOSSIP GATE (journey-succession r9 2026-10-12): the bare
      // kind==='person' check meant villager deaths (kind 'villager' — i.e.
      // ALL of them) never seeded death gossip. Same class as the funeral
      // gates fixed below; the grief branch beside it already had it right.
      if (this.corpseIsPerson(corpse) && corpse.witnesses.length) {
        try {
          this.seedGossip('death:' + (corpse.villagerId || corpse.id),
            { victim: corpse.villagerId }, corpse.witnesses.filter(id => id !== this.villagerId));
        } catch (e) {}
      }
      // GRIEF: a villager's death is a village event — this is what makes
      // the grief dialogue fire. Without it, NPCs had nothing to say about
      // the dead (the trigger existed, the event never did).
      if (corpse.kind === 'person' || corpse.kind === 'villager') {
        try {
          if (opts.killerId && opts.killerId === this.villagerId) {
            // Combat kills already fired the witness-gated murder event in
            // tbDamage — firing it here too double-punished (the village
            // reacted twice to one killing). Only non-combat player murders
            // (poison, etc.) fire it from death registration, witness-gated
            // the same way: unseen means unsolved, not broadcast.
            if (opts.cause !== 'combat' && this.villageEvent) {
              const wit = (opts.witnesses || []).filter(id => id !== this.villagerId);
              this.villageEvent('murder', { victim: corpse.villagerId, witnessed: wit.length > 0 });
            }
          } else if (this.villageEvent) {
            this.villageEvent('death');
          }
        } catch (e) {}
      }
      // CRISIS (Steve 2026-10-09): the first grave — first villager death
      // (not the player). The village digs, and understands.
      try {
        if ((corpse.kind === 'person' || corpse.kind === 'villager') && corpse.villagerId && corpse.villagerId !== this.villagerId && this.fireCrisis) {
          const nm = (() => { try { return this.displayName(corpse.villagerId); } catch (e) { return corpse.name || 'Someone'; } })();
          this.fireCrisis('first-grave', { name: nm });
        }
      } catch (e) {}
      return corpse;
    },

    // possessions: what the dead carried. Monsters/animals: generic pools.
    // Sapient dead: their own non-sentimental gear (sentimentals die with them).
    generatePossessions(opts) {
      opts = opts || {};
      if (opts.items) return opts.items;
      const items = [];
      const R = Math.random;
      if (opts.kind === 'monster') {
        const mid = opts.monsterId || 'beast';
        const pool = [
          { name: 'Stripped hide', units: 1, kg: 1.5, kcalEach: 0, note: 'Tough. Useful.' },
          { name: 'Gland sac', units: 1, kg: 0.3, kcalEach: 0, note: 'Smells wrong. Alchemists would pay.' },
          { name: 'Teeth', units: 2 + Math.floor(R() * 3), kg: 0.1, kcalEach: 0, note: 'Trophies. Or tools.' },
          { name: 'Sinew cord', units: 1 + Math.floor(R() * 2), kg: 0.2, kcalEach: 0, note: 'Strong fiber.' },
        ];
        const n = 1 + Math.floor(R() * 2);
        for (let i = 0; i < n; i++) {
          const p = pool[Math.floor(R() * pool.length)];
          items.push({ plantId: mid + '_trophy_' + i, name: p.name, units: p.units, kg: p.kg, kcalEach: 0, spoilDay: 9999, prep: p.note });
        }
        return items;
      }
      if (opts.kind === 'animal') {
        // HIDE (Steve 2026-10-09): the hide_armor recipe's honest source.
        // The hide is a crafting material (craft() matches item.material).
        return [{ plantId: 'animal_hide', material: 'hide', name: 'Hide', units: 1, kg: 1.0, kcalEach: 0, spoilDay: 9999, prep: 'Cure it or lose it.' }];
      }
      // people carry practical things
      // SAPIENT DEAD CARRY THEIR OWN GEAR (Steve 2026-10-09): a villager's
      // corpse holds what they actually owned — carried + stashed — as the
      // lootable death pack. Nothing auto-transfers: you open the pack and
      // take, leave, or use per item (loot-as-action). SENTIMENTAL ITEMS DIE
      // WITH THEM: keepsakes are buried with the body, never lootable, and
      // grant no bond to anyone they didn't spawn with. Animals/monsters keep
      // the generic pools above — this is just for sapient dead.
      if (opts.villagerId) {
        try {
          const rec = ((this.data.villagers || []).find(x => x.id === opts.villagerId))
            || ((this.data.background_survivors || []).find(x => x.id === opts.villagerId))
            || ((((this.state || {}).village || {}).rosterChars || {})[opts.villagerId]);
          if (rec) {
            const defs = {}; (this.data.items || []).forEach(i => { defs[i.id] = i; });
            const seen = new Set();
            const gearIds = [];
            for (const src of [rec.items, rec.stashed]) {
              for (const it of (src || [])) {
                const gid = (it && (it.itemId || it.id)) || it;
                if (!gid || seen.has(gid)) continue;
                seen.add(gid);
                const def = defs[gid] || {};
                if (def.class === 'sentimental') continue; // dies with them
                gearIds.push(gid);
              }
            }
            if (gearIds.length) {
              for (const gid of gearIds) {
                const def = defs[gid] || {};
                const personal = (rec.itemPersonal || {})[gid];
                items.push({
                  itemId: gid,
                  name: personal ? personal.name : (def.name || gid),
                  units: 1, kg: def.kg != null ? def.kg : 0.3, kcalEach: 0,
                  spoilDay: 9999,
                  prep: 'Theirs. Take it, leave it, or use it — the village watches.',
                });
              }
              return items;
            }
          }
        } catch (e) {}
        // EMPTY SAPIENT DEATH PACK (Steve 2026-10-09): a sapient corpse with
        // no transferable gear carries nothing — never invent practical props
        // or a keepsake for a person. The generic pools below are for
        // non-sapient dead only.
        return items;
      }
      const practical = [
        { name: 'Worn knife', kg: 0.4, note: 'Still sharp.' },
        { name: 'Lighter', kg: 0.1, note: 'Half full.' },
        { name: 'Coil of rope', kg: 0.8, note: 'Good rope.' },
        { name: 'Dried meat', kg: 0.3, kcalEach: 400, units: 2, note: 'Their last meal, uneaten.', spoilDays: 30 },
        { name: 'Water bottle', kg: 0.5, note: 'Still sealed.' },
        { name: 'Bandages', kg: 0.2, note: 'Clean. They were careful.' },
        { name: 'Work gloves', kg: 0.3, note: 'Broken in.' },
      ];
      const shuffled = practical.slice().sort(() => R() - 0.5);
      const n = 2 + Math.floor(R() * 2);
      for (let i = 0; i < n && i < shuffled.length; i++) {
        const p = shuffled[i];
        // HONEST CLOCKS (break-it food r4): the old push stamped spoilDay
        // 9999 on everything — corpse-looted dried meat was immortal food.
        // Dried meat keeps ~a month (PRESERVATION.md); gear doesn't rot.
        const cd0 = ((this.state || {}).scholar || {}).day || 0;
        items.push({ plantId: 'effect_' + i, name: p.name, units: p.units || 1, kg: p.kg, kcalEach: p.kcalEach || 0, spoilDay: (p.kcalEach || 0) > 0 ? cd0 + (p.spoilDays || 30) : 9999, prep: p.note });
      }
      return items;
    },

    // ---------- looting ----------

    // LOOT-AS-ACTION (Steve 2026-10-06): no auto-loot. The kill leaves a
    // corpse with an inventory; the player opens the pack deliberately and
    // takes, leaves, or uses per item. These are the per-item primitives —
    // the app.js loot UI calls them. Trauma/disease apply once per corpse
    // (first touch), not per item — the horror is the act, not the count.

    // _corpseFirstTouch(c): trauma + disease on first handling. Idempotent.
    _corpseFirstTouch(c) {
      if (!c || c._touched) return;
      c._touched = true;
      const st = this.corpseStageInfo(c);
      const trauma = this.corpseTrauma(c, {});
      try { this.addTrauma(trauma); } catch (e) {}
      const s = this.state.scholar;
      // ASH: no rot, no disease from ashes.
      if (!c.ash && Math.random() < st.diseaseP) {
        const hpBefore = s.health == null ? 100 : s.health;
        this.addHealth(-st.diseaseDmg);
        const damage = Math.max(0, hpBefore - s.health);
        this.say(`Handling the ${st.id} remains was a mistake. Fever by nightfall. (-${damage} health)`);
      }
      // WITNESSES: looting a fresh person-corpse where others can see.
      // ASH (Steve 2026-10-09): pocketing a phoenix victim's gear is theft
      // with an amplifier -- they died for the bearer, or for the village.
      // The bearer taking their own victim's gear is the worst case (see the loot_ash lens).
      if (this.corpseIsPerson(c) && this.corpseStage(c) <= 2) {
        if (c.ash) {
          const bearerTakesOwn = !!(c.ashBearer && c.ashBearer === this.villagerId);
          try { this.observe('loot_ash', { target: c.villagerId, bearerTakesOwn }); } catch (e) {}
          if (bearerTakesOwn) this.say('You burned them to live -- and now you\'re picking through their ashes. Someone saw.');
        } else {
          try { this.observe('loot_corpse', { target: c.villagerId }); } catch (e) {}
        }
      }
      if (this.tickAction) this.tickAction(8);
    },

    _corpseCheckRange(c, quiet) {
      const s = this.state.scholar;
      // R51 FIX (journey-deepening r51, arm-proven): s.mx/s.my are cell
      // coordinates where 0 is a real edge cell, not "missing" — the old
      // `|| 4` fallback read a scholar at (4,0) as standing at the center
      // (4,4), so a corpse 4 cells away passed the range gate (d37: the
      // take then failed on weight instead of range). `??` keeps 0.
      if (c.node.x !== this.map.px || c.node.y !== this.map.py ||
          Math.max(Math.abs(c.mx - (s.mx ?? 4)), Math.abs(c.my - (s.my ?? 4))) > 1) {
        if (!quiet) this.say('Too far — get closer to the body.');
        return false;
      }
      return true;
    },

    // _corpseTakeStack(c, it): move one item stack from a corpse into the
    // scholar's pack. Shared by corpseTakeItem (one stack) and corpseLootAll
    // (many). Assumes: range checked, units > 0, carry-weight gate passed.
    // First-touch trauma/disease fires once per corpse (idempotent).
    _corpseTakeStack(c, it) {
      const units = it.units || 1;
      this._corpseFirstTouch(c);
      const s = this.state.scholar;
      const inv = s.inventory;
      // FUNGIBILITY (miser break-it 2026-10-08): the old merge keyed on plantId
      // alone — raw corpse meat folded into a cooked pack stack at the cooked
      // kcalEach, minting phantom calories (measured +500 on 2 units). Merge
      // only into a truly identical stack; otherwise it rides separately.
      const ex = inv.find(x => x.plantId === it.plantId && !x.keepsake && !it.keepsake &&
        (!this.stacksMatch || this.stacksMatch(x, it)));
      if (ex && !it.keepsake) ex.units = (ex.units || 1) + units;
      else {
        // ASH (Steve 2026-10-09): gear taken from a phoenix ash-pile carries
        // provenance -- the village knows whose ashes it came from. Bringing
        // it home to Haven honors the dead; pocketing it is theft amplified.
        const carried = Object.assign({}, it, { units });
        if (c.ash) carried.ashOf = c.ashVictim;
        inv.push(carried);
      }
      it.units = 0;
      try { this.tele('loot_taken', { id: it.itemId || it.plantId || '?', alien: !!it.alienLoot }); } catch (e) {}
      // GEAR DISCOVERY (Steve 2026-10-09): looting a gear item teaches its
      // recipe L1 — you've held one. (Sapient dead carry their real gear.)
      try { if (it.itemId) this.noteGearHandled(it.itemId); } catch (e) {}
      // HIDE-HANDLING BEAT (armor discovery 2026-10-13): the first time you
      // take an animal hide in your hands, the shape of armor suggests
      // itself — hide_armor L1 (seen). Breaks the hide_armor circular
      // dependency (needed L1 to craft, L1 only from having hide_armor):
      // handling the MATERIAL teaches the shape, the same way handling gear
      // teaches its recipe. Fires once, L0 only.
      try { this.noteHideHandled({ ...it, units }); } catch (e) { console.warn('[corpses] hide handling', e); }
      return it;
    },

    // noteHideHandled(it): the hide-handling beat (armor discovery
    // 2026-10-13). Called from every hide-handling path: corpse loot
    // (per-item/batch), butchering (food.js carcassToMeat), stash take
    // (storage.js takeMaterial). An animal hide in your hands teaches
    // hide_armor L1 — you've SEEN the material up close and the shape of
    // armor suggests itself. Same gates as every recipe:
    // L1 is a blind 35% attempt with materials at risk; a successful blind
    // craft teaches L2 (your hands learn). One system, no parallel track.
    // Hides come as corpse loot (plantId 'animal_hide') or butchered/stash
    // material (material 'hide') — both are the same rawhide.
    noteHideHandled(it) {
      try {
        if (!it || !Number.isSafeInteger(it.units ?? 1) || (it.units ?? 1) <= 0 || (it.plantId !== 'animal_hide' && it.material !== 'hide')) return;
        const rk = ((this.state.codex || {}).recipes || {})['hide_armor'] || {};
        if ((rk.level || 0) >= 1) return;
        if (this.grantKnowledge) this.grantKnowledge('recipe', 'hide_armor', 1, { type: 'witnessed' });
        this.say(`🔪 You hold the hide — thick, raw, smelling of the animal. Scrape it, cure it, cut it, lace it... the shape of armor suggests itself. Your hands don't know it yet. Your eyes do.`);
        try { this.tele('hide_handled', {}); } catch (e) {}
      } catch (e) {}
    },

    // corpseTakeItem(cid, idx): take the whole stack of one item.
    corpseTakeItem(cid, idx) {
      const c = this.corpses().find(x => x.id === cid);
      if (!c || c.buried) { this.say('Nothing there.'); return null; }
      if (!this._corpseCheckRange(c)) return null;
      const it = (c.items || [])[idx];
      if (!it || (it.units == null ? 1 : it.units) <= 0) { this.say('Nothing left of that.'); return null; }
      const units = it.units || 1;
      const kg = (it.kg || 0.3) * units;
      if (this.canCarry && !this.canCarry(kg)) { this.say("Too heavy — your pack can't take it."); return null; }
      // THE WEIGHT, NAMED (journey-succession r22 2026-10-17): the per-item
      // button fired the trauma number silently, like the batch path did —
      // only the search verb named the dead. Name them once, first touch.
      const wasTouched = !!c._touched;
      // NUMBER-AT-FIRE (journey-succession r24 2026-10-18): the trauma number
      // must be computed BEFORE the take — _corpseFirstTouch fires
      // addTrauma(corpseTrauma) and then observe('loot_corpse') moves trust,
      // so a recompute after the take names a smaller number than the one
      // that actually landed (9 fired, line said 6). r22's contract is "the
      // trauma number is the same one _corpseFirstTouch already added."
      const traumaAtFire = (!wasTouched && !c.ash && this.corpseIsPerson(c)) ? this.corpseTrauma(c, {}) : 0;
      this._corpseTakeStack(c, it);
      const nm = this.itemDisplayName ? this.itemDisplayName(it) : (it.name || 'it');
      this.say(`Taken: ${nm} x${units}.`);
      if (!wasTouched && !c.ash && this.corpseIsPerson(c)) {
        const known = this.nameKnown ? this.nameKnown(c.villagerId) : true;
        const who = known ? this.displayName(c.villagerId) : 'them';
        this.say(`You take ${String(nm).toLowerCase()} from ${who}. Your hands know what they did. (+${traumaAtFire} trauma)`);
      }
      if (!c.items.some(i => (i.units == null ? 1 : i.units) > 0)) {
        c.looted = true;
        this.say(c.ash ? 'The ashes are picked clean. Nothing left but grey.' : 'The body is stripped. What\'s left isn\'t worth taking.');
      }
      return it;
    },

    // corpseLootAll(cid, skipFn): ONE deliberate decision clears a corpse.
    // Takes every remaining item stack that passes the per-item carry-weight
    // gate (canCarry re-checked as the pack fills); overweight stacks stay on
    // the corpse and are reported, never silently dropped. Items flagged
    // _left (the player chose Leave) and items matching skipFn are skipped.
    // Rotting rules unchanged: meat left on the corpse still rots. Human meat
    // is NOT skipped by default — callers that want the trembles rule pass
    // (it) => it.plantId === 'meat_human' (the loot UI and policies do).
    // Returns { taken: [{name, units, kcalEach}], left: [...], skipped: n,
    // looted: bool } or null when the verb fizzles (range/burial).
    corpseLootAll(cid, skipFn) {
      const c = this.corpses().find(x => x.id === cid);
      if (!c || c.buried) { this.say('Nothing there.'); return null; }
      if (!this._corpseCheckRange(c)) return null;
      const nm = (it) => this.itemDisplayName ? this.itemDisplayName(it) : (it.name || 'it');
      const taken = [], left = [];
      let skipped = 0, humanSkipped = 0;
      const items = c.items || [];
      // THE WEIGHT, NAMED (journey-succession r22 2026-10-17): the per-item
      // path names the dead and the weight ("You take X from Marco. Your
      // hands know what they did."); the batch path fired the trauma number
      // silently. One deliberate decision deserves the same honesty — name
      // them once, on the first touch. Ash keeps its own voice (in
      // _corpseFirstTouch); a corpse already touched per-item keeps that one.
      const wasTouched = !!c._touched;
      // NUMBER-AT-FIRE (journey-succession r24 2026-10-18): see the per-item
      // path above — the named number must be the one _corpseFirstTouch
      // actually fired, computed before the take moves trust.
      const traumaAtFire = (!wasTouched && !c.ash && this.corpseIsPerson(c)) ? this.corpseTrauma(c, {}) : 0;
      for (let idx = 0; idx < items.length; idx++) {
        const it = items[idx];
        if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
        if (it._left) { skipped++; continue; }
        if (skipFn && skipFn(it)) { skipped++; if (it.plantId === 'meat_human') humanSkipped++; continue; }
        const units = it.units || 1;
        const kg = (it.kg || 0.3) * units;
        if (this.canCarry && !this.canCarry(kg)) { left.push({ name: nm(it), units }); continue; }
        this._corpseTakeStack(c, it);
        taken.push({ name: nm(it), units, kcalEach: it.kcalEach || 0 });
      }
      if (taken.length) this.say('Taken: ' + taken.map(t => `${t.name} x${t.units}`).join(', ') + '.');
      if (taken.length && !wasTouched && !c.ash && this.corpseIsPerson(c)) {
        const known = this.nameKnown ? this.nameKnown(c.villagerId) : true;
        const who = known ? this.displayName(c.villagerId) : 'them';
        this.say(`You take ${taken.map(t => String(t.name).toLowerCase()).join(', ')} from ${who}. Your hands know what they did. (+${traumaAtFire} trauma)`);
      }
      if (left.length) this.say('Too heavy for the rest — left where it lies: ' + left.map(t => `${t.name} x${t.units}`).join(', ') + '.');
      if (humanSkipped > 0) this.say('Left the human meat. Trembles has no cure.');
      if (!taken.length && !left.length) this.say('Nothing worth taking.');
      if (!c.items.some(i => (i.units == null ? 1 : i.units) > 0)) {
        c.looted = true;
        this.say(c.ash ? 'The ashes are picked clean. Nothing left but grey.' : 'The body is stripped. What\'s left isn\'t worth taking.');
      }
      return { taken, left, skipped, looted: !!c.looted };
    },

    // corpseUseItem(cid, idx): take one unit into your pack, then use it
    // through the normal use path. "Use it on the spot."
    corpseUseItem(cid, idx) {
      const c = this.corpses().find(x => x.id === cid);
      if (!c || c.buried) { this.say('Nothing there.'); return null; }
      if (!this._corpseCheckRange(c)) return null;
      const it = (c.items || [])[idx];
      if (!it || (it.units == null ? 1 : it.units) <= 0) { this.say('Nothing left of that.'); return null; }
      if (!this.isUsable || !this.isUsable(it)) { this.say("You can't use that here."); return null; }
      this._corpseFirstTouch(c);
      const s = this.state.scholar;
      // move one unit to the pack, then use via the standard path
      it.units = (it.units || 1) - 1;
      const copy = Object.assign({}, it, { units: 1 });
      if (c.ash) copy.ashOf = c.ashVictim; // ASH: provenance rides along
      s.inventory.push(copy);
      const invIdx = s.inventory.length - 1;
      try { this.useItem(invIdx); } catch (e) {}
      if (!c.items.some(i => (i.units == null ? 1 : i.units) > 0)) c.looted = true;
      return copy;
    },

    // corpseEatItem(cid, idx): take one unit, eat it on the spot.
    corpseEatItem(cid, idx) {
      const c = this.corpses().find(x => x.id === cid);
      if (!c || c.buried) { this.say('Nothing there.'); return null; }
      if (!this._corpseCheckRange(c)) return null;
      const it = (c.items || [])[idx];
      if (!it || (it.units == null ? 1 : it.units) <= 0) { this.say('Nothing left of that.'); return null; }
      if (!((it.kcalEach || 0) > 0 && it.edible !== false)) { this.say("That's not food."); return null; }
      this._corpseFirstTouch(c);
      const s = this.state.scholar;
      it.units = (it.units || 1) - 1;
      const copy = Object.assign({}, it, { units: 1 });
      s.inventory.push(copy);
      const invIdx = s.inventory.length - 1;
      try { this.eatOne(invIdx); } catch (e) {}
      if (!c.items.some(i => (i.units == null ? 1 : i.units) > 0)) c.looted = true;
      return copy;
    },

    // corpseTrauma: the grossness factor. Existing trauma system carries it.
    // Fresh + knew them well = horrifying. Old bones = just sad.
    // Monsters are field-dressing; people are people.
    corpseTrauma(c, opts) {
      opts = opts || {};
      // ASH (Steve 2026-10-09): ashes aren't a body -- no grossness, no
      // handling-the-dead trauma. The weight of the act is carried by the
      // phoenix aftermath and the theft path, not the pile.
      if (c.ash) return 0;
      const st = this.corpseStageInfo(c);
      let base;
      if (c.kind === 'monster') base = 2;
      else if (c.kind === 'animal') base = 1;
      else {
        const trust = ((this.state.village.trust || {})[c.villagerId]) || 10;
        if (trust >= 60) base = 14;       // friend
        else if (trust >= 30) base = 9;   // acquaintance
        else if (trust >= 10) base = 6;   // knew their name
        else base = 4;                    // stranger — still a person
        // party bonds cut deeper
        try {
          if (this.partyMembers && this.partyMembers().includes(c.villagerId)) base += 4;
        } catch (e) {}
        if (this.villagerId === c.killerId) base += 3; // you did this
      }
      let n = base * st.traumaMult;
      if (opts.keepsake) n += 3; // you took the photograph too
      return Math.max(1, Math.round(n));
    },

    // lootCorpse(id, takeAll): search the body. Weight, trauma, disease, witnesses.
    lootCorpse(id, takeAll) {
      const c = this.corpses().find(x => x.id === id);
      if (!c || c.buried) { this.say('Nothing there.'); return null; }
      // must be close: same node, adjacent cell
      const s = this.state.scholar;
      // R51 FIX: same falsy-0 bug as _corpseCheckRange (see there) — a
      // scholar on row/col 0 was read as standing at the center (4,4).
      if (c.node.x !== this.map.px || c.node.y !== this.map.py ||
          Math.max(Math.abs(c.mx - (s.mx ?? 4)), Math.abs(c.my - (s.my ?? 4))) > 1) {
        this.say('Too far — get closer to the body.'); return null;
      }
      const st = this.corpseStageInfo(c);
      const remaining = c.items.filter(i => (i.units == null ? 1 : i.units) > 0);
      if (!remaining.length) { this.say('Nothing left worth taking.'); return null; }

      const took = [];
      const takeOne = (it) => {
        const kg = (it.kg || 0.3) * 1;
        if (this.canCarry && !this.canCarry(kg)) { this.say('Too heavy — your pack can\'t take it.'); return false; }
        const inv = s.inventory;
        // FUNGIBILITY GATE (break-it food r3 2026-10-08): the old merge keyed
        // on plantId alone — looted low-quality meat folded into a
        // high-quality pack stack kept the pack's kcalEach (value laundering,
        // same class as round 2's F1). Only truly identical stacks merge.
        const ex = (!it.keepsake && this.stacksMatch)
          ? inv.find(x => x.plantId === it.plantId && !x.keepsake && this.stacksMatch(x, it))
          : null;
        if (ex) ex.units = (ex.units || 1) + 1;
        else {
          const carried = Object.assign({}, it, { units: 1 });
          if (c.ash) carried.ashOf = c.ashVictim; // ASH: provenance rides along
          inv.push(carried);
        }
        it.units = (it.units ?? 1) - 1;
        took.push(it);
        // HIDE-HANDLING BEAT (armor discovery 2026-10-13): batch looting
        // teaches the shape too — same as the per-item path. See noteHideHandled.
        try { this.noteHideHandled({ ...it, units: 1 }); } catch (e) { console.warn('[corpses] batch hide handling', e); }
        return true;
      };

      if (takeAll) {
        for (const it of remaining.slice()) { if (!takeOne(it)) break; }
      } else {
        takeOne(remaining[0]);
      }
      if (!took.length) return null;

      // THE WEIGHT: trauma scaled by knowing them + freshness
      const keepsakeTaken = took.some(t => t.keepsake);
      const trauma = this.corpseTrauma(c, { keepsake: keepsakeTaken });
      this.addTrauma(trauma);

      // DISEASE: handling rot risks illness. Fresh is safer physically.
      // addHealth routing (break-it food r3 2026-10-08): the old direct write
      // bypassed the combat fighter — mid-fight damage was erased at tbEnd.
      // ASH: no rot, no disease from ashes.
      if (!c.ash && Math.random() < st.diseaseP) {
        const hpBefore = s.health == null ? 100 : s.health;
        this.addHealth(-st.diseaseDmg);
        const damage = Math.max(0, hpBefore - s.health);
        this.say(`Handling the ${st.id} remains was a mistake. Fever by nightfall. (-${damage} health)`);
      }

      // voice: what it felt like
      if (this.corpseIsPerson(c)) {
        const known = this.nameKnown ? this.nameKnown(c.villagerId) : true;
        const who = known ? this.displayName(c.villagerId) : 'them';
        this.say(`You take ${took.map(t => t.name.toLowerCase()).join(', ')} from ${who}. Your hands know what they did. (+${trauma} trauma)`);
      } else {
        this.say(`Field-dressed: ${took.map(t => t.name.toLowerCase()).join(', ')}. (+${trauma} trauma)`);
      }

      // WITNESSES: looting a fresh person-corpse where others can see.
      // The village watches. Trust hits; gossip carries it.
      // ASH (Steve 2026-10-09): the ash-pile fires the amplified loot_ash.
      if (this.corpseIsPerson(c) && this.corpseStage(c) <= 2) {
        if (c.ash) {
          const bearerTakesOwn = !!(c.ashBearer && c.ashBearer === this.villagerId);
          try { this.observe('loot_ash', { target: c.villagerId, bearerTakesOwn }); } catch (e) {}
        } else {
          try { this.observe('loot_corpse', { target: c.villagerId }); } catch (e) {}
        }
      }

      if (!c.items.some(i => (i.units == null ? 1 : i.units) > 0)) {
        c.looted = true;
        this.say('The body is stripped. What\'s left isn\'t worth taking.');
      }
      // searching a body costs time — the day doesn't pause for this
      if (this.tickAction) this.tickAction(8);
      return took;
    },

    // ---------- examination & rites ----------

    corpseDesc(c) {
      // ASH (Steve 2026-10-09): the funeral custom, stated plainly. A burned
      // villager's belongings belong to the village -- not to whoever's
      // standing in the ashes. Both paths visible, no lecture, no hidden rules.
      if (c.ash) {
        const known = this.nameKnown ? this.nameKnown(c.villagerId) : true;
        const who = known ? this.displayName(c.villagerId) : 'Someone';
        const first = (who || 'Someone').split(' ')[0];
        const n = (c.items || []).filter(i => (i.units == null ? 1 : i.units) > 0).length;
        return `${first}'s ashes lie here, still warm. ${n ? `Their gear -- ${n} ${n === 1 ? 'thing' : 'things'} -- is scattered in the grey.` : 'The fire took everything they carried.'} What they carried belongs to the village now, not to whoever's standing here. Pocket it, or bring it home. The village will remember.`;
      }
      const st = this.corpseStageInfo(c);
      const s = this.state.scholar;
      const days = (s.day || 0) - (c.dayDied || 0);
      const when = days <= 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago';
      let who;
      if (this.corpseIsPerson(c)) {
        const known = this.nameKnown ? this.nameKnown(c.villagerId) : true;
        who = known ? this.displayName(c.villagerId) : 'someone you don\'t recognize';
      } else if (c.kind === 'monster') {
        who = c.descriptor || (c.monsterName || 'the beast');
      } else {
        who = c.name;
      }
      const D = {
        fresh: [
          `${who} lies here. Still. It happened ${when}, and the ground hasn't forgotten yet.`,
          `This is ${who}. Was. The word sticks in your throat. ${when}.`,
        ],
        stiff: [
          `${who}. ${when}. Rigor has set in — the body holds the shape of its last moment.`,
        ],
        bloating: [
          `${who}. ${when}. The body is changing. You don't look too long.`,
          `What's left of ${who}. ${when}. The smell tells you before your eyes do.`,
        ],
        rotting: [
          `The remains of ${who}. ${when}. Nature is thorough and unbothered.`,
        ],
        bones: [
          `Bones. ${who}, ${when}. The land kept what mattered and returned the rest.`,
          `Picked clean. ${who} — ${when}. Just the shape of a person now.`,
        ],
      };
      const lines = D[st.id] || D.fresh;
      return lines[Math.floor(Math.random() * lines.length)];
    },

    // examineCorpse: looking closely is a knowledge event. Confirming the death.
    examineCorpse(id) {
      const c = this.corpses().find(x => x.id === id);
      if (!c || c.buried) { this.say('Nothing there.'); return null; }
      this.say(this.corpseDesc(c));
      const st = this.corpseStageInfo(c);
      const remaining = c.items.filter(i => (i.units == null ? 1 : i.units) > 0).length;
      if (remaining && !c.looted) {
        this.say(this.corpseIsPerson(c)
          ? `They're still wearing their life: ${remaining} thing${remaining > 1 ? 's' : ''} worth taking. Whether you should is another question.`
          : `The carcass has ${remaining} thing${remaining > 1 ? 's' : ''} worth cutting free.`);
      } else if (c.looted) {
        this.say('Stripped already. Nothing left but the fact of it.');
      }
      if (!c.deathKnown) {
        c.deathKnown = true;
        this.say('You know now. Really know. That\'s its own kind of weight.');
      }
      return c;
    },

    // payRespects: a small rite. Costs a little time, steadies you, and the
    // village notices the difference between this and looting.
    // FUNERAL GATE (journey-succession r9 2026-10-12): the old bare
    // `kind !== 'person'` check rejected kind 'villager' — and EVERY
    // villager death registers kind 'villager' (starvation, wounds, player
    // death, phoenix). The UI offered "Say a few words" via corpseIsPerson
    // but the API answered "Nothing to honor here.": no villager corpse in
    // the game could ever be honored. Same class as Steve's 2026-10-09
    // corpseIsPerson fix — the gate now matches the button.
    payRespects(id) {
      const c = this.corpses().find(x => x.id === id);
      if (!c || c.buried || !this.corpseIsPerson(c)) { this.say('Nothing to honor here.'); return null; }
      if (c.respectsPaid) { this.say('You already said your words.'); return null; }
      c.respectsPaid = true;
      const s = this.state.scholar;
      s.trauma = Math.max(0, (s.trauma || 0) - 3);
      const known = this.nameKnown ? this.nameKnown(c.villagerId) : true;
      const who = known ? this.displayName(c.villagerId) : 'them';
      this.say(`You say a few words for ${who}. Not a ceremony — just: you were here, and someone noticed you leaving. (-3 trauma)`);
      try { this.observe('honor_dead', { target: c.villagerId }); } catch (e) {}
      if (this.tickAction) this.tickAction(4);
      return true;
    },

    // buryCorpse: lay them to rest. Removes the corpse, ends the decay.
    // FUNERAL GATE (journey-succession r9 2026-10-12): same fix as
    // payRespects above — the bare kind==='person' gate made "Bury them" a
    // dead button for every villager corpse (all register kind 'villager').
    buryCorpse(id) {
      const c = this.corpses().find(x => x.id === id);
      if (!c || c.buried || !this.corpseIsPerson(c)) return null;
      const st = this.corpseStageInfo(c);
      c.buried = true;
      const known = this.nameKnown ? this.nameKnown(c.villagerId) : true;
      const who = known ? this.displayName(c.villagerId) : 'them';
      // burying the rotten is honest work; burying the fresh is heartbreak
      const trauma = Math.max(1, Math.round(this.corpseTrauma(c) * 0.6));
      this.addTrauma(trauma);
      if (Math.random() < st.diseaseP) {
        const s = this.state.scholar;
        const hpBefore = s.health == null ? 100 : s.health;
        this.addHealth(-st.diseaseDmg);
        const damage = Math.max(0, hpBefore - s.health);
        this.say(`Burying the ${st.id} dead was honest work, and it cost you. Fever by nightfall. (-${damage} health)`);
      }
      this.say(`You bury ${who}. A marker, of sorts. The village will know where. (+${trauma} trauma)`);
      // GRAVE GOODS, NAMED (journey-succession r22 2026-10-17): the unlooted
      // death pack goes into the ground with the body — always the mechanic,
      // never the fiction. The burial said nothing about the 4–22 items
      // vanishing with them. Name what the earth keeps.
      const kept = (c.items || []).filter(i => i && (i.units == null ? 1 : i.units) > 0);
      if (kept.length) {
        const names = kept.map(i => String(this.itemDisplayName ? this.itemDisplayName(i) : (i.name || 'something')).toLowerCase()).join(', ');
        this.say(`What they carried goes into the ground with them: ${names}. The village leaves the dead their things.`);
      }
      // GRAVE MARKERS (rogue P1 T7 2026-10-22): the burial raises a
      // persistent marker at the Haven fire — "the village will know
      // where," made literal. createGrave owns the Taken gate, the
      // one-per-villager rule, and the knowledge-gated name.
      try { if (this.createGrave) this.createGrave(c); } catch (e) { console.warn('[corpses] createGrave', e && e.message); }
      try { this.observe('bury_dead', { target: c.villagerId }); } catch (e) {}
      if (this.tickAction) this.tickAction(16);
      return true;
    },

    // recoverBearer: THE VILLAGE BRINGS ITS BEARER HOME (journey-succession
    // r9 2026-10-12). The death beat says "somebody else starts digging" —
    // now somebody does. Overnight (fired from endDay, one day after the
    // death), the village recovers the dead bearer's body to the fire and
    // digs the grave. The BURIAL stays the successor's act — payRespects /
    // buryCorpse are still player-facing, and the death pack rides home on
    // the corpse (loot-as-action: take, leave, or use per item — nothing
    // auto-transfers). Plain data in v.pendingBurials, so save/load
    // mid-grief is safe. List, not a slot: two deaths in one day each get
    // their recovery. If the player already buried them, the entry clears
    // silently — the work is done.
    recoverBearer() {
      const v = this.state.village, s = this.state.scholar;
      const pend = v.pendingBurials || [];
      if (!pend.length) return;
      const day = (s || {}).day || 0;
      const due = pend.filter(p => p && (day > (p.day || 0)));
      if (!due.length) return;
      v.pendingBurials = pend.filter(p => p && (day <= (p.day || 0)));
      for (const p of due) {
        try {
          const c = (this.corpses() || []).find(x => x && x.id === p.corpseId);
          if (!c || c.buried) continue;
          const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
          c.node = { x: hx, y: hy };
          c.mx = 4; c.my = 4;
          c.recovered = true;
          c.deathKnown = true; // the village told the new Bearer they'd brought the body home
          const first = String(p.name || 'them').split(' ')[0];
          this.say(`That night, they bring ${first} home. Nobody asks you to help carry; nobody has to. By morning the grave is dug by the fire, and the body is laid out beside it. The filling of it is yours.`);
          try { this.recordMoment(`${p.name || 'The bearer'} was brought home. The village dug the grave.`); } catch (e2) {}
        } catch (e) {}
      }
    },

    // ---------- death as knowledge ----------

    knowsDeath(c) {
      if (c.deathKnown) return true;
      // party told you, codex synced you, gossip reached you
      return false;
    },

    // codexAttunement: 0 = pre-System (journal only), 1 = System arrived,
    // 2 = attuned — the codex is deeply integrated and syncs on its own.
    // Stage 2: the System is here AND (you've survived 12+ days OR the codex
    // holds real breadth). Documented threshold; tested.
    codexAttunement() {
      if (!this.state.systemArrived) return 0;
      const cx = this.state.codex || {};
      const breadth = Object.keys(cx.plants || {}).length +
        Object.keys(cx.monsters || {}).length +
        Object.keys(cx.skills || {}).length;
      const day = (this.state.scholar || {}).day || 0;
      return (day >= 12 || breadth >= 15) ? 2 : 1;
    },

    maybeAttune() {
      if (this.codexAttunement() === 2 && !this.state.codex._attunedTold) {
        this.state.codex._attunedTold = true;
        this.say('📖 The Codex settles deeper into you. It knows things before you do now. Deaths, especially — it will tell you itself.');
      }
    },

    // codexDeathSync: at attunement 2, the codex updates on its own.
    // No checking, no asking. It just knows, and so do you.
    codexDeathSync(corpse) {
      try { this.maybeAttune(); } catch (e) {}
      if (this.codexAttunement() < 2 || corpse.deathKnown) return false;
      corpse.deathKnown = true;
      const who = corpse.kind === 'person'
        ? (this.displayName ? this.displayName(corpse.villagerId) : corpse.name)
        : (corpse.descriptor || corpse.name);
      this.say(`📖 The Codex turns a page on its own. ${who} is dead. You didn't ask. It knew.`);
      return true;
    },

    // partyDeathNotify: your people tell you immediately. No codex needed.
    partyDeathNotify(corpse) {
      let members = [];
      try { members = this.partyMembers ? this.partyMembers() : []; } catch (e) {}
      if (corpse.kind === 'person' && members.includes(corpse.villagerId)) {
        const who = this.displayName ? this.displayName(corpse.villagerId) : corpse.name;
        this.say(`💔 ${who} is dead.`);
        corpse.deathKnown = true;
        return true;
      }
      // a party member saw it happen — they'd tell you
      if (corpse.witnesses.some(w => members.includes(w)) && corpse.kind === 'person') {
        const who = this.displayName ? this.displayName(corpse.villagerId) : corpse.name;
        this.say(`Someone in your party saw it happen. ${who} is dead. They tell you straight.`);
        corpse.deathKnown = true;
        return true;
      }
      return false;
    },
  };

  Object.assign(G, methods);
})();
