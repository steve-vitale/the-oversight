# H1 transplant — family 10: PR #4 person-trust-map, UNMEASURED (conflict-STOP) (arm sim-transplant10)

Run: fleshout-20261114T0337Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 10 (coordinator brief inline).
Arm branch: `sim-transplant10` (worktree `~/workspace/worktrees/sim-transplant10`,
base master 8c83b6a9a).
Prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (transplant
program definition + prereg, binding), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg: the
roster-check standing-fix swap f8fda4295a99 and the step mechanics), plus
evidence/2026-11-13/sim-transplant-round-0215.md (last run's coordinator
evidence — how arms 4b/5b/7 ran, including the conflict-STOP outcome and
the proof-on-master branch-identity note). This evidence file was written
AFTER the conflict-STOP; no judged sim ran, so there is no prereg
closeout to re-verify against a measurement — the prereg's conflict rule
is the verdict.
Canon: docs/CANON.md read first. NO canon doc covers the person-trust
map: docs/ was checked — docs/CONVERSATIONS.md covers dialogue/talk
generally, docs/PARTY.md covers party dynamics, docs/VILLAGER-BRAIN.md
covers the brain; none covers a per-villager trust map. The module's own
rules are documented in the merge's ONTOLOGY.md addition (quoted in §1,
not invented here). Nothing here invents canon.

## The question

Does origin family 10 — PR #4, the person-trust map (NEW
src/js/person-trust.js +233, src/js/bond-initiation.js +13) — alone
collapse the far end (GOOD 4/8) toward the merge's 1/8? Seeds
190391–190398, horizon 150d death-aware, competent verbatim
own-policy, STEP id t10-fbb9c53ed (never run — see §Cherry-pick).

## 1. Family identity (verified by THIS arm at run start, before any sim)

- Merge `fbb9c53ed` "Merge pull request #4 from
  steve-vitale/cursor/person-trust-map-41aa". First parent
  `a76333124` (the family-13 brawler merge — the origin line already
  contained it when this PR landed); second parent `4588114119f`.
  Second-parent side is 1 commit.
- `git diff --stat fbb9c53ed^1 fbb9c53ed`: 12 files, +594/−8.
  `src/js`: exactly 2 files — `src/js/person-trust.js` 233+/0− (NEW),
  `src/js/bond-initiation.js` 7+/6− (comment rewrite only; no code
  change). Table reading (js=2, pol=0) CONFIRMED by this arm — matches
  round-2115 §3 and the brief.
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
  far end and the first parent — the family's bond-initiation hunk
  applies against identical base content on both sides.

## 2. Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree a76333124 203a32775 fbb9c53ed` (base = first parent)
predicted EXACTLY TWO content-conflicted files — `scripts/balance-proof.json`
(one hunk, @@ -1,7 +1,12 @@, 3 markers) and `scripts/green-list.txt`
(one hunk, @@ -913,5 +913,9 @@, 3 markers) — and four
`changed in both` sections total (docs/ONTOLOGY.md 0 markers,
sw.js 0 markers, plus the two conflicted files), six `added in remote`
files (the 3 evidence files, the panel + test scripts,
src/js/person-trust.js), and NO `removed in local` / `removed in
remote` sections — no DU, no delete/modify anywhere.
`index.html` and `src/js/bond-initiation.js` are NOT `changed in both`
sections: our (far-end) blob EQUALS the base blob for both
(index.html 40d531d9, bond-initiation.js d131970a), so only theirs
changed them and they merge trivially.

Counting-method note (so no run re-learns it): in merge-tree output
the conflict markers are prefixed with `+` (`+<<<<<<< .our`,
`+=======`, `+>>>>>>> .their`). A bare `^<<<<<<<` grep returns 0 and
falsely reports a clean prediction — my first grep did exactly that.
The corrected count (transplant118/2b method: `+<<<<<<<`, `+=======`,
`+>>>>>>>`) is 3 markers per conflicted file. The live pick
reproduced the prediction exactly (see §Cherry-pick) — the sixth
consecutive exact prediction in this program (families 2, 2b, 5, 5b, 7
before it).

## 3. Cherry-pick (live) — CONFLICT-STOP

- Subject branch `transplant-10-subject` cut at the far end
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
  The same file's `normalizedSources` hashes (balance-panel.js,
  lib/balance-scorecard.js) merged cleanly to theirs inside the
  conflicted file. Stage blobs (`git ls-files -u`):
  stage 1 (base) `6dd3a0ab2771d56fcbc68d298d8764736641fe75`,
  stage 2 (ours) `d0c6a42ff2395a49672f235f0218a3f969619dee`,
  stage 3 (theirs) `16071b27be169b692892158381462e41cca37bd8`.
- **Conflict 2 — UU `scripts/green-list.txt`** (one hunk, lines
  913–921; markers at lines 916, 919, 921). Ours: two lines,
  `scripts/test-pellet-boost-20261108.js quick` and
  `scripts/test-pellet-q4-20261108.js quick`. Theirs: one line,
  `scripts/test-person-trust-20261108.js quick`. Stage blobs:
  stage 1 (base) `9576711dd5f5c521e5189b62cb5b7765df6d817e`,
  stage 2 (ours) `410eccee8b091c9c5cc16b1931d98822f81fa601`,
  stage 3 (theirs) `ba5d513845672aac97b038cdc40d6dccd16f6f7c`.
- Per the binding conflict-STOP rule (prereg §3, task brief): STOP.
  The pick was aborted (`git cherry-pick --abort`, rc=0 — the
  `update-index --refresh` first, after arm 7's not-uptodate retry
  lesson), the subject branch left at the far end with NO subject
  commit, the arm branch checked out again, and the tree verified
  clean. No hand-resolution of any kind was attempted.
