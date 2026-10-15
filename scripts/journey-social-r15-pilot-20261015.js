#!/usr/bin/env node
// journey-social-r15-pilot-20261015.js — LEG 5 SOCIAL LIFE, r15 pilot.
// Pre-registration: evidence/2026-10-15/run-journey-social-r15.md.
//   M1 (grief blank): grief-thread convos (c.thread === 'grief') + grief-memory
//     name-checks in sampled transcripts.
//   M2 (moot blank): mootsFired — full moot beat transcript per case.
// Policies: competent + larceny-leaning, identical seeds 1201..1204.
// Driver: r14 pattern — one full driveOne convo per living villager per day
// (first non-opt-out bespoke answer, prefer dlg:help/dlg:details/want
// follow-ups then t2 topics else leave, 12-turn budget, endConvo('left') on
// exhaustion), day-5 walkaway probe, qa counters.
// NEW vs r14:
//   - death capture: every person/villager corpse from Game.corpses();
//     for each death, 3 nearest-affinity survivors (Game.pairAffinity),
//     their convos on day-of-death +/-3 days saved as full transcripts.
//   - grief-thread detection: thread === 'grief' at any convo turn.
//   - moot capture: Game.betrayalState().cases watched daily; per moot the
//     beat sequence from a wrapped Game.emit narration stream (day-stamped):
//     caller line, votes, verdict, aftermath.
//   - player-vote duty: cases with trial.awaitingPlayerVote get the player's
//     vote cast by the "room majority" rule (guilty if guiltySoFar >= need),
//     recorded per moot — otherwise trials stall forever in headless runs.
// Death-aware stop + 10d tail: handled by the harness (DEAD-VILLAGE TAIL).
// Usage: DAYCAP=60 [PROBE=1] node scripts/journey-social-r15-pilot-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1201, 1202, 1203, 1204]);
const POLICY_IDS = (process.env.POLICIES ? process.env.POLICIES.split(',') : ['competent', 'larceny-leaning']);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { larcenyLeaning } = require('./policies/larceny-leaning');
const POLICY_LIB = { competent, 'larceny-leaning': larcenyLeaning };

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-15');
const TRDIR = path.join(OUTDIR, 'social-r15-transcripts');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function roleOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; return (p && (p.occupationId || p.formerOccupation)) || '?'; }
  catch (e) { return '?'; }
}
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

function driveOne(Game, vid, tag, convoLog) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const out = { vid, name: vname(Game, vid), tag, day, turns: 0, naturalEnd: false, asked: [], answered: [], transcript: [], threads: [] };
  const askedSet = new Set();
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  noteThread();
  const askLineOf = () => {
    try {
      const c = Game.convoGet(vid);
      const tr = (c && c.transcript) || [];
      for (let i = tr.length - 1; i >= 0; i--) {
        if (tr[i].who !== 'you' && tr[i].text) return String(tr[i].text);
      }
    } catch (e) {}
    return '';
  };
  for (let t = 0; t < 12; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    let pick = null;
    if (t >= 3 && !out.recapPicked) {
      pick = choices.find(x => x && /^recap$/.test(String(x.id || '')));
      if (pick) out.recapPicked = 1;
    }
    if (!pick) {
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (ansChoices.length) {
        const qid = String(ansChoices[0].id).split(':')[1];
        if (!askedSet.has(qid)) {
          askedSet.add(qid);
          out.asked.push({ qid, askLine: askLineOf().slice(0, 300), offers: ansChoices.map(x => String(x.id).split(':')[2]) });
        }
      }
      pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^ask:/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    }
    if (!pick) break;
    const pid = String(pick.id || '');
    if (/^ans:/.test(pid) && !/honest_pass/.test(pid)) {
      const parts = pid.split(':');
      out.answered.push({ qid: parts[1], aid: parts[2] });
    }
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
  }
  if (!out.naturalEnd && out.turns >= 12) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
  out.hadGrief = seenThreads.has('grief');
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({
      who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || ''),
    }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

