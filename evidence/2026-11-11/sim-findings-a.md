# sim-findings-a — three tracker follow-ups (Loop B adoption review, "next blanks #1")

Branch `sim-findings-a`, from current master. Three fixes, three commits, no
killed sub-arms — plus two follow-up proof-hermeticity fixes below (one
shared-pattern commit). Worktree `~/workspace/worktrees/sim-findings-a`.
No canon doc covers any of these three (test voicing, test audit, medicine
verb) — no canon invented; fixes follow the code's own documented intent.

## (a) Warpath remainder-count test — FIXED (commit 4bfa06573)

**What was wrong — two real defects, not one.** The task brief diagnosed
"a monster-noun lookup miss" as the cause. Proving it showed the brief's
mechanism was wrong and the noun miss was real but separate:

1. **The assertion failed on a stale literal, not the noun.** The test
   asserted `/3 more tooths after that/`; the shipped line says "3 more
   **teeth** after that". The r130 grammar fix (96ee2136a, "tooths->teeth")
   changed `src/js/table.js` but never updated the test regex — the test
   has failed ever since (its commit message claimed "proof test green").
   The remainder clause is produced regardless of the noun, so the noun
   miss cannot cause this assertion to fail.
2. **The noun miss is real voicing.** The fixture's first wave-4 monster
   is the Congregation, whose descriptor is "a church where the hymns are
   static" — a genuine noun phrase. `monsterNoun`'s finite-verb guard
   fired on "are" and returned 'something', so the line read "you put
   down the something twice". The guard was written for main-clause prose
   ("the grass is humming in harmony"), but it tested the whole string,
   so verbs inside relative clauses — and clauses after a comma — killed
   real noun phrases. A census over all 72 monsters (empty codex,
   pre-System) found 9 returning 'something'; 7 are genuine multi-sentence
   prose, 2 are noun phrases wrongly killed: congregation and
   network_tower ("a mast taller than the trees, and it is humming" — the
   comma rule would have salvaged the head, but the verb check ran first).
   Note: a kill sets codex stage 'slain', not a villageName, so 'slain'
   alone does not rescue the noun — the table comment claiming otherwise
   is wrong. (In practice the System arrives day 7, before any wave-4
   kill, so the true name usually wins in prod; the pre-System voicing
   was still wrong wherever it surfaced.)

**Fix.**
- `src/js/game.js` `monsterNoun`: comma truncation moved before the verb
  check, and the verb check reads only the head before the first
  where/when/that/who/which/whose. Census after: 7 'something', exactly
  the 7 prose descriptors — congregation → "church where the hymns are
  static", network_tower → "mast taller than the trees".
- `scripts/test-warpath-twice-20261023.js`: regex "tooths" → "teeth"
  (correcting a stale literal to the shipped wording, not loosening);
  new assertion that the war line never voices "the something".

