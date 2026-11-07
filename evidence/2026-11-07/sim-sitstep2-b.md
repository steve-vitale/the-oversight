# sim-sitstep2-b — the sit step, once a seat exists: the offer is ready, the scholar is home, and nobody sits — DIAG-NO-GO (substrate guard)

**Arm:** sim-sitstep2-b (run fleshout-loop-b-20261107T1230Z, axis
scale-onramp / winnability chain) · **DIAG only, zero src/js, zero
policy edits:** replay the frozen linkdrive substrate
(`scripts/policies/competent-linkdrive-b.js`, unmodified) on band
53001–53008 with a sit recorder (the sitstep instrument, reused
verbatim, plus driver-side scholar-availability and sit-verb-msg
extensions). **Verdict: DIAG-NO-GO — on the frozen substrate guard
only.** The first-blocking sit mechanism IS named on 4/4 seeds that
earn a seat offer, with per-day gate state in the corpus, and
instrument errors are 0 — but the frozen guard fails: median survival
is 106.5d against the guard floor of 108.5d, driven entirely by one
seed (53008) whose trajectory flipped on the new master (150d
survived → 95d lost). Per the prereg, a moved substrate is NO-GO
and the divergence — not a re-cut number — is the finding. The
mechanism naming below is reported in full anyway, as the prereg
requires.
**Band:** 53001–53008 DELIBERATELY REUSED (a re-run, not a fresh
band) · **Horizon:** 150d death-aware · **Legs:** linkdrive-armed
replay only (8 files — the linkdrive corpus IS the comparison
baseline; no staged leg, staged earns no seats) · **Corpus:**
`evidence/2026-11-07/perseed-sitstep2-b/` (8 files, base 2016a7ed0,
0 instrument errors) · **Prereg:**
`evidence/2026-11-07/sim-sitstep2-b-prereg.md` (committed 33c8a882a
before any judged sim) · **Proof:**
`scripts/test-sitstep2-20261107.js` 30/30 green before the judged
run (extended-classifier fixtures + live 53004 smoke leg, which
reproduces linkdrive exactly) · **Analyzer:**
`scripts/sitstep2-analyze-20261107.js` (analysis at
`/tmp/sitstep2-analysis.json` — working copy, the evidence file is
the record).

**The one-line result, plainly:** the seat is offered, announced out
loud, ready, and the scholar is standing at Haven — and nobody sits,
because sitting is a player-only action no policy ever performs. On
75 preview-ready days across three seeds, the scholar was at Haven
and alive on all 75, the sit verb was called 0 times, and the table
never sat. The fourth seat-earning seed died the day before the
table was allowed to exist. And on the four seeds that never earned
a seat, exactly one bar is missing now: the feast surge, never spent
in a real fight.

## The first-blocking mechanism, per seed

First in TIME order over the seat window, with the dominant gate over
the post-floor seat window alongside. Per-day gate state is in the
corpus (`seatGateSeq` per seed); the tallies below are the summary.

| Seed | Seat | First seat day | Seat days | First-blocking (time order) | Post-floor dominant | Ready days | Scholar @ Haven on ready days | Sit calls |
|---|---|---|---|---|---|---|---|---|
| 53003 | lesser | d108 | 45 | no-preview-waiting, 1 day (Arc IV 1-day lag) | **offer-not-taken, 25 days** | 25 | 25/25, alive 25/25 | 0 |
| 53004 | lesser | d37 | 103 | **floor-day90, 53 days** | **offer-not-taken, 26 days** | 26 | 26/26, alive 26/26 | 0 |
| 53005 | lesser | d83 | 36 | **floor-day90, 7 days** | **offer-not-taken, 24 days** | 24 | 24/24, alive 24/24 | 0 |
| 53006 | lesser | d64 | 25 | **floor-day90, all 25 days** | — (0 post-floor seat days) | 0 | — | 0 |
| 53001 | none | — | 0 | no-seat: feast surge only | — | 0 | — | 0 |
| 53002 | none | — | 0 | no-seat: feast surge only | — | 0 | — | 0 |
| 53007 | none | — | 0 | no-seat: feast surge only | — | 0 | — | 0 |
| 53008 | none | — | 0 | no-seat: feast surge only | — | 0 | — | 0 |

Per-seed gate tallies on seat days (they sum to the seat-day count):

- **53003 (45):** offer-not-taken 25, entry-blocked 19 (all
  "Finish the current encounter before taking your seat."),
  no-preview-waiting 1. First preview d109, first ready d113,
  announced d109.
