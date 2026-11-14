# sim-transplant-round-1355 — Loop A H1 transplant round, 4 arms LANDED (fleshout-20261114T1355Z)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp, H1 transplant
program. Base far end 203a32775 (GOOD 4/8). Seeds 190391–190398, 150d
death-aware, competent verbatim own-policy per step, standing-fix swap
f8fda4295a99 per seed. Binding preregs: evidence/2026-11-13
/sim-scale-onramp-round-2115.md §3 + sim-culpritbisect-a-prereg.md +
hidden_files/family15-grouping-prereg-2026-11-14.md. Loop B live on
winnability chain throughout (1130Z claim: proofrefresh-b16 +
diplo-verb-b — NOT touched; its closeout landed fc77eef76 under this
run). Master moved twice under the run from sibling lanes (Loop B
closeout, then my own arm merges); all arm branches rebased clean,
proofs re-run green after every rebase. No push, no version bump, no
live verification — ship loop owns deploys. Merged locally, pending
ship. Final master tip 792f4570d.

## Arm 1 — sim-transplant15c-split-a: STOPPED-BY-CONFLICT (LANDED 4355b9d18)

OVE-52 alone is UNMEASURED, not exonerated, not a carrier. No subject,
no STEP t15c-split, no corpus. Cherry-picking OVE-52 1c1b23482 onto the
far end conflicts modify/delete on scripts/test-fight-brain-knowledge
-probe.js only (DU, stages 1+3); all 4 js files + ONTOLOGY.md merged
clean. Cause: the probe test was created on the origin line by OVE-49
9bc88d85d (+352 lines) and is absent at the far end; OVE-52 modifies
it (+286/-). Pick aborted; scratch subject branch deleted. Evidence
evidence/2026-11-14/sim-transplant15c-split.md + prereg
sim-transplant15c-split-prereg.md (true pre-registration, 520a5f94).
Proof scripts/test-transplant15c-split.js 60/60 + culpritbisect 116/116
on the rebased tip. Group CARRIER (OVE-49 + OVE-52 together, 1/8)
stands un-split.

COORDINATOR DECISION (this run): the narrowed 15C route is next blank
#1 — pick OVE-52's js hunks only, dropping its refresh of the probe
test (test absent at far end; the probe test lives on current master
where it passes against landed OVE-52 code). Fresh arm, own prereg +
STEP id (suggest t15c-split-js). Alternatives: OVE-49-first ordering,
or declare unmeasurable-by-conflict.

## Arm 2 — sim-transplant15e-on14-a: UNMEASURED-BY-CONFLICT at pick 2 (LANDED 8491b132b)

Family 14 does NOT unblock 15E. No judged sim ran; STEP t15e-on14
never ran. Subject branch transplant-15e-on14-subject LEFT in place at
fab68249a (far end + 14 + pick 1). Pick 0 = family 14 merge 7688cb7a4
applied clean, tree bc52919e73e6449e93ab2b64497eb25138d9ee90 exactly as
predicted by the 12+14 prereg. Pick 1 bb6a301cf clean, tree
96db10b05bc53edd44dcb614fd5d22696dc3e4e7. Pick 2 7041e1bfb (OVE-33)
conflicted on exactly the 4 predicted files: balance-proof.json,
phone-frame-proof.json, test-snippet-stage-direction.js (UU content
this time), src/js/conversation.js lines 1738/1742/1756. NEW FINDING
(mechanism): pick 2's 4-line quote check anchors on
`const s = String(sn).trim().replace(...)` — the quote-strip family 12
added when widening the guard; family 14 supplies only the narrow
original form. Pick 2 depends on family 12's widening, not only family
14's guard. Family 12 merge ac119e4ed is an ancestor of pick 2's first
parent c32ff6fa8, not of the far end. Pick 3 4a1c77cf1 never attempted.
Evidence evidence/2026-11-14/sim-transplant15e-on14.md + prereg.
Proof scripts/test-transplant15e-on14.js 208/208 + culpritbisect
116/116 on the rebased tip.

COORDINATOR DECISION (this run): the 15E route is (a2) land 14+12
first, then re-run 15E whole (12+14 pair is MEASURED NOT-CARRIER, its
subject exists) — next blank #2; fallback (b) pick 1 alone (subject
transplant-15e-subject at f541e4cd1 on bare far end already holds it);
(c) pick 1 + pick 3 untested; (d) record unmeasurable.

## Arm 3 — sim-transplant15a-pick1-a: AMBIGUOUS 2/8 twice (LANDED 7f52e9fac)

