# sim-transplant15c-prereg — family 15C fight brains (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15c-a, branch `sim-transplant15c-a`,
worktree `~/workspace/worktrees/sim-transplant15c-a`.

## Authority

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program definition + thresholds), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
hidden_files/family15-grouping-prereg-2026-11-14.md §15C (grouping:
15C = OVE-49 + OVE-52, pick order oldest first, STEP id suggestion
t15c-fightbrain). Method + proof template:
evidence/2026-11-14/sim-transplant12-14-prereg.md and
evidence/2026-11-14/sim-transplant12-14.md.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 15C diff (OVE-49, then OVE-52 in origin
  order), built on scratch branch `transplant-15c-subject` (far end
  + `git cherry-pick 9bc88d85d` FIRST, then
  `git cherry-pick 1c1b23482` on top of it). NEVER committed to the
  arm branch. Branch LEFT in place, hash recorded in evidence, so
  the verdict is reproducible.
- Family 15C, pick 1: commit 9bc88d85d7ee4c2f6d3c4c0715315f24b628e449
  "OVE-49: green-list Phase 5 fight-brain knowledge probe" — first
  parent 97a67d4f8eedbe44296f045d6e7ea0990dbb7d36 (OVE-47: refresh
  phone-frame proof on master tip). 2 files, +353/-0: scripts/
  green-list.txt +1, scripts/test-fight-brain-knowledge-probe.js
  +352 (new test). js=0. No policy file, no standing.js, no data,
  no docs. Measure-only probe: matched knows-vs-naive proves
  neither fight brain reads agency know[vid].fought (unwired); TB
  vs field mid-HP disagreement and villageKnowsTrick contrast
  documented. No gameplay retune.
