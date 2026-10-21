#!/usr/bin/env node
// journey-social-r36-20261021.js -- SOCIAL leg (leg 5), r36.
// PRE-REGISTERED in evidence/2026-10-21/journey-social-r36.md (written before
// this ran). Leg question: THE JUSTICE ARC. Under the larceny-leaning policy
// (competent survival + scheduled theft + cold neighbor), 140d runs:
//   (1) does the chain fire: theft -> detection -> case -> moot -> verdict -> sentence?
//   (2) are verdicts/sentences proportional and legible?
//   (3) aftermath: does the village move on (trust trajectory post-sentence)?
//   (4) do the people in it act like people (confronts with real grievances)?
//   (5) FALSE-ACCUSATION PROBE (informational): does a fabricated case fire,
//       and does the moot clear the innocent? (Steve 2026-10-16 moot ruling.)
// Measurement only -- NO TUNING here; tuning calls sit with Steve.
// Bindings (a miss is NO-GO, never re-scored):
//   M1 instrument: daily arc snapshots complete on 4/4 runs (no gaps >2d);
//     >=3/4 runs have >=1 detected theft AND >=1 case opened.
//   M2 chain fires: >=1 player-theft case reaches a verdict (any resolution
//     path) on >=3/4 runs.
//   M3 people: >=3/4 sense-reads (1 moot transcript + 2 confront convos) meet
//     the quality bar; 0 fabricated-history flags.
//   M4 guardrail: >=3/4 runs end with >=5 alive and village not scattered.
//   F1 informational: fabricated-case probe -- report fire + outcome.
//   L3: theft-driver baseline (social.json) SHOULD bind (same policy family).
//   L2' standing: verbatim content-beat repeats within one convo = finding.
// Policy: larceny-leaning (competent base; steals when hungry or day%5==0;
// never comforts, never donates) + arc layer: 1 convo/day from day 3 (deep,
// gossip forcing GOSSIP_TARGET=2, confront-priority targeting; hostile every
// 4th day), deliberate broken promise (accept first favor, never fulfill),
// moot duty (convene on open cases; HONEST votes: guilty where the player did
// it, acquit where fabricated, with-the-room on NPC-NPC cases).
// TOOLING ONLY -- no game code changes in this file.
// Usage: SEEDS=3304,3305,3306,3307 node scripts/journey-social-r36-20261021.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-21');
const TDIR = path.join(EVIDIR, 'social-r36-transcripts');
const MDIR = path.join(EVIDIR, 'social-r36-moots');
for (const d of [EVIDIR, TDIR, MDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 3308;
const SMOKE_DAYS = 10;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [3304, 3305, 3306, 3307]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const GOSSIP_TARGET = 3;

const { mulberry32, loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { larcenyLeaning } = require('./policies/larceny-leaning');

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

// COMFORT POOLS (copied verbatim from src/js/convo-wants.js seek_comfort —
// r29 depth: 4 openers, 6 engages). COMFORT-REPEAT fires on a verbatim
// re-serve of any of these within ONE comfort conversation.
const COMFORT_OPENERS = [
  '"Do you ever — no. Never mind." They don\'t look away, though. They want you to ask.',
  '"I\'m not okay. I\'m saying it out loud so it\'s real: I\'m not okay."',
  '"I don\'t want to be alone with my head right now. That\'s all. That\'s the whole thing."',
  '"It\'s stupid. I\'m alive, everyone\'s alive, and I can\'t stop shaking."',
];
const COMFORT_ENGAGES = [
  '"It helps. Just — saying it out loud to someone who\'s actually listening. It helps."',
  '"I keep going over it. Having someone here... it slows the spiral."',
  '"My hands stopped shaking. That\'s — that\'s something. Thank you for sitting here."',
  '"I can breathe all the way down again. I couldn\'t, before you sat down."',
  '"Saying it out loud makes it smaller. Still there. Smaller."',
  '"I keep waiting for it to get worse again. It hasn\'t. Not while you\'re here."',
];
const POOL_SET = new Map(); // norm(line) -> 'opener'|'engage'
for (const l of COMFORT_OPENERS) POOL_SET.set(norm(l), 'opener');
for (const l of COMFORT_ENGAGES) POOL_SET.set(norm(l), 'engage');

const COMFORT_PICKS = new Set(['dlg:comfort', 'dlg:empathize', 'dlg:stay']);

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

// SETTLE-SPEAK snapshot: favorLedger id -> {state, short} for one vid.
function favorSnap(Game, vid) {
  try {
    const f = Game.convoGetFavor ? Game.convoGetFavor(vid) : null;
    return f ? { id: f.id, state: f.state, short: f.short || '' } : null;
  } catch (e) { return null; }
}

function driveOne(Game, vid, tag, mode, convoLog, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const moodAtStart = safe(() => Game.npcMood(vid), '?');
  const favorBefore = favorSnap(Game, vid);
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [],
    maxDeadAirStreak: 0, moreWhileClosed: 0, endClass: null, winddownSeen: false,
    npcTurns: 0, dryLines: 0, gossipPicks: 0, comfortPicks: 0, moodAtStart,
    repeatHits: [],          // L2': verbatim beat repeats this convo
    comfortRepeatHits: [],   // COMFORT-REPEAT: pool-line re-serves this convo
    favorBefore, favorAfter: null, favorGratitudeSpoken: false, silentSettle: false,
  };
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  const seenContent = new Set(); // L2': normalized 'beat' lines already said this convo
  const seenPool = new Map();    // COMFORT-REPEAT: norm(pool line) -> {firstTurn, count}
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
    } else if (mode === 'recap') {
      // r32 M1 probe: hammer the recap choice. Never leave early; when the
      // choice spends out (r31 cap), fall back to kind picks.
      const rc = choices.find(x => String(x.id || '') === 'recap');
      if (rc) { pick = rc; out.recapPicks = (out.recapPicks || 0) + 1; }
      else {
        out.recapSpent = true;
        pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind')
          || choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')))
          || choices[0];
      }
    } else if (mode === 'silence') {
      // r32 M1 probe: consecutive silences. Never leave early.
      const s = choices.find(x => String(x.id || '') === 'silence');
      if (s) { pick = s; out.silencePicks = (out.silencePicks || 0) + 1; }
      else pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || ''))) || choices[0];
    } else if (mode === 'comfort') {
      // r30 comfort-forcing: prioritize seek_comfort menu picks (fresh
      // first, then any — stress the pools), then 'more' (want-thread
      // engageBeat), then the deep-driver fallback. Never leave early.
      const cid = (id) => choices.find(x => String(x.id || '') === id);
      pick = cid('dlg:comfort') && fresh(cid('dlg:comfort')) ? cid('dlg:comfort')
        : cid('dlg:comfort') ? cid('dlg:comfort')
        : cid('dlg:empathize') && fresh(cid('dlg:empathize')) ? cid('dlg:empathize')
        : cid('dlg:empathize') ? cid('dlg:empathize')
        : cid('dlg:stay') && fresh(cid('dlg:stay')) ? cid('dlg:stay')
        : cid('dlg:stay') ? cid('dlg:stay')
        : null;
      if (!pick) pick = choices.find(x => String(x.id || '') === 'more');
      if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
      if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye|dlg:cant)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    } else {
      // r36 BROKEN PROMISE: accept the FIRST favor offered (dlg:commit),
      // then never fulfill it. Record via runState.favorAccepted.
      if (!runState.favorAcceptDone) {
        const fc = choices.find(x => String(x.id || '') === 'dlg:commit' && fresh(x));
        if (fc) { pick = fc; out.favorCommitPick = true; runState.favorAcceptDone = true; }
      }
      // deep: r27 gossip forcing — until GOSSIP_TARGET picks per seed, take
      // ask:gossip first.
      if (!pick && runState.gossipPicks < GOSSIP_TARGET) {
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
    if (COMFORT_PICKS.has(pickId)) { out.comfortPicks++; }
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
      // r32 M1: track r31 escalation lines (recap + mood-silence).
      if (/I've told you three times now|We're going in circles a bit/.test(txt)) out.recapEscalations = (out.recapEscalations || 0) + 1;
      if (/Did you come to tell me something\?|Say it or don.t\.|I have things to do\.|What.s on your mind\?/.test(txt)) out.silenceEscalations = (out.silenceEscalations || 0) + 1;
      if (kind === 'beat' && n.length > 20) {
        // L2': any verbatim beat repeat within this one conversation.
        // r32: the bare "..." silence-exhaustion line is INTENTIONAL by
        // design (r31: the absence of speech, not a content beat) — exempt.
        const isBareSilence = (n === '"..."');
        if (!isBareSilence) {
          if (seenContent.has(n)) {
            out.repeatHits.push({ turn: t, pickId, line: txt.slice(0, 160) });
          } else seenContent.add(n);
        }
        // COMFORT-REPEAT: pool-line re-serve within a comfort convo (decided
        // at convo end — the seek_comfort want can also surface spontaneously,
        // without the driver picking a comfort id).
        const poolKind = POOL_SET.get(n);
        if (poolKind) {
          if (seenPool.has(n)) { seenPool.get(n).count++; }
          else seenPool.set(n, { firstTurn: t, count: 1, pool: poolKind, pickId });
        }
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
  // COMFORT-REPEAT verdict: this was a seek_comfort/mourning conversation if
  // the driver picked comfort options OR any comfort pool line was served.
  const isComfortConvo = out.comfortPicks > 0 || seenPool.size > 0;
  if (isComfortConvo) {
    out.isComfortConvo = true;
    for (const [nrm, rec] of seenPool) {
      if (rec.count >= 2) {
        const one = out.transcript.filter(e => e.who === 'NPC' && norm(e.text) === nrm)[0];
        out.comfortRepeatHits.push({ pool: rec.pool, firstTurn: rec.firstTurn, count: rec.count, pickId: rec.pickId, line: (one ? one.text : nrm).slice(0, 160) });
      }
    }
  }
  if (out.favorCommitPick && runState.favorAccepted) {
    const f = favorSnap(Game, vid);
    if (f) runState.favorAccepted.push({ day, vid, name: out.name, short: f.short, id: f.id });
  }
  noteThread();
  if (lastNpcLine) {
    out.endClass = out.winddownSeen ? 'winddown' : (lastNpcLine.kind === 'beat' ? 'beat' : lastNpcLine.kind);
  }
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({ who: e.who === 'you' ? 'YOU' : (e.who === 'them' || e.who === 'narr' ? 'NARR' : 'NPC'), text: String(e.text || '') }));
  } catch (e) {}
  // SETTLE-SPEAK: did the favor flip settled this conversation, and was the
  // gratitude spoken? Gratitude patterns (convo-wants.js):
  //   fulfilled->thanked: "You came through on {short}. I won't forget it."
  //   broken->acknowledged: "You said you'd help with {short}. ...It's done now. Forget it."
  out.favorAfter = favorSnap(Game, vid);
  const fb = favorBefore, fa = out.favorAfter;
  if (fb && fa && fb.id === fa.id) {
    const flip = (fb.state === 'fulfilled' && fa.state === 'thanked') ||
                 (fb.state === 'broken' && fa.state === 'acknowledged');
    if (flip) {
      // 'them' is the game's NPC-speech channel (sayLine tags every spoken
      // NPC line who:'them'; the r27 dumper relabels it NARR for sense-reads,
      // but for this metric spoken == the player saw the words). Voice
      // openers/closers wrap the gratitude ("...This isn't new."), so match
      // on the gratitude core, not the whole line.
      const spokenLines = out.transcript.filter(e => e.who !== 'YOU').map(e => e.text);
      const sh = fb.short;
      const spoken = spokenLines.some(l => l.includes('came through on ' + sh) || l.includes("You said you'd help with " + sh));
      out.favorGratitudeSpoken = spoken;
      out.silentSettle = !spoken;
    }
    if (out.silentSettle) {
      // Dump the full transcript for the sense-read: a silent settle is a
      // BUG-class finding and needs the verbatim evidence.
      try {
        const fn = `s${runState.seed}-silent-settle-d${out.day}-${out.name.replace(/\W+/g, '_')}.txt`;
        const lines = [
          `# SILENT SETTLE — seed ${runState.seed} day ${out.day}, ${out.name}`,
          `# favor ${fb.id} "${fb.short}": ${fb.state} -> ${fa.state}, gratitude spoken: ${out.favorGratitudeSpoken}`,
          `# transcript (${out.transcript.length} entries):`,
          ...out.transcript.map(e => `${e.who}: ${e.text}`),
        ];
        fs.writeFileSync(path.join(TDIR, fn), lines.join('\n') + '\n');
        out.silentSettleFile = fn;
      } catch (e) {}
    }
  }
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
  const runState = { gossipPicks: 0, seed };
  const moots = [];
  const bondSnap = [];        // r36: daily bond-map snapshots (deep count, avg v)
  const bondEvents = [];      // r36: bondAdd event log {day,a,b,dv,reason}
  const theftLog = [];        // r36: stealFrom wrapper {day, victim, result}
  const arcSnap = [];         // r36: daily justice-arc snapshot
  const favorAccepted = [];   // r36: dlg:commit accepts (deliberate breaks)
  const casesSeen = {};       // r36: caseId -> {openedDay, ...} lifecycle
  const firstDeep = {};       // r35: pairKey -> day first crossed deep threshold
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  // r36: wrap Game.stealFrom to log every theft (day, victim, caught/unseen).
  const origStealFrom = Game.stealFrom;
  if (typeof origStealFrom === 'function') {
    Game.stealFrom = function (vid) {
      let r = false;
      try { r = origStealFrom.apply(this, arguments); } catch (e) { r = 'error:' + String(e.message).slice(0, 60); }
      try { theftLog.push({ day: curDay(), victim: vname(Game, vid), result: r }); } catch (e) {}
      return r;
    };
  }
  // r36 bond-formation attribution: wrap Game.bondAdd to log every delta.
  const origBondAdd = Game.bondAdd;
  if (typeof origBondAdd === 'function') {
    Game.bondAdd = function (a, b, dv, reason) {
      try { bondEvents.push({ day: curDay(), a: vname(Game, a), b: vname(Game, b), dv: dv | 0, reason: reason || '?' }); } catch (e) {}
      return origBondAdd.apply(this, arguments);
    };
  }

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
  function moodOf(vid) { return safe(() => Game.npcMood(vid), '?'); }
  function fearOf(vid) { return safe(() => (Game.npcNeeds(vid) || {}).fear || 0, 0); }
  function personalLoss(vid) {
    return safe(() => {
      const mem = (((Game.state.village || {}).memory) || {})[vid] || [];
      const day = curDay();
      return mem.some(m => (day - (m.day || 0)) <= 4 && /death|kill|lost|mourn|died/i.test(String(m.t || '') + ' ' + String(m.note || '')));
    }, false);
  }
  // r30 comfort-need score: grieving > scared > fear>60 > recent personal loss.
  function comfortScore(vid) {
    const m = moodOf(vid);
    let s = 0;
    if (m === 'grieving') s += 3;
    else if (m === 'scared') s += 2;
    if (fearOf(vid) > 60) s += 2;
    if (personalLoss(vid)) s += 2;
    return s;
  }

  // r36 ARC driver: larceny-leaning does survival + theft (competent.daily
  // + larcenyDaily). This layer adds: 1 convo/day (deep, confront-priority;
  // hostile every 4th day), deliberate broken promise, arc snapshots.

  // Confront priority: accuser of an open player case > recent theft victim
  // (<=3d) > grievance-holder vs player > roster alternation.
  function arcTargets() {
    const day = curDay();
    const sid = me();
    const bs = safe(() => Game.betrayalState(), {});
    const prio = [];
    for (const c of (bs.cases || [])) {
      if (!c || c.status === 'resolved') continue;
      if ((c.accused || []).includes(sid) && c.accuser && !prio.includes(c.accuser)) prio.push(c.accuser);
    }
    for (const t of theftLog) {
      if (day - t.day <= 3 && !prio.includes(t.victim)) {
        const ids = livingIds().filter(id => vname(Game, id) === t.victim);
        if (ids[0]) prio.push(ids[0]);
      }
    }
    try {
      const grs = ((bs.grievances) || []).filter(g => g.against === sid && (g.by));
      for (const g of grs) if (!prio.includes(g.by)) prio.push(g.by);
    } catch (e) {}
    return prio.filter(id => livingIds().includes(id));
  }

  function arcConvo() {
    const day = curDay();
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    const prio = arcTargets();
    let target = null, mode = 'deep', tag = 'arc-daily';
    if (prio.length) { target = prio[0]; tag = 'confront'; }
    else if (day % 4 === 3) { mode = 'hostile'; target = living[day % living.length]; tag = 'arc-hostile'; }
    else target = living[(day * 7) % living.length];
    if (!target) return;
    driveOne(Game, target, tag, mode, convoLog, runState);
  }

  // r36 BROKEN PROMISE: accept the FIRST favor offered (dlg:commit) and never
  // fulfill it. competent.daily's keepPromises would keep it ("a competent
  // player keeps their word") — so the marked promise is stashed where
  // keepPromises can't see it while the base policy runs, then restored. The
  // deadline sweep still breaks it naturally. Honest: the player just never
  // works on it, like a real player who forgets.
  const brokenStash = [];
  function stashBroken() {
    try {
      const v = Game.state.village || {};
      for (const f of favorAccepted) {
        const pr = (v.promises || {})[f.vid];
        if (pr && pr.kept !== true && pr.kept !== 'broken' && pr.kept !== 'released') {
          delete v.promises[f.vid];
          brokenStash.push({ vid: f.vid, p: pr });
        }
      }
    } catch (e) {}
  }
  function unstashBroken() {
    try {
      const v = Game.state.village || {};
      v.promises = v.promises || {};
      for (const st of brokenStash.splice(0)) {
        if (!v.promises[st.vid]) v.promises[st.vid] = st.p;
      }
    } catch (e) {}
  }

  // r36 ARC snapshot: crimes, cases, conflicts, trust, grievances.
  function snapshotArc() {
    const d = curDay();
    const sid = me();
    try {
      const j = safe(() => Game.justiceState(), {});
      const bs = safe(() => Game.betrayalState(), {});
      const v = Game.state.village || {};
      const crimes = ((j.crimes) || []).map(c => ({
        type: c.type, victim: c.victim ? vname(Game, c.victim) : null,
        caught: !!c.caught, caseId: c.caseId || null,
      }));
      const cases = ((bs.cases) || []).map(c => {
        const accused = (c.accused || []).map(id => vname(Game, id));
        return {
          id: c.id, charge: c.charge || '?', day: c.day,
          accuser: c.accuser ? vname(Game, c.accuser) : '?',
          accused: accused.join(', ') || '?',
          playerAccused: (c.accused || []).includes(sid),
          playerRole: c.playerRole || '?',
          fabricated: !!c.fabricated,
          status: c.status || '?', resolution: c.resolution || null,
          trialDay: c.trial ? (c.trial.day || null) : null,
          convicted: c.trial ? !!c.trial.convicted : null,
          mootIn: c.mootIn != null ? c.mootIn : null,
        };
      });
      for (const c of cases) if (!casesSeen[c.id]) casesSeen[c.id] = { openedDay: d };
      const conflicts = ((v.conflicts) || []).map(c => ({
        a: vname(Game, c.a), b: vname(Game, c.b), kind: c.kind,
        tension: c.tension || 0, known: !!c.known, resolved: !!c.resolved,
      }));
      const tr = v.trust || {};
      const tvals = livingIds().map(id => tr[id] === undefined ? 10 : tr[id]);
      const avgTrust = tvals.length ? (tvals.reduce((a, b) => a + b, 0) / tvals.length) : null;
      let grievVsPlayer = 0;
      try { for (const g of ((bs.grievances) || [])) if (g.against === sid) grievVsPlayer++; } catch (e) {}
      const favors = favorAccepted.map(f => {
        const cur = favorSnap(Game, f.vid);
        return { day: f.day, name: f.name, short: f.short, state: cur ? cur.state : 'gone' };
      });
      arcSnap.push({ day: d, crimes: crimes.length, cases, conflicts, avgTrust: avgTrust == null ? null : +avgTrust.toFixed(1),
        grievVsPlayer, thefts: theftLog.length, favors,
        dayPart: safe(() => Game.dayPart, null), dayTicks: safe(() => (Game.state.scholar || {}).dayTicks, null),
        tbfight: safe(() => !!(Game.tbfight && !Game.tbfight.over), false) });
      // FREEZE WATCH: 3+ consecutive snapshots on the same scholar-day = the
      // day clock is stuck. Dump recent beats for diagnosis (pure read).
      try {
        const prev = arcSnap.length >= 2 ? arcSnap[arcSnap.length - 2].day : null;
        const prev2 = arcSnap.length >= 3 ? arcSnap[arcSnap.length - 3].day : null;
        if (prev === d && prev2 === d && !runState.freezeDumpedDay?.[d]) {
          runState.freezeDumpedDay = runState.freezeDumpedDay || {};
          runState.freezeDumpedDay[d] = true;
          const lines = [`# FREEZE — seed ${runState.seed} scholar-day ${d} stuck 3+ loop-days`,
            `# dayPart=${safe(() => Game.dayPart, '?')} dayTicks=${safe(() => (Game.state.scholar || {}).dayTicks, '?')} tbfight=${safe(() => !!(Game.tbfight && !Game.tbfight.over), '?')}`,
            `# last 60 beats:`];
          for (const b of beatBuf.slice(-60)) lines.push(`[day ${b.day}] ${b.text.slice(0, 160)}`);
          fs.writeFileSync(path.join(EVIDIR, `freeze-s${runState.seed}-d${d}.txt`), lines.join('\n') + '\n');
        }
      } catch (e) {}
    } catch (e) {}
  }

  // r35 BOND-FORMATION telemetry: daily bond-map snapshot + first-deep days.
  function isDeep(bb) { return ((bb.v || 0) >= 30 || (bb.depth || 0) >= 1); }
  function snapshotBonds() {
    const d = curDay();
    try {
      const bm = ((Game.state.village || {}).bonds) || {};
      const keys = Object.keys(bm);
      let sumV = 0, deepCount = 0;
      for (const k of keys) {
        const bb = bm[k] || {};
        sumV += (bb.v || 0);
        if (isDeep(bb)) {
          deepCount++;
          if (!firstDeep[k]) {
            const parts = String(k).split('|');
            firstDeep[k] = { day: d, a: parts[0], b: parts[1], v: (bb.v || 0), depth: (bb.depth || 0) };
          }
        }
      }
      bondSnap.push({ day: d, pairs: keys.length, deepCount, avgV: keys.length ? (sumV / keys.length).toFixed(1) : '0' });
    } catch (e) {}
  }

  // r27 moot duty: convene on any open case (player path), vote with the room.
  function mootDuty() {
    const sid = me();
    const cases = safe(() => ((Game.state.village || {}).betrayal || {}).cases || [], []);
    for (const c of cases) {
      if (!c || c.resolution) continue;
      if (!c.trial && !c._r32convened) {
        try { Game.callMoot(c.id, sid); c._r32convened = true; } catch (e) { c._r32conveneError = String(e.message).slice(0, 120); }
        // M3: capture the broadcast line and check ALL accused are named.
        // The broadcast uses whoTag (names once known/post-System, age/gender
        // descriptors before) — compare against the same tag the game uses.
        let broadcastLine = null;
        try {
          for (let i = beatBuf.length - 1; i >= 0 && i > beatBuf.length - 40; i--) {
            const t = beatBuf[i].text;
            if (/stands accused/i.test(t)) { broadcastLine = t; break; }
          }
        } catch (e) {}
        const accusedNames = (c.accused || []).map(a => vname(Game, a));
        const accusedTags = (c.accused || []).map(a => {
          try { const t = Game.whoTag ? Game.whoTag(a) : null; return t || vname(Game, a); } catch (e) { return vname(Game, a); }
        });
        const unnamed = broadcastLine
          ? accusedTags.filter((tg, i) => !broadcastLine.includes(tg) && !broadcastLine.includes(accusedNames[i]))
          : [];
        const snap = { caseId: c.id, charge: c.charge || '?', day: curDay(), error: c._r32conveneError || null,
          fabricated: !!c.fabricated,
          accuser: c.accuser ? vname(Game, c.accuser) : '?',
          accused: accusedNames.join(', ') || '?',
          playerAccused: (c.accused || []).includes(sid),
          playerRole: c.playerRole || '?',
          broadcastLine: broadcastLine || '(none captured)',
          unnamedAccused: unnamed };
        moots.push(snap);
      }
      if (c.trial && c.trial.awaitingPlayerVote && Game.castPlayerVote) {
        try {
          let vote;
          if ((c.accused || []).includes(sid)) {
            // r36 HONEST VOTES: fabricated case -> acquit (innocent); a real
            // crime the player did -> guilty (honest confession by vote).
            vote = c.fabricated ? 0 : 1;
          } else {
            // NPC-NPC case: with the room (r35 pattern).
            const need = Math.floor(((c.trial.present || []).length + 1) / 2) + 1;
            const guiltySoFar = c.trial.guiltySoFar || c.trial.guilty || 0;
            vote = guiltySoFar >= need ? 1 : 0;
          }
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
        if (c.resolution && !m.file) {
          const D = m.trialDay != null ? m.trialDay : m.day;
          const lines = [];
          lines.push(`MOOT r32 — seed ${seed} / ${policyId} — trial day ${D} (convened day ${m.day})`);
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

  runState.favorAccepted = favorAccepted;
  const base = larcenyLeaning;
  const pol = Object.assign({}, base, {
    id: policyId,
    daily(Game2, ctx) {
      stashBroken();
      if (base.daily) base.daily(Game2, ctx);
      unstashBroken();
      arcConvo();
      if (gossipForce !== false) mootDuty();
      try { snapshotArc(); } catch (e) {}
      try { snapshotBonds(); } catch (e) {}
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
  const mootsConvened = bsCases.filter(c => c.trial).length; // c.trial: the real marker (re-verified r30)
  const gossipThreads = convoLog.filter(o => (o.threads || []).includes('gossip')).length;
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);
  const repeatHits = [];
  const comfortRepeatHits = [];
  for (const o of convoLog) {
    for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, line: r.line });
    for (const r of (o.comfortRepeatHits || [])) comfortRepeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, pool: r.pool, firstTurn: r.firstTurn, line: r.line });
  }
  const comfortConvos = convoLog.filter(o => o.isComfortConvo).length;
  const comfortPicksTotal = convoLog.reduce((s, o) => s + o.comfortPicks, 0);
  // SETTLE-SPEAK tallies
  const settles = convoLog.filter(o => o.favorBefore && o.favorAfter && o.favorBefore.id === o.favorAfter.id &&
    ((o.favorBefore.state === 'fulfilled' && o.favorAfter.state === 'thanked') ||
     (o.favorBefore.state === 'broken' && o.favorAfter.state === 'acknowledged')));
  const spokenGratitude = settles.filter(o => o.favorGratitudeSpoken).length;
  const silentSettles = settles.filter(o => o.silentSettle).map(o => ({
    day: o.day, name: o.name, favorId: o.favorBefore.id, short: o.favorBefore.short,
    before: o.favorBefore.state, after: o.favorAfter.state,
    file: o.silentSettleFile || null,
  }));

  // r35 channel attribution: aggregate bondAdd events by reason.
  const bondChannels = {};
  for (const e of bondEvents) {
    const c = bondChannels[e.reason] || (bondChannels[e.reason] = { sum: 0, n: 0 });
    c.sum += e.dv; c.n++;
  }

  return {
    seed, days: curDay(), deaths, alive: livingIds().length,
    convos: convoLog.length,
    deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    comfortConvos, comfortPicksTotal,
    gossipPicks: runState.gossipPicks, gossipConvos: gossipThreads,
    l2prime: { repeats: repeatHits, count: repeatHits.length },
    comfortRepeat: { hits: comfortRepeatHits, count: comfortRepeatHits.length },
    settleSpeak: { settlesObserved: settles.length, spokenGratitude, silentSettles, silentCount: silentSettles.length },
    p2carry: { reactDry: convoLog.reduce((a, o) => a + o.deadAir.filter(d => /^(agree|joke|silence|react:)/.test(d.pickId)).length, 0) },
    p1carry: { streaks: convoLog.filter(o => o.maxDeadAirStreak >= 3).length },
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    l3: { bonds, deepBonds, betrayalCases: cases, mootsConvened, mootsObserved: moots.length, gossipConvos: gossipThreads, gossipPicks: runState.gossipPicks, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
    moots: moots.map(m => ({ caseId: m.caseId, charge: m.charge, convenedDay: m.day, trialDay: m.trialDay || null, playerVote: m.playerVote || null, verdict: m.resolution || null, convicted: m.convicted != null ? m.convicted : null, conveneError: m.error || null, file: m.file || null, playerAccused: !!m.playerAccused, playerRole: m.playerRole || null, broadcastLine: m.broadcastLine || null, unnamedAccused: m.unnamedAccused || [] })),
    conflicts: null,       // r33 field retired
    plotEvents: null,     // r33 field retired
    bondSnap,             // r35: daily {day, pairs, deepCount, avgV}
    bondEventsCount: bondEvents.length,
    bondEvents,           // r35: full {day,a,b,dv,reason} log (JSON-serialized)
    meName: vname(Game, me()),
    bondChannels,         // r36: reason -> {sum, n}
    firstDeep,            // r36: pairKey -> {day, a, b, v, depth}
    theftLog,             // r36: {day, victim, result}[]
    arcSnap,              // r36: daily justice-arc snapshots
    favorAccepted,        // r36: deliberately broken promises
    casesSeen,            // r36: caseId -> {openedDay}
    hostileConvos: convoLog.filter(o => o.mode === 'hostile').length,
    confrontConvos: convoLog.filter(o => o.tag === 'confront').length,
    endState: {
      over: !!Game.over, villageLost: !!Game.villageLost,
      scattered: !!((Game.state.village || {}).scattered),
      extinct: !!((Game.state.village || {}).extinct),
      scholarExiled: !!((Game.state.scholar || {}).exiled),
      scholarDead: !!((safe(() => Game.getPerson(me()), null) || {}).dead),
    },
    _convoLog: convoLog, // not serialized
  };
}

(async () => {
  // ---- 10-day smoke self-test BEFORE the full seeds.
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test of theft + arc instrumentation)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, mode: 'journey-social-r36-pilot', policyId: 'journey-social-r36-smoke', gossipForce: false });
  console.log(`SMOKE: thefts=${(smoke.theftLog || []).length} arcSnaps=${(smoke.arcSnap || []).length} convos=${smoke.convos} cases=${(smoke.arcSnap || []).slice(-1)[0]?.cases?.length || 0}`);
  const selfTest = (smoke.theftLog || []).length > 0 && (smoke.arcSnap || []).length >= 8 && smoke.convos > 0;
  console.log(`SMOKE SELF-TEST: ${selfTest ? 'PASS (stealFrom wrapper fired, arc snapshots complete, convos ran)' : 'FAIL (theft/arc instrumentation broken — investigate before full seeds)'}`);
  if (!selfTest) { console.log('ABORT: arc instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, mode: 'journey-social-r36-pilot', policyId: 'journey-social-r36-pilot', gossipForce: true });
      const convoLog = r._convoLog; delete r._convoLog;
      fs.writeFileSync(path.join(EVIDIR, `journey-social-r36-pilot-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r36 ARC SUMMARY: the justice chain in one file (thefts -> cases -> moots -> verdicts -> sentences).
      {
        const lines = [`# JUSTICE ARC — seed ${s} (larceny-leaning, ${r.days}d, ${r.alive} alive)`, ''];
        lines.push(`## thefts (${(r.theftLog || []).length})`);
        for (const t of (r.theftLog || [])) lines.push(`  d${t.day} ${t.victim}: ${t.result}`);
        lines.push('', `## cases (${(r.moots || []).length} moot-duty records)`);
        for (const m of (r.moots || [])) lines.push(`  ${m.caseId} charge=${m.charge} fabricated=${m.fabricated} playerAccused=${m.playerAccused} convenedD=${m.convenedDay} trialD=${m.trialDay} vote=${m.playerVote} verdict=${m.verdict} file=${m.file || 'none'}`);
        lines.push('', '## broken promises');
        for (const f of (r.favorAccepted || [])) {
          const cur = ((r.arcSnap || []).slice(-1)[0]?.favors || []).find(x => x.id === f.id);
          lines.push(`  d${f.day} ${f.name}: "${f.short}" -> final state: ${cur ? cur.state : '?'}`);
        }
        lines.push('', '## trust trajectory (avgTrust every 10d)');
        const snaps = r.arcSnap || [];
        lines.push('  ' + snaps.filter(x => x.day % 10 === 0).map(x => `d${x.day}:${x.avgTrust}`).join(' '));
        fs.writeFileSync(path.join(MDIR, `s${s}-arc-summary.txt`), lines.join('\n') + '\n');
      }
      // r36 M3 sense-read set: confront convos (accuser/victim/grievance-holder, turns>=4), hostile convos, late deep, gossip.
      convoLog.filter(o => o.tag === 'confront' && o.turns >= 4).slice(0, 3).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-confront-${i + 1}-${sname(o)}.txt`),
          [`# CONFRONT sense-read — seed ${s} day ${o.day}, ${o.name} (mode ${o.mode}, tag ${o.tag}, turns ${o.turns}, mood at start: ${o.moodAtStart})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      convoLog.filter(o => o.mode === 'hostile' && o.turns >= 4).slice(0, 2).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-hostile-${i + 1}-${sname(o)}.txt`),
          [`# hostile — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns})`, ...o.transcript.map(tline)].join('\n') + '\n');
      });
      convoLog.filter(o => o.gossipPicks > 0 && o.turns >= 4).slice(0, 2).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-gossip-${i + 1}-${sname(o)}.txt`),
          o.transcript.map(tline).join('\n') + '\n');
      });
      const lates = convoLog.filter(o => o.mode === 'deep' && o.day >= 100 && o.turns >= 5).slice(0, 2);
      (lates.length ? lates : convoLog.filter(o => o.mode === 'deep' && o.turns >= 5).slice(-2)).forEach((o) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-late-d${o.day}-${sname(o)}.txt`),
          o.transcript.map(tline).join('\n') + '\n');
      });
      // L2' repro transcripts: every conversation with a verbatim repeat hit.
      convoLog.filter(o => o.repeatHits.length > 0).forEach((o, i) => {
        const head = `# L2' REPRO — seed ${s} day ${o.day}, ${o.name} (mode ${o.mode}, tag ${o.tag})`;
        const hits = o.repeatHits.map(h => `#   HIT t${h.turn} <${h.pickId}>: ${h.line}`).join('\n');
        fs.writeFileSync(path.join(TDIR, `s${s}-l2prime-${i + 1}-${sname(o)}.txt`),
          [head, hits, ...o.transcript.map(tline)].join('\n') + '\n');
      });
      results.push(r);
      const theftsCaught = (r.theftLog || []).filter(t => t.result === 'caught').length;
      const playerCases = (r.moots || []).filter(m => m.playerAccused);
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} (deep=${r.deepConvos} hostile=${r.hostileConvos} confront=${r.confrontConvos}) gossipPicks=${r.gossipPicks} dryRate=${r.dryRate}/12`);
      console.log(`  thefts: ${(r.theftLog || []).length} (caught=${theftsCaught}) favorsAccepted=${(r.favorAccepted || []).length}`);
      console.log(`  cases: ${(r.moots || []).length} total, ${playerCases.length} player-accused [${playerCases.map(m => `${m.caseId}:${m.charge}${m.fabricated ? ':FABRICATED' : ''}->${m.verdict || 'open'}`).join(' ')}]`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      for (const h of r.l2prime.repeats.slice(0, 6)) console.log(`    d${h.day} ${h.name} t${h.turn} <${h.pickId}>: ${h.line}`);
      console.log(`  L3: ${JSON.stringify(r.l3)}`);
      console.log(`  regression: P1-streaks=${r.p1carry.streaks} P2-reactDry=${r.p2carry.reactDry}`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  // r36 verdicts
  let m1gaps = 0;
  const m1seeds = [];   // theft detected AND case opened
  const m2seeds = [];   // player case reached a verdict
  const m4seeds = [];   // alive >= 5 at end
  const fabCases = [];  // F1 probe: fabricated cases
  for (const r of results) {
    const snaps = r.arcSnap || [];
    const days = [...new Set(snaps.map(c => c.day))].sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < days.length; i++) maxGap = Math.max(maxGap, days[i] - days[i - 1]);
    if (maxGap > 2) { console.log(`  seed ${r.seed}: M1 INSTRUMENT GAP (max arc-snapshot gap ${maxGap}d)`); m1gaps++; }
    const theftDetected = (r.theftLog || []).some(t => t.result === 'caught') || (r.theftLog || []).some(t => t.result === 'unseen');
    const anyCase = ((r.arcSnap || []).slice(-1)[0]?.cases || []).length > 0;
    if (theftDetected && anyCase) m1seeds.push(r.seed);
    const playerVerdicts = (r.moots || []).filter(m => m.playerAccused && m.verdict);
    if (playerVerdicts.length) m2seeds.push(r.seed);
    if ((r.alive | 0) >= 5) m4seeds.push(r.seed);
    for (const m of (r.moots || [])) if (m.fabricated) fabCases.push({ seed: r.seed, id: m.caseId, verdict: m.verdict });
    // post-sentence trust: for each resolved player case, trust at resolution vs +7d
    for (const m of (r.moots || [])) {
      if (!m.playerAccused || !m.verdict || m.trialDay == null) continue;
      const at = snaps.find(x => x.day === m.trialDay), after = snaps.find(x => x.day === m.trialDay + 7);
      console.log(`  seed ${r.seed}: ${m.caseId} ${m.charge} -> ${m.verdict}: trust d${m.trialDay}=${at ? at.avgTrust : '?'} d${m.trialDay + 7}=${after ? after.avgTrust : '?'}`);
    }
    console.log(`  seed ${r.seed}: days=${r.days} alive=${r.alive} thefts=${(r.theftLog || []).length} cases=${((r.arcSnap || []).slice(-1)[0]?.cases || []).length} verdicts=${(r.moots || []).filter(m => m.verdict).length} end=${JSON.stringify(r.endState)}`);
  }
  console.log(`M1 (instrument, arc gaps + theft-detected AND case-opened): ${m1gaps ? 'MISS (' + m1gaps + ' seeds)' : 'GO'}; seeds meeting chain-start: ${m1seeds.length}/4 [${m1seeds.join(',')}] — ${m1seeds.length >= 3 ? 'GO' : 'NO-GO'}`);
  console.log(`M2 (player case reached a verdict on >=3/4 seeds): ${m2seeds.length}/4 [${m2seeds.join(',')}] — ${m2seeds.length >= 3 ? 'GO' : 'NO-GO'}`);
  console.log(`M4 (guardrail alive>=5): ${m4seeds.length}/4 [${m4seeds.join(',')}] — ${m4seeds.length >= 3 ? 'GO' : 'NO-GO'}`);
  console.log(`F1 (fabricated-case probe): ${fabCases.length ? fabCases.map(f => `seed${f.seed} ${f.id}->${f.verdict}`).join(' ') : '(no fabricated cases fired)'}`);
})();
