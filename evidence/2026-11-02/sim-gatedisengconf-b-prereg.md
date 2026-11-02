# sim-gatedisengconf-b — RE-QUALIFICATION PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261102T1636Z,
arm sim-gatedisengconf-b, axis food-economy. Worktree
sim-gatedisengconf-b, branch sim-gatedisengconf-b.
Base at spawn: master 8471c5da3 (journey-deepening r86).

Background: Loop B arm sim-gatediseng-b (2026-11-01, DIAG-GO,
evidence/2026-11-01/sim-gatediseng-b.md) NAMED candidate (c)
STAND-DOWN + TREND as the disengaged-state rule: it fired day 15
on collapsing seed 51608 (6 evenings before first starvation
day 21), at corpus cost 2/27 survivors and fresh-pilot cost 2/8
survivors (exactly at the 25% bar). Loop B arm
sim-gatediseng-confirm-b (2026-11-01, PASS,
evidence/2026-11-01/sim-gatediseng-confirm-b.md) CONFIRMED (c)
on the cost leg on band 52201-52212 (0/12 survivor firings),
with the in-time leg vacuous (no collapsing seed) and
evenings-per-firing-seed still unmeasured (zero firings).
The 1536Z coordinator evidence (evidence/2026-11-02/
sim-food-round-1536.md) lists as owed next blank 7 the
"gatediseng confirm band 76701-76712". This arm runs that
band, re-qualified on current master. It does NOT deploy (c)
and does NOT flip any default, and it changes NO game code:
zero src/js edits, zero policy-default flips, zero edits to
any existing script or policy file. New files only, all named
*-gatedisengconf-b.*: this prereg, the proof test
(scripts/test-gatedisengconf-b.js), evidence, and the confirm
corpus (evidence/2026-11-02/sim-gatedisengconf-b-*.jsonl /
*.json / *.log). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), the gatediseng-confirm
evenings analyzer (scripts/analyze-gatediseng-confirm-b.js),
and scripts/policies/competent.js are REUSED VERBATIM,
read-only, never edited.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE
or the dipslide sensor as systems — the mechanism and the
candidate rule below are read from the gatecover / falsefire /
gatediseng / gatediseng-confirm evidence plus the game code
they instrument (src/js/game.js _depositGateEngaged /
prodThrottleEngaged / pantryFreshDays), not invented canon.
docs/PRESERVATION.md (food ladder) is adjacent, not the
sensor. This arm invents no game system: it measures
would-fire overlays on existing evening trajectories.

## The (c) rule, verbatim (as named by gatediseng-b, confirmed by gatediseng-confirm-b)

Let S be the first evening of the current disengaged stretch
(gateEngaged false at S, true at S-1); the firing evening D
(D > S, same stretch, D disengaged) shows 3 consecutive total
falls ending at D, all after S, AND pantryKcal(D) <= 0.90 *
pantryKcal(S). Operationalization, exactly as the reused
analyzers implement it (no redefinition mid-run):
- Every candidate also carries the sensor's eligibility
  floor loopDay >= 8; a (c) shape before day 8 does not fire.
- The three falls ending at D are the falls D-3 -> D-2,
  D-2 -> D-1, D-1 -> D, all strictly decreasing; the
  analyzer requires D-3 >= S (the 51608 firing itself is
  the boundary case: S = 12, D = 15, D-3 = 12 = S).
- The firing day on a trajectory is its FIRST evening
  satisfying the rule (first per trajectory for the rate;
  all evenings and one-per-stretch warnings are reported
  for texture by the evenings analyzer).
- A stretch that begins on the run's first recorded evening
  counts as a stand-down with S = that first evening; any
  such seed is reported loudly with its startsDisengaged
  flag.

## CONFIRM BAR — carried forward, quoted with source (judged exactly against this header)

Source: evidence/2026-11-01/sim-gatediseng-confirm-b-prereg.md,
"CONFIRM BAR (stated before seeing the band)":

"Primary metric: survivor firing-seed rate on the confirm
band = confirm seeds with >= 1 (c) firing that SURVIVED /
all confirm seeds that SURVIVED. (A firing on a collapsed
seed is timeliness evidence, not cost; see in-time leg.)
- CONFIRM BAR: survivor firing-seed rate <= 25% on the
  confirm band (same bar as the pilot leg). With 12
  survivors that means <= 3 firing survivors (3/12 = 25.0%
  passes; 4/12 = 33.3% fails). The denominator is the
  actual survivor count on the band, reported explicitly;
  if the band has zero survivors, the verdict is
  INSUFFICIENT-DATA, not a rate.
