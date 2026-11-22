// analyze-leadgate-a.js — DIAG analyzer, arm sim-leadgate-a
// Reads the leadgate-driver-a.js corpus (per-seed JSONs) and answers:
// WHO leads wave-4+ parties, and why is the armed holder never the
// lead? Per launch / per fight lead tables, the gun-holder-vs-lead
// comparison, and the frozen-bar verdict (see the sim-leadgate-a
// prereg §7).
// Usage:
//   node scripts/analyze-leadgate-a.js --dir <corpus-dir> --out <file>
//   node scripts/analyze-leadgate-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');

// Wave-4+ id set (frozen list from src/data/monsters.json —
// re-read live so the analyzer refuses a stale roster silently).
// A plan is wave-4+ when its needWave is >= 4 OR its target is a
// wave-4+ species: the companion sync in launchParty copies target
// but NOT needWave (win-plan.js), so a companion-inherited plan can
// carry a wave-4 target with needWave null. needWave alone
// UNDERCOUNTS the wave-4 plan population (14 vs 25 on the judged
// band — see the evidence file's metric review).
const W4P_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald',
  'cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'network_note'];
function loadWave4pIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4P_IDS_FROZEN.slice().sort(); }
}
const W4P_SET = new Set(loadWave4pIds());
function isW4Plan(plan) {
  return !!(plan && (((plan.needWave | 0) >= 4) || (plan.target && W4P_SET.has(plan.target))));
}

function isAttrs(a) {
  return !!(a && typeof a === 'object' && typeof a.vid === 'string' && typeof a.hp === 'number');
}
function memberGun(m) {
  return !!(m && (m.gunEquipped || (m.gunCarried | 0) > 0));
}
function leadSummary(m) {
  if (!isAttrs(m)) return null;
  return { vid: m.vid, hp: m.hp, armed: !!m.armed, armored: !!m.armored,
    armorP: m.armorP | 0, weaponB: m.weaponB | 0, profile: m.profile || null,
    temper: m.temper || null, goal: m.goal || null, occupation: m.occupation || null,
    killsTotal: m.killsTotal | 0, kills3: m.kills3 | 0, kills4: m.kills4 | 0,
    veteran3: !!m.veteran3, veteran4: !!m.veteran4,
    gunEquipped: !!m.gunEquipped, gunCarried: m.gunCarried | 0, cells: m.cells | 0,
    planStage: (m.plan && m.plan.stage) || null,
    planTarget: (m.plan && m.plan.target) || null,
    planNeedWave: (m.plan && m.plan.needWave != null) ? (m.plan.needWave | 0) : null,
    atHaven: m.atHaven, away: !!m.away, engaged: !!m.engaged,
    onExped: !!m.onExped, sick: !!m.sick, dead: !!m.dead };
}

