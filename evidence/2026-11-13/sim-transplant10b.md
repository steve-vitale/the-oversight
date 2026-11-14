# H1 transplant — narrowed family 10b: PR #4 person-trust-map, NOT-CARRIER (3/8) (arm sim-transplant10b)

Run: fleshout-20261114T0337Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, narrowed family 10b (coordinator decision,
this run — the narrowed-tooling rule, 0015Z coordinator decision,
validated by measurement on narrowed 4b and 5b).
Arm branch: `sim-transplant10b` (worktree `~/workspace/worktrees/sim-transplant10b`,
base master 8c83b6a9a).
Prereg: evidence/2026-11-13/sim-transplant10b-prereg.md (committed BEFORE
cutting the subject or running any judged sim).
Canon: docs/CANON.md read first. NO canon doc covers the person-trust map:
docs/CONVERSATIONS.md covers dialogue/talk generally, docs/PARTY.md covers
party dynamics, docs/VILLAGER-BRAIN.md covers the brain; none covers a
per-villager trust map. The module's own rules are documented in the
merge's ONTOLOGY.md addition (quoted in the family-10 evidence §1, not
invented here). Nothing here invents canon.

## The question

Does origin family 10 — PR #4, the person-trust map (NEW
src/js/person-trust.js +233, src/js/bond-initiation.js +13 comment-only)
— alone collapse the far end (GOOD 4/8) toward the merge's 1/8? Seeds
190391–190398, horizon 150d death-aware, competent verbatim
own-policy, STEP id t10b-fbb9c53ed.

## 1. Family identity (verified by THIS arm at run start, before any sim)

- Merge `fbb9c53ed` "Merge pull request #4 from
  steve-vitale/cursor/person-trust-map-41aa". First parent
  `a76333124` (the family-13 brawler merge); second parent
  `4588114119f`. Second-parent side is 1 commit.
- `git diff --stat fbb9c53ed^1 fbb9c53ed`: 12 files, +594/−8.
  `src/js`: exactly 2 files — `src/js/person-trust.js` 233+/0− (NEW),
  `src/js/bond-initiation.js` 7+/6− (comment rewrite only; the diff
  touches only `//` comment lines, no code change — verified by
  reading the diff in full). Table reading (js=2, pol=0) CONFIRMED by
  this arm — matches round-2115 §3 and the family-10 arm.
- The family's own write-up (evidence/2026-11-08/person-trust.md,
  reported, not re-measured here): new module `src/js/person-trust.js`
  (loaded from index.html after skill-teaching.js) with a single
  writer `bumpPersonTrust(from, toward, n, reason)` onto
  `getPerson(from).trust[toward]` (unset reads as 0), readers
  `personTrustOf` / `personTrustCensus`, wrapping lived events only —
  `bondAdd` (mutual, applied warmth delta), `resolveConsequence`
  (villager → scholar, applied convo delta), `teachSkill` (+1 each
  way), `noteSharedFight` (+1 each way). Never writes
  `state.village.trust`. `bond-initiation.js` comment updated: the
  person map is written now; proposals still use the warmth window
  (15 ≤ warmth < 50). The ONTOLOGY.md addition states the same rules:
  `persontrust_lived_only`, `persontrust_not_scholar_trust`,
  `persontrust_directional`, `persontrust_unset_is_zero`,
  `persontrust_no_rng`, `persontrust_no_gate_changes` (never writes a
  win price, deed gate, readiness bar, or table rule).
- The family's own panel (seed 84101, 30d, competent; reported from
  its evidence, not re-run here): maxTrust 0 → 48, entries 0 → 65,
  trustedOpen 0 → 5; proof `node scripts/test-person-trust-20261108.js`
  19/19. The mechanism it closes: the dead `trustedAnyone` bonds gate
  in villager-goals.js (own trust map ≥ 40) — the map sat at 0 in wild
  play before this module (census: maxTrust 0 across 90 days on seed
  84101, while warming bond pairs grew 0 → 26).
