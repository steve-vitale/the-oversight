#!/usr/bin/env node
// test-linkdissolve-b.js — proof for the sim-linkdissolve-b instruments
// (loop B, run fleshout-loop-b-20261020T2235Z).
//
// Pre-registered proof (all must pass before the sweep):
//   (a) RED: pristine runs carry no link-instrument state (armed + unset).
//   (b) GREEN: dissolution captured with named dropout links + failing bars
//       on seed 8801 armed leadfeast (court d77, dissolution d158, village
//       survives 180d — the honest non-degenerate case on this commit);
//       instrument bar-diagnosis agrees with the engine's _havenPolity() on
//       100% of dawn samples; upkeep channels record engine return values;
//       the realm-death say-line is captured.
//   (c) ENGAGE: post-court upkeep gaps recorded on the lean-pantry seed
//       (shortfalls and/or policy gate-skip weeks).
//   (d) DET: instrumented vs pristine byte-identical canonical projection
//       (ALL new wraps RNG-clean: _checkNational, sleep census, payTribute,
//       tendLink, covenantTick, tradeTick, answerRenegotiation,
//       _removePantryKcal marker, say capture).
//   (e) REPEAT: same armed seed twice in-process byte-identical.
//   (f) RED-EQUIVALENT same-commit: this driver (SURPLUSFEED unset) vs
//       parent's probe-surplusfeed-national-b.js (unset) — the parent row
//       fields byte-identical (zero drift added to the paired substrate).
//
// Usage (FULL env per header — the envless run FAILs by design):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-linkdissolve-b.js
'use strict';
const fs = require('fs');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');
const { attachStandingProbe } = require('./probe-standnational-instruments');
const { attachLinkProbe, endLinkHistories } = require('./probe-linkdissolve-instruments');
const { attributeDissolution, upkeepGaps } = require('./analyze-linkdissolve-b');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// canonical game-state projection (from test-surplusfeed-national-b.js):
// everything the sim's behavior depends on, minus timing.
function canon(Game) {
  const items = (((Game.state || {}).village || {}).pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (((Game.state || {}).village || {}).roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  return JSON.stringify({ d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0) });
}

async function run(seed, days, { armed, pristine, policy }) {
  if (armed) process.env.SURPLUSFEED = '1'; else delete process.env.SURPLUSFEED;
  const { Game } = await loadGame({ seed, mode: 'linkdissolve-test', fullTelemetry: false });
  await setupGame(Game);
  let W = null, S = null, L = null;
  if (!pristine) {
    W = attachProbe(Game);
    S = attachStandingProbe(Game);
    L = attachLinkProbe(Game);
    const o = Game.surplusFeedGovernor;
    if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
      const r = o.apply(this, arguments);
      return r;
    };
  }
  const result = await runDays(Game, policy, { days, manifest: null });
  return { Game, W, S, L, result };
}

function dissolveRow(Game, L, result) {
  return {
    seed: 0, nationalDay: (Game.state || {}).nationalDay || 0,
    days: result.days, endReason: result.endReason,
    dissolve: {
      courts: L.courts, dissolutions: L.dissolutions,
      dissolveLines: L.dissolveLines,
      agreeN: L.agreeN, agreeBad: L.agreeBad,
      upkeepDay: L.upkeepDay, upkeepCalls: L.upkeepCalls,
      linkHist: endLinkHistories(Game),
      linkTraj: L.linkTraj,
    },
  };
}

