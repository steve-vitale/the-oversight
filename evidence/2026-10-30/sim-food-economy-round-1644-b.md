# sim-food-economy-round-1644-b — Loop B stale-lock recovery + adoption run

Run: oversight-flesh-out-loop-b, run_id fleshout-loop-b-20261030T1644Z, axis
food-economy (converging, NOT converged). Loop A live on scale-onramp
(1639Z claim: tributecost-a + refusalsay-a) — NOT touched.

## Stale-lock recovery (at run start, per body guard)

Previous B lock fleshout-loop-b-20261030T1436Z was 2h old with all three
arm worktree heartbeats 35–49 min stale and no live B sim processes.
Deleted the lock, retired its claim to
lever-claims/fleshout-loop-b-20261030T1436Z.json.DEAD, and adopted its
three arms in their existing registered trees (no new worktrees
registered). This run therefore LANDS the dead run's work; it ran no new
sweeps of its own. Pre-flight: main tree clean, disk 22% (24% at close),
worktree-reap exit 0.

## Arm 1 — sim-contestdeath-b: LANDED (merged locally, pending ship)

Fix (src/js/contests.js, +42 lines, `_cxKillContestant` only): after roster
removal, call registerDeath (kind villager, cause contest, killerId null)
and, on first registration only, push the fallen entry mirroring the
lethal-hurt branch; remove the corpse registerDeath builds (contest
deaths happen off-map in the System's arena — no honest field tile, so no
field corpse by design, and no canon doc covers body return, so none was
invented). Commit carries [needs-eyes]: the grief/memorial change is
player-visible.

Verdict GO, re-verified by the adoption worker AND by the coordinator on
the rebased tip: proof scripts/test-contestdeath-b.js 43 passed, 0
failed; corpus 72/72 after-leg contest deaths with death tele + fallen
entry vs 0/72 before (bar >= 0.80); zero duplicate-grief cases (one grief,
one contest_died gossip, one tele, one fallen per death); roster-exit
counts and contestDeathsById counts identical before/after per pair
(72/72). No drive errors. Rebased clean onto master twice (sibling
landings moved master under the run); final merged tip 06b502d53.
Evidence: evidence/2026-10-30/sim-contestdeath-b.md (+ prereg, driver,
proof test, 145 per-pair corpus JSONs).

Plain words: a villager who died in a contest used to vanish from the
records — the village said the death out loud but never wrote it down.
Now the death notice fires, the name goes on the memorial roll, and the
village grieves exactly once. Nothing else changes: same villagers die
on the same seeds; deaths are recorded, not invented.

## Arm 2 — sim-armorfetch2-b: LANDED (merged locally, pending ship)

Fix (src/js/villager-build.js, exactly +77 lines, 0 deletions):
Game.vesselArmorFetch(), called from villagerBuildDay immediately after
the landed vesselStashFetch weapon fetch. Once a day at haven, the
vessel fetches their own best stashed ARMOR into the pack when it beats
what they wear in its slot (empty counts as beaten). Own stash only,
one armor fetch per day, own day flag so it can never block the weapon
fetch; wearing stays on the normal gearUp/UI path — the fix OFFERS the
choice, it does not force the wear. Nothing granted, nothing generated.

Verdict GO, re-verified by the adoption worker AND by the coordinator on
the rebased tip: proof scripts/test-armorfetch-b.js 38 passed, 0 failed,
Part C SKIPPED (disclosed: the EPERM flap destroyed the 8-seed pilot
corpus as 0-byte files; the GO rests on the verdict driver, which ran
pilot 16101–16108 and confirm 16109–16116 exit 0 — the corpus-dependent
claim is NOT made). Acceptance 3/3 WORN (16103 swat_vest torso P35,
16101 bark_armor torso P10, 16109 farstrider_boots shoes P12; bar
>= 2/3); full band 16/16 WORN. Cost bar holds: village-lost 0/16 after
vs 1/16 before (bar <= 2), median daysAlive 60 after vs 60 before (bar
>= 48), max wave 3 both legs, wins 0/16 both. Prereg sha256 verified
unchanged (6cce52d3…fd729c). Balanced panel (§15): review_required, NO
regression_signal; tier-3+ access is a watch item (0.5 -> 0.3125, interval
includes 0), not a regression call. Final merged tip 3e94b55cc.
Evidence: evidence/2026-10-30/sim-armorfetch-b.md (+ prereg, panel
compare .md/.json, panel-before/after panel.json.gz, 5 scripts).
Rebased clean onto master; diff vs master still exactly +77.

Plain words: the same forgotten-gear absurdity the weapon fetch fixed,
for armor — a stashed vest or boots now gets picked up at haven and worn
the next day instead of sitting in the pile forever.

## Arm 3 — sim-warmthdisp-b: DISPOSITION ONLY, do NOT merge