- Other family files: `index.html` +1 (the person-trust.js script
  tag), `sw.js` +1 (offline ASSETS entry), `docs/ONTOLOGY.md` +15 (the
  person-trust section), `scripts/balance-proof.json` +2/−2 (panel
  re-pointed to evidence/2026-11-08/neutral-person-trust.json.gz),
  `scripts/green-list.txt` +1 (the test-person-trust line),
  `scripts/person-trust-panel-20261108.js` +49,
  `scripts/test-person-trust-20261108.js` +162, evidence ×3 (prereg,
  result, .gz panel corpus 90,287 bytes).
- `standing.js` NOT in the family diff; no policy file in the family
  diff. Far-end native standing.js sha256 `75762cb2…`; fix sha
  `f8fda4295a99…`; far-end policy sha `a7ff5c516440`.
- `src/js/person-trust.js` is ABSENT at the far end AND at the first
  parent (ls-tree empty on both); PRESENT at the merge (blob
  `e9334c61defb11004eeb2bf632e9b41eec969c68`). `bond-initiation.js`
  blob `d131970a2d71fe47b3907e2b65f900f852bf4eca` is IDENTICAL at the
  far end and the first parent. `index.html` blob
  `40d531d9d7b4e98dcc5c1b94b17e011cb16c91be` is IDENTICAL at the far
  end and the first parent.

## 2. Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree a76333124 203a32775 fbb9c53ed` (base = first parent)
predicted EXACTLY TWO content-conflicted files —
`scripts/balance-proof.json` (one hunk, @@ -1,7 +1,12 @@, 3 markers)
and `scripts/green-list.txt` (one hunk, @@ -913,5 +913,9 @@,
3 markers) — and four `changed in both` sections total
(docs/ONTOLOGY.md 0 markers, sw.js 0 markers, plus the two
conflicted files), six `added in remote` files (the 3 evidence
files, the panel + test scripts, src/js/person-trust.js), and NO
`removed in local` / `removed in remote` sections — no DU, no
delete/modify anywhere. `index.html` and `src/js/bond-initiation.js`
are NOT `changed in both` sections: the far-end blob EQUALS the base
blob for both, so only theirs changed them and they merge trivially.
Stage blobs (match the family-10 arm exactly): balance-proof base
`6dd3a0ab2771d56fcbc68d298d8764736641fe75`, ours
`d0c6a42ff2395a49672f235f0218a3f969619dee`, theirs
`16071b27be169b692892158381462e41cca37bd8`; green-list base
`9576711dd5f5c521e5189b62cb5b7765df6d817e`, ours
`410eccee8b091c9c5cc16b1931d98822f81fa601`, theirs
`ba5d513845672aac97b038cdc40d6dccd16f6f7c`.
Counting-method note (family-10 lesson, applied): conflict markers
in merge-tree output are prefixed with `+` (`+<<<<<<<`, `+=======`,
`+>>>>>>>`); a bare `^<<<<<<<` grep returns 0 and falsely reports
clean. This arm counted `+<<<<<<<` lines: 2 total, one per
conflicted file. The live pick reproduced the prediction exactly
(see §3).

## 3. Cherry-pick (live) — narrowed resolutions applied

- Subject branch `transplant-10b-subject` cut at the far end
  `203a32775`; `git cherry-pick -m 1 fbb9c53ed` conflicted in exactly
  TWO files, as predicted: UU `scripts/balance-proof.json`, UU
  `scripts/green-list.txt`. No src/js conflict, no DU. The other 10
  family files staged cleanly (M docs/ONTOLOGY.md, A evidence ×3, M
  index.html, A scripts/person-trust-panel-20261108.js, A
  scripts/test-person-trust-20261108.js, M src/js/bond-initiation.js,
  A src/js/person-trust.js, M sw.js).
- **Conflict 1 — UU `scripts/balance-proof.json`** (one hunk, lines
  1–11; markers at lines 3, 6, 9). Ours (HEAD = far end): panel
  `evidence/2026-11-10/neutral-r167-adopt.json.gz`, digest
  `ff87680261d3e717228bbaac1c2551269fb711464364d1cce49e3ccc0fa9975f`.
  Theirs (fbb9c53ed): panel
  `evidence/2026-11-08/neutral-person-trust.json.gz`, digest
  `b90b3411685bafd74504a2885cf41dadaaf906fec83413219078a8cf8ff3c44c`.
  Resolved OURS per the narrowed definition — the file drops out of
  the subject diff entirely (subject blob == far-end blob
  `d0c6a42ff2395a49672f235f0218a3f969619dee`).
