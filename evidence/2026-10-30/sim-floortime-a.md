# sim-floortime-a — time-ordered floor corroboration (DIAG-GO)

**Verdict: DIAG-GO** (every GO bar met; the prediction held
exactly — the re-judged time-ordered floor count is 4, not
5 — and the 1-HP pattern verdict is unchanged).
Run: flesh-out loop, run fleshout-20261030T1122Z, worker
sim-floortime-a, axis scale-onramp (blocking axis, converging,
NOT converged). DIAG ONLY — no game changes, no default flip,
no gate move, no deed-bar move. No [needs-eyes]: this arm
changes no feel, combat, or UI — it only time-orders one
analyzer corroboration field over an already-recorded corpus.
Committed on branch, pending coordinator merge. No push, no
version bump, no live verification (the batch ship job owns
deploys).

Prereg: `evidence/2026-10-30/sim-floortime-a-prereg.md`
(committed 4a618eb6c, BEFORE any judged analysis).
Corpus (read-only, untouched):
`evidence/2026-10-30/perseed-draftflag-a/` (the draftflag
corpus — this arm ran NO new sweep and NO new sims).
Re-judged analysis:
`evidence/2026-10-30/sim-floortime-a-analysis.json` (the
blockedrestore analysis JSON was NOT overwritten).
Analyzer: `scripts/analyze-blockedrestore-a.js` (fixed, pure:
reads corpus JSON, never touches game state, never writes
into the corpus). Fixtures: `scripts/test-floortime-a.js`
(new) + `scripts/test-blockedrestore-a.js` (kept green).

## What was asked

Ranked-next #3 from the 1107Z run; backlog item BLOCKEDRESTORE
FLOOR FLAG NEEDS TIME-ORDERING. The blockedrestore analyzer's
`floorDraftRow` flag meant "this blocker uid has ANY draft row
in this seed ending at hpAfter == 1" — ever floored in the
seed, not floored before this tbend. The s75113 anaconda
counterexample proved the over-count: blocker hp 7 at its d61
block, floor draft row dated d64, after the block. This arm
fixes only that field: a draft row counts iff same blocker
uid, hpAfter == 1, AND raid day strictly before the tbend
day. Same-day drafts do not count (the corpus records days,
not intra-day order).

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — 4a618eb6c before any re-judged count |
| Prediction | time-ordered floor count 4, not 5 | PASS — exactly 4 (see below) |
| Fix scope | analyzer diff only in floor-corroboration computation | PASS — one computation replaced (Set → per-uid day lists + strict-< test) plus one diagnostic list field on BLOCKED rows (`floorDraftDays`, the sorted floor-draft days behind the flag); no classification, census, pattern, anchor, reconciliation, or wall-number code touched |
| Fixtures | blockedrestore 46/46 kept + floortime green with anaconda RED/GREEN, positive, same-day fixtures + re-judged counts | PASS — FIXTURES-PASS 46/46 and 25/25 (see fixture list) |
| Corpus byte-unchanged | no file under perseed-draftflag-a/ written | PASS — `git status` clean on the corpus dir at every commit |
| Determinism | analyzer run twice, byte-identical, scratch removed | PASS — DETERMINISM-PASS (main analysis vs two scratch runs, all byte-identical); worktree scratch dir removed; floortime test's own full-corpus determinism leg also green |
| Pattern verdict re-checked | must remain COMMON BUT NOT THE RULE on blocker hp | PASS — n = 13, k = 4, 4/13 = 30.8%, unchanged |
| Census stability | BLOCKED 13, lost 11/13/0/0, tbend 102, anchor exact | PASS — all unchanged (see below) |
| Sense | anaconda chain + one time-ordered floor chain read end to end | PASS — see sense notes |

**Formal verdict is DIAG-GO.** No bar was re-scored: the
prediction (4) was stated in the prereg and the re-judged
count matched it exactly.

## The fix, exactly

Before (pre-fix code, preserved in the floortime test as the
RED rule): a `Set` of uids with any hpAfter == 1 draft row;
`floorDraftRow = set.has(blockerUid)`. After: per-uid lists
of floor-draft raid days; `floorDraftRow = any day <
tbend day`. BLOCKED rows additionally carry `floorDraftDays`
(sorted), so the evidence can show its work per row instead
of asserting a boolean. Nothing else in the analyzer moved:
`git diff` on scripts/analyze-blockedrestore-a.js is the
floor computation only.