- **53004 (103):** floor-day90 53, offer-not-taken 26,
  entry-blocked 24 (23 encounter + 1 "This expedition has
  ended."). First preview d90, first ready d93, announced d90.
- **53005 (36):** floor-day90 7, offer-not-taken 24,
  entry-blocked 5 (4 encounter + 1 ended). First preview d90,
  first ready d90, announced d90.
- **53006 (25):** floor-day90 25. Preview never surfaced,
  announced never, village died d89 — one day before the floor.

**Total: 75 preview-ready days, scholar at Haven and alive on
75/75, sit verb called 0 times, tableChoices never surfaced,
tableDone never set.** The entry-blocked days (48 total, 46 of
them the encounter block) are the other half of the seat window —
but they are not the binding mechanism: 75 ready days went unsat,
and the block itself is transient (the snapshot is once-daily,
after `policy.daily`, so a day counted entry-blocked may have
been ready at another hour — the 75 ready days are a lower bound
on sittable days, and the mechanism stands regardless).

## Why nobody sits: the verb is never issued

The competent/linkdrive policy contains no sit drive at all. Grep
over `scripts/policies/`: neither `competent-stageally-a.js` nor
`competent-linkdrive-b.js` calls `tableTakeSeat`,
`tableOfferSeatTaker`, `tableChooseSeatTaker`, or
`chooseTableOption` (only `capable.js` / `modalplay.js` /
`nowinwindow.js` — other policy families — reference the verbs).
The recorder confirms it live: `sitAttempts` 0 and `sitVerbMsgs`
0 on all 8 seeds, including all 75 ready days. This is the same
shape as sitstep-b's "untested, not failed" — now measured on
seeds where the seat exists: the sit action is untested because
no policy attempts it, not because any gate refuses it. Whether
a bot policy SHOULD sit is a design question (only the player
chooses the path and the sitter — Steve 2026-10-26), not a defect
claim: the game offers the seat correctly, and the measurement
instrument standing in for the player never takes it.

## The candidate mechanisms, checked off

- **Seat never offered?** No — the seat was earned on 4/8 seeds
  and announced aloud on 3 of them (53003 d108 by the Arc IV
  re-fire line, 53004/53005 d90 by "THE TABLE IS SET"). The
  fourth (53006) died before the floor.
- **Offer expired before the scholar could answer?** No — there
  is no expiry mechanism in the code (sticky offer, Steve
  2026-11-06), and the corpus shows 0 dip-while-announced days
  on every seed: no earned seat ever dipped while announced.
- **Scholar absent/unavailable?** No — on all 75 ready days the
  scholar was at Haven (`playerAtHaven()`) and alive, with
  seat-taker options present. Scholar absence blocks 0 ready
  days.
- **Sit verb never called?** YES — the mechanism on all three
  post-floor seat seeds: 75 ready days, 0 calls.
- **Gate unmet?** On the four no-seat seeds, exactly one gate:
  the food-thesis deed "feast surge never spent" (all other
  lesser bars met at end-state, scale regional included). The
  full-seat shortfall names national standing on all 8 seeds
  (53004/53005 need national only; 53003 national + 1 more
  wave-5 type; 53008 national + the surge).

## Substrate reproduction — the guard that failed

Replay vs linkdrive armed leg (base 7100412b8), identical seeds:

| Headline | Linkdrive armed | This replay | Guard |
|---|---|---|---|
| Regional | 8/8 | **8/8** | ✓ |
| Links formed | 41 | **41** | ✓ (exact) |
| Lesser seats | 4/8 | **4/8** | ✓ |
| Median survival | 128.5d | **106.5d** | ✗ (floor 108.5d) |
| Survived | 3/8 | 2/8 | — |
| Wave-5 unlocks / faced | 4/8 / 4/8 | 4/8 / 4/8 | ✓ |

Per-seed, 7/8 seeds reproduce linkdrive EXACTLY (days, end,
standing, maxWave, wave-4+ kills): 53001 150/175/0, 53002
79/125/0, 53003 150/380/4, 53004 139/350/4, 53005 118/485/8,
53006 89/199/2, 53007 86/99/0. Only 53008 moved: 150d survived,
standing 325, 5 kills → 95d village-lost, standing 275, 4 kills
(−55d). With 53008 at its linkdrive value the median would be
exactly 128.5d; the single flip moves the 8-seed median by 22
days. That is the whole guard failure: one fragile trajectory,
not a systematic substrate shift.

**Attribution (verified, not assumed):** the flip is
master-caused, not recorder-caused. The ORIGINAL linkdrive driver
(`scripts/linkdrive-driver-20261107.js`, POLICY=linkdrive) re-run
on 53008 on this master gives the SAME 95d / village-lost /
standing 275 / 4 kills (`/tmp/sitstep2-verify53008/`, 0
instrument errors, networkLive d30, everLinks 4). The recorder
is trajectory-neutral — the smoke leg (53004) already reproduced
linkdrive exactly through the new instrument, and the original
driver reproduces my replay's flipped number. The cause is the
one src/js change since linkdrive: `sim-finishersize-a`
8a4ce0eab (committed finish for beasts met below their break
line — a field-fight change that shifts RNG downstream; the
trajfrag shape, one extra draw flipping a fragile seed).

## Wall numbers (this run)

National / table-sat / wins: **0 / 0 / 0** · Wave 4 unlocks 7/8 ·
Wave 5 unlocks 4/8, faced 4/8, kills on 4 seeds (53003 4, 53004 4,
53005 8, 53008 4 wave-4+ kills; wave-5 kills on 53004 1, 53005 3)
· Lesser seats earned 4/8, sat 0/8 · Full seat 0/8 · Median
survival **106.5d** (survivals 79, 86, 89, 95, 118, 139, 150,
150) · Max survival 150d (2 seeds). The scale wall's next rung
is unchanged from linkdrive: national — the Binding waits
unanswered (nationalPendingDays 22–92 on 6/8 seeds) and the
full seat's shortfall names national on all eight.

## Per-seed table (linkdrive-armed replay)

| Seed | Days | End | Standing | Scale | Max wave | Seat | Seat days | Preview / ready | Sit calls |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | survived | 175 | regional | 4 | none | 0 | 0 / 0 | 0 |
| 53002 | 79 | village-lost | 125 | regional | 4 | none | 0 | 0 / 0 | 0 |
| 53003 | 150 | survived | 380 | regional | 5 | lesser | 45 | 44 / 25 | 0 |
| 53004 | 139 | village-lost | 350 | regional | 5 | lesser | 103 | 50 / 26 | 0 |
| 53005 | 118 | village-lost | 485 | regional | 5 | lesser | 36 | 29 / 24 | 0 |
| 53006 | 89 | village-lost | 199 | regional | 4 | lesser | 25 | 0 / 0 | 0 |
| 53007 | 86 | village-lost | 99 | regional | 3 | none | 0 | 0 / 0 | 0 |
| 53008 | 95 | village-lost | 275 | regional | 5 | none | 0 | 0 / 0 | 0 |

Band-wide: scale `regional` on all 8 seeds at end; links 41
(identical to linkdrive); the feast surge splits the band exactly
— spent on all four seat seeds (`foodDeeds` true), never spent on
the four no-seat seeds (sentiment taught on all 8, so the surge is
the single missing lesser bar on 4/4 no-seat seeds).

## Village assessment (plain words)

Four villages earned the right to sit at the table, and three of
them were told so, out loud, on the ninetieth morning — "A ring
of pale light waits — take your seat from Haven when you are
ready. Nothing is final until you sit." The scholar was home,
alive, and free on seventy-five separate days after that, with
the ring waiting. Nobody ever walked over to it. Not because the
door was locked, not because the village was away or fighting or
dead — because the person standing in for the player never takes
the seat. The village that earned its seat earliest waited
fifty-three mornings for the ninetieth dawn, then had twenty-six
free days at the ring and spent them doing everything except
sitting. The village that earned its seat latest died the day
before the table was allowed to exist — it never heard the ring
was waiting at all. And the four villages that never earned a
seat all stand at the same single locked door: they never spent
a feast's fire in a real fight. The chain now runs end to end
through the seat being earned. The last link is not a gate. It
is a decision nobody makes.

## Sense-test read (seat seeds)

**The seat is announced, and the announcement is honest.**
53004/53005, day 90: "◈ THE TABLE IS SET. A ring of pale light
waits — take your seat from Haven when you are ready. Nothing is
final until you sit." 53003, day 108 (the day the seat is
earned): "The table is being set — a lesser seat, priced for
what you built. They are watching to see who comes to it." (The
Arc IV re-fire path in `progression.js`, which sets
`tableAnnounced` with this line and notes `tableAnnounce` won't
repeat it — so the seat is announced the day it is earned, with
narration, not silently.) 53003 day 90, before the seat was
earned, heard the waiting beat instead: "…and does not come.
Not yet. The table is being set for those whose deeds are done,
and yours are not done. The ledger still wants: the food-thesis
deeds. The climb is not over." — the game named the one missing
bar, correctly, eighteen days before the seat landed.

