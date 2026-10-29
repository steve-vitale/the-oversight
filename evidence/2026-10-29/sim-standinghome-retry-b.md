# sim-standinghome-retry-b — RETRY EVIDENCE (standing go-home rule, NEW prereg)

## Standing of the killed run (never re-scored)
Creekpath Arm C was KILLED at pilot under its own prereg (adoption
evidence `evidence/2026-10-29/sim-creekpath-armc-adopt-b.md`): mechanism
worked, G1 failed on pooled starvation deaths 0→4 (seed 10752 days 25–26,
13–14 days after the day-12 standing step). That verdict STANDS. This run
is a NEW run under a NEW prereg
(`evidence/2026-10-29/sim-standinghome-retry-b-prereg.md`, written BEFORE
any judged after-leg), per docs/MEASUREMENT.md §14. The ONLY guard change
is G1-REVISED: a starvation death counts against the arm only if it falls
within 7 days after a standing-home step fired for that seed (step day D
counts deaths on days D..D+7); pooled total starvation deaths are
REPORTED IN FULL but NOT JUDGED.

## The change (policy-side ONLY, default OFF)
Rebuilt exactly as specified in the Arm C prereg, from the stranded
tree's delta (read-only reference
`~/workspace/worktrees/sim-creekpath-armc-b`, never modified):
- Gate `COMPETENT_STANDING_HOME` (default OFF), helper `goHomeStanding`
  in `scripts/policies/competent.js`, called at the END of `daily()`
  after `competentEat`, calling Arm B's `walkHome` with the detour flag
  on, banking `ctx.standingHomeDays` / `ctx.standingHomeDetours`.
- Guards: not already at haven (tile check AND `playerAtHaven()`), not
  game-over, not in combat, not inside a tent, haven tile on this board
  at village px/py (default 4,4).
- Deliberately NOT built: trip-origin anchoring, detour flag on stoneRun
  walks, any src/js narration change. No src/js touched anywhere.
- `scripts/creekpath-trace-b.js` gains the two non-destructive
  per-evening census fields (`standingHomeDays`, `standingHomeDetours`
  deltas). Instrument identical across both legs.
- The rebuilt gate's behavior matches the prereg spec: the proof test
  placement cases reproduce the Arm C proof's outcomes (clear hop,
  detour via BFS route, no-route no-move, at-haven and in-tent no-fire),
  and the fresh after-pilot leg is byte-identical to the killed run's
  after-pilot corpus (see Divergence below). No spec deviation found.

## Substrate (identical to Arm C)
`GRANT_THIEF=1`; harness gates FATAL `COMPETENT_FEAST=0 SEATDRIVE=0
PLENTYDEPRI=0 DEPOSITGATE=1`; `COMPETENT_ROUTE_AROUND` UNSET;
`COMPETENT_TRIPHOME_ROUTE_AROUND=1` in BOTH legs (before leg = Arm B's
after behavior; judged comparison is the standing rule alone). Horizon
30 days, death-aware. Seeds pilot 10750–10757, confirm 10758–10773.

## Staging verification (before any judged after-leg)
- All 8 before-pilot + 16 before-confirm banked files parse, are
  non-zero, and reproduce Arm B's published after-leg numbers exactly:
  pilot refused 3, no-move 2; pooled refused 7, no-move 5. No file was
  corrupt, so no deterministic re-run of any before seed was needed.
- Proof test `node scripts/test-standinghome-retry-b.js` →
  PROOF-GREEN before any judged after leg: placement behavior (10757
  (3,3) creek detour, 10752 (1,4) rubble detour, gate-off neutrality
  seed-by-seed vs the Arm B after-pilot corpus) all PASS.

## Pilot verdict under the NEW prereg: GO
Before → after (10750–10757):
- Primary stranded (refused) evenings: 3 → 0. Bar: after ≤ 1. PASS.
- No-move co-primary: 2 → 0. Bar: after ≤ 1. PASS.
- Strand guard: 10752 longest strand 3 → 0, count 3 → 0; all other
  seeds 0 → 0. No violation. PASS.
