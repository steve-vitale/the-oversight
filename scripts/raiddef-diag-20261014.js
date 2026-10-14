#!/usr/bin/env node
// scripts/raiddef-diag-20261014.js — RAID-CHANNEL diagnostic (sim-findings
// RAID-CHANNEL REMAINDER, claimed by sim-raiddef ARM 3, run r35).
//
// Re-applies the siegedef3 leadfeast substrate (leadfeast + FEASTSCALE_R13=1,
// 8 seeds 11/22/33/44/55/66/77/88, 180d death-aware) as the paired CONTROL and
// instruments the FULL post-unlock Haven-death surface, splitting deaths into
// channels per unlocker:
//
//   draw       — s.feastDraw marker live at death (the feast's scavenger)
//   raid-night — killer was one of a raid's raiders AND death within
//                [raidDay, raidDay+1] (the raid event itself: bedroll
//                pendingEncounter, defenders' fights the scholar joined)
//   lingerer   — killer id ever carried m.lingering (a raider nobody met,
//                re-pinned at the Haven treeline, answered later)
//   other      — Haven combat death, none of the above (printed for
//                manual inspection — the "wander-in" hypothesis lives here)
//
// PRECONDITION (arm brief): if the non-draw remainder (raid-night + lingerer
// + other) is <30% of the total post-unlock Haven combat-death surface, the
// arm is KILLED at precondition — the lever would be fake work.
//
// Attribution mechanics:
// - Raids are recorded by wrapping Game.havenRaidTick (records day,
//   raider def-ids, palisade status). Entity id == def id (raid tick uses
//   m.id for pendingMonsterId/triggerEncounter; gorgedrive relies on this).
// - Lingering is polled daily in the policy wrapper: any world-monster with
//   m.lingering alive adds its def-id to lingeringEver. (The flag is set in
//   havenRaidTick's unmet-raider branch and its no-silent-clobber branch.)
// - Deaths captured via the w5death-audit playerDeath wrap pattern:
//   day, cause, location (nodeEpithet), killer ids+waves from tbfight,
//   feastDraw marker. Haven-ness from the location epithet containing
//   'Haven' (same convention as the w5death audit's at-Haven 84.8%).
//
// Usage:
//   node scripts/raiddef-diag-20261014.js
//   OUT=evidence/2026-10-14/raiddef-diag.json node scripts/raiddef-diag-20261014.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-14', 'raiddef-diag.json');

function monsterWave(Game, monsterId) {
  try {
    const md = (Game.data.monsters || []).find(m => m.id === monsterId);
    return md ? (md.wave || null) : null;
  } catch (e) { return null; }
}

function isHavenLoc(loc) {
  return typeof loc === 'string' && /haven/i.test(loc);
}

async function runSeed(seed) {
  delete process.env.RAIDDEF;
  const { Game } = await loadGame({ seed, mode: 'raiddef-diag' });
  await setupGame(Game);
  const audit = {
    playerDeaths: [], unlockDay5: null, raids: [], lingeringEver: new Set(),
    tableEver: false, tableDay: null, nationalDays: 0, maxUnlocked: 1,
  };

  // --- raid recorder: wrap havenRaidTick ---
  const origRaidTick = Game.havenRaidTick ? Game.havenRaidTick.bind(Game) : null;
  if (origRaidTick) {
    Game.havenRaidTick = function () {
      const r = origRaidTick();
      try {
        if (r) {
          const s = Game.state.scholar || {};
          const v = Game.state.village || {};
          const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
          const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
          const raiders = (Game.worldMonsters ? Game.worldMonsters() : [])
            .filter(m => m && m.tx === hx && m.ty === hy)
            .map(m => m.id);
          audit.raids.push({
            day: s.day || 0, raiderIds: raiders,
            palisade: Game.havenTier ? Game.havenTier() >= 2 : false,
          });
        }
      } catch (e) {}
      return r;
    };
  }

  // --- death recorder: the w5death-audit pattern + channel attribution ---
  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    const rec = { day: null, cause: cause || '?', loc: null, monsters: [], draw: false, channel: 'unattributed' };
    try {
      const s = Game.state.scholar || {};
      rec.day = s.day || 0;
      rec.draw = !!(s.feastDraw && s.feastDraw.monsterId);
      try {
        const f = Game.tbfight;
        if (f && f.fighters) {
          for (const x of f.fighters) {
            if (x && x.kind === 'monster') rec.monsters.push({ id: x.monsterId || '?', wave: monsterWave(Game, x.monsterId) });
          }
        }
      } catch (e) {}
      try { rec.loc = (Game.nodeEpithet ? Game.nodeEpithet(Game.map.px, Game.map.py) : '?'); } catch (e) { rec.loc = '?'; }
      // channel attribution (exclusive, priority order)
      if (rec.draw) {
        rec.channel = 'draw';
      } else {
        const killerIds = rec.monsters.map(m => m.id);
        // raid-night: killer in a raid's raider set, death within [raidDay, raidDay+1]
        let raidHit = null;
        for (const raid of audit.raids) {
          if (rec.day >= raid.day && rec.day <= raid.day + 1 &&
              killerIds.some(k => raid.raiderIds.indexOf(k) !== -1)) { raidHit = raid; break; }
        }
        if (raidHit) {
          rec.channel = 'raid-night';
          rec.raidDay = raidHit.day;
          rec.raidPalisade = raidHit.palisade;
        } else if (killerIds.some(k => audit.lingeringEver.has(k))) {
          rec.channel = 'lingerer';
        } else if (isHavenLoc(rec.loc) && rec.cause === 'combat') {
          rec.channel = 'other';
        } else {
          rec.channel = 'nonhaven';
        }
      }
    } catch (e) {}
    audit.playerDeaths.push(rec);
    return origPD(cause);
  };

  // --- policy wrapper: unlock/table/national tracking + lingering poll ---
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily ? leadfeast.daily.bind(leadfeast) : null;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw > audit.maxUnlocked) audit.maxUnlocked = uw;
      if (uw >= 5 && audit.unlockDay5 == null) audit.unlockDay5 = day;
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting && !audit.tableEver) { audit.tableEver = true; audit.tableDay = day; }
      } catch (e) {}
      try {
        const r = G.scaleRank ? G.scaleRank() : 'village';
        if (r === 'national' || r === 'global') audit.nationalDays++;
      } catch (e) {}
      // lingering poll: any live lingering world-monster marks its def-id
      try {
        const ms = G.worldMonsters ? G.worldMonsters() : [];
        for (const m of ms) {
          if (m && m.lingering && (m.hp || 0) > 0 && m.id) audit.lingeringEver.add(m.id);
        }
      } catch (e) {}
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };

  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });

  let arc = 1, won = false;
  try { arc = (Game.progState ? Game.progState() : {}).arc || 1; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}
  return {
    seed, days: result.days, endReason: result.endReason,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    tableEver: audit.tableEver, tableDay: audit.tableDay,
    nationalDays: audit.nationalDays, arc, won,
    raids: audit.raids.length,
    raidDays: audit.raids.map(r => r.day),
    lingeringEver: Array.from(audit.lingeringEver),
    deaths: audit.playerDeaths,
  };
}

