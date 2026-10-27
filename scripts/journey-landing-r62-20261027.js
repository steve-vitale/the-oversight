// Journey leg: LANDING (days 1-28) R62 -- MONSTER-MEAT TAIL (Steve 2026-10-27:
// villagers should test and cook monster meat; measure haul->reveal->test->cook
// before landing anything) + buffer-thin recurrence + held-invite / stay-green /
// succession / contest-ledger watches. Copied from r61 (2026-10-27); changes:
// seeds 673-676, OUTDIR landing-r62. All other logic UNCHANGED.
// Pre-registered: hidden_files/evidence/2026-10-27/journey-landing-r62-prereg.md
// Journey leg: LANDING (days 1-28) R60 -- REPLENISHMENT TRACE (r59 observation 2:
// 662's d19->d21 +10,840 kcal jump with no kill story) + revised horizon verdict
// (buffer-thin = watch; HUNGRY only with starvation death or scholar-kcal slide)
// + held-invite / stay-green / succession / contest-ledger watches.
// Copied from r59 (2026-10-27); changes: seeds 665-668, OUTDIR landing-r62,
// analyzer gains the R60 REPLENISHMENT TRACE block below (biggest series gain
// per seed with pieces/produced/netBanked/kills on its days).
// Pre-registered: hidden_files/evidence/2026-10-27/journey-landing-r62-prereg.md
// ESTABLISHMENT FED? (r58's carried blank: seed 657 collapsed 8400->0 kcal d24-28
// and starved 3 villagers d27-28 while the other three villages held 18k-32k.
// Question: one-seed outlier or recurring collapse? Fresh seeds 661-664.
// Pre-registered gates: FED = final pantry >= 2000 kcal/person (one day's need).
// >=2/4 HUNGRY = PATTERN (lever-work candidate); 0-1/4 = outlier shape, watch.
// Winddown probe is CLOSED (r58 GO 4/4 surfacing, 3/3 covered 'more') and runs
// here as a watch only. Q-B held-invite streak (31 after r58), stay-green,
// succession, and contest ledger also watches. Driver otherwise UNCHANGED
// from r58 (same competent policy, FAVOR_ACCEPT ON, 28-day horizon).
// (r57 SPLIT: surfacing GO 4/4, 'more'-offer gate NO-GO on its letter — 0/4 surfaced
// menus offered 'more' because every surfaced menu inherited a phase-1 thread
// (personal/want/small) and convoThreadHasMore covers goal/past/plans only.
// Two mechanisms: (1) reserve-then-steer guarantees uncovered surfacing —
// phase 2 never takes a covered ask because it never opens a subject menu;
// (2) covered asks strand — offered on a subject page, the picker pages away.)
// Copied from r57 (2026-10-27); changes: seeds 661-664, OUTDIR landing-r62,
// (a) covered-ask-before-page-turn in phase 1 (fires only when NO phase-1 ask
// is offered on the page — never steals a live uncovered thread),
// (b) ONE phase-2 dlg:subject opening per sitting when the live thread is
// uncovered (page turns stay blocked in phase 2), (c) autopsy records
// deathLinesNamed so the analyzer can adjudicate recycled-TV-line joins.
// All other logic UNCHANGED.
// Pre-registered: hidden_files/evidence/2026-10-27/journey-landing-r62-prereg.md
// Journey leg: LANDING (days 1-28) R57 -- WIND-DOWN PROBE v3: TURN BUDGET
// (r56 NO-GO was probe turn-starvation, not a game defect: 1/4 sittings surfaced;
// budgets 5-6 need more than 20 turns for navigation + discovery + queue + drain.)
// Copied from r56 (2026-10-27); changes: seeds 653-656, OUTDIR landing-r62,
// WD sitting cap 20->30, page-turn cap 8->12, queued-navigation guard (no new
// dlg:subject opening and no new menu:more page turn once winddown is queued;
// drain held beats with goon / covered asks only). All other logic UNCHANGED.
// Pre-registered: hidden_files/evidence/2026-10-27/journey-landing-r62-prereg.md
// Journey leg: LANDING (days 1-28) R56 -- WIND-DOWN PROBE v2: PAGE-HUNTING FIX
// (r55's 1/4 miss, seed 648 David) + stay-green / held-invite watch /
// succession watch. Copied from r55 (2026-10-27); changes: seeds 649-652,
// OUTDIR landing-r62, TOPIC_SIT page-turn fix (below), wdProbe samples carry
// pageTurns + page3 visits. All other logic UNCHANGED.
// R56 PAGE FIX (corrected after pilot-1): r55's David sitting (648 day 10)
// reached winddown on a personal thread and its menu was [leave, agree] —
// correct for a personal thread (convoThreadHasMore covers goal/past/plans
// only). Pilot-1 first tried "consecutive menu:more while the label changes":
// WRONG — David's first opening has only 2 pages, so it cycled (1/2->2/2->
// 1/2...), burned all 8 page turns and the 20-turn sitting, and winddown
// never surfaced (goal appeared only at turn 20, after discovery unlocked it).
// Correct rule (DRIVER-ONLY, zero src/js): one full sweep per subject
// opening — take menu:more only to a page not yet visited this opening —
// then fall through to asks, which drive discovery; page 3 is reached
// whenever an opening actually has 3 pages. Proof: same-seed pilot,
// SEEDS=648 rerun vs the r55 648 transcript (pilot-1 failed its gate and
// is recorded in the prereg, not hidden).
// Journey leg: LANDING (days 1-28) R54 -- WIND-DOWN 'MORE' FIX (r53 blank) +
// scholar-succession latency 2-4d / horizon-edge hunt + held-invite watch +
// stay-green. Copied from r53 (2026-10-25); changes: seeds 641-644,
// OUTDIR landing-r54, winddown-'more' instrument (wdMorePicks/wdMoreEmpty:
// a 'more' pick taken while windingDown is armed, scored post-fix —
// r53's 638-day-5 empty beat must not recur), all other logic UNCHANGED.
// The fix itself lives in src/js/conversation.js (convoTurn tail: the
// grace beat returns as the closing line); proof:
// scripts/test-r54-winddown-more-20261025.js (4/4 GREEN, 2/4 RED pre-fix).
// Journey leg: LANDING (days 1-28) R53 -- TOPIC PROBE for the 'more' continuer
// (one designated sitting per seed asks topic asks first, then takes 'more')
// + scholar-succession latency 2-4d / horizon-edge hunt + held-invite watch +
// Q-D reworded per r51 metric review (0 UNEXPLAINED starvation deaths).
// Copied from r51 (2026-10-25); all other logic UNCHANGED.
// Journey leg: LANDING (days 1-28) R53 -- SCHOLAR-MORTALITY WATCH WIDENED
// (+4-day mantle window, 28-day horizon tail) + FULL-LENGTH DEPTH SAMPLES +
// HELD-INVITE WATCH (still owed) + stay-green/contest-ledger watches carried.
// Copied from r50 (2026-10-25); classifier logic UNCHANGED. Only changes:
// seeds 629-632, OUTDIR landing-r53, depth-sample slices 160->1000 chars.
// Scholar-succession logic lives in the ANALYZER (mantleLog + deaths already
// in the census); the driver is unchanged apart from the items above.
// Journey leg: LANDING (days 1-24) R50 -- DEPTH-FIZZLE REVISION + DEATHS SPLIT + CONTEST-DEATH PROOF HUNT.
// Carried from r47 (2026-10-24): the game speaks invites before their menus, but the
// driver printed r0.line only, dropping the second opener beat from printed transcripts.
// R48 replaces sayThem(r0.line) with a loop over the startConvo transcript's THEM lines,
// so a sense-read of a printed transcript sees what the player sees. Contest ledger,
// fixed contest-death join, betrayal audit and stay-green watches all carried from r47.
// (days 15/18, extended follow-up) but the driver surfaced no contest play:
// no contest name, participants, phases, or fairness read. This run adds a
// contest ledger (telemetry contest_fired/contest_end + a live activeContest
// participant watch + TV narration excerpts) and a contest-death autopsy
// joining every death to its contest span. Binding gates: 0 contest deaths
// with MISSING context; every contest_end matched to a contest_fired
// (modulo a contest still open at day 24); 0 contests fired by day 24 is
// VACUOUS, not GO (the pilot-episode guarantee should fire one by day 21).
// HORIZON: 24 days, deliberate pre-registered extension for this question
// only (contests unlock ~day 14-21; a 14-day leg cannot see it). Run with
// DAYS=24. Stay-green (carried): System contact <=d10; theft 0;
// self-sufficiency >=0.70; plenty-voice present; 0 fizzles / 0 empty beats
// (r42 thread fixes). Starvation-while-away (r45 instruments) and grief
// registration (r44 GO) stay as watches, not the question.
// INFRA: worktree registration took ~5 min (git worktree add checkout under load;
// index.lock present throughout, completed clean, no ref surgery). Outputs route
// to the goal evidence dir, never /tmp. Never pass probe flags on a multi-seed
// invocation. Pre-registered: hidden_files/evidence/2026-10-27/journey-landing-r62-prereg.md
// (docs/MEASUREMENT.md sections 9-12, 14 -- binding).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [673, 674, 675, 676]);
const DAYS = parseInt(process.env.DAYS || '14', 10);
const FAVOR_ACCEPT = process.env.FAVOR_ACCEPT !== '0'; // R15: default ON —
// the landing leg's KIN question needs the seek_taken commit path exercised
// (takenPromises + podRemember). Set FAVOR_ACCEPT=0 to get r14 behavior.
const OUTDIR = process.env.OUTDIR ||
  path.join(process.env.HOME || '/home/hatch',
    'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-27/landing-r62');
try { fs.mkdirSync(OUTDIR, { recursive: true }); } catch (e) {}

// ---- text-stream capture (loadGame silences Game.say; we keep the silence) ----
let capture = [];
let _lastArmText = null;
let _spamRun = 0; // feasted per-strike lines since last fight start
// R22: monster-meat pipeline scans — the wild arc (haul → try → reveal).
// Lines fire on the narration stream; only presence-gated lines appear.
const FLESH_HAUL_RE = /Unknown flesh, heading home/i;
const FLESH_DEPOSIT_RE = /unknown flesh in the pantry/i;
const FLESH_EXPERIMENT_RE = /sets aside time with (?:the )?/i;
// r23: fixed — the tester's name sits between the comma and "tells the
// fire" ("It's food," Anas tells the fire), which the r22 alternation missed
const FLESH_REVEAL_RE = /It's food,.*tells the fire/i;
const FLESH_POISON_RE = /NOT food,.*Poison|tongue goes numb/i;
const FLESH_ROT_RE = /too far gone|Not touching that/i;
function fleshScan(line) {
  const s = String(line || '');
  if (FLESH_HAUL_RE.test(s)) { MET.fleshHaulsSeen++; (MET.fleshHaulSeenLines = MET.fleshHaulSeenLines || []).push(s.slice(0, 260)); }
  if (FLESH_DEPOSIT_RE.test(s)) MET.fleshDeposits++;
  if (FLESH_EXPERIMENT_RE.test(s)) { MET.fleshExperiments++; (MET.fleshExperimentLines = MET.fleshExperimentLines || []).push(s.slice(0, 260)); }
  if (FLESH_REVEAL_RE.test(s)) MET.fleshReveals++;
  if (FLESH_POISON_RE.test(s)) MET.fleshPoisonVerdicts++;
  if (FLESH_ROT_RE.test(s)) MET.fleshRotLines++;
}
function feastScan(line) {
  const s = String(line || '');
  fleshScan(s);
  if (FEAST_ARM_RE.test(s)) {
    MET.armMessages++;
    if (_lastArmText !== null && s === _lastArmText) MET.armVerbatimRepeats++;
    _lastArmText = s;
  }
  if (FEAST_SPAM_RE.test(s)) { MET.feastedSpamLines++; _spamRun++; }
  if (FEAST_DRAW_RE.test(s)) MET.feastDraws++;
  if (VILLAGER_FEAST_PUSH_RE.test(s)) MET.villagerFeastPush++;
  if (/unknown flesh in the pantry/i.test(s)) MET.unknownFleshHauls++;
}
// R30: death-liturgy + theft rate-bar scans (64737ff99, e89c294b9)
const HEADCOUNT_CODA_RE = /The village is \d+ now/i;
// r34: tightened to the exact villageEvent('death') line — the ambientSocial
// grief pool has its own "The fire is quiet today. Nobody's talking much."
// echo (grief>0), which is a different beat by design, not a double fire.
const GRIEF_BEAT_RE = /Nobody's talking much\. The fire feels smaller tonight\./i;
const DEATH_BEAT_RE = /💀/;
const THEFT_ACCUSE_RE = /caught red-handed/i;
function r34Scan(line) {
  const s = String(line || '');
  if (HEADCOUNT_CODA_RE.test(s)) { MET.headcountCodas++; (MET.headcountCodaLines = MET.headcountCodaLines || []).push(s.slice(0, 200)); }
  if (GRIEF_BEAT_RE.test(s)) { MET.griefBeats++; (MET.griefBeatLines = MET.griefBeatLines || []).push(s.slice(0, 200)); }
  if (DEATH_BEAT_RE.test(s)) { (MET.deathLineSamples = MET.deathLineSamples || []).push(s.slice(0, 240)); }
  if (THEFT_ACCUSE_RE.test(s)) { MET.caughtRedHanded++; (MET.caughtRedHandedLines = MET.caughtRedHandedLines || []).push(s.slice(0, 200)); }
}
// R36: plenty-deprioritization voice — one 🍽️ line/day when the throttle engages.
// R36b: day-attributed samples (d<day>:) so within-village repeats can be
// checked against the design claim (period-12 per-speaker key, no <4-day
// verbatim loop, no same-day collision).
const PLENTY_VOICE_RE = /🍽️ /;
function plentyScan(line) {
  const s = String(line || '');
  if (PLENTY_VOICE_RE.test(s)) { MET.plentyVoiceLines++; (MET.plentyVoiceSamples = MET.plentyVoiceSamples || []).push(`d${gday()}: ` + s.slice(0, 200)); }
}
function cap(line) {
  if (line == null) return;
  const s = String(line);
  feastScan(s);
  waterScan(s);
  takeScan(s);
  r34Scan(s);
  plentyScan(s);
  pipeScan(s); // R38: text-pipe audit on the full narration stream (hunt beats, system lines)
  r39Scan(s); // R39: night beats + laugh voices + seek suggestions on the narration stream
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  // r9: favor kept/broken narration (game.js promise resolution lines)
  // r10: also stash the lines so the evidence note can quote them
  if (/You kept your word/i.test(s)) { MET.favorKept++; (MET.keptLines = MET.keptLines || []).push(s.slice(0, 220)); }
  if (/Promises rot/i.test(s)) { MET.favorBroken++; (MET.brokenLines = MET.brokenLines || []).push(s.slice(0, 220)); }
}

