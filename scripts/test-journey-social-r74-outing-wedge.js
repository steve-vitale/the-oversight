// test-journey-social-r74-outing-wedge.js -- PROOF for the r74 outing
// wedge (scripts/journey-social-r74-outing-wedge.js). Fixture game, not
// the journey driver. Run with SEED=42 and SEED=7 (separate processes).
// Cases, in order, on one committed forage_help favour:
//   A-C: r73 start behavior UNCHANGED (node-elsewhere / micro-far block,
//   adjacent starts, diag classes identical).
//   D: RAW kept — dawnDiag and favorEndStates report a 'broken' promise
//   as the string 'broken', never coerced true; keptRaw(null) is null.
//   E: barrenKind — (0,3)=travel-blocked, (2,3)=node-barren, (0,0)=no-target.
//   F: STUCK ESCALATION — a live outing with stuckDays=7 at home with an
//   adjacent partner ends via the game's forage_end action, logged
//   'outing-ended-stuck', favor returned.
//   G: walkToNode — stepping to the current tile succeeds, and a 1-step
//   travel target (when the fixture map offers one) is reached on foot.
// A miss here fails the wedge before any r74 seed runs.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('r74-outing-wedge');
const W = require('./journey-social-r74-outing-wedge');
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
  // Case B: partner node at home but micro-far.
  v.nodePos[vid] = { nx: home.x, ny: home.y };
  v.positions[vid] = { mx: 0, my: 0 };
  log = [];
  W.startWedge(G, log, {});
  blocked = log.find(r => r.step === 'start-blocked');
  T.ok('B: micro-far blocks the start', !!blocked, JSON.stringify(log));
  T.ok('B: diag classifies micro-far', !!(blocked && blocked.diag && blocked.diag.adjFail === 'micro-far'), JSON.stringify(blocked && blocked.diag));
  // Case C: partner adjacent -> start performs, diag adjacent-ok.
  v.positions[vid] = { mx: 4, my: 4 };
  log = [];
  W.startWedge(G, log, {});
  const startRec = log.find(r => r.step === 'start');
  T.ok('C: adjacent start performs', !!(startRec && startRec.ok), JSON.stringify(log));
  T.ok('C: diag classifies adjacent-ok', !!(startRec && startRec.diag && startRec.diag.adjFail === 'adjacent-ok'), JSON.stringify(startRec && startRec.diag));
  T.ok('C: outing is live after start', !!(favor.forageRun && !favor.forageRun.returned), JSON.stringify(favor.forageRun));
  // Case D: RAW kept.
  T.ok('D: keptRaw(true) is true', W.keptRaw({ kept: true }) === true);
  T.ok('D: keptRaw(false) is false', W.keptRaw({ kept: false }) === false);
  T.ok('D: keptRaw broken string is NOT coerced true', W.keptRaw({ kept: 'broken' }) === 'broken');
  T.ok('D: keptRaw(null promise) is null', W.keptRaw(null) === null);
  const savedKept = (v.promises || {})[vid] ? v.promises[vid].kept : undefined;
  try { if (v.promises && v.promises[vid]) v.promises[vid].kept = 'broken'; } catch (e) {}
  const dDiag = W.dawnDiag(G, vid, favor, null);
  T.ok('D: dawnDiag reports broken raw', dDiag.promiseKept === 'broken', JSON.stringify(dDiag));
  const es = W.favorEndStates(G).find(e => e.favorId === favor.id);
  T.ok('D: favorEndStates reports broken raw', !!(es && es.promiseKept === 'broken'), JSON.stringify(es));
  try { if (v.promises && v.promises[vid]) v.promises[vid].kept = savedKept; } catch (e) {}
  // Case E: barrenKind.
  T.ok('E: barrenKind(0,3) travel-blocked', W.barrenKind(0, 3) === 'travel-blocked');
  T.ok('E: barrenKind(2,3) node-barren', W.barrenKind(2, 3) === 'node-barren');
  T.ok('E: barrenKind(0,0) no-target', W.barrenKind(0, 0) === 'no-target');
  T.ok('E: STUCK_DAYS is 7', W.STUCK_DAYS === 7);
  // Case F: stuck escalation at home, adjacent partner.
  v.nodePos[vid] = { nx: home.x, ny: home.y };
  v.positions[vid] = { mx: 4, my: 4 };
  G.map.px = home.x; G.map.py = home.y;
  s.mx = 4; s.my = 4;
  const ctxF = { stuckDays: {} }; ctxF.stuckDays[favor.id] = 7;
  log = [];
  W.dayWedge(G, log, ctxF);
  const ended = log.find(r => r.step === 'outing-ended-stuck');
  T.ok('F: stuck outing ends via forage_end', !!(ended && ended.ok), JSON.stringify(log));
  T.ok('F: favor returned after escalation', !!(favor.forageRun && favor.forageRun.returned), JSON.stringify(favor.forageRun));
  T.ok('F: stuck counter cleared after end', !(ctxF.stuckDays && ctxF.stuckDays[favor.id]), JSON.stringify(ctxF.stuckDays));
  // Case G: walkToNode.
  const here = W.walkToNode(G, G.map.px, G.map.py, 16);
  T.ok('G: walkToNode to current tile succeeds', here.ok === true && here.pathFound === true, JSON.stringify(here));
  let oneStep = null;
  try {
    for (const tt of (G.travelTargets() || [])) {
      if (Math.max(Math.abs(tt.x - G.map.px), Math.abs(tt.y - G.map.py)) === 1) { oneStep = tt; break; }
    }
  } catch (e) {}
  if (oneStep) {
    const w = W.walkToNode(G, oneStep.x, oneStep.y, 16);
    T.ok('G: walkToNode reaches a 1-step target on foot', w.ok === true && G.map.px === oneStep.x && G.map.py === oneStep.y, JSON.stringify(w));
  } else {
    T.ok('G: no 1-step travel target on this fixture map (walk shape still proven by current-tile case)', true, 'no 1-step target');
  }
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
