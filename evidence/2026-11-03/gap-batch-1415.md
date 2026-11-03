# Gap batch items 14 + 15 — policy side (competent.js)

Branch: `gap-batch-1415`, base `ba36659f9`. One file changed in game
policy (`scripts/policies/competent.js`) plus two proof scripts. No
`src/js` change, no gate/threshold/rate retune, no new duty system, no
second rescue system. Both proofs run before/after on identical seeds
with the same harness; the only difference is the policy file
(BEFORE = master `competent.js`, AFTER = this tree's). No env gates
were added to the shipped code — the before arm is the real old file,
not a switched-off new block.

Session canon read first, in order: `docs/godpath/STEVE-ANSWERS.md`,
`docs/COHERENCE-SPINE.md`, `docs/ROADMAP.md`, plus the policy-area
canon (r88 driver/analyzer, deadfall-b layer, competent staffing
history). Worktree registered via `scripts/worktree-register.sh`
(capacity queue: two sibling checkouts ahead of it; no slot was ever
unavailable, just queued).

## Item 14 — DEADFALL DUTY NEVER ASSIGNED BY POLICY: LANDED

What was wrong, in plain words: the village has a real job — going out
to gather fallen sticks and brush fiber, the material arrows and
fletching need — but the competent village leader never gave that job
to anyone. Journey-scale runs r61–r73 measured zero deadfall-duty
lines on every seed. Sticks only arrived by accident, from other trips.

What changed: the leader now staffs deadfall the same way they already
staff the fishing crew — same call path (`counterPlay` →
`assignAnother`, which walks down the scored candidate list until
someone says yes and never forces anyone), same free-villagers-only
pool, same in-person ask. It runs after fish and cook in `counterPlay`,
so it only takes leftover hands. The numbers are deadfall-b's,
unchanged: top up to 2 workers while the communal pile holds fewer
than 6 sticks. New code: `staffDeadfallDuty()` in `competent.js`,
exported for proofs.

Proof — `node scripts/proof-gap14-deadfall.js` (15/15 green):
- Fake-Game fixture: staffs to 2 from free hands only (an already
  wood-assigned villager is never pulled off); second call staffs
  none; pile at 6 staffs none; refusals walk down to the next
  candidate; all-refuse staffs none; away from Haven staffs none.
- Live forced step, 4 seeds (trust raised to 80 in the fixture only,
  because fresh-game trust under 20 refuses all non-food work by
  engine design): 2 staffed on every seed, and resolving one
  assignment grows the pile on every seed (0→1, 0→2, 0→3, 0→1 sticks).
- Natural panel, seeds 85101–85104 × 30 days:

  | arm | deadfall staffed | deadfall hauls | fish staffed | cook staffed |
  |---|---|---|---|---|
  | BEFORE | 0 | 0 | 256 | 25 |
  | AFTER | 60 | 165 | 272 | 41 |

  Deadfall assigned on 4/4 seeds after, 0/4 before. Fish and cook
  staffing did not collapse — both rose (they run before deadfall, so
  deadfall cannot steal their hands; the movement is panel noise from
  the extra verb draws shifting the game's dice, see below).

## Item 15 — DOORSTEP-STARVATION NON-SCHOLAR CLASSIFIER: LANDED

What was wrong, in plain words: r88 proved villagers' leader could
starve standing outside their own hall while the pantry was full, and
landed a driver-only rescue step for the leader (31 of 32 triggered
steps ate). But that step only ever looked at the leader. A starving
ordinary villager at Haven had no such step: nobody classified them
as "starving at home with food nearby" and nobody fed them.

What changed: r88's step now lives in the policy itself
(`doorstepStep()`, at the end of `daily()`, right before sleep —
exactly where the r88 driver ran it), with two branches sharing the
one enter-the-hall + take-from-pantry path:
- Leader branch — r88's thresholds, unchanged: at Haven, outside the
  hall (not in a tent), food below half the daily cap or thirst below
  25 → step inside, eat (pack, then pantry to 95% of cap), drink.
- Villager branch — the classifier for everyone else: a living
  villager who is AT Haven with the leader (not away, not dead, not
  the leader — people the leader can actually see and hand food to)
  and visibly hungry (hunger 70 or more, the game's own "watching the
  cookpot" line) is doorstep-needy when food is at hand. The leader
  shares a meal through the existing give-a-meal verb, drawing ready
  pantry food into their pack first when the pack is thin, exactly as
  the promise-keeping food share already does. The leader eats first:
  villagers are fed only when the leader holds at least 500 kcal
  afterwards (the promise-keeping floor, not a new threshold), so the
  leader never starves themself to feed the village. Away villagers
  are excluded on purpose even though the give verb would accept
  them — handing food to someone miles away would be deciding from a
  roster list, not from what the leader can sense. A "fed" villager is
  one whose hunger actually fell after the meal; a triggered step
  that gains nothing counts as no-gain, the same honesty rule as
  r88's ate/no-gain split. Counts live on the run context
  (`doorstep*`), and the step is exported for proofs.

Scope note (read this before reusing the item name): the r88
analyzer's starvation classes for non-scholars cannot honestly be
repaired from r88 census data alone — the census records the
leader's location, not each dead villager's, so a non-scholar death
cannot be placed at Haven from that data (the old code already fell
back to pantry-empty only). This arm therefore delivers the
classify-and-rescue step where it can be proven — in the policy,
measured by eating — rather than rewriting the old analyzer's verdicts
after the fact. If the coordinator also wants the analyzer's
non-scholar class E, that needs a driver instrument that records each
villager's away/home state at snapshot time, a separate measurement
arm, not a policy change.

Proof — `node scripts/proof-gap15-doorstep.js` (15/15 green):
- Fake-Game fixture (7 cases): hungry outsider leader eats and
  drinks while the hungry villager at home is fed and the merely
  peckish, the away, and the dead are untouched; no food anywhere →
  leader no-gain and the leader floor stops the villager branch;
  fed leader with no food at hand → villager no-food counted;
  leader under 500 kcal keeps their pack; leader in a tent skips
  their own branch (no hall from a tent) but still feeds from pack.
- Live forced step, 4 seeds (leader outside + starving, one villager
  at hunger 95): leader ate on 4/4 seeds (100 → 2400 kcal), villager
  hunger fell on 4/4 seeds (95 → 77 — a meal eases hunger by its
  calories divided by 25, capped at 60, so "fed" means hunger fell,
  not fully sated).
- Natural panel, seeds 85101–85104 × 30 days:

  | arm | needy villager-days* | leader ate / triggered | villager fed / triggered | starvation deaths |
  |---|---|---|---|---|
  | BEFORE | 51 | — (no step) | — (no step) | 3 |
  | AFTER | 50 | 11 / 12 (92%) | 24 / 24 (100%) | 3 |

  Leader rate 92% is in line with r88's 31/32 (97%); the one miss is
  a triggered step that gained nothing, the same miss class r88 had.
  Villager rate 24/24 beats the scholar bar. *Needy villager-days
  counts villagers present + hunger ≥ 70 at the start of the day's
  work; it is exposure, not the trigger denominator — the step can
  only act when the leader is home, fed, and food is at hand by
  day's end, so fed/triggered, not fed/needy, is the rescue rate.

## Shared panel caveats (both items, same after-arm code)

- One seed (85101) flips from survived (before) to village-lost
  (after) in both panels, with 3 starvation deaths after vs 0 before
  on that seed. In aggregate over 4 seeds, starvation deaths are
  identical (3 vs 3: the before arm carries 3 on seed 85102), and
  fish/cook staffing rise. There is no starvation mechanism in either
  change — deadfall workers still produce their normal food in the
  meal loop and assignments resolve separately, and the doorstep step
  moves pantry food to a starving leader rather than destroying it.
  The flip reads as dice cascade: the new steps draw the game's dice
  (obedience rolls, refusal lines), shifting later outcomes seed by
  seed. It is reported here, not hidden, for the coordinator's
  serialized check to judge; a 4-seed panel cannot separate cascade
  from cause.
- `competent-nofallback.js` and `competent-nofallback-socialD.js` are
  frozen experiment copies of the policy, not the canonical file;
  they were deliberately not edited. Panels using those variants
  will not see these fixes until the variants are regenerated.
- Both proof scripts' BEFORE arm loads the master tree's
  `competent.js` by a relative path (`../../the-scattering` from the
  worktree). After merge, that path no longer holds the old file;
  the scripts will fail loudly telling the runner to set
  `POLICY_FILE` instead of silently comparing the new file to itself.

## Files

- `scripts/policies/competent.js` — `staffDeadfallDuty` +
  `counterPlay` call (item 14); `doorstepStep` + end-of-`daily` call
  (item 15); both exported.
- `scripts/proof-gap14-deadfall.js` — item 14 proof (15/15).
- `scripts/proof-gap15-doorstep.js` — item 15 proof (15/15).
- `evidence/2026-11-03/gap-batch-1415.md` — this note.

Not done: no merge, no push, no version bump, no live verification
(coordinator owns those after proof + serialized check). Worktree
left in place for the coordinator.
