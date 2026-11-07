# sim-pairoverlap-b — prereg (v1 FROZEN, GO bar by amendment)

**Arm:** sim-pairoverlap-b (run fleshout-loop-b-20261107T2130Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
policy file composing a yield-the-blow wrapper onto the FROZEN
feast-drive substrate (`scripts/policies/competent-feastdrive-b.js`,
unmodified, composing onto the FROZEN staged substrate
`scripts/policies/competent-stageally-a.js`, unmodified).
**Base:** master **8842af2e6** (read fresh in the main tree immediately
before writing this prereg; worktree rebased onto it clean, zero picks
— fast-forward from ac64c644c).
**Band:** 53001–53008, DELIBERATELY REUSED balanced-panel band.
**Horizon:** 150d death-aware. **Policies:** baseline = staged +
feast drive re-baselined on current master; armed = staged + feast
drive + yield-the-blow (`scripts/policies/competent-pairoverlap-b.js`).

## Band note (recorded)

53001–53008 is a JUDGED comparison band (feastdrive / feastcost /
feastcap / feaststopspend judged there) reused deliberately for
identical-seed before/after — comparison reuse, NOT fresh-ground
confirmation. Prior namings: regionalstep + sitstep diags, feastdrive
prereg (2026-11-07), feastcost prereg (2026-11-07), feastcap prereg
(2026-11-07), feaststopspend prereg (2026-11-07), takeseat /
doorwalk preregs (2026-11-07). The 12-seed confirm band, if the
pilot goes, is **53301–53312** (first choice; 53401–53412 backup) —
freshness verified in this prereg, see §Confirm.

## Canon

READ first: `docs/CANON.md`. **No canon doc covers the feast/surge
system as a dedicated doc** — the same standing note as the
feastdrive, feastcap and feaststopspend preregs. The design record
is the code itself: `src/js/feastBuff.js` (ontology header: timed
buff, devotion gate, feast draw, honest use marking — spend consumes
the arming, `feastSurgeUsed` marks real combat use) and
`src/js/progression.js` (`foodDeeds = sentimentTaught &&
feastSurgeUsed`, :650) plus `docs/BALANCING.md` §78–79 (FEASTED buff,
feast-surge calibration, feast draw). Nothing is invented from
scratch; every mechanism claim below is read from that code and
cited to it.

**Reading gap, recorded:** the task brief named
`evidence/2026-11-07/sim-feastcost-b.md` and
`evidence/2026-11-07/sim-feastcap-b.md` as chain reading. Neither
file exists anywhere in the workspace (full `find` over
`~/workspace` returns only the unrelated 2026-10-16
`sim-feastcost-b.md` and no `sim-feastcap-b.md` at all; the
feastcost/feastcap policy files are likewise absent from
`scripts/policies/`). The chain is therefore read through
`sim-feastdrive-b.md`, `sim-feaststopspend-b.md` (both present, read
in full) and the findings-backlog entry #1869, whose UPDATEs quote
both missing arms' numbers in full (feastcost pair days 14→28, bar
35; feastcap pair days 65→25, bar ≥35, donations 66,990→82,280
kcal). If those two evidence files surface later, the numbers here
should be re-checked against them; the verdicts below do not depend
on any number quoted only by #1869.

## The blank (from feastdrive → feastcost → feastcap → feaststopspend)

Three throttles in a row failed the same pair-days bar for the same
reason, and the reason is now a confirmed mechanism, not a guess.
The feast drive buys the deed (`foodDeeds` 1/8 → 5/8, surge spent
5/8) but the village pays in pairs (62→14, survivors 3→1). The
cumulative-gives tame recovers pairs only 14→28 (bar 35, all 28 on
53004) and survivors fall 1→0/8. The feast-frequency cap keeps the
deed (5/8) and survivors (5/8) but pair days fall 65→25 (bar ≥35)
and donations RISE 66,990→82,280 kcal. Stop-after-spend keeps the
deed (5/8) and cuts donations 55,235→30,230 kcal but pair days
collapse 52→5 (bar ≥35), all 5 on 53007 where the stop never bound.
Finding #1869's conclusion, now the arm's premise: **feast draws
are the pair factory** — the drive's post-deed donate-down feasts
were the ones producing overlapping kills, and throttling feasts
kills the pairs. **No fourth throttle is built in this arm.**

