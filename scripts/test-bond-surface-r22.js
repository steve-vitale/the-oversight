#!/usr/bin/env node
// test-bond-surface-r22.js — journey-social r22 proof: friendships/rivalries
// get NARRATIVELY marked in conversation (bondWarm/bondCold opener pools +
// bond-flavored grace beat). RED pre-fix → GREEN post-fix.
// Run from repo root: node scripts/test-bond-surface-r22.js
'use strict';
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
const t = (name, cond) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name); }
};

async function main() {
  Math.random = mulberry32(777);
  const { Game } = await loadGame({ seed: 777, mode: 'test-bond-surface-r22', fullTelemetry: false });
  await setupGame(Game, 'Chicago, Illinois', null);
  const v = Game.state.village;
  const sid = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== sid);
  t('roster has NPCs', roster.length >= 5);
  const friend = roster[0], rival = roster[1], stranger = roster[2];

  // --- build bonds through the real machinery ---
  // friend: +6/day over 9 days (the +6/day cap is real) → crosses 25 & 50 → depth 2
  for (let d = 0; d < 9; d++) {
    Game.state.scholar.day = 10 + d;
    Game.bondAdd(sid, friend, 6, 'test-friend');
  }
  const fb = Game.bondGet(sid, friend);
  t('friend bond crossed +50', fb && fb.v >= 50);
  t('friend depth banked at 2', fb && fb.depth >= 2);
  // rival: grievances (the r21 theft->grievance path) → crosses -25 → depth -1
  Game.state.scholar.day = 20;
  Game.recordGrievance(rival, sid, 'stolen_from', 20);
  Game.recordGrievance(rival, sid, 'stolen_from', 20);
  Game.recordGrievance(rival, sid, 'stolen_from', 20);
  const rb = Game.bondGet(sid, rival);
  t('rival bond crossed -25', rb && rb.v <= -25);
  t('rival depth banked at -1 or worse', rb && rb.depth <= -1);
  const sb = Game.bondGet(sid, stranger);
  t('stranger bond is null or depth 0', !sb || (sb.depth || 0) === 0);

  // --- data pools exist ---
  const cg = (Game.data.characterGen || {}).convo || {};
  const warmPool = cg.bondWarm || [];
  const coldPool = cg.bondCold || [];
  t('bondWarm pool exists (8+)', warmPool.length >= 8);
  t('bondCold pool exists (8+)', coldPool.length >= 8);
  const warmTexts = warmPool.map(String), coldTexts = coldPool.map(String);
  t('no System references pre-day-7 in pools',
    !/\\bSystem\\b/.test(warmTexts.join(' ') + coldTexts.join(' ')));

  // --- opener surface: neutralize early stages so stage 6 (small talk) fires ---
  v.talkRequests = {}; v.grief = 0; v.cheer = 0;
  const norm = (s) => String(s || '').replace(/^"|"$/g, '').trim();
  function sampleOpeners(vid, n) {
    const lines = [];
    for (let i = 0; i < n; i++) {
      try {
        const o = Game.convoOpening(vid, null);
        if (o && o.line) lines.push({ thread: o.thread, line: o.line });
      } catch (e) { lines.push({ error: e.message }); }
    }
    return lines;
  }
  const friendLines = sampleOpeners(friend, 12);
  // match by text containment against the raw pool line (post voiceLine, the
  // quoted core text survives)
  const coreOf = (l) => String(l || '');
  const warmHits = friendLines.filter(l => warmPool.some(w => coreOf(l.line).indexOf(coreOf(w).slice(1, -1).slice(0, 20)) !== -1));
  t('friend opener draws from bondWarm (' + warmHits.length + '/12)', warmHits.length >= 6);
  const rivalLines = sampleOpeners(rival, 12);
  const coldHits = rivalLines.filter(l => coldPool.some(w => coreOf(l.line).indexOf(coreOf(w).slice(1, -1).slice(0, 20)) !== -1));
  t('rival opener draws from bondCold (' + coldHits.length + '/12)', coldHits.length >= 6);
  const strangerLines = sampleOpeners(stranger, 12);
  const strangerBond = strangerLines.filter(l =>
    warmPool.some(w => coreOf(l.line).indexOf(coreOf(w).slice(1, -1).slice(0, 20)) !== -1) ||
    coldPool.some(w => coreOf(l.line).indexOf(coreOf(w).slice(1, -1).slice(0, 20)) !== -1));
  t('stranger opener never bond-colored (' + strangerBond.length + ')', strangerBond.length === 0);

  // no fabricated shared events: bond lines are feeling-level
  const eventWords = /\bremember when\b|\blast summer\b|\bthe day we\b|\bwhen we (first|last)\b/i;
  t('warm lines invent no shared events', !eventWords.test(warmTexts.join(' ')));
  t('cold lines invent no shared events', !eventWords.test(coldTexts.join(' ')));

  // --- entry beat: fires after a non-bond opener, never for strangers ---
  const bcg = (Game.data.characterGen || {}).convo || {};
  const beatWarm = (bcg.bondBeatWarm || []).map(String);
  const beatCold = (bcg.bondBeatCold || []).map(String);
  const isWarmLine = (t) => warmPool.some(w => String(t).indexOf(String(w).slice(1, -1).slice(0, 20)) !== -1);
  const isColdLine = (t) => coldPool.some(w => String(t).indexOf(String(w).slice(1, -1).slice(0, 20)) !== -1);
  const isWarmBeat = (t) => beatWarm.some(b => String(t).indexOf(b) !== -1);
  const isColdBeat = (t) => beatCold.some(b => String(t).indexOf(b) !== -1);
  function openAndScan(vid, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      try {
        // one conversation per day: the entry beat marks the day's greeting
        Game.state.scholar.day = 30 + i;
        const st = Game.startConvo(vid);
        const tr = (st && st.transcript) || [];
        const npcLines = tr.filter(e => e && (e.who === 'them' || e.who === 'NPC')).map(e => String(e.text || ''));
        out.push(npcLines);
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) { out.push(['ERR:' + e.message]); }
    }
    return out;
  }
  const friendOpens = openAndScan(friend, 6);
  const friendMarked = friendOpens.filter(ls =>
    ls.some(isWarmLine) || ls.some(isWarmBeat)).length;
  t('friend conversations marked warm (' + friendMarked + '/6)', friendMarked >= 4);
  const friendDoubled = friendOpens.filter(ls =>
    ls.some(isWarmLine) && ls.some(isWarmBeat)).length;
  t('no double-mark when opener was the bond line (' + friendDoubled + ')', friendDoubled === 0);
  const rivalOpens = openAndScan(rival, 6);
  const rivalMarked = rivalOpens.filter(ls =>
    ls.some(isColdLine) || ls.some(isColdBeat)).length;
  t('rival conversations marked cold (' + rivalMarked + '/6)', rivalMarked >= 4);
  const strangerOpens = openAndScan(stranger, 6);
  const strangerMarked = strangerOpens.filter(ls =>
    ls.some(isWarmLine) || ls.some(isWarmBeat) || ls.some(isColdLine) || ls.some(isColdBeat)).length;
  t('stranger conversations never bond-marked (' + strangerMarked + ')', strangerMarked === 0);
  // beat pools are feeling-level: no quoted speech, no claimed events
  t('beat pools are narration (unquoted)', !/^"/.test(beatWarm.join('') + beatCold.join('')));
  t('beat pools invent no events', !eventWords.test(beatWarm.join(' ') + beatCold.join(' ')));
  const seen = new Set();
  let dup = false;
  for (const l of friendLines) {
    const k = String(l.line || '');
    if (seen.has(k)) dup = true;
    seen.add(k);
  }
  t('no repeated opener within 12 samples', !dup);

  // --- grace beat: bond-flavored at depth >= 2 ---
  const c = Game.convoGet(friend);
  c.active = true;
  v.memory = v.memory || {};
  v.memory[friend] = [{ t: 'gift', day: Game.state.scholar.day }];
  Game.convoMoodShift(friend, -1);
  const beat = (Game.convoGet(friend).moodBeat || '');
  const bondGraceWords = /long enough|a friend doesn/i;
  const recencyWords = /kind before|benefit of the doubt/i;
  t('grace beat fires', !!beat);
  t('grace beat is bond-flavored at depth>=2 (' + beat.slice(0, 60) + ')',
    bondGraceWords.test(beat));
  // rival (depth -1): grace stays recency-flavored (no bond variant for rivals)
  const cr = Game.convoGet(rival);
  cr.active = true;
  v.memory[rival] = [{ t: 'gift', day: Game.state.scholar.day }];
  Game.convoMoodShift(rival, -1);
  const rbeat = (Game.convoGet(rival).moodBeat || '');
  t('rival grace is NOT bond-flavored', !bondGraceWords.test(rbeat));

  // --- guardrail: conversation cost unchanged ---
  const kcalBefore = Game.state.scholar.kcal;
  Game.startConvo(stranger);
  Game.endConvo(stranger, 'left');
  t('convo cost still 10 kcal/open',
    (kcalBefore - Game.state.scholar.kcal) === 10);

  console.log('\n' + pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e.message); process.exit(2); });
