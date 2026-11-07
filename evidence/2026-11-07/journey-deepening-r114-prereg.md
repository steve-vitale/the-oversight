# Journey leg: DEEPENING (days 40–80) R114 — "BOND ASKS IN WORDS NEVER SHARED + THE DECIDED ASK COMES BACK" — 2026-11-07

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r114 plays deepening, wrote 2->3
at run start with verified read-back ("3"). (Rotation-stuck note CLOSED:
the cycle since ran 2->3 deepening r113 -> 3->0 scale r107 -> 0->1 landing
r113 -> 1->2 establishment r110, verified by the three leg notes + r110's
memory entry + rotation file mtime 13:27 UTC after r110. The r113 prereg's
stuck-at-2 flag is closed.)
Base: master a78938a0b at worktree creation (r151 succession merged;
local master current with origin/master per `git pull`, "Already up to date").
Run id: laneA-20261107T1345Z (scheduled 07:45 CST 2026-11-07).
Policy: competent (r113 driver lineage, VERBATIM except the pre-registered
instrument additions below; CONVO_DAYS [45, 60, 80], DAYCAP=100,
death-aware stop).
Seeds: fresh 96201–96204. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 96200 (outside the main band) x DAYCAP=45 proves the r114
driver + instruments before the main run; smoke outputs deleted after
the check.

Freshness check for 96201–96204 + smoke 96200 (full check per the
2026-11-05 AGENTS.md lesson + local_seed_band_freshness skill — ALL dated
preregs + ALL dated .md + evidence filenames + seed-context patterns +
forbidden-band lists, not just today's files): COMPLETED before the panel
ran. Word-boundary .md mentions of 96200–96204 across evidence/ + docs/:
0. Filename hits for 9620*: none (only hash-named JSONs with incidental
substrings + seed 99620, a different number). Boundary-aware seed-context
patterns (`"seed": 9620x` / `seed=9620x` / `SEEDS=…9620x` / `s9620x`
across evidence/ + scripts/ + docs/): 0 hits. Forbidden-band lists:
9620x absent from every sim prereg. Rejected bands on the way here, all
named in dated preregs (a used band is not fresh even with no corpus
behind it in this leg): 95701–95704 (journey-scale r104, 2026-11-06,
corpora in evidence/2026-11-06/journey-scale-r104/), 95801–95804 (Oct
17–23 evidence per journey-scale r107 prereg), 95901–95904
(journey-scale r105, 2026-11-06, corpora exist). Band 96201–96204 +
smoke 96200 verified fresh.

## The questions

### Q1 (PRIMARY) — BOND/LINK DECISIONS WITHOUT SHARED WORDS: GAME GAP, MEASURED WITH LIVE COMM

**Basis.** r110 nit #2, confirmed live in r113's after-panel: Chantal
(French-only) had a bond ACCEPTED day 75; Emma (Spanish-only) had a link
ACCEPTED day 27 and declined days 6/24/62 — decisions made in words
never shared. Canon (docs/CONVERSATIONS.md, "Language"): "No shared
language → the conversation is nonverbal (gesture choices with varying
outcomes). Partial → normal conversation." A bond is a commitment made
in words ("Yes. Stick together.") — offering and deciding it inside a
nonverbal conversation contradicts the canon. Proven in source this run:
`bondChoices` (bond-initiation.js ~740) prepends bond:/link: choices
whenever a proposal is pending, with NO language check; the convoChoices
wrap (~786) prepends them unconditionally; `bondTurn` (~702) routes them
to accept/decline with no comm check. The real API is
`Game.commLevel(vid)` (game.js:2008) returning
{level:'full'|'partial'|'none'}; the driver's `npcComm` calls (r113
driver lines 883, 1282; older tests) call a NONEXISTENT API —
`Game.npcComm` is undefined in src/ (verified by grep + the fallback
`{level:'full'}`), so the driver's "skip no-language holders" guard
NEVER fired. That dead guard is how the defect was observable at all —
and it is a driver finding (see Carried), NOT fixed before the panels:
the before/after comparison must run the SAME driver.

