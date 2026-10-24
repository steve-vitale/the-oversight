#!/usr/bin/env node
// journey-social-r49-20261024.js -- SOCIAL leg (leg 5), r49 (lane B).
// PRE-REGISTERED in hidden_files/evidence/2026-10-24/journey-social-r49-prereg.md
// (written before this ran).
//
// Leg question (r49): FOLLOW-THROUGH — answers r48's metric review:
//   1. CONDITIONAL TP RATE: pooled 16.2% mixed an impossible early window
//      (19/37 reads before any friendship) with the real signal (6/18 =
//      33.3% at/after firstDeep2Day). Headline M3 is now the conditional rate.
//   2. GRIEVANCE STATE, NOT EVENTS: r48 wrapped recordGrievance events (7
//      in 4 runs) while reads fired from stored state throughout. Snapshot
//      v.betrayal.grievances[] + v.conflicts[] daily; score state-level cracks.
//   3. FALLBACK-DESIGN QUESTION: r48's residual fossil class (31/37 reads
//      not naming a real friendship, 8 with NO ledger record). Classify
//      every close-read (TP / shallow / null / missed-TP); fix only if the
//      pre-registered trigger fires (see prereg), else document as-is.
// Seeds: 4501-4504 (fresh). Horizon: DAYCAP=140, death-aware.
// Policy: warm-competent + 3 gossip-first convos/day (deep mode), as r47/r48,
// PLUS d50+ steering: othersDoneToday resets before EACH daily convo from
// d50 on (up to 3 others-steered convos/day late, vs 1/day early).
// Bindings (a miss is NO-GO, never re-scored):
//   M1 formation: >=2 NPC-NPC pairs reach depth >= 2 on >=3/4 seeds by d140.
//   M2-state (NEW, not a re-score): >=1 state-level grievance on >=2/4 seeds
//       where the pair is depth >= 2 at first state appearance, OR v drops
//       >= 10 within 7d of that appearance.
//   M3-cond (NEW headline): pooled conditional TP rate (close-reads naming
//       a depth>=2 pair at/after firstDeep2Day / all close-reads at/after
//       firstDeep2Day) >= 25%, AND >=1 conditional TP read on >=2/4 seeds.
//       Pooled rate still reported for continuity.
//   M4 knack stay-green: zero same-teller same-knack identical anecdote repeats.
//   M5 people: >=4 bond-relevant transcripts sense-read, 0 fabricated flags.
//   M6 guardrail: >=3/4 seeds end with >=5 alive, village not scattered.
//   FALLBACK TRIGGER: if late close-reads (day >= firstDeep2Day) are >= 20%
//       null-class, or >= 3 null late reads on >=2 seeds, implement the
//       fallback fix (live-bond preference, neutral line when no live bond)
//       + proof test + post-fix seed check; else ship no game-code change.
// TOOLING ONLY unless the fallback trigger fires (then a separate fix commit).
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const OUTROOT = process.env.OUTROOT || path.join(REPO, 'evidence', '2026-10-24');
const EVIDIR = path.join(OUTROOT, 'r49');
const TDIR = path.join(EVIDIR, 'transcripts');
const SDIR = path.join(EVIDIR, 'summaries');
for (const d of [EVIDIR, TDIR, SDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 4505;
const SMOKE_DAYS = 12;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [4501, 4502, 4503, 4504]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const GOSSIP_TARGET = 3;

// writeFileFlap (infra 2026-10-19, worsened 2026-10-23): queue all output,
// flush once at end with long EPERM retries.
const pendingWrites = [];
function queueWrite(p, data) { pendingWrites.push({ p, data }); }
function flushWrites() {
  let ok = 0, lost = 0;
  for (const { p, data } of pendingWrites) {
    let done = false, last = null;
    for (let i = 0; i < 40 && !done; i++) {
      try { fs.writeFileSync(p, data); done = true; }
      catch (e) { last = e; if (!/EPERM/.test(String(e && e.message))) break; }
      if (!done) { const t0 = Date.now(); while (Date.now() - t0 < 3000) {} }
    }
    if (done) ok++;
    else {
      lost++;
      console.log(`LOST-FILE (EPERM flap outlasted 40 retries): ${p} [${String(last && last.message || '').slice(0, 80)}]`);
      console.log(`LOST-HEAD ${p}: ${String(data).slice(0, 600)}`);
    }
  }
  console.log(`FLUSH: ${ok} written, ${lost} lost to EPERM flap.`);
  return lost === 0;
}

const { mulberry32, loadGame, setupGame, runDays, manifest } = require(REPO + '/scripts/sim-harness');
const { competent } = require(REPO + '/scripts/policies/competent');

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

// --- bond serve-line matchers ---
function isCloseReadLine(text) {
  const t = String(text || '');
  return /trust .* with my pack|keeps me sane|notice if they stopped showing up/i.test(t);
}
function isGrievanceLine(text) {
  const t = String(text || '');
  return /hasn't forgiven|won't forgive|still hasn't|not.*forgiven/i.test(t);
}
function isKnackGossipLine(text) {
  const t = String(text || '');
  return /found a lost knife by smell|cuts close faster when|talks to the garden|stray dog|ate something last month|sees in the dark/i.test(t);
}

function driveOne(Game, vid, tag, mode, convoLog, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const moodAtStart = safe(() => Game.npcMood(vid), '?');
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [], maxDeadAirStreak: 0,
    npcTurns: 0, dryLines: 0, gossipPicks: 0, comfortPicks: 0, moodAtStart,
    repeatHits: [], closeReads: 0, grievanceServes: 0, knackGossips: 0, othersSteered: false,
  };
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  const seenContent = new Set();
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  noteThread();
  const seenIds = [];
  let deadStreak = 0;
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
    let pick = null;
    if (mode === 'deep') {
      if (!pick && runState.gossipPicks < GOSSIP_TARGET) {
        const g = byId(/^ask:gossip$/);
        if (g && (fresh(g) || !seenIds.some(id => id === 'ask:gossip'))) pick = g;
        if (pick) { runState.gossipPicks++; out.gossipPicks++; }
      }
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (!pick && ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
        pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
      // r49 (as r48): steer one convo per day toward 'others' (t2gen_others surface).
      // The subject menu shows only 1-2 fresh t2 topics (defs order); work
      // through the queue — discussed topics drop behind, 'others' surfaces.
      if (!pick && !runState.othersDoneToday) {
        const o = byId(/^ask:others$/);
        if (o && fresh(o)) { pick = o; runState.othersDoneToday = true; out.othersSteered = true; }
        else {
          const c2 = safe(() => Game.convoGet(vid), null);
          if (c2 && c2.choosingSubject) {
            const t2 = choices.find(x => x && fresh(x) && /^ask:(lately|where|you|fears|neighbors|advice|oldworld|skills|systemtake|loved|personal)$/.test(String(x.id || '')));
            if (t2) pick = t2;
            else { const more = byId(/^menu:more$/); if (more) pick = more; }
          }
          if (!pick) { const subj = byId(/^(dlg:)?subject$/); if (subj && fresh(subj)) pick = subj; }
        }
      }
      if (!pick) pick = choices.find(x => String(x.id || '') === 'more');
      if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
      if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && /^(agree|joke|silence|react:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    }
    if (!pick) break;
    const pickId = String(pick.id || '');
    seenIds.push(pickId);
    if (/^dlg:(comfort|empathize|stay)$/.test(pickId)) { out.comfortPicks++; }
    const beforeLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try { Game.convoTurn(vid, pickId); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
    const afterLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try {
      const cc = Game.convoGet(vid);
      const tr = (cc && cc.transcript) || [];
      for (let i = beforeLen; i < tr.length; i++) {
        const e = tr[i];
        const who = (e && e.who) || (e && e.speaker) || '?';
        const text = (e && (e.text || e.line)) || '';
        if (text) {
          out.transcript.push({ who, text: String(text).slice(0, 600) });
          if (isCloseReadLine(text)) out.closeReads++;
          if (isGrievanceLine(text)) out.grievanceServes++;
          if (isKnackGossipLine(text)) out.knackGossips++;
        }
      }
      const nl = String(((tr[tr.length - 1]) || {}).text || '');
      if (/^(agree|joke|silence|react:)/.test(pickId)) { out.dryLines++; deadStreak++; out.deadAir.push({ pickId, line: nl.slice(0, 120) }); }
      else { out.npcTurns++; deadStreak = 0; }
      out.maxDeadAirStreak = Math.max(out.maxDeadAirStreak, deadStreak);
      const nrm = nl.trim().replace(/^\"+|\"+$/g, '');
      if (nrm && seenContent.has(nrm)) out.repeatHits.push({ turn: t, pickId, line: nl.slice(0, 140) });
      else if (nrm) seenContent.add(nrm);
    } catch (e) {}
  }
  if (convoLog) convoLog.push(out);
  return out;
}

async function runWorld({ seed, days, policyId }) {
  const { Game, manifest: mf } = await loadGame({ seed, mode: policyId, fullTelemetry: true });
  await setupGame(Game);
  // SMOKE ONLY: instrument test — open the trust-gated topics (ask:others
  // needs minTrust 20) so the t2pickOther wrap can prove it fires. Full
  // seeds run unmodified.
  if (String(policyId).endsWith('-smoke')) {
    try {
      const v = Game.state.village || {};
      v.trust = v.trust || {};
      for (const id of (v.roster || [])) v.trust[id] = Math.max(v.trust[id] || 10, 30);
    } catch (e) {}
  }
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const runState = { gossipPicks: 0, seed, othersDoneToday: false };
  const t2picks = [];      // every t2pickOther call: {day, vid, id, why, +live class}
  const grievances = [];   // every recordGrievance: {day, by, against, kind, severity}
  const bondSnaps = [];    // every-5d bond census
  const grievStateSnaps = []; // DAILY grievance-state census (r49): betrayal + conflicts
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  // r48 wraps (as r47): t2pickOther (the 'close' surface) + recordGrievance (crack events).
  try {
    const origPick = Game.t2pickOther;
    if (typeof origPick === 'function') {
      Game.t2pickOther = function (vid) {
        let r = null;
        try { r = origPick.apply(this, arguments); } catch (e) {}
        try {
          if (r && r.id) {
            // r49 live classification: exact bond state at pick time (the
            // 5-day pairHist is too coarse for fallback classes).
            let namedDepth = null, speakerHasDeep2 = false, inGroup = false;
            try {
              const vv = Game.state.village || {};
              const roster = (vv.roster || []).filter(id => id !== vid && id !== me());
              const bonds = vv.bonds || {};
              const keyOf = (a, b) => {
                for (const k of Object.keys(bonds)) {
                  const parts = String(k).split('|');
                  if ((parts[0] === a && parts[1] === b) || (parts[0] === b && parts[1] === a)) return k;
                }
                return null;
              };
              const nk = keyOf(String(vid), String(r.id));
              if (nk) namedDepth = (bonds[nk] || {}).depth || 0;
              for (const k of Object.keys(bonds)) {
                const bnd = bonds[k] || {};
                if ((bnd.depth || 0) < 2) continue;
                const parts = String(k).split('|');
                const oid = parts[0] === vid ? parts[1] : parts[1] === vid ? parts[0] : null;
                if (!oid || roster.indexOf(oid) === -1) continue;
                try { if ((Game.getPerson(oid) || {}).dead) continue; } catch (e) {}
                speakerHasDeep2 = true; break;
              }
              for (const g of (vv.groups || [])) {
                const m = g.members || [];
                if (m.includes(vid) && m.includes(String(r.id))) { inGroup = true; break; }
              }
            } catch (e) {}
            t2picks.push({ day: curDay(), vid: String(vid), vidName: vname(Game, vid), id: String(r.id), idName: vname(Game, r.id), why: r.why || '?', namedDepth, speakerHasDeep2, inGroup });
          }
        } catch (e) {}
        return r;
      };
    }
  } catch (e) {}
  try {
    const origGr = Game.recordGrievance;
    if (typeof origGr === 'function') {
      Game.recordGrievance = function (by, against, kind, severity) {
        let r = null;
        try { r = origGr.apply(this, arguments); } catch (e) {}
        try { grievances.push({ day: curDay(), by: String(by), byName: vname(Game, by), against: String(against), againstName: vname(Game, against), kind: kind || '?', severity: severity || 15 }); } catch (e) {}
        return r;
      };
    }
  } catch (e) {}

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = me();
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  function trustOf(vid) { try { const t = (Game.state.village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return 10; } }

  // r49 (as r48): bond census — every 5 days + final. NPC-NPC pairs and player pairs.
  function snapshotGrievanceState() {
    const d = curDay();
    try {
      const v = Game.state.village || {};
      const bet = (((v.betrayal || {}).grievances) || []).map(g => ({ by: String(g.by), against: String(g.against), kind: g.kind || '?', day: g.day || 0 }));
      const conf = (v.conflicts || []).map(c => ({ a: String(c.a), b: String(c.b), resolved: !!c.resolved }));
      grievStateSnaps.push({ day: d, betrayal: bet, conflicts: conf });
    } catch (e) {}
  }

  function snapshotBonds(final) {
    const d = curDay();
    try {
      const v = Game.state.village || {};
      const sid = me();
      const pairs = [], playerPairs = [];
      for (const k of Object.keys(v.bonds || {})) {
        const bnd = v.bonds[k] || {};
        const [a, b] = String(k).split('|');
        const rec = { k, a, aName: vname(Game, a), b, bName: vname(Game, b), v: bnd.v || 0, depth: bnd.depth || 0 };
        if (a === sid || b === sid) playerPairs.push(rec); else pairs.push(rec);
      }
      bondSnaps.push({ day: d, final: !!final, pairs, playerPairs });
    } catch (e) {}
  }

  const talkedToday = new Set();
  function socialConvo() {
    const day = curDay();
    runState.othersDoneToday = false;
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    for (let n = 0; n < 3; n++) {
      const pool = living.filter(id => !talkedToday.has(id));
      const arr = pool.length ? pool : living;
      const target = arr[(day * 7 + n * 5) % arr.length];
      if (!target || talkedToday.has(target)) continue;
      talkedToday.add(target);
      // r49 d50+ steering (pre-registered): each daily convo attempts an
      // 'others' read in the second half, so late reads sample villages
      // where friendships exist (early: 1 others-steered convo/day).
      if (day >= 50) runState.othersDoneToday = false;
      driveOne(Game, target, 'bond-daily-' + (n + 1), 'deep', convoLog, runState);
    }
  }
  function resetTalkLedger() { talkedToday.clear(); }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: policyId,
    daily(Game2, ctx) {
      resetTalkLedger();
      if (base.daily) base.daily(Game2, ctx);
      socialConvo();
      try { snapshotGrievanceState(); } catch (e) {}
      try { if (curDay() % 5 === 0) snapshotBonds(false); } catch (e) {}
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay(), cause: cp.cause || 'unknown' });
      }
    },
  });
  const result = await runDays(Game, pol, { days, manifest: mf });
  snapshotBonds(true);

  // --- bond trajectory analysis ---
  const pairHist = {};   // key -> [{day, v, depth}]
  for (const s of bondSnaps) for (const p of s.pairs) {
    (pairHist[p.k] = pairHist[p.k] || []).push({ day: s.day, v: p.v, depth: p.depth });
  }
  const npcPairs = Object.keys(pairHist).map(k => {
    const h = pairHist[k];
    const maxDepth = Math.max(...h.map(x => x.depth));
    const minDepth = Math.min(...h.map(x => x.depth));
    const maxV = Math.max(...h.map(x => x.v));
    const firstDeep2 = h.find(x => x.depth >= 2);
    return {
      k, aName: h[0] && pairHist[k] ? undefined : undefined,
      maxDepth, minDepth, maxV,
      firstDeep2Day: firstDeep2 ? firstDeep2.day : null,
      finalDepth: h[h.length - 1].depth, finalV: h[h.length - 1].v,
      dropped: maxDepth - h[h.length - 1].depth,   // how much depth was lost
    };
  });
  // attach names
  const nameOf = {};
  for (const s of bondSnaps) for (const p of s.pairs) { nameOf[p.a] = p.aName; nameOf[p.b] = p.bName; }
  for (const np of npcPairs) { const [a, b] = np.k.split('|'); np.aName = nameOf[a] || a; np.bName = nameOf[b] || b; }
  const deep2Pairs = npcPairs.filter(p => p.maxDepth >= 2);
  // grievance -> depth drop within 7d (M2)
  const cracks = [];
  for (const g of grievances) {
    const k = Game.bondKey ? safe(() => Game.bondKey(g.by, g.against), g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by) : (g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by);
    const h = pairHist[k];
    if (!h) continue;
    const before = h.filter(x => x.day <= g.day).slice(-1)[0];
    const after = h.filter(x => x.day > g.day && x.day <= g.day + 7).slice(-1)[0];
    if (before && after && after.depth <= before.depth - 1) {
      cracks.push({ day: g.day, byName: g.byName, againstName: g.againstName, kind: g.kind, depthBefore: before.depth, depthAfter: after.depth });
    }
  }
  // r48 M2-revised: grievance -> warmth (v) drop >= 10 within 7d, and
  // grievances between depth>=2 pairs (the rare event r47 never saw).
  const vCracks = [];
  const friendGrievances = [];
  for (const g of grievances) {
    const k = Game.bondKey ? safe(() => Game.bondKey(g.by, g.against), g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by) : (g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by);
    const h = pairHist[k];
    if (!h) continue;
    const before = h.filter(x => x.day <= g.day).slice(-1)[0];
    const after = h.filter(x => x.day > g.day && x.day <= g.day + 7).slice(-1)[0];
    if (!before || !after) continue;
    if (before.depth >= 2) friendGrievances.push({ day: g.day, byName: g.byName, againstName: g.againstName, kind: g.kind, depthBefore: before.depth, vBefore: before.v, vAfter: after.v });
    if (before.v - after.v >= 10) vCracks.push({ day: g.day, byName: g.byName, againstName: g.againstName, kind: g.kind, vBefore: before.v, vAfter: after.v, depthBefore: before.depth, depthAfter: after.depth });
  }
  // r49 STATE grievances: first appearance per (source,pair,kind) across
  // daily snapshots; score friend-at-appearance + v-drop within 7d (M2-state).
  // NOTE: repeat same-kind grievances between a pair collapse to first
  // appearance (state snapshots cannot count identical entries apart).
  const bondKeyOf = (a, b) => Game.bondKey ? safe(() => Game.bondKey(a, b), a < b ? a + '|' + b : b + '|' + a) : (a < b ? a + '|' + b : b + '|' + a);
  const stateSeen = {};
  const stateGrievances = [];
  for (const snap of grievStateSnaps) {
    for (const g of snap.betrayal) {
      const key = 'bet|' + g.by + '|' + g.against + '|' + g.kind;
      if (stateSeen[key]) continue;
      stateSeen[key] = true;
      stateGrievances.push({ source: 'betrayal', day: snap.day, by: g.by, against: g.against, kind: g.kind, recDay: g.day });
    }
    for (const c of snap.conflicts) {
      if (c.resolved) continue;
      const key = 'conf|' + (c.a < c.b ? c.a + '|' + c.b : c.b + '|' + c.a);
      if (stateSeen[key]) continue;
      stateSeen[key] = true;
      stateGrievances.push({ source: 'conflicts', day: snap.day, by: c.a, against: c.b, kind: 'conflict', recDay: snap.day });
    }
  }
  const stateFriendGrievances = [];
  const stateVCracks = [];
  for (const g of stateGrievances) {
    const k = bondKeyOf(g.by, g.against);
    const h = pairHist[k];
    if (!h) continue;
    const before = h.filter(x => x.day <= g.day).slice(-1)[0];
    const after = h.filter(x => x.day > g.day && x.day <= g.day + 7).slice(-1)[0];
    if (!before || !after) continue;
    if (before.depth >= 2) stateFriendGrievances.push({ day: g.day, source: g.source, byName: undefined, againstName: undefined, kind: g.kind, depthBefore: before.depth, vBefore: before.v, vAfter: after.v });
    if (before.v - after.v >= 10) stateVCracks.push({ day: g.day, source: g.source, kind: g.kind, vBefore: before.v, vAfter: after.v, depthBefore: before.depth, depthAfter: after.depth });
  }
  // attach names to state grievance rows
  for (const row of [...stateFriendGrievances, ...stateVCracks]) {
    const g = stateGrievances.find(x => x.day === row.day && x.source === row.source && x.kind === row.kind);
    if (g) { row.byName = vname(Game, g.by); row.againstName = vname(Game, g.against); }
  }
  // 'close' reads naming ledger pairs (M3): for each t2pick with why=close,
  // look up the pair's ledger depth AT THAT DAY (pairHist, r48 method) AND
  // the exact live class at pick time (r49 wrap values).
  const closeReads = [];
  for (const tp of t2picks) {
    if (tp.why !== 'close') continue;
    const k = tp.vid < tp.id ? tp.vid + '|' + tp.id : tp.id + '|' + tp.vid;
    const h = pairHist[k];
    let ledgerDepth = null, ledgerV = null;
    if (h) {
      const at = h.filter(x => x.day <= tp.day).slice(-1)[0] || h[0];
      ledgerDepth = at.depth; ledgerV = at.v;
    }
    const nd = (tp.namedDepth === undefined || tp.namedDepth === null) ? null : tp.namedDepth;
    const cls = nd !== null && nd >= 2 ? 'TP' : nd === null ? 'null' : (tp.speakerHasDeep2 ? 'missed-TP' : 'shallow');
    closeReads.push({ day: tp.day, vidName: tp.vidName, idName: tp.idName, why: tp.why, ledgerDepth, ledgerV, liveDepth: nd, speakerHasDeep2: !!tp.speakerHasDeep2, inGroup: !!tp.inGroup, cls });
  }
  const firstDeep2DayAll = deep2Pairs.length ? Math.min(...deep2Pairs.map(p => p.firstDeep2Day).filter(d => d !== null)) : null;
  for (const cr of closeReads) cr.late = firstDeep2DayAll !== null && cr.day >= firstDeep2DayAll;
  const lateClose = closeReads.filter(c => c.late);
  const lateTP = lateClose.filter(c => c.cls === 'TP');
  const lateNull = lateClose.filter(c => c.cls === 'null');
  const condRate = lateClose.length ? (lateTP.length / lateClose.length) : null;
  const pooledTP = closeReads.filter(c => c.cls === 'TP').length;
  const pooledRate = closeReads.length ? (pooledTP / closeReads.length) : null;
  const grievReads = t2picks.filter(tp => tp.why === 'grievance' || tp.why === 'vgrievance');
  const grievReadsByWhy = { grievance: grievReads.filter(g => g.why === 'grievance').length, vgrievance: grievReads.filter(g => g.why === 'vgrievance').length };
  const closeReadsTotal = convoLog.reduce((s, o) => s + o.closeReads, 0);
  const grievanceServesTotal = convoLog.reduce((s, o) => s + o.grievanceServes, 0);
  const knackGossipsTotal = convoLog.reduce((s, o) => s + o.knackGossips, 0);
  const knackLines = [];
  for (const o of convoLog) for (const e of o.transcript) if (isKnackGossipLine(e.text)) knackLines.push({ seedDay: o.day, convo: o.name, text: e.text });

  const v = Game.state.village || {};
  let mootsConvened = 0;
  try { mootsConvened = (v.moots || []).length; } catch (e) {}
  const deathCauses = {};
  for (const d of deaths) { const k = String(d.cause || 'unknown'); deathCauses[k] = (deathCauses[k] || 0) + 1; }
  const repeatHits = [];
  for (const o of convoLog) for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, line: r.line });
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);
  return {
    seed, days: curDay(), deaths, deathCauses, alive: livingIds().length,
    convos: convoLog.length, deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    gossipPicks: runState.gossipPicks,
    t2picksTotal: t2picks.length, closeReadsTotal, closeReads,
    grievReads: grievReads.map(g => ({ day: g.day, vidName: g.vidName, idName: g.idName, why: g.why })),
    grievanceServesTotal, grievances, cracks, vCracks, friendGrievances,
    stateGrievances, stateFriendGrievances, stateVCracks, grievStateSnapDays: grievStateSnaps.length,
    firstDeep2DayAll, lateClose: lateClose.length, lateTP: lateTP.length, lateNull: lateNull.length,
    condRate, pooledTP, pooledRate, grievReadsByWhy,
    othersSteered: convoLog.reduce((s, o) => s + (o.othersSteered ? 1 : 0), 0),
    knackGossipsTotal, knackLines,
    npcPairCount: npcPairs.length, deep2Pairs,
    bondSnapDays: bondSnaps.length,
    mootsConvened,
    l3: { bonds: npcPairs.length, deep2: deep2Pairs.length, cracks: cracks.length, vCracks: vCracks.length, friendGrievances: friendGrievances.length, t2picks: t2picks.length, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
    repeatCount: repeatHits.length, repeats: repeatHits.slice(0, 20),
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    endState: {
      over: !!Game.over, villageLost: !!Game.villageLost,
      scattered: !!((Game.state.village || {}).scattered),
      extinct: !!((Game.state.village || {}).extinct),
      scholarExiled: !!((Game.state.scholar || {}).exiled),
      scholarDead: !!((safe(() => Game.getPerson(me()), null) || {}).dead),
    },
    _convoLog: convoLog,
  };
}

