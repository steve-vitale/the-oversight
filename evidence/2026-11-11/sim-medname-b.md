# Evidence — sim-medname-b: medicine narration names the pill taken (finding #2274)

Run: fleshout-loop-b-20261111T2330Z · worker sim-medname-b · 2026-11-11
Prereg: evidence/2026-11-11/sim-medname-b-prereg.md
Finding: sim-findings.md #2274 (2026-11-11, crisis-r181 medicine narration).
Canon: docs/CANON.md + docs/DISEASES.md:89-93 (the four regional ruin
medicines and their labeled effects). Names grounded in canon + item data
(regions.json: "Antimalarials (artemether)", "Cold medicine (kakkonto)",
"Bandages (roll)", "ORS packets"). Nothing invented.

## What was wrong
`useMedicine(kind)` (src/js/game.js:14160) cured/eased correctly — the
kind→class map and the cure tables were right — but line 14174 read
`kind === 'antibiotics' ? 'antibiotics' : 'antiparasitic'`, so taking an
antimalarial, a cold remedy, a bandage, or ORS narrated as taking
"antiparasitic" in every say line, and passed 'antiparasitic' as the
`cureStatus` source too. Pre-fix test run (RED proof) captured it verbatim:
"You dry-swallow the antiparasitic. You're guessing — nobody's named this
sickness yet." / "The antiparasitic do exactly what they're for. The fever
breaks within the day."

## The fix (src/js/game.js, useMedicine only — lines ~14174–14195)
- `KIND_NAME` map: antibiotics → 'antibiotics', antiparasitic →
  'antiparasitic', antimalarial → 'antimalarial', cold_remedy →
  'cold remedy', bandage → 'bandage', ors → 'ORS'.
