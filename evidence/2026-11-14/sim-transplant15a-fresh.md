# sim-transplant15a-fresh — family 15A PICK-1 FRESH-BAND CONFIRM (OVE-48) (Loop A, fleshout-20261114T1452Z)

Run: fleshout-20261114T1452Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-fresh-a, branch
`sim-transplant15a-fresh-a`, worktree
`~/workspace/worktrees/sim-transplant15a-fresh-a`.
Prereg: evidence/2026-11-14/sim-transplant15a-fresh-prereg.md
(committed 45edc0297, BEFORE any judged sim ran). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ hidden_files/family15-grouping-prereg-2026-11-14.md §15A +
evidence/2026-11-14/sim-transplant15a-pick1-prereg.md and
evidence/2026-11-14/sim-transplant15a-pick1.md (the old-band arm) +
coordinator decision in evidence/2026-11-14/sim-transplant-round-1355.md
(decision 3 / next blank #3 — fresh-band confirm of pick 1).

## Outcome

- OUTCOME: BAND-INCONCLUSIVE — recorded BAND-INCONCLUSIVE, no
  verdict claimed on the subject. 15A stays AMBIGUOUS on the old
  band.
- Verdict: BAND-INCONCLUSIVE. The fresh band 190449–190456 is
  harsher than the collapse band: the far end itself reads 1/8
  survived here (STEP t15a-fresh-base) against its 4/8 on the
  collapse band. Per the binding decision table, a baseline ≤2/8
  means the band cannot discriminate — the subject leg's 0/8 (STEP
  t15a-fresh-subj) is a one-seed difference on a band where the
  base already collapses, so it is NOT called CARRIER (which
  requires baseline ≥3/8), NOT called NOT-CARRIER, and NOT called
  AMBIGUOUS-on-this-band. The old-band verdict stands unchanged:
  OVE-48 alone AMBIGUOUS 2/8 twice, kept on the suspect list.
- Subject branch `transplant-15a-narrowed-subject`: verified at
  run start before any sim (tip 493d7a975, tree
  6d6216e3e414518d2c335829e130e65ec849941b — exactly the predicted
  pick-1-resolved tree; 3 files +320/-3; green-list.txt NOT in
  the commit, byte-identical to the far end, blob 410eccee…)
  and left in place, untouched by this arm. No commit was made
  onto it.
- STEP t15a-fresh-base: 8/8 corpus, 0 instrument errors. STEP
  t15a-fresh-subj: 8/8 corpus, 0 instrument errors. Both legs
  150d death-aware, competent verbatim own-policy, standing-fix
  swap per seed (sha f8fda4295a99, ROSTER CHECK marker verified
  by the step script), native standing.js restored byte-identical
  afterwards (sha 75762cb2…, verified by the step script on both
  legs).

## Prereg (binding, committed before any judged sim)

See evidence/2026-11-14/sim-transplant15a-fresh-prereg.md. Base:
far end 203a32775 with the roster-check standing fix swapped in
for every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified 75762cb2…). Fresh seeds 190449–190456,
150d death-aware, competent verbatim own-policy per step.
Decision table (fresh-band only): baseline ≤2/8 →
BAND-INCONCLUSIVE; otherwise subject ≤1/8 CARRIER, subject 2/8
AMBIGUOUS (record, do NOT re-run), subject ≥3/8 NOT-CARRIER.
Fix policy (bisect prereg): no game-code change lands unless a
defect, small, own proof, restores ≥3/8 — not triggered (no
defect found, verdict BAND-INCONCLUSIVE).

## Family identity (verified at run start, before any sim)

- Pick 1: c937de65f32d26e064d8935dd984490b2ee50a6c "OVE-48:
  convoSelectWant reads dawn commitment and top drive". First
  parent 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32. Diff: 4 files —
  docs/ONTOLOGY.md +3/-2, scripts/green-list.txt +1/-0,
  scripts/test-convo-dawn-priorities.js +206/-0 (new test),
  src/js/convo-wants.js +111/-1.
- Subject: far end + pick 1 minus green-list.txt, 3 files
  +320/-3, tree 6d6216e3e414518d2c335829e130e65ec849941b.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).
- Freshness (re-checked by this arm): 190449–190456 zero hits in
  any evidence .md, any prereg, or the convergence tracker; the
  one non-.md hit is a JSON float-substring inside a corpus file
  (sweep-belongfeast.json), the documented artifact class — not a
  reservation. Rejected bands: 190401–190408, 190411–190418,
  190419–190434.

## The steps — per-seed tables

### Leg 1 — baseline, far end 203a32775, STEP t15a-fresh-base: 1/8 survived

