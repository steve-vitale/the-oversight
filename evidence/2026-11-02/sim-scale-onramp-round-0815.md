# Loop A 0815Z round — scale-onramp: 2 DIAG-GO arms, merged locally pending ship

Run: fleshout-loop-a-20261102T0815Z, axis scale-onramp (converging, NOT
converged). Claim written before any sims. Sibling Loop B live on
food-economy throughout (0741Z claim at run start: latescape + stepwalk,
closed mid-run with its coordinator evidence 26703bd81; a NEW B claim
0848Z appeared before merge) — NOT touched. No sibling branch touched.
Rotation untouched (convergence-directed axis work supersedes rotation;
rotation stands at 3).

Pre-flight: main tree clean, disk 27%, reaper removed nothing (all active
trees sibling-owned or dirty, correctly refused; active 12/16).

Both arms are DIAGNOSIS arms: policy/instrument side only, zero src/js
changes, nothing sounded, nothing mutated. No game change landed in this
round — both arms refine what the wall numbers mean and why contact
fails, which is the work the 0725Z round queued. No titan canon doc
exists in docs/ — stated, none invented (in-code source: src/js/titans.js
+ src/js/hierarchy.js + src/js/havenGrowth.js).

## Arm sim-maxwave5-a (DIAG-GO: UNLOCK ONLY)

