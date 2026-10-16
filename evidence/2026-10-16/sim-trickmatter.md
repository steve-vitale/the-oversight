# sim-trickmatter — SELECTIVE fight-opening execution (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-trickmatter, axis scale-onramp (blocking).
**Type:** GAME-CODE arm. Tests the named next from evidence/2026-10-16/sim-fightopen.md
("mattering"): round-2 of sim-fightopen measured the full opener set (FIGHTOPEN=1) fixing
the gate/fight-shape mismatch (treatment cnm 0/7 vs control 95.2% on identical seeds) but
moving NOTHING on outcomes (resolutions 0/0) and breaching the median-survival guardrail
(−18d, s985-driven, n=8). The reunion opener is the strike-cost suspect: the novelty buys
mirror-wear delay, not damage, in 1–2 round damage races. The congregation opener is the
proven-positive-value keeper: beam prevention cashes out in round 1. This arm: SELECTIVE
openers — congregation keeps its round-1 opener, reunion's opener is DROPPED (the fighter
strikes round 1; the normal 2-strike novelty gate can still land later). editor /
cancellation / audit keep the landed default.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (canon drift noted in
sim-counterwire.md — doc is stale vs data: 56→72 defs, wave-4/5 roster drift; NOT rewritten
here). Trick fictions taken from each def's reveal text + the signature mechanics
(sigW4.js/sigW5.js) — never invented.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** does the selective (congregation-kept, reunion-dropped) opener cash out where
the full opener set didn't, and does dropping reunion's opener avoid the survival cost?

**PRIMARY (binding, GO iff BOTH hold):**
(a) beam-prevention resolutions ≥2 on the treatment arm over 8 fresh seeds — a resolution =
trick-attributed non-death outcome per the counterwire metric-review definition
(vKill with non-empty trickLog, OR mFlee/vFlee with ≥2 trick actions in the fight's
trickLog), RESTRICTED to the congregation pool and requiring 'argue' in the trickLog
(the cashing-out trick must actually cash out — the opener must have fired);
AND (b) treatment median survival ≥ control median −5d, where control = full-opener
FIGHTOPEN=1 on identical seeds (tests the reunion strike-cost hypothesis).

**SECONDARY:** conditions-never-met on opener-eligible w4/5 fights stays ≤40% on the
treatment arm (the fightopen fix holds in selective form).

**Guardrails:** national ≥ control−2 · no new death mode (no treatment-only death causes)
· wave reach not worse.

**Horizon:** 180d death-aware (the trick game lives late; fightopen learned d65–d148).
**Seeds:** 8 FRESH [990, 992, 993, 994, 995, 996, 997, 998] — verified 0 per-seed
filename/content hits across evidence/ before the run. **Policies:** leadfeast /
belongfeast (the tribfloor courtship-road stack). **Substrate:** pre-seat courtship —
SEATDRIVE=0 explicit, FEASTSCALE_R13=1, TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1,
WINPURSUIT=1, WINDEFER=1, NODEWITNESS=1. **Treatment:** FIGHTOPEN=1 +
FIGHTOPEN_SELECTIVE=1. **Control:** FIGHTOPEN=1 (full opener set, the landed default).
Identical seeds both arms (learning is flag-independent — confirmed identical in
sim-fightopen rounds 1 and 2).

