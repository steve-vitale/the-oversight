# sim-surplusnat-b — does standing run on surplus? (DIAG, instrument-only)

Run: fleshout-loop-b-20261021T1856Z, arm sim-surplusnat-b (the parent's
explicit named next). DIAGNOSTIC — no lever, no landing, instrument-only,
ZERO src/js changes, ZERO new policy layers. Worker tree:
~/workspace/worktrees/sim-surplusnat-b. Sweep substrate: worktree commit
961321a40857a996099343fbd3201dc4d2b649dc (governor present).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

- **Question**: the standing-may-run-on-surplus hypothesis. The parent
  (sim-surplusfeed-curvecheck-b, landed ecc7177f2, commit ea6f64531a)
  measured national reach 4/16 vs 9/16 armed/control and left open
  "standing-may-run-on-surplus hypothesis — the default-ON call needs
  that mechanism tested first (named next: instrument standing/feast
  spending vs trim)". The 1630Z DIAG corpus (26ef3caeb) showed national
  end 8/5, ever 13/11 — the delta REVERSED direction, which weakens the
  hypothesis but does not test it. This arm tests it: per-day
  {trimKcal, feastKcalOut, tendLink upkeep paid, tribute paid, pantryKcal,
  freshDays}, national path {nationalDay, everNational, end-national,
  loss cause}, plus standard wall numbers — on PAIRED SURPLUSFEED on/off
  runs, fresh seeds, one shared commit. The instrument captures
  standing/feast SPENDING against trim on the same days; the causal chain
  under test is trim -> feast/standing budget starved ->
  national unattained/lost.
- **PRIMARY (binding, DIAG-GO)**: >=95% of the armed-control
  national-reach delta (end-national AND ever-national) explained by a
  NAMED causal chain (A: trim-starved-standing; B: trim-independent;
  C: noise — see scripts/analyze-surplusnat-b.js for the exact
  operationalization), OR a ~0 delta reported with a confidence
  statement; 0 unexplained remainder.
