// test-covenant-b.js — proof for the Stage 2 BUILD arm sim-onlylead-b
// (run fleshout-loop-b-20261115T1055Z). The covenant road: does the
// game stage the Founding Council when the policy walks it?
//
// §1 STATIC (fake Game): detJudgePeer arithmetic, the propose /
// counter-answer / tend flow, the gates (day, pantry, cap, re-ask,
// seasoned-skip) — one case per rule in the frozen policy.
// §2 GAME (live 60d smoke on seed 100401, covenant vs scaleclimb,
// via the onlylead driver): the policy proposes covenant links in
// live play, 0 instrument errors, and a determinism leg (same
// seed+policy twice → identical series).
// Shared harness only (scripts/sim-harness.js via the driver) — never
// copied eval boilerplate; Math.random seeded BEFORE eval by the
// harness; Game.save never stubbed.
// Usage: node scripts/test-covenant-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { covenantPolicy, covenantClimb, detJudgePeer, resetCovenantStats, covenantStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-covenant-b'));
const { oneRun } = require(path.join(REPO, 'scripts', 'onlylead-driver-20261115'));

let PASS = 0, FAIL = 0;
function check(name, cond, extra) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- fake Game ------------------------------------------------------------
// Minimal surface covenantClimb touches: state (scholar.day,
// otherVillages, village.pantry, pendingCounter, pendingNational),
// _week, hierarchyState, knowsVillage, linkWith, representative,
// isAllied, proposeCovenant, answerCounter, tendLink. Game.over false.
function fakeGame(o) {
  o = o || {};
  const links = o.links || [];
  const calls = { proposeCovenant: [], answerCounter: [], tendLink: [] };
  const G = {
    over: false,
    state: {
      scholar: { day: o.day || 10 },
      otherVillages: o.villages || [],
      village: { pantry: [{ kcalEach: 1000, units: (o.pantryKcal || 30000) / 1000 }] },
      pendingCounter: o.pendingCounter || null,
      pendingNational: null,
    },
    _week: function () { return Math.floor(((G.state.scholar || {}).day || 0) / 7); },
    hierarchyState: function () { return links; },
    knowsVillage: function () { return true; },
    linkWith: function (id) { for (const l of links) if ((l.a === 'haven' && l.b === id) || (l.b === 'haven' && l.a === id) || l.subordinate === id || l.primary === id) return l; return null; },
    representative: function () { return { standing: o.repStanding || 0 }; },
    isAllied: function () { return !!o.allied; },
    proposeCovenant: function (id) {
      calls.proposeCovenant.push(id);
      // Mirror the engine's opinion-10 prerequisite: a village that
      // barely knows Haven refuses before judging (no proposal, no -5).
      const ov = (G.state.otherVillages || []).find(function (x) { return x && x.id === id; });
      if (ov && ((ov.opinion | 0) < 10)) return null;
      if (o.proposeResult === 'counter') return 'counter';
      if (o.proposeResult === 'declined') return null;
      const link = { id: 'link_cov_' + id, kind: 'covenant', a: 'haven', b: id, primary: null, subordinate: null, trust: 30, status: 'active', day: G.state.scholar.day, tendedWeek: -1 };
      links.push(link);
      return link;
    },
    answerCounter: function (how) {
      calls.answerCounter.push(how);
      if (G.state.pendingCounter) {
        const c = G.state.pendingCounter;
        G.state.pendingCounter = null;
        const link = { id: 'link_cov_' + c.targetId, kind: c.kind || 'covenant', a: 'haven', b: c.targetId, primary: null, subordinate: null, trust: 30, status: 'active', day: G.state.scholar.day, tendedWeek: -1 };
        links.push(link);
        return link;
      }
      return null;
    },
    tendLink: function (id) {
      calls.tendLink.push(id);
      for (const l of links) if (l.id === id) { l.trust = (l.trust | 0) + 8; l.tendedWeek = G._week(); }
      return 1500;
    },
    _calls: calls, _links: links,
  };
  return G;
}

