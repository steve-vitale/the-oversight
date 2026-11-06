# sim-awaynaming-rereg-a — re-registration of the killed awaynaming fix under a corrected prereg

Run fleshout-20261105T2215Z, Loop A. Arm: sim-awaynaming-rereg-a (BUILD).
Prereg: `evidence/2026-11-05/sim-awaynaming-rereg-a-prereg.md`
(committed BEFORE any judged sim, including the before-panel).
Compare: `evidence/2026-11-05/awaynaming-rereg-compare.md` (+ `.json`).
Pilot compare: `evidence/2026-11-05/awaynaming-rereg-compare-pilot.md` (+ `.json`).
Panel compare: `evidence/2026-11-05/awaynaming-rereg-panel-compare.md` (+ `.json`).

## Verdict: GO (prereg-bound)

Judged strictly against the re-registered prereg. The re-registration
is the 2115Z metric review's proposed revision, applied before any
judged sim: guardrail (i) judges silencing by the ledger
(said_after == kicked, exact, per kind per seed) and the
non-stranded sleep burst rate is a descriptive phase-shift report
only — no band, not a GO/NO-GO check. Under the OLD prereg this
same fix and this same corpus would read NO-GO on the retired
±3pp sleep-rate band (7.9% vs 11.6%, Δ −3.68pp); under THIS prereg
it is GO on every check. No metric was changed mid-run.

| Check | Result |
| --- | --- |
| Primary — stranded sleep burst events, after | **0 in 17 windows** (before: 0 in 17). PASS |
| Primary — stranded settle lines, after | **0** (before: 0). PASS |
| Guardrail (i) — NO SILENCING, ledger-based (re-registered) | said_after == kicked exact, per kind, all 31 seeds. **0 lines silenced. PASS** |
| Guardrail (ii-a) — ledger conservation | said + stillHeld == kicked, per kind, all 31 seeds. **0 lines lost. PASS** |
| Guardrail (ii-b) — held-volume accounting (queue-snapshot method) | lost == 0 on all **16 away stretches. PASS** |
| Guardrail (ii-c) — reconciliation | exact on all 31 seeds, all kinds. PASS |
| Guardrail (iii-b) — trajectory identity | **31/31 identical** (daysAlive, endReason, stranded nights, sleep windows). PASS |
| Guardrail (iii-a) — det-gate ON vs OFF | identical on fixed code (17021, 15003). PASS (proof test) |
| Rebase survival — proof + compare on rebased tip (2026-11-06 adoption) | compare GO byte-identical; proof 39/39 after re-pinning the 17021 survival anchor to the r143 substrate fact (see "Adoption + rebase verification"). PASS |

The fix works, and the meter now measures what it claims to
measure. The relay's measured loss on the before leg — 4 word +
4 debate lines dropped (17010: 3+3; 17020: 1+1), 0 settle — is
fully recovered on the after leg: said_after − said_before =
+4 word / +4 debate / +0 settle, exactly the relay's dropped
counts. Totals said: after **707 word / 707 debate / 689 settle**
vs before **703 / 703 / 689**. The after leg says MORE lines than
the before leg. Nothing was silenced; 65 lines moved out of the
sleep phase into the daily phase, which is the designed behavior
— and exactly what the retired guardrail (i) penalized. See
"Phase-shift report" and "Metric review".

## What was built

The killed gossipfix gate, re-applied twice before and killed
twice on prereg technicalities, re-applied a third time by
cherry-pick — not re-invented. Fix commit `ee787f220`
("[needs-eyes] sim-awaynaming-cap-a: gate naming-burst + settle
delivery on being at Haven, UNCAPPED queue", from abandoned
branch tip `8c5bcf095`, base `2d72f104a`) cherry-picked onto this
branch (based on current master `555f59160`) as `3b639aa2d`:
**applied cleanly, zero conflicts, and the three files are
byte-identical to ee787f220** (`git diff ee787f220 3b639aa2d --`
on the three paths: 0 lines). At adoption the branch was rebased
onto master `a7dfc4a45` (journey-endgame r143) — the fix commit is
now `d6c3553db`, patch content still identical to ee787f220
(modulo blob indices / hunk offsets), rebase clean with zero
conflicts. `holdNamingNews` (no cap — just
push), `sayNamingNews` (playerAtHaven gate),
`deliverHeldNamingNews` (framing line + held lines verbatim,
queue spliced empty, called from `returnToVillage`). Three
call-site swaps: monsterNewsCheck word, seedMonsterNames debate,
monsterNamingCheck settle. The r141 haven-news relay keeps
killer-tale prose and the endDay witness line only. [needs-eyes]
stays in the fix commit message (narration/feel change).

