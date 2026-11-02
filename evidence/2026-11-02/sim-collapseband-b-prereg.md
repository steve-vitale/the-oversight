# sim-collapseband-b — TIMELINESS RE-CONFIRM PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261102T1730Z,
arm sim-collapseband-b, axis food-economy. Worktree
sim-collapseband-b, branch sim-collapseband-b. Base at spawn:
master 8889d5151 (version bump over journey-scale r72 landing).

Background (read, never re-litigated, never re-judged):
- Loop B arm sim-gatediseng-b (2026-11-01, DIAG-GO,
  evidence/2026-11-01/sim-gatediseng-b.md) NAMED candidate (c)
  STAND-DOWN + TREND: it fired day 15 on collapsing seed 51608
  (6 evenings before first starvation day 21), at corpus cost
  2/27 survivors and fresh-pilot cost 2/8 survivors.
- Loop B arm sim-gatediseng-confirm-b (2026-11-01, PASS) CONFIRMED
  (c) on the cost leg on band 52201-52212 (0/12 survivor
  firings), with the in-time leg vacuous (no collapsing seed).
- Loop B arm sim-gatedisengconf-b (2026-11-02, PASS, landed
  b6deca172) RE-CONFIRMED (c) on the cost leg on band
  76701-76712 (2/12 survivor firings = 16.7% <= 25% bar),
  with the in-time leg vacuous AGAIN (12/12 survived).
  That PASS verdict STANDS and is not this arm's to re-judge.
- What is still owed, now this arm, is the timeliness
  re-confirm (third statement): the 767 band had ZERO
  collapsing seeds, so 51608 remains the SOLE in-time
  evidence (firing day 15 vs starvation day 21). 76712's
  day-9 firing 13 days before starvation deaths on a
  SURVIVING village is texture, NOT a collapse averted,
  and must not be cited as one. This prereg honors that
  distinction structurally: a seed that survives 30 days
  is NEVER a collapsing seed here, however many of its
  people starved (76712 shape).
- Backlog item "gatediseng-timeliness" (claimed 2026-11-02 by
  this run) is this arm's charter. This worker does NOT
  edit the backlog or the tracker; findings go to the
  coordinator in the evidence file.
- Substrate-fragility finding (heeded): sensor thresholds
  derived on one substrate do not transfer without a
  re-run leg. This arm screens and judges on ONE
  consistent substrate — the gatediseng-line substrate
  (competent, DEPOSITGATE=1, gatecover tracer, as in the
  gatedisengconf arm) — and discloses it here.

This arm changes NO game code, flips NO policy default,
edits NO existing script or policy file. New files only,
all named *-collapseband-b.*: this prereg, the proof test
(scripts/test-collapseband-b.js), the thin band analyzer
(scripts/analyze-collapseband-b.js, which imports the
reused analyzer and adds only collapse classification,
lead arithmetic, and the band verdict), the evidence file,
and the screen corpus
(evidence/2026-11-02/sim-collapseband-b-screen.jsonl /
*-summary.json / *-sweep.log). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), and
scripts/policies/competent.js are REUSED VERBATIM,
read-only, never edited.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the
gatediseng sensor itself — it is a policy-side sim
instrument, not a game system; no canon is invented for
it. docs/PRESERVATION.md (food ladder) is adjacent, not
the sensor. This arm invents no game system: it measures
would-fire overlays on existing evening trajectories.

## The (c) rule, verbatim (as named by gatediseng-b, confirmed twice)

Let S be the first evening of the current disengaged
stretch (gateEngaged false at S, true at S-1); the firing
evening D (D > S, same stretch, D disengaged) shows 3
consecutive total falls ending at D, all after S, AND
pantryKcal(D) <= 0.90 * pantryKcal(S). Operationalization,
exactly as the reused analyzer implements it (no
redefinition mid-run):
- Eligibility floor loopDay >= 8; a (c) shape before day 8
  does not fire.
- The three falls ending at D are D-3 -> D-2, D-2 -> D-1,
  D-1 -> D, all strictly decreasing; the analyzer requires
  D-3 >= S (51608 itself is the boundary case: S = 12,
  D = 15, D-3 = 12 = S).
- The firing day on a trajectory is its FIRST evening
  satisfying the rule.
- A stretch that begins on the run's first recorded
  evening counts as a stand-down with S = that first
  evening; any such seed is reported loudly with its
  startsDisengaged flag.

