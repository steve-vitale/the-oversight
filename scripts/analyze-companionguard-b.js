// analyze-companionguard-b.js — analyzer, arm sim-companionguard-b
// (BUILD: the companion call clobbers a live expedition — findings
// backlog #2462). Extends analyze-medicduty-b.js: loads the ARMED +
// CONTROL corpora, re-derives every launch's destination + origin AND
// every attempt's block reason + candidate-duty flag from the raw
// recorded fields (D3) — plus the guard re-derivation (a
// 'companion-guard' row must carry guardSkipped=true, a live record
// before the call, and an incremented guard counter) — assembles
// trips, and reports the verdict tables: orphan trips per leg (GO
// bar 1), party launches per leg (GO bar 2), starvation deaths +
// median survival (GO bar 3), and the wall numbers per leg (GO
// bar 5). NOTE: the two legs are DIFFERENT game states by design
// (the guard changes the RNG stream at the first skip), so there is
// NO cross-leg trajectory-identity check here — the D2 recorder
// neutrality proof lives in scripts/test-companionguard-b.js
// (recorder ON vs OFF, same guard state).
// Usage:
//   node scripts/analyze-companionguard-b.js evidence/2026-11-16/perseed-companionguard-b-armed [evidence/2026-11-16/perseed-companionguard-b-control] [evidence/2026-11-16/companionguard-b-analysis.json]
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
  const files = fs.readdirSync(full).filter(function (f) { return f.indexOf('companionguard-b-s') === 0 && f.slice(-5) === '.json'; }).sort();
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

