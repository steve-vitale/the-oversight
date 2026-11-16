// analyze-tricklearn-b.js — analyzer for arm sim-tricklearn-b (DIAG,
// tracker blank #2 — trick learning: is there ANY path that teaches
// a wave-4 trick fast enough for a 7-day trick-wait to matter?).
// Builds the (a)-(e) tables from the prereg (frozen in
// evidence/2026-11-16/sim-tricklearn-b-prereg.md) from the main leg,
// cross-checks the replication leg (trajectories + trick rows
// identical), classifies every wait-window episode, and prints the
// observation table + observations-to-learn distribution +
// trick-known rates + episode table + TrickAfter table + per-seed
// table + wall numbers for both legs. Writes
// evidence/2026-11-16/tricklearn-b-analysis.json. Exits non-zero on
// any bar failure.
//   Bar 3 (neutrality) reads the determinism stamp written by the
//   proof test (evidence/2026-11-16/tricklearn-b-determinism.json)
//   and the §15 panel compare (evidence/2026-11-16/tricklearn-b-panel.json).
//   Bar 4 (proof green) reads the proof stamp
//   (evidence/2026-11-16/tricklearn-b-proof.json).
// Usage:
//   node scripts/analyze-tricklearn-b.js [--main evidence/2026-11-16/perseed-tricklearn-b-main]
//     [--repl evidence/2026-11-16/perseed-tricklearn-b-replication]
//     [--out evidence/2026-11-16/tricklearn-b-analysis.json]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const MAIN_DIR = path.join(REPO, argvVal('--main', 'evidence/2026-11-16/perseed-tricklearn-b-main'));
const REPL_DIR = path.join(REPO, argvVal('--repl', 'evidence/2026-11-16/perseed-tricklearn-b-replication'));
const OUT_FILE = path.join(REPO, argvVal('--out', 'evidence/2026-11-16/tricklearn-b-analysis.json'));
const KILLFAIL = require(path.join(REPO, 'scripts', 'analyze-killfail-a.js'));

const W3 = ['ad_break', 'buffering', 'callback', 'chorus_line', 'focus_group', 'gavel', 'redactor', 'spool', 'terms_of_service'];
const W4 = KILLFAIL.W4;
const W5 = KILLFAIL.W5;
const W345 = new Set(W3.concat(W4, W5));
const W45 = new Set(W4.concat(W5));
const SEEDS = [102141, 102142, 102143, 102144, 102145, 102146, 102147, 102148];

