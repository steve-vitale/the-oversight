# sim-donatebank-b — BUILD: donation-only pantry banking — DIAG-STOP at smoke

Run: fleshout-loop-b-20261114T1945Z (Loop B), arm sim-donatebank-b
Axis: winnability chain. BUILD arm — isolates the DONATION leg of the
holdpantry bundle (banking without the field trips) and measures
whether polities HOLD before/after on identical seeds.
Policy-side only: one new policy file + the baseline policy restored
verbatim, zero src/js changes.
Branch: sim-donatebank-b — worktree ~/workspace/worktrees/sim-donatebank-b
Base: master 62dd6d36f
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-donatebank-b-prereg.md (binds G1/G2/G3;
separation finding appended post-prereg, pre-pilot)

## Verdict: DIAG-STOP — the donation leg moves zero grain without the trip

- **G1 INSTRUMENT VALIDITY — GO at smoke scale.** Full per-day link
  roll on both 60d smoke configs, **0 instrument errors**,
  **0 unattributed diplomacy points (net)**, **0 unattributed steps**,
  **0 UNCLASSIFIED links**. The episode analyzer is validated on the
  same flicker record as holdpantry. No pilot ran, so G1 is judged on
  the smoke only — stated here, not inflated.
- **G2 THE LEVER — NOT TESTED (premise fails at smoke).** The armed
  leg's donation step ran on 49 bank days on seed 100101 and donated
  **0 kcal**; on seed 91103 it ran on 51 bank days and donated **0
  kcal**. The lever's input is zero, so a pilot would measure a
  zero-effect lever. This is a DIAG-STOP, not a G2 NO-GO: no judged
  pilot exists to fail, and the prereg's G2 bar is never scored.
- **G3 LEVER-ONLY — GO.** Zero `src/js` changes in the branch diff;
  proof test static 63/63, game 28/29 — the single game failure IS
  the donation-moved-grain assertion, which correctly caught the dead
  lever at smoke stage instead of after a pilot.
- **COST BAR — MOOT.** Nothing is banked, nothing is spent, nothing
  is risked: the armed smoke leg's survival (60d, survived) matches
  the baseline's, and villager combat deaths 37 vs 31 are smoke-scale
  noise on one seed, not a lever cost. No cost verdict is claimed.

No pilot band was spent. The prereg licenses a 12–16 seed confirm
only on a clear GO; the smoke is a STOP, so the pilot IS not run.

## The answer in one paragraph

The donation is the funnel, not the source. Holdpantry's banking
moved 118,914 kcal and the evidence credited the donation leg — seed
91103 donated 40,590 kcal with zero successful trips, which read as
"the donation moves grain with zero field time." It does not. Pulled
apart, the donation step on its own moves nothing at all: on the
exact seed where holdpantry donated the most, the donation-only step
ran 51 days and banked 0 kcal, while holdpantry's full step banked
15,210 kcal in the same 60 days with zero successful trips. The
pack is empty by the time the donation runs — the scholar's ordinary
day ends with the haul eaten and the surplus already swept by
competent's own donation, so there is nothing above the one-day keep
left to move. What fills the pack is the evening trip itself: even a
trip whose forage reports failure leaves donation-ready food in the
pack, up to ten thousand kcal on a good night, and the donation call
then moves it. A failed trip still spends the evening in the field —
so the exposure cost this arm was built to remove is paid by the very
step that fills the pack, and banking without the trip banks nothing.
The hold is still open, and it is not a donation problem anymore.

## Before / after (smoke only — NO pilot; 60d, seed 100101)

| Seed | Before: scaleclimb (days, end, scale, maxW, stand, w1/w2/w3) | Armed (days, end, scale, maxW, stand, w1/w2/w3) | dip end (peak, held d) | pantry ≥20k days | banked kcal |
|---|---|---|---|---|---|
| 100101 | 60, survived, regional, 3, 50, 16/5/2 | 60, survived, regional, 3, 50, 19/7/2 | 0 (0, 0) | 6 → 8 | 0 |

Pooled wave kills (smoke, 1 seed): baseline 16/5/2, armed 19/7/2.
Median survival: not a pilot number — both legs survived to the 60d
smoke horizon. The armed leg's extra wave-1/2 kills (19/7 vs 16/5)
are one-seed noise on divergent RNG paths, not a lever effect: the
lever moved 0 kcal, so it cannot have caused them. No G2 numbers are
reported because the pilot never ran; the smoke's held-days (0 both
legs) and ever-counted (0 both legs) are horizon artifacts (links
need 30 days to season; the smoke ends at day 60 with 2 links
seasoned on the armed leg, 0 on the baseline, neither counted).

