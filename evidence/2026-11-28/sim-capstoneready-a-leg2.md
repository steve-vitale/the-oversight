# sim-capstoneready-a — LEG 2 (teach the bot the delivery verb)

**Arm:** sim-capstoneready-a leg 2 · **Loop A run:**
fleshout-20261128T0315Z · **scalecensus §7 next arm #2, leg 2**
**Type:** DIAG + policy-only mechanism arm (one new policy file;
zero src/js changes — the verb `ladderDeliverCapstone` already
exists in `src/js/table.js` and is called through it, never
re-implemented)
**Prereg:** `evidence/2026-11-28/sim-capstoneready-a-prereg-leg2.md`
(frozen 2026-11-28 ~04:55 UTC, before any leg-2 judged sim;
corrected 05:15Z-era commit e1a1fa5cb — delivery verb fires at
dawn, before the day's trips; the correction is a placement
clarification, frozen before any judged sim ran)
**Branch:** `sim-capstoneready-a` (worktree
`~/workspace/worktrees/sim-capstoneready-a`).
**Base at pilot:** master tip `fb6c383fb` (unchanged since leg 1;
rebased onto the current master tip before landing — see §9).
**Band:** 113301–113308 (SAME band as leg 1 — the pairing is the
design), competent-capstonedeliver-a (competent verbatim + the
tribute delivery verb at dawn), NO substrate flags, 150d
death-aware.
**Corpus:** `evidence/2026-11-28/perseed-capstoneready-a-leg2-arm/`
(8 per-seed JSONs + summary.json).
**Analysis JSON:** `evidence/2026-11-28/capstoneready2-analysis.json`
(analyzer --json: verdict + wall + per-seed rows).
**Commits on branch (post-rebase onto local master fb4b4dcc8,
which carries the sibling sim-fleefloor-a merge):** c6bdc2cf1
(leg-1 prereg); a348e53ff (leg-1 instruments); 18e52d302 (leg-1
evidence + corpus, DIAG-GO); f5cb80fff + 64e1cffac (leg-2 prereg
amendment + dawn-placement correction); 4a9f291c9 (leg-2
instruments + evidence + corpus — this run; pre-rebase hashes
a11086480, then 03cc694c2).

## Verdict: DIAG-GO

| Bar (leg-2 prereg §2) | Result |
|---|---|
| (a) Delivery succeeds on BOTH predicted seeds, ok:true, pg.ladderCapstone === 'military_tribute' | 113302 d83 ok:true, 113305 d140 ok:true — met |
| (b) ZERO delivery attempts on any other seed/day | 2 attempts total, both predicted — met |
| (c) ZERO half-payments (exactly the 2 named veterans off the roster) | paymentVerified true on both; post-delivery snapshots confirm — met |
| (d) Snapshot coverage ≥ 0.95 | 1.000 (1169/1169) — met |
| (e) Reconciliation 0 mismatches | 0 — met |
| (f) Instrument errors 0 | 0 — met |
| (g) Determinism (one full-150d seed re-run byte-identical) | 113302 re-run byte-identical — met |
| Pool floor (≥6/8 alive day 80) | 8/8 — met |
| Staging sniff (delivery live + table waits + regional) | pass (2 deliveries, 8/8 waiting, 8/8 regional) |

The verb fires exactly where leg 1 said it could, the payment
lands cleanly, and nothing fires where it should not. **Leg 2
DIAG-GO.**

## §0. The answer, in plain words

Leg 1 proved villages can BE ready for the military tribute
while the bot never delivers, because it had no delivery verb.
Leg 2 taught the bot the verb — one call at dawn, only when the
tribute reads deliverable — and the verb works exactly as
predicted: on the two seeds leg 1 called deliverable, the bot
delivered on the exact predicted day (113302 day 83, 113305 day
140), paid exactly the two named veterans, and recorded the
capstone. On the other six seeds it never attempted a delivery —
including the two seeds whose tribute was ready but not
deliverable (the scholar-plus-one-villager split), which stayed
undelivered exactly as the ruling requires.

