# sim-midnightkill-b — midnight-spanning kill matching: the fight recorder counts kills logged the next day — GO

- Run: `fleshout-loop-b-20261106T1730Z` (Loop B, second axis, arm 3 of 3),
  axis winnability chain
- Arm: `sim-midnightkill-b`, branch `sim-midnightkill-b`, worktree
  `~/workspace/worktrees/sim-midnightkill-b`
- Band: NONE consumed — deliberate reuse of the two committed corpora
  (`evidence/2026-11-06/perseed-partydamage-b/`, 87001–87008;
  `evidence/2026-11-06/perseed-fightinterior-b/`, 51001–51008).
  No judged re-run.
- Prereg: `evidence/2026-11-06/sim-midnightkill-b-prereg.md` (committed
  `2986cbc46` before any judged re-match; pre-rebase SHA `4afc67047` —
  the branch was rebased onto master `5ba7f167f` after the
  bond-initiation landing, clean, proof re-run green on the rebased tip)
- Instruments: `scripts/fightinterior-instrument-20261106.js` (shared
  classifier ±1-day join + same-beast guard),
  `scripts/partydamage-instrument-20261106.js` ('won' matcher extracted
  as exported `matchWonKill`, ±1-day join + same-beast guard),
  `scripts/partydamage-analyze-20261106.js` (pyrrhic matcher ±1-day join
  + same-beast guard, exported), `scripts/midnightkill-reclassify-20261106.js`
  (read-only re-classification of both corpora),
  `scripts/test-midnightkill-20261106.js` (**61/61 PASS**)
- Verdict: **GO — all four preregged thresholds hold (a)–(d).**
- Findings fixed: the 1630Z B run's blank (5) — the recorder's
  same-day match called a real kill 'rout'.

## The blank this arm fills

The fight recorder's kill matcher joined on STRICT same-day matching:
a fight that starts one day and logs its kill the next day scored 0
matched. Three real cases were known before this run — seed 99241
baseline (15-round wave-4 kill, fight day 72, kill logged day 73),
seed 99723 armed reunion kill (fought day 53, logged day 54), and the
1630Z partydamage run's Nadia kill (fought d117, logged d118), which
made the same-day-matched rate read 4.2% against the judged log-based
8.3%. The proposed fix, twice pre-registered as the next run's work,
is a ±1-day join. This arm implements it, with the same-beast guard
the ±1 window needs, and verifies it on the two committed corpora.

## Before / after (same 32 committed files, re-matched)

| Metric | Before (recorded) | After (re-matched) | Log |
|---|---|---|---|
| Partydamage armed matched kills | 1/24 (4.2%) | **2/24 (8.3%)** | 2 |
| Partydamage baseline matched kills | 3/30 (10.0%) | **3/30 (10.0%)** | 3 |
| Fightinterior baseline matched kills | 2 (recorded) / 3 (pyrrhic) | **3** | 3 |
| Fightinterior staged matched kills | 5 (recorded) / 6 (pyrrhic) | **6** | 6 |
| Fightinterior total matched kills | 7 recorded / 9 pyrrhic | **9** | 9 |
| Unclassified traces | 1 (fightinterior 'routed') | **0** | — |
| Ambiguous matches | — | **0** | — |
| Unreconciled wave-4 log kills | — | **0** | — |

Per-leg endings after re-classification:

| Ending | Partydamage baseline (30) | Partydamage armed (24) | Fightinterior baseline (25) | Fightinterior staged (34) |
|---|---|---|---|---|
| kill | 3 | 2 | 2 | 5 |
| pyrrhic-kill | — | — | 0 | 1 (greta d65 Reunion) |
| kill-unclosed | — | — | 1 (grace d80 Strike) | 0 |
| rout | 1 | 0 | 0 | 1 (51006 d105 Strike, 'routed' → 'rout') |
| scholar-death | 26 | 22 | 21 | 27 |
| scholar-flee | 0 | 0 | 1 | 0 |
| unfinished | 0 | 0 | 0 | 0 |

