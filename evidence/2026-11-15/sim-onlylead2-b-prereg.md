# sim-onlylead2-b — PREREG (covenant road on a 200d horizon)

Run: fleshout-loop-b-20261115T1130Z (Loop B), arm sim-onlylead2-b
Axis: winnability chain. Covenant-road staging arm — the follow-up
to sim-onlylead-b Stage 2, which was KILLED at smoke as
SUBSTRATE-MISSING on a 150d horizon.
Branch: sim-onlylead2-b — worktree ~/workspace/worktrees/sim-onlylead2-b
Base: master at worktree creation (tip 1ca2c257d; game code unchanged
since the 1055Z run — the commits since are evidence/policy/test only)
Date: 2026-11-15

## Canon note (read first)

docs/CANON.md was read, then docs/SCALE.md and the staging code
itself (src/js/hierarchy.js `_havenPolity`, `polityOf`,
`_belongPolity` / `_covenantPolity` / `_tradePolity`,
`_checkNational`, `stageNationalBeat`, `_proposePeer`,
`_judgePeer`) — as already grounded in
evidence/2026-11-15/sim-onlylead-b-prereg.md, which this prereg
inherits. Nothing below is invented. The covenant shape, in one
line: Haven holds ≥3 SEASONED covenant peer links (kind
'covenant', no primary/subordinate; seasoned = 30+ days old AND
trust 40+), the rung (regional a full season: networkLiveDay + 30)
has passed, and no higher-priority shape's beat is pending/live —
then "The Founding Council" stages (pact/pool/walk). Peer
proposals need opinion 10+ first (the engine refuses below the
bar before judging, honestly, with no -5). A covenant link forms
at trust 30; `tendLink` pays 1,500 kcal → +8 trust weekly.

## The prior run (what this arm inherits)

- sim-onlylead-b DIAG (band 100401–100408, 150d): only the lead
  shape ever stages (5/8 armed, all sat); conquest/covenant/trade
  8/8 never attempted (0 proposeCovenant / proposeTrade /
  raidVillage calls by policy OR engine); belong split.
- Stage 2 covenant-road policy BUILT and PROVEN
  (scripts/policies/competent-covenant-b.js, test-covenant-b.js
  33/33 — RE-VERIFIED GREEN on this tip, 2026-11-15 1130Z run,
  before this prereg was written) but KILLED at smoke as
  SUBSTRATE-MISSING: the opinion probe (competent-only, 150d,
  seeds 100401/100402) showed max known-village opinion 2→4→6→8
  →10 over 150 days on BOTH seeds — opinion 10 only AT the
  horizon, so the first covenant beat is structurally past day
  175, beyond the 150d horizon. Pilot NOT spent. The policy,
  proof test, and driver extension were committed as proven
  instruments for a future arm — this arm.
- The 1055Z prereg reserved the confirm band 100421–100436, which
  "stays fresh and unused". This arm spends it as its PILOT band
  (100421–100428) per the coordinator's brief; the remainder
  (100429–100436) is held for confirm (see seed-band freshness).

## SUBSTRATE CHECK — the opinion-trajectory probe (§14b, FIRST)

Per the onlylead metric review #4, the staging bar is not frozen
until the substrate is proven to exist in-window. The probe ran
BEFORE this prereg was written: competent-only play (the substrate
the covenant policy inherits — covenantClimb adds no opinion;
prerequisite-refused proposes cost no opinion), 200d death-aware,
pilot seeds 100421 and 100422, max KNOWN-village opinion by day
(`Game.knowsVillage(v)`, the same gate the policy uses).
Instrument: scripts/opinion-probe-20261115.js (new).
Output: evidence/2026-11-15/onlylead2-b-opinion-probe.json.

| seed | d30 | d60 | d90 | d120 | d150 | d180 | d200 | first 10 | max ever | village end |
|------|-----|-----|-----|------|------|------|------|----------|----------|-------------|
| 100421 | 4 | 6 | 8 | — | — | — | — | never | 8 (d89) | LOST d93 |
| 100422 | 4 | 12 | 16 | 20 | — | — | — | d48 | 26 (d130) | LOST d135 |

The probe is SPLIT, and the split is the decision:

- 100422: substrate PRESENT, early and with slack — opinion 10
  first reached day 48, climbing to 26 by day 130; the village
  lived to day 135, i.e. 87 days of runway after the gate opened.
  A link formed ~day 48 seasons ~day 78; three links proposed
  one a day season together ~day 80–85, well inside 200d. The
  road is open in-window on this seed.
- 100421: substrate ABSENT — the village died day 93 with max
  known opinion 8, never reaching 10. No covenant beat could
  stage there at any horizon the village lived to see.

