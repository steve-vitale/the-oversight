# sim-partytrios-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-partytrios-b · **Loop B run:** fleshout-loop-b-20261118T1330Z
**Type:** BUILD — bump `winPlanStats.partyTrios` on the live-brain pick
path (finding #2532), then pilot it.
**Frozen:** 2026-11-18 ~14:08 UTC (before the pilot sweep; the proof
test already ran — it proves the mechanism, it is not a judged sim).
**Branch tip:** `sim-partytrios-b` (fix + proof test + driver +
analyzer committed below this prereg).
**Base:** master `8709e9f87`.
**Builds on:** `evidence/2026-11-18/sim-triodrought-b.md` (finding
#2532: trios launch, counter reads 0) and its frozen corpora
(`perseed-triodrought-b-{ctl,arm}/`, band 104011–104018);
`evidence/2026-11-18/sim-winplandepart-b.md` (depart-path trio
counting internally consistent: trio departs 10/10 with partyTrios
delta 1); the HELD sim-partysize-recorder-b branch, commit
`035034c9f` (the `partyQuads` one-liner this fix mirrors — see
Correction below).

## Correction to the task brief (recorded before the fix)

The brief states the `partyQuads` gap "was FIXED by
sim-partysize-recorder-b (commit 035034c9f)". Verified on this base:
**that commit never landed on master.** It sits on the HELD
sim-partysize-recorder-b branch (parent `02117e2e8`, also not on
master; the re-run evidence itself says "this branch stays HELD and
unmerged on a B2 NO-GO"). On master `8709e9f87`, `partyQuads` exists
nowhere in `src/js` — no default in `win-plan.js`, no bump anywhere.
The one-liner PATTERN is real and is what this arm mirrors; the live
`partyQuads` fix is not. `partyQuads` itself is out of scope here
(one-liner scope, same as the recorder arm's own deferral). The
evidence file records this so the next arm does not re-derive it.

## Diagnosis (from the code + the frozen triodrought corpora — decided BEFORE the fix)

1. **The brain mirror launches trios and never counts them.**
   `vbrainExecuteDepart` (`src/js/villager-brain.js`) mirrors
   `winPlanDepart`'s shared-target party launch: it starts the
   holder, the first companion, and (VETREENGAGE-gated) the second
   companion, verifies each expedition actually started
   (COMPANIONGUARD), and records `launched` (companions only). When
   `launched.length > 1` — holder + 2 companions, a trio — it
   hunt-stages the second companion's plan and returns `'launch'`.
   It never touches `partyTrios`.
2. **Only the depart path bumps the counter, and that path never
   fires on this band.** `winPlanDepart` (`src/js/win-plan.js:666`)
   calls the module-internal `bump(self, 'partyTrios')` inside its
   own `launched.length > 1` block — but `vbrainOwnsDawn()` returns
   true unconditionally, so the depart path is unreachable in live
   play (test-winplandepart-b.js §0 proves the gate). The
   winplandepart arm staged it with a BRAINOFF override and showed
   its counting internally consistent (10/10 trio departs, delta 1).
   On the triodrought band it fired 0 times on both legs (all 43
   launches via the brain path).
3. **The frozen numbers say the gap is total, not partial.**
   Triodrought arm leg: 22 trio launches (partySize ≥ 3 in
   `v4departs`), `partyTrios` summed over all 8 per-seed files = 0.
   Control leg: 0 trios, `partyTrios` 0. The counter is not noisy —
   it is blind to the only launch path that fires.
4. **The canonical accessor reaches the brain module.**
   `win-plan.js` exposes `winPlanStats()` as a Game method
   (`win-plan.js:331`); it initializes the defaults (including
   `partyTrios: 0`) via `stateOf`, so a bump through it is safe on a
   fresh village. The module-internal `bump()` is unreachable from
   the brain module — exactly the shape the `partyQuads` one-liner
   already solved in the HELD commit.

## Fix shape (decided FROM the code, step 1)

**One guarded bump in `vbrainExecuteDepart`**
(`src/js/villager-brain.js`, inside the `if (launched.length > 1)`
block, after the second companion's plan update), mirroring the
`partyQuads` one-liner verbatim in shape:

```js
try { var _pt = (typeof this.winPlanStats === 'function') ? this.winPlanStats() : null; if (_pt) _pt.partyTrios = (_pt.partyTrios || 0) + 1; } catch (e) {}
```

NOT touched: the depart-path bump (owned by winplandepart-b, already
correct); `partyQuads` (absent on master, out of scope — see
Correction); any candidate, pick, gate, or env flag; any narration.
The bump is counter-only: no RNG, no game-state write beyond the
counter, so trajectories must reproduce exactly across legs (the
drift check in the analyzer + the balanced panel both verify this).

## Primary metric (BINDING, §14)

**Counter coverage** = on the armed leg, `winPlanStats.partyTrios`
(summed over the 8 per-seed files) divided by the analyzer-observed
trio launches (`v4departs`, `result === 'launch'`,
`targetWave >= 4`, `partySize >= 3`); and the control leg's
`partyTrios` must be 0.

**GO threshold:** armed `partyTrios` ≥ 80% of observed arm trios
**AND** control `partyTrios` == 0.
**Pool floor:** ≥ 6 wave-4+ launches per leg **AND** ≥ 1 observed arm
trio. Below the floor the pilot is under-powered and the verdict is
NO-GO (METRIC-BROKEN), never a pass on a tiny pool.

Sizing: on the triodrought band the arm leg observed 22 trios and
the counter read 0 — the bug is total, so the 80% bar is a coverage
bar with room for the residual shapes the proof test already bounds
(blocked second companion, c2-null commit, off-mode — none of which
launch a trio, so none of which should bump). A depart-path trio on
this band would ALSO bump (correctly — it is a trio launch), so the
ratio can only exceed 1.0 if a launch is counted twice; the proof
test's once-per-launch check (§5d, two launches → 2) bounds that.

## Secondary metrics (supporting, not binding)

- **Carry rate** (triodrought analyzer, reported not judged): among
  launches whose authorizing score-row candidate carried
  `companion2`, the fraction whose depart row carries it. Expect arm
  100%, ctl 0% — the triodrought mechanism, unchanged by this arm.
- **Cost bar (GUARDRAIL, binding — sim-scalemetric):** starvation ≤
  ctl+2 on totals AND arm-only deaths; median survival ≥ 0.8× ctl
  median. A GO met with this breached is NO-GO (§14). Expect 0
  movement: the fix writes one counter.
- **Instrument:** 0 instrument errors on all per-seed files.
- **Balanced panel** (`build-partytrios-b-panels.js` +
  `balance-panel.js compare`): the panel is the instrument, not the
  judge. Expectation is `no_material_signal` on every observed
  metric (counter-only change); a `review_required` decision from
  the 8-seed screen size is investigated row by row, never waved.

## What this pilot does NOT judge

- The trio-launch rate (triodrought's verdict stands: 0.00 → 0.88).
  If the arm leg's trio rate differs from triodrought's 0.88, that is
  a drift/reproduction signal, reported not judged — the primary is
  the counter, and the triodrought numbers are the ground truth this
  band reproduces.
- Wins / national / table (counter-only; no movement expected).
- `partyQuads` — absent on master (see Correction); still 0/never
  bumped. Not the metric.
- The d135-class genuine pick miss — out of scope, unchanged.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (§10: reachability lever, waves 4–5 /
  national / table). Dead villages stop simulating (+10d tail max).
- **Seeds: 104011, 104012, 104013, 104014, 104015, 104016, 104017,
  104018 — DELIBERATE MATCHED REUSE of the triodrought band, not a
  fresh band.** Freshness check (skill local_seed_band_freshness):
  `grep -rln "104011|...|104018" evidence/ --include="*.md"` names
  exactly four files, all this band's own record:
  `evidence/2026-11-18/sim-triodrought-b-prereg.md` (the band's own
  prereg), `evidence/2026-11-18/sim-triodrought-b.md`,
  `evidence/2026-11-18/sim-winplandepart-b-prereg.md` (frozen
  corpora reference), `evidence/2026-11-18/sim-winnability-round-0130.md`.
  No forbidden list, contaminated list, screen, or other prereg names
  any 104011–104018 seed (grep over the preregs naming
  forbidden/contaminated lists: 0 hits for this band). The reuse is
  explicit and recorded here: this pilot judges a counter against
  OBSERVED trios on the same legs, so it needs the band whose
  ground truth is already established (22 arm trios, 0 ctl trios) —
  a fresh band could launch few/no trios and leave the primary
  unjudgeable. Contamination is bounded by design: the fix writes
  one counter and no RNG or game state, so trajectories must
  reproduce exactly; the analyzer's drift rule (no-fire seeds
  trajectory-identical) and the balanced panel both check that.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1`, `FIGHTALLY2`
  unset. **Ctl = base master (no bump); arm = base + the
  brain-mirror bump.** No env difference between legs — the fix is
  code, the substrate is identical. NOTE on the task brief: it names
  the substrate as `VETREENGAGE=1 + PARTYSIZE4=1`; this prereg adds
  `FLEEREPAIR2=1` because the band's ground truth (22 trios) was
  measured under exactly that substrate, and reproducing it requires
  holding it constant. The deviation is recorded here, before the
  sweep.
- **Instrument:** `scripts/partytrios-driver-b.js` (the triodrought
  driver, adapted: same launch-funnel census — `v4departs` /
  `v4gates` / `v4encounters` with origin, `dawnbidScores` with
  candidate `companion2`, `dawnbidDeparts`, `companionPool` — plus a
  `bumpPresent` corpus flag and a MODE↔code guard on the bump
  instead of the carry; the carry is present on both legs and is
  substrate here). Analyzer: `scripts/analyze-partytrios-b.js`
  (reuses `analyze-triodrought-b.js` legStats for the launch census;
  own judge + per-seed counter table + wall numbers). Panel builder:
  `scripts/build-partytrios-b-panels.js`. Proof:
  `scripts/test-partytrios-b.js` (21 checks, green on the fix,
  7 fail on pre-fix code — negative control run).