## Adoption + rebase verification (2026-11-06, adoption worker)

The 2215Z coordinator died before this evidence file was written.
The adoption worker (run fleshout-20261106T0028Z) found the file
UNCOMMITTED in the worktree — 486 lines, mtime 2026-11-06
00:02:20 UTC, ~29 minutes before the adoption start (00:31 UTC),
so not a live-worker signal (nothing written within 15 minutes of
start). The file was finished in place, not discarded, and every
claim in it was independently re-verified before this commit:

- **Fix commit verbatim**: `git show ee787f220` vs `git show
  3b639aa2d` (pre-rebase tip) — patches identical except the
  commit-hash line (same author, date, message, 3 files,
  332 insertions / 19 deletions). The cherry-pick is verbatim;
  after the rebase the fix commit is `d6c3553db` with identical
  patch content (see "Rebase" below).
- **Compare reproduced**: `node
  scripts/awaynaming-compare-rereg-a.js --before
  .../sim-awaynaming-rereg-a-baseline --after
  .../sim-awaynaming-rereg-a-corpus` on the committed corpora
  (31 + 31 files) — exit 0, verdict GO, output **byte-identical**
  to the committed `awaynaming-rereg-compare.md` + `.json`
  (diff: no differences). No difference to explain.
- **Proof tests reproduced (pre-rebase tip)**:
  `scripts/test-awaynaming-cap-a.js` **39/39 green** with the
  prereg env (incl. det-gate ON-vs-OFF identical on 17021 +
  15003; without the env the integration leg skips and the unit
  leg alone reports green); `scripts/test-gossip-position-r141.js`
  **34/34 green**.
- **Panel compare read**: decision **review_required**, every
  paired metric delta exactly 0 (see "Balanced panel (§15)").
  Coverage-driven, not a signal.
- **Rebase**: branch rebased onto local master `a7dfc4a45`
  (journey-endgame r143) — clean, 7/7 commits, zero conflicts.
  (The task brief named master tip 4c7bf78cc; actual local master
  at adoption start was a7dfc4a45. A further `git rebase
  origin/master` was a no-op: origin/master `1a898136` is the last
  SHIPPED version-bump commit and already an ancestor of local
  master, which sits 64 unshipped commits ahead of it — the branch
  is based on local master a7dfc4a45, not on the bump.) Fix-commit
  patch content after rebase is identical to ee787f220 (ignoring
  blob indices / hunk offsets).
- **Compare on the rebased tip**: re-run, exit 0, GO,
  **byte-identical** to the committed compare outputs. The GO
  verdict survives the rebase.
