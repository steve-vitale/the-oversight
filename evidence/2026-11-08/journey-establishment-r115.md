# Journey leg ESTABLISHMENT — r115 RUN NOTE (2026-11-08, Lane A)

## Adoption (this run, 16:45 CST occurrence)

Stale-lock recovery: lock run_id 2026-11-08T19:54:07Z (~2h50m old, no
registry entry) + prior tree heartbeat 65 min stale + no live process +
no writes since 20:11Z — dead run, lock deleted, own lock
2026-11-08T22:44:21Z created. Adopted the r115 closeout per the 13:44
memory entry: rebased the branch onto explicit master tip 93e7bea26
(sim-flipsocial-b evidence landing; read from the main tree immediately
before rebasing), re-ran the proof test (54 passed, 1 failed — the
by-design cap leg on the reverted tree), re-ran the gates, merged.
Post-rebase tip 85fd43ad9 (same 6 commits, new SHAs; the SHAs in the
"Commits" section below are the pre-rebase ones).

## Gate attribution (owed item 1 — full FAIL list, captured this time)

Full gate on the rebased branch: **761 passed, 312 failed in 3137s**
(log `evidence/2026-11-08/journey-establishment-r115-gate-full-adopt.log`).
Quick-gate reconstruction from that list (301 quick jobs): **7 failures**
vs the 13:44 run's 11 — same set within run-to-run flake; the 13:44
FAIL list itself was never saved, so this reconstruction is the record.

- Load-timeouts (exit null, 120.1s = the check.js cap, 3): 
  `test-capable-bot-20261014.js`, `test-synergy-stall.js`,
  `test-table-endings-20261014.js`. Long sim-heavy scripts under
  4-parallel load on a box running several sibling loops; the full
  gate's slowest list shows three more scripts at exactly 120s. Timeout
  class is systemic under load, not specific to these tests.
- Pre-existing assertion failures (4): `godpath/test-mobile-combat-
  cadence.js` (Continue double-wraps the announced round);
  `godpath/test-occupation-panels.js` (CLI workflow throws);
  `godpath/test-phone-frame-proof.js` (phone receipt stale — index.html
  moved since the receipt; needs a receipt refresh, not a game fix);
  `test-establishment-r20-fixes-20261020.js` (racks-full voice gate:
  expected 2 lines next day, got 1 — reproduces standalone).
- Full-gate remainder (305): dominated by one signature — **182
  failures are `ReferenceError: Text is not defined`** in genCharacter.
  Cause: `src/js/text.js` landed 2026-10-23 (c01f2e5ab), AFTER the
  2026-10-14 green-list freeze; genCharacter uses `Text.proBundle`,
  and old scripts with copied eval-boilerplate file lists never include
  text.js. The rest are old Oct 6–14 content-assertion failures
  (ontology factions rule, H1 formula mismatches=171, fleeAt `tactic`
  null-read, `village` null-reads, blitz-crisis 120s timeout).
- **Zero branch-caused failures.** The branch touches no src and none
  of its 3 scripts appear in the gate at all (0 `r115` mentions in the
  log); every failing file is byte-identical between branch and master.
  The green list has not been re-baselined since the text.js landing —
  that re-baseline (or adding text.js to the stale loaders) is owed to
  a future maintenance pass, not this adoption.
