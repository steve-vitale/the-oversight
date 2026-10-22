#!/usr/bin/env node
// journey-social-r39-20261022.js -- SOCIAL leg (leg 5), r39.
// PRE-REGISTERED in hidden_files/evidence/2026-10-22/journey-social-r39.md
// (written before this ran). Leg question: THE GRAPEVINE. The gossip engine
// (game.js spreadGossip/spreadRumor/seedGossip, conversation.js
// convoGossipBeat, askAbout walk-down) is the village's information network.
// Code-read hypotheses going in:
//   H1 (player rumors travel): spreadRumor seeds with a first hearer, then
//     spreadGossip retells each day-part along social lines (warm .65, base
//     .35, prickly/withdrawn .12), distortion++ per hop, dims mutate at
//     distortion>=2 (45%/hop), stories fade after ~3 days. Retelling
//     fragments narrate ("You catch fragments by the fire - X telling Y
//     about Z").
//   H2 (NPC deed gossip is DEAD ON ARRIVAL): recordDeed
//     (villager-agency.js:675) calls seedGossip('deed', dims, []) with NO
//     hearers. spreadGossip only iterates g.heard as tellers; askAbout only
//     serves gossip the SPEAKER has heard. A heard-less entry can never gain
//     a teller, never serve, never apply rep. Measured here, not asserted.
//   H3 (attribution): when the FIRST hearer retells, 15%/hop the subject
//     remembers 'rumor_about_them' traced to the player; caught lying costs
//     honesty rep + trust -6 (nasty) / -2. Hops apply REP only
//     (applyRep(..., noTrust=true)); trust[subject] moves only via the
//     caught-trace bump (CANON: gossip moves REP, never trust).
// Bindings (a miss is NO-GO, never re-scored):
//   M1 instrument: gossip census complete on 4/4 runs (no gaps >2d); each
//     run seeds r1 (d1 'stingy' rumor) and r2 (d30 'generous' rumor); each
//     run observes >=1 NPC-deed gossip entry in the census.
//   M2 grapevine carries stories: EACH player rumor reaches >=half the living
//     roster within 6 days AND distortion >=2 - GO = >=3/4 runs. A miss is a
//     DOCUMENTED BLANK, not re-scored.
//   M3 people: >=4 sense-reads (retelling fragments + convo gossip beats)
//     meet the quality bar; 0 fabricated-history flags.
//   M4 guardrail: >=3/4 runs end with >=5 alive and the village not scattered.
//   L2' standing: verbatim content-beat repeats within one convo = finding.
//   F1 informational: NPC-deed gossip (heard:[] at seed) - count entries,
//     count that ever gain a hearer before the 3-day fade. 0 across all runs
//     CONFIRMS the H2 blank.
//   F2 informational: trust[subject] across each rumor's travel window - any
//     move must coincide with a caught-tracing event; rep[subject] should
//     move with hearsay.
// Policy: warm-competent (competent base; warm neighbor: donates, keeps
// promises, comforts; ZERO crimes) + driver layer: 2 convos/day rotating the
// roster (deep mode, gossip forcing GOSSIP_TARGET=3, kind picks - no hostile
// picks, no broken promise); rumor seeding d1 + d30 via Game.spreadRumor with
// a first hearer; daily gossip census; heard-less deed-gossip watch; subject
// trust/rep snapshots; say-stream fragment capture. TOOLING ONLY -- no game
// code changes in this file.
// Usage: SEEDS=3601,3602,3603,3604 node scripts/journey-social-r39-20261022.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-22');
const TDIR = path.join(EVIDIR, 'social-r39-transcripts');
const GDIR = path.join(EVIDIR, 'social-r39-gossip');
for (const d of [EVIDIR, TDIR, GDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

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
      // r39 deep: warm player — kind picks, gossip forcing until GOSSIP_TARGET
      // picks per seed. No broken promise, no hostile picks.
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
  const gossipSnap = [];      // r39: daily gossip census (the grapevine)
  const rumors = {};          // r39: r1/r2 seeded rumors {seedDay,type,subject,firstHearer,sig,trust0,rep0}
  const deedWatch = {};       // r39 F1: heard-less gossip entries -> {seedDay,action,day,gainedHearer}
  const traceWatch = [];      // r39 F2: memory 'rumor_about_them' sightings {day,subject,note}
  const firstDeep = {};       // r35: pairKey -> day first crossed deep threshold
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  // r39 GRAPEVINE driver: warm-competent does survival (competent.daily —
  // donates, keeps promises, comforts, no crimes). This layer adds: 2
  // convos/day rotating the roster (deep mode, gossip forcing, kind picks),
  // player rumor seeding (d1 stingy, d30 generous) via Game.spreadRumor with
  // a first hearer, daily gossip census, heard-less deed-gossip watch,
  // subject trust/rep snapshots, trace watch. No hostile picks, no broken
  // promise, no defense layer.
  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = me();
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  const talkedToday = new Set();
  function trustOf(vid) { try { const t = (Game.state.village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return 10; } }
  function grapeConvos() {
    const day = curDay();
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    // 2 conversations/day, rotating roster.
    for (let n = 0; n < 2; n++) {
      const pool = living.filter(id => !talkedToday.has(id));
      const arr = pool.length ? pool : living;
      const target = arr[(day * 7 + n * 5) % arr.length];
      if (!target || talkedToday.has(target)) continue;
      talkedToday.add(target);
      driveOne(Game, target, n === 0 ? 'grape-daily-1' : 'grape-daily-2', 'deep', convoLog, runState);
    }
  }
  // Reset the daily talk ledger at day rollover (pol.daily runs once per day).
  function resetTalkLedger() { talkedToday.clear(); }

  // r39 RUMOR SEEDING: the player starts rumors via the real drama verb.
  // d1: nasty ('stingy' about a random NPC); d30: kind ('generous' about
  // another NPC). Deterministic picks from the seed so runs are repeatable.
  const rumRng = mulberry32(seed);
  function livingNames() { return livingIds().map(id => ({ id, name: vname(Game, id) })); }
  function repSnap(vid) {
    try { const r = Game.repOf(vid) || {}; return { generous: r.generous | 0, brave: r.brave | 0, honest: r.honest | 0, competent: r.competent | 0 }; }
    catch (e) { return null; }
  }
  function seedRumors() {
    const d = curDay();
    const living = livingNames();
    if (living.length < 3) return;
    const pick = (exclude) => {
      const pool = living.filter(x => !exclude.includes(x.id));
      if (!pool.length) return null;
      return pool[Math.floor(rumRng() * pool.length)];
    };
    if (d >= 1 && !rumors.r1) {
      const t = pick([]); if (!t) return;
      const h = pick([t.id]); if (!h) return;
      let g = null;
      try { g = Game.spreadRumor(t.id, 'stingy', h.id); } catch (e) { rumors.r1 = { error: String(e.message).slice(0, 120) }; return; }
      if (!g) { rumors.r1 = { error: 'spreadRumor returned null (dedup)' }; return; }
      rumors.r1 = { seedDay: d, type: 'stingy', subject: t.id, subjectName: t.name,
        firstHearer: h.id, firstHearerName: h.name, partKey: g.partKey,
        sig: 'gossip:stingy|' + t.id + '|' + g.partKey,
        trust0: trustOf(t.id), rep0: repSnap(t.id) };
    }
    if (d >= 30 && !rumors.r2) {
      const t = pick([rumors.r1 ? rumors.r1.subject : null]); if (!t) return;
      const h = pick([t.id]); if (!h) return;
      let g = null;
      try { g = Game.spreadRumor(t.id, 'generous', h.id); } catch (e) { rumors.r2 = { error: String(e.message).slice(0, 120) }; return; }
      if (!g) { rumors.r2 = { error: 'spreadRumor returned null (dedup)' }; return; }
      rumors.r2 = { seedDay: d, type: 'generous', subject: t.id, subjectName: t.name,
        firstHearer: h.id, firstHearerName: h.name, partKey: g.partKey,
        sig: 'gossip:generous|' + t.id + '|' + g.partKey,
        trust0: trustOf(t.id), rep0: repSnap(t.id) };
    }
  }

  // r39 GOSSIP census: every gossip entry's travel state, daily. Also the
  // heard-less deed-gossip watch (F1) and rumor subject trust/rep + trace
  // snapshots (F2/H3).
  function gossipEntryView(g) {
    const dims = g.dims || {};
    return {
      sig: 'gossip:' + (g.action || '') + '|' + (dims.who || '') + '|' + (g.partKey || ('d' + (g.day || 0))),
      action: g.action || '?', who: dims.who ? vname(Game, dims.who) : null,
      day: g.day || 0, heard: (g.heard || []).length,
      distortion: g.distortion || 0, playerRumor: !!g.playerRumor,
      dims: Object.keys(dims).filter(k => k !== 'who' && typeof dims[k] === 'number').map(k => k + '=' + dims[k]).join(','),
    };
  }
  function snapshotGossip() {
    const d = curDay();
    try {
      const v = Game.state.village || {};
      const entries = (v.gossip || []).map(gossipEntryView);
      // F1: any gossip seeded heard-less (the recordDeed 'deed' path) — does
      // it EVER gain a hearer before the 3-day fade?
      for (const g of (v.gossip || [])) {
        if (g.action === 'deed' && !(g.heard || []).length && !deedWatch[g.partKey || g.day]) {
          deedWatch[g.partKey || g.day] = { seedDay: g.day || d, action: g.action, partKey: g.partKey,
            dims: JSON.stringify(g.dims || {}).slice(0, 120), gainedHearer: false, maxHeard: 0 };
        }
      }
      for (const k of Object.keys(deedWatch)) {
        const w = deedWatch[k];
        // NOTE: match action too — partKeys collide across actions (an
        // 'order'/'departure' entry can share "4:0" with a 'deed' entry).
        const g = (v.gossip || []).find(x => x.action === 'deed' && (x.partKey || x.day) === k);
        if (g) {
          const n = (g.heard || []).length;
          if (n > 0) { w.gainedHearer = true; w.maxHeard = Math.max(w.maxHeard, n); w.firstHeardDay = w.firstHeardDay == null ? d : w.firstHeardDay; }
        }
      }
      // F2/H3: rumor subject trust + rep trajectory; trace watch.
      const rumorWatch = {};
      for (const rk of ['r1', 'r2']) {
        const r = rumors[rk];
        if (!r || r.error || !r.subject) continue;
        const g = (v.gossip || []).find(x => (x.partKey || '') === r.partKey);
        rumorWatch[rk] = {
          seedDay: r.seedDay, type: r.type, subject: r.subjectName,
          heard: g ? (g.heard || []).length : null, distortion: g ? (g.distortion || 0) : null,
          trust: trustOf(r.subject), trust0: r.trust0,
          rep: repSnap(r.subject), rep0: r.rep0,
        };
        // trace: did the subject remember the rumor (traced to the player)?
        const mem = (((v.memory) || {})[r.subject]) || [];
        const traces = mem.filter(m => m.t === 'rumor_about_them');
        for (const t of traces) {
          // NOTE: compare against subjectName — the pushed record stores
          // the NAME, not the id (r39 pilot bug: compared to r.subject).
          // Also note: memory entries don't record WHICH rumor they came
          // from; late-window entries may belong to other gossip about the
          // same person. Post-hoc, restrict to the rumor window and the
          // "traced to you" note (only a playerRumor can produce that).
          if (!traceWatch.some(x => x.rumor === rk && x.day === t.day && x.subject === r.subjectName)) {
            traceWatch.push({ rumor: rk, day: t.day, subject: r.subjectName, note: String(t.note || '').slice(0, 200) });
          }
        }
      }
      gossipSnap.push({ day: d, n: entries.length, entries, deedWatch: Object.keys(deedWatch).length, rumorWatch });
      // FREEZE WATCH: 3+ consecutive snapshots on the same scholar-day = the
      // day clock is stuck. Dump recent beats for diagnosis (pure read).
      const prev = gossipSnap.length >= 2 ? gossipSnap[gossipSnap.length - 2].day : null;
      const prev2 = gossipSnap.length >= 3 ? gossipSnap[gossipSnap.length - 3].day : null;
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

  const base = competent;
  const pol = Object.assign({}, base, {
    id: policyId,
    daily(Game2, ctx) {
      resetTalkLedger();
      if (base.daily) base.daily(Game2, ctx);
      grapeConvos();
      try { seedRumors(); } catch (e) {}
      try { snapshotGossip(); } catch (e) {}
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay() });
      }
    },
  });


  // r39 GOSSIP SCENES: extract grapevine beats from the say-stream into
  // per-seed scene files (the M3 sense-read set).
  function extractGossipScenes() {
    const SCENES = [
      ['seed-rumor', /You've been telling people .* has been/],
      ['retell-fragment', /You catch fragments by the fire/],
      ['voice-lowered', /lowers their voice/],
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
    l3: { bonds, deepBonds, betrayalCases: cases, gossipConvos: gossipThreads, gossipPicks: runState.gossipPicks, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
    conflicts: null,       // r33 field retired
    plotEvents: null,     // r33 field retired
    meName: vname(Game, me()),
    rumors,               // r39: r1/r2 seeded rumors {seedDay,type,subject,firstHearer,sig,trust0,rep0}
    gossipSnap,           // r39: daily gossip census
    deedWatch,            // r39 F1: heard-less deed gossip -> gainedHearer?
    traceWatch,           // r39 F2/H3: subject memory 'rumor_about_them' sightings
    gossipScenes: extractGossipScenes(),  // r39: grapevine beats from the say-stream
    grapeConvos: convoLog.filter(o => /^grape-daily/.test(o.tag || '')).length,
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
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test: rumor seeding + gossip census + warm-competent convos)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, mode: 'journey-social-r39-pilot', policyId: 'journey-social-r39-smoke', gossipForce: false });
  const sRumors = Object.keys(smoke.rumors || {}).filter(k => !(smoke.rumors[k] || {}).error);
  const sSnaps = (smoke.gossipSnap || []).length;
  console.log(`SMOKE: rumors=${sRumors.join(',') || '(none)'} gossipSnaps=${sSnaps} convos=${smoke.convos} grapeConvos=${smoke.grapeConvos} avgTrust=${smoke.l3.avgTrust}`);
  const selfTest = sRumors.length >= 1 && sSnaps >= 8 && smoke.convos > 0 && (smoke.grapeConvos | 0) > 0;
  console.log(`SMOKE SELF-TEST: ${selfTest ? 'PASS (rumor seeded, gossip census complete, warm-competent convos ran)' : 'FAIL (gossip instrumentation broken — investigate before full seeds)'}`);
  if (!selfTest) { console.log('ABORT: gossip instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, mode: 'journey-social-r39-pilot', policyId: 'journey-social-r39-pilot', gossipForce: true });
      const convoLog = r._convoLog; delete r._convoLog;
      fs.writeFileSync(path.join(EVIDIR, `journey-social-r39-pilot-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r39 GRAPEVINE SUMMARY: the seeded rumors, their travel, scenes.
      {
        const lines = [`# THE GRAPEVINE — seed ${s} (warm-competent, ${r.days}d, ${r.alive} alive)`, ''];
        lines.push(`## seeded rumors`);
        for (const rk of ['r1', 'r2']) {
          const rum = (r.rumors || {})[rk];
          if (!rum) { lines.push(`  ${rk}: (never seeded — run ended early?)`); continue; }
          if (rum.error) { lines.push(`  ${rk}: ERROR ${rum.error}`); continue; }
          lines.push(`  ${rk}: ${rum.type} about ${rum.subjectName} (seedDay=${rum.seedDay}, firstHearer=${rum.firstHearerName})`);
          const snaps = [];
          for (const x of (r.gossipSnap || [])) {
            const rw = (x.rumorWatch || {})[rk];
            if (rw) snaps.push(Object.assign({ snapDay: x.day }, rw));
          }
          const living0 = livingCountAt(r, rum.seedDay);
          let halfDay = null, maxDist = 0, maxHeard = 0;
          for (const sn of snaps) {
            if (sn.heard != null) {
              maxHeard = Math.max(maxHeard, sn.heard);
              if (halfDay == null && living0 > 0 && sn.heard >= living0 / 2 && (sn.snapDay - rum.seedDay) <= 6) halfDay = sn.snapDay;
            }
            if (sn.distortion != null) maxDist = Math.max(maxDist, sn.distortion);
          }
          const last = snaps[snaps.length - 1] || {};
          lines.push(`    travel: maxHeard=${maxHeard} maxDistortion=${maxDist} halfReachDay=${halfDay == null ? '(never<=6d)' : halfDay}`);
          lines.push(`    subject trust: ${rum.trust0} -> ${last.trust}  rep: ${JSON.stringify(rum.rep0)} -> ${JSON.stringify(last.rep)}`);
        }
        lines.push('', '## grapevine scenes (from say-stream)');
        const byKind = {};
        for (const sc of (r.gossipScenes || [])) (byKind[sc.kind] = byKind[sc.kind] || []).push(sc);
        for (const k of ['seed-rumor', 'retell-fragment', 'voice-lowered']) {
          const hits = byKind[k] || [];
          lines.push(`  ${k}: ${hits.length}${hits.length ? ` (days ${hits.map(h => h.day).join(',')})` : ''}`);
        }
        lines.push('', '## trace watch (subject remembers rumor, traced to player?)');
        for (const t of (r.traceWatch || [])) lines.push(`  d${t.day} ${t.subject} (${t.rumor}): ${t.note}`);
        if (!(r.traceWatch || []).length) lines.push('  (none)');
        lines.push('', '## F1: heard-less deed gossip (H2 blank check)');
        const dw = r.deedWatch || {};
        const dwKeys = Object.keys(dw);
        lines.push(`  entries: ${dwKeys.length}; ever gained a hearer: ${dwKeys.filter(k => dw[k].gainedHearer).length}`);
        for (const k of dwKeys.slice(0, 12)) {
          const w = dw[k];
          lines.push(`    d${w.seedDay} deed [${w.dims}] -> heard: ${w.gainedHearer ? 'YES (max ' + w.maxHeard + ', first d' + w.firstHeardDay + ')' : 'never'}`);
        }
        fs.writeFileSync(path.join(GDIR, `s${s}-grapevine-summary.txt`), lines.join('\n') + '\n');
        // Gossip scene files: grouped scenes with context, for M3 sense-reads.
        const sceneLines = [`# GRAPEVINE SCENES — seed ${s} (warm-competent)`, ''];
        for (const k of ['seed-rumor', 'retell-fragment', 'voice-lowered']) {
          const hits = byKind[k] || [];
          if (!hits.length) continue;
          sceneLines.push(`## ${k} (${hits.length})`);
          for (const h of hits) { sceneLines.push(...h.lines); sceneLines.push(''); }
        }
        if (sceneLines.length > 2) fs.writeFileSync(path.join(GDIR, `s${s}-gossipscenes.txt`), sceneLines.join('\n') + '\n');
      }
      // r39 M3 sense-read set: gossip convos (turns>=4), late deep, L2' repros.
      convoLog.filter(o => o.gossipPicks > 0 && o.turns >= 4).slice(0, 3).forEach((o, i) => {
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
      const scenes = {};
      for (const sc of (r.gossipScenes || [])) scenes[sc.kind] = (scenes[sc.kind] || 0) + 1;
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} (grape=${r.grapeConvos}) gossipPicks=${r.gossipPicks} dryRate=${r.dryRate}/12`);
      for (const rk of ['r1', 'r2']) {
        const rum = (r.rumors || {})[rk];
        console.log(`  ${rk}: ${rum && !rum.error ? `${rum.type} about ${rum.subjectName} (d${rum.seedDay})` : '(no rumor: ' + ((rum || {}).error || 'not seeded') + ')'}`);
      }
      console.log(`  scenes: ${JSON.stringify(scenes)} traces: ${(r.traceWatch || []).length} deedWatch: ${Object.keys(r.deedWatch || {}).length}`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      for (const h of r.l2prime.repeats.slice(0, 6)) console.log(`    d${h.day} ${h.name} t${h.turn} <${h.pickId}>: ${h.line}`);
      console.log(`  L3: ${JSON.stringify(r.l3)}`);
      console.log(`  regression: P1-streaks=${r.p1carry.streaks} P2-reactDry=${r.p2carry.reactDry}`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  // r39 verdicts
  let m1gaps = 0;
  const m1seeds = [];   // both rumors seeded + >=1 deed gossip observed
  const m2seeds = [];   // EACH rumor: >=half roster within 6d AND distortion >=2
  const m4seeds = [];   // alive >= 5 at end, village not scattered
  const f1 = [];        // heard-less deed gossip per seed {entries, gainedHearer}
  const f2 = [];        // trust trajectory per rumor per seed {seeded, trust0->trust, caught?}
  for (const r of results) {
    const snaps = r.gossipSnap || [];
    const days = [...new Set(snaps.map(c => c.day))].sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < days.length; i++) maxGap = Math.max(maxGap, days[i] - days[i - 1]);
    if (maxGap > 2) { console.log(`  seed ${r.seed}: M1 INSTRUMENT GAP (max gossip-snapshot gap ${maxGap}d)`); m1gaps++; }
    const rum1 = (r.rumors || {}).r1, rum2 = (r.rumors || {}).r2;
    const ok1 = rum1 && !rum1.error, ok2 = rum2 && !rum2.error;
    const deedN = Object.keys(r.deedWatch || {}).length;
    if (ok1 && ok2 && deedN >= 1) m1seeds.push(r.seed);
    let carried = 0, rumorTotal = 0;
    for (const rk of ['r1', 'r2']) {
      const rum = (r.rumors || {})[rk];
      if (!rum || rum.error) continue;
      rumorTotal++;
      const living0 = livingCountAt(r, rum.seedDay);
      let halfOk = false, distOk = false;
      for (const x of snaps) {
        const rw = (x.rumorWatch || {})[rk];
        if (!rw) continue;
        if (rw.heard != null && living0 > 0 && rw.heard >= living0 / 2 && (x.day - rum.seedDay) <= 6) halfOk = true;
        if (rw.distortion != null && rw.distortion >= 2) distOk = true;
      }
      if (halfOk && distOk) carried++;
      const traces = (r.traceWatch || []).filter(t => t.rumor === rk);
      const lastSnap = snaps.slice(-1)[0];
      const lastRw = lastSnap && (lastSnap.rumorWatch || {})[rk];
      f2.push({ seed: r.seed, rumor: rk, type: rum.type, subject: rum.subjectName,
        halfReach6d: halfOk, distortion2: distOk,
        trust: `${rum.trust0} -> ${lastRw ? lastRw.trust : '?'}`, caught: traces.length > 0 });
    }
    if (rumorTotal > 0 && carried === rumorTotal) m2seeds.push(r.seed);
    console.log(`  seed ${r.seed}: rumors=${rumorTotal} carried=${carried} deedEntries=${deedN} -> ${carried === rumorTotal && rumorTotal > 0 ? 'CARRIED' : 'quiet'}`);
    if ((r.alive | 0) >= 5 && !(r.endState || {}).scattered) m4seeds.push(r.seed);
    const dw = r.deedWatch || {};
    f1.push({ seed: r.seed, entries: Object.keys(dw).length, gained: Object.keys(dw).filter(k => dw[k].gainedHearer).length });
    console.log(`  seed ${r.seed}: days=${r.days} alive=${r.alive} avgTrust=${r.l3.avgTrust} end=${JSON.stringify(r.endState)}`);
  }
  console.log(`M1 (instrument complete + r1&r2 seeded + >=1 deed gossip observed, on >=3/4 seeds): ${m1gaps ? 'MISS (' + m1gaps + ' seeds)' : 'GO'}; qualified: ${m1seeds.length}/4 [${m1seeds.join(',')}] — ${m1seeds.length >= 3 ? 'GO' : 'MISS (seeding/observation failed — document)'}`);
  console.log(`M2 (grapevine carries EACH rumor: >=half roster in 6d AND distortion>=2, on >=3/4 seeds): ${m2seeds.length}/4 [${m2seeds.join(',')}] — ${m2seeds.length >= 3 ? 'GO' : 'MISS — DOCUMENTED BLANK (rumors never reach the village)'}`);
  console.log(`M4 (guardrail alive>=5, not scattered): ${m4seeds.length}/4 [${m4seeds.join(',')}] — ${m4seeds.length >= 3 ? 'GO' : 'NO-GO'}`);
  console.log(`F1 (heard-less deed gossip: entries / ever gained a hearer): ${f1.map(x => `s${x.seed}:${x.entries}/${x.gained}`).join(' ')} — ${f1.every(x => x.gained === 0) ? 'H2 BLANK CONFIRMED (heard-less deed gossip never travels)' : 'some deed gossip traveled'}`);
  console.log(`F2 (trust honesty per rumor): ${f2.map(x => `s${x.seed}.${x.rumor}(${x.type}@${x.subject}): reach=${x.halfReach6d} dist=${x.distortion2} trust ${x.trust} caught=${x.caught}`).join(' | ')}`);
})();

function livingCountAt(r, day) {
  // living roster size near the rumor seed day: from gossipSnap entries'
  // heard counts is wrong; use the run's final alive + deaths after day.
  const deathsAfter = (r.deaths || []).filter(x => x.day > day).length;
  return (r.alive | 0) + deathsAfter;
}
