# sim-transplant-raid-b — H1 transplant, family 2: PR #6 raid-danger-heard (Loop B)

Run fleshout-loop-b-20261113T2230Z (Loop B), axis scale-onramp (survival collapse).
Worker arm sim-transplant-raid-b. Written and committed BEFORE any judged sim.
Base: branch `sim-transplant-raid-b` (master 95dbf07f3 at run start).
Instrument-only arm — ZERO `src/js` changes committed on the arm branch.

## The question

The bisect closed DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
(evidence/2026-11-13/sim-scale-onramp-round-2115.md §1): no single
culprit commit inside the merge; the origin line was already collapsed
when it diverged. The transplant program
(round-2115 §3, BINDING on this arm) lands origin-side families onto
the far end one at a time to find the carrier. Family 1 (PR #118) runs
in parallel as sim-transplant118 — never touched by this arm.

This arm tests family 2: PR #6 raid-danger-heard-c0a3, merge
7ddcdfff9 (js=4, the second-largest game-code family after #118).

## The family — what it changes

One heard-filtered danger read, `Game.objDangerBelief(vid)` →
`{ score, threat, freshRaid }`: village gossip counts only if `vid`
is in the entry's `heard` list (3-day window). Four consumers read
through it (evidence/2026-11-08/raid-danger-heard.md; VILLAGER-BRAIN
seam 4 / game-gaps item 2):

- Door `objDanger` — departure verdicts (go / ask / tighten / defer).
- `objVillageDanger(vid)` — expedition-launch gate, now per-villager.
- Rally `objRallyFreshRaid(vid)` — rally-guard drive + AskCompanion
  rallyOnly skips unhearing volunteers.
- Safety drive `dangerHeard` — now the shared read's `threat`.
- `game.js` commons raid seed now names hearers (first 4 NPCs at the
  fire) instead of seeding gossip with an empty heard list — before
  this family, a raid nobody heard armed nothing; after it, the first
  four hearers are armed and everyone else is not.

Files in the family diff (`git diff 7ddcdfff9^1 7ddcdfff9`, 14 files):
src/js/game.js (+7/-1), src/js/npc-triggers.js (+3/-1),
src/js/villager-goals.js (+4/-11), src/js/villager-objectives.js
(+106/-... the one shared read + three consumers), plus docs
(ONTOLOGY, VILLAGER-BRAIN), evidence/2026-11-08/raid-danger-heard.md,
and 6 test/green-list files. No policy change, no data change.

Direction is ambiguous a priori: before the family, villagers were
held home by raids they were never told about (false holds — fewer
departures, fewer road deaths, less foraging); after it, unhearing
villagers depart freely (more departures, more exposure) while the
four hearers are genuinely armed (rally/safety react for real). The
sim decides which way survival moves.

## Base + subject (pre-registered)

- BASE: far end 203a32775 (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for EVERY step exactly as the
  bisect prereg specifies (fix file
  `git show 5157782a4:src/js/standing.js`, sha256
  f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078;
  native restored byte-identical afterwards, sha-verified). The driver
  refuses to run unless the on-disk standing.js carries the ROSTER
  CHECK marker.
- SUBJECT: far end + family diff, built on a scratch branch named
  transplant-raid-b-subject in this tree and LEFT in place (branch
  kept, hash recorded below) so the verdict is reproducible. Built
  via `git cherry-pick -m 1 7ddcdfff9` (merge family). Never commit
  the subject to the arm branch. On ANY conflict: STOP, report the
  conflict, do not hand-resolve game code.
- The bisect pick s04 IS this same merge read cumulatively (2/8
  AMBIGUOUS twice) — the transplant isolates the family ALONE on the
  far end; cumulative pick readings NEVER transfer to a family.

## Driver + proof (pre-registered)

- DRIVER: scripts/transplant-raid-b-driver-20261113.js (mechanical
  derivation of scripts/culpritbisect-driver-20261113.js — same
  guards, instrument, writeRobust, own-policy rule; only the corpus
  prefix, RUN, arm label, LEG name and STOP prefix differ) +
  analyzer scripts/transplant-raid-b-analyze-20261113.js + step
  scripts/transplant-raid-b-step.sh (same mechanics as
  scripts/culpritbisect-step.sh, restore source
  sim-transplant-raid-b) + proof scripts/test-transplant-raid-b.js
  (arm's own legs: seed-band identity, guards, verdict mapping,
  subject-diff completeness, step-script restore source, live smoke).
  The shared proof scripts/test-culpritbisect-a.js (116 legs) is ALSO
  run as-is before any judged sim (it validates the shared machinery).
- ENDPOINT VERIFICATION FIRST with the transplant driver (far end
  expect 4/8, per-seed days 86/144/150/43/150/87/150/150; merge
  expect 1/8, per-seed days 103/150/115/140/76/126/115/136) — a
  mismatch is NO-GO, STOP, report loudly.
- SEEDS: 190391–190398 (8 seeds, the same band as every bisect cut).
  HORIZON: 150d death-aware (+10d tail max). POLICY: competent
  verbatim, own-policy per step (record policy sha per seed).

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived/8 on the band.** GO thresholds from the
transplant prereg (round-2115 §3):

| Survived | Verdict |
|---|---|
| ≤1/8 | **CARRIER** — the family alone collapses the far end to the merge's level |
| 2/8 | **AMBIGUOUS** → re-run once with a fresh STEP id (bisect rule); 2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for ordering but kept on the suspect list |
| ≥3/8 | **NOT-CARRIER** — family alone does not collapse (far end is 4/8, so 3/8 is within a step of it) |

**Rank read (same bands as the bisect):** regional reach — ≥5/8
REGIONAL_INTACT; ≤2/8 RANK_STALL; 3–4/8 RANK_INCONCLUSIVE. Reported
per step, never a verdict input.

**Secondary (diagnostic only):** wave-5 unlocks, median days,
death-cause shares, standing distribution. No cost guard —
measurement arm; nothing lands on master.

## Corpora

- Judged corpus: evidence/2026-11-13/perseed-transplant-raid-b-subject/
  (8 per-seed JSONs). Endpoint corpora:
  perseed-transplant-raid-b-ep-far/ and
  perseed-transplant-raid-b-ep-merge/. Possible re-run:
  perseed-transplant-raid-b-subject-r/.
- Driver logs: evidence/2026-11-13/transplant-raid-b-<step>-driver.log.
  Per-step summaries:
  evidence/2026-11-13/transplant-raid-b-<step>-summary.json.

## Sense-testing (SENSE-TESTING LAW)

Read the boundary transcripts (vetSays) — do villagers still act
like people on the subject vs the far end, and what changes around
the divergence day? Reported below in plain words. The family touches
departures, rally and safety — the read looks for villagers leaving
into danger they were told about, staying home from raids they never
heard, and rally volunteers showing up (or not) for a fresh raid.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the step is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the instrument).
- The fix swap is the ONLY permitted uncommitted change during a step
  (plus the untracked tooling scratch). After each step, the original
  standing.js is restored byte-identical (sha-verified) before the
  next step or any evidence commit. If a restore fails, FAIL LOUDLY
  and do not commit evidence.
- This arm does NOT re-judge any prior verdict (bisect
  DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE, masterregress CULPRIT_MERGE,
  s04 2/8 AMBIGUOUS twice) — it measures family 2 alone on the far
  end.
- Do NOT cut at any other commit. Do NOT start the family-4 split or
  the family-13 split — that is the next run's work.
- Telemetry deviation check: attempted; recorder-corpus class — the
  deviation check REFUSES these corpora; record the refusal, never
  roll the baseline.
- If the host write flap returns mid-run, wait for it to clear rather
  than bypassing safe-commit; never route around a denial. Probe with
  `git update-ref refs/heads/probe HEAD` then delete the probe ref.
- Do NOT touch any other loop's trees/branches: sim-transplant118
  (Loop A family-1 arm, LIVE worker), journey-landing-r130,
  journey-scale-attr, sim-inffight-ab, or the sibling B arms' trees.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and docs/TABLE.md (the table
prices the run, never gates on godhood; reachable by competent
non-god play — Steve 2026-10-11) and Steve's 2026-11-10
scholar-counts ruling. The family itself is documented in
evidence/2026-11-08/raid-danger-heard.md (VILLAGER-BRAIN seam 4).
No canon doc covers survival-collapse attribution; nothing here
invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change, no before/after pair to
compare on one base. The before/after comparison IS the far end vs
the subject on identical seeds, judged by the analyzer's decision
rule. Same standing as the bisect prereg §7.

## Metric review (§14 — filled in after the steps)

- (to be filled after the steps: did the metric set hold, or does a
  metric need revision for the NEXT run?)

## Results (filled in after the steps)

### Subject build

- (to be filled: subject branch tip hash, cherry-pick result,
  family-diff completeness check)

### Endpoint verification

- (to be filled: far end survived/8 + per-seed days vs expected;
  merge survived/8 + per-seed days vs expected; GO/NO-GO)

### Judged step

- (to be filled: survived/8, verdict CARRIER / AMBIGUOUS /
  NOT-CARRIER, per-seed days, wall numbers, death causes)

### Sense-testing

- (to be filled: vetSays read, subject vs far end, in plain words)

### Telemetry

- (to be filled: deviation-check refusal record)

### Metric review (filled)

- (to be filled)

## Next splits (only if this family reads CARRIER)

Per the task brief: the forager-deed merge (family 4) contains two
sub-families and the brawler merge (family 13) vs the deed commit
itself are the next splits — but do NOT start them; that is the next
run's work.
