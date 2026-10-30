# sim-returns2-grudge — PREREGISTRATION (binding, committed BEFORE any judged leg)

Run: gaps coordinator #2, arm gaps2-returns (a).
Assignment: Steve 2026-10-29 15:47 CDT, "Address remaining gaps" — returns
next preregs. Prior build HELD, NOT killed: build-returns grudge lottery
pilot NO-GO (deliberate wave-4 HUNT picks 0, deliberate meetings 0,
national-ever 6 < 7). This prereg does NOT re-score that pilot. Every
number below is judged on FRESH corpora run under this prereg, on the
ported tree. A miss under it is NO-GO, never re-scored mid-run
(MEASUREMENT.md §14). Gating freeze stands: NO deedGateReady,
finale-omen, or wave/scale threshold change anywhere in this arm.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law) and docs/PARTY.md
(party dynamics), then the prior evidence in this worktree:
evidence/2026-10-29/sim-grudge-a.md (audit + design),
evidence/2026-10-29/prereg-grudge-lottery.md (prior prereg, on
build-returns — superseded by this prereg for all future runs, NOT
re-scored), and the build-returns pilot verdict (grudge-lottery-pilot-
verdict.md, ported by reference only — its rows are never read here).
CANON GAP (restated, not invented): no CANON-registered doc covers the
daily pick lottery or departure gates. The mechanism below is derived
from code (objPick in src/js/villager-objectives.js), verified by
reading it before this prereg was written.

## The prior failure mode this prereg is built to survive

The prior pilot's pick universe collapsed 45 → 2: the control corpus's
92 picks came 88% from one village (s75106) whose trajectory diverged
from the pilot's. Two defenses, both pre-registered here:

