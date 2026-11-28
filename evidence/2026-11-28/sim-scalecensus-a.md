# sim-scalecensus-a — scale-leg census (Lane A leg 3)

**Arm:** sim-scalecensus-a · **Lane A playtest loop run:**
playtest-20261128T0043Z · **Leg 3 — scale** (days 80–140)
**Type:** DIAG (instruments + evidence only — no game-code fix
lands; one instrument regex corrected after the pilot, see §6)
**Prereg:** `evidence/2026-11-28/sim-scalecensus-a-prereg.md`
(frozen 2026-11-28 ~01:10 UTC, before any judged sim)
**Branch:** `journey-scale` (worktree
`~/workspace/worktrees/journey-scale`).
**Commits on master:** (prereg + instruments, proof 26/26,
analyzer selftest 20/20) 6018884ed; (evidence + corpus +
marker fix) this run — see closeout.
**Band:** 113101–113108 (fresh — see prereg §4), competent
verbatim, NO substrate flags, 150d death-aware.
**Corpus:** `evidence/2026-11-28/perseed-scalecensus-a-arm/`
(8 per-seed JSONs + summary.json).

## Verdict: DIAG-GO

| Bar (§2) | Result |
|---|---|
| Pool floor (≥6/8 alive day 80) | 6/8 — met exactly |
| Snapshot coverage (gate on ≥95% of snapshots) | 1.000 (1015/1015) |
| Reconciliation (stored vs recomputed bars) | 0 mismatches |
| Instrument errors | 0 |
| Staging sniff (table waits + regional on ≥1 seed) | pass (8/8 both) |

Determinism: seed 113101 re-run after the pilot is
**byte-identical** to its pilot file (full 150d).

## §0. The answer, in plain words

Every village reaches the lesser seat — 8 out of 8, between
day 44 and day 67 — and then waits. The wait is long (58 to
108 days) and the table never upgrades: no village reaches
national, no village delivers a capstone, and only two
villages ever fight enough distinct wave-5 monsters to clear
the waves bar (and only on days 132 and 146, at the very end).
Three villages die while waiting (days 59, 75, 123); the five
that survive sit at overtime tier 2, the monsters getting
stronger every few weeks while the seat price falls.

The lesser seat is the reachable bar TABLE.md promises, and it
holds on competent play. The full seat is not reachable on
this band, and the census names exactly why, per seed: the
scale bar (national — 8/8 unmet), the waves bar (6/8 unmet —
the wave-5 count stalls at 0 or 1), and the capstone (8/8
undelivered — but see the confound in §5: the bot never
attempts a delivery, so this corpus cannot say whether
delivery was possible). Everything else is done early and
stays done: contests by day 29–48, crises by day 28–58,
stage 2 by day 8–12, the food lesson by day 11–16, ladder
peak 3 by day 21–45.

## §1. Per-seed table

w1..w5 = distinct monsters fought per wave (full bar 5/5/4/3/2).
Lesser = first lesser-seat day. Wait = days tableWaiting true.
OT = overtime tier at end. Pop = roster start → end.

| seed | days | end | lesser | w1/w2/w3/w4/w5 | cont | cris | stage | peak | cap | binding bars | wait | OT | pop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 113101 | 150 | survived | d66 | 17/10/5/5/1 | 19 | 3 | 3 | 3 | – | waves, scale, capstone | 87 | 2 | 12→8 |
| 113102 | 150 | survived | d63 | 15/8/6/3/2 | 17 | 3 | 3 | 3 | – | scale, capstone | 89 | 2 | 12→9 |
| 113103 | 150 | survived | d46 | 23/14/6/4/0 | 11 | 3 | 3 | 3 | – | waves, scale, capstone | 106 | 2 | 12→8 |
| 113104 | 123 | village-lost | d67 | 15/8/4/3/0 | 15 | 3 | 3 | 3 | – | waves, scale, capstone | 58 | 1 | 12→10 |
| 113105 | 59 | village-lost | d59 | 16/10/5/0/0 | 5 | 4 | 3 | 3 | – | waves, scale, capstone | 4 | 0 | 12→2 |
| 113106 | 150 | survived | d44 | 22/11/7/1/0 | 14 | 3 | 3 | 3 | – | waves, scale, capstone | 108 | 2 | 12→8 |
| 113107 | 75 | village-lost | d54 | 17/11/6/0/0 | 9 | 4 | 3 | 3 | – | waves, scale, capstone | 23 | 0 | 12→1 |
| 113108 | 150 | survived | d55 | 18/9/7/6/3 | 18 | 3 | 3 | 3 | – | scale, capstone | 97 | 2 | 12→5 |

