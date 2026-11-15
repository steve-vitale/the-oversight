# H1 transplant — REDEFINED family-7 ablation on the MATCHED band: UNMEASURED-substrate (gate STOP)

Run: fleshout-20261115T1515Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant7redef-match-a` (worktree `~/workspace/worktrees/sim-transplant7redef-match-a`).
Binding prereg: evidence/2026-11-15/sim-transplant7redef-match-prereg.md — read it in full;
it binds every step below. It supersedes the 1215Z prereg on BAND ONLY
(matched 190391–190398 instead of fresh 190581–190588) and records the base
move (1ca2c257d → b4343ac9d) and the step-script #2381 fix. Nothing in it was
re-judged or re-defined here.

## Verdict: UNMEASURED-substrate (baseline gate STOP — do NOT re-judge family 7)

The baseline leg on the matched band 190391–190398 survived **8/8** — far above
the pre-registered PROCEED range (0–2/8). Per the prereg gate (7brain polarity):
baseline survived ≥3/8 → STOP, report UNMEASURED-substrate, do NOT cut a
subject. **No subject branch was cut. No subject leg ran. No survival delta
exists to judge.** Family 7's brain-side align step remains UNMEASURED — and
this time the collapse regime is gone even on the matched band, on the current
tip: all eight villages live to day 150. The merge's collapsed 1/8 read on
these seeds was a PRE-GUARD substrate read; the CASCADE lingerer guard
(dc8cbd3f3, landed after the 1215Z baseline) removes a scholar-death path the
commit message itself cites at 38/88 scholar deaths in its control pilot, and
is the leading mechanism for the lifted floor (see §Base + substrate change
and §Metric review). The gate still binds exactly as written — a STOP is a
STOP, no re-judgment, no re-scoring.

## Prereg header (binds the run)

- Primary metric: survived/8 on the subject leg MINUS the baseline leg
  (≥+2 CARRIER, ±1 NOT-CARRIER, ≤−2 INVERTED). **Not judged — no subject leg.**
- GO threshold: baseline survived 0–2/8 → PROCEED; ≥3/8 → STOP UNMEASURED-substrate.
- Horizon: 150d death-aware (dead villages stop simulating; +10d tail max).
  Why: the question is survival collapse in the wave/door window (deaths come
  at the door/waves on day 43+); 150d covers waves 4–5 and the table window
  without simulating dead villages.
- Seeds: MATCHED band 190391–190398 (deliberate reuse, authorized by the
  1415Z coordinator decision (1); per-seed prereg hits 92/14/19/12/15/14/11/92).
- Policies: competent verbatim own-policy (`competent.js`, sha
  `74a890f0844e`), fix standing swapped in every step, native standing
  restored byte-identical afterwards (sha-verified `f9359976...`).
- Mode: `fix` only. Step ids: sniff `ep-tip-7redef-match-sniff`, baseline
  `ep-tip-7redef-match`, subject `t7redef-match` (never used).

## Base + substrate change (task step 1)

- Registered base `b4343ac9d` (`b4343ac9da902370ffc44f58423e6e83c9dbfe23`,
  "sim-scale-onramp-round-1415: coordinator evidence"). Master tip at run
  start IS `b4343ac9d` — the arm branch sits at the tip, so NO rebase was
  owed at adoption and none happened. The arm branch's one unique commit at
  run start is the prereg commit `82609601e` (this arm's own work).
- The ablation set was RE-VERIFIED at `b4343ac9d` before any sim: align
  function still `villager-brain.js:892-1006` (115 lines, 4 branches),
  single game-code caller still `finishLottery` (`villager-objectives.js:682-683`),
  the 5 removed lines still match verbatim at `villager-objectives.js:680-687`.
  The hunk matched, so the arm proceeded — no improvised ablation set.
- Substrate change since 1215Z, recorded in the prereg before any leg: the
  diff `1ca2c257d..b4343ac9d` touches ONE `src/js` file — `src/js/game.js`,
  +16 lines, the CASCADE lingerer guard (`dc8cbd3f3`, "lingerer holds the
  treeline"). It is NOT an ancestor of `b0b171cc8`, so the 1215Z baseline
  ran WITHOUT it and this baseline runs WITH it. No other `src/js` file
  and no `scripts/policies/` file differs between the two bases. Standing
  (`f9359976...`) and policy (`74a890f0...`) shas are IDENTICAL at both
  bases (verified by this arm).
- Family identity re-verified at run start: merge `23245d5d6` IS an ancestor
  of `b4343ac9d`, is NOT an ancestor of the far end `203a32775`, second
  parent `a038cf151` is 1 commit, merge diff is 6 files (brain 56/3,
  objectives 19/7, no policies).

## Sniff (task step 2) — band healthy, PROCEED-TO-BASELINE

4-seed sniff, seeds 190391–190394, STEP `ep-tip-7redef-match-sniff`, on `b4343ac9d`:

| seed | days | end | maxWave | standing | rank |
|---|---|---|---|---|---|
| 190391 | 150 | survived | 5 | 380 | regional |
| 190392 | 150 | survived | 4 | 199 | regional |
| 190393 | 150 | survived | 4 | 199 | regional |
| 190394 | 150 | survived | 5 | 490 | regional |

4/4 survived; none died before day 30 → PROCEED-TO-BASELINE (not
INVESTIGATE). The sniff seeds re-ran identically inside the baseline leg
(deterministic sims, same result expected — confirmed: 150/150/150/150d,
same waves, same standing).

Tooling note: the redefined analyzer refuses a 4-seed input
(`SEEDS must name exactly 8 seeds`), so **no sniff summary exists** — the
sniff verdict above is read directly from the 4 per-seed files in
`evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-7redef-match-sniff/`.
This is a step-script/analyzer limitation, not a data gap. The proof's §9
sniff block is skipped when no sniff summary exists.

## Baseline leg (task step 3) — survived 8/8, GATE STOP

STEP `ep-tip-7redef-match` on `b4343ac9d`, seeds 190391–190398, 150d death-aware,
competent verbatim own-policy, fix standing swapped in, native restored
byte-identical afterwards (sha `f9359976...` verified after the leg).
Summary: `evidence/2026-11-13/culpritbisect-a-ep-tip-7redef-match-summary.json`;
per-seed corpora: `evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-7redef-match/`.

| seed | days | end | maxWave | standing | rank | won | errors |
|---|---|---|---|---|---|---|---|
| 190391 | 150 | survived | 5 | 380 | regional | no | 0 |
| 190392 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190393 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190394 | 150 | survived | 5 | 490 | regional | no | 0 |
| 190395 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190396 | 150 | survived | 5 | 290 | regional | no | 0 |
| 190397 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190398 | 150 | survived | 5 | 295 | regional | no | 0 |

**Survived 8/8 → GATE STOP (UNMEASURED-substrate).** Instrument errors 0 on
all 8 seeds. All rows carry fix standing (`f8fda4295a99`) + base policy
(`74a890f0844e`); anchorCommit `b4343ac9da90` (the base tip — no rebase
happened, so no anchor bookkeeping artifact this run).

Per-seed readiness (from the per-seed files): wave-4 ready 5/8 (190392,
190393, 190396, 190397, 190398); wave-5 ready only 1/8 (190396 — the only
village with 2 living veterans at the end). The binding gap for wave 5 is
veterans: 6/8 villages are short on veterans (0–1 living), and weapons on
3/8. Blooded 5/8. Tribute ready 1/8 (190396, military tribute, 2 veterans,
payable 1 of need 2). End pantry: 0, 700, 3000, 0, 3772, 4400, 8739, 9613
kcal — two wave-5 villages (190391, 190394) end at 0 kcal: they live
hand-to-mouth at the end, surviving but with no buffer.

## Wall numbers (every run)

- national 0/8, table 0/8, wins 0/8, wave-5 unlocks 4/8, wave-4 unlocks 8/8,
  median survival 150d, deaths 593, standing range 199–490.
- Rank read: regional 8/8 → **REGIONAL_INTACT** (≥5/8 band). Every village
  reached regional and survived; none reached national, and none sits at
  the table. The wall is intact at the regional→national step — but the
  survival collapse itself is NOT present on this band on this tip: 8/8
  villages live to day 150.
- Death-cause shares (593 villager deaths — individual villagers dying
  while their villages persist, not village deaths): villager combat 255
  (43%), combat 179 (30%), expedition 86 (15%), the wild 35 (6%), monster
  14, the arena 8, starvation 3 (0.5%), Gavel 3, contest 2, ambush 2,
  thirst 1, the night 1, lockjaw 1, a stranger 1, The Paparazzo 1, alien 1.
  Villages lose people fighting and on expeditions, not hungry:
  starvation 3/593 (0.5%).

## Village assessment (plain words)

All eight villages live to day 150 — the healthiest matched-band read on
record, and a complete reversal of the merge's collapsed 1/8 on these same
seeds. Nobody's village dies; instead every village reaches regional
standing, four unlock wave 5, and one (190396) is wave-5 ready with a
payable tribute. The people still die in large numbers — 593 deaths across
the eight villages, mostly in fights and on expeditions — but the villages
absorb the losses and hold. The binding gap has moved: it is no longer
survival, it is veterans — six of eight villages cannot field the two
living veterans wave 5 demands, so the wave-5 door stays shut for them
even though they live. Two villages end with empty pantries at wave 5,
living hand-to-mouth with no buffer; a bad week would still bite them.
Seed 190396 is the strongest village: survived 150 days, wave 5, standing
290, wave-5 ready, tribute-ready, pantry 4,400 kcal. Seed 190392 is the
thinnest: survived 150 days but standing 199, wave-4 only, pantry 700 kcal.
The regional→national on-ramp is still the wall — but the survival floor
under it has risen all the way to the ceiling on this band, so the
align-step question (which needs a collapsed baseline to be live) cannot
be answered here, on this tip, on any band tried so far.

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
  collapsed regime), not the instrument, that is missing. The pinned cases
  survived the base move (1ca2c257d → b4343ac9d) unchanged, including the
  CASCADE guard landing in between — the guard does not touch the dawn path.
- The subject-side family tests were NOT run: no subject exists (gate STOP
  forbids cutting one). The prereg's expected subject polarity (honesty
  exit 1 'materialize≠commit'; all 4 align cases at core pick) is
  untested and stays a prediction.

## Sense-testing (vetSays narration, baseline corpus only)

247 vetSays lines across 8 seeds, 183 distinct — the narration is
overwhelmingly event-driven and specific, not templated filler. What
villagers actually do and say:

- Door fights are narrated with named people and real outcomes:
  "🛡️ Kurt, Raj, Jorge, Ingrid and Aria met them at the door — 4 put down,
  1 driven off. Kurt, Raj, Jorge, Ingrid, Aria are hurt."
- Veteran kills get a named, on-camera call-out, varying by person and
  beast: "📺 SYSTEM: \"Oh — OH. Everybody saw that, right? Raj just
  put down The Terms of Service... on CAMERA. That's a veteran kill, folks.
  REMEMBER the name.\"" (same template for Meera/The Congregation,
  Vito/The Ugly Beast — the template repeats, the names and beasts change,
  which reads as a broadcast formula rather than a robot repeat).
- The System's wave-3 arrival line is coherent and menacing: "📺 \"Oh,
  you survived the AUDIENCE NOTES? Cute. We've stopped pretending
  these are animals now. That was the FINAL DRAFT, folks — what comes
  out of the treeline next was never alive the way you mean it.\""
  It repeats 8× (once per seed that reaches the wave — same event),
  which is the same event firing per village, not within-village repetition.
- Arc IV lands on all 8: "◈ ARC IV — THE INEFFICIENCY. SYSTEM:
  \"ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields
  impossible output.\"" and the finale gate is voiced on all 8: "◈ SYSTEM:
  \"Four waves. FOUR. The producers are — okay, I'm saying it: FINALES
  need a NATION. You've got a region; now make it a REALM...\""
- Elder veterans are flagged before the fight: "⚠ This one is
  different — old, patient, unhurried — it has seen your kind before.
  An Elder veteran." followed by blow-by-blow ("The Elder Ugly-Eyes
  falls." / "📺 +20 style — dropped the Elder Ugly-Eyes!").
- Blooded is announced when earned: "Blooded — the village knows where
  the Producers bleed. (Strikes hit 1.5× as hard; their blows land at
  0.75× strength.)" — on 5/8 villages.
- The Mirror Draft is introduced on all 8: "📺 \"We've been watching you
  for a LONG time. Your faiths. Your formats. Your little institutions.
  So we built something out of... well. Out of YOU. Say hello to the
  MIRROR DRAFT.\""

Flags (minor, pre-existing, not this arm's to fix mid-run):

- The age-description fallback the 1215Z arm logged ("Aria, the person in
  their 60s") recurs on this band: seed 190391 day 7 renders "Colin, the
  man in his 40s, Raj, Meera and the woman in her 20s" and seed 190397
  day 7 renders "the woman in her 20s, the woman in her 50s, Oliver and
  Yuki" — names replaced by age-descriptions in door-fight lines. Same
  open backlog entry; two more instances, same pattern. Noted here, not
  chased (outside this arm's axis).
- "Cold-blooded: your body budgets like an accountant. (-20% food need
  today)" repeats 7× — once per village whose scholar took Cold-Blooded,
  a daily buff line. It reads as a meter, not a voice, but it fires once
  per village, not within a village; observed, not flagged as a defect.

No subject corpus exists, so no baseline-vs-subject narration comparison
was possible.

## Telemetry deviation check

Attempted per the loop body step 10:
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-7redef-match/*.json' --metrics national,table,wins,exiled`
→ **REFUSED**, exactly as the prereg predicted for this recorder-corpus
class: "telemetry-check: refusing recorder-corpus input: all 8 --current
rows carry top-level anchorCommit, so they are sweep recorder rows, not
runs. Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." Recorded, not waived; **the baseline was
NOT rolled**. No LOUD lines to investigate (the tool refuses before
comparing).

