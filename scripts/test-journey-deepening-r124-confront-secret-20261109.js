'use strict';
// test-journey-deepening-r124-confront-secret-20261109.js -- R124 Q2 proof.
// The question (r124 prereg Q2): the secret menu also offers a
// confront:d_* option alongside the secret answers (seen in both r122
// secret transcripts, unjudged). Mechanism (verified in source): truth.js
// wraps convoChoices and appends confront:<doubtId> before 'leave' on
// ANY menu whenever the player holds an open doubt about the villager —
// the secret branch's five answers are no exception. So a player holding
// a doubt can confront INSTEAD of answering the confession. This probe
// asks what happens to the secret then.
// Cases (engine, real Game):
// (1) with an open doubt planted, the secret menu offers confront:<id>
//     alongside the secret answers;
// (2) picking confront resolves the doubt (a gossip LEAD clears
//     deterministically — tentative, no RNG roll, no accuser cost) and
//     the sitting continues (ended === false);
// (3) after the confrontation, the secret is still answerable — the
//     next menu offers secret: again (secretAnswered unset, thread
//     still 'secret');
// (4) answering the secret after the confrontation resolves it normally
//     (the promise lands, the follow-up arms);
// (5) control: without an open doubt, no confront: id rides the secret
//     menu (the option comes from the doubt, not the secret).
// The doubt planted is the engine's own gossip-lead shape (truth.js
// gossip-first path): kind 'gossip', evidence carrying the "haven't
// heard their own story yet" marker, on a field with no live lie — so
// the confrontation follows the deterministic tentative-clear path
// (confrontDoubt: no lie -> tentative -> 'cleared'), not the RNG
// confess/deflect/attack roll. The probe prints the confrontation line
// and the post-confront menu so the sense-read is in the log.
// RED/FAILURE MODE: (1) fails while the truth wrapper does not append
// confront: to the secret menu; (3) fails while the confrontation
// consumes the confession (secretAnswered set, thread cleared, or the
// sitting ended); (4) fails while the post-confront answer does not
// resolve. If the engine ever changes the tentative-clear path, (2)
// fails first (outcome not 'cleared' or the sitting ends).
const K = require('./godpath/lib');
const T = K.reporter('R124 confront-on-secret (engine)');

