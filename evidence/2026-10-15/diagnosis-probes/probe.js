// Diagnosis probe (2026-10-15). Run from the repo root, one process at a time:
//   SEED=42 DAYS=100 OUT=/tmp/p.json HOOK=$PWD/evidence/2026-10-15/diagnosis-probes/hook2.js node evidence/2026-10-15/diagnosis-probes/probe.js
// Observe-only: wraps gainTrackXP / creditDeed / tele and a few player verbs; never changes a decision.
// Writes only to OUT (never into the repo).
// probe: tally track XP by (player/villager, track, why), creditDeed calls, refusals by cap,
// player calls to cook/craft/heal functions, skill_lesson, ability grants.
'use strict';
const ROOT = process.env.ROOT || require('path').join(__dirname, '../../..');
const path = require('path');
const harness = require(path.join(ROOT, 'scripts/sim-harness'));
const T = { xp: {}, deed: {}, capped: {}, calls: {}, lessons: [], offers: {}, granted: {}, deathFeeds: {}, levels: {}, mantle: 0 };
const inc = (o, k, n) => { o[k] = (o[k] || 0) + (n == null ? 1 : n); };
const _lg = harness.loadGame;
harness.loadGame = async function () {
  const r = await _lg.apply(this, arguments);
  const G = r.Game;
  global.__G = G;
  const isP = (w) => w === 'player' || w === G.villagerId;
  const _g = G.gainTrackXP;
  G.gainTrackXP = function (who, track, n, why) {
    const out = _g.apply(this, arguments);
    inc(T.xp, (isP(who) ? 'P ' : 'V ') + track + ' ' + why, n || 0);
    return out;
  };
  const _c = G.creditDeed;
  G.creditDeed = function (who, deed, tr) {
    const k = (isP(who) ? 'P ' : 'V ') + deed;
    const out = _c.apply(this, arguments);
    inc(T.deed, k);
    if (!out) inc(T.capped, k);
    return out;
  };
  for (const fn of (process.env.FNS || 'cookFood,cookAll,craft,treatVillager,teachPlant,chooseAbility,teachSkillLesson').split(',')) {
    if (typeof G[fn] !== 'function') { inc(T.calls, fn + ' (missing)'); continue; }
    const f = G[fn];
    G[fn] = function () { inc(T.calls, fn); const o = f.apply(this, arguments); if (o) inc(T.calls, fn + ' ok'); return o; };
  }
  const _t = G.tele;
  G.tele = function (type, d) {
    d = d || {};
    try {
      if (type === 'skill_lesson') T.lessons.push(d);
      if (type === 'track_level') inc(T.levels, (d.who === 'player' ? 'P ' : 'V ') + d.track);
      if (type === 'ability_granted') inc(T.granted, (d.who || '?') + ' ' + d.id + ' ' + (d.src || d.source || d.via || ''));
      if (type === 'death') inc(T.deathFeeds, d.player ? 'player' : (d.kind || 'other'));
      if (type === 'mantle_become') T.mantle++;
    } catch (e) { console.warn(e.message); }
    return _t.apply(this, arguments);
  };
  if (process.env.HOOK) require(process.env.HOOK)(G, T, inc);
  return r;
};
(async () => {
  const { runComparison } = require(path.join(ROOT, 'scripts/sweep-compare'));
  const seed = parseInt(process.env.SEED || '7', 10);
  const rep = await runComparison({ label: 'probe', seeds: [seed], policies: ['capable'], days: parseInt(process.env.DAYS || '60', 10),
    extraMetrics: (Game) => { T.final = { day: Game.state.scholar.day, tracks: Game.state.scholar.tracks, abil: (Game.state.scholar.abilities || []).map(a => a.id), fusion: Game.state.fusionReactorHolder }; return {}; } });
  T.run = { days: rep.runs[0].days, end: rep.runs[0].endReason };
  const sortObj = (o) => Object.fromEntries(Object.entries(o).sort());
  for (const k of ['xp', 'deed', 'capped', 'calls', 'levels', 'granted', 'deathFeeds']) T[k] = sortObj(T[k]);
  T.lessonCount = T.lessons.length; T.lessons = T.lessons.slice(0, 5);
  require('fs').writeFileSync(process.env.OUT, JSON.stringify(T, null, 1));
  console.log('done', JSON.stringify(T.run));
})();
