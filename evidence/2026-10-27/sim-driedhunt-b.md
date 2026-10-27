# sim-driedhunt-b — the generic dried residuals, hunted per-stack: FOUND on all three seeds

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T2150Z, axis
food-economy. Arm: sim-driedhunt-b — the per-stack hunt of the generic
dried residuals left open by run 2030Z arm sim-stockdoors-b
(evidence/2026-10-27/sim-stockdoors-b.md + its prereg; backlog item
"GENERIC DRIED RESIDUALS STILL OPEN"). Measurement only: zero src/js,
zero default flips, no lever. This arm does NOT re-judge the stockdoors
GO/CONFIRM-GO. Judged ONLY against evidence/2026-10-27/
sim-driedhunt-b-prereg.md, committed BEFORE any judged hunt as
ce9f7c6aa78016bc9fb34d0944c16092e4d7d869 (the prereg commit hit the
documented safe-commit index-clobber variant; repaired per the
documented recipe — HEAD blob via update-index --cacheinfo — and
verified with `git status --short` empty + `git diff HEAD` empty +
hash-object match before proceeding).

## Verdict against the pre-registered bar: FOUND (9738) + FOUND (9735) + FOUND (9825)

| seed | headline BA dried residual | expired-tail sum | live sum vs closing | mechanism coverage | verdict |
|------|---------------------------|------------------|---------------------|--------------------|---------|
| 9738 (confirm, hunted first) | −2,240 | 2,240 (100%) | 16,868 = 16,868 | 2,240 / 2,240 (100%) | FOUND |
| 9735 (confirm) | −800 | 800 (100%) | 43,190 = 43,190 | 800 / 800 (100%) | FOUND |
| 9825 (pilot) | −1,021 | 1,021 (100%) | 15,190 = 15,190 | 1,021 / 1,021 (100%) | FOUND |

No seed resisted; the stop rule never triggered. No partial accounting,
no force-fit: every tail is accounted to the kcal, and every tail kcal
is tied to a recorded removing call (function + caller + day + stack).

## What the residuals were: unanswered-raid loot, not a dried bug

The mechanism is `villageAgencyDaily` (src/js/villageAgency.js:203),
called via hierarchyDaily → membershipDaily at endDay: "an unanswered
raid at the treeline doesn't wait — they take and go." When a pending
raid defense goes unanswered past its day, the raiders take
`_removePantryKcal(800)` from the pantry — longest-spoilDay-first, so
opening Canned soup (spoilDay 366) goes first, then the longest-lived
dried stacks. The game's own narration says it aloud ("You weren't at
the treeline. [champion] of [village] didn't wait — they hit the
stores and melted back into the dark with [taken] kcal."). The ledger
gap was purely instrumental: `_removePantryKcal` was the ONE
pantry-removal method no capture wrapped (every other removal site in
src/js — npcTakeAction, npcChildAction, apPlaygroundRaid, useAbility,
_evTakePantryKcal, takeFromPantry, takeFromPantryBulk, pantryDraw,
drawSpoiled, sweepSpoiled — is wrapped by the reused instruments),
so raid loot was invisible to all six instruments. The game behavior
is real (a raid consequence with a named champion and village); the
bookkeeping edge is in the instruments, not the village.

Why the tails looked like "mid-run dried drops": a raid take drains
whole stacks from the longest-spoilDay end and stops mid-stack on the
last stack it touches. The partially-clipped stack then keeps being
eaten by meals, leaving a tail (created − consumed − swept > 0) that
is exactly the raid's clip. The stacks' later expiry is a red herring
— the loot left days before expiry, not at it.

## Per-seed hunt detail (hunt order 9738, 9735, 9825)

### 9738 — FOUND. Residual −2,240 = three raid clips, all dried

Identity table (expired tails only; all other identities balance to 0;
zero negative identities):

| identity (kcalEach\|spoilDay) | created | consumed | swept | tail |
|---|---|---|---|---|
| 160\|70 | 2,400 (15u, day 55) | 1,760 (11u, days 68–69) | 0 | 640 (4u) |
| 160\|77 | 3,040 (19u, day 62) | 2,240 (14u, day 75) | 0 | 800 (5u) |
| 160\|79 | 3,200 (20u, day 64) | 2,400 (15u, day 78) | 0 | 800 (5u) |

