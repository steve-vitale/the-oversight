# sim-arrears-a — ARREARS DIAGNOSIS (Loop A 20261102T0605Z, axis scale-onramp)

Run: fleshout-loop-a-20261102T0605Z, arm sim-arrears-a, axis scale-onramp.
Sibling Loop B live on sim-roadguard-b / sim-gatedepth-b throughout —
NOT touched. Prereg committed BEFORE any judged sim (bcb53799).
POLICY-SIDE ONLY — zero `src/js` changes. No [needs-eyes] (diagnosis
alone, nothing player-facing ships).

## Verdict: DIAGNOSIS COMPLETE — GO on all five prereg bars (one qualification)

Validator `scripts/test-arrears-a.js`: VERDICT GO, fails=0.
Determinate clearing answers 4/4 blocked seeds; first-failure tables
complete 6/6 seeds; control drift zero (see below); transcript line
real; guardrails clean (sound count 0, instrument errors 0).

QUALIFICATION (stated up front, not buried): the prereg's "30 days"
window ran to run end on three seeds — full 30 days observed only
on 95447 (days 94–124). Windows: 95447 31 days, 95464 10 days
(128–137, run ended), 95478 6 days (104–109, run ended), 95512
18 days (73–90, run ended). The never-clears verdict does not rest
on window length alone: across all 107 observed blocked link-days
there are ZERO arrears decreases, and the window contains direct
observations of every candidate clearing event failing to clear
(waivers, full current-week payments — see below), plus a code
audit showing no zeroing site exists for this link direction at
all. The verdict is structural, not window-limited — but the
window truncation is recorded here so the next arm does not
over-cite "30 days" for 95464/95478/95512.

## The answer in one paragraph (plain words)

A village that falls behind on tribute never stops being behind.
Once a subordinate fire owes Haven even one week's tribute, the
debt never shrinks: paying the current week in full leaves the old
debt standing, having the wagons waved home as a kindness leaves
it standing, and missing another week only grows it. There is no
verb in the game — no payment, no waiver, no renegotiation — that
pays off old debt on a link where Haven is the head. Every blocked
seed in this band is a Haven-head link, so the "pay it off" path
does not even apply here: it only exists for links where Haven
bows to someone else, and this band has none of those. Waiting
makes it worse (new missed weeks, falling trust, one link broken
by day 126), and sounding the call anyway costs the refusing fire
another −8 trust each time. So a muster cannot wait for an
indebted fire — it must route around it, and only one of the
four blocked seeds can be routed around at all (see per-seed
routing below).

## Question (tracker blank 1)

What clears arrears in time, what it costs, and whether a muster
can wait for / route around an indebted fire? Answer: nothing
clears it (in-engine, for Haven-primary links); the cost is
therefore undefined — there is no price at which it clears; and
waiting fails while routing around works only on 95464.

## Method (what was actually run)

Frozen quotatrigger/sumtrigger/sumconfirm stack (tribfloor
leadfeast + windefer + seatdrive + fullseat-diag, herald-v1 +
muster-diag recorders; FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1; DAYS=180
death-aware cap). NO call ever sounded in the trace runs
(soundTitanCall 0, titanCommitOwn 0, all 6 seeds) — sounding
charges refusing links −8 trust and would corrupt the
"unprompted" question. Daily census of every link (direction,
trust, opinion, arrears, tribute/week, subordinate pantry, link
age, status, kind) from the policy daily hook. The census NEVER
calls `Game.titanCallReadiness` or any roster generator mid-run
(the 0445Z lesson: generation consumes seeded RNG and moves
tails) — refusal reasons are recomputed from link fields by the
exact soundTitanCall rule (trust < 25, opinion < −10,
arrears > 0). First failure = first muster-diag refusal snapshot
day carrying an arrears link (contrast seeds: first refusal
snapshot of any kind, flagged in the corpus). Separate labelled
probe run (95447, DAYS=110, one forced sound at first refusal)
exists ONLY for the spoken refusal line; its timeline is
discarded for every measured claim.

