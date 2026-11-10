# Counter-close arm — EVIDENCE (arm sim-counterclose-a)

Run: fleshout-20261110T1915Z (Loop A). Axis: scale-onramp / diplomacy
(the counter wall). Prereg: evidence/2026-11-10/sim-counterclose-a-prereg.md
(committed BEFORE any judged computation, 229336383). Build:
f53d61816 (COUNTER_ANSWER lever + RAISER_SEAT harness + instrument /
driver / analyzer / proof, 16/16); harness reverted 6f30732d5 (proof
re-run green 17/17 after revert). Base at prereg time 70e3af870
(sim-diplo-a); no rebase was needed — master did not move under this
run. Corpus: evidence/2026-11-10/perseed-counterclose-a/ (16 cells,
seeds 150201–150208 identical on both legs, COMPETENT_TALK=1 +
RAISER_SEAT=1 harness on BOTH legs, COUNTER_ANSWER=1 armed only,
150d death-aware). Analyzer: scripts/counterclose-analyze-20261110.js;
summary: evidence/2026-11-10/counterclose-summary-counterclose-pilot.json.

## Verdict: GO — primary met on both halves, cost bar passes

Primary metric (conjunction, judged strictly as pre-registered):
(a) second links formed: armed **8/8** (31 via raise) vs control
**6/8** (23 via raise) — armed beats control, so half (a) PASSES.
The two seeds that flip are exactly the counter-stalled seeds.
(b) zero seeds stalled at unanswered counters: armed **0** stalled,
control **2** (150204, 150206) — half (b) PASSES.
GO requires both halves. The cost bar passes (see below). Per the
prereg, a confirm is recorded as OWED — it is NOT run this run and
the band 150209–150216 is NOT spent (reserved for tendexact-a).

## The diagnosis (what the counter wall actually was)

The raiserseat-a evidence reported "29/29 counter" (150204) and
"27/27 counter" (150206). That count conflated two different things,
and this arm's instrument splits them. On the REPRODUCED control
leg (same substrate, fresh run — the harness-reproduction check
passed, see below):

- 150204 control: exactly **1 FRESH counter** (day 10, village_0,
  judgeLink score **52**) + **48 BLOCKED RE-KNOCKS** + 1 null
  (already-linked re-propose, d41). `pending.counter` stayed true
  from day 10 to the last snapshot (day 150).
- 150206 control: exactly **1 FRESH counter** (day 6, village_1,
  score **49**) + **31 BLOCKED RE-KNOCKS**. `pending.counter`
  stayed true from day 6 to the last snapshot (day 150).
- The other six control seeds: **0 counters** — every propose formed
  (6/6/4/5/2). Band-wide control: fresh 2, blocked 79, formed 29.
  Pending-counter days: control **288** village-days vs armed **3**.

So the wall was never "these villages counter every propose." It
was ONE early counter per seed, and then the table staying blocked
forever: `pendingCounter` never expires (no sweep touches it; only
`answerCounter` clears it), `proposeLink` refuses every new propose
while one sits (hierarchy.js:645 — the guard returns 'counter'
without re-judging), and the policy had no counter-answer path (the
only answer UI is DOM buttons on the village card, app.js:17797,
which the node policy never touches). The village kept staging
raises, the scholar kept accepting them, and every accept re-knocked
on a blocked table — 79 times band-wide.

Why the first propose countered (propose-time state, recorded by the
instrument — not a guess):

- Both fresh counters were the seed's FIRST propose, days 6–10, a
  cold early ask: the target's opinion was **unrecorded (null)** —
  the village was brand-new to the scholar, just told by the raiser
  — so opinion/2 contributed ~0; the representative's standing was
  young (repS 10 and 14 → +5, +7); Haven was the stronger village
  (ourS 80 vs theirS 11; 25 vs 12), which helped (+13.8, +2.6).
  The scores landed at **52 and 49** — 3 and 6 short of the 55 form
  threshold. Near-misses, not rejections: one good roll from forming.
  The other six seeds' first proposes came later, with stronger
  courtship, and formed (scores 59–77 by the late game).
