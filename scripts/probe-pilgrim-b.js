// probe-pilgrim-b.js — DIAGNOSTIC ONLY (not a judged run, no corpus
// written). Why does the courtship pilgrimage never arrive within the
// 14-day stale window on seed 100604 (arm sim-courtship-b)?
// Wraps competent-courtship-b.daily with PURE reads only (scholar
// position, pilgrim target + coords, distance, tbfight, HP) before and
// after each daily() call, 200d, seed 100604. Prints a per-day trace
// for pilgrimage days plus the village table at day 1.
// Usage: node scripts/probe-pilgrim-b.js [seed] [days]
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { courtshipPolicy, resetCourtshipStats, courtshipStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-courtship-b'));

const SEED = parseInt(process.argv[2] || '100604', 10);
const DAYS = parseInt(process.argv[3] || '200', 10);

(async function () {
  resetCourtshipStats();
  const { Game } = await loadGame({ seed: SEED, mode: 'probe-pilgrim-b', fullTelemetry: false });
  const trace = [];
  let villages0 = null;
  const rec = Object.assign({}, courtshipPolicy, {
    daily: function (G, ctx) {
      const day = ((G.state || {}).scholar || {}).day || 0;
      if (!villages0) {
        villages0 = ((G.state || {}).otherVillages || []).map(function (v) {
          return { id: v.id, x: v.x, y: v.y, generated: !!v.generated, codex: !!v.codex, opinion: v.opinion | 0 };
        });
      }
      const before = { px: G.map.px, py: G.map.py, tbfight: !!G.tbfight, inCombat: false };
      try { before.inCombat = !!G.inCombat(); } catch (e) {}
      const pgBefore = ctx._pilgrim ? { vid: ctx._pilgrim.vid, day: ctx._pilgrim.day } : null;
      const ret = courtshipPolicy.daily(G, ctx);
      const after = { px: G.map.px, py: G.map.py, tbfight: !!G.tbfight, inCombat: false };
      try { after.inCombat = !!G.inCombat(); } catch (e) {}
      const pgAfter = ctx._pilgrim ? { vid: ctx._pilgrim.vid, day: ctx._pilgrim.day } : null;
      // Target coords + distance, pure reads only.
      let tgt = null;
      const vid = (pgBefore && pgBefore.vid) || (pgAfter && pgAfter.vid);
      if (vid) {
        const tv = ((G.state || {}).otherVillages || []).find(function (v) { return v && v.id === vid; });
        if (tv) {
          tgt = { vid: vid, x: tv.x, y: tv.y, generated: !!tv.generated, codex: !!tv.codex,
            distBefore: Math.abs(tv.x - before.px) + Math.abs(tv.y - before.py),
            distAfter: Math.abs(tv.x - after.px) + Math.abs(tv.y - after.py) };
        }
      }
      if (pgBefore || pgAfter || ctx._returning) {
        trace.push({ day: day, before: before, after: after, pgBefore: pgBefore, pgAfter: pgAfter,
          returning: !!ctx._returning, tgt: tgt,
          hp: ((G.state || {}).scholar || {}).health });
      }
      return ret;
    },
  });
  await setupGame(Game);
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, rec, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  });
  console.log('VILLAGES day1: ' + JSON.stringify(villages0));
  console.log('DAYS ' + result.days + ' end ' + result.endReason + ' stats ' + JSON.stringify({ pilgrimages: courtshipStats().pilgrimages, pilgrimDays: courtshipStats().pilgrimDays, studies: courtshipStats().studies, aids: courtshipStats().aids }));
  // Summarize: per pilgrimage attempt, day range, start/end dist, min dist reached, net movement.
  const attempts = [];
  let cur = null;
  for (const t of trace) {
    if (t.pgBefore && (!cur || cur.vid !== t.pgBefore.vid || cur.startDay !== t.pgBefore.day)) {
      cur = { vid: t.pgBefore.vid, startDay: t.pgBefore.day, days: [], dists: [], positions: [] };
      attempts.push(cur);
    }
    if (cur) {
      cur.days.push(t.day);
      if (t.tgt) cur.dists.push(t.tgt.distAfter);
      cur.positions.push([t.after.px, t.after.py]);
    }
    if (!t.pgAfter && cur && t.day > cur.startDay) { cur.endDay = t.day; cur = null; }
  }
  for (const a of attempts) {
    const uniqPos = [];
    for (const p of a.positions) { const k = p.join(','); if (uniqPos.indexOf(k) < 0) uniqPos.push(k); }
    console.log('ATTEMPT ' + a.vid + ' start d' + a.startDay + ' traced-days ' + a.days.length +
      ' distFirst ' + (a.dists[0] != null ? a.dists[0] : '?') +
      ' distMin ' + (a.dists.length ? Math.min.apply(null, a.dists) : '?') +
      ' distLast ' + (a.dists.length ? a.dists[a.dists.length - 1] : '?') +
      ' distinctPositions ' + uniqPos.length + ' ' + JSON.stringify(uniqPos.slice(0, 20)));
  }
  // Raw trace for the stalled attempts (village_0 + village_spl_24_39244).
  for (const t of trace) {
    if (t.tgt && (t.tgt.vid === 'village_0' || t.tgt.vid === 'village_spl_24_39244')) {
      console.log('TRACE d' + t.day + ' ' + t.tgt.vid + ' pos ' + t.before.px + ',' + t.before.py + '->' + t.after.px + ',' + t.after.py +
        ' dist ' + t.tgt.distBefore + '->' + t.tgt.distAfter + ' pgStart d' + (t.pgBefore ? t.pgBefore.day : '-') +
        ' fight ' + t.before.tbfight + '->' + t.after.tbfight + ' returning ' + t.returning);
    }
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
