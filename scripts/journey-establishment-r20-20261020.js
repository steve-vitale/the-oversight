#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R20 — SPECIALIST ECONOMY (2026-10-20).
// Rotation index 1 (establishment). Base: master@1e97b471c.
//
// Pre-registered in hidden_files/evidence/2026-10-20/journey-establishment-r20-note.md:
//   Seeds: 61, 82, 103, 124 (pilot; expand to 901, 902 only if interesting).
//   Horizon: 42 game-days (+2 buffer), death-aware stop (+10d tail).
//   Policy: competent PINNED.
//   Binding metrics (a miss is NO-GO, never re-scored mid-run):
//     M1 (NPC processing exists): preserved kcal produced by cook-duty
//        (resolveOneAssignment task='cook' smoke-rack branch) over the leg.
//        GO if >0 on >=3/4 pilot seeds; NO-GO if 0 on >=3/4; else METRIC-REVIEW.
//     M2 (specialist rate realized): among seeds with M1>0, >=1 seed where the
//        working cook had specialistSkill('preserver') > 0. GO/NO-GO.
//     M3 (people): >=6 full transcripts sense-read, 0 senseless + occupation
//        discoverability scan.
//     M4 (r16 fixes hold): atom <=500 ALL seeds; ZERO placeholder champion
//        lines; ZERO null-line renders in held convos.
//   Guardrails: day 44 all seeds; starvation deaths with cause; no softlocks;
//     wave-2 gate >= d8.
//   A deliberate PLAYER PROBE runs on days 15/25/35 per seed: if the player
//   holds a processable item and a specialist for its task is here, ask once
//   (same perturbation class as r16-r19 probes). Teaching via
//   learnTechnique(...,'watched') is counted leg-wide.
// Usage: SEEDS=61 node scripts/journey-establishment-r20-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-20';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103, 124]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const PROBE_DAYS = [15, 25, 35];
const TASKS = ['butcher', 'cook', 'preserver', 'render'];

