# sim-ove48-freshband-prereg — OVE-48 FRESH-BAND SURVIVAL RE-TEST (Loop A, fleshout-20261115T0547Z)

Run: fleshout-20261115T0547Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-ove48-freshband-a, branch
`sim-ove48-freshband-a`, worktree
`~/workspace/worktrees/sim-ove48-freshband-a`.

## Authority

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program) +
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics, fix
policy) + evidence/2026-11-14/sim-transplant15a-band3-prereg.md and
evidence/2026-11-14/sim-transplant15a-band3.md (band 3 — CARRIER
3/8 → 0/8) + evidence/2026-11-14/sim-ove48-conv-prereg.md and
evidence/2026-11-14/sim-ove48-conv.md (mechanism PROVEN: subject
dawn-aligned 74.9% vs baseline 28.7%) +
evidence/2026-11-14/sim-ove48-mech-prereg.md and
evidence/2026-11-14/sim-ove48-mech-a.md (causal path PROVEN
NEGATIVE; under held conversations the collapse does NOT reproduce:
subject 4/8 vs far end 3/8) + evidence/2026-11-14
/sim-talktranscript-a.md (spoken-drive question settled; OVE-48
KEEP stands). This arm closes the remaining question: does the
0/8 vs 3/8 survival gap reproduce on a FRESH band under the
ORIGINAL band-3 conditions (competent verbatim, walk-out)?

## The question

Band 3 read CARRIER: far end 3/8 survived, OVE-48 subject 0/8,
on fresh band 190457–190464, 150d, competent verbatim. Since
then two facts pull the other way: (a) the causal path from the
pick to the deaths is PROVEN NEGATIVE (kcal +0.014% of pantry
flow, ticks +0.012%, 0 held opens, no state series diverges
before the first death divergence on days 4–14); (b) under held
conversations (COMPETENT_TALK=1) the collapse does NOT reproduce
(subject 4/8 vs far end 3/8, same band). The named non-semantic
carrier candidate is RNG-draw drift (+54 weighted-pick draws) —
a sibling worker probes that separately; this arm does NOT
duplicate it. If the survival gap is a seed-band artifact, a
fresh band under the original conditions should NOT reproduce
it. If it reproduces, the carrier read stands on two bands.

## Prereg (binding, committed BEFORE running any judged sim)

- Base: far end 203a32775 (GOOD 4/8 on the collapse band, 3/8 on
  band 3), with the roster-check standing fix swapped in for
  every step exactly as the bisect prereg specifies (fix file sha
  f8fda4295a99, from commit 5157782a4; native restored
  byte-identical afterwards, sha-verified).
