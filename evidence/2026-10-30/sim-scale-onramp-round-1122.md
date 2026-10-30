# sim-scale-onramp-round-1122 — coordinator evidence (2 DIAG-GO arms, merged locally pending ship)

Run: flesh-out loop, run fleshout-20261030T1122Z, axis scale-onramp
(converging, NOT converged). Sibling loop B live on food-economy at
run start (NOT touched); sibling playtest journey-landing live (NOT
touched). No lock at run start, main tree clean, disk 18%. No live
claim files at run start, so scale-onramp was free. This run took the
1107Z run's ranked-next items (3) and (4) in order: the time-ordered
floor flag, then the dissolve-path recorder question. Rotation NOT
advanced: the standing directive suspends rotation until a run
demonstrates national reached in sims.

Both arms DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. No [needs-eyes]: neither
arm changes feel, combat, or UI. Merged locally, pending ship. No
push, no version bump, no live verification (the batch ship job owns
deploys).

## Pre-registration (binding, per arm)

- sim-floortime-a: prereg 4a618eb6c, committed BEFORE any judged
  analysis. Primary metric: time-ordered floor count over the 13
  BLOCKED rows of the blockedrestore census (draft day < tbend day
  required). Prediction stated in the prereg: 4, not 5.
- sim-dissolve-a: prereg 2a42d74c3 (rebased hash; worker original
  341cf596), committed BEFORE any judged analysis, AFTER the
  reconciliation read. Path A chosen on reconciliation evidence (see
  below): apply scholarmelt-a's post-end identity-check method to the
  blockedrestore dissolved 120 in the draftflag corpus. Primary
  metric: 120/120 dissolved classified, lingerer-origin lacking
  count stated, fled re-verified.

## Arm 1 — sim-floortime-a (DIAG-GO)

Fixes the blockedrestore analyzer's floorDraftRow flag from
"ever floored in this seed" to "floored before this tbend" (draft
day < tbend day). Re-run on the READ-ONLY draftflag corpus
(evidence/2026-10-30/perseed-draftflag-a/, untouched, no new sweep,
no new sims).

Result: re-judged floor count 4, not 5 — prediction held exactly.
The only BLOCKED row that moves is the s75113 anaconda row (block
d61, floor draft d64, AFTER the block). The four time-ordered floor
rows are exactly the four 1-HP rows (hushwolf, warranty_caller,
callback x2). The 1-HP pattern verdict is UNCHANGED (COMMON BUT NOT
THE RULE, 4/13 BLOCKED rows — it counts blocker hp, not the flag),
and the melt rate and blocker set are identical; only one blocker's
floor alibi moved.

Proof: scripts/test-floortime-a.js FIXTURES-PASS 25/25 (including
the anaconda d61/d64 counterexample fixture), plus
scripts/test-blockedrestore-a.js FIXTURES-PASS 46/46, both re-run
green on the merged master tip. Analyzer determinism
byte-identical (scratch removed). Commits: prereg 4a618eb6c, work
fe1e46f53. Backlog item 1518 (floor flag needs time-ordering) is
FIXED by this arm.

## Arm 2 — sim-dissolve-a (DIAG-GO, Path A)

Reconciliation first, as assigned: scholarmelt-a's 120 dissolved
rows ARE blockedrestore's 120, row for row — same band (seeds
75101–75116), same 180d death-aware horizon, same tableseat-nowait
policy and env; the whole scholarmelt recorder field is
VALUE-IDENTICAL between the two corpora on all 16 seeds; per-seed
dissolved counts agree exactly (75102: 32, 75104: 45, 75105: 43,
all other seeds 0). A new recorder + fresh sweep would have
re-measured a fate that is already recorded, so Path A (apply the
identity-check method) was the correct scope, not a shortcut.
Blockedrestore's "UNMEASURED" label was true for ITS instrument
(tbend events) and is not true for the corpus as a whole.

Judged counts (independent analyzer run on the draftflag corpus,
cross-checked 120/120 against scholarmelt-a, 0 mismatches):

| Fate | Count |
|---|---|
| SCHOLAR-RESTORED (presence at flush) | 75 |
| SPAWN-ENDED (no lift) | 45 |
| DISSOLVED-MELT | 0 |
| UNCLASSIFIED | 0 |

