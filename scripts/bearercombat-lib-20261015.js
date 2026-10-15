'use strict';
// bearercombat-lib-20261015.js — bearer combat-death census, pure classifier.
//
// INSTRUMENT-ONLY: every function here READS persisted run records and returns
// plain data. No game access, no Math.random, no Date.now(). The sampler
// (scripts/sweep-bearercombat-20261015.js) enriches each death read-only at
// death time; this lib only interprets the persisted fields, so the proof
// test (scripts/test-bearercombat-20261015.js) can pin every bucket on
// fixtures without a live Game.
//
// Reuses the inherited conventions:
//   - SC.isBearerDeath / SC.bearerDeaths / SC.attributeChains (succhain-lib)
//     for the bearer <redacted> and the young-national window / national detection.
//   - HL.classifyDeathFamily (holdloss-lib) for the combat|monster family gate.
//
// ATTRIBUTION DEFINITION (the pre-registered 90% GO bar): a bearer combat
// death is ATTRIBUTED when the instrument names all three of:
//   (1) fightType — turn-based | contest | hunt | expedition | field-damage
//   (2) tileClass — haven | wild | arena-contest
//   (3) killerClass — a monster wave (1-5) or a named non-wave class:
//       'contest-opponent', 'prey', 'expedition'.
// 'unknown' in ANY slot counts AGAINST the bar; the full trail is kept on the
// record. The denominator is bearer deaths with family combat|monster
// (holdloss convention) on runs that reach national at least once — the wall
// question is the hold, not the climb.
//
// KILLER-CLASS for the breakdown: `${wave?'w'+wave:killerClass} x ${tile} x ${fightType}`.

const HL = require('./holdloss-lib-20261015');
const SC = require('./succhain-lib-20261015');

const COMBAT_FAMILIES = { combat: true, monster: true };

// ---------------------------------------------------------------------------
// 1. denominator
// ---------------------------------------------------------------------------

// censusDeaths(rec): bearer deaths in the combat|monster family, day order.
// These are the only deaths the attribution bar is computed over. PLUS the
// hunt blind spot: holdloss's classifier does not name hunt causes ('the
// turkey' -> null), but a hunt death IS a combat death the instrument can
// attribute — so fightType 'hunt' joins the denominator explicitly. This is
// a rule of THIS instrument, documented here, not a change to the inherited
// lib (which stays untouched).
// NOTE: SC.bearerDeaths maps to a reduced shape that DROPS the sampler's
// ctx — so censusDeaths filters rec.deaths itself (same isBearerDeath gate,
// same classifyDeathFamily mapping) to keep ctx on every death.
function censusDeaths(rec) {
  const all = ((rec || {}).deaths || [])
    .filter(SC.isBearerDeath)
    .map(d => {
      const f = HL.classifyDeathFamily(d.cause);
      const c = Object.assign({}, d);
      c.family = f.family || 'other-named';
      c.rawCause = f.raw;
      return c;
    })
    .sort((a, b) => (a.day || 0) - (b.day || 0));
  return all.filter(d =>
    COMBAT_FAMILIES[d.family] || (d.ctx && d.ctx.fightType === 'hunt'));
}

// ---------------------------------------------------------------------------
// 2. per-death attribution
// ---------------------------------------------------------------------------

function num(x, d) { const n = Number(x); return Number.isFinite(n) ? n : (d == null ? 0 : d); }

// rank7d(rec, day): polity rank on the first daily scaleRow at/after day+7,
// falling back to the last row. null when no rows.
function rank7d(rec, day) {
  const rows = (rec || {}).scaleRows || [];
  if (!rows.length) return null;
  const hit = rows.find(r => num(r.day, -1) >= day + 7);
  return (hit || rows[rows.length - 1]).rank || null;
}

// daysToNextBearer(rec, day): days until the next bearer <redacted> (any family), null if none.
function daysToNextBearer(rec, day) {
  const all = SC.bearerDeaths(rec);
  const nx = all.find(d => num(d.day, -1) > day);
  return nx ? num(nx.day, 0) - day : null;
}

