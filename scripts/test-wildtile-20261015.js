#!/usr/bin/env node
// scripts/test-wildtile-20261015.js — proof for the wildtile instrument
// (sim-findings #256).
//
// REAL RED phase: the instrument must be ABLE TO FAIL. We assert that on
// (a) deaths with no matching fights, and (b) fights whose tiles were not
// captured (the broken-wrap scenario), the attribution metric reads 0 and
// the pre-registered GO (>=80%) FAILS — i.e. the instrument reports the
// gap honestly instead of hardcoding success. If the lib ever "attributed"
// these, the RED goes red-for-real.
// GREEN phase: the lib's distances, flags, pairing, and the #256 answer.
//
// Run: node scripts/test-wildtile-20261015.js
'use strict';
const assert = require('assert');
const lib = require('./wildtile-lib-20261015');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

const T = (x, y) => ({ x, y });
function row(o) {
  return lib.buildTileRow(Object.assign({
    seed: 11, day: 100, vid: 'v1', channel: 'wild', monsterId: 'hushpuppy',
    wave: 1, outcome: 'vDie', intent: 'learn', rounds: 2,
    monsterTile: T(6, 5), scholarTile: T(4, 4), havenTile: T(4, 4),
  }, o));
}

// ================= RED: the instrument must be able to fail =================
console.log('RED phase (instrument honesty — failure must be measurable):');
{
  // (a) deaths with NO matching fights: pairing finds nothing.
  const deaths = [
    { day: 100, vid: 'v9', who: 'v9', kind: 'villager', cause: 'monster', player: false },
    { day: 101, vid: 'v10', who: 'v10', kind: 'villager', cause: 'monster', player: false },
  ];
  const { pairs, unmatched } = lib.pairDeathsToFights(deaths, []);
  const attr = lib.tileAttribution(pairs, unmatched);
  ok('RED: no fights -> 0 pairs, 2 unmatched', pairs.length === 0 && unmatched.length === 2);
  ok('RED: attribution rate 0 on unfought deaths', attr.rate === 0, 'rate=' + attr.rate);
  ok('RED: pre-registered GO (>=80%) FAILS here', !(attr.rate >= 0.8));
  ok('RED: unmatched carried as channel unpaired', attr.byChannel.unpaired.n === 2);
}
{
  // (b) broken wrap: fights happened but tiles were never captured
  // (monsterTile null — e.g. the snapshot ran after an mFlee re-tile, or
  // the wrap threw before snapshotting).
  const deaths = [
    { day: 100, vid: 'v1', who: 'v1', kind: 'villager', cause: 'combat', player: false },
  ];
  const fights = [row({ monsterTile: null, vid: 'v1', day: 100 })];
  ok('RED: null monsterTile -> row not attributed', fights[0].attributed === false);
  const { pairs, unmatched } = lib.pairDeathsToFights(deaths, fights);
  const attr = lib.tileAttribution(pairs, unmatched);
  ok('RED: death pairs to the fight (pairing still works)', pairs.length === 1 && unmatched.length === 0);
  ok('RED: attribution rate 0 on tile-less fights', attr.rate === 0, 'rate=' + attr.rate);
  ok('RED: GO fails on the broken wrap', !(attr.rate >= 0.8));
}
{
  // (c) no wild deaths measured: #256 stays explicitly unanswered.
  const a = lib.answer256([]);
  ok('RED: empty wild population -> question unanswered', a.verdict === 'no wild deaths measured — question unanswered', a.verdict);
}

// ================= GREEN: distances =================
console.log('GREEN phase (lib correctness):');
ok('cheb same tile = 0', lib.cheb(T(4, 4), T(4, 4)) === 0);
ok('cheb diagonal = 1', lib.cheb(T(4, 4), T(5, 5)) === 1);
ok('cheb knight-move = 2', lib.cheb(T(4, 4), T(6, 5)) === 2);
ok('cheb null tile -> null', lib.cheb(null, T(4, 4)) === null);
ok('cleanTile rejects garbage', lib.cleanTile({ x: 'a', y: 1 }) === null);

// ================= GREEN: villager-tile derivation =================
ok('wild -> villagerTile = monsterTile', JSON.stringify(lib.deriveVillagerTile('wild', T(6, 5), T(4, 4))) === JSON.stringify(T(6, 5)));
ok('patrol -> villagerTile = monsterTile', JSON.stringify(lib.deriveVillagerTile('patrol', T(6, 5), T(4, 4))) === JSON.stringify(T(6, 5)));
ok('raid -> villagerTile = havenTile', JSON.stringify(lib.deriveVillagerTile('raid', T(6, 5), T(4, 4))) === JSON.stringify(T(4, 4)));
ok('other -> villagerTile null (honest unknown)', lib.deriveVillagerTile('other', T(6, 5), T(4, 4)) === null);
ok('wild with null monsterTile -> null', lib.deriveVillagerTile('wild', null, T(4, 4)) === null);

