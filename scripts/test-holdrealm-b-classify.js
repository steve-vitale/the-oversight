// test-holdrealm-b-classify.js — the dissolution classifier
// (scripts/analyze-holdrealm-b.js) names a mechanism for every dissolution
// and never invents one for a realm that held or a village that simply fell.
//
// sim-holdrealm-b, 2026-11-14. Run: node scripts/test-holdrealm-b-classify.js
'use strict';
const { classifyOne, deepDive, reclimb } = require('./analyze-holdrealm-b');

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('ok: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

// Minimal per-seed fixture: `links` is [{other, trustByDay: {day: trust}}];
// `lines` is [{day, line}]; `deaths` is [{day, who, cause}].
function fixture(o) {
  const d = { seed: o.seed || 'T1', endReason: o.endReason || 'survived', days: o.days || 150,
    maxWave: 5, standing: 300, series: [], linkLines: o.lines || [], deaths: o.deaths || [],
    verbEvents: o.verbs || [] };
  const days = o.days || 150;
  for (let day = 1; day <= days; day++) {
    const scale = day < (o.nationalDay || 62) ? 'regional' : (o.dissolutionDay && day >= o.dissolutionDay ? 'regional' : 'national');
    const roll = (o.links || []).map((l, i) => {
      const t = l.trustByDay[day] != null ? l.trustByDay[day] : (l.trust == null ? 50 : l.trust);
      return { id: 'link_' + i, o: l.other, k: 'link', p: 'haven', sub: l.other, st: l.status || 'active',
        t: t, f: 10, age: day - 10, cq: 0, ar: 0, tw: null, pd: null, pr: 0, se: t >= 40 ? 1 : 0, rp: 1 };
    });
    const nSeas = roll.filter(l => l.st === 'active' && l.se).length;
    d.series.push({ d: day, scale: scale, nSeasoned: nSeas, nActive: roll.filter(l => l.st === 'active').length,
      polity: nSeas >= 3 ? { shape: 'lead', size: 4, led: true } : null,
      pendingNational: null, pendingCounter: null, pendingAccord: null,
      pendingGlobal: scale === 'national' ? { day: o.nationalDay || 62 } : null,
      nationalLive: scale === 'national', pop: 8, pantry: 30000, feasts: 0, linksRoll: roll });
  }
  return d;
}
function flatTrust(other, days, trust) {
  const m = {}; for (const day of days) m[day] = trust; return { other: other, trustByDay: m };
}

// 1. Speaker death on the dissolution day -> speaker-death (the 100203 shape).
(function () {
  const d = fixture({ seed: 'T-spk', nationalDay: 62, dissolutionDay: 90, links: [
    { other: 'village_0', trustByDay: { 88: 49, 89: 44, 90: 36 } },
    { other: 'village_1', trustByDay: { 88: 49, 89: 49, 90: 41 } },
    { other: 'village_2', trustByDay: { 88: 41, 89: 41, 90: 33 } },
  ], lines: [
    { day: 89, line: '🕯️ Arjun is dead — and the dead hold no treaties. Every link Haven has shakes.' },
    { day: 89, line: '◈ The realm came apart — no polity answers to Haven now, and Haven is a free fire again. National no longer describes this village. The climb starts over.' },
  ], deaths: [{ day: 89, who: 'arjun', cause: 'the wild' }] });
  const c = classifyOne('T-spk', d);
  t('speaker-death: dissolved', c.dissolved === true);
  t('speaker-death: dissolution day 90', c.dissolutionDay === 90, 'got ' + c.dissolutionDay);
  t('speaker-death: mechanism speaker-death', c.mechanism === 'speaker-death', 'got ' + c.mechanism);
  t('speaker-death: dissolution line captured', c.dissolutionLines.length === 1);
  const dd = deepDive('T-spk', d, c);
  t('speaker-death: trigger speaker-death-verified', dd.trigger === 'speaker-death-verified', 'got ' + dd.trigger);
})();

// 2. Slow trust slide, no death -> trust-slide (the 100211 shape, minus the
// haircut: a single link crossing on its own).
(function () {
  const d = fixture({ seed: 'T-slide', nationalDay: 63, dissolutionDay: 107, links: [
    { other: 'village_1', trustByDay: { 105: 72, 106: 69, 107: 69 } },
    { other: 'village_2', trustByDay: { 105: 47, 106: 40, 107: 40 } },
    { other: 'village_spl', trustByDay: { 105: 43, 106: 36, 107: 36 } },
    { other: 'village_0', trustByDay: { 105: 28, 106: 21, 107: 21 } },
  ], lines: [] });
  const c = classifyOne('T-slide', d);
  t('trust-slide: mechanism trust-slide', c.mechanism === 'trust-slide', 'got ' + c.mechanism);
  const dd = deepDive('T-slide', d, c);
  t('trust-slide: trigger slow-erosion (no simultaneous haircut)', dd.trigger === 'slow-erosion', 'got ' + dd.trigger);
})();

// 3. Simultaneous -8 drops on 2+ links + a death that day -> probable-succession
// (the 100206 shape; funeral lines uncaptured).
(function () {
  const d = fixture({ seed: 'T-succ', nationalDay: 62, dissolutionDay: 134, links: [
    { other: 'village_1', trustByDay: { 132: 47, 133: 39, 134: 39 } },
    { other: 'village_2', trustByDay: { 132: 56, 133: 48, 134: 43 } },
    { other: 'village_3', trustByDay: { 132: 46, 133: 38, 134: 33 } },
  ], lines: [], deaths: [{ day: 133, who: 'aroha_ngata', cause: 'the wild' }] });
  const c = classifyOne('T-succ', d);
  t('probable-succession: mechanism trust-slide (proximate)', c.mechanism === 'trust-slide', 'got ' + c.mechanism);
  const dd = deepDive('T-succ', d, c);
  t('probable-succession: trigger probable-succession', dd.trigger === 'probable-succession', 'got ' + dd.trigger);
})();

// 4. NEGATIVE: a realm that held to the end never classifies as dissolved.
(function () {
  const d = fixture({ seed: 'T-held', nationalDay: 62, dissolutionDay: null, links: [
    flatTrust('village_0', [150], 60), flatTrust('village_1', [150], 55), flatTrust('village_2', [150], 50),
  ] });
  const c = classifyOne('T-held', d);
  t('held realm: dissolved false', c.dissolved === false);
  t('held realm: no mechanism assigned', c.mechanism === undefined, 'got ' + c.mechanism);
})();

// 5. NEGATIVE: a village that falls the same day its scale drops, with no
// trust crossing and no death line, must NOT be misread as a trust-slide.
(function () {
  const d = fixture({ seed: 'T-fall', nationalDay: 62, dissolutionDay: 105, endReason: 'village-lost', days: 105, links: [
    flatTrust('village_0', [104, 105], 55), flatTrust('village_1', [104, 105], 50), flatTrust('village_2', [104, 105], 48),
  ], lines: [] });
  const c = classifyOne('T-fall', d);
  t('village-fall: dissolved (scale did drop)', c.dissolved === true);
  t('village-fall: NOT trust-slide without a crossing', c.mechanism !== 'trust-slide', 'got ' + c.mechanism);
  t('village-fall: UNCLASSIFIED, not invented', c.mechanism === 'UNCLASSIFIED', 'got ' + c.mechanism);
})();

// 6. Re-climb blockers: trust-below-bar names the missing trust; a seed that
// climbed back reports none-reclimbed.
(function () {
  const down = fixture({ seed: 'T-down', nationalDay: 62, dissolutionDay: 90, links: [
    { other: 'village_0', trustByDay: { 90: 36, 150: 21 } },
    { other: 'village_1', trustByDay: { 90: 41, 150: 39 } },
    { other: 'village_2', trustByDay: { 90: 33, 150: 22 } },
  ] });
  const r = reclimb('T-down', down);
  t('re-climb blocker: trust-below-bar', r.blocker === 'trust-below-bar', 'got ' + r.blocker);
  t('re-climb blocker: names the short links', r.blockerDetail.indexOf('village_0') !== -1 && r.blockerDetail.indexOf('village_2') !== -1);
  t('re-climb blocker: states the horizon left', r.blockerDetail.indexOf('60 days') !== -1, r.blockerDetail);
})();

console.log(`\ntest-holdrealm-b-classify: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