Corpus: evidence/2026-11-02/perseed-arrears-a/trace-s<seed>.json
(6 seeds) + probe-s95447.json. Instrument:
scripts/arrears-trace-20261102.js, scripts/arrears-split-20261102.js,
scripts/arrears-probe-20261102.js. Validator:
scripts/test-arrears-a.js (corpus-only, GO fails=0).

## Per-seed per-link table — first failure (all links Haven-primary, kind tribute)

"SubPan" = subordinate pantry kcal (the pantryKcal scalar linkTick
itself reads). "Age" = link age days. Refusal reason in every
blocked row is arrears>0 alone — no blocked link also fails trust
or opinion at first failure (trust 45–83, opinion 6–39).

### Blocked seeds

| Seed | FF day | Village | Trust | Opin | Arrears | Trib/wk | SubPan | Age | Contribution lost |
|---|---|---|---|---|---|---|---|---|---|
| 95447 | 94 | Emberhold | 45 | 11 | 9,750 | 3,000 | 0 | 62 | 2 (quota 2) |
| 95447 | 94 | Stonebridge | 67 | 25 | 0 | 3,000 | 20,458 | 61 | — (gives 2) |
| 95447 | 94 | Thornfield | 51 | 15 | 0 | 3,000 | 0 | 58 | — (gives 2) |
| 95464 | 128 | Emberhold | 69 | 6 | 3,000 | 2,250 | 0 | 87 | 2 (quota 2) |
| 95464 | 128 | Stonebridge | 71 | 38 | 0 | 2,250 | 57,640 | 83 | — (gives 6) |
| 95464 | 128 | Thornfield | 61 | 15 | 0 | 2,250 | 17,676 | 82 | — (gives 2) |
| 95478 | 104 | Emberhold | 65 | 22 | 26,000 | 3,000 | 0 | 79 | 2 (quota 2) |
| 95478 | 104 | Stonebridge | 94 | 44 | 0 | 3,000 | 0 | 78 | — (gives 3, faces-limited) |
| 95478 | 104 | Thornfield | 49 | 26 | 11,000 | 3,000 | 0 | 77 | 2 (quota 2) |
| 95512 | 73 | Emberhold | 83 | 35 | 4,000 | 3,000 | 45,000 | 48 | 6 (quota 6) |
| 95512 | 73 | Stonebridge | 47 | 30 | 16,980 | 3,000 | 0 | 47 | 2 (quota 2) |
| 95512 | 73 | Thornfield | 54 | 35 | 4,000 | 3,000 | 45,000 | 46 | 2 (quota 2) |

Faithful totals at first failure (old-corpus projections, need 10):
95447: 7 (4 allies + 3 Haven). 95464: 9 (8 + 1 Haven). 95478: 6
(3 + 0 Haven at FF; max 6 over the run). 95512: 3 (0 + 2 Haven
at FF; max 3). The naive quota-sum (refusals ignored) would have
fired on 95447 (9), 95464 (11), 95512 (12) — the 0445Z finding,
reproduced here at the decision moment.

### Contrast seeds (sounded in 0445Z; arrears 0 everywhere at first refusal)

| Seed | FF day | Village | Trust | Opin | Arrears | Trib/wk | SubPan | Age |
|---|---|---|---|---|---|---|---|---|
| 95448 | 89 | Emberhold | 92 | 39 | 0 | 3,000 | 48,000 | 59 |
| 95448 | 89 | Stonebridge | 100* | 40 | 0 | 3,000 | 59,915 | 58 |
| 95448 | 89 | Thornfield | 87 | 40 | 0 | 3,000 | 48,171 | 57 |
| 95453 | 95 | Emberhold | 80 | 46 | 0 | 1,688 | 16,271 | 70 |
| 95453 | 95 | Stonebridge | 83 | 54 | 0 | 1,688 | 85,945 | 69 |
| 95453 | 95 | Thornfield | 59 | 54 | 0 | 1,688 | 72,000 | 68 |