**Enrollment rule (arm-coordinator addition, follows the sim-fightopen round-2 precedent —
sample-adequacy, NOT a metric change):** congregation wild learnings are rare (0 in
sim-fightopen's wild sample). If after the 8-seed pilot the treatment-arm congregation
post-learning field-fight count is < 4, enroll fresh seeds in batches of 4 (identical
seeds both arms) until the congregation pool reaches ≥4 or 16 seeds total, then judge (a).
(b), SECONDARY and guardrails are judged on the full pooled sample.

**Gates before spend:** proof RED→GREEN (scripts/test-trickmatter-20261016.js, 35/35:
unit selective/full split, negatives, DET-GATE byte-identical 40d pairs HEAD-bare vs
layer-both-flags-off, SMOKE synthetic fights with sense lines); node --check on new
scripts; no jest concurrency. [needs-eyes] on the commit — combat-feel change.

## The build (src/js/fieldFights.js ONLY — the landed FIGHTOPEN=1 block)

A FIGHTOPEN_SELECTIVE=1 classification inside the landed opener block (villagerTrickAction
~line 182): when selective mode is set, the reunion opener is skipped — the fighter
strikes round 1 and the normal 2-strike novelty gate (line ~343) can still land later.
congregation/editor/cancellation/audit keep the landed opener behavior. Cost parity holds:
the opening IS the round-1 action in both modes (no free strike anywhere). The
classification is deliberate and documented for overrule (Steve 2026-10-07): congregation
is the cash-out trick (beam prevention — proven positive value), reunion is the pure-cost
trick in damage races (0/7 resolutions round 2), the other three are unmeasured and keep
the landed default rather than being dropped without evidence.

## Results

### Pilot: 12 fresh seeds [990, 992–998, 999–1002] × 2 policies × 2 arms (48 runs, 180d death-aware) — KILLED AT PILOT

Per-seed JSONs: evidence/2026-10-16/perseed-trickmatter/ · judge:
scripts/analyze-trickmatter-20261016.js · sweep log:
evidence/2026-10-16/trickmatter-sweep.log.

Batch 1 (8 seeds) produced ZERO w4/5 post-learning field fights on both arms
(maxWave ≤3 on all 32 runs). Batch 2 (4 seeds, per the pre-registered enrollment
rule) added 4 fights: all 4 are nielsen (wave-5, non-opener species — the
already-firing boring gate), and the congregation pool stayed at 0 across all
48 runs. No opener-eligible fight (congregation/reunion/editor/cancellation/
audit) occurred anywhere. Enrollment stopped at 12 seeds, not 16: the blocker
is structural, not sampling noise (see below).

| metric | treatment (FIGHTOPEN=1 + SELECTIVE=1) | control (FIGHTOPEN=1 full) |
|---|---|---|
| runs | 24 | 24 |
| w4/5 post-learning field fights | 2 (both nielsen) | 2 (both nielsen) |
| congregation-pool fights | 0 | 0 |
| congregation resolutions (argue-fired) | 0/0 | 0/0 |
| conditions-never-met (opener pool) | 0/0 (n/a) | 0/0 (n/a) |
| median / max survival | 138d / 180d | 138d / 180d |
| national / table / won | 11/24 / 20/24 / 0/24 | 11/24 / 20/24 / 0/24 |
| wave-4 / wave-5 reached | 0/24 / 0/24 | 0/24 / 0/24 |

**Verdict vs pre-registration: KILLED AT PILOT (PRIMARY(a) NO-GO on an empty
pool).** 12 fresh seeds × 2 policies × 2 arms produced 0 congregation fights —
PRIMARY(a)'s ≥2 beam-prevention resolutions are unmeasurable, not failed.
PRIMARY(b) holds on the letter (138 ≥ 133) but is substantively vacuous: neither
arm ever fought a wave-4 reunion, so the reunion strike-cost hypothesis is
UNTESTED, not disproven. Per §14 this is INCONCLUSIVE → NO-GO on the binding
PRIMARY, hence kill, not confirm. SECONDARY has no pool (n/a). Guardrails all
OK (no treatment-only death causes; national 11 ≥ 9; wave reach 0 = 0).

**Why the pool is empty — the structural blocker:** commit ebcdf397 ([needs-eyes]
combat readiness gates wave unlocks, design call #4, landed 2026-10-16 19:52
UTC — BEFORE sim-fightopen's sweep) replaced the faced-experience bar with
waveCombatReadiness(): wave 4 releases only when the village is combat-ready —
4 fighters armored P≥15, 5 armed, 3 counters known, veterans with wave-3 kills
(standing.js, sim starting points, Steve can overrule). On the pre-seat
courtship substrate 0/48 runs met the readiness bar (maxWave ≤3 on every run).
sim-fightopen's round-2 seeds (983–986) cleared it; these 12 seeds did not —
the readiness gate makes wave-4+ seed-conditional on this substrate, and my
draw was 0/12. The w4/5 trick game (the entire fightopen/mattering axis) is
currently UNMEASURABLE on this substrate without a readiness-satisfying
channel. The two nielsen fights that did land show the already-firing boring
gate working identically on both arms (treatment and control transcripts are
byte-identical on the same seed — learning is flag-independent, confirmed
again).

**The game code is REVERTED zero-trace** (patch preserved at
~/workspace/trickmatter-backup/fieldFights-selective-final.patch for the
record). This commit lands evidence + instruments only.

## Village assessment

The villages of this draw never became combat-ready, so there is no trick-
fight village to assess — and that IS the assessment. Twelve villages grew to
national (11/24 runs), learned wave-3 tricks (spool, buffering), and hit wave
3 by mid-game — then stopped. No armor stacked, no weapons reached hands, no
wave-3 veterans emerged, so the readiness gate held wave 4 shut on every
single one. On this substrate the ceiling is now wave 3: the readiness gate is
doing exactly what Steve's design call asked (no village gets promoted into a
war it can't fight), and the side effect is that nothing past wave 3 is
reachable — including all five opener species. The scale-onramp axis now has a
new load-bearing blocker upstream of tricks: readiness. Until villages arm,
the mattering arm has no battlefield.

Who thrived: nobody past wave 3 — the runs died village-lost on 24/48 (median
138d) and survived on 12/48, identically on both arms. Who died: standard
wall causes (no treatment-only death modes — guardrail OK).

## Sense-reads (SENSE-TESTING LAW)

No opener-eligible transcripts existed to read (0 congregation/reunion/editor/
cancellation/audit fights). The one trick fight in the sample (leadfeast-s1000,
nielsen vs boring gate, 4 fights across arms) shows the already-firing gate
behaving identically on both arms — transcripts byte-identical on the same
seed. Nothing robotic, nothing to judge for meaning on the opener axis. The
SMOKE section of the proof test carries the only selective-opener transcripts
(congregation argues theology and the beam never falls; the reunion fighter
strikes round 1 instead of reciting the poem) — synthetic, read, coherent.

## Metric review (§14)

- **PRIMARY(a) judged NO-GO (binding), recorded as INCONCLUSIVE-by-empty-pool.**
  The ≥2-resolution bar was not missed by the lever — the pool never existed.
  This is not a re-score: the metric stood, the measurement channel was shut.
- **PRIMARY(b) GO on the letter is vacuous** and is reported as such, not as
  evidence for the strike-cost hypothesis. Neither arm ever fought the
  reunion with an opener (selective) or without one (full) in a wild fight.
  The hypothesis stands untested.
- **The enrollment rule (8 + 4 seeds) was honored; I stopped at 12, not 16.**
  The rule assumed congregation-rare; the blocker is readiness-structural.
  Throwing 4 more seeds at a gate that held 48/48 would be compute, not
  measurement. This judgment call is documented here for overrule.
- **Proposed for the NEXT run on this axis:** any wave-4+ trick-execution arm
  needs a readiness-satisfying substrate first (a policy that arms 4+ fighters
  and banks wave-3 kills — or a channel that bypasses the readiness gate by
  design). Do not re-run trick sweeps on the pre-seat courtship substrate
  until wave-4 unlocks are demonstrated on it.
- sim-fightopen stands: PRIMARY-GO / SECONDARY-MISS with one guardrail breach
  (that arm measured under the same readiness gate on luckier seeds).

## Convergence state

scale-onramp: **parked-on-blocker** (game-code arm — selective opener BUILT,
proven correct 35/35, and KILLED at pilot: the w4/5 trick game is unmeasurable
on the pre-seat courtship substrate under the combat-readiness gate; the
readiness gate itself is now the load-bearing blocker for everything past wave
3). The selective-openers hypothesis (congregation keeps, reunion drops) is
preserved as a patch + proof + instruments, ready to re-run when the channel
opens — not disproven, just never fought.

## Per-seed JSONs

evidence/2026-10-16/perseed-trickmatter/ (48 runs: 12 seeds × {leadfeast,
belongfeast} × {treatment,control}; numeric wall-metric keys
national/table/won/wins/exiled) · beats:
evidence/2026-10-16/trickmatter-beats/ (say beats + trick-fight logs for
sense-reads) · sweep log: evidence/2026-10-16/trickmatter-sweep.log

## Proof artifacts

- scripts/test-trickmatter-20261016.js — proof: 35/35 GREEN (RED: HEAD ignores
  the selective flag, full opener fires all five; GREEN selective: congregation/
  editor/cancellation/audit open, reunion dropped; GREEN full: all five open,
  landed default preserved; DET-GATE byte-identical 40d pairs HEAD-bare vs
  layer-both-flags-off; SMOKE synthetic fights with sense lines). The layer
  was REVERTED after the kill (patch at ~/workspace/trickmatter-backup/
  fieldFights-selective-final.patch) — the proof documents the classification,
  not landed code.
- scripts/sweep-trickmatter-20261016.js — the pilot sweep (execensus instrument
  reused; FIGHTOPEN/FIGHTOPEN_SELECTIVE toggled per arm in-process)
- scripts/analyze-trickmatter-20261016.js — the judge (PRIMARY(a)/(b),
  SECONDARY, guardrails)

## Blank-fill record

- FILLED (code, then REVERTED per kill protocol): selective fight-opening —
  congregation-kept, reunion-dropped cash-out classification (fieldFights.js
  FIGHTOPEN block only; patch preserved under ~/workspace/trickmatter-backup/)
- FILLED (measurement): proof 35/35 (real RED→GREEN, det-gate byte-identical,
  SMOKE); 48-run pilot across 12 fresh seeds with analyzer verdict KILLED
- DOCUMENTED (not fixed — the next arm on this axis): the combat-readiness
  gate holds wave 4 shut on the pre-seat courtship substrate (0/48 runs) —
  any wave-4+ trick-execution measurement needs a readiness-satisfying
  substrate first. Logged to hidden_files/sim-findings.md.
- Note: check.js --quick on this tree: 94 passed, 3 failed — the 3 failures
  are pre-existing in scripts/test-table-trial-fire-20261012.js
  (Game.tableTrialResume is not a function), verified failing on the pristine
  HEAD file too, unrelated to this arm.

## Metric review (§14)

(Every evidence file carries this section. Metric doubts go here; revisions apply to the
NEXT run, never mid-run.)
- The PRIMARY(a) resolution bar (≥2) is set knowing congregation learnings are rare;
  the enrollment rule above is the pre-registered response to n=0, not a mid-run rescue.
- ROUND-2 of sim-fightopen stands: PRIMARY-GO / SECONDARY-MISS with one guardrail breach.
  This arm does not re-score it.

## Convergence state

(PENDING)

## Per-seed JSONs

(PENDING — evidence/2026-10-16/perseed-trickmatter/; beats: evidence/2026-10-16/trickmatter-beats/)

## Proof artifacts

- scripts/test-trickmatter-20261016.js — proof: 35/35 GREEN (RED: HEAD ignores the
  selective flag, full opener fires all five; GREEN selective: congregation/editor/
  cancellation/audit open, reunion dropped; GREEN full: all five open, landed default
  preserved; DET-GATE byte-identical 40d pairs; SMOKE synthetic fights with sense lines)
- scripts/sweep-trickmatter-20261016.js — the pilot sweep (execensus instrument reused:
  attachExecensusCapture + classifyLearning; FIGHTOPEN/FIGHTOPEN_SELECTIVE toggled per
  arm in-process)
- scripts/analyze-trickmatter-20261016.js — the judge (PRIMARY(a)/(b), SECONDARY,
  guardrails)

## Blank-fill record

- FILLED (code): selective fight-opening — congregation-kept, reunion-dropped cash-out
  classification (fieldFights.js FIGHTOPEN block only)
- FILLED (measurement): proof 35/35 (real RED→GREEN, det-gate byte-identical, SMOKE)
- PENDING: 8-seed pilot sweep + analyzer verdict
