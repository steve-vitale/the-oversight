# sim-armorfetch-c-a — item-agnostic armor-fetch proof test (backlog #1693)

Run: oversight-flesh-out-loop, run fleshout-20261104T1120Z (Loop A),
axis food-economy, arm sim-armorfetch-c-a. Worktree sim-armorfetch-c-a.
Test/instrument-only arm: NO game code changed, NO re-litigation of the
stash-armor verdict (Game.vesselArmorFetch() landed as 3e94b55cc,
confirmed by Loop A 1015Z, evidence/2026-11-04/sim-stasharmor-a.md).
Main tree never touched. No other run's tree, claim, or lock touched.
Canon: docs/CANON.md read first; NO canon doc covers the vessel
stash armor-fetch mechanism specifically (the manifest lists diseases,
bear, preservation, waves, contests, conversations, party, systems,
balancing, time-economy, kin, map, fans, ability-refusals — none is a
stash-fetch canon doc), so no canon is invented here; the mechanism is
grounded in the landed commit and the 1015Z confirm evidence instead.

## Pre-registered header (written BEFORE the confirm run)

- GO bar: scripts/test-armorfetch-b.js fully green on current master
  AND Part C agrees with the item-agnostic analysis
  (scripts/analyze-stasharmor-a.js, same window and verdict tiers) on
  every seed of band 16101–16116 (60d). No-spawn seeds are listed,
  not counted as misses. Any disagreement is a bug to investigate,
  never an assertion to loosen.
- Pilot (done before confirm): Parts A+B green + spawn re-probe on
  current master (see spawn re-probe table below). The stale Part C
  baseline was reproduced first: 40/41, C1 FAIL on the stale map
  (16103 swat_vest -> NO-SPAWN, 16109 farstrider_boots -> NO-SPAWN),
  C2/C3 PASS — matching 1015Z exactly.
- Instrument: scripts/test-armorfetch-b.js with Part C rewritten
  item-agnostic (see below); corpus
  evidence/2026-11-04/sim-stasharmor-a-corpus/ (banked by 1015Z,
  re-used, not re-run); analyzer scripts/analyze-stasharmor-a.js.
- Horizon/seeds/policies: band 16101–16116, 60d death-aware, substrate
  nighttravel + woodcarry (the corpus substrate), same as 1015Z.
- [needs-eyes]: NOT included — test-only change, no feel, combat, or
  UI change for Steve to playtest; the landed armor commit already
  carried the flag.

## The fix (test/instrument only)

Part C no longer hard-codes ACCEPT = { 16103: 'swat_vest',
16101: 'bark_armor', 16109: 'farstrider_boots' }. For each seed in
band 16101–16116 it derives the spawn armor at run time from the
corpus's own spawn snapshot (spawnSnap.pool.stashed filtered by the
armor defs in src/data/items.json — the same derivation the
item-agnostic analyzer uses), then applies the UNCHANGED verdict()
(window 0–7d, stash-loss + kit arrival -> WORN/FETCHED, else NO-GO)
to every spawned armor item. A seed with no spawn armor is reported
NO-SPAWN (untestable, not a miss). Parts A and B are byte-identical
in behavior (fixture-level mechanism tests untouched); C2/C3 cost
bars are unchanged. The test's derivation is cross-checked against
an INDEPENDENT live probe (scripts/probe-armorfetch-spawn.js, run on
current master today) — the probe is not derived from the corpus, so
probe == corpus spawn == analyzer agreement is a real check, not a
circular one.

## Spawn re-probe table (current master, today, live probe)

One spawn armor per seed except 16109 (none). IDENTICAL to the 1015Z
spawn notes — no further drift since 1015Z.

| seed | spawn armor (live probe) | slot | prot | corpus spawnSnap armor | match |
|------|--------------------------|------|------|------------------------|-------|
| 16101 | bark_armor | torso | 10 | bark_armor | yes |
| 16102 | work_gloves | hands | 2 | work_gloves | yes |
| 16103 | bloodplate | torso | 40 | bloodplate | yes |
| 16104 | good_boots | shoes | 3 | good_boots | yes |
| 16105 | rain_shell | torso | 3 | rain_shell | yes |
| 16106 | work_gloves | hands | 2 | work_gloves | yes |
| 16107 | good_boots | shoes | 3 | good_boots | yes |
| 16108 | running_shoes | shoes | 1 | running_shoes | yes |
| 16109 | (none) | — | — | (none) | yes |
| 16110 | work_gloves | hands | 2 | work_gloves | yes |
| 16111 | running_shoes | shoes | 1 | running_shoes | yes |
| 16112 | rain_shell | torso | 3 | rain_shell | yes |
| 16113 | work_gloves | hands | 2 | work_gloves | yes |
| 16114 | running_shoes | shoes | 1 | running_shoes | yes |
| 16115 | flannel_shirt | torso | 2 | flannel_shirt | yes |
| 16116 | bark_armor | torso | 10 | bark_armor | yes |

Drift vs armorfetch-b's original map, confirmed unchanged since
1015Z: 16103 swat_vest -> bloodplate; 16109 farstrider_boots -> no
armor spawn. Every probed vessel wears nothing in the spawn armor's
slot at spawn (wornProt 0 / empty), so every spawned armor beats the
worn slot and is fetch-eligible — no spawn is masked by a better worn
item. Note the probe also shows the vessel's worn accessories are
all prot-0 items (bags, rings, compasses), i.e. the spawn kit is
accessory-heavy, armor-light — the stash is where the armor lives.

