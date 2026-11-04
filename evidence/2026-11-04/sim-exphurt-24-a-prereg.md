# sim-exphurt-24-a — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T1836Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-exphurt-24-a. Axis: food-economy.
Arm: EXPHURT 24-seed measurement (findings backlog #1699, claimed by
this arm — the coordinator updates the backlog file; this arm does
not touch it, nor ~/workspace/goals/.../hidden_files).
Sibling arms untouched: Loop B arms (tendfloor/tendbelow), the
scale-onramp axis, all sibling worktrees. No main-tree touch.
No game-code change in this arm: MEASUREMENT ONLY. The drafted
hurt-clause hook is NOT landed here — a GO here makes the spec
SPEC-READY for a future landing arm, nothing more.

## CONTEXT (carried forward, not re-litigated)

- Prior arm sim-exphurt-a (run 1445Z) returned INSUFFICIENT-DATA:
  6 expedition cases, M1 0/5 (descriptive).
- Prior arm sim-exphurt-confirm-a (run 1647Z) returned
  INSUFFICIENT-DATA: pilot gate missed on the expedition-case leg
  (2 cases in HALF 1 vs bar >= 4); HALF 2 not run. Judged HALF 1
  numbers: D-open 1/2, D-last 1/2, M1 0/2, M1-all 0/2, M2 2/2,
  M3 2/2.
- Pooled expedition-case rate across the two prior arms:
  0.50/seed (8 cases / 16 seeds). Descriptive M1 is 0/7 pooled
  (0/5 + 0/2) — NOT a judged pooling, and this arm does not
  judge a pooling either.
- The hurthome turn-home fix (1220Z, landed) is NOT re-litigated.
- The drafted hurt-clause spec (text-only hurt clause appended
  to expeditionReturn's playerAtHaven homecoming line when the
  returnee's hp at return is 1..7) stays DRAFT through this arm.
- Canon read first: docs/CANON.md; PRESERVATION.md and PARTY.md
  read in the prior arm. No canon doc covers away-return timing
  or hurt-return narration — that still holds; the mechanism
  is code-read, not invented canon.

## GUARDRAILS (unchanged)

- No gate, price, deed bar, or win-price change in this arm.
- No game-code change at all: no hook, no hurthome-rule change,
  no clock write-back, no RNG-draw change.
- No [needs-eyes] commit: nothing player-facing changes.

## INSTRUMENT (reuse, unchanged where possible)

- scripts/hurthome-b-lib.js (UNCHANGED), scripts/exphurt-a-lib.js
  (UNCHANGED), scripts/exphurt-confirm-a-lib.js (UNCHANGED),
  scripts/analyze-exphurt-confirm-a.js (UNCHANGED except it must
  accept the new per-seed directory / filename pattern — a
  filename-pattern parameter only, no metric change).
- NEW scripts/sweep-exphurt-24-a.js: same harness/policy/runDays
  pattern and same env gates as scripts/sweep-exphurt-confirm-a.js
  (read that script, do not guess): competent policy, 100d
  death-aware cap, PLENTYDEPRI=1, DEPOSITGATE=1, post-hurthome-fix
  guard (Game.shouldHurtReturn must exist), same retro-open and
  closing-part capture. It refuses any seed list other than the
  single pre-registered band below. Corpus directory:
  evidence/2026-11-04/perseed-exphurt-24-a/.
- NEW scripts/test-exphurt-24-a.js: proof for this arm — the
  sweep's seed-list refusal (accepts exactly the band, refuses
  any other list including 99917–99932 and any prior band),
  the D-last denominator rule (expedition cases with BOTH
  durations present at last hurt), and the M1 GO-threshold
  judgment rule (M1 <= 0.20 on an adequate denominator).
  Must be green BEFORE the judged sims.

## DESIGN (pinned)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (comparability with the
  hurthome lineage and both prior arms; dead villages stop
  simulating).
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit).
- Seeds: SINGLE UN-STAGED 24-seed fresh band 99933–99956.
  Fresh-band check, stated plainly: this band follows the prior
  bands in sequence (pilot 99901–99908, unrun pre-declared
  confirm 99909–99916, confirm 99917–99932) and no per-seed
  file in evidence/2026-11-04/ carries a seed in 99933–99956
  (checked by filename before the prereg commit). No other
  seeds, no staging, no expansion, no horizon extension, no
  hp-gate widening, no seed re-picking. If the judged
  denominator bar below fails, the run ends — it does not
  shop for seeds.