- **Proof test on the rebased tip — ONE finding**: 38/39. The
  failing check is the 17021 survival anchor ("runs 60 days,
  survived"): on the rebased master 17021 now runs **52 days,
  village-lost**. Attribution by control: the same anchor run on
  a scratch master worktree WITHOUT the fix (branch driver,
  master's game.js, 0 awayNaming occurrences) gives the
  identical **52 days, village-lost** — and 15003 unchanged
  (60/survived, day-7 word inside Haven). The pin moved UNDER
  the fix, not because of it: journey-endgame r143 (Fix C
  help-branch fallback — helpers fight instead of waiting; Fix B
  narrated waits; gorge fix) moved the substrate. The gate's own
  checks are untouched: det-gate ON-vs-OFF identical on the
  rebased tip, 0 stranded nights, 0 stranded sleep windows.
  Per the prereg's anchor rule ("verify on current master, do
  NOT trust the old pin; the proof test pins whatever the before
  leg shows"), the anchor was re-pinned in
  `scripts/test-awaynaming-cap-a.js` (test-only change, fix
  commit untouched) to the current-substrate fact — 52 days,
  village-lost — with the control run cited in the comment.
  Proof re-run after the re-pin is recorded under
  "check.js --quick (fixed tree)" below — it ran after the
  check.js sweep finished, never concurrently with it.
- **Quoted lines re-verified against the after corpus**: the
  draft's quote sets were right, but the delivery ORDER was wrong
  on two stretches — it had grouped settles at the end. Checked
  against `analysis.allBursts`/`allSettles` (transcript idx
  order) on the return day: on 17010 the "Big-Eyes" settle lands
  7th, immediately after the "Judge Hoot" debate (not 9th, after
  the "Big Beast" pair); on 15221 the "Big Big" settle lands 3rd,
  right after the opening Nicole pair (not last). 17016 and 17020
  matched exactly. The evidence file's quote blocks and the sense
  discussion are corrected to the true delivery order; the sense
  verdict is unchanged (the interleave is, if anything, tighter
  than the draft described).
- **Canon re-read**: docs/CANON.md + the prereg's canon note —
  no canon doc covers naming-news position-gating; the design
  lives in the cited evidence files, and CANON.md's "If you don't
  know, it doesn't show" supports holding unheard haven talk.

## Before / after legs

- Before: FRESH 31-seed baseline on current master, pre-fix code,
  env COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
  STRANDNARR=1, horizon 60 loop-days, driver
  `scripts/gossipcensus-trace-a.js` (verbatim + disclosed
  observational additions: queue snapshots, naming ledger).
  **The fresh before leg reproduces the cap-a before leg exactly,
  headline-for-headline**: 17 stranded sleep windows, 0 stranded
  events, 1767 non-stranded sleep windows, 205 sleep events
  (11.6%), every per-seed row identical (days, end, stranded
  nights, non-stranded sleep events). The substrate has not moved
  under this arm since the cap-a before leg — the only master
  commits since its base are policy-only (bankkiller-b).
- After: same 31 seeds, same env, fixed code. Pilot 8 seeds judged
  first (GO, `4313eae28` after the adoption rebase, `06e4a8c33`
  before it: primary 0 in 5 windows; (i) ledger PASS;
  sleep rate 7.7% vs 10.6% descriptive; 4 stretches, lost 0),
  then the confirm 23 seeds (17001–17024 except 17021) in one run,
  23/23 files written, exit 0, ~10.3 min. Corpus:
  `evidence/2026-11-05/sim-awaynaming-rereg-a-corpus/` (31 files).
- Band freshness: NOT fresh — reuse by design (before/after on
  identical seeds per §15); the gossipcensus corpus is stale on
  current master, so the before leg was re-run fresh. No fresh band
  claimed.
- Anchors re-verified from the FRESH before leg (not trusted from
  the old pins): 17021 runs 60 days, survived, 0 stranded nights;
  15003 loop-day-7 sleep window still has its Word line (idx 777,
  position (4,7) haven, inside true). No anchor-pin updates were
  needed in the cherry-picked proof test.

## Per-seed table (after leg; b = before, a = after)

| seed | days | end | stranded nights | b stranded sleep w/e | a stranded sleep w/e | b stranded settle | a stranded settle | b non-stranded sleep w/e | a non-stranded sleep w/e | traj same |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15003 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/4 | 60/3 | yes |
| 15009 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes |
| 15091 | 56 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 56/8 | 56/6 | yes |
| 15211 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/2 | yes |
| 15215 | 54 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 54/5 | 54/4 | yes |
| 15220 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/6 | yes |
| 15221 | 48 | village-lost | 5 | 5/0 | 5/0 | 0 | 0 | 42/5 | 42/1 | yes |
| 17001 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes |
| 17002 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/5 | yes |
| 17003 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/10 | 60/6 | yes |
| 17004 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/6 | 60/3 | yes |
| 17005 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/3 | yes |
| 17006 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/8 | yes |
| 17007 | 60 | survived | 3 | 3/0 | 3/0 | 0 | 0 | 57/9 | 57/7 | yes |
| 17008 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/1 | yes |
| 17009 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/4 | yes |
| 17010 | 60 | survived | 4 | 4/0 | 4/0 | 0 | 0 | 56/6 | 56/2 | yes |
| 17011 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/6 | 60/4 | yes |
| 17012 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/5 | yes |
| 17013 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/9 | 60/8 | yes |
| 17014 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/4 | yes |
| 17015 | 31 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 31/4 | 31/3 | yes |
| 17016 | 60 | survived | 2 | 2/0 | 2/0 | 0 | 0 | 58/4 | 58/1 | yes |
| 17017 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/4 | yes |
| 17018 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/5 | yes |
| 17019 | 36 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 36/3 | 36/2 | yes |
| 17020 | 60 | survived | 3 | 3/0 | 3/0 | 0 | 0 | 57/6 | 57/5 | yes |
| 17021 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/9 | 60/6 | yes |
| 17022 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/4 | yes |
| 17023 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/14 | 60/9 | yes |
| 17024 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/5 | yes |

Totals: stranded sleep windows 17, events 0/0 both legs; stranded
settles 0/0. Non-stranded sleep: before 205/1767 (11.6%), after
140/1767 (7.9%). Stranded nights by seed: 15221: 5, 17007: 3,
17010: 4, 17016: 2, 17020: 3; all others 0. No stranded-pos
violations (0 lines in a stranded window classified away — there
were no lines in stranded windows at all on either leg).

## Ledger conservation (ii-a) — the judge

Per seed per kind: kicked (ledger) / said-before / said-after /
still-held-before / still-held-after / relay-dropped / my-lost.
Full 31-row table is in `awaynaming-rereg-compare.md`; the summary:

- Kicked totals: word 707, debate 707, settle 689.
- Said after: 707 / 707 / 689 — every kicked line said, every seed.
- Said before: 703 / 703 / 689. Still-held before: 0/0/0 on all
  seeds (the relay queue always drained by end of run).
- Relay dropped: 4 word + 4 debate, 0 settle — seed 17010: 3+3;
  seed 17020: 1+1; all other seeds 0. My-gate lost: **0/0/0**.
- Recovery rows: 17010 word 32/29/32/0/0/3/0, debate 32/29/32/0/0/3/0,
  settle 32/32/32/0/0/0/0; 17020 word 30/29/30/0/0/1/0, debate
  30/29/30/0/0/1/0, settle 29/29/29/0/0/0/0.
- Reconciliation (ii-c) exact on all 31 seeds, all kinds:
  said_after − said_before == relayDropped + stillHeld_before
  − stillHeld_after.

## Held-volume accounting per away stretch (ii-b, queue-snapshot method)

16 stretches, all returned (no terminal stretch). held = after-leg
awayNaming queue depth at the last evening of the stretch + any
mid-stretch drops; delivered = held (full drain at the return,
unit-proven); lost = 0 everywhere. morningR/eveningR = queue depth
at the return day's morning/evening snapshots — the drain evidence.
posHeld = superseded position-method diagnostic (expected ~0 on the
relay substrate); dhExcess = superseded DH-excess diagnostic
(expected to undercount — and on 17010 it overcounts, 13 vs 12 held,
because the before leg's flush dropped 6 lines the after leg says).

| seed | stretch days | return day | held (q) | delivered (q) | lost | qMax | qEnd | mid-stretch drops | morningR | eveningR | drain evidenced | posHeld w/d/s | dhExcess w/d/s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15003 | 55 | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 15009 | 57 | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 15220 | 53 | 54 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 15221 | 32,33,34,35,36 | 37 | 7 | 7 | 0 | 7 | 7 | 0 | 7 | 0 | yes | 0/0/0 | 1/1/0 |
| 17007 | 5,6,7 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 17007 | 39,40 | 41 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 17009 | 51 | 52 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 17010 | 9,10,11,12 | 13 | 12 | 12 | 0 | 12 | 12 | 0 | 13 | 0 | yes | 0/0/0 | 4/4/5 |
| 17014 | 34 | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/1 |
| 17016 | 11,12 | 13 | 4 | 4 | 0 | 4 | 4 | 0 | 7 | 0 | yes | 0/0/0 | 3/3/1 |
| 17016 | 58 | 59 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 17020 | 7,8,9 | 10 | 2 | 2 | 0 | 2 | 2 | 0 | 4 | 0 | yes | 0/0/0 | 1/1/2 |
| 17020 | 52 | 53 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 17023 | 47 | 48 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |
| 17024 | 36 | 37 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 2/2/0 | 0/0/0 |
| 17024 | 46 | 47 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 |

Notes:
- Most "stretches" (evenings away, inside !== true) held nothing:
  the scholar was out for the evening but no naming news was kicked
  while away. Only 4 stretches held lines: 15221 (7), 17010 (12),
  17016 (4), 17020 (2) — 25 lines held in total, all delivered.
- held(q) is a lower bound on the volume kicked during the away
  period: lines kicked on the return-day morning, before the return
  step, are delivered at the same return but not counted in qEnd.
  morningR is the "delivered at this return" count: 17010 delivered
  13 (not 12), 17016 delivered 7 (not 4), 17020 delivered 4 (not 2).
  The biggest single-day catch-up is therefore **13 lines**
  (17010, return day 13). Lost is 0 either way; the ledger is exact.
- 17024 posHeld 2/2/0: the position diagnostic's hardcoded haven
  tiles (4,4)/(4,7) do not hold on all seeds — on 17024 the haven
  extends to tile (5,2), where the scholar stood with access
  'remote', inside false, while the relay (tile-type check) said 2
  word + 2 debate lines immediately and correctly. The diagnostic
  is superseded; the queue snapshots + ledger are the authority.
  No verdict impact.

## Delivered lines, quoted (sense-testing)

The framing line, said once per return that finds a non-empty queue
(`deliverHeldNamingNews`, game.js):

> "While you were away, the haven argued over what to call it — they catch you up at the fire:"

Then the held lines, verbatim, in the order they were held. The
four held stretches, with stranded days and return day (extracted
from this run's own after corpus — identical wording to the cap-a
run's quotes, as the fix and the substrate are the same):

### 17010 — stranded days 9–12, return day 13 (13 lines, the wall)

All 13 in daily phase on day 13 (12 held at stretch end + 1 kicked
on the return morning while still away; queue 12 → 13 → 0):

> Word gets around the haven. Whatever that thing was — the haven's talking about nothing else.
> Back at the haven the argument starts: Layla is calling it "The Loud Beast." Nobody agrees yet — weigh in if you want.
> Word gets around the haven. Whatever that thing was — every fire has a theory tonight.
> Back at the haven the argument starts: Layla is calling it "The Ugly Beast." The name's up for grabs — weigh in if you want.
> Word gets around the haven. Whatever that thing was — everyone's talking about it now.
> Back at the haven the argument starts: Layla is calling it "Judge Hoot." They'll fight it out — weigh in if you want.
> It's settled. The village is calling it "Big-Eyes." The Codex keeps it.
> Word gets around the haven. Whatever that thing was — the haven's talking about nothing else.
> Back at the haven the argument starts: Layla is calling it "The Big Beast." Nobody agrees yet — weigh in if you want.
> It's settled. The village is calling it "Ugly-Eyes." The Codex keeps it.
> It's settled. The village is calling it "Judge Hoot." The Codex keeps it.
> It's settled. The village is calling it "Old Ugly." The Codex keeps it.
> It's settled. The village is calling it "The Loud Beast." The Codex keeps it.

For comparison, the before leg on the same day said only 8 lines,
all in sleep phase (the relay flush): 1 word + 1 debate + 6 settles.
Three word/debate pairs never reached the scholar at all on the
before leg — dropped by the relay's flush filter because the beasts
already had villageNames by flush time. The after leg recovers all
six. (A 6th settle, "The Big Beast", was said in sleep phase on
both legs — a natural settle kicked that night at Haven, not part
of the held delivery.)

### 15221 — stranded days 32–36, return day 37 (7 held lines)

9 daily-phase lines on day 37, of which 7 are the delivered held
lines (queue 7 → 0 at the return) and 2 are natural daily lines
kicked at Haven after the return. The 9 daily lines, in
transcript order (the held block is the last 7; the settle for
"Big Big" lands third, right after the opening pair — the queue's
kick order, not grouped by kind):

> Word gets around the haven. Whatever that thing was — the haven's talking about nothing else.
> Back at the haven the argument starts: Nicole is calling it "Loud-Eyes." Nobody agrees yet — weigh in if you want.
> It's settled. The village is calling it "Big Big." The Codex keeps it.
> Word gets around the haven. Whatever that thing was — every fire has a theory tonight.
> Back at the haven the argument starts: Colleen is calling it "The Big Beast." The name's up for grabs — weigh in if you want.
> Word gets around the haven. Whatever that thing was — everyone's talking about it now.
> Back at the haven the argument starts: Colleen is calling it "Loud-Eyes." They'll fight it out — weigh in if you want.
> Word gets around the haven. Whatever that thing was — the haven's talking about nothing else.
> Back at the haven the argument starts: Colleen is calling it "Big Ugly." Nobody agrees yet — weigh in if you want.

### 17016 — stranded days 11–12, return day 13 (7 lines delivered)

Queue 4 at stretch end, 7 by the return morning; all 7 delivered
in daily phase on day 13:

> Word gets around the haven. Whatever that thing was — the haven's talking about nothing else.
> Back at the haven the argument starts: Helga is calling it "Mister Never." Nobody agrees yet — weigh in if you want.
> Word gets around the haven. Whatever that thing was — every fire has a theory tonight.
> Back at the haven the argument starts: Helga is calling it "The Loud Stare." The name's up for grabs — weigh in if you want.
> Word gets around the haven. Whatever that thing was — everyone's talking about it now.
> Back at the haven the argument starts: Helga is calling it "The Loud Stare." They'll fight it out — weigh in if you want.
> It's settled. The village is calling it "Big Loud." The Codex keeps it.

### 17020 — stranded days 7–9, return day 10 (4 lines delivered)

Queue 2 at stretch end, 4 by the return morning; all 4 in daily
phase on day 10:

> Word gets around the haven. Whatever that thing was — the haven's talking about nothing else.
> Back at the haven the argument starts: Barbara is calling it "The Loud Beast." Nobody agrees yet — weigh in if you want.
> It's settled. The village is calling it "The Loud Beast." The Codex keeps it.
> It's settled. The village is calling it "Big Big." The Codex keeps it.

## Sense verdict on the delivered wording

The catch-up reads true. The framing line does the work: it tells
the player these are things that happened while they were gone, and
then the held lines arrive as one fireside catch-up. Each line is a
distinct beast's news, the word lines vary across their templates,
the debates name real proposers (Layla, Nicole, Colleen, Helga,
Barbara) and real proposed names, and the settles close the loop.

The wall: 17010 delivers **13 lines in one daily phase**. Thirteen
lines is a lot for one day of play — but it is one coherent scene,
not spam: the scholar was away four nights, six beasts were being
named in the meantime, and the haven tells the whole story at once.
The smaller deliveries (7, 7, 4 lines) read as ordinary catch-up
and are unremarkable in the best way.

One wrinkle, honest and small: on 17010 the queue's kick order
interleaves kinds — the "Big-Eyes" settle lands immediately after
the "Judge Hoot" debate, before the "Big Beast" word/debate pair,
so a settle for one beast interrupts the debate sequence for
another; and the debate and the settle for the same beast land
close together — "Layla is calling it 'Judge Hoot.' … They'll
fight it out" followed, a few lines later, by "It's settled. The
village is calling it 'Judge Hoot.'" That is the queue's order
(held in kick order: word, debate, then the settle when the naming
completed while away). It reads as the haven telling the whole arc
at once — argued, then settled — which is true to what happened,
just compressed. Nothing here is incoherent,
out of tense, or wrong. Splitting a large catch-up across the
return evening and the next morning would soften the wall, but
that is a design call for Steve, not a defect: the price of
conservation is the wall, and the alternative (the relay) silently
dropped 6 of these 13 lines. **Sense verdict: reads true; the
13-line wall is the honest price of losing nothing.**

## Phase-shift report (descriptive only — the retired band, reported not judged)

Counts computed from this run's own corpora (before vs after,
identical seeds):

- Totals said: before 703 word / 703 debate / 689 settle (grand
  2095); after 707 / 707 / 689 (grand 2103). The after leg says
  MORE lines in total (+4/+4/+0 = exactly the relay's recovered
  drops).
- Phase split, word/debate: sleep 205 → 140 (−65), daily 10 → 99
  (+89), harness 488 → 468 (−20). Settle: sleep 553 → 544 (−9),
  daily 0 → 9 (+9), harness 136 → 136.
- Non-stranded sleep burst rate: before 11.6% (205/1767), after
  7.9% (140/1767), Δ −3.68pp. Under the retired ±3pp band this
  would be the same 0.68pp miss as the cap-a run — and it means
  the same thing it meant then: the before-leg rate is the natural
  rate PLUS 65 relay-flushed lines; the after-leg rate is the
  natural rate alone. The deliveries did not get quieter; they
  moved phase (sleep→daily on return, plus harness→daily where the
  before leg's flush landed in harness phase). The ledger, not
  this rate, is the silencing judge — and it passes exactly.

## Balanced panel (§15)

Before-panel (pre-fix, 8 cases, 0 cached) vs after-panel (fixed,
8 cases, 0 cached), seeds 17021,15003,15009,15091,15211,15215,
15220,15221, policy capable, 60 days. Compare decision:
**review_required** (exit 2, as expected — exit 2 unless
no_material_signal). Every paired metric delta is exactly 0
(Table win rate 0→0, national 0→0, survival, deaths, food,
hydration, HP, gear, abilities — all 0). The review_required is
coverage-driven (several metrics insufficient/not_observed at 8
cases), not a signal — same shape as cap-a's and gossipfix's
panels. The panel is the instrument, not the judge; trajectory
identity (iii-b) is the gameplay-neutrality judge and it passes
31/31.

## check.js --quick (fixed tree, rebased tip)

Adoption re-run (2026-11-06, on the rebased tip, log
`/tmp/check-quick-rereg-a.log`): **277 passed / 13 failed in
1714s**. The dead worker's first run on the pre-rebase tip was
273 passed / 17 failed in 1839s; the cap-a run reported 284/6 in
479s. The count moves run to run with machine load (a sibling
loop's check.js was running concurrently during this re-run).

The 13 failures, characterized — none implicates the fix:

- **5 × 120s TIMEOUT** (check.js per-script timeout, exit null,
  all at exactly 120s — machine load, not assertions):
  test-solo-campaign-endings, test-time-save-crashes,
  test-synergy-stall, test-throttlefeast-20261014,
  test-capable-bot-20261014.
- **8 × assertion failures, all outside the fix's code**:
  the fix's game.js hunks are confined to returnToVillage
  (~8714) and the naming functions (~23107–23231); none overlaps
  any failing area. test-measurement-proof-update,
  test-measurement-workflow ("retained neutrality proof covers
  the current Game/controller/harness inputs"),
  test-measurement-cache-flags, test-trust-observer-neutrality
  (observer/neutrality freshness proofs — they fail whenever
  Game/controller/harness inputs moved since the proof refresh;
  r143 changed game.js the same day);
  test-phone-frame-proof ("every retained browser input matches
  current source" — same freshness class);
  test-mobile-combat-cadence ("Continue does not wrap the
  announced round a second time"); test-occupation-panels
  ("real CLI workflow completed");
  test-establishment-r20-fixes-20261020 (racks-full voice gate:
  "next day voices once more (gate resets daily): expected 2,
  got 1" — journey-establishment cook-day code, untouched by
  this arm).
- Standing state: recent master runs report the same band —
  journey-scale r102 "gate 273/17 pre-existing", journey-endgame
  r143 "gate 284/6", journey-landing r106 "gate 282/8". This
  run's 13 sits inside that pre-existing band. The arm's own
  proof tests are in the 277: `scripts/test-awaynaming-cap-a.js`
  and `scripts/test-gossip-position-r141.js` both pass on the
  rebased tip.

Proof tests on the fixed, rebased tree (run after the check.js
sweep finished, never concurrently): `scripts/test-awaynaming-cap-a.js`
**39/39 green** (incl. cap-fix leg: 20 lines held directly, all 20
delivered verbatim, queue drained; det-gate ON-vs-OFF identical on
17021 + 15003; 17021 anchor re-pinned to the r143 substrate fact,
52 days, village-lost — see "Adoption + rebase verification"),
`scripts/test-gossip-position-r141.js` **34/34 green** (checks 1–3
updated for the new routing, check 4 gained an awayNaming-empty
assertion, checks 5–6 untouched).

## Wall numbers (CARRIED, not re-measured)

This is a narration corpus; the wall was carried from the 1041Z
round (24 seeds): wins 0/24, national 0/24, table 0/24, wave-5
0/24, readiness-5-ready days 0/24.

## Metric review (required, §14)

### 1. The re-registered guardrail (i) worked as designed

The 2115Z metric review proposed judging silencing by the ledger
and keeping the sleep-phase rate as a descriptive report. This
run applied that revision before any judged sim, and the outcome
confirms the diagnosis: the ledger passes exactly (said_after ==
kicked on all 31 seeds, per kind), totals rose (2103 vs 2095),
and the sleep rate moved exactly as the phase-shift model
predicted (−65 sleep, +89 daily). The old band would have failed
this identical corpus by the same 0.68pp — the revision, not the
fix, is what changed the verdict, and the revision is the correct
meter for the question "did anything get silenced." No further
metric revision is proposed: the ledger is the silencing judge,
and the sleep rate stays a descriptive report.

### 2. The queue-snapshot (ii-b) method, preregistered here from the start, held

The cap-a Correction 1 method needed no further correction on
this run: 16 stretches, lost 0 everywhere, drain evidenced on
every returned stretch (morningR → eveningR drops to 0). The
superseded diagnostics behaved as documented: posHeld ~0 except
the known 17024 haven-tile artifact (2/2/0 — the hardcoded
(4,4)/(4,7) tiles don't cover that seed's haven at (5,2)); dhExcess
undercounts delivered wherever the before leg's flush landed in
harness phase, and overcounts on 17010 (13 vs 12) because the
before leg's flush dropped 6 lines the after leg says. Neither
diagnostic is the judge; neither moved the verdict.

### 3. held(q) is a lower bound on kicked-while-away volume

Unchanged from cap-a: lines kicked on the return-day morning,
before the return step, are delivered at the same return but not
counted in qEnd: 17016 qEnd 4 vs morningR 7; 17020 qEnd 2 vs
morningR 4; 17010 qEnd 12 vs morningR 13. The wall size should be
read from morningR (biggest: 13), not qEnd. No verdict impact —
lost is 0 either way and the ledger is exact.

### 4. Relay-measured loss is small on this substrate

4 word + 4 debate lines, 0 settle — much smaller than gossipfix's
cap losses (24 lines on 17010 alone, 9-night stranding) because
the relay cap is 20 and strandings are shorter on current master
(17010: 4 nights now vs 9). All 8 recovered by the uncapped gate.
The gossipfix kill reason (cap loss) is fixed: the uncapped queue
conserves every held line on all 31 seeds.

### 5. The before leg reproduced the cap-a before leg exactly

Every headline number and every per-seed row matches the cap-a
before leg. That is a substrate-stability finding in itself: the
fix was judged against the same relay behavior the cap-a run
measured, and the GO is not an artifact of a moved substrate.
The 2115Z adoption's independent verification (compare re-run
byte-identical, proof 39/39 + 34/34) is reproduced here on a
fresh corpus.

## What this means

The re-registered run lands what the two killed runs proved but
could not ship: 0 stranded burst/settle events, 0 lines lost on
31 seeds, 16/16 away stretches conserved, trajectories
identical, the relay's 8 dropped lines recovered, and the
catch-up reads true (13-line wall on the longest stranding
included). The single failing guardrail from the cap-a run is
retired by design — the ledger now judges silencing, and it
passes exactly. Under the prereg as written the verdict is GO.
The fix should land: the defect (haven-gossip burst reaching a
stranded scholar and reading wrong) is closed by this gate, and
the remaining open item is the design follow-up on the catch-up
wall (installments/summarizing), not a defect in the gate.

## Commits (branch sim-awaynaming-rereg-a, rebased onto master a7dfc4a45 at adoption)

- `938de06f3` prereg (guardrail (i) re-registered as ledger-based
  silencing; sleep rate descriptive only)
- `4b155859a` instrument — cherry-picked cap-a instrument
  (driver queue snapshots + naming ledger; rebuilt compare)
- `07a3f2bc2` instrument amendment — corrected compare as
  scripts/awaynaming-compare-rereg-a.js, guardrail (i)
  ledger-based
- `c3af9ff9b` before leg (31-seed fresh baseline, relay behavior)
  + before-panel (§15)
- `d6c3553db` [needs-eyes] fix — cherry-picked ee787f220
  verbatim (patch identical modulo commit hash; clean apply,
  clean rebase)
- `4313eae28` pilot after leg (8 seeds) + pilot compare — GO
- `10f7410cf` confirm after leg (23 seeds) + full 31-seed
  compare GO + after-panel + panel compare
- (this evidence file — to be committed next)
- (anchor re-pin in scripts/test-awaynaming-cap-a.js — test-only
  change, fix commit untouched — to be committed with the
  evidence file; see "Adoption + rebase verification")

## Infrastructure notes

- safe-commit.sh clobbered the worktree's main index after every
  commit this run (5 times: prereg, instrument amendment, before
  leg, pilot, confirm) — committed files showed staged-as-deleted
  in `git status`. Each repair used the documented recipe
  (`git update-index --add --cacheinfo` with the HEAD blob, plus
  `--force-remove` for the moved compare file once), verified by
  hash-object match + `git status` empty + `git diff HEAD` empty.
  Every commit itself was correct; only the index lied. This is
  the third-sighting class from AGENTS.md (2026-10-22/23), now
  seen five more times in one run — the clobber is routine on
  this box, not rare.
- No EPERM flap observed this run; all writes clean.
- Master did not move under the 2215Z run after the opening
  fast-forward to 555f59160 (bankkiller-b). Base for the fix
  cherry-pick verified current at pick time. At ADOPTION
  (2026-11-06) master had moved to a7dfc4a45 (journey-endgame
  r143); the branch was rebased onto it, clean, and the anchor
  re-pin + re-verification are recorded under "Adoption + rebase
  verification" above.
- Registry heartbeat kept fresh through the run (heartbeat script
  run at panel/leg boundaries).