- The counter terms on the raise path: `acceptLinkRaise` calls
  `proposeLink` with NO opts (Haven asks them to bow); the counter
  flips it to Haven bowing, them primary, 5,000 kcal/week.

## The lever played

Policy-side only, zero src/js: `answerPendingCounter`, called once
daily at the top of `competent.daily` (before `keepPromises` and
`deepTalk`, so no sitting can re-knock first). Env gate
COUNTER_ANSWER=1, default OFF. A counter staged during day N's
talks is answered at the start of day N+1. Decision (follows the
`answerBelongCounter` precedent in belongseek.js):

- Pantry ≥ **12,000 kcal** → **sweeten** (1,500 kcal one-off, keep
  Haven's terms; re-judgment +12 vs 45).
- Pantry < 12,000 kcal → **walk** (clear the table, −3 opinion,
  keep the food; the village re-proposes later).
- Never 'accept' on the raise path: the counter asks Haven to bow
  at 5,000/week, and a competent player who asked them to bow does
  not bow for the asking — a subordinate link also does not build
  Haven's polity.

The RAISER_SEAT +35 signal is present on BOTH legs ONLY as the test
harness that reproduces the counter load (without it the band stages
0 counters and the lever has nothing to answer). It is KILLED
(NO-GO, raiserseat-a) and was REVERTED before the final commit
(6f30732d5); the proof pins the revert (RAISER_SEAT a no-op on
talkScore, exports gone). The landed artifact is COUNTER_ANSWER
only. The driver is kept byte-identical to the run as the record of
how the corpus was produced; re-running it now will NOT reproduce
the pilot, because the harness flag is a no-op.

## Before / after on identical seeds (8 seeds, 150d)

| Seed | Armed: days / end | Armed 2nd link | Armed counter | Control: days / end | Control 2nd link | Control counter |
|------|-------------------|----------------|---------------|---------------------|------------------|-----------------|
| 150201 | 150 / survived | YES (5 via raise) | 0 fresh, 0 blocked | 150 / survived | YES | 0 fresh, 0 blocked |
| 150202 | 150 / survived | YES (5) | 0 / 0 | 150 / survived | YES | 0 / 0 |
| 150203 | 150 / survived | YES (5) | 0 / 0 | 150 / survived | YES | 0 / 0 |
| 150204 | 113 / village-lost | YES (4) | 1 fresh, 0 blocked | 150 / survived | no | 1 fresh, 48 blocked |
| 150205 | 150 / survived | YES (3) | 0 / 0 | 150 / survived | YES | 0 / 0 |
| 150206 | 150 / survived | YES (4) | 2 fresh, 0 blocked | 150 / survived | no | 1 fresh, 31 blocked |
| 150207 | 146 / village-lost | YES (4) | 0 / 0 | 146 / village-lost | YES | 0 / 0 |
| 150208 | 111 / village-lost | YES (1) | 0 / 0 | 111 / village-lost | YES | 0 / 0 |

Second links formed (any village beyond the first link, ever):
armed 8/8, control 6/8. First-link source: raise 6 / ladder 2 on
BOTH legs (identical). The six non-counter seeds are byte-identical
between legs on every headline number (days, standing, links, talks,
turns, deaths) — the lever is a strict no-op where no counter is
pending, which is the isolation the prereg designed for. The only
trajectories that move are the two counter seeds, and they move
exactly where the lever acts.

The two counter seeds, in detail (the mechanism, from the instrument):

- 150204 armed: d10 fresh counter, village_0 (score 52) → d11
  SWEETEN, pantry 18,500 → 17,000 (exactly the 1,500 kcal sweetener),
  re-judgment score 49 + 12 = 61 ≥ 45 → **formed-link on Haven's
  terms** (4,000 kcal/week, us primary). Then d12, d13, d65, d71 all
  formed. 5 links, second link formed. The village then died at
  day 113 (see the cost-bar note below).
- 150206 armed: d6 fresh counter, village_1 (score 49) → d7 SWEETEN,
  pantry 17,450 → 15,950, re-judgment 61 → formed. Then d14 a SECOND
  fresh counter, village_0 (score 51) → d15 WALK — pantry was 10,378,
  below the 12,000 bar, so the policy kept the food and walked (−3
  opinion). The table cleared; d16 village_3 formed (score 59), and
  d29 village_0 was re-proposed and FORMED (score 63, opinion −8 by
  then). Both answer paths in the design fired, and both closed the
  table: sweeten when rich, walk when thin, re-propose later.
  6 links, second link formed.

Counter answers band-wide, armed: 2 sweeten-formed, 0 sweeten-failed,
0 sweeten-held, 1 walked, 0 accepted — 3 answer calls, 3,000 kcal
spent total. Control: 0 answers of any kind (the policy could not
answer), 79 blocked re-knocks, 288 pending-counter days.

Raises answered (tele outcomes, link kind): armed accepted **44** /
refused 0 / expired 9 / staged 53; control accepted **115** / 0 /
14 / 130. The control leg "answered" more raises only because the
blocked table kept generating them: 130 staged vs 53 — once links
form, the pipeline drains (a village already linked raises no more).
Second-link raises alone: armed 36 accepted / 9 expired / 45 staged;
control 101 / 14 / 116.

## Harness reproduction (prereg check, FIRST)

The control leg shows the counter-stall class: 2 seeds ending with
`pending.counter` true (150204 village_0@d10, 150206 village_1@d6),
2 fresh counters band-wide, 79 blocked re-knocks. The pilot is NOT
void. (Shape matches the raiserseat-a armed leg — 2 stalled seeds, 2
fresh counters — with trajectory noise: control here stages 130
raises vs 82 there and survives 150d on both counter seeds vs the
d80 loss there, because this base's trajectories diverge after the
first counter; the class, not the count, is what the prereg binds.)

## Cost bar: PASS (per-day form, judged as written)

- Deaths per 100 village-days: armed **62.14** (696 deaths / 1,120
  village-days) vs control **62.58** (724 / 1,157); cap control +
  10% = 68.83. PASS.
- Starvation deaths: armed **2** vs control **2** (cap +2). PASS.
- Arm-only starvation (armed starvation on seeds where control
  starvation = 0): **0** vs cap 2 (control total). PASS.
- Median survival: armed **150d** vs control 150d (floor 0.8x =
  120). PASS.

The one wrinkle, reported honestly: 150204 armed died at day 113
(village-lost, standing 125, wave 4) while its control survived to
150d (standing 525, wave 5) — the only seed where the armed leg
ends sooner. The death-cause mix says trajectory divergence, not
lever harm: armed 60 deaths over 113 days (0.53/day) vs control 83
over 150 (0.55/day) — same daily rate, same ordinary kinds
(villager combat 29 vs 30, combat 16 vs 35, the wild 10 vs 2,
expedition 3 vs 9, zero starvation either leg, no tribute cause).
The sweeten's re-judgment draw on day 11 splits the RNG stream
from control, so every later draw differs; the village then drew a
losing run of the same fights. The bar as pre-registered (per-day
rate, starvation, median) passes, and the seed-level story is
disclosed here rather than hidden behind the band totals. Wave-5
unlocks armed 6/8 vs control 7/8 is the same seed's shadow (150204
died at wave 4).

