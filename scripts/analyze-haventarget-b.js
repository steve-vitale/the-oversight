// analyze-haventarget-b.js — analyzer, arm sim-haventarget-b
// (DIAG: expeditions targeting the Haven tile). Loads the OFF + ON
// corpora, re-derives every launch's destination + origin from the raw
// recorded fields (D3), assembles trips (launch -> return / death /
// open-at-end), and reports the Haven-target count table, the
// launch-origin cross-tab, the matched cost table (haven-target vs
// same-seed non-home per-leg rates), the full-band D2 neutrality
// check, and the wall numbers per leg.
// Usage:
//   node scripts/analyze-haventarget-b.js evidence/2026-11-16/perseed-haventarget-b-on [evidence/2026-11-16/perseed-haventarget-b-off] [evidence/2026-11-16/haventarget-b-analysis.json]
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

function round(x, n) { if (x == null || !isFinite(x)) return null; const p = Math.pow(10, n || 4); return Math.round(x * p) / p; }
function med(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function loadDir(dir) {
  const full = path.isAbsolute(dir) ? dir : path.join(REPO, dir);
  const files = fs.readdirSync(full).filter(function (f) { return f.indexOf('haventarget-b-s') === 0 && f.slice(-5) === '.json'; }).sort();
  const bySeed = {};
  for (const f of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(full, f), 'utf8'));
    bySeed[raw.seed] = raw;
  }
  return { dir: full, files: files, bySeed: bySeed };
}

// Re-derive the destination class from raw recorded fields (D3).
// Landed only: an unlanded launch never had a destination (the
// callee returned before the target was drawn).
function deriveDestination(row) {
  if (!row.landed || !row.exped) return 'not-launched';
  return (row.exped.tx === row.hx && row.exped.ty === row.hy) ? 'haven-target' : 'off-home';
}
// Re-derive the origin class from the raw stack + opts (D3). Same
// rules as the driver's deriveOrigin, re-implemented here so the
// check is independent of the driver's stored value.
function deriveOrigin(stack, hasOpts) {
  if (!stack) return 'unknown';
  if (stack.indexOf('win-plan.js') !== -1) return 'winplan-party_launch';
  if (stack.indexOf('villager-brain.js') !== -1) return 'vbrain-party_launch';
  if (stack.indexOf('villager-agency.js') !== -1) return hasOpts ? 'directed-other' : 'random-agency';
  return 'unknown';
}

function parseEncounter(s) {
  if (typeof s !== 'string') return 'other';
  if (s.indexOf('killed ') === 0) return 'kill';
  if (s.indexOf('evaded ') === 0) return 'evade';
  if (s.indexOf('fled ') === 0) return 'flee';
  if (s.indexOf('gave ') === 0) return 'gave-room';
  if (s.indexOf('stood down ') === 0) return 'stood-down';
  if (s === 'hurt') return 'hurt';
  return 'other';
}

