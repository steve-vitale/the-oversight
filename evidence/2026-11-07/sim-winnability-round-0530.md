# sim-winnability-round-0530 — Loop B 0530Z round (sitstep + firstkiller + stab)

**Run:** fleshout-loop-b-20261107T0530Z · **Axis:** scale-onramp / winnability chain ·
**Arms:** sim-sitstep-b (DIAG-GO), sim-firstkiller-b (DIAG-GO), sim-stageally-stab-b
(DIAG-NO-GO) · **All three DIAG, zero src/js, no gate/price/deed change.** All
three judged on the deliberately reused band 53001–53008 (150d death-aware,
staged policy `scripts/policies/competent-stageally-a.js` frozen).
**Merged:** sitstep-b `1dafd5a49`, firstkiller-b `59238bcca`, stab-b `ed070c955`
(with the re-pin below). **Round evidence:** this file (written in main-session
closeout; the run hit its 2h timeout before the round note was committed).

## Arm 1 — sim-sitstep-b: DIAG-GO (why a village that banks a living pair never sits)

The village never sat because the seat was never earned — not because anyone
refused it, and not because the bot failed to sit. On all 42 pair days on
53006, exactly two of the lesser seat's bars were missing and only two: the
village was still just a village (scale never moved past `village` on any
seed, on any day), and the feast surge was never spent in a real fight.
Everything else the seat asks for had been met for weeks. The game itself
said so, out loud, on day 90, on both pair seeds. The sit action was never
even reachable: the table preview was null on every day of every seed, so no
policy could have sat, and the "bot never sits" question is untested, not
answered. Bar: a single named ordered set explains the no-sit on 42/42
(100%) of pair days (bar ≥ 80%); on the current-master re-run it is 51/51
(100%). Proof 23/23. Corpora `perseed-sitstep-b/` + `perseed-sitstep-b-r2/`.
Evidence `sim-sitstep-b.md`.

The two gates, each in its own terms: (1) scale is not standing — standing
points do not enter `scaleRank()`; 53006 ended on standing 440, the highest
on the band, and stayed `village` on all 150 days. Regional needs the
Regional Dawn (a first accord + a bond 21+ days old); `networkLive` never
fired on any seed on any day. (2) The feast surge is a deed the village
never does — `feastSurgeUsed` marks when an ability resolves while feasted
in combat; the competent policy banked it on 1 of 8 seeds (53005, which
never reached wave 4), and on 0 of the 7 seeds that reached wave 4. The
pellet subplot (53006: bearer Larry, day 74–110) blocked the deed for 36
days by design, but the deed stayed unbanked for the 40 days after the
pellet died — the binding explanation is the feast drive itself, pellet or
no pellet. Sense-test notes: the veteran-kill announcement fires for
non-wave-4 kills too (4th sighting); teaching propagates villager to
villager with names attached; Thornfield and Stonebridge raided the pantry
on days 95–96 while Haven held no link with either.

## Arm 2 — sim-firstkiller-b: DIAG-GO (what kills first killers, and where)

A first killer dies in the next big turn-based fight — 7 of the 10 dead
first killers on this band died that way (pooled 70%), usually as the
scholar, usually alone or nearly alone, after biting about two-thirds of
the way through a fresh beast (median 8 rounds, beast at 32% HP when the
killer dies). Coverage 10/10 classified with quoted death records. Median
kill→death 10d armed vs 22d baseline — the staging policy changes how fast
the second killer arrives (median gap 25d vs 31d), not where the first
killer dies, so the pair forms through production speed while the first
killer still dies young. One starved at home a week after her kill, one
was taken by a stranger on the road, one died in a field fight the same day
she made her kill. The arena killed nobody, no contest killed anybody, and
nobody died of old wounds at home. Proof 117/117. Gate on the arm:
check.js --quick 283/7, the standing profile. Corpus
`perseed-firstkiller-b/` (16 files). Evidence `sim-firstkiller-b.md`.

The lever the channel implies is NEXT-FIGHT SURVIVAL (already named and
sized by killersurvive-b: ~50% more damage per round, or ~5 more rounds
of survival). Its one-shot shape has already been tried and killed: Loop
A's sim-nextfight-a (0515Z) built the VETERAN'S EDGE and NO-GOed (median
kill→death 5.5d → 9d, short of the 14d bar; TB share 87.5%), and the
build was reverted. This census adds why: the killer's SECOND next fight
is the same channel (TB) as the first, so a one-shot edge cannot move
the share; and a companion killer's own blows are a small share of the
side's damage, so a per-killer edge barely moves companion death
fights. The next shape is a persistent or per-kill-refreshing veteran
bonus (backlog), which needs its own prereg — not this arm's build, and
not a re-run of the killed shape.

