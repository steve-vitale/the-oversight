#!/usr/bin/env node
// test-journey-social-life-r236-trailtk-20261118.js — proof test for the r236
// TRAILTALK fix (journey-social-life r236; the r234/r235 finding: the
// trail-talk pool is 2 lines deep and a player mashing "Talk on the trail
// for a while" hears the same two lines verbatim, alternating — r235 seed
// 45720: line A 12x + line B 12x).
//
// THE DEFECT. talkLine (src/js/favor-forage.js) holds one 2-line pool per
// temperament and selects pool[n % pool.length] — a deterministic 2-cycle.
// The line is spoken through sayLine(vid, line, { diegeticAct: true })
// (convo-dialogue.js forage_talk handler), and diegeticAct exempts it from
// BOTH no-repeat ledgers (conversation.js sayLine, r25) — so the ledger
// that catches every other repeat cannot catch this one. The fix must live
// in the pool/selection itself.
//
// THE FIX (favor-forage.js talkLine only): every pool 2 -> 6 lines (the
// two originals stay first, in order), and selection is
// no-repeat-until-exhausted within one outing via r.talkUsed (pool indices
// spoken on THIS outing; first unused index each press; reset only when
// the pool is exhausted). Deterministic, no RNG.
//
// PROOF SHAPE (godpath lib, real outing — test-joint-outing pattern):
// stage a real forage_help favour through the public path (build, commit,
// start at dawn at Haven, travel to a green patch, one real joint forage),
// then press performForageTalk 12x on the same outing and read the lines.
// Run with SEED=42 and SEED=7 (two separate processes).
'use strict';
const K = require('./godpath/lib'), T = K.reporter('journey-social-r236-trailtk');
(async () => {
 const G = await K.load({ seed: Number(process.env.SEED || 42), narration: false });
 K.newRun(G);
 const s = G.state.scholar, v = G.state.village;
 const vid = v.roster.find(id => id !== G.villagerId && G.getPerson(id));
 if (!vid) throw Error('No living conversation target');
 try { if (G.revealName) G.revealName(vid, 'intro'); } catch (e) {}
 const person = G.getPerson(vid);
 person.languages = { native: 'english', levels: { english: 2 } };
 s.languages = { english: 2 };
 Object.assign(G.npcNeeds(vid), { hunger: 10, fear: 10, social: 10, energy: 90 });
 v.health = v.health || {}; v.health[vid] = 100; v.sick = v.sick || {}; delete v.sick[vid];
 v.trust = v.trust || {}; v.trust[vid] = 30; s.kcal = 50000;
 v.pantry = []; v.pantryKcal = 0;
 const first = G.displayName(vid).split(' ')[0];
 const favor = G.convoBuildFavor(vid, { kind: 'forage_help', urgency: 2, kcal: 0 });
 T.ok('forage_help favour builds from a pantry need', !!(favor && favor.kind === 'forage_help'), favor && favor.task);
 G.convoStoreFavor(favor);
 const commit = G.convoFavorCommit(vid, favor);
 T.ok('commit creates the tracked outing promise', !!(commit && commit.ok), JSON.stringify(commit));
 const promise = v.promises[vid];
 // ---- START: dawn, at Haven, next to the partner ----
 const home = { x: v.px ?? 4, y: v.py ?? 4 };
 s.day = favor.meetDay; G.dayPart = 0;
 G.map.px = home.x; G.map.py = home.y;
 s.mx = 4; s.my = 4;
 v.nodePos = v.nodePos || {}; v.nodePos[vid] = { nx: home.x, ny: home.y };
 v.npcInside = v.npcInside || {}; v.npcInside[vid] = false; s.insideHaven = false;
 v.positions = v.positions || {}; v.positions[vid] = { mx: 4, my: 4 };
 if (v.away) delete v.away[vid];
 let res = G.convoPerformFavor(vid, favor);
 T.ok('start performs through the public favour path', !!(res && res.ok && res.incomplete), JSON.stringify(res));
 // ---- TRAVEL: find green ground and walk there together ----
 const S = (globalThis.Scattering || {}).forage;
 let spot = null;
 const isEdiblePlant = pid => {
   const p = (G.data.plants || []).find(x => x.id === pid);
   if (!p) return false;
   if (/nut/i.test(p.id) || /nut/i.test(p.name || '')) return false;
   if ((p.edibility || 'safe') === 'avoid') return false;
   return (p.caloriesPerUnit || 0) > 0;
 };
 for (let ny = 0; ny < 9 && !spot; ny++) for (let nx = 0; nx < 9 && !spot; nx++) {
   if (nx === home.x && ny === home.y) continue;
   const tile = G.map.tiles[ny][nx];
   if (!tile || (S && S.canForage && !S.canForage(tile))) continue;
   const detail = G.genDetail(nx, ny);
   for (let my = 1; my < 8 && !spot; my++) for (let mx = 1; mx < 8 && !spot; mx++) {
     let count = 0; const speciesList = [];
     for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
       const c = detail[my + dy] && detail[my + dy][mx + dx];
       if (!['plant', 'bush', 'tree', 'bigtree'].includes(c)) continue;
       if (tile.detailRegrow && tile.detailRegrow[(mx + dx) + ',' + (my + dy)]) continue;
       count++;
       try { const sp = G.cellPlantSpecies(tile, mx + dx, my + dy, c); if (sp && !speciesList.includes(sp)) speciesList.push(sp); } catch (e) {}
     }
     if (count >= 3 && speciesList.some(isEdiblePlant)) spot = { nx, ny, mx, my, speciesList, tile };
   }
 }
 T.ok('a green patch exists to forage together on', !!spot, spot ? (spot.nx + ',' + spot.ny) : 'none');
 if (!spot) throw Error('No forageable patch found');
 G.state.codex.plants = G.state.codex.plants || {};
 for (const sp of spot.speciesList) if (!G.plantKnown(sp)) G.state.codex.plants[sp] = { level: 1, harvests: 0 };
 G.map.px = spot.nx; G.map.py = spot.ny; s.mx = spot.mx; s.my = spot.my;
 G.placePartyAtPlayer();
 v.positions[vid] = { mx: s.mx, my: s.my };
 // ---- FORAGE TOGETHER: one real solo-rule press, split ----
 res = G.convoPerformFavor(vid, favor);
 const run = favor.forageRun;
 T.ok('joint forage performs through the public favour path', !!(res && res.ok && res.incomplete), JSON.stringify(res));
 const partnerKcal = (run.partnerHaul || []).reduce((n, i) => n + (i.kcalEach * (i.units || 0)), 0);
 T.ok('haul is shared: partner share greater than zero', partnerKcal > 0, 'partner=' + partnerKcal);
 // ---- TALK ON THE TRAIL: 12 presses on the same outing ----
 const lines = [];
 for (let i = 0; i < 12; i++) {
   const talk = G.performForageTalk(vid, favor);
   T.ok('talk press ' + (i + 1) + ' speaks', !!(talk && talk.ok && talk.line), talk && talk.line);
   lines.push(talk.line);
 }
 const firstSix = lines.slice(0, 6);
 const distinctSix = new Set(firstSix).size;
 T.ok('DISCRIMINATOR 1: first 6 presses are all distinct lines', distinctSix === 6, 'distinct=' + distinctSix + ' lines=' + JSON.stringify(firstSix));
 const counts = {};
 for (const l of lines) counts[l] = (counts[l] || 0) + 1;
 const maxRec = Math.max(...Object.values(counts));
 const distinctTwelve = Object.keys(counts).length;
 T.ok('DISCRIMINATOR 2: 12 presses use all 6 pool lines', distinctTwelve === 6, 'distinct=' + distinctTwelve);
 T.ok('DISCRIMINATOR 2: no line recurs more than twice in 12 presses', maxRec <= 2, 'maxRecurrence=' + maxRec + ' counts=' + JSON.stringify(counts));
 T.ok('DISCRIMINATOR 3: press 7 repeats press 1 (pool exhausted, honest reset)', lines[6] === lines[0], 'press7=' + JSON.stringify(lines[6]) + ' press1=' + JSON.stringify(lines[0]));
 // ---- GUARDS (pass on base AND fix) ----
 const openers = ['Two pairs of eyes, twice the ground', 'grins. Good ground', 'This is the part I like', 'Slow. The patch gives more'];
 const seconds = ['Onward', 'Not bad for two pairs of hands', 'Tell me what you see', 'Keep together out here'];
 T.ok('GUARD: press 1 is one of the four original pool openers', openers.some(o => lines[0].includes(o)), lines[0]);
 T.ok('GUARD: press 2 is one of the four original second lines', seconds.some(o => lines[1].includes(o)), lines[1]);
 T.ok('GUARD: talkCount increments per press', run.talkCount === 12, 'talkCount=' + run.talkCount);
 T.ok('GUARD: talkUsed is tracked on the outing', Array.isArray(run.talkUsed) && run.talkUsed.length > 0, 'talkUsed=' + JSON.stringify(run.talkUsed));
 T.ok('GUARD: a kcal-interpolated line still carries live numbers', lines.some(l => /\d+ kcal/.test(l)), JSON.stringify(lines));
 // ---- RETURN HOME AND DELIVER (outing still completes after the talk) ----
 G.map.px = home.x; G.map.py = home.y; s.mx = 4; s.my = 4;
 G.placePartyAtPlayer();
 v.nodePos[vid] = { nx: home.x, ny: home.y }; v.positions[vid] = { mx: 4, my: 4 };
 const status = G.convoFavorAction(vid, favor);
 T.ok('GUARD: delivery is ready back at Haven together', !!(status.ready && status.action === 'forage_deliver'), JSON.stringify(status));
 res = G.convoPerformFavor(vid, favor);
 T.ok('GUARD: delivery performs and the promise is kept', !!(res && res.ok && res.close && !res.promiseMissed), JSON.stringify(res));
 T.ok('GUARD: promise is kept by the shared delivery', promise.kept === true, 'kept=' + promise.kept);
 console.log('--- TRAIL TALK LINES (seed ' + process.env.SEED + ', temperament ' + (G.npcTemper ? G.npcTemper(vid) : '?') + ') ---');
 lines.forEach((l, i) => console.log('  press ' + (i + 1) + ': ' + l));
 T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
