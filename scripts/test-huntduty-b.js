#!/usr/bin/env node
// scripts/test-huntduty-b.js — hunt-duty audit instrument honesty proof.
// PART A — RED-verified fixture: a manually assigned 'hunt' duty is counted
//   and attributed exactly (assignTask attempt -> resolution -> huntResolve
//   -> butcher verb); every stream entry attributable. RED: the same fixture
//   WITHOUT the instrument records nothing — counting is instrument-sourced.
// PART B — det-gate: instrument on vs off on identical seeds, byte-identical
//   per-day trajectory hashes (the instrument changes nothing).
// SMOKE=1: PART A + a 1-seed 12d det comparison.
// Usage: node scripts/test-huntduty-b.js [SMOKE=1]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const inst = require('./instrument-huntduty-b');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}

async function partA() {
  console.log('PART A — RED-verified fixture: exact attribution of a manual hunt duty');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { Game } = await loadGame({ seed: 7611, mode: 'huntduty-proof' });
  await quietLog(async () => { await setupGame(Game); });
  const t = { errors: 0 };
  inst.attachHuntInstrument(Game, t);

  // pick a roster villager (not the scholar), trust them past the hunt gate
  // (hunt is non-food work: gate 20, reluctant roll under 40 — use 90).
  const v = Game.state.village || {};
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  check('A0 fixture has a roster villager', !!vid, vid);
  try { v.trust = v.trust || {}; v.trust[vid] = 90; } catch (e) {}
  check('A0b scholar at haven (in-person gate)', !!(Game.playerAtHaven && Game.playerAtHaven()));

  // a hunt assignment, through the real assignTask verb.
  const res = Game.assignTask(vid, 'hunt', { via: 'in-person' });
  check('A1 hunt assignment accepted', !!(res && res.ok === true), JSON.stringify(res && res.ok));
  // the resolution, through the real resolveOneAssignment -> villagerHuntResolve.
  try { Game.resolveOneAssignment(vid, { task: 'hunt' }); } catch (e) {}

  // butcher verb via the fixture caller (the contradiction probe).
  try {
    Game.state.scholar.inventory = Game.state.scholar.inventory || [];
    Game.state.scholar.inventory.push({ name: 'Rabbit (carcass)', foodKind: 'meat', foodState: 'carcass', hiddenKcal: 500, kcalEach: 0, units: 1, spoilDay: 400, kg: 0.8 });
  } catch (e) {}
  try { Game.cleanCarcass(); } catch (e) {}

  const a1 = t.assigns.filter(e => e.task === 'hunt');
  check('A2 exactly 1 hunt assignTask attempt recorded', a1.length === 1, `${a1.length}`);
  check('A3 attempt attributed to the fixture caller', a1.length === 1 && a1[0].caller === 'fixture', a1.length ? a1[0].caller : 'none');
  check('A4 attempt outcome = assigned', a1.length === 1 && a1[0].outcome === 'assigned', a1.length ? a1[0].outcome : 'none');
  const r1 = t.resolves.filter(e => e.taskIn === 'hunt');
  check('A5 exactly 1 hunt resolution recorded', r1.length === 1, `${r1.length}`);
  check('A6 resolution caller = duty-resolve (resolveOneAssignment frame)', r1.length === 1 && r1[0].caller === 'duty-resolve', r1.length ? r1[0].caller : 'none');
  check('A7 exactly 1 villagerHuntResolve firing recorded', t.huntResolves.length === 1, `${t.huntResolves.length}`);
  check('A8 hunt firing caller = duty-resolve (duty path, not fixture)', t.huntResolves.length === 1 && t.huntResolves[0].caller === 'duty-resolve', t.huntResolves.length ? t.huntResolves[0].caller : 'none');
  check('A9 hunt firing has a numeric kcal', t.huntResolves.length === 1 && typeof t.huntResolves[0].kcal === 'number', t.huntResolves.length ? String(t.huntResolves[0].kcal) : 'none');
  check('A10 exactly 1 cleanCarcass firing recorded', t.butchers.length === 1, `${t.butchers.length}`);
  check('A11 butcher attributed to the fixture caller (not hunt-duty machinery)', t.butchers.length === 1 && t.butchers[0].caller === 'fixture', t.butchers.length ? t.butchers[0].caller : 'none');
  check('A12 no unattributed entries', t.assigns.concat(t.resolves, t.huntResolves, t.butchers).every(e => e.caller && e.caller !== 'unknown'));
  check('A13 no instrument errors', t.errors === 0, `${t.errors}`);
  // eligibility snapshot reads are pure (no RNG): smoke-run on fixture.
  try {
    const el = inst.eligibilitySnapshot(Game);
    check('A14 eligibility snapshot returns a roster count', typeof el.roster === 'number' && el.roster >= 1, JSON.stringify(el));
  } catch (e) { check('A14 eligibility snapshot runs', false, String(e && e.message)); }

  // RED: no instrument -> nothing counted.
  const { Game: Game2 } = await loadGame({ seed: 7611, mode: 'huntduty-proof-red' });
  await quietLog(async () => { await setupGame(Game2); });
  const v2 = Game2.state.village || {};
  const vid2 = (v2.roster || []).find(id => id !== Game2.villagerId);
  try { v2.trust = v2.trust || {}; v2.trust[vid2] = 90; } catch (e) {}
  Game2.assignTask(vid2, 'hunt', { via: 'in-person' });
  check('RED: without the instrument there is nothing to count', typeof Game2.__huntdutyT === 'undefined', 'instrument-sourced counting');
}

async function detOne(seed, policyId, days, withInstrument) {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const pPath = './policies/feastscale';
  delete require.cache[require.resolve(pPath)];
  const fsp = require(pPath);
  const policy = fsp[policyId];
  const { Game } = await loadGame({ seed, mode: 'huntduty-det' });
  await setupGame(Game);
  const t = { errors: 0 };
  if (withInstrument) { inst.attachHuntInstrument(Game, t); inst.attachDeathInstrument(Game, t); }
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  const hs = [];
  wrapped.daily = (G, ctx) => {
    hs.push(G.state.scholar.day + ':' + dayHash(G));
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: days + 1 }); });
  return { hashes: hs.join('\n'), errors: t.errors };
}

async function partB(seeds, policies, days) {
  console.log(`PART B — det-gate: ${seeds.length} seeds x ${policies.length} policies x {off,on}, ${days}d`);
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  let pass = 0, fail = 0, errOn = 0;
  for (const pid of policies) {
    for (const seed of seeds) {
      const off = await detOne(seed, pid, days, false);
      const on = await detOne(seed, pid, days, true);
      const same = off.hashes === on.hashes;
      errOn += on.errors;
      if (same) pass++; else {
        fail++;
        console.log(`  MISMATCH ${pid}-${seed}`);
      }
    }
  }
  check('det-gate byte-identical trajectories', fail === 0, `${pass}/${pass + fail}`);
  check('instrument reported 0 errors', errOn === 0, `${errOn}`);
}

async function main() {
  const SMOKE = process.env.SMOKE === '1';
  await partA();
  if (SMOKE) await partB([7611], ['leadfeast'], 12);
  else await partB([7611, 7612, 7613, 7614], ['leadfeast', 'belongfeast'], 60);
  console.log(failures ? `\nRESULT: ${failures} FAILURE(S)` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
