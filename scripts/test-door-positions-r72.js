// R72 (journey-landing r72): door transitions must render the people on
// the side you step onto. Before the fix, enterBuilding/exitBuilding never
// called ensureVillagerPositions, while travelTo/microMove/pathStep all do —
// so after entering the hall, inside villagers kept pos=null, and every
// micro-adjacency check failed (favor starts, tile Talk) until the player
// happened to step. Wild case: 701 Jorge days 12-13 — home at dawn, same
// side of the door, forage start blocked on a null position.
// Before/after: the ENTER assertions fail on unfixed code (pos stays null);
// the EXIT assertions fail the same way. No state surgery beyond the
// honest door verbs and the engine's own position refresh.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('door-positions-r72');
(async () => {
 const G = await K.load({ seed: Number(process.env.SEED || 701), narration: false });
 K.newRun(G);
 const s = G.state.scholar, v = G.state.village;
 const home = { x: v.px ?? 4, y: v.py ?? 4 };
 const vid = v.roster.find(id => id !== G.villagerId && G.getPerson(id));
 if (!vid) throw Error('No living conversation target');
 // Place everyone at home, the villager inside (the hall default).
 G.map.px = home.x; G.map.py = home.y;
 v.nodePos = v.nodePos || {}; v.nodePos[vid] = { nx: home.x, ny: home.y };
 try { G.npcSetInside(vid, true); } catch (e) {}
 // ---- ENTER: player outside, inside villager positionless (the state
 // travel leaves: ensure while outside deletes other-side positions). ----
 s.insideHaven = false; s.mx = 4; s.my = 4;
 try { G.ensureVillagerPositions(); } catch (e) {}
 T.ok('setup: outside player leaves the inside villager positionless', !(v.positions || {})[vid], JSON.stringify((v.positions || {})[vid]));
 const entered = G.enterBuilding();
 T.ok('enterBuilding succeeds at the haven node', entered === true, String(entered));
 const posIn = (v.positions || {})[vid];
 T.ok('after entering, the inside villager HAS a grid position', !!(posIn && Number.isFinite(posIn.mx) && Number.isFinite(posIn.my)), JSON.stringify(posIn));
 T.ok('inside position is on the 9x9 board', !!(posIn && posIn.mx >= 0 && posIn.mx <= 8 && posIn.my >= 0 && posIn.my <= 8), JSON.stringify(posIn));
 // ---- EXIT: villager outside, player inside; exit must render outside. --
 try { G.npcSetInside(vid, false); } catch (e) {}
 // Reproduce the travel state: while inside, ensure deletes other-side
 // (outside) positions.
 try { G.ensureVillagerPositions(); } catch (e) {}
 T.ok('setup: inside player leaves the outside villager positionless', !(v.positions || {})[vid], JSON.stringify((v.positions || {})[vid]));
 const exited = G.exitBuilding();
 T.ok('exitBuilding succeeds from the hall', exited === true, String(exited));
 const posOut = (v.positions || {})[vid];
 T.ok('after exiting, the outside villager HAS a grid position', !!(posOut && Number.isFinite(posOut.mx) && Number.isFinite(posOut.my)), JSON.stringify(posOut));
 T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
