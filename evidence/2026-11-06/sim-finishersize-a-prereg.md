# sim-finishersize-a — prereg: the committed finish for beasts met below their break line (finding #1829)

Run: fleshout-20261107T0221Z, Loop A. Axis: scale-onramp / winnability chain.
Arm: `sim-finishersize-a`, worktree `~/workspace/worktrees/sim-finishersize-a`.
Tracker blank (1) from the 2130Z entry: the 41-HP GRIND — the FINISHER-SIZE
lever named in evidence/2026-11-06/sim-grind-a.md (GO, landed eabf00dba).

## The shape to fix

sim-grind-a (band 99641–99648, competent, 150d): 128 wave-4 field fights,
1 kill — a contact finish on a beast the palisade wall had already delivered
to 1 HP. Field damage median 41/fight over median 3 rounds, then the
villager flees (79%) or dies (8%). The wound-mill ruling (Steve 2026-10-27:
defenders finish a crippled beast they meet if they can — risk-weighted, not
unconditional) IS wired for field fights in three pieces (fieldFights.js),
but the window is ~12 damage: the contact finish is one strike
lroll([4+wb, 8+wb]) — fired once band-wide, killed once (a 1-HP wall floor);
the twoblow committed finish fired 0× on wave 4 (14× on wave 3) because two
blows sum to ~12–16 while a wave-4 beast crosses its 15% break line at
127–225 HP. A 41-HP beast (the 87008 shape: 484 → 404 → 273 → 127 → 41 HP
across four same-day TB fights, 0 kills, 6 scholar deaths d131) cannot be
finished in the field at all: it is met, struck once, and flees.

Why the meeting ends that way (code read before this prereg): wave-4
monsters carry no `flee` component, so the beast itself never breaks — the
VILLAGER flees. The morale math at round ≥ 2 calls the fight hopeless when
rounds-to-live < rounds-to-kill × 0.85: a 41-HP beast needs ~3 rounds at the
measured field rate (~14 damage/round) while the villager's own survival
horizon against 35–85-damage wave-4 attacks is ~2 rounds. The fighter runs
at round 2–3 with the beast at ~15–29 HP. The twoblow commit cannot save
it: the gate fires only when the last two PROVEN blows already cover the
beast's remaining HP, and the hopeless flee fires before the break check
anyway. The contact strike is one blow, then a free flee (for
flee-component monsters) or a hopeless flee (for committed wave-4 monsters).

## The lever — COMMITTED FINISH (design, to build after the baseline leg)

At the contact-finish site (beast met below its break line, wave ≥ 3,
fighter holds a finish instrument, true contact meeting mDealt === 0,
!noFlee), after the contact strike lands without killing: if the fighter
is at ≥ 60% HP and intent is `engage` (the twoblow gate's own gates, reused
verbatim) AND the beast's remaining HP is within the sized tail — post-strike
HP ≤ 3 × the contact strike just landed — the fighter COMMITS
(`rec.committedFinish = true`, kind `met-below-break`): the hopeless flee
is suppressed while the fighter holds above the 40% companion floor (the
existing twoblow floor, unchanged), the break check holds the beast (the
twoblow gate OR the commit satisfies it), and the commit lapses after 3
held rounds, returning the fight to normal morale. The kill, if it comes,
comes from real strikes in the following rounds, never from a table roll.

Sizing, from the corpus (not from TB): a 41-HP beast met by a field fighter
(strike ~12) commits at 29 ≤ 36 and dies in ~2 further rounds — one meeting
at ~3 rounds is the honest price. A 125-HP beast (strike ~12 → 113 > 36)
does NOT commit and stays a TB job. The gate scales with the fighter's own
proven blow, so a stronger fighter can commit a bigger crippled beast —
that is the ruling's "if they can", not a handout. The 3-round cap bounds
the hold even when rolls run low.

Guardrails (binding, from the brief):
- (a) Do NOT touch rounds-capping or armor-ignoring hits — that half belongs
  to Loop B's sim-bypass-b (its cap measured +0.5 rounds; do NOT re-apply it).
- (b) Do NOT touch the Eulogy counter-dismissal (separate design question).
- (c) No gate / price / deed / readyDemand change. No wave-1/2 behavior
  change (wave ≥ 3 gate). This is a feel/combat change: [needs-eyes] in the
  commit message.

## Seeds — FRESHNESS (mandatory check, per local_seed_band_freshness skill)

- Suggested band 99661–99668 (8 seeds); confirm extension 99669–99676
  (16 seeds total) IF the pilot GOes.
- Scope searched before this prereg: ALL dated preregs
  (`evidence/*/sim-*-prereg.md`, per-seed grep for each of 99661–99676
  plus a `9966` substring sweep); the forbidden/contaminated bands named
  in the 2026-11-04 preregs (99001–99008, 99009–99024 contaminated,
  99041–99052, 99101–99108, 99201–99216, 99217–99232, 99401–99412,
  99601–99612, 99701–99708, 99801–99808); the convergence tracker
  (`hidden_files/convergence-tracker.md`) and `hidden_files/sim-findings.md`.
