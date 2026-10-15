'use strict';
// test-bearercombat-20261015.js — proof for the bearer combat-death census.
// REAL-RED: a naive cause-string-only attributer must demonstrably misfire
// on the fixtures (wave unnamed; arena mis-tiled as wild). GREEN: the real
// instrument (bearercombat-lib on sampler-enriched fixtures) attributes
// correctly across tile classes, excludes non-combat deaths from the
// denominator, and counts context-less deaths AGAINST the bar. Closes with
// trajectory-neutrality: instrument ON vs OFF byte-identical on a real sim.
process.env.FEASTSCALE_R13 = '1'; // set BEFORE requiring the sweep module

const assert = require('assert');
const BC = require('./bearercombat-lib-20261015');
const HL = require('./holdloss-lib-20261015');

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// --- the naive attributer: cause-string only, the pre-instrument world ---
function naiveAttribute(d) {
  const c = String(d.cause || '').toLowerCase();
  return {
    wave: null,                       // cause strings never name a wave
    tile: 'wild',                     // naive guess: playerAtHaven unseen
    fightType: /combat/.test(c) ? 'turn-based' : 'unknown',
  };
}

// --- fixtures: sampler-enriched deaths as sweep-bearercombat persists them ---
function mkRec(deaths) {
  return {
    scaleRows: [
      { day: 0, rank: 'village' }, { day: 40, rank: 'regional' },
      { day: 80, rank: 'national' }, { day: 120, rank: 'national' }, { day: 160, rank: 'national' },
    ],
    beats: [],
    deaths,
  };
}
const mkD = (day, name, cause, player, ctx) => ({ day, name, cause, kind: 'villager', player: !!player, ctx: ctx || null });

const TB_W3 = mkD(95, 'Kai', 'combat', true, {
  fightType: 'turn-based', tileClass: 'wild', killerWave: 3, killerClass: 'w3',
  killerName: 'Highbeam Deer', nOpponents: 1, opponentWaves: [3], armorPAtDeath: 24,
  session: { seq: 0, day: 95, tileAtStart: 'wild', entryHp: 86, entryMaxHp: 120, entryArmorP: 24, counterKnown: true, hitsTaken: 5, dmgTaken: 90, result: 'lost', veteran: false, monsters: [{ id: 'highbeam_deer', name: 'Highbeam Deer', wave: 3 }] },
});
const TB_HAVEN_W1 = mkD(100, 'Zoe', 'combat', true, {
  fightType: 'turn-based', tileClass: 'haven', killerWave: 1, killerClass: 'w1',
  killerName: 'Hushwolf', nOpponents: 1, opponentWaves: [1], armorPAtDeath: 41,
  session: { seq: 3, day: 100, tileAtStart: 'haven', entryHp: 120, entryMaxHp: 120, entryArmorP: 41, counterKnown: false, hitsTaken: 9, dmgTaken: 118, result: 'lost', veteran: true, monsters: [{ id: 'hushwolf', name: 'Hushwolf', wave: 1, veteran: true }] },
});
const CONTEST = mkD(110, 'Devon', 'contest', true, {
  fightType: 'contest', tileClass: 'arena-contest', killerWave: null, killerClass: 'contest-opponent',
  killerName: 'Blood pit brute', nOpponents: 1, opponentWaves: [], armorPAtDeath: 30,
  session: null, trail: '{"challengeId":"blood_pit"}',
});
const HUNT = mkD(105, 'Ivy', 'the turkey', true, {
  fightType: 'hunt', tileClass: 'wild', killerWave: null, killerClass: 'prey',
  killerName: 'turkey', nOpponents: 0, opponentWaves: [], armorPAtDeath: 18, session: null,
});
const SICK = mkD(90, 'Mira', 'gutrot', true, { fightType: 'unknown', tileClass: 'haven', killerWave: null, killerClass: 'unknown', killerName: null, nOpponents: 0, opponentWaves: [], armorPAtDeath: 12, session: null });
const WILD_UNKNOWN = mkD(115, 'Aroha', 'the wild', true, {
  fightType: 'unknown', tileClass: 'unknown', killerWave: null, killerClass: 'unknown',
  killerName: null, nOpponents: 0, opponentWaves: [], armorPAtDeath: null, session: null, trail: 'cause=the wild',
});

