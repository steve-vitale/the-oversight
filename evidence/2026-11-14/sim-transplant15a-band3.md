# sim-transplant15a-band3 — family 15A PICK-1 THIRD BAND (OVE-48) (Loop A, fleshout-20261114T2115Z)

Run: fleshout-20261114T2115Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-band3-a, branch
`sim-transplant15a-band3-a`, worktree
`~/workspace/worktrees/sim-transplant15a-band3-a`.
Prereg: evidence/2026-11-14/sim-transplant15a-band3-prereg.md
(committed cca618e1e, BEFORE any judged sim ran). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ hidden_files/family15-grouping-prereg-2026-11-14.md §15A +
evidence/2026-11-14/sim-transplant15a-pick1-prereg.md and
evidence/2026-11-14/sim-transplant15a-pick1.md (old band —
AMBIGUOUS 2/8 twice) + evidence/2026-11-14/sim-transplant15a-fresh-prereg.md
and evidence/2026-11-14/sim-transplant15a-fresh.md (fresh band 1 —
BAND-INCONCLUSIVE) + coordinator decisions in
evidence/2026-11-14/sim-transplant-round-1653.md (decision 3 /
next blank #2) and evidence/2026-11-14/sim-transplant-round-2015.md
(next blank #2) — this run is the LAST band for 15A pick-1.

## Outcome

- OUTCOME: CARRIER — recorded CARRIER. OVE-48 alone carries (part
  of) the collapse on this band.
- Verdict: CARRIER. The baseline leg (far end 203a32775 on fresh
  band 190457–190464, STEP t15a-band3-base) reads 3/8 survived —
  the band discriminates, the gate is in. The subject leg
  (transplant-15a-narrowed-subject 493d7a975, STEP t15a-band3-subj)
  reads 0/8 survived. Per the binding decision table (baseline
  ≥3/8 → judge the subject; subject ≤1/8 → CARRIER), OVE-48
  alone drops the far end from 3/8 to 0/8 on unseen seeds. This
  settles 15A pick-1: it is a carrier, not a seed-luck artifact
  of the old band. The old-band AMBIGUOUS 2/8-twice read and the
  fresh-band-1 BAND-INCONCLUSIVE read are superseded as the
  verdict on pick 1 — the third band discriminated, and the pick
  failed it outright.
- Subject branch `transplant-15a-narrowed-subject`: verified at
  run start before any sim (tip 493d7a975, tree
  6d6216e3e414518d2c335829e130e65ec849941b — exactly the predicted
  pick-1-resolved tree; 3 files +320/-3; green-list.txt NOT in
  the commit, byte-identical to the far end, blob 410eccee…)
  and left in place, untouched by this arm. No commit was made
  onto it.
- STEP t15a-band3-base: 8/8 corpus, 0 instrument errors. STEP
  t15a-band3-subj: 8/8 corpus, 0 instrument errors. Both legs
  150d death-aware, competent verbatim own-policy, standing-fix
  swap per seed (sha f8fda4295a99, ROSTER CHECK marker verified
  by the step script), native standing.js restored byte-identical
  afterwards (sha 75762cb2…, verified by the step script on both
  legs).

## Prereg (binding, committed before any judged sim)

See evidence/2026-11-14/sim-transplant15a-band3-prereg.md. Base:
far end 203a32775 with the roster-check standing fix swapped in
for every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified 75762cb2…). Fresh seeds 190457–190464,
150d death-aware, competent verbatim own-policy per step.
Decision table (band-3 only): baseline ≤2/8 →
BAND-INCONCLUSIVE (STOP, do not judge, do NOT run the subject
leg; a third BAND-INCONCLUSIVE would have closed the item as
AMBIGUOUS permanently, no fourth band); otherwise subject ≤1/8
CARRIER, subject 2/8 AMBIGUOUS (stands permanently, do NOT
re-run), subject ≥3/8 NOT-CARRIER. Fix policy (bisect prereg):
no game-code change lands unless a defect, small, own proof,
restores ≥3/8 — see §Fix policy below (triggered in its
defect-shaped form: the carrier verdict points at the pick
itself, and the next step is a coordinator call, not this arm
landing a revert).

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
- Freshness (re-checked by this arm): 190457–190464 zero hits in
  any evidence .md, any prereg, or the convergence tracker; the
  only non-.md hits are JSON float-substring artifacts (e.g.
  "190460" inside 892.7619046080158), the documented artifact
  class — not reservations. Rejected bands: 190391–190398,
  190449–190456, 190401–190408, 190411–190418, 190419–190434,
  190441–190448.

## The steps — per-seed tables

### Leg 1 — baseline, far end 203a32775, STEP t15a-band3-base: 3/8 survived

| seed | days | end | maxWave | standing | deaths | vetSays | errors |
|------|------|-----|---------|----------|--------|---------|--------|
| 190457 | 150 | survived | 4 | 199 | 62 | 58 | 0 |
| 190458 | 101 | village-lost | 4 | 199 | 67 | 48 | 0 |
| 190459 | 150 | survived | 4 | 199 | 54 | 17 | 0 |
| 190460 | 124 | village-lost | 4 | 199 | 74 | 14 | 0 |
| 190461 | 129 | village-lost | 4 | 199 | 106 | 29 | 0 |
| 190462 | 150 | survived | 4 | 199 | 59 | 21 | 0 |
| 190463 | 23 | village-lost | 2 | 0 | 25 | 2 | 0 |
| 190464 | 115 | village-lost | 4 | 199 | 86 | 40 | 0 |

Survived 3/8 (190457, 190459, 190462). Median 129d (analyzer
upper-median; the middle two days are 124d and 129d). Wave-4 7/8,
wave-5 0/8; national 0, table 0, wins 0; regional 7/8 (REGIONAL_INTACT)
+ village 1/8 (190463). Tribute ready 0/8 (all veterans-short;
tribute veterans 0 on six seeds, 1 on 190459 and 190462 against a
need of 2). Ladder wave-4+ veterans peak 1 (190459, 190462 only).
Blooded end-state 4/8 (190458, 190459, 190460, 190462). Deaths 533
total. Standing range 0–199.

Death causes (533 total, combat-heavy, same profile as the
collapse band): villager combat 246, combat 99, expedition 68,
the wild 54, monster 23, starvation 7, sickness 6, the arena 5,
a wound that wouldn't close 5, a stranger 3, thirst 3, ambush 2,
alien 2, the night 2, contest 2, Big Big 1, Choir Toad 1,
Don't-Look 1, food poisoning (raw) 1, Gavel 1, Performance
Review 1.

### Leg 2 — subject, transplant-15a-narrowed-subject 493d7a975, STEP t15a-band3-subj: 0/8 survived

| seed | days | end | maxWave | standing | deaths | vetSays | errors |
|------|------|-----|---------|----------|--------|---------|--------|
| 190457 | 134 | village-lost | 5 | 345 | 64 | 49 | 0 |
| 190458 | 108 | village-lost | 5 | 380 | 72 | 25 | 0 |
| 190459 | 109 | village-lost | 4 | 175 | 90 | 15 | 0 |
| 190460 | 129 | village-lost | 5 | 470 | 112 | 44 | 0 |
| 190461 | 135 | village-lost | 4 | 199 | 97 | 27 | 0 |
| 190462 | 123 | village-lost | 4 | 199 | 56 | 19 | 0 |
| 190463 | 138 | village-lost | 4 | 199 | 80 | 22 | 0 |
| 190464 | 142 | village-lost | 5 | 265 | 64 | 43 | 0 |

Survived 0/8. Median 134d (analyzer upper-median; middle two
days 129d and 134d). Wave-4 8/8, wave-5 4/8 (190457, 190458,
190460, 190464); national 0, table 0, wins 0; regional 8/8.
Tribute ready 0/8 (all veterans-short; tribute veterans 0 on
seven seeds, 1 on 190460 against a need of 2). Ladder wave-4+
veterans peak 1 (190460 only). Blooded end-state 3/8 (190457,
190460, 190464). Deaths 635 total. Standing range 175–470.

Death causes (635 total, combat-heavier than the baseline leg):
villager combat 266, combat 146, expedition 80, the wild 74,
monster 15, the arena 15, a stranger 9, sickness 8, a wound
that wouldn't close 7, ambush 4, contest 3, the night 2, alien 2,
thirst 2, experiment 1, The Terms of Service 1. Starvation 0
(no starvation death with the pick, against 7 on the baseline).

## Field-for-field corpus comparison (round-1355 metric review: the cheap decisive check)

Baseline leg vs subject leg, seed by seed: days identical 0/8,
deaths identical 0/8, vetSays identical 0/8 — the pick moves
trajectories on every seed, so unlike 15F it is NOT
deterministically inert on this band. EndReason identical 5/8
(only the baseline's three survivors flip to village-lost),
maxWave identical 3/8, standing identical 2/8. The direction is
consistently worse for the subject on survival (3/8 → 0/8, every
baseline survivor dies with the pick, all between day 108 and
day 142) — but the subject's villages reach FURTHER while dying:
wave-5 0/8 → 4/8, standing 199 max → 470 max, median 129d →
134d. The pick's villages push further into the endgame and then
all die there; the baseline's villages die earlier or survive.
The veteran bar stays the binding choke on both legs
(tribute-ready 0/8 both legs; the bar of 2 living wave-4+
veterans is met by no seed across both legs), and villages die
fighting, not hungry (starvation 7 baseline, 0 subject).

## What this means (plain words)

On fresh, unseen starting dice, the far end survives 3 times in
8 — and with OVE-48 alone added, it survives zero times in 8.
That is the pre-registered carrier bar, met cleanly: the change
that makes villagers talk about what dawn already decided they
are doing today, on its own, takes a village that sometimes
survives and makes it never survive. The old band's grey 2/8
was not seed luck after all — on this band the effect is a full
three-seed drop to zero.

The shape of it is strange, and worth saying plainly because it
is the opposite of a simple "the pick makes villages weaker":
with the pick, villages reach further — four of them unlock wave
5 where none did without it, their standing climbs as high as
470 where the baseline never passed 199, and they live slightly
longer on average. Then every one of them dies, all in the same
late window, days 108 to 142, all fighting. It reads as if the
pick's villages commit harder to the endgame push — further,
louder, more exposed — and none of them comes back from it.
That is a description of the numbers, not a proven mechanism:
nothing in this corpus shows WHY the conversations change the
fighting (see Sense-testing — the conversation path itself
leaves no trace in the recorded transcripts). The mechanism is
the next question, not this arm's verdict. What this arm proves
is the survival effect, and it is decisive on this band.

## Sense-testing (SENSE-TESTING LAW — transcripts read, judged in plain words)

Read the vetSays transcripts from all 16 per-seed files (473
lines). The villages read like people:

- Veteran kills are announced on camera with names ("Joyce just
  put down Ad Break... on CAMERA. That's a veteran kill, folks.
  REMEMBER the name." — subject seed 190460, d34; "Alessandra
  just put down The Terms of Service" — same seed, d41; "Aki
  just put down Spool" — d48; "Camila just put down The
  Influencer" — d51). The subject's loudest village, 190460,
  has 14 veteran-kill lines — and still dies at day 129.
- Gossip travels and grows: the same retelling by the fire
  ("The truth left this story two fires ago. What's left is
  better theater." — seed 190457, d2, identical on BOTH legs:
  the two runs share their opening days, then diverge).
- The System's audience voice stays in character ("You've
  gotten too big for the story. Ratings are GREAT, by the way —
  but you're threatening the narrative now. So the narrative is
  fighting back. Meet the PRODUCERS." — subject seed 190457,
  d107).
- The baseline's seed 190463 dies at day 23 at wave 2 with only
  two transcript lines in its whole life — two door fights
  ("Tomas, Mai, Ernesto, Kathleen and Catalina met them at the
  door — 3 put down, 1 driven off, 1 barely walked away." d14;
  "Ernesto and Farid met them at the door — 2 put down." d21)
  and then silence. A village that dies that fast barely gets to
  speak, which reads honest rather than broken — but it is a
  thin story, and it is the only seed on either leg that never
  reaches wave 4.

THE MECHANISM GAP (stated plainly, as the task requires): the
measured path goes unexercised in this corpus. Zero of the 473
vetSays lines mention dawn, commitment, a top drive, or what a
villager wants to talk about, on either leg; and the per-seed
telemetry carries no conversation-want event type at all (the
teleCounts keys include bond_proposed, skill_taught, counter_
discovered — but nothing for convoSelectWant or dawn
commitment). OVE-48 changes which want a conversation opens
with, and this harness records nothing about conversations
opening. So this band proves a SURVIVAL effect of the pick —
0/8 against a 3/8 baseline — not the conversation behavior
itself. Whether villagers actually talk differently with the
pick, and how that different talk reaches the fighting, is
unmeasured here and needs an instrument that logs conversation
opens, not another survival band. (No fourth band is proposed
for the survival question — this band settled it. The open
question is the mechanism, and it is a different instrument.)

Two flags, both recorded not fixed (measurement arm; the fix
policy question is a coordinator call — see §Fix policy):

1. BLOODED BEAT vs FLAG (recurrence of an already-open finding,
   corroborated in BOTH directions on this band): the exact beat
   "Blooded — the village knows where the Producers bleed" fires
   0 times on the baseline leg, yet the blooded flag ends TRUE
   on 4 baseline seeds (190458, 190459, 190460, 190462) — the
   reverse case, flag true with zero mentions. On the subject
   leg the beat fires 3× (190457, flag TRUE), 4× (190458, flag
   FALSE), 11× (190460, flag TRUE), and 1× (190464, flag TRUE).
   The 190458 case is the open finding again (beat fires, flag
   false); the baseline's four flag-true-zero-beat seeds are the
   reverse case again. And the beat repeats as a daily
   re-announcement of a standing state (11 firings on 190460
   alone). This is the same finding already open in
   hidden_files/sim-findings.md; this corpus adds five more
   instances across two legs, in both directions. No new backlog
   entry; the open one stands. (Note: a loose /Blooded/i count
   also catches the Cold-Blooded ability lines — 5 on subject
   190457, 8 on 190464, 1 on 190461 baseline — which are a
   different, correctly-flagged ability, not the beat. The
   counts above use the exact beat string.)
2. The low-trust refusal repeat does NOT reproduce on this band:
   only 2 refusal lines appear in the whole corpus (seed 190457,
   both legs), against 21 and 18 on the fresh-band-1 seed
   190452. The stuck-loop reading was a property of that seed,
   not a general defect. No flag carried forward.

No robotic, static, or repeated-beyond-mechanism dialogue was
found beyond the Blooded beat repeat in flag 1. Nothing in the
transcripts suggests OVE-48 changed what villagers say in a way
that reads wrong — conversation wants following dawn priorities
is invisible at this sampling depth, which is consistent with a
bias inside an existing decision rather than a new behaviour,
and with the mechanism gap above.

## Fix policy

The bisect prereg's fix policy binds this arm: no game-code
change lands unless the change is a DEFECT, small, carries its
own proof test, and restores ≥3/8 on the same band. The carrier
verdict points at the pick itself — the candidate fix is a
revert of OVE-48 (one commit, src/js/convo-wants.js + test +
ONTOLOGY note), which is small and has an obvious proof (the
subject leg re-run without the pick IS the baseline leg, 3/8).
But whether reverting a dawn-coherence repair is a DEFECT fix
or a design trade-off is a coordinator/Steve call, not this
arm's: OVE-48 implements a documented contract (VILLAGER-BRAIN.md
Phase 4), and the survival mechanism is unmeasured (see the
mechanism gap). This arm therefore lands NO game-code change
and makes NO revert. The coordinator decides: (a) revert OVE-48
and re-measure, (b) keep OVE-48 and treat the carrier read as
the cost of dawn coherence, or (c) instrument conversation
opens first and find the mechanism before deciding. My
recommendation, as the arm that measured it: (c) first — a
revert decided without knowing how talk reaches the fighting
risks re-introducing whatever the coherence repair was fixing,
and the instrument (log convo opens + the want chosen) is small.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  All commits and file writes landed first try.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (cca618e1e) — `git status` showed both committed files as
  staged-deleted although the commit was correct (worktree
  hashes matched the HEAD blobs exactly). Repaired with the
  documented pipe (`git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`); verified `git status`
  empty + `git diff HEAD` empty afterwards. No work lost.
  (Third consecutive arm on this family to be struck on the
  prereg commit — pick-1, fresh, and now band-3.)
- STEP-SCRIPT HAZARD (followed from the prereg): the script was
  run from the /tmp copy with REPO set to the worktree for EVERY
  step including the first; the /tmp copy's SEEDS line was edited
  to the band-3 band (diff vs the repo script: that one line).
  The repo script still names the collapse band, verified by
  the proof.
- ANALYZER HARDCODE (named up front in the prereg, per the fresh
  arm's metric review): scripts/culpritbisect-analyze-20261113.js
  hardcodes the collapse band, so the step script's analyzer leg
  failed on BOTH steps ("INCOMPLETE corpus — missing seeds:
  190391…") even though the driver corpora were 8/8 complete.
  Recovery, same on both legs and exactly as pre-registered
  (a scratch-only SEEDS edit):
  restore the four tooling scratch files from master, edit ONLY
  the SEEDS line of the scratch analyzer copy (diff vs master:
  that one line), run it with the leg's STEP id appending to the
  driver log, verify the summary (RC 0, seeds field carries the
  band-3 band), delete the scratch. The repo analyzer is NOT
  modified (proof verifies it still hardcodes the collapse band).
  The summaries' `endpoints` block still carries the old-band
  endpoint days — static reference data, not the legs' numbers;
  the legs' perSeed/wall/survived are computed from the band-3
  corpora. The subject leg took ~10.5 minutes of wall time
  (baseline ~5.5) — the driver runs seeds sequentially and the
  subject's villages live longer per seed.
- REGISTRY LOCK: the heartbeat landed on the first attempt
  (~seconds, no contention this run).
- Standing fix swap: swapped in per step (sha f8fda4295a99,
  ROSTER CHECK marker verified by the step script), native
  restored byte-identical afterwards (sha 75762cb2…, verified
  by the step script on both runs). On-disk standing.js after
  the run is the arm branch's (master's) version, as expected.
- No service restart struck this arm. No safe-commit refusal.
- Telemetry deviation check: REFUSED by the tool
  (recorder-corpus class, same as all prior bisect/transplant
  arms) — "refusing recorder-corpus input: all 8 --current rows
  carry top-level anchorCommit". Baseline NOT rolled. No LOUD
  lines to investigate. (The first attempt used a bare
  directory name as --current and produced a LOUD ENOENT parse
  line — my own wrong invocation, not a deviation; the correct
  basename-glob form on both legs produced the refusal above.)
- CORPUS PATHS: the driver writes to evidence/2026-11-13/
  (perseed-culpritbisect-a-t15a-band3-base/ and -subj/, plus
  the two driver logs and summaries), as the pick-1 and fresh
  arms did — not to evidence/2026-11-14/perseed-transplant15a-band3/
  as the task brief's shorthand named it. Recorded in the
  prereg so the coordinator is not misled.

## Metric review

- The binding decision table judged exactly as pre-registered
  (baseline 3/8 ≥3/8 → gate in, subject leg ran; subject 0/8
  ≤1/8 → CARRIER). No metric proved wrong. Two process notes:
  (1) The gate worked as designed and saved nothing this time
  but would have saved the subject leg on a harsh band — the
  fresh-band-1 lesson (blind freshness does not guarantee a
  discriminating band) is now a working gate, not just a note:
  this band calibrated the far end at 3/8, between the
  collapse band's 4/8 and fresh band 1's 1/8. Three bands now
  read the far end at 4/8, 1/8, 3/8 — the band itself moves
  survival by three seeds, which is the honest scale of
  band-to-band noise, and the pick's 3/8 → 0/8 drop on THIS
  band is a within-band comparison, not a cross-band one.
  (2) The analyzer hardcode is now a named, pre-registered
  adaptation rather than a surprise — the fresh arm's metric
  review asked for exactly that, and it worked. The remaining
  wart is that the step script FAILS (exit 1) on every fresh
  band by design of the hardcoded analyzer; a future tooling
  pass could teach the analyzer a SEEDS env override, but
  that is a tooling change outside this arm.
- The median-days secondary moved WITH the verdict in the
  unexpected direction (subject median 134d > baseline 129d
  while survival fell 3/8 → 0/8) — median survival alone would
  have misread this leg. The survival count is the primary for
  exactly this reason; the secondary is diagnostic only.
- The 0/8 subject read IS a carrier verdict under the binding
  table: 15A pick-1 is CARRIER, settled on the third band. No
  fourth band is proposed, per the coordinator decision. The
  fix policy did not trigger a landing (no revert by this arm —
  see §Fix policy; the revert decision is a coordinator call).

## Proof

- scripts/test-transplant15a-band3.js — stage 1: 88 passed, 0
  failed (committed with the prereg, cca618e1e); stage 2: 340
  passed, 0 failed (both STEP corpora, verdict, standing
  restored, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs, 0 failed (re-run
  after the steps; the step tooling was untouched, but the
  re-run confirms the shared harness still passes on this tree).
