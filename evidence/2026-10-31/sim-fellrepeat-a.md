# sim-fellrepeat-a — fell-repeat census: base code never repeats a refused fell

Run: oversight-flesh-out-loop, Loop A run fleshout-20261031T0643Z,
arm sim-fellrepeat-a, axis food-economy, backlog #1590
(REFUSED FELL LINE REPEATS 3x PER MORNING, from Loop B arm
sim-strandfix-combined-b, evidence/2026-10-30/
sim-strandfix-combined-b.md §4). Worktree sim-fellrepeat-a.
DIAG ONLY: measurement, zero src/js changes, zero
policy-default flips, zero edits to any existing policy
file or existing script. New files only: prereg, driver +
analyzer + proof, this evidence file, corpora, table.
Sibling trees never touched; main tree never touched.
Nothing is merged by this worker (the coordinator merges);
report status: committed on branch, pending coordinator
merge, no ship (no game change under branch (b)).

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-fellrepeat-a-prereg.md (commit
7f6fa40bff5d28d60f229c19fc9395b6630ae238). Pinned game
base 3c03d468b (the prereg commit's parent; the prereg
adds only itself, so all legs run on pinned-base
game/policy code verbatim). GO iff a complete
per-morning refusal-count table covers every strand
morning in the 15215 window on control legs, with
narration verbatim. Verdict branches: (a) base repeats
>= 2x in any morning -> contained canFell pre-check
fix with proof test and [needs-eyes]; (b) base never
repeats -> close #1590 as a prototype artifact with
the recorded design rule (pre-check canFell before ANY
re-attempt in future prototypes) and land no game
change. Either branch is a complete arm.

## Canon

docs/CANON.md read. No canon doc covers the
fell-refusal line itself: docs/ABILITY-REFUSALS.md
covers ability-action refusals, not the cutTree
tool-gate refusal — stated here instead of inventing
canon. The standing rule that bears on it is CANON.md's
"no silent actions — every action narrates honestly,
including failures," plus the sense-testing law (a
person stops after the first refusal).

## Prior evidence read in full before designing anything

sim-strandfix-combined-b.md (the 3x finding),
sim-lackingline-a.md (strand census method),
sim-strandfix-morning-b.md (strand mornings, tool
gate). Backlog #1590 text confirmed in
hidden_files/sim-findings.md line 1590.

## Instruments (new, this arm)

- scripts/fellrepeat-trace-a.js: kcalshort substrate
  verbatim (POLICY=nighttravel, COMPETENT_FEAST=0,
  SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  WOODCARRY=1, WOODWARM=0 guard / 1 ON, DAYS=30, NO
  prototype policy) with ONE read-only addition in
  kind: per-loop-day fellRefusalCount /
  fellSuccessCount / fellRefusalLines counted over the
  day's full transcript (refusal = "can't fell" or
  "need an axe to fell", case-insensitive, once per
  line; success = "comes down with a crack"), plus
  fullDaySay stored on strand-morning rows (previous
  evening still creek), creek rows, loop-days 10/12/14,
  and any refusal row; morning snaps add read-only
  cutInfo('bigtree') (canFell/tier/toolName).
- scripts/analyze-fellrepeat-a.js (pure reads: strand
  extraction, per-morning table, band summary).
- scripts/test-fellrepeat-a.js (proof; see Proof).

"Morning" partition, as preregistered: the harness
captures one transcript per loop-day (one daily()
call); no finer morning timestamp exists. The
per-loop-day count UPPER-BOUNDS the per-morning
count: a day count of 0 proves a morning count of 0.
"Per villager": the transcript is the bearer's day;
non-bearer villagers have no day transcript in this
driver (same coverage limit as the prior strand arms)
— the table is per loop-day for the bearer, stated as
such, never claimed as a multi-villager census.

## Verdict: GO, branch (b) — prototype artifact, no game change

| bar | result |
|-----|--------|
| Strand re-derived on THIS base, both control legs | PASS — guard 7-9, ON 7-16, exactly the lackingline/combined strand (zero drift on this pin) |
| Table covers every strand morning + days 10/12/14, both legs, transcripts stored | PASS — guard mornings 8-10, ON mornings 8-17, all transcripts stored, all counts 0 |
| Narration verbatim | PASS — refusal lines column is "none" on every row because the count is 0; the verbatim line is quoted from the instrument-validation leg (§3), not invented |
| Determinism re-run byte-identical | PASS — 15215 ON re-run byte-identical |
| Proof suite green | PASS — scripts/test-fellrepeat-a.js 30/30 |
| Band spot-check trigger | NOT TRIGGERED — pilot found zero refusals on every day of both legs, so per the prereg (and the task brief) the 9-seed band was NOT run; the evidence says so, it does not imply a band ran |

