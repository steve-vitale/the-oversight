#!/usr/bin/env node
// bearerorder-driver-20261102.js — bearer-succession ordering instrument
// for sim-bearerorder-a (Loop A 20261102, axis scale-onramp).
// DIAGNOSIS ONLY: driver-side reads + method wrappers that snapshot state
// BEFORE the engine chooses a successor and record the outcome AFTER.
// Zero src/js changes, zero policy-decision changes: the policy stack is
// the closedecay closecommit stack verbatim (titanroute + musterclose +
// mustergap commit-own), so the known 97330/97338 chains reproduce under
// identical play.
// One process per seed; never two harnesses in one process. Prints one
// JSON summary line per seed to stdout and writes one per-seed JSON file
// into evidence/2026-11-02/perseed-bearerorder-a/.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97330 RUN=r1 node scripts/bearerorder-driver-20261102.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const MC = require(path.join(REPO, 'scripts', 'policies', 'musterclose'));
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`BEARERORDER STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'r1';
if (!SEEDS.length) { console.error('BEARERORDER STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { /* anchor stays unknown */ }

function basePolicy() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
}
function policyFor() {
  const b = basePolicy();
  const rt = TR.withTitanRoute(b, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  return MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

function musterOf(Game) {
  try { if (Game.titanMusterState) { const m = Game.titanMusterState('herald'); if (m) return m; } } catch (e) {}
  try { return ((Game.state || {}).titans || {}).musters ? Game.state.titans.musters.herald : null; } catch (e) { return null; }
}
function validHavenCount(Game, muster, bearerId) {
  if (!muster) return 0;
  const roster = ((Game.state || {}).village || {}).roster || [];
  const seen = {};
  return (muster.haven || []).filter(function (h) {
    const vid = h && (h.vid || h);
    if (!vid || vid === bearerId || seen[vid] || roster.indexOf(vid) < 0) return false;
    seen[vid] = true; return true;
  }).length;
}
function livingAlliesCount(Game, muster) {
  if (!muster) return 0;
  const seen = {};
  let n = 0;
  (muster.allies || []).forEach(function (a) {
    if (!a || !a.vid) return;
    const key = a.villageId + ':' + a.vid;
    if (seen[key]) return;
    let person = null;
    try { const ov = Game._otherVillage ? Game._otherVillage(a.villageId) : null; person = ov && (ov.roster || []).find(function (r) { return r.id === a.vid; }); } catch (e) {}
    if ((a.hp === undefined || a.hp > 0) && (!person || (person.alive && (person.health === undefined || person.health > 0)))) { seen[key] = true; n++; }
  });
  return n;
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const events = [];
  const mantleOutside = [];
  const sayLog = [];
  const dailySnap = [];
  const errors = [];
  let inPlayerDeath = false;
  let capturedCtx = null;
  const npcCalls = [];
  let npcCallMark = 0;

  // Say capture (narration only; never alters it).
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && /mantle passes|wake up somebody else|picks up the|Codex turns a page|Haven commits its own|march with the muster|walks in|is dead —/.test(arg)) sayLog.push({ day: gday(Game), line: String(arg).slice(0, 500) });
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  // mantleBecome wrapper: counts passes made OUTSIDE playerDeath (nomad
  // road path), so a road pass cannot be mistaken for a village pass.
  try {
    const origMantle = Game.mantleBecome;
    if (typeof origMantle === 'function' && !origMantle.__bearerorderWrapped) {
      const wrapped = function (oldId, newId) {
        if (!inPlayerDeath) mantleOutside.push({ day: gday(Game), oldId: oldId || null, newId: newId || null });
        return origMantle.apply(this, arguments);
      };
      wrapped.__bearerorderWrapped = true;
      Game.mantleBecome = wrapped;
    }
  } catch (e) { errors.push('mantle-wrap: ' + String(e.message).slice(0, 80)); }

  // FINE INSTRUMENT (diagnosis of sort-time inputs): log npcIds() and
  // removeVillager() calls made WHILE a playerDeath is in flight, with the
  // trust map at that moment. The ledger sort reads npcIds() + trust AFTER
  // removeVillager(old bearer); this shows whether sort-time inputs differ
  // from the wrapper-entry snapshot, and which call moved them.
  try {
    const origNpc = Game.npcIds;
    if (typeof origNpc === 'function' && !origNpc.__bearerorderWrapped) {
      const w = function () {
        const r = origNpc.apply(this, arguments);
        if (inPlayerDeath) {
          try { npcCalls.push({ n: npcCalls.length, roster: (r || []).slice(), trust: Object.assign({}, ((Game.state || {}).village || {}).trust || {}) }); } catch (e) {}
        }
        return r;
      };
      w.__bearerorderWrapped = true;
      Game.npcIds = w;
    }
  } catch (e) { errors.push('npcIds-wrap: ' + String(e.message).slice(0, 80)); }
  try {
    const origRem = Game.removeVillager;
    if (typeof origRem === 'function' && !origRem.__bearerorderWrapped) {
      const w = function (vid, how) {
        const before = inPlayerDeath ? Object.assign({}, ((Game.state || {}).village || {}).trust || {}) : null;
        const r = origRem.apply(this, arguments);
        if (inPlayerDeath && before) {
          try {
            const after = Object.assign({}, ((Game.state || {}).village || {}).trust || {});
            const moved = {};
            const keys = new Set(Object.keys(before).concat(Object.keys(after)));
            keys.forEach(function (k) { if (before[k] !== after[k]) moved[k] = [before[k] == null ? null : before[k], after[k] == null ? null : after[k]]; });
            npcCalls.push({ n: npcCalls.length, removeVillager: { vid: vid, how: how }, trustMoved: moved });
          } catch (e) {}
        }
        return r;
      };
      w.__bearerorderWrapped = true;
      Game.removeVillager = w;
    }
  } catch (e) { errors.push('remove-wrap: ' + String(e.message).slice(0, 80)); }

  // FINE INSTRUMENT 2: log bumpTrust calls during a playerDeath, with a
  // short stack, so the trust mover between wrapper entry and the ledger
  // sort is named, not guessed.
  try {
    const origBump = Game.bumpTrust;
    if (typeof origBump === 'function' && !origBump.__bearerorderWrapped) {
      const w = function (vid, n, reason) {
        if (inPlayerDeath) {
          try {
            const st = (new Error().stack || '').split('\n').slice(1, 5).map(function (l) { return l.trim().slice(0, 120); });
            npcCalls.push({ n: npcCalls.length, bumpTrust: { vid: vid, delta: n, reason: reason || null }, stack: st });
          } catch (e) {}
        }
        return origBump.apply(this, arguments);
      };
      w.__bearerorderWrapped = true;
      Game.bumpTrust = w;
    }
  } catch (e) { errors.push('bump-wrap: ' + String(e.message).slice(0, 80)); }

  // playerDeath wrapper: snapshot candidates BEFORE, outcome AFTER.
  try {
    const origPD = Game.playerDeath;
    if (typeof origPD === 'function' && !origPD.__bearerorderWrapped) {
      const wrapped = function (cause) {
        const day = gday(Game);
        const oldId = Game.villagerId;
        const npcMarkStart = npcCalls.length;
        let pre = null;
        try {
          const v = Game.state.village || {};
          const trust = Object.assign({}, v.trust || {});
          const roster = (v.roster || []).slice();
          const rosterIndex = {};
          roster.forEach(function (id, i) { if (!(id in rosterIndex)) rosterIndex[id] = i; });
          const muster = musterOf(Game);
          const havenVids = (muster ? (muster.haven || []).map(function (h) { return h && (h.vid || h); }).filter(Boolean) : []);
          const havenSet = {};
          havenVids.forEach(function (id) { havenSet[id] = true; });
          const committedMap = v.titanCommitted || {};
          let withYou = [];
          try { withYou = Game.travelingWith ? Game.travelingWith() : []; } catch (e) {}
          const withYouSet = {};
          withYou.forEach(function (id) { withYouSet[id] = true; });
          const awaySet = {};
          try { Object.keys(v.away || {}).forEach(function (k) { awaySet[k] = true; }); } catch (e) {}
          const candIds = safe(function () { return Game.npcIds(); }, []);
          const cands = candIds.map(function (id) {
            return {
              vid: id,
              name: safe(function () { return Game.displayName ? Game.displayName(id) : null; }, null),
              trust: trust[id] || 0,
              standing: safe(function () { return Game.linkStanding ? Game.linkStanding(id) : null; }, null),
              agency: safe(function () { return Game.agencyScore ? Game.agencyScore(id) : null; }, null),
              rosterIndex: rosterIndex[id] == null ? null : rosterIndex[id],
              committed: !!havenSet[id],
              committedMap: committedMap[id] || null,
              isMember: safe(function () { return Game.isMember ? !!Game.isMember(id) : null; }, null),
              isEngaged: safe(function () { return Game.isEngaged ? !!Game.isEngaged(id) : null; }, null),
              travelingWith: !!withYouSet[id],
              away: !!awaySet[id] || safe(function () { return Game._isAwayVid ? !!Game._isAwayVid(id) : false; }, false),
            };
          });
          const trustSorted = cands.slice().sort(function (a, b) { return (b.trust || 0) - (a.trust || 0); });
          const standingSorted = cands.slice().sort(function (a, b) { return (b.standing || 0) - (a.standing || 0); });
          pre = {
            day: day, oldBearer: oldId,
            oldName: safe(function () { return Game.displayName ? Game.displayName(oldId) : null; }, null),
            cause: cause || null,
            rosterOrder: cands,
            trustSorted: trustSorted.map(function (c) { return c.vid; }),
            standingSorted: standingSorted.map(function (c) { return c.vid; }),
            committedHavenOrder: havenVids.slice(),
            gateBefore: muster ? {
              livingAllies: livingAlliesCount(Game, muster),
              validHaven: validHavenCount(Game, muster, oldId),
              ready: safe(function () { return Game.titanMusterReady ? !!Game.titanMusterReady('herald') : null; }, null),
            } : null,
          };
        } catch (e) { errors.push('pre-snap: ' + String(e.message).slice(0, 120)); }
        // DIAGNOSTIC ONLY (BO_TRUSTPROXY=1): trap direct writes to the
        // village trust map during this death, with stacks. bumpTrust is
        // already wrapped and silent here, so the mover writes directly.
        let trustProxyInstalled = false;
        if (process.env.BO_TRUSTPROXY === '1') {
          try {
            const vv = Game.state.village || {};
            const target = vv.trust || {};
            const handler = {
              set: function (t, k, val) {
                try {
                  const st = (new Error().stack || '').split('\n').slice(1, 6).map(function (l) { return l.trim().slice(0, 160); });
                  npcCalls.push({ n: npcCalls.length, trustSet: { key: String(k), old: t[k] == null ? null : t[k], val: val }, stack: st });
                } catch (e) {}
                t[k] = val;
                return true;
              },
            };
            vv.trust = new Proxy(target, handler);
            trustProxyInstalled = true;
          } catch (e) { errors.push('trust-proxy: ' + String(e.message).slice(0, 80)); }
        }
        inPlayerDeath = true;
        let result, thrown = null;
        try { result = origPD.apply(this, arguments); }
        catch (e) { thrown = e; }
        inPlayerDeath = false;
        try {
          const newId = Game.villagerId;
          const trustAfter = Object.assign({}, ((Game.state || {}).village || {}).trust || {});
          const muster = musterOf(Game);
          const ev = {
            pre: pre,
            chosen: newId || null,
            chosenName: newId ? safe(function () { return Game.displayName ? Game.displayName(newId) : null; }, null) : null,
            villageLost: !newId || newId === oldId ? safe(function () { return !!Game.villageLost || !!Game.over; }, false) : false,
            gateAfter: muster ? {
              livingAllies: livingAlliesCount(Game, muster),
              validHaven: validHavenCount(Game, muster, newId),
              ready: safe(function () { return Game.titanMusterReady ? !!Game.titanMusterReady('herald') : null; }, null),
            } : null,
            error: thrown ? String(thrown.message).slice(0, 120) : null,
          };
          ev.npcCallsDuring = npcCalls.slice(npcMarkStart);
          ev.trustSetCount = npcCalls.slice(npcMarkStart).filter(function (c) { return !!c.trustSet; }).length;
          if (pre) {
            const rankIn = function (list, id) { const i = list.indexOf(id); return i < 0 ? null : i + 1; };
            const chosenCand = pre.rosterOrder.find(function (c) { return c.vid === newId; });
            ev.chosenWasCommitted = chosenCand ? !!chosenCand.committed : null;
            ev.chosenTrustRank = rankIn(pre.trustSorted, newId);
            ev.chosenStandingRank = rankIn(pre.standingSorted, newId);
            ev.chosenRosterRank = chosenCand ? (chosenCand.rosterIndex == null ? null : chosenCand.rosterIndex + 1) : null;
            const committedInTrustOrder = pre.trustSorted.filter(function (id) {
              const c = pre.rosterOrder.find(function (x) { return x.vid === id; });
              return c && c.committed;
            });
            ev.committedTrustOrder = committedInTrustOrder;
            ev.chosenCommittedRank = (ev.chosenWasCommitted) ? rankIn(committedInTrustOrder, newId) : null;
            ev.candidateCount = pre.rosterOrder.length;
            ev.committedCandidateCount = pre.rosterOrder.filter(function (c) { return c.committed; }).length;
            ev.trustWinnerIsCommitted = pre.trustSorted.length ? !!(pre.rosterOrder.find(function (c) { return c.vid === pre.trustSorted[0]; }) || {}).committed : null;
            ev.standingWinnerIsCommitted = pre.standingSorted.length ? !!(pre.rosterOrder.find(function (c) { return c.vid === pre.standingSorted[0]; }) || {}).committed : null;
            ev.trustWinner = pre.trustSorted[0] || null;
            ev.trustAfter = {};
            pre.rosterOrder.forEach(function (c) { ev.trustAfter[c.vid] = trustAfter[c.vid] == null ? null : trustAfter[c.vid]; });
            const afterSorted = pre.rosterOrder.slice().sort(function (a, b) { return (trustAfter[b.vid] || 0) - (trustAfter[a.vid] || 0); }).map(function (c) { return c.vid; });
            ev.trustAfterSorted = afterSorted;
            ev.chosenTrustAfterRank = rankIn(afterSorted, newId);
            ev.trustAfterWinner = afterSorted[0] || null;
            ev.standingWinner = pre.standingSorted[0] || null;
          }
          events.push(ev);
        } catch (e) { errors.push('post-snap: ' + String(e.message).slice(0, 120)); }
        if (thrown) throw thrown;
        return result;
      };
      wrapped.__bearerorderWrapped = true;
      Game.playerDeath = wrapped;
    }
  } catch (e) { errors.push('playerDeath-wrap: ' + String(e.message).slice(0, 120)); }

  function dailySnapFn() {
    try {
      const muster = musterOf(Game);
      const v = Game.state.village || {};
      dailySnap.push({
        day: gday(Game), bearer: Game.villagerId || null,
        roster: ((Game.state || {}).village || {}).roster ? ((Game.state || {}).village || {}).roster.slice() : [],
        committedHavenOrder: muster ? (muster.haven || []).map(function (h) { return h && (h.vid || h); }).filter(Boolean) : [],
        committedMap: Object.assign({}, v.titanCommitted || {}),
        gate: muster ? {
          livingAllies: livingAlliesCount(Game, muster),
          validHaven: validHavenCount(Game, muster, Game.villagerId),
          ready: safe(function () { return Game.titanMusterReady ? !!Game.titanMusterReady('herald') : null; }, null),
        } : null,
      });
    } catch (e) { errors.push('daily-snap: ' + String(e.message).slice(0, 80)); }
  }

  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally { dailySnapFn(); }
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  const st = Game.state || {};
  const titanCtx = capturedCtx ? (capturedCtx.titan || null) : null;
  const callDay = (titanCtx && titanCtx.called && typeof titanCtx.called === 'object') ? titanCtx.called.day : null;
  const MANTLE_RE = /mantle passes|wake up somebody else|picks up the (journal|Codex)|Codex turns a page|Haven commits its own|steps? forward/;
  const eventsOut = events.map(function (ev) {
    const day = ev.pre ? ev.pre.day : null;
    return Object.assign({}, ev, {
      transcript: sayLog.filter(function (s) { return s.day === day && MANTLE_RE.test(s.line); }),
    });
  });
  const out = { seed, arm: 'closecommit', run: RUN, anchorCommit: ANCHOR,
    callDay: callDay, gameDays: (st.scholar && st.scholar.day) || 0,
    days: result.days, endReason: result.endReason,
    events: eventsOut, eventCount: events.length,
    mantleOutsidePlayerDeath: mantleOutside,
    dailySnap: dailySnap,
    commitLines: sayLog.filter(function (s) { return /Haven commits its own|march with the muster/.test(s.line); }),
    errors: errors };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-bearerorder-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `bo-closecommit-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const summ = { seed: rec.seed, run: rec.run, callDay: rec.callDay,
      eventCount: rec.eventCount,
      events: rec.events.map(function (e) {
        return { day: e.pre ? e.pre.day : null, old: e.pre ? e.pre.oldName : null,
          chosen: e.chosenName, chosenWasCommitted: e.chosenWasCommitted,
          trustRank: e.chosenTrustRank, standingRank: e.chosenStandingRank,
          rosterRank: e.chosenRosterRank, candN: e.candidateCount,
          committedN: e.committedCandidateCount,
          gateBefore: e.pre ? e.pre.gateBefore : null, gateAfter: e.gateAfter };
      }),
      mantleOutside: rec.mantleOutsidePlayerDeath.length,
      gameDays: rec.gameDays, endReason: rec.endReason, file: path.relative(REPO, file) };
    console.log(JSON.stringify(summ));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
