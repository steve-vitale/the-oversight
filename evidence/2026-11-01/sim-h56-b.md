# sim-h56-b — DIAG: H5/H6 refusal census HELD-by-exhaustion (both cells judged, 0 refusals, instrument clean)

Run: oversight-flesh-out-loop-b, arm sim-h56-b, run
fleshout-loop-b-20261101T0730Z, axis food-economy
(tracker next blank 6 from the 2026-11-01 0630Z Loop B
closeout, carried UNRUN through many runs: run the
gate2hunt H5 and H6 cells and close that carried
blank). Worktree sim-h56-b, branch sim-h56-b. Base
commit 0f5822d7a (worktree HEAD at prereg writing
time, after the brief's required fast-forward rebase
onto master; the rebase succeeded with no commits of
this arm's own to replay). DIAG ONLY (measurement):
zero src/js changes, zero policy-default flips, zero
edits to any existing policy file or existing script.
New files only, plus the gate2hunt driver and analyzer
reused verbatim. This worker does NOT push, bump,
verify live, or merge into master; the coordinator
merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Verdict: HELD-by-exhaustion — judged exactly against the prereg

The binding prereg (evidence/2026-11-01/
sim-h56-b-prereg.md, commit eef03125a, written
BEFORE any judged leg) sets the verdict rule the
brief states explicitly: if no cell meets the band
bar, the verdict is HELD-by-exhaustion for H5/H6
with the full searched space stated — NOT a
zero-find for anything else, NOT killed. The
coverage bars were met in full:

- (a) Instrument gate clean on all 16 judged legs
  (H5 + H6, corrected predicate): every leg errs 0,
  decisions == evenings, complete. No leg failed; no
  leg was skipped.
- (b) BOTH cells H5 and H6 judged and reported with
  per-cell tables below (evenings, refusals, refusal
  seeds, days, hopReturnKind split, gate-2 N/D if
  D >= 1 — D = 0 in both cells, so no gate-2 fraction
  arises here).
- Band bar (>= 5 travel-refused evenings on >= 2
  seeds inside one single cell): met in NEITHER cell
  (H5: 0 refusals; H6: 0 refusals). No band is
  reported, and none is implied: gate 2 as a band
  measurement stays closed by gate2hunt (H4, 11/11),
  untouched by this arm.

No metric was re-scored mid-run: the two cells were
run in order with no stop rule (this arm runs both
whatever H5 shows, per the prereg), and the H5/H6
refusal counts were never pooled into a band claim
(the pooled total is 0 in any case).

## THE CENSUS (judged) — 2 cells, 16 legs, 474 evenings

Travel-refused evening = eveningOutcome ===
'travel-refused' (nighttravel.js nightStep: haven offered
AND one honest Game.travelTo hop attempted AND post-hop
position not haven). 'out-of-reach' is NO attempt and
never counts. Gate-2 agreement = N/D where D = refusals
with hopReturnKind 'block:creek' and N = those with
bucket 'creek' (creekremedy-diag classifyRefusedEvening +
bucketOf, source ctx._creekremedyLast on BARE).

Per-cell table (ev = evenings judged; ref = travel-refused
evenings; refSeeds = seeds carrying refusals; D =
block:creek denominator; gate2 = N/D):

| cell (stack x band x horizon) | ev | ref | refSeeds | D | gate2 | gate |
|---|---|---|---|---|---|---|
| BARE 30d H5 (17741–17748) | 240 | 0 | — | 0 | — | pass |
| BARE 30d H6 (17751–17758) | 234 | 0 | — | 0 | — | pass |
| TOTAL (judged) | 474 | 0 | — | 0 | — | — |

H6's 234 (not 240) evenings are the death-aware
horizon working as designed: seed 17753 lost its
village on day 24 (see village assessment), so that
leg contributes 24 evenings, not 30. Its gate row
passes via the corrected predicate's endReason
disjunct ('endReason:village-lost') — the first
judged leg in this hunt family to actually exercise
that disjunct (all 40 gate2hunt judged legs were
days-complete). The old predicate would have flagged
this leg incomplete; the corrected one flags it
complete with its day recorded, and refusal counts
are 0 either way.

Outcome texture (never a band, reported for
completeness): H5 — already-inside 36, completed 202,
blocked-combat 2 (17747 day 9, 17748 day 26);
H6 — already-inside 33, completed 195, out-of-reach 6
(all on 17758, days 6–11). No 'travel-arrived-combat',
'travel-died', 'blocked-tent', detour, or
'policy-no-record' evenings in either cell. Hop split
and bucket split are empty in both cells (no
refusals to split); narrated refusals 0/0, vacuously.

## What H5/H6 add to the hunt picture

Gate2hunt's fresh-band hit rate was 3 of 4 cells
carrying refusals (H1, H3, H4) with the (4,3)
chokepoint on every refusal. H5 and H6 carry none —
the first two consecutive blank cells in the BARE
hunt series. That does not revise the chokepoint
finding (it was a statement about refusals when they
occur, and none occur here), and it does not make
refusal bands rare in general: across H1–H6, 4 of 6
cells carried refusals and 1 of 6 carried a band.
What H5/H6 close is exactly the carried blank: the
H-series search grid declared in the gate2hunt prereg
is now fully run, H1 through H6, with no cell left
listed as UNRUN. Any future hunt starts from a new
grid, not from these leftovers.

## Instrument gate (proved, not assumed)

Corrected predicate (prereg): complete = days-complete
OR an evening row with gameOver true OR a recorded
harness endReason other than 'survived'. Proof, run
BEFORE any judged leg:

- Pure test scripts/test-gate2hunt-b.js (reused,
  verbatim, not duplicated): 14/14 on this base —
  village-lost and over-other short legs pass, survived
  short legs still fail, error and count-mismatch legs
  still fail, band-bar cases pass/fail correctly.
- All 16 judged legs pass the corrected gate; 15 by
  days-complete, 1 (H6 17753) by endReason:village-lost.
  No judged leg needed the gameOver disjunct.
- Driver and analyzer reused verbatim: `git status`
  at evidence time shows ONLY new evidence files —
  no modification to scripts/refusedband-trace-b.js,
  scripts/analyze-gate2hunt-b.js, any policy file, or
  any src/js file (diff guard below).

## SENSE TEST (law) — no refusal evenings to read, so the absence is stated and samples are read

No refusal evening exists in either cell, so there is
no refusal transcript to judge. Per the prereg, the
sense section states that plainly and reads a sample
of non-refusal evenings on the judged seeds instead.
Three reads, each honest in the same way the refusal
census requires:

1. H6 17758, days 6–11, 'out-of-reach' (the only
   out-of-reach evenings in the census): she is at
   (8,0)/(8,8), haven distance 5 — beyond the single
   night hop's reach, so no hop is offered and none
   is attempted. The transcript never claims she tried
   to go home: day 6 she works a grove patch to
   picked-clean, day 7 she meets Anna (Polish, no
   shared language, name learned by gesture), day 8
   the Anaconda Empress follows her and the System
   grants Green Thumb, day 10 the Codex records a
   Hummice counter. This reads as a person ranging
   far and living out there for a stretch — the
   out-of-reach label is the census's honest name for
   "too far to hop", not a hidden refusal, and the
   transcript agrees with the census (position far,
   outcome no-attempt).
2. H6 17753, the village-lost leg: the deaths log
   tells the story the final evenings only hint at —
   a villager killed by a monster day 9, the Anaconda
   Empress killed in combat day 10, the vessel killed
   by the wild day 10, then starvation days 14, 15,
   15, sickness day 19, starvation days 22 and 24.
   The last three evenings are all 'completed' at
   haven (4,7): "Walking 5 squares (10 kcal)… You step
   into the Haven hall." The village dies out while
   the vessel is home eating Muscadine Grapes (630
   kcal, day 24) — a starvation cascade, not a
   travel story, and the census ending (village-lost
   day 24, 24 evenings) matches the deaths, not the
   calm final lines. Nothing here contradicts any
   count; the calm is the vessel's evening, the loss
   is the village's.
3. H5 samples: 17744 day 3 'completed' ("Walking 5
   squares (10 kcal)… You step into the Haven hall.")
   and day 1 'already-inside' (eating 1400 kcal of
   dried meat and trail mix by the fire, "Your chewing
   echoes off the trees. Something out there heard.")
   read as ordinary haven evenings — the villager
   home, fed, and narrated as home. The two
   'blocked-combat' evenings (17747 day 9, a Murkcap
   counter learned by the fire; 17748 day 26, Bengali
   words being caught) are combat-blocked nights, not
   refusals, and their transcripts show haven business
   continuing around a fight — a different outcome
   column, correctly kept separate from refusals.

Judgment: with zero refusals, there is no refusal
artifact to suspect and no refusal narration to fault.
The non-refusal transcripts read as people doing
recognizable things (ranging far, meeting strangers,
learning counters, starving when the food runs out),
and the census columns (out-of-reach vs completed vs
already-inside vs blocked-combat) track what the
lines actually show.

## Narration note (counted, not designed)

Refused evenings narrated anywhere: 0/0 (no refusals
exist to narrate). The gate2hunt narration notes
(double block line, haven business on stranded
evenings) are untouched by this arm — nothing here
confirms or revises them, because no stranded evening
occurs in H5/H6.

## Reachability verdict

Nothing new about reachability is claimed: this arm
measures refusal evenings, not wave progression,
national reach, or the table. Travel-refused BANDS
remain reachable as gate2hunt proved (H4); H5/H6
simply contain no band. No content is newly declared
reachable or unreachable by these two blank cells.

## Village assessment, in plain words

Picture two quiet months. In the first (H5), all eight
villages survive the month: people stay close enough
to home that the night hop always finds them, or are
already inside when evening comes — 36 evenings
already home, 202 evenings walked home, two nights
interrupted by combat. Nobody spends a night turned
back at a creek or a fallen tree. In the second (H6),
seven villages do the same, one ranges to the far
corner of the map and spends six nights too far out
for the hop to even be offered (she meets a stranger,
learns a monster's weakness, gains abilities — the
far ground is alive, just far), and one village
starves: a monster kill and a wild death in the first
ten days, then the food runs out and people die one
by one until the village is gone on day 24, the last
villager home eating grapes. The refusal story is
absent from both months — and that absence is the
finding: the (4,3) chokepoint does not fire on every
fresh band, and two whole bands can pass without a
single villager being turned back at night. The hunt
grid H1–H6 is now complete: four cells with refusals,
one band, two blanks.

## Wall numbers

NOT MEASURED BY THIS PRE-SEAT CENSUS — reported, never
fabricated. As LAST MEASURED (Loop A lane): full seat 0
/ wave 5 reached 0. This census does not re-measure the
wall: it measures refusal evenings, not wave
progression, national reach, or the table. Observed
survival on judged legs: 15 of 16 legs survived their
30-day window; 1 village-lost (H6 17753, day 24,
starvation cascade). National 0, table 0, wins 0 in
this census are structural (a pre-seat refusal census
cannot reach them), not wall measurements.

## Blanks filled or documented

- FILLED (this arm, measured): the carried UNRUN
  blank — H5 and H6 are now judged cells with full
  per-cell tables, not UNRUN listings. The H-series
  grid (H1–H6) declared in the gate2hunt prereg is
  fully run.
- DOCUMENTED (this arm, measured): two consecutive
  blank BARE cells (H5 0 refusals / 240 evenings, H6
  0 refusals / 234 evenings) — the chokepoint does
  not fire on every fresh band; hunt hit rate across
  H1–H6 is 4 of 6 cells with refusals, 1 of 6 with a
  band.
- DOCUMENTED (this arm, proved in use): the corrected
  gate predicate's endReason disjunct exercised on a
  real judged leg for the first time in this hunt
  family (H6 17753, village-lost, 24/24, errs 0) —
  the 17518 fix is no longer only a proof-corpus
  property.
- DOCUMENTED (this arm, measured): H6 17758's six
  out-of-reach evenings as the far-range counterpart
  to refusals — too far for a hop to be offered at
  all, with a coherent ranging transcript, correctly
  never counted as refusals.
- NOT re-scoped (this arm, stated): no threshold was
  added to agreement (no D arises here), no cross-cell
  pooling was used, and gate 2's closed status from
  gate2hunt is neither re-claimed nor disturbed.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg verdict rule (brief-explicit): no cell meets
  the band bar, so the verdict is HELD-by-exhaustion
  for H5/H6 — even though coverage bars (a) and (b)
  were met in full. The prereg's GO wording (instrument
  clean + both cells judged) describes the measurement
  succeeding; the brief's sentence governs the
  verdict name when no band appears. This distinction
  is stated here so the next run does not misread a
  clean, complete, bandless census as a GO: the
  measurement succeeded, the search space is
  exhausted, and no band was found. No metric was
  re-scored to reach this: the band bar was applied
  exactly as written (>= 5 on >= 2 seeds in one cell)
  to both cells, and both failed it at 0.
- The corrected gate predicate performed exactly as
  designed on a live case (17753): it accepted an
  engine-recorded village-lost ending while still
  requiring errs 0 and decisions == evenings. It
  should stay the gate for the next hunt.
- Agreement threshold question (carried): moot here
  (D = 0 in both cells); gate2hunt's 11/11 band
  fraction stands as the closed measurement.
- Whether 'travel-arrived-combat' should count as a
  refusal: NO — carried; none appeared (0 in all 474
  evenings; the 2 'blocked-combat' evenings are a
  different outcome, not evening refusals).
- Whether bucket and tile criteria should ever be merged:
  NO — carried; with zero refusals there is nothing
  to merge, and the columns stay separate.
- Whether a future hunt should require a minimum per
  seed on top of the band bar: open for the NEXT
  run's prereg (gate2hunt's carried question). It is
  moot for H5/H6, where every seed contributes 0.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard and
observer contract. It cannot express the nighttravel /
creekremedy-diag stacks, a 30-day per-evening refusal
census, or a census with no variant — the same
declaration gate2hunt made. The comparison here is a
census across cells on identical seeds through the
census analyzers, never labeled a panel comparison.
No panel result is fabricated; the panel tool was not
invoked on this corpus. No lever comparison arose (DIAG
only). Matched per-cell tables, not a panel.

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-h56-b-census-bare-h5.json --metrics
national,table,wins,exiled` was run and produced LOUD
lines (national/table/wins "disappeared", baseline
12/16/16 -> current 0) — the same missing-field
artifact gate2hunt investigated and dismissed: this
census carries no national/table/wins/exiled fields
(keys: corpusDir, policy, horizonDays, legs, seeds,
eveningsJudged, outcomeTotals, totalRefusals, ...),
so 0 means "field absent", not "wall moved". No
genuine LOUD signal is claimed or hidden; the baseline
is NOT rolled. (The coordinator's own telemetry step,
if it runs the check, should expect the same
missing-field artifact.)

## Infrastructure findings (for the coordinator — NOT game findings)

1. Index clobber hit on the prereg safe-commit.sh
   commit (eef03125a): the commit was correct (stat +
   blob verified) while the main index showed the
   committed file as a staged deletion plus untracked.
   Repaired via `git update-index --add --cacheinfo`
   from the HEAD blob, verified with `git status
   --short` empty + `git diff HEAD` empty +
   hash-object match before proceeding. The
   coordinator should verify the same way after the
   final commit.
2. No EPERM flap observed on judged transports: both
   stdout runs completed first-try (~90–97s per 8-leg
   cell), both splitter writes landed first-try, both
   corpora split from evidence/ jsonl (never /tmp),
   no .jsonl leftovers at evidence time.
3. Diff guard at evidence time: `git status --short`
   lists ONLY new evidence files (prereg already
   committed; corpora, censuses, stderr logs,
   evidence file) — no src/js, no scripts/, no
   policies/ file moved under measurement (to be
   re-verified by the coordinator at merge).
4. Leg timing (for the next hunt's planning): 30d
   BARE cells ~90–97s for 8 legs on this base.

## Proof

scripts/test-gate2hunt-b.js (reused verbatim): pure
14/14 on this base before any judged leg (corrected-gate
cases incl. village-lost / over-other / survived-short
/ errs / count-mismatch, band-bar cases incl.
single-seed non-band). No new analyzer, so no new
proof test was written; the existing score is cited,
not duplicated. Corpus checks: 16/16 judged legs pass
the corrected instrument gate (15 days-complete, 1
endReason:village-lost); H5 0 refusals / 240 evenings;
H6 0 refusals / 234 evenings; narration 0/0
vacuously; H6 17758 out-of-reach 6, H5 blocked-combat
2, all in their own outcome columns.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-11-01/sim-h56-b-prereg.md
  (commit eef03125a)
- Evidence (this file): evidence/2026-11-01/
  sim-h56-b.md
- Instruments reused verbatim from the base (no
  edits): scripts/refusedband-trace-b.js,
  scripts/analyze-gate2hunt-b.js, plus the existing
  proof scripts/test-gate2hunt-b.js (14/14)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-11-01/sim-h56-b-corpus-bare-h5,
  sim-h56-b-corpus-bare-h6
- Censuses (analyzer output, one per corpus):
  evidence/2026-11-01/sim-h56-b-census-bare-h5.json,
  sim-h56-b-census-bare-h6.json
- No compare .md exists (no paired lever comparison —
  this is a DIAG census, never labeled a panel
  comparison).