Wall: wins 0/8, national 0/8, regional 8/8, table waiting
8/8, seated 0/8, median survival 150d.
Binding-bar frequency (full seat): scale 8/8, capstone 8/8,
waves 6/8, contests 0, crises 0, stageOk 0, foodDeeds 0,
ladderPeak3 0. Lesser-seat unmet bars: ALL 0/8 — every seed
met every lesser bar.

First-true days (full bars): stageOk d8–12, foodDeeds d11–16,
ladderPeak3 d21–45, contests d29–48, crises d28–58, waves
only on 113102 (d146) and 113108 (d132), scale never,
capstone never. The last lesser bar to flip is always the
regional scale itself (d44–67) — the climb to regional IS the
lesser-seat story; everything else is already banked.

Table timeline: the table waits (tableWaiting) from the
lesser-seat day on every seed, but is only ANNOUNCED on day
90 (the floor) — the pale-light line fires day 90 on all 6
survivors, never on the 2 that died before 90. Overtime
starts ~day 110–116 on survivors (tier 2 by day 150; the
standing buys 21–23 days between tiers, not 7).

## §2. Village assessment — census in plain words

Every village starts with 12 people. Five survive to day
150 with 5–9 left; three are lost (days 59, 75, 123).
About 52 deaths across the band, with a handful of births /
joiners making up the difference (roster rises again on
113101, 113103, 113108).

- **113101 — the waiter.** Survived, 8 left. Lesser seat
  day 66, waited 87 days at overtime 2. Fought 5 distinct
  wave-4 monsters but only 1 wave-5 — one short of the waves
  bar. The village that came closest on waves and still
  stalled.
- **113102 — the fighter.** Survived, 9 left. Cleared the
  waves bar on day 146 (w5 = 2) — six days before the
  horizon — and still never saw national. The waves bar is
  clearable; it just arrives too late to matter.
- **113103 — the long wait.** Survived, 8 left. Lesser seat
  day 46, the earliest tied, then 106 days of waiting — the
  longest. Never fought a wave-5 monster at all (w5 = 0).
- **113104 — the bleed.** Lost day 123 with 10 left — the
  roster stayed near-full while the village was lost
  (mechanism unclear from this corpus; see §5). The Red
  Table raided 11 times from day 61 and the pantry fell from
  ~12,000 to ~1,700 kcal while the village kept talking
  about the palisade. Lesser seat day 67.
- **113105 — the eaten.** Lost day 59 with 2 left. Stonebridge
  split (a cannibal faction walked and became the Red Table),
  Emberhold split the same way, and the Red Table raided
  again and again until the village collapsed in its final
  week (7 → 4 → 2 people in two days). It reached the lesser
  seat on day 59 — the day it died.
- **113106 — the early sitter.** Survived, 8 left. Lesser
  seat day 44, waited 108 days. Fought only 1 wave-4 monster
  all run (w4 = 1, w5 = 0) — the least-fought village, and
  still seated at the lesser table before day 45.
- **113107 — the collapse.** Lost day 75 with 1 left. Eleven
  of twelve dead; the last three died on day 74. Raids from
  day 38, but every raid line says "Nobody's dead" — this
  corpus cannot name what killed them (see §5).
- **113108 — the strongest.** Survived, 5 left. The best
  fighter on the band (w4 = 6, w5 = 3, waves bar day 132)
  and the emptiest haven (12 → 5). Strength and survival
  pulled opposite ways.

What they knew: every village reached integration stage 3,
learned the food lesson (sentimentTaught), and peaked at
ladder stage 3. What was missing: national standing (nobody
got there), wave-5 kills (0–3 distinct, bar is 2, and only
two seeds cleared it), and a delivered capstone (none — see
the §5 confound).

## §3. People check — full transcripts read

Three seeds read in full (fireside lines + system table
lines): 113101 (survivor), 113105 (died day 59), 113108
(strongest fighter). The talk is coherent and the waiting
has a voice:

