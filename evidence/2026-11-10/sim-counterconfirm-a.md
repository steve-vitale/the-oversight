# Counter-close confirm — EVIDENCE (arm sim-counterconfirm-a)

Run: fleshout-20261111T0115Z (Loop A, adoption worker). Axis:
scale-onramp / diplomacy (the counter wall). Prereg:
evidence/2026-11-10/sim-counterconfirm-a-prereg.md (committed BEFORE
any judged computation, 3504aa9fd). This run ADOPTS the stranded
confirm arm from the dead 2215Z run: the branch already carried the
prereg (3504aa9fd) and driver/analyzer/proof 17/17 (c26d50a25), and
the confirm corpus was COMPLETE and uncommitted in the worktree.
No new sims were run by this adoption except verification re-runs
(none needed — all 32 cells parsed, non-empty, instrumentErrors 0).
Build: c26d50a25 (COUNTER_ANSWER lever + RAISER_SEAT harness +
confirm driver/analyzer/proof); harness reverted in the final
commit of this arm (proof re-run green after revert — see below).
Base at prereg time b6cf13684; the branch rebased onto the explicit
master SHA read immediately before rebasing (see infrastructure
notes). Corpus: evidence/2026-11-10/perseed-counterconfirm-a/
(32 cells, seeds 150217–150232 identical on both legs,
COMPETENT_TALK=1 + RAISER_SEAT=1 harness on BOTH legs,
COUNTER_ANSWER=1 armed only, 150d death-aware). Analyzer:
scripts/counterconfirm-analyze-20261110.js; summary:
evidence/2026-11-10/counterconfirm-summary-counterconfirm.json.

## Verdict: GO — primary met on all 16 seeds, cost bar passes

Primary metric (conjunction, judged strictly as pre-registered):
(a) second links formed: armed **16/16** (52 via raise) vs control
**13/16** (36 via raise) — armed beats control, so half (a) PASSES.
The three seeds that flip are exactly three of the four
counter-stalled seeds (150220, 150221, 150223; 150219 control
formed a second link via another village while still stalled at
village_2 — see the mechanism note below).
(b) zero seeds stalled at unanswered counters: armed **0** stalled,
control **4** (150219, 150220, 150221, 150223) — half (b) PASSES.
GO requires both halves. The cost bar passes (see below). The
pilot gate on the first 8 seeds (150217–150224) also passes on its
own: armed 8/8 vs control 5/8, zero armed stalled, so the confirm
spend was earned, not assumed.

## Harness reproduction (prereg check, FIRST)

The control leg shows the counter-stall class: 4 seeds ending with
`pending.counter` true (150219 village_2@d12, 150220
village_0@d6, 150221 village_2@d6, 150223 village_1@d16), 4 fresh
counters band-wide, 105 blocked re-knocks, 513 pending-counter
days. The confirm is NOT void. (Shape matches the pilot — 2
stalled seeds on 8 — scaled to the 16-seed band: 4 stalled, 4
fresh, 105 blocked.)

## The mechanism, confirmed on the fresh band

Same diagnosis as the pilot, now on four fresh instances instead
of two. Every fresh counter was the seed's first propose, days
6–16, a cold early ask: the target's opinion was **unrecorded
(null)** on all four; Haven was the stronger village (ourS 25–85
vs theirS 9–16); rep standing young (12–18). The counter terms on
the raise path are identical every time: Haven bows, them primary,
5,000 kcal/week.

The four armed answers, from the instrument records:

- 150219 armed: d12 fresh counter, village_2 (Thornfield) →
  d13 SWEETEN, pantry 19,769 → 18,269 (exactly the 1,500 kcal
  sweetener) → **formed-link on Haven's terms**. Then 8 more
  links formed. 9 links, second link formed. (Control: stalled
  at village_2 to the end, 24 blocked re-knocks, but formed a
  second link via village_0 — the stall blocks one table, not
  the whole village's diplomacy; the seed still counts as
  stalled under the prereg's class, and its control leg died at
  day 145 while the armed leg survived to 150.)
- 150220 armed: d6 fresh counter, village_0 (Emberhold) →
  d7 SWEETEN, pantry 25,100 → 23,600 → formed-link. 3 links.
  (Control: stalled, 29 blocked re-knocks, no second link.)
- 150221 armed: d6 fresh counter, village_2 (Thornfield) →
  d7 SWEETEN, pantry 34,030 → 32,530 → formed-link. (Control:
  stalled, 31 blocked re-knocks, no second link, survived to
  150d at standing 995 — the highest standing on the control
  leg — while its armed twin died at day 119. See the cost-bar
  note below.)