## The mechanism probe (the finding, measured)

scripts/probe-donation-source-20261114.js decomposes one day per
policy — competent.daily, then the banking/donation step, then the
courtship — and records donation-ready pack kcal after each piece.
60d per leg, seeds 100101 and 91103. (The probe needs the holdpantry
policy recovered to scripts/policies/competent-holdpantry-probe.js
from 4f26f01c5; the file is NOT committed — see the probe header.)

| Seed / leg | Bank step pantry delta (60d) | Total donated via verb (60d) | Donation-ready pack kcal after competent.daily (n>0 / max / median) |
|---|---|---|---|
| 100101 baseline | — (no step) | 0 | 17/60, 900, 0 |
| 100101 donatebank | **0** (49 bank days) | 0 | 19/60, 1,030, 0 |
| 100101 holdpantry | **306** (42 bank days, 42 trips, 5 ok) | 3,575 | 13/60, 9,555, 0 |
| 91103 baseline | — (no step) | 0 | 14/60, 900, 0 |
| 91103 donatebank | **0** (51 bank days) | 0 | 14/60, 900, 0 |
| 91103 holdpantry | **15,210** (47 bank days, 47 trips, **0 ok**) | 10,710 | 17/60, 10,260, 0 |

Three things in that table decide the verdict. First, the donation
step's input is zero without the trip: donation-ready pack kcal after
competent.daily is 0 on most days (median 0 both legs, both seeds;
max 900–1,030) — the scholar eats the ordinary haul and competent's
own donation (keep 2× cap when kcal > 1.5× cap) sweeps the rest, so
nothing sits above the 1-day keep when the donation runs. Second,
the trip fills the pack even when it "fails": on 91103 holdpantry
ran 47 trips with ZERO ok and still banked 15,210 kcal, and the
pack held up to 10,260 ready kcal after competent.daily on the
holdpantry leg (trip food carried overnight) against 900 without
it. The forage action reports failure while still gathering — the
exact yield channel is unrecorded (see backlog item 2). Third, the
donation call does move what the trip brings: holdpantry's banking
step delta (306 / 15,210) is real pantry gain, and its total donated
via the verb (3,575 / 10,710) includes competent.daily's own next-day
donations of trip food. The funnel works; the source is the trip.

## The verb table (smoke, armed leg, seed 100101, 60d)

| verb | calls | trust moved | first-crossings | refused |
|---|---|---|---|---|
| proposeLink (LEAD) | 3 | — | — | 0 declined, 0 shut |
| └ accepted outright | 2 | — | — | — |
| └ countered | 1 | — | — | — |
| answerCounter ('accept') | 1 | — | — | 0 |
| answerAccord ('gift' +10) | 3 | +30 | 3 | 0 |
| tendLink, policy (+8/week) | 0 | 0 | 0 | 0 |
| tendLink, engine — villagers' own drive | 5 | +40 | 0 | 0 |
| payTribute | 0 | 0 | 0 | 0 |

Baseline leg for contrast: propose 3 (2 accepted, 1 counter, 0
declined), counter-answers 1, accord 3 (+30), tend policy 0, tend
engine 0, national/global answers 0 both legs (the armed leg answers
none by design; the baseline never had any to answer). Propose blocks
(days): pantry 31 baseline / not re-measured armed (smoke scale).
Tends paid: 0 kcal on both legs — the pantry cleared 20k on only
6–8 days in 60 and the weekly tend window never coincided with a
clear day on either leg; the 5 engine tends on the armed leg are the
win-plan drive (winPlanBondsTick), which fires on pantry-days, not
the kcal gate. Nothing here is a lever effect: the lever moved 0
kcal, so the 5–0 engine-tend gap is the pantry clearing the gate on
2 more days by RNG-path divergence, not banking.

## Wall numbers (scale wall, every run — SMOKE SCALE ONLY)

- National / table / wins: baseline **0/8** (1 smoke seed, 60d),
  armed **0/8** — no village reaches national, the table, or a win
  in the smoke. These are NOT pilot wall numbers; the pilot never
  ran. Do not quote them as band results.
- Wave 4–5 reach: wave 4 unlocked 0/1 both legs at 60d (horizon
  artifact — wave 4 unlocks later); wave 5 unlocked 0/1 both.
- Median survival: both legs survived to the 60d smoke horizon
  (60d/60d). No survival verdict is claimed.
- Death causes: villager combat deaths 37 armed vs 31 baseline on
  the single smoke seed — noise, not a cost-bar read.

## Balanced panel (§15 — instrument, not judge)

