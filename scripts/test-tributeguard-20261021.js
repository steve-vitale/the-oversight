#!/usr/bin/env node
// test-tributeguard-20261021.js — proof for scripts/policies/tributeguard.js
// (flesh-out loop, 2026-10-21, arm sim-tributeguard, axis scale-onramp,
// backlog #752: the sim-dissolvetax DIAG's named next).
//
// RED->GREEN on the guard + det-gates + D2 real-sweep gate.
// Composition honesty is proved BEFORE any sweep; any gate failure =
// FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the VGEAR=1 winning substrate from sim-fullseat):
//   control = TG.armedFor('belongfeast') with TRIBGUARD unset
//             (withTributeGuard OUTSIDE the vgearconfirm armed stack;
//              read-only skip counting, pure delegation)
//   armed   = TG.armedFor('belongfeast') with TRIBGUARD=1 (the guard)
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=1 VGEAR=1. TRIBGUARD toggled per gate.
//
// Gates:
//   E0 module shape (exports, armedFor ids, tributeguardOn).
//   E1 det-gate: TRIBGUARD unset -> withTributeGuard(VCE.armedFor) trajectories
//      byte-identical to VCE.armedFor (2 seeds x 60d) — the "guard-off
//      reproduces control" claim, proved on the winning substrate, with the
//      extended canonical projection (dayHash + hierarchy: links minus
//      unstable link.id, foreignPolities, nationalLive/globalLive/
//      nationalShape).
//   E2 env-gate: pinned substrate accepted; missing FEASTSCALE_R13 rejected;
//      forbidden extras rejected; seeds 64921-64928 + 64931-64933 asserted
//      fresh (evidence per-seed filenames + sweep SEEDS lists scanned; the
//      arm's own files excluded — the freshness question is other
//      experiments).
//   E3 read-only static scan: no Math.random(, no R( draws, no pick( calls,
//      no Game.state writes in the layer source (the only Game-mutating path
//      is the documented Game.payTribute verb call).
//   E4 RED->GREEN on synthetic fixtures (fake Game + fake inner policy that
//      replicates belongseek's pantry-skip gate):
//      E4a RED: TRIBGUARD unset, court held, thin pantry -> inner skips,
//         tgSkips=1, payTribute never called.
//      E4b GREEN: TRIBGUARD=1, same setup -> payTribute called once,
//         tgGuardPaid=1, no skip counted.
//      E4c court-scoped: TRIBGUARD=1, court NOT held -> guard does NOT pay
//         (the skip still happens; the guard only covers held courts).
//      E4d fat pantry: TRIBGUARD=1, court held, pantry > 2x tribute -> inner
//         pays itself, guard silent (tgGuardPaid=0).
//   D2 real-sweep gate: 180d armed run completes (s64933 belongfeast) +
//      deterministic in-process re-run byte-identical.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 \
//     node scripts/test-tributeguard-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'tributeguard.js'))) {
  console.error('RED: scripts/policies/tributeguard.js missing.');
  process.exit(1);
}

// E2 env lists (same as the sweep asserts).
const REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR'];
const BAN = ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS', 'SURPLUSFEED'];
function envProblems(env) {
  const out = [];
  for (const k of REQ) if (env[k] !== '1') out.push(k + '!=1');
  for (const k of BAN) if (k in env) out.push(k + ' set');
  return out;
}
{
  const probs = envProblems(process.env);
  if (probs.length) { console.error('GATE STOP: substrate env problem: ' + probs.join(', ')); process.exit(2); }
}

const TG = require('./policies/tributeguard');
const VCE = require('./policies/vgearconfirm');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 300)); }
}

function hierProj(Game) {
  try {
    const parts = [];
    const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (const l of ls) {
      parts.push([l.status, l.primary, l.subordinate, l.a, l.b, l.kind,
        Math.round(l.trust || 0), Math.round(l.arrears || 0), l.day,
        Math.round(l.tributeKcalPerWeek || 0), l.conquered ? 1 : 0,
        l.tributePaidWeek, Math.round(l.tributePaidKcal || 0)].join(','));
    }
    const fps = ((Game.state || {}).foreignPolities || []).map(function (f) {
      return (f.primary || '?') + ':' + (f.subs || []).slice().sort().join('+');
    }).sort().join(';');
    const st = Game.state || {};
    return parts.sort().join('|') + '#' + fps + '#' +
      (!!st.nationalLive ? 1 : 0) + (!!st.globalLive ? 1 : 0) + (st.nationalShape || '');
  } catch (e) { return 'ERR:' + String((e && e.message) || e); }
}

async function trajectory(seed, policyObj, days, tgOn) {
  process.env.VGEAR = '1';
  if (tgOn) process.env.TRIBGUARD = '1'; else delete process.env.TRIBGUARD;
  const { Game } = await loadGame({ seed, mode: 'tributeguard-det', fullTelemetry: false });
  await setupGame(Game);
  const hs = [];
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G) + ':' + hierProj(G)); } catch (e) {}
    },
  });
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
  return { traj: hs.join('\n'), days: hs.length, endReason: result.endReason };
}