- Hop-clear away evenings: 0 → 0. Out-of-reach away: 0 → 0.
- Standing-step census (after): 1 day fired (10752 day 12), 2 detour
  steps banked.
- G1-REVISED causal-window starvation deaths: 0 (player 0). HOLD. The
  standing step fired day 12, so the causal window is days 12–19; the
  four starvation deaths fall days 25–26, outside it.
- Pooled TOTAL starvation deaths REPORTED-NOT-JUDGED: 0 → 4 (player
  0 → 0) — the same four 10752 deaths as the killed run (day 25
  theo_lindqvist; day 26 owen_smith, gen_5vu77j1, olivia_bennett).
- G2 counterfactual player deaths on/after detour-or-standing days: 0.
  HOLD.
- Median survival: 30 → 30 days (all pilot seeds survived both legs).
- Death counts per pilot seed, before → after: 10750 8→8, 10751 6→6,
  10752 8→14, 10753 5→5, 10754 11→11, 10755 11→11, 10756 7→7,
  10757 6→6. Seven of eight seeds byte-identical — a clean
  single-variable experiment; only 10752 diverged, exactly at the
  standing step.
- OVERALL PILOT: GO (all bars hold) → confirm spend authorized.

## Divergence check (pilot)
ZERO divergence: the fresh after-pilot corpus is byte-identical to the
killed run's after-pilot corpus on all 8 files (full JSON equality, not
just counts). The rebuild reproduces the killed mechanism exactly, and
the new verdict comes only from the new prereg's causal-window G1 — not
from any behavior change. Nothing hidden.

## Confirm verdict (band 2) + POOLED verdict: GO
Before → after (10758–10773):
- Primary stranded: 4 → 0. Bar: after ≤ 2. PASS.
- No-move co-primary: 3 → 0. Bar: after ≤ 1. PASS.
- Strand guard: 10762 longest strand 4 → 0, count 4 → 0; all other
  seeds 0 → 0. No violation. PASS.
- Hop-clear away evenings (secondary): 7 → 2. Out-of-reach away: 3 → 0.
- Standing-step census (after): 2 days fired — 10762 day 13 (1 detour
  step) and 10770 day 5 (1 detour step).
- G1-REVISED causal-window starvation deaths: 0 (player 0). HOLD.
  Standing steps fired days 13 and 5 (windows days 13–20 and 5–12); no
  starvation death falls in either window on those seeds.
- Pooled TOTAL starvation deaths REPORTED-NOT-JUDGED: 7 → 7 (player
  1 → 1) — identical count, and the player starvation death (10772 day
  11) is byte-identical in both legs (see 10772 finding below).
- G2 counterfactual player deaths: 0. HOLD.
- Median survival: 30 → 30 days (before range 22–30, after range
  22–30; the two early village-lost endings, 10760 day 28 and 10761 day
  22, recur unchanged).
- POOLED (pilot + confirm, 24 seeds): refused 7 → 0 (bar ≤ 3) PASS;
  no-move 5 → 0 (bar ≤ 2) PASS; strand guard PASS on all 24 seeds;
  G1-REVISED causal 0 HOLD; pooled total starvation 7 → 11
  REPORTED-NOT-JUDGED (the +4 is entirely the pilot's 10752 cluster,
  outside its causal window); G2 0 HOLD.
- OVERALL POOLED: GO. The standing go-home rule passes its new prereg
  at pilot and at pooled confirm. Verdict computed by
  `scripts/test-standinghome-retry-b.js` (verdict mode), not hand-counted.

## Confirm-leg findings (reported, not judged beyond the bars)
- 10762: the standing step (day 13, trail_edge (5,5), 1 detour step)
  clears the 4-evening refused strand AND, by trajectory divergence,
  the 5 hop-clear evenings at grove (4,3) days 18–22 never occur — the
  after leg ends every evening at home. After deaths 9 vs before 14;
  no starvation in either leg.
