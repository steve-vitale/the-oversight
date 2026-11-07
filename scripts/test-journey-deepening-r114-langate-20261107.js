'use strict';
// test-journey-deepening-r114-langate-20261107.js -- R114 Q1+Q2 proof.
// Q1 (r110 nit #2, r113-confirmed): Chantal (French-only) had a bond
// ACCEPTED day 75; Emma (Spanish-only) had a link ACCEPTED day 27 —
// decisions made in words never shared. Canon (docs/CONVERSATIONS.md):
// "No shared language → the conversation is nonverbal (gesture choices
// with varying outcomes). Partial → normal conversation." A bond is a
// commitment made in words — offering and deciding it inside a nonverbal
// conversation contradicts the canon. Mechanism: nvOpen returns
// convoChoices(vid), which runs through the bond wrap, so a 'none'-comm
// sitting states the barrier ("No shared words at all") and still offers
// "Yes. Stick together." in English.
// The fix (bond-initiation.js, pre-registered in the r114 prereg):
//   (a) bondChoices returns [] at comm 'none' (fail-open if the API is
//       missing); 'partial' still offers (partial IS shared language).
//   (b) bondTurn refuses bond:/link: ids at comm 'none' with an honest
//       line and NO state change (defense in depth).
// Q2 (r113 goon-loop wrinkle): Grace day 27 (seed 95601) — the bond ask
// was declined, then a later `goon` in the SAME sitting re-spoke the ask
// verbatim. Mechanism: the talk-request opener stashes the line in
// c.bondPending when the opener owns the reply; queueTraderIntro queues
// it; convoDropUnspoken (which runs BEFORE the decision) re-stages it as
// "dodged"; the decision consumes the request but not the re-staged beat.
// The fix (bond-initiation.js convoTurn wrap): after bondTurn returns
// for a bond:/link: choice, clear ONLY that kind's pending + held beats
// (bondPending / bondproposal beats for a bond decision, linkPending /
// linkraise beats for a link decision). Undecided asks are untouched.
// Cases: (1) 'none' -> no bond:/link: choices offered (menu + nvOpen);
// (2) 'partial' -> offered; (3) 'full' -> offered;
// (4) direct bondTurn 'bond:accept' at 'none' -> no bond formed, honest
// line, proposal still pending; (5a) decided ask clears its queued
// re-speak (deterministic: the beat is planted in heldBeats first, the
// state the natural path produces); (5b) natural-path decision leaves
// no bondproposal/linkraise beat; (5c) control: dodging the ask with a
// non-bond pick leaves the beat for the continuer (undecided asks
// still come back).
// RED on unfixed code: (1) and (4) and (5a) fail — the defect
// demonstrated. GREEN after the fix. (2)(3)(5c) pass on both — they pin
// the behavior the fix must NOT change.
const K = require('./godpath/lib');
const T = K.reporter('R114 lang-gate (bond/link need shared words) + decided-ask clear');
(async () => {
  const G = await K.load({ seed: 11407 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  // Villager is Spanish-only in every scene; the scholar's Spanish level
  // sets the comm level (0 = none, 1 = partial, 2 = full).
  function scene(spanishLevel) {
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    const vid = v.roster.find(id => id !== G.villagerId && !G.getPerson(id).dead);
    const p = G.getPerson(vid);
    p.languages = { native: 'spanish' };
    s.languages = { english: 2 };
    if (spanishLevel) s.languages.spanish = spanishLevel;
    s.day = 4; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
    v.trust = v.trust || {}; v.trust[vid] = 30;
    // bondAdd caps at +6/pair/day: three days of adds to reach the
    // 15–49 warmth window stageBondProposal requires.
    for (let d = 0; d < 3; d++) { s.day = 4 + d; G.bondAdd(vid, G.villagerId, 6, 'test-warmth'); }
    return { v, s, vid };
  }
  function stage(sc) {
    const r = G.stageBondProposal(sc.vid);
    if (!r) throw Error('setup: stageBondProposal returned null (trust=' + ((sc.v.trust || {})[sc.vid]) + ' bondV=' + JSON.stringify(G.bondGet && G.bondGet(sc.vid, G.villagerId)) + ')');
    return r;
  }
  function hasBondChoice(list) {
    return (list || []).some(x => x && typeof x.id === 'string' && (x.id.indexOf('bond:') === 0 || x.id.indexOf('link:') === 0));
  }
  // (1) 'none': no bond:/link: choice is offered — menu-level or sitting-level.
  {
    const sc = scene(0);
    T.ok('setup (1): comm is none for a Spanish-only villager', (G.commLevel(sc.vid) || {}).level === 'none', JSON.stringify(G.commLevel(sc.vid)));
    stage(sc);
    T.ok('setup (1): proposal staged', !!G.pendingBondProposal(sc.vid));
    const bc = G.bondChoices(sc.vid);
    T.ok("Q1 (1) 'none' -> bondChoices offers no bond:/link: choice", Array.isArray(bc) && !hasBondChoice(bc), JSON.stringify(bc));
    const st = G.startConvo(sc.vid);
    T.ok('setup (1): nonverbal sitting opens', !!st, 'startConvo null');
    T.ok("Q1 (1) 'none' -> the sitting menu offers no bond:/link: choice", st && !hasBondChoice(st.choices), JSON.stringify(st && st.choices));
    G.endConvo(sc.vid, 'left');
  }
  // (2) 'partial': offered (partial IS shared language).
  {
    const sc = scene(1);
    T.ok('setup (2): comm is partial', (G.commLevel(sc.vid) || {}).level === 'partial', JSON.stringify(G.commLevel(sc.vid)));
    stage(sc);
    const bc = G.bondChoices(sc.vid);
    T.ok("Q1 (2) 'partial' -> bondChoices offers bond:accept + bond:decline",
      bc.some(x => x && x.id === 'bond:accept') && bc.some(x => x && x.id === 'bond:decline'), JSON.stringify(bc));
  }
  // (3) 'full': offered.
  {
    const sc = scene(2);
    T.ok('setup (3): comm is full', (G.commLevel(sc.vid) || {}).level === 'full', JSON.stringify(G.commLevel(sc.vid)));
    stage(sc);
    const bc = G.bondChoices(sc.vid);
    T.ok("Q1 (3) 'full' -> bondChoices offers bond:accept + bond:decline",
      bc.some(x => x && x.id === 'bond:accept') && bc.some(x => x && x.id === 'bond:decline'), JSON.stringify(bc));
  }
  // (4) direct bondTurn 'bond:accept' at 'none': no bond, honest line.
  {
    const sc = scene(0);
    stage(sc);
    // Snapshot PRIMITIVES: bondGet returns the live record by reference —
    // holding it would alias the post-decision state.
    const b0 = G.bondGet(sc.vid, G.villagerId) || {};
    const before = { v: b0.v || 0, depth: b0.depth || 0, proposed: !!b0.proposed };
    const st = G.startConvo(sc.vid);
    T.ok('setup (4): nonverbal sitting opens', !!st, 'startConvo null');
    const r = G.convoTurn(sc.vid, 'bond:accept');
    const a1 = G.bondGet(sc.vid, G.villagerId) || {};
    const after = { v: a1.v || 0, depth: a1.depth || 0, proposed: !!a1.proposed };
    T.ok("Q1 (4) 'none' direct accept forms no bond (depth/v/proposed unchanged)",
      (after.depth || 0) === (before.depth || 0) && (after.v || 0) === (before.v || 0) && !after.proposed,
      'before=' + JSON.stringify(before) + ' after=' + JSON.stringify(after));
    T.ok("Q1 (4) 'none' direct accept leaves the proposal pending (not consumed)",
      !!G.pendingBondProposal(sc.vid));
    T.ok("Q1 (4) 'none' direct accept says so honestly (no shared words)",
      r && /no shared words/i.test(r.line || ''), String(r && r.line));
    G.endConvo(sc.vid, 'left');
  }
  // (5a) decided ask clears its queued re-speak (deterministic).
  {
    const sc = scene(2);
    const pend = stage(sc);
    const askLine = pend.line;
    const st = G.startConvo(sc.vid);
    T.ok('setup (5a): sitting opens', !!st, 'startConvo null');
    const c = G.convoGet(sc.vid);
    // Plant the queued-but-unrevealed beat: the exact state the natural
    // path produces when the opener owns the reply (openerOwnsReply).
    c.heldBeats = c.heldBeats || [];
    c.heldBeats.push({ text: askLine, bondproposal: true });
    const r = G.convoTurn(sc.vid, 'bond:accept');
    T.ok('setup (5a): the decision lands (bond accepted)', r && /Stick together/.test(r.line || ''), String(r && r.line));
    T.ok('setup (5a): the request is consumed by the decision', !G.pendingBondProposal(sc.vid));
    const c2 = G.convoGet(sc.vid);
    T.ok('Q2 (5a) decided bond ask clears bondPending', !c2.bondPending, JSON.stringify(c2.bondPending));
    T.ok('Q2 (5a) decided bond ask clears its held bondproposal beat',
      !(c2.heldBeats || []).some(h => h && h.bondproposal), JSON.stringify(c2.heldBeats));
    G.endConvo(sc.vid, 'left');
  }
  // (5b) natural-path decision leaves no bondproposal/linkraise beat.
  {
    const sc = scene(2);
    stage(sc);
    const st = G.startConvo(sc.vid);
    T.ok('setup (5b): sitting opens', !!st, 'startConvo null');
    const r = G.convoTurn(sc.vid, 'bond:accept');
    T.ok('setup (5b): the decision lands (bond accepted)', r && /Stick together/.test(r.line || ''), String(r && r.line));
    const c2 = G.convoGet(sc.vid);
    T.ok('Q2 (5b) natural-path decision leaves no bondproposal/linkraise beat',
      !(c2.heldBeats || []).some(h => h && (h.bondproposal || h.linkraise)) && !c2.bondPending && !c2.linkPending,
      JSON.stringify({ bondPending: c2.bondPending, linkPending: c2.linkPending, heldBeats: c2.heldBeats }));
    G.endConvo(sc.vid, 'left');
  }
  // (5c) control: dodging the ask with a non-bond pick leaves the beat.
  {
    const sc = scene(2);
    const pend = stage(sc);
    const askLine = pend.line;
    const st = G.startConvo(sc.vid);
    T.ok('setup (5c): sitting opens', !!st, 'startConvo null');
    const c = G.convoGet(sc.vid);
    c.heldBeats = c.heldBeats || [];
    c.heldBeats.push({ text: askLine, bondproposal: true });
    const choices = G.convoChoices(sc.vid);
    const dodge = (choices || []).find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('bond:') !== 0 && x.id.indexOf('link:') !== 0);
    if (!dodge) { T.ok('Q2 (5c) control skipped (no non-bond choice offered)', false, JSON.stringify(choices)); }
    else {
      G.convoTurn(sc.vid, dodge.id);
      const c2 = G.convoGet(sc.vid);
      const survives = c2.bondPending === askLine || (c2.heldBeats || []).some(h => h && h.bondproposal && h.text === askLine);
      T.ok('Q2 (5c) dodged ask survives for the continuer (undecided asks still come back)', survives,
        JSON.stringify({ bondPending: c2.bondPending, heldBeats: c2.heldBeats }));
      T.ok('Q2 (5c) dodged ask stays pending (not consumed)', !!G.pendingBondProposal(sc.vid));
    }
    G.endConvo(sc.vid, 'left');
  }
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
