# Hold-beat ordering fix — Loop B arm sim-holdbeatfix-b — GO

Run: fleshout-loop-b-20261104T1030Z. Branch: sim-holdbeatfix-b.
Prereg: evidence/2026-11-04/sim-holdbeatfix-b-prereg.md (commit
211f027c0, before any scored seed). Baseline anchor: 02158dbea271
(journey-scale r95). Fix commit: bafacaa98 (below). No push, no
bump, no live verification by this worker — coordinator merges via
--ff-only; "merged locally, pending ship" is the coordinator's call.

## The fix (exactly the named fix, nothing else)

`recordWaveKill` in src/js/game.js called `checkWaveUnlockBeat()`
BEFORE appending the `waveKillLog` entry that the veteran count
(`waveCombatReadiness`, standing.js) reads — so a kill's own
unlock-check beat read the pre-kill count (sim-holdbeat-a Q2,
proven on 99101 d134). The fix moves the KILL ATTRIBUTION block
(log push with its dedupe + `waveKillByChannel` counter,
byte-identical) to BEFORE the `checkWaveUnlockBeat()` call, with an
ORDER comment explaining why. NOT touched: gates, win prices, deed
numbers, veteran demand numbers, ledger scoring, the companion-kill
beat, codex/teaching channels, or any other `checkWaveUnlockBeat`
call site. Ledger scoring (`scoreLedgerKill`) does not read
`waveKillLog`; `companionKillBeat` takes its arguments directly;
dedupe is order-independent (a pyrrhic kill already logged by
`recordPyrrhicKill` is still deduped) — all three verified by the
proof tests, not assumed.

Probe calibration found en route (worth recording): one
`recordWaveKill` call drives TWO `checkWaveUnlockBeat` calls — the
kill's OWN check inside `recordWaveKill`, and a second check from
the progression deed wrapper (`recordDeedFight`) AFTER
`recordWaveKill` returns, when the log is pushed either way. That
is also why the artifact survives in live play: the pre-credit
first check consumes the weekly beat slot (`_standingDeferBeat`
day stamp), so the post-credit second check stays silent. The
proof test asserts on the FIRST check.

## Leg 1 — DECIDING (fixture): PASS via the preregistered fallback

99101 does NOT reproduce the holdbeat-a d134 case at this anchor —
on BOTH legs (baseline and fixed): 105 days, village-lost, 0 wave-4
kills, no d134 kill-day hold beat. The anchor moved since
holdbeat-a (game changed in between: win-planning, table, and
villager-agency work landed), and the mode string is just a
manifest label, so this is anchor drift, not a driver difference.
Per the prereg, the fixture leg therefore falls back to the
deterministic proof test as the deciding evidence — and the pilot
band itself supplied a live kill-day hold beat anyway (see below).

- Proof: scripts/test-holdbeatfix-20261104.js — 10/10 PASS on the
  fixed code, and RED on baseline code at exactly the right
  assertion ("wild kill entry present at unlock check"). Paths
  covered with no behavior change except beat-read order: player
  kill, villager field kill (wild), companion kill, pyrrhic path
  (exactly one log entry), duplicate call (one entry, counters
  still count the call — pinned existing behavior),
  `_attrKills === false` (no entry, check still runs, no crash).
  Counters/ledger/channel side effects pinned on the wild path.
- Live corroboration in the wild (pilot seed 99802, day 57):
  owen_smith's wave-3 redactor kill completes the wave-4
  readiness veteran bar (demand 1). BASELINE transcript that day:
  hold beat "The next act is not for strangers. The village must
  be ready to FIGHT the Final Draft — blood your fighters (0 of 1
  veterans)" AND the wave-4 release beats, same day — the System
  says "not ready" and "opens" in one breath. FIXED transcript
  that day: the two release beats only; the stale hold beat is
  gone. Gate reads on the kill's own checks move 99 (held) → 105
  (released). The release itself is unchanged and same-day on
  both legs — the fix removes a self-contradicting line, it does
  not move the door.

Leg 1: PASS (fallback proof + live wild case).

## Leg 2 — NEUTRALITY (pilot): PASS, all clauses

