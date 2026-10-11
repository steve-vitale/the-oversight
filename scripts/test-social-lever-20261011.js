#!/usr/bin/env node
// test-social-lever-20261011.js — TRUST & SOCIAL lever measurement.
// Long-horizon social assessment: trust movement, gossip spread/distortion,
// leadership challenges, moots (petition + televised), conflicts, conversations.
// Runs BEFORE/AFTER on identical seeds. Usage:
//   SEEDS="1,2,3" POLICIES="competent,socialite" DAYS=200 OUT=/tmp/social.json \
//     node scripts/test-social-lever-20261011.js
// SENSE-TESTING: captures say() lines; prints sampled gossip/conflict/leadership
// lines for human reading. SAYLINES=1 keeps them in the JSON.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { socialite } = require('./policies/socialite');

const POLICIES = { competent, socialite };
function parseList(env, def) { return (process.env[env] || def).split(',').map(s => s.trim()).filter(Boolean); }

function trustMap(Game) {
  const out = {};
  try {
    const t = (Game.state.village || {}).trust || {};
    for (const [k, val] of Object.entries(t)) out[k] = val;
  } catch (e) {}
  return out;
}
// villagers' trust OF the player (per-villager trust maps, default 15)
function npcTrustOfPlayer(Game) {
  const out = [];
  try {
    const pid = Game.villagerId;
    for (const v of (Game.data.villagers || [])) {
      if (!v || v.id === pid) continue;
      if (!((Game.state.village || {}).roster || []).includes(v.id)) continue;
      const t = (v.trust && v.trust[pid] !== undefined) ? v.trust[pid] : 15;
      out.push({ vid: v.id, name: (v.name || '').split(' ')[0], trust: t });
    }
  } catch (e) {}
  return out;
}
function stats(arr) {
  if (!arr.length) return { n: 0, mean: 0, min: 0, max: 0 };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return { n: arr.length, mean: +mean.toFixed(1), min: Math.min(...arr), max: Math.max(...arr) };
}

function socialSnapshot(Game, day) {
  const s = { day };
  try {
    const v = Game.state.village || {};
    const roster = v.roster || [];
    s.roster = roster.length;
    // trust: village.trust[vid] = villager vid's trust OF THE PLAYER (the live trust dimension)
    const tv = Object.values(v.trust || {}).filter(x => typeof x === 'number');
    s.trustNpcOfPlayer = stats(tv);
    // interpersonal trust maps on villager objects (villager<->villager; rarely written)
    const nt = npcTrustOfPlayer(Game).map(x => x.trust);
    s.trustInterpersonal = stats(nt);
    // death causes
    const causes = {};
    for (const f of (v.fallen || [])) { const c = (f.cause || 'unknown').slice(0, 40); causes[c] = (causes[c] || 0) + 1; }
    s.deathCauses = causes;
    // gossip
    const g = v.gossip || [];
    s.gossipCount = g.length;
    s.gossipHeard = stats(g.map(x => (x.heard || []).length));
    s.gossipDist = stats(g.map(x => x.distortion || 0));
    s.gossipHalfReach = g.filter(x => (x.heard || []).length >= Math.max(2, roster.length / 2)).length;
    // leadership
    let contenders = 0;
    for (const id of roster) { try { if (id !== Game.villagerId && Game.npcGoal(id) === 'lead') contenders++; } catch (e) {} }
    s.contenders = contenders;
    s.challengeActive = v.challenge ? 1 : 0;
    s.challengeCid = v.challenge ? v.challenge.cid : null;
    s.heatMax = Math.max(0, ...Object.values(v.heat || {}).map(Number), 0);
    s.taskLeads = Object.keys(v.taskLeads || {}).length;
    // conflicts
    const cf = v.conflicts || [];
    s.conflicts = cf.length;
    s.conflictsKnown = cf.filter(c => c.known).length;
    s.conflictsResolved = cf.filter(c => c.resolved).length;
    // conversations
    const conv = v.conv || {};
    s.convTotal = Object.values(conv).reduce((a, c) => a + ((c && c.count) || 0), 0);
    s.convPeople = Object.keys(conv).filter(k => (conv[k] || {}).count > 0).length;
    // moots / contests
    s.contestsHeld = Game.state.contestsHeld || 0;
    const seen = Game.state.contestsSeen || {};
    s.contestsSeenTotal = Object.values(seen).reduce((a, b) => a + b, 0);
    s.mootContests = 0;
    try {
      const pool = Game.contestPool ? Game.contestPool() : [];
      const mootIds = new Set(pool.filter(c => c && (c.cat === 'moot' || c.category === 'moot')).map(c => c.id));
      for (const id of Object.keys(seen)) if (mootIds.has(id)) s.mootContests += seen[id];
    } catch (e) {}
    // petition moots: count via state marker
    s.petitionMoots = Game.state.petitionMootsHeld || 0;
    // outcomes
    s.day = (Game.state.scholar || {}).day || 0;
    s.won = !!Game.won;
    s.arc = 1; try { s.arc = (Game.progState() || {}).arc || 1; } catch (e) {}
    s.national = 0; try { s.national = (Game.state.scale === 'national' || Game.state.scale === 'global') ? 1 : 0; } catch (e) {}
    let wave = 0; try { wave = Game.state.waveUnlocked || Game.state.wave || 0; } catch (e) {}
    s.wave = wave;
  } catch (e) { s.err = String(e).slice(0, 80); }
  return s;
}