function summarize(rows) {
  const unlockers = rows.filter(r => r.unlockDay5 != null);
  const channels = { draw: 0, 'raid-night': 0, lingerer: 0, other: 0 };
  let postHavenCombat = 0;
  const perSeed = [];
  for (const r of unlockers) {
    const sc = { draw: 0, 'raid-night': 0, lingerer: 0, other: 0 };
    for (const d of r.deaths) {
      if (d.day < r.unlockDay5) continue;
      if (d.cause !== 'combat') continue;
      if (!isHavenLoc(d.loc)) continue;
      postHavenCombat++;
      channels[d.channel] = (channels[d.channel] || 0) + 1;
      sc[d.channel] = (sc[d.channel] || 0) + 1;
    }
    perSeed.push({ seed: r.seed, unlockDay5: r.unlockDay5, raids: r.raids, channels: sc });
  }
  const nonDraw = channels['raid-night'] + channels.lingerer + channels.other;
  const days = rows.map(r => r.days).sort((a, b) => a - b);
  return {
    n: rows.length,
    unlockers: unlockers.length,
    postUnlockHavenCombat: postHavenCombat,
    channels,
    nonDraw,
    nonDrawShare: postHavenCombat ? nonDraw / postHavenCombat : 0,
    medianDays: days[Math.floor(days.length / 2)],
    national: rows.filter(r => r.nationalDays > 0).length,
    table: rows.filter(r => r.tableEver).length,
    wave5: rows.filter(r => r.maxUnlocked >= 5).length,
    won: rows.filter(r => r.won).length,
    perSeed,
  };
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    console.log(`[raiddef-diag] seed ${seed} ...`);
    const row = await runSeed(seed);
    rows.push(row);
    console.log(`  -> ${row.days}d ${row.endReason} wave≤${row.maxUnlocked} unlock=${row.unlockDay5 == null ? 'no' : 'd' + row.unlockDay5} raids=${row.raids} deaths=${row.deaths.length}`);
    for (const d of row.deaths) {
      const postU = row.unlockDay5 != null && d.day >= row.unlockDay5;
      console.log(`     d${d.day} ${d.cause}${postU ? ' [post]' : ''} ch=${d.channel} loc=${d.loc} vs ${d.monsters.map(m => m.id + '(w' + m.wave + ')').join(',') || 'nofight'}`);
    }
  }
  const s = summarize(rows);
  console.log('--- CHANNEL SUMMARY (post-unlock Haven combat deaths) ---');
  console.log(JSON.stringify({ total: s.postUnlockHavenCombat, channels: s.channels, nonDraw: s.nonDraw, nonDrawShare: s.nonDrawShare }, null, 1));
  console.log('--- PER-SEED ---');
  for (const ps of s.perSeed) console.log(JSON.stringify(ps));
  console.log('--- WALL ---');
  console.log(JSON.stringify({ unlockers: s.unlockers, medianDays: s.medianDays, national: s.national, table: s.table, wave5: s.wave5, won: s.won }));
  const PRECOND = 0.30;
  const pass = s.nonDrawShare >= PRECOND;
  console.log(`PRECONDITION: non-draw share ${(s.nonDrawShare * 100).toFixed(1)}% >= 30% → ${pass ? 'PASS (build the layer)' : 'FAIL (KILL at precondition)'}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    generated: new Date().toISOString(), seeds: SEEDS, days: DAYS,
    substrate: 'leadfeast+FEASTSCALE_R13=1',
    summary: s, precondition: { threshold: PRECOND, pass },
    rows,
  }, null, 1));
  console.log(`wrote ${OUT}`);
  if (!pass) process.exit(2);
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
module.exports = { runSeed, SEEDS, DAYS, summarize };
