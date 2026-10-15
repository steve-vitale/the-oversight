#!/usr/bin/env node
// sweep-besiegeanswer-20261015.js — ANSWER-THE-BESIEGER PILOT (scale-onramp, #270).
//
// Before/after on identical seeds (courtship suite: leadcourt + FOURTHLINK=1,
// seeds 11/22/33/44/55/66/77/88, 180d death-aware).
//   control: BESIEGEANSWER unset -> fourthlink (the diagnostic's road)
//   armed:   BESIEGEANSWER=1    -> fourthlink + besiegeanswer layer
//
// PRE-REGISTRATION (evidence/2026-10-15/sim-besiegeanswer.md — written BEFORE
// any sims; the control side runs through this driver's instrument):
//   PRIMARY (binding): gap>=1 successor combat deaths per mantle succession
//     (the touchable set), armed <= control x 0.70.
//   Degeneracy rule: control gap>=1 feeds == 0 -> INSUFFICIENT-EVIDENCE.
//   SECONDARY (reported): total feeds/succession; same-day vs next-day
//     split; Haven-tile vs wild-tile split; wave-floor subset (feeds by
//     besieger wave: w1-3 vs w4+); drive-off outcomes (answered / held-hp /
//     held-party / w4+-declined / unattributed / held-away / held-table);
//     answer-fight results.
//   GUARDRAILS: median survival >= control-10d; national >= control-2/8;
//     no new death mode (player:cause key in armed absent from control only
//     counts at n>=3); villager (non-scholar) combat deaths <= control+2
//     (#246 roster-level wall).
//   Horizon 180d death-aware; 8 seeds; identical-seed deterministic (A/A).
// A miss is NO-GO per §14 — never re-scored.
//
// The instrument is the succevac pilot's (tenure from daily + playerDeath +
// death tele; combat_start/end pairing for besieger attribution), plus:
//   - death-tile stamp: the read-only tele wrap stamps data.tile=[px,py] on
//     player death records (at tele time the scholar is still the dying one,
//     on the death tile). The besiegeanswer layer reads ev.tile; deaths
//     without the stamp fail safe. Telemetry-only, zero gameplay effect;
//     the SMOKE gate proves trajectory-neutrality.
//   - drive-off line counting (read-only say wrap): the layer's answer
//     narration.
//   - policy-ctx capture: the daily wrapper stashes the ctx reference so the
//     sweep can read the layer's own counters (baAnswers, baDeclinedW4,
//     baHeld*, baTricks, baCommittedTurns) after the run.
//   - besieger wave on each feed (combat_start record carries wave).
//
// Usage (control, one seed):
//   SEEDS=55 OUT=evidence/2026-10-15/sim-besiegeanswer-control-s55.json \
//     node scripts/sweep-besiegeanswer-20261015.js
// Usage (armed):
//   SEEDS=55 BESIEGEANSWER=1 OUT=evidence/2026-10-15/sim-besiegeanswer-armed-s55.json \
//     node scripts/sweep-besiegeanswer-20261015.js
// Gates:
//   SMOKE=1 SEEDS=44 node scripts/sweep-besiegeanswer-20261015.js  (instrument honesty)
//   DETGATE=1 SEEDS=44 node scripts/sweep-besiegeanswer-20261015.js (gate-off wrapper vs raw)
//   AA=1 node scripts/sweep-besiegeanswer-20261015.js (A/A determinism, both sides)
'use strict';
process.env.FOURTHLINK = '1';
const ARMED = process.env.BESIEGEANSWER === '1';
// DETGATE=1: run the besiegeanswer WRAPPER with the env gate OFF against raw
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
let ba = null;
try { ba = require('./policies/besiegeanswer'); }
catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  if (ARMED || DETGATE) {
    console.error('FATAL: BESIEGEANSWER requested but scripts/policies/besiegeanswer.js is absent (killed arm). Refusing to measure the baseline as armed.');
    process.exit(2);
  }
  console.error('info: besiegeanswer layer absent — control mode only.');
}
const { stdSnapshot } = require('./sweep-compare');
const { pairFights, categorizeCause } = require('./w5census-lib');