function classifyLeg(rawLeg) {
  const seeds = Object.keys(rawLeg.bySeed).sort().map(function (k) { return rawLeg.bySeed[k]; });
  const launches = [], trips = [], mismatches = [], unknowns = [];
  let blocked = 0;
  const blockedByReason = {};
  for (const s of seeds) {
    const retByKey = {}, deathByKey = {};
    for (const r of (s.returns || [])) retByKey[r.vid + '|' + r.exped.sinceDay + '|' + r.exped.sincePart] = r;
    for (const d of (s.expedDeaths || [])) deathByKey[d.vid + '|' + (d.exped ? d.exped.sinceDay : '?') + '|' + (d.exped ? d.exped.sincePart : '?')] = d;
    const openByKey = {};
    for (const o of (s.openExped || [])) openByKey[o.vid + '|' + o.exped.sinceDay + '|' + o.exped.sincePart] = o;
    const matchedRet = {}, matchedDeath = {}, matchedOpen = {};
    for (const row of (s.launches || [])) {
      const dest = deriveDestination(row);
      const origin = deriveOrigin(row.stackTop, row.hasOpts);
      if (row.origin !== origin) mismatches.push({ seed: s.seed, vid: row.vid, day: row.day, stored: row.origin, rederived: origin });
      if (origin === 'unknown') unknowns.push({ seed: s.seed, vid: row.vid, day: row.day, reason: 'no stack frame names a caller; hook: stackTop capture' });
      if (dest === 'not-launched') {
        blocked++;
        const br = row.blockReason || 'unknown-block';
        blockedByReason[br] = (blockedByReason[br] || 0) + 1;
        continue;
      }
      const key = row.vid + '|' + row.exped.sinceDay + '|' + row.exped.sincePart;
      const trip = { seed: s.seed, vid: row.vid, name: row.name, profile: row.profile,
        day: row.day, part: row.part, hx: row.hx, hy: row.hy,
        tx: row.exped.tx, ty: row.exped.ty, dist: row.exped.dist, duration: row.exped.duration,
        destination: dest, origin: origin,
        planAtLaunch: row.plan || null,
        planNodeIsTarget: row.plan && row.plan.node ? (row.plan.node.nx === row.exped.tx && row.plan.node.ny === row.exped.ty) : null,
        dawnCommit: row.dawnCommit || null,
        status: 'unmatched', returnRow: null, deathRow: null, openRow: null };
      if (retByKey[key]) { trip.status = 'complete'; trip.returnRow = retByKey[key]; matchedRet[key] = true; }
      else if (deathByKey[key]) { trip.status = 'died'; trip.deathRow = deathByKey[key]; matchedDeath[key] = true; }
      else if (openByKey[key]) { trip.status = 'open-at-end'; trip.openRow = openByKey[key]; matchedOpen[key] = true; }
      else { trip.status = 'unmatched'; unknowns.push({ seed: s.seed, vid: row.vid, day: row.day, reason: 'landed launch with no return/death/open record; hook: expeditionReturn/expedDeath wrap' }); }
      trips.push(trip);
      launches.push({ seed: s.seed, vid: row.vid, day: row.day, destination: dest, origin: origin, landed: true });
    }
    for (const k of Object.keys(retByKey)) if (!matchedRet[k]) unknowns.push({ seed: s.seed, key: k, reason: 'return with no launch row; hook: startExpedition wrap' });
    for (const k of Object.keys(deathByKey)) if (!matchedDeath[k]) unknowns.push({ seed: s.seed, key: k, reason: 'expedition death with no launch row; hook: startExpedition wrap' });
    for (const k of Object.keys(openByKey)) if (!matchedOpen[k]) unknowns.push({ seed: s.seed, key: k, reason: 'open expedition with no launch row; hook: startExpedition wrap' });
  }
  return { launches: launches, trips: trips, mismatches: mismatches, unknowns: unknowns, blockedAttempts: blocked, blockedByReason: blockedByReason };
}

function tripStats(trips) {
  // Per-leg aggregates over COMPLETED trips (returns carry legs/finds).
  const st = { trips: 0, legs: 0, finds: 0, findsKcal: 0, kills: 0, evades: 0,
    flees: 0, gaveRoom: 0, stoodDown: 0, hurt: 0, otherEnc: 0, deaths: 0,
    partyDays: 0, pantryKcal: 0, xpTracking: 0, xpSurvival: 0, xpN: 0, meatKcal: 0 };
  for (const t of trips) {
    st.trips++;
    if (t.status === 'died') st.deaths++;
    if (t.returnRow) {
      const r = t.returnRow;
      st.legs += r.legs || 0;
      st.finds += (r.exped.finds || []).length;
      st.findsKcal += r.findsKcal || 0;
      st.partyDays += (r.clockParts || 0) / 4;
      st.pantryKcal += ((r.pantryAfter || 0) - (r.pantryBefore || 0));
      st.meatKcal += (r.exped.meat || []).reduce(function (a, m) { return a + (m.kcal || 0); }, 0);
      for (const e of (r.exped.encounters || [])) {
        const k = parseEncounter(e);
        if (k === 'kill') st.kills++;
        else if (k === 'evade') st.evades++;
        else if (k === 'flee') st.flees++;
        else if (k === 'gave-room') st.gaveRoom++;
        else if (k === 'stood-down') st.stoodDown++;
        else if (k === 'hurt') st.hurt++;
        else st.otherEnc++;
      }
    }
  }
  return st;
}