Exactly ONE trace changes ending on the partydamage corpus (the Nadia
kill, rout → kill); exactly ZERO traces change ending on the
fightinterior corpus beyond the two pyrrhic re-derivations that
sim-pyrrhic-b already established (greta, grace — both same-day
matches, reproduced here unchanged). Every match the new classifier
makes on the fightinterior corpus has day-delta 0 (9 candidates, all
same-day): the ±1 join adds NOTHING there, which is the no-false-match
control holding — matched 9 = log 9, no 10th match.

## The recovered kill (criterion c — verified against its fight trace)

**87004 armed, Nadia Khoury vs Influencer, fight day 117, kill logged
day 118.** The only newly matched kill on either corpus; exactly 1
match candidate (no ambiguity).

- Trace: seq 1, day 117, mid `influencer`, outcome `won`, recorded
  ending `rout`, 9 rounds, entry HP 637, mHpLeft 0, fighters
  `[visjoin_96, nadia_khoury]`.
- Matched entry: killsLive / waveKillLog
  `{"day":118,"mid":"influencer","wave":4,"by":"nadia_khoury","via":"player"}`
  — same beast, same killer, one day later.
- The killing blow is IN the trace: rally round 1, scholar strikes
  rounds 3–8 (65+74+74+74+76+80 = 443 damage), ally visjoin_96 deals
  162 across rounds 2–8, and round 9 the scholar's strike deals 84,
  beast HP 32 → −52. The trace itself proves the kill; only the log's
  day stamp (118) differs from the fight day (117) — the fight
  crossed midnight between round 8 and the killing round, or between
  the killing blow and the log write. The recorder called it 'rout'
  because the matcher asked for a day-117 kill and the book holds a
  day-118 one.

The partydamage baseline 'rout' stays 'rout', correctly: 87008
baseline, seq 7, day 118, Audit, outcome 'routed', mHpLeft 775 (the
beast walked off at full health minus a scratch), fighters
`[visjoin_111, thabo_maseko]`, zero match candidates, zero near log
kills by its fighters on either adjacent day.

## Primary metric (binding — GO thresholds, all hold)

- (a) Partydamage corpus: the matcher recovers the Nadia d117/d118
  kill — matched armed kills 1/24 → 2/24, matching the log-based
  8.3% (2/24). Baseline matched stays 3/30 = log 3/30 (its 'rout'
  stays 'rout'). **PASSED.**
- (b) Fightinterior corpus: matched total 9 = log total 9 (the
  pyrrhic-corrected count: baseline 3, staged 6). No 10th match.
  **PASSED.**
- (c) ZERO false matches — the one newly matched kill is verified
  above against its fight trace (same beast, same killer, killing
  blow in the trace, fight spanning midnight); every wave-4 log
  entry on both corpora is claimed by exactly one matched trace
  (unreconciled 0, double-claimed 0). **PASSED.**
- (d) Unclassified 0, ambiguous 0 across both corpora after
  re-classification. **PASSED.**

No metric was swapped, re-cut, or re-thresholded. The corpora were
NOT re-run. The partydamage NO-GO verdict (armed 8.3% < 10%) is
UNCHANGED by this fix — 2/24 is still below the bar; this arm
corrects the instrument, not the verdict.

## The fix (scripts only, zero src/js)

- `scripts/fightinterior-instrument-20261106.js` — the shared pure
  classifier: the 'won' branch joins killsLive on fight day ± 1
  (was strict same-day), and `matchLogKills` (pyrrhic/unclosed)
  joins the log on ± 1 (was strict same-day + `tr.mid` only). Both
  now require the same-beast guard (`sameBeast`: the kill's `mid`
  must be one of the trace's `mids`, falling back to `tr.mid`, and
  to the old day+fighter+wave check only when the trace carries no
  monster id at all — no corpus trace is in that case). The 'won'
  join is exposed as `matchWonKills` (list, for ambiguity counting)
  / `matchWonKill` (first match), and `classifyEnding` uses it — so
  the re-classification runs the SAME logic as the live close path,
  not a copy. The live during-fight log snapshot (`_logLenAtOpen`)
  is unchanged.
