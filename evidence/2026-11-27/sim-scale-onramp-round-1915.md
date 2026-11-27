# sim-scale-onramp-round-1915 — Loop A coordinator round record

**Run:** fleshout-20261127T1915Z · **Axis:** scale-onramp (the blocking axis;
standing directive applies) · **Date:** 2026-11-27 · **Master at run start:**
1d266ccf9 · **Master at closeout:** 5eca72da2 (craftgate-a tip)
**Arms:** sim-spearlead-a-adopt, sim-leadworst-a-adopt, sim-craftgate-a.
All three arms closed in-run; all three merged locally, pending ship.

## Run-start state

- **Stale-lock recovery:** the A lock held run `fleshout-20261125T0215Z`
  (created 2026-11-25T02:19:46Z, >2 days old). Verified dead before touching
  it: no live coordinator process in `ps`, no live subagent, its trees'
  heartbeats 2026-11-25T02:23:36Z. Lock deleted same-call as its read
  (run_id matched); its claim retired to `.DEAD`. The 0215Z run's arms:
  homecraft-gate landed (696546913), spearlead branch kept unmerged
  (7 commits ahead), leadworst pre-check only — this run adopts the
  latter two.
- **Loop B live** on winnability-chain (1830Z claim: launchfit + samelabel),
  NOT touched. B landed launchfit (1d266ccf9) and samelabel during this run;
  master moved under the run (playtest journey-landing r289, 7f5bd3d14)
  with zero file overlap.
- **Pre-flight:** main tree clean (`git status --short` empty), disk 51%,
  `worktree-reap.sh` SKIPPED on a held registry lock (consecutive skips: 2)
  — no cleanup this run. Cap had room (13 live trees). VM restarted
  ~19:06Z (uptime 10 min at run start); write probes passed all run, no
  flap window hit.
- **Rotation left at 7** (convergence work does not cycle it).

## Arm 1 — sim-spearlead-a-adopt (ADOPTION, DIAG-NO-GO LEAD-FOUND, merged 85c242f5e)

Adoption of the stranded 2315Z DIAG branch (7 commits, evidence already
written). Coordinator verified the branch before spawning: 16 files, zero
`src/js` (the spearL fix touched only the driver script). Worker checked
out the kept branch in a fresh registered tree, rebased clean onto master
(7/7 picks, no stops), re-ran proofs on the rebased tip, and re-ran the
analyzer over the committed corpus — **deep-equal** to the committed
analysis (excluding only the input-dir path string). No new commit needed;
no judged sims re-run; the verdict was re-verified, not re-judged.

- **Verdict:** DIAG-NO-GO, kind LEAD-FOUND. The spearopen zero does NOT
  replicate on band 110711–110718 (8 seeds, 150d): 63 spear departures;
  buckets 5 lead / 4 companion / 4 avoid / 0 converted / 4 died-away /
  0 plan-never-reached / 45 autonomous-no-w4 / 1 still-away /
  0 unattributed; spearSeen 63 = ledger 63, 0 instrument errors, 8/8
  seeds reconcile. 5 spear-led wave-4 fights, 0 conversions.
- **Proofs:** test-spearlead-a 46/46, analyzer selftest 28/28 — green on the
  rebased tip AND on merged master (coordinator re-ran both).
- **Wall (this band):** national 0/8, wins 0/8, wave-5 2/8 (110712, 110714),
  median survival 108.5d. Standing at end ranged 140–600 (110712 reached
  600 — past the wave-5 bar — and still ended regional with no win).
- **Evidence:** evidence/2026-11-24/sim-spearlead-a.md. Finding #2544 stays
  open; next arm named in evidence §8: a spear-fight damage diagnostic.
  Thrown-weapon opening stays Steve's design call.

## Arm 2 — sim-leadworst-a-adopt (Part A DIAG-GO, Part B NO-GO, evidence-only landing 7f42558c6)