NO panel was built: the §15 pseudo-panel compare needs the 8-seed
pilot corpus, which was never run. Building a panel from a 1-seed
smoke would be a 1-case compare dressed as a panel. The panel
builder (scripts/build-donatebank-panels-20261114.js) is committed
and verified by syntax check; it runs on the pilot corpus if a
future run ever produces one. The deciding instrument for this run
is the probe + the proof test's §2 smoke leg, not a panel.

## Telemetry deviation check (loop step 10)

Not run: the telemetry check compares a pilot corpus against the
scale-wall baseline, and there is no pilot corpus. The smoke
per-seed JSONs (2 files) are recorder rows, not runs; the tool
refuses recorder corpora by design (holdpantry precedent). No LOUD
line was produced because no check was attempted on an unjudged
corpus.

## Village assessment

One village, twice, for sixty days — once courted, once courted and
asked to bank. The banked village's scholar comes home each evening
and dutifully pushes the day's haul toward the pantry, and the
pantry does not move: the haul is already eaten, already given,
already gone, and the empty-handed gesture repeats for 49 evenings
without adding a single calorie. The pantry sits at 8–12k most days
on both legs and clears the 20k gate on 8 days instead of 6, which
is the wind, not the banking. The courtship itself is unchanged and
reads the same on both legs: three links form, two are accepted
outright, one counters and is accepted on their terms, three gifts
of 2,000 kcal walk out and come back as trust. The village survives
sixty days either way, buries 37 of its own instead of 31, kills 19
wave-1 beasts instead of 16 — all of it one-seed weather. What the
smoke proves is narrower and more useful than a pilot verdict: the
pantry cannot be banked from the ordinary day. The grain that
holdpantry banked was gathered on evening trips that mostly report
failure and still come home loaded, and any arm that wants the
banking has to pay for the trip or find the grain somewhere the day
already goes — not in the empty pack at dusk.

## Sense-testing (SENSE-TESTING LAW)

The courtship still reads like a played relationship on the smoke
lines. The formation (day 10): "📓 Codex: First link formed with
Emberhold. The gesture goes out now; the Dawn waits for seasons."
The gift (day 11): "🎁 Haven's first gesture: 2,000 kcal walks to
Emberhold's fire — a gift, no strings. They count it, and they
remember who sent it. (Trust +10.)" The seasoning line repeats
honestly ("Three weeks. That's how long before a handshake is a
relationship — the System will say so when it's true. Tend this
fire."). The fire network answers back (day 13–14): "That's what
the fire network is FOR" (Trust +4), tribute wagons turning at the
gate, Grace weeping over 1,377 kcal honestly counted. Villager
dialogue stays coherent and specific (Quinn the ex-bartender
confessing a cleaner story than he had; Eamon teaching the sporefall
counter by name). What is STILL missing, same as holdpantry: the
polity never forms in a 60d smoke, so there is no holding or
dissolution line to judge — and the dissolution still has no played
line in the game at all. The donation step itself is silent: no line
marks a banking day, so a player would never know the scholar tried
to bank and found nothing — a silent no-op is the exact failure the
no-silent-actions rule exists to catch, and it is worth a line if
any future banking arm lands.

## Metric review (§14)

1. The smoke caught the dead lever before the pilot — that is the
   staged method working as designed (§§9–12: pilot gate first, never
   spend a confirm on an invisible effect). The proof test's §2 game
   leg is the gate, and its one failure is the finding.
2. G1 held at smoke scale (0 errors, 0 unattributed, 0
   unclassified). It was never tested at pilot scale, and no pilot
   claim is made from it.
3. G2 was never scored — correctly. Scoring a zero-input lever
   against the held-days bar would produce a NO-GO that says less
   than the DIAG: the bar assumes banked grain exists. The metric
   was not wrong; its precondition failed. The prereg's "recorded
   alongside" counters (donated kcal, bankDays, pantry days above
   20k, field-trip counts) are what carried the verdict instead —
   they are the reason the stop is a diagnosis rather than a shrug.
4. The holdpantry evidence's causal claim ("the donation leg moved
   118,914 kcal with zero field time") is CORRECTED here: the
   donation call moved trip grain, not ordinary-haul grain. The
   91103 case proves donation-without-SUCCESSFUL-trips, not
   donation-without-field-time. Any future arm that cites holdpantry
   for a trip-free banking effect is citing a misread.
5. The pack-keep finding (prereg) stands and is now load-bearing in
   the other direction: the explicit keepKcal: cap is a no-op vs the
   default under the run env, so the donation call was holdpantry's
   call exactly — and it still moved 0. The keep was never the
   difference; the trip was.
