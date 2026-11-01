# sim-muster-a — Muster formation: why a muster never forms at all

- Run: fleshout-loop-a (scale-onramp), worker branch sim-muster-a.
- Arm: DIAG ONLY. Zero `src/js` changes, no gate threshold moved, no
  existing policy file edited, no policy file created. New instrument
  files only + corpus + evidence.
- Verdict: **DIAG-GO.** All nine preregistered bar items pass (see
  Proof and legs). **NO confirm spend** — the pilot shows muster is
  structurally zero (see below), and the prereg says that IS the
  finding: document it and stop, do not burn seeds chasing it.
- Stack (named exactly; numbers are NEVER compared across
  stacks/bases): substrate `scripts/policies/tableseat-nowait.js`
  (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
  UNMODIFIED: `fullseat-diag`, `wavegate-diag`, `vet2-diag`,
  `vet2mfg-diag`, `muster-diag` (`MUSTER=1`, herald refusal
  snapshots + verb counters). New instrument:
  `scripts/sim-muster-a-sweep.js` (dawn trajectory via a
  `titanDawnTick` wrapper, say-line capture, startCombat
  cross-check), `scripts/sim-muster-a-lib.js` (shared pure
  yield/trajectory/classification rules),
  `scripts/sim-muster-a-analyze.js`,
  `scripts/sim-muster-a-split.js` (brace-depth splitter, see
  Instrument bug below), `scripts/test-sim-muster-a.js`.
- Band: pilot 8 seeds 95301–95308 — the FIRST HALF of the
  vet2mfg/titangate band, reused deliberately (see prereg).
- Horizon: `DAYS=180`, death-aware.
- Corpus: `evidence/2026-11-01/sim-muster-a/` (8 files).
- Analysis: `evidence/2026-11-01/sim-muster-a-analysis.json`.
- Preregistration: `evidence/2026-11-01/sim-muster-a-prereg.md`
  (commit `d7e7c0d14`, BEFORE any judged replay).

## The answer in one paragraph

The call is never sounded — by anyone, for any reason, on any
seed. Not by the policy (no bot policy contains a titan verb at
all), not by the game (no dawn tick, omen advance, or NPC sounds
it — the only callers in `src/js/titans.js` are the player's own
camp verb `titanSelfDo('titan:call:<tid>')` and the finale
reinforce path, itself player-reached), and not by the titan's
arrival (arrival only stages the omen and speaks "Sound the
call."). The muster therefore never exists: muster size is 0 on
every dawn of every seed, for every titan. And the second wall
behind the first: even if the call HAD been sounded, it could
not have reached 10 on any seed at any measured time. At the
moment each Herald is offered, the hypothetical call yield is
0–6 blades (never 10); the highest yield ever measured on any
seed is 8 (on 95308, where no omen ever arrived to offer the
call at all). The coalition is too small and too base-trust to
fill the gate: 3–4 active links, every one of them on the base
quota of 2 (no link anywhere reaches the trusted 70 trust / 10
opinion line that would bring 6), and on the one seed where the
titan is actually refused, the allied villages have zero spare
adult faces at refusal time. So titangate's have=0 is not a
muster that failed — it is a verb nobody presses, for a
coalition that could not fill the gate if pressed.

## Q1 — Is the call ever sounded? By whom, triggered by what?

No. On all 8 seeds, all four verb counters are exactly 0:

| verb | total across 8 seeds |
|---|---|
| `soundTitanCall` (any caller) | 0 |
| `titanSelfDo` (any titan verb) | 0 |
| `titanCommitOwn` (Haven's own blades) | 0 |
| `titanWarCouncil` | 0 |

No call line, no answer line, no refusal line, no commit line,
no council line appears in any seed's say capture (say kinds
across the band: omen0 7, omen2 7, refusal 29 — nothing else).
The trigger question is answered by code-reading, confirmed by
the counters: the ONLY callers of `soundTitanCall` are the
player camp verb and the finale reinforce path. The policy
statement in the prereg holds exactly: `tableseat-nowait` and
`leanlinkrescue` contain zero titan-verb calls, and the
competent policy likewise contains zero — so this zero is not
an artifact of the chosen policy. A human player COULD press
the button (it is offered — see Q2), but no bot in the loop
ever does, and nothing in the game presses it for them.

## Q2 — Does muster size ever grow above 0?

No. Muster size (unique allies + valid haven blades, dawn
snapshots after `titanDawnTick`, per titan) is 0 on every
trajectory entry of every seed: max size 0 on 8/8 seeds, end
size 0 on 8/8 seeds, first-positive day never occurs. The
trajectory is not flat for lack of measurement: it records
27/20/23/27/23/19/33/22 change entries across the seeds (omen
stages advancing, links forming, yields moving) while size
stays pinned at 0 throughout. No partial muster, no formed-
then-stood-down muster, no haven-only muster exists anywhere
in the band. (Note: the gate's printed `have` counts allies
only, so a haven-only muster would still print have=0 — but
there is no haven muster either: haven blades are 0
everywhere, because `titanCommitOwn` is never invoked.)

## Q3 — What blocks the FIRST joiner, per seed?

Classification (prereg priority order; every zero-muster seed
classified, 8/8):

| seed | class | offered (omen ≥ 2) | yield at offer | max yield ever | end |
|---|---|---|---|---|---|
| 95301 | B-OFFERED-NOT-SOUNDED | herald d120 | 4 (3 links) | 4 | lost d170, regional |
| 95302 | A-NO-OPPORTUNITY | none (wave 3 only) | — | 6 | survived d181, national |
| 95303 | B-OFFERED-NOT-SOUNDED | herald d164 | 4 (3 links) | 4 | lost d180, regional |
| 95304 | B-OFFERED-NOT-SOUNDED | herald d135 | 0 (3 links, 0 free faces) | 4 | survived d181, global |
| 95305 | B-OFFERED-NOT-SOUNDED | herald d79 | 2 (4 links) | 4 | lost d84, global |
| 95306 | B-OFFERED-NOT-SOUNDED | herald d172 | 4 (3 links) | 4 | survived d181, regional |
| 95307 | B-OFFERED-NOT-SOUNDED | herald d97 + nielsen d117 | herald 6, nielsen 2 | 6 | lost d125, regional |
| 95308 | A-NO-OPPORTUNITY | none (herald omen 1 only) | — | 8 | won d99, global |

- **B (6 seeds): the call is offered and never sounded.** The
  omen-2 line ("Scouts found its lair ... Sound the call.")
  fires, the camp button exists from that day on, and nobody
  presses it — for 50 days (95301: d120→d170), 46 days (95304:
  d135→d181), 16 days (95303), 9 days (95306), 28 days
  (95307 herald), and 5 days (95305, village lost d84).
  Sub-report — would the call have produced blades? At offer
  the yield is 0–6, never 10; at run end it is 2–4 on the B
  seeds. So B has TWO layers, in order: (1) the verb gap
  (never sounded) is the proximate blocker of the first
  joiner; (2) the coalition gap (yield < need at every
  measured time) means sounding the call would NOT have
  produced a gate-passing muster on any B seed either.
- **A (2 seeds): no opportunity at all.** 95302 never leaves
  wave 3 (no titan omen of any kind); 95308 reaches herald
  omen stage 1 (named) but never stage 2 (located), and wins
  on day 99 before the lair is ever found. The call button
  was never offered to anyone.
- **C/D/E: 0 seeds.** No call was sounded (so no called-
  no-answers case), no partial muster formed, no muster
  reached need. The reclassification rule was never needed.

### Why the yield is short — the coalition gap in detail

At every offer, the binding constraint is quota × links, not
refusals:

- Every link at offer sits on the BASE quota of 2. No link on
  any seed reaches trusted status (trust ≥ 70 AND opinion ≥
  10) at offer time, so no link ever brings 6. With 3 links,
  the ceiling is 6; with 4 links (95305), 8 — before free-face
  and refusal deductions.
- Free faces are the second deduction. On 95304 at offer,
  all three links have 0 free adult faces (trust 59–60,
  opinion 24–28 — willing, but nobody to send), so the yield
  is 0. At the first refusal (d161) the yield is still 0
  for the same reason; it rises to 2 only by the last
  refusal (d165, Thornfield gains 5 free faces). On 95301
  one of three links has 0 free faces at offer; on 95303
  one of three links refuses on arrears. On 95305 two of
  four links refuse (trust 14; arrears) and one has 0 free
  faces — only one link answers, for 2.
- The highest yield ever measured anywhere in the band is 8
  (95308, end state, no omen) — still short of 10, and on a
  seed where the call was never offered. The gate's need
  (10) exceeds the reachable coalition on this band at every
  measured moment, even before the verb gap is considered.
- The yield rule replicates `soundTitanCall` exactly (same
  trust/opinion/arrears thresholds, same quotas, same free-
  face filter as `titanAlliedFaces`), so these yields are
  what the game's own call WOULD have produced, not an
  instrument's guess. The one seed with real refusals
  confirms the replication's shape: muster-diag's refusal-
  time snapshots (independent code path) give the same
  yields (0 at first refusal, 2 at last) as this arm's
  trajectory snapshots.

### The second offered titan (95307)

95307 is the only seed where a second titan reaches omen
stage 2: the Nielsen, day 117 (overtime third-titan omen —
the cast apocalypse arrives as the overtime rerun; wave 5
itself is never unlocked on this seed). Its yield at offer
is 2 (3 links, base quotas). It is never sounded either, and
never refused (never met). The B classification covers both
titans: offered twice, sounded never.

## SENSE-TESTING: what the transcripts actually say

Read the first-event beats (ring buffer at first omen-2 per
seed; first refusal beat on 95304). The pattern is identical
on all six offered seeds, and it is the sense finding:

> d135 (95304): "🗺️ Scouts found its lair — tile 7,4. THE
> HERALD — the sky, getting bigger. It is WAITING. You
> cannot face it alone. Sound the call."
> d135, immediately after: "🌪️ THE HERALD fed in the night
> — 0 kcal gone from your stores. It is eating the realm
> while you deliberate."

On 95303/95306/95307 the escalation line is the crueler
variant: "struck [village] in the night. They bled while the
coalition talked. (trust −5 — they notice who wasn't
there.)" The fiction does everything right except one
thing: it addresses an actor who never acts. "Sound the
call" is an imperative with no imperative-taker — no
policy presses the button, no villager sounds it, no
council convenes it. And then the game accuses the village
of deliberating ("while you deliberate", "while the
coalition talked") for a deliberation nobody is having:
there is no council (0 war councils), no debate, no
decision — just the omen line, the escalation line, and
silence, for 5 to 50 days. On 95304 the refusal beat then
repeats titangate's finding verbatim 29 times ("This is not
courage. This is arithmetic."), which reads, in context,
as the game patiently explaining a remedy to a village
that has never once tried it. The refusal line is honest;
the omen line is honest; the gap between them — a spoken
instruction with no one to follow it — is the story. A
player reading this transcript would not ask "why didn't
the muster fill?" She would ask "who was supposed to sound
the call, and why didn't they?" — which is exactly the
question this arm was asked, and the answer is: the player
alone, and the bots never do.

## Per-seed end fields (this band, this stack — not wall numbers)

| seed | days | end | rank | wave | national* | table | won |
|---|---|---|---|---|---|---|---|
| 95301 | 170 | village-lost | regional | 4 | 0 | 0 | 0 |
| 95302 | 181 | survived | national | 3 | 1 | 0 | 0 |
| 95303 | 180 | village-lost | regional | 4 | 0 | 0 | 0 |
| 95304 | 181 | survived | global | 4 | 1 | 0 | 0 |
| 95305 | 84 | village-lost | global | 4 | 1 | 1 | 0 |
| 95306 | 181 | survived | regional | 4 | 0 | 0 | 0 |
| 95307 | 125 | village-lost | regional | 4 | 0 | 1 | 0 |
| 95308 | 99 | over-other | global | 4 | 1 | 1 | 1 |

\* national here = end rank national/global (this arm's end
field), NOT nationalEver. Pooled, for orientation only (pilot
band, single stack): end-national 4/8, table 3/8, won 1/8,
wave 4 7/8, wave 5 0/8, median survival 175 days, max 181.
These reproduce the titangate band's shape on its first half
(end fields match titangate's per-seed table for all 8
seeds) and claim no new wall numbers.

## Proof and legs (evidence, not assertion)

- Proof test `scripts/test-sim-muster-a.js`: **32 passed, 0
  failed, 0 skipped** on the judged corpus (19 synthetic
  cases: yield rules incl. boundaries, trajectory summary,
  classification priority incl. D-over-C; 13 corpus legs:
  8 seeds, herald refusals == 29, trajectory on 8/8,
  capture errors 0, zero-muster seeds all classified A/B/C,
  verb maps present on 8/8).
- Cross-check leg: herald gate refusals on the pilot band
  == 29 (titangate's pilot-band count), all on 95304. PASS.
- Recorder-neutrality leg: OFF (capture + muster-diag off)
  vs ON end fields on 95304 identical — 181d, survived,
  global, national 1, table 0, won 0, wave 4. PASS. (OFF
  refusals read 0 by construction — the capture is off —
  so the leg compares end fields only, as preregistered.)
- Determinism leg: ON re-run of 95304 (after the separator
  fix, see below) reproduces the judged per-seed JSON in
  every field EXCEPT `anchorCommit`, which changed because
  the separator-fix commit landed between the two runs
  (aff2188e → 75a11b73). The game/instrument output is
  otherwise byte-identical. PASS with that one explained
  field difference (the anchor is SUPPOSED to record the
  commit; a changed anchor on a changed commit is correct
  behavior, not drift).
- Capture errors: 0 on all 8 judged seeds (sweep +
  muster-diag both).
- Smoke discipline: a single-seed smoke run (95304, to
  scratch only, never judged) confirmed the instrument end
  to end before the judged sweep (29 refusals, verbs 0,
  errs 0) and was NOT counted as judged data. The judged
  95304 run then reproduced the smoke's done line exactly.

## Instrument bug found and fixed (do not hide it)

The judged sweep's stdout separator was a literal
backslash-n, not a newline (a double-backslash typo in the
sweep's `process.stdout.write` line): the 8 judged JSON
objects were concatenated into one file line. The DATA was
intact — all 8 objects parse — but the reused
vet2mfg splitter (which splits on real newlines) could not
split it. Fix, in commit `75a11b73`: the sweep now writes a
real newline, and a new brace-depth splitter
(`scripts/sim-muster-a-split.js`, string-escape aware)
splits BOTH the literal-separator file and correctly
separated files. The judged corpus was produced by that
splitter from the judged stdout file, and re-splitting the
same file reproduces all 8 per-seed files byte-identically
(verified). No sim was re-run to repair this; the separator
fix changes no game data, only the transport between the
sweep and the splitter.

## Blanks filled or documented

- Filled: the muster-formation mechanism — call never
  sounded (verb counters 0 on all entry points), muster
  size 0 on every dawn, first-blade blocker classified on
  8/8 zero-muster seeds (6× B, 2× A), hypothetical yield
  at offer and at end per seed, the coalition gap (base
  quotas only, 3–4 links, free-face shortages) quantified,
  the second offered titan (95307 nielsen) observed.
- Documented, not filled (for later arms, NOT this one):
  (a) the verb gap is a policy-design question — should a
  bot policy ever sound the call, and under what
  conditions (offered + yield ≥ some threshold? offered
  regardless?), or is the call deliberately player-only,
  in which case sims can never reach the titan gate and
  the gate is unmeasurable by sims at all; (b) the
  coalition gap — even a sounding policy would fall short
  of 10 on this band (max yield 8, offers 0–6), so fixing
  the verb alone does not fill the gate: link count,
  trusted quotas, or need itself are the next questions,
  and they are design calls, not measurements; (c) the
  free-face shortage on 95304 (willing links, nobody to
  send) — whether allied villages' rosters are genuinely
  thin or the free-face filter is stricter than the fiction
  suggests is a follow-up census, not answered here;
  (d) the escalation-while-deliberating narration
  ("while you deliberate" / "while the coalition talked")
  fires when no deliberation is happening — a fiction
  question for a later arm, not an instrument gap.

## Metric review (mandatory)

- **Pre-registration bound the run.** Judged exactly
  against the prereg bar: 8 complete pilot seeds, 100% of
  call attempts classified (there were none — 0 attempts,
  0 unclassified, reported as 0/0, not as a percentage),
  trajectory on 8/8 seeds, first-blade blocker classified
  on every zero-muster seed (8/8, classes A/B only),
  cross-check 29 == 29, neutrality on 95304, determinism
  on 95304 (one explained anchor field), proof green,
  sense beats read. No re-scoring, no bar moved after
  seeing results. The prereg's stop rule was honored: the
  pilot shows structural zero, so NO confirm spend was
  run — a 12–16 seed confirm of a zero would have been
  seed-burning, not measurement.
- **Doubts filed, not resolved by re-scoring.** (a) The
  hypothetical yield replicates the call rules rather than
  calling them; a rule drift in titans.js would show as a
  yield mismatch on a real call, and there is no real call
  in this band to check against — the muster-diag
  cross-check (same yields via an independent code path on
  refusal days) is the guard, and it agrees. (b) Dawn
  snapshots miss intra-day muster changes, but the verb
  counters are the guard and they are 0 — no intra-day
  muster could have formed without a verb. (c) "Offered"
  is derived from the exact `titanSelfActions` condition
  (omen ≥ 2, not slain) without calling it, because calling
  it runs `titanRepairPlacements` (a mutator). (d) Yield
  values for non-offered titans are coalition-pool state
  (the link pool is titan-independent; only already-
  committed allies differ, and those are 0 everywhere) —
  they are reported for completeness but the governing
  yields are the offered titans' (herald, plus 95307
  nielsen). (e) The determinism anchor difference is
  explained above, not smoothed.
- **Revisions for the NEXT run, not this one.** A sounding
  policy arm (if the verb gap is ruled fixable) should
  pre-register a yield threshold for sounding (e.g. sound
  only when yield ≥ need, vs sound whenever offered) and
  measure whether the gate is then reached — it cannot
  assume the gate fills. A coalition-gap arm should
  measure link counts and trusted-status attainment on a
  band where villages survive longer, since this band's
  ceiling (3–4 links, base quotas) may itself be the
  binding constraint.

## Convergence state

converging (measurement, not a lever): the scale-onramp
axis now has the muster-formation decomposition — the
titan gate's have=0 is explained upstream as (1) a verb
nobody presses and (2) a coalition that could not fill
the gate if pressed. No game change landed and no wave-5
or full-seat reachability is shown; the next work on this
channel is the design call in blanks (a)/(b) above, not
another census of the same zero.

## Readiness

Merged locally, pending ship — NOT pushed, NOT version-
bumped, NOT live-verified (the coordinator merges; the
ship loop owns pushes). No `[needs-eyes]` (DIAG
instrumentation only; nothing player-facing changed).
