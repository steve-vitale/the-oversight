'use strict';
// test-journey-deepening-r119-instruments-20261108.js -- R119 instrument proof
// (runs the REAL driver helpers + analyzer on synthetic inputs).
// Driver helpers (ladderSnapOf / trustSnapOf, rigged fake G):
//   (1) ladderSnapOf shapes a villageLadder() read (stage, counted,
//       tracks, countedTracks, cap, shortfall, nextThreshold);
//   (2) ladderSnapOf records {day, err} when villageLadder throws —
//       never a crash;
//   (3) ladderSnapOf records 'no-villageLadder' when the fn is absent;
//   (4) trustSnapOf copies the trust map + scholar id/health + fallen.
// summarizeLadder (synthetic seed JSONs):
//   (5) stage 1 by day 60 -> OPENS, firstStageDay 60;
//   (6) first stage 1 at day 90 -> LATE;
//   (7) all stage 0 -> SILENT;
//   (8) a snap with err -> BROKEN;
//   (9) counted >= nextThreshold while stage 0 -> BROKEN (inconsistent);
//   (10) a countedTrack above the cap -> BROKEN;
//   (11) stage drop (peak 1, live 0 at horizon) is recorded, verdict
//       stays OPENS (first stage by day 80);
//   (12) minted tracks take the max countedTracks across snaps.
// summarizeTrust (synthetic seed JSONs):
//   (13) a death paying a never-talked-to villager -> TRUST-PAID-TO-
//       STRANGERS, strangerGains 1;
//   (14) a death paying only previously-talked-to villagers ->
//       TRUST-EARNED-ONLY;
//   (15) first contact on/after the death day is 'late', NOT a stranger
//       gain -> TRUST-EARNED-ONLY, lateGains 1;
//   (16) mantle latency: death day 50, successor first bearer day 51 ->
//       latency 1; death day 60, successor day 62 -> latency 2;
//   (17) trust moves on a non-death day -> nonDeathMoves 1;
//   (18) a snap with scholarHealth 0 -> deadBearerDays 1;
//   (19) no deaths at all -> NO-GAINS.
//   (20) successor overwrite: expected +6, net -40 — classified by the
//       payment, the overwrite shown alongside, never confused;
//   (21) an old-shape record without `expected` falls back to net deltas.
// RED/FAILURE MODE: (2) fails while a ladder throw crashes the snap;
// (9)/(10) fail while the consistency checks are absent; (13)/(15)
// fail while the contact join misclassifies strangers; (20) fails while
// the net delta is read as the payment.
const D = require('./journey-deepening-r119-20261108.js');
const A = require('./analyze-journey-deepening-r119-20261108.js');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 96701, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [], langGateOffers: [], langGateDecisions: [],
    langArcSittings: [], langArcDays: [], talkedSittings: [], langGrants: [],
    langArcEnd: { langs: [], learned: {} }, goalSnaps: [], goalLineDays: [],
    goalLines: { counts: {}, total: 0 },
    ladderSnaps: [], trustSnaps: [], trustDeaths: [] };
  return Object.assign(base, over || {});
}
function ladderSnap(day, stage, counted, cap, countedTracks, nextThreshold, peakStage) {
  return { day, stage, peakStage: peakStage == null ? stage : peakStage, counted, cap,
    tracks: { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 },
    countedTracks: countedTracks || { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 },
    capped: [], shortfall: nextThreshold == null ? null : nextThreshold - counted, nextThreshold,
    detail: {} };
}

