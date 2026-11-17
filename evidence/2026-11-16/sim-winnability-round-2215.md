# sim-winnability-round-2215 — coordinator evidence (Loop A adoption)

Run `fleshout-20261116T2215Z` (Loop A), axis winnability chain.
Adoption of the timed-out 2015Z round's three arms, all on the shared fresh
band 102601–102608, competent verbatim, 150d, 8-seed pilot. The 2015Z
coordinator died before closeout; this adoption ran in the main session.

## Arms

### sim-planignite-a — DIAG (already landed by the main session from 2015Z)

**LANDED `cc0daf6c9`.** Do NOT double-land: this round re-dispatched
planignite, but the arm was already adopted and landed from the 2015Z
round by the main session (proof re-run 80/80 after a policy-sha re-pin,
ff-merge, tree released, tracker + findings updated). Same arm, same
band, same verdict — the round's copy is a duplicate dispatch, closed
here as already-landed.

MECHANISM PROVEN: the plan store `v.winPlan` is lazily initialized
ONLY by `stateOf()` (win-plan.js:93), reached via `winPlanSeedFromFight` /
`winPlanNoteKill` / fight-gate bump / `winPlanOf` / `winPlanStats` — i.e.
only after a wave-3+ seed row, an agency kill, a gate avoid, or a
bond/muster bump. `winPlanHavenTick` (win-plan.js:282–285) reads the
store directly and never calls `stateOf()`. It can never be the first
spark. The two no-plan seeds (102601, 102607) had zero initializers of
any kind in 150 days while rangers stood at Haven with engagement
present (869 unexplained havenTick calls panel-wide). The catch-22: the
plan system needs a wave-3+ seed or agency kill to switch on, but the
plan system is what gets villagers hunting wave-3+ beasts. This
EXPLAINS haventick-b's 4/8 never-plan villages (1515Z). Verdict
DIAG-NO-GO on bar 1 only because the frozen taxonomy had no row for a
never-initialized store; bars 2–5 pass. Evidence:
`evidence/2026-11-16/sim-planignite-a.md`.

### sim-vetreengage-a — PILOT GO (trio never fired)

**LANDED `60594bdf6`** (evidence + on-leg corpus). Frozen bar 1
passes: mean vet5@end among unlocked 0.0 → **1.4** (bar ≥ 1.0; the
1.5× ratio is vacuous — control is 0). Survival 5/8 = 5/8; starvation
4 → 5. Wall: national 4/8 → 5/8, table 0, wins 0, wave-4 8/8,
wave-5 unlocked 4/8 → 5/8. Proof 45/45 on the rebased tip.

The mechanism that passed the bar is NOT the hypothesized one: the
trio launch and the gate-counting pieces never fired once. Launches
120 → 199, all pairs; wave-4-target launches 1 → 19, all size 2;
partyTrios 0, partyDissolved 14. What moved was the seed call
underneath (v4seed rows 88 → 197, wave-4 `fled` rows 2 → 32) and the
plans it feeds (planSeeds 25 → 53, seekContacts 3 → 22, stageAdvances
45 → 70). Lever KEPT on the branch, env-gated, default OFF
(`VETREENGAGE=1`). The trio itself still needs a launch that works.
Evidence: `evidence/2026-11-16/sim-vetreengage-a.md`.

### sim-trickshare-a — PILOT NO-GO (lever killed, reverted)

**LANDED as evidence-only** (tip `580510a5d`: instrument + prereg +
evidence + corpora; net src/ diff 0). The taught channel FIRES — 65
taught observations, 25 wave-4/5, every one voiced at the fire; gate
trick-known 1.6% → 6.8% — but all-origins wave-4 kills tie 5–5 and
launched kills are 0–0. Proof 65/65 on the lever tip, 29/29 off-mode
post-revert. Wall: national-by-standing 4/8 → 2/8, by rank 0/8, table
0, wins 0, wave-4 8/8, wave-5 4/8 → 2/8, median 150.5 → 151d.

The binding constraint has moved downstream of trick knowledge: the
launch decision (gate never says "seek", unconsulted on 10 of 11
launched fights) and damage (best launched fight: 11% of monster HP;
no launched party on either leg dealt more than 11%). The one launched
fight where the party KNEW the trick — Javier Cusi's party vs the
Herald, seed 102604 d88 — still fled after three rounds having dealt
62 of 621 damage. Evidence: `evidence/2026-11-16/sim-trickshare-a.md`.

## Round wall (shared band 102601–102608)

| | Control (all three arms agree) | Best armed leg |
|---|---|---|
| National by standing ≥ 200 | 4/8 | 5/8 (vetreengage) |
| National by scaleRank ≥ 2 | 0/8 | 0/8 |
| Table (seat taken) | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave-4 reached | 8/8 | 8/8 |
| Wave-5 unlocked | 4/8 | 5/8 (vetreengage) |
| Median survival | 150.5d | 151d |

The wall has not moved: no table, no wins on any leg. The round's
yield is diagnostic, not a wall breach — plan ignition explained,
veteran retention up on one lever (by the wrong mechanism), trick
knowledge closed as a constraint and the launch/damage wall named.

## Metric review (prereg §14)

1. **Planignite's taxonomy had no row for a never-initialized store.**
   Bar 1 failed on a shape the prereg never named. The next ignition
   DIAG carries a `store-never-initialized` taxonomy row so the shape
   is classified inside its bars, not as a bar failure.
2. **Vetreengage's bar-1 ratio is vacuous.** Control mean vet5@end is
   0, so the ≥1.5× ratio cannot judge anything; the absolute ≥1.0
   carried the verdict. A future bar should judge the absolute mean
   plus the trio-launch rate, not a ratio against a zero control.
3. **Trickshare's primary flatters both legs.** The frozen primary
   (rounds ≥ 1) counts finish-offs of 1-HP beasts as real fights
   (armed d111 herald and d143 network_note both entered at 1 HP).
   Counting only fights against beasts at ≥ 50% of listed HP, the
   score is armed 2, control 1 — the lever still does not pass, but
   the margin is honest. PROPOSED for the next run: primary =
   distinct wave-4 kills, rounds ≥ 1, AND monster HP at entry ≥ 50%
   of its listed range, with wound-mill finish-offs reported
   separately.
4. **The gate-known bar passed on a shrinking denominator**
   (trickshare: gate rows 63 → 44 as trajectories diverged in the
   first month). A future bar should judge the gate's SEEK rate, not
   only its known rate — the gate never said "seek" on either leg.

## Infrastructure

- The 2015Z round timed out at the 2h cron limit; its stale lock was
  cleared by this adoption's coordinator, and its claim file
  (`fleshout-20261116T2015Z.json`) was marked `.DEAD`.
- This adoption's lock (`fleshout-loop.lock`, run
  `fleshout-20261117T0015Z`) and claim
  (`fleshout-20261116T2215Z.json`, marked `.DEAD`) are deleted /
  closed with this evidence file.
- Trickshare's ff-only merge was backgrounded by the coordinator and
  landed AFTER the batch ship (`e60b8241e`, tag
  `947613d28-20261117-001117`): the merge tip `580510a5d` sits on top
  of the bump commit, so trickshare is in the NEXT ship, not the live
  build. Planignite and vetreengage are in the live build.
- A status read taken during the trickshare merge showed the full
  safe-commit index-clobber pattern (all trickshare files
  staged-deleted + untracked duplicates) — that read caught the merge
  job's index mid-flight, not the tree's state. Final state verified
  clean on disk: `git status --short` empty, branch deleted, worktree
  released, all five trickshare commits on master. Lesson restated: a
  status read during another agent's merge is not the tree's state;
  verify after the merge lands.
- No host write-flap EPERM this run. Disk 47% at adoption start.
- Telemetry deviation check: REFUSED recorder-corpus input on the
  trickshare per-seed corpora (same documented refusal as the 1515Z /
  1631Z / 1730Z / planignite checks); baseline NOT rolled. The
  trickshare §15 panel decision is `review_required`
  (deaths/100d `no_material_signal`; national scale access 0 → 0;
  table win 0 → 0).

## Next

- **Plan-ignition fix arm** (the next lever): initialize the plan
  store on first HavenTick, or seed it from heard/slain knowledge
  directly. Own prereg, including a `store-never-initialized`
  taxonomy row. (Loop A has since started this arm as
  `sim-planignite-fix-a`; do not duplicate.)
- **Trick gap, next lever**: aim at the gate/launch decision or the
  damage math, not at trick knowledge — knowledge is closed.
- **Vetreengage trio**: the trio launch itself still needs a launch
  that works; the seed-call effect is real but is not the trio.