## The pair anatomy (read from the corpora, not assumed)

Pair days are counted from the driver's daily rows (`pairDay`):
a day counts when ≥2 distinct LIVING wave-4+ killers are alive
(`sitstep-instrument-20261107.js: livingVeteranIds` — distinct
`by` ids in `Game.state.waveKillLog` with `w >= 4`, killer not in
`fallen`/dead). Reading the feaststopspend re-baseline corpus
(base a2e005cbe) and the feastdrive diag corpus:

- 53004 re-baseline: kills d51/d52/d53 by THREE different people
  → 29 pair days. 53005: d64/d72/d73 → 18. 53007: d139/d140 → 5.
- 53006 staged diag: 51 pair days, anchored by ONE durable veteran
  (gen_cowc2ja, killed d70, alive at d150) overlapping a stream of
  second killers (greta d89–125, gen_k1j6fdz d99–110, chen d139–).
- Failures are killer-death failures, not kill-count failures:
  53001 makes 5 wave-4 kills and banks 0 pair days (first killers
  die before the next kill lands); 53006 armed (feastdrive) makes 4
  kills, 0 pair days; 53008 feastcap makes 3 kills, 0 pair days.
  **Kills without overlap are not pairs.**
- Who kills: on the feaststopspend re-baseline, wave-4+ kills split
  **21 via player (the scholar lands the blow) / 9 via companion /
  1 via wild**. The scholar — one person — lands ~68% of the
  killing blows. Every scholar re-kill is a kill that made no second
  veteran; every companion killing blow makes one.

## The lever — YIELD-THE-BLOW (second-face priority)

**Hypothesis:** in a wave-4+ turn-based fight the scholar joins,
when the killing blow is the scholar's to take and a companion
stands ready to take it instead, the scholar holds — the companion
lands the blow and becomes the second living veteran beside the
scholar, opening a pair window on the spot. The lever converts
scholar-kills into companion-kills; it does not add feasts, draws,
or fights, and it throttles nothing. It is the "prioritize a second
face" half of the brief; the "protect the first killer" half is
deliberately NOT built (see below).

**Why not protection:** the first killer is usually a villager the
policy cannot shield. There is no policy-side party-dismiss verb
(`dismissParty` exists only as a UI button in `app.js`; no sim
policy ever calls it), staging only invites and never un-invites,
and veterans die in engine-driven field fights (`via wild`) the
policy cannot touch. The one killer the policy CAN protect is the
scholar — by avoiding fights after their kill — but the scholar is
also the kill engine: avoiding fights removes exactly the
companion-kill chances the yield creates. Protection has no honest
policy-side mechanism; the yield does.

**Shape (FROZEN — `scripts/policies/competent-pairoverlap-b.js`,
composing onto the FROZEN feastdrive policy, unmodified):** a thin
wrapper overriding ONLY `fight()`; `daily`/`upkeep` delegate to the
feastdrive policy unchanged (donate-down + feast-at-dusk run
exactly as frozen). On each scholar turn of a TB fight, BEFORE
delegating to the staged fight hook, the wrapper checks the yield
condition — ALL of these, read only from the live fight in front
of the scholar and the scholar's own state (the same inputs the
rally reads; NO kill-log read, NO roster read, NO snapshot):

1. the fight's weakest living monster (the one the base policy
   would strike — `competent.js` strikes `alive[0]` after sorting
   by HP) is wave-4+ (wave from `mdef.wave` or the monster roster,
   same convention as `rally-bankkiller-b.js`), AND
2. that monster's HP ≤ **50** — the codebase's own killing-blow
   proxy (`competent.js` in-fight recovery: "never eats instead of
   a killing blow (weakest monster <= 50 HP: strike)"), AND
3. ≥1 living ally fighter is present in the fight (kind `ally` /
   `villager`, alive, not fled, key ≠ `p` — the rally's
   `fightSides` rule), AND
4. the scholar is in strike range of that monster (equipped-weapon
   range, `fighterDistTo` or Chebyshev — the same range test the
   base policy's close-the-distance branch uses), AND
5. the scholar's HP ≥ 50% (between the 35% flee eject and full
   health the scholar fights or flees, never yields), AND
6. this is not the fight's first player turn (per-fight turn count
   keyed by fight OBJECT identity, the rally's `fightState`
   pattern — so the round-1 rally can never be intercepted, even
   for a pre-wounded beast), AND
