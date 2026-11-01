# sim-gate2hunt-b — DIAG: gate-2 hunt GO (band found on BARE H4; gate-2 agreement 11/11)

Run: oversight-flesh-out-loop-b, arm sim-gate2hunt-b, run
fleshout-loop-b-20261101T0119Z, axis food-economy (tracker
next blank 2 from the 20261031T2343Z closeout: "a gate-2
hunt on FRESH BARE-stack seed bands until a second refusal
seed appears"). Worktree sim-gate2hunt-b, branch
sim-gate2hunt-b. Base commit ee159dbc3 (worktree HEAD at
prereg writing time). DIAG ONLY (measurement): zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file or existing script. New files only,
plus the refusedband driver reused verbatim. This worker
does NOT push, bump, verify live, or merge into master;
the coordinator merges. Status to coordinator: committed
on branch, pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-gate2hunt-b-prereg.md, commit d2546bb77, written
BEFORE any judged leg) set GO as ALL of: (a) instrument
gate clean on every judged leg (corrected predicate);
(b) a found band — ONE fresh BARE cell with >= 5
travel-refused evenings on >= 2 seeds; (c) gate 2
measured on that band with agreement reported as an
exact fraction N/D over its block:creek evenings, with
D stated, AND D >= 1.

All three are met, on cell BARE 30d H4:

- (a) Instrument gate clean on all 40 judged legs
  (control + H1 + H2 + H3 + H4, corrected predicate):
  every leg errs 0, decisions == evenings, complete.
  No leg failed; no leg was skipped.
- (b) Band found: BARE 30d H4 carries 13
  travel-refused evenings on 2 seeds (17734: 11,
  17737: 2) — inside one single cell, no pooling.
- (c) Gate 2 measured on that band: D = 11
  block:creek evenings, N = 11 with bucket 'creek',
  agreement 11/11, 0 probe errors, 0 disagreements.
  The band's 2 non-creek refusals (fallen_tree) are
  reported in their own column and never enter D, per
  the prereg.

The hunt STOPPED at H4 per the stop rule: no further
cells run. H5 and H6 are listed as UNRUN, not as
zero-find. The second refusal seed the 2343Z closeout
asked for did not merely appear — it arrived twice over
in the hunt (17724, creek, H3; then the band itself),
and the band bar, not just a second seed, is what this
verdict rests on. No metric was re-scored mid-run: the
H1 and H3 single-seed leads were NOT pooled into a band
claim, and the H4 band stands on its own 8 legs.

## THE HUNT (judged) — 5 cells, 40 legs, 1,200 evenings

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
| CONTROL deed-seeking 30d H1 | 240 | 0 | — | 0 | — | pass |
| BARE 30d H1 | 240 | 7 | 17703 | 0 | — | pass |
| BARE 30d H2 | 240 | 0 | — | 0 | — | pass |
| BARE 30d H3 | 240 | 7 | 17724 | 7 | 7/7 | pass |
| BARE 30d H4 | 240 | 13 | 17734, 17737 | 11 | 11/11 | pass |
| TOTAL (judged) | 1200 | 27 | 4 seeds | 18 | 18/18 pooled* | — |
| UNRUN (stop rule) | — | — | H5, H6 | — | — | — |

* Pooled 18/18 is reported for hunt completeness ONLY
(H3 7/7 + H4 11/11, both single-cell measurements) and
is NEVER the band claim: the band claim is H4's own
11/11. H1's 7 fallen_tree refusals contribute 0 to any
D, as the prereg requires.

Pooled hunt texture (never a band): 27 refusals across
4 seeds; hop split block:creek 18, block:fallen_tree 9;
bucket split creek 18, other-refused 9; probeAgrees
true on all 27, probeError null on all 27, narrated
27/27 (the engine's block line in that evening's
dayLines). No other block type appears.

## THE BAND (H4, seed by seed)