OVE-48 pick-1 alone does NOT carry the collapse, but does not clear
either. Subject verified before any sim (transplant-15a-narrowed
-subject 493d7a975, tree 6d6216e3e414518d2c335829e130e65ec849941b —
exactly the predicted pick-1-resolved tree; 3 files +320/-3;
green-list.txt NOT in the commit, byte-identical to the far end).
STEP t15a-pick1: 2/8 survived (190396, 190398); re-run with fresh STEP
id t15a-pick1-r2: 2/8 again, per-seed numbers IDENTICAL on every field.
Per-seed days 114/115/87/116/139/150/133/150, median 133d (far end
147d); wave-4 8/8, wave-5 1/8 (190398 only); national 0, table 0, wins
0; regional 8/8; tribute ready 0/8 (all veterans-short; ladder wave-4+
veterans peak 1, bar is 2); deaths 648, combat-heavy; 0 instrument
errors. Far end on the same band is 4/8 — a two-seed drop, inside the
pre-registered AMBIGUOUS band. Recorded AMBIGUOUS, treated as
NOT-CARRIER for ordering, kept on the suspect list. Evidence
evidence/2026-11-14/sim-transplant15a-pick1.md + prereg
sim-transplant15a-pick1-prereg.md (bc5cbf2cb, stage-1 proof 65/65).
Proof stage 2 283/283 + culpritbisect 116/116 on the rebased tip.

Blooded: the open sim-findings item is corroborated in BOTH directions
— seed 190398's Blooded beat fires 3 consecutive days (d131–133) yet
end-state blooded reads FALSE; seed 190396 ends blooded TRUE with ZERO
beat mentions. No new backlog entry; the open one stands (updated with
both observations at closeout).

COORDINATOR DECISION (this run): 15A is recorded AMBIGUOUS and moved
past for now — no fresh-band confirm scheduled in the next run. The
honest resolver is a FRESH seed band, not a third run of this band
(see metric review), and blanks #1–2 outrank it. Picks 2–3 remain
unmeasurable on the far end as a transplant (pick 2 needs 15D's
believed-pantry code, which the far end never had and which cannot
land as a transplant either — round-1215 mapping). 15A stays on the
suspect list; a fresh-band confirm is blank #3 when the queue reaches
it.

## Arm 4 — sim-transplant15f-picks16-a: NOT-CARRIER 4/8, far-end-identical (LANDED 792f4570d)

Family 15F picks 1–6 alone do NOT collapse the far end. Survived 4/8,
exactly the far end's own 4/8 — and stronger than the count: every
per-seed JSON is byte-identical to the far-end endpoint corpus once the
three label fields (step, run, anchorCommit) are set aside. The six
picks are deterministically inert on this band, not merely within noise
of the far end. Subject transplant-15f-subject left in place at
4eca36017 (picks 1–6: 055c48f62 → 97a67d4f8 → 49341fd78 → 6e53adc62 →
a1567198c → be39a0a4e, tree 7bee7b39eb98ce201163aaf86528d7aed220ce5b).
STEP t15f-picks16 ran once, no re-run needed (4/8 decisive). Per-seed
days 86/144/150/43/150/87/150/150 — the far-end endpoint days seed for
seed; median 150d; wave-4 8/8, wave-5 2/8 (190393, 190397); national 0,
table 0, wins 0; regional 7/8 + village 1/8 (REGIONAL_INTACT);
readiness ready4 1/8, tribute ready 1/8 (190397 only); blooded TRUE on
4/8 end states; deaths 629, combat-heavy; 0 instrument errors.
Evidence evidence/2026-11-14/sim-transplant15f-picks16.md + prereg
sim-transplant15f-picks16-prereg.md (cd97fabbc). Proof stage 2 351/351
+ culpritbisect 116/116 on the rebased tip. Pick 7 stays blocked on
the person-trust feature (family 10 content the far end never had) —
not measured here, no verdict claimed for it.

Blooded counter-observation: blooded reads TRUE on 4/8 end states in
this corpus, against 0/8 in 15C's. The flag is not lost in general; it
is seed- and path-dependent. Recorded on the open sim-findings item
at closeout.

## Wall numbers (this run's judged corpora)

- Far end (carried endpoints): 4/8 survived; merge: 1/8.
- 15A pick-1: 2/8, median 133d, wave-5 1/8.
- 15F picks 1–6: 4/8, median 150d, wave-5 2/8.
- National 0, table 0, wins 0 on the collapse band, all arms.
  Villages die fighting, not hungry (starvation 1–2 deaths per corpus).
- The veteran bar stays the binding choke: tribute-ready 0/8 (15A)
  and 1/8 (15F); ladder wave-4+ veterans peak at 1–2 against a bar
  of 2.

## Metric review (§14)

Thresholds judged exactly as pre-registered in every arm; no metric
proved wrong. Two process notes for the next run:

