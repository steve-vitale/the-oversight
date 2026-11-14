# sim-transplant13 — H1 transplant family 13, brawler ascension deed (arm sim-transplant13-a)

Run: fleshout-20261114T0615Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: sim-transplant13-a. Worktree: ~/workspace/worktrees/sim-transplant13-a.
Prereg: evidence/2026-11-14/sim-transplant13-prereg.md (committed a13d9721e
BEFORE cutting the subject or running any judged sim).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3.
Claim: this run's coordinator claim (fleshout-20261114T0615Z.json); deleted at closeout by the coordinator.

## Verdict — MEASURED NOT-CARRIER (4/8)

Family 13 — PR #3 brawler ascension deed, merge a76333124 — landed alone
onto the far end 203a32775 (GOOD 4/8) reads **survived 4/8** on the
bisect band (STEP t13-a76333124, subject e514ba0a5ae3). Per the binding
thresholds (≥3/8 NOT-CARRIER) the family alone does NOT collapse the
far end. No re-run leg: 4/8 is an outright read, not a 2/8 ambiguous.

Stronger than the count: the subject reproduces the far end
**seed-for-seed**. Per-seed days 86/144/150/43/150/87/150/150 are
byte-identical to the far-end endpoint days, same four survivors
(190393, 190395, 190397, 190398), same median (150d), same death
total (629). The family is live in code but its new path never fires
under the competent policy on this band (see §Mechanism) — so the
subject IS the far end, trajectory for trajectory.

## Family identity (verified before any sim)

- Merge a76333124945dbb851ba29120e2dad3e2d2405f6 — "Merge pull request #3
  from steve-vitale/cursor/brawler-ascension-deed-45d4". First parent
  d229b58f595430e2a24c399820061b39c5b689ca (the merge base itself).
  Second parent 447085506a0d36d2537ba9c00aa92e8f82eccdf3 — "Add lived
  Brawler ascension deed (outmatched_kill)". Second-parent side is 1
  commit.
- `git diff --stat a76333124^1 a76333124`: 7 files, +281/−2 —
  src/js/godpath.js +24 (only src/js file; js=1, pol=0 CONFIRMED),
  src/data/godpaths.json +6, scripts/godpath/ladder.js +5,
  scripts/godpath/validate.js 1/1,
  scripts/proof-godhood-rework-20261013.js 7/1,
  scripts/godpath/test-brawler-deed.js +196 (new),
  evidence/2026-11-08/brawler-deed-audit.md +42.
  standing.js NOT in the diff. No scripts/policies file.