// attributeDeath(rec, d): the attribution packet for one census death.
// d is the SC.bearerDeaths shape PLUS the sampler's persisted ctx (d.ctx).
function attributeDeath(rec, d) {
  const ctx = (d && d.ctx) || {};
  const fightType = ctx.fightType || 'unknown';
  const tile = ctx.tileClass || 'unknown';
  const killerWave = ctx.killerWave != null ? num(ctx.killerWave, null) : null;
  const killerClass = ctx.killerClass || (killerWave ? 'w' + killerWave : 'unknown');
  const fightNamed = fightType !== 'unknown';
  const tileNamed = tile !== 'unknown';
  const killerNamed = killerClass !== 'unknown';
  const attributed = fightNamed && tileNamed && killerNamed;

  const ses = ctx.session || null;
  return {
    day: num(d.day, 0), name: String(d.name || '?'),
    cause: String(d.cause || '?'), family: d.family,
    attributed,
    fightType, tile,
    killerWave, killerClass,
    killerName: ctx.killerName || null,
    nOpponents: ctx.nOpponents != null ? num(ctx.nOpponents, 0) : null,
    opponentWaves: Array.isArray(ctx.opponentWaves) ? ctx.opponentWaves.slice() : [],
    entryHp: ses && ses.entryHp != null ? num(ses.entryHp, null) : null,
    entryMaxHp: ses && ses.entryMaxHp != null ? num(ses.entryMaxHp, null) : null,
    entryArmorP: ses && ses.entryArmorP != null ? num(ses.entryArmorP, null) : null,
    armorPAtDeath: ctx.armorPAtDeath != null ? num(ctx.armorPAtDeath, null) : null,
    counterKnown: ses && ses.counterKnown != null ? !!ses.counterKnown : null,
    hitsTaken: ses && ses.hitsTaken != null ? num(ses.hitsTaken, 0) : null,
    dmgTaken: ses && ses.dmgTaken != null ? num(ses.dmgTaken, 0) : null,
    fightResult: ses ? (ses.result || null) : null,
    veteran: ses ? !!ses.veteran : null,
    rank7d: rank7d(rec, num(d.day, 0)),
    daysToNextBearer: daysToNextBearer(rec, num(d.day, 0)),
    trail: ctx.trail || null,
  };
}

// ---------------------------------------------------------------------------
// 3. run census
// ---------------------------------------------------------------------------

function killerClassKey(a) {
  const w = a.killerWave != null ? 'w' + a.killerWave : a.killerClass;
  return `${w} x ${a.tile} x ${a.fightType}`;
}

// census(rec): the bearer combat-death census for one run.
// Pre-condition (enforced by the caller/sweep): rec reached national at least
// once. Returns the attribution packet the 90% bar is computed over.
function census(rec) {
  const deaths = censusDeaths(rec).map(d => attributeDeath(rec, d));
  const attributed = deaths.filter(a => a.attributed);
  const byKiller = {};
  for (const a of deaths) {
    const k = killerClassKey(a);
    byKiller[k] = byKiller[k] || { key: k, n: 0, attributed: 0, days: [] };
    byKiller[k].n++;
    if (a.attributed) byKiller[k].attributed++;
    byKiller[k].days.push(a.day);
  }
  const byKillerArr = Object.values(byKiller).sort((x, y) => y.n - x.n);
  return {
    nDeaths: deaths.length,
    nAttributed: attributed.length,
    attribShare: deaths.length ? attributed.length / deaths.length : null,
    deaths,
    byKillerClass: byKillerArr,
    topKillerClass: byKillerArr.length ? byKillerArr[0].key : null,
  };
}

// deathNarrative(rec, a): the death in plain words — a first-class deliverable
// under the SENSE-TESTING LAW (read, not counted).
function deathNarrative(rec, a) {
  const beats = ((rec || {}).beats || [])
    .filter(b => Math.abs(num(b.day, -1) - a.day) <= 3)
    .map(b => `d${b.day}: ${String(b.text || '').slice(0, 140)}`);
  const lines = [];
  lines.push(`${a.name} died d${a.day} — cause '${a.cause}' (${a.family}).`);
  lines.push(`  fight: ${a.fightType} @ ${a.tile}; killer: ${a.killerName || a.killerClass}${a.killerWave != null ? ` (wave ${a.killerWave})` : ''}${a.nOpponents > 1 ? ` +${a.nOpponents - 1} more` : ''}.`);
  if (a.entryHp != null) {
    lines.push(`  entered the fight at ${a.entryHp}/${a.entryMaxHp != null ? a.entryMaxHp : '?'} HP, armor P ${a.entryArmorP != null ? a.entryArmorP : '?'}${a.counterKnown != null ? `, counter ${a.counterKnown ? 'KNOWN' : 'unknown'}` : ''}; took ${a.hitsTaken != null ? a.hitsTaken : '?'} hits for ${a.dmgTaken != null ? a.dmgTaken : '?'} dmg${a.veteran ? ' (VETERAN)' : ''}.`);
  } else if (a.armorPAtDeath != null) {
    lines.push(`  no TB session (died off-turn-based path); armor P at death ${a.armorPAtDeath}.`);
  }
  lines.push(`  rank 7d after: ${a.rank7d || 'n/a'}; days to next bearer <redacted> ${a.daysToNextBearer != null ? a.daysToNextBearer : 'n/a'}${a.attributed ? '' : '  [UNATTRIBUTED — trail: ' + (a.trail || 'none') + ']'}.`);
  if (beats.length) lines.push('  nearby beats:\n    ' + beats.join('\n    '));
  return lines.join('\n');
}

module.exports = {
  censusDeaths, attributeDeath, census, deathNarrative,
  rank7d, daysToNextBearer, COMBAT_FAMILIES,
};