- **Conflict 2 — UU `scripts/green-list.txt`** (one hunk, lines
  913–921; markers at lines 916, 919, 921). Ours: two lines,
  `scripts/test-pellet-boost-20261108.js quick` and
  `scripts/test-pellet-q4-20261108.js quick`. Theirs: one line,
  `scripts/test-person-trust-20261108.js quick`. Resolved UNION per
  the narrowed definition (the 2b precedent): ours lines PLUS the
  theirs person-trust line — the subject diff vs the far end is
  exactly +1 line, the person-trust line.
- Narrowed verifications (all pass, legs in
  scripts/test-transplant10b.js §8): (a) the subject-vs-far-end
  src/js diff is BYTE-IDENTICAL to the family diff (`cmp` clean);
  the policy diff is empty (family touches no policy file); (b)
  balance-proof subject sha == far-end sha; (c) green-list ==
  far-end + exactly the person-trust line. Subject diff vs far end:
  11 files, +592/−6 (family +594/−8 minus the ours pointer).
  person-trust.js blob == merge blob `e9334c61…`;
  bond-initiation.js blob == merge blob `1a8092cf…`; index.html blob
  == merge blob `659049c6…`; standing.js blob == far-end native blob.
  sw.js and ONTOLOGY.md blobs differ from the merge (as expected:
  auto-merged `changed in both`, 0 markers — far-end-side changes
  plus family changes combined; both carry the family's +1/+15).
- Subject commit: `4d7351b720c7360a84d2d8489e52efc9c285717f`
  ("Merge pull request #4 …", parent 203a32775). Subject branch
  `transplant-10b-subject` LEFT in place at that commit. NEVER
  committed to the arm branch. The family-10 arm's
  `transplant-10-subject` branch (left at the far end, no subject
  commit) was NOT touched — this arm used the distinct name
  `transplant-10b-subject` per the brief.

## 4. Step result — NOT-CARRIER

STEP t10b-fbb9c53ed (15m09s, STEP-EXIT 0): fix swapped in, native
restored sha-verified (75762cb2259d), policy a7ff5c516440 (far end —
the family touches no policy file). Survived **3/8** (GOOD,
REGIONAL_INTACT, median 132d, errors 0). Per-seed days:
132/120/130/102/150/150/150/93; survivors 190395, 190396, 190397.
Wave-5 5/8 (far end 2/8), wave-4 8/8, regional 8/8, national 0,
table 0, wins 0, deaths 708 (villager combat 271, expedition 179,
combat 139, the wild 80; 83% combat/expedition), standing 199–470,
blooded 3/8, tribute-ready 1/8 (190396 only, veterans 2/2).
Lost villages still had food (190391: 17,225 kcal at 132d) —
villages reach further and die fighting.

**VERDICT: NOT-CARRIER.** The person-trust map alone does not
collapse the far end (3/8 vs far end 4/8, merge 1/8). No 2/8
re-run: the threshold was met outright.

## 5. The 4b identity — the module was already measured once

The step's per-seed days (132/120/130/102/150/150/150/93) are
byte-identical to the narrowed 4b step's, and every summary
aggregate matches 4b exactly (survived 3/8, wave-5 5/8, median
132d, deaths 708 with the same cause shares, standing 199–470,
blooded 3/8, tribute-ready 1/8 on 190396). A full leaf-level diff
of the two per-seed corpora (all 8 seeds) finds exactly THREE
differing leaves per seed: anchorCommit, step id, and
teleCounts/godpath_deed (10b lower by 1–4 per seed: 23v26, 15v17,
25v28, 14v15, 34v36, 21v24, 17v21, 16v17).

The reason is in the family table, and this arm verified it
directly: the person-trust.js blob `e9334c61…` is IDENTICAL in the
4b subject, the 10b subject, the family-10 merge, and the
family-4 merge. Round-2115 §3 caveat (c) said it: the forager-deed
merge (family 4) contains two sub-families (person-trust side +
forager-deed side). Family 4b therefore already measured
[person-trust module + forager-deed changes] → 3/8; 10b now
measures [person-trust module alone] → 3/8. The godpath_deed gap
is the forager-deed side's extra deed events (4b higher on every
seed); the person-trust module's own telemetry (person_trust counts
identical in both corpora) fires identically in both subjects.

