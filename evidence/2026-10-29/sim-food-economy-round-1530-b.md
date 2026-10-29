# sim-food-economy-round-1530-b — coordinator evidence (loop B, 2026-10-29 1530Z)

Run: fleshout-loop-b-20261029T1530Z, axis food-economy (converging).
Loop A live on scale-onramp (1315Z holdsjoin/pickband, NOT touched) -> B worked
food-economy, the second axis. Build lanes live on arrival (build-returns),
gear (build-geartier), staying (build-staying) — NOT touched. Claim written
before any sims; lock + claim deleted at closeout.

## Arm 1 — sim-woodcarry2-b: INSUFFICIENT-DATA (lever reverted, measurement record lands)

Backlog #1423 claimed. Fresh creek band from the blockscreen2 bank
(13025, 13067, 13268, 13276), 30d death-aware legs, OFF (WOODCARRY unset)
vs ON (WOODCARRY=1), detour OFF both legs. New prereg, committed before
any judged leg, promoting episode rescue rate to primary and explicitly
superseding the prior run's evening-share primary: bridging is permanent,
so each rescued episode collapses its remaining evenings and the
evening-share denominator is structurally deflated by success itself
(prior run OFF 11 -> ON 3). Episode = maximal run of consecutive refused
creek evenings on the OFF leg; rescued = villager inside at haven on the
episode's first evening (or bridge already built), no refused creek
evening that day. The prior run's 3/3 was NOT re-scored.

- OFF-leg episodes 7 (bar >= 8 — missed by ONE) -> verdict
  INSUFFICIENT-DATA, not a kill and not a completion. The lever never
  failed: rescue rate 7/7 = 1.000 (Wilson 95% 0.785-1.000, bar >= 0.50).
- Per seed: 13025 OFF 2 episodes rescued 2, inside 26->30; 13067 OFF 1
  rescued 1, inside 28->30; 13268 OFF 3 rescued 3, inside 10->30;
  13276 OFF 1 rescued 1, inside 24->30, village-lost OFF -> survived ON.
- Pooled inside evenings OFF 88 -> ON 120 (+32; all 4 seeds 30/30 inside
  on the ON leg). Secondary evening share 5/5 ON vs 31 OFF creek evenings.
- Guards: unclassified 0/0, recorder errors 0/0, determinism byte-identical
  (ON seed 13067, verified via cmp pre-revert), divergence audit ok on all
  4 seeds (first difference day 2, first lever action day 2), player deaths
  OFF 6 vs ON 1 (sole ON death wild day 24, same lineage as an OFF wild
  death day 20; zero carry-attributable deaths; min pile after an acted
  carry 11, never below the 8 floor), wrapper/driver rescue agreement
  0 disagreements.