What delivery buys, on this band, is the deed — not the seat.
Both delivery villages still sit at the lesser seat at day 150:
the deed gate still fails on scale (national never reached, 0/8)
on every seed. The tribute line the game speaks at delivery —
"The seat is open" — is wrong on both seeds (see §3, a new
finding). What delivery costs is two people walking out of
Haven, and the villages absorb it: neither delivery village
spirals. The 113302 village ends the run with 9 people (one
fewer than its leg-1 twin) and a far fuller pantry (12,192 kcal
vs 800 — two fewer mouths for 67 days, plus a different
trajectory). The 113305 village ends with 7 (one MORE than its
leg-1 twin, which lost one more person late). The tribute price
is real but survivable on this band — the wall is still scale,
not the payment.

The delivery IS voiced, and the mercy window IS announced:
"◈ THE TRIBUTE — Avery and DeAndre walk out of Haven in the
table's service, two fighters the galaxy asked for by name.
The village is smaller tonight. The seat is open." followed by
"◈ THE TABLE — between now and the seat, the world holds its
breath. Nothing out there can take this from you." The second
line is half true: raids keep coming and keep taking food
(15 raid lines in the 67 days after the 113302 delivery), but
every one of them says "Nobody's dead," and no raid or roaming
kill is recorded after either delivery. The village still thins
after delivery (113302: 9 → 6 by day 146, before joiners bring
it back to 9) — but the thinning is unattributed attrition, not
raids. The mercy window holds lives, not food.

## §1. Per-seed table

Delivery = attempt record (day, kind, ok, veterans). trib =
military_tribute: firstReady / readyDays / firstDeliverable /
deliverableDays. w1..w5 = distinct monsters fought per wave
from the FINAL gate (full bar 5/5/4/3/2). Wait = waiting days.
OT = overtime tier at end. Pop = roster start → end.
Pantry = end.pantry kcal.

| seed | days | end | lesser | w1/w2/w3/w4/w5 | cont | cris | stage | peak | trib ready/deliv | delivery | wait | OT | pop | pantry |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 113301 | 150 | survived | d38 | 26/15/8/8/4 | 12 | 3 | 3 | 3 | d94 / 13d / – / 0d | none | 114 | 2 | 12→9 | 9,581 |
| 113302 | 150 | survived | d55 | 22/12/8/3/2 | 14 | 3 | 3 | 3 | d83 / 1d / d83 / 1d | d83 Avery+DeAndre ok:true | 97 | 2 | 12→9 | 12,192 |
| 113303 | 150 | survived | d48 | 23/13/9/7/0 | 17 | 3 | 3 | 3 | – / 0d / – / 0d | none | 104 | 2 | 12→5 | 200 |
| 113304 | 150 | survived | d42 | 23/14/8/8/2 | 14 | 3 | 3 | 3 | d103 / 9d / – / 0d | none | 110 | 2 | 12→5 | 1,000 |
| 113305 | 150 | survived | d72 | 14/9/5/6/3 | 16 | 3 | 3 | 3 | d117 / 7d / d140 / 1d | d140 Mara+Xavier ok:true | 80 | 2 | 12→7 | 10,446 |
| 113306 | 111 | village-lost | d52 | 22/12/7/5/0 | 15 | 4 | 3 | 3 | – / 0d / – / 0d | none | 61 | 1 | 12→6 | 0 |
| 113307 | 150 | survived | d42 | 22/14/8/8/0 | 12 | 4 | 3 | 3 | – / 0d / – / 0d | none | 110 | 3 | 12→2 | 782 |
| 113308 | 150 | survived | d45 | 22/13/4/5/0 | 19 | 3 | 3 | 3 | – / 0d / – / 0d | none | 106 | 2 | 12→8 | 8,446 |

Wall: wins 0/8, national 0/8, regional 8/8, table waiting
8/8, seated 0/8, entered 0/8, median survival 150d.
Readiness pooled (leg 2): tribute ever-ready 4/8 seeds
(30 ready-days — 1 of them is the delivery day itself on
each delivery seed; after delivery the entry reads
`delivered`, not ready), ever-deliverable 2/8
(2 deliverable-days, both delivered); charter ready 0/8
(0 days); feast ready 0/8 (0 days); delivered 2/8
(2 attempts, 2 ok). Full-seat bars at end: waves met 4/8
(113301, 113302, 113304, 113305), contests 8/8, crises 8/8,
scale 0/8, stageOk 8/8, foodDeeds 8/8, ladderPeak3 8/8,
capstone-delivered 2/8. Wave-5 reached (≥1 distinct w5
fought): 4/8 seeds.
Death-cause shares: null (NOT instrumented; reported null,
never faked).