## Arm 3 — sim-stageally-stab-b: DIAG-NO-GO (the staged trajectory is not uniquely fragile)

The confirm2 re-run went GO on the same band where the confirm went NO-GO,
with no lever change. This arm asked whether the staged leg is uniquely
fragile: inject one extra day-0 draw on the staged leg AND on the baseline
leg and measure the flip rate on each. **Staged flips 5/8, baseline flips
5/8, gap 0** → bar 1 fails (staged ≥ 3/8 holds, staged exceeds baseline
by ≥ 2 seeds fails); the bisection was correctly NOT run. The mechanism
half is answered in the negative: the confirm2 flip is NOT a
staged-subsystem effect. Draw census: the staged subsystems add only
~118–127 stageParty draws/day of ~3650/day (~3%) — draw volume is NOT
the amplifier; fragility is policy-general. Every pair's first divergence
is a `kill-ledger` entry at day 4–8: a different wave-1 beast dying first,
then the whole trajectory rewrites from there. Corpus 32/32 legs,
`perseed-stageally-stab-b/` + `stab-b-analysis.json`, 0 instrument
errors. Proof 43/43. Evidence `sim-stageally-stab-b.md`. Telemetry-check
refused (recorder corpus carries top-level `anchorCommit` — expected).

What the arm establishes instead: the game's trajectories are chaotic at
the one-draw scale on BOTH policies — a single displaced draw at day 0
rewrites the CLASS outcome on 5 of 8 seeds. Any master change that shifts
the draw stream by even one draw can flip a band verdict — which is the
more likely explanation of the confirm2 flip. Band verdicts carry the
trajfrag scope note: a verdict is about one draw stream, not about the
lever alone. Secondary (report-only): pair-formation perturbation
sensitivity, staged 3 pair-flips vs baseline 1 — on 8 seeds it could be
noise, but pairs are the chain's binding link; if pursued, judge pair
formation on the pooled pair-flip rate across a wider band.

## The re-pin story (both sitstep-b and stab-b moved on the same landing)

While these arms were merging, Loop A landed the vetkilltale (a
veteran-kill fireside tale for repeat wave-4+ kills — `src/js/game.js`
+97/−2, a new night fireside beat on the kill path). Both arms' proofs
broke on the rebase in the same way, and both were re-pinned to the new
master rather than reverted:

- **stab-b:** proof passed 43/43 pre-rebase, then **42/43** after rebase
  onto `f043aa772`. Failing check `live-staged-53006-matches-confirm2`:
  the leg read **standing 415, wave-4 kills 8** vs pinned 440/11. Root
  cause: the ONLY net src/js change between the branch's old base and
  `f043aa772` was vetkilltale (`ad665d5e5`, game.js vet-killer tale
  queue). **Causation PROVEN:** re-running the leg with
  `VETKILLTALE_OFF=1` reproduced **440/11 exactly**. Mechanism: the
  tale uses a DEDICATED mulberry32 stream (no shared draws) and
  `sayHavenNews` is pure — the shift is downstream (haven-news reads /
  fireside beat); the exact downstream draw was not isolated.
  **Finding for vetkilltale's record: its pilot claim "trajectories 8/8
  identical" holds only where no veteran tale actually fires; when tales
  fire (53006 staged: 8–11 wave-4 kills) trajectories shift (440→415,
  11→8).** Do NOT revert vetkilltale. Re-pin committed (`b0b813019`):
  440→415, kills 11→8, check renamed
  `live-staged-53006-matches-current-master`; proof re-run 43/43.
- **sitstep-b:** the same landing moved the same seed the same way —
  proof determinism leg failed 22/23 on rebase (53006: 51 pair days,
  standing 415, 8 kills vs 42/440/11); re-pinned, 23/23 green, verdict
  stronger (51/51 no-seat on the same ordered set).

