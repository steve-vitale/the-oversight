# sim-transplant13-prereg — H1 transplant family 13, brawler ascension deed (arm sim-transplant13-a)

Run: fleshout-20261114T0615Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: sim-transplant13-a. Worktree: ~/workspace/worktrees/sim-transplant13-a.
Prereg written and COMMITTED before cutting the subject or running any judged sim.
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (transplant program).

## Family identity (verified by this arm before any sim)

- Merge: a76333124945dbb851ba29120e2dad3e2d2405f6 — "Merge pull request #3 from
  steve-vitale/cursor/brawler-ascension-deed-45d4".
- First parent: d229b58f595430e2a24c399820061b39c5b689ca (the merge base itself).
- Second parent: 447085506a0d36d2537ba9c00aa92e8f82eccdf3 — "Add lived Brawler
  ascension deed (outmatched_kill)".
- Second-parent side is 1 commit (`git rev-list --count a76333124^1..a76333124^2` = 1).
- `git diff --stat a76333124^1 a76333124`: 7 files, +281/−2:
  - src/js/godpath.js +24 (the ONLY src/js file — table reading js=1, pol=0 CONFIRMED)
  - src/data/godpaths.json +6 (data rides inside the merge family per the 2115 §3 caveat (b))
  - scripts/godpath/ladder.js +5, scripts/godpath/validate.js 1/1,
    scripts/proof-godhood-rework-20261013.js 7/1,
    scripts/godpath/test-brawler-deed.js +196 (new test),
    evidence/2026-11-08/brawler-deed-audit.md +42.
- standing.js NOT in the family diff. No scripts/policies file.
- `outmatched_kill` is ABSENT at the far end 203a32775 and at the first parent
  d229b58f5 (grep rc=1 on both) — the deed is genuinely new to the far end.
  ('brawler' as a god id already exists in the far-end godpaths.json; the
  authored deed does not.)
- The deed commit's own diff (`git diff 447085506^ 447085506 --stat`) is the
  same 7 files, +281/−2 — the merge is vacuous per 2115 §1 (merge tree
  byte-identical to the second parent's tree).

## What the family does (canon-grounded, not invented)

Canon: docs/godpath/STEVE-ANSWERS.md (god-path law) + docs/CANON.md.
The brawler god `one_person_army` gets a lived ascension deed
`outmatched_kill`: alone, take a real wound from a foe that opened with
more health than your whole bar, then kill it (evidence/2026-11-08/
brawler-deed-audit.md, riding inside the family). Player and villager
share the same person-owned receipt under
`village.godpathDeeds[vid].outmatched_kill`. Distinct from `apex_hunt`:
no Pack Hunt route, requires the fighter's own blood (`_taken` / field
`vTaken`), helpers void it. The authored deed replaces class-age and
synergy proxies for `one_person_army` — the same gate model as the
eight other fitting deeds. The runtime change is confined to the two
finish hooks (`finishApexHunt` tactical + `finishFieldApexHunt` field);
numerical combat calibration untouched (per the audit's Muse-overlap
note). A villager who earns the deed can ascend to One-Person Army
where before only class-age/synergy proxies gated it — a strictly
wider ascension gate for brawler-leaning villagers.

## Base, seeds, horizon, policy

- Base: far end 203a32775 (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078;
  native restored byte-identical afterwards, sha-verified). Base is
  the far end, never current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step.
- Driver mechanics reused (scripts/culpritbisect-step.sh +
  scripts/culpritbisect-driver-20261113.js + analyzer, same as the
  bisect steps); STEP id t13-a76333124. The step script is run from a
  /tmp copy with REPO passed in (the script is absent at the far end,
  so running it from the worktree would unlink it mid-run at the
  detached checkout). The driver loads competent.js from the
  checked-out tree.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch transplant-13-subject in this worktree and LEFT in
  place (branch kept, hash recorded in the evidence file). Never
  committed to the arm branch. Apply via `git cherry-pick -m 1 a76333124`.

## Merge-tree pre-check (BEFORE cutting the subject)

`git merge-tree d229b58f595430e2a24c399820061b39c5b689ca 203a32775 a76333124`
— PREDICTS CLEAN. Recorded in /tmp/mergetree-t13.txt (358 lines):
- ZERO "changed in both" sections; ZERO conflict markers counted as
  `+<<<<<<<` / `+=======` / `+>>>>>>>` lines (all 0; bare `^<<<<<<<`
  grep would also return 0 but the +-prefixed count is the honest one).
- FIVE "merged" (clean, non-conflicting) files: scripts/godpath/ladder.js
  (result c34cb52b2), scripts/godpath/validate.js (acfd6e84b),
  scripts/proof-godhood-rework-20261013.js (1e63cb8c),
  src/data/godpaths.json (71d05223a), src/js/godpath.js (27eeef2d0).
- TWO "added in remote" files: evidence/2026-11-08/brawler-deed-audit.md
  (fa31e3e9), scripts/godpath/test-brawler-deed.js (d42892b8).
- NO removed/renamed sections. The live cherry-pick is expected to
  apply cleanly with no conflicts.

## Conflict rule (binding)

On ANY cherry-pick conflict: STOP, report the exact conflict list,
do NOT hand-resolve game code. (If conflicts are confined ENTIRELY
to zero-src-reader tooling files — scripts/balance-proof.json /
scripts/green-list.txt — record them and STOP too; the coordinator
decides the narrowed route. Do not resolve them yourself.)

## Primary metric + verdict thresholds (binding, fresh per 2115 §3)

- Primary: survived/8 on the band.
- ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh STEP id,
  2/8 again → recorded AMBIGUOUS, kept on the suspect list;
  ≥3/8 NOT-CARRIER.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.

## Caveat (2115 §3 (c), recorded; do NOT split this arm)

The brawler merge vs the deed commit itself (447085506, vacuous per
§1): if this family reads CARRIER, the next arm splits merge vs
deed commit. This arm measures the family as one unit only.

## Sense-testing (SENSE-TESTING LAW)

Read the step corpus transcripts (vetSays): do the villagers still
act like people with the brawler deed in, and what changes in what
they do/say? Report in plain words in the evidence file. Mechanism
check: does `outmatched_kill` ever get booked in the corpus
(`godpath_deed` tele events), and does any villager ascend to
One-Person Army through it?

## Proof

- scripts/test-transplant13.js (family identity, merge-tree
  pre-check, subject state, step verdict, base restored; every
  branch-identity assertion marked worktree-only so the proof stays
  green on master) plus re-run scripts/test-culpritbisect-a.js
  (116 legs).
- Evidence: evidence/2026-11-14/sim-transplant13.md (lever played,
  before/after numbers on identical seeds, reachability verdict,
  village assessment, blanks filled or documented, metric review
  section).

## Wall numbers carried in (judged corpora)

- Far end 203a32775: survived 4/8, wave-5 2/8 (bisect endpoint).
- Merge e4dbe581b: survived 1/8, wave-5 0/8. Bisect s06 (this merge):
  1/8, median 102d (lowest median of any bisect step), regional 0/8,
  wave-5 0/8, sole survivor 190392.
- National 0, table 0, wins 0 on the collapse band.
