# Survival-collapse bisect POLICY-SWAP — pre-registration (arm sim-bisect-policyswap-a)

Run fleshout-20261111T2317Z, Loop B, axis scale-onramp / winnability
chain (tracker 2030Z next blank 1 — the survival-collapse bisect,
ROUND 2). Written and committed BEFORE any judged sim. Base:
`3f136f07e` (journey-landing r126; read fresh from the worktree at
run start with `git log --oneline -1`). Game code is the
`3f136f07e` code; the ONLY thing swapped is the policy file (see
below).

**Instrument-only arm — ZERO src/js changes, ZERO committed policy
changes.** This arm runs the `5157782a4` competent policy against
the `3f136f07e` game code to control for the one harness/policy
diff in the collapse window. It changes no game code and builds
nothing.

## The question

Round 1 + round 2 anchors established, on the same 8 seeds
(190391–190398), competent, 150d:

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg | `5157782a4` | **6/8** | **150d** |
| bisect-anchor2-a (true anchor, reproduces) | `5157782a4` | **6/8** | **150d** |
| bisect-anchor-a | `3f136f07e` | **1/8** | **126d** |
| survivalcontrol | `d33ca69f9` | **1/8** | **126d** |
| this policy-swap (old policy, new code) | `3f136f07e` + old competent.js | **?** | **?** |

The collapse sits in `5157782a4..3f136f07e` (anchor-a §8,
anchor2-a §8). Across that range the only harness/policy diff is
`scripts/policies/competent.js` — ONE hunk in `workGarden` (the
garden-keeper appointment moved before `makePlot`, OVE-160,
Cursor PR #120). A garden-appointment reorder flipping 6/8 → 1/8
by itself is implausible, but deterministic chaos means any
RNG-order change rerolls downstream trajectories, so it cannot
be dismissed by inspection alone. This arm controls for it: run
`3f136f07e` game code with the `5157782a4` competent.js.

## Premise verification (done fresh at run start, before this prereg)

- `git diff 5157782a4 3f136f07e -- scripts/policies/competent.js`
  is exactly the one `workGarden` hunk (appointment block moved
  above the `makePlot` loop; `+` comment lines explain the
  reorder; no other change in the file).
- `git diff 5157782a4 3f136f07e -- scripts/sim-harness.js
  scripts/vetfirst-instrument-20261111.js src/js/standing.js` is
  EMPTY — no harness, instrument, or standing change in the
  window.
- `src/js/standing.js` on this base carries the roster-check fix
  (`ROSTER CHECK` marker at line 233), sha256
  `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`
  — the same sha the vetphantom fix leg recorded.
- `scripts/vetfirst-instrument-20261111.js` on this base is
  byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`
  — the same sha anchor2-a recorded.

## The policy swap (read carefully — the swap pattern)

The two competent.js versions, verified by sha256 at run start:

- OLD (`5157782a4`): `0801abd82e527dbe6f97ab56c8f0ddb55744998a04a22f332b4bb9b943ecca05`
- NEW (`3f136f07e`, on-disk at run start): `3c40151e8dd4df69dde916a9df5d950da442b38b221752b148cded771887fb6d`

Following the merge-a fix-swap pattern
(evidence/2026-11-11/sim-bisect-merge-a-prereg.md): the OLD
competent.js is extracted with `git show
5157782a4:scripts/policies/competent.js`, its sha256 verified to
be exactly the OLD sha above, swapped in UNCOMMITTED, run, then
the `3f136f07e` version restored byte-identical afterwards and
verified by sha256 (`3c40151e8dd4…`) plus `git status` showing no
`scripts/policies` modification. **The swapped file itself is
never committed.** The driver
(`scripts/bisect-policyswap-driver-20261111.js`) REFUSES to run
unless the on-disk competent.js sha256 is exactly the OLD sha —
an unswapped run is refused loudly, never mislabeled. The
in-use policy sha is recorded per seed in the corpus
(`policySha`, `policyVersion: '5157782a4-competent'`).

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call
#4 (veteran bar: `Game.waveCombatReadiness(w)` reads four named
bars from LIVE village state — never a policy lever, never a fake
number) and Steve's 2026-11-10 scholar-counts ruling. No canon
doc covers survival-collapse attribution; nothing here invents
canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on
`3f136f07e` game code with the OLD (`5157782a4`) competent
policy**, vs the vetphantom fix leg's 6/8 (median 150d) and the
anchor-a 1/8 on the same code with the NEW policy.

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **POLICY_HUNK_IMPLICATED** — the garden reorder explains or contributes to the collapse; the policy hunk is a live bisect step, not a dismissed confound |
| **≤2/8 survive** | **POLICY_EXONERATED** — the collapse is game-code-only; the policy hunk does not explain it and the bisect proceeds into game code |
| **3–4/8 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; a bigger band or a re-trace is owed before bisecting further |

The analyzer (`scripts/bisect-policyswap-analyze-20261111.js`)
judges this rule and exits 0 only when it can classify the
outcome under it (any of the three verdicts is a classified
outcome; exit 1 only on instrument failure, corpus
incompleteness, or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) and 126d (anchor-a); death-cause shares vs the
combat-heavy profile (anchor-a: 585/615 combat/expedition/wild,
starvation 0); wave 4–5 unlocks; national/table/wins; standing
range; tribute-ready days; phantom days (0 expected — the
roster-check fix is on this base); blooded count from the summary
JSON. **Trajectory identity (§2 of the evidence):** the per-seed
daily-snapshot hashes are compared against BOTH the vetphantom
fix corpus (`perseed-vetphantom-b/`) and the anchor-a corpus
(`perseed-bisect-anchor-a/`) — a swap run that reproduces one of
them exactly says which side of the window the policy hunk sits
on.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band
  as vetphantom, survivalcontrol, anchor-a, anchor2-a, and
  merge-a.** A control/bisect leg re-runs the same seeds on old
  code (here: old policy); that is the point of a bisect, not a
  freshness violation. The seed-band freshness rule exists to
  stop re-using a band as if it were a fresh measurement; this
  arm explicitly re-uses it as a matched control and says so
  here, in the prereg, before any sim. Same justification as the
  survivalcontrol and anchor preregs.
- **Policy: competent as of `5157782a4`, verbatim except the
  swap itself — SINGLE leg, mode `fix` only.** The vetphantom
  fix is already on this base (roster-check marker present in
  `src/js/standing.js`, verified at run start), so there is no
  pre-fix control variant to rebuild — the driver refuses to run
  unless the fix marker is present AND the policy sha is exactly
  the OLD sha (swap-aware leg guard, same shape as
  merge-a's standing.js guard).
- **Seeds run ONE SEED PER NODE PROCESS** (never two harnesses
  in one process; repo AGENTS.md sim harness rules — Math.random
  seeded BEFORE eval, modules capture it at load; eval the FULL
  src/js/*.js list in index.html order minus DOM-only
  app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js; never
  stub Game.save). The driver takes `SEEDS=<single seed>` per
  invocation and refuses to overwrite an existing per-seed file.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js`
  reused unmodified (already present at this base; vetfirst-b
  proved it neutral 8/8 exact) + the driver's live shadow
  old-rule count per snapshot, exactly as vetphantom-driver,
  survivalcontrol-driver, and bisect-anchor2-driver. Driver:
  `scripts/bisect-policyswap-driver-20261111.js` — a copy of
  bisect-anchor2-driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-bisect-policyswap-a/`, RUN =
  `bisect-policyswap-pilot`, arm = `bisect-policyswap`, mode fixed
  to `fix` only, plus the swap-aware policy leg guard (exported
  `legGuard`, exact-sha). Analyzer:
  `scripts/bisect-policyswap-analyze-20261111.js`. Proof:
  `scripts/test-bisect-policyswap-a.js`.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-policyswap-a/`
  — 8 per-seed JSONs; summary
  `evidence/2026-11-11/bisect-policyswap-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair
to compare on this base. The before/after comparison IS the
vetphantom fix leg (old policy + old code) vs anchor-a (new
policy + new code) on identical seeds — this arm re-measures the
cross term (old policy + new code) to split the two. Same
standing as survivalcontrol-b §7 and anchor-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap is the ONE permitted uncommitted file during the run.
  After the run, the `3f136f07e` competent.js is restored
  byte-identical (sha256 `3c40151e8dd4…`) and `git status` must
  show no `scripts/policies` modification before the evidence
  commit. If the restore fails, FAIL LOUDLY and do not commit
  evidence.
- This arm does NOT re-judge the survivalcontrol verdict
  (MASTER_CHANGE stands), the anchor verdicts
  (ANCHOR_NOT_REPRODUCED / ANCHOR_REPRODUCES stand), the
  mournblooded verdict (exonerated stands), or the merge-a
  verdict — it controls for the policy hunk only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop B body step 10): attempted;
  the tool refuses recorder-corpus input (same refusal class as
  vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, and
  anchor2-a). Recorded, not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