## COLLAPSE DEFINITION (fixed here, BEFORE any sim)

From the 51608 shape (pantry fall + starvation deaths /
village collapse within the horizon):

- COLLAPSING seed: the reused analyzer's `collapsed`
  flag — daysAlive < 30 OR endReason == 'village-lost'.
  The village dies inside the 30-day horizon. This is the
  band-formation criterion, decidable from the tracer
  line alone, before any (c) computation.
- 51608-CLASS (starvation collapse): a collapsing seed
  with >= 1 death whose cause is 'starvation'. 51608
  itself: collapsed, first starvation death day 21.
- NON-STARVATION collapse: a collapsing seed with zero
  starvation deaths. Still a collapsing seed for band
  formation; its timeliness reference day is its collapse
  day (daysAlive), per the carried fallback rule below.
- SURVIVOR (never collapsing): daysAlive == 30 with
  endReason != 'village-lost', REGARDLESS of starvation
  deaths on the seed. 76712 (3 starvation deaths, survived
  30d) is a survivor under this definition, exactly as the
  gatedisengconf prereg scored it (cost, not timeliness
  evidence).
- Pantry-fall texture (stand-down pantry, firing pantry,
  minimum pantry, starvation-death days) is REPORTED for
  every collapsing seed but is NOT part of the collapse
  definition: the definition must be decidable before
  (c) is computed, or band formation would select on the
  instrument being judged.

## SCREENING DESIGN (fixed here, BEFORE any sim)

Screen band: seeds 79001-79064 (64 seeds), in blocks of 8
(79001-79008, 79009-79016, ...), armed only, 30d competent,
gatediseng-line substrate (below), via the verbatim
gatecover tracer, one node process per seed, each line
appended to evidence/2026-11-02/sim-collapseband-b-screen.jsonl.

- STOP RULE: screening stops at the end of the first
  block in which the cumulative collapsing-seed count
  reaches >= 4, OR when the 64-seed budget is exhausted,
  whichever comes first. The >= 4 stop exists because
  collapsing seeds are rare (pooled gatediseng-line
  history: 1 collapsing seed in 60 measured: corpus 1/28,
  pilot 0/8, confirm-522 0/12, confirm-767 0/12); a band
  of 4 collapsing seeds is a full band for this leg.
- NO SELECTION ON FIRING: blocks are counted by collapse
  status ONLY. (c) firings are computed only AFTER
  screening stops, on the final band, so band formation
  can never select on the instrument being judged.
- PILOT MINIMUM: no timeliness judgment is made until at
  least 8 seeds have been screened (one full block). The
  in-time leg's denominator is the collapsing count found
  (see verdicts); the screened count is reported
  alongside it, so a small-n verdict can never masquerade
  as a large-band verdict.
- If any screened seed's tracer verification fails
  (rows != daysAlive), that seed is re-run and the retry
  is reported loudly; a seed is never judged on a
  mismatched row count.

## JUDGED BAND + TIMELINESS BAR (fixed here, BEFORE any sim)

Judged band = ALL collapsing seeds found by the screen
(0 or more; if screening stops early at >= 4, the band is
those collapsing seeds — the non-collapsing screened seeds
are screen context, not band members).

Reference day per collapsing seed (carried rule): the
first starvation death day if the seed has any
starvation death, else its collapse day (daysAlive).
Lead = reference day - (c) first firing day. A collapsing
seed with NO (c) firing has no lead and fails outright.

- CARRIED-MARGIN LEG: every collapsing seed in the band
  fires with lead >= 3 days (the margin carried from
  gatediseng-b / gatediseng-confirm-b / gatedisengconf-b:
  firing day <= reference day - 3).
- 51608-CLASS-MARGIN LEG: >= 50% of collapsing seeds in
  the band fire with lead >= 6 days (51608's own margin:
  day 15 vs day 21). For a 1-seed band this means that
  seed must reach >= 6 days; for 2 seeds at least 1; for
  3 seeds at least 2; for 4 seeds at least 2.
- Per-seed leads are reported in full in the evidence
  table, so a reader can see a 3-5 day lead passing the
  carried leg while missing the 51608-class leg.