- Tooling-only analysis (facts for the coordinator, NOT a resolution):
  the TWO unmerged paths ARE confined to zero-src-reader tooling
  files — `git grep -l balance-proof <HEAD> -- src/` returns nothing
  (its readers are measurement/proof tooling only, as the 5b arm
  verified) and `git grep -l green-list <HEAD> -- src/` returns
  nothing (its only reader is scripts/check.js). The narrowed-tooling
  rule does NOT apply to this arm: the task brief states explicitly
  that the narrowed-tooling rule is a coordinator decision, not the
  worker's. A narrowed 10b IS mechanically definable on these facts
  (balance-proof.json ours — far-end r167-adopt pointer — plus
  green-list.txt UNION of the ours pellet lines and the theirs
  person-trust line, the 2b precedent; every game-code file staged
  cleanly), but it needs its own prereg and a coordinator decision —
  NOT this arm's call. No narrowed re-run was attempted.

**VERDICT: UNMEASURED.** Survived/8 was never measured: no step ran,
no survival number exists for family 10. This is the SIXTH family to
stop on divergence (families 1, 2, 3, 6, 7 before it; 4 and 5 were
measured only via narrowed 4b/5b). Unlike family 7 — whose conflicts
were game-code DU + docs — family 10's conflicts are tooling-only,
so the narrowed-10b route is the live next step for the coordinator.

## 4. Step result — NO STEP RAN

STEP t10-fbb9c53ed was never run. No driver log, no summary JSON, no
per-seed corpus exists for it (legs in scripts/test-transplant10.js
assert all three absent). The step script was never invoked; the
standing-fix swap was never performed on any checkout (the abort
restored the subject branch to the far end before any swap could
happen). Nothing to classify: no GOOD/BAD/AMBIGUOUS read exists.

## Wall numbers

No judged corpus this arm. Carried: far end 4/8, wave-5 2/8; merge
1/8, wave-5 0/8; national 0, table 0, wins 0 on the collapse band.
Family 10 contributes no wall numbers.

## What this means for the H1 transplant program

Measured families remain three: 2b AMBIGUOUS (2/8 twice, on the
suspect list), 4b NOT-CARRIER (3/8), 5b NOT-CARRIER (4/8). Family 10
joins the unmeasured set, but it is the FIRST unmeasured family whose
blocker is tooling-only — every game-code file in its diff staged
cleanly, including the NEW module and both loader files. The
narrowed-tooling rule has already been validated by measurement
twice (4b, 5b); a coordinator-authorized narrowed 10b would measure
the first social/trust family in the program, and the family's own
panel says the module is NOT inert (maxTrust 0 → 48, 65 map entries
on seed 84101) — it writes a gate the bonds drive reads, so a
carrier read on 10b would be mechanistically plausible in a way the
garden reorder never was. Next in table order after the coordinator
decides 10b: family 8 (713eb7545 live-thread-dry-engage, js=2), then
9–16. (Correction to the 0215Z next-blanks note: family 8 is next in
table order; family 7 already ran this program as UNMEASURED.)

## Sense-testing (SENSE-TESTING LAW)

No corpus exists to read — no transcript, no villager, no village to
assess. The only sense-relevant material is the family's own evidence
(§1, reported): its panel's non-aimed errands moved inside ±25% and
the warmth-window fixture holds with an empty person map, which is
consistent with a lived-only writer that does not disturb daily
routines. That is the family's claim, not this arm's observation;
this arm makes no sense-testing judgment.

## Metric review (§14)

The primary metric (survived/8, thresholds ≤1 CARRIER / 2 AMBIGUOUS /
≥3 NOT-CARRIER) was never measured — the conflict rule stopped the
run before the metric could be read. No re-score occurred and none
was possible. The 2/8 re-run rule was not exercised. No threshold
change is proposed. The merge-tree counting-method note (§2) is a
tooling lesson, not a metric revision: future arms must count
`+<<<<<<<` lines, never bare `^<<<<<<<`.

## Telemetry

No corpus exists, so no deviation check was attempted — there is
nothing to check. Baseline NOT rolled. (Prior arms recorded the
tool's recorder-corpus refusal; that refusal presupposes a corpus,
which this arm does not have.)

## Proof results

- `node scripts/test-transplant10.js`: **85 passed, 0 failed** (family identity, merge-tree pre-check with
  the corrected marker counting, zero-src-reader verification for
  BOTH conflicted files, verdict mapping, base state with the
  branch-identity leg marked worktree-only so the proof stays green
  on master, seed-band identity, live conflict record with exact
  hunks/markers/stage blobs, no corpus).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Host write flap: no EPERM failure struck this arm's git or file
  writes. One git invocation ran ~100s (status+log at run start) and
  one ~130s (abort + checkout + diff) — slow, not failed; both
  completed with rc=0.
- Safe-commit index clobber: watched for at commit time (see
  §Closeout).

## Canon

docs/CANON.md read first; no canon doc covers the person-trust map
(see header). The module's rules come from the merge's own
ONTOLOGY.md addition, quoted in §1. No canon doc was invented or
rewritten. The family's change touches no win price, deed gate,
readiness bar, or table rule by its own documented rules
(`persontrust_no_gate_changes`).

## Closeout

- Arm branch `sim-transplant10` tip (this commit); subject branch `transplant-10-subject` LEFT at
  `203a327750a223e0a1465dc51f5409787efdfaae` (far end, no subject
  commit); worktree verified clean at closeout (tracked tree empty,
  standing.js == HEAD, no swap residue — no swap was ever performed).