- Honesty guard VACUOUS for a second consecutive run: 0 still-refused ON
  evenings, so the lacking-line is unit-proven but still unplayed
  (backlog #1424 stays open).
- Carries: 10 acted, pile-floor skips 4, already-carrying 106, kcal-floor 0,
  canCarry 0; bridges 5 attempted, 5 built, all completed entries.
- Sense: the day-2 carry reads as a person packing ("for the road home...
  12 left for the hearth"); the day-5 bridge evening resolves from the
  engine's repeated refusal line into a played homecoming ("You walk back
  into Haven... glad to see you"); day 18 on 13025 is the already-bridged
  case, played without a stranding.

Why min-n missed — diagnosed, with proof: the census band was banked under
the blocktype driver (no thief grant, no taps), while the judged legs used
the woodcarry driver family (thief ability granted at setup + taps on the
last 5 days, retained for substrate identity with the prior arm). A
scratch-only diagnostic — judged driver with only the thief grant disabled,
seed 13025 — reproduces the census EXACTLY (refused days 14-16, 20-21,
24-30; 18 inside evenings) versus the judged OFF leg (days 16, 18-19;
26 inside). The grant is therefore the proven perturber on 13025; 13067
reproduces under both families, so the loss is seed-dependent, not uniform.
The prereg's caveat covered only tap-day differences and missed the grant
— recorded in the arm evidence as this run's design flaw. No post-hoc seeds
were added to the judged band.

Next run (reported, not built): bank its band under the judged driver
family — or strip the judged driver of the thief grant (and prudently the
taps, neither judged) and re-verify census reproduction seed by seed
before judging. At the judged family's 1.75 episodes/seed, a 6-seed band
clears min-n 8 with margin.

Merged 408978c68 (prereg) / d33907552 (evidence, rebased onto journey r66
+ loop-A pickband, proof re-run by coordinator: T4 fails min-n only,
T5-T11 pass, T12 not-checked without --det files — worker's cmp
determinism check stands). Policy + driver REVERTED per the killed-arm
rule; zero src/js. Tree released, branch deleted.

## Arm 2 — sim-rubbleroute-b: DIAG-GO (measurement only, zero game change)

Backlog #1427 claimed. Question: does the evening detour
(COMPETENT_EVENING_DETOUR=1, scripts/policies/nighttravel.js) walk the
full 12-step BFS path on seed 13224 days 4-5, and should a 12-step night
walk be offered? Seeds 13224 (primary) + 13029 (short-route comparator),
30d legs, detour OFF (control, reproduces census) vs ON.

- Q1 YES, every time: on 13224, all 18 detour evenings walk 12 steps =
  BFS length 12, every step moved, arrival haven (4,4) inside before sleep,
  next morning inside at haven. Policy path = census path minus departure
  node. Cost per walk: 0 kcal and 0 ticks beyond the entry leg (evening
  ticks detour-start -> post-entry = 5 on all 18, exactly the lodge entry
  walk's 5 steps; the entry leg itself bills "Walking 5 squares (10 kcal)").
  Zero combat steps across all 19 detours.
- Q2 offer rate 1.0 on every hop refusal encountered (19 detours / 19
  ON-leg hop refusals, 0 residual refused evenings on either ON leg).
  Re-encounter is the real story: 13224 re-encounters 2/2 OFF-refused
  evenings and then keeps re-stranding — 18 detours in 30 days (days 4, 5,
  7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23, 25, 26, 28, 29) — because
  the rescue doesn't change the daytime loop that sends the villager back
  to the same creek. 13029 re-encounters 1/5: day 19 detours and the
  episode ends (days 20-23 end already at haven).
- Q3 completes, never truncates: 19/19 detours end `completed`, rescued,
  inside before sleep. Zero detour-stopped / nopath / died, zero combat
  interruptions.
- Q4 sense: NO line names the way around. A detour evening reads as
  "Rubble chokes the path." x2, then twelve plain lines ("Travel 1 tile
  to forest floor / creek / thicket / ... / Haven."), then "You walk back
  into Haven." Backlog #1428 ANSWERED: the night away IS marked — as rough
  sleeping ("Sleeping rough means the cold ground", "You settle into the
  cold ground", "You camp wild tonight", dawn "wake stiff and cold...
  Exposed") — but never named as a stranding at a place or from a cause;
  only the morning position (creek (4,2), outside, 182 kcal day 6) marks
  the place. Backlog #1394 CONFIRMED in detour form: the routed return is
  twelve "Travel 1 tile to <tile>." lines, not even one "Travel N tiles to
  Haven." line. Comparator 13029 day 19: 4 steps walked = BFS 4, path
  identical to census (including stepping onto blocked tile (4,3) from
  (5,3) — the rubble is leg/direction-specific, not a sealed tile).
- Guards: OFF reproduces census exactly (13224: 2 rubble days 4-5; 13029:
  5 rubble days 19-23); ON 13224 re-run byte-identical; first OFF/ON
  difference is the first detour evening itself on both seeds;
  unclassified evenings 0; untraced detour evenings 0.
- Proof PROOF-GREEN (T1-T8 incl. T6 determinism), re-run by coordinator on
  the rebased tree.

Next-lever note (design question, not judged): whether a 12-step night
walk SHOULD be offered 18 nights running is Steve's call — measured cost
is 0 kcal / 0 walk ticks / reliable arrival, but the cost is repetition
plus unnarrated routing, since the daytime destination never changes.

Merged 37f08e63a (prereg) / 873415b0a (results, rebased onto the woodcarry
merge, proof green on rebased tree). Zero src/js, zero default flips.
Tree released, branch deleted.

## Wall (30-day pre-seat evening legs)

national / table / wins NOT OBSERVABLE — reported, not claimed. Wave 4-5
unlocks 0 on both arms' legs (side observation only: 13224 ON reaches
wave 2 vs OFF wave 1, single seed, not a claim). Median survival 30d
capped on all legs. No wall movement claimed.

## Telemetry deviation check

On all four corpora (woodcarry OFF/ON, rubbleroute OFF/ON): 3 LOUD lines
each (national 12->0, table 16->0, wins 16->0) — the KNOWN field-shape +
regime artifact class (30d pre-seat evening legs carry no
national/table/wins fields; the WINSEAT baseline's own regime note
forbids this comparison). Exiled: no LOUD line. Baseline NOT rolled.

## Metric review

Woodcarry: this run's prereg revision (episode rate promoted to primary,
superseding the prior evening-share primary) is VINDICATED as the right
unit — the lever rescued every episode it met — but the revision exposed
a substrate flaw the next prereg must close: bank the band under the
judged driver family, or strip the grant/taps and re-verify census
reproduction seed by seed before judging. Do NOT re-score this run's 7/7.
Rubbleroute: completeness bar worked as written (0 untraced detours);
no metric revision proposed.

## Infrastructure

- Master moved twice under the run (loop-A holdsjoin b6b1ec1db, journey
  social r66 5bea52110, plus loop-A pickband 4cf1dd87e) — both branches
  rebased clean, proofs green after every rebase and on merged master.
- Safe-commit index clobber hit worker commits on both arms (repaired by
  workers via HEAD-blob cacheinfo, commits verified correct) and did NOT
  hit the coordinator evidence commit.
- Worktree registration for the rubble arm first failed on the container
  EPERM write flap (tools/mobile-sim.html, version.json); retry registered
  clean — no ref surgery, nothing forced.
- check.js --quick NOT re-run at coordinator level (zero src/js, zero
  green-list files on either arm; arm proofs are the landing gate).
- Stale B-owned trees with uncommitted changes (sim-nighttravel-bank-b,
  sim-nighttravel-verdict-b, sim-creekpath-armc-b) left alone by the
  reaper, as before — their content already landed or was adopted by
  earlier runs; not this run's to release.

## Findings dispositions (see sim-findings.md)

- #1423 stays OPEN with the 1530Z outcome appended (lever unproven-at-power,
  not disproven; next run banks under the judged driver family).
- #1425 method satisfied (player deaths counted from the start) — outcome
  appended.
- #1424 stays OPEN (honesty guard vacuous a second run; lacking-line needs
  a deliberately staged still-refused evening).
- #1427 ANSWERED by this run (DIAG-GO).
- #1428 ANSWERED by this run (rough sleeping marked, stranding unmarked).
- #1394 stays OPEN, CONFIRMED in detour form (routed return unnarrated).

food-economy stays converging (NOT converged): no food-economy fix landed
as game code this run (woodcarry INSUFFICIENT-DATA with lever reverted;
rubbleroute DIAG-GO is a measurement, not a fix). scale-onramp stays
converging (untouched; sibling loop A lane). Claim deleted; lock deleted.
Evidence: evidence/2026-10-29/sim-food-economy-round-1530-b.md (this file,
coordinator) + sim-woodcarry2-b.md + sim-woodcarry2-b-prereg.md +
sim-woodcarry2-b-analysis.json + sim-woodcarry2-b-corpus-off/ +
sim-woodcarry2-b-corpus-on/ + sim-rubbleroute-b.md +
sim-rubbleroute-b-prereg.md + sim-rubbleroute-b-analysis.json +
sim-rubbleroute-b-corpus-off/ + sim-rubbleroute-b-corpus-on/ (all on master).
