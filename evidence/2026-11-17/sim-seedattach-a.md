# sim-seedattach-a — EVIDENCE (RECORDER FIX GO, finding #2523)

**Arm:** sim-seedattach-a · **Loop A run:** fleshout-20261118T0330Z · **Axis:** scale-onramp
**Type:** RECORDER FIX (scripts-only; no src/js change, no game change, no balanced panel, no seed band spent, no new sims).
**Branch:** `sim-seedattach-a` · **Worktree:** `~/workspace/worktrees/sim-seedattach-a`
**Base at arm start:** `4e9fdda99` (includes the #2508 fix `eb6ff8a27`) · **Prereg:** `evidence/2026-11-17/sim-seedattach-a-prereg.md` (committed `e426c2ed3` before any probe).
**Proof test:** `scripts/test-seedattach-a.js` — **74 passed, 4 failed** (the 4 are pre-existing stale statics from sibling landings, named below; all 6 new #2523 checks green).
**Verdict: RECORDER FIX GO — PATCH.** 4 closes mislabeled (2 distinct instances × 2 legs); the patch corrects exactly those 4 and moves nothing else.

## The mislabel, in plain words

Two plans in the frozen villages ended because their holder died — and the
record said "plan deleted" instead. Mateo Alvarez carried a plan that named
nothing for 89 days, met beast after beast and bounced off every one, and
died in the wild on day 139. Diana Osei was passed from party to party as a
companion, her plan never naming a beast, and died of a wound that wouldn't
close on day 47, the day after her first wave-4 bounce. In both cases the
plan's story ended with the death. The old record said the plan was deleted.
It wasn't — the plan was never deleted at all.

## The mechanism — and the prereg's hypothesis, corrected

The prereg hypothesized the #2508 mechanism verbatim: the census stream stops
when the plan is deleted on death, so no row exists at `runEndDay + 1`. The
data says something else, and it matters. **The seedattach census does NOT
stop on holder death.** It keeps emitting a row for the dead holder's plan
every day to the run horizon, with `holderAlive: false` (Mateo: days 140–150;
Diana: days 48–150, the node frozen at Haven (4,4), health stuck at 100 — a
dead holder's paper plan). Both epochs' runs end at day 150 because the
150-day run ends there, and there is no day 151 for anyone. The old close
logic reads exactly one row — the row at `runEndDay + 1` — and when it finds
nothing it says `plan-deleted`. At the horizon, "nothing" means "the run
ended", not "the plan was deleted". The death was recorded twice over — in
the deaths array, and in the run's own rows (`holderAlive: false` from the
day after the death) — and the close logic looked at neither: it never
consulted deaths, and it never scanned the run's own rows.

So `plan-deleted` was wrong twice over for these two closes: the plan was
never deleted (rows prove it), and the epoch ended with a death (deaths prove
it). The patch applies the prereg's frozen scoped deaths-first read, which
does not depend on the mechanism: a villager death inside the close window
`[epochStartDay, runEndDay + 1]` closes the epoch `holder-died` where the
`runEndDay + 1` row is missing or shows the holder dead.

## Before / after — frozen corpora (identical seeds, fixed classifier vs the committed before-oracle)

The frozen analysis JSON was NOT regenerated — it stays as the before-oracle
the proof test diffs against. Counts are per-leg instances (10 per leg; the
two legs are identical trajectories, so 2 distinct instances × 2 legs).

### The 4 flips

| Leg | Seed | Holder | Run | Death (deaths array) | Before → after |
| --- | --- | --- | --- | --- | --- |
| main | 100874 | mateo_alvarez | `mateo_alvarez\|run\|91` (runEnd 150) | day 139, "the wild" (player:true — the scholar himself) | `plan-deleted` → `holder-died` |
| main | 100876 | diana_osei | `diana_osei\|run\|46` (runEnd 150) | day 47, "a wound that wouldn't close" | `plan-deleted` → `holder-died` |
| baseline | 100874 | mateo_alvarez | same instance | same death | `plan-deleted` → `holder-died` |
| baseline | 100876 | diana_osei | same instance | same death | `plan-deleted` → `holder-died` |

### closeKind tallies per leg

| Leg | plan-deleted before → after | holder-died before → after | stage-left-hunt:party | stage-left-hunt:standing |
| --- | --- | --- | --- | --- |
| main | 2 → 0 | 0 → 2 | 7 → 7 | 1 → 1 |
| baseline | 2 → 0 | 0 → 2 | 7 → 7 | 1 → 1 |

**Every `plan-deleted` close in the corpus was a mislabel.** There is no
genuine plan-deleted close on either leg: the only two closes that read
`plan-deleted` are the two holder deaths above. (The Carlos natural
experiment's genuine deletion — old plan deleted, fresh plan opens day 127 —
never surfaces as a close here: both of Carlos's epochs closed
`stage-left-hunt:party`, the plan having left hunt before it was deleted.)

### What did NOT move

- Buckets and subs: identical on both legs (haven-born-never-seeded 9,
  companion-inherited 1, seeded-then-lost 0, unknown 0; subs byte-identical).
  The bucket/sub classification never reads `closeKind` — verified by code
  read and by the re-run diff.
- The other 16 closes: identical, including all 14 `stage-left-hunt` closes.
- Wall numbers (national / table / wins, wave 4–5, median survival): the fix
  changes no wall number; `closeKind` feeds no wall metric.

## Why the scoping matters — the literal #2508 rule would over-flip

The probe also computed the unscoped (literal #2508) rule: any villager
death at/after the plan's creation day → `holder-died`. It would flip 6
closes per leg (12 total), not 4. The extra 4 per leg are
`stage-left-hunt:party` closes whose holders died 10–60+ days AFTER their
runs ended, while alive and with the plan genuinely back at party stage:

- gen_7q6rr7f (100876, two epochs, runs ended d57/d69) — died day 83 of thirst.
- gen_l9li34v (100876, run ended d53) — died day 109 to the Gavel.
- gen_u9jax0c (100876, run ended d73) — died day 121 in a contest.

Those runs ended because the plan left hunt, not because the holder died;
flipping them would be a mislabel in the other direction. The prereg's
scoped window plus the live-row guard is what keeps them standing, and the
probe proves it: 20/20 closes checked, 4 flipped, 16 unchanged, 0
`run-end` (bounce-only) closes, 0 uncovered (deaths arrays present on all
16 seed files), 0 deaths in the `[creation.day, firstBounceDay)` window on
any close (the creation-day and first-bounce-day anchors agree everywhere).

## Verdict review (which past verdicts move)

- **sim-seedattach-a DIAG-GO — DOES NOT MOVE.** Its verdict rests on the
  bucket decomposition (9/10 haven-born-never-seeded, 1/10
  companion-inherited; "seed-attach cannot help the dominant shape"). No
  bucket or sub moves, so the decomposition and every sentence built on it
  stand exactly. What changes is only the filing of how two epochs ended:
  both were haven-born heard-at-fire plans either way.
- No other arm consumes seedattach `closeKind`: the analyzer is read only by
  the seedattach evidence and its own proof test (the shared churn block
  that #2508 fixed is a different mechanism in different files).

## Proof test (`scripts/test-seedattach-a.js`, 74 passed / 4 failed)

New section 2d (fixtures) + 2e (frozen-corpus diff), per the prereg's proof
plan. Old-code-fails control executed: run pre-patch, fixtures A/B/E and the
corpus diff failed exactly as predicted (`plan-deleted` where `holder-died`
is expected); run post-patch, all 6 new checks green. Guards C/D/F pass on
both old and new code (the patch must not touch them — it doesn't).

- **2523-A** death on `runEndDay`, no row after → `holder-died`.
- **2523-B** death on `runEndDay + 1`, no row → `holder-died`.
- **2523-C** death after the window (day 20) → stays `plan-deleted`.
- **2523-D** live stage-change row at `runEndDay + 1` + same-day death →
  stays `stage-left-hunt:party`.
- **2523-E** corpus shape (false rows to the horizon, no row after) →
  `holder-died`.
- **2523-F** already-correct dead-holder row → stays `holder-died`.
- **Corpus diff:** 20 closes checked against the frozen JSON + the 4 named
  flips; exactly 4 flipped, 16 unchanged; buckets/subs identical per seed;
  per-leg tallies `plan-deleted` 2→0, `holder-died` 0→2; the deaths-array
  evidence for both flips asserted per leg.

The 4 failures are pre-existing stale statics from sibling landings since
the seedattach arm's frozen base — NOT this arm, identical before and after
the patch:

- "anchor: exactly 2 hunt entries in win-plan.js — got 3" and the same in
  villager-brain.js: a sibling landing added second-companion (`cplan2`)
  hunt writes (win-plan.js:657, villager-brain.js:1176). The "exactly 2"
  taxonomy anchor no longer describes the code. Flagged for the
  coordinator (also appended to the findings backlog): the anchor count
  needs a re-read by a future arm; this arm does not re-freeze it silently.
- "competent policy sha is 74a890f0844e — got df9b7dff4de4" (static + live
  run): the competent policy changed under journey landings r127/r128/r140.
  The determinism legs D1/D2 still pass (wrap neutrality is measured on the
  same policy), so this is identity drift, not a behavior break.

## The fix

`scripts/analyze-seedattach-a.js`, close block only: consult `j.deaths`
first — earliest villager death for the holder in
`[creation.day (or firstBounceDay), runEndDay + 1]` — and close
`holder-died` where that death exists AND the `runEndDay + 1` row is missing
or shows the holder dead. Every other branch is untouched, in the same
order. No `closeDay` field exists in this analyzer, so no closeDay moves.
`src/` diff: empty. No game change, no lever, no panel, no seed band.

## Village assessment (plain words)

Nothing about the villages changed — only the filing cabinet, again. Two
villagers' plans ended with their deaths and the record called it a
deletion. Mateo was the scholar himself: his plan was born from fire talk
on day 12, sat nameless for 89 days, and he died in the wild on day 139
still carrying it — the paper plan kept "hunting" for eleven more days with
a dead holder, and the old record filed the whole thing as deleted. Diana
died of her wound the day after her first wave-4 bounce, her plan still
hunting nothing in particular, and the paper plan kept hunting for 103
more days. Now the record says what happened: they died, and the plan died
with them. The villages, the fights, the launches, the wall — all exactly
as measured before.

## Metric review

- The frozen decision rule held exactly as written: PATCH at ≥1 mislabel;
  the probe found 4. No re-scoring.
- **Mechanism correction (prereg hypothesis vs data):** the prereg described
  the #2508 mechanism (census stops when the plan is deleted on death).
  The corpus shows the opposite: the seedattach census keeps emitting rows
  for a dead holder's plan to the horizon. The mislabel's real cause is the
  close logic reading only the single post-run row and treating a
  horizon-absence as a deletion, while never scanning the run's own rows
  (which already carry `holderAlive: false`) and never consulting deaths.
  The frozen rule did not depend on the mechanism — only on the window and
  the row condition — so the rule stands and the patch is the one the prereg
  specified. The correction is recorded here, not re-scored.
- **No panel — by design.** A recorder fix changes no game behavior and no
  sim output; the balanced panel measures game change, so there is nothing
  to panel. The "before/after" here is the re-analysis itself, diffed field
  by field.
- **The frozen analysis JSON still carries the old labels.**
  `evidence/2026-11-15/seedattach-a-analysis.json` is left as committed
  (the before-oracle this proof diffs against). Any arm that re-runs the
  analyzer gets the corrected values; any arm that reads the committed JSON
  reads the mislabeled closes. If the coordinator wants the JSON
  regenerated, that is a one-command follow-up
  (`node scripts/analyze-seedattach-a.js <mainDir> <baselineDir>`) — not
  done here, to keep the before-oracle intact for this proof.

## Disposition: FIX — nothing to revert

Scripts-only. No src/ change, no game change, no lever, no panel, no sims,
no seed band. Commits: prereg (`e426c2ed3`), fix + proof test + this
evidence (to be committed by this run's closeout). Net src/ diff vs base:
zero.

## Files

- Prereg: `evidence/2026-11-17/sim-seedattach-a-prereg.md`
- Evidence: `evidence/2026-11-17/sim-seedattach-a.md` (this file)
- Proof test: `scripts/test-seedattach-a.js` (74 passed / 4 failed, all 4 pre-existing stale statics)
- Fix: `scripts/analyze-seedattach-a.js` (close block only)
- Corpora read (frozen, unchanged): `evidence/2026-11-15/perseed-seedattach-a-competent/`, `perseed-seedattach-a-tableseat-nowait/`
- Before-oracle (frozen, unchanged): `evidence/2026-11-15/seedattach-a-analysis.json`
- Probe scratch (not committed): `/tmp/probe-seedattach.js` (+ output `/tmp/probe-seedattach.out`)
