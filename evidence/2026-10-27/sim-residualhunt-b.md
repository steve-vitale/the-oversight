# sim-residualhunt-b — hunt the stockdoors leg-3 residuals (DIAG only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0530Z, axis
food-economy. Measurement only: zero src/js changes, no default flips,
no lever. Judged ONLY against evidence/2026-10-27/sim-residualhunt-b-prereg.md
(committed as f0c5c3a8e BEFORE any judged sweep).

## Verdict against the pre-registered bar: GO

GO iff (a) step 0 identifies the reproducing base with seed-9820 counts
quoted, AND (b) at least 2 of the 3 failing named family-seeds are
traced to named flows or boundary artifacts with per-record evidence,
OR the 9824 pair is traced to a single flow.

- (a) YES — see "Step 0" below: pre-c04d4e0cb game.js reproduces the
  committed stockdoors corpus seed-9820 payload byte-identically
  (excluding `ms`), counts 255/1249/4/163.
- (b) YES via the first half — 2 of 3 fully traced, the third
  decomposed with its dominant component exact (see "The hunt"):
  Muscadine 9824 (+1,800) and Burdock 9824 (+1,800) are each exactly
  their day-100 meal draws, unreflected in the closing snapshot.
- The single-flow half is NO: the 9824 pair is not one flow — it is
  two separate day-100 draw sets under the same closing-boundary
  artifact (same meal, same 20 units × 90 kcal shape, but two
  families' draws). The verdict does not need it: the ≥2 clause
  already holds.
- This GO is about the HUNT, not a re-judgment of stockdoors. The
  stockdoors NO-GO stands as judged against its prereg; what this run
  establishes is that its leg-3 failures are boundary artifacts, not
  missing doors — a metric-review input for the NEXT ledger run
  (see "Metric review"). Nothing here is re-scored, re-barred, or
  retroactively changed.

## Step 0 — the fork, resolved (before the prereg's judged sections)

Fresh seed 9820 with the vendored stockdoors instrument:

- On current worktree code: 240/1247/3/155 (inflows/mealdraw/deaths/
  driedEvents), stockdoor 656, direct 22.
- With src/js/game.js temporarily replaced by the e69842153 version
  (throwaway only: backed up outside the repo first, restored after,
  `git diff HEAD -- src/js/game.js` verified empty, NEVER committed):
  255/1249/4/163, stockdoor 640, direct 23 — and the full per-seed
  payload is BYTE-IDENTICAL to the committed stockdoors corpus
  seed-9820 JSON excluding `ms`.
- CONCLUSION: the reproducing base is the PRE-c04d4e0cb game.js
  (blob b2ba423afdfbdce8c98751ef544f10805b46cfa6). The coordinator's
  hypothesis is CONFIRMED: the stockdoors corpus is a valid
  measurement ON THAT BASE (the branch was rebased onto c04d4e0cb
  without re-running the proof). The judged sweep below ran on that
  pinned base (swap → sweep + proof → restore → verify clean).
  The pin was never committed; the worktree's game.js is back to its
  HEAD blob (bfa3631982cb2233fdc40ff54c4269bd2649c1fd) and
  `git diff HEAD -- src/js/game.js` is empty.

## Band and instrument

- Policy competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off), seeds 9820–9827
  REUSED as substrate (stated, no freshness claim), horizon 100d
  death-aware; all 8 seeds survived to day 100.
- Instrument vendored read-only from branch sim-stockdoors-b (tip
  b55b484ec) under residualhunt names (sweep/analyze/test/
  stockdoors-capture-residualhunt + the NEW trace-residualhunt-b.js);
  the stockdoors branch is untouched, no stockdoors-named file is
  committed here. The five reused capture files were verified
  byte-identical to the branch's copies before use.
- Corpus: evidence/2026-10-27/sim-residualhunt-b-corpus/ (8 files).
  Verified byte-identical (excluding `ms`) to the stockdoors corpus
  on all 8 seeds — the judged sweep reproduces the stockdoors
  measurement exactly, on the pinned base.