Re-run take records (caller `Object.villageAgencyDaily`,
src/js/villageAgency.js:203, via hierarchyDaily → membershipDaily →
endDay; all asked 800):

| day | ret | take composition |
|-----|-----|------------------|
| 42 | 1,000 | Canned soup 4u × 250 = 1,000 |
| 60 | 890 | Canned soup 1u × 250 + dried 160\|70 4u × 160 = 640 |
| 63 | 800 | dried 160\|77 5u × 160 = 800 |
| 65 | 800 | dried 160\|79 5u × 160 = 800 |

Dried-tail coverage 2,240 / 2,240. The day-60 take shows the
longest-spoilDay-first order directly: the last unit of Canned soup,
then the longest-lived dried stack of that day.

### 9735 — FOUND. Residual −800 = one raid clip

| identity | created | consumed | swept | tail |
|---|---|---|---|---|
| 160\|92 | 1,760 (11u, day 77) | 640 (4u) | 320 (2u) | 800 (5u) |

Re-run takes: day 43, Canned soup 4u × 250 = 1,000 (asked 800);
day 77, dried 160\|92 5u × 160 = 800 (asked 800). Dried-tail coverage
800 / 800. Note this seed's tail stack was ALSO partially swept (2u),
so the raid clip is not the whole story of the stack — but the tail
itself is exactly the raid clip.

### 9825 — FOUND. Residual −1,021 = two raid clips across four stacks

| identity | created | consumed | swept | tail |
|---|---|---|---|---|
| 160\|77 | 1,920 (12u, day 62) | 1,760 (11u) | 0 | 160 (1u) |
| 160\|93 | 2,240 (14u, day 78) | 1,760 (11u) | 0 | 480 (3u) |
| 160\|94 | 160 (1u, day 79) | 0 | 0 | 160 (1u) |
| 221\|94 | 221 (1u, day 79) | 0 | 0 | 221 (1u) |

Re-run takes: day 52, Canned soup 4u × 250 = 1,000; day 62, Canned
soup 3u × 250 + dried 160\|77 1u × 160 (ret 910); day 79, dried
221\|94 1u × 221 + 160\|93 3u × 160 + 160\|94 1u × 160 (ret 861).
Dried-tail coverage 1,021 / 1,021. The odd 1,021 (not a multiple of
160) resolves as 160 + 480 + 160 + 221 — the 221-kcal unit is a dried
stack from a 276-kcalEach fresh input at the 0.80x blind racks rate.

## Independent corroboration: the Canned soup ledger

The same raids explain the Canned soup family's boundary-aware
residual on all three seeds, to the kcal (computed from the reused
analyzers on the original corpora; Canned soup is not a focal family
so stockdoors did not judge it):

| seed | Canned soup BA residual | raid soup loot | match |
|------|------------------------|----------------|-------|
| 9738 | −1,250 | 1,000 + 250 | exact |
| 9735 | −1,000 | 1,000 | exact |
| 9825 | −1,750 | 1,000 + 750 | exact |

Every other opening staple family (Rice, Dried beans, Dried meat,
Peanuts) closes exactly (0) on all three seeds. The dried residual
was never a dried-specific phenomenon — it was the visible tip of
unwrapped raid takes, whose soup portion hid in a non-focal family.

## Method and det-gate (prereg legs)

- Corpus-first: the accounting leg hunted ONLY the existing
  stockdoors corpora (never overwritten); the identity decomposition
  (scripts/analyze-driedhunt-b.js) uses the reused perSeed/perSeedBa
  for headlines and itemized per-stack flows for the decomposition.
- Mechanism probe: the step-2 re-run (scripts/sweep-driedhunt-b.js,
  the sweep-stockdoors-b.js oneRun plus scripts/driedhunt-capture.js:
  a snapshot-diff wrapper on Game._removePantryKcal with caller-stack
  capture + per-stack day-end snapshots) re-ran ONLY seeds 9738,
  9735, 9825 into the NEW directory
  evidence/2026-10-27/sim-driedhunt-b-corpus/ (3 files, no other
  writes). table-defiant's local tributeKcal was excluded by
  reachability as pre-registered (Defiant endgame path only; the
  band never reaches the table).
