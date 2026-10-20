#!/usr/bin/env node
// journey-social-r34-20261020.js -- SOCIAL leg (leg 5), r34 PILOT + SWEEP.
// PRE-REGISTERED in evidence/2026-10-20/journey-social-r34.md (written before
// this ran). Leg question: does social life go BOTH WAYS over a full run?
// Villagers have real initiation machinery (dayOneNudge, npcInviteTick,
// villagerInitiative hunger/fear approaches, "THEY COME TO YOU" talk
// requests with talkReason lines). Does a competent citizen player actually
// get approached, and do those beats read like people?
// Bindings (a miss is NO-GO, never re-scored):
//   M1 (initiation exists): >=1 ANSWERED talk-request per pilot seed.
//   M2 (reason honesty + follow-through): 0 answered-initiation transcripts
//     with a fabricated reason, false state, or disconnected follow-through.
//     Sense-read of every answered request transcript.
//   M3 (bidirectionality, informational): initiatedConvos vs player-initiated.
//   M4 (people): >=5/6 sense-read transcripts meet the quality bar.
//   M5 (guardrail): >=2/2 pilot seeds end with >=5 alive.
//   L2' (r26 rev #2, standing): ANY verbatim content-line ('beat' kind)
//     repeat within ONE conversation. Every hit = GO finding.
// Interesting-finding bar: talk request naming false state; answered request
// never addressed; <3 answered requests/full run = tuning gap (documented,
// not fixed — rate tuning is Steve's call).
// Seeds: smoke 3200 (10d self-test), pilot 3201, 3202 (fresh; r33 used
// 3104-3107); sweep adds 3203, 3204 when the pilot is interesting.
// Horizon: DAYCAP=120, death-aware (+10d tail via sim-harness runDays).
// Policy: 'citizen' — competent base + talk-request duty (answer EVERY
// request, one sit-down/day) + invite-accept duty (accept pending invites
// every other day) + one deep-daily convo + kindness (giveFood to hungry
// favorites). NO theft, NO cruel picks. No moot duty, no comfort forcing,
// no rivalry instrumentation — other runs' questions.
// TOOLING ONLY -- no game code changes in this file.
// Usage: SEEDS=3201,3202 node scripts/journey-social-r34-20261020.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-20');
const TDIR = path.join(EVIDIR, 'social-r34-transcripts');
for (const d of [EVIDIR, TDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 3200;
const SMOKE_DAYS = 10;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [3201, 3202]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '120', 10);

const { mulberry32, loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

const CG = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characterGen.json'), 'utf8'));
const EXHAUSTED = (CG.convo && CG.convo.exhausted) || [];
const norm = (t) => String(t == null ? '' : t).trim().replace(/^"+|"+$/g, '');
const EXH_SET = new Set(EXHAUSTED.map(norm));

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

function driveOne(Game, vid, tag, mode, convoLog, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [],
    maxDeadAirStreak: 0, endClass: null, winddownSeen: false,
    npcTurns: 0, dryLines: 0, moodAtStart: safe(() => Game.npcMood(vid), '?'),
    repeatHits: [],
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
  let deadStreak = 0, lastNpcLine = null;
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
    let pick = null;
    const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
    if (ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
      pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
    if (!pick) pick = byId(/^betrayal:accept$/);          // answer their invite
    if (!pick) pick = choices.find(x => String(x.id || '') === 'more');
    if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
    if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => fresh(x) && /^(agree|joke|silence|react:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices[0];
    if (!pick) break;
    seenIds.push(String(pick.id || ''));
    const beforeLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
    const tr = safe(() => { const cc = Game.convoGet(vid); return cc.transcript || []; }, []);
    const newE = tr.slice(beforeLen).filter(e => e && e.who !== 'you');
    for (const e of newE) {
      const txt = String(e.text || '');
      const n = norm(txt);
      const isExh = EXH_SET.has(n);
      const isDefl = safe(() => !!Game.convoIsDeflectionLine(txt), false);
      if (isExh || isDefl) { out.dryLines++; deadStreak++; out.maxDeadAirStreak = Math.max(out.maxDeadAirStreak, deadStreak); out.deadAir.push({ turn: t, pickId: String(pick.id || ''), line: txt.slice(0, 140) }); }
      else deadStreak = 0;
      out.npcTurns++;
      lastNpcLine = { turn: t, pickId: String(pick.id || ''), line: txt.slice(0, 120), kind: (isExh || isDefl) ? 'dry' : 'beat' };
      if (!isExh && !isDefl && n.length > 20) {
        if (seenContent.has(n)) out.repeatHits.push({ turn: t, pickId: String(pick.id || ''), line: txt.slice(0, 160) });
        else seenContent.add(n);
      }
    }
  }
  if (!out.naturalEnd && out.turns >= 14) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
  if (lastNpcLine) out.endClass = lastNpcLine.kind;
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({ who: e.who === 'you' ? 'YOU' : (e.who === 'them' || e.who === 'narr' ? 'NARR' : 'NPC'), text: String(e.text || '') }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function runWorld({ seed, days, policyId }) {
  const { Game, manifest: mf } = await loadGame({ seed, mode: policyId, fullTelemetry: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const beatBuf = [];
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };

  // INITIATION INSTRUMENTATION
  const reqEvents = [];        // {day, vid, name, line, fate:'answered'|'expired'|'pending'}
  const reqSeen = new Map();   // vid -> {day, line}
  const approachBeats = [];    // villagerInitiative approach lines from the beat stream
  const inviteEvents = [];     // {day, vid, name, kind:'fired'|'accepted'|'expired', label}
  const inviteSeen = new Map();// vid -> {day, defId}
  const APPROACH_RE = /(sidles up|hovers near you|presses close|glancing at the treeline|talking fast|got anything to eat|filing complaints|I hate asking|Don't suppose you've got food)/;
  // NUDGE BLIND SPOT (r34 instrumentation note): the day-1 nudge fires in
  // endDay and the competent policy's talkRound usually consumes it before
  // the first snapshot can see it undelivered. Detect it from the beat
  // stream instead — it always says its line via this.say.
  const NUDGE_RE = /Day one\. Everyone's pretending/;
  const nudgeBeats = [];
  let lastBeatIdx = 0;

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

  function snapshotRequests() {
    const reqs = safe(() => (Game.state.village || {}).talkRequests || {}, {});
    const now = Object.keys(reqs);
    for (const vid of now) {
      const req = reqs[vid] || {};
      // Delivered (already answered) entries stay in v.talkRequests until
      // expireTalkRequests prunes them — they are not new requests.
      if (req.delivered) continue;
      const reqDay = safe(() => req.day, '?');
      const identity = vid + '@' + reqDay;
      // Dedupe by creation-day identity: an answered request stays in
      // v.talkRequests (delivered) until expireTalkRequests prunes it —
      // without the identity key it re-records as "fired" every day.
      if (!reqSeen.has(identity)) {
        const line = safe(() => String((reqs[vid] || {}).line || '').replace(/__NAME__/g, vname(Game, vid)), '');
        reqEvents.push({ day: curDay(), vid, name: vname(Game, vid), line: line.slice(0, 220), fate: 'pending', reqDay });
        reqSeen.set(identity, { day: curDay(), line });
      }
    }
    for (const identity of [...reqSeen.keys()]) {
      const vid = identity.split('@')[0];
      if (!now.includes(vid)) {
        const ev = reqEvents.find(e => (e.vid + '@' + e.reqDay) === identity && e.fate === 'pending');
        if (ev) ev.fate = 'expired';
        reqSeen.delete(identity);
      }
    }
  }
  function markAnswered(vid) {
    const ev = reqEvents.find(e => e.vid === vid && e.fate === 'pending');
    if (ev) {
      ev.fate = 'answered';
      reqSeen.delete(vid + '@' + ev.reqDay);
    } else {
      reqEvents.push({ day: curDay(), vid, name: vname(Game, vid), line: '(request answered, not in snapshot — pre-existing)', fate: 'answered', reqDay: '?' });
    }
  }
  // Requests the base competent policy's talkRound addressed before our
  // duty ran (it opens conversations too). Not driver-answered, but not
  // expired — the NPC got their talk, incidentally.
  function markIncidental() {
    const reqs = safe(() => (Game.state.village || {}).talkRequests || {}, {});
    for (const e of reqEvents) {
      if (e.fate !== 'pending') continue;
      const r = reqs[e.vid];
      if (r && r.delivered) { e.fate = 'incidental'; reqSeen.delete(e.vid + '@' + e.reqDay); }
    }
  }
  function snapshotInvites() {
    const bs = safe(() => Game.betrayalState(), null);
    const invs = (bs && bs.invites) || {};
    const now = Object.keys(invs).filter(vid => (invs[vid] || {}).pending);
    for (const vid of now) {
      if (!inviteSeen.has(vid)) {
        const defId = safe(() => String((invs[vid].pending || {}).defId || '?'), '?');
        inviteEvents.push({ day: curDay(), vid, name: vname(Game, vid), kind: 'fired', label: defId });
        inviteSeen.set(vid, { day: curDay(), defId });
      }
    }
    for (const vid of [...inviteSeen.keys()]) {
      if (!now.includes(vid)) {
        inviteEvents.push({ day: curDay(), vid, name: vname(Game, vid), kind: 'expired', label: (inviteSeen.get(vid) || {}).defId });
        inviteSeen.delete(vid);
      }
    }
  }
  function scanApproaches() {
    for (let i = lastBeatIdx; i < beatBuf.length; i++) {
      const b = beatBuf[i];
      if (APPROACH_RE.test(b.text)) approachBeats.push({ day: b.day, text: b.text.slice(0, 220) });
      if (NUDGE_RE.test(b.text)) nudgeBeats.push({ day: b.day, text: b.text.slice(0, 220) });
    }
    lastBeatIdx = beatBuf.length;
  }

  const ctx2 = { favorites: null, rotate: 0 };
  function pickFactions() {
    const living = livingIds();
    const byTrust = living.slice().sort((a, b) => trustOf(b) - trustOf(a));
    ctx2.favorites = byTrust.slice(0, 2);
  }
  function kindness() {
    const s = Game.state.scholar || {};
    for (const vid of (ctx2.favorites || [])) {
      if (!livingIds().includes(vid)) continue;
      try {
        const needs = safe(() => Game.npcNeeds(vid) || {}, {});
        if ((needs.hunger || 0) > 30 && (s.kcal || 0) > 1200 && Game.giveFood) Game.giveFood(vid);
      } catch (e) {}
    }
  }

  function talkRequestDuty() {
    const reqs = safe(() => (Game.state.village || {}).talkRequests || {}, {});
    for (const vid of Object.keys(reqs)) {
      // Skip delivered (already answered) entries — they're not new asks,
      // just unpruned history (expireTalkRequests clears them in ~3 days).
      if ((reqs[vid] || {}).delivered) continue;
      if (!livingIds().includes(vid)) continue;
      markAnswered(vid);
      driveOne(Game, vid, 'request', 'request', convoLog, {});
      return true; // one sit-down per day keeps it human
    }
    return false;
  }
  function inviteDuty() {
    const day = curDay();
    if (day % 2 === 1) return;
    const bs = safe(() => Game.betrayalState(), null);
    const invs = (bs && bs.invites) || {};
    for (const vid of Object.keys(invs)) {
      const p = (invs[vid] || {}).pending;
      if (!p || !livingIds().includes(vid)) continue;
      driveOne(Game, vid, 'invite-accept', 'deep', convoLog, {});
      inviteEvents.push({ day, vid, name: vname(Game, vid), kind: 'accepted', label: String(p.defId || '?') });
      inviteSeen.delete(vid);
      return;
    }
  }
  function deepDaily() {
    const day = curDay();
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    const vid = living[ctx2.rotate++ % living.length];
    driveOne(Game, vid, 'deep-daily', 'deep', convoLog, {});
  }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: policyId,
    daily(Game2, ctx) {
      if (curDay() === 2 && !ctx2.favorites) pickFactions();
      kindness();
      snapshotRequests();      // BEFORE base.daily: catch fresh (undelivered)
      snapshotInvites();       // requests before the policy's talkRound can
      talkRequestDuty();       // consume them. A competent friend answers
      inviteDuty();            // requests BEFORE making their own rounds.
      deepDaily();
      if (base.daily) base.daily(Game2, ctx);
      markIncidental();
      scanApproaches();
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay() });
      }
    },
  });
  const result = await runDays(Game, pol, { days, manifest: mf });
  snapshotRequests(); snapshotInvites(); scanApproaches();

  const v = Game.state.village || {};
  const bondsMap = safe(() => v.bonds || {}, {});
  const bonds = Object.keys(bondsMap).length;
  let deepBonds = 0;
  try { for (const k of Object.keys(bondsMap)) { const bb = bondsMap[k] || {}; if ((bb.v || 0) >= 30 || (bb.depth || 0) >= 1) deepBonds++; } } catch (e) {}
  const initiated = convoLog.filter(o => o.tag === 'request').length;
  const invited = convoLog.filter(o => o.tag === 'invite-accept').length;
  const playerInit = convoLog.filter(o => o.tag === 'deep-daily').length;
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);
  const repeatHits = [];
  for (const o of convoLog) for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, tag: o.tag, turn: r.turn, pickId: r.pickId, line: r.line });

  return {
    seed, days: curDay(), deaths, alive: livingIds().length,
    convos: convoLog.length,
    initiated: { convos: initiated, invites: invited, playerInitiated: playerInit },
    requests: {
      fired: reqEvents.length,
      answered: reqEvents.filter(e => e.fate === 'answered').length,
      incidental: reqEvents.filter(e => e.fate === 'incidental').length,
      expired: reqEvents.filter(e => e.fate === 'expired').length,
      pending: reqEvents.filter(e => e.fate === 'pending').length,
      events: reqEvents,
    },
    approaches: { count: approachBeats.length, beats: approachBeats.slice(0, 40) },
    nudge: { count: nudgeBeats.length, beats: nudgeBeats.slice(0, 4) },
    invites: { events: inviteEvents },
    l2prime: { repeats: repeatHits, count: repeatHits.length },
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    l3: { bonds, deepBonds, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
    _convoLog: convoLog,
  };
}

