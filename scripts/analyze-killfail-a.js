// analyze-killfail-a.js — analyzer for arm sim-killfail-a (DIAG: why
// launched wave-4 parties get 0 kills).
// Builds launch events from rumorplanLaunches, trip windows from
// seedattachCensus, joins killfailFights to events, classifies every
// launched wave-4+ party fight (flags + primary mode per the frozen
// precedence in evidence/2026-11-16/sim-killfail-a-prereg.md),
// and prints the outcome table + flag-prevalence table + ranked
// primary-mode table + per-fight table + per-seed table + wild
// comparison + wall numbers for both legs. Writes
// evidence/2026-11-16/killfail-a-analysis.json. Exits non-zero on
// any bar failure (classification < 90%, population < 5, parse
// failures, instrument errors).
// Usage:
//   node scripts/analyze-killfail-a.js [--main evidence/2026-11-16/perseed-killfail-a-main]
//     [--repl evidence/2026-11-16/perseed-killfail-a-replication]
//     [--out evidence/2026-11-16/killfail-a-analysis.json]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const MAIN_DIR = path.join(REPO, argvVal('--main', 'evidence/2026-11-16/perseed-killfail-a-main'));
const REPL_DIR = path.join(REPO, argvVal('--repl', 'evidence/2026-11-16/perseed-killfail-a-replication'));
const OUT_FILE = path.join(REPO, argvVal('--out', 'evidence/2026-11-16/killfail-a-analysis.json'));

const W4 = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'];
const W5 = ['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot'];
const W4_SET = new Set(W4);
const W5_SET = new Set(W5);
const SEEDS = [102041, 102042, 102043, 102044, 102045, 102046, 102047, 102048];