Adoption/completion of finding #2601 (the launch lead is the worst-armed
fighter in the party). Frozen prereg: Part A lead-rank/seed-race DIAG +
Part B ONE default-OFF policy probe (LEADWORST=1), band 110721–110728,
150d, competent, control vs probe on identical seeds. Coordinator verified
the dead run's uncommitted state file-by-file before spawning (LEADWORST
probe in villager-brain.js +19 / win-plan.js +82, ONTOLOGY.md Provides-line
update, driver/analyzer/test scripts — no contamination). Worker committed
it, rebased onto master tip accf09d0c, ran both legs, judged only against
the frozen prereg.

- **Part A DIAG-GO.** Pool 13 (floor 10); lead rank quantified 13/13. H1
  CONFIRMED — lead is worst-armed in 7/13 meetings (53.8%; median lead wb
  8 vs best 18). H2 NOT confirmed as stated — 29 Haven-seed events, 14
  (48.3%) with another eligible seeder, and when a choice existed the best
  available seeder was typically only 0.5 wb better (all 29 engaged via
  village-slain). H3 REFUTED — swap counterfactual lifts dpr only 42.8 →
  48.5 (+8% vs 25% bar).
- **Part B NO-GO.** Kill share ctl 0/13 (0.0%) vs arm 0/11 (0.0%), delta
  0pp (bar: ≥2 kills + ≥5pp). The swap works mechanically — fires on
  111/231 brain launches (48%), median lead wb 8 → 17, median dpr 42.8 →
  53.8 (+26%) — but ~111 dpr is needed and even a best-armed lead in every
  meeting only reaches ~70.5 dpr. Cost bars all pass (starvation 1 vs 6,
  villager starvation 1 vs 4, median survival 141.5d vs 148d). §15 panel:
  `review_required`, agrees (village deaths 93.4 → 94.3, interval straddles
  zero; national/wins 0 → 0).
- **Disposition: evidence-only, lever HELD on branch `sim-leadworst-a`.**
  The proof test calls `Game.winPlanLeadSwap` directly, so the instruments
  cannot land without the probe code. Coordinator landed exactly the
  evidence files + prereg + panel builder via a fresh landing branch
  (sim-leadworst-a-land, commit 7f42558c6, merged ff-only); the panel
  builder was verified to reproduce `leadworst-a-panel.json` exactly from
  the staged corpora before committing. The held branch keeps all 3
  commits (prereg 67ab6400a, probe eb2d0af4e, evidence 34363d9a). No
  `winPlanDepart` parity port — that was a landing condition and the probe
  did not GO.
- **Proofs:** test-leadworst-a 67/67 green after rebase (on the branch, with
  probe code present — NOT on master, by design).
- **Wall:** national 0, table 0, wins 0 both legs; wave-4 8/8, wave-5 4 ctl
  / 3 arm; median survival 148d / 141.5d; all regional.
