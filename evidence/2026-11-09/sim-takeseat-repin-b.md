# sim-takeseat-repin-b — re-pin the stale live legs in the takeseat/feareddoor proof suites on seed 53001 (evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T1230Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-takeseat-repin-b, branch
sim-takeseat-repin-b. Base: master `5e79679e4` (verified by
`git log --oneline -1` at run start). Scope: TEST MAINTENANCE only —
ZERO src/js, zero analyzer/lib changes. This arm re-pins the stale
live legs in the takeseat/feareddoor proof suites on seed 53001
(backlog item: TAKESEAT/FEAREDDOOR LIVE-LEG PINS STALE ON SEED
53001, recorded in evidence/2026-11-09/sim-takeseat-pricedseat-b.md).
Full pre-registration (binding):
evidence/2026-11-09/sim-takeseat-repin-b-prereg.md.

**Verdict: GO.** Both suites fully green on the branch tip
(takeseat 25/25, feareddoor 33/33), and every re-pinned value
matches a fresh current-master run byte-for-byte on the asserted
fields — verified twice (the pre-edit derivation run and the
post-edit green runs reproduce identical heads, seat/door counts,
and pre-sit match).

## What was stale, and what the fresh run showed

Seed 53001 was a no-seat seed when both suites were written, so
their section (D) LIVE legs pinned "the drive never fires in either
leg" (seatTaken 0 / doorsEntered 0, whole-run head equality, final
seat 'none'). The sit-drive rebaseline landings
(ff8b9869f/b5d1eb923/38389defb/f37924c96) moved the seed. Fresh
current-master values on `5e79679e4`, seed 53001, derived BEFORE any
edit (both suites run unmodified first) and re-verified AFTER the
re-pin by the suites' own green runs:

### Takeseat leg (`scripts/takeseat-b-driver-20261107.js`, 150d)

| field | baseline (fresh) | armed (fresh) |
|---|---|---|
| days / gameDays / endReason | 150 / 152 / survived | 150 / 152 / survived |
| standing | 250 | 209 |
| maxWave | 5 | 5 |
| finalSeat | none | lesser |
| w4kills | 3 | 2 |
| seatTaken / seatAttempts | 0 / 0 | 1 / 1 |
| seatDay / seatKind / doorsOffered | — | 98 / lesser / 5 |
| instrumentErrors | 0 | 0 |

The armed leg takes the lesser seat on day 98 while the baseline
takes none — that IS the discrimination proof now. The
trajectory-neutrality claim survives in a stronger, more precise
form than the old whole-run head equality: the 95 daily rows before
the sit day are byte-identical between the legs
(`ANALYZE.preSitMatch(b, a, 98)` → match true, daysCompared 95,
firstDiff null — verified with the real analyzer, not by eye), and
the day-98 rows differ in exactly four fields (tableDone, preview,
tableChoicesSurfaced, gate). The preview reads move nothing until
the day the drive fires.

### Feareddoor leg (`scripts/feareddoor-b-driver-20261107.js`, 150d)

| field | baseline (fresh) | armed (fresh) |
|---|---|---|
| days / gameDays / endReason | 97 / 98 / over-other | 97 / 98 / over-other |
| standing | 209 | 209 |
| maxWave | 5 | 5 |
| finalSeat | lesser | lesser |
| w4kills | 2 | 2 |
| seatTaken / seatDay / seatKind | 1 / 98 / lesser | 1 / 98 / lesser |
| doors entered | 1 (doorwalkStats) | 1 (feareddoorStats) |
| walked | defiant @98, light, 6 answers | feared @98, light, 5 answers |
| instrumentErrors | 0 | 0 |