// ---- sense metrics ----
const MET = {
  sittings: 0, reofferFlags: 0, npcQuestions: 0,
  wants: {},
  justSaid: 0, maras: 0,
  commaStutter: 0, punctStutter: 0,
  lureOffered: 0, lureSpoken: 0, lureGesture: 0, lureSilent: 0,
  betrayalOfferSamples: [], betrayalOfferCount: 0,
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
  // r18: haul-unrevealed substrate
  unknownFleshHauls: 0,
  // r9 gossip/information telemetry
  gossipAsks: 0, gossipRenders: 0, gossipNoNews: 0,
  // R27: r28 gossip-resume in-wild (mirrors the r28 pilot's resume-priority
  // driver pick). threadGossip = 'alive:thread:gossip' choice offered;
  // resumes = taken; stalls = NPC resume line is the generic echo
  // ("we never did get back to that" / "we never finished") with no
  // gossip beat — the r28-stall signature the r28 fix removes.
  gossipThreadOffered: 0, gossipResumes: 0, gossipResumeStalls: 0,
  gossipResumeLines: [],
  rumorPlanted: 0, tellbeastAsks: 0, namebeastAsks: 0,
  favorPromised: 0, favorKept: 0, favorBroken: 0, favorAccepted: 0,
  // R14 survival-basics telemetry
  dehydratedWarnings: 0, starvingWarnings: 0, rawWaterLines: 0,
  waterFills: 0, havenFills: 0, wildFills: 0, boils: 0,
  deathMislabels: 0,
  // R15: the Taking (KIN.md) — System beats vs villager beats
  takingLines: 0, takingSystemLines: 0, takingVillagerLines: 0,
  // R22: monster-meat pipeline (Steve 2026-10-16) — the wild arc:
  // carcass-haul of unknown flesh → try/taste → teach → reveal.
  // villager-side haul lines fire only when the player is present at the
  // kill site; the pantry-deposit line fires at haven.
  fleshHaulsSeen: 0,          // "Unknown flesh, heading home" (kill-site, player present)
  fleshDeposits: 0,           // "unknown flesh in the pantry" (haven deposit)
  fleshExperiments: 0,       // a villager ran the cautious protocol on flesh
  fleshReveals: 0,           // verdict "It's food" (non-toxic)
  fleshPoisonVerdicts: 0,    // verdict "NOT food / Poison" (toxic)
  fleshRotLines: 0,          // "too far gone" / "Not touching that" at a carcass
  // R30: death-liturgy (64737ff99) + theft rate-bar (e89c294b9) instruments
  headcountCodas: 0,         // "The village is N now." — old coda, expect 0
  griefBeats: 0,             // villageEvent('death') grief-beat lines (dedupe target: 1/death)
  caughtRedHanded: 0,        // "caught red-handed" — trust-nick spam, expect 0 on honest eating
  deathLineSamples: [],      // stashed death-beat lines for sense-reads
  fleshHaulSeenLines: [], fleshExperimentLines: [],
  // R36: plenty-deprioritization (df66ebaff) + fallen memorial-roll audit (b5cb18d53)
  plentyVoiceLines: 0, plentyVoiceSamples: [],
  fallenDupes: 0, fallenDupeSamples: [],
  // R38: text-pipe audit (rogue P0-2/P0-7 + Game.indefArt 5fb1ddb6e)
  textPipeWarns: 0,          // "[text]" console warnings (loud conjugation/slot failures)
  textPipeWarnSamples: [],
  textPipeCandidates: 0,     // a/an mismatches, acronym mangles, unfilled slots
  textPipeCandidateSamples: [],
  // R39: Roguelike-P1 night beats + dormant-motivation wiring in act 0
  objectivesWarns: 0, objectivesWarnSamples: [],
  nightfallWarns: 0, nightfallWarnSamples: [],
  debriefLines: 0, debriefLineSamples: [],
  graveMarkerLines: 0, graveMarkerSamples: [],
  laugh_mutiny: 0, laugh_borrowed: 0, laugh_honest: 0,
  laughBackToBack: 0, laughLineSamples: [], _lastLaughVoice: null,
  seekSuggestLines: 0, seekSuggestSamples: [],
  // R41: day-1 nudge fire sensor — the talkRequests-at-d14 census field is
  // blind BY DESIGN (expireTalkRequests prunes delivered records after
  // ~3 days, so the Talk badge never pings ancient history). Scan the
  // narration stream for the nudge's signature line instead.
  dayOneNudgeFired: 0, dayOneNudgeDay: null, dayOneNudgeSample: '',
};
function bump(obj, k) { obj[k] = (obj[k] || 0) + 1; }
const FEAST_ARM_RE = /Your gifts are not mastered — but they are lived-in/i;
const FEAST_SPAM_RE = /^FEASTED ×[\d.]+: the feast was the weapon\.$/;
const FEAST_DRAW_RE = /followed the feast here|The .* is circling the edge of the light/i;
const VILLAGER_FEAST_PUSH_RE = /should (host|throw|have) a feast|feast (tonight|soon)|let'?s (host|throw|have) a feast/i;
// R14: water-pressure scan — the survival-basics leg needs to see risk lines
const DEHYDRATED_RE = /^DEHYDRATED:/i;
const STARVING_WARN_RE = /^STARVING:/i;
const RAW_WATER_RE = /Drank risky water|Stomach cramps within the hour|Boil it next time/i;
// R15: Taking scan — KIN.md canon. System beats carry the boring-half line
// (game.js 'watched'/'pods' beats); villager-side references to taken family
// are the leg's question. Samples stashed per source class.
const TAKING_RE = /boring half|NAPPING|your relatives were probably|stasis pods?|little ones are (napping|gone)|taken (half|family|kin)|missing (family|kin|my |his |her |their )|took them|disappeared (them|at the start)|gone from (the|my|his|her)/i;
const TAKING_SYS_MARK_RE = /boring half|NAPPING|your relatives were probably/i;
function takeScan(line) {
  const s = String(line || '');
  if (!TAKING_RE.test(s)) return;
  MET.takingLines++;
  const sample = s.slice(0, 200);
  if (TAKING_SYS_MARK_RE.test(s)) { MET.takingSystemLines++; (MET.takingSystemSamples = MET.takingSystemSamples || []).push(sample); }
  else { MET.takingVillagerLines++; (MET.takingVillagerSamples = MET.takingVillagerSamples || []).push(sample); }
}
function waterScan(line) {
  const s = String(line || '');
  if (DEHYDRATED_RE.test(s)) { MET.dehydratedWarnings++; (MET.dehydratedLines = MET.dehydratedLines || []).push(s.slice(0, 140)); }
  if (STARVING_WARN_RE.test(s)) { MET.starvingWarnings++; (MET.starvingLines = MET.starvingLines || []).push(s.slice(0, 140)); }
  if (RAW_WATER_RE.test(s)) { MET.rawWaterLines++; (MET.rawWaterSamples = MET.rawWaterSamples || []).push(s.slice(0, 160)); }
}

