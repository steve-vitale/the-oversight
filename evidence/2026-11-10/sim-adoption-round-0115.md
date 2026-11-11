# Adoption round — counter-close confirm GO + preservation first numbers GO

Run: fleshout-20261111T0115Z (Loop A). Axis: ADOPTION of the dead 2215Z run
(scale-onramp counter-close confirm + coverage Tier 2 #2 preservation).
Master at claim: e4361b886. Master at closeout: f156c8564.
STALE-LOCK RECOVERY of dead 2215Z run (lock 2h53m old; trees hb 60–67 min
stale; no sim processes for its arms; knowfood-a already landed on master
6d7212cda). Loop B live on 0025Z claim (garden-b + fightplay-b, sims
running) — NOT touched. Pre-flight: main tree clean, disk 36%, reap ran
(11/16 active, no removals), write health verified (O_EXCL OK /tmp +
workspace + repo, git ref write OK — the 21:35Z EPERM flap has cleared).

## Pre-registration

Primary metrics, GO thresholds, horizons, seeds, and policies are the two
arms' own preregs, judged strictly and not re-scored:
- evidence/2026-11-10/sim-counterconfirm-a-prereg.md (confirm of the
  counterclose-a pilot GO; 16 seeds 150217–150232, 150d, competent,
  COMPETENT_TALK=1 + RAISER_SEAT=1 harness on both legs, armed +
  COUNTER_ANSWER=1; primary (a) armed second links > control AND (b)
  zero armed seeds stalled; per-day cost bar).
- evidence/2026-11-10/sim-preserve-a-prereg.md (measurement; GO = instrument
  validity + complete first-numbers capture; 8 seeds 180209–180216, 150d,
  competent, control + neutral legs).

## Arm 1 — sim-counterconfirm-a: GO (merged c5ab93e62)

Corpus complete as stranded: 32/32 cells parse, non-empty,
instrumentErrors 0; no cells re-run, no valid file overwritten.
Analyzer re-run from the committed script. Verdict judged strictly:

- Harness reproduction FIRST: control leg shows the counter-stall class
  (4 fresh counters, 105 blocked re-knocks, 513 pending-counter days) —
  confirm NOT void. Pilot gate on first 8 seeds passes (8/8 vs 5/8).
- Primary (a): second links armed 16/16 vs control 13/16 — PASS. The
  three flipped seeds are exactly counter-stalled seeds (150220, 150221,
  150223).
- Primary (b): zero armed seeds stalled at unanswered counters
  (control 4: 150219, 150220, 150221, 150223) — PASS.
- Cost bar PASSES (per-day form): deaths/100 village-days 78.06 vs
  75.05 (cap 82.55); starvation 2 vs 2; arm-only starvation 0; median
  survival 140d vs 143.5d (floor 114.8d).
- Mechanism: 4 sweeten-formed answers, 6,000 kcal total, pantries
  16,971–34,030 kcal. The walk path did not fire on this band (proven by
  the pilot only).
- Balanced panel (§15): before/after on competent, same 16 seeds,
  COUNTER_ANSWER declared as the intervention flag — decision
  review_required (deaths/100d +2.62, player deaths +1/run,
  first-bearer-60 −0.1875; no regression_signal; win/national/table all
  0→0). Per §15 the panel is evidence, not the judge — it does not
  override the pre-registered GO. Compare attached:
  evidence/2026-11-10/counterconfirm-panel-compare.md (+ both
  panel.json.gz).
- Sense-test: the counter-stage line is now captured verbatim on all
  four counter seeds; the sweeten line ("The gift talks…") is still
  uncaptured — the say-wrap regex has no keyword for it (metric-review
  item for the next run). Formation lines still repeat verbatim.
- Harness revert (critical): RAISER_SEAT +35 fully reverted from
  scripts/policies/competent.js (grep: 0 matches); the proof's three
  harness tests flipped to revert pins mirroring test-counterclose-a.js.
  The landed artifact is COUNTER_ANSWER only (env-gated, default OFF).
- Proof: test-counterconfirm-a.js 17/17 + test-counterclose-a.js 17/17,
  green after rebase and on merged master.
- Evidence: evidence/2026-11-10/sim-counterconfirm-a.md.
- Commits: 4b32e74f6 (prereg) + adba81c06 (driver/analyzer/proof) +
  a581b3778 (GO + revert) + 2d0ce41ba + c5ab93e62 (addenda).

DECISION OWED (coordinator/Steve call, NOT made here): the GO makes
COUNTER_ANSWER a landing candidate. Landing it as the competent default
vs keeping it env-gated is unmade — the lever stays default-OFF. The
panel's review_required (deaths/100d +2.62, inside the +10% cap) is
reported alongside, not hidden.

## Arm 2 — sim-preserve-a: GO on instrument validity + complete first numbers (merged f156c8564)

Corpus complete as stranded: 16/16 cells (8 seeds × control + neutral)
parse, non-empty; analyzer re-run from the committed script. Verdict
judged strictly against the prereg GO bar (all five hold):

- Every transform classified by method + caller, none 'other'; duty
  diff vs _haulcount tap agrees within rounding — batches 606 = 606 =
  606 (diff/tap/snapshot), kcal Δ161 (0.03%), per-resolution max |Δ|
  21 kcal, 0 mismatches on 872 resolutions.
- Every wrapped method's call path verified live in the proof miniature
  or marked dead — 7 wraps live in the pilot; 6 proven live in fixtures
  and dead under competent (policy never calls them).
- Neutrality 8/8 exact (days + end pantry kcal + deaths).
- Instrument errors 0 on all seeds, all legs.
- Complete capture of metrics 1–6 with sense-test scenes quoted;
  unmeasurables marked (villager→villager teaching: no code path;
  trader-gift kcal: no wrap).

Headline first numbers (band 180209–180216, 8 seeds, competent, 150d):
- Smoking is the whole ladder in practice: 606 duty-rack batches,
  531,765 → 507,649 kcal (95.5%), 21,516 shelf-days banked.
  renderFat 0, makePemmican 0, askSpecialist 0 — the scholar's fire was
  never lit for preserving; the ladder above smoking is voice-only.
- The racks rescue only 12.4% of what is about to rot: 520,445 of
  4,196,831 kcal rescued; 3,665,066 kcal rotted. Half the rot
  (1,817,278 kcal) fell on racks-full days; seed 180216's racks sat full
  39 straight days while 1.6M kcal rotted.
- Smoked vs dried: 49 batches / 32,145 kcal smoked (fish), 557 /
  475,504 kcal dried — only seeds 180209 and 180211 smoked any fish.
- Who preserves: whoever holds the cook duty — a Rancher held it all 132
  days on seed 180216 and went unskilled → skill 3 (60 XP). 29 villagers
  earned preserver XP; 4 reached skill 3. The scholar ate 150,122 kcal
  preserved (29.6% of their diet); the meal drew 258,937 kcal preserved.
  Spoiled-lost preserved food, object-tracked for the first time: 18,374
  kcal / 29 items.
- Sense-test caveat: the 200-line/seed say cap exhausts by day 18–73,
  so the voice sample covers only the first ~fifth of each run; most of
  seed 180216's racks-full stretch is uncaptured (wrap counts are
  complete). Rendering is talked about ("Rendering fat instead — the
  lamps won't fill themselves") but never done; no pemmican scene exists
  on any seed.

The 4th split-stack bug — FOUND, FIXED, PROVEN (did not move the verdict):
- (a) The post-conversion name was never recorded, so the analyzer's
  smoked/dried split read `other-name` on all 606 conversions. Fixed:
  instrument records postName; analyzer derives via the engine's own
  /fish/i rule for the frozen corpus — verified against an independent
  hand-count (identical).
- (b) The split-match tie-break picked the wrong stack when same-name
  stacks share per-unit kcal: 3/61 split conversions matched a stack
  outside the eligible window (spoilDayBefore − day = 0, 0, 4),
  recording rescuedKcal 0 on 11,320 kcal (2.1% undercount, reported as
  recorded, not adjusted). Fixed with an eligible-spoilDay tie-break.
- Proof extended to 111/111 (C10q, C10r–C10v, B16/B17 fixture). RED check
  run: on the pre-fix instrument, C10q/C10s/C10u fail with exactly the
  pilot signature. Green on the fixed instrument.
- Proof: test-preserve-a.js 111/111, green after rebase and on merged
  master.
- Evidence: evidence/2026-11-10/sim-preserve-a.md.
- Commits: 0638283b1 (prereg) + 2cc44b013 (instrument/proof 94/94) +
  f3f20ceb7 (duty-diff fix/proof 105/105) + f156c8564 (adoption fixes +
  corpus + evidence, proof 111/111).

No new sim-findings.md entries: the findings (racks-full guard
load-bearing, render starvation, cook dead branch, no villager→villager
teaching) are all already open in the backlog.

## Wall numbers (this run's judged corpora)

- Counterconfirm (32 configs, 150d): national 0, table 0, wins 0;
  wave-4 16/16, wave-5 14/16 on both legs; polityEver 14 vs 11;
  median survival 140d armed / 143.5d control.
- Preserve (16 configs, 150d): wins 0, national 0, table 0, wave-5
  unlocks 2/8, median survival 140d.
- The scale wall stands above both fixes: 0 national / 0 table / 0 wins
  everywhere, same as every recent run. The counter fix moves second
  links, not the wall.

## Telemetry deviation check

REFUSED for both corpora, not a failure: telemetry-check.js refuses
recorder-corpus input — all 32 counterconfirm rows and all 16 preserve
rows carry top-level anchorCommit, so they are sweep recorder rows, not
runs ("Recorder corpora are compared with sweep-compare tables, never
against a run baseline here"). Same handling as the 1915Z cookfirst arm
and the 1930Z knowledge arm. Baseline NOT rolled, no LOUD lines, no
investigation item.

## Metric review (for the NEXT run, §14)

- Counterconfirm: the sweeten line ("The gift talks…") is still
  uncaptured — the say-wrap regex needs a keyword for it; the walk path
  still has no confirm-band proof (pilot only). The panel's
  review_required on deaths/100d (+2.62, inside cap) should be watched
  on any wider band, not re-judged here.
- Preserve: the "share of eaten kcal preserved" headline conflates
  scholar pack-eating with the village meal — the analyzer splits them;
  the next run should decide which headline binds. The duty-vs-tap
  cross-check may show the tap undercounts partial-stack conversions
  (tap counts one batch per stack touched, diff counts per item) — the
  next run should decide which count binds for "batches". The
  200-line/seed say cap truncates voice after day ~18–73; a longer cap
  or a second-pass capture is owed for racks-full stretches.
- This run spent no confirm band beyond the arms' own corpora
  (counterconfirm IS the confirm, 16 seeds; preserve is a measurement,
  GO claims no landing).

## Infrastructure

- EPERM flap CLEARED: O_EXCL probes OK in /tmp, ~/workspace, and the
  repo; git ref create+delete OK at run start. No flap symptoms all run.
- Safe-commit index clobber hit both workers' commits (counterconfirm 3×,
  preserve 1×) — repaired each time with the documented `git ls-tree -r
  HEAD | git update-index --add --index-info` pipe; commits verified
  correct, `git status` + `git diff HEAD` empty after each repair.
- Counterconfirm first rebase attempt failed transiently ("could not
  detach HEAD", no lock file present); immediate retry replayed all 3
  commits cleanly, no stops.
- Merge sequencing: merge 1 (counterconfirm) moved master c5ab93e62, so
  ff-only correctly refused the preserve merge (diverging branches);
  preserve rebased onto the explicit master SHA c5ab93e62 in its own
  worktree (4 commits replayed clean, proof 111/111 re-run green),
  then merged ff-only as f156c8564. No pipes masked any exit code.
- Master moved once under the run before the workers finished
  (journey-deepening r129 ed33b42b8, [needs-eyes]); both branches rebased
  onto it; zero file overlap with either arm.
- check.js --quick NOT re-run: zero src/js changes in either arm
  (policy file competent.js harness revert is scripts/, instrument-only
  otherwise); the standing 280/7 pre-existing profile was last recorded
  by the 2215Z-era runs and no green-list file was touched.
- The tracker tail's owed item stands: measurement-proof refresh after
  r129 (neutral-proofrefresh-b2 stale — r129 touched 3 src/js manifest
  inputs). This run's arms touched no src/js, so the refresh is not
  newly owed by us; the next run needing the proof owns it.

## Tracker

Tier 2 preservation [x] (sim-preserve-a, f156c8564, GO on instrument
validity + complete first-numbers capture;
evidence/2026-11-10/sim-preserve-a.md). Tier 1 all [x]. Scale-onramp
stays converging (NOT converged): the counter wall is confirmed fixed
on a 16-seed band, but wins still come only through default-OFF
courtship + seat instruments, only through the lesser seat, wave 5
still 0 on the counter band's terms, and national is 0 everywhere in
this run's corpora. The directive stands until the tracker records this
axis converged on measured evidence. Next blanks, in order: (1) gardening
first numbers (band 180217–180224 — Loop B LIVE, sim-garden-b, do not
duplicate); (2) fight-play census (Loop B LIVE, sim-fightplay-b; Steve's
combat-play gate — the persistent-party build and the party-size ruling
(Steve 2026-11-10 19:13 CST: party size scales with threat, earned as
the village grows / waves unlock) both queue behind its numbers);
(3) standing-199 plateau read (#2098); (4) the COUNTER_ANSWER default
call (Steve/coordinator — GO confirmed, default flip unmade);
(5) measurement-proof refresh after r129 (owed, tracker tail).
Claim deleted; lock deleted.