Branch (b) fired: base never repeats — stronger, base
never refuses at all (count 0 on all 60 loop-days
across both legs, and fell successes also 0: base
never attempts a fell in these sims). #1590 is closed
as a prototype artifact by this arm's verdict (the
backlog line itself is the coordinator's to mark —
see §7); the design rule is recorded in §6. NO game
change is landed, deliberately: there is no base
behavior to fix.

## 1. THE STRAND SET ON THIS BASE (re-derived, not inherited)

| leg | 15215 still evenings | strand | days alive / end |
|-----|----------------------|--------|------------------|
| guard (control) | 3 | nights 7-9 | 30 / survived |
| ON (control) | 10 | nights 7-16 | 30 / survived |

Zero drift from lackingline-a / combined-b. (Note on
counts: the "creek 18 / rescued 8" figures in prior
arms are bank-wide totals across all 10 seeds; this
arm's pilot ran seed 15215 only, so its per-seed
figures are guard creek 4 = still 3 + rescued 1
(bridge built day 10), ON creek 10 = still 10 with
the day-17 return via completed travel, no
bridge-rescue row. Same strand, different aggregation
— stated so the numbers are not miscompared.)

## 2. THE PER-MORNING TABLE (the GO input — control legs)

Refusal lines verbatim on every row: none (count 0).
Morning tool on every row except ON day 17: whittle
tier, Stone knife, canFell false, canPrune false.
Morning wood tracks the warmth spend (ON: 4, 4, 3, 3,
2, 1, 0, 0, 0, 0 across days 8-17).

### Guard leg: mornings 8-10

| morning | strand morning | refusals | successes | morning wood | transcript |
|---------|---------------|----------|-----------|--------------|------------|
| day 8 | yes (after still 7) | 0 | 0 | 4 | stored |
| day 9 | yes (after still 8) | 0 | 0 | 4 | stored |
| day 10 | yes (after still 9) | 0 | 0 | 4 | stored |
| day 12 | no (named day) | 0 | 0 | 4 | stored |
| day 14 | no (named day) | 0 | 0 | 4 | stored |

### ON leg: mornings 8-17

| morning | strand morning | refusals | successes | morning wood | transcript |
|---------|---------------|----------|-----------|--------------|------------|
| day 8 | yes (after still 7) | 0 | 0 | 4 | stored |
| day 9 | yes (after still 8) | 0 | 0 | 4 | stored |
| day 10 | yes (after still 9) | 0 | 0 | 3 | stored |
| day 11 | yes (after still 10) | 0 | 0 | 3 | stored |
| day 12 | yes (after still 11) | 0 | 0 | 2 | stored |
| day 13 | yes (after still 12) | 0 | 0 | 1 | stored |
| day 14 | yes (after still 13) | 0 | 0 | 0 | stored |
| day 15 | yes (after still 14) | 0 | 0 | 0 | stored |
| day 16 | yes (after still 15) | 0 | 0 | 0 | stored |
| day 17 | yes (after still 16) | 0 | 0 | 0 | stored |

Days 10/12/14 — combined-b's fell mornings — are 0
on both legs, including on the ON leg where the
prototype printed the line 3x each. Whole-window
totals, both legs, all 30 loop-days each: refusals 0,
successes 0, max per day 0, days >= 1: none, days
>= 2: none, store errs 0.

Why zero is a finding and not a missing instrument:
in node sims, base policy code never calls cutTree.
The only cutTree callers are the UI button (app.js,
excluded from node) and prototype policies (woodday,
strandfix-*, which this arm deliberately does not
run). A base villager on a strand morning forages,
travels, and eats — it never raises a knife at a tree,
so there is nothing for the engine to refuse, once or
three times. The repetition cannot be base behavior,
because the attempt itself is not base behavior.

## 3. INSTRUMENT VALIDATION (the same counter on the known-positive corpus)

The counting rule was run, read-only, over Loop B's
MORN-ON corpus (evidence/2026-10-30/
sim-strandfix-combined-b-corpus-morn-on, seed 15215
transcripts, never modified, never judged):