Verdict (judged exactly against this header; a miss is
NO-GO, never re-scored mid-run — no widening the screen,
no redefining collapse, no relaxing either margin, no
re-basing on pooled seeds):
- TIMELINESS-PASS: band has >= 2 collapsing seeds AND
  the carried-margin leg holds for every band seed AND
  the 51608-class-margin leg holds (>= 50% at >= 6 days).
- TIMELINESS-PASS-SINGLE: band has exactly 1 collapsing
  seed AND that seed fires with lead >= 6 days (which
  implies the carried leg). Reported with an explicit
  n = 1 caveat; it is a single-seed confirmation, not a
  band pass.
- TIMELINESS-FAIL: band has >= 1 collapsing seed AND
  (any band seed fires late with lead < 3, or never
  fires, or the 51608-class leg fails). The failing leg
  is named. FAIL means timeliness is NOT re-confirmed;
  no deploy claim may cite this arm for timeliness.
- DIAG-NO-BAND: 0 collapsing seeds in the screened
  budget (up to 64). This is NOT a timeliness verdict
  (neither pass nor fail): the screen found no band to
  judge, and the definition is never widened mid-run to
  force one. 51608 remains the sole in-time evidence.
- INSUFFICIENT-DATA: tracer verification failure that
  cannot be repaired by re-run, a first-firing mismatch
  between the thin analyzer and the reused analyzer,
  missing fields, or a determinism-check failure — with
  the failure stated.

## Screening band (fixed here, freshness verified BEFORE this prereg)

Seeds 79001-79064 (64 seeds, screened in blocks of 8 as
above; the judged band is the collapsing subset found).

