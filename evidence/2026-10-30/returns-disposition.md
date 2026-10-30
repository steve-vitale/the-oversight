# Returns disposition — gaps completion (2026-10-30)

Evidence-only landing. **Zero game-code changes in this commit: no `src/js`
changes, no lever flips, no gate or deed-bar retunes, no leg-village-link
changes.** All three returns mechanisms are HELD, not landed. Nothing in
this landing changes what any villager does in the game.

Source of truth for the verdicts: gaps coordinator #2's terminal report
(`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/gaps2-terminal-report-20261030.md`,
item 3) and the verdict file copied alongside this document
(`sim-returns2-verdict.md`, from branch `gaps2-returns` tip `941daf8ba`).
The three frozen preregs, the hunthold analyses, the sweep log, and the
check-quick logs are copied byte-identical from that branch (see
"Files landed" below). The full per-seed corpora stay on branch
`gaps2-returns` (held backup); they are not duplicated here.

## A note on commit `8740b977e` — please do not be misled

Master carries an EMPTY commit `8740b977e` whose message claims the
returns2 verdict evidence ("grudge GO (landing held), trail NO-GO,
hunthold PILOT NO-GO … evidence only, zero src/js"). **That commit
contains zero files.** It was a worktree/script-path mistake by gaps
coordinator #2 (invoking `safe-commit.sh` by its main-tree absolute path
from inside a worktree, so it committed onto master instead of the
worktree branch). It was deliberately LEFT ALONE: resetting shared
history is forbidden, and a sibling loop has since built on top of it
(establishment r60), so a reset would orphan their work. It is harmless
to players — content-empty — but its message is false advertising.
**The real evidence is branch `gaps2-returns` tip `941daf8ba` (25 files)
plus this landing.** If you are looking for the verdict evidence, look
here and there — not in `8740b977e`.

## 1. Grudge lottery — GO per the frozen prereg, LANDING HELD

Plain words: the lottery is the idea that a villager who was wronged
holds a grudge and is more likely to pick a hunt against the thing that
wronged them. On a fresh 16-seed band, judged against a prereg frozen
before any judged leg, it passed: deliberate picks 1 > 0, the fixture
weight table exact (mild-vs-dry gap 22 points), the collapse rule did
not fire, and every cost bar passed (starvation, need-override, wins,
national reach).

Why it is HELD anyway (coordinator call, Steve can overrule): the GO
rests on 1 pick vs 1 pick — no lift over control at all, in the weakest
cell, on an opportunity pool that shrank from 14 to 5 as trajectories
diverged. Landing live game code on zero demonstrated improvement would
be forcing a thin mechanism past its evidence.

Named next arm (NOT this run's work): a **confirm run with a
lift-based bar** — not just "more than zero." No confirm run was done
here, and none of the grudge code (branch `build-returns` /
`gaps2-returns`) lands with this document.

## 2. Trail-follow — NO-GO on the need-override cost bar only, HELD

Plain words: trail-follow is villagers following a monster's trail to
its tile instead of wandering. On a fresh band with grudge held constant,
both primaries passed (arrival-deliberate meetings 25 > 14; wall
improved) — the mechanism is alive. It failed on exactly one cost bar:
need-override follows 3 > 0.

Why that failure does not kill it: all three flags are marginal
departure-time hunger (57–57.5, full energy, full pantry) — not
pick-time pre-gate violations, because needs decay between pick and
departure. The metric itself is measuring the wrong moment.

Named next arm (NOT this run's work): a **corrected re-test under a new
prereg whose need-override join uses pick-time needs** (metric-review
item, never a re-score of this run). No re-test was done here, and no
trail code lands with this document.

## 3. Hunthold (pickdepart, revised) — PILOT NO-GO on H-P1 only, HELD

Plain words: hunthold is a villager whose hunt faces moderate danger
WAITING (asking, then tightening, up to about two days) instead of
quietly swapping to housework. On a fresh pilot (seeds 75201–75208, lever
OFF vs ON), the clearing leg passed, the count leg passed, the
completeness leg passed, and the hygiene leg passed. It failed on the
mechanism leg only: no wave-4 pick shows held-then-departed (the one
held wave-4 pick was held for its full 6-hold budget and then
overwritten to indoor work; the primary universe is 1 OFF / 3 ON picks).

Two things that matter for future readers:

- The lever stays **default-OFF**, and it is **not killed**: it fired
  486 times on the band, and the sense chain reads as honest waiting
  (a villager waits two days over a wave-4 hunt, then gives up to
  indoor work). The primary pattern is unobserved on a 3-pick universe,
  not disproven.
- The **provenance-clearing fix is PROVEN but NOT landed separately**:
  stale-provenance departures are 0/0 on fresh corpora (the old corpora
  counted 70/101). It belongs to this NO-GO arm's code; landing it
  alone would be a game change from a NO-GO run. So it stays on branch
  `gaps2-returns` (commit `cdbbbb920`) with the rest of the arm.

Named next arm: **none — no confirm follows a pilot NO-GO.** (Confirm
runs follow only a pilot GO.) A future prereg could revisit the primary
universe (wave-4 picks only may be too narrow for an 8-seed band), but
that is future work, not this landing.

## What was NOT done in this run

- No new confirm or re-test runs (those are the named next arms above).
- No returns game code landed (mechanism code stays on `build-returns`
  / `gaps2-returns` / `gaps2-returns-control`, held backups).
- No leg-village-link touches, no gate or deed-bar retunes, no default
  flips, no version bump, no push, no live verification. The
  coordinator merges and verifies HEAD.

## Files landed (this commit, all under `evidence/2026-10-30/`)

- `returns-disposition.md` — this document (new, no branch copy).
- `sim-returns2-verdict.md` — byte-identical copy of the branch verdict
  file (`gaps2-returns:evidence/2026-10-29/sim-returns2-verdict.md`).
- `sim-returns2-grudge-prereg.md`, `sim-returns2-trail-prereg.md`,
  `sim-returns2-hunthold-prereg.md` — byte-identical copies of the three
  preregs frozen 2026-10-29 before any judged leg
  (`gaps2-returns:evidence/2026-10-29/sim-returns2-*-prereg.md`).
- `returns2-hunthold-analysis-1.json`,
  `returns2-hunthold-analysis-2.json` — byte-identical analyzer outputs
  (byte-identical to each other, as the verdict records).
- `returns2-hunthold-sweeps.log` — byte-identical pilot sweep log.
- `returns2-checkquick-baseline.log`,
  `returns2-checkquick-postclearing.log`,
  `returns2-checkquick-postclearing-rerun.log` — byte-identical
  check-quick logs from the verdict run (284/6 baseline, failure set
  identical post-clearing).
- `returns-disposition-checkquick.log` — this landing's own check-quick
  run (see below). Not a branch copy.
- Per-seed corpora NOT duplicated here: 16 hunthold pilot corpus files
  plus 2 summaries remain on branch `gaps2-returns` tip `941daf8ba`
  under `evidence/2026-10-29/perseed-returns2-hunthold-off/` and
  `...-on/`. The grudge/trail corpora from the same branch
  (`d3ccf59cd`, `09bb04d06`) likewise stay on the branch.

## Check-quick (this landing)

Run in the worktree after landing, evidence-only diff, no `src/js`
touched: `node scripts/check.js --quick` (2030s, 290 scripts).
**Result: 282 passed, 8 failed — NOT the baseline 284/6, so NOT claimed
green.** The 8 failures are the known 6 (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes) PLUS two 120s TIMEOUTs, both
exit null, both killed by check.js's per-job 120s cap while sibling
sweeps and another check-quick ran concurrently:

- `scripts/godpath/test-trust-observer-neutrality.js` — re-run alone
  afterwards: PASS in 70s.
- `scripts/test-capable-bot-20261014.js` — re-run alone afterwards:
  PASS in 128s (over the 120s cap even alone; the baseline run had it at
  117s, just under the cap).

Both extras are timeout artifacts under load, not assertion failures,
and neither script's inputs changed in this diff (evidence files only).
The 6 known baseline failures are unchanged in kind. The coordinator's
merge verification is still the final word.
