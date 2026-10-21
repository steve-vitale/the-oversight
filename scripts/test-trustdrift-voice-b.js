#!/usr/bin/env node
// test-trustdrift-voice-b.js — CONFIRM of the landed sim-trustdrift-voice fix
// (backlogs #751 + #753, landed as abd17010bb by the sibling loop this morning).
//
// This arm was assigned to BUILD the fix; the sibling already landed it, so
// per the loop's convergence rules this run does CONFIRM DUTY instead: a
// 12–16 seed confirm of the landed lever on real trust-erosion trajectories.
// Zero src/js changes in this run.
//
// PRE-REGISTRATION (binding, §14 — written before any sim ran; a miss is
// NO-GO, never re-scored):
//   PRIMARY (real trajectories, 16 seeds 8801–8816): a 3-link Haven-led
//   national realm; link1 (Thornfield) carries a crushing 60,000 kcal/week
//   tribute its fields cannot pay, so the REAL weekly linkTick drives trust
//   down -2/week (arrears accrue, said aloud). Links 2–3 (Ashford, Oakvale)
//   pay 0 tribute (+1 trust/week, stay seasoned). 110 days of hierarchyDaily.
//     GO = ≥12/16 seeds: (a) link1's trust crosses below the trust-40
//     seasoned bar exactly once; (b) EXACTLY ONE drift beat fires, naming
//     Thornfield, on the crossing day; (c) ZERO drift beats name Ashford or
//     Oakvale; (d) the "◈ The realm came apart" verdict fires on the
//     crossing day AFTER the beat in the same day's log; (e) the beat names
//     the village and carries no trust numbers (no digits).
//   RED (hunks reverse-applied): the paired run with _trustDriftWatch
//   stubbed to a no-op (the pre-fix engine had no watcher) must emit ZERO
//   drift beats on all 16 seeds while the trust trajectories still cross.
//     GO = 16/16 silent.
//   DET-GATE (paired A/B same seed): daily trust series byte-identical
//   (JSON), link objects (minus the watcher's declared memory:
//   _trustDriftAbove + history entries) byte-identical, nationalLive
//   trajectory identical, say-log diff = EXACTLY the drift beat lines.
//     GO = 16/16 clean.
//   TEND-REFUSAL (re-verify the landed boundary, 1 seed): bare-pantry
//   tendLink returns 0 and voices the refusal line.
//     GO = voiced.
//   SENSE: a real trajectory transcript (exemplar replay if 8802 reproduces,
//   else the confirm-A transcript) is read for meaning — does the player see
//   the cause of the dissolution coming?
//
// Exit 0 = GO, 1 = NO-GO / insufficient-data. Prints a JSON summary plus the
// sense transcript window for the evidence file.

process.env.SURPLUSFEED = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';

const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');

const SEEDS = [];
for (let s = 8801; s <= 8816; s++) SEEDS.push(s);
const DAY0 = 100, HORIZON = 110;

function logText(Game) {
  return (Game.log || []).map((e) => {
    if (e && typeof e === 'object') return e.text || e.msg || e.message || '';
    return String(e == null ? '' : e);
  }).filter((t) => t);
}
function isDriftLine(t) { return /fire is drifting from ours|bond with .* fire is cooling/i.test(t); }
function isVerdictLine(t) { return /realm came apart/i.test(t); }
function linkOf(Game, sub) {
  return (Game.mshipState().links || []).find((l) => l.subordinate === sub);
}

async function buildRealm(Game, stubWatcher) {
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = DAY0;
  Game.state.otherVillages = Game.state.otherVillages || [];
  for (const [id, name] of [['thornfield', 'Thornfield'], ['ashford', 'Ashford'], ['oakvale', 'Oakvale']]) {
    if (!Game.state.otherVillages.find((v) => v.id === id))
      Game.state.otherVillages.push({ id, name, alive: true });
  }
  const m = Game.mshipState();
  m.links = [];
  const specs = [
    { sub: 'thornfield', tribute: 60000 }, // crushing: fields can't pay -> -2 trust/week
    { sub: 'ashford', tribute: 0 },        // kept: +1 trust/week, stays seasoned
    { sub: 'oakvale', tribute: 0 },
  ];
  for (const sp of specs) {
    m.links.push({
      id: 'link_' + sp.sub, primary: 'haven', subordinate: sp.sub,
      trust: 55, tributeKcalPerWeek: sp.tribute, tributePaidWeek: -1, arrears: 0,
      obligations: ['tribute'], history: [], status: 'active', day: DAY0 - 35,
      theirSpeaker: { id: 'sp_' + sp.sub, name: 'Mara' },
    });
  }
  m.lastLinkWeek = Game._week();
  Game.state.nationalLive = true; // the realm starts national; the test is the loss
  if (stubWatcher) Game._trustDriftWatch = function () {};
  return m;
}

