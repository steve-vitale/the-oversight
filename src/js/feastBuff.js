// @ontology
// system: feastSurge
// description: Feast Surge — the TIMED BUFF (Worker B, 2026-10-10, Steve: "Okay build carefully"). Replaces the retired on-strike feastBurn trigger: a feast grants a buff window that decays at the durationNights-th dawn (2 dawns from 2026-10-12 — a dusk feast buys the night plus the full next day). During the window, strikes AND ability resolutions read the feasted multiplier. The devotion arming (scholar.prog.feastSurge) is the gate — the buff only grants when armed.
// provides:
//   - grantFeastBuff(feast)
//   - feastedActive()
//   - feastedBuffState()
//   - feastedMult()
//   - feastedForm(abilityId, actionId)
//   - applyFeastedForm(abilityId, actionId, target, preHp)
//   - noteFeastedCombatUse()
//   - clearFeastBuff(expired)
//   - feastedLine()
//   - feastSurgeCfg()
//   - feastDawnWord()
//   - drawFeastScavenger()
//   - feastDrawPending()
//   - faceFeastDraw()
//   - driveOffFeastDraw()
// rules:
//   - feast_draw: on a FRESH armed grant (never a refresh — one draw per buff), the feast's smoke draws a wave-appropriate scavenger to the haven's edge as a pending encounter the player faces (faceFeastDraw -> startCombat, blow-by-blow) or declines (driveOffFeastDraw — devotion unspent); the draw dies with the buff (code: drawFeastScavenger, clearFeastBuff).
//   - devotion_gate: the buff grants ONLY when the devotion lane is armed — prog.feastSurge or the feast-carried feast.surge (code: grantFeastBuff). hostFeast must not clear the arming before the grant; consumption belongs to _spendFeastedPower after real combat or landed bonus healing.
//   - timed_not_trigger: the buff is a window of durationNights dawns (data lever, feast-surge.json), never an on-strike burn (code: grantFeastBuff, feastedActive)
//   - no_double_stack: re-feasting while feasted REFRESHES (better quality wins, expiry extends) — never stacks (code: grantFeastBuff)
//   - honest_use_marking: feastSurgeUsed marks real combat use or actually landed bonus healing; failed/base-only treatment spends no devotion (code: _spendFeastedPower)
//   - clean_expiry: expiry is lazy-evaluated against absolute (untilDay, untilPart) — save/load mid-buff is clean, no phantom buffs (code: feastedActive)
//   - generic_forms: feasted ability variants are data-driven (feast-surge.json twists) through generic handlers — never hand-written per-ability mechanics (code: applyFeastedForm)
//   - telegraph_honesty: every buff label states the true effective multiplier AND the true window ("dawn"/"tomorrow's dawn" via feastDawnWord, read from the same data lever as the grant — never a stale "until dawn") (code: grantFeastBuff, feastedLine, tbDamage hook in game.js; arm message in progression.js; feast broadcast + report panel)
//   - arc4_hotter: Arc IV's arc4burn multiplies the granted buff and is stated in the grant line (code: grantFeastBuff)
// consumes:
//   - state.scholar (feastBuff, prog.feastSurge, prog.feastSurgeUsed, day, health, feastDraw)
//   - dayPart, inCombat, tbFighter, addHealth, say, save
//   - Game.data.feastSurge (src/data/feast-surge.json)
//   - castMonster, startCombat, pendingEncounter/pendingMonsterId, monsterDisplayName, seedGossip
// NOTE: self-attaching module (Object.assign(Game, methods)). Load AFTER
// game.js. The strike/ability uplift hooks live at their call sites
// (game.js tbDamage player-source hook; abilityActions.js useAbility +
// activateAbility wrappers) and call into these methods defensively.
// Index order: after waveLedger.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const methods = {
    // feastDawnWord: the honest window word for the buff ("dawn" or
    // "tomorrow's dawn"), read from the same data lever as grantFeastBuff.
    // Every promise of the window — the channel arm message, the feast
    // broadcast, the report panel, the buff labels — must use this. A stale
    // "until dawn" understates a 2-dawn window (telegraph honesty).
    feastDawnWord() {
      try {
        const cfg = (typeof this.feastSurgeCfg === 'function') ? this.feastSurgeCfg() : null;
        const nights = Math.max(1, (cfg && cfg.durationNights) || 1);
        return nights === 1 ? 'dawn' : "tomorrow's dawn";
      } catch (e) { return 'dawn'; }
    },
    // feastSurgeCfg: the levers, from src/data/feast-surge.json. Defensive —
    // the ship loop may run a tree without the file; defaults match the JSON.
    feastSurgeCfg() {
      try {
        const d = (this.data && this.data.feastSurge) || {};
        const b = d.buff || {};
        return {
          duration: b.duration || 'until_next_dawn',
          durationNights: b.durationNights || 2,
          partsPerDay: b.partsPerDay || 4,
          qualityNames: Object.assign(
            { 0: 'a simple feast', 1: 'a proper feast', 2: 'a legendary spread' },
            b.qualityNames || {}
          ),
          qualityUplift: Object.assign({ 0: 1.2, 1: 1.35, 2: 1.5 }, b.qualityUplift || {}),
          surgeDefault: b.surgeDefault != null ? b.surgeDefault : 1.5,
          feastMinimums: d.feastMinimums || { minFeastKcal: 1500, minGuests: 3 },
          refeast: d.refeast || { policy: 'refresh', quality: 'best' },
          twists: d.twists || {},
          feastDraw: d.feastDraw || { chance: 1.0 },
        };
      } catch (e) {
        return {
          duration: 'until_next_dawn', durationNights: 2, partsPerDay: 4,
          qualityNames: { 0: 'a simple feast', 1: 'a proper feast', 2: 'a legendary spread' },
          qualityUplift: { 0: 1.2, 1: 1.35, 2: 1.5 }, surgeDefault: 1.5,
          feastMinimums: { minFeastKcal: 1500, minGuests: 3 },
          refeast: { policy: 'refresh', quality: 'best' }, twists: {},
          feastDraw: { chance: 1.0 },
        };
      }
    },

    // grantFeastBuff(feast): Worker A's feast event calls this with
    // { quality: 0..2, served: [{itemId, kcal}], guests: [ids], daypart,
    //   surge: armed devotion value carried by the feast (0 when none) }.
    // Validates the devotion gate — armed means scholar.prog.feastSurge OR
    // the feast-carried surge (hostFeast must not disarm before the grant);
    // sets buff state with absolute dawn expiry, returns the granted buff or
    // an honest refusal. NEVER stacks: a live buff is refreshed (better
    // quality wins, window extends to next dawn).
    grantFeastBuff(feast) {
      const cfg = this.feastSurgeCfg();
      const s = this.state.scholar || {};
      feast = feast || {};
      try {
        // FUSION REACTOR CEILING (Steve 2026-10-12): an online reactor crowds
        // out the feast's fire — the steady hum leaves no room for the surge.
        // The reactor's flat 1.25x (feastedMult) is all there is. Honest
        // refusal, stated plainly: the engine that never hungers never feasts.
        const online = (typeof this.fusionReactorOnline === 'function') && this.fusionReactorOnline();
        if (online) {
          const why = 'The feast is warm and good — but your reactor hums its steady note underneath, and the fire never catches. 1.25x, always, is all there is. (Feast buff refused: the reactor is a ceiling as well as a floor.)';
          this.say('🍖 ' + why);
          return { granted: false, why };
        }
        // The arming may ride in on the feast (hostFeast carries
        // scholar.prog.feastSurge in feast.surge) or sit on prog directly.
        const armed = (s.prog || {}).feastSurge || feast.surge;
        if (!armed) {
          const why = 'The feast is warm and good — full bellies, loud laughter — but no keepsake was channeled. The surge must be armed before a feast can carry it: hold a keepsake and channel first. (Feast buff refused: devotion gate.)';
          this.say('🍖 ' + why);
          return { granted: false, why };
        }
        let q = Math.round(feast.quality != null ? feast.quality : 0);
        if (!(q >= 0)) q = 0;
        q = Math.max(0, Math.min(2, q));
        const surge = (typeof armed === 'number' && armed > 0) ? armed : cfg.surgeDefault;
        // ARC IV (progression.js): "the feast was the weapon" pays off — the
        // System finally sees that eating is the engine, and feasted buffs
        // burn hotter from here. Stated in the grant line, never silent.
        const arcBurn = (typeof s.arc4burn === 'number' && s.arc4burn > 1) ? s.arc4burn : 1;
        const arcNote = arcBurn > 1 ? ' Arc IV burns hotter.' : '';
        const effMult = (uplift, sg) => Math.round(uplift * sg * arcBurn * 100) / 100;
        const day = s.day || 0;
        // LONGSIM WINPATH R3 (2026-10-12): the window is durationNights dawns,
        // not one. A feast lands in the evening with no ticks left to find a
        // fight; the next day's hunt must count. Data lever in feast-surge.json.
        const nights = Math.max(1, cfg.durationNights || 1);
        const untilDay = day + nights, untilPart = 0; // the Nth dawn, always
        const dawnWord = this.feastDawnWord();
        const existing = this.feastedBuffState();
        if (existing) {
          // REFEAST = REFRESH (design call 2026-10-10): the window extends to
          // the next dawn and the better quality wins. The multiplier is
          // recomputed, never multiplied onto itself — no double-feast.
          // (If the old buff was already used in combat, the arming was
          // consumed, so this branch is unreachable without fresh devotion.)
          const nq = Math.max(existing.quality || 0, q);
          const nuplift = cfg.qualityUplift[nq] || 1;
          existing.quality = nq;
          existing.uplift = nuplift;
          existing.surge = surge;
          existing.mult = effMult(nuplift, surge);
          existing.untilDay = untilDay;
          existing.untilPart = untilPart;
          const parts = Math.max(1, (untilDay - day) * cfg.partsPerDay - this.dayPart);
          this.say(`🍖 The feast carries you on — the fire is stoked higher, not doubled. FEASTED ×${existing.mult} until ${dawnWord} (${parts} ${parts === 1 ? 'part' : 'parts'} left): ${cfg.qualityNames[nq]}.${arcNote} (Re-feast refreshes; it never stacks.)`);
          try { this.save(); } catch (e) {}
          return { granted: true, refreshed: true, mult: existing.mult, untilDay, untilPart, quality: nq };
        }
        const uplift = cfg.qualityUplift[q] || 1;
        const mult = effMult(uplift, surge);
        s.feastBuff = {
          day, part: this.dayPart, quality: q, uplift, surge, mult,
          untilDay, untilPart, used: false,
          served: feast.served || [], guests: feast.guests || [],
        };
        const parts = Math.max(1, (untilDay - day) * cfg.partsPerDay - this.dayPart);
        const devNote = surge > 1 ? ` A channeled keepsake feeds the flames (devotion ×${surge}).` : '';
        this.say(`🍖 FEASTED ×${mult} until ${dawnWord} (${parts} ${parts === 1 ? 'part' : 'parts'} left): ${cfg.qualityNames[q]}.${devNote}${arcNote} Strikes and abilities hit with the feast behind them.`);
        // LONGSIM WINPATH R4 (2026-10-12): the cookfire's smoke draws
        // scavengers — a FRESH armed grant leaves a beast circling the
        // haven's edge. The deed's fight comes to the village; only the
        // encounter lottery is removed, never the fight itself.
        let draw = null;
        try { draw = (typeof this.drawFeastScavenger === 'function') ? this.drawFeastScavenger() : null; } catch (e) {}
        try { this.save(); } catch (e) {}
        return { granted: true, refreshed: false, mult, untilDay, untilPart, quality: q, draw: (draw && draw.drawn) ? draw.monsterId : null };
      } catch (e) {
        return { granted: false, why: 'grant failed: ' + (e && e.message) };
      }
    },

    // feastedActive: the buff is live. Expiry is lazy: the buff carries an
    // absolute (untilDay, untilPart=dawn); once the day reaches untilDay it
    // is cleared with its fade line, exactly once. Save/load safe — a buff
    // saved mid-window is still valid after Continue (dawn hasn't come); a
    // buff whose dawn passed is gone, never phantom.
    feastedActive() {
      try {
        const s = this.state.scholar || {};
        const b = s.feastBuff;
        if (!b || typeof b !== 'object') return false;
        const day = s.day || 0;
        if (day >= (b.untilDay || 0)) {
          this.clearFeastBuff(true);
          return false;
        }
        return true;
      } catch (e) { return false; }
    },

    // feastedBuffState: the live buff object, or null.
    feastedBuffState() {
      try {
        return this.feastedActive() ? (this.state.scholar || {}).feastBuff : null;
      } catch (e) { return null; }
    },

    // feastedMult: the true effective multiplier while feasted, else 1.
    // qualityUplift × devotion surge — one number for strikes and abilities.
    // GROUNDING (table.js): the dark relay becomes what forgot food — food
    // conversions weaken as grounding erodes. Always telegraphed in
    // feastedLine below.
    feastedMult() {
      const b = this.feastedBuffState();
      const base = b ? (b.mult || 1) : 1;
      const g = (typeof this.groundingMult === 'function') ? this.groundingMult() : 1;
      let out = base * g;
      // FUSION REACTOR (Steve 2026-10-12): the free food boost — an online
      // reactor burns with a steady 1.25x (proper-feast level), always on.
      // It never stacks: a real feast buff, when higher, wins. The reactor is
      // a floor AND a ceiling — food remains the path to PEAK power
      // (legendary 1.5x, Arc IV hotter). The engine that never hungers also
      // never feasts.
      try {
        const online = (typeof this.fusionReactorOnline === 'function') && this.fusionReactorOnline();
        if (online && out < 1.25) out = 1.25;
      } catch (e) {}
      return out;
    },

    // clearFeastBuff(expired): drop the buff. The fade line fires once, only
    // on real expiry — never on manual clears.
    clearFeastBuff(expired) {
      try {
        const s = this.state.scholar || {};
        if (!s.feastBuff) return;
        delete s.feastBuff;
        // LONGSIM WINPATH R4: the fire is cold, the smell fades — a still-
        // circling drawn beast gets bored and moves on. Only OUR draw is
        // cleared (matched by monsterId): a wanderer pending behind it is
        // someone else's encounter. The devotion was never spent by waiting;
        // only real combat spends it (noteFeastedCombatUse).
        try {
          const d = s.feastDraw;
          if (d && d.monsterId) {
            if (this.pendingEncounter && this.pendingMonsterId === d.monsterId) {
              this.pendingEncounter = false;
              this.pendingMonsterId = null;
              if (expired) this.say('The thing at the edge of the light gives up and moves on. The fire is cold now.');
            }
            delete s.feastDraw;
          }
        } catch (e) {}
        if (expired) this.say("The feast's fire burns low — the buff fades with the night. (Feasted expired.)");
      } catch (e) {}
    },

    // feastedLine: the visible countdown for the status row. Honest label:
    // true mult, parts remaining, what it does.
    feastedLine() {
      try {
        const b = this.feastedBuffState();
        // FUSION REACTOR (Steve 2026-10-12): the steady hum is visible — no
        // silent buffs. When the reactor carries the multiplier, say so.
        if (!b) {
          const online = (typeof this.fusionReactorOnline === 'function') && this.fusionReactorOnline();
          if (online) return 'REACTOR · damage ×1.25 · ability bonuses · always active';
          return '';
        }
        const cfg = this.feastSurgeCfg();
        const s = this.state.scholar || {};
        const parts = Math.max(0, ((b.untilDay || 0) - (s.day || 0)) * cfg.partsPerDay - this.dayPart);
        const eff = this.feastedMult();
        const gnote = (eff < (b.mult || 1)) ? ` (reduced by ${((typeof this.groundingTier === 'function') ? this.groundingTier() : '')} grounding)` : '';
        return `FEASTED · damage ×${Math.round(eff * 100) / 100} · ${parts} day ${parts === 1 ? 'part' : 'parts'} left${gnote}`;
      } catch (e) { return ''; }
    },

    // feastedForm(abilityId, actionId): the feasted variant of a known
    // ability — almost-evolved, with a timer. { mult, twist }. Default is
    // clean uplift (no twist); twists come from feast-surge.json, keyed
    // 'abilityId.actionId' with fallback to 'abilityId'.
    feastedForm(abilityId, actionId) {
      const cfg = this.feastSurgeCfg();
      const twists = (cfg && cfg.twists) || {};
      const key = actionId ? abilityId + '.' + actionId : abilityId;
      const twist = (twists[key] || twists[abilityId]) || null;
      return { mult: this.feastedMult(), twist };
    },

    // _feastPreHp: snapshot for heal measurement. Fighter HP is the live pool
    // mid-combat (addHealth routes there); scholar.health out of combat.
    _feastPreHp() {
      try {
        const s = this.state.scholar || {};
        let fighter = null;
        try {
          if (this.inCombat && this.inCombat() && this.tbFighter) {
            const p = this.tbFighter('p');
            fighter = p ? (p.hp || 0) : null;
          }
        } catch (e) {}
        return { scholar: s.health || 0, fighter };
      } catch (e) { return { scholar: 0, fighter: null }; }
    },
    _feastHpTotal() {
      try {
        const s = this.state.scholar || {};
        let t = s.health || 0;
        try {
          if (this.inCombat && this.inCombat() && this.tbFighter) {
            const p = this.tbFighter('p');
            if (p) t = p.hp || 0;
          }
        } catch (e) {}
        return t;
      } catch (e) { return 0; }
    },

    // applyFeastedForm(abilityId, actionId, target, preHp): called after a
    // SUCCESSFUL ability resolution while feasted (useAbility + the legacy
    // activateAbility branch). Generic uplift already applied at the damage
    // funnels; here the data-driven TWIST runs — the wacky almost-evolved
    // bit, where the fiction supports it. Also the combat-use marker: any
    // ability resolved in combat while feasted counts as real use.
    applyFeastedForm(abilityId, actionId, target, preHp) {
      try {
        if (!this.feastedActive()) return;
        if (this.inCombat && this.inCombat()) this.noteFeastedCombatUse();
        const form = this.feastedForm(abilityId, actionId);
        const tw = form.twist;
        if (!tw || !tw.kind) return;
        if (tw.kind === 'heal_bonus') this._feastHealBonus(tw, preHp);
        else if (tw.kind === 'status_extend') this._feastStatusExtend(tw);
      } catch (e) {}
    },

    // _feastHealBonus: the feasted form of a heal — measure what the ability
    // actually healed, then grant the bonus on top, stating the TRUE landed
    // number (addHealth may clamp at max).
    _feastHealBonus(tw, preHp) {
      try {
        let gained = 0;
        if (preHp) {
          const s = this.state.scholar || {};
          gained += Math.max(0, (s.health || 0) - (preHp.scholar || 0));
          if (preHp.fighter != null) {
            try {
              const p = this.tbFighter ? this.tbFighter('p') : null;
              if (p) gained += Math.max(0, (p.hp || 0) - preHp.fighter);
            } catch (e) {}
          }
        }
        gained = Math.round(gained);
        if (gained <= 0) return;
        const want = Math.max(1, Math.round(gained * ((tw.pct || 50) / 100)));
        const before = this._feastHpTotal();
        try { this.addHealth(want); } catch (e) {}
        const landed = Math.max(0, Math.round(this._feastHpTotal() - before));
        if (landed <= 0) return;
        const line = String(tw.line || 'Feasted: +{bonus} HP.').replace('{bonus}', String(landed));
        this.say(line);
        this._spendFeastedPower('healing', landed);
      } catch (e) { console.warn('[feastSurge] healing use', e); }
    },

    // _feastStatusExtend: the feasted form holds the ability's status longer.
    // Extends the engine entry AND any legacy parallel field (stun's
    // m.stunned, blind's m.blind) so the tracks stay in sync. Fires only if
    // at least one foe was actually extended — never a lie.
    _feastStatusExtend(tw) {
      try {
        const st = tw.status, rounds = tw.rounds || 1;
        if (!st) return;
        const f = this.tbfight;
        if (!f || !f.fighters) return;
        let n = 0;
        for (const m of f.fighters) {
          if (!m || !m.alive || m.fled) continue;
          if (m.kind !== 'monster' && m.kind !== 'hostile') continue;
          let has = false;
          try { has = this.hasStatus ? !!this.hasStatus(m, st) : false; } catch (e) {}
          if (!has && !(typeof m[st] === 'number' && m[st] > 0)) continue;
          try {
            const list = this.seList ? this.seList(m) : [];
            for (const e of list) {
              if (e.id === st && e.turnsLeft != null) { e.turnsLeft += rounds; n++; break; }
            }
            if (typeof m[st] === 'number' && m[st] > 0) { m[st] += rounds; n++; }
            else if (st === 'stun' && typeof m.stunned === 'number') { m.stunned += rounds; n++; }
          } catch (e) {}
        }
        if (n > 0) this.say(tw.line || `Feasted: the ${st} holds ${rounds} round longer.`);
      } catch (e) {}
    },

    // First real combat use or landed bonus healing spends devotion once.
    // noteFeastedCombatUse retains combat-only entry — a strike or
    // an ability resolved while feasted and in combat. Marks feastSurgeUsed
    // (Arc IV deed-gate requirement) and spends the devotion arming.
    // Idempotent. A feast that warms no blades marks nothing and spends
    // nothing — the devotion stays armed for the next feast.
    // SEATBLOW-OPEN (Steve 2026-10-17): the deed is banked by whoever's blow
    // lands first — the scholar ('p') or a villager ('v:<villagerId>', set
    // via _feastUseSource by the tbDamage hook). Per-villager deed shares
    // read from prog.feastSurgeBy.
    _spendFeastedPower(kind, bonusHp) {
      try {
        if (!this.feastedActive()) return;
        if (kind === 'combat') {
          if (!this.inCombat || !this.inCombat()) return;
        } else if (kind !== 'healing' || !(bonusHp > 0)) return;
        const s = this.state.scholar || {};
        const b = s.feastBuff;
        if (!b || b.used) return;
        b.used = true;
        b.use = { kind, day: s.day, bonusHp: kind === 'healing' ? bonusHp : 0 };
        s.prog = s.prog || {};
        s.prog.feastSurge = false;
        s.prog.feastSurgeUsed = true;
        // Keep the actual first combat source; healing belongs to the bearer.
        s.prog.feastSurgeBy = kind === 'combat' ? (this._feastUseSource || 'p') : 'p';
        this._feastUseSource = null;
        this.save();
      } catch (e) { console.warn('[feastSurge] spending power', e); }
    },
    noteFeastedCombatUse() {
      this._spendFeastedPower('combat');
    },

    // drawFeastScavenger: the cookfire's smoke draws something. A loud,
    // smoky, bloody feast carried the armed devotion into the buff — the
    // smell carries past the firelight too. Cast a wave-appropriate beast
    // (castMonster: threat-rated, never a horror over a pointy stick) and
    // leave it circling the haven's edge as a pending encounter, with the
    // choice owned by the player: faceFeastDraw() or driveOffFeastDraw().
    // Called ONLY on a fresh grant (never a refresh — one draw per buff)
    // and only for armed-devotion feasts (grantFeastBuff gates: unarmed
    // feasts return before this line). Deed-scoped: the village feast
    // stays the social engine without a monster tax.
    drawFeastScavenger() {
      try {
        const cfg = this.feastSurgeCfg();
        const dc = (cfg && cfg.feastDraw) || {};
        const chance = (dc.chance != null && !isNaN(dc.chance)) ? dc.chance : 1.0;
        const s = this.state.scholar || {};
        // NO SILENT CLOBBER (break-it combat 2026-10-09): a live pending
        // encounter is someone else's beast (the wanderer's). Never stack
        // into a phantom the panel can't render twice.
        if (this.pendingEncounter) {
          this.say('Something pads at the edge of the light — then thinks better of it. This ground is already claimed. (The feast drew a scavenger, but the way is already watched.)');
          return { drawn: false, why: 'already pending' };
        }
        if (Math.random() >= chance) return { drawn: false, why: 'smoke carried clear' };
        let cast = null;
        try { cast = (typeof this.castMonster === 'function') ? this.castMonster() : null; } catch (e) { cast = null; }
        let mid = null, veteran = false;
        if (typeof cast === 'string') mid = cast;
        else if (cast && typeof cast === 'object') { mid = cast.id || cast.monsterId || null; veteran = !!cast.veteran; }
        if (!mid) return { drawn: false, why: 'no cast' };
        let mdef = null;
        try { mdef = ((this.data || {}).monsters || []).find(m => m.id === mid) || null; } catch (e) {}
        if (!mdef) return { drawn: false, why: 'unknown id ' + mid };
        s.feastDraw = { monsterId: mid, veteran, day: s.day || 0 };
        this.pendingEncounter = true;
        this.pendingMonsterId = mid;
        // RAID-NAMING (sim-raidname-b 2026-10-29): a feast-draw
        // pending overwrites any raid pending — the raid
        // provenance shadow goes with it, never stale-matches
        // a later same-species fight.
        this.raidPendingMonsterId = null;
        let mname = 'something out there';
        try { mname = (typeof this.monsterDisplayName === 'function' && this.monsterDisplayName(mid)) || mname; } catch (e) {}
        const cap = String(mname); const shown = cap[0].toUpperCase() + cap.slice(1);
        this.say(`🌙 The cookfire's smell carried further than the laughter did — smoke and grease on the night wind. ${shown} is circling the edge of the light. It followed the feast here. (A scavenger, drawn by the feast. Face it while the feast is in you — or let the watch drive it off.)`);
        try { if (typeof this.seedGossip === 'function') this.seedGossip('feast-draw', { monster: mid }, []); } catch (e) {}
        return { drawn: true, monsterId: mid, veteran };
      } catch (e) {
        return { drawn: false, why: 'draw failed: ' + (e && e.message) };
      }
    },

    // feastDrawPending: the live draw, or null. Self-cleaning: if the
    // pending encounter was resolved elsewhere (faced via the raw panel,
    // the wanderer, a load), the stale marker is dropped rather than lied
    // about. The draw also lives and dies with the BUFF — no buff, no
    // beast (mantle pass deletes the buff with the old body; expiry
    // clears explicitly). Never returns a beast that isn't actually
    // waiting.
    feastDrawPending() {
      try {
        const s = this.state.scholar || {};
        const d = s.feastDraw;
        if (!d || !d.monsterId) return null;
        if (!(this.feastedActive && this.feastedActive())) {
          try { delete s.feastDraw; } catch (e) {}
          return null;
        }
        if (!this.pendingEncounter || this.pendingMonsterId !== d.monsterId) {
          try { delete s.feastDraw; } catch (e) {}
          return null;
        }
        return d;
      } catch (e) { return null; }
    },

    // faceFeastDraw: meet the thing at the edge of the light. The marker is
    // cleared AFTER startCombat reads it (startCombat reads s.feastDraw's
    // veteran flag for the variant). The fight is real, blow-by-blow —
    // startCombat's breach beat fires, the party joins, the deed feeds.
    faceFeastDraw() {
      try {
        if (this.tbfight && !this.tbfight.over) {
          this.say('Already in a fight — finish this one first. (faceFeastDraw refused: a fight is live.)');
          return { ok: false, why: 'already in combat' };
        }
        if (this.over) return { ok: false, why: 'game over' };
        const d = this.feastDrawPending();
        if (!d) { this.say('Nothing is circling the firelight. (No feast draw pending.)'); return { ok: false }; }
        const s = this.state.scholar || {};
        const mid = d.monsterId;
        try { this.startCombat(mid); } finally {
          try { delete s.feastDraw; } catch (e) {}
        }
        return { ok: true, monsterId: mid };
      } catch (e) { return { ok: false, why: (e && e.message) || 'face failed' }; }
    },

    // driveOffFeastDraw: the watch meets it with brands and noise. The
    // beast was never brave. No fight, no devotion spent, the buff stays
    // live until its dawn — declining the fight declines the deed, honestly.
    // The watchers get the memory (they earned it).
    driveOffFeastDraw() {
      try {
        const d = this.feastDrawPending();
        if (!d) return { ok: false };
        const s = this.state.scholar || {};
        // SHORT-NAME (longsim winpath r4): strangers are descriptors, not
        // names — "A person, maybe 20s", never "A". Dedupe: four strangers
        // must not read as "A takes up a brand and A follows".
        const disp = (id) => {
          try {
            const dn = String(this.displayName(id));
            return /^an? /i.test(dn) ? dn : dn.split(' ')[0]; // the whole descriptor is the name
          } catch (e) { return null; }
        };
        let names = [];
        try {
          const roster = (((this.state || {}).village || {}).roster || []).filter(id => id !== this.villagerId).slice(0, 2);
          names = [...new Set(roster.map(disp).filter(Boolean))];
        } catch (e) {}
        const who = names.length >= 2 ? `${names[0]} takes up a brand and ${names[1]} follows`
          : names.length === 1 ? `${names[0]} takes up a brand`
          : 'The watch takes up brands';
        let mname = 'it';
        try { mname = (typeof this.monsterDisplayName === 'function' && this.monsterDisplayName(d.monsterId)) || mname; } catch (e) {}
        const mshown = mname ? mname.charAt(0).toUpperCase() + mname.slice(1) : 'It';
        try { delete s.feastDraw; } catch (e) {}
        this.pendingEncounter = false;
        this.pendingMonsterId = null;
        try {
          for (const nm of names) {
            const vid = (((this.state || {}).village || {}).roster || []).find(id => disp(id) === nm);
            if (vid && typeof this.remember === 'function') this.remember(vid, 'watch', `Drove off the feast's scavenger with a brand and a shout. It was never brave.`);
          }
        } catch (e) {}
        this.say(`🔥 ${who} — they meet it at the edge of the light with noise and fire. ${mshown} was never brave. It melts back into the dark. (The watch drove off the feast's scavenger. The devotion stays armed; the feast's fire still burns in you.)`);
        return { ok: true, drivenOff: true };
      } catch (e) { return { ok: false }; }
    },
  };
  Object.assign(Game, methods);
})();