Both legs take the lesser seat on day 98 (the sit drive is in the
baseline policy here), so a door is walked in each leg — the armed
feareddoor wrapper walks the FEARED door (feared-first, picked
feared over the assigned defiant) where the baseline doorwalk walks
the ASSIGNED door (defiant), same day, same branch. That IS the
discrimination proof now. The whole-run head still reproduces
EXACTLY (head(a) deep-equals head(b) — all seven fields identical),
and the daily rows differ in exactly one row (day 98, the door
itself: tableSnap path defiant vs feared, beat 4 vs 3, plus the
door's own roster/party/stage consequences).

## What changed in the suites

`scripts/test-takeseat-b-20261107.js` (section D + header comment):
- seatTaken pins: baseline 0 (unchanged), armed 0 → **1**; added
  seatAttempts 1, seatDay 98, seatKind 'lesser', doorsOffered 5.
- Whole-run head equality REPLACED by the two pinned heads
  (baseline `{150, 152, survived, 250, 5, none, 3}`, armed
  `{150, 152, survived, 209, 5, lesser, 2}`).
- ADDED pre-sit neutrality via the existing analyzer:
  `preSitMatch(b, a, seatDay)` match true, daysCompared 95.
- ADDED divergence-start pin: the day-98 rows differ in exactly
  `['gate', 'preview', 'tableChoicesSurfaced', 'tableDone']`.
- Baseline finalSeat 'none' pin UNCHANGED (baseline still earns no
  seat). Each pin carries a comment citing the sit-drive rebaseline
  and this arm.

`scripts/test-feareddoor-b-20261107.js` (section D + header comment):
- doorsEntered pins: armed feareddoorStats 0 → **1**, baseline
  doorwalkStats 0 → **1**.
- ADDED door-path discrimination: armed walked[0] is feared @98
  light, baseline walked[0] is defiant @98 light; answers 5 vs 6.
- Whole-run head equality UNCHANGED (it passes as-is).
- finalSeat pin: 'none' → **'lesser'** (baseline takes the lesser
  seat too). Note the driver's `finalSeat` is an object with a
  `.seat` field — the first re-pin attempt asserted the bare value
  and the suite itself caught the shape error (line 485); the pin
  now uses the same `.seat` accessor as the old code.
- Each pin carries a comment citing the sit-drive rebaseline and
  this arm.

## The quiet-seed hunt (why head equality was replaced, not re-pinned)

The prereg allowed re-pinning the takeseat neutrality check to a
still-quiet seed. Two bands were scanned with the armed takeseat
driver (150d each, fresh on current master):
- 53002–53008: 6/7 sit (days 90–94, all survivors); 53003
  seatTaken 0 but the village dies at day 45 (village-lost).
- 53101–53108: 5/8 sit (days 90–96, all survivors); 53103/53105/
  53106 seatTaken 0 but the villages die at 81d / 89d / 67d
  (all village-lost).

Across 15 armed legs, every surviving village takes the lesser
seat (12/12 survivors sit); the only no-seat legs are villages
that die before day 90. There is NO surviving quiet seed in either
band, and a dead village is not a valid neutrality seed (the head
would be death-determined, and "drive never fires" would be
confounded with "village died before any seat was offered"). So the
old whole-run head equality was replaced — not re-pinned to a
hunted seed — by the discrimination assertion plus the pre-sit
neutrality proof, which is the same property (preview reads move
nothing) proved more precisely. The whole-run neutrality property
is still carried live by the feareddoor suite's head equality on
the same seed.

## Proof

- `scripts/test-takeseat-b-20261107.js` — **25/25 PASS** on the
  branch tip (final green run re-ran both 150d legs fresh).
- `scripts/test-feareddoor-b-20261107.js` — **33/33 PASS** on the
  branch tip (final green run re-ran both 150d legs fresh; D2 smoke
  skipped, FEAR_SMOKE_SEED unset, as before).
- Byte-for-byte check: the post-edit green runs' /tmp outputs
  reproduce the pre-edit derivation exactly on every asserted
  field (both heads, seatTaken 0/1, seatDay 98, kind lesser,
  doorsOffered 5, doorsEntered 1/1, walked feared/defiant @98,
  answers 5/6, preSitMatch 95 days match).

## Claims the suites no longer prove, and why

- Takeseat no longer proves whole-run head equality on a no-seat
  seed — there is no surviving no-seat seed in the scanned bands
  (see the hunt above). It now proves the strictly stronger pair:
  discrimination (0 vs 1 sits) + pre-sit neutrality (95 identical
  daily rows, divergence starting exactly on the sit day in
  exactly the four sit fields). Nothing was silently deleted: the
  old head-equality assertion is replaced by the two pinned heads
  plus the pre-sit match, and the replacement is named in the test
  comments and here.
- Feareddoor loses no claim: head equality still holds, and the
  door-count pins now prove MORE (feared vs assigned door choice,
  not just "no door entered").
- The "no-seat seed" framing is gone from both suites. The seed is
  now documented as a sat seed (lesser, day 98) in both.

## Wall numbers (this run's fresh legs — scale-wall reporting)

No game change, so no new panel: the wall numbers below are the
fresh 53001 legs only, reported for the record.
- Takeseat: baseline national 0, sat 0, wins 0, wave-4 5/5
  (maxWave 5, w4kills 3), wave-5 reached, median n/a (1 seed);
  armed national 0, sat 1 (lesser), wins 0, wave-5 reached.
  The full seat is still unreached on this seed in either leg.
- Feareddoor: national 0 both legs, sat 1 both legs (lesser),
  wins 0 both legs, wave-5 reached both legs.

## Metric review

- Judge (prereg): both suites fully green on the branch tip —
  HELD (25/25 + 33/33). Every re-pinned value matches a fresh
  current-master run byte-for-byte on the asserted fields — HELD
  (pre-edit derivation and post-edit green runs agree exactly).
- Prereg claims (a)/(b)/(c) for both suites: all hold after the
  re-pin. Takeseat (a) discrimination holds as 0 vs 1 sits;
  (b) neutrality holds in pre-sit form (95 rows) plus the
  divergence-start pin — the whole-run form was replaced with
  justification, not deleted; (c) baseline "earns no seat" holds
  unchanged. Feareddoor (a) discrimination holds as feared vs
  assigned door; (b) head equality holds unchanged; (c) the smoke
  structural check holds re-pinned to 'lesser'.
- The discrimination proof is now STRONGER than the old "no-seat
  seed" framing in both suites: takeseat proves the drive fires
  exactly once on the day the seat is offered (and nothing moves
  before that day); feareddoor proves the armed wrapper picks the
  feared door where the baseline walks the assigned one.
- No metric was re-scored mid-run. One pin was corrected during the
  run (feareddoor finalSeat accessor — bare value vs `.seat`),
  caught by the suite itself on its first green attempt; the
  correction is recorded above, not hidden.

## Village assessment in plain words

No village changed — the game is untouched. What changed is the
test's picture of one village: seed 53001 used to be the quiet
village where the sit drive never had anything to do, and the
rebaseline taught it to take the lesser seat on day 98. The tests
now prove the drive works by watching it fire there (one seat,
one feared door) instead of by watching it stay quiet — and they
prove it stays quiet before that day, row by row, which is the
sharper claim. Fifteen nearby villages were checked for a still-
quiet one; every village that lives long enough takes a seat, and
the only ones that don't are the ones that die young.

## Blanks filled or documented

- FILLED: both suites' live legs re-pinned to true current-master
  behavior and green (25/25 + 33/33); the backlog item
  (TAKESEAT/FEAREDDOOR LIVE-LEG PINS STALE ON SEED 53001) is closed
  by this arm — the finding should be marked `fixed` in
  `hidden_files/sim-findings.md` by the coordinator.
- DOCUMENTED (not built): no surviving quiet seed exists in bands
  53001–53008 or 53101–53108 for a takeseat whole-run neutrality
  pin — any future arm wanting a no-seat neutrality seed must hunt
  a fresh band and expect most survivors to sit.
- CARRIED (not built): the retained measurement-proof staleness
  recorded in sim-takeseat-pricedseat-b (`src/js/conversation.js`
  changed after the sweep-b proof panel) is untouched by this arm
  — this arm changes no proof input (zero src/js), so the refresh
  is still owed by the next run that touches a proof input.

## Convergence

scale-onramp stays converging (NOT converged): the suites are green
again and prove a sharper claim than before, but the underlying
picture is unchanged — the full seat is still unreached, wins still
come only through the lesser seat, and the 53001 legs sit 0–1 per
leg. No src/js change; nothing held unlanded except the
coordinator's calls on the proof refresh (pre-existing, not this
arm's to fix).

## Run notes (infrastructure)

- EPERM write flap struck mid-run (~13:04–13:16 UTC): the driver's
  final JSON write failed four times with `EPERM: operation not
  permitted, write`, leaving 0-byte files in /tmp; plain probe
  writes (small and 700KB, timed at t0/t40/t80) succeeded in the
  same minutes, which briefly misled the diagnosis toward the
  harness — the narrow test then showed writes failing even before
  any require, confirming a host-level flap, not a code cause. The
  flap cleared after ~12 min (6 consecutive OK probes); both
  suites then went green on the next attempt. No work was lost:
  the pre-edit derivation values were already recorded from the
  successful pre-flap runs, and the post-edit green runs
  reproduced them byte-for-byte.
- Index clobber struck on the prereg commit (safe-commit left the
  committed file as staged-deleted + untracked); repaired with
  `git ls-tree -r HEAD -- <path> | git update-index --add
  --index-info` after verifying hash-object == HEAD blob;
  `git status --short` empty, `git diff HEAD` empty after.
- Quiet-seed scan scratch JSON lives only in /tmp
  (/tmp/takeseat-quiet-scan, /tmp/takeseat-quiet-scan2); nothing
  from the scans was committed. The suites' own /tmp proof legs
  are re-created by each suite run.
- No jest run (these suites are plain node scripts, not jest);
  no concurrent jest anywhere in this arm.
