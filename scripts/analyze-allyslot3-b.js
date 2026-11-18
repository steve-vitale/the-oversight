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

// Size-4 damage share, REPORTED not binding (prereg): no binding
// threshold is justifiable from the #2544 numbers (typical trio
// ~50 dmg/round vs ~1,200 HP; the field carrier added ~118 damage
// on a strong base — a different lever, finding #2552, not built
// here). Computed from the per-seed files' v4encounters with the
// partysize-b launch join: an encounter belongs to a quad launch
// when its day falls within [launch day, launch day + 21], its
// monster matches the launch target (or the target is null), and
// its fighter (or ally) is in the launch party. Share = mDealt /
// mHpStart (vKill = 1.0 by definition); the recorder repair
// supplies mHpStart on fought rows (no-contact evades are correct
// nulls and excluded).
function size4Shares(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const shares = [];
  let fought = 0, noHp = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    const quads = [];
    for (const r of (d.v4departs || [])) {
      if (r.result !== 'launch' || (r.targetWave | 0) < 4) continue;
      const size = r.partySize != null ? r.partySize : ((r.party || []).length + 1);
      if (size >= 4) quads.push({ day: r.day, vid: r.vid, target: r.target || null, party: [r.vid].concat(r.party || []) });
    }
    for (const e of (d.v4encounters || [])) {
      if (e.origin !== 'expedition') continue;
      if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue; // no-contact evade: no monster spawned
      let launched = null;
      for (const l of quads) {
        if (e.day < l.day || e.day > l.day + 21) continue;
        if (l.target && e.mid !== l.target) continue;
        if (e.vid === l.vid || l.party.indexOf(e.vid) !== -1) { launched = l; break; }
        if (e.allyVid && (e.allyVid === l.vid || l.party.indexOf(e.allyVid) !== -1)) { launched = l; break; }
      }
      if (!launched) continue;
      fought++;
      if (e.outcome === 'vKill') { shares.push(1.0); continue; }
      if (e.mHpStart == null) { noHp++; continue; }
      shares.push((e.mDealt || 0) / e.mHpStart);
    }
  }
  return { n: shares.length, fought: fought, noHp: noHp,
    mean: shares.length ? shares.reduce(function (a, b) { return a + b; }, 0) / shares.length : null };
}

// Field-4 table: per-seed launched-quad-meeting join (same
// window/target/party join as size4Shares). A meeting is a fought
// expedition encounter row joined to a quad launch. Denominator:
// the second ally joined (rec.ally2Vid present) — the third shout
// can only fire after the second, so meetings where ally2 never
// joined cannot field a fourth member and are excluded (the raw
// field-4 rate over ALL launched quad meetings is reported
// alongside, so the exclusion stays visible). Numerator: the third
// ally also joined (rec.ally3Vid present) AND is a launch-party
// member. Sense rate (reported): the sensed allyVids list at the
// call is all 3 launch companions.
function field4Table(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let meetings = 0, denom = 0, numer = 0, senseDen = 0, senseN = 0, ally3DealtTotal = 0, deaths = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    deaths += ((d.deaths || []).length);
    const quads = [];
    for (const r of (d.v4departs || [])) {
      if (r.result !== 'launch' || (r.targetWave | 0) < 4) continue;
      const size = r.partySize != null ? r.partySize : ((r.party || []).length + 1);
      if (size >= 4) quads.push({ day: r.day, vid: r.vid, target: r.target || null, party: [r.vid].concat(r.party || []) });
    }
    let m = 0, dn = 0, nu = 0, sd = 0, sn = 0, a3d = 0;
    for (const e of (d.v4encounters || [])) {
      if (e.origin !== 'expedition') continue;
      if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue; // no-contact evade
      let launched = null;
      for (const l of quads) {
        if (e.day < l.day || e.day > l.day + 21) continue;
        if (l.target && e.mid !== l.target) continue;
        if (e.vid === l.vid || l.party.indexOf(e.vid) !== -1) { launched = l; break; }
        if (e.allyVid && (e.allyVid === l.vid || l.party.indexOf(e.allyVid) !== -1)) { launched = l; break; }
      }
      if (!launched) continue;
      m++;
      // Sense rate: the sensed list at the call is the full trio.
      const sensed = e.allyVids || [];
      if (sensed.length === 3 && sensed.every(function (v) { return launched.party.indexOf(v) !== -1; })) sn++;
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
  // field4Table join: day window [launch, launch+21], target==mid,
  // party membership, ally2 denominator, ally3-in-party numerator,
  // sense rate from the sensed list. A wrong-monster, out-of-window,
  // or bystander-ally3 meeting must not count.
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
    check('field4Table joins in-window same-target meetings only; denom=ally2-joined, numer=ally3-in-party, sense from the sensed list',
      t2.meetings === 3 && t2.denom === 3 && t2.numer === 2 && t2.senseDen === 3 && t2.senseN === 2 &&
      t2.ally3DealtTotal === 45 && t2.deaths === 2 && Math.abs(t2.rate - 2 / 3) < 1e-9, JSON.stringify(t2));
    try { fs.rmSync(tmp2, { recursive: true, force: true }); } catch (e) {}
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
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, ctl: ctl, arm: arm,
    field4: { ctl: ctlF4, arm: armF4 },
    size4Shares: { ctl: ctlShares, arm: armShares } };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars,
    ctl: { launches: ctl.launches, trioLaunches: ctl.trioLaunches, quadLaunches: ctl.quadLaunches, partyTrios: ctl.partyTrios, partyQuads: ctl.partyQuads, wall: ctl.wall },
    arm: { launches: arm.launches, trioLaunches: arm.trioLaunches, quadLaunches: arm.quadLaunches, partyTrios: arm.partyTrios, partyQuads: arm.partyQuads, wall: arm.wall },
    field4: { ctl: ctlF4, arm: armF4 },
    size4Shares: { ctl: ctlShares, arm: armShares } }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { perSeed: perSeed, wall: wall, judge: judge, summarizeLeg: summarizeLeg, size4Shares: size4Shares, field4Table: field4Table };