*95448 Stonebridge census trust 100 vs snapshot trust 96 at the
same decision moment — one intra-day trust gain between the
snapshot and the end-of-day census; the snapshot value (96)
matches the old corpus exactly. All other contrast values match
the old corpus exactly. Contrast totals: 95448: 19 (16 + 3 Haven).
95453: 13 (11 + 2 Haven). The contrast is clean: sounded seeds
are the seeds that never fell behind; blocked seeds are the
seeds where exactly the indebted fires refuse.

## Clearing mechanism + cost per blocked seed (the diagnosis)

NONE of the six blocked links clears in its observed window.
Zero arrears decreases in 107 blocked link-days. The only arrears
moves observed are increases: three missed weeks, +2,250 each,
−2 trust each (95447 Emberhold day 120; 95512 Stonebridge days
78 and 85). End states:

| Seed | Link | FF arrears | End arrears (day) | Trust FF → end | What happened in the window |
|---|---|---|---|---|---|
| 95447 | Emberhold | 9,750 | 12,000 (124) | 45 → 15 | 3 waivers (98/105/112), succession tribute presses 3,000→2,250 (113)→1,688 (123), one missed week (119, +2,250). Link BROKE day 126 (succession), still carrying 12,000. |
| 95464 | Emberhold | 3,000 | 3,000 (137) | 69 → 56 | 1 waiver (133), succession press 2,250→1,688 (136). Debt from a single missed week (day 126, +3,000, in link history). Flat despite waiver. |
| 95478 | Emberhold | 26,000 | 26,000 (109) | 65 → 66 | Succession press 3,000→2,250 (108). Sub pantry 43,481 at end — rich, still indebted. No tick observed in the 6-day window. |
| 95478 | Thornfield | 11,000 | 11,000 (109) | 49 → 42 | 1 waiver (105), succession press (108). Sub pantry 25,200 at end. |
| 95512 | Emberhold | 4,000 | 4,000 (90) | 83 → 79 | Full current-week payment arrives day 77 (2,813 kcal line) — old 4,000 untouched. Sub pantry 45,750 at end. |
| 95512 | Stonebridge | 16,980 | 21,480 (90) | 47 → 20 | Two missed weeks (77, 84; +2,250 each). Insolvent (sub pantry 0 throughout). |
| 95512 | Thornfield | 4,000 | 4,000 (90) | 54 → 47 | Full current-week payment arrives day 84 (2,250 kcal line) — old 4,000 untouched. Sub pantry 45,750 at end. |

Candidate clearing events, tested against the traces:

- Subordinate tribute payment via membershipDaily/linkTick:
  OBSERVED NOT CLEARING. Full current-week payments (95512
  Emberhold, Thornfield) leave old arrears byte-identical, and
  the code confirms why: the Haven-primary branch grants +1
  trust on a full payment and never touches arrears. There is
  no back-payment: the engine collects this week's tribute only,
  never the backlog — even from a subordinate holding 45,000 kcal
  against a 4,000 debt.
- Haven waiver (DEPOSITGATE): OBSERVED NOT CLEARING. Waivers on
  indebted links (95447 Emberhold ×3, 95464 ×1, 95478 Thornfield
  ×1) count the week paid, grant +1 trust, and leave pre-existing
  arrears untouched — the waiver code path never assigns arrears.
- Renegotiation: OBSERVED NOT CLEARING (and not a clearing verb
  at all). Succession presses cut the FUTURE weekly rate
  (3,000→2,250→1,688 across seeds) while the backlog stands.
- Primacy flip burning the books: NOT APPLICABLE HERE. The flip
  clears arrears Haven OWES as subordinate; every link in this
  band has Haven as primary, so there is nothing to flip into.
