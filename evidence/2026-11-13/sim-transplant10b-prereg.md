# H1 transplant — narrowed family 10b: PR #4 person-trust-map (arm sim-transplant10b)

Run: fleshout-20261114T0337Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, narrowed family 10b (coordinator decision,
this run — the narrowed-tooling rule, 0015Z coordinator decision,
validated by measurement on narrowed 4b and 5b).
Arm branch: `sim-transplant10b` (worktree `~/workspace/worktrees/sim-transplant10b`,
base master 8c83b6a9a).
Prereg written and committed BEFORE cutting the subject or running any judged sim.
Canon: docs/CANON.md read first. NO canon doc covers the person-trust map:
docs/ was checked — docs/CONVERSATIONS.md covers dialogue/talk generally,
docs/PARTY.md covers party dynamics, docs/VILLAGER-BRAIN.md covers the brain;
none covers a per-villager trust map. The module's own rules are documented
in the merge's ONTOLOGY.md addition (quoted in the family-10 evidence §1,
not invented here). Nothing here invents canon.

## The question

Narrowed family 10b is a NEW family definition, never a re-judgment of
family 10 (which read UNMEASURED on a cherry-pick conflict confined to
two zero-src-reader tooling files). Does the person-trust map alone —
NEW src/js/person-trust.js (+233) plus the bond-initiation.js comment
rewrite — collapse the far end (GOOD 4/8) toward the merge's 1/8?
Seeds 190391–190398, horizon 150d death-aware, competent verbatim
own-policy, STEP id t10b-fbb9c53ed.

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `fbb9c53ed` "Merge pull request #4 from
  steve-vitale/cursor/person-trust-map-41aa". First parent
  `a76333124` (the family-13 brawler merge); second parent
  `4588114119f`. Second-parent side is 1 commit
  (`git rev-list --count fbb9c53ed^1..fbb9c53ed^2` = 1).
- `git diff --stat fbb9c53ed^1 fbb9c53ed`: 12 files, +594/−8.
  `src/js`: exactly 2 files — `src/js/person-trust.js` 233+/0− (NEW),
  `src/js/bond-initiation.js` 7+/6− (comment rewrite only — the diff
  touches only `//` comment lines inside the bonds-drive note, no
  code change; verified by reading the diff in full). Table reading
  (js=2, pol=0) CONFIRMED by this arm — matches round-2115 §3 and
  the family-10 arm.
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
  `index.html` blob `40d531d9d7b4e98dcc5c1b94b17e011cb16c91be` is
  IDENTICAL at the far end and the first parent, so the family's
  index.html hunk merges trivially.

## Narrowed 10b definition (authorized by the coordinator, this run)

NARROWED-TOOLING RULE (0015Z coordinator decision, validated by
measurement on narrowed 4b and 5b): conflicts confined ENTIRELY to
files with zero readers in src/ may be re-run as a narrowed family.