- Family 15C, pick 2: commit 1c1b23482a11581047af8a82cca0040ef7b162a1
  "OVE-52: wire shared fighterState into both fight brains" — first
  parent 748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6 (OVE-51: bond/link
  raises as scored dawn candidates). 6 files, +511/-158 by numstat:
  src/js/engine/combat.js +26/-0, src/js/fieldFights.js +90/-23,
  src/js/game.js +59/-11, src/js/villager-agency.js +172/-0,
  scripts/test-fight-brain-knowledge-probe.js +163/-123,
  docs/ONTOLOGY.md +1/-1. js=4. No policy file, no standing.js, no
  data. The probe test file edited here is the file pick 1 creates
  (absent at the far end, present at 52's first parent) — pick 2
  depends on pick 1, in origin order.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 15C PAIR as
  one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
  STEP id (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER
  for ordering but kept on the suspect list); ≥3/8 NOT-CARRIER.
  If the pair reads CARRIER, the next arm splits 49-alone (js=0,
  expected inert) vs 52-on-49.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline. (No
  corpus exists if the arm stops before the step; then there is
  nothing to refuse or roll — record N/A.)
- STOP clause: on ANY cherry-pick conflict, STOP, report the exact
  conflict list (which paths, UU/DU, which hunks, marker line
  numbers), do NOT hand-resolve game code, do NOT decide a narrowed
  re-run (narrowed families are a coordinator decision only). If
  conflicts are confined ENTIRELY to zero-src-reader tooling files
  (scripts/balance-proof.json / scripts/green-list.txt), record
  them and STOP too.
- STEP id: t15c-fightbrain (fresh).
- Proof-on-master note (from the 0215Z run): branch-identity legs
  are worktree-only in this arm's proof — the proof's `worktreeOnly`
  helper passes them vacuously when HEAD is 'master', so the proof
  stays green on master. Prereg-commit ancestry legs resolve by
  message/subject, not by hash (0608Z lesson: an adoption rebase
  rewrites hashes).

## Canon

docs/CANON.md read first. docs/MONSTER-WAVES.md covers fight/monster
content: wave law, monster counters (waves 1–2 `counter` field;
waves 3–5 signature-mechanic counterplay learned via
`noteVillagerTrickObservation`, two observations teach the village
the trick), and design call #4 (combat readiness gates the standing
unlock — VETERANS bar reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`). No standalone canon doc
covers the fighterState wiring itself — it is engine wiring inside
the documented fight-brain contract (monster encounters are fought,
not rolled; villagers learn from what they have fought), not a new
system. Nothing here invents canon.

## Family content (read before the picks)

OVE-49 (single commit 9bc88d85d): a 352-line probe test, green-listed.
It measures — it changes no game code. Its finding, recorded in the
commit message: neither fight brain reads what a villager has fought
(`agency know[vid].fought` is unwired); the turn-based and field
brains disagree about mid-HP; the villageKnowsTrick contrast is
documented. Expected inert on survival by itself; it rides with 52
because 52 rewrites the test it creates.

OVE-52 (single commit 1c1b23482): one shared read — `fighterState(vid)`
in villager-agency.js (+172) — supplies HP fraction, fear/confidence
from recent outcomes and scars, fought-species knowledge for THIS foe
(`know[vid].fought`), and personality curve params (fleeLine /
aiTag). Both fight brains ask the same question through
`fighterShouldFlee`: turn-based hopeless/reactive flee and field
morale. `contestFleeSealed` is the one arena no-flee gate.
Knows-vs-naive now flips field opening intent and turn-based
hopeless flee; a failing control strips `species.fought`.

In plain words: before this family, a villager who had already fought
a species behaved exactly like one who had never met it, and the two
fight brains made their run-or-fight calls from different numbers.
After it, both brains read the same sheet — how hurt you are, how
scared you are from what happened before, whether you have fought
THIS kind of monster before, and how brave your character is — and
villagers who know the beast open differently and hold longer, while
villagers who don't know it run sooner. This is the most plausible
carrier mechanism in family 15 on first reading: fight decisions are
the combat-heavy death profile's front door (the far-end band dies
fighting, 629 deaths, starvation 1). Whether it moves survival at
all is what the step would have measured — it did not get to run
(see §Merge-tree pre-check).

## Merge-tree pre-check (read-only, before the subject)

Cherry-pick predictions use each commit's FIRST PARENT as the base
(the base `git cherry-pick` itself uses), with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`
(git 2.43: the 3-arg form dumps the whole merged tree; --write-tree
prints one tree OID + conflicted-file info + messages).

- PICK 1 (49 onto the far end):
  `git merge-tree --write-tree --merge-base=97a67d4f8eedbe44296f045d6e7ea0990dbb7d36 203a32775 9bc88d85d7ee4c2f6d3c4c0715315f24b628e449`
  → rc=1, conflicted tree a9dfc7b82167b80927abda7aecf8e14696532ffa,
  conflicted files EXACTLY ONE: scripts/green-list.txt. NOT CLEAN.
  Live-confirmed on a throwaway scaffold branch (tmp-15c-predict,
  deleted afterwards): `git cherry-pick 9bc88d85d` rc=1,
  "Auto-merging scripts/green-list.txt / CONFLICT (content)",
  `git status` UU scripts/green-list.txt, A
  scripts/test-fight-brain-knowledge-probe.js (the test file applies
  cleanly; only green-list conflicts). Conflict markers at lines
  916 (`<<<<<<< HEAD`), 919 (`=======`), 927 (`>>>>>>> 9bc88d85d
  (OVE-49: green-list Phase 5 fight-brain knowledge probe)`).
- PICK 2 (52 onto the 49-applied tree): NOT RUN — there is no clean
  pick-1 tree to predict from. Any pick-2 prediction would require
  resolving the green-list conflict first, which only the
  coordinator may authorize (STOP clause). The live pick 2 was
  never attempted; the subject branch was never cut.
- CONFLICT ANATOMY (why the tail collides): theirs (49) appends one
  line at the END of green-list.txt after
  `scripts/test-retarget-gossip.js quick`:
  `scripts/test-fight-brain-knowledge-probe.js quick`. Ours (the
  far end, 97a67d4f8..203a32775) DELETED the last six lines of the
  base file in the same tail region —
  `scripts/test-person-trust-20261108.js quick`,
  `scripts/test-raid-danger-heard.js quick`,
  `scripts/test-believed-pantry-perception.js quick`,
  `scripts/test-companion-objective-overwrite.js quick`,
  `scripts/test-win-rallyguard.js quick`,
  `scripts/test-retarget-gossip.js quick` — and appended
  `scripts/test-pellet-boost-20261108.js quick` +
  `scripts/test-pellet-q4-20261108.js quick` instead. Both sides
  rewrite the file's tail, so the three-way merge cannot place
  49's appended line. The conflict is confined ENTIRELY to
  scripts/green-list.txt, a zero-src-reader tooling file — and per
  the binding STOP clause the arm records it and STOPS anyway.
  The 15F warning in the grouping prereg anticipated exactly this
  class (green-list.txt regenerated per tip; cherry-picks may
  conflict in tooling-only files).

Prediction: PICK 1 CONFLICTS (tooling-only, green-list.txt). The
STOP clause fires BEFORE the subject is cut: no subject branch,
no judged sim, no STEP run, no verdict on the pair. Verdict for
this arm: UNMEASURED (conflict) — NOT a CARRIER/AMBIGUOUS/
NOT-CARRIER read. The coordinator decides the narrowed route
(e.g. apply only the test file + 52 with the green-list line
dropped, or record 15C as unmeasurable-by-conflict with the
conflict itself as the evidence). Do NOT re-attempt the picks
without that decision.

## Family identity (verified at run start, before any sim)

- Commit 9bc88d85d exists; subject "OVE-49: green-list Phase 5
  fight-brain knowledge probe". First parent
  97a67d4f8eedbe44296f045d6e7ea0990dbb7d36 (OVE-47). `git diff
  --numstat 9bc88d85d^1 9bc88d85d`: 2 files, +353/-0:
  scripts/green-list.txt 1/0, scripts/test-fight-brain-
  knowledge-probe.js 352/0 (new test). Table reading js=0
  CONFIRMED.
- Commit 1c1b23482 exists; subject "OVE-52: wire shared
  fighterState into both fight brains". First parent
  748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6 (OVE-51). `git diff
  --numstat 1c1b23482^1 1c1b23482`: 6 files, +511/-158:
  docs/ONTOLOGY.md 1/1, scripts/test-fight-brain-knowledge-probe.js
  163/123, src/js/engine/combat.js 26/0, src/js/fieldFights.js
  90/23, src/js/game.js 59/11, src/js/villager-agency.js 172/0.
  Table reading js=4 CONFIRMED.
- standing.js NOT in either pick's diff. No scripts/policies file
  in either. No data in either pick's diff.
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Probe-test placement (verified): scripts/test-fight-brain-
  knowledge-probe.js ABSENT at the far end 203a32775, PRESENT at
  52's first parent 748cce3b8 — pick 2 edits the file pick 1
  creates, so the order 49 → 52 is load-bearing.
- First-parent chain positions (d229b58f5..a628aeaf3,
  reverse-chronological listing): 1c1b23482 at 15, 9bc88d85d at 19
  — 49 is older, so 49 → 52 is origin order. 52's first parent is
  748cce3b8 (OVE-51, family 15A's last commit); 49's first parent
  is 97a67d4f8 (OVE-47, family 15F).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.
