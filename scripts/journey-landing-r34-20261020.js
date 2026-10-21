#!/usr/bin/env node
// Journey leg: LANDING (days 1-14) R34 — stay-green check on tip e39108e3a
// with the commits landed since r33's base (ecc7177f2):
//   - 64737ff99 death-liturgy templating ([needs-eyes]): (a) sickness tick no
//     longer writes a second cause line for a death already said, (b)
//     villageEvent('death') deduped to one beat per death via deathGriefBeat,
//     (c) 'The village is N now.' replaced with person-like grief codas via
//     griefLine. LANDING-EXPOSED: r33 saw 3 fresh-seed villager deaths
//     (d6 sickness, d12 monster, d13 scholar combat) — exactly this path.
//   - e89c294b9 theft rate-bar ([needs-eyes]): takeFromPantry/packOut trust
//     nick moved from cumulative `net < -5000` to trailing-7d rate bar (3000
//     kcal/day) — fixes caught-red-handed spam on ordinary eating.
//     LANDING-EXPOSED: pantry takes fire from day 1.
//   - 4e506540a/93d467a6b journey-scale r17 (lane A): M3 sense-read transcripts
//     + R17b announce-capture widen. EXPOSED: shared announcement code.
//   - e39108e3a lane B succession r33: scripts + evidence only, zero src
//     changes — no exposure.
//   - sim-lever arms (upkeepgate-b, belongbonds, draworder-b, vgearconfirm,
//     killdisc, repairrate-b, rotpathdiag-b): instruments + evidence only,
//     zero src/js — no exposure. (e89c294b9 is the thiefcooldown-b lever
//     LANDED; 64737ff99 is the deathliturgy lever landed.)
// Driver: pinned competent (r14–r33 continuity). The R27 resume-priority
// pick is RETIRED per the r27 metric review (unreachable-by-construction
// with the pinned driver); the gossipThreadOffered instrument stays so
// the run documents the count.
//
// Pre-registered (docs/MEASUREMENT.md sections 9-12, 14 — binding; §14
// anti-drift: a miss is NO-GO, never re-scored mid-run):
//   Question: does the landing leg stay green on tip e39108e3a with the
//     death-liturgy templating + theft rate-bar landed since r33's base
//     (ecc7177f2)? The landed changes with landing-window exposure are
//     64737ff99's death-liturgy, e89c294b9's theft rate-bar, and the
//     scale-r17 announce-capture widen.
//   Interesting / GO gates (binding):
//     V1'' autonomy GO on >=3/4 seeds (every living non-scholar logs
//       production on >= villager-days − 2; <10% villager-days hunger >90)
//     V2 work: villager production covers >=40% of 14-day kcal draw on
//       >=3 seeds
//     V3 structure (r34 metric review adopts r33's proposal): >=1 emergent
//       social tie/seed (trust>=40 pair, convened moot, or villager-to-
//       villager favor), WITH the scholar-death carve-out — if the scholar
//       dies mid-leg, the mantle bearer <redacted> new-person relationships
//       by design; the seed is scored on pre-death ties OR post-death
//       new-tie formation, documented either way.
//     V4' people: >=8 transcripts sense-read (SENSE-TESTING LAW — read FULL
//       transcripts; the NPC wants something, options engage/deflect,
//       endings resolve/plant/owe; no fabricated shared history, no filler
//       loops, no static menus), 0 fabric-history flags, 0
//       within-conversation near-dupes (20-char floor, r33 standard).
//       Probe gate (r20 metric review, adopted): >=1 natural fire of
//       (mourning | seek_taken | seek_comfort) OR the probe seed documented.
//     V5' regression: water fills>0 + boils>0 per seed; 0 death mislabels;
//       >=6 social names/seed pre-System
//     V6 winnable: villages alive at day 14
//     M2 first System contact: day 8 on all seeds
//     WILD HAUL ARC: >=1 natural villager carcass haul → pantry
//       unknown-flesh deposit → cautious test/experiment → reveal (or honest
//       risk outcome) observed across the fresh seeds, with sense-read
//       lines.
//     DAY-FREEZE: 0 stranded-AI-turn fights across all seeds
//     OPEN BOOK: if the scholar dies, the mantle names their unkept
//       promises — sense-read the lines
//     BEAT-IDENTITY WILD: spoil mutters + devotion beats appearing in the
//       landing window are sense-read (attribution true, no near-dupe
//       spam, no nonsense content).
//     R34 DEATH-LITURGY (new): >=1 natural death (fresh or probe arm)
//       sense-read — the 64737ff99 path: no second cause line, exactly one
//       death beat per death (deathGriefBeat), person-like grief coda
//       ('The village is N now.' = 0); if no death fires on the fresh
//       seeds, the probe arm (MOURN_PROBE=1) carries it.
//     R34 THEFT-RATE (new): 0 caught-red-handed lines on ordinary pantry
//       eating across all seeds (the e89c294b9 spam fix); any genuine
//       theft event is sense-read for the trust-nick handling.
//     R33 FAVOR-ACTION (retired): stands on the r33 evidence + contract
//       proof; the committing-driver arm stays a candidate for a future
//       run.
//     R33 KILLBEAT (retired): stands on the r33 evidence + 19/19 proof.
//     R29 SETTLE-SPEAK (retired): stands on r29/r32 probe evidence.
//     R28 WILD (retired per r27 metric review): gossipThreadOffered
//       instrument stays; document the count (0 expected with the pinned
//       driver). The in-wild proof stands on leg-5 r28 + the unit proof
//       scripts/test-gossip-resume-beat-20261019.js.
//     ASK-GOSSIP (retired per r27 metric review): cite the unit proof for
//       the shared path; vacuous in the wild (ask:gossip never appears
//       with the pinned driver — pre-existing).
//   Seeds: 109, 110 (pilot), 111, 112 (main); probe seed 101
//     (REPEAT_SIT=1, MOURN_PROBE=1). Policy: competent, PINNED.
//   Horizon: 14 days, death-aware stop (dead/scattered village stops
//     simulating +10d tail max). One process per seed.
//   Pilot sizing: 109, 110 + probe 101; expand to 111, 112 iff the pilot
//     shows anything interesting (§9). The stay-green spine is pre-
//     registered on 4 fresh seeds — the pilot ran clean and the expansion
//     is cheap (~15s/seed), so all four ran.
//   Binding metrics: V1'', V2, V3, V4', V5', V6 + M2 + WILD HAUL ARC +
//     DAY-FREEZE + OPEN BOOK + BEAT-IDENTITY WILD + R34 DEATH-LITURGY +
//     R34 THEFT-RATE as defined above + standing pipeline metrics (kills,
//     carcass hauls, tried, teaches, reveals, rot).
//   Canon read: CANON.md (reread); DISEASES.md (reread). KNOWLEDGE.md,
//     PRESERVATION.md, CONVERSATIONS.md, PARTY.md, DIRECTIVES.md
//     (r28–r33). No new canon invented.
//
// Usage: node scripts/journey-landing-r34-20261020.js
// Probe: SEEDS=101 REPEAT_SIT=1 MOURN_PROBE=1 node scripts/journey-landing-r34-20261020.js
// Outputs route to OUTDIR (env) or the goal evidence dir — never /tmp
// (service restarts wipe /tmp mid-run, 2026-10-14).

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [109, 110, 111, 112]);
const DAYS = parseInt(process.env.DAYS || '14', 10);
const FAVOR_ACCEPT = process.env.FAVOR_ACCEPT !== '0'; // R15: default ON —
// the landing leg's KIN question needs the seek_taken commit path exercised
// (takenPromises + podRemember). Set FAVOR_ACCEPT=0 to get r14 behavior.
const OUTDIR = process.env.OUTDIR ||
  path.join(process.env.HOME || '/home/hatch',
    'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-20/landing-r34');
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
function cap(line) {
  if (line == null) return;
  const s = String(line);
  feastScan(s);
  waterScan(s);
  takeScan(s);
  r34Scan(s);
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
  // r9: on the second turn, ask for gossip ("heard anything?") — the
  // information-machinery leg wants rendered gossip, not just deepening.
  if (turn === 1) {
    const g = list.find(x => x && x.id === 'ask:gossip');
    if (g) { MET.gossipAsks++; lastPickId = 'ask:gossip'; return g; }
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

function runConversation(seed, day, vid, nvSit) {
  const fp = path.join(OUTDIR, `journey-landing-r34-transcript-${seed}-day${day}.txt`);
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
      const pick = pickChoice(choices, turn, pickWant);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      if (pick.id === 'betrayal:decline') declinedThisTurn = true;
      if (pick.id === 'ask:gossip') gossipAskedThisTurn = true;
      r = Game.convoTurn(vid, pick.id);
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
    // r16 NEAR-DUPE detector: voiceLine wraps the raw pool line with
    // openers/closers ("You know what — X" vs "X"), defeating exact-match.
    // Normalize aggressively (strip punctuation/quotes/case), then flag
    // when one line's core contains another's (>=40 chars). Exact dupes
    // are counted above; this catches wrapper-hidden repeats only.
    const normCore = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    // r18 fix: keep (line, core) pairs — filtering cores alone breaks the
    // themT index alignment and misattributes the pair (caught on the
    // seed-64 probe: reported a deflection line, hid the real comfort repeat).
    const pairs = themT.map(t => ({ line: t, core: normCore(t) })).filter(p => p.core.length >= 40);
    const nearDupes = [];
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        if (pairs[i].core === pairs[j].core) continue;
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
      loc, packKcal, sentiment, feastState,
      gossipCensus, monsterCodex, rumorTrack, vitals,
      followers, trustMap, trustMax, trustMaxName,
      namesKnown, namesKnownNames, flesh,
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
  while (!Game.over && loop++ < 80) {
    const gd = gday();
    if (gd >= day0 + DAYS) break;
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
          try {
            const fp = runConversation(seed, gd, vid, didNv);
            transcriptFiles.push(fp);
            console.log(`convo with ${vname(vid)}${didNv ? ' [NV]' : ''} -> ${fp}`);
          } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
          talked.add(vid);
          if (didNv) lastNvGd = gd;
        } else console.log('no fresh conversational villager today');
      } else console.log(`day ${gd}: player away from haven — no conversation beat`);
      // System contact detection
      const sysNow = !!(Game.state && Game.state.systemArrived);
      if (!sysWas && sysNow) {
        systemDay = gday();
        systemFile = path.join(OUTDIR, `journey-landing-r34-system-${seed}.txt`);
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
  const censusPath = path.join(OUTDIR, `journey-landing-r34-census-${seed}.json`);
  // R30: death-liturgy + theft rate-bar summary for the analyzer
  var r34 = {
    headcountCodas: MET.headcountCodas || 0,
    griefBeats: MET.griefBeats || 0,
    caughtRedHanded: MET.caughtRedHanded || 0,
    deathLineSamples: (MET.deathLineSamples || []).slice(0, 30),
    caughtRedHandedLines: (MET.caughtRedHandedLines || []).slice(0, 10),
    headcountCodaLines: (MET.headcountCodaLines || []).slice(0, 10),
    griefBeatLines: (MET.griefBeatLines || []).slice(0, 20),
  };
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, spawn, systemDay, systemFile, transcriptFiles, series, census, overAt,
    starvAutopsies, r34Summary: r34,
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
      fs.writeFileSync(path.join(OUTDIR, `journey-landing-r34-fullstream-${seed}.txt`),
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