## Re-judged floor count (the judged number)

| Measure | Ever-floored (old) | Time-ordered (new) |
|---|---|---|
| BLOCKED rows with floorDraftRow true | 5 | **4** |
| …of which blocker hp == 1 | 4 | 4 |
| …of which blocker hp > 1 | 1 (anaconda, hp 7) | 0 |

All 13 BLOCKED rows, with their time-ordered flags:

| Seed | Day | Blocker (hp) | Floor flag | Floor-draft days |
|---|---|---|---|---|
| 75102 | 84 | influencer (850) | false | — |
| 75105 | 126 | hushwolf (1) | true | 99, 122 |
| 75110 | 81 | eater (712) | false | — |
| 75110 | 81 | strike (750) | false | — |
| 75113 | 61 | anaconda_empress (7) | **false** | 64 (after the block) |
| 75113 | 113 | redactor (130) | false | — |
| 75113 | 128 | spool (181) | false | — |
| 75113 | 137 | eulogy (658) | false | — |
| 75113 | 150 | chorus_line (142) | false | — |
| 75114 | 159 | algorithm (750) | false | — |
| 75116 | 111 | warranty_caller (1) | true | 100, 108 |
| 75116 | 159 | callback (1) | true | 158 |
| 75116 | 162 | callback (1) | true | 158 |

The single row that moves is the anaconda row, exactly as
predicted. The four time-ordered floor rows are exactly the
four 1-HP rows: after time-ordering, floor corroboration and
the 1-HP class coincide on this census (4 = 4), which they
did not under the ever-floored flag (5 ≠ 4). That coincidence
is a property of this corpus, not a rule — a healthy blocker
floored before its block would break it on another band, and
the flag still means "floored before the block", not "hp 1".

## Pattern verdict: unaffected (confirmed, not assumed)

The 1-HP pattern verdict counts blocker hp, never the floor
flag, so the fix cannot move it by construction — and it
did not move in fact: n = 13, k = 4 (blockers at hp 1),
4/13 = 30.8%, between the rarity bar (<= 25%) and the rule
bar (> 50%). **COMMON BUT NOT THE RULE, unchanged from
blockedrestore.** The blockedrestore sentence "all four 1-HP
rows are floor-corroborated" is now true under the corrected
flag as well (all four carry a pre-block floor draft); the
sentence that needed the correction was the ever-floored
count of 5, which this arm replaces with 4.

## Census stability (the fix touched nothing else)

- Tbend total 102; lost 24 (RESTORED 11, BLOCKED 13,
  BY-DESIGN 0, UNMEASURED 0); won 66 by-design, routed 12
  by-design, fled 0; dissolved 120 counted UNMEASURED;
  lost meetings 71, linked lost 24/24.
- Anchor exact: s75116 d159, origin suburb uid 29 hp 960,
  blocked by callback uid 33 hp 1 at (4,4).
- Reconciliation MATCH 16/16; valid seeds 16/16.
- Blocker breakdown otherwise identical: waves 1/2/3/4 =
  2/1/5/5; all 13 blockers at (4,4); 11 lingering, 13
  raidBorn; 12 distinct blockers, callback twice.

## Fixtures (what the 25 floortime checks prove)

- RED pre-fix: the old ever-floored rule returns true for
  the anaconda fixture (d64 draft vs d61 block) and for a
  same-day draft — the bug, reproduced, not asserted.
- GREEN post-fix: the fixed analyzer returns false for
  both (d64-after and same-day), true for a d158 draft
  vs a d159 block, true for a before+after pair (d50
  corroborates despite a d70 later draft), false for a
  non-1 hpAfter draft.
- Real corpus: BLOCKED 13, hp1 4, pattern
  COMMON-BUT-NOT-THE-RULE, time-ordered floor count 4,
  hp1 floor-corroborated 4, census stability, anchor
  exact, real anaconda row (flag false, days [64]),
  real anchor row (flag true), reconciliation MATCH,
  valid 16/16, wall numbers (below).
- Determinism: full-corpus analyzer run twice into
  worktree scratch dirs, byte-identical, scratch removed.
