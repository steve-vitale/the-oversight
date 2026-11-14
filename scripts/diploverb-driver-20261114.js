// diploverb-driver-20261114.js — DIAG arm sim-diplo-verb-b
// (run fleshout-loop-b-20261114T1130Z). Finding #2321 follow-up: competent's
// diplomacy standing is 0 on 16/16 runs while capable reaches median 102
// at the win. Question: WHICH leadfeast verb seasons a link — tend? feast?
// devotion channel? — and what does competent do differently?
//
// INSTRUMENT-ONLY: zero src/js changes. Driver-side recorder, reusing the
// capablewinpath-driver-20261114.js pattern (policy wrapper snapshot after
// each daily(), deduped by game day; Game.say capture; log-on-change
// wrappers for the gated reads). NEW for this arm:
//   - Daily LINK ROLL: Game.hierarchyState() per link (id, other, kind,
//     primary, subordinate, status, trust, formed day, age, conquered,
//     arrears, tendedWeek, pendingDemand, pendingRenegotiation, seasoned
//     via Game._linkSeasoned, regional+ via Game._linkRegionalPlus),
//     plus Game.polityOf('haven'), Game._havenPolity() shape, scaleRank,
//     networkLiveDay, state.answermailDrive totals (engine tends, blocked
//     tends, accord answers), pendingCounter presence, pantry kcal.
//   - VERB WRAPPERS: every link/trust verb logs call + before/after trust
//     + result + caller tag (policy-daily vs engine-daily, via an in-daily
//     flag on the policy wrapper): tendLink, payTribute, proposeLink,
//     answerCounter, answerAccord, answerNationalChoice, answerGlobalChoice,
//     answerRenegotiation, answerDemand, proposeCovenant, proposeTrade,
//     bidForPrimacy, raidVillage, hostFeast, breakLink, _formLink,
//     _formPeerLink. Formations carry `via` = the outermost verb in
//     progress (proposeLink / answerCounter / ladder-reward / engine-direct).
// Daily snapshot reads are PURE reads only: villageStanding() (raw
// war/diplomacy/plenty), deedGateReady(), tableSeat(), progState(),
// deedState(), waveCombatReadiness(4/5), state.waveKills, scholar
// abilities, roster. villageStandingTotal() is read ONCE at end-of-run
// (rageprecheck precedent — it fires release/hold beats, so a recorder
// call could shift a beat; never call it daily). Per-seed JSON to
// evidence/2026-11-14/perseed-diploverb-b/. Policies: competent verbatim
// vs capable, identical seeds. Env: defaults (COUNTER_ANSWER unset,
// COMPETENT_FLEE_REPAIR unset), matching the capablewinpath reproduction.
// Usage:
//   SEEDS=98801,98802 POLICY=competent,capable DAYS=150 RUN=diploverb-b \
//     OUTDIR=perseed-diploverb-b node scripts/diploverb-driver-20261114.js
// As a module: require('./diploverb-driver-20261114').oneRun(seed, policyName)
// returns the per-seed record (used by test-diploverb-b.js §2).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { capable, capableSummary } = require(path.join(REPO, 'scripts', 'policies', 'capable'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const POLICIES = (process.env.POLICY ? process.env.POLICY.split(',').map(function (s) { return s.trim(); }) : ['competent', 'capable']).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'diploverb-b';
const OUTDIR = process.env.OUTDIR || 'perseed-diploverb-b';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
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
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}