Seed 17734 — 11 creek refusals, blocked tile (4,3),
evening camp wetland (5,3), haven distance 2, all
bucket 'creek', all narrated:
- Days 10-16: refused nightly at the wetland camp.
- Days 17-25: at haven ('completed') — she walks home
  in daytime around the creek, exactly as 17606 did on
  day 19.
- Days 26-29: refused nightly again at the same camp.
- Day 30: at haven ('completed') — daytime walking
  carries her home again.

Seed 17737 — 2 fallen_tree refusals, blocked tile
(4,3), evening camp forest_floor (4,2), haven distance
2, bucket 'other-refused', both narrated:
- Days 29-30: refused nightly; the 30-day window ends
  while she is still stranded (unresolved at horizon
  end — the window, not the story, cuts off).

The chokepoint finding: the blocked tile is (4,3) on
every refusal in H1, H3, and H4 — and on 17606's creek
refusals in the 2343Z hunt. Haven sits at (4,4); (4,3)
is the tile the single night hop must cross from the
northern and eastern camps. The blockage TYPE on that
tile varies by seed (creek on 17724/17734/17606,
fallen_tree on 17703/17737), but the funnel is the
same tile. A refusal band is therefore less rare than
2343Z suggested: the window is "ends the day within
distance 3 of haven, across the (4,3) chokepoint,
without a bridge/swimmer/axe" — and fresh bands thread
it regularly (3 of 4 hunt cells carried refusals; the
fourth, H2, carried none).

## THE LEADS (single-seed, NOT bands, reported as leads)

- H1 seed 17703: 7 fallen_tree refusals, days 4-10,
  camp forest_floor (2,3), blocked tile (4,3), probe
  agrees 7/7, narrated 7/7; home from day 11. A
  fallen_tree refusal RUN, mirroring 17606's creek run
  in shape (7 straight nights, then daytime walking
  home). It does not enter any gate-2 denominator.
- H3 seed 17724: 7 creek refusals, days 24-30, camp
  creek tile (5,6) itself, blocked tile (4,5), bucket
  'creek' 7/7, narrated 7/7; the window ends while she
  is still refused (unresolved at horizon end, like
  17737). This is the hunt's first second refusal seed
  in absolute terms — but it is a lead, not a band:
  H3 carries only one refusal seed, so it cannot carry
  the band bar, and it was NOT pooled with H4.

## Instrument gate + the carried fix (proved, not assumed)

Corrected predicate (prereg): complete = days-complete
OR an evening row with gameOver true OR a recorded
harness endReason other than 'survived'. Proof, run
BEFORE any judged leg:

- Pure test scripts/test-gate2hunt-b.js: 14/14 —
  village-lost and over-other short legs pass, survived
  short legs still fail, error and count-mismatch legs
  still fail, band-bar cases pass/fail correctly.
- Real-corpus proof on the 17518 leg (the leg that
  motivated the fix): the new analyzer flags it
  complete with reason 'endReason:village-lost'
  (35/35, errs 0, day recorded); the old analyzer on
  the same corpus flags the cell gatePass false with
  gateFailures [17518]; refusal counts are 0 either
  way, on the cell and on the leg.
- All 40 judged legs in this hunt pass the corrected
  gate; no judged leg needed the new disjunct (all 40
  completed their 30 days — days-complete), so the fix
  changes no judged number here. It stands proved and
  waiting for the next sleep-step ending, not applied
  retroactively to any judged count.

## SENSE TEST (law) — band read, as a person would experience it

Seed 17734, day 10 (first refusal of the band):
she forages out from haven through grove and creek to
the wetland (5,3), works a patch for 2× Wild Black
Cherry (140 kcal), and the evening ends with the creek
line TWICE — "The creek runs fast here — no crossing
without a bridge or a swim." — the same double-line
texture 17606 showed on day 4: a daytime trip-home
attempt plus the night hop, both honestly refused at
the same creek, with no distinction between the
attempts in the transcript. Nothing contradicts the
census: no line claims she crossed, no line claims she
chose to camp, and the following days show her still
at the wetland, still refused, until daytime walking
carries her home on day 17 — then the whole shape
repeats on days 26-29. The refusal reads as a person
turned back from home, not a decision to stay: she
never chooses the wetland; the hop refuses her.

