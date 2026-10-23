#!/usr/bin/env node
// journey-social-r44-20261023.js -- SOCIAL leg (leg 5), r44.
// PRE-REGISTERED in hidden_files/evidence/2026-10-23/journey-social-r44.md
// (r42 driver fork: + death-cause capture in the corpse sweep (cp.cause) +
//  tele-death-event cross-check + per-seed deathCauses aggregate). Leg
// questions: (1) does the 2-variant mootFriendVoice alternation kill the
// r43 echo finding? (2) can the corpse record + tele death events supply a
// death-cause census without beats mining?
// (written before this ran). Leg question: THE FRIENDSHIP EFFECT — do friends
// stand by friends at the moot? r38: NPC friendships form organically. r41:
// NPC-NPC moots convene naturally. Open: does pairAffinity move votes/verdicts
// in natural play, and is it ever VOICED (player trials get defendAlibi vouch
// lines; NPC trials' ceremony names no friend)?
// Bindings (a miss is NO-GO, never re-scored):
//   M1 instrument: bond+plot+case census complete on 4/4 runs (no gaps >2d);
//     per-moot capture: per-voter {vote, affinityWithAccused, affinityWithAccuser,
//     bondV/depth with accused}; playerVote recorded AT CAST TIME (r41 gap fix:
//     the convo-cast ballot links to the moot entry even when it doesn't exist yet).
//   M2 friendship moves verdicts: for each natural NPC-NPC moot with >=4 NPC
//     voters — (a) verdict-margin alignment: mean affinity(acquit-voters,accused)
//     > mean affinity(guilty-voters,accused); (b) counterfactual tallyVotes with
//     bonds zeroed vs maxed. GO = (a) on >=3/4 qualifying moots OR (b) flips
//     >=1 natural verdict. Miss = DOCUMENTED BLANK. Thin moots (<2 NPC-NPC):
//     the scripted mechanism probe (scripts/probe-friendship-effect-20261022.js)
//     carries M2 (9/9 green, DET byte-identical).
//   M3 people: >=3 sense-reads of trial scenes — friendship voiced or not;
//     player-trial vouch lines vs NPC-trial silence; 0 fabricated-history flags.
//   M4 guardrail: >=3/4 runs end with >=5 alive and the village not scattered.
//   L2' standing: verbatim content-beat repeats within one convo = finding.
//   F1 informational: affinity-term distribution across all natural votes
//     (|aff*0.4| vs |belief-clamped| vs |noise| — whisper or margin?).
//   F2 informational: does friendship shield against FALSE accusations
//     (fabricated cases)?
// Policy: warm-competent LAW-ABIDING (competent base; warm neighbor: donates,
// keeps promises, comforts; ZERO crimes — r41's substrate). 2 convos/day
// rotating the roster (deep, kind picks, gossip forcing GOSSIP_TARGET=3).
// Moot duty = VOTE ONLY, with-the-room; the driver NEVER convenes — natural
// ticks must (measurement purity, r41). TOOLING ONLY -- no game code changes.
// Usage: SEEDS=3801,3802,3803,3804 node scripts/journey-social-r42-20261022.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-23');
// TAG lets a second wave (e.g. a post-fix r42b confirmation) write its own
// files without clobbering the first wave. Default preserves the r42 pilot
// naming.
const TAG = (process.env.TAG || 'r44-pilot').replace(/[^a-z0-9-]/gi, '');
const TDIR = path.join(EVIDIR, `social-${TAG}-transcripts`);
const MDIR = path.join(EVIDIR, `social-${TAG}-moots`);
const SDIR = path.join(EVIDIR, `social-${TAG}-moots`);
for (const d of [EVIDIR, TDIR, MDIR, SDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 4005;
const SMOKE_DAYS = 10;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [4001, 4002, 4003, 4004]).filter(Number.isFinite);
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
// r41: with-the-room vote for an awaiting trial (mirrors mootDuty's direct vote).
function withRoomVote(Game, caseId) {
  let c = null; try { c = Game.getCase(caseId); } catch (e) {}
  const t = c && c.trial;
  const need = Math.floor((((t && t.present) || []).length + 1) / 2) + 1;
  const guiltySoFar = (t && (t.guiltySoFar || t.guilty)) || 0;
  return guiltySoFar >= need ? 'guilty' : 'acquit';
}

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
    // r41 MEASUREMENT PURITY: the driver NEVER convenes a moot (betrayal:moot:)
    // and never shelves a case dormant (betrayal:letlie:) — the village's
    // natural ticks must convene, or the M2 measurement is contaminated. A
    // warm player engages; "say nothing, watch your back" is not warm.
    choices = choices.filter(x => !/^betrayal:(moot|letlie):/.test(String((x && x.id) || '')));
    if (!choices.length) { out.naturalEnd = true; break; }
    // r41 VOTE PRIORITY: if a trial awaits the player's ballot and this convo
    // offers the vote, cast it with-the-room immediately (same as mootDuty's
    // direct vote — the ballot must not sit while the driver chats).
    {
      const vc = choices.find(x => x && /^betrayal:vote_(guilty|acquit):/.test(String(x.id || '')));
      if (vc) {
        const want = withRoomVote(Game, String(vc.id).split(':')[2]);
        const pickV = choices.find(x => x && String(x.id || '') === ('betrayal:vote_' + want + ':' + String(vc.id).split(':')[2])) || vc;
        out.playerVoteCast = (out.playerVoteCast || 0) + 1;
        // r42 (r41 instrument gap): record the ballot AT CAST TIME into the
        // run ledger — mootDuty links it to the moot entry even when the entry
        // doesn't exist yet at cast time. Record the ACTUAL cast choice
        // (pickV.id), not the intended `want` — the `|| vc` fallback can cast
        // the other ballot (seen on s3801 case_2: want=acquit, cast=guilty).
        try {
          const castM = /^betrayal:vote_(guilty|acquit):/.exec(String(pickV.id || ''));
          runState.playerVotes.push({ caseId: String(vc.id).split(':')[2], vote: castM ? castM[1] : want, day: safe(() => (Game.state.scholar || {}).day || 0, 0), via: 'convo' });
        } catch (e) {}
        try { Game.convoTurn(vid, pickV.id); } catch (e) { out.error = 'convoTurn(vote): ' + e.message; break; }
        out.turns++;
        noteThread();
        continue;
      }
    }
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
      // r38 deep: warm player — kind picks, gossip forcing until GOSSIP_TARGET
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
  const runState = { gossipPicks: 0, seed, playerVotes: [] }; // playerVotes: {caseId, vote, day, via}
  const moots = [];
  const bondSnap = [];        // r36: daily bond-map snapshots (deep count, avg v)
  const bondEvents = [];      // r36: bondAdd event log {day,a,b,dv,reason}
  const plotSnap = [];        // r41: daily plot census (the moot pipeline)
  const caseSnap = [];        // r41: daily case census (the moot pipeline)
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

  // r41 MOOT driver: warm-competent LAW-ABIDING does survival
  // (competent.daily — donates, keeps promises, comforts, ZERO crimes). This
  // layer adds: 2 convos/day rotating the roster (deep mode, gossip forcing,
  // kind picks), moot-vote duty, plot+case census + moot scene capture. No
  // rival pinning, no hostile picks, no broken promise, no defense layer, and
  // the driver NEVER convenes a moot — the natural ticks must (or the M2
  // measurement is contaminated).
  const talkedToday = new Set();
  function socialConvo() {
    const day = curDay();
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    for (let n = 0; n < 2; n++) {
      const pool = living.filter(id => !talkedToday.has(id));
      const arr = pool.length ? pool : living;
      const target = arr[(day * 7 + n * 5) % arr.length];
      if (!target || talkedToday.has(target)) continue;
      talkedToday.add(target);
      driveOne(Game, target, n === 0 ? 'moot-daily-1' : 'moot-daily-2', 'deep', convoLog, runState);
    }
  }
  // Reset the daily talk ledger at day rollover (pol.daily runs once per day).
  function resetTalkLedger() { talkedToday.clear(); }

  // r41 PLOT+CASE census: the moot pipeline. Daily per-plot state (armed /
  // sprung / resolved / expired; target player-vs-NPC) and per-case state
  // (accused, charge, source, playerRole, trial, verdict). This is the M1
  // instrument and the F1 pipeline census.
  function snapshotPlotsCases() {
    const d = curDay();
    const sid = me();
    try {
      const v = Game.state.village || {};
      const bs = v.betrayal || {};
      const plots = ((bs.plots) || []).map(pl => {
        if (!pl) return null;
        let targetIsPlayer = false;
        try { targetIsPlayer = Game.isPlayer(pl.target); } catch (e) {}
        return {
          id: pl.id, day: pl.day == null ? null : pl.day,
          leader: vname(Game, pl.leader), target: vname(Game, pl.target),
          targetIsPlayer, active: !!pl.active, sprung: !!pl.sprung,
          resolved: !!pl.resolved, expired: !!pl.expired,
        };
      }).filter(Boolean);
      const cases = ((bs.cases) || []).map(c => {
        if (!c) return null;
        let accusedIsPlayer = false;
        try { accusedIsPlayer = (c.accused || []).some(a => Game.isPlayer(a)); } catch (e) {}
        let targetIsPlayer = false;
        try { targetIsPlayer = Game.isPlayer(c.target); } catch (e) {}
        return {
          id: c.id, charge: c.charge || '?', day: c.day == null ? null : c.day,
          accused: (c.accused || []).map(a => vname(Game, a)).join(', ') || '?',
          accusedIsPlayer, target: c.target ? vname(Game, c.target) : null,
          targetIsPlayer, accuser: c.accuser ? vname(Game, c.accuser) : null,
          playerRole: c.playerRole || '?', fabricated: !!c.fabricated,
          source: c.plotId ? ('plot:' + c.plotId) : (c.fabricated ? 'fabricated' : (c.accuser ? 'accusation' : '?')),
          status: c.status || '?', hasTrial: !!c.trial,
          trialDay: (c.trial && c.trial.day != null) ? c.trial.day : null,
          resolution: c.resolution || null,
          convicted: c.trial ? !!c.trial.convicted : null,
        };
      }).filter(Boolean);
      plotSnap.push({ day: d, plots });
      caseSnap.push({ day: d, cases });
      // FREEZE WATCH: 3+ consecutive snapshots on the same scholar-day = the
      // day clock is stuck. Dump recent beats for diagnosis (pure read).
      const prev = plotSnap.length >= 2 ? plotSnap[plotSnap.length - 2].day : null;
      const prev2 = plotSnap.length >= 3 ? plotSnap[plotSnap.length - 3].day : null;
      if (prev === d && prev2 === d && !(runState.freezeDumpedDay || {})[d]) {
        runState.freezeDumpedDay = runState.freezeDumpedDay || {};
        runState.freezeDumpedDay[d] = true;
        const lines = [`# FREEZE — seed ${runState.seed} scholar-day ${d} stuck 3+ loop-days`,
          `# last 60 beats:`];
        for (const b of beatBuf.slice(-60)) lines.push(`[day ${b.day}] ${b.text.slice(0, 160)}`);
        fs.writeFileSync(path.join(EVIDIR, `freeze-${TAG}-s${runState.seed}-d${d}.txt`), lines.join('\n') + '\n');
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

  // r41 MOOT duty: VOTE ONLY. The driver NEVER convenes a moot — the natural
  // ticks (playerCaseTick, npcMootTick) must, or the M2 measurement is
  // contaminated. When a trial appears naturally, record it (convening path
  // classified from the announcement line) and vote with the room when the
  // player's ballot is awaited (player as juror/witness; the accused never
  // votes their own trial).
  // r42 affinity capture: per-voter friendship profile vs the accused.
  // M2(a) needs: vote, pairAffinity(voter, accused), pairAffinity(voter, accuser),
  // bond v/depth with the accused — captured at resolution (votes final).
  function affOf(a, b) { try { return Game.pairAffinity(a, b); } catch (e) { return null; } }
  function bondOf(a, b) { try { const x = Game.bondGet(a, b); return x ? { v: x.v || 0, depth: x.depth || 0 } : null; } catch (e) { return null; } }
  function captureAffinity(c, m) {
    const accusedVid = (c.accused || [])[0] || null;
    const accuserVid = c.accuser || null;
    const voters = ((c.trial && c.trial.votes) || []).map(v => {
      const bd = (accusedVid && v.vid) ? bondOf(v.vid, accusedVid) : null;
      return {
        vid: v.vid, name: vname(Game, v.vid), vote: v.vote, score: v.score,
        affAcc: (accusedVid && v.vid) ? affOf(v.vid, accusedVid) : null,
        affAccu: (accuserVid && v.vid) ? affOf(v.vid, accuserVid) : null,
        bondV: bd ? bd.v : null, bondDepth: bd ? bd.depth : null,
      };
    });
    m.affinity = voters;
    if (accusedVid) {
      const liv = livingIds();
      let deepNpc = 0, sumV = 0, nV = 0;
      for (const id of liv) {
        const bd = bondOf(id, accusedVid);
        if (!bd) continue;
        nV++; sumV += bd.v;
        if (bd.v >= 30 || bd.depth >= 1) deepNpc++;
      }
      m.accusedProfile = { vid: accusedVid, name: vname(Game, accusedVid), npcBondPairs: nV, deepNpcBonds: deepNpc, meanV: nV ? +(sumV / nV).toFixed(1) : 0 };
    }
    return m;
  }
  // r42 (r41 instrument gap): link every cast ballot (convo-cast or direct)
  // to the moot entry, even when the entry didn't exist at cast time.
  function linkPlayerVotes(m) {
    const hist = (runState.playerVotes || []).filter(x => String(x.caseId) === String(m.caseId));
    if (hist.length) { m.playerVoteHistory = hist; m.playerVote = hist[hist.length - 1].vote; }
    return m;
  }

  function mootDuty() {
    const sid = me();
    const cases = safe(() => ((Game.state.village || {}).betrayal || {}).cases || [], []);
    for (const c of cases) {
      if (!c) continue;
      let m = moots.find(x => x.caseId === c.id);
      if (c.trial && !m) {
        // a moot convened naturally — classify the path from the announcement.
        let conveneLine = null, convenePath = '?';
        try {
          for (let i = beatBuf.length - 1; i >= 0 && i > beatBuf.length - 400; i--) {
            const t = beatBuf[i].text;
            if (/tonight they call a moot/i.test(t)) { conveneLine = t; convenePath = 'npcMootTick'; break; }
            // repeat-aware convening variants (r41b): second/third feud returns
            // carry no "tonight they call a moot" — catch them explicitly.
            if (/back at the fires,? and the village doesn'?t need convincing/i.test(t) ||
                /doesn'?t wait to be called this time/i.test(t)) { conveneLine = t; convenePath = 'npcMootTick'; break; }
            if (/has gathered enough voices\. This is it/i.test(t)) { conveneLine = t; convenePath = 'playerCaseTick'; break; }
            if (!conveneLine && /stands accused/i.test(t)) conveneLine = t;
          }
        } catch (e) {}
        const accusedNames = (c.accused || []).map(a => vname(Game, a));
        m = { caseId: c.id, charge: c.charge || '?', day: curDay(), convenePath,
          conveneLine: conveneLine || '(none captured)',
          fabricated: !!c.fabricated,
          accuser: c.accuser ? vname(Game, c.accuser) : null,
          accused: accusedNames.join(', ') || '?',
          playerAccused: (c.accused || []).includes(sid),
          playerRole: c.playerRole || '?',
          source: c.plotId ? ('plot:' + c.plotId) : (c.fabricated ? 'fabricated' : (c.accuser ? 'accusation' : '?')) };
        linkPlayerVotes(m);
        moots.push(m);
      }
      if (c.trial && c.trial.awaitingPlayerVote && Game.castPlayerVote) {
        try {
          let vote;
          if ((c.accused || []).includes(sid)) {
            // the accused does NOT vote in their own trial
            // (betrayal.js:1615). No defense layer this run — skip.
            vote = null;
          } else {
            // NPC-NPC case: with the room (r35 pattern).
            const need = Math.floor(((c.trial.present || []).length + 1) / 2) + 1;
            const guiltySoFar = c.trial.guiltySoFar || c.trial.guilty || 0;
            vote = guiltySoFar >= need ? 1 : 0;
          }
          if (vote != null) {
            Game.castPlayerVote(c.id, vote);
            try { runState.playerVotes.push({ caseId: c.id, vote: vote ? 'guilty' : 'acquit', day: curDay(), via: 'mootDuty' }); } catch (e) {}
            let mm2 = moots.find(x => x.caseId === c.id);
            if (mm2) { linkPlayerVotes(mm2); }
          }
        } catch (e) {}
      }
      const mm = moots.find(x => x.caseId === c.id);
      if (mm) linkPlayerVotes(mm);
      if (mm && !mm.resolution) {
        mm.resolution = c.resolution || null;
        mm.trialDay = c.trial ? (c.trial.day || null) : null;
        mm.convicted = c.trial ? !!c.trial.convicted : null;
        mm.votes = c.trial && c.trial.votes ? c.trial.votes.map(v => ({ name: vname(Game, v.vid), vote: v.vote })) : null;
        if (c.resolution) captureAffinity(c, mm);
        if (c.resolution && !mm.file) {
          const D = mm.trialDay != null ? mm.trialDay : mm.day;
          const lines = [];
          lines.push(`MOOT r42 — seed ${seed} / ${policyId} — trial day ${D} (convened day ${mm.day}, path ${mm.convenePath})`);
          lines.push(`case: ${mm.caseId} — charge: ${mm.charge} — source: ${mm.source}${mm.fabricated ? ' (FABRICATED)' : ''}`);
          lines.push(`accuser: ${mm.accuser || '?'} — accused: ${mm.accused}`);
          if (mm.accusedProfile) lines.push(`accused friendship profile: ${mm.accusedProfile.deepNpcBonds} deep NPC bonds of ${mm.accusedProfile.npcBondPairs} pairs, mean warmth ${mm.accusedProfile.meanV}`);
          lines.push(`player role: ${mm.playerRole} — player vote: ${mm.playerVote || 'n/a'}${mm.playerVoteHistory ? ' (history: ' + mm.playerVoteHistory.map(h => h.vote + '@d' + h.day + '/' + h.via).join(', ') + ')' : ''}`);
          lines.push(`convening line: ${mm.conveneLine}`);
          lines.push(`verdict: ${mm.resolution}${mm.convicted != null ? ` (convicted=${mm.convicted})` : ''}`);
          if (mm.affinity && mm.affinity.length) {
            const g = mm.affinity.filter(v => v.vote === 'guilty'), a = mm.affinity.filter(v => v.vote === 'acquit');
            const mean = (xs, f) => { const q = xs.map(f).filter(x => x != null); return q.length ? (q.reduce((s, x) => s + x, 0) / q.length).toFixed(1) : 'n/a'; };
            lines.push(`NPC votes (${mm.affinity.length}): guilty=${g.length} [${g.map(v => v.name).join(', ')}] meanAffAcc=${mean(g, v => v.affAcc)} | acquit=${a.length} [${a.map(v => v.name).join(', ')}] meanAffAcc=${mean(a, v => v.affAcc)}`);
            lines.push('--- per-voter friendship (affAcc=affinity with accused, affAccu=with accuser, bondV/depth with accused) ---');
            for (const v of mm.affinity) lines.push(`  ${v.vote === 'guilty' ? 'GUILTY' : 'acquit '} ${v.name}: affAcc=${v.affAcc} affAccu=${v.affAccu} bondV=${v.bondV} bondDepth=${v.bondDepth} score=${v.score}`);
          } else if (mm.votes && mm.votes.length) {
            const g = mm.votes.filter(v => v.vote === 'guilty'), a = mm.votes.filter(v => v.vote === 'acquit');
            lines.push(`NPC votes (${mm.votes.length}): guilty=${g.length} [${g.map(v => v.name).join(', ')}] | acquit=${a.length} [${a.map(v => v.name).join(', ')}]`);
          }
          lines.push('--- beat stream (moot/friendship-keyword lines +/- 4 context, days ' + (D - 1) + '..' + (D + 8) + ') ---');
          const pool = beatBuf.filter(b => b.day >= D - 1 && b.day <= D + 8);
          const KEY = /moot|trial|verdict|guilty|acquit|exile|sentence|accus|friend|stood by|stands with|vouch|backed them|known .* for years/i;
          const keep = new Set();
          pool.forEach((b, i) => { if (KEY.test(b.text)) for (let j = Math.max(0, i - 4); j <= Math.min(pool.length - 1, i + 4); j++) keep.add(j); });
          if (!keep.size) lines.push(`(no keyword lines in stream; ${pool.length} lines in window)`);
          else for (const i of [...keep].sort((a, b) => a - b)) lines.push(`[day ${pool[i].day}] ${pool[i].text}`);
          const fn = `s${seed}-moot-${mm.caseId}.txt`;
          fs.writeFileSync(path.join(MDIR, fn), lines.join('\n') + '\n');
          mm.file = fn;
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
      socialConvo();
      if (gossipForce !== false) mootDuty();
      try { snapshotPlotsCases(); } catch (e) {}
      try { snapshotBonds(); } catch (e) {}
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay(), cause: cp.cause || 'unknown' });
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

  // r42 instrument self-check: the affinity-capture helpers need these live.
  const instrumentOk = (typeof Game.pairAffinity === 'function') && (typeof Game.bondGet === 'function') && (typeof Game.bondKey === 'function');
  // r44 DEATH LEDGER: death-cause census — the corpse record carries
  // cp.cause (registerDeath hook); the tele 'death' events carry
  // {who, cause, wave, player}. Both are descriptive, not behavioral.
  const deathCauses = {};
  for (const d of deaths) { const k = String(d.cause || 'unknown'); deathCauses[k] = (deathCauses[k] || 0) + 1; }
  const teleDeaths = safe(() => (Game.state.telemetry || []).filter(t => t.type === 'death'), [])
    .map(t => ({ who: t.who, cause: t.cause || 'unknown', wave: t.wave, player: !!t.player, day: t.day }));
  return {
    seed, days: curDay(), deaths, deathCauses, teleDeaths, alive: livingIds().length, instrumentOk,
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
    moots: moots.map(m => ({ caseId: m.caseId, charge: m.charge, source: m.source || null, fabricated: !!m.fabricated, convenedDay: m.day, convenePath: m.convenePath || null, conveneLine: m.conveneLine || null, trialDay: m.trialDay || null, playerVote: m.playerVote || null, playerVoteHistory: m.playerVoteHistory || null, verdict: m.resolution || null, convicted: m.convicted != null ? m.convicted : null, file: m.file || null, playerAccused: !!m.playerAccused, playerRole: m.playerRole || null, accuser: m.accuser || null, accused: m.accused || null, accusedProfile: m.accusedProfile || null, affinity: (m.affinity || []).map(v => ({ name: v.name, vote: v.vote, affAcc: v.affAcc, affAccu: v.affAccu, bondV: v.bondV, bondDepth: v.bondDepth, score: v.score })) })),
    conflicts: null,       // r33 field retired
    plotEvents: null,     // r33 field retired
    bondSnap,             // r35: daily {day, pairs, deepCount, avgV} + r38 NPC-NPC edges
    bondEventsCount: bondEvents.length,
    meName: vname(Game, me()),
    bondChannels,         // r36: reason -> {sum, n}
    firstDeep,            // r36: pairKey -> {day, a, b, v, depth, bothNpc}
    plotSnap,             // r41: daily plot census
    caseSnap,             // r41: daily case census
    mootConvos: convoLog.filter(o => /^moot-daily/.test(o.tag || '')).length,
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
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test: plot+case census + warm-competent convos)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, mode: 'journey-social-r44-pilot', policyId: 'journey-social-r44-smoke', gossipForce: false });
  const sPSnaps = (smoke.plotSnap || []).length;
  const sCSnaps = (smoke.caseSnap || []).length;
  console.log(`SMOKE: plotSnaps=${sPSnaps} caseSnaps=${sCSnaps} convos=${smoke.convos} mootConvos=${smoke.mootConvos} avgTrust=${smoke.l3.avgTrust} instrumentOk=${smoke.instrumentOk}`);
  const selfTest = sPSnaps >= 8 && sCSnaps >= 8 && smoke.convos > 0 && (smoke.mootConvos | 0) > 0 && smoke.instrumentOk;
  console.log(`SMOKE SELF-TEST: ${selfTest ? 'PASS (plot+case census complete, warm-competent convos ran, affinity instrument live)' : 'FAIL (census instrumentation broken — investigate before full seeds)'}`);
  if (!selfTest) { console.log('ABORT: census instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, mode: 'journey-social-r44-pilot', policyId: 'journey-social-r44-pilot', gossipForce: true });
      const convoLog = r._convoLog; delete r._convoLog;
      fs.writeFileSync(path.join(EVIDIR, `journey-social-${TAG}-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r41 MOOT SUMMARY: the pipeline census — plots, cases, moots.
      {
        const lines = [`# THE FRIENDSHIP EFFECT — seed ${s} (warm-competent law-abiding, ${r.days}d, ${r.alive} alive)`, ''];
        const plotsAll = [];
        for (const x of (r.plotSnap || [])) for (const pl of (x.plots || [])) {
          if (!plotsAll.some(q => q.id === pl.id)) plotsAll.push(pl);
        }
        const casesAll = [];
        for (const x of (r.caseSnap || [])) for (const c of (x.cases || [])) {
          if (!casesAll.some(q => q.id === c.id)) casesAll.push(c);
        }
        lines.push(`## plots (${plotsAll.length})`);
        for (const pl of plotsAll) lines.push(`  ${pl.id}: ${pl.leader} -> ${pl.target}${pl.targetIsPlayer ? ' (PLAYER)' : ''} d${pl.day} active=${pl.active} sprung=${pl.sprung} resolved=${pl.resolved} expired=${pl.expired}`);
        lines.push('', `## cases (${casesAll.length})`);
        for (const c of casesAll) lines.push(`  ${c.id}: ${c.charge} — accused ${c.accused}${c.accusedIsPlayer ? ' (PLAYER)' : ''} — target ${c.target || '?'} — source ${c.source} — role ${c.playerRole} — trial ${c.hasTrial ? 'd' + c.trialDay : 'never'} — verdict ${c.resolution || 'none'}`);
        lines.push('', `## moots observed (${(r.moots || []).length})`);
        for (const m of (r.moots || [])) {
          const aff = m.affinity || [];
          const g = aff.filter(v => v.vote === 'guilty'), a = aff.filter(v => v.vote === 'acquit');
          const mean = (xs) => { const q = xs.map(v => v.affAcc).filter(x => x != null); return q.length ? (q.reduce((t, x) => t + x, 0) / q.length).toFixed(1) : 'n/a'; };
          const align = (g.length && a.length) ? (parseFloat(mean(a)) > parseFloat(mean(g)) ? 'ALIGNED (acquit-voters warmer)' : 'MISALIGNED') : 'n/a';
          lines.push(`  ${m.caseId}: ${m.charge} via ${m.convenePath} d${m.convenedDay} — accused ${m.accused}${m.fabricated ? ' (FABRICATED)' : ''} — vote ${m.playerVote || 'n/a'} — verdict ${m.verdict || 'none'}${m.convicted != null ? ' convicted=' + m.convicted : ''} — affinity: guilty-mean ${mean(g)} / acquit-mean ${mean(a)} [${align}]`);
        }
        lines.push('', '## NPC<->NPC bond edges (from bondSnap d0/70/140)');
        for (const d of [0, 70, 140]) {
          const b = (r.bondSnap || []).filter(x => x.day <= d).slice(-1)[0];
          if (b) lines.push(`  d${b.day}: npcPairs=${b.npcPairs} npcDeep=${b.npcDeep} npcAvgV=${b.npcAvgV} (allPairs=${b.pairs} allDeep=${b.deepCount})`);
        }
        fs.writeFileSync(path.join(SDIR, `s${s}-moot-summary.txt`), lines.join('\n') + '\n');
      }
      // r41 M3 sense-read set: moot-adjacent convos (accused/accuser/target),
      // gossip, late deep, L2' repros.
      const mootNames = new Set();
      for (const m of (r.moots || [])) {
        for (const nm of String(m.accused || '').split(/,\s*/)) if (nm) mootNames.add(nm);
        if (m.accuser) mootNames.add(m.accuser);
      }
      convoLog.filter(o => mootNames.has(o.name) && o.turns >= 4).slice(0, 3).forEach((o, i) => {
        fs.writeFileSync(path.join(TDIR, `s${s}-mootparty-${i + 1}-${sname(o)}.txt`),
          [`# MOOT-PARTY sense-read — seed ${s} day ${o.day}, ${o.name} (mode ${o.mode}, tag ${o.tag}, turns ${o.turns}, mood at start: ${o.moodAtStart})`,
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
      const plotsN = (() => { const ids = new Set(); for (const x of (r.plotSnap || [])) for (const pl of (x.plots || [])) ids.add(pl.id); return ids.size; })();
      const casesN = (() => { const ids = new Set(); for (const x of (r.caseSnap || [])) for (const c of (x.cases || [])) ids.add(c.id); return ids.size; })();
      const mootsN = (r.moots || []).length;
      const npcMoots = (r.moots || []).filter(m => !m.playerAccused).length;
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} (moot=${r.mootConvos}) gossipPicks=${r.gossipPicks} dryRate=${r.dryRate}/12`);
      console.log(`  pipeline: plots=${plotsN} cases=${casesN} moots=${mootsN} (npc-npc=${npcMoots})`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      for (const h of r.l2prime.repeats.slice(0, 6)) console.log(`    d${h.day} ${h.name} t${h.turn} <${h.pickId}>: ${h.line}`);
      console.log(`  L3: ${JSON.stringify(r.l3)}`);
      console.log(`  regression: P1-streaks=${r.p1carry.streaks} P2-reactDry=${r.p2carry.reactDry}`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  // r42 verdicts — THE FRIENDSHIP EFFECT
  let m1gaps = 0;
  const m2align = [];       // M2(a): qualifying NPC-NPC moots with aligned verdict margins
  const m2qual = [];        // M2(a): qualifying NPC-NPC moots (>=4 NPC voters)
  const m4seeds = [];       // alive >= 5 at end, village not scattered
  const f1terms = [];       // F1: |affAcc*0.4| distribution across all natural votes
  const f2fab = [];         // F2: fabricated cases — did friendship shield?
  const m2pipeline = [];    // moot counts per seed (M2 thinness check)
  for (const r of results) {
    const snaps = r.plotSnap || [];
    const days = [...new Set(snaps.map(c => c.day))].sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < days.length; i++) maxGap = Math.max(maxGap, days[i] - days[i - 1]);
    if (maxGap > 2) { console.log(`  seed ${r.seed}: M1 INSTRUMENT GAP (max plot-snapshot gap ${maxGap}d)`); m1gaps++; }
    const bsnap = r.bondSnap || [];
    const bdays = [...new Set(bsnap.map(c => c.day))].sort((a, b) => a - b);
    let bmaxGap = 0;
    for (let i = 1; i < bdays.length; i++) bmaxGap = Math.max(bmaxGap, bdays[i] - bdays[i - 1]);
    if (bmaxGap > 2) { console.log(`  seed ${r.seed}: M1 INSTRUMENT GAP (max bond-snapshot gap ${bmaxGap}d)`); m1gaps++; }
    const moots = (r.moots || []).filter(m => !m.playerAccused);
    m2pipeline.push({ seed: r.seed, npcMoots: moots.length });
    for (const m of moots) {
      const aff = m.affinity || [];
      for (const v of aff) if (v.affAcc != null) f1terms.push(Math.abs(v.affAcc * 0.4));
      if (m.fabricated) f2fab.push({ seed: r.seed, caseId: m.caseId, verdict: m.verdict || 'none', deepBonds: (m.accusedProfile || {}).deepNpcBonds, meanV: (m.accusedProfile || {}).meanV });
      if (aff.length >= 4) {
        m2qual.push({ seed: r.seed, caseId: m.caseId });
        const g = aff.filter(v => v.vote === 'guilty'), a = aff.filter(v => v.vote === 'acquit');
        const mean = (xs) => { const q = xs.map(v => v.affAcc).filter(x => x != null); return q.length ? q.reduce((t, x) => t + x, 0) / q.length : null; };
        const mg = mean(g), ma = mean(a);
        const aligned = (mg != null && ma != null) ? (ma > mg) : null;
        if (aligned) m2align.push({ seed: r.seed, caseId: m.caseId });
        console.log(`  seed ${r.seed} moot ${m.caseId}: voters=${aff.length} guilty-meanAff=${mg == null ? 'n/a' : mg.toFixed(1)} acquit-meanAff=${ma == null ? 'n/a' : ma.toFixed(1)} verdict=${m.verdict || 'none'} -> ${aligned == null ? 'UNDECIDED' : (aligned ? 'ALIGNED' : 'MISALIGNED')}`);
      } else {
        console.log(`  seed ${r.seed} moot ${m.caseId}: only ${aff.length} NPC voters (<4, not qualifying) verdict=${m.verdict || 'none'}`);
      }
    }
    if ((r.alive | 0) >= 5 && !(r.endState || {}).scattered) m4seeds.push(r.seed);
    console.log(`  seed ${r.seed}: days=${r.days} alive=${r.alive} avgTrust=${r.l3.avgTrust} deepBonds=${r.l3.deepBonds} end=${JSON.stringify(r.endState)}`);
  }
  const f1felt = f1terms.filter(t => t >= 5).length;
  console.log(`M1 (plot+case+bond census complete, no gaps >2d): ${m1gaps ? 'MISS (' + m1gaps + ' seeds)' : 'GO'}`);
  console.log(`M2(a) (verdict-margin alignment on >=3/4 qualifying NPC-NPC moots): ${m2align.length}/${m2qual.length} [${m2align.map(x => x.caseId).join(',')}] — ${m2qual.length >= 2 ? (m2align.length >= 3 && m2align.length / m2qual.length >= 0.75 ? 'GO' : (m2qual.length < 4 ? 'THIN — probe carries' : 'MISS — DOCUMENTED BLANK')) : 'TOO THIN (<2 qualifying moots) — mechanism probe carries M2'}`);
  console.log(`M2 pipeline: ${m2pipeline.map(x => 's' + x.seed + ':' + x.npcMoots).join(' ')} NPC-NPC moots`);
  console.log(`M4 (guardrail alive>=5, not scattered): ${m4seeds.length}/4 [${m4seeds.join(',')}] — ${m4seeds.length >= 3 ? 'GO' : 'NO-GO'}`);
  console.log(`F1 (affinity-term |aff*0.4| across ${f1terms.length} natural votes): felt(>=5)=${f1felt} (${f1terms.length ? (100 * f1felt / f1terms.length).toFixed(0) : 0}%), max=${f1terms.length ? Math.max(...f1terms).toFixed(1) : 'n/a'}, median=${f1terms.length ? f1terms.slice().sort((a, b) => a - b)[Math.floor(f1terms.length / 2)].toFixed(1) : 'n/a'}`);
  console.log(`F2 (fabricated cases): ${f2fab.length ? f2fab.map(x => 's' + x.seed + ':' + x.caseId + '=' + x.verdict + ' (deepBonds=' + x.deepBonds + ' meanV=' + x.meanV + ')').join(' ') : '(none)'}`);
})();
