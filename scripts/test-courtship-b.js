// test-courtship-b.js — proof for the courtship-deeds lever arm
// sim-courtship-b (run fleshout-loop-b-20261115T1330Z). The covenant
// road is gated by opinion (onlylead2-b: 1/8 staged, opinion-never-10
// on 5/8): does the courtship-deeds lever — one codex pilgrimage +
// one 2,000-kcal aid gift per village — open the gate in-window?
//
// §1 STATIC (fake Game + synthetic series): the lever's gates
// (aid once per village, pantry gate, opinion gate, cap, pending
// beat) + the pilgrimage state machine + the analyzer's rung naming
// + the opinion/deeds rollups + the LINK_LINE_RE fix.
// §2 GAME (live 200d smoke on pilot seed 100601, courtship leg, via
// the onlylead driver, IN-MEMORY ONLY — no corpus is written, so the
// pilot band is not spent): the 200d instrument captures a full
// per-day series + shape-candidate roll + daily opinion read with 0
// instrument errors, the deeds fire, max known opinion reaches 10
// in-window, and a determinism leg (same seed+policy twice →
// identical series). Seed 100601 is the first pilot seed — the smoke
// proves the instrument + lever on the judged leg WITHOUT prejudging
// the pilot (no covenant beat is asserted here; the pilot's G2 count
// is untouched). Same precedent as test-onlylead2-b.js (smoke on
// pilot seed 100421).
// Shared harness only (scripts/sim-harness.js via the driver) — never
// copied eval boilerplate; Math.random seeded BEFORE eval by the
// harness; Game.save never stubbed.
// Usage: node scripts/test-courtship-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyShape, analyzeShapes, analyze } = require(path.join(REPO, 'scripts', 'analyze-onlylead-b'));
const { oneRun, dirStem, LINK_LINES_CAP, LINK_LINE_RE } = require(path.join(REPO, 'scripts', 'onlylead-driver-20261115'));
const { courtshipStep, aidStep, resetCourtshipStats, courtshipStats, AID_KCAL, AID_PANTRY, COV_CAP } = require(path.join(REPO, 'scripts', 'policies', 'competent-courtship-b'));

let PASS = 0, FAIL = 0;
function check(name, cond, extra) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- fake Game for the lever (mirrors the engine verbs the policy calls) ---
function fakeGame(o) {
  o = o || {};
  const ovs = (o.villages || [
    { id: 'village_1', name: 'Stonebridge', x: 6, y: 4, opinion: 0 },
    { id: 'village_2', name: 'Thornfield', x: 2, y: 4, opinion: 4 },
  ]).map(function (v) { return Object.assign({}, v); });
  const pan = { kcalEach: (o.pantry != null ? o.pantry : 30000), units: 1 };
  const G = {
    state: {
      scholar: { day: (o.day != null ? o.day : 20), health: (o.hp != null ? o.hp : 100), exiled: false },
      otherVillages: ovs,
      village: { pantry: [pan] },
      pendingNational: o.pendingNational || null,
      pendingCounter: null,
    },
    map: { px: 4, py: 4 },
    over: false, tbfight: false,
    calls: { aid: [], study: [], travel: [] },
    links: o.links || [],
    knowsVillage: function () { return true; },
    linkWith: function (vid) {
      const hit = (o.linkedIds || []).indexOf(vid) >= 0;
      return hit ? { id: 'l-' + vid } : null;
    },
    hierarchyState: function () { return G.links.slice(); },
    maxHealth: function () { return 100; },
    aidVillage: function (vid, kcal) {
      G.calls.aid.push({ vid: vid, kcal: kcal });
      const removed = Math.min(kcal, pan.kcalEach);
      pan.kcalEach -= removed;
      if (!removed) return false;
      const v = ovs.find(function (x) { return x.id === vid; });
      if (v) v.opinion = Math.min(100, (v.opinion || 0) + 10);
      return undefined; // the real verb returns no value on success
    },
    studyVillageCodex: function (vid) {
      G.calls.study.push(vid);
      const v = ovs.find(function (x) { return x.id === vid; });
      if (!v) return 'No codex here.';
      const dist = Math.abs(v.x - G.map.px) + Math.abs(v.y - G.map.py);
      if (dist > 2) return 'You need to be at the village to study their codex.';
      if (!v._codexOpinionGiven) { v._codexOpinionGiven = true; v.opinion = (v.opinion || 0) + 3; }
      return 'You study their codex.';
    },
    travelTargets: function () {
      const out = [];
      for (let x = 0; x <= 8; x++) for (let y = 0; y <= 8; y++) {
        const d = Math.abs(x - G.map.px) + Math.abs(y - G.map.py);
        if (d >= 1 && d <= 3) out.push({ x: x, y: y });
      }
      return out;
    },
    travelTo: function (x, y) { G.calls.travel.push([x, y]); G.map.px = x; G.map.py = y; },
  };
  return G;
}
function pantryOf(G) {
  return ((G.state.village || {}).pantry || []).reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
}