7. this monster has been yielded at most **2 times** in this fight
   (per-monster yield count, keyed by fighter key; after the cap
   the scholar strikes normally).

When all hold, the scholar WAITS (`Game.tbPlayerWait()` — it
auto-advances; never `endTurn` after it, per the wait hygiene
lesson) instead of striking, giving the allies their turns to land
the blow. If no ally lands it, the scholar strikes on a later turn
(the cap bounds the delay at 2 waits per monster). When any
condition fails, the wrapper delegates to the staged fight hook
unchanged (rally included). What it does NOT do: no feast change,
no donation change, no EAT FIRST bypass, no reactor change, no
channel change, no flee change, no ability press, no rally change.
The policy keeps its own counters (yields, yield fights,
yields-capped, first-yield day, yields by seed) and never touches
`Game.hostFeast` or `Game.state.waveKillLog` — the no-kill-log rule
is pinned by a proof test with a poisoned log (same pattern as the
feastdrive and rally pins).

**Counter-hypothesis, carried openly:** the yield gives the
monster free rounds. A yielded monster may kill the ally who was
supposed to finish it, or the scholar, or the fight may simply run
longer with no conversion — in which case pair days fall or stay
flat while survival worsens, and the lever is wrong. The
pair-days primary and the survival cost bar judge that, not the
yield count.

## Substrate — RE-BASELINE FIRST (the pilot gate covers this)

Master moved since the feaststopspend base (a2e005cbe → 8842af2e6).
The src/js delta in the range is 3 files, 42 insertions: `party.js`
(journey-crisis r154 round-wrap fix — the whiff guard now runs in
fights with a living hostile HUMAN; monster fights already called
`tbRoundWrap` via `tbAdvance`) and `villager-build.js`
(journey-deepening r116 language-exposure on succession —
dialogue/languages only). Neither touches the feast/kill/survival
path on its face, but the feaststopspend lesson is that master
movement moves this band's trajectories, so the substrate MUST be
re-verified on current master before any verdict leans on it.
Order: (1) run the re-baseline leg (staged + feastdrive, current
master, 8 seeds); (2) check SUBSTRATE SANITY (below); (3) run the
armed leg only if sanity passes.

**Substrate sanity (FROZEN):** the re-baseline leg must show
`foodDeeds` ≥ 3/8 (the drive still buys the deed on current master;
was 5/8 on a2e005cbe) AND ≥ 2 seeds with a spend day (the yield's
feast substrate is live on ≥ 2 seeds). If sanity fails, the outcome
is SUBSTRATE COLLAPSED — the lever is NOT judged (no GO/NO-GO), the
collapse is reported with numbers, and the finding is filed. The
frozen feaststopspend baseline (base a2e005cbe: pair days 52,
foodDeeds 5/8, survived 2/8, median 137.5d) is historical context
only; the judged comparison is re-baseline vs armed, both on
8842af2e6, identical seeds.

**Substrate guard (FROZEN):** 8/8 per-seed exact pre-first-yield.
Baseline and armed daily rows must match exactly for every day
strictly BEFORE the armed leg's first yield-fire day on that seed
(the yield is the wrapper's only divergence from the feastdrive
policy; the wrapper delegates identically before it). The first
divergence day must be ≥ the first yield day. A divergence before
the first yield day is an instrument / composition error and
invalidates the verdict — investigate, do not judge.

## Primary metric (FROZEN, number by amendment)

PAIR-DAYS (total over 8 seeds, from the driver's daily rows)
**AND** `foodDeeds` kept (≥ the re-baseline count — BOTH must
pass). The exact pair-days GO number is set by AMENDMENT after
the re-baseline is measured and BEFORE any armed pilot, by this
rule: **armed ≥ max(35, re-baseline + 10)**. The 35 is the
feastcap/feaststopspend bar (the level three throttles failed);
the +10 requires the lever to ADD overlap, not merely match a
collapsed baseline. The amendment carries the exact number AND the
pool check (§14b): the re-baseline's scholar-kill pool (via-player
wave-4 kills — 21 on the a2e005cbe baseline) must be ≥ the delta's
order of magnitude; if the pool cannot support the delta, the arm
stops as DIAG (metric-broken), not as a judged NO-GO. A primary
hit that breaches the cost bar is NO-GO.

