#!/usr/bin/env node
// test-journey-crisis-r241-mimewalk-20261118.js — proof test for the r241
// MIME-WALK fix (journey-crisis r241; the r238/r241 finding: the
// walk-invitation mime in nvOpen was one hard-coded line, so the same
// nonverbal villager mimed the identical invitation three days running —
// Farid d57-59, Dorcas d109-111 on the r241 panel; r238 logged the same
// shape on 14512, cache-spot variant 3x in a row twice).
//
// THE DEFECT. conversation.js nvOpen builds the gesture from a single
// template with only the spot varying. A pending invite re-fires every
// sitting, and the same villager re-invites to the same spot day after
// day, so the byte-identical line repeats 3 days running.
//
// THE FIX (conversation.js nvOpen only): a 6-variant pool of gesture
// stagings (same meaning, same spot interpolation; variant 0 is the
// original line verbatim) with no-repeat-until-exhausted per villager on
// the convo record (c._mimeUsed persists across sittings). Deterministic,
// no RNG draw (the TRAILTALK precedent, r236). All variants are stage
// direction, never quoted speech — the no-English rule holds: they SHOW
// the invitation, they never say it.
//
// PROOF SHAPE (godpath lib): stage a nonverbal (Bengali-only) villager
// with a fresh pending invite, call nvOpen 7 times (a fresh invite each
// time, as a new day brings), and read the gesture from the returned line.
// Run with SEED=42 and SEED=7 (two separate processes).
'use strict';
const K = require('./lib'), T = K.reporter('journey-crisis-r241-mimewalk');
(async () => {
 const G = await K.load({ seed: Number(process.env.SEED || 42), narration: false });
 K.newRun(G);
 const s = G.state.scholar, v = G.state.village;
 const vid = v.roster.find(id => id !== G.villagerId && G.getPerson(id));
 if (!vid) throw Error('No living conversation target');
 try { if (G.revealName) G.revealName(vid, 'intro'); } catch (e) {}
 const person = G.getPerson(vid);
 person.languages = { native: 'bengali', levels: { bengali: 2 } };
 s.languages = { english: 2 };
 Object.assign(G.npcNeeds(vid), { hunger: 10, fear: 10, social: 10, energy: 90 });
 v.health = v.health || {}; v.health[vid] = 100; v.sick = v.sick || {}; delete v.sick[vid];
 v.trust = v.trust || {}; v.trust[vid] = 30;
 T.ok('target speaks Bengali only, scholar shares no tongue', G.npcNativeLang(vid) === 'bengali' && G.commLevel(vid).level === 'none', 'native=' + G.npcNativeLang(vid) + ' comm=' + G.commLevel(vid).level);
 // ---- 7 sittings, a fresh pending invite each time (a new day brings one) ----
 const gestures = [];
 for (let i = 0; i < 7; i++) {
   G.inviteHistory(vid).pending = { defId: 'look', day: s.day + i };
   const res = G.nvOpen(vid);
   T.ok('sitting ' + (i + 1) + ' opens nonverbal', !!(res && typeof res.line === 'string'), res && String(res.line).slice(0, 80));
   const parts = String(res.line).split('\n');
   const g = parts[parts.length - 1];
   T.ok('sitting ' + (i + 1) + ' mimes the walk invitation', g.indexOf('the tree line') !== -1 && g.charAt(0) === '(' && g.indexOf(')') !== -1, g);
   gestures.push(g);
 }
 const firstSix = gestures.slice(0, 6);
 T.ok('DISCRIMINATOR 1: first 6 sittings mime 6 distinct stagings', new Set(firstSix).size === 6, JSON.stringify(firstSix));
 const ORIG = '(They mime walking — pointing at themselves, then at you, then toward the tree line. The meaning is unmistakable: come with me.)';
 T.ok('DISCRIMINATOR 2: sitting 1 is the original line verbatim', gestures[0] === ORIG, gestures[0]);
 T.ok('DISCRIMINATOR 3: sitting 7 repeats sitting 1 (pool exhausted, honest reset)', gestures[6] === gestures[0], 'sitting7=' + JSON.stringify(gestures[6]));
 T.ok('GUARD: no mime is quoted speech (no-English rule holds)', gestures.every(g => g.indexOf('"') === -1), JSON.stringify(gestures));
 const c = G.convoGet(vid);
 T.ok('GUARD: _mimeUsed is tracked on the convo record', Array.isArray(c._mimeUsed) && c._mimeUsed.length > 0, '_mimeUsed=' + JSON.stringify(c._mimeUsed));
 console.log('--- MIME GESTURES (seed ' + process.env.SEED + ') ---');
 gestures.forEach((g, i) => console.log('  sitting ' + (i + 1) + ': ' + g));
 T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