function sectionStaticLever() {
  console.log('§1a static — courtship lever gates (fake Game)');
  check('AID_KCAL is 2000 (the first-gesture gift size)', AID_KCAL === 2000, AID_KCAL);
  check('AID_PANTRY is 12000 (the propose gate)', AID_PANTRY === 12000, AID_PANTRY);
  check('COV_CAP is 3', COV_CAP === 3, COV_CAP);
  // aid fires once per village: best det candidate first (village_2,
  // opinion 4 → det 50 vs village_1 det 48), then the other village,
  // then no candidate.
  {
    resetCourtshipStats();
    const G = fakeGame({});
    const ctx = {};
    aidStep(G, ctx);
    check('aid fires for the best det candidate first', G.calls.aid.length === 1 && G.calls.aid[0].vid === 'village_2' && G.calls.aid[0].kcal === 2000, G.calls.aid);
    check('aid moves opinion +10', G.state.otherVillages[1].opinion === 14, G.state.otherVillages[1]);
    check('aid spends real pantry kcal', pantryOf(G) === 28000, pantryOf(G));
    check('aid stats count the gift', courtshipStats().aids === 1 && courtshipStats().aidsPaidKcal === 2000, courtshipStats());
    aidStep(G, ctx);
    check('aid fires for the second village next', G.calls.aid.length === 2 && G.calls.aid[1].vid === 'village_1', G.calls.aid);
    aidStep(G, ctx);
    check('aid stops when no below-bar village remains', G.calls.aid.length === 2 && courtshipStats().aidsNoCandidate === 1, courtshipStats());
  }
  // aid blocked: pantry at/below the gate.
  {
    resetCourtshipStats();
    const G = fakeGame({ pantry: 12000 });
    aidStep(G, {});
    check('aid blocked at pantry == 12000', G.calls.aid.length === 0 && courtshipStats().aidsBlockedPantry === 1, courtshipStats());
  }
  // aid blocked: opinion already >= 10 (no gift where the gate is open).
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [
      { id: 'village_1', name: 'Stonebridge', x: 6, y: 4, opinion: 12 },
      { id: 'village_2', name: 'Thornfield', x: 2, y: 4, opinion: 11 },
    ] });
    aidStep(G, {});
    check('aid blocked when opinion already >= 10', G.calls.aid.length === 0 && courtshipStats().aidsNoCandidate === 1, courtshipStats());
  }
  // aid blocked: 3 covenant links already stand.
  {
    resetCourtshipStats();
    const G = fakeGame({ links: [
      { id: 'c1', kind: 'covenant', status: 'active' },
      { id: 'c2', kind: 'covenant', status: 'active' },
      { id: 'c3', kind: 'covenant', status: 'active' },
    ] });
    aidStep(G, {});
    check('aid blocked at the 3-link cap', G.calls.aid.length === 0 && courtshipStats().aidsBlockedCap === 1, courtshipStats());
  }
  // aid blocked: a national beat is pending (the beat's answer comes first).
  {
    resetCourtshipStats();
    const G = fakeGame({ pendingNational: { shape: 'covenant', primary: 'haven', day: 60 } });
    aidStep(G, {});
    check('aid blocked while a national beat is pending', G.calls.aid.length === 0 && courtshipStats().aidsBlockedPending === 1, courtshipStats());
  }
  // aid does not re-gift a village aided before (ctx survives across days).
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [{ id: 'village_1', name: 'Stonebridge', x: 6, y: 4, opinion: 0 }] });
    const ctx = {};
    aidStep(G, ctx);
    G.state.otherVillages[0].opinion = 5; // a cold-ask spent 5 of the 10
    aidStep(G, ctx);
    check('aid never re-gifts the same village', G.calls.aid.length === 1, G.calls.aid);
  }
}

