#!/usr/bin/env node
// pocketdesign-analyze-20261031.js — design-inputs analysis for sim-pocketdesign-a.
// Reads evidence/2026-10-31/perseed-pocketdesign-a/<arm>/s<seed>.json
// (or EVID env) and prints: Input 1 patrol band + funnel, Input 2
// sat-out gate attribution, Input 3 top-up timelines, Input 4 shout
// rows, classification + wall numbers. Derives every number from the
// per-seed JSONs only, no re-simulation. Writes NOTHING; prints a JSON
// summary + tables.
// Usage: node scripts/pocketdesign-analyze-20261031.js [seed...]
//   EVID=... node scripts/pocketdesign-analyze-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-pocketdesign-a', 'patrol');
const { classifyFight, sensedContact } = require(path.join(REPO, 'scripts', 'pocketcall-diag-20261031'));
const { attributeGate, nodeDelta } = require(path.join(REPO, 'scripts', 'pocketdesign-diag-20261031'));
const seedsArg = process.argv.slice(2).map(s => parseInt(s, 10)).filter(Number.isFinite);
const files = fs.readdirSync(EVID).filter(f => /^s\d+\.json$/.test(f)).sort();
const seeds = files.map(f => parseInt(f.slice(1, -5), 10)).filter(s => !seedsArg.length || seedsArg.includes(s));

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function counter(rows, fn) {
  const m = {};
  for (const r of rows) { const k = fn(r); m[k] = (m[k] || 0) + 1; }
  return m;
}

const joinProblems = [];
const pocketSeqProblems = [];
const ranged = []; // joined ranged fights with class, sensed, shout, timeline
const timelines = [];
const wall = [];
let errs = { ammo: 0, pc: 0, supply: 0, stickfiber: 0, pd: 0 };
let totalFights = 0, lowWave = 0, fieldCalls = 0;
let adRangedTotal = 0; // ammo-diag wave>=4 fights with a ranged weapon, joined or not
const patrol = { calls: 0, went: 0, satOut: 0, bySeed: {}, outcomes: { 'heal-sat-out': 0, uneventful: 0, fought: 0 },
  foughtByWave: {}, foughtByWaveDep: {}, patrolRangedFights: 0, patrolRangedFightsDep: 0,
  patrolVolley: { fights: 0, shots: 0, dmg: 0 },
  assigns: 0, assignsStanding: 0, assignsRefused: 0, residualCallsBeyondAssignTask: 0 };
const satOuts = [];
const integrityFlags = [];
let objDeparts = 0, returns = 0;

