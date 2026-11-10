'use strict';
// test-journey-deepening-r124-want-after-secret-20261109.js -- R124 Q1 proof.
// The defect (r124 panel, 16 seeds, 6 answered secrets): a confession was
// answered (secret:promise/comfort resolves, the r122 follow-up fires), but
// the villager's open want NEVER surfaced — 0/6 established, and in none of
// the 6 did the villager voice the want in a post-answer line. The want
// only owns the OPENING, and the secret took the opening; the post-answer
// menu never offers it. Two causes, both fixed here:
//   (a) buildMenu only lets convoWhatsAlive items ride when choosingSubject
//       is true — after a secret answer the sitting is in the beat-matrix
//       flow, so the want item never reaches the menu.
//   (b) the WANT_Q map in convo-scene.js lacks seek_taken / seek_comfort /
//       pocketed / warn_you — those wants could never be menu-offered at
//       all (only via the opening). 2 of the panel's 6 secret wants were
//       seek_taken / pocketed.
// The fix: answering a secret (not deflect) arms c.wantAfterSecret when an
// open want exists; buildMenu then leads the post-answer menu with the
// want item (beat-menu prelude + the alive block); the flag clears when
// the want is picked or the sitting ends — never on an unrelated pick, so
// the want stays live for the rest of the sitting.
// Cases (engine, real Game):
// (1) after a promise, the post-answer menu offers alive:want:seek_taken;
// (2) picking it engages the want (stage advances, the line names the want);
// (3) the flag clears once the want is picked;
// (4) deflect arms nothing (no flag, no want item);
// (5) no open want arms nothing;
// (6) the previously-missing want ids surface as menu items (unit);
// (7) the want stays offered after an unrelated pick (continuer first).
// RED/FAILURE MODE: (1), (2), (6), (7) fail on the pre-fix engine — the
// post-answer menu has no alive:want item at all (and seek_taken isn't in
// WANT_Q). (3)-(5) pass pre-fix too (no flag exists to clear / arm).
const K = require('./godpath/lib');
const T = K.reporter('R124 want-after-secret (engine)');

(async () => {
  const G = await K.load({ seed: 12207 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  const seededRandom = Math.random;
  const _used = new Set();
  function secretSitting(secretText, wantId) {
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
        // Force the open want the panel actually saw (seek_taken / repay /
        // ask_favor / pocketed) when asked — the menu logic reads id/stage
        // only, never def, so an id-only want is faithful for menu cases.
        // Pass null to keep the picker's assigned want (with its def) for
        // engagement cases.
        if (wantId) {
          const c = G.convoGet(vid);
          c.want = { id: wantId, stage: 0, resolution: 'none' };
        }
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
  const endSitting = (vid) => { try { G.endConvo(vid, 'done'); } catch (e) { /* sitting over */ } };
  const menuIds = (r) => (r && r.choices || []).map(x => x.id);
  const SWIM = "I don't actually know how to swim and I'm terrified someone will find out.";

  setup(60);
  // (1)+(2) use the want the picker actually assigned (it carries its def,
  // so engaging it speaks a real line). The menu cases below force ids
  // instead — the fix's menu logic reads id/stage only, never def.
  const sit1 = secretSitting(SWIM, null);
  T.ok('setup (1): confession opens the sitting', !!sit1.st, 'startConvo null');
  const w1id = G.convoGet(sit1.vid).want && G.convoGet(sit1.vid).want.id;
  T.ok('setup (1): sitting holds an open want', !!w1id && w1id !== 'none', 'want=' + JSON.stringify(G.convoGet(sit1.vid).want));
  const r1 = G.convoTurn(sit1.vid, 'secret:promise');
  T.ok('(1) post-answer menu offers alive:want:' + w1id, menuIds(r1).includes('alive:want:' + w1id), 'menu=' + menuIds(r1).join(','));
  T.ok('(1) flag armed', !!G.convoGet(sit1.vid).wantAfterSecret, 'wantAfterSecret falsy');
  // (2) picking it engages the want.
  const r2 = G.convoTurn(sit1.vid, 'alive:want:' + w1id);
  const w2 = G.convoGet(sit1.vid).want;
  T.ok('(2) want stage advances on pick', (w2.stage || 0) >= 1, 'stage=' + JSON.stringify(w2));
  T.ok('(2) the pick puts the sitting on the want thread', G.convoGet(sit1.vid).thread === 'want', 'thread=' + JSON.stringify(G.convoGet(sit1.vid).thread));
  T.ok('(2) the reply is a real line, not a null', typeof (r2 && r2.line) === 'string' && (r2.line || '').length > 0, 'line=' + JSON.stringify(r2 && r2.line));
  // (3) the flag clears once the want is picked.
  T.ok('(3) flag clears after the want is picked', !G.convoGet(sit1.vid).wantAfterSecret, 'wantAfterSecret still set');
  endSitting(sit1.vid);

  // (4) deflect arms nothing.
  const sit4 = secretSitting(SWIM, 'ask_favor');
  T.ok('setup (4): confession opens the sitting', !!sit4.st, 'startConvo null');
  const r4 = G.convoTurn(sit4.vid, 'secret:deflect');
  T.ok('(4) deflect sets no flag', !G.convoGet(sit4.vid).wantAfterSecret, 'wantAfterSecret set after deflect');
  T.ok('(4) deflect offers no want item', !menuIds(r4).includes('alive:want:ask_favor'), 'menu=' + menuIds(r4).join(','));
  endSitting(sit4.vid);

  // (5) no open want arms nothing.
  const sit5 = secretSitting(SWIM, 'none');
  T.ok('setup (5): confession opens the sitting', !!sit5.st, 'startConvo null');
  const r5 = G.convoTurn(sit5.vid, 'secret:promise');
  T.ok('(5) want none sets no flag', !G.convoGet(sit5.vid).wantAfterSecret, 'wantAfterSecret set with no want');
  T.ok('(5) want none offers no want item', !menuIds(r5).some(id => id.indexOf('alive:want:') === 0), 'menu=' + menuIds(r5).join(','));
  endSitting(sit5.vid);

  // (6) the previously-missing want ids surface as menu items (unit).
  for (const wid of ['seek_taken', 'pocketed', 'seek_comfort', 'warn_you']) {
    const sit = secretSitting(SWIM, wid);
    const r = G.convoTurn(sit.vid, 'secret:promise');
    T.ok('(6) ' + wid + ' offered after a promise', menuIds(r).includes('alive:want:' + wid), 'menu=' + menuIds(r).join(','));
    endSitting(sit.vid);
  }

  // (7) the want stays offered after an unrelated pick (continuer first).
  // The continuer consumes the secret follow-up but must not clear the
  // want — the want is an open want, not a single line tied to the moment.
  const sit7 = secretSitting(SWIM, 'repay');
  T.ok('setup (7): confession opens the sitting', !!sit7.st, 'startConvo null');
  const r7a = G.convoTurn(sit7.vid, 'secret:promise');
  T.ok('setup (7): want offered after promise', menuIds(r7a).includes('alive:want:repay'), 'menu=' + menuIds(r7a).join(','));
  const r7b = G.convoTurn(sit7.vid, 'dlg:more');
  T.ok('(7) want still offered after dlg:more', menuIds(r7b).includes('alive:want:repay'), 'menu=' + menuIds(r7b).join(','));
  T.ok('(7) flag still set after unrelated pick', !!G.convoGet(sit7.vid).wantAfterSecret, 'wantAfterSecret cleared by dlg:more');
  endSitting(sit7.vid);

  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