- Analyzer on the judged corpus reproduces the stockdoors legs
  exactly: leg 2 PASS (8/8, 8/8, 100.0% linked), leg 3 named 9/12 =
  75.0% (pooled 4,136 / 1,687,320 = 0.245%), leg 4 generic 7/8 =
  87.5% (pooled 4,412 / 2,225,865 = 0.198%), leg 5 dried −5,456 /
  774,536 = 0.70%. Legs 2–5 verdict NO-GO (leg 1 det-gate in the
  proof: byte-identical, see below). The analyzer's legs are the
  control, not this run's verdict — this run's verdict is the hunt
  GO above.

## The hunt — what the residuals are

The trace script (scripts/trace-residualhunt-b.js) reconstructs each
family ledger over the spoilDays snapshot series and separates
within-horizon divergence from POST-HORIZON flows (dated after the
last snapshot — counted in the ledger, never reflected in closing).
Two boundary artifacts explain everything judged and reported:

### Artifact 1 — the closing snapshot is taken before the day-100 meal draws

The last spoilDays snapshot (day 100) is taken during the day-100
policy run, before the day-100 meal draws are reflected. Any family
drawn on day 100 shows a residual exactly equal to those draws.
Controls confirm the rule: families with zero day-100 draws close at
0; families with day-100 draws show residuals equal to them
(9823 Burdock 270 = 270, 9820 Expedition haul 272 = 272).

- Muscadine 9824 (+1,800) — TRACED, exact. Day-100 draws, all
  spoilDay 101, all base channel: pantryDraw player 14u × 90 =
  1,260 + pantryDraw villager-home 6u × 90 = 540. Trace: persistent
  divergence at the FINAL transition (#100, days 99→100):
  actual 0 vs predicted −1,800. No other component.
- Burdock 9824 (+1,800) — TRACED, exact. Day-100 draws, all spoilDay
  101, all base channel: pantryDraw other 2u × 90 = 180 + other
  7u × 90 = 630 + player 11u × 90 = 990. Trace: the lag dance shows
  as a +6,030 step at transition #99 (day-99 draws 6,030 recorded
  but not yet reflected) and −4,230 at #100 (day-99 draws reflected
  as −6,030, day-100 draws −1,800 unreflected) — net final +1,800
  = the day-100 draws. The #99 flag is lag, not a second residual;
  the final transition's arithmetic is what names the 1,800.