// ---- E4 fixture builders (fake Game; no engine) ----
function fakeGame(o) {
  const day = o.day || 120;
  const link = {
    id: 'L1', status: 'active', subordinate: 'haven', primary: 'thorn',
    tributeKcalPerWeek: 4000, tributePaidWeek: -1, tributePaidKcal: 0,
    arrears: 0, trust: 70, day: 100,
  };
  const pantry = [{ kcalEach: 1000, units: o.pantryUnits || 5 }];
  const calls = [];
  return {
    state: { village: { pantry }, scholar: { day } },
    hierarchyState: () => [link],
    polityOf: (id) => (o.courtHeld && id === 'thorn') ? { shape: 'belong', primary: id } : null,
    _week: () => Math.floor(day / 7),
    payTribute: (id) => {
      calls.push(id);
      link.tributePaidWeek = Math.floor(day / 7);
      return Math.min(4000, 1000 * (o.pantryUnits || 5));
    },
    _link: link, _calls: calls,
  };
}
// Fake inner policy replicating belongseek's pantry-skip gate (belongseek.js
// step 2): pays only when pantryKcal > 2x tribute; otherwise skips.
function fakeInner() {
  return {
    id: 'inner-skipgate',
    daily(Game, ctx) {
      const ls = Game.hierarchyState() || [];
      const link = ls.find(l => l && l.status === 'active' && l.subordinate === 'haven' && !l.kind) || null;
      if (link && Game.payTribute) {
        const week = Game._week();
        if ((link.tributePaidWeek || -1) !== week) {
          const trib = link.tributeKcalPerWeek || 4000;
          const pk = ((Game.state.village || {}).pantry || [])
            .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
          if (pk > trib * 2) { Game.payTribute(link.id); ctx.innerPaid = (ctx.innerPaid | 0) + 1; }
          else ctx.innerSkipped = (ctx.innerSkipped | 0) + 1;
        }
      }
    },
  };
}

