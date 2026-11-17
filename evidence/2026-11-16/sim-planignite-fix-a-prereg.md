# sim-planignite-fix-a — PREREG (binding)

Run: oversight-flesh-out-loop, Loop A run `fleshout-20261117T0015Z`,
axis winnability chain, arm sim-planignite-fix-a — LEVER (pilot):
the planignite catch-22 fix.
Binding prereg: THIS file — frozen before any judged sim. The lever,
instrument extensions, and proof test are built AFTER this commit;
no judged numbers exist yet. Commit this file FIRST
(`scripts/safe-commit.sh "sim-planignite-fix-a: frozen prereg — ..."`),
then build.

## The question, in plain words

The plan system is the thing meant to get villagers hunting wave-3+
beasts — but it only switches on after a wave-3+ seed or an agency
kill, i.e. after villagers already did the thing the plan was meant
to cause. Two villages in eight hear monsters from day 5, slay
beasts, survive 150 days at regional standing, and never once start
a plan. This arm tests the minimal fix: let the first HavenTick
initialize the plan store, so a ranger at Haven who has heard the
fire talk about a slain beast can start thinking in gameplan terms.

## Prior art (read first)

- `evidence/2026-11-16/sim-planignite-a.md` + prereg — the DIAG this
  arm follows. Its mechanism section (code + numbers) is the lever's
  justification: `v.winPlan` lazily initialized ONLY by `stateOf()`
  (src/js/win-plan.js:93), reached only via winPlanSeedFromFight /
  winPlanNoteKill / fight-gate bump / winPlanOf / winPlanStats; but
  `winPlanHavenTick` (win-plan.js:282-285) reads the store directly
  (`if (!v || !v.winPlan) return null`) and never calls `stateOf()` —
  it can never be the first spark. On band 102601–102608, seeds
  102601 + 102607 never start a plan in 150 days
  (storeEverInitialized: false; 233/238 havenTick calls each; 869
  unexplained havenTick calls panel-wide), while rangers stand at
  Haven with engagement present.
- `evidence/2026-11-16/sim-trickshare-a.md` — the proof pattern this
  arm copies (static off-mode checks + live + D1/D2 + drift D3).
- `evidence/2026-11-16/sim-vetreengage-a.md` — the env-gate + driver
  pattern this arm copies (MODE control|armed, env set in oneRun).
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  §Monster counters (the 2-observation rule: a survived encounter
  brings home an observation, two observations teach the village
  the trick).
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  plan ignition or the winPlan store — checked against the
  `docs/CANON.md` manifest, same gap the DIAG recorded for havenTick
  plan creation. The evidence file states this gap instead of
  inventing canon. The fix changes no canon-covered rule: no
  threshold, no gate, no price moves; it only lets the existing
  havenTick engagement check run on the first call instead of
  returning null before it.

## The lever (frozen design)

In `src/js/win-plan.js`, `winPlanHavenTick` only: when `v.winPlan`
is absent AND the env flag `PLANFIX=1` is set, initialize the store
by calling `stateOf(this)` (the existing lazy initializer — it also
creates `winPlanStats`), then proceed through the EXISTING
engagement / profile / Haven checks unchanged. When the flag is
unset, the guard is byte-for-byte the old behavior (`return null`).
Env-gated default-OFF, exactly like VETREENGAGE. Do NOT flip any
default. No other function touched; no threshold, gate, or price
changes; no new seeding path (the existing `!plan` creation block
below the guard does the seeding once the store exists).

## Seed band (REUSED — recorded, not fresh)

- Band: **102601–102608** (8 seeds), two legs on this tip:
  control (PLANFIX unset) vs armed (PLANFIX=1). Identical seeds,
  competent verbatim, 150d death-aware.
- REUSE REASON: this is the DIAG's own band, and the judged
  comparison is before/after on the exact villages that exhibited
  the catch-22 (102601 + 102607 are the no-plan villages). A fresh
  band would measure the fix on villages that may never have had
  the defect. The DIAG control corpus
  (`evidence/2026-11-16/perseed-planignite-a-control/`, base
  7bb50f3dc) is a cross-check reference only — NOT the judge: the
  judged before leg is re-run on THIS tip with the flag off, so
  base drift between the DIAG base and this tip cannot masquerade
  as lever effect. (This tip also carries the trickshare-a revert
  and the env-gated vetreengage code; both are off in both legs.)
- Forbidden bands from the DIAG prereg still apply (no seed outside
  102601–102608 is used).

## Primary metric + GO bar (frozen)

Primary metric: **no-plan villages** — villages with zero
`v4creates` rows in 150d (the DIAG's definition, unchanged).

PILOT GO iff ALL hold:

1. **Plans created > 0 on BOTH 102601 and 102607** (the two DIAG
   no-plan villages ignite under the fix).
2. **No-plan rate 0/8** armed (was 2/8 control).
3. **Store-never-initialized taxonomy row: 0 villages armed.**
   The row the DIAG's metric review proposed: initializer count 0
   across all four observable initializer kinds (wave-3+ seed
   rows, agency kills, gate avoids, bond/muster bumps) AND zero
   creations. Under the fix the havenTick call itself initializes
   the store, so a village can show zero external initializers yet
   still ignite — the row counts only villages with zero
   initializers AND zero creations.
4. **Unexplained havenTick calls collapse**: armed unexplained-call
   count < 10% of control (control expectation ≈ 869 from the
   DIAG; the guard that produced them no longer fires armed).
5. **Cost bars hold**: starvation deaths armed <= control + 2
   (cause === 'starvation' in the per-seed deaths rows; DIAG
   control had 4 total: 102603:2, 102604:1, 102606:1); median
   survival armed >= 0.8x control (DIAG control median 150.5d).
6. **Proof green** — `scripts/test-planignite-fix-a.js`: static
   off-mode checks + live unit (off: uninitialized store returns
   null even when engaged; on: store initialized + plan created)
   + live geared fight (encounter gear: a geared scholar fighting
   with a party — never a fresh un-geared scholar alone — the
   ignition must be observable out of real play, not only a direct
   call) + D1 (repeatability, recorder ON twice, armed 150d seed
   102601) + D2 (wrap neutrality, recorder ON vs OFF, armed 150d
   seed 102601) + D3 (drift: fix-driver control vs DIAG-driver
   control, same seed 102601 150d, identical trajectory
   fingerprints — the lever code + driver copy must not perturb
   off-mode behavior).
7. **Balanced panel attached** — §15 compare of the two legs
   (`scripts/build-planignite-fix-panels-20261116.js`, paired
   seeds, pseudo-policy `planignite-fix-a`), `.md` attached to the
   evidence file. The panel is the instrument; this prereg is the
   judge. A `review_required` / `regression_signal` on a secondary
   metric is an investigation note, not a re-score.
8. **Instrument holds on both legs**: 8/8 files parse per leg,
   zero tick-gate mismatches, zero holders without a creation
   (the DIAG's bars 2/5/6, re-checked armed as well as control).

PILOT NO-GO (any bar fails) → revert the lever fully (verify
`src/` diff 0) and land evidence-only. PILOT GO → keep the lever
env-gated default-OFF on the branch for the confirm; no default
flipped by this arm.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha `df9b7dff4de4`, verified in the worktree before this commit).
- Legs: TWO on this tip — control (PLANFIX unset) and armed
  (PLANFIX=1), one shared baseline. Driver:
  `scripts/planignite-fix-driver-20261116.js` (copy of the DIAG
  driver with MODE control|armed, env set in oneRun, same recorder
  — the DIAG driver file itself is NOT modified). Outdirs:
  `evidence/2026-11-16/perseed-planignite-fix-a-control/` and
  `...-armed/`. Analyzer: `scripts/analyze-planignite-fix-a.js`
  (reuses the DIAG analyzer's `classifyIgnition` + the new
  taxonomy row + before/after comparison; writes
  `evidence/2026-11-16/planignite-fix-a-analysis.json`).
- Determinism: D1/D2/D3 as in §Primary metric bar 6.

## Sense-testing (mandatory)

Read transcripts. Read the per-village rows as stories: does the
ignition read sensibly — a ranger hears the fire talk about a slain
beast and starts gearing up for the next one — or does the fix
spark plans for villagers with no business hunting (a plan for a
villager who never fought, never heard, never left Haven)? One
village whose ignition contradicts the day's narration is a
finding, not a rounding error — name it in the evidence.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the fix ignite plans that then did nothing (creations with
  zero departures / zero launches — ignition without pursuit is a
  hollow win; report creates vs departs per seed)?
- Did the store-never-initialized row classify every armed no-plan
  village (if any remain), or is a new unexplained shape hiding
  behind the fix?
- Did unexplained havenTick calls actually collapse, or did the
  guard just move (report the full call-outcome distribution
  before/after)?
- Was 150d the right horizon, or did armed ignitions cluster at
  the tail (a day-140+ first creation says the horizon matters)?
- Did the cost bars bind (starvation / survival), or did the fix
  buy plans with deaths?

## Wall numbers (report every run)

National (standing >=200 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, median survival, wave-4 kills, deaths.