- Kept green: scripts/test-blockedrestore-a.js 46/46
  (its synthetic floor fixture uses a d10 draft vs a d50
  block, already time-ordered, so it passes under both
  rules — it never caught this bug, which is why the
  floortime fixtures exist).

## Wall numbers (this band's corpus, report-only)

Verified against the corpus by the re-run (identical to
blockedrestore, as the substrate is untouched — never a
before/after): wins 9/16, all lesser, full 0; national ever
13/16, national final 11/16; table reached 12/16, table
entered 9/16; wave reach 16/16/14/9/0; median survival
118d; deaths 527. Telemetry vs the scale-wall baseline is
the coordinator's step (this worker reports the numbers,
not the baseline roll).

## Reachability verdict

Unchanged by this arm (measurement only): waves 1-4
reachable, wave 5 unreachable on this band (0/16), the
table reachable only through the lesser seat, the full
seat unreached. What this arm changes is one instrument
reading, not the wall: the floor signature behind the
1-HP blocker class is now time-ordered, so the claim
"the 1-HP blockers are the wall floor's signature" rests
on drafts that actually precede the blocks.

## Village assessment (plain words)

Nothing about the village changed — only how we count one
of its footprints. The story stands as blockedrestore told
it: when the scholar loses against a siege beast, the loser
usually melts because another besieger is already standing
on the treeline patch, and only sometimes is that besieger
a beast the wall's toll left at a single point of strength.
What this fix corrects is one beast's alibi: the great
snake that blocked the scholar's loss on day 61 was not
yet a one-point beast at all. It was a healthy seven-point
linger on the treeline that day, and only became a
one-point wanderer three days later, after it had left the
siege and been drafted again out roaming. Counting that
later wound as proof of its state at the block would have
been reading the ending back into the middle of the story.
With the dates put in order, the four genuine one-point
blockers — the little hushwolf, the warranty-caller, and
the callback twice over — are exactly the four beasts the
wall had already ground down before they blocked anyone,
and the snake is what it always was at the block: one more
healthy besieger in a crowded treeline.

## Sense notes (chains read end to end)

- SENSE-PASS on the anaconda chain + the callback
  time-ordered chain. Node-sim stubs Game.say to no-op,
  so there is no say transcript; sense evidence is the
  structured trace (tbend events, draft events, census
  trajectories), stated as such.
- Anaconda chain, re-read (s75113, uid 28): drafted d56
  (90 → 67, moved onto (4,4) lingering). Census shows it
  at (4,4) lingering at 7 HP on d58–d62 — a legitimate
  7-HP lingerer at block time, not a cripple. Tbend d61
  (seq 12): scholar loses paparazzo (uid 27, 1 HP),
  blocked by anaconda uid 28 at 7 HP, (4,4). Census d63:
  still (4,4) at 7 HP but lingering already cleared.
  Raid d64: re-drafted while roaming (7 → 1, draft tile
  (5,3) → (5,5), lingering false throughout); census
  d64 puts it off the treeline at (5,2) and d65 onward
  at (5,5) at 1 HP, wandering the wild for the rest of
  the run (still 1 HP at d149). The d64 floor draft is
  real — it is simply later than the block, so it cannot
  explain the block. The corrected flag says exactly that.
- Callback time-ordered chain (s75116, uid 33): drafted
  d151 (260 → 35), re-drafted d158 (35 → 1, onto (4,4)).
  Tbend d159 (seq 27): suburb loss blocked by callback at
  1 HP — a floor draft one day before the block, the
  clean positive case. The same callback blocks again
  d162 (eulogy loss), still on its d158 floor draft.
  No later draft is needed to explain either block.
- The other two time-ordered floor rows cohere the same
  way: hushwolf floor drafts d99/d122 precede its d126
  block; warranty_caller drafts d100/d108 precede its
  d111 block. Every surviving floor corroboration
  precedes its block by at least one day; the one that
  did not is the one that moved.

## Metric review

- The prereg bound the run and was honored: no metric was
  re-scored mid-run. The prediction (4) was written
  before any re-judged count, and the count matched it;
  had it not, the verdict would have been DIAG-NO-GO
  with the miss reported, not a revised prediction.
