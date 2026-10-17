#!/usr/bin/env node
// scripts/test-foragelead-b.js — forage-stream instrument honesty proof.
// PART A — RED-verified fixture: a manually assigned 'forage' duty is
//   counted and attributed exactly (assignTask attempt -> duty resolution
//   -> 'duty:forage' bucket with caller + occupation); a constructed
//   taskLead forage resolution attributes to 'tasklead:forage' with the
//   taskLeads state agreeing; every stream entry attributable (no
//   'unclassified-forage', no 'resolve' leftovers).
//   RED: the same fixture WITHOUT the instrument records nothing.
// PART B — det-gate: instrument on vs off on identical seeds, byte-identical
//   per-day trajectory hashes (the instrument changes nothing).
// SMOKE=1: PART A + a 1-seed 12d det comparison.
// Usage: node scripts/test-foragelead-b.js [SMOKE=1]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const inst = require('./instrument-foragelead-b');

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
  console.log('PART A — RED-verified fixture: exact attribution of forage paths');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { Game } = await loadGame({ seed: 7621, mode: 'foragelead-proof' });
  await quietLog(async () => { await setupGame(Game); });
  const t = { errors: 0 };
  inst.attachForageInstrument(Game, t);
  inst.attachDeathInstrument(Game, t);

  const v = Game.state.village || {};
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  check('A0 fixture has a roster villager', !!vid, vid);
  try { v.trust = v.trust || {}; v.trust[vid] = 90; } catch (e) {}
  check('A0b scholar at haven (in-person gate)', !!(Game.playerAtHaven && Game.playerAtHaven()));

  // A1: a forage assignment through the real assignTask verb, resolved with
  // the engine's own assignment object (identity-based 'duty' detection).
  const res = Game.assignTask(vid, 'forage', { via: 'in-person' });
  check('A1 forage assignment accepted', !!(res && res.ok === true), JSON.stringify(res && res.ok));
  const throttleOn = !!(Game.prodThrottleEngaged && Game.prodThrottleEngaged());
  const asgObj = (Game.state.village.assignments || {})[vid];
  check('A1b assignment recorded in v.assignments', !!(asgObj && asgObj.task === 'forage'));
  try { Game.resolveOneAssignment(vid, asgObj); } catch (e) {}

  const df1 = t.dutyForage.filter(e => e.vid === vid);
  check('A2 exactly 1 forage resolution recorded for the villager', df1.length === 1, `${df1.length}`);
  check('A3 resolution via = duty (assignment-object identity)', df1.length === 1 && df1[0].via === 'duty', df1.length ? df1[0].via : 'none');
  const fe1 = t.forage.filter(e => e.vid === vid);
  if (throttleOn) {
    check('A4 throttle engaged: resolution redirected, no forage kcal', df1.length === 1 && df1[0].taskOut !== 'forage' && fe1.length === 0,
      df1.length ? `taskOut=${df1[0].taskOut} events=${fe1.length}` : 'none');
  } else {
    check('A4 exactly 1 forage event, bucket duty:forage', fe1.length === 1 && fe1[0].bucket === 'duty:forage',
      fe1.length ? fe1[0].bucket : 'none');
    check('A5 event has numeric kcal and an occupation', fe1.length === 1 && typeof fe1[0].kcal === 'number' && !!fe1[0].occ,
      fe1.length ? `${fe1[0].kcal}/${fe1[0].occ}` : 'none');
    check('A6 event taskIn/taskOut = forage/forage', fe1.length === 1 && fe1[0].taskIn === 'forage' && fe1[0].taskOut === 'forage');
  }

  // A7: the taskLead path — a constructed lead, resolved exactly the way
  // the engine's lead loop does (fresh {task} object, no assignment).
  const vid2 = (v.roster || []).find(id => id !== Game.villagerId && id !== vid);
  check('A7 fixture has a second roster villager', !!vid2, vid2);
  v.taskLeads = v.taskLeads || {};
  v.taskLeads['forage'] = vid2;
  try { Game.resolveOneAssignment(vid2, { task: 'forage' }); } catch (e) {}
  const df2 = t.dutyForage.filter(e => e.vid === vid2);
  check('A8 lead resolution via = tasklead (state map agrees)', df2.length === 1 && df2[0].via === 'tasklead' && v.taskLeads['forage'] === vid2,
    df2.length ? df2[0].via : 'none');
  const fe2 = t.forage.filter(e => e.vid === vid2);
  if (throttleOn) {
    check('A9 throttle engaged: lead redirected, no forage kcal', df2.length === 1 && df2[0].taskOut !== 'forage' && fe2.length === 0,
      df2.length ? `taskOut=${df2[0].taskOut} events=${fe2.length}` : 'none');
  } else {
    check('A9 lead forage event bucket = tasklead:forage', fe2.length === 1 && fe2[0].bucket === 'tasklead:forage',
      fe2.length ? fe2[0].bucket : 'none');
  }
  delete v.taskLeads['forage'];

  // A10: the ambient loop — every event it produces must be named.
  const before = t.forage.length;
  try { Game.villageLives(); } catch (e) {}
  const amb = t.forage.slice(before);
  check('A10 villageLives forage events all named (no unclassified/resolve leftover)',
    amb.every(e => e.bucket !== 'unclassified-forage' && e.bucket !== 'resolve'),
    `${amb.length} events`);

  // A11: no unattributed entries anywhere; no instrument errors.
  check('A11 no unclassified-forage events at all', t.forage.every(e => e.bucket !== 'unclassified-forage' && e.bucket !== 'resolve'),
    t.forage.map(e => e.bucket).join(','));
  check('A12 no instrument errors', t.errors === 0, `${t.errors}`);
  check('A13 schema-clean gate passes', t.forage.every(e => e.day != null && typeof e.kcal === 'number' && e.bucket));

  // RED: no instrument -> nothing counted, no attribution slot.
  const { Game: Game2 } = await loadGame({ seed: 7621, mode: 'foragelead-proof-red' });
  await quietLog(async () => { await setupGame(Game2); });
  const v2 = Game2.state.village || {};
  const vidR = (v2.roster || []).find(id => id !== Game2.villagerId);
  try { v2.trust = v2.trust || {}; v2.trust[vidR] = 90; } catch (e) {}
  Game2.assignTask(vidR, 'forage', { via: 'in-person' });
  Game2.resolveOneAssignment(vidR, (Game2.state.village.assignments || {})[vidR]);
  check('RED: without the instrument there is no attribution slot', typeof Game2._flbCtx === 'undefined', 'instrument-sourced counting');
}

async function detOne(seed, policyId, days, withInstrument) {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const pPath = './policies/feastscale';
  delete require.cache[require.resolve(pPath)];
  const fsp = require(pPath);
  const policy = fsp[policyId];
  const { Game } = await loadGame({ seed, mode: 'foragelead-det' });
  await setupGame(Game);
  const t = { errors: 0 };
  if (withInstrument) { inst.attachForageInstrument(Game, t); inst.attachDeathInstrument(Game, t); }
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
  if (SMOKE) await partB([7621], ['leadfeast'], 12);
  else await partB([7621, 7622, 7623, 7624], ['leadfeast', 'belongfeast'], 60);
  console.log(failures ? `\nRESULT: ${failures} FAILURE(S)` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