## Proof adjudication (none — 114/114 green, no stale legs)

The final proof run (`node scripts/test-transplant7redef-match.js`) reports
**114 passed, 0 failed**. No adjudication was needed: the §9
intermediate-state leg that the 1215Z proof had to adjudicate (its
"baseline gate is PROCEED" leg contradicted its own STOP handling) was
FIXED in this proof before the run — it accepts PROCEED or STOP-UNMEASURED
there, and the gate-STOP assertions pass alongside it. The anchorCommit
legs pass cleanly too: no rebase happened this run (base IS the tip), so
the per-seed anchor `b4343ac9da90` matches the prereg's registered base
exactly. The remaining 114 legs pass, including the gate classifier, the
sniff verdict mapping, the family-test staging (§7), the step-script #2381
fix leg, and the stage-aware corpus guards (§9).

## Incidents

- **Step-script #2381 fix PROVEN (sniff + baseline):** the fixed
  `restore()` (checkout scratch from the step commit instead of deleting
  tracked files) worked on both legs. The sniff leg's fail path (analyzer
  refuses 4 seeds) ran restore and left the tracked tree clean — verified
  directly (`git status --porcelain --untracked-files=no` empty, standing
  native `f9359976...`) with NO manual `git checkout --` recovery. The
  baseline leg ended with the tracked tree clean and standing restored,
  again with no manual recovery. Contrast the 1215Z arm: the bug struck
  twice and needed manual recovery both times. The fix is part of this
  arm's tooling commit (`82609601e`); the findings-backlog entry is marked
  fixed by this arm.