function median(nums) {
  const a = nums.filter(function (n) { return typeof n === 'number' && isFinite(n); }).sort(function (x, y) { return x - y; });
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
function isNum(x) { return typeof x === 'number' && isFinite(x); }

// ---- launch events ----
function buildEvents(j) {
  const byKey = {};
  const rows = j.rumorplanLaunches || [];
  for (const r of rows) {
    const key = r.day + '|' + r.inviter;
    if (!byKey[key]) byKey[key] = { seed: j.seed, day: r.day, inviter: r.inviter, participants: [], path: r.path || null };
    byKey[key].participants.push(r);
  }
  const seeds4 = (j.v4seeds || []).filter(function (s) { return (s.wave | 0) >= 4; });
  const events = Object.keys(byKey).map(function (k) { return byKey[k]; });
  for (const ev of events) {
    let invRow = null;
    for (const p of ev.participants) if (p.role === 'inviter') { invRow = p; break; }
    if (!invRow) invRow = ev.participants[0];
    ev.launchedPartySize = (invRow && Array.isArray(invRow.partyAfter) ? invRow.partyAfter.length : 0) + 1;
    ev.targetAfter = invRow ? (invRow.targetAfter || null) : null;
    ev.needWaveAfter = invRow ? (invRow.needWaveAfter != null ? invRow.needWaveAfter : null) : null;
    ev.stageAfter = invRow ? (invRow.stageAfter || null) : null;
    ev.targetNamed = !!(ev.targetAfter && (W4_SET.has(ev.targetAfter) || W5_SET.has(ev.targetAfter)));
    let strict = (ev.needWaveAfter != null && ev.needWaveAfter >= 4) || ev.targetNamed;
    let broad = strict;
    if (!broad) {
      for (const s of seeds4) {
        if (s.vid === ev.inviter && s.day <= ev.day) { broad = true; break; }
      }
    }
    ev.strict = strict;
    ev.broad = broad;
    ev.key = ev.day + '|' + ev.inviter;
  }
  events.sort(function (a, b) { return (a.day - b.day) || (a.inviter < b.inviter ? -1 : 1); });
  return events;
}

// ---- trip windows ----
// Per participant: [launch day, first census day >= launch day with
// holderExped false, capped at launch day + 14]. No census rows for
// the vid at all -> [D, D+14] flagged fallback.
function tripWindows(j, events) {
  const byVid = {};
  for (const c of (j.seedattachCensus || [])) {
    if (!byVid[c.vid]) byVid[c.vid] = [];
    byVid[c.vid].push(c);
  }
  for (const vid of Object.keys(byVid)) byVid[vid].sort(function (a, b) { return a.day - b.day; });
  const windows = [];
  for (const ev of events) {
    for (const p of ev.participants) {
      const rows = byVid[p.vid] || [];
      let end = ev.day + 14, fallback = false;
      if (!rows.length) { fallback = true; }
      else {
        let found = null;
        for (const c of rows) {
          if (c.day >= ev.day && c.holderExped === false) { found = c.day; break; }
        }
        if (found != null) end = Math.min(found, ev.day + 14);
      }
      windows.push({ eventKey: ev.key, vid: p.vid, role: p.role, start: ev.day, end: end, fallback: fallback });
    }
  }
  return windows;
}

function joinFight(f, events, windows) {
  const vids = [f.vid].concat(f.allyVids || []);
  const covering = [];
  const seenEvents = {};
  for (const w of windows) {
    if (vids.indexOf(w.vid) === -1) continue;
    if (f.day < w.start || f.day > w.end) continue;
    const ev = events.find(function (e) { return e.key === w.eventKey; });
    if (!ev || !ev.broad) continue;
    // Count DISTINCT events (one fight can sit in several
    // participants' windows of the same event); the analyzer counts
    // the fight once, first event wins, flagged ambiguous.
    if (seenEvents[ev.key]) continue;
    seenEvents[ev.key] = true;
    covering.push({ event: ev, window: w });
  }
  if (!covering.length) return null;
  covering.sort(function (a, b) {
    return (a.event.day - b.event.day) || (a.event.inviter < b.event.inviter ? -1 : 1);
  });
  const first = covering[0];
  const joinKind = (first.window.vid === f.vid) ? 'fighter' : 'ally';
  return { event: first.event, joinKind: joinKind, ambiguous: covering.length > 1, covering: covering.length };
}

// ---- fight classification (frozen fields, flags, precedence) ----
const REQUIRED = ['day', 'vid', 'mid', 'wave', 'alliesN', 'trickBefore', 'fighter', 'allies', 'mHpEntry', 'outcome', 'rounds', 'mDealt', 'vTaken'];
function missingFields(f) {
  const missing = [];
  for (const k of REQUIRED) {
    if (f[k] === undefined || f[k] === null) { missing.push(k); continue; }
    if (k === 'fighter') {
      for (const sub of ['class', 'armorP', 'weaponB', 'hpEntry']) {
        if (f.fighter[sub] === undefined || f.fighter[sub] === null) missing.push('fighter.' + sub);
      }
    }
    if (k === 'allies') {
      if (!Array.isArray(f.allies)) { missing.push('allies-not-array'); continue; }
      for (let i = 0; i < f.allies.length; i++) {
        const a = f.allies[i];
        if (!a || a.class === undefined || a.class === null) { missing.push('allies[' + i + '].class'); continue; }
        if (a.class === 'unclassified') missing.push('allies[' + i + '].unclassified');
        for (const sub of ['armorP', 'hpEntry']) {
          if (a[sub] === undefined || a[sub] === null) missing.push('allies[' + i + '].' + sub);
        }
      }
    }
  }
  if (f.fighter && f.fighter.class === 'unclassified') missing.push('fighter.unclassified');
  return missing;
}

function flagsFor(f, launchCtx) {
  const flags = [];
  const subs = { unarmored: false, unarmed: false };
  const fighter = f.fighter || {};
  const people = [fighter].concat(f.allies || []);
  if (f.trickBefore === false) flags.push('trick-unknown');
  const contactSize = 1 + (f.alliesN | 0);
  if (contactSize < 3) flags.push('party-short');
  if (launchCtx && launchCtx.event && launchCtx.event.launchedPartySize < 3) flags.push('launched-short');
  if (fighter.class === 'armed-no-ammo') flags.push('dry-fighter');
  const anyWorkingRange = people.some(function (p) { return p && p.class === 'armed-with-ammo'; });
  if (!anyWorkingRange) flags.push('no-working-range');
  const unarmored = isNum(fighter.armorP) && fighter.armorP < 10;
  const unarmed = fighter.effectivelyArmed === false;
  subs.unarmored = unarmored;
  subs.unarmed = unarmed;
  if (unarmored || unarmed) flags.push('under-geared');
  if (f.outcome === 'vFlee' && isNum(f.rounds) && f.rounds <= 2) flags.push('fled-early');
  if (isNum(f.mDealt) && isNum(f.mHpEntry) && f.mHpEntry > 0 && f.mDealt < 0.25 * f.mHpEntry) flags.push('out-damaged');
  if (isNum(f.vTaken) && isNum(fighter.hpEntry) && fighter.hpEntry > 0 && f.vTaken >= 0.5 * fighter.hpEntry) flags.push('mauled');
  if (f.outcome === 'vDie') flags.push('died');
  if (f.outcome === 'evade') flags.push('evaded');
  if (f.outcome === 'mFlee') flags.push('drove-off');
  return { flags: flags, subs: subs, contactSize: contactSize, anyWorkingRange: anyWorkingRange };
}

// Primary mode, frozen precedence (prereg §Frozen definitions).
function primaryFor(f, fl) {
  if (f.outcome === 'vKill') return 'killed';
  if (f.outcome === 'evade') return 'evaded';
  if (f.outcome === 'vDie') return 'died';
  if (f.outcome === 'vFlee' && isNum(f.rounds) && f.rounds <= 2) return 'fled-early';
  if (f.outcome === 'mFlee') return 'drove-off';
  if (f.outcome === 'vFlee' && isNum(f.rounds) && f.rounds >= 3 && fl.flags.indexOf('out-damaged') !== -1) return 'out-damaged';
  if (fl.flags.indexOf('trick-unknown') !== -1 && isNum(f.rounds) && f.rounds >= 3 && fl.flags.indexOf('out-damaged') === -1) return 'trick-unknown';
  if (fl.flags.indexOf('dry-fighter') !== -1) return 'dry';
  if (fl.flags.indexOf('party-short') !== -1) return 'party-short';
  if (fl.flags.indexOf('under-geared') !== -1) return 'under-geared';
  return 'other';
}

function classifyFight(f, launchCtx) {
  const missing = missingFields(f);
  if (missing.length) {
    return { classified: false, missingFields: missing, flags: [], primary: 'unclassified', joinKind: launchCtx ? launchCtx.joinKind : null };
  }
  const fl = flagsFor(f, launchCtx);
  return { classified: true, missingFields: [], flags: fl.flags, subs: fl.subs,
    contactSize: fl.contactSize, anyWorkingRange: fl.anyWorkingRange,
    primary: primaryFor(f, fl), joinKind: launchCtx ? launchCtx.joinKind : null };
}

// ---- per-seed classification ----
function classifySeed(j) {
  const events = buildEvents(j);
  const windows = tripWindows(j, events);
  const fights = j.killfailFights || [];
  const launched = [];
  const wild = [];
  const unclassified = [];
  for (const f of fights) {
    const join = joinFight(f, events, windows);
    if (join) {
      const c = classifyFight(f, join);
      const row = { seed: j.seed, fight: f, event: join.event, joinKind: join.joinKind,
        ambiguous: join.ambiguous, covering: join.covering, classification: c };
      launched.push(row);
      if (!c.classified) unclassified.push(row);
    } else {
      const c = classifyFight(f, null);
      wild.push({ seed: j.seed, fight: f, event: null, joinKind: null, ambiguous: false, covering: 0, classification: c });
    }
  }
  const broadEvents = events.filter(function (e) { return e.broad; });
  const strictEvents = events.filter(function (e) { return e.strict; });
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    won: !!j.won, scaleRank: j.scaleRank || null, standing: (j.standing != null ? j.standing : null),
    maxWave: j.maxWave || 1, instrumentErrors: j.instrumentErrors || [],
    deaths: j.deaths || [],
    events: events, broadEvents: broadEvents.length, strictEvents: strictEvents.length,
    windows: windows,
    fightsTotal: fights.length, launched: launched, wild: wild,
    launchedTotal: launched.length, launchedClassified: launched.filter(function (r) { return r.classification.classified; }).length,
    wildTotal: wild.length,
    unclassified: unclassified,
  };
}

