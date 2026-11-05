# Loop B winnability round — 2330Z (coordinator evidence)

Run: fleshout-loop-b-20261104T2330Z. Axis: scale-onramp (winnability-chain
re-point). Loop A live on food-economy throughout (bankretain-substrate,
latework-creek, wildbucket — all landed during this run); NOT touched.
No gate/price/deed/readyDemand change in either arm. Zero src/js in both
arms. Both arms merged locally, pending ship (no push, no bump, no live
verification — ship loop owns deploys).

Re-point queue check at run start: (1) toggle run DONE, (2) flee-repair
build DONE, (3) standing accumulation DONE (1830Z). This run takes the
2125Z run's named next blanks (1) trigger-mechanism arm and (2)
survivorship + gear-stability as one arm, on the shared gearbar band
99101–99108, competent verbatim, 150d death-aware.

## Arm 1 — sim-trigger-b: TRIGGER decomposed, DIAG-GO

Verdict DIAG-GO, judged strictly against its prereg (committed before any
judged sim). All five clauses hold: all 8 seeds classified (2 UNLOCK,
2 TRIGGER, 4 FACED-WILD); TRIGGER binds 6/8 under the wild-only
definition — the bar met exactly, NOT lowered from 6/8 after
vetencounter's 5/8; dominant sub-cause player-left-the-tile 18/18
player-reaching unfought instances, covering both unlocked-but-unmet
seeds (99102: 4/4, 99106: 1/1), no tie, no second sub-cause;
instrument errors 0; sanity exact vs vetencounter on all 8 seeds
(unlocks 6/8, any-class faced 4/8, per-seed days / peak gated /
any-class fights / kills).

The finding in plain words: the village meets the monster and walks
away — now measured, not inferred. Of 18 wave-4 monsters that shared
the player's tile without ever being fought, all 18 ended their first
stay because the player left the tile, and 17 of 18 never got a single
contact turn: the player entered a tile, the monster spawned on it,
and the player was home by the next snapshot. Even the follower didn't
save it — 99106's influencer (follows=true) followed four times on
its spawn day and still never got a contact turn, because the player
never stopped moving. When the player DOES stop, contact works (99103's
eulogy: 55 contact turns over five days, closing to a fight; 99105's
congregation: three territorial commits, killed). The fix must create
a stopped moment, not tune contact odds — odds tuning touches at most
the 1 instance in 18 that ever got a turn.

Trace detail: 99102's day-83 eulogy departed the same day it spawned,
wandered five days, came back onto the player's tile day 88 for 7
unseen turns (distance 3–4, no stance ever set, lostSight 0→7, "It
lost your trail") — first episode player-left, terminal fate
lost-trail. The analyzer needed a mid-run correction for this: the
first version classified by removal and called it monster-unseen;
the corrected first-episode rule (departure before removal wins)
gives player-left, and proof fixtures still pass 21/21 under it.
Also confirmed: 99101's first world fight is day 101 exactly as
vetencounter's sensitivity recount predicted (7 non-world fights
excluded: 1 villager-agency seek, 1 feast, 3 contest, 2 trap).
Robustness: counting the 2 trap fights as unfought instead would
move the plurality from 18/18 to 20/20 — the verdict does not depend
on that call.

Band: 48 post-unlock wave-4 spawns (36 tile-entry / 12 background),
42 wave-4 fights (31 world, 4 contest, 1 feast, 2 trap, 4 other),
8 wave-4 kills, zero pre-unlock wave-4 spawns. Per-seed: 99101
FACED-WILD/TRIGGER (gaps 6/0/30), 99102 TRIGGER, 99103 FACED-WILD/
TRIGGER (0/1/11), 99104 FACED-WILD/TRIGGER (0/0/13), 99105
FACED-WILD/TRIGGER (0/0/3), 99106 TRIGGER, 99107/99108 UNLOCK.

Proof: scripts/test-trigger-20261104.js — 21/21 PASS on the rebased
branch and on merged master (8 classification-precedence fixtures,
8 analyzer fixtures incl. first-episode sub-causes and determinism,
live harness smoke, off/on neutrality leg on seed 99108 at 30d).
Commits (rebased): 885a00aea prereg, 03a352467 instruments + proof,
850509ca2 analyzer first-episode fix, c28f447de pilot + evidence.
Arm evidence: evidence/2026-11-04/sim-trigger-b.md (+ prereg);
corpus perseed-trigger-b/ (8 files, trigger-pilot run, size-verified).

## Arm 2 — sim-survgear-b: joint survivorship + gear hold, DIAG-NO-CANDIDATE

Verdict DIAG-NO-CANDIDATE, judged strictly against its prereg. No
single joint pair (E ≤ 28, G ≤ 30) yields ≥ 1 counterfactual ready
day on ≥ 3/8 seeds. The best in-bounds pair, (28, 30), releases
exactly 1 seed (99101, 21 days). The only shared pair in the full
scan grid is (60, 30), releasing 2/8 — outside the GO bounds and
still short of 3/8. No re-scoring was done.

Three columns, kept separate:
- Survival-only (E, G=0): none on any seed at any E ≤ 120. On 99101
  the weapons leg was last met d120, before the second killer is
  banked d123; on 99104 the gear legs were jointly met d147–d148,
  when only one killer existed.
- Gear-only (E=0, G): none on any seed at any G ≤ 90 — living
  veterans never reach 2 on any seed, so no hold can satisfy the
  veterans leg alone.
