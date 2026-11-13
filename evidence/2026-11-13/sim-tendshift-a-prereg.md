# Tendexact × stream-shift interaction — pre-registration (arm sim-tendshift-a)

Run fleshout-20261113T0715Z, Loop A, axis scale-onramp.
Written and committed BEFORE any judged sim. Base: current master
tip `f7352f946`. Instrument-only arm — ZERO `src/js` changes
committed. The interaction leg is current master + a reseed burn
(no code change); the baseline leg is current master, no burn.

## The question

The healthy pole (pre-reconcile master `5157782a4`, vetphantom fix
leg: 6/8 survived on the matched band 190391–190398) carries BOTH
the tendexact pantry fix AND a stream shifted by ~200 commits of
dialogue-variety work. The 0515Z run tested the two halves
separately and neither re-derived the pole: tendexact alone gives
5/8 on the matched band (rederive arm, by count), the 997-draw
reseed alone gives 3/8 and saves neither gap seed (gap-candidates
arm, GAP-NOT-DICE). The remaining +1 gap is seeds 190392 and
190394. This arm tests them TOGETHER: tendexact (in master) × the
same 997-draw stream shift (the L3 reseed burn).

## §0 — Tendexact marker verification (done by this worker, before any sim)

- `git merge-base --is-ancestor e6911eb80 HEAD` → YES (coordinator's
  07:35Z verification re-confirmed in this worktree). Tendexact is
  an ancestor of current master `f7352f946`. NO cherry-pick.
- Marker present in this worktree's `src/js/hierarchy.js`:
  `// EXACT SPLIT (tendexact-a 2026-11-10, finding #2072)` at line
  991, and the split implementation in `_removePantryKcal` at line
  1011 (whole units first, then split the final unit — remainder
  piece stays behind). Candidate-guard check, same class as the
  tendexact-confirm proof's.
- If the marker were absent (reverted), this arm would STOP and
  report loudly instead of running sims. It is present; the arm
  proceeds.

## Burn offset — why 997 (recorded with reasoning, before any sim)

Neither the 0455Z draft nor the gap-candidates evidence names any
burn offset for the pole's stream shift: the pole's stream differs
from the far end's by the CUMULATIVE effect of ~200 commits, and no
single offset is identifiable from the corpora. The default is the
997-draw burn L3 used, for one reason: 997 is the one offset already
proven to move fates on this exact band (L3: 4 of 8 fates moved
substantially — 190394 d43→d130 with the Eater never appearing,
190392 d144→d72, 190393 survived→lost d122, 190395/190398 newly
reaching wave 5). Reusing it isolates the INTERACTION (tendexact ×
the same shift) instead of confounding the test with a new,
unmeasured offset. A sweep of more offsets is the next run's work
if this leg NO-GOs; it is not this leg's.

## Legs (two, sequential, same seeds, same base)

| Leg | Configuration (current master `f7352f946`, mode `master`) | Why |
|---|---|---|
| **`baseline`** | Current master as-is, NO burn | The baseline is MEASURED fresh, not assumed — master has moved since `203a32775`, so the far-end 4/8 does not carry over. |
| **`interaction`** | Current master + 997-draw burn after `setupGame` (no code change) | Tendexact (in master) × the L3 stream shift, together — the pole's two halves. |

Burn design (same as L3, verified in code before any sim — see the
proof test §5, which re-verifies the alias list on THIS base):
after `setupGame` (world generation: `genRoster` + `newGame` +
`depart` all happen inside `setupGame`, verified in
`scripts/sim-harness.js`), call `Math.random()` exactly 997 times
(a fixed prime, chosen before any sim), then run the 150 days.
Same code, same seeds, same world, different play-phase dice. A
burn — not a re-assignment — because five modules capture the
mulberry32 function object into a module-scope alias at load
(`betrayal.js`, `comms.js`, `corruption.js`, `fieldFights.js`,
`finale-campaign.js`); a re-assignment would leave those aliases
pointing at the OLD stream, including the fight engine. The only
in-game `Math.random =` is the `_worldRng` save/restore pair
(`game.js`, restores in `finally`) — a scoped temporary swap, not
a per-day reseed; verified by grep that nothing re-seeds per day.
The policy RNG (`__policyRandom`, derived from the manifest seed
inside `runDays`) is untouched by the burn, so policy decisions
are unchanged; only the game's dice shift. `reseedBurn: 997` is
recorded per seed on the interaction leg, `null` on the baseline.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: which of the gap seeds {190392, 190394} survive
on the interaction leg that the current-master baseline LOSES,
and whether any current-master baseline survivor is lost.**

| Condition (all conjunctive) | Verdict |
|---|---|
| interaction saves ≥1 of {190392, 190394} that the baseline LOSES, **AND** every baseline survivor also survives on the interaction leg (no regression), **AND** median ≥ 0.8× baseline median, **AND** starvation ≤ baseline+2 | **GO** — the interaction saves a gap seed with no regression |
| Any condition fails | **NO-GO** — the interaction does not carry the gap |

**Prereg addendum (framing, fixed before any sim):** if the
current-master baseline already saves a gap seed, the interaction
leg must HOLD that save — the gap seed is then a baseline
survivor, and losing it is a regression under the no-regression
condition, not neutral. The "saves ≥1 gap seed the baseline
loses" condition is then read against the remaining gap seed(s)
only. The addendum is recorded here so the re-frame cannot be
invented after the baseline is known.

**Rank read (reported, not judged):** survived count on the band
vs the healthy pole's 6/8 and the far-end firstparent's 4/8;
regional reach vs the pole's 8/8.

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs the combat-heavy profile; wave-4 and wave-5
unlocks; national / table / wins; standing range; tribute-ready
(ladder read); blooded count; peak living wave-4+ veterans per
seed vs the bar of 2; end-pantry kcal per seed (the tendexact
mechanism's visible footprint); phantom days — defined CORRECTLY
(carried correction): "live count exceeds shadow" is a real
phantom; "shadow exceeds live during a collapse" is EXPECTED and
is reported, not judged. **ARC IV firing per seed is a REPORTED
field only** — it is not judged and no threshold is set on it
(the instrument does not capture ARC IV; same standing as r9/r10).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band
  as vetphantom, the firstparent, r5–r10 cuts, and the 0515Z arms.**
  A control/bisect re-derivation re-runs the same seeds on old
  code plus a transplant; that is the point, not a freshness
  violation. Grep scope `evidence/*/sim-*-prereg.md` on master
  names seed 190391 in 23+ prior preregs (same justification as
  every one of those preregs). Per the local_seed_band_freshness
  skill this reuse is recorded explicitly: the band is NOT fresh,
  it is reused DELIBERATELY for comparability with the 0515Z arm-2
  legs (same seeds, same horizon, same policy), and no fresh band
  is picked for this arm.
- **Policy: competent verbatim, SINGLE leg per configuration on
  current master, mode `master` only** (no fix-swap — see below).
  The driver enforces the leg guards (standing guard + own-policy
  guard + tendexact candidate guard + no-code-change guard, all
  exact-match) and refuses to run otherwise.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` as
  committed on master (sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`,
  byte-identical to the gap-candidates scratch) + the driver's
  live shadow old-rule count per snapshot, exactly as
  vetphantom-driver and the bisect drivers. Driver:
  `scripts/tendshift-driver-20261113.js` — a clone of the
  gap-candidates driver with the corpus dir parameterized by leg
  (`evidence/2026-11-13/perseed-tendshift-a-<leg>/`),
  RUN = `tendshift-pilot`, arm = `tendshift`, mode fixed to
  `master` only, plus the guards below (all exported for the
  proof). **`\belder\b` filter:** the driver carries the
  tightened veteran-say regex `\\belder\\b` (vetsays fix, landed
  `9a32925b3`), same as r9/r10 and the gap-candidates driver.
- **Corpora:** `evidence/2026-11-13/perseed-tendshift-a-<leg>/`
  — 8 per-seed JSONs per leg; one summary JSON per leg
  (`evidence/2026-11-13/tendshift-a-<leg>-summary.json`).
- **Deep-identity comparison (pre-registered method):** the
  per-day signature is the 4-field tuple (vetsW3, vetsW4,
  waveKillLog length, roster length) — NOT deaths-so-far.
  Compare the interaction corpus against the baseline corpus on
  the same seeds (full daily-snapshot deep-diff, committed
  script `scripts/tendshift-deepdiff-20261113.js`), **pairing
  snapshots INDEX-ALIGNED, never day-keyed** (the duplicate
  loss-day stamps make day-keyed pairing pair the wrong
  snapshots — see the gap-candidates prereg §0). Veteran killers
  in the instrument are keyed `by`, not `vid` — a phantom check
  reading `k.vid` silently checks nothing.

## No fix-swap on this base (read carefully — this base POSTDATES the roster-check fix)

Current master `f7352f946` already carries the r131 roster-check
fix in `src/js/standing.js` (marker `ROSTER CHECK` present at
line 278; sha256
`f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9`,
hashed by this arm from the worktree). No swap is performed and
none is needed. The driver's standing guard accepts marker
present AND sha exactly this master sha — an unswapped run on a
different base is refused loudly, never mislabeled. The
`standingSha` in use is recorded per seed in the corpus. **No
`src/js` file is modified at any point in this arm** — both legs
are instrument-only, and the no-code-change guard (`git diff
--name-only -- src/js` must list NOTHING) enforces it on both
legs, unlike the gap-candidates reseed leg where the controlled
swap listed exactly `src/js/standing.js`.

Two substrate notes, both verified before any sim (not assumed):

- **Own policy:** `scripts/policies/competent.js` on current
  master (sha256
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`,
  hashed by this arm from the worktree). The driver runs
  master's OWN policy and refuses any other sha. The far-end
  policy sha `a7ff5c516440…` and the vetphantom policy sha
  `0801abd82e52…` are both refused.
- **Harness:** `scripts/sim-harness.js` is byte-identical to the
  poles (sha256
  `d0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a`,
  same as the gap-candidates prereg) — the comparison differs
  only in the burn, by construction. `loadGame` mode is a
  manifest label only (verified in `scripts/sim-harness.js`:
  mode is recorded, never branched on); the driver passes
  `'competent-vetphantom'` as the harness label (same as the
  prior arms, keeping corpora comparable) and records corpus
  mode `'master'`.

## Balanced panel (§15) — N/A

Instrument-only legs, no code change, no before/after pair to
compare on one base. The before/after comparison IS the baseline
leg vs the interaction leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a §7, origin-a §7, mergebase-a §7, r5-cut1-a
§7, r5-cut2-a §7, r6-cut-a §7, r7-cut-a §7, r8-cut-a §7, r9-cut-a
§7, r10-cut-a §7, the rederive arm's §7, and the gap-candidates
arm's §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the leg is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The burn is the ONLY permitted uncommitted change during the
  interaction leg (there is no swap and no cherry-pick on this
  base; the burn is a runtime draw-count shift, not a file
  change). `git status` must show no `src/js` modification before
  any evidence commit. If a restore/verification fails, FAIL
  LOUDLY and do not commit evidence.
- This arm does NOT re-judge any prior verdict (vetphantom GO,
  firstparent INCONCLUSIVE, r9-cut INCONCLUSIVE, r10-cut
  INCONCLUSIVE, tendexact HEALTHY_POLE_REDERIVED-by-count on the
  matched band, tendexact NO-GO on fresh seeds, gap-candidates
  GAP-NOT-DICE) — it tests the tendexact × stream-shift
  interaction only.
- Do NOT cut at commits 390–393 (the r10 remainder): a cut there
  can only localize the 190393/190397 remainder, it cannot
  return CUT_HEALTHY — that is a separate question, not this
  arm's. Do not touch the stall window (commits 58–65) — the
  stallcut61 arm owns it.
- The sibling Loop B arms run in their own worktrees; this arm
  does not touch them, and their verdicts do not change this
  leg's decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted;
  prior bisect arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT
  rolled.
- Ancestry note: `e6911eb80` (tendexact) is an ANCESTOR of
  `f7352f946` (verified by this arm before any sim) — do not
  cherry-pick it again. `203a32775` is an ancestor of
  `5157782a4` (their merge-base is `203a32775` itself), not the
  reverse — do not assume a linear order between the healthy
  base and the local merge-tip.
- Flap note: a host write flap (EPERM on git ref writes and
  some file writes) was ACTIVE at 04:44–05:23Z and
  intermittently after; the flap-watch log read ALL-OK
  07:40–07:44Z at this arm's start. The prereg + tooling are
  written and committed only after a probe succeeds; the tree
  is heartbeated after. If the flap returns mid-run, wait for it
  to clear rather than bypassing safe-commit; never route around
  a denial.
- Merge note: this worktree runs on branch `sim-tendshift-a` at
  current master `f7352f946` — the driver and proof only make
  sense on that base (standing sha, own-policy sha, tendexact
  marker). The tooling + evidence commits live on that branch;
  the coordinator adopts them by merge --ff-only from the
  branch. Do NOT rebase onto a different base (it would break
  the experiment substrate).

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the legs: did the metric set hold, or does a
  metric need revision for the NEXT run?)
- Correction carried from the tendexact-confirm evidence: the GO
  bar's absolute ≥5/8 condition is the binding one on a harsh band
  — a candidate that saves 2 seeds over a 1/8 baseline still fails
  it. This run's bar deliberately carries NO absolute ≥5/8
  condition: the question is the interaction on the matched band
  against a measured baseline, and the bar is the gap-seed save +
  no-regression + median + starvation, exactly as briefed. The
  absolute count is reported as the rank read, not judged.
- Phantom days: "live count exceeds shadow" is a real phantom;
  "shadow exceeds live during a collapse" is expected — report-only
  with that note, as in the gap-candidates prereg.