function sectionStatic() {
  console.log('§1 static — covenant policy rules');
  // detJudgePeer arithmetic: 38 + rep/2 (max 20) + opinion/2 + allied 15 + equals 10.
  {
    const G = fakeGame({ repStanding: 20 });
    check('detJudgePeer rep20/op20 = 68', detJudgePeer(G, { id: 'v1', opinion: 20 }) === 68, detJudgePeer(G, { id: 'v1', opinion: 20 }));
    const G0 = fakeGame({ repStanding: 0 });
    check('detJudgePeer rep0/op0 = 48', detJudgePeer(G0, { id: 'v1', opinion: 0 }) === 48, detJudgePeer(G0, { id: 'v1', opinion: 0 }));
    const Ga = fakeGame({ repStanding: 0, allied: true });
    check('detJudgePeer allied adds 15', detJudgePeer(Ga, { id: 'v1', opinion: 0 }) === 63, detJudgePeer(Ga, { id: 'v1', opinion: 0 }));
  }
  // Propose flow: day 10, pantry 30k, known village opinion 20 → proposes, accepts.
  {
    resetCovenantStats();
    const G = fakeGame({ day: 10, villages: [{ id: 'village_1', opinion: 20 }] });
    covenantClimb(G, {});
    check('proposes the ready village', G._calls.proposeCovenant.length === 1 && G._calls.proposeCovenant[0] === 'village_1', G._calls);
    check('proposeAccepted counted', covenantStats().proposeAccepted === 1, covenantStats());
    check('link formed as covenant peer', G._links.length === 1 && G._links[0].kind === 'covenant' && G._links[0].trust === 30, G._links);
  }
  // Pantry gate: 5k pantry → blocked, no call.
  {
    resetCovenantStats();
    const G = fakeGame({ day: 10, pantryKcal: 5000, villages: [{ id: 'village_1', opinion: 20 }] });
    covenantClimb(G, {});
    check('pantry gate blocks propose', G._calls.proposeCovenant.length === 0 && covenantStats().proposeBlockedPantry === 1, covenantStats());
  }
  // Day gate: before day 10 → no propose.
  {
    resetCovenantStats();
    const G = fakeGame({ day: 5, villages: [{ id: 'village_1', opinion: 20 }] });
    covenantClimb(G, {});
    check('day gate blocks propose', G._calls.proposeCovenant.length === 0 && covenantStats().proposeBlockedDay === 1, covenantStats());
  }
  // Opinion prerequisite: opinion 5 → the policy still attempts the
  // propose (it does NOT filter), the engine refuses before judging,
  // and the refusal counts as prereq — no decline, no cooldown.
  {
    resetCovenantStats();
    const ctx = {};
    const G = fakeGame({ day: 10, villages: [{ id: 'village_1', opinion: 5 }] });
    covenantClimb(G, ctx);
    check('opinion<10 still attempts the propose', G._calls.proposeCovenant.length === 1, G._calls);
    check('prerequisite refusal counted, no decline', covenantStats().proposePrereq === 1 && covenantStats().proposeDeclined === 0, covenantStats());
    check('prerequisite refusal sets no cooldown', !ctx._ccDeclined || !ctx._ccDeclined.village_1, ctx);
    G.state.scholar.day = 11;
    covenantClimb(G, ctx);
    check('prerequisite refusal retries the next day', G._calls.proposeCovenant.length === 2 && covenantStats().proposePrereq === 2, { calls: G._calls.proposeCovenant.length, stats: covenantStats() });
  }
  // Counter answer: pending peer counter → answerCounter('accept'), link forms.
  {
    resetCovenantStats();
    const G = fakeGame({ day: 12, pendingCounter: { targetId: 'village_2', kind: 'covenant' }, villages: [] });
    covenantClimb(G, {});
    check('counter answered accept', G._calls.answerCounter.length === 1 && G._calls.answerCounter[0] === 'accept', G._calls);
    check('counter formed the peer link', G._links.length === 1 && G._links[0].kind === 'covenant', G._links);
    check('counterAnswers counted', covenantStats().counterAnswers === 1, covenantStats());
  }
  // Tend: unseasoned covenant link, pantry 30k → tends, +8 trust.
  {
    resetCovenantStats();
    const link = { id: 'link_cov_v1', kind: 'covenant', a: 'haven', b: 'village_1', primary: null, subordinate: null, trust: 30, status: 'active', day: 2, tendedWeek: 0 };
    const G = fakeGame({ day: 12, links: [link], villages: [] });
    covenantClimb(G, {});
    check('tends below-bar covenant link', G._calls.tendLink.length === 1 && G._calls.tendLink[0] === 'link_cov_v1', G._calls);
    check('tend counted + trust moved', covenantStats().tends === 1 && link.trust === 38, { tends: covenantStats().tends, trust: link.trust });
  }
  // Tend skip: seasoned link (age 40, trust 45) → no tend.
  {
    resetCovenantStats();
    const link = { id: 'link_cov_v1', kind: 'covenant', a: 'haven', b: 'village_1', primary: null, subordinate: null, trust: 45, status: 'active', day: 2, tendedWeek: 0 };
    const G = fakeGame({ day: 42, links: [link], villages: [] });
    covenantClimb(G, {});
    check('seasoned link is not tended', G._calls.tendLink.length === 0 && covenantStats().tends === 0, covenantStats());
  }
  // Cap: 3 covenant links stand → blocked, no propose.
  {
    resetCovenantStats();
    const links = [1, 2, 3].map(function (i) { return { id: 'link_cov_v' + i, kind: 'covenant', a: 'haven', b: 'village_' + i, primary: null, subordinate: null, trust: 35, status: 'active', day: 2, tendedWeek: 99 }; });
    const G = fakeGame({ day: 20, links: links, villages: [{ id: 'village_9', opinion: 20 }] });
    covenantClimb(G, {});
    check('cap blocks propose at 3 links', G._calls.proposeCovenant.length === 0 && covenantStats().proposeBlockedCap === 1, covenantStats());
  }
  // Decline + re-ask: declined village is not re-proposed within 7 days.
  {
    resetCovenantStats();
    const ctx = {};
    const G = fakeGame({ day: 10, proposeResult: 'declined', villages: [{ id: 'village_1', opinion: 20 }] });
    covenantClimb(G, ctx);
    check('decline counted + cooled', covenantStats().proposeDeclined === 1 && ctx._ccDeclined && ctx._ccDeclined.village_1 === 10, { stats: covenantStats(), ctx: ctx });
    G.state.scholar.day = 12;
    covenantClimb(G, ctx);
    check('declined village not re-proposed in cooldown', G._calls.proposeCovenant.length === 1 && covenantStats().proposeNoCandidate === 1, { calls: G._calls.proposeCovenant.length, stats: covenantStats() });
  }
  // Counter outcome: engine counters (35–54) → proposeCounter counted, no link yet.
  {
    resetCovenantStats();
    const G = fakeGame({ day: 10, proposeResult: 'counter', villages: [{ id: 'village_1', opinion: 20 }] });
    covenantClimb(G, {});
    check('counter outcome counted', covenantStats().proposeCounter === 1 && G._links.length === 0, covenantStats());
  }
  // Best-first ranking: higher det score wins.
  {
    resetCovenantStats();
    const G = fakeGame({ day: 10, repStanding: 0, villages: [{ id: 'village_1', opinion: 10 }, { id: 'village_2', opinion: 30 }] });
    covenantClimb(G, {});
    check('proposes the best-scored village', G._calls.proposeCovenant[0] === 'village_2', G._calls);
  }
}

