#!/usr/bin/env node
// LADDER LEG 3 (2026-11-08, brief §b.6): the overtime stretch.
// A village's Standing buys time against the wave timer: the tier
// interval is 7 days + 1 per 4 counted ladder points, so a 12-point
// village waits ~10 days per tier and a 40-point village ~17. The tier
// announcement names the stretch. daysPerTier stays 7 in titans.json.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('ladder-time-20261108');
(async () => {
  const G = await K.load({ seed: 7 });
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village, pg = G.progState();
  const says = K.captureSays(G);

  // ---- shared rig (leg-1 cap test pattern, verbatim where it fits) ----
  function resetXp() {
    const T = ['combat', 'field', 'social', 'craft', 'strange'];
    const pt = G.playerTracks();
    for (const t of T) pt[t].xp = 0;
    const roster = ((G.state.village || {}).roster || []);
    for (const vid of roster) {
      if (!vid || vid === G.villagerId) continue;
      const vp = G.vpOf ? G.vpOf(vid) : null;
      if (vp && vp.dead) continue;
      const x = G.npcXp(vid);
      for (const t of T) x[t] = 0;
    }
  }
  function resetLadderState() {
    resetXp();
    G.state.waveLedger = {}; G.state.feastLog = []; G.state.waveKillLog = [];
    try { G.deedState().contestsSurvived = 0; } catch (e) {}
    try { G.state.codex = { plants: {}, monsters: {}, animals: {}, recipes: {}, techniques: {}, skills: {} }; } catch (e) {}
    try { const ls = G.hierarchyState(); ls.length = 0; } catch (e) {}
    delete G.state._ladderPeakStage; delete G.state._ladderCapBeat;
    delete pg.ladderCapstone; delete pg.ladderRewards;
    delete pg._ladderBanked;
    const store = G._meta(); if (store) delete store.ladderBank;
  }
  function setLedger(wave, points) {
    G.state.waveLedger = G.state.waveLedger || {};
    G.state.waveLedger[wave] = { points, perType: {}, perTypeX: {} };
  }
  function setFieldXp(n) { G.playerTracks().field.xp = n; }
  function setFight(wave, points) { setLedger(wave, points); }
  // counted = Fight (waveLedger 3 points / 2) + Forage (field XP / 12).
  // 12 counted = Fight 12 + Forage 72; 40 = Fight 48 + Forage 192.

  // ---- L3-1a: interval math ----
  resetLadderState();
  T.ok('0 counted points: 7-day interval', G.overtimeInterval() === 7);
  resetLadderState(); setFight(3, 6); // Fight 3
  T.ok('3 counted points: still 7 days', G.overtimeInterval() === 7);
  resetLadderState(); setFight(3, 8); // Fight 4
  T.ok('4 counted points: 8-day interval', G.overtimeInterval() === 8);
  resetLadderState(); setFight(3, 16); setFieldXp(12); // Fight 8 (capped to 7) + Forage 1 = 8 counted
  T.ok('8 counted points: 9-day interval', G.overtimeInterval() === 9 && G.villageLadder().counted === 8);
  resetLadderState(); setFight(3, 24); setFieldXp(72); // Fight 12 + Forage 6 = 18
  T.ok('18 counted points: 11-day interval', G.overtimeInterval() === 11 && G.villageLadder().counted === 18);
  resetLadderState(); setFight(3, 12); setFieldXp(72); // Fight 6 + Forage 6 = 12
  T.ok('12 counted points: 10-day interval', G.overtimeInterval() === 10 && G.villageLadder().counted === 12);
  resetLadderState(); setFight(3, 48); setFieldXp(192); // Fight 24 + Forage 16 = 40
  T.ok('40 counted points: 17-day interval', G.overtimeInterval() === 17 && G.villageLadder().counted === 40);

  // ---- L3-1b: the clock only runs after the table announces ----
  // overtimeActive() needs tableWaiting + announced + day >= 90 + a priced
  // seat. The seat is stubbed (the table-endings test precedent); the rest
  // is real rigging.
  const origSeat = G.tableSeat;
  G.tableSeat = () => ({ seat: 'lesser', detail: {} });
  resetLadderState();
  s.day = 95; pg.tableWaiting = true; pg.tableAnnounced = false;
  pg.overtimeStarted = true; pg.overtimeDays = 0; pg.overtime = 0; pg.overtimeLastDay = null;
  for (let i = 0; i < 5; i++) { s.day = 95 + i; G.overtimeTick(); }
  T.ok('no announcement, no clock: 5 days pass with no overtime days', (pg.overtimeDays | 0) === 0 && (pg.overtime | 0) === 0);

  // ---- L3-1c: a 12-point village tiers at 10 days, not 7 ----
  resetLadderState(); setFight(3, 12); setFieldXp(72); // 12 counted
  pg.tableAnnounced = true;
  pg.overtimeStarted = true; pg.overtimeDays = 0; pg.overtime = 0; pg.overtimeLastDay = null;
  says.length = 0;
  for (let d = 0; d < 9; d++) { s.day = 95 + d; G.overtimeTick(); }
  T.ok('12-point village: no tier after 9 days', (pg.overtime | 0) === 0 && (pg.overtimeDays | 0) === 9);
  s.day = 104; G.overtimeTick();
  T.ok('12-point village: tier 1 at 10 days', (pg.overtime | 0) === 1 && (pg.overtimeDays | 0) === 10);
  const stretchSaid = says.some(x => /standing buys time/i.test(x) && /10 days/.test(x));
  T.ok('tier-up announcement names the stretch (10 days)', stretchSaid);

  // ---- L3-1d: a 0-point village tiers at 7 days ----
  resetLadderState();
  pg.overtimeStarted = true; pg.overtimeDays = 0; pg.overtime = 0; pg.overtimeLastDay = null;
  says.length = 0;
  for (let d = 0; d < 6; d++) { s.day = 95 + d; G.overtimeTick(); }
  T.ok('0-point village: no tier after 6 days', (pg.overtime | 0) === 0);
  s.day = 101; G.overtimeTick();
  T.ok('0-point village: tier 1 at 7 days', (pg.overtime | 0) === 1);
  T.ok('7-day announcement does not claim a stretch', !says.some(x => /standing buys time/i.test(x)));

  // ---- L3-1e: the tier never falls when the interval grows ----
  // At tier 1 with 7 days banked, rigging 40 points (interval 17) must
  // leave the tier at 1 — want = floor(7/17) = 0 < 1.
  resetLadderState(); setFight(3, 48); setFieldXp(192); // 40 counted
  T.ok('tier holds at 1 when the interval stretches past the banked days', (pg.overtime | 0) === 1);
  for (let d = 0; d < 10; d++) { s.day = 102 + d; G.overtimeTick(); }
  T.ok('tier still 1 after 10 more days at interval 17', (pg.overtime | 0) === 1);
  for (let d = 0; d < 16; d++) { s.day = 112 + d; G.overtimeTick(); }
  T.ok('tier still 1 at 33 banked days (want floor(33/17) = 1)', (pg.overtime | 0) === 1 && (pg.overtimeDays | 0) === 33);
  s.day = 128; G.overtimeTick();
  T.ok('tier 2 once 34 days bank at interval 17', (pg.overtime | 0) === 2 && (pg.overtimeDays | 0) === 34);

  // ---- L3-1f: the base rate is untouched ----
  T.ok('daysPerTier stays 7 in titans.json', G.data.titans && G.data.titans._overtime && G.data.titans._overtime.daysPerTier === 7);
  G.tableSeat = origSeat;
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