Lingerer-origin sub-population (lift.lingering definition, since
worldOrigin is null on all 120 by construction): 60 rows, 60
SCHOLAR-RESTORED, lacking a restore fate 0. The other 15 restored
rows are non-lingering titan lifts; the 45 spawn-ended rows never
had a lift. Fled: 0 tbend 'fled' events on all 16 seeds, re-verified
— dissolved rows cannot supply fled observations by construction,
so the fled half of lingerer-keeps stays UNOBSERVED (empty
population, not a zero rate). Three restored rows are
identity-true but entry-false (herald moved before flush day) — a
movement artifact, handled by the classifier's restored-first
order, not a second fate.

Proof: scripts/test-dissolve-a.js FIXTURES-PASS 18/18, determinism
byte-identical, scratch removed, corpora untouched. Commits
(rebased onto fe1e46f53 clean, no conflicts, proofs re-run):
prereg 2a42d74c3, work 2fe5c16d5. Backlog item 1519 (dissolved
meetings need a dissolve-path recorder) is RETIRED FOR FATE and
NARROWED TO CAUSE by this arm: what remains unmeasured is which
code path dissolved each fight (no call-site field exists), plus
scholar HP at dissolve time — not fate.

## Wall numbers (this band's own corpus, report-only)

Identical in both arms, recomputed independently and matching
blockedrestore exactly: wins 9/16 (all lesser, full 0), national
ever 13/16, national final 11/16, table reached 12/16, table
entered 9/16, wave reach 16/16/14/9/0, median survival 118d,
deaths 527. No before/after claim: neither arm ran a sweep or
changed game code.

Telemetry deviation check vs the scale-wall baseline: first run
against the full draftflag glob produced 2 LOUD lines (national
12 -> 0, wins 16 -> 0) — INVESTIGATED and EXPLAINED as an ingest
artifact, not a deviation: the glob mixed 33 files (16 census
files carrying no wall fields, 16 fresh rows, summary). Re-run
with --sweep-rows on the 16 fresh rows only: QUIET (16 seed
rows, 4 metrics, no large deviations), wall line
nationalEver=13/16 nationalFinal=11/16 table=12/16 entered=9/16
won=9/16 — matching the arms exactly. Baseline NOT rolled (no
fresh sweep in this run; the corpus is pre-existing).

## Reachability verdict

Unchanged by this run (measurement only): waves 1–4 reachable,
wave 5 unreachable on this band (0/16), the table reachable only
through the lesser seat, the full seat unreached. What this run
changes is the wall's plumbing, not its height: the restore
census's floor corroboration is now time-ordered (4, not 5), and
the dissolved half of lingerer-keeps is no longer a blank —
dissolved lingerers persist, they do not melt. The only
lingerer-keeps half still unobserved is the fled half.

## Village assessment (plain words)

Two small blanks in the siege story are now filled in. First, the
"wounded gatekeeper" story is smaller than it looked: only four
of the thirteen times a beast blocked a loser's return was the
blocker down to a single point of strength — and one of those
four, the little anaconda beast, only became that weak three days
AFTER it did the blocking, so it should never have counted as a
wounded blocker at all. Most of the time the beast in the way is
healthy; the treeline is just crowded. Second, when a fight
against the great herald beast falls apart before it starts, the
beast does not vanish: on two seeds the scholar meets the herald
again and again at the haven's edge and every dissolved fight
leaves it standing there at the same strength until its siege
posting ends; on a third seed the scholar spends six days
starting fights against a herald that isn't there at all, and
those empty fights end with nothing at stake because nothing was
ever there to lose. Nothing dissolved ever melted. The one thing
still unseen is the scholar actually fleeing a siege fight — that
half of the rule has no example on this band, dissolved or
otherwise.

## Metric review

- Both preregs bound their runs and were honored: no metric was
  re-scored mid-run. Floortime's prediction (4, not 5) was stated
  before judged analysis and held exactly; dissolve's Path A
  choice was made on reconciliation evidence before judging, and
  the "0 melts" result is a classification outcome, not a
  definitional dodge — a lifted-and-absent dissolved row WOULD
  have counted as DISSOLVED-MELT, and none exists.
- Prereg-wording notes for the NEXT run (not revisions to these
  verdicts): (a) "restore fate" for dissolved rows must always be
  glossed as presence-at-flush, never left sounding like a tbEnd
  restore — the SCHOLAR-RESTORED name invites the misreading, and
  a future arm may rename the dissolved-restored subflag to
  never-left; (b) the lingerer-origin population for dissolved
  rows must always be defined via lift.lingering, never via
  worldOrigin (null on every dissolved row by construction);
  (c) if a future band produces a same-day floor draft for a
  BLOCKED row, the strict-< flag reports false where the truth
  is unknowable from day-granular data — report it UNMEASURED,
  not false, until the recorder carries intra-day order
  (raid seq vs tbend seq).