function summarizeLeg(bySeed) {
  const seeds = Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; });
  let launched = 0, classified = 0, kills = 0, wild = 0, wildKills = 0, events = 0, broadEvents = 0, strictEvents = 0;
  let files = 0, instrumentErrors = 0;
  const outcomes = {};
  const primaryCounts = {};
  const flagCounts = {};
  const perFight = [];
  const perSeed = [];
  const wall = { wins: 0, nationalRank: 0, nationalStanding: 0, wave4: 0, wave5: 0, gameDays: [], deaths: 0, starvation: 0, scholarDeaths: 0 };
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  for (const s of seeds) {
    const r = bySeed[s];
    files++;
    instrumentErrors += (r.instrumentErrors || []).length;
    events += r.events.length;
    broadEvents += r.broadEvents;
    strictEvents += r.strictEvents;
    launched += r.launchedTotal;
    classified += r.launchedClassified;
    wild += r.wildTotal;
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
    for (const row of r.launched) {
      const f = row.fight;
      outcomes[f.outcome] = (outcomes[f.outcome] || 0) + 1;
      if (f.outcome === 'vKill') kills++;
      const c = row.classification;
      if (c.classified) {
        primaryCounts[c.primary] = (primaryCounts[c.primary] || 0) + 1;
        for (const fl of c.flags) flagCounts[fl] = (flagCounts[fl] || 0) + 1;
      }
      perFight.push({
        seed: r.seed, day: f.day, fighter: (f.fighter && f.fighter.name) || f.vid, fighterVid: f.vid,
        monster: f.mid, wave: f.wave, joinKind: row.joinKind, ambiguous: row.ambiguous,
        launchedPartySize: row.event.launchedPartySize, contactPartySize: 1 + (f.alliesN | 0),
        targetNamed: row.event.targetNamed, target: row.event.targetAfter, needWave: row.event.needWaveAfter,
        trickBefore: f.trickBefore, trickAfter: f.trickAfter,
        fighterClass: f.fighter ? f.fighter.class : null, fighterAmmo: f.fighter ? f.fighter.ammoN : null,
        fighterAmmoNeed: f.fighter ? f.fighter.ammoNeed : null, fighterMelee: f.fighter ? f.fighter.meleeWeapon : null,
        fighterArmorP: f.fighter ? f.fighter.armorP : null, fighterHpEntry: f.fighter ? f.fighter.hpEntry : null,
        allies: (f.allies || []).map(function (a) { return { name: a.name, class: a.class, ammoN: a.ammoN, armorP: a.armorP, hpEntry: a.hpEntry }; }),
        mHpEntry: f.mHpEntry, mHpLeft: f.mHpLeft,
        outcome: f.outcome, rounds: f.rounds, mDealt: f.mDealt, allyDealt: f.allyDealt,
        dmgPerRound: (isNum(f.mDealt) && isNum(f.rounds) && f.rounds > 0) ? +(f.mDealt / f.rounds).toFixed(1) : null,
        dmgFrac: (isNum(f.mDealt) && isNum(f.mHpEntry) && f.mHpEntry > 0) ? +(f.mDealt / f.mHpEntry).toFixed(2) : null,
        vTaken: f.vTaken, vHpLeft: f.vHpLeft,
        gate: f.gate ? { result: f.gate.result, reason: f.gate.reason, partySize: f.gate.partySize } : null,
        flags: c.flags, primary: c.primary, classified: c.classified,
        missingFields: c.missingFields,
      });
    }
    for (const row of r.wild) {
      const f = row.fight;
      if (f.outcome === 'vKill') wildKills++;
    }
    const lf = r.launched.map(function (row) { return row.fight; });
    perSeed.push({
      seed: r.seed, days: r.gameDays, end: r.endReason, won: r.won, rank: r.scaleRank, standing: r.standing,
      maxWave: r.maxWave, events: r.events.length, broadEvents: r.broadEvents, strictEvents: r.strictEvents,
      launchedFights: r.launchedTotal, classified: r.launchedClassified, kills: r.launched.filter(function (row) { return row.fight.outcome === 'vKill'; }).length,
      wildFights: r.wildTotal,
      medianDmg: median(lf.map(function (f) { return f.mDealt; })),
      medianRounds: median(lf.map(function (f) { return f.rounds; })),
    });
  }
  const launchedRows = perFight;
  const wildRows = [];
  for (const s of seeds) for (const row of bySeed[s].wild) wildRows.push(row.fight);
  const dmgPerRound = function (rows) {
    return rows.map(function (f) { return (isNum(f.mDealt) && isNum(f.rounds) && f.rounds > 0) ? f.mDealt / f.rounds : null; }).filter(function (x) { return x != null; });
  };
  return {
    files: files, instrumentErrors: instrumentErrors,
    events: events, broadEvents: broadEvents, strictEvents: strictEvents,
    launchedTotal: launched, launchedClassified: classified,
    classificationShare: launched ? classified / launched : null,
    kills: kills, killRate: launched ? kills / launched : null,
    wildTotal: wild, wildKills: wildKills, wildKillRate: wild ? wildKills / wild : null,
    outcomes: outcomes, primaryCounts: primaryCounts, flagCounts: flagCounts,
    perFight: perFight, perSeed: perSeed,
    wall: wall,
    medianSurvival: median(wall.gameDays),
    launchedMedianDmgPerRound: median(dmgPerRound(launchedRows.map(function (r) { return { mDealt: r.mDealt, rounds: r.rounds }; }))),
    launchedMedianRounds: median(launchedRows.map(function (r) { return r.rounds; })),
    launchedMedianDmgFrac: median(launchedRows.map(function (r) { return r.dmgFrac; })),
    wildMedianDmgPerRound: median(dmgPerRound(wildRows)),
    wildMedianRounds: median(wildRows.map(function (f) { return f.rounds; })),
  };
}