for (const seed of seeds) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}.json`), 'utf8'));
  wall.push(d);
  errs.ammo += (d.instrumentErrors || []).length;
  errs.pc += (d.pcErrors || []).length;
  errs.supply += (d.supplyErrors || []).length;
  errs.stickfiber += (d.stickfiberErrors || []).length;
  errs.pd += (d.pdErrors || []).length;
  totalFights += (d.fights || []).length;
  lowWave += (d.lowWaveFights || 0);
  fieldCalls += (d.fieldFightCalls || 0);
  objDeparts += (d.pdObjDeparts || []).length;
  returns += (d.pdReturns || []).length;

  // Patrol census + funnel.
  const pdDeps = d.pdDepartures || [];
  const pCalls = pdDeps.filter(x => x.kind === 'resolvePatrol');
  patrol.calls += pCalls.length;
  patrol.went += pCalls.filter(x => x.went).length;
  patrol.satOut += pCalls.filter(x => !x.went).length;
  patrol.bySeed[seed] = pCalls.length;
  for (const x of pCalls) {
    if (!x.went) patrol.outcomes['heal-sat-out']++;
    else if ((x.volleyDuring || 0) > 0) { patrol.outcomes.fought++; }
    else patrol.outcomes.uneventful++;
    // Departure-based fought split (instrument v2): waves of the
    // fights inside each went patrol call, and ranged-ness from the
    // volley object (non-null ⟺ the fighter has a ranged weapon).
    if (x.went) {
      for (const w of (x.volleyDuringWaves || [])) {
        const k = `wave${w}`;
        patrol.foughtByWaveDep[k] = (patrol.foughtByWaveDep[k] || 0) + 1;
      }
      if (x.volleyDuringRanged) patrol.patrolRangedFightsDep++;
    }
  }
  patrol.assigns += (d.pdAssigns || []).length;
  patrol.assignsStanding += (d.pdAssigns || []).filter(x => x.assignedAfter).length;
  patrol.assignsRefused += (d.pdAssigns || []).filter(x => x.retRefused === true).length;

  // Sat-outs (both sites) + integrity flags.
  for (const x of pdDeps) {
    if (!x.went) satOuts.push(Object.assign({ seed }, x));
    for (const fl of (x.integrity || [])) integrityFlags.push({ seed, vid: x.vid, day: x.day, kind: x.kind, flag: fl });
  }

  // Pocket-seq pairing check: AD pocketCalls[i] <-> pdPocketSeq[i].
  const adPockets = d.pocketCalls || [];
  const pdSeqs = d.pdPocketSeq || [];
  if (adPockets.length !== pdSeqs.length) {
    pocketSeqProblems.push({ seed, adPockets: adPockets.length, pdPocketSeq: pdSeqs.length });
  } else {
    for (let i = 0; i < adPockets.length; i++) {
      if (adPockets[i].vid !== pdSeqs[i].vid || adPockets[i].day !== pdSeqs[i].day) {
        pocketSeqProblems.push({ seed, index: i, ad: [adPockets[i].day, adPockets[i].vid], pd: [pdSeqs[i].day, pdSeqs[i].vid] });
      }
    }
  }

  // Volley join: pdVolleyRows (wave >= 4) vs ammo-diag fights, by
  // (vid, day, mid) occurrence order.
  const adFights = d.fights || [];
  const pdVol = (d.pdVolleyRows || []).filter(r => (r.wave | 0) >= 4);
  const pcFights = d.pcFights || [];
  adRangedTotal += adFights.filter(f => f.rangedAmmoId).length;
  if (adFights.length !== pcFights.length) joinProblems.push({ seed, kind: 'pc-length', adFights: adFights.length, pcFights: pcFights.length });
  if (adFights.length !== pdVol.length) joinProblems.push({ seed, kind: 'pdvol-length', adFights: adFights.length, pdVolleyWave4: pdVol.length });
  const occAd = {}, occPd = {};
  const pdByKey = {};
  for (const r of pdVol) {
    const k = `${r.vid}|${r.day}|${r.mid}`;
    const o = (occPd[k] = (occPd[k] || 0) + 1);
    pdByKey[`${k}|${o}`] = r;
  }
  const n = Math.min(adFights.length, pcFights.length);
  for (let i = 0; i < n; i++) {
    const f = adFights[i], p = pcFights[i];
    if (f.day !== p.day || f.vid !== p.vid || f.mid !== p.mid) {
      joinProblems.push({ seed, index: i, kind: 'pc-order', ad: [f.day, f.vid, f.mid], pc: [p.day, p.vid, p.mid] });
    }
    if (!f.rangedAmmoId) continue;
    const k = `${f.vid}|${f.day}|${f.mid}`;
    const o = (occAd[k] = (occAd[k] || 0) + 1);
    const vr = pdByKey[`${k}|${o}`] || null;
    if (!vr) { joinProblems.push({ seed, index: i, kind: 'pdvol-missing', key: k, occ: o }); continue; }
    const cls = classifyFight({ carriedNeeded: f.carriedNeeded, pocketBefore: p.pocketBefore,
      departBefore: p.departBefore, wentBefore: p.wentBefore,
      fighterNode: p.fighterNode, havenNode: p.havenNode, away: !!p.away, onExpedition: p.onExpedition });
    const sens = sensedContact({ fighterNode: p.fighterNode, scholarNode: p.scholarNode,
      fighterGrid: p.fighterGrid, scholarGridRaw: p.scholarGridRaw,
      crewIncludesVid: p.crewIncludesVid, crewAliveOthers: p.crewAliveOthers,
      partyIncludesVid: p.partyIncludesVid });
    const nd = nodeDelta(p.fighterNode, p.scholarNode);
    const hd = nodeDelta(p.fighterNode, p.havenNode);
    const scholarAtHaven = !!(p.scholarNode && p.havenNode &&
      p.scholarNode.nx === p.havenNode.nx && p.scholarNode.ny === p.havenNode.ny);
    const shout = { nodeManhattan: nd.manhattan, nodeChebyshev: nd.chebyshev,
      scholarAtHaven, fighterDistFromHaven: hd.manhattan,
      c1: sens.c1, c2: sens.c2, c2Stale: sens.c2Stale, c3: sens.c3, c4: sens.c4,
      reachable: sens.reachable, crewIncludesVid: p.crewIncludesVid,
      crewAliveOthers: (p.crewAliveOthers || []).length, party: p.partyIncludesVid,
      optAllies: p.optAllies, optAllyVids: p.optAllyVids };
    ranged.push(Object.assign({ seed }, f, { pc: p, fightSeq: vr.seq, cls: cls.cls,
      atHome: cls.atHome, nodeUnknown: cls.nodeUnknown, anomaly: cls.anomaly,
      sensed: sens, shout }));
  }

  // --- Input 3 timelines (per ranged fight, this seed's corpus) ---
  // Pockets paired by index with seq rows; spends from volley rows.
  const pockets = [];
  const np = Math.min(adPockets.length, pdSeqs.length);
  for (let i = 0; i < np; i++) {
    pockets.push({ seq: pdSeqs[i].seq, day: adPockets[i].day, vid: adPockets[i].vid,
      pre: adPockets[i].pre || {}, post: adPockets[i].post || {}, out: adPockets[i].out || null });
  }
  const volleys = (d.pdVolleyRows || []).slice();
  const deps = pdDeps.slice();
  const rets = (d.pdReturns || []).slice();
  for (const f of ranged.filter(r => r.seed === seed)) {
    const vid = f.vid, ammo = f.rangedAmmoId, fs = f.fightSeq;
    // Outing: last went departure with seq < fight seq, not followed
    // by a return with seq between it and the fight.
    let outing = null;
    for (const dp of deps) {
      if (dp.vid !== vid || !dp.went || !(dp.seq < fs)) continue;
      if (!outing || dp.seq > outing.seq) outing = dp;
    }
    if (outing) {
      for (const rt of rets) {
        if (rt.vid === vid && rt.seq > outing.seq && rt.seq < fs) { outing = null; break; }
      }
      // If a return intervened, the last went departure AFTER that
      // return is the outing (re-scan).
      if (!outing) {
        let lastRet = 0;
        for (const rt of rets) if (rt.vid === vid && rt.seq < fs && rt.seq > lastRet) lastRet = rt.seq;
        for (const dp of deps) {
          if (dp.vid !== vid || !dp.went || !(dp.seq < fs) || !(dp.seq > lastRet)) continue;
          if (!outing || dp.seq > outing.seq) outing = dp;
        }
      }
    }
    const inOuting = (ev) => !outing ? false : (ev.seq > outing.seq && ev.seq < fs);
    const pocketsBefore = pockets.filter(e => e.vid === vid && e.seq < fs);
    const lastPocket = pocketsBefore.length ? pocketsBefore[pocketsBefore.length - 1] : null;
    const lastPocketInOuting = pocketsBefore.filter(inOuting).length
      ? pocketsBefore.filter(inOuting).slice(-1)[0] : null;
    const carriedAt = (m) => (m && typeof m[ammo] === 'number') ? m[ammo] : 0;
    // Spends since last pocket (any pocket): volley rows for this vid
    // with seq between pocket seq and fight seq, spend = pre-post
    // delta for this ammo (cross-checked against volley.shots).
    let spendsSincePocket = 0, volleyFightsSincePocket = 0, shotMismatch = 0;
    if (lastPocket) {
      for (const v of volleys) {
        if (v.vid !== vid || !(v.seq > lastPocket.seq) || !(v.seq < fs)) continue;
        const delta = carriedAt(v.preCarried) - carriedAt(v.postCarried);
        if (delta > 0) {
          spendsSincePocket += delta; volleyFightsSincePocket++;
          if (v.volley && typeof v.volley.shots === 'number' && v.volley.shots !== delta) shotMismatch++;
        }
      }
    }
    const inOutingPockets = pocketsBefore.filter(inOuting);
    const inOutingAdded = inOutingPockets.reduce((t, e) => t + Math.max(0, carriedAt(e.post) - carriedAt(e.pre)), 0);
    let drySub = null;
    if ((f.carriedNeeded || 0) > 0) drySub = 'armed';
    else if (!outing) drySub = 'never-pocketed-in-outing';
    else if (inOutingPockets.length === 0) drySub = 'never-pocketed-in-outing';
    else if (inOutingAdded > 0 && spendsSincePocket > 0 &&
      carriedAt(lastPocketInOuting.post) - spendsSincePocket <= 0 &&
      lastPocketInOuting.seq === lastPocket.seq) drySub = 'spent-in-outing';
    else if (inOutingAdded === 0) drySub = 'pocket-failed';
    else drySub = 'timeline-other';
    const timelineComplete = true; // row exists <=> reconstruction
    // produced (absence recorded as nulls); join failures surface via
    // joinProblems and the adRangedTotal denominator below.
    timelines.push({ seed, day: f.day, vid, mid: f.mid, weapon: f.rangedWeaponId, ammo,
      cls: f.cls, carriedAtMeeting: f.carriedNeeded || 0,
      outing: outing ? { kind: outing.kind, day: outing.day, seq: outing.seq } : null,
      lastPocket: lastPocket ? { day: lastPocket.day, seq: lastPocket.seq,
        pre: carriedAt(lastPocket.pre), post: carriedAt(lastPocket.post),
        inOuting: inOuting(lastPocket) } : null,
      pocketsInOuting: inOutingPockets.length, inOutingAdded,
      spendsSincePocket, volleyFightsSincePocket, shotMismatch,
      drySub, timelineComplete });
  }
}

// Patrol fought split by wave + patrol ranged fights (from ranged rows
// whose caller is resolvePatrol, plus volley totals on patrol fights).
for (const f of ranged) {
  if (f.callerClass === 'resolvePatrol') {
    patrol.patrolRangedFights++;
    patrol.patrolVolley.fights += (((f.volley && f.volley.shots) || 0) > 0) ? 1 : 0;
    patrol.patrolVolley.shots += (f.volley && f.volley.shots) || 0;
    patrol.patrolVolley.dmg += (f.volley && f.volley.dmg) || 0;
  }
}
// Patrol fought-by-wave from PD departures is per-call, not per-fight;
// wave split comes from the ammo-diag fight rows joined to patrol
// departures only loosely — report caller-based wave counts instead.
patrol.foughtByWave = counter(ranged.filter(f => f.callerClass === 'resolvePatrol'), f => `wave${f.wave}`);

const classes = ['ARMED', 'NEVER-CALLED', 'NEVER-DEPARTED', 'DRY-AT-HOME', 'DRY-AT-FIGHT'];
const classCounts = {};
for (const c of classes) classCounts[c] = ranged.filter(f => f.cls === c).length;
const callPop = ranged.filter(f => f.cls === 'NEVER-CALLED' || f.cls === 'DRY-AT-HOME' || f.cls === 'DRY-AT-FIGHT');
const satTotal = satOuts.length;
const satAttributed = satOuts.filter(x => x.gate === 'heal' || x.gate === 'sick' || x.gate === 'range').length;
const gateTable = counter(satOuts, x => x.gate || 'null');
const gateBySite = {};
for (const x of satOuts) {
  gateBySite[x.kind] = gateBySite[x.kind] || {};
  gateBySite[x.kind][x.gate || 'null'] = (gateBySite[x.kind][x.gate || 'null'] || 0) + 1;
}
const timelineCompleteN = timelines.filter(t => t.timelineComplete).length;
const dryTimelines = timelines.filter(t => t.carriedAtMeeting === 0);
const shoutByDelta = counter(callPop, f => (f.shout.nodeManhattan === null ? 'null' : `d${f.shout.nodeManhattan}`));
const shoutChannels = { n: callPop.length,
  c1: callPop.filter(f => f.shout.c1).length, c2: callPop.filter(f => f.shout.c2).length,
  c2Stale: callPop.filter(f => f.shout.c2Stale).length, c3: callPop.filter(f => f.shout.c3).length,
  c4: callPop.filter(f => f.shout.c4).length, union: callPop.filter(f => f.shout.reachable).length,
  unreachable: callPop.filter(f => !f.shout.reachable).length,
  scholarAtHaven: callPop.filter(f => f.shout.scholarAtHaven).length,
  optAlliesGt0: callPop.filter(f => (f.shout.optAllies || 0) > 0).length };

const summary = {
  seeds, seedCount: seeds.length,
  totalWave4Fights: totalFights, rangedFights: ranged.length,
  lowWaveFights: lowWave, fieldFightCalls: fieldCalls,
  joinProblems, joinOk: joinProblems.length === 0,
  pocketSeqProblems, pocketSeqOk: pocketSeqProblems.length === 0,
  instrumentErrors: errs,
  classCounts, anomalies: ranged.filter(f => f.anomaly).length,
  input1Patrol: {
    calls: patrol.calls, went: patrol.went, satOut: patrol.satOut,
    bySeed: patrol.bySeed, outcomes: patrol.outcomes,
    foughtByWaveCallerBased: patrol.foughtByWave,
    foughtByWaveDepartureBased: patrol.foughtByWaveDep,
    patrolRangedFights: patrol.patrolRangedFights, patrolVolley: patrol.patrolVolley,
    patrolRangedFightsDepartureBased: patrol.patrolRangedFightsDep,
    assigns: patrol.assigns, assignsStanding: patrol.assignsStanding,
    assignsRefused: patrol.assignsRefused,
    assignedMinusCalled: patrol.assignsStanding - patrol.calls,
    residualCallsBeyondAssignTask: patrol.calls - patrol.assignsStanding,
  },
  input2SatOut: {
    total: satTotal, attributed: satAttributed,
    attributedShare: satTotal ? satAttributed / satTotal : null,
    gateTable, gateBySite,
    otherRows: satOuts.filter(x => x.gate === 'other').map(x => ({ seed: x.seed, day: x.day, vid: x.vid, kind: x.kind,
      healObserved: x.healObserved, healTrue: x.healTrue, sickBefore: x.sickBefore,
      hpBefore: x.hpBefore, cachedProfile: x.cachedProfile, cachedMaxD: x.cachedMaxD })),
    integrityFlags,
    objDepartContext: objDeparts, expeditionReturns: returns,
  },
  input3TopUp: {
    timelineComplete: timelineCompleteN, timelineTotal: adRangedTotal,
    timelineCompleteness: adRangedTotal ? timelineCompleteN / adRangedTotal : null,
    drySubCounts: counter(dryTimelines, t => t.drySub),
    dryTimelines: dryTimelines.map(t => ({ seed: t.seed, day: t.day, vid: t.vid, weapon: t.weapon,
      cls: t.cls, carriedAtMeeting: t.carriedAtMeeting, outing: t.outing,
      lastPocket: t.lastPocket, pocketsInOuting: t.pocketsInOuting, inOutingAdded: t.inOutingAdded,
      spendsSincePocket: t.spendsSincePocket, volleyFightsSincePocket: t.volleyFightsSincePocket,
      shotMismatch: t.shotMismatch, drySub: t.drySub })),
    armedTimelines: timelines.filter(t => t.carriedAtMeeting > 0).length,
    medianSpendsSincePocketDry: medianOf(dryTimelines.map(t => t.spendsSincePocket)),
    medianVolleyFightsSincePocketDry: medianOf(dryTimelines.map(t => t.volleyFightsSincePocket)),
    shotMismatchesTotal: timelines.reduce((t, x) => t + (x.shotMismatch || 0), 0),
  },
  input4Shout: {
    shoutComplete: ranged.length, shoutTotal: adRangedTotal,
    shoutCompleteness: adRangedTotal ? ranged.length / adRangedTotal : null,
    callPopN: callPop.length, shoutByDelta, shoutChannels,
    callPopRows: callPop.map(f => ({ seed: f.seed, day: f.day, vid: f.vid, mid: f.mid,
      weapon: f.rangedWeaponId, cls: f.cls, shout: f.shout })),
  },
  volley: {
    rangedWithShots: ranged.filter(f => ((f.volley && f.volley.shots) || 0) > 0).length,
    totalShots: ranged.reduce((t, f) => t + ((f.volley && f.volley.shots) || 0), 0),
    totalDmg: ranged.reduce((t, f) => t + ((f.volley && f.volley.dmg) || 0), 0),
  },
  outcomes: counter(ranged, f => f.outcome),
  callersRanged: counter(ranged, f => f.callerClass),
  wall: {
    national: wall.reduce((t, d) => t + (d.national || 0), 0),
    table: wall.reduce((t, d) => t + (d.table || 0), 0),
    wins: wall.reduce((t, d) => t + (d.won || 0), 0),
    wave4: wall.filter(d => (d.maxWave || 1) >= 4).length,
    wave5: wall.filter(d => (d.maxWave || 1) >= 5).length,
    medianSurvival: medianOf(wall.map(d => d.gameDays || 0)),
    maxSurvival: wall.length ? Math.max.apply(null, wall.map(d => d.gameDays || 0)) : 0,
  },
};
console.log(JSON.stringify(summary, null, 1));
console.log('\n--- ranged fights (seed day vid weapon carried P D W class caller volley outcome) ---');
for (const f of ranged) {
  const v = f.volley || {};
  console.log(`s${f.seed} d${f.day} ${f.vid} ${f.mid} ${f.rangedWeaponId} carried=${f.carriedNeeded} P=${f.pc.pocketBefore} D=${f.pc.departBefore} W=${f.pc.wentBefore} ${f.cls} caller=${f.callerClass} volley=${v.shots || 0}/${v.dmg || 0} outcome=${f.outcome}`);
}
console.log('\n--- sat-outs (seed day vid kind gate healObs healTrue sick hp cachedProfile) ---');
for (const x of satOuts) {
  console.log(`s${x.seed} d${x.day} ${x.vid} ${x.kind} gate=${x.gate} healObs=${x.healObserved} healTrue=${x.healTrue} sick=${x.sickBefore} hp=${x.hpBefore} cachedProfile=${x.cachedProfile} cachedMaxD=${x.cachedMaxD}`);
}