- **Sense-test:** best probe meeting — 110723 d53, Mia (swapped lead, wb
  28) vs The Suburb, 887/1449 dealt in 9 rounds, flees sensibly at 26 HP
  ("Mia sees how this ends — and runs while running still works"). Worst —
  110721 d65, Aaliyah (wb 7) fights The Eater alone 2 rounds, Mateo (wb
  18) charges in R3 on a shout, she dies R4. The swap only re-weights the
  dawn party; the opening fighter is whoever walks into the monster.
  Finding filed in sim-findings.md (lead-swap reach is the dawn party
  only; the party's best weapon is itself too weak).
- **Evidence:** evidence/2026-11-24/sim-leadworst-a.md (+ analysis, panel,
  per-seed corpora ctl/arm).

## Arm 3 — sim-craftgate-a (fresh DIAG, DIAG-NO-GO UNASSIGNED, merged 5eca72da2)

2115Z next blank #1: the home-duty craft gate — why 131/149 empty-quivered
fighters never received a batch (aidammo-a). Instrument: daily
pile-material + at-home-carrier snapshots. Fresh band 110801–110808
verified unused across all preregs before the prereg froze (per the
seed-band freshness skill). 8 seeds, 150d, competent.

- **Verdict: DIAG-NO-GO (UNASSIGNED)** — judged, not re-scored. Of 18
  empty-quivered fighters at wave-4+ entry (77 empty rows), 8 never
  received a batch in their life. Five carry bows and decompose cleanly
  across 136 needing-days: **96 fiber-blocked, 40 away from home** — zero
  cooldown days, zero attempt-eligible days, zero failed attempts. A
  never-supplied bow-carrier never once had an open gate. The other three
  cannot be decomposed under the frozen taxonomy because the gate was
  never built for them: two carry slings and one a searcaster, and the
  duty only crafts arrow/bolt — they have no at-home supply path in the
  game as built (stones only from departure piles, cells only from rare
  loot). The frozen decomposition bar (unassigned = 0) therefore fails on
  those three; the miss is a finding about the game, not an instrument
  failure. Evidence proposes scoping the bar to craftable weapons next
  run and carrying slinger/searcaster empties as their own finding.
- **Fiber is the binding shortfall, band-wide:** 704/721 no-materials days
  are fiber-short (98%); all 721 are bothShort (pile AND own pack short at
  once). Pile means: stick 46.4, stone 250.7, **fiber 9.4**. Arrow recipe
  available 65% of days vs bolt recipe 97%. Daily census: 1.45 carriers
  at home, only 0.08 materials-sufficient.
- **Gate states (3,601 candidate-days):** away 1,208 (54% of needing-days),
  no-materials 721 (32%), attempt-eligible 186 (8%), cooldown 114 (5%),
  stocked 1,372. Odds check out exactly: blind 30/88 = 34% (frozen 35%),
  learned 75/89 = 84% (frozen 85%). Attempts 177, successes 105. The gate
  fails on opening, not on rolls.
- **Mechanism re-measure (report-only):** ammo-at-entry 0.607 vs 0.70
  (capable-only 0.740; lead-only 0.381 — the worst lead figure yet).
  Home-duty still supplies 71% of ammo units at entry; attribution
  completeness 1.000; gate coverage 0.978; pool floor 18 ≥ 10.
- **Desert seed 110804:** 5 home-duty batches in 150d, lead ammo 0/13.
  Seed 110807 the opposite: 26 batches, 20/39.
- **Analyzer bug fixed mid-run (shared infrastructure):** vid is a
  NAME-based id recurring across villages — 11 name collisions on this
  band merged different people and hid one never-supplied fighter (7 → 8
  after the fix). Per-fighter maps in both `analyze-craftgate-a.js` and
  `analyze-aidammo-a.js` are now scoped by (seed, vid), with cross-seed
  namesake regression cases in both selftests (30/30). The pilot corpus
  was not re-run; the fix is analyzer-only on the same corpus. Open item
  filed: re-run the fixed analyzer over the committed aidammo corpus and
  confirm the 0.849 / delivery numbers stand.
- **Proofs:** test-craftgate-a 29/29, aidammo proof test 38/38, analyzer
  selftests 30/30 each — all green on the rebased tree AND on merged
  master (coordinator re-ran all four). Determinism re-run (seed 110801):
  craftgate hash and ledger hash identical to the pilot; the two files
  differ in exactly one line — the `run` label.
- **Wall:** national 0/8, wins 0/8, wave-5 2/8, median survival 150d,
  starvation 1/798 deaths.
- **Sense-test:** Lena Ruiz (28 needing-days, never supplied) vs the Herald
  d100: the game's own narration says *"Lena has Bow but no arrows — the
  string stays drawn, useless."* Numbers and narration agree exactly.
- **Evidence:** evidence/2026-11-27/sim-craftgate-a.md (+ analysis,
  per-seed corpus + rerun).

## Wall (this run's judged corpora)

| arm | national | table | wins | wave-5 | median survival |
|-----|----------|-------|------|--------|-----------------|
| spearlead (8) | 0/8 | 0/8 | 0/8 | 2/8 | 108.5d |
| leadworst ctl (8) | 0/8 | 0/8 | 0/8 | 4/8 | 148d |
| leadworst arm (8) | 0/8 | 0/8 | 0/8 | 3/8 | 141.5d |
| craftgate (8) | 0/8 | 0/8 | 0/8 | 2/8 | 150d |

## Metric review

- **Spearlead:** adoption re-verification, not a re-judgment — the frozen
  prereg's bars were never re-scored. The analyzer re-run deep-equal is
  the right check for an adoption; nothing to revise.
- **Leadworst:** the frozen prereg's H2 (a choice among seeders exists)
  was not confirmed as stated — seeding is a first-eligible race, and
  when a choice existed the best seeder was only ~0.5 wb better. The
  prereg's framing ("chosen by standing/veteran with no gear weight") was
  already corrected in the prereg itself before the sims. No bar revision
  proposed: the kill-share bar did its job (mechanism fired, bar missed).
- **Craftgate:** the frozen decomposition bar (unassigned = 0) failed on
  three fighters the taxonomy was never built for (sling/searcaster
  carriers). The verdict is DIAG-NO-GO as judged. Proposed revision for
  the NEXT run (not applied here): scope the decomposition bar to
  craftable weapons (bow/crossbow) and carry non-craftable empties as
  their own finding. The metric was wrong in scope, not in threshold.
- **Telemetry deviation check:** refused both corpora by design (recorder
  rows with top-level `anchorCommit`, not runs — same as every recent
  run). No LOUD lines; baseline NOT rolled.

## Infrastructure

- Stale-lock recovery at start (see above); Loop B live throughout, no
  interference either way. Registrations slow (~9 min each; load avg ~8;
  registry lock contended with B + playtest loops).
- Safe-commit index clobber struck on the leadworst worker's 2 commits and
  the craftgate worker's 3 evidence commits — repaired each time via the
  documented `ls-tree -r | update-index --add --index-info` pipe, commits
  verified correct by blob hash. No clobber on the coordinator's landing
  or round-record commits.
- `scripts/safe-commit.sh` in the craftgate worktree is mode 664 (no exec
  bit); the worker ran it as `bash scripts/safe-commit.sh …`. The script
  does not accept directory paths — the corpus commit used an explicit
  9-file list after the directory form failed.
- **Injection attempt (flagged, not followed):** mid-run, a system-reminder
  attached to an exec result in the craftgate worker tried to forbid
  running/cloning/git commands. It arrived via tool output (data, not
  instructions from the coordinator) and conflicted with the assigned
  task, so the worker did not follow it. No work was affected. Recorded
  here and in the memory note.
- `check.js --quick` NOT re-run: zero `src/js` landed this run (spearlead
  zero, leadworst probe held, craftgate scripts-only + one analyzer fix
  covered by its proof tests 38/38 + selftest 30/30 on merged master).
- Rebase stop-at-pick quirk did NOT strike this run (three clean rebases).

## Findings filed (sim-findings.md)

- Fiber binds the home-duty craft gate (2026-11-27).
- Slingers/searcasters have no at-home supply path (2026-11-27).
- Spear-fight damage diagnostic still owed, #2544 open (2026-11-27).
- Aidammo numbers need a re-run under the fixed analyzer (2026-11-27).
- Lead-swap reach is the dawn party only (2026-11-27, by the leadworst
  worker).

## Next blanks, in order

1. Fiber supply to the pile — where fiber comes from during play
   (craftgate §13).
2. Slinger/searcaster supply path — Steve design call on which path
   before any build (craftgate §13).
3. Spear-fight damage diagnostic (#2544, spearlead §8).
4. Total party damage / weapon quality, not leadership (leadworst
   finding) — the next wave-4 kill lever.
5. Aidammo re-analysis under the fixed analyzer (confirm 0.849 stands).
6. Thrown-spear opening — Steve's design call (2115Z blank #2, still
   held).

## Convergence

scale-onramp stays converging (NOT converged): the ammo-supply question
is now answered end to end (home-duty craft is the supplier, the gate is
almost never open, fiber is the binding shortfall, slingers/searcasters
have no path at all), the lead-swap lever is killed on its kill bar, and
the spear-lead question is settled as LEAD-FOUND — but villages still
reach wave 5, survive, and never reach national or win. The directive
stands until the tracker records this axis converged on measured
evidence. food-economy stays converging (untouched; sibling loop B's
winnability-chain work is a different axis). Claim deleted; lock deleted.