| seed | days | end | maxWave | standing | deaths | vetSays | errors |
|------|------|-----|---------|----------|--------|---------|--------|
| 190449 | 107 | village-lost | 4 | 199 | 78 | 22 | 0 |
| 190450 | 150 | survived | 5 | 540 | 121 | 47 | 0 |
| 190451 | 109 | village-lost | 5 | 525 | 83 | 25 | 0 |
| 190452 | 87 | village-lost | 4 | 150 | 64 | 74 | 0 |
| 190453 | 77 | village-lost | 4 | 199 | 71 | 20 | 0 |
| 190454 | 88 | village-lost | 4 | 175 | 65 | 14 | 0 |
| 190455 | 134 | village-lost | 5 | 380 | 71 | 44 | 0 |
| 190456 | 150 | village-lost | 4 | 199 | 104 | 29 | 0 |

Survived 1/8 (190450 only). Median 109d. Wave-4 8/8, wave-5 3/8
(190450, 190451, 190455); national 0, table 0, wins 0; regional
8/8 (REGIONAL_INTACT). Tribute ready 1/8 (190450 only — the sole
survivor, 2 veterans against a need of 2, ready5 true); all other
seeds veterans-short (0–1). Ladder wave-4+ veterans peak 2
(190450 only). Blooded end-state 1/8 (190450). Deaths 657 total.

Death causes (657 total, combat-heavy, same profile as the
collapse band): villager combat 264, expedition 149, combat 122,
the wild 65, monster 22, starvation 5, a wound that wouldn't
close 8, sickness 5, contest 5, the arena 4, dehydration 2,
a stranger 2, ambush 1, Hushpuppy 1, Gavel 1, Ugly-Eyes 1.

### Leg 2 — subject, transplant-15a-narrowed-subject 493d7a975, STEP t15a-fresh-subj: 0/8 survived

| seed | days | end | maxWave | standing | deaths | vetSays | errors |
|------|------|-----|---------|----------|--------|---------|--------|
| 190449 | 110 | village-lost | 4 | 199 | 69 | 14 | 0 |
| 190450 | 141 | village-lost | 5 | 445 | 137 | 38 | 0 |
| 190451 | 116 | village-lost | 5 | 415 | 106 | 76 | 0 |
| 190452 | 41 | village-lost | 3 | 75 | 41 | 67 | 0 |
| 190453 | 78 | village-lost | 4 | 199 | 85 | 14 | 0 |
| 190454 | 104 | village-lost | 4 | 175 | 60 | 15 | 0 |
| 190455 | 96 | village-lost | 5 | 350 | 74 | 45 | 0 |
| 190456 | 96 | village-lost | 4 | 199 | 83 | 31 | 0 |

Survived 0/8. Median 104d. Wave-4 7/8, wave-5 3/8 (190450,
190451, 190455); national 0, table 0, wins 0; regional 7/8 +
village 1/8 (190452, REGIONAL_INTACT). Tribute ready 0/8 (all
veterans-short; tribute veterans 0 on six seeds, 1 on 190455
against a need of 2). Ladder wave-4+ veterans peak 1 (190455
only). Blooded end-state 1/8 (190455). Deaths 655 total.

Death causes (655 total, combat-heavy, same profile as the
baseline leg): villager combat 246, expedition 170, combat 123,
the wild 67, monster 18, starvation 2, a wound that wouldn't
close 7, sickness 3, contest 3, ambush 2, the arena 2,
dehydration 2, thirst 2, a stranger 3, Gavel 1, The Callback 1,
the expedition 1, The Ugly Beast 2.

## Field-for-field corpus comparison (round-1355 metric review: the cheap decisive check)

Baseline leg vs subject leg, seed by seed: days identical 0/8,
deaths identical 0/8, vetSays identical 0/8 — the pick moves
trajectories on every seed, so unlike 15F it is NOT
deterministically inert on this band. EndReason identical 7/8
(only 190450 flips survived→village-lost), maxWave identical
7/8 (only 190452 drops 4→3, dying day 41 at village scale).
Standing identical 4/8. The direction is consistently worse for
the subject (median 109d→104d; the baseline's sole survivor dies
at 141d with the pick; 190456 falls 150d→96d; 190452 falls
87d→41d) — but on a band where the far end itself reads 1/8,
that direction is a one-seed survival difference on a collapsed
baseline, and the pre-registered table forbids calling it
CARRIER. The honest read is exactly the verdict: the band cannot
discriminate, so no claim about the pick follows from these two
legs. A third band that calibrates the far end at ≥3/8 is what
would discriminate — a coordinator call, not this arm's.

## What this means (plain words)