Question (0725Z next blank #1): seed 97309's maxWave=5 row in the
arrearsscreen screened band — unlock, spawn, or fight?

Answer: UNLOCK ONLY. Instrumented replay on the frozen arrearsscreen
stack reproduced the original row field-for-field (maxWave 5, w4Day 50,
w5Day 76, Nat 0, Table 1, Won 0, 77d, village-lost, regional) with
dayHash streams identical 76/76 — same RNG stream, no drift. Wave 5
unlocked day 76 (gated standing 199 → 240 across the t5=200 bar; the
releasing readiness bar was not traced and is not claimed). Zero of
everything stronger, proven two ways: a spawnWorldMonster wrap saw 32
spawns (w1 14, w2 9, w3 5, w4 4), zero wave-5, zero spawns at all on days
76–77; and the end-state deed wavesFaced (w1 14, w2 7, w3 5, w4 2,
w5 none), zero wave-5 player fights, zero wave-5 villager fights, zero
wave-5 kills, wave-5 ledger points 0. The village was lost the next day,
still fighting wave-4 monsters, before any Producer could appear.

Mechanism (code audit): scripts/sim-harness.js runDays computes
maxWaveUnlocked from ONE end-state call of Game.unlockedWave(), and the
arrearsscreen recorder copies it verbatim as maxWave/wave5.
unlockedWave() only adds wave-5 defs to monsterWavePool(); spawn
(spawnWaveTarget, 55% newest) and fight (deed feed via startCombat /
fieldFight) are separate steps the recorder never measures. The standing
peak ratchet (src/js/standing.js) makes end-state 5 reliable proof of
"unlocked at some point" — and nothing beyond that.

Wall language, REFINED (not overturned): the arrearsscreen band now reads
"wave 5 unlocked 1/24, wave 5 fought 0/24". Future runs must say "wave 5
unlocked" for such a row, never "wave 5 reached" or "wave 5 fought",
unless a separate spawn/fight trace proves the stronger claim. The
"wave 5 fought 0 in normal play" half stands exactly; the one W5 row that
looked like a possible counterexample is proven unlock-only.

Commits (worker originals → coordinator rebase onto moving master):
prereg 5eb3ed43 → a7e1263b1, instrument 2c6fcfbb → 1edeb6a0c,
evidence + corpus 5b0d2260 → 7b02fd1e3. Coordinator validator re-run on
the rebased tip: classifier 13/13 green, corpus validator green
(verdict UNLOCK, unlockDay 76, spawns5 0, fights5 0, kills5 0).
Evidence: evidence/2026-11-02/sim-maxwave5-a.md (+ prereg).
Corpus: evidence/2026-11-02/perseed-maxwave5-a/.

## Arm sim-locatedengage-a (DIAG-GO: no routing exists)

Question (0725Z next blank #2): seed 97307, LOCATED_NO_ENGAGE — omen
stage 2 day 129, lair tile 7,4, monster present days 129–152, ZERO
attempts, no pending encounter at end. Why does the policy never route
to a located titan?

Answer: there is no routing to do. No policy layer ever aims at a titan,
a lair, or a monster tile — 97307's daily trips went only to the four
tiles around home, out and back, with zero travel events targeting the
herald's tile in 24 days. The herald wandered a tight orbit 1–3 tiles
east of home (14 days at exactly distance 1) but can never step onto home
itself, because home is a safe tile and wandering refuses safe tiles.
Sharing a tile is the only way this policy can touch a titan, and it
never happened — so no monsterTurn, no startCombat, zero attempts.
Nothing avoided anything; engagement is something that happens TO the
village, never something it does.

Contrast 97301 (how contact actually happens): the RAID system delivers
the herald. A raid night drafted it (havenRaidTick, havenGrowth.js:543)
and pinned it to home; nobody met it, so it became a lingering besieger
re-pinned to home every dawn (havenGrowthDaily, havenGrowth.js:216).
The scholar's ordinary trips then carried it step for step (the travelTo
follow branch, game.js:12651 — wrinkle: the herald's data says "it does
not follow", but that non-empty string reads as truthy in code, so it
DOES follow). Attempts fired only when a second layer also closed: the
detail-grid stance machine needed days of shared-tile time (shared
mornings 74–77, no attempts) until detail cells coincided — day 78 pre
scholar (0,0) = herald (0,0), day 89 pre (8,0) = (8,0) — then all 4
attempts were refused MUSTER-GATE, because no one ever sounds the call.
Pending encounters were false at every trace row of both runs:
irrelevant to titan contact. Day 89's re-sharing is a raid-system pin by
elimination; its sub-cause (fresh draft vs lingering re-pin) is
explicitly left undistinguished, since the probes diverge from the
judged run after the first refusal and cannot arbitrate it.

Also corrected: the 0725Z prereg's "titans never wander" is wrong —
wanderWorldMonsters + HERALD STEER do move the herald; the safe-tile
fence, not immobility, keeps it off home.

DISCLOSED REUSE: both seeds are the 0725Z pilot case + contrast, NOT a
fresh band — never pooled, never band evidence.

Commits (worker originals → coordinator rebase onto moving master):
prereg 9cf8baf3b → fa2e277f1, closing 0dcb1652a → 38b8e1666.
Coordinator validator re-run on the rebased tip: classifier unit 13/13
green, corpus validator 22/22 green, VERDICT DIAG-GO.
Evidence: evidence/2026-11-02/sim-locatedengage-a.md (+ prereg).
Corpus: evidence/2026-11-02/perseed-locatedengage-a/.

## Landing notes (coordinator)

Master moved twice during landing (sibling playtest journey-deepening
r84, then sibling Loop B 0741Z coordinator evidence); both branches
rebased cleanly in their own worktrees with proofs re-run on rebased
tips before --ff-only merges (second branch rebased AFTER the first
merge, per the 0605Z lesson). Merges verified alone before any chained
release/remove step. Safe-commit index clobber hit both workers' commits
(repaired by the workers via HEAD-blob cacheinfo, commits verified
correct, trees clean). No merge conflict, no force, no sibling branch
touched. Main tree clean after landing.

## Telemetry deviation check

telemetry-check.js REFUSED both per-seed globs by design (recorder rows
carry anchorCommit) — same refusal class as 0725Z/0605Z/0445Z. No
override, no baseline reseed, baseline NOT rolled. No LOUD line.

## Convergence state

scale-onramp stays converging (NOT converged): the wall language is now
precise (unlocked ≠ fought) and the contact mechanism is now decomposed
to the layer that is missing (no deliberate routing, no sounded call) —
but no game change landed, no full-seat win is shown, and wave-5 fought
stays unshown. Wall UNCHANGED in substance: full seat 0 / wave 5 fought 0
stand as last measured (Loop A lane). food-economy untouched (sibling
Loop B lane).

Next blanks, in order: (1) deliberate titan routing — some policy must
gain sound-the-call + march behavior, plus solving the detail/stance
layer (stepping onto the lair tile alone produced zero attempts on days
73/85/87); (2) rename the wall column to maxWaveUnlocked at the source
(the name invites exactly the misreading just killed) and require a
spawn wrap + deed end-state for any future "wave 5 reached" claim;
(3) screened arrears band for the waiting pilot, round 2 — only via a
contact-first screen (seeds pre-filtered on herald contact) or a
back-payment verb design decision (steve-call candidate); an
unselected-band re-screen is NOT the next step; (4) sum-trigger CONFIRM
re-run only after an arrears lever lands; (5) Layer-2 titan meaning
(steve-call); (6) replay history-stream 40-entry cap instrument fix;
(7) full-seat bars w4>=3 + w5>=2 reachability (still 0 fought);
(8) unlock release mechanism — trace the four readiness bars daily
(maxwave5 follow-up, releasing bar on day 76 unknown); (9) day-89
re-sharing sub-cause (fresh draft vs lingering re-pin) still
undistinguished; (10) 0-kcal fed line honesty wrinkle (97307 day 139),
carried note.

Merged locally, pending ship (both arms: diagnosis + instruments).