- 150223 armed: d16 fresh counter, village_1 (Stonebridge) →
  d17 SWEETEN, pantry 16,971 → 15,471 → formed-link. (Control:
  stalled, 21 blocked re-knocks, no second link.)

Counter answers band-wide, armed: 4 sweeten-formed, 0
sweeten-failed, 0 sweeten-held, 0 walked, 0 accepted — 4 answer
calls, 6,000 kcal spent total. Control: 0 answers of any kind,
105 blocked re-knocks, 513 pending-counter days. All four
sweetens fired with pantries well above the 12,000 kcal bar
(16,971–34,030), so the walk path did not fire on this band —
the pilot's walk (150206, pantry 10,378) remains the only
walk observed; the walk path is proven by the pilot, not by
this confirm.

Raises answered (tele outcomes, link kind): armed accepted **69**
/ refused 0 / expired 5 / staged 75; control accepted **158** /
0 / 20 / 179. The control leg "answered" more raises only
because the blocked tables kept generating them: 179 staged vs
75 — once links form, the pipeline drains (a village already
linked raises no more). Second-link raises alone: armed 53
accepted / 3 expired / 57 staged; control 134 / 16 / 151.

The twelve no-counter seeds are byte-identical between legs on
every headline number (days, standing, links, talks, turns,
deaths) — the lever is a strict no-op where no counter is
pending, which is the isolation the prereg designed for. The
only trajectories that move are the four counter seeds, and they
move exactly where the lever acts.

## Before / after on identical seeds (16 seeds, 150d)

| Seed | Armed: days / end | Armed 2nd link | Armed counter | Control: days / end | Control 2nd link | Control counter |
|------|-------------------|----------------|---------------|---------------------|------------------|-----------------|
| 150217 | 70 / village-lost | YES | 0 fresh, 0 blocked | 70 / village-lost | YES | 0 fresh, 0 blocked |
| 150218 | 68 / village-lost | YES | 0 / 0 | 68 / village-lost | YES | 0 / 0 |
| 150219 | 150 / survived | YES | 1 fresh, 0 blocked | 145 / village-lost | YES | 1 fresh, 24 blocked, STALLED |
| 150220 | 124 / village-lost | YES | 1 / 0 | 113 / village-lost | no | 1 fresh, 29 blocked, STALLED |
| 150221 | 119 / village-lost | YES | 1 / 0 | 150 / survived | no | 1 fresh, 31 blocked, STALLED |
| 150222 | 150 / survived | YES | 0 / 0 | 150 / survived | YES | 0 / 0 |
| 150223 | 150 / survived | YES | 1 / 0 | 150 / survived | no | 1 fresh, 21 blocked, STALLED |
| 150224 | 104 / village-lost | YES | 0 / 0 | 104 / village-lost | YES | 0 / 0 |
| 150225 | 142 / village-lost | YES | 0 / 0 | 142 / village-lost | YES | 0 / 0 |
| 150226 | 138 / village-lost | YES | 0 / 0 | 138 / village-lost | YES | 0 / 0 |
| 150227 | 150 / survived | YES | 0 / 0 | 150 / survived | YES | 0 / 0 |
| 150228 | 150 / survived | YES | 0 / 0 | 150 / survived | YES | 0 / 0 |
| 150229 | 116 / village-lost | YES | 0 / 0 | 116 / village-lost | YES | 0 / 0 |
| 150230 | 150 / survived | YES | 0 / 0 | 150 / survived | YES | 0 / 0 |
| 150231 | 138 / village-lost | YES | 0 / 0 | 138 / village-lost | YES | 0 / 0 |
| 150232 | 150 / survived | YES | 0 / 0 | 150 / survived | YES | 0 / 0 |

Second links formed (any village beyond the first link, ever):
armed 16/16, control 13/16. First-link source: raise 13 /
ladder 3 on BOTH legs (identical).

## Cost bar: PASS (per-day form, judged as written)

- Deaths per 100 village-days: armed **78.06** (1,615 deaths /
  2,069 village-days) vs control **75.05** (1,564 / 2,084); cap
  control + 10% = 82.55. PASS.
- Starvation deaths: armed **2** vs control **2** (cap +2). PASS.
- Arm-only starvation (armed starvation on seeds where control
  starvation = 0): **0** vs cap 2 (control total). PASS.
