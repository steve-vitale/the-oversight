# H1 transplant — REDEFINED family-7 ablation: UNMEASURED-substrate (gate STOP)

Run: fleshout-20261115T1215Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant7redef-a` (worktree `~/workspace/worktrees/sim-transplant7redef-a`).
Binding prereg: evidence/2026-11-15/sim-transplant7redef-prereg.md — read it in full;
it binds every step below. Nothing in it was re-judged or re-defined here.

## Verdict: UNMEASURED-substrate (baseline gate STOP — do NOT re-judge family 7)

The baseline leg on the fresh band 190581–190588 survived **3/8** — above the
pre-registered PROCEED range (0–2/8). Per the prereg gate (7brain polarity):
baseline survived ≥3/8 → STOP, report UNMEASURED-substrate, do NOT cut a
subject. **No subject branch was cut. No subject leg ran. No survival delta
exists to judge.** Family 7's brain-side align step remains UNMEASURED — the
collapse regime it was to be tested in is gone on this band on current master
(the question is live only in the collapsed regime, and this band reads
healthier than the matched band did: 3/8 survived vs the merge's 1/8).

## Prereg header (binds the run)

- Primary metric: survived/8 on the subject leg MINUS the baseline leg
  (≥+2 CARRIER, ±1 NOT-CARRIER, ≤−2 INVERTED). **Not judged — no subject leg.**
- GO threshold: baseline survived 0–2/8 → PROCEED; ≥3/8 → STOP UNMEASURED-substrate.
- Horizon: 150d death-aware (dead villages stop simulating; +10d tail max).
  Why: the question is survival collapse in the wave/door window (deaths come
  at the door/waves on day 43+); 150d covers waves 4–5 and the table window
  without simulating dead villages.
- Seeds: fresh band 190581–190588 (verified fresh in the prereg; 0 prereg hits).
- Policies: competent verbatim own-policy (`competent.js`, sha
  `74a890f0844e`), fix standing swapped in every step, native standing
  restored byte-identical afterwards (sha-verified `f9359976...`).
- Mode: `fix` only. Step ids: sniff `ep-tip-7redef-sniff`, baseline `ep-tip-7redef`.

## Base + rebase (task step 1)

- Registered base `1ca2c257d`; master tip at adoption `b0b171cc8`
  (`b0b171cc8ed67122e9133ea4692d0208b49d63d8`, sim-onlylead2-b evidence).
  Diff `1ca2c257d..b0b171cc8`: 38 files, evidence + scripts only —
  **NO `src/js` and NO `scripts/policies/` file touched** (equivalence rule
  passes). `1ca2c257d` is an ancestor of `b0b171cc8`, so the rebase was a
  clean fast-forward; arm branch rebased to `c2e67ed00` on `b0b171cc8`.
- Proof re-run after the rebase: **108/108 green** — no stale base-state
  guard leg. The one leg the rebase DOES stale is the §9 anchorCommit
  check (see "Proof adjudication" below): the legs ran on the rebased tip
  `b0b171cc8`, so per-seed `anchorCommit` reads `b0b171cc8ed6`, not the
  prereg's registered base `1ca2c257d1d6b`. That is a bookkeeping artifact
  of the rebase, not a substrate change — the equivalence rule (no src/js
  or policy diff between the two commits) means the sim behavior is
  byte-identical on either commit. The proof was NOT edited to force
  green; the failing leg is adjudicated, not waived.

## Sniff (task step 2) — band healthy, PROCEED-TO-BASELINE

4-seed sniff, seeds 190581–190584, STEP `ep-tip-7redef-sniff`, on `b0b171cc8`:

| seed | days | end | maxWave | standing | rank |
|---|---|---|---|---|---|
| 190581 | 150 | survived | 5 | 640 | regional |
| 190582 | 76 | village-lost | 4 | 199 | regional |
| 190583 | 149 | village-lost | 4 | 199 | regional |
| 190584 | 99 | village-lost | 4 | 199 | regional |

1/4 survived; none died before day 30 → PROCEED-TO-BASELINE (not
INVESTIGATE). The sniff seeds re-ran identically inside the baseline leg
(deterministic sims, same result expected — confirmed: 150/76/149/99d).

Tooling note: the redefined analyzer refuses a 4-seed input
(`SEEDS must name exactly 8 seeds`), so **no sniff summary exists** — the
sniff verdict above is read directly from the 4 per-seed files in
`evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-7redef-sniff/`. This is
a step-script/analyzer limitation, not a data gap. The proof's §9 sniff
block is skipped when no sniff summary exists.

## Baseline leg (task step 3) — survived 3/8, GATE STOP

STEP `ep-tip-7redef` on `b0b171cc8`, seeds 190581–190588, 150d death-aware,
competent verbatim own-policy, fix standing swapped in, native restored
byte-identical afterwards (sha `f9359976...` verified after the leg).
Summary: `evidence/2026-11-13/culpritbisect-a-ep-tip-7redef-summary.json`;
per-seed corpora: `evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-7redef/`.

| seed | days | end | maxWave | standing | rank | won | errors |
|---|---|---|---|---|---|---|---|
| 190581 | 150 | survived | 5 | 640 | regional | no | 0 |
| 190582 | 76 | village-lost | 4 | 199 | regional | no | 0 |
| 190583 | 149 | village-lost | 4 | 199 | regional | no | 0 |
| 190584 | 99 | village-lost | 4 | 199 | regional | no | 0 |
| 190585 | 150 | survived | 5 | 300 | regional | no | 0 |
| 190586 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190587 | 144 | village-lost | 5 | 275 | regional | no | 0 |
| 190588 | 102 | village-lost | 4 | 125 | regional | no | 0 |

**Survived 3/8 → GATE STOP (UNMEASURED-substrate).** Instrument errors 0 on
all 8 seeds. All rows carry fix standing (`f8fda4295a99`) + base policy
(`74a890f0844e`); anchorCommit `b0b171cc8ed6` (rebased tip — see above).

## Wall numbers (every run)

- national 0/8, table 0/8, wins 0/8, wave-5 unlocks 3/8, wave-4 unlocks 8/8,
  median survival 149d, deaths 730, standing range 125–640.
- Rank read: regional 8/8 → **REGIONAL_INTACT** (≥5/8 band). Every village
  reached regional; none reached national. The wall is intact at the
  regional→national step, but the survival collapse itself is NOT present
  on this band: 3/8 villages live to day 150.
- Death-cause shares (730 deaths): villager combat 259 (35%), expedition
  197 (27%), combat 144 (20%), the wild 66 (9%), monster 13, a wound that
  wouldn't close 9, sickness 9, starvation 7, a stranger 7, contest 6,
  ambush 4, thirst 3, dehydration 2, alien 1, The Redactor 1, the arena 1,
  wound_fever 1. Villages die fighting and on expeditions, not hungry:
  starvation 7/730 (1%).
- Blooded: 2/8 villages (tribute ready on 190581: military tribute,
  2 veterans, payable 1 of need 2).

## Village assessment (plain words)

Three of eight villages live to day 150 — a healthier band than the
matched band the collapse was measured on. The five that die, die late
(days 76–149) at wave 4–5, fighting: the door and the waves still kill,
but a third of villages now hold. Every village reaches regional
standing; none reaches national, and none sits at the table. The
regional→national on-ramp is still the wall — but the survival floor
under it has risen on this band, so the align-step question (which needs
a collapsed baseline to be live) cannot be answered here. Seed 190581 is
the strongest village: survived 150 days, wave 5, standing 640, pantry
11,208 kcal at the end, tribute-ready. Seed 190588 is the weakest:
dead day 102, standing 125.

## Family-test legs (baseline only — no subject exists)

- Honesty test `scripts/test-dawn-materialize-honesty.js` (formal baseline
  run, after the prereg commit): **exit 0, pass:true** —
  `{"pass":true,"seed":20261108,"materializeNeqCommit":0,"honest":{"materialize":"HAVEN_CHORE","commit":"HAVEN_CHORE","override":"win_plan:gear_hold","corePick":"HAVEN_CHORE","purpose":"chore","chore":"repair","indoor":true},"controlMismatch":true,"depart":"hold"}`
  — byte-identical to the prereg's expected baseline output. On the
  baseline the live objective honestly matches the dawn commitment.
- Targeted align test `scripts/test-transplant7redef-align.js`, all 4 pinned
  cases, live on the baseline tree — **all fire align-ACTIVE** (exit 0):
  gear_hold (seed 20261109, gen_2ut3alf): core VISIT → HAVEN_CHORE;
  expedition (seed 20261109, diana_osei): core HAVEN_CHORE → EXPEDITION;
  duty (seed 20261108, gen_wco817u): core HAVEN_CHORE → FORAGE;
  assign (seed 20261108, gen_wco817u): core HAVEN_CHORE → FORAGE.
  The align step is live on this substrate — it is the substrate (the
  collapsed regime), not the instrument, that is missing.
- The subject-side family tests were NOT run: no subject exists (gate STOP
  forbids cutting one). The prereg's expected subject polarity (honesty
  exit 1 'materialize≠commit'; all 4 align cases at core pick) is
  untested and stays a prediction.

## Sense-testing (vetSays narration, baseline corpus only)

216 vetSays lines across 8 seeds, 209 distinct — the narration is
overwhelmingly event-driven and specific, not templated filler. What
villagers actually do and say:

- Door fights are narrated with named people and real outcomes:
  "🛡️ Giulia, Ursula and Greta met them at the door — 3 put down.
  Giulia, Ursula, Greta are hurt." / "🛡️ Giulia, Ursula, Greta and
  Elijah met them at the door — 3 put down, 1 barely walked away."
- Veteran kills get a named, on-camera call-out, varying by person and
  beast: "📺 SYSTEM: \"Oh — OH. Everybody saw that, right? Giulia just
  put down Ugly-Eyes... on CAMERA. That's a veteran kill, folks.
  REMEMBER the name.\"" (same template for Ursula/Spool, Dale/The
  Herald, Nikos/The Ugly Beast, Giulia/Big Big — the template repeats,
  the names and beasts change, which reads as a broadcast formula
  rather than a robot repeat).
- The System's wave-3 arrival line is coherent and menacing: "📺 \"Oh,
  you survived the AUDIENCE NOTES? Cute. We've stopped pretending
  these are animals now. That was the FINAL DRAFT, folks — what comes
  out of the treeline next was never alive the way you mean it.\""
  It repeats 5× (once per seed that reaches the wave — same day 25,
  same event), which is the same event firing per village, not
  within-village repetition.
- Arc IV lands: "◈ ARC IV — THE INEFFICIENCY. SYSTEM: \"ROUNDING ERROR
  RECLASSIFIED: ANOMALY. Organic consumption yields impossible
  output.\"" and the finale gate is voiced: "◈ SYSTEM: \"Four waves.
  FOUR. The producers are — okay, I'm saying it: FINALES need a
  NATION. You've got a region; now mak[e it a nation]...\""
- Elder veterans are flagged before the fight: "⚠ This one is
  different — old, patient, unhurried — it has seen your kind before.
  An Elder veteran." followed by blow-by-blow ("Nikos strikes the
  Elder The Big Beast." / "The Elder The Big Beast falls.").
- Blooded is announced when earned: "Blooded — the village knows where
  the Producers bleed. (Strikes hit 1.5× as hard; their blows land at
  0.75× strength.)"

Flag (minor, pre-existing, not this arm's to fix mid-run): one door-fight
line renders a villager as "Aria, the person in their 60s" — a name
followed by an age-description where other villagers get just a name
("Bao", "Jana"). It reads like a missing-name fallback leaking into
narration. Appended to the findings backlog as an observation, not
chased (outside this arm's axis).

No subject corpus exists, so no baseline-vs-subject narration comparison
was possible.

## Telemetry deviation check

Attempted per the loop body step 10:
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-7redef/*.json' --metrics national,table,wins,exiled`
→ **REFUSED**, exactly as the prereg predicted for this recorder-corpus
class: "telemetry-check: refusing recorder-corpus input: all 8 --current
rows carry top-level anchorCommit, so they are sweep recorder rows, not
runs. Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." Recorded, not waived; **the baseline was
NOT rolled**. No LOUD lines to investigate (the tool refuses before
comparing).