Seeds 99801–99808, competent policy verbatim, 140d death-aware,
identical seeds both legs, driver scripts/holdbeatfix-driver-
20261104.js (holdbeat instrument reused verbatim), per-seed JSON
in evidence/2026-11-04/perseed-holdbeatfix-b/.

| seed | base days | fixed days | base end | fixed end | base starv | fixed starv |
|------|-----------|------------|----------|-----------|------------|-------------|
| 99801 | 78 | 78 | lost | lost | 0 | 0 |
| 99802 | 85 | 85 | lost | lost | 0 | 0 |
| 99803 | 86 | 86 | lost | lost | 1 | 1 |
| 99804 | 27 | 27 | lost | lost | 3 | 3 |
| 99805 | 50 | 50 | lost | lost | 6 | 6 |
| 99806 | 29 | 29 | lost | lost | 3 | 3 |
| 99807 | 52 | 52 | lost | lost | 1 | 1 |
| 99808 | 140 | 140 | survived | survived | 0 | 0 |

Cost bar (prereg clauses, all PASS):
- (a) TOTALS: fixed starvation 14 ≤ baseline 14 + 2. PASS.
- (b) ARM-ONLY (per-seed excess Σ max(0, fixed−base)): 0 ≤ 2. PASS.
  Established same-seed same-day matched numbers (scale-costbar
  definition, reported alongside, not re-scored): matched 14,
  armOnly 0, controlOnly 0 → B3 armOnly ≤ controlOnly + 2 holds.
  The prereg's (b) is the stricter reading; both pass.
- (c) MEDIAN: fixed 65.0 ≥ 0.8 × baseline 65.0. PASS (identical).
- (d) NO NEW FAILURE CLASS: no new death-cause string, no new
  endReason in the fixed legs. PASS.
- (e) NO SEED FLIP: no seed changes survived/lost category. PASS.
- (f) Instrument errors: 0 on all 16 pilot legs (+ 2 fixture legs).
  PASS.
- Trajectory check: 7 of 8 seeds byte-identical after stripping
  hold-beat numbers (0 diffs); 99101 fixture also 0 diffs. The
  99802 diffs decompose exactly: fixed = baseline minus the one
  stale defer4 hold beat (standingLines equal after removing hold
  lines; beatEvents equal after removing hold beats), plus the 3
  kill-moment gate reads 99 → 105; ZERO daily-snapshot diffs,
  ZERO death diffs, ZERO kill-content diffs. The remaining diff
  entries are seq-number cascades from the one removed line.

Balanced panel (§15, supporting instrument, capable policy —
NOT competent verbatim, stated in the prereg): panel BEFORE on
the baseline anchor and panel AFTER on the fixed commit, same 8
seeds, 140d, both valid (sourcesStable true, neutrality proof
match true, 0 warnings, 0 observer errors). Per-seed panel rows
are IDENTICAL before/after (days, won, national, endReason on all
8). Compare decision: `review_required` — INVESTIGATED, not a
harm signal: every paired delta is exactly 0, and the decision
rule (scorecard: review iff any metric status is outside
{descriptive, no_material_signal}) fires only on coverage
statuses — 'insufficient' luck metrics (trap 3/8, snare 6/8, pit
2/8 pairs) and 'not_observed' (hunt/fishing luck 0/8) — on an
8-seed pilot that is not confirmation-sized. No metric moved.
The panel therefore corroborates neutrality; it does not block
GO once explained, and the deciding numbers remain the driver
legs above.

Leg 2: PASS.

## Verdict — GO

Both prereg legs pass: the ordering fix does what it names (a
kill's own beat counts the kill, proven by probe and by a live
wild case), and the pilot shows zero cost (identical survival,
starvation, outcomes; one self-contradicting line removed).
Recommendation to the coordinator: merge bafacaa98 via --ff-only
(pending ship). No gate/price/deed change rides along.

## Reachability + wall numbers

