#!/usr/bin/env node
// journey-social-r27-pilot-20261019.js -- SOCIAL leg (leg 5), r27 PILOT.
// PRE-REGISTERED in evidence/2026-10-19/journey-social-r27.md (written before
// this ran). Leg question: when the player drives the social *institutions*
// (convenes a moot on an open betrayal case; forces gossip threads), do moots
// hold up as real, consequence-bearing events, and does gossip carry real
// village state — or do they collapse into dead ends / dry deflections /
// fabricated shared history?
// Bindings (a miss is NO-GO, never re-scored):
//   M1 moot-end-to-end: >=1 moot via the player path (callMoot -> conductTrial
//     -> castPlayerVote) per seed with an open case. GO = a moot that stalls /
//     never reaches a verdict, or a verdict with no downstream consequence in
//     the beat stream (7d tail) -> investigate/fix. No case at all -> record.
//   G1 gossip-carries-state: >=3 forced ask:gossip picks per seed. GO = a
//     gossip thread/beat naming false village state or fabricated shared
//     history -> fix.
//   L2' verbatim-repeat (r26 metric-review revision #2): any verbatim
//     content-line ('beat' kind) repeat within ONE conversation, regardless
//     of ledger state -> fix.
//   L3 social-arc: bonds, deepBonds, betrayalCases, mootsConvened (reads
//     c.trial per revision #3), gossipConvos, avgTrust.
// Rate metric (r25): dry NPC lines per 12 NPC turns, pilot-wide.
// Revision #1 (r26): 10-day smoke seed (2000) FIRST, assert bonds counter
// reads nonzero before the full seeds run (instrumentation self-test).
// Seeds: 2001, 2002, 2003 (fresh). Horizon: DAYCAP=140, death-aware (+10d tail).
// Policy: 'deep' driver + favoritism wrapper + moot duty + gossip forcing.
// TOOLING ONLY -- no game code changes in this file.
// Usage: SEEDS=2001,2002,2003 node scripts/journey-social-r27-pilot-20261019.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-19');
const TDIR = path.join(EVIDIR, 'social-r27-transcripts');
const MDIR = path.join(EVIDIR, 'social-r27-moots');
for (const d of [EVIDIR, TDIR, MDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 2000;
const SMOKE_DAYS = 10;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [2001, 2002, 2003]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const GOSSIP_TARGET = 3;

const { mulberry32, loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

const CG = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characterGen.json'), 'utf8'));
const EXHAUSTED = (CG.convo && CG.convo.exhausted) || [];
const WINDDOWN_POOL = [];
if (CG.convo && CG.convo.winddowns) {
  for (const k of Object.keys(CG.convo.winddowns)) {
    const v = CG.convo.winddowns[k]; if (Array.isArray(v)) WINDDOWN_POOL.push(...v);
  }
}
const norm = (t) => String(t == null ? '' : t).trim().replace(/^"+|"+$/g, '');
const EXH_SET = new Set(EXHAUSTED.map(norm));
const WD_SET = new Set(WINDDOWN_POOL.map(norm));

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

function driveOne(Game, vid, tag, mode, convoLog, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [],
    maxDeadAirStreak: 0, moreWhileClosed: 0, endClass: null, winddownSeen: false,
    npcTurns: 0, dryLines: 0, gossipPicks: 0,
    repeatHits: [], // L2': verbatim content-line repeats inside this convo
  };
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  const seenContent = new Set(); // L2': normalized 'beat' lines already said this convo
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  noteThread();
  const seenIds = [];
  let deadStreak = 0;
  let lastNpcLine = null;
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const hasMore = safe(() => !!Game.convoThreadHasMore(vid), false);
    if (choices.some(x => x && String(x.id || '') === 'more') && !hasMore) out.moreWhileClosed++;
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
    let pick = null;
    if (mode === 'hostile') {
      pick = choices.find(x => x && String(x.temper || '') === 'cruel');
      if (!pick) pick = byId(/^dlg:cant$/);
      if (!pick) pick = byId(/^deflect_q$/);
      if (t >= 2) pick = pick || byId(/^(leave|bye|goodbye)/);
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    } else {
      // r27 gossip forcing: until GOSSIP_TARGET gossip asks are picked this
      // run, take a fresh (then any) ask:gossip pick first.
      if (runState.gossipPicks < GOSSIP_TARGET) {
        const g = byId(/^ask:gossip$/);
        if (g && (fresh(g) || !seenIds.some(id => id === 'ask:gossip'))) pick = g;
        if (pick) { runState.gossipPicks++; out.gossipPicks++; }
      }
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (!pick && ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
        pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
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
      const isWd = WD_SET.has(n);
      if (isWd) out.winddownSeen = true;
      const dead = isExh || isDefl;
      out.npcTurns++;
      if (dead) out.dryLines++;
      const kind = isExh ? 'exhausted' : (isDefl ? 'deflection' : (isWd ? 'winddown' : 'beat'));
      lastNpcLine = { turn: t, pickId, line: txt.slice(0, 120), kind };
      if (kind === 'beat' && n.length > 20) {
        if (seenContent.has(n)) {
          out.repeatHits.push({ turn: t, pickId, line: txt.slice(0, 160) });
        } else seenContent.add(n);
      }
      if (dead) {
        deadStreak++;
        out.deadAir.push({ turn: t, pickId, line: txt.slice(0, 140), kind });
        if (deadStreak > out.maxDeadAirStreak) out.maxDeadAirStreak = deadStreak;
      } else {
        deadStreak = 0;
      }
    }
  }
  if (!out.naturalEnd && out.turns >= 14) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
  if (lastNpcLine) {
    out.endClass = out.winddownSeen ? 'winddown' : (lastNpcLine.kind === 'beat' ? 'beat' : lastNpcLine.kind);
  }
  try {
    const c = Game.convoGet(vid);
    // r27 note: 'them'/'narr' entries are stage-direction narration, NOT the
    // villager speaking — label them NARR so sense-reads don't misread a
    // drift note ("Rosa has an edge today") as third-person self-reference.
    out.transcript = ((c && c.transcript) || []).map(e => ({ who: e.who === 'you' ? 'YOU' : (e.who === 'them' || e.who === 'narr' ? 'NARR' : 'NPC'), text: String(e.text || '') }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function runWorld({ seed, days, mode, policyId, gossipForce }) {
  const { Game, manifest: mf } = await loadGame({ seed, mode: policyId, fullTelemetry: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const runState = { gossipPicks: 0 };
  const moots = [];
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };

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

  const ctx2 = { favorites: null, outsiders: null };
  function pickFactions() {
    const living = livingIds();
    const byTrust = living.slice().sort((a, b) => trustOf(b) - trustOf(a));
    ctx2.favorites = byTrust.slice(0, 2);
    ctx2.outsiders = byTrust.slice(-2).reverse();
  }
  function kindnessRound() {
    const day = curDay();
    const sid = me();
    for (const vid of (ctx2.favorites || [])) {
      if (!livingIds().includes(vid)) continue;
      try {
        const needs = safe(() => Game.npcNeeds(vid) || {}, {});
        const s = Game.state.scholar || {};
        if ((needs.hunger || 0) > 30 && (s.kcal || 0) > 1200 && Game.giveFood) Game.giveFood(vid);
      } catch (e) {}
      try { if (Game.tendVillager) Game.tendVillager(vid); } catch (e) {}
    }
    for (const vid of (ctx2.outsiders || [])) {
      if (!livingIds().includes(vid)) continue;
      if (day % 5 === 0 && day > 2 && Game.stealFrom) { try { Game.stealFrom(vid); } catch (e) {} }
    }
    const living = livingIds();
    const favAlive = (ctx2.favorites || []).filter(id => living.includes(id));
    const outAlive = (ctx2.outsiders || []).filter(id => living.includes(id));
    if (day >= 3) {
      if (day % 2 === 0 && favAlive.length) driveOne(Game, favAlive[(day / 2) % favAlive.length | 0], 'deep-daily', 'deep', convoLog, runState);
      else if (day % 2 === 1 && outAlive.length) driveOne(Game, outAlive[day % outAlive.length], 'hostile-daily', 'hostile', convoLog, runState);
    }
  }

  // r27 moot duty: convene on any open case (player path), vote with the room.
  function mootDuty() {
    const sid = me();
    const cases = safe(() => ((Game.state.village || {}).betrayal || {}).cases || [], []);
    for (const c of cases) {
      if (!c || c.resolution) continue;
      if (!c.trial && !c._r27convened) {
        try { Game.callMoot(c.id, sid); c._r27convened = true; } catch (e) { c._r27conveneError = String(e.message).slice(0, 120); }
        const snap = { caseId: c.id, charge: c.charge || '?', day: curDay(), error: c._r27conveneError || null,
          accuser: c.accuser ? vname(Game, c.accuser) : '?',
          accused: (c.accused || []).map(a => vname(Game, a)).join(', ') || '?' };
        moots.push(snap);
      }
      if (c.trial && c.trial.awaitingPlayerVote && Game.castPlayerVote) {
        try {
          const need = Math.floor(((c.trial.present || []).length + 1) / 2) + 1;
          const guiltySoFar = c.trial.guiltySoFar || c.trial.guilty || 0;
          const vote = guiltySoFar >= need ? 1 : 0;
          Game.castPlayerVote(c.id, vote);
          const m = moots.find(x => x.caseId === c.id);
          if (m) m.playerVote = vote ? 'guilty' : 'acquit';
        } catch (e) {}
      }
      const m = moots.find(x => x.caseId === c.id);
      if (m && !m.resolution) {
        m.resolution = c.resolution || null;
        m.trialDay = c.trial ? (c.trial.day || null) : null;
        m.convicted = c.trial ? !!c.trial.convicted : null;
        m.votes = c.trial && c.trial.votes ? c.trial.votes.map(v => ({ name: vname(Game, v.vid), vote: v.vote })) : null;
        // write the transcript as soon as the verdict lands — beat buffer rolls
        if (c.resolution && !m.file) {
          const D = m.trialDay != null ? m.trialDay : m.day;
          const lines = [];
          lines.push(`MOOT r27 — seed ${seed} / ${policyId} — trial day ${D} (convened day ${m.day})`);
          lines.push(`case: ${m.caseId} — charge: ${m.charge}`);
          lines.push(`accuser: ${m.accuser} — accused: ${m.accused}`);
          lines.push(`player vote: ${m.playerVote || 'n/a'}`);
          lines.push(`verdict: ${m.resolution}${m.convicted != null ? ` (convicted=${m.convicted})` : ''}`);
          if (m.votes && m.votes.length) {
            const g = m.votes.filter(v => v.vote === 'guilty'), a = m.votes.filter(v => v.vote === 'acquit');
            lines.push(`NPC votes (${m.votes.length}): guilty=${g.length} [${g.map(v => v.name).join(', ')}] | acquit=${a.length} [${a.map(v => v.name).join(', ')}]`);
          }
          lines.push('--- beat stream (moot-keyword lines +/- 4 context, days ' + (D - 1) + '..' + (D + 8) + ') ---');
          const pool = beatBuf.filter(b => b.day >= D - 1 && b.day <= D + 8);
          const KEY = /moot|trial|verdict|guilty|acquit|exile|sentence|accus/i;
          const keep = new Set();
          pool.forEach((b, i) => { if (KEY.test(b.text)) for (let j = Math.max(0, i - 4); j <= Math.min(pool.length - 1, i + 4); j++) keep.add(j); });
          if (!keep.size) lines.push(`(no moot-keyword lines in stream; ${pool.length} lines in window)`);
          else for (const i of [...keep].sort((a, b) => a - b)) lines.push(`[day ${pool[i].day}] ${pool[i].text}`);
          const fn = `s${seed}-moot-${m.caseId}.txt`;
          fs.writeFileSync(path.join(MDIR, fn), lines.join('\n') + '\n');
          m.file = fn;
        }
      }
    }
  }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: policyId,
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      if (curDay() === 2 && !ctx2.favorites) pickFactions();
      if (ctx2.favorites) kindnessRound();
      if (gossipForce !== false) mootDuty();
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay() });
      }
    },
  });
  const result = await runDays(Game, pol, { days, manifest: mf });

  const v = Game.state.village || {};
  const bondsMap = safe(() => v.bonds || {}, {});
  const bonds = Object.keys(bondsMap).length;
  let deepBonds = 0;
  try { for (const k of Object.keys(bondsMap)) { const bb = bondsMap[k] || {}; if ((bb.v || 0) >= 30 || (bb.depth || 0) >= 1) deepBonds++; } } catch (e) {}
  const bsCases = safe(() => (v.betrayal || {}).cases || [], []);
  const cases = bsCases.length;
  const mootsConvened = bsCases.filter(c => c.trial).length; // r26 revision #3: the real marker
  const gossipThreads = convoLog.filter(o => (o.threads || []).includes('gossip')).length;
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);
  const repeatHits = [];
  for (const o of convoLog) for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, line: r.line });

  return {
    seed, days: curDay(), deaths, alive: livingIds().length,
    convos: convoLog.length,
    deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    gossipPicks: runState.gossipPicks, gossipConvos: gossipThreads,
    l2prime: { repeats: repeatHits, count: repeatHits.length },
    p2carry: { reactDry: convoLog.reduce((a, o) => a + o.deadAir.filter(d => /^(agree|joke|silence|react:)/.test(d.pickId)).length, 0) },
    p1carry: { streaks: convoLog.filter(o => o.maxDeadAirStreak >= 3).length },
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    l3: { bonds, deepBonds, betrayalCases: cases, mootsConvened, mootsObserved: moots.length, gossipConvos: gossipThreads, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
    moots: moots.map(m => ({ caseId: m.caseId, charge: m.charge, convenedDay: m.day, trialDay: m.trialDay || null, playerVote: m.playerVote || null, verdict: m.resolution || null, convicted: m.convicted != null ? m.convicted : null, conveneError: m.error || null, file: m.file || null })),
    _convoLog: convoLog, // not serialized
  };
}