function median(nums) {
  const a = nums.filter(function (n) { return typeof n === 'number' && isFinite(n); }).sort(function (x, y) { return x - y; });
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
function isNum(x) { return typeof x === 'number' && isFinite(x); }

// ---- observation classification (frozen taxonomy) ----
// Every event gets exactly one source; zero unclassified.
// Required fields: day, mid, wave, source, obsBefore, obsAfter,
// knownBefore, knownAfter, ret, caller. vid is required for the
// three observation sources and is null by design on taught rows
// (discoverMonsterCounter takes no villager). A discover row whose
// via is not 'taught' classifies 'other' (must not happen for
// waves 3-5) and fails bar 2.
const NAMED_SOURCES = ['fight-observed', 'scholar-observed', 'node-witnessed', 'taught'];
function classifyObservation(ev) {
  const missing = [];
  if (!ev || typeof ev !== 'object') return { source: 'other', valid: false, missing: ['not-an-object'] };
  for (const k of ['day', 'mid', 'wave', 'source', 'obsBefore', 'obsAfter', 'knownBefore', 'knownAfter', 'ret', 'caller']) {
    if (ev[k] === undefined || ev[k] === null) missing.push(k);
  }
  if (ev.source !== 'taught' && (ev.source || '').indexOf('discover:') !== 0) {
    if (ev.vid === undefined || ev.vid === null) missing.push('vid');
  }
  let source = ev.source || 'other';
  if ((source || '').indexOf('discover:') === 0) source = 'other';
  if (NAMED_SOURCES.indexOf(source) === -1) source = 'other';
  return { source: source, valid: missing.length === 0 && NAMED_SOURCES.indexOf(source) !== -1, missing: missing };
}
// A progressing observation is one that actually moved the shared
// bar (obsAfter > obsBefore). Early-return calls (already known,
// no trick for the species) record obsAfter === obsBefore and do
// not count toward the threshold-2 bar.
function isProgressing(ev) { return isNum(ev.obsAfter) && isNum(ev.obsBefore) && ev.obsAfter > ev.obsBefore; }

// ---- observations-to-learn ----
// Count of progressing observation events for a species from run
// start to its learn day (inclusive). Expected 2 by the threshold-2
// rule; the distribution is the measurement.
function observationsToLearn(events, mid, learnDay) {
  let n = 0;
  for (const ev of events) {
    if (ev.mid === mid && ev.day <= learnDay && isProgressing(ev)) n++;
  }
  return n;
}

// ---- trick-hold (frozen rule) ----
// A wave-4+ gate row with result null AND stage hunt/standing AND
// isTarget AND partyOk AND trickKnown false. isTarget =
// (targetWave != null && wave == targetWave) || (planTarget == mid)
// || (stage == 'standing' && wave >= 3). targetWave = needWave ||
// planNeedWave. partyOk = partySize >= 2 && allArmed && (wave >= 4
// ? (partySize >= 3 && allArmored) : holder armored) — gate rows
// here are wave 4/5 only, so the wave>=4 branch always applies.
function isTrickHold(row) {
  if (!row || row.wave < 4) return false;
  if (row.result !== 'null') return false;
  if (row.trickKnown !== false) return false;
  const stage = row.planStage || null;
  if (stage !== 'hunt' && stage !== 'standing') return false;
  const targetWave = (row.needWave != null ? row.needWave : row.planNeedWave);
  const isTarget = (targetWave != null && row.wave === targetWave) ||
    (row.planTarget && row.planTarget === row.mid) ||
    (stage === 'standing' && row.wave >= 3);
  if (!isTarget) return false;
  const partyOk = (row.partySize >= 2) && !!row.allArmed &&
    (row.partySize >= 3 && !!row.allArmored);
  return !!partyOk;
}

// ---- wait-window episodes ----
// One episode per (seed, species): opens on the FIRST trick-hold
// gate row for that species; window [D, D+7] inclusive. Outcome:
// 'learned' if the species is known on any daily trick census day
// <= D+7; 'expired' if the village is still alive at the window
// close (a census row exists on/after D+7) and the species is still
// unknown at the first such row; 'village-lost' if no census row
// exists on/after D+7. (The census is sparse — some days have no
// row — so the window-close read is the first census day >= D+7,
// not a literal D+7 row; the prereg's village-lost case is the
// no-census-after-D+7 case.) A second episode for the same species
// opens only after the first closes AND a new trick-hold row occurs.
function buildEpisodes(j) {
  const census = (j.trickCensus || []).slice().sort(function (a, b) { return a.day - b.day; });
  const holds = (j.v4gates || []).filter(isTrickHold).sort(function (a, b) { return (a.day - b.day) || (a.mid < b.mid ? -1 : 1); });
  const events = (j.trickObservations || []).filter(function (ev) { return W45.has(ev.mid); });
  const fights = (j.killfailFights || []).filter(function (f) { return W45.has(f.mid); });
  const launches = (j.rumorplanLaunches || []).filter(function (r) { return r.targetAfter && W45.has(r.targetAfter); });
  const gates = (j.v4gates || []).filter(function (g) { return W45.has(g.mid); });
  const open = {};
  const episodes = [];
  function closeEpisode(ep) {
    let learned = false;
    for (const c of census) {
      if (c.day > ep.day + 7) break;
      if ((c.tricks || []).indexOf(ep.species) !== -1) { learned = true; break; }
    }
    if (learned) { ep.outcome = 'learned'; return; }
    let closeRow = null;
    for (const c of census) { if (c.day >= ep.day + 7) { closeRow = c; break; } }
    if (closeRow) ep.outcome = 'expired';
    else ep.outcome = 'village-lost';
    ep.closeCensusDay = closeRow ? closeRow.day : null;
  }
  for (const h of holds) {
    const key = h.mid;
    const cur = open[key];
    if (cur && h.day <= cur.day + 7) continue; // inside an open window: no new episode
    if (cur) { closeEpisode(cur); episodes.push(cur); delete open[key]; }
    const ep = { seed: j.seed, species: h.mid, wave: h.wave, day: h.day, holdDay: h.day,
      outcome: null, closeCensusDay: null,
      observations: 0, fights: 0, launches: 0, gateRows: 0 };
    for (const ev of events) if (ev.mid === h.mid && ev.day >= h.day && ev.day <= h.day + 7) ep.observations++;
    for (const f of fights) if (f.mid === h.mid && f.day >= h.day && f.day <= h.day + 7) ep.fights++;
    for (const l of launches) if (l.targetAfter === h.mid && l.day >= h.day && l.day <= h.day + 7) ep.launches++;
    for (const g of gates) if (g.mid === h.mid && g.day >= h.day && g.day <= h.day + 7) ep.gateRows++;
    open[key] = ep;
  }
  for (const key of Object.keys(open)) { closeEpisode(open[key]); episodes.push(open[key]); }
  episodes.sort(function (a, b) { return (a.day - b.day) || (a.species < b.species ? -1 : 1); });
  return episodes;
}

// ---- learns from the daily census ----
// First day each wave-3/4/5 species appears in tricks[]. Matched
// to its observation trail: progressing events to the learn day
// must number >= 2 with one event reaching obs 2, else the learn
// is unclassified ('other').
function findLearns(j) {
  const census = (j.trickCensus || []).slice().sort(function (a, b) { return a.day - b.day; });
  const events = (j.trickObservations || []).filter(function (ev) { return W345.has(ev.mid); });
  const seen = {};
  const learns = [];
  for (const c of census) {
    for (const mid of (c.tricks || [])) {
      if (!W345.has(mid) || seen[mid]) continue;
      seen[mid] = true;
      const obsN = observationsToLearn(events, mid, c.day);
      const reached2 = events.some(function (ev) { return ev.mid === mid && ev.day <= c.day && isNum(ev.obsAfter) && ev.obsAfter >= 2; });
      learns.push({ seed: j.seed, species: mid, wave: waveOfMid(j, mid), learnDay: c.day,
        obsToLearn: obsN, trailOk: obsN >= 2 && reached2 });
    }
  }
  return learns;
}
function waveOfMid(j, mid) {
  if ((j.wave3Ids || []).indexOf(mid) !== -1) return 3;
  if ((j.wave4Ids || []).indexOf(mid) !== -1) return 4;
  if ((j.wave5Ids || []).indexOf(mid) !== -1) return 5;
  return null;
}

// ---- observation -> fight join (frozen rule) ----
// An observation event with fight context (same day+vid+mid as
// the enclosing fieldFight wrap) joins that killfailFights row; an
// event without fight context (scholar tbFight, witness outside a
// fight) never attributes to a field fight.
function joinObservationToFight(ev, fights) {
  if (!ev || !ev.fight) return null;
  for (const f of (fights || [])) {
    if (f.day === ev.fight.day && f.vid === ev.fight.vid && f.mid === ev.fight.mid) return f;
  }
  return null;
}

// ---- per-seed trick classification ----
function classifySeedTrick(j) {
  const kf = KILLFAIL.classifySeed(j);
  const events = (j.trickObservations || []);
  const events345 = events.filter(function (ev) { return W345.has(ev.mid); });
  const events45 = events.filter(function (ev) { return W45.has(ev.mid); });
  const classified = [];
  const unclassified = [];
  // Bar 2 is strict: EVERY recorded observation event (all waves)
  // must carry a named source, not just the judged wave-3/4/5 set.
  for (const ev of events) {
    const c = classifyObservation(ev);
    if (c.valid) classified.push({ event: ev, source: c.source });
    else unclassified.push({ event: ev, source: c.source, missing: c.missing });
  }
  const learns = findLearns(j);
  const unclassifiedLearns = learns.filter(function (l) { return !l.trailOk; });
  const episodes = buildEpisodes(j);
  // Trick-known rate at gate checks (wave 4/5 rows), by result + wave.
  const gates = (j.v4gates || []).filter(function (g) { return W45.has(g.mid); });
  const gateByResult = {};
  const gateByWave = {};
  for (const g of gates) {
    const r = g.result || 'null';
    if (!gateByResult[r]) gateByResult[r] = { rows: 0, known: 0 };
    gateByResult[r].rows++;
    if (g.trickKnown) gateByResult[r].known++;
    const w = 'w' + g.wave;
    if (!gateByWave[w]) gateByWave[w] = { rows: 0, known: 0 };
    gateByWave[w].rows++;
    if (g.trickKnown) gateByWave[w].known++;
  }
  // TrickAfter transitions on killfail fights.
  const teaches = [];
  for (const f of (j.killfailFights || [])) {
    if (f.trickBefore === false && f.trickAfter === true) {
      teaches.push({ seed: j.seed, day: f.day, vid: f.vid, mid: f.mid, wave: f.wave, outcome: f.outcome });
    }
  }
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    won: !!j.won, scaleRank: j.scaleRank || null, standing: (j.standing != null ? j.standing : null),
    maxWave: j.maxWave || 1, instrumentErrors: j.instrumentErrors || [],
    deaths: j.deaths || [], vetSays: j.vetSays || [],
    kf: kf,
    eventsTotal: events.length, events345: events345.length, events45: events45.length,
    eventsClassified: classified.length, eventsUnclassified: unclassified,
    learns: learns, unclassifiedLearns: unclassifiedLearns,
    episodes: episodes,
    gateByResult: gateByResult, gateByWave: gateByWave, gatesTotal: gates.length,
    teaches: teaches,
    trickCensusDays: (j.trickCensus || []).length,
  };
}

