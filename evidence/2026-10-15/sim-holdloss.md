# sim-holdloss — national-hold loss-mode diagnostic (2026-10-15)

Worktree: `~/workspace/worktrees/sim-holdloss`. Run: oversight-flesh-out-loop,
diagnostic arm on the scale-onramp axis (standing scale directive).
Assignment: the 0915Z run named NATIONAL HOLD DURATION as the wall's
remaining face — village-death is the modal loss, but the hold-duration
loss modes are UNNAMED. This arm builds the instrument that names them.

Canon: docs/CANON.md (read first). Disease names per docs/DISEASES.md
(two pools, never mixed); monster names/descriptors from
src/data/monsters.json (`name` + `unknown` fields). No canon doc covers
hold-loss attribution — the taxonomy is this arm's instrument, not canon.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

**Question:** when a national-reaching run loses the hold, HOW? Name every
loss: combat / monster / sickness / starvation / wounds / succession-chain /
wave-unlock / other-named-with-trail.

**DIAGNOSTIC GO (binding):** ≥90% of national-reaching runs' LOSSES
attributed to one of the 7 specific named modes. "other-named" counts
AGAINST the 90% (it is the honest remainder, not an attribution) — the
trail must be preserved, never silently bucketed. Held-to-end runs have
no loss and sit outside the denominator.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast},
180d death-aware, FEASTSCALE_R13=1 asserted up front in proof AND sweep
(#312 lesson). Diagnostic arm on the current tip — own control not needed.

**Horizon + why:** 180d death-aware. National reaches peak around d77–150
and the hold question needs the post-reach months; a shorter horizon
would truncate the holds being measured.

**Instrument:** `scripts/holdloss-lib-20261015.js` (pure classifier;
zero policy edits, zero src/js changes). Loss window = 20d ending on the
loss day (extended to finalDay+1 for village-death losses — the harness
can record deaths the day after the returned day count; a final-day death
must never be excluded by bookkeeping). Priority: wave-unlock (unlock
±10d + combat/monster deaths plural) → succession-chain (≥3 succession
beats ±14d, or death ±3d of a rank-fall while the village lived) →
family plurality (≥40% of loss-window person deaths in one family) →
tie / no-deaths / no-family → 'other-named' WITH the full trail
(famCounts, exact causes, evidence lines).

**Proof:** `scripts/test-holdloss-20261015.js` — 53/53 GREEN, including
REAL-RED on the two contextual modes (a naive family-only classifier
demonstrably cannot name wave-unlock or succession-chain) and
trajectory-neutrality (instrument ON vs OFF byte-identical 30d on a real
sim). SMOKE green, DETGATE green (D1 gate determinism, D2 ON/OFF
byte-identical 60d).

## Census attempt (re-analysis of the 0915Z records)

`REANALYZE=1` over `evidence/2026-10-15/telemetry-0915Z/` (64 sparse
records): **national-reaching 20/64 (all leadfeast), attributable 0/20.**
The sparse records carry only reach counts
(national/table/wins/exiled) — no loss-window death causes, no rank rows,
no hold durations. **Verdict: census IMPOSSIBLE from re-analysis.**
The fresh 16-run instrumented suite below is the census.

## Results — the 16-run instrumented suite

Substrate: 8 seeds × {leadfeast, belongfeast}, 180d death-aware,
FEASTSCALE_R13=1. Per-seed records:
`evidence/2026-10-15/perseed-holdloss/`; summary:
`evidence/2026-10-15/sim-holdloss-runs.json`; sweep log:
`evidence/2026-10-15/sim-holdloss-sweep.log`.

**DIAGNOSTIC: MISS — 2/3 losses attributed to a specific named mode
(67% < 90%).** Per the task's kill protocol for a diagnostic arm:
instrument repaired, evidence only.

| run | hold | lossDay | loss mode | end |
|---|---|---|---|---|
| leadfeast s22 | 72d (d77–148) | 149 | **succession-chain** | village-lost d151 |
| leadfeast s33 | 105d (d76–180) | — | held-to-end | survived |
| leadfeast s44 | 39d (d77–115) | 116 | **succession-chain** | survived d180 (rank fell, village lived) |
| leadfeast s66 | 105d (d76–180) | — | held-to-end | survived |
| leadfeast s77 | 16d (d77–92) | 91 | **other-named** (combat/starvation tie, full trail) | village-lost d91 |

**Top-3 loss modes:** succession-chain 2/3 (67%), other-named 1/3
(33% — the s77 combat/starvation tie), no third mode observed.
Combat/monster/sickness/starvation/wounds/wave-unlock as PLURALITY modes:
0/3. (Starvation and combat both appear in the s77 tie.)

**Hold-duration distribution** (5 national reaches): 61–120d: 3,
31–60d: 1, 11–30d: 1. Median hold 72d.

**Wall numbers this run:** national 5/16 (leadfeast 5/8, belongfeast 0/8);
table 8/16; wins 0/16; wave-4 8/16, wave-5 6/16; median survival 151d;
exiled 0/16.

**The other-named case (s77) is not an instrument failure — it is a
genuinely mixed-mode loss** (see narrative 3 below): raid pressure →
succession shock (tribute pressed down on the empty chair) → pantry
stripped to 0 → a combat death AND a starvation death in the loss
window, 1–1. No family reaches plurality. The trail is complete
(famCounts, exact causes, per-death lines); the miss is a metric
artifact of small n (one tie in three losses), not a bucketing gap.
See metric review.

**Across-suite death vocabulary** (person-kind, all 16 runs): combat 119,
sickness 23, starvation 17, contest 15, monster 14, wounds 10,
'dehydration' 2 (→ starvation family), 'ambush' 2 (→ combat),
descriptor kills ('a dog-shaped silence at the treeline' ×2 → monster
via the `unknown` corpus), 'Big-Bane' ×1 (procedural monster name,
correctly other-named with trail), 'the expedition' ×1 (→ combat).
The instrument named every observed cause except the procedural name.

## Loss narratives (SENSE-TESTING LAW — read, not counted)

**1. leadfeast s22 — succession-chain, village-lost d151 (72d hold).**
National d77–148. The last 20 days are a siege story: night raids from
Thornfield, Stonebridge, and Emberhold strip ~969+1500+1374+1000+1000
kcal from the pantry; STARVING beats fire daily; the roster collapses
3→1 and the pantry hits 0. Then the succession drumbeat: Elif dies d141,
Zoe d148, each firing the identical "dead hold no treaties" line, and
the polity dissolves. The village doesn't fall to a monster — it is
bled by its neighbors and then unmade by its own funerals. The mode is
honest: the RANK was lost on the succession chain (5 succession beats
±14d), even though the CAUSAL chain starts with the raids. Both are in
the evidence.

**2. leadfeast s44 — succession-chain, survived (39d hold, rank fell d116).**
National d77–115, then wave-5 unlocks d97 ("RATINGS ARE UP... the fifth
draft"). Leandro dies in combat d97 → "the dead hold no treaties" →
Emberhold, Stonebridge, and Thornfield each "watch to see if Haven holds
without its dead — and press the tribute down" while the chair is
empty. Devon Okafor dies d115 → "◈ The realm came apart." The village
SURVIVES to d180 at regional. This is the sim-succpolity mechanism in
the wild: the polity dissolves on the funeral hour, not on the war.
The subordinate-village opportunism beats (tribute pressed DOWN on the
empty chair — they test the new speaker) read as genuinely political
people, not numbers. The wave-5 unlock at d97 is 19d from the loss —
outside the ±10d wave-unlock gate, correctly not named.

**3. leadfeast s77 — other-named (combat/starvation tie), village-lost d91
(16d hold).** National d77, a 16-day hold. Jesse Cortez dies in combat
d83 → the succession beat fires and the subordinates press the tribute
down. The village keeps working — fishing, foraging, a feast, a moot
win, a counter learned for Static. Raid pressure never stops (The
Hungry Road, The Bloodied, Thornfield, Stonebridge), and d86 a MONSTER
raid hits the pantry ("4 raiders — Ugly-Eyes, Old Croaker, The
Redactor, mosquito — drawn by the smell of the pantry"). d90: "Haven's
pantry is empty. Day 1 of hunger." d92: "💀 James starved. Slowly. The
village is 9 now." The loss window holds one combat death and one
starvation death — the instrument's tie rule fires honestly. The real
story is raid→succession-shock→starvation entanglement; no single name
covers it, and the instrument refuses to pretend one does.

## Village assessment (plain words)

Five villages reached national, all on the leadfeast road; the
belongfeast road reached 0/8 (same as sim-succpolity on this tip — the
belong courtship isn't seasoning on these seeds, arm-independent).
Two villages held national to the horizon (s33, s66 — 105d holds,
table seated, wave 5 open). The three losses are three different
stories: a siege that ends in funerals (s22), a wave-5-era polity that
dissolves on its leader's death while the village lives on (s44), and
a 16-day hold eaten by raids and hunger (s77). The through-line is not
monsters: it is the NEIGHBORS. Every loss narrative has rival villages
raiding the pantry, pressing tribute down on an empty chair, or
carrying off the stores at night. The scale wall's hold face is
political attrition more than combat attrition — on this evidence, the
next lever to test is the raid/tribute pressure on young nationals,
not monster tuning.

## Blanks filled / documented

- **FILLED:** the hold-loss instrument itself —
  `scripts/holdloss-lib-20261015.js` (pure classifier, zero game-code),
  `scripts/sweep-holdloss-20261015.js` (SMOKE/DETGATE/REANALYZE/suite),
  `scripts/test-holdloss-20261015.js` (53/53 GREEN, REAL-RED + trajectory
  neutrality). Reusable for future hold arms; the loss narratives are
  first-class outputs, not just counts.
- **FILLED (instrument repairs, proof-tested):** (1) monster-descriptor
  corpus — expedDeath carries `unknown`-field descriptors, not names;
  (2) loss-window end = finalDay+1 for village-death losses — the
  harness can record deaths the day after the returned day count
  (s77: daysRan=91, starvation death recorded d92); without the fix the
  instrument would have called s77 'combat' on a single death and missed
  the starvation half of the story.
- **DOCUMENTED (for the coordinator's findings backlog):** harness
  day-accounting off-by-one — beats/deaths can be timestamped a day
  after `runDays`' returned day count (observed s77: days=91, d92
  events). Not chased (outside the hold-loss axis).
- **DOCUMENTED:** the belongfeast road reached 0/8 nationals on this
  tip (same as sim-succpolity) — the belong courtship isn't seasoning
  on these seeds; arm-independent substrate variance, not the
  instrument.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **The MISS is a small-n tie, not a bucketing gap.** 2/3 losses named
   (67% < 90%); the third is the s77 combat/starvation tie, which the
   pre-registered tie rule handles exactly as specified. No metric
   revision is needed to the GO itself — but the evidence suggests a
   refinement for the NEXT run's instrument: a starvation-context
   breaker (pantryDays hits 0 in the loss window AND ≥1 starvation
   death → name 'starvation'). It would have named s77 without touching
   the plurality rule's honesty. Proposed, not applied — applying it
   now would be re-scoring against a friendlier rule mid-run.
2. **n=3 losses is thin for a mode ranking.** The diagnostic names the
   mechanism on every loss it saw; a follow-up run wanting mode SHARES
   (not just names) needs a larger national-reaching substrate — e.g.
   leadfeast-only seeds or a succession-enriched design (a design
   question, not a measurement fix).
3. **'combat' includes blow-by-blow field-fight deaths vs monsters**
   (tbEnd registers them as cause 'combat'). The combat/monster split
   is cause-string-honest but mechanism-blurry on that edge; the
   narratives disambiguate per-run. A future instrument could read the
   fight context, not just the cause.

## Convergence

**DIAGNOSTIC MISS per the letter (67% < 90%); instrument repaired,
evidence only.** The instrument names the loss on 3/3 national-hold
losses (2 specific modes + 1 honest other-named with a complete trail),
proofs 53/53, SMOKE/DETGATE green. The wall's hold face now has names:
succession-chain is the modal named loss (2/3), the third is a
raid→succession-shock→starvation entanglement the taxonomy refuses to
flatten. scale-onramp stays the blocking axis: wins 0/16, belongfeast
0/8 national, median survival 151d. Recommended next lever: raid and
tribute pressure on young nationals (the political-attrition face),
per the village assessment above — a coordinator/Steve call.