function analyzeSeed(out) {
  const seed = out.seed;
  const errors = (out.instrumentErrors || []).length;
  const wall = { seed: seed, days: out.days, gameDays: out.gameDays,
    endReason: out.endReason || null, won: !!out.won, villageLost: !!out.villageLost,
    maxWave: out.maxWave, unlockedWave: out.unlockedWave,
    standing: out.standing, scaleRank: out.scaleRank || null,
    deaths: (out.deaths || []).length };
  // Grants: contest searcaster grants (prizeEvents gains gunsGained>0).
  const grants = [];
  for (const p of (out.prizeEvents || [])) {
    for (const g of (p.gains || [])) {
      if ((g.gunsGained | 0) > 0) {
        grants.push({ seq: p.seq, day: p.day, holder: g.holder || null,
          gunsGained: g.gunsGained | 0, cellsGained: g.cellsGained | 0,
          cellsAfter: (g.cellsAfter != null ? g.cellsAfter : null) });
      }
    }
  }
  // Grant accounting: each grant holder must appear in the gun census.
  const censusVids = {};
  for (const r of (out.v4gunLoc || [])) {
    for (const l of (r.locations || [])) {
      if (l.vid) censusVids[l.vid] = true;
      if (l.loc === 'corpse' && l.cvid) censusVids[l.cvid] = true;
    }
  }
  for (const r of (out.planCensus || [])) if (r.vid) censusVids[r.vid] = true;
  let grantsUnaccounted = 0;
  for (const g of grants) {
    g.accounted = !!(g.holder && censusVids[g.holder]);
    if (!g.accounted) grantsUnaccounted++;
  }
  // Launches.
  const launches = [];
  let launchesAttributed = 0, launchesTotal = 0, holdsTotal = 0;
  for (const d of (out.v4departs || [])) {
    if (d.result === 'hold') { holdsTotal++; continue; }
    if (d.result !== 'launch') continue;
    launchesTotal++;
    const members = d.members || [];
    const lead = members.length ? members[0] : null;
    const attributed = isAttrs(lead);
    if (attributed) launchesAttributed++;
    let memberGaps = 0;
    for (let i = 1; i < members.length; i++) if (!isAttrs(members[i])) memberGaps++;
    const gunInParty = members.some(memberGun);
    launches.push({ seed: seed, day: d.day, vid: d.vid, source: d.source || null,
      target: d.target || null, needWave: (d.needWave != null ? (d.needWave | 0) : null),
      stage: d.stage || null, party: (d.party || []).slice(),
      partySize: d.partySize | 0, attributed: attributed, memberGaps: memberGaps,
      lead: leadSummary(lead),
      gunHolderIsLead: !!(lead && memberGun(lead)),
      gunHolderInParty: gunInParty,
      companions: members.slice(1).map(leadSummary) });
  }
  // Fights.
  const fights = [];
  let fightsAttributed = 0, fightsTotal = 0;
  for (const f of (out.v4fights || [])) {
    fightsTotal++;
    const lead = f.lead || null;
    const attributed = isAttrs(lead);
    if (attributed) fightsAttributed++;
    const allies = f.allies || [];
    let allyGaps = 0;
    for (let i = 0; i < allies.length; i++) if (!isAttrs(allies[i])) allyGaps++;
    const party = [f.vid].concat(f.allyVids || []);
    const gunInParty = (lead && memberGun(lead)) || allies.some(memberGun);
    fights.push({ seed: seed, day: f.day, vid: f.vid, mid: f.mid, wave: f.wave | 0,
      outcome: f.outcome || null, rounds: f.rounds | 0,
      party: party, partySize: party.length, attributed: attributed, allyGaps: allyGaps,
      lead: leadSummary(lead),
      gunHolderIsLead: !!(lead && memberGun(lead)),
      gunHolderInParty: !!gunInParty,
      allies: allies.map(leadSummary),
      volley: f.volley || null });
  }
  // Plan seeds.
  const seeds = [];
  for (const s of (out.planSeeds || [])) {
    seeds.push({ seed: seed, day: s.day, vid: s.vid, mid: s.mid, wave: s.wave | 0,
      outcome: s.outcome || null, seeded: !!s.seeded,
      stageAfter: (s.after && s.after.stage) || null,
      targetAfter: (s.after && s.after.target) || null,
      needWaveAfter: (s.after && s.after.needWave != null) ? (s.after.needWave | 0) : null });
  }
  // Gun-holder spells from the daily plan census: per holder, days
  // holding a gun equipped, days holding a wave-4+ plan, days with
  // both, and the plan stages seen. A holder-day counts as gun-held
  // when attrs show gunEquipped or gunCarried > 0.
  const holderDays = {};
  for (const r of (out.planCensus || [])) {
    const a = r.attrs || null;
    if (!a || !a.vid) continue;
    const vid = a.vid;
    if (!holderDays[vid]) holderDays[vid] = { vid: vid, days: 0, gunDays: 0,
      gunEquippedDays: 0, planDays: 0, w4planDays: 0, gunAndW4planDays: 0,
      stages: {}, gunStages: {}, firstDay: r.day, lastDay: r.day,
      maxKills3: 0, maxKills4: 0, everVeteran3: false, everVeteran4: false,
      everArmed: false, everArmored: false, profiles: {} };
    const h = holderDays[vid];
    h.days++;
    if (r.day < h.firstDay) h.firstDay = r.day;
    if (r.day > h.lastDay) h.lastDay = r.day;
    const hasGun = memberGun(a);
    if (hasGun) h.gunDays++;
    if (a.gunEquipped) h.gunEquippedDays++;
    const plan = a.plan || null;
    const hasPlan = !!plan;
    const w4plan = isW4Plan(plan);
    if (hasPlan) {
      h.planDays++;
      h.stages[plan.stage || 'null'] = (h.stages[plan.stage || 'null'] || 0) + 1;
    }
    if (w4plan) {
      h.w4planDays++;
      if (hasGun) h.gunAndW4planDays++;
      if (hasGun) h.gunStages[plan.stage || 'null'] = (h.gunStages[plan.stage || 'null'] || 0) + 1;
    }
    if ((a.kills3 | 0) > h.maxKills3) h.maxKills3 = a.kills3 | 0;
    if ((a.kills4 | 0) > h.maxKills4) h.maxKills4 = a.kills4 | 0;
    if (a.veteran3) h.everVeteran3 = true;
    if (a.veteran4) h.everVeteran4 = true;
    if (a.armed) h.everArmed = true;
    if (a.armored) h.everArmored = true;
    if (a.profile) h.profiles[a.profile] = (h.profiles[a.profile] || 0) + 1;
  }
  // Launches / fights led while holding a gun, per holder.
  const ledWhileHolding = {};
  // Launches / fights led by anyone, per holder (for the w4-holder
  // table — NOT gun-gated; ledWhileHolding above is gun-gated only).
  const ledCounts = {};
  for (const l of launches) {
    ledCounts[l.vid] = ledCounts[l.vid] || { launches: 0, fights: 0 };
    ledCounts[l.vid].launches++;
    if (l.gunHolderIsLead) {
      ledWhileHolding[l.vid] = ledWhileHolding[l.vid] || { launches: 0, fights: 0 };
      ledWhileHolding[l.vid].launches++;
    }
  }
  for (const f of fights) {
    ledCounts[f.vid] = ledCounts[f.vid] || { launches: 0, fights: 0 };
    ledCounts[f.vid].fights++;
    if (f.gunHolderIsLead) {
      ledWhileHolding[f.vid] = ledWhileHolding[f.vid] || { launches: 0, fights: 0 };
      ledWhileHolding[f.vid].fights++;
    }
  }
  const gunHolders = Object.keys(holderDays).map(function (vid) {
    const h = holderDays[vid];
    const led = ledWhileHolding[vid] || { launches: 0, fights: 0 };
    return Object.assign({}, h, { launchesLedWhileHolding: led.launches,
      fightsLedWhileHolding: led.fights });
  }).filter(function (h) { return h.gunDays > 0; });
  // Wave-4+ plan holders (corrected definition — needWave OR target):
  // who holds a wave-4+ plan at all, and did they ever launch it.
  const w4Holders = Object.keys(holderDays).map(function (vid) {
    const h = holderDays[vid];
    const led = ledCounts[vid] || { launches: 0, fights: 0 };
    return { vid: vid, days: h.days, w4planDays: h.w4planDays,
      stages: h.stages, profile: (function () {
        let top = null, topN = 0;
        for (const p of Object.keys(h.profiles || {})) if (h.profiles[p] > topN) { top = p; topN = h.profiles[p]; }
        return top;
      })(),
      launchesLed: led.launches, fightsLed: led.fights };
  }).filter(function (h) { return h.w4planDays > 0; });
  // Seeder profile flip + outcome split: for each seeded plan, the
  // seeder's range profile at seed time (nearest census row on/after
  // the seed day), and the seed outcome (fled vs evaded).
  const censusByVid = {};
  for (const r of (out.planCensus || [])) {
    if (!r.vid) continue;
    (censusByVid[r.vid] = censusByVid[r.vid] || []).push(r);
  }
  function profileAt(vid, day) {
    const rows = censusByVid[vid] || [];
    for (let i = 0; i < rows.length; i++) if (rows[i].day >= day) return (rows[i].attrs || {}).profile || null;
    if (rows.length) return (rows[rows.length - 1].attrs || {}).profile || null;
    return null;
  }
  const seedProfileFlip = { w3: {}, w4: {}, w5: {} };
  const seedOutcomes = { w3: {}, w4: {}, w5: {} };
  for (const s of seeds) {
    if (!s.seeded) continue;
    const bk = (s.wave | 0) >= 5 ? 'w5' : ((s.wave | 0) >= 4 ? 'w4' : 'w3');
    const p = profileAt(s.vid, s.day) || 'null';
    seedProfileFlip[bk][p] = (seedProfileFlip[bk][p] || 0) + 1;
    seedOutcomes[bk][s.outcome || 'null'] = (seedOutcomes[bk][s.outcome || 'null'] || 0) + 1;
  }
  // Launch party-size split by holder needWave (set vs null) and
  // launch source. The needWave-null half cannot take a 2nd/3rd
  // companion (extraCompanionScan gates on needWave >= 4).
  const launchPartySize = { needWaveSet: { n: 0, partySizeSum: 0, trioPlus: 0 },
    needWaveNull: { n: 0, partySizeSum: 0, trioPlus: 0 } };
  const launchSources = {};
  for (const l of launches) {
    launchSources[l.source || 'null'] = (launchSources[l.source || 'null'] || 0) + 1;
    const nwNull = !(l.lead && l.lead.planNeedWave != null);
    const bk = nwNull ? 'needWaveNull' : 'needWaveSet';
    launchPartySize[bk].n++;
    launchPartySize[bk].partySizeSum += (l.partySize | 0);
    if ((l.partySize | 0) >= 3) launchPartySize[bk].trioPlus++;
  }
  return { seed: seed, wall: wall, instrumentErrors: errors,
    grants: grants, grantsUnaccounted: grantsUnaccounted,
    launches: launches, launchesTotal: launchesTotal,
    launchesAttributed: launchesAttributed, holdsTotal: holdsTotal,
    fights: fights, fightsTotal: fightsTotal,
    fightsAttributed: fightsAttributed,
    planSeeds: seeds, gunHolders: gunHolders, w4Holders: w4Holders,
    seedProfileFlip: seedProfileFlip, seedOutcomes: seedOutcomes,
    launchPartySize: launchPartySize, launchSources: launchSources };
}