- Break/relink inheritance: OBSERVED DEBT SURVIVES. 95447
  Emberhold's link broke day 126 carrying 12,000; the engine's
  re-link rule inherits the latest broken link's arrears by
  design ("break to wipe the debt is an exploit the engine
  refuses"). Breaking out costs the link and keeps the debt.
- Haven-subordinate payTribute (the one real clearing verb: a
  full week's payment zeroes arrears, +3 trust): NOT APPLICABLE
  HERE — no link in this band is Haven-subordinate. Cost if it
  applied: one full week's tribute from Haven's pantry.

Cost summary: for Haven-primary arrears there is no price — the
debt is not a balance to be paid down, it is a permanent refusal
flag once > 0. A future lever that wants clearing must INVENT a
back-payment verb (game-code change, coordinator/sibling call —
out of this policy-only arm's scope); no such verb exists to
measure today. This is a design gap, documented, not built.

## Can a muster wait? Can it route around? (per seed)

WAIT: No, on all four seeds. Arrears never decreases while
waiting; trust on indebted links falls (95447 Emberhold 45→15;
95512 Stonebridge 47→20) or flatlines; new debt accrues
(95447 Thornfield was CLEAN at first failure and owed 5,626 by
run end — the indebted set grows, never shrinks); and each
refused attempt in the meantime costs −8 trust (probe, below).
Waiting is strictly worse than acting at first failure.

ROUTE AROUND (faithful math at first failure, need 10):

- 95447 — NOT routable as-is (7 max: 4 allies + 3 Haven).
  Route exists only via tending, not via arrears: Stonebridge
  trust 67→70 (with opinion ≥ 10 held) lifts its quota 2→6,
  giving 11. The sibling route arm's lever here is trust
  growth on a clean link, not debt.
- 95464 — ROUTABLE via Haven alone (9 at FF, one short; Haven
  volunteers 1 at FF, cap 3 → 11 with a full Haven commit).
  This is the only blocked seed where the muster can go without
  the indebted fire and without new trust.
- 95478 — NOT routable (6 max: Stonebridge faces-limited at 3,
  Haven 0 at FF). Needs roster growth on Stonebridge and/or
  Haven volunteers appearing; both indebted links are dead
  weight either way.
- 95512 — NOT routable (3 max: 0 allies + Haven). All three
  fires indebted; without clearing, no combination reaches 10.

Bottom line for the sibling route arm: route-around is a
one-seed answer (95464, via Haven volunteers), not a general
one. The general answer has to be a new clearing verb or
accepting that indebted fires are permanently out of musters.

## Control / drift (in-run current-code control, prereg bar c)

Zero drift at the decision moment. First-failure day and every
per-link trust/opinion/arrears value reproduce the old
sumconfirm corpus (anchor 489ce5e90e7e) EXACTLY on all four
blocked seeds (94/128/104/73) and both contrast first-refusal
days (89/95). Stronger: the no-call trace wall reproduces the
0445Z no-call SCREEN band exactly on all six seeds — gameDays,
end reason, national, table, won, maxWave all identical
(95447: 138d over-other 0/1/1 w4; 95464: 137d over-other 1/1/1
w4; 95478: 109d over-other 1/1/1 w4; 95512: 90d over-other 0/1/1
w4; 95448: 110d village-lost 1/0/0 w4; 95453: 102d over-other
1/1/1 w4). The sumdeploy game change (titanCallReadiness, landed
between the old corpus and this run) moved no no-call trajectory
— as designed, since readiness is lazy and the trace never calls
it — and the daily census reads perturb nothing. No verdict in
this report rests on the stale corpus: every number above is
from the in-run control, with the old corpus used only for the
drift comparison. (The old corpus's intervened confirm band
differs from this no-call band only because it sounded calls —
expected, not drift — and is not used as a comparator here.)
Limitation, stated: the old corpus's max-faithful totals (7/9/
6/3, which need roster generation) are NOT reproducible in a
pure no-call trace and are cited from the old corpus only for
the routing math, flagged as such.

## Sense-test (prereg bar d)

Clearest line (REAL, from the probe run's forced sound, day 94,
95447 — not a code template):

> "— Emberhold REFUSES. debts unpaid between you. (trust −8 —
> refusals are remembered.)"

Judgment: the refusal line names the debt honestly and reads
humanly — short, spoken, with the cost of the refusal itself
stated. But it names no amount and no week: a player told only
this cannot tell a 3,000 debt from a 26,000 one, or what would
settle it. The tribute lines around it are stronger: "Nothing
comes from Emberhold this week — their fields are as empty as
the wagons look. Hunger isn't defiance, but the ledger doesn't
know the difference. (Arrears +2,250 kcal, trust −2.)" — that
line distinguishes hunger from defiance while still booking the
debt, which is exactly human. The sense GAP is the waiver line:
"Tribute wagons from Emberhold turn at the gate — our shelves
are full past tomorrow. 'Eat well,' we send back. 'That IS your
tribute this week.' (Trust +1.)" — warm, generous, and it reads
as forgiveness, but the old debt still stands and still refuses
the call. A player who watches three waivers in a row will
reasonably believe the debt is handled. It is not, and nothing
in the transcript says so. If a clearing verb is ever built, its
line must say the backlog by name ("the old 9,750 still stands"
or "the books are clean") — otherwise waivers will keep reading
as forgiveness they are not.

## Wall metrics (in-run control band, kept separate, never pooled)

National(end) 4/6, table 5/6, won 5/6, wave-4 6/6, wave-5 0/6,
median survival 109.5d (sorted gameDays 90, 102, 109, 110, 137,
138 → (109+110)/2), max 138d, ends over-other 5 / village-lost 1.
(Note: this is the no-call screen-equivalent band, not an
intervened band — do not compare it against the 0445Z intervened
confirm band's 5/12 wins as if it were a lever effect.)

## Infrastructure notes (loud, per run discipline)

- EPERM write flap (known container class): the first contrast
  re-run died at console.log with EPERM writing to evidence/;
  two subsequent /tmp redirects failed instantly with exit 1 and
  empty outputs. Recovery that worked: run with output to the
  exec capture (no redirect) and extract the JSON line from the
  saved tool-output file. The flap cost ~15 minutes, no data
  (the full sweep's evidence/ redirect had succeeded; only the
  contrast re-run needed recovery).
- Index clobber (known class) struck the prereg safe-commit:
  main index showed the prereg file as deleted + untracked after
  a correct commit (bcb53799). Repaired via HEAD-blob cacheinfo;
  commit verified, tree clean before any sim ran.
- 95448/95453 contrast corpora were re-run after a script fix
  (first-failure fallback for arrears-free seeds: first refusal
  snapshot of any kind, flagged by source). The four blocked
  corpora are from the original sweep run, unmodified.

## Metric review

- The prereg's "30 days" window should have been written as
  "30 days or run end, whichever sooner" — the evidence header
  said "or run end, if sooner" in the instrument section but the
  GO bar text said "in 30 days" flat. The verdict above applies
  the instrument-section reading (window to run end + code-path
  extension) and discloses the truncation; a future prereg
  should write the window rule once, in the bar itself.
- Median survival in the wall section: recomputed from the six
  gameDays (90, 102, 109, 110, 137, 138) the median is 109.5d.
  Any "106d" draft figure is wrong; 109.5d is the reported value.
- The validator's "NEVER-CLEARS in 30d" note wording inherits
  the same flat phrasing; the evidence file's qualification
  above governs over the validator's shorthand.
- No metric was re-scored mid-run. The GO bars were judged as
  written, with the window qualification disclosed rather than
  used to soften a bar.

## Findings for the backlog (not chased mid-run)

- (For coordinator/tracker, not appended to sim-findings.md by
  this worker — hidden_files are coordinator-owned.) Arrears
  on Haven-primary links is a permanent refusal flag with no
  clearing verb: candidate tracker blank / design gap for the
  sibling route arm or a future lever (back-payment verb, with
  its line naming the backlog explicitly, per the sense-test
  above). The indebted set grows over a run (95447 Thornfield
  clean→5,626) — a slow muster-rot, not a one-seed accident.
- Waiver lines read as forgiveness while old debt stands — a
  narration honesty gap worth a line fix whenever a clearing
  verb lands ("the week counts paid; the old debt still stands"
  would close it without any mechanic change).

## Commits (this worktree branch sim-arrears-a; coordinator merges)

- Prereg: bcb537990c3da227660d3fa48530af2d18d40985
- Evidence + instrument + corpus: this commit (hash recorded in
  the worker's final report to the coordinator; the prereg hash
  above is the anchor for the whole run)
- No src/js touched. No push, no bump, no live verification.
  Report: merged locally, pending ship (readiness only — the
  coordinator merges this branch).