- IN-TIME CHECK (on any collapsing trajectory): for EVERY
  confirm seed that collapses, (c) must fire in time: its
  first firing day <= firstStarvationDay - 3 (first death
  whose cause is starvation in that seed's deaths list; if
  a collapsed seed has no starvation death, <= its
  collapse day (daysAlive) - 3, same margin). A collapsing
  seed with NO (c) firing fails the in-time leg outright.
  If the band contains NO collapsing seed, the in-time leg
  is vacuous: reported as 'not re-tested on this band'
  (51608's in-time firing, day 15 vs starvation day 21,
  stands from gatediseng-b) and it does not block PASS.
- EVENINGS-PER-FIRING-SEED (reported, not a bar): for
  every firing seed, report (i) raw evenings satisfying
  the (c) condition, and (ii) warnings issued under the
  one-per-stretch counting rule. Report the mean,
  median, and max of (i) across firing seeds, plus the
  per-seed counts in the evidence table. NO evenings
  threshold is set: evenings texture is a reporting
  requirement, not a judged bar.
Verdict:
- PASS: survivor firing-seed rate <= 25% AND the in-time
  leg satisfied (every collapsing seed fires in time, or
  no collapsing seed exists). PASS means the rule is
  CONFIRMED and the deploy spec in the confirm prereg is
  deploy-ready: a future arm may then make the deploy
  claim. PASS does not itself deploy anything.
- FAIL: survivor firing-seed rate > 25%, OR any collapsing
  seed fires late or never. FAIL means the rule stays
  NAMED-BUT-UNCONFIRMED; no deploy claim may cite this arm.
- INSUFFICIENT-DATA: tracer verification failure that
  cannot be repaired by re-run, a first-firing mismatch
  between the new evenings analyzer and the reused
  analyzer, missing fields, or zero survivors — with the
  failure stated."

This arm carries that bar unchanged onto band 76701-76712.
A miss is NO-GO, never re-scored against a friendlier
metric mid-run (no re-basing the rate on pooled corpus +
confirm seeds, no relaxing the in-time margin, no
re-defining a firing evening) — metric doubts go under
"metric review" for the NEXT run.

## Confirm band (fixed here, freshness verified BEFORE this prereg)

Seeds 76701-76712 (12 seeds), armed only, 30d competent,
same substrate gates as gatecover / gatediseng-b /
gatediseng-confirm-b (below), via
scripts/trace-gatecover-b.js verbatim, one node process
per seed, each line appended to
evidence/2026-11-02/sim-gatedisengconf-b-armed.jsonl.

Freshness verification, done before this prereg was written:
- Seed-field scan over ALL of evidence/ in both spellings:
  grep --include='*.jsonl' and --include='*.json' for
  `"seed": ?767(01|02|...|12)` followed by a non-digit —
  zero hits.