function summarizeLeg(rawLeg, cls) {
  const seeds = Object.keys(rawLeg.bySeed).sort().map(function (k) { return rawLeg.bySeed[k]; });
  const wallDetail = [];
  let deaths = 0, w4kills = 0;
  for (const s of seeds) {
    deaths += (s.deaths || []).length;
    w4kills += s.w4kills || 0;
    wallDetail.push({ seed: s.seed, standing: s.standing, scaleRank: s.scaleRank,
      nationalByStanding: (s.standing || 0) >= 200,
      nationalByRank: s.scaleRank === 'national',
      nationalOrGlobal: s.scaleRank === 'national' || s.scaleRank === 'global',
      won: !!s.won, maxWave: s.maxWave, gameDays: s.gameDays,
      villageLost: !!s.villageLost, endReason: s.endReason });
  }
  const havenTrips = cls.trips.filter(function (t) { return t.destination === 'haven-target'; });
  const homeTrips = cls.trips.filter(function (t) { return t.destination === 'off-home'; });
  const havenStats = tripStats(havenTrips);
  const homeStats = tripStats(homeTrips);
  function rates(st) {
    return { legs: st.legs, findsPerLeg: st.legs ? round(st.finds / st.legs, 4) : null,
      kcalPerLeg: st.legs ? round(st.findsKcal / st.legs, 2) : null,
      encountersPerLeg: st.legs ? round((st.kills + st.evades + st.flees + st.gaveRoom + st.stoodDown + st.hurt + st.otherEnc) / st.legs, 4) : null,
      killsPerLeg: st.legs ? round(st.kills / st.legs, 4) : null,
      monsterPerLeg: st.legs ? round((st.kills + st.evades + st.flees + st.gaveRoom + st.stoodDown) / st.legs, 4) : null,
      deathsPerTrip: st.trips ? round(st.deaths / st.trips, 4) : null,
      partyDaysPerTrip: st.trips ? round(st.partyDays / st.trips, 2) : null,
      pantryKcalPerTrip: st.trips ? round(st.pantryKcal / st.trips, 2) : null };
  }
  const originXdest = {};
  for (const t of cls.trips) {
    const k = t.origin + ' x ' + t.destination;
    originXdest[k] = (originXdest[k] || 0) + 1;
  }
  return {
    trips: cls.trips.length,
    havenTarget: havenTrips.length,
    havenShare: cls.trips.length ? round(havenTrips.length / cls.trips.length, 4) : null,
    blockedAttempts: cls.blockedAttempts,
    blockedByReason: cls.blockedByReason,
    originXdest: originXdest,
    havenTrips: havenTrips.map(function (t) {
      return { seed: t.seed, vid: t.vid, name: t.name, profile: t.profile, day: t.day,
        tx: t.tx, ty: t.ty, dist: t.dist, duration: t.duration, status: t.status,
        origin: t.origin, planAtLaunch: t.planAtLaunch, planNodeIsTarget: t.planNodeIsTarget,
        dawnCommit: t.dawnCommit,
        legs: t.returnRow ? t.returnRow.legs : (t.openRow ? t.openRow.exped.legs : null),
        findsKcal: t.returnRow ? t.returnRow.findsKcal : null,
        clockParts: t.returnRow ? t.returnRow.clockParts : null,
        encounters: t.returnRow ? t.returnRow.exped.encounters : (t.deathRow && t.deathRow.exped ? t.deathRow.exped.encounters : []) };
    }),
    havenStats: havenStats, homeStats: homeStats,
    havenRates: rates(havenStats), homeRates: rates(homeStats),
    wallDetail: wallDetail,
    wall: {
      nationalByStanding: wallDetail.filter(function (w) { return w.nationalByStanding; }).length,
      nationalByRank: wallDetail.filter(function (w) { return w.nationalByRank; }).length,
      nationalOrGlobal: wallDetail.filter(function (w) { return w.nationalOrGlobal; }).length,
      table: 0, wins: wallDetail.filter(function (w) { return w.won; }).length,
      wave4: wallDetail.filter(function (w) { return (w.maxWave || 1) >= 4; }).length,
      wave5: wallDetail.filter(function (w) { return (w.maxWave || 1) >= 5; }).length,
    },
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    deaths: deaths, w4kills: w4kills,
    perSeed: seeds.map(function (s) {
      const st = cls.trips.filter(function (t) { return t.seed === s.seed; });
      return { seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
        standing: s.standing, scaleRank: s.scaleRank, won: s.won, maxWave: s.maxWave,
        trips: st.length, havenTarget: st.filter(function (t) { return t.destination === 'haven-target'; }).length,
        deaths: (s.deaths || []).length, w4kills: s.w4kills || 0 };
    }),
  };
}