Lesson (recorded for the next preregs): **any proof pinning ABSOLUTE
trajectory values (standing/kills on a named seed) is master-sensitive —
a landed narration-only change can shift it.** When a pinned leg moves
after a rebase, bisect by the env-off switch if one exists before
suspecting the instrument. The expectation was changed because the
master changed, never to force green — the re-run corpora independently
measure the same new numbers.

## Wall numbers (this run's judged corpora)

| leg | national | table | wins | wave-4 unlock | wave-5 unlock | median survival |
|---|---|---|---|---|---|---|
| sitstep staged replay (8) | 0 | 0 | 0 | 7/8 | 1/8 (53006, 5 kills) | 114.5d |
| firstkiller baseline (8) | 0 | 0 | 0 | 7/8 | 0/8 | 96d |
| firstkiller staged (8) | 0 | 0 | 0 | 7/8 | 1/8 (53006, 5 kills) | 114.5d |
| stab baseline unperturbed | 0 | 0 | 0 | 7/8 | 0/8 | 96d |
| stab baseline perturbed | 0 | 0 | 0 | 8/8 | 1/8 | 116.5d |
| stab staged unperturbed | 0 | 0 | 0 | 7/8 | 1/8 | 114.5d |
| stab staged perturbed | 0 | 0 | 0 | 7/8 | 1/8 | 96.5d |

Wins 0, national 0, table 0 everywhere. The chain runs end to end
through wave-5 kills and stops at the seat: no village on this band has
ever been regional, let alone national.

## Convergence

**scale-onramp: converging, NOT converged.** The seat's two blocking
deeds are both decomposed to named mechanisms — scale is the unasked
question (no village ever links; standing 440 does not open the door)
and the feast surge is never spent in a real fight — and the pair +
wave-5 facing half is proven reachable (53006: 5 wave-5 kills, 42–51
pair days). But no village has reached regional, no seat has been
earned, wins are 0 everywhere. The next work is building, not
measuring: a link-forming drive and a feast drive, then a sit drive
once a seat exists. (Both drives were built and landed by later runs —
linkdrive GO, feastdrive GO — and are recorded in their own round
notes, not claimed here.)

## Next blanks (in the order this run saw them)

1. **The link-forming drive** — propose on courtship-ready villages and
   answer link raises inside their 2-day window via a real conversation.
   Policy-side only, a measurement instrument — the propose verbs stay
   player-only per Steve's 2026-10-26 ruling.
2. **The feast drive** — hold a feast and spend the surge in a real
   fight on a wave-4-reaching seed (leadfeast family).
3. **The sit action once a seat exists** — a takeseat arm on a seed (or
   a lever) that actually earns a seat, so the sit count and the
   seat-taker choice can finally be measured.
4. **NEXT-FIGHT SURVIVAL, next shape** — persistent or
   per-kill-refreshing veteran bonus, judged on median kill→death ≥ 14d
   with the TB-fight share below 50%. The one-shot shape is killed; do
   not re-run it.
5. **Pair-formation perturbation sensitivity** — staged 3 pair-flips vs
   baseline 1; judge on the pooled pair-flip rate across a wider band
   if pursued.
6. **Why no accord ages 21 days** — accord attempts (or their absence)
   are not in any corpus yet; a recorder that watches link formation
   would say whether the policy never asks or asks and fails.
7. **The veteran-kill announcement** — fires for non-wave-4 kills too
   (4th sighting in sitstep-b); the backlog item stands.

## Infrastructure

- The run hit its 2h timeout during closeout; the main session adopted
  the stab-b arm (rebased `b0b813019` onto `32d79b713` clean, 6 commits;
  proof re-run 43/43; merged `--ff-only` → master tip `ed070c955`;
  tree released done-merged; branch deleted). The sitstep-b and
  firstkiller-b arms were already merged (`1dafd5a49`, `59238bcca`).
- Safe-commit index clobber hit the sitstep-b and firstkiller-b worker
  commits (files shown staged-as-deleted after correct commits);
  repaired with HEAD-blob cacheinfo, verified each time.
- The stab-b corpus stood at 31/32 at the coordinator timeout — the
  last leg (`stab-s53008-stab-staged-perturbed.json`) was re-run by the
  main session with the single-seed invocation; the driver refuses to
  overwrite, so a full-leg re-run was not possible and not needed.
- Telemetry: sitstep-b and firstkiller-b omitted the deviation check
  (DIAG arms, frozen policy + pure-read recorders — per sitstep-b
  precedent); stab-b's check refused the recorder corpus (expected).