Death causes (both legs combat-dominated, starvation 2 vs 2):
armed — villager combat 261, combat 209, expedition 125, the wild
57, monster 15, sickness 3, wound 3, arena 4, contest 2, ambush 2,
alien 3, stranger 4, the night 2, dehydration 1, Redactor/Gavel/Ad
Break 1 each; control — villager combat 257, combat 230, expedition
137, the wild 48, monster 16, sickness 3, wound 3, arena 4, contest
5, ambush 3, alien 3, stranger 6, the night 2, dehydration 1, thirst
1, Redactor/Gavel/Ad Break 1 each. No cause moved alarmingly; the
armed leg's excess is villager combat +4 and the wild +9, offset by
fewer plain-combat (−21) and expedition (−12) deaths.

## Reachability verdict

- Second links: armed 8/8, control 6/8 — reachable on every seed
  once counters close. The counter wall is closed, not moved.
- Polities (one primary + ≥3 seasoned subordinates, SCALE.md):
  armed polityEver 6/8, control 4/8; seasoned-links max 5 both.
- National / table / wins: **0/8 on both legs**. Wave-4 unlocks 8/8
  both legs; wave-5 unlocks armed 6/8, control 7/8. The scale wall
  stands above this fix: the counter-close moves second links (the
  polity layer), and the seat itself is still unreached. Standing:
  armed 125–680, control 199–695.

