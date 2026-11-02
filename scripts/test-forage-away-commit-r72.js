// R72 (journey-landing r72): presence-requiring favors cannot be promised
// to an away villager. Before the fix, convoFavorCommit created a tracked
// outing promise to a villager out on expedition; the promise's only keep
// path needs the partner home at dawn on the single meet day, so it rotted
// on the player (-15 trust) for the partner's own absence — 701 Arun: away
// days 2-14, promised day 10, meet dawn day 11 spent away. After the fix,
// commit to an away villager is refused with an honest road line, no
// promise is created, and the favor stays 'asked'; the home control still
// commits. Covers all three presence kinds (forage_help, water_haul,
// stay_close) through the public commit path only.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('forage-away-commit-r72');
(async () => {
 const G = await K.load({ seed: Number(process.env.SEED || 701), narration: false });
 function fresh() {
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  const vid = v.roster.find(id => id !== G.villagerId && G.getPerson(id));
  if (!vid) throw Error('No living conversation target');
  const person = G.getPerson(vid);
  person.languages = { native: 'english', levels: { english: 2 } };
  s.languages = { english: 2 };
  Object.assign(G.npcNeeds(vid), { hunger: 10, fear: 10, social: 10, energy: 90 });
  v.health = v.health || {}; v.health[vid] = 100; v.sick = v.sick || {}; delete v.sick[vid];
  v.trust = v.trust || {}; v.trust[vid] = 30; s.kcal = 50000;
  if (v.away) delete v.away[vid];
  if (v.promises) delete v.promises[vid];
  return { s, v, vid };
 }
 const CASES = [
   { kind: 'forage_help', need: { kind: 'forage_help', urgency: 2, kcal: 0 } },
   { kind: 'water_haul', need: { kind: 'water_haul', urgency: 2, water: 3 } },
   { kind: 'stay_close', need: { kind: 'stay_close', urgency: 2, fear: 90 } },
 ];
 for (const c of CASES) {
  const f = fresh();
  const favor = G.convoBuildFavor(f.vid, c.need);
  T.ok(c.kind + ': favor builds from a real need', !!(favor && favor.kind === c.kind), favor && favor.task);
  if (!favor) throw Error('No favor for ' + c.kind);
  G.convoStoreFavor(favor);
  T.ok(c.kind + ': stored favor is asked', favor.state === 'asked', favor.state);
  // AWAY: the 701 Arun shape — out on expedition, days from home.
  f.v.away = f.v.away || {};
  f.v.away[f.vid] = { nx: 8, ny: 8, purpose: 'expedition', sinceDay: (f.s.day || 1), sincePart: 0, duration: 20 };
  const refused = G.convoFavorCommit(f.vid, favor);
  T.ok(c.kind + ': commit to an away villager is refused', !!(refused && refused.ok === false), JSON.stringify(refused));
  T.ok(c.kind + ': refusal names the road (away guard, not another gate)', !!(refused && refused.away === true && /road|miles away/.test(refused.line || '')), JSON.stringify(refused));
  T.ok(c.kind + ': refusal creates no promise', !(f.v.promises || {})[f.vid], JSON.stringify((f.v.promises || {})[f.vid]));
  T.ok(c.kind + ': favor stays asked after refusal', favor.state === 'asked', favor.state);
  // HOME CONTROL: the same favor commits once the villager is back.
  delete f.v.away[f.vid];
  const committed = G.convoFavorCommit(f.vid, favor);
  T.ok(c.kind + ': commit succeeds once the villager is home', !!(committed && committed.ok), JSON.stringify(committed));
  const p = (f.v.promises || {})[f.vid];
  T.ok(c.kind + ': home commit creates the tracked promise', !!(p && !p.kept && p.favorId === favor.id), JSON.stringify(p));
  T.ok(c.kind + ': home commit moves the favor to promised', favor.state === 'promised', favor.state);
 }
 T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
