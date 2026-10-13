#!/usr/bin/env node
// journey-social-r9-gossip-20261013.js — LEG 5 SOCIAL LIFE, r9 (village journey sim loop).
// PROBE: does the gossip DISTORTION telephone game render sensibly to the player?
// Steve's design: "Information spreads by gossip, not broadcast — with distortion
// through retelling." r8 (2026-10-12) proved gossip VOLUME (306-404 seeds/140d);
// this run proves the distortion half: does distortion actually climb, do the
// "fragments by the fire" overheard lines read like people, and does the
// progression read as a story growing then detaching?
//
// Policy: socialite (competent survival + social layer) PLUS a deliberate
// gossip-driver: one player-started rumor per week via spreadRumor (alternating
// 'stingy' / 'untrustworthy', about rotating NPC subjects), and a scheduled
// minor theft (stealFrom) with witnesses to seed player-ACTION gossip.
//
// Instrumentation per seed:
//   - every gossip entry tracked daily by partKey: {action, heard.length, distortion}
//   - every "fragments by the fire" overheard say-line captured
//   - every Game.applyRep write captured (for rep-attribution checks on 3 chains)
// Output: evidence/2026-10-13/journey-social-r9-gossip.json (per-seed timelines)
// Usage: SEEDS=101,202,303,404 DAYCAP=100 node scripts/journey-social-r9-gossip-20261013.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [101, 202, 303, 404]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-13');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }

async function oneSeed(seed) {
  const t0 = Date.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-r9-gossip', fullTelemetry: false });
  const curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const me = () => Game.villagerId;
  const playerName = () => vname(Game, me());

  // ---- say capture ----
  const sayLog = [];
  function recSay(tag, msg) {
    try {
      const m = String(msg == null ? '' : msg);
      if (!m) return;
      sayLog.push({ d: curDay(), t: (tag ? '[' + tag + '] ' : '') + m.slice(0, 600) });
    } catch (e) {}
  }
  Game.say = function (msg) { recSay(null, msg); };
  Game.sysSay = function (msg) { recSay('SYSTEM', msg); };

  // ---- rumor registry (keyed by partKey) ----
  // rumor: {kind:'rumor'|'seed', action, subject, day0, firstHearer, partKey,
  //         maxHeard, maxDistortion, lastHeard, lastDistortion}
  const rumors = new Map();
  function ensureRumorsEntry(g, kind, extra) {
    const key = g.partKey;
    if (!rumors.has(key)) {
      rumors.set(key, {
        kind, action: g.action, subject: (g.dims || {}).who || null,
        day0: g.day, firstHearer: (g.heard || [])[0] || null, partKey: key,
        maxHeard: 0, maxDistortion: 0, lastHeard: 0, lastDistortion: 0,
        ...(extra || {}),
      });
    }
    return rumors.get(key);
  }
  const _sr = Game.spreadRumor;
  Game.spreadRumor = function (targetId, rumorType, firstHearerId) {
    const r = _sr.apply(this, arguments);
    try {
      if (r && r.partKey) {
        const e = ensureRumorsEntry(r, 'rumor', { target: vname(Game, targetId), firstHearerName: vname(Game, firstHearerId) });
        e.playerSpawned = true;
      }
    } catch (e2) {}
    return r;
  };
  const _sg = Game.seedGossip;
  Game.seedGossip = function (action, dims, heardBy, noTrust) {
    const r = _sg.apply(this, arguments);
    try {
      const v = Game.state.village || {};
      const g = (v.gossip || []).find(x => x.action === action && x.partKey === (this.state.scholar.day + ':' + this.dayPart));
      if (g) ensureRumorsEntry(g, 'seed');
    } catch (e2) {}
    return r;
  };

  // ---- rep-write capture (for the 3-chain attribution check) ----
  const repWrites = [];
  const _ar = Game.applyRep;
  Game.applyRep = function (vid, dims, weight, noTrust, trustRippleTo) {
    try {
      repWrites.push({
        d: curDay(), target: vid, targetName: vname(Game, vid),
        dims: Object.assign({}, dims), weight, noTrust: !!noTrust,
      });
      if (repWrites.length > 20000) repWrites.splice(0, 5000);
    } catch (e) {}
    return _ar.apply(this, arguments);
  };

  // ---- daily gossip sampler ----
  const dailyGossip = [];
  function sampleGossip() {
    const v = Game.state.village || {};
    const g = v.gossip || [];
    for (const x of g) {
      const e = ensureRumorsEntry(x, x.playerRumor ? 'rumor' : 'seed');
      const hn = (x.heard || []).length, dt = x.distortion || 0;
      if (hn > e.maxHeard) e.maxHeard = hn;
      if (dt > e.maxDistortion) e.maxDistortion = dt;
      e.lastHeard = hn; e.lastDistortion = dt;
    }
    dailyGossip.push({
      d: curDay(), n: g.length,
      maxDistortion: g.reduce((m, x) => Math.max(m, x.distortion || 0), 0),
      totalHeard: g.reduce((t, x) => t + (x.heard || []).length, 0),
    });
  }

  await setupGame(Game);

  // ---- rumor + theft driver ----
  const rumorTypes = ['stingy', 'untrustworthy'];
  let rumorCount = 0, theftCount = 0, rumorNoTarget = 0;
  const spawnedRumors = []; // {day, action, target, targetName, firstHearer, partKey}
  const ctxShared = {};
  const pol = Object.assign({}, socialite, {
    id: 'journey-social-r9-gossip',
    setup(Game2, ctx) { ctxShared.ctx = ctx; },
    daily(Game2, ctx) {
      if (socialite.daily) socialite.daily(Game2, ctx);
      const day = curDay();
      try {
        const vv = Game2.state.village || {};
        const others = (vv.roster || []).filter(id => id !== Game2.villagerId);
        // one rumor per week (day 10,17,24,...): alternating type, rotating subject
        if (day >= 10 && (day - 10) % 7 === 0 && others.length >= 3) {
          const type = rumorTypes[rumorCount % rumorTypes.length];
          const target = others[rumorCount % others.length];
          const hearer = others[(rumorCount + 1) % others.length];
          const fh = hearer === target ? others[(rumorCount + 2) % others.length] : hearer;
          try {
            const r = Game2.spreadRumor(target, type, fh);
            if (r && r.partKey) spawnedRumors.push({ day, action: type, target, targetName: vname(Game2, target), firstHearer: fh, partKey: r.partKey });
            rumorCount++;
          } catch (e) { rumorNoTarget++; }
        }
        // one minor theft every ~6 days (day 12,18,...): richest pantry mark
        if (day >= 12 && (day - 12) % 6 === 0 && Game2.stealFrom) {
          let mark = null;
          for (const id of others) { const p = Game2.getPerson ? Game2.getPerson(id) : null; if (p && !p.dead) { mark = id; break; } }
          if (mark) {
            try { if (Game2.stealFrom(mark)) { theftCount++; ctx.thefts = (ctx.thefts || 0) + 1; } } catch (e) {}
          }
        }
      } catch (e) {}
      sampleGossip();
    },
  });

  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Date.now() - t0;

  // ---- analysis ----
  const pn = playerName();
  const fragLines = sayLog.filter(e => /fragments by the fire/.test(e.t));
  // band classification from the frag tail text
  function bandOf(line) {
    const t = line.t || line;
    if (/barely the same story|two fires ago|three retellings|better theater/i.test(t)) return '>=6';
    if (/Half of it's true|details have shifted|picking up decorations/i.test(t)) return '4-5';
    if (/bigger than what happened|added a flourish|better than the event/i.test(t)) return '<4';
    return '?';
  }
  // parse "telling <listener> about <about>." fragments
  const parsed = fragLines.map(e => {
    const m = e.t.match(/fragments by the fire — (.+?) telling (.+?) about (.+?)\.\s+(.+)$/);
    return m ? { d: e.d, teller: m[1], listener: m[2], about: m[3], tail: m[4], band: bandOf(e.t), raw: e.t } : { d: e.d, raw: e.t, band: bandOf(e.t) };
  });
  // verbatim repeat check: repeat of the same TAIL text (the no-immediate-repeat claim)
  const tailCounts = {};
  for (const p of parsed) if (p.tail) tailCounts[p.tail] = (tailCounts[p.tail] || 0) + 1;
  const repeatedTails = Object.entries(tailCounts).filter(([, n]) => n > 1);
  // immediate-repeat check: same tail on consecutive lines
  let immediateRepeats = 0;
  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i].tail && parsed[i].tail === parsed[i - 1].tail) immediateRepeats++;
  }
  // "about you" misattribution check: teller is the player rendering "about you"
  const aboutYouLines = parsed.filter(p => p.about === 'you');
  const playerTellerAboutYou = parsed.filter(p => p.teller === pn && p.about === 'you');
  const listenerAboutSelf = parsed.filter(p => p.listener === p.about && !/self$|themself/i.test(p.about));

  // rumor summary table
  const rumorTable = [...rumors.values()].map(e => ({
    kind: e.kind, action: e.action,
    subject: e.subject ? vname(Game, e.subject) : null,
    day0: e.day0, maxHeard: e.maxHeard, maxDistortion: e.maxDistortion,
    playerSpawned: !!e.playerSpawned,
  })).sort((a, b) => a.day0 - b.day0);

  const playerRumors = [...rumors.values()].filter(e => e.playerSpawned);
  const seedRumors = [...rumors.values()].filter(e => !e.playerSpawned);
  const maxDistortion = rumorTable.reduce((m, r) => Math.max(m, r.maxDistortion), 0);
  const hit4 = rumorTable.filter(r => r.maxDistortion >= 4).length;
  const hit6 = rumorTable.filter(r => r.maxDistortion >= 6).length;

  // ---- 3-chain rep attribution check ----
  // pick up to 3 player-spawned rumors (stingy, untrustworthy) + one theft seed.
  // During [day0, day0+3], check rep writes: subject-targeted rumors must land on
  // the subject (repOf(subject)), never on the player self-slot; theft gossip
  // (player-action, no 'who') must land on hearers (listeners), never the player slot.
  const chains = [];
  const theftSeeds = [...rumors.values()].filter(e => e.action === 'theft').slice(0, 2);
  const picks = [
    ...playerRumors.filter(e => e.action === 'stingy').slice(0, 1),
    ...playerRumors.filter(e => e.action === 'untrustworthy').slice(0, 1),
    ...theftSeeds.slice(0, 1),
  ].slice(0, 3);
  for (const r of picks) {
    const w = repWrites.filter(x => x.d >= r.day0 && x.d <= r.day0 + 3);
    // writes plausibly from this rumor's gossip path: subject-targeted -> target==subject;
    // player-action (no subject) -> weight 0.4 / noTrust (gossip path signature)
    const gossipish = w.filter(x => x.noTrust);
    const onSubject = r.subject ? gossipish.filter(x => x.target === r.subject) : [];
    const onPlayerSelf = gossipish.filter(x => x.target === me());
    const byTarget = {};
    for (const x of gossipish) {
      byTarget[x.targetName] = byTarget[x.targetName] || { n: 0, dims: {} };
      byTarget[x.targetName].n++;
      for (const k of Object.keys(x.dims)) byTarget[x.targetName].dims[k] = (byTarget[x.targetName].dims[k] || 0) + x.dims[k];
    }
    chains.push({
      kind: r.kind, action: r.action,
      subject: r.subject ? vname(Game, r.subject) : '(player-action, no subject)',
      day0: r.day0, maxHeard: r.maxHeard, maxDistortion: r.maxDistortion,
      gossipPathWrites: gossipish.length, writesOnSubject: onSubject.length,
      writesOnPlayerSelfSlot: onPlayerSelf.length,
      repByTarget: byTarget,
      playerSpawned: !!r.playerSpawned,
    });
  }

  const evidence = {
    seed, manifest, policy: pol.id, ms: Math.round(ms / 1000) + 's',
    days: result.days, endReason: result.endReason, gameDay: curDay(),
    playerRumorsSpawned: rumorCount, spawnedDetails: spawnedRumors,
    thefts: theftCount, rumorNoTarget,
    rumorCount: rumors.size, playerRumorCount: playerRumors.length, seedRumorCount: seedRumors.length,
    maxDistortion, rumorsHittingD4: hit4, rumorsHittingD6: hit6,
    bandHist: { lt4: parsed.filter(p => p.band === '<4').length, b45: parsed.filter(p => p.band === '4-5').length, gte6: parsed.filter(p => p.band === '>=6').length, unknown: parsed.filter(p => p.band === '?').length },
    fragLines: parsed,
    fragCount: fragLines.length,
    distinctTails: Object.keys(tailCounts).length,
    repeatedTails: repeatedTails.map(([tail, n]) => ({ tail: String(tail).slice(0, 120), n })),
    immediateTailRepeats: immediateRepeats,
    aboutYouLines: aboutYouLines.length,
    playerTellerAboutYouLines: playerTellerAboutYou,
    listenerEqualsAboutRaw: listenerAboutSelf.map(p => p.raw),
    rumorTable,
    repAttributionChains: chains,
    dailyGossip: dailyGossip.filter((_, i) => i % 10 === 0),
    alive: ((Game.state.village || {}).roster || []).length,
  };
  return evidence;
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const all = [];
  for (const seed of SEEDS) {
    console.log(`=== seed ${seed} (DAY_CAP=${DAYCAP}) ===`);
    const evidence = await oneSeed(seed);
    all.push(evidence);
    fs.writeFileSync(path.join(OUTDIR, `journey-social-r9-gossip-seed${seed}.json`),
      JSON.stringify(evidence, null, 1));
    console.log(`day ${evidence.gameDay} end=${evidence.endReason} ms=${evidence.ms}`);
    console.log(`rumors=${evidence.rumorCount} (player ${evidence.playerRumorCount}) maxDist=${evidence.maxDistortion} d4=${evidence.rumorsHittingD4} d6=${evidence.rumorsHittingD6} frags=${evidence.fragCount} thefts=${evidence.thefts}`);
  }
  const combined = {
    run: 'journey-social-r9-gossip-20261013', seeds: SEEDS, daycap: DAYCAP,
    summary: all.map(e => ({
      seed: e.seed, days: e.gameDay, rumorCount: e.rumorCount,
      maxDistortion: e.maxDistortion, d4: e.rumorsHittingD4, d6: e.rumorsHittingD6,
      frags: e.fragCount, thefts: e.thefts, alive: e.alive, endReason: e.endReason,
    })),
  };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r9-gossip.json'), JSON.stringify(combined, null, 1));
  console.log('wrote evidence/2026-10-13/journey-social-r9-gossip.json');
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