function aggregate(perSeed) {
  let launchesTotal = 0, launchesAttributed = 0, fightsTotal = 0,
    fightsAttributed = 0, grantsTotal = 0, grantsUnaccounted = 0,
    errorsTotal = 0, wins = 0, national = 0, w5 = 0, w4 = 0, lost = 0;
  const survivals = [];
  const allLaunches = [], allFights = [], allGunHolders = [], allSeeds = [];
  for (const s of perSeed) {
    launchesTotal += s.launchesTotal;
    launchesAttributed += s.launchesAttributed;
    fightsTotal += s.fightsTotal;
    fightsAttributed += s.fightsAttributed;
    grantsTotal += s.grants.length;
    grantsUnaccounted += s.grantsUnaccounted;
    errorsTotal += s.instrumentErrors;
    if (s.wall.won) wins++;
    if (s.wall.scaleRank === 'national' || s.wall.scaleRank === 'global') national++;
    if ((s.wall.maxWave | 0) >= 5) w5++;
    if ((s.wall.maxWave | 0) >= 4) w4++;
    if (s.wall.villageLost) lost++;
    survivals.push(s.wall.days);
    for (const l of s.launches) allLaunches.push(l);
    for (const f of s.fights) allFights.push(f);
    for (const g of s.gunHolders) allGunHolders.push(Object.assign({ seed: s.seed }, g));
    for (const p of s.planSeeds) allSeeds.push(p);
  }
  survivals.sort(function (a, b) { return a - b; });
  const medianSurvival = survivals.length ? survivals[Math.floor(survivals.length / 2)] : 0;
  const maxSurvival = survivals.length ? survivals[survivals.length - 1] : 0;
  // Lead comparison: aggregate lead attributes over launches + fights.
  function leadStats(rows) {
    const n = rows.length;
    if (!n) return { n: 0 };
    let vet3 = 0, vet4 = 0, armed = 0, armored = 0, gun = 0, hpSum = 0,
      kills3Sum = 0, kills4Sum = 0;
    const profiles = {}, occupations = {};
    for (const r of rows) {
      const l = r.lead || {};
      if (l.veteran3) vet3++;
      if (l.veteran4) vet4++;
      if (l.armed) armed++;
      if (l.armored) armored++;
      if (l.gunEquipped || (l.gunCarried | 0) > 0) gun++;
      hpSum += (l.hp | 0);
      kills3Sum += (l.kills3 | 0);
      kills4Sum += (l.kills4 | 0);
      if (l.profile) profiles[l.profile] = (profiles[l.profile] || 0) + 1;
      if (l.occupation) occupations[l.occupation] = (occupations[l.occupation] || 0) + 1;
    }
    return { n: n, veteran3Rate: +(vet3 / n).toFixed(3),
      veteran4Rate: +(vet4 / n).toFixed(3), armedRate: +(armed / n).toFixed(3),
      armoredRate: +(armored / n).toFixed(3), gunRate: +(gun / n).toFixed(3),
      meanHp: +(hpSum / n).toFixed(1), meanKills3: +(kills3Sum / n).toFixed(2),
      meanKills4: +(kills4Sum / n).toFixed(2), profiles: profiles,
      occupations: occupations };
  }
  const launchLeads = leadStats(allLaunches.filter(function (r) { return r.attributed; }));
  const fightLeads = leadStats(allFights.filter(function (r) { return r.attributed; }));
  // Gun-holder comparison: over gun-holder DAYS (planCensus rows are
  // per holder-day; the analyzer recomputes from gunHolders spells
  // only as counts — day-level rates need the corpus, so the
  // per-seed gunHolders carry the spell totals instead).
  let gunHolderN = allGunHolders.length;
  let gunHoldersWithW4Plan = 0, gunHoldersEverVet3 = 0, gunHoldersEverVet4 = 0,
    gunHoldersEverArmed = 0, gunHoldersEverArmored = 0,
    gunDaysTotal = 0, gunAndW4planDaysTotal = 0, gunEquippedDaysTotal = 0;
  for (const g of allGunHolders) {
    if ((g.w4planDays | 0) > 0) gunHoldersWithW4Plan++;
    if (g.everVeteran3) gunHoldersEverVet3++;
    if (g.everVeteran4) gunHoldersEverVet4++;
    if (g.everArmed) gunHoldersEverArmed++;
    if (g.everArmored) gunHoldersEverArmored++;
    gunDaysTotal += (g.gunDays | 0);
    gunAndW4planDaysTotal += (g.gunAndW4planDays | 0);
    gunEquippedDaysTotal += (g.gunEquippedDays | 0);
  }
  const gunHolderStats = { n: gunHolderN,
    withW4PlanRate: gunHolderN ? +(gunHoldersWithW4Plan / gunHolderN).toFixed(3) : 0,
    everVeteran3Rate: gunHolderN ? +(gunHoldersEverVet3 / gunHolderN).toFixed(3) : 0,
    everVeteran4Rate: gunHolderN ? +(gunHoldersEverVet4 / gunHolderN).toFixed(3) : 0,
    everArmedRate: gunHolderN ? +(gunHoldersEverArmed / gunHolderN).toFixed(3) : 0,
    everArmoredRate: gunHolderN ? +(gunHoldersEverArmored / gunHolderN).toFixed(3) : 0,
    gunDaysTotal: gunDaysTotal, gunEquippedDaysTotal: gunEquippedDaysTotal,
    gunAndW4planDaysTotal: gunAndW4planDaysTotal,
    gunAndW4planDayRate: gunDaysTotal ? +(gunAndW4planDaysTotal / gunDaysTotal).toFixed(3) : 0 };
  // Plan-seed summary.
  const seeders = {};
  let seedsTotal = 0, seedsW4 = 0, seedsW3 = 0;
  for (const p of allSeeds) {
    if (!p.seeded) continue;
    seedsTotal++;
    if ((p.wave | 0) >= 4) seedsW4++;
    if ((p.wave | 0) === 3) seedsW3++;
    seeders[p.vid] = (seeders[p.vid] || 0) + 1;
  }
  // Gun-holder leads: how many launches/fights had a gun holder lead.
  const gunLedLaunches = allLaunches.filter(function (r) { return r.gunHolderIsLead; }).length;
  const gunLedFights = allFights.filter(function (r) { return r.gunHolderIsLead; }).length;
  const gunInPartyLaunches = allLaunches.filter(function (r) { return r.gunHolderInParty; }).length;
  const gunInPartyFights = allFights.filter(function (r) { return r.gunHolderInParty; }).length;
  const launchCoverage = launchesTotal ? launchesAttributed / launchesTotal : 1;
  const fightCoverage = fightsTotal ? fightsAttributed / fightsTotal : 1;
  // Roll up the corrected wave-4+ holder population, the seeder
  // profile flip, the seed-outcome split, and the launch party-size
  // split (needWave set vs null).
  const w4HoldersAll = [];
  const seedProfileFlip = { w3: {}, w4: {}, w5: {} };
  const seedOutcomes = { w3: {}, w4: {}, w5: {} };
  const launchPartySize = { needWaveSet: { n: 0, partySizeSum: 0, trioPlus: 0 },
    needWaveNull: { n: 0, partySizeSum: 0, trioPlus: 0 } };
  const launchSources = {};
  for (const s of perSeed) {
    for (const h of (s.w4Holders || [])) w4HoldersAll.push(Object.assign({ seed: s.seed }, h));
    for (const bk of ['w3', 'w4', 'w5']) {
      for (const p of Object.keys((s.seedProfileFlip || {})[bk] || {})) {
        seedProfileFlip[bk][p] = (seedProfileFlip[bk][p] || 0) + s.seedProfileFlip[bk][p];
      }
      for (const oc of Object.keys((s.seedOutcomes || {})[bk] || {})) {
        seedOutcomes[bk][oc] = (seedOutcomes[bk][oc] || 0) + s.seedOutcomes[bk][oc];
      }
    }
    for (const bk of ['needWaveSet', 'needWaveNull']) {
      const part = (s.launchPartySize || {})[bk];
      if (part) {
        launchPartySize[bk].n += part.n | 0;
        launchPartySize[bk].partySizeSum += part.partySizeSum | 0;
        launchPartySize[bk].trioPlus += part.trioPlus | 0;
      }
    }
    for (const src of Object.keys(s.launchSources || {})) {
      launchSources[src] = (launchSources[src] || 0) + s.launchSources[src];
    }
  }
  for (const bk of ['needWaveSet', 'needWaveNull']) {
    const part = launchPartySize[bk];
    part.meanPartySize = part.n ? +(part.partySizeSum / part.n).toFixed(2) : 0;
  }
  const w4HolderProfiles = {};
  for (const h of w4HoldersAll) w4HolderProfiles[h.profile || 'null'] = (w4HolderProfiles[h.profile || 'null'] || 0) + 1;
  const w4HoldersEverLaunched = w4HoldersAll.filter(function (h) { return (h.launchesLed | 0) > 0; }).length;
  const bars = {
    bar1Instrument: errorsTotal === 0,
    bar2LaunchCoverage: launchCoverage >= 0.8,
    bar2FightCoverage: fightCoverage >= 0.8,
    bar2Grants: grantsUnaccounted === 0,
    bar3Go: null, // judged by a human from the diagnosis, recorded here as computed inputs
    bar4NoGo: (launchCoverage < 0.8 || fightCoverage < 0.8),
  };
  let verdict = 'DIAG-NO-GO';
  if (errorsTotal > 0) verdict = 'DIAG-NO-GO';
  else if (launchesTotal < 5) verdict = 'INCONCLUSIVE';
  else if (launchCoverage < 0.8 || fightCoverage < 0.8 || grantsUnaccounted > 0) verdict = 'DIAG-NO-GO';
  else verdict = 'DIAG-GO-PENDING';
  return { verdict: verdict,
    bars: bars,
    launchCoverage: +launchCoverage.toFixed(3), fightCoverage: +fightCoverage.toFixed(3),
    launchesTotal: launchesTotal, launchesAttributed: launchesAttributed,
    fightsTotal: fightsTotal, fightsAttributed: fightsAttributed,
    grantsTotal: grantsTotal, grantsUnaccounted: grantsUnaccounted,
    instrumentErrorsTotal: errorsTotal,
    wall: { seeds: perSeed.length, wins: wins, national: national,
      wave5: w5, wave4: w4, lost: lost,
      medianSurvival: medianSurvival, maxSurvival: maxSurvival },
    leadComparison: { launchLeads: launchLeads, fightLeads: fightLeads },
    gunHolderStats: gunHolderStats,
    gunLedLaunches: gunLedLaunches, gunLedFights: gunLedFights,
    gunInPartyLaunches: gunInPartyLaunches, gunInPartyFights: gunInPartyFights,
    planSeedSummary: { seedsTotal: seedsTotal, seedsW4: seedsW4,
      seedsW3: seedsW3, distinctSeeders: Object.keys(seeders).length, seeders: seeders },
    w4Holders: w4HoldersAll,
    w4HolderCount: w4HoldersAll.length, w4HolderProfiles: w4HolderProfiles,
    w4HoldersEverLaunched: w4HoldersEverLaunched,
    seedProfileFlip: seedProfileFlip, seedOutcomes: seedOutcomes,
    launchPartySize: launchPartySize, launchSources: launchSources,
    launches: allLaunches, fights: allFights, gunHolders: allGunHolders,
    perSeed: perSeed.map(function (s) { return { seed: s.seed, wall: s.wall,
      instrumentErrors: s.instrumentErrors, grants: s.grants.length,
      grantsUnaccounted: s.grantsUnaccounted, launchesTotal: s.launchesTotal,
      launchesAttributed: s.launchesAttributed, holdsTotal: s.holdsTotal,
      fightsTotal: s.fightsTotal, fightsAttributed: s.fightsAttributed,
      planSeeds: s.planSeeds.length, gunHolders: s.gunHolders.length }; }) };
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /^leadgate-a-s\d+-/.test(f) && /\.json$/.test(f); }).sort();
  if (!files.length) throw new Error('no leadgate corpus files in ' + dir);
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond) {
    if (cond) { pass++; }
    else { fail++; console.log('FAIL: ' + name); }
  }
  function mkAttrs(vid, over) {
    const a = { vid: vid, dead: false, hp: 100, armed: true, armored: true,
      armorP: 12, weaponB: 5, profile: 'wanderer', temper: 'bold', goal: 'lead',
      occupation: 'hunter', skills: ['tracking'], killsTotal: 1, kills3: 1,
      kills4: 0, maxKillWave: 3, veteran3: true, veteran4: false,
      gunEquipped: false, gunCarried: 0, cells: 0, plan: { stage: 'hunt', target: 'eater', needWave: 4, party: [] },
      atHaven: true, away: false, engaged: false, onExped: false, sick: false };
    if (over) for (const k of Object.keys(over)) a[k] = over[k];
    return a;
  }
  // Fixture 1: a launch with full members attributes.
  const f1 = { seed: 1, days: 150, gameDays: 150, endReason: 'survived', won: false,
    villageLost: false, maxWave: 5, unlockedWave: 5, standing: 300, scaleRank: 'regional',
    deaths: [], instrumentErrors: [],
    prizeEvents: [{ seq: 1, day: 10, gains: [{ holder: 'alice', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }],
    v4gunLoc: [{ day: 11, locations: [{ loc: 'equipped', vid: 'alice', count: 1, cells: 2 }], total: 1 }],
    v4departs: [{ day: 20, vid: 'bob', source: 'winPlanDepart', result: 'launch',
      stage: 'hunt', target: 'eater', needWave: 4, party: ['alice'], partySize: 2,
      members: [mkAttrs('bob'), mkAttrs('alice', { gunEquipped: true, cells: 2 })] }],
    v4fights: [{ day: 21, vid: 'bob', mid: 'eater', wave: 4, outcome: 'vKill', rounds: 5,
      allyVids: ['alice'], lead: mkAttrs('bob'), allies: [mkAttrs('alice', { gunEquipped: true, cells: 2 })],
      volley: null }],
    planSeeds: [{ day: 15, vid: 'bob', mid: 'eater', wave: 4, outcome: 'fled', seeded: true,
      before: null, after: { stage: 'party', target: 'eater', needWave: 4 } }],
    planCensus: [
      { day: 11, vid: 'alice', attrs: mkAttrs('alice', { gunEquipped: true, cells: 2, plan: null }) },
      { day: 12, vid: 'alice', attrs: mkAttrs('alice', { gunEquipped: true, cells: 2, plan: null }) },
      { day: 20, vid: 'bob', attrs: mkAttrs('bob') },
    ] };
  const a1 = analyzeSeed(f1);
  check('f1: 1 launch attributed', a1.launchesTotal === 1 && a1.launchesAttributed === 1);
  check('f1: gun holder in party, not lead', a1.launches[0].gunHolderInParty === true && a1.launches[0].gunHolderIsLead === false);
  check('f1: 1 fight attributed', a1.fightsTotal === 1 && a1.fightsAttributed === 1);
  check('f1: grant accounted', a1.grants.length === 1 && a1.grantsUnaccounted === 0);
  check('f1: gun holder alice 2 gun days, 0 w4-plan days', (function () {
    const g = a1.gunHolders.filter(function (x) { return x.vid === 'alice'; })[0];
    return g && g.gunDays === 2 && g.w4planDays === 0 && g.launchesLedWhileHolding === 0;
  })());
  // Fixture 2: a launch with a null member (gap) but complete lead.
  const f2 = JSON.parse(JSON.stringify(f1));
  f2.seed = 2;
  f2.v4departs[0].members[1] = null;
  const a2 = analyzeSeed(f2);
  check('f2: launch still attributed (lead complete), 1 member gap', a2.launchesAttributed === 1 && a2.launches[0].memberGaps === 1);
  check('f2: gun in party false when member attrs missing (never invented)', a2.launches[0].gunHolderInParty === false);
  // Fixture 3: a launch LED by a gun holder.
  const f3 = JSON.parse(JSON.stringify(f1));
  f3.seed = 3;
  f3.v4departs[0].members[0] = mkAttrs('bob', { gunEquipped: true, cells: 3 });
  f3.v4fights[0].lead = mkAttrs('bob', { gunEquipped: true, cells: 3 });
  const a3 = analyzeSeed(f3);
  check('f3: gun holder IS lead on launch + fight', a3.launches[0].gunHolderIsLead === true && a3.fights[0].gunHolderIsLead === true);
  // Fixture 4: zero launches -> INCONCLUSIVE at aggregate.
  const f4 = JSON.parse(JSON.stringify(f1));
  f4.seed = 4;
  f4.v4departs = []; f4.v4fights = [];
  const agg4 = aggregate([analyzeSeed(f4)]);
  check('f4: zero-launch aggregate is INCONCLUSIVE', agg4.verdict === 'INCONCLUSIVE');
  // Fixture 5: unaccounted grant (holder never in census).
  const f5 = JSON.parse(JSON.stringify(f1));
  f5.seed = 5;
  f5.prizeEvents[0].gains[0].holder = 'ghost';
  f5.v4gunLoc = [{ day: 11, locations: [], total: 0 }];
  f5.planCensus = f5.planCensus.filter(function (r) { return r.vid !== 'alice'; });
  const a5 = analyzeSeed(f5);
  check('f5: unaccounted grant counted', a5.grantsUnaccounted === 1);
  // Fixture 6: dead-holder equipped row skipped — dead lead attrs
  // still count as an attrs object (dead flag true), but the gun
  // holder is flagged dead in the summary.
  const f6 = JSON.parse(JSON.stringify(f1));
  f6.seed = 6;
  f6.v4departs[0].members[1] = mkAttrs('alice', { dead: true, gunEquipped: true });
  const a6 = analyzeSeed(f6);
  check('f6: dead companion attrs pass through with dead flag', a6.launches[0].companions[0].dead === true);
  // Fixture 7: aggregate GO-pending shape — 5+ launches, full coverage.
  const many = [];
  for (let i = 0; i < 5; i++) {
    const fx = JSON.parse(JSON.stringify(f1));
    fx.seed = 100 + i;
    many.push(analyzeSeed(fx));
  }
  const agg7 = aggregate(many);
  check('f7: 5 launches full coverage -> DIAG-GO-PENDING', agg7.verdict === 'DIAG-GO-PENDING' && agg7.launchesTotal === 5);
  check('f7: launch lead veteran3 rate 1.0, gun rate 0.0', agg7.leadComparison.launchLeads.veteran3Rate === 1 && agg7.leadComparison.launchLeads.gunRate === 0);
  check('f7: w4 holders 5 (one per seed), ever launched 5', agg7.w4HolderCount === 5 && agg7.w4HoldersEverLaunched === 5);
  check('f7: gun-holder w4-plan rate 0.0', agg7.gunHolderStats.withW4PlanRate === 0);
  check('f7: wall counts', agg7.wall.wave5 === 5 && agg7.wall.wins === 0);
  // Fixture 8: plan-seed summary counts wave-4 seeds and seeders.
  check('f8: seed summary 5 w4 seeds, 1 seeder', agg7.planSeedSummary.seedsTotal === 5 && agg7.planSeedSummary.seedsW4 === 5 && agg7.planSeedSummary.distinctSeeders === 1);
  // Fixture 9: a companion-inherited plan — wave-4 target with
  // needWave null — still counts as a wave-4+ plan (the companion
  // sync copies target but not needWave; needWave alone undercounts).
  const f9 = JSON.parse(JSON.stringify(f1));
  f9.seed = 9;
  f9.planCensus = [
    { day: 11, vid: 'alice', attrs: mkAttrs('alice', { gunEquipped: true, cells: 2,
      plan: { stage: 'hunt', target: 'eater', needWave: null, party: ['bob'] } }) },
    { day: 12, vid: 'alice', attrs: mkAttrs('alice', { gunEquipped: true, cells: 2,
      plan: { stage: 'hunt', target: 'eater', needWave: null, party: ['bob'] } }) },
    { day: 20, vid: 'bob', attrs: mkAttrs('bob', { plan: null }) },
  ];
  const a9 = analyzeSeed(f9);
  check('f9: target-based w4 plan counts (needWave null + eater target)', (function () {
    const g = a9.gunHolders.filter(function (x) { return x.vid === 'alice'; })[0];
    return g && g.w4planDays === 2 && g.gunAndW4planDays === 2;
  })());
  check('f9: w4Holders lists the target-based holder', a9.w4Holders.length === 1 && a9.w4Holders[0].vid === 'alice' && a9.w4Holders[0].w4planDays === 2);
  // Fixture 10: launch party-size split — a needWave-null launch
  // goes out as a pair; a needWave-set launch goes out as a trio+.
  const f10 = JSON.parse(JSON.stringify(f1));
  f10.seed = 10;
  f10.v4departs = [
    { day: 20, vid: 'bob', source: 'brain', result: 'launch',
      stage: 'hunt', target: 'eater', needWave: 4, party: ['alice', 'carol'], partySize: 3,
      members: [mkAttrs('bob'), mkAttrs('alice'), mkAttrs('carol')] },
    { day: 21, vid: 'dave', source: 'brain', result: 'launch',
      stage: 'hunt', target: 'eater', needWave: null, party: ['erin'], partySize: 2,
      members: [mkAttrs('dave', { plan: { stage: 'hunt', target: 'eater', needWave: null, party: ['erin'] } }), mkAttrs('erin')] },
  ];
  const a10 = analyzeSeed(f10);
  check('f10: party-size split set-trio vs null-pair', a10.launchPartySize.needWaveSet.trioPlus === 1 && a10.launchPartySize.needWaveNull.trioPlus === 0 && a10.launchPartySize.needWaveNull.n === 1);
  check('f10: launch sources counted', a10.launchSources.brain === 2);
  console.log('leadgate selftest: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir || !outFile) { console.error('usage: analyze-leadgate-a.js --dir <dir> --out <file>'); process.exit(2); }
  const corpus = loadCorpus(dir);
  const perSeed = corpus.map(analyzeSeed);
  const result = aggregate(perSeed);
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: result.verdict,
    seeds: result.wall.seeds, launchesTotal: result.launchesTotal,
    launchesAttributed: result.launchesAttributed,
    launchCoverage: result.launchCoverage,
    fightsTotal: result.fightsTotal, fightsAttributed: result.fightsAttributed,
    fightCoverage: result.fightCoverage, grantsTotal: result.grantsTotal,
    grantsUnaccounted: result.grantsUnaccounted,
    instrumentErrorsTotal: result.instrumentErrorsTotal,
    gunLedLaunches: result.gunLedLaunches, gunLedFights: result.gunLedFights,
    gunInPartyLaunches: result.gunInPartyLaunches,
    gunInPartyFights: result.gunInPartyFights,
    wall: result.wall, out: outFile }));
}

module.exports = { analyzeSeed: analyzeSeed, aggregate: aggregate,
  isAttrs: isAttrs, leadSummary: leadSummary, selftest: selftest };