1. DETERMINISM MAKES THE RE-RUN LEG VACUOUS. The t15a-pick1-r2
   re-run reproduces run 1 exactly (same seeds + same code = same
   results), so a fresh-STEP-id re-run can never move a 2/8. The
   rule's intent (fresh evidence) needs either a fresh seed band or
   a stated determinism check. The AMBIGUOUS verdict is unaffected
   (2/8 twice is the pre-registered outcome), but no future arm
   should treat a deterministic re-run as resolving ambiguity.
2. FIELD-FOR-FIELD CORPUS COMPARISON IS THE CHEAP DECISIVE CHECK.
   When a transplant's per-seed days reproduce the base endpoint
   seed-for-seed, comparing the corpora field-for-field turns "same
   count" into "same run". Make it a standing leg for inert-expected
   arms (15F evidence §Metric review).

## Infrastructure

- REGISTRY.lock contention is the dominant cost: tree registrations
  took ~2.5–7 min each this run (arm 1 ~7 min, arm 2 ~3.4 min, arm 3
  ~2.5 min, arm 4 ~4.5 min); heartbeats queue similarly. Reaper holds
  the lock for its whole run (known issue, fix needs a Steve nod). No
  reaper risk materialized (heartbeats landed; staleness line 4h).
- SAFE-COMMIT INDEX CLOBBER struck every worker commit this run
  (prereg + evidence on arms 1, 3, 4; prereg on arm 2; corpus commit
  on arm 4) — repaired via the documented `git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info` pipe, commits
  verified correct first (hash-object == HEAD blob per file). No
  work lost. Watch the coordinator evidence commit for the same.
- REBASE STOP-AT-PICK QUIRK did NOT strike this run: all four arm
  rebases ran clean (2–3 picks each).
- HOST WRITE FLAP: no EPERM window struck this run. Flap-watch log
  ALL-OK per arm checks.
- TRANSIENT DOCS-TOUCHING: docs/DISEASES.md, INTAKE-TELEMETRY.md,
  ONTOLOGY.md, ROADMAP.md, VILLAGER-BRAIN.md showed as modified in
  arm 2's, arm 3's and arm 4's trees (plus a stray
  .proofrefresh-b2-panel.log), then cleared on their own — matches the
  known live doc-sync writer pattern recorded in the 1215Z run. Left
  alone, never reset.
- STEP-SCRIPT HAZARD (new, from arm 3): scripts/culpritbisect-step.sh
  checks out the subject commit detached, which DELETES the script
  itself from the worktree (it does not exist in the old tree). The
  first run survives only because bash has the script buffered; the
  immediate re-run fails with "No such file or directory". Fix route
  (script's own header documents it): copy to /tmp, run with REPO set
  to the worktree, for EVERY step including the first. Arm 4 used the
  /tmp-copy route and completed cleanly.
- check.js --quick NOT re-run (zero src/js, zero green-list files
  changed by this run — evidence + proof tests only; each arm's own
  proof + culpritbisect 116/116 green on merged master).
- Telemetry deviation check: REFUSED by the tool at coordinator
  closeout (recorder-corpus class — "all 8 --current rows carry
  top-level anchorCommit", same refusal as all four arms and all
  prior bisect/transplant arms). Baseline NOT rolled. No LOUD lines
  to investigate — the tool refused to compare at all. The arm
  verdicts stand on their preregistered thresholds and corpora.

## Coordinator decisions made this run

1. 15C narrowed js-only split is next blank #1 (pick OVE-52's js
   hunks only, drop the probe-test refresh; fresh arm, STEP
   t15c-split-js suggested).
2. 15E route is (a2) land 14+12 first, then re-run 15E whole — next
   blank #2; fallback (b) pick 1 alone (subject f541e4cd1).
3. 15A recorded AMBIGUOUS, moved past for now; fresh-band confirm is
   blank #3, deferred behind #1–2; picks 2–3 unmeasurable on the far
   end.

## Next blanks, in order

1. 15C narrowed js-only split (decision 1 above).
2. 15E-on-14+12 (decision 2 above; fallback 15E pick-1 alone).
3. 15A fresh-band confirm (deferred; see decision 3).
4. Family 16 (completeness check behind the split — carrier now
   identified, still behind).
5. Narrowed 8b.
6. Family 6b + narrowed 7b.
7. Family 2b AMBIGUOUS stays on the suspect list.
8. Proof refresh round 17 (Loop B, owed after the next manifest
   change).
9. Headcount-ceiling (Steve-call).
10. Reunion mirror pack in the wild (Steve design call).

scale-onramp stays converging (NOT converged): the carrier is
identified but un-split, 15E still unmeasured, 15A ambiguous, and
national/table/wins remain 0 on the collapse band. Food-economy stays
converging (untouched; parked). Rotation left at 4 (convergence work
does not cycle it).