console.log('REAL-RED: the naive cause-only attributer must misfire');
{
  const n1 = naiveAttribute(TB_W3);
  chk('naive cannot name the killer wave (cause "combat" carries no wave)', n1.wave == null);
  const n2 = naiveAttribute(CONTEST);
  chk('naive MIS-TILES an arena death as wild (its guess contradicts the ctx)', n2.tile === 'wild' && CONTEST.ctx.tileClass === 'arena-contest');
  chk('naive fightType for "contest" cause is unknown', naiveAttribute(CONTEST).fightType === 'unknown');
}

console.log('GREEN: the instrument attributes on enriched fixtures');
{
  const rec = mkRec([TB_W3, TB_HAVEN_W1, CONTEST, HUNT, SICK, WILD_UNKNOWN]);
  const cenDeaths = BC.censusDeaths(rec);
  chk('denominator = combat|monster family + hunt blind-spot rule (sickness excluded)',
    cenDeaths.length === 5 && cenDeaths.filter(d => d.family === 'combat').length === 4,
    'got ' + cenDeaths.length);

  const a = BC.attributeDeath(rec, TB_W3);
  chk('TB wild w3 attributed', a.attributed === true);
  chk('TB wild w3: wave/tile/fightType', a.killerWave === 3 && a.tile === 'wild' && a.fightType === 'turn-based');
  chk('TB wild w3: entry HP/armor/counter/hits/dmg',
    a.entryHp === 86 && a.entryMaxHp === 120 && a.entryArmorP === 24 && a.counterKnown === true && a.hitsTaken === 5 && a.dmgTaken === 90);
  chk('TB wild w3: rank 7d after = national', a.rank7d === 'national');
  chk('TB wild w3: days to next bearer death = 5 (Zoe d100)', a.daysToNextBearer === 5);

  const b = BC.attributeDeath(rec, TB_HAVEN_W1);
  chk('haven-breach w1 attributed (tile haven named)', b.attributed === true && b.tile === 'haven');
  chk('haven-breach: veteran + counter unknown carried', b.veteran === true && b.counterKnown === false);

  const c = BC.attributeDeath(rec, CONTEST);
  chk('contest death attributed (non-wave killer class named)', c.attributed === true && c.fightType === 'contest' && c.tile === 'arena-contest' && c.killerClass === 'contest-opponent');

  const h = BC.attributeDeath(rec, HUNT);
  chk('hunt death attributed (prey class named)', h.attributed === true && h.fightType === 'hunt' && h.killerClass === 'prey');

  const u = BC.attributeDeath(rec, WILD_UNKNOWN);
  chk('"the wild" with no TB context counts AGAINST the bar (not misattributed)',
    u.attributed === false && u.fightType === 'unknown' && u.trail === 'cause=the wild');

  const cen = BC.census(rec);
  chk('census: 5 deaths, 4 attributed -> share 0.8', cen.nDeaths === 5 && cen.nAttributed === 4 && Math.abs(cen.attribShare - 0.8) < 1e-9,
    `n=${cen.nDeaths} attr=${cen.nAttributed}`);
  chk('top killer class named', typeof cen.topKillerClass === 'string' && cen.topKillerClass.length > 0, cen.topKillerClass);

  const nar = BC.deathNarrative(rec, a);
  chk('narrative names the death in plain words', /Kai died d95/.test(nar) && /Highbeam Deer/.test(nar) && /wave 3/.test(nar));

  // the inherited family gate still behaves: 'the turkey' is NOT combat-family
  // (hunt blind spot in the inherited lib — documented, not silently merged)
  const hf = HL.classifyDeathFamily('the turkey');
  chk('inherited classifier: "the turkey" is other-named (hunt blind spot visible, not hidden)', hf.family == null);
}

console.log('GREEN: trajectory-neutrality (instrument ON vs OFF, real sim)');
(async () => {
  try {
    const SW = require('./sweep-bearercombat-20261015');
    const on = await SW.oneRun(11, 'leadfeast', 30, { instrument: true });
    const off = await SW.oneRun(11, 'leadfeast', 30, { instrument: false });
    chk('instrument ON vs OFF byte-identical 30d', on.row.trajHash === off.row.trajHash,
      'on=' + String(on.row.trajHash).slice(0, 12) + ' off=' + String(off.row.trajHash).slice(0, 12));
    chk('instrument ON collected TB sessions without crashing', on.rec.tbSessions.length >= 0 && on.row.nSamples >= 25);
  } catch (e) {
    fail++;
    console.log('  FAIL trajectory-neutrality threw — ' + (e && e.message));
  }
  console.log(fail ? `\nRESULT: FAIL (${fail} failures)` : `\nRESULT: GREEN (${pass} checks)`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL:', e && e.stack || e); process.exit(1); });