// One daily snapshot: pure reads only (see header). Returns null when the
// day is not readable (counts as an instrument error upstream).
// Link roll fields per link: id, o=other village, k=kind, p=primary,
// sub=subordinate, st=status, t=trust, f=formed day, age, cq=conquered,
// ar=arrears, tw=tendedWeek, pd=pendingDemand kind, pr=pendingRenegotiation,
// se=seasoned, rp=regional+.
function snapshot(Game, errors) {
  try {
    const st = Game.state || {};
    const s = st.scholar || {};
    const day = s.day || 0;
    const pg = safe(function () { return Game.progState() || {}; }, {});
    const d = safe(function () { return Game.deedState() || {}; }, {});
    const faced = d.wavesFaced || {};
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0;
    for (const mid of Object.keys(faced)) {
      const w = faced[mid] | 0;
      if (w === 1) w1++; else if (w === 2) w2++; else if (w === 3) w3++;
      else if (w === 4) w4++; else if (w === 5) w5++;
    }
    const standing = safe(function () { return Game.villageStanding() || {}; }, {});
    const seat = safe(function () { return Game.tableSeat() || {}; }, {});
    const gate = safe(function () { return Game.deedGateReady() || {}; }, {});
    const rd4 = safe(function () { return Game.waveCombatReadiness(4) || {}; }, {});
    const rd5 = safe(function () { return Game.waveCombatReadiness(5) || {}; }, {});
    // --- link roll (LIVE village state, never a roster) ---
    const links = [];
    let linkErr = null;
    try {
      const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
      for (const l of hs) {
        if (!l) continue;
        const other = safe(function () { return Game._linkOther ? Game._linkOther(l, 'haven') : (l.primary === 'haven' ? l.subordinate : l.primary); }, (l.primary === 'haven' ? l.subordinate : l.primary));
        const se = safe(function () { return Game._linkSeasoned ? !!Game._linkSeasoned(l, !!l.conquered) : false; }, false);
        const rp = safe(function () { return Game._linkRegionalPlus ? !!Game._linkRegionalPlus(l) : false; }, false);
        links.push({
          id: l.id || null, o: other || null, k: l.kind || 'link',
          p: l.primary || null, sub: l.subordinate || null,
          st: l.status || null, t: l.trust | 0, f: l.day | 0,
          age: day - (l.day | 0), cq: l.conquered ? 1 : 0,
          ar: l.arrears | 0, tw: (l.tendedWeek === undefined ? null : l.tendedWeek | 0),
          pd: (l.pendingDemand && l.pendingDemand.kind) || null,
          pr: l.pendingRenegotiation ? 1 : 0,
          se: se ? 1 : 0, rp: rp ? 1 : 0,
        });
      }
    } catch (e) { linkErr = String(e.message).slice(0, 80); }
    if (linkErr) errors.push('linkroll: ' + linkErr);
    const pol = safe(function () { return Game.polityOf ? Game.polityOf('haven') : null; }, null);
    const hp = safe(function () { return Game._havenPolity ? Game._havenPolity() : null; }, null);
    const ds = (st.answermailDrive || null);
    return {
      d: day,
      arc: pg.arc | 0,
      scale: safe(function () { return Game.scaleRank() || 'village'; }, 'village'),
      netDay: st.networkLiveDay | 0,
      stRaw: standing.total | 0, war: standing.war | 0, dip: standing.diplomacy | 0,
      plenty: standing.plenty | 0, warPts: standing.warPts | 0, links: standing.links | 0,
      feasts: standing.feasts | 0,
      ladCounted: (seat.detail && seat.detail.ladderCounted) | 0,
      ladPeak: (seat.detail && seat.detail.ladderPeakStage) | 0,
      w1: w1, w2: w2, w3: w3, w4: w4, w5: w5,
      cont: (d.contestsSurvived | 0) || 0,
      cris: Object.keys(pg.crises || {}).length,
      stage: (gate.stage | 0) || (safe(function () { return Game.integrationStage() || 0; }, 0)),
      sent: pg.sentimentTaught ? 1 : 0,
      surge: (s.prog && s.prog.feastSurgeUsed) ? 1 : 0,
      seat: seat.seat || 'none',
      gateOk: !!gate.ok,
      tableWaiting: !!pg.tableWaiting, tableAnnounced: !!pg.tableAnnounced,
      tableDone: !!pg.tableDone,
      wk: Object.assign({}, st.waveKills || {}),
      vet4: rd4.veterans | 0, vet5: rd5.veterans | 0,
      rd4ready: !!rd4.ready, rd5ready: !!rd5.ready,
      rd4short: (rd4.short || []).slice(), rd5short: (rd5.short || []).slice(),
      pop: ((st.village || {}).roster || []).length,
      abilN: ((s.abilities || []).length),
      pantry: pantryKcal(Game),
      linksRoll: links,
      nActive: links.filter(function (l) { return l.st === 'active'; }).length,
      nSeasoned: links.filter(function (l) { return l.st === 'active' && l.se; }).length,
      nCounted: links.filter(function (l) { return l.st === 'active' && l.se && l.rp; }).length,
      polity: pol ? { shape: pol.shape || null, size: pol.size | 0, led: !!pol.led } : null,
      havenPolity: hp ? { shape: hp.shape || null, size: hp.size | 0, led: !!hp.led } : null,
      pendingCounter: st.pendingCounter ? { target: st.pendingCounter.targetId || null, day: st.pendingCounter.day | 0 } : null,
      pendingAccord: st.pendingAccord ? { link: st.pendingAccord.linkId || null } : null,
      drive: ds ? {
        tends: ds.tends | 0, tendsBlocked: ds.tendsBlockedPantry | 0,
        accordAnswers: ds.accordAnswers | 0,
        renegotiationAnswers: ds.renegotiationAnswers | 0,
        demandAnswers: ds.demandAnswers | 0, errors: ds.errors | 0,
      } : null,
    };
  } catch (e) {
    errors.push('snapshot: ' + String(e.message).slice(0, 80));
    return null;
  }
}

