# sim-transplant15f-picks16 — family 15F picks 1–6 ALONE (Loop A, fleshout-20261114T1355Z)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15f-picks16-a, branch
`sim-transplant15f-picks16-a`, worktree
`~/workspace/worktrees/sim-transplant15f-picks16-a`.
Prereg: evidence/2026-11-14/sim-transplant15f-picks16-prereg.md (committed
cd97fabbc, BEFORE any judged sim ran — the subject pre-existed, built by
the 15F group arm and verified from the branch at run start; see the
prereg's ordering note). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics) +
evidence/2026-11-14/sim-transplant15f-prereg.md and
evidence/2026-11-14/sim-transplant15f.md (the 15F group arm) +
coordinator decision evidence/2026-11-14/sim-transplant-round-1215.md
(next blank #4, route (a)).

## Outcome

- OUTCOME: MEASURED
- VERDICT: NOT-CARRIER — family 15F picks 1–6 alone do NOT collapse
  the far end. Survived 4/8, exactly the far end's own 4/8 on the
  same band — and stronger than the count: every per-seed JSON is
  byte-identical to the far-end endpoint corpus (see §Far-end
  identity), so the six picks are deterministically inert on this
  band, not merely within noise of the far end.
- Subject branch `transplant-15f-subject`: left in place at 4eca36017
  (tree 7bee7b39eb98ce201163aaf86528d7aed220ce5b — exactly the
  predicted pick-6-resolved tree; picks 1–6, no pick 7).
- STEP t15f-picks16: ran once, no re-run needed (4/8 is decisive,
  not 2/8). Corpus:
  evidence/2026-11-13/perseed-culpritbisect-a-t15f-picks16/ (8 files),
  driver log evidence/2026-11-13/culpritbisect-a-t15f-picks16-driver.log,
  summary evidence/2026-11-13/culpritbisect-a-t15f-picks16-summary.json.

## Prereg (binding, committed before any judged sim)

See evidence/2026-11-14/sim-transplant15f-picks16-prereg.md. Base: far
end 203a32775 (GOOD 4/8) with the roster-check standing fix swapped in
for every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified 75762cb2…). Seeds 190391–190398, 150d
death-aware, competent verbatim own-policy per step. Thresholds for
the six-pick transplant as one unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS →
re-run once with a fresh STEP id; ≥3/8 NOT-CARRIER. STOP clause:
subject verification failure → FAIL LOUDLY, stop, no judged sim;
step-tooling failure → step INCOMPLETE, re-run the missing part only.

## Subject verification (verified at run start, before any sim)

- Branch `transplant-15f-subject` at 4eca36017, six commits in origin
  order (c833d182d OVE-37 → 1654a4f67 OVE-47 → e59dfa262 OVE-53 →
  bc5fbf752 OVE-56 → 952d4cf04 OVE-55 → 4eca36017 OVE-57), subjects
  identical to the origin picks.
- Tip tree 7bee7b39eb98ce201163aaf86528d7aed220ce5b — exactly the
  predicted pick-6-resolved tree.
- Diff vs far end: 20 files, all additions, 30547 insertions, 0
  deletions — exactly picks 1–6 minus tooling.
- All three tooling files byte-identical to the far end at the
  subject tip (balance-proof.json d0c6a42f…, phone-frame-proof.json
  b0691014…, green-list.txt 410eccee…).
- No OVE-61 commit on the subject; person-trust files absent from
  the subject tip. Pick 7 stays blocked on the person-trust feature
  (family 10 content the far end never had) — not measured here, no
  verdict claimed for it.

## Results — STEP t15f-picks16, seeds 190391–190398, 150d death-aware, competent verbatim own-policy

| seed | days | end | maxWave | scaleRank | standing | deaths |
|------|------|-----|---------|-----------|----------|--------|
| 190391 | 86 | village-lost | 4 | regional | 199 | 88 |
| 190392 | 144 | village-lost | 4 | regional | 199 | 77 |
| 190393 | 150 | survived | 5 | regional | 325 | 66 |
| 190394 | 43 | village-lost | 4 | village | 150 | 52 |
| 190395 | 150 | survived | 4 | regional | 199 | 96 |
| 190396 | 87 | village-lost | 4 | regional | 199 | 80 |
| 190397 | 150 | survived | 5 | regional | 275 | 74 |
| 190398 | 150 | survived | 4 | regional | 199 | 96 |

- **Survived 4/8** (190393, 190395, 190397, 190398) — median 150d
  (days sorted 43/86/87/144/150/150/150/150).
- **Wall numbers: national 0, table 0, wins 0.** Scale rank:
  regional 7/8, village 1/8 → REGIONAL_INTACT by the bisect
  prereg's rank read (≥5/8). The collapse is a survival collapse
  that this transplant does not reproduce.
- **Wave reach: wave-4 8/8, wave-5 2/8** (190393, 190397).
- **Readiness:** ready4 ready 1/8 (190397: ready4 4, ready5 2,
  ladderVets4 2 — the only seed with two living wave-4+ veterans);
  tribute ready 1/8 (190397); blooded true on 4/8 end states
  (190391, 190393, 190397, 190398). The veteran bar stays the
  binding choke on the other seven seeds (ladderVets4 0 except
  190393 with 1).
- **Deaths: 629 total**, combat-heavy. By cause: villager combat
  267, combat 130, expedition 126, the wild 74, monster 13,
  Spool 2, a stranger 2, the arena 2, ambush 3, contest 3, a wound
  that wouldn't close 3, the night 1, Big-Eyes 1, alien 1,
  starvation 1. Villages die fighting, not hungry — same profile as
  the collapse band and as the far end.
- Instrument errors: 0 on all 8 seeds. Fix swap: standingSha
  f8fda4295a99 on all 8 seeds; policy a7ff5c51… (far-end policy) on
  all 8; anchor 4eca36017f5f on all 8.

## Far-end identity (the verdict's spine)

Per-seed days 86/144/150/43/150/87/150/150 are the far-end endpoint
days from the masterregress far leg, seed for seed. Verified
field-for-field, not just by the count: each of the 8 per-seed JSONs
in perseed-culpritbisect-a-t15f-picks16/ is byte-identical to the
matching file in perseed-culpritbisect-a-ep-far/ once the three
label fields (step, run, anchorCommit) are set aside — days, deaths
lists, vetSays transcripts, daily snapshots, teleRows, everything.
The six picks change nothing the harness can observe: no game code
(js=0), no policy, no standing.js, and the files they do add are
evidence JSONs and a probe script the game never reads. The
transplant is inert by construction AND by measurement.

## What the village looked like (plain words)

Four of eight villages lived the full 150 days and four died
fighting — exactly the far end's own split, because it IS the far
end's run, replayed. The survivors sat at regional standing (199–
325) with no path to national, no table, no win; the strongest,
190397, banked two living wave-4 veterans and stood tribute-ready
but still never reached national. The dead died the usual way: the
shortest life, 190394, lasted 43 days at village standing and was
gone before the Mirror Draft's second act. Nothing about the
six-pick transplant moved any of it — the villages are the far
end's villages, and the wall is the far end's wall.

