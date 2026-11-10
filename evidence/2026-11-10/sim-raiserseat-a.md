# Raiser-seat arm — EVIDENCE (arm sim-raiserseat-a)

Run: fleshout-20261110T1815Z (Loop A, adoption of the stranded 1415Z arm).
Prereg: evidence/2026-11-10/sim-raiserseat-a-prereg.md (committed BEFORE any
judged computation, 83948a3bd). Build: 4104597b7 (pending-raise signal in
talkScore, +35, RAISER_SEAT=1, answerability-gated; driver/analyzer/proof,
proof 15/15). Base at prereg time a80b2d789; master has since moved to
e5c19e54e (roleform-b) — rebase recorded below.
Corpus: evidence/2026-11-10/perseed-raiserseat-a/ (16 cells, seeds
150201–150208 identical on both legs, COMPETENT_TALK=1 both legs, 150d
death-aware). Analyzer: scripts/raiserseat-analyze-20261110.js;
summary: evidence/2026-11-10/raiserseat-summary-raiserseat-pilot.json.

## Verdict: NO-GO — arm killed at pilot, do not land

Primary metric (conjunction, judged strictly as pre-registered):
(a) second links formed: armed **6/8** (via raise 18) vs control **7/8**
(via raise 20) — armed is BELOW control, so half (a) FAILS.
(b) 150206-class seeds eliminated: armed **0**, control **1** (150206
itself: 28 stagings, 0 picks) — half (b) PASSES, and the class genuinely
reproduced on the control leg, so the elimination was tested, not vacuous.
GO required both halves. (a) missed, so the verdict is NO-GO. The +35
signal does NOT land. No confirm run is owed; the reserved band
150209–150216 stays reserved for tendexact-a, untouched by this arm.

## The lever played

Policy-side only, zero src/js: a villager with an answerable pending link
raise (commLevel not 'none') gets +35 in `talkScore` when the scholar
picks the two daily conversation seats. Env gate RAISER_SEAT=1, default
OFF. The control leg is the talkturn-a policy verbatim (flag unset).

## Before / after on identical seeds (8 seeds, 150d)

| Seed | Armed: days / end | Armed links / picks | Control: days / end | Control links / picks |
|------|-------------------|---------------------|---------------------|-----------------------|
| 150201 | 150 / survived | 6 links, 6 picks | 143 / village-lost | 7 links, 6 picks |
| 150202 | 149 / village-lost | 5 links, 5 picks | 91 / village-lost | 4 links, 4 picks |
| 150203 | 150 / survived | 5 links, 4 picks | 116 / village-lost | 4 links, 4 picks |
| 150204 | 80 / village-lost | 1 link, 29 picks | 110 / village-lost | 5 links, 4 picks |
| 150205 | 150 / survived | 3 links, 3 picks | 150 / survived | 3 links, 3 picks |
| 150206 | 150 / survived | 1 link, 27 picks | 150 / survived | 1 link, 0 picks |
| 150207 | 150 / survived | 4 links, 4 picks | 150 / survived | 4 links, 4 picks |
| 150208 | 137 / village-lost | 2 links, 2 picks | 75 / village-lost | 2 links, 2 picks |

Second links formed (any village beyond the first link, ever): armed 6/8,
control 7/8. First-link source: armed raise 6 / ladder 2; control raise 7 /
ladder 1.

Raises answered (tele outcomes, link kind): armed accepted **80** / refused
0 / expired **2** / staged 82; control accepted 27 / refused 0 / expired
**65** / staged 93. Second-link raises only: armed 68 accepted / 2 expired
/ 70 staged; control 20 / 58 / 79.
Talk mechanism: link picks armed 80 vs control 27; talks with a raiser
pending 94 vs 57; held talks 3,348 vs 2,962; turns 10,686 vs 8,806.
Pending-raise census: armed 86 pending-raise days (80 answerable, 6
unanswerable) vs control 195 (186 answerable, 9 unanswerable) — the armed
leg drains the queue instead of letting it sit.

The signal did exactly what it was built to do: the scholar sat with
raisers and answered their raises instead of letting them expire. What it
did NOT do is form links — and that is where the verdict comes from.

## The counter wall (why 6 < 7)

An accepted raise is not a link. Accepting calls `acceptLinkRaise` →
`proposeLink`, and the village can answer with a counter instead of
forming the link. On two armed seeds every single propose came back
'counter' and the competent policy never answers a pending counter:

- 150204 armed: 29 stagings, 29 picks, 29 accepted — **29/29
  'accepted->counter', 0 formed**, village lost day 80 with 1 link.
  Control on the same seed: 11 stagings, 4 accepted->formed, 7 expired —
  5 links, second links formed.
- 150206 armed: 27 stagings, 27 picks, 27 accepted — **27/27
  'accepted->counter', 0 formed**, 150 days with 1 link. Control: 28
  stagings, 0 picks, 27 expired — the 150206-class exemplar, also 1 link.