- `scripts/partydamage-instrument-20261106.js` — the 'won' matcher
  in `closeTrace` is now the exported pure function `matchWonKill`
  (±1 day + mid + fighter + wave ≥ 4, accepting both `{day, wave}`
  and `{d, w}` entry shapes), used by the live close path and by
  the reclassifier. No pyrrhic port: the partydamage instrument's
  'lost'/'unfinished' handling is unchanged (out of scope — see
  metric review); the reclassifier's log reconciliation is the guard
  that no pyrrhic shape hides on the partydamage band.
- `scripts/partydamage-analyze-20261106.js` — the 'unfinished'
  pyrrhic matcher joins the log on ±1 day + mid + fighter (was
  same-day, no mid check), exported as `matchPyrrhicKill` /
  `matchPyrrhicKills` so the reclassifier uses the SAME logic. Note:
  unlike the fightinterior classifier's 'unfinished' branch this
  matcher carries no mHpLeft === 0 guard — the analyzer never had
  one, and adding it is a separate change (see metric review).
- `scripts/midnightkill-reclassify-20261106.js` (new, read-only) —
  applies the new matcher to both committed corpora and prints
  per-leg before/after matched kills vs the log, the recovered kills
  with verification, unclassified and ambiguous counts, log
  reconciliation, and the GO verdict object. It writes nothing into
  either corpus. Ambiguity is counted two ways: a trace matching
  more than one distinct kill entry, and one log kill claimed by
  more than one trace — both 0.
- `scripts/test-pyrrhic-20261106.js` — one fixture updated, because
  the design changed on purpose: `pyrrhic-wrong-day-no-match` used
  a day+1 log entry as its "wrong day"; under the ±1 join day+1 IS
  a match, so the fixture now uses day+2 (and the old day+1 case
  moved to the midnightkill proof as a positive fixture). No other
  existing proof needed a change.

## Wall numbers

Restated from the corpora's own evidence files (these corpora are
already judged; restate, do not re-judge):
- Partydamage (87001–87008): wins 0/8 both legs, national 0/8,
  table 0/8, wave-4 unlocks 6/8, wave-4 faced 6/8 baseline / 5/8
  armed, wave-5 unlocks 1/8 baseline (87006, standing 305) / 0/8
  armed, wave-5 faced 1/8 / 0/8, readiness-5-ready days 4 baseline /
  0 armed, living wave-4 killers at end 0/8 both, median survival
  92.5d baseline / 84.5d armed. Field wave-4 fights 13 both legs,
  0 kills both.
- Fightinterior (51001–51008): wins 0/8 both legs, national 0/8,
  table 0/8, wave-4 unlocks 5/8, wave-4 faced 5/8 both, wave-5
  unlocks 0/8, wave-5 faced 0/8, readiness-5-ready days 0 baseline /
  1 staged, median survival 85.5d baseline / 105d staged.

The fix changes no village's fate — the kills already happened; only
the recorder sees them now. The corrected armed kill rate (8.3%) is
still below the partydamage GO bar (10%), so the funnel numbers do
not move and the partydamage verdict stands.

## Village assessment (plain words)

Eight villages on each of two bands, none won, none opened the fifth
wave's door except once on a baseline leg. The one thing this run
changes is a single line in the book: on one seed, Nadia Khoury
fought an Influencer for nine rounds beside a friend, rallied her
line, struck every round from the third to the ninth, and put the
beast down with an 84-damage blow that left it at −52 — and the
record said the beast walked away, because the book stamped the kill
a day late. It did not walk away. It died, and now the record says
so. Nothing else in either village's story changes: the same
scholars still die in the same fights, the same beasts still stand
at half health, the same road to the full seat is still blocked in
the fight itself.

## Sense-test read

