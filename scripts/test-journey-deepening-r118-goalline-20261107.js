'use strict';
// test-journey-deepening-r118-goalline-20261107.js -- R118 Q2 proof.
// (1) CHORE BEAT (fix E): a safety-top villager on a HAVEN_CHORE objective
//     carrying the safety goalLine speaks the line at the indoor chore
//     beat — the spoken line ends with the goalLine.
// (2) VISIT BEAT (fix E): the same, at the indoor VISIT beat (a quiet
//     talk at home with a villager who is actually there).
// (3) NO-LINE CONTROL: with no goalLine on the objective, the beat speaks
//     the ambient line unchanged — no trailing space, no 'undefined'.
// (4) FINDS FALLBACK (fix E): the teach chore with no learner in earshot
//     reviews its finds and the line carries the goalLine.
// RED/FAILURE MODE: (1)/(2)/(4) fail while objTick's indoor beats speak
// the ambient line alone (the goalLine never reaches the log the
// goalLineDays counter reads); (3) fails if the append ever fires on a
// null goalLine.
const K = require('./godpath/lib');
const T = K.reporter('R118 indoor goal-line channel (engine)');
const SAFETY_LINE = 'Better close to the fire today.';

(async () => {
  const G = await K.load({ seed: 11808 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  K.newRun(G);
  const v = G.state.village, s = G.state.scholar;
  s.day = 45; s.dayTicks = 0; G.dayPart = 1; // NOT dawn: no objPick re-pick (which resets goalLine)
  s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4;
  v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py; // player at haven
  v.away = {}; v.engaged = {};
  const roster = (v.roster || []).filter(id => id !== G.villagerId && !G.getPerson(id).dead);
  T.ok('setup: roster has at least 4 living villagers besides the scholar', roster.length >= 4, 'roster=' + roster.length);
  const [vidChore, vidVisit, vidTarget, vidTeach] = roster;
  // Everyone else: idle objectives so no other beat drowns the capture.
  for (const id of roster) {
    const o = G.objOf(id);
    o.kind = 'idle'; o.state = 'idle'; o.indoor = false; o.goal = null; o.goalLine = null; o.partsLeft = null;
  }
  // (1) the chore villager: safety HAVEN_CHORE with the goalLine attached
  // (the attachment is vgoalBiasCands' job, proven elsewhere — this test
  // proves the BEAT speaks it).
  const oC = G.objOf(vidChore);
  oC.kind = 'HAVEN_CHORE'; oC.purpose = 'chore'; oC.state = 'indoor'; oC.indoor = true;
  oC.chore = 'sweep'; oC.goal = 'safety'; oC.goalLine = SAFETY_LINE; oC.partsLeft = null;
  try { if (G.npcSetInside) G.npcSetInside(vidChore, true); } catch (e) {}
  // (2) the visit villager: safety VISIT with the goalLine attached, its
  // target actually at haven.
  const oV = G.objOf(vidVisit);
  oV.kind = 'VISIT'; oV.purpose = 'visit'; oV.state = 'indoor'; oV.indoor = true;
  oV.targetVid = vidTarget; oV.goal = 'safety'; oV.goalLine = SAFETY_LINE; oV.partsLeft = null;
  try { if (G.npcSetInside) G.npcSetInside(vidVisit, true); } catch (e) {}
  try { if (G.npcSetInside) G.npcSetInside(vidTarget, true); } catch (e) {}
  const nmChore = G.displayName(vidChore);
  const nmVisit = G.displayName(vidVisit);
  // Capture every spoken line (say() is the capture the goalLineDays
  // counter reads in the wild).
  const said = [];
  const _say = G.say.bind(G);
  G.say = function (line) { said.push(String(line)); return _say.apply(this, arguments); };
  // The indoor beat fires only ~22% of day-parts per villager (R() < 0.22
  // gate), so tick until both beats have spoken or the budget is spent.
  let choreLines = [], visitLines = [];
  for (let i = 0; i < 60 && (choreLines.length === 0 || visitLines.length === 0); i++) {
    said.length = 0;
    try { G.objTick(); } catch (e) { T.ok('objTick call ' + i + ' throws', false, String(e && e.message)); break; }
    for (const line of said) {
      if (line.indexOf(nmChore) >= 0 && /sweeping|broom|ash and grit|corners/.test(line)) choreLines.push(line);
      if (line.indexOf(nmVisit) >= 0 && /sitting with|hunched over the fire|with .*talking|ear — quiet talk/.test(line)) visitLines.push(line);
    }
  }
  T.ok('Q2 engine (1) the chore beat spoke at least once', choreLines.length >= 1,
    'choreLines=' + choreLines.length + ' (nm=' + JSON.stringify(nmChore) + ')');
  T.ok('Q2 engine (1) the chore line ends with the safety goalLine (fix E)',
    choreLines.length >= 1 && choreLines.some(l => l.endsWith(SAFETY_LINE)),
    JSON.stringify(choreLines.slice(0, 2)));
  T.ok('Q2 engine (2) the visit beat spoke at least once', visitLines.length >= 1,
    'visitLines=' + visitLines.length + ' (nm=' + JSON.stringify(nmVisit) + ')');
  T.ok('Q2 engine (2) the visit line ends with the safety goalLine (fix E)',
    visitLines.length >= 1 && visitLines.some(l => l.endsWith(SAFETY_LINE)),
    JSON.stringify(visitLines.slice(0, 2)));
  // (3) NO-LINE CONTROL: strip the goalLine, re-tick, the beat speaks the
  // ambient line alone.
  oC.goalLine = null; oC.goal = null;
  oV.goalLine = null; oV.goal = null;
  let controlChore = [], controlVisit = [];
  for (let i = 0; i < 60 && (controlChore.length === 0 || controlVisit.length === 0); i++) {
    said.length = 0;
    try { G.objTick(); } catch (e) { break; }
    for (const line of said) {
      if (line.indexOf(nmChore) >= 0 && /sweeping|broom|ash and grit|corners/.test(line)) controlChore.push(line);
      if (line.indexOf(nmVisit) >= 0 && /sitting with|hunched over the fire|with .*talking|ear — quiet talk/.test(line)) controlVisit.push(line);
    }
  }
  const controlBad = controlChore.concat(controlVisit).filter(l => /undefined/.test(l) || l.endsWith(SAFETY_LINE) || /\s$/.test(l));
  T.ok('Q2 engine (3) no goalLine, no trailing space, no undefined in the control lines',
    controlChore.length >= 1 && controlVisit.length >= 1 && controlBad.length === 0,
    'controlChore=' + JSON.stringify(controlChore.slice(0, 1)) + ' controlVisit=' + JSON.stringify(controlVisit.slice(0, 1)) + ' bad=' + JSON.stringify(controlBad));
  // (4) FINDS FALLBACK: the teach chore with no learner in earshot
  // reviews its finds — and the line carries the goalLine. Deterministic:
  // move every other roster villager's node away from haven, so the teach
  // branch finds no learner here and takes the finds path.
  const oT = G.objOf(vidTeach);
  oT.kind = 'HAVEN_CHORE'; oT.purpose = 'chore'; oT.state = 'indoor'; oT.indoor = true;
  oT.chore = 'teach'; oT.goal = 'safety'; oT.goalLine = SAFETY_LINE; oT.partsLeft = null;
  try { if (G.npcSetInside) G.npcSetInside(vidTeach, true); } catch (e) {}
  for (const id of roster) {
    if (id === vidTeach) continue;
    try { if (G.npcSetNode) G.npcSetNode(id, (v.px ?? 4) + 2, (v.py ?? 4) + 2); } catch (e) {}
  }
  const nmTeach = G.displayName(vidTeach);
  let findsLines = [];
  for (let i = 0; i < 60 && findsLines.length === 0; i++) {
    said.length = 0;
    try { G.objTick(); } catch (e) { break; }
    for (const line of said) {
      if (line.indexOf(nmTeach) >= 0 && /finds|re-tying|re-packing|sorting their finds/.test(line)) findsLines.push(line);
    }
  }
  T.ok('Q2 engine (4) the finds fallback spoke at least once', findsLines.length >= 1,
    'findsLines=' + findsLines.length + ' (nm=' + JSON.stringify(nmTeach) + ')');
  T.ok('Q2 engine (4) the finds line ends with the safety goalLine (fix E)',
    findsLines.length >= 1 && findsLines.some(l => l.endsWith(SAFETY_LINE)), JSON.stringify(findsLines.slice(0, 2)));
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