// ================= GREEN: row flags =================
{
  const r = row({});  // monster (6,5), scholar (4,4), haven (4,4)
  ok('row attributed when all tiles present', r.attributed === true);
  ok('dVillagerHaven = 2', r.dVillagerHaven === 2, 'd=' + r.dVillagerHaven);
  ok('dScholarHaven = 0', r.dScholarHaven === 0);
  ok('not on Haven tile', r.onHavenTile === false);
  ok('scholar not away from Haven', r.scholarAwayFromHaven === false);
  ok('scholar away from death', r.scholarAwayFromDeath === true);
  ok('scholar not at death tile', r.scholarAtDeathTile === false);
}
{
  const r = row({ monsterTile: T(4, 4), scholarTile: T(7, 7) });  // fight AT haven, scholar away
  ok('death on Haven tile when monster at Haven', r.onHavenTile === true);
  ok('scholar away from Haven flagged', r.scholarAwayFromHaven === true);
  ok('scholar away from death too', r.scholarAwayFromDeath === true);
}
{
  const r = row({ havenTile: null });
  ok('missing havenTile -> not attributed', r.attributed === false);
  ok('flags null when unattributed', r.onHavenTile === null && r.scholarAwayFromHaven === null);
}
{
  // raid: villagerTile = havenTile even when the monster tile differs
  const r = row({ channel: 'raid', monsterTile: T(9, 9) });
  ok('raid villagerTile = havenTile', r.villagerTile.x === 4 && r.villagerTile.y === 4);
  ok('raid death on Haven tile', r.onHavenTile === true);
}

// ================= GREEN: death filter =================
ok('villager+monster passes filter', lib.isVillagerCombatDeath({ kind: 'villager', cause: 'monster', player: false }));
ok('person+combat passes filter', lib.isVillagerCombatDeath({ kind: 'person', cause: 'combat', player: false }));
ok('player death rejected', !lib.isVillagerCombatDeath({ kind: 'villager', cause: 'monster', player: true }));
ok('monster kind rejected', !lib.isVillagerCombatDeath({ kind: 'monster', cause: 'combat', player: false }));
ok('disease cause rejected', !lib.isVillagerCombatDeath({ kind: 'villager', cause: 'sickness', player: false }));
ok('alien cause rejected', !lib.isVillagerCombatDeath({ kind: 'person', cause: 'alien', player: false }));

// ================= GREEN: pairing =================
{
  const deaths = [
    { day: 100, vid: 'v1', who: 'v1', kind: 'villager', cause: 'monster', player: false },
    { day: 105, vid: 'v2', who: 'v2', kind: 'villager', cause: 'combat', player: false },
    { day: 110, vid: 'v3', who: 'v3', kind: 'villager', cause: 'monster', player: false },
  ];
  const fights = [
    row({ vid: 'v1', day: 100 }),                       // exact
    row({ vid: 'v2', day: 104, outcome: 'vKill' }),     // wrong outcome — not fatal
    row({ vid: 'v2', day: 106 }),                       // day+1 window
    row({ vid: 'v2', day: 104 }),                       // nearer (day-1)
    row({ vid: 'v9', day: 110 }),                       // wrong vid
  ];
  const { pairs, unmatched } = lib.pairDeathsToFights(deaths, fights);
  ok('2 of 3 deaths pair', pairs.length === 2 && unmatched.length === 1, `pairs=${pairs.length} unmatched=${unmatched.length}`);
  const p1 = pairs.find(p => p.death.vid === 'v1');
  ok('v1 pairs to the exact-day fight', p1 && p1.fight.day === 100);
  const p2 = pairs.find(p => p.death.vid === 'v2');
  ok('v2 pairs to the NEAREST fatal fight (day 104, not 106)', p2 && p2.fight.day === 104);
  ok('v3 unmatched (no fight for its vid)', unmatched.length === 1 && unmatched[0].vid === 'v3');
}
{
  // one fight consumed once: two deaths same vid on nearby days, one fight.
  const deaths = [
    { day: 100, vid: 'v1', who: 'v1', kind: 'villager', cause: 'monster', player: false },
    { day: 101, vid: 'v1', who: 'v1', kind: 'villager', cause: 'monster', player: false },
  ];
  const { pairs, unmatched } = lib.pairDeathsToFights(deaths, [row({ vid: 'v1', day: 100 })]);
  ok('fight consumed once (double-death guard shape)', pairs.length === 1 && unmatched.length === 1);
}

