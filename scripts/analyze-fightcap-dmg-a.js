// analyze-fightcap-dmg-a.js — analyzer + judge, arm sim-fightcap-dmg-a.
// CAPABILITY: does a damage-multiplier carrier (FIGHTCAPDMG=1 — the
// launched holder rages vs wave-4+ without the ability) turn launched
// parties into winners? (finding #2544.) Reuses legStats from
// analyze-fightcap-a.js (same populations, same join/presence/engaged
// filters); the JUDGE is new here — the fightcap-a judge (trio+ win
// share ≥ 0.50) does NOT apply to this arm.
//
// Primary (frozen prereg): PAIR-INCLUSIVE kill share (vKill / n).
// GO: arm pair n ≥ 10 AND arm kill share ≥ 0.25 AND ≥ 2× the control
// kill share on identical seeds (ctl 0 kills ⇒ ratio passes iff the arm
// kills > 0) AND all cost bars pass (community loss arm share ≤ ctl +
// 0.125; starvation totals AND villager-only arm ≤ ctl + 2; median
// survival arm ≥ 0.8× ctl median; instrument errors 0).
// Trio-only kill/win shares are reported beside, never substituted.
// Carrier-fire check (mechanism): meetings where the holder raged
// WITHOUT the Rage ability — log carries the "(Rage)" token while the
// holder's nearest snapshot abilities lack 'rage'. Proxy (snapshots are
// nearest-at-or-before the meeting day); the ctl leg's count is the
// noise floor and must be 0 for a clean read.
//
// Usage:
//   node scripts/analyze-fightcap-dmg-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge]
//   node scripts/analyze-fightcap-dmg-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const { legStats } = require('./analyze-fightcap-a.js');

function carrierRageMeetings(detail) {
  const hits = [];
  for (const m of (detail || [])) {
    if (!m.abilityTokens || m.abilityTokens.indexOf('Rage') === -1) continue;
    const holderAbs = (m.memberAbilities && m.memberAbilities[m.vid]) || [];
    if (holderAbs.indexOf('rage') === -1) hits.push(m);
  }
  return hits;
}