function parseLeg(dir) {
  const out = { dir: dir, files: [], parsed: {}, errors: [] };
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'killfail-a-s' + seed + '-killfail-a-tableseat-nowait.json');
    if (!fs.existsSync(fp)) { out.errors.push('missing per-seed file: ' + fp); continue; }
    try {
      const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
      out.files.push(fp);
      out.parsed[seed] = j;
    } catch (e) { out.errors.push('parse failed ' + fp + ': ' + String(e.message).slice(0, 120)); }
  }
  return out;
}

function goCheck(mainSum, replSum, mainParse, replParse) {
  const bars = [];
  bars.push({ id: 'classification>=90%', pass: mainSum.launchedTotal >= 5 && (mainSum.classificationShare || 0) >= 0.9,
    detail: 'classified ' + mainSum.launchedClassified + '/' + mainSum.launchedTotal + ' = ' + (mainSum.classificationShare == null ? 'n/a' : (mainSum.classificationShare * 100).toFixed(1) + '%') });
  bars.push({ id: 'population>=5 launched fights', pass: mainSum.launchedTotal >= 5,
    detail: 'launched fights ' + mainSum.launchedTotal });
  bars.push({ id: 'corpus 8/8 main + 8/8 replication parse', pass: mainParse.files.length === 8 && replParse.files.length === 8 && mainParse.errors.length === 0 && replParse.errors.length === 0,
    detail: 'main ' + mainParse.files.length + '/8, repl ' + replParse.files.length + '/8, errors ' + (mainParse.errors.length + replParse.errors.length) });
  bars.push({ id: 'instrument errors 0', pass: (mainSum.instrumentErrors + replSum.instrumentErrors) === 0,
    detail: 'main ' + mainSum.instrumentErrors + ', repl ' + replSum.instrumentErrors });
  bars.push({ id: 'replication matches main (launched fights + kills)', pass: replSum.launchedTotal === mainSum.launchedTotal && replSum.kills === mainSum.kills,
    detail: 'main ' + mainSum.launchedTotal + ' fights/' + mainSum.kills + ' kills, repl ' + replSum.launchedTotal + ' fights/' + replSum.kills + ' kills' });
  return bars;
}