None — no transcript is re-read; the fix touches no narration. (The
Nadia d117/118 kill day was already sense-read in
sim-partydamage-b.md: the kill passed silently while the System
celebrated a different, wave-3 kill — the "veteran kill"
announcement firing for wave-3 kills while a real wave-4 kill
passes without a beat. That mismatch is a backlog item, not this
arm's.)

## Metric review

- **The ±1 window is symmetric by pre-registration, and the −1 side
  can never be a true match.** A kill is logged after the fight
  starts, so a kill entry dated the day BEFORE the fight day cannot
  be this fight's kill. The symmetric window is what the prereg
  specified and what the GO was judged against, and it produced
  zero false matches and zero ambiguity on both corpora — but the
  −1 side is a standing false-match risk for future bands: a 'won'
  rout trace (beast fled, mHpLeft > 0) could match a same-type kill
  by the same fighter from the day before. The next recorder arm
  should consider narrowing the window to [0, +1] AND requiring
  mHpLeft === 0 on the 'won' branch (the guard the 'unfinished'
  branch already has) — both are one-line changes, both need their
  own prereg, and neither was in this arm's. The symmetric behavior
  is pinned by a proof fixture
  (`won-day-minus-one-matches-symmetric-window`) so the narrowing,
  when it comes, is a deliberate change, not a silent one.
- **The +1 side has the same rout shape, unguarded.** A 'won' rout
  trace could also match a same-type kill by the same fighter from
  the day AFTER (grind days fight the same type repeatedly). The
  mid guard does not save it (same type); only mHpLeft === 0 does.
  On these corpora it did not bite (the one baseline rout has no
  adjacent kill by its fighters at all). Same prescription as
  above: mHpLeft === 0 on 'won', next arm.
- **The partydamage instrument still has no pyrrhic branch.**
  Deliberately not ported here (out of scope — this arm is the ±1
  join). The reclassifier's log reconciliation is the guard, and it
  holds on this band (unreconciled 0). A future arm that ports the
  classifier should re-run this reclassification as its regression.
  Related: the partydamage analyzer's pyrrhic matcher still carries
  no mHpLeft === 0 guard (the fightinterior classifier has one);
  there are no 'unfinished' traces on the partydamage band, so it
  does not bite here — same future-arm note.
- **The 99241 / 99723 midnight kills are NOT verified here.** Their
  corpora (staypolicy-a + tbretreat-b) are not re-matched; the fix
  is in the shared lineage, so a later arm re-matching those
  corpora should recover them — report the recovered counts against
  this prereg's method, do not re-derive it.
- **No metric was swapped.** The analyzer re-run on the old corpus
  (armed tbKillMatched 1/24) is the expected old-endings read, not
  a competing number — the GO is the re-classification, stated in
  the prereg. The fightinterior 'before' counts in the table above
  (2/5 recorded) vs the pyrrhic-corrected 9 are the same distinction.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: no Game-root change exists (zero
  src/js) and no policy changes — there is nothing to compare
  before/after. No compare `.md` is fabricated. The matched-corpus
  re-classification (identical 32 files, before/after matcher) IS
  the comparison; its output is attached below.
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-06/perseed-partydamage-b/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs." Recorded as the result, same as
  every prior killer-chain arm. No telemetry deviation check was
  possible on this corpus; the wall numbers above are the
  instrument's own. The WINSEAT baseline regime note was checked
  first: no pre-seat comparison is claimed anywhere here.

## Re-classification output (attached)

- `/tmp/midnightkill-reclassify.json` (working copy; the tables above
  are the record): GO ALL true — a_armed_1_to_2, a_baseline_3_stays,
  b_fightinterior_9_eq_9, c_no_false, d_unclassified_0,
  d_ambiguous_0. Partydamage recovered: exactly one (87004 armed,
  seq 1, d117 Influencer → kill, matched entry d118, 1 candidate).
  Fightinterior recovered: the two known pyrrhic kills (51002
  baseline d80 Strike → kill-unclosed, 51005 staged d65 Reunion →
  pyrrhic-kill, both same-day, 1 candidate each).
- Cross-check: `scripts/pyrrhic-reclassify-20261106.js` re-run over
  the fightinterior corpus with the new classifier imports the ±1
  logic and returns IDENTICAL numbers (9/9, 0 unclassified,
  0 ambiguous, GO ALL true) — the pyrrhic arm's own tool agrees the
  ±1 join changes nothing there.

## What this arm does NOT claim

- Not a lever: no policy was built, no pilot was spent, no
  gate/price/deed change is proposed. No village lives longer or
  kills more because of this fix — the kills already happened;
  only the recorder sees them now.
- Not an overturning of the partydamage NO-GO: armed 2/24 = 8.3%
  is still below the 10% bar. The instrument is corrected; the
  verdict stands.
- Not a recovery of the 99241 / 99723 kills: those corpora are not
  re-matched here.
- Not a claim that the partydamage instrument now classifies
  pyrrhic kills: that port is explicitly out of scope. The
  reclassifier's log reconciliation is the guard, and any
  unreconciled log kill would have been reported as a finding, not
  absorbed.
- Not a live midnight-spanning kill observed end-to-end: live legs
  prove the instruments still run clean; the midnight behavior is
  proven by fixtures + the committed corpus re-match.
- Not a claim that the ±1 window is the final shape: the symmetric
  window and the missing mHpLeft guard on 'won' are documented
  above as the next recorder arm's work, with the fixture pinning
  the current behavior.

## Proof and commits

- Proof `scripts/test-midnightkill-20261106.js`: **61/61 PASS** —
  ±1 fixtures for every matcher (midnight +1 matches, same-day
  still matches, day+2 / wrong-beast / wrong-killer no-match,
  two-candidate counting, second-monster-in-mids, sameBeast
  fallbacks, pyrrhic/unclosed midnight + mHpLeft guard), the
  corpus re-classification asserted against (a)–(d) (including
  the Nadia killing blow in the trace and the fightinterior
  all-deltas-zero check), and live legs to /tmp (55002, 90d:
  fightinterior + partydamage instruments install, wave-4 traces
  present, all classified, 0 instrument errors, no internal fields
  leaked).
- Regressions re-run green on the final tree:
  `scripts/test-fightinterior-20261106.js` **33/33**,
  `scripts/test-partydamage-20261106.js` **49/49**,
  `scripts/test-pyrrhic-20261106.js` **52/52**. Two fixture fixes
  were needed along the way, both test bugs the mid guard exposed,
  not matcher bugs: the partydamage pyrrhic fixture and the pyrrhic
  grace/grind/guard fixtures overrode `mid` without `mids`, so the
  trace's own fields contradicted each other (mid 'the_eater' /
  'strike' against mids ['the_congregation'] / ['reunion']) — the
  old matcher never checked mid, so the inconsistency was invisible.
  Both fixtures now carry consistent `mids`, and the pyrrhic
  `wrong-day` fixture moved from day+1 to day+2 because day+1 is a
  match under the ±1 join by design.