- The quick-gate re-run itself died at ~00:00Z mid-run (pid 46075
  gone, no summary, ~280/300 done, 4 F's) — killed externally under
  heavy sibling load (fightblend balance-panel children at ~1.5 GB
  each); the reconstruction above stands in its place.

## Telemetry deviation check (this run)

Re-run post-rebase: `telemetry-check.js --baseline .../telemetry-
baselines/establishment.json --current 'evidence/2026-11-08/journey-
establishment-r115-after-seed*.json' --metrics systemDay,monsterKills`
→ **quiet** (16 files, 2 metrics). Baseline NOT rolled.

## Adoption (this run, 12:45 CST occurrence)

This run did NOT play a fresh leg. The memory log (2026-11-08 10:03 CST)
recorded r115 adoption as owed: the r115 run (16:04–17:17Z) died after
its after-panel commit, leaving 5 commits, uncommitted
`scripts/balance-proof.json` + untracked analysis + neutral panel, no
check.js run, no lock, rotation still 1. This run adopted it: inspected
the branch, independently re-verified the verdict numbers from the raw
panel JSONs (own script, no analyzer code), ran the proof test on the
fixed tree AND on the reverted tree, dropped the NO-GO fix (no game-code
trace, fightloop-b precedent), and lands the record only.

## Leg question (r114's metric review #1, prereg BEFORE any seed runs)

The specialist/foodXp ladder is OPEN and MOVING (r114: 10/16 seeds), but
the pace is the question: six villagers went 0→skill 3 in 42 days and
preserver skill-3 holders went 12→17. A cook going from knowing nothing
to the village's best preserver in six weeks is faster than the craft
should travel. THIS RUN WAS THE DIAL: cap the per-batch preserver grant
at +3 XP per rack resolution, judged before/after on the same 16-seed
balanced panel.

Prereg: `evidence/2026-11-08/journey-establishment-r115-prereg.md`
(written before any proof run). Base at branch time: master `ad0fc09eb`.
Seeds: matched reuse 1502, 1504, 1603, 1604 + 17101–17112 (same 16 as
r112/r113/r114). Policy: competent + HUNTSTAFF=2. Horizon 42d.

## The fix (built, measured, judged, REVERTED)

One line in `src/js/game.js` (cook-duty rack resolution): the PRACTICE
grant `+ n` (n = batches preserved in that resolution) became
`+ Math.min(n, 3)`. Commit `2079d5344` (r115 run). The cap binds only
resolutions preserving ≥4 batches.

## Verdict: NO-GO (pace bar missed)

Binding bars, prereg Q1: GO iff (a) ≥1 villager moves specialist
0→positive on ≥8/16 seeds AND (b) villagers reaching specialist 3
from 0 inside 42 days number ≤4 on the AFTER panel (r114: 6).

| metric | BEFORE | AFTER | bar |
|---|---|---|---|
| moves (seeds with a 0→positive specialist move) | 10/16 | 10/16 | ≥8/16 PASS |
| pace03 (villagers 0→skill 3 in 42d) | 9 | 9 | ≤4 MISS |
| M3 survival-42 | 16/16 | 16/16 | ≥12/16 PASS |
| M4 pantry (0 starvation deaths) | 15/16 | 15/16 | ≥12/16 PASS |

Independently verified by the adopting run from the committed panel
JSONs (`/tmp/verify-r115.py`, own code, no analyzer reuse): identical
numbers, identical 9 pace03 cells (Caroline/Rahul/Miguel/Ruth/
Maricela/Sattam/Alejandra/Raj preserver, Sola butcher), foodXpEnd total
500→403, preserver XP 440→344. The cap trimmed the total but the races
are UNCHANGED: pace 9 before, 9 after. The 0→3 races are banked through
many small resolutions, not a few big ones — the cap trims the tail,
and the tail was not where the races live. (r115 after-panel: 224 rack
resolutions granting preserver XP; the cap fires only at n≥4.)

Diagnosis (prereg-anticipated): the cap was insufficient — NO-GO, never
a re-score. Next dial, named not decided: a steeper rung (5→1/10→2/
15→3 is too fast for preserver) or a +2 cap. The fix is REVERTED: the
adopting run reset the branch to current master `6680d7924` and
cherry-picked the 4 non-fix commits, dropping `2079d5344`. No game-code
trace remains (`grep Math.min(n, 3)` empty; no `r115` trace in
`src/js/game.js`).

## Proof tests (adopting run's own runs)

- `scripts/test-journey-establishment-r115-ladder.js` on the FIXED
  tree (before the revert): **55 passed, 0 failed** — the cap mechanism
  works as built.
- Same test on the REVERTED tree (final tree): **54 passed, 1 failed**
  — exactly one failure, `BG rack-fourplus-batches-grant-capped-
  three-xp`, the cap leg itself (5 batches preserved, XP +5 instead of
  +3). Every other leg passes, including the 5-XP rung gates, the
  hunt-grant legs, and the menu:more legs. By-design pattern: the test
  proves the cap WOULD work if applied; the panel proves it doesn't
  move pace. The test is NOT on the green list, so the gate is unaffected.

## Q2 verdict: FIXED (menu:more → (null) stays fixed)

0 `(null)` THEM lines across the panel (analyzer count;
nullThemLines=0, navTurns=11). People check: read the seed-17107
after-panel convos in full (4 held convos). They have meaning:
- Marisol (pottery instructor) dreams of rows of humming pods, tells
  of her mother Daryna taken at the Scattering, asks the player to ask
  the System about her — a promise is made, then she invites the player
  to walk her trap line. Want → commitment → new offer.
- Dagmar (carpenter) asks for help on the creek water run, sets a dawn
  meet, teaches two plants by name (Physic Nut, Lemongrass).
- Miriam (lawyer) wants the water haul but is honest about being away
  on the road — the meet is deferred, not faked.
- Linh (paramedic) deflects about a wound, then softens into real talk.
Menu hygiene note (not blocking): after a convo runs out of scripted
picks, the stall menu shows the full betrayal case_12 menu (5 options)
on 3 of 4 convos, regardless of relevance — the betrayal options sit in
the menu as standing options. Worth a look by a conversation pass, not
by this run.

## Village assessment (plain words, after-panel, 16 villages, 42 days)

Every village lived to day 42/43 — none scattered, none game-over. But
villages persist while individuals turn over fast: 747 deaths across
the 16 villages (20–73 each), 151 alive at the end (7–12 per village).
Death is overwhelmingly monsters in the wild — villager combat and
expeditions dominate every seed's cause list (seed 17108: 40
expedition + 28 villager-combat deaths of 73). Starvation killed 1
villager on the whole panel (seed 1603); sickness and wounds a handful.
Pantries held: 10k–148k kcal at day 42. Waves reached: 3 on 11 seeds,
4 on 5. Practice works: competence moves steadily in wood/stone/water/
cook across all three windows on all 16 seeds (87 + 132 + 77 attributed
moves; 7159 practice reps by day 42). Skills ARE being learned — 55
skill 0→positive cells across the panel — but the ladder's top end is
the story: 9 villagers went 0→skill 3 in six weeks, 8 of them
preservers. The village gets its preservers; it gets them too fast.
Hunting is uneven: seed 17108 hunted hard (32 hunt log, 30
field-dressing kills) while seeds 1502 and 17111 never hunted at all
(0 assignments) — same policy, different villages. Seed 17107 stays
quiet (0 hunts, racks firing, 1 preserver move) — per r114's metric
review, not a ladder problem. Held/notheld kcal ratio: 200850 held
(44 kills) vs 63731 notheld (18 kills) → 3.15.