1. LARGER BAND: 16 seeds (75101–75116) instead of 8. The judged band is
   the full 16 (the judge's --band confirm set); there is no separate
   8-seed pilot split, because the prior 8-seed pilot already exists
   and this run's question is whether the mechanism survives a band
   twice its size.
2. COLLAPSE RULE (below): if the control corpus's deliberate wave-4
   picks concentrate in one seed past the stated bar, the sim legs
   are INSUFFICIENT-DATA — not GO, not NO-GO. A collapsed band proves
   nothing about the mechanism, and this prereg refuses to pretend
   otherwise.

Seed numbers are REUSED (75101–75116) because the judges pair
identical seeds and the corpora are entirely new runs on the ported
tree. Reuse of seed numbers is not reuse of rows: the old pilot rows
are never read by any judge in this run.

## Game change (frozen — and nothing else is judged as "the change")

The ported grudge lottery (merge commit e0c6e600a in this tree,
ported mechanisms-only from build-returns tip 137cd5a9a):

    huntW = 2.0 + recencyBonus + temperBonus, capped at 5.0,
    then both bonuses zeroed if fear > 60 (huntW = 2.0).

Recency (age = current day − memory day; candidate guarantees 0–3):
age 0 → +1.5; age 1 → +1.0; age 2 → +0.5; age 3 → +0.0.
Temperament (npcTemper): bold / prickly / intense → +1.5;
steady / restless / warm / dry → +0.5; cautious / gentle /
withdrawn / any other value → +0.0. Fear > 60 zeroes both bonuses.
No other objPick change, no pre-gate change, no WATER/FORAGE/
chore/visit weight change, no gate retune, no departure or arrival
change, no narration change, no roster/list feed (input is the
villager's own monsterSightings entry, written when THEY fought).

CONFOUND, STATED IN THE OPEN: the pilot tree also carries the
trail-follow mechanism (same merge commit), and the control tree
carries neither mechanism. Therefore:

- The PICKS leg is grudge-attributable: trail-follow acts only at
  empty-tile arrivals, after a pick has been made and departed. It
  cannot create or destroy a pick.
- The MEETINGS leg is NOT grudge-attributable on this pairing
  (trail converts arrivals to meetings), so meetings are DIAGNOSTIC
  ONLY in this arm. Trail's own arm (sim-returns2-trail-prereg.md)
  judges meetings with grudge held constant.
- The COST BARS judge the COMBINED (grudge+trail) package against
  neither-mechanism control. They are guardrails for the package,
  not attribution to grudge alone. If they fail here but pass in
  the trail arm (grudge-only control vs both pilot), the failure
  implicates grudge by elimination — that inference is reported,
  not scored, in this arm's evidence.

## Roots, substrate, runner (paired by construction)

- CONTROL root: the gaps2-returns-control tree, branched at the
  merge commit's parent (pre-merge HEAD) + instrument scripts only
  (funnel-diag needs block, returns-diag follows channel, funnel
  sweep persist, judges, proof tests — all from merge commit
  e0c6e600a). ZERO src/js diff from its base, verified by
  `git diff HEAD -- src/` before the control corpus runs. The
  control tree is registered (worktree-register.sh), never a bare
  worktree add, never under /tmp.
- PILOT root: this tree (gaps2-returns) at merge commit e0c6e600a
  plus only prereg + evidence commits (no further src/js change
  before the pilot corpus runs; the hunthold provenance-clearing
  commit, if it lands before this corpus, is a stated exception —
  it touches only GUARD/chore conversions and cannot create or
  destroy a HUNT pick, and its presence or absence is recorded
  in the evidence header either way).
- Substrate (identical in both roots): tableseat-nowait policy
  VERBATIM, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1, 180d death-aware, competent policy
  tableseat-nowait. Runner: scripts/test-funnel-a-sweep.js
  verbatim, SEEDS + EVID env overrides only.
- Corpora (fresh, read-only after the run):
  evidence/2026-10-29/perseed-returns2-grudgecontrol/ (control
  tree, seeds 75101–75116) and
  evidence/2026-10-29/perseed-returns2-pilot/ (this tree, same
  seeds). The pilot corpus is SHARED with the trail arm (same
  rows, different judge) because the code is identical — the
  trail pilot does not re-run what the grudge pilot already ran.
  A shared corpus is not a re-score: each judge reads the rows
  once, under its own prereg.
- Judge: scripts/judge-grudge-lottery.js VERBATIM (no judge edits
  in this run), --band confirm (seeds 75101–75116).

## Definitions (verbatim from the prior prereg, unchanged)

- Deliberate wave-4 HUNT pick: funnel pick with chosen.kind ==
  'HUNT', chosen.huntMid wave 4, and that huntMid in the pick's
  preSightings (the villager held the fight memory before the pick).
- Deliberate wave-4 meeting: returns-a DELIBERATE class over the
  judgedA set (wave 4, channel 'field'), classified by
  classifyMeeting over the fp+rt join — travel intent + prior
  fight memory, both pre-meeting, never inferred from outcome.
  (Diagnostic only in this arm — see confound above.)

## PRIMARY (GO requires ALL, unless the collapse rule fires)

- G-P1 (SIM PICKS): deliberate wave-4 HUNT picks on the pilot
  band > 0.
- G-P2 (FIXTURE MECHANISM): scripts/test-grudge-lottery.js
  re-run as a judged leg on the pilot root BEFORE the corpus is
  judged (it is a proof, not a judged corpus leg, but its two
  bars below are binding for this run): (i) weight-table cells
  exact (temper × age × fear grid, incl. cap and fear-zeroing);
  (ii) mild-need HUNT share exceeds dry-cistern HUNT share by
  ≥ 10 percentage points over 300 draws each (prior proof:
  mild 136/300, dry 70/300 — a 22-point gap; the 10-point bar is
  set BELOW the observed gap, before seeing any new number, so
  it is a mechanism bar, not a tuning target).

## COLLAPSE RULE (pre-registered; fires before any GO/NO-GO)

Let C = control deliberate wave-4 picks on the band, and C1 = the
largest single-seed share of C. COLLAPSE iff C ≥ 4 AND C1 > 75%.
If COLLAPSE fires, the sim legs (G-P1 and all cost bars) are
INSUFFICIENT-DATA: the overall verdict is INSUFFICIENT-DATA, the
fixture leg (G-P2) is still reported, and no game-change claim is
made in either direction. COLLAPSE is not NO-GO (the mechanism was
not measured) and not GO (the mechanism was not proven in sim).

## COST BARS (GO requires ALL; combined-package guardrails)

- Starvation deaths (pilot band total) ≤ control + 2.
- Zero need-override behavior attributable to the change: no HUNT
  pick on the band with energy < 35, or with hunger > 55 while
  pantry > 500 (pre-gate conditions — impossible by construction,
  verified from the pick recorder's need fields; any count > 0
  fails the bar and invalidates the recorder).
- Wall not worse than control on wins and on national-ever
  (band totals).

## DIAGNOSTIC (reported, not deciding)

- Deliberate wave-4 meetings (pilot vs control) + all-waves
  DELIBERATE meetings.
- HUNT take rate over candidate-present picks, split pre-gate vs
  lottery (chosen EAT/REST = pre-gate; candidate non-null +
  chosen ≠ HUNT + not pre-gate = lottery loss).
- HUNT picks by temper/age cell; deliberate picks by seed (the
  collapse diagnostic); departure and arrival outcomes of
  converted picks (lag days, empty-tile share) from the returns
  channels.
- Recorder hygiene: errs 0 + overflow empty in every row, both
  corpora (a hygiene failure voids the corpus, reported as
  INSUFFICIENT-DATA with the failing rows named, not silently
  dropped).

## Verdict and landing rule

- GO (all primaries + all cost bars pass, no collapse) means:
  the grudge lottery is a LANDING CANDIDATE — its hunks, and
  only its hunks, are recommended to the coordinator for landing
  consideration. This arm does NOT land anything: no push, no
  bump, no live verification, no merge to master. The merge
  commit stays unlanded pending coordinator verification.
- NO-GO (any primary or cost bar fails, no collapse) means: the
  mechanism stays held. Per MEASUREMENT.md §14a, the evidence
  classifies the kill (CONCEPT-DEAD vs METRIC-BROKEN vs
  SUBSTRATE-MISSING) from the mechanism section — a missed bar
  alone is not a kill of the concept.
- INSUFFICIENT-DATA (collapse rule fires, or hygiene voids a
  corpus) means: no verdict on the mechanism; the next run needs
  a band the collapse rule cannot eat (more seeds, or a
  fixture-primary design — that choice is the next prereg's,
  not a mid-run revision here).

## Metric review (for the NEXT run — never a mid-run re-score)

- Whether the meetings leg belongs in the grudge arm at all
  once trail-follow exists: on any tree carrying both mechanisms,
  meetings cannot be attributed to picks alone. Future grudge
  runs should either run on a grudge-only root (the control
  tree's second state, as built for the trail arm) or keep
  meetings diagnostic, as here.
- Whether the collapse bar (≥4 picks, >75% one seed) is the
  right shape, or whether a per-seed pick-rate (picks per
  wave-4 memory-holder) is the collapse-proof primary.
- Whether MAX... (not applicable — grudge has no budget
  parameter; the weight cap 5.0 and fear threshold 60 are the
  tuning surface, and neither is re-tuned in this run).
