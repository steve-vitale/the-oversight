# Loop B run fleshout-loop-b-20261104T2125Z — coordinator evidence
## Axis: scale-onramp (winnability-chain re-point, Steve 2026-11-03)

Loop A live on food-economy throughout (2115Z exphurt-land-a-recovery +
upkeepbreakfast) — NOT touched. No gate/price/deed change in either arm.
Zero src/js in both arms. Re-point queue check at run start: (1) toggle
run DONE, (2) flee-repair build DONE, (3) standing accumulation DONE
(1830Z run). The 2015Z run's named next blanks (1) two-track veterans
work were this run's arms, on the shared gearbar band 99101–99108,
competent verbatim, 150d death-aware.

## Arm 1 sim-vetencounter-b (track A: encounter opportunity) — DIAG-NO-CANDIDATE
Unlocked-but-unmet villages do NOT fail on spawn or reach. They fail on
TRIGGER: wave-4 monsters arrive, reach the player's tile, and nobody ever
fights them. Break counts: TRIGGER 5/8, SPAWN 1, UNLOCK 2 — one short of
the prereg 6/8 bar; both target seeds (99102, 99106) break at TRIGGER.
99102: 6 wave-4 spawns, 4 on the player's entry tile; the d83 eulogy
drifted and lost the trail after 5 days (monsterTurn lost-sight
removal), the d90 eulogy wandered 26 days unfought. 99106: 4 spawns, 1
on the player's entry tile, still wandering unfought at village death.
Tile co-location is not detail-grid contact, and that contact never
happens; villagers shared tiles with these monsters at snapshot time
and still never produced a field fight. Supply was never binding: the
world sits at/above its monster cap on ~all post-unlock snapshots, but
tile-entry spawns bypass the cap and delivered 36 of 48 wave-4 spawns.
Instrument errors 0 (760 daily snapshots, 48 post-unlock wave-4 spawns,
22 casts, 42 fights); proof 15/15. Sanity check exact vs vetprod on all
8 seeds (unlocks 6/8, faced 4/8, days / peak gated standing / fights /
kills). Metric review (in arm evidence, carried as next prereg
revision, NOT this run's verdict): 99101 binds SPAWN only because its
first two recorded "fights" come from non-world paths (d66 field evade
vs a congregation with no world spawn; d69 feast-scavenger influencer);
a wild-only sensitivity recount puts 99101 at TRIGGER and the count at
6/8. Next run's prereg must stack-classify world-vs-contest/feast/trap
fights + track detail coords. Known blind spots: daily snapshots miss
intraday wander; say-sample cap fills before unlock; instance-fight
correlation by id + alive window is approximate.
Commits (rebased onto 570daa9c5, proof green after rebase and on merged
master): bd096ea53 prereg, 2704003b0 instruments + proof, fefd74807
pilot + evidence. Arm evidence evidence/2026-11-04/sim-vetencounter-b.md;
corpus perseed-vetencounter-b/ (8 files).

## Arm 2 sim-vetshape-b (track B: living-or-dead shape) — DIAG-NO-CANDIDATE
Fresh pilot reproduces vetprod's shared numbers EXACTLY on all 8 seeds
(days, end reasons, peak gated standing, fight/kill counts, engine daily
max vets, killer identities/days/deaths). Primary (prereg-bound): shape
≥2 on 2/8 seeds (99101, 99104), living ≥2 on 0/8; bar was shape ≥5/8 —
not met, not close, not re-scored. Counting dead killers would NOT have
released any village: zero counterfactual-ready days on all 8 seeds
under both definitions. The prereg's gated-standing definition proved
circular (engine caps gated at 199 while held) — caught and fixed to raw
standing BEFORE judging (V2 also reads 0, for a real reason). Why zero:
99101 shape-2 window d123+29d has raw standing 310–355 but armor/weapons
legs short every day (only-veterans-short days end d105, 18 days before
the second killer); 99104 has raw 200 with only veterans short d147–148
and the second killer arrives d149, the day the weapons leg slips.
14-day grace buys nothing; 30-day grace buys 24d (99101) + 2d (99104)
with no overlap of an all-other-legs-met day; 60-day grace equals
cumulative shape. Survivorship re-confirmed: kill-to-death [0,0,2,5,7,14],
median 3.5d; causes wild ×3, arena ×1, contest ×1, wound ×1;
died-before-second-banked TRUE on 2/2 multi-killer seeds — the banking
interval (17–28d) dwarfs killer survival. Do NOT flip the VETSHAPE
default on this evidence: it changes the count on 2/8 seeds and the
outcome on 0/8. Named next-arm proposal (not built): survivorship +
gear-stability as one arm — keep wave-4 killers alive through the
banking window AND hold gear legs steady across it, release days as
primary. Proof 36/36. Sense-test: veteran-word collision reproduces
verbatim (System celebrates wave-3 kills as "veteran kills" while
warning of "A Scarred veteran" / "A Elder veteran" monsters); village
voice reads as people deliberating, no robotic behavior flagged.
Commits (rebased onto 570daa9c5, proof green after rebase and on merged
master): cea9abf69 prereg, 171d65985 instruments + proof, 5acb9755d
cf-ready V2 fix + test, a86844e64 pilot + evidence. Arm evidence
evidence/2026-11-04/sim-vetshape-b.md; corpus perseed-vetshape-b/
(8 files).

## Wall (both corpora agree)
Wins 0/8, national 0/8, table 0/8, wave-4 unlocks 6/8, wave-4 faced 4/8,
wave-5 unlocks 0/8, wave-5 faced 0/8, readiness-5-ready days 0/8, median
survival 94d. (Vetencounter did not instrument death-cause shares —
not reported, not guessed.)

## Telemetry deviation check
REFUSED by the tool on both corpora (recorder-corpus shape, same as the
1830Z/2015Z runs); baseline NOT rolled, no LOUD lines, no investigation
item.

## Infrastructure
Master moved three times under the run (Loop A exphurt-land-a, then
upkeepbreakfast phases 1–2); both branches rebased clean (zero file
overlap), proofs green after every rebase and on merged master.
Safe-commit index clobber hit worker commits — repaired via HEAD-blob
cacheinfo each time, commits verified correct. One transient EPERM flap
blocked vetshape's final commit twice (third attempt succeeded) and
zeroed vetencounter's final seed file (recovered per the flap lesson:
re-ran seed 99108 alone to /tmp, copied with a size check, deterministic
re-run, same code). Orphaned sim-tendfloor-guard-b tree (B 1434Z,
uncommitted changes) left untouched — reaper will not remove dirty
trees; it does not block this loop (11/16 active at closeout).
Both trees released done-merged, branches deleted, final reap run, main
tree clean at closeout. No push, no bump, no live verification (ship
loop owns deploys).