Driver legs (competent, 8 seeds, both legs identical): wins 0/8,
national 0/8, table 0/8, wave-5 unlocks 0/8, wave-5 faced 0/8,
wave-5 releases 0/8, median survival 65d, max 140d. Wave reach:
wave 4 unlocked on 4/8 seeds (99801, 99802, 99803, 99808), wave 3
on 3/8, wave 2 on 1/8 — but wave-4 KILLS 0 on all 8 seeds both
legs, so no village banks a living veteran at all. Panel legs
(capable policy, same seeds, both panels identical): table win
rate 0.5 (4/8), national access 0.25 (2/8) — policy difference,
not an arm difference; the arm moves nothing on either policy.
SCALE WALL: national 0 / table 0 / wins 0 (driver legs), wave
4–5 unlocks 0 wave-5, median survival 65d. The wall stands; this
arm never claimed to move it — it removes a narration bug on the
road to it.

## Village assessment (plain words)

These villages die young and unproven. Half are gone within two
months; only one of eight lives to the 140-day horizon, and even
it never kills a wave-4 beast — the village that survives longest
still has no veteran to show for it. Death is mostly fighting:
villager combat and plain combat are half of all deaths, with
expeditions and the wild taking most of the rest; starvation
takes 14 villagers across the band but kills no village on its
own. Nobody reaches the regional table, nobody sits, nobody wins.
What the village looked like on its best day: 99808 alive at day
140, wave 4 open, still hearing the System say "0 of 2 veterans"
at day 133 and day 140 — and those two beats are TRUE (no
wave-4 kill ever happened), so the fix rightly leaves them alone.
The one thing that changes is the day the village DOES earn its
veteran: the System no longer tells it "not ready" in the same
breath as opening the door.

## Sense test (transcripts read and judged)

1. 99802 d57 BEFORE (baseline): hold beat "not ready to FIGHT
   the Final Draft — blood your fighters (0 of 1 veterans)"
   followed the same day by "Wave 4 talent has been released.
   The Mirror Draft opens." As a player this reads as the System
   contradicting itself mid-scene — it cannot both hold the door
   and open it. AFTER (fixed): the release beats alone. Coherent:
   the kill earned the veteran, the door opened, nothing argues
   with itself.
2. 99808 d133/d140 hold beats (both legs, unchanged): "The fifth
   draft stays in the wings. It wants a village that can fight —
   blood your fighters (0 of 2 veterans)." True on both legs —
   the village genuinely has no wave-4 killer — and the fix
   correctly does not touch them. A player hearing these knows
   exactly what is missing and why the draft stays shut.
3. Villagers act like people: no new dialogue or behavior was
   introduced, and none changed — daily snapshots, deaths, and
   kill contents are identical between legs, so nothing robotic
   was added or removed. The only fiction change is the one
   stale line disappearing.

## Metric review (§14 — no in-run re-scoring)

- No metric was re-scored. GO was judged exactly as
  pre-registered: fixture fallback clause invoked for the 99101
  non-reproduction (reported, not papered over with another
  seed); pilot clauses (a)–(f) all pass as written.
- Judge note: the prereg's arm-only definition (per-seed excess)
  is stricter than the established same-seed same-day matched
  definition (scale-costbar); both are reported and both pass,
  so the choice does not affect the verdict. The established
  definition's two bars collapse to the totals bar (matched
  terms cancel), which is why the prereg's per-seed excess is
  the binding one.
- Panel note: the panel's `review_required` decision is a
  coverage artifact (insufficient/not_observed luck metrics on
  an 8-seed pilot), not a harm signal — every paired delta is 0.
  Future preregs using this panel should state this decision
  rule up front so a zero-delta `review_required` is not
  mistaken for a regression.
- Instrument note: the trajectory diff's seq cascades after a
  removed beat line are index-shift artifacts; the
  remove-the-line sequence comparison is the correct check and
  is reported above. The `standingLines`/`beatEvents` strip in
  the analyzer removes hold-beat NUMBERS but not hold-beat
  PRESENCE — presence differences are the finding here, and
  they are reported as such, not stripped away.

## Proof and landing

- Proof: scripts/test-holdbeatfix-20261104.js — 10/10 PASS
  (4 pure analyzer tests + 6 live ordering/path tests). Live
  stage is RED on baseline code at the deciding assertion.