(async () => {
  const G = await K.load({ seed: 12407 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  const seededRandom = Math.random;
  const _used = new Set();
  function secretSitting(secretText) {
    const v = G.state.village, s = G.state.scholar;
    for (let attempt = 0; attempt < 12; attempt++) {
      const vid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && !G.getPerson(id).dead);
      if (!vid) throw Error('setup: no fresh roster villager left');
      _used.add(vid);
      const p = G.getPerson(vid);
      p.languages = { native: 'english' };
      v.away = {};
      v.trust = v.trust || {}; v.trust[vid] = 50;
      const proto = G.synthPrototype(p);
      proto.secret = secretText;
      p.prototype = proto;
      Math.random = () => 0.05;
      let st = null;
      try { st = G.startConvo(vid); } finally { Math.random = seededRandom; }
      if (st && typeof st.line === 'string' && st.line.indexOf('Can I tell you something?') >= 0) {
        return { vid, st };
      }
      try { G.endConvo(vid, 'done'); } catch (e) { /* sitting already over */ }
    }
    throw Error('setup: no secret opener in 12 villagers for ' + JSON.stringify(secretText));
  }
  function setup(day) {
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    s.languages = { english: 2 };
    s.langExposure = {};
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
  }
  function nextDay(day) {
    const v = G.state.village, s = G.state.scholar;
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100;
    v.away = {}; v.engaged = {};
  }
  const endSitting = (vid) => { try { G.endConvo(vid, 'done'); } catch (e) { /* sitting over */ } };
  // Plant the engine's own gossip-lead shape on a field with no live lie,
  // so the confrontation follows the deterministic tentative-clear path.
  function plantGossipLead(vid) {
    const lies = (typeof G.npcLies === 'function' ? G.npcLies(vid) : null) || {};
    const field = ['occupation', 'origin', 'goal'].find(f => !lies[f] || lies[f].confessed) || 'occupation';
    const first = G.firstRef(vid);
    const doubt = G.addDoubt(vid, 'gossip',
      `Village talk says ${first} isn't really what they claim.`,
      [`Mara: the truth is "a cook"`, `you haven't heard ${first}'s own story yet`],
      { field });
    return doubt;
  }

  setup(4);
  // (1) + (2) + (3) + (4): secret sitting with an open doubt.
  const sit = secretSitting("I can't read, and I'm scared it matters now.");
  T.ok('setup: confession opens the sitting', !!sit.st, 'startConvo null');
  const doubt = plantGossipLead(sit.vid);
  T.ok('setup: gossip lead planted', !!doubt && !!doubt.id, 'doubt=' + JSON.stringify(doubt));
  const menu0 = G.convoChoices(sit.vid);
  const ids0 = (menu0 || []).map(x => x && x.id).filter(Boolean);
  const confrontId = ids0.find(id => id.indexOf('confront:') === 0);
  T.ok('Q2 engine (1a) the secret menu offers confront: alongside the answers',
    !!confrontId && ids0.some(id => id.indexOf('secret:') === 0), 'menu=' + JSON.stringify(ids0));
  T.ok('Q2 engine (1b) the confront: id names the planted doubt',
    !!confrontId && confrontId === 'confront:' + doubt.id, 'confrontId=' + JSON.stringify(confrontId) + ' doubt=' + doubt.id);
  const rC = G.convoTurn(sit.vid, confrontId);
  console.log('  confront line: ' + JSON.stringify(rC && rC.line));
  T.ok('Q2 engine (2a) the confrontation resolves the doubt as cleared (tentative lead)',
    !!doubt.resolved && doubt.resolution && doubt.resolution.indexOf('talked it through') >= 0,
    'resolved=' + JSON.stringify(doubt.resolved) + ' resolution=' + JSON.stringify(doubt.resolution));
  T.ok('Q2 engine (2b) the sitting continues after the confrontation',
    !!rC && rC.ended === false, 'ended=' + JSON.stringify(rC && rC.ended));
  const cAfter = G.convoGet(sit.vid);
  T.ok('Q2 engine (3a) the secret is NOT marked answered by the confrontation',
    !cAfter.secretAnswered, 'secretAnswered=' + JSON.stringify(cAfter.secretAnswered));
  T.ok('Q2 engine (3b) the thread is still the secret',
    cAfter.thread === 'secret', 'thread=' + JSON.stringify(cAfter.thread));
  const menu1 = G.convoChoices(sit.vid);
  const ids1 = (menu1 || []).map(x => x && x.id).filter(Boolean);
  console.log('  post-confront menu: ' + JSON.stringify(ids1));
  T.ok('Q2 engine (3c) the next menu offers the secret answers again',
    ids1.some(id => id.indexOf('secret:') === 0), 'menu=' + JSON.stringify(ids1));
  const rA = G.convoTurn(sit.vid, 'secret:promise');
  T.ok('Q2 engine (4a) the promise still resolves after the confrontation',
    typeof rA.line === 'string' && rA.line.indexOf('needed someone to know') >= 0, 'line=' + JSON.stringify(rA.line));
  T.ok('Q2 engine (4b) the answer still arms the follow-up',
    !!G.convoGet(sit.vid).secretFollowup, 'secretFollowup=' + JSON.stringify(G.convoGet(sit.vid).secretFollowup));
  endSitting(sit.vid);
  // (5) control: no doubt, no confront: on the secret menu.
  nextDay(5);
  const sit2 = secretSitting("I don't actually know how to swim and I'm terrified someone will find out.");
  T.ok('setup (5): confession opens the sitting', !!sit2.st, 'startConvo null');
  T.ok('setup (5b): no open doubt on this villager', (G.getDoubts(sit2.vid) || []).length === 0, 'doubts=' + JSON.stringify(G.getDoubts(sit2.vid)));
  const menu2 = G.convoChoices(sit2.vid);
  const ids2 = (menu2 || []).map(x => x && x.id).filter(Boolean);
  T.ok('Q2 engine (5) without a doubt, no confront: rides the secret menu',
    !ids2.some(id => id.indexOf('confront:') === 0), 'menu=' + JSON.stringify(ids2));
  endSitting(sit2.vid);
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
