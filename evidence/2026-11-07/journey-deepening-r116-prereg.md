# Journey leg: DEEPENING (days 40–80) R116 — "LEARN THEIR WORDS: DOES LISTENING OPEN THE BOND?" — 2026-11-07

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r116 plays deepening, wrote 2->3
at run start with verified read-back ("3"). (Rotation history: r112
establishment closed out 1->2; r114 deepening wrote 2->3, r115 landing
0->1, then r112's closeout advanced 1->2 — the file reads 2 now, correct
for this run.)
Base: master a2e005cbe at worktree creation (r112 establishment evidence;
local master current with origin/master per `git pull`, "Already up to
date"). Run id: laneA-20261107T1945Z (scheduled 13:45 CST 2026-11-07).
Policy: competent (r114 driver lineage, VERBATIM for the before-panel
except the pre-registered instrument additions below; CONVO_DAYS
[45, 60, 80], DAYCAP=100, death-aware stop).
Seeds: fresh 96401–96404. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 96400 (outside the main band) x DAYCAP=45 proves the r116
driver + instruments before the main run; smoke outputs deleted after
the check.

Freshness check for 96401–96404 + smoke 96400 (full check per the
2026-11-05 AGENTS.md lesson + local_seed_band_freshness skill — ALL dated
preregs + ALL dated .md + evidence filenames + seed-context patterns +
forbidden-band lists, not just today's files): COMPLETED before the panel
ran. Word-boundary .md mentions of 96400–96404 across evidence/ + docs/:
0. Filename hits for 9640*: none. Boundary-aware seed-context patterns
(`"seed": 9640x` / `seed=9640x` / `SEEDS=…9640x` / `s9640x` across
evidence/ + scripts/ + docs/, .md/.js/.txt): 0 hits. Forbidden-band
lists: 9640x absent from every sim prereg. REJECTED band on the way
here: 96301–96304 (+ smoke 96300) — clean on the file record (0 .md
hits, 0 prereg hits; only incidental hash substrings), but REJECTED on
live use: two sibling loops are running sweeps on SEEDS=96301–96308
right now (sim-feveranat-a, pid 217781, started 20:09Z; sim-tendsick-a,
pid 221714, started 20:14Z). A band in live use is not fresh even with
no prereg naming it. Band 96401–96404 + smoke 96400 verified fresh
(files + live-process check, no live 964 use).

## The questions

### Q1 (PRIMARY) — THE LANGUAGE ARC, LISTENED TO: DOES THE COMPETENT PLAYER LEARN THEIR WORDS?

**Basis.** r114 fixed the menu gate: a bond/link ask at comm 'none' can
no longer be offered or decided in words never shared. The staged
proposal stays staged until its 3-day expiry, and the fix comment
promises the honest arc: "the villager may re-stage after the scholar
learns the language" (bond-initiation.js:765). The arc exists in code
(conversation.js langExposureGain): exposure thresholds 3 (words), 10
(sentences), 25 ("you can get by" — `s.languages[lang] = 1`, comm
'none'→'partial', bond/link choices become offerable). Exposure gains:
+1 on a nonverbal open (nvOpen), +3 per `nv:listen` ("listen hard —
catch words"; "Listening is the fastest way to learn"), +1 per other
gesture (nod/smile/pointself), +1 on a wake-up scene (game.js:6173),
+1 per speak_back gain. BUT the r114 driver NEVER presses an `nv:*`
choice: the picker has no nv: ids (ENGAGE/ENGAGE2/DEFLECT are all
verbal), so a nonverbal sitting opens (+1 exposure), takes `goon` only
if a beat is held, and leaves. ~+1 per sitting, ~25 sittings to reach
25 — out of leg reach. The arc is unexercised by the current competent
policy, not by the game. The r114-carried decision ("whether the
competent player sits no-language holders at all") is answered from
the other side: the player sits them AND listens — IF the arc pays off
when actually invested in.

**Instruments (driver-only, zero src/js, BOTH panels).** langArc:
per nonverbal sitting with a 'none' holder — day, vid, language,
exposure before/after (Game.langExposure), comm before/after
(Game.commLevel), picks pressed; per seed end — scholar.languages +
langExposure per language + comm per 'none' holder; per convo day —
exposure snapshot per language with exposure > 0. langGateOffers /
langGateDecisions (r114) unchanged, so flips join to decisions.
talkedSittings (r114 metric-review proposal): runConversation records
{day, vid, q1Request} into ctx.talkedSittings, and summarizeRequests
counts a sitting as talked-while-live (the r114 gap: request-sittings
call startConvo, not talkTo, so the bond instrument's talkTo wrap
missed them).

**Policy change (driver-only, AFTER-panel only, gated on PANEL=after).**
LISTEN: in a nonverbal sitting (menu contains an `nv:` id), after the
`goon` pass (a held beat is the NPC's queued line — it speaks first),
press `speak_back` if offered (exposure ≥3, the trust payoff, "the
heart of the human path"), else `nv:listen` on every turn until the
engine ends the sitting. No cap: convoBudget (3–7 turns) caps the
sitting. Cost model (verified in source): conversations cost 10 kcal
on OPEN, 0 kcal per turn, 0 extra day-parts per turn — the sitting is
already paid for by the current policy, which sits 'none' holders
(the dead npcComm guards never skip them); listening only spends the
turns inside it. Tradeoff, named: listening grants no trust (nod/smile
grant +1 each); the after-panel measures trust alongside exposure.
The before-panel runs the r114 picker VERBATIM (never listens) — the
comparison is policy-vs-policy on identical seeds, game code unchanged
between panels.

**Pre-registered verdict (binding, judged on the BEFORE-panel):**
- **ARC-UNEXERCISED** if 0 languages reach exposure 25 and 0 comm
  flips none→partial across the panel, with ≥1 'none' holder sat — the
  baseline the after-panel must beat. (Expected: +1/sitting cannot
  reach 25 in-leg.)
- **ARC-ALREADY-LIVE** if ≥1 flip happens without listening → the
  policy question changes (measure how it flipped instead).
- **NO-CONTACT** if 0 'none' holders are sat at all → no verdict; carry.
**After-panel binding (same seeds, LISTEN policy only):**
- **ARC-FIRES** if ≥1 language reaches 25 AND ≥1 bond/link decision at
  partial-or-better follows a flip on that same language = the arc pays
  off when invested in. POLICY DECISION (binding): the competent player
  KEEPS sitting no-language holders and listens — the sit/skip question
  is settled KEEP-SITTING, and the dead npcComm guards are removed as
  dead code in a cleanup commit (they must not become a skip — the
  evidence says sitting + listening is the play).
- **ARC-FLIPS-NO-PAYOFF** if flips happen but 0 decisions follow on the
  flipped language = the arc works, the payoff is unproven (carry: does
  the villager re-stage inside the leg?).
- **ARC-STILL-DEAD** if 0 flips despite listening, with ≥1 'none'
  holder sat ≥2 sittings = the "learn the language" promise is hollow
  in-leg — a GAME finding for the main session, not a driver tweak; no
  driver change this run; the skip-vs-sit decision carries to r117
  with the numbers.
- **NO-CONTACT** if 0 'none' holders sat ≥2 sittings in the after-panel
  → no verdict; carry.

### Q2 — G-LINES: COUNTER OR GOALS?

**Basis.** r114: bonds / knowledge / safety / bank_veterans log **0
lines on all 8 seed-panels** while dawn tops show safety/knowledge DO
get picked. The goal lines are appended ONLY to departure
announcements (villager-objectives.js:1070: `if (obj.goalLine)
purposeLine += ' ' + obj.goalLine`), and the departure line is said
ONLY `if (playerAtHaven)`. The counter (goalLineCounts) reads the
`capture` log. Two hypotheses: (a) COUNTER — departures happen but
their lines never reach capture (scholar away at departure time, or a
channel gap); (b) GOALS — those tops never become departing objectives
(home-based objectives: safety→HAVEN_CHORE, bonds→VISIT/HAVEN_CHORE
never depart, so no departure line exists to count — the 0 is honest).

**Instrument (driver-only, both panels).** goalLineDays: at each
goalSnap, scan capture lines added since the last snapshot for
GOAL_LINES strings; record {day, track, count}. Joined to that day's
goalSnaps (top / objKind / objGoal / objGoalLine / objState per
villager — already recorded). The join separates, per track: tops →
objectives carrying goalLine → departed (objState returning/active-out)
→ lines in capture.

**Pre-registered verdict (binding, judged on the before-panel; the
after-panel re-judges the same join — the LISTEN policy should not
move it, and any move is reported):**
- **COUNTER-FAULT** if villagers with a goalLine-carrying objective
  DO depart (objState returning) but 0 of those tracks' lines appear in
  capture that day → the departure channel is broken for the counter.
- **GOALS-FAULT** if tops for bonds/knowledge/safety/bank_veterans
  never become objectives carrying goalLine, or never depart → the 0
  is honest; those goals don't move villagers out the door (a
  goals-system finding, not an instrument bug).
- **MIXED** if the tracks split — name each track's class.
- **NO-DATA** if no villager holds those tops at all → carry.

## Secondary (carried, r113/r114 verdicts re-judged fresh)

- **SURV-CONTROL-4 (7th control point):** lineage r107 2/4, r108 3/4,
  r109 2/4, r110 2/4, r113-before 4/4, r113-after 2/4, r114-before 4/4,
  r114-after 3/4. Verdict rule as r110's: >=2/4 survive -> funnel
  unchanged; 0/4 -> base moved (bisect job, no claim about which
  change); 1/4 -> ambiguous. Cause split reported exactly as r107–r114
  reported it. (The LISTEN policy touches only which choices are
  pressed inside nonverbal sittings — neither should move survival; any
  move is reported, not attributed without a bisect.)
- **P-KEEP (revised, minus bare "forgot"):** same rule as r110
  (NAMED >= 1 among revisited-alive -> PRESENT).
- **RE-ASK (4 variants + origin split):** same as r110; orphans split
  origin-outside-panel vs true no-thread.
- **DEBRIEF-CAPTURE:** every village-lost seed attributed (debrief
  lines + loss-trigger flags captured in-run); unattributed ones named
  as a live instrument gap.
- **B-SIT / B-FOLLOW / B-LEAD, FIZZLE-WATCH, S-TRACE:** same scans as
  r110/r113.
- **D-THING (revised per r110 metric review):** "mentioned" now
  requires the thing to be NAMED or RETURNED in dialogue, not just
  the `pocketed` want label persisting. r114: after-panel 1/5 named
  (2 old-rule) — re-judged fresh.
- **G-STICK (revised per r110 metric review):** top-goal stability
  reported as a DISTRIBUTION across seeds/days, not a stuck-count.
- **G-SENSE:** all transcripts read in full; senseless sittings
  counted (expectation from r114: 0) and named, not just counted.
- **AWAY-LINE (r113 Q2, carried as a regression watch):** old "miles
  away" line 0, new "away from Haven" line fires in sittings. The r113
  fix is IN the base; the analyzer keeps the scan.
- **Q1-REQUESTS (r113, carried):** staged/decided/expired + verdict —
  the request machinery must keep REACHING (the r113 driver fix is in
  the driver lineage now). NOTE: talkedSittings changes the
  talked-while-live corroboration (see Q1 instruments) — verdicts use
  tele events, as before.
- **INVITE-REPLAY WATCH (r114 carried):** the invite path has the same
  re-stage shape as the bond path (invitePending in
  convoDropUnspoken); invites are decided through a different verb and
  were not observed replaying post-decision. Watch r116 transcripts
  for an invite replay (scanDecidedAskReplay covers bond/link only —
  an invite replay is reported by hand-read, not by the analyzer).
- **V-INIT (r114 carried):** bondSittings=0 both r114 panels —
  villagers never open a bond sitting with the scholar; asks arrive via
  talkRequests. Is that the intended shape for villager-initiated
  bonds, or should a villager walk up and ask face-to-face? Carried
  question; count bondSittings again this run.
- **RE-ASK true-no-thread (r114 carried):** 1 orphan the analyzer
  couldn't trace (after, 96203 day 80, gen_kgwuzqb). Watch, don't chase.

## Carried context (reported, not re-judged)

- r110 nits #3 (Nathan's betrayal-accept fortune-cookie drift), #4
  (stray lines — Denise "It'll pass.", Irving "Could be wrong,
  though."), #6 (Christian's bond line with no decision): not observed
  r113/r114; watch in r116 transcripts.
- r114 Q1/Q2 fixes are IN the base (bond-initiation.js language gate +
  decided-ask clear, commit 344b7cd2, live in the Nov 7 ship): the
  r116 panels re-prove them as regression watches (langGate: 0 'none'
  offers/decisions expected on BOTH panels; replay scan: 0 replays
  expected on BOTH panels). A regression is a LOUD finding, not a
  re-verdict — r114 already judged the fixes FIX-WORKS.
- All-tracks read (Steve 2026-11-06 11:48 CST, REWARD ALL PATHS): the
  village assessment carries a descriptive all-tracks read
  (goal-top distribution per seed, mapped to tracks).
- STANDING CONTEXT (Steve 2026-11-06 11:48 CST): roles differentiate
  by personality; measure by role formation across ALL five tracks,
  not kill counts alone.
- One-brain order (Steve 2026-11-06 17:12 CST): noted as context.
  Bond proposals and link raises are a second decision channel that
  never reaches the one scorer — a later-phase fold-in, per the
  order. This run's Q1 finding (whether the scholar-facing half is
  answerable after learning the language) feeds it.
- Gating freeze (2026-10-27 16:53) stands — no threshold, bar,
  price, or gate change in this run. Perception law (2026-10-28)
  stands — all instruments read-only; pickers press offered menu
  items only. DELIVER OVER MEASURE (2026-11-01): a code change lands
  ONLY if a defect is proven in game code with a before/after proof
  test; the LISTEN policy is a driver change, not a game change, and
  lands only on ARC-FIRES.
- The r114 driver finding (dead npcComm guards) is ANSWERED by Q1's
  policy decision, not fixed before the panels: the before/after
  comparison needs the same guards in both panels (dead in both —
  the policy change is the LISTEN branch, not the guards).

## What this run does NOT do

- Does not build a new bond system or a new language system. The
  language arc is merged; this run measures whether the competent
  player can walk it, and changes only how the driver plays inside
  nonverbal sittings.
- Does not change staging (stageBondProposal / stageLinkRaise), the
  warmth window, the 3-day expiry, the 14-day refusal cooldown, or any
  bond probability.
- Does not change the r114 language gate or the decided-ask clear.
- Does not re-judge wave 4 (r90), beast-trick teaching (r92),
  standing/scale two-rulers (r93), villager goals as a system, or the
  standing/scale question. Carried as context only.
- Does not touch win prices, deed gates, or any balance number.
- Does not re-score the r114 panel. r114 stands as computed.

## Seeds, pilot, shape

- Panel: fresh seeds 96401–96404, DAYS=100 (DAYCAP), OUTDIR
  deepening-r116 (goal hidden_files evidence/2026-11-07/).
- Before/after file separation (r113 metric review): before-panel
  writes `journey-deepening-r116-before-seedNNNN.json` +
  `...-before-transcript-...`; after-panel writes `...-after-...`.
  The analyzer takes PANEL=before|after (default before) and reads
  the matching seed files.
- PILOT FIRST: smoke 96400 x DAYCAP=45 proves the r116 driver +
  instruments before the main run (seeds run, snapshots present,
  talkReqSnaps + langGateDecisions + langArc present, transcripts
  written; smoke outputs deleted after the check). Then 2-seed pilot
  (96401–96402) before expanding to 4 — the pilot validates the
  langArc instrument on real output (exposure values present on
  sittings) before the panel expands.
- Shape: prereg commit → proof tests (listen-picker cases GREEN on
  the r116 driver; engine exposure test GREEN — the +3 path is a
  mechanism the after-panel relies on) → smoke → pilot (2 seeds) →
  before-panel (4 seeds) → analyzer verdicts → after-panel (same 4
  seeds, LISTEN policy) → analyzer both panels → run note → gate →
  merge.
- Proof tests: scripts/test-journey-deepening-r116-listen-20261107.js
  (picker: before-policy leaves a nonverbal sitting immediately;
  after-policy presses speak_back when offered, else nv:listen; goon
  still outranks listen; verbal menus unchanged; engine: nv:listen
  grants +3 exposure, nvOpen +1, 25 grants the language) +
  scripts/test-journey-deepening-r116-analyzer-20261107.js
  (summarizeLangArc + summarizeGoalJoin + talkedSittings join on
  synthetic seed JSONs/transcripts, modeled on the r114 analyzer
  proof).

## Metric review (filled at closeout, never mid-run)
- (to be filled)