// comma-closer stutter; punct: ?! doubles / 4+ dots (literary "..." allowed)
const COMMA_STUTTER_RE = /[.!?]["\u201d]?\s*,/;
const PUNCT_STUTTER_RE = /([!?])\1|\.{4,}/;
// R38: text-pipe audit scan (rogue P0-2/P0-7 text.js + Game.indefArt).
// The module fails loud via [text] warnings (hooked below); this scan
// catches what it might pass through: a/an mismatches on rendered lines,
// the mangled-acronym class (old live bug: "eSL teacher"), and unfilled
// {slots} leaking into display text. Candidates are logged; the run note
// adjudicates each — GO = 0 pipe-introduced errors after review.
// NOTE: "a UI" is CORRECT (UI = "you-eye"); the exception list covers it.
const AAN_VOWEL_EXCEPT_RE = /^(?:one|once|unicorn|unicorns|universe|universes|user|users|usual|european|union|unions|use|uses|ewe|ewes|eu|ui)/i;
const AAN_AN_EXCEPT_RE = /^(?:hour|hours|honest|honor|honors|honour|honours|heir|heirs|herb|herbs)/i;
const PIPE_MANGLE_RE = /[a-z][A-Z]{2,}/; // eSL, iOS-class: lowercase lead + 2+ caps
const UNFILLED_SLOT_RE = /\{[A-Za-z_]+\}/;
function pipeScan(s) {
  const flags = [];
  const re = /\b(a|an)\s+([A-Za-z][A-Za-z'\-]*)/g;
  let m;
  while ((m = re.exec(s))) {
    const art = m[1], low = m[2].toLowerCase();
    const vowelOnset = /^[aeiou]/.test(low) && !AAN_VOWEL_EXCEPT_RE.test(low);
    const anOnset = AAN_AN_EXCEPT_RE.test(low);
    if (art === 'a' && (vowelOnset || anOnset)) flags.push('a/an: "' + art + ' ' + m[2] + '"');
    else if (art === 'an' && !vowelOnset && !anOnset) flags.push('a/an: "' + art + ' ' + m[2] + '"');
  }
  if (PIPE_MANGLE_RE.test(s) && !/\b(e\.g\.|i\.e\.)/.test(s)) flags.push('acronym-mangle?');
  const slot = s.match(UNFILLED_SLOT_RE);
  if (slot) flags.push('unfilled ' + slot[0]);
  if (flags.length) {
    MET.textPipeCandidates++;
    (MET.textPipeCandidateSamples = MET.textPipeCandidateSamples || []).push('[' + flags.join('; ') + '] ' + s.slice(0, 200));
    return '!! TEXTPIPE CANDIDATE [' + flags.join('; ') + ']: ' + s.slice(0, 140);
  }
  return null;
}
// R38: text-pipe loud-failure capture — Text.warnOnce fires console.warn on
// conjugation failures and unfilled slots. sim-harness only silences
// console.log, so hooking warn here counts them per seed (one process/seed).
// R39: also capture [objectives] (dormant-motivation wiring 9cf62423e) and
// [nightfall] (debrief 358a737d0) loud failures — same hook, own counters.
(function hookTextWarns() {
  const _warn = console.warn;
  console.warn = function () {
    const s = Array.prototype.map.call(arguments, String).join(' ');
    if (/^\[text\]/.test(s)) {
      MET.textPipeWarns++;
      (MET.textPipeWarnSamples = MET.textPipeWarnSamples || []).push(s.slice(0, 220));
    }
    if (/^\[objectives\]/.test(s)) {
      MET.objectivesWarns++;
      (MET.objectivesWarnSamples = MET.objectivesWarnSamples || []).push(s.slice(0, 220));
    }
    if (/^\[nightfall\]/.test(s)) {
      MET.nightfallWarns++;
      (MET.nightfallWarnSamples = MET.nightfallWarnSamples || []).push(s.slice(0, 220));
    }
    return _warn.apply(console, arguments);
  };
})();
// R39: Roguelike-P1 night beats + dormant-motivation wiring in act 0.
// The debrief line always opens "The fire burns low." (journal.js
// nightfallDebrief); the grave line is "The village raises a marker by the
// fire — <name>, day <d>. <cause>. A place to stand." (graves.js
// createGrave). Laugh deeper voices keyed by their signature fragments
// (da247ae44: 3-voice rotation of q_laugh deeper). Aid-quest learn
// suggestions render 'learn one of: <gaps> — <SEEK_HOW>' (safetynets.js).
const DEBRIEF_RE = /^The fire burns low\./;
const GRAVE_MARKER_RE = /raises a marker by the fire/;
const LAUGH_VOICES = [
  { key: 'mutiny', re: /Laughter's a mutiny/ },          // v1 original
  { key: 'borrowed', re: /borrow it/ },                   // v2 old-world door
  { key: 'honest', re: /most honest thing I do all day/ }, // v3 performance
];
const SEEK_SUGGEST_RE = /learn one of:/;
function r39Scan(line) {
  const s = String(line || '');
  if (DEBRIEF_RE.test(s)) {
    MET.debriefLines++;
    (MET.debriefLineSamples = MET.debriefLineSamples || []).push(`d${gday()}: ` + s.slice(0, 220));
  }
  if (GRAVE_MARKER_RE.test(s)) {
    MET.graveMarkerLines++;
    (MET.graveMarkerSamples = MET.graveMarkerSamples || []).push(`d${gday()}: ` + s.slice(0, 220));
  }
  for (const v of LAUGH_VOICES) {
    if (v.re.test(s)) {
      MET['laugh_' + v.key]++;
      if (MET._lastLaughVoice === v.key && MET._lastLaughVoice != null) MET.laughBackToBack++;
      MET._lastLaughVoice = v.key;
      (MET.laughLineSamples = MET.laughLineSamples || []).push(`d${gday()}: ` + s.slice(0, 220));
      break;
    }
  }
  if (SEEK_SUGGEST_RE.test(s)) {
    MET.seekSuggestLines++;
    (MET.seekSuggestSamples = MET.seekSuggestSamples || []).push(`d${gday()}: ` + s.slice(0, 220));
  }
}
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
  // r26: a villager can genuinely be named Mara (seed 97) — only flag the
  // old phantom-person bug when no roster member carries the name.
  if (/Mara/.test(s) && !rosterHasFirstName('Mara')) { MET.maras++; return '!! PHANTOM "Mara"'; }
  if (COMMA_STUTTER_RE.test(s)) { MET.commaStutter++; return '!! COMMA-CLOSER STUTTER: ' + s.slice(0, 120); }
  if (PUNCT_STUTTER_RE.test(s) && !/^\.*$/.test(s)) { MET.punctStutter++; return '!! PUNCT STUTTER: ' + s.slice(0, 120); }
  if (THIRDPERSON_FAVOR_RE.test(s)) { MET.thirdPersonFavorHead++; return '!! THIRD-PERSON FAVOR HEAD: ' + s.slice(0, 120); }
  const pipe = pipeScan(s); // R38: text-pipe audit on every THEM line
  if (pipe) return pipe;
  return null;
}

// ---- helpers ----
let Game = null;
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } }
// r26: name-aware phantom-Mara guard — a real villager named Mara must not
// trip the old phantom-person detector.
function rosterHasFirstName(first) {
  try {
    const roster = (Game.state.village && Game.state.village.roster) || [];
    for (const id of roster) {
      const p = person(id);
      const nm = (p.name || '') + ' ' + vname(id);
      if (new RegExp('\\b' + first + '\\b', 'i').test(nm)) return true;
    }
  } catch (e) {}
  return false;
}
function gday() { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }

const DEEPEN = ['dlg:help', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy'];
let lastPickId = null; // harness hygiene: don't hammer the same deepen choice twice running
let pageVisited = null; // R56b: subject-menu pages already visited in this opening (page 1 on entry)
// R36 NV_PROBE: deliberate nonverbal sit flag (set by runConversation).
let NV_SIT = false, NV_VID = null;
let TOPIC_SIT = false; // R53: one designated sitting per seed probes topic threads
let WD_SIT = false; // R55: one designated sitting per seed probes the winddown menu
let WD_QUEUED = false; // R55d: winddown beat queued this turn (phase-2 steering)
let WD_LIVE_THREAD = null; // R58: convo thread at the current turn (set by the loop before pickChoice)
let wdPhase2SubjectOpened = false; // R58: phase-2 subject opening used this sitting (once max)
const WD_COVERED_THREADS = ['goal', 'past', 'plans']; // R58: threads convoThreadHasMore covers (fears only via topic2)
const WD_COVERED_ASKS = ['ask:goal', 'ask:past', 'ask:plans']; // R58: asks that set a covered thread
let WD_SIT_RESULT = null; // R55: outcome of the last WD sitting {surfaced, menuMore, menuSeen, turns}
// R42 DEPTH_PROBE: pursue thread depth in the wild. The pinned pickChoice
// never took the thread continuer 'more' ("Tell me more about X", offered
// when convoThreadHasMore) nor 'goon' (queued follow-on beats) -- DEEPEN
// covers dlg:more/dlg:details but not the continuer ids, and the
// fallthrough never offers them. Default ON; DEPTH_PROBE=0 restores r41
// behavior. Mirrors the r16 MOURN_PROBE / R36 NV_PROBE precedent.
const DEPTH_PROBE = process.env.DEPTH_PROBE !== '0';
const DEPTH_IDS = new Set(['more', 'goon', 'dlg:more']);
// Dry-admission shapes: the honest exhaustion line is CORRECT when a thread
// is dry -- but 'more' is only offered when convoThreadHasMore(vid) was
// true at menu build, so a dry admission right after taking it is a
// contradiction (the Liam fizzle pattern), not honest exhaustion.
const DEPTH_DRY_RE = /I've told you everything|That's the whole of it|pretty much all of it/i;
// R50: per-thread known-max depth + content-seen maps for this seed's run
// (reset per seed). A dry admission is honest exhaustion only when the
// thread delivered content before AND preDepth >= its known max; a dry
// admission with content left (preDepth < known max) or on a thread that
// never delivered content is still a fizzle (r48 metric review).
let threadKnownMax = {};
let threadContentSeen = {};
function pickChoice(choices, turn, wantId) {
  const list = choices || [];
  // r16 MOURN_PROBE: when a death happened in the last 2 game days, take
  // the mourning beat when offered — the pinned policy never picks it on
  // its own, so grief was exercised 0/38 sittings (policy blank, not game
  // blank; the beat itself is proof-covered by test-mourning-name-r8.js).
  if (process.env.MOURN_PROBE === '1') {
    const m = list.find(x => x && x.id === 'alive:event:mourning');
    if (m) {
      try {
        const gd = gday();
        const recent = deathsSoFar().some(d => (d.day != null) && gd - d.day <= 2 && (d.kind === 'villager' || d.kind === 'person'));
        if (recent) { MET.mournProbed = (MET.mournProbed || 0) + 1; lastPickId = 'alive:event:mourning'; return m; }
      } catch (e) {}
    }
  }
  // r10 FAVOR_ACCEPT: only dlg:commit creates a real favor obligation
  // (convo-wants.js: 'engaged' is unreachable for favors; heard-but-not-
  // committed resolves as 'stated'). r9's picker never offered it, so all
  // favors deflected. When the want is ask_favor and commit is offered,
  // take it — the promise->kept/broken machinery gets exercised.
  // R15: same for seek_taken — dlg:commit = "I'll ask the System about the
  // pods" (KIN canon). Taking the commit exercises takenPromises +
  // podRemember (social memory), the weight-not-meter design.
  if (FAVOR_ACCEPT && (wantId === 'ask_favor' || wantId === 'seek_taken')) {
    const commit = list.find(x => x && x.id === 'dlg:commit');
    if (commit) { MET.favorAccepted++; lastPickId = 'dlg:commit'; return commit; }
  }
  // R53 TOPIC_PROBE: in the designated sitting, take a topic ask first
  // (ask:goal/past/plans/village/personal), then the 'more' continuer when
  // offered, then 'goon'. R51 found 'more' never offered because the
  // pinned picker never takes a topic ask (DEEPEN covers dlg:* only), so
  // c.thread is never set at menu build and convoThreadHasMore is never
  // consulted. This probe tests whether 'more' fires once a thread exists.
  if (TOPIC_SIT) {
    // Pilot catch (seed 633 day 5): a hanging reactive question narrows
    // the menu to answers + leave/silence, so no topic ask is offered at
    // all. Deflect first to restore the full menu, then topic asks can fire.
    const dq = list.find(x => x && x.id === 'deflect_q');
    if (dq && dq.id !== lastPickId) { MET.topicProbeDeflects = (MET.topicProbeDeflects || 0) + 1; lastPickId = 'deflect_q'; return dq; }
    // R55 WD: never take a thread continuer before winddown — the probe
    // must arrive at the winddown menu with thread beats still in reserve.
    // (The winddown-menu 'more' itself is taken by the loop override, not here.)
    if (!WD_SIT) {
    const more = list.find(x => x && x.id === 'more');
    if (more && more.id !== lastPickId) { MET.morePicks = (MET.morePicks || 0) + 1; lastPickId = 'more'; return more; }
    }
    // Pilot catch 2 (seed 633 day 6 + day 10): after a deflect (or after
    // answering), the menu offers dlg:subject ("Can I ask you something
    // else?") — the door to the subject list — and the pinned picker never
    // takes it, so topic asks stay behind it forever. Take it in probe mode
    // (checked after 'more', so an open thread's continuer still wins).
    const subj = list.find(x => x && x.id === 'dlg:subject');
    // R57 QUEUED-NAV GUARD: once winddown is queued, no NEW subject opening —
    // drain held beats (goon / covered asks below) instead of navigating.
    // R58 EXCEPTION (once per sitting): when queued and the live thread is
    // NOT covered, one subject opening is allowed to hunt a covered ask —
    // the r57 guard made phase-2 covered steering unreachable (surfacing
    // happens via drain, and drain never opens a subject menu). Page turns
    // stay blocked in phase 2, so the ask must sit on page 1 of this opening.
    const phase2Opening = WD_SIT && WD_QUEUED && !wdPhase2SubjectOpened && !WD_COVERED_THREADS.includes(WD_LIVE_THREAD);
    if (subj && subj.id !== lastPickId && (!(WD_SIT && WD_QUEUED) || phase2Opening)) {
      if (phase2Opening) { wdPhase2SubjectOpened = true; MET._wdPhase2OpenedSit = 1; MET.wdPhase2Openings = (MET.wdPhase2Openings || 0) + 1; }
      MET.topicProbeSubjects = (MET.topicProbeSubjects || 0) + 1; lastPickId = 'dlg:subject'; pageVisited = new Set([1]); return subj; }
    // Pilot catch 3 (seed 633 day 7): the subject menu is PAGINATED — page 1
    // offered only ask:gossip (+ actions); the thread asks (past/goal/...) sit
    // behind [menu:more] on page 2, which the pinned picker never takes.
    // Take the page turn in probe mode, before any ask.
    // R56b PAGE SWEEP (pilot-1 correction): pilot-1's label-change rule CYCLED
    // pages (1/2 -> 2/2 -> 1/2 ...) and burned all 8 page turns + the sitting
    // (20 turns, winddown never surfaced; goal only appeared at turn 20).
    // David's first opening has just 2 pages — there IS no page 3 to reach
    // until discovery unlocks it. The correct rule is one full sweep per
    // opening: take menu:more only to a page NOT yet visited this opening
    // (destination = cur+1, wrapping to 1); then fall through to asks, which
    // is what drives discovery. The old lastPickId guard accidentally did
    // this (one take, then an ask) — the sweep makes it principled and
    // reaches page 3 whenever an opening actually has 3 pages. Page-seen
    // instrument: max page number whose menu:more label was OFFERED.
    // R58 COVERED-ASK-BEFORE-PAGE-TURN (phase 1 only): the r57 stranded-ask
    // mechanism — a covered ask offered on a subject page, the picker pages
    // away and never returns (653 goal p1 once; 654 past x3; 656 plans
    // every opening p2, never taken). If NO phase-1 ask is offered on this
    // page, take the offered covered ask instead of paging: it fires
    // exactly in the stranded case and never steals a live uncovered
    // thread (a phase-1 ask offered on the same page still wins, via the
    // ask loop below — this rule only runs when none is offered).
    if (WD_SIT && !WD_QUEUED) {
      const phase1Offered = ['ask:village', 'ask:personal', 'ask:fears', 'ask:others', 'ask:gossip']
        .some(id => list.find(x => x && x.id === id));
      if (!phase1Offered) for (const id of WD_COVERED_ASKS) {
        if (id === lastPickId) continue;
        const c = list.find(x => x && x.id === id);
        if (c) { MET.wdCoveredAskEarly = (MET.wdCoveredAskEarly || 0) + 1; MET._wdEarlyCoveredSit = 1; MET.topicProbeAsks = (MET.topicProbeAsks || 0) + 1; MET.topicProbeThreadAsks = (MET.topicProbeThreadAsks || 0) + 1; lastPickId = id; return c; }
      }
    }
    const pg = list.find(x => x && x.id === 'menu:more');
    if (pg) {
      const pgLabel = String(pg.label || '');
      const mm = /\((\d+)\/(\d+)\)/.exec(pgLabel);
      const cur = mm ? parseInt(mm[1], 10) : 1, tot = mm ? parseInt(mm[2], 10) : 1;
      if (cur > (MET._wdMaxPageSit || 0)) MET._wdMaxPageSit = cur;
      if (cur === 3) MET._wdPage3Sit = 1;
      const dest = cur >= tot ? 1 : cur + 1;
      if (!pageVisited) pageVisited = new Set([cur]);
      // R57 QUEUED-NAV GUARD: no new page turn once winddown is queued.
      if (!pageVisited.has(dest) && (MET._wdPageTurnsSit || 0) < 12 && !(WD_SIT && WD_QUEUED)) { // R57: page cap 8->12
        pageVisited.add(dest);
        MET.topicProbePages = (MET.topicProbePages || 0) + 1;
        MET.wdPageTurns = (MET.wdPageTurns || 0) + 1;
        MET._wdPageTurnsSit = (MET._wdPageTurnsSit || 0) + 1;
        lastPickId = 'menu:more'; return pg;
      }
    }
    // R55 WD: delay the topic ask to turn 2+ so the thread is fresh when
    // the budget is spent — an early ask plus continuers would spend the
    // thread before winddown (the r54 shape: moreOffered 0 everywhere).
    // R55d (pilot-3 revision): the covered-only ask filter STARVED the
    // sitting — Ada's subject pages never offer goal/past/plans until
    // other asks are consumed (discovery). So before winddown queues,
    // take ANY ask; once queued, steer to covered threads only (the
    // spurn turns run on the steered thread, and the surfaced menu
    // inherits it).
    // R55e (pilot-4 revision): that steering came too late — plans was
    // already consumed in phase 1, so phase 2 had no covered ask left
    // (asks are once-per-sitting; pools are deep: plans/past 48,
    // goal 12, so one reserved ask guarantees hasMore). RESERVE the
    // covered asks for phase 2: phase 1 takes uncovered asks only,
    // phase 2 takes covered asks only.
    const askIds = (WD_SIT && WD_QUEUED) ? ['ask:goal', 'ask:past', 'ask:plans'] :
      WD_SIT ? ['ask:village', 'ask:personal', 'ask:fears', 'ask:others', 'ask:gossip'] :
      ['ask:goal', 'ask:past', 'ask:plans', 'ask:village', 'ask:personal', 'ask:gossip'];
    if (!(WD_SIT && turn < 2)) for (const id of askIds) {
      if (id === lastPickId) continue;
      const c = list.find(x => x && x.id === id);
      if (c) { MET.topicProbeAsks = (MET.topicProbeAsks || 0) + 1; if (id !== 'ask:gossip') MET.topicProbeThreadAsks = (MET.topicProbeThreadAsks || 0) + 1; if (WD_SIT && WD_QUEUED && wdPhase2SubjectOpened && WD_COVERED_ASKS.includes(id)) MET._wdPhase2YieldedSit = 1; lastPickId = id; return c; }
    }
    // R55 WD: no 'goon' continuer before winddown either (same reason).
    // R55d: once winddown is queued, 'goon' is allowed — it drains held
    // beats and can surface the queued winddown beat itself.
    if (!WD_SIT || WD_QUEUED) {
    const goon = list.find(x => x && x.id === 'goon');
    if (goon && goon.id !== lastPickId) { MET.goonPicks = (MET.goonPicks || 0) + 1; lastPickId = 'goon'; return goon; }
    }
  }
  // r9: on the second turn, ask for gossip ("heard anything?") — the
  // information-machinery leg wants rendered gossip, not just deepening.
  // R55b: not in WD sittings (gossip sets no hasMore-covered thread).
  if (turn === 1 && !WD_SIT) {
    const g = list.find(x => x && x.id === 'ask:gossip');
    if (g) { MET.gossipAsks++; lastPickId = 'ask:gossip'; return g; }
  }
  // R36 NV_PROBE: inside a deliberate nonverbal sit, prefer nv: gestures
  // (cycle through them, up to 6 turns) — the pinned picker never takes the
  // nv path on its own (falls to 'leave'), so r32–r34's nv sits ended on
  // turn 1 and the nonverbal thread was never exercised in the wild.
  // Mirrors the r16 MOURN_PROBE precedent. Default ON; NV_PROBE=0 restores
  // r34 behavior.
  if (NV_SIT && process.env.NV_PROBE !== '0' && turn < 8) {
    // R35b: keep gesturing while the winddown is armed so a surfaced
    // winddown gets its closing gesture (the r19 contract: surface, then the
    // next gesture ends naturally). Otherwise the driver leaves via 'leave'
    // and the natural close is never exercised in the wild.
    let wdArmed = false;
    try { wdArmed = NV_VID != null && !!((Game.convoGet(NV_VID) || {}).windingDown); } catch (e) {}
    if (turn < 7 || wdArmed) {
      const nvs = list.filter(x => x && x.id && x.id.indexOf('nv:') === 0 && x.id !== lastPickId);
      if (nvs.length) { lastPickId = nvs[0].id; return nvs[0]; }
    }
  }
  // R28 (retired per r27 metric review): the pinned driver takes the
  // r26 deepening path — no resume-priority pick. Keep the instrument
  // so we document that no open gossip threads appear in 14 days.
  {
    const to = list.find(x => x && x.id && /^alive:thread:/.test(x.id));
    if (to) MET.gossipThreadOffered++;
  }
  for (const id of DEEPEN) {
    if (id === lastPickId) continue;
    // R55 WD: thread-content verbs would spend the thread before winddown.
    if (WD_SIT && (id === 'dlg:more' || id === 'dlg:details' || id === 'dlg:askwhy')) continue;
    const c = list.find(x => x && x.id === id);
    if (c) { lastPickId = id; return c; }
  }
  for (const id of DEEPEN) { if (WD_SIT && (id === 'dlg:more' || id === 'dlg:details' || id === 'dlg:askwhy')) continue; const c = list.find(x => x && x.id === id); if (c) { lastPickId = id; return c; } }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) { lastPickId = ans.id; return ans; }
  // R42 DEPTH_PROBE: take the thread continuer ('more') and queued-beat
  // continuer ('goon') ahead of filler. Answering their direct question
  // keeps courtesy priority; depth beats agree/react filler. dlg:more is
  // already pursued via DEEPEN above; counted here too for the instrument.
  if (DEPTH_PROBE) {
    // R55d: 'more' stays banned in WD mode (thread continuer), but
    // 'goon' is allowed once winddown is queued (drains/surfaces).
    if (!WD_SIT) {
    const more = list.find(x => x && x.id === 'more');
    if (more && more.id !== lastPickId) { MET.morePicks = (MET.morePicks || 0) + 1; lastPickId = 'more'; return more; }
    }
    if (!WD_SIT || WD_QUEUED) {
    const goon = list.find(x => x && x.id === 'goon');
    if (goon && goon.id !== lastPickId) { MET.goonPicks = (MET.goonPicks || 0) + 1; lastPickId = 'goon'; return goon; }
    }
  }
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

function runConversation(seed, day, vid, nvSit, topicSit, wdSit) {
  const fp = path.join(OUTDIR, `journey-landing-r62-transcript-${seed}-day${day}.txt`);
  NV_SIT = !!nvSit; NV_VID = vid; // R36: arm the nv picker for deliberate sits
  TOPIC_SIT = !!topicSit || !!wdSit; // R55: a WD sitting drives topic asks too
  WD_SIT = !!wdSit; WD_SIT_RESULT = null;
  pageVisited = null; // R56b: fresh page hunt per sitting
  MET._wdPageTurnsSit = 0; MET._wdPage3Sit = 0; MET._wdMaxPageSit = 0; // R56: per-sitting page instruments
  WD_LIVE_THREAD = null; wdPhase2SubjectOpened = false; // R58: fresh probe state per sitting
  MET._wdEarlyCoveredSit = 0; MET._wdPhase2OpenedSit = 0; MET._wdPhase2YieldedSit = 0; // R58: per-sitting probe instruments
  MET._betrayalAuditedThisSitting = false; // R47: one audit sample per sitting
  const L = [];
  const log = (s) => L.push(s);
  if (TOPIC_SIT) log('R53 TOPIC PROBE sitting: topic asks first, then \'more\'');
  if (WD_SIT) log('R55 WIND-DOWN PROBE sitting: topic ask delayed, no continuer before winddown');
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
    // R41: the first loop pass re-reads the opening menu (r === r0 on
    // iteration 0 — no turn has been taken), so flagging it as a RE-OFFER
    // was a driver artifact (every transcript in r37-r39 carried 5-8 bogus
    // turn-1 flags, inflating MET.reofferFlags). skipReoffer suppresses the
    // flag on that pass only; a genuine re-offer can never occur before the
    // first pick, so nothing real is masked.
    const noteMenu = (choices, turn, skipReoffer) => {
      // R47 BLIND-BETRAYAL AUDIT: on the FIRST menu in a sitting that offers
      // betrayal:accept, snapshot whether the invite was spoken in THIS
      // sitting (themLines so far), the engine's held-invite state, and the
      // want/thread that owns the reply. r46's Jovan d11 sitting offered
      // accept with only a comfort opener spoken -- the 2026-10-12 spoken-
      // lure fix holds the invite in c.invitePending when the opener owns
      // the reply, and the menu must not offer accept before it is spoken.
      try {
        const hasAccept = (choices || []).some(ch => ch && ch.id === 'betrayal:accept');
        if (hasAccept && !MET._betrayalAuditedThisSitting) {
          MET._betrayalAuditedThisSitting = true;
          MET.betrayalOfferCount = (MET.betrayalOfferCount || 0) + 1;
          let cg = null; try { cg = Game.convoGet(vid) || {}; } catch (e) {}
          const inviteFrags = [/walk with me/i, /haul something/i, /get air/i, /come see what i found/i, /trap line/i];
          // Spoken-in-sitting must include the startConvo transcript: an
          // invite spoken as the second opener beat is in c.transcript but
          // NOT in themLines yet (the driver logs r0.line = opener only,
          // and noteMenu for the opening menu runs before sayThem).
          let transcriptThem = [];
          try { transcriptThem = ((Game.convoGet(vid) || {}).transcript || []).filter(e => e && e.who === 'them').map(e => String(e.text || '')); } catch (e) {}
          const spokenInSitting = themLines.concat(transcriptThem).some(l => inviteFrags.some(rx => rx.test(String(l))));
          (MET.betrayalOfferSamples = MET.betrayalOfferSamples || []).push({
            day: gday(), npc: nm, want: (want && want.id) || null, wantStage: (want && want.stage) || 0,
            turn, spokenInSitting, invitePendingHeld: !!(cg && cg.invitePending),
            spokenBeatTag: (cg && cg.spokenBeat && cg.spokenBeat.tag) || null,
            thread: (cg && cg.thread) || null,
            themSoFar: themLines.slice(-3).map(l => String(l).slice(0, 160)),
            menuLabels: (choices || []).filter(ch => ch && /^betrayal:/.test(ch.id)).map(ch => ch.id + '=' + String(ch.label || '').slice(0, 60)),
          });
          log(`R47 BETRAYAL OFFER turn=${turn} spokenInSitting=${spokenInSitting} invitePendingHeld=${!!(cg && cg.invitePending)} spokenBeatTag=${(cg && cg.spokenBeat && cg.spokenBeat.tag) || 'null'} want=${(want && want.id) || 'none'}/${(want && want.stage) || 0}`);
        }
      } catch (e) { log('R47 betrayal audit ERROR: ' + (e && e.message)); }
      for (const ch of (choices || [])) {
        if (!ch || !ch.id) continue;
        if (ch.id.indexOf('ans:') === 0) MET.npcQuestions++;
        if (/^betrayal:(accept|decline)/.test(ch.id)) sawBetrayalMenu = true;
        if (seenIds.has(ch.id)) {
          if (!skipReoffer) {
            MET.reofferFlags++;
            log(`!! RE-OFFER: [${ch.id}] re-offered at turn ${turn} (first at turn ${seenAtTurn.get(ch.id)})`);
          }
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
    // R48 TRANSCRIPT FIX (r47 observation 1): startConvo may record more than
    // one opener beat in c.transcript (e.g. a spoken invite as the second
    // beat). Printing only r0.line hid those beats from sense-reads. Print
    // every recorded THEM line, in order, via sayThem (so sense checks still
    // run on each); fall back to r0.line only if the transcript is empty.
    // Dedupe: if the transcript's first line equals r0.line, sayThem runs
    // once per transcript entry — no separate r0.line call, so no double print.
    let _startThem = [];
    try { _startThem = ((Game.convoGet(vid) || {}).transcript || []).filter(e => e && e.who === 'them').map(e => String(e.text || '')).filter(s => s.length > 0); } catch (e) {}
    MET._startThemCount = (MET._startThemCount || 0) + _startThem.length;
    if (_startThem.length) { for (const _tl of _startThem) sayThem(_tl); }
    else sayThem(r0.line);
    log(`R48 opener beats: startConvo transcript THEM=${_startThem.length} r0.line=${JSON.stringify(String(r0.line || '').slice(0, 80))}`);
    let r = r0;
    // R36 nv instruments
    let nvPicks = 0, nvStreak = 0, nvMaxStreak = 0, offeredNv = 0;
    let wdSurfacedAt = -1, turns = 0, endedByEngine = false, lastPickWasNv = false, leftViaLeave = false;
    let wdSurfacedThisSit = false, wdMenuMoreThisSit = false, wdMenuSeenThisSit = false; // R55
    let lastGateThread = null, lastGateDepth = 0; // R55c: thread/depth at the last gate snapshot
    // R42: per-sitting depth tracking.
    const sitDepthMax = { depth: 0, thread: null };
    const sitThreads = new Set();
    for (let turn = 0; turn < (WD_SIT ? 30 : TOPIC_SIT ? 14 : 8); turn++) { // R57: WD sittings get
      // 30 turns (r56: 20 starved budget-5/6 sittings before queue+drain) — budget (3-7) + 2 spurn turns + the winddown menu itself.
      // 14 turns — the day-5 pilot hit the 8-turn cap on the ask:plans pick itself,
      // so the post-thread menu (where 'more' would appear) was never read.
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      offeredNv += (choices || []).filter(ch => ch && ch.id && ch.id.indexOf('nv:') === 0).length; // R36
      log('');
      noteMenu(choices, turn + 1, turn === 0); // R41: skip turn-1 artifact
      log(`menu (${(choices || []).length}): ` + (choices || []).map(ch => `[${ch && ch.id}] ${String((ch && ch.label) || '').slice(0, 60)}`).join(' | '));
      const pickWant = ((Game.convoGet(vid) || {}).want || {}).id || null;
      // R55 WD OVERRIDE: at the winddown menu, take 'more' if offered,
      // else 'leave' — never a non-menu pick while windingDown (a
      // dlg:subject/ask pick here would end the sitting via the tail's
      // quiet close instead of the winddown menu's grace beat).
      let pick;
      let wdArmedNow = false;
      try { const cb0 = Game.convoGet(vid) || {}; wdArmedNow = !!cb0.windingDown; WD_QUEUED = !!cb0.winddownQueued; WD_LIVE_THREAD = cb0.thread || null; } catch (e) { WD_QUEUED = false; WD_LIVE_THREAD = null; }
      if (WD_SIT && wdArmedNow) {
        wdSurfacedThisSit = true; wdMenuSeenThisSit = true;
        const wm = (choices || []).find(ch => ch && ch.id === 'more');
        if (wm) wdMenuMoreThisSit = true;
        pick = wm || (choices || []).find(ch => ch && ch.id === 'leave') || null;
        log(`R55 WD MENU: moreOffered=${!!wm} pick=${pick ? pick.id : 'none'} thread=${((Game.convoGet(vid) || {}).thread || null)} menu=[${(choices || []).map(ch => ch.id).join(',')}]`);
      } else {
        pick = pickChoice(choices, turn, pickWant);
        // R55b (pilot revision): the pilot WD sitting died at 12 turns
        // via the leave fallthrough ONE turn after winddown queued
        // (ex=4=budget, queued=true) — it never got its 2 spurn turns.
        // In a WD sitting, never leave on a fallthrough: take a held-beat
        // drain ('goon') or a content beat instead, so the sitting lives
        // long enough for the queued winddown to surface.
        // R55c (pilot-2 revision): the substitute must NEVER switch the
        // thread — pilot 2's ask:village substitute overwrote the live
        // 'plans' thread one turn before surfacing, so the winddown menu
        // correctly offered no 'more' (village is uncovered). Order:
        // goon, react, agree, any non-ask beat. R55e: NO covered-ask
        // fallback — a substitute must never spend the reserved ask.
        if (WD_SIT && (!pick || pick.id === 'leave')) {
          const sub = (choices || []).find(ch => ch && ch.id === 'goon') ||
            (choices || []).find(ch => ch && ch.id === 'dlg:react') ||
            (choices || []).find(ch => ch && ch.id === 'agree') ||
            (choices || []).find(ch => ch && ch.id !== 'leave' && ch.id !== 'silence' && !(ch.id || '').startsWith('ask:'));
          if (sub) { pick = sub; log(`R55 WD NO-LEAVE: fallthrough leave replaced with [${sub.id}]`); }
        }
      }
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); lastPickWasNv = false; leftViaLeave = true; break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      if (pick.id.indexOf('nv:') === 0) { nvPicks++; nvStreak++; if (nvStreak > nvMaxStreak) nvMaxStreak = nvStreak; MET.nvPicks = (MET.nvPicks || 0) + 1; lastPickWasNv = true; }
      else { nvStreak = 0; lastPickWasNv = false; }
      if (pick.id === 'betrayal:decline') declinedThisTurn = true;
      if (pick.id === 'ask:gossip') gossipAskedThisTurn = true;
      // R42: pre-pick thread/depth snapshot for the depth instrument.
      let preThread = null, preDepth = 0, preWindingDown = false;
      try { const cb = Game.convoGet(vid) || {}; preThread = cb.thread || null; preDepth = cb.depth || 0; preWindingDown = !!cb.windingDown; } catch (e) {}
      // R55 WD DIAG: per-turn winddown-gate state (why a sitting does or
      // does not reach winddown). Transcript-only, WD sittings only.
      if (WD_SIT) {
        try {
          const cb = Game.convoGet(vid) || {};
          lastGateThread = cb.thread || null; lastGateDepth = cb.depth || 0;
          log(`R55 WD GATE: ex=${cb.exchanges ?? '?'} budget=${cb.budget ?? '?'} pendingQ=${!!cb.pendingQ} heldAsk=${!!cb.heldAsk} queued=${!!cb.winddownQueued} windingDown=${!!cb.windingDown} heldBeats=${(cb.heldBeats || []).length} thread=${cb.thread || 'none'} depth=${cb.depth ?? '?'}`);
        } catch (e) {}
      }
      // R42: count 'more' thread-continuer OFFERS on the menu (offered only
      // when convoThreadHasMore) -- the denominator for the depth gate.
      try { MET.moreOffered = (MET.moreOffered || 0) + (choices || []).filter(ch => ch && ch.id === 'more').length; } catch (e) {}
      r = Game.convoTurn(vid, pick.id);
      turns++;
      // R54: winddown-'more' instrument — a 'more' pick taken while the
      // goodbye beat has surfaced (windingDown armed) is the r53 empty-beat
      // shape. Post-fix it must return a content beat, never silence.
      if (pick.id === 'more' && preWindingDown) {
        MET.wdMorePicks = (MET.wdMorePicks || 0) + 1;
        const wline = String((r && r.line) || '');
        if (!wline.trim()) {
          MET.wdMoreEmpty = (MET.wdMoreEmpty || 0) + 1;
          (MET.wdMoreSamples = MET.wdMoreSamples || []).push(`day${gday()} ${vname(vid)} thread=${preThread} depth=${preDepth} -> EMPTY (ended=${!!(r && r.ended)})`);
          log('!! WIND-DOWN MORE EMPTY (r53 shape, post-fix miss)');
        } else {
          (MET.wdMoreSamples = MET.wdMoreSamples || []).push(`day${gday()} ${vname(vid)} thread=${preThread} depth=${preDepth} -> "${wline.slice(0, 120)}" ended=${!!(r && r.ended)}`);
          log(`wind-down more beat ✓ [${preThread}] ended=${!!(r && r.ended)}`);
        }
      }
      // R42 DEPTH instrument: continuer picks ('more'/'goon'/dlg:more) must
      // land content beats. A dry admission right after a continuer is the
      // fizzle pattern (the thread claimed more, then said "that's all").
      if (DEPTH_IDS.has(pick.id)) {
        let postDepth = preDepth, postThread = preThread;
        try { const ca = Game.convoGet(vid) || {}; postDepth = ca.depth || 0; postThread = ca.thread || null; } catch (e) {}
        if (postDepth > (sitDepthMax.depth || 0)) { sitDepthMax.depth = postDepth; sitDepthMax.thread = postThread; }
        if (preThread && !sitThreads.has(preThread)) sitThreads.add(preThread);
        const rl = String((r && r.line) || '');
        const key = pick.id === 'more' ? 'more' : pick.id === 'goon' ? 'goon' : 'dlgMore';
        MET[key + 'Beats'] = (MET[key + 'Beats'] || 0) + 1;
        if (DEPTH_DRY_RE.test(rl)) {
          // R50 revision: honest exhaustion vs fizzle (r48 metric review).
          const known = (preThread && threadKnownMax[preThread]) || 0;
          const seen = !!(preThread && threadContentSeen[preThread]);
          if (seen && preDepth >= known) {
            MET.depthHonestExhaustions = (MET.depthHonestExhaustions || 0) + 1;
            (MET.depthHonestExhaustionSamples = MET.depthHonestExhaustionSamples || []).push(
              `day${gday()} ${vname(vid)} [${pick.id}] thread=${preThread} depth=${preDepth} knownMax=${known} -> "${rl.slice(0, 1000)}"`);
            log(`depth honest-exhaustion ✓ [${pick.id}] thread=${preThread} depth=${preDepth} knownMax=${known}: thread spent, admission is canon`);
          } else {
            MET.depthFizzles = (MET.depthFizzles || 0) + 1;
            (MET.depthFizzleSamples = MET.depthFizzleSamples || []).push(
              `day${gday()} ${vname(vid)} [${pick.id}] thread=${preThread} depth=${preDepth} knownMax=${known} seen=${seen} -> "${rl.slice(0, 1000)}"`);
            log(`!! DEPTH FIZZLE [${pick.id}] thread=${preThread} depth=${preDepth} knownMax=${known} seen=${seen}: dry admission after continuer`);
          }
        } else if (rl.trim().length >= 8) {
          MET.depthContentBeats = (MET.depthContentBeats || 0) + 1;
          if (preThread) {
            threadContentSeen[preThread] = true;
            if (postDepth > (threadKnownMax[preThread] || 0)) threadKnownMax[preThread] = postDepth;
          }
          log(`depth beat ✓ [${pick.id}] thread=${preThread} ${preDepth}->${postDepth}`);
        } else {
          MET.depthEmptyBeats = (MET.depthEmptyBeats || 0) + 1;
          log(`!! DEPTH EMPTY [${pick.id}] thread=${preThread} depth=${preDepth}: empty/near-empty beat`);
        }
      }
      // R36: the r19 delivery arms windingDown when the queued winddown beat
      // surfaces on an nv: turn — detect the flip.
      try {
        const cc = Game.convoGet(vid);
        if (cc && cc.windingDown && wdSurfacedAt < 0) {
          wdSurfacedAt = turn; MET.nvWinddownSurfaced = (MET.nvWinddownSurfaced || 0) + 1;
          log('nv winddown surfaced ✓ (windingDown armed — the r19 delivery)');
        }
      } catch (e) {}
      sayThem(r.line);
      // R27: gossip-resume stall signature — the NPC's resume response is
      // the generic echo ("we never did get back to that...") with no
      // gossip beat (the pre-r28 stall). Post-fix it must be a content
      // beat (or the engine's honest dry admission). Mirrors the r28
      // pilot's generic detection on the NPC's returned line only (the
      // player's own "we never finished" label is the YOU line, not this).
      if (pick.id === 'alive:thread:gossip') {
        MET.gossipResumes++;
        const rline = String((r && r.line) || '');
        MET.gossipResumeLines.push(rline.slice(0, 300));
        if (/never did get back to that|we never finished/i.test(rline)) {
          MET.gossipResumeStalls++; log('!! GOSSIP-RESUME STALL (generic echo, no beat)');
        } else if (rline.trim().length < 8) {
          MET.gossipResumeStalls++; log('!! GOSSIP-RESUME STALL (empty/near-empty beat)');
        } else { log('gossip resume: contentful beat ✓'); }
      }
      const w = (Game.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { endedByEngine = true; log('(ended by engine)'); break; }
    }
    // R36 nv summary: the r19 bug's wild signature is a conversation that hits
    // the driver's 8-turn cap with >=4 gesture picks and is still active.
    if (nvPicks > 0) {
      MET.nvConvos = (MET.nvConvos || 0) + 1;
      let stillActive = false;
      try { stillActive = !!(Game.convoGet(vid) || {}).active; } catch (e) {}
      // R36b: the r19 wild hold — the winddown surfaces, the menu narrows
      // (no more nv: spam), and the conversation reaches a proper ending.
      // Leaving via the narrowed 'leave' IS the natural close (the closing
      // line fires); requiring endedByEngine false-negatived the pilot.
      if (wdSurfacedAt >= 0 && (endedByEngine || leftViaLeave)) { MET.nvWinddownClosed = (MET.nvWinddownClosed || 0) + 1; log(`nv winddown: surfaced at turn ${wdSurfacedAt} then closed ${endedByEngine ? 'by engine' : 'via narrowed leave'} ✓`); }
      else if (wdSurfacedAt >= 0) log(`nv winddown: surfaced at turn ${wdSurfacedAt} but did NOT close (endedByEngine=${endedByEngine} leftViaLeave=${leftViaLeave})`);
      // R36b: the true r19 bug signature is gesture-spam to the driver's
      // 8-turn cap with the winddown NEVER surfacing (beat queued forever).
      // A surfaced winddown followed by leave is the fix working, not the bug.
      if (turns >= 8 && stillActive && wdSurfacedAt < 0) { MET.nvStuckLoops = (MET.nvStuckLoops || 0) + 1; log('!! NV STUCK LOOP: 8-turn cap, convo still active, winddown never surfaced — the r19 bug signature'); }
      log(`nv summary: picks=${nvPicks} maxStreak=${nvMaxStreak} offeredNv=${offeredNv} wdSurfacedAt=${wdSurfacedAt} endedByEngine=${endedByEngine} leftViaLeave=${leftViaLeave} stillActive=${stillActive}`);
    }
    if (offeredNv > 0) MET.nvOfferedTotal = (MET.nvOfferedTotal || 0) + offeredNv;
    // R42: per-sitting depth summary for the Q-A instrument.
    MET.sitDepthSum = (MET.sitDepthSum || 0) + sitDepthMax.depth;
    if (sitDepthMax.depth >= 2) MET.sitDepth2Plus = (MET.sitDepth2Plus || 0) + 1;
    log(`depth summary: maxDepth=${sitDepthMax.depth} thread=${sitDepthMax.thread || 'none'} threadsPursued=[${[...sitThreads].join(',') || 'none'}] turns=${turns}`);
    // R55 WD sitting outcome: recorded even when winddown never surfaced
    // (a probe that never reaches the state is evidence, not a silent zero).
    if (WD_SIT) {
      MET.wdPage3Visits = (MET.wdPage3Visits || 0) + (MET._wdPage3Sit || 0); // R56b: per-seed page-3 total from the sitting flag
      WD_SIT_RESULT = { surfaced: wdSurfacedThisSit, menuMore: wdMenuMoreThisSit, menuSeen: wdMenuSeenThisSit, turns };
      (MET.wdProbeSamples = MET.wdProbeSamples || []).push(`day${day} ${nm} surfaced=${wdSurfacedThisSit} menuMore=${wdMenuMoreThisSit} turns=${turns} lastThread=${lastGateThread || 'none'} lastDepth=${lastGateDepth} pageTurns=${MET._wdPageTurnsSit || 0} page3=${MET._wdPage3Sit || 0} maxPage=${MET._wdMaxPageSit || 0} earlyCovered=${MET._wdEarlyCoveredSit || 0} phase2Opened=${MET._wdPhase2OpenedSit || 0} phase2Yielded=${MET._wdPhase2YieldedSit || 0}`);
      log(`R55 WD RESULT: surfaced=${wdSurfacedThisSit} menuMore=${wdMenuMoreThisSit} turns=${turns}`);
    }
    NV_SIT = false; NV_VID = null; // R36: disarm
    WD_SIT = false; // R55: disarm (WD_SIT_RESULT survives for the scheduler)
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
    // r38: the verbatim check was quote-sensitive — an opener served bare
    // ("I record the arguments...") and the same pool line served quoted
    // ('"I record the arguments..."') 2 turns later fell through BOTH the
    // verbatim check (quote mismatch) and the near-dupe check (identical
    // cores are skipped as "exact dupes counted above"). Normalize quotes
    // before exact-match so quote-differentiated repeats are caught.
    const stripQuotes = (s) => String(s || '').trim().replace(/^"+|"+$/g, '').trim();
    const themNorm = themT.map(stripQuotes);
    const dupes = themNorm.filter((x, i) => themNorm.indexOf(x) !== i);
    if (dupes.length) { MET.verbatimRepeats += dupes.length; log(`!! VERBATIM REPEATS (${dupes.length}): ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`); }
    // r16 NEAR-DUPE detector: voiceLine wraps the raw pool line with
    // openers/closers ("You know what — X" vs "X"), defeating exact-match.
    // Normalize aggressively (strip punctuation/quotes/case), then flag
    // when one line's core contains another's (>=40 chars). Exact dupes
    // are counted above; this catches wrapper-hidden repeats only.
    const normCore = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    // r18 fix: keep (line, core) pairs — filtering cores alone breaks the
    // themT index alignment and misattributes the pair (caught on the
    // seed-64 probe: reported a deflection line, hid the real comfort repeat).
    // R36 refinement (r34 metric-review queue): a resume opener that QUOTES
    // the previous sitting's true close is not a repeat — the r34 STRICT
    // MISS (probe 101-day12): the resume opener quotes the close, then the
    // player's re-commit legitimately re-fires the same gratitude line.
    // Exclude pairs whose containment is explained by a quoted segment
    // (>=20 chars normalized, the r33 20-char floor) of one line matching
    // the other. Quoted <20 chars cannot explain a pair (guard against
    // over-exclusion, e.g. 'They said "fix the fence" and walked off').
    const QUOTE_FLOOR = 20;
    const quoteSegs = (line) => (String(line || '').match(/"[^"]*"/g) || [])
      .map(q => normCore(q)).filter(s => s.length >= QUOTE_FLOOR);
    const quoteExplained = (a, b) =>
      a.quotes.some(q => b.core.indexOf(q) !== -1) ||
      b.quotes.some(q => a.core.indexOf(q) !== -1);
    const pairs = themT.map(t => ({ line: t, core: normCore(t), quotes: quoteSegs(t) })).filter(p => p.core.length >= 40);
    const nearDupes = [];
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        if (pairs[i].core === pairs[j].core) continue;
        if (quoteExplained(pairs[i], pairs[j])) { MET.nearDupeQuoteExcluded = (MET.nearDupeQuoteExcluded || 0) + 1; continue; }
        if (pairs[i].core.indexOf(pairs[j].core) !== -1 || pairs[j].core.indexOf(pairs[i].core) !== -1) {
          nearDupes.push(`${pairs[i].line.slice(0, 80)} ⟷ ${pairs[j].line.slice(0, 80)}`);
        }
      }
    }
    if (nearDupes.length) {
      MET.nearDupes = (MET.nearDupes || 0) + nearDupes.length;
      log(`!! NEAR-DUPES (${nearDupes.length}): ` + nearDupes.slice(0, 3).join(' || ').slice(0, 320));
    }
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
  TOPIC_SIT = false;
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

function buildCensus() {
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const trust = (Game.state.village && Game.state.village.trust) || {};
  const out = roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (Game.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = Game.agencyOf ? Game.agencyOf(id) : null; } catch (e) {}
    let mood = p.mood || null;
    let want = null;
    try { const c = Game.convoGet(id); want = (c && c.want && c.want.id) || null; } catch (e) {}
    return {
      id, name: vname(id),
      alive: !p.dead,
      occupation: p.occupation || null,
      temperament: p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants, want,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
  // r11: the dead leave the roster — union them back in from the death log
  // so the census doesn't silently shrink (seed 22: 12 -> 8 with 4 deaths).
  try {
    const seen = new Set(out.map(p => p.id));
    for (const d of deathsSoFar()) {
      if (!d || (d.kind !== 'villager' && d.kind !== 'person')) continue;
      const id = d.who || d.villagerId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push({ id, name: d.name || id, alive: false, deathDay: d.day, deathCause: d.cause });
    }
  } catch (e) {}
  return out;
}

async function runSeed(seed) {
  capture = [];
  // r23: per-seed stream counters must not bleed across seeds — r23 found
  // seed 83's flesh streamCounts were seed 82's carried totals (MET is
  // module-level, never reset). Reset the per-seed-reported flesh counters
  // (and their line buffers) here; the end-of-run console summary stays
  // cumulative by design.
  for (const k of ['fleshHaulsSeen', 'fleshDeposits', 'fleshExperiments',
    'fleshReveals', 'fleshPoisonVerdicts', 'fleshRotLines']) MET[k] = 0;
  MET.fleshExperimentLines = []; MET.fleshHaulSeenLines = [];
  // r38: the r30/r34 death-liturgy + theft counters bled across seeds the
  // same way (module-level MET, never reset) — seed 312's census reported
  // griefBeats=3, but the game emitted the beat once; 2 of the 3 were seed
  // 311's beats carried over. Reset per seed like the r23 flesh counters.
  for (const k of ['griefBeats', 'headcountCodas', 'caughtRedHanded']) MET[k] = 0;
  MET.griefBeatLines = []; MET.headcountCodaLines = [];
  MET.caughtRedHandedLines = []; MET.deathLineSamples = [];
  // r39: night-beat + laugh + seek-suggest counters bleed the same way —
  // reset per seed so the census summary reads this seed's lines only.
  for (const k of ['debriefLines', 'graveMarkerLines', 'laugh_mutiny',
    'laugh_borrowed', 'laugh_honest', 'laughBackToBack', 'seekSuggestLines',
    'objectivesWarns', 'nightfallWarns', 'dayOneNudgeFired']) MET[k] = 0;
  MET.dayOneNudgeDay = null; MET.dayOneNudgeSample = '';
  // R41: half-ration beat scan is per-seed too.
  MET.halfRationBeats = [];
  MET.debriefLineSamples = []; MET.graveMarkerSamples = [];
  MET.laughLineSamples = []; MET.seekSuggestSamples = [];
  MET.objectivesWarnSamples = []; MET.nightfallWarnSamples = [];
  // R41: the r38/r39 bleed fixes missed these — nv/plenty/near-dupe
  // counters are per-seed-meaningful (the census reads them per seed) but
  // were never reset, so multi-seed processes reported cumulative values
  // (plentyVoiceLines 24/50/76/104 for true 24/26/26/28; nvWinddownSurfaced
  // 1/2/3/4 for true 1/1/1/1). Reset like the rest.
  for (const k of ['nvPicks', 'nvConvos', 'nvOfferedTotal', 'nvWinddownSurfaced',
    'nvWinddownClosed', 'nvStuckLoops', 'nearDupeQuoteExcluded', 'nearDupes',
    'plentyVoiceLines', 'fallenDupes']) MET[k] = 0;
  MET.plentyVoiceSamples = []; MET.fallenDupeSamples = [];
  MET._lastLaughVoice = null;
  // R42: depth-pursuit counters are per-seed meaningful (census reads them
  // per seed) -- reset like the rest (r40 bleed lesson).
  for (const k of ['morePicks', 'goonPicks', 'moreOffered', 'moreBeats', 'topicProbeAsks', 'topicProbeDeflects', 'topicProbeSubjects', 'topicProbePages', 'topicProbeThreadAsks',
    'goonBeats', 'dlgMoreBeats', 'depthFizzles', 'depthHonestExhaustions', 'depthContentBeats',
    'depthEmptyBeats', 'sitDepthSum', 'sitDepth2Plus', 'wdMorePicks', 'wdMoreEmpty', 'wdPageTurns', 'wdPage3Visits']) MET[k] = 0;
  MET.wdMoreSamples = [];
  MET.wdProbeSamples = []; // R55: one sample per WD sitting
  MET.depthFizzleSamples = [];
  MET.depthHonestExhaustionSamples = [];
  threadKnownMax = {};
  threadContentSeen = {};
  MET.betrayalOfferSamples = []; MET.betrayalOfferCount = 0;
  console.log(`\n########## SEED ${seed} ##########`);
  const lg = await loadGame({ seed, fullTelemetry: true });
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
  // r12: name-learning telemetry — wrap revealName AFTER the stream wrap so
  // the spoken beat lines (intro/overheard/gesture) are already in `capture`.
  // Records {day, name, how} + the exact line(s) spoken at fire time.
  const nameLog = [];
  try {
    const _rn = Game.revealName.bind(Game);
    Game.revealName = function (vid, how) {
      const before = capture.length;
      const r = _rn(vid, how);
      if (r) {
        let nm = null;
        try { const p = person(vid); nm = (p.name || '').split(' ')[0] || null; } catch (e) {}
        const lines = capture.slice(before).filter(s => s && String(s).trim());
        nameLog.push({ day: gday(), vid, name: nm, how, lines: lines.map(s => String(s).slice(0, 300)) });
        console.log(`*** NAME LEARNED day ${gday()}: ${nm} (${how})`);
      }
      return r;
    };
  } catch (e) { console.log('revealName wrap ERROR: ' + (e && e.message)); }
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
  // R14: NO genDetail stub (establishment r2 2026-10-14): r5-r12 stubbed it
  // to {} and starved the whole player forage/craft channel. Real detail
  // grid in node (~4 ms/tile, cached) — honest forage for the first time.
  // R14: water telemetry. The pinned competent policy (fd4b225e) fills
  // bottles at the haven cistern now (drinkSafe matches /haven/ or
  // playerAtHaven). Count fills by location + boils — a competent player
  // treats risky water (boils) rather than drinking raw roulette.
  const WATER = { fills: 0, havenFills: 0, wildFills: 0, boils: 0, fillDays: new Set() };
  try {
    if (typeof Game.fillWater === 'function') {
      const _fw = Game.fillWater.bind(Game);
      Game.fillWater = function (...a) {
        let atH = false;
        try { atH = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
        WATER.fills++; WATER.fillDays.add(gday());
        if (atH) WATER.havenFills++; else WATER.wildFills++;
        console.log(`*** FILL day ${gday()}: ${atH ? 'HAVEN(cistern)' : 'WILD'}`);
        return _fw.apply(this, a);
      };
    }
  } catch (e) { console.log('fillWater wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.boilWater === 'function') {
      const _bw = Game.boilWater.bind(Game);
      Game.boilWater = function (...a) {
        WATER.boils++;
        return _bw.apply(this, a);
      };
    }
  } catch (e) { console.log('boilWater wrap ERROR: ' + (e && e.message)); }
  // R14: honest-death-cause telemetry (player-survivability fd4b225e — unit-
  // proven 4/4; this is the full-run check). Wrap playerDeath on the
  // INSTANCE (prototype assignment would leak across seeds in this process),
  // record the cause, then verify the epitaph line carries it — an epitaph
  // narrating 'starvation' for a recorded dehydration/wounds/sickness death
  // is the old mislabel bug back.
  const DEATHS = { causes: {}, playerDeaths: [], mislabels: [] };
  // R46: contest ledger — live activeContest watch (participants only;
  // telemetry fired/end pairs are the primary ledger, merged at census time).
  const CONTEST_LIVE = [];
  let _liveContestId = null;
  try {
    if (typeof Game.playerDeath === 'function') {
      const _pd = Game.playerDeath.bind(Game);
      Game.playerDeath = function (cause) {
        const c = String(cause || 'the wild');
        const mark = capture.length;
        const r = _pd(cause);
        DEATHS.playerDeaths.push({ day: gday(), cause: c });
        DEATHS.causes[c] = (DEATHS.causes[c] || 0) + 1;
        const epitaph = capture.slice(mark, mark + 14).map(x => String(x));
        const epLine = epitaph.find(x => /is dead —/.test(x)) || '';
        const honest = !/starvat/i.test(epLine) || /starvat/i.test(c);
        if (!honest) {
          DEATHS.mislabels.push({ day: gday(), recorded: c, epitaph: epLine.slice(0, 200) });
          console.log(`*** MISLABEL day ${gday()}: recorded=${c} epitaph=${epLine.slice(0, 120)}`);
        } else {
          console.log(`*** PLAYER DEATH day ${gday()}: cause=${c} epitaph=${epLine.slice(0, 120)}`);
        }
        return r;
      };
    }
  } catch (e) { console.log('playerDeath wrap ERROR: ' + (e && e.message)); }
  // R46: contest-start hook — contestInterruption builds activeContest with
  // its real participants. driveContests plays each contest to completion
  // synchronously, so a loop-top watch never sees one live; this hook is the
  // participant record. The object reference is kept so the census can read
  // its rendered phases (strings only, never serialized). Errors are logged.
  try {
    if (typeof Game.contestInterruption === 'function') {
      const _ci = Game.contestInterruption.bind(Game);
      Game.contestInterruption = function (...a) {
        const r = _ci(...a);
        try {
          const ac = Game.state && Game.state.activeContest;
          const id = ac && (ac.contestId || ac.showId);
          if (id && !CONTEST_LIVE.some(e => e.contestId === id && e.startDay === gday())) {
            let parts = [];
            try { parts = (ac.participants || []).map(v => (v === 'player' ? vname(Game.villagerId) : vname(v))); }
            catch (e) { console.log('contest start participants ERROR: ' + (e && e.message)); }
            let part = null;
            try { part = ac.participant ? (ac.participant === 'player' ? vname(Game.villagerId) : vname(ac.participant)) : null; }
            catch (e) { console.log('contest start participant ERROR: ' + (e && e.message)); }
            CONTEST_LIVE.push({ contestId: id, kind: ac.contestId ? 'contest' : (ac.kind || null), startDay: gday(), participants: parts, participant: part, _ref: ac });
            console.log(`*** CONTEST START day ${gday()}: ${id} participants=[${parts.join(', ')}]`);
          }
        } catch (e) { console.log('contestInterruption wrap ERROR: ' + (e && e.message)); }
        return r;
      };
    } else { console.log('contestInterruption wrap NOTE: not a function — live participant watch disabled, telemetry ledger only'); }
  } catch (e) { console.log('contestInterruption wrap ERROR: ' + (e && e.message)); }
  await setupGame(Game);

  const ctx = { policyId: 'competent-landing-R17' };
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
  // r11: narration-stream capture marks per game day (days 5..9 window for
  // the System arrival) + the full cinematic script at the flip.
  const capMarks = {};
  // r11: follower telemetry — wrap Game.followerCheck (party.js, pre-System):
  // count batch-turn calls, eligible candidates (trust>=50, goal!=alone,
  // not player/follower/party), and diff the followers list per call.
  const FOL = { calls: 0, eligibleSeen: 0, maxEligiblePerCall: 0, fires: [] };
  try {
    const _fc = Game.followerCheck.bind(Game);
    Game.followerCheck = function () {
      FOL.calls++;
      // r11 measurement note: post-flip calls early-return (pre-System beat),
      // so eligible-candidate counts are only meaningful pre-arrival.
      const preFlip = !this.state.systemArrived;
      const v = this.partyState();
      const fols = v.followers || [];
      const trust = v.trust || {};
      const before = fols.slice();
      let eligible = 0;
      for (const rid of (v.roster || [])) {
        if (rid === this.villagerId) continue;
        if (fols.includes(rid) || this.inParty(rid)) continue;
        if ((trust[rid] || 10) < 50) continue;
        let goal = null;
        try { goal = this.npcGoal(rid); } catch (e) {}
        if (goal === 'alone') continue;
        eligible++;
      }
      FOL.eligibleSeen += preFlip ? eligible : 0;
      FOL.postFlipCalls = (FOL.postFlipCalls || 0) + (preFlip ? 0 : 1);
      if (eligible > FOL.maxEligiblePerCall) FOL.maxEligiblePerCall = eligible;
      const r = _fc();
      const after = (this.partyState().followers || []);
      for (const rid of after) {
        if (!before.includes(rid)) {
          let goal = null; try { goal = this.npcGoal(rid); } catch (e) {}
          // r12: capture the volunteer SAY-LINE at fire time (r11 harness gap).
          // The say-line templates live in party.js — scan the capture stream
          // backward for them and record the match + a few lines of context.
          let volunteerLine = null, volunteerCtx = null;
          try {
            const VOL_RE = /I'm coming with you|You shouldn't go out there alone|I want to see what's out there too/i;
            for (let i = capture.length - 1; i >= Math.max(0, capture.length - 400); i--) {
              if (VOL_RE.test(String(capture[i]))) {
                volunteerLine = String(capture[i]).slice(0, 300);
                volunteerCtx = capture.slice(Math.max(0, i - 4), i + 2).map(s => String(s).slice(0, 200));
                break;
              }
            }
          } catch (e) {}
          FOL.fires.push({ day: gday(), rid, name: vname(rid), trustAtFire: (trust[rid] ?? null), goal, volunteerLine, volunteerCtx });
          console.log(`*** FOLLOWER VOLUNTEER: ${vname(rid)} day ${gday()} trust=${trust[rid]} goal=${goal}`);
          if (volunteerLine) console.log(`    line: ${volunteerLine.slice(0, 160)}`);
          else console.log('    line: NOT FOUND in last 400 capture lines (harness gap persists)');
        }
      }
      return r;
    };
  } catch (e) { console.log('follower wrap ERROR: ' + (e && e.message)); }
  // r11: tutorial — log which ability the competent policy actually takes.
  // NOTE (r11 measurement fix): chooseAbility returns null on BOTH success
  // and the no-free-slot path, so log only real acquisitions (abilities
  // count grows), not attempts — the policy retries a pending full-slot
  // offer daily and attempts were previously mislogged as picks.
  const abilityOfferLog = [];
  try {
    if (Game.chooseAbility) {
      const _ca = Game.chooseAbility.bind(Game);
      Game.chooseAbility = function (id, ...rest) {
        const offers = ((Game.state.scholar || {}).abilityChoices || []).map(c => c.id || c);
        const before = ((Game.state.scholar || {}).abilities || []).length;
        const r = _ca(id, ...rest);
        const after = ((Game.state.scholar || {}).abilities || []).length;
        if (after > before) {
          abilityOfferLog.push({ day: gday(), chosen: id, offers });
          console.log(`*** ABILITY CHOSEN day ${gday()}: ${id} (offered: ${offers.join(', ')})`);
        } else {
          console.log(`--- ability attempt day ${gday()}: ${id} NOT taken (slots full or invalid)`);
        }
        return r;
      };
    }
  } catch (e) { console.log('chooseAbility wrap ERROR: ' + (e && e.message)); }
  const series = [];
  const mantleLog = []; // r18: journal passes {day, from, to} (V1'')
  let lastHolder = null;
  const transcriptFiles = [];
  let overAt = null;
  let lastSday = null, frozenIters = 0;

  const atHaven = () => { try { return Game.playerAtHaven ? Game.playerAtHaven() : true; } catch (e) { return true; } };
  // R17 REPEAT_SIT=1: exercise repeat-sitting beats (seek_taken, mourning
  // follow-ups) that the first-meeting policy never reaches. Prefer
  // already-talked villagers (cnt>0 first), allow re-talking across days.
  const REPEAT_SIT = process.env.REPEAT_SIT === '1';
  const pickVillager = (nvSit) => {
    try {
      const roster = (Game.state.village.roster || []).filter(id =>
        id !== Game.villagerId && (REPEAT_SIT || !talked.has(id)));
      const scored = roster.map(id => {
        let lvl = 'full';
        try { const nc = Game.commLevel ? Game.commLevel(id) : { level: 'full' }; lvl = (nc && nc.level) || 'full'; } catch (e) {}
        if (nvSit ? lvl !== 'none' : lvl === 'none') return null;
        let cnt = -1;
        try { const c0 = Game.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
        return { id, cnt };
      }).filter(Boolean);
      if (!scored.length) return null;
      if (REPEAT_SIT) {
        // repeat-sitters first; within equal cnt, fresh ones last
        scored.sort((a, b) => b.cnt - a.cnt);
        const pick = scored.find(x => x.cnt > 0) || scored[0];
        if (pick.cnt > 0) MET.repeatSitTaken = (MET.repeatSitTaken || 0) + 1;
        return pick.id;
      }
      for (const x of scored) if (x.cnt === 0) return x.id;
      return scored[0].id;
    } catch (e) { return null; }
  };
  const daySnapshot = () => {
    let loc = null, packKcal = null, sentiment = null, feastState = null;
    try { loc = atHaven() ? 'haven' : 'wild'; } catch (e) {}
    try {
      const pack = (Game.state.scholar && Game.state.scholar.pack) || [];
      packKcal = Math.round(pack.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
    } catch (e) {}
    // R46: what the scholar actually carries — the starvation-while-away question
    // turns on whether the scholar held anything edible on each away day.
    // CORRECTION (pilot 609): scholar.pack is NOT carried food — game.js uses
    // village.pack (a ration map) and scholar.inventory (the array Game.eat()
    // consumes). The pilot's packItems were always empty for that reason; the
    // real instrument is inventory. packKcal stays for continuity only.
    let packItems = null, invKcal = null;
    try {
      const inv = (Game.state.scholar && Game.state.scholar.inventory) || [];
      invKcal = Math.round(inv.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
      packItems = inv.map(i => ({
        name: i.name || i.plantId || '?',
        plantId: i.plantId || null,
        units: i.units || i.count || 0,
        kcalEach: i.kcalEach || i.kcal || 0,
        state: i.state || i.prep || i.foodState || null,
        edible: i.edible !== undefined ? i.edible : null,
      }));
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
    // r11: follower + trust telemetry — per-day followers list, full trust
    // map, and the day's max trust (the trust-ceiling picture).
    let followers = null, trustMap = null, trustMax = null, trustMaxName = null;
    try {
      followers = (Game.partyState().followers || []).map(id => ({ id, name: vname(id) }));
    } catch (e) {}
    try {
      trustMap = Object.assign({}, (Game.state.village || {}).trust);
      for (const [rid, t] of Object.entries(trustMap)) {
        if (t != null && (trustMax == null || t > trustMax)) { trustMax = t; trustMaxName = vname(rid); }
      }
    } catch (e) {}
    // r12: name-learning curve — how many of the roster are known by name
    // (pre-System these are socially earned; post-flip the overlay gives all).
    let namesKnown = null, namesKnownNames = null;
    try {
      const kn = (Game.state.village && Game.state.village.knownNames) || {};
      const knownIds = Object.keys(kn).filter(id => kn[id]);
      namesKnown = knownIds.length;
      namesKnownNames = knownIds.map(id => vname(id));
    } catch (e) {}
    // R22: monster-meat pipeline ledger — per-day state of the wild arc.
    // foodSafe map transitions tell the reveal story; corpse inventory scan
    // shows carcasses waiting to be hauled vs rotted on the body.
    let flesh = null;
    try {
      const me = ((Game.state.codex || {}).monsters) || {};
      const foodSafe = {};
      for (const [mid, e] of Object.entries(me)) {
        if (!e) continue;
        foodSafe[mid] = {
          safe: !!e.foodSafe, how: e.foodSafeHow || null,
          tested: e.foodTested || null, testedBy: e.foodTestedBy || null,
        };
      }
      const corpses = [];
      try {
        for (const c of (Game.corpses ? Game.corpses() : [])) {
          if (!c || c.buried) continue;
          const meat = (c.items || [])
            .filter(it => it && it.foodKind === 'meat' && it.foodState === 'carcass' && (it.units == null ? 1 : it.units) > 0)
            .map(it => ({ plantId: it.plantId || null, spoilDay: it.spoilDay != null ? it.spoilDay : null,
                          name: String(it.name || '').slice(0, 60) }));
          corpses.push({
            id: c.id, kind: c.kind, monsterId: c.monsterId || null,
            dayDied: c.dayDied, node: c.node || null, looted: !!c.looted,
            carcassItems: meat.length,
            carcassPlantIds: meat.map(m => m.plantId),
            carcassSpoilDays: meat.map(m => m.spoilDay),
            rotted: meat.length > 0 && meat.every(m => m.spoilDay != null && gday() > m.spoilDay),
          });
        }
      } catch (e) {}
      flesh = {
        foodSafe,
        corpseCount: corpses.length,
        monsterCorpses: corpses.filter(c => c.kind === 'monster').length,
        carcassOnBody: corpses.reduce((t, c) => t + c.carcassItems, 0),
        rottedCarcasses: corpses.filter(c => c.rotted).length,
        corpses,
      };
    } catch (e) {}
    // r16: villager autonomy census — per-villager produced/expected from
    // contribLog (written by villagerMealDay's daily pass), need states
    // (hunger/fear/social/energy), health, plant knowledge, trust.
    let villagerDay = null;try {
      const v = Game.state.village || {};
      const clog = v.contribLog || {};
      villagerDay = (v.roster || []).map(rid => {
        const e = clog[rid] || {};
        let needs = null;
        try { const n = Game.npcNeeds(rid); needs = { hunger: Math.round(n.hunger || 0), fear: Math.round(n.fear || 0), social: Math.round(n.social || 0), energy: Math.round(n.energy || 0) }; } catch (x) {}
        let health = null;
        try { health = (v.health && v.health[rid] !== undefined) ? Math.round(v.health[rid]) : null; } catch (x) {}
        let plants = null;
        try { plants = (Game.plantsKnownBy(rid) || []).length; } catch (x) {}
        let trust = null;
        try { trust = (v.trust || {})[rid]; } catch (x) {}
        let dead = null;
        try { dead = !!person(rid).dead; } catch (x) {}
        return { id: rid, name: vname(rid), logDay: (e.day != null ? e.day : null), produced: e.produced || 0, expected: e.expected || 0, needs, health, plants, trust, dead };
      });
    } catch (e) {}
    return {
      day: gday(), pantryKcal: pantryKcal(), pop: popAlive(),
      // R41: new-villager meal-gate instruments — the player's meal record
      // per day: net kcal banked (v.lastPlayerMeal), the trust the gate keyed
      // on (same key villageMeal uses), and lineage length (bodyIsNew arm).
      meal: (() => {
        try {
          const v = Game.state.village || {};
          const sch = Game.state.scholar || {};
          const tid = sch.villagerId || Game.villagerId;
          let lin = null;
          try { lin = (Game.lineage() || []).length; } catch (e) {}
          const t = (v.trust && tid && v.trust[tid] !== undefined) ? v.trust[tid] : null;
          return {
            netBanked: (v.lastPlayerMeal != null) ? Math.round(v.lastPlayerMeal) : null,
            trust: (t != null) ? +t.toFixed(2) : null,
            lineage: lin,
            // the gate's own arithmetic on today's recorded state (meal-time
            // trust may differ by intra-day drift; the proof test is the
            // exact instrument, this is the natural-play trace)
            gateSaysHalf: (t != null && t < 30 && (lin === 0)) ,
          };
        } catch (e) { return null; }
      })(),
      // R36: plenty-deprioritization ledger read — the df66ebaff hook writes
      // village._plentyDepri.days[day] = {depri, kcal, vids} when the throttle
      // engages (>4 fresh days, hungryStreak<3).
      plenty: (() => {
        try {
          const v = Game.state.village || {};
          const d = gday();
          const rec = ((v._plentyDepri || {}).days || {})[d] || null;
          return {
            throttle: !!(Game.prodThrottleEngaged && Game.prodThrottleEngaged()),
            depri: rec ? rec.depri : 0,
            kcalEased: rec ? Math.round(rec.kcal || 0) : 0,
            villagers: rec ? ((rec.vids || []).length) : 0,
          };
        } catch (e) { return null; }
      })(),
      // r18: journal holder (V1'') + pantry piece histogram (G1 granularity)
      journalHolder: (() => { try { return Game.villagerId || null; } catch (e) { return null; } })(),
      pantryPieces: (() => {
        try {
          const p = (Game.state.village && Game.state.village.pantry) || [];
          let totalKcal = 0, n = 0; const kcals = [];
          let unknownFlesh = 0, unknownHidden = 0;
          for (const it of p) {
            const ke = it.kcalEach || 0, u = it.units || 1;
            totalKcal += ke * u; n += u;
            for (let i = 0; i < u; i++) kcals.push(ke);
            if (/unknown flesh/i.test(it.name || '')) {
              unknownFlesh += u; unknownHidden += (it.hiddenKcal || 0) * u;
            }
          }
          kcals.sort((a, b) => a - b);
          return {
            pieces: n, totalKcal: Math.round(totalKcal),
            medianKcalEach: kcals.length ? kcals[Math.floor(kcals.length / 2)] : 0,
            maxKcalEach: kcals.length ? kcals[kcals.length - 1] : 0,
            unknownFleshUnits: unknownFlesh,
            unknownFleshHiddenKcal: Math.round(unknownHidden),
          };
        } catch (e) { return null; }
      })(),
      deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause })),
      villagerDay,
      mealTotals: (() => { try { const v = Game.state.village || {}; return { ate: Math.round(v.lastEat || 0), gave: Math.round(v.lastGive || 0) }; } catch (e) { return null; } })(),
      scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
      scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
      scholarHydration: Math.round((Game.state.scholar && Game.state.scholar.hydration) || 0),
      villageWater: (() => { try { const w = (Game.state.village || {}).water || {}; return { clean: Math.floor(w.clean || 0), dirty: Math.floor(w.dirty || 0) }; } catch (e) { return null; } })(),
      scholarAlive: !!(Game.state.scholar) && !Game.over,
      villageGrief: (() => { try { return Game.state.village.grief; } catch (e) { return null; } })(),
      loc, packKcal, packItems, invKcal, sentiment, feastState,
      gossipCensus, monsterCodex, rumorTrack, vitals,
      followers, trustMap, trustMax, trustMaxName,
      namesKnown, namesKnownNames, flesh,
    };
  };
  // r8: starvation-death autopsy — record context the day it happens
  const starvAutopsies = [];
  // R46: live contest watch — called once per loop iteration (top) and once
  // after the loop, so a contest spanning iterations is captured with its
  // participants. Telemetry fired/end pairs cover contests the watch misses;
  // the watch only enriches, never gates. Errors are logged, never swallowed.
  const watchContests = () => {
    try {
      const ac = Game.state && Game.state.activeContest;
      const id = (ac && (ac.contestId || ac.showId)) || null;
      const kind = (ac && ac.contestId) ? 'contest' : ((ac && ac.kind) || null);
      if (id && _liveContestId !== id) {
        _liveContestId = id;
        let parts = [];
        try { parts = (ac.participants || []).map(v => (v === 'player' ? vname(Game.villagerId) : vname(v))); }
        catch (e) { console.log('contest watch participants ERROR: ' + (e && e.message)); }
        let part = null;
        try { part = ac.participant ? (ac.participant === 'player' ? vname(Game.villagerId) : vname(ac.participant)) : null; }
        catch (e) { console.log('contest watch participant ERROR: ' + (e && e.message)); }
        CONTEST_LIVE.push({ contestId: id, kind, startDay: gday(), participants: parts, participant: part });
        console.log(`*** CONTEST LIVE day ${gday()}: ${id} kind=${kind} participants=[${parts.join(', ')}]`);
      } else if (!id && _liveContestId) {
        const last = CONTEST_LIVE[CONTEST_LIVE.length - 1];
        if (last && !last.endDay) last.endDay = gday();
        _liveContestId = null;
      }
    } catch (e) { console.log('contest watch ERROR: ' + (e && e.message)); }
  };
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
  while (!Game.over && loop++ < 80) {
    watchContests(); // R46: catch contests started by the previous iteration's drives
    const gd = gday();
    if (gd >= day0 + DAYS) break;
    // R36: System-contact detection runs EVERY iteration, not just on day
    // change — checkSystemArrival fires at dawn (s.day >= 7), which can land
    // mid-iteration when a forage trip rolls the day; day-change-only
    // detection reads a day late (seed 201 pilot: actual day-8 dawn, read 9).
    {
    // System contact detection
    const sysNow = !!(Game.state && Game.state.systemArrived);
    if (!sysWas && sysNow) {
      systemDay = gday();
      systemFile = path.join(OUTDIR, `journey-landing-r62-system-${seed}.txt`);
      // r11: narration window from 2 days before the flip + the FULL
      // systemArrivalBeats() script (the staged cinematic the overlay shows;
      // sim-harness Game.say is silenced, so recap lines alone aren't the
      // whole event) + the first-ability tutorial offers.
      const start = (capMarks[systemDay - 2] != null) ? capMarks[systemDay - 2] : 0;
      let text = `=== seed ${seed}: System contact fired on game-day ${systemDay} ===\n`;
      text += `\n--- narration stream (game-day ${systemDay - 2} .. ${systemDay}, ${capture.length - start} lines) ---\n`;
      text += capture.slice(start).join('\n') + '\n';
      text += `\n--- systemArrivalBeats() FULL SCRIPT (what the overlay stages) ---\n`;
      try {
        const beats = Game.systemArrivalBeats() || [];
        text += `${beats.length} beats\n`;
        for (const b of beats) {
          text += `\n[beat: ${b.id}] kicker="${b.kicker}" button="${b.button}"\n`;
          for (const ln of (b.lines || [])) text += `  (${ln.who}) ${ln.text}\n`;
        }
      } catch (e) { text += `BEATS ERROR: ${(e && e.message)}\n`; }
      text += `\n--- first-ability tutorial offers ---\n`;
      try {
        const s = Game.state.scholar || {};
        text += `abilityChoices offered: ` + JSON.stringify((s.abilityChoices || []).map(c => ({
          id: c.id || c, name: c.name,
          description: (c.description || '').slice(0, 200),
          flavor: (c.flavor || '').slice(0, 200),
          tier: c.tier,
        })), null, 1) + '\n';
        text += `abilities so far: ` + JSON.stringify(s.abilities || []) + '\n';
        text += `codexUnlocked: ${!!s.codexUnlocked}, partyUnlocked: ${!!((Game.state.village || {}).partyUnlocked)}, dialGlitch: ${!!Game.state.dialGlitch}\n`;
      } catch (e) { text += `OFFERS ERROR: ${(e && e.message)}\n`; }
      fs.writeFileSync(systemFile, text);
      console.log(`*** SYSTEM CONTACT on day ${systemDay} -> ${systemFile}`);
    }
    sysWas = sysNow;
    }
    if (gd !== lastGd) {
      lastGd = gd;
      capMarks[gd] = capture.length; // r11: day-boundary narration marks
      // social beat: one full conversation per game day. The second observed
      // game-day deliberately sits a nonverbal villager (robust to day skips —
      // a forage trip can roll a day boundary mid-iteration).
      const nvSit = (lastNvGd < 0 && gd > day0);
      if (atHaven()) {
        const vid = pickVillager(nvSit && lastNvGd < 0) || pickVillager(false);
        if (vid) {
          const didNv = nvSit && lastNvGd < 0;
          let topicSit = !ctx._topicProbed && !didNv && gd >= day0 + 4;
          // R55: one WD sitting per seed, after the topic probe — or,
          // if the topic probe still hasn't disarmed by day0+10 after
          // >=3 attempts, the WD sitting preempts it (otherwise an
          // undisarmed topic probe would block the WD probe forever).
          let wdSit = !ctx._wdProbed && !didNv && (ctx._topicProbed || (gd >= day0 + 10 && (ctx._topicSitDays || 0) >= 3));
          if (wdSit) topicSit = false;
          if (topicSit) ctx._topicSitDays = (ctx._topicSitDays || 0) + 1;
          try {
            const fp = runConversation(seed, gd, vid, didNv, topicSit, wdSit);
            // R53 pilot fix: a probe sitting that never got a topic ask
            // (reactive-question menu, no topic offered) does NOT count —
            // stay armed for the next haven day until a THREAD ask lands
            // (ask:gossip does not open a 'more' thread — it must not disarm).
            if (topicSit && (MET.topicProbeThreadAsks || 0) > 0) ctx._topicProbed = true;
            // R55: a WD sitting that landed a thread ask also serves the
            // topic probe's purpose.
            if (wdSit && (MET.topicProbeThreadAsks || 0) > 0) ctx._topicProbed = true;
            // R55: a WD sitting counts once it reached winddown, or ran
            // >=10 turns (a real attempt); an early-ending sitting stays
            // armed for a later haven day.
            if (wdSit && WD_SIT_RESULT && (WD_SIT_RESULT.surfaced || WD_SIT_RESULT.turns >= 10)) ctx._wdProbed = true;
            transcriptFiles.push(fp);
            console.log(`convo with ${vname(vid)}${didNv ? ' [NV]' : ''} -> ${fp}`);
          } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
          talked.add(vid);
          if (didNv) lastNvGd = gd;
        } else console.log('no fresh conversational villager today');
      } else console.log(`day ${gd}: player away from haven — no conversation beat`);

      // R22 FLESH_PROBE=2 (refined): the natural-arc probe. On game-day 1,
      // register a fresh hummice corpse ONE tile from haven with carcass
      // meat, and have every villager remember it (the gossip-spread
      // equivalent). Then let the NATURAL daily machinery run: objective
      // lottery / DAWN-AFTER-KILL → HAUL → travel → mapmemHaulAt → return →
      // pantry deposit → villagerExperimentBeat. If the full arc completes
      // without direct function-driving, the wild path is proven end-to-end.
      if (process.env.FLESH_PROBE === '2' && !ctx._fleshProbed2 && gd >= day0) {
        ctx._fleshProbed2 = true;
        try {
          const roster = (Game.state.village.roster || []).filter(id =>
            id !== Game.villagerId && !person(id).dead);
          const mdef = (Game.data.monsters || []).find(m => m.id === 'hummice');
          const hx = 4, hy = 4;
          const node = { x: hx + 1, y: hy };
          const corpse = Game.registerDeath({
            kind: 'monster', monsterId: 'hummice', monsterName: mdef.name,
            name: (Game.monsterDisplayName ? Game.monsterDisplayName('hummice') : 'the beast'),
            descriptor: (Game.monsterDisplayName ? Game.monsterDisplayName('hummice') : null),
            node, cause: 'villager combat (probe2)', killerId: roster[0] || null,
            witnesses: roster.slice(0, 2),
          });
          if (corpse) {
            const meat = Game.monsterCarcassEntries ? Game.monsterCarcassEntries(mdef) : [];
            for (const me of meat) corpse.items.push(me);
            let n = 0;
            for (const vid of roster) {
              try { if (Game.mapmemRemember(vid, corpse)) n++; } catch (e) {}
            }
            ctx._fleshProbe2 = { day: gd, corpseId: corpse.id, rememberedBy: n,
              meatPlantIds: meat.map(m => m.plantId) };
            console.log(`*** FLESH-PROBE2 day ${gd}: hummice corpse at (${node.x},${node.y}), remembered by ${n}/${roster.length} villagers`);
          }
        } catch (e) { console.log('FLESH-PROBE2 ERROR: ' + (e && e.stack || e)); }
      }
      // day 2, register two fresh monster corpses in the wild with carcass
      // meat on them, and have two villagers remember the sites
      // (mapmemRemember) — the same entry point the natural kill path uses
      // (see mapmem kill-note at game.js:7145/18409). This stages the KILL
      // but exercises the REAL machinery downstream: mapmem memory → HAUL
      // objective → haul → pantry deposit → villagerExperimentBeat (try/
      // taste, honest risk) → reveal. hummice = non-toxic 150-kcal flesh
      // (expect: haul → tested → markMonsterFoodSafe); belltoad = toxic
      // flesh (expect: hurtVillager + 'poison' verdict, the honest risk
      // outcome). Both start unknown (codex monsters[].foodSafe unset).
      if (process.env.FLESH_PROBE === '1' && !ctx._fleshProbed && gd >= day0 + 1) {
        ctx._fleshProbed = true;
        try {
          const roster = (Game.state.village.roster || []).filter(id =>
            id !== Game.villagerId && !person(id).dead);
          const mkProbeCorpse = (mid, vid) => {
            const mdef = (Game.data.monsters || []).find(m => m.id === mid);
            if (!mdef) { console.log(`FLESH-PROBE: no mdef for ${mid}`); return null; }
            // a wild node a few tiles out — the villager hauls across real
            // distance (the honest 3-day rot clock runs).
            const hx = 4, hy = 4;
            const node = { x: hx + 2, y: hy + 3 };
            const corpse = Game.registerDeath({
              kind: 'monster', monsterId: mid, monsterName: mdef.name,
              name: (Game.monsterDisplayName ? Game.monsterDisplayName(mid) : (mdef.name || 'the beast')),
              descriptor: (Game.monsterDisplayName ? Game.monsterDisplayName(mid) : null),
              node, cause: 'villager combat (probe)', killerId: vid, witnesses: [vid],
            });
            if (!corpse) { console.log('FLESH-PROBE: registerDeath returned null'); return null; }
            const meat = Game.monsterCarcassEntries ? Game.monsterCarcassEntries(mdef) : [];
            for (const me of meat) corpse.items.push(me);
            let site = null;
            try { site = Game.mapmemRemember(vid, corpse); } catch (e) { console.log('FLESH-PROBE mapmemRemember ERROR: ' + (e && e.message)); }
            return { corpseId: corpse.id, site, vid, mid,
              meatPlantIds: meat.map(m => m.plantId), spoilDay: meat.map(m => m.spoilDay) };
          };
          const v1 = roster[0], v2 = roster[1] || roster[0];
          const p1 = v1 ? mkProbeCorpse('hummice', v1) : null;
          const p2 = v2 ? mkProbeCorpse('belltoad', v2) : null;
          ctx._fleshProbe = { day: gd, p1, p2 };
          console.log('*** FLESH-PROBE day ' + gd + ': ' + JSON.stringify({ p1, p2 }));
          (MET.fleshProbeEvents = MET.fleshProbeEvents || []).push({ day: gd, p1, p2 });
        } catch (e) { console.log('FLESH-PROBE ERROR: ' + (e && e.stack || e)); }
      }
      const snap = daySnapshot();
      series.push(snap);
      // r18: mantle tracking — the journal holder can change when the
      // bearer dies (V1'': the meal-loop parity exclusion follows the
      // mantle, so autonomy coverage must too).
      try {
        const holder = snap.journalHolder || null;
        if (lastHolder !== null && holder !== lastHolder) {
          mantleLog.push({ day: snap.day, from: lastHolder, to: holder,
            fromName: vname(lastHolder), toName: vname(holder) });
          console.log(`*** MANTLE PASS day ${snap.day}: ${vname(lastHolder)} -> ${vname(holder)}`);
        }
        lastHolder = holder;
      } catch (e) {}
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
  if (loop >= 80) console.log(`SEED ${seed}: LOOP GUARD HIT at game-day ${gday()}`);

  watchContests(); // R46: close any contest still open at horizon end
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

  // R15: backstory Taking scan — do villager backstories reference taken
  // family? journalPerson(vid) carries 'backstory' learn entries. Any
  // journal field mentioning taken/missing/gone family counts; raw samples
  // are kept so the sense-read is real, not a keyword count.
  const BACKSTORY_TAKE_RE = /taken|missing|gone|lost (my|his|her|their|the) (family|kin|wife|husband|son|daughter|mother|father|sister|brother|child|children|baby)|boring half|never came back|didn't make it|scattering took|stasis|napping/i;
  function scanBackstories() {
    const out = [];
    let roster = [];
    try { roster = (Game.state.village && Game.state.village.roster) || []; } catch (e) {}
    for (const vid of roster) {
      let texts = [];
      try {
        const j = Game.journalPerson ? Game.journalPerson(vid) : null;
        const arr = (j && j.backstory) || [];
        for (const e of arr) {
          const t = (e && (e.text || '')) || '';
          if (t) texts.push(String(t));
        }
      } catch (e) {}
      const combined = texts.join('\n');
      const refs = combined.split('\n').filter(t => BACKSTORY_TAKE_RE.test(t)).map(t => t.slice(0, 260));
      out.push({
        vid, name: vname(vid), alive: (() => { try { return !person(vid).dead; } catch (e) { return null; } })(),
        backstoryCount: texts.length, takingRefs: refs.length, takingSamples: refs.slice(0, 4),
      });
    }
    return out;
  }

  const census = buildCensus();
  // r12: trust-movement ledger from the tele stream (fullTelemetry on).
  // Groups trust deltas by reason: which verbs actually move trust in week 1.
  const trustLedger = {};
  let trustEvents = 0;
  try {
    for (const t of (Game.state.telemetry || [])) {
      if (!t || t.type !== 'trust') continue;
      trustEvents++;
      const reason = String(t.reason || '?').slice(0, 90);
      const e = trustLedger[reason] || (trustLedger[reason] = { n: 0, deltaSum: 0, posN: 0, negN: 0 });
      e.n++; e.deltaSum += (t.delta || 0);
      if ((t.delta || 0) > 0) e.posN++; else if ((t.delta || 0) < 0) e.negN++;
    }
    for (const e of Object.values(trustLedger)) e.deltaSum = +e.deltaSum.toFixed(2);
  } catch (e) { console.log('trust ledger ERROR: ' + (e && e.message)); }
  // R46: away-day digest — per snapshot day, the narration lines between this
  // day's boundary mark and the next, scanned for eat-attempt evidence. Built
  // from capMarks (day-boundary capture indices) + the captured stream.
  const awayDayDigest = (() => {
    try {
      const days = series.map(s => s.day);
      const out = [];
      for (let i = 0; i < days.length; i++) {
        const d = days[i];
        const start = capMarks[d] != null ? capMarks[d] : 0;
        const end = (i + 1 < days.length && capMarks[days[i + 1]] != null)
          ? capMarks[days[i + 1]] : capture.length;
        const lines = capture.slice(start, end);
        const pick = (re, n) => lines.filter(l => re.test(String(l))).slice(0, n);
        const snap = series[i];
        out.push({
          day: d, loc: snap.loc, scholarKcal: snap.scholarKcal,
          packKcal: snap.packKcal, invKcal: snap.invKcal,
          packItems: snap.packItems || [],
          pantryKcal: snap.pantryKcal,
          nothingEdible: pick(/Nothing edible/i, 3).length,
          nothingEdibleSamples: pick(/Nothing edible/i, 3),
          gutLines: pick(/gut churns|was off|went bad|poisoned/i, 3).length,
          fullLines: pick(/full enough/i, 2).length,
        });
      }
      return out;
    } catch (e) { console.log('awayDayDigest ERROR: ' + (e && e.message)); return null; }
  })();
  const censusPath = path.join(OUTDIR, `journey-landing-r62-census-${seed}.json`);
  // R30: death-liturgy + theft rate-bar summary for the analyzer
  // R39: + night-beat / laugh / seek-suggest / motivation-wiring fields
  // R41: day-1 nudge fire sensor (see MET comment) — attribute the day
  // via the day-boundary capture marks.
  try {
    for (let i = 0; i < capture.length; i++) {
      if (/pretending they're fine/.test(String(capture[i] || ''))) {
        MET.dayOneNudgeFired++;
        if (MET.dayOneNudgeDay == null) {
          let best = day0;
          for (const k of Object.keys(capMarks)) { const kk = +k; if (kk >= day0 && capMarks[k] <= i && kk > best) best = kk; }
          MET.dayOneNudgeDay = best;
        }
        if (!MET.dayOneNudgeSample) MET.dayOneNudgeSample = String(capture[i]).slice(0, 200);
      }
    }
  } catch (e) { console.log('nudge scan ERROR: ' + (e && e.message)); }
  // R41: "Half ration" voice scan — attribute the meal beat's parenthetical
  // to days via capMarks; the run note compares beats-per-day against the
  // gate (trust<30 && lineage empty) for voice==share.
  MET.halfRationBeats = MET.halfRationBeats || [];
  try {
    for (let i = 0; i < capture.length; i++) {
      if (/Half ration — they don/.test(String(capture[i] || ''))) {
        let best = day0;
        for (const k of Object.keys(capMarks)) { const kk = +k; if (kk >= day0 && capMarks[k] <= i && kk > best) best = kk; }
        MET.halfRationBeats.push({ day: best, sample: String(capture[i]).slice(0, 160) });
      }
    }
  } catch (e) { console.log('halfr scan ERROR: ' + (e && e.message)); }
  // R41: reset per-seed like the rest (the r40 MET-bleed lesson).
  const r41MealLedger = (series || []).map(s => ({ day: s.day,
    netBanked: (s.meal && s.meal.netBanked), trust: (s.meal && s.meal.trust),
    lineage: (s.meal && s.meal.lineage) }));
  var r41 = {
    dayOneNudgeFired: MET.dayOneNudgeFired || 0,
    dayOneNudgeDay: MET.dayOneNudgeDay,
    dayOneNudgeSample: MET.dayOneNudgeSample || '',
    nvPicks: MET.nvPicks || 0,
    nvConvos: MET.nvConvos || 0,
    nvOfferedTotal: MET.nvOfferedTotal || 0,
    nvWinddownSurfaced: MET.nvWinddownSurfaced || 0,
    nvWinddownClosed: MET.nvWinddownClosed || 0,
    nvStuckLoops: MET.nvStuckLoops || 0,
    nearDupeQuoteExcluded: MET.nearDupeQuoteExcluded || 0,
    nearDupes: MET.nearDupes || 0,
    headcountCodas: MET.headcountCodas || 0,
    griefBeats: MET.griefBeats || 0,
    caughtRedHanded: MET.caughtRedHanded || 0,
    deathLineSamples: (MET.deathLineSamples || []).slice(0, 30),
    caughtRedHandedLines: (MET.caughtRedHandedLines || []).slice(0, 10),
    headcountCodaLines: (MET.headcountCodaLines || []).slice(0, 10),
    griefBeatLines: (MET.griefBeatLines || []).slice(0, 20),
    // R36: plenty-voice + fallen audit + per-day ledger series
    plentyVoiceLines: MET.plentyVoiceLines || 0,
    plentyVoiceSamples: (MET.plentyVoiceSamples || []).slice(0, 14),
    fallenDupes: MET.fallenDupes || 0,
    fallenDupeSamples: (MET.fallenDupeSamples || []).slice(0, 10),
    plentyLedger: series.map(s => ({ day: s.day, plenty: s.plenty })),
    // R39: Roguelike-P1 night beats in act 0
    debriefLines: MET.debriefLines || 0,
    debriefLineSamples: (MET.debriefLineSamples || []).slice(0, 20),
    graveMarkerLines: MET.graveMarkerLines || 0,
    graveMarkerSamples: (MET.graveMarkerSamples || []).slice(0, 10),
    laughVoices: {
      mutiny: MET.laugh_mutiny || 0, borrowed: MET.laugh_borrowed || 0,
      honest: MET.laugh_honest || 0, backToBack: MET.laughBackToBack || 0,
    },
    laughLineSamples: (MET.laughLineSamples || []).slice(0, 12),
    seekSuggestLines: MET.seekSuggestLines || 0,
    seekSuggestSamples: (MET.seekSuggestSamples || []).slice(0, 8),
    objectivesWarns: MET.objectivesWarns || 0,
    objectivesWarnSamples: (MET.objectivesWarnSamples || []).slice(0, 8),
    nightfallWarns: MET.nightfallWarns || 0,
    nightfallWarnSamples: (MET.nightfallWarnSamples || []).slice(0, 8),
    // R41: new-villager meal gate — voice==share audit trail
    halfRationBeats: (MET.halfRationBeats || []).slice(0, 30),
    mealLedger: r41MealLedger,
    // R42: thread-depth pursuit instruments
    moreOffered: MET.moreOffered || 0,
    morePicks: MET.morePicks || 0,
    goonPicks: MET.goonPicks || 0,
    moreBeats: MET.moreBeats || 0,
    goonBeats: MET.goonBeats || 0,
    dlgMoreBeats: MET.dlgMoreBeats || 0,
    depthFizzles: MET.depthFizzles || 0,
    depthFizzleSamples: (MET.depthFizzleSamples || []).slice(0, 20),
    depthHonestExhaustions: MET.depthHonestExhaustions || 0,
    depthHonestExhaustionSamples: (MET.depthHonestExhaustionSamples || []).slice(0, 20),
    depthContentBeats: MET.depthContentBeats || 0,
    depthEmptyBeats: MET.depthEmptyBeats || 0,
    sitDepthSum: MET.sitDepthSum || 0,
    sitDepth2Plus: MET.sitDepth2Plus || 0,
    fabricHistoryFlags: MET.fabricHistoryFlags || 0,
    // R47: blind-betrayal audit
    betrayalOfferCount: MET.betrayalOfferCount || 0,
    betrayalOfferSamples: (MET.betrayalOfferSamples || []).slice(0, 40),
    // R54: winddown-'more' instrument (r53 empty-beat shape, post-fix)
    wdMorePicks: MET.wdMorePicks || 0,
    wdMoreEmpty: MET.wdMoreEmpty || 0,
    wdMoreSamples: (MET.wdMoreSamples || []).slice(0, 20),
    // R55: winddown-probe sittings (one per seed by design)
    wdProbeSamples: (MET.wdProbeSamples || []).slice(0, 20),
    // R56: page-hunt instruments (per-seed totals; samples carry per-sitting)
    wdPageTurns: MET.wdPageTurns || 0,
    wdPage3Visits: MET.wdPage3Visits || 0,
  };
  // R46: contest ledger + death autopsy. Telemetry is primary (contest_fired
  // / contest_end carry day + outcome); the live watch adds participants;
  // TV narration excerpts give the contest's plain-words name and the death
  // line when one fired. Errors are logged, never swallowed.
  const contestLedger = (() => {
    const byId = {};
    try {
      const tele = Game.state.telemetry || [];
      for (const t of tele) {
        if (!t) continue;
        if (t.type === 'contest_fired') {
          const e = byId[t.id] || (byId[t.id] = { contestId: t.id, firedDay: null, endDay: null, outcome: null, firedFromTele: false, endedFromTele: false, firedDays: [], endDays: [] });
          e.firedFromTele = true;
          if (e.firedDay == null) e.firedDay = t.day;
          if (t.day != null) e.firedDays.push(t.day);
        } else if (t.type === 'contest_end') {
          const e = byId[t.id] || (byId[t.id] = { contestId: t.id, firedDay: null, endDay: null, outcome: null, firedFromTele: false, endedFromTele: false, firedDays: [], endDays: [] });
          e.endedFromTele = true;
          e.endDay = t.day;
          e.outcome = t.outcome;
          if (t.day != null) e.endDays.push(t.day);
        }
      }
    } catch (e) { console.log('contest ledger telemetry ERROR: ' + (e && e.message)); }
    for (const l of CONTEST_LIVE) {
      const e = byId[l.contestId] || (byId[l.contestId] = { contestId: l.contestId, firedDay: null, endDay: null, outcome: null, firedFromTele: false, endedFromTele: false, firedDays: [], endDays: [] });
      e.kind = l.kind;
      e.participants = l.participants;
      e.participant = l.participant;
      if (e.firedDay == null) e.firedDay = l.startDay;
      if (e.endDay == null) e.endDay = l.endDay;
      // R46: rendered phases live on the held reference (strings only).
      if (l._ref) {
        try {
          const ph = (l._ref.phases || []).map(p => String((p && p.text) || '')).filter(t => t.trim());
          if (ph.length) e.phaseExcerpts = [ph[0], ph[ph.length - 1]].filter((t, i, a) => t && a.indexOf(t) === i).map(t => t.slice(0, 400));
        } catch (err) { console.log('contest phase excerpts ERROR: ' + (err && err.message)); }
      }
    }
    // R46: plain-words names from the contest defs (src/data/contests.json).
    let contestDefs = [];
    try { contestDefs = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/contests.json'), 'utf8')); }
    catch (err) { console.log('contest defs ERROR: ' + (err && err.message)); }
    for (const e of Object.values(byId)) {
      const def = (Array.isArray(contestDefs) ? contestDefs : []).find(dd => dd && dd.id === e.contestId);
      if (def) { e.name = def.name; e.cat = def.cat; e.desc = def.desc; }
    }
    const dayWindow = (day) => {
      try {
        const days = series.map(s => s.day);
        const i = days.indexOf(day);
        const start = (capMarks[day] != null) ? capMarks[day] : 0;
        const end = (i >= 0 && i + 1 < days.length && capMarks[days[i + 1]] != null) ? capMarks[days[i + 1]] : capture.length;
        return capture.slice(start, end);
      } catch (e) { console.log('contest dayWindow ERROR: ' + (e && e.message)); return []; }
    };
    for (const e of Object.values(byId)) {
      try {
        const from = (e.firedDay != null) ? e.firedDay : 0;
        const to = (e.endDay != null) ? e.endDay : from;
        const lines = [];
        for (let d = from; d <= to; d++) {
          for (const s of dayWindow(d)) {
            const t = String(s || '');
            if (t.includes('📺')) lines.push(t.slice(0, 300));
          }
        }
        const deathish = lines.filter(t => /dead|dies|died|killed|arena/i.test(t));
        e.tvExcerpts = deathish.slice(0, 6);
        e.tvLineCount = lines.length;
        if (!deathish.length) e.tvExcerpts = lines.slice(0, 3);
      } catch (err) { console.log('contest excerpts ERROR: ' + (err && err.message)); e.tvExcerpts = []; e.tvLineCount = 0; }
    }
    return Object.values(byId);
  })();
  const contestDeathAutopsies = (() => {
    const out = [];
    const dayWindow = (day) => {
      try {
        const days = series.map(s => s.day);
        const i = days.indexOf(day);
        const start = (capMarks[day] != null) ? capMarks[day] : 0;
        const end = (i >= 0 && i + 1 < days.length && capMarks[days[i + 1]] != null) ? capMarks[days[i + 1]] : capture.length;
        return capture.slice(start, end);
      } catch (e) { console.log('contest autopsy dayWindow ERROR: ' + (e && e.message)); return []; }
    };
    for (const d of deathsSoFar()) {
      try {
        const cause = String(d.cause || '');
        const arenaish = /arena|contest|pit|gauntlet|siege|death reel/i.test(cause);
        const lines = dayWindow(d.day).filter(s => String(s || '').includes('📺')).map(s => String(s).slice(0, 300));
        const deathLines = lines.filter(t => /dead|dies|died|killed|arena/i.test(t));
        const span = contestLedger.find(c => c.firedDay != null && c.firedDay <= d.day && (c.endDay == null || d.day <= c.endDay));
        let nm = d.who;
        try { nm = vname(d.who); } catch (e) { console.log('contest autopsy name ERROR: ' + (e && e.message)); }
        // R58: name-matched death lines — a recycled TV line naming someone
        // else (r57 655 d25: the Desmond-glow Vigil line) must not count as
        // this death's televised context. The un-narrowed deathLines stay
        // for the rule; the analyzer adjudicates unnamed-line MISSINGs with
        // the mantle pass (JOIN ARTIFACT, not ledger failure).
        const firstName = String(nm || '').split(/\s+/)[0] || '';
        const deathLinesNamed = firstName ? deathLines.filter(t => t.includes(firstName)) : [];
        // R47 fix (619 LaToya/Sorting): a day-span join alone over-claims.
        // LaToya died d15 'in the arena', Sorting fired d15 — but the
        // contest's participant was Hattie, her successor, and no 📺 death
        // line fired: a wild fight loss on a contest day, not a contest
        // death. A span counts as contest context only when the deceased
        // is a recorded participant OR a televised death line exists
        // (participant lists can be partial); a spanned, non-participant,
        // untelevised arena death is WILD-ARENA-COINCIDENT.
        const participantMatch = !!(span && (span.participants || []).includes(nm));
        const spanContext = participantMatch || deathLines.length;
        out.push({ day: d.day, who: d.who, name: nm, cause, kind: d.kind, arenaish,
          contestId: span ? span.contestId : null, contestOutcome: span ? span.outcome : null,
          contestParticipants: span ? span.participants : null, deathLines, deathLinesNamed,
          deathLineNamesDeceased: deathLinesNamed.length > 0,
          // R46 fix: 'the arena' is also the grid-as-arena for wild fight
          // losses (tbEnd 'lost' reports every scholar fight loss this
          // way). A televised contest death carries a 📺 death line; an
          // arena-cause death with no span AND no death line is a wild
          // fight loss, not a contest death with missing context. MISSING
          // is reserved for televised-but-unspanned deaths.
          context: (span && spanContext) ? 'LEDGER' : (span ? (arenaish ? 'WILD-ARENA-COINCIDENT' : 'n/a') : (arenaish && deathLines.length ? 'MISSING' : (arenaish ? 'WILD-ARENA' : 'n/a'))) });
      } catch (e) { console.log('contest autopsy ERROR: ' + (e && e.message)); }
    }
    return out;
  })();
  console.log(`SEED ${seed} CONTESTS: held=${(() => { try { return Game.state.contestsHeld || 0; } catch (e) { return 0; } })()} ledger=${contestLedger.length} autopsies=${contestDeathAutopsies.length} missing=${contestDeathAutopsies.filter(a => a.context === 'MISSING').length} wildArena=${contestDeathAutopsies.filter(a => a.context === 'WILD-ARENA').length}`);
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, spawn, systemDay, systemFile, transcriptFiles, series, census, overAt,
    starvAutopsies, awayDayDigest,
    // R45 pilot fix: a death landing after the last day-snapshot (609 d14)
    // has no next snapshot, so the snapshot rule falsely scores it a miss
    // even though the death + grief lines fired. Record the grief value at
    // census-write time (after all tail drives) for that edge case.
    finalGrief: (() => { try { return Game.state.village.grief; } catch (e) { return null; } })(),
    contestsHeld: (() => { try { return Game.state.contestsHeld || 0; } catch (e) { return 0; } })(),
    contestLedger,
    contestDeathAutopsies,
    r41Summary: r41,
    // r18: mantle pass log (V1'') + pantry granularity series (G1)
    mantleLog,
    granularity: {
      day14: series.length ? series[series.length - 1].pantryPieces : null,
      pieceSeries: series.map(x => ({ day: x.day,
        pieces: x.pantryPieces && x.pantryPieces.pieces,
        totalKcal: x.pantryPieces && x.pantryPieces.totalKcal,
        median: x.pantryPieces && x.pantryPieces.medianKcalEach,
        max: x.pantryPieces && x.pantryPieces.maxKcalEach,
        unknownFlesh: x.pantryPieces && x.pantryPieces.unknownFleshUnits,
        unknownHidden: x.pantryPieces && x.pantryPieces.unknownFleshHiddenKcal })),
    },
    wateR14: Object.assign({}, WATER, { fillDays: Array.from(WATER.fillDays) }),
    deaths13: DEATHS,
    folTelemetry: FOL, abilityOfferLog,
    // r12: name-learning log (day/name/how/lines) + trust ledger by reason
    nameLog, trustLedger, trustEvents,
    namesKnownByDay: series.map(s => ({ day: s.day, n: s.namesKnown })),
    // R15: Taking telemetry — backstory scan, in-stream Taking lines, and
    // the pre-System trust ceiling (volunteer reachability question)
    takingBackstories: scanBackstories(),
    takingStream: {
      system: MET.takingSystemSamples || [], villager: MET.takingVillagerSamples || [],
    },
    // R15: who CAN draw seek_taken (villagers with Taking-marked lifeseed
    // kin) — the eligibility pool for the leg's villager-side question.
    takenKinCensus: (() => {
      const out = [];
      try {
        const roster = (Game.state.village && Game.state.village.roster) || [];
        for (const vid of roster) {
          let kin = [];
          try { kin = (Game.takenKinOf ? Game.takenKinOf(vid) : []) || []; } catch (e) {}
          if (kin.length) {
            out.push({
              vid, name: vname(vid),
              kin: kin.map(k => ({ name: (k.name || '').split(' ')[0], relation: k.relation, fate: String(k.fate || '').slice(0, 120) })),
            });
          }
        }
      } catch (e) {}
      return out;
    })(),
    preSystemTrustMax: (() => {
      let m = 0;
      for (const s of series) {
        if (systemDay != null && s.day >= systemDay) break;
        if (s.trustMax != null && s.trustMax > m) m = s.trustMax;
      }
      return m;
    })(),
    preSystemTrustMaxName: (() => {
      let m = 0, nm = null;
      for (const s of series) {
        if (systemDay != null && s.day >= systemDay) break;
        if (s.trustMax != null && s.trustMax > m) { m = s.trustMax; nm = s.trustMaxName; }
      }
      return nm;
    })(),
    // R16: village autonomy — do villagers act like people on their own?
    // Aggregated from series[].villagerDay (contribLog entries keyed by
    // their log day). Coverage: villager-days with a fresh contribLog day
    // entry out of observed days. Self-sufficiency: sum produced over
    // (avg pop x 2000 kcal x observed days). Hunger: fraction of villager
    // readings with hunger >90. Effort: sum produced / sum expected.
    villageAutonomy: (() => {
      const by = {};
      const needState = { hunger: [], fear: [], social: [], energy: [] };
      let hungOver90 = 0, hungReadings = 0;
      for (const snap of series) {
        for (const vd of (snap.villagerDay || [])) {
          if (vd.dead) continue;
          const b = by[vd.id] || (by[vd.id] = { id: vd.id, name: vd.name, days: new Set(), obs: new Set(), produced: 0, expected: 0, trusts: [], plantsEnd: null });
          // r18 V1'': the journal holder is the player — their meal-loop
          // parity exclusion follows the mantle, so observed days exclude
          // holder days (per-villager, since the mantle can pass mid-run).
          const isHolder = snap.journalHolder != null && vd.id === snap.journalHolder;
          if (!isHolder) b.obs.add(snap.day);
          if (vd.logDay != null) {
            const k = vd.logDay;
            if (!b.days.has(k)) {
              b.days.add(k);
              b.produced += vd.produced || 0;
              b.expected += vd.expected || 0;
            }
          }
          if (vd.needs && !isHolder) {
            for (const kk of ['hunger', 'fear', 'social', 'energy']) if (vd.needs[kk] != null) needState[kk].push(vd.needs[kk]);
            if (vd.needs.hunger != null) { hungReadings++; if (vd.needs.hunger > 90) hungOver90++; }
          }
          if (vd.trust != null) b.trusts.push(vd.trust);
          if (vd.plants != null) b.plantsEnd = vd.plants;
        }
      }
      const perVillager = Object.values(by).map(b => ({
        id: b.id, name: b.name, coverageDays: b.days.size,
        observedDays: b.obs.size,
        v1ppPass: b.days.size >= b.obs.size - 2,
        produced: Math.round(b.produced), expected: Math.round(b.expected),
        effort: b.expected > 0 ? +(b.produced / b.expected).toFixed(3) : null,
        trustEnd: b.trusts.length ? b.trusts[b.trusts.length - 1] : null,
        plantsEnd: b.plantsEnd,
      }));
      const totProd = perVillager.reduce((t, x) => t + x.produced, 0);
      const totExp = perVillager.reduce((t, x) => t + x.expected, 0);
      const obsDays = series.length;
      const avgPop = series.length ? series.reduce((t, x) => t + (x.pop || 0), 0) / series.length : 0;
      const need = avgPop * 2000 * obsDays;
      const social = {};
      for (const kk of Object.keys(needState)) {
        const a = needState[kk];
        social[kk] = a.length ? { mean: +(a.reduce((t, x) => t + x, 0) / a.length).toFixed(1), max: Math.max.apply(null, a), n: a.length } : null;
      }
      return {
        perVillager, obsDays,
        totalProduced: Math.round(totProd),
        totalExpected: Math.round(totExp),
        effortRatio: totExp > 0 ? +(totProd / totExp).toFixed(3) : null,
        selfSufficiency: need > 0 ? +(totProd / need).toFixed(3) : null,
        hungerOver90Frac: hungReadings ? +(hungOver90 / hungReadings).toFixed(3) : null,
        needStates: social,
      };
    })(),
    // R16: emergent social structure — trust>=40 pairs (the player-facing
    // social graph), gossip reach, talk requests, villager favors.
    socialStructure: (() => {
      const out = { trustPairs40: [], gossipReach: null, talkRequests: 0, favorInstances: 0, mootConvened: 0 };
      try {
        const trust = (Game.state.village || {}).trust || {};
        for (const [rid, t] of Object.entries(trust)) {
          if (t != null && t >= 40 && rid !== Game.villagerId) out.trustPairs40.push({ id: rid, name: vname(rid), trust: t });
        }
      } catch (e) {}
      try {
        const g = (Game.state.village || {}).gossip || [];
        let maxHeard = 0, n = 0;
        for (const e of g) { n++; const h = (e.heard || []).length; if (h > maxHeard) maxHeard = h; }
        out.gossipReach = { items: n, maxHeard };
      } catch (e) {}
      try { out.talkRequests = Object.keys((Game.state.village || {}).talkRequests || {}).length; } catch (e) {}
      try { out.favorInstances = Object.keys((Game.state.village || {}).promises || {}).length; } catch (e) {}
      return out;
    })(),
    trustLedgerPosBudget: (() => {
      // R15: the theoretical trust budget — sum of all positive trust deltas
      // per villager across the window. If max over villagers of
      // (start 10 + positive budget) can't reach the 50 volunteer floor,
      // the beat is structurally unfireable in-window.
      const by = {};
      try {
        for (const t of (Game.state.telemetry || [])) {
          if (!t || t.type !== 'trust' || !(t.delta > 0)) continue;
          const id = t.villagerId || t.vid || t.who || 'unknown';
          by[id] = (by[id] || 0) + t.delta;
        }
      } catch (e) {}
      let best = 0, bestId = null;
      for (const [id, b] of Object.entries(by)) { if (b > best) { best = b; bestId = id; } }
      return { perVillager: by, bestId, bestDelta: +best.toFixed(2) };
    })(),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    // R50: deaths split — villager deaths (people) vs monster kills
    // (monsterKills below). The blended `deaths` field stays for continuity;
    // telemetry-check now judges the split fields, not the blend.
    // Kind-filtered, NOT roster-filtered: the pilot proved roster-at-census
    // holds only the living (3 people deaths, 0 matched) — the dead leave
    // the roster before census time. Pilot kinds: 'villager'/'person' for
    // people, 'monster' for monster kills; the analyzer's census-id count
    // must agree with this field (cross-checked in the run note).
    villagerDeaths: (() => {
      try {
        return deathsSoFar().filter(d => d.kind === 'villager' || d.kind === 'person')
          .map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind }));
      } catch (e) { console.log('villagerDeaths compute NOTE: ' + (e && e.message)); return []; }
    })(),
    // R36b: plenty ledger at census time — the per-day snapshot reads the
    // CURRENT day's record before the day's meal loop runs (always zeros);
    // the final ledger holds the whole 14-day history.
    plentyLedgerFinal: (() => { try { return JSON.parse(JSON.stringify((Game.state.village || {})._plentyDepri || null)); } catch (e) { return null; } })(),
    // R36: memorial-roll audit — the wound/thirst fallen fixes' wild hold.
    // Exactly one fallen entry per (villager, day, cause); repeats counted.
    fallenAudit: (() => {
      const out = { dupes: 0, perVillager: [] };
      try {
        const v = Game.state.village || {};
        const fallen = v.fallen || [];
        const byId = {};
        for (const f of fallen) { const id = f.villagerId || f.id || 'unknown'; (byId[id] = byId[id] || []).push(f); }
        for (const [id, arr] of Object.entries(byId)) {
          const seen = {};
          for (const f of arr) {
            const key = `${f.day}|${f.cause}`;
            if (seen[key]) {
              out.dupes++; MET.fallenDupes++;
              (MET.fallenDupeSamples = MET.fallenDupeSamples || []).push(`${vname(id)} d${f.day}: ${f.cause}`.slice(0, 160));
            }
            seen[key] = 1;
          }
          out.perVillager.push({ id, name: vname(id), n: arr.length });
        }
      } catch (e) {}
      return out;
    })(),
    // R22: monster-kill ledger — every monster kill in the fortnight, the
    // pipeline's raw material. kind='monster' tele records carry wave and
    // the monster id as `who`.
    monsterKills: (() => {
      const out = [];
      try {
        for (const t of (Game.state.telemetry || [])) {
          if (!t || t.type !== 'death' || t.kind !== 'monster') continue;
          out.push({ day: t.day, monsterId: t.who, cause: t.cause, wave: t.wave,
                     player: !!t.player, killer: t.killerId || null });
        }
      } catch (e) {}
      return out;
    })(),
    // R22: the unknown-flesh arc summary — per-day foodSafe transitions
    // (who got tested/revealed, by whom, how), pantry unknown-flesh units,
    // and the probe's staged events.
    fleshArc: (() => {
      const out = { transitions: [], pantryByDay: [], probe: (ctx._fleshProbe || null),
        experimentLines: MET.fleshExperimentLines || [],
        haulSeenLines: MET.fleshHaulSeenLines || [],
        streamCounts: {
          haulsSeen: MET.fleshHaulsSeen, deposits: MET.fleshDeposits,
          experiments: MET.fleshExperiments, reveals: MET.fleshReveals,
          poisonVerdicts: MET.fleshPoisonVerdicts, rotLines: MET.fleshRotLines,
        } };
      try {
        let prev = null;
        for (const s of series) {
          const fs = (s.flesh && s.flesh.foodSafe) || {};
          const pan = (s.pantryPieces && s.pantryPieces.unknownFleshUnits) || 0;
          out.pantryByDay.push({ day: s.day, unknownFleshUnits: pan });
          if (prev) {
            for (const [mid, e] of Object.entries(fs)) {
              const p = prev[mid];
              if (e.safe && !(p && p.safe)) {
                out.transitions.push({ day: s.day, mid, how: e.how,
                  testedBy: e.testedBy ? vname(e.testedBy) : null });
              } else if (e.tested === 'poison' && !(p && p.tested === 'poison')) {
                out.transitions.push({ day: s.day, mid, verdict: 'poison',
                  testedBy: e.testedBy ? vname(e.testedBy) : null });
              }
            }
          }
          prev = fs;
        }
      } catch (e) {}
      return out;
    })(),
    ctx: Object.fromEntries(Object.entries(ctx).filter(([k]) => !k.startsWith('_'))),
    // r23: carry the probe2 metadata explicitly instead of dropping it with
    // the underscore-key filter (r22 harness artifact)
    probe2: ctx._fleshProbe2 || null,
  }, null, 1));
  MET.waterFills += WATER.fills; MET.havenFills += WATER.havenFills; MET.wildFills += WATER.wildFills; MET.boils += WATER.boils;
  MET.deathMislabels += DEATHS.mislabels.length;
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | systemDay=${systemDay} | over=${overAt || 'no'} | transcripts=${transcriptFiles.length} | water fills=${WATER.fills}(haven ${WATER.havenFills}/wild ${WATER.wildFills}) boils=${WATER.boils} | playerDeaths=${DEATHS.playerDeaths.length} mislabels=${DEATHS.mislabels.length}`);
  // r23: FULLSTREAM=1 persists the full narration stream so post-System-window
  // flesh-arc lines (experiments/reveals on days 9-14) can be sense-read.
  if (process.env.FULLSTREAM === '1') {
    try {
      fs.writeFileSync(path.join(OUTDIR, `journey-landing-r62-fullstream-${seed}.txt`),
        capture.join('\n') + '\n');
    } catch (e) {}
  }
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