- Targeted neighbors green on fixed code: test-holdbeat-
  20261104.js 6/6, test-killbeat-20261019.js 19/0,
  test-killbeat.js 24/0, test-gap-w1-fieldbeat.js 4/0.
  test-attr-20261013.js fails at SETUP (Game.fieldFight is not a
  function in its harness load) before reaching any kill code —
  an independent pre-existing harness drift, not reachable by a
  block move inside recordWaveKill; reported, not hidden.
- check.js --quick (full green list, run on fixed code): 281
  passed, 9 failed in 1172s. The output was piped through
  `tail -15`, so the 9 failing test names were NOT captured in
  the surviving output (only a racks-voice detail from the last
  test, unrelated to kill ordering). This is a reporting gap,
  not a verdict gap: the arm's own proof + targeted neighbors
  are green, and the coordinator re-runs suites at merge. The 9
  failures are NOT claimed as pre-existing without names — the
  coordinator should confirm them against the merge-time suite
  run before shipping.
- Arm commits on branch sim-holdbeatfix-b (coordinator merges
  via --ff-only; no push, no bump, no live verification):
  - 211f027c0 sim-holdbeatfix-b prereg (before any scored seed)
  - 01d10d6c3 sim-holdbeatfix-b driver + pilot analyzer +
    pure-stage proof 4/4
  - bafacaa98 sim-holdbeatfix-b ordering fix: waveKillLog entry
    before unlock check + proof 10/10
  - (this landing) sim-holdbeatfix-b pilot + fixed legs +
    panels + evidence
- Files: prereg + evidence in evidence/2026-11-04/
  sim-holdbeatfix-b*.md; per-seed JSON in
  evidence/2026-11-04/perseed-holdbeatfix-b/ (18 files: 99101 +
  99801–99808 × baseline/fixed); scripts
  holdbeatfix-driver-20261104.js, holdbeatfix-analyze-20261104.js,
  test-holdbeatfix-20261104.js; logs holdbeatfix-baseline.log,
  holdbeatfix-fixed.log; pilot compare
  holdbeatfix-pilot-compare.json; panel artifacts
  holdbeatfix-panel-baseline.json.gz,
  holdbeatfix-panel-fixed.json.gz, holdbeatfix-panel-compare.md,
  holdbeatfix-panel-compare.json. Panel working dirs (cases
  cache) stay OUTSIDE the repo in goal hidden_files
  panel-holdbeatfix-b/ (regenerable, not committed).
- Index-clobber note: safe-commit.sh left a bogus main-index
  state after all three commits (staged deletions once, stale
  pre-fix blobs once); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status` empty +
  `git diff HEAD` empty. The commits themselves were always
  correct (verified with `git show --stat`).
- Worktree state at handoff: only committed work; no uncommitted
  leftovers (verified before reporting). Stashes seen in this
  worktree (gap-route, region-wave1-southasia) belong to other
  branches and were NOT touched.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence).

## Findings for the coordinator (append to sim-findings.md — NOT edited here)

- [open] 2026-11-04 — hold-beat read order FIXED — the
  `recordWaveKill` ordering fix (log entry before unlock check)
  is proven by probe + a live wild case (99802 d57 defer4 beat)
  and passes the neutrality pilot with zero cost. Ready to
  merge (bafacaa98). (sim-holdbeatfix-b evidence)
- [open] 2026-11-04 — 99101 anchor drift — holdbeat-a's d134
  kill-day hold beat does not reproduce at anchor 02158dbea
  (99101 now loses d105 with 0 wave-4 kills); long-lived seed
  cases need re-finding per anchor, not citation across
  anchors. (sim-holdbeatfix-b evidence)
- [open] 2026-11-04 — deed-wrapper second unlock check — every
  `recordWaveKill` also triggers a post-credit unlock check via
  the progression deed wrapper; the weekly beat cadence is why
  only the first (pre-credit) check's beat is ever heard.
  (sim-holdbeatfix-b evidence)
- [open] 2026-11-04 — panel review_required on zero deltas —
  balance-panel compare returns `review_required` on
  insufficient/not_observed luck-metric coverage even when
  every paired delta is 0; preregs should state this rule up
  front. (sim-holdbeatfix-b evidence)