function judge(ctl, arm, ctlPair, armPair) {
  const bars = [];
  const poolOk = armPair.meetings >= 10;
  bars.push({ id: 'pool-floor-pair', pass: poolOk,
    detail: 'engaged launched-party meetings (pair-inclusive, present): arm ' + armPair.meetings + ' (floor 10); ctl ' + ctlPair.meetings });
  const ksPass = armPair.killShare != null && armPair.killShare >= 0.25;
  bars.push({ id: 'kill-share', pass: ksPass,
    detail: 'arm pair kill share ' + (armPair.killShare == null ? 'n/a' : armPair.killShare.toFixed(3)) + ' (' + armPair.kills + '/' + armPair.meetings + ') vs ctl ' + (ctlPair.killShare == null ? 'n/a' : ctlPair.killShare.toFixed(3)) + ' (' + ctlPair.kills + '/' + ctlPair.meetings + ') (bar arm>=0.25)' });
  let ratioPass = false, ratioDetail = '';
  if (ctlPair.kills === 0) {
    ratioPass = armPair.kills > 0;
    ratioDetail = 'ctl kills 0 — ratio bar passes iff arm kills > 0 (arm kills ' + armPair.kills + ')';
  } else {
    ratioPass = armPair.killShare != null && ctlPair.killShare != null && armPair.killShare >= 2 * ctlPair.killShare;
    ratioDetail = 'arm kill share ' + (armPair.killShare == null ? 'n/a' : armPair.killShare.toFixed(3)) + ' vs 2x ctl ' + (ctlPair.killShare == null ? 'n/a' : (2 * ctlPair.killShare).toFixed(3));
  }
  bars.push({ id: 'kill-share-ratio', pass: ratioPass, detail: ratioDetail });
  const commPass = (armPair.communityLost / (armPair.n || 8)) <= (ctlPair.communityLost / (ctlPair.n || 8)) + 0.125 + 1e-9;
  bars.push({ id: 'cost-community-loss', pass: commPass,
    detail: 'community loss arm ' + armPair.communityLost + '/' + armPair.n + ' vs ctl ' + ctlPair.communityLost + '/' + ctlPair.n + ' (bar arm share <= ctl share + 0.125)' });
  const starvPass = armPair.starvation <= ctlPair.starvation + 2 && armPair.starvationVillager <= ctlPair.starvationVillager + 2;
  bars.push({ id: 'cost-starvation', pass: starvPass,
    detail: 'starvation totals arm ' + armPair.starvation + ' vs ctl ' + ctlPair.starvation + '; villager arm ' + armPair.starvationVillager + ' vs ctl ' + ctlPair.starvationVillager + ' (bar arm<=ctl+2 both)' });
  const medPass = ctlPair.medianDays == null || armPair.medianDays == null || armPair.medianDays >= 0.8 * ctlPair.medianDays;
  bars.push({ id: 'cost-median', pass: medPass,
    detail: 'median survival arm ' + armPair.medianDays + 'd vs ctl ' + ctlPair.medianDays + 'd (bar arm>=0.8x ctl)' });
  const errPass = (armPair.errors === 0) && (ctlPair.errors === 0);
  bars.push({ id: 'instrument-errors', pass: errPass,
    detail: 'instrument errors arm ' + armPair.errors + ' / ctl ' + ctlPair.errors + ' (bar 0)' });
  const carrier = carrierRageMeetings(armPair.meetingsDetail);
  const carrierCtl = carrierRageMeetings(ctlPair.meetingsDetail);
  bars.push({ id: 'carrier-fires', pass: carrier.length > 0,
    detail: 'carrier-rage meetings (holder raged without the Rage ability, proxy): arm ' + carrier.length + ', ctl ' + carrierCtl.length + ' (noise floor; arm must be > 0)' });
  let verdict = 'NO-GO';
  let kind = '';
  if (!poolOk) { verdict = 'NO-GO'; kind = 'THIN-POOL'; }
  else if (bars.every(function (b) { return b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars,
    carrierRageArm: carrier.map(function (m) { return { seed: m.seed, day: m.day, vid: m.vid, mid: m.mid, outcome: m.outcome, rounds: m.rounds, mDealt: m.mDealt }; }),
    carrierRageCtl: carrierCtl.map(function (m) { return { seed: m.seed, day: m.day, vid: m.vid, mid: m.mid, outcome: m.outcome, rounds: m.rounds, mDealt: m.mDealt }; }) };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'launchpartyOn', 'fightally2On',
    'meetings', 'wins', 'kills', 'losses', 'vDie', 'vFlee', 'mFlee',
    'winShare', 'killShare', 'funnel', 'byOutcome', 'gateXOutcome',
    'gateAvoidShare', 'gateNullShare', 'gateSeekShare',
    'lossGateNull', 'lossGateAvoid', 'lossGateSeek',
    'monsterByOutcome', 'dmgShareMean', 'dmgShareByOutcome',
    'roundsMean', 'vTakenMean',
    'starvation', 'starvationVillager', 'medianDays', 'communityLost',
    'national', 'seedWins', 'wave4', 'wave5', 'scaleRanks']) o[k] = st[k];
  if (st.fightcapdmgOn) o.fightcapdmgOn = st.fightcapdmgOn;
  return o;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-dmg-analyze-'));
  function mkLeg(dir, o) {
    fs.mkdirSync(dir);
    const seed = Object.assign({ seed: 1, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [], launchpartyOn: true, fightally2On: true,
      fightcapdmgOn: true, deaths: [], daily: [{ day: 1, roster: [{ vid: 'h1', name: 'Holly One' }, { vid: 'c1', name: 'Cora A' }, { vid: 'c2', name: 'Cid B' }] }],
      samples: { villagers: [[1, [{ vid: 'h1', abilities: [] }, { vid: 'c1', abilities: [] }, { vid: 'c2', abilities: [] }]]] },
      v4departs: [], v4gates: [], v4encounters: [] }, o);
    fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed));
  }
  function pairMeeting(day, outcome, opts) {
    opts = opts || {};
    return { day: day, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition',
      allyVids: ['c1'], allyVid: 'c1', ally2Vid: null, outcome: outcome, rounds: opts.rounds || 5,
      mDealt: opts.mDealt != null ? opts.mDealt : 500, mHpStart: 1000, vTaken: 100,
      log: opts.log || [] };
  }
  function gate(day, planParty) {
    return { day: day, vid: 'h1', mid: 'audit', planParty: planParty || ['c1'], sensed: ['h1', 'c1'],
      result: 'null', reason: null, allArmed: true, allArmored: true,
      gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 } } };
  }
  function mk(o, nKills, nTotal) {
    // Build a leg with nTotal pair meetings, nKills of them vKill.
    const gates = [], encs = [];
    for (let i = 0; i < nTotal; i++) {
      const day = 20 + i;
      gates.push(gate(day));
      const kill = i < nKills;
      encs.push(pairMeeting(day, kill ? 'vKill' : 'vFlee',
        { log: kill ? ['R1: Holly\'s eyes go red. Next 3 strikes hit twice as hard. (Rage)'] : [] }));
    }
    return Object.assign({ v4gates: gates, v4encounters: encs }, o || {});
  }
  const ctlDir = path.join(tmp, 'ctl'), armDir = path.join(tmp, 'arm');
  // GO shape: arm 12 meetings, 4 kills (0.333 ≥ 0.25), ctl 10 meetings 0 kills.
  mkLeg(ctlDir, mk({ fightcapdmgOn: false }, 0, 10));
  mkLeg(armDir, mk({}, 4, 12));
  const ctl = legStats(ctlDir), arm = legStats(armDir);
  const ctlPair = legStats(ctlDir, { minPlanParty: 1 });
  const armPair = legStats(armDir, { minPlanParty: 1 });
  check('pair pool sizes (arm 12, ctl 10)', armPair.meetings === 12 && ctlPair.meetings === 10, JSON.stringify({ a: armPair.meetings, c: ctlPair.meetings }));
  check('pair kill shares (arm 1/3, ctl 0)', Math.abs(armPair.killShare - 1 / 3) < 1e-9 && ctlPair.killShare === 0, JSON.stringify({ a: armPair.killShare, c: ctlPair.killShare }));
  let j = judge(ctl, arm, ctlPair, armPair);
  check('judge GO shape passes', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  check('carrier-fire detected on arm (4, holder has no rage)', j.carrierRageArm.length === 4, JSON.stringify(j.carrierRageArm));
  check('carrier-fire zero on ctl', j.carrierRageCtl.length === 0, JSON.stringify(j.carrierRageCtl));
  // NO-GO on kill share: arm 2/12 = 0.167 < 0.25.
  const armDir2 = path.join(tmp, 'arm2');
  mkLeg(armDir2, mk({}, 2, 12));
  const armPair2 = legStats(armDir2, { minPlanParty: 1 });
  const arm2 = legStats(armDir2);
  j = judge(ctl, arm2, ctlPair, armPair2);
  check('judge NO-GO when kill share under 0.25', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  // NO-GO on ratio: ctl kills 2/10 (0.2), arm kills 3/12 (0.25 ≥ 0.25 but < 2x ctl).
  const ctlDir3 = path.join(tmp, 'ctl3');
  mkLeg(ctlDir3, mk({ fightcapdmgOn: false }, 2, 10));
  const ctlPair3 = legStats(ctlDir3, { minPlanParty: 1 });
  const ctl3 = legStats(ctlDir3);
  const armDir3 = path.join(tmp, 'arm3');
  mkLeg(armDir3, mk({}, 3, 12));
  const armPair3 = legStats(armDir3, { minPlanParty: 1 });
  const arm3 = legStats(armDir3);
  j = judge(ctl3, arm3, ctlPair3, armPair3);
  check('judge NO-GO when kill share under 2x ctl', j.verdict === 'NO-GO' && j.bars[1].pass && !j.bars[2].pass, JSON.stringify(j.bars));
  // NO-GO thin pool: arm 9 meetings.
  const armDir4 = path.join(tmp, 'arm4');
  mkLeg(armDir4, mk({}, 4, 9));
  const armPair4 = legStats(armDir4, { minPlanParty: 1 });
  const arm4 = legStats(armDir4);
  j = judge(ctl, arm4, ctlPair, armPair4);
  check('judge NO-GO thin pool below floor', j.verdict === 'NO-GO' && j.kind === 'THIN-POOL' && !j.bars[0].pass, JSON.stringify(j));
  // NO-GO on cost: arm starvation breaches ctl+2.
  const armDir5 = path.join(tmp, 'arm5');
  mkLeg(armDir5, mk({ deaths: [{ day: 5, kind: 'starvation', who: 'x', cause: 'starvation', player: false }, { day: 6, kind: 'starvation', who: 'y', cause: 'starvation', player: false }, { day: 7, kind: 'starvation', who: 'z', cause: 'starvation', player: false }] }, 4, 12));
  const armPair5 = legStats(armDir5, { minPlanParty: 1 });
  const arm5 = legStats(armDir5);
  j = judge(ctl, arm5, ctlPair, armPair5);
  check('judge NO-GO when starvation breaches ctl+2', j.verdict === 'NO-GO' && !j.bars[4].pass, JSON.stringify(j.bars));
  // Carrier-fire proxy: holder WITH rage in the snapshot is NOT a carrier fire.
  const armDir6 = path.join(tmp, 'arm6');
  mkLeg(armDir6, mk({ samples: { villagers: [[1, [{ vid: 'h1', abilities: ['rage'] }, { vid: 'c1', abilities: [] }]]] } }, 4, 12));
  const armPair6 = legStats(armDir6, { minPlanParty: 1 });
  const arm6 = legStats(armDir6);
  j = judge(ctl, arm6, ctlPair, armPair6);
  check('holder with Rage ability is not counted as carrier fire', j.carrierRageArm.length === 0, JSON.stringify(j.carrierRageArm));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-fightcap-dmg-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let ctlDir = null, armDir = null, outFile = null;
  const noJudge = args.indexOf('--no-judge') !== -1;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ctl') ctlDir = args[++i];
    else if (args[i] === '--arm') armDir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!ctlDir || !armDir) { console.error('usage: analyze-fightcap-dmg-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
  const ctl = legStats(ctlDir);
  const arm = legStats(armDir);
  const ctlPair = legStats(ctlDir, { minPlanParty: 1 });
  const armPair = legStats(armDir, { minPlanParty: 1 });
  const j = noJudge ? null : judge(ctl, arm, ctlPair, armPair);
  const result = { verdict: j ? j.verdict : null, kind: j ? j.kind : null, bars: j ? j.bars : null,
    carrierRageArm: j ? j.carrierRageArm : carrierRageMeetings(armPair.meetingsDetail),
    carrierRageCtl: j ? j.carrierRageCtl : carrierRageMeetings(ctlPair.meetingsDetail),
    ctl: summarize(ctl), arm: summarize(arm),
    ctlPair: summarize(ctlPair), armPair: summarize(armPair),
    ctlMeetings: ctl.meetingsDetail, armMeetings: arm.meetingsDetail,
    ctlPairMeetings: ctlPair.meetingsDetail, armPairMeetings: armPair.meetingsDetail };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars,
    carrierRageArm: result.carrierRageArm, carrierRageCtl: result.carrierRageCtl,
    ctl: summarize(ctl), arm: summarize(arm), ctlPair: summarize(ctlPair), armPair: summarize(armPair) }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { judge: judge, carrierRageMeetings: carrierRageMeetings };