const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r20:' + key + ']', (e && e.message) || e);
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function pantryPreservedKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .filter(i => i && (i.foodState === 'preserved' || i.foodState === 'rendered'))
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function pantryUnitAtom(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((m, i) => Math.max(m, (i.kcalEach || 0)), 0);
  } catch (e) { return 0; }
}
function livingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
}
function nameOf(Game, id) {
  try { return id === 'player' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function teleStream(Game) {
  try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; }
}
function specSkillOf(Game, vid, task) {
  try { return (Game.specialistSkill ? Game.specialistSkill(Game.getPerson(vid) || {}, task) : 0) || 0; }
  catch (e) { return 0; }
}
// Census: living villagers -> occupation + per-task skill + foodXp practice.
function census(Game) {
  const out = [];
  for (const vid of livingVids(Game)) {
    let p = {};
    try { p = Game.getPerson(vid) || {}; } catch (e) {}
    const skills = {};
    for (const t of TASKS) skills[t] = specSkillOf(Game, vid, t);
    let occKnown = null;
    try { occKnown = Game.occupationLabel ? Game.occupationLabel(vid) : null; } catch (e) {}
    out.push({
      id: String(vid).slice(0, 8), name: nameOf(Game, vid),
      formerOccupation: p.formerOccupation || p.occupation || '?',
      occLabelKnown: !!occKnown,
      skills, foodXp: p.foodXp || {},
    });
  }
  return out;
}
// A processable player item for the deliberate probe.
function findProcessable(Game) {
  try {
    const inv = (Game.state.scholar || {}).inventory || [];
    for (let i = 0; i < inv.length; i++) {
      const it = inv[i];
      if (!it) continue;
      if (it.foodState === 'carcass') return { idx: i, name: it.name || 'carcass', task: 'butcher', container: null };
      if (it.foodKind === 'meat' && (it.foodState === 'cleaned' || it.foodState === 'cooked')) return { idx: i, name: it.name || 'meat', task: 'preserver', container: null };
      if (it.rawKcal || it.needsCooking || (it.foodKind === 'meat' && it.foodState === 'cleaned')) return { idx: i, name: it.name || 'food', task: 'cook', container: null };
    }
    let stash = [];
    try { stash = (Game.prepStash && Game.prepStash()) || []; } catch (e) {}
    for (let i = 0; i < stash.length; i++) {
      const it = stash[i];
      if (!it) continue;
      if (it.foodState === 'carcass') return { idx: i, name: it.name || 'carcass', task: 'butcher', container: stash };
      if (it.foodKind === 'meat' && (it.foodState === 'cleaned' || it.foodState === 'cooked')) return { idx: i, name: it.name || 'meat', task: 'preserver', container: stash };
      if (it.rawKcal || it.needsCooking || (it.foodKind === 'meat' && it.foodState === 'cleaned')) return { idx: i, name: it.name || 'food', task: 'cook', container: stash };
    }
  } catch (e) { warnOnce('findProcessable', e); }
  return null;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('policy.setup', e); } }

  // ---- instrumentation ----
  const dayLines = {}; // day -> [say lines] (ALL days)
  const assignments = []; // {day, vid, name, task, ok}
  const resolutions = []; // {day, vid, task} from resolveOneAssignment
  const smokeEvents = []; // {day, vid, name, skill, keptKcalParsed, deltaPreserved, line}
  const racksFullEvents = []; // {day, vid, name, line}
  const asks = []; // askSpecialist probe calls {day, probe, vid, name, task, item, lines}
  const teaches = []; // learnTechnique {day, tech, source}
  const probeDays = []; // {day, atHaven, task, specialists:[{name, skill, occLabel}]}
  const censusStart = census(Game);
  let daySayMark = 0; // dayLines[day].length before a hook call

  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }
  const _assignTask = Game.assignTask ? Game.assignTask.bind(Game) : null;
  if (_assignTask) {
    Game.assignTask = function (vid, task, opts) {
      const r = _assignTask(vid, task, opts);
      try { assignments.push({ day: nowDay(Game), vid: String(vid).slice(0, 8), name: nameOf(Game, vid), task, ok: !!(r && (r.ok !== false)) }); }
      catch (e) { warnOnce('assignTask', e); }
      return r;
    };
  }
  const _resolve = Game.resolveOneAssignment ? Game.resolveOneAssignment.bind(Game) : null;
  if (_resolve) {
    Game.resolveOneAssignment = function (vid, a) {
      const d = nowDay(Game);
      const task = (a && a.task) || '?';
      let prePreserved = 0;
      if (task === 'cook') { try { prePreserved = pantryPreservedKcal(Game); } catch (e) {} }
      try { daySayMark = (dayLines[d] || []).length; } catch (e) {}
      const r = _resolve(vid, a);
      try {
        resolutions.push({ day: d, vid: String(vid).slice(0, 8), name: nameOf(Game, vid), task });
        if (task === 'cook') {
          const lines = (dayLines[d] || []).slice(daySayMark);
          const postPreserved = pantryPreservedKcal(Game);
          for (const l of lines) {
            if (/worked the smoke racks too/.test(l)) {
              const m = l.match(/~([\d,]+) kcal/);
              smokeEvents.push({ day: d, vid: String(vid).slice(0, 8), name: nameOf(Game, vid),
                skill: specSkillOf(Game, vid, 'preserver'),
                keptKcalParsed: m ? parseInt(m[1].replace(/,/g, ''), 10) : null,
                deltaPreserved: Math.round(postPreserved - prePreserved),
                line: l.slice(0, 220) });
            } else if (/racks are already full/.test(l)) {
              racksFullEvents.push({ day: d, vid: String(vid).slice(0, 8), name: nameOf(Game, vid), line: l.slice(0, 220) });
            }
          }
        }
      } catch (e) { warnOnce('resolveOneAssignment', e); }
      return r;
    };
  }
  const _ask = Game.askSpecialist ? Game.askSpecialist.bind(Game) : null;
  if (_ask) {
    Game.askSpecialist = function (vid, idx, container, forceTask) {
      const d = nowDay(Game);
      try { daySayMark = (dayLines[d] || []).length; } catch (e) {}
      const r = _ask(vid, idx, container, forceTask);
      try {
        const lines = (dayLines[d] || []).slice(daySayMark).map(l => l.slice(0, 200));
        asks.push({ day: d, probe: !!this._r20probe, vid: String(vid).slice(0, 8), name: nameOf(Game, vid),
          task: forceTask || '?', idx, item: (this._r20item || null),
          result: r == null ? 'null' : 'ok', lines });
      } catch (e) { warnOnce('askSpecialist', e); }
      return r;
    };
  }
  const _learn = Game.learnTechnique ? Game.learnTechnique.bind(Game) : null;
  if (_learn) {
    Game.learnTechnique = function (t, source) {
      const r = _learn(t, source);
      try { teaches.push({ day: nowDay(Game), tech: t, source }); } catch (e) { warnOnce('learnTechnique', e); }
      return r;
    };
  }

  // Deliberate player probe: ask a specialist once per probe day when possible.
  function specialistProbe() {
    const d = nowDay(Game);
    const rec = { day: d, atHaven: false, asks: [] };
    try {
      rec.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven());
      for (const t of TASKS) {
        let specs = [];
        try { specs = (Game.specialistsHere ? Game.specialistsHere(t) : []) || []; } catch (e) {}
        probeDays.push({ day: d, atHaven: rec.atHaven, task: t,
          specialists: specs.map(s => ({ name: s.name, skill: s.skill, occ: s.occupation })) });
      }
      const proc = findProcessable(Game);
      if (proc) {
        let specs = [];
        try { specs = (Game.specialistsHere ? Game.specialistsHere(proc.task) : []) || []; } catch (e) {}
        if (specs.length) {
          Game._r20probe = true; Game._r20item = proc.name;
          try { Game.askSpecialist(specs[0].id, proc.idx, proc.container, proc.task); }
          catch (e) { warnOnce('probe.ask', e); }
          finally { Game._r20probe = false; Game._r20item = null; }
          rec.asks.push({ item: proc.name, task: proc.task, specialist: specs[0].name });
        }
      }
    } catch (e) { warnOnce('specialistProbe', e); }
    return rec;
  }

  const waveDay = {};
  const contestFires = [];
  const _fireContest = Game.fireContest ? Game.fireContest.bind(Game) : null;
  if (_fireContest) {
    Game.fireContest = function (contest) {
      const wasPilotAired = !!Game.state.pilotAired;
      const r = _fireContest(contest);
      try {
        contestFires.push({ day: nowDay(Game), name: (contest && contest.name) || (contest && contest.id) || '?' });
        if (!wasPilotAired && Game.state.pilotAired) ctx._pilotDay = nowDay(Game);
      } catch (e) { warnOnce('fireContest', e); }
      return r;
    };
  }

  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('doAction', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    const gd = nowDay(Game);
    if (PROBE_DAYS.indexOf(gd) >= 0) { try { specialistProbe(); } catch (e) { warnOnce('probeDay', e); } }
    try {
      const w = Game.unlockedWave ? Game.unlockedWave() : 1;
      if (waveDay[w] == null) waveDay[w] = gd;
    } catch (e) { warnOnce('waveDay', e); }
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
  }

  // ---- end-of-run capture ----
  const tele = teleStream(Game);
  const deaths = [];
  for (const t of tele) {
    if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  }
  const censusEnd = census(Game);
  const watched = teaches.filter(t => t.source === 'watched');

  // ---- M1/M2 (r20): the specialist economy ----
  const m1preservedKcal = smokeEvents.reduce((a, e) => a + (e.deltaPreserved > 0 ? e.deltaPreserved : (e.keptKcalParsed || 0)), 0);
  const m1 = { smokeEvents: smokeEvents.length, preservedKcal: m1preservedKcal,
    racksFullEvents: racksFullEvents.length,
    cookResolutions: resolutions.filter(r => r.task === 'cook').length,
    verdict: smokeEvents.length > 0 ? 'GO' : 'NO-GO' };
  const specEvents = smokeEvents.filter(e => e.skill > 0);
  const m2 = { smokeEventsWithSpecialist: specEvents.length, of: smokeEvents.length,
    verdict: specEvents.length > 0 ? 'GO' : 'NO-GO' };
  const m3p = { probeAsks: asks.length, teachesWatched: watched.length,
    specialistsAtProbeDays: probeDays.filter(p => p.specialists.length > 0).length,
    occKnownStart: censusStart.filter(c => c.occLabelKnown).length,
    occKnownEnd: censusEnd.filter(c => c.occLabelKnown).length };

  // ---- M4: records champion lines, byte-honest ----
  let recordsLines = [];
  try {
    const RR = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.RunRecords) || null;
    if (RR) recordsLines = RR.publicLines(Game) || [];
  } catch (e) { warnOnce('publicLines', e); }
  const championLines = recordsLines.filter(l => (l.id || '').indexOf('champion_') === 0);
  const fbWho = [], fbContest = [];
  for (const l of championLines) {
    const tx = l.text || '';
    if (/the Bearer/.test(tx)) fbWho.push({ day: l.day, text: tx });
    if (/won a contest\\b/.test(tx)) fbContest.push({ day: l.day, text: tx });
  }
  let recordsFileCorrupt = false;
  try {
    const rb = fs.readFileSync(path.join(ROOT, 'src/js/records.js'), 'utf8');
    recordsFileCorrupt = rb.indexOf('<redacted>') >= 0;
  } catch (e) { warnOnce('recordsFileRead', e); }
  const m4r = { championLineCount: championLines.length, fallbackWho: fbWho.length,
    fallbackContest: fbContest.length, recordsFileCorrupt,
    verdict: (fbWho.length === 0 && fbContest.length === 0) ? 'GO' : 'NO-GO' };

  // ---- guardrails ----
  const starvation = deaths.filter(t => /starvat|hunger/.test(String(t.cause || '')));
  const atomNow = pantryUnitAtom(Game);
  const mG = { reachedDay: nowDay(Game), over: !!Game.over,
    starvationDeaths: starvation.map(t => ({ day: t.day, who: t.who, cause: t.cause })),
    pantryUnitAtom: atomNow, atomOk: atomNow <= 500,
    waveUnlockDays: waveDay, wave2GateOk: (waveDay[2] == null) || waveDay[2] >= 8,
    popAlive: livingVids(Game).length, pantryEnd: Math.round(pantryKcal(Game)),
    preservedEnd: Math.round(pantryPreservedKcal(Game)),
    deaths: deaths.length, contestsFired: contestFires.length };

  // ---- telemetry baseline keys (compat with establishment.json) ----
  const wk = (() => { try { return (Game.state.waveKills || {}); } catch (e) { return {}; } })();
  const killTotal = Object.values(wk).reduce((a, b) => a + (b || 0), 0);
  const metrics = {
    contestFinal: { held: contestFires.length },
    codexKillSummary: { waveKills: wk, total: killTotal },
    pilotAired: ctx._pilotDay != null ? ctx._pilotDay : null,
    deaths: deaths.length,
    popAlive: livingVids(Game).length,
    pantryKcal: Math.round(pantryKcal(Game)),
    preservedKcal: Math.round(pantryPreservedKcal(Game)),
    specPreservedKcal: m1preservedKcal,
  };

  // ---- transcripts (probe days + cook-duty days) ----
  const windowDays = new Set(PROBE_DAYS);
  for (const e of smokeEvents) windowDays.add(e.day);
  for (const r of resolutions.filter(r => r.task === 'cook').slice(0, 12)) windowDays.add(r.day);
  const tpPath = EVID + `/journey-establishment-r20-transcript-seed${seed}.txt`;
  let tp = [`=== seed ${seed} — specialist-economy window transcripts (r20) ===`];
  for (const d of Array.from(windowDays).sort((a, b) => a - b)) {
    tp.push(`\\n----- day ${d} -----`);
    for (const l of (dayLines[d] || [])) tp.push(l);
  }
  try { fs.writeFileSync(tpPath, tp.join('\\n')); } catch (e) { warnOnce('tpWrite', e); }

  // one held conversation per seed for the people-check (work/food-leaning)
  const convoPath = EVID + `/journey-establishment-r20-convo-seed${seed}.txt`;
  const convoLines = [];
  try {
    const cv = livingVids(Game).slice(0, 3);
    convoLines.push(`=== seed ${seed} — held conversations (end day ${nowDay(Game)}) ===`);
    for (const vid of cv) {
      const nm = nameOf(Game, vid);
      const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
      convoLines.push(`\\n-- ${nm} (${String(vid).slice(0, 8)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      convoLines.push('choices: ' + ((r.choices || []).map(ch => `[${ch.id}] ${String(ch.label || '').slice(0, 80)}`).join(' | ')));
      for (let turn = 0; turn < 8; turn++) {
        let choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) break;
        const pick = choices.find(ch => /gossip|rumor/.test(ch.id)) || choices.find(ch => /work|food|teach|help/.test(ch.id)) || choices.find(ch => /^want:/.test(ch.id)) || choices.find(ch => ch.id !== 'leave') || null;
        if (!pick) break;
        convoLines.push(`YOU: [${pick.id}] ${pick.label}`);
        r = Game.convoTurn(vid, pick.id);
        if (r.line == null && r.ended) convoLines.push('THEM: (quiet close — no line, ended)');
        else convoLines.push(`THEM: ${r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    }
  } catch (e) { convoLines.push('ERROR: ' + e.message); }
  try { fs.writeFileSync(convoPath, convoLines.join('\\n')); } catch (e) { warnOnce('convoWrite', e); }

  // ---- M5: people — ZERO null-line renders in any held convo ----
  const nullConvoLines = convoLines.filter((l, i) => {
    if (!/^THEM: (null|undefined)\\s*$/.test(l) && !/^(OPENING|closing): (null|undefined)$/.test(l)) return false;
    const nxt = convoLines[i + 1] || '';
    return nxt.indexOf('(quiet close') !== 0;
  });
  const m5 = { nullLineCount: nullConvoLines.length,
    verdict: nullConvoLines.length === 0 ? 'GO' : 'NO-GO' };

  const out = { seed, run: 'r20', reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    metrics,
    m1, m2, m3p, m4r, m5,
    guardrails: mG,
    censusStart, censusEnd,
    assignments: assignments.slice(0, 60),
    resolutions: resolutions.slice(0, 120),
    smokeEvents, racksFullEvents, asks, teaches,
    probeDays,
    deaths, transcriptPath: tpPath, convoPath: convoPath,
    recordsChampionLines: championLines.map(l => ({ day: l.day, text: l.text })),
    ctxNotes: ctx.notes.slice(0, 10) };
  const outPath = EVID + `/journey-establishment-r20-seed${seed}.json`;
  try { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('outWrite', e); }
  return { seed, outPath,
    m1, m2, m3p, m4r, m5,
    guardrails: mG,
    smokeSample: smokeEvents.slice(0, 3).map(e => ({ day: e.day, name: e.name, skill: e.skill, kcal: e.deltaPreserved || e.keptKcalParsed })),
    asksSample: asks.slice(0, 4).map(a => ({ day: a.day, task: a.task, item: a.item, name: a.name, result: a.result })) };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`--- r20 seed=${seed} ---`);
    const r = await runSeed(seed);
    results.push(r);
    console.log(JSON.stringify({ seed,
      m1: r.m1, m2: r.m2, m3p: r.m3p,
      m4r: r.m4r, m5: r.m5, guardrails: r.guardrails,
      smokeSample: r.smokeSample, asksSample: r.asksSample }, null, 1));
    console.log('analysis: per-seed JSON + transcripts written; run all seeds then compose the analysis md by hand');
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
