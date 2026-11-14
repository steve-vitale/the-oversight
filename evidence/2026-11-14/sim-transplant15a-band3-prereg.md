# sim-transplant15a-band3-prereg — family 15A PICK-1 THIRD BAND (OVE-48) (Loop A, fleshout-20261114T2115Z)

Run: fleshout-20261114T2115Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-band3-a, branch
`sim-transplant15a-band3-a`, worktree
`~/workspace/worktrees/sim-transplant15a-band3-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15A (family 15A = dawn scorer / convo wants, 3 standalone
first-parent OVE commits, pick order oldest first: c937de65f →
4594de6b5 → 748cce3b8). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics, fix policy) + evidence/2026-11-14/sim-transplant15a-pick1-prereg.md
and evidence/2026-11-14/sim-transplant15a-pick1.md (the old-band
arm — AMBIGUOUS 2/8 twice) + evidence/2026-11-14/sim-transplant15a-fresh-prereg.md
and evidence/2026-11-14/sim-transplant15a-fresh.md (fresh band 1 —
BAND-INCONCLUSIVE; model for this prereg/proof/evidence shape and
for the band-gate decision table). Coordinator decisions:
evidence/2026-11-14/sim-transplant-round-1653.md, decision 3 /
next blank #2 — "15A third band calibrating the far end at ≥3/8
(a coordinator call — which band, and whether the AMBIGUOUS
verdict is worth another band)"; evidence/2026-11-14
/sim-transplant-round-2015.md, next blank #2 (same). THIS RUN is
that coordinator call: this is the LAST band for 15A pick-1.

## The question

OVE-48 pick-1 alone read AMBIGUOUS 2/8 TWICE on the collapse band
(190391–190398) — STEP t15a-pick1 and the fresh-id re-run
t15a-pick1-r2, per-seed numbers IDENTICAL on every field. A
fresh-band confirm on 190449–190456 (band 1) was BAND-INCONCLUSIVE
(the far end itself read 1/8 there; STEP t15a-fresh-base, subject
0/8 on STEP t15a-fresh-subj — not judged, per the table). One
more discriminating band settles it; a third BAND-INCONCLUSIVE
also closes the item as AMBIGUOUS, unresolvable by band
variation — do not propose a fourth band (no fourth band).

## Prereg (binding, committed BEFORE running any judged sim)

- Base: far end 203a32775 (GOOD 4/8 on the collapse band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix file sha f8fda4295a99, from commit
  5157782a4; native restored byte-identical afterwards, sha-verified).
- Subject: ALREADY EXISTS — branch `transplant-15a-narrowed-subject`
  at 493d7a975, cut by the narrowed arm (live pick 1, resolved
  tooling-only green-list.txt with `git checkout --ours` +
  `git add`, per the coordinator tooling-resolution rule). VERIFIED
  at run start, before any sim, from the branch (not from the
  narrowed arm's claim): `git log 203a32775..transplant-15a-narrowed-subject`
  is exactly one commit ("OVE-48: convoSelectWant reads dawn
  commitment and top drive"); tree
  6d6216e3e414518d2c335829e130e65ec849941b — exactly the predicted
  pick-1-resolved tree; diff vs the far end is exactly 3 files,
  +320/-3 (docs/ONTOLOGY.md +3/-2,
  scripts/test-convo-dawn-priorities.js +206/-0,
  src/js/convo-wants.js +111/-1); scripts/green-list.txt is NOT in
  the commit and is byte-identical to the far end (blob
  410eccee8b091c9c5cc16b1931d98822f81fa601 both sides). If the
  subject does not verify, this arm FAILS LOUDLY and stops — it
  does not rebuild the subject itself. NEVER commit anything onto
  the subject branch. This arm's own branch
  `sim-transplant15a-band3-a` is based on master and holds ONLY
  prereg/proof/evidence commits (evidence-only landing, like the
  15C-narrowed adoption). To run the STEP, check the subject branch
  out in the worktree; check the arm branch back out before
  committing evidence.
- Pick measured: pick 1 ONLY, c937de65f "OVE-48: convoSelectWant
  reads dawn commitment and top drive". Picks 2 (OVE-50) and 3
  (OVE-51) are NOT measured by this arm: pick 2 conflicts on
  src/js/convo-wants.js because it is written against family 15D's
  believed-pantry code (03436c1bc), which the far end never had
  (narrowed-arm evidence §"Why pick 2 cannot land on the far end");
  pick 3 was never attempted. The verdict below is about OVE-48 alone.
- Seeds: FRESH band 190457–190464 (8 seeds — see §Freshness check
  below). Horizon: 150d death-aware. Policy: competent verbatim
  own-policy per step (same driver as the bisect —
  scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Legs (TWO, both on the band-3 band, both 150d death-aware):
  - Leg 1 (baseline): far end 203a32775 alone on 190457–190464,
    STEP t15a-band3-base.
  - Leg 2 (subject): transplant-15a-narrowed-subject 493d7a975 on
    190457–190464, STEP t15a-band3-subj — run ONLY if gated in
    (see the gate rule below).
  The baseline leg is run FIRST and judged on its own: it is the
  band's calibration (the far end read 4/8 on the collapse band,
  1/8 on fresh band 1; what it reads here decides whether the
  band can discriminate at all).
- DECISION TABLE (pre-registered, judge exactly this — baseline
  count first, as the gate; subject count second):
  - BAND-INCONCLUSIVE if the baseline itself reads ≤2/8 — the
    band is harsher than the collapse band and cannot
    discriminate. STOP, do not judge the subject, do NOT run
    the subject leg. This third BAND-INCONCLUSIVE closes the
    item as AMBIGUOUS, unresolvable by band variation — do not
    propose a fourth band. The old-band AMBIGUOUS verdict
    stands permanently.
  - CARRIER if subject ≤1/8 AND baseline ≥3/8.
  - AMBIGUOUS if subject reads 2/8 (baseline ≥3/8) — record
    AMBIGUOUS, treated as NOT-CARRIER for ordering, kept on
    the suspect list. This AMBIGUOUS stands permanently after
    this third band. Do NOT re-run: a same-seed re-run is
    vacuous per the round-1355 metric review.
  - NOT-CARRIER if subject ≥3/8 (baseline ≥3/8).
  The old-band 2/8-twice read and the fresh-band-1
  BAND-INCONCLUSIVE read do NOT enter this table: this arm
  judges the band-3 band only. A band-3 CARRIER would mean
  OVE-48 alone collapses the far end on unseen seeds; a
  band-3 NOT-CARRIER would clear pick 1 (the old-band 2/8
  reads as seed luck); a band-3 AMBIGUOUS would leave 15A
  exactly where it was, permanently.
- GATE RULE (task, stricter than the fresh arm): the subject leg
  runs only if gated in (baseline ≥3/8). If the baseline reads
  ≤2/8, the arm reports BAND-INCONCLUSIVE and stops judging
  WITHOUT running the subject leg — the fresh arm ran both
  legs regardless; this arm does not. The subject leg is cheap,
  but the gate is the gate: a subject corpus on an
  undiscriminating band is not evidence, and the coordinator
  decision for this run is that a third BAND-INCONCLUSIVE
  closes the item either way.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution; field-for-field
  corpus comparison against the baseline leg where useful
  (round-1355 metric review: it is the cheap decisive check —
  if the subject corpus reproduces the baseline leg
  field-for-field, the pick is deterministically inert on this
  band, not merely within noise of it).
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: the subject already exists and is verified; there
  is no cherry-pick in this arm, so the tooling-resolution rule
  does not fire here. If the subject verification fails, FAIL
  LOUDLY and stop. If MY freshness re-check finds a naming the
  coordinator missed, STOP, report the collision, and do NOT run
  — the coordinator assigns a replacement band. If the baseline
  leg reads ≤2/8, the arm reports BAND-INCONCLUSIVE, closes
  15A pick-1 as AMBIGUOUS permanently, and stops WITHOUT running
  the subject leg (gate rule above).
- STEP ids: t15a-band3-base (leg 1), t15a-band3-subj (leg 2) —
  fresh, do NOT reuse t15a-pick1 / t15a-pick1-r2 (old band),
  t15a-fresh-base / t15a-fresh-subj (fresh band 1), t15a-dawn,
  or t15a-narrowed (STOPped arms).
- STEP-SCRIPT ADAPTATION (pre-registered, not an improvisation):
  scripts/culpritbisect-step.sh hardcodes the collapse band
  (SEEDS="190391,...,190398"). The repo script is NOT modified
  (it must keep the collapse band for other arms). For BOTH legs
  the script is copied to /tmp (STEP-SCRIPT HAZARD: the script
  checks out the subject commit detached, which DELETES the
  script itself from the worktree — run from the /tmp copy with
  REPO set to the worktree, for EVERY step including the first)
  and the /tmp copy's SEEDS line is edited to the band-3 band
  (190457,...,190464) before running. The proof verifies the
  repo script still names the collapse band (unmodified) and
  that every per-seed JSON in both corpora carries a band-3 seed
  — that is the check that the /tmp copy carried the band-3
  band, not the collapse band.
- ANALYZER ADAPTATION (pre-registered, not an improvisation —
  from the fresh arm's metric review, which said the NEXT
  fresh-band prereg should name it up front):
  scripts/culpritbisect-analyze-20261113.js hardcodes the
  collapse band (`const SEEDS = [190391, …, 190398]`, no env
  override), so the step script's analyzer leg fails on a fresh
  band ("INCOMPLETE corpus — missing seeds: 190391…") even
  though the driver corpus is 8/8 complete. The driver data is
  never in doubt — the corpus is verified 8/8 with 0 instrument
  errors before the recovery. Recovery, same as the fresh arm
  (a scratch-only SEEDS edit):
  restore the four tooling scratch files from master, edit ONLY
  the SEEDS line of the scratch analyzer copy (diff vs master:
  that one line), run it with the leg's STEP id appending to
  the driver log, verify the summary (RC 0, seeds field carries
  the band-3 band), delete the scratch. The repo analyzer is
  NOT modified (proof verifies it still hardcodes the collapse
  band). The summaries' `endpoints` block still carries the
  old-band endpoint days — static reference data, not the legs'
  numbers; the legs' perSeed/wall/survived are computed from
  the band-3 corpora.
- CORPUS PATHS (recorded so the coordinator is not misled by
  the task brief's shorthand): the bisect driver writes per-seed
  JSONs to evidence/2026-11-13/perseed-culpritbisect-a-<STEP>/
  and driver logs + summaries to evidence/2026-11-13/
  (culpritbisect-a-<STEP>-driver.log / -summary.json), exactly
  as the pick-1 and fresh arms did — NOT to
  evidence/2026-11-14/perseed-transplant15a-band3/. The
  evidence file for this arm lives at
  evidence/2026-11-14/sim-transplant15a-band3.md. Commit the
  corpus directories by expanding to FILE LISTS first —
  safe-commit.sh refuses directory paths.
- Fix policy (bisect prereg §Fix policy, binding): no game-code
  change lands from this measurement arm unless the change is a
  DEFECT (not a design trade-off), small (a revert of the culprit
  hunk, or a one-hunk correction), carries its own proof test, and
  restores ≥3/8 on the same band. Otherwise — document only.

## Freshness check (re-run by THIS arm, recorded here)

Chosen band 190457–190464 (8 seeds). Search scope, run by this
arm before writing this prereg: `grep -r -l --include="*.md" -F
<seed> evidence/ hidden_files/` for each seed (all 8: zero hits);
the convergence tracker
(hidden_files/convergence-tracker.md: the only "19045" hit is
line 31931, the fresh-band-1 record "BAND-INCONCLUSIVE — fresh
band 190449–190456" — no 190457–190464 naming); `grep -r -l
--include="*.md" -F <seed>` over all evidence preregs (every
dated sim-*-prereg.md) plus any forbidden/contaminated band
lists they name (no standalone forbidden/contaminated band list
exists in the goal — confirmed by the feastfirst-a, fishfirst-a,
roleform-b, raiserseat-a preregs, which each record exactly that).
Collisions found and REJECTED: 190391–190398 (collapse band,
used by the bisect + pick-1 arms); 190449–190456 (fresh band 1,
used by sim-transplant15a-fresh-a); 190401–190408 (used by
sim-freezeline-a / sim-tendexact-confirm-a, 2026-11-13);
190411–190418 (used by sim-tributedeliv-b / sim-survivalcontrol-b,
2026-11-11); 190419–190434 (used by sim-mcconfirm-ctrl-b /
sim-mcconfirm-merge-b, 2026-11-11); 190441–190448 (named in
3 evidence files — used, not fresh). 190457–190464: ZERO hits in any
.md file, zero in any prereg, zero in the tracker.
Non-.md hits exist and are NOT reservations: the digit strings
appear as float-substrings inside JSON corpora (e.g. "190460"
inside the float 892.7619046080158 in
evidence/2026-10-22/panel-b2/panel-b2-after.repaired.json) — the
documented artifact class (a decimal inside a float), the same
artifact the tributedeliv-b prereg and the fresh arm's prereg
document (sweep-belongfeast.json). Only .md namings count as
reservations; the band is FRESH.

## Canon

docs/CANON.md read first. docs/VILLAGER-BRAIN.md Phase 4 documents
`convoSelectWant` reading "the villager's current commitment and
top drive, so a conversation opens from the same priorities the
dawn chose" — OVE-48 is the implementation of that documented
contract, not a new system. docs/CONVERSATIONS.md covers
context-aware openings (a villager's goal is one of the opening
priorities). No standalone canon doc covers OVE-48 itself — the
pick is a coherence repair inside the documented dawn-scorer +
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
spoilage, no wave or table gate number. A survival effect, if any,
would have to come through villagers choosing different
conversations — a third-order behavioral path, not a lever. The
weights are biases inside an existing decision, not new gates.
Expectation (not a verdict input): NOT-CARRIER is the likelier
read on a fresh band too; a CARRIER read would point at
dawn-commitment coherence itself mattering for survival, which
would need a mechanism follow-up, not an assumption. On the old
band the pick read 2/8 twice against the far end's 4/8, and on
fresh band 1 the far end itself read 1/8 — this third band is
the last chance for a discriminating read either way.

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
  (blob 410eccee8b091c9c5cc16b1931d98822f81fa601 both sides).
- No pick touches src/js/standing.js or scripts/policies (empty
  diff on both paths for pick 1).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0. Old-band pick-1: 2/8 twice, median 133d,
  wave-5 1/8. Fresh band 1 (190449–190456): far end 1/8, median
  109d, wave-5 3/8; subject 0/8, median 104d, wave-5 3/8 —
  BAND-INCONCLUSIVE, no verdict.

## Ordering note (recorded, not hidden)

The subject verification and the freshness check above ran as part
of prereg preparation, before this file was committed — the
narrowed arm's prereg likewise records its pre-check results. The
binding requirement is met: this prereg is committed BEFORE any
judged sim runs. No STEP t15a-band3-base / t15a-band3-subj corpus,
summary, or driver log exists. The subject branch was cut by the
narrowed arm, not by this arm; this arm verifies it, never rebuilds
it. The band-3 decision table above REPLACES the old-band and
fresh-band-1 thresholds for this arm (the old table's re-run leg
is vacuous on a deterministic harness; the fresh-band-1 table's
run-both-legs habit is replaced by the task's gate rule — the
subject leg runs only if gated in). The old-band verdict stays
AMBIGUOUS on its own band and the fresh-band-1 read stays
BAND-INCONCLUSIVE whatever this arm reads — unless this arm
reads a discriminating verdict, which settles 15A pick-1, or a
third BAND-INCONCLUSIVE, which closes it as AMBIGUOUS
permanently.