- Gate on instrument health ONLY: all 24 seeds complete,
  instrument errors 0, unclassified cases 0 (every case in
  exactly one outcome bucket). There is NO rate-based pilot
  gate in this arm — the prior arm's metric review named the
  rate gate as the failure mode, and this single un-staged
  band is the prescribed replacement.

## PRE-REGISTERED METRICS (judged exactly against this header, §14)

Unit: one event case (hurthome-b-lib). Disconnect denominators:
expedition-purpose cases with BOTH durations present (at open
for D-open, at last hurt for D-last).

- M1 (PRIMARY, the blank): among returned-hurt expedition cases
  WITH an expeditionReturn line in the closing part, the share
  whose expeditionReturn line mentions hurt.
- D-last (judged denominator): expedition cases with BOTH
  durations present at last hurt (expedDurationAtLastHurt vs
  awayDuration). D-last share = share of those with
  |expedDurationAtLastHurt − awayDuration| >= 2. Also reported:
  exped-shorter share, median signed gap.
- D-open (comparability): share of denominator cases (both
  durations present at open) with
  |expedDurationAtOpen − awayDuration| >= 2. Also reported:
  exped-shorter share, median signed gap.
- M1-all (comparability): among ALL returned-hurt expedition
  cases, the share whose expeditionReturn line mentions hurt
  (silent returns count as misses).
- M2: among ALL returned-hurt expedition cases, the share with
  ANY closing-part return line mentioning hurt (hurthome line
  counts).
- M3: among returned-hurt expedition cases, the share with
  >= 1 closing-part return line at all.
- SENSE: every returned-hurt expedition return-line pair quoted
  and judged for meaning (does the homecoming read as hurt?),
  or at least 5 if more than 5 exist.
- Instrument health: errors 0, unclassified 0 across all 24.
- Wall numbers: reported descriptively from this diag corpus
  only (per-seed daysAlive, rank, maxWave, win flag, death
  counts and death-cause shares if the corpus reads them);
  this corpus is a diag corpus, not a scale panel, and states
  so plainly if a wall number is unreadable from it.

## PRE-REGISTERED JUDGMENT

- GO threshold: M1 <= 0.20.
- Judge bar: D-last denominator >= 8.
- Verdict rules, exhaustive:
  - D-last < 8 → INSUFFICIENT-DATA (neither GO nor NO-GO).
    The spec stays DRAFT; the hook is neither confirmed nor
    killed. Not a kill, not a confirmation.
  - D-last >= 8 and M1 <= 0.20 → GO (SPEC-READY). The spec
    is ready for a future landing arm; this arm still lands
    no hook and no game code.
  - D-last >= 8 and M1 > 0.20 → NO-GO (spec rejected). The
    evidence must say what the lines actually do instead —
    the blank does not persist, so the hook is unnecessary.
    Kill cleanly: no game-code trace (none exists in this
    arm), no hook.
- M1 denominator note: M1 is judged on its own denominator
  (announced expedition returns). If D-last >= 8 is met but
  the M1 denominator is 0, M1 is null, not 0 — the verdict
  cannot be GO on a null M1; report it as INSUFFICIENT-DATA
  with the reason stated (no announced expedition returns to
  judge), not as a 0.00.
- If instrument health fails (a seed incomplete, errors > 0,
  or unclassified > 0): verdict INSUFFICIENT-DATA (instrument
  failure), and the failure is reported loudly, not scored.
- A miss is never re-scored against a friendlier metric
  mid-run. M1-all, M2, M3, D-open are comparability metrics
  only; none substitutes for M1 or D-last. If a metric proves
  wrong, it goes under "metric review" for the NEXT run.
- §15 BALANCED PANEL — DECLARED INAPPLICABLE here, in advance,
  for the same reason as the prior arm: scripts/balance-panel.js
  is a panel driver with its own observer contract; it cannot
  ingest event-case corpora and measures scale/cohort metrics,
  not return-line text. No panel compare file is attached,
  deliberately.

## WHAT LANDS, WHAT DOES NOT

- LANDS (coordinator merges; worker does not push, bump, or
  verify live): this prereg; the 24-a sweep instrument + proof
  test; the 24-a corpus (24 per-seed JSONs + sweep summary);
  the evidence file.
- DOES NOT LAND: no game-code change; no hook; no hurthome-rule
  change; no gate/price/deed change; no clock write-back; no
  sibling files; no hidden_files files.

## LATENCY NOTE

Latency is NOT a primary in this arm (prior arms: 1 part every
time, three confirmations running). It is reported descriptively
only if the corpus reads it, and it never gates the verdict.