function sectionStaticPilgrim() {
  console.log('§1b static — pilgrimage state machine (fake Game)');
  // Full trip: start (took-day) → walk (took-day) → study (took-day)
  // → walk home (took-day) → next pilgrimage (took-day). Villages sit
  // 3 tiles out, so the study needs the walk (study range is dist ≤ 2).
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [
      { id: 'village_1', name: 'Stonebridge', x: 7, y: 4, opinion: 0 },
      { id: 'village_2', name: 'Thornfield', x: 1, y: 4, opinion: 4 },
    ] });
    const ctx = {};
    const r1 = courtshipStep(G, ctx);
    check('pilgrimage starts on a below-bar unstudied village', r1 === 'took-day' && ctx._pilgrim && ctx._pilgrim.vid === 'village_1', ctx._pilgrim);
    check('pilgrimage picks the NEAREST candidate (tie at d3 → id asc, village_1)', ctx._pilgrim.vid === 'village_1', ctx._pilgrim);
    G.state.scholar.day += 1;
    const r2 = courtshipStep(G, ctx);
    check('pilgrimage walks toward the village', r2 === 'took-day' && G.map.px === 7 && G.map.py === 4, G.map);
    G.state.scholar.day += 1;
    const r3 = courtshipStep(G, ctx);
    check('pilgrimage studies at the fire', r3 === 'took-day' && G.calls.study.length === 1 && G.calls.study[0] === 'village_1', G.calls.study);
    check('study moves opinion +3', G.state.otherVillages[0].opinion === 3, G.state.otherVillages[0]);
    check('study stats count the visit', courtshipStats().studies === 1 && courtshipStats().pilgrimages === 1, courtshipStats());
    G.state.scholar.day += 1;
    const r4 = courtshipStep(G, ctx);
    check('pilgrimage walks home after the study', r4 === 'took-day' && G.map.px === 4 && G.map.py === 4 && !ctx._returning, G.map);
    G.state.scholar.day += 1;
    const r5 = courtshipStep(G, ctx);
    check('next pilgrimage starts for the second village', r5 === 'took-day' && ctx._pilgrim && ctx._pilgrim.vid === 'village_2', ctx._pilgrim);
  }
  // No pilgrimage when HP is low.
  {
    resetCourtshipStats();
    const G = fakeGame({ hp: 50 });
    const r = courtshipStep(G, {});
    check('no pilgrimage when HP <= 70%', r === null && courtshipStats().pilgrimages === 0, { r: r, pilgrimages: courtshipStats().pilgrimages });
  }
  // No pilgrimage when 3 covenant links stand.
  {
    resetCourtshipStats();
    const G = fakeGame({ links: [
      { id: 'c1', kind: 'covenant', status: 'active' },
      { id: 'c2', kind: 'covenant', status: 'active' },
      { id: 'c3', kind: 'covenant', status: 'active' },
    ] });
    const r = courtshipStep(G, {});
    check('no pilgrimage at the 3-link cap', r === null && courtshipStats().pilgrimages === 0, courtshipStats());
  }
  // A studied village is never re-pilgrimaged (engine once-flag).
  {
    resetCourtshipStats();
    const G = fakeGame({ villages: [
      { id: 'village_1', name: 'Stonebridge', x: 6, y: 4, opinion: 3, _codexOpinionGiven: true },
      { id: 'village_2', name: 'Thornfield', x: 2, y: 4, opinion: 4 },
    ] });
    const ctx = {};
    const r = courtshipStep(G, ctx);
    check('studied village skipped, next candidate picked', r === 'took-day' && ctx._pilgrim.vid === 'village_2', ctx._pilgrim);
  }
}