## Sense-testing (SENSE-TESTING LAW — transcript slices read)

Read the full vetSays transcripts for seeds 190397 (the strongest
survivor, tribute-ready) and 190394 (the shortest life, died d43).
Villagers act like people:

- They fetch water and forage with voiced intent ("Off to the well
  — back with a full skin", "Water first. Everything else waits",
  "Thirst doesn't negotiate. Going."), and come back with the
  pantry breathing ("came back with an armful of something edible,
  unprompted. (+100 kcal pantry)").
- They refuse low-trust asks honestly ("You haven't earned that
  yet", "Why should I listen to you?"), and discover languages the
  hard way ("speaks Hindi. You share no language at all.").
- Knowledge moves villager-to-villager without the player: the
  Jerusalem Artichoke is found, tested, and journaled ("THAT's
  what… found… The Journal notes it: Jerusalem Artichoke — edible,
  carefully"); Seo-ah teaches ground elder at the fireside
  ("Someone asks a dumb question. Nobody minds. That's how you
  learn.") and reports the patch fruiting again weeks later.
- Veteran kills are announced on camera with names remembered
  ("Vasyl just put down Don't-Look... on CAMERA. That's a veteran
  kill, folks. REMEMBER the name."; in 190394: Leo puts down The
  Callback and Ad Break, Luis puts down Spool — three veteran kills
  in a village that still dies at d43, because no veteran lives
  long enough to count: ladderVets4 0).
- The System's show narration stays coherent through the arc: the
  Mirror Draft arrives ("Say hello to the MIRROR DRAFT"), the
  producers name the Nielsen at d135 ("Ratings embodied. It fights
  boring — and the crowd adores it for that.").
- One observation, not a verdict: the transcripts are the far
  end's transcripts verbatim (the corpora are byte-identical), so
  any sense-testing note here is a note about the far end, not
  about the transplant — and the 15C arm's blooded-flag observation
  does not reproduce here: blooded reads TRUE on 4/8 end states in
  this corpus, against 0/8 in 15C's. The flag is not lost in
  general; it is seed- and path-dependent.

## Metric review

No metric proved wrong. The primary (survived/8, group thresholds
fresh per 2115 §3) judged exactly as pre-registered: 4/8 →
NOT-CARRIER. The 2/8 re-run leg was not needed (decisive 4/8).
Two process notes for future arms: (1) when a transplant's
per-seed days reproduce the base endpoint seed-for-seed, the
field-for-field corpus comparison against the endpoint corpus is
the cheap decisive check — it turns "same count" into "same run"
and should be a standing leg for inert-expected arms. (2) The
step script's stdout (swap lines, classification) is NOT in the
driver log — the log holds the driver + analyzer output only; the
swap is proven per seed in the corpus JSONs (standingSha), and the
script's own restore check is proven by the post-step standing.js
== HEAD leg in the proof. Evidence should cite the corpus fields,
not the log, for the swap.

## Infrastructure

- HOST WRITE FLAP: CLEAR all run. Flap-watch log ALL-OK throughout
  (load 2.6–3.7, mem available ~4.8–6.1GB at run start). No EPERM
  window struck any write.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit (cd97fabbc)
  — `git status` showed both committed files staged-as-deleted with
  untracked copies after a correct commit. Repaired with the
  documented pipe (`git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info`); verified status empty + diff
  HEAD empty + hash-object == HEAD blob per file. No work lost.
- Step script: does not exist at the subject commit (the far end
  predates the Nov 13 bisect tooling), so it was run from a /tmp
  copy (`git show sim-transplant15f-picks16-a:scripts/culpritbisect-step.sh
  > /tmp/culpritbisect-step-t15f-picks16.sh`, REPO env) — the route
  the script's own header documents. Tooling scratch restored from
  master as designed. `git checkout sim-transplant15f-picks16-a`
  after the step took ~30s (tree restat under load) — slow, not
  stuck.
- REGISTRY.lock: the heartbeat landed promptly (rc=0, no lock-queue
  wait this arm).
- Telemetry deviation check: REFUSED by the tool (recorder-corpus
  class — "all 8 --current rows carry top-level anchorCommit, so
  they are sweep recorder rows, not runs"), same refusal as all
  prior bisect/transplant arms; baseline NOT rolled. No LOUD lines
  to investigate.
- No runtime restart struck this arm. No safe-commit refusal.
  No pushes, no version bumps, no live verification (ship loop owns
  deploys).

## Proof

- scripts/test-transplant15f-picks16.js — stage 1: 256 passed, 0
  failed (committed with the prereg, cd97fabbc); stage 2: 351 passed,
  0 failed total (95 stage-2 legs: step corpus + summary + verdict,
  far-end identity, evidence records).
- scripts/test-culpritbisect-a.js — 116 passed, 0 failed (re-run
  after the step; the step tooling is unchanged and still green).