// ================= GREEN: attribution rollup =================
{
  const deaths = [
    { day: 100, vid: 'v1', who: 'v1', kind: 'villager', cause: 'monster', player: false },
    { day: 101, vid: 'v2', who: 'v2', kind: 'villager', cause: 'monster', player: false },
    { day: 102, vid: 'v3', who: 'v3', kind: 'villager', cause: 'combat', player: false },
  ];
  const fights = [
    row({ vid: 'v1', day: 100, channel: 'wild' }),
    row({ vid: 'v2', day: 101, channel: 'raid' }),
  ];
  const { pairs, unmatched } = lib.pairDeathsToFights(deaths, fights);
  const attr = lib.tileAttribution(pairs, unmatched);
  ok('attribution total=3 attributed=2', attr.total === 3 && attr.attributed === 2);
  ok('attribution rate = 0.667', attr.rate === 0.667, 'rate=' + attr.rate);
  ok('byChannel wild 1/1', attr.byChannel.wild.n === 1 && attr.byChannel.wild.attributed === 1);
  ok('byChannel raid 1/1', attr.byChannel.raid.n === 1 && attr.byChannel.raid.attributed === 1);
  ok('byChannel unpaired 1', attr.byChannel.unpaired.n === 1 && attr.byChannel.unpaired.attributed === 0);
}

// ================= GREEN: answer256 =================
{
  const mk = (onHaven, scholarAway) => ({
    death: { day: 100, vid: 'x' },
    fight: row({
      channel: 'wild',
      monsterTile: onHaven ? T(4, 4) : T(7, 2),
      scholarTile: scholarAway ? T(8, 8) : T(4, 4),
    }),
  });
  const a = lib.answer256([mk(true, true), mk(true, true), mk(false, true), mk(false, false)]);
  ok('#256 n=4', a.n === 4);
  ok('#256 havenTile_scholarAway=2', a.breakdown.havenTile_scholarAway === 2);
  ok('#256 wildTile_scholarAway=1', a.breakdown.wildTile_scholarAway === 1);
  ok('#256 wildTile_scholarHome=1', a.breakdown.wildTile_scholarHome === 1);
  ok('#256 shareOnHavenTile=0.5', a.shareOnHavenTile === 0.5);
  ok('#256 shareScholarAway=0.75', a.shareScholarAway === 0.75);
  ok('#256 verdict PARTIAL', /^assumption PARTIAL: 2\/4/.test(a.verdict), a.verdict);
}
{
  const mkAll = () => ({
    death: { day: 100, vid: 'x' },
    fight: row({ channel: 'wild', monsterTile: T(4, 4), scholarTile: T(8, 8) }),
  });
  const a = lib.answer256([mkAll(), mkAll()]);
  ok('#256 all-on-Haven-away -> CONFIRMED', /^assumption CONFIRMED/.test(a.verdict), a.verdict);
  const mkWild = () => ({
    death: { day: 100, vid: 'x' },
    fight: row({ channel: 'wild', monsterTile: T(7, 2), scholarTile: T(8, 8) }),
  });
  const b = lib.answer256([mkWild(), mkWild()]);
  ok('#256 none-on-Haven -> REFUTED', /^assumption REFUTED/.test(b.verdict), b.verdict);
  // non-wild pairs are excluded from the #256 population.
  const c = lib.answer256([{ death: { day: 1, vid: 'y' }, fight: row({ channel: 'raid', monsterTile: T(4, 4) }) }]);
  ok('#256 excludes raid pairs', c.n === 0);
}
{
  const ch = lib.aggregateTiles([
    { death: { day: 1, vid: 'a' }, fight: row({ channel: 'wild', monsterTile: T(7, 2), scholarTile: T(8, 8) }) },
    { death: { day: 2, vid: 'b' }, fight: row({ channel: 'raid', monsterTile: T(4, 4), scholarTile: T(4, 4) }) },
  ]);
  ok('aggregateTiles wild: 1n, wildTile 1, scholarAway 1',
    ch.wild.n === 1 && ch.wild.wildTile === 1 && ch.wild.scholarAway === 1);
  ok('aggregateTiles raid: 1n, onHavenTile 1, scholarHome 1',
    ch.raid.n === 1 && ch.raid.onHavenTile === 1 && ch.raid.scholarHome === 1);
}

// ================= GREEN: driver fingerprint is stable =================
{
  const wt = require('./wildtile-20261015');
  ok('driver exports runSeed', typeof wt.runSeed === 'function');
  ok('driver exports fingerprint', typeof wt.fingerprint === 'function');
  const r = { seed: 11, days: 100, endReason: 'done', maxUnlocked: 5, unlockDay5: 90,
    postUnlockVillagerCombatDeaths: 2, pairs: 2, unmatched: 0, wildPairs: 1,
    wildAttributed: 1, wildAttributionRate: 1,
    answer256: { verdict: 'x' }, rows: [], unmatchedDeaths: [] };
  ok('fingerprint deterministic on fixed input', wt.fingerprint(r) === wt.fingerprint(JSON.parse(JSON.stringify(r))));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