- One prereg-wording note for the NEXT run (not a
  revision to this run's verdict): the prereg's fix-scope
  bar said "ONLY the floor-corroboration computation".
  The shipped diff adds, besides the computation itself,
  the `floorDraftDays` diagnostic list on BLOCKED rows.
  That list is the flag's own audit trail (the days
  behind the boolean), not a new census, pattern, or
  wall-number behavior — but a stricter reading of
  "only" would have excluded it. Future preregs for
  instrument fixes should name diagnostic fields
  explicitly as in-scope or out.
- The strict-< rule (same-day drafts do not count) is a
  judgment, not a measurement: the corpus records days,
  not intra-day order, so a same-day draft cannot be
  proven to precede its block. A same-day draft that in
  fact preceded the block would be a false negative
  under this rule. No same-day floor draft occurs among
  the 13 real BLOCKED rows, so the choice does not move
  this census either way — but on a band where one does,
  the rule would need the intra-day order the corpus
  does not carry, and the flag should be reported as
  UNMEASURED for that row rather than silently false.
- Instrument lesson carried forward: the blockedrestore
  test suite's synthetic floor fixture (d10 draft vs d50
  block) passed under both the old and new rules, so it
  could never have caught this bug. Time-ordering bugs
  need adversarial fixtures — a later draft, a same-day
  draft — not just a positive case. The floortime
  fixtures are that adversarial set.

## Infrastructure notes (disclosed, all repaired)

- Safe-commit index-clobber variant (known class from
  the repo's AGENTS.md lessons) hit the prereg commit
  (1 file): bogus staged deletion, worktree file intact,
  commit contents verified byte-identical to the worktree
  file before repair; repaired via update-index
  --cacheinfo from the HEAD blob and verified `git status`
  clean + `git diff HEAD` empty before proceeding. The
  commit itself is correct; only the main index lied.
  The fix+fixtures+evidence commit below was checked the
  same way after committing (see the commit report).
- Corpus untouched: no file under
  evidence/2026-10-30/perseed-draftflag-a/ was written by
  this arm (analyzer output goes to the floortime analysis
  JSON beside it; determinism scratch went to a worktree
  scratch dir and was removed). `git status` clean on
  the corpus dir at every commit.
- No jest was run by this arm (analyzer + tests are plain
  node scripts over committed JSON); the --cacheDirectory
  rule is vacuous here, recorded as such in the prereg
  rather than claimed. Node-harness rules are likewise
  vacuous for this analyzer-only arm, stated in the
  prereg rather than claimed.

## RANKED NEXT (with numbers — no lever built here)

1. BLOCKED-RESTORE DESIGN QUESTION (steve-call if
   pursued, carried from blockedrestore): a lost lingerer
   melts whenever ANY fellow besieger still stands on
   the treeline tile — 13/24 losses (54%), all 13
   blockers raidBorn fellow besiegers at (4,4). Should
   the restore displace/queue when the tile is held, or
   is melt-while-the-siege-continues intended? This
   arm's correction does not change the question: the
   melt rate and the blocker set are identical; only
   one blocker's floor alibi moved.
2. SAME-DAY FLOOR ORDER (instrument gap, named in metric
   review): if a future band produces a same-day floor
   draft for a BLOCKED row, the strict-< flag reports
   false where the truth is unknowable from day-granular
   data. The recorder would need intra-day order (raid
   seq vs tbend seq on the same day) before such a row
   is judged; until then, report it UNMEASURED, not false.
3. DISSOLVE-PATH RECORDER (carried): 120 dissolved
   meetings, all on three seeds (75102: 32, 75104: 45,
   75105: 43), zero on the other thirteen — still
   UNMEASURED for the blocked question by construction.
4. FLED-WITH-ORIGIN COVERAGE (carried): 0 fled tbend
   events on this band — the fled half of lingererKeeps
   is unobserved.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0,
wave 5 0 on this band, as on every band this cycle. No
axis is converged. No gate number was moved on this
evidence, per the 2026-10-29 gate-sequencing note (prove
behavior normal before tuning gates to it). What
converged further is one instrument reading: the floor
corroboration behind the 1-HP blocker class is now
time-ordered (4, not 5), the pattern verdict stands
unchanged (COMMON BUT NOT THE RULE, 4/13), and the
blockedrestore census is otherwise byte-stable — the
plumbing measurement this cycle relies on is one
over-count cleaner than it was.