- Subject: ALREADY EXISTS — branch `transplant-15a-narrowed-subject`
  at 493d7a975, cut by the narrowed arm. VERIFIED at run start,
  before any sim, from the branch (not from any arm's claim):
  `git log 203a32775..transplant-15a-narrowed-subject` is exactly
  one commit ("OVE-48: convoSelectWant reads dawn commitment and
  top drive"); tree 6d6216e3e414518d2c335829e130e65ec849941b —
  exactly the predicted pick-1-resolved tree; diff vs the far end
  is exactly 3 files, +320/-3 (docs/ONTOLOGY.md +3/-2,
  scripts/test-convo-dawn-priorities.js +206/-0,
  src/js/convo-wants.js +111/-1); scripts/green-list.txt is NOT
  in the commit and is byte-identical to the far end. If the
  subject does not verify, this arm FAILS LOUDLY and stops — it
  does not rebuild the subject itself. NEVER commit anything onto
  the subject branch. This arm's own branch
  `sim-ove48-freshband-a` is based on master and holds ONLY
  prereg/proof/evidence commits (evidence-only landing). To run
  the STEP, check the subject branch out in the worktree; check
  the arm branch back out before committing evidence.
- Pick measured: pick 1 ONLY, c937de65f "OVE-48: convoSelectWant
  reads dawn commitment and top drive".
- Seeds: FRESH band 190561–190568 (8 seeds — see §Freshness check
  below). Horizon: 150d death-aware. Policy: competent verbatim
  own-policy per step (walk-out default, COMPETENT_TALK NOT set —
  exactly as band 3 ran it, so survival stays comparable).
- Legs (TWO, both on the fresh band, both 150d death-aware):
  - Leg 1 (baseline): far end 203a32775 alone on 190561–190568,
    STEP t-ove48-freshband-base.
  - Leg 2 (subject): transplant-15a-narrowed-subject 493d7a975 on
    190561–190568, STEP t-ove48-freshband-subj — run ONLY if
    gated in (see the gate rule below).
  The baseline leg is run FIRST and judged on its own: it is the
  band's calibration (the far end read 4/8 on the collapse band,
  3/8 on band 3, 1/8 on fresh band 1; what it reads here decides
  whether the band can discriminate at all).
- DECIDING BAR (pre-registered verbatim, judge exactly this —
  baseline count first, as the gate; subject count second):
  - CARRIER if subject <= 1/8 AND baseline >= 3/8.
  - NOT-CARRIER if subject >= baseline - 1.
  - AMBIGUOUS otherwise (record as inconclusive, no confirm
    licensed on this band alone).
  - GATE: the baseline must survive >= 3/8 or STOP — verdict
    UNMEASURED, NO subject leg cut (the 8c precedent:
    evidence/2026-11-14/sim-transplant8c.md — a fresh band
    reading far-end 1/8 burned the arm). If the gate fails, the
    evidence file still records the baseline read (UNMEASURED)
    and the corpus is committed — a killed arm leaves its
    measurement.
  The band-3 CARRIER read does NOT enter this table: this arm
  judges the fresh band only. A fresh-band CARRIER would mean
  OVE-48 alone collapses the far end on a second unseen band; a
  NOT-CARRIER would mean the band-3 0/8 reads as a seed-band
  artifact (consistent with the PROVEN-NEGATIVE causal path and
  the held-conversation non-reproduction); an AMBIGUOUS would
  leave the question open and license no confirm.
- Secondary (diagnostic only, NOT the judge): the aligned-share
  mechanism read (subject ~75% vs baseline ~29% expected, per
  sim-ove48-conv-a — the mechanism is already proven; this is a
  check that it reproduces on a fresh band); wave-5 unlocks,
  median days, death-cause shares, standing distribution;
  field-for-field corpus comparison against the baseline leg
  where useful (round-1355 metric review: the cheap decisive
  check — if the subject corpus reproduces the baseline leg
  field-for-field, the pick is deterministically inert on this
  band, not merely within noise of it).
- Instrument validity (V1–V4 gate the instrument; V5 does NOT
  apply on a fresh band — see §Analyzer adaptation): V1 opens
  >= 200/leg; V2 >= 95% opens classified; V3 dawn-priority reads
  0 on the baseline leg, > 0 on the subject leg; V4 zero
  instrument errors. If validity fails on a leg, the survival
  verdict is still judged from the corpus (survival fields are
  driver-recorded, not instrument-derived) but the failure is
  recorded and the aligned-share diagnostic is not trusted.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: the subject already exists and is verified; there
  is no cherry-pick in this arm, so the tooling-resolution rule
  does not fire here. If the subject verification fails, FAIL
  LOUDLY and stop. If MY freshness re-check finds a naming the
  coordinator missed, STOP, report the collision, and do NOT run
  — the coordinator assigns a replacement band. If the baseline
  leg reads ≤2/8, the arm reports UNMEASURED, closes without a
  subject leg (gate rule above), and does NOT propose a further
  band on its own — the coordinator decides whether the question
  gets another band.
- STEP ids: t-ove48-freshband-base (leg 1),
  t-ove48-freshband-subj (leg 2) — fresh, do NOT reuse
  t15a-band3-base / t15a-band3-subj (band 3), t-ove48-conv-base /
  t-ove48-conv-subj (mechanism arm), or any earlier STEP id.
- RUN id: ove48-freshband-pilot (fresh — per-seed files are
  `ove48conv-s<seed>-ove48-freshband-pilot-fix.json`).
- STEP-SCRIPT ADAPTATION (pre-registered, not an improvisation):
  scripts/ove48-conv-step.sh hardcodes the band-3 band
  (SEEDS="190457,...,190464"), RUN ove48-conv-pilot (via the
  driver default), the t-ove48-conv-* step ids, and restores
  tooling from branch sim-ove48-conv-a. The repo script is NOT
  modified. This arm's own step script,
  scripts/ove48-freshband-step.sh (adapted from the conv step,
  same structure), names the fresh band, the fresh STEP ids, RUN
  ove48-freshband-pilot, and restores tooling from THIS arm's
  branch sim-ove48-freshband-a (all five tooling files are
  tracked on this branch: driver, analyzer, instrument,
  vetfirst-instrument, masterregress-analyze). STEP-SCRIPT
  HAZARD (same as the conv arm): the script is run from a /tmp
  copy with REPO set to the worktree for EVERY step including
  the first, because the detached checkout deletes the script
  itself from the worktree. The restore() is defensive per the
  mech-a lesson: a scratch file TRACKED at the step commit is
  restored from HEAD instead of deleted (on newer trees
  vetfirst/masterregress are tracked files); at the two step
  commits here none of the five scratch files is tracked
  (verified in stage 1), so delete-restore applies.
- ANALYZER ADAPTATION (pre-registered, not an improvisation —
  same family pattern as the band-3 arm's bisect-analyzer
  recovery, named up front): scripts/ove48-conv-analyze-20261114.js
  hardcodes the band-3 band (`const SEEDS = [190457, …, 190464]`),
  RUN ove48-conv-pilot, the t-ove48-conv-* step ids in its V3
  mapping, and a V5 replication that requires a band-3 mapping
  (`checkReplication` pushes a mismatch for any unmapped step).
  The repo analyzer is NOT modified (the proof verifies it still
  hardcodes the band-3 band). The step script patches a SCRATCH
  copy in the worktree (restored from this arm's branch) with
  exactly five replacements, each asserted to occur exactly
  once, and prints the diff vs the branch copy to the driver
  log for audit: (1) SEEDS line → the fresh band; (2) RUN line →
  'ove48-freshband-pilot'; (3) isSubj line → the fresh subject
  STEP id; (4) isBase line → the fresh baseline STEP id; (5)
  checkReplication's no-mapping case → `return out` (V5 does
  NOT apply on a fresh band: there is no band-3 counterpart on
  fresh seeds, so replication is recorded as band3Step null
  with 0 mismatches, not as a failure — the same
  not-applicable treatment the mech-a L-KIND leg used, where no
  band-3 counterpart existed). The summaries' `endpoints` block
  (if any) is static reference data, not the legs' numbers; the
  legs' perSeed/wall/survived are computed from the fresh-band
  corpora. The scratch analyzer is deleted by the step script's
  restore() after each leg.
- CORPUS PATHS (recorded so the coordinator is not misled): the
  driver writes per-seed JSONs to
  evidence/2026-11-14/perseed-ove48-conv-<STEP>/ and driver logs
  + summaries to evidence/2026-11-14/ (ove48-conv-<STEP>-driver.log
  / ove48-conv-<STEP>-summary.json), exactly as the conv arm did
  — NOT to evidence/2026-11-14/perseed-ove48-freshband/. The
  evidence file for this arm lives at
  evidence/2026-11-14/sim-ove48-freshband-a.md. Commit the corpus
  directories by expanding to FILE LISTS first —
  safe-commit.sh refuses directory paths. No comparison JSON is
  written by the analyzer's compareLegs (it hardcodes the conv
  STEP ids and would overwrite the conv arm's comparison); the
  cross-leg comparison for this arm is computed in the stage-2
  proof test from the two summary JSONs and recorded in the
  evidence file.
- Fix policy (bisect prereg §Fix policy, binding): DIAG arm — no
  game-code change lands from this measurement arm unless the
  change is a DEFECT (not a design trade-off), small, carries its
  own proof test, and restores ≥3/8 on the same band. Otherwise —
  document only. Zero src/js changes are expected; if one proves
  necessary, STOP and report to the coordinator instead of
  making it.

## Freshness check (re-run by THIS arm, recorded here)

Chosen band 190561–190568 (8 seeds). Search scope, run by this
arm before writing this prereg: `grep -r -l --include="*.md" -F
<seed> evidence/ hidden_files/` for each seed (all 8: zero hits);
the same search as a single traversal over all dated preregs
(every `evidence/*/sim-*-prereg.md`) plus any forbidden/
contaminated band lists they name (no standalone forbidden/
contaminated band list exists in the goal — confirmed by the
feastfirst-a, fishfirst-a, roleform-b, raiserseat-a preregs, which
each record exactly that). (The stage-1 proof re-runs this search
excluding this arm's own prereg/evidence files, which name the
band by design.) Suggested starting range 190561–190568
from the task brief: VERIFIED FRESH — zero hits in any .md file,
zero in any prereg, zero in the convergence tracker.
Collisions found and REJECTED (bands named in .md, therefore
used): 190391–190398 (collapse band, bisect + pick-1 arms);
190449–190456 (fresh band 1, sim-transplant15a-fresh-a);
190457–190464 (band 3, sim-transplant15a-band3-a + ove48-conv-a
+ ove48-mech-a); 190401–190408 (sim-freezeline-a /
sim-tendexact-confirm-a, 2026-11-13); 190411–190418
(sim-tributedeliv-b / sim-survivalcontrol-b, 2026-11-11);
190419–190434 (sim-mcconfirm-ctrl-b / sim-mcconfirm-merge-b,
2026-11-11); 190441–190448 (named in 3 evidence files — used,
not fresh). Non-.md hits were not counted as reservations (the
documented float-substring artifact class, e.g. "190460" inside
a JSON float — only .md namings count).

## Canon

docs/CANON.md read first. docs/VILLAGER-BRAIN.md Phase 4 documents
`convoSelectWant` reading "the villager's current commitment and
top drive, so a conversation opens from the same priorities the
dawn chose" — OVE-48 is the implementation of that documented
contract, not a new system. docs/CONVERSATIONS.md covers
context-aware openings (a villager's goal is one of the opening
priorities) and the conversation engine (energy budget, threads,
no-repeat ledger). No standalone canon doc covers OVE-48 itself —
the pick is a coherence repair inside the documented dawn-scorer +
conversation-wants contract (the opener should track the same
priorities dawn chose). Nothing here invents canon.

## Pick content (read before the step)

- Pick 1, c937de65f "OVE-48: convoSelectWant reads dawn commitment
  and top drive": `convoDawnPriorities(vid)` reads today's
  vbrain commitment kind + top drive (vgoal) and biases the
  weighted want pick toward the wants that match (DAWN_KIND_WANTS
  / DAWN_DRIVE_WANTS, primary bias 2.0); unfinished-business
  pre-emptors (seeds, repay, pocketed) stay above. In plain words:
  what a villager talks about when you open a conversation now
  follows what dawn already decided they are doing today.
- Pick 1 diff vs its first parent, 4 files: docs/ONTOLOGY.md
  +3/-2, scripts/green-list.txt +1/-0,
  scripts/test-convo-dawn-priorities.js +206/-0 (new test),
  src/js/convo-wants.js +111/-1. js=1, pol=0. No pick touches
  src/js/standing.js or scripts/policies.

Mechanism expectation: the pick changes WHICH want a conversation
opens with — dawn coherence in social prioritization. It changes
no kcal cost, no damage, no armor, no spawn, no food yield, no
spoilage, no wave or table gate number. The survival effect, if
any, would have to come through villagers choosing different
conversations — a third-order behavioral path, not a lever — and
the causal analysis already PROVED that path negative on band 3.
Expectation (not a verdict input): NOT-CARRIER is the likelier
read on a fresh band too; a CARRIER read on a second band would
strengthen the carrier case despite the missing mechanism and
would point at the RNG-draw-drift candidate the sibling worker
is probing. On band 3 the pick read 0/8 against the far end's
3/8; on the same band under held conversations it read 4/8
against 3/8.

## Family identity (verified at run start, before any sim)

- Pick 1: c937de65f32d26e064d8935dd984490b2ee50a6c "OVE-48:
  convoSelectWant reads dawn commitment and top drive" (2026-11-08
  22:27 UTC). First parent 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32
  (single parent — standalone commit, no merge). Diff vs first
  parent, 4 files: docs/ONTOLOGY.md +3/-2,
  scripts/green-list.txt +1/-0,
  scripts/test-convo-dawn-priorities.js +206/-0 (new test),
  src/js/convo-wants.js +111/-1. js=1, pol=0.
