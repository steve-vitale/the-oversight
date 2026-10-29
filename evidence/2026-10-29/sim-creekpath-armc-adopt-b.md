# sim-creekpath-armc-adopt-b — ADOPTION EVIDENCE (Arm C: standing go-home rule)

## Adoption note
This run ADOPTS the stranded creekpath Arm C from the dead 0330Z loop-B run
(coordinator gone, heartbeats stale). It does not start over: the stranded
worktree `sim-creekpath-armc-b` (branch tip f67cc41df, which PREDATES the
Arm B landing) supplied its uncommitted work by COPY (never move):
prereg, before-pilot (8) and before-confirm (16) corpora, analyzer,
transcript instrument, and proof test. This tree is on current master
d09f5aaf9, which already contains Arm B (927de35c2,
COMPETENT_TRIPHOME_ROUTE_AROUND gate).

## Preregistration
The stranded prereg
(`evidence/2026-10-29/sim-creekpath-armc-b-prereg.md`, copied verbatim into
this tree) already states explicit GO thresholds for the after leg, so no
addendum prereg was needed. Summary of the binding terms:
- Substrate: GRANT_THIEF=1; harness gates FATAL
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, all legs;
  COMPETENT_ROUTE_AROUND UNSET every leg;
  COMPETENT_TRIPHOME_ROUTE_AROUND=1 in BOTH legs (before leg = Arm B's after
  behavior; the judged comparison is Arm C alone).
- Change (policy-side, `scripts/policies/competent.js` daily flow ONLY):
  gate COMPETENT_STANDING_HOME=1 (default OFF); helper `goHomeStanding`
  at the END of `daily()` after `competentEat`, firing only when the player
  is still away from haven, calling Arm B's `walkHome` with the detour flag
  on, banking `ctx.standingHomeDays` / `ctx.standingHomeDetours`. Guards:
  not already at haven, not game-over, not in combat, not inside a tent,
  haven tile on this board at village px/py (default 4,4).
  Deliberately NOT built: trip-origin anchoring, detour flag on stoneRun
  walks. None of those were built in this adoption either.
- Primary metric: pooled STRANDED evenings (evenings ending away while the
  direct hop home would be refused, probe `refused`, Arm B census
  definition). Pilot bar (10750–10757): after ≤ floor(before/2) AND the
  no-move bar, strand guard, G1, G2 all hold. Confirm bar (10758–10773,
  only if pilot passes): pooled after ≤ floor(pooled before/2) AND pooled
  no-move bar, strand guard, G1, G2 all hold. ALL must hold for a GO.
- No-move co-primary: pooled no-move refused evenings
  (`movedDuringDay === false`), same halving bar, pilot and pooled.
  A primary pass driven only by move-day strands while no-move strands
  persist is NO-GO.
- G1: no starvation-death increase vs before (deaths matching
  /starv|hunger/, pooled; player starvation deaths broken out).
- G2: a player death counts against the arm ONLY if it falls on a day with
  `tripHomeDetours > 0` OR `standingHomeDetours > 0` or the following day,
  AND does not also occur in the before leg for the same seed on the same
  day with the same cause.
- G3: perception-lawful only (own tile, home haven, engine-offered adjacent
  steps).
- Horizon: 30 days, death-aware (runDays stops at death). Why 30: the
  strands appear days 12–22; a 30-day horizon covers the full pattern
  without a 200-day tail the question does not need. Never a fixed 200d.
- Seeds: pilot 10750–10757 (10752 index case); confirm 10758–10773.
  No confirm spend on an after leg until the pilot passes its gate.

## STEP 2 — delta split (verified before applying anything)
`git diff` in the stranded tree against its base f67cc41df was exactly:
- `scripts/policies/competent.js` (+40/-few): the Arm C standing-home gate
  + helper + daily() call + exports. Arm B's TRIPHOME gate is NOT in this
  delta (it postdates the stranded base) and was NOT re-applied — it is
  already on this tree's master.
- `scripts/creekpath-trace-b.js` (+6): the Arm C probe fields
  (`standingHomeDays`, `standingHomeDetours` per-evening deltas). Kept:
  it is the Arm C census probe, non-destructive, and the instrument is
  identical across both legs.
After applying to this tree, `git diff` against master for competent.js
contained ONLY the standing-home gate + helper + daily call + exports —
nothing else. No unattributable change was found, so no stop was needed.
(The delta split itself is the adoption's first result; the policy change
was then KILLED at verdict — see below — so the committed tree carries no
policy trace of Arm C.)

## STEP 3 — before-leg verification (copied corpora)
All 24 copied files parse as JSON and are non-zero (pilot 8, confirm 16);
no corrupt/partial cell, so no deterministic re-run of any seed was needed.
Cross-check against Arm B's published after-leg numbers: pilot refused 3
(matches), pooled refused 7 (pilot 3 + confirm 4, matches), pooled no-move
refused 5 (pilot 2 + confirm 3, matches). The before leg reproduces Arm B's
after behavior exactly — the cross-check holds, and the judged baseline
remains this run's own before leg on identical seeds, per the prereg.
Before-leg detail: the only stranded pilot seed is 10752 (3 refused
evenings, strand length 3, forest_floor (1,4), rubble@2,4/intermediate);
the only stranded confirm seed is 10762 (4 refused, 3 no-move, plus 5
hop-clear away evenings). All other before seeds end every evening at home.