(async () => {
  const seeds = parseList('SEEDS', '20261009,7,424242').map(Number);
  const policyIds = parseList('POLICIES', 'competent,socialite');
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;
  const keepLines = process.env.SAYLINES === '1';
  const runs = [];

  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error('unknown policy ' + pid); process.exit(1); }
    for (const seed of seeds) {
      const { Game, manifest } = await loadGame({ seed, mode: pid, fullTelemetry: false });
      await setupGame(Game);
      // count petition moots by wrapping the real function
      let petitionMoots = 0;
      try {
        const orig = Game.conductPetitionMoot;
        if (orig) Game.conductPetitionMoot = function (...a) { petitionMoots++; return orig.apply(Game, a); };
      } catch (e) {}
      // SENSE-TEST capture: keep narration in a ring buffer instead of dropping it.
      const lines = [];
      const keepRe = /(gossip|rumor|fire|moot|challenge|lead|trust|argu|fight|murder|theft|vote|speech|whisper|confront|loyal)/i;
      Game.say = function (txt) { try { if (keepRe.test(String(txt))) { lines.push(String(txt).slice(0, 280)); if (lines.length > 4000) lines.shift(); } } catch (e) {} };
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      const snap0 = socialSnapshot(Game, 0);
      const trust0 = trustMap(Game);
      const curve = [];
      const challengeHist = [];
      let maxChallengeAge = 0;
      policy.daily = (G, ctx) => {
        try {
          const v = G.state.village || {};
          if (v.challenge) {
            challengeHist.push({ day: (G.state.scholar || {}).day, cid: v.challenge.cid, age: v.challenge.age || 0 });
            if ((v.challenge.age || 0) > maxChallengeAge) maxChallengeAge = v.challenge.age || 0;
          }
          const d = (G.state.scholar || {}).day || 0;
          if (d % 20 === 0) curve.push(socialSnapshot(G, d));
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, manifest, sampleEvery: 20 });
      const snap1 = socialSnapshot(Game, days);
      snap1.petitionMoots = petitionMoots;
      // trust movement: compare day-0 vs end for survivors
      const trust1 = trustMap(Game);
      const mv = [];
      for (const [k, v0] of Object.entries(trust0)) if (trust1[k] !== undefined) mv.push(trust1[k] - v0);
      const run = {
        seed, policy: pid, days: result.days, endReason: result.endReason,
        ms: result.ms,
        snap0: { trustNpcOfPlayer: snap0.trustNpcOfPlayer, trustInterpersonal: snap0.trustInterpersonal, roster: snap0.roster },
        snap1,
        trustMove: stats(mv),            // villagers' trust of player: mean delta day0->end
        challengeDays: challengeHist.length,
        challengeCids: [...new Set(challengeHist.map(h => h.cid))],
        maxChallengeAge,
        curve,
        notes: result.notes || [],
      };
      if (keepLines) run.senseLines = lines;
      else {
        // keep a stratified sample for the console report
        const picks = [];
        const seen = new Set();
        for (const l of lines) {
          const key = l.slice(0, 40);
          if (seen.has(key)) continue;
          seen.add(key);
          if (picks.length < 24) picks.push(l);
        }
        run.senseSample = picks;
      }
      runs.push(run);
      console.log(JSON.stringify({
        seed, policy: pid, days: result.days, endReason: result.endReason,
        trust: snap1.trustNpcOfPlayer,
        gossip: snap1.gossipCount, heardMean: snap1.gossipHeard.mean, distMean: snap1.gossipDist.mean,
        halfReach: snap1.gossipHalfReach, contenders: snap1.contenders,
        challengeDays: challengeHist.length, mootContests: snap1.mootContests,
        petitionMoots: snap1.petitionMoots, conflicts: `${snap1.conflictsKnown}/${snap1.conflicts} known, ${snap1.conflictsResolved} resolved`,
        convTotal: snap1.convTotal, wave: snap1.wave, arc: snap1.arc, national: snap1.national,
        trustMoveMean: stats(mv).mean,
      }));
    }
  }
  if (outFile) {
    const fs = require('fs');
    fs.writeFileSync(outFile, JSON.stringify({ runs, when: new Date().toISOString() }, null, 1));
    console.log('wrote ' + outFile);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
