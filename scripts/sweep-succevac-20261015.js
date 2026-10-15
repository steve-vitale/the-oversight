#!/usr/bin/env node
// sweep-succevac-20261015.js — SUCCESSOR-EVACUATE PILOT (scale-onramp, #214).
//
// Before/after on identical seeds (courtship suite: leadcourt + FOURTHLINK=1,
// seeds 11/22/33/44/55/66/77/88, 180d death-aware).
//   control: SUCCEVAC unset  -> fourthlink (the diagnostic's road)
//   armed:   SUCCEVAC=1      -> fourthlink + succevac layer
//
// PRE-REGISTRATION (evidence/2026-10-15/sim-succevac.md — written BEFORE any
// sims; the control side runs through this driver's instrument):
//   PRIMARY (binding): gap>=1 successor combat deaths per mantle succession
//     (the touchable set — a successor who dies before the first
//     post-succession policy.daily is unreachable by ANY policy lever),
//     armed <= control x 0.70.
//   Degeneracy rule: control gap>=1 feeds == 0 -> primary cannot bind ->
//     INSUFFICIENT-EVIDENCE (no GO on a degenerate metric).
//   SECONDARY (reported): total feeds/succession (succbrake gap<=1 def);
//     same-day vs next-day split; Haven-tile vs wild-tile split of feed
//     deaths; intervening-daily probe (of gap-0 feeds, how many had a
//     post-succession policy.daily before the successor's death).
//   GUARDRAILS: median survival >= control-10d; national >= control-2/8;
//     no new death mode (player:cause key in armed absent from control only
//     counts at n>=3).
//   Horizon 180d death-aware; 8 seeds; identical-seed deterministic (A/A).
// A miss is NO-GO per §14 — never re-scored.
//
// The instrument is the succbrake diagnostic's (tenure from daily +
// playerDeath + death tele; combat_start pairing-lite for the same-monster
// sub-metric), plus:
//   - death-tile stamp: the read-only tele wrap stamps data.tile=[px,py] on
//     player death records (at tele time the scholar is still the dying one,
//     on the death tile). The succevac layer reads ev.tile; deaths without
//     the stamp fail safe. Telemetry-only, zero gameplay effect; the SMOKE
//     gate proves trajectory-neutrality. (A ctx-side channel merged only in
//     daily was tried first and MISSED every death first seen at an upkeep —
//     probe-evac-miss-20261015 found it; the stamp fixes it.)
//   - seq log of scholar deaths + policy.daily invocations, for the
//     intervening-daily probe.
//   - wave-unlock + maxRank tracking for the guardrails.
//
// Usage (control, one seed):
//   SEEDS=55 OUT=evidence/2026-10-15/sim-succevac-control-s55.json \
//     node scripts/sweep-succevac-20261015.js
// Usage (armed):
//   SEEDS=55 SUCCEVAC=1 OUT=evidence/2026-10-15/sim-succevac-armed-s55.json \
//     node scripts/sweep-succevac-20261015.js
// Gates:
//   SMOKE=1 SEEDS=44 node scripts/sweep-succevac-20261015.js  (instrument honesty)
//   DETGATE=1 SEEDS=44 node scripts/sweep-succevac-20261015.js (gate-off wrapper vs raw)
//   AA=1 node scripts/sweep-succevac-20261015.js (A/A determinism, both sides)
'use strict';
process.env.FOURTHLINK = '1';
const ARMED = process.env.SUCCEVAC === '1';
// DETGATE=1: run the succevac WRAPPER with the env gate OFF against raw
// fourthlink — the trajectories must be byte-identical (gate-off delegation).
const DETGATE = process.env.DETGATE === '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// NAMED exports (r20b lesson).
const { fourthlink } = require('./policies/fourthlink');
// Graceful degradation (kill-protocol): if the layer was deleted per the kill
// protocol, armed mode fails LOUDLY instead of measuring the wrong thing;
// control mode is unaffected.
let succevac = null;
try { succevac = require('./policies/succevac').succevac; }
catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  if (ARMED || DETGATE) {
    console.error('FATAL: SUCCEVAC requested but scripts/policies/succevac.js is absent (killed arm). Refusing to measure the baseline as armed.');
    process.exit(2);
  }
  console.error('info: succevac layer absent — control mode only.');
}
const { stdSnapshot } = require('./sweep-compare');
const { pairFights, categorizeCause } = require('./w5census-lib');

