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
// seed+policy twice → identical series). The propose stream is judged
// against the day max-known-opinion first reaches 10 (day 59 on seed
// 100401 since journey r137 — see the §2 comment and the §1b judge
// controls): prerequisite refusals until then, an acceptance after.
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

// --- opinion-timing judge (revised 2026-11-15, sim-covenantsmoke-b) ------
// The old §2 assertion ("no acceptance in the 60d smoke window") encoded
// an opinion-timing assumption that journey r137 (ce0f28a46) falsified:
// max-known-opinion first reaches 10 on DAY 59 on seed 100401 (was
// ~day 150 from a cold start), and a covenant proposal is ACCEPTED the
// same day (village_1, detPeer 73). The road opens inside the smoke
// window now, so the assertion splits the propose stream AT the day
// opinion-10 is first met: every propose before that day is a
// prerequisite refusal (the engine refuses before judging), and at
// least one propose on/after that day is accepted, within a week of
// the opening (a lag longer than that means the road opened but the
// policy could not walk it). A cold decline or a shut anywhere in the
// window is still a failure, as is any propose before the gate that
// was judged instead of refused (an acceptance before opinion-10
// shows up here: the gate did not refuse). The function is pure so
// §1b can prove it discriminates on synthetic streams.
// proposes: [{day, outcome}] with outcome in 'prereq' | 'accepted' |
//   'counter' | 'declined' | 'shut' (the policy's own classification,
//   capSummary.events kind 'propose').
// Returns {ok, reason, op10Day, prePrereq, preOther, preOtherOutcome,
//   firstAcceptDay, postAccepts, declines}.
function judgeCovenantTiming(proposes, op10Day) {
  const d = { ok: false, reason: null, op10Day: op10Day, prePrereq: 0, preOther: 0, preOtherOutcome: null, firstAcceptDay: null, postAccepts: 0, declines: 0 };
  if (op10Day === null || op10Day === undefined) { d.reason = 'opinion-10 never met in the smoke window'; return d; }
  const pre = [];
  for (const p of (proposes || [])) { if (p.day < op10Day) pre.push(p); }
  if (pre.length === 0) { d.reason = 'no propose before opinion-10 (nothing refused on the gate)'; return d; }
  for (const p of pre) {
    if (p.outcome === 'prereq') d.prePrereq++;
    else { d.preOther++; if (!d.preOtherOutcome) d.preOtherOutcome = p.outcome; }
  }
  if (d.preOther > 0) { d.reason = 'a pre-opinion-10 propose was judged instead of refused (' + d.preOtherOutcome + ')'; return d; }
  for (const p of (proposes || [])) {
    if (p.outcome === 'declined' || p.outcome === 'shut') d.declines++;
    if (p.outcome === 'accepted' && p.day >= op10Day) {
      d.postAccepts++;
      if (d.firstAcceptDay === null || p.day < d.firstAcceptDay) d.firstAcceptDay = p.day;
    }
  }
  if (d.declines > 0) { d.reason = 'cold decline/shut in the smoke window'; return d; }
  if (d.postAccepts === 0) { d.reason = 'no acceptance after opinion-10'; return d; }
  if (d.firstAcceptDay - op10Day > 7) { d.reason = 'acceptance lagged more than a week after opinion-10'; return d; }
  d.ok = true;
  d.reason = 'prereq until opinion-10, accepted within a week of it';
  return d;
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

function sectionTimingJudge() {
  console.log('§1b static — opinion-timing judge discriminates');
  function prereqRange(a, b) {
    const ps = [];
    for (let d = a; d <= b; d++) ps.push({ day: d, outcome: 'prereq' });
    return ps;
  }
  // (a) Happy path mirroring the live seed-100401 numbers: 49 prereq
  // d10-58, accepted d59, prereq d60 (a new village, opinion 0),
  // op10Day 59.
  {
    const ps = prereqRange(10, 58);
    ps.push({ day: 59, outcome: 'accepted' });
    ps.push({ day: 60, outcome: 'prereq' });
    const r = judgeCovenantTiming(ps, 59);
    check('judge accepts the live shape (prereq d10-58, accept d59)', r.ok && r.prePrereq === 49 && r.firstAcceptDay === 59 && r.postAccepts === 1, r);
  }
  // (b) NEGATIVE CONTROL 1 — the day-59 acceptance suppressed: same
  // stream minus the acceptance → must fail (this is what would have
  // caught a road that opens but never forms a link).
  {
    const ps = prereqRange(10, 58);
    ps.push({ day: 60, outcome: 'prereq' });
    const r = judgeCovenantTiming(ps, 59);
    check('judge FAILS when the acceptance is suppressed', !r.ok && r.reason === 'no acceptance after opinion-10', r);
  }
  // (c) NEGATIVE CONTROL 2 — the old-timing shape: opinion-10 never
  // met in the window (the world the dead assertion assumed) → fail.
  {
    const ps = prereqRange(10, 60);
    const r = judgeCovenantTiming(ps, null);
    check('judge FAILS on the old-timing shape (opinion-10 never met)', !r.ok && r.reason === 'opinion-10 never met in the smoke window', r);
  }
  // (d) NEGATIVE CONTROL 3 — an acceptance BEFORE the gate (day 30,
  // opinion-10 day 59): the gate did not refuse → fail.
  {
    const ps = prereqRange(10, 29);
    ps.push({ day: 30, outcome: 'accepted' });
    const r = judgeCovenantTiming(ps, 59);
    check('judge FAILS on an acceptance before opinion-10', !r.ok && r.preOther === 1 && r.preOtherOutcome === 'accepted', r);
  }
  // (e) NEGATIVE CONTROL 4 — a cold decline in the window → fail.
  {
    const ps = prereqRange(10, 58);
    ps.push({ day: 59, outcome: 'declined' });
    const r = judgeCovenantTiming(ps, 59);
    check('judge FAILS on a cold decline in the window', !r.ok && r.declines === 1, r);
  }
  // (f) NEGATIVE CONTROL 5 — the acceptance lags more than a week
  // after the opening (day 67 vs opinion-10 day 59) → fail.
  {
    const ps = prereqRange(10, 59);
    ps.push({ day: 67, outcome: 'accepted' });
    const r = judgeCovenantTiming(ps, 59);
    check('judge FAILS when the acceptance lags >7d after opinion-10', !r.ok && /lagged/.test(r.reason), r);
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
  // OPINION TIMING (revised 2026-11-15, sim-covenantsmoke-b — the old
  // "no acceptance in the window" assertion below is DEAD: journey
  // r137 (ce0f28a46) re-opens deflected question-wants, more questions
  // get answered, and max-known-opinion first reaches 10 on DAY 59 on
  // seed 100401 (was ~day 150 from a cold start) — village_1: 10,
  // village_0: 7; trajectory 0 at d10, 2 at d20, 8 at d30, 6 at d40-50,
  // 10 at d59 — and the day-59 propose to village_1 is ACCEPTED
  // (detPeer 73). The game changed on purpose under the test, so the
  // test is updated in this commit and says so (repo AGENTS.md). The
  // new assertion splits the propose stream AT the day opinion-10 is
  // first met: prerequisite refusals until then, an acceptance after
  // (within a week of the opening). It still discriminates — §1b
  // proves it fails if the acceptance is suppressed, on the
  // old-timing shape, on a pre-gate acceptance, on a cold decline,
  // and on a >7d lag. It is NOT loosened to go green: on this tip the
  // live numbers are 51 propose calls, 50 prereq, 1 accepted day 59.
  const op10 = (cov.series || []).find(function (sn) { return sn.maxOpinion !== null && sn.maxOpinion >= 10; });
  const op10Day = op10 ? op10.d : null;
  check('opinion-10 first met inside the smoke window', op10Day !== null, { op10Day: op10Day, opinions: op10 ? op10.opinions : null });
  const proposes = ((cov.capSummary || {}).events || []).filter(function (e) { return e.kind === 'propose'; })
    .map(function (e) { return { day: e.day, outcome: e.outcome }; });
  const timing = judgeCovenantTiming(proposes, op10Day);
  check('propose stream splits at opinion-10: prereq until, acceptance after', timing.ok, timing);
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
  sectionTimingJudge();
  await sectionGame();
  console.log('test-covenant-b: ' + PASS + ' passed, ' + FAIL + ' failed');
  process.exitCode = FAIL ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
