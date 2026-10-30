#!/usr/bin/env node
// scripts/trace-sicktele-b.js — DIAG cross-check instrument for the
// sickness death-tele gap (parent arm sim-starveplenty-b, seed 9983:
// elif_demir day 32; sim-findings #1514).
// Record-only wrappers: Game.tele (death teles), Game.registerDeath,
// Game.removeVillager, Game.hurtVillager (THREE separate post-hit death
// signals — healthAfter, getPerson.dead, vpOf.dead — plus roster
// membership; never collapsed into one `died` flag, which is the
// conflation in the sicktick recorder), Game.villageEats (daily entry
// snapshots), Game.say (filtered lines). No RNG rolls, no state
// initialization, no healing, no damage changes inside wrappers.
// Snapshots are plain state reads only.
// Usage: node scripts/trace-sicktele-b.js <seed> <days> <out.json>
// One process per seed (never two harnesses in one process).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function callerOf() {
  const st = (new Error().stack || '').split('\n').slice(3);
  for (const line of st) {
    if (/trace-sicktele-b/.test(line)) continue;
    const m = line.match(/at (?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)/);
    if (m && m[1] && !['Game', 'Object', 'Array'].includes(m[1])) return m[1];
  }
  return 'unknown';
}
function personDead(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; return !!(p && p.dead); } catch (e) { return null; }
}
function vpDead(Game, vid) {
  try { const p = Game.vpOf ? Game.vpOf(vid) : null; return !!(p && p.dead); } catch (e) { return null; }
}
function snap(Game, day) {
  const v = (Game.state && Game.state.village) || {};
  const roster = (v.roster || []).slice();
  const fallen = (v.fallen || []).map(f => f.villagerId || f.id || '?');
  const exiles = (v.exiles || []).map(e => e.vid || e.id || '?');
  const corpses = ((Game.state || {}).corpses || [])
    .filter(c => c && (c.kind === 'person' || c.kind === 'villager'))
    .map(c => c.villagerId || c.id || '?');
  const vpFiltered = roster.filter(id => !vpDead(Game, id));
  const gpFiltered = roster.filter(id => !personDead(Game, id));
  return { day, roster, rosterLen: roster.length, vpLiving: vpFiltered.length,
    gpLiving: gpFiltered.length, fallen: fallen.slice(), exiles: exiles.slice(),
    corpses: corpses.slice(), sick: Object.keys(v.sick || {}) };
}

async function main() {
  const seed = parseInt(process.argv[2], 10);
  const days = parseInt(process.argv[3], 10) || 180;
  const out = process.argv[4];
  if (!Number.isFinite(seed) || !out) { console.error('usage: trace-sicktele-b.js <seed> <days> <out.json>'); process.exit(2); }
  const { Game, manifest } = await loadGame({ seed, mode: 'trace-sicktele-b' });
  await setupGame(Game);
  const dayOf = () => (Game.state.scholar || {}).day || 0;
  const rec = { teles: [], registers: [], removals: [], hurts: [], daily: [], sayLines: [] };

  const origTele = Game.tele;
  if (typeof origTele === 'function') {
    Game.tele = function (type, data) {
      const r = origTele.apply(this, arguments);
      if (type === 'death') rec.teles.push({ day: dayOf(), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
      return r;
    };
  }
  const origReg = Game.registerDeath;
  if (typeof origReg === 'function') {
    Game.registerDeath = function (opts) {
      const r = origReg.apply(this, arguments);
      rec.registers.push({ day: dayOf(), kind: opts && opts.kind, vid: opts && (opts.villagerId || opts.monsterId || opts.name), cause: opts && opts.cause, caller: callerOf() });
      return r;
    };
  }
  const origRem = Game.removeVillager;
  if (typeof origRem === 'function') {
    Game.removeVillager = function (vid, how) {
      const caller = callerOf();
      const r = origRem.apply(this, arguments);
      rec.removals.push({ day: dayOf(), vid, how: how || null, caller,
        rosterAfter: ((Game.state.village || {}).roster || []).includes(vid),
        gpDeadAfter: personDead(Game, vid), vpDeadAfter: vpDead(Game, vid) });
      return r;
    };
  }
  const origHurt = Game.hurtVillager;
  if (typeof origHurt === 'function') {
    Game.hurtVillager = function (vid, damage, cause, result, opts) {
      const v = this.state.village;
      const hBefore = v && v.health && v.health[vid] !== undefined ? v.health[vid] : null;
      const caller = callerOf();
      const r = origHurt.apply(this, arguments);
      const hAfter = v && v.health && v.health[vid] !== undefined ? v.health[vid] : null;
      rec.hurts.push({ day: dayOf(), vid, damage, cause: String(cause), caller,
        healthBefore: hBefore, healthAfter: hAfter,
        gpDead: personDead(Game, vid), vpDead: vpDead(Game, vid),
        onRoster: ((Game.state.village || {}).roster || []).includes(vid) });
      return r;
    };
  }
  const origEats = Game.villageEats;
  if (typeof origEats === 'function') {
    Game.villageEats = function () {
      rec.daily.push({ when: 'entry', snap: snap(Game, dayOf()) });
      const r = origEats.apply(this, arguments);
      rec.daily.push({ when: 'exit', snap: snap(Game, dayOf()) });
      return r;
    };
  }
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (msg) {
      const s = String(msg == null ? '' : msg);
      if (/succumb|on the mend|fled|walked out|exiled|cast out|left the village|doesn't answer|run — into|is gone/i.test(s)) rec.sayLines.push({ day: dayOf(), line: s });
      return origSay.apply(this, arguments);
    };
  }
  const policy = Object.assign({}, competent);
  const result = await runDays(Game, policy, { days, manifest });
  const finalSnap = snap(Game, dayOf());
  const payload = { seed, daysCap: days, days: result.days, endReason: result.endReason,
    won: !!Game.won, villageLost: !!Game.villageLost, over: !!Game.over,
    harnessDeaths: (result.samples && result.samples.deaths) || [],
    scholarVid: Game.villagerId || null, finalSnap, teles: rec.teles,
    registers: rec.registers, removals: rec.removals, hurts: rec.hurts,
    daily: rec.daily, sayLines: rec.sayLines };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify({ seed, days: result.days, endReason: result.endReason,
    teles: rec.teles.length, registers: rec.registers.length,
    removals: rec.removals.length, hurts: rec.hurts.length, out }));
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
