// analyze-allyslot3-b.js — analyzer + judge, arm sim-allyslot3-b.
// Reads per-seed JSONs (the allyslot3 driver recorder) from two dirs
// and judges the frozen prereg: the 3rd-ally-slot — on the armed leg,
// a launched quad meeting where the second ally joined must also
// field the third (a launch-party member) at least 80% of the time,
// with a pool floor of >=2 such denominator meetings; the control
// leg (same code, flag off) fields no third ally by construction.
// Reuses analyze-partyquads-b.js perSeed/wall/summarizeLeg for the
// launch census (same join, same pool floor) and the partysize4
// size4Shares damage-share report (REPORTED, not binding), and adds
// the field-4 table: per-seed launched-quad-meeting join with the
// ally2-joined denominator, the ally3-joined numerator, and the
// sense rate (sensed list == all 3 launch companions). Cost bars
// are the prereg guardrails (starvation, median survival, community
// loss); instrument bar is 0 errors. A miss is NO-GO, never
// re-scored mid-run (MEASUREMENT.md §14).
// Usage:
//   node scripts/analyze-allyslot3-b.js --ctl evidence/2026-11-18/perseed-allyslot3-b-ctl --arm evidence/2026-11-18/perseed-allyslot3-b-arm [--out evidence/2026-11-18/allyslot3-b-analysis.json]
//   node scripts/analyze-allyslot3-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const PQ = require(path.join(__dirname, 'analyze-partyquads-b.js'));
const perSeed = PQ.perSeed;
const wall = PQ.wall;
const summarizeLeg = PQ.summarizeLeg;

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Quad launches in one per-seed file: result 'launch', wave-4+ target,
// size >= 4. Party is holder + members.
function quadLaunches(d) {
  const quads = [];
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || (r.targetWave | 0) < 4) continue;
    const size = r.partySize != null ? r.partySize : ((r.party || []).length + 1);
    if (size >= 4) quads.push({ day: r.day, vid: r.vid, target: r.target || null, party: [r.vid].concat(r.party || []) });
  }
  return quads;
}

// CORRECTED JOIN (finding #2570 — sim-sensecotravel-b): the meeting
// joins the quad launch whose party contains the fighter AND the sensed
// allies (best-match: most sensed allies in the party; most recent
// launch day on ties; file order on a same-day tie). The fighter MUST
// belong to the joined launch — a trio-expedition fight joined only
// via a shared ally never enters the denominator. Window is still
// [launch day, launch day + 21]; the target==mid rule stays dropped
// (finding #2564). Returns { launch, score } or null.
function correctedJoin(quads, e) {
  const sensed = e.allyVids || [];
  let best = null, bestScore = -1;
  for (const l of quads) {
    if (e.day < l.day || e.day > l.day + 21) continue;
    if (l.party.indexOf(e.vid) === -1) continue; // fighter must belong
    let score = 0;
    for (const s of sensed) if (l.party.indexOf(s) !== -1) score++;
    if (score > bestScore || (score === bestScore && best && l.day > best.day)) { best = l; bestScore = score; }
  }
  return best ? { launch: best, score: bestScore } : null;
}

// Launch companions of the fighter under a joined launch: party minus
// the fighter (3 people on a quad). The sense is full when the sensed
// set is exactly this trio.
function launchCompanions(launch, fighterVid) {
  return launch.party.filter(function (v) { return v !== fighterVid; });
}
function senseIsFull(launch, e) {
  const comps = launchCompanions(launch, e.vid);
  if (comps.length !== 3) return false;
  const sensed = e.allyVids || [];
  if (sensed.length !== 3) return false;
  return comps.every(function (v) { return sensed.indexOf(v) !== -1; });
}
// Size-4 damage share, REPORTED not binding (prereg): computed from
// the per-seed files' v4encounters with the CORRECTED join (finding
// #2570 — fighter-anchored best-match, same as field4Table). Finding
// #2564: the target==mid rule is DROPPED — off-target meetings count.
// Share = mDealt / mHpStart (vKill = 1.0 by definition); the recorder
// repair supplies mHpStart on fought rows (no-contact evades are
// correct nulls and excluded).
function size4Shares(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const shares = [];
  let fought = 0, noHp = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    const quads = quadLaunches(d);
    for (const e of (d.v4encounters || [])) {
      if (e.origin !== 'expedition') continue;
      if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue; // no-contact evade: no monster spawned
      const joined = correctedJoin(quads, e);
      if (!joined) continue;
      fought++;
      if (e.outcome === 'vKill') { shares.push(1.0); continue; }
      if (e.mHpStart == null) { noHp++; continue; }
      shares.push((e.mDealt || 0) / e.mHpStart);
    }
  }
  return { n: shares.length, fought: fought, noHp: noHp,
    mean: shares.length ? shares.reduce(function (a, b) { return a + b; }, 0) / shares.length : null };
}