NARROWED 10b DEFINITION: resolve ONLY the two tooling conflicts per
this definition —
- `scripts/balance-proof.json` OURS (the far-end r167-adopt pointer
  — the subject's balance-proof blob must equal the far-end blob);
- `scripts/green-list.txt` UNION (far-end lines PLUS exactly the
  theirs person-trust test line — the 2b precedent).
Nothing else is resolved by hand. After resolving, VERIFY: (a) the
measured diff (src/js + policies) is content-identical to the family
diff; (b) balance-proof subject sha == far-end sha; (c) green-list ==
far-end + exactly the person-trust line. If the pick hits ANY
game-code conflict, ANY DU, or any conflict beyond these two files:
STOP, report the exact conflict list, do NOT hand-resolve game code.

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree a76333124 203a32775 fbb9c53ed` (base = first parent)
predicts EXACTLY TWO content-conflicted files —
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
Counting method (family-10 lesson): conflict markers in
merge-tree output are prefixed with `+` (`+<<<<<<<`, `+=======`,
`+>>>>>>>`); a bare `^<<<<<<<` grep returns 0 and falsely reports
clean. This arm counted `+<<<<<<<` lines: 2 total, one per
conflicted file.

## Narrowed-tooling justification (verified by THIS arm)

- `git grep -l balance-proof 203a32775 -- src/` returns nothing
  (its readers are measurement/proof tooling only, as the 5b arm
  verified). `git grep -l green-list 203a32775 -- src/` returns
  nothing (its only reader is scripts/check.js).
- The driver (`scripts/culpritbisect-driver-20261113.js`) never
  reads either file. Resolving either pointer either way changes NO
  game behavior and NO policy behavior: the subject's measured game
  + policy diff is byte-identical to the family's either way.
- The family's own panel corpus
  (evidence/2026-11-08/neutral-person-trust.json.gz) rides along as
  a clean addition; it is data, not a game-code change.

## Transplant prereg (binding; round-2115 §3 + narrowed-10b additions)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band, per-seed
  days 86/144/150/43/150/87/150/150 from the bisect endpoint
  verification), with the roster-check standing fix swapped in for
  every step exactly as the bisect prereg specifies (fix
  `f8fda4295a99`; native restored byte-identical afterwards,
  sha-verified). Base is the far end, never current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step. Driver mechanics
  reused (`scripts/culpritbisect-step.sh` +
  `scripts/culpritbisect-driver-20261113.js` + analyzer, same as
  the bisect steps); STEP id `t10b-fbb9c53ed`. The step script is run
  from a /tmp copy with REPO passed in (the script is absent at the
  far end, so running it from the worktree would unlink it mid-run
  at the detached checkout). The step script restores tooling
  scratch from the `master` branch; the driver loads competent.js
  from the checked-out tree (REPO-relative require), so when the
  step checks out the subject, the driver loads the SUBJECT's
  policy (unchanged here — the family touches no policy file; the
  far-end policy sha `a7ff5c516440` is recorded per seed).
- Subject: the transplant commit = far end + narrowed family diff,
  built on a scratch branch named `transplant-10b-subject` in this
  worktree and LEFT in place (branch kept, hash recorded in the
  evidence file). Never committed to the arm branch. Apply via
  `git cherry-pick -m 1 fbb9c53ed`, then resolve ONLY the two
  tooling conflicts per the narrowed definition above and continue
  the pick. On ANY other conflict: STOP per the narrowed
  definition above. NOTE: the family-10 arm left a
  `transplant-10-subject` branch at the far end (no subject commit)
  in the shared repo; this arm uses the DISTINCT name
  `transplant-10b-subject` and does not touch that branch.
- Primary metric: survived/8 on the band. Verdict thresholds:
  - ≤1/8 CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list. (A 2/8 re-run on a
    deterministic driver is a stability check, not fresh evidence.)
  - ≥3/8 NOT-CARRIER — family alone does not collapse (far end is
    4/8, so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant10b.js` (family identity incl. the
  narrowed-tooling grep justification for BOTH conflicted files,
  merge-tree pre-check with the corrected marker counting,
  narrowed subject state, step verdict, base restored; every
  branch-identity assertion marked worktree-only so the proof stays
  green on master) plus re-run the reused
  `scripts/test-culpritbisect-a.js` (116 legs).
- Sense-testing (SENSE-TESTING LAW): read the step corpus
  transcripts (vetSays) — do the villagers still act like people
  with the trust map written, and what changes in what they do/say?
  Reported in the evidence file in plain words. Context: the
  family's own panel says the module is NOT inert (maxTrust 0 → 48,
  65 map entries on seed 84101) — it writes a gate the bonds drive
  reads — so a carrier read here would be mechanistically plausible;
  judge the corpus on its own terms either way.

## Canon

docs/CANON.md read first; no canon doc covers the person-trust map
(see header). The module's rules come from the merge's own
ONTOLOGY.md addition. The family's change touches no win price, deed
gate, readiness bar, or table rule by its own documented rules
(`persontrust_no_gate_changes`). No canon doc was invented or
rewritten.
