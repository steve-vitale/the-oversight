// @ontology
// system: overtime
// description: OVERTIME — earned Table waiting cost plus the calendar survival floor (Steve 2026-10-23: Easter egg around day150 is already intolerably hard;180 is a very long game). Table waiting rises weekly to6; independently, day120+ raises an uncapped weekly floor without requiring a Table. Ordinary world monsters and NPC field fights grow stronger, raids gorge harder; pack/cap additions remain physically bounded. Calendar-only Network qualification starts at150 and still requires all three titan victories. Tuning: titans.json _overtime.
// provides:
//   - overtimeActive() -> bool: the clock is running (table set, announced, day 90+, seat not none, not seated)
//   - overtimeTier() -> max(Table tier capped at6, uncapped calendar floor)
//   - survivalPressureTier() -> calendar floor, rising weekly from day120 without a plateau
//   - survivalPressureTick() -> warn before onset; announce calendar tiers without requiring a Table
//   - overtimeMonsterPressure(mid) -> shared ordinary-monster HP/damage/pack coefficients
//   - overtimeTick() -> daily: count unseated days, raise the tier aloud, check the key
//   - overtimeStanding() -> {tier, losses, penalty} the seat-price cost
//   - overtimeThirdTitan() -> the uncast apocalypse id once tier >= thirdTitanTier (titans.js reads it)
//   - overtimeRaidKnobs() -> {cooldown, skip, gorge} or null at tier 0 (havenGrowth.js reads it)
//   - overtimeScaleFight(mid) -> applies the RERUN modifiers to a just-started fight
//   - networkKeyReady() -> the key's gate (tier >= the_network.keyTier AND herald, nielsen, finale slain)
// rules:
//   - no_table_spoilers: the Table clock requires its announcement; calendar warnings name only world danger (code: overtimeActive/survivalPressureTick)
//   - stops_when_seated: tableDone stops the clock; the tier never rises after the seat is taken (code: overtimeActive)
//   - tier_is_monotonic: the tier never falls; a withdrawn seat pauses the clock, it does not reset it (code: overtimeTick)
//   - zero_at_tier_zero: every knob is a no-op at tier0 (code: overtimeRaidKnobs)
//   - reruns_not_titans: scaling skips titans/campaign nodes; calendar pressure includes lower-wave ordinary beasts (code: overtimeMonsterPressure)
// consumes:
//   - progState(), tableSeat(), winDayFloorOk(), titanCast(), sysSay, say, tele, recordMoment
//   - startCombat() (wrapped: RERUN scaling after the fight is built)
//   - tbDamage() (wrapped: rerun hits land harder)
//   - worldMonsterCap() (wrapped: more monsters per tier)
//   - endDay() (wrapped: the daily overtime tick)
//   - campaignInjectMonster() (finale-campaign.js: rerun packmates)
//   - networkSummon() (network-campaign.js: the key)
// Load AFTER finale-campaign.js and table.js; BEFORE network-campaign.js is fine (dynamic dispatch).
(function () {
  'use strict';
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function cfg() {
    try { return ((Game.data && Game.data.titans) || {})._overtime || {}; } catch (e) { console.warn('overtime cfg', e); return {}; }
  }
  function num(k, d) { const v = cfg()[k]; return (typeof v === 'number') ? v : d; }
  function today() { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
  function rosterIds() {
    try { return ((Game.state.village || {}).roster || []).slice(); } catch (e) { return []; }
  }

  const methods = {
    overtimeActive() {
      try {
        const pg = this.progState();
        if (!pg.tableWaiting || pg.tableDone || !pg.tableAnnounced) return false;
        if (!this.winDayFloorOk || !this.winDayFloorOk()) return false;
        const seat = this.tableSeat ? this.tableSeat() : { seat: 'none' };
        return seat.seat !== 'none';
      } catch (e) { console.warn('overtimeActive', e); return false; }
    },
    overtimeTier() {
      try { return Math.max(0, Math.min(num('maxTier', 6), this.progState().overtime | 0), this.survivalPressureTier()); } catch (e) { console.warn('overtimeTier', e); return 0; }
    },
    survivalPressureTier() {
      const pg = (this.state.scholar || {}).prog || {};
      if (cfg().calendarEnabled === false || pg.tableDone) return 0;
      const start = num('calendarStartDay', 120), span = Math.max(1, num('calendarDaysPerTier', 7));
      return today() < start ? 0 : 1 + Math.floor((today() - start) / span);
    },
    survivalPressureTick(announceOnly) {
      if (cfg().calendarEnabled === false || this.over || ((this.state.scholar || {}).prog || {}).tableDone) return;
      const day = today();
      if (day < num('calendarWarningDay', 110)) return;
      const st = this.state.longSurvival || (this.state.longSurvival = { announcedTier: 0, warned: false });
      if (!st.warned) {
        st.warned = true;
        if (day < num('calendarStartDay', 120)) this.say(String(cfg().calendarWarningLine || 'The season is running long. The beasts and raids will keep growing stronger.')
          .replace('{startDay}', String(num('calendarStartDay', 120))).replace('{daysPerTier}', String(num('calendarDaysPerTier', 7))));
      }
      const tier = this.survivalPressureTier();
      if (tier > (st.announcedTier || 0)) {
        st.announcedTier = tier;
        const effectiveTier = this.overtimeTier();
        this.say(`Day ${day}: the long season tightens its grip. Ordinary monsters have +${Math.round(num('hpPerTier', 0.25) * effectiveTier * 100)}% HP and +${Math.round(num('dmgPerTier', 0.12) * effectiveTier * 100)}% damage. Raids come sooner and eat more. This pressure will keep rising.`);
        this.tele('survival_pressure_tier', { day, tier, effectiveTier });
      }
      if (!announceOnly && this.networkKeyReady() && typeof this.networkSummon === 'function') this.networkSummon();
    },
    overtimeMonsterPressure(mid) {
      const tier = this.overtimeTier(), calendar = this.survivalPressureTier() > 0;
      const mdef = (this.data.monsters || []).find(m => m.id === mid);
      if (!tier || !mdef || mdef.campaignOnly || (this.isTitan && this.isTitan(mid))) return null;
      if ((mdef.wave || 1) < num(calendar ? 'calendarMinWave' : 'minWave', calendar ? 1 : 4)) return null;
      return { tier, hpMult: 1 + num('hpPerTier', 0.25) * tier, damageMult: 1 + num('dmgPerTier', 0.12) * tier,
        packExtra: Math.min(num('maxPackExtra', 3), Math.floor(tier / Math.max(1, num('packEveryTiers', 2)))) };
    },
    overtimeTick() {
      try {
        this.survivalPressureTick();
        const pg = this.progState();
        const day = today();
        if (pg.overtimeLastDay === day) return;
        pg.overtimeLastDay = day;
        if (!this.overtimeActive()) return;
        // The announcement dawn starts the clock; weeks count from there.
        if (!pg.overtimeStarted) {
          pg.overtimeStarted = true; pg.overtimeDays = 0; pg.overtimeLosses = 0; pg.overtime = pg.overtime | 0;
          pg.overtimeRoster = rosterIds();
          return;
        }
        pg.overtimeDays = (pg.overtimeDays | 0) + 1;
        // Losses: Haven people gone since the clock started lower the price.
        const now = rosterIds();
        const prev = pg.overtimeRoster || [];
        const gone = prev.filter(id => now.indexOf(id) < 0).length;
        if (gone > 0) pg.overtimeLosses = (pg.overtimeLosses | 0) + gone;
        pg.overtimeRoster = now;
        const want = Math.min(num('maxTier', 6), Math.floor(pg.overtimeDays / num('daysPerTier', 7)));
        if (want > (pg.overtime | 0)) {
          pg.overtime = want;
          const lines = cfg().lines || [];
          try { this.sysSay(lines[want - 1] || ('OVERTIME ×' + want + '!')); } catch (e) { console.warn('overtime sysSay', e); }
          const st = this.overtimeStanding();
          this.say(`◈ OVERTIME ×${want} — wave 4–5 monsters return as RERUNS (+${Math.round(num('hpPerTier', 0.25) * want * 100)}% HP, +${Math.round(num('dmgPerTier', 0.12) * want * 100)}% damage${Math.floor(want / num('packEveryTiers', 2)) ? `, +${Math.floor(want / num('packEveryTiers', 2))} to every pack` : ''}). Raids come sooner. The table docks your standing −${st.penalty}. Take your seat from Haven to stop the clock.`);
          try { this.tele('overtime_tier', { tier: want }); } catch (e) { console.warn('overtime tele', e); }
          try { if (this.recordMoment) this.recordMoment(`Overtime ×${want}: the table waited, and the season kept going.`); } catch (e) { console.warn('overtime moment', e); }
        }
        if (this.networkKeyReady() && typeof this.networkSummon === 'function') this.networkSummon();
      } catch (e) { console.warn('overtimeTick', e); }
    },
    overtimeStanding() {
      const pg = this.progState ? this.progState() : {};
      const tier = this.overtimeTier();
      const losses = pg.overtimeLosses | 0;
      const penalty = Math.min(num('standingCap', 40), tier * num('standingPerTier', 4) + losses * num('standingPerLoss', 3));
      return { tier, losses, penalty };
    },
    overtimeThirdTitan() {
      try {
        if (this.overtimeTier() < num('thirdTitanTier', 2)) return null;
        const cast = this.titanCast ? this.titanCast() : null;
        if (!cast) return null;
        return cast.apocalypse === 'finale' ? 'nielsen' : 'finale';
      } catch (e) { console.warn('overtimeThirdTitan', e); return null; }
    },
    overtimeRaidKnobs() {
      const t = this.overtimeTier();
      if (!t) return null;
      return {
        cooldown: Math.max(num('raidCooldownMin', 3), num('raidCooldownBase', 7) - t),
        skip: Math.max(0, num('raidSkipBase', 0.82) - num('raidSkipPerTier', 0.06) * t),
        gorge: 1 + num('gorgePerTier', 0.25) * t,
      };
    },
    networkKeyReady() {
      try {
        const pg = this.progState();
        if (pg.networkSummoned || pg.networkFallen || pg.tableDone) return false;
        const net = this.titanDef ? this.titanDef('the_network') : null;
        const keyTier = (net && net.keyTier) || 3;
        if (this.overtimeTier() < keyTier) return false;
        // The earned Table-overtime road retains its original gate. Calendar
        // pressure can reveal the Easter egg around day150, never by merely
        // missing a Table requirement; the three titan victories still count.
        if ((pg.overtime | 0) < keyTier && today() < num('calendarBossDay', 150)) return false;
        const slain = ((this.state.titans || {}).slain) || {};
        return !!(slain.herald && slain.nielsen && slain.finale);
      } catch (e) { console.warn('networkKeyReady', e); return false; }
    },
    // overtimeScaleFight(mid): RERUN ×N — applied to a fight startCombat just built.
    overtimeScaleFight(mid) {
      const pressure = this.overtimeMonsterPressure(mid), t = pressure && pressure.tier;
      const f = this.tbfight;
      if (!t || !f || !f.fighters || f.otTier) return false;
      if (this.tableActive && this.tableActive()) return false;
      f.otTier = t;
      const hpM = pressure.hpMult;
      const extra = pressure.packExtra;
      for (let i = 0; i < extra; i++) {
        try { if (this.campaignInjectMonster) this.campaignInjectMonster(mid); } catch (e) { console.warn('overtime packmate', e); }
      }
      for (const m of f.fighters) {
        if (m.kind !== 'monster' || m.otTier) continue;
        m.otTier = t;
        m.hp = Math.round(m.hp * hpM); m.maxHp = Math.round((m.maxHp || m.hp) * hpM);
        m.name = `RERUN ×${t} ${m.name}`;
      }
      this.say(`📼 RERUN ×${t} — you have seen this episode. It has seen you too. (Overtime: +${Math.round((hpM - 1) * 100)}% HP, +${Math.round(num('dmgPerTier', 0.12) * t * 100)}% damage${extra ? `, +${extra} in the pack` : ''}.)`);
      return true;
    },
  };
  Object.assign(Game, methods);

  // ---------- wraps (originals always called) ----------
  if (Game.load && !Game.load.__survivalPressureWrapped) {
    const original = Game.load;
    const wrapped = function () {
      const result = original.apply(this, arguments);
      if (result) this.survivalPressureTick(true); // notice only: no dawn, boss spawn or resource charge
      return result;
    };
    wrapped.__survivalPressureWrapped = true;
    Game.load = wrapped;
  }
  if (Game.startCombat && !Game.startCombat.__overtimeWrapped) {
    const orig = Game.startCombat;
    const w = function (monsterId) {
      const mid = monsterId || this.pendingMonsterId || 'bulldozer';
      const r = orig.apply(this, arguments);
      if (r !== null && r !== undefined) {
        try { this.overtimeScaleFight(mid); } catch (e) { console.warn('overtime startCombat', e); }
      }
      return r;
    };
    w.__overtimeWrapped = true;
    Game.startCombat = w;
  }
  if (Game.tbDamage && !Game.tbDamage.__overtimeWrapped) {
    const orig = Game.tbDamage;
    const w = function (targetKey, dmg, label, sourceKey, opts) {
      try {
        if (typeof dmg === 'number' && sourceKey && this.tbfight && this.tbfight.otTier) {
          const src = this.tbFighter(sourceKey);
          const tgt = this.tbFighter(targetKey);
          if (src && src.kind === 'monster' && src.otTier && tgt && tgt.kind !== 'monster') {
            dmg = Math.round(dmg * (1 + num('dmgPerTier', 0.12) * src.otTier));
          }
        }
      } catch (e) { console.warn('overtime tbDamage', e); }
      return orig.call(this, targetKey, dmg, label, sourceKey, opts);
    };
    w.__overtimeWrapped = true;
    Game.tbDamage = w;
  }
  if (Game.worldMonsterCap && !Game.worldMonsterCap.__overtimeWrapped) {
    const orig = Game.worldMonsterCap;
    const w = function () {
      const c = orig.apply(this, arguments);
      let add = 0;
      try { const t = this.overtimeTier(); if (t) add = Math.min(num('maxCapExtra', 3), Math.ceil(t / num('capEveryTiers', 2))); } catch (e) { console.warn('overtime cap', e); }
      return c + add;
    };
    w.__overtimeWrapped = true;
    Game.worldMonsterCap = w;
  }
  if (Game.endDay && !Game.endDay.__overtimeWrapped) {
    const orig = Game.endDay;
    const w = function () {
      const r = orig.apply(this, arguments);
      try { this.overtimeTick(); } catch (e) { console.warn('overtime endDay', e); }
      return r;
    };
    w.__overtimeWrapped = true;
    Game.endDay = w;
  }
})();
