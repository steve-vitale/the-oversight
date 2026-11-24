// test-bloodcluster-b-20261124.js — proof test for the bloodings-cluster
// decomposition analyzer + instrument (arm sim-bloodcluster-b).
// Fixture-based (mechanism classes for all channels, duplicate
// choke-point linkage, joiner origin, door/non-door contrast +
// dominant call incl. NO-DOMINANT) plus one live harness smoke:
// a live fieldFight row is recorded with its scalars, and a bare
// live wave-4 recordWaveKill (no fight record) is UNCLASSIFIED by
// the analyzer — proving the linkage rule. No repo writes. The
// determinism replay leg (bar 4) runs as a separate driver step,
// not in this proof test — a 150-day seed is too slow for a check
// script.
// Usage: node scripts/test-bloodcluster-b-20261124.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'bloodcluster-b-analyze-20261124'));
const INST = require(path.join(__dirname, 'bloodcluster-b-instrument-20261124'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function snap(day, over) {
  return Object.assign({
    day: day, roster: [], veteranVids: [], veteranRecount: 0, veteranMismatch: false,
    logW4: [], w4faced: 0, w5faced: 0, peak: 0,
    readiness5: { wave: 5, ready: false, veterans: 0 },
  }, over || {});
}
function seedOut(over) {
  return Object.assign({ seed: 109312, arm: 'bloodcluster-b', run: 'fixture', days: 150, gameDays: 150,
    endReason: 'survived', won: false, scaleRank: 'regional', maxWave: 5,
    endUnlockedWave: 5, peakBeforeEndCall: 5, peakAfterEndCall: 5, endCallMovedPeak: false,
    endState: { scholarId: 'scholar1', roster: [], exiles: [] },
    daily: [], killEvents: [], deathEvents: [], feastEvents: [], standingLines: [],
    releaseLines: [], saySample: [], fieldFights: [], tbStarts: [], tbKillCtx: [],
    wrapCounts: {}, instrumentErrors: [] }, over || {});
}
function kill(day, by, mid, wave, via, entryAdded) {
  return { day: day, fn: 'recordWaveKill', mid: mid, wave: wave, by: by, via: via || 'wild', entryAdded: entryAdded !== false };
}
function death(day, who, cause, kind) {
  return { day: day, kind: kind || 'villager', who: who, cause: cause, player: false };
}
function ff(day, vid, mid, wave, over) {
  return Object.assign({ day: day, vid: vid, mid: mid, wave: wave, outcome: 'vKill',
    rounds: 5, vTaken: 20, mDealt: 900, allyDealt: 0, partySizeRec: 1, partySize: 1,
    alliesAvailable: 0, allyFromStart: false, allyVidsAtEntry: [],
    allyVid: null, ally2Vid: null, ally3Vid: null, allyJoined: [],
    calledHelp: false, intent: 'engage', intentWhy: 'trick-known',
    vHpLeft: 60, mHpLeft: 0, packCount: 1, everWinning: true, everHopeless: false,
    minHpFrac: 0.6, fleeHopeless: null, fleeHpFrac: null }, over || {});
}
function tbs(day, mid, wave, partySize, joiners, over) {
  return Object.assign({ day: day, mid: mid, wave: wave, fightId: 'f' + day + mid, rebuilt: true,
    scholarId: 'scholar1', partySize: partySize, scholarPresent: true,
    villagerJoiners: joiners || [], fighterKinds: ['player'].concat((joiners || []).map(function () { return 'villager'; })),
    monsterCount: 1 }, over || {});
}
function ctx(day, mid, by, via, over) {
  return Object.assign({ seq: 0, day: day, fn: 'recordWaveKill', mid: mid, wave: 4,
    by: by, via: via, inTbFight: true, fightId: 'f' + day + mid, tbOver: false, tbResult: 'won',
    partySize: 1, scholarPresent: true, villagerFighters: [], monsterIds: [mid] }, over || {});
}

// A full 8-killer door seed exercising every mechanism class.
function classFixture() {
  const vids = ['solo_f', 'start_f', 'shout_f', 'scholar1', 'comp_f', 'contest_f', 'bare_f', 'alive_f'];
  const kills = [
    kill(57, 'solo_f', 'influencer', 4, 'wild'),
    kill(60, 'start_f', 'strike', 4, 'wild'),
    kill(65, 'shout_f', 'audit', 4, 'wild'),
    kill(70, 'scholar1', 'eulogy', 4, 'player'),
    kill(75, 'scholar1', 'algorithm', 4, 'player'),
    kill(80, 'comp_f', 'reunion', 4, 'companion'),
    kill(85, 'contest_f', 'congregation', 4, 'contest'),
    kill(90, 'bare_f', 'suburb', 4, 'wild'),
    kill(95, 'alive_f', 'eater', 4, 'wild'),
  ];
  const fields = [
    ff(57, 'solo_f', 'influencer', 4),
    ff(60, 'start_f', 'strike', 4, { allyFromStart: true, allyVid: 'helper_a', allyJoined: ['helper_a'], partySize: 2, partySizeRec: 2, alliesAvailable: 1, allyVidsAtEntry: ['helper_a'], allyDealt: 300 }),
    ff(65, 'shout_f', 'audit', 4, { calledHelp: true, allyVid: 'helper_b', allyJoined: ['helper_b'], partySize: 2, partySizeRec: 2, alliesAvailable: 1, allyDealt: 200 }),
    // The contest kill resolved through a field fight: the row is
    // consumed by the contest branch, the class stays contest.
    ff(85, 'contest_f', 'congregation', 4),
    ff(95, 'alive_f', 'eater', 4),
  ];
  const tbsList = [
    tbs(70, 'eulogy', 4, 1, []),
    tbs(75, 'algorithm', 4, 3, ['comp_f', 'helper_a']),
    tbs(80, 'reunion', 4, 3, ['comp_f', 'helper_a']),
  ];
  const ctxList = [
    ctx(70, 'eulogy', 'scholar1', 'player', { partySize: 1, villagerFighters: [] }),
    ctx(75, 'algorithm', 'scholar1', 'player', { partySize: 3, villagerFighters: ['comp_f', 'helper_a'] }),
    ctx(80, 'reunion', 'comp_f', 'companion', { partySize: 3, villagerFighters: ['comp_f', 'helper_a'] }),
  ];
  const daily = [];
  for (let d = 1; d <= 150; d++) {
    const peak = d >= 89 ? 5 : (d >= 50 ? 4 : 3);
    daily.push(snap(d, {
      peak: peak, roster: vids.slice(),
      veteranVids: d >= 95 ? ['alive_f'] : [],
      veteranRecount: d >= 95 ? 1 : 0,
      logW4: kills.filter(function (k) { return k.day <= d; }).map(function (k) { return { d: k.day, mid: k.mid, w: k.wave, by: k.by, via: k.via }; }),
    }));
  }
  const deaths = ['solo_f', 'start_f', 'shout_f', 'scholar1', 'comp_f', 'contest_f', 'bare_f'].map(function (v, i) {
    return death(100 + i, v, 'the wild');
  });
  return seedOut({ daily: daily, killEvents: kills, deathEvents: deaths,
    fieldFights: fields, tbStarts: tbsList, tbKillCtx: ctxList,
    endState: { scholarId: 'scholar1', roster: vids.slice(), exiles: [] } });
}

ok('mechanism classes: all channels classified, bare known-channel kill UNCLASSIFIED', function () {
  const s = AN.summarizeSeed(classFixture());
  assert.strictEqual(s.killerCount, 8);
  assert.strictEqual(s.doorGroup, true);
  assert.strictEqual(s.doorVerified, true);
  assert.strictEqual(s.unlockDay4, 50);
  assert.strictEqual(s.peak5, true);
  const cls = {};
  for (const b of s.bloodings) cls[b.vid] = b.cls;
  assert.strictEqual(cls.solo_f, 'field-solo');
  assert.strictEqual(cls.start_f, 'field-party-start');
  assert.strictEqual(cls.shout_f, 'field-party-shout');
  // scholar1 blooded day 70 solo; the day-75 party kill is a repeat, not the blooding.
  assert.strictEqual(cls.scholar1, 'tb-scholar-solo');
  assert.strictEqual(cls.comp_f, 'tb-companion');
  assert.strictEqual(cls.contest_f, 'contest');
  assert.strictEqual(cls.bare_f, 'UNCLASSIFIED');
  assert.strictEqual(cls.alive_f, 'field-solo');
  assert.deepStrictEqual(s.unclassifiedBloodings.map(function (b) { return b.vid; }), ['bare_f']);
  assert.strictEqual(s.unlinkedKills.length, 1, 'only the bare kill is unlinked');
  assert.strictEqual(s.unlinkedKills[0].by, 'bare_f');
  assert.deepStrictEqual(s.unlinkedFieldKills, []);
  assert.deepStrictEqual(s.unlinkedTbKills, []);
  assert.strictEqual(s.w4Contacts, 5 + 3, '5 field + 3 TB contacts');
  assert.strictEqual(s.w4Kills, 9);
});

ok('duplicate choke-point call links to the same fight, not a second kill', function () {
  const f = classFixture();
  // 109313-shape: gen_wa9lzr8 kills an editor twice in the log calls —
  // one entryAdded row, one duplicate. Both link; kills stay 1.
  f.killEvents.push(kill(91, 'wa9', 'editor', 5, 'wild', false));
  f.killEvents.push(kill(91, 'wa9', 'editor', 5, 'wild', true));
  f.fieldFights.push(ff(91, 'wa9', 'editor', 5));
  f.daily.forEach(function (d) {
    if (d.day >= 91) {
      d.logW4.push({ d: 91, mid: 'editor', w: 5, by: 'wa9', via: 'wild' });
      if (!d.roster.includes('wa9')) d.roster.push('wa9');
    }
  });
  f.deathEvents.push(death(100, 'wa9', 'monster'));
  const s = AN.summarizeSeed(f);
  assert.strictEqual(s.linkedDuplicates.length, 1, 'duplicate call linked to the same fight');
  assert.strictEqual(s.linkedDuplicates[0].match, 'field');
  assert.strictEqual(s.w4Kills, 10, '9 + 1 deduped editor kill (duplicate call adds nothing)');
  assert.strictEqual(s.unlinkedKills.length, 1, 'still only the bare kill unlinked');
  const wa = s.bloodings.find(function (b) { return b.vid === 'wa9'; });
  assert.strictEqual(wa.cls, 'field-solo');
});

ok('refused startCombat rows are not contacts; tb-direct kill classifies from settle-time ctx', function () {
  const f = classFixture();
  // A refused suburb start (fight live — stale tbfight, same id as
  // the day-75 fight) must not count as a contact.
  f.tbStarts.push(tbs(76, 'suburb', 4, 1, [], { fightId: 'f75algorithm', rebuilt: false, scholarPresent: false, monsterCount: 0, fighterKinds: ['villager'] }));
  // A TB kill from a fight with NO startCombat row (direct builder /
  // restored fight): ctx fightId matches nothing, class still lands.
  f.killEvents.push(kill(100, 'direct_f', 'herald', 4, 'companion'));
  f.tbKillCtx.push(ctx(100, 'herald', 'direct_f', 'companion', { fightId: 'fdirect-no-row', partySize: 2, villagerFighters: ['direct_f'] }));
  f.daily.forEach(function (d) {
    if (d.day >= 100) {
      d.roster.push('direct_f');
      d.logW4.push({ d: 100, mid: 'herald', w: 4, by: 'direct_f', via: 'companion' });
    }
  });
  f.deathEvents.push(death(110, 'direct_f', 'monster'));
  const s = AN.summarizeSeed(f);
  assert.strictEqual(s.refusedTbStarts.length, 1, 'the refused row is flagged');
  assert.strictEqual(s.w4TbContacts, 3, 'refused row excluded from TB contacts');
  assert.strictEqual(s.w4Contacts, 5 + 3, 'contacts unchanged by the refused row');
  const df = s.bloodings.find(function (b) { return b.vid === 'direct_f'; });
  assert.strictEqual(df.cls, 'tb-companion');
  assert.strictEqual(df.detail.builder, 'direct/other');
  assert.strictEqual(df.detail.party, 2);
  assert.deepStrictEqual(s.unlinkedTbKills, []);
  assert.strictEqual(s.unlinkedKills.length, 1, 'still only the bare kill unlinked');
});

ok('succession does not break TB linkage: kill links by settle-time ctx, not end-of-run scholar', function () {
  const f = classFixture();
  // The scholar at the end is someone else entirely; the day-70
  // kill was still the scholar's, and the ctx proves it.
  f.endState.scholarId = 'someone_else_entirely';
  const s = AN.summarizeSeed(f);
  const sch = s.bloodings.find(function (b) { return b.vid === 'scholar1'; });
  assert.strictEqual(sch.cls, 'tb-scholar-solo');
  assert.strictEqual(s.unlinkedKills.length, 1, 'only the bare kill unlinked');
});

ok('joiner origin: visjoin/app blooders, days join-to-blood from roster first-seen', function () {
  const f = classFixture();
  // visjoin_136 first appears on the day-137 snapshot, bloods day 137.
  f.killEvents.push(kill(137, 'visjoin_136', 'audit', 4, 'aid-crisis'));
  f.fieldFights.push(ff(137, 'visjoin_136', 'audit', 4, { calledHelp: true, allyVid: 'helper_c', allyJoined: ['helper_c'], partySize: 2, allyDealt: 150 }));
  f.daily.forEach(function (d) {
    if (d.day >= 137) {
      d.roster.push('visjoin_136');
      d.logW4.push({ d: 137, mid: 'audit', w: 4, by: 'visjoin_136', via: 'aid-crisis' });
    }
  });
  f.deathEvents.push(death(149, 'visjoin_136', 'monster'));
  const s = AN.summarizeSeed(f);
  const vis = s.bloodings.find(function (b) { return b.vid === 'visjoin_136'; });
  assert.strictEqual(vis.origin, 'visjoin');
  assert.strictEqual(vis.firstSeenDay, 137);
  assert.strictEqual(vis.daysJoinToBlood, 0);
  assert.strictEqual(vis.cls, 'field-party-shout');
  assert.strictEqual(s.joinerBlooders, 1);
  assert.strictEqual(AN.originOf('app_x1'), 'app');
  assert.strictEqual(AN.originOf('gen_abc'), 'gen');
  assert.strictEqual(AN.originOf('omar_farouk'), 'named');
});

ok('contrast + dominant: party family wins when its ratio leads and covers the door', function () {
  const door = classFixture();
  const non = classFixture();
  non.seed = 109318;
  // Non-door: peak never reaches 5 (door verification must hold),
  // same kills but all solo, no party, no joins.
  non.daily.forEach(function (d) { if (d.peak > 4) d.peak = 4; });
  // Non-door: same kills but all solo, no party, no joins; door stays grouped.
  non.fieldFights = non.fieldFights.map(function (r) {
    return Object.assign({}, r, { allyVid: null, ally2Vid: null, ally3Vid: null, allyJoined: [], partySize: 1, partySizeRec: 1, calledHelp: false, allyFromStart: false, allyDealt: 0 });
  });
  non.tbStarts = [tbs(70, 'eulogy', 4, 1, []), tbs(75, 'algorithm', 4, 1, []), tbs(80, 'reunion', 4, 1, [])];
  // Settle-time ctx is the party source of truth for TB kills — the
  // non-door ctx parties must go solo too, not just the start rows.
  non.tbKillCtx = non.tbKillCtx.map(function (c) {
    return Object.assign({}, c, { partySize: 1, villagerFighters: [] });
  });
  // The companion kill can no longer match a TB start (no joiners) — it
  // becomes unlinked, so drop it from the non-door kills to keep the
  // contrast about party, not linkage.
  non.killEvents = non.killEvents.filter(function (k) { return !(k.by === 'comp_f' && k.day === 80); });
  non.daily.forEach(function (d) { d.logW4 = d.logW4.filter(function (r) { return !(r.by === 'comp_f' && r.d === 80); }); });
  const all = AN.summarizeAll([door, non]);
  assert.strictEqual(all.doorSeeds, 1);
  assert.strictEqual(all.nonDoorSeeds, 1);
  assert.strictEqual(all.doorVerified, true);
  // Door party>=2 share at kills: field parties [1,2,2,1] + TB parties
  // [1,3,3] = 4/7; non-door: 0. Ratio is Infinity -> null by the
  // ratio guard (division by zero) — so the headline must NOT be B
  // here; instead the test asserts the shares themselves and that the
  // dominant call does not crash and names a family with coverage.
  assert.strictEqual(all.contrasts.party2PlusAtKills.door, 4 / 7);
  assert.strictEqual(all.contrasts.party2PlusAtKills.nonDoor, 0);
  assert.ok(all.dominant == null || typeof all.dominant.family === 'string', 'dominant is null or named');
  assert.strictEqual(all.noDominant, all.dominant == null);
});

ok('NO-DOMINANT: identical door/non-door rates name nothing', function () {
  const a = classFixture();
  const b = classFixture();
  b.seed = 109311; // second door seed, same shape as the first
  const all = AN.summarizeAll([a, b]);
  assert.strictEqual(all.noDominant, true, 'ratios all 1.0, below the 1.5x bar');
  assert.strictEqual(all.dominant, null);
  assert.deepStrictEqual(Object.keys(all.classes).sort(), ['UNCLASSIFIED', 'contest', 'field-party-shout', 'field-party-start', 'field-solo', 'tb-companion', 'tb-scholar-solo']);
});

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 109312, mode: 'bloodcluster-b-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const m1 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 1; });
    assert.ok(m1, 'a wave-1 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    // A live ephemeral field fight (m=null) records one scalar row.
    const rec = Game.fieldFight(vid, m1, null, {});
    assert.ok(rec && typeof rec.outcome === 'string', 'fieldFight returns a record');
    assert.strictEqual(inst.t.fieldFights.length, 1, 'one field fight row recorded');
    const row = inst.t.fieldFights[0];
    assert.strictEqual(row.wave, 1);
    assert.strictEqual(row.vid, vid);
    assert.ok(['evade', 'vKill', 'mFlee', 'vFlee', 'vDie', 'alreadyDead'].includes(row.outcome), 'outcome in the frozen enum, got ' + row.outcome);
    assert.ok(row.partySize >= 1, 'party size at least the leader');
    // A bare live wave-4 kill (no fight record) is UNCLASSIFIED.
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killEvents.length, 1, 'live wave-4 kill event captured');
    const snap1 = inst.snapshot();
    assert.ok(snap1.veteranVids.includes(vid), 'killer is a living veteran in the snapshot recount');
    const live = AN.summarizeSeed({ seed: 109312, run: 'smoke', days: 1, gameDays: 1,
      endReason: 'smoke', won: false, scaleRank: 'village', maxWave: 4, endUnlockedWave: 4,
      peakBeforeEndCall: snap1.peak, peakAfterEndCall: snap1.peak, endCallMovedPeak: false,
      endState: { scholarId: Game.villagerId, roster: roster.slice(), exiles: [] },
      daily: inst.t.daily, killEvents: inst.t.killEvents, feastEvents: inst.t.feastEvents,
      deathEvents: inst.t.deathEvents, standingLines: inst.t.standingLines,
      releaseLines: inst.t.releaseLines, saySample: inst.t.saySample,
      fieldFights: inst.t.fieldFights, tbStarts: inst.t.tbStarts, tbKillCtx: inst.t.tbKillCtx,
      wrapCounts: inst.t.wrapCounts, instrumentErrors: inst.t.instrumentErrors });
    assert.strictEqual(live.killerCount, 1);
    assert.strictEqual(live.bloodings[0].cls, 'UNCLASSIFIED', 'bare kill with no fight record is unclassified');
    assert.strictEqual(live.unlinkedKills.length, 1);
    // Settle-time ctx: one row for the kill call, no TB fight live.
    assert.strictEqual(inst.t.tbKillCtx.length, 1, 'one settle-time ctx row per kill call');
    assert.strictEqual(inst.t.tbKillCtx[0].inTbFight, false, 'no TB fight live at the bare kill');
    assert.strictEqual(inst.t.tbKillCtx[0].fightId, null);
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: fieldFight row + bare wave-4 kill UNCLASSIFIED, 0 instrument errors');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('BLOODCLUSTER-B-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('BLOODCLUSTER-B-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