| loop-day | refusal count | verbatim line |
|----------|---------------|---------------|
| 10 | 3 | Your Stone knife can't fell a giant — it takes branches, not trunks. You need an axe. |
| 12 | 3 | Your Stone knife can't fell a giant — it takes branches, not trunks. You need an axe. |
| 14 | 3 | Your Stone knife can't fell a giant — it takes branches, not trunks. You need an axe. |

The counter reproduces combined-b's 3/3/3 exactly
on the prototype corpus and 0/0/0 on the control
legs. The instrument is not deaf; the base is
silent. The 3x repetition is therefore purely the
prototype's re-attempt loop (attempt -> refused ->
tree still adjacent -> wood still short -> attempt
again, until the tick reserve bites), exactly as
combined-b §4 described it.

## 4. SENSE-TEST (law — read, judged for meaning)

Control ON day 12 (a combined-b fell morning, now
without any prototype): the villager travels to
wetland, takes unknown shoots ("A shot in the dark —
you take what's green"), travels to the creek, and is
refused the bridge honestly ("the pack holds 2 logs,
and a bridge needs 4"). No tree is approached, no
refusal spoken, no repetition — the day reads as a
person foraging and coming up short on wood, not as
a person arguing with a tree. Control ON day 10 and
14 read the same way (patch work, an ability gained
on day 14, the honest bridge refusal). PASS on
mechanism and on texture: there is no nagging to
fix, because base never starts the argument. The
texture failure combined-b found belongs to the
prototype loop alone, and it dies with the prototype.

## 5. VILLAGE ASSESSMENT (plain words)

The same banked village the strand arms have always
seen: one scholar sleeping out by the creek while the
village at home is not poor, its fires eating the
bridge logs night by night (ON mornings: 4 logs
dwindling to 0 by day 14). What this arm adds is a
negative result with a clean edge: on the mornings
when a prototype walked this villager to a big tree
and watched it refused three times, the villager
left to itself does something entirely different —
it forages, it travels, it never touches a tree.
The "person would stop after the first refusal"
critique is correct about people and inapplicable to
base code, because base code never makes the first
attempt. The blank #1590 named was real narration
(texture), but its home was the prototype, not the
game — and fixing it in the game would mean adding a
guard to a path nothing in the game walks.

## 6. DESIGN RULE (recorded for future prototypes — branch (b)'s deliverable)

Pre-check canFell before ANY re-attempt in future
prototypes: any policy loop that calls cutTree more
than once (or that retries a wood verb after a
no-change result) must call Game.cutInfo(cell) first
and stop on canFell false — one refusal line, then
stop, never a re-attempt burst. The rule is cheap
(it is a read-only call the UI already uses to hide
impossible buttons) and it covers the general class,
not just felling: a verb that returns no-change for
a tool reason must not be retried blind. This rule,
not a game-code change, is what closes #1590.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Creek/bridge content
reached on both legs (guard bridge built day 10;
ON strand 7-16, return day 17). Wave reach on 15215:
wave 1 both legs (guard 5 wave-1 kills, ON 6);
waves 2-5 not reached in this 30-day window (same
window as the prior strand arms; 15215's control wave
reach is 1 here, as on the lackingline control legs).

## Wall numbers

NOT OBSERVABLE as reachability on 30-day evening legs
(pre-seat, no field) — reported, never claimed.
Observed on both legs, 15215 alive at day 30:
national 0, table 0, wins 0 (structurally unreachable
in this band, not a wall measurement); median
survival 30 days (ceiling — single seed, survived
the window).

## Proof

scripts/test-fellrepeat-a.js: 30/30 checks pass,
including: counting unit cases (3x giant fixture,
this-variant, tier-none variant, both-patterns-once,
success-not-refusal, case-insensitivity, unrelated
wood lines, empty transcript); strand-extraction
unit cases; morning-table named-day coverage;
corpus checks on both judged legs (every row carries
fell counts; refusal lines match counts and patterns;
strand mornings have transcripts; store errs 0;
15215 tables cover days 10/12/14 and every strand
morning); determinism 15215 ON byte-identical;
tracked-diff guard: src/ and scripts/policies/
between pinned game base 3c03d468b and the final
tree are EMPTY — the driver, analyzer, and proof are
measurement only (new files, not edits).

## Metric review

- The per-loop-day count as an upper bound for the
  per-morning count behaved as preregistered: with
  every day count at 0, no line-order read was needed
  and no morning partition ambiguity arises. A future
  run that finds a day count >= 2 must still do the
  line-order read the prereg requires (adjacent burst
  vs scattered attempts are different texture bugs).
- The band spot-check's conditional trigger (only on
  repetition or any strand-morning refusal) behaved
  correctly by not firing: running 9 more seeds to
  re-confirm zeros would have spent compute proving
  what the mechanism already explains (base never
  calls cutTree in node sims). If a future base ever
  gains a routine fell verb, the band must become
  unconditional — the trigger's premise (no base fell
  attempts) would no longer hold.
