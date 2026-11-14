# H1 transplant — family 15C, fight brains (arm sim-transplant15c-narrowed-a)

Run: fleshout-20261114T1215Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant15c-narrowed-a` (worktree
`~/workspace/worktrees/sim-transplant15c52-a`).
Prereg: evidence/2026-11-14/sim-transplant15c-narrowed-prereg.md —
**a RECONSTRUCTION, written after the step ran** (the cancelled
worker's run left no prereg). The judging bar itself predates the
step (binding prereg, round-2115 §3).

## Verdict: CARRIER

**Family 15C alone collapses the far end: 1/8 survived** (far end
203a32775 is GOOD 4/8 on the same band). Binding threshold ≤1/8 =
CARRIER. The two fight-brain picks — OVE-49 (test-only knowledge
probe green-list) + OVE-52 (shared fighterState wired into both
fight brains) — carry (part of) the collapse. No re-run is needed:
1/8 is not the 2/8 ambiguous band.

## The question (recap)

The inside-the-merge bisect closed with DIAG-ORIGIN-COLLAPSED-AT-
DIVERGENCE: the origin line was already collapsed when it diverged.
The H1 transplant program lands one origin family at a time onto
the far end (GOOD 4/8) and measures which family alone drops it to
the merge's level (1/8). Family 15C is the fight-brain group:
`fighterState(vid)` (HP fraction, fear/confidence, fought-species
knowledge, personality curve params) feeding TB hopeless/reactive
flee and field morale in both fight brains.

## Subject (verified from the tree)

- Base: far end `203a32775`.
- Subject: detached HEAD `12fd9d694`, exactly two single-parent
  commits on the far end: `7183c942e` (OVE-49) then `12fd9d694`
  (OVE-52). Diff far end → subject: 6 files, +740/−35, js=4
  (`src/js/engine/combat.js`, `src/js/fieldFights.js`,
  `src/js/game.js`, `src/js/villager-agency.js`) + docs/ONTOLOGY.md
  + the fight-brain knowledge-probe test refresh. No policy file,
  no standing.js change.
- Standing fix swapped in for every seed (fix sha `f8fda4295a99`,
  recorded per seed) and restored byte-identical afterwards
  (sha256 `75762cb2…`, verified from the far-end blob; `git diff`
  empty for src/js after the restore).

## Results — STEP t15c-narrowed, seeds 190391–190398, 150d death-aware, competent verbatim own-policy

| seed | days | end | maxWave | scaleRank | standing | deaths |
|------|------|-----|---------|-----------|----------|--------|
| 190391 | 60 | village-lost | 4 | regional | 199 | 80 |
| 190392 | 75 | village-lost | 4 | village | 125 | 62 |
| 190393 | 115 | village-lost | 4 | regional | 199 | 66 |
| 190394 | 150 | survived | 5 | regional | 350 | 130 |
| 190395 | 106 | village-lost | 4 | regional | 199 | 107 |
| 190396 | 128 | village-lost | 4 | regional | 199 | 90 |
| 190397 | 121 | village-lost | 5 | regional | 250 | 86 |
| 190398 | 149 | village-lost | 4 | regional | 199 | 69 |

- **Survived 1/8** (190394 only) — median survival **118d**
  (days sorted 60/75/106/115/121/128/149/150).
- **Wall numbers: national 0, table 0, wins 0.** Scale rank:
  regional 7/8, village 1/8 → REGIONAL_INTACT by the bisect
  prereg's rank read (≥5/8), so the collapse is a survival collapse,
  not a rank stall: villages reach regional and then die there.
- **Wave reach: wave-4 8/8, wave-5 2/8** (190394, 190397).
- **Readiness: never ready.** ready4 ready 0/8, ready5 ready 0/8;
  living wave-4+ veterans (`ladderVets4`) 0 on all 8 seeds; tribute
  ready 0/8; blooded false on all 8 end states. The veteran bar is
  the binding choke: nobody banks a living wave-4 killer, so the
  wave-5 door never properly opens — the two wave-5 unlocks are
  peak reads on villages that still died.
- **Deaths: 690 total**, combat-heavy. By kind: monster 569,
  villager 118, person 3. By cause: villager combat 269, expedition
  193, combat 108, the wild 86, monster 16, the arena 5, contest 5,
  thirst 2, ambush 2, dehydration 1, a stranger 1, a wound that
  wouldn't close 1, Captain Bright-Eyes 1. Villages die fighting,
  not hungry — same profile as the collapse band.
- Instrument errors: 0 on all 8 seeds.

## What the village looked like (plain words)

Seven of eight villages reached regional standing — they got
noticed, the Mirror Draft came, and they died fighting it. The
one survivor (190394) lasted the full 150 days, reached wave 5
and standing 350, but still sat at regional with no path to
national, no table, no win. The fight-brain change — villagers
now fleeing when hopeless and opening fights by what they know —
did not make them smarter enough to live: the door fights keep
happening (dozens of "met them at the door" beats per village),
veteran kills happen on camera, but no living veteran survives
long enough to count toward the next wave's bar. The village
fights bravely and dies at the same wall.

## Sense-testing (SENSE-TESTING LAW — transcript slices read)

Read the full vetSays transcripts for seeds 190398 (the fill) and
190394 (the survivor). Villagers still act like people:

- They fetch water and forage with voiced intent ("Off to the well
  — back with a full skin"), refuse low-trust asks honestly ("Not
  today. Sorry." / "Why should I listen to you?"), and discover
  languages the hard way ("speaks Japanese. You share no language
  at all.").
- Knowledge moves villager-to-villager without the player: Omar
  shows Adaeze the European Elder, Patrick reports it "coming back
  thick on the damp slope", Chloe teaches the whole village and the
  fireside lesson follows ("Someone asks a dumb question. Nobody
  minds. That's how you learn.").
- Veteran kills are announced on camera with names remembered
  ("Patrick just put down Spool... That's a veteran kill, folks.
  REMEMBER the name.").
- Arc IV fires coherently while the village is still regional:
  "FINALES need a NATION. You've got a region; now make it a REALM."
  — the System names the gap instead of pretending it is closed.

**One observation, not a verdict:** in the survivor's transcript
(190394) the "Blooded" beat fires twice (days 133, 142 — "the
village knows where the Producers bleed"), yet the end-state
`blooded` field reads false on all 8 seeds. Either the blooded
flag is transient (announced, then lost) or the end-state read
misses it. Flagged for the next arm to check; it does not touch
the survival verdict.

## What this means for the program

- Family 15C is a CARRIER. Per the grouping prereg, the next arm
  splits it commit-by-commit (OVE-49 is test-only, so the
  mechanistic suspect is OVE-52's fighterState wiring — but the
  split must be measured, not assumed: run OVE-49 alone, then
  OVE-52 alone, same band, same STEP discipline).
- The collapse is not one family's story yet: other families may
  also read CARRIER. The program continues in table order; a
  CARRIER here does not stop the other arms.
- No game-code change lands from this arm. Nothing to fix yet —
  the split arm first, then the mechanism (which half of the
  fighterState wiring — the flee call, the morale read, the
  knows-vs-naive flip — turns survivable fights into fatal ones)
  gets its own evidence.

## Metric review (§14)

- The survival-count metric held: 1/8 is a clean CARRIER read, no
  re-run leg needed, no ambiguity.
- The rank read sharpened the picture (REGIONAL_INTACT + 1/8
  survival = villages reach regional, then die fighting) — keep it
  as a secondary.
- The wave-5 secondary (2/8) is a peak read, not an end-state read;
  it says the door opened twice, not that anyone walked through.
  Future evidence should say "peak wave-5 unlocks" explicitly.
- No metric revision proposed.

## Infrastructure (cancellation, recovery, reconstruction)

- The previous worker (run fleshout-20261114T0936Z) was cancelled
  mid-step with no report. This worker verified everything from
  the tree and corpus, never from a worker claim: the subject
  chain (exactly two single-parent commits), the 7 per-seed files
  (sha256 recorded in the prereg before the fill ran; each parses
  and matches its driver-log line), the fix swap still in place
  (standing.js sha `f8fda4295a99` at fill time), and the far-end
  native standing.js sha (`75762cb2…`, verified from the far-end
  blob, not trusted from a note).
- Only the missing seed 190398 was run, with the same driver, same
  flags, same STEP id `t15c-narrowed`, same fix swapped in. Its
  line was appended to the same driver log; its file landed in the
  same corpus dir under the same filename pattern. The step is
  deterministic; the fill is indistinguishable from the first 7
  seeds' records (same policy sha `a7ff5c516440`, same anchor
  `12fd9d694d3f`, 0 instrument errors).
- The prereg is an explicit post-step RECONSTRUCTION (see its
  header): it was not written before the step, and it does not
  pretend otherwise. The judging bar predates the step via the
  binding prereg (round-2115 §3) and was not moved.
- Four untracked scripts found in the tree
  (`culpritbisect-driver-20261113.js`, `culpritbisect-analyze-20261113.js`,
  `masterregress-analyze-20261113.js`, `vetfirst-instrument-20261111.js`)
  were verified byte-identical to master and DELETED as duplicates
  (the driver used for the fill was the deleted copy — identical
  bytes to master, so the run is reproducible from master).
  The arm commits no tooling.
- `scripts/test-culpritbisect-a.js` (116 legs) was NOT re-run: no
  step tooling was touched.
- Telemetry deviation check: recorder-corpus class — the check
  REFUSES these corpora (same refusal as all prior bisect/transplant
  arms); baseline NOT rolled.
- Worktree heartbeat at arm start queued on REGISTRY.lock (the
  reaper holds the lock for its whole run; several sibling
  heartbeats queued alongside mine) — lock contention, not a
  write flap, per the brief. The registry already carries a fresh
  heartbeat for this tree (12:20:16Z), so the tree was never at
  reaper risk during this run. No write flap struck this run: all
  writes (corpus fill, prereg, evidence, proof) landed first try.
- Standing.js restored byte-identical after the fill (`git diff`
  empty for src/js). Tree contains only committed work at closeout.

## Files

- Prereg (reconstruction):
  `evidence/2026-11-14/sim-transplant15c-narrowed-prereg.md`
- Evidence (this file):
  `evidence/2026-11-14/sim-transplant15c-narrowed.md`
- Corpus: `evidence/2026-11-13/perseed-culpritbisect-a-t15c-narrowed/`
  (8 per-seed JSONs) + driver log
  `evidence/2026-11-13/culpritbisect-a-t15c-narrowed-driver.log`
- Proof: `scripts/test-transplant15c-narrowed.js`

## Coordinator landing addendum (run fleshout-20261114T1215Z)

- The worker committed the evidence on top of the subject (the tree was
  checked out detached at 12fd9d694, a leftover of the superseded
  52-alone plan). Landing evidence-only required a `git rebase --onto
  master 12fd9d694` of the 4 arm commits; the subject is kept reachable
  on branch `transplant-15c-narrowed-subject` at 12fd9d694.
- That rebase broke 3 proof legs that assumed the branch sits on the
  subject ("subject is an ancestor of HEAD", the two on-disk standing.js
  vs far-end legs) — landing-shape artifacts, not measurement defects:
  the on-disk file on the rebased branch is master's standing.js. The
  legs were rewritten in place to their landing-shape equivalents
  (subject branch points at OVE-52; subject-branch standing.js is the
  far-end native; arm branch holds exactly the 4 evidence commits on top
  of master; on-disk standing.js still equals the HEAD blob, so the
  landing changes no game code). Proof re-run 112/0 on the rebased tip;
  `test-culpritbisect-a.js` 116/116.
