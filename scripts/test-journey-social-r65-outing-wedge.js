// test-journey-social-r65-outing-wedge.js -- PROOF for the r65 outing wedge
// (scripts/journey-social-r65-outing-wedge.js). Runs the wedge's two entry
// points against a fixture game, NOT the journey driver: build a
// forage_help favour, commit it, set dawn/Haven/adjacent, run the dawn
// start wedge, then run the outing-day wedge and assert the full path
// (start -> forage together with a split haul -> trail talk -> deliver
// -> promise kept -> pantry gain equals the split haul).
// Run with SEED=42 and SEED=7 (two separate processes; the harness is
// single-run per process). A miss here fails the wedge before any r65
// seed runs; it is not a wild-run result.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('r65-outing-wedge');
const W = require('./journey-social-r65-outing-wedge');
(async () => {
  const SEED = Number(process.env.SEED || 42);
  const G = await K.load({ seed: SEED, narration: false });
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
  T.ok('favour builds', !!(favor && favor.kind === 'forage_help'), favor && favor.task);
  G.convoStoreFavor(favor);
  const commit = G.convoFavorCommit(vid, favor);
  T.ok('commit creates the outing promise', !!(commit && commit.ok), JSON.stringify(commit));
  // Dawn, at Haven, next to the partner (tackle-outing fixture setup).
  const home = { x: v.px ?? 4, y: v.py ?? 4 };
  s.day = favor.meetDay; G.dayPart = 0;
  G.map.px = home.x; G.map.py = home.y;
  s.mx = 4; s.my = 4;
  v.nodePos = v.nodePos || {}; v.nodePos[vid] = { nx: home.x, ny: home.y };
  v.npcInside = v.npcInside || {}; v.npcInside[vid] = false; s.insideHaven = false;
  v.positions = v.positions || {}; v.positions[vid] = { mx: 4, my: 4 };
  if (v.away) delete v.away[vid];
  // The patch food must be known, or the sweep packs an unidentified lump
  // that is never split as food (tackle-outing's own caveat).
  const S = (globalThis.Scattering || {}).forage;
  let known = 0;
  try {
    for (const p of (G.data.plants || [])) {
      if ((p.caloriesPerUnit || 0) > 0 && (p.edibility || 'safe') !== 'avoid' && !/nut/i.test(p.id || '')) {
        G.state.codex.plants = G.state.codex.plants || {};
        if (!G.plantKnown(p.id)) G.state.codex.plants[p.id] = { level: 1, harvests: 0 };
        known++;
      }
    }
  } catch (e) {}
  T.ok('starting knowledge seeded for patch food', known > 0, 'known=' + known);
  const log = [], ctx = {};
  W.startWedge(G, log, ctx);
  const startRec = log.find(r => r.step === 'start');
  T.ok('dawn start wedge performs the departure', !!(startRec && startRec.ok), JSON.stringify(log));
  T.ok('outing is live after the start wedge', !!(favor.forageRun && !favor.forageRun.returned), JSON.stringify(favor.forageRun));
  const pantryBefore = G.pantryKcalLive(v);
  // Outing-day wedge: forage leg + talk + return + deliver, same call.
  // NOTE: the day wedge's forage leg needs a forageable single-hop target
  // from home; a forage-no-target record here is a wedge-scope finding
  // (single-hop search), not a game failure — but the proof bar below
  // requires the full path, so such a record fails this proof honestly.
  W.dayWedge(G, log, ctx);
  const forageRec = log.find(r => r.step === 'forage');
  T.ok('outing-day wedge forages together', !!(forageRec && forageRec.ok), JSON.stringify(log));
  T.ok('press haul is shared: partner share greater than zero', !!(forageRec && forageRec.pressPartnerKcal > 0), JSON.stringify(forageRec));
  T.ok('press haul is shared: player share greater than zero', !!(forageRec && forageRec.pressPlayerKcal > 0), JSON.stringify(forageRec));
  const talkRec = log.find(r => r.step === 'talk');
  T.ok('trail talk speaks during the outing', !!(talkRec && talkRec.ok && talkRec.line), JSON.stringify(talkRec));
  const delRec = log.find(r => r.step === 'deliver');
  T.ok('delivery performs and keeps the promise', !!(delRec && delRec.ok && delRec.promiseKept === true), JSON.stringify(delRec));
  T.ok('favour instance is fulfilled', favor.state === 'fulfilled', favor.state);
  T.ok('delivered total equals the split haul', !!(delRec && delRec.deliveredKcal === (forageRec.cumPlayerKcal + forageRec.cumPartnerKcal)), JSON.stringify(delRec) + ' vs ' + JSON.stringify(forageRec));
  T.ok('pantry gained exactly the split haul', G.pantryKcalLive(v) - pantryBefore === (delRec && delRec.deliveredKcal), 'pantryGain=' + (G.pantryKcalLive(v) - pantryBefore) + ' delivered=' + (delRec && delRec.deliveredKcal));
  T.ok('player is home after the outing-day wedge', G.map.px === home.x && G.map.py === home.y, G.map.px + ',' + G.map.py);
  console.log('--- WEDGE LOG (seed ' + SEED + ') ---');
  for (const r of log) console.log(r.step + ' d' + r.day + ' ' + (r.vidName || '') + (r.line ? ' :: ' + r.line : '') + (r.status ? ' :: ' + JSON.stringify(r.status) : ''));
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
