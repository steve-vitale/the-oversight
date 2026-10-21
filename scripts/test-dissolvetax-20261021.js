#!/usr/bin/env node
// test-dissolvetax-20261021.js — proof gates for sim-dissolvetax.
//
// All gates GREEN before the sweep. Env per the Usage header (the RECOVERY
// ENV-TRAP: read the header before every proof/sweep run):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 \
//   node scripts/test-dissolvetax-20261021.js
//
// Gates:
//   E0 shape — module loads; exports install/uninstall/attributeDissolution/
//      dawnDissolveSensor/TAXONOMY; TAXONOMY is exactly the brief's 7 classes.
//   E1 det-gate — instrument-on vs instrument-off byte-identical trajectories
//      (2 seeds x 60d) on the EXTENDED canonical projection (dayHash +
//      hierarchy: links w/o unstable link.id, foreignPolities, nationalLive,
//      globalLive, nationalShape). The instrument's wraps add zero drift.
//   E2 env-gate — the sweep's env assertion accepts the pinned substrate and
//      rejects a broken one (forged env); forbidden extras rejected.
//   E3 read-only static scan — RED on any Math.random(, R(, pick( call or any
//      Game.state write in the instrument source.
//   E4 RED->GREEN on synthetic fixtures — one forged realm-loss record per
//      taxonomy class attributes correctly; a forged unattributable record
//      lands in `unexplained` WITH the honest reason.
//   D2: 180d run completes with the instrument installed + deterministic
//      re-run (same seed twice in-process byte-identical).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

// E2 env list (same as the sweep asserts).
var REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR'];
var BAN = ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS', 'SURPLUSFEED'];
function envProblems(env) {
  var out = [];
  for (var i = 0; i < REQ.length; i++) if (env[REQ[i]] !== '1') out.push(REQ[i] + '!=1');
  for (var j = 0; j < BAN.length; j++) if (BAN[j] in env) out.push(BAN[j] + ' set');
  return out;
}
for (const p of envProblems(process.env)) {
  console.error('GATE STOP: winning-substrate env problem: ' + p);
  process.exit(2);
}

const DT = require('./dissolvetax-instrument-20261021');
const VCE = require('./policies/vgearconfirm');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 400)); }
}

// Extended canonical projection: dayHash + hierarchy machinery the
// instrument's wraps touch (links minus unstable link.id, foreignPolities,
// national/global flags, shape).
function hierProj(Game) {
  try {
    var parts = [];
    var ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (var i = 0; i < ls.length; i++) {
      var l = ls[i];
      parts.push([l.status, l.primary, l.subordinate, l.a, l.b, l.kind,
        Math.round(l.trust || 0), Math.round(l.arrears || 0), l.day,
        Math.round(l.tributeKcalPerWeek || 0), l.conquered ? 1 : 0].join(','));
    }
    var fps = ((Game.state || {}).foreignPolities || []).map(function (f) {
      return (f.primary || '?') + ':' + (f.subs || []).slice().sort().join('+');
    }).sort().join(';');
    var st = Game.state || {};
    return parts.sort().join('|') + '#' + fps + '#' +
      (!!st.nationalLive ? 1 : 0) + (!!st.globalLive ? 1 : 0) + (st.nationalShape || '');
  } catch (e) { return 'ERR:' + String((e && e.message) || e); }
}

async function trajectory(seed, policyObj, days, withInstrument) {
  process.env.VGEAR = '1';
  const { Game } = await loadGame({ seed, mode: 'dissolvetax-det', fullTelemetry: false });
  let K = null, uninstall = null;
  if (withInstrument) { const r = DT.install(Game); K = r.K; uninstall = r.uninstall; }
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
  if (uninstall) { try { uninstall(); } catch (e) {} }
  const errs = K ? K.instrumentErrors : [];
  return { traj: hs.join('\n'), days: hs.length, errs, endReason: result.endReason };
}