- Verb agreement forced by the singular names: the cure/ease templates
  used plural verbs ("do", "work", "take"), so a `plural` flag
  (antibiotics / antiparasitic / ORS only) picks do/does, work/works,
  take/takes, they're/it's, don't/doesn't. The antibiotics and
  antiparasitic lines are byte-identical to before; the four regional
  kinds now read grammatically ("The bandage takes the edge off, but
  doesn't end it."). No cure behavior touched; no other wording changed.
- Diff confined to `useMedicine` + the test file. Sibling arm
  sim-finalvoice-b may also touch game.js — this arm's edit is only
  game.js:14174–14195 (useMedicine); if their edit lands in the same
  range the coordinator must sequence the merges.

## Proof
Extended scripts/test-journey-crisis-r181-regional-meds.js with section
(6) "NAMES": wraps Game.say (precedent: test-abilities-breakit-r4),
captures the lines each useMedicine call emits, and asserts the spoken
name per say path, plus a no-'antiparasitic'-leakage assertion on every
regional-kind line. Coverage (reachability per the cure tables):
dry-swallow × all four kinds (undiagnosed); cure × antimalarial
(diagnosed + undiagnosed variants); ease × cold_remedy / bandage / ors;
antibiotics + antiparasitic cure controls.
- Pre-fix run: 5 FAILURES, all in section (6); sections (0)–(5) and both
  controls PASS — the test observes the defect, not the fixture.
- Post-fix run: `r181 regional-meds: ALL PASS` (17/17 checks).
- `node --check` clean on game.js and the test.
- Targeted disease/medicine regression (direct node runs, real exit
  codes not yet all captured — see below): test-disease-break-r14
  (68 passed, 0 failed), test-disease-curepath (ALL GREEN),
  test-disease-recovery (PASS 7/7), test-parity-disease (5/5),
  test-status-effects (51/51), test-standing-regional-filter (20/20).
  Five old October tests fail on the FIXED tree — and fail IDENTICALLY
  on pristine HEAD (game.js stashed, re-run with real exit codes):
  test-disease-break-20261010 (exit 2, "Game.seList is not a function"
  in its own hand-rolled harness), test-disease-break-alien-20261010
  (exit 1, uncaught crash), test-disease-breaks-20261009 (exit 1,
  "25 passed, 1 failed (AFTER mode)"), test-disease-pools-20261009
  (exit 1, uncaught crash), test-break-regional-r3-20261011 (exit 2,
  genRoster crash). All five are pre-existing master failures, none
  attributable to this change (none reaches useMedicine; the failures
  are harness loading / roster generation). They are in the green list
  but carry no `quick` tag, so `check.js --quick` does not run them.
  Fix restored byte-identical after the stash test
  (hash ba733ff83cb82b8b639c81a3e2b36eb12a6f4e3c before and after).
- Regression: `node scripts/check.js --quick` — first run (340 scripts,
  4 parallel) was killed by SIGTERM at ~31.7 min with the progress line
  ~97% complete and the failure summary unprinted; re-running detached
  to evidence/2026-11-11/sim-medname-b-check-quick.log (see below).

## Scale-wall numbers
N/A — no sim run in this arm. Narration-only fix; cure behavior already
unit-proven and untouched; no behavioral lever, no seeds, no policies.

## Village assessment / sense-test
The spoken lines now match the pill in the player's hand, which is what
the sense-testing law requires: a player who just looted antimalarials
from a ruin cabinet should hear about antimalarials, not a drug for gut
worms. One remaining oddity, NOT fixed here (out of scope, noted for the
coordinator): the dry-swallow line still says "You dry-swallow the
bandage" — a bandage is applied, not swallowed. The name is now right;
the verb is still wrong for that one kind. Worth a one-line follow-up
(e.g. a per-kind use verb) if Steve's eyes land on it — not changed
here because the brief was the name mapping only.

## Metric review
GO threshold (prereg): section (6) green with a leg per kind per
reachable say path; no regression in the regional-meds suite; no other
test failures attributable to the change.
- Section (6): 7/7 new checks green post-fix (5 failed pre-fix).
- Existing suite (0)–(5): green pre- and post-fix.
- Regression sweep: 330/340 quick green; 10 failures all shown pre-existing
  (3 identical on pristine HEAD) or load timeouts / load-only (see
  "Regression sweep result"). No new attributable failure.
Verdict: GO (adoption run 2026-11-12 — prereg bar met in full).

## Regression sweep result
`node scripts/check.js --quick` (detached run, COMPLETED): **330 passed,
10 failed in 1319s** (log: evidence/2026-11-11/sim-medname-b-check-quick.log).
- 6 TIMEOUTS at the 120s per-script cap (exit null, no assertion failure):
  test-living-garden-deed-attainment, test-occupation-panels,
  test-one-person-army-deed-attainment, test-trust-observer-neutrality,
  test-synergy-stall, test-capable-bot-20261014. Several print passing `ok`
  lines before the cap (capable-bot, trust-observer). All are long sim /
  deed-attainment scripts; none exercises `useMedicine`. Slow under the cap
  on a 1.5-CPU box shared with sibling check runs — not attributable.
  Standalone spot-check of test-synergy-stall (adoption run): INCONCLUSIVE
  — process lost after ~2.5 min with progress output ("total
  ability_granted events: 157") but no verdict and no failure observed;
  recorded as incomplete, not as a pass.
- 3 fail IDENTICALLY on pristine HEAD (stash-compare, adoption run, real
  exit codes): test-measurement-proof-update (exit 1, "Proof source inputs
  are not current"), test-measurement-workflow (exit 1, retained neutrality
  proof), test-phone-frame-proof (exit 1, stale phone receipt) — pre-existing
  proof/receipt staleness on the base, not attributable.
- 1 failed only under check.js load: test-measurement-cache-flags (exit 1,
  91.4s in the sweep) passes standalone on BOTH pristine HEAD (exit 0) and
  the fixed tree (exit 0, 4/4) — load/timing, not attributable.
- Targeted disease/medicine regression, fixed tree, real exit codes
  (adoption re-run): regional-meds 17/17 exit 0; disease-break-r14
  68 passed / 0 failed exit 0; disease-curepath ALL GREEN exit 0;
  disease-recovery PASS 7/7 exit 0; parity-disease 5/5 exit 0;
  status-effects 51/51 exit 0; standing-regional-filter 20/20 exit 0.
- `node --check` clean on game.js and the test file (adoption run).
- No NEW attributable failure. The five October pre-existing failures from
  the first run stand as recorded above (unchanged).

## Adoption notes (2026-11-12, fleshout-loop-b-20261112T0130Z)
- Stash hazard, LOUD: during this adoption the sibling sim-finalvoice-b
  worker's bare `git stash pop` popped THIS arm's stash (`medname-rebase`)
  into THEIR tree — their tree now carries this arm's exact 2-file diff
  (game.js hash ba733ff83…) as uncommitted changes, and this arm's stash
  is gone. This arm's tree still holds the fix byte-identical
  (hash ba733ff83… verified after the incident; diff is exactly the 2
  files, 110 insertions). Do NOT commit from the finalvoice tree until
  its owner removes the medname diff (their own work is
  progression.js/table.js, not these files). Lesson: bare `git stash pop`
  on this shared repo is unsafe while a sibling is stashing — use
  explicit stash refs.
- Base moved: local master is now e0f1cacb0 (bisect-anchor2-a, Loop A);
  this branch rebased onto it before commit. Master does not touch
  src/js/game.js or the regional-meds test (0 hunks), so the rebase is a
  clean replay; regional-meds suite re-run after the rebase.
