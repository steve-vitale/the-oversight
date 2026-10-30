#!/usr/bin/env node
// scripts/trace-sicktick-b.js — DIAG ONLY attribution recorder for the
// sickness-tick step-up (parent arm sim-starveplenty-b, seed 9983:
// gen_a29exbk -3/day -> -5/day, cause label 'sickness' both phases).
// Record-only wrappers: hurtVillager (damage/cause/caller-stack),
// villageSicknessTick (sick-record + healer snapshot before/after each
// invocation), and filtered say lines (mend/succumb only). No RNG rolls,
// no state initialization, no healing, no damage changes inside wrappers.
// Usage: node scripts/trace-sicktick-b.js <seed> <days> <out.json>
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function snapSick(Game) {
  const v = Game.state && Game.state.village;
  const sick = (v && v.sick) || {};
  const out = {};
  for (const vid of Object.keys(sick)) {
    const s = sick[vid] || {};
    out[vid] = { name: s.name || null, severity: s.severity != null ? s.severity : null,
      daysLeft: s.daysLeft != null ? s.daysLeft : null, diagnosed: s.diagnosed || null };
  }
  return out;
}
function snapHealers(Game) {
  const h = { haven: null, here: null };
  try { h.haven = Game.campHealerId ? Game.campHealerId('haven') : null; } catch (e) {}
  try { h.here = Game.campHealerId ? Game.campHealerId('here') : null; } catch (e) {}
  return h;
}
function callerOf() {
  // Skip: Error line, callerOf frame, hurtVillager wrapper frame — the next
  // frame is the real caller (e.g. villageSicknessTick).
  const st = (new Error().stack || '').split('\n').slice(3);
  const names = ['villageSicknessTick', 'villagerMealDay', 'hurtFromStarvation',
    'villageEats', 'tickStatuses', 'treatVillager', 'villagerTreatTick',
    'villageDrinks', 'applyStatus', 'contractDisease'];
  for (const line of st) {
    for (const n of names) if (line.includes(n)) return n;
    const m = line.match(/at (?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)/);
    if (m && m[1] && !['trace-sicktick-b', 'hurtVillager', 'Game'].includes(m[1])) return 'other:' + m[1];
  }
  return 'unknown';
}

async function main() {
  const seed = parseInt(process.argv[2], 10);
  const days = parseInt(process.argv[3], 10) || 180;
  const out = process.argv[4];
  if (!Number.isFinite(seed) || !out) { console.error('usage: trace-sicktick-b.js <seed> <days> <out.json>'); process.exit(2); }
  const { Game, manifest } = await loadGame({ seed, mode: 'trace-sicktick-b' });
  await setupGame(Game);
  const hurtRows = [];
  const tickInvocations = [];
  const sayLines = [];
  const dayOf = () => (Game.state.scholar || {}).day || 0;

  const origHurt = Game.hurtVillager;
  if (typeof origHurt === 'function') {
    Game.hurtVillager = function (vid, damage, cause, result, opts) {
      const v = this.state.village;
      const hBefore = v && v.health && v.health[vid] !== undefined ? v.health[vid] : null;
      const sBefore = this.state.scholar ? this.state.scholar.health : null;
      const caller = callerOf();
      const r = origHurt.apply(this, arguments);
      const hAfter = v && v.health && v.health[vid] !== undefined ? v.health[vid] : null;
      let dead = null;
      try { const p = this.vpOf(vid); dead = !!(p && p.dead); } catch (e) {}
      hurtRows.push({ idx: hurtRows.length, day: dayOf(), vid, damage, cause: String(cause),
        caller, healthBefore: hBefore, healthAfter: hAfter, died: dead,
        scholarVid: vid === this.villagerId });
      return r;
    };
  }
  const origTick = Game.villageSicknessTick;
  if (typeof origTick === 'function') {
    Game.villageSicknessTick = function () {
      const v = this.state.village || {};
      const rec = { seq: tickInvocations.length, day: dayOf(),
        dayPart: (this.state.scholar || {}).dayPart != null ? this.state.scholar.dayPart : null,
        hurtStart: hurtRows.length,
        sickBefore: snapSick(this), healersBefore: snapHealers(this),
        hungryDaysBefore: v.hungryDays != null ? v.hungryDays : null,
        pantryLenBefore: (v.pantry || []).length };
      const r = origTick.apply(this, arguments);
      const v2 = this.state.village || {};
      rec.hurtEnd = hurtRows.length;
      rec.sickAfter = snapSick(this); rec.healersAfter = snapHealers(this);
      rec.hungryDaysAfter = v2.hungryDays != null ? v2.hungryDays : null;
      rec.pantryLenAfter = (v2.pantry || []).length;
      tickInvocations.push(rec);
      return r;
    };
  }
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (msg) {
      const s = String(msg == null ? '' : msg);
      if (/on the mend|succumbed|fever broke/i.test(s)) sayLines.push({ day: dayOf(), line: s });
      return origSay.apply(this, arguments);
    };
  }
  const policy = Object.assign({}, competent);
  const result = await runDays(Game, policy, { days, manifest });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ seed, days: result.days, endReason: result.endReason,
    deaths: (result.samples && result.samples.deaths) || [],
    tickInvocations, hurtRows, sayLines }, null, 2));
  console.log(JSON.stringify({ seed, days: result.days, endReason: result.endReason,
    deaths: ((result.samples && result.samples.deaths) || []).length,
    tickInvocations: tickInvocations.length, hurtRows: hurtRows.length, out }));
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