// --- synthetic series builder (same shape as test-onlylead2-b.js) --------
// daySpec: array of per-day overrides; each day defaults to a quiet
// village day (no candidates, no pending beat, rung day 62, maxOpinion 4).
function mkRec(days, verbEvents, opts) {
  opts = opts || {};
  const series = [];
  for (let d = 1; d <= days.length; d++) {
    const o = days[d - 1] || {};
    series.push({
      d: d,
      shapeCands: o.shapeCands || { lead: null, conquest: null, belong: null, covenant: null, trade: null },
      road: o.road || { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
      netDay: (o.netDay != null ? o.netDay : (opts.netDay != null ? opts.netDay : 32)),
      rungDay: (o.rungDay != null ? o.rungDay : (opts.rungDay != null ? opts.rungDay : 62)),
      rungMet: d >= (o.rungDay != null ? o.rungDay : (opts.rungDay != null ? opts.rungDay : 62)),
      pendingNational: o.pendingNational || null,
      nationalLive: !!o.nationalLive,
      scaleRefused: false, exiled: false,
      maxOpinion: (o.maxOpinion != null ? o.maxOpinion : 4),
      opinions: {},
    });
  }
  return { seed: 999997, policy: 'competent-courtship-b', days: days.length, series: series, verbEvents: verbEvents || [], instrumentErrors: [], deaths: [], waveKills: {}, endReason: 'village-lost', won: false, scaleRank: 'regional', gameDays: days.length };
}
function road(o) {
  return { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null, ...(o || {}) };
}
function quietDays(n) { const a = []; for (let i = 0; i < n; i++) a.push({}); return a; }

async function sectionStaticAnalyzer() {
  console.log('§1c static — analyzer rung naming + opinion/deeds rollups');
  // (a) RUNG NAMED: covenant 2 formed, 0 seasoned, rung 96, village
  // dead day 81 (the onlylead2 100426 shape: two links, dead 15 days
  // before the rung). Primary blocker UNCHANGED.
  {
    const days = quietDays(81);
    for (let i = 40; i < 81; i++) days[i] = { road: road({ nCovFormed: 2, nCovSeas: 2 }), netDay: 66, rungDay: 96 };
    const r = classifyShape(mkRec(days), 'covenant');
    check('rung named when one link short and rung past death', r.outcome === 'blocked' && r.blocker === 'covenant-seasoned-short:2-of-2' && r.blockers.indexOf('covenant-rung-past-death:96') >= 0, r);
  }
  // (b) RUNG NOT NAMED: same road state, rung 62, village dead day 81
  // (the rung passed before death — it is not the second gate).
  {
    const days = quietDays(81);
    for (let i = 40; i < 81; i++) days[i] = { road: road({ nCovFormed: 2, nCovSeas: 2 }), netDay: 32, rungDay: 62 };
    const r = classifyShape(mkRec(days), 'covenant');
    check('rung not named when the rung passed before death', r.outcome === 'blocked' && r.blockers.indexOf('covenant-rung-past-death:62') < 0, r);
  }
  // (c) RUNG NOT NAMED: not one link short (0 formed — the road never
  // started; the rung is not the story).
  {
    const days = quietDays(81);
    for (let i = 40; i < 81; i++) days[i] = { road: road({ nCovFormed: 0, nCovSeas: 0 }), netDay: 66, rungDay: 96 };
    const r = classifyShape(mkRec(days), 'covenant');
    check('rung not named when the road never started', r.outcome === 'blocked' && r.blocker === 'covenant-no-peer-links' && r.blockers.length === 1, r);
  }
  // (d) RUNG NOT NAMED: no regional rung ever set (netDay 0 — the
  // default rungDay 30 is not a real rung).
  {
    const days = quietDays(81);
    for (let i = 40; i < 81; i++) days[i] = { road: road({ nCovFormed: 2, nCovSeas: 2 }), netDay: 0, rungDay: 30 };
    const r = classifyShape(mkRec(days), 'covenant');
    check('rung not named when regional never lived', r.outcome === 'blocked' && r.blockers.filter(function (b) { return b.indexOf('rung-past-death') >= 0; }).length === 0, r);
  }
  // (e) LEAD one-short: 2 seasoned subs, rung past death.
  {
    const days = quietDays(81);
    for (let i = 40; i < 81; i++) days[i] = { road: road({ nPrimSeas: 2 }), netDay: 66, rungDay: 96 };
    const r = classifyShape(mkRec(days), 'lead');
    check('lead rung named when one sub short and rung past death', r.outcome === 'blocked' && r.blocker === 'lead-subs-short:2' && r.blockers.indexOf('lead-rung-past-death:96') >= 0, r);
  }
  // (f) 3 formed, 2 seasoned — one link short of SEASONING, rung past death.
  {
    const days = quietDays(81);
    for (let i = 40; i < 81; i++) days[i] = { road: road({ nCovFormed: 3, nCovSeas: 2 }), netDay: 66, rungDay: 96 };
    const r = classifyShape(mkRec(days), 'covenant');
    check('rung named when 3 formed but only 2 seasoned', r.outcome === 'blocked' && r.blocker === 'covenant-seasoned-short:2-of-3' && r.blockers.indexOf('covenant-rung-past-death:96') >= 0, r);
  }
  // (g) Opinion rollup: maxOpinion climbs 4 → 13 on day 40 (aid),
  // first 10 on day 40, max ever 13.
  {
    const days = quietDays(100);
    for (let i = 39; i < 100; i++) days[i] = { maxOpinion: 13 };
    days[39] = { maxOpinion: 10 };
    const out = analyze([mkRec(days)]);
    check('opinion first-10 day read on the judged leg', out.opinionFirst10['999997-competent-courtship-b'] === 40, out.opinionFirst10);
    check('opinion max read on the judged leg', out.opinionMax['999997-competent-courtship-b'] === 13, out.opinionMax);
  }
  // (h) Opinion never 10: first10 null, max the highest seen.
  {
    const days = quietDays(100);
    const out = analyze([mkRec(days)]);
    check('opinion never-10 reads null first-10', out.opinionFirst10['999997-competent-courtship-b'] === null && out.opinionMax['999997-competent-courtship-b'] === 4, out.opinionFirst10);
  }
  // (i) Courtship deeds rollup: aid/study counted by caller.
  {
    const evs = [
      { day: 20, verb: 'aidVillage', caller: 'policy', result: 'sent' },
      { day: 21, verb: 'aidVillage', caller: 'policy', result: 'sent' },
      { day: 22, verb: 'studyVillageCodex', caller: 'policy', result: 'You study their codex.' },
      { day: 30, verb: 'proposeCovenant', caller: 'policy', result: 'declined-or-blocked' },
    ];
    const out = analyze([mkRec(quietDays(60), evs)]);
    check('courtship deeds counted by caller', out.courtshipDeeds['aidVillage:policy'] === 2 && out.courtshipDeeds['studyVillageCodex:policy'] === 1 && !out.courtshipDeeds['aidVillage:engine'], out.courtshipDeeds);
  }
  // (j) LINK_LINE_RE fix: the refusal copy, the codex keeper line,
  // and the aid runner line pass.
  check('LINK_LINE_RE passes the covenant refusal copy', LINK_LINE_RE.test('They barely know Haven\'s name — and a covenant is a relationship, not a handshake.'), null);
  check('LINK_LINE_RE passes the codex keeper line', LINK_LINE_RE.test('The keeper of Stonebridge\'s codex watches you copy the final page. "You\'re the first outsider to read it all," they say quietly.'), null);
  check('LINK_LINE_RE passes the aid runner line', LINK_LINE_RE.test('A runner leaves Haven with 2,000 kcal for Thornfield. Every kcal of it real. (Opinion +10.)'), null);
  check('LINK_LINE_RE passes a charter line', LINK_LINE_RE.test('They sign the charter at the table rate.'), null);
  // (k) driver dir stem: per-RUN corpora dirs, old RUNs map as before.
  {
    check('dirStem courtship-b', dirStem('courtship-b') === 'perseed-courtship-b', dirStem('courtship-b'));
    check('dirStem onlylead2-b unchanged', dirStem('onlylead2-b') === 'perseed-onlylead2-b', dirStem('onlylead2-b'));
    check('dirStem onlylead-b unchanged', dirStem('onlylead-b') === 'perseed-onlylead-b', dirStem('onlylead-b'));
  }
  // (l) linkLines cap still 900 for the 200d horizon.
  check('LINK_LINES_CAP is 900', LINK_LINES_CAP === 900, LINK_LINES_CAP);
}

async function sectionGame() {
  console.log('§2 game — live 200d smoke, seed 100601, courtship leg');
  const armed = await oneRun(100601, 'competent-courtship-b', { days: 200 });
  check('courtship 200d smoke ran', armed && armed.series && armed.series.length > 0, armed && armed.series && armed.series.length);
  check('courtship 0 instrument errors', (armed.instrumentErrors || []).length === 0, armed.instrumentErrors);
  check('courtship shape-candidate roll present every day', armed.series.every(function (sn) { return sn.shapeCands && sn.road && typeof sn.rungDay === 'number'; }), null);
  check('courtship daily opinion read present every day', armed.series.every(function (sn) { return typeof sn.maxOpinion === 'number' || sn.maxOpinion === null; }), null);
  const aidCalls = (armed.verbEvents || []).filter(function (ev) { return ev.verb === 'aidVillage' && ev.caller === 'policy'; });
  const studyCalls = (armed.verbEvents || []).filter(function (ev) { return ev.verb === 'studyVillageCodex' && ev.caller === 'policy'; });
  check('courtship aid deed fired (policy-called aidVillage)', aidCalls.length >= 1, { aidCalls: aidCalls.length });
  check('courtship study deed fired (policy-called studyVillageCodex)', studyCalls.length >= 1, { studyCalls: studyCalls.length });
  const first10 = (armed.series || []).find(function (sn) { return sn.maxOpinion !== null && sn.maxOpinion >= 10; });
  check('courtship max known opinion reached 10 in-window', !!first10, { first10Day: first10 ? first10.d : null });
  check('courtship linkLines within the 900 cap', (armed.linkLines || []).length <= 900, { linkLines: (armed.linkLines || []).length });
  check('courtship refusal/courtship lines reach the corpus', (armed.linkLines || []).some(function (l) { return /covenant|charter|handshake|codex/i.test(l.line); }), null);
  const base = await oneRun(100601, 'competent-covenant-b', { days: 200 });
  check('baseline 200d smoke ran', base && base.series && base.series.length > 0, base && base.series && base.series.length);
  check('baseline 0 instrument errors', (base.instrumentErrors || []).length === 0, base.instrumentErrors);
  check('baseline daily opinion read present every day', base.series.every(function (sn) { return typeof sn.maxOpinion === 'number' || sn.maxOpinion === null; }), null);
  const again = await oneRun(100601, 'competent-courtship-b', { days: 200 });
  check('determinism: identical series on re-run', JSON.stringify(again.series) === JSON.stringify(armed.series), null);
  check('determinism: identical verb events on re-run', JSON.stringify(again.verbEvents) === JSON.stringify(armed.verbEvents), null);
}

(async function () {
  sectionStaticLever();
  sectionStaticPilgrim();
  await sectionStaticAnalyzer();
  await sectionGame();
  console.log('test-courtship-b: ' + PASS + ' passed, ' + FAIL + ' failed');
  process.exitCode = FAIL ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