Snapshot timing note (read the pop record right): snapshots
are top-of-day reads, taken BEFORE the policy's dawn
delivery. The payment therefore first shows in the NEXT
day's snapshot: 113302 pop is 11 on d83 in both legs and 9
on d84 in leg 2 vs 11 in leg 1; 113305 pop is 8 on d140 in
both legs and 6 on d141 in leg 2 vs 8 in leg 1. The
payment itself is verified live (paymentVerified true on
both seeds — the two paid ids are off the roster at
delivery time), so the one-day lag is a snapshot artifact,
not a half-payment.

## §2. Paired leg-1 vs leg-2 diff (the before/after)

The pairing is exact where it should be exact. On the six
non-delivery seeds, leg 2 reproduces leg 1 seed-for-seed:
same days, same end reason, same end pop, same end pantry
(113301: 9,581; 113303: 200; 113304: 1,000; 113306: 0;
113307: 782; 113308: 8,446 — all identical), same fireside
and table-line counts, same ready-days. The one-verb policy
changes nothing until the verb fires — which is the
determinism claim the paired design rests on, verified in
the corpus, not just assumed.

The two delivery seeds diverge only after the delivery day,
and only the way a payment should diverge them:

- **113302 (delivery d83, Avery + DeAndre).** Pre-delivery
  trajectories identical through d83 (pantry 69,894 on d83
  in both legs; gate w4 = 3 in both). Post-delivery: pop
  9 vs leg 1's 11 from d84 (the two paid veterans gone),
  holding 9 through d100, then thinning to 8 (d101), 7
  (d142), 6 (d146) before three joiners bring it back to 9
  at d147. Leg 1's twin holds 11 through d97 and ends at
  10. End pantry 12,192 vs leg 1's 800 — two fewer mouths
  for 67 days plus a different raid/harvest trajectory.
  Final gate waves still met (w4 = 3, w5 = 2 — the w5 count
  rose from leg 1's 1 on a different post-delivery fight
  history). Seat stays lesser; scale still unmet.
- **113305 (delivery d140, Mara + Xavier).** Pre-delivery
  identical through d140. Post-delivery: pop 6 vs leg 1's
  8 from d141, holding 6 through d148, then a joiner makes
  7 at d149. Leg 1's twin ends at 6 (it loses one more
  person late that the leg-2 village does not). End pantry
  10,446 vs leg 1's 1,550. The late delivery's 10-day tail
  is thin by design (prereg §6) — the survival-after-payment
  read on this seed is a 10-day observation, not a verdict:
  no death spiral in 10 days, one joiner, pantry far fuller.

Survival after payment, in one line per seed: 113302 —
67 days after paying two veterans, the village survives to
the horizon with 9 people and its fullest pantry on the
band; 113305 — 10 days after paying, it survives with 7
and its fullest pantry on the band. No post-delivery death
spiral on either seed. The tribute price is survivable
here — which makes the remaining wall (scale) sharper, not
softer: the village paid the blood price and still cannot
sit, because national never comes.

## §3. People check — full transcripts read (sense-testing)

Both delivery seeds read in full around the delivery
(fireside + table lines, d−2 to d+3) and the whole-band
voice checks re-run. Judged on meaning, not counts.

- **The delivery is voiced, and it lands.** 113302 d83:
  "◈ THE TRIBUTE — Avery and DeAndre walk out of Haven in
  the table's service, two fighters the galaxy asked for by
  name. The village is smaller tonight. The seat is open."
  113305 d140: the same line with Mara and Xavier. It is the
  one table line in the whole corpus that names the tribute
  (1 mention on each delivery seed, 0 anywhere else). A
  player watching sees two named people walk out and hears
  the village get smaller. That is the beat working.