- The waiting talk lands: "Why them? ...Sorry. It's just
  sitting there, and they're the one who has to sit in it."
  / "It waits. We wait. Somebody should check the snares —
  the table doesn't fill the pantry." / "Nobody's sleeping.
  The sky is waiting and nobody knows what to do with their
  hands." / "It eats while we deliberate. The Herald feeds
  on our stores and we're supposed to just... wait?" / "The
  table's set. The ring of pale light — it's just sitting
  there. Waiting on them. What do you think they'll tell it?"
  Villagers react to the waiting table with unease, and keep
  working while they wait. The snares line is practically a
  design statement.
- **But the pool is thin:** across 113101 + 113108, the
  waiting talk is ~5 distinct lines repeated 3–5 times each
  over 80–100 days of waiting ("It waits. We wait..." 4× on
  113101 alone; "Why them?" 4× on 113108). A real player
  sitting through a 100-day wait hears the same line four
  times. The early-game talk is the same shape: the
  palisade/pantry line ("The pantry's the thing. We don't
  raise The Palisade on empty shelves — N of 14,000 kcal")
  fires 12 times on 113104 with only the number changing.
  The numbers change honestly; the sentence doesn't. This is
  a content gap, not a bug — filed as next arm #3 below.
- The overtime lines are clear and honest ("OVERTIME ×1 ...
  The wait stretches — the village's standing buys time: 21
  days between tiers, not 7"), and the regional-link beat
  reads well ("Marcus speaks at Emberhold's table now —
  earned, not appointed").
- The keepsake channel line (Daughter's Drawing) fires
  daily for 9 straight days on 113101 with three rotating
  endings — slightly spammy, but the rotation works.
- The raid narration repeats verbatim ("trampled 2 garden
  plots into mud... Trust -10") 4–11 times per seed. For a
  repeated event type that is acceptable; it reads as a
  drumbeat rather than a conversation.
- 113105's story coheres end to end: the splits, the
  petitions, the runner's threat ("Back off — or we'll talk
  with teeth"), the pantry raids, the collapse. Nobody in
  the village says anything senseless; the village simply
  loses.

## §4. Reachable / fun / winnable — the scale leg

- **Reachable: YES for the lesser seat, NO for the full.**
  The TABLE.md target holds: competent play reaches the
  lesser seat on 8/8 seeds, days 44–67, with every lesser
  bar met. The full seat is unreachable on this band:
  national 0/8, waves 6/8 short, capstone 0/8 delivered.
- **Fun: the wait works, the pool doesn't.** The waiting
  table has a real voice (unease, overtime pressure, the
  Herald feeding) and the announcement at day 90 lands. But
  a 58–108 day wait on ~5 repeated lines will wear thin,
  and the bot's wait is passive — it never sits, never
  pushes for full, just waits out the horizon. A real player
  can sit on day 44; the bot cannot show what sitting feels
  like, so the sitting itself is unmeasured here.
- **Winnable: unmeasured, not disproven.** No seed sat at
  the table (0/8 seated) because the competent policy has
  no sit verb — it waits for a better seat that never comes.
  The road TO the seat is measured (lesser: open; full:
  blocked at national + waves + capstone-readiness). The win
  itself needs a sitting policy or a player; this arm does
  not claim the win is impossible.

## §5. Limits, confounds, corrections (read before citing)

1. **Capstone 8/8 is confounded.** The competent policy
   never attempts a capstone delivery (it is a Haven-panel
   player action, `ladderDeliverCapstone`). This corpus
   records delivery, not readiness — it cannot distinguish
   "never ready" from "ready but the bot never delivers."
   Treat the capstone binding as a bot artifact, not a proven
   game wall. The measured bindings are scale (national) and
   waves (w5). Next arm: record `ladderCapstoneReady()`
   daily.
2. **Death causes are not instrumented.** The driver saves
   fireside + table lines only; death narration never reaches
   the corpus (the table-line filter drops it). So 113105 /
   113107's 10–11 deaths have timing (pop drops) but no
   cause, and every raid line says "Nobody's dead" while the
   roster falls. `deathCauseShares` is null in the wall —
   reported, never faked. Next census should add a death
   recorder if causes matter to the assessment.
3. **Announce-day marker corrected.** The driver's
   `announceDay` marker used /TABLE IS SET/, which also
   matches the Harvest Table ability shout ("THE TABLE IS
   SET. THE VILLAGE IS ONE ANIMAL..."). On 113101 it fired
   day 39 and mis-marked the announce 51 days early. The
   true announce is the pale-light line, day 90 on all 6
   survivors (the `tableAnnounced` snapshot flag agrees
   exactly). The driver regex is tightened to /◈ THE TABLE
   IS SET/ in this run's fix commit; the pilot corpus rows
   keep the old marker and this evidence reports the
   corrected days. The verdict never depended on the marker.
4. **113104's late pop rebound is unexplained.** Roster
   falls to 7 on day 117, reads 10 at the day-123 close.
   Births / joiners are the likely cause (other seeds show
   the same rises), but this corpus cannot confirm it — do
   not cite it as a join rate.
5. **"Seated 0/8" measures the bot, not the game.** See §4:
   the competent policy never sits. Do not cite 0/8 seated
   as "the table is unwinnable."

## §6. Metric review

- Frozen bars held; no re-scoring. The pool floor was
  exactly met (6/8 alive day 80) — well-sized, not lucky:
  the two deaths before 80 (d59, d75) are the known
  early-loss shape from the launchfit band.
- The capstone bar as specified ("capstone delivered") is a
  METRIC-BROKEN-adjacent confound (see §5.1): it measures
  the bot's verbs as much as the game. Next run: judge the
  capstone on READINESS (`ladderCapstoneReady()`), with
  delivery as a secondary.
- Death-cause shares were listed as a secondary metric but
  the driver never instrumented them — filed as a gap, not
  silently dropped (§5.2).
- The announceDay marker contamination (§5.3) was caught by
  the pilot's own stored lines and corrected in the driver;
  the marker is secondary and the verdict is independent of
  it.

## §7. Next arms (named from this proof)

1. **Scale-rank inputs diagnostic** — what does
   `scaleRank()` need for national? Record links /
   standing / hierarchyState daily on a fresh band. The
   mechanism behind the 8/8 scale binding is the next
   question; this census only shows the symptom.
2. **Capstone-readiness recorder** — record
   `ladderCapstoneReady()` daily and, if readiness is real,
   teach the competent policy the delivery verb. Separates
   "never ready" from "ready but unplayed."
3. **Waiting-talk variety** — the tableWaitTalk pool cycles
   ~5 lines over an 80–108 day wait (and the palisade/pantry
   line 12× on one seed). New waiting lines are a content
   arm; flag `[needs-eyes]` if landed, since Steve should
   hear the voice.
4. **Death-cause recorder** — the census cannot name how
   villages die (113105/113107). A death recorder on the
   next census closes the assessment gap.

## §8. Infrastructure

- **VM restart ~01:10Z** killed the first pilot pair before
  any seed wrote (uptime 1 min at re-check). Re-established
  the heartbeat FIRST, re-probed writes (OK), verified the
  prereg commit intact, re-ran the pilot from scratch.
  Nothing lost; the corpus is complete (8/8).
- **Safe-commit index clobber** struck once on the prereg
  commit (4 files staged-deleted in the worktree index);
  repaired via the ls-tree pipe, commit verified correct,
  tree clean.
- **Determinism:** seed 113101 full-150d rerun is
  byte-identical to its pilot file. Proof test 26/26 +
  analyzer selftest 20/20 re-green after the marker fix.
- No write-flap window hit this run. No EPERM. No lock
  contention with the fleshout loop (its callfirst /
  fleefloor trees stayed untouched).
- Telemetry deviation check: see §9.

## §9. Telemetry deviation check

Run by the coordinator on the pilot corpus:
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-28/perseed-scalecensus-a-arm/*.json'
--metrics national,table,wins,exiled`

- LOUD: national 12 → 0. LOUD: wins 16 → 0. Table and
  exiled did not fire.
- Verdict: **regime artifact, no investigation item, baseline
  NOT rolled.** The baseline's own `_regime` note says it is
  the winseat regime (full win-side stack, national 12/16,
  wins 16/16) and forbids comparing pre-seat / readiness
  substrates against it — wins are structurally ~0 there.
  This band is competent verbatim with no seat stack, and
  the two nearest competent bands agree (launchfit 111101–
  111108: national 0/8, wins 0/8; partydmg 112101–112108:
  national 0/8, wins 0/8). No regression: competent play
  has never reached national on these bands. Table did not
  fire LOUD (the tool reads the rows' waiting-state `table`
  field, 8/8, against the baseline's 16/16 sittings — a
  within-tolerance read on a waiting-state field, not a
  sitting count; the sitting count is 0/8 here, §5.5).
