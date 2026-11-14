# sim-transplant15a-pick1 — family 15A PICK-1 ALONE (OVE-48) (Loop A, fleshout-20261114T1355Z)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15a-pick1-a, branch
`sim-transplant15a-pick1-a`, worktree
`~/workspace/worktrees/sim-transplant15a-pick1-a`.
Prereg: evidence/2026-11-14/sim-transplant15a-pick1-prereg.md
(committed bc5cbf2cb, BEFORE any judged sim ran). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ hidden_files/family15-grouping-prereg-2026-11-14.md §15A +
coordinator decision in evidence/2026-11-14/sim-transplant-round-1215.md
(next blank #3).

## Outcome

- OUTCOME: AMBIGUOUS — recorded AMBIGUOUS, treated as NOT-CARRIER
  for ordering, kept on the suspect list.
- Verdict: AMBIGUOUS. STEP t15a-pick1 read 2/8 survived; the
  binding re-run (fresh STEP id t15a-pick1-r2) read 2/8 again.
  Per the bisect rule (2/8 again → recorded AMBIGUOUS, treated
  as NOT-CARRIER for ordering but kept on the suspect list),
  OVE-48 alone does NOT carry the collapse by the pre-registered
  bar, but it does not clear either: 2/8 sits two seeds below the
  far end's 4/8 on the same band.
- Subject branch `transplant-15a-narrowed-subject`: verified at
  run start before any sim (tip 493d7a975, tree
  6d6216e3e414518d2c335829e130e65ec849941b — exactly the predicted
  pick-1-resolved tree; 3 files +320/-3; green-list.txt NOT in
  the commit, byte-identical to the far end) and left in place,
  untouched by this arm. No commit was made onto it.
- STEP t15a-pick1: 8/8 corpus, 0 instrument errors. STEP
  t15a-pick1-r2 (fresh id, same subject, same seeds): 8/8 corpus,
  0 instrument errors, per-seed numbers IDENTICAL to the first
  run on every field (see §Determinism note).

## Prereg (binding, committed before any judged sim)

See evidence/2026-11-14/sim-transplant15a-pick1-prereg.md. Base:
far end 203a32775 (GOOD 4/8) with the roster-check standing fix
swapped in for every step (fix f8fda4295a99; native restored
byte-identical afterwards, sha-verified 75762cb2…). Seeds
190391–190398, 150d death-aware, competent verbatim own-policy
per step. Thresholds for PICK 1 ALONE: ≤1/8 CARRIER; 2/8
AMBIGUOUS → re-run once with a fresh STEP id; ≥3/8 NOT-CARRIER.
Fix policy (bisect prereg): no game-code change lands unless a
defect, small, own proof, restores ≥3/8 — not triggered (no
defect found, verdict AMBIGUOUS).

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

## The step — per-seed table (t15a-pick1; t15a-pick1-r2 identical on every field)

| seed | days | end | maxWave | standing | deaths | vetSays | errors |
|------|------|-----|---------|----------|--------|---------|--------|
| 190391 | 114 | village-lost | 4 | 199 | 81 | 27 | 0 |
| 190392 | 115 | village-lost | 4 | 199 | 64 | 16 | 0 |
| 190393 | 87 | village-lost | 4 | 199 | 70 | 14 | 0 |
| 190394 | 116 | village-lost | 4 | 199 | 68 | 24 | 0 |
| 190395 | 139 | village-lost | 4 | 199 | 87 | 18 | 0 |
| 190396 | 150 | survived | 4 | 199 | 104 | 24 | 0 |
| 190397 | 133 | village-lost | 4 | 199 | 84 | 63 | 0 |
| 190398 | 150 | survived | 5 | 395 | 90 | 75 | 0 |

Survived 2/8 (190396, 190398). Median 133d. Wave-4 8/8, wave-5 1/8 (190398 only); national 0, table 0, wins 0; regional 8/8 (REGIONAL_INTACT). Tribute ready 0/8 (all veterans-short; tribute veterans 0 on
seven seeds, 1 on 190396 against a need of 2). Ladder wave-4+
veterans peak at 1 (190396 only); no seed reaches the bar of 2.
Blooded end-state 2/8 (190394, 190396). Deaths 648 total.
Standing range 199–395.

Death causes (648 total, combat-heavy, same profile as the
collapse band): villager combat 291, expedition 136, combat 97,
the wild 82, monster 20, starvation 2, a wound that wouldn't
close 2, a stranger 2, contest 2, ambush 2, the arena 6,
dehydration 1, The Redactor 1, Loud-Eyes 1, Spool 1, Gavel 1,
the night 1.

Far end on the same band (bisect endpoints, carried in): 4/8
survived, per-seed days 86/144/150/43/150/87/150/150, wave-5
2/8. Pick 1 alone reads 2/8 with median 133d against the far
end's 147d median — a two-seed drop and a shorter median, but
inside the pre-registered AMBIGUOUS band, not the CARRIER band.
The survivors are the same two seeds that survive on several
other transplant steps (190396, 190398); the lost seeds die
between day 87 and day 139, all village-lost, none starved out
(starvation 2 deaths total — the collapse is combat, not hunger,
as on the far end).

## What this means (plain words)

OVE-48 makes what a villager talks about follow what dawn
already decided they are doing today — conversation opens from
the same priorities as the day's work. On its own, on the far
end, that change does not collapse the village to the merge's
level (1/8), and it does not leave the far end untouched
either: two of the far end's four survivors are gone. The
pre-registered bar calls that AMBIGUOUS, and the honest reading
is exactly that — the pick sits in the grey band between
"harmless" and "carrier". It stays on the suspect list. The
15A carrier question now rests on picks 2 and 3, which cannot
be measured on the far end as a transplant (pick 2 needs 15D's
believed-pantry code, which the far end never had and which
cannot land as a transplant either — round-1215 mapping). The
coordinator decides whether 15A is pursued further (e.g. a
fresh-band confirm of pick 1, or the 15A picks measured on a
different base) or recorded as AMBIGUOUS and moved past.

## Sense-testing (SENSE-TESTING LAW — transcripts read, judged in plain words)

Read the vetSays transcripts from all 8 per-seed files (313
lines). The villages read like people:

- Veteran kills are announced on camera with names ("Osmar just
  put down Buffering... on CAMERA. That's a veteran kill, folks.
  REMEMBER the name." — seed 190396, d148; "Darkhan just put
  down Big Loud" — seed 190397, d128). Door fights name their
  defenders and their hurt ("Keabetswe, Osmar and Grace met them
  at the door — 2 put down, 1 barely walked away").
- Gossip travels and grows: the same retelling picks up
  decorations as it passes from villager to villager ("The
  story's getting bigger than what happened", "Three retellings
  in, nobody remembers what actually happened — but everyone has
  opinions") — coherent, and the repetition is the retelling
  mechanic, not a stuck line.
- Villagers teach each other unprompted: one shows the group
  Jerusalem Artichoke by the fire ("See the leaves? Like that.
  Don't mix it up." — seed 190397, d4), after a villager spent
  the afternoon tasting and testing the plant. "The journal
  grows — the human way."
- Low-trust refusals stay honest ("Not today. Sorry." —
  Low trust, reluctant).

Two flags, both recorded not fixed (measurement arm, no fix
policy trigger):

1. BLOODED BEAT vs FLAG (recurrence of an already-open finding):
   in seed 190398 the Blooded beat fires THREE consecutive days
   (d131, d132, d133 — identical line, "the village knows where
   the Producers bleed") yet the seed's end-state `blooded`
   reads FALSE. The reverse also appears: seed 190396 ends
   `blooded` TRUE with ZERO Blooded-beat mentions in its
   transcript. The beat and the flag disagree in both
   directions. This is the same finding already open in
   hidden_files/sim-findings.md (2026-11-14, from the 15C
   corpus: beat fires twice, end-state false on all 8 seeds) —
   this corpus corroborates it with a third firing and adds the
   reverse case. No new backlog entry; the open one stands.
2. The Blooded line firing three days running is itself a
   repeat-announcement (the same line, no new event named).
   It reads as a daily re-announcement of a standing state
   rather than a fresh event — tolerable, but the same class as
   the fixed freeze-line repeat.

No robotic, static, or repeated-beyond-mechanism dialogue was
found. Nothing in the transcripts suggests OVE-48 changed what
villagers say in a way that reads wrong — conversation wants
following dawn priorities is invisible at this sampling depth,
which is consistent with a bias inside an existing decision
rather than a new behaviour.

## Determinism note (re-run mechanics)

The re-run (t15a-pick1-r2) reproduces the first run EXACTLY:
per-seed days, end reasons, deaths, vetSays counts, death
causes, and every wall number are identical. The harness is
deterministic per seed, so the bisect rule's fresh-STEP-id
re-run is a reproducibility check, not fresh evidence — it
cannot resolve a 2/8 into a 1/8 or 3/8. The AMBIGUOUS verdict
therefore stands on the single 8-seed reading, and the
"treated as NOT-CARRIER for ordering" clause is a bookkeeping
convention, not a measurement. If the coordinator wants the
2-seed drop resolved, the honest next step is a FRESH seed
band, not a third run of this band. Recorded in metric review
below.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  All commits and file writes landed first try.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (bc5cbf2cb) — `git status` showed both committed files as
  staged-deleted although the commit was correct (worktree
  hashes matched the HEAD blobs exactly). Repaired with the
  documented pipe (`git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`); verified `git status`
  empty + `git diff HEAD` empty afterwards. No work lost.
- STEP-SCRIPT HAZARD (new, recorded so the next arm does not
  re-learn it): `scripts/culpritbisect-step.sh` checks out the
  subject commit detached, which DELETES the script itself from
  the worktree (the script does not exist in the old tree).
  The first run survived only because bash had the script
  buffered; the immediate re-run attempt failed with "No such
  file or directory". Recovery: check the arm branch back out,
  copy the script to /tmp, run it with REPO set to the worktree
  (`REPO=<worktree> bash /tmp/culpritbisect-step-*.sh <commit>
  <step-id>`). The script's own header already suggests the
  /tmp-copy route — follow it for every step, including the
  first. The r2 run used the /tmp copy and completed cleanly.
- REGISTRY LOCK: the heartbeat landed on the first attempt
  (~seconds, no contention this run).
- Standing fix swap: swapped in per step (sha f8fda4295a99,
  ROSTER CHECK marker verified by the step script), native
  restored byte-identical afterwards (sha 75762cb2…, verified
  by the step script on both runs). On-disk standing.js after
  the run is the arm branch's (master's) version, as expected.
- No runtime restart struck this arm. No safe-commit refusal.
- Telemetry deviation check: REFUSED by the tool
  (recorder-corpus class, same as all prior bisect/transplant
  arms) — "refusing recorder-corpus input: all 8 --current rows
  carry top-level anchorCommit". Baseline NOT rolled. No LOUD
  lines to investigate.

## Metric review

- The binding thresholds judged exactly as pre-registered
  (2/8 → AMBIGUOUS, re-run once with a fresh STEP id, 2/8
  again → recorded AMBIGUOUS). No metric proved wrong, but
  two process notes for the next run:
  (1) The re-run leg is vacuous under a deterministic harness:
  the same seeds + same code reproduce exactly, so a re-run
  can never move a 2/8. The rule's intent (fresh evidence)
  needs either a fresh seed band or a stated determinism
  check. The verdict is unaffected — AMBIGUOUS is the
  pre-registered outcome for 2/8 twice — but no future arm
  should treat a deterministic re-run as resolving ambiguity.
  (2) The median-days secondary (133d vs far end 147d) moved
  in the same direction as survival (2/8 vs 4/8) without
  crossing any threshold — consistent with a small real
  effect or seed luck, and unresolvable on this band. A
  fresh-band confirm is the only honest resolver, and it is
  a coordinator call, not this arm's.
- The 2/8 read is NOT a carrier, NOT a clear: the pick stays
  on the suspect list per the prereg. The fix policy did not
  trigger (no defect identified).

## Proof

- scripts/test-transplant15a-pick1.js — stage 1: 65 passed, 0
  failed (committed with the prereg, bc5cbf2cb); stage 2: 283
  passed, 0 failed (subject verification, both STEP corpora,
  verdict, standing restored, evidence records).
- scripts/test-culpritbisect-a.js — 116 legs, 0 failed (re-run
  after the steps; the step tooling was untouched, but the
  re-run confirms the shared harness still passes on this tree).