// (1) ladderSnapOf shapes a real villageLadder() read.
{
  const fakeG = {
    state: { scholar: { day: 60 }, village: {} }, villagerId: 'v_h1',
    villageLadder: () => ({ stage: 1, peakStage: 1, counted: 13, cap: 7,
      tracks: { fight: 9, forage: 3, craft: 2, talk: 1, explore: 0 },
      countedTracks: { fight: 7, forage: 3, craft: 2, talk: 1, explore: 0 },
      capped: ['fight'], shortfall: 13, nextThreshold: 26,
      detail: { fightLedger: 4 } }),
  };
  const r = D.ladderSnapOf(fakeG);
  ok('LADDER-SNAP (1) day/stage/counted shaped', r.day === 60 && r.stage === 1 && r.counted === 13, JSON.stringify(r));
  ok('LADDER-SNAP (1) cap + countedTracks shaped', r.cap === 7 && r.countedTracks.fight === 7 && r.nextThreshold === 26, JSON.stringify(r));
  ok('LADDER-SNAP (1) capped list kept', JSON.stringify(r.capped) === JSON.stringify(['fight']), JSON.stringify(r));
}
// (2) ladderSnapOf records a throw, never crashes.
{
  const fakeG = { state: { scholar: { day: 50 }, village: {} }, villagerId: 'v_h1',
    villageLadder: () => { throw new Error('ladder blew up'); } };
  let r = null, threw = false;
  try { r = D.ladderSnapOf(fakeG); } catch (e) { threw = true; }
  ok('LADDER-SNAP (2) a throw does not crash the snap', !threw && r && r.err === 'ladder blew up', JSON.stringify(r));
  ok('LADDER-SNAP (2) the error snap keeps its day', r && r.day === 50, JSON.stringify(r));
}
// (3) ladderSnapOf without the fn.
{
  const fakeG = { state: { scholar: { day: 40 }, village: {} }, villagerId: 'v_h1' };
  const r = D.ladderSnapOf(fakeG);
  ok('LADDER-SNAP (3) missing villageLadder -> no-villageLadder', r && r.err === 'no-villageLadder' && r.day === 40, JSON.stringify(r));
}
// (4) trustSnapOf copies trust + scholar + fallen.
{
  const fakeG = { state: { scholar: { day: 61, health: 82 }, village: {
    trust: { v_h1: 39, v_h2: 12 },
    fallen: [{ day: 60, villagerId: 'v_old', name: 'Old Bearer' }] } }, villagerId: 'v_h1' };
  const r = D.trustSnapOf(fakeG);
  ok('TRUST-SNAP (4) day/scholar/health shaped', r.day === 61 && r.scholar === 'v_h1' && r.scholarHealth === 82, JSON.stringify(r));
  ok('TRUST-SNAP (4) trust map copied', r.trust.v_h1 === 39 && r.trust.v_h2 === 12, JSON.stringify(r));
  ok('TRUST-SNAP (4) fallen length + last entry', r.fallenN === 1 && r.lastFallen && r.lastFallen.day === 60 && r.lastFallen.villagerId === 'v_old', JSON.stringify(r));
}
// (5) OPENS: stage 1 by day 60.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(40, 0, 5, 7, { fight: 2, forage: 2, craft: 1, talk: 0, explore: 0 }, 12),
    ladderSnap(60, 1, 13, 15, { fight: 7, forage: 3, craft: 2, talk: 1, explore: 0 }, 26),
    ladderSnap(80, 1, 18, 15, { fight: 7, forage: 5, craft: 3, talk: 2, explore: 1 }, 26),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q1-LADDER (5) verdict OPENS', r.verdict === 'OPENS', r.verdict);
  ok('Q1-LADDER (5) firstStageDay 60', r.firstStageDay === 60, JSON.stringify(r));
  ok('Q1-LADDER (5) minted tracks maxed', r.minted.fight === 7 && r.minted.explore === 1, JSON.stringify(r.minted));
}
// (6) LATE: first stage 1 at day 90.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(40, 0, 4, 7, null, 12),
    ladderSnap(80, 0, 11, 7, { fight: 7, forage: 3, craft: 1, talk: 0, explore: 0 }, 12),
    ladderSnap(90, 1, 13, 15, { fight: 7, forage: 4, craft: 1, talk: 1, explore: 0 }, 26),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q1-LADDER (6) verdict LATE', r.verdict === 'LATE', r.verdict);
  ok('Q1-LADDER (6) firstStageDay 90', r.firstStageDay === 90, JSON.stringify(r));
}
// (7) SILENT: all stage 0.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(40, 0, 3, 7, null, 12),
    ladderSnap(80, 0, 8, 7, { fight: 7, forage: 1, craft: 0, talk: 0, explore: 0 }, 12),
    ladderSnap(100, 0, 9, 7, { fight: 7, forage: 2, craft: 0, talk: 0, explore: 0 }, 12),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q1-LADDER (7) verdict SILENT', r.verdict === 'SILENT', r.verdict);
  ok('Q1-LADDER (7) peakStage 0', r.peakStage === 0, JSON.stringify(r));
}
// (8) BROKEN: a snap with err.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(40, 0, 3, 7, null, 12),
    { day: 50, err: 'ladder blew up' },
    ladderSnap(60, 1, 13, 15, null, 26),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q1-LADDER (8) verdict BROKEN on snap err', r.verdict === 'BROKEN', r.verdict);
  ok('Q1-LADDER (8) the error is reported', r.errors.length === 1 && r.errors[0].err === 'ladder blew up', JSON.stringify(r.errors));
}
// (9) BROKEN: counted >= nextThreshold while stage 0.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(40, 0, 12, 7, { fight: 7, forage: 3, craft: 2, talk: 0, explore: 0 }, 12),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q1-LADDER (9) verdict BROKEN on rung contradiction', r.verdict === 'BROKEN', r.verdict);
  ok('Q1-LADDER (9) inconsistency named', r.inconsistent.length === 1 && r.inconsistent[0].counted === 12, JSON.stringify(r.inconsistent));
}
// (10) BROKEN: a countedTrack above the cap.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(40, 0, 9, 7, { fight: 9, forage: 0, craft: 0, talk: 0, explore: 0 }, 12),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q1-LADDER (10) verdict BROKEN on cap breach', r.verdict === 'BROKEN', r.verdict);
  ok('Q1-LADDER (10) the breaching track is named', r.inconsistent.length === 1 && r.inconsistent[0].track === 'fight', JSON.stringify(r.inconsistent));
}
// (11) Stage drop mid-panel recorded, verdict stays OPENS.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(40, 0, 5, 7, null, 12),
    ladderSnap(60, 1, 13, 15, { fight: 7, forage: 3, craft: 2, talk: 1, explore: 0 }, 26),
    ladderSnap(80, 0, 8, 7, { fight: 7, forage: 1, craft: 0, talk: 0, explore: 0 }, 12, 1),
    ladderSnap(100, 1, 14, 15, { fight: 7, forage: 4, craft: 2, talk: 1, explore: 0 }, 26),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q1-LADDER (11) mid-panel stage drop recorded', r.stageDrops.length === 1 && r.stageDrops[0].day === 80 && r.stageDrops[0].peak === 1 && r.stageDrops[0].live === 0, JSON.stringify(r.stageDrops));
  ok('Q1-LADDER (11) verdict still OPENS', r.verdict === 'OPENS', r.verdict);
}
// (12) Minted takes the max across snaps.
{
  const s = seedJSON({ ladderSnaps: [
    ladderSnap(40, 0, 5, 7, { fight: 2, forage: 1, craft: 0, talk: 0, explore: 0 }, 12),
    ladderSnap(80, 0, 9, 7, { fight: 7, forage: 2, craft: 3, talk: 0, explore: 0 }, 12),
  ] });
  const r = A.summarizeLadder(s);
  ok('Q1-LADDER (12) minted is the per-track max', r.minted.fight === 7 && r.minted.craft === 3 && r.minted.talk === 0, JSON.stringify(r.minted));
}
function trustSnap(day, scholar, health, trust, fallenN) {
  return { day, scholar, scholarHealth: health, trust, fallenN: fallenN || 0, lastFallen: null };
}
function trustDeath(day, oldBearer, newBearer, deltas, expected) {
  return { day, cause: 'the wild', oldBearer, newBearer, deltas, expected: expected === undefined ? deltas : expected };
}
// (13) Stranger gain: never-talked-to villager paid on a death.
{
  const s = seedJSON({
    trustSnaps: [trustSnap(49, 'v_old', 90, { v_h1: 39, v_h2: 10 }, 0),
      trustSnap(50, 'v_new', 100, { v_h1: 45, v_h2: 10 }, 1),
      trustSnap(51, 'v_new', 98, { v_h1: 45, v_h2: 10 }, 1)],
    trustDeaths: [trustDeath(50, 'v_old', 'v_new', { v_h1: 6 })],
  });
  // v_h1 never appears in convoEvents or talkedSittings: a stranger.
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (13) verdict TRUST-PAID-TO-STRANGERS', r.verdict === 'TRUST-PAID-TO-STRANGERS', r.verdict);
  ok('Q2-TRUST (13) stranger gain counted once', r.strangerGains === 1 && r.strangerGainTotal === 6, JSON.stringify(r));
  ok('Q2-TRUST (13) the gainer is kind stranger', r.deathDetail[0].gains[0].kind === 'stranger', JSON.stringify(r.deathDetail));
}
// (14) Known gain: gainer talked to before the death.
{
  const s = seedJSON({
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [],
      convoEvents: [{ fn: 'talkTo', day: 45, target: 'v_h1' }], errors: [] },
    trustSnaps: [trustSnap(49, 'v_old', 90, { v_h1: 39 }, 0),
      trustSnap(50, 'v_new', 100, { v_h1: 45 }, 1)],
    trustDeaths: [trustDeath(50, 'v_old', 'v_new', { v_h1: 6 })],
  });
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (14) verdict TRUST-EARNED-ONLY', r.verdict === 'TRUST-EARNED-ONLY', r.verdict);
  ok('Q2-TRUST (14) known gain counted', r.knownGains === 1 && r.knownGainTotal === 6, JSON.stringify(r));
  ok('Q2-TRUST (14) firstContact recorded', r.deathDetail[0].gains[0].firstContact === 45, JSON.stringify(r.deathDetail));
}
// (15) Late gain: first contact on the death day is 'late', not stranger.
{
  const s = seedJSON({
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [],
      convoEvents: [{ fn: 'talkTo', day: 50, target: 'v_h1' }], errors: [] },
    trustSnaps: [trustSnap(49, 'v_old', 90, { v_h1: 39 }, 0),
      trustSnap(50, 'v_new', 100, { v_h1: 45 }, 1)],
    trustDeaths: [trustDeath(50, 'v_old', 'v_new', { v_h1: 6 })],
  });
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (15) same-day contact is late, not stranger', r.strangerGains === 0 && r.lateGains === 1, JSON.stringify(r));
  ok('Q2-TRUST (15) verdict stays TRUST-EARNED-ONLY', r.verdict === 'TRUST-EARNED-ONLY', r.verdict);
}
// (16) Mantle latency 1 and 2.
{
  const s = seedJSON({
    trustSnaps: [trustSnap(49, 'v_old', 90, {}, 0),
      trustSnap(50, 'v_old', 88, {}, 0),
      trustSnap(51, 'v_new', 100, {}, 1),
      trustSnap(60, 'v_new', 80, {}, 1),
      trustSnap(62, 'v_new2', 100, {}, 2)],
    trustDeaths: [trustDeath(50, 'v_old', 'v_new', {}), trustDeath(60, 'v_new', 'v_new2', {})],
  });
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (16) latency 1 for the day-50 death', r.deathDetail[0].latency === 1 && r.deathDetail[0].mantleDay === 51, JSON.stringify(r.deathDetail));
  ok('Q2-TRUST (16) latency 2 for the day-60 death', r.deathDetail[1].latency === 2 && r.deathDetail[1].mantleDay === 62, JSON.stringify(r.deathDetail));
}
// (17) Non-death-day trust movement.
{
  const s = seedJSON({
    trustSnaps: [trustSnap(49, 'v_old', 90, { v_h1: 39 }, 0),
      trustSnap(50, 'v_old', 88, { v_h1: 41 }, 0),
      trustSnap(51, 'v_old', 85, { v_h1: 41 }, 0)],
    trustDeaths: [],
  });
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (17) non-death move counted once', r.nonDeathMoves === 1, JSON.stringify(r.nonDeathDetail));
  ok('Q2-TRUST (17) the move names the delta', r.nonDeathDetail[0].moved[0].vid === 'v_h1' && r.nonDeathDetail[0].moved[0].delta === 2, JSON.stringify(r.nonDeathDetail));
}
// (18) Dead-bearer day: scholarHealth 0 while still bearer.
{
  const s = seedJSON({
    trustSnaps: [trustSnap(49, 'v_old', 90, {}, 0),
      trustSnap(50, 'v_old', 0, {}, 0),
      trustSnap(51, 'v_new', 100, {}, 1)],
    trustDeaths: [trustDeath(51, 'v_old', 'v_new', {})],
  });
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (18) dead-bearer day recorded', r.deadBearerDays.length === 1 && r.deadBearerDays[0].day === 50, JSON.stringify(r.deadBearerDays));
}
// (19) No deaths at all -> NO-GAINS.
{
  const s = seedJSON({ trustSnaps: [trustSnap(45, 'v_old', 90, { v_h1: 10 }, 0)], trustDeaths: [] });
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (19) verdict NO-GAINS with no deaths', r.verdict === 'NO-GAINS', r.verdict);
  ok('Q2-TRUST (19) zero deaths, zero gainers', r.deaths === 0 && r.gainers === 0, JSON.stringify(r));
}
// (20) Successor overwrite: expected +6, net -40 — classified by the
// payment, the overwrite shown alongside, never confused.
{
  const s = seedJSON({
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [],
      convoEvents: [{ fn: 'talkTo', day: 45, target: 'v_new' }], errors: [] },
    trustSnaps: [trustSnap(49, 'v_old', 90, { v_new: 46 }, 0),
      trustSnap(50, 'v_new', 100, { v_new: 6 }, 1)],
    trustDeaths: [trustDeath(50, 'v_old', 'v_new', { v_new: -40 }, { v_new: 6 })],
  });
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (20) successor classified by expected payment', r.deathDetail[0].gains[0].amt === 6 && r.deathDetail[0].gains[0].net === -40, JSON.stringify(r.deathDetail));
  ok('Q2-TRUST (20) the +6 is a known gain (talked day 45)', r.knownGains === 1 && r.knownGainTotal === 6 && r.strangerGains === 0, JSON.stringify(r));
  ok('Q2-TRUST (20) verdict TRUST-EARNED-ONLY', r.verdict === 'TRUST-EARNED-ONLY', r.verdict);
}
// (21) Old-shape record without `expected` falls back to net deltas.
{
  const s = seedJSON({
    trustSnaps: [trustSnap(49, 'v_old', 90, { v_h1: 39 }, 0),
      trustSnap(50, 'v_new', 100, { v_h1: 45 }, 1)],
    trustDeaths: [{ day: 50, cause: 'the wild', oldBearer: 'v_old', newBearer: 'v_new', deltas: { v_h1: 6 } }],
  });
  const r = A.summarizeTrust(s);
  ok('Q2-TRUST (21) old-shape record falls back to net deltas', r.deathDetail[0].gains[0].amt === 6 && r.strangerGains === 1, JSON.stringify(r.deathDetail));
}
console.log(fail === 0 ? `R119 instruments: ${pass} passed` : `R119 instruments: ${pass} passed, ${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