(async () => {
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test: bond census + t2pickOther wrap + grievance wrap + convos)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, policyId: 'journey-social-r49-smoke' });
  console.log(`SMOKE: bondSnapDays=${smoke.bondSnapDays} convos=${smoke.convos} t2picks=${smoke.t2picksTotal} grievances=${smoke.grievances.length} npcPairs=${smoke.npcPairCount} grievStateSnaps=${smoke.grievStateSnapDays}`);
  const realTest = smoke.bondSnapDays >= 2 && smoke.convos > 0 && smoke.t2picksTotal > 0 && smoke.grievStateSnapDays >= 2;
  console.log(`SMOKE SELF-TEST: ${realTest ? 'PASS (bond census + grievance-state census live, t2pickOther wrap firing, convos ran)' : 'FAIL (instrument broken — investigate before full seeds)'}`);
  if (!realTest) { console.log('ABORT: instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, policyId: 'journey-social-r49' });
      const convoLog = r._convoLog; delete r._convoLog;
      queueWrite(path.join(EVIDIR, `journey-social-r49-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r49 sense-read set: as r48 (bond-relevant convos) + 1 late convo per seed.
      const bondy = convoLog.filter(o => o.closeReads > 0 || o.grievanceServes > 0 || o.knackGossips > 0).slice(0, 3);
      (bondy.length ? bondy : convoLog.filter(o => o.mode === 'deep' && o.turns >= 4).slice(0, 2)).forEach((o, i) => {
        queueWrite(path.join(TDIR, `s${s}-bondy-${i + 1}-${sname(o)}.txt`),
          [`# FOLLOW-THROUGH sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart}, closeReads=${o.closeReads} grievanceServes=${o.grievanceServes} knackGossips=${o.knackGossips})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      const lates = convoLog.filter(o => o.mode === 'deep' && o.day >= 100 && o.turns >= 5).slice(0, 1);
      (lates.length ? lates : convoLog.filter(o => o.mode === 'deep' && o.turns >= 5).slice(-1)).forEach((o) => {
        queueWrite(path.join(TDIR, `s${s}-late-d${o.day}-${sname(o)}.txt`),
          [`# FOLLOW-THROUGH late sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // bond ledger summary
      const lines = [`# FOLLOW-THROUGH — seed ${s} (${r.days}d, ${r.alive} alive)`, ''];
      lines.push(`npcPairs=${r.npcPairCount} deep2=${r.deep2Pairs.length} cracks=${r.cracks.length} vCracks=${r.vCracks.length} friendGriev=${r.friendGrievances.length} stateGriev=${r.stateGrievances.length} stateFriend=${r.stateFriendGrievances.length} stateVCrack=${r.stateVCracks.length} t2picks=${r.t2picksTotal} closeReadsServed=${r.closeReadsTotal} grievanceServes=${r.grievanceServesTotal} othersSteered=${r.othersSteered}`);
      lines.push(`COND-TP: firstDeep2Day=${r.firstDeep2DayAll} lateClose=${r.lateClose} lateTP=${r.lateTP} lateNull=${r.lateNull} condRate=${r.condRate === null ? 'n/a' : (r.condRate * 100).toFixed(1) + '%'} pooledTP=${r.pooledTP}/${r.closeReads.length} pooledRate=${r.pooledRate === null ? 'n/a' : (r.pooledRate * 100).toFixed(1) + '%'} grievReadsByWhy=${JSON.stringify(r.grievReadsByWhy)}`);
      for (const p of r.deep2Pairs) {
        lines.push(`  FRIEND d${p.firstDeep2Day}: ${p.aName} <> ${p.bName} — maxDepth ${p.maxDepth}, final ${p.finalDepth} (v=${p.finalV}), dropped ${p.dropped}`);
      }
      for (const c of r.cracks) {
        lines.push(`  CRACK d${c.day}: ${c.byName} vs ${c.againstName} (${c.kind}) depth ${c.depthBefore} -> ${c.depthAfter}`);
      }
      for (const vc of r.vCracks) {
        lines.push(`  VCRACK d${vc.day}: ${vc.byName} vs ${vc.againstName} (${vc.kind}) v ${vc.vBefore} -> ${vc.vAfter} (depth ${vc.depthBefore} -> ${vc.depthAfter})`);
      }
      for (const fg of r.friendGrievances) {
        lines.push(`  FRIEND-GRIEV d${fg.day}: ${fg.byName} vs ${fg.againstName} (${fg.kind}) depth ${fg.depthBefore} v ${fg.vBefore} -> ${fg.vAfter}`);
      }
      for (const cr of r.closeReads) {
        lines.push(`  CLOSE-READ d${cr.day}: ${cr.vidName} about ${cr.idName} — live depth=${cr.liveDepth} ledger depth=${cr.ledgerDepth} class=${cr.cls} late=${cr.late} inGroup=${cr.inGroup} speakerHasDeep2=${cr.speakerHasDeep2}`);
      }
      for (const sg of r.stateFriendGrievances) {
        lines.push(`  STATE-FRIEND-GRIEV d${sg.day} (${sg.source}): ${sg.byName} vs ${sg.againstName} (${sg.kind}) depth ${sg.depthBefore} v ${sg.vBefore} -> ${sg.vAfter}`);
      }
      for (const sv of r.stateVCracks) {
        lines.push(`  STATE-VCRACK d${sv.day} (${sv.source}): ${sv.byName} vs ${sv.againstName} (${sv.kind}) v ${sv.vBefore} -> ${sv.vAfter} (depth ${sv.depthBefore} -> ${sv.depthAfter})`);
      }
      for (const g of r.grievReads.slice(0, 6)) {
        lines.push(`  GRIEV-READ d${g.day}: ${g.vidName} about ${g.idName} (why=${g.why})`);
      }
      for (const k of r.knackLines.slice(0, 8)) {
        lines.push(`  KNACK d${k.seedDay} ${k.convo}: ${k.text.slice(0, 120)}`);
      }
      lines.push('', `deathCauses: ${JSON.stringify(r.deathCauses)}`);
      queueWrite(path.join(SDIR, `s${s}-friendship-summary.txt`), lines.join('\n') + '\n');
      results.push(r);
      console.log(`SEED ${s}: ${r.days}d alive=${r.alive} deep2=${r.deep2Pairs.length} cracks=${r.cracks.length} vCracks=${r.vCracks.length} friendGriev=${r.friendGrievances.length} stateFriend=${r.stateFriendGrievances.length} stateVCrack=${r.stateVCracks.length} t2picks=${r.t2picksTotal} closeReads=${r.closeReadsTotal} lateClose=${r.lateClose} lateTP=${r.lateTP} lateNull=${r.lateNull} condRate=${r.condRate === null ? 'n/a' : (r.condRate * 100).toFixed(1) + '%'} grievServes=${r.grievanceServesTotal} knack=${r.knackGossipsTotal} othersSteered=${r.othersSteered}`);
    } catch (e) {
      console.log(`SEED ${s} FAILED: ${e && e.message}`);
    }
  }
  const verd = results.map(r => ({
    seed: r.seed, alive: r.alive, deep2: r.deep2Pairs.length, cracks: r.cracks.length, vCracks: r.vCracks.length, friendGrievances: r.friendGrievances.length,
    stateGrievances: r.stateGrievances.length, stateFriend: r.stateFriendGrievances.length, stateVCracks: r.stateVCracks.length,
    t2picks: r.t2picksTotal, closeReads: r.closeReads.length, grievReads: r.grievReads.length, grievReadsByWhy: r.grievReadsByWhy,
    firstDeep2Day: r.firstDeep2DayAll, lateClose: r.lateClose, lateTP: r.lateTP, lateNull: r.lateNull, condRate: r.condRate,
    pooledTP: r.pooledTP, pooledRate: r.pooledRate, othersSteered: r.othersSteered,
    knack: r.knackGossipsTotal,
  }));
  queueWrite(path.join(EVIDIR, 'r49-verdicts.json'), JSON.stringify(verd, null, 1));
  flushWrites();
  console.log('DONE r49.');
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
