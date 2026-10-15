#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R6 — the FAT SUPPLY question, probe fixed.
//   R5 executed 2026-10-15 (4 seeds x 40d) but its FATSEEK ruin-detour guard
//   ("at most every 3 days") was DEFEATED by event-driven day jumps: the guard
//   compared game-days, but a detour's own fights/contests advance the clock
//   >=3 days, so the next beat re-armed immediately — 9-27 detours/seed instead
//   of ~7, dragging the scholar wild (seed 103: kcal 14, hp 60) and distorting
//   the probe. R6 gates the detour on the harness loop-iteration (one per
//   driven day) instead of the game-day float, restoring the intended cadence.
//   R6's question is the guard itself: detours/seed <= ceil(DAYS/3)+1 with the
//   probe otherwise unchanged, on a 2-seed x 20d verification pilot.
//   (M1' from R3's metric review, authorized there — carried, not re-asked.)
//
// Pre-registered (docs/MEASUREMENT.md §§9-12, 14):
//   Question: does the iteration-gated FATSEEK detour hold the intended
//     ~1-per-3-days cadence (detours <= ceil(DAYS/3)+1 per seed) while the
//     rest of the probe (book search, handbook read, pit craft, hunts)
//     still functions?
//   Interesting: guard holds + probe functions = fix verified, r7 can re-ask
//     M1' cleanly; guard still defeated = the defeat mechanism is elsewhere.
//   Seeds: 61, 82 (r5's pair). 20d verification pilot, death-aware.
//   Policy: competent, PINNED (unchanged). Knobs: FATSEEK=1, RENDER_LADDER=1,
//     INVITE_PARTY=1, FAVOR_ACCEPT=1, STALL_BREAK=1.
//   Binding metrics: G1 detours/seed <= ceil(20/3)+1 = 8; G2 searches>0 (probe
//     alive); G3 scholar never dragged below 500 kcal by a detour day
//     (no repeat of the 103 kcal-14 incident).
//   (R5's full header retained below for provenance.)
//
// Pre-registered (docs/MEASUREMENT.md §§9-12, 14):
//   Question: R3/R4 proved the render->pemmican ladder machinery end to end
//     (51/51 proof) but measured 0 raw-fat slabs on 8/8 seeds — the knob
//     never got its precondition. Can a deliberately fat-seeking player
//     put raw fat in hand in the establishment window, via (a) ruin
//     scavenging for the Trapper Handbook (the pit_trap recipe's only
//     fiction channel: readBook grants L3) then pit-trap craft/set, and
//     (b) opportunistic wild_boar/javelina hunts? If fat flows, does the
//     ladder then fire end to end? The pinned competent policy never
//     searches ruins (excluded as forage targets), never crafts pits, never
//     hunts — so this run adds the FATSEEK harness knob (harness-level
//     beats, policy PINNED, same class as R3's RENDER_LADDER probe).
//   Interesting: raw-fat slabs >0 on >=1 seed + ladder firing = the R3/R4
//     open item CLOSED; silence with the knob ON localizes the bind
//     (book luck? hunt risk? boar absence? pit catch odds?) precisely.
//   Seeds: 61, 82, 103, 124 (same as R1-R4, comparability). Pilot 40d,
//     death-aware (stop at Game.over; +10d tail max).
//   Policy: competent, PINNED (unchanged). Harness knobs: FATSEEK=1 (new:
//     ruin book-search detours + handbook read + pit craft + opportunistic
//     fatbearer hunts), RENDER_LADDER=1 (proven), INVITE_PARTY=1 (R1),
//     FAVOR_ACCEPT=1 (R10), STALL_BREAK=1 (R3).
//   Binding metrics: M1' fat supply: raw-fat slabs in player hands >0 on
//     >=1 seed (d14-40); M2' ladder: render batches >0 on >=1 seed GIVEN
//     fat, pemmican bars >=1 if render knowledge + sets; M3 traps set (any
//     path) >0 on >=2 seeds; M4 codex tale-share >=25% on >=1 seed; M5
//     >=2/4 villages alive at day 40, pantry>0; M6 >=20 full transcripts
//     sense-read, 0 senseless flags; M7 probe: handbook found/read on >=1
//     seed via FATSEEK (book-channel dormancy under the pinned policy is
//     measured, not fixed).
//   Canon read: CANON.md, PRESERVATION.md (ladder: cleaned<cooked<smoked<
//     rendered<pemmican; blind penalties teach), BEAR.md (fat sources:
//     boar 3 / javelina 2 / bear 6; L4 rendering knowledge; trichinosis),
//     CONTESTS.md, MONSTER-WAVES.md. Pit trap: 2 sticks, 96 ticks to dig,
//     4 uses, catches boar/deer/raccoon/opossum, 40%/day on game-bearing
//     ground; boar retrieval beat is L3-gated (spear from above, 10%
//     goring). NPCs cannot supply fat (TRAPS returns are snared meat only;
//     no NPC hunt objectives exist) — the fat line is player-side only.
//
// Usage: node scripts/journey-establishment-r6-20261015.js
//        SEEDS=61,82 DAYS=40 node scripts/journey-establishment-r6-20261015.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103, 124]);
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
  const fp = `/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-15/journey-establishment-r6-transcript-${seed}-day${day}.txt`;
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
  console.log(`\n########## SEED ${seed} ##########`);
  const lg = await loadGame({ seed });
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
  try {
    const _sc = Game.startCombat.bind(Game);
    Game.startCombat = function (...a) {
      MET.fightsSeen++;
      if (_spamRun > 0) {
        MET.feastedSpamFights++;
        if (_spamRun > MET.feastedSpamMaxPerFight) MET.feastedSpamMaxPerFight = _spamRun;
        _spamRun = 0;
      }
      return _sc.apply(this, a);
    };
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
        systemFile = `/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-15/journey-establishment-r6-system-${seed}.txt`;
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
      if (Game.over) { brokeEarly = true; break; }
      try { Game.doAction('wait'); } catch (e) { console.log('wait ERROR: ' + (e && e.message)); }
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) { brokeEarly = true; break; }
    }
    if (brokeEarly) break;
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily ERROR: ' + (e && e.message)); }
    driveFights(Game, competent, ctx);
    driveContests(Game, competent, ctx);
    ladderBeat('dusk');
    fatseekBeat('dusk', ctx);
    try { Game.sleep(); } catch (e) { console.log('sleep note: ' + (e && e.message)); }
    driveContests(Game, competent, ctx);
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

  const census = buildCensus();
  const censusPath = `/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-15/journey-establishment-r6-census-${seed}.json`;
  // r1 establishment: end-of-run pantry breakdown by preservation state,
  // party roster, assignments, specialist roster, contest summary
  let pantryByState = null, partyFinal = null, asgFinal = null, specFinal = null;
  try {
    pantryByState = {};
    for (const it of ((Game.state.village || {}).pantry || [])) {
      const st = it.foodState || 'raw';
      const kcal = Math.round((it.kcalEach || 0) * (it.units || 1));
      pantryByState[st] = (pantryByState[st] || 0) + kcal;
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
    pantryByState, partyFinal, asgFinal, specFinal, contestFinal,
    trapline, // r2: end-of-run trapline + codex telemetry (M1-M4)
    contestLog: MET.contestLog || [],
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