## Cost bar (FROZEN)

- DONATIONS (armed total, from the policy stats `donatedKcal`)
  ≤ re-baseline total (per #1869: donations in the cost bar — the
  lever must not buy pairs with pantry the village needs; the
  yield touches no donation path, so this should hold by
  construction and is checked, not assumed).
- `foodDeeds` ≥ re-baseline count (see primary — the deed is kept).
- Starvation deaths total ≤ re-baseline + 2 (the analyzer's
  corrected array count — `teleDeaths` is an array of death
  records).
- Median survival ≥ 0.8× re-baseline median. Survived count is
  reported alongside the median (the feastdrive metric review:
  the median hides distribution movement).

## Secondaries (FROZEN)

Yield fires (total + per seed), yield fights, yields-capped
(monsters that hit the 2-wait cap), first-yield days, wave-4 kills
by `via` (player / companion / wild — the conversion the lever
claims), companion kills on yield days, pair days per seed,
first-pair day per seed, `feastSurgeUsed` per seed, first-spend
days, end feast gates, wave-4 kills and pair days vs re-baseline,
wave-5 unlocks/kills, standing, survived count, scale-wall numbers
(national / table / wins, wave 4–5 unlocks, median survival).

## Judge

The run is judged against this header (plus the amendment's exact
number). A miss is NO-GO, never re-scored against a friendlier
metric mid-run. If a metric proves wrong, write it under "metric
review" and propose the revision for the NEXT run. If the pilot
fails, the lever is killed at pilot — never run 12 seeds on an
invisible effect. Kill taxonomy (§14a) is recorded in the verdict
section.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the new policy
registered in `scripts/sweep-compare.js` (additive try/catch
entry, the established pattern; no existing policy file
touched), same seeds, same days, one combined campaign; the
compare `.md` is attached to the evidence file. The panel is the
instrument, the pre-registered threshold is the judge. The panel
measures the neutral before/after (survival, wins, rank, arc); the
feast/pair metrics come from this arm's own driver corpora
(`perseed-pairoverlap-b-baseline/` and
`perseed-pairoverlap-b-armed/`).

## Confirm (if GO at pilot)

12-seed confirm, only after the seed-band freshness check (below).
Same frozen bars (plus the amendment's number).

**Freshness check (done 2026-11-07, recorded here):** scope —
grep over ALL `evidence/*/sim-*-prereg.md` in the repo, plus all
`*.md` under
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/`
(forbidden/contaminated lists included). Results: `53301` — zero
namings; `53401` — zero namings; `53201` — NAMED in
`evidence/2026-11-07/sim-doorwalk-b-prereg.md` and
`sim-doorwalk-confirm-b-prereg.md`, therefore NOT fresh (as the
brief stated). The `grep -rln` hits for 53301/53401 inside
`hidden_files/` JSON files are false positives — the digits occur
inside floating-point values (e.g. `18069.553301672266`), not as
seed bands; no `.md` file names either band. **Confirm band:
53301–53312 (first choice); 53401–53412 is the verified backup.**
If the pilot goes, the confirm runs on 53301–53312.

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Proof (before any judged sim)

`scripts/test-pairoverlap-20261107.js`: yield-condition fixtures
on fake fights (fires only when ALL seven conditions hold; each
condition's failure delegates to the staged fight — one fixture
per condition), wrapper stats/counters fixtures, the no-kill-log
pin (poisoned `waveKillLog`, policy behavior unchanged), source
checks (never calls `hostFeast`, never reads `waveKillLog`), and
live legs via the driver in /tmp (structural invariants only): a
neutrality leg (feastdrive vs pairoverlap on seeds, daily rows
exact before the first yield day, first divergence ≥ first yield
day) and an armed leg (0 instrument errors; yields fire in live
sims; at least one yield day carries a companion wave-4 kill OR
the leg reports zero conversions honestly — the proof asserts the
mechanism ENGAGES, the pilot judges whether it CONVERTS).
Proof green BEFORE the judged pilot sims; re-run green after each
commit that touches the instrument, driver, or policy.