// Field-4 table: per-seed launched-quad-meeting join with the
// CORRECTED join (finding #2570 — fighter-anchored best-match; the
// target==mid rule stays dropped per finding #2564, off-target
// meetings count). A meeting is a fought expedition encounter row
// joined to a quad launch. Denominator: the second ally joined
// (rec.ally2Vid present) — the third shout can only fire after the
// second, so meetings where ally2 never joined cannot field a fourth
// member and are excluded (the raw field-4 rate over ALL launched
// quad meetings is reported alongside, so the exclusion stays
// visible). Numerator: the third ally also joined (rec.ally3Vid
// present) AND is a launch-party member. Sense rate (reported): the
// sensed allyVids list at the call is the full trio of launch
// companions (launch party minus the fighter).
function field4Table(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let meetings = 0, denom = 0, numer = 0, senseDen = 0, senseN = 0, ally3DealtTotal = 0, deaths = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    deaths += ((d.deaths || []).length);
    const quads = quadLaunches(d);
    let m = 0, dn = 0, nu = 0, sd = 0, sn = 0, a3d = 0;
    for (const e of (d.v4encounters || [])) {
      if (e.origin !== 'expedition') continue;
      if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue; // no-contact evade
      const joined = correctedJoin(quads, e);
      if (!joined) continue;
      const launched = joined.launch;
      m++;
      // Sense rate: the sensed list at the call is the full trio.
      if (senseIsFull(launched, e)) sn++;
      sd++;
      if (e.ally2Vid) {
        dn++;
        if (e.ally3Vid && launched.party.indexOf(e.ally3Vid) !== -1) { nu++; a3d += (e.ally3Dealt || 0); }
      }
    }
    meetings += m; denom += dn; numer += nu; senseDen += sd; senseN += sn; ally3DealtTotal += a3d;
    perSeed.push({ seed: d.seed, quadLaunches: quads.length, meetings: m, denom: dn, numer: nu, senseDen: sd, senseN: sn, ally3Dealt: a3d });
  }
  return { perSeed: perSeed, meetings: meetings, denom: denom, numer: numer,
    rate: denom ? numer / denom : null, rawRate: meetings ? numer / meetings : null,
    senseDen: senseDen, senseN: senseN, senseRate: senseDen ? senseN / senseDen : null,
    ally3DealtTotal: ally3DealtTotal, deaths: deaths };
}