So the module IS live on this band — it writes the map thousands
of times per seed (person_trust tele events fire in every seed's
corpus) — and yet it moves nothing the recorder sees: no survival
change, no trajectory change, no death-cause change, no standing
change. The trust map fills, bonds are proposed (bond_proposed 408
across the band), and the villages live and die exactly as they
did without it. The module is active but survival-neutral on this
band — a second, independent NOT-CARRIER read on the same module
(4b's already contained it), not a "the code never runs" shrug.

## Wall numbers

- 10b subject: survived 3/8, wave-5 5/8, wave-4 8/8, median 132d,
  regional 8/8, national 0, table 0, wins 0, deaths 708,
  standing 199–470, blooded 3/8, tribute-ready 1/8.
- Carried: far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8;
  national 0, table 0, wins 0 on the collapse band.
- Measured families now four: 2b AMBIGUOUS (2/8 twice, on the
  suspect list), 4b NOT-CARRIER (3/8), 5b NOT-CARRIER (4/8), 10b
  NOT-CARRIER (3/8). Family 10 is the first social/trust family
  measured — and the first family measured twice over (inside 4b
  and alone here), both times NOT-CARRIER.

## What this means for the H1 transplant program

No carrier yet. Four of the attempted families are now measured
and none collapses the far end alone; the collapse still has no
single-family explanation. The person-trust result sharpens the
picture rather than widening it: a live, firing social module that
writes a gate the bonds drive reads changes nothing on the
survival band — the collapse is not in the social/trust wiring.
Next in table order after the coordinator decides: family 8
(713eb7545 live-thread-dry-engage, js=2), then 9–16. (Correction
to the 0215Z next-blanks note, carried: family 8 is next in table
order; family 7 already ran as UNMEASURED.)

## Sense-testing (SENSE-TESTING LAW)

Read the step corpus transcripts (vetSays) on the survivor seed
190396 (tribute-ready, 150d) and the longest lost seed 190391
(132d). The villages read as people, not counters:

- Door fights are named and consequential: "Niamh, Colleen,
  Reagan, Ayan and Fulvio met them at the door — 5 put down.
  Niamh, Reagan, Ayan, Fulvio are hurt." Groups, not solo heroes;
  hurt is carried, not reset.
- Veterans are called on camera: "This one is different — old,
  patient, unhurried — it has seen your kind before. A Elder
  veteran." (seed 190391, day 24).
- Blooded is voiced when it lands: "Blooded — the village knows
  where the Producers bleed. (Strikes hit 1.5× as hard; their
  blows land at 0.75× strength.)" (seed 190391, day 128).
- The show layer stays in voice throughout: "Oh, you survived
  the AUDIENCE NOTES? Cute. … that was the FINAL DRAFT, folks"
  (day 25); "The producers name it: the Nielsen. Ratings
  embodied. It fights boring — and the crowd adores it for that."
  (seed 190396, day 144).
- No transcript line is robotic, static, or repeated beyond the
  game's own formulaic door-fight narration, which is the same
  shape on the far end. Nothing in the corpus reads as the trust
  map misfiring — no bond spam, no trust-gated weirdness; bonds
  proposed 408 times across the band at a plausible rate.

Limitation, recorded honestly: the recorder corpus carries no
per-row trust/bond telemetry (the instrument keeps tele rows
only for veteran-relevant types; person_trust counts exist but
no rows), so the module's bond mechanism is uncheckable in
detail from this measurement — the same caveat the 4b arm filed.
The verdict rests on the survival count alone, which is the
pre-registered judge. The module's liveness is established
independently (person_trust tele events fire in every seed;
identical counts in the 4b subject that carries the same blob),
not assumed from the verdict.

## Metric review (§14)

The primary metric (survived/8, thresholds ≤1 CARRIER / 2
AMBIGUOUS / ≥3 NOT-CARRIER) judged the run outright: 3/8 →
NOT-CARRIER, no re-score, no re-run (the 2/8 rule was not
exercised). No threshold change is proposed. Two metric-adjacent
notes for the NEXT run, not this one: (1) the 10b/4b corpus
identity shows the band's trajectories are coarse — two
different families produce byte-identical death-days, so a
family can be fully live yet invisible to the survival count;
survival alone cannot see small social effects, only collapse.
(2) The person_trust teleCount does not discriminate module
presence (identical with the module in 4b and 10b, and the
instrument keeps no person_trust rows) — a future arm that
needs a module-liveness read must instrument the map directly
(census entries/maxTrust per seed), not read teleCounts.

## Telemetry

Deviation check attempted and REFUSED by the tool itself
(recorder-corpus class): "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs." Recorded as the prereg directs;
baseline NOT rolled.

## Proof results

- `node scripts/test-transplant10b.js`: **94 passed, 0 failed**
  (family identity, driver mechanics, narrowed-tooling
  justification for BOTH conflicted files, merge-tree pre-check
  with the corrected marker counting, prereg, verdict mapping,
  corpus + summary, narrowed subject state, step corpus with
  far-end policySha on all 8 seeds, base restored; every
  branch-identity leg is worktree-only — on master it asserts
  the arm prereg commit is an ancestor of HEAD instead, so the
  proof stays green after merge).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Proof-test fixes made during the run (both are leg bugs, not
  measurement changes): the green-list-reader leg first asserted
  scripts/check.js is the ONLY reader — false (journey scripts
  also name it); corrected to "every reader is scripts/ or
  evidence/ tooling, zero in src/". The far-end-existence leg
  first treated only person-trust.js as a clean addition — the
  family's 3 evidence files and its panel + test scripts are
  clean additions too (6 total); corrected. The family-10 arm's
  "green-list's only reader is scripts/check.js" note is the
  source of the first error — corrected here, not carried.

## Canon

docs/CANON.md read first; no canon doc covers the person-trust map
(see header). The module's rules come from the merge's own
ONTOLOGY.md addition. The family's change touches no win price,
deed gate, readiness bar, or table rule by its own documented
rules (`persontrust_no_gate_changes`). No canon doc was invented
or rewritten.

## Infrastructure

- Host write flap struck mid-run at the step closeout (~05:00Z):
  the `git checkout sim-transplant10b` back from the detached
  subject step failed with EPERM writing the worktree index
  lock ("Operation not permitted"), then the retry aborted on
  local modifications — the interrupted checkout had left the
  worktree mixed: some files fully updated to arm-branch content
  (e.g. docs/ONTOLOGY.md, byte-identical to the arm blob), some
  TRUNCATED TO 0 BYTES (src/js/standing.js, index.html,
  src/js/game.js, scripts/policies/competent.js — all 0 bytes).
  No work was lost: every truncated file is recoverable from git
  (both branches intact in the object store), and my uncommitted
  work was untracked (proof test, corpora, logs — untouched by
  checkout). Recovery: `git checkout -f sim-transplant10b`
  completed the interrupted checkout; verified HEAD back on the
  arm branch, tracked tree clean, standing.js 46,211 bytes (==
  arm blob), index.html and game.js restored. Flap window
  ~1 attempt; no EPERM hit on any other git or file write this
  run (the prereg commit's safe-commit index clobber is separate
  — see below).
- Safe-commit index clobber struck the prereg commit (e67a3088c):
  the committed file showed staged-as-deleted + untracked —
  repaired with the documented `git ls-tree -r HEAD | git
  update-index --add --index-info` pipe, verified (status/diff
  empty, blobs match). No clobber expected on the evidence
  commit; will watch and repair the same way if struck.
- Step ran 15m09s (4b's took 10m41s; the box was loaded — sibling
  panels and Loop B work throughout). No registration was needed
  (tree pre-registered by the coordinator).
- No pushes, no version bumps, no live verification (ship loop
  owns deploys).

## Closeout

- Arm branch `sim-transplant10b` tip (this commit); subject branch
  `transplant-10b-subject` LEFT at
  `4d7351b720c7360a84d2d8489e52efc9c285717f` (subject commit, kept);
  worktree verified clean at closeout (tracked tree empty,
  standing.js == HEAD, no swap residue — the step script's
  restore was sha-verified at step time).
