#!/usr/bin/env node
// sweep-succbrake-diag-20261014.js — SUCCESSION-FEED DIAGNOSTIC (scale-onramp r29, ARM 3).
//
// STEP 1 of the succbrake arm (mandatory, #205 lesson): measure same-day/
// next-day successor combat deaths per succession on the CURRENT tip, on the
// courtship suite (leadcourt + FOURTHLINK=1, seeds 11/22/33/44/55/66/77/88,
// 180d death-aware). Re-verifies the SUCCESSION FEED blank (sim-findings.md
// #132: post-unlock successors take the mantle and die to the SAME monster
// the same day — s44 d71/d89/d110) BEFORE any lever is built. If the serial
// chain does not reproduce here, the arm STOPS (no layer built).
//
// INSTRUMENT ONLY — no game-code changes, no policy changes. Read-only wraps:
//   - tenure tracking: daily hook + after playerDeath + on death tele
//     (the da71901e pattern — a successor who takes over and dies the same
//     day is never seen by once-per-day sampling; 0c86f98c quarantined the
//     old sampler for exactly this gap).
//   - say capture (succession/mantle/grief filter) for sense-testing.
//   - dayHashes for the instrument-honesty gate (SMOKE=1: wraps=none vs
//     wraps=all must be byte-identical).
//
// Metric per succession i>=1 (tenures[0] is the founder):
//   prev = tenures[i-1], cur = tenures[i]
//   prevDeath = latest player death of prev.vid with day <= cur.startDay
//   curDeath  = earliest player death of cur.vid with day >= cur.startDay
//   gap = curDeath.day - cur.startDay
//   FEED EVENT = curDeath is combat-category AND gap <= 1 (same-day/next-day)
//   sameMonster = feed AND prevDeath's paired monster == curDeath's paired
//     monster (pairFights from w5census-lib; combat_start pairing-lite).
// Mantle-pass successions (prevDeath != null) form the denominator; vid
// changes with no predecessor death (exile-class) are reported separately.
//
// Usage (full diagnostic):
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=180 OUT=evidence/2026-10-14/sim-succbrake-diag.json \
//     node scripts/sweep-succbrake-diag-20261014.js
// Usage (instrument honesty):
//   SMOKE=1 SEEDS=44 node scripts/sweep-succbrake-diag-20261014.js
// Usage (A/A determinism check):
//   AA=1 SEEDS=11,44 node scripts/sweep-succbrake-diag-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// NAMED export (r20b lesson): fourthlink, not a default.
const { fourthlink } = require('./policies/fourthlink');
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