## Village assessment (plain words)

Picture the eight villages as eight small fires trying to grow into
a region. On six of them nothing changed at all — the same days, the
same links, the same endings, because no counter ever appeared and
the new habit had nothing to answer. On the other two, the story
finally completes. A villager walks up with an idea — "let's tie
ourselves to Emberhold" — the scholar sits down and says yes, and
the other village answers, in effect, "not on those terms — here's
our price." This time somebody goes back to the table. On one seed
the scholar pays a small gift of food (1,500 kcal, a rounding error
against a full pantry) and the village agrees to the original terms;
on the other, the pantry is thin that week, so the scholar walks
away, keeps the food, and comes back two weeks later when the terms
are better — and the same village says yes. Both villages grow from
one fire to five and six linked fires. The table is never left
waiting again: three village-days of waiting on the armed leg,
against 288 on the control.

One village still dies young, and it is the one that grew fastest:
it formed five links and then lost its fights at day 113, while its
twin that never grew at all survived the season. It died fighting,
at the same daily rate, with fewer dead — not starved, not bled by
tribute. Growing did not save it; not growing did not doom the
other. The road past regional is open on all eight seeds now, but
nobody has walked it to the national seat, let alone the table.

## Sense-test (SENSE-TESTING LAW)

The sweeten-formed links read like people, and like Haven's terms
kept: 150206 day 7, "⛓️ Devon brings it home: Stonebridge bows to
Haven — one organization, us primary. Tribute: 4,000 kcal/week. The
relationship starts at trust 30. Everything from here is earned."
150204 day 11–13, the same line three days running for Emberhold,
Thornfield, Stonebridge — Abigail carrying each one home. The
formation line credits the representative (Devon on 150206 — who
was also the raiser there, so the asker is named in the moment their
idea lands this time; Abigail on 150204).

Two wrinkles, both disclosed:

1. The counter-stage line ("doesn't say no... The table is set")
   and the sweeten line ("The gift talks... at YOUR terms") are NOT
   in the captured say-lines: the driver's say-wrap regex
   (link|bond|raise|polity|realm|season|tribute|trust|standing)
   matches neither line, so they were never recorded. The mechanism
   is proven by the instrument records instead (answer calls with
   day, target, pantry before/after, result) — the words were said
   in the engine (answerCounter's say calls fire on the same code
   path the proof test exercises), but this corpus cannot quote
   them. A future instrument should add 'counter|sweeten|table is
   set' to the say-wrap.
2. The formation line still repeats verbatim per link (same
   sentence, same tribute, same trust 30) — the template repetition
   talkturn-a flagged, now more audible at 37 formations. And the
   walk path says nothing in the moment beyond the engine's walk
   line; the re-propose 14 days later (d29, village_0 formed) is the
   only visible trace that walking was a pause, not a refusal.

No robotic queue-draining: each answer has a named village, a
staged day, a pantry reading at decision time, and a formation line
with real terms — or, for the walk, a later re-propose that lands.

## Metric review

1. The primary bar held up: 8/8 vs 6/8 separates exactly on the
   counter seeds, the mechanism (fresh counter → answer next day →
   formed, zero blocked re-knocks) is visible in the corpus,
   reconciliation went 0 bad with zero instrument errors, and the
   six no-counter seeds are byte-identical between legs — the
   isolation is proven, not assumed. No bar needs lowering.
