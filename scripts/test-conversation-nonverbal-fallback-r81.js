// test-conversation-nonverbal-fallback-r81.js -- PROOF for the r81
// nonverbal fallback (src/js/conversation.js sayLine): a blocked beat
// inside a nonverbal conversation falls back to unquoted gesture
// narration, never to the English deflection pool. Run with SEED=42
// and SEED=7 (separate processes). Fixture game, not the journey
// driver. Cases:
//   A: a no-shared-language villager opens nonverbal (thread).
//   B: a run-ledger-blocked beat in that convo returns gesture
//      narration: unquoted, in the nonverbal pool, NOT a deflection
//      line (convoIsDeflectionLine false).
//   C: three consecutive run-blocked beats cycle three DISTINCT
//      narration lines (no verbatim parrot).
//   D: a within-sitting self-repeat with no caller fallback in a
//      nonverbal convo returns gesture narration, not null.
//   E (control): the same run-block in a SHARED-language convo
//      still returns an English deflection line from the pool.
// A miss here fails the fix before any r81 seed re-runs.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('r81-nonverbal-fallback');
const NV_POOL = [
  'They spread their hands, smiling — the words are missing, but the meaning lands anyway.',
  'A gesture, patient and clear: palms up, then toward you.',
  'They nod along, following your hands more than your words.',
  'A shrug and a grin — some things need no translation.',
  'They point, mime, and laugh softly at the gap between your tongues.',
  'Hands sketch the thought in the air; you catch the shape of it, if not the words.',
];
(async () => {
  const SEED = Number(process.env.SEED || 42);
  const G = await K.load({ seed: SEED, narration: false });
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  s.languages = { english: 2 };
  const living = (v.roster || []).filter(id => id !== G.villagerId && G.getPerson(id));
  if (living.length < 2) throw Error('Need two living conversation targets');
  const [vid, vidV] = living;
  // A: no-shared-language villager opens nonverbal.
  const person = G.getPerson(vid);
  person.languages = { native: 'french', levels: { french: 2 } };
  const personV = G.getPerson(vidV);
  personV.languages = { native: 'english', levels: { english: 2 } };
  const st = G.startConvo(vid);
  const c = G.convoGet(vid);
  T.ok('A: no-shared-language convo opens nonverbal', c.thread === 'nonverbal', 'thread=' + c.thread + ' start=' + JSON.stringify(st && st.line));
  // B: run-blocked beat -> gesture narration, not English deflection.
  const ledger = G.convoRunLedger();
  const lineB = 'They speak, and you understand none of it';
  const keyB = G.convoSplitBeats(lineB)[0].trim();
  ledger.push(keyB);
  const outB = G.sayLine(vid, lineB, { foreign: 'french' });
  T.ok('B: run-blocked nonverbal beat returns a line', !!outB, JSON.stringify(outB));
  T.ok('B: fallback is gesture narration from the pool', NV_POOL.indexOf(outB) >= 0, JSON.stringify(outB));
  T.ok('B: fallback is unquoted narration, not speech', !(outB || '').startsWith('"'), JSON.stringify(outB));
  T.ok('B: fallback is NOT a deflection line', !G.convoIsDeflectionLine(outB), JSON.stringify(outB));
  // C: three more run-blocked beats -> three distinct narration lines.
  const outs = [];
  for (let i = 0; i < 3; i++) {
    const li = 'A shared gesture beat number ' + (i + 1) + ' for the run ledger';
    ledger.push(G.convoSplitBeats(li)[0].trim());
    outs.push(G.sayLine(vid, li, { foreign: 'french' }));
  }
  T.ok('C: three blocked beats give three narration lines', outs.every(o => NV_POOL.indexOf(o) >= 0), JSON.stringify(outs));
  T.ok('C: no verbatim parrot across the three', new Set(outs).size === 3, JSON.stringify(outs));
  // D: within-sitting self-repeat with no caller fallback -> narration, not null.
  const lineD = 'A fresh sitting line that will repeat within this convo';
  const firstD = G.sayLine(vid, lineD, { foreign: 'french' });
  T.ok('D: first telling lands', firstD === lineD, JSON.stringify(firstD));
  const secondD = G.sayLine(vid, lineD, { foreign: 'french' });
  T.ok('D: self-repeat in nonverbal returns narration, not null', NV_POOL.indexOf(secondD) >= 0, JSON.stringify(secondD));
  // E (control): shared-language convo, same run-block -> English deflection.
  try { if (G.endConvo) G.endConvo(vid, 'left'); } catch (e) {}
  G.startConvo(vidV);
  const cV = G.convoGet(vidV);
  T.ok('E: shared-language convo is NOT nonverbal', cV.thread !== 'nonverbal', 'thread=' + cV.thread);
  const lineE = 'A verbal beat that another villager said recently';
  ledger.push(G.convoSplitBeats(lineE)[0].trim());
  const outE = G.sayLine(vidV, lineE);
  const pool9 = G.convoDeflectionLines().slice(0, 9);
  T.ok('E: run-blocked verbal beat returns an English deflection line', pool9.indexOf(outE) >= 0, JSON.stringify(outE));
  T.ok('E: verbal deflection IS a deflection line', G.convoIsDeflectionLine(outE), JSON.stringify(outE));
  try { if (G.endConvo) G.endConvo(vidV, 'left'); } catch (e) {}
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