function summarizeLeg(bySeed) {
  const seeds = Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; });
  const wall = { wins: 0, nationalRank: 0, nationalStanding: 0, wave4: 0, wave5: 0, gameDays: [], deaths: 0, starvation: 0, scholarDeaths: 0 };
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  let files = 0, instrumentErrors = 0;
  let eventsTotal = 0, events345 = 0, events45 = 0, eventsClassified = 0, eventsUnclassified = 0;
  let learns = 0, learnsW4 = 0, learnsW5 = 0, unclassifiedLearns = 0;
  let episodes = 0, episodesLearned = 0, episodesExpired = 0, episodesLost = 0;
  let fightsTotal = 0, launchedTotal = 0, wildTotal = 0, launchedKnown = 0, wildKnown = 0;
  let gatesTotal = 0, gatesKnown = 0;
  let teaches = 0;
  let fightCtxMatched = 0, fightCtxUnmatched = 0;
  for (const s of seeds) {
    const j = bySeed[s];
    for (const ev of (j._rawEvents45 || [])) {
      if (!ev.fight) continue;
      if (joinObservationToFight(ev, j._rawFights || [])) fightCtxMatched++;
      else fightCtxUnmatched++;
    }
  }
  const obsBySpecies = {};
  const fightsBySpecies = {};
  const obsByVillager = {};
  const sourceCounts = {};
  const perSeed = [];
  const episodeTable = [];
  const teachRows = [];
  const learnRows = [];
  for (const s of seeds) {
    const r = bySeed[s];
    files++;
    instrumentErrors += (r.instrumentErrors || []).length;
    eventsTotal += r.eventsTotal; events345 += r.events345; events45 += r.events45;
    eventsClassified += r.eventsClassified; eventsUnclassified += r.eventsUnclassified.length;
    learns += r.learns.length;
    for (const l of r.learns) {
      if (l.wave === 4) learnsW4++;
      if (l.wave === 5) learnsW5++;
      learnRows.push(l);
    }
    unclassifiedLearns += r.unclassifiedLearns.length;
    episodes += r.episodes.length;
    for (const ep of r.episodes) {
      episodeTable.push(ep);
      if (ep.outcome === 'learned') episodesLearned++;
      else if (ep.outcome === 'expired') episodesExpired++;
      else if (ep.outcome === 'village-lost') episodesLost++;
    }
    teaches += r.teaches.length;
    for (const t of r.teaches) teachRows.push(t);
    fightsTotal += r.kf.fightsTotal;
    launchedTotal += r.kf.launchedTotal;
    wildTotal += r.kf.wildTotal;
    for (const row of r.kf.launched) if (row.fight.trickBefore === true) launchedKnown++;
    for (const row of r.kf.wild) if (row.fight.trickBefore === true) wildKnown++;
    gatesTotal += r.gatesTotal;
    for (const k of Object.keys(r.gateByResult)) gatesKnown += r.gateByResult[k].known;
    wall.gameDays.push(r.gameDays || 0);
    if (r.won) wall.wins++;
    if ((RANK[r.scaleRank] || 0) >= 2) wall.nationalRank++;
    if (r.standing != null && r.standing >= 200) wall.nationalStanding++;
    if ((r.maxWave || 1) >= 4) wall.wave4++;
    if ((r.maxWave || 1) >= 5) wall.wave5++;
    for (const d of (r.deaths || [])) {
      wall.deaths++;
      if (d.cause === 'starvation') wall.starvation++;
      if (d.player) wall.scholarDeaths++;
    }
    perSeed.push({
      seed: r.seed, days: r.gameDays, end: r.endReason, won: r.won, rank: r.scaleRank, standing: r.standing,
      maxWave: r.maxWave, tricksLearned: r.learns.length,
      tricksLearnedW4: r.learns.filter(function (l) { return l.wave === 4; }).length,
      tricksLearnedW5: r.learns.filter(function (l) { return l.wave === 5; }).length,
      obsEvents: r.events45, episodes: r.episodes.length,
      episodesLearned: r.episodes.filter(function (e) { return e.outcome === 'learned'; }).length,
      episodesExpired: r.episodes.filter(function (e) { return e.outcome === 'expired'; }).length,
      launchedFights: r.kf.launchedTotal, wildFights: r.kf.wildTotal,
      kills: r.kf.launched.filter(function (row) { return row.fight.outcome === 'vKill'; }).length,
    });
  }
  // (a) table: per (seed, vid, mid) per-source counts + pooled per-species.
  const perVillagerRows = [];
  for (const s of seeds) {
    const j = bySeed[s];
    const map = {};
    for (const ev of (j._rawEvents345 || [])) {
      const c = classifyObservation(ev);
      const key = ev.vid + '|' + ev.mid;
      if (!map[key]) map[key] = { seed: s, vid: ev.vid, mid: ev.mid, wave: ev.wave, sources: {} };
      map[key].sources[c.source] = (map[key].sources[c.source] || 0) + 1;
      sourceCounts[c.source] = (sourceCounts[c.source] || 0) + 1;
    }
    for (const k of Object.keys(map)) perVillagerRows.push(map[k]);
  }
  for (const s of seeds) {
    const j = bySeed[s];
    // Starvation table counts progressing observations per species
    // over wave-3/4/5 (the judged set); killfailFights cover wave
    // 4/5 only, so wave-3 fight counts are 0 by instrument design,
    // not by absence of wave-3 fights.
    for (const ev of (j._rawEvents345 || [])) {
      if (!isProgressing(ev)) continue;
      obsBySpecies[ev.mid] = (obsBySpecies[ev.mid] || 0) + 1;
      const vk = ev.vid + '|' + ev.mid;
      obsByVillager[vk] = (obsByVillager[vk] || 0) + 1;
    }
    for (const f of (j.kf ? (j._rawFights || []) : [])) {
      if (W45.has(f.mid)) fightsBySpecies[f.mid] = (fightsBySpecies[f.mid] || 0) + 1;
    }
  }
  const speciesUnion = {};
  for (const mid of Object.keys(obsBySpecies)) speciesUnion[mid] = true;
  for (const mid of Object.keys(fightsBySpecies)) speciesUnion[mid] = true;
  for (const l of learnRows) speciesUnion[l.species] = true;
  const starvation = [];
  for (const mid of Object.keys(speciesUnion)) {
    starvation.push({ species: mid,
      fights: fightsBySpecies[mid] || 0,
      observations: obsBySpecies[mid] || 0,
      learned: learnRows.some(function (l) { return l.species === mid; }) });
  }
  starvation.sort(function (a, b) { return (b.observations - a.observations) || (b.fights - a.fights); });
  return {
    files: files, instrumentErrors: instrumentErrors,
    eventsTotal: eventsTotal, events345: events345, events45: events45,
    eventsClassified: eventsClassified, eventsUnclassified: eventsUnclassified,
    sourceCounts: sourceCounts,
    learns: learns, learnsW4: learnsW4, learnsW5: learnsW5, unclassifiedLearns: unclassifiedLearns,
    learnRows: learnRows,
    episodes: episodes, episodesLearned: episodesLearned, episodesExpired: episodesExpired, episodesLost: episodesLost,
    episodeTable: episodeTable,
    fightsTotal: fightsTotal, launchedTotal: launchedTotal, wildTotal: wildTotal,
    launchedKnown: launchedKnown, wildKnown: wildKnown,
    launchedKnownRate: launchedTotal ? launchedKnown / launchedTotal : null,
    wildKnownRate: wildTotal ? wildKnown / wildTotal : null,
    gatesTotal: gatesTotal, gatesKnown: gatesKnown,
    gateKnownRate: gatesTotal ? gatesKnown / gatesTotal : null,
    teaches: teaches, teachRows: teachRows,
    fightCtxMatched: fightCtxMatched, fightCtxUnmatched: fightCtxUnmatched,
    obsBySpecies: obsBySpecies, fightsBySpecies: fightsBySpecies,
    perVillagerRows: perVillagerRows, starvation: starvation,
    perSeed: perSeed, wall: wall, medianSurvival: median(wall.gameDays),
  };
}