Verdict SUPERSEDED-DUPLICATE, re-verified: test
scripts/test-warmthdisp-b.js exit 0 on branch sim-warmthdisp-b.
Stranded branch sim-warmthrestraint-b duplicates the already-landed
sim-warmthrestr2-b judgment (2067af34e): all verdict aggregates exact
across guard/on/r1/r2 on the same 10 seeds, all 40 nighttravel corpus
files byte-identical (SHA-256). Guard strand on seed 15215 is 3 nights
(days 7–9) and R1/R2 preserve it exactly; R1/R2 retain zero warmth
benefit (warmActed 0, warmLogSpent 0), while unrestrained "on" stretches
the strand to 10 nights (days 7–16). Merging would only conflict on
scripts/policies/woodwarm.js for a cosmetic tagging difference.
Preserved on branch sim-warmthdisp-b at 1c2b10807 (evidence + prereg +
comparison test committed); branch and tree NOT released, NOT deleted,
NOT merged. Sibling tree/branch sim-stranded-warmth-b /
sim-warmthrestraint-b untouched.

Plain words: two different wordings of the same "don't burn the bridge
wood" rule give exactly the same nights out in the cold — there is
nothing new to land.

## Wall numbers (this run — adoption run, no new scale sweep)

Armorfetch recorder band (60d, 16 seeds, competent): wins 0/16 both legs,
national 0, table 0 (pre-seat recorder band, not a scale claim), median
survival 60d capped both, max wave 3 both, village-lost 0/16 after vs
1/16 before. Contestdeath is a death-record instrument, no scale claim.
Overall wall UNCHANGED by this run: full seat 0, wave 5 0 — stated, not
hidden. No food-economy default flipped; no balance change landed.

## Telemetry deviation check (§15 step 10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-30/sim-contestdeath-b-confirm-after-*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national/table/wins ->
0, n=48 files), exiled clean. INVESTIGATED and EXPLAINED as a regime
artifact: the confirm-after files are death-record pairs (one per
recorded death), not scale sweeps — they carry no national/table/wins
fields, so 0 is an input-shape artifact, not a regression. Same artifact
class as the 1332Z stashfetch corpus LOUD lines. Baseline NOT rolled.

## Sense-testing (read, not just counted)

Contestdeath narration coheres: the village's spoken death ("X is
gone") now matches the written record (tele + memorial + one grief
event) instead of contradicting it, and no phantom lootable body appears
at the scholar's feet. Armor fetch coheres: day-1 narration (weapon
line, then armor line, same night) followed by day-2 wearing on all
acceptance seeds, including non-torso slots. Warmth restraint coheres:
the pack counts down 4 → 0 across stranded nights while the "no bridge
tonight" narration repeats — the strand stretches exactly when the wood
is spent, and stays short exactly when the restraint holds.

## Metric review (§14)

Every arm was judged against its own dead run's prereg, unchanged: no
metric was re-scored mid-run, no bar moved. One review item for the NEXT
run: telemetry-check's sweep-row ingest counts any file with a numeric
`seed` field, so death-record pair corpora trip LOUD lines that mean
nothing — the check should be scoped to genuine sweep corpora, or its
LOUD output annotated by corpus kind before it is read as a regression
signal.

## Infrastructure

- Master moved twice under the run (journey-deepening 65d5083ce, gaps
  completion 1e151a6c5, both evidence/measurement-only, zero overlap with
  contests.js/villager-build.js). Both branches rebased clean with proofs
  re-run green, then merged sequentially with a rebase between merges.
  No conflicts, nothing forced.
- Registry heartbeat script and worktree-release script both run very
  slowly under today's registry contention (minutes, not seconds) but
  completed; a REGISTRY.json backup was taken before heartbeating.
- check.js --quick NOT re-run by the coordinator (sibling Loop A live;
  concurrent-jest rule). Worker proof suites green on the merged tips
  (contestdeath 43/0, armorfetch 38/0, warmthdisp exit 0) and both proofs
  re-run green from the merged main tree after landing.
- Merged locally, pending ship. Do NOT push, do NOT bump — the batch
  ship job owns deploys and live verification.
- Worktrees released as merged and branches deleted: sim-contestdeath-b,
  sim-armorfetch2-b. Preserved (not released): sim-warmthdisp-b.

## food-economy state after this run

Converging, NOT converged. Blanks (3) contest-death registerDeath fix and
(4) vessel armor fetch are now LANDED; (5) warmthrestraint disposition is
now DOCUMENTED as superseded-duplicate. Next blanks in order remain the
two Steve-call items (competent courtship drive; generation-dealt vs
earnable vests — both need Steve's ruling first), then older opens
(#1513 wake-tile forage knowledge, panel tier-3+ watch item).