// ---- E4 fixture builders (plain records; no engine) ----
function K0() { return { census: [], breaks: [], rumors: [], natEvents: [], dissolveLines: [], instrumentErrors: [], _prevNat: false }; }
function lk(other, dir, trust, arr, age, kind, extra) {
  return Object.assign({ other, kind: kind || 'vassal', dir, st: 0, trust, arr, age, tkpw: 4000, conq: 0, tpw: 6, tdw: 6, lkd: 6, mercy: -1 }, extra || {});
}
function row(d, nat, shape, links, fps, shapes, villages) {
  return { d, nat, shape, shapes: shapes || { lead: false, belong: false, covenant: false, trade: false }, links, fps: fps || [], villages: villages || [] };
}
function belongCensus(d, nat, oTrust, oArr, oAge, fpSubs, shape) {
  return row(d, nat, shape || 'belong',
    [lk('v1', 0, oTrust, oArr, oAge)],
    [{ primary: 'v1', nsubs: fpSubs.length, subs: fpSubs.slice() }],
    { lead: false, belong: nat, covenant: false, trade: false },
    [{ id: 'v1', name: 'Emberhold' }].concat(fpSubs.map(function (s, i) { return { id: s, name: 'Fire' + i }; })));
}

(async () => {
  // E0: shape.
  check('E0a: exports', typeof DT.install === 'function' &&
    typeof DT.attributeDissolution === 'function' && typeof DT.dawnDissolveSensor === 'function' &&
    Array.isArray(DT.TAXONOMY));
  check('E0b: TAXONOMY is the brief\'s 7 classes',
    JSON.stringify(DT.TAXONOMY) === JSON.stringify(['primary-foreign-collapse', 'sub-drift', 'arrears-disqualify', 'raid-burn', 'schism', 'other', 'unexplained']));

  // E1: det-gate (instrument-on vs off, 2 seeds x 60d, extended projection).
  const p1 = VCE.armedFor('leadfeast');
  const e1a1 = await trajectory(64911, p1, 60, true);
  const e1a2 = await trajectory(64911, p1, 60, false);
  check('E1a: instrument-on vs off byte-identical (leadfeast s64911 60d)',
    e1a1.traj === e1a2.traj && e1a1.traj.length > 0 && e1a1.errs.length === 0,
    'len ' + e1a1.traj.length + ' vs ' + e1a2.traj.length + ' errs ' + e1a1.errs.join(';'));
  const p2 = VCE.armedFor('belongfeast');
  const e1b1 = await trajectory(64912, p2, 60, true);
  const e1b2 = await trajectory(64912, p2, 60, false);
  check('E1b: instrument-on vs off byte-identical (belongfeast s64912 60d)',
    e1b1.traj === e1b2.traj && e1b1.traj.length > 0 && e1b1.errs.length === 0,
    'len ' + e1b1.traj.length + ' vs ' + e1b2.traj.length);

  // E2: env-gate (forged envs).
  check('E2a: pinned env accepted', envProblems(process.env).length === 0);
  const bad = Object.assign({}, process.env); delete bad.FEASTSCALE_R13;
  check('E2b: missing FEASTSCALE_R13 rejected', envProblems(bad).some(function (p) { return p.indexOf('FEASTSCALE_R13') === 0; }));
  const bad2 = Object.assign({}, process.env); bad2.SURPLUSFEED = '1';
  check('E2c: forbidden SURPLUSFEED rejected', envProblems(bad2).some(function (p) { return p.indexOf('SURPLUSFEED') === 0; }));
  check('E2d: fresh seeds 64901-64908 unused', (() => {
    // Inline freshness assertion (same registries the coordinator checks):
    // evidence per-seed filenames + sweep SEEDS lists. Manual full-repo
    // find/grep at proof time (2026-10-21) confirmed zero hits for 6490[1-8].
    const seeds = ['64901','64902','64903','64904','64905','64906','64907','64908'];
    const hits = [];
    try {
      const ev = path.join(REPO, 'evidence');
      for (const day of fs.readdirSync(ev)) {
        const dd = path.join(ev, day);
        if (!fs.statSync(dd).isDirectory()) continue;
        for (const sub of fs.readdirSync(dd)) {
          const fn = String(sub);
          for (const s of seeds) if (fn.indexOf(s) >= 0) hits.push(path.join(day, fn));
        }
      }
    } catch (e) {}
    try {
      const sc = path.join(REPO, 'scripts');
      for (const f of fs.readdirSync(sc)) {
        if (!/^sweep-.*\.js$/.test(f)) continue;
        // this arm's own sweep + proof legitimately name the seeds — the
        // freshness question is whether any OTHER experiment used them.
        if (f === 'sweep-dissolvetax-20261021.js' || f === 'test-dissolvetax-20261021.js') continue;
        const txt = fs.readFileSync(path.join(sc, f), 'utf8');
        for (const s of seeds) if (txt.indexOf(s) >= 0) hits.push('scripts/' + f + ':' + s);
      }
    } catch (e) {}
    return hits.length === 0;
  })(), 'see evidence/ + scripts/sweep-*.js scan');

  // E3: read-only static scan.
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'dissolvetax-instrument-20261021.js'), 'utf8');
  const code = src.split('\n').filter(function (l) { return l.trim().indexOf('//') !== 0; }).join('\n');
  check('E3a: no Math.random( in instrument', code.indexOf('Math.random(') < 0);
  check('E3b: no R() draws in instrument', !/\bR\s*\(/.test(code));
  check('E3c: no pick( calls in instrument', code.indexOf('pick(') < 0);
  check('E3d: no Game.state writes in instrument', !/\.state\.[A-Za-z0-9_$]+\s*=/.test(code) && code.indexOf('Game.state =') < 0,
    'the foreignPolities snapshot/restore guard uses delete-only; any assignment above would fail this');

  // E4: synthetic fixtures.
  function attr(K, d) { return DT.attributeDissolution(K, { d, kind: 'lost', shape: '' }); }

  // 1. primary-foreign-collapse.
  var K = K0();
  K.natEvents.push({ d: 70, kind: 'sat', shape: 'belong', fp: { primary: 'v1', nsubs: 2, subs: ['v2', 'v3'] } });
  K.census.push(belongCensus(119, true, 80, 0, 50, ['v2']));
  var a = attr(K, 120);
  check('E4a: primary-foreign-collapse', a.class === 'primary-foreign-collapse' && /v2/.test(a.evidence), JSON.stringify(a));

  // 2. arrears-disqualify.
  K = K0();
  K.natEvents.push({ d: 72, kind: 'sat', shape: 'belong', fp: { primary: 'v1', nsubs: 2, subs: ['v2', 'v3'] } });
  K.census.push(belongCensus(150, true, 70, 11250, 80, ['v2', 'v3']));
  a = attr(K, 151);
  check('E4b: arrears-disqualify', a.class === 'arrears-disqualify' && /11,250/.test(a.evidence), JSON.stringify(a));

  // 3. sub-drift (lead, no break).
  K = K0();
  K.natEvents.push({ d: 60, kind: 'sat', shape: 'lead', fp: null });
  K.census.push(row(99, true, 'lead',
    [lk('v1', 1, 90, 0, 60), lk('v2', 1, 35, 0, 60), lk('v3', 1, 88, 0, 60)], [],
    { lead: true, belong: false, covenant: false, trade: false }));
  a = attr(K, 100);
  check('E4c: sub-drift (lead, no break)', a.class === 'sub-drift' && /v2/.test(a.evidence) && /35/.test(a.evidence), JSON.stringify(a));

  // 4. sub-drift (break-neglect).
  K = K0();
  K.natEvents.push({ d: 60, kind: 'sat', shape: 'lead', fp: null });
  K.census.push(row(99, true, 'lead',
    [lk('v1', 1, 90, 0, 60), lk('v2', 1, 90, 0, 60), lk('v3', 1, 88, 0, 60)], [],
    { lead: true, belong: false, covenant: false, trade: false }));
  K.breaks.push({ d: 97, how: 'succession', other: 'v2', kind: 'vassal', trust: 15, arr: 0, kept: 20, natLive: true });
  a = attr(K, 100);
  check('E4d: sub-drift (break-neglect)', a.class === 'sub-drift' && a.sub === 'break-neglect', JSON.stringify(a));

  // 5. other (break-revolt).
  K = K0();
  K.natEvents.push({ d: 60, kind: 'sat', shape: 'lead', fp: null });
  K.census.push(row(99, true, 'lead',
    [lk('v1', 1, 90, 0, 60), lk('v2', 1, 90, 0, 60), lk('v3', 1, 88, 0, 60)], [],
    { lead: true, belong: false, covenant: false, trade: false }));
  K.breaks.push({ d: 98, how: 'revolt', other: 'v2', kind: 'vassal', trust: 25, arr: 0, kept: 3, natLive: true });
  a = attr(K, 100);
  check('E4e: other (break-revolt)', a.class === 'other' && a.sub === 'break-revolt', JSON.stringify(a));

  // 6. other (break-policy on covenant).
  K = K0();
  K.natEvents.push({ d: 60, kind: 'sat', shape: 'covenant', fp: null });
  K.census.push(row(99, true, 'covenant',
    [lk('v5', 2, 60, 0, 60, 'covenant'), lk('v6', 2, 62, 0, 60, 'covenant'), lk('v7', 2, 58, 0, 60, 'covenant')], [],
    { lead: false, belong: false, covenant: true, trade: false }));
  K.breaks.push({ d: 98, how: 'seceded', other: 'v5', kind: 'covenant', trust: 45, arr: 0, kept: 2, natLive: true });
  a = attr(K, 100);
  check('E4f: other (break-policy)', a.class === 'other' && a.sub === 'break-policy', JSON.stringify(a));

  // 7. schism (no mechanical delta, schism on a member in-window).
  K = K0();
  K.natEvents.push({ d: 60, kind: 'sat', shape: 'lead', fp: null });
  K.census.push(row(99, true, 'lead',
    [lk('v1', 1, 90, 0, 60), lk('v2', 1, 90, 0, 60), lk('v3', 1, 88, 0, 60)], [],
    { lead: false, belong: false, covenant: false, trade: false },
    [{ id: 'v2', name: 'Stonebridge' }]));
  K.rumors.push({ d: 95, village: 'v2', kind: 'schism', cause: 'hardline' });
  a = attr(K, 100);
  check('E4g: schism (context-only, honest note)', a.class === 'schism' && /mechanism unconfirmed in engine/.test(a.evidence), JSON.stringify(a));

  // 8. raid-burn (raid-destruction line naming a realm member in-window).
  K = K0();
  K.natEvents.push({ d: 60, kind: 'sat', shape: 'lead', fp: null });
  K.census.push(row(99, true, 'lead',
    [lk('v1', 1, 90, 0, 60), lk('v2', 1, 90, 0, 60), lk('v3', 1, 88, 0, 60)], [],
    { lead: false, belong: false, covenant: false, trade: false },
    [{ id: 'v2', name: 'Emberhold' }]));
  K.dissolveLines.push({ d: 96, line: 'A raid torches Emberhold — the granary burns and the bond with it.' });
  a = attr(K, 100);
  check('E4h: raid-burn', a.class === 'raid-burn' && /Emberhold/.test(a.evidence), JSON.stringify(a));

  // 9. other (link inactive, no break).
  K = K0();
  K.natEvents.push({ d: 60, kind: 'sat', shape: 'lead', fp: null });
  K.census.push(row(99, true, 'lead',
    [lk('v1', 1, 90, 0, 60), lk('v2', 1, 88, 0, 60), Object.assign(lk('v3', 1, 88, 0, 60), { st: 1 })], [],
    { lead: false, belong: false, covenant: false, trade: false }));
  a = attr(K, 100);
  check('E4i: other (inactive link, no break)', a.class === 'other' && /v3/.test(a.evidence), JSON.stringify(a));

  // 10. unexplained — forged unattributable record; the gate demands the
  // reason be honest.
  K = K0();
  K.natEvents.push({ d: 60, kind: 'sat', shape: 'lead', fp: null });
  K.census.push(row(99, true, 'lead',
    [lk('v1', 1, 90, 0, 60), lk('v2', 1, 90, 0, 60), lk('v3', 1, 88, 0, 60)], [],
    { lead: false, belong: false, covenant: false, trade: false }));
  a = attr(K, 100);
  check('E4j: unexplained (honest reason)', a.class === 'unexplained' && /no polity-component delta/.test(a.evidence), JSON.stringify(a));

  // D2: 180d run completes with the instrument installed + deterministic re-run.
  const d2a1 = await trajectory(64913, VCE.armedFor('leadfeast'), 180, true);
  const d2a2 = await trajectory(64913, VCE.armedFor('leadfeast'), 180, true);
  check('D2a: 180d leadfeast instrumented completes + deterministic',
    d2a1.traj === d2a2.traj && d2a1.traj.length > 0 && d2a1.errs.length === 0,
    'days ' + d2a1.days + ' end ' + d2a1.endReason + ' errs ' + d2a1.errs.join(';'));
  const d2b1 = await trajectory(64914, VCE.armedFor('belongfeast'), 180, true);
  const d2b2 = await trajectory(64914, VCE.armedFor('belongfeast'), 180, true);
  check('D2b: 180d belongfeast instrumented completes + deterministic',
    d2b1.traj === d2b2.traj && d2b1.traj.length > 0 && d2b1.errs.length === 0,
    'days ' + d2b1.days + ' end ' + d2b1.endReason);

  console.log(`\n${pass}/${pass + fail} PASS, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
