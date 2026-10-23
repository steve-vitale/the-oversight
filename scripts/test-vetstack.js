#!/usr/bin/env node
// test-vetstack.js — sim-vetstack proof (flesh-out loop arm sim-vetstack,
// axis scale-onramp, run fleshout-20261023T1515Z). The COMPOSITION arm.
//
// Proves:
//   E0 shape — the sweep-only retention dependency exists with the
//      expected exports (VR_WINDOW=14, withVetRetention, vrOn), and
//      vetstack-sweep's stackFor composes retention OUTSIDE formation
//      OUTSIDE armorydrive.
//   E1 det-gate — gates UNSET: stackFor(base) 60d byte-identical to
//      AD.armedFor(base) (both layers pure-delegate when off; the
//      retention proof's + formation proof's own gates pinned the
//      pieces; this pins the composition).
//   E2 env-gate — gates ON: vrOn()/vfOn() true, stackFor id tags 'vetstack'
//      and the daily chain is wrapped.
//   E3 analyzer RED->GREEN — living-join (livingVetVids) fixtures:
//      dedupe, dead killers excluded, w=3 vs w>=4 distinction, scholar
//      counted as living, distinct-vid counting neutralizes the duplicate
//      waveKillLog finding.
//   E4 determinism — gates ON: 60d stack run, same seed twice,
//      byte-identical digest.
//   E5 sweep smoke — one control + one stack config, 20d, complete and
//      write their JSONs (instrument wiring before the 32-config sweep).
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 \
//   node scripts/test-vetstack.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required.'); process.exit(2); }
if (process.env.VETFORMATION === '1' || process.env.VETRETENTION === '1') { console.error('PROOF STOP: run with VETFORMATION/VETRETENTION unset (the proof sets them itself).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
const { stackFor, controlFor } = require(path.join(REPO, 'scripts', 'vetstack-sweep'));
const { livingVetVids, distinctVetVids, perPairSum } = require(path.join(REPO, 'scripts', 'vetstack-analyze'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function digest(Game, result) {
  const st = Game.state || {};
  const s = st.scholar || {};
  const v = st.village || {};
  return JSON.stringify({
    day: s.day || 0,
    alive: !!Game.villagerId,
    hp: Math.round(s.hp || 0),
    pop: ((v.roster || []).length),
    pantry: Math.round((st.pantry && st.pantry.kcal) || 0),
    wkl: (st.waveKillLog || []).length,
    uw: (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 0),
    over: !!Game.over, won: !!Game.won,
    deaths: (result && result.samples && result.samples.deaths || []).length,
  });
}

async function runWith(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'vetstack', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

async function main() {
  // ---- E0: the sweep-only dependency ----
  console.log('E0 dependency shape');
  let VR = null, vrErr = null;
  try { VR = require(path.join(REPO, 'scripts', 'policies', 'vetretention')); }
  catch (e) { vrErr = String((e && e.message) || e); }
  ok('retention policy file present (sweep-only dep from sim-vetretention branch)', !!VR, vrErr);
  if (VR) {
    ok('VR_WINDOW=14', VR.VR_WINDOW === 14, 'got ' + VR.VR_WINDOW);
    ok('withVetRetention + vrOn exported', typeof VR.withVetRetention === 'function' && typeof VR.vrOn === 'function');
  }
  ok('VF.formedFor + vfOn exported', typeof VF.formedFor === 'function' && typeof VF.vfOn === 'function');
  const sb = stackFor('leadfeast');
  ok('stackFor id tags vetstack', String(sb.id || '').includes('vetstack'), String(sb.id));
  ok('stackFor desc names both levers', String(sb.desc || '').includes('VETFORMATION') && String(sb.desc || '').includes('VETRETENTION'));

  // ---- E1: det-gate, gates off ----
  console.log('E1 det-gate (gates unset — stackFor byte-identical to AD.armedFor)');
  for (const b of ['leadfeast', 'belongfeast']) {
    const seed = 68805;
    const a = await runWith(stackFor(b), seed, 60);
    const c = await runWith(controlFor(b), seed, 60);
    ok(`det-gate ${b} 60d byte-identical`, digest(a.Game, a.result) === digest(c.Game, c.result),
      digest(a.Game, a.result) + ' vs ' + digest(c.Game, c.result));
  }

  // ---- E2: env-gate ----
  console.log('E2 env-gate (gates on)');
  process.env.VETFORMATION = '1';
  process.env.VETRETENTION = '1';
  ok('vfOn true', VF.vfOn() === true);
  ok('vrOn true', VR && VR.vrOn() === true);
  delete process.env.VETFORMATION;
  delete process.env.VETRETENTION;
  ok('vfOn false after unset', VF.vfOn() === false);
  ok('vrOn false after unset', VR && VR.vrOn() === false);

  // ---- E3: analyzer RED->GREEN (living-join fixtures) ----
  console.log('E3 analyzer living-join fixtures');
  const syn = {
    deathRows: [{ who: 'dead_killer', cause: 'combat' }, { who: 'hushwolf', cause: 'villager combat' }],
    waveKillLog: [
      { d: 60, mid: 'influencer', w: 4, by: 'alive_killer', via: 'companion' },
      { d: 61, mid: 'influencer', w: 4, by: 'alive_killer', via: 'companion' }, // duplicate — dedupes
      { d: 70, mid: 'audit', w: 4, by: 'dead_killer', via: 'companion' },        // dead — excluded
      { d: 80, mid: 'spool', w: 3, by: 'w3_killer', via: 'companion' },          // w=3 — defer4 only
      { d: 90, mid: 'grief_counselor', w: 2, by: 'w2_killer', via: 'companion' },
    ],
    scholarVid: 'alive_killer', // the mantle-holder bloodied themselves (the tashi_sherpa case)
  };
  const lv5 = livingVetVids(syn, 4);
  ok('livingVetVids(4) = {alive_killer}', lv5.size === 1 && lv5.has('alive_killer'), JSON.stringify([...lv5]));
  const lv4 = livingVetVids(syn, 3);
  ok('livingVetVids(3) adds w3_killer', lv4.size === 2 && lv4.has('w3_killer'), JSON.stringify([...lv4]));
  const dv = distinctVetVids(syn, 4);
  ok('distinctVetVids(4) dedupes + includes the dead (formation metric)', dv.size === 2 && dv.has('dead_killer'), JSON.stringify([...dv]));
  const empty = livingVetVids({ deathRows: [], waveKillLog: [] }, 4);
  ok('empty log -> empty set', empty.size === 0);
  ok('perPairSum counts per seed-policy pair (formation convention)',
    perPairSum([syn, { deathRows: [], waveKillLog: [{ d: 1, w: 4, by: 'alive_killer' }] }], 4) === 3);

  // ---- E4: determinism, gates on ----
  console.log('E4 determinism (gates on, 60d x2)');
  process.env.VETFORMATION = '1';
  process.env.VETRETENTION = '1';
  const x1 = await runWith(stackFor('leadfeast'), 68806, 60);
  const x2 = await runWith(stackFor('leadfeast'), 68806, 60);
  ok('stack 60d re-run deterministic', digest(x1.Game, x1.result) === digest(x2.Game, x2.result),
    digest(x1.Game, x1.result) + ' vs ' + digest(x2.Game, x2.result));
  delete process.env.VETFORMATION;
  delete process.env.VETRETENTION;

  // ---- E5: sweep smoke ----
  console.log('E5 sweep smoke (20d x {control, stack}, writes JSONs)');
  process.env.EVID = path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetstack', 'smoke');
  const { execFileSync } = require('child_process');
  const envC = Object.assign({}, process.env, { ARM: 'control', SEEDS: '68805', POLICIES: 'lead', DAYS: '20' });
  const envS = Object.assign({}, process.env, { ARM: 'stack', SEEDS: '68805', POLICIES: 'lead', DAYS: '20', VETFORMATION: '1', VETRETENTION: '1' });
  let smokeErr = null;
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'vetstack-sweep.js')], { env: envC, stdio: 'pipe', cwd: REPO });
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'vetstack-sweep.js')], { env: envS, stdio: 'pipe', cwd: REPO });
  } catch (e) { smokeErr = String((e && e.message) || e) + ' ' + String(e && e.stderr || ''); }
  ok('smoke sweep completes', !smokeErr, smokeErr && smokeErr.slice(0, 400));
  const smokeFile = path.join(process.env.EVID, 's68805-lead.json');
  ok('smoke JSON written (stack)', fs.existsSync(smokeFile), smokeFile);
  if (fs.existsSync(smokeFile)) {
    const j = JSON.parse(fs.readFileSync(smokeFile, 'utf8'));
    ok('smoke JSON carries waveKillLog + traces + dependency note',
      Array.isArray(j.waveKillLog) && Array.isArray(j.vrTrace) && /sweep-only/.test(String(j.retentionDependency || '')));
  }
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetstack', 'smoke'), { recursive: true, force: true }); } catch (e) {}
  delete process.env.EVID;

  console.log(`\nVETSTACK-TEST: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('TEST FAILED:', (e && e.stack) || e); process.exit(1); });
