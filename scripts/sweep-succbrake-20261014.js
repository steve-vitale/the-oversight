#!/usr/bin/env node
// sweep-succbrake-20261014.js — SUCCESSION-FEED BRAKE PILOT (scale-onramp r29, ARM 3).
//
// Before/after on identical seeds (courtship suite: leadcourt + FOURTHLINK=1,
// seeds 11/22/33/44/55/66/77/88, 180d death-aware).
//   control: SUCCBRAKE unset  -> fourthlink (the diagnostic's road)
//   armed:   SUCCBRAKE=1      -> fourthlink + succbrake layer
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-succbrake.md — written BEFORE the
// armed run; the control side re-runs the diagnostic road through this
// driver's instrument):
//   PRIMARY: same-day/next-day successor combat deaths per mantle succession
//     (aggregate feeds / mantleSuccessions) <= control x 0.70
//   GUARDRAILS: median survival >= control-5d; national >= control-2;
//     wave-5 unlocks >= control-1; no new death mode (no player:cause key in
//     armed absent from control)
//   Horizon 180d death-aware; 8 seeds; competent courtship both sides.
// A miss is NO-GO per §14 — never re-scored.
//
// The instrument is the diagnostic's (tenure from daily + playerDeath +
// death tele; combat_start pairing-lite for the same-monster sub-metric),
// plus wave-unlock + maxRank tracking for the guardrails.
//
// Usage (control, one seed):
//   SEEDS=55 OUT=evidence/2026-10-14/sim-succbrake-control-s55.json \
//     node scripts/sweep-succbrake-20261014.js
// Usage (armed):
//   SEEDS=55 SUCCBRAKE=1 OUT=evidence/2026-10-14/sim-succbrake-armed-s55.json \
//     node scripts/sweep-succbrake-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
const ARMED = process.env.SUCCBRAKE === '1';
// DETGATE=1: run the succbrake WRAPPER with the env gate OFF against raw
// fourthlink — the trajectories must be byte-identical (gate-off delegation).
const DETGATE = process.env.DETGATE === '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// NAMED exports (r20b lesson).
const { fourthlink } = require('./policies/fourthlink');
// Graceful degradation (kill-protocol, r29): if the layer was deleted per
// the kill protocol, armed mode fails LOUDLY instead of measuring the wrong
// thing; control mode is unaffected.
let succbrake = null;
try { succbrake = require('./policies/succbrake').succbrake; }
catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  if (ARMED || DETGATE) {
    console.error('FATAL: SUCCBRAKE requested but scripts/policies/succbrake.js is absent (killed arm). Refusing to measure the baseline as armed.');
    process.exit(2);
  }
  console.error('info: succbrake layer absent — control mode only.');
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