(async () => {
  console.log('RED: pristine runs carry no link-instrument state');
  for (const armed of [true, false]) {
    const { L } = await run(8801, 60, { armed, pristine: true, policy: leadfeast });
    ok(`pristine ${armed ? 'armed' : 'unset'} has no link probe state`, L === null);
  }

  console.log('GREEN: dissolution captured with named causes (8801 armed leadfeast, 180d)');
  {
    const { Game, L, result } = await run(8801, 180, { armed: true, pristine: false, policy: leadfeast });
    ok('dissolution event captured', L.dissolutions.length >= 1, `n=${L.dissolutions.length}`);
    const ev = L.dissolutions[0] || {};
    ok('event road=court road (lead)', ev.road === 'lead', `road=${ev.road}`);
    ok('event courtDay=77', ev.courtDay === 77, `courtDay=${ev.courtDay}`);
    ok('event carries link snapshot', (ev.links || []).length >= 3, `n=${(ev.links || []).length}`);
    const court = L.courts.find(c => c.day === 77);
    ok('court staged d77 lead', !!court && court.shape === 'lead', JSON.stringify(court));
    ok('polity agreement 100% (instrument vs engine)', L.agreeBad === 0 && L.agreeN > 100,
      `bad=${L.agreeBad} n=${L.agreeN}`);
    const row = dissolveRow(Game, L, result);
    const at = attributeDissolution(row, ev);
    ok('dissolution attributed to named cause class', at.attributed === true, `reason=${at.reason}`);
    ok('primary dropout = trust-below-bar', !!at.primary && at.primary.barFail === 'trust-below-bar',
      at.primary ? `${at.primary.barFail} ${at.primary.other} ${at.primary.courtTrust}->${at.primary.dissTrust}` : 'no primary');
    ok('primary dropout has upkeep notes in window', !!at.primary && at.primary.upkeepNoted,
      at.primary ? `[${at.primary.notes.join(',')}]` : 'no primary');
    const tendPaid = L.upkeepCalls.some(c => c.ch === 'tend' && c.paid > 0);
    ok('upkeep channel recorded engine return values (tend paid>0)', tendPaid,
      `calls=${L.upkeepCalls.length}`);
    ok('realm-death say-line captured', L.dissolveLines.some(l => /realm came apart/i.test(l.line)),
      `lines=${L.dissolveLines.length}`);
  }

  console.log('ENGAGE: post-court upkeep gaps on the lean-pantry seed');
  {
    const { Game, L, result } = await run(8801, 180, { armed: true, pristine: false, policy: leadfeast });
    const row = dissolveRow(Game, L, result);
    const g = upkeepGaps(row);
    ok('post-court upkeep gap kcal > 0', g.gapKcal > 0, `gapKcal=${Math.round(g.gapKcal)}`);
    const shortTend = L.upkeepCalls.some(c => c.ch === 'tend' && c.paid < 1500);
    ok('upkeep shortfall signal (tend<1500 or gate-skip weeks)', shortTend || g.skipWeeks > 0,
      `shortTend=${shortTend} skipWeeks=${g.skipWeeks}`);
  }

  console.log('DET: instrumented vs pristine ARMED byte-identical (40d x 2 seeds)');
  for (const seed of [8817, 8818]) {
    const a = await run(seed, 40, { armed: true, pristine: false, policy: leadfeast });
    const b = await run(seed, 40, { armed: true, pristine: true, policy: leadfeast });
    ok(`seed ${seed} canonical projection identical`, canon(a.Game) === canon(b.Game),
      canon(a.Game).length + ' vs ' + canon(b.Game).length + ' chars');
  }

  console.log('REPEAT: same armed seed twice in-process byte-identical');
  {
    const a = await run(8817, 40, { armed: true, pristine: false, policy: leadfeast });
    const ra = dissolveRow(a.Game, a.L, a.result);
    const b = await run(8817, 40, { armed: true, pristine: false, policy: leadfeast });
    const rb = dissolveRow(b.Game, b.L, b.result);
    ok('repeat armed run identical', JSON.stringify(ra) === JSON.stringify(rb));
  }

  console.log('RED-EQUIVALENT (same-commit): this driver unset vs parent driver unset (60d x 2 seeds, belongfeast)');
  {
    const driverRow = (driver, seed) => {
      const out = `/tmp/linkdissolve-redequiv-${seed}.json`;
      const env = Object.assign({}, process.env, {
        FEASTSCALE_R13: '1', SEATDRIVE: '0', POLICY: 'belongfeast',
        SEEDS: String(seed), DAYS: '60', OUT: out,
      });
      delete env.SURPLUSFEED;
      execFileSync('node', [driver], { env, stdio: 'pipe', timeout: 120000 });
      const row = JSON.parse(fs.readFileSync(out, 'utf8')).rows[0];
      const { ms, dissolve, ...rest } = row; // ms is timing; dissolve is the additive block
      return JSON.stringify(rest);
    };
    for (const seed of [8801, 8802]) {
      const mine = driverRow('scripts/probe-linkdissolve-b.js', seed);
      const parent = driverRow('scripts/probe-surplusfeed-national-b.js', seed);
      ok(`seed ${seed} zero drift vs parent driver`, mine === parent,
        mine === parent ? '' : `first diff at ${[...mine].findIndex((ch, i) => ch !== parent[i])}`);
    }
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