(async () => {
  // Revision #1 (r26): 10-day smoke self-test BEFORE the full seeds.
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test of L3 counters)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, mode: 'journey-social-r27-pilot', policyId: 'journey-social-r27-smoke', gossipForce: false });
  console.log(`SMOKE: bonds=${smoke.l3.bonds} cases=${smoke.l3.betrayalCases} convos=${smoke.convos}`);
  const selfTest = smoke.l3.bonds > 0 && smoke.convos > 0;
  console.log(`SMOKE SELF-TEST: ${selfTest ? 'PASS (bonds counter reads nonzero — instrumentation OK)' : 'FAIL (zero bonds — investigate before full seeds)'}`);
  if (!selfTest) { console.log('ABORT: L3 instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, mode: 'journey-social-r27-pilot', policyId: 'journey-social-r27-pilot', gossipForce: true });
      const convoLog = r._convoLog; delete r._convoLog;
      fs.writeFileSync(path.join(EVIDIR, `journey-social-r27-pilot-s${s}.json`), JSON.stringify(r, null, 1));
      // Sense-read transcripts: 2 deep + 1 late + 1 gossip-thread convo.
      convoLog.filter(o => o.mode === 'deep' && o.turns >= 6).slice(0, 2).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-deep-${i + 1}-${o.name.replace(/\W+/g, '_')}.txt`),
          o.transcript.map(e => `${e.who}: ${e.text}`).join('\n'));
      });
      convoLog.filter(o => o.day >= 100 && o.turns >= 5).slice(0, 1).forEach((o) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-late-d${o.day}-${o.name.replace(/\W+/g, '_')}.txt`),
          o.transcript.map(e => `${e.who}: ${e.text}`).join('\n'));
      });
      convoLog.filter(o => o.gossipPicks > 0 && o.turns >= 4).slice(0, 2).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-gossip-${i + 1}-${o.name.replace(/\W+/g, '_')}.txt`),
          o.transcript.map(e => `${e.who}: ${e.text}`).join('\n'));
      });
      results.push(r);
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} (deep=${r.deepConvos}) gossipPicks=${r.gossipPicks} gossipConvos=${r.gossipConvos} dryRate=${r.dryRate}/12`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      for (const h of r.l2prime.repeats.slice(0, 6)) console.log(`    d${h.day} ${h.name} t${h.turn} <${h.pickId}>: ${h.line}`);
      console.log(`  L3: ${JSON.stringify(r.l3)}`);
      console.log(`  moots: ${r.moots.length ? JSON.stringify(r.moots.map(m => ({ c: m.caseId, day: m.convenedDay, vote: m.playerVote, verdict: m.verdict, err: m.conveneError }))) : '(none convened)'}`);
      console.log(`  regression: P1-streaks=${r.p1carry.streaks} P2-reactDry=${r.p2carry.reactDry}`);
      if (r.error) console.log(`  ERROR: ${String(r.error).slice(0, 300)}`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  const m1go = results.some(r => (r.moots || []).some(m => m.conveneError || (m.verdict == null && r.days > m.convenedDay + 14)));
  const g1go = false; // gossip truth needs a sense-read of the transcripts, below
  const l2go = results.some(r => (r.l2prime || {}).count >= 1);
  console.log(`M1 (moot stall/fail): ${m1go ? 'GO (gap REAL)' : 'MISS'}`);
  console.log(`L2' (verbatim repeat): ${l2go ? 'GO (gap REAL)' : 'MISS'}`);
  console.log(`G1 (gossip state-truth): needs sense-read of transcripts — see evidence dir`);
})();