56 of the 80 armed accepts stalled at the counter. `pending.counter`
stays true to the last daily snapshot on both seeds. The other six armed
seeds converted accepts to links cleanly (accepted->formed 6/5/4/3/4/2).
So the seat signal moved the blocker downstream: from "the raiser never
gets a seat" to "the raise gets answered, the village counters, and
nobody ever answers the counter." Filed as a findings-backlog item
(sim-findings.md, 2026-11-10, scale-onramp/counters). The next step is
NOT a bigger bonus or the seat-hold the prereg held in reserve — it is
finding why these seeds counter every propose while others form, and
teaching the policy to answer counters. A seat-signal re-test before
counters close would re-prove the same wall.

## Cost bar: PASS (per-day revision, judged as written)

- Deaths per 100 village-days: armed **66.85** (746 deaths / 1,116
  village-days) vs control **70.66** (696 / 985); cap control + 10% =
  77.73. PASS.
- Starvation deaths: armed **0** vs control **0** (cap +2). PASS.
- Arm-only starvation (armed starvation on seeds where control starvation
  = 0): **0** vs cap 0. PASS.
- Median survival: armed **150d** vs control 129.5d (floor 0.8x = 103.6).
  PASS.
- Note the raw totals: armed 746 deaths vs control 696 — the old
  raw-total clause would have failed this arm, which is exactly the
  twice-proven defect the prereg's per-day revision corrects for: the
  armed villages lived 131 more village-days, so they accumulated more
  deaths at a LOWER daily rate. Judged on the per-day bar as
  pre-registered, the cost bar passes. The cost bar does not rescue the
  primary miss — a passing cost bar with a failing primary is still NO-GO.

Death causes (both legs combat-dominated, starvation zero): armed —
villager combat 244, combat 259, expedition 155, the wild 45, monster 12;
control — villager combat 238, combat 206, expedition 165, the wild 47,
monster 10. No cause moved alarmingly; the armed leg's extra deaths are
combat + expedition on longer-lived villages.

## Reachability verdict

- Second links: armed 6/8, control 7/8 — reachable, but the armed leg
  REGRESSED on the two counter seeds. Not a reachability gain.
- Polities (one primary + ≥3 seasoned subordinates, SCALE.md): armed
  polityEver 4/8, control 6/8; seasoned-links max armed 5, control 4.
- National / table / wins: **0/8 on both legs**. Wave-4 unlocks 8/8 both
  legs; wave-5 unlocks armed 6/8, control 7/8. The scale wall stands:
  villages reach regional and fight wave 5, but none climbs to national,
  let alone the table. The seat signal was never going to move the wall
  by itself — it moves second links, and the wall sits above that — but
  it did not even hold the second-link ground.
- Standing: armed 125–685 (median ~472), control 199–585.

## Village assessment (plain words)

Picture the eight villages as eight small fires trying to grow into a
region. On six of them the fix worked the way you would hope: a villager
walks up with an idea — "let's tie ourselves to Ashford" — and instead
of the idea dying unheard while the scholar chats with strangers, the
scholar sits down with them the next morning and says yes, and a new
fire joins. Those villages end the season with three to six linked
fires, tribute coming in, the regional dawn behind them.

