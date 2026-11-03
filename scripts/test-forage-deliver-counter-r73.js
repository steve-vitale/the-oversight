// R73 (journey-landing r73): a joint outing whose player share is UNPROCESSED
// food must not report "0 kcal from you" at deliver. Found on seed 803 (Jada,
// day 9): the press split 2x Elderberry each way (140 kcal yours, 140 theirs),
// but the walk home ran the homecoming block first, which stages every
// unprocessed pack item onto the kitchen counter (prep stash) — elderberry
// needs cooking, so isUnprocessed is true. The deliver step then matched the
// player share against the pack only, found nothing, and reported "You unload
// both shares: 0 kcal from you, 140 kcal from Jada". The player's food was
// not lost — it sat on the counter — but the line claimed both shares were
// unloaded while crediting the player zero, and the partner's identical
// unprocessed share went straight into the pantry. After the fix, the deliver
// match covers the counter too (without removing counter food — it is already
// home), the player's brought-home total counts, and the line names the
// counter share. The pack control and the eaten-share case are unchanged:
// finished food in the pack delivers exactly as before, and food eaten or
// dropped before home honestly shrinks what arrives.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('forage-deliver-counter-r73');
(async () => {
 const G = await K.load({ seed: Number(process.env.SEED || 803), narration: false });
 function snap() {
  return { name: 'Elderberry', plantId: 'elderberry', kcalEach: 70, units: 2,
   spoilDay: 11, foodKind: 'plant', foodState: 'ready', edible: true, needsCooking: true };
 }
 function setup(packItems, counterItems) {
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  const vid = v.roster.find(id => id !== G.villagerId && G.getPerson(id));
  if (!vid) throw Error('No living conversation target');
  // Home + adjacent: the deliver action requires both at the Haven node,
  // within one step, on the same side of the door.
  v.nodePos = v.nodePos || {};
  v.nodePos[vid] = { nx: G.map.px, ny: G.map.py };
  if (!Number.isFinite(s.mx)) s.mx = 0;
  if (!Number.isFinite(s.my)) s.my = 0;
  v.positions = v.positions || {};
  v.positions[vid] = { mx: s.mx, my: s.my };
  const favor = { id: 'favor-test-counter-1', vid, kind: 'forage_help', state: 'promised',
   forageRun: { bearer: G.villagerId, startedDay: s.day, playerHaul: [snap()],
    partnerHaul: [snap()], forageCount: 1, talked: false, talkCount: 0,
    returned: false, deliveredKcal: 0 } };
  v.favorLedger = v.favorLedger || {};
  v.favorLedger[vid] = favor;
  v.promises = v.promises || {};
  // A real commit sets goal 'feed' (keepKind 'food') and the promise day;
  // without the goal, checkPromises cannot match the food deed at all.
  v.promises[vid] = { favorId: favor.id, maker: G.villagerId, goal: 'feed', day: s.day };
  s.inventory = packItems;
  s.prepStash = counterItems;
  return { s, v, vid, favor };
 }
 function pantryKcal(v) {
  return (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
 }
 // CASE 1 — the defect: player share already staged to the counter.
 {
  const f = setup([], [snap()]);
  const before = pantryKcal(f.v);
  const act = G.forageFavorAction(f.vid, f.favor, false);
  T.ok('counter: deliver action is offered', act.action === 'forage_deliver', act.action + ' | ' + act.reason);
  const res = G.performForageFavor(f.vid, f.favor, false);
  T.ok('counter: deliver succeeds', !!(res && res.ok && res.close), JSON.stringify(res));
  T.ok('counter: line credits the player 140 (not 0 from you)', /shares: 140 kcal from you/.test(res.line) && !/(^|[^0-9])0 kcal from you/.test(res.line), res.line);
  T.ok('counter: line names the counter share', /counter/.test(res.line), res.line);
  T.ok('counter: deliveredPlayerKcal counts the counter share', f.favor.forageRun.deliveredPlayerKcal === 140, String(f.favor.forageRun.deliveredPlayerKcal));
  T.ok('counter: deliveredKcal is the full brought-home total', f.favor.forageRun.deliveredKcal === 280, String(f.favor.forageRun.deliveredKcal));
  T.ok('counter: pantry gains only the partner share', pantryKcal(f.v) - before === 140, String(pantryKcal(f.v) - before));
  T.ok('counter: counter food is not removed by deliver', (f.s.prepStash || []).length === 1 && (f.s.prepStash[0].units || 0) === 2, JSON.stringify(f.s.prepStash));
  T.ok('counter: promise kept', (f.v.promises[f.vid] || {}).kept === true, JSON.stringify(f.v.promises[f.vid]));
 }
 // CASE 2 — control: finished-style share still in the pack.
 {
  const f = setup([snap()], []);
  const before = pantryKcal(f.v);
  const res = G.performForageFavor(f.vid, f.favor, false);
  T.ok('pack: deliver succeeds', !!(res && res.ok && res.close), JSON.stringify(res));
  T.ok('pack: line has no counter clause', !/counter/.test(res.line), res.line);
  T.ok('pack: line credits 140 from you, 280 into the pantry', /140 kcal from you/.test(res.line) && /280 kcal into the pantry/.test(res.line), res.line);
  T.ok('pack: deliveredKcal is 280', f.favor.forageRun.deliveredKcal === 280, String(f.favor.forageRun.deliveredKcal));
  T.ok('pack: pantry gains both shares', pantryKcal(f.v) - before === 280, String(pantryKcal(f.v) - before));
 }
 // CASE 3 — honest shrink: share eaten/dropped before home, nowhere to match.
 {
  const f = setup([], []);
  const res = G.performForageFavor(f.vid, f.favor, false);
  T.ok('eaten: deliver succeeds', !!(res && res.ok && res.close), JSON.stringify(res));
  T.ok('eaten: line honestly reports 0 from you, no counter claim', /0 kcal from you/.test(res.line) && !/counter/.test(res.line), res.line);
  T.ok('eaten: deliveredPlayerKcal is 0', f.favor.forageRun.deliveredPlayerKcal === 0, String(f.favor.forageRun.deliveredPlayerKcal));
  T.ok('eaten: partner share still delivers, promise kept', f.favor.forageRun.deliveredKcal === 140 && (f.v.promises[f.vid] || {}).kept === true, String(f.favor.forageRun.deliveredKcal));
 }
 T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