**Instrument (driver-only, zero src/js).** The r114 driver adds
langGateOffers (every turn a bond:/link: choice is offered: day, vid,
commLevel via the REAL `Game.commLevel`, offered ids, picked id) +
langGateDecisions (wrapper on the four scholar-decision fns
acceptBondProposal / declineBondProposal / acceptLinkRaise /
declineLinkRaise, recording day, fn, vid, commLevel at decision time),
serialized into the seed JSON. The r114 analyzer's summarizeLangGate
joins them.

**Pre-registered verdict (binding, judged on the BEFORE-panel):**
- **DEFECT-CONFIRMED** if ≥1 scholar-targeted bond/link decision with
  commLevel 'none' at decision time across the panel → build the gate fix.
- **NOT-REPRODUCED** if 0 'none' decisions with ≥1 decision total → NO
  game fix; the r113 nit is reclassified (report why: partial comm at
  decision time, or nvOpen never offering the choice).
- **NO-DECISIONS** if 0 decisions at all → no verdict; panel too small /
  instrument failure; carry.
**Fix (conditional, src/js bond-initiation.js, AFTER the before-panel —
only if DEFECT-CONFIRMED):** (a) `bondChoices` returns [] when
`Game.commLevel(vid).level === 'none'` (fail-open if the API is missing:
offer, preserving old behavior for unknown callers); 'partial' still
offers (partial IS shared language per canon). (b) `bondTurn` refuses
bond:/link: ids at comm 'none' with an honest line and NO state change
(defense in depth for any path that bypasses the menu). The staged
proposal stays staged until expiry (3 days) or until the scholar learns
the language — the villager can re-stage later; learning their words is
the honest arc to a bond.
**Proof test (BEFORE the after-panel; run RED on unfixed code first to
demonstrate the defect, GREEN after the fix):**
scripts/test-journey-deepening-r114-langate-20261107.js (synthetic Game
scenes, REAL bondChoices/bondTurn/convoChoices): (1) 'none'-comm
villager with staged proposal → bondChoices [] and no bond:/link: in
convoChoices; (2) 'partial' → offers bond:accept/decline; (3) 'full' →
offers; (4) direct bondTurn 'bond:accept' on 'none' → no bond formed
(bondGet depth unchanged / no bond record), honest line; (5) Q2 clear
(see Q2). A miss is NO-GO, never re-scored.
**After-panel binding (same seeds, same driver, game fix only):**
0 'none' decisions AND ≥1 non-'none' decision = FIX-WORKS (the gate
blocks only the wordless ones); 'none' decisions persist = fix failed
(name why); 0 decisions of any kind = inconclusive.

### Q2 — THE DECIDED ASK COMES BACK: GOON RE-SPEAKS A BOND/LINK LINE AFTER THE DECISION

**Basis.** r113 wrinkle, proven in transcript: Grace day 27 (seed
95601): opener speaks the bond ask, scholar declines ("Not like that.
Not yet."), "Right — another time." — then a later `goon` ("And?") in
the SAME sitting re-speaks the ask verbatim: "I've been thinking. You
and me — we should be bonded..." Mechanism traced in source this run:
the talk-request opener speaks the staged line as the opening line
(convoOpening priority #1) AND, when the opener owns the reply (want
stage < 3), stashes the same line in c.bondPending (conversation.js
~5472); queueTraderIntro pushes it into heldBeats; bondTurn's
convoDropUnspoken (which runs BEFORE the decision) re-stages the queued
beat into c.bondPending as "dodged"; the decision consumes the request
but nothing clears c.bondPending / the held beat; a later goon speaks it
verbatim. The ask is answered — it must not come back. Same shape as
the r40 invite double-serve (fixed at conversation.js:5183 by clearing
invitePending at open); the bond path never got the matching clear.

**Instrument.** r114 analyzer scanDecidedAskReplay: per transcript, a
bond:/link: pick (YOU: [bond:...] / [link:...]) followed later in the
same sitting by a THEM line equal to the sitting's opener bond/link ask
line (matched against the bondProposalLine / linkRaiseLine pools + the
opener line itself). Counts sittings with ≥1 post-decision replay, with
seed/day/vid + the replayed line.

**Pre-registered verdict (binding, before-panel):**
- **REPLAY-CONFIRMED** if ≥1 sitting replays a decided bond/link ask via
  goon (or any continuer) in the same sitting → build the clear fix.
- **NOT-REPRODUCED** if 0 replays with ≥1 decision sitting → NO game fix.
**Fix (conditional, src/js bond-initiation.js convoTurn wrap, AFTER the
before-panel — only if REPLAY-CONFIRMED):** after bondTurn returns for a
bond:/link: choice, clear the decided ask from the convo record —
c.bondPending = null, c.linkPending = null, and drop bondproposal /
linkraise beats from c.heldBeats. Undecided asks are untouched: the
drop/re-stage path still re-speaks an ask the player dodged (r8 design);
only a DECIDED ask is cleared. Proof test case (5) in the langate test
(shared file — both fixes live in bond-initiation.js): stage → open
convo → decide via bondTurn → assert convo record has no bondPending
and no bondproposal/linkraise heldBeats; a subsequent goon does not
re-speak the ask line. (Plus a control: dodge the ask with a non-bond
pick → the beat survives for the continuer.)
**After-panel binding:** 0 replays AND ≥1 decision sitting = FIX-WORKS;
replays persist = fix failed (name why); 0 decision sittings =
inconclusive.

## Secondary (carried, r113 verdicts re-judged fresh)

- **SURV-CONTROL-4 (6th control point):** lineage r107 2/4, r108 3/4,
  r109 2/4, r110 2/4, r113-before 4/4, r113-after 2/4. The r113
  after-panel survival dip (request sittings cost day-parts; 95602
  scattered from hunger while the scholar sat bond sittings) is the flag
  this point watches. Verdict rule as r110's: >=2/4 survive -> funnel
  unchanged; 0/4 -> base moved (bisect job, no claim about which
  change); 1/4 -> ambiguous. Cause split reported exactly as r107–r113
  reported it. (The Q1/Q2 fixes touch only which choices are offered
  and which beats clear — neither should move survival; any move is
  reported, not attributed without a bisect.)
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
  the `pocketed` want label persisting. r113: 4 testable, 0 named —
  re-judged fresh.
- **G-STICK (revised per r110 metric review):** top-goal stability
  reported as a DISTRIBUTION across seeds/days, not a stuck-count
  (goals are lasting pursuits by design; the count misleads).
- **G-SENSE:** all transcripts read in full; senseless sittings
  counted (expectation from r113: 0) and named, not just counted.
- **AWAY-LINE (r113 Q2, carried as a regression watch):** old "miles
  away" line 0, new "away from Haven" line fires in sittings. The r113
  fix is IN the base; the analyzer keeps the scan.
- **Q1-REQUESTS (r113, carried):** staged/decided/expired + verdict —
  the request machinery must keep REACHING (the r113 driver fix is in
  the driver lineage now).

## Carried context (reported, not re-judged)

- r110 nits #3 (Nathan's betrayal-accept fortune-cookie drift), #4
  (stray lines — Denise "It'll pass.", Irving "Could be wrong,
  though."), #6 (Christian's bond line with no decision): not observed
  r113; watch in r114 transcripts.
- r110 nit #5 (D-THING pocketed thing never named): re-judged as a
  secondary above.
- DRIVER FINDING (this run, code-read): `Game.npcComm` does not exist;
  the r113 driver's two "skip no-language holders" guards
  (answerLiveRequest, daily talk selection) never fired. NOT fixed
  before the panels (the before/after comparison needs the same driver;
  the dead guard is what makes the defect observable). Post-panel
  driver cleanup (separate commit, proof-tested, after both panels):
  point both guards at the real `Game.commLevel`. If time does not
  permit, it carries to r115 as a documented finding.
- Q2 parallel (out of scope): the invite path has the same re-stage
  shape (invitePending in convoDropUnspoken); invites are decided
  through a different verb and were not observed replaying post-decision
  this run. Noted, not fixed.
- All-tracks read (Steve 2026-11-06 11:48 CST, REWARD ALL PATHS): the
  village assessment carries a descriptive all-tracks read
  (goal-top distribution per seed, mapped to tracks).
- STANDING CONTEXT (Steve 2026-11-06 11:48 CST): roles differentiate
  by personality; measure by role formation across ALL five tracks,
  not kill counts alone.
- One-brain order (Steve 2026-11-06 17:12 CST): noted as context.
  Bond proposals and link raises are a second decision channel that
  never reaches the one scorer — a later-phase fold-in, per the
  order. This run's Q1/Q2 findings (whether the scholar-facing half is
  answerable, and whether decided asks stay decided) feed it.
- Gating freeze (2026-10-27 16:53) stands — no threshold, bar,
  price, or gate change in this run. Perception law (2026-10-28)
  stands — all instruments read-only; pickers press offered menu
  items only. DELIVER OVER MEASURE (2026-11-01): a code change lands
  ONLY if a defect is proven in game code with a before/after proof
  test; the Q1/Q2 fixes are those cases (r113 transcripts + code reads
  + proof tests).
- Rotation-stuck note (r113 prereg) CLOSED — see header.

## What this run does NOT do

- Does not build a new bond system. The system is merged; this run
  gates its scholar-facing choices on shared language and clears
  decided asks from the continuer.
- Does not change staging (stageBondProposal / stageLinkRaise): a
  no-language villager may still stage an ask — the villager wants
  something; the scholar just cannot answer it in words yet. Learning
  the language is the path to the answer.
- Does not change the warmth window, the 3-day expiry, the 14-day
  refusal cooldown, or any bond probability.
- Does not re-judge wave 4 (r90), beast-trick teaching (r92),
  standing/scale two-rulers (r93), villager goals, or the
  standing/scale question. Carried as context only.
- Does not touch win prices, deed gates, or any balance number.
- Does not re-score the r113 panel. r113 stands as computed.

## Seeds, pilot, shape

- Panel: fresh seeds 96201–96204, DAYS=100 (DAYCAP), OUTDIR
  deepening-r114 (goal hidden_files evidence/2026-11-07/).
- Before/after file separation (r113 metric review): before-panel
  writes `journey-deepening-r114-before-seedNNNN.json` +
  `...-before-transcript-...`; after-panel writes `...-after-...`.
  The analyzer takes PANEL=before|after (default before) and reads
  the matching seed files.
- PILOT FIRST: smoke 96200 x DAYCAP=45 proves the r114 driver +
  instruments before the main run (seeds run, snapshots present,
  talkReqSnaps + langGateDecisions present, transcripts written;
  smoke outputs deleted after the check). Then 2-seed pilot
  (96201–96202) before expanding to 4 — the pilot validates the
  langGate instrument on real output (comm values present on
  decisions) before the panel expands.
- Shape: prereg commit → proof tests (RED on unfixed code = defect
  demonstrated) → smoke → pilot (2 seeds) → before-panel (4 seeds) →
  analyzer verdicts → fixes (only if verdicts confirm) + proof tests
  GREEN → after-panel (same 4 seeds) → analyzer both panels → run
  note → gate → merge.
- Proof tests: scripts/test-journey-deepening-r114-langate-20261107.js
  (Q1 gate + Q2 clear, shared file — both fixes live in
  bond-initiation.js) +
  scripts/test-journey-deepening-r114-analyzer-20261107.js
  (summarizeLangGate + scanDecidedAskReplay on synthetic seed
  JSONs/transcripts, modeled on the r113 analyzer proof 29/29).

## Metric review (filled at closeout, never mid-run)
- (to be filled)