- Det-gate (leg 0): PASS on all three seeds — the re-run reproduces
  every published stockdoors headline number exactly (finalPantry
  fresh 27,628 / 70,900 / 25,380; BA dried residual −2,240 / −800 /
  −1,021; and all headline counts: inflows, mealDraw, deaths,
  driedEvents, stockdoor, direct, sweeps, spoilDays). The new
  recorder is behavior-neutral; had any number differed, the re-run
  would have been void. Two infrastructure notes, both recovered
  without data loss: (1) the first 3-seed re-run was interrupted by
  two service restarts (9738/9735 files survived; 9825 was re-run
  detached and completed); (2) the first capture version parsed
  caller names as bare "Object" (V8's "Object.<method>" frames), so
  the run was repeated with full-frame capture — the improved
  re-run reproduces the same headlines and names
  villageAgencyDaily on every take.
- Proof: scripts/test-driedhunt-b.js GREEN (exit 0): corpus
  validity, headline reproduction, identity identities (tail sum ==
  |residual|, live sum == closing, zero negatives, accounting leg
  PASS, all three seeds), det-gate (re-run headlines + wrapper
  installed, all three seeds), hygiene (0 src/js modified, 0
  sibling capture files modified).

## Sense test (SENSE-TESTING LAW — the largest single stack flow)

Largest single stack flow: the 160\|79 stack on 9738, created day 64
at 3,200 kcal (20 units). In plain words: on day 64, Benoit worked
the smoke racks on two fresh piles that would rot the next day
(spoilDay 65) and saved them as dried food good to day 79 — "Benoit
cooked for the haven — meals stretched. Benoit worked the smoke
racks too — 2 batches preserved (~3200 kcal, keeps a couple of
weeks)." The next day, raiders hit the stores while nobody answered
the treeline call and walked off with 5 units (800 kcal). Two weeks
later, on day 78 — the day before the dried stock would turn — the
village ate the remaining 15 units. That reads as real village
behavior through and through: food saved just in time, a raid with
a consequence, stock eaten before it spoils. Nothing robotic,
static, or repeated in this stack's story (beyond the known
racks-full repetition, backlog 1149, unchanged and not chased here).
The only bookkeeping edge is the instruments' missing door, not the
villagers' conduct.

## Village assessment

What the village looked like: the same three stockdoors villages,
re-observed — pantries that now close to the kcal once raid loot is
counted. No new village story beyond the stockdoors assessment; this
arm's contribution is the ledger's last open item, closed.

Who thrived and died and why: inherited from stockdoors (9738: 5
deaths; 9735: 2; 9825: 8; wall numbers below). No death is attributed
to the raid takes: 800-kcal raids are a tax the pantry absorbs, not
a starvation cause on these seeds.

What knowledge/capabilities were missing: none in the game — the
missing piece was instrument coverage. The one instrument gap this
arm leaves documented (not fixed in game code, by design — this arm
is measurement only): `_removePantryKcal` remains unwrapped in the
committed instrument set. A future ledger arm should install the
driedhunt capture (or fold its wrapper into stockdoors-capture)
before judging any family ledger on a band where raids, tributes,
gifts, or other `_removePantryKcal` callers can fire — otherwise the
same class reappears as an unexplained residual.

Blanks filled: (1) the generic dried residuals are FOUND on all
three seeds — per-stack accounting to the kcal plus a recorded
removing call for every tail kcal; (2) residualhunt's open class
("mid-run dried drop with no record in any instrument") is
identified: unanswered-raid loot via the unwrapped
`_removePantryKcal` door; (3) the Canned soup residuals on the same
seeds are explained by the same takes, to the kcal. Documented, not
fixed in game code: no src/js change was made (DIAG only), and no
instrument change is landed here — the driedhunt capture is a new
DIAG script committed with this run for future arms to reuse.

## Reachability verdict (inherited, not re-measured)

This arm re-runs the stockdoors band/seeds; it does not open new
content. Reachability is inherited from stockdoors: waves 1–3
reached, waves 4–5 0/20, regional/national/table/wins 0/20 across
the stockdoors bands. The re-run's own wave reach (wave 3 on all
three seeds) reproduces the published band, nothing more.

## Wall numbers