## Proof test (BEFORE any judged after-run)
`node scripts/test-creekpath-armc-b.js` → PROOF-GREEN (all placement
checks + all 8 neutrality checks). Placement behavior confirmed: C-gate OFF
moves nothing and banks nothing with the Arm B gate ON; C-gate ON reaches
haven on a clear hop and via detour (10757 (3,3): creek@3,4/intermediate,
route len 2, 1 detour step; 10752 (1,4): rubble@2,4/intermediate, route
len 5, 1 detour step), moves nothing with no route, fires nothing at haven
or inside a tent. Gate-off neutrality: the banked before-pilot corpus
reproduces the Arm B after-pilot corpus evening probes exactly, seed by
seed. NOTE (kill record): this proof script is committed as the record of
what was proven while the arm lived; after the kill below, the policy
helper it imports no longer exists, so it is expected PROOF-RED against
the reverted tree by design — it is not a green test of the committed tree.

## STEP 4 — after legs
After-pilot run (8 seeds, identical, COMPETENT_STANDING_HOME=1, every other
gate identical): all 8 seeds survived 30 days, 0 refused evenings.
After-confirm was NOT run: the pilot gate failed (see verdict), and the
prereg forbids confirm spend until the pilot passes. The banked
before-confirm corpus (16 seeds) is committed unused, for a future run
under a revised prereg if one is ever written.

### Pilot numbers (analyzer output, before → after)
- Primary stranded (refused) evenings: 3 → 0. Bar: after ≤ 1. PASS.
- No-move co-primary: 2 → 0. Bar: after ≤ 1. PASS.
- Strand guard: 10752 longest strand 3 → 0, count 3 → 0; all other seeds
  0 → 0. No violation. PASS.
- Hop-clear away evenings: 0 → 0. Out-of-reach away: 0 → 0.
- Standing-step census (after): 1 day fired (10752 day 12), 2 detour steps
  banked, that seed's strand eliminated.
- G2 counterfactual player deaths on/after detour-or-standing days: 0. HOLD.
- G1 starvation deaths: 0 → 4 (player starvation deaths 0 → 0). VIOLATION.
- Median survival: 30 → 30 days (all pilot seeds survived in both legs).
- Death counts per pilot seed, before → after: 10750 8→8, 10751 6→6,
  10752 8→14, 10753 5→5, 10754 11→11, 10755 11→11, 10756 7→7, 10757 6→6.
  Seven of eight seeds are byte-identical in death counts — a clean
  single-variable experiment; only 10752 diverged, and it diverged exactly
  at the standing step.

### The G1 violation, in detail (seed 10752)
After-leg deaths on 10752 include four villager starvation deaths, none of
them the player: day 25 theo_lindqvist, day 26 owen_smith, day 26
gen_5vu77j1, day 26 olivia_bennett — all cause `starvation`, player False.
The before leg on the same seed has zero starvation deaths. The cluster
falls 13–14 days after the single standing step (day 12), alongside other
trajectory shifts in the after leg (extra monster deaths days 14 and 17, a
wound death day 23, sickness deaths days 21 and 26; the before leg's day-15
player 'the wild' death and day-28 sickness death do not recur). There is
no player starvation death in either leg. Read honestly: this looks like
trajectory divergence (a consequence cascade after the rescued day)
rather than a direct starvation cost of walking home — but the prereg's
G1 counts pooled starvation deaths regardless of causality, and §14 binds:
a miss is NO-GO, never re-scored against a friendlier metric mid-run.
The mechanism-review proposal for a NEXT run is recorded under Metric
review below; it does not change this verdict.

## STEP 5 — VERDICT: NO-GO (pilot gate fails on G1)
Primary PASS, no-move co-primary PASS, strand guard PASS, G2 HOLD — but
the pilot bar requires ALL to hold, and G1 fails (starvation deaths 0 → 4).
Per the prereg and the killed-arm rule, Arm C is KILLED at pilot:
- No confirm after-leg was run.
- ALL policy/code changes were reverted to master (competent.js and
  creekpath-trace-b.js restored; `git diff` against master is empty for
  both). No trace of Arm C remains in game/policy code.
- This commit carries evidence + proof/measurement scripts only: the
  prereg, before-pilot and before-confirm corpora, after-pilot corpus,
  analyzer, transcript instrument, proof test, and this evidence file.
- The standing go-home rule is NOT in the game. A future attempt needs a
  new prereg (see Metric review), not a revival of this commit's code.

