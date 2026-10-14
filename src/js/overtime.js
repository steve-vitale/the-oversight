// @ontology
// system: overtime
// description: OVERTIME — the Table's waiting cost (Steve 2026-10-14: "waiting should have a cost- but also an opportunity for the truly powerful. Waves get truly ridiculous"). Once the Table exists for the player (announced, day 90+, seat not none) and they have not sat, every 7 days raises a tier (cap 6). Each tier: wave-4/5 fights become RERUNS (HP, damage and pack size stack per tier, a "RERUN ×N" label), the world holds more monsters, raids come sooner and more often, lingering raiders gorge harder, and the live seat price drops (standing per tier and per Haven loss). The System announces each tier on air. At tier 2 the run's uncast apocalypse titan airs too; at the key tier with all three titans slain, THE NETWORK is summoned (network-campaign.js). Tuning is data: titans.json _overtime.
// provides:
//   - overtimeActive() -> bool: the clock is running (table set, announced, day 90+, seat not none, not seated)
//   - overtimeTier() -> 0..maxTier
//   - overtimeTick() -> daily: count unseated days, raise the tier aloud, check the key
//   - overtimeStanding() -> {tier, losses, penalty} the seat-price cost
//   - overtimeThirdTitan() -> the uncast apocalypse id once tier >= thirdTitanTier (titans.js reads it)
//   - overtimeRaidKnobs() -> {cooldown, skip, gorge} or null at tier 0 (havenGrowth.js reads it)
//   - overtimeScaleFight(mid) -> applies the RERUN modifiers to a just-started fight
//   - networkKeyReady() -> the key's gate (tier >= the_network.keyTier AND herald, nielsen, finale slain)
// rules:
//   - no_spoilers: nothing ticks, shows or speaks before the Table exists for the player (tableAnnounced + winDayFloorOk) (code: overtimeActive)
//   - stops_when_seated: tableDone stops the clock; the tier never rises after the seat is taken (code: overtimeActive)
//   - tier_is_monotonic: the tier never falls; a withdrawn seat pauses the clock, it does not reset it (code: overtimeTick)
//   - zero_at_tier_zero: every knob is a no-op at tier 0, so runs that sit promptly play exactly as before (code: overtimeRaidKnobs)
//   - reruns_not_titans: scaling skips titans, campaign nodes and anything below minWave (code: overtimeScaleFight)
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
      try { return Math.max(0, Math.min(num('maxTier', 6), this.progState().overtime | 0)); } catch (e) { return 0; }
    },
    overtimeTick() {
      try {
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
        const slain = ((this.state.titans || {}).slain) || {};
        return !!(slain.herald && slain.nielsen && slain.finale);
      } catch (e) { console.warn('networkKeyReady', e); return false; }
    },
    // overtimeScaleFight(mid): RERUN ×N — applied to a fight startCombat just built.
    overtimeScaleFight(mid) {
      const t = this.overtimeTier();
      const f = this.tbfight;
      if (!t || !f || !f.fighters || f.otTier) return false;
      if (this.tableActive && this.tableActive()) return false;
      const mdef = (this.data.monsters || []).find(m => m.id === mid);
      if (!mdef || (mdef.wave || 1) < num('minWave', 4) || mdef.campaignOnly) return false;
      if (this.isTitan && this.isTitan(mid)) return false;
      f.otTier = t;
      const hpM = 1 + num('hpPerTier', 0.25) * t;
      const extra = Math.floor(t / num('packEveryTiers', 2));
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
      try { const t = this.overtimeTier(); if (t) add = Math.ceil(t / num('capEveryTiers', 2)); } catch (e) { console.warn('overtime cap', e); }
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