On two fires the same story curdles. The villager raises the idea, the
scholar sits and says yes — and the other village answers, in effect,
"not on those terms, here's our price." And then nobody ever goes back
to the table. The price sits unanswered for the rest of the season while
the village keeps staging the same ask, twenty-seven times on one seed,
and every time the answer is the same counter, unanswered. The village
stays one fire for 150 days, strong enough to survive (standing 635 on
150206, the highest of the control leg's survivors is 585) but never
growing. The people are not the problem — they keep asking. The
follow-through is: nobody closes a negotiation.

The villages that died, died fighting: combat and expeditions, not
hunger. Nobody starved on either leg. Villages lived longer on the armed
leg (median 150 days vs 129.5) and still died at the same daily rate —
the extra days were real life, not borrowed time.

## Sense-test (SENSE-TESTING LAW)

Read the answered raises on armed 150201. Day 9 a villager stages a
raise for Ashford; day 10 the scholar sits with them twice
(pendingRaise:true on both sittings) and picks `link:accept`. The
say-log that day:

> "⛓️ Smita brings it home: Ashford bows to Haven — one organization, us
> primary. Tribute: 4,000 kcal/week. The relationship starts at trust 30.
> Everything from here is earned."
> "📓 Codex: First link formed with Ashford. The gesture goes out now;
> the Dawn waits for seasons."

Day 12 the same shape repeats for Stonebridge (Yara's raise, accepted):
"Smita brings it home: Stonebridge bows to Haven — one organization, us
primary." It reads like people: an ask, a sitting, a yes with terms
attached, a record in the Codex. Two wrinkles, both small:

1. The formation line credits "Smita" while the raiser who staged the
   ask was a different villager (gen_pa5kfx6 for Ashford, Yara Haddad
   for Stonebridge). Smita reads as the representative who carries the
   answer home — plausible, but the villager who did the asking is never
   named in the moment their idea lands. Worth a voice pass someday,
   not a blocker.
2. Peyton's "Why are YOU giving orders?" line repeats verbatim on days
   3, 7 and 10 — a thin small-talk pool showing through, same class of
   repetition already filed in the findings backlog for other lines.

No robotic queue-draining: each accepted raise has a named village, a
staged day, a sitting, and a formation line with real terms.

## Metric review

1. The primary bar's half (a) compares second-link COUNTS, but the
   signal acts on ANSWERING. On this band answering and forming came
   apart: 56 accepts never became links. The bar judged the outcome
   (links), which is the right judge — a signal that answers without
   forming has not earned a landing — but the next run's bar should add
   a counter-stall diagnostic as a first-class metric: accepted->counter
   count per seed, and pending-counter days at end. The 150206-class
   definition (≥10 stagings, 0 picks) is now measuring the wrong
   failure: the class was eliminated (0 picks → 27 picks) while the
   seed still formed no second link. Propose for the next run: a
   "counter-stalled seed" class (≥10 accepted raises, 0 links formed)
   alongside the pick-based class.
2. Half (b) was genuinely tested: the control leg reproduced the class
   (150206: 28 stagings, 0 picks), so the elimination claim is not
   vacuous. The contingency in the prereg did not trigger.
3. The cost bar's per-day revision behaved as designed (see Cost bar):
   raw totals would have failed an arm whose daily death rate fell.
   Keep the per-day form.
4. One seed (150207) is a control on the signal's scope: the armed
   trajectory is byte-identical to control except mode/seatFlag — the
   raiser was already seated on all 4 pending days in both legs, so the
   signal was redundant there. A +35 bonus is a no-op where the raiser
   already ranks in. That bounds the signal's effect to seeds where the
   raiser is actually crowded out, which is the intended population.
5. The prereg's reserved next step (seat-hold or larger bonus) is NOT
   recommended: the residual failure is downstream of seating. Do not
   spend the next run re-testing seat priority.

## Infrastructure notes

- Adoption: the 1415Z worker died mid-sweep with 6/16 corpus files, all
  control (150201–150206). All 6 verified valid on adoption (parse,
  seatFlag null, instrumentErrors 0, anchor 4104597b7f13) and kept.
- Runtime restart during this adoption run killed both armed driver
  processes ~9.5 min in (sessions proc_208a63c0c8ed,
  proc_51de4feefaa7, no confirmed final result). Disk check showed 4
  armed files had landed complete and valid (150201, 150202, 150205,
  150206 — seatFlag 1, instrumentErrors 0); re-ran ONLY the missing 4
  armed cells (150203, 150204, 150207, 150208) with the committed
  driver. No file was overwritten; no cell was double-run.
- Heartbeat command took ~103s wall (CPU contention with three sim
  processes), succeeded. No EPERM flap observed; no index clobber.
- Master moved during the run (a80b2d789 → e5c19e54e, roleform-b
  landed by Loop B). Rebase onto the explicit master SHA recorded in
  the commit below; proof re-run green after the rebase.
- Confirm band 150209–150216: NOT spent. NO-GO → no confirm owed;
  the band stays reserved for tendexact-a.

## What remains

- This arm: killed, do not merge the +35 signal. The branch holds the
  prereg, the build, the corpus, and this evidence for the record.
- Next work (not this arm): the counter wall — why 150204/150206
  counter every propose, and a policy that answers pending counters.
  Filed in sim-findings.md (open, 2026-11-10, scale-onramp/counters).
- The scale wall is unchanged by this arm: national 0/8, table 0/8,
  wins 0/8 on both legs.

## Coordinator closeout addendum (run fleshout-20261110T1915Z, Loop A)

STALE-LOCK RECOVERY: the 1815Z run died before merging (registry
heartbeat 40 min stale, no live processes). This closeout lands the
NO-GO record on master with the lever reverted — per loop precedent,
killed-arm evidence lands as record (cf. sim-answermail-drive-a.md,
sim-bindingtrace-b.md) while the lever itself leaves no trace:

- The +35 raiser-seat signal was reverse-applied out of
  scripts/policies/competent.js (41 deletions; no RAISER/raiserSeat
  references remain). RAISER_SEAT is now a no-op env var.
- scripts/test-raiserseat-a.js was rewritten to pin the REVERTED state
  (flag on == flag off on talkScore even with a pending raise; the
  raiserSeatOn / RAISER_SEAT_BONUS exports are gone; pickTalkTargets
  order unchanged by the flag) plus the unchanged analyzer / cost-bar /
  driver / live legs. Proof 11/11 green post-revert (was 15/15 with
  the signal live).
- The driver (raiserseat-driver-20261110.js) is kept as the historical
  record of how the committed corpus was produced; it still sets
  RAISER_SEAT=1 on the armed leg, but the flag no longer does anything,
  so re-running it will NOT reproduce the armed leg. The committed
  corpus is the record of the armed leg.
- The counter-wall follow-up is arm sim-counterclose-a in this same
  run (diagnose the counter-every-propose seeds, teach the policy to
  answer pending counters).
