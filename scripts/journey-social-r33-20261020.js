#!/usr/bin/env node
// journey-social-r33-20261020.js -- SOCIAL leg (leg 5), r33.
// PRE-REGISTERED in evidence/2026-10-20/journey-social-r33.md (written before
// this ran). Leg question: THE RIVALRY LIFECYCLE. The 1-2 seeded NPC-NPC
// conflicts per village (tension 55-75) simmer at +2 @ 10%/day. Across a
// 140-day citizen run: do tensions climb toward the motive bar (70+)? When
// motive >= 45, does a plot form or do the beloved-gate/40%-day/accomplice
// bars suppress it? Do high-tension pairs surface visibly or stay invisible?
// Measurement for Steve's pending moot-gate ruling -- NO TUNING here.
// Bindings (a miss is NO-GO, never re-scored):
//   M1 instrument: daily conflict snapshots complete on 4/4 runs (no gaps
//     >2 days); per-pair motive computed per snapshot.
//   M2 fuel: on >=2/4 seeds, >=1 pair at tension >=70 at some snapshot day >=6.
//   M3 people: 1 sense-read per run of a convo with a conflict-pair member
//     (4 reads); 0 senseless flags.
//   M4 census: alive/dead recorded cleanly on all runs.
//   L3 informational: theft-driver baseline does not bind the citizen arm.
// Policy: r32's citizen driver unchanged (law-abiding: no theft, no cruel
// picks, no player-initiated violence; comfort duty + gossip forcing +
// moot duty voting with the room).
// TOOLING ONLY -- no game code changes in this file.
// Usage: SEEDS=3104,3105,3106,3107 node scripts/journey-social-r33-20261020.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-20');
const TDIR = path.join(EVIDIR, 'social-r33-transcripts');
const MDIR = path.join(EVIDIR, 'social-r33-moots');
for (const d of [EVIDIR, TDIR, MDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 3008;
const SMOKE_DAYS = 10;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [3104, 3105, 3106, 3107]).filter(Number.isFinite);
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
      // deep: r27 gossip forcing — until GOSSIP_TARGET picks per seed, take
      // ask:gossip first.
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
  const conflictSnap = [];   // r33: daily per-pair tension snapshots
  const plotEvents = [];     // r33: plot formations observed
  const seenPlots = new Set();
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

  // r32 CITIZEN driver: genuinely law-abiding. Favorites get food + tending;
  // the player talks with EVERYONE kindly — no theft (r30's favoritism
  // wrapper stole from outsiders every 5d, fueling its own plots), no cruel
  // picks, no player-initiated violence. M2 asks whether NPC-NPC cases form
  // on their own under this play.
  const ctx2 = { favorites: null };
  const citizenCtx = { others: null };
  function pickCircles() {
    const living = livingIds();
    const byTrust = living.slice().sort((a, b) => trustOf(b) - trustOf(a));
    ctx2.favorites = byTrust.slice(0, 2);
    citizenCtx.others = byTrust.slice(2);
  }
  function citizenRound() {
    const day = curDay();
    for (const vid of (ctx2.favorites || [])) {
      if (!livingIds().includes(vid)) continue;
      try {
        const needs = safe(() => Game.npcNeeds(vid) || {}, {});
        const s = Game.state.scholar || {};
        if ((needs.hunger || 0) > 30 && (s.kcal || 0) > 1200 && Game.giveFood) Game.giveFood(vid);
      } catch (e) {}
      try { if (Game.tendVillager) Game.tendVillager(vid); } catch (e) {}
    }
    const living = livingIds();
    const favAlive = (ctx2.favorites || []).filter(id => living.includes(id));
    const othAlive = (citizenCtx.others || []).filter(id => living.includes(id));
    if (day >= 3) {
      // alternate: favorites one day, everyone else the next — the player
      // knows the whole village, not just two friends.
      if (day % 2 === 0 && favAlive.length) driveOne(Game, favAlive[(day / 2) % favAlive.length | 0], 'deep-daily', 'deep', convoLog, runState);
      else if (day % 2 === 1 && othAlive.length) driveOne(Game, othAlive[(day - 1) % othAlive.length | 0], 'citizen-daily', 'deep', convoLog, runState);
      else if (favAlive.length) driveOne(Game, favAlive[0], 'deep-daily', 'deep', convoLog, runState);
    }
  }

  // r30 comfort duty: REPEAT SITTINGS. Each day, sit with the highest-need
  // living NPC and force seek_comfort picks. If the same villager still
  // qualifies tomorrow, keep sitting with them (up to 3 consecutive
  // sittings) before rotating — grief beats play out over sittings.
  const comfortCtx = { target: null, sittings: 0 };
  function comfortDuty() {
    const day = curDay();
    if (day < 3) return;
    const living = livingIds();
    const scored = living.map(vid => ({ vid, score: comfortScore(vid) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || trustOf(b.vid) - trustOf(a.vid));
    if (!scored.length) { comfortCtx.target = null; comfortCtx.sittings = 0; return; }
    const stillQualifies = comfortCtx.target && scored.some(x => x.vid === comfortCtx.target);
    let pick;
    if (stillQualifies && comfortCtx.sittings < 3) {
      pick = comfortCtx.target; comfortCtx.sittings++;
    } else {
      pick = scored[0].vid;
      comfortCtx.target = pick; comfortCtx.sittings = 1;
    }
    driveOne(Game, pick, 'comfort-sit' + comfortCtx.sittings, 'comfort', convoLog, runState);
  }

  // r33 RIVALRY LIFECYCLE telemetry: daily conflict snapshots + plot events.
  function snapshotConflicts() {
    const d = curDay();
    try {
      const cs = ((Game.state.village || {}).conflicts || []);
      for (const c of cs) {
        let motive = null;
        try { const m = Game.motiveBetween ? Game.motiveBetween(c.a, c.b) : null; motive = m ? m.score : null; } catch (e) {}
        conflictSnap.push({ day: d, a: vname(Game, c.a), b: vname(Game, c.b),
          kind: c.kind || '?', tension: (c.tension | 0), stage: (c.stage | 0),
          resolved: !!c.resolved, known: !!c.known, motive });
      }
    } catch (e) {}
  }
  function pollPlots() {
    const d = curDay();
    try {
      const bs = Game.betrayalState ? Game.betrayalState() : null;
      for (const pl of (((bs || {}).plots) || [])) {
        if (!pl || !pl.id || seenPlots.has(pl.id)) continue;
        seenPlots.add(pl.id);
        plotEvents.push({ day: d, id: pl.id,
          leader: vname(Game, pl.leader),
          accomplices: (pl.accomplices || []).map(x => vname(Game, x)).join('+'),
          target: vname(Game, pl.target),
          motiveScore: pl.motiveScore, reasons: (pl.motive || []).join('/'),
          sprung: !!pl.sprung, resolved: !!pl.resolved });
      }
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
      if (base.daily) base.daily(Game2, ctx);
      if (curDay() === 2 && !ctx2.favorites) pickCircles();
      if (ctx2.favorites) citizenRound();
      comfortDuty();
      if (gossipForce !== false) mootDuty();
      try { snapshotConflicts(); } catch (e) {}
      try { pollPlots(); } catch (e) {}
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
    conflicts: conflictSnap,
    plotEvents,
    _convoLog: convoLog, // not serialized
  };
}

(async () => {
  // ---- 10-day smoke self-test BEFORE the full seeds.
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test of L3 counters)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, mode: 'journey-social-r33-pilot', policyId: 'journey-social-r33-smoke', gossipForce: false });
  console.log(`SMOKE: bonds=${smoke.l3.bonds} cases=${smoke.l3.betrayalCases} convos=${smoke.convos}`);
  const selfTest = smoke.l3.bonds > 0 && smoke.convos > 0;
  console.log(`SMOKE SELF-TEST: ${selfTest ? 'PASS (bonds counter reads nonzero — instrumentation OK)' : 'FAIL (zero bonds — investigate before full seeds)'}`);
  if (!selfTest) { console.log('ABORT: L3 instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, mode: 'journey-social-r33-pilot', policyId: 'journey-social-r33-pilot', gossipForce: true });
      const convoLog = r._convoLog; delete r._convoLog;
      fs.writeFileSync(path.join(EVIDIR, `journey-social-r33-pilot-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r33 M3 sense-read set: conversations with conflict-pair members (do they talk
      // about the other? coldness, gossip, history?). Pair vids from the conflict snapshots.
      const pairVids = new Set();
      for (const c of (r.conflicts || [])) { pairVids.add(c.a); pairVids.add(c.b); }
      const pairNameSet = new Set((r.conflicts || []).flatMap(c => [c.a, c.b]));
      convoLog.filter(o => pairNameSet.has(o.name) && o.turns >= 4).slice(0, 3).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-rival-${i + 1}-${sname(o)}.txt`),
          [`# RIVALRY sense-read — seed ${s} day ${o.day}, ${o.name} (mode ${o.mode}, tag ${o.tag}, turns ${o.turns})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // Sense-read set: 2 comfort + 2 gossip + 2 late deep (+2 regular deep for continuity).
      convoLog.filter(o => o.isComfortConvo && o.turns >= 5).slice(0, 2).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-comfort-${i + 1}-${sname(o)}.txt`),
          [`# comfort sitting — seed ${s} day ${o.day}, ${o.name} (mood at start: ${o.moodAtStart}, comfortPicks=${o.comfortPicks})`,
           `# comfortRepeatHits=${o.comfortRepeatHits.length} l2hits=${o.repeatHits.length}`,
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
      convoLog.filter(o => o.mode === 'deep' && o.turns >= 6).slice(0, 2).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-deep-${i + 1}-${sname(o)}.txt`),
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
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} (deep=${r.deepConvos} comfort=${r.comfortConvos}/${r.comfortPicksTotal}) gossipPicks=${r.gossipPicks} gossipConvos=${r.gossipConvos} dryRate=${r.dryRate}/12`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      for (const h of r.l2prime.repeats.slice(0, 6)) console.log(`    d${h.day} ${h.name} t${h.turn} <${h.pickId}>: ${h.line}`);
      console.log(`  COMFORT-REPEAT hits: ${r.comfortRepeat.count}`);
      for (const h of r.comfortRepeat.hits.slice(0, 8)) console.log(`    d${h.day} ${h.name} t${h.turn} <${h.pickId}> [${h.pool}, first t${h.firstTurn}]: ${h.line}`);
      console.log(`  SETTLE-SPEAK: settles=${r.settleSpeak.settlesObserved} spoken=${r.settleSpeak.spokenGratitude} silent=${r.settleSpeak.silentCount}`);
      for (const h of r.settleSpeak.silentSettles.slice(0, 6)) console.log(`    SILENT d${h.day} ${h.name} favor=${h.favorId} "${h.short}" ${h.before}->${h.after}`);
      console.log(`  L3: ${JSON.stringify(r.l3)}`);
      console.log(`  moots: ${r.moots.length ? JSON.stringify(r.moots.map(m => ({ c: m.caseId, day: m.convenedDay, role: m.playerRole, vote: m.playerVote, verdict: m.verdict, err: m.conveneError, unnamed: m.unnamedAccused }))) : '(none convened)'}`);
      console.log(`  regression: P1-streaks=${r.p1carry.streaks} P2-reactDry=${r.p2carry.reactDry}`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  // r33 verdicts
  let m1gaps = 0;
  const m2seeds = [];
  for (const r of results) {
    const snaps = r.conflicts || [];
    // M1: snapshot gaps > 2 days
    const days = [...new Set(snaps.map(c => c.day))].sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < days.length; i++) maxGap = Math.max(maxGap, days[i] - days[i - 1]);
    const pairs = new Set(snaps.map(c => c.a + '|' + c.b));
    if (maxGap > 2) { console.log(`  seed ${r.seed}: M1 INSTRUMENT GAP (max snapshot gap ${maxGap}d)`); m1gaps++; }
    // M2: any pair at tension >= 70 on day >= 6
    const hot = snaps.filter(c => c.day >= 6 && c.tension >= 70);
    const hotPairs = [...new Set(hot.map(c => `${c.a}|${c.b}@${c.tension}(d${c.day})`))];
    if (hotPairs.length) m2seeds.push(r.seed);
    // per-pair trajectory summary
    const traj = {};
    for (const c of snaps) {
      const k = c.a + ' vs ' + c.b;
      traj[k] = traj[k] || { kind: c.kind, t0: c.tension, tmax: 0, dmax: 0, resolved: false, motiveMax: 0 };
      const t = traj[k];
      if (c.tension > t.tmax) { t.tmax = c.tension; t.dmax = c.day; }
      if ((c.motive | 0) > t.motiveMax) t.motiveMax = c.motive | 0;
      if (c.resolved) t.resolved = true;
    }
    console.log(`  seed ${r.seed}: conflicts: ${Object.entries(traj).map(([k, t]) => `${k} [${t.kind}] t0=${t.t0} tmax=${t.tmax}@d${t.dmax} motiveMax=${t.motiveMax}${t.resolved ? ' RESOLVED' : ''}`).join(' ; ') || '(none seeded)'}`);
    console.log(`    plotEvents: ${(r.plotEvents || []).length ? r.plotEvents.map(p => `${p.id}[${p.leader}+${p.accomplices}->${p.target} motive=${p.motiveScore} d${p.day}]`).join(' ') : '(none)'}`);
    console.log(`    moots: ${(r.moots || []).length ? r.moots.map(m => `${m.caseId}[${m.verdict}]`).join(' ') : '(none)'}`);
  }
  console.log(`M1 (instrument, snapshot gaps): ${m1gaps ? 'MISS (' + m1gaps + ' seeds with gaps)' : 'GO'}`);
  console.log(`M2 (fuel: >=1 pair at tension>=70 on >=2/4 seeds): ${m2seeds.length}/4 seeds [${m2seeds.join(',')}] — ${m2seeds.length >= 2 ? 'GO' : 'NO-GO'}`);
})();