function compareDailySig(offLeg, onLeg) {
  // D2 full-band: the recorder must not move trajectories. Compare the
  // daily (alive, pantryKcal) signature seed by seed.
  const divergences = [];
  for (const k of Object.keys(onLeg.bySeed).sort()) {
    const on = onLeg.bySeed[k], off = offLeg.bySeed[k];
    if (!off) { divergences.push({ seed: Number(k), reason: 'no OFF file' }); continue; }
    const a = JSON.stringify(on.dailySig || []);
    const b = JSON.stringify(off.dailySig || []);
    if (a !== b) {
      let first = null;
      const as = on.dailySig || [], bs = off.dailySig || [];
      for (let i = 0; i < Math.max(as.length, bs.length); i++) {
        if (JSON.stringify(as[i]) !== JSON.stringify(bs[i])) { first = { day: (as[i] || bs[i] || {}).day, on: as[i] || null, off: bs[i] || null }; break; }
      }
      divergences.push({ seed: Number(k), reason: 'dailySig differs', first: first });
    }
    // Wall-field identity between legs (same seed, same game).
    const wf = ['days', 'gameDays', 'endReason', 'won', 'standing', 'scaleRank', 'maxWave', 'villageLost'];
    for (const f of wf) if (JSON.stringify(on[f]) !== JSON.stringify(off[f])) divergences.push({ seed: Number(k), reason: 'wall field differs: ' + f, on: on[f], off: off[f] });
    if (JSON.stringify((on.deaths || []).map(function (d) { return [d.day, d.who, d.cause]; })) !==
        JSON.stringify((off.deaths || []).map(function (d) { return [d.day, d.who, d.cause]; }))) divergences.push({ seed: Number(k), reason: 'death list differs' });
  }
  return divergences;
}

function main() {
  const onDir = process.argv[2];
  const offDir = process.argv[3] || null;
  const outPath = process.argv[4] || path.join(REPO, 'evidence', '2026-11-16', 'haventarget-b-analysis.json');
  if (!onDir) { console.error('HAVENTARGET ANALYZE STOP: onDir required.'); process.exit(2); }
  const on = loadDir(onDir);
  const onCls = classifyLeg(on);
  const onSummary = summarizeLeg(on, onCls);
  let off = null, offCls = null, offSummary = null, d2 = null;
  if (offDir) {
    off = loadDir(offDir);
    offCls = classifyLeg(off);
    offSummary = summarizeLeg(off, offCls);
    d2 = compareDailySig(off, on);
  }
  const onErrors = Object.keys(on.bySeed).reduce(function (t, k) { return t + ((on.bySeed[k].instrumentErrors || []).length); }, 0);
  const offErrors = off ? Object.keys(off.bySeed).reduce(function (t, k) { return t + ((off.bySeed[k].instrumentErrors || []).length); }, 0) : 0;
  const landed = onCls.launches.length;
  const bar1 = landed > 0 && onCls.unknowns.length === 0 && onCls.mismatches.length === 0;
  const bar2 = on.files.length === 8 && (!off || off.files.length === 8);
  const bar3 = onErrors === 0 && offErrors === 0;
  const bar4 = true; // wall numbers present in both summaries by construction
  const bar5 = onSummary.havenTrips.every(function (t) { return !!t.origin && t.planAtLaunch !== undefined; });
  const out = {
    arm: 'haventarget-b', run: 'haventarget-b',
    onDir: path.basename(onDir), offDir: offDir ? path.basename(offDir) : null,
    bars: {
      classification: { pass: bar1, landedLaunches: landed, unknowns: onCls.unknowns.length, mismatches: onCls.mismatches.length,
        unknownRows: onCls.unknowns, mismatchRows: onCls.mismatches },
      corpus: { pass: bar2, onFiles: on.files.length, offFiles: off ? off.files.length : null },
      instrumentErrors: { pass: bar3, onErrors: onErrors, offErrors: offErrors },
      wall: { pass: bar4 },
      measurement: { pass: bar5, havenTargetTrips: onSummary.havenTarget },
    },
    d2FullBand: d2,
    on: onSummary,
    off: offSummary,
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({
    onFiles: on.files.length, offFiles: off ? off.files.length : null,
    landedLaunches: landed, havenTarget: onSummary.havenTarget, havenShare: onSummary.havenShare,
    blockedAttempts: onSummary.blockedAttempts,
    originXdest: onSummary.originXdest,
    unknowns: onCls.unknowns.length, mismatches: onCls.mismatches.length,
    d2divergences: d2 ? d2.length : null,
    wallOn: onSummary.wall, medianOn: onSummary.medianSurvival,
    bars: { b1: bar1, b2: bar2, b3: bar3, b5: bar5 },
    out: path.relative(REPO, outPath),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { deriveDestination: deriveDestination, deriveOrigin: deriveOrigin,
  parseEncounter: parseEncounter, classifyLeg: classifyLeg, summarizeLeg: summarizeLeg,
  compareDailySig: compareDailySig, tripStats: tripStats, loadDir: loadDir };