## Reachable / fun / winnable (establishment, days 14–40)

- REACHABLE: yes — every village reaches day 42 with routines, skills,
  hunts, and conversations firing; the ladder moves on 10/16 seeds.
- FUN: mostly — the people check reads like people, practice visibly
  pays, pantries fill. The pace is the fun problem: a cook becoming the
  best preserver in six weeks cheapens the craft; the fix for that
  didn't work (this run's verdict).
- WINNABLE: establishment is not the binding link (that stays wave-4
  kills / the full seat, 0 everywhere on the frozen band) — but the
  ladder pace matters for the Standing ladder's Craft track, which now
  mints from the same XP. A too-fast preserver ladder inflates Craft
  points toward the Village rung; leg 4's calibration should read this
  panel.

## Metric review (for the NEXT run, not this one)

- The pace bar (≤4) was the right bar and it caught a real miss: the
  cap trimmed XP without touching the races. Do not re-run the +3 cap.
  Next dial: steeper rung or +2 cap — pre-register which, and judge on
  the same 16 seeds.
- The moves bar held at 10/16 on both panels; the ladder is open. Keep
  the window method as the primary ladder count, with the survivor
  count alongside.
- Words rung + held/notheld ratio lines work — keep them.
- `preserve_food` still has no read site (r114). The ladder makes
  preservers at a sane-or-faster pace while the skill itself does
  nothing a villager can use. That gap belongs to a leg that can give
  the skill a job.
- The betrayal menu showing as a standing option in stall menus is a
  conversation-hygiene finding for a future pass.
- Seed 17107 is not a ladder problem (racks firing, earners dying) —
  don't chase it with ladder dials.

## Commits (branch journey-establishment, rebased onto 6680d7924)

- `5e0d7d494` prereg + driver + analyzer + proof test (pace cap +3)
- `e73c3ffce` driver-neutrality references (r114 driver on master, 42d
  + 5d seed 1502; seed 1502 NEUTRAL)
- `29c35d440` before-panel (16 seeds × 42d, unfixed engine)
- `1b66a6365` after-panel (16 seeds × 42d, capped engine) + analysis
- (adopting run) analysis.txt + neutral-r115 panel + this run note
- DROPPED: `2079d5344` cap preserver XP at +3 (NO-GO, reverted)

The neutral panel (`evidence/2026-11-08/neutral-r115-20261108/
panel.json.gz`) is committed as the record that the fixed engine was
observer-neutral; it is NOT the active proof — `scripts/
balance-proof.json` stays on master's panel (the r115 uncommitted
refresh was discarded with the fix).

## Infrastructure

- Stale-lock recovery: none needed — no playtest lock existed at run
  start. Pre-flight found the main tree dirty with ONE 0-byte orphan
  (`permprobe-622gzl68`, an EPERM-flap probe leftover); removed, tree
  clean. Disk 31%.
- EPERM FLAP (active ~18:44–18:52Z): `worktree-reap.sh` and
  `worktree-heartbeat.sh` both failed with `PermissionError: [Errno 1]
  Operation not permitted` on the registry atomic write. Heartbeat
  retried and LANDED at 18:52:44Z — flap cleared mid-run. The lock file
  (plain write) succeeded throughout and protected the run.
- `git pull origin master --ff-only`: already up to date (local master
  ahead of origin; pellet-boost landing not yet shipped).
- Rotation: 1→2 written at closeout (next Lane A run plays deepening).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/
establishment.json --current 'evidence/2026-11-08/journey-establishment-r115-after-seed*.json' --metrics systemDay,monsterKills`
→ **quiet** (16 files, 2 metrics, no large deviations). Baseline NOT
rolled. (Same shape as r114's check; the baseline is a 4-seed control
panel, the current a 16-seed HUNTSTAFF=2 panel — arm-driven deltas are
expected and adjudicated as such; none fired LOUD.)