function parseLeg(dir) {
  const out = { dir: dir, files: [], parsed: {}, errors: [] };
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'tricklearn-b-s' + seed + '-tricklearn-b-competent.json');
    if (!fs.existsSync(fp)) { out.errors.push('missing per-seed file: ' + fp); continue; }
    try {
      const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
      out.files.push(fp);
      out.parsed[seed] = j;
    } catch (e) { out.errors.push('parse failed ' + fp + ': ' + String(e.message).slice(0, 120)); }
  }
  return out;
}

function trajectoriesMatch(mainParse, replParse) {
  const diffs = [];
  for (const seed of SEEDS) {
    const a = mainParse.parsed[seed], b = replParse.parsed[seed];
    if (!a || !b) { diffs.push(seed + ': missing leg'); continue; }
    const keys = ['days', 'gameDays', 'endReason', 'standing', 'scaleRank', 'won', 'maxWave'];
    for (const k of keys) {
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) diffs.push(seed + ': ' + k + ' main=' + JSON.stringify(a[k]) + ' repl=' + JSON.stringify(b[k]));
    }
    if ((a.deaths || []).length !== (b.deaths || []).length) diffs.push(seed + ': deaths ' + (a.deaths || []).length + ' vs ' + (b.deaths || []).length);
    for (const arr of ['trickObservations', 'trickCensus', 'v4gates', 'killfailFights', 'v4seeds', 'rumorplanLaunches']) {
      if (JSON.stringify(a[arr] || []) !== JSON.stringify(b[arr] || [])) diffs.push(seed + ': ' + arr + ' differs (' + (a[arr] || []).length + ' vs ' + (b[arr] || []).length + ')');
    }
    if (JSON.stringify(a.daily || []) !== JSON.stringify(b.daily || [])) diffs.push(seed + ': daily fingerprints differ');
  }
  return diffs;
}