- Telemetry lesson: a per-seed glob that mixes census files with
  sweep rows manufactures LOUD lines (0-valued metrics on files
  that never carried them). The check must run on sweep rows
  only (--sweep-rows); the first LOUD pair here was that artifact,
  investigated and explained before any baseline decision.

## Infrastructure notes (disclosed, all repaired)

- safe-commit index-clobber (known class) hit the dissolve prereg
  commit: bogus staged deletion, worktree file intact, commit
  contents verified byte-identical before repair via update-index
  --cacheinfo from the HEAD blob; verified status clean + diff
  HEAD empty before proceeding.
- Container EPERM flap (known class) hit dissolve analyzer writes:
  the pilot write failed twice (0-byte file) before succeeding on
  the third attempt into a worktree scratch dir; determinism
  second run needed retries. No data lost (analyzer is pure and
  re-runnable; final analysis JSON verified by the byte-identical
  determinism diff).
- Coordinator landing: floortime merged first (ff-only onto
  082cfa19e), proofs re-run green on the merged tip (25/25 +
  46/46); dissolve worker rebased onto fe1e46f53 clean (no
  conflicts, proofs re-run) before its ff-only merge; all three
  proof suites green on the final tip (18/18 + 25/25 + 46/46).
  check.js --quick NOT run: zero src/js, zero policy defaults,
  both proofs green post-merge, sibling loops live
  (concurrent-jest rule). Worktrees released as merged, branches
  deleted, main tree clean at closeout.
- Sibling activity during this run (NOT touched): loop B started
  new arms mid-run (sim-axeacq-b, sim-vests-b, sim-rankconv-b
  appeared alongside the pre-existing sim-warmthrestraint-b and
  sim-woodshortline-b trees); journey-landing still active.

## Ranked next (NOT this run's work)

1. DISSOLVE-CAUSE RECORDER (the surviving recorder need, from
   dissolve-a #1): 120 dissolved fights, 0 with a recorded cause.
   The scholarmelt recorder needs a call-site field (which
   dissolve path fired — the known barrier-death dissolve site
   in game.js is a lead to check, NOT a finding) plus scholar HP
   at dissolve time (to settle the within-day HP steps in the
   sense chains), then a fresh sweep on the same substrate. Fate
   is settled; cause is not.
2. FLED-WITH-ORIGIN COVERAGE (from dissolve-a #2, carried from
   blockedrestore): 0 fled tbend events on this band — the fled
   half of lingererKeeps is still unobserved. A band or scenario
   where the scholar flees a lingerer fight would exercise it
   (and test whether a fled restore blocks like a lost restore).
3. BLOCKED-RESTORE DESIGN QUESTION (steve-call, carried from
   blockedrestore via floortime-a #1): a lost lingerer melts
   whenever ANY fellow besieger still stands on the treeline
   tile — 13/24 losses (54%), all 13 blockers raidBorn fellow
   besiegers at (4,4). Should the restore displace/queue when
   the tile is held, or is melt-while-the-siege-continues
   intended? Floortime's correction does not change the
   question: melt rate and blocker set identical, only one
   blocker's floor alibi moved.
4. S75104 PHANTOM-HERALD TRACE (from dissolve-a #4): 45
   spawn-ended dissolved fights against a herald that exists
   nowhere in the census, scholar grinding 100 -> 35 HP across
   six days (d96–d101), seed ending d102. What starts a herald
   fight with no tile monster and no world instance, and what
   wears the scholar down, is a question for the
   dissolve-cause arm's recorder, not answerable from this
   corpus.
5. DISSOLVED-RESTORED RENAMING (nomenclature, no game change,
   from dissolve-a #3): rename the dissolved-restored subflag to
   never-left in analyzer vocabulary, stating the
   presence-at-flush gloss wherever the fate name appears.
6. SIEGE-DRAIN DYNAMICS (carried from blockedrestore #5): census
   of siege lifetimes — how often a multi-beast siege drains
   fully through scholar losses vs outlasting the scholar —
   to say whether the 54% melt rate helps or hurts the village
   over a whole siege.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it). What converged further is the restore
plumbing: floor corroboration is time-ordered, dissolved fates
are fully classified (75 restored / 45 spawn-ended / 0 melts),
and the only lingerer-keeps half still unobserved is the fled
half. Backlog: 1107 ranked-next (3) and (4) now DONE by this run;
next in order is (1) the dissolve-cause recorder, then (2) fled
coverage. Rotation NOT advanced: the standing directive suspends
rotation until a run demonstrates national reached. Claim retired
to .DEAD; lock deleted.
