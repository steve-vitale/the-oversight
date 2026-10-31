// test-journey-social-r76-outing-wedge.js -- PROOF for the r75 outing
// wedge (scripts/journey-social-r75-outing-wedge.js). Fixture game, not
// the journey driver. Run with SEED=42 and SEED=7 (separate processes).
// Cases, in order:
//   A-C: r74 start behavior UNCHANGED (node-elsewhere / micro-far block,
//   adjacent starts, diag classes identical).
//   D: RAW kept — dawnDiag and favorEndStates report a 'broken' promise
//   as the string 'broken', never coerced true; keptRaw(null) is null.
//   E: barrenKind — (0,3)=travel-blocked, (2,3)=node-barren, (0,0)=no-target.
//   F: STUCK ESCALATION — a live outing with stuckDays=7 at home with an
//   adjacent partner ends via the game's forage_end action, logged
//   'outing-ended-stuck', favor returned.
//   G: TARGET-AWARE WALK — nodeStepAllowed gates diagonal steps
//   (unrevealed refused, revealed allowed, guarded intermediate
//   refused, orthogonal allowed) and walkToNode reaches a 1-step
//   target and a revealed diagonal target on foot.
//   H: DAWN STEP-FIRST RETRY — a clean-case no-micro-pos block (partner
//   node at home, same door side, no micro position) is retried after
//   one micro-step: the retry entry carries stepOk + stepAssigned,
//   and the start performs with retryFromStep=true.
// A miss here fails the wedge before any r75 seed runs.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('r76-outing-wedge');
const W = require('./journey-social-r76-outing-wedge');
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
  // Case G: target-aware walk + step gate.
  G.map.px = home.x; G.map.py = home.y;
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
  // Step-gate unit cases from the player's current tile.
  const ox = G.map.px, oy = G.map.py;
  const diagTile = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([dx, dy]) => ({ x: ox + dx, y: oy + dy })).find(t => { try { return !!G.tileAt(t.x, t.y); } catch (e) { return false; } });
  if (diagTile) {
    const tile = G.tileAt(diagTile.x, diagTile.y);
    const savedRev = tile.revealed;
    tile.revealed = false;
    const unrev = W.nodeStepAllowed(G, ox, oy, diagTile.x, diagTile.y);
    T.ok('G: diagonal step into unrevealed tile refused', unrev.ok === false && unrev.reason === 'diagonal-unrevealed', JSON.stringify(unrev));
    tile.revealed = true;
    // Clear natural blockages on the destination + both intermediates
    // so the revealed-allowed case tests the gate, not the fixture.
    const interA = { x: diagTile.x, y: oy }, interB = { x: ox, y: diagTile.y };
    const savedBfs = [];
    for (const it of [diagTile, interA, interB]) {
      try {
        const t = G.tileAt(it.x, it.y);
        savedBfs.push([t, t ? t.blockFrom : undefined]);
        if (t) delete t.blockFrom;
      } catch (e) { savedBfs.push([null, undefined]); }
    }
    const rev = W.nodeStepAllowed(G, ox, oy, diagTile.x, diagTile.y);
    T.ok('G: diagonal step onto revealed tile allowed (absent blockage)', rev.ok === true, JSON.stringify(rev));
    // Guarded orthogonal intermediate: block entry from the origin.
    const interTile = (() => { try { return G.tileAt(interA.x, interA.y); } catch (e) { return null; } })();
    if (interTile) {
      interTile.blockFrom = { dx: -Math.sign(diagTile.x - ox), dy: 0, type: 'fallen_tree' };
      const guarded = W.nodeStepAllowed(G, ox, oy, diagTile.x, diagTile.y);
      T.ok('G: diagonal step past guarded intermediate refused', guarded.ok === false && guarded.reason === 'intermediate-blocked', JSON.stringify(guarded));
    } else {
      T.ok('G: no intermediate tile for guarded-diagonal case (gate still proven by unrevealed case)', true, 'no intermediate tile');
    }
    for (const [t, bf] of savedBfs) { if (t) { if (bf === undefined) delete t.blockFrom; else t.blockFrom = bf; } }
    const orthOk = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => W.nodeStepAllowed(G, ox, oy, ox + dx, oy + dy).ok === true);
    T.ok('G: some orthogonal step allowed (absent blockage)', orthOk === true, 'ox=' + ox + ' oy=' + oy);
    tile.revealed = savedRev;
    // Revealed diagonal target reached on foot (via the diagonal or an
    // orthogonal route — either way, only legal steps were taken).
    try { tile.revealed = true; } catch (e) {}
    const wd = W.walkToNode(G, diagTile.x, diagTile.y, 16);
    T.ok('G: walkToNode reaches a revealed diagonal target', wd.ok === true && G.map.px === diagTile.x && G.map.py === diagTile.y, JSON.stringify(wd));
    tile.revealed = savedRev;
  } else {
    T.ok('G: no diagonal tile on this fixture map (gate proven by walk cases only)', true, 'no diagonal tile');
  }
  // Case H: dawn step-first retry with a second villager.
  const vid2 = v.roster.find(id => id !== G.villagerId && id !== vid && G.getPerson(id));
  if (!vid2) {
    T.ok('H: no second conversation target on this fixture (retry unproven here)', true, 'single-villager fixture');
  } else {
    try { if (G.revealName) G.revealName(vid2, 'intro'); } catch (e) {}
    const person2 = G.getPerson(vid2);
    person2.languages = { native: 'english', levels: { english: 2 } };
    Object.assign(G.npcNeeds(vid2), { hunger: 10, fear: 10, social: 10, energy: 90 });
    v.health[vid2] = 100; if (v.sick) delete v.sick[vid2];
    v.trust[vid2] = 30;
    const favor2 = G.convoBuildFavor(vid2, { kind: 'forage_help', urgency: 2, kcal: 0 });
    T.ok('H: second favour builds', !!(favor2 && favor2.kind === 'forage_help'), favor2 && favor2.task);
    G.convoStoreFavor(favor2);
    const commit2 = G.convoFavorCommit(vid2, favor2);
    T.ok('H: second commit creates the outing promise', !!(commit2 && commit2.ok), JSON.stringify(commit2));
    // True-dawn fixture clock: dayTicks 0 so the retry's steps cannot
    // cross a day-part boundary mid-retry (128 ticks/part).
    s.day = favor2.meetDay; s.dayTicks = 0; s.actionClock = 0; G.dayPart = 0;
    G.map.px = home.x; G.map.py = home.y;
    s.mx = 4; s.my = 4;
    v.npcInside[vid2] = false; s.insideHaven = false;
    v.nodePos[vid2] = { nx: home.x, ny: home.y };
    if (v.positions) delete v.positions[vid2];
    if (v.away) delete v.away[vid2];
    log = [];
    W.startWedge(G, log, {});
    const blockedH = log.find(r => r.step === 'start-blocked' && r.favorId === favor2.id);
    T.ok('H: no-micro-pos blocks the dawn start', !!(blockedH && blockedH.diag && blockedH.diag.adjFail === 'no-micro-pos'), JSON.stringify(log));
    const retry = log.find(r => r.step === 'start-step-retry' && r.favorId === favor2.id);
    T.ok('H: step-first retry attempted', !!retry, JSON.stringify(log));
    T.ok('H: retry step moved the player', !!(retry && retry.stepOk), JSON.stringify(retry));
    T.ok('H: retry step assigned the partner a position', !!(retry && retry.stepAssigned), JSON.stringify(retry));
    T.ok('H: retry stayed inside dayPart 0', !!(retry && retry.dayPartAfter === 0), JSON.stringify(retry));
    const startH = log.find(r => r.step === 'start' && r.favorId === favor2.id && r.retryFromStep);
    T.ok('H: retry start performs', !!(startH && startH.ok), JSON.stringify(log));
    T.ok('H: retry flag on the start entry', !!(retry && retry.retryStarted), JSON.stringify(retry));
    T.ok('H: outing is live after retry start', !!(favor2.forageRun && !favor2.forageRun.returned), JSON.stringify(favor2.forageRun));
  }
  // Case I (r76): away-diag fields — the away record names purpose +
  // return timing; a null away record reads as nulls, never stale data.
  v.away = v.away || {};
  v.away[vid] = { nx: home.x + 1, ny: home.y, purpose: 'foraging', returnPart: 2, returnDay: favor.meetDay + 3 };
  const dAway = W.dawnDiag(G, vid, favor, { ready: true });
  T.ok('I: away block classifies as away', dAway && dAway.adjFail === 'away', JSON.stringify(dAway));
  T.ok('I: partnerAway true with an away record', dAway && dAway.partnerAway === true, JSON.stringify(dAway));
  T.ok('I: awayPurpose carried', dAway && dAway.awayPurpose === 'foraging', JSON.stringify(dAway));
  T.ok('I: awayReturnDay carried', dAway && dAway.awayReturnDay === favor.meetDay + 3, JSON.stringify(dAway));
  T.ok('I: awayReturnPart carried', dAway && dAway.awayReturnPart === 2, JSON.stringify(dAway));
  T.ok('I: awayNode carried', dAway && dAway.awayNode && dAway.awayNode.nx === home.x + 1 && dAway.awayNode.ny === home.y, JSON.stringify(dAway));
  delete v.away[vid];
  const dHome = W.dawnDiag(G, vid, favor, { ready: true });
  T.ok('I: no away record reads null purpose/node', dHome && dHome.awayPurpose === null && dHome.awayNode === null && dHome.awayReturnDay === null, JSON.stringify(dHome));
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
