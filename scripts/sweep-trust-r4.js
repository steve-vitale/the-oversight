#!/usr/bin/env node
// sweep-trust-lever.js — trust & social lever telemetry (long-run sim 2026-10-11).
// Measures the social systems over long horizons so the lever work starts
// from evidence, not vibes:
//
//   - trust distribution vs the player over time (mean/max, share at 40+ words
//     cap, 65+ follower-volunteer threshold, 90+ devoted), per 10-day sample
//   - gossip: rumors seeded per 100 days, mean hearers per rumor, mean age
//   - moots: petition moots conducted per 100 days + outcomes, petitions
//     turned away at the door, ignored-walk-away
//   - leadership: challenges raised, yielded vs stood-ground, taskLeads held
//   - betrayals: NPC betrayals initiated, betrayal combats started
//   - promises: made, kept, broken
//   - resolveConsequence trust-gain events by name (words-capped hits vs real
//     acts), talk rounds per 100 days
//
// Measurement only: no game balance changes. Policies: competent (survival
// baseline) + socialite (social-max policy). 200-day horizon.
//
// Usage:
//   SEEDS="1,2,...,12" POLICIES="competent,socialite" DAYS=200 \
//     OUT=sweep-out/trust-lever-before.json node scripts/sweep-trust-lever.js
// sweep-trust-r4.js — trust & social lever, round 4 (2026-10-11/12).
// Fork of sweep-trust-r2.js. The r4 question: leadership challenges fired
// 148-195/run in r2/r3 but NO policy ever answered them — the contender
// cascade (garden->fish->water->cook in month one) is the no-response
// equilibrium. New policy: contender-engager (answers challenges: coalition,
// yield-to-competence, stand-ground-on-weakness, pre-emptive rally, respects
// yielded domains). Measures: does the cascade still take the village?
// New telemetry: leadEngage counters (answered/yielded/stood/allies/rallies/
// respected), takeoversEst (end taskLeads minus policy yields), maxCascade
// (domains held by one contender at end), cascadeRuns (>=2 domains, same
// contender). Policies: competent vs contender-engager on IDENTICAL seeds.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { socialite } = require('./policies/socialite');
const { chatterbox } = require('./policies/chatterbox');
const { contenderEngager } = require('./policies/contender-engager');
const idle = require('./policies/idle');

const POLICIES = { competent, socialite, chatterbox, 'contender-engager': contenderEngager, mvc: idle.mvc, leader: idle.leader };

function parseList(env, def) {
  return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean);
}

