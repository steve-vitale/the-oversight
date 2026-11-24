#!/usr/bin/env node
'use strict';
// Proof: variety pools widen (journey-social-life r283, Arm A).
//
// THE DEFECT (r277 panel): M4 conversational near-dup flags 25 (bar
// <= 12), driven by teach-frame pool cycling — Ines taught 11 plants in
// ONE sitting using ALL FOUR plant frames (frame 0 x3, frame 1 x3,
// frame 2 x2, frame 3 x3), the exact signature of pool cycling (4+4+3),
// not of a reset failure. The rotation survives the agency-ask path;
// the pool is too small for the sitting's teach density. Mood up:warm
// (2 lines) and the hunger-plea whyBits/whyTails (3 each) are the same
// shape at smaller scale.
//
// THE FIX (r283 Arm A):
// - convoTeachPlantLine / convoTeachPlaceLine: 4 -> 8 frames each
//   (src/js/villager-agency.js), originals first.
// - convoMoodBeat up:warm: 2 -> 4 stage directions
//   (src/js/convo-mood.js), originals first.
// - food_share.build hunger-plea whyBits/whyTails: 3 -> 4 each
//   (src/js/convo-wants.js); the tail index also moves from a hardcoded
//   `% 3` to `% whyTails.length`, so the 4th tail is actually reachable.
//
// PROOF SHAPE (godpath lib): call the pool functions directly inside a
// real sitting, so the per-villager rotation ledgers are live.
//   1. 8 plant lessons in one sitting use 8 distinct frames
//      (RED before: 4-frame pool repeats by lesson 5)
//   2. 8 place lessons in one sitting use 8 distinct frames
//   3. 4 mood shifts to warm serve 4 distinct beats
//      (RED before: 2-line pool repeats by shift 3)
//   4. hunger-plea why composition varies across a sweep of builds:
//      the 4th whyBit and the 4th whyTail each appear at least once
//      (RED before: neither string exists in the pools)
// Usage: node scripts/test-journey-social-life-r283-variety-pools-20261124.js
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r283-variety-pools');

const PLANTS = ['Chanterelle', 'Baobab', 'Tulsi', 'Murumuru', 'Loquat', 'Maypop', 'Lotus', 'Kapok Seeds'];
const PLACES = ['Brooklyn', 'Haven', 'the old mill', 'Cairn Hill', 'Rookery', 'Salt Flats', 'the far ridge', 'Millpond'];
const BIT4 = 'My ribs have started showing';
const TAIL4 = 'Even a handful of anything';

(async () => {
  const Game = await K.load({ seed: 283200 });

  function freshSpeaker() {
    K.newRun(Game);
    const v = Game.state.village;
    const oldId = Game.villagerId;
    const roster = (v.roster || []).filter(id => id !== oldId);
    const speaking = roster.filter(id => {
      try { return Game.commLevel(id).level !== 'none'; } catch (e) { return false; }
    });
    if (!speaking.length) throw new Error('fresh run has no speaking non-scholar roster members');
    const speaker = speaking.find(id => {
      try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
    }) || speaking[0];
    return { roster: speaking, speaker };
  }
  function openSitting(vid) {
    try {
      const o = Game.startConvo(vid);
      if (o && !o.refused && !o.ended) return true;
    } catch (e) {}
    try {
      const opened = Game.talkTo(vid);
      if (!opened) return false;
      const c = Game.convoGet(vid);
      if (c && c.active) return true;
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    } catch (e) {}
    return false;
  }
  // stripItem: the frame embeds the taught item; the TEMPLATE is what
  // must not repeat, so the item name is stripped before comparing.
  function stripItem(line, item) {
    return String(line || '').split(item).join('').trim();
  }

  // ---- 1. Plant teach frames: 8 lessons, 8 distinct frames. ----
  T.section('1. Plant teach frames — 8 lessons in one sitting use 8 distinct frames');
  let f = freshSpeaker();
  let vid = f.speaker;
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  T.ok('opened a sitting on the test villager', openSitting(vid));
  const plantTemplates = [];
  for (const plant of PLANTS) {
    let line = null;
    try { line = Game.convoTeachPlantLine(vid, plant); } catch (e) { line = 'ERR:' + (e && e.message); }
    T.ok('plant lesson speaks for ' + plant, !!line && !String(line).startsWith('ERR'), String(line).slice(0, 90));
    plantTemplates.push(stripItem(line, plant));
  }
  T.ok('8 plant lessons use 8 distinct frames', new Set(plantTemplates).size === 8, 'distinct=' + new Set(plantTemplates).size + ' of 8');
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 2. Place teach frames: 8 lessons, 8 distinct frames. ----
  T.section('2. Place teach frames — 8 lessons in one sitting use 8 distinct frames');
  f = freshSpeaker();
  vid = f.speaker;
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  T.ok('opened a sitting on the test villager', openSitting(vid));
  const placeTemplates = [];
  for (const place of PLACES) {
    let line = null;
    try { line = Game.convoTeachPlaceLine(vid, place); } catch (e) { line = 'ERR:' + (e && e.message); }
    T.ok('place lesson speaks for ' + place, !!line && !String(line).startsWith('ERR'), String(line).slice(0, 90));
    placeTemplates.push(stripItem(line, place));
  }
  T.ok('8 place lessons use 8 distinct frames', new Set(placeTemplates).size === 8, 'distinct=' + new Set(placeTemplates).size + ' of 8');
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 3. Mood up:warm: 4 shifts, 4 distinct beats. ----
  T.section('3. Mood up:warm — 4 shifts serve 4 distinct beats');
  f = freshSpeaker();
  vid = f.speaker;
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  T.ok('opened a sitting on the test villager', openSitting(vid));
  const beats = [];
  for (let i = 0; i < 4; i++) {
    let beat = null;
    try { beat = Game.convoMoodBeat(vid, 'neutral', 'warm'); } catch (e) { beat = 'ERR:' + (e && e.message); }
    T.ok('mood shift ' + (i + 1) + ' serves a beat', !!beat && !String(beat).startsWith('ERR'), String(beat).slice(0, 90));
    beats.push(String(beat));
  }
  T.ok('4 warm shifts serve 4 distinct beats', new Set(beats).size === 4, 'distinct=' + new Set(beats).size + ' of 4');
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 4. Hunger-plea why composition varies across a build sweep. ----
  T.section('4. Hunger-plea why — the 4th whyBit and 4th whyTail are each reached');
  f = freshSpeaker();
  const whyLines = [];
  // Sweep builds across the roster (each build bumps favorSeq, so the
  // instance hash varies); 3 rounds to spread the hash well past the
  // 4x4 composition space.
  for (let round = 0; round < 3; round++) {
    for (const rvid of f.roster) {
      try {
        const favor = Game.convoBuildFavor(rvid, { kind: 'food_share', hunger: 80 });
        if (favor && favor.whyLine) whyLines.push(String(favor.whyLine));
      } catch (e) { /* next villager */ }
    }
  }
  T.ok('sweep built hunger pleas', whyLines.length >= 12, 'built=' + whyLines.length);
  T.ok('the 4th whyBit is reached', whyLines.some(l => l.indexOf(BIT4) !== -1), 'whyLines=' + whyLines.length);
  T.ok('the 4th whyTail is reached', whyLines.some(l => l.indexOf(TAIL4) !== -1), 'whyLines=' + whyLines.length);
  T.ok('why composition varies (4+ distinct whyLines)', new Set(whyLines).size >= 4, 'distinct=' + new Set(whyLines).size + ' of ' + whyLines.length);

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
