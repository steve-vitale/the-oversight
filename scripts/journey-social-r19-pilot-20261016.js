#!/usr/bin/env node
// journey-social-r19-pilot-20261016.js — LEG 5 SOCIAL LIFE, r19 pilot.
// Pre-registration: goal hidden_files/evidence/2026-10-16/journey-social-r19.md
// (written BEFORE any run).
// Leg questions: (1) r18 design Q1 — does the run-ledger still eat openers
// often enough to read robotic? (2) post-r16 acute-grief fix: do grief
// threads fire in the death window and read as human sense?
// Binding: M1 opener-deflection BLANK-CONFIRMED if >=15% of driven convos
// open on a deflection line (Game.convoIsDeflectionLine) or >=5 thread-vs-line
// mismatches in the sense sample; M2 grief carry GO if >=60% of
// grief-window convos carry grief; M3 people check >=6/8 transcripts meet the
// bar; M4 survival >=4/6 runs reach day 60 with >=5 alive.
// Policies: competent + larceny-leaning, identical seeds 1304..1306.
// Driver: r18 pattern + opener/grief instrumentation. DAYCAP=60.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1304, 1305, 1306]);
const POLICY_IDS = (process.env.POLICIES ? process.env.POLICIES.split(',') : ['competent', 'larceny-leaning']);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { larcenyLeaning } = require('./policies/larceny-leaning');
const POLICY_LIB = { competent, 'larceny-leaning': larcenyLeaning };

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-16');
const TRDIR = path.join(OUTDIR, 'social-r19-transcripts');
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
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({
      who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || ''),
    }));
  } catch (e) {}
  // (g) deflection density: classify NPC lines with the game's own pool.
  try {
    let d = 0, n = 0, streak = 0, maxStreak = 0;
    for (const e of out.transcript) {
      if (e.who !== 'NPC') { continue; }
      n++;
      if (Game.convoIsDeflectionLine(e.text)) { d++; streak++; if (streak > maxStreak) maxStreak = streak; }
      else { streak = 0; }
    }
    out.deflectLines = d; out.npcLines = n;
    out.deflectShare = n ? d / n : 0; out.maxDeflectStreak = maxStreak;
  } catch (e) { out.deflectLines = 0; out.npcLines = 0; out.deflectShare = 0; out.maxDeflectStreak = 0; }
  // (r19 M1) opener capture: first NPC line + the opener's intended thread.
  // If the run-ledger ate the opener, the first NPC line is a deflection
  // while out.threads[0] still records the intended content thread.
  try {
    out.openerThread = out.threads[0] || null;
    const firstNpc = (out.transcript || []).find(e => e.who === 'NPC') || null;
    out.openerLine = firstNpc ? String(firstNpc.text).slice(0, 400) : null;
    out.openerDeflect = !!(firstNpc && Game.convoIsDeflectionLine && Game.convoIsDeflectionLine(firstNpc.text));
    const contentThreads = { want: 1, grief: 1, request: 1, goal: 1, recall: 1, secret: 1, taughtref: 1, lately: 1 };
    out.openerMismatch = !!(out.openerDeflect && contentThreads[out.openerThread]);
  } catch (e) { out.openerDeflect = false; out.openerMismatch = false; }
  if (convoLog) convoLog.push(out);
  return out;
}

const MOOT_KEY = /moot|verdict|guilty|not guilty|the count|exile|weregild|advisory|the fire|counts on their fingers|cold war|schism|calls the moot|the moot turns|doesn't wait|everyone will remember|justice/i;