function goCheck(mainSum, replSum, mainParse, replParse) {
  const bars = [];
  bars.push({ id: '1 corpus 16/16 complete', pass: mainParse.files.length === 8 && replParse.files.length === 8 &&
      mainParse.errors.length === 0 && replParse.errors.length === 0 && mainSum.instrumentErrors === 0 && replSum.instrumentErrors === 0,
    detail: 'main ' + mainParse.files.length + '/8, repl ' + replParse.files.length + '/8, parse errors ' +
      (mainParse.errors.length + replParse.errors.length) + ', instrument errors main ' + mainSum.instrumentErrors + ' repl ' + replSum.instrumentErrors });
  const replDiffs = trajectoriesMatch(mainParse, replParse);
  bars.push({ id: '2 zero unclassified (events + learns)', pass: mainSum.eventsUnclassified === 0 && mainSum.unclassifiedLearns === 0 &&
      (mainSum.sourceCounts.other || 0) === 0,
    detail: 'unclassified events ' + mainSum.eventsUnclassified + ', unclassified learns ' + mainSum.unclassifiedLearns +
      ', other-source rows ' + (mainSum.sourceCounts.other || 0) });
  // Bar 3 (neutrality): D1/D2 stamp from the proof test + panel compare.
  let det = null, detErr = null;
  try { det = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-16', 'tricklearn-b-determinism.json'), 'utf8')); }
  catch (e) { detErr = String(e.message).slice(0, 80); }
  let panel = null, panelErr = null;
  try { panel = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-16', 'tricklearn-b-panel.json'), 'utf8')); }
  catch (e) { panelErr = String(e.message).slice(0, 80); }
  const panelOk = !!panel && Array.isArray(panel.policies) &&
    panel.policies.every(function (p) {
      return (p.metrics || []).every(function (m) {
        return ['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].indexOf(m.status) !== -1;
      });
    });
  bars.push({ id: '3 neutrality (D1+D2 green, panel no material signal, replication identical)',
    pass: !!det && det.d1 === true && det.d2 === true && panelOk && replDiffs.length === 0,
    detail: 'D1 ' + (det ? det.d1 : 'stamp missing: ' + detErr) + ', D2 ' + (det ? det.d2 : 'stamp missing') +
      ', panel ' + (panel ? ('decision=' + panel.decision) : ('missing: ' + panelErr)) +
      ', replication diffs ' + replDiffs.length + (replDiffs.length ? ' [' + replDiffs.slice(0, 3).join('; ') + ']' : '') });
  let proof = null, proofErr = null;
  try { proof = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-16', 'tricklearn-b-proof.json'), 'utf8')); }
  catch (e) { proofErr = String(e.message).slice(0, 80); }
  bars.push({ id: '4 proof test green', pass: !!proof && proof.fail === 0 && proof.pass > 0,
    detail: proof ? ('pass ' + proof.pass + ' fail ' + proof.fail) : ('stamp missing: ' + proofErr) });
  bars.push({ id: '5 distinguishing power (episodes>=3 AND wave-4+ obs events>=5)', pass: mainSum.episodes >= 3 && mainSum.events45 >= 5,
    detail: 'episodes ' + mainSum.episodes + ', wave-4+ observation events ' + mainSum.events45 });
  bars.push({ id: '6 population floor (>=10 wave-4+ fieldFight rows, main)', pass: mainSum.fightsTotal >= 10,
    detail: 'wave-4+ fights ' + mainSum.fightsTotal + ' (launched ' + mainSum.launchedTotal + ', wild ' + mainSum.wildTotal + ')' });
  return bars;
}

function main() {
  const mainParse = parseLeg(MAIN_DIR);
  const replParse = parseLeg(REPL_DIR);
  const mainBySeed = {};
  const replBySeed = {};
  for (const seed of SEEDS) {
    if (mainParse.parsed[seed]) {
      const j = mainParse.parsed[seed];
      const r = classifySeedTrick(j);
      r._rawEvents345 = (j.trickObservations || []).filter(function (ev) { return W345.has(ev.mid); });
      r._rawEvents45 = (j.trickObservations || []).filter(function (ev) { return W45.has(ev.mid); });
      r._rawFights = (j.killfailFights || []).slice();
      mainBySeed[seed] = r;
    }
    if (replParse.parsed[seed]) {
      const j = replParse.parsed[seed];
      const r = classifySeedTrick(j);
      r._rawEvents345 = (j.trickObservations || []).filter(function (ev) { return W345.has(ev.mid); });
      r._rawEvents45 = (j.trickObservations || []).filter(function (ev) { return W45.has(ev.mid); });
      r._rawFights = (j.killfailFights || []).slice();
      replBySeed[seed] = r;
    }
  }
  const mainSum = summarizeLeg(mainBySeed);
  const replSum = summarizeLeg(replBySeed);
  const bars = goCheck(mainSum, replSum, mainParse, replParse);
  const go = bars.every(function (b) { return b.pass; });

  console.log('== tricklearn-b analysis ==');
  console.log('main leg: ' + mainSum.files + '/8 files, wave-4+ obs events ' + mainSum.events45 +
    ' (wave-3/4/5 ' + mainSum.events345 + ', all waves ' + mainSum.eventsTotal + ')');
  console.log('replication leg: ' + replSum.files + '/8 files, wave-4+ obs events ' + replSum.events45);
  console.log('sources (wave-3/4/5 events): ' + JSON.stringify(mainSum.sourceCounts));
  console.log('learns: ' + mainSum.learns + ' (w4 ' + mainSum.learnsW4 + ', w5 ' + mainSum.learnsW5 +
    '), unclassified learns ' + mainSum.unclassifiedLearns);
  console.log('episodes: ' + mainSum.episodes + ' (learned ' + mainSum.episodesLearned +
    ', expired ' + mainSum.episodesExpired + ', village-lost ' + mainSum.episodesLost + ')');
  console.log('--- trick-known rate at gate checks (main) ---');
  for (const s of Object.keys(mainBySeed)) {
    const r = mainBySeed[s];
    for (const k of Object.keys(r.gateByResult)) {
      const g = r.gateByResult[k];
      console.log('  seed ' + s + ' result ' + k + ': ' + g.known + '/' + g.rows);
    }
  }
  console.log('gate known overall: ' + mainSum.gatesKnown + '/' + mainSum.gatesTotal + ' = ' +
    (mainSum.gateKnownRate == null ? 'n/a' : (mainSum.gateKnownRate * 100).toFixed(1) + '%'));
  console.log('launched-fight trick-known: ' + mainSum.launchedKnown + '/' + mainSum.launchedTotal + ' = ' +
    (mainSum.launchedKnownRate == null ? 'n/a' : (mainSum.launchedKnownRate * 100).toFixed(1) + '%') +
    '; wild: ' + mainSum.wildKnown + '/' + mainSum.wildTotal + ' = ' +
    (mainSum.wildKnownRate == null ? 'n/a' : (mainSum.wildKnownRate * 100).toFixed(1) + '%'));
  console.log('TrickAfter teaches (false->true): ' + mainSum.teaches);
  console.log('fight-context join: matched ' + mainSum.fightCtxMatched + ', unmatched ' + mainSum.fightCtxUnmatched);
  console.log('--- wait-window episodes (main) ---');
  for (const ep of mainSum.episodeTable) {
    console.log('  seed ' + ep.seed + ' ' + ep.species + ' D' + ep.day + ' ' + ep.outcome +
      ' (obs ' + ep.observations + ', fights ' + ep.fights + ', launches ' + ep.launches + ', gates ' + ep.gateRows + ')');
  }
  console.log('--- starvation table (fights vs observations per wave-4/5 species) ---');
  for (const row of mainSum.starvation) {
    console.log('  ' + row.species + ': fights ' + row.fights + ', obs ' + row.observations + ', learned ' + row.learned);
  }
  console.log('--- wall (main) ---');
  console.log('wins ' + mainSum.wall.wins + '/8, national(rank>=2) ' + mainSum.wall.nationalRank + '/8, national(standing>=200) ' +
    mainSum.wall.nationalStanding + '/8, wave4 ' + mainSum.wall.wave4 + '/8, wave5 ' + mainSum.wall.wave5 +
    '/8, median survival ' + mainSum.medianSurvival + 'd, deaths ' + mainSum.wall.deaths + ', starvation ' + mainSum.wall.starvation);
  console.log('--- wall (replication) ---');
  console.log('wins ' + replSum.wall.wins + '/8, national(rank>=2) ' + replSum.wall.nationalRank + '/8, national(standing>=200) ' +
    replSum.wall.nationalStanding + '/8, wave4 ' + replSum.wall.wave4 + '/8, wave5 ' + replSum.wall.wave5 +
    '/8, median survival ' + replSum.medianSurvival + 'd, deaths ' + replSum.wall.deaths + ', starvation ' + replSum.wall.starvation);
  console.log('--- GO bars ---');
  for (const b of bars) console.log('  ' + (b.pass ? 'PASS' : 'FAIL') + ' ' + b.id + ' — ' + b.detail);
  console.log('verdict: ' + (go ? 'DIAG-GO' : 'DIAG-NO-GO'));

  const analysis = {
    arm: 'tricklearn-b', run: 'fleshout-20261116T1515Z', seeds: SEEDS, policy: 'competent',
    main: mainSum, replication: replSum, bars: bars, go: go,
    unclassifiedEventsMain: [].concat.apply([], Object.keys(mainBySeed).map(function (s) {
      return mainBySeed[s].eventsUnclassified.map(function (u) {
        return { seed: Number(s), day: u.event.day, vid: u.event.vid, mid: u.event.mid, source: u.source, missing: u.missing };
      });
    })),
    unclassifiedLearnsMain: [].concat.apply([], Object.keys(mainBySeed).map(function (s) {
      return mainBySeed[s].unclassifiedLearns.map(function (l) {
        return { seed: Number(s), species: l.species, learnDay: l.learnDay, obsToLearn: l.obsToLearn };
      });
    })),
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(analysis, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, OUT_FILE));
  if (!go) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifyObservation: classifyObservation, isProgressing: isProgressing,
  observationsToLearn: observationsToLearn, isTrickHold: isTrickHold, buildEpisodes: buildEpisodes,
  findLearns: findLearns, joinObservationToFight: joinObservationToFight,
  classifySeedTrick: classifySeedTrick, summarizeLeg: summarizeLeg,
  parseLeg: parseLeg, trajectoriesMatch: trajectoriesMatch, goCheck: goCheck, median: median,
  W3: W3, W4: W4, W5: W5, SEEDS: SEEDS };