function walkawayProbeFn(Game, vid, day) {
  // r14 pattern: day 5, walk away from a hanging bespoke question.
  try { Game.startConvo(vid); } catch (e) { return null; }
  let hung = null;
  try { const c = Game.convoGet(vid); hung = c && c.pendingQ ? c.pendingQ.id : null; } catch (e) {}
  for (let t = 0; t < 3 && !hung; t++) {
    let cc = null; try { cc = Game.convoGet(vid); } catch (e) {}
    if (!cc || !cc.active) break;
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) break;
    let pick = choices.find(x => x && /^(dlg:help|dlg:details)/.test(String(x.id || '')))
      || choices.find(x => x && !/^(ans:|leave|bye|goodbye|silence)/.test(String(x.id || '')))
      || choices[0];
    if (!pick || /^(leave|bye|goodbye)/.test(String(pick.id || ''))) break;
    try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    try { const c2 = Game.convoGet(vid); hung = c2 && c2.pendingQ ? c2.pendingQ.id : null; } catch (e) {}
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return hung;
}

const MOOT_KEY = /moot|verdict|guilty|not guilty|the count|exile|weregild|advisory|the fire|counts on their fingers|cold war|schism|calls the moot|the moot turns|doesn't wait|everyone will remember|justice/i;

async function oneSeedPolicy(seed, policyId) {
  const t0 = performance.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r15p', fullTelemetry: true });
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);

  // narration stream: the harness silences Game.say/Game.sysSay for sims,
  // which drops every moot beat. Restore them as day-stamped recorders
  // (buffer only — no log writes, no console). Say is display-only, so
  // replacing it changes no game logic.
  const beatBuf = [];
  Game.say = function (msg) {
    try { beatBuf.push({ day: curDay(), kind: 'say', text: String(msg == null ? '' : msg) }); if (beatBuf.length > 20000) beatBuf.shift(); } catch (e) {}
  };
  Game.sysSay = function (msg) {
    try { beatBuf.push({ day: curDay(), kind: 'sys', text: String(msg == null ? '' : msg) }); if (beatBuf.length > 20000) beatBuf.shift(); } catch (e) {}
  };

  // recall signatures (r13/r14 metric set)
  const cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'characterGen.json'), 'utf8'));
  const recallSigs = [];
  for (const q of (cg.convo && cg.convo.questions) || []) {
    if (q.recalls) for (const [aid, text] of Object.entries(q.recalls)) {
      const raw = String(text).replace(/\\"/g, '');
      recallSigs.push({ qid: q.id, aid, sig: raw.split('{')[0].slice(0, 45) });
    }
  }

  const qa = { askedTotal: 0, answeredTotal: 0, recallHits: [] };
  const answeredPairs = new Map();
  const convoLog = [];
  const walkawayProbe = { done: false, hung: null };
  const deaths = [];          // {cid, vid, name, role, day, cause, killerId, player}
  const deathTargets = new Map(); // cid -> [survivor vids]
  const seenCorpseIds = new Set();
  const mootCases = new Map(); // caseId -> snapshot
  const moots = [];           // {caseId, day, charge, accuser, accused, playerVote}
  const playerDeaths = [];
  let lastBearer = null;

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = Game.villagerId;
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };

  function affinityOrder(deadVid) {
    const others = livingIds().filter(id => id !== deadVid);
    return others.map(id => ({ id, aff: safe(() => Game.pairAffinity(deadVid, id), null) }))
      .sort((a, b) => (b.aff == null ? -1e9 : b.aff) - (a.aff == null ? -1e9 : a.aff))
      .map(x => x.id);
  }

  function scanDeaths() {
    const corpses = safe(() => Game.corpses() || [], []);
    for (const cp of corpses) {
      if (!cp || seenCorpseIds.has(cp.id)) continue;
      seenCorpseIds.add(cp.id);
      const kind = cp.kind || '';
      if (kind !== 'person' && kind !== 'villager') continue;
      const d = {
        cid: cp.id, vid: cp.villagerId || null, name: cp.name || 'someone',
        role: cp.villagerId ? roleOf(Game, cp.villagerId) : '?',
        day: cp.dayDied || 0, cause: cp.cause || '?',
        killerId: cp.killerId || null, killerName: cp.killerId ? vname(Game, cp.killerId) : null,
        player: false,
      };
      deaths.push(d);
      deathTargets.set(cp.id, affinityOrder(cp.villagerId).slice(0, 3));
    }
    // succession watch: a changed bearer id means the player died.
    try {
      if (lastBearer !== null && Game.villagerId !== lastBearer) {
        playerDeaths.push({ day: curDay(), prevBearer: lastBearer, prevName: vname(Game, lastBearer) });
      }
      lastBearer = Game.villagerId;
    } catch (e) {}
  }

  function caseSnap(c) {
    return {
      id: c.id, charge: c.charge || '?',
      status: c.status || '?',
      accuser: c.accuser || null, accuserName: c.accuser ? vname(Game, c.accuser) : null,
      accused: (c.accused || []).slice(),
      accusedNames: (c.accused || []).map(a => vname(Game, a)),
      trialDay: c.trial ? (c.trial.day || null) : null,
      trialConvicted: c.trial ? !!c.trial.convicted : null,
      trialGuilty: c.trial ? (c.trial.guilty || 0) : null,
      trialFinalGuilty: c.trial ? (c.trial.finalGuilty || null) : null,
      trialPresent: c.trial ? (c.trial.present || []).length : null,
      trialVoters: c.trial ? (c.trial.present || []).length + (c.trial.playerVoter ? 1 : 0) : null,
      wildDay: c.trial ? !!c.trial.wildDay : null,
      resolution: c.resolution || null,
      votes: c.trial ? (c.trial.votes || []).map(v => ({ name: vname(Game, v.vid), vote: v.vote, score: v.score })) : null,
    };
  }

  // MOOT TRANSCRIPTS are written INCREMENTALLY at resolution time: the
  // beat buffer is a rolling cap, so end-of-run extraction loses early
  // moots. Writing at resolution keeps the trial-day window intact.
  const mootFileWritten = new Set();
  function writeMootFile(m) {
    if (mootFileWritten.has(m.caseId)) return null;
    mootFileWritten.add(m.caseId);
    const snap = mootCases.get(m.caseId) || {};
    const n = moots.indexOf(m) + 1;
    const D = m.day != null ? m.day : 0;
    const lines = [];
    lines.push(`MOOT #${n} — seed ${seed} / ${policyId} — trial day ${D}`);
    lines.push(`case: ${m.caseId} — charge: ${m.charge}`);
    lines.push(`accuser: ${m.accuser || '?'} — accused: ${(m.accused || []).join(', ') || '?'}`);
    lines.push(`present: ${snap.trialPresent != null ? snap.trialPresent : '?'} voters (incl. player: ${snap.trialVoters != null ? snap.trialVoters : '?'})${snap.wildDay ? ' [wild day]' : ''}`);
    lines.push(`player vote: ${m.playerVote || 'n/a (not a voter)'}`);
    lines.push(`verdict: ${m.resolution || 'unresolved'}${m.convicted != null ? ` (convicted=${m.convicted})` : ''}`);
    if (snap.votes && snap.votes.length) {
      const g = snap.votes.filter(v => v.vote === 'guilty');
      const a = snap.votes.filter(v => v.vote === 'acquit');
      lines.push(`NPC votes (${snap.votes.length}): guilty=${g.length} [${g.map(v => v.name).join(', ')}] | acquit=${a.length} [${a.map(v => v.name).join(', ')}]`);
    }
    lines.push('--- beat sequence (narration stream, moot-keyword lines +/- 3 context) ---');
    const pool = beatBuf.filter(b => b.day >= D - 1 && b.day <= D + 3);
    const hits = [];
    pool.forEach((b, i) => { if (MOOT_KEY.test(b.text)) hits.push(i); });
    const keep = new Set();
    for (const i of hits) for (let j = Math.max(0, i - 3); j <= Math.min(pool.length - 1, i + 3); j++) keep.add(j);
    if (!keep.size && pool.length) {
      lines.push(`(no moot-keyword lines in beat stream for days ${D - 1}..${D + 3}; ${pool.length} lines total in window)`);
    } else if (!pool.length) {
      lines.push(`(beat buffer held no lines for days ${D - 1}..${D + 3} — window rolled out of the capped stream)`);
    } else {
      for (const i of [...keep].sort((a, b) => a - b)) {
        lines.push(`[day ${pool[i].day}] ${pool[i].text}`);
      }
    }
    const fn = `${seed}-${policyId}-moot-${n}.txt`;
    fs.writeFileSync(path.join(TRDIR, fn), lines.join('\n') + '\n');
    return fn;
  }

  function scanMoots() {
    const bs = safe(() => Game.betrayalState(), null);
    const cases = (bs && bs.cases) || [];
    for (const c of cases) {
      const prev = mootCases.get(c.id);
      const now = caseSnap(c);
      // newly fired trial: record once
      if (now.trialDay != null && (!prev || prev.trialDay == null)) {
        moots.push({ caseId: c.id, day: now.trialDay, charge: now.charge, accuser: now.accuserName, accused: now.accusedNames, playerVote: null });
      }
      if (prev) {
        const m = moots.find(x => x.caseId === c.id);
        if (m) {
          if (m.day == null && now.trialDay != null) m.day = now.trialDay;
          m.resolution = now.resolution || m.resolution;
          m.convicted = now.trialConvicted;
          // write the transcript as soon as the verdict lands — the beat
          // buffer is rolling, so waiting for end-of-run loses early moots.
          if (now.resolution && !mootFileWritten.has(c.id)) {
            const fn = writeMootFile(m);
            if (fn) m.file = fn;
          }
        }
      }
      mootCases.set(c.id, now);
      // player-vote duty: trials awaiting the player's vote stall forever
      // in headless runs. A competent player goes with the room majority.
      try {
        if (c.trial && c.trial.awaitingPlayerVote && Game.castPlayerVote) {
          const need = Math.floor(((c.trial.present || []).length + 1) / 2) + 1;
          const guiltySoFar = c.trial.guiltySoFar || c.trial.guilty || 0;
          const vote = guiltySoFar >= need ? 1 : 0;
          Game.castPlayerVote(c.id, vote);
          const m = moots.find(x => x.caseId === c.id);
          if (m) m.playerVote = vote ? 'guilty' : 'acquit';
        }
      } catch (e) {}
    }
  }

  function driveConvos() {
    const roster = livingIds();
    const day = curDay();
    for (const vid of roster) {
      const out = driveOne(Game, vid, 'daily', convoLog);
      qa.askedTotal += out.asked.length;
      qa.answeredTotal += out.answered.length;
      for (const a of out.answered) {
        if (!answeredPairs.has(vid)) answeredPairs.set(vid, new Map());
        answeredPairs.get(vid).set(a.qid, { aid: a.aid, day: out.day });
      }
      for (const e of out.transcript) {
        if (e.who !== 'NPC') continue;
        const clean = e.text.replace(/\\"/g, '');
        const hit = recallSigs.find(s => clean.indexOf(s.sig) !== -1);
        if (hit) {
          const prev = (answeredPairs.get(vid) || new Map()).get(hit.qid);
          qa.recallHits.push({
            day: out.day, vid: out.name, qid: hit.qid, aid: hit.aid,
            answeredAid: prev ? prev.aid : null, answeredDay: prev ? prev.day : null,
            match: hit.aid === (prev && prev.aid), text: e.text.slice(0, 200),
          });
        }
      }
    }
    if (day === 5 && roster.length && !walkawayProbe.done) {
      walkawayProbe.done = true;
      walkawayProbe.hung = walkawayProbeFn(Game, roster[0], day);
    }
  }

  await setupGame(Game);
  // initial census
  const initialRoster = livingIds().map(id => ({ vid: id, name: vname(Game, id), role: roleOf(Game, id) }));
  lastBearer = safe(() => Game.villagerId, null);

  const base = POLICY_LIB[policyId];
  const pol = Object.assign({}, base, {
    id: 'journey-social-r15p-' + policyId,
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      driveConvos();
      scanDeaths();
      scanMoots();
      ctx.socialConvs = convoLog.length;
    },
  });
  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Math.round(performance.now() - t0);
  scanDeaths(); scanMoots();

  // ---- grief capture selection ----
  const griefFiles = [];
  let griefFileN = 0;
  const capForDeath = (d) => {
    const targets = deathTargets.get(d.cid) || [];
    const window = [];
    for (const o of convoLog) {
      if (o.tag !== 'daily') continue;
      if (!targets.includes(o.vid)) continue;
      if (Math.abs(o.day - d.day) > 3) continue;
      if (!o.transcript || !o.transcript.length) continue;
      window.push(o);
    }
    window.sort((a, b) => ((b.hadGrief ? 1 : 0) - (a.hadGrief ? 1 : 0)) || (Math.abs(a.day - d.day) - Math.abs(b.day - d.day)) || (a.day - b.day));
    return window.slice(0, 8);
  };
  for (const d of deaths) {
    const picks = capForDeath(d);
    const targets = deathTargets.get(d.cid) || [];
    for (const o of picks) {
      griefFileN++;
      const fn = `${seed}-${policyId}-grief-${griefFileN}.txt`;
      const lines = [];
      lines.push(`DEATH: ${d.name} (${d.role}) died day ${d.day} — cause: ${d.cause}${d.killerName ? ' — killer: ' + d.killerName : ''}`);
      lines.push(`SURVIVOR: ${o.name} — convo day ${o.day} (window: death-day +/-3)${o.hadGrief ? ' [grief thread fired]' : ''}${o.threads.length ? ' threads: ' + o.threads.join(',') : ''}`);
      lines.push(`affinity rank: ${targets.indexOf(o.vid) + 1} of ${targets.length} nearest survivors`);
      lines.push('---');
      for (const e of o.transcript) lines.push(`${e.who}: ${e.text}`);
      fs.writeFileSync(path.join(TRDIR, fn), lines.join('\n') + '\n');
      griefFiles.push(fn);
    }
  }
  const griefThreads = convoLog.filter(o => o.hadGrief).length;

  // ---- moot transcripts: sweep any moot that resolved without a file
  // (or never resolved) — incremental writes above cover the rest.
  const mootFiles = [];
  for (const m of moots) {
    if (m.file) { mootFiles.push(m.file); continue; }
    const fn = writeMootFile(m);
    if (fn) { m.file = fn; mootFiles.push(fn); }
  }

  const vv = Game.state.village || {};
  const end = {
    day: curDay(),
    alive: (vv.roster || []).length,
    fallen: deaths.length,
    outcome: (result && result.outcome) || null,
    endReason: result ? result.endReason : null,
  };
  const census = {
    alive: livingIds().map(id => ({ name: vname(Game, id), role: roleOf(Game, id) })),
    dead: deaths.map(d => ({ name: d.name, role: d.role, day: d.day, cause: d.cause, killer: d.killerName })),
    playerDeaths,
  };
  const out = {
    seed, policy: policyId, daycap: DAYCAP, ms,
    endDay: end.day, alive: end.alive, fallen: end.fallen,
    convos: convoLog.length,
    qa: { asked: qa.askedTotal, answered: qa.answeredTotal, recalls: qa.recallHits.length },
    griefThreads,
    griefFiles,
    mootsFired: moots.length,
    mootFiles,
    moots: moots.map(m => ({ caseId: m.caseId, day: m.day, charge: m.charge, accuser: m.accuser, accused: m.accused, resolution: m.resolution, playerVote: m.playerVote })),
    deaths: deaths.map(d => ({ day: d.day, name: d.name, role: d.role, cause: d.cause, killer: d.killerName })),
    census,
    endReason: end.endReason,
  };
  fs.writeFileSync(path.join(OUTDIR, `journey-social-r15-pilot-${seed}-${policyId}.json`), JSON.stringify(out, null, 1));
  console.log(`seed ${seed} ${policyId}: day=${end.day} alive=${end.alive} fallen=${deaths.length} convos=${convoLog.length} qa=${qa.askedTotal}/${qa.answeredTotal}/${qa.recallHits.length} griefThreads=${griefThreads} moots=${moots.length} playerDeaths=${playerDeaths.length} (${ms}ms)`);
  return out;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.mkdirSync(TRDIR, { recursive: true });
  const all = [];
  for (const seed of SEEDS) {
    for (const pid of POLICY_IDS) {
      if (!POLICY_LIB[pid]) { console.log('unknown policy ' + pid); continue; }
      all.push(await oneSeedPolicy(seed, pid));
    }
  }
  const agg = {
    seeds: SEEDS, policies: POLICY_IDS, daycap: DAYCAP,
    runs: all.map(e => ({ seed: e.seed, policy: e.policy, endDay: e.endDay, alive: e.alive, fallen: e.fallen, convos: e.convos, griefThreads: e.griefThreads, mootsFired: e.mootsFired, playerDeaths: e.census.playerDeaths.length })),
  };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r15-pilot.json'), JSON.stringify(agg, null, 1));
  console.log('aggregate:', JSON.stringify(agg, null, 1));
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