async function oneSeedPolicy(seed, policyId) {
  const t0 = performance.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r19p', fullTelemetry: true });
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);

  const beatBuf = [];
  Game.say = function (msg) {
    try { beatBuf.push({ day: curDay(), kind: 'say', text: String(msg == null ? '' : msg) }); if (beatBuf.length > 20000) beatBuf.shift(); } catch (e) {}
  };
  Game.sysSay = function (msg) {
    try { beatBuf.push({ day: curDay(), kind: 'sys', text: String(msg == null ? '' : msg) }); if (beatBuf.length > 20000) beatBuf.shift(); } catch (e) {}
  };

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
  const deaths = [];
  const seenCorpseIds = new Set();
  // (r19 M2) grief-window instrumentation: first 3 driven convos per day
  // while a death is <=2 days old. Carry = grief thread, deceased-name
  // mention, or grief-signature lines.
  const griefStats = { tagged: 0, carry: 0 };
  const griefFiles = [];
  const mootCases = new Map();
  const moots = [];
  const playerDeaths = [];
  let lastBearer = null;

  // (c) talk requests
  const treqFired = new Set();     // villager ids that ever had a request
  const treqAnswered = new Set();  // requester ids whose request got delivered
  function scanTalkRequests() {
    const v = Game.state.village || {};
    const reqs = v.talkRequests || {};
    for (const rid of Object.keys(reqs)) {
      treqFired.add(rid);
      if (reqs[rid] && reqs[rid].delivered) treqAnswered.add(rid);
    }
  }

  // (e) planted rumor trace
  const rumor = { planted: false, target: null, hearer: null, g: null,
                  repBefore: null, trustBefore: null, trace: [] };
  function repOf(vid) { try { return JSON.parse(JSON.stringify(Game.repOf(vid))); } catch (e) { return {}; } }
  function trustOf(vid) { try { const t = (Game.state.village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return 10; } }
  function plantRumor() {
    const living = livingIds();
    if (living.length < 3) return;
    const target = living[0], hearer = living[1];
    rumor.repBefore = repOf(target);
    rumor.trustBefore = trustOf(target);
    let g = null;
    try { g = Game.spreadRumor(target, 'stingy', hearer); } catch (e) { rumor.plantError = String(e && e.message); }
    rumor.planted = true;
    rumor.target = target; rumor.hearer = hearer;
    rumor.targetName = vname(Game, target); rumor.hearerName = vname(Game, hearer);
    rumor.g = g;
    rumor.trace.push({ day: curDay(), ev: 'planted',
      rep: repOf(target), trust: trustOf(target),
      heard: g ? (g.heard || []).length : null, distortion: g ? g.distortion : null });
  }
  function traceRumor() {
    if (!rumor.planted || !rumor.target) return;
    const v = Game.state.village || {};
    const gs = v.gossip || [];
    const mine = gs.filter(g => g && g.playerRumor && (g.dims || {}).who === rumor.target);
    const top = mine[mine.length - 1];
    rumor.trace.push({ day: curDay(), ev: 'tick',
      rep: repOf(rumor.target), trust: trustOf(rumor.target),
      gossipEntries: mine.length,
      heard: top ? (top.heard || []).length : null,
      heardNames: top ? (top.heard || []).map(id => vname(Game, id)) : null,
      distortion: top ? top.distortion : null });
  }

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = Game.villagerId;
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };

  function scanDeaths() {
    const corpses = safe(() => Game.corpses() || [], []);
    for (const cp of corpses) {
      if (!cp || seenCorpseIds.has(cp.id)) continue;
      seenCorpseIds.add(cp.id);
      const kind = cp.kind || '';
      if (kind !== 'person' && kind !== 'villager') continue;
      deaths.push({
        cid: cp.id, vid: cp.villagerId || null, name: cp.name || 'someone',
        role: cp.villagerId ? roleOf(Game, cp.villagerId) : '?',
        day: cp.dayDied || 0, cause: cp.cause || '?',
        killerId: cp.killerId || null, killerName: cp.killerId ? vname(Game, cp.killerId) : null,
      });
    }
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
      trialFinalGuilty: c.trial ? (c.trial.finalGuilty || null) : null,
      trialPresent: c.trial ? (c.trial.present || []).length : null,
      trialVoters: c.trial ? (c.trial.present || []).length + (c.trial.playerVoter ? 1 : 0) : null,
      wildDay: c.trial ? !!c.trial.wildDay : null,
      resolution: c.resolution || null,
      votes: c.trial ? (c.trial.votes || []).map(v => ({ name: vname(Game, v.vid), vote: v.vote, score: v.score })) : null,
    };
  }

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
      if (now.trialDay != null && (!prev || prev.trialDay == null)) {
        moots.push({ caseId: c.id, day: now.trialDay, charge: now.charge, accuser: now.accuserName, accused: now.accusedNames, playerVote: null });
      }
      if (prev) {
        const m = moots.find(x => x.caseId === c.id);
        if (m) {
          if (m.day == null && now.trialDay != null) m.day = now.trialDay;
          m.resolution = now.resolution || m.resolution;
          m.convicted = now.trialConvicted;
          if (now.resolution && !mootFileWritten.has(c.id)) {
            const fn = writeMootFile(m);
            if (fn) m.file = fn;
          }
        }
      }
      mootCases.set(c.id, now);
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

  // (f) sampled full transcripts: day 15 + day 45, first living villager.
  function sampleTranscript(o) {
    const day = o.day;
    if (day !== 15 && day !== 45) return;
    const first = livingIds()[0];
    if (!first || o.vid !== first) return;
    const fn = `${seed}-${policyId}-sample-day${day}.txt`;
    const lines = [];
    lines.push(`SAMPLED CONVERSATION — seed ${seed} / ${policyId} — day ${day}`);
    lines.push(`NPC: ${o.name} (${roleOf(Game, o.vid)}) — turns ${o.turns} — naturalEnd=${o.naturalEnd}`);
    lines.push(`threads: ${o.threads.join(',') || '(none)'}`);
    lines.push('--- full transcript ---');
    for (const e of o.transcript) lines.push(`${e.who}: ${e.text}`);
    fs.writeFileSync(path.join(TRDIR, fn), lines.join('\n') + '\n');
  }

  // (r19 M2) grief-window transcripts for sense-reading (written per run).
  function writeGriefFile(o) {
    const fn = `grief-${seed}-${policyId}-day${o.day}-${String(o.name || 'x').replace(/[^a-z0-9]+/gi, '_')}.txt`;
    const lines = [];
    lines.push(`GRIEF-WINDOW CONVERSATION - seed ${seed} / ${policyId} - day ${o.day}`);
    lines.push(`NPC: ${o.name} (${roleOf(Game, o.vid)}) - turns ${o.turns} - naturalEnd=${o.naturalEnd}`);
    lines.push(`threads: ${o.threads.join(',') || '(none)'}`);
    lines.push(`deaths in window: ${(o.griefWindow || []).map(g => `${g.name} (d${g.day}, ${g.cause})`).join(' | ')}`);
    lines.push(`griefCarry: ${o.griefCarry}`);
    lines.push('--- full transcript ---');
    for (const e of o.transcript) lines.push(`${e.who}: ${e.text}`);
    try { fs.writeFileSync(path.join(TRDIR, fn), lines.join('\n') + '\n'); griefFiles.push(fn); } catch (e) {}
  }

  function driveConvos() {
    const roster = livingIds();
    const day = curDay();
    const GRIEF_SIG = /thinking about them|wrong kind of quiet|gone and the world|i keep thinking|it's quiet today/i;
    const recentDeaths = deaths.filter(d => day - (d.day || 0) <= 2 && day - (d.day || 0) >= 0);
    const griefNames = recentDeaths.map(d => String(d.name || '').split(' ')[0]).filter(n => n && n.length >= 3);
    let griefTaggedToday = 0;
    for (const vid of roster) {
      const out = driveOne(Game, vid, 'daily', convoLog);
      if (recentDeaths.length && griefTaggedToday < 3) {
        griefTaggedToday++;
        out.griefWindow = recentDeaths.map(d => ({ name: d.name, day: d.day, cause: d.cause }));
        let carry = out.threads.some(t => t === 'grief');
        if (!carry) {
          for (const e of (out.transcript || [])) {
            if (e.who !== 'NPC') continue;
            const t = String(e.text);
            if (GRIEF_SIG.test(t)) { carry = true; break; }
            for (const nm of griefNames) { if (t.indexOf(nm) !== -1) { carry = true; break; } }
            if (carry) break;
          }
        }
        out.griefCarry = carry;
        griefStats.tagged++; if (carry) griefStats.carry++;
        writeGriefFile(out);
      }
      qa.askedTotal += out.asked.length;
      qa.answeredTotal += out.answered.length;
      sampleTranscript(out);
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
  }

  await setupGame(Game);
  const initialRoster = livingIds().map(id => ({ vid: id, name: vname(Game, id), role: roleOf(Game, id) }));
  lastBearer = safe(() => Game.villagerId, null);

  // TRUSTLOG (r17 tooling): TRUSTLOG=/tmp/x.jsonl — log every write to the
  // village trust map with day, id, delta and a short stack. Attribute
  // trust movements to their mechanism (rumor trace vs succession vs
  // justice vs convo rewards). Writes go to the env path (usually /tmp),
  // never into the repo.
  const trustLogPath = process.env.TRUSTLOG || null;
  function trustLog(ev) {
    if (!trustLogPath) return;
    try { fs.appendFileSync(trustLogPath, JSON.stringify(ev) + '\n'); } catch (e) {}
  }
  function wrapTrust() {
    if (!trustLogPath) return;
    const v = Game.state.village || {};
    const t = v.trust;
    if (!t || t.__tlp) return;
    const p = new Proxy(t, {
      set(obj, prop, val) {
        if (prop !== '__tlp' && obj[prop] !== val) {
          trustLog({ day: curDay(), ev: 'trust.set', id: String(prop),
            from: obj[prop] === undefined ? null : obj[prop], to: val,
            stack: (new Error().stack || '').split('\n').slice(2, 6).join(' | ') });
        }
        obj[prop] = val;
        return true;
      },
    });
    Object.defineProperty(p, '__tlp', { value: true, enumerable: false });
    v.trust = p;
  }
  if (trustLogPath) {
    wrapTrust();
    const _bt = Game.bumpTrust ? Game.bumpTrust.bind(Game) : null;
    if (_bt) Game.bumpTrust = function (vid, n, reason) {
      trustLog({ day: curDay(), ev: 'trust.bump', id: String(vid), delta: n,
        reason: reason || null,
        stack: (new Error().stack || '').split('\n').slice(2, 5).join(' | ') });
      return _bt(vid, n, reason);
    };
  }

  const base = POLICY_LIB[policyId];
  const pol = Object.assign({}, base, {
    id: 'journey-social-r19p-' + policyId,
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      if (trustLogPath) wrapTrust(); // v.trust may be reassigned mid-run
      driveConvos();
      scanDeaths();
      scanMoots();
      scanTalkRequests();
      if (curDay() === 20 && !rumor.planted) plantRumor();
      if (rumor.planted && curDay() >= 20 && curDay() <= 34) traceRumor();
      ctx.socialConvs = convoLog.length;
    },
  });
  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Math.round(performance.now() - t0);
  scanDeaths(); scanMoots();

  // moot transcripts: sweep unresolved/never-resolved moots (r16 pattern)
  const mootFiles = [];
  for (const m of moots) {
    if (m.file) { mootFiles.push(m.file); continue; }
    const fn = writeMootFile(m);
    if (fn) { m.file = fn; mootFiles.push(fn); }
  }

  // (a) goal/want share, (b) natural endings
  const goalWantConvos = convoLog.filter(o => o.threads.some(t => t === 'goal' || t === 'want')).length;
  const requestConvos = convoLog.filter(o => o.threads.some(t => t === 'request')).length;
  const naturalConvos = convoLog.filter(o => o.naturalEnd).length;
  const threadCounts = {};
  for (const o of convoLog) for (const t of o.threads) threadCounts[t] = (threadCounts[t] || 0) + 1;

  // (e) rumor verdict
  const repAfter = rumor.target ? repOf(rumor.target) : null;
  const trustAfter = rumor.target ? trustOf(rumor.target) : null;
  const repDelta = (rumor.repBefore && repAfter) ? (repAfter.generous || 0) - (rumor.repBefore.generous || 0) : null;
  const trustDelta = (rumor.trustBefore != null && trustAfter != null) ? trustAfter - rumor.trustBefore : null;

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
    goalWantConvos, requestConvos, naturalConvos, threadCounts,
    qa: { asked: qa.askedTotal, answered: qa.answeredTotal, recalls: qa.recallHits.length },
    // Flat dotted keys: the telemetry-check baseline schema (r18 adopts it;
    // legacy keys above stay for r15-r17 key parity).
    'qa.askedTotal': qa.askedTotal,
    'qa.answeredTotal': qa.answeredTotal,
    'qa.recallHits': qa.recallHits.length,
    'end.day': end.day,
    'end.alive': end.alive,
    opener: {
      convos: convoLog.length,
      deflected: convoLog.filter(o => o.openerDeflect).length,
      mismatched: convoLog.filter(o => o.openerMismatch).length,
      byThread: (() => { const m = {}; for (const o of convoLog) if (o.openerDeflect) m[o.openerThread || '?'] = (m[o.openerThread || '?'] || 0) + 1; return m; })(),
    },
    grief: { tagged: griefStats.tagged, carry: griefStats.carry, files: griefFiles },
    deflect: {
      lines: convoLog.reduce((t, c) => t + (c.deflectLines || 0), 0),
      npcLines: convoLog.reduce((t, c) => t + (c.npcLines || 0), 0),
      maxStreak: Math.max(0, ...convoLog.map(c => c.maxDeflectStreak || 0)),
    },
    talkRequests: { fired: treqFired.size, answered: treqAnswered.size,
                    firedIds: [...treqFired].map(id => vname(Game, id)) },
    rumor: { planted: rumor.planted, plantError: rumor.plantError || null,
             target: rumor.targetName || null, hearer: rumor.hearerName || null,
             repBefore: rumor.repBefore ? rumor.repBefore.generous : null,
             repAfter: repAfter ? repAfter.generous : null, repDelta,
             trustBefore: rumor.trustBefore, trustAfter, trustDelta,
             trace: rumor.trace },
    mootsFired: moots.length,
    mootFiles,
    moots: moots.map(m => ({ caseId: m.caseId, day: m.day, charge: m.charge, accuser: m.accuser, accused: m.accused, resolution: m.resolution, playerVote: m.playerVote })),
    deaths: deaths.map(d => ({ day: d.day, name: d.name, role: d.role, cause: d.cause, killer: d.killerName })),
    census,
    endReason: end.endReason,
  };
  fs.writeFileSync(path.join(OUTDIR, `journey-social-r19-pilot-${seed}-${policyId}.json`), JSON.stringify(out, null, 1));
  console.log(`seed ${seed} ${policyId}: day=${end.day} alive=${end.alive} fallen=${deaths.length} convos=${convoLog.length} openerDefl=${convoLog.filter(o => o.openerDeflect).length} openerMis=${convoLog.filter(o => o.openerMismatch).length} grief=${griefStats.carry}/${griefStats.tagged} goalWant=${goalWantConvos} request=${requestConvos} natural=${naturalConvos} treq=${treqFired.size}/${treqAnswered.size} rumor=${rumor.planted ? (repDelta + '/trust' + trustDelta) : 'no'} moots=${moots.length} (${ms}ms)`);
  return out;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  // FRESH TRANSCRIPT DIR (r16 2026-10-15 lesson): stale files from earlier
  // executions mixed with final-run files and a pre-fix transcript was
  // misread as post-fix evidence. Wipe on launch.
  try { fs.rmSync(TRDIR, { recursive: true, force: true }); } catch (e) {}
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
    runs: all.map(e => ({ seed: e.seed, policy: e.policy, endDay: e.endDay, alive: e.alive, fallen: e.fallen, convos: e.convos,
      goalWantConvos: e.goalWantConvos, requestConvos: e.requestConvos, naturalConvos: e.naturalConvos,
      treqFired: e.talkRequests.fired, treqAnswered: e.talkRequests.answered,
      rumorRepDelta: e.rumor.repDelta, rumorTrustDelta: e.rumor.trustDelta,
      mootsFired: e.mootsFired, playerDeaths: e.census.playerDeaths.length,
      openerDeflected: e.opener.deflected, openerMismatched: e.opener.mismatched,
      griefCarry: e.grief.carry, griefTagged: e.grief.tagged })),
  };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r19-pilot.json'), JSON.stringify(agg, null, 1));
  console.log('aggregate:', JSON.stringify(agg, null, 1));
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