Inherited from stockdoors (quoted, not this arm's own): pilot band
national / table / wins 0/8, wave-4/5 0/8, median survival 100d;
confirm band national / table / wins 0/12, wave-4/5 0/12, median
survival 100d. Re-run reproduction check (same band/seeds): 9738
national/table/wins 0, wave 3, 5 deaths, survived 100d; 9735 0, wave
3, 2 deaths, survived 100d; 9825 0, wave 3, 8 deaths, survived 100d.
The scale wall stands on this band; this arm measures a pantry
ledger, it does not move the wall numbers.

## Telemetry deviation check (loop-B body step 10)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/sim-driedhunt-b-corpus/*.json' --metrics
national,table,wins,exiled` reports LOUD: national 12 -> 0,
table 16 -> 0, wins 16 -> 0 (n=3 files). Investigated same-run:
this is band composition, not a regression — the scale-wall
baseline mixes bands that reach national/table, while this corpus
is the competent-nofeast ledger band whose published wall numbers
are 0/20 (stockdoors), reproduced exactly by the det-gate. The
correct comparator (the stockdoors band itself) shows zero
deviation. No further investigation item.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered bar worked as written and the verdicts follow
  from it: accounting >= 90% (achieved 100% on all three seeds),
  mechanism tied to a recorded call (achieved 100% of tail kcal on
  all three seeds, with caller + day + stack), no force-fit (no
  tail assigned to a mechanism contradicting the corpus — the
  take-order check actually corroborates: longest-spoilDay-first
  predicts soup before dried, and every take shows exactly that).
- Bar lesson for the NEXT run: the 90% accounting bar was easily
  cleared because the identity decomposition is exact, not
  approximate — a future prereg hunting a residual class should
  keep the bar but require the mechanism leg to name the caller
  function (not just the wrapper method), since the first capture
  version's bare-"Object" caller names would have satisfied a
  weaker bar without identifying anything. The full-frame stack
  capture is the fix, and it is committed here.
- Definition lesson (carried): stack identity (kcalEach, spoilDay)
  is the right grain for dried hunts — channel aggregates cannot
  separate a raid clip from a sweep, but identities can, and the
  live/expired split separates closing stock from leaks without
  any day-alignment assumption (the day-walk oscillates on
  branchDay duplicates and is not a reliable localizer; identity
  accounting does not need it).
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. The det-gate (re-run reproduces published
  headlines) is the before/after comparison: identical records
  with the added instrument on vs the published corpus.

## Reproduction check (this run)

- Prereg committed BEFORE any judged hunt (ce9f7c6a, including
  the bar, hunt order, corpus-first rule, det-gate, and the
  table-defiant reachability exclusion).
- Judged analysis ran on the prereg commit's analyzer
  (scripts/analyze-driedhunt-b.js): 9738/9735/9825 accounting PASS
  at 100% each; mechanism leg from the step-2 re-run at 100% each.
- Proof scripts/test-driedhunt-b.js GREEN in this worktree,
  exit 0 (see the det-gate section; the full PASS list is in the
  run output). No jest was run (nothing to test in jest — the
  proof is node, not jest). No [needs-eyes]: this lands a
  measurement, not a player-visible change.
- No game-code change: zero src/js files touched. Files in this
  run's commits: prereg commit ce9f7c6a (prereg only); evidence
  commit (this file, scripts/analyze-driedhunt-b.js,
  scripts/driedhunt-capture.js, scripts/sweep-driedhunt-b.js,
  scripts/test-driedhunt-b.js, and the 3 re-run corpus files).
  The stockdoors corpora were never written to (verified: only
  this run's own files appear in git status).
- Infrastructure notes (loud, per the flap/clobber rules): the
  documented safe-commit index-clobber variant hit the prereg
  commit (repaired per recipe, verified clean); two service
  restarts interrupted the first re-run (recovered by a detached
  re-run; no data lost — the interrupted run's completed files
  were overwritten by the improved re-run, which the det-gate
  re-verified). No EPERM flap hit this run. No ref surgery was
  performed at any point.

## Verdict (judged against the pre-registered bar, not re-scored): FOUND + FOUND + FOUND

Seed 9738 FOUND (2,240 / 2,240 accounted and mechanized), seed 9735
FOUND (800 / 800), seed 9825 FOUND (1,021 / 1,021). The generic
dried residuals are unanswered-raid loot via the unwrapped
`_removePantryKcal` door (villageAgencyDaily, src/js/
villageAgency.js:203) — real village behavior, instrument gap, now
closed to the kcal on all three seeds. The backlog item "GENERIC
DRIED RESIDUALS STILL OPEN" is resolved by this run (coordinator
to mark it fixed).
