# sim-capstoneready-a — capstone-readiness recorder, LEG 1 (readiness only)

**Arm:** sim-capstoneready-a · **Loop A run:**
fleshout-20261128T0315Z · **scalecensus §7 next arm #2**
**Type:** DIAG (instruments + evidence only — no game-code fix
lands; no policy change lands in leg 1; the delivery verb is
never called by this leg)
**Prereg:** `evidence/2026-11-28/sim-capstoneready-a-prereg.md`
(frozen 2026-11-28 ~04:05 UTC, before any judged sim)
**Branch:** `sim-capstoneready-a` (worktree
`~/workspace/worktrees/sim-capstoneready-a`).
**Base:** master tip `fb6c383fb`.
**Band:** 113301–113308 (fresh — see prereg §4: moved from the
assigned 113201–113208, whose endpoints are named in the
scalecensus prereg's own freshness sentence), competent
verbatim, NO substrate flags, 150d death-aware.
**Corpus:** `evidence/2026-11-28/perseed-capstoneready-a-arm/`
(8 per-seed JSONs + summary.json).
**Commits on branch:** c0a0bde46 (prereg); 0348efa90
(instruments: driver + analyzer + proof test, 33/33, analyzer
selftest 29/29); this run (evidence + corpus — see closeout).

## Verdict: DIAG-GO

| Bar (§2) | Result |
|---|---|
| Pool floor (≥6/8 alive day 80) | 8/8 — met |
| Snapshot coverage (complete readiness / all snapshots) | 1.000 (1169/1169) |
| Reconciliation (stored vs recomputed readiness, all snapshots) | 0 mismatches |
| Instrument errors | 0 |
| Determinism (seed 113301 full-150d rerun) | byte-identical |
| Staging sniff (table waits + regional + all 3 kinds live) | pass (8/8 waiting, 8/8 regional, 3/3 kinds) |

Readiness is REAL: the military tribute was ready on 4/8
seeds and deliverable on 2/8. **Leg 2 OPENS** — see §7.

## §0. The answer, in plain words

The scalecensus could not tell "never ready" from "ready but
the bot never delivers." Now we can — and the answer is
split three ways, one per capstone deed.

**The military tribute is ready, sometimes, and it is
fragile.** Four of eight villages banked two living wave-4
veterans at some point (first-ready days 83, 94, 103, 117)
and held readiness for 9 to 69 days. But readiness does not
stick: on two of those four seeds the veterans died and
readiness was gone by the end (113301 ready 13 days, ends
with 0 veterans; 113304 ready 9 days, ends with 0). Only
one seed held it to the horizon (113302: ready and
deliverable from day 83 to day 150). And the readiness bar
is not the payment bar: 28 of the 108 ready-days were
ready-but-NOT-deliverable — the two veterans were the
scholar plus one villager, and the delivery can only take
non-scholar veterans. That split is the ruling working as
designed (Steve 2026-11-10: the scholar counts toward the
bar, never toward the payment), and it bites in practice:
the scholar is very often the village's FIRST wave-4 killer
(the first veteran is the scholar alone, payable 0, on 5 of
8 seeds), so a village can be "ready" for weeks while no
delivery is possible.

**The trade charter never comes close.** Zero ready-days on
all 8 seeds, 1169 snapshot-days, dominant blocker
`no-sealed-charter` on every single day. No village ever
sealed a chartered trade link at all. That is downstream of
the scale wall — the Charter beat resolves at national
scale, and national was never reached — but it is also a
fact on its own: the charter deed has no partial progress to
show. A village cannot be "almost chartered."

**The feast embassy never comes close either.** Zero
ready-days, dominant blocker `no-bundle-feast` on all 1169
snapshot-days. The bundle flag is leg 2's write, so this
was expected before the run — the feast can never read
ready on leg 1. What the corpus adds is the other half: the
ladder stage is NOT the blocker (stage 3, the feast's need,
is reached on all 8 seeds). If the bundle ever completes,
the feast deed is ready the same day. The blocker is the
bundle alone — and the bundle never completes (see the
open finding from 2026-11-11, §7).

**Delivery was never attempted, on any seed, on any day.**
`ladderCapstoneDelivered()` stayed null on all 8 seeds, as
the prereg expected: the competent policy has no delivery
verb. The scalecensus's "capstone delivered 0/8" is now
decomposed: on 4/8 seeds the village WAS ready at some
point and the 0 is a bot artifact; on the other 4/8 it was
never ready and the 0 is a game wall. The full seat's
remaining bars at the horizon are scale (8/8 unmet),
capstone-delivered (8/8 unmet — half artifact, half wall),
and waves (5/8 unmet). Everything else — contests,
crises, stage, food deeds, ladder peak 3 — is met on all
8 seeds.

## §1. Per-seed table

trib = military_tribute: firstReady / readyDays /
firstDeliverable / deliverableDays / splitDays (ready but
not deliverable). chart/feast readyDays are 0 on all seeds
(blockers: `no-sealed-charter` / `no-bundle-feast` on every
snapshot-day). w1..w5 = distinct monsters fought per wave
(full bar 5/5/4/3/2). Lesser = first lesser-seat day.
Wait = days tableWaiting true. OT = overtime tier at end.
Pop = roster start → end.

| seed | days | end | lesser | w1/w2/w3/w4/w5 | cont | cris | stage | peak | trib ready/deliv/split | wait | OT | pop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 113301 | 150 | survived | d38 | 26/15/8/8/4 | 12 | 3 | 3 | 3 | d94 / 13d / – / 13d | 110 | 2 | 12→9 |
| 113302 | 150 | survived | d55 | 22/14/8/6/1 | 10 | 3 | 3 | 3 | d83 / 69d / d83 / 69d / 0d | 96 | 2 | 12→10 |
| 113303 | 150 | survived | d48 | 23/13/9/7/0 | 17 | 3 | 3 | 3 | – / 0d / – / 0d / 0d | 104 | 2 | 12→5 |
| 113304 | 150 | survived | d42 | 23/14/8/8/2 | 14 | 3 | 3 | 3 | d103 / 9d / – / 9d | 110 | 2 | 12→5 |
| 113305 | 150 | survived | d72 | 14/9/5/7/3 | 17 | 3 | 3 | 3 | d117 / 17d / d140 / 11d / 6d | 80 | 2 | 12→6 |
| 113306 | 111 | village-lost | d52 | 22/12/7/5/0 | 15 | 4 | 3 | 3 | – / 0d / – / 0d / 0d | 61 | 1 | 12→6 |
| 113307 | 150 | survived | d42 | 22/14/8/8/0 | 12 | 4 | 3 | 3 | – / 0d / – / 0d / 0d | 110 | 3 | 12→2 |
| 113308 | 150 | survived | d45 | 22/13/4/5/0 | 19 | 3 | 3 | 3 | – / 0d / – / 0d / 0d | 106 | 2 | 12→8 |

Wall: wins 0/8, national 0/8, regional 8/8, table waiting
8/8, seated 0/8, median survival 150d.
Readiness pooled: tribute ready 4/8 seeds (108 ready-days),
deliverable 2/8 (80 deliverable-days), split 28 ready-days;
charter ready 0/8 (0 days); feast ready 0/8 (0 days);
delivered 0/8 (0 attempts).
Full-seat bars at end: waves met 3/8 (113301, 113304,
113305), contests 8/8, crises 8/8, scale 0/8, stageOk 8/8,
foodDeeds 8/8, ladderPeak3 8/8, capstone-delivered 0/8.
Lesser-seat unmet bars: ALL 0/8 — every seed met every
lesser bar.

First-true days (full bars): stageOk and foodDeeds early
(scalecensus band: d8–16; this band's gate series agrees in
shape), contests/crises by mid-run, waves only on the three
seeds above, scale never, capstone never. The last lesser
bar to flip is again the regional scale itself (d38–72) —
the climb to regional IS the lesser-seat story.

Table timeline: the table waits (tableWaiting) from the
lesser-seat day on every seed, announced day 90 on all 7
seeds alive at 90 (113306 died day 111, announced day 90
too — it lived past the floor). Overtime starts ~day
109–118 on survivors (tier 2 by day 150 on six seeds;
113307 reaches tier 3 with 2 people left).

## §2. Village assessment — census in plain words

Every village starts with 12 people. Seven survive to day
150 with 2–10 left; one is lost (day 111). About 50 deaths
across the band, with births/joiners making up some of the
difference (roster rises again on 113301, 113302, 113308).

- **113301 — the waiter who almost had it.** Survived, 9
  left. The best wave-fighter on the band (w4 = 8, w5 = 4 —
  the waves bar is MET) and the only seed besides 113304
  and 113305 to clear it. Tribute-ready day 94 — then the
  veterans died, and by the end the village has 0 living
  wave-4 veterans at all. Readiness is a window, and this
  village watched it close. Pantry 9,581 kcal at the end —
  the best-fed survivor.
- **113302 — the holder.** Survived, 10 left. The only
  village that held tribute readiness to the horizon: two
  payable veterans from day 83, three living veterans by
  the end, deliverable for 69 straight days. It never
  delivered — there is no verb — and it never saw national,
  so even a delivery would not have seated it (w5 = 1,
  short of the waves bar). The village that proves the
  tribute is deliverable AND proves delivery alone is not
  the seat.
- **113303 — the thin pantry.** Survived, 5 left. Never
  had two veterans (max 1, and that one the scholar alone
  for 40 days). Pantry 200 kcal at the end — the village
  survived on fumes while waiting 104 days.
- **113304 — the second window.** Survived, 5 left. Waves
  bar met (w5 = 2), tribute-ready day 103 for 9 days —
  then the veterans died, readiness gone, ends with 0.
  The same shape as 113301, nine days instead of thirteen.
- **113305 — the late arrival.** Survived, 6 left. The
  latest lesser seat (day 72) and the latest readiness:
  tribute-ready day 117, deliverable only day 140, when a
  second payable veteran finally stood — 11 deliverable
  days at the very end of the horizon. Readiness can arrive
  too late to use, even if the verb existed.
- **113306 — the lost one.** Lost day 111 with 6 left.
  Lesser seat day 52, waited 61 days, never had two
  veterans (max 1, the scholar alone). The reactor died
  with its bearer on day 42 (see §3) and hunger came back;
  the pantry reads 0 at the end. The only death on the
  band, and the only seed whose overtime never passed tier 1.
- **113307 — the hollowed-out.** Survived, 2 left.
  Overtime tier 3 — the deepest wait on the band — with two
  people in Haven. Never had two veterans. A village can
  survive to day 150 as two people staring at a table.
- **113308 — the fed waiter.** Survived, 8 left. Pantry
  8,446 kcal, the second-best-fed. Never had two veterans
  (max 1, the scholar alone for most of the run). Food is
  not the binding bar here; veterans are.

What they knew: every village reached integration stage 3,
learned the food lesson, and peaked at ladder stage 3. What
was missing: national standing (nobody got there), a second
payable veteran (only 2/8 villages ever stood two), a
sealed charter (nobody, ever), and a completed feast bundle
(nobody, ever). The tribute is the only capstone with any
life in it — and its life is two veterans who keep dying.

## §3. People check — full transcripts read

Three seeds read in full (fireside lines + system table
lines): 113301 (ready-but-never-deliverable), 113302
(deliverable), 113306 (died day 111). The talk is coherent
and the waiting has a voice — the same voice the
scalecensus heard, with two new beats:

- **The tribute has a voice of its own — almost.** On
  113302, days 120 and 138: "Avery has the kills for the
  table, but no one to walk out with yet — the party
  waits." That is the veteran-plan hold voice
  (`villager-brain.js` `holdVoice`, kind `'veteran'`): a
  veteran holding an expedition plan that cannot walk out.
  It is NOT the tribute read — Avery's plan is a hunt, not
  a delivery — but it fires on the one seed where the
  tribute IS deliverable, in words a player will hear as
  tribute talk. The phrasing is coherent in its own
  mechanic; the collision with the capstone is a voicing
  note, filed in §7, not a defect claim.
- **The reactor dies with its bearer.** 113306, day 42:
  "The warm hum behind your ribs is gone. The reactor went
  with Deirdre's body — it does not come out, and it does
  not pass on. Hunger is back on the table. (One reactor
  per world, and the world already spent its one.)" The
  village gained the pellet day 33 and lost it with a death
  nine days later. That is a real story beat, and it lands.
- **The pellet pass is voiced every time** (113301 d126
  Tom→Domfeh; 113302 d91 Ernesto→Avery, d125 Avery→
  Ursula): "never got hungry while the village did, so the
  pellet moved to hungrier hands." The pass rule is audible
  in play.
- **The waiting-talk pool is still thin** (scalecensus §7
  arm #3, still open): the same ~5 lines cycle across all
  three seeds — "Nobody's sleeping" 5× on 113302,
  "Why them?" 4× on 113301, "The table's set" 5× on
  113301. The lines are good; there are just not enough of
  them for a 100-day wait.
- **The begging line always goes unanswered.** Mei, Hana,
  Sanne, Felix — the same "Our jars are empty... I'm asking
  for food" and two days later "They'll remember the
  silence" — 3× per seed, always unanswered by the bot.
  The repetition is honest (the bot never answers food
  petitions), but a player reading it the third time knows
  exactly how the scene ends.
- **The Algorithm trailer spams.** 113301 day 90: the
  trailer line ("The Algorithm trailers its next move at
  Manuel — the predictable get countered") fires EIGHT
  times in one day, identical, and the thumbnail line five
  times on day 105. That is a voice bug, not a pool gap —
  filed in §7 / sim-findings.
- The overtime lines stay clear and honest, and the
  regional-link beat still reads well ("Marcus speaks at
  Thornfield's table now — earned, not appointed").

## §4. Reachable / fun / winnable — the capstone leg

- **Reachable: the tribute YES (sometimes), the charter
  and feast NO (on this band).** The tribute deed is
  reachable by competent play: 4/8 villages were ready,
  2/8 deliverable, with first-ready days 83–117 inside the
  horizon. The charter is unreachable while national is
  unreachable (0 sealed links in 1169 days) and the feast
  is unreachable while the bundle never completes (0 in
  1169 days). The capstone as a whole is therefore
  single-road on competent play: the tribute or nothing.
- **Fun: the wait works, the pool doesn't, the tribute
  window adds tension.** A village that banks two veterans
  and watches them die (113301, 113304) is a real story —
  readiness as a window, not a milestone. But the bot's
  wait is still passive: it never delivers even when it
  could (113302, 69 deliverable days, nothing happens),
  and the waiting talk repeats. Leg 2 will show what
  delivery feels like.
- **Winnable: unmeasured, not disproven — and now one bar
  closer.** No seed sat (0/8 seated, the bot never sits)
  and no seed delivered (0/8, the bot never delivers).
  The road TO the seat is now measured per capstone: the
  tribute road is open on 2/8 seeds, the other two roads
  are closed. The win itself still needs a sitting policy
  plus a delivery verb; leg 2 supplies the second half.

## §5. Limits, confounds, corrections (read before citing)

1. **Charter/feast zeros are conditional, not absolute.**
   The charter's `no-sealed-charter` on all 1169 days is
   downstream of national never being reached (the Charter
   beat resolves at national scale) — this corpus cannot
   say whether a national village would seal charters
   readily. The feast's `no-bundle-feast` is structural on
   leg 1 (the bundle flag is leg 2's write) — it will read
   differently the moment a bundle completes. Cite both as
   "never ready on this competent band," never as "the deed
   is impossible."
2. **Readiness flickers; the end snapshot is not the
   story.** Two seeds were ready mid-run and end with 0
   veterans. Any citation of "ready at end" (2/8) understates
   the finding — the honest numbers are "ever ready 4/8,
   ever deliverable 2/8."
3. **Death causes are not instrumented.** As in the
   scalecensus (§5.2), the driver saves fireside + table
   lines only; death narration never reaches the corpus, so
   113306's collapse has timing (pop drops) but no cause,
   and the veteran deaths that close the tribute windows
   (113301, 113304) are dated by the readiness series, not
   explained by it. `deathCauseShares` is null in the wall
   — reported, never faked.
4. **"Seated 0/8" and "delivered 0/8" measure the bot, not
   the game.** The competent policy never sits and never
   delivers. Do not cite either as "the table is
   unwinnable" or "the capstone is undeliverable." That is
   the confound this arm was built to separate — and it
   did: readiness 4/8 ready, 2/8 deliverable, delivery
   attempts 0 because the verb does not exist in the bot.
5. **Prior art, for the record:** a Loop B arm
   (sim-capstoneready-remeasure-b, 2026-11-10) measured
   "tribute ever-ready 2/8" on band 140201–140208 after a
   kill-log/counter reconciliation fix. This band reads 4/8
   ever-ready — same order, not a contradiction: different
   band, different veteran luck, and the remeasure predates
   this recorder. The two numbers agree that tribute
   readiness is a minority event, not a guarantee.

## §6. Metric review

- Frozen bars held; no re-scoring. The pool floor was met
  with room (8/8 alive day 80, floor 6); coverage was
  perfect (1169/1169); reconciliation was perfect across
  all 1169 snapshots × 3 kinds; determinism byte-identical
  on the full-150d rerun.
- The primary metric as specified ("readiness recorded
  daily") proved to be the right instrument: the per-kind
  split (ready vs deliverable vs never) is exactly the
  separation the scalecensus confound needed, and the
  ready-but-not-deliverable days (28) are the sharpest
  single number in the corpus — they are the scholar-veteran
  ruling made visible.
- One metric note for the NEXT run: the prereg's
  "deliverable" for charter/feast is defined as ready
  alone (no payment), which is correct per the delivery
  code — but it means leg 2's deliverable count for those
  kinds will be 0 as long as readiness is 0, and the
  leg-2 GO bar must be written against the TRIBUTE (the
  only kind with live readiness), not against "any kind
  deliverable." The leg-2 amendment carries that bar.
- Death-cause shares were listed as a secondary metric but
  the driver never instrumented them — filed as a gap, not
  silently dropped (§5.3; scalecensus §7 arm #4 still
  open).

## §7. Next arms (named from this proof)

1. **LEG 2 — teach the competent policy the delivery
   verb** (OPENS NOW — readiness real on 4/8 seeds,
   deliverable on 2/8). A delivery policy that calls
   `ladderDeliverCapstone('military_tribute')` when the
   snapshot reads deliverable, on the same band, measuring
   deliveries, the seat after delivery, and whether the
   tribute payment (two veterans leave) changes survival.
   Needs its own prereg amendment frozen + committed
   before any leg-2 judged sim. GO bar on the tribute only
   (see §6).
2. **Charter-readiness diagnostic** — what does the
   Charter national beat need, and would a national village
   seal charters? Blocked until a band reaches national
   (the sibling sim-scalerank-a arm is the live attempt);
   do not run it on a competent band that never gets
   there.
3. **Feast-bundle completion** — the bundle never completes
   (open finding 2026-11-11, sim-feastfirst-a): the feast
   deed cannot be judged until a bundle exists. A build or
   policy arm that stocks the table deliberately comes
   before any feast-readiness re-measure.
4. **Waiting-talk variety** (scalecensus §7 arm #3, still
   open) — ~5 lines over an 80–110 day wait, confirmed
   again on this band. Content arm; flag `[needs-eyes]` if
   landed.
5. **Death-cause recorder** (scalecensus §7 arm #4, still
   open) — the corpus cannot name how villages die or how
   tribute veterans die.
6. **Voice findings filed to sim-findings.md from this
   run:** the Algorithm trailer line firing 8× in one day
   (113301 d90) + thumbnail line 5× (d105) — a spam defect,
   not a pool gap; the veteran-plan holdVoice line
   ("has the kills for the table, but no one to walk out
   with yet") colliding with capstone phrasing on a
   deliverable seed — a voicing note.

## §8. Infrastructure

- **Heartbeat skipped once:** `worktree-heartbeat.sh
  sim-capstoneready-a` at ~04:25Z reported "registry lock
  held > 120s — heartbeat skipped, retry later" (registry
  contention, likely the sibling loop or coordinator
  holding the lock). Retried after the pilot; the run's
  worktree stayed registered throughout and no reaper
  action touched it. Recorded here, not hidden.
- **Safe-commit index clobber** struck twice (prereg
  commit c0a0bde46, instruments commit 0348efa90):
  committed files showed staged-deleted in the worktree
  index. Repaired both times via the ls-tree pipe
  (`git ls-tree HEAD -- <paths> | git update-index --add
  --index-info`); both commits verified correct by
  `git show --stat`, tree clean after each repair.
- **Determinism:** seed 113301 full-150d rerun is
  byte-identical to its pilot file. Proof test 33/33 +
  analyzer selftest 29/29.
- No write-flap window hit this run. No EPERM. No lock
  contention with the fleshout loop (its trees untouched)
  or with Loop B (its trees, branches, and files untouched).
- **VM/machine:** no restart hit this run (uptime steady
  across the pilot; the 04:25Z heartbeat skip was registry
  contention, not a restart).

## §9. Telemetry deviation check

Run by this arm on the pilot corpus:
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-28/perseed-capstoneready-a-arm/*.json'
--metrics national,table,wins,exiled`

- LOUD: national 12 → 0. LOUD: wins 16 → 0. Table and
  exiled did not fire.
- Verdict: **regime artifact, no investigation item, baseline
  NOT rolled.** Same as the scalecensus §9: the baseline's
  own `_regime` note says it is the winseat regime (full
  win-side stack, national 12/16, wins 16/16) and forbids
  comparing pre-seat / readiness substrates against it —
  wins are structurally ~0 there. This band is competent
  verbatim with no seat stack, and the two nearest competent
  bands agree (scalecensus 113101–113108: national 0/8,
  wins 0/8; launchfit 111101–111108: national 0/8, wins
  0/8). No regression: competent play has never reached
  national on these bands.