- **Safe-commit index clobber:** struck once, on the prereg commit
  (committed files showed staged-as-deleted + untracked; the commit itself
  was correct). Repaired with the documented `ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; verified `git status --short`
  empty + `git diff HEAD` empty + worktree hash == HEAD blob for all three
  files before continuing.
- **No write flap** during this run (all writes succeeded first try).
- **No subject branch exists.** `transplant-7redef-subject` was never
  cut (gate STOP). Verified absent at evidence time (proof §8 asserts it
  in the final run, after both legs).

## Metric review (§14)

- The metric set held: the gate is a range (0–2 PROCEED / ≥3 STOP) and
  the baseline read 8/8 — six survivors over the line, unambiguous, no
  re-scoring needed. The sniff rule (all 4 dead before day 30 →
  INVESTIGATE) also held: 4/4 survived to day 150, so the band is healthy.
- The gate's sensitivity to a single seed (3/8 vs 2/8 flips the whole arm),
  noted in the 1215Z metric review, did not bite here: 8/8 is not a
  borderline read. But the deeper lesson from this run is the opposite
  one: the GATE's regime assumption is now the fragile part, not its
  sensitivity. The matched band read collapsed (1/8) at the merge and
  reads 8/8 at the current tip — the collapse regime itself moved, most
  plausibly under the CASCADE guard (a survival-relevant game-code change
  between the two substrates). A future redefined-family arm cannot assume
  ANY band reads collapsed on current master without a fresh baseline leg;
  the gate is the only honest check, and it should stay a range gate.
- Revision proposed for the NEXT run, not this one: when a survival-relevant
  game-code change lands between the arm's base and the substrate a prior
  read was measured on, the prereg should name the change and its direction
  of effect BEFORE the legs run (this prereg did — the CASCADE guard
  caveat — and the gate STOP is consistent with it). Also: the analyzer's
  8-seed-only requirement means the 4-seed sniff can never produce a
  summary — a future step script should either allow the analyzer to read
  4 seeds or write the sniff verdict from the per-seed files directly
  (carried from the 1215Z metric review; still open).
- The 1215Z arm's fresh-band 3/8 and this arm's matched-band 8/8, on
  substrates one guard apart, jointly say the survival floor on current
  master is high everywhere tried — the collapse regime the family-7
  question needs no longer exists on master tip by either band's read.
  The next family-7 route, if any, needs a different substrate question
  (e.g. a pre-guard substrate), not another band.

## Commits on this branch

- `82609601e` H1 transplant 7redef matched-band prereg + proof stage 1
  green 110/110 + step-script #2381 fix (restore scratch from step commit)
- (this commit) H1 transplant 7redef matched-band: UNMEASURED-substrate —
  baseline 8/8 gate STOP, evidence + corpora + panel N/A (no subject)

## Findings backlog

- [open] 2026-11-15 — narration — door-fight line renders a villager as
  "Aria, the person in their 60s" (name + age-description) where other
  villagers get just a name; likely a missing-name fallback leaking into
  vetSays narration (baseline corpus seed 190581, day 7).
  (sim-transplant7redef evidence.) RECURRING on the matched band:
  seed 190391 day 7 ("Colin, the man in his 40s, ... the woman in her
  20s") and seed 190397 day 7 ("the woman in her 20s, the woman in her
  50s, ...") — same pattern, two more instances.
  (sim-transplant7redef-match evidence.)
- [fixed] 2026-11-15 — measurement / step tooling — transplant7redef-step.sh
  deletes its tooling scratch (culpritbisect-driver, masterregress-analyze,
  vetfirst-instrument) which are TRACKED at the detached step commit, so
  its own final clean-tree check fails after every leg; sims + summaries
  complete fine, recovery is `git checkout --` + branch checkout. Fix:
  restore scratch from the step commit instead of deleting tracked files.
  (Loop A arm sim-transplant7redef-a, run fleshout-20261115T1215Z.)
  FIXED by sim-transplant7redef-match-a (commit 82609601e): `restore()`
  now runs `git checkout HEAD -- <each scratch file>` with `rm -f` only
  as a fallback for files the commit does not carry; proven by the sniff
  + baseline legs, both ending with a clean tracked tree and native
  standing restored, no manual recovery.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change to the live game; the before/after
comparison IS the boundary pair (master tip vs subject) on identical
seeds — and no subject was cut, so there is no pair to compare. Same
standing as masterregress §7.