// CO-LOCATION DECOMPOSITION (finding #2571 — sim-sensecotravel-b).
// For every joined quad meeting where the sense did NOT return the
// full trio, classify EACH missing companion by cause, from the
// corpus (prereg classes):
//   dead — villager death row with day <= meeting day (the death
//     cleanup purges them from the plan party by design).
//   not-in-plan-party — the companion is absent from the fighter's
//     gate planParty at the meeting instant (the sense's launch
//     branch never considered them; the same-target guard was never
//     reached). Sub-class:
//     different-expedition — member of a different in-window quad
//       launch than the joined one (e.g. the fighter re-launched
//       after the quad).
//     expedition-ended — only in-window membership is the joined
//       launch, and the expedition had ended before the meeting
//       (holder or companion census row holderExped false after the
//       launch day, or dawn onExped false).
//     trim-unproven — the plan party shrank with no recorded launch,
//       death, or leave to explain the trim (recorded, not guessed).
//   in-plan-party-but-unsensed — the companion IS in the gate
//     planParty but NOT in the sensed list (the only class where the
//     sense's same-target guard could have bitten; NOTE the code
//     guards on expedition TARGET (tx, ty) — there is NO tile check
//     in party-wiring.js). Sub-class by dawn nodes (fighter vs
//     companion): same-tile / different-tile / no-dawn-data.
// Dawn rows carry a known artifact: a bidder's OWN member entry
// reads node null / firstFail selfOrScholar, so non-bidder rows are
// preferred; when a meeting day has no dawn rows at all the
// classification rests on census + departs + deaths.
function gateRowFor(d, e) {
  for (const g of (d.v4gates || [])) {
    if (g.day === e.day && g.vid === e.vid && g.mid === e.mid) return g;
  }
  return null;
}
function dawnState(d, day, vid) {
  const rows = (d.companionPool || []).filter(function (r) { return r.day === day; });
  if (!rows.length) return null;
  let found = null;
  for (const row of rows) {
    if (row.vid === vid) continue; // own row: node null by construction
    for (const m of (row.members || [])) {
      if (m.id === vid) { found = m; break; }
    }
    if (found) break;
  }
  if (!found) {
    for (const row of rows) {
      for (const m of (row.members || [])) {
        if (m.id === vid) { found = m; break; }
      }
      if (found) break;
    }
  }
  if (!found) return null;
  return { node: found.node || null, away: !!found.away, onExped: !!found.onExped, alive: found.alive !== false };
}
function expeditionEndedBefore(d, quads, joined, companion, meetingDay) {
  // The joined launch's expedition ended when the holder's or the
  // companion's census row (mirrored plans included) reads
  // holderExped false on a day after the launch day and on/before
  // the meeting day.
  const vids = [joined.launch.vid, companion];
  for (const c of (d.dawnbidCensus || [])) {
    if (c.day <= joined.launch.day || c.day > meetingDay) continue;
    if (vids.indexOf(c.vid) === -1) continue;
    if (c.holderExped === false) return { day: c.day, vid: c.vid };
  }
  // Dawn fallback: the companion is not on an expedition on the
  // meeting day (and was not the meeting-day bidder artifact).
  const ds = dawnState(d, meetingDay, companion);
  if (ds && ds.onExped === false) return { day: meetingDay, vid: companion, via: 'dawn' };
  return null;
}
function classifyMissing(d, quads, joined, e, companion, cap2) {
  const gate = gateRowFor(d, e);
  const planParty = gate ? (gate.planParty || []) : null;
  const detail = { companion: companion,
    planParty: planParty,
    gateDay: gate ? gate.day : null };
  for (const dd of (d.deaths || [])) {
    if (dd.kind === 'villager' && dd.who === companion && (dd.day | 0) <= (e.day | 0)) {
      detail.deathDay = dd.day; detail.deathCause = dd.cause || null;
      return { cause: 'dead', detail: detail };
    }
  }
  if (planParty && planParty.indexOf(companion) === -1) {
    // Member of a different in-window quad launch? Only a LATER
    // launch counts: an older launch is superseded — the companion
    // departed on the joined launch (or was skipped there and kept
    // their own trip, which this corpus cannot show per-companion;
    // none of the judged misses turns on it). Most recent wins.
    let other = null;
    for (const l of quads) {
      if (e.day < l.day || e.day > l.day + 21) continue;
      if (l.day <= joined.launch.day) continue;
      if (l.day === joined.launch.day && l.vid === joined.launch.vid) continue;
      if (l.party.indexOf(companion) !== -1 && (!other || l.day > other.day)) other = l;
    }
    if (other) {
      detail.otherLaunch = { day: other.day, holder: other.vid };
      return { cause: 'different-expedition', detail: detail };
    }
    const ended = expeditionEndedBefore(d, quads, joined, companion, e.day);
    if (ended) { detail.ended = ended; return { cause: 'expedition-ended', detail: detail }; }
    return { cause: 'trim-unproven', detail: detail };
  }
  if (planParty) {
    // Cap-2 legs (the control leg: the sense returns at most 2, so
    // a third launch companion in planParty but unsensed is the cap
    // cut, not a guard failure) — only when the sensed list already
    // holds 2 launch companions.
    if (cap2) {
      const sensedLaunch = (e.allyVids || []).filter(function (v) { return joined.launch.party.indexOf(v) !== -1; }).length;
      if (sensedLaunch >= 2) return { cause: 'cap-2-cut', detail: detail };
    }
    // In the plan party but unsensed: the guard class. Compare dawn
    // tiles (fighter vs companion).
    const fDawn = dawnState(d, e.day, e.vid);
    const cDawn = dawnState(d, e.day, companion);
    detail.fighterDawn = fDawn; detail.companionDawn = cDawn;
    if (!fDawn || !cDawn || !fDawn.node || !cDawn.node) return { cause: 'in-plan-party-but-unsensed/no-dawn-data', detail: detail };
    const same = fDawn.node.nx === cDawn.node.nx && fDawn.node.ny === cDawn.node.ny;
    return { cause: same ? 'in-plan-party-but-unsensed/same-tile' : 'in-plan-party-but-unsensed/different-tile', detail: detail };
  }
  return { cause: 'unclassified/no-gate-row', detail: detail };
}
function senseMisses(dir, cap2) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const misses = [];
  let meetings = 0, senseFull = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    const quads = quadLaunches(d);
    for (const e of (d.v4encounters || [])) {
      if (e.origin !== 'expedition') continue;
      if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue;
      const joined = correctedJoin(quads, e);
      if (!joined) continue;
      meetings++;
      if (senseIsFull(joined.launch, e)) { senseFull++; continue; }
      const comps = launchCompanions(joined.launch, e.vid);
      const sensed = e.allyVids || [];
      const missing = comps.filter(function (v) { return sensed.indexOf(v) === -1; });
      const extra = sensed.filter(function (v) { return joined.launch.party.indexOf(v) === -1; });
      misses.push({ seed: d.seed, day: e.day, mid: e.mid, wave: e.wave, fighter: e.vid,
        rounds: e.rounds, outcome: e.outcome,
        joinedLaunch: { day: joined.launch.day, holder: joined.launch.vid, party: joined.launch.party.slice(), score: joined.score },
        sensed: sensed.slice(), missing: missing.slice(), extra: extra.slice(),
        ally2Vid: e.ally2Vid || null, ally3Vid: e.ally3Vid || null,
        classifications: missing.map(function (c) { return classifyMissing(d, quads, joined, e, c, !!cap2); }) });
    }
  }
  const byCause = {};
  for (const m of misses) for (const cl of m.classifications) byCause[cl.cause] = (byCause[cl.cause] || 0) + 1;
  return { meetings: meetings, senseFull: senseFull, misses: misses, byCause: byCause };
}