Seed 17737, day 29 (the band's second seed):
she ranges far — grove, meadow, trail edge — sees
other villages' smoke on the horizon, comes back
through the forest floor to (4,2), and the evening
ends with "A fallen tree blocks the path." twice amid
donations and broadcast lines. The refusal is honest
but buried: the block line appears twice with no
distinction, surrounded by haven business (donations,
audience numbers) that reads as if she were already
home. A reader who only read the lines could mistake
this for a haven evening — the census (position (4,2),
outcome travel-refused) is what keeps it honest. That
burial is texture, not a census contradiction, and it
is the same class of note as the double creek line:
the refusal is narrated, but the narration does not
say "you are spending the night out here because the
way home is blocked."

Texture notes carried, not hidden: the double block
line on every first-refusal evening (daytime attempt +
night hop, undistinguished); haven-business lines
(donations, broadcasts, gossip "by the fire") firing
on stranded evenings. Neither contradicts any count —
positions, outcomes, and day transcripts agree.

## Narration note (counted, not designed)

Refused evenings narrated anywhere: 27/27 (every
refusal's dayLines contain the engine's block line for
its blockType — creek line for creek refusals, fallen
tree line for fallen_tree refusals). The wording
questions — whether the double line should be
deduplicated, and whether a stranded evening should
say it is spending the night out — belong to the
design owner. Nothing about narration is landed here.

## Reachability verdict

Travel-refused BANDS are reachable on current master:
H4 is a band by the prereg's own bar (13 refusals, 2
seeds, one cell), and gate 2 is now MEASURED as a band
measurement: 11/11 probe agreement over its
block:creek evenings, 0 errors, 0 disagreements. The
2343Z "untested as a band measurement" status is
superseded by this hunt — by a fresh-band measurement,
not by re-reading the single-seed 37/37. Alongside it
stand two separate fractions, neither folded into the
band claim: 2343Z's single-seed 37/37, and this hunt's
H3 lead cell at 7/7.

## Village assessment, in plain words

Picture two villagers on the same seed band, both
stopped by the same gap in the ground north of home.
One camps in the wetland two tiles out and spends a
week being told no by the creek, walks home in
daylight when the week breaks, goes out again, and is
told no for four more nights before walking home again
on the last day. The other ranges far all month, comes
home every night without trouble, and only on the
second-to-last night finds a fallen tree across her
short way home — and is still out there when the
month ends. The village's night step knows exactly one
jump, straight home; the daytime walk knows the path
around. That is why the refusals come in runs and why
they end the same way every time: not by crossing, but
by waiting for daylight. What this hunt adds to the
2343Z picture is company: 17606 is no longer the only
villager who lives this story. Four fresh seeds refuse,
two of them in the same cell, and the probe agrees
with the engine every single time — 27 refusals, 27
agreements, 0 errors. The creek between a villager and
home is real, it is narrated, and the instrument that
names it is now proven against the sleep-step ending
that once slipped past it.

## Wall numbers

NOT MEASURED BY THIS PRE-SEAT CENSUS — reported, never
fabricated. As LAST MEASURED (Loop A lane): full seat 0
/ wave 5 reached 0. This census does not re-measure the
wall: it measures refusal evenings, not wave
progression, national reach, or the table. Observed
survival on judged legs: 40 of 40 legs survived their
30-day window (no village-lost or over-other endings
in this hunt). National 0, table 0, wins 0 in this
census are structural (a pre-seat refusal census cannot
reach them), not wall measurements.

## Blanks filled or documented