6. The trip's failure channel is the open instrument gap: a trip
   whose forage returns falsy still leaves up to ~10k ready kcal in
   the pack. Until that channel is named (forage yield on falsy
   return? travel auto-gather? partial harvest?), any arm that
   prices the trip by its 15.5% "success" rate is pricing the wrong
   thing — the trip succeeds at gathering far more often than it
   reports.

## Evidence files

- Prereg: evidence/2026-11-14/sim-donatebank-b-prereg.md
  (+ separation-finding section appended post-prereg, pre-pilot)
- Baseline policy: scripts/policies/competent-scaleclimb-b.js
  (restored verbatim from 29a794df6 — instrument, not a lever;
  sha256 24d6b4ad8fbe8d3c5ff542cc99a8cd08fb6be1b4da3bff7b09f092b668d2a032)
- Policy: scripts/policies/competent-donatebank-b.js (new)
- Driver: scripts/donatebank-driver-20261114.js (new)
- Analyzer: scripts/analyze-donatebank-b.js (new)
- Panel builder: scripts/build-donatebank-panels-20261114.js (new,
  NOT run — no pilot corpus; see panel section)
- Proof: scripts/test-donatebank-b-20261114.js (new; static 63/63,
  game 28/29 — the 1 failure is the donation-moved-grain assertion)
- Probe: scripts/probe-donation-source-20261114.js (new; diagnostic
  — needs the holdpantry policy recovered to
  scripts/policies/competent-holdpantry-probe.js from 4f26f01c5,
  NOT committed; delete after use)
- Per-seed JSON (smoke only): evidence/2026-11-14/perseed-donatebank-b/
  (2 files, seed 100101, 60d, both legs)
- Analysis JSON (smoke only): evidence/2026-11-14/donatebank-b-analysis.json
  (n=1 per policy — smoke scale, not a pilot analysis)
- Evidence: this file

## Commits (branch sim-donatebank-b)

- 66432cdff prereg (G1/G2/G3 bars; fresh band 100101–100108;
  donation-leg separation verified from the holdpantry evidence;
  pack-keep no-op finding; ANSWERMAIL_DRIVE unset, matching
  holdpantry/sibling)
- 5bf08043c instruments: baseline policy (verbatim 29a794df6) +
  armed policy + driver + analyzer + panel builder + proof test
  (static 63/63)
- (this commit — prereg separation-finding amendment + probe +
  smoke corpora + smoke analysis + evidence; DIAG-STOP, no pilot)

## Findings for the backlog (coordinator owns sim-findings.md)

1. **The donation is the funnel, the trip is the source.** A
   donation-only banking step moves 0 kcal (49–51 bank days, two
   seeds, including the seed where holdpantry donated the most).
   Holdpantry's 118,914 kcal was trip grain moved by the donation
   call. Any future banking arm must bring its own grain source —
   the ordinary day's haul is already eaten/swept by the time the
   donation runs. (This arm's verdict.)
2. **A "failed" forage trip still gathers.** `forageTripSeedFirst`
   returns 0 (no forage `ok`) while leaving up to ~10k
   donation-ready kcal in the pack (91103: 47 trips, 0 ok, 15,210
   kcal banked in 60d). The yield channel on a falsy forage return
   is unrecorded. Price the trip by its gathering, not its reported
   15.5% success rate — and record the failure reason before the
   next trip-pricing arm.
3. **Correct the holdpantry causal claim in the record.** "The
   donation leg moved 118,914 kcal with zero field time" misreads
   91103: it is donation-without-SUCCESSFUL-trips, not
   donation-without-field-time. A failed trip still spends the
   evening in the field. (Correction, not a new arm.)
4. **The donation step is silent.** No played line marks a banking
   day or an empty-handed donation, so a player would never know the
   scholar tried to bank and found nothing. If any banking arm
   lands, it needs a line (the no-silent-actions rule).
5. **The polity's dissolution still has no played line.** Same gap
   as holdpantry; the drift warning exists, the formation line
   exists, the loss itself is silent in the game.

## Convergence state

BUILD — DIAG-STOP at Stage 0 smoke (no pilot, no confirm licensed).
The axis line updates from this run's numbers only: the donation-only
isolation is dead (0 kcal banked on 2 probe seeds); the hold is still
open (median held-days unknown on this band — never measured, because
the lever's input was zero). The next arm on this axis is NOT another
donation variant: it is a GRIEF/SPEND lever (mourning-proof tending
or cheaper tend/tribute, per holdpantry's metric review §3) or a
trip-pricing arm that first names what a "failed" trip gathers
(backlog item 2) — not more pantry-stock measures.