- `outmatched_kill` ABSENT at the far end and at the first parent —
  the deed is genuinely new to the far end. The deed commit's own diff
  is the same 7 files, +281/−2: the merge is vacuous (merge tree
  byte-identical to the second parent's tree), per 2115 §1.
- Caveat 2115 §3 (c) recorded in the prereg: if this family had read
  CARRIER, the next arm would split merge vs deed commit. It read
  NOT-CARRIER, so no split is owed.

## What the family does (canon-grounded)

Canon: docs/godpath/STEVE-ANSWERS.md + docs/CANON.md; the deed is
specified in evidence/2026-11-08/brawler-deed-audit.md (rides inside
the family). The brawler god `one_person_army` gets a lived ascension
deed `outmatched_kill`: alone, take a real wound from a foe that opened
with more health than your whole bar, then kill it. Player and villager
share the same person-owned receipt under
`village.godpathDeeds[vid].outmatched_kill`. No Pack Hunt route;
the fighter's own blood is required (`_taken` / field `vTaken`);
helpers void it. The authored deed replaces class-age and synergy
proxies for `one_person_army` — the same gate model as the eight other
fitting deeds. The runtime change is confined to the two finish hooks
(`finishApexHunt` tactical + `finishFieldApexHunt` field); numerical
combat calibration untouched. A villager who earns the deed can ascend
to One-Person Army where before only class-age/synergy proxies gated
it — a strictly wider ascension gate for brawler-leaning villagers.

## Merge-tree pre-check (before cutting the subject)

`git merge-tree d229b58f5... 203a32775 a76333124` — PREDICTED CLEAN
(/tmp/mergetree-t13.txt, 358 lines; the /tmp copy was lost in the
runtime restart, see §Infrastructure, but the prediction is recorded
here and in the prereg):
- ZERO "changed in both" sections; ZERO conflict markers counted as
  `+<<<<<<<` / `+=======` / `+>>>>>>>` lines (all 0).
- FIVE "merged" (clean) files: ladder.js (result c34cb52b2),
  validate.js (acfd6e84b), proof-godhood-rework-20261013.js (1e63cb8c),
  godpaths.json (71d05223a), godpath.js (27eeef2d0).
- TWO "added in remote" files: brawler-deed-audit.md (fa31e3e9),
  test-brawler-deed.js (d42892b8). NO removed/renamed sections.
- The live cherry-pick reproduced the prediction exactly: clean,
  no conflicts, subject e514ba0a5ae3, 7 files +281/−2, all seven
  blobs matching the merge-tree result blobs, parent = far end
  203a32775. No conflict-STOP leg was exercised.

## Before / after on identical seeds (STEP t13-a76333124)

Base: far end 203a32775 + roster-check standing fix swapped in per the
bisect prereg (fix f8fda4295a99; native 75762cb2259d restored
byte-identical afterwards, sha-verified). Seeds 190391–190398, 150d
death-aware, competent verbatim own-policy (policy sha a7ff5c516440 —
the far-end policy). Driver + analyzer reused from the bisect
(culpritbisect-step.sh from a /tmp copy with REPO passed in; the
script is absent at the far end). Corpus:
evidence/2026-11-13/culpritbisect-a-t13-a76333124-summary.json +
driver log + evidence/2026-11-13/perseed-culpritbisect-a-t13-a76333124/
(8 per-seed JSONs). Instrument errors 0.

| seed | subject days | far-end days | end | maxWave | standing | scale | deaths |
|------|------|------|-----|---------|----------|-------|--------|
| 190391 | 86 | 86 | village-lost | 4 | 199 | regional | 88 |
| 190392 | 144 | 144 | village-lost | 4 | 199 | regional | 77 |
| 190393 | 150 | 150 | survived | 5 | 325 | regional | 66 |
| 190394 | 43 | 43 | village-lost | 4 | 150 | village | 52 |
| 190395 | 150 | 150 | survived | 4 | 199 | regional | 96 |
| 190396 | 87 | 87 | village-lost | 4 | 199 | regional | 80 |
| 190397 | 150 | 150 | survived | 5 | 275 | regional | 74 |
| 190398 | 150 | 150 | survived | 4 | 199 | regional | 96 |

- Survived: subject 4/8, far end 4/8, merge 1/8. Bisect verdict GOOD.
- Wall: wins 0, national 0, table 0, regional 7/8, wave-5 2/8,
  wave-4 8/8, median 150d, deaths 629, standing 150–325, blooded 4/8,
  tribute-ready 1/8 (190397 only, veterans 2/2; all other seeds
  veterans-short).
- Death causes (629): villager combat 267, combat 130, expedition 126,
  the wild 74, monster 13, Spool 2, a stranger 2, the arena 2, ambush 3,
  contest 3, a wound that wouldn't close 3, the night 1, Big-Eyes 1,
  alien 1, starvation 1. Combat-heavy, same shape as the far end
  (629 deaths is also family 9's total — the collapse band's
  death budget is set by the base, not by these families).
- Reachability: wave-5 unlocks on 2/8 (same as the far end);
  regional reached on 7/8; national/table/wins 0 on the band, as
  everywhere on the collapse band. The brawler deed changes nothing
  about what content is reachable in sim, because it never fires
  (see §Mechanism).

## Mechanism — the deed never books

- `outmatched` appears in ZERO of the 8 per-seed JSONs: the new
  `outmatched_kill` receipt was never booked in any seed.
- `one_person_army` appears ZERO times in all 8 per-seed files:
  nobody ascended to the brawler god anywhere on the band.
- The deed system itself is live: `godpath_deed` teleCounts total 160
  across the band (13–26 per seed — other deeds booking), and
  `ascension` teleCounts total 5 (190393:1, 190395:1, 190397:2,
  190398:1; the corpus does not name which god each ascension was
  to — instrument limitation, same class as the family-9 note).
- Read: under the competent policy the bot never fights a solo,
  bloodied, above-weight kill — no lone fighter takes a real wound
  from a bigger foe and then kills it alone. The family's gate is
  strictly wider in the code, but the competent bot never walks
  through it, so the subject's trajectories are the far end's,
  day for day. Same inertness shape as family 9 (new lines never
  fire under competent policy). This is a NOT-CARRIER by inertness,
  not by a fought-and-survived contest — a human player hunting
  the deed deliberately could still book it; the sim cannot say
  whether the deed is earnable in real play, only that it never
  fires on this band under this policy.

## Village assessment (plain words)

Four villages live to day 150, four die — exactly the far end's
four. The ones that die go down fighting, not hungry: 190394 is
gone by day 43 (the early-collapse shape), 190391/190392/190396
hold on into the 80s–140s and then lose the village in combat.
The survivors sit at regional standing (199–325) with full
pantries on two seeds (190393: 8,200 kcal banked; 190397: 5,798)
and empty on the other two — survival here is about who is left
standing after the door fights, not about food. Nobody reaches
national, nobody sits at the table, nobody wins. One village
(190397) is tribute-ready with its two veterans; the rest are
veterans-short, which is the same wall the whole collapse band
hits: the village can survive and even reach wave 5, but it cannot
bank the two living wave-4 killers the tribute road needs.

## Sense-testing (SENSE-TESTING LAW — 225 vetSays read)

The corpus reads as people, not counters — and it reads the same
with the brawler deed in as without it, because the deed never
fires and nothing in what villagers say changes.

- Door fights are named group efforts with hurt carried: "Amine,
  Eduardo and Alberto met them at the door — 1 put down, 2 barely
  walked away. Amine, Eduardo, Alberto are hurt." (190398 d137)
  and the lone stand: "Eduardo met them at the door — 1 put down.
  Eduardo is hurt." (190398 d149).
- Veteran kills are called on camera with names remembered:
  "Kurt just put down Ad Break... on CAMERA. That's a veteran kill,
  folks. REMEMBER the name." (190391 d31), repeated for Ingrid,
  Raj, Amine, Eduardo across seeds — formulaic, but it is the
  game's own show narration, not new to this family.
- Villagers pursue builds unprompted: "Chantal has been asking Raj
  about Cold-Blooded — what it does, what it goes with. Planning
  something." (190391 d71).
- Blooded is voiced when it lands (190393 d80/d100); Arc IV
  ("THE INEFFICIENCY") fires on 190391/190392/190393; the mirror
  draft reveal lands on the dying seed (190394 d38).
- Nothing robotic, static, or repeated beyond the game's own
  formulaic door-fight / veteran-kill narration. No brawler-deed
  line appears anywhere — consistent with the mechanism read.
- Two observations, NOT blanks for this arm (out of axis, pre-existing
  shapes): (1) an unnamed villager is rendered by description in
  door-fight lines — "the woman in her 30s, with weathered hands"
  (190394 d7) — a person without a name in the narration; (2) the
  Blooded line repeats twice on the same day (190393 d100). Both
  are the game's existing narration, not this family. No
  sim-findings entry filed — both are cosmetic narration notes,
  and the backlog is for real gaps.

## Metric review (§14)

Pre-registered metric (survived/8, thresholds ≤1 CARRIER / 2
AMBIGUOUS / ≥3 NOT-CARRIER) judged the arm outright: 4/8 is
NOT-CARRIER with no re-run leg exercised and no re-scoring. The
byte-identical-days read is a bonus diagnostic, not a verdict
input. One instrument note for the NEXT run, same class as the
family-9 note: the bisect corpus carries `ascension` only as a
count — it never names which god an ascension was to, so a
godpath family's mechanism is checkable only by grepping the
receipt string (`outmatched`, `one_person_army`) across the
per-seed JSONs, never from the summary. That grep is what this
arm used; it worked, but a deed-level breakdown in the summary
would make the next godpath arm faster. No threshold change
proposed.

## Telemetry

Deviation check attempted; REFUSED by the tool itself
(recorder-corpus class): "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs." Recorded as the prereg directs; baseline
NOT rolled. (Same refusal as all prior bisect/transplant arms.)

## Infrastructure

- RUNTIME RESTART mid-step (~07:07Z): the first step attempt was
  killed by a runtime restart after the driver had started (3
  seeds would have finished; the driver log was 0 bytes, the
  per-seed dir empty — the driver died before writing any seed).
  Recovery: verified no driver process alive, HEAD still on the
  subject e514ba0a5, the fix standing.js still swapped in
  (f8fda429... — restore never ran), restored native standing.js
  byte-identical (sha 75762cb2259d, matching the step's own native
  line), deleted the tooling scratch, removed the 0-byte driver
  log, verified the tracked tree clean, and re-ran the step fresh.
  The restart ALSO wiped /tmp, so the step-script copy had to be
  re-created from the arm branch (`git show
  sim-transplant13-a:scripts/culpritbisect-step.sh`) before the
  re-run. The re-run completed cleanly (STEP-RC=0). No judged sim
  was lost — the killed attempt wrote no per-seed data.
- Safe-commit index clobber struck the prereg commit (prereg file
  staged-as-deleted post-commit) — repaired with the documented
  `git ls-tree -r HEAD -- <path> | git update-index --add
  --index-info` pipe, verified (status empty, diff empty,
  hash-object == HEAD blob c10ede75). Commit a13d9721e itself
  correct.
- `git status` took ~7 min once at run start (96k-file tree restat
  under load, load avg ~7.4 with sibling sims running); after the
  restat it runs in seconds. Slow, not stuck — the same shape as
  the family-9 arm's 2-min checkout note.
- No flap EPERM hit on this arm's writes. No pushes, no version
  bumps, no live verification (ship loop owns deploys). Arm branch
  tip: the stage-2 commit (evidence + proof, this file's commit —
  hash in the coordinator's merge record). Subject branch
  transplant-13-subject left in place at
  e514ba0a5ae3ac1ef7f3810d12565581e813d069.

## Proof

- scripts/test-transplant13.js — proof **103 passed, 0 failed**
  (family identity, merge-tree pre-check, subject state, step
  verdict, base restored; every branch-identity assertion
  worktree-only so the proof stays green on master).
- Re-run scripts/test-culpritbisect-a.js — **116 passed, 0 failed**.

## Wall numbers (this run's judged corpus)

- Subject (t13): survived 4/8, wave-5 2/8, wave-4 8/8, regional
  7/8, national 0, table 0, wins 0, median 150d, deaths 629,
  standing 150–325, blooded 4/8, tribute-ready 1/8.
- Carried: far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8;
  national 0, table 0, wins 0 on the collapse band.
- Measured families now include: 2b AMBIGUOUS (2/8 twice, suspect
  list), 4b NOT-CARRIER (3/8), 5b NOT-CARRIER (4/8), 9
  NOT-CARRIER (4/8), 10b NOT-CARRIER (3/8), 13 NOT-CARRIER (4/8).
  Unmeasured: 1, 2, 3, 6, 7, 8, 10 (10 measured via narrowed
  10b), 11, 12, 14, 15, 16. No carrier identified.

scale-onramp stays converging (NOT converged): one more family
measured NOT-CARRIER — and this one reproduces the far end
seed-for-seed, which says the collapse is not in the brawler
deed at all — but no carrier is identified and national/table/
wins remain 0 on the collapse band.