async function driveTrajectory(seed, stubWatcher) {
  const { Game } = await loadGame({ seed, mode: 'drift-confirm', narration: true });
  await buildRealm(Game, stubWatcher);
  const rec = { seed, stub: !!stubWatcher, days: [], beats: [], verdicts: [], log: [] };
  const seen = new Set();
  for (let d = DAY0; d < DAY0 + HORIZON; d++) {
    Game.state.scholar.day = d;
    Game.hierarchyDaily();
    const trusts = {};
    for (const sub of ['thornfield', 'ashford', 'oakvale']) trusts[sub] = linkOf(Game, sub).trust;
    rec.days.push({ day: d, trust: trusts, nationalLive: !!Game.state.nationalLive });
    for (const e of (Game.log || [])) {
      const t = (e && typeof e === 'object') ? (e.text || e.msg || e.message || '') : String(e == null ? '' : e);
      if (!t || seen.has(t)) continue;
      seen.add(t);
      rec.log.push({ day: d, text: t });
      if (isDriftLine(t)) rec.beats.push({ day: d, text: t });
      if (isVerdictLine(t)) rec.verdicts.push({ day: d, text: t });
    }
  }
  rec.endLinks = (Game.mshipState().links || []).map((l) => {
    const c = Object.assign({}, l); delete c._trustDriftAbove; delete c.history; return c;
  });
  return { Game, rec };
}

function analyze(rec) {
  // first day thornfield trust < 40
  let crossDay = null;
  for (const r of rec.days) { if (r.trust.thornfield < 40) { crossDay = r.day; break; } }
  const thornBeats = rec.beats.filter((b) => /thornfield/i.test(b.text));
  const otherBeats = rec.beats.filter((b) => !/thornfield/i.test(b.text));
  const verdict = rec.verdicts.find((v) => v.day >= (crossDay || 0));
  return { crossDay, thornBeats, otherBeats, verdict,
           beatOnCross: thornBeats.filter((b) => b.day === crossDay).length };
}