(async () => {
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (instrumentation self-test)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, policyId: 'journey-social-r34-smoke' });
  console.log(`SMOKE: convos=${smoke.convos} requests fired=${smoke.requests.fired} answered=${smoke.requests.answered} approaches=${smoke.approaches.count}`);
  const selfTest = smoke.requests.fired > 0 && smoke.convos > 0;
  console.log(`SMOKE SELF-TEST: ${selfTest ? 'PASS (requests fire — instrumentation OK)' : 'FAIL — investigate before full seeds'}`);
  if (!selfTest) { console.log('ABORT: initiation instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, policyId: 'journey-social-r34' });
      const convoLog = r._convoLog; delete r._convoLog;
      fs.writeFileSync(path.join(EVIDIR, `journey-social-r34-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => String(o.name || '?').replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // Sense-read set: EVERY answered request (M2 evidence), cap 10/seed.
      convoLog.filter(o => o.tag === 'request' && o.turns >= 2).slice(0, 10).forEach((o, i) => {
        const req = (r.requests.events || []).find(e => e.vid === o.vid && e.fate === 'answered');
        fs.writeFileSync(path.join(TDIR, `s${s}-request-${i + 1}-${sname(o)}.txt`),
          [`# NPC-INITIATED — seed ${s} day ${o.day}, ${o.name} (mood at start: ${o.moodAtStart})`,
           `# reason line: ${(req && req.line) || '(not captured)'}`,
           `# l2hits=${o.repeatHits.length}`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      convoLog.filter(o => o.tag === 'deep-daily' && o.day >= 80 && o.turns >= 5).slice(0, 2).forEach((o) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-late-d${o.day}-${sname(o)}.txt`), o.transcript.map(tline).join('\n') + '\n');
      });
      convoLog.filter(o => o.repeatHits.length > 0).forEach((o, i) => {
        const head = `# L2' REPRO — seed ${s} day ${o.day}, ${o.name} (tag ${o.tag})`;
        const hits = o.repeatHits.map(h => `#   HIT t${h.turn} <${h.pickId}>: ${h.line}`).join('\n');
        fs.writeFileSync(path.join(TDIR, `s${s}-l2prime-${i + 1}-${sname(o)}.txt`), [head, hits, ...o.transcript.map(tline)].join('\n') + '\n');
      });
      results.push(r);
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} (request=${r.initiated.convos} invite-accept=${r.initiated.invites} player=${r.initiated.playerInitiated})`);
      console.log(`  REQUESTS: fired=${r.requests.fired} answered=${r.requests.answered} incidental=${r.requests.incidental} expired=${r.requests.expired} pending=${r.requests.pending}`);
      for (const e of r.requests.events.slice(0, 8)) console.log(`    d${e.day} (req-d${e.reqDay}) ${e.name}: [${e.fate}] ${String(e.line).slice(0, 100)}`);
      console.log(`  APPROACHES: ${r.approaches.count}`);
      for (const b of r.approaches.beats.slice(0, 6)) console.log(`    d${b.day}: ${b.text.slice(0, 100)}`);
      console.log(`  NUDGE (day-1, beat-stream): ${r.nudge.count}`);
      const inv = r.invites.events;
      console.log(`  INVITES: fired=${inv.filter(e => e.kind === 'fired').length} accepted=${inv.filter(e => e.kind === 'accepted').length} expired=${inv.filter(e => e.kind === 'expired').length}`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      for (const h of r.l2prime.repeats.slice(0, 6)) console.log(`    d${h.day} ${h.name} t${h.turn} <${h.pickId}>: ${h.line}`);
      console.log(`  L3: ${JSON.stringify(r.l3)} dryRate=${r.dryRate}/12`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  const m1go = results.every(r => r.requests.answered >= 1);
  console.log(`M1 (initiation exists, >=1 answered/seed): ${m1go ? 'GO' : 'MISS'}`);
  console.log(`M2 (reason honesty): needs sense-read of request transcripts — see ${TDIR}`);
  console.log(`M3 bidirectionality per seed: ${results.map(r => `s${r.seed}: ${r.initiated.convos} req-answered + ${r.initiated.invites} invite-accept / ${r.convos} total`).join(' | ')}`);
  console.log(`L2' (verbatim repeat): ${results.some(r => r.l2prime.count >= 1) ? 'GO (gap REAL)' : 'MISS'}`);
})();