async function runOne(seed, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'succbrake-pilot', fullTelemetry: true });
  await setupGame(Game);

  const track = { tenures: [], unlockDay: {}, maxRank: 0, exiledEver: false };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;
  const bearerOf = (G) => (G.villagerId != null ? G.villagerId : (((G.state || {}).scholar || {}).villagerId));
  let lastVid = null;
  const noteBearer = (G, vid, day) => {
    if (vid != null && vid !== lastVid) { track.tenures.push({ vid, startDay: day }); lastVid = vid; }
  };
  // read-only instrument wraps (proven byte-identical by the diagnostic SMOKE)
  try {
    if (typeof Game.playerDeath === 'function') {
      const origPD = Game.playerDeath.bind(Game);
      Game.playerDeath = function () {
        const r = origPD.apply(this, arguments);
        try { noteBearer(this, bearerOf(this), gday(this)); } catch (e) { instrErrors.push('playerDeath: ' + e.message); }
        return r;
      };
    }
  } catch (e) { instrErrors.push('playerDeathWrap: ' + e.message); }
  try {
    if (typeof Game.tele === 'function') {
      const origTele = Game.tele.bind(Game);
      Game.tele = function (type, data) {
        try { if (type === 'death' && data && data.player && data.who && data.who !== '?') noteBearer(this, data.who, gday(this)); }
        catch (e) { instrErrors.push('deathTele: ' + e.message); }
        return origTele.apply(this, arguments);
      };
    }
  } catch (e) { instrErrors.push('teleWrap: ' + e.message); }

  const base = DETGATE ? succbrake : (ARMED ? succbrake : fourthlink);
  const origDaily = base.daily;
  const policy = Object.assign({}, base, {
    id: (base.id || 'base') + '+succbrake-pilot',
    desc: 'pilot instrument wrapper',
  });
  policy.daily = (G, ctx) => {
    try {
      noteBearer(G, bearerOf(G), gday(G));
      const wv = (G.unlockedWave && G.unlockedWave()) || 1;
      for (let w = 1; w <= wv; w++) if (track.unlockDay[w] == null) track.unlockDay[w] = gday(G);
      const s2 = stdSnapshot(G); track.maxRank = Math.max(track.maxRank, RANK_ORDER[s2.rank] || 0);
      if (G.state && G.state.exiled) track.exiledEver = true;
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
    successions.push({
      prevVid: String(prev.vid).slice(0, 14), curVid: String(cur.vid).slice(0, 14),
      startDay: cur.startDay, mantlePass: !!prevDeath,
      curDeathDay: curDeath ? curDeath.day : null, gap, category: cat, feed,
      prevMonster, curMonster,
      sameMonster: !!(feed && prevMonster && curMonster && prevMonster !== '(person-fight)' && prevMonster === curMonster),
    });
  }
  const mantleSuccessions = successions.filter(s => s.mantlePass);
  const feeds = successions.filter(s => s.feed);

  const deathCauses = {};
  for (const d of (result.samples.deaths || [])) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    deathCauses[k] = (deathCauses[k] || 0) + 1;
  }
  // layer observability (armed side): fortify windows, declines
  let sbStats = null;
  if (ARMED) {
    sbStats = { windows: 0, fortifyDays: 0, declined: 0, walkHops: 0, deaths: 0 };
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
    sameMonsterFeeds: feeds.filter(s => s.sameMonster).length,
    feedDetail: feeds.map(f => ({ seed, prevVid: f.prevVid, curVid: f.curVid, startDay: f.startDay, curDeathDay: f.curDeathDay, gap: f.gap, prevMonster: f.prevMonster, curMonster: f.curMonster, sameMonster: f.sameMonster })),
    deathCauses,
    playerDeaths: playerDeaths.length,
    instrErrors: instrErrors.length,
    sbStats,
  };
  if (opts.verbose !== false) {
    console.log(`  [${ARMED ? 'armed' : 'ctrl'} seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `mantleSucc=${row.mantleSuccessions} feeds=${row.feeds} w5=${row.wave5 ? 'd' + row.wave5Day : 'no'} ` +
      `rank=${row.maxRank} instrErr=${instrErrors.length}`);
  }
  return { row, ctxNotes: null };
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
    .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT;
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const rows = [];
  for (const seed of seeds) rows.push((await runOne(seed, { days })).row);
  const mantleSucc = rows.reduce((t, r) => t + r.mantleSuccessions, 0);
  const feeds = rows.reduce((t, r) => t + r.feeds, 0);
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const median = daysArr.length ? (daysArr[Math.floor((daysArr.length - 1) / 2)] + daysArr[Math.floor(daysArr.length / 2)]) / 2 : null;
  const report = {
    label: DETGATE ? 'succbrake-detgate' : (ARMED ? 'succbrake-armed' : 'succbrake-control'),
    policy: DETGATE ? 'succbrake-wrapper-gate-OFF' : (ARMED ? 'fourthlink+SUCCBRAKE=1' : 'fourthlink'), seeds, days, commit,
    generated: new Date().toISOString(),
    rows,
    suite: {
      seeds: rows.length,
      mantleSuccessions: mantleSucc,
      feeds,
      feedPerMantleSuccession: mantleSucc ? +(feeds / mantleSucc).toFixed(4) : null,
      sameMonsterFeeds: rows.reduce((t, r) => t + r.sameMonsterFeeds, 0),
      medianSurvival: median,
      national: rows.filter(r => r.national).length,
      wave5: rows.filter(r => r.wave5).length,
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
  console.log(`SUITE [${report.label}]: feeds ${s.feeds}/${s.mantleSuccessions} = ${s.feedPerMantleSuccession}/succ, ` +
    `median ${s.medianSurvival}d, national ${s.national}/${s.seeds}, w5 ${s.wave5}/${s.seeds}, exiled ${s.exiled}`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne };
