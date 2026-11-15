# sim-ove48-mech-a — OVE-48 REVERT-vs-KEEP SUB-QUESTIONS RESOLVED (Loop A, fleshout-20261115T0215Z)

Run: fleshout-20261115T0215Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-ove48-mech-a, branch `sim-ove48-mech-a`, worktree
`~/workspace/worktrees/sim-ove48-mech-a`. Tracker blank #1;
evidence/2026-11-14/sim-ove48-conv.md "WHAT IS STILL UNPROVEN" +
"DOCUMENTED (open...)". Prereg:
evidence/2026-11-14/sim-ove48-mech-prereg.md (committed BEFORE any
judged sim, commit ac70d9951; stage-1 proof 65/65).

## Verdicts (one per sub-question — the revert-vs-keep call itself is NOT made here)

| Sub-question | Verdict | Headline |
|---|---|---|
| (a) KIND HALF — is vbrainCommit kind EVER populated? | **GO** | Kind non-null on 76.8% of weighted picks on master tip (383/499); 11 distinct kinds. The ove48-conv null was structural: no writer existed on either leg. |
| (b) UNSPOKEN DRIVE — do held conversations name the drive? | **NO-GO** | 18.7% of held sittings name the drive in turn lines (bar 25%, n=3,952); mean exchanges aligned 3.52 vs misaligned 3.55. BUT see the instrument-channel caveat below — the spoken transcript likely passes. |
| (c) CAUSAL PATH pick → 0/8 survival | **PROVEN NEGATIVE** | No semantic chain exists: kcal +0.014% of pantry flow, ticks +0.012% of budget, 0 held opens, no state series diverges before the first death divergence on any seed. |

In plain words: the kind half of OVE-48's contract works fine wherever
the dawn brain exists to fill it — the earlier null was because the
dawn brain itself hadn't landed yet on those old branches, not because
the reader is broken. Held conversations do NOT say the drive aloud in
the lines this instrument captures — but that instrument was listening
to the wrong channel (system narration, not spoken dialogue), and a
scratch probe of the real spoken transcript names the drive in 42.9–
62.5% of sittings, so the NO-GO is about the channel, not the
villagers. And the 3/8 → 0/8 survival collapse has no causal path
from the conversation pick at all: the pick costs almost nothing
(600 extra kcal across eight villages, 60 extra ticks), pays no trust,
teaches nothing, and the deaths start diverging on day 4–14, days
before any pantry, trust, roster, or standing series moves. The
survival effect is unexplained by this mechanism — most plausibly
chaotic RNG drift (54 extra weighted-pick draws re-roll every later
fight and forage) or a seed-band artifact, not something villagers
saying different words does to a village. Under held conversations
(COMPETENT_TALK=1) the collapse does not even reproduce: the subject
survives 4/8 vs the far end's 3/8.

## Lever played

None — DIAG. Instrument/recorder/driver/analyzer scripts only; ZERO
src/js changes (verified in stage 2: `git log master..HEAD -- src/js/`
empty). The OVE-48 pick itself (c937de65f / 493d7a975) is the subject
under measurement, not this arm's change.

## Method (per prereg — band, horizon, policy, legs)

- Seeds: deliberate reuse of the band-3 band 190457–190464 (8 seeds).
  Horizon 150d death-aware. Roster-check standing fix swapped in for
  every step (sha f8fda4295a99, from 5157782a4; native restored
  byte-identical afterwards, sha-verified 75762cb2… on the old legs,
  f9359976… on master tip). Own-policy per step.
- L-KIND (a): master tip a4d0b2038, STEP t-ove48-mech-kind, competent
  verbatim (walk-out policy). Purpose: kind population where writer +
  reader both exist. V5 replication does not apply (no band-3
  counterpart on master tip).
- L-TALK-BASE (b): far end 203a32775, STEP t-ove48-mech-talk-base,
  COMPETENT_TALK=1 (held conversations, up to 2/day, 5 turns).
- L-TALK-SUBJ (b): subject branch `transplant-15a-narrowed-subject`
  at 493d7a975, STEP t-ove48-mech-talk-subj, COMPETENT_TALK=1.
  Subject verified at run start (1 commit on the far end, tree
  6d6216e3…, diff 3 files +320/-3, green-list byte-identical).
  Read-only; never committed onto, never rebuilt.
- (c): NO new leg — analysis of the EXISTING ove48-conv corpora
  (V5-replicated to band 3) with the new causal analyzer.

## (a) KIND HALF — GO

### Why ove48-conv saw null everywhere (code-read, before the probe)

`src/js/villager-brain.js` does NOT exist at either ove48-conv leg:
`git show 203a32775:src/js/villager-brain.js` and
`git show 493d7a975:src/js/villager-brain.js` both fail. The writer —
`vbrainScorePick` / `writeCommit` / `vbrainCommit` — landed with the
phase-1 dawn-brain merge (PR #7, 816404356, 2026-11-08 21:05Z),
after both legs' bases. The reader (`convoDawnPriorities`) guards
with `typeof this.vbrainCommit === 'function'` and returns kind null
when the writer is absent. So the kind half was STRUCTURALLY
unpopulatable on both legs — not a reader failure, not a measurement
failure. The drive half worked because `vgoalState`/`vgoalWeights`
existed on both legs.

Writer wiring (current master, quoted): dawn pick at
villager-objectives.js:1817 (`objRefreshPick(rid, hx, hy,
{dawn: true})` at dayPart 0, only when the villager's objective is
empty/done/returning); `objPick` calls `vbrainScorePick`
(villager-objectives.js:662) or a hard-gate `vbrainLogGate`
(LEAVE/REST/EAT/HAUL/SEEK early returns) — both write a commit via
`writeCommit` with `kind: chosen.kind`, `day` = scholar day.
`vbrainCommit(vid)` returns `state.village.vbrain.commit[vid]` or
null; the instrument and `convoDawnPriorities` discard a commit whose
day is not today. A live scratch probe (seed 190457, 30d, verbatim,
unjudged) had already shown commits with kinds at conversation time
on 32/32 calls (25 same-day, 7 stale-yesterday) before this prereg
was written.

### The probe (L-KIND, master tip, verbatim)

| | L-KIND |
|---|---|
| Conversation opens | 758 |
| Weighted-pick opens | 499 |
| `convoDawnPriorities` reads | 499 (one per weighted pick) |
| pickDawn.kind non-null | **76.8%** (383/499) |
| Independent dawnKind non-null | **76.9%** (583/758) |
| Pick's own aligned flag agrees with analyzer | 100.0% (n=499) |
| Dawn-aligned share (weighted-pick) | **81.4%** (406/499) |
| Validity V1/V2/V4/V6 | all pass (opens 758 ≥ 200; classified 100.0%; 0 errors; kind-read attempted 100%) |

Per-seed aligned shares: 80.8%, 78.8%, 77.9%, 84.4%, 76.4%, 81.8%,
82.0%, 86.3% — the separation from the far end's 28.7% holds on
every seed, and the kind boost stacks on top of the drive boost
(master tip aligns higher than the subject leg's 74.9%, as the
kind+drive tables predict).

Kinds populated (pickDawn.kind): DUTY 82, HAVEN_CHORE 83, VISIT 43,
EAT 41, WATER 44, ASSIGN 49, SEEK 15, EXPEDITION 12, FORAGE 8,
HAUL 5, HUNT 1 — 11 distinct kinds. (Independent read: DUTY 127,
HAVEN_CHORE 121, WATER 80, ASSIGN 78, VISIT 67, EAT 57, SEEK 19,
EXPEDITION 14, FORAGE 14, HAUL 5, HUNT 1.) DUTY and ASSIGN have no
DAWN_KIND_WANTS entry — they populate the record but contribute no
kind boost, only the drive half. The remaining 23.2% of weighted
picks with kind null are villagers with no same-day commitment at
open time (stale yesterday's commit, or an objective that never
re-picked at dawn because it was still live — the dawn re-pick only
fires when the objective is empty/done/returning).

**GO.** Named condition: kind is non-null whenever a villager holds
a same-day vbrain commitment (dawn pick or hard gate) — the normal
case on any tree that contains villager-brain.js. The kind half of
OVE-48's contract IS exercised in live play on current master.

## (b) UNSPOKEN DRIVE — NO-GO (with a channel caveat that matters)

### The judged measurement (talk legs, COMPETENT_TALK=1)

| | Talk-base (far end) | Talk-subj (OVE-48) | Pooled |
|---|---|---|---|
| Conversation opens | 2,852 | 3,097 | 5,949 |
| Weighted-pick opens | 1,239 | 1,489 | 2,728 |
| Dawn-aligned share | 26.5% | 65.7% | — |
| `convoDawnPriorities` reads | 0 ✓ (control) | 1,489 ✓ | — |
| Held sittings (exchanges ≥ 1) | 1,895 | 2,057 | 3,952 |
| Mean exchanges per held sitting | 3.52 | 3.55 | 3.54 |
| Held sittings naming the drive (turn lines) | 308 (16.3%) | 432 (21.0%) | **740 (18.7%)** |
| Held sittings naming the drive (opener incl.) | 854 (45.1%) | 1,080 (52.5%) | 1,934 (48.9%) |
| Mean exchanges, aligned opens | — | — | 3.52 (n=1,959) |
| Mean exchanges, misaligned opens | — | — | 3.55 (n=1,993) |
| Validity V1/V2/V3/V4/V6 | all pass | all pass | — |

GO required BOTH: naming ≥ 25% AND mean exchanges aligned >
misaligned. Naming is 18.7% (bar 25%) and aligned sittings run
0.03 exchanges SHORTER than misaligned ones (3.52 vs 3.55, n≈2,000
a side — a tie, not a lead). **NO-GO.** Neither half is close on
naming, and the length half is a dead heat. The pre-registered
NO-GO condition "0 lines name the drive on either leg" does not
trigger (740 sittings do name it) — this is a miss on the bar, not
a zero.

Two honest observations about what the numbers mean:

1. The opener DOES name the drive about half the time (48.9%
   opener-inclusive). The pick's spoken output carries the drive;
   the sitting then moves on to other things — mostly the canon
   questions and the villager's past/identity ("Where are you from?",
   "What's something you're good at that nobody here knows about?",
   "When's the last time you really laughed?"), plus favor business.
   The drive is the knock on the door, not the conversation.
2. The aligned/misaligned length split is confounded by target
   selection: deepTalk picks want-holders first, and the subject
   leg's aligned opens are concentrated in curious/ask_favor wants
   whose threads (questions, past) run a fixed length regardless of
   alignment. Alignment does not buy a longer sitting in this
   engine — the energy budget (2–6 exchanges from temperament +
   social need) does.

### The channel caveat (metric review — does NOT re-score the run)

The judged instrument captures lines via `Game.say`. Reading the
engine while writing this up showed that **spoken dialogue does not
go through `Game.say`**: `sayLine` (conversation.js:910) pushes
spoken beats directly to `c.transcript` — `Game.say` carries
narration, journal receipts, and system beats instead. So the 18.7%
judges what the sitting EMITS via say, not what the villager
SPEAKS. A scratch probe (seed 190457, 30d, COMPETENT_TALK=1,
master tip, unjudged — same classifier, transcript beats instead
of say lines) found:

- 56 held sittings, ALL with spoken beats (294 them-beats, ~5.25
  per sitting — the transcript is rich; the say channel was the
  thin one, with only ~10% of held sittings yielding even one
  quoted turn line).
- Drive-naming on transcript beats: **35/56 = 62.5%** — above the
  25% bar. Excluding sittings whose ONLY match is the generic word
  "promise" (favor-talk, 26 matching beats — the lexicon's loosest
  generic): **24/56 = 42.9%** — still above the bar.
- Mean exchanges aligned 3.94 (n=16) vs misaligned 3.33 (n=3) —
  too thin a split to judge the length half.

So the spoken half of (b) likely PASSES the naming bar, and the
judged NO-GO is an instrument-channel finding. The next run needs a
transcript-recording instrument (record `c.transcript` at endConvo)
plus a tighter lexicon (drop "promise" as a generic unless the line
is about the dawn commitment) before anyone concludes villagers
don't talk about their drive. The verdict stands as NO-GO per
metric binding — a miss is a miss — but the coordinator should not
rest the revert-vs-keep call on it.

Sample spoken beats from the probe (all from held sittings):
"About the food I needed — the need hasn't gone anywhere. I'm
still asking." (food_security / ask_favor); "Riders say your name
the way people say 'harvest.'" (food_security); "The moot turns to
you. Your vote matters here." (build_standing). And the usual
non-drive talk: "Do you still sing? ...Sorry — weird question. I
just realized I haven't heard anyone sing."; "What scares you most
about what's happening? The real answer."

## (c) CAUSAL PATH — PROVEN NEGATIVE

### The checklist, per seed, on the existing ove48-conv corpora

| Check | Base (far end) | Subject (OVE-48) | Verdict |
|---|---|---|---|
| Opens (8 seeds) | 875 | 935 (+60) | — |
| Weighted-pick draws (RNG draws) | 515 | 569 (+54) | — |
| kcal cost of opens (10 kcal × opens) | 8,750 | 9,350 | delta +600 kcal |
| kcal delta vs pantry FLOW (4,171,658 kcal gross movement) | — | — | **+0.014%** |
| Tick cost of opens (1 tick × opens) | 875 | 935 | delta +60 ticks |
| Tick delta vs total tick budget (942 seed-days × 512) | — | — | **+0.012%** |
| Held opens (trust stipend / mood / favor / teaching channels) | 0 | 0 | all channels 0 |
| Deaths (8 seeds) | 533 | 635 | — |

Per-seed first-divergence table (stateDiv = first day a state
series sustains a material divergence; deathDiv = first day the
death sets differ):

| Seed | Days base/subj | Deaths | deathDiv | Earliest stateDiv | State before death? |
|---|---|---|---|---|---|
| 190457 | 150/134 | 62/64 | day 6 | day 9 (wave kills) | no |
| 190458 | 101/108 | 67/72 | day 11 | day 12 (roster) | no |
| 190459 | 150/109 | 54/90 | day 11 | day 11 (wave kills) | no (same day, not before) |
| 190460 | 124/129 | 74/112 | day 6 | day 6 (wave kills) | no (same day) |
| 190461 | 129/135 | 106/97 | day 6 | day 8 (wave kills) | no |
| 190462 | 150/123 | 59/56 | day 14 | day 15 (wave kills) | no |
| 190463 | 23/138 | 25/80 | day 4 | day 9 (pantry/roster) | no |
| 190464 | 115/142 | 86/64 | day 4 | day 7 (pantry) | no |

On NO seed does any state series (pantry, trust, roster-alive,
wave kills, standing) diverge before the first death divergence.
The deaths start diverging on day 4–14 — within the first week,
after only a handful of opens, when the cumulative opener cost is
tens of kcal and a few ticks. No semantic mechanism can kill
anyone that fast for that cheap. What CAN diverge that fast is the
RNG stream: the subject draws 54 more weighted-pick random numbers
than the base, so every later roll (forage yield, fight blow,
sighting) lands on a different number, and fight outcomes diverge
within days. That is chaotic drift with no semantic content — a
candidate non-semantic carrier, not a causal chain, and it is
labeled as such.

**PROVEN NEGATIVE.** No downstream state delta attributable to
opener choice beyond the pick itself. The survival effect is
unexplained by this mechanism. Per the prereg: recommend a
fresh-band re-test of the survival effect, or treat 0/8 as a
seed-band artifact.

Corroboration from the talk legs (not a re-test — different
policy, but telling): under COMPETENT_TALK=1 the subject does NOT
reproduce the collapse — it survives 4/8 vs the far end's 3/8 on
the same band, with a higher median (150d vs 147d) and higher
standing (199–740 vs 150–525). If the opener pick itself killed
villages, holding longer conversations on top of it should make
things worse, not better. The 0/8 does not survive a policy change,
which is what a seed-band/RNG artifact looks like, not what a
mechanism looks like.

### Analyzer fix, disclosed (pre-evidence)

The causal analyzer's first run compared the kcal delta against
the MEAN PANTRY LEVEL (2.39%) — a units error (run-total against
a level). The prereg names the budget as pantry FLOW; the analyzer
was fixed to the flow denominator (gross pantry movement,
4,171,658 kcal) before any evidence was written, and re-run: the
corrected share is 0.014%. The bar did not change; the
implementation was corrected to match the prereg as written. The
wrong-denominator run's verdict (CHAIN-CANDIDATE on the false
2.39%) is superseded and is recorded here so nobody revives it.

## Wall numbers (scale-onramp axis)

| | L-KIND (master tip, verbatim) | Talk-base (far end, held) | Talk-subj (OVE-48, held) |
|---|---|---|---|
| Survived /8 | 2/8 | 3/8 | 4/8 |
| Median survival | 100d | 147d | 150d |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 reached /8 | 2/8 | 6/8 | 5/8 |
| Wave-4 reached /8 | 8/8 | 8/8 | 8/8 |
| Deaths (all seeds) | 555 | 600 | 642 |
| Standing range | 100–480 | 150–525 | 199–740 |
| Scale rank | regional 8 | regional 8 | regional 8 |

The scale wall stands on every leg: national 0, table 0, wins 0.
Waves 1–5 are reachable (wave 5 on 2–6 of 8 seeds per leg);
regional is reached everywhere; national, the table, and the win
flag remain decoration in these sims — unchanged by OVE-48, by
held conversations, or by master-tip code in either direction.
Death causes are the familiar shape on all legs: villager combat
and combat dominate (kind leg: villager combat 253, combat 103,
the wild 76, expedition 73; talk legs similar, with expedition
57/94). Villages die fighting, not hungry (starvation 6/8/0).

## Reachability verdict

Waves 1–5 reachable on all three legs. Arc reach: not re-measured
on the mech legs (the ove48-conv arm recorded ARC IV on subject
seed 190458). Regional reached on 24/24 seed-legs; national, the
table, and the win flag reached on 0/24. The content past regional
remains decoration in these sims.

## Village assessment (plain words)

Eight villages, same eight starting points, three versions of the
same world. On the newest code, villagers open conversations with
what dawn already asked of them — and dawn asks in eleven different
kinds of day: a forage day, a water day, a duty day, a visit day,
a day someone was assigned. The kind is real now; it was never a
broken reader, just a brain that hadn't been built yet when the old
branches were cut. When the scholar sits down and stays — two real
conversations a day — the villagers talk about their lives, their
pasts, who they were before all this, and sometimes, in the middle
of it, about the thing the day asked of them: the pantry, the
harvest, the moot, the promise they still owe. They don't sit
longer because the opener matched the day; they sit as long as
their temperament and the conversation's own energy allow, about
three and a half turns either way. And none of this — not the
words, not the sitting, not the knock on the door — is what kills
a village. Villages die in fights in the first two weeks, before
the pantry or the trust or the roster has had time to move at all,
and the only thing that changed that fast is the luck of the draw.
The villages still don't reach national, still don't see the table,
still don't win — the scale wall is untouched by any of this,
either way.

## Sense-testing (read the transcripts, not just the counts)

The opener lines read like people and track the want: food-drive
ask_favor opens with "Pantry's thin and getting thinner. Come
forage with me tomorrow — two of us can fill packs"; safety-drive
warn_you opens with "Well, Listen. I need you to hear this before
you go back out there." Held sittings read like people too, mostly
about identity and the past — the night security guard who is
really a mechanic, the cache with the fresh-dug dirt, the question
about where you're from. Nothing robotic or repeated beyond the
per-want line pool itself, which predates this arm. Two honest
limits: (1) the judged (b) lines are Game.say emissions, not the
spoken transcript — see the channel caveat; (2) the lexicon's
generic word "promise" matches favor-talk, not drive-talk, and
carries a third of the transcript probe's matches — the next run's
lexicon should drop it or require it next to a dawn word.

Also recorded: grief/taken talk thins under OVE-48 even in held
conversations (seek_taken 150→93, seek_comfort 138→94, talk legs)
— the flavor cost named in ove48-conv persists when villagers sit
down, not just when they walk out. And repay pre-emptors are ~10%
of talk-leg opens (315 base / 320 subj): the held policy engages
unresolved wants first, so a tenth of all conversation opens are
the villager collecting on an old debt, not the dawn pick at all.

## Blanks filled / documented

FILLED:
- (a) The kind half: GO on master tip, 76.8% non-null, 11 kinds,
  with the code-read explanation for the ove48-conv null
  (writer absent on both legs) and the writer path quoted.
- (b) The unspoken drive, as far as the say channel reaches:
  NO-GO, 18.7% naming, length a tie — plus the transcript probe
  showing the spoken half likely passes (42.9–62.5%), which
  reframes the NO-GO as an instrument-channel finding.
- (c) The causal path: PROVEN NEGATIVE, with the per-seed
  divergence table and the RNG-drift carrier named.
- The mech instrument (openIdx/seq line joins, exchanges at close,
  held flag, raised caps), driver, analyzer (drive lexicon +
  compareTalk), causal analyzer, step script, and proof test —
  committed ac70d9951 (prereg + tooling, stage-1 65/65),
  9e06472f9 (causal fix + JSON), 069f96e8c (kind corpus + step
  restore fix), 36b62f90 (talk-base corpus), 3d3744340
  (talk-subj corpus + comparison). Stage-2 proof:
  `node scripts/test-ove48-mech.js --stage2` (result recorded in
  the report).

DOCUMENTED (open, for the coordinator / next arm):
- The (b) NO-GO must not carry the revert-vs-keep call alone: the
  spoken transcript names the drive at 42.9–62.5% on a scratch
  probe. A judged transcript run (record c.transcript at endConvo,
  tighter lexicon) is owed before (b) is treated as settled.
- The survival effect (3/8 → 0/8) is unexplained by this
  mechanism; recommend a fresh-band re-test or treating 0/8 as a
  seed-band artifact. The talk legs' 4/8 vs 3/8 points the same way.
- DUTY/ASSIGN kinds populate the commitment record but have no
  DAWN_KIND_WANTS entry — they get no kind boost. If a future
  tuning wants duty/assigned days to shape openers, the kind table
  is the place, not the reader.
- Safety-drive alignment remains the weakest channel (ove48-conv);
  not re-measured here.
- Step-script lesson: on newer trees, vetfirst/masterregress are
  tracked files — the restore must restore them from the step
  commit, not delete them (kind leg failed its final clean check
  on this; fixed in 069f96e8c). The talk-base step was interrupted
  by a runtime restart at 7/8 seeds; seed 190464 was re-run singly
  with identical env and the step's restore was performed manually
  (standing.js verified back to native 75762cb2…).

## Metric review

1. The (b) bar was applied as written and missed on both halves —
   no re-scoring. But the instrument measured the wrong channel:
   Game.say lines are narration/receipts, not spoken dialogue.
   The next run's prereg should define the line source as
   c.transcript beats at endConvo (which the scratch probe shows
   are plentiful: 294 beats in 56 sittings) and should tighten the
   lexicon: drop "promise" as a standalone generic (it matches
   favor-talk), and require generic dawn/commitment words to appear
   in a quoted beat. The 25% bar itself looks right for transcript
   beats (probe: 42.9% ex-promise) — keep it.
2. The (c) <1% budget test did its job once the denominator was
   the prereg-named flow. The per-seed divergence table (state
   before death: false on 8/8) is the stronger half of the
   PROVEN-NEGATIVE case; keep both in the next causal prereg.
3. The (a) 1% bar was deliberately weak (any non-null kind proves
   population) and the result (76.8%) cleared it by 75 points —
   the bar was a tripwire, not a discriminator, and that was the
   right shape for the question as posed.
4. No metric was re-scored mid-run. The causal denominator fix
   corrected an implementation to match the prereg as written; it
   did not change any bar.

## Commits (this arm, branch sim-ove48-mech-a)

- ac70d9951 — prereg + mech instrument/driver/analyzer/causal/step
  + proof test (stage-1 65/65)
- 9e06472f9 — causal kcal denominator fix (flow per prereg) +
  causal JSON (PROVEN-NEGATIVE)
- 069f96e8c — kind leg corpus (master tip) + step restore fix
- 36b62f90 — talk-base leg corpus (far end, COMPETENT_TALK=1)
- 3d3744340 — talk-subj leg corpus (subject, COMPETENT_TALK=1) +
  talk comparison (NO-GO)
- (this run) — this evidence file

## Files

- Prereg: evidence/2026-11-14/sim-ove48-mech-prereg.md
- Instrument: scripts/ove48-mech-instrument-20261114.js
- Driver: scripts/ove48-mech-driver-20261114.js
- Analyzer: scripts/ove48-mech-analyze-20261114.js
- Causal analyzer: scripts/ove48-mech-causal-20261114.js
- Step: scripts/ove48-mech-step.sh
- Proof test: scripts/test-ove48-mech.js
- Kind corpus: evidence/2026-11-14/perseed-ove48-mech-t-ove48-mech-kind/
  + ove48-mech-t-ove48-mech-kind-driver.log
  + ove48-mech-t-ove48-mech-kind-summary.json
- Talk-base corpus: evidence/2026-11-14/perseed-ove48-mech-t-ove48-mech-talk-base/
  + ove48-mech-t-ove48-mech-talk-base-driver.log
  + ove48-mech-t-ove48-mech-talk-base-summary.json
- Talk-subj corpus: evidence/2026-11-14/perseed-ove48-mech-t-ove48-mech-talk-subj/
  + ove48-mech-t-ove48-mech-talk-subj-driver.log
  + ove48-mech-t-ove48-mech-talk-subj-summary.json
- Talk comparison: evidence/2026-11-14/ove48-mech-talk-comparison.json
- Causal: evidence/2026-11-14/ove48-mech-causal.json
- Band-3 / ove48-conv reference: evidence/2026-11-14/sim-transplant15a-band3.md,
  sim-ove48-conv.md, sim-ove48-conv-prereg.md
