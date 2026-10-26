#!/usr/bin/env node
// sweep-fishfallback-b.js — FISH-STAFFING-FALLBACK lever recorder
// (sim-fishfallback-b, 2026-10-26, oversight-flesh-out-loop-b, axis
// food-economy). Derived from scripts/sweep-fishstaff-b.js (same harness
// use, env asserts, death-aware horizons, EPERM-resilient writes, and the
// same fish classification: caller stacks, full returns + refusal reasons,
// the other two assignment writers, resolve fish maps, pre/post-daily
// snapshots with full assignment objects). NEW vs fishstaff-b: an ARM
// label (baseline|armed) carried in every file name and record, a
// read-only Game.say tap for fish dialogue (the emit tap caught 0 fish
// lines in fishstaff-b because fish lines go through G.say), and a
// ctx-counter capture (fishStaffed / fishStaffFallback) proving whether
// the fallback actually fired. All wrappers delegate first, then count;
// a counting failure can never change game behavior.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0, DEPOSITGATE=1 explicit; SIDE=pd0|pd1
//   with PLENTYDEPRI matching; POLICY=leadfeast; SEEDS; DAYS=100.
//   FISHFALLBACK_NEUTRAL=1: all wrappers off (neutrality baseline).
//   ARM=baseline|armed (default baseline).
// ARM=baseline SIDE=pd0 POLICY=leadfeast SEEDS=... OUT=<path>
//   PERSEED_DIR=<path> node scripts/sweep-fishfallback-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'pd0';
const PD_WANT = SIDE === 'pd1' ? '1' : '0';
if (process.env.PLENTYDEPRI !== PD_WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires PLENTYDEPRI=${PD_WANT} explicitly`);
  process.exit(2);
}
if (process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: this recorder is dg1-only; DEPOSITGATE=1 must be set explicitly');
  process.exit(2);
}
const NEUTRAL = process.env.FISHFALLBACK_NEUTRAL === '1';
const ARM = (process.env.ARM === 'armed' ? 'armed' : 'baseline');
let HEAD = null, COMPETENT_DIGEST = null;
try { HEAD = require('child_process').execFileSync('git', ['rev-parse', 'HEAD'], { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim(); } catch (e) {}
try { COMPETENT_DIGEST = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname, 'policies', 'competent.js'))).digest('hex').slice(0, 16); } catch (e) {}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9754').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-fishfallback-b-corpus', `sweep-fishfallback-${SIDE}-dg1-${POLICY_ID}.json`);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-fishfallback-b-corpus');

function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 59) {
        // EPERM-FLAP LAST RESORT (fishstaff-b): after 60 retries the
        // container still denies the write. Do NOT lose the sim: emit
        // the payload on stdout under a @@FALLBACK marker so the runner
        // can recover it from a captured log. Never exit(2) with the
        // data only in memory.
        process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n');
        return;
      }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'fishfallback-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(),
    fishCalls: [],            // every assignTask('fish') + offerDeal/appeal fish call
    resolveEvents: [],        // resolveAssignments fish before/after
    dailySnaps: [],           // pre/post policy-daily fish assignment objects
    saySamples: [],
    ctxEnd: {},
  };
  const dayNow = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const partNow = () => { try { return Game.dayPart; } catch (e) { return null; } };
  const personFor = (vid) => { try { if (typeof Game.getPerson === 'function') { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {} try { return ((Game.data || {}).villagers || []).find(x => x && x.id === vid) || {}; } catch (e) { return {}; } };
  const trustOf = (vid) => { try { const t = ((Game.state || {}).village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return null; } };
  const atHaven = () => { try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return null; } };
  const shelteredOf = (vid) => { try { return !!(Game.isSheltered && Game.isSheltered(vid)); } catch (e) { return null; } };
  const fishAsg = () => {
    const out = [];
    try {
      const asg = ((Game.state || {}).village || {}).assignments || {};
      for (const [vid, a] of Object.entries(asg)) {
        if (a && a.task === 'fish') out.push({ vid, assignedDay: a.assignedDay, assignedPart: a.assignedPart, via: a.via || null, buddy: a.buddy || null, trust: trustOf(vid), sheltered: shelteredOf(vid) });
      }
    } catch (e) {}
    return out;
  };
  // Caller stack: first frames outside this driver file, basenames only.
  const callerOf = () => {
    try {
      const st = (new Error().stack || '').split('\n').slice(1);
      const frames = [];
      for (const line of st) {
        if (line.includes('sweep-fishfallback-b.js')) continue;
        const m = line.match(/at\s+(.*?)\s+\((.*)\)/) || line.match(/at\s+(.*)/);
        if (!m) continue;
        const loc = (m[2] || m[1] || '').replace(/^.*\/([^/]+\/[^/]+)$/, '$1');
        const fn = m[2] ? m[1] : '';
        frames.push((fn ? fn + '@' : '') + loc);
        if (frames.length >= 4) break;
      }
      return frames;
    } catch (e) { return []; }
  };
  const classifyRet = (ret) => {
    if (ret === null || ret === undefined) return 'null';
    if (typeof ret === 'object') { if (ret.ok) return 'ok'; if (ret.refused) return 'refused'; return 'other-obj'; }
    return typeof ret;
  };

  if (!NEUTRAL) {
    const oAssign = Game.assignTask;
    if (typeof oAssign === 'function') Game.assignTask = function (vid, task, opts) {
      const trustBefore = trustOf(vid);
      const havenBefore = atHaven();
      const caller = callerOf();
      const ret = oAssign.apply(this, arguments);
      try {
        if (task === 'fish') {
          const lr = ((Game.state || {}).village || {}).lastRefusal;
          W.fishCalls.push({ day: dayNow(), part: partNow(), verb: 'assignTask', vid,
            occ: String((personFor(vid).formerOccupation || '')),
            via: (opts && opts.via) || null, ret: classifyRet(ret),
            reason: (ret && ret.reason) || null,
            lastRefusalReason: (lr && lr.vid === vid && lr.task === 'fish') ? String(lr.reason || '').slice(0, 120) : null,
            trustBefore, havenBefore, caller });
        }
      } catch (e) {}
      return ret;
    };
    for (const verb of ['offerDeal', 'appealToGoal']) {
      const orig = Game[verb];
      if (typeof orig === 'function') Game[verb] = function (vid, task) {
        const trustBefore = trustOf(vid);
        const havenBefore = atHaven();
        const caller = callerOf();
        const ret = orig.apply(this, arguments);
        try {
          if (task === 'fish') W.fishCalls.push({ day: dayNow(), part: partNow(), verb, vid,
            occ: String((personFor(vid).formerOccupation || '')),
            via: verb === 'offerDeal' ? 'deal' : 'appeal', ret: classifyRet(ret),
            reason: (ret && ret.reason) || null, lastRefusalReason: null,
            trustBefore, havenBefore, caller });
        } catch (e) {}
        return ret;
      };
    }
    const oResolve = Game.resolveAssignments;
    if (typeof oResolve === 'function') Game.resolveAssignments = function () {
      const pre = fishAsg();
      const ret = oResolve.apply(this, arguments);
      try {
        const post = fishAsg();
        const postVids = new Set(post.map(x => x.vid));
        const preVids = new Set(pre.map(x => x.vid));
        W.resolveEvents.push({ day: dayNow(), part: partNow(),
          pre: pre.map(x => x.vid), post: post.map(x => x.vid),
          resolved: pre.filter(x => !postVids.has(x.vid)).map(x => x.vid),
          kept: pre.filter(x => postVids.has(x.vid)).map(x => x.vid),
          created: post.filter(x => !preVids.has(x.vid)).map(x => x.vid) });
      } catch (e) {}
      return ret;
    };
    const oDie = Game.registerDeath;
    if (typeof oDie === 'function') Game.registerDeath = function () {
      const ret = oDie.apply(this, arguments);
      try {
        const opts = arguments[0];
        const kind = String((opts && opts.kind) || '');
        if (kind === 'person' || kind === 'villager') {
          const who = String((opts && (opts.villagerId || opts.name)) || '?');
          const day = (Game.state.scholar || {}).day || 0;
          const cause = canonCause((opts && opts.cause) || '?');
          const key = who + '|' + day + '|' + cause;
          if (!W.deathSeen.has(key)) { W.deathSeen.add(key); W.deaths.push({ day, who: who.slice(0, 24), kind, cause }); }
        }
      } catch (e) {}
      return ret;
    };
    const oEmit = Game.emit;
    if (typeof oEmit === 'function') Game.emit = function (text, surface) {
      const ret = oEmit.apply(this, arguments);
      try {
        const t = String(text == null ? '' : text);
        if (/worked the creek|walked the banks/i.test(t) && W.saySamples.length < 40)
          W.saySamples.push({ day: dayNow(), text: t.slice(0, 240) });
      } catch (e) {}
      return ret;
    };
    // SAY TAP (fishfallback-b): fish resolution lines go through G.say,
    // not Game.emit (fishstaff-b caught 0 fish lines via emit). Read-only:
    // delegate first, then copy matching lines.
    const oSay = Game.say;
    if (typeof oSay === 'function') Game.say = function (text) {
      const ret = oSay.apply(this, arguments);
      try {
        const t = String(text == null ? '' : text);
        if (/creek|fish/i.test(t) && W.saySamples.length < 40)
          W.saySamples.push({ day: dayNow(), viaSay: true, text: t.slice(0, 240) });
      } catch (e) {}
      return ret;
    };
  }

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    const pre = NEUTRAL ? [] : fishAsg();
    let r = undefined;
    if (origDaily) r = origDaily(G, ctx);
    try { if (ctx) W.ctxEnd = { fishStaffed: ctx.fishStaffed || 0, fishStaffFallback: ctx.fishStaffFallback || 0, cookStaffed: ctx.cookStaffed || 0, cookStaffFallback: ctx.cookStaffFallback || 0 }; } catch (e) {}
    if (!NEUTRAL) {
      const post = fishAsg();
      W.dailySnaps.push({ day: dayNow(), pre, post });
    }
    return r;
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();

  // Classification: every post-daily snapshot fish-holder gets exactly one label.
  const fishDays = []; // {day, holders:[{vid,assignedDay,assignedPart,via,class,evidence}]}
  if (!NEUTRAL) {
    for (const snap of W.dailySnaps) {
      if (!snap.post.length) continue;
      const holders = snap.post.map(h => {
        const okCall = W.fishCalls.find(c => c.verb === 'assignTask' && c.vid === h.vid && c.day === snap.day && c.ret === 'ok');
        const dealCall = W.fishCalls.find(c => c.verb === 'offerDeal' && c.vid === h.vid && c.day === snap.day && c.ret === 'ok');
        const appealCall = W.fishCalls.find(c => c.verb === 'appealToGoal' && c.vid === h.vid && c.day === snap.day && c.ret === 'ok');
        let cls, evidence;
        if (okCall) { cls = 'FRESH-OK'; evidence = 'assignTask ok day ' + snap.day; }
        else if (dealCall) { cls = 'DEAL'; evidence = 'offerDeal ok day ' + snap.day; }
        else if (appealCall) { cls = 'APPEAL'; evidence = 'appealToGoal ok day ' + snap.day; }
        else if (h.assignedDay !== undefined && h.assignedDay !== null && h.assignedDay < snap.day) { cls = 'STALE'; evidence = 'assignedDay ' + h.assignedDay + ' < snapshot day ' + snap.day; }
        else if (snap.pre.some(p => p.vid === h.vid)) { cls = 'STALE'; evidence = 'present pre-daily, assignedDay ' + h.assignedDay; }
        else { cls = 'GAP'; evidence = 'no ok/deal/appeal call this day; assignedDay ' + h.assignedDay + ' via ' + h.via; }
        return { vid: h.vid, assignedDay: h.assignedDay, assignedPart: h.assignedPart, via: h.via, trust: h.trust, sheltered: h.sheltered, class: cls, evidence };
      });
      fishDays.push({ day: snap.day, holders });
    }
  }

  const agg = (() => {
    const a = { fishCalls: 0, fishOk: 0, fishRefused: 0, fishNull: 0, fishOther: 0,
      okByVid: {}, refusedByVid: {}, nullByVid: {},
      refusedTrustBelow10: 0, refusedTrustAt10Plus: 0, refusedTrustNull: 0,
      nullHavenFalse: 0, nullHavenTrue: 0,
      callerSplit: {}, refusalReasonSplit: {},
      dealCalls: 0, dealOk: 0, appealCalls: 0, appealOk: 0,
      snapFishDays: fishDays.length,
      holdersByClass: { 'FRESH-OK': 0, DEAL: 0, APPEAL: 0, STALE: 0, GAP: 0 },
      staleDays: [], gapDays: [],
      resolveFishResolved: 0, resolveFishKept: 0 };
    for (const c of W.fishCalls) {
      const topCaller = (c.caller || []).join(' | ');
      if (c.verb === 'assignTask') {
        a.fishCalls += 1;
        if (c.ret === 'ok') { a.fishOk += 1; a.okByVid[c.vid] = (a.okByVid[c.vid] || 0) + 1; }
        else if (c.ret === 'refused') {
          a.fishRefused += 1; a.refusedByVid[c.vid] = (a.refusedByVid[c.vid] || 0) + 1;
          if (c.trustBefore === null || c.trustBefore === undefined) a.refusedTrustNull += 1;
          else if (c.trustBefore < 10) a.refusedTrustBelow10 += 1; else a.refusedTrustAt10Plus += 1;
          const rsn = c.reason || c.lastRefusalReason || '(no reason recorded)';
          const key = String(rsn).replace(/^[^\"]*\"/, '').slice(0, 60);
          a.refusalReasonSplit[key] = (a.refusalReasonSplit[key] || 0) + 1;
        }
        else if (c.ret === 'null') { a.fishNull += 1; a.nullByVid[c.vid] = (a.nullByVid[c.vid] || 0) + 1; if (c.havenBefore === false) a.nullHavenFalse += 1; else if (c.havenBefore === true) a.nullHavenTrue += 1; }
        else a.fishOther += 1;
        const ck = (c.caller || [])[0] || '(no stack)';
        a.callerSplit[ck] = (a.callerSplit[ck] || 0) + 1;
        void topCaller;
      } else if (c.verb === 'offerDeal') { a.dealCalls += 1; if (c.ret === 'ok') a.dealOk += 1; }
      else if (c.verb === 'appealToGoal') { a.appealCalls += 1; if (c.ret === 'ok') a.appealOk += 1; }
    }
    for (const fd of fishDays) {
      let hasStale = false, hasGap = false;
      for (const h of fd.holders) {
        a.holdersByClass[h.class] = (a.holdersByClass[h.class] || 0) + 1;
        if (h.class === 'STALE') hasStale = true;
        if (h.class === 'GAP') hasGap = true;
      }
      if (hasStale) a.staleDays.push(fd.day);
      if (hasGap) a.gapDays.push(fd.day);
    }
    for (const re of W.resolveEvents) { a.resolveFishResolved += re.resolved.length; a.resolveFishKept += re.kept.length; }
    return a;
  })();

  const perSeed = {
    seed, arm: ARM, head: HEAD, competentDigest: COMPETENT_DIGEST,
    policy: POLICY_ID, plentydepri: PD_WANT === '1' ? 1 : 0, depositgate: 1,
    neutral: NEUTRAL,
    ctxEnd: W.ctxEnd,
    starvationDeaths: NEUTRAL ? null : W.deaths.filter(d => /starv/i.test(d.cause)).length,
    daysAlive: result.days, endReason: result.endReason,
    deaths: NEUTRAL ? null : W.deaths.length, deathCauses,
    national, table: won, win: won, waveReach: maxWave, rank,
    fishAgg: agg, fishDays,
    fishCalls: W.fishCalls,
    resolveEvents: W.resolveEvents,
    dailySnaps: W.dailySnaps,
    saySamples: W.saySamples,
    ms,
  };
  return { seed, perSeed };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    const name = NEUTRAL ? `fishfallback-b-neutral-${ARM}-${SIDE}-dg1-${POLICY_ID}-s${s}.json` : `fishfallback-b-${ARM}-${SIDE}-dg1-${POLICY_ID}-s${s}.json`;
    writeRobust(path.join(PERSEED_DIR, name), JSON.stringify(perSeed));
    const a = perSeed.fishAgg;
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${perSeed.endReason} fishCalls=${a.fishCalls} ok=${a.fishOk} refused=${a.fishRefused} null=${a.fishNull} snapFishDays=${a.snapFishDays} holders=${JSON.stringify(a.holdersByClass)} staleDays=${a.staleDays.length} gapDays=${a.gapDays.length} won=${perSeed.win} (${perSeed.ms}ms)`);
  }
  try { fs.mkdirSync(path.dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  writeRobust(OUT, JSON.stringify({ meta: { arm: ARM, head: HEAD, competentDigest: COMPETENT_DIGEST, cell: SIDE + '-dg1', policy: POLICY_ID, days: DAYS, seeds: SEEDS, neutral: NEUTRAL, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: PD_WANT, DEPOSITGATE: '1' } }, rows }));
  console.log('wrote ' + OUT + ' (' + rows.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
