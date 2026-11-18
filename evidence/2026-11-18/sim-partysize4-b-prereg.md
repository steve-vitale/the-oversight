# sim-partysize4-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-partysize4-b · **Loop B run:** fleshout-loop-b-20261118T1735Z
**Type:** BUILD — re-attempt the PARTYSIZE4 lever (4th companion seat
on wave-4+ hunt plans), carrying the `partyQuads` counter with it
(both launch paths' bumps), on current master.
**Frozen:** 2026-11-18 ~17:52 UTC, before the pilot sweep and before
the proof test is written. The lever code is written (uncommitted)
at freeze time; no judged sim has run. The freeze binds the
metrics, thresholds, band, and policies below — a miss is NO-GO,
never re-scored mid-run (§14).
**Branch tip:** `sim-partysize4-b` (lever + driver + analyzer +
proof test committed below this prereg).
**Base:** master `c4a9ba498` (Loop A 1515Z round evidence) +
cherry-picked partyquads held branch `d8c016a9c` (counter bump +
proof 26/26 + instruments), `5d1b37888` (pilot evidence + corpora +
panels), `5eb7f341c` (evidence tip refs). The cherry-picks landed
clean (the third needed one retry after a transient index-clobber
abort; tree verified clean, proof re-run green 26/26 + 1 documented
skip before any lever work).
**Builds on:** `evidence/2026-11-17/sim-partysize-b.md` (pilot
NO-GO on instrument; lever HELD, 6 quads formed, 20/20 commits);
`evidence/2026-11-18/sim-partyquads-b.md` (counter re-land HELD,
NO-QUAD-POOL, 0 quads on band 105001–105008); findings #2548
(quad launch path absent), #2549 (depart-path quad bump missing),
#2550 (gate-4 vs launch-3 counting question — DECIDED below);
`evidence/2026-11-18/sim-winnability-round-1430.md`.

## Why the original pilot NO-GO'd — and why this re-attempt is different

The partysize-b pilot (band 103601–103608, 150d, competent
verbatim, substrate VETREENGAGE=1 + PARTYSIZE4=1) went NO-GO on
**instrument grounds, not lever grounds**: the lever passed every
lever bar — B1 formation PASS (6 size-4 launches on the armed leg,
0 control; c3 picks 20 → commits 20 → quads 6), B3 guardrail PASS,
B4 proof PASS (44/0) — but the driver's HP capture could not read
spawned HP on agency-path fights (72 encounter rows lacked
`mHpStart`, 31 of them fought rows), so the B2 damage-share bar
could not be certified and the analyzer exited 1. Per Steve's kill
discipline (a missed test bar is not a kill), the lever was HELD,
not killed, pending a repaired recorder. The recorder repair
(`recoverMHpStart`: post-call `mHpLeft + mDealt`, vKill share 1.0,
evades null) has since landed on master in the successor drivers,
and the partyquads driver lineage (`scripts/partyquads-driver-b.js`)
carries it. This re-attempt therefore re-runs the lever on current
master with the repaired recorder — it does NOT re-litigate the
formation question the first pilot already answered (quads form),
it proves the lever lands cleanly on current master and the
counter counts live quads on both launch paths.

Two things changed since the first pilot that this arm must carry:
(1) the `partyQuads` counter was re-landed as a held branch
(cherry-picked above: the brain-path bump inside a
`launched.length > 2` guard); the lever arm adds the missing
win-plan launch-path bump (finding #2549) so a quad counts
whichever path launches it. (2) The trio substrate moved: the
writeCommit companion2/3 carry and the brain depart mirror are now
live on master (trio launches on the control leg too), so the
control leg is a real trio baseline, not the launch-funnel band's
0-trio artifact.

## Decision — finding #2550: gate-4s do NOT count as quads

Gate parties reach 4 (max gate partySize 4 on the pilot band) while
launches cap at 3, because the fight gate counts a villager who
joins mid-fight at the field (shout join / sensed ally), not a
traveller who set out with the party. **DECIDED: `partyQuads`
counts LAUNCHES only** — a depart with 4 travelling (`v4departs`
`partySize >= 4`, `result === 'launch'`, `targetWave >= 4`). A
gate-4 is a different phenomenon (a 4th body at the fight, not a
4th seat on the plan), the counter's purpose is measuring whether
the lever's 4th seat launches, and counting gate-4s would let the
counter fire with the lever off. The gate's party-size-4 counting
(`winPlanFightParty`) is untouched by this lever; whether gate-4s
deserve their own counter is a follow-up question, not this arm's.
The §5q quad-fire leg in `scripts/test-partyquads-b.js` (currently
a documented skip) must fire on this arm: a quad actually
launching and being counted by the fight engine's own depart
record — not just green assertions.

## Fix shape (decided FROM the code — port of 6f15dbc2b, adapted)

The original lever commit `6f15dbc2b` (branch `sim-partysize-b`,
HELD) is ported onto current master, not cherry-picked blindly:
the trio code it refactored has since landed and moved. The port
keeps the original's design exactly and adapts only the seams:

1. `src/js/win-plan.js`: `partysize4On()` env gate (same shape as
   `vetreengageOn()` / `fleerepair2On()`); module-level
   `extraCompanionScan(self, vid, hx, hy, exclude)` — the shared
   Haven-idle scan the original extracted from
   `winPlanSecondCompanion` (same pool, same tiers, same bars;
   the trio proof must show identical second-companion picks);
   `winPlanSecondCompanion` becomes a thin wrapper over it;
   `winPlanThirdCompanion(vid, hx, hy, firstCid, secondCid)` —
   gate `partysize4On()` + `unlockedWave() >= 4` (earned on the
   wave-4 unlock, on top of the plan targeting wave 4+), then the
   shared scan excluding the first two companions;
   `winPlanExtraCompanion` method wrapper (the original's API
   surface, for test ctxs); `winPlanDepart` launchParty: quad
   block after the trio block (pick cid3 via
   `winPlanThirdCompanion(vid, hx, hy, launched[0], launched[1])`,
   same launchability bar, blocked pick falls back to the trio),
   cplan2 party concat with `launched[2]`, cplan3 mirror, and
   `bump(self, 'partyQuads')` inside `launched.length > 2`.
2. `src/js/villager-brain.js`: dawn candidate third-companion pick
   (PARTYSIZE4-gated, only when a second companion was picked);
   depart mirror third-companion launch (same shared target,
   blocked → trio fallback) + cplan3 mirror + cplan2 party concat.
   The writeCommit companion2/3 carry is already live on master
   (trio landing) — NOT re-touched. The brain-path `partyQuads`
   bump is already on this branch (cherry-picked partyquads fix)
   — NOT re-touched.
3. `partyQuads` stat default + null-guard in `win-plan.js`
   `stateOf` is already on this branch (cherry-picked) — NOT
   re-touched.

NOT touched: the fight engine's ally cap (a 4th member travels
but cannot yet join the fight — finding #2515, separate arm);
`winPlanFightParty` gate counting; any candidate, gate, env flag,
or narration outside the lever; the HP recorder (already repaired
in the driver lineage).

## Primary metric (BINDING, §14)

**Quad-fire** = on the armed leg, analyzer-observed quad launches
(`v4departs`, `result === 'launch'`, `targetWave >= 4`,
`partySize >= 4`) AND `winPlanStats.partyQuads` counting them.

**GO threshold:** arm observed quads ≥ 1 **AND** arm
`partyQuads` ≥ 80% of arm observed quads **AND** control observed
quads == 0 **AND** control `partyQuads` == 0 **AND** per-seed
exact (arm `partyQuads` == observed quads) on ≥7/8 seeds.
**Pool floor (binding):** ≥ 6 wave-4+ launches per leg **AND**
≥ 1 observed arm quad. Below the floor the pilot is
under-powered and the verdict is NO-GO (METRIC-BROKEN /
NO-QUAD-POOL), never a pass on a vacuous 0==0. The 80% bar is
the partytrios/partyquads bar, kept for comparability; the pool
floor is what makes it non-vacuous.

**Predicted outcome (stated before the sweep):** GO on formation
+ counting — the first pilot already showed 6 quads forming on 8
seeds when the lever was on (band 103601–103608), and the counter
placement is proof-bounded against misfire (a trio must not bump
it). The open risk is the port itself: if the adapted seams
(dawn pick, depart mirror, shared-scan refactor) misfire on
current master, the pool floor fails and the verdict is NO-GO
with the seam named.

## Secondary metrics (supporting, not binding unless marked)

- **Trio accounting (binding):** per-seed `partyTrios` ==
  analyzer-observed size≥3 launches on ≥7/8 seeds on EACH leg.
  The counter must stay honest when trajectories diverge (the
  partyquads "trio counts untouched across legs" bar is dropped:
  with the lever on, a trio legitimately becomes a quad and
  trajectories diverge — cross-leg equality is the wrong check
  for a lever arm; per-seed accounting is the right one).
  Validated against the archived partyquads corpora before the
  sweep (the analyzer's selftest covers the shape; the evidence
  file records the archive check).
- **No-misfire (binding guardrail):** arm `partyQuads` == 0 on
  every seed where observed quads == 0; control `partyQuads` ==
  0 everywhere. A nonzero count with zero observed quads is a
  misfire — NO-GO outright.
- **Damage share on size-4 meetings (REPORTED, not binding):**
  mean `mDealt / mHpStart` on launched size-4 fought meetings vs
  control launched meetings, with the repaired recorder. NOT a
  GO bar: the fight-ally cap is known-binding (a 4th member
  travels but cannot join the fight — the first pilot's B2
  "pass" rested on a 1-meeting control baseline and 4 meetings
  from one seed against one monster), and this lever does not
  touch the cap. The damage question belongs to the
  fight-ally-cap arm (#2515); this arm reports the share honestly
  and does not claim a damage win from it.
- **Cost bars (GUARDRAIL, binding):** starvation ≤ ctl+2 on
  totals AND arm-only deaths; median survival ≥ 0.8× ctl median.
  A GO met with these breached is NO-GO (§14).
- **Instrument:** 0 instrument errors on all per-seed files;
  8/8 files both legs; `missingHp` 0 on fought rows (the
  repaired recorder's bar — no-contact evades are correct nulls).
- **Balanced panel** (`build-partysize4-b-panels.js` +
  `balance-panel.js compare`): the panel is the instrument, not
  the judge. Expectation is `no_material_signal` on most metrics
  with `review_required` from the 8-seed screen size investigated
  row by row, never waved.
- **Sense-test:** read villager dialogue/transcripts from the
  sims; judge meaning and coherence, not just counts. Flag
  anything robotic. (No villager dialogue transcripts are
  captured by this driver; talk quality is probed from the
  expedition/vetSays rows it does capture.)

## What this pilot does NOT judge

- Wins / national / table (the lever attacks damage-via-numbers,
  not standing; no movement expected — wall numbers are reported,
  not judged).
- The fight-ally cap (#2515) or the damage a 4th member adds in
  the fight (reported above, judged by the cap arm).
- Gate-4s (decided: not counted — see #2550 above).
- The trio lever (substrate, judged already).

## Fixture staging (local-proof-of-effect)

The pilot runs live sims (competent policy), not a staged
fixture — the "fixture" is the live village, and the first pilot
already showed the live pool is adequate (6 quads on 8 seeds).
The proof test's §5 fixtures stage the encounter as measured: a
wave-4-target plan holder at Haven with armed, trusted,
Haven-idle companions including a living wave-3 killer — the
party a player actually has when they reach wave-4 content —
never a fresh un-geared solo scholar. The §5q quad-fire leg must
fire on live fixtures: a quad launching through
`vbrainExecuteDepart` AND through `winPlanDepart`, counted by
the fight engine's own depart record.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (§10: reachability lever, waves
  4–5 / national / table). Dead villages stop simulating (+10d
  tail max).
- **Seeds: 105201, 105202, 105203, 105204, 105205, 105206,
  105207, 105208 — FRESH 8-seed pilot band.** Freshness check
  (skill local_seed_band_freshness): searched ALL dated preregs
  (`evidence/*/sim-*-prereg.md`) and all evidence filenames for
  the 105201–105208 seeds — zero hits. The full used-band list
  found in preregs is 102001–102008, 103601–103608, 103801–103812,
  104001–104008, plus today's 104411–104418 (aidleave),
  104601–104608 (fightcap), 105001–105008 (partyquads). Candidate
  105101 was REJECTED (used: huntstaff-b5 corpus,
  `evidence/2026-10-18/perseed-huntstaff-b5/armed-belongfeast-s105101.json`).
  105301 / 104701 / 104801 / 105401 / 105501 were also clear but
  105201 was picked first. No forbidden/contaminated band list
  names this band (contaminated bands named in preregs are
  9700–9711, 9930–9941, 73601–73608, 74201–74208 — none near
  105201). A fresh band is used (not the partysize-b band
  103601–103608) because this re-attempt judges the lever on
  current master, and reusing the first pilot's band would
  re-confirm its known formation result instead of testing the
  port.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + FLEEREPAIR2=1`, `FIGHTALLY2` unset,
  `LAUNCHPARTY` unset. **Legs differ ONLY by the lever flag:**
  ctl `PARTYSIZE4` unset, arm `PARTYSIZE4=1` — same branch code
  both legs (the lever is env-gated default-OFF, so flag-off IS
  the control, as in the partysize-b pilot). The driver asserts
  MODE↔env (ctl ⟺ flag unset, arm ⟺ flag =1) and records
  `leverPresent` + flag state per corpus file, so a leg/flag
  mismatch is a loud stop, never a silent mislabel.
- **Instrument:** `scripts/partysize4-driver-b.js` (the
  partyquads driver, adapted: same launch-funnel census —
  `v4departs` / `v4gates` / `v4encounters` with origin,
  `dawnbidScores`, `dawnbidDeparts`, `companionPool`,
  `recoverMHpStart` recorder — plus the MODE↔env guard instead
  of the MODE↔code guard). Analyzer:
  `scripts/analyze-partysize4-b.js` (reuses
  `analyze-partyquads-b.js` perSeed/wall/summarizeLeg; own judge
  for the lever: pool floor, primary quad-fire, trio accounting,
  no-misfire, cost bars, instrument). Panel builder:
  `scripts/build-partysize4-b-panels.js`. Proof:
  `scripts/test-partysize4-b.js` (adapted from the original
  `test-partysize-b.js`: static lever presence, analyzer shape,
  determinism with the repaired recorder, lever units §5a–§5f;
  the §5q quad-fire leg in `test-partyquads-b.js` must also fire
  on this branch — it is re-run after the lever lands).