- Joint (E, G): only 2 seeds have any solution within E ≤ 120,
  G ≤ 90. 99101: minimal (18, 18) on d123 — first killer died d106,
  second banked d123 (+18 life); armor last met d105 (+18 hold);
  also (32, 17) on d137 for minimal-G. 99104: minimal (29, 1) on
  d149 only — first killer died d121, second banked d149 (+29
  life); weapons met d148, slipped d149 (+1 hold). This misses the
  prereg E ≤ 28 bound by exactly one day. Post-hoc, not a
  re-score: a (30, 30) pair would release both 99101 and 99104 —
  still only 2/8. The other six seeds cannot be helped by this
  lever at all: 99103/99105 banked only one killer ever;
  99102/99106/99107/99108 banked zero (99102 holds 15 raw ≥ 200
  days with only veterans short, but no killer exists to keep
  alive).

Reproduction: fresh corpus reproduces vetshape's shared numbers
exactly on all 8 seeds; instrument errors 0 (860 daily snapshots,
42 wave-4 fights, 8 wave-4 kills); kill-to-death median re-confirmed
3.5 days ([0, 0, 2, 5, 7, 14]); 99104 d147–d149 re-check reproduces
vetshape exactly. Proof: scripts/test-survgear-20261104.js — 11/11
PASS on the rebased branch and on merged master. Commits (rebased):
6e984f724 prereg, 672df64e9 instruments + proof, b4a7c9fcb pilot +
evidence. Arm evidence: evidence/2026-11-04/sim-survgear-b.md
(+ prereg); corpus perseed-survgear-b/ (8 files).

## Wall (both corpora agree)

Wins 0/8, national 0/8, table 0/8, wave-4 unlocks 6/8, wave-4 faced
4/8, wave-4 kills 8 total, wave-5 unlocks 0/8, faced 0/8, kills 0,
readiness-5-ready days 0/8, median survival 94d
(48/52/59/72/116/121/150/150).

## Telemetry deviation check

REFUSED by the tool on both corpora (recorder-corpus shape, same
class as 1830Z/2015Z/2125Z): "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit". Baseline NOT rolled,
no LOUD lines, no compare fabricated, no investigation item.

## Infrastructure (read before judging the run's cost)

- EPERM flap, second evening in a row (see AGENTS.md flare-2 note):
  registration blocked ~15 min at run start (.git ref/admin writes
  denied while plain writes succeeded; a probe worktree add proved
  clearance); mid-run it hit a survgear rebase (rebase-merge/head-name
  write failed, leaving a corrupt rebase state: todo missing, no
  commands done/remaining — recovered by removing the orphaned
  rebase-merge dir after verifying branch tip intact + tree clean,
  then re-rebasing clean) and /tmp content writes (proof live legs
  failed until the flap cleared; fixture legs 9/9 passed throughout).
  Trigger's driver/proof carry retry loops with size verification
  (driver 120×10s, proof 120×5s); pilot corpus verified at full size
  before analysis; no data lost, nothing hand-edited back into shape.
- Rebase stop-at-pick quirk on the trigger landing: pick 530aa7c74
  appeared in BOTH done and todo lists, tree clean, no unmerged
  paths, pick unapplied. Recovered per the recorded lesson:
  verified clean + unapplied, `git rebase --continue` sailed
  through; final log shows each commit exactly once.
- Sibling mid-landing wait: main tree showed staged deletions from
  Loop A's wildbucket landing at survgear merge time; per the body
  the run waited 10 min and re-checked (tree clean) before merging.
  Master moved 5 times under this run (journey-establishment r101,
  ship bump, journey-crisis r127, Loop A bankretain/latework/
  wildbucket, journey-deepening r102); every merge followed the
  pattern (ff-only refuses, rebase clean with zero file overlap,
  proofs green after every rebase and on merged master).
- Safe-commit index clobber hit worker commits on both arms and is
  repaired the same way each time (HEAD-blob cacheinfo, status +
  diff HEAD verified empty); commits always correct.
- One coordinator exec session was lost mid-run (release command's
  session went unknown before running); state was re-verified by
  hand (tree + branch still present, merge intact) and the release
  steps re-run clean — no work lost, no double-merge.
- No push, no bump, no live verification (ship loop owns deploys).
  Coordinator evidence committed on a branch and ff-merged, per
  repo push discipline — never directly on master.

## Next blanks, in order

1. BUILD the trigger: a stopped moment on spawn tiles (second beat /
   priced choice in the lingerer sortie shape, or a policy pause) —
   NOT contact-odds tuning (touches at most 1/18 instances).
2. Standing accumulation, part 2 (standaccum blank 3): whether a
   village meeting wave 4 and keeping two killers alive reaches 200
   gated AND ready — still never observed.
3. Two-track follow-up (survgear proposal): kill production /
   encounters for the six no-solution seeds, plus an honestly
   pre-registered joint hold (e.g. E ≤ 30, G ≤ 30) on a band where
   more than two seeds bank two killers. Do NOT move readyDemand
   or flip VETSHAPE on this evidence.
4. Wording note (trigger arm): the lost-trail line ("You hold still
   behind cover") misdescribes the unseen-at-distance case.
5. Carried: veteran-word collision naming pass; STEVE-CALL — who
   should ask; HOLDING, not asking; tend band-count rule;
   LIVE-SIM fallback firing; approach guardrail re-test prereg
   revision (absolutes alongside relatives); BELONG clear on a
   belongseek substrate; 99101 hold-beat re-finding per anchor;
   wave5faced label rename. NO gate/price/deed arm follows.

scale-onramp stays converging (NOT converged): the veterans
shortfall now has a measured trigger (player-left 18/18) and a
measured joint bound (only 2/8 seeds have any survivorship+gear
solution), but the full seat is still unwon, wave-5 kills still 0,
readiness-5-ready days still 0/8. food-economy untouched (sibling
Loop A). Claim deleted; lock deleted at closeout.