Freshness verification, done before this prereg was written:
- Seed-field scan over ALL of evidence/ in both spellings
  (rg `"seed": ?78[0-9]{3}` and `"seed": ?79[0-9]{3}`,
  *.jsonl/*.json): 78xxx hits are ONLY 78201-78208
  (dawnblock / seathes arms, 2026-11-01, a different
  lane — avoided); 79xxx hits are ZERO.
- .md whole-word scan over evidence/ for 79xxx: the only
  hits are aggregate numbers (79163, 79935), not seeds.
- Filename scan over evidence/: no 79xxx seed-band files
  (only unrelated s797 / s979 3-digit seed files from
  October arms).
- Goal hidden_files scan for 790xx: only kcal values
  (79000, 79020, 79043, 79049, 79070 in pantry / harvest /
  tribute fields), not seeds.
- This band does not overlap the gatediseng pilot
  (52101-52108), the gatediseng corpus (51311-51330,
  51601-51608), or the confirm bands (52201-52212,
  76701-76712), or the homeward bands (69501-69508,
  69601-69608).
- DISCLOSED LIMIT: the scan is as of prereg time. Loop A
  is live concurrently (1715Z claim: arms
  sim-npcdeadfilter-confirm, sim-fightoutcome-recorder)
  on other lanes; a concurrent lane picking 790xx after
  this scan would be visible only in that lane's later
  evidence. This arm's screen lines are written as the
  sweep runs, so any collision would be timestamped
  after this prereg's scan, not hidden inside it.

## Substrate (identical to gatecover / gatediseng-b / gatediseng-confirm-b / gatedisengconf-b)

Policy: competent ONLY (scripts/policies/competent.js,
verbatim). Substrate gates: COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0; WOODCARRY / WOODWARM / MORNINGCARRY /
WINDOWCARRY / STRANDFIX / PRESSB / FEDEVENING not 1;
DEPOSITGATE=1 (armed only). Horizon: 30 days, death-aware
(dead villages stop simulating; daysAlive < 30 is the
collapse signal — never a fixed 200d). Tracer:
scripts/trace-gatecover-b.js verbatim (evening gate read
+ freshKcal + freshDays + hungryStreak + both condition
values, per evening, plus sayLines for the sense test).
Judged analyzer: scripts/analyze-gatediseng-b.js verbatim
(first (c) firing per seed, in-time flag at the 3-day
margin). Thin band analyzer (new, this arm):
scripts/analyze-collapseband-b.js — imports the reused
analyzer, adds collapse classification per the definition
above, lead arithmetic (reference day, lead days, >= 3
and >= 6 flags), and the band verdict; its first-firing
values must match the reused analyzer on every band seed
or the run is INSUFFICIENT-DATA (loud failure, not a
re-score).

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
- FRESHNESS, not reuse: the band is screened fresh on
  current master (this worktree's tip); no prior run's
  trajectory contributes any judged number.
- TWO INDEPENDENT LEGS, both fresh: (1) the tracer sweep
  itself, verified rows == daysAlive per seed; (2) the
  cross-check leg — the reused gatediseng analyzer's
  first (c) firing vs the thin band analyzer's first (c)
  firing, required to agree on every band seed.
- DAY-1 IDENTITY CHECK: before any judged analysis, each
  fresh tracer line is checked for a present, sane day-1
  evening row (loopDay 1, numeric pantryKcal) and for
  rows == daysAlive; in addition, seed 79001 is re-run
  after the screen and its JSON line must be byte-identical
  to the swept line (determinism check on current master).
  A failure of any of these is reported as substrate drift
  / INSUFFICIENT-DATA, not judged — the same stop rule the
  task sets for a failed day-1 identity check.
- If the screen fails to reproduce the pilot's qualifying
  conditions on current master (villages that can collapse
  at all, disengaged stretches that can exercise (c)),
  that is reported with the reproduction numbers, not
  papered over: a 0-collapse screen is DIAG-NO-BAND per
  the verdicts above, and a gate-quiet screen is a stated
  caveat, not a verdict change.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any judged sim).
STEP 2 — TOOLS + PROOF (new proof test
  scripts/test-collapseband-b.js; pure, synthetic series
  only, NO judged seeds — synthetic seed numbers are 999xx,
  invented — run green after the prereg commit and before
  any judged application; the reused proof tests
  test-gatediseng-b.js (21/21) and
  test-gatediseng-confirm-b.js (11/11) are also re-run
  green on current master before the screen).
STEP 3 — SCREEN (seeds 79001-79064 in blocks of 8, stop
  rule above; verified rows == daysAlive each; day-1
  identity check + 79001 determinism re-run).
STEP 4 — JUDGE (collapse classification + (c) firings +
  leads + band verdict, judged exactly against this
  header; wall numbers from the screened band).
STEP 5 — SENSE TEST (read transcripts around firing
  evenings on collapsing seeds — or starvation / near-miss
  evenings if the band is empty — plus the published
  51608 day 12-28 stretch; see below).
STEP 6 — EVIDENCE
  (evidence/2026-11-02/sim-collapseband-b.md).

## Balanced panel (§15) — inapplicability declared (same as gatediseng-b / gatediseng-confirm-b / gatedisengconf-b)

No balanced-panel compare is fabricated. This arm changes
NO game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire
overlays on identical evening series), not panel metrics.
The tables are reported directly in the evidence file
instead, on identical seeds and identical trajectories.
The before/after comparison this arm performs is the
would-fire overlay itself: the same trajectory read with
and without the (c) rule applied, which is identical by
construction because the rule changes no behavior.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table /
wins. NO wall movement is claimed. What is reported from
the screened band: survival (seeds survived / screened,
median and max days alive), wave reach (max wave unlocked
per seed), collapsing-seed count and rate, and national /
table / wins as NOT REACHED IN WINDOW (expected 0 — those
are late-game states with no fields in this window,
reported as such, not as a rate claim). Death-cause shares
are reported from the band's deaths lists for texture.

## Sense test (SENSE-TESTING LAW)

Read the transcripts (sayLines) around firing evenings on
collapsing seeds (or starvation / near-miss evenings if
the band is empty), and re-read the published 51608
day 12-28 stretch, and judge in plain words whether a (c)
warning on a firing evening would read as the village
noticing in time, in words matching the evenings around
it. At least three lines are quoted in the evidence file
(or one quoted disengagement/gating transcript sample at
minimum, with the empty-band shape stated if the band is
empty). A warning that would read as two voices
disagreeing on the same evening, or as an alarm from
nowhere, is reported as such even on a PASS — sense
texture does not re-score the timeliness bar, but it
travels with the deploy spec.

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
  PASS here re-confirms timeliness against the bars above
  on a fresh collapsing band on current master; it does
  not deploy (c), and any deploy belongs to a future
  arm's claim.
- GateOn on screen rows is recorded directly by the
  gatecover tracer, so no gateOn assumption is carried
  on this band (unlike the gatediseng corpus rows).

## Metric review

(To be completed in the evidence file after judging. Doubts
about this header go here, and any revision applies to the
NEXT run, never to this one.)