- Result: ZERO hits for any of 99661–99676 in any prereg, and the band is
  absent from every named forbidden/contaminated list. Two non-hits
  adjudicated, not ignored: `9959-9966` in
  evidence/2026-10-27/sim-spandraw-census-b-prereg.md is seeds 9959–9966,
  not 99661+; `099668494` in the convergence tracker is a commit-hash
  fragment, not a seed band.
- Seeds: 99661–99668, competent policy verbatim, unmodified. Pilot first;
  confirm only on pilot GO.

## Design (staged, per docs/MEASUREMENT.md §§9–12, 14–15)

- Horizon: 150d death-aware (runDays ends on village death / win; +10d tail
  max). Same as grind-a: this is a reachability lever (waves 4–5), and the
  grind band's median survival was 128.5d — a 150d horizon sees the tail
  meetings the lever is about.
- Policy: `scripts/policies/competent` verbatim, unmodified. Single policy
  (deviation from MEASUREMENT §2 recorded here, not silently: the lever is
  a field-fight mechanism gated on rare below-break meetings the competent
  policy generates at the grind-a rate; a second policy would halve the
  meeting count per leg and judge luck, not the lever).
- Legs: BASELINE (current master, no src change) then ARMED (committed
  finish) on IDENTICAL seeds. Instruments (scripts only):
  `scripts/finishersize-instrument-20261106.js` (layers on the grind
  instrument; decorates each field row with the finisher-size audit fields
  the engine records: met-below-break, commit kind/rounds/HP, lapse, and
  the contact-strike size), `scripts/finishersize-driver-20261106.js`
  (grind-driver shape, FS corpus dir), `scripts/finishersize-analyze-20261106.js`.
  Corpus: `evidence/2026-11-06/perseed-finishersize-a/` (baseline + armed
  files, one per seed per leg).
- Proof: `scripts/test-finishersize-20261106.js` — direct-engine fixtures
  (twoblow pattern: seeded per-fight RNG, fresh monster entities): a 41-HP
  wave-4 beast met below its break line dies by real strikes in a committed
  fight; a 125-HP beast never commits (size gate); wave-2 never commits;
  low-HP fighter never commits; Eulogy counter-dismissal still fires.
  `node scripts/check.js --quick` after the change.
- Balanced panel (§15): the primary comparison is the identical-seed FS
  corpus (the grind-proven route for this single-leg question — the panel
  runs its own full panel and takes no corpus input, as grind-a recorded).
  A panel compare is attempted after the pilot if time remains in the run,
  and attached if it completes; if it does not run, that is recorded here
  with the reason, not silently dropped.

## Primary metric (pre-registered — binds the run, §14)

Field wave-4 kills from below-break meetings: wave-4+ field fights where
the beast was met below its 15% break line (entryFrac < 0.15, or the
contact-finish branch fired), outcome `vKill`, counted per leg on identical
seeds. Baseline expectation from grind-a: 1 kill / 1 below-break meeting
(the 1-HP audit — killed by the single contact strike alone, which the new
commit does not change).

- **GO (pilot, 8 seeds): armed − baseline ≥ +2 such kills** (the commit
  creates kills the old code could not make), AND the negative control holds
  (zero commits on above-tail below-break meetings in the armed leg — the
  sizing gate is real, not a blanket hold), AND guards G1–G3 hold.
- **Scarcity rule (pre-registered, not drift):** below-break meetings are
  rare (~1 per 128 wave-4 field fights on grind-a). If the BASELINE leg
  yields fewer than 2 below-break meetings on the band, the count GO is
  unjudgeable for scarcity — the verdict is then DIAG-GO iff ALL of: (a) the
  proof test pins the mechanism (41-HP kill, 125-HP no-commit, Eulogy
  dismissal intact, wave-2/low-HP negatives); (b) every committable meeting
  in the armed leg converts to a field kill; (c) the negative control holds;
  (d) guards hold. Otherwise NO-GO.
- **Confirm (only on pilot GO):** extend to 99661–99676 (16 seeds), same
  primary, GO armed − baseline ≥ +3 over 16 seeds.
- Guards: G1 field-fighter deaths (wave-4+ field `vDie`) armed ≤ baseline
  + 2 per additional field kill; G1b scholar deaths armed ≤ baseline + 2
  per additional wave-4 kill (any channel); G2 wall numbers reported every
  leg (national / table / wins, wave 4–5 unlocks + faced + kills, median
  survival) — any win movement either way is investigated, not auto-failed;
  G3 no gate/price/deed/readyDemand change, no rounds-cap or armor-ignoring
  change, Eulogy dismissal untouched. A GO met with a guard breached is NO-GO.
- Convergence state to report: converging | converged | parked | killed-at-pilot.

## Metric review (to fill at closeout)

- Pre-registered metrics bind this run. A miss is NO-GO, never re-scored
  against a friendlier metric mid-run. If the metric proves wrong, write it
  here and propose the revision for the NEXT run.
- Convergence state to report: converging | converged | parked | killed-at-pilot.
