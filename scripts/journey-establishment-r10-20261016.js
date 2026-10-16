#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R10 — FIGHT QUALITY + THE PILOT EPISODE.
//
// Pre-registered (docs/MEASUREMENT.md §§9-12, 14 — written BEFORE any run; see
//   hidden_files/evidence/2026-10-16/journey-establishment-r10-note.md):
//   Question: in days 14-40, when wave-1 monsters meet the village/player,
//     are fights REAL — multi-round blow-by-blow with player decisions and
//     villager participation? When the show's pilot episode airs, is it a
//     PLAYED SHOW (warning->countdown->grab->played phases->verdict->
//     audience reaction) or does it resolve silently? Do villagers act like
//     people around both?
//   Interesting: a BLANK — a fight with zero player decisions; a monster
//     corpse nobody can loot; a contest choice with no consequence; a pilot
//     that airs as one line; villagers ignoring a taken comrade; a show with
//     no audience beat. The famine question is SETTLED (r7: HOLDS); this run
//     guards it, not re-litigates.
//   Seeds: 61, 82, 103 (pilot gate; 124 only if something needs a bigger n).
//   Horizon: 40 game-days; death-aware stop (+10d tail max).
//   Policy: competent, PINNED — identical knobs to r7 (FATSEEK=1,
//     RENDER_LADDER=1, INVITE_PARTY=1, FAVOR_ACCEPT=1, STALL_BREAK=1).
//   Binding metrics:
//     F1 fights real: >=60% of monster fights in days 14-40 last >=3 rounds
//       AND involve >=2 distinct player decision types (strike/wait/flee/
//       shout/offer/move).
//     F2 pilot is a show: pilot episode >=30 narrative lines; warning->
//       countdown->grab beats; >=1 player choice with a consequence; an
//       audience/verdict beat. Full pilot log sense-read.
//     F3 people: >=8 full transcripts sense-read across the pilot, 0
//       senseless flags.
//     Guardrails: 0 starvation deaths (famine holds); pantry unit atom
//       <=500 kcal (E4 parity with r7).
//   Canon read: CANON.md; CONTESTS.md (pilot episode, played-not-RNG, fear
//     design); MONSTER-WAVES.md (wave-1 animal shock); CONVERSATIONS.md
//     (people check); PRESERVATION.md (loot/butchering honesty); DIRECTIVES.md
//     (decisions not chores; feel over math). No new canon.
//   r10 instruments: per-fight records (rounds, player decision verbs,
//     villager fighters, outcome, deaths, narration slice -> per-fight log
//     files); per-contest records (phase transitions via activeContest watch,
//     choice log via contestChoose wrap, narration slice -> per-contest log
//     files); pilot-episode special stash; corpse loot audit (lootCorpse wrap
//     + end-of-day corpse census). Famine instruments inherited as guardrails.
//   r7 provenance retained (wrapStream, genDetail fix, startCombat fold).
//
// Usage: node scripts/journey-establishment-r10-20261016.js
//        SEEDS=61,82 DAYS=40 node scripts/journey-establishment-r10-20261016.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103]);
const DAYS = parseInt(process.env.DAYS || '40', 10);
const FAVOR_ACCEPT = process.env.FAVOR_ACCEPT !== '0'; // r10 proved the machinery; keep it on
const INVITE_PARTY = process.env.INVITE_PARTY !== '0'; // r1: exercise party formation (0 joins in pilot)
const CONVO_EVERY = 6; // full transcripts every 6 game-days (5 per seed)
const RENDER_LADDER = process.env.RENDER_LADDER !== '0'; // r3: exercise the render->pemmican ladder
const STALL_BREAK = process.env.STALL_BREAK !== '0'; // r3: human-like picker — stop deepening a stalled want
const FATSEEK = process.env.FATSEEK !== '0'; // r5: fat-supply probe — ruin book detours + handbook read + pit craft + opportunistic fatbearer hunts