- Prereg committed `2986cbc46` (pre-rebase `4afc67047`) before any
  judged re-match. Code committed `f7eba5e33` (pre-rebase `712e468e7`).
  The safe-commit index clobber hit on the prereg commit and the code
  commit (files shown staged-as-deleted after correct commits);
  repaired with HEAD-blob cacheinfo each time, verified `git status`
  empty + `git diff HEAD` empty + hash-object matches. Master moved
  under the run (8a975ad45 → 5ba7f167f, bond-initiation landing, 15
  commits, zero file overlap with this arm); the branch was rebased
  onto the explicit new SHA `5ba7f167f`, clean, and the proof was
  re-run green on the rebased tip (61/61, GO ALL true) before this
  evidence was committed.
- Judged corpora: unchanged — no file under
  `evidence/2026-11-06/perseed-partydamage-b/` or
  `evidence/2026-11-06/perseed-fightinterior-b/` was modified.
  The reclassifier is read-only.

## Convergence

**scale-onramp / winnability chain: converging, NOT converged.**
The kill matcher now counts what the log holds: matched 2/24 armed
on the partydamage band (was 1/24 by same-day matching) and 9 = 9
on the fightinterior band, with zero false matches and zero
ambiguity on either. The funnel numbers themselves do not move —
the kills were already in the book — but no future arm will
re-litigate whether a midnight-spanning kill counts, and the next
lever's sizing (party damage, survival time, abilities in
villagers' hands) now counts the kills it used to miss. The open
items are the window's final shape ([0, +1] + mHpLeft on 'won')
and the pyrrhic port into the partydamage instrument — both named
above, neither blocking the next lever.