const MONSTERS = require('../src/data/monsters.json');
const NAME_OF = {};
const WAVE_OF = {};
const MONSTER_NAMES = new Set();
for (const m of MONSTERS) {
  const n = m.name || m.id;
  NAME_OF[m.id] = n;
  WAVE_OF[m.id] = m.wave || 1;
  MONSTER_NAMES.add(n);
  MONSTER_NAMES.add(m.id);
}
const nameOf = (mid) => NAME_OF[mid] || mid || '?';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// coarse per-day state identity (same shape as the succevac diag)
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
  const { Game } = await loadGame({ seed, mode: 'besiegeanswer-pilot', fullTelemetry: true });
  await setupGame(Game);

  const track = { tenures: [], unlockDay: {}, maxRank: 0, exiledEver: false, dayHashes: [] };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;
  const scholarOf = (G) => (G.villagerId != null ? G.villagerId : (((G.state || {}).scholar || {}).villagerId));
  let lastVid = null;
  const noteScholar = (G, vid, day) => {
    if (vid != null && vid !== lastVid) { track.tenures.push({ vid, startDay: day }); lastVid = vid; }
  };
  let seq = 0;
  const seqLog = [];
  const deathTiles = {};
  let driveLines = 0; // read-only count of the layer's drive-off narration
  const DRIVE_RE = /drive it off/;
  let capturedCtx = null;

  if (wraps === 'all') {
    try {
      if (typeof Game.say === 'function') {
        const origSay = Game.say.bind(Game);
        Game.say = function (m) {
          try { if (DRIVE_RE.test(String(m))) driveLines++; } catch (e) {}
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
          // mantle pass (read-only, ctx-side).
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
              // dying one, on the death tile. Telemetry-only: zero gameplay
              // effect.
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
    : opts.forceBase === 'wrapper' ? (ba ? ba.policyForRun() : fourthlink)
    : (ARMED ? (ba ? ba.policyForRun() : fourthlink) : fourthlink);
  const origDaily = base.daily;
  // The daily wrapper is ALWAYS installed (both SMOKE sides): it only reads
  // for hashes, and gates every write on wraps==='all'. It also captures the
  // policy ctx so the sweep can read the layer's counters after the run.
  const policy = Object.assign({}, base, {
    id: (base.id || 'base') + '+besiegeanswer-pilot',
    desc: 'pilot instrument wrapper',
  });
  policy.daily = (G, ctx) => {
    try {
      capturedCtx = ctx;
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
    .map(e => ({ day: e.day, mid: e.vs, wave: e.wave || WAVE_OF[e.vs] || null, pack: e.pack || 1 }));
  const combatEnds = tele
    .filter(e => e.type === 'combat_end')
    .map(e => ({ day: e.day, result: e.result || null }));
  const pairs = pairFights(combatStarts, combatEnds);
  function pairedBesieger(deathDay) {
    let best = null, bestScore = 1e9;
    for (const p of pairs) {
      if (!p.end) continue;
      const diff = Math.abs(p.end.day - deathDay);
      if (diff > 1) continue;
      const score = diff * 10 + (p.end.day > deathDay ? 1 : 0);
      if (score < bestScore) { bestScore = score; best = p; }
    }
    if (!best) {
      const cands = combatStarts.filter(s => s.day === deathDay);
      if (cands.length) best = { start: cands[cands.length - 1], end: null };
    }
    if (!best || !best.start) return null;
    return { mid: best.start.mid, name: nameOf(best.start.mid), wave: best.start.wave || WAVE_OF[best.start.mid] || null };
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
    const prevBes = prevDeath ? pairedBesieger(prevDeath.day) : null;
    const curBes = curDeath ? pairedBesieger(curDeath.day) : null;
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
      prevBesieger: prevBes, curBesieger: curBes,
      sameBesieger: !!(feed && prevBes && curBes && prevBes.mid && prevBes.mid === curBes.mid),
      prevDeathTile: prevDeath ? tileOf(prevDeath.who, prevDeath.day) : null,
      curDeathTile: curDeath ? tileOf(curDeath.who, curDeath.day) : null,
      interveningDaily,
    });
  }
  const mantleSuccessions = successions.filter(s => s.mantlePass);
  const feeds = successions.filter(s => s.feed);
  const gap0Feeds = feeds.filter(s => s.gap === 0);
  const gap1plusFeeds = feeds.filter(s => s.gap >= 1);
  // wave-floor subset (pre-registered): feeds by besieger wave.
  const waveFloor = { w13: 0, w4plus: 0, unattributed: 0 };
  for (const f of feeds) {
    const w = f.curBesieger && f.curBesieger.wave;
    if (w == null) waveFloor.unattributed++;
    else if (w >= 4) waveFloor.w4plus++;
    else waveFloor.w13++;
  }

  const deathCauses = {};
  let villagerCombatDeaths = 0;
  for (const d of (result.samples.deaths || [])) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    deathCauses[k] = (deathCauses[k] || 0) + 1;
    if (!d.player && categorizeCause(d.cause, MONSTER_NAMES) === 'combat') villagerCombatDeaths++;
  }
  // layer observability (armed side): the layer's own ctx counters.
  let baStats = null;
  if (ARMED && capturedCtx) {
    const c = capturedCtx;
    baStats = {
      answers: c.baAnswers || 0,
      declinedW4: c.baDeclinedW4 || 0,
      unattributed: c.baUnattributed || 0,
      heldHp: c.baHeldHp || 0,
      heldParty: c.baHeldParty || 0,
      heldAway: c.baHeldAway || 0,
      heldTable: c.baHeldTable || 0,
      heldBusy: c.baHeldBusy || 0,
      tricks: c.baTricks || 0,
      committedTurns: c.baCommittedTurns || 0,
      driveLines,
    };
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
    sameBesiegerFeeds: feeds.filter(s => s.sameBesieger).length,
    waveFloor,
    feedDetail: feeds.map(f => ({ seed, prevVid: f.prevVid, curVid: f.curVid, startDay: f.startDay, curDeathDay: f.curDeathDay, gap: f.gap, prevBesieger: f.prevBesieger, curBesieger: f.curBesieger, sameBesieger: f.sameBesieger, prevDeathTile: f.prevDeathTile, curDeathTile: f.curDeathTile, interveningDaily: f.interveningDaily })),
    deathCauses,
    villagerCombatDeaths,
    playerDeaths: playerDeaths.length,
    instrErrors: instrErrors.length,
    baStats,
    driveLines, // control side must be 0 (contamination check)
    dayHashes: track.dayHashes,
  };
  if (opts.verbose !== false) {
    console.log(`  [${ARMED ? 'armed' : 'ctrl'} seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `mantleSucc=${row.mantleSuccessions} feeds=${row.feeds} (gap0=${row.gap0Feeds} gap1+=${row.gap1plusFeeds}) w5=${row.wave5 ? 'd' + row.wave5Day : 'no'} ` +
      `rank=${row.maxRank} waveFloor=${JSON.stringify(waveFloor)} instrErr=${instrErrors.length}` +
      (baStats ? ` answers=${baStats.answers} declinedW4=${baStats.declinedW4}` : ''));
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
  const waveFloorAgg = { w13: 0, w4plus: 0, unattributed: 0 };
  for (const r of rows) for (const k of Object.keys(waveFloorAgg)) waveFloorAgg[k] += (r.waveFloor || {})[k] || 0;
  const report = {
    label: DETGATE ? 'besiegeanswer-detgate' : (ARMED ? 'besiegeanswer-armed' : 'besiegeanswer-control'),
    policy: DETGATE ? 'besiegeanswer-wrapper-gate-OFF' : (ARMED ? 'fourthlink+BESIEGEANSWER=1' : 'fourthlink'), seeds, days, commit,
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
      sameBesiegerFeeds: rows.reduce((t, r) => t + r.sameBesiegerFeeds, 0),
      waveFloor: waveFloorAgg,
      medianSurvival: median,
      national: rows.filter(r => r.national).length,
      wave5: rows.filter(r => r.wave5).length,
      wave4: rows.filter(r => r.wave4).length,
      exiled: rows.filter(r => r.exiled).length,
      villagerCombatDeaths: rows.reduce((t, r) => t + (r.villagerCombatDeaths || 0), 0),
      deathCauses: rows.reduce((acc, r) => {
        for (const [k, v] of Object.entries(r.deathCauses)) acc[k] = (acc[k] || 0) + v;
        return acc;
      }, {}),
      baStats: rows.reduce((acc, r) => {
        if (!r.baStats) return acc;
        for (const [k, v] of Object.entries(r.baStats)) acc[k] = (acc[k] || 0) + v;
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