**The village talks about the table while not sitting at it.**
53004 day 91: "🗣️ Jerzy to Nora, by the fire: 'It waits. We
wait. Somebody should check the snares — the table doesn't fill
the pantry.'" The table is present in conversation as a thing
waited on, not an abstraction — and the same day a raid takes
~1000 kcal and a neighbor's food plea goes unanswered ("Sofia
waits two days at your fire, getting thinner. Nobody answers.").
The fiction around the offered seat reads as people living with
an open invitation, not a missed trigger.

**53006 heard nothing.** No table line at all in its 89 days —
no waiting beat, no announcement, no audit. The seat was earned
on day 64 and the village died on day 89, and the day-90 floor
meant the table never existed for it. That is the no-spoilers
rule working as written (Steve 2026-10-14), not a defect — but
it is the sharp edge of the floor: a village can earn the seat
and die without ever knowing it was offered.

## Metric review

Pre-registered metrics bind this run (prereg 33c8a882a).
DIAG-GO required ALL of (a) first-blocking mechanism named on
every seat-earning seed (≥3 earning), (b) substrate guard
(regional 8/8, lesser ≥3/8, median 108.5–148.5d), (c) 0
instrument errors. HELD: (a) 4/4 named with per-day gate state;
(c) 0 errors. FAILED: (b) median 106.5d vs floor 108.5d — by 2.0
days, on the single-seed 53008 flip. Verdict is therefore
**DIAG-NO-GO (substrate moved)**, per the frozen bar. No metric
was swapped, re-cut, or re-thresholded after the run: the guard
band stays 108.5–148.5d in the record, and the miss is the
finding, not a number to widen. The proof live leg is not
evidence; only the judged 8-seed replay above is.
- What the metric did not cover, honestly: (1) The median guard
  is a fragile judge for an 8-seed band on a trajfrag substrate —
  one seed's ±55d swing moves the median 22 days, more than the
  whole ±20d band. A per-seed reproduction count (e.g. ≥6/8 seeds
  exact on days/end/standing) would have passed this run (7/8)
  while still catching a systematic shift. PROPOSED REVISION for
  the next run: guard on per-seed exact reproduction (≥6/8) AND
  a wider median band (±30d), not the median alone. (2) The
  entry-blocked tally rests on a once-daily snapshot (after
  `policy.daily`); a day counted blocked may have been ready at
  another hour. The 75 ready days are a lower bound, and the
  mechanism (0 sit calls on ready days) does not depend on the
  blocked count — but a future sit-drive arm should sample the
  preview at the decision point, not once a day. (3) The bar
  judges the mechanism naming, not whether the sit is
  *possible* — the policy never calls the verb, so "possible"
  is untested. A takeseat policy arm is the only way to test it.
- Instrument notes: the sitstep instrument was reused verbatim;
  the driver-side extensions (scholarAtHaven/alive, sit-verb
  msg wrap) recorded cleanly — scholarAtHaven boolean on every
  daily row, 0 errors, and the msg wrap fired 0 times (no calls
  to record). The analyzer's `linksEver` field reads a
  non-existent stats key and is null in the analysis JSON — a
  cosmetic miss; link totals above are computed from
  `linkdriveStats` (`proposeAccepted + counterAnswers +
  raisesLinked` = 41) and reconcile exactly with linkdrive.

## Balanced panel (§15) and telemetry

DIAG arms take no panel — the comparison here is per-day gate
state inside one replayed leg, not a before/after lever
comparison. No compare `.md` is fabricated, as the prereg
declared. Telemetry deviation check: ran
`scripts/telemetry-check.js` against the scale-wall baseline —
it REFUSES recorder-corpus input ("all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not
runs… Pass --allow-recorder-corpus for a same-shape
recorder-vs-recorder compare"). No LOUD line, no deviation
signal; the refusal is the script's own rule, reported as
prior arms reported it. The wall numbers above are the
instrument's own.

## What this arm does NOT claim

- Not a "bot never sits" finding: the policy never attempts the
  sit, so the sit's possibility is unmeasured. A takeseat policy
  arm (call the verb on a ready day) is the test, not this DIAG.
- Not a "scale is fixed" finding: regional is reached, national
  is not — the Binding waits unanswered on 6/8 seeds
  (nationalPendingDays 22–92) and the full seat names national
  on all eight.
- Not a "feast deed is unearnable" finding: the seat seeds
  earned the lesser seat with the food deeds met; the surge half
  is the single missing bar only on the four no-seat seeds.
  Whether the surge is earnable on a wave-4-reaching seed is
  still the feast drive's question (sitstep blank #2).
- Not a recorder artifact: the 53008 flip reproduces under the
  ORIGINAL linkdrive driver on this master (95d, standing 275),
  and 7/8 seeds reproduce linkdrive exactly through the new
  recorder. The flip is the finishersize landing moving a fragile
  trajectory.
- Not a win, not a table sat, not a full seat: 0/8 on all three,
  same as every prior arm on this band. Four lesser seats earned,
  zero taken.

## Next blanks (for the loop, not this arm)

1. **The sit drive (takeseat)** — a policy that calls
   `tableTakeSeat` / `tableOfferSeatTaker` on a preview-ready day
   (scholar at Haven, no entry block) on this band's seat seeds.
   This is now the binding blank on the winnability chain: the
   seat is earned, offered, ready, and un-taken only because no
   policy takes it. A Steve-call sits behind it (only the player
   chooses the path and the sitter) — the arm measures whether
   the sitting works, not whether bots should sit.
2. **The feast drive** — sitstep blank #2, unchanged: hold a
   feast and spend the surge in a real fight. The surge is now
   the SOLE missing lesser bar on 4/4 no-seat seeds.
3. **Answer the Binding** — national is the only missing
   full-seat item on 53004/53005 and the binding bar on all
   eight. (Linkdrive's next blank #1, unchanged.)
4. **The encounter block on seat days** — "Finish the current
   encounter" blocks 46 of 122 post-floor seat days on the three
   ready seeds. A sit drive must wait encounters out (or the
   snapshot must sample at the decision point) before its sit
   count means anything.

## Proof and commits

- Proof `scripts/test-sitstep2-20261107.js`: 30/30 green on this
  worktree before the judged run (12 extended-classifier
  fixtures covering every gate + edges, live 53004 smoke leg
  150d in /tmp asserting structural invariants only — and the
  smoke reproduced linkdrive's 53004 numbers exactly: 139d,
  standing 350, lesser, first seat d37, 26 ready days, 0 sit
  calls).
- Prereg committed 33c8a882a before any judged sim. Tooling
  committed 88368f4a1 (driver + analyzer + proof 30/30, zero
  src/js, zero policy edits). The safe-commit index clobber hit
  on both commits (files shown staged-as-deleted after correct
  commits); repaired with HEAD-blob cacheinfo, verified `git
  status` empty + `git diff HEAD` empty + hash-object matches,
  each time.
- Judged corpus: `evidence/2026-11-07/perseed-sitstep2-b/`
  (8 files, linkdrive-armed replay, base 2016a7ed0, 0 instrument
  errors). Verification re-run of 53008 under the ORIGINAL
  linkdrive driver: `/tmp/sitstep2-verify53008/` (95d,
  village-lost, standing 275 — the flip is master-caused).
  Analyzer output saved at `/tmp/sitstep2-analysis.json`
  (working copy; the evidence file above is the record).
- Infrastructure note: the worktree-registry lock was jammed for
  the whole run — three heartbeat attempts (12:37, 12:45, 12:52
  UTC) all blocked on `flock` (60–90s timeouts), with several
  sibling `flock -x 200` waiters queued and the holder
  unidentified (a round-0515 closeout was active in
  `round-0515-evidence` throughout). `heartbeat_at` for
  sim-sitstep2-b is stale at 2026-11-07T12:32:22Z. The reaper
  threshold is 4h, so this run's tree was never at risk, but a
  registry lock held 20+ minutes is abnormal and the coordinator
  should look at it before the next run.

## Convergence

**scale-onramp: converging, NOT converged.** The sit step is now
DIAGNOSED on seeds where the seat exists: the offer is earned,
announced, ready, and scholar-present — and never taken, because
no policy issues the sit verb. The chain runs end to end through
the seat being earned; the last link is a decision, not a gate.
But the frozen verdict is NO-GO on the substrate guard (median
106.5 vs 108.5), so the next run should re-judge with the
proposed per-seed reproduction guard — and the next arm should
be the sit drive itself, not another measurement of the offer.
