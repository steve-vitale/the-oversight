#!/usr/bin/env node
// scripts/test-sickstale-b.js — proof for sim-sickstale-b (sim-findings #1542).
// Two modes:
//   node scripts/test-sickstale-b.js --repro-only
//     Live deterministic reproduction only; prints per-case stale-hit counts
//     and exits 0 always (measurement capture — run once BEFORE the fix to
//     keep the BEFORE record, and after to show the fix).
//   node scripts/test-sickstale-b.js
//     Full proof: live repro assertions (post-fix expectations) + pilot /
//     known-event summary assertions from the committed trace JSONs.
//     Exits non-zero on any failure.
// The repro uses the shared kit (scripts/sim-harness.js): one process,
// seeded Math.random before eval, full src/js list in index.html order
// (minus DOM-only files, per the harness), never stubs Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

function callerOf() {
  const st = (new Error().stack || '').split('\n').slice(3);
  for (const line of st) {
    if (/test-sickstale-b/.test(line)) continue;
    const m = line.match(/at (?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)/);
    if (m && m[1] && !['Game', 'Object', 'Array'].includes(m[1])) return m[1];
  }
  return 'unknown';
}

async function repro() {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-sickstale-b' });
  await setupGame(Game);
  const v = Game.state.village;
  if (!v || !v.roster) throw new Error('no village roster after setupGame');
  v.sick = v.sick || {};
  v.health = v.health || {};
  const hits = {};
  const origHurt = Game.hurtVillager;
  Game.hurtVillager = function (vid, damage, cause, result, opts) {
    if (callerOf() === 'villageSicknessTick') hits[vid] = (hits[vid] || 0) + 1;
    return origHurt.apply(this, arguments);
  };
  const eligible = (v.roster || []).filter(id => id !== Game.villagerId &&
    !(Game.npcHasAbility && Game.npcHasAbility(id, 'phoenix_clause')));
  if (eligible.length < 3) throw new Error('need >=3 eligible villagers, got ' + eligible.length);
  const [vidA, vidB, vidC] = eligible;
  const plant = (vid, health) => { v.sick[vid] = { name: 'tick fever', daysLeft: 5, severity: 1 }; v.health[vid] = health; };
  const clearHits = () => { for (const k of Object.keys(hits)) delete hits[k]; };

  // (a) killed via removeVillager, then tick
  plant(vidA, 52);
  Game.removeVillager(vidA, 'killed');
  const sickAfterRemovalA = !!v.sick[vidA];
  clearHits();
  Game.villageSicknessTick();
  const staleA = hits[vidA] || 0;
  const sickAfterTickA = !!v.sick[vidA];

  // (b) exiled via removeVillager, then tick
  plant(vidB, 60);
  Game.removeVillager(vidB, 'exiled');
  const sickAfterRemovalB = !!v.sick[vidB];
  clearHits();
  Game.villageSicknessTick();
  const staleB = hits[vidB] || 0;

  // (c) old-save shape: sick record for a never-rostered id, then tick
  const ghost = 'ghost_old_save';
  plant(ghost, 100);
  clearHits();
  Game.villageSicknessTick();
  const staleC = hits[ghost] || 0;
  const sickAfterTickC = !!v.sick[ghost];

  // (d) LIVE control: roster villager, then tick — must still take the hit
  plant(vidC, 80);
  clearHits();
  Game.villageSicknessTick();
  const liveHits = hits[vidC] || 0;
  const liveHealthAfter = v.health[vidC];

  return { vidA, vidB, vidC, sickAfterRemovalA, sickAfterRemovalB,
    staleA, sickAfterTickA, staleB, staleC, sickAfterTickC, liveHits, liveHealthAfter };
}