const LINK_LINE_RE = /tend|season|polity|realm|trust|tribute|feast|link|bond|accord|court|drift|bow|table|seat|lesser/i;

async function oneRun(seed, policyName) {
  const policy = policyName === 'capable' ? capable : competent;
  if (policyName !== 'competent' && policyName !== 'capable') throw new Error('Unknown policy ' + policyName);
  const { Game } = await loadGame({ seed: seed, mode: 'diploverb-' + policyName, fullTelemetry: false });
  const series = [];
  const events = [];
  const verbEvents = [];
  const linkLines = [];
  const seatTakes = [];
  const tableChoices = [];
  const errors = [];
  let lastDay = -1;
  let lastUnw = null;
  let lastGated = null;
  let inDaily = false;      // true while the policy's daily() runs (policy-called verbs)
  let currentVerb = null;   // outermost verb in progress (formation attribution)

  function snap(tag) {
    const sn = snapshot(Game, errors);
    if (!sn) return;
    if (sn.d === lastDay) return; // one snapshot per game day
    lastDay = sn.d;
    series.push(sn);
  }

  function linkTrust(id) {
    try {
      const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
      for (const l of hs) if (l && l.id === id) return l.trust | 0;
    } catch (e) {}
    return null;
  }
  function linkOther(id) {
    try {
      const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
      for (const l of hs) if (l && l.id === id) {
        return Game._linkOther ? Game._linkOther(l, 'haven') : (l.primary === 'haven' ? l.subordinate : l.primary);
      }
    } catch (e) {}
    return null;
  }

  // Wrap engine reads that fire on the game's own calls (log-on-change).
  function wrapLogChange(name, key) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { errors.push(name + '-wrap: not a function'); return; }
      Game[name] = function () {
        const ret = orig.apply(this, arguments);
        try {
          if (key === 'unw') {
            if (ret !== lastUnw) { lastUnw = ret; events.push({ day: gday(Game), kind: 'unlockedWave', wave: ret }); }
          } else if (key === 'gated') {
            if (ret !== lastGated) { lastGated = ret; events.push({ day: gday(Game), kind: 'standingGated', total: ret }); }
          }
        } catch (e) { errors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  wrapLogChange('unlockedWave', 'unw');
  wrapLogChange('villageStandingTotal', 'gated');

  // Generic verb wrapper: logs the call, the before/after trust of the
  // named link (when the verb takes a link id first), and a short result.
  // `opts` — { linkArg: 0 } (which arg holds the link id), describe(ret)
  // returns a short result string.
  function wrapVerb(name, opts) {
    opts = opts || {};
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { errors.push(name + '-wrap: not a function'); return; }
      Game[name] = function () {
        const args = Array.prototype.slice.call(arguments);
        let linkId = (opts.linkArg !== undefined && args[opts.linkArg] !== undefined) ? args[opts.linkArg] : null;
        // answerAccord takes no link id: the pending accord names its link.
        if (!linkId && opts.accordLink) {
          try { linkId = ((Game.state || {}).pendingAccord || {}).linkId || null; } catch (e) { linkId = null; }
        }
        const before = (typeof linkId === 'string') ? linkTrust(linkId) : null;
        const prevVerb = currentVerb;
        if (!prevVerb) currentVerb = name;
        let ret = null;
        let threw = null;
        try { ret = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        if (!prevVerb) currentVerb = null;
        try {
          const after = (typeof linkId === 'string') ? linkTrust(linkId) : null;
          let result = null;
          if (opts.describe) { try { result = opts.describe(ret, args); } catch (e) { result = 'describe-err'; } }
          else if (ret && typeof ret === 'object' && ret.id) result = 'formed:' + ret.id;
          else if (typeof ret === 'string') result = ret;
          else if (ret === null || ret === undefined) result = 'null';
          else if (typeof ret === 'number') result = 'n=' + ret;
          else if (typeof ret === 'boolean') result = ret ? 'true' : 'false';
          else result = String(ret).slice(0, 120);
          verbEvents.push({
            day: gday(Game), verb: name, caller: inDaily ? 'policy' : 'engine',
            linkId: (typeof linkId === 'string') ? linkId : null,
            other: (typeof linkId === 'string') ? linkOther(linkId) : null,
            args: args.map(function (a) { return (a && typeof a === 'object') ? JSON.stringify(a).slice(0, 120) : String(a).slice(0, 80); }),
            before: before, after: after,
            dTrust: (before !== null && after !== null) ? (after - before) : null,
            result: result, threw: threw ? String(threw.message).slice(0, 80) : null,
          });
        } catch (e) { errors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }

  wrapVerb('tendLink', { linkArg: 0 });
  wrapVerb('payTribute', { linkArg: 0 });
  wrapVerb('proposeLink', {
    describe: function (ret) {
      if (ret && typeof ret === 'object' && ret.id) return 'formed:' + ret.id;
      if (ret === 'counter') return 'counter';
      return 'declined-or-blocked';
    },
  });
  wrapVerb('answerCounter', {
    describe: function (ret) {
      if (ret && typeof ret === 'object' && ret.id) return 'formed:' + ret.id;
      if (ret === 'counter') return 'held';
      return 'refused-or-null';
    },
  });
  wrapVerb('answerAccord', { accordLink: true, describe: function (ret) { return ret === null ? 'no-pending-or-dead-link' : 'answered'; } });
  wrapVerb('answerNationalChoice');
  wrapVerb('answerGlobalChoice');
  wrapVerb('answerRenegotiation', { linkArg: 0 });
  wrapVerb('answerDemand', { linkArg: 0 });
  wrapVerb('proposeCovenant', {
    describe: function (ret) {
      if (ret && typeof ret === 'object' && ret.id) return 'formed:' + ret.id;
      if (ret === 'counter') return 'counter';
      return 'declined-or-blocked';
    },
  });
  wrapVerb('proposeTrade', {
    describe: function (ret) {
      if (ret && typeof ret === 'object' && ret.id) return 'formed:' + ret.id;
      if (ret === 'counter') return 'counter';
      return 'declined-or-blocked';
    },
  });
  wrapVerb('bidForPrimacy', { linkArg: 0 });
  wrapVerb('raidVillage');
  wrapVerb('hostFeast', {
    describe: function (ret) {
      try { return JSON.stringify(ret).slice(0, 160); } catch (e) { return String(ret).slice(0, 120); }
    },
  });
  wrapVerb('breakLink', {
    linkArg: 0,
    describe: function (ret, args) { return 'broke:' + String(args[1] || '?'); },
  });
  // Formations: log the forming verb's context. _formLink/_formPeerLink
  // are called BY proposeLink/answerCounter/ladder-reward, so `via` reads
  // the outermost wrapper in progress, else 'engine-direct'.
  function wrapForm(name) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { errors.push(name + '-wrap: not a function'); return; }
      Game[name] = function () {
        const args = Array.prototype.slice.call(arguments);
        let ret = null;
        let threw = null;
        try { ret = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          if (ret && ret.id) {
            verbEvents.push({
              day: gday(Game), verb: name, caller: inDaily ? 'policy' : 'engine',
              linkId: ret.id, other: linkOther(ret.id),
              args: args.map(function (a) { return (a && typeof a === 'object') ? JSON.stringify(a).slice(0, 120) : String(a).slice(0, 80); }),
              before: null, after: ret.trust | 0, dTrust: null,
              result: 'formed via ' + (currentVerb || 'engine-direct'),
              threw: threw ? String(threw.message).slice(0, 80) : null,
            });
          }
        } catch (e) { errors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  wrapForm('_formLink');
  wrapForm('_formPeerLink');

  try {
    const origSeat = Game.tableTakeSeat;
    if (typeof origSeat === 'function') {
      Game.tableTakeSeat = function () {
        let pv = null;
        try { pv = Game.tablePreview ? Game.tablePreview() : null; } catch (e) {}
        let ret = null;
        try { ret = origSeat.apply(this, arguments); } catch (e) { throw e; }
        try {
          seatTakes.push({ day: gday(Game), seat: (pv && pv.seat) || null, ready: !!(pv && pv.ready), ok: !!(ret && ret.ok), ret: ret ? String(JSON.stringify(ret)).slice(0, 200) : null });
          events.push({ day: gday(Game), kind: 'seatTaken', seat: (pv && pv.seat) || null, ok: !!(ret && ret.ok) });
        } catch (e) { errors.push('seat-take-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('tableTakeSeat-wrap: not a function');
  } catch (e) { errors.push('tableTakeSeat-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origChoice = Game.chooseTableOption;
    if (typeof origChoice === 'function') {
      Game.chooseTableOption = function (id) {
        let ret = null;
        try { ret = origChoice.apply(this, arguments); } catch (e) { throw e; }
        try { tableChoices.push({ day: gday(Game), id: String(id), ret: ret }); } catch (e) { errors.push('table-choice-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('chooseTableOption-wrap: not a function');
  } catch (e) { errors.push('chooseTableOption-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && LINK_LINE_RE.test(String(arg)) && linkLines.length < 150) {
          linkLines.push({ day: gday(Game), line: String(arg).slice(0, 400) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  // Policy wrapper: snapshot after each daily() call (one per game day).
  // Capture the harness ctx the policy closes over — runDays does not
  // return it, but the same object is passed to every policy hook, so the
  // end-of-run capableSummary / counter dump reads live policy counters.
  let capturedCtx = null;
  const recPolicy = Object.assign({}, policy, {
    daily: function (G, ctx) {
      capturedCtx = ctx;
      inDaily = true;
      let r;
      try { r = policy.daily ? policy.daily(G, ctx) : undefined; }
      catch (e) { inDaily = false; errors.push('policy.daily threw: ' + String(e.message).slice(0, 80)); throw e; }
      inDaily = false;
      try { snap('daily'); } catch (e) { errors.push('snap-after-daily: ' + String(e.message).slice(0, 80)); }
      return r;
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, recPolicy, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  });
  let capSummary = null, ctxCounters = null;
  try {
    if (policyName === 'capable' && capturedCtx) capSummary = capableSummary(capturedCtx);
  } catch (e) { errors.push('capSummary: ' + String(e.message).slice(0, 80)); }
  try {
    if (capturedCtx) {
      ctxCounters = {};
      for (const k of Object.keys(capturedCtx)) {
        if (k === 'notes' || k === 'policyId' || k[0] === '_') continue;
        const v = capturedCtx[k];
        if (typeof v === 'number') ctxCounters[k] = v;
        else if (v && typeof v === 'object' && !Array.isArray(v)) {
          const flat = {};
          for (const kk of Object.keys(v)) if (typeof v[kk] === 'number') flat[kk] = v[kk];
          if (Object.keys(flat).length) ctxCounters[k] = flat;
        }
      }
    }
  } catch (e) { errors.push('ctxCounters: ' + String(e.message).slice(0, 80)); }
  try { snap('final'); } catch (e) {}

  const st = Game.state || {};
  let scaleRank = null, standingGated = null, standingRaw = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { standingGated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { errors.push('standingGated: ' + String(e.message).slice(0, 80)); }
  try { standingRaw = Game.villageStanding ? (Game.villageStanding() || {}).total : null; } catch (e) {}
  let tableState = null, earnedPaths = null;
  try { tableState = Game.tableState ? Game.tableState() : null; } catch (e) {}
  try { earnedPaths = Game.tableEarnedPaths ? Game.tableEarnedPaths() : null; } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
  const villagerCombatDeaths = deaths.filter(function (d) { return !d.player; }).length;
  let driveEnd = null;
  try { driveEnd = st.answermailDrive ? JSON.parse(JSON.stringify(st.answermailDrive)) : null; } catch (e) {}

  return {
    seed: seed, policy: policyName, arm: 'diploverb-b', run: RUN,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, standing: standingGated,
    standingRaw: standingRaw,
    waveKills: Object.assign({}, st.waveKills || {}),
    series: series, events: events, verbEvents: verbEvents,
    linkLines: linkLines,
    seatTakes: seatTakes, tableChoices: tableChoices,
    tableState: tableState ? {
      path: tableState.path || null, branch: tableState.branch || null,
      phase: tableState.phase || null, final: tableState.final || null,
      seat: (tableState.seatTaker && tableState.seatTaker.name) || null,
      seatSelf: !!(tableState.seatTaker && tableState.seatTaker.self),
    } : null,
    earnedPaths: (earnedPaths || []).map(function (p) {
      return { id: p.id, name: p.name, earned: !!p.earned, strength: p.strength | 0 };
    }),
    deaths: deaths, villagerCombatDeaths: villagerCombatDeaths,
    capSummary: capSummary, ctxCounters: ctxCounters,
    driveEnd: driveEnd,
    instrumentErrors: errors,
    samples: result.samples || null,
  };
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('DIPLOVERB STOP: SEEDS required.'); process.exit(2); }
  if (!POLICIES.length) { console.error('DIPLOVERB STOP: POLICY required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-14', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const file = path.join(outDir, 'diploverb-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('DIPLOVERB STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const out = await oneRun(seed, pol);
    const file = path.join(outDir, 'diploverb-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      waveKills: out.waveKills, seriesDays: out.series.length,
      verbEvents: out.verbEvents.length, linkLines: out.linkLines.length,
      seatTakes: out.seatTakes.length, tableChoices: out.tableChoices.length,
      tableState: out.tableState, deaths: out.deaths.length,
      villagerCombatDeaths: out.villagerCombatDeaths, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