async function sectionGame() {
  console.log('§2 game — live 60d smoke, seed 100401, covenant vs scaleclimb');
  const cov = await oneRun(100401, 'competent-covenant-b', { days: 60 });
  check('covenant smoke ran', cov && cov.series && cov.series.length > 0, cov && cov.series && cov.series.length);
  check('covenant 0 instrument errors', (cov.instrumentErrors || []).length === 0, cov.instrumentErrors);
  check('covenant shape-candidate roll present', cov.series.every(function (sn) { return sn.shapeCands && sn.road; }), null);
  const covProposes = (cov.verbEvents || []).filter(function (e) { return e.verb === 'proposeCovenant'; }).length;
  check('covenant proposes in live play', covProposes > 0, { proposeCovenant: covProposes });
  // No peer link is expected to form in a 60d smoke: the engine's
  // opinion-10 prerequisite is only met at ~day 150 from a cold start
  // (probe, 2 seeds — see the Stage 2 addendum), so the smoke proves
  // the attempt fires and the engine refuses on opinion, not the
  // formation. Formation is a pilot-horizon question, not a smoke one.
  check('propose attempts are prerequisite refusals in the smoke window', (cov.capSummary || {}).proposePrereq > 0 && ((cov.capSummary || {}).proposeAccepted | 0) === 0, cov.capSummary);
  const noLead = (cov.verbEvents || []).filter(function (e) { return e.verb === 'proposeLink'; }).length;
  check('no lead proposes on the covenant leg', noLead === 0, { proposeLink: noLead });
  const base = await oneRun(100401, 'competent-scaleclimb-b', { days: 60 });
  check('baseline smoke ran', base && base.series && base.series.length > 0, base && base.series && base.series.length);
  check('baseline 0 instrument errors', (base.instrumentErrors || []).length === 0, base.instrumentErrors);
  const again = await oneRun(100401, 'competent-covenant-b', { days: 60 });
  check('determinism: identical series on re-run', JSON.stringify(again.series) === JSON.stringify(cov.series), null);
  check('determinism: identical verb events on re-run', JSON.stringify(again.verbEvents) === JSON.stringify(cov.verbEvents), null);
}

(async function () {
  sectionStatic();
  await sectionGame();
  console.log('test-covenant-b: ' + PASS + ' passed, ' + FAIL + ' failed');
  process.exitCode = FAIL ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