- **Verdict scope**: this arm produces the DECIDING EVIDENCE for the
  SURPLUSFEED default-ON call as a RECOMMENDATION to Steve — do NOT flip
  the governor's default, do NOT touch src/js. MID-RUN UPDATE (recorded
  here before the sweep): Steve removed the governor himself on
  2026-10-21 ("Yeah take it off it sounds like a bad way to control
  outcomes" — docs/DECISIONS.md; master commit 86ded881d). The
  default-ON question is therefore MOOT. The arm's verdict is re-scoped
  WITHOUT re-scoring: the same mechanism evidence now informs the
  REPLACEMENT direction (villagers deprioritize production/storage when
  food is plentiful — behavioral/bottom-up). If standing genuinely runs
  on surplus, the replacement design must not starve the same budgets.
  This is a scope note, not a bar change — the primary above binds as
  written.
- **Seeds/method/horizon**: 66051–66058 x {leadfeast, belongfeast} x
  {control, armed} = 32 runs, 180d death-aware (dead villages stop,
  +10d tail max), env FEASTSCALE_R13=1 SEATDRIVE=0 both arms,
  SURPLUSFEED=1 armed side only, SAME commit for both arms
  (961321a40, the worktree's commit — the governor is present there;
  master removed it mid-run in 86ded881d, so the sweep stays on the
  worktree commit per the brief). Seeds 66051–66058 are FRESH: a full
  evidence grep found no 6605[1-8] seed use anywhere (all hits are
  pantryKcal values); the probe enforces a banned-list gate.
- **Instrument proof** (pre-registered, scripts/test-surplusnat-b.js —
  ALL GREEN before any sweep):
  (a) instrument honesty: >=95% named-channel attribution of the
      standing/feast/trim flows on trial runs (measured 100.0%);
  (b) RED-equivalent: SURPLUSFEED unset — instrumented == PRISTINE on
      the canonical outcome fields (won, endNational, table, rank,
      maxWave, arc, rosterEnd, days, endReason);
  (c) det-gate: paired re-runs byte-identical (minus the volatile ms
      field), armed and control.
  Re-verified after any rebase (no rebase occurred in this arm).
- **§15**: attempt scripts/balance-panel.js via
  scripts/build-surplusnat-panels.js; the parent documented this
  comparison class as inexpressible (env-var treatment not in panel
  identity) and the sibling (surpluskeep2-b) showed the comparator
  refuses with "Unmatched flags" — document the attempt, ship no bogus
  compare.
- **Sense**: read the governor's voiced beats on several runs — does the
  trim still read as a villager's decision? Report.

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md checked: it covers the
  food ladder (cleaned→cooked→smoked→rendered→pemmican) and contains NO
  SURPLUSFEED trim-governor canon — confirmed by grep (0 hits for
  surplusfeed/trim/governor). The governor's canon intent lived in the
  game.js header comment (Steve's 2026-10-18 make-the-call: "honest
  foraging practice by villagers, NOT a System intervention: they choose
  not to haul food that will rot") — superseded 2026-10-21 by Steve's
  removal ruling (docs/DECISIONS.md): the mechanism CLASS (post-hoc trim
  on the shared surplus) is out; the replacement direction is
  behavioral (villagers deprioritize production/storage when food is
  plentiful). Diagnostic: zero game code touched, zero policy layers
  built. Nothing invented.

## Proof results (pre-sweep — all green, 2026-10-21)

scripts/test-surplusnat-b.js: **46/46 GREEN** (run with FEASTSCALE_R13=1
SEATDRIVE=0 per the Usage header — ENV TRAP honored).

- (a) attribution 100.0% on all 4 armed trial runs (66101/66102 x
  {leadfeast, belongfeast} x 40d) — every unit of trim/feast/tend/
  tribute flow carries (channel name, day, amount); trim/feast/tend/
  tribute cross-foots exact (trim within 0.01 kcal FP tolerance —
  per-day cells keep full precision, the total is rounded once); day
  coverage >= 90% with the missing-day pattern documented (days 0-1
  pre-first-dawn, away days with no dawn call — all zero-flow days by
  construction: flows create their own day cells synchronously in the
  wraps); governor ENGAGES 4/4 armed trials; voice beats match the
  governor's exact copy. Control trial (66105, SURPLUSFEED unset):
  trimKcal == 0, trimCalls == 0 — no phantom attribution.
- (b) RED-equivalent (66105/66106 x 60d, SURPLUSFEED unset):
  instrumented == PRISTINE on all 9 canonical outcome fields (2/2);
  pristine rows carry no instrument state.
- (c) det-gate: 66101/leadfeast armed twice + 66106/belongfeast control
  twice — full row JSONs byte-identical minus ms, including daySeries,
  voiceBeats, totals (4/4).

Proof log: ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/surplusnat-proof.log (rerun after the rounding fix;
first run caught a 1-2 kcal sum-of-rounds phantom — fixed by keeping
full precision in per-day trim cells, documented in
scripts/surplusnat-runner.js).

## Instruments

- scripts/surplusnat-instruments.js — NEW, thin: the sfeed governor
  sensor (trimKcal per day), the feast sensor (Game.hostFeast wrap —
  the pantry draw IS the feast's real cost), the daily ledger
  (pantryKcal + freshDays at each dawn), the governor voice-beat
  capture. Reuses attachProbe (probe-glut-instruments.js, glutprobe
  family: dawn freshDays, death census) and attachUpkeepProbe
  (upkeep-instruments-surpluskeep-b.js: payTribute/tendLink wraps,
  break attribution, national sat/lost edges) — required, not copied.
- scripts/surplusnat-runner.js — shared oneRun() (sweep and proof build
  byte-comparable rows).
- scripts/probe-surplusnat-b.js — sweep CLI (env FATAL gates, fresh-seed
  banned-list gate, per-seed JSONs).
- scripts/test-surplusnat-b.js — proof (a)–(c) above.
- scripts/analyze-surplusnat-b.js — the attribution analyzer (named
  chains A/B/C, loss-cause taxonomy, dose-response Pearsons).
- scripts/build-surplusnat-panels.js — §15 attempt driver.

## Sweep results (32 runs, substrate 961321a40 — paired control+armed, same commit)

(Sweep completed 32/32; see Verdict — MOOT below.)

## Balanced panel (§15)

(Analyzer ran; see Verdict — MOOT below.)

## Telemetry deviation check


## Sense-testing (SENSE-TESTING LAW — read, not counted)

(Not performed — arm mooted before sense reads.)

## Village assessment


## Blanks filled / documented


## Metric review (§14)


## Convergence state

## Verdict — MOOT (Steve decision 2026-10-21)

**The SURPLUSFEED governor was removed by Steve's design decision mid-run** ("take it off, it sounds like a bad way to control outcomes" — docs/DECISIONS.md 2026-10-21). The default-ON question this arm was built to answer no longer exists. The arm is stood down, not landed; no code from this tree merges.

**What was measured anyway** (proof 46/46 GREEN, sweep 32/32 complete, analyzer DIAG-GO — recorded for the replacement design):
- National delta (armed−control): 0/16 end-state, −2/16 ever — noise (McNemar p=1.0).
- Trim does NOT starve budgets: trim kcal correlates POSITIVELY with standing spend (r=0.51 paired) and feast spend (r=0.60 paired) — better-fed villages produce more; the trim rides the surplus, it doesn't create scarcity.
- Realm losses: armed 2 dissolutions vs control 4 — the trim does not increase realm loss.
- 7/7 discordant pairs attributed to named chains, 0 unexplained.
- Wall (n=16 paired): armed natEnd 8 / control 8, table 12/12, w4 14/14, w5 0/0, median 115d.

**For the replacement design** (villagers deprioritize production/storage when food is plentiful): the old trim's innocence is established — it never starved anything. The new behavior should be judged on whether villagers' own production decisions track plenty, not on budget starvation.

## Metric review

Pre-registered DIAG-GO bar met (100% discordant-pair attribution, ~0 national delta with confidence). Not re-scored: the verdict is MOOT by Steve's design decision, not by the metric. The measurement stands as a historical record of the removed governor's innocence.