## Confirm run — Part C agreement table

Command: `node scripts/test-armorfetch-b.js
evidence/2026-11-04/sim-stasharmor-a-corpus` on current master
(HEAD d8164a1aa at run time). Result: **41/41 GREEN, fail=0**
(Parts A+B 38/38 unchanged, Part C 3/3: new C1 + C2 + C3).
Independent analyzer `node scripts/analyze-stasharmor-a.js` on the
same corpus: 15 WORN, 1 no-spawn, band lost 2, median 60, max wave 4
— identical. Agreement is 16/16 seeds, zero disagreements.

| seed | Part C (new, item-agnostic) | analyzer | agree? | before-corpus note |
|------|-----------------------------|----------|--------|--------------------|
| 16101 | bark_armor WORN | WORN | yes | NO-GO (never fetched pre-fix) |
| 16102 | work_gloves WORN | WORN | yes | NO-GO |
| 16103 | bloodplate WORN | WORN | yes | NO-SPAWN (bloodplate did not spawn pre-fix) |
| 16104 | good_boots WORN | WORN | yes | NO-GO |
| 16105 | rain_shell WORN | WORN | yes | NO-GO |
| 16106 | work_gloves WORN | WORN | yes | NO-GO |
| 16107 | good_boots WORN | WORN | yes | NO-GO |
| 16108 | running_shoes WORN | WORN | yes | NO-GO |
| 16109 | NO-SPAWN (untestable) | NO-SPAWN-ARMOR | yes | — |
| 16110 | work_gloves WORN | WORN | yes | NO-GO |
| 16111 | running_shoes WORN | WORN | yes | NO-SPAWN (did not spawn pre-fix) |
| 16112 | rain_shell WORN | WORN | yes | NO-GO |
| 16113 | work_gloves WORN | WORN | yes | NO-GO |
| 16114 | running_shoes WORN | WORN | yes | NO-GO |
| 16115 | flannel_shirt WORN | WORN | yes | NO-GO |
| 16116 | bark_armor WORN | WORN | yes | NO-GO |

Verdict: **GO**. The prereg bar is met outright: test fully green
AND Part C agrees with the item-agnostic analysis on all 16 seeds
(15 testable WORN, 1 no-spawn listed, 0 misses, 0 disagreements).
The stash-armor verdict itself is NOT re-judged here — it stands as
confirmed by 1015Z; this run repairs the instrument that confirms it.
C2/C3 cost bars still PASS on the new, wider Part C band.

## Sense-test (law)

No game code changed, so no new villager behavior exists to
sense-test in this run; the operative reading stands from 1015Z
(day-1 "You remember the Bloodplate at your space in the haven and
fetch it" lines, day-2 wear by the normal path — a person collecting
their own things, with the back-to-back remember-X/remember-Y
patness still noted, still not a GO blocker, still not chased).
The instrument change touches no narration, no decisions, no
routines. PASS by no-change, stated as such, not as a fresh reading.

## Metric review

The prereg bar bound the run and was met with no re-scoring and no
loosened assertion: the old bar (>= 2/3 on 3 hard-coded acceptance
seeds) was REPLACED before the confirm by a strictly stronger one
(every spawned armor on all 16 seeds must be WORN-or-FETCHED), and
the stronger bar passed 15/15. One metric note for the NEXT run,
not applied here: Part C derives its expected items from the corpus
spawn snapshot, so it is only as independent as that snapshot — the
live probe cross-check (probe == corpus spawn on all 16 seeds today)
is what keeps it honest. If a future confirm ever runs on a corpus
whose spawn snapshot is suspect, re-probe first (as this run did)
rather than trusting the snapshot alone. The 7-day window remains
generous (1015Z: everything lands day 1–2).

## Blanks filled / documented

- FIXED (test/instrument only, landing with this run's commit):
  backlog #1693 — Part C acceptance map stale. The map is gone,
  replaced by run-time derivation; a future spawn drift can change
  WHICH item a seed expects but cannot false-fail C1 on a stale name
  again, because no name is pinned. (If drift ever produces a seed
  with no spawn armor, it reports NO-SPAWN, exactly as 16109 does.)
- UPDATED (facts for the coordinator backlog, not edited in place):
  #1694 spawn-generation drift — NO new drift since 1015Z: live
  probe on current master reproduces the 1015Z spawn table exactly
  on all 16 seeds (16103 bloodplate, 16109 no armor, all others one
  armor each). The drift recorded at 1015Z (swat_vest ->
  bloodplate on 16103, farstrider_boots vanished on 16109) is still
  the current state, not a moving target today.
- LEFT OPEN (not re-checked, not claimed): #1695 tier-3+ watch
  (armorfetch-b panel 0.5 -> 0.3125, regression_watch) — this run
  ran no balanced panel, so the watch stands unchanged.
- No new findings appended to sim-findings.md in place (coordinator
  owns it); the two backlog updates above are for the coordinator
  to apply on landing.

## Wall numbers

Unchanged by this arm (no game code): 1015Z band numbers stand —
village-lost 2/16, median survival 60d (capped), max wave 4 (6/16),
never 5. National / table / wins not re-read here; no win claimed.
