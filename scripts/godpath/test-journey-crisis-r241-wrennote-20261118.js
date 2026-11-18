#!/usr/bin/env node
// test-journey-crisis-r241-wrennote-20261118.js — proof test for the r241
// WREN-NOTE fix (journey-crisis r241; the r238/r241 finding: Wren's cache
// note reprinted verbatim 5-9x per seed — r238 logged 9x on 14511, r241
// counted 9x on 14532, 6x on 14531, 7x on 14534, 5x on 14533).
//
// THE DEFECT. apDeadDrop picks uniformly at random over Wren's 4 helpLines,
// and the cache note is one of them — so across 25-37 drops per seed the
// same note reprints 5-9 times. Honest (it IS Wren's note) but flat across
// a run. Each drop leaves a NEW bundle, so Wren writes a fresh short note
// each time; nothing in the fiction requires the fresh note to say the
// same words.
//
// THE FIX (src/data/alienPlayers.json + src/js/alienPlayers.js apDeadDrop
// only): Wren carries a 6-variant cacheNotes pool (variant 0 is the
// original note verbatim; cacheNoteIndex marks the cache-note slot in
// helpLines) and the drop rotates through it with a counter on ap state.
// Deterministic, no new RNG draw, so the seeded draw sequence is
// untouched. Other helpers are unaffected (only Wren carries the fields);
// the warnings and bandages still drop through the same random pick.
//
// PROOF SHAPE (godpath lib): drive apDeadDrop through the real path until
// 7 cache notes have been said (day +4 per call clears the 3-day limit),
// and read them off captureSays. Run with SEED=42 and SEED=7 (two separate
// processes).
'use strict';
const K = require('./lib'), T = K.reporter('journey-crisis-r241-wrennote');
(async () => {
 const G = await K.load({ seed: Number(process.env.SEED || 42), narration: false });
 K.newRun(G);
 const s = G.state.scholar;
 const wren = (G.data.alienPlayers || []).find(p => p.id === 'wren');
 T.ok('Wren carries a cache-note pool', !!(wren && Array.isArray(wren.cacheNotes) && wren.cacheNotes.length >= 6), 'cacheNotes=' + (wren && wren.cacheNotes && wren.cacheNotes.length));
 const ORIG = '"Cache by the hollow. Dried meat, clean water. I can\'t stay. — W."';
 T.ok('GUARD: pool variant 0 is the original note verbatim', wren.cacheNotes[0] === ORIG, wren.cacheNotes[0]);
 T.ok('GUARD: cacheNoteIndex marks the cache-note slot', wren.cacheNoteIndex === 0 && wren.helpLines[0] === ORIG, 'cacheNoteIndex=' + wren.cacheNoteIndex);
 const says = K.captureSays(G);
 const notes = [];
 let calls = 0;
 while (notes.length < 7 && calls < 200) {
   s.day += 4;
   const before = says.length;
   G.apDeadDrop();
   calls++;
   for (let i = before; i < says.length; i++) {
     if (wren.cacheNotes.includes(says[i])) notes.push(says[i]);
   }
 }
 T.ok('7 cache notes collected within 200 drop calls', notes.length >= 7, 'notes=' + notes.length + ' calls=' + calls);
 const firstSix = notes.slice(0, 6);
 T.ok('DISCRIMINATOR 1: first 6 cache notes are all distinct', new Set(firstSix).size === 6, JSON.stringify(firstSix));
 T.ok('DISCRIMINATOR 2: first cache note is the original verbatim', notes[0] === ORIG, notes[0]);
 T.ok('DISCRIMINATOR 3: 7th cache note repeats the 1st (pool exhausted, honest rotation)', notes[6] === notes[0], 'note7=' + JSON.stringify(notes[6]));
 // GUARDS: the drop itself is unchanged — other help lines still fire, bundles still arrive.
 const others = says.filter(l => (wren.helpLines || []).some(h => h !== wren.helpLines[wren.cacheNoteIndex] && l === h));
 T.ok('GUARD: warnings/bandages still drop (rotation touches only the cache note)', others.length > 0, 'otherHelpLines=' + others.length);
 const bundles = says.filter(l => /small bundle tucked/.test(l)).length;
 T.ok('GUARD: bundles still arrive', bundles > 0, 'bundles=' + bundles);
 console.log('--- CACHE NOTES (seed ' + process.env.SEED + ', ' + calls + ' drop calls) ---');
 notes.forEach((n, i) => console.log('  note ' + (i + 1) + ': ' + n));
 T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