- Median survival: armed **140d** vs control 143.5d (floor 0.8x =
  114.8). PASS.

The one wrinkle, reported honestly: 150221 armed died at day 119
(village-lost, standing 515, wave 5) while its control survived
to 150d (standing 995, wave 5) — the only seed where the armed
leg ends sooner by a wide margin, and the mirror of the pilot's
150204. The death-cause mix says trajectory divergence, not
lever harm: armed 102 deaths over 119 days (0.86/day) vs control
102 over 150 (0.68/day) — the armed leg's daily rate is higher
here, but the band totals are dominated by the same ordinary
kinds (combat 514 vs 491, villager combat 492 vs 502,
expedition 412 vs 391, the wild 82 vs 70, monster 41 vs 32,
zero starvation difference), and the sweeten's re-judgment draw
on day 7 splits the RNG stream from control, so every later draw
differs. The bar as pre-registered (per-day rate, starvation,
median) passes, and the seed-level story is disclosed here
rather than hidden behind the band totals. 150219 runs the other
way (armed survived 150, control died 145), which is why the
band medians sit within 3.5 days of each other.

Death causes (both legs combat-dominated, starvation 2 vs 2):
armed — combat 514, villager combat 492, expedition 412, the
wild 82, monster 41, a stranger 11, a wound that wouldn't close
9, contest 9, alien 8, thirst 6, ambush 5, the night 4, the
arena 4, dehydration 3, sickness 2, starvation 2, Old Stare 2,
the phoenix link 2, betrayal / The Paparazzo / Ugly-Eyes / The
Reunion / The Focus Group / Choir Toad / White Noise 1 each;
control — villager combat 502, combat 491, expedition 391, the
wild 70, monster 32, a wound that wouldn't close 14, alien 10,
a stranger 9, contest 7, thirst 6, ambush 6, the night 4,
dehydration 3, sickness 2, The Reunion 2, the arena 2,
starvation 2, Old Stare 2, the phoenix link 2, The Callback /
betrayal / The Paparazzo / Ugly-Eyes / The Focus Group / Choir
Toad / White Noise 1 each. No cause moved alarmingly; the armed
leg's excess is plain combat +23, expedition +21, the wild +12,
monster +9, offset by fewer villager-combat (−10) and wound
(−5) deaths.

## Reachability verdict

- Second links: armed 16/16, control 13/16 — reachable on every
  seed once counters close. The counter wall is closed on a
  fresh band, not just the pilot's.
- Polities (one primary + ≥3 seasoned subordinates, SCALE.md):
  armed polityEver 14/16, control 11/16; seasoned-links max 5
  both; max links armed 10 vs control 6.
- National / table / wins: **0/16 on both legs**. Wave-4 unlocks
  16/16 both legs; wave-5 unlocks 14/16 both legs. The scale wall
  stands above this fix: the counter-close moves second links
  (the polity layer), and the seat itself is still unreached.
  Standing: armed 165–810, control 165–995.

## Village assessment (plain words)

Picture sixteen villages as sixteen small fires trying to grow
into a region. On twelve of them nothing changed at all — the
same days, the same links, the same endings, because no counter
ever appeared and the new habit had nothing to answer. On the
other four, the story finally completes. A villager walks up
with an idea — "let's tie ourselves to Emberhold" — the scholar
sits down and says yes, and the other village answers, in
effect, "not on those terms — here's our price." This time
somebody goes back to the table. On all four seeds the pantry
was full enough that the scholar paid a small gift of food
(1,500 kcal, a rounding error against a full pantry) and the
village agreed to the original terms. Four villages grew from
one fire to three, five, nine, and four linked fires. The table
is never left waiting again: four village-days of waiting on the
armed leg, against 513 on the control.

One village still dies young, and it is one that grew: 150221
formed its links and then lost its fights at day 119, while its
twin that never grew at all survived the season at the highest
standing on the board. It died fighting, not starved, not bled
by tribute. Growing did not save it; not growing did not doom
the other. The road past regional is open on all sixteen seeds
now, but nobody has walked it to the national seat, let alone
the table.

## Sense-test (SENSE-TESTING LAW)

The counter-stage line is captured this time — the confirm
driver's say-wrap fix worked where the pilot's missed it. All
four counter seeds, both legs, word for word:

"⛓️ Thornfield doesn't say no. They say: \"They won't bow to
Haven. But they'll TAKE Haven — 5,000 kcal/week, them primary.
That's the offer.\" The table is set — accept their terms,
sweeten the offer, or walk away."

