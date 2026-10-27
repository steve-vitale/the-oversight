// Joint foraging outing — proof test (tackle-outing, bars in
// evidence/2026-10-27/tackle-outing-bars.md). One full outing through the
// PUBLIC favour path only (convoFavorAction / convoPerformFavor): a
// promised forage_help favour goes start -> forage together -> deliver at
// Haven -> favour fulfilled and promise kept. Run with SEED=42 and SEED=7
// (two separate processes; the harness is single-run per process).
// Before this change, convoFavorAction(forage_help) returned
// unsupported:true and convoFavorCommit refused it, so no outing could
// start at all — that is the before/after discriminator below.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('joint-outing');
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
 // The favour itself, built the way the game builds it from a real need.
 const favor = G.convoBuildFavor(vid, { kind: 'forage_help', urgency: 2, kcal: 0 });
 T.ok('forage_help favour builds from a pantry need', !!(favor && favor.kind === 'forage_help'), favor && favor.task);
 G.convoStoreFavor(favor);
 const pre = G.convoFavorAction(vid, favor);
 T.ok('before/after: forage_help is NOT unsupported (old code refused it here)', !pre.unsupported, JSON.stringify(pre));
 const commit = G.convoFavorCommit(vid, favor);
 T.ok('commit creates the tracked outing promise', !!(commit && commit.ok), JSON.stringify(commit));
 const promise = v.promises[vid];
 T.ok('promise carries the favour id', !!(promise && promise.favorId === favor.id && !promise.kept), JSON.stringify(promise));
 T.ok('commit sets the dawn after as meeting day', favor.meetDay === promise.day + 1, 'meetDay=' + favor.meetDay + ' promiseDay=' + promise.day);
 // Capture spoken lines for the sense read at the end.
 const said = [];
 const origSay = G.say.bind(G);
 G.say = msg => { said.push(String(msg)); return origSay(msg); };
 // ---- START: dawn, at Haven, next to the partner ----
 const home = { x: v.px ?? 4, y: v.py ?? 4 };
 s.day = favor.meetDay; G.dayPart = 0;
 G.map.px = home.x; G.map.py = home.y;
 s.mx = 4; s.my = 4;
 v.nodePos = v.nodePos || {}; v.nodePos[vid] = { nx: home.x, ny: home.y };
 v.npcInside = v.npcInside || {}; v.npcInside[vid] = false; s.insideHaven = false;
 v.positions = v.positions || {}; v.positions[vid] = { mx: 4, my: 4 };
 if (v.away) delete v.away[vid];
 let status = G.convoFavorAction(vid, favor);
 T.ok('start is ready at dawn at Haven next to the partner', !!(status.ready && status.action === 'forage_start'), JSON.stringify(status));
 let res = G.convoPerformFavor(vid, favor);
 T.ok('start performs through the public favour path', !!(res && res.ok && res.incomplete), JSON.stringify(res));
 T.ok('partner travels with you once the outing starts', G.travelingWith().includes(vid), G.travelingWith().join(','));
 T.ok('partner is engaged for the outing', !!G.isEngaged(vid));
 const menu = G.convoFavorActionMenu(vid, favor, false);
 T.ok('outing menu offers trail talk while out together', menu.some(m => m.id === 'dlg:forage_talk'), menu.map(m => m.id).join(','));
 // ---- TRAVEL: find green ground and walk there together ----
 const S = (globalThis.Scattering || {}).forage;
 let spot = null;
 const isEdiblePlant = pid => {
   const p = (G.data.plants || []).find(x => x.id === pid);
   if (!p) return false;
   if (/nut/i.test(p.id) || /nut/i.test(p.name || '')) return false; // in-shell nuts are not food yet
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
     // A patch only counts if it holds at least one plant that is food
     // once known — a nuts-only or unknown-only patch cannot prove a
     // shared food haul, and the outing must not pretend it did.
     if (count >= 3 && speciesList.some(isEdiblePlant)) spot = { nx, ny, mx, my, speciesList, tile };
   }
 }
 T.ok('a green patch exists to forage together on', !!spot, spot ? (spot.nx + ',' + spot.ny + ' species=' + (spot.speciesList || []).join(',')) : 'none');
 if (!spot) throw Error('No forageable patch found');
 // The player knows this patch's plants (starting knowledge, level 1) so
 // the sweep packs named food instead of an unidentified lump. In-shell
 // nuts still stay in-shell and unknown plants would still stay lumped —
 // neither is ever split as food.
 G.state.codex.plants = G.state.codex.plants || {};
 for (const sp of spot.speciesList) if (!G.plantKnown(sp)) G.state.codex.plants[sp] = { level: 1, harvests: 0 };
 T.ok('the patch food plant is known, so the haul is real food', spot.speciesList.some(sp => isEdiblePlant(sp) && G.plantKnown(sp)), spot.speciesList.join(','));
 G.map.px = spot.nx; G.map.py = spot.ny; s.mx = spot.mx; s.my = spot.my;
 G.placePartyAtPlayer();
 T.ok('partner node follows the player node on travel', v.nodePos[vid] && v.nodePos[vid].nx === spot.nx && v.nodePos[vid].ny === spot.ny, JSON.stringify(v.nodePos[vid]));
 v.positions[vid] = { mx: s.mx, my: s.my };
 const pantryBefore = G.pantryKcalLive(v);
 const packEdibleBefore = s.inventory.reduce((n, i) => n + ((i.kcalEach || 0) > 0 && i.edible !== false ? (i.kcalEach * (i.units || 0)) : 0), 0);
 const kcalBefore = s.kcal, ticksBefore = s.dayTicks || 0;
 // ---- FORAGE TOGETHER: one real solo-rule press, split ----
 status = G.convoFavorAction(vid, favor);
 T.ok('joint forage is ready on green ground', !!(status.ready && status.action === 'forage_together'), JSON.stringify(status));
 res = G.convoPerformFavor(vid, favor);
 const forageLine = res && res.line;
 const run = favor.forageRun;
 T.ok('joint forage performs through the public favour path', !!(res && res.ok && res.incomplete), JSON.stringify(res));
 T.ok('forage line names the partner and the shared haul', !!(res && res.line && res.line.includes(first) && /kcal/.test(res.line)), res && res.line);
 const playerKcal = (run.playerHaul || []).reduce((n, i) => n + (i.kcalEach * (i.units || 0)), 0);
 const partnerKcal = (run.partnerHaul || []).reduce((n, i) => n + (i.kcalEach * (i.units || 0)), 0);
 T.ok('haul is shared: partner share greater than zero', partnerKcal > 0, 'partner=' + partnerKcal);
 T.ok('haul is shared: player share greater than zero', playerKcal > 0, 'player=' + playerKcal);
 T.ok('outing recorded talking during the work', run.talked === true);
 const packEdibleAfter = s.inventory.reduce((n, i) => n + ((i.kcalEach || 0) > 0 && i.edible !== false ? (i.kcalEach * (i.units || 0)) : 0), 0);
 T.ok('player pack gained only their own share, not the whole sweep', packEdibleAfter - packEdibleBefore === playerKcal, 'packGain=' + (packEdibleAfter - packEdibleBefore) + ' playerShare=' + playerKcal);
 T.ok('forage spent real food-energy', s.kcal < kcalBefore, 'kcal ' + kcalBefore + ' -> ' + s.kcal);
 T.ok('forage spent real time', (s.dayTicks || 0) > ticksBefore, 'ticks ' + ticksBefore + ' -> ' + s.dayTicks);
 T.ok('haul is in transit, not in the pantry before delivery', G.pantryKcalLive(v) === pantryBefore, 'pantry=' + G.pantryKcalLive(v));
 const tileNow = G.playerTile();
 T.ok('the worked patch is marked picked clean', !!((tileNow.detailRegrow || {}) && Object.keys(tileNow.detailRegrow).length > 0), JSON.stringify(Object.keys(tileNow.detailRegrow || {})));
 const endAway = G.forageFavorAction(vid, favor, true);
 T.ok('ending away from Haven does not deliver', !endAway.ready, JSON.stringify(endAway));
 // A second press on the same picked-clean patch runs dry: no free seconds.
 const second = G.convoPerformFavor(vid, favor);
 T.ok('a second press on the same patch finds nothing (no free haul)', !!(second && !second.ok), JSON.stringify(second));
 // ---- TALK ON THE TRAIL ----
 const talk = G.performForageTalk(vid, favor);
 const talkLine = talk && talk.line;
 T.ok('trail talk speaks during the outing', !!(talk && talk.ok && talk.line), talk && talk.line);
 T.ok('trail talk is recorded on the outing', run.talkCount === 1);
 // ---- RETURN HOME AND DELIVER ----
 G.map.px = home.x; G.map.py = home.y; s.mx = 4; s.my = 4;
 G.placePartyAtPlayer();
 v.nodePos[vid] = { nx: home.x, ny: home.y }; v.positions[vid] = { mx: 4, my: 4 };
 status = G.convoFavorAction(vid, favor);
 T.ok('delivery is ready back at Haven together', !!(status.ready && status.action === 'forage_deliver'), JSON.stringify(status));
 res = G.convoPerformFavor(vid, favor);
 T.ok('delivery performs through the public favour path', !!(res && res.ok && res.close && !res.promiseMissed), JSON.stringify(res));
 T.ok('delivery line names both shares', !!(res.line && /kcal from you/.test(res.line) && res.line.includes(first)), res && res.line);
 T.ok('promise is kept by the shared delivery', promise.kept === true, 'kept=' + promise.kept);
 T.ok('favour instance is fulfilled', favor.state === 'fulfilled', favor.state);
 T.ok('delivered total equals the split haul, no double count', run.deliveredKcal === playerKcal + partnerKcal, 'delivered=' + run.deliveredKcal + ' total=' + (playerKcal + partnerKcal));
 T.ok('pantry gained exactly the split haul', G.pantryKcalLive(v) - pantryBefore === run.deliveredKcal, 'pantryGain=' + (G.pantryKcalLive(v) - pantryBefore));
 T.ok('player pack no longer holds the delivered share', s.inventory.reduce((n, i) => n + ((i.kcalEach || 0) > 0 && i.edible !== false ? (i.kcalEach * (i.units || 0)) : 0), 0) === packEdibleBefore, 'packEdible=' + s.inventory.reduce((n, i) => n + ((i.kcalEach || 0) > 0 && i.edible !== false ? (i.kcalEach * (i.units || 0)) : 0), 0));
 // ---- SENSE READ (transcript, not just counts) ----
 console.log('--- OUTING TRANSCRIPT (seed ' + process.env.SEED + ') ---');
 console.log('ASK: ' + favor.line);
 console.log('START: ' + first + ' falls in beside you.');
 console.log('FORAGE: ' + forageLine);
 console.log('TALK: ' + talkLine);
 console.log('DELIVER: ' + (favor.forageRun ? 'delivered ' + favor.forageRun.deliveredKcal + ' kcal (' + favor.forageRun.deliveredPlayerKcal + ' yours, ' + favor.forageRun.deliveredPartnerKcal + ' theirs)' : ''));
 console.log('SAID-LINES-DURING-OUTING: ' + said.slice(-6).join(' | '));
 T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