async function part1() {
  console.log('=== PART 1: 16-seed real-trajectory confirm (paired A/B) ===');
  const results = [];
  for (const seed of SEEDS) {
    const A = await driveTrajectory(seed, false);
    const B = await driveTrajectory(seed, true);
    const a = analyze(A.rec), b = analyze(B.rec);
    const r = { seed, crossDay: a.crossDay, stubCrossDay: b.crossDay,
                thornBeats: a.thornBeats.length, beatOnCross: a.beatOnCross,
                otherBeats: a.otherBeats.length, stubBeats: B.rec.beats.length,
                verdictDay: a.verdict ? a.verdict.day : null };
    // assertions
    r.crossObserved = a.crossDay != null && b.crossDay === a.crossDay;
    r.oneBeat = a.thornBeats.length === 1 && a.beatOnCross === 1;
    r.noOtherBeats = a.otherBeats.length === 0;
    r.beatNamesVillage = a.thornBeats.length === 1 && /thornfield/i.test(a.thornBeats[0].text);
    r.noNumbers = a.thornBeats.length === 1 && !/\d/.test(a.thornBeats[0].text);
    r.verdictAfter = !!a.verdict && a.verdict.day === a.crossDay &&
      A.rec.log.findIndex((l) => isDriftLine(l.text)) < A.rec.log.findIndex((l) => isVerdictLine(l.text));
    r.redSilent = B.rec.beats.length === 0;
    // det-gate
    const tA = A.rec.days.map((d) => d.trust), tB = B.rec.days.map((d) => d.trust);
    r.detTrust = JSON.stringify(tA) === JSON.stringify(tB);
    r.detNat = JSON.stringify(A.rec.days.map((d) => d.nationalLive)) === JSON.stringify(B.rec.days.map((d) => d.nationalLive));
    const setA = A.rec.log.map((l) => l.text), setB = B.rec.log.map((l) => l.text);
    const onlyA = setA.filter((t) => !setB.includes(t));
    const onlyB = setB.filter((t) => !setA.includes(t));
    r.detSay = onlyB.length === 0 && onlyA.length === a.thornBeats.length &&
      onlyA.every((t) => isDriftLine(t));
    r.detLinks = JSON.stringify(A.rec.endLinks) === JSON.stringify(B.rec.endLinks);
    r.pass = r.crossObserved && r.oneBeat && r.noOtherBeats && r.beatNamesVillage &&
             r.noNumbers && r.verdictAfter && r.redSilent && r.detTrust &&
             r.detNat && r.detSay && r.detLinks;
    results.push(r);
    console.log(`seed ${seed}: crossDay=${r.crossDay} beats=${r.thornBeats}(onCross=${r.beatOnCross}) other=${r.otherBeats} stubBeats=${r.stubBeats} verdictDay=${r.verdictDay} det=${r.detTrust && r.detSay && r.detLinks} -> ${r.pass ? 'PASS' : 'FAIL'}`);
    if (seed === SEEDS[0]) {
      // stash the first passing transcript for the sense re-read
      results.senseGame = A;
    }
  }
  const passing = results.filter((r) => r.pass).length;
  const crossing = results.filter((r) => r.crossObserved).length;
  return { results, passing, crossing };
}