**Before/after (unmodified base, tree clean):** `node
scripts/test-warpath-twice-20261023.js` → 7 pass, 1 fail ("remainder
count honest (3 more)"); war line: "…you put down the something twice.
3 more teeth after that." **After fix:** 9 pass, 0 fail; war line:
"…you put down the church where the hymns are static twice. 3 more
teeth after that."

## (b) Tabledeed E3 vacuous check — FIXED (commit 03ecc60f2)

**What was wrong.** E3 parsed `git diff --stat` with
`.split(/\s+/).pop()`, which takes the `+/-` bar, never the filename —
so `files` came out empty and the confinement check passed vacuously
(it passed with `src/js/progression.js` in the diff). The function-scope
half of E3 was real and green.

**Fix.** `scripts/test-tabledeed-20261021.js` E3 now uses `git diff
--name-only` (one filename per line, no parsing ambiguity) through a
shared `filesConfined()` predicate, plus three synthetic checks proving
the predicate itself is real: it flags a diff containing
`src/js/progression.js`, passes an allowed-only diff, passes a clean
(empty) diff.

**Before/after.** Live demonstration: with a marker line appended to
`src/js/progression.js`, the test FAILed E3 naming it —
`["scripts/test-tabledeed-20261021.js","src/js/progression.js"]`
(marker then restored via `git checkout`). On the clean diff: `RESULT:
ALL GATES GREEN` (E0–E3, F1–F5, det-gate).

## (c) Dry-swallow bandage verb — FIXED (commit 20da580d7, [needs-eyes])

**What was wrong.** The medname fix (9b98a0efc) made the pill NAME right,
but the undiagnosed-use line in `useMedicine` (`src/js/game.js`)
hardcoded "dry-swallow" for every kind: "You dry-swallow the bandage."
A bandage is applied, not swallowed. The six kinds in the KIND_NAME /
KIND_CLASS maps (verified against `src/data/regions.json` medTypes —
no other kinds exist): antibiotics, antiparasitic, antimalarial,
cold_remedy, bandage, ors.

**Fix.** Per-kind `KIND_VERB` map beside `KIND_NAME`: pills
(antibiotics / antiparasitic / antimalarial / cold_remedy) dry-swallow,
bandage applies, ORS is drunk. The undiagnosed line is now `You
${kindVerb} the ${kindName}.` — the only "swallow" line in
`useMedicine`; the diagnosed cure/ease lines name the kind without a
use verb and are untouched. Player-facing spoken text changed, hence
[needs-eyes] on this commit only.

**Test.** `scripts/test-journey-crisis-r181-regional-meds.js`: the (6)
bandage/ors checks now expect "apply"/"drink"; new (7) VERBS section
asserts the exact verb line for all six kinds (trichinosis as the
shared undiagnosed sickness — (6) never diagnosed it — plus a
wrong-verb exclusion per kind). **After:** `r181 regional-meds: ALL
PASS` (23 checks, incl. 6 new verb checks). Spoken lines verified by
probe before writing the test, e.g. "You apply the bandage. You're
guessing — nobody's named this sickness yet." / "You drink the ORS. …"

**Observation (not fixed, out of scope):** the undiagnosed cure line
says "The antiparasitic work anyway" — plural agreement treats
antiparasitic as plural (deliberate in the medname fix). Left alone;
flagging here only.

## Verification

- `node scripts/test-warpath-twice-20261023.js` — 9 pass, 0 fail.
- `node scripts/test-tabledeed-20261021.js` — ALL GATES GREEN.
- `node scripts/test-journey-crisis-r181-regional-meds.js` — ALL PASS (23).
- `node scripts/check.js --quick` (340 scripts, 564s): 335 passed,
  5 failed — and all 5 failures reproduce IDENTICALLY on unmodified
  base game.js (checked out d897eab1f game.js, ran all 5, restored):
  test-measurement-proof-update.js (exit 1), test-measurement-workflow.js
  (same retained-neutrality-proof failure), test-phone-frame-proof.js
  (same 3 failures), test-living-garden-deed-attainment.js and
  test-one-person-army-deed-attainment.js (both hit the 120s timeout on
  base too). Zero new failures from this work; the 5 are pre-existing
  standing failures (measurement-proof staleness pair, phone-frame
  staleness, two slow deed-attainment sims).
- Blast-radius spot checks for the `monsterNoun` change (the only
  game-code change with broad reach): test-article-phrase-20261018 ALL
  GREEN, test-finalvoice-20261111 ALL GATES GREEN, test-killbeat 24
  passed, test-prose-warts-20261007 10 ok / 0 FAIL. test-monster-noun
  and test-knowledge-gating both crash in `genRoster` with `FATAL
  ReferenceError: Text is not defined` — VERIFIED PRE-EXISTING by
  running them against unmodified base game.js (identical crash);
  no test asserts congregation/network_tower → 'something'.
- Index-clobber struck after all three safe-commits (MM on committed
  files); repaired each time with `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`, verified `git status --short`
  empty + `git diff HEAD` empty. Commits themselves were always correct.

## Killed sub-arms

None. All three fixes landed as designed; no sub-fix proved
wrong-headed.

## (d)+(e) Bisect proof hermeticity — test-bisect-merge-a + test-bisect-policyswap-a — FIXED (one shared-pattern commit)

**Setup note.** The proof files did not exist in this worktree: the
branch predated the bisect merges (52b7225d6, c83d47d03). Merged
master into `sim-findings-a` first (plain 3-way merge, exit 0, zero
conflicts — master had not touched `src/js/game.js`); the branch now
contains master, so the coordinator's `--ff-only` merge still works.
Reproduced both failures unpiped in the worktree first: merge-a exit
2 (`BISECTMERGE STOP: standing.js has the marker but sha
1eec2c9235a8 is not the vetphantom fix sha f8fda4295a99 — wrong
swap.`); policyswap-a exit 1, 49/50 (`standingGuard ACCEPTS this
tree standing.js`, sha=1eec2c9235a8).

**Shared root cause (same class in both).** Both proofs coupled
guard legs to live on-disk `src/js/standing.js`: on the measurement
bases the file was the vetphantom fix (sha f8fda4295a99), but after
rebase onto current master it carries the ROSTER CHECK marker with a
later sha (1eec2c9235a8, post-fix edits). The guard logic is correct;
the proofs were base-state-bound, not hermetic. The verdicts are NOT
in question: merge-a COLLAPSE_INSIDE_MERGE 1/8 (52b7225d6) and
policyswap-a POLICY_EXONERATED 2/8 (c83d47d03) both ran with the
guards passing and 0 instrument errors — only the proofs' coupling
to live disk is being fixed.

**Coordinator error, recorded plainly (for the next coordinator).**
The policyswap merge proceeded with the proof RED because the proof
run and the merge were chained in one command without `&&` — the
merge ran despite the proof's non-zero exit. Next coordinator: check
the proof exit BEFORE merging, with an unpiped command
(`node scripts/test-bisect-policyswap-a.js; echo $?`), never chained
with `;`.

**Fix (d) — merge-a driver + test.**
- `scripts/bisect-merge-driver-20261111.js`: the leg guard is still
  READ at require time (so `oneRun` records the swap it ran under)
  but ENFORCED only at the run entry point (`refuseUnlessSwapped()`,
  first statement of main). Requiring the driver never exits the
  process now; the wrong-sha / missing-marker / unreadable-file
  messages are unchanged. The sibling anchor/mournblooded drivers
  have the same top-level-exit shape but only check marker presence,
  which is why they stayed green on master — only the merge driver
  checks the exact sha.
- `scripts/test-bisect-merge-a.js` §3: the fix text now comes from
  `git show 5157782a4:src/js/standing.js` (pinned commit, never live
  disk); the "on-disk HAS the fix" assertion became "the pinned fix
  text HAS the marker"; the wrong-sha source-grep became a REAL
  subprocess refusal — the driver run as a script against a scratch
  REPO (scripts symlink + wrong-sha standing.js) must exit 2 with
  the BISECTMERGE STOP line. Count stays 49.
- §1 (diagnosis correction — the "only the guard" brief was
  incomplete, same class of miss as the warpath task): the ladder
  assertions were ALSO base-bound. The test asserted `ladder(3) = 1`
  after a TB fall — the OLD inline rule at the e4dbe581b merge base —
  but current master uses the shared `countLivingVeterans` rule, so
  the fallen killer counts 0 (the sibling anchor tests assert 0 on
  master). The test now detects the rule from the LOADED
  `_ladderLivingVeterans` source (`String(...).indexOf
  ('countLivingVeterans')`) and asserts the matching count on either
  base — exact, not loosened.

**Fix (e) — policyswap-a test only.** The driver needed no change:
`readGuards()` is already called only from `main()`, so requiring it
never exits. The test §3: standing text from `git show
5157782a4:src/js/standing.js`; the new-policy text from `git show
3f136f07e:scripts/policies/competent.js` (pinned, not live disk);
the redundant 'records the expected old policy sha' source-grep
(subsumed by the legGuard-ACCEPTS assertion) replaced with
'standingGuard REFUSES a marker-bearing text with the wrong sha' —
a coverage gap, no such leg existed. Count stays 50 (my first edit
accidentally added one, 51/51 — caught on the count check and
corrected by removing the redundant source-grep).

**Verification (all unpiped).**
- `node scripts/test-bisect-merge-a.js` → `bisect-merge-a: 49
  passed, 0 failed`, exit 0.
- `node scripts/test-bisect-policyswap-a.js` → `bisect-policyswap-a:
  50 passed, 0 failed`, exit 0.
- Siblings, no regression: test-bisect-anchor-a 41/41, anchor2-a
  41/41, mournblooded-a 50/50.
- Refusals still loud: merge driver in-test subprocess (wrong-sha
  swap → exit 2, BISECTMERGE STOP); manual scratch runs — policyswap
  driver with old policy + wrong standing.js → exit 2
  (`BISECTPOLICYSWAP STOP: standing.js has the marker but sha
  b22bd912a58e is not the vetphantom fix sha ... — wrong
  standing.js.`); merge driver with missing standing.js → exit 2
  (`BISECTMERGE STOP: cannot read standing.js: ENOENT ...`).
- Neither proof is on the green list or referenced by check.js
  (verified) — this is a standalone-proof repair, not a green-list
  break. No `check.js` run needed for these files; the binding
  proofs are the two suites above plus the siblings.