## Sense-test (transcript, seed 10752, after leg)
The rescue itself reads as a real villager day, not a teleport. The day
wanders, forages, and twice hits the blocked hop home, narrated honestly:
"Rubble chokes the path." — `travel->(4,4) now=(1,4) REFUSED rubble`.
At day's end the villager walks home around the blockage and the game
says, verbatim: "You walk back into Haven. 15 Codex entries. The village
is glad to see you." The before leg's version of this seed ends days
12–14 stranded at (1,4) with kcal 890 → 137 → 0; the after leg ends day 12
at home and day 13 at kcal 2390. That is the mechanism working exactly as
designed — which makes the G1 kill a guard kill, not a mechanism failure.
Narration blank (documented, not built mid-run): the detour walk itself
has no "going around the rubble" line — it arrives as a plain
"Travel 3 tiles to Haven." A future standing-home attempt should narrate
the detour step, so the player can tell a routed return from a clear hop.
A second, pre-existing oddity in the same transcript (not Arm C's): the
day's trip says "You clear the rubble, stone by stone. The path is
clear." and the hop home is still refused afterwards — the trip's
clearance and the hop's blockage disagree, and the villager never comments
on it. That belongs to the trip/blockage area, not to this arm.

## Village assessment (plain words)
Before Arm C, the village in these 24 seeds is a healthy, home-every-night
village with exactly two exceptions: one seed strands a single villager
for three evenings until the village effectively loses and re-finds them,
and one seed strands a villager for four evenings plus five evenings
spent away at a clear hop home, never going home. Everyone else sleeps at
home every night; waves reach 2 in the pilot band, nobody's village dies
in the pilot, and the two confirm villages that end early (10760 day 28,
10761 day 22) end village-lost with no stranded evenings at all — their
troubles are elsewhere. Arm C fixes the pilot strand completely and
visibly — the rescued villager eats, recovers, and stays home — but the
rescued seed's village then loses four people to starvation two weeks
later, a cost the prereg counts in full. The village that the arm saves
on day 12 is not observably better fed by day 26. That is why the arm
dies despite working: the guard, not the rescue, is the verdict.

## Reachability verdict
No reachability movement is claimed. Waves 1–2 only in the pilot band
(wave 2 in 7 of 8 seeds both legs); the 30-day horizon cannot observe
regional, national, table, or win reach, and this arm never touched those
systems. Vests, Arc II/III/IV, and wave 3–5 reach are untouched by this run.

## Wall numbers (every run)
National / table / wins: NOT OBSERVABLE in a 30-day horizon — reported as
such, never as movement. Wave 4–5 unlocks: none in any leg (max wave 2 in
the pilot band). Median survival: 30 days (pilot, both legs); before-confirm
median 30 days (22–30 range). No wall movement is claimed or implied.

## Panel limitation (per prereg, same as Arm B)
No `scripts/balance-panel.js` compare is attached: the panel's contract
metrics do not include stranded evenings. Panel-style guard metrics
(deaths, starvation, wave reach) are reported from the corpora above
instead. This is the prereg's stated limitation, not a skipped step.

## Metric review (for the NEXT run — this run was judged only on the prereg above)
- G1 as written counts ALL village starvation deaths pooled, with no
  causal window and no player/non-player distinction beyond the breakout.
  On a single diverged seed, a 13-day-later 4-death cluster kills an arm
  whose mechanism worked and whose player never starved. A future prereg
  could judge G1 on player starvation deaths, or on starvation deaths
  within N days of a standing step, or require the pooled confirm band
  before a single-seed cluster kills — but any of those is a NEW prereg,
  and this run's NO-GO stands under the prereg it ran under.
- The before-confirm corpus is banked and valid; a future run under a new
  prereg can reuse it as its before leg without re-spending those seeds,
  provided the instrument is unchanged.
- Narration for routed returns (detour step named in the log) should be
  part of any future standing-home prereg's sense-test, not an afterthought.

## Blanks filled or documented
- FILLED (then killed with the arm): the standing go-home mechanism itself
  was built, proof-tested, and measured — it eliminates the pilot strand.
  The fill does not survive, by the killed-arm rule.
- DOCUMENTED: the G1 cluster (10752 days 25–26, four villager starvation
  deaths after a day-12 rescue); the detour-narration blank; the
  trip-clearance vs hop-refusal disagreement on 10752 day 12.
- NOT BUILT, per prereg: trip-origin anchoring, detour flag on stoneRun
  walks, any narration fix, any confirm after-leg.

## Files (this commit)
- evidence/2026-10-29/sim-creekpath-armc-b-prereg.md (copied stranded prereg)
- evidence/2026-10-29/sim-creekpath-armc-b-corpus-before-pilot/ (8 files)
- evidence/2026-10-29/sim-creekpath-armc-b-corpus-before-confirm/ (16 files)
- evidence/2026-10-29/sim-creekpath-armc-b-corpus-after-pilot/ (8 files)
- evidence/2026-10-29/sim-creekpath-armc-adopt-b.md (this file)
- scripts/analyze-creekpath-armc-b.js, scripts/creekpath-transcript-armc-b.js,
  scripts/test-creekpath-armc-b.js (stranded instruments, copied)
- Analyzer pilot output: primary 3→0 PASS, no-move 2→0 PASS, strand guard
  PASS, G1 0→4 VIOLATION, G2 0 HOLD → OVERALL BAND1 NO-GO.