function median(xs) {
  const s = (xs || []).slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// causeShares(deathLists, playerOnly): {cause: {n, share}} for person-kind
// deaths (villagers), or player deaths only.
function causeShares(deathLists, playerOnly) {
  const counts = {};
  let total = 0;
  for (const list of (deathLists || [])) {
    for (const d of (list || [])) {
      if (d.kind !== 'person' && d.kind !== 'villager') continue;
      if (playerOnly && !d.player) continue;
      if (!playerOnly && d.player) continue;
      const c = String(d.cause || '?');
      counts[c] = (counts[c] || 0) + 1;
      total++;
    }
  }
  const out = {};
  for (const c of Object.keys(counts).sort((a, b) => counts[b] - counts[a]))
    out[c] = { n: counts[c], share: total ? +(counts[c] / total).toFixed(3) : 0 };
  return out;
}

function wrap(Game, name, fn) {
  const o = Game[name];
  if (typeof o !== 'function') return false;
  Game[name] = function () { return fn.call(this, o, Array.prototype.slice.call(arguments)); };
  return true;
}

function instrument(Game, ctx) {
  const S = ctx.social = {
    gossipSeeded: 0, gossipActions: {}, gossipBorn: {}, gossipDeduped: 0,
    mootsConducted: 0, petitionsAccepted: 0, petitionsRejected: 0,
    petitionsTurnedAway: 0, petitionsWalked: 0,
    challengesRaised: 0, challengesYielded: 0, challengesStoodGround: 0,
    betrayalsStarted: 0, betrayalCombats: 0,
    promisesMade: 0, promisesKept: 0, promisesBroken: 0,
    trustGainEvents: {}, trustGainTotal: 0, trustLossTotal: 0,
    talkCapHits: 0, trustAtEnd: [],
    trustCurves: [], // [day, n, mean, max, n40, n65, n90]
  };
  wrap(Game, 'seedGossip', function (orig, a) {
    const act = String(a[0] || '?');
    const before = (Game.state.village.gossip || []).length;
    const r = orig.apply(this, a);
    try {
      const after = (Game.state.village.gossip || []).length;
      if (after > before) {
        S.gossipSeeded++;
        S.gossipActions[act] = (S.gossipActions[act] || 0) + 1;
        const g = Game.state.village.gossip[after - 1];
        const seedH = (a[2] || []).length;
        const key = act + '|' + ((g && g.partKey) || (act + ':' + Date.now()));
        S.gossipBorn[key] = { action: act, seedH, maxH: seedH, day: (Game.state.scholar || {}).day || 0 };
      } else {
        S.gossipDeduped = (S.gossipDeduped || 0) + 1;
      }
    } catch (e) {}
    return r;
  });
  wrap(Game, 'spreadGossip', function (orig, a) {
    const r = orig.apply(this, a);
    try {
      for (const g of ((Game.state || {}).village || {}).gossip || []) {
        const k = (g.action || '?') + '|' + g.partKey;
        const rec = S.gossipBorn[k];
        if (rec) rec.maxH = Math.max(rec.maxH, (g.heard || []).length);
      }
    } catch (e) {}
    return r;
  });
  wrap(Game, 'conductPetitionMoot', function (orig, a) {
    S.mootsConducted++;
    return orig.apply(this, a);
  });
  wrap(Game, 'answerPetition', function (orig, a) {
    const r = orig.apply(this, a);
    if (a[1] === 'accept') S.petitionsAccepted++; else S.petitionsRejected++;
    return r;
  });
  wrap(Game, '_vaTurnAway', function (orig, a) {
    if (a[1] === 'moot') S.petitionsWalked++; else S.petitionsTurnedAway++;
    return orig.apply(this, a);
  });
  wrap(Game, 'standGround', function (orig, a) {
    S.challengesStoodGround++;
    return orig.apply(this, a);
  });
  wrap(Game, 'yieldChallenge', function (orig, a) {
    S.challengesYielded++;
    return orig.apply(this, a);
  });
  wrap(Game, 'npcBetrays', function (orig, a) {
    S.betrayalsStarted++;
    return orig.apply(this, a);
  });
  wrap(Game, 'startBetrayalCombat', function (orig, a) {
    S.betrayalCombats++;
    return orig.apply(this, a);
  });
  // DEATHS (r2): full-history cause tracking via the registerDeath choke
  // point — the telemetry ring (300 events) drops early deaths in long runs.
  S.deaths = [];
  wrap(Game, 'registerDeath', function (orig, a) {
    const r = orig.apply(this, a);
    try {
      const opts = a[0] || {};
      if (opts.villagerId && r === null) return r; // double-death guard no-op
      S.deaths.push({
        kind: opts.kind || '?',
        who: opts.villagerId || opts.monsterId || opts.name || '?',
        cause: opts.cause || '?',
        day: (Game.state.scholar || {}).day || 0,
        player: opts.villagerId === Game.villagerId,
      });
    } catch (e) {}
    return r;
  });
  // Promises: makePromise lives in game.js (~line 4510). Find its real name.
  const promiseMadeName = ['makePromise', 'promise', 'makeVow'].find(n => typeof Game[n] === 'function');
  if (promiseMadeName) wrap(Game, promiseMadeName, function (orig, a) {
    const r = orig.apply(this, a);
    if (r) S.promisesMade++;
    return r;
  });
  wrap(Game, 'checkPromises', function (orig, a) {
    // checkPromises keeps/breaks; count kept vs broken by diffing.
    let before = null;
    try { before = Object.assign({}, ((Game.state || {}).village || {}).promises || {}); } catch (e) {}
    const r = orig.apply(this, a);
    try {
      const after = ((Game.state || {}).village || {}).promises || {};
      for (const vid of Object.keys(after)) {
        const b = before[vid], aft = after[vid];
        if (b && !b.kept && aft && aft.kept) S.promisesKept++;
        if (b && !b.broken && aft && aft.broken) S.promisesBroken++;
      }
    } catch (e) {}
    return r;
  });
  // Trust-gain events: TWO choke points.
  //  1. bumpTrust (deeds, conflicts, yields, teaching-callout) — fires
  //     tele('trust') itself, but we count here by reason: single math.
  //  2. resolveConsequence (conversation turns) — applied trust by name.
  wrap(Game, 'bumpTrust', function (orig, a) {
    const r = orig.apply(this, a);
    try {
      const amt = a[1] || 0, reason = String(a[2] || 'unnamed');
      const key = reason + (amt > 0 ? ':+' : ':-');
      S.trustGainEvents[key] = (S.trustGainEvents[key] || 0) + 1;
      if (amt > 0) S.trustGainTotal += amt; else S.trustLossTotal += amt;
    } catch (e) {}
    return r;
  });
  const rc = Game.resolveConsequence;
  if (typeof rc === 'function') {
    Game.resolveConsequence = function (vid, spec) {
      S.rcCalls = (S.rcCalls || 0) + 1;
      let cur0 = 10;
      try { cur0 = ((this.state.village || {}).trust || {})[vid] === undefined ? 10 : this.state.village.trust[vid]; } catch (e) {}
      let applied = null;
      try { applied = rc.call(this, vid, spec); } catch (e) { return { trust: 0 }; }
      try {
        const t = applied && applied.trust;
        if (t) {
          const nm = (spec && spec.name) || 'unnamed';
          const key = nm + (t > 0 ? ':+' : ':-');
          S.trustGainEvents[key] = (S.trustGainEvents[key] || 0) + 1;
          // talk-capped hit: positive talk gain that landed 0 because cur0 >= 40
          if (spec && spec.trust > 0 && spec.talk !== false && t === 0 && cur0 >= 40) S.talkCapHits++;
        }
      } catch (e) {}
      return applied;
    };
  }
  // Challenge raise: game.js ~14457 sets v.challenge. Wrap the caller by
  // watching villagerTurn phase? Simpler: sample in policy.daily.
  return S;
}

// Per-10-day social sample, recorded into ctx.social.trustCurves + gossip stats.
function socialSample(Game, ctx) {
  const S = ctx.social;
  try {
    const v = Game.state.village || {};
    const trust = v.trust || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    let n = 0, sum = 0, max = 0, n40 = 0, n65 = 0, n90 = 0;
    const vals = [];
    for (const id of roster) {
      const t = trust[id] === undefined ? 10 : trust[id];
      n++; sum += t; vals.push(t);
      if (t > max) max = t;
      if (t >= 40) n40++;
      if (t >= 65) n65++;
      if (t >= 90) n90++;
    }
    const day = (Game.state.scholar || {}).day || 0;
    const gossip = v.gossip || [];
    let heardSum = 0, heardMax = 0;
    for (const g of gossip) {
      const h = (g.heard || []).length;
      heardSum += h; if (h > heardMax) heardMax = h;
    }
    S.trustCurves.push({
      day, n,
      mean: n ? +(sum / n).toFixed(2) : 0, max,
      share40: n ? +(n40 / n).toFixed(3) : 0,
      share65: n ? +(n65 / n).toFixed(3) : 0,
      share90: n ? +(n90 / n).toFixed(3) : 0,
      gossipN: gossip.length,
      gossipMeanHeard: gossip.length ? +(heardSum / gossip.length).toFixed(2) : 0,
      gossipMaxHeard: heardMax,
    });
    if (day === 0) S.trustAtEnd = vals;
  } catch (e) {}
}

function endSnapshot(Game, ctx) {
  const out = {
    challengesRaised: 0, challengeActive: false,
    taskLeads: 0, taskLeadTasks: [],
    rosterN: 0, groupN: 0, alliesN: 0, grievancesN: 0,
    bondsN: 0, bondPairs: 0,
    leaders: 0, // npc with npcGoal 'lead'
    trustEnd: { n: 0, mean: 0, max: 0, share40: 0, share65: 0, share90: 0 },
    gossipEnd: { n: 0, meanHeard: 0, maxHeard: 0 },
    moodMods: 0,
  };
  try {
    const v = Game.state.village || {};
    const roster = v.roster || [];
    out.rosterN = roster.length;
    out.groupN = (v.groups || []).length;
    out.alliesN = Object.keys(v.allies || {}).length;
    out.grievancesN = ((v.betrayal || {}).grievances || []).length;
    const bonds = (v.betrayal || {}).bonds || {};
    out.bondsN = Object.keys(bonds).length;
    let pairs = 0;
    for (const k of Object.keys(bonds)) pairs += Object.keys(bonds[k] || {}).length;
    out.bondPairs = pairs;
    out.moodMods = (v.moodMods || []).length;
    out.challengeActive = !!(v.challenge && v.challenge.cid);
    const leads = v.taskLeads || {};
    out.taskLeadTasks = Object.keys(leads);
    out.taskLeads = out.taskLeadTasks.length;
    // r4: contender cascade — domains held per contender at end
    const leadsByCid = {};
    for (const [task, cid] of Object.entries(leads)) leadsByCid[cid] = (leadsByCid[cid] || 0) + 1;
    const cascadeDepths = Object.values(leadsByCid);
    out.leadByContender = leadsByCid;
    out.maxCascade = cascadeDepths.length ? Math.max.apply(null, cascadeDepths) : 0;
    // challenges raised: counted from curves via active flags sampled daily
    // (set in policy.daily wrapper below).
    out.challengesRaised = ctx.social.challengeDays ? ctx.social.challengeDays.size : 0;
    let leaders = 0;
    for (const id of roster) {
      if (id === Game.villagerId) continue;
      try { if (Game.npcGoal(id) === 'lead') leaders++; } catch (e) {}
    }
    out.leaders = leaders;
    // end trust distribution
    const trust = v.trust || {};
    let n = 0, sum = 0, max = 0, n40 = 0, n65 = 0, n90 = 0;
    for (const id of roster) {
      if (id === Game.villagerId) continue;
      const t = trust[id] === undefined ? 10 : trust[id];
      n++; sum += t; if (t > max) max = t;
      if (t >= 40) n40++; if (t >= 65) n65++; if (t >= 90) n90++;
    }
    out.trustEnd = {
      n, mean: n ? +(sum / n).toFixed(2) : 0, max,
      share40: n ? +(n40 / n).toFixed(3) : 0,
      share65: n ? +(n65 / n).toFixed(3) : 0,
      share90: n ? +(n90 / n).toFixed(3) : 0,
    };
    const gossip = v.gossip || [];
    let hs = 0, hm = 0;
    for (const g of gossip) { const h = (g.heard || []).length; hs += h; if (h > hm) hm = h; }
    out.gossipEnd = { n: gossip.length, meanHeard: gossip.length ? +(hs / gossip.length).toFixed(2) : 0, maxHeard: hm };
  } catch (e) {}
  return out;
}

(async () => {
  const seedList = parseList('SEEDS', Array.from({ length: 12 }, (_, i) => String(i + 1)).join(',')).map(Number);
  const policyIds = parseList('POLICIES', 'competent,socialite');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;

  const runs = [];
  let runN = 0;
  const total = seedList.length * policyIds.length;
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(1); }
    for (const seed of seedList) {
      runN++;
      const t0 = Date.now();
      const { Game, manifest } = await loadGame({ seed, mode: pid, fullTelemetry: false });
      await setupGame(Game);
      const ctx = { social: null };
      ctx.social = instrument(Game, ctx);
      ctx.social.challengeDays = new Set();
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, c2) => {
        try {
          const day = (G.state.scholar || {}).day || 0;
          if (day % 10 === 0) socialSample(G, ctx);
          try {
            const ch = ((G.state || {}).village || {}).challenge;
            if (ch && ch.cid) ctx.social.challengeDays.add(day);
          } catch (e) {}
          // r4: lift the policy's leadership-engagement counters into the
          // sweep ctx (c2 is runDays' ctx; the sweep rec is built from ours)
          try { if (c2 && c2.leadEngage) ctx.social._leadEngage = c2.leadEngage; } catch (e) {}
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, c2); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
      const end = endSnapshot(Game, ctx);
      const S = ctx.social;
      const rec = {
        policy: pid, seed,
        days: result.days, endReason: result.endReason, ms: result.ms,
        // rates per 100 days
        gossipPer100: +(S.gossipSeeded / result.days * 100).toFixed(2),
        mootsPer100: +(S.mootsConducted / result.days * 100).toFixed(2),
        mootsConducted: S.mootsConducted,
        petitionsAccepted: S.petitionsAccepted, petitionsRejected: S.petitionsRejected,
        petitionsTurnedAway: S.petitionsTurnedAway, petitionsWalked: S.petitionsWalked,
        challenges: { raised: end.challengesRaised, yielded: S.challengesYielded, stoodGround: S.challengesStoodGround, activeAtEnd: end.challengeActive },
        // r4: contender engagement (contender-engager policy counters) +
        // takeover estimate (end taskLeads minus policy yields; a yielded
        // lead who later died still counted — approximation, noted)
        leadEngage: ctx.social._leadEngage || null,
        takeoversEst: end.taskLeads - (((ctx.social._leadEngage || {}).challengesYielded) || 0),
        maxCascade: end.maxCascade, leadByContender: end.leadByContender,
        betrayalsStarted: S.betrayalsStarted, betrayalCombats: S.betrayalCombats,
        promises: { made: S.promisesMade, kept: S.promisesKept, broken: S.promisesBroken },
        trustGainTotal: +S.trustGainTotal.toFixed(1), trustLossTotal: +S.trustLossTotal.toFixed(1),
        talkCapHits: S.talkCapHits, rcCalls: S.rcCalls || 0,
        trustGainTop: Object.entries(S.trustGainEvents).sort((a, b) => b[1] - a[1]).slice(0, 8),
        trustEnd: end.trustEnd, gossipEnd: end.gossipEnd,
        gossipActions: Object.entries(S.gossipActions || {}).sort((a, b) => b[1] - a[1]).slice(0, 10),
        gossipDeduped: S.gossipDeduped || 0,
        gossipReach: (function () {
          const born = Object.values(S.gossipBorn || {});
          let reachSum = 0, spreadSum = 0, dead0 = 0, big4 = 0;
          for (const b of born) {
            reachSum += b.maxH; spreadSum += (b.maxH - b.seedH);
            if (b.maxH === 0) dead0++;
            if (b.maxH >= 4) big4++;
          }
          const nB = born.length || 1;
          return {
            rumors: born.length, meanMaxHeard: +(reachSum / nB).toFixed(2),
            meanSpread: +(spreadSum / nB).toFixed(2),
            deadOnArrival: dead0, reach4plus: big4,
          };
        })(),
        // per-action reach (r2): seeded count, mean seeded hearers, mean max
        // hearers, dead-on-arrival, reach-4+. Answers "did news travel?"
        gossipActionReach: (function () {
          const born = Object.values(S.gossipBorn || {});
          const byAct = {};
          for (const b of born) {
            const t = byAct[b.action] || (byAct[b.action] = { n: 0, reach: 0, spread: 0, dead0: 0, big4: 0, seedH: 0 });
            t.n++; t.reach += b.maxH; t.spread += (b.maxH - b.seedH); t.seedH += b.seedH;
            if (b.maxH === 0) t.dead0++;
            if (b.maxH >= 4) t.big4++;
          }
          const out = {};
          for (const a of Object.keys(byAct)) {
            const t = byAct[a];
            out[a] = {
              n: t.n, meanSeedH: +(t.seedH / t.n).toFixed(2),
              meanMaxHeard: +(t.reach / t.n).toFixed(2),
              meanSpread: +(t.spread / t.n).toFixed(2),
              dead0: t.dead0, reach4plus: t.big4,
            };
          }
          return out;
        })(),
        deaths: S.deaths,
        won: !!Game.won,
        maxWaveUnlocked: (function () { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
        rosterN: end.rosterN, groupN: end.groupN, alliesN: end.alliesN,
        grievancesN: end.grievancesN, bondsN: end.bondsN, bondPairs: end.bondPairs,
        leaders: end.leaders, taskLeads: end.taskLeads, taskLeadTasks: end.taskLeadTasks,
        moodMods: end.moodMods,
        trustCurves: S.trustCurves,
      };
      runs.push(rec);
      const el = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[${runN}/${total} ${el}s] GR-${pid}-s${seed}: rumors=${rec.gossipReach.rumors} dedup=${rec.gossipDeduped} meanMaxHeard=${rec.gossipReach.meanMaxHeard} meanSpread=${rec.gossipReach.meanSpread} dead0=${rec.gossipReach.deadOnArrival} reach4+=${rec.gossipReach.reach4plus} actions=${JSON.stringify(rec.gossipActions)}`);
      console.log(`   trust: mean=${end.trustEnd.mean} max=${end.trustEnd.max} n65=${Math.round(end.trustEnd.share65 * end.trustEnd.n)} gossip/100=${rec.gossipPer100} moots/100=${rec.mootsPer100} chal=${end.challengesRaised} betr=${S.betrayalsStarted}/${S.betrayalCombats} prom=${S.promisesMade}k${S.promisesKept}b${S.promisesBroken} trust+${S.trustGainTotal.toFixed(0)} rc=${S.rcCalls || 0}`);
      console.log(`   topTrust: ${JSON.stringify(Object.entries(S.trustGainEvents).sort((a, b) => b[1] - a[1]).slice(0, 6))}`);
    }
  }

  // ---- aggregate ----
  const agg = {};
  for (const pid of policyIds.concat(['ALL'])) {
    const pr = pid === 'ALL' ? runs : runs.filter(r => r.policy === pid);
    if (!pr.length) continue;
    const avg = k => +(pr.reduce((a, r) => a + (r[k] || 0), 0) / pr.length).toFixed(2);
    const tEnds = pr.map(r => r.trustEnd);
    agg[pid] = {
      n: pr.length,
      gossipPer100: avg('gossipPer100'),
      mootsPer100: avg('mootsPer100'),
      mootsConducted: pr.reduce((a, r) => a + r.mootsConducted, 0),
      petitionsAccepted: pr.reduce((a, r) => a + r.petitionsAccepted, 0),
      petitionsRejected: pr.reduce((a, r) => a + r.petitionsRejected, 0),
      petitionsTurnedAway: pr.reduce((a, r) => a + r.petitionsTurnedAway, 0),
      challengesRaised: pr.reduce((a, r) => a + r.challenges.raised, 0),
      challengesYielded: pr.reduce((a, r) => a + r.challenges.yielded, 0),
      challengesStoodGround: pr.reduce((a, r) => a + r.challenges.stoodGround, 0),
      // r4: contender engagement totals + cascade reachability
      leadAnswered: pr.reduce((a, r) => a + (((r.leadEngage || {}).challengesAnswered) || 0), 0),
      leadYielded: pr.reduce((a, r) => a + (((r.leadEngage || {}).challengesYielded) || 0), 0),
      leadStood: pr.reduce((a, r) => a + (((r.leadEngage || {}).challengesStoodGround) || 0), 0),
      leadAllies: pr.reduce((a, r) => a + (((r.leadEngage || {}).alliesBuilt) || 0), 0),
      leadRallies: pr.reduce((a, r) => a + (((r.leadEngage || {}).rallies) || 0), 0),
      leadRespected: pr.reduce((a, r) => a + (((r.leadEngage || {}).leadsRespected) || 0), 0),
      takeoversEstTotal: pr.reduce((a, r) => a + (r.takeoversEst || 0), 0),
      maxCascadeMean: +(pr.reduce((a, r) => a + (r.maxCascade || 0), 0) / pr.length).toFixed(2),
      cascadeRuns: pr.filter(r => (r.maxCascade || 0) >= 2).length, // same contender holding >=2 domains
      betrayalsStarted: pr.reduce((a, r) => a + r.betrayalsStarted, 0),
      betrayalCombats: pr.reduce((a, r) => a + r.betrayalCombats, 0),
      promisesMade: pr.reduce((a, r) => a + r.promises.made, 0),
      promisesKept: pr.reduce((a, r) => a + r.promises.kept, 0),
      promisesBroken: pr.reduce((a, r) => a + r.promises.broken, 0),
      trustGainTotal: avg('trustGainTotal'), trustLossTotal: avg('trustLossTotal'),
      talkCapHits: avg('talkCapHits'), rcCalls: avg('rcCalls'),
      trustEndMean: +(tEnds.reduce((a, t) => a + t.mean, 0) / tEnds.length).toFixed(2),
      trustEndMaxMean: +(tEnds.reduce((a, t) => a + t.max, 0) / tEnds.length).toFixed(2),
      trustEndShare65: +(tEnds.reduce((a, t) => a + t.share65, 0) / tEnds.length).toFixed(3),
      trustEndShare90: +(tEnds.reduce((a, t) => a + t.share90, 0) / tEnds.length).toFixed(3),
      rosterMean: +(pr.reduce((a, r) => a + r.rosterN, 0) / pr.length).toFixed(1),
      leadersMean: avg('leaders'), taskLeadsMean: avg('taskLeads'),
      // r2 run-health: outcomes, survival, death causes, wave reach
      endReasons: pr.reduce((m, r) => { m[r.endReason] = (m[r.endReason] || 0) + 1; return m; }, {}),
      wins: pr.filter(r => r.won).length,
      daysMedian: +median(pr.map(r => r.days)).toFixed(1),
      daysMax: Math.max.apply(null, pr.map(r => r.days)),
      maxWaveMean: +(pr.reduce((a, r) => a + (r.maxWaveUnlocked || 1), 0) / pr.length).toFixed(2),
      deathCauses: causeShares(pr.map(r => r.deaths), false),
      playerDeathCauses: causeShares(pr.map(r => r.deaths), true),
      // r2 focus: departure/return news reach (the lever)
      newsReach: (function () {
        const out = {};
        for (const act of ['departure', 'return']) {
          let n = 0, reach = 0, dead0 = 0, big4 = 0, seedH = 0;
          for (const r of pr) {
            const t = (r.gossipActionReach || {})[act];
            if (!t) continue;
            n += t.n; reach += t.meanMaxHeard * t.n; dead0 += t.dead0;
            big4 += t.reach4plus; seedH += t.meanSeedH * t.n;
          }
          out[act] = n
            ? { rumors: n, meanSeedH: +(seedH / n).toFixed(2), meanMaxHeard: +(reach / n).toFixed(2), dead0, reach4plus: big4 }
            : { rumors: 0 };
        }
        return out;
      })(),
    };
  }
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));
  // trust-curve trajectories for ALL: mean across runs per day
  const dayMap = {};
  for (const r of runs) for (const c of (r.trustCurves || [])) {
    dayMap[c.day] = dayMap[c.day] || { n: 0, mean: 0, max: 0, s65: 0, s90: 0 };
    const d = dayMap[c.day];
    d.n++; d.mean += c.mean; d.max += c.max; d.s65 += c.share65; d.s90 += c.share90;
  }
  const traj = Object.keys(dayMap).map(Number).sort((a, b) => a - b).map(d => {
    const e = dayMap[d];
    return { day: d, mean: +(e.mean / e.n).toFixed(2), max: +(e.max / e.n).toFixed(1), s65: +(e.s65 / e.n).toFixed(3), s90: +(e.s90 / e.n).toFixed(3) };
  });
  console.log('\n=== TRUST TRAJECTORY (ALL runs) ===');
  console.log(JSON.stringify(traj, null, 1));
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ meta: { days, date: new Date().toISOString().slice(0, 10), policies: policyIds }, agg, traj, runs }, null, 1));
    console.log('wrote ' + outFile);
  }
})();