The fresh band turned out to be a harsher place than the collapse
band: villages that survive 4 times in 8 on the old seeds survive
only once in 8 here, even with no new code at all — just different
starting dice. Against that background, the pick's villages
surviving zero times in 8 looks bad at a glance, but it is one
village worse than a baseline that is itself nearly wiped out, so
it proves nothing either way. The pick does change what happens
in every village — no two seeds play out the same with and without
it — so it is not a no-op; but whether that change helps or hurts
survival cannot be read off a band this harsh. 15A stays where the
old band left it: AMBIGUOUS, on the suspect list. The veteran bar
stays the binding choke on both legs (tribute-ready 1/8 baseline,
0/8 subject; the bar of 2 living wave-4+ veterans is met by one
seed across both legs), and villages die fighting, not hungry
(starvation 5 and 2 deaths across the two corpora).

## Sense-testing (SENSE-TESTING LAW — transcripts read, judged in plain words)

Read the vetSays transcripts from all 16 per-seed files (575
lines). The villages read like people:

- Veteran kills are announced on camera with names ("Stan just
  put down The Redactor... on CAMERA. That's a veteran kill,
  folks. REMEMBER the name." — subject seed 190450, d29; "Colin
  just put down Spool" — same seed, d33). Door fights name their
  defenders and their hurt ("Jack, Giulia, Jesse, Pavel and Mateo
  met them at the door — 5 put down... are hurt").
- Villagers teach each other unprompted: Sofia passes Ground Elder
  around the fire ("Someone asks a dumb question. Nobody minds.
  That's how you learn." — subject seed 190450, d12), and the
  foragers' handling deepens over days ("They know it now — which
  parts are worth hauling, which bruise, how it wants to be
  carried").
- The System's audience voice stays in character ("We've stopped
  pretending these are animals now... what comes out of the
  treeline next was never alive the way you mean it." — both legs,
  seed 190450, d25).

Two flags, both recorded not fixed (measurement arm, no fix
policy trigger):

1. BLOODED BEAT vs FLAG (recurrence of an already-open finding,
   corroborated in one direction on BOTH legs): baseline seeds
   190451 and 190455 fire the Blooded beat 3 times each yet end
   `blooded` FALSE; subject seed 190450 fires it 5 times yet ends
   FALSE. The consistent direction is beat-fires-but-flag-false
   (the reverse case — flag true with zero mentions — was the
   old-band 190396 case). This is the same finding already open
   in hidden_files/sim-findings.md; this corpus adds three more
   instances across two fresh legs. No new backlog entry; the open
   one stands.
2. Low-trust refusal repeat — the low-trust refusal lines repeat (seed 190452, BOTH legs — a property
   of the seed, not of OVE-48): the same unnamed villager ("A
   person, maybe 50s, with a burn-scarred forearm") refuses the
   scholar 21 times on the baseline leg and 18 on the subject leg
   ("You haven't earned that yet" / "Ask someone who trusts
   you"), concentrated in the first days before anyone is
   introduced. The refusals are honest, but the same two lines
   from an unnamed person, twenty times, reads as a stuck loop
   rather than a conversation. It is identical with and without
   the pick, so it is not an OVE-48 effect; recorded here as a
   sense-testing flag for a future arm, not chased mid-run.

No robotic, static, or repeated-beyond-mechanism dialogue was
found beyond the two flags. Nothing in the transcripts suggests
OVE-48 changed what villagers say in a way that reads wrong —
conversation wants following dawn priorities is invisible at this
sampling depth, which is consistent with a bias inside an existing
decision rather than a new behaviour.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  All commits and file writes landed first try.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (45edc0297) — `git status` showed both committed files as
  staged-deleted although the commit was correct (worktree
  hashes matched the HEAD blobs exactly). Repaired with the
  documented pipe (`git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`); verified `git status`
  empty + `git diff HEAD` empty afterwards. No work lost.
- SERVICE RESTART (new, recorded so the next arm does not
  re-learn it): the leg-1 run was killed mid-step by a service
  restart after exactly 1 seed (190449: 107d village-lost) — the
  driver process died, the fix standing.js swap was left in
  place, and /tmp was wiped (the /tmp step-script copy was
  gone). Recovery: verified no driver process was alive, restored
  the far end's native standing.js byte-identical (sha 75762cb2…),
  deleted the partial corpus + driver log, deleted the orphaned
  tooling scratch (which had blocked the branch checkout), checked
  the arm branch back out, recreated the /tmp copy (diff vs the
  repo script: SEEDS line only), and re-ran leg 1 clean. The
  re-run reproduced the interrupted seed exactly (190449: 107d
  village-lost, same deaths/vetSays) — determinism confirmed on
  the recovery, not assumed. Lesson: /tmp does not survive a
  restart; any /tmp step-script copy must be re-created after one,
  and a killed step always leaves the fix swap + scratch behind
  to clean up before the branch checkout will succeed.
- STEP-SCRIPT HAZARD (from round-1355, followed): the script was
  run from the /tmp copy with REPO set to the worktree for EVERY
  step including the first — and, per the prereg adaptation, the
  /tmp copy's SEEDS line was edited to the fresh band (the repo
  script still names the collapse band, verified by the proof).
- ANALYZER HARDCODE (new, recorded so the next fresh-band arm
  does not re-learn it): scripts/culpritbisect-analyze-20261113.js
  hardcodes the collapse band (`const SEEDS = [190391, …,
  190398]`, no env override), so the step script's analyzer leg
  failed on BOTH steps ("INCOMPLETE corpus — missing seeds:
  190391…") even though the driver corpora were 8/8 complete.
  The driver data was never in doubt — both corpora were verified
  8/8 with 0 instrument errors before the recovery. Recovery,
  same on both legs: restore the four tooling scratch files from
  master, edit ONLY the SEEDS line of the scratch analyzer copy
  (diff vs master: that one line), run it with the leg's STEP id
  appending to the driver log, verify the summary (RC 0, seeds
  field carries the fresh band), delete the scratch. The repo
  analyzer is NOT modified (proof verifies it still hardcodes the
  collapse band). The summaries' `endpoints` block still carries
  the old-band endpoint days — static reference data, not the
  legs' numbers; the legs' perSeed/wall/survived are computed
  from the fresh corpora. A future fresh-band arm should expect
  this and plan the scratch-analyzer edit up front; the prereg
  for this arm did not anticipate it (the adaptation is recorded
  here and in the proof, not hidden).
- REGISTRY LOCK: the heartbeat landed on the first attempt
  (~seconds, no contention this run).
- Standing fix swap: swapped in per step (sha f8fda4295a99,
  ROSTER CHECK marker verified by the step script), native
  restored byte-identical afterwards (sha 75762cb2…, verified
  by the step script on both runs). On-disk standing.js after
  the run is the arm branch's (master's) version, as expected.
- No safe-commit refusal. No runtime restart struck this arm
  after the leg-1 recovery.
- Telemetry deviation check: REFUSED by the tool
  (recorder-corpus class, same as all prior bisect/transplant
  arms) — "refusing recorder-corpus input: all 8 --current rows
  carry top-level anchorCommit". Baseline NOT rolled. No LOUD
  lines to investigate. (The first attempt used a wrong glob —
  the tool only globs the basename, so the directory-glob form
  found no files; the per-leg basename form produced the
  refusal above.)

## Metric review

- The binding decision table judged exactly as pre-registered
  (baseline 1/8 ≤2/8 → BAND-INCONCLUSIVE; no verdict claimed on
  the subject; the subject's 0/8 is not called CARRIER because
  CARRIER requires baseline ≥3/8). No metric proved wrong, but
  two process notes for the next run:
  (1) A fresh band does not guarantee a discriminating band. The
  fresh band was chosen for freshness (zero prior use), not for
  calibration — and it calibrated the far end at 1/8, below the
  collapse band's 4/8. A fresh-band confirm needs a calibration
  check on the band BEFORE judging the subject (this arm ran the
  baseline leg first, which is that check — the table's gate is
  the mechanism, and it fired correctly). A future resolver
  should pick its band, run the far end on it, and only then
  spend the subject leg — or pre-register a band whose far-end
  read is already known to be ≥3/8. Blind freshness alone is not
  enough.
  (2) The analyzer's hardcoded band (see Infrastructure) means a
  fresh-band arm's step script cannot complete as written — the
  analyzer leg fails after the driver finishes. The recovery is
  mechanical (scratch-only SEEDS edit), but it was not in this
  arm's prereg. Future fresh-band preregs should name the
  analyzer adaptation up front, the same way this arm's prereg
  named the step-script adaptation.
- The 0/8 subject read is NOT a carrier verdict and NOT a clear:
  15A stays AMBIGUOUS on the old band, on the suspect list, per
  the prereg. The fix policy did not trigger (no defect
  identified).

## Proof

- scripts/test-transplant15a-fresh.js — stage 1: 84 passed, 0
  failed (committed with the prereg, 45edc0297); stage 2: 329
  passed, 0 failed (both STEP corpora, verdict, standing
  restored, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs, 0 failed (re-run
  after the steps; the step tooling was untouched, but the
  re-run confirms the shared harness still passes on this tree).