- 10770 (new behavior class): the standing step fires day 5 on an
  OUT-OF-REACH evening (grove (3,0), before leg: out-of-reach days 5–7,
  kcal 1389 → 287 → 66). The guard is board-presence (haven tile on
  this board), not travel-offered, so the multi-hop route-around can
  still reach haven when the direct hop isn't offered. After leg: all
  30 evenings at home (before: out-of-reach 3 + blocked-combat 1).
  Deaths diverge completely after day 5 (before 6 deaths, after 8,
  different causes) — trajectory divergence, no starvation, no G2 hit.
- 10772 (blind spot, see Blanks): the 2 hop-clear evenings (days 10–11,
  trail_edge (4,3), kcal 588 → 106) persist byte-identically in both
  legs, including the player starvation death day 11. The standing
  step never fired there. Hop-clear is secondary (reported, not
  judged); the refused primary is 0 in both legs, so this does not
  affect the verdict — but it bounds the mechanism (see below).

## Sense-test (transcript, seed 10752 after leg, day 12)
The rescue reads as a real villager day, not a teleport. The day
wanders, forages, and twice hits the blocked hop home, narrated
honestly: "Rubble chokes the path." — `travel->(4,4) now=(1,4) REFUSED
rubble`. At day's end the villager walks home and the game says,
verbatim: "Travel 3 tiles to Haven." … "You walk back into Haven. 15
Codex entries. The village is glad to see you." The before leg's
version ends days 12–14 stranded at (1,4) with kcal 890 → 137 → 0; the
after leg ends day 12 at home and day 13 at kcal 2390.
- KNOWN detour-narration blank REPRODUCED (documented, NOT built —
  this arm is policy-side only): the routed return has no "going
  around" line — it arrives as a plain "Travel 3 tiles to Haven", so a
  player cannot tell a routed return from a clear hop. Same blank as
  recorded in the Arm C adoption evidence and sim-findings.md.
- Pre-existing oddity, also reproduced (not Arm C's, not built here):
  the day's trip says "You clear the rubble, stone by stone. The path
  is clear." and the hop home is still refused afterwards — the trip's
  clearance and the hop's blockage disagree, and the villager never
  comments on it. Belongs to the trip/blockage area.

## Village assessment (plain words)
Before the rule, these 24 villages are healthy home-every-night
villages with exactly two strand exceptions: one seed strands a single
villager for three evenings, one seed strands a villager for four
evenings plus five evenings spent away at a clear hop home, never going
home. With the rule, every refused evening in all 24 seeds is gone —
the rescued villagers eat, recover, and stay home — and no starvation
death falls within a week of any rescue. The rescued seed's village
still loses four people to starvation two weeks after its rescue, and
that number is reported in full above: under the new prereg it is
trajectory divergence, not a cost of the walk home, because the walk
fed the player (day 13 kcal 2390) and the deaths fall 13–14 days later.
The one place the rule does not reach is a villager standing one tile
from home (see Blanks) — adjacent, fed-looking, and still not walking
in, until the village loses them to starvation on the spot.

## Reachability verdict
No reachability movement is claimed. Waves 1–2 in the pilot band
(wave 2 in 7 of 8 seeds both legs); confirm band max wave 3 (seed
10773, both legs, unchanged). The 30-day horizon cannot observe
regional, national, table, or win reach, and this arm never touched
those systems. Vests, Arc II/III/IV, and wave 4–5 reach are untouched
by this run.

## Wall numbers (every run)
National / table / wins: NOT OBSERVABLE in a 30-day horizon — reported
as such, never as movement. Wave 4–5 unlocks: none in any leg (max
wave 3, confirm band, both legs identical). Median survival: 30 days
(pilot both legs; confirm both legs). No wall movement is claimed or
implied.

## Panel limitation (per prereg, same as Arm C)
No scripts/balance-panel.js compare is attached: the panel's contract
metrics do not include stranded evenings. Panel-style guard metrics
(deaths, starvation, wave reach) are reported from the corpora above
instead. This is the prereg's stated limitation, not a skipped step.

## Metric review (for the NEXT run — this run was judged only on the
new prereg above)
- G1-REVISED worked as designed: it separated the mechanism's own
  window (0 deaths) from later trajectory divergence (4 deaths,
  reported-not-judged) without re-scoring the killed verdict. A future
  prereg could revisit whether pooled totals should ever re-enter
  judgment at larger seed counts, but that is a NEXT-run question.
