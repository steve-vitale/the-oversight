// test-journey-social-r73-outing-wedge.js -- PROOF for the r73 outing
// wedge diagnostics (scripts/journey-social-r73-outing-wedge.js).
// The r73 wedge must behave EXACTLY like the r65 wedge (same start /
// block decisions) and additionally attach a `diag` to every dawn
// entry that classifies the adjacent() failure. Fixture game, not
// the journey driver. Run with SEED=42 and SEED=7 (separate
// processes; the harness is single-run per process).
// Cases, in order, on one committed forage_help favour:
//   A: partner node elsewhere -> start-blocked, adjFail node-elsewhere.
//   B: partner node at home but micro-far -> start-blocked, adjFail micro-far.
//   C: partner adjacent -> start performs, diag adjFail adjacent-ok.
// A miss here fails the wedge diagnostics before any r73 seed runs.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('r73-outing-wedge');
const W = require('./journey-social-r73-outing-wedge');
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
  const favor = G.convoBuildFavor(vid, { kind: 'forage_help', urgency: 2, kcal: 0 });
  T.ok('favour builds', !!(favor && favor.kind === 'forage_help'), favor && favor.task);
  G.convoStoreFavor(favor);
  const commit = G.convoFavorCommit(vid, favor);
  T.ok('commit creates the outing promise', !!(commit && commit.ok), JSON.stringify(commit));
  const home = { x: v.px ?? 4, y: v.py ?? 4 };
  s.day = favor.meetDay; G.dayPart = 0;
  G.map.px = home.x; G.map.py = home.y;
  s.mx = 4; s.my = 4;
  v.npcInside = v.npcInside || {}; v.npcInside[vid] = false; s.insideHaven = false;
  v.positions = v.positions || {};
  if (v.away) delete v.away[vid];
  const diagOk = (d) => !!(d && d.playerMap && d.home && d.partnerNode && 'partnerAway' in d &&
    'partnerPos' in d && d.scholarPos && d.dayPart === 0 && d.meetDay === favor.meetDay &&
    typeof d.deadline === 'number' && d.promiseKept === false && d.favorState === 'promised');
  // Case A: partner node elsewhere.
  v.nodePos = v.nodePos || {};
  v.nodePos[vid] = { nx: home.x === 8 ? 7 : home.x + 1, ny: home.y };
  v.positions[vid] = { mx: 4, my: 4 };
  let log = [];
  W.startWedge(G, log, {});
  let blocked = log.find(r => r.step === 'start-blocked');
  T.ok('A: node-elsewhere blocks the start', !!blocked, JSON.stringify(log));
  T.ok('A: no start performed', !log.some(r => r.step === 'start'), JSON.stringify(log));
  T.ok('A: diag classifies node-elsewhere', !!(blocked && blocked.diag && blocked.diag.adjFail === 'node-elsewhere'), JSON.stringify(blocked && blocked.diag));
  T.ok('A: diag carries dawn positions', !!(blocked && diagOk(blocked.diag)), JSON.stringify(blocked && blocked.diag));
  T.ok('A: diag player at home, partner node away', !!(blocked && blocked.diag.playerAtHome === true && blocked.diag.partnerNodeAtHome === false), JSON.stringify(blocked && blocked.diag));
  // Case B: partner node at home but micro-far.
  v.nodePos[vid] = { nx: home.x, ny: home.y };
  v.positions[vid] = { mx: 0, my: 0 };
  log = [];
  W.startWedge(G, log, {});
  blocked = log.find(r => r.step === 'start-blocked');
  T.ok('B: micro-far blocks the start', !!blocked, JSON.stringify(log));
  T.ok('B: diag classifies micro-far', !!(blocked && blocked.diag && blocked.diag.adjFail === 'micro-far'), JSON.stringify(blocked && blocked.diag));
  T.ok('B: diag carries dawn positions', !!(blocked && diagOk(blocked.diag)), JSON.stringify(blocked && blocked.diag));
  // Case C: partner adjacent -> start performs, diag adjacent-ok.
  v.positions[vid] = { mx: 4, my: 4 };
  log = [];
  W.startWedge(G, log, {});
  const startRec = log.find(r => r.step === 'start');
  T.ok('C: adjacent start performs', !!(startRec && startRec.ok), JSON.stringify(log));
  T.ok('C: diag classifies adjacent-ok', !!(startRec && startRec.diag && startRec.diag.adjFail === 'adjacent-ok'), JSON.stringify(startRec && startRec.diag));
  T.ok('C: outing is live after start', !!(favor.forageRun && !favor.forageRun.returned), JSON.stringify(favor.forageRun));
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
