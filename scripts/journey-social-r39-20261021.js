#!/usr/bin/env node
// journey-social-r39-20261021.js -- SOCIAL leg (leg 5), r39.
// PRE-REGISTERED in hidden_files/evidence/2026-10-21/journey-social-r39.md
// (written before this ran). Leg question: THE COLD HOUSE. r38 proved the
// quiet feuds come alive under WARM play (auto-mediation at trust 55+/55+
// with both — a passive threshold, not a player verb). This run asks: with
// a competent-but-distant player (survival-identical base, ZERO donations,
// ZERO promise-keeping, ZERO comfort, ZERO favor acceptance, NEUTRAL picks)
// does convo-only trust still reach 55/55 — or do seeded feuds fester
// known-but-unresolved for the whole run?
// Every run seeds 1-2 old wounds/frictions between NPCs (game.js
// genConflicts: tension 55-74, known:false, hidden). Design: reveal day 3+
// at 12%/day (+talk bonus); old_wound history unfolds in conversation at
// trust 45/70 (conversation.js); incidents 10%/day when known + tension>40;
// favoritism (trust 50+ with one side) costs -2 with the other; mediation
// at trust 55+ with both; tension decays -1/day above 30.
// Bindings (a miss is NO-GO, never re-scored):
//   M1 instrument: conflict snapshots complete on 4/4 runs (no gaps >2d);
//     >=3/4 runs seed >=1 conflict (generator promises 1-2 — verify).
//   M2 cold feuds: on runs with >=1 seeded conflict, >=1 conflict reveals
//     (known:true) AND (>=1 incident fires OR stage advances OR mediation
//     resolves) — GO = the feud comes alive on >=3/4 runs. A miss is a
//     DOCUMENTED BLANK, not re-scored. (The INTERESTING question is the
//     resolution path: 55/55 reached on convo-trust alone, or festering.)
//   M3 people: >=3/4 sense-reads (reveal beats, incident scenes, stage
//     unfolds, cornered/blame scenes, dead-party — whichever fire) meet the
//     quality bar; 0 fabricated-history.
//   M4 guardrail: >=3/4 runs end with >=5 alive and the village not scattered.
//   L2' standing: verbatim content-beat repeats within one convo = finding.
//   F1 informational: NPC<->NPC bond edges at d0/70/140 vs the r38 warm
//     baseline (66-72 pairs, 29-36 deep) — fragment or hold?
//   F2 informational: favoritism -2 scenes under cold (expect ~0; trust 50+
//     with one side requires sustained favoring — the cold player never
//     favors).
//   F3 informational: mediation-opportunity accounting — per conflict: days
//     known, trustA/trustB trajectory, did 55/55 trigger, fester-days
//     (known and unresolved), resolution kind (mediation / dead-party /
//     never).
//   F4 informational: cold refusals — dlg:commit/dlg:help choices offered
//     and skipped (did anyone even ask the cold player for help?).
// Policy: cold-competent = the competent survival base with COMPETENT_WARM=0
// (no keepPromises, no donateHaul, no donateSurplus, no answerAidBeats —
// policy/competent.js, default unchanged) + ZERO crimes + driver layer:
// 2 convos/day rotating the roster (deep mode, gossip forcing
// GOSSIP_TARGET=3, NEUTRAL picks — no kind preference, no dlg:commit/
// dlg:help favor acceptance, no broken promise, no hostile picks); moot
// duty (convene on open cases; with-the-room votes); conflict snapshots +
// scene capture from the say-stream. TOOLING ONLY -- no game code changes
// in this file.
// Usage: SEEDS=3601,3602,3603,3604 node scripts/journey-social-r39-20261021.js
'use strict';
process.env.TRIBFLOOR = '1';
process.env.COMPETENT_WARM = '0'; // the cold house: survival-identical, no warm acts
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-21');
const TDIR = path.join(EVIDIR, 'social-r39-transcripts');
const MDIR = path.join(EVIDIR, 'social-r39-moots');
const SDIR = path.join(EVIDIR, 'social-r39-feudscenes');
for (const d of [EVIDIR, TDIR, MDIR, SDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 3605;
const SMOKE_DAYS = 10;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [3601, 3602, 3603, 3604]).filter(Number.isFinite);
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
  const seededOpeners = new Set(); // L2' blind-spot fix: opener lines seeded at open
  const seenPool = new Map();    // COMFORT-REPEAT: norm(pool line) -> {firstTurn, count}
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  // L2' BLIND-SPOT FIX (journey-social r39 2026-10-21): lines voiced by
  // startConvo (conversation openers, incl. want openers) were never added
  // to seenContent — the per-turn slice starts AFTER the open. A verbatim
  // re-serve of the opener later in the same convo then read as "first
  // serve" and was never flagged (r39: "Walk with me? I want another pair
  // of eyes on something." re-served at turn 4 after the walk, 0 hits).
  // Seed seenContent with the opening transcript's beat lines.
  try {
    const cc0 = Game.convoGet(vid);
    for (const e of ((cc0 && cc0.transcript) || [])) {
      if (!e || e.who === 'you') continue;
      const n0 = norm(String(e.text || ''));
      if (n0.length > 20 && n0 !== '"..."' && !EXH_SET.has(n0) && !WD_SET.has(n0)) { seenContent.add(n0); seededOpeners.add(n0); }
    }
  } catch (e) {}
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
      // r39 deep: cold player — NEUTRAL picks (no kind preference), gossip
      // forcing until GOSSIP_TARGET picks per seed, NO dlg:commit/dlg:help
      // favor acceptance (tracked as cold refusals in F4). No broken
      // promise, no hostile picks.
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
      // F4: the cold refusal — help/commit offers are seen and walked past.
      const askChoices = choices.filter(x => x && /^(dlg:commit|dlg:help)$/.test(String(x.id || '')));
      if (askChoices.length) {
        out.coldRefusals = out.coldRefusals || [];
        for (const a of askChoices) {
          const aid = String(a.id || '');
          if (!out.coldRefusals.some(r => r.id === aid)) out.coldRefusals.push({ id: aid, label: String(a.label || a.text || '').slice(0, 80) });
        }
      }
      // information diet only — no committing, no offering help.
      if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:details|ask:|gq:|want:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:details|ask:|gq:|want:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && /^(agree|joke|silence|react:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye|dlg:commit|dlg:help|dlg:cant)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye|dlg:commit|dlg:help)/.test(String(x.id || '')));
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
            out.repeatHits.push({ turn: t, pickId, line: txt.slice(0, 160), openerResereve: seededOpeners.has(n) || undefined });
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
  const confSnap = [];        // r38: daily conflict snapshots (the quiet feuds)
  const firstDeep = {};       // r35: pairKey -> day first crossed deep threshold
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
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

  // r38 FEUD driver: cold-competent does survival (competent.daily — donates,
  // keeps promises, comforts, no crimes). This layer adds: 2 convos/day
  // rotating the roster (deep mode, gossip forcing, kind picks), moot duty,
  // conflict snapshots + scene capture. No rival pinning, no hostile picks,
  // no broken promise, no defense layer.
  const talkedToday = new Set();
  function feudConvo() {
    const day = curDay();
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    // 2 conversations/day, rotating roster; conflict parties get priority on
    // alternate days so stage-unfolds (trust-gated in convoTurn) are reached.
    const confParties = [];
    try {
      for (const c of ((Game.state.village || {}).conflicts || [])) {
        if (c && !c.resolved && living.includes(c.a) && !talkedToday.has(c.a)) confParties.push(c.a);
        if (c && !c.resolved && living.includes(c.b) && !talkedToday.has(c.b)) confParties.push(c.b);
      }
    } catch (e) {}
    for (let n = 0; n < 2; n++) {
      let target = null;
      if (n === 0 && confParties.length) target = confParties[(day) % confParties.length];
      if (!target) {
        const pool = living.filter(id => !talkedToday.has(id));
        const arr = pool.length ? pool : living;
        target = arr[(day * 7 + n * 5) % arr.length];
      }
      if (!target || talkedToday.has(target)) continue;
      talkedToday.add(target);
      driveOne(Game, target, n === 0 ? 'feud-daily-1' : 'feud-daily-2', 'deep', convoLog, runState);
    }
  }
  // Reset the daily talk ledger at day rollover (pol.daily runs once per day).
  function resetTalkLedger() { talkedToday.clear(); }

  // r38 CONFLICT snapshot: the quiet feuds. Daily per-conflict state plus
  // trust with each party and talk counts (the reveal bonus inputs).
  function conflictPairKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
  function snapshotConflicts() {
    const d = curDay();
    const sid = me();
    try {
      const v = Game.state.village || {};
      const tr = v.trust || {};
      const conv = v.conv || {};
      const conflicts = ((v.conflicts) || []).map(c => {
        if (!c) return null;
        const ta = tr[c.a] === undefined ? 10 : tr[c.a];
        const tb = tr[c.b] === undefined ? 10 : tr[c.b];
        return {
          key: conflictPairKey(String(c.a), String(c.b)),
          a: vname(Game, c.a), b: vname(Game, c.b), kind: c.kind,
          tension: c.tension || 0, known: !!c.known, stage: c.stage || 0,
          resolved: !!c.resolved,
          trustA: ta, trustB: tb,
          talked: ((conv[c.a] || {}).count || 0) + ((conv[c.b] || {}).count || 0),
        };
      }).filter(Boolean);
      if (!runState.confSeed && conflicts.length) {
        runState.confSeed = conflicts.map(c => ({ key: c.key, a: c.a, b: c.b, kind: c.kind, tension0: c.tension }));
      }
      const tvals = livingIds().map(id => tr[id] === undefined ? 10 : tr[id]);
      const avgTrust = tvals.length ? (tvals.reduce((a, b) => a + b, 0) / tvals.length) : null;
      confSnap.push({ day: d, conflicts, avgTrust: avgTrust == null ? null : +avgTrust.toFixed(1) });
      // FREEZE WATCH: 3+ consecutive snapshots on the same scholar-day = the
      // day clock is stuck. Dump recent beats for diagnosis (pure read).
      const prev = confSnap.length >= 2 ? confSnap[confSnap.length - 2].day : null;
      const prev2 = confSnap.length >= 3 ? confSnap[confSnap.length - 3].day : null;
      if (prev === d && prev2 === d && !(runState.freezeDumpedDay || {})[d]) {
        runState.freezeDumpedDay = runState.freezeDumpedDay || {};
        runState.freezeDumpedDay[d] = true;
        const lines = [`# FREEZE — seed ${runState.seed} scholar-day ${d} stuck 3+ loop-days`,
          `# last 60 beats:`];
        for (const b of beatBuf.slice(-60)) lines.push(`[day ${b.day}] ${b.text.slice(0, 160)}`);
        fs.writeFileSync(path.join(EVIDIR, `freeze-s${runState.seed}-d${d}.txt`), lines.join('\n') + '\n');
      }
    } catch (e) {}
  }

  // r38 F1: NPC<->NPC bond edges. Same bond store as r35, but the pair must
  // exclude the player — organic NPC friendships vs a player-hubbed graph.
  // r35 BOND-FORMATION telemetry: daily bond-map snapshot + first-deep days.
  function isDeep(bb) { return ((bb.v || 0) >= 30 || (bb.depth || 0) >= 1); }
  function snapshotBonds() {
    const d = curDay();
    try {
      const sid = me();
      const bm = ((Game.state.village || {}).bonds) || {};
      const keys = Object.keys(bm);
      let sumV = 0, deepCount = 0;
      let npcPairs = 0, npcDeep = 0, npcSumV = 0;
      for (const k of keys) {
        const bb = bm[k] || {};
        sumV += (bb.v || 0);
        const parts = String(k).split('|');
        const bothNpc = parts.length === 2 && parts[0] !== sid && parts[1] !== sid;
        if (bothNpc) { npcPairs++; npcSumV += (bb.v || 0); }
        if (isDeep(bb)) {
          deepCount++;
          if (bothNpc) npcDeep++;
          if (!firstDeep[k]) {
            firstDeep[k] = { day: d, a: parts[0], b: parts[1], v: (bb.v || 0), depth: (bb.depth || 0), bothNpc };
          }
        }
      }
      bondSnap.push({ day: d, pairs: keys.length, deepCount, avgV: keys.length ? (sumV / keys.length).toFixed(1) : '0',
        npcPairs, npcDeep, npcAvgV: npcPairs ? (npcSumV / npcPairs).toFixed(1) : '0' });
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
            // r37 correction (kept): the accused does NOT vote in their own
            // trial (betrayal.js:1615 — "player votes if present and not
            // accused"). No defense layer this run — skip the ballot.
            vote = null;
          } else {
            // NPC-NPC case: with the room (r35 pattern).
            const need = Math.floor(((c.trial.present || []).length + 1) / 2) + 1;
            const guiltySoFar = c.trial.guiltySoFar || c.trial.guilty || 0;
            vote = guiltySoFar >= need ? 1 : 0;
          }
          if (vote != null) {
            Game.castPlayerVote(c.id, vote);
            const m = moots.find(x => x.caseId === c.id);
            if (m) m.playerVote = vote ? 'guilty' : 'acquit';
          }
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

  const base = competent;
  const pol = Object.assign({}, base, {
    id: policyId,
    daily(Game2, ctx) {
      resetTalkLedger();
      if (base.daily) base.daily(Game2, ctx);
      feudConvo();
      if (gossipForce !== false) mootDuty();
      try { snapshotConflicts(); } catch (e) {}
      try { snapshotBonds(); } catch (e) {}
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay() });
      }
    },
  });
  // r38 FEUD SCENES: extract conflict beats from the say-stream into
  // per-seed scene files (the M3 sense-read set).
  function extractFeudScenes() {
    const SCENES = [
      ['reveal', /never speak\. It's not new\. \(Something old lives in Haven\.\)/],
      ['incident-argument', /in a sharp, quiet argument/],
      ['incident-cornered', /corners you by the fire/],
      ['incident-eatsapart', /eats apart from the others/],
      ['incident-message', /You carry a message from .* to .*\. It's not kind/],
      ['stage1', /Late, quiet, .* tells you:/],
      ['stage2', /That's all you get\. Maybe that's all there is\./],
      ['favoritism-known', /saw how close you've gotten to/],
      ['favoritism-unknown', /has been colder to you lately\. You don't know why/],
      ['mediation', /nodded at .* today\. First time/],
      ['dead-party', /The old argument between .* ended/],
    ];
    const hits = [];
    for (let i = 0; i < beatBuf.length; i++) {
      const t = String(beatBuf[i].text || '');
      for (const [kind, re] of SCENES) {
        if (re.test(t)) {
          const ctx0 = Math.max(0, i - 2), ctx1 = Math.min(beatBuf.length - 1, i + 2);
          const lines = [];
          for (let j = ctx0; j <= ctx1; j++) lines.push(`[day ${beatBuf[j].day}]${j === i ? ' >>>' : '    '} ${String(beatBuf[j].text).slice(0, 300)}`);
          hits.push({ kind, day: beatBuf[i].day, lines });
          break;
        }
      }
    }
    return hits;
  }
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
    for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, line: r.line, openerResereve: r.openerResereve });
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
    l3: { bonds, deepBonds, betrayalCases: cases, mootsConvened, mootsObserved: moots.length, gossipConvos: gossipThreads, gossipPicks: runState.gossipPicks, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a', confSeeded: (runState.confSeed || []).length },
    moots: moots.map(m => ({ caseId: m.caseId, charge: m.charge, convenedDay: m.day, trialDay: m.trialDay || null, playerVote: m.playerVote || null, verdict: m.resolution || null, convicted: m.convicted != null ? m.convicted : null, conveneError: m.error || null, file: m.file || null, playerAccused: !!m.playerAccused, playerRole: m.playerRole || null, broadcastLine: m.broadcastLine || null, unnamedAccused: m.unnamedAccused || [] })),
    conflicts: null,       // r33 field retired
    plotEvents: null,     // r33 field retired
    bondSnap,             // r35: daily {day, pairs, deepCount, avgV} + r38 NPC-NPC edges
    bondEventsCount: bondEvents.length,
    meName: vname(Game, me()),
    bondChannels,         // r36: reason -> {sum, n}
    firstDeep,            // r36: pairKey -> {day, a, b, v, depth, bothNpc}
    confSeed: runState.confSeed || [],  // r38: seeded conflicts {key,a,b,kind,tension0}
    confSnap,             // r38: daily conflict snapshots
    feudScenes: extractFeudScenes(),  // r38: conflict beats from the say-stream
    feudConvos: convoLog.filter(o => /^feud-daily/.test(o.tag || '')).length,
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
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test: conflict seeding + conflict snapshots + cold-competent convos)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, mode: 'journey-social-r39-pilot', policyId: 'journey-social-r39-smoke', gossipForce: false });
  const sSeeded = (smoke.confSeed || []).length;
  const sSnaps = (smoke.confSnap || []).length;
  console.log(`SMOKE: seeded=${sSeeded} confSnaps=${sSnaps} convos=${smoke.convos} feudConvos=${smoke.feudConvos} avgTrust=${smoke.l3.avgTrust}`);
  const selfTest = sSeeded >= 1 && sSnaps >= 8 && smoke.convos > 0 && (smoke.feudConvos | 0) > 0;
  console.log(`SMOKE SELF-TEST: ${selfTest ? 'PASS (conflicts seeded, snapshots complete, cold-competent convos ran)' : 'FAIL (conflict instrumentation broken — investigate before full seeds)'}`);
  if (!selfTest) { console.log('ABORT: conflict instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, mode: 'journey-social-r39-pilot', policyId: 'journey-social-r39-pilot', gossipForce: true });
      const convoLog = r._convoLog; delete r._convoLog;
      // F4: cold refusals — dlg:commit/dlg:help offered and skipped. Stash on
      // r before the log is dropped (the verdict loop only has serialized r).
      const refusals = convoLog.filter(o => (o.coldRefusals || []).length);
      r.f4 = { refusalConvos: refusals.length,
        refusals: refusals.slice(0, 12).map(o => ({ day: o.day, name: o.name, asks: (o.coldRefusals || []).map(x => x.id + ':' + x.label) })) };
      fs.writeFileSync(path.join(EVIDIR, `journey-social-r39-pilot-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r39 FEUD SUMMARY: the seeded conflicts, their lifecycle, scenes.
      {
        const lines = [`# THE COLD HOUSE — seed ${s} (cold-competent, ${r.days}d, ${r.alive} alive)`, ''];
        lines.push(`## seeded conflicts (${(r.confSeed || []).length})`);
        for (const c of (r.confSeed || [])) lines.push(`  ${c.key}: ${c.a} vs ${c.b} (${c.kind}, tension0=${c.tension0})`);
        lines.push('', '## conflict lifecycle (from daily snapshots)');
        for (const c of (r.confSeed || [])) {
          const snaps = [];
          for (const x of (r.confSnap || [])) {
            const y = (x.conflicts || []).find(z => z.key === c.key);
            if (y) snaps.push(Object.assign({ snapDay: x.day }, y));
          }
          const reveal = snaps.find(x => x.known);
          const maxStage = Math.max(0, ...snaps.map(x => x.stage || 0));
          const last = snaps[snaps.length - 1] || {};
          const finalTrust = `trustA=${last.trustA} trustB=${last.trustB}`;
          // F3: mediation-opportunity accounting — 55/55 trigger, fester-days.
          const daysKnown = snaps.filter(x => x.known).length;
          const resIdx = snaps.findIndex(x => x.resolved);
          const medScenes = (r.feudScenes || []).filter(x => x.kind === 'mediation');
          const medPairHit = medScenes.some(x => (x.lines || []).some(l => l.includes(c.a) && l.includes(c.b)));
          const trig55 = snaps.filter(x => !x.resolved).find(x => (x.trustA || 0) >= 55 && (x.trustB || 0) >= 55);
          const festerDays = snaps.filter(x => x.known && !x.resolved).length;
          const resKind = resIdx < 0 ? 'never'
            : (medPairHit ? 'mediation(55/55)' : (trig55 ? 'mediation-likely(55/55)' : 'dead-party/quiet'));
          lines.push(`  ${c.key}: revealDay=${reveal ? reveal.snapDay : '(never)'} maxStage=${maxStage} resolved=${!!last.resolved} finalTension=${last.tension} ${finalTrust}`);
          lines.push(`    F3: daysKnown=${daysKnown} 55/55day=${trig55 ? trig55.snapDay : '(never)'} festerDays=${festerDays} resKind=${resKind} maxTrustA=${Math.max(0, ...snaps.map(x => x.trustA || 0))} maxTrustB=${Math.max(0, ...snaps.map(x => x.trustB || 0))}`);
        }
        lines.push('', '## feud scenes (from say-stream)');
        const byKind = {};
        for (const sc of (r.feudScenes || [])) (byKind[sc.kind] = byKind[sc.kind] || []).push(sc);
        const order = ['reveal', 'incident-argument', 'incident-cornered', 'incident-eatsapart', 'incident-message', 'stage1', 'stage2', 'favoritism-known', 'favoritism-unknown', 'mediation', 'dead-party'];
        for (const k of order) {
          const hits = byKind[k] || [];
          lines.push(`  ${k}: ${hits.length}${hits.length ? ` (days ${hits.map(h => h.day).join(',')})` : ''}`);
        }
        lines.push('', '## trust trajectory (avgTrust every 10d)');
        lines.push('  ' + (r.confSnap || []).filter(x => x.day % 10 === 0).map(x => `d${x.day}:${x.avgTrust}`).join(' '));
        lines.push('', '## NPC<->NPC bond edges (F1, from bondSnap d0/70/140)');
        for (const d of [0, 70, 140]) {
          const b = (r.bondSnap || []).filter(x => x.day <= d).slice(-1)[0];
          if (b) lines.push(`  d${b.day}: npcPairs=${b.npcPairs} npcDeep=${b.npcDeep} npcAvgV=${b.npcAvgV} (allPairs=${b.pairs} allDeep=${b.deepCount})`);
        }
        fs.writeFileSync(path.join(SDIR, `s${s}-feud-summary.txt`), lines.join('\n') + '\n');
        // Feud scene files: grouped scenes with context, for M3 sense-reads.
        const sceneLines = [`# FEUD SCENES — seed ${s} (cold-competent)`, ''];
        for (const k of order) {
          const hits = byKind[k] || [];
          if (!hits.length) continue;
          sceneLines.push(`## ${k} (${hits.length})`);
          for (const h of hits) { sceneLines.push(...h.lines); sceneLines.push(''); }
        }
        if (sceneLines.length > 2) fs.writeFileSync(path.join(SDIR, `s${s}-feudscenes.txt`), sceneLines.join('\n') + '\n');
      }
      // r38 M3 sense-read set: conflict-party convos post-reveal (turns>=4),
      // gossip, late deep, L2' repros.
      const partyNames = new Set();
      for (const c of (r.confSeed || [])) { partyNames.add(c.a); partyNames.add(c.b); }
      const revealDays = {};
      for (const c of (r.confSeed || [])) {
        const hit = (r.confSnap || []).find(x => (x.conflicts || []).some(y => y.key === c.key && y.known));
        revealDays[c.key] = hit ? hit.day : 9999;
      }
      convoLog.filter(o => partyNames.has(o.name) && o.turns >= 4 && o.day >= Math.min(...Object.values(revealDays))).slice(0, 3).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-feud-${i + 1}-${sname(o)}.txt`),
          [`# FEUD-PARTY sense-read — seed ${s} day ${o.day}, ${o.name} (mode ${o.mode}, tag ${o.tag}, turns ${o.turns}, mood at start: ${o.moodAtStart})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
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
      const seeded = (r.confSeed || []).length;
      const revealed = (r.confSeed || []).filter(c => (r.confSnap || []).some(x => (x.conflicts || []).some(y => y.key === c.key && y.known))).length;
      const scenes = {};
      for (const sc of (r.feudScenes || [])) scenes[sc.kind] = (scenes[sc.kind] || 0) + 1;
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} (feud=${r.feudConvos}) gossipPicks=${r.gossipPicks} dryRate=${r.dryRate}/12`);
      console.log(`  conflicts: seeded=${seeded} revealed=${revealed} scenes=${JSON.stringify(scenes)}`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      for (const h of r.l2prime.repeats.slice(0, 6)) console.log(`    d${h.day} ${h.name} t${h.turn} <${h.pickId}>${h.openerResereve ? ' [opener-reserve]' : ''}: ${h.line}`);
      console.log(`  L3: ${JSON.stringify(r.l3)}`);
      console.log(`  regression: P1-streaks=${r.p1carry.streaks} P2-reactDry=${r.p2carry.reactDry}`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  // r39 verdicts
  let m1gaps = 0;
  const m1seeds = [];   // >=1 conflict seeded
  const m2seeds = [];   // feud came alive: revealed AND (incident OR stage OR resolved)
  const m4seeds = [];   // alive >= 5 at end, village not scattered
  const f1 = [];        // NPC-NPC edges per seed {seeded-day pairs, deep}
  const f2 = [];        // favoritism scenes per seed
  const f3 = [];        // mediation-opportunity per conflict: {seed, key, revealDay, 55/55day, festerDays, resKind}
  const f4 = [];        // cold refusals per seed
  for (const r of results) {
    const snaps = r.confSnap || [];
    const days = [...new Set(snaps.map(c => c.day))].sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < days.length; i++) maxGap = Math.max(maxGap, days[i] - days[i - 1]);
    if (maxGap > 2) { console.log(`  seed ${r.seed}: M1 INSTRUMENT GAP (max conflict-snapshot gap ${maxGap}d)`); m1gaps++; }
    const seeded = (r.confSeed || []).length;
    if (seeded >= 1) m1seeds.push(r.seed);
    const revealed = (r.confSeed || []).filter(c => snaps.some(x => (x.conflicts || []).some(y => y.key === c.key && y.known)));
    const incidents = (r.feudScenes || []).filter(x => /^incident-/.test(x.kind)).length;
    const staged = (r.confSeed || []).filter(c => snaps.some(x => (x.conflicts || []).some(y => y.key === c.key && (y.stage || 0) > 0)));
    const resolved = (r.confSeed || []).filter(c => snaps.some(x => (x.conflicts || []).some(y => y.key === c.key && y.resolved)));
    const alive2 = revealed.length > 0 && (incidents > 0 || staged.length > 0 || resolved.length > 0);
    if (alive2) m2seeds.push(r.seed);
    console.log(`  seed ${r.seed}: seeded=${seeded} revealed=${revealed.length} incidents=${incidents} staged=${staged.length} resolved=${resolved.length} -> ${alive2 ? 'ALIVE' : 'quiet'}`);
    if ((r.alive | 0) >= 5 && !(r.endState || {}).scattered) m4seeds.push(r.seed);
    const lastBond = (r.bondSnap || []).slice(-1)[0] || {};
    f1.push({ seed: r.seed, npcPairs: lastBond.npcPairs || 0, npcDeep: lastBond.npcDeep || 0, allPairs: lastBond.pairs || 0 });
    const fav = (r.feudScenes || []).filter(x => /^favoritism-/.test(x.kind));
    if (fav.length) f2.push({ seed: r.seed, n: fav.length, days: fav.map(x => x.day) });
    // F3: per-conflict mediation-opportunity row.
    for (const c of (r.confSeed || [])) {
      const cs = snaps.filter(x => (x.conflicts || []).some(y => y.key === c.key)).map(x => Object.assign({ snapDay: x.day }, (x.conflicts || []).find(y => y.key === c.key)));
      const rev = cs.find(x => x.known);
      const resIdx = cs.findIndex(x => x.resolved);
      const medScenes = (r.feudScenes || []).filter(x => x.kind === 'mediation');
      const medHit = medScenes.some(x => (x.lines || []).some(l => l.includes(c.a) && l.includes(c.b)));
      const trig55 = cs.filter(x => !x.resolved).find(x => (x.trustA || 0) >= 55 && (x.trustB || 0) >= 55);
      const fester = cs.filter(x => x.known && !x.resolved).length;
      f3.push({ seed: r.seed, key: c.key, revealDay: rev ? rev.snapDay : null,
        d55: trig55 ? trig55.snapDay : null, festerDays: fester,
        res: resIdx < 0 ? 'never' : (medHit ? 'mediation' : (trig55 ? 'mediation-likely' : 'dead-party/quiet')) });
    }
    // F4: cold refusals — dlg:commit/dlg:help offered and skipped.
    f4.push({ seed: r.seed, n: ((r.f4 || {}).refusalConvos || 0) });
    console.log(`  seed ${r.seed}: days=${r.days} alive=${r.alive} avgTrust=${r.l3.avgTrust} end=${JSON.stringify(r.endState)}`);
  }
  console.log(`M1 (instrument complete + >=1 conflict seeded on >=3/4 seeds): ${m1gaps ? 'MISS (' + m1gaps + ' seeds)' : 'GO'}; seeded: ${m1seeds.length}/4 [${m1seeds.join(',')}] — ${m1seeds.length >= 3 ? 'GO' : 'MISS (generator failed its 1-2 promise — document)'}`);
  console.log(`M2 (quiet feuds come alive: revealed AND (incident OR stage OR resolved) on >=3/4 seeded runs): ${m2seeds.length}/4 [${m2seeds.join(',')}] — ${m2seeds.length >= 3 ? 'GO' : 'MISS — DOCUMENTED BLANK (seeded feuds never reach the player in 560 village-days)'}`);
  console.log(`M4 (guardrail alive>=5, not scattered): ${m4seeds.length}/4 [${m4seeds.join(',')}] — ${m4seeds.length >= 3 ? 'GO' : 'NO-GO'}`);
  console.log(`F1 (NPC<->NPC bond edges, final snap): ${f1.map(x => `s${x.seed}:${x.npcPairs}p/${x.npcDeep}d (all ${x.allPairs}p)`).join(' ')}`);
  console.log(`F2 (favoritism scenes, informational): ${f2.length ? f2.map(x => `s${x.seed}:${x.n} (d${x.days.join(',d')})`).join(' ') : '(none fired)'}`);
  console.log(`F3 (mediation-opportunity per conflict: revealDay, 55/55day, festerDays, resolution): ${f3.map(x => `s${x.seed}:${x.key} rev=${x.revealDay == null ? 'never' : x.revealDay} 55=${x.d55 == null ? 'never' : x.d55} fester=${x.festerDays}d ->${x.res}`).join(' | ')}`);
  console.log(`F4 (cold refusals, convos where dlg:commit/dlg:help was offered and skipped): ${f4.map(x => `s${x.seed}:${x.n}`).join(' ')}`);
})();