## Next blanks, in order
(1) Trigger-mechanism arm — why tile co-location never becomes a fight
(detail-grid contact rule? competent leaving the tile? monster
wander/lost-sight?), carrying vetencounter's prereg revision
(stack-classified world-vs-contest/feast/trap fights + detail-coord
tracking); (2) survivorship + gear-stability as one arm (vetshape
proposal, release days as primary); (3) veteran-word collision naming
pass (design eye, not a sim, not a mechanics change); (4) STEVE-CALL —
who should ask; (5) HOLDING, not asking (sibling polity work owns in
part — do not duplicate); (6) standing accumulation, part 2 (re-measure
release once a village both meets wave 4 and keeps two killers alive);
(7) carried: tend band-count rule (two of three bands), LIVE-SIM
fallback firing, approach guardrail 12-seed re-test on 99601–99612,
BELONG clear on a belongseek substrate, 99101 hold-beat re-finding per
anchor, wave5faced label rename. NO gate/price/deed arm follows.
food-economy untouched (sibling Loop A).

scale-onramp stays converging (NOT converged): the veterans shortfall
is now split into two named mechanisms rather than one lever — trigger
failure for unlocked-but-unmet villages, and a simultaneity + gear-leg
failure for villages that do kill — but the full seat is still unwon,
wave-5 kills still 0, readiness-5-ready days still 0/8. Claim deleted;
lock deleted.