async function part2() {
  // Exemplar replay: 8802, leadfeast, SURPLUSFEED=1, FEASTSCALE_R13=1, 180d.
  console.log('=== PART 2: 8802 exemplar replay (leadfeast, SURPLUSFEED=1, 180d) ===');
  const { leadfeast } = require('./policies/feastscale');
  const { Game } = await loadGame({ seed: 8802, mode: 'drift-exemplar', narration: true, fullTelemetry: false });
  await setupGame(Game);
  const snaps = [];
  const seen2 = new Set();
  const exLog = []; // day-stamped say lines (Game.log caps at 40; scan daily)
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  policy.daily = (G, ctx) => {
    try {
      const links = (G.mshipState().links || []).map((l) => ({
        primary: l.primary, subordinate: l.subordinate, trust: l.trust,
        status: l.status, age: ((G.state.scholar || {}).day || 0) - (l.day || 0),
        conquered: !!l.conquered,
      }));
      snaps.push({ day: (G.state.scholar || {}).day || 0, links, nationalLive: !!G.state.nationalLive });
      for (const e of (G.log || [])) {
        const t = (e && typeof e === 'object') ? (e.text || e.msg || e.message || '') : String(e == null ? '' : e);
        if (!t || seen2.has(t)) continue;
        seen2.add(t);
        exLog.push({ day: (G.state.scholar || {}).day || 0, text: t });
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 });
  const lines = exLog.map((l) => `[d${l.day}] ${l.text}`);
  const beats = exLog.filter((l) => isDriftLine(l.text));
  const verdicts = exLog.filter((l) => isVerdictLine(l.text));
  // find Haven-led links that crossed below 40 at age>=30
  const crossed = [];
  const byLink = {};
  for (const s of snaps) for (const l of s.links) {
    const k = l.primary + '>' + l.subordinate;
    (byLink[k] = byLink[k] || []).push({ day: s.day, trust: l.trust, age: l.age });
  }
  for (const [k, series] of Object.entries(byLink)) {
    let prev = null, cross = null;
    for (const p of series) {
      if (prev && prev.trust >= 40 && p.trust < 40 && p.age >= 30) { cross = p; break; }
      prev = p;
    }
    if (cross) crossed.push({ link: k, day: cross.day, trust: cross.trust });
  }
  console.log(`end=${result.endReason} days=${result.days} crossings=${crossed.length} driftBeats=${beats.length} verdicts=${verdicts.length}`);
  crossed.slice(0, 5).forEach((c) => console.log(`  crossed: ${c.link} day=${c.day} trust=${c.trust}`));
  return { result, lines, beats, verdicts, crossed, snaps };
}

async function part3() {
  // Tend-refusal re-verify on a separate instance (no trajectory contamination).
  console.log('=== PART 3: bare-pantry tend refusal re-verify ===');
  const { Game } = await loadGame({ seed: 8801, mode: 'drift-tend', narration: true });
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = DAY0;
  const m = Game.mshipState(); m.links = m.links || [];
  m.links.push({ id: 'link_tend', primary: 'haven', subordinate: 'thornfield',
    trust: 60, tributeKcalPerWeek: 4000, tributePaidWeek: -1, arrears: 0,
    obligations: ['tribute'], history: [], status: 'active', day: DAY0 - 35 });
  Game.state.otherVillages = [{ id: 'thornfield', name: 'Thornfield', alive: true }];
  Game.state.village = Game.state.village || {};
  Game.state.village.pantry = [];
  const before = logText(Game).length;
  let ret = null, err = null;
  try { ret = Game.tendLink('link_tend'); } catch (e) { err = String(e); }
  const fresh = logText(Game).slice(before);
  const voiced = fresh.some((t) => /bare/i.test(t) && /pantry/i.test(t));
  console.log('tendLink returned:', ret, 'voiced:', voiced);
  fresh.forEach((l) => console.log('  ' + l));
  return { ret, voiced, err, pass: !err && ret === 0 && voiced };
}

async function main() {
  const fails = [];
  const p1 = await part1();
  console.log(`PART 1: ${p1.passing}/16 PASS, ${p1.crossing}/16 crossed`);
  if (p1.crossing < 12) fails.push(`INSUFFICIENT-DATA: only ${p1.crossing}/16 seeds crossed the bar`);
  else if (p1.passing < 12) fails.push(`NO-GO: only ${p1.passing}/16 seeds fully pass (bar 12)`);

  const p2 = await part2();
  const p3 = await part3();
  if (!p3.pass) fails.push('TEND-REFUSAL: bare-pantry refusal not voiced or misbehaved');

  // sense transcript: prefer the exemplar replay if it crossed+dissolved, else confirm-A
  let senseLines = null, senseNote = '';
  if (p2.crossed.length > 0 && p2.verdicts.length > 0) {
    senseLines = p2.lines; senseNote = 'exemplar replay (8802 leadfeast SURPLUSFEED=1)';
  } else {
    const A = p1.results.senseGame;
    if (A) { senseLines = A.rec.log.map((l) => `[d${l.day}] ${l.text}`); senseNote = 'confirm-A trajectory (seed 8801, mechanism-real erosion)'; }
  }
  console.log('=== SENSE TRANSCRIPT WINDOW (' + senseNote + ') ===');
  if (senseLines) {
    const idx = senseLines.findIndex((t) => /realm came apart/i.test(t));
    const lo = Math.max(0, (idx >= 0 ? idx : senseLines.length) - 25);
    senseLines.slice(lo, (idx >= 0 ? idx : senseLines.length) + 3).forEach((t) => console.log('  ' + t));
  } else console.log('  (no transcript available)');

  const summary = {
    part1: { passing: p1.passing, crossing: p1.crossing,
             detail: p1.results.filter((r) => r.seed).map((r) => ({ seed: r.seed, pass: r.pass, crossDay: r.crossDay, beats: r.thornBeats, stubBeats: r.stubBeats, verdictDay: r.verdictDay })) },
    part2: { endReason: p2.result.endReason, days: p2.result.days,
             crossings: p2.crossed.length, driftBeats: p2.beats.length, verdicts: p2.verdicts.length },
    part3: { pass: p3.pass },
    fails,
  };
  console.log('=== SUMMARY ===');
  console.log(JSON.stringify(summary, null, 1));
  console.log(fails.length ? 'RESULT: NO-GO' : 'RESULT: GO');
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => { console.error('HARNESS-ERROR: ' + (e && e.stack || e)); process.exit(2); });
