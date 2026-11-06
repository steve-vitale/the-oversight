# sim-gorgeharness-a — verdict GO (Loop A, 2026-11-06)

Worker: sim-gorgeharness-a (Loop A, food-economy / narration).
Run: fleshout-20261106T1115Z, axis food-economy, arm
sim-gorgeharness-a. Assignment: lingerer-gorge follow-up with the
REVISED metric (firing-time position, any phase, any away night),
then build the already-reasoned gate/relay fix (follow-up to arm
sim-lingergorge-a, run fleshout-20261106T0821Z). Prereg:
evidence/2026-11-06/sim-gorgeharness-a-prereg.md (committed BEFORE
any judged sim). Before leg on unfixed code; fix committed
7c0b27aba [needs-eyes]; after leg run by the dead worker through
seed 49038 and finished by the main session (seeds 49039–49040,
exit 0) after the 1115Z coordinator timed out at 7200s; closeout
finished end-to-end in the main session. Seeds 49001–49040, 60
loop-days, death-aware, policies
bankfood(warmed(woodcarry(nighttravel))) over competent, env
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1.

## Verdict — GO (every prereg condition holds)

| condition | before | after | threshold | pass |
|---|---|---|---|---|
| Power bar: away linger-endDays | 2 | — | >= 2 | YES (exactly at bar) |
| Power bar: total gorge lines | 83 | — | >= 20 | YES |
| Defect reproduced: away gorge lines | 3 | — | >= 1 | YES |
| Gate: away-delivered gorge lines | — | **0** | = 0 | YES |
| Guardrail (i): at-Haven gorge count | 80 | 80 (1.00x) | >= 50% of before (= 40) | YES |
| Guardrail (iii): trajectory identity (daysAlive) | — | identical on 40/40 seeds | identical | YES |
| Det-gate (17021 ON vs OFF) | — | identical | identical | YES |
| Panel compare decision | — | review_required, **every paired delta exactly 0** | no_material_signal, or signal investigated + explained | YES — explained below |
| B11 relay unit checks | — | green (in 42/42 proof) | green | YES |

## The fix (plain words)

Every night a raider lingers at the treeline, the village loses food
to the gorge — and the game told the scholar about it, even when the
scholar was asleep in the forest miles from home, with no way to see
the treeline and no way to send the sortie the line invites. Now
the nightly report waits: it is only spoken when the scholar is at
Haven. Nothing else changes — the food is still taken, the siege
still ends on its own clock, the sortie offer is still recorded.
The one line that is genuine news — the morning the siege finally
ends — is queued instead of dropped, and spoken when the scholar
comes home to the fire.

## What the numbers say

- The defect reproduced exactly as documented: 3 away-delivered
  gorge lines on the before leg, all in the harness phase the
  morning after a combat-blocked wild night — seed 49003,
  loop-day 44, two lines (The Redactor, 1,400 kcal; The
  Influencer, 730 kcal), and seed 49014, loop-day 28, one line
  (The Grief Counselor, 800 kcal). After the fix: 0 away lines
  anywhere on the band. The same nights on the same seeds deliver
  nothing while away; the at-Haven count is unchanged (80 → 80),
  so the gate suppresses delivery away without silencing the
  gorge itself.
- Away linger-endDays 2 → 0; haven linger-endDays 39 → 39. Total
  linger-endDays 41 → 39 — the 2 that disappear are exactly the
  2 away endDays; every haven endDay still delivers.
- Trajectories are identical on all 40 seeds (daysAlive before =
  after on every seed). The fix consumes no RNG on either path,
  and the corpus proves it: not one seed's survival moved.
- Cross-check: the old marker-based position and the new
  pre-endday firing-time marker agree on atHaven for every gorge
  hit in both legs — 0 disagreements. No line is ungrouped (0/0).
- Drift-off: 0 lines in either leg, away or haven (reported, not
  judged — the ~6-night clock never wins its race on this
  substrate, as the prereg anticipated). The relay is therefore
  judged by the B11 unit evidence, not by the corpus: the proof
  shows the drift-off line queues while away (kind 'raid'),
  delivers verbatim on return, and the queue drains.