function judge(ctl, arm, ctlF4, armF4) {
  const bars = [];
  const launchesOk = ctl.launches >= 6 && arm.launches >= 6;
  const poolOk = launchesOk && armF4.denom >= 2;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'launches ctl ' + ctl.launches + ' / arm ' + arm.launches + '; arm field-4 denominator (ally2-joined quad meetings) ' + armF4.denom + ' (floor 6 launches/leg, >=2 denominator meetings)' });
  const rate = armF4.rate;
  const primaryPass = poolOk && rate != null && rate >= 0.80 && ctlF4.numer === 0;
  bars.push({ id: 'primary-field-4', pass: primaryPass,
    detail: 'arm field-4 ' + armF4.numer + '/' + armF4.denom + ' = ' + (rate == null ? 'n/a (no denominator meetings)' : rate.toFixed(2)) + ' (bar >= 0.80); ctl field-4 ' + ctlF4.numer + '/' + ctlF4.denom + ' (bar 0 numerator); raw rate over all launched quad meetings arm ' + (armF4.rawRate == null ? 'n/a' : armF4.rawRate.toFixed(2)) + ' (' + armF4.numer + '/' + armF4.meetings + ')' });
  const sensePass = true; // reported, not binding (prereg)
  bars.push({ id: 'sense-rate-reported', pass: sensePass,
    detail: 'sense rate arm ' + armF4.senseN + '/' + armF4.senseDen + ' = ' + (armF4.senseRate == null ? 'n/a' : armF4.senseRate.toFixed(2)) + '; ctl ' + ctlF4.senseN + '/' + ctlF4.senseDen + ' (reported only)' });
  const starvPass = arm.starvation <= ctl.starvation + 2 && arm.starvationVillager <= ctl.starvationVillager + 2;
  bars.push({ id: 'cost-starvation', pass: starvPass,
    detail: 'starvation totals arm ' + arm.starvation + ' vs ctl ' + ctl.starvation + '; villager arm ' + arm.starvationVillager + ' vs ctl ' + ctl.starvationVillager + ' (bar arm<=ctl+2 both)' });
  const medPass = ctl.medianDays == null || arm.medianDays == null || arm.medianDays >= 0.8 * ctl.medianDays;
  bars.push({ id: 'cost-median', pass: medPass,
    detail: 'median survival arm ' + arm.medianDays + 'd vs ctl ' + ctl.medianDays + 'd (bar arm>=0.8x ctl)' });
  const commPass = armF4.deaths <= ctlF4.deaths + 16;
  bars.push({ id: 'cost-community', pass: commPass,
    detail: 'village deaths arm ' + armF4.deaths + ' vs ctl ' + ctlF4.deaths + ' (bar arm<=ctl+16)' });
  const instrPass = ctl.errors === 0 && arm.errors === 0;
  bars.push({ id: 'instrument', pass: instrPass,
    detail: 'instrument errors ctl ' + ctl.errors + ' / arm ' + arm.errors + ' (bar 0)' });
  let verdict = 'NO-GO';
  let kind = '';
  if (!launchesOk) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (armF4.denom === 0) { verdict = 'NO-GO'; kind = 'NO-FIELD4-POOL'; }
  else if (bars.every(function (b) { return b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  function mkLeg(o) {
    return Object.assign({ launches: 8, trioLaunches: 0, trioRate: 0, partyTrios: 0,
      quadLaunches: 0, partyQuads: 0, perSeed: [],
      starvation: 0, starvationVillager: 0, medianDays: 150, errors: 0 }, o);
  }
  function mkF4(o) {
    return Object.assign({ perSeed: [], meetings: 0, denom: 0, numer: 0, rate: null, rawRate: null,
      senseDen: 0, senseN: 0, senseRate: null, ally3DealtTotal: 0, deaths: 0 }, o);
  }
  // GO shape: arm 5/5 field-4, ctl 0 numerator, costs clean.
  let j = judge(mkLeg({}), mkLeg({}),
    mkF4({ meetings: 6, denom: 4, numer: 0, senseDen: 6, senseN: 0, deaths: 2 }),
    mkF4({ meetings: 6, denom: 5, numer: 5, rate: 1.0, rawRate: 5 / 6, senseDen: 6, senseN: 5, senseRate: 5 / 6, ally3DealtTotal: 240, deaths: 3 }));
  check('judge GO shape passes (arm field-4 5/5, ctl 0, costs clean)', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkLeg({}), mkLeg({}),
    mkF4({ meetings: 6, denom: 4, numer: 0, deaths: 2 }),
    mkF4({ meetings: 6, denom: 4, numer: 2, rate: 0.5, rawRate: 2 / 6, deaths: 3 }));
  check('judge NO-GO at field-4 2/4 = 0.50 (< 0.80)', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({}), mkLeg({}),
    mkF4({ meetings: 6, denom: 4, numer: 0, deaths: 2 }),
    mkF4({ meetings: 6, denom: 1, numer: 1, rate: 1.0, rawRate: 1 / 6, deaths: 3 }));
  check('judge NO-GO below the pool floor (denominator 1 < 2)', j.verdict === 'NO-GO' && !j.bars[0].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({}), mkLeg({}),
    mkF4({ meetings: 6, denom: 4, numer: 0, deaths: 2 }),
    mkF4({ meetings: 0, denom: 0, numer: 0, deaths: 0 }));
  check('judge NO-FIELD4-POOL when no ally2-joined quad meeting exists on the arm', j.verdict === 'NO-GO' && j.kind === 'NO-FIELD4-POOL', JSON.stringify(j));
  j = judge(mkLeg({ launches: 3 }), mkLeg({}),
    mkF4({ meetings: 6, denom: 4, numer: 0, deaths: 2 }),
    mkF4({ meetings: 6, denom: 5, numer: 5, rate: 1.0, deaths: 3 }));
  check('judge METRIC-BROKEN below the launch floor', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkLeg({}), mkLeg({ starvation: 3 }),
    mkF4({ meetings: 6, denom: 4, numer: 0, deaths: 2 }),
    mkF4({ meetings: 6, denom: 5, numer: 5, rate: 1.0, deaths: 3 }));
  check('judge NO-GO when the starvation cost bar breaches', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({}), mkLeg({}),
    mkF4({ meetings: 6, denom: 4, numer: 0, deaths: 2 }),
    mkF4({ meetings: 6, denom: 5, numer: 5, rate: 1.0, deaths: 19 }));
  check('judge NO-GO when the community-loss cost bar breaches (arm deaths 19 > ctl 2 + 16)', j.verdict === 'NO-GO' && !j.bars[5].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({}), mkLeg({}),
    mkF4({ meetings: 6, denom: 4, numer: 1, deaths: 2 }),
    mkF4({ meetings: 6, denom: 5, numer: 5, rate: 1.0, deaths: 3 }));
  check('judge NO-GO when the control leg fields a third ally (flag-off leak)', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({}), mkLeg({}),
    mkF4({ meetings: 6, denom: 4, numer: 0, deaths: 2 }),
    mkF4({ meetings: 6, denom: 5, numer: 4, rate: 0.8, rawRate: 4 / 6, deaths: 3 }));
  check('judge GO at exactly the bar (field-4 4/5 = 0.80)', j.verdict === 'GO', JSON.stringify(j.bars));
  // field4Table join: day window [launch, launch+21], party
  // membership, ally2 denominator, ally3-in-party numerator, sense
  // rate from the sensed list. Finding #2564: the target==mid rule
  // is DROPPED — the off-target 'eater' meeting (launch target
  // 'strike') now counts. A wrong-monster meeting counts; an
  // out-of-window or bystander-ally3 meeting must not.
  (function () {
    const os2 = require('os');
    const tmp2 = fs.mkdtempSync(path.join(os2.tmpdir(), 'as3-f4-'));
    const dir2 = path.join(tmp2, 'leg');
    fs.mkdirSync(dir2);
    fs.writeFileSync(path.join(dir2, 's104431.json'), JSON.stringify({
      seed: 104431,
      deaths: [{ day: 10 }, { day: 40 }],
      v4departs: [{ day: 98, vid: 'giulia', result: 'launch', targetWave: 4, target: 'strike', party: ['yara', 'james', 'omar'], partySize: 4 }],
      v4encounters: [
        { day: 100, vid: 'giulia', mid: 'strike', wave: 4, outcome: 'fled', rounds: 4, mDealt: 180, mHpStart: 900, origin: 'expedition',
          allyVids: ['yara', 'james', 'omar'], allyVid: 'yara', ally2Vid: 'james', ally3Vid: 'omar', ally3Dealt: 45 },
        { day: 100, vid: 'giulia', mid: 'eater', wave: 4, outcome: 'fled', rounds: 3, mDealt: 90, mHpStart: 900, origin: 'expedition',
          allyVids: ['yara', 'james'], allyVid: 'yara', ally2Vid: 'james', ally3Vid: null, ally3Dealt: 0 },
        { day: 130, vid: 'giulia', mid: 'strike', wave: 4, outcome: 'fled', rounds: 2, mDealt: 50, mHpStart: 900, origin: 'expedition',
          allyVids: ['yara', 'james', 'omar'], allyVid: 'yara', ally2Vid: 'james', ally3Vid: 'omar', ally3Dealt: 10 },
        { day: 101, vid: 'yara', mid: 'strike', wave: 4, outcome: 'vKill', rounds: 6, mDealt: 0, mHpStart: null, origin: 'expedition',
          allyVids: ['giulia', 'james', 'omar'], allyVid: 'giulia', ally2Vid: 'james', ally3Vid: 'omar', ally3Dealt: 0 },
        { day: 102, vid: 'giulia', mid: 'strike', wave: 4, outcome: 'fled', rounds: 3, mDealt: 120, mHpStart: 900, origin: 'expedition',
          allyVids: ['yara', 'james', 'stranger'], allyVid: 'yara', ally2Vid: 'james', ally3Vid: 'stranger', ally3Dealt: 30 },
      ],
    }));
    const t2 = field4Table(dir2);
    check('field4Table joins in-window meetings incl. off-target (finding #2564); denom=ally2-joined, numer=ally3-in-party, sense from the sensed list',
      t2.meetings === 4 && t2.denom === 4 && t2.numer === 2 && t2.senseDen === 4 && t2.senseN === 2 &&
      t2.ally3DealtTotal === 45 && t2.deaths === 2 && Math.abs(t2.rate - 2 / 4) < 1e-9, JSON.stringify(t2));
    try { fs.rmSync(tmp2, { recursive: true, force: true }); } catch (e) {}
  })();
  // Finding #2564 regression: the one live-fire row from the old
  // pilot (arm leg, seed 104437, day 133 — the Reunion, wave 4).
  // The holder app_mgpsphub92 launched a quad on day 130 against
  // the Herald (party ruby_callaghan + gen_ph37qf5 + gen_353ni1r);
  // three days later the party met the Reunion instead and all
  // three allies fought (ally3Vid gen_353ni1r, ally3Dealt 23 of
  // 239 vs 1,322 HP, 7 rounds, vFlee). Under the old target==mid
  // rule this row was invisible (Reunion !== Herald); under the
  // loose join it counts as 1/1 fielded.
  (function () {
    const os3 = require('os');
    const tmp3 = fs.mkdtempSync(path.join(os3.tmpdir(), 'as3-d133-'));
    const dir3 = path.join(tmp3, 'leg');
    fs.mkdirSync(dir3);
    fs.writeFileSync(path.join(dir3, 's104437.json'), JSON.stringify({
      seed: 104437,
      deaths: [],
      v4departs: [{ day: 130, vid: 'app_mgpsphub92', result: 'launch', targetWave: 4, target: 'herald',
        party: ['ruby_callaghan', 'gen_ph37qf5', 'gen_353ni1r'], partySize: 4 }],
      v4encounters: [
        { day: 133, vid: 'ruby_callaghan', mid: 'reunion', wave: 4, outcome: 'vFlee', rounds: 7, mDealt: 239, mHpStart: 1322, origin: 'expedition',
          allyVids: ['app_mgpsphub92', 'gen_ph37qf5', 'gen_353ni1r'], allyVid: 'app_mgpsphub92', ally2Vid: 'gen_ph37qf5', ally3Vid: 'gen_353ni1r', ally3Dealt: 23 },
      ],
    }));
    const t3 = field4Table(dir3);
    check('finding #2564 regression: the d133 Reunion row (launch target Herald) counts as 1/1 fielded under the loose join',
      t3.meetings === 1 && t3.denom === 1 && t3.numer === 1 && t3.rate === 1 && t3.rawRate === 1 && t3.ally3DealtTotal === 23, JSON.stringify(t3));
    try { fs.rmSync(tmp3, { recursive: true, force: true }); } catch (e) {}
  })();
  // CORRECTED JOIN (finding #2570 — sim-sensecotravel-b): the d117
  // editor regression, synthetic. Two overlapping quads: day 102
  // (party petra + visjoin + miguel + nino) and day 111 (party petra
  // + hannah + miguel + nikos); the day-115 re-launch repeats the
  // day-111 party. Fighter miguel, sensed trio petra + hannah +
  // nikos, ally3 nikos dealt 17. The corrected join must pick the
  // day-115 launch (best score 3, most recent on the tie) and count
  // the meeting as fielded; the old first-match join picked day 102
  // and counted it a miss.
  (function () {
    const os4 = require('os');
    const tmp4 = fs.mkdtempSync(path.join(os4.tmpdir(), 'as3-d117-'));
    const dir4 = path.join(tmp4, 'leg');
    fs.mkdirSync(dir4);
    fs.writeFileSync(path.join(dir4, 's104722.json'), JSON.stringify({
      seed: 104722,
      deaths: [],
      v4departs: [
        { day: 102, vid: 'petra_novak', result: 'launch', targetWave: 5, target: 'rerun', party: ['visjoin_100', 'miguel_santos', 'nino_kapanadze'], partySize: 4 },
        { day: 111, vid: 'petra_novak', result: 'launch', targetWave: 5, target: 'rerun', party: ['hannah_kim', 'miguel_santos', 'nikos_papadopoulos'], partySize: 4 },
        { day: 115, vid: 'petra_novak', result: 'launch', targetWave: 5, target: 'rerun', party: ['hannah_kim', 'miguel_santos', 'nikos_papadopoulos'], partySize: 4 },
      ],
      v4encounters: [
        { day: 117, vid: 'miguel_santos', mid: 'editor', wave: 5, outcome: 'vFlee', rounds: 5, mDealt: 408, mHpStart: 1749, origin: 'expedition',
          allyVids: ['petra_novak', 'hannah_kim', 'nikos_papadopoulos'], allyVid: 'petra_novak', ally2Vid: 'hannah_kim', ally3Vid: 'nikos_papadopoulos', ally3Dealt: 17 },
      ],
      v4gates: [
        { day: 117, vid: 'miguel_santos', mid: 'editor', planParty: ['petra_novak', 'hannah_kim', 'nikos_papadopoulos'] },
      ],
    }));
    const t4 = field4Table(dir4);
    check('finding #2570 regression: the d117 editor row joins the day-115 launch (best-match, most recent) and counts as 1/1 fielded',
      t4.meetings === 1 && t4.denom === 1 && t4.numer === 1 && t4.rate === 1 && t4.senseN === 1 && t4.ally3DealtTotal === 17, JSON.stringify(t4));
    const sm4 = senseMisses(dir4);
    check('finding #2570 regression: the d117 editor row is sense-full, so it produces no sense miss',
      sm4.meetings === 1 && sm4.senseFull === 1 && sm4.misses.length === 0, JSON.stringify(sm4));
    try { fs.rmSync(tmp4, { recursive: true, force: true }); } catch (e) {}
  })();
  // CORRECTED JOIN: fighter-must-belong — the d61 trio-expedition
  // case (finding #2570). Fighter gen_qc8t63a is on a trio expedition
  // (day-59 launch, holder + 2); an unrelated quad shares one ally.
  // The meeting must NOT join (no quad contains the fighter), so it
  // never enters the denominator.
  (function () {
    const os5 = require('os');
    const tmp5 = fs.mkdtempSync(path.join(os5.tmpdir(), 'as3-d61-'));
    const dir5 = path.join(tmp5, 'leg');
    fs.mkdirSync(dir5);
    fs.writeFileSync(path.join(dir5, 's104721.json'), JSON.stringify({
      seed: 104721,
      deaths: [],
      v4departs: [
        { day: 59, vid: 'gen_qc8t63a', result: 'launch', targetWave: 4, target: 'eater', party: ['gen_dnv7tkn', 'someone_else'], partySize: 3 },
        { day: 55, vid: 'other_holder', result: 'launch', targetWave: 4, target: 'audit', party: ['gen_dnv7tkn', 'x_one', 'x_two'], partySize: 4 },
      ],
      v4encounters: [
        { day: 61, vid: 'gen_qc8t63a', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 5, mDealt: 200, mHpStart: 1000, origin: 'expedition',
          allyVids: ['gen_dnv7tkn', 'someone_else'], allyVid: 'gen_dnv7tkn', ally2Vid: 'someone_else', ally3Vid: null, ally3Dealt: 0 },
      ],
      v4gates: [],
    }));
    const t5 = field4Table(dir5);
    check('finding #2570: a trio-expedition fight joined only via a shared ally never enters the denominator (fighter must belong)',
      t5.meetings === 0 && t5.denom === 0 && t5.numer === 0, JSON.stringify(t5));
    try { fs.rmSync(tmp5, { recursive: true, force: true }); } catch (e) {}
  })();
  // CORRECTED JOIN: best-match beats recency — an older launch with
  // score 3 wins over a newer launch with score 1, even though the
  // newer launch is more recent. Score is the primary key.
  (function () {
    const os6 = require('os');
    const tmp6 = fs.mkdtempSync(path.join(os6.tmpdir(), 'as3-score-'));
    const dir6 = path.join(tmp6, 'leg');
    fs.mkdirSync(dir6);
    fs.writeFileSync(path.join(dir6, 's104722.json'), JSON.stringify({
      seed: 104722,
      deaths: [],
      v4departs: [
        { day: 100, vid: 'holder_a', result: 'launch', targetWave: 4, target: 'eater', party: ['ana_one', 'ana_two', 'ana_three'], partySize: 4 },
        { day: 110, vid: 'holder_b', result: 'launch', targetWave: 4, target: 'audit', party: ['bob_one', 'bob_two', 'bob_three'], partySize: 4 },
      ],
      v4encounters: [
        { day: 112, vid: 'ana_one', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 4, mDealt: 100, mHpStart: 900, origin: 'expedition',
          allyVids: ['holder_a', 'ana_two', 'ana_three'], allyVid: 'holder_a', ally2Vid: 'ana_two', ally3Vid: 'ana_three', ally3Dealt: 9 },
      ],
      v4gates: [],
    }));
    const t6 = field4Table(dir6);
    check('finding #2570: best-match beats recency — older launch with score 3 wins over newer launch with score 0; meeting fielded',
      t6.meetings === 1 && t6.denom === 1 && t6.numer === 1 && t6.ally3DealtTotal === 9, JSON.stringify(t6));
    try { fs.rmSync(tmp6, { recursive: true, force: true }); } catch (e) {}
  })();
  // CO-LOCATION CLASSIFICATION (finding #2571 — sim-sensecotravel-b):
  // one synthetic file per class (same base: fighter 'fay' joined to
  // a day-100 quad, holder 'hal', party fay + dee + eli; the meeting
  // senses hal + dee and misses eli — except the dead case, which
  // senses hal + eli and misses dee).
  //   dead: dee dead d100 -> dead.
  //   different-expedition: eli in a different in-window quad
  //     (holder 'hal2' d101) -> different-expedition (planParty
  //     drops eli).
  //   expedition-ended: eli's expedition ended (census holderExped
  //     false d102) -> expedition-ended (planParty drops eli).
  //   in-plan-party-but-unsensed, dawn nodes differ -> .../different-tile.
  //   in-plan-party-but-unsensed, dawn nodes equal -> .../same-tile.
  //   in-plan-party-but-unsensed, no dawn rows -> .../no-dawn-data.
  //   trim-unproven: eli not in planParty, no other launch, no end
  //     evidence -> trim-unproven.
  (function () {
    const os7 = require('os');
    const tmp7 = fs.mkdtempSync(path.join(os7.tmpdir(), 'as3-cls-'));
    const dir7 = path.join(tmp7, 'leg');
    fs.mkdirSync(dir7);
    const baseDeparts = [
      { day: 100, vid: 'hal', result: 'launch', targetWave: 4, target: 'eater', party: ['fay', 'dee', 'eli'], partySize: 4 },
    ];
    function mkFile(seed, o) {
      const enc = { day: o.day, vid: 'fay', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 4, mDealt: 100, mHpStart: 900, origin: 'expedition',
        allyVids: o.sensed, allyVid: o.sensed[0] || null, ally2Vid: o.sensed[1] || null, ally3Vid: null, ally3Dealt: 0 };
      fs.writeFileSync(path.join(dir7, 's' + seed + '.json'), JSON.stringify({
        seed: seed,
        deaths: o.deaths || [],
        v4departs: o.departs || baseDeparts,
        v4encounters: [enc],
        v4gates: [{ day: o.day, vid: 'fay', mid: 'eater', planParty: o.planParty }],
        dawnbidCensus: o.census || [],
        companionPool: o.pool || [],
      }));
    }
    mkFile(100001, { day: 101, sensed: ['hal', 'eli'], planParty: ['hal', 'dee', 'eli'],
      deaths: [{ day: 100, kind: 'villager', who: 'dee', cause: 'The Eater', player: false }] });
    mkFile(100002, { day: 102, sensed: ['hal', 'dee'], planParty: ['hal', 'dee'],
      departs: baseDeparts.concat([{ day: 101, vid: 'hal2', result: 'launch', targetWave: 4, target: 'audit', party: ['fay2', 'eli', 'zed'], partySize: 4 }]) });
    mkFile(100003, { day: 103, sensed: ['hal', 'dee'], planParty: ['hal', 'dee'],
      census: [{ day: 102, vid: 'eli', target: 'eater', stage: 'hunt', party: ['hal', 'fay', 'dee'], holderExped: false, holderNode: { nx: 4, ny: 4 } }] });
    mkFile(100004, { day: 104, sensed: ['hal', 'dee'], planParty: ['hal', 'dee', 'eli'],
      pool: [{ day: 104, vid: 'some_bidder', part: 0, members: [
        { id: 'fay', node: { nx: 1, ny: 1 }, away: true, onExped: true, alive: true },
        { id: 'eli', node: { nx: 3, ny: 3 }, away: true, onExped: true, alive: true } ] }] });
    mkFile(100005, { day: 105, sensed: ['hal', 'dee'], planParty: ['hal', 'dee', 'eli'],
      pool: [{ day: 105, vid: 'some_bidder', part: 0, members: [
        { id: 'fay', node: { nx: 2, ny: 2 }, away: true, onExped: true, alive: true },
        { id: 'eli', node: { nx: 2, ny: 2 }, away: true, onExped: true, alive: true } ] }] });
    mkFile(100006, { day: 106, sensed: ['hal', 'dee'], planParty: ['hal', 'dee', 'eli'] });
    mkFile(100007, { day: 107, sensed: ['hal', 'dee'], planParty: ['hal', 'dee'] });
    const sm7 = senseMisses(dir7);
    const causes = {};
    for (const m of sm7.misses) for (const cl of m.classifications) causes[m.seed + ':' + cl.detail.companion] = cl.cause;
    check('finding #2571 classification: dead companion (100001 dee)',
      causes['100001:dee'] === 'dead', JSON.stringify(causes));
    check('finding #2571 classification: different-expedition companion (100002 eli, hal2 quad d101)',
      causes['100002:eli'] === 'different-expedition', JSON.stringify(causes));
    check('finding #2571 classification: expedition-ended companion (100003 eli, census holderExped false d102)',
      causes['100003:eli'] === 'expedition-ended', JSON.stringify(causes));
    check('finding #2571 classification: in-plan-party-but-unsensed, different dawn tiles (100004 eli)',
      causes['100004:eli'] === 'in-plan-party-but-unsensed/different-tile', JSON.stringify(causes));
    check('finding #2571 classification: in-plan-party-but-unsensed, same dawn tile (100005 eli)',
      causes['100005:eli'] === 'in-plan-party-but-unsensed/same-tile', JSON.stringify(causes));
    check('finding #2571 classification: in-plan-party-but-unsensed, no dawn rows (100006 eli)',
      causes['100006:eli'] === 'in-plan-party-but-unsensed/no-dawn-data', JSON.stringify(causes));
    check('finding #2571 classification: trim-unproven when the plan party shrank with no recorded cause (100007 eli)',
      causes['100007:eli'] === 'trim-unproven', JSON.stringify(causes));
    check('finding #2571 classification: 7 sense misses, 0 unclassified',
      sm7.misses.length === 7 && !Object.keys(sm7.byCause).some(function (k) { return k.indexOf('unclassified') === 0; }), JSON.stringify(sm7.byCause));
    // Cap-2 legs: the same in-plan-party miss reads 'cap-2-cut'
    // when the sensed list already holds 2 launch companions.
    const sm7c = senseMisses(dir7, true);
    const causesC = {};
    for (const m of sm7c.misses) for (const cl of m.classifications) causesC[m.seed + ':' + cl.detail.companion] = cl.cause;
    check('finding #2571 classification: cap-2 leg relabels the in-plan-party miss as cap-2-cut (100004 eli)',
      causesC['100004:eli'] === 'cap-2-cut' && causesC['100002:eli'] === 'different-expedition' && causesC['100001:dee'] === 'dead', JSON.stringify(causesC));
    try { fs.rmSync(tmp7, { recursive: true, force: true }); } catch (e) {}
  })();
  console.log('analyze-allyslot3-b --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let ctlDir = null, armDir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ctl') ctlDir = args[++i];
    else if (args[i] === '--arm') armDir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!ctlDir || !armDir) { console.error('usage: analyze-allyslot3-b.js --ctl DIR --arm DIR [--out FILE] | --selftest'); process.exit(2); }
  const ctl = summarizeLeg(ctlDir);
  const arm = summarizeLeg(armDir);
  const ctlF4 = field4Table(ctlDir);
  const armF4 = field4Table(armDir);
  const j = judge(ctl, arm, ctlF4, armF4);
  const ctlShares = size4Shares(ctlDir);
  const armShares = size4Shares(armDir);
  const ctlMisses = senseMisses(ctlDir, true);
  const armMisses = senseMisses(armDir, false);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, ctl: ctl, arm: arm,
    field4: { ctl: ctlF4, arm: armF4 },
    size4Shares: { ctl: ctlShares, arm: armShares },
    senseMisses: { ctl: ctlMisses, arm: armMisses } };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars,
    ctl: { launches: ctl.launches, trioLaunches: ctl.trioLaunches, quadLaunches: ctl.quadLaunches, partyTrios: ctl.partyTrios, partyQuads: ctl.partyQuads, wall: ctl.wall },
    arm: { launches: arm.launches, trioLaunches: arm.trioLaunches, quadLaunches: arm.quadLaunches, partyTrios: arm.partyTrios, partyQuads: arm.partyQuads, wall: arm.wall },
    field4: { ctl: ctlF4, arm: armF4 },
    size4Shares: { ctl: ctlShares, arm: armShares },
    senseMisses: { ctl: ctlMisses, arm: armMisses } }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { perSeed: perSeed, wall: wall, judge: judge, summarizeLeg: summarizeLeg, size4Shares: size4Shares, field4Table: field4Table,
  quadLaunches: quadLaunches, correctedJoin: correctedJoin, launchCompanions: launchCompanions, senseIsFull: senseIsFull,
  senseMisses: senseMisses, classifyMissing: classifyMissing, gateRowFor: gateRowFor, dawnState: dawnState };