// Re-derive the block reason from the raw pre-call gate fields
// (D3). Independent re-implementation of the driver's
// deriveBlockReasonFromGate, same true gate order: medic-duty,
// hurt-no-care, sick, range-0. A stored reason that disagrees is a
// mismatch, not a rounding error.
function deriveBlockReasonFromGate(gate, vid) {
  if (!gate) return 'unknown-block';
  if (!gate.directed && gate.dutyHolder && gate.dutyHolder === vid) return 'medic-duty';
  if (gate.health != null && gate.health < 70 && !gate.medicineExists && !gate.campHealer) return 'hurt-no-care';
  if (gate.sick) return 'sick';
  if (gate.maxDist != null && gate.maxDist < 1) return 'range-0';
  return 'unknown-block';
}
// Re-derive the guard-skip flag from the raw recorded fields (D3,
// this arm). A genuine guard skip fired the guard (counter
// incremented) on a villager who was already out (live record before
// the call). The identity fallback (guard on + same record after the
// call) is not re-derivable from stored rows, so the counter is the
// binding re-derivation; rows without counter fields fall back to
// the stored flag + a kept record.
function deriveGuardSkipped(row) {
  if (!row) return false;
  if (row.preGuardCount != null && row.postGuardCount != null) {
    return !!row.hadLiveExped && row.postGuardCount > row.preGuardCount;
  }
  return !!row.guardSkipped && !!row.overwrote;
}
// Count distinct party launches (inviter departures) among landed
// directed calls: the first call of a (day, part, tx, ty, duration)
// group is the inviter; later calls in the group are companions on
// the same shared target. Two independent parties sharing all five
// fields in one part would collide — noted, not corrected; the
// medicduty band shows party launches are sparse per part.
function countPartyLaunches(launches) {
  const seen = {};
  let n = 0;
  for (const row of (launches || [])) {
    if (!row.landed || !row.hasOpts) continue;
    // Flattened (analyzer launches entries) or nested (raw driver
    // rows) — both shapes carry the same five fields.
    const tx = row.tx != null ? row.tx : (row.exped ? row.exped.tx : null);
    const ty = row.ty != null ? row.ty : (row.exped ? row.exped.ty : null);
    const dur = row.duration != null ? row.duration : (row.exped ? row.exped.duration : null);
    if (tx == null || ty == null || dur == null) continue;
    const k = row.day + '|' + row.part + '|' + tx + '|' + ty + '|' + dur;
    if (!seen[k]) { seen[k] = true; n++; }
  }
  return n;
}
function isStarvationDeath(d) {
  if (!d) return false;
  return /starv/i.test(d.cause || '') || /starv/i.test(d.kind || '');
}
function deriveIsDuty(row) {
  if (!row || !row.dutyHolder) return false;
  return row.dutyHolder.vid != null && row.dutyHolder.vid === row.vid;
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
  let blocked = 0, orphans = 0, guardSkips = 0;
  const blockedByReason = {};
  const attemptsBySeed = {};
  const repick = {}; // seed -> holder vid -> {name, count, days[]}
  const poolOnMedicBlocks = []; // poolDepth on every medic-duty block
  for (const s of seeds) {
    attemptsBySeed[s.seed] = { seed: s.seed, attempts: 0, landed: 0, orphans: 0, guardSkips: 0, blockedByReason: {} };
    const retByKey = {}, deathByKey = {};
    for (const r of (s.returns || [])) retByKey[r.vid + '|' + r.exped.sinceDay + '|' + r.exped.sincePart] = r;
    for (const d of (s.expedDeaths || [])) deathByKey[d.vid + '|' + (d.exped ? d.exped.sinceDay : '?') + '|' + (d.exped ? d.exped.sincePart : '?')] = d;
    const openByKey = {};
    for (const o of (s.openExped || [])) openByKey[o.vid + '|' + o.exped.sinceDay + '|' + o.exped.sincePart] = o;
    // Overwrite map: a LANDED launch that replaced a live expedition
    // for the same villager orphans the earlier trip (no return ever
    // fires for it). Keyed by the orphaned trip's sinceDay/sincePart.
    const overwriteByKey = {};
    for (const row of (s.launches || [])) {
      if (row.landed && row.overwrote) overwriteByKey[row.vid + '|' + row.overwrote.sinceDay + '|' + row.overwrote.sincePart] = row;
    }
    const matchedRet = {}, matchedDeath = {}, matchedOpen = {};
    for (const row of (s.launches || [])) {
      attemptsBySeed[s.seed].attempts++;
      const dest = deriveDestination(row);
      const origin = deriveOrigin(row.stackTop, row.hasOpts);
      if (row.origin !== origin) mismatches.push({ seed: s.seed, vid: row.vid, day: row.day, kind: 'origin', stored: row.origin, rederived: origin });
      if (origin === 'unknown') unknowns.push({ seed: s.seed, vid: row.vid, day: row.day, reason: 'no stack frame names a caller; hook: stackTop capture' });
      // D3 (this arm): candidate-duty flag re-derived from the raw
      // duty-holder field on EVERY attempt row.
      const reIsDuty = deriveIsDuty(row);
      const storedIsDuty = !!(row.candidate && row.candidate.isDuty);
      if (storedIsDuty !== reIsDuty) mismatches.push({ seed: s.seed, vid: row.vid, day: row.day, kind: 'candidate-duty',
        stored: storedIsDuty, rederived: reIsDuty, dutyHolder: row.dutyHolder ? row.dutyHolder.vid : null });
      if (dest === 'not-launched') {
        blocked++;
        const br = row.blockReason || 'unknown-block';
        blockedByReason[br] = (blockedByReason[br] || 0) + 1;
        attemptsBySeed[s.seed].blockedByReason[br] = (attemptsBySeed[s.seed].blockedByReason[br] || 0) + 1;
        if (br === 'companion-guard') {
          // D3 (this arm): a guard skip re-derives from the raw
          // guard fields (live record + incremented counter), NOT
          // from the gate — the gate would say unknown-block for a
          // healthy villager, which is correct gate behavior; the
          // guard is a separate reason.
          guardSkips++;
          attemptsBySeed[s.seed].guardSkips++;
          const reGuard = deriveGuardSkipped(row);
          if (!reGuard || row.guardSkipped !== true) mismatches.push({ seed: s.seed, vid: row.vid, day: row.day, kind: 'guard-skip',
            stored: row.guardSkipped, rederived: reGuard, hadLiveExped: row.hadLiveExped || null,
            preGuardCount: row.preGuardCount != null ? row.preGuardCount : null,
            postGuardCount: row.postGuardCount != null ? row.postGuardCount : null });
          if (!row.overwrote) unknowns.push({ seed: s.seed, vid: row.vid, day: row.day, reason: 'companion-guard row with no kept-record capture; hook: overwrote clone' });
          continue;
        }
        // D3 (this arm): block reason re-derived from the raw
        // pre-call gate snapshot in true gate order.
        const reBr = deriveBlockReasonFromGate(row.gate, row.vid);
        if (reBr !== br) mismatches.push({ seed: s.seed, vid: row.vid, day: row.day, kind: 'block-reason',
          stored: br, rederived: reBr, gate: row.gate || null });
        if (br === 'unknown-block') unknowns.push({ seed: s.seed, vid: row.vid, day: row.day, reason: 'no gate explains the block; hook: gateSnapshot fields' });
        if (br === 'medic-duty') {
          const holder = row.dutyHolder ? row.dutyHolder.vid : row.vid;
          repick[s.seed] = repick[s.seed] || {};
          repick[s.seed][holder] = repick[s.seed][holder] || { vid: holder, name: (row.dutyHolder && row.dutyHolder.name) || row.name, count: 0, days: [] };
          repick[s.seed][holder].count++;
          repick[s.seed][holder].days.push(row.day);
          poolOnMedicBlocks.push({ seed: s.seed, vid: row.vid, day: row.day, poolDepth: (row.poolDepth != null ? row.poolDepth : null) });
          if (row.poolDepth == null) unknowns.push({ seed: s.seed, vid: row.vid, day: row.day, reason: 'medic-duty block with no pool snapshot; hook: launchEligiblePool' });
        }
        continue;
      }
      attemptsBySeed[s.seed].landed++;
      // Orphan: a LANDED call that replaced a live record. (A
      // guard-skipped row also carries `overwrote` — the record that
      // was KEPT — but it is not landed, so it never reaches here.)
      if (row.overwrote) { orphans++; attemptsBySeed[s.seed].orphans++; }
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
      else if (overwriteByKey[key]) {
        // Overwritten: a later landed launch for the same villager
        // replaced this trip's record mid-flight. The orphan's
        // partial legs/finds at overwrite time are the only record.
        const ow = overwriteByKey[key];
        trip.status = 'overwritten';
        trip.overwrittenBy = { day: ow.day, part: ow.part, vid: ow.vid, name: ow.name };
        trip.partialLegs = ow.overwrote.legs != null ? ow.overwrote.legs : null;
        trip.partialFindsKcal = (ow.overwrote.finds || []).reduce(function (t, f) { return t + (f.kcal || 0); }, 0);
      }
      else { trip.status = 'unmatched'; unknowns.push({ seed: s.seed, vid: row.vid, day: row.day, reason: 'landed launch with no return/death/open record; hook: expeditionReturn/expedDeath wrap' }); }
      trips.push(trip);
      launches.push({ seed: s.seed, vid: row.vid, day: row.day, part: row.part, destination: dest, origin: origin,
        landed: true, hasOpts: !!row.hasOpts, tx: row.exped.tx, ty: row.exped.ty, duration: row.exped.duration,
        overwrote: !!row.overwrote });
    }
    for (const k of Object.keys(retByKey)) if (!matchedRet[k]) unknowns.push({ seed: s.seed, key: k, reason: 'return with no launch row; hook: startExpedition wrap' });
    for (const k of Object.keys(deathByKey)) if (!matchedDeath[k]) unknowns.push({ seed: s.seed, key: k, reason: 'expedition death with no launch row; hook: startExpedition wrap' });
    for (const k of Object.keys(openByKey)) if (!matchedOpen[k]) unknowns.push({ seed: s.seed, key: k, reason: 'open expedition with no launch row; hook: startExpedition wrap' });
  }
  return { launches: launches, trips: trips, mismatches: mismatches, unknowns: unknowns,
    blockedAttempts: blocked, blockedByReason: blockedByReason,
    orphans: orphans, guardSkips: guardSkips,
    partyLaunches: countPartyLaunches(launches),
    attemptsBySeed: attemptsBySeed, repick: repick, poolOnMedicBlocks: poolOnMedicBlocks };
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
  let deaths = 0, w4kills = 0, starvationDeaths = 0;
  for (const s of seeds) {
    deaths += (s.deaths || []).length;
    starvationDeaths += (s.deaths || []).filter(isStarvationDeath).length;
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
  // ---- medic-duty tables (this arm's verdict) ----
  const attemptTable = Object.keys(cls.attemptsBySeed || {}).sort().map(function (k) { return cls.attemptsBySeed[k]; });
  const totalAttempts = attemptTable.reduce(function (t, r) { return t + r.attempts; }, 0);
  const repickTable = [];
  Object.keys(cls.repick || {}).sort().forEach(function (seed) {
    Object.keys(cls.repick[seed]).forEach(function (vid) {
      const r = cls.repick[seed][vid];
      repickTable.push({ seed: Number(seed), holderVid: vid, holderName: r.name, blocks: r.count, days: r.days });
    });
  });
  repickTable.sort(function (a, b) { return b.blocks - a.blocks || a.seed - b.seed; });
  const poolDepths = (cls.poolOnMedicBlocks || []).map(function (p) { return p.poolDepth; }).filter(function (d) { return d != null; });
  const poolOnMedic = { n: (cls.poolOnMedicBlocks || []).length,
    withSnapshot: poolDepths.length,
    poolEmpty: poolDepths.filter(function (d) { return d === 0; }).length,
    poolNonEmpty: poolDepths.filter(function (d) { return d >= 1; }).length,
    min: poolDepths.length ? Math.min.apply(null, poolDepths) : null,
    median: med(poolDepths),
    max: poolDepths.length ? Math.max.apply(null, poolDepths) : null };
  // Starved seed (frozen prereg): same medic-duty holder re-picked
  // as candidate >=3 times AND the seed launches 0 expeditions.
  const starvedSeeds = [];
  attemptTable.forEach(function (row) {
    if (row.landed !== 0) return;
    const holders = (cls.repick || {})[row.seed] || {};
    Object.keys(holders).forEach(function (vid) {
      if (holders[vid].count >= 3) starvedSeeds.push({ seed: row.seed, holderVid: vid,
        holderName: holders[vid].name, repicks: holders[vid].count, days: holders[vid].days,
        attempts: row.attempts, landed: row.landed });
    });
  });
  const zeroLaunchSeeds = attemptTable.filter(function (r) { return r.landed === 0; }).map(function (r) { return r.seed; });
  return {
    trips: cls.trips.length,
    havenTarget: havenTrips.length,
    havenShare: cls.trips.length ? round(havenTrips.length / cls.trips.length, 4) : null,
    blockedAttempts: cls.blockedAttempts,
    blockedByReason: cls.blockedByReason,
    // ---- companion-guard verdict tables ----
    orphans: cls.orphans,
    guardSkips: cls.guardSkips,
    partyLaunches: cls.partyLaunches,
    starvationDeaths: starvationDeaths,
    // ---- medic-duty verdict tables ----
    totalAttempts: totalAttempts,
    attemptTable: attemptTable,
    blockedShareByReason: (function () {
      const out = {};
      Object.keys(cls.blockedByReason).forEach(function (k) { out[k] = totalAttempts ? round(cls.blockedByReason[k] / totalAttempts, 4) : null; });
      return out;
    })(),
    repickTable: repickTable,
    poolOnMedicDutyBlocks: poolOnMedic,
    starvedSeeds: starvedSeeds,
    zeroLaunchSeeds: zeroLaunchSeeds,
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
    deaths: deaths, starvationDeaths: starvationDeaths, w4kills: w4kills,
    perSeed: seeds.map(function (s) {
      const st = cls.trips.filter(function (t) { return t.seed === s.seed; });
      const att = (cls.attemptsBySeed || {})[s.seed] || { attempts: 0, landed: 0, blockedByReason: {} };
      const seedLaunches = cls.launches.filter(function (l) { return l.seed === s.seed; });
      return { seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
        standing: s.standing, scaleRank: s.scaleRank, won: s.won, maxWave: s.maxWave,
        trips: st.length, havenTarget: st.filter(function (t) { return t.destination === 'haven-target'; }).length,
        attempts: att.attempts, landedLaunches: att.landed, orphans: att.orphans || 0,
        guardSkips: att.guardSkips || 0,
        partyLaunches: countPartyLaunches(seedLaunches),
        blockedByReason: att.blockedByReason,
        deaths: (s.deaths || []).length,
        starvationDeaths: (s.deaths || []).filter(isStarvationDeath).length,
        w4kills: s.w4kills || 0 };
    }),
  };
}

// NO cross-leg trajectory-identity check in this arm (unlike the
// medicduty D2 full-band check). The two legs are DIFFERENT game
// states by design: the guard returns before startExpedition's R()
// draws, so the armed leg's RNG stream diverges from the control
// leg's at the first skip, and daily signatures / wall fields are
// EXPECTED to differ. Trajectory identity between legs would be a
// category error here. Recorder neutrality (the instrument moving
// nothing) is proven instead by the proof test's D2 leg: recorder ON
// vs OFF on the same guard state, same seed, identical daily
// signatures + wall fields.

function main() {
  const armedDir = process.argv[2];
  const controlDir = process.argv[3] || null;
  const outPath = process.argv[4] || path.join(REPO, 'evidence', '2026-11-16', 'companionguard-b-analysis.json');
  if (!armedDir) { console.error('COMPANIONGUARD ANALYZE STOP: armedDir required.'); process.exit(2); }
  const armed = loadDir(armedDir);
  const armedCls = classifyLeg(armed);
  const armedSummary = summarizeLeg(armed, armedCls);
  let control = null, controlCls = null, controlSummary = null;
  if (controlDir) {
    control = loadDir(controlDir);
    controlCls = classifyLeg(control);
    controlSummary = summarizeLeg(control, controlCls);
  }
  const armedErrors = Object.keys(armed.bySeed).reduce(function (t, k) { return t + ((armed.bySeed[k].instrumentErrors || []).length); }, 0);
  const controlErrors = control ? Object.keys(control.bySeed).reduce(function (t, k) { return t + ((control.bySeed[k].instrumentErrors || []).length); }, 0) : 0;
  const landed = armedCls.launches.length;
  const totalAttempts = armedSummary.totalAttempts;
  // Classification bar (both legs): every attempt classified, no
  // unknowns, no re-derivation mismatches, no unknown-block rows.
  const classArmed = totalAttempts > 0 && armedCls.unknowns.length === 0 && armedCls.mismatches.length === 0 &&
    (armedSummary.blockedByReason['unknown-block'] || 0) === 0;
  const classControl = !control || (controlCls.unknowns.length === 0 && controlCls.mismatches.length === 0 &&
    (controlSummary.blockedByReason['unknown-block'] || 0) === 0);
  const barClass = classArmed && classControl;
  const barCorpus = armed.files.length === 8 && (!control || control.files.length === 8);
  const barErrors = armedErrors === 0 && controlErrors === 0;
  // GO bar 1 (frozen prereg): orphan trips 0 on the armed leg.
  const go1 = armedSummary.orphans === 0;
  // GO bar 2 (frozen prereg): party launches hold — armed total at
  // least control total minus 2.
  const go2 = !control || armedSummary.partyLaunches >= controlSummary.partyLaunches - 2;
  // GO bar 3 (frozen prereg): cost bar — starvation no worse than
  // control + 2 AND median survival at least 0.8x control median.
  const go3 = !control || (armedSummary.starvationDeaths <= controlSummary.starvationDeaths + 2 &&
    controlSummary.medianSurvival != null && armedSummary.medianSurvival != null &&
    armedSummary.medianSurvival >= 0.8 * controlSummary.medianSurvival);
  // GO bar 5 (frozen prereg): wall numbers present in both summaries
  // by construction.
  const go5 = true;
  // Guard accounting (this arm): every guard skip in the rows matches
  // the village counter at end of run, per seed; the control leg
  // must show zero skips and a zero counter (guard never fires).
  const guardAccounting = Object.keys(armed.bySeed).every(function (k) {
    const s = armed.bySeed[k];
    return (s.guardSkips || 0) === (s.guardSkipsState || 0);
  }) && (!control || Object.keys(control.bySeed).every(function (k) {
    const s = control.bySeed[k];
    return (s.guardSkips || 0) === 0 && (s.guardSkipsState || 0) === 0;
  }));
  // Measurement bar (carried from medicduty): every medic-duty-blocked
  // attempt carries its candidate, its pool snapshot, and its duty holder.
  const barMeas = (function () {
    for (const k of Object.keys(armed.bySeed)) {
      for (const row of (armed.bySeed[k].launches || [])) {
        if (!row.landed && row.blockReason === 'medic-duty') {
          if (!row.candidate || row.poolDepth == null || !row.dutyHolder) return false;
        }
      }
    }
    return true;
  })();
  const out = {
    arm: 'companionguard-b', run: 'companionguard-b',
    armedDir: path.basename(armedDir), controlDir: controlDir ? path.basename(controlDir) : null,
    bars: {
      classification: { pass: barClass, totalAttempts: totalAttempts, landedLaunches: landed,
        blockedAttempts: armedSummary.blockedAttempts, blockedByReason: armedSummary.blockedByReason,
        unknowns: armedCls.unknowns.length, mismatches: armedCls.mismatches.length,
        unknownRows: armedCls.unknowns, mismatchRows: armedCls.mismatches },
      corpus: { pass: barCorpus, armedFiles: armed.files.length, controlFiles: control ? control.files.length : null },
      instrumentErrors: { pass: barErrors, armedErrors: armedErrors, controlErrors: controlErrors },
      wall: { pass: go5 },
      measurement: { pass: barMeas, medicDutyBlocks: armedSummary.blockedByReason['medic-duty'] || 0,
        starvedSeeds: armedSummary.starvedSeeds, poolOnMedicDutyBlocks: armedSummary.poolOnMedicDutyBlocks },
      go1OrphansZero: { pass: go1, armedOrphans: armedSummary.orphans,
        controlOrphans: control ? controlSummary.orphans : null },
      go2PartyLaunches: { pass: go2, armedPartyLaunches: armedSummary.partyLaunches,
        controlPartyLaunches: control ? controlSummary.partyLaunches : null,
        armedPerCallLanded: armedSummary.attemptTable.reduce(function (t, r) { return t + r.landed; }, 0),
        controlPerCallLanded: control ? controlSummary.attemptTable.reduce(function (t, r) { return t + r.landed; }, 0) : null },
      go3Cost: { pass: go3, armedStarvation: armedSummary.starvationDeaths,
        controlStarvation: control ? controlSummary.starvationDeaths : null,
        armedMedian: armedSummary.medianSurvival,
        controlMedian: control ? controlSummary.medianSurvival : null },
      guardAccounting: { pass: guardAccounting, armedGuardSkips: armedSummary.guardSkips,
        controlGuardSkips: control ? controlSummary.guardSkips : null },
    },
    armed: armedSummary,
    control: controlSummary,
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({
    armedFiles: armed.files.length, controlFiles: control ? control.files.length : null,
    totalAttempts: totalAttempts, landedLaunches: landed,
    armedOrphans: armedSummary.orphans, controlOrphans: control ? controlSummary.orphans : null,
    armedGuardSkips: armedSummary.guardSkips, controlGuardSkips: control ? controlSummary.guardSkips : null,
    armedPartyLaunches: armedSummary.partyLaunches, controlPartyLaunches: control ? controlSummary.partyLaunches : null,
    armedStarvation: armedSummary.starvationDeaths, controlStarvation: control ? controlSummary.starvationDeaths : null,
    armedMedian: armedSummary.medianSurvival, controlMedian: control ? controlSummary.medianSurvival : null,
    blockedAttempts: armedSummary.blockedAttempts, blockedByReason: armedSummary.blockedByReason,
    blockedShareByReason: armedSummary.blockedShareByReason,
    originXdest: armedSummary.originXdest,
    unknowns: armedCls.unknowns.length, mismatches: armedCls.mismatches.length,
    wallArmed: armedSummary.wall, wallControl: control ? controlSummary.wall : null,
    bars: { class: barClass, corpus: barCorpus, errors: barErrors, go1: go1, go2: go2, go3: go3, go5: go5, guardAccounting: guardAccounting, meas: barMeas },
    out: path.relative(REPO, outPath),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { deriveDestination: deriveDestination, deriveOrigin: deriveOrigin,
  deriveBlockReasonFromGate: deriveBlockReasonFromGate, deriveIsDuty: deriveIsDuty,
  parseEncounter: parseEncounter, classifyLeg: classifyLeg, summarizeLeg: summarizeLeg,
  tripStats: tripStats, loadDir: loadDir, deriveGuardSkipped: deriveGuardSkipped,
  countPartyLaunches: countPartyLaunches, isStarvationDeath: isStarvationDeath };