// ---- text-stream capture (loadGame silences Game.say; we keep the silence) ----
let capture = [];
let _lastArmText = null;
let _spamRun = 0; // feasted per-strike lines since last fight start
function feastScan(line) {
  const s = String(line || '');
  if (FEAST_ARM_RE.test(s)) {
    MET.armMessages++;
    if (_lastArmText !== null && s === _lastArmText) MET.armVerbatimRepeats++;
    _lastArmText = s;
  }
  if (FEAST_SPAM_RE.test(s)) { MET.feastedSpamLines++; _spamRun++; }
  if (FEAST_DRAW_RE.test(s)) MET.feastDraws++;
  if (VILLAGER_FEAST_PUSH_RE.test(s)) MET.villagerFeastPush++;
}
function cap(line) {
  if (line == null) return;
  const s = String(line);
  feastScan(s);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  // r9: favor kept/broken narration (game.js promise resolution lines)
  // r10: also stash the lines so the evidence note can quote them
  if (/You kept your word/i.test(s)) { MET.favorKept++; (MET.keptLines = MET.keptLines || []).push(s.slice(0, 220)); }
  if (/Promises rot/i.test(s)) { MET.favorBroken++; (MET.brokenLines = MET.brokenLines || []).push(s.slice(0, 220)); }
  // r1 establishment: preservation ladder events + contest/party machinery
  if (/smoke/i.test(s) && /rack|preserv|smok/i.test(s)) MET.preserveSmokeLines++;
  if (/render(ed)? fat|tallow/i.test(s)) MET.preserveRenderLines++;
  if (/pemmican/i.test(s)) MET.preservePemmicanLines++;
  // r3: hard event counts for the ladder (line-level, not just mentions)
  let m;
  if ((m = /Rendered (\d+) batch/i.exec(s))) MET.renderBatches = (MET.renderBatches || 0) + parseInt(m[1], 10);
  if ((m = /(\d+) bars? of pemmican/i.exec(s))) MET.pemmicanBars = (MET.pemmicanBars || 0) + parseInt(m[1], 10);
  if (/slabs of raw fat/i.test(s)) MET.rawFatSlabs = (MET.rawFatSlabs || 0) + (((m = /(\d+) slabs of raw fat/i.exec(s))) ? parseInt(m[1], 10) : 1);
  // r7: legibility trail for famine cascades (E2) — warning lines that let a
  // competent player see a famine coming, before starvation deaths land.
  if (/famish|starv(ing|ation)|going hungry|pantry (is|runs?|running) (nearly |almost )?(empty|low|out)|nothing to eat|eat our stores|food (is |grows? |gets? )scarce|rations? (are |grow )tight|belly empt|stomachs? (are )?empt|thin(ner|ning) harvest/i.test(s)) {
    MET.foodWarnings = (MET.foodWarnings || 0) + 1;
    (MET.foodWarningLines = MET.foodWarningLines || []).push(s.slice(0, 200));
    if (MET.foodWarningLines.length > 40) MET.foodWarningLines.length = 40; // stash cap
  }
  if (/Learned: render/i.test(s) || /Learned: Rendering/i.test(s)) MET.renderLearned = (MET.renderLearned || 0) + 1;
  if (/PILOT EPISODE|pilot is LIVE/i.test(s)) { MET.pilotAired = (MET.pilotAired || 0) + 1; }
  if (/AUDIENCE EXPANSION! Your party cap is now/i.test(s)) { MET.partyCapBumps = (MET.partyCapBumps || 0) + 1; }
  if (/joins your party|invited to the party|joins the party/i.test(s)) { MET.partyJoins = (MET.partyJoins || 0) + 1; }
  // r2 trapline: trap/set/catch/teach narration (player + NPC)
  if (/🪤/.test(s)) MET.trapEmojiLines++;
  if (/snare/i.test(s)) MET.snareLines++;
  if (/caught a |TRAP: Your .* caught|put it down today/.test(s) && /🪤|🔥/.test(s)) MET.trapCatchLines++;
  if (/is back from the snares|Snares were empty|snare line needs mending/i.test(s)) MET.trapEmptyLines++;
  if (/showing .* the snare|walk someone through the snare|taught .* the snare|see the shape of it/i.test(s)) MET.snareTeachLines++;
  if (/Your hands don't know it yet\. Your eyes do|finally see the shape of it/i.test(s)) MET.snareOverhearLines++;
  if (/put it down today/.test(s)) MET.killerTaleLines++;
  if (/crafted a |you craft |made a snare/i.test(s)) MET.trapCraftLines++;
}

// ---- sense metrics ----
const MET = {
  sittings: 0, reofferFlags: 0, npcQuestions: 0,
  wants: {},
  justSaid: 0, maras: 0,
  commaStutter: 0, punctStutter: 0,
  lureOffered: 0, lureSpoken: 0, lureGesture: 0, lureSilent: 0,
  foodWarnings: 0,
  declineTaken: 0, declineHonest: 0, declineDry: 0,
  thirdPersonFavorHead: 0,
  fabricHistoryFlags: 0,
  verbatimRepeats: 0,
  abilitiesChosen: 0,
  forageTrips: 0, trapsCrafted: 0, trapsSet: 0, trapsWireSet: 0,
  cleanedCarcasses: 0, knappedKnives: 0,
  beastTricks: 0, fledBad: 0, fled: 0,
  aidOfferAccepted: 0, aidGivenKcal: 0, aidRefused: 0, looted: 0,
  fightsSeen: 0,
  timeFreezeCleared: 0,
  // r8 feast-chain telemetry
  devotionChannels: 0, sentimentTaughtDay: null,
  armMessages: 0, armVerbatimRepeats: 0,
  feastsHosted: 0, armedFeasts: 0, unarmedFeasts: 0,
  feastedSpamLines: 0, feastedSpamFights: 0, feastedSpamMaxPerFight: 0,
  feastDraws: 0, feastedCombatUses: 0,
  villagerFeastPush: 0,
  starvationDeaths: 0,
  // r9 gossip/information telemetry
  gossipAsks: 0, gossipRenders: 0, gossipNoNews: 0,
  rumorPlanted: 0, tellbeastAsks: 0, namebeastAsks: 0,
  favorPromised: 0, favorKept: 0, favorBroken: 0, favorAccepted: 0,
  // r1 establishment: preservation ladder, contests, party
  preserveSmokeLines: 0, preserveRenderLines: 0, preservePemmicanLines: 0,
  pilotAired: 0, partyCapBumps: 0, partyJoins: 0,
  contestLines: 0,
  // r2 trapline: every trap-related beat the narration emits
  trapEmojiLines: 0, snareLines: 0, trapSetLines: 0, trapCatchLines: 0,
  trapCraftLines: 0, snareTeachLines: 0, snareOverhearLines: 0,
  killerTaleLines: 0, trapEmptyLines: 0,
};
function bump(obj, k) { obj[k] = (obj[k] || 0) + 1; }
const FEAST_ARM_RE = /Your gifts are not mastered — but they are lived-in/i;
const FEAST_SPAM_RE = /^FEASTED ×[\d.]+: the feast was the weapon\.$/;
const FEAST_DRAW_RE = /followed the feast here|The .* is circling the edge of the light/i;
const VILLAGER_FEAST_PUSH_RE = /should (host|throw|have) a feast|feast (tonight|soon)|let'?s (host|throw|have) a feast/i;

// comma-closer stutter; punct: ?! doubles / 4+ dots (literary "..." allowed)
const COMMA_STUTTER_RE = /[.!?]["\u201d]?\s*,/;
const PUNCT_STUTTER_RE = /([!?])\1|\.{4,}/;
const LURE_RE = /walk with me|haul something|get air|come see what i found|trap line|extra hands|another pair of eyes/i;
const GESTURE_RE = /\(.*(mime|mimes|gesture|gestures|points? at|toward the|unmistakable).*\)/is;
// r5 fix alternates (declineLine pool) — acknowledging lines
const DECLINE_ACK_RE = /another time|rain check|suit yourself|fair enough/i;
const DECLINE_DRY_RE = /lost my train of thought/i;
// establishment r4 fix: third-person favor heads spoken by the asker
const THIRDPERSON_FAVOR_RE = /about their injury|about their sickness|the food they needed|the sickness they are fighting|their injury — still need/i;
// succession r5 fix: hardcoded people-count lies
const COUNT_LIE_RE = /\b(twelve|eleven|ten|nine|eight|seven) (people|villagers)\b/i;

function senseCheckThem(line) {
  const s = String(line || '');
  if (/I just said/i.test(s)) { MET.justSaid++; return '!! FALLBACK "I just said" fired'; }
  if (/Mara/.test(s)) { MET.maras++; return '!! PHANTOM "Mara"'; }
  if (COMMA_STUTTER_RE.test(s)) { MET.commaStutter++; return '!! COMMA-CLOSER STUTTER: ' + s.slice(0, 120); }
  if (PUNCT_STUTTER_RE.test(s) && !/^\.*$/.test(s)) { MET.punctStutter++; return '!! PUNCT STUTTER: ' + s.slice(0, 120); }
  if (THIRDPERSON_FAVOR_RE.test(s)) { MET.thirdPersonFavorHead++; return '!! THIRD-PERSON FAVOR HEAD: ' + s.slice(0, 120); }
  return null;
}


// ---- r10: fight + contest quality instruments ----
const FIGHTS = [];       // finalized per-fight records (reset per seed in runSeed)
let openFight = null;
const CONTESTS = [];     // finalized per-contest records (reset per seed)
let openContest = null;
let _r10seed = null;
const R10EV = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-16/';
function r10fname(tag, n) { return R10EV + `journey-establishment-r10-${tag}-${_r10seed}-${n}.txt`; }
function r10deathsSince(mark) {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death').slice(mark).map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })); }
  catch (e) { return []; }
}
function r10deathMark() {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death').length; }
  catch (e) { return 0; }
}
function r10writeFight(rec) {
  try {
    const fp = r10fname('fight', rec.day + '-' + rec.n);
    const L = [];
    L.push(`=== seed ${_r10seed} day ${rec.day} fight #${rec.n}: ${rec.monsterName} (${rec.monsterId})${rec.arena ? ' [ARENA]' : ''} ===`);
    L.push(`rounds=${rec.rounds} decisions=${JSON.stringify(rec.decisions)} distinctVerbs=${rec.distinctVerbs}`);
    L.push(`villagerFighters=[${(rec.villagerFighters || []).join(', ') || 'none'}]`);
    L.push(`playerInFight=${!!rec.playerInFight} outcome=${rec.outcome} playerHpEnd=${rec.playerHpEnd} fled=${!!rec.fled}`);
    L.push(`deaths=${JSON.stringify(rec.deaths)}`);
    L.push(`corpseLooted=${rec.corpseLooted}`);
    L.push('--- narration ---');
    L.push((rec.lines || []).join('\n'));
    fs.writeFileSync(fp, L.join('\n'));
    rec.logFile = fp;
  } catch (e) { console.log('r10writeFight ERROR: ' + (e && e.message)); }
}
function closeFight(why) {
  if (!openFight) return;
  const rec = openFight; openFight = null;
  rec.deaths = r10deathsSince(rec.deathMark);
  rec.distinctVerbs = Object.keys(rec.decisions).filter(k => (rec.decisions[k] || 0) > 0).length;
  if (rec.endIdx == null) rec.endIdx = capture.length;
  rec.lines = capture.slice(rec.startIdx, rec.endIdx);
  rec.outcome = why || 'unknown';
  try { rec.playerHpEnd = Math.round((Game.state.scholar && Game.state.scholar.health) || 0); } catch (e) {}
  try {
    const corpses = (Game.corpses ? Game.corpses() : []) || [];
    const mine = corpses.filter(c => c && c.kind === 'monster' && (c.dayDied === rec.day || c.day === rec.day));
    rec.corpseLooted = mine.length ? mine.some(c => !!c.looted) : null;
  } catch (e) { rec.corpseLooted = 'err'; }
  rec.n = FIGHTS.length + 1;
  FIGHTS.push(rec);
  r10writeFight(rec);
  console.log(`*** FIGHT #${rec.n} day ${rec.day}: ${rec.monsterName} rounds=${rec.rounds} verbs=${rec.distinctVerbs} (${Object.keys(rec.decisions).join(',')}) vills=[${(rec.villagerFighters || []).join(',') || 'none'}] outcome=${rec.outcome}`);
}
function r10writeContest(rec) {
  try {
    const fp = r10fname('contest', rec.day + '-' + rec.n);
    const L = [];
    L.push(`=== seed ${_r10seed} day ${rec.day} contest #${rec.n}: ${rec.name} (${rec.id})${rec.pilot ? ' [PILOT EPISODE]' : ''} kind=${rec.kind} ===`);
    L.push(`participants=[${(rec.participants || []).join(', ') || 'none recorded'}]`);
    L.push(`choices=${JSON.stringify(rec.choices)}`);
    L.push(`outcome=${rec.outcome}`);
    L.push('--- narration ---');
    L.push((rec.lines || []).join('\n'));
    fs.writeFileSync(fp, L.join('\n'));
    rec.logFile = fp;
  } catch (e) { console.log('r10writeContest ERROR: ' + (e && e.message)); }
}
function pollContest() {
  let ac = null;
  try { ac = (Game.state && Game.state.activeContest) || null; } catch (e) {}
  if (ac && !openContest) {
    let parts = [];
    try {
      const ids = ac.participants || (ac.participant ? [ac.participant] : []);
      parts = ids.map(id => id === 'player' ? 'you (player)' : (function(){ try { return vname(id); } catch (e) { return id; } })());
    } catch (e) {}
    const isPilot = !!((Game.state && Game.state.pilotAired) && !pollContest._pilotLogged);
    if (isPilot) pollContest._pilotLogged = true;
    let cname = ac.showName || ac.name || '?';
    try {
      const list = (Game.data && Game.data.contests) || [];
      const t = list.find(c => c && (c.id === ac.contestId || c.id === ac.showId || c.id === ac.id));
      if (t && t.name) cname = t.name;
    } catch (e) {}
    openContest = {
      id: ac.showId || ac.contestId || ac.id || '?',
      name: cname, kind: ac.kind || '?',
      day: gday(), startIdx: capture.length, pilot: isPilot,
      participants: parts, choices: [],
    };
    console.log(`*** CONTEST OPEN day ${openContest.day}: ${openContest.name}${isPilot ? ' [PILOT]' : ''} parts=[${parts.join(',')}]`);
  } else if (!ac && openContest) {
    let pending = null;
    try { pending = Game.state.pendingContest || null; } catch (e) {}
    if (pending) return; // countdown still running — the grab hasn't happened
    const rec = openContest; openContest = null;
    rec.lines = capture.slice(rec.startIdx, rec.startIdx + 6000);
    rec.n = CONTESTS.length + 1;
    let outcome = 'unknown';
    try {
      outcome = ((Game.state.contestsSeen || {})[rec.id] != null) ? 'resolved-seen' : 'closed';
    } catch (e) {}
    rec.outcome = outcome;
    CONTESTS.push(rec);
    r10writeContest(rec);
    console.log(`*** CONTEST CLOSE day ${gday()}: ${rec.name}${rec.pilot ? ' [PILOT]' : ''} lines=${rec.lines.length} choices=${rec.choices.length}`);
  }
}
pollContest._pilotLogged = false;

// ---- helpers ----
let Game = null;
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }

const DEEPEN = ['dlg:help', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy'];
let lastPickId = null; // harness hygiene: don't hammer the same deepen choice twice running
function pickChoice(choices, turn, wantId, ctx) {
  const list = choices || [];
  // r10 FAVOR_ACCEPT: only dlg:commit creates a real favor obligation
  // (convo-wants.js: 'engaged' is unreachable for favors; heard-but-not-
  // committed resolves as 'stated'). r9's picker never offered it, so all
  // favors deflected. When the want is ask_favor and commit is offered,
  // take it — the promise->kept/broken machinery gets exercised.
  if (FAVOR_ACCEPT && wantId === 'ask_favor') {
    const commit = list.find(x => x && x.id === 'dlg:commit');
    if (commit) { MET.favorAccepted++; lastPickId = 'dlg:commit'; return commit; }
  }
  // r1 establishment INVITE_PARTY probe: the [invite_party] option fires in
  // menus but the competent policy never takes it (party 0/5 in r1 pilot).
  // Take it when offered and the party has room — exercises party formation
  // end to end (acceptance, travel-with, combat auto-join).
  if (INVITE_PARTY && !ctx._invited) {
    try {
      const inv = list.find(x => x && x.id === 'invite_party');
      if (inv && Game.partyCap && Game.partyMembers && Game.partyMembers().length < Game.partyCap()) {
        ctx._invited = true; MET.partyInvites = (MET.partyInvites || 0) + 1;
        lastPickId = 'invite_party'; return inv;
      }
    } catch (e) {}
  }
  // r9: on the second turn, ask for gossip ("heard anything?") — the
  // information-machinery leg wants rendered gossip, not just deepening.
  if (turn === 1) {
    const g = list.find(x => x && x.id === 'ask:gossip');
    if (g) { MET.gossipAsks++; lastPickId = 'ask:gossip'; return g; }
  }
  // r3 STALL_BREAK (human-like picker): R2's Debbie sitting stalled at
  // seek_comfort stage 2 for 7 near-identical turns. A human changes the
  // subject or wraps up; they don't hammer comfort/stay. After 2 deepen
  // turns with no stage advance, leave honestly (logged, auditable).
  if (STALL_BREAK && ctx && ctx._stall && ctx._stall.turns >= 2) {
    const lv = list.find(x => x && x.id === 'leave');
    if (lv) { MET.stallBreaks = (MET.stallBreaks || 0) + 1; lastPickId = 'leave'; ctx._stallBroke = true; return lv; }
  }
  for (const id of DEEPEN) {
    if (id === lastPickId) continue;
    const c = list.find(x => x && x.id === id);
    if (c) { lastPickId = id; return c; }
  }
  for (const id of DEEPEN) { const c = list.find(x => x && x.id === id); if (c) { lastPickId = id; return c; } }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) { lastPickId = ans.id; return ans; }
  const yn = list.find(x => x && (x.id === 'gq:yn:yes' || x.id === 'gq:open:take'));
  if (yn) { lastPickId = yn.id; return yn; }
  const wantEngage = list.find(x => x && x.id && x.id.indexOf('alive:want:') === 0);
  if (wantEngage) { lastPickId = wantEngage.id; return wantEngage; }
  const agree = list.find(x => x && x.id === 'agree');
  if (agree && turn < 7) { lastPickId = 'agree'; return agree; }
  const cant = list.find(x => x && x.id === 'dlg:cant');
  if (cant) { lastPickId = 'dlg:cant'; return cant; }
  const bdecl = list.find(x => x && x.id === 'betrayal:decline');
  if (bdecl) { lastPickId = 'betrayal:decline'; return bdecl; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) { lastPickId = 'dlg:react'; return react; }
  lastPickId = 'leave';
  return list.find(x => x && x.id === 'leave') || null;
}

function pantryKcal() {
  try {
    const p = (Game.state.village && Game.state.village.pantry) || [];
    return Math.round(p.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
  } catch (e) { return null; }
}
function deathsSoFar() {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function popAlive() {
  try {
    return (Game.state.village.roster || []).filter(id => { const p = person(id); return !p.dead; }).length;
  } catch (e) { return null; }
}

// (favor stage-line cross-run template scan removed: the want object carries
// no .line field — the scan was dead code. Cross-run template repetition is
// checked by grepping the saved transcripts instead.)

function runConversation(seed, day, vid, nvSit, ctx) {
  const fp = `/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-16/journey-establishment-r10-transcript-${seed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  let sawBetrayalMenu = false, commNone = false;
  const themLines = [];
  let declinedThisTurn = false, gossipAskedThisTurn = false;
  try {
    try { commNone = (Game.commLevel && Game.commLevel(vid).level === 'none') || false; } catch (e) {}
    const nm = vname(vid);
    const p = person(vid);
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    MET.sittings++;
    bump(MET.wants, want.id || 'none');
    const seenIds = new Set();
    const seenAtTurn = new Map();
    const noteMenu = (choices, turn) => {
      for (const ch of (choices || [])) {
        if (!ch || !ch.id) continue;
        if (ch.id.indexOf('ans:') === 0) MET.npcQuestions++;
        if (/^betrayal:(accept|decline)/.test(ch.id)) sawBetrayalMenu = true;
        if (seenIds.has(ch.id)) {
          MET.reofferFlags++;
          log(`!! RE-OFFER: [${ch.id}] re-offered at turn ${turn} (first at turn ${seenAtTurn.get(ch.id)})`);
        } else { seenIds.add(ch.id); seenAtTurn.set(ch.id, turn); }
      }
    };
    log(`=== seed ${seed} day ${day} — conversation with ${nm} (${vid})${nvSit ? ' [deliberate nonverbal sit]' : ''} ===`);
    log(`occupation=${p.occupation || '?'} temperament=${p.temperament || '?'} trust=${((Game.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} commNone=${commNone}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log(''); noteMenu(r0.choices || [], 0);
    log(`opening menu (${(r0.choices || []).length} choices):`);
    for (const ch of (r0.choices || [])) log(`  [${ch.id}] ${String(ch.label || '').slice(0, 120)}`);
    log('');
    ctx._stall = { stage: (want.stage || 0), turns: 0 };
    ctx._stallBroke = false;
    const sayThem = (line) => {
      if (!line) { log('THEM: (no line)'); return; }
      const s = String(line);
      themLines.push(s);
      log(`THEM: ${s}`);
      const flag = senseCheckThem(s);
      if (flag) log(flag);
      // decline-line honesty: did the decline get acknowledged in the fiction?
      if (declinedThisTurn) {
        MET.declineTaken++;
        if (DECLINE_DRY_RE.test(s)) { MET.declineDry++; log('!! DECLINE DRY-LINE (non-sequitur after decline)'); }
        else if (DECLINE_ACK_RE.test(s)) { MET.declineHonest++; log('decline: acknowledged ✓'); }
        else log('decline: neutral line (neither dry nor pool): ' + s.slice(0, 100));
        declinedThisTurn = false;
      }
      // fabricated-history scan: hardcoded people counts vs living roster
      const cl = s.match(COUNT_LIE_RE);
      if (cl) {
        MET.fabricHistoryFlags++;
        log(`!! POSSIBLE COUNT LIE "${cl[0]}" (living roster: ${popAlive()})`);
      }
      // r10: gossip-ask render detection — the ask renders as a framing beat
      // ("Huh. Let me think about that." / "You want to know about that?
      // Okay." / "Good question.") FOLLOWED BY the gossip in a second
      // quoted segment. The r9 regex matched only a few content patterns
      // and scored most renders as quiet — every ask in r10's favor pilot
      // actually rendered (26/26). A render = 2+ quoted segments.
      if (gossipAskedThisTurn) {
        gossipAskedThisTurn = false;
        const quotes = (s.match(/"[^"]*"/g) || []).length;
        if (quotes >= 2) {
          MET.gossipRenders++; log('gossip render ✓');
        } else { MET.gossipNoNews++; log('gossip ask: no news (quiet)'); }
      }
    };
    sayThem(r0.line);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      log('');
      noteMenu(choices, turn + 1);
      log(`menu (${(choices || []).length}): ` + (choices || []).map(ch => `[${ch && ch.id}] ${String((ch && ch.label) || '').slice(0, 60)}`).join(' | '));
      const pickWant = ((Game.convoGet(vid) || {}).want || {}).id || null;
      const pick = pickChoice(choices, turn, pickWant, ctx);
      if (ctx._stallBroke) { log('  (stall-break: want stage unchanged 2 turns — leaving like a human would)'); ctx._stallBroke = false; }
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      if (pick.id === 'betrayal:decline') declinedThisTurn = true;
      if (pick.id === 'ask:gossip') gossipAskedThisTurn = true;
      r = Game.convoTurn(vid, pick.id);
      sayThem(r.line);
      const w = (Game.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (ctx._stall) {
        const st = w.stage || 0;
        if (st > ctx._stall.stage) { ctx._stall.stage = st; ctx._stall.turns = 0; }
        else if (DEEPEN.indexOf(lastPickId) >= 0 && st === ctx._stall.stage) ctx._stall.turns++;
      }
      if (r.ended) { log('(ended by engine)'); break; }
    }
    // r9: monster-news beats — if the player has an unreported encounter or an
    // active naming debate, ask about it in-conversation and log the render.
    try {
      if (Game.monsterTellActive && Game.monsterTellActive()) {
        const before = capture.length;
        Game.askAbout(vid, 'tellbeast', { inConvo: true });
        MET.tellbeastAsks++;
        log('YOU: [tellbeast] "You saw something out there..."');
        for (let i = before; i < capture.length; i++) { log('THEM: ' + capture[i]); senseCheckThem(capture[i]); }
      }
    } catch (e) { log('tellbeast ERROR: ' + (e && e.message)); }
    try {
      if (Game.monsterNamingActive && Game.monsterNamingActive()) {
        const before = capture.length;
        Game.askAbout(vid, 'namebeast', { inConvo: true });
        MET.namebeastAsks++;
        log('YOU: [namebeast] "What are we calling that thing?"');
        for (let i = before; i < capture.length; i++) { log('THEM: ' + capture[i]); senseCheckThem(capture[i]); }
      }
    } catch (e) { log('namebeast ERROR: ' + (e && e.message)); }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    log('');
    log('--- END ---');
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = Game.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    // r9: favor-promise tracking (favorTask teaching machinery)
    // r10: the task lives on the favor instance / promise, not the person
    // (person(vid).favorTask was always undefined — the old log printed the
    // literal "favor").
    if ((want.id || 'none') === 'ask_favor' && (w2.resolution || '') === 'promised') {
      MET.favorPromised++;
      let task = null;
      try { task = ((Game.convoGetFavor && Game.convoGetFavor(vid)) || {}).task || null; } catch (e) {}
      if (!task) { try { task = ((((Game.state.village || {}).promises || {})[vid]) || {}).favorTask || null; } catch (e) {} }
      log(`favor promised: "${(task || 'favor')}"`.slice(0, 140));
    }
    const t = (c2 && c2.transcript) || [];
    log(`transcript entries: ${t.length}`);
    const themT = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themT.filter((x, i) => themT.indexOf(x) !== i);
    if (dupes.length) { MET.verbatimRepeats += dupes.length; log(`!! VERBATIM REPEATS (${dupes.length}): ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`); }
    const allText = themT.join('\n') + '\n' + themLines.join('\n');
    if (/\(last time\)/i.test(allText)) log('!! leaked "(last time)" internal note');
    // lure check: betrayal invite menu offered — spoken, gestured, or silent?
    if (sawBetrayalMenu) {
      MET.lureOffered++;
      const spoken = LURE_RE.test(allText) && !GESTURE_RE.test(allText);
      const gesture = GESTURE_RE.test(allText);
      if (spoken) { MET.lureSpoken++; log('lure: SPOKEN ✓'); }
      else if (gesture) { MET.lureGesture++; log(`lure: GESTURED ✓ (commNone=${commNone})`); }
      else { MET.lureSilent++; log('!! lure: menu offered a betrayal invite but the NPC neither spoke nor gestured it'); }
    }
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

function countSpecialists() {  try {
    const out = { preserver: 0, cook: 0, fisher: 0 };
    const v = Game.state.village || {};
    for (const id of (v.roster || [])) {
      let p = null;
      try { p = Game.getPerson(id); } catch (e) {}
      if (!p || p.dead) continue;
      for (const t of ['preserver', 'cook', 'fisher']) {
        try { if (Game.specialistSkill && Game.specialistSkill(p, t) > 0) out[t]++; } catch (e) {}
      }
    }
    return out;
  } catch (e) { return null; }
}

// r2 trapline: the wire knowledge census — who holds knowsSnare, who holds
// TRAPS objectives, and the player's snare recipe level.
function trapCensus() {
  const out = { snareRecipeLevel: 0, knowsSnare: [], knowsSnareCount: 0, trapsObjectives: 0, snareRecipeType: null };
  try {
    const rk = ((Game.state.codex || {}).recipes || {})['snare'] || {};
    out.snareRecipeLevel = rk.level || 0;
    out.snareRecipeType = rk.type || null;
    const v = Game.state.village || {};
    const trust = v.trust || {};
    for (const id of (v.roster || [])) {
      let vp = null;
      try { vp = Game.vpOf ? Game.vpOf(id) : null; } catch (e) {}
      if (!vp || vp.dead) continue;
      if (vp.knowsSnare) out.knowsSnare.push({ id, name: vname(id), occupation: vp.occupation || null, trust: (trust[id] !== undefined) ? trust[id] : null, taughtSnare: !!vp.taughtSnare, snareTaught: !!vp.snareTaught });
      try {
        const o = Game.objOf ? Game.objOf(id) : null;
        if (o && (o.kind === 'TRAPS' || o.purpose === 'traps')) out.trapsObjectives++;
      } catch (e) {}
    }
    out.knowsSnareCount = out.knowsSnare.length;
  } catch (e) { out.error = String(e && e.message || e); }
  return out;
}

function buildCensus() {
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const trust = (Game.state.village && Game.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (Game.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = Game.agencyOf ? Game.agencyOf(id) : null; } catch (e) {}
    let mood = p.mood || null;
    let want = null;
    try { const c = Game.convoGet(id); want = (c && c.want && c.want.id) || null; } catch (e) {}
    // r1 establishment: specialist roles + knowledge ladder per villager
    let assignment = null, spec = null;
    try { const a = (Game.state.village.assignments || {})[id]; assignment = (a && a.task) || null; } catch (e) {}
    try {
      spec = {};
      for (const t of ['preserver', 'cook', 'fisher']) {
        try { const s = Game.specialistSkill ? Game.specialistSkill(p, t) : 0; if (s > 0) spec[t] = s; } catch (e) {}
      }
      if (!Object.keys(spec).length) spec = null;
    } catch (e) {}
    return {
      id, name: vname(id),
      alive: !p.dead,
      occupation: p.occupation || null,
      temperament: p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants, want,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
      assignment, spec,
    };
  });
}


// ---- r3: the render-ladder beat (RENDER_LADDER knob) ----
// Near a fire, work the preservation ladder the pinned policy omits:
// render any raw fat (blind attempts teach 'render' per canon self-trial),
// then make pemmican when sets exist. Covers scholar inventory + prepStash
// (the stash counter wires both in the UI). Ground-truth counts (batches,
// bars) come from the rendered-fat/pemmican inventory deltas, not lines.
function renderedFatUnits() {
  let n = 0;
  try {
    for (const cont of [(Game.state.scholar || {}).inventory || [], (Game.prepStash ? Game.prepStash() : [])]) {
      for (const it of cont) if (it && it.foodKind === 'fat' && it.foodState === 'rendered' && !Game.isSpoiled(it)) n += (it.units || 1);
    }
  } catch (e) {}
  return n;
}
function pemmicanBars() {
  let n = 0;
  try {
    for (const cont of [(Game.state.scholar || {}).inventory || [], (Game.prepStash ? Game.prepStash() : [])]) {
      for (const it of cont) if (it && it.foodKind === 'meat' && it.foodState === 'pemmican' && !Game.isSpoiled(it)) n += (it.units || 1);
    }
  } catch (e) {}
  return n;
}
function ladderBeat(tag) {
  if (!RENDER_LADDER || !Game || Game.over) return;
  try {
    if (!Game.nearFire()) return;
    const conts = [];
    try { conts.push((Game.state.scholar || {}).inventory); } catch (e) {}
    try { if (Game.prepStash) conts.push(Game.prepStash()); } catch (e) {}
    const hasRawFat = (c) => (c || []).some(i => i && i.foodKind === 'fat' && i.foodState === 'raw' && !Game.isSpoiled(i));
    const rb = renderedFatUnits(), pb = pemmicanBars();
    let rendered = false;
    for (const c of conts) {
      if (!c || !hasRawFat(c)) continue;
      try { Game.renderFat(undefined, c); rendered = true; } catch (e) { console.log('renderFat ERROR: ' + (e && e.message)); }
    }
    if (rendered) {
      const now = renderedFatUnits();
      MET.ladderRenderBeats = (MET.ladderRenderBeats || 0) + 1;
      console.log(`*** LADDER [${tag}] render: rendered-fat units ${rb}->${now}`);
    }
    if (Game.knowsTechnique && Game.knowsTechnique('render')) {
      for (const c of conts) {
        let prev = { sets: 0, bars: 0 };
        try { prev = Game.pemmicanPreview(c) || prev; } catch (e) {}
        if (prev.sets > 0) {
          const pb0 = pemmicanBars();
          try { Game.makePemmican(c); } catch (e) { console.log('makePemmican ERROR: ' + (e && e.message)); }
          const pb1 = pemmicanBars();
          MET.ladderPemmicanBeats = (MET.ladderPemmicanBeats || 0) + 1;
          console.log(`*** LADDER [${tag}] pemmican: ${prev.sets} sets -> bars ${pb0}->${pb1}`);
        }
      }
    }
    void pb;
  } catch (e) { console.log('ladderBeat ERROR: ' + (e && e.message)); }

}
// ---- r5: the fat-supply probe (FATSEEK knob) ----
// A deliberately fat-seeking player works the only fiction channels that
// reach raw fat in the establishment window: (a) ruin scavenging for the
// Trapper Handbook (pit_trap recipe's only acquisition channel —
// readBook grants L3), then pit craft (2 sticks) + set; (b) opportunistic
// wild_boar/javelina hunts via huntAnimal when one is the encounter animal.
// The pinned policy does none of this, so this is a harness-level beat,
// same class as R3's RENDER_LADDER probe. Telemetry is ground truth:
// inventory deltas for fat slabs, recipe levels, trap counts.
const FAT_IDS = ['wild_boar', 'javelina'];
function rawFatSlabs() {
  let n = 0;
  try {
    for (const cont of [(Game.state.scholar || {}).inventory || [], (Game.prepStash ? Game.prepStash() : [])]) {
      for (const it of cont) if (it && it.foodKind === 'fat' && it.foodState === 'raw' && !Game.isSpoiled(it)) n += (it.units || 1);
    }
  } catch (e) {}
  return n;
}
function pitRecipeLevel() {
  try { return (((Game.state.codex || {}).recipes || {}).pit_trap || {}).level || 0; } catch (e) { return 0; }
}
// honest walk hop-by-hop toward (hx,hy), copied from the policy's walkTo
function fsWalkTo(hx, hy) {
  try {
    let guard = 0;
    while ((Game.map.px !== hx || Game.map.py !== hy) && guard++ < 10 && !Game.over && !Game.tbfight) {
      let best = null, bd = 1e9;
      for (const tt of (Game.travelTargets() || [])) {
        const d = Math.abs(tt.x - hx) + Math.abs(tt.y - hy);
        if (d < bd) { bd = d; best = tt; }
      }
      if (!best) break;
      const px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(best.x, best.y); } catch (e) { break; }
      if (Game.map.px === px0 && Game.map.py === py0) break;
    }
  } catch (e) {}
}
function fatseekBeat(tag, ctx) {
  if (!FATSEEK || !Game || Game.over) return;
  try {
    ctx = ctx || {};
    const s = Game.state.scholar; if (!s) return;
    const gd = s.day || 0;
    if (gd < 14 || gd > 40) return; // the establishment window
    const inv = s.inventory || [];
    // (1) READ the handbook if held
    const book = inv.find(i => i && i.bookId === 'trappers_handbook');
    if (book && pitRecipeLevel() < 1) {
      try { Game.readBook('trappers_handbook'); bump(MET, 'fatseekReads'); console.log('*** FATSEEK: read Trapper Handbook (pit recipe level now ' + pitRecipeLevel() + ')'); } catch (e) { console.log('fatseek read ERROR: ' + (e && e.message)); }
    }
    // (2) RUIN DETOUR: no book, no pit recipe -> search a nearby ruin (at
    // most every 3 DRIVEN days, never when hurt). The book roll fires on the
    // FIRST forage of each ruin; the policy never searches ruins, so this
    // beat is the only way the channel gets measured.
    // R6 GUARD FIX: the old guard compared GAME-days (gd), but a detour's own
    // fights/contests advance the game clock >=3 days, re-arming the guard on
    // the very next beat — r5 measured 9-27 detours/seed instead of ~7. Gate
    // on the harness loop-iteration (one per driven day) instead.
    const _iter = (ctx._loopIter != null ? ctx._loopIter : 0);
    if (pitRecipeLevel() < 1 && !book && (s.hp || 100) >= 50 && (ctx._fatseekDetourIter == null || _iter - ctx._fatseekDetourIter >= 3)) {
      let ruin = null, rd = 1e9;
      try {
        for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
          const t = Game.tileAt(x, y);
          if (!t || t.type !== 'ruin') continue;
          const d = Math.abs(x - Game.map.px) + Math.abs(y - Game.map.py);
          if (d < rd) { rd = d; ruin = { x, y }; }
        }
      } catch (e) {}
      if (ruin && rd <= 4) {
        ctx._fatseekDetourIter = _iter; // r6: iteration-gated (see above)
        bump(MET, 'fatseekDetours');
        console.log('*** FATSEEK: ruin detour to (' + ruin.x + ',' + ruin.y + ')');
        fsWalkTo(ruin.x, ruin.y);
        if (Game.map.px === ruin.x && Game.map.py === ruin.y && !Game.over && !Game.tbfight) {
          try { Game.doAction('forage', {}); bump(MET, 'fatseekSearches'); } catch (e) {}
        }
        driveFights(Game, competent, ctx);
        driveContests(Game, competent, ctx);
      }
    }
    // (3) CRAFT + HOLD the pit once the recipe is known (the policy's
    // workTraplineSet already sets held trap tools on wild tiles —
    // pit_trap is in its TRAPLINE_IDS — so craft here, set there).
    if (pitRecipeLevel() >= 2) {
      const held = ((s.tools || []).some(t => t && t.recipeId === 'pit_trap'));
      const inv2 = s.inventory || [];
      const have = (m) => inv2.filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
      if (!held && have('stick') >= 2) {
        try { const r = Game.craft('pit_trap'); if (r) { bump(MET, 'fatseekPitCrafts'); console.log('*** FATSEEK: crafted a pit trap'); } } catch (e) {}
      }
    }
    // (4) OPPORTUNISTIC HUNT: a fatbearer is the encounter animal.
    // Honest, risk-aware: weapon with real reach, hp >= 60, one attempt
    // per day. The prey-reaction may still bolt (javelina) or charge (boar).
    const a = s.animal;
    if (a && FAT_IDS.indexOf(a.id) !== -1 && (s.hp || 100) >= 60 && !Game.tbfight && ctx._fatseekHuntDay !== gd) {
      let w = null;
      try { w = Game.equippedWeapon ? Game.equippedWeapon() : null; } catch (e) {}
      const range = (w && w.range) || 1;
      if (range >= 2) {
        const px = s.mx ?? 4, py = s.my ?? 4;
        const dist = Math.max(Math.abs(a.mx - px), Math.abs(a.my - py));
        // step closer first if needed (adjacent step is honest)
        if (dist > range && dist > 1) {
          try {
            const cx = px + Math.sign(a.mx - px), cy = py + Math.sign(a.my - py);
            Game._cellInteract(cx, cy);
          } catch (e) {}
        }
        const a2 = Game.state.scholar.animal;
        if (a2 && a2.id === a.id) {
          const d2 = Math.max(Math.abs(a2.mx - (s.mx ?? 4)), Math.abs(a2.my - (s.my ?? 4)));
          if (d2 <= range) {
            ctx._fatseekHuntDay = gd;
            bump(MET, 'fatseekHuntAttempts');
            console.log('*** FATSEEK: hunting ' + a.id + ' (dist ' + d2 + ', range ' + range + ')');
            try { Game.huntAnimal(); bump(MET, 'fatseekHunts'); } catch (e) { console.log('fatseek hunt ERROR: ' + (e && e.message)); }
            driveFights(Game, competent, ctx);
          }
        }
      }
    }
    // ground-truth fat census
    const rf = rawFatSlabs();
    if (rf > 0 && (ctx._fatseekMaxFat || 0) < rf) {
      ctx._fatseekMaxFat = rf;
      console.log('*** FATSEEK: raw fat slabs in hand: ' + rf);
    }
  } catch (e) { console.log('fatseekBeat ERROR: ' + (e && e.message)); }
}


async function runSeed(seed) {
  capture = [];
  FIGHTS.length = 0; CONTESTS.length = 0; openFight = null; openContest = null;
  pollContest._pilotLogged = false; _r10seed = seed;
  console.log(`\n########## SEED ${seed} ##########`);
  const lg = await loadGame({ seed, narration: true }); // r10: the pilot question needs say/sysSay live
  Game = lg.Game;
  if (lg.loadFails && lg.loadFails.length) console.log('LOAD FAILS: ' + JSON.stringify(lg.loadFails));
  // capture the narration stream (keeps the sim-harness silence)
  (function wrapStream() {
    const _emit = Game.emit, _say = Game.say;
    if (typeof _emit === 'function') {
      Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
    }
    if (typeof _say === 'function') {
      Game.say = function (...a) { cap(a[0]); }; // silenced by design (sim-harness)
    }
  })();
  // fight counter: the competent player should never see a blind-sided fight.
  // r10 TRACE_DEATH=1: wrap registerDeath to snapshot exact pantry/health
  // state the moment any death fires (starvation-mechanism forensics).
  if (process.env.TRACE_DEATH === '1' && typeof Game.registerDeath === 'function') {
    const origRD = Game.registerDeath.bind(Game);
    Game.registerDeath = function (rec) {
      try {
        const v = Game.state.village || {};
        console.log('### registerDeath FIRED ' + JSON.stringify({
          rec, gameDay: (Game.state.scholar || {}).day,
          pantryLen: (v.pantry || []).length,
          pantryKcal: Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)),
          victimHealth: (v.health || {})[rec.villagerId],
          granaryFedDay: v._granaryFedDay,
        }));
        console.log(new Error('death-stack').stack.split('\n').slice(1, 9).join('\n'));
      } catch (e) { console.log('trace ERROR: ' + (e && e.message)); }
      return origRD(rec);
    };
  }
  // r8: fold any in-progress feasted-spam run into per-fight telemetry.
  // r10: open a per-fight record (rounds, decisions, villagers, narration).
  try {
    const _sc = Game.startCombat.bind(Game);
    Game.startCombat = function (...a) {
      MET.fightsSeen++;
      if (_spamRun > 0) {
        MET.feastedSpamFights++;
        if (_spamRun > MET.feastedSpamMaxPerFight) MET.feastedSpamMaxPerFight = _spamRun;
        _spamRun = 0;
      }
      if (openFight) closeFight('superseded');
      const fBefore = Game.tbfight;
      const r = _sc.apply(this, a);
      try {
        const f = Game.tbfight;
        // Refused (a fight was already live) or threw: no new fight — no record.
        if (!f || f === fBefore || f.over) return r;
        const fs = (f && f.fighters) || [];
        const mons = fs.filter(x => x && x.kind === 'monster');
        const vills = fs.filter(x => x && x.kind === 'villager');
        const m0 = mons[0] || {};
        openFight = {
          day: gday(), monsterId: (a && a[0]) || m0.monsterId || m0.id || '?',
          monsterName: m0.name || m0.monsterId || (a && a[0]) || '?',
          arena: !!(f && (f.arena || f.arenaFight)),
          playerInFight: fs.some(x => x && (x.key === 'p' || x.kind === 'player')),
          startIdx: capture.length, decisions: {}, rounds: (f && f.round) || 0,
          deathMark: r10deathMark(), fled: false,
          villagerFighters: vills.map(x => { try { return vname(x.villagerId || x.key || x.id); } catch (e) { return '?'; } }),
        };
      } catch (e) { openFight = null; }
      return r;
    };
  } catch (e) {}
  // r10: player decision verbs — counted into the open fight's record.
  try {
    const VERBS = [['tbPlayerStrike', 'strike'], ['tbPlayerWait', 'wait'], ['tbBarrierExit', 'flee'],
      ['tbPlayerShout', 'shout'], ['tbPlayerOfferFood', 'offer'], ['tbPlayerMove', 'move']];
    for (const [fn, key] of VERBS) {
      const _f = Game[fn];
      if (typeof _f !== 'function') continue;
      const b = _f.bind(Game);
      Game[fn] = function (...a) {
        const out = b(...a);
        try {
          if (openFight) {
            openFight.decisions[key] = (openFight.decisions[key] || 0) + 1;
            if (key === 'flee') openFight.fled = true;
            const _tf = Game.tbfight;
            if (_tf && (_tf.round || 0) > openFight.rounds) openFight.rounds = _tf.round;
            if ((!_tf || _tf.over) && openFight.endIdx == null) openFight.endIdx = capture.length;
          }
        } catch (e) {}
        return out;
      };
    }
  } catch (e) {}
  // r10: open the contest record at ANNOUNCEMENT (fireContest/fireShow) so the
  // pilot lines, countdown dread, and grab beats are in the slice — the
  // contestChoose open-path below is the fallback for paths that skip them.
  function r10openContestRecord(ac, preIdx) {
    if (openContest || !ac) return;
    let parts = [];
    try {
      const ids = ac.participants || (ac.participant ? [ac.participant] : []);
      parts = ids.map(id => id === 'player' ? 'you (player)' : (function(){ try { return vname(id); } catch (e) { return id; } })());
    } catch (e) {}
    const isPilot = !!((Game.state && Game.state.pilotAired) && !pollContest._pilotLogged);
    if (isPilot) pollContest._pilotLogged = true;
    let cname = ac.showName || ac.name || '?';
    try {
      const list = (Game.data && Game.data.contests) || [];
      const t = list.find(c => c && (c.id === ac.contestId || c.id === ac.showId || c.id === ac.id));
      if (t && t.name) cname = t.name;
    } catch (e) {}
    // pendingContest (countdown) carries the id before activeContest exists
    if (cname === '?' && ac.contestId) {
      try {
        const list2 = (Game.data && Game.data.contests) || [];
        const t2 = list2.find(c => c && c.id === ac.contestId);
        if (t2 && t2.name) cname = t2.name;
      } catch (e) {}
    }
    openContest = {
      id: ac.showId || ac.contestId || ac.id || '?',
      name: cname, kind: ac.kind || (ac.contestId ? 'contest' : '?'),
      day: gday(), startIdx: (preIdx != null ? preIdx : capture.length), pilot: isPilot,
      participants: parts, choices: [],
    };
    console.log(`*** CONTEST OPEN day ${openContest.day}: ${openContest.name}${isPilot ? ' [PILOT]' : ''} parts=[${parts.join(',')}]`);
  }
  try {
    for (const fn of ['fireContest', 'fireShow']) {
      const _f = Game[fn];
      if (typeof _f !== 'function') continue;
      const b = _f.bind(Game);
      Game[fn] = function (...a) {
        const preIdx = capture.length;
        const out = b(...a);
        try { r10openContestRecord(Game.state.pendingContest || Game.state.activeContest, preIdx); } catch (e) {}
        return out;
      };
    }
  } catch (e) {}
  // r10: contest choices — log phase/choice/label into the open contest.
  try {
    const _cc = Game.contestChoose;
    if (typeof _cc === 'function') {
      const bcc = _cc.bind(Game);
      Game.contestChoose = function (idx, ...rest) {
        try {
          if (!openContest) {
            const ac0 = Game.state.activeContest;
            if (ac0) {
              let parts = [];
              try {
                const ids = ac0.participants || (ac0.participant ? [ac0.participant] : []);
                parts = ids.map(id => id === 'player' ? 'you (player)' : (function(){ try { return vname(id); } catch (e) { return id; } })());
              } catch (e) {}
              const isPilot = !!((Game.state && Game.state.pilotAired) && !pollContest._pilotLogged);
              if (isPilot) pollContest._pilotLogged = true;
              let cname0 = ac0.showName || ac0.name || '?';
              try {
                const list0 = (Game.data && Game.data.contests) || [];
                const t0 = list0.find(c => c && (c.id === ac0.contestId || c.id === ac0.showId || c.id === ac0.id));
                if (t0 && t0.name) cname0 = t0.name;
              } catch (e) {}
              openContest = {
                id: ac0.showId || ac0.contestId || ac0.id || '?',
                name: cname0, kind: ac0.kind || '?',
                day: gday(), startIdx: capture.length, pilot: isPilot,
                participants: parts, choices: [],
              };
              console.log(`*** CONTEST OPEN day ${openContest.day}: ${openContest.name}${isPilot ? ' [PILOT]' : ''} parts=[${parts.join(',')}]`);
            }
          }
          const ac = Game.state.activeContest;
          const phase = ac && ac.phases && ac.phases[ac.phaseIdx || 0];
          const choice = phase && phase.choices && phase.choices[idx];
          if (openContest) openContest.choices.push({
            phase: (ac && ac.phaseIdx) || 0,
            beat: (phase && (phase.name || phase.beat || phase.id)) || '?',
            idx, label: choice ? String(choice.label || '').slice(0, 100) : '?',
          });
        } catch (e) {}
        const out = bcc(idx, ...rest);
        try {
          if (openContest && !(Game.state && Game.state.activeContest) && !(Game.state && Game.state.pendingContest)) {
            const rec = openContest; openContest = null;
            rec.lines = capture.slice(rec.startIdx, rec.startIdx + 6000);
            rec.n = CONTESTS.length + 1;
            rec.outcome = 'resolved';
            CONTESTS.push(rec);
            r10writeContest(rec);
            console.log(`*** CONTEST CLOSE day ${gday()}: ${rec.name}${rec.pilot ? ' [PILOT]' : ''} lines=${rec.lines.length} choices=${rec.choices.length}`);
          }
        } catch (e) {}
        return out;
      };
    }
  } catch (e) {}
  // r10: corpse loot calls.
  try {
    const _lc = Game.lootCorpse;
    if (typeof _lc === 'function') {
      const blc = _lc.bind(Game);
      Game.lootCorpse = function (...a) { MET.corpseLootCalls = (MET.corpseLootCalls || 0) + 1; return blc(...a); };
    }
  } catch (e) {}
  // HARNESS BUG FIX (establishment r2 2026-10-14): the old harness stubbed
  // genDetail to return {} (copied through r5-r12 landing + r1). That made
  // EVERY player forage a no-op ('Nothing within reach') — 330 forage trips
  // in this run's pilot yielded 0 vine, 0 stick, 0 stone, starving the whole
  // craft channel the trapline question depends on. The real genDetail works
  // in node (4 ms/tile, cached in t.detail) — no stub, honest forage.
  await setupGame(Game);

  const ctx = { policyId: 'competent-establishment-r2' };
  const pid = Game.villagerId;
  const pp = person(pid);
  const spawn = {
    seed, day: gday(),
    scholarName: vname(pid), scholarId: pid,
    occupation: pp.occupation || null, temperament: pp.temperament || null,
    hp: (Game.state.scholar && Game.state.scholar.health) || null,
    fullness: (Game.state.scholar && Game.state.scholar.kcal) || null,
    rosterCount: (Game.state.village.roster || []).length,
  };
  console.log('SPAWN: ' + JSON.stringify(spawn));
  console.log('--- first 40 emitted lines (what the new player sees) ---');
  console.log(capture.slice(0, 40).join('\n'));
  console.log('--- end of spawn stream ---');

  const talked = new Set();
  let sysWas = !!(Game.state && Game.state.systemArrived);
  let systemDay = sysWas ? gday() : null;
  let systemFile = null;
  const series = [];
  const transcriptFiles = [];
  let overAt = null;
  let lastSday = null, frozenIters = 0;

  const atHaven = () => { try { return Game.playerAtHaven ? Game.playerAtHaven() : true; } catch (e) { return true; } };
  const pickVillager = (nvSit) => {
    try {
      const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && !talked.has(id));
      for (const id of roster) {
        let lvl = 'full';
        try { const nc = Game.commLevel ? Game.commLevel(id) : { level: 'full' }; lvl = (nc && nc.level) || 'full'; } catch (e) {}
        if (nvSit ? lvl !== 'none' : lvl === 'none') continue;
        let cnt = -1;
        try { const c0 = Game.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
        if (cnt === 0) return id;
      }
      return roster.length ? roster[0] : null;
    } catch (e) { return null; }
  };
  const daySnapshot = () => {
    let loc = null, packKcal = null, sentiment = null, feastState = null;
    try { loc = atHaven() ? 'haven' : 'wild'; } catch (e) {}
    try {
      const pack = (Game.state.scholar && Game.state.scholar.pack) || [];
      packKcal = Math.round(pack.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
    } catch (e) {}
    try { sentiment = !!(Game.sentimentTaught && Game.sentimentTaught()); } catch (e) {}
    try {
      const s = Game.state.scholar || {};
      feastState = {
        feasted: !!(Game.feastedActive && Game.feastedActive()),
        armed: !!((s.prog && s.prog.feastSurge)),
        surgeUsed: !!((s.prog && s.prog.feastSurgeUsed)),
        resonance: (s.prog && s.prog.surgeResonance) || 0,
      };
    } catch (e) {}
    // r9: daily gossip census — the information machinery's ledger
    let gossipCensus = null, monsterCodex = null, rumorTrack = null;
    try {
      gossipCensus = ((Game.state.village || {}).gossip || []).map(g => ({
        action: g.action || null,
        who: (g.dims && g.dims.who) || null,
        hearers: (g.heard || []).length,
        distortion: g.distortion || 0,
        day: g.day, playerRumor: !!g.playerRumor,
      }));
    } catch (e) {}
    try {
      monsterCodex = Object.entries(((Game.state.codex || {}).monsters) || {}).map(([mid, e]) => ({
        mid, reported: !!e.reported, knowers: (e.knowers || []).length,
        namingKicked: !!e.namingKicked, villageName: e.villageName || null,
        proposals: Object.keys(e.proposals || {}).length,
      }));
    } catch (e) {}
    try {
      if (ctx._rumorTarget) {
        const t = ctx._rumorTarget;
        rumorTrack = {
          target: t, targetName: vname(t),
          repGenerous: (Game.repOf(t) || {}).generous,
          trustOfPlayer: (((Game.state.village || {}).trust) || {})[t],
          rumors: ((Game.state.village || {}).gossip || []).filter(g => g.playerRumor)
            .map(g => ({ action: g.action, hearers: (g.heard || []).length, distortion: g.distortion || 0 })),
        };
      }
    } catch (e) {}
    // r10: per-villager vitals — trace starvation declines (health/away/hunger)
    let vitals = null;
    try {
      const v = Game.state.village || {};
      vitals = (v.roster || []).map(rid => {
        let n = {};
        try { n = Game.npcNeeds(rid) || {}; } catch (e) {}
        return {
          id: rid,
          health: (v.health && v.health[rid] !== undefined) ? Math.round(v.health[rid]) : null,
          away: !!((v.away || {})[rid]),
          hunger: (n.hunger != null) ? Math.round(n.hunger) : null,
          dead: (() => { try { return !!Game.getPerson(rid).dead; } catch (e) { return null; } })(),
        };
      });
    } catch (e) {}
    return {
      day: gday(), pantryKcal: pantryKcal(), pop: popAlive(),
      deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause })),
      scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
      scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
      scholarAlive: !!(Game.state.scholar) && !Game.over,
      loc, packKcal, sentiment, feastState,
      gossipCensus, monsterCodex, rumorTrack, vitals,
      trap: trapCensus(), // r2 trapline snapshot (M1/M2)
    };
  };
  // r8: starvation-death autopsy — record context the day it happens
  const starvAutopsies = [];
  const checkStarvationDeaths = (snap) => {
    for (const d of snap.deaths) {
      const cause = String(d.cause || '').toLowerCase();
      if (!/starv|hunger|kcal/.test(cause)) continue;
      if (starvAutopsies.some(a => a.who === d.who && a.day === d.day)) continue;
      let pantryEdible = null;
      try {
        const p = (Game.state.village && Game.state.village.pantry) || [];
        pantryEdible = Math.round(p.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
      } catch (e) {}
      starvAutopsies.push({
        who: d.who, day: d.day, cause: d.cause,
        loc: snap.loc, scholarKcal: snap.scholarKcal, packKcal: snap.packKcal,
        pantryEdible, pop: snap.pop,
        seriesTail: series.slice(-3).map(x => ({ day: x.day, scholarKcal: x.scholarKcal, pantryKcal: x.pantryKcal, loc: x.loc })),
      });
      MET.starvationDeaths++;
      console.log(`*** STARVATION DEATH: ${d.who} day ${d.day} loc=${snap.loc} pack=${snap.packKcal} pantry=${pantryEdible}`);
    }
  };

  // game-day-bounded loop (a forage trip can roll the day mid-iteration;
  // social beats fire once per OBSERVED game day, at haven)
  const day0 = gday();
  let lastGd = -1, lastNvGd = -1, loop = 0;
  while (!Game.over && loop++ < 320) {
    const gd = gday();
    ctx._loopIter = loop; // r6: FATSEEK detour guard gates on driven days, not game-days
    if (gd >= day0 + DAYS) break;
    if (gd !== lastGd) {
      lastGd = gd;
      // r10: keep the open fight's round count fresh, then close fights that
      // ended; watch contest open/close transitions.
      try {
        if (openFight && Game.tbfight && !Game.tbfight.over) {
          const r = Game.tbfight.round || 0;
          if (r > openFight.rounds) openFight.rounds = r;
        } else if (openFight) {
          if (openFight.endIdx == null) openFight.endIdx = capture.length;
          closeFight(Game.over ? 'game-over' : 'ended');
        }
      } catch (e) {}
      try { pollContest(); } catch (e) { console.log('pollContest ERROR: ' + (e && e.message)); }
      // social beat: one full conversation on the first observed day, an
      // NV sit on the second, then every CONVO_EVERY game-days (establishment
      // leg: the village is established, fewer beats needed than landing).
      const isFirstDay = (gd === day0);
      const isNvDay = (lastNvGd < 0 && gd > day0);
      const isCadenceDay = ((gd - day0) % CONVO_EVERY === 0);
      const shouldConvo = isFirstDay || isNvDay || isCadenceDay;
      if (atHaven() && shouldConvo) {
        const vid = pickVillager(isNvDay && lastNvGd < 0) || pickVillager(false);
        if (vid) {
          const didNv = isNvDay && lastNvGd < 0;
          try {
            const fp = runConversation(seed, gd, vid, didNv, ctx);
            transcriptFiles.push(fp);
            console.log(`convo with ${vname(vid)}${didNv ? ' [NV]' : ''} -> ${fp}`);
          } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
          talked.add(vid);
          if (didNv) lastNvGd = gd;
        } else console.log('no fresh conversational villager today');
      } else if (!atHaven()) console.log(`day ${gd}: player away from haven — no conversation beat`);
      // r1 establishment: contest lifecycle watch — contests unlock day 14,
      // pilot guarantee >= day 21. Log each new held contest with its day.
      try {
        const held = (Game.state && Game.state.contestsHeld) || 0;
        if (held > (ctx._contestsSeen || 0)) {
          ctx._contestsSeen = held;
          const seen = (Game.state.contestsSeen || {});
          const names = Object.keys(seen).join(',');
          const pilot = !!(Game.state.pilotAired);
          console.log(`*** CONTEST HELD #${held} on day ${gd} (pilotAired=${pilot}, seen=[${names}])`);
          MET.contestLines += capture.filter(l => /contest/i.test(String(l))).length;
          (MET.contestLog = MET.contestLog || []).push({ seed, day: gd, held, pilot, seen: names });
        }
      } catch (e) {}
      // r1 establishment: weekly establishment snapshot (party, assignments)
      let estab = null;
      try {
        if ((gd - day0) % 7 === 0) {
          const v = Game.state.village || {};
          let members = [], capN = null;
          try { members = Game.partyMembers ? Game.partyMembers() : []; } catch (e) {}
          try { capN = Game.partyCap ? Game.partyCap() : null; } catch (e) {}
          const asg = {};
          for (const [id, a] of Object.entries(v.assignments || {})) asg[a && a.task ? a.task : 'none'] = (asg[a && a.task ? a.task : 'none'] || 0) + 1;
          estab = { party: members.length, partyCap: capN, assignments: asg, specialists: countSpecialists() };
          console.log(`--- day ${gd} estab: party=${members.length}/${capN} asg=${JSON.stringify(asg)} ---`);
        }
      } catch (e) {}
      // System contact detection
      const sysNow = !!(Game.state && Game.state.systemArrived);
      if (!sysWas && sysNow) {
        systemDay = gday();
        systemFile = `/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-16/journey-establishment-r10-system-${seed}.txt`;
        fs.writeFileSync(systemFile,
          `=== seed ${seed}: System contact fired on game-day ${systemDay} ===\n\n` +
          capture.slice(-30).join('\n'));
        console.log(`*** SYSTEM CONTACT on day ${systemDay} -> ${systemFile}`);
      }
      sysWas = sysNow;
      const snap = daySnapshot();
      series.push(snap);
      checkStarvationDeaths(snap);
      // r9: day-3 rumor plant — the player starts a 'generous' rumor about a
      // villager (social verb, drama-grade). Then gossip machinery is watched
      // to carry it: hearers, distortion, rep movement (canon: REP only,
      // never trust — the subject's trust of the player must not move).
      if (!ctx._rumorPlanted && gd >= day0 + 2) {
        ctx._rumorPlanted = true;
        try {
          const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && !person(id).dead);
          if (roster.length >= 3 && Game.spreadRumor) {
            const target = roster[0], hearer = roster[1];
            const g = Game.spreadRumor(target, 'generous', hearer);
            ctx._rumorTarget = target; ctx._rumorDay = gd;
            MET.rumorPlanted++;
            console.log(`*** rumor planted day ${gd}: 'generous' about ${vname(target)} (first told ${vname(hearer)}) -> ${g ? 'seeded' : 'refused'}`);
          }
        } catch (e) { console.log('rumor plant ERROR: ' + (e && e.message)); }
      }
      // r8: first day the sentiment lesson lands (devotion channel unlock)
      try {
        if (MET.sentimentTaughtDay === null && Game.sentimentTaught && Game.sentimentTaught()) {
          MET.sentimentTaughtDay = gd;
          console.log(`*** sentiment taught on game-day ${gd}`);
        }
      } catch (e) {}
      ladderBeat('dawn');
      fatseekBeat('dawn', ctx);
      console.log(`--- seed ${seed} game-day ${gd} (loop ${loop}) pantry=${snap.pantryKcal} pop=${snap.pop} ---`);
    }
    // villagerTurn-corrected day clock (sim-harness pattern)
    let brokeEarly = false;
    for (let p = 0; p < 3; p++) {
      try { competent.upkeep(Game, ctx); } catch (e) { console.log('upkeep ERROR: ' + (e && e.message)); }
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      try { pollContest(); } catch (e) {}
      try { if (openFight && openFight.endIdx == null && (!Game.tbfight || Game.tbfight.over)) openFight.endIdx = capture.length; } catch (e) {}
      if (Game.over) { brokeEarly = true; break; }
      try { Game.doAction('wait'); } catch (e) { console.log('wait ERROR: ' + (e && e.message)); }
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      try { pollContest(); } catch (e) {}
      try { if (openFight && openFight.endIdx == null && (!Game.tbfight || Game.tbfight.over)) openFight.endIdx = capture.length; } catch (e) {}
      if (Game.over) { brokeEarly = true; break; }
    }
    if (brokeEarly) break;
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily ERROR: ' + (e && e.message)); }
    driveFights(Game, competent, ctx);
    driveContests(Game, competent, ctx);
    try { pollContest(); } catch (e) {}
    ladderBeat('dusk');
    fatseekBeat('dusk', ctx);
    try { Game.sleep(); } catch (e) { console.log('sleep note: ' + (e && e.message)); }
    driveContests(Game, competent, ctx);
    try { pollContest(); } catch (e) {}
    // time-freeze watchdog (sim-harness)
    try {
      const sday = (Game.state.scholar || {}).day || 0;
      if (lastSday !== null && sday === lastSday && Game.tbfight && !Game.tbfight.over) {
        if (++frozenIters >= 8) {
          try { Game.tbEnd('routed'); MET.timeFreezeCleared++; ctx.timeFreezeCleared = (ctx.timeFreezeCleared || 0) + 1; } catch (e) {}
          frozenIters = 0;
        }
      } else { frozenIters = 0; lastSday = sday; }
    } catch (e) {}
  }
  if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); }
  if (loop >= 320) console.log(`SEED ${seed}: LOOP GUARD HIT at game-day ${gday()}`);

  // fold ctx telemetry into MET
  for (const k of ['aidOffersAccepted', 'aidGivenKcal', 'aidRefused', 'looted', 'forageTrips',
    'trapsCrafted', 'trapsSet', 'trapsWireSet', 'cleanedCarcasses', 'knappedKnife',
    'beastTricks', 'fledBad', 'fled', 'choseAbility',
    'devotionChannels', 'feasts', 'armedFeasts', 'facedDraw', 'soothed']) {
    MET[k] = (MET[k] || 0) + (ctx[k] || 0);
  }
  // r8: fold any trailing feasted-spam run (fight never formally ended)
  if (_spamRun > 0) {
    MET.feastedSpamFights++;
    if (_spamRun > MET.feastedSpamMaxPerFight) MET.feastedSpamMaxPerFight = _spamRun;
    _spamRun = 0;
  }

  try { closeFight(Game.over ? 'game-over' : 'seed-end'); } catch (e) {}
  try { if (openContest) { pollContest(); } } catch (e) {}
  let corpseCensus = null;
  try {
    const cs = (Game.corpses ? Game.corpses() : []) || [];
    corpseCensus = {
      total: cs.length,
      monsterUnlooted: cs.filter(c => c && c.kind === 'monster' && !c.looted && (c.items || []).some(i => (i.units == null ? 1 : i.units) > 0)).length,
      monsterLooted: cs.filter(c => c && c.kind === 'monster' && !!c.looted).length,
      villagerUnlooted: cs.filter(c => c && (c.kind === 'villager' || c.kind === 'person') && !c.looted).length,
      playerLootCalls: MET.corpseLootCalls || 0,
      policyLooted: ctx.looted || 0,
    };
  } catch (e) { corpseCensus = { error: String(e && e.message || e) }; }
  const census = buildCensus();
  const censusPath = `/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-16/journey-establishment-r10-census-${seed}.json`;
  // r1 establishment: end-of-run pantry breakdown by preservation state,
  // party roster, assignments, specialist roster, contest summary
  let pantryByState = null, partyFinal = null, asgFinal = null, specFinal = null;
  let pantryPieces = 0, pantryMaxPiece = 0; // r7 E4: granularity sanity
  // r7 E4 unit-honest: the atom is the unit (kcalEach per unit), not the entry
  // (r18 instrument parity — entries like Rice 200x65 are 65 small atoms).
  try {
    pantryByState = {};
    for (const it of ((Game.state.village || {}).pantry || [])) {
      const st = it.foodState || 'raw';
      const ke = it.kcalEach || 0, u = Math.max(1, Math.round(it.units || 1));
      const kcal = Math.round(ke * u);
      pantryByState[st] = (pantryByState[st] || 0) + kcal;
      pantryPieces += u;
      if (ke > pantryMaxPiece) pantryMaxPiece = ke;
    }
  } catch (e) {}
  try {
    const mems = Game.partyMembers ? Game.partyMembers() : [];
    partyFinal = { cap: (Game.partyCap ? Game.partyCap() : null), members: mems.map(id => vname(id)) };
  } catch (e) {}
  try {
    asgFinal = {};
    for (const [id, a] of Object.entries((Game.state.village || {}).assignments || {})) {
      const t = (a && a.task) || 'none';
      (asgFinal[t] = asgFinal[t] || []).push(vname(id));
    }
  } catch (e) {}
  try { specFinal = countSpecialists(); } catch (e) {}
  // r2: trapline + monster-codex telemetry — counts from the 300-event
  // telemetry ring plus full state reads (ring may roll; state is ground
  // truth). M1: player trap craft/set (ctx from the pinned policy) + NPC
  // npc_trap returns; M2: knowsSnare holders + snare_lesson/snare_overhear
  // events; M3: render/pemmican via line counts + pantry-by-state;
  // M4: codex entries with NPC-shared reports (killerTaleLog transcripts).
  let trapline = null;
  try {
    const tel = (Game.state && Game.state.telemetry) || [];
    const byType = {};
    for (const e of tel) { const t = e && e.type; byType[t] = (byType[t] || 0) + 1; }
    const tales = (Game.state && Game.state.killerTales) || [];
    const taleLog = (Game.state && Game.state.killerTaleLog) || [];
    const mx = (Game.state.codex && Game.state.codex.monsters) || {};
    const scholarId = (Game.state.scholar && Game.state.scholar.villagerId) || 'player';
    const entries = Object.entries(mx).map(([mid, e]) => {
      const kn = e.knowers || [];
      const npcKnower = kn.some(k => k && k !== scholarId && k !== 'player');
      return { mid, stage: e.stage || null, reported: !!e.reported, villageName: e.villageName || null, npcKnower, knowers: kn.length };
    });
    trapline = {
      byType,
      trapsCrafted: ctx.trapsCrafted || 0, trapsSet: ctx.trapsSet || 0, trapsWireSet: ctx.trapsWireSet || 0,
      trapCensusFinal: trapCensus(),
      codexEntries: entries,
      codexNPCShare: entries.length ? entries.filter(e => e.npcKnower).length / entries.length : null,
      killerTales: tales.map(t => ({ mid: t.mid, killer: vname(t.killer), day: t.day, told: !!t.told, played: !!t.played })),
      killerTaleLog: taleLog.slice(-10),
      metTrap: {
        trapEmojiLines: MET.trapEmojiLines, snareLines: MET.snareLines,
        trapCatchLines: MET.trapCatchLines, trapEmptyLines: MET.trapEmptyLines,
        snareTeachLines: MET.snareTeachLines, snareOverhearLines: MET.snareOverhearLines,
        killerTaleLines: MET.killerTaleLines, trapCraftLines: MET.trapCraftLines,
        preserveSmokeLines: MET.preserveSmokeLines, preserveRenderLines: MET.preserveRenderLines,
        preservePemmicanLines: MET.preservePemmicanLines,
      },
      // r5 fat-supply probe: ground truth for M1'/M2'/M7
      fatseek: {
        detours: MET.fatseekDetours || 0, searches: MET.fatseekSearches || 0,
        reads: MET.fatseekReads || 0, pitCrafts: MET.fatseekPitCrafts || 0,
        huntAttempts: MET.fatseekHuntAttempts || 0, hunts: MET.fatseekHunts || 0,
        maxRawFat: ctx._fatseekMaxFat || 0,
        pitRecipeFinal: (function () { try { return (((Game.state.codex || {}).recipes || {}).pit_trap || {}).level || 0; } catch (e) { return 0; } })(),
        rawFatFinal: (function () { let n = 0; try { for (const cont of [(Game.state.scholar || {}).inventory || [], (Game.prepStash ? Game.prepStash() : [])]) { for (const it of cont) if (it && it.foodKind === 'fat' && it.foodState === 'raw' && !Game.isSpoiled(it)) n += (it.units || 1); } } catch (e) {} return n; })(),
        renderedFatFinal: (function () { let n = 0; try { for (const cont of [(Game.state.scholar || {}).inventory || [], (Game.prepStash ? Game.prepStash() : [])]) { for (const it of cont) if (it && it.foodKind === 'fat' && it.foodState === 'rendered' && !Game.isSpoiled(it)) n += (it.units || 1); } } catch (e) {} return n; })(),
        pemmicanFinal: (function () { let n = 0; try { for (const cont of [(Game.state.scholar || {}).inventory || [], (Game.prepStash ? Game.prepStash() : [])]) { for (const it of cont) if (it && it.foodKind === 'meat' && it.foodState === 'pemmican' && !Game.isSpoiled(it)) n += (it.units || 1); } } catch (e) {} return n; })(),
        booksFound: (function () { let f = []; try { for (const it of ((Game.state.scholar || {}).inventory || [])) if (it && it.bookId) f.push(it.bookId); } catch (e) {} return f; })(),
      },
    };
  } catch (e) { trapline = { error: String(e && e.message || e) }; }
  let contestFinal = null;
  try {
    contestFinal = {
      held: (Game.state && Game.state.contestsHeld) || 0,
      pilotAired: !!(Game.state && Game.state.pilotAired),
      seen: Object.entries((Game.state && Game.state.contestsSeen) || {}).map(([k, v]) => `${k}x${v}`),
      contestDeaths: Game.state && Game.state.contestDeathsById,
    };
  } catch (e) {}
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, spawn, systemDay, systemFile, transcriptFiles, series, census, overAt,
    starvAutopsies,
    pantryByState, pantryPieces, pantryMaxPiece, partyFinal, asgFinal, specFinal, contestFinal,
    trapline, // r2: end-of-run trapline + codex telemetry (M1-M4)
    contestLog: MET.contestLog || [],
    corpseCensus,
    r10fights: FIGHTS.map(f => ({ day: f.day, n: f.n, monsterId: f.monsterId, monsterName: f.monsterName,
      arena: !!f.arena, rounds: f.rounds, decisions: f.decisions, distinctVerbs: f.distinctVerbs,
      villagerFighters: f.villagerFighters, playerInFight: !!f.playerInFight, outcome: f.outcome, fled: !!f.fled,
      deaths: f.deaths, corpseLooted: f.corpseLooted, logFile: f.logFile })),
    r10contests: CONTESTS.map(c => ({ day: c.day, n: c.n, id: c.id, name: c.name, kind: c.kind,
      pilot: !!c.pilot, participants: c.participants, choices: c.choices, outcome: c.outcome,
      lines: (c.lines || []).length, logFile: c.logFile })),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    ctx: Object.fromEntries(Object.entries(ctx).filter(([k]) => !k.startsWith('_'))),
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | systemDay=${systemDay} | over=${overAt || 'no'} | transcripts=${transcriptFiles.length}`);
  return { seed, spawn, systemDay, censusPath, transcriptFiles, series, overAt };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  // (favor stage-line cross-run template scan removed with the dead harvest —
  // the want object carries no .line field; checked by grepping transcripts)
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  console.log('SENSE METRICS: ' + JSON.stringify(MET, null, 1));
  console.log('WANT ENGAGEMENT: ' + JSON.stringify(MET.wants));
  for (const r of results) {
    console.log(`seed ${r.seed}: spawn=${r.spawn && r.spawn.scholarName} | systemDay=${r.systemDay} | over=${r.overAt || 'no'} | census=${r.censusPath}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
