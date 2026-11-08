// scripts/feastchain-instrument-20261107.js — journey-scale r110 Q1
// (lane A, leg 3 SCALE). The feast-surge chain trace.
//
// POLICY-SIDE ONLY. ZERO src/js changes. Read-only daily snapshot +
// pure-delegation wrappers (same pattern as the driver's sayOncePerFight
// wrapper and the regionalstep recorder): every wrapper logs its call
// and forwards exactly — no behavior change, no RNG draw, no state
// write of its own.
//
// The chain, read from code (no FEAST canon doc exists):
//   S0 lesson: teachSentiment() at slot moment t=60 -> pg.sentimentTaught
//   S1 keepsake: channelReadyKeepsakes() non-empty
//   S2 arming: channelSentiment arms when 3+ abilities at L3 OR
//     surgeResonance >= 35; sets prog.feastSurge
//   S3 feast: hostFeast at Haven, dusk, 1/day, pantry >= cost
//   S4 grant: grantFeastBuff refuses if the fusion reactor is online or
//     if unarmed (devotion gate); fresh grant draws a scavenger
//   S5 window: FEASTED for 2 dawns
//   S6 use: strike/ability while feasted AND in combat ->
//     noteFeastedCombatUse -> prog.feastSurgeUsed = true
//   S7 seat: tableSeat foodDeeds = sentimentTaught && feastSurgeUsed
//
// Daily snapshot fields (same point as the driver's tableWatch — after
// baseDaily, before endDay):
//   day, sentiment, slot60, keepsakes, resonance, l3, armed, armedValue,
//   reactor, pantry, gives, feastDay, feasts, surplusFeasts,
//   devotionChannels, feasted, buffUsed, buffUntil, surgeUsed,
//   planOk, planWhy, planCost, planHave
// The feasted read is RAW (s.feastBuff + day < untilDay) — it never calls
// feastedActive(), so the snapshot cannot fire the engine's lazy expiry
// line. feastPlan() is a pure read (it draws on a pantry COPY).
//
// Usage (driver):
//   const FC = require('./feastchain-instrument-20261107');
//   const fc = FC.install(Game);            // after setupGame
//   fc.snapshot(ctx);                        // once per policy day
//   const fin = fc.finalize();               // at seed end
//   fc.uninstall();
// PRE-REGISTER: evidence/2026-11-07/journey-scale-r110-prereg.md
'use strict';

function install(Game) {
  const t = { daily: [], calls: [], grants: [], channels: [], deeds: [], fights: [], errors: [] };
  const orig = {};
  const gday = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  const wrap = (name, log) => {
    try {
      const fn = Game[name];
      if (typeof fn !== 'function') { t.errors.push({ day: gday(), where: 'install:' + name, err: 'missing' }); return; }
      orig[name] = fn;
      Game[name] = function (...a) {
        const r = fn.apply(this, a);
        try { log(r, a); } catch (e) { t.errors.push({ day: gday(), where: 'log:' + name, err: String(e && e.message) }); }
        return r;
      };
    } catch (e) { t.errors.push({ day: gday(), where: 'install:' + name, err: String(e && e.message) }); }
  };
  // S3: every feast attempt, honest refusal reason included.
  wrap('hostFeast', (r) => {
    t.calls.push({ day: gday(), ok: !!(r && r.ok), why: (r && r.why) ? String(r.why).slice(0, 160) : null });
  });
  // S4: every grant attempt — granted vs refused, and why.
  wrap('grantFeastBuff', (r) => {
    t.grants.push({ day: gday(), granted: !!(r && r.granted), why: (r && r.why) ? String(r.why).slice(0, 160) : null, refreshed: !!(r && r.refreshed), quality: (r && r.quality != null) ? r.quality : null });
  });
  // S2: every channel — resonance and arming AFTER the call.
  wrap('channelSentiment', () => {
    try {
      const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
      const s = (Game.state || {}).scholar || {};
      t.channels.push({ day: gday(), resonance: (pg && pg.surgeResonance) | 0, armed: !!((s.prog || {}).feastSurge) });
    } catch (e) { t.errors.push({ day: gday(), where: 'log:channelSentiment', err: String(e && e.message) }); }
  });
  // S6: the deed marking itself.
  wrap('noteFeastedCombatUse', () => { t.deeds.push({ day: gday() }); });
  // S6 (fight side): every fight start, with the feasted state at the time.
  wrap('startCombat', (r, a) => {
    let feasted = null;
    try { feasted = (typeof Game.feastedActive === 'function') ? !!Game.feastedActive() : null; } catch (e) {}
    t.fights.push({ day: gday(), monsterId: (a && a[0] != null) ? String(a[0]) : null, feasted });
  });

  function snapshot(ctx) {
    try {
      const s = (Game.state || {}).scholar || {};
      const v = (Game.state || {}).village || {};
      const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
      const prog = s.prog || {};
      let keepsakes = null;
      try { const ready = (typeof Game.channelReadyKeepsakes === 'function') ? Game.channelReadyKeepsakes() : null; keepsakes = ready ? ready.length : 0; } catch (e) { keepsakes = null; }
      let l3 = null;
      try { const abs = [...(s.abilities || []), ...(s.backgroundAbilities || [])]; l3 = abs.filter(a => ((a && a.level) || 1) >= 3).length; } catch (e) {}
      let reactor = null;
      try { reactor = (typeof Game.fusionReactorOnline === 'function') ? !!Game.fusionReactorOnline() : null; } catch (e) {}
      let pantry = 0;
      try { pantry = Math.round(((v.pantry || []).reduce((sum, i) => sum + (i.kcalEach || 0) * (i.units || i.count || 1), 0))); } catch (e) {}
      let gives = null;
      try { gives = (((v.gives || {})[Game.villagerId]) | 0); } catch (e) {}
      const b = (s.feastBuff && typeof s.feastBuff === 'object') ? s.feastBuff : null;
      const day = (s.day || 0);
      const feasted = !!(b && day < (b.untilDay || 0));
      let plan = null;
      try { plan = (typeof Game.feastPlan === 'function') ? Game.feastPlan() : null; } catch (e) { plan = null; }
      t.daily.push({
        day,
        sentiment: !!(pg && pg.sentimentTaught),
        slot60: !!((pg && pg.slotMoments && pg.slotMoments[60])),
        keepsakes,
        resonance: (pg && pg.surgeResonance) | 0,
        l3,
        armed: !!prog.feastSurge,
        armedValue: (typeof prog.feastSurge === 'number') ? prog.feastSurge : (prog.feastSurge ? 1 : 0),
        reactor,
        pantry,
        gives,
        feastDay: (s.feastDay == null ? null : s.feastDay),
        feasts: (ctx && ctx.feasts) | 0,
        surplusFeasts: (ctx && ctx.surplusFeasts) | 0,
        devotionChannels: (ctx && ctx.devotionChannels) | 0,
        feasted,
        buffUsed: !!(b && b.used),
        buffUntil: (b && b.untilDay != null) ? b.untilDay : null,
        surgeUsed: !!prog.feastSurgeUsed,
        planOk: !!(plan && plan.ok),
        planWhy: (plan && plan.why) ? String(plan.why).slice(0, 120) : null,
        planCost: (plan && plan.cost != null) ? plan.cost : null,
        planHave: (plan && plan.have != null) ? plan.have : null,
      });
    } catch (e) { t.errors.push({ day: gday(), where: 'snapshot', err: String(e && e.message) }); }
  }
  function finalize() {
    return {
      daily: t.daily.slice(), calls: t.calls.slice(), grants: t.grants.slice(),
      channels: t.channels.slice(), deeds: t.deeds.slice(), fights: t.fights.slice(),
      errors: t.errors.slice(),
    };
  }
  function uninstall() {
    for (const name of Object.keys(orig)) {
      try { Game[name] = orig[name]; } catch (e) { t.errors.push({ day: gday(), where: 'uninstall:' + name, err: String(e && e.message) }); }
    }
  }
  return { t, snapshot, finalize, uninstall };
}

module.exports = { install };