(async () => {
  // E0: shape.
  check('E0a: exports (tributeguardOn, ownSubLink, courtHeld, skipWouldFire, withTributeGuard, armedFor)',
    typeof TG.tributeguardOn === 'function' && typeof TG.ownSubLink === 'function' &&
    typeof TG.courtHeld === 'function' && typeof TG.skipWouldFire === 'function' &&
    typeof TG.withTributeGuard === 'function' && typeof TG.armedFor === 'function');
  check('E0b: armedFor id tags', TG.armedFor('belongfeast').id === 'belong-tributeguard' &&
    TG.armedFor('leadfeast').id === 'lead-tributeguard');
  check('E0c: tributeguardOn env gate', (() => {
    delete process.env.TRIBGUARD;
    const off = TG.tributeguardOn() === false;
    process.env.TRIBGUARD = '1';
    const on = TG.tributeguardOn() === true;
    delete process.env.TRIBGUARD;
    return off && on;
  })());

  // E1: det-gate — TRIBGUARD unset: wrapped == unwrapped, byte-identical.
  for (const seed of [64931, 64932]) {
    delete process.env.TRIBGUARD;
    const wrapped = TG.withTributeGuard(VCE.armedFor('belongfeast'), 'x', 'x');
    const a = await trajectory(seed, VCE.armedFor('belongfeast'), 60);
    const b = await trajectory(seed, wrapped, 60);
    check(`E1: TRIBGUARD-unset byte-identical (s${seed} 60d, ${a.days}d hashed)`,
      a.traj === b.traj && a.days === b.days && a.days > 0,
      a.traj === b.traj ? `days=${a.days} end=${a.endReason}` : 'TRAJECTORIES DIFFER');
  }

  // E2: seed freshness — the arm's seeds must not appear in other
  // experiments' per-seed filenames or sweep SEEDS lists.
  {
    const own = ['tributeguard', 'test-tributeguard', 'sweep-tributeguard', 'analyze-tributeguard'];
    const armSeeds = ['64921', '64922', '64923', '64924', '64925', '64926', '64927', '64928',
      '64931', '64932', '64933'];
    const hits = [];
    const evidDir = path.join(REPO, 'evidence', '2026-10-21');
    let files = [];
    try { files = fs.readdirSync(evidDir); } catch (e) {}
    for (const f of files) {
      if (own.some(o => f.indexOf(o) >= 0)) continue;
      for (const s of armSeeds) if (f.indexOf('-s' + s + '.') >= 0 || f.indexOf('-s' + s + '-') >= 0) hits.push('evidence:' + f);
    }
    const sweepDir = path.join(REPO, 'scripts');
    let sfiles = [];
    try { sfiles = fs.readdirSync(sweepDir).filter(f => f.indexOf('sweep-') === 0); } catch (e) {}
    for (const f of sfiles) {
      if (own.some(o => f.indexOf(o) >= 0)) continue;
      let txt = '';
      try { txt = fs.readFileSync(path.join(sweepDir, f), 'utf8'); } catch (e) {}
      for (const s of armSeeds) {
        if (new RegExp('[^0-9]' + s + '[^0-9]').test(txt)) hits.push('sweep:' + f + ':' + s);
      }
    }
    check('E2a: arm seeds fresh (64921-64928 sweep, 64931/64932 det, 64933 D2)',
      hits.length === 0, hits.slice(0, 5).join('; '));
  }

  // E3: read-only static scan of the layer source.
  {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'tributeguard.js'), 'utf8');
    const code = src.split('\n').filter(l => l.trim().indexOf('//') !== 0).join('\n');
    check('E3a: no Math.random( in layer', code.indexOf('Math.random(') < 0);
    check('E3b: no R() draws in layer', !/\bR\s*\(/.test(code));
    check('E3c: no pick( calls in layer', code.indexOf('pick(') < 0);
    check('E3d: no Game.state writes in layer (only the documented Game.payTribute verb mutates)',
      !/\.state\.[A-Za-z0-9_$]+\s*=/.test(code) && code.indexOf('Game.state =') < 0);
  }

  // E4: RED->GREEN fixtures.
  function runFixture(env1, gameOpts) {
    if (env1) process.env.TRIBGUARD = '1'; else delete process.env.TRIBGUARD;
    const Game = fakeGame(gameOpts);
    const ctx = {};
    const policy = TG.withTributeGuard(fakeInner(), 'fixture', 'fixture');
    policy.daily(Game, ctx);
    delete process.env.TRIBGUARD;
    return { Game, ctx };
  }
  {
    // E4a RED: control, court held, thin pantry (5000 <= 8000) -> skip.
    const { Game, ctx } = runFixture(false, { courtHeld: true, pantryUnits: 5 });
    check('E4a RED: control skip counted, payTribute never called',
      (ctx.tgSkips | 0) === 1 && Game._calls.length === 0 && (ctx.innerSkipped | 0) === 1,
      JSON.stringify({ skips: ctx.tgSkips, calls: Game._calls.length, innerSkipped: ctx.innerSkipped }));
    check('E4a2: control counted exactly one skip event', (ctx.tgEvents || []).length === 1 &&
      ctx.tgEvents[0].kind === 'skip');
  }
  {
    // E4b GREEN: armed, same setup -> guard pays, no skip counted.
    const { Game, ctx } = runFixture(true, { courtHeld: true, pantryUnits: 5 });
    check('E4b GREEN: armed guard pays once, no skip counted',
      Game._calls.length === 1 && (ctx.tgGuardPaid | 0) === 1 && !(ctx.tgSkips | 0),
      JSON.stringify({ calls: Game._calls.length, paid: ctx.tgGuardPaid, skips: ctx.tgSkips }));
    check('E4b2: guard-paid event logged', (ctx.tgEvents || []).length === 1 &&
      ctx.tgEvents[0].kind === 'guard-paid' && ctx.tgEvents[0].day === 120);
  }
  {
    // E4c court-scoped: armed, court NOT held -> guard does NOT pay.
    const { Game, ctx } = runFixture(true, { courtHeld: false, pantryUnits: 5 });
    check('E4c: no court -> guard silent (no payTribute), skip still counted by control path n/a here',
      Game._calls.length === 0 && !(ctx.tgGuardPaid | 0),
      JSON.stringify({ calls: Game._calls.length, paid: ctx.tgGuardPaid }));
  }
  {
    // E4d fat pantry: armed, court held, pantry 20000 > 8000 -> inner pays
    // itself; guard never fires.
    const { Game, ctx } = runFixture(true, { courtHeld: true, pantryUnits: 20 });
    check('E4d: fat pantry -> inner pays, guard silent',
      Game._calls.length === 1 && !(ctx.tgGuardPaid | 0) && (ctx.innerPaid | 0) === 1,
      JSON.stringify({ calls: Game._calls.length, paid: ctx.tgGuardPaid, innerPaid: ctx.innerPaid }));
  }

  // D2: 180d armed run completes + deterministic re-run byte-identical.
  {
    process.env.VGEAR = '1';
    process.env.TRIBGUARD = '1';
    const policy = TG.armedFor('belongfeast');
    const a = await trajectory(64933, policy, 180, true);
    const b = await trajectory(64933, policy, 180, true);
    delete process.env.TRIBGUARD;
    check('D2: 180d armed run completes + deterministic re-run byte-identical',
      a.traj === b.traj && a.days > 150,
      `days=${a.days}/${b.days} end=${a.endReason}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