- The per-seed vs bank-wide creek/rescued aggregation
  note in §1 is a reporting refinement for the next
  strand prereg: state the aggregation (per-seed vs
  bank-wide) alongside any creek/still/rescued triple,
  or the same strand will keep producing
  different-looking triples.
- No metric revision is proposed for the GO bar
  itself: completeness over the re-derived set plus
  verbatim lines separated the branches cleanly (0
  everywhere -> branch (b) with no judgment call).
- §15 panel: not applicable, as declared in the
  prereg — zero game-root changes, so there is no
  before/after game delta for scripts/balance-panel.js
  to compare. The before/after here is control legs
  vs the prototype corpus on the counting rule, and
  it is never labeled a panel comparison.

## 7. OUT-OF-SCOPE FINDINGS (NOT chased; for the coordinator's backlog)

- [close as prototype artifact] 2026-10-31 —
  food-economy/narration — #1590 REFUSED FELL LINE
  REPEATS 3x (this arm): base control legs on seed
  15215 print the refusal 0 times on every strand
  morning (guard 8-10, ON 8-17) and 0 times on all 60
  loop-days, while the same counter reproduces 3/3/3
  on combined-b's MORN-ON days 10/12/14. The
  repetition is purely the prototype's re-attempt
  loop. Design rule recorded in §6: pre-check canFell
  before ANY re-attempt in future prototypes. No game
  change landed. (evidence: this file; judged
  corpora + MORN-ON validation read.)
- [open] 2026-10-31 — food-economy/tool-gate — TOOL
  TIER DROPS WHITTLE -> NONE ACROSS THE STRAND (this
  arm): ON morning cutInfo reads whittle / Stone knife
  on days 8-16, then tier "none" / "bare hands" on the
  day-17 return morning, with no recorded loss event
  in this corpus — the mirror image of morning-b's
  unrecorded axe arrival (days 15-17). A future arm
  that judges tool gates must record cutInfo /
  inventory per morning, or both arrivals and losses
  stay gaps. (evidence: this file §2; judged ON
  corpus morning snaps.)

## Instrument notes (disclosed)

- safe-commit index clobber (known class): after the
  prereg commit, the worktree's main index showed the
  committed prereg file as a staged deletion while
  the file itself was present. Repaired with
  `git update-index --add --cacheinfo` from the HEAD
  blob (hash verified equal to the worktree file);
  `git status` after repair showed a clean tree, and
  `git show --stat HEAD` confirms the commit holds
  exactly the prereg file. The same check will be run
  after the final commit.
- The MORN-ON validation read (§3) touches only Loop
  B's already-committed corpus files in this worktree
  (read-only node scan, no writes, no branch or
  worktree state changed by it).

## Files

- Prereg: evidence/2026-10-31/sim-fellrepeat-a-prereg.md
  (commit 7f6fa40bff5d28d60f229c19fc9395b6630ae238;
  pinned game base 3c03d468b)
- Evidence (this file): evidence/2026-10-31/sim-fellrepeat-a.md
- Driver: scripts/fellrepeat-trace-a.js; analyzer:
  scripts/analyze-fellrepeat-a.js; proof:
  scripts/test-fellrepeat-a.js (30/30)
- Judged control corpora: evidence/2026-10-31/
  sim-fellrepeat-a-corpus-guard, -corpus-on (15215
  only; pilot files ARE the judged files per the
  prereg's stage-2 rule)
- Per-morning table: evidence/2026-10-31/
  sim-fellrepeat-a-table.json
- Determinism: evidence/2026-10-31/
  sim-fellrepeat-a-corpus-determinism (15215 ON
  re-run, byte-identical to the judged ON 15215 file)