- Held volume: the relay queue (pendingHavenNews) evening depth
  is max 7, mean 0.056, IDENTICAL before and after (same 9 seeds
  ever queue anything). The fix adds nothing to the queue — the
  nightly line is gate-suppressed, never queued, by design. The
  end-of-run depth field came back null on all 40 seeds in both
  legs (the driver reads it after the run's Game is torn down) —
  an instrument gap, noted in metric review; the evening series
  is the held-volume evidence and it is unchanged.

Per-seed (away gorge / haven gorge / away linger-endDays |
daysAlive, before → after):

| seed | before | after | days |
|---|---|---|---|
| 49001 | 0/0/0 | 0/0/0 | 60/60 |
| 49002 | 0/0/0 | 0/0/0 | 60/60 |
| 49003 | 2/22/1 | 0/22/0 | 60/60 |
| 49004 | 0/0/0 | 0/0/0 | 60/60 |
| 49005 | 0/0/0 | 0/0/0 | 54/54 |
| 49006 | 0/0/0 | 0/0/0 | 60/60 |
| 49007 | 0/10/0 | 0/10/0 | 60/60 |
| 49008 | 0/0/0 | 0/0/0 | 60/60 |
| 49009 | 0/0/0 | 0/0/0 | 60/60 |
| 49010 | 0/0/0 | 0/0/0 | 60/60 |
| 49011 | 0/0/0 | 0/0/0 | 60/60 |
| 49012 | 0/8/0 | 0/8/0 | 42/42 |
| 49013 | 0/0/0 | 0/0/0 | 60/60 |
| 49014 | 1/10/1 | 0/10/0 | 56/56 |
| 49015 | 0/0/0 | 0/0/0 | 60/60 |
| 49016 | 0/0/0 | 0/0/0 | 60/60 |
| 49017 | 0/0/0 | 0/0/0 | 60/60 |
| 49018 | 0/6/0 | 0/6/0 | 55/55 |
| 49019 | 0/0/0 | 0/0/0 | 51/51 |
| 49020 | 0/0/0 | 0/0/0 | 60/60 |
| 49021 | 0/0/0 | 0/0/0 | 60/60 |
| 49022 | 0/0/0 | 0/0/0 | 60/60 |
| 49023 | 0/0/0 | 0/0/0 | 24/24 |
| 49024 | 0/1/0 | 0/1/0 | 60/60 |
| 49025 | 0/1/0 | 0/1/0 | 60/60 |
| 49026 | 0/4/0 | 0/4/0 | 60/60 |
| 49027 | 0/0/0 | 0/0/0 | 60/60 |
| 49028 | 0/2/0 | 0/2/0 | 59/59 |
| 49029 | 0/13/0 | 0/13/0 | 60/60 |
| 49030 | 0/0/0 | 0/0/0 | 60/60 |
| 49031 | 0/0/0 | 0/0/0 | 34/34 |
| 49032 | 0/0/0 | 0/0/0 | 60/60 |
| 49033 | 0/0/0 | 0/0/0 | 60/60 |
| 49034 | 0/0/0 | 0/0/0 | 60/60 |
| 49035 | 0/0/0 | 0/0/0 | 60/60 |
| 49036 | 0/0/0 | 0/0/0 | 49/49 |
| 49037 | 0/1/0 | 0/1/0 | 59/59 |
| 49038 | 0/0/0 | 0/0/0 | 60/60 |
| 49039 | 0/0/0 | 0/0/0 | 60/60 |
| 49040 | 0/2/0 | 0/2/0 | 57/57 |

## Every away hit, quoted verbatim (before leg)

Seed 49003, loop-day 44, harness phase, scholar away (firing-time
atHaven false; the night of day 43 was a combat-blocked wild
night at the grove):

> 🌙 Night. The lingering The Redactor gorges at the treeline —
> 1,400 kcal gone from the stores. Endure it (they drift off
> within ~6 nights — the gorge is the price), or send a sortie:
> fighters, rations, real risk.

> 🌙 Night. The lingering The Influencer gorges at the treeline —
> 730 kcal gone from the stores. Endure it (they drift off within
> ~6 nights — the gorge is the price), or send a sortie:
> fighters, rations, real risk.

Seed 49014, loop-day 28, harness phase, scholar away (night of
day 27 a combat-blocked wild night at the creek):

> 🌙 Night. The lingering The Grief Counselor gorges at the
> treeline — 800 kcal gone from the stores. Endure it (they drift
> off within ~6 nights — the gorge is the price), or send a
> sortie: fighters, rations, real risk.

After the fix, the same three firings deliver nothing while away.
The same two seeds still gorge at Haven on their other nights
(49003: 22 haven lines before and after; 49014: 10 before and
after) — the siege is unchanged; only the unanswerable invitation
is gone.

## Sense verdicts

- GORGE (gate): reads true. The nightly report is an ephemeral
  report of that night's loss plus an invitation only a scholar
  at Haven can act on. Gating it means a scholar away from home
  hears nothing they cannot answer; on return, the next night's
  gorge line fires fresh if the siege continues. No stale
  nightly report is ever queued (the proof asserts the away path
  queues nothing), so the 20-cap relay is never flooded by a
  6-night stranding.
- DRIFT-OFF (relay): reads true on return. The B11 unit scenario
  shows the one-time line queues while away (kind 'raid') and
  delivers verbatim at the fire on return — "the gorge is over —
  the village outlasted it" stays true on return, because the
  siege ending is a fact about the village, not about the night
  it ended. The queue drains after delivery. No corpus drift-off
  fired to read in the wild, so the unit scenario is the relay
  evidence, as the prereg allowed.
- The fix changes no mechanics: the proof's B9/B10 checks show
  the kcal are still taken and the sortie offer still recorded
  while the scholar is away — the village still pays the gorge;
  only the telling waits.

## Balanced panel (attached)

Before panel: 32 cases (8 seeds × 4 policies), 11 cached jobs.
After panel: 32 cases, 0 cached jobs (fresh on the fixed code).
Compare decision: **review_required** — investigated and
explained, not a material signal. Verified from compare.json:
**every paired delta is exactly 0** across all 4 policies and
all 32 cases — table win/entry/sitting rates, national access,
deaths, living NPCs, pantry, hydration, HP, hunger, gear access,
ability events, all identical to 4 decimal places. No metric
carries a material-signal status. The review_required label is
driven by `insufficient` / `not_observed` statuses on the
luck-percentile metrics (hunt/trap/snare/pit/fishing: 0–4 of 8
pairs observed) — the panel cannot judge those metrics for lack
of data, so it declines to say no_material_signal. That is the
expected shape for a narration-only change with no RNG on either
path: all-zero deltas plus an insufficient-data flag, not a
divergence. Compare files:
evidence/2026-11-06/sim-gorgeharness-a-panel/compare.md and
compare.json.

## Proof

scripts/test-gorgeharness-a.js: **42/42 checks pass** on the fixed
code with the substrate env set (baseline 37/42 on unfixed code —
the 5 reds were exactly the fix acceptance checks: B9 gorge gate
away ×2, B10 empty-pantry gate away, B11 drift-off relay away ×2;
all 5 now green). Det-gate green (17021 ON vs OFF trajectories
identical; 17021 re-pin holds: 60 days survived, 0 stranded).
15003 loop-day-7 gossip anchor reproduces. Without the env the
proof fails fast on the COMPETENT_FEAST=0 requirement — the env
is mandatory, not optional.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The power bar passed exactly at its floor (away linger-endDays
  = 2, the minimum). The defect is rare — 3 lines in 40 seeds —
  so a future gate arm of this shape should pre-register a
  wider seed band or a second defect seed if it wants the power
  bar to mean more than "the defect showed up twice." The bar
  held as written; this is a review note, not a re-score.
- The end-of-run relay-queue depth field
  (pendingHavenNewsEnd) came back null on all 80 legs — the
  driver reads it after the run's Game is torn down. The evening
  depth series covers the held-volume question (max 7, mean
  0.056, identical both legs), but the next driver that promises
  an end-of-run queue count should read it before teardown.
- Panel compare: review_required with all-zero deltas is the
  expected shape for a narration-only change. The next prereg
  for such an arm should pre-register that a review_required
  driven solely by insufficient-data metrics, with every paired
  delta exactly 0, counts as investigated-and-explained — so the
  verdict does not hang on a label the panel cannot give for
  unobserved metrics.

## Wall numbers (carried, NOT re-measured)

This is a narration fix corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct
seeds): wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24.

## Commits (this worktree branch sim-gorgeharness-a)

- 51a3579a3 prereg: revised gorge metric (firing-time atHaven,
  any phase, any away night) BEFORE any judged sim.
- 66aa745e9 revised-metric instrument + driver + proof (no
  src/js); proof baseline 37/42 on unfixed code, 5 reds are the
  fix acceptance checks.
- 7c0b27aba fix [needs-eyes]: gate nightly gorge line at Haven,
  relay drift-off line (narration delivery; no mechanics change).
- After leg completed by the main session (seeds 49039–49040) +
  after balanced panel + panel compare + this evidence file.