- FILLED (this arm, measured): GATE 2 AS A BAND
  MEASUREMENT — H4 band, 11/11 agreement, D = 11.
  The 2343Z held item ("gate-2 test on a travel-refused
  band") is closed by this hunt's own numbers.
- FILLED (this arm, proved): the 17518 sleep-step
  instrument gap — corrected predicate in a new
  analyzer, proved on the real leg (flags true, day
  recorded) and by 14/14 pure checks, with refusal
  counts unchanged. No existing script was edited.
- DOCUMENTED (this arm, measured): the (4,3)
  chokepoint — every refusal in H1/H3/H4 (and 17606's)
  is blocked at tile (4,3); only the blockage type
  varies by seed. Refusal bands are not rare on fresh
  BARE bands (3 of 4 hunt cells carried refusals).
- DOCUMENTED (this arm, measured): single-seed leads
  17703 (fallen_tree run, 7 nights) and 17724 (creek
  run, 7 nights, unresolved at horizon) — reported as
  leads, never pooled into the band claim.
- DOCUMENTED (this arm, measured): two refusal runs
  end unresolved at the horizon (17724, 17737) — a
  30-day window cuts stranded stories off mid-run;
  a longer window on a refusal band would show whether
  they resolve by daytime walking, as 17734's and
  17606's did.
- NOT re-scoped (this arm, stated): the H4 band meets
  the prereg bar as written (>= 5 on >= 2 seeds in one
  cell); no threshold was added to agreement (11/11 is
  reported, not thresholded), and no cross-cell pooling
  was used.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bar (instrument clean + band >= 5 on >= 2
  seeds + gate-2 fraction with D >= 1): MET, on all
  three legs — (a) 40/40 legs gate-clean, (b) H4 13 on
  2 seeds, (c) 11/11 with D = 11. No metric was
  re-scored mid-run: H1/H3 leads were not pooled, H5/H6
  were not run after the stop rule fired, and the
  pooled 18/18 is labeled pooled, never a band.
- The corrected gate predicate performed exactly as
  designed: it changed no judged number in this hunt
  (all legs days-complete) while provably fixing the
  17518 case. It should stay the gate for the next
  hunt; the old predicate is now a known-undercount on
  sleep-step endings and should not be reused as a
  judge.
- Agreement threshold question (carried from prereg):
  gate-2 agreement was reported, not thresholded, per
  the prereg. The measured band agreement is 11/11;
  whether a future band GO should ALSO require an
  agreement value (e.g. >= 80%) is now a question with
  two concrete priors (11/11 band, 37/37 single-seed) —
  still a question for that run's prereg, not decided
  here.
- Whether 'travel-arrived-combat' should count as a
  refusal: NO — carried; none appeared in the hunt
  cells' refusal columns (0 in all 1,200 evenings;
  'walk-interrupted-combat' on H1 and 'blocked-combat'
  elsewhere are different outcomes, not evening
  refusals).
- Whether bucket and tile criteria should ever be merged:
  NO — carried from refusedband; this arm keeps refusal
  counts, bucket counts, and tile counts separate
  throughout (the (4,3) chokepoint note is a tile
  observation about refusals, not a merged criterion).
- Whether the band bar should require a minimum per
  seed (17737 contributes only 2 of H4's 13): open for
  the NEXT run's prereg. This run's bar, as written,
  requires only total >= 5 and seeds >= 2, and H4 meets
  it as written; a per-seed floor would be a new bar,
  not a reinterpretation of this one.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard and
observer contract. It cannot express the nighttravel /
creekremedy-diag stacks, a 30-day per-evening refusal
census, or a census with no variant — the same
declaration refusedband made. The comparison here is a
census across cells on identical seeds through the
census analyzers, never labeled a panel comparison.
No panel result is fabricated; the panel tool was not
invoked on this corpus. No lever comparison arose (DIAG
only).

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-gate2hunt-b-census-bare-h4.json --metrics
national,table,wins,exiled` was NOT run as a wall
signal, for the same reason refusedband investigated
and dismissed it: this census carries no
national/table/wins/exiled fields (keys: corpusDir,
policy, horizonDays, legs, seeds, eveningsJudged,
outcomeTotals, totalRefusals, ...) — the check would
ingest a census file where the baseline expects
per-seed sweep rows, so 0 would mean "field absent",
not "wall moved". No genuine LOUD signal is claimed or
hidden; the baseline is NOT rolled. (The coordinator's
own telemetry step, if it runs the check, should expect
the same missing-field artifact.)

## Infrastructure findings (for the coordinator — NOT game findings)

1. Index clobber hit on BOTH safe-commit.sh commits
   this run (prereg d2546bb77, instruments 4f27f0c9):
   each commit was correct (stat + blob verified) while
   the main index showed the committed files as staged
   deletions. Repaired both times via `git
   update-index --add --cacheinfo` from HEAD blobs,
   verified with `git status --short` empty + `git diff
   HEAD` empty + hash-object match before proceeding.
   The coordinator should verify the same way after
   the final commit.
2. A worktree-heartbeat.sh invocation hung (registry
   lock contention with the sibling arm, by appearance)
   and was killed; it blocked nothing — judged legs ran
   after it, and the heartbeat is coordinator-owned.
   Flagged here so the hang is not mistaken for a run
   failure.
3. No EPERM flap observed on judged transports: all
   stdout runs completed first-try, all splitter writes
   landed first-try, all corpora split from evidence/
   jsonl (never /tmp), no .jsonl leftovers at evidence
   time.
4. Diff guard at evidence time: `git diff --name-only
   ee159dbc3 -- src/ scripts/ scripts/policies/` lists
   ONLY scripts/analyze-gate2hunt-b.js and
   scripts/test-gate2hunt-b.js — no game code, no
   existing script, no policy file moved under
   measurement (to be re-verified by the coordinator at
   merge).
5. Leg timing (for the next hunt's planning): 30d cells
   ~55-100s for 8 legs. Fresh BARE bands are cheap;
   the H5/H6 cells remain unrun and fresh for any
   follow-up that wants them.

## Proof

scripts/test-gate2hunt-b.js: pure 14/14 (corrected-gate
cases incl. village-lost / over-other / survived-short
/ errs / count-mismatch, band-bar cases incl.
single-seed non-band). Real-corpus proof: new analyzer
on the old P1 60d F2 corpus flags 17518 complete
('endReason:village-lost'), cell gatePass true,
refusals 0 — old analyzer on the same corpus flags
gatePass false, gateFailures [17518], refusals 0.
Control cell: 240/240 'policy-no-record', 0 refusals,
as predicted. Corpus checks: 40/40 judged legs pass
the corrected instrument gate; H4 band 13 refusals on
2 seeds with gate-2 11/11; narration 27/27.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-11-01/sim-gate2hunt-b-prereg.md
  (commit d2546bb77)
- Evidence (this file): evidence/2026-11-01/
  sim-gate2hunt-b.md
- Instruments: scripts/analyze-gate2hunt-b.js,
  scripts/test-gate2hunt-b.js (instruments commit
  4f27f0c9); driver scripts/refusedband-trace-b.js
  reused verbatim from the base (no edits — verified
  by the diff guard)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-11-01/sim-gate2hunt-b-corpus-control,
  sim-gate2hunt-b-corpus-bare-h1,
  sim-gate2hunt-b-corpus-bare-h2,
  sim-gate2hunt-b-corpus-bare-h3,
  sim-gate2hunt-b-corpus-bare-h4
- Censuses (analyzer output, one per corpus):
  evidence/2026-11-01/sim-gate2hunt-b-census-control.json,
  sim-gate2hunt-b-census-bare-h1.json,
  sim-gate2hunt-b-census-bare-h2.json,
  sim-gate2hunt-b-census-bare-h3.json,
  sim-gate2hunt-b-census-bare-h4.json
- No compare .md exists (no paired lever comparison —
  this is a DIAG census, never labeled a panel
  comparison).