const MONSTERS = require('../src/data/monsters.json');
const NAME_OF = {};
const MONSTER_NAMES = new Set();
for (const m of MONSTERS) {
  const n = m.name || m.id;
  NAME_OF[m.id] = n;
  MONSTER_NAMES.add(n);
  MONSTER_NAMES.add(m.id);
}
const nameOf = (mid) => NAME_OF[mid] || mid || '?';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// coarse per-day state identity (same shape as the succbrake diag)
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    let standing = 0;
    try { standing = Math.round(((Game.villageStanding ? Game.villageStanding() : null) || {}).total || 0); } catch (e) {}
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100),
      standing].join('|');
  } catch (e) { return 'ERR'; }
}

async function runOne(seed, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const wraps = opts.wraps || 'all'; // 'none' = instrument-honesty control
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'succevac-pilot', fullTelemetry: true });
  await setupGame(Game);

  const track = { tenures: [], unlockDay: {}, maxRank: 0, exiledEver: false, dayHashes: [] };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;
  const scholarOf = (G) => (G.villagerId != null ? G.villagerId : (((G.state || {}).scholar || {}).villagerId));
  let lastVid = null;
  const noteScholar = (G, vid, day) => {
    if (vid != null && vid !== lastVid) { track.tenures.push({ vid, startDay: day }); lastVid = vid; }
  };
  // seq log: scholar deaths + policy.daily invocations (intervening-daily probe)
  let seq = 0;
  const seqLog = []; // {seq, kind:'death'|'daily', day, vid, tile?}
  const deathTiles = {}; // who:day -> [px,py] (metric-side tile attribution)
  let evacLines = 0; // read-only count of the layer's evac narration
  const EVAC_RE = /won't sleep at Haven tonight/;

  if (wraps === 'all') {
    try {
      if (typeof Game.say === 'function') {
        const origSay = Game.say.bind(Game);
        Game.say = function (m) {
          try { if (EVAC_RE.test(String(m))) evacLines++; } catch (e) {}
          return origSay.apply(this, arguments);
        };
      }
    } catch (e) { instrErrors.push('sayWrap: ' + e.message); }
    try {
      if (typeof Game.playerDeath === 'function') {
        const origPD = Game.playerDeath.bind(Game);
        Game.playerDeath = function () {
          const r = origPD.apply(this, arguments);
          // da71901e pattern: note the NEW scholar synchronously at the
          // mantle pass (read-only, ctx-side) — otherwise a successor who
          // takes over and dies the same day gets a startDay one day late,
          // misclassifying gap1 as gap0.
          try { noteScholar(this, scholarOf(this), gday(this)); } catch (e) { instrErrors.push('playerDeath: ' + e.message); }
          return r;
        };
      }
    } catch (e) { instrErrors.push('playerDeathWrap: ' + e.message); }
    try {
      if (typeof Game.tele === 'function') {
        const origTele = Game.tele.bind(Game);
        Game.tele = function (type, data) {
          try {
            if (type === 'death' && data && data.player) {
              // stamp the death tile: at this point the scholar is still the
              // dying one, on the death tile (registerDeath runs before the
              // succession). Telemetry-only: zero gameplay effect.
              try { data.tile = this.map ? [this.map.px, this.map.py] : null; } catch (e2) {}
              const d = gday(this);
              seqLog.push({ seq: ++seq, kind: 'death', day: d, vid: String(data.who).slice(0, 14), tile: data.tile || null, cause: String(data.cause).slice(0, 40) });
              deathTiles[String(data.who).slice(0, 40) + ':' + d] = data.tile || null;
              noteScholar(this, data.who, d);
            }
          } catch (e) { instrErrors.push('deathTele: ' + e.message); }
          return origTele.apply(this, arguments);
        };
      }
    } catch (e) { instrErrors.push('teleWrap: ' + e.message); }
  }

  const base = opts.forceBase === 'raw' ? fourthlink
    : opts.forceBase === 'wrapper' ? succevac
    : (ARMED ? succevac : fourthlink);
  const origDaily = base.daily;
  // The daily wrapper is ALWAYS installed (both SMOKE sides): it only reads
  // for hashes, and gates every write on wraps==='all'. Only the Game-level
  // wraps (playerDeath/tele/say) are absent in wraps='none'.
  const policy = Object.assign({}, base, {
    id: (base.id || 'base') + '+succevac-pilot',
    desc: 'pilot instrument wrapper',
  });
  policy.daily = (G, ctx) => {
    try {
      if (wraps === 'all') {
        noteScholar(G, scholarOf(G), gday(G));
        seqLog.push({ seq: ++seq, kind: 'daily', day: gday(G), vid: String(scholarOf(G)).slice(0, 14) });
        const wv = (G.unlockedWave && G.unlockedWave()) || 1;
        for (let w = 1; w <= wv; w++) if (track.unlockDay[w] == null) track.unlockDay[w] = gday(G);
        const s2 = stdSnapshot(G); track.maxRank = Math.max(track.maxRank, RANK_ORDER[s2.rank] || 0);
        if (G.state && G.state.exiled) track.exiledEver = true;
      }
      if (opts.collectHashes) { try { track.dayHashes.push(gday(G) + ':' + dayHash(G)); } catch (e) {} }
    } catch (e) { instrErrors.push('daily: ' + e.message); }
    if (origDaily) return origDaily(G, ctx);
  };

  const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
  const end = stdSnapshot(Game);

  const tele = (Game.state || {}).telemetry || [];
  const playerDeaths = (result.samples.deaths || [])
    .filter(d => d.player)
    .map(d => ({ day: d.day, who: d.who, cause: d.cause }));
  const combatStarts = tele
    .filter(e => e.type === 'combat_start')
    .map(e => ({ day: e.day, mid: e.vs, wave: e.wave || null, pack: e.pack || 1 }));
  const combatEnds = tele
    .filter(e => e.type === 'combat_end')
    .map(e => ({ day: e.day, result: e.result || null }));
  const pairs = pairFights(combatStarts, combatEnds);
  function pairedMonster(deathDay) {
    let best = null, bestScore = 1e9;
    for (const p of pairs) {
      if (!p.end) continue;
      const diff = Math.abs(p.end.day - deathDay);
      if (diff > 1) continue;
      const score = diff * 10 + (p.end.day > deathDay ? 1 : 0);
      if (score < bestScore) { bestScore = score; best = p; }
    }
    if (!best) return null;
    return best.start ? nameOf(best.start.mid) : '(person-fight)';
  }
  const tileOf = (who, day) => deathTiles[String(who).slice(0, 40) + ':' + day] || null;

  const successions = [];
  for (let i = 1; i < track.tenures.length; i++) {
    const prev = track.tenures[i - 1], cur = track.tenures[i];
    const prevDeaths = playerDeaths.filter(d => d.who === prev.vid && d.day <= cur.startDay);
    const prevDeath = prevDeaths.length ? prevDeaths[prevDeaths.length - 1] : null;
    const curDeaths = playerDeaths.filter(d => d.who === cur.vid && d.day >= cur.startDay);
    const curDeath = curDeaths.length ? curDeaths[0] : null;
    const gap = curDeath ? curDeath.day - cur.startDay : null;
    const cat = curDeath ? categorizeCause(curDeath.cause, MONSTER_NAMES) : null;
    const feed = !!(curDeath && cat === 'combat' && gap <= 1);
    const prevMonster = prevDeath ? pairedMonster(prevDeath.day) : null;
    const curMonster = curDeath ? pairedMonster(curDeath.day) : null;
    // intervening-daily probe (gap-0 only): did a post-succession policy.daily
    // run with the successor's vid before the successor's death?
    let interveningDaily = null;
    if (feed && gap === 0 && prevDeath && curDeath) {
      const prevSeq = (seqLog.find(e => e.kind === 'death' && e.vid === String(prev.vid).slice(0, 14) && e.day === prevDeath.day) || {}).seq;
      const curSeq = (seqLog.find(e => e.kind === 'death' && e.vid === String(cur.vid).slice(0, 14) && e.day === curDeath.day) || {}).seq;
      interveningDaily = !!(prevSeq != null && curSeq != null &&
        seqLog.some(e => e.kind === 'daily' && e.vid === String(cur.vid).slice(0, 14) && e.day === curDeath.day && e.seq > prevSeq && e.seq < curSeq));
    }
    successions.push({
      prevVid: String(prev.vid).slice(0, 14), curVid: String(cur.vid).slice(0, 14),
      startDay: cur.startDay, mantlePass: !!prevDeath,
      curDeathDay: curDeath ? curDeath.day : null, gap, category: cat, feed,
      prevMonster, curMonster,
      sameMonster: !!(feed && prevMonster && curMonster && prevMonster !== '(person-fight)' && prevMonster === curMonster),
      prevDeathTile: prevDeath ? tileOf(prevDeath.who, prevDeath.day) : null,
      curDeathTile: curDeath ? tileOf(curDeath.who, curDeath.day) : null,
      interveningDaily,
    });
  }
  const mantleSuccessions = successions.filter(s => s.mantlePass);
  const feeds = successions.filter(s => s.feed);
  const gap0Feeds = feeds.filter(s => s.gap === 0);
  const gap1plusFeeds = feeds.filter(s => s.gap >= 1);

  const deathCauses = {};
  for (const d of (result.samples.deaths || [])) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    deathCauses[k] = (deathCauses[k] || 0) + 1;
  }
  // layer observability (armed side): evac narration lines = evac windows that fired
  let seStats = null;
  if (ARMED) {
    seStats = { evacLines, deaths: playerDeaths.length };
  }

  const row = {
    seed, armed: ARMED, days: result.days, endReason: result.endReason,
    endStanding: end.standing,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === track.maxRank) || 'village',
    national: track.maxRank >= 2,
    wave5: track.unlockDay[5] != null, wave5Day: track.unlockDay[5] || null,
    wave4: track.unlockDay[4] != null,
    exiled: !!track.exiledEver,
    tenures: track.tenures.length,
    mantleSuccessions: mantleSuccessions.length,
    feeds: feeds.length,
    gap0Feeds: gap0Feeds.length,
    gap1plusFeeds: gap1plusFeeds.length,
    gap1plusPerSuccession: mantleSuccessions.length ? +(gap1plusFeeds.length / mantleSuccessions.length).toFixed(4) : null,
    sameMonsterFeeds: feeds.filter(s => s.sameMonster).length,
    feedDetail: feeds.map(f => ({ seed, prevVid: f.prevVid, curVid: f.curVid, startDay: f.startDay, curDeathDay: f.curDeathDay, gap: f.gap, prevMonster: f.prevMonster, curMonster: f.curMonster, sameMonster: f.sameMonster, prevDeathTile: f.prevDeathTile, curDeathTile: f.curDeathTile, interveningDaily: f.interveningDaily })),
    deathCauses,
    playerDeaths: playerDeaths.length,
    instrErrors: instrErrors.length,
    seStats,
    evacLines, // control side must be 0 (contamination check)
    dayHashes: track.dayHashes,
  };
  if (opts.verbose !== false) {
    console.log(`  [${ARMED ? 'armed' : 'ctrl'} seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `mantleSucc=${row.mantleSuccessions} feeds=${row.feeds} (gap0=${row.gap0Feeds} gap1+=${row.gap1plusFeeds}) w5=${row.wave5 ? 'd' + row.wave5Day : 'no'} ` +
      `rank=${row.maxRank} instrErr=${instrErrors.length}`);
  }
  return { row, ctxNotes: null };
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
    .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT;
  const smoke = process.env.SMOKE === '1';
  const aa = process.env.AA === '1';
  const detgate = process.env.DETGATE === '1';

  if (detgate) {
    // Gate-off wrapper vs raw fourthlink: byte-identical trajectories.
    // Implemented by running each seed twice — once with the wrapper as the
    // base (gate off), once with the raw parent — and comparing dayHashes.
    const seed = seeds[0];
    console.log(`DETGATE: gate-off wrapper vs raw fourthlink on seed ${seed}`);
    const runWith = async (base) => {
      return runOne(seed, { days, wraps: 'all', collectHashes: true, verbose: false, forceBase: base });
    };
    const a = await runWith('wrapper');
    const b = await runWith('raw');
    const ha = a.row.dayHashes.join('\n'), hb = b.row.dayHashes.join('\n');
    const same = ha === hb && ha.length > 0;
    console.log(`  hashes: wrapper=${a.row.dayHashes.length} raw=${b.row.dayHashes.length} identical=${same}`);
    if (!same) {
      const la = a.row.dayHashes, lb = b.row.dayHashes;
      for (let i = 0; i < Math.max(la.length, lb.length); i++) {
        if (la[i] !== lb[i]) { console.log(`  first diff at idx ${i}: wrapper=${la[i]} raw=${lb[i]}`); break; }
      }
      process.exit(1);
    }
    console.log('DETGATE PASS: gate-off wrapper is verb-identical to the raw parent');
    return;
  }

  if (smoke) {
    // Instrument-honesty: wraps=none vs wraps=all must be byte-identical
    // (control side — the armed side needs the tile channel by design).
    if (ARMED || DETGATE) { console.error('FATAL: SMOKE runs control-side only.'); process.exit(2); }
    const seed = seeds[0];
    console.log(`SMOKE: instrument honesty on seed ${seed} (wraps=none vs wraps=all)`);
    const a = await runOne(seed, { days, wraps: 'none', collectHashes: true, verbose: false });
    const b = await runOne(seed, { days, wraps: 'all', collectHashes: true, verbose: false });
    const ha = a.row.dayHashes.join('\n'), hb = b.row.dayHashes.join('\n');
    const same = ha === hb && ha.length > 0;
    console.log(`  hashes: none=${a.row.dayHashes.length} all=${b.row.dayHashes.length} identical=${same}`);
    if (!same) {
      const la = a.row.dayHashes, lb = b.row.dayHashes;
      for (let i = 0; i < Math.max(la.length, lb.length); i++) {
        if (la[i] !== lb[i]) { console.log(`  first diff at idx ${i}: none=${la[i]} all=${lb[i]}`); break; }
      }
      process.exit(1);
    }
    console.log('SMOKE PASS: instrument is read-only (byte-identical trajectories)');
    return;
  }

  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const rows = [];
  for (const seed of seeds) {
    rows.push((await runOne(seed, { days })).row);
    if (aa) rows.push((await runOne(seed, { days })).row);
  }
  if (aa) {
    // A/A determinism: paired runs must agree on the feed metric + trajectory.
    let ok = true;
    for (let i = 0; i < rows.length; i += 2) {
      const a = rows[i], b = rows[i + 1];
      const same = a.feeds === b.feeds && a.mantleSuccessions === b.mantleSuccessions &&
        a.gap1plusFeeds === b.gap1plusFeeds &&
        JSON.stringify(a.feedDetail.map(f => [f.gap, f.category, f.feed])) ===
        JSON.stringify(b.feedDetail.map(f => [f.gap, f.category, f.feed]));
      if (!same) { ok = false; console.log(`  AA MISMATCH seed ${a.seed}`); }
    }
    console.log(ok ? 'AA PASS: deterministic' : 'AA FAIL');
    if (!ok) process.exit(1);
    return;
  }
  const mantleSucc = rows.reduce((t, r) => t + r.mantleSuccessions, 0);
  const feeds = rows.reduce((t, r) => t + r.feeds, 0);
  const gap0 = rows.reduce((t, r) => t + r.gap0Feeds, 0);
  const gap1plus = rows.reduce((t, r) => t + r.gap1plusFeeds, 0);
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const median = daysArr.length ? (daysArr[Math.floor((daysArr.length - 1) / 2)] + daysArr[Math.floor(daysArr.length / 2)]) / 2 : null;
  const report = {
    label: DETGATE ? 'succevac-detgate' : (ARMED ? 'succevac-armed' : 'succevac-control'),
    policy: DETGATE ? 'succevac-wrapper-gate-OFF' : (ARMED ? 'fourthlink+SUCCEVAC=1' : 'fourthlink'), seeds, days, commit,
    generated: new Date().toISOString(),
    rows: rows.map(r => Object.assign({}, r, { dayHashes: undefined })),
    suite: {
      seeds: rows.length,
      mantleSuccessions: mantleSucc,
      feeds,
      feedPerMantleSuccession: mantleSucc ? +(feeds / mantleSucc).toFixed(4) : null,
      gap0Feeds: gap0,
      gap1plusFeeds: gap1plus,
      gap1plusPerSuccession: mantleSucc ? +(gap1plus / mantleSucc).toFixed(4) : null,
      sameMonsterFeeds: rows.reduce((t, r) => t + r.sameMonsterFeeds, 0),
      medianSurvival: median,
      national: rows.filter(r => r.national).length,
      wave5: rows.filter(r => r.wave5).length,
      wave4: rows.filter(r => r.wave4).length,
      exiled: rows.filter(r => r.exiled).length,
      deathCauses: rows.reduce((acc, r) => {
        for (const [k, v] of Object.entries(r.deathCauses)) acc[k] = (acc[k] || 0) + v;
        return acc;
      }, {}),
    },
  };
  if (out) {
    fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1));
    console.log(`wrote ${out}`);
  }
  const s = report.suite;
  console.log(`SUITE [${report.label}]: feeds ${s.feeds}/${s.mantleSuccessions} = ${s.feedPerMantleSuccession}/succ ` +
    `(gap0=${s.gap0Feeds} gap1+=${s.gap1plusFeeds} -> ${s.gap1plusPerSuccession}/succ), ` +
    `median ${s.medianSurvival}d, national ${s.national}/${s.seeds}, w5 ${s.wave5}/${s.seeds}, exiled ${s.exiled}`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne };
