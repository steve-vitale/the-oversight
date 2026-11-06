# sim-winnability-round-0615 — scale-onramp / winnability chain

**Run:** fleshout-20261106T0615Z (Loop A) · **Axis:** scale-onramp (converging, NOT converged) ·
**Arms:** sim-stageally-a (GO, merged `ab0586860`) + sim-finishprobe-a (DIAG-GO / Stage 2 NO-GO, merged `a0e9a1d2b`) ·
**Band:** 55001–55008 shared, competent verbatim, 150d death-aware · **No gate/price/deed change in either arm.**

## The one-line result, plainly

A village that walks into a wave-4 fight with friends beside it finally kills
the monsters — but only on one seed in eight, and the fight itself is still a
slaughter: the scholar dies in 5 of every 6 wave-4 turn-based fights even with
friends there. And on their own, no fighter can finish a wave-4 beast at all:
the numbers say the scholar would need to live 15–40 rounds to grind one
down, and dies in about six. The wall did not move — still no wins, still no
full seat — but the shape of the wall is now measured on both sides: company
opens the door (one seed banked a living pair, opened wave 5, and killed a
wave-5 monster), solo finishing cannot (arithmetic upper bound 7.5% < 10%).

## Arm A — sim-stageally-a: "Never fight wave 4 alone" — VERDICT GO (merged)

Companion-staging + rally for wave-4 TB fights. Policy-only, zero `src/js`.
Prereg + policy + instrument + driver + analyzer + proof committed before any
judged sim (`f2fdd6f3d`, proof 45/45). Judged corpus 8+8, 150d, on identical
seeds (`ca0b57716`). Evidence: `evidence/2026-11-06/sim-stageally-a.md`.

| Metric (identical seeds) | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4 kills | 2 | 8 | ×4 (kill rate 3.5% → 9.3%) |
| Ally presence in w4 TB fights | 27.5% (11/40) | 69.2% (36/52) | +41.7 pts — the bankkiller bottleneck, moved |
| Party presence in w4 TB fights | 0% | 55.8% (29/52) | staged party is in the fight |
| Post-first-blood w4 kills | 0/11 (0%) | 5/18 (27.8%) | second-killer production, moved |
| Living pair (≥1 day, 2 living w4 killers) | 0 seeds | 1 seed (55007, 20 days) | GO route 1 |
| First-killer survival, median | 2d | 5d | better, far short of the 19d bar |
| Median survival (guard) | 92.5d | 109d | +16.5d — guard holds |
| Wave 5 unlocks / faced / kills | 0 / 0 / 0 | 1 / 1 / 1 | first wave-5 kill in this line of work (55007 d100, Editor, by visjoin_77) |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | no win either leg |
| Field-fight w4 kills | 0 | 0 | untouched control channel, still 0 |

**The GO rests on one seed (55007).** The other seven seeds produced 2 kills
between them and no pair; 55005/55006 went backwards on kills vs baseline.
Read it as "the lever works when it catches", not "the lever works
everywhere". A confirm on a fresh band is owed before anyone leans on it
(extension band 53001–53008 reserved for this run's confirms, verified fresh).

**Landing caveat (coordinator re-verification, this run):** the judged corpus
was measured on base `abc4df164`. Master moved twice under the arm
(journey r107 + summary-a, then journey-scale r103). On the new base the
staging mechanism re-confirmed engaging — 8 staged legs re-run by the
coordinator on the merged tip: invites 28, accepted 14, rally fires 25,
w4 kills 5 across 66 fights — but the GO's pair route did **not**
reproduce (no living pair formed; 55007 killed 1, not 6). The proof's
live-invite smoke failed on the rebase (seed 55001's trajectory stalls
below the standing-75 gate on current master, 0 invites, deterministic);
the coordinator re-baselined the smoke to seed 55002/60d (gate day 38,
verified invites 4 / accepted 3 / partyDays 45 before editing;
assertions unchanged) and the proof is 45/45 green on the merged tip
(`ab0586860`). The GO verdict stands as measured on its base; the pair
is unconfirmed on current master.

## Arm B — sim-finishprobe-a: finishing probe → build — DIAG-GO / Stage 2 NO-GO (merged)

Classify every wave-4 fight ending from engine records, then build a
finisher policy only if the probe names a policy-actionable pattern.
Prereg committed before any judged sim (`8947a7932`); Stage 1 instruments +
proof 37/37 (`547012546`); Stage 2 amendment committed before any Stage 2
work (`8c115dab5`); gearOf fix + regenerated corpus + evidence (`a0e9a1d2b`,
proof 41/41). Evidence: `evidence/2026-11-06/sim-finishprobe-a.md`.

**Stage 1: DIAG-GO via P3.** 57 wild wave-4 fights, 2 kills (3.5%). TB 40:
38 scholar-death, 2 kills, 0 scholar-flee, 0 rout. Field 17: 0 kills,
0 mFlee, 10 vFlee, 3 evade, 2 villager-death. mFlee **0/57** — the monster
never gets away; the sigoff SAY-census claim ("every wave-4 fight ends
mFlee") does not reproduce in record-based classification. P1 NO
(near-miss 0), P2 NO (mFlee 0), **P3 FIRES** (TB kill rate 5.0% < 10%;
27/38 = 71% of TB losses end beast >50% HP; abilities used 7/40 = 17.5%
< 25%), P4 UNJUDGEABLE (pending-live n=1), P5 probe-only (TB ally 0/11 vs
solo 2/29 — handed to arm A). Post-first-blood kills 0/11 wild, reproducing
secondkiller (0/19). The two kills were both vs Strike — the one wave-4
monster that does not attack (32 and 46 rounds, zero incoming damage).

**Stage 2: NO-GO by arithmetic — no policy built, no pilot spent.** Sized
against two trajectory-identical supplements (holdings + turn-use; gear
cross-check): entry HP floor 350 (median 712); median survival in lost TB
fights 6 rounds; damage/strike tops out ~46 (best observed gear). Upper
bound generous to unattainable (every round a strike at bonus-implied
damage + one 2.5x aimed strike, zero movement/tricks/misses): at most 1
of 38 lost fights flips, kill rate ceiling 3/40 = 7.5% < the 10% GO bar,
post-first-blood kills 0 < 2. The ceiling fight (55002 d72, 18 rounds, 529
damage of 1052 entry) still left the beast at 523 HP. Binding constraint
is **survival time × damage/strike vs entry HP** — a balance fact, not a
fight-policy gap. Game-code proposal reported, NOT built (a Steve call):
survival-time mitigation, damage per strike, entry-HP wounding, party
damage (arm A owns the last).

**Coherence note (coordinator):** A and B do not contradict. B's bound was
for the solo scholar; A's kills came via party damage (4 of 8 armed kills
by companions) plus rally. Solo finishing cannot work; company is the
live lever. B's P3 honesty note: the "beast above half HP" leg measures
lifted entry state (median entry 70% of max) more than damage output —
honest measure is damageFrac, median 6.8% of entry HP.

**Instrument correction (gearOf bug):** the judged corpus's gear columns
were false — `gearOf` read `Game.getPerson(vid).equipped`, which returns
empty slots for the scholar; the engine's `equippedWeapon()` shows scholars
armed 37/40 (bonuses +5 to +120) and armored (armorP 0–60). Fixed, proof
+4 regression tests (41/41), corpus regenerated with 0 non-gear mismatches,
analysis identical on every key. No verdict number moved. **The bug affects
the whole instrument family** (grindfinish / secondkiller / killerdeath
lineage share the gearOf shape) — any past finding citing scholar gear from
those corpora should be re-checked against the engine reader. Recorded in
`sim-findings.md` with 4 further findings from this arm (patient_aim held
17× never pressed; SHUTDOWN line ×30; first kill without a triumph beat;
villager dies to a 20-HP Eulogy while contradicting instead of striking).

## Wall numbers (this run)

| | Wins | National | Table | W4 unlocks | W4 faced | W5 unlocks | W5 faced | Median survival |
|---|---|---|---|---|---|---|---|---|
| B probe (competent, 55001–08) | 0/8 | 0/8 | 0/8 | 6/8 | 6/8 | 0/8 | 0/8 | 92.5d |
| A baseline (competent, 55001–08) | 0/8 | 0/8 | 0/8 | 6/8 | 6/8 | 0/8 | 0/8 | 92.5d |
| A armed (staged, 55001–08) | 0/8 | 0/8 | 0/8 | 8/8 | 8/8 | 1/8 | 1/8 | 109d |
| A re-verify staged (new base, coord.) | 0/8 | 0/8 | 0/8 | 7/8 | 7/8 | 0/8 | 0/8 | — |

No wins, no national, no table anywhere. Readiness-5-ready days: 0 (B probe),
18 (A armed, all on 55007). Living wave-4 killers at end: 0/8 (B probe).

## Blanks filled / documented

- **Filled (A):** companion-staging + rally moves the bankkiller bottleneck
  (allies beside the scholar 28% → 69% of w4 TB fights) and produces kills
  including the first wave-5 kill in this line of work. Policy-only.
- **Filled (B):** every wave-4 fight ending classified from engine records;
  mFlee is 0 (sigoff SAY claim reclassified); the finishing mechanism named
  (survival × damage vs entry HP); the P3 build sized and rejected on its
  own arithmetic.
- **Documented, not filled:** solo finishing (balance lever, Steve call);
  first-killer survival (median 5d armed vs 19d bar); field fights still
  kill 0 wave-4 monsters on every leg; party persistence across succession
  (design question); the 55005/55006 backwards seeds (what differed —
  gear? tricks? scholar build?); the gearOf lineage re-check.
- **Adoption blank closed (Loop B 0630Z, this cycle):** gearoff CONFIRM GO
  and trickoff CONFIRM GO landed (`3e8b3024d`, `a0749eb9e`). The 0130Z
  adoption blank is now closed.

## Metric review

- Pre-registered metrics bound both arms; no metric was swapped, re-cut, or
  re-thresholded after the run. A: GO by both routes (pair + post-blood
  kills 5 ≥ 3), guard holds. B: DIAG-GO by P3 as written; Stage 2 NO-GO by
  the pre-registered arithmetic (kill rate ≥10% or post-blood ≥2 — ceiling
  7.5% / 0).
- Balance panel (`scripts/balance-panel.js`): A attempted — refuses without
  a panel directory; no Game-root change exists in either arm (policy A/B
  on identical seeds is the comparison), so no compare `.md` fabricated.
  B: inapplicable — no armed leg exists.
- Telemetry check: `telemetry-check.js` REFUSED the recorder corpus on
  both arms' corpora (all rows carry top-level anchorCommit) — same as
  every prior killer-chain arm. No LOUD lines; baseline NOT rolled. Wall
  numbers above are the instruments' own.
- A's analyzer change after the prereg commit (leg-summary aggregation of
  an already-recorded count) changed no frozen metric. B's corpus
  regeneration (gearOf fix) verified trajectory-identical on every
  classification field — a corpus correction, not a new judged sim.
- The staged legs' `pendingW4` = 0 on both legs (A): the pending hook never
  saw a wave-4 pending encounter — the "wait for a companion at the door"
  question stays unmeasurable this way (the NO WAIT finding stands).

## Convergence

**scale-onramp: converging, NOT converged.** The funnel moved at exactly one
joint: allies beside the fighter (28% → 69%) and second-killer production
(0 → 5 post-blood kills, pair banked 20 days on one seed, wave-5 door opened
and a wave-5 monster killed). Everything downstream of the pair is still
unproven (pair did not reproduce on the new base; first-killer survival 5d
vs the 19d bar; 0 wins). The binding constraint is now precise and split:
company works when it catches; solo finishing cannot work at all (the
survival × damage arithmetic); the next lever has to go after what happens
inside the fight once company is there — damage, staying, and finishing —
or after the balance levers B named (Steve call). Next run: confirm A on
the reserved fresh band 53001–53008 before anyone leans on the GO.

## Run notes (coordinator)

- Stale-lock recovery at open: 0315Z lock (2h54m) + its only live tree
  heartbeat 60 min stale → dead; lock deleted, claim retired to `.DEAD`.
  The 0315Z summary arm closed out in the main session during this run
  (`3d438e7f3`) — not touched by this loop.
- Master moved under both arms mid-run (r107 + summary-a, then r103, then
  journey-succession r143). Both branches rebased twice / once onto the
  current tip with proofs re-run green after each rebase (A 45/45, B 41/41).
- Safe-commit index clobber hit both worker trees AND the coordinator's own
  commit (stale index entry after a correct commit; repair: cacheinfo from
  HEAD blobs, verify status + diff empty). Rebase stop-at-pick quirk hit on
  B's rebase (clean tree, pick unapplied) — `git rebase --continue`
  sailed through, per the AGENTS.md lesson.
- Heartbeat script stuck once (~6.5 min, no output, killed); registry
  timestamps stayed fresh (07:29:41Z) — likely REGISTRY.lock contention
  with sibling reapers. Box heavily loaded all run (heartbeat calls up
  to ~2.6 min; registrations 7–8 min).
- `safe-commit.sh` lost its exec bit in B's worktree (mode 644); invoke
  as `bash scripts/safe-commit.sh` until repaired.
- No push, no version bump, no live verification (ship loop owns deploys).
  **Merged locally, pending ship.**