async function main() {
  const reproOnly = process.argv.includes('--repro-only');
  const r = await repro();
  console.log(JSON.stringify({ repro: r }, null, 2));
  if (reproOnly) return;
  let pass = 0, fail = 0;
  const check = (name, cond, extra) => {
    if (cond) { pass++; console.log('PASS ' + name); }
    else { fail++; console.log('FAIL ' + name + (extra != null ? ' :: ' + extra : '')); }
  };
  check('repro (a) killed: record cleared on removal', r.sickAfterRemovalA === false, String(r.sickAfterRemovalA));
  check('repro (a) killed: 0 stale tick hits', r.staleA === 0, String(r.staleA));
  check('repro (a) killed: no record after tick', r.sickAfterTickA === false);
  check('repro (b) exiled: record cleared on removal', r.sickAfterRemovalB === false, String(r.sickAfterRemovalB));
  check('repro (b) exiled: 0 stale tick hits', r.staleB === 0, String(r.staleB));
  check('repro (c) old-save ghost: 0 stale tick hits', r.staleC === 0, String(r.staleC));
  check('repro (c) old-save ghost: record cleaned by tick', r.sickAfterTickC === false);
  check('repro (d) live control: tick hit preserved', r.liveHits >= 1, String(r.liveHits));
  check('repro (d) live control: health fell from 80', r.liveHealthAfter < 80, String(r.liveHealthAfter));

  const EV = path.join(__dirname, '..', 'evidence', '2026-10-30');
  const load = (f) => JSON.parse(fs.readFileSync(path.join(EV, f), 'utf8'));
  const before = load('sim-sickstale-b-pilot-before-summary.json');
  const after = load('sim-sickstale-b-pilot-after-summary.json');
  const t9983before = load('sim-sickstale-b-trace-9983-before.json');
  const t9983after = load('sim-sickstale-b-trace-9983-after.json');
  check('pilot: 8 seeds before and after', before.perSeed.length === 8 && after.perSeed.length === 8,
    before.perSeed.length + '/' + after.perSeed.length);
  check('pilot after: 0 stale hits pooled', after.pooled.staleHits === 0, String(after.pooled.staleHits));
  check('pilot after: 0 stale hits every seed', after.perSeed.every(s => s.staleHits === 0));
  let neutral = true;
  for (const b of before.perSeed) {
    const a = after.perSeed.find(s => s.seed === b.seed);
    if (!a || a.liveSickHits !== b.liveSickHits || a.days !== b.days) neutral = false;
  }
  check('pilot neutrality: liveSickHits + days identical per seed before vs after', neutral,
    JSON.stringify(before.perSeed.map(s => [s.seed, s.liveSickHits])) + ' vs ' +
    JSON.stringify(after.perSeed.map(s => [s.seed, s.liveSickHits])));
  // NOTE (base move, see evidence metric review): the prereg's elif_demir
  // day-32 row does NOT exist at this base — 9983's trajectory moved under
  // the intervening landings (contest-death fix 06b502d53 et al.), and elif
  // never dies on this base's 9983. What DOES exist pre-fix on this base's
  // 9983 is the same mechanism with three other victims; the proof asserts
  // those true rows, not the stale prereg instance.
  const staleKey = (rows) => (rows || []).map(r => r.vid + '@d' + r.day).sort().join(',');
  check('9983 before: 3 stale rows, named victims, all off-roster + vpDead pre-hurt',
    t9983before.staleHits === 3 &&
    staleKey(t9983before.staleRows) === 'gen_925shtf@d36,gen_mr1pr0r@d27,henry_zhang@d28' &&
    (t9983before.staleRows || []).every(r => r.onRosterBefore === false && r.vpDeadBefore === true),
    JSON.stringify(t9983before.staleRows || null));
  check('9983 after: 0 stale hits', t9983after.staleHits === 0, String(t9983after.staleHits));
  check('9983 neutrality: liveSickHits identical before vs after',
    t9983after.liveSickHits === t9983before.liveSickHits,
    t9983before.liveSickHits + ' vs ' + t9983after.liveSickHits);
  check('9983 neutrality: days + endReason identical before vs after',
    t9983after.days === t9983before.days && t9983after.endReason === t9983before.endReason,
    t9983before.days + '/' + t9983before.endReason + ' vs ' + t9983after.days + '/' + t9983after.endReason);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