const SAYRE = /died|dead|mantle|succession|bearer|grief|funeral|scholar|🕯|💀|watch|hold/i;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// dayHash (same shape as scripts/det-gate.js): coarse per-day state identity
// for the instrument-honesty check. Read-only.
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
  const { Game } = await loadGame({ seed, mode: 'succbrake-diag', fullTelemetry: true });
  await setupGame(Game);

  const track = { tenures: [], sayLines: [], dayHashes: [] };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;
  const bearerOf = (G) => (G.villagerId != null ? G.villagerId : (((G.state || {}).scholar || {}).villagerId));
  let lastVid = null;
  const noteBearer = (G, vid, day) => {
    if (vid != null && vid !== lastVid) {
      track.tenures.push({ vid, startDay: day });
      lastVid = vid;
    }
  };

  if (wraps === 'all') {
    // da71901e pattern: note the bearer after every playerDeath (the mantle
    // pass) and on every player death event — a successor who takes over and
    // dies the same day is invisible to once-per-day sampling.
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
    try {
      const origSay = Game.say ? Game.say.bind(Game) : null;
      Game.say = function (msg) {
        try {
          const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
          if (SAYRE.test(text) && track.sayLines.length < 400) {
            track.sayLines.push({ day: gday(Game), text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 220) });
          }
        } catch (e) {}
        return origSay ? origSay(msg) : msg;
      };
    } catch (e) { instrErrors.push('sayWrap: ' + e.message); }
  }

  const origDaily = fourthlink.daily;
  const policy = Object.assign({}, fourthlink, {
    id: 'fourthlink+succbrake-diag',
    desc: 'fourthlink + read-only succession-feed diagnostic instrument',
  });
  policy.daily = (G, ctx) => {
    try {
      if (wraps === 'all') noteBearer(G, bearerOf(G), gday(G));
      if (opts.collectHashes) { try { track.dayHashes.push(gday(G) + ':' + dayHash(G)); } catch (e) {} }
      try { const s2 = stdSnapshot(G); track.maxRank = Math.max(track.maxRank || 0, RANK_ORDER[s2.rank] || 0); } catch (e) {}
      try { if (G.state && G.state.exiled) track.exiledEver = true; } catch (e) {}
    } catch (e) { instrErrors.push('daily: ' + e.message); }
    if (origDaily) return origDaily(G, ctx);
  };

  const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
  const end = stdSnapshot(Game);

  // --- post-run assembly ---
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

  // pairedMonster: the combat_end nearest the death day (within 1 day) is the
  // death's fight; its paired combat_start names the monster (w5census-lib
  // pairing-lite). Null = no fight within a day; '(person-fight)' = end with
  // no start (uprising/betrayal/alien-duel bypass startCombat).
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
    const mantlePass = !!prevDeath;
    const feed = !!(curDeath && cat === 'combat' && gap <= 1);
    const prevMonster = prevDeath ? pairedMonster(prevDeath.day) : null;
    const curMonster = curDeath ? pairedMonster(curDeath.day) : null;
    successions.push({
      i, prevVid: String(prev.vid).slice(0, 14), curVid: String(cur.vid).slice(0, 14),
      startDay: cur.startDay,
      mantlePass,
      prevDeathDay: prevDeath ? prevDeath.day : null,
      prevCause: prevDeath ? String(prevDeath.cause).slice(0, 40) : null,
      curDeathDay: curDeath ? curDeath.day : null,
      curCause: curDeath ? String(curDeath.cause).slice(0, 40) : null,
      gap, category: cat, feed,
      prevMonster, curMonster,
      sameMonster: !!(feed && prevMonster && curMonster && prevMonster !== '(person-fight)' && prevMonster === curMonster),
    });
  }
  const mantleSuccessions = successions.filter(s => s.mantlePass);
  const feeds = successions.filter(s => s.feed);
  const sameMonsterFeeds = feeds.filter(s => s.sameMonster);

  const deathCauses = {};
  for (const d of (result.samples.deaths || [])) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    deathCauses[k] = (deathCauses[k] || 0) + 1;
  }

  const row = {
    seed, days: result.days, endReason: result.endReason,
    endStanding: end.standing, maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === (track.maxRank || 0)) || 'village',
    exiled: !!track.exiledEver,
    tenures: track.tenures.length,
    successions: successions.length,
    mantleSuccessions: mantleSuccessions.length,
    feeds: feeds.length,
    feedPerMantleSuccession: mantleSuccessions.length ? +(feeds.length / mantleSuccessions.length).toFixed(3) : null,
    sameMonsterFeeds: sameMonsterFeeds.length,
    successionsDetail: successions,
    feedDetail: feeds,
    deathCauses,
    playerDeaths: playerDeaths.length,
    instrErrors: instrErrors.length,
    storyLines: track.sayLines,
    dayHashes: track.dayHashes,
  };
  if (opts.verbose !== false) {
    console.log(`  [diag seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `tenures=${row.tenures} mantleSucc=${row.mantleSuccessions} feeds=${row.feeds} ` +
      `sameMonster=${row.sameMonsterFeeds} pDeaths=${row.playerDeaths} instrErr=${instrErrors.length}`);
    for (const f of feeds) {
      console.log(`    FEED s${seed}: ${f.prevVid} d${f.prevDeathDay} (${f.prevMonster || '?'}) -> ` +
        `${f.curVid} tenure d${f.startDay} dead d${f.curDeathDay} (gap ${f.gap}, ${f.curMonster || '?'})` +
        (f.sameMonster ? ' SAME-MONSTER' : ''));
    }
  }
  return row;
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
    .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-14/sim-succbrake-diag.json';
  const smoke = process.env.SMOKE === '1';
  const aa = process.env.AA === '1';

  if (smoke) {
    // Instrument-honesty: wraps=none vs wraps=all must be byte-identical.
    const seed = seeds[0];
    console.log(`SMOKE: instrument honesty on seed ${seed} (wraps=none vs wraps=all)`);
    const a = await runOne(seed, { days, wraps: 'none', collectHashes: true, verbose: false });
    const b = await runOne(seed, { days, wraps: 'all', collectHashes: true, verbose: false });
    const ha = a.dayHashes.join('\n'), hb = b.dayHashes.join('\n');
    const same = ha === hb && ha.length > 0;
    console.log(`  hashes: none=${a.dayHashes.length} all=${b.dayHashes.length} identical=${same}`);
    if (!same) {
      const la = a.dayHashes, lb = b.dayHashes;
      for (let i = 0; i < Math.max(la.length, lb.length); i++) {
        if (la[i] !== lb[i]) { console.log(`  first diff at idx ${i}: none=${la[i]} all=${lb[i]}`); break; }
      }
      process.exit(1);
    }
    console.log('SMOKE PASS: instrument is read-only (byte-identical trajectories)');
    return;
  }

  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const runs = [];
  for (const seed of seeds) {
    runs.push(await runOne(seed, { days }));
    if (aa) runs.push(await runOne(seed, { days, aaRun: true }));
  }
  if (aa) {
    // A/A determinism check: paired runs must agree on the feed metric.
    let ok = true;
    for (let i = 0; i < runs.length; i += 2) {
      const a = runs[i], b = runs[i + 1];
      const same = a.feeds === b.feeds && a.mantleSuccessions === b.mantleSuccessions &&
        JSON.stringify(a.successionsDetail.map(s => [s.gap, s.category, s.feed])) ===
        JSON.stringify(b.successionsDetail.map(s => [s.gap, s.category, s.feed]));
      console.log(`  AA seed ${a.seed}: feeds ${a.feeds}=${b.feeds} mantleSucc ${a.mantleSuccessions}=${b.mantleSuccessions} -> ${same ? 'IDENTICAL' : 'DIVERGED'}`);
      if (!same) ok = false;
    }
    console.log(ok ? 'AA PASS' : 'AA DIVERGED (see above)');
    if (!ok) process.exit(1);
    return;
  }

  const mantleSucc = runs.reduce((t, r) => t + r.mantleSuccessions, 0);
  const feeds = runs.reduce((t, r) => t + r.feeds, 0);
  const sameM = runs.reduce((t, r) => t + r.sameMonsterFeeds, 0);
  const report = {
    label: 'succbrake-diag', policy: 'leadcourt+FOURTHLINK=1', seeds, days, commit,
    generated: new Date().toISOString(),
    note: 'STEP-1 DIAGNOSTIC — instrument-only screen of the SUCCESSION FEED blank (#132) on the courtship suite. No lever built yet.',
    runs: runs.map(r => Object.assign({}, r, { successionsDetail: undefined, storyLines: undefined, dayHashes: undefined })),
    suite: {
      seeds: runs.length,
      measurableSeeds: runs.length,
      totalTenures: runs.reduce((t, r) => t + r.tenures, 0),
      mantleSuccessions: mantleSucc,
      feeds,
      feedPerMantleSuccession: mantleSucc ? +(feeds / mantleSucc).toFixed(3) : null,
      sameMonsterFeeds: sameM,
      sameMonsterShareOfFeeds: feeds ? +(sameM / feeds).toFixed(3) : null,
      seedsWithFeeds: runs.filter(r => r.feeds > 0).map(r => r.seed),
    },
  };
  fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1));
  console.log(`wrote ${out}`);
  console.log(`SUITE: ${runs.length} seeds, ${mantleSucc} mantle successions, ${feeds} feed events ` +
    `(${report.suite.feedPerMantleSuccession}/succession), ${sameM} same-monster`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne };
