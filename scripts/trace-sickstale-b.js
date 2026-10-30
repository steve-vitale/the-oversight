#!/usr/bin/env node
// scripts/trace-sickstale-b.js — stale-sick-tick instrument (sim-sickstale-b,
// sim-findings #1542). Record-only wrappers: Game.hurtVillager captures
// PRE-hurt roster membership + vpOf.dead (the sicktele wrapper only kept
// post-hit state, which cannot separate a stale hit from a tick hit that
// itself kills), plus caller, cause, healthBefore/After. Game.villageEats
// snapshots daily roster + sick keys. A hurt row is STALE iff its caller
// is villageSicknessTick AND (not on roster before the hurt OR vpOf.dead
// true before the hurt). A villager alive and on-roster before the hurt
// who dies from the hit is a LIVE hit, never stale.
// Usage: node scripts/trace-sickstale-b.js <seed> <days> <out.json>
// One process per seed (never two harnesses in one process).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function callerOf() {
  const st = (new Error().stack || '').split('\n').slice(3);
  for (const line of st) {
    if (/trace-sickstale-b/.test(line)) continue;
    const m = line.match(/at (?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)/);
    if (m && m[1] && !['Game', 'Object', 'Array'].includes(m[1])) return m[1];
  }
  return 'unknown';
}

async function main() {
  const seed = parseInt(process.argv[2], 10);
  const days = parseInt(process.argv[3], 10) || 180;
  const out = process.argv[4];
  if (!Number.isFinite(seed) || !out) { console.error('usage: trace-sickstale-b.js <seed> <days> <out.json>'); process.exit(2); }
  const { Game, manifest } = await loadGame({ seed, mode: 'trace-sickstale-b' });
  await setupGame(Game);
  const dayOf = () => (Game.state.scholar || {}).day || 0;
  const rec = { hurts: [], daily: [], sayLines: [] };
  const resolve = (vid) => (vid === 'player' ? Game.villagerId : vid);
  const vpDead = (vid) => { try { const p = Game.vpOf ? Game.vpOf(vid) : null; return !!(p && p.dead); } catch (e) { return null; } };
  const onRoster = (vid) => ((Game.state.village || {}).roster || []).includes(vid);

  const origHurt = Game.hurtVillager;
  if (typeof origHurt === 'function') {
    Game.hurtVillager = function (vid, damage, cause, result, opts) {
      const rvid = resolve(vid);
      const v = this.state.village;
      const pre = { onRoster: onRoster(rvid), vpDead: vpDead(rvid),
        health: v && v.health && v.health[rvid] !== undefined ? v.health[rvid] : null };
      const caller = callerOf();
      const r = origHurt.apply(this, arguments);
      const hAfter = v && v.health && v.health[rvid] !== undefined ? v.health[rvid] : null;
      rec.hurts.push({ day: dayOf(), vid: rvid, damage, cause: String(cause), caller,
        healthBefore: pre.health, healthAfter: hAfter,
        onRosterBefore: pre.onRoster, vpDeadBefore: pre.vpDead,
        onRosterAfter: onRoster(rvid), vpDeadAfter: vpDead(rvid) });
      return r;
    };
  }
  const origEats = Game.villageEats;
  if (typeof origEats === 'function') {
    Game.villageEats = function () {
      const v = (Game.state && Game.state.village) || {};
      rec.daily.push({ day: dayOf(), roster: (v.roster || []).slice(), sick: Object.keys(v.sick || {}) });
      return origEats.apply(this, arguments);
    };
  }
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (msg) {
      const s = String(msg == null ? '' : msg);
      if (/succumb|on the mend|is gone/i.test(s)) rec.sayLines.push({ day: dayOf(), line: s });
      return origSay.apply(this, arguments);
    };
  }
  const policy = Object.assign({}, competent);
  const result = await runDays(Game, policy, { days, manifest });
  const stale = rec.hurts.filter(h => h.caller === 'villageSicknessTick' && (!h.onRosterBefore || h.vpDeadBefore === true));
  const live = rec.hurts.filter(h => h.caller === 'villageSicknessTick' && h.onRosterBefore && h.vpDeadBefore !== true);
  const payload = { seed, daysCap: days, days: result.days, endReason: result.endReason,
    won: !!Game.won, villageLost: !!Game.villageLost, over: !!Game.over,
    harnessDeaths: (result.samples && result.samples.deaths) || [],
    staleHits: stale.length, liveSickHits: live.length,
    staleRows: stale, liveSickVids: [...new Set(live.map(h => h.vid))],
    hurts: rec.hurts, daily: rec.daily, sayLines: rec.sayLines };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify({ seed, days: result.days, endReason: result.endReason,
    staleHits: stale.length, liveSickHits: live.length, out }));
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