## Proof adjudication (two stale legs — adjudicated, not edited)

The final proof run (`node scripts/test-transplant7redef.js`) reports
**110 passed, 2 failed**. Both failures are adjudicated below; neither
touches the verdict. The proof was NOT edited to force green.

1. §9 baseline anchorCommit leg ("baseline per-seed anchorCommit is the
   base 1ca2c257d"): per-seed rows carry `b0b171cc8ed6` because the legs
   ran after the task-ordered rebase onto the current master tip. The
   proof's BASE constant still names the registered base `1ca2c257d`.
   This leg is stale BY DESIGN once the base moves (the task brief
   anticipates exactly this): the equivalence rule was verified before
   the rebase (diff `1ca2c257d..b0b171cc8` touches no `src/js` and no
   `scripts/policies/`), so the sim substrate is byte-identical on
   either commit and the leg's intent — "the baseline ran on the
   intended substrate" — is satisfied by the equivalence check, not by
   the sha string.
2. §9 "INTERMEDIATE STATE: baseline gate is PROCEED" leg: the proof
   models `baseline-only` as always an intermediate state (a STOP would
   have ended the run "here"), but a gate STOP terminally ends the run
   in exactly that stage — baseline summary present, subject summary
   absent, no subject branch. The proof's own gate-STOP assertions in
   the same section pass ("gate STOP: no subject branch exists", "gate
   STOP: no subject summary exists", and "baseline gate verdict is
   STOP-UNMEASURED (survived 3/8)"). The failing leg contradicts the
   proof's own STOP handling — a proof-model gap for the terminal
   gate-STOP state, not a data problem. The gate classifier reads
   STOP-UNMEASURED correctly.

The verdict (UNMEASURED-substrate) does not depend on either leg: it
follows from the pre-registered gate applied to the baseline summary's
survived count (3/8), which the proof's gate classifier reads
correctly. The remaining 110 legs pass, including the gate classifier,
the sniff verdict mapping, the family-test staging (§7), and the
stage-aware corpus guards (§9).

## Incidents

- **Step-script restore bug (struck twice — sniff + baseline):** after
  the analyzer writes the summary, `scripts/transplant7redef-step.sh`
  deletes its tooling scratch (`scripts/culpritbisect-driver-20261113.js`,
  `scripts/masterregress-analyze-20261113.js`,
  `scripts/vetfirst-instrument-20261111.js`) — but those files are
  TRACKED at the detached step commit, so the delete leaves the tree
  dirty and the script's own final clean-tree check fails with
  "TRANSPLANT7REDEF STEP FAIL: tracked tree dirty after restore".
  The sims and summaries themselves completed fine both times; the
  failure is purely the script's restore step. Recovered both times
  with `git checkout -- <the 3 files>` + `git checkout
  sim-transplant7redef-a`, then verified `src/js/standing.js` sha
  `f9359976...` (native, byte-identical) before continuing. No data
  lost, no commit affected. Owed fix (not this arm's — the script is
  stage-1 tooling on this branch): the step script should restore the
  scratch from the step commit (`git checkout <commit> -- <files>`)
  instead of deleting tracked files, or restore scratch to a scratch
  dir outside the tracked tree.
- **No write flap** during this run (the prereg's earlier ~20-min flap
  window was before adoption; all writes in this run succeeded first
  try). No safe-commit index clobber on this run's commit (verify at
  commit time).
- **No subject branch exists.** `transplant-7redef-subject` was never
  cut (gate STOP). Verified absent at evidence time.

## Metric review (§14)

- The metric set held: the gate is a range (0–2 PROCEED / ≥3 STOP) and
  the baseline read 3/8 — one survivor over the line, unambiguous, no
  re-scoring needed. The sniff rule (all 4 dead before day 30 →
  INVESTIGATE) also held: 1/4 survived to day 150, so the band is
  healthy.
- Revision proposed for the NEXT run, not this one: the gate's
  sensitivity to a single seed (3/8 vs 2/8 flips the whole arm) means a
  fresh band that reads 3/8 on a collapsed regime is plausible by seed
  noise alone — a future redefined-family arm should consider a
  12-seed baseline or a 2–3 PROCEED-with-caution band before declaring
  the regime gone. Recorded here; the prereg's gate binds THIS run and
  was honored.
- The analyzer's 8-seed-only requirement means the 4-seed sniff can
  never produce a summary — a future step script should either allow
  the analyzer to read 4 seeds or write the sniff verdict from the
  per-seed files directly.

## Commits on this branch

- `c2e67ed00` H1 transplant 7redef: prereg + proof stage 1 (108/108) +
  fresh-band analyzer/step + align test (rebased onto `b0b171cc8`)
- (this commit) H1 transplant 7redef: UNMEASURED-substrate — baseline
  3/8 gate STOP, evidence + corpora + panel N/A (no subject)

## Findings backlog

- [open] 2026-11-15 — narration — door-fight line renders a villager as
  "Aria, the person in their 60s" (name + age-description) where other
  villagers get just a name; likely a missing-name fallback leaking
  into vetSays narration (baseline corpus seed 190581, day 7).
  (sim-transplant7redef evidence.)

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change to the live game; the before/after
comparison IS the boundary pair (master tip vs subject) on identical
seeds — and no subject was cut, so there is no pair to compare. Same
standing as masterregress §7.