It reads like a real negotiation: a refusal of the terms, not of
the relationship, with a concrete price and three named ways
forward. The formation lines that follow name the carrier —
150219 d10 Hugo brings Stonebridge home, d13 Oliver brings
Thornfield; 150220 d7 Tashi brings Emberhold — and keep Haven's
terms: "bows to Haven — one organization, us primary. Tribute:
4,000 kcal/week. The relationship starts at trust 30.
Everything from here is earned."

Two wrinkles, both disclosed:

1. The sweeten line itself ("The gift talks. … reconsiders —
   at YOUR terms.") is STILL not in the captured say-lines:
   the driver's say-wrap regex gained `counter|sweeten|table is
   set`, which catches the stage line, but the sweeten line
   contains none of those words ("gift talks", "reconsiders"),
   so it was never recorded. The mechanism is proven by the
   instrument records instead (4 answer calls with day, target,
   pantry before/after, result) — the words were said in the
   engine (answerCounter's say calls fire on the same code path
   the proof test exercises), but this corpus cannot quote them.
   A future instrument should add 'gift|reconsiders' to the
   say-wrap. The pilot's wrinkle is half-fixed: stage line yes,
   sweeten line still no.
2. The formation line still repeats verbatim per link (same
   sentence, same tribute, same trust 30) — the template
   repetition talkturn-a flagged, now more audible at 65
   formations. And the walk path says nothing in the moment
   beyond the engine's walk line; no walk fired on this band, so
   there is nothing new to quote.

No robotic queue-draining: each answer has a named village, a
staged day, a pantry reading at decision time, and a formation
line with real terms.

## Balanced panel (§15)

Built from this checkout with the harness live on both panels
(COMPETENT_TALK=1 + RAISER_SEAT=1), competent policy, the 16
confirm seeds 150217–150232, 150d; before = COUNTER_ANSWER unset,
after = COUNTER_ANSWER=1, declared as the intervention flag
(`--intervention-flags COUNTER_ANSWER`). Compare:
evidence/2026-11-10/counterconfirm-panel-compare.md — decision
**review_required**; panels:
evidence/2026-11-10/counterconfirm-panel-before.json.gz and
counterconfirm-panel-after.json.gz (16 paired cases each, 0
errors). The review_required is carried by regression_watch rows
only — no regression_signal anywhere: village deaths per run
97.75 → 100.94 (+3.19, interval 0 to 7.56), deaths per 100
calendar days 75.76 → 78.38 (+2.62, −0.07 to 5.52), player deaths
per run 6.06 → 7.06 (+1, −0.06 to 2.69), first bearer through
day 60 0.4375 → 0.25 (−0.1875, −0.375 to 0). Table win/entry/
sitting and national access all 0 → 0. The deaths/100d move
matches the corpus cost bar (+3.0 on the same seeds) and sits
inside the pre-registered +10% cap; the player-death and
first-bearer moves are the same RNG-stream divergence the 150221
seed shows — the sweeten's re-judgment draw splits the stream,
so every later draw differs on the two legs. The luck-percentile
rows read coverage_changed / insufficient on 7–13 of 16 pairs
for the same reason (trajectories diverge, so luck coverage
moves). Per §15 the panel is evidence, not the judge: it does
not override the pre-registered GO. The investigation note is
recorded here: the armed leg costs ~3% more deaths per day and
~1 more player death per run on this band, inside the cost bar,
with no win / national / table movement either way. Table reach
(raw, display only): invitations 16/16 → 16/16, sittings 0/16
→ 0/16.

## Metric review

1. The primary bar held up on a fresh band: 16/16 vs 13/16
   separates exactly on the counter seeds, the mechanism (fresh
   counter → answer next day → formed, zero blocked re-knocks)
   is visible in the corpus, reconciliation went 0 bad with zero
   instrument errors, and the twelve no-counter seeds are
   byte-identical between legs — the isolation is proven, not
   assumed. No bar needs lowering.
2. The counter-stall class is now measured on 16 seeds: 4
   stalled on control, 0 on armed, 513 vs 4 pending-counter
   days. The fresh-vs-blocked split (4 fresh, 105 blocked) is
   the number that matters; a raw 'counter' return count would
   have read 109 and hidden the mechanism.
3. The cost bar's per-day form behaved as designed: the armed
   leg lived 15 fewer village-days but died at a daily rate
   within 4% of control, and the raw totals (1,615 vs 1,564)
   would have passed the +10% cap on their own terms too — the
   per-day read is the honest one either way. Keep it.
4. The say-wrap regex gap (sense-test wrinkle 1) persists in a
   narrower form: the stage line is captured now, the sweeten
   line is not. Next instrument should add 'gift|reconsiders'
   to the say-wrap. The verdict does not rest on the words —
   the instrument records carry the mechanism — but the
   sense-test is thinner than the prereg intended for exactly
   the line this arm cares about most.
5. The decline-null class still needs a name (carried from the
   pilot): the instrument lumps four distinct null returns
   (shut door opinion ≤ −20, already-linked, unknown village,
   judged decline <35) into 'declined-null'. Counts stayed
   small and verdict-neutral here (0 declined both legs).
6. The walk path was not exercised on this band (all four
   pantries rich at answer time). The walk is proven by the
   pilot only. A future confirm on a thinner band — or a
   targeted probe — should exercise it again before anyone
   calls the answer pair fully proven.

## Infrastructure notes

- Adoption: the 2215Z run died after the corpus landed; this
  run verified all 32 cells (parse, non-empty,
  instrumentErrors 0, anchor c26d50a25) and re-ran the analyzer
  from the committed script. No cell was re-run, no file
  overwritten.
- The first balanced-panel build (before-panel) died with its
  exec session (~7 min in, no output, no cases dir — the session
  vanished, same signature as the pilot's runtime restart).
  Re-ran it detached via nohup with a log file
  (/tmp/cc-panel-before.log); it then saved 16 cases clean, and
  the after-panel saved 16 cases clean the same way. Panel
  compare decision review_required (see §15 section above);
  validity errors none.
- Telemetry deviation check (body step 10): `telemetry-check.js`
  REFUSED the corpus — all 32 per-seed rows carry top-level
  anchorCommit, so they are sweep recorder rows, not runs, and
  the tool compares recorder corpora with sweep-compare tables,
  never against a run baseline. Not forced with
  --allow-recorder-corpus and the scale-wall baseline was NOT
  re-seeded from this corpus (that would corrupt a run baseline
  with recorder rows). The balanced-panel compare above is the
  §15 instrument for this arm; no LOUD lines exist to report.
- The RAISER_SEAT +35 signal stays DEAD (NO-GO, reverted,
  revert-pinned in the proof). The counter-close does not
  rescue it and does not re-test it: the seat signal answers
  raises, the counter answer closes the negotiation — different
  jobs, and only the second landed here. The driver still sets
  RAISER_SEAT=1, but after the revert re-running it will NOT
  reproduce the confirm's armed leg — the committed corpus is
  the record of what ran.
- Rebase: the first `git rebase <explicit-SHA>` attempt failed to
  start ("could not detach HEAD", editor/lock-flavored error) with
  no lock file present and a clean tree — transient, same signature
  as a stale lock from a concurrent sibling git operation. Retried
  immediately: all 3 commits replayed cleanly, no stops, no
  conflicts, onto explicit master SHA
  ed33b42b8c8d2f160635b07ed5c990e11d9019de (read in the main tree
  immediately before rebasing; master had not moved again after
  the rebase — re-verified ed33b42b8). New tip a581b3778. Proof
  re-run green after the rebase: test-counterconfirm-a.js 17/17
  and test-counterclose-a.js 17/17.

## What remains

- This arm: GO. The lever (COUNTER_ANSWER, policy-side,
  env-gated, default off) is a landing candidate. Landing it as
  the competent default vs keeping it env-gated is a
  coordinator/Steve call: COUNTER_ANSWER=1 is bot behavior, not
  a game change — making held-conversation counter-answering
  the default competent behavior is a policy decision, not a
  src/js change. The confirm owed by the pilot is now
  discharged: pilot GO (8 seeds) + confirm GO (16 fresh
  seeds) on the same primary under the same cost bar.
- The RAISER_SEAT +35 signal stays DEAD (NO-GO, reverted,
  revert-pinned in the proof).
- The scale wall is unchanged by this arm: national 0/16, table
  0/16, wins 0/16 on both legs. The counter-close moves the
  polity layer; the seat above it is still unreached.
- Findings-backlog item carried (2026-11-10,
  scale-onramp/counters): raises keep staging for a shut-door
  village (opinion ≤ −20) — the staging gates don't read
  opinion. No new backlog item from this confirm.