- The pair is NOT one flow: two separate draw sets, one shared
  artifact (same day-100 meal, same 20 units × 90 kcal shape — the
  "same round number" was the meal's shape, not a shared flow).
  Together they would flip the stockdoors rate 9/12 → 11/12 once the
  boundary is accounted for — but that flip belongs to a future
  boundary-aware ledger, not to a re-score here.
- Lamb's Quarters 9825 (+1,130) — DECOMPOSED, dominant component
  exact, one small remainder open. Base channel +1,250 = exactly
  the day-100 base draws (player 7u × 50 = 350 + villager-home
  17u × 50 = 850 + villager-home 1u × 50 = 50, all spoilDay 101) —
  same closing-boundary artifact. Dried channel −120 = the day-100
  dried draw (player 17u × 40 = 680, spoilDay 101, unreflected,
  +680) netted against an −800 mid-run dried drop (see open item
  below). 1,250 − 120 = 1,130. Counted as traced-with-open-remainder
  per the prereg; the verdict does not hinge on it (the 9824 pair
  already satisfies clause (b)).

### Artifact 2 — post-horizon (day-101) sweeps

The run's horizon ends at day 100, but spoil sweeps dated day 101
are recorded and counted in the ledger while no snapshot exists to
reflect them. Within-horizon, these families close EXACTLY (trace
cumulative divergence 0); the entire residual is the day-101 sweep.

- Generic 9822 (+3,177) — TRACED, exact (reported, not judged).
  Within-horizon divergence 0; post-horizon net −3,177 = one spoil
  sweep day 101 removing 3,177 kcal of Foraged food. The generic
  family has no missing door on this seed — its residual is the
  horizon boundary.
- Fish catch 9825 (+2,016) — TRACED, exact (reported, not judged).
  Within-horizon divergence 0; post-horizon net −2,016 = two spoil
  sweeps day 101 (Fish catch (smoked) 1,536 + Fish catch 480).
  This RESOLVES the stockdoors evidence's worry: the direct
  recorder's portion rule is NOT over-explaining. The +2,016 is
  not double-counted direct draws — it is post-horizon sweeps the
  direct records never touched. The portion rule is exonerated on
  this seed.

### The unified boundary model (for the next run's prereg)

residual = (flows recorded after the closing snapshot) with sign:
day-100 meal draws and day-101 sweeps add to the residual; day-100
stockdoor pushes subtract from it. The stockdoors ledgers do not
have a missing-door problem on this band — they have a
closing-boundary problem: the closing snapshot is taken before the
final day's flows settle, and the ledger counts flows dated past it.
A future ledger arm should EITHER take the closing snapshot after
the final day's flows (or after the day-101 sweep), OR define the
ledger over flows dated ≤ the closing snapshot's day — and then
re-judge. Either fix is a next-run prereg decision, not a change
made here.

## Open items (documented, not fixed — DIAG only)

- LQ dried −800: between the day-81 and day-82 snapshots, dried
  Lamb's Quarters fell 3,840 → 3,040 with NO record in any of the
  six instruments (no dried draw, sweep, transform-out, direct
  record, or inflow on days 81–82; day-82 flows for OTHER families
  are recorded normally, so this is not a blanket snapshot gap).
  Candidates: an unwrapped direct path, or a snapshot-timing
  effect whose record sits on a non-adjacent day. Small (nets to
  −120 in the family residual after the +680 day-100 dried draw)
  but genuinely unrecorded — the one piece of the hunt that stays
  open. It does not block the GO (the 9824 pair + LQ base carry it).
- Muscadine 9825 (−864, passes at 0.39%): negative residual with
  zero day-100 draws — a different small component (not a
  closing-boundary case). Within bar, not judged, noted for the
  next ledger pass.
- Day-101 sweeps on other seeds (observed, not traced to residuals
  here): 9821 Foraged food 2,859; 9823 Foraged food 1,694 + Snared
  meat 278; 9825 Foraged food 1,200 + Foraged food (dried) 800;
  9826 Foraged food 1,200. These mix with day-100 flows in those
  families' residuals (e.g. 9821 generic 1,759 ≠ 2,859) and are NOT
  claimed as explanations there — only the two exact cases above
  (9822 generic, 9825 Fish) are claimed.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

The ledger's human story still reads right on the judged corpus.
First direct event (9820, day 7): an NPC pantry eat — "a person,
maybe 60s" — 1 unit of Rice, 200 kcal, spoilDay 366: a hungry
villager feeding themselves outside the meal, one unit at a time.
First stockSurplus night (9820, day 3): vDay 3, give 67, stored 200,
spoilDay 6 — the night meal's leftover becomes tomorrow's stock.
Smoke racks (9820, day 12): "Megan cooked for the haven — meals
stretched. Megan worked the smoke racks too — 3 batches preserved
(~1568 kcal, keeps for weeks)." The villagers act like people
around this pantry; the residuals are bookkeeping boundaries, not
behavioral mysteries. Nothing robotic, static, or repeated was
found in the sampled dialogue — the sense block is unchanged from
stockdoors, as determinism requires.

## Village assessment (plain words)

Eight villages, all surviving the full 100 days around pantries that
are now fully watched: 893 smoke-rack batches, 5,130 surplus
pushes, 690 direct takes, 799 spoil sweeps on this band (the
stockdoors census, reproduced exactly). Nobody starved: 38 deaths
across 8 seeds (9820: 4, 9821: 1, 9822: 4, 9823: 9, 9824: 10,
9825: 6, 9826: 2, 9827: 2), and sickness dominates (17), then
monster 5, ambush 4, a wound that wouldn't close 4, the arena 3,
contest 2, sunback 1, alien 1, dehydration 1. The villages that lost
the most people (9824, 9823) lost them to sickness and fights, not
to the pantry — the food story here is a ledger story, not a hunger
story. What was missing was never food: it was the last day's
bookkeeping. Blanks filled: (1) the stockdoors fork is root-caused
(pre-c04d4e0cb base, proven by byte-identical reproduction);
(2) all three failing named residuals are decomposed to the kcal;
(3) the generic 9822 residual and the Fish over-explanation are
closed exactly; (4) the direct recorder's portion rule is exonerated.
Documented, not fixed: no game-code change was made (DIAG only),
and the boundary fix itself belongs to the next run's prereg.

## Reachability verdict

On this band (competent-nofeast, seeds 9820–9827, 100d): waves 1–3
reached (wave 3 on 9822/9824/9825, wave 2 on the rest); waves 4–5
reached on 0/8 seeds. Regional, national, table, and wins: 0/8.
Rank stayed village on all 8 seeds. Arc II/III/IV, four-realm
formation, trap acquisition, counter discovery/kill, and young-link
succession survival are not recorded in this corpus and are not
estimated here. The scale wall stands on this band; this arm
measures a pantry ledger, it does not move the wall numbers.

## Wall numbers (this band, competent-nofeast, seeds 9820–9827)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach per
seed: 9820: 2, 9821: 2, 9822: 3, 9823: 2, 9824: 3, 9825: 3, 9826: 2,
9827: 2. Median survival: 100d (censored at the 100d horizon; all 8
seeds survived to day 100). Deaths: 38 total (causes above).

## Confirm band: NOT spent

This arm spends no confirm band: the hunt judges only the pilot
substrate. Seeds 9768–9779 remain as the blocked-landing note
records them (spent-but-unjudged 0049Z post-commit scratch for
stockdoors purposes — not this arm's to judge or spend).

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: (a) the reproducing base is identified with
  counts quoted (pre-c04d4e0cb, 255/1249/4/163, byte-identical
  payload); (b) 2 of 3 failing named family-seeds are traced exactly
  (the 9824 pair), the third decomposed with its dominant component
  exact. The single-flow half is honestly NO (two draw sets, one
  artifact class), and the verdict does not need it. No re-scoring
  was done (no dropping the LQ dried remainder, no switching to
  pooled-only residuals, no claiming the day-101 inventory as
  explanations where it does not match exactly).
- Bar lesson for the NEXT run: the stockdoors leg-3 rate bar (80%)
  was failed by boundary artifacts, not by missing doors. The next
  ledger arm should pre-register a boundary-aware ledger — closing
  snapshot after the final day's flows settle, or flows restricted
  to ≤ the closing snapshot's day — and re-judge the SAME
  family-seeds on the SAME base. If the boundary fix lands, the
  expected outcome is 11/12 (the 9824 pair flips) with LQ 9825 at
  −120 net (its −800 dried component still open) — the next
  prereg should say whether −120 counts as closing.
- Instrument lesson: the trace script's post-horizon section is now
  a required part of any ledger trace — a residual that is 100%
  post-horizon (generic 9822, Fish 9825) looks identical to a
  missing door in the analyzer alone. Future traces must separate
  within-horizon from post-horizon before claiming any door.
- The trace script's snapshot/flow day lag (~1 transition, cancels
  within the horizon on closing families) is a standing caveat for
  the next trace reader: single-transition steps are lag, not
  verdicts; only persistent steps and post-horizon flows name a
  residual.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever and no game code, so there is no before/after
  to panel. The det-gate (proof leg 1) is the before/after
  comparison: identical records with the instrument off vs on. The
  before/after that DOES exist is base before/after: current code
  (240/1247/3/155) vs pinned base (255/1249/4/163) on seed 9820 —
  the c04d4e0cb bystander-hold fix's footprint, reported as the
  fork's cause, not judged.

## Reproduction check (this run)

- Prereg committed BEFORE any judged sweep (f0c5c3a8e); judged sweep
  ran on the pinned base (swap → 8 seeds → proof → restore).
  Sweep: 8 files, all "written", exit 0; per-seed counts match the
  stockdoors census exactly (stockdoor 640/849/693/465/501/398/827/
  757; direct 23/115/128/237/73/97/9/8; dried 163/109/97/107/73/139/
  98/107). Corpus byte-identical to stockdoors (excluding `ms`) on
  all 8 seeds.
- Analyzer reproduces the stockdoors legs exactly (see above).
- Proof scripts/test-residualhunt-b.js GREEN on the pinned base
  (PINNED_GAMEJS_BLOB set): det-gate byte-identical (255/1249/4/163
  both runs, stockdoor 640 / direct 23 on-run, none off-run),
  det-gate reproduces corpus 9820 counts, independent named/generic/
  dried pooled residuals match the analyzer (4,136 / 1,687,320,
  9/12; 4,412 / 2,225,865, 7/8; −5,456 / 774,536), verdict follows
  from legs (NO-GO on legs 2–5 — the analyzer's legs, not this
  run's hunt verdict), stockdoor invariant holds, event-take
  retMismatch 0, no unknown direct paths, trajectory vs driedpath
  identical on all 8 seeds, control OLD-definition pooled 90.420% /
  dried 8.78% reproduced, hygiene clean (zero src/js modified apart
  from the pinned game.js allowance, zero sibling capture files
  modified, no modified tracked file outside this run's own files).
  No jest was run (nothing to test in jest — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- Proof-fix disclosure (same class as stockdoors'): the prereg's
  pinned-base allowance was implemented in only one of the proof's
  two hygiene checks — the first proof run failed ONLY on "no
  modified tracked file outside this run's own files" (game.js),
  while the src/js check already passed it. The second check was
  given the same allowance (same rule, same pin, commented in
  place), and the proof re-ran green. The prereg itself was NOT
  amended (its instrument section already stated the allowance).
  No verdict changes: the legs were already green; only hygiene
  was affected.
- Infrastructure notes (loud): the safe-commit index-clobber
  variant hit the prereg commit (all 6 files showed staged-deleted
  in the main index after a correct commit) — repaired per the
  documented recipe (`update-index --add --cacheinfo` from HEAD
  blobs), verified `git status` empty + `git diff HEAD` empty +
  hash-object matches, before proceeding. The judged sweep's
  wall-clock ran ~7 min for 8 seeds against ~15 s of sim compute —
  per-seed gaps of ~60 s between file writes, cause not established
  (writes themselves succeeded first try; no EPERM flap observed
  this run). Not a blocker, noted for the next run's pacing
  expectations. The worktree's game.js is restored to its HEAD blob
  and verified; the pinned-base backup remains in the goal
  hidden_files dir for the landing run's reference, NOT committed.
- No game-code change: zero src/js files committed. Files in this
  arm's commits: prereg commit f0c5c3a8e (prereg + 4 vendored
  scripts + trace script) and the evidence commit (evidence file +
  8 corpus files + the proof-fix test edit).

## Verdict (judged against the pre-registered bar, not re-scored): GO

Step 0 identifies the reproducing base (pre-c04d4e0cb, 255/1249/4/163,
byte-identical payload), and 2 of the 3 failing named family-seeds
are traced exactly to the closing-boundary artifact (the 9824 pair:
day-100 meal draws 1,800 each, unreflected in the closing snapshot),
with the third decomposed (LQ base 1,250 exact, dried −120 with an
−800 component documented open). The reported-not-judged items
close exactly too (generic 9822: day-101 sweep 3,177; Fish 9825:
day-101 sweeps 2,016 — the direct recorder exonerated). The
stockdoors leg-3 failures are boundary artifacts, not missing doors.
The next ledger run should pre-register the boundary-aware ledger
and re-judge; this run spends no confirm band.