§14b decision: the STOP condition ("opinion 10+ is not reached
in-window on the probe") is NOT met — opinion 10+ WAS reached
in-window, at day 48 on 100422, with 87 days of runway. This is
materially different from the 1055Z kill, where BOTH probed seeds
reached 10 only AT the horizon. The pilot is NOT a foregone
conclusion: the outcome genuinely depends on how many of the 8
pilot seeds look like 100422 rather than 100421. The pilot RUNS.
The bar is NOT adjusted: it stays the Stage 2 G2 bar (≥3/8
covenant beats staged), now in-window — justified by the probe
(1/2 seeds substrate-positive with slack; ≥3/8 needs the pilot
band to run better than the probe's 1/2, which the pilot judges).
No judged numbers have been seen: the probe ran competent-only,
not the covenant leg, and no covenant-leg run exists yet.

## Seed-band freshness (verified BEFORE any judged sim)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
grep of EVERY dated prereg under evidence/ (evidence/*/sim-*-prereg.md),
plus evidence filenames and scripts/:

- PILOT BAND 100421–100428: the reserved confirm band from the
  1055Z prereg, named ONLY there as this arm lineage's own
  reservation ("100421–100436 stays fresh and unused"). No judged
  corpus exists on any of these seeds. The coordinator's brief
  directs the pilot onto 100421–100428. This prereg spends them
  as the pilot band.
- CONFIRM BAND 1 (first 8): 100429–100436 — the remainder of the
  reserved band. Per-seed grep: 100429–100435 appear in 0 prereg
  files; 100436 appears in 1 (sim-onlylead-b-prereg.md — the
  reservation range string itself). No judged corpus. UNUSED.
  This prereg names them as the first 8 confirm seeds.
- CONFIRM BAND 2 (second 8): 100441–100448 — 0 hits in all
  preregs, 0 hits in scripts/, 0 hits in evidence/2026-11-15/
  filenames. FRESH. This prereg names them as the second 8
  confirm seeds.
- Full confirm band (pilot GO only): 100429–100436 + 100441–100448
  (16 fresh seeds). No other band is named here; any other band
  needs its own freshness check in the confirm prereg amendment.

## Primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll + shape-candidate roll on all 16 configs
  (8 seeds × scaleclimb-baseline / covenant-armed), 0 instrument
  errors, EVERY staged beat classified by shape with sat/unsat,
  and UNCLASSIFIED ≤ 1 per 8 seeds on the covenant leg. Any
  instrument error, unclassified shape beyond the bar, or staged
  beat without a shape = NO-GO.
- G2 THE LEVER — GO iff on the covenant leg, COVENANT BEATS
  STAGED on ≥3/8 pilot seeds (baseline 0/8 — the DIAG's number;
  the bar is 3 because the road needs 3 seasoned links plus the
  rung, and a single staging proves the road opens while 3/8
  shows it reproduces) AND every staged covenant beat is
  answered 'pact' and sat (sat = the engine returns true and
  sets nationalLive). A miss on either half = NO-GO, never
  re-scored mid-run. Lead beats staged on the covenant leg are
  reported (expectation: 0 — the leg proposes no lead links); a
  lead staging would mean the isolation failed and the pilot is
  re-examined, not re-scored.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch
  diff and the proof tests are green (test-covenant-b.js 33/33,
  re-verified on this tip; test-onlylead2-b.js, new — the 200d
  staging instrument + determinism, GREEN before any landing).
  Any src/js change = NO-GO.

Cost bar (same as answercourt / Stage 2): starvation deaths
pooled covenant ≤ baseline + 2 AND median survival covenant ≥
0.8× baseline median. Guardrail (§14c): villager (non-scholar)
combat deaths are a co-primary read on every seed — the evidence
names any seed where covenant deaths exceed the before leg by
>50%.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SUBSTRATE PROBE (done, above): 2-seed opinion
  trajectory, competent-only, 200d. Substrate present in-window
  on 1/2 (100422, d48) — pilot proceeds.
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 200d
  death-aware, identical seeds, BOTH legs run fresh): the judged
  run. Horizon 200d because the first covenant beat is
  structurally ~day 175+ from a cold start on a slow-opinion
  seed and ~day 80–115 on a fast one (probe) — 200d covers both
  with slack, and dead villages stop simulating (+10d tail max).
  Seeds (exact literals): 100421, 100422, 100423, 100424, 100425,
  100426, 100427, 100428. Policies: competent-scaleclimb-b
  (baseline) vs competent-covenant-b (covenant road), identical
  seeds. The covenant leg is the judged leg; the baseline leg is
  the control.
- CONFIRM (16 seeds × 2 policies) ONLY on a pilot GO, on the
  fresh band 100429–100436 + 100441–100448 (verified above). A
  borderline pilot is reported as-is; the coordinator decides.
  Do NOT spend a confirm to rescue a NO-GO.
- DRIVER: scripts/onlylead-driver-20261115.js (extended — see
  instrument changes below; same recorder, same shape-candidate
  roll). Per-seed JSON to
  evidence/2026-11-15/perseed-onlylead2-b-control/ (baseline) and
  evidence/2026-11-15/perseed-onlylead2-b-on/ (covenant).
  Zero src/js.
- ANALYZER: scripts/analyze-onlylead-b.js (extended — see below;
  per-shape classification already covers covenant staging).
  Writes evidence/2026-11-15/onlylead2-b-analysis.json.
- BALANCED PANEL (§15): if the pilot is GO, a pseudo-panel
  compare is built for the record (answercourt precedent — the
  real balance-panel.js compare cannot judge a policy contrast);
  the preregged G2 bar is the judge. If the pilot is NO-GO, a
  panel is still built for the record (the 1055Z gorgeprice
  precedent — panel attached to the evidence either way when a
  judged sweep ran).
- ENV: defaults, matching the DIAG legs — COUNTER_ANSWER unset,
  COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset. No other
  env.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures —
  the driver observes the policies' own play; nothing is staged.

## Instrument changes (frozen BEFORE the pilot — all in this prereg)

Three small extensions to the proven instruments, all frozen
here, none tuned after the pilot runs:

1. ANALYZER NAMES ALL FAILING GATES (required improvement from
   the onlylead metric review #2): `classifyShape` gains an
   additive `blockers` array listing EVERY failing gate for the
   shape, not just the first. `blocker` (first gate, taxonomy
   order) is UNCHANGED for backward compatibility — the
   test-onlylead-b.js assertions still pass verbatim. Where it
   bites: belong on the best subordinate link — trust, arrears,
   age, and foreign-size are now evaluated independently and
   each failing one is named (100404's belong link fails arrears
   20,000 AND foreign size 3 < 4; 100408's fails arrears 5,000
   AND foreign size 0 — the DIAG named only arrears). For the
   qualified-but-never-staged branch, rung-gate and shadowing
   are both listed when both apply. Other shapes' gates are
   mutually exclusive by construction, so their `blockers` holds
   the single gate. The byShape rollup still counts the primary
   `blocker`; the evidence table reports the full list.
2. DRIVER DIR STEM: `dirFor` generalizes from the hardcoded
   `perseed-onlylead-b` / `perseed-covenant-b` ternary to
   `'perseed-' + RUN`, so RUN=onlylead2-b writes its own
   corpora dirs (perseed-onlylead2-b-control / -on) instead of
   colliding with the DIAG's perseed-onlylead-b-* dirs (the
   analyzer reads every .json in a dir — a shared dir would mix
   the DIAG and this arm's records). RUN=onlylead-b and
   RUN=covenant-b map exactly as before.
3. DRIVER linkLines CAP 600 → 900: the 600-line cap bound 13/16
   DIAG records at 150d; at 200d it would bind harder and could
   cut the played Founding Council lines the sense-testing needs
   (the beat, when it stages, lands ~day 80–175 — late in the
   stream). 900 keeps the same per-day line density as the
   150d/600 pairing, with margin. Recorded here so the cap
   change is an instrument decision, not a mid-run tune. If the
   cap still binds, the evidence notes it.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the staged beat + answer lines the driver captures and judge
whether the Founding Council reads like a played ceremony — AND
read the villager dialogue around the shapes that never stage: is
there any played line at all about a covenant, a charter, a
binding, or a conquest in the captured lines, or do the four roads
still exist only in the code? Judge meaning and coherence, never
just counts. In particular: do the other roads get played lines
NOW, on the covenant leg — the propose/counter/tend verbs and the
engine's refusal copy ("barely know Haven's name") — and does the
covenant courtship read like a relationship?

## Evidence

- Prereg: this file.
- Substrate probe: scripts/opinion-probe-20261115.js (new);
  output evidence/2026-11-15/onlylead2-b-opinion-probe.json.
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-scaleclimb-b.js (baseline) and
  scripts/policies/competent-covenant-b.js (covenant road).
- Driver: scripts/onlylead-driver-20261115.js (extended: dir
  stem + linkLines cap 900).
- Analyzer: scripts/analyze-onlylead-b.js (extended: `blockers`
  array — all failing gates per shape).
- Proof: scripts/test-onlylead2-b.js (new; static multi-gate
  classification + 200d game smoke + determinism);
  scripts/test-covenant-b.js (33/33, re-verified on this tip).
- Per-seed JSON: evidence/2026-11-15/perseed-onlylead2-b-control/
  (8 files) and evidence/2026-11-15/perseed-onlylead2-b-on/
  (8 files).
- Analysis: evidence/2026-11-15/onlylead2-b-analysis.json.
- Panel (pilot GO, and NO-GO for the record):
  evidence/2026-11-15/onlylead2-b-panel.*
- Evidence: evidence/2026-11-15/sim-onlylead2-b.md (per-seed
  per-shape tables with ALL failing gates, verb table, wall
  numbers, sense-testing, metric review).

## Convergence state

Covenant-road staging arm on a 200d horizon. The verdict is
GO / NO-GO against G1/G2/G3 above (pilot), plus confirm on GO.
If GO, the covenant policy lands as its own commit(s) — policy
+ evidence + tests; NO default flip, NO src/js change. If NO-GO,
evidence-only record; no game change. Killed arms leave no trace.