- The 7-day window is a judgment call, not a measured constant: no
  starvation death in either band falls days 1–7 after a step, so the
  verdict is insensitive to any window from 0 to 12 days on this data
  (the pilot cluster sits at +13/+14). A window of 13+ days would flip
  the pilot — disclosed here so a future prereg cannot silently move
  it.
- G2's "day or following day" window is unchanged from Arm C and was
  never triggered (0 hits in both bands).

## Blanks filled or documented
- FILLED (and GO, pending coordinator merge): the standing go-home
  mechanism — it eliminates every refused evening in 24 seeds, with
  zero causal-window starvation deaths and zero G2 hits.
- DOCUMENTED (finding for a NEXT run, NOT built here — this arm's
  prereg fixes the gate as specified, and changing a guard mid-run
  would break preregistration): the ADJACENT-TILE BLIND SPOT. On 10772
  days 10–11 the player stands at trail_edge (4,3), one hop from haven
  with a clear hop, and the standing step never fires. Debug run
  (guard values logged after daily): `playerAtHaven()=true` while
  `map=(4,3)`. Cause: `Game.playerAtHaven()` (src/js/game.js) is a
  narration-presence gate — Manhattan distance ≤ 1 from haven counts
  as "at haven" — while the step's guard treats it as "already home".
  A villager adjacent to home is therefore never walked in by this
  rule. A future prereg should use the tile check alone (map px/py ==
  haven px/py) for the already-home guard, and re-measure 10772: the
  expected effect is those 2 hop-clear evenings → at-home and the
  day-11 player starvation death avoided or displaced. Until then,
  hop-clear evenings adjacent to haven are the mechanism's known
  boundary.
- DOCUMENTED (not built): the detour-narration blank ("Travel N tiles
  to Haven" with no "going around" line); the trip-clearance vs
  hop-refusal disagreement on 10752 day 12.
- NOT BUILT, per prereg: trip-origin anchoring, detour flag on stoneRun
  walks, any narration fix, any src/js change.

## Files (this commit)
- evidence/2026-10-29/sim-standinghome-retry-b-prereg.md (NEW prereg,
  written before any judged after-leg)
- evidence/2026-10-29/sim-standinghome-retry-b.md (this file)
- evidence/2026-10-29/sim-standinghome-retry-b-corpus-after-pilot/
  (8 files, byte-identical to the killed run's after-pilot corpus)
- evidence/2026-10-29/sim-standinghome-retry-b-corpus-after-confirm/
  (16 files)
- scripts/test-standinghome-retry-b.js (placement + neutrality proof
  and new-prereg verdict computation)
- scripts/policies/competent.js (standing-home gate + helper + daily
  call + exports; default OFF)
- scripts/creekpath-trace-b.js (two non-destructive census fields)
- Verdict lines: pilot GO (primary 3→0, no-move 2→0, strand guard
  PASS, G1 causal 0 HOLD, pooled starvation 0→4 reported-not-judged,
  G2 0 HOLD); pooled GO (refused 7→0, no-move 5→0, strand guard PASS,
  G1 causal 0 HOLD, pooled starvation 7→11 reported-not-judged, G2 0
  HOLD).
