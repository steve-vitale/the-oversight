# sim-feaststopspend-b — prereg (FROZEN)

**Arm:** sim-feaststopspend-b (run fleshout-loop-b-20261107T1830Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
policy file composing a stop-after-spend wrapper onto the FROZEN
feast-drive substrate (`scripts/policies/competent-feastdrive-b.js`,
unmodified, composing onto the FROZEN staged substrate
`scripts/policies/competent-stageally-a.js`, unmodified).
**Base:** master c88df9d25 (read fresh in the main tree immediately
before writing this prereg; worktree tip matches).
**Band:** 53001–53008, DELIBERATELY REUSED balanced-panel band.
**Horizon:** 150d death-aware. **Policies:** baseline = staged +
feast drive re-baselined on current master; armed = staged + feast
drive + stop-after-spend (`scripts/policies/competent-feaststopspend-b.js`).

## Band note (recorded)

53001–53008 is a JUDGED comparison band (feastdrive / feastcost /
feastcap judged there) reused deliberately for identical-seed
before/after — comparison reuse, NOT fresh-ground confirmation.
Prior namings: regionalstep + sitstep diags, feastdrive prereg
(2026-11-07), feastcost prereg (2026-11-07), feastcap prereg
(2026-11-07), takeseat / doorwalk preregs (2026-11-07). The
12-seed confirm band, if the pilot goes, is chosen only after the
seed-band freshness check (grep ALL `evidence/*/sim-*-prereg.md`
plus forbidden/contaminated band lists); 53201–53212 was named in
the doorwalk-confirm prereg and is therefore NOT fresh for this
arm. If no fresh band is clean, the confirm runs on this same band
and the prereg amendment says so.

## Canon

READ first: `docs/CANON.md`. **No canon doc covers the feast/surge
system as a dedicated doc** — same standing note as the feastdrive
and feastcap preregs. The design record is the code itself:
`src/js/feastBuff.js` (ontology header: timed buff, devotion gate,
feast draw, honest use marking — spend consumes the arming,
`feastSurgeUsed` marks real combat use) and `src/js/progression.js`
(`foodDeeds = sentimentTaught && feastSurgeUsed`, :650) plus
`docs/BALANCING.md` §78–79 (FEASTED buff, feast-surge calibration,
feast draw). Nothing is invented from scratch; every mechanism
claim below is read from that code and cited to it.

## The blank (from feastdrive → feastcost → feastcap)

Three arms, one open wound. The feast drive buys the deed
(`foodDeeds` 1/8 → 5/8, surge spent 5/8) but the village pays in
pairs and survival: pair days 62 → 14, survivors 3 → 1
(feastdrive, base 2016a7ed0). The cumulative-gives tame keeps the
deed (5/8) but recovers pairs only 14 → 28 (bar 35, all 28 on
53004) and survivors fall 1 → 0/8 (feastcost, NO-GO). The
feast-frequency cap keeps the deed (5/8) and survivors (5/8) but
pair days fall 65 → 25 (bar ≥35), donations RISE 66,990 →
82,280 kcal, wave-5 unlocks 4 → 2, wave-5 kills 2 seeds → 0
(feastcap, NO-GO KILLED, judged with sitting in the loop).

Two composition lessons from feastcap, both binding on this arm:
(1) A cap at the shared `hostFeast` verb neuters the layer that
hosts second — drive-hosted feasts 18 → 0 — so the stop must be
built into the DRIVE'S OWN GATES, never wrapped around the verb
they share. (2) Feast draws are the PAIR FACTORY, not just the
pair deaths — draws 31 → 20 under the cap, overlap windows never
open (kills without overlap are not pairs). A blocked feast is
re-timed, not removed (53004 hosts MORE feasts capped, 8 vs 4;
its spend moves 37 days EARLIER). This arm's variant must be
judged against that mechanism: stopping feasts after the deed
removes draws too, so the pair-days bar is the judge, not an
afterthought.

## The lever — STOP-AFTER-SPEND

**Hypothesis:** once a village's `foodDeeds` is complete, feasts
after the deed buy nothing — no more feast draws, no more
donate-down spending once the deed is bought. The drive's
post-deed feasts and donations are pure cost (pantry out, fights
in, deed already banked), so stopping them should recover pair
days toward the staged 62 without losing the deed (5/8). The
counter-hypothesis, carried openly: draws are the pair factory,
so removing post-deed draws may cost pairs rather than save
them — if pair days fall further, the lever is wrong and the
finding is that the deed's price is paid in draws, not in feasts.

**Shape (FROZEN — `scripts/policies/competent-feaststopspend-b.js`,
composing onto the FROZEN feastdrive policy, unmodified):**
a thin wrapper, no duplication, no edits to any existing file.
On each `daily` / `upkeep` call it reads the deed exactly the
way the engine defines it (`prog.sentimentTaught &&
prog.feastSurgeUsed`, `progression.js:650` — scholar-knowable
state, the same read the drive's `armed()` already makes) and:
- deed NOT done → delegate to the feastdrive policy unchanged
  (its donate-down + feast-at-dusk steps run exactly as frozen);
- deed done → delegate to the STAGED policy directly (the
  drive's two steps are skipped as a unit; the base staged
  policy's own `eveningFeast` still runs on its own cadence and
  gates — the stop applies to the DRIVE, not the substrate).
The stop latches: `feastSurgeUsed` is set true once by
`_spendFeastedPower` (`feastBuff.js:418`, which also clears the
arming) and no code anywhere clears it, so the deed never
un-completes. The policy keeps its own counters (deed-done days,
deed-done donate skips, deed-done feast skips, first deed-done
day) and never touches `Game.hostFeast` itself — the feastcap
verb-wrap is NOT repeated. What it does NOT do: no EAT FIRST
bypass, no reactor change, no channel change, no roster/list
reads. Mechanism note: once donate-down stops, recent gives
decay below 1500 within a week, so the base's own EAT FIRST gate
should close its feasts too — the corpus will show whether
post-deed feasts actually dry up (total feasts after
firstSpendDay) or the base keeps lighting them.

**Why a wrapper, not an edit to the drive file:** the drive file
is the frozen substrate for this comparison; editing it would
move the baseline under the armed leg. The wrapper gates the
drive's two steps as a unit at the drive layer — that IS the
drive's own gates, as opposed to the shared verb. If the wrapper
ever proves the wrong shape, the drive file is untouched and the
arm deletes cleanly.

## Substrate — RE-BASELINE FIRST (the pilot gate covers this)

The 530 band's takeseat-substrate trajectories COLLAPSED after
the cf22937b8 landings (coordinator re-baseline, 1430Z round
evidence: villages dying 54–92d, median ~70d vs 150d capped,
sits 5/8 → 0/8; cause NOT bisected — xp-gear, bonds,
journey-scale r108 all in range). This arm's substrate is staged
+ feastdrive (no sitting in the loop), but it rides the same
master, so the feast substrate MUST be re-verified on current
master before any verdict leans on it. Order: (1) run the
re-baseline leg (staged + feastdrive, current master, 8 seeds);
(2) check SUBSTRATE SANITY (below); (3) run the armed leg only
if sanity passes.

**Substrate sanity (FROZEN):** the re-baseline leg must show
`foodDeeds` ≥ 3/8 (the drive still buys the deed on current
master; was 5/8 on 2016a7ed0) AND ≥ 2 seeds with a spend day
(the stop would actually bind on ≥ 2 seeds). If sanity fails,
the outcome is SUBSTRATE COLLAPSED — the lever is NOT judged
(no GO/NO-GO), the collapse is reported with numbers, and the
finding is filed. The frozen staged diag baseline (base
2016a7ed0: pair days 62, foodDeeds 1/8, survived 3/8, median
114.5d) is historical context only; the judged comparison is
re-baseline vs armed, both on c88df9d25, identical seeds.

**Substrate guard (FROZEN):** 8/8 per-seed exact pre-first-bind.
Baseline and armed daily rows must match exactly for every day
≤ the baseline leg's firstSpendDay on that seed (the stop binds
only after the spend; the wrapper delegates identically before
it). A divergence on or before that day is an instrument /
composition error and invalidates the verdict — investigate,
do not judge.

## Primary metric (FROZEN)

PAIR-DAYS ≥ 35 (mirroring feastcap's bar) AND `foodDeeds` ≥ 4/8
(keep the deed gain — BOTH must pass). Pair days are counted
from the driver's daily rows (`pairDay`), same as all three
prior feast arms.

## Cost bar (FROZEN)

- DONATIONS (armed total, from the policy stats `donatedKcal`)
  ≤ re-baseline total. The stop must cut donations, not raise
  them — feastcap saw them RISE 66,990 → 82,280 kcal under a
  throttle that left donate-down running; this arm stops the
  giving itself.
- Starvation deaths total ≤ control + 2 (control = re-baseline
  leg total; the analyzer's corrected array count, per the
  feastdrive metric review — `teleDeaths` is an array of death
  records).
- Median survival ≥ 0.8× control median. Survived count is
  reported alongside the median (the feastdrive metric review:
  the median hides distribution movement).
- A primary hit that breaches the cost bar is NO-GO.

## Secondaries (FROZEN)

Feasts after firstSpendDay (total, and drive-hosted — 0 by
construction, verified from the policy event log), draws after
firstSpendDay, faced/drawn, `feastSurgeUsed` per seed,
first-spend days, end feast gates, wave-4 kills and pair days
vs re-baseline, wave-5 unlocks/kills, standing, survived count,
scale-wall numbers (national / table / wins, wave 4–5 unlocks,
median survival).

## Judge

The run is judged against this header. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric
proves wrong, write it under "metric review" and propose the
revision for the NEXT run. If the pilot fails, the lever is
killed at pilot — never run 12 seeds on an invisible effect.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the new policy
registered in `scripts/sweep-compare.js` (additive try/catch
entry, the established pattern; no existing policy file
touched), same seeds, same days, one combined campaign; the
compare `.md` is attached to the evidence file. The panel is
the instrument, the pre-registered threshold is the judge. The
panel measures the neutral before/after (survival, wins, rank,
arc); the feast metrics come from this arm's own driver corpora
(`perseed-feaststopspend-b-baseline/` and
`perseed-feaststopspend-b-armed/`).

## Confirm (if GO at pilot)

12-seed confirm, only after the seed-band freshness check
(grep ALL `evidence/*/sim-*-prereg.md` plus forbidden /
contaminated band lists, per the local_seed_band_freshness
skill). If no fresh band is clean, confirm on this same band
and say so in a prereg amendment. Same frozen bars.

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Proof (before any judged sim)

`scripts/test-feaststopspend-20261107.js`: deedDone helper
fixtures, wrapper gating on fake Games (deed done → staged
delegated, drive steps skipped; deed not done → drive delegated
unchanged; the policy source never calls `hostFeast` itself),
stats/counters fixtures, and live legs via the driver in /tmp
(structural invariants only): a neutrality leg (feastdrive vs
feaststopspend on a seed, daily rows exact through the baseline
spend day) and an armed leg (0 instrument errors; if a spend
day is set, no drive feast/donate event after it). Proof green
BEFORE the judged pilot sims; re-run green after each commit
that touches the instrument, driver, or policy.
