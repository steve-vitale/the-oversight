// test-betrayal-nonverbal-gate-20261031.js -- PROOF for the r78 language-barrier
// gate fix (src/js/betrayal.js betrayalChoices): in a no-shared-words
// conversation with no interpreter present, the case menu (press / site /
// witnesses / investigate / moot / letlie / expose / bribe / votes) must
// NOT be offered — the game itself states the barrier as total, and the
// case-framing line already skips nonverbal threads. Ambush survival and
// invitation picks are untouched by the gate. With an interpreter present
// (convo.interpreter set, as the nonverbal menu build does), case picks
// return. Verbal conversations are unaffected.
// Run with SEED=42 and SEED=7 (separate processes).
'use strict';
const K = require('./godpath/lib'), T = K.reporter('betrayal-nonverbal-gate');
const CASE_SEGS = ['site', 'witnesses', 'investigate', 'moot', 'letlie', 'expose', 'bribe', 'press', 'pressaccuser', 'approach', 'wounds', 'askheard', 'tellside', 'hearoffer', 'vote_guilty', 'vote_acquit'];
const isCasePick = (id) => { const m = /^betrayal:([^:]+):/.exec(String(id || '')); return !!m && CASE_SEGS.includes(m[1]); };
(async () => {
  const SEED = Number(process.env.SEED || 42);
  const G = await K.load({ seed: SEED, narration: false });
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  const roster = (v.roster || []).filter(id => id !== G.villagerId && G.getPerson(id));
  if (roster.length < 2) throw Error('Need 2+ conversation targets');
  const vid = roster[0], other = roster[1];
  // Shared-language control first: both speak English, case present.
  const p0 = G.getPerson(vid);
  p0.languages = { native: 'english', levels: { english: 2 } };
  s.languages = { english: 2 };
  s.kcal = 50000;
  const bs = G.betrayalState();
  bs.cases.push({ id: 'case_nv', status: 'open', charge: 'theft', accused: [vid], target: other, knownToPlayer: true, playerRole: 'bystander', day: s.day || 0 });
  G.startConvo(vid);
  const c0 = G.convoGet(vid);
  T.ok('control convo is verbal (not nonverbal)', c0.thread !== 'nonverbal', 'thread=' + c0.thread);
  // Direct betrayalChoices for the control: convoChoices runs the
  // question-ownership pager, and this fixture convo opens with a pending
  // question that owns its menu (answers only) — that filter is not the
  // gate under test.
  const verbalChoices = G.betrayalChoices(vid);
  T.ok('verbal convo offers a case pick (press)', verbalChoices.some(ch => isCasePick(ch.id)), JSON.stringify(verbalChoices.map(ch => ch.id)));
  try { G.endConvo(vid); } catch (e) {}
  // No-shared-words: villager speaks only German, scholar English only.
  // No interpreter: every other villager's trust set BELOW the
  // findInterpreter bar (5, not 0 — the gate reads (trust || 10), so 0
  // reads as the default 10 and a nearby bilingual still qualifies).
  // findInterpreter also requires nearby + bilingual + comm != none.
  const p = G.getPerson(vid);
  p.languages = { native: 'german', levels: { german: 2 } };
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 5;
  G.startConvo(vid);
  const c = G.convoGet(vid);
  T.ok('no-shared-words convo is nonverbal', c.thread === 'nonverbal', 'thread=' + c.thread);
  const nvChoices = G.convoChoices(vid);
  T.ok('nonverbal convo sets no interpreter in this fixture', !G.convoGet(vid).interpreter, 'interpreter=' + G.convoGet(vid).interpreter);
  T.ok('nonverbal, no interpreter: NO case picks offered', !nvChoices.some(ch => isCasePick(ch.id)), JSON.stringify(nvChoices.map(ch => ch.id)));
  const nvDirect = G.betrayalChoices(vid);
  T.ok('nonverbal, no interpreter: betrayalChoices itself offers none', !nvDirect.some(ch => isCasePick(ch.id)), JSON.stringify(nvDirect.map(ch => ch.id)));
  // Interpreter present: the gate opens (gate reads convo.interpreter, as
  // set by the nonverbal menu build when findInterpreter succeeds).
  G.convoGet(vid).interpreter = other;
  const interpChoices = G.betrayalChoices(vid);
  T.ok('nonverbal WITH interpreter: case picks offered again', interpChoices.some(ch => isCasePick(ch.id)), JSON.stringify(interpChoices.map(ch => ch.id)));
  try { G.endConvo(vid); } catch (e) {}
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
