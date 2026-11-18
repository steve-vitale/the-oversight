# sim-partyquads-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-partyquads-b · **Loop B run:** fleshout-loop-b-20261118T1430Z
**Type:** BUILD — re-land the `partyQuads` counter bump from the HELD
sim-partysize-recorder-b branch (commit `035034c9f`), then pilot it.
**Frozen:** 2026-11-18 ~15:48 UTC (before the fix is written and before
the pilot sweep; the proof test runs after the fix — it proves the
mechanism, it is not a judged sim).
**Branch tip:** `sim-partyquads-b` (fix + proof test + driver +
analyzer committed below this prereg).
**Base:** master `f97a529b1` (Loop A 1415Z run landed: fightcap
DIAG-GO + wildavoid-confirm NO-GO).
**Builds on:** `evidence/2026-11-18/sim-partytrios-b.md` (finding
#2532: the `partyTrios` brain-mirror bump, GO 19/19) and its frozen
corpora (band 104011–104018); the HELD sim-partysize-recorder-b
branch, commit `035034c9f` (the `partyQuads` one-liner this arm
re-lands); `evidence/2026-11-18/sim-winnability-round-1330.md` and
the convergence tracker (findings #2497/#2532 thread).

## Correction to the task brief (recorded BEFORE the fix — verified in code)

The brief says to extract ONLY the `partyQuads` bump from commit
`035034c9f` and mirror the partytrios fix pattern, with a GO bar of
arm `partyQuads` == analyzer-observed quad count on ≥7/8 seeds.
Verified on this base, the premise behind that bar is wrong in one
load-bearing respect: **the bump's firing site does not exist on
master.** The `035034c9f` one-liner lived inside an
`if (launched.length > 2)` block in `vbrainExecuteDepart`, and that
block only existed because the HELD branch also carried the
PARTYSIZE4 third-companion launch (start a `c.companion3`
expedition, push it onto `launched`). On master `f97a529b1`:

1. `PARTYSIZE4` occurs NOWHERE in `src/js` (grep, whole tree).
   The PARTYSIZE4 lever itself (commit `6f15dbc2b`, "4th companion
   seat on wave-4+ hunt plans") is NOT on master — the partysize-b
   pilot went NO-GO on instrument and the lever was HELD (coordinator
   evidence `adad111ca`, round 1729).
2. No candidate on this tip ever sets `companion3`
   (`villager-brain.js` writeCommit comment, verbatim: "companion3
   is set by no candidate on this tip"). The `writeCommit`
   companion3 carry (restored by triodrought-b, finding #2518) is
   inert.
3. There is no `winPlanThirdCompanion` anywhere in `src/js`; only
   `winPlanSecondCompanion` exists. Both launch paths cap at a trio:
   `vbrainExecuteDepart` pushes at most companion + companion2 onto
   `launched`; `winPlanDepart`'s launchParty pushes at most cid +
   cid2. `plan.party` has no other writer that can lengthen it
   (the only assignments are `launched.slice()` on both paths plus
   the companion-plan mirrors, max 2–3 elements, and
   `partySize = plan.party.length + 1` in the recorder).
4. Consequence: **maximum observable launch size on master is 3.**
   The partytrios band (104011–104018) observed launch sizes
   1×2, 2×3, 3×19 — zero size-4. A quad cannot launch on this tip
   through any path the recorder watches.

So the faithful extraction is a bump inside a `launched.length > 2`
guard that can only fire once a third companion launches — i.e.
once the PARTYSIZE4 lever lands. Landing the bump inside the trio
block (`launched.length > 1`, the partytrios placement) would be
WRONG: it would count every trio as a quad. This prereg therefore
re-scopes the primary: the pilot must first establish the ground
truth (observed quads on a fresh band), and the GO bar carries a
pool floor of ≥1 observed arm quad — without it, a 0==0 match is
vacuous and cannot be a GO. The predicted outcome, stated before
the sweep, is that the pool floor fails and the verdict is HELD:
counter placed correctly and verified not to misfire, but live
counting unproven until quads can launch. If the pilot surprises
us and quads DO launch somewhere, the bar judges them.

## HP recorder repair — status (checked, not re-derived)

The brief asked to check whether the HP recorder repair from
`035034c9f` already lives on master separately. **It does, ported
into the successor drivers.** `recoverMHpStart` (post-call
`mHpLeft + mDealt`, vKill share 1.0, evades null) plus the
post-call recovery call site live on master in
`scripts/partytrios-driver-b.js` (with the "RECORDER REPAIR
(finding #2488)" comment), `scripts/expedroster-driver-b.js`,
`scripts/fightallycap-driver-20261117.js`, and
`scripts/fightgate-scope-driver-b.js`. The original file
`scripts/partysize-driver-20261117.js` itself never landed
(it exists only on the HELD `sim-partysize-b` branch, which also
holds the re-committed repair at `0eec02ef0` — neither that commit
nor `035034c9f` is on master). The repair is therefore NOT
bundled here; this arm reuses the partytrios driver, which already
carries it. Reported as a finding in the evidence file.

## Diagnosis (from the code — decided BEFORE the fix)

1. **The counter is absent, not noisy.** `partyQuads` occurs
   nowhere in `src/js` on master: no default in `win-plan.js`
   `stateOf` (contrast `partyTrios: 0`, line 101, plus its
   null-guard at line 104), no bump in either launch path. The
   analyzer (`analyze-partytrios-b.js:45`) already reads
   `partyQuads` from `winPlanStats` and reports 0 — the field is
   observed, never written.
2. **The canonical accessor reaches the brain module.**
   `win-plan.js:331` exposes `winPlanStats()` as a Game method;
   `stateOf` initializes the defaults, so a bump through it is
   safe on a fresh village. The module-internal `bump()` is
   unreachable from the brain module — exactly the shape the
   `partyQuads` one-liner already solved in the HELD commit, and
   the shape the partytrios bump copied.
3. **The depart path has no quad bump either.** `winPlanDepart`
   bumps `partyTrios` at `win-plan.js:666` inside its own
   `launched.length > 1` block, but has no `partyQuads` bump and
   no third-companion launch. Out of scope here (the brief says
   extract ONLY the bump from `035034c9f`, which touched only
   `villager-brain.js`); recorded as a finding for the PARTYSIZE4
   lever arm, which must add both launch paths' quad bumps when
   it lands the third companion.

## Fix shape (decided FROM the code)

**Two pieces, both counter-only:**

1. `src/js/win-plan.js` `stateOf`: add `partyQuads: 0` to the
   defaults object (beside `partyTrios: 0`) plus the null-guard
   line `if (v.winPlanStats.partyQuads == null)
   v.winPlanStats.partyQuads = 0;` — the exact partyTrios pattern.
2. `src/js/villager-brain.js` `vbrainExecuteDepart`: a NEW
   `if (launched.length > 2)` block immediately after the trio
   block, carrying the `035034c9f` one-liner verbatim in shape
   (renamed marker), through the canonical accessor:

```js
// PARTYQUADS (sim-partyquads-b): the brain path is the launch
// path that fires in sims, but it never bumped partyQuads —
// only winPlanDepart did (for trios) — so the stat read 0 while
// quads launched on the HELD branch. A quad launched here counts
// the same as one launched there (winPlanStats() initializes the
// defaults, so this is safe on a fresh village). NOTE: the guard
// can only fire once a third companion launches — no candidate
// sets companion3 on this tip (PARTYSIZE4 lever HELD), so the
// counter stays 0 by construction until that lever lands; the
// proof test bounds the placement (a trio must not bump it).
try { var _pq = (typeof this.winPlanStats === 'function') ? this.winPlanStats() : null; if (_pq) _pq.partyQuads = (_pq.partyQuads || 0) + 1; } catch (e) {}
```

NOT touched: the depart-path `partyTrios` bump; any candidate,
pick, gate, env flag, or narration; the HP recorder repair; the
B2 analyzer. The bump writes one counter and nothing else — no
RNG, no game-state write — so trajectories must reproduce exactly
across legs (the analyzer's drift check + the balanced panel both
verify this).

## Primary metric (BINDING, §14)

**Counter coverage** = on the armed leg, `winPlanStats.partyQuads`
(summed over the 8 per-seed files) divided by the analyzer-observed
quad launches (`v4departs`, `result === 'launch'`,
`targetWave >= 4`, `partySize >= 4`); and the control leg's
`partyQuads` must be 0. Per-seed exactness is the stronger check:
arm `partyQuads` == observed quads on every seed, not just in
aggregate.

**GO threshold:** armed `partyQuads` ≥ 80% of observed arm quads
**AND** control `partyQuads` == 0 **AND** per-seed exact on ≥7/8
seeds.
**Pool floor (binding):** ≥ 6 wave-4+ launches per leg **AND** ≥ 1
observed arm quad. Below the floor the pilot is under-powered and
the verdict is NO-GO (METRIC-BROKEN / NO-QUAD-POOL), never a pass
on a vacuous 0==0. The 80% bar is the partytrios bar, kept for
comparability; the pool floor is what makes it non-vacuous here.

**Predicted outcome (stated before the sweep):** the pool floor
fails — observed quads 0 on both legs — because no quad launch
path exists on this tip (see Correction). The expected verdict is
therefore HELD: the bump is placed correctly and verified not to
misfire (arm counter 0 despite trio launches), but live counting
is unproven until the PARTYSIZE4 lever lands. A GO is possible
only if the pilot observes ≥1 quad, which would overturn the
static analysis above.

## Secondary metrics (supporting, not binding)

- **No-misfire (binding guardrail for this arm):** arm
  `partyQuads` == 0 on every seed AND arm `partyTrios` ==
  control `partyTrios` (the bump must not steal or duplicate trio
  counts). A nonzero arm `partyQuads` with zero observed quads is
  a misfire — NO-GO outright.
- **Trajectory identity:** per-seed files differ ONLY in
  `leg`/`mode` labels + the counter + brainSha/bumpPresent; every
  other field byte-identical across legs (recursive diff, as in
  partytrios-b).
- **Cost bar (GUARDRAIL, binding — sim-scalemetric):** starvation
  ≤ ctl+2 on totals AND arm-only deaths; median survival ≥ 0.8×
  ctl median. A GO met with this breached is NO-GO (§14). Expect
  0 movement: the fix writes one counter.
- **Instrument:** 0 instrument errors on all per-seed files.
- **Balanced panel** (`build-partyquads-b-panels.js` +
  `balance-panel.js compare`): the panel is the instrument, not
  the judge. Expectation is `no_material_signal` on every observed
  metric (counter-only change); a `review_required` decision from
  the 8-seed screen size is investigated row by row, never waved.

## What this pilot does NOT judge

- The quad-launch rate (there is no quad launch path to judge).
  If the arm leg's launch sizes differ from partytrios's (max 3),
  that is a drift/reproduction signal, reported not judged.
- Wins / national / table (counter-only; no movement expected).
- The PARTYSIZE4 lever itself (HELD since partysize-b pilot
  NO-GO) — this arm does not re-litigate it.
- The depart-path quad bump (missing too — see Diagnosis §3);
  a follow-up for the PARTYSIZE4 lever arm.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (§10: reachability lever, waves
  4–5 / national / table). Dead villages stop simulating (+10d
  tail max).
- **Seeds: 105001, 105002, 105003, 105004, 105005, 105006,
  105007, 105008 — FRESH 8-seed pilot band.** Freshness check
  (skill local_seed_band_freshness): `grep -rhoE "105[0-9]{3}"
  evidence/*/sim-*-prereg.md` over ALL dates' preregs returns
  zero 105xxx seeds (the full 104xxx list found is 104001–104008,
  104011–104018, 104021–104028, 104031, 104038, 104101, 104112,
  104201–104208, 104301–104302, 104308, 104401, 104404,
  104407–104408, 104411, 104416–104418, 104421, 104424, 104428,
  104431, 104446, 104501–104508, 104611, 104898); `grep -rln
  "105001|...|105008" evidence/ --include="*.md"` returns zero
  files; `find evidence/ -name "*10500*"` returns zero files.
  No forbidden/contaminated band list names this band (no
  105xxx seed is named anywhere in evidence/). A fresh band is
  used (not the partytrios band) because this pilot's question is
  whether quads launch AT ALL on current master — reusing the
  partytrios band would only re-confirm its known max size 3.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1`, `FIGHTALLY2`
  unset (same substrate as partytrios, so numbers are comparable;
  `PARTYSIZE4=1` is inert on master — no code reads it — and is
  held constant for comparability). **Ctl = base master (no bump);
  arm = base + the quad bump.** No env difference between legs —
  the fix is code, the substrate is identical.
- **Instrument:** `scripts/partyquads-driver-b.js` (the partytrios
  driver, adapted: same launch-funnel census — `v4departs` /
  `v4gates` / `v4encounters` with origin, `dawnbidScores`,
  `dawnbidDeparts`, `companionPool`, `recoverMHpStart` recorder —
  plus a `bumpPresent` corpus flag and a MODE↔code guard on the
  quad bump instead of the trio bump). Analyzer:
  `scripts/analyze-partyquads-b.js` (reuses
  `analyze-triodrought-b.js` legStats for the launch census; own
  judge + per-seed counter table + wall numbers). Panel builder:
  `scripts/build-partyquads-b-panels.js`. Proof:
  `scripts/test-partyquads-b.js` (brain-quad units + driver leg +
  analyzer selftest; green on the fix, fails on pre-fix code —
  negative control run).