- Subject: branch transplant-15a-narrowed-subject, tip 493d7a975,
  tree 6d6216e3e414518d2c335829e130e65ec849941b, exactly 1 commit on
  the far end, diff vs far end 3 files +320/-3, green-list.txt NOT
  in the commit, green-list.txt byte-identical to the far end
  (sha256 138a5e86… both sides).
- No pick touches src/js/standing.js or scripts/policies (empty
  diff on both paths for pick 1).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; this worktree's (master tip)
  native standing.js sha256 is f9359976… (matches the mech-a
  record for master tip).
- Wall numbers carried in (band 3, 8 seeds 190457–190464, 150d):
  far end 3/8 survived, median 129d, wave-5 0/8, deaths 533;
  subject 0/8 survived, median 134d, wave-5 4/8, deaths 635;
  national 0, table 0, wins 0 both legs. Held-conversation legs
  (same band, COMPETENT_TALK=1): far end 3/8, subject 4/8.

## Ordering note (recorded, not hidden)

The subject verification and the freshness check above ran as part
of prereg preparation, before this file was committed — the
band-3 arm's prereg likewise records its pre-check results. The
binding requirement is met: this prereg is committed BEFORE any
judged sim runs. No STEP t-ove48-freshband-base /
t-ove48-freshband-subj corpus, summary, or driver log exists. The
subject branch was cut by the narrowed arm, not by this arm; this
arm verifies it, never rebuilds it. The fresh-band decision table
above REPLACES the band-3 table for this arm (the band-3 table's
BAND-INCONCLUSIVE row is replaced by this arm's UNMEASURED gate
outcome, per the task brief — a failed gate here does NOT close
15A pick-1 as AMBIGUOUS; the coordinator decides whether the
question gets another band). The band-3 CARRIER verdict stands on
its own band whatever this arm reads.