- **"The seat is open" is wrong on both seeds — NEW
  FINDING.** The deed gate still fails on scale (national
  never reached) on both delivery seeds, and the seat stays
  lesser to day 150. The line is unconditional in code
  (`src/js/table.js:218` for the tribute; the charter
  `:232` and embassy `:246` say the same thing). A player
  who delivers the tribute is told the seat is open when it
  is not — the same overclaim would fire for any capstone
  delivered while the gate is still closed. Filed to
  sim-findings.md (§7). The honest line would wait for the
  gate, or say what is actually open (the deed is done; the
  seat still waits on scale).
- **The mercy window is announced, and half kept.**
  "◈ THE TABLE — between now and the seat, the world holds
  its breath. Nothing out there can take this from you."
  fires on both delivery days. What follows on 113302: 15
  raid lines in the next 67 days — food carried off
  (~1,400 kcal d84, ~1,000 d88, ~1,003 d94), garden plots
  trampled (d86, d89, d91) — but every raid line says
  "Nobody's dead," and no raid or roaming kill is recorded
  after either delivery. The world CAN still take food from
  you; it cannot take people. The line overpromises on food
  and keeps its promise on lives. On 113305 the 10-day tail
  has zero post-delivery table lines at all — quiet, not
  evidence either way.
- **The Algorithm trailer spam is REPRODUCED, counts
  identical to leg 1** (already filed, sim-findings.md
  line ~2776 — NOT re-filed): 113301 d90 8× identical
  ("The Algorithm trailers its next move at Manuel — the
  predictable get countered."), 113303 d71 4×, 113307 d118
  3×, 113308 d92 1×; thumbnail lines repeat identically too
  (113303: 41, 113305: 15, 113307: 35). Same seeds, same
  days, same counts as leg 1 — the pairing reproduces the
  defect exactly, which is also a second determinism
  confirmation. Still a spam defect, still needs a per-day
  dedupe.
- **The veteran-plan holdVoice collision is GONE on the
  delivery seed — and the reason is the delivery.** Leg 1
  heard "Avery has the kills for the table, but no one to
  walk out with yet — the party waits." on 113302 d120/d138
  (filed, sim-findings.md line ~2777). In leg 2 the line
  fires ZERO times on any seed: Avery walked out in the
  tribute on d83, so there is no veteran left holding that
  plan on d120/d138. The collision resolves itself when the
  tribute is paid — on the delivery seed, at least. The
  filed note stands for non-delivery seeds; no re-file.
- **The waiting-talk pool is still thin** (scalecensus §7
  arm #3, still open): 113302's 17 fireside lines are led
  by "Nobody's sleeping..." 6× and "Did you see their
  faces?..." 3×; 113305's 14 lines by "Did you see their
  faces?..." 4×. The lines are good; there are still not
  enough of them for a 100-day wait. The delivery adds one
  new table line to the wait, not a new fireside voice.
- **The begging line still goes unanswered** (113302 d81:
  "Hana waits two days at your fire, getting thinner.
  Nobody answers... They'll remember the silence."). The
  bot never answers food petitions; the third reading knows
  how the scene ends. Unchanged from leg 1.

## §4. Reachable / fun / winnable — the delivery leg

- **Reachable: the tribute YES — and now delivered, not
  just ready.** The delivery verb fires exactly on the
  predicted seeds and days, pays cleanly, and records. The
  charter and feast are still unreachable on this band
  (0 ready-days each, same blockers as leg 1).
- **Fun: the delivery is a story beat, and the wait after
  it is honest.** Two named people walk out; the village
  gets smaller; the table says the world holds its breath
  and then raids keep taking food while sparing lives.
  The beat works; its two lines overclaim ("The seat is
  open", "Nothing out there can take this from you") and
  should be fixed before a player meets them (see §3).
- **Winnable: one bar closer, the wall unchanged.** The
  capstone-delivered bar now reads 2/8 (was 0/8, half
  artifact). The full seat still needs scale (0/8) — and
  on the delivery seeds, that is now the ONLY unmet bar
  besides nothing else on 113302/113305 (waves met,
  contests/crises met, stage met, food deeds met, peak met,
  capstone delivered). A sitting policy plus a national
  road is what stands between these two villages and the
  seat; the delivery verb is no longer in the way.

## §5. Limits, confounds, corrections (read before citing)

1. **"Delivered 2/8" measures the bot + the band, not the
   deed's difficulty.** The verb fires only where leg 1
   found deliverable villages (2/8). Do not cite 2/8 as
   "the tribute is deliverable a quarter of the time" in
   general — it is deliverable on 2/8 of THIS band, on the
   predicted days, because those villages banked two
   payable veterans.
2. **Ready-days collapse after delivery is by design.**
   Leg 2's tribute ready-days (30 pooled) are far below
   leg 1's (108) because a delivered capstone reads
   `delivered`, not ready, for the rest of the run. The
   113302 ready-days read 1 (the delivery day) vs leg 1's
   69. That is the recorder working, not readiness
   vanishing — cite ever-ready / ever-deliverable, never
   pooled ready-days, across legs.
3. **The 113305 tail is 10 days.** The late delivery's
   survival-after-payment read is thin by design (prereg
   §6). "No death spiral in 10 days" is the whole claim
   for that seed.
4. **Death causes are not instrumented.** The post-delivery
   thinning on 113302 (9 → 6 by d146) has timing but no
   cause; the corpus cannot say whether those were age,
   hunger, fights, or something else. `deathCauseShares`
   is null in the wall — reported, never faked.
5. **Mercy-window scope.** The prereg's expectation was
   "no raid or roaming monster can kill villagers" — the
   corpus shows raids continuing and taking food. That is
   consistent with the expectation as written (lives, not
   food), but a player reading "Nothing out there can take
   this from you" will expect the food to be safe too. The
   finding is filed as a voicing overclaim (§3), not as a
   mercy failure.
6. **Telemetry n=9:** the telemetry glob picks up
   summary.json alongside the 8 per-seed rows (same as
   leg 1). The LOUD lines below are counted over 9 files;
   the per-seed numbers are unaffected.

## §6. Metric review

- Frozen bars held; no re-scoring. Every §2 bar passed on
  the first read: both predicted deliveries, zero extras,
  zero half-payments, coverage 1.000, reconciliation 0,
  errors 0, determinism byte-identical, pool 8/8.
- The primary metric as specified (the delivery record
  against the leg-1 prediction) proved to be exactly the
  right instrument: the prediction was day-exact on both
  seeds, and the zero-extra-attempts clause caught what a
  looser metric would have missed (the 113301/113304 split
  windows stayed undelivered).
- One metric note for the NEXT run: the GO bar's (b) clause
  ("ZERO attempts on non-deliverable days") is only
  observable because the policy logs attempts and the
  driver harvests them — a policy that attempted and
  refused silently would have passed (b) while failing the
  spirit. The attempt log is the instrument; keep it.
- The snapshot-timing lag (§1) is a recorder property the
  next arm should know: delivery-day snapshots predate the
  delivery. Any future arm reading "pop on delivery day"
  must read d+1.
- Death-cause shares were listed as a secondary metric but
  the driver never instrumented them — same gap as leg 1
  (§5.4; scalecensus §7 arm #4 still open).

## §7. Next arms (named from this proof)

1. **SITTING POLICY + NATIONAL ROAD (the seat, at last).**
   The delivery verb is proven; the capstone bar is now
   2/8 delivered on this band, and on both delivery seeds
   scale is the ONLY remaining unmet full-seat bar. The
   next arm is a policy that sits when the gate opens plus
   whatever opens the national road — the sibling
   sim-scalerank-a arm is the live attempt at the road;
   the sitting policy is the missing half. Needs its own
   prereg, frozen before any judged sim.
2. **"The seat is open" voicing fix** — the delivery
   announcement overclaims while the deed gate is still
   closed (table.js:218, :232, :246 — all three kinds).
   Filed to sim-findings.md from this run. Small fix,
   flag `[needs-eyes]` if landed (player-facing line).
3. **Charter-readiness diagnostic** — still blocked until
   a band reaches national (sibling sim-scalerank-a is the
   live attempt); do not run it on a competent band that
   never gets there. (Carried from leg 1.)
4. **Feast-bundle completion** — the bundle never
   completes (open finding 2026-11-11, sim-feastfirst-a).
   (Carried from leg 1.)
5. **Waiting-talk variety** (scalecensus §7 arm #3, still
   open) — confirmed again on this band. (Carried from
   leg 1.)
6. **Death-cause recorder** (scalecensus §7 arm #4, still
   open). (Carried from leg 1.)
7. **Voice findings from this run:** the Algorithm trailer
   spam is REPRODUCED with identical counts (already filed,
   sim-findings.md ~2776 — not re-filed); the holdVoice
   collision is GONE on the delivery seed because the
   delivery removed the speaker (already filed, ~2777 —
   not re-filed); NEW filing: the delivery announcement's
   "The seat is open" overclaims while the deed gate is
   closed (both delivery seeds), and the mercy-window line
   "Nothing out there can take this from you" overpromises
   on food while raids continue (15 post-delivery raid
   lines on 113302, all "Nobody's dead").

## §8. Infrastructure

- **Write flap:** probed `git update-ref refs/heads/probe
  HEAD` before material writes (05:33Z, and again before
  writing the analysis JSON) — both passed. No flap window
  hit this run.
- **Heartbeat skipped once:** `worktree-heartbeat.sh
  sim-capstoneready-a` at ~05:37Z reported "registry lock
  held > 120s — heartbeat skipped, retry later" (registry
  contention, likely the sibling loop or coordinator
  holding the lock). Retried after the pilot; the run's
  worktree stayed registered throughout and no reaper
  action touched it. Recorded here, not hidden. (Same
  contention leg 1 hit at ~04:25Z.)
- **Machine restart (05:15Z) is the reason this leg is a
  continuation:** the dead 0315Z run's worker left the
  leg-2 instruments uncommitted and no judged sims run
  when the machine restarted. This continuation verified
  the inherited state first (branch HEAD e1a1fa5cb, four
  uncommitted instrument files, no leg-2 corpus), then
  ran the proof test, pilot, and analysis from the frozen
  prereg. No work was lost; nothing was re-run that had
  already been judged.
- **Proof test:** 32/32 GREEN before the pilot (staged
  delivery ok:true + payment verified, split refusal,
  driver 30d smoke, determinism spot check).
- **Determinism:** seed 113302 full-150d re-run after the
  pilot is byte-identical to its pilot file.
- **No EPERM. No lock contention with the fleshout loop
  (its trees untouched) or with Loop B (its trees,
  branches, and files untouched).**

## §9. Telemetry deviation check + closeout

Run on the pilot corpus:
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-28/perseed-capstoneready-a-leg2-arm/*.json'
--metrics national,table,wins,exiled`

- LOUD: national 12 → 0. LOUD: wins 16 → 0. Table and
  exiled did not fire.
- Verdict: **regime artifact, no investigation item,
  baseline NOT rolled.** Same as leg 1 (§9) and the
  scalecensus (§9): the baseline's own `_regime` note says
  it is the winseat regime (full win-side stack, national
  12/16, wins 16/16) and forbids comparing pre-seat /
  readiness substrates against it — wins are structurally
  ~0 there. This band is competent verbatim + one policy
  verb, no seat stack, and the two nearest competent bands
  agree (scalecensus 113101–113108: national 0/8, wins 0/8;
  launchfit 111101–111108: national 0/8, wins 0/8). The
  one change this leg makes (the delivery verb) moves the
  capstone-delivered bar 0/8 → 2/8 and nothing else on the
  wall — no regression.

Closeout (this run): leg-2 instruments committed with the
evidence + corpus; rebased twice before landing — first onto
origin/master 2b25d4be0 (proof re-green 32/32), then onto
local master fb4b4dcc8, which had moved ahead with the
sibling sim-fleefloor-a merge (proof re-green 32/32 again;
evidence header hashes updated to final post-rebase values
in a follow-up commit); merged to local master via --ff-only;
worktree left clean (committed work only). No push, no version
bump, no live verification — the ship loop owns those. "Merged
locally, pending ship."