- .md mentions: grep -w over evidence/2026-11-02/*.md for
  76701-76712 — the only hits are the "76701-76712" range
  strings in coordinator next-blank lists (including the
  1536Z evidence that owes this band); no single seed is
  used anywhere as a judged seed.
- This band does not overlap the gatediseng pilot
  (52101-52108), the gatediseng corpus (51311-51330,
  51601-51608), or the gatediseng-confirm band
  (52201-52212).
- If any confirm seed's tracer verification fails (rows !=
  daysAlive), that seed is re-run and the retry is reported
  loudly; a seed is never judged on a mismatched row count.

## Substrate (identical to gatecover / gatediseng-b / gatediseng-confirm-b)

Policy: competent ONLY (scripts/policies/competent.js,
verbatim). Substrate gates: COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0; WOODCARRY / WOODWARM / MORNINGCARRY /
WINDOWCARRY / STRANDFIX / PRESSB / FEDEVENING not 1;
DEPOSITGATE=1 (armed only). Horizon: 30 days, death-aware,
matching gatecover / gatediseng-b / gatediseng-confirm-b
exactly. Tracer: scripts/trace-gatecover-b.js verbatim
(evening gate read + freshKcal + freshDays + hungryStreak
+ both condition values, per evening, plus sayLines for
the sense test). Judged analyzer:
scripts/analyze-gatediseng-b.js verbatim (first (c) firing
per seed, survivor rate, in-time flag). Evenings analyzer:
scripts/analyze-gatediseng-confirm-b.js verbatim (all (c)
evenings + one-per-stretch warnings + cross-check against
the reused analyzer + prereg verdict; any mismatch is a
loud failure, not a re-score).

## On "fresh BOTH legs" and the day-1 pantry identity check (standing lesson, mapped honestly)

This arm is a would-fire overlay measurement, not a lever
A/B comparison: it changes NO game code and NO policy
default, so a "baseline" trajectory and an "armed"
trajectory for the same seed are the SAME trajectory by
construction — there is no second leg to re-run, and
re-running the identical sweep would only duplicate lines.
The standing lesson is therefore honored in its applicable
form, and the mapping is stated here before judging so it
cannot be re-decided after seeing the band:
- FRESHNESS, not reuse: the band is run fresh on current
  master (this worktree's tip); no prior run's trajectory
  contributes any judged number. The 1536Z lesson about
  re-baselining after landings is exactly why this band is
  a fresh sweep rather than a re-analysis of the 522 band.
- TWO INDEPENDENT LEGS, both fresh: (1) the tracer sweep
  itself, verified rows == daysAlive per seed; (2) the
  cross-check leg — the reused gatediseng analyzer's
  first (c) firing vs the evenings analyzer's first (c)
  evening, required to agree on all 12 seeds.
- DAY-1 IDENTITY CHECK: before any judged analysis, each
  fresh tracer line is checked for a present, sane day-1
  evening row (loopDay 1, numeric pantryKcal) and for
  rows == daysAlive; in addition, seed 76701 is re-run
  after the sweep and its JSON line must be byte-identical
  to the swept line (determinism check on current master).
  A failure of any of these is reported as substrate drift
  / INSUFFICIENT-DATA, not judged — the same stop rule the
  task sets for a failed day-1 identity check.
- If the band fails to reproduce the pilot's qualifying
  conditions on current master (disengaged stretches that
  can exercise (c), surviving villages to score cost on),
  that is reported as substrate drift / INSUFFICIENT-DATA
  with the reproduction numbers, not as a confirm verdict
  — with one precedent-bound exception, carried from the
  522 confirm: a gate-quiet band (few or short disengaged
  stretches) is a CAVEAT on a PASS, not a verdict change,
  because the 522 band was itself gate-quiet (7/12 seeds
  never stood down) and still passed on its own bar with
  that caveat stated. What would change the verdict is
  only the carried bar above.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any judged sim).
STEP 2 — TOOLS + PROOF (new proof test
  scripts/test-gatedisengconf-b.js; pure, synthetic series
  only, NO judged seeds — synthetic seed numbers are 999xx,
  invented — run green after the prereg commit and before
  any judged application; the reused proof tests
  test-gatediseng-b.js (21/21) and
  test-gatediseng-confirm-b.js (11/11) are also re-run
  green on current master before the sweep).
STEP 3 — CONFIRM BAND (seeds 76701-76712 via the verbatim
  tracer; verified rows == daysAlive each; day-1 identity
  check + 76701 determinism re-run; (c) firings +
  evenings counts + wall numbers).
STEP 4 — SENSE TEST (read transcripts around firing
  evenings on firing seeds — or near-miss evenings if the
  band fires zero times, as in the 522 confirm — plus the
  published 51608 day 12-28 stretch; see below).
STEP 5 — EVIDENCE
  (evidence/2026-11-02/sim-gatedisengconf-b.md).

## Balanced panel (§15) — inapplicability declared (same as gatediseng-b / gatediseng-confirm-b)

No balanced-panel compare is fabricated. This arm changes
NO game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire
overlays on identical evening series), not panel metrics.
The tables are reported directly in the evidence file
instead, on identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table /
wins. NO wall movement is claimed. What is reported from
the confirm band: survival (seeds survived / 12, median
and max days alive), wave reach (max wave unlocked per
seed), and national / table / wins as NOT REACHED IN
WINDOW (expected 0 — those are late-game states with no
fields in this window, reported as such, not as a rate
claim). Death-cause shares are reported from the band's
deaths lists for texture.

## Sense test (SENSE-TESTING LAW)

Read the transcripts (sayLines) around firing evenings on
confirm firing seeds (or near-miss evenings if the band
fires zero times), and re-read the published 51608
day 12-28 stretch, and judge in plain words whether a (c)
warning on a firing evening would read as the village
noticing in time, in words matching the evenings around
it. At least three lines are quoted in the evidence file
(or one quoted disengagement/gating transcript sample at
minimum, with the zero-firing shape stated if the band
fires zero times). A warning that would read as two voices
disagreeing on the same evening, or as an alarm from
nowhere, is reported as such even on a PASS — sense
texture does not re-score the confirm bar, but it travels
with the deploy spec.

## Attribution limits (stated before judging)

- Evening snapshots only: (c) reads evening pantry/gate
  values, the same read the sensor's counting uses.
  Intraday flicker is not measured and cannot change a
  would-fire evening verdict.
- Would-fire overlay, not a counterfactual: firing days
  are computed on trajectories as run. A real (c) rule
  could change villager behavior and therefore later
  evenings; whether it would have saved any village is
  unmeasured and is not claimed.
- Single policy (competent) by design; other policies may
  pantry differently. 30-day early window only; late-game
  legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: a
  PASS here re-confirms (c) against the carried bars on a
  fresh band on current master and keeps the deploy spec
  deploy-ready; it does not deploy (c), and any deploy
  belongs to a future arm's claim.
- GateOn on confirm rows is recorded directly by the
  gatecover tracer, so no gateOn assumption is carried
  on this band (unlike the gatediseng corpus rows).

## Metric review

(To be completed in the evidence file after judging. Doubts
about this header go here, and any revision applies to the
NEXT run, never to this one.)
