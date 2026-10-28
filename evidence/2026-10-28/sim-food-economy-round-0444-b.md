# Loop B round 0444-b — food-economy: cultivate hall gate verified, births band finds no home children (coordinator evidence)

Run: fleshout-loop-b-20261028T0444Z. Axis: food-economy (converging).
Loop A was live on scale-onramp the whole run (0416Z claim: sim-wallwounds-a,
sim-w4convert-a, sim-seatpath-a) and was NOT touched; the tackle-armor tree
was NOT touched. Pre-flight: main tree clean, disk 18%, worktree-reap left
only other owners' active trees alone.

## Arm 1 — sim-culthall-b: GO (measurement only, zero game code)

Question: findings-backlog item 1281 — cultivate is gate-blocked on fresh
setup ("Step outside the hall"). The spandraw arm had called this a fixture
fact, not a defect claim. This arm closed it with a real-play sequence.

Prereg 9beef92f3 (committed before any judged probe). Fresh pilot band
10400-10407, 8 seeds, no collisions with prior bands.

- Leg A (inside the hall): cultivate refused with the exact reason, zero
  state change (day, kcal, beds, position, clock identical) — 8/8.
  Break-ground inside: same refusal, zero state change — 8/8.
- Leg B (after the game's own Step outside action, Game.exitBuilding):
  player outside on the Haven tile — 8/8. Garden work then fires (beds
  0→1, kcal 2,200→2,080, the documented 120 cost) — 8/8. The cultivate
  gate after exit is no longer the hall reason; the next honest reason is
  "no growing bed yet" (no crop sown — a later gate, not the hall gate).

Player-visible lines, quoted verbatim: inside refusal — "Step outside the
hall to work the garden. (Cultivate the beds)"; exit — "You push through
the doors into open air. Haven grounds — tents, a fire pit, worn paths.
The world is that way."; breaking ground outside — "You break ground
behind the hall — bed 1 of 2, turned and ready. Sow seed to start a crop."
Sense judgement: legible — the refusal names the action and the door
button is literally labelled "Step outside", so the words match.

Caveats, stated not hidden: no phone tap is claimed (app.js is DOM-only and
excluded from the node harness by design; the button→function link was
verified in code and the engine call itself was executed). National/table/
wins do not apply to this fixture/sequence arm and are not reported as
numbers. No balance-panel compare was fabricated — no before/after game
leg exists; the replication check is the 8-seed band with per-seed
exactness. No canon doc covers ability-action refusals or the garden gate
specifically; docs/GARDENS.md ("all hands-on work requires Haven grounds,
outside the hall") is the covering canon and the gate matches it.

Coordinator proof: re-ran `node scripts/test-culthall-b.js --all` in the
worktree before merging — exit 0, GO seeds 8/8, worktree still clean.
Merged as c569229bd (evidence) on top of prereg 9beef92f3.

Disposition: backlog 1281 is CLOSED-AS-VERIFIED by this arm. This is NOT a
code fix and must not be reported as one.

## Arm 2 — sim-childbirth-b: DIAG-NO-GO (measurement only, zero game code)

Question: the 0330Z blank (2) — a child pantry eat needs a births band.
Arm sim-outflowzero-b proved the child-eat door on fixtures (150 kcal
exact) but counted zero unscripted eats because competent rosters hold
0 children in 96 roster slots.

Code read first (all src/js/game.js): the only birth code is
simVillageDay (~10068-10101): day ≥ 270, 0.5%/day, ≥2 partnered adults
18-40. It runs only for distant villages (via catchUpSim on approach and
tickJoinedVillage for the joined village) — never for the player's home
village. Distant villages do start with children (genVillageRoster, 30%
ages 1-14), but villagerTurn, npcsOnNode and ensureVillagerPositions all
filter only state.village.roster, so distant children never get positions,
turns, or pantry access. Home rosters start adult-only (genCharacter
occupation bands, minAge ≥ 19) and no path ever adds a child. Canon note:
docs/KIN.md says kept adults' children "stayed with the villages and grew
up normally" — no code implements that at home. This is a fiction/code
gap, not a policy gap.

Prereg d40488d7d (committed before any judged probe). 300d death-aware
pilot band (cap justified: birth rolls only fire at village day ≥ 270, so
a 100d band cannot even roll a birth), competent-nofeast, fresh seeds
10410-10417. Stockdoors capture reused unchanged. 8/8 corpus files, sweep
exit 0.

- Home children: 0/0 (start/end, 96 roster slots; end ages min 19 every
  seed). Home rosters only shrank (12 → 1-9) as villagers died.
- Distant children: 40 living across 29 generated villages — the band
  found children, and one real birth in the game's own words: "👶 A baby
  was born to Nora on day 293 — still unnamed" (Ashford, seed 10417).
  The end census shows Ashford with 1 dead member and 0 living birthDay
  members, so that baby did not survive to the census (inference from
  counts; the corpus lacks member-level death records).
- Child pantry eats: 0 calls, 0 records. The children and the pantry live
  in different villages the turn engine never connects.

Wall numbers (this band only, never pooled): national 0/8, table 0/8,
wins 0/8 (expected: competent-nofeast, SEATDRIVE=0 pre-seat band); wave
max 4 (2/8), wave 5 0/8; median survival 300d (4 capped, 4 villages lost
at 21/22/159/268); 1,670 village-days; deaths dominated by the arena (53)
and contests (12).

No confirm spent, per the prereg rule for a DIAG-NO-GO with a counted
structural explanation. Named next instrument (prereg candidate
confirmed): a home-village birth path mirroring simVillageDay's birth
block into the home daily tick — a home-born baby would reach the door
(home roster id + positions + turns), while distant births alone never
can. This is a game change and a Steve-call (it changes who lives in
Haven); no code was changed here.

Caveat: a single-seed diagnostic re-run of 10417 did not reproduce the
sweep's Ashford (roster 9 vs 7, no birth) — the judged record is the
internally consistent sweep corpus; single-seed re-runs of multi-seed
single-process sweeps should not be treated as reproductions.

Coordinator proof: rebased the branch onto the culthall tip clean (zero
file overlap), re-ran the analyzer on the rebased checkout — exit 0,
per-seed rows reproduce the worker's headline (homeChildEnd 0 all seeds,
childCalls 0, distant children present, Ashford birth line quoted).
Merged as b61d48b00 (evidence; instruments 04dcb2666, prereg abe253d82
after rebase).

## Telemetry deviation check

On the childbirth corpus (n=8): 3 LOUD lines (national 12→0, table 16→0,
wins 16→0) — the known WINSEAT-baseline vs pre-seat-band regime artifact
class, same as the worker's own check. Baseline NOT rolled, no exiled
line, no new investigation. The culthall corpus is a fixture corpus and
was not telemetry-checked (no wall fields exist for it).

## Metric review (MEASUREMENT.md §14)

- Culthall: prereg held exactly; no re-scoring. The verdict is a gate
  verification, not a lever win — reported as such.
- Childbirth: the prereg GO bar (≥1 unscripted child pantry eat) was
  missed for a counted structural reason (no home birth path exists), so
  the verdict is DIAG-NO-GO, not a re-scored pass and not a kill of the
  child-eat door itself (the door was already fixture-proven by
  outflowzero). The single-seed non-reproduction above is a method note
  for the next prereg, not a reason to re-judge this corpus.

## Village assessment (plain words)

The garden gate is honest: the game tells you to step outside, the door
does what it says, and garden work starts once you are out. Nothing to
fix there. The village itself, though, is a village with no children in
it: babies are born only in far-off villages you may visit, and those
children never get a turn, a position, or a meal from your pantry — so
the child-eat door, though real, can never fire in home play. Until a
home birth path exists (a Steve call, since it changes who lives in
Haven), every child-related pantry claim stays fixture-only.

## Infrastructure

Registry-lock contention queued both worktree registrations and
heartbeats (waited out, ~2.5 min at registration). Safe-commit index
clobber hit all worker commits; workers repaired via HEAD-blob cacheinfo
and the coordinator verified clean status after each merge. No EPERM
flap hit this run. Master moved only by this run's own merges during
closeout. Loop A trees remained active and untouched throughout.

## Convergence line

food-economy stays converging (NOT converged): the hall-gate blank is now
closed as verified working, but the scale wall is untouched by this axis
and the home-birth gap is open with a named, Steve-call instrument.
scale-onramp stays converging (untouched; loop A live). Claim deleted;
lock deleted.

Next blanks, in order: (1) home-village birth path (Steve-call game
change, own prereg — distant births alone can never reach the pantry
door); (2) a caught lift's trust narration is unobserved (0330Z blank
3); (3) the once-a-day predictor's clock-advancing cost scope and the
_actionAvailable target=null button-state note (0330Z blank 4).

Merged locally, pending ship. No push, no bump, no live verification
(ship-loop line).
