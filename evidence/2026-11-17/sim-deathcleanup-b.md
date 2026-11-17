# sim-deathcleanup-b — BUILD GO (adoption closeout)

Run: fleshout-loop-b-20261117T1030Z (Loop B), axis winnability chain,
arm sim-deathcleanup-b — BUILD: death cleanup in `win-plan.js` (tracker
blank #1, the named lever from sim-deadplan-b DIAG GO/COSTLY).
Branch `sim-deathcleanup-b` (worktree `~/workspace/worktrees/sim-deathcleanup-b`).
Verdict: **BUILD GO — direct fix, NO env gate.** Lands as-is; the ship
call from the frozen prereg is taken (no regression on any bar).

## Adoption

STALE-LOCK RECOVERY at run start: the 0830Z Loop B run died before
closeout. Its lock (created 08:30:33Z, 2h old) and tree heartbeat
(sim-deathcleanup-b, 09:06:53Z, 84 min stale; last file write ~09:08Z)
both fail the 15-minute guard; no writes under 15 min old in the tree.
Lock deleted, this run's lock + claim written, dead claim retired to
.DEAD at closeout. Loop A fleshout-20261117T0915Z live on
sim-planignite-fix-a adoption (heartbeat 10:20Z, fresh) — NOT touched.

What the dead run left: 4 worker commits on the branch (prereg,
instrument, lever, correction), the 8+8-seed paired sweep complete,
the before/after analysis JSON written, the BEFORE panel complete (64
cases), check-quick run (330 passed / 10 failed), the AFTER panel never
started (0-byte logs). What it never did: no coordinator evidence file,
no verdict, no merge. This run verified the work, finished the panel,
judged against the frozen prereg, and landed it.

Base at arm start: master `21e7b750a`. Rebased clean onto master
`7328a88fa` (journey-succession r230 + journey-establishment r231, zero
file overlap with the branch); proof re-run 42/42 on the rebased tip
`19774f970`. Master moved again under this run (Loop A landed planignite-fix-a
PILOT GO a61f03d22 + coordinator evidence 9be3676d8, then a batch-ship
version bump e390dff60). Second rebase onto master e390dff60 was
clean (only win-plan.js overlaps — planignite's `planfixOn` +
HavenTick-init hunks vs this arm's `winPlanOnVillagerDeath` method,
disjoint regions); new tip `1f3187fc2`. Proof re-run 42/42 on the new
tip; the planignite proof test was also re-run on the combined tip
(see Infrastructure). The after-panel ran on the first-rebased tip;
the second rebase adds no src/ change except planignite's env-gated
(default-OFF, inert with PLANFIX unset) code, so the panel comparison
still judges only the deathcleanup effect.

## The fix, in plain words

A villager starts a win-plan (gear up, gather a party, walk out and
hunt the beasts the village needs dead). The villager dies. Until now
the plan did not die with them: the only `delete v.winPlan[vid]` in the
code was the table-active case, and there was NO death cleanup — so
dead villagers' plans lingered in the census for weeks, and living
holders carried dead companions in their party lists. The fix deletes
the dead villager's plan at the moment of death and purges them from
every living holder's party; if the purge empties a living holder's
party while they are out hunting, their plan falls back to finding a
new companion instead of sitting at "hunt" with nobody beside them.
Hooked at the two places death becomes final: the roster-removal choke
point (after the phoenix early-return, so a death the phoenix holds
does not clean a living villager's plan) and the turn-based fight death
funnel (which bypasses roster removal entirely). A CORRECTION commit
landed inside the arm: the first version called `stateOf`, which
materialized `winPlan={}` and ignited the plan system in sleeping
villages (seed 103237: first death day 15, first plan day 16, diverged
day 18 with zero cleanups); the method now uses a non-creating read,
with regression checks in the proof test.

## Prereg + bars (frozen, evidence/2026-11-17/sim-deathcleanup-b-prereg.md)

Band 103231–103238 (fresh, verified at arm start), 150d, competent
verbatim (policy sha `df9b7dff4de4`), recorder ON both legs. GO iff all
of bars 1–4 hold. The instrument reuses the deadplan driver/analyzer
unchanged; the analyzer got one correction commit (betrayal.js added as
a sanctioned caller of the cleanup).

## Before / after (identical seeds, 8+8)

| Bar | Control (pre-fix) | Armed (post-fix) | Pass? |
| --- | --- | --- | --- |
| 1. Armed leg clean | — | slot holder-days **0**, dead-holder census rows **0** / 897, `deathCleanups` **15** fired, analyzer verdict NOISE-ONLY | YES |
| 2. Control reproduces defect | slot holder-days **21**, dead-holder census rows **495** / 1347, analyzer verdict COSTLY | — | YES |
| 3. Cost bars (band totals) | launches 85, wave-4 kills 21, starvation deaths 6, median survival 145.5d | launches 85 (Δ0, bar ±2), wave-4 kills 19 (Δ−2, bar ±4), starvation deaths 5 (Δ−1, bar ±3), median 149.5d (Δ+4, bar ±10) | YES |
| Drift smoke (D3) | 0 drift seeds: 4 seeds byte-identical between legs, 4 diverge on/after first death day (d7/d9/d72/d15) | | YES |
| Proof | `scripts/test-deathcleanup-b.js` **42/42** on the rebased tip (incl. D1 determinism + 150d live run: cleanups fire, 0 dead-holder rows, 0 stale refs) | | YES |
| Panel (§15) | compare `deathcleanup-b-panel.md`: decision **review_required**, no metric at regression status (see investigation below) | | YES* |

\* Bar 4 as written demands `no_material_signal` or an investigated
material signal. The compare returned `review_required` with NO
material signal: every `regression_watch` row is a ≤1-seed delta whose
95% exploratory interval includes zero (capable day-60 survival
−0.0625; village deaths/run +3.3, interval −7.1 to +13.1; named-class
access −0.0625; socialite player deaths +0.375; winseek player deaths
+0.125, village deaths +1.06). Table win/entry/sitting rates are
IDENTICAL on all four policies (capable 0.875 both legs; others 0 both
legs); national scale access is identical or up (capable 0.75 → 0.875);
community loss identical everywhere. The paired competent legs point
the other way on deaths (567 armed vs 574 control) — the panel's
capable deaths/run watch flag is seed-set noise, not a lever effect.
No win-rate movement in either direction. Bar 4 is judged PASS on the
investigation, not on the label.

Wall numbers (both legs — the scale wall is unchanged by this fix, as
expected for a hygiene BUILD):

| | Control | Armed |
| --- | --- | --- |
| national by standing (≥200) | 2/8 | 2/8 |
| national by scaleRank | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave-4 reached | 7/8 | 7/8 |
| wave-5 reached | 2/8 | 2/8 |
| wave-4 kills | 21 | 19 |
| wave-5 kills | 4 | 4 |
| median survival | 145.5d | 149.5d |
| deaths | 574 | 567 |

Per-seed: armed clean on all 8 (0 dead-holder rows each); control
defect concentrated on 103231 (63 dead rows), 103232 (19), 103235
(261), 103236 (149), 103238 (3); 103233/103234/103237 defect-free on
both legs (no plans to clean — armed `deathCleanups` 0 there, matching).
All 16 per-seed files parse; 0 instrument errors; validity clean.

## Sense-testing (mandatory, prereg §Sense-testing)

CONTROL leg — the eight dead holders whose plans lingered ≥30 days:

- 103231 **Arlo Silverman**, died d11 (Static), plan at `hunt`, 32
  dead rows to d42 (village lost).
- 103231 **Vikram Traore**, died d11 (a wound that wouldn't close),
  plan at `party`, 31 rows to d42.
- 103235 **Gurnoor Jadhav**, died d9 (Flashbulb Moth), plan `gear` →
  `hunt`, party `[Harald]`, 79 rows to d87 (village lost).
- 103235 **Harald Haaland**, died d37 (The Big Beast), plan `hunt`,
  party `[Gurnoor]` → `[Aki Tanaka]`, 51 rows to d87. Gurnoor's plan
  names Harald and Harald's names Gurnoor: two dead villagers carrying
  each other as companions for 50 days.
- 103235 **Isaac** (dockworker), died d41 (monster), plan `party` →
  `hunt`, party `[Diana Osei]`, 46 rows to d87.
- 103236 **Adil Mamyrbekov**, died d72 (the wild), plan `party`, 79
  rows to d150.
- 103236 **Lucia Huaman**, died d81 (the arena), plan `party` →
  `hunt` (target `chorus_line`), party `[Adil Mamyrbekov]` — a dead
  holder's party listing another dead villager — 70 rows to d150.

No vetSays line on either leg treats a dead holder as still planning:
0 dead-as-planning lines on the control leg (the one plan-ish line
after a death is a combat warning, "Your party: just you"), 0 on the
armed leg. The defect was silent in talk — plans lingered in data,
never voiced — which is why it took a census to see it. The fix
removes the silent rot, not a voiced behavior.

ARMED leg — the fallback works and re-seeking works when a companion
is available: 5 hunt→party fallbacks fired on the purged companion's
death day (103235 Harald d9 on Gurnoor's death; Aki Tanaka d37 on
Harald's; Emma Larsen d70 on Diana's; 103236 Lucia d72 on Adil's;
103238 Ines Duarte d141 on Theo's). Two re-gained a party within days
and advanced back to `hunt` (Harald with Emma Larsen d12; Aki with
Diana Osei d38). Three did not re-gain before dying or run end — Emma
died d74, Ines was still at `party` at d143, and Lucia sat at `party`
for **52 days** (d72–d124) without finding anyone before dying in the
wild. That 52-day wait is a companion-pool observation, not a failure
of this fix (filed as a finding).

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Control leg reproduced the deadplan defect on this fresh band (bar
  2: COSTLY, 495/1347 dead rows) — the band carried the defect.
- No death bypassed both hook sites: 0 dead-holder census rows on the
  armed leg across 897 rows; no deaths-array row without a cleanup
  where a plan existed.
- The stage fallback fired 5× in the armed leg; 2/5 holders re-sought
  a companion and returned to `hunt` within 1–3 days.
- The TB hook fired in fixtures (proof 42/42 incl. TB-hook kills);
  the corpus does not tag hook source, so TB-hook firing in live sims
  is unverified — fixture-proven only. No TB-death census anomaly
  appears on the armed leg either way.
- 150d was the right horizon: the defect's longest linger (79 rows)
  needs the full run to show, and the cost bars separated cleanly.
- The panel agreed with the paired legs on the judged quantities
  (table/wins/national identical or up); its `regression_watch` rows
  are noise against the paired-leg direction on deaths.

## Infrastructure

- WRITE FLAP hit twice during this adoption: the lever panel (after)
  died at 12/64 cases ~10:44Z and again at 28/64 ~10:54Z, both inside
  flap-watch EPERM windows (10:42:35Z, 10:53:36Z; writes refused, git
  ref updates failing). The panel resumes from cached cases, so the
  third attempt completed 64/64 (28 cached) at ~11:0xZ. The
  pristine-master attribution tree registration also died in the flap
  ("unable to write file tools/mobile-sim.html / version.json",
  `Could not reset index file`) — abandoned; attribution was done
  instead by running the failing tests directly in the pristine main
  tree (they write nothing — verified by grep).
- `worktree-reap.sh` at pre-flight SKIPPED (registry lock held by
  another reaper run, consecutive skips: 2) — no cleanup this run.
- check-quick on the armed tree (dead run): 330 passed, 10 failed in
  1086s. Attribution (this run, pristine master vs rebased tip):
  ladder-bundle, measurement-proof-update ("Proof source inputs are
  not current"), measurement-workflow, phone-frame-proof all fail
  IDENTICALLY on pristine master — pre-existing stale-proof/control
  failures, not this change. measurement-cache-flags failed 3/4 on the
  armed tree but passes 4/4 on pristine master AND 4/4 on the rebased
  tip — the documented box-load artifact, not the change. The five
  120s timeouts were re-run individually on the rebased tip and all
  complete: living-garden 8/8, one-person-army 7/7, trust-observer
  6/6, capable-bot 40/40, synergy-stall exit 0 (diagnostic script, no
  assertions — it completes rather than timing out). None of the 10
  check-quick failures is attributable to this change.
- Telemetry deviation check REFUSED recorder-corpus input (all 8 armed
  rows carry top-level anchorCommit — sweep recorder rows, not runs),
  same documented refusal as deadplan and the recent rounds. Baseline
  NOT rolled.

## Ship call

Direct fix, NO env gate — the frozen prereg's ship call, taken because
bars 1–4 all pass with no regression anywhere (paired legs, panel,
proof). Merged locally, pending ship (the batch ship loop owns version
bumps, pushes, live verification).

## Findings appended

- [open] 2026-11-17 — companion pool — Lucia Huaman (seed 103236,
  armed leg) sat at `party` stage for 52 days after her companion
  died, never re-gaining a party before dying in the wild; 2/5
  fallback holders re-partied within days, so the pool exists but is
  thin or slow on this band (sim-deathcleanup-b).
- [open] 2026-11-17 — win-plan lifecycle — non-death removals
  (`'fled'`, `'splinter'`, `'exiled'`) do NOT fire the death cleanup
  by design (prereg froze death-only); leavers' plans linger the same
  way the dead's did — a separate arm, not this fix
  (sim-deathcleanup-b).

## Evidence artifacts

- Prereg: evidence/2026-11-17/sim-deathcleanup-b-prereg.md
- Analysis: evidence/2026-11-17/deathcleanup-b-analysis.json
- Corpora: evidence/2026-11-17/perseed-deathcleanup-b-{control,armed}/
  (8+8 valid JSON, 0 instrument errors)
- Panels: evidence/2026-11-17/deathcleanup-panel-{before,after}/
  (64 cases each), compare evidence/2026-11-17/deathcleanup-b-panel.md
- Proof: scripts/test-deathcleanup-b.js (42/42 on rebased tip)
- Check-quick: evidence/2026-11-17/deathcleanup-check-quick.log
  (dead run, armed tree; attribution in this file)