2. The "29/29 counter" count is retired: this arm's instrument
   splits fresh counters from blocked re-knocks, and the prereg's
   "counter-stalled seed" class (fresh counter staged,
   `pending.counter` true at end) replaces the 150206-class
   (≥10 stagings, 0 picks) for this failure. Future arms should
   report fresh vs blocked separately; a raw 'counter' return count
   measures the guard, not the negotiation.
3. The cost bar's per-day form behaved as designed: the armed leg
   lived 37 fewer village-days but died at a LOWER daily rate, and
   the raw totals (696 vs 724) would have passed anyway — the
   per-day read is the honest one either way. Keep it.
4. The decline-null class needs a name: the instrument lumps four
   distinct null returns (shut door opinion ≤ −20, already-linked,
   unknown village, judged decline <35) into 'declined-null'. On
   control 150201, four proposes to village_3 returned null while
   opinion sat at −25..−20 — the shut door, knocked on four times
   across 25 days (filed in the findings backlog). A future
   instrument should split the null by reason; the counts here (4
   armed, 5 control) are small and verdict-neutral.
5. The say-wrap regex gap (wrinkle 1 above) means the counter's own
   words are unquoted in this evidence. The verdict does not rest
   on them — the instrument records carry the mechanism — but the
   sense-test is thinner than the prereg intended for exactly the
   lines this arm cares about most.

## Infrastructure notes

- Runtime restart during the armed leg killed the driver ~11.5 min
  in (session proc_6b73da2ad3c3, no confirmed final result). Disk
  check showed 6 armed files had landed complete and valid
  (150201–150206 — parse, counterFlag 1, seatFlag 1, anchor
  f53d61816, instrumentErrors 0); re-ran ONLY the missing 2 armed
  cells (150207, 150208) with the committed driver. No file was
  overwritten; no cell was double-run. /tmp logs were wiped by the
  restart (the exec-log copy is the record).
- safe-commit.sh index clobber struck TWICE on this run (after the
  build commit f53d61816 and after the revert commit 6f30732d5):
  the main index showed committed files staged-as-deleted while the
  worktree files were byte-identical to HEAD. Repaired both times
  with the documented pipe (`git ls-tree HEAD -- <paths> |
  git update-index --add --index-info`), verified `git status`
  empty + `git diff HEAD` empty each time. Both commits are correct.
- The counterclose instrument's judgeLink wrap records the
  sweeten re-judgment as caller 'answerCounter-sweeten' via the
  stack — verified on both sweetens (re-judgment scores 49 and 61).
- Confirm band 150209–150216: NOT spent. Confirm OWED (see below).

## What remains

- This arm: GO. The lever (COUNTER_ANSWER, policy-side, env-gated,
  default off) is a landing candidate. Landing it as the competent
  default vs keeping it env-gated is a coordinator/Steve call:
  COUNTER_ANSWER=1 is bot behavior, not a game change — making
  held-conversation counter-answering the default competent behavior
  is a policy decision, not a src/js change.
- CONFIRM OWED (not run this run): the same legs on a FRESH band
  (a later run picks it; 150209–150216 stays reserved for
  tendexact-a, so the confirm band is the next fresh band after
  that). The confirm judges the same primary (second links armed >
  control AND zero armed seeds stalled) under the same cost bar.
  The pilot's GO rests on 2 flipped seeds; the confirm is what
  makes it a landing, not a pilot.
- The RAISER_SEAT +35 signal stays DEAD (NO-GO, reverted,
  revert-pinned in the proof). The counter-close does not rescue
  it and does not re-test it: the seat signal answers raises, the
  counter answer closes the negotiation — different jobs, and only
  the second landed here.
- The scale wall is unchanged by this arm: national 0/8, table 0/8,
  wins 0/8 on both legs. The counter-close moves the polity layer;
  the seat above it is still unreached.
- Findings-backlog item filed (2026-11-10, scale-onramp/counters):
  raises keep staging for a shut-door village (opinion ≤ −20,
  control 150201: 4 proposes to village_3 at opinion −25..−20,
  all null) — the staging gates don't read opinion.