function main() {
  const mainParse = parseLeg(MAIN_DIR);
  const replParse = parseLeg(REPL_DIR);
  const mainBySeed = {};
  const replBySeed = {};
  for (const seed of SEEDS) {
    if (mainParse.parsed[seed]) mainBySeed[seed] = classifySeed(mainParse.parsed[seed]);
    if (replParse.parsed[seed]) replBySeed[seed] = classifySeed(replParse.parsed[seed]);
  }
  const mainSum = summarizeLeg(mainBySeed);
  const replSum = summarizeLeg(replBySeed);
  const bars = goCheck(mainSum, replSum, mainParse, replParse);
  const go = bars.every(function (b) { return b.pass; });

  console.log('== killfail-a analysis ==');
  console.log('main leg: ' + mainSum.files + '/8 files, launched fights ' + mainSum.launchedTotal +
    ', classified ' + mainSum.launchedClassified + ' (' + (mainSum.classificationShare == null ? 'n/a' : (mainSum.classificationShare * 100).toFixed(1) + '%') + ')');
  console.log('replication leg: ' + replSum.files + '/8 files, launched fights ' + replSum.launchedTotal + ', kills ' + replSum.kills);
  console.log('events: main ' + mainSum.events + ' (' + mainSum.broadEvents + ' broad, ' + mainSum.strictEvents + ' strict)');
  console.log('--- outcomes (launched fights, main) ---');
  console.log(JSON.stringify(mainSum.outcomes));
  console.log('kills ' + mainSum.kills + '/' + mainSum.launchedTotal + ' = ' + (mainSum.killRate == null ? 'n/a' : (mainSum.killRate * 100).toFixed(1) + '%') +
    '; wild ' + replSum.wildKills + '/' + mainSum.wildTotal + ' = ' + (mainSum.wildKillRate == null ? 'n/a' : (mainSum.wildKillRate * 100).toFixed(1) + '%'));
  console.log('--- ranked primary failure modes (main, non-kill launched fights) ---');
  const ranked = Object.keys(mainSum.primaryCounts).filter(function (k) { return k !== 'killed'; })
    .sort(function (a, b) { return mainSum.primaryCounts[b] - mainSum.primaryCounts[a]; });
  for (const k of ranked) console.log('  ' + k + ': ' + mainSum.primaryCounts[k]);
  if (mainSum.primaryCounts.killed) console.log('  killed: ' + mainSum.primaryCounts.killed);
  console.log('--- flag prevalence (classified launched fights, main) ---');
  const flagRanked = Object.keys(mainSum.flagCounts).sort(function (a, b) { return mainSum.flagCounts[b] - mainSum.flagCounts[a]; });
  for (const k of flagRanked) console.log('  ' + k + ': ' + mainSum.flagCounts[k] + '/' + mainSum.launchedClassified);
  console.log('--- wall (main) ---');
  console.log('wins ' + mainSum.wall.wins + '/8, national(rank>=2) ' + mainSum.wall.nationalRank + '/8, national(standing>=200) ' +
    mainSum.wall.nationalStanding + '/8, wave4 ' + mainSum.wall.wave4 + '/8, wave5 ' + mainSum.wall.wave5 +
    '/8, median survival ' + mainSum.medianSurvival + 'd, deaths ' + mainSum.wall.deaths + ', starvation ' + mainSum.wall.starvation);
  console.log('--- GO bars ---');
  for (const b of bars) console.log('  ' + (b.pass ? 'PASS' : 'FAIL') + ' ' + b.id + ' — ' + b.detail);
  console.log('verdict: ' + (go ? 'DIAG-GO' : 'DIAG-NO-GO'));

  const analysis = {
    arm: 'killfail-a', run: 'fleshout-20261116T0825Z', seeds: SEEDS, policy: 'tableseat-nowait',
    main: mainSum, replication: replSum, bars: bars, go: go,
    unclassifiedMain: [].concat.apply([], Object.keys(mainBySeed).map(function (s) {
      return mainBySeed[s].unclassified.map(function (r) {
        return { seed: Number(s), day: r.fight.day, vid: r.fight.vid, mid: r.fight.mid, missingFields: r.classification.missingFields };
      });
    })),
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(analysis, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, OUT_FILE));
  if (!go) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { buildEvents: buildEvents, tripWindows: tripWindows, joinFight: joinFight,
  missingFields: missingFields, flagsFor: flagsFor, primaryFor: primaryFor,
  classifyFight: classifyFight, classifySeed: classifySeed, summarizeLeg: summarizeLeg,
  parseLeg: parseLeg, goCheck: goCheck, median: median, W4: W4, W5: W5, SEEDS: SEEDS };
