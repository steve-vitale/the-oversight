# sim-seatvoice-a — capstone delivery announcement, voicing fix

**Arm:** sim-seatvoice-a · **Loop A run:**
fleshout-20261128T0515Z · **scalecensus §7 next arm #2**
**Type:** VOICING-ONLY fix (zero gating, pricing, or behavior change;
never gate the Table on godhood)
**Prereg:** `evidence/2026-11-28/sim-seatvoice-a-prereg.md`
(frozen 2026-11-28 ~07:15 UTC, before any code change or judged sim)
**Branch:** `sim-seatvoice-a` (worktree
`~/workspace/worktrees/sim-seatvoice-a`).
**Base at pilot:** master tip `bcf06e019` (worktree HEAD == local
master tip at freeze; no rebase needed before landing — see §9).
**Band:** 113301–113308 (SAME band as leg 2 — the pairing is the
design), competent-capstonedeliver-a (competent verbatim + the
tribute delivery verb at dawn), NO substrate flags, 150d
death-aware.
**Corpus:** `evidence/2026-11-28/perseed-seatvoice-a-arm/`
(8 per-seed JSONs + summary.json).
**Analysis JSON:** `evidence/2026-11-28/seatvoice-analysis.json`
(analyzer --json: verdict + wall + per-seed rows).
**Commits on branch:** (filled at landing).

## Verdict: GO

| Bar (prereg §2) | Result |
|---|---|
| (1) Closed-gate delivery never overclaims (both delivery seeds) | 113302 d83 + 113305 d140: tribute line carries "The deed is done — the seat still waits on the deeds.", never "The seat is open", deed-gate snapshot ok:false on both delivery days — PASS |
| (2) Open-gate delivery still says it (staged proof) | proof test 52/52: all three kinds deliver "The seat is open." with deedGateReady().ok === true asserted before the delivery — PASS |
| (3) Determinism (no other transcript line changes) | before/after corpus diff: exactly 2 changed lines per delivery seed (delivery + mercy), 0 diffs on the other 6 seeds; 113302 re-run byte-identical — PASS |
| (4) Mercy line no longer overclaims | "Nothing out there can take this from you" appears 0 times in the after corpus; delivery-day mercy line is exactly the frozen text on both seeds — PASS |
| Instrument errors | 0 — PASS |

The lie is gone on both delivery seeds, the true line still fires
when the gate is open, nothing else in the transcript moved, and
the mercy line is honest. **GO.**

## §0. The answer, in plain words

The game used to tell the player the seat was open at the exact
moment two named people walked out of Haven to pay for it — while
the seat was not open at all. Both delivery villages still sit at
the lesser seat at day 150 because national standing never comes.
Now the announcement says what is actually true: the deed is done,
and the seat still waits on the deeds. The mercy line used to
promise nothing out there could take anything from you — while
raiders kept carrying food out of the pantry the same night. Now it
promises exactly what the mercy window does: the wild can still
take your food, but it cannot take your people. Nothing else
changed: same deliveries, same days, same veterans, same villages,
same numbers — the whole band's transcripts are identical except
for those four lines (two per delivery seed). This arm changes
voice, not balance, and it is judged on the frozen bars, not on win
rates: national 0/8, wins 0/8, median survival 150d — exactly as
leg 2, as a voicing change must be.

What changed in code (`src/js/table.js`, +36/−6): two small
helpers before `ladderDeliverCapstone`, called from all three
delivery branches (tribute / charter / embassy):
- `_capstoneSeatLine()` reads the deed gate live at delivery time
  (`deedGateReady()` — waves, contests, crises, stage, food deed,
  national scale). Gate open: "The seat is open." (unchanged).
  Gate closed: "The deed is done — the seat still waits on the
  deeds." Fail-closed: an unreadable gate reads as closed.
- `_capstoneMercyLine()` returns "◈ THE TABLE — between now and
  the seat, the world holds its breath. The wild can still take
  your food — but it cannot take your people." The "world holds
  its breath" half is kept; the overpromising sentence is replaced
  by exactly what the mercy window does and does not do.

## §1. Per-seed table

Delivery = attempt record (day, kind, ok, veterans). All numbers
verified IDENTICAL to leg 2 by the corpus diff (bar 3: zero
non-line diffs on any seed) — the table is leg 2's table, re-read
from the after corpus, not re-typed.

| seed | days | end | lesser | w1/w2/w3/w4/w5 | cont | cris | stage | peak | delivery | wait | OT | pop | pantry |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 113301 | 150 | survived | d38 | 26/15/8/8/4 | 12 | 3 | 3 | 3 | none | 114 | 2 | 12→9 | 9,581 |
| 113302 | 150 | survived | d55 | 22/12/8/3/2 | 14 | 3 | 3 | 3 | d83 Avery+DeAndre ok:true | 97 | 2 | 12→9 | 12,192 |
| 113303 | 150 | survived | d48 | 23/13/9/7/0 | 17 | 3 | 3 | 3 | none | 104 | 2 | 12→5 | 200 |
| 113304 | 150 | survived | d42 | 23/14/8/8/2 | 14 | 3 | 3 | 3 | none | 110 | 2 | 12→5 | 1,000 |
| 113305 | 150 | survived | d72 | 14/9/5/6/3 | 16 | 3 | 3 | 3 | d140 Mara+Xavier ok:true | 80 | 2 | 12→7 | 10,446 |
| 113306 | 111 | village-lost | d52 | 22/12/7/5/0 | 15 | 4 | 3 | 3 | none | 61 | 1 | 12→6 | 0 |
| 113307 | 150 | survived | d42 | 22/14/8/8/0 | 12 | 4 | 3 | 3 | none | 110 | 3 | 12→2 | 782 |
| 113308 | 150 | survived | d45 | 22/13/4/5/0 | 19 | 3 | 3 | 3 | none | 106 | 2 | 12→8 | 8,446 |

Wall: wins 0/8, national 0/8, regional 8/8, table waiting 8/8,
seated 0/8, entered 0/8, median survival 150d. Delivered 2/8
(2 attempts, 2 ok). Death-cause shares: null (NOT instrumented;
reported null, never faked — same gap as leg 1/2).

## §2. Paired leg-2 vs seatvoice diff (the before/after)

The analyzer (`scripts/analyze-seatvoice-a.js`, verdict in
`seatvoice-analysis.json`) diffs the two corpora parsed-JSON,
field by field:

- **113302:** exactly 2 differing lines, both on day 83:
  the tribute line ("The seat is open." → "The deed is done —
  the seat still waits on the deeds.") and the mercy line
  ("Nothing out there can take this from you." → "The wild can
  still take your food — but it cannot take your people.").
  Every snapshot, every other table/fireside line, the delivery
  record, end state, pantry — identical.
- **113305:** exactly 2 differing lines, both on day 140:
  the same two substitutions (Mara + Xavier). Everything else
  identical.
- **113301, 113303, 113304, 113306, 113307, 113308:** ZERO
  diffs — byte-identical corpora. A voicing change moved no
  number, on any seed.
- **Determinism:** seed 113302 re-run after the pilot into a
  temp OUTDIR is byte-identical to its pilot file.

The delivery-day deed-gate snapshots read ok:false on both
seeds (113302 d83: waves false — w5 0/2 — crises false — 2/3 —
scale false — regional; 113305 d140: scale false), so the
closed-gate line is the honest one on the day it fires.

## §3. People check — full transcripts read (sense-testing)

Both delivery seeds read in full around the delivery
(fireside + table lines, d−2 to d+3). Judged on meaning, not
counts.

- **The delivery is voiced, and it is honest now.** 113302 d83:
  "◈ THE TRIBUTE — Avery and DeAndre walk out of Haven in the
  table's service, two fighters the galaxy asked for by name.
  The village is smaller tonight. The deed is done — the seat
  still waits on the deeds." 113305 d140: the same line with
  Mara and Xavier. A player watching sees two named people walk
  out, hears the village get smaller, and is told the truth
  about what the payment bought: the deed, not the seat. The
  line no longer promises a seat the village cannot sit in.
- **The mercy line is honest the same night it fires.**
  113302 d83: "◈ THE TABLE — between now and the seat, the
  world holds its breath. The wild can still take your food —
  but it cannot take your people." That night Deshawn of The Red
  Table stands at the treeline demanding ~2,000 kcal ("Your
  pantry or your blood. Choose."), and on d84 his people take
  800 kcal from the stores while nobody dies — plus a second
  raid the same day carrying off ~1,400 kcal, "Nobody's dead."
  The old line would have lied within 24 hours of being spoken;
  the new line stays true through both raids. The 15
  post-delivery raid lines on 113302 still read the same, and
  the line now agrees with them instead of contradicting them.
- **The waiting talk around the delivery reads differently
  now, without changing a word of it.** 113305 d138, two days
  before Mara and Xavier walk out: "The table's set. The ring
  of pale light — it's just sitting there. Waiting on them.
  What do you think they'll tell it?" Under the old line that
  was dramatic irony the game did not intend; under the new
  line it is plain foreshadowing — the seat genuinely waits,
  and the delivery does not pretend otherwise.
- **Nothing else in the voice moved.** Fireside counts
  identical to leg 2 (113302: 17 lines; 113305: 14 lines);
  the waiting-talk pool is still thin (same finding, still
  open — scalecensus §7 arm #3); the begging line still goes
  unanswered (113302 d81, Hana — unchanged); the Algorithm
  trailer spam is reproduced with identical counts (already
  filed — not re-filed).

## §4. Reachable / fun / winnable — the voicing leg

- **Reachable: unchanged, by design.** The tribute still
  delivers on the same seeds and days; the charter and feast
  are still unreachable on this band (0 ready-days each). The
  fix touches no gate, so reachability cannot have moved —
  and the corpus proves it did not.
- **Fun: the delivery beat now tells the truth.** Two named
  people walk out; the village gets smaller; the table says
  the deed is done and the seat waits, and the world holds its
  breath while the wild still steals food but takes no one.
  The beat was already a story; now it is an honest one. A
  player who delivers the tribute and then watches raids carry
  off food will no longer feel lied to by the game's own
  announcement.
- **Winnable: unchanged.** The capstone-delivered bar is still
  2/8; the full seat still needs scale (0/8). The wall is
  exactly leg 2's wall — which is the point. The next arm is
  still the sitting policy + national road, not this fix.

## §5. Limits, confounds, corrections (read before citing)

1. **The seat clause is gated on the deed half only** (prereg
   §1, KNOWN LIMIT). The full seat additionally needs ladder
   peak ≥ 3 (`tableSeat()`). A village with the deed gate met
   but ladder peak short hears "The seat is open" while the
   FULL seat waits on peak; the lesser seat is open in that
   state in practice, and the seat audit (`fullSeatShortfall`)
   names a peak shortfall aloud. Gating the line on the full
   seat instead is a one-line change to the helper, if Steve
   wants it.
2. **The charter and embassy branches never fire in the
   corpus** (charter ready 0/8, feast ready 0/8 on this band —
   same blockers as leg 2). Their new lines are proved only in
   the staged proof test (all three kinds, both gate states,
   52 checks), not in a live sim. The shared helpers are the
   same code the tribute branch proved in the corpus; the
   branch-level proof is the test, stated here rather than
   claimed from the corpus.
3. **The 113305 tail is 10 days.** Same thin tail as leg 2;
   the survival-after-payment read for that seed is a 10-day
   observation, not a verdict.
4. **Death causes are not instrumented.** Same gap as leg 1/2
   (§5.4 there; scalecensus §7 arm #4 still open).
5. **Telemetry n=9:** the telemetry glob picks up summary.json
   alongside the 8 per-seed rows (same as leg 1/2). The LOUD
   lines below are counted over 9 files; the per-seed numbers
   are unaffected.
6. **check.js --quick: 335 passed, 9 failed in 1586s** — every
   failure observed in the tail is a 120.0s TIMEOUT under load
   (sibling rejudge-b drivers running concurrently), not an
   assertion failure (named in the tail: trust-observer-
   neutrality, capable-bot; slowest list names living-garden-
   deed-attainment, occupation-panels). The full list of 9 was
   not captured (output piped through tail). Directly re-run
   after the fix, all green: the predecessor delivery proof
   (test-capstoneready2-a.js 32/32), ladder bundle (79/79),
   ladder cashout (35/35), lingering-raid control (GREEN).
   This arm's own proof test is 52/52.
7. **Pre-existing stale test (filed, not fixed here):**
   `scripts/test-fullseat-stage-a.js` fails 9 checks on this
   base (13 passed) — `tableSeat()` returns 'none' even with
   full deed legs, because the LADDER leg-2 bars (peak ≥ 3 +
   capstone for full, peak ≥ 1 for lesser) were added to
   `tableSeat()` after the test was written and the test was
   never updated; a fresh staged game has ladder peak 0.
   `deedGateReady().ok` behaves correctly in every cell (the
   part this arm's helper reads). The test is in neither the
   green list nor quarantine, so it does not gate check.js.
   Filed to sim-findings.md from this run; fixing the test is
   outside this voicing arm's scope.

## §6. Metric review

- Frozen bars held; no re-scoring. Every bar passed on the
  first read: both delivery seeds honest, staged open-gate
  delivery says it, determinism exact (2 lines per delivery
  seed, 0 elsewhere, byte-identical re-run), mercy line
  honest corpus-wide.
- The primary metric as specified (the before/after corpus
  diff plus the staged open-gate proof) proved to be exactly
  the right instrument: the diff is the whole verdict — four
  changed lines in 8 seeds, nothing else — and the staged
  proof is what the corpus cannot show (the open-gate line
  never fires on this band, because the gate never opens).
- One metric note for the NEXT run: bar (3)'s "only the
  delivery + mercy lines may differ" is only observable
  because the analyzer diffs parsed JSON field by field — a
  byte diff would have flagged nothing extra here (the JSON
  writer is deterministic), but a future arm whose fix moves
  a number would want the same field-level diff to name the
  moved field, not just the file. Keep the analyzer.
- The proof test's open-gate cells stage the deed gate with
  the fullseat-stage-a pattern (wavesFaced + contests +
  crises + sentimentTaught + nationalLive + integration 45).
  That pattern's `tableSeat()` expectation is stale (see §5.7)
  — the test asserts `deedGateReady().ok` only, never the
  seat, so the staleness cannot leak into this arm's verdict.
- Death-cause shares were listed as a secondary metric but
  the driver never instrumented them — same gap as leg 1/2.

## §7. Next arms (named from this proof)

1. **SITTING POLICY + NATIONAL ROAD (the seat, at last).**
   Carried from leg 2, unchanged: the delivery verb is proven,
   the capstone bar is 2/8 delivered, and on both delivery
   seeds scale is the ONLY remaining unmet full-seat bar. The
   sitting policy plus a national road is what stands between
   these two villages and the seat.
2. **Full-seat vs deed-gate wording call (Steve-call, small):**
   the delivery line is gated on the deed half only (§5.1). If
   Steve wants "The seat is open" to mean the FULL seat, the
   helper gates on `tableSeat() === 'full'` instead — one line.
   Otherwise the current wording stands.
3. **Stale fullseat-stage-a test** — filed (§5.7): update the
   test to the ladder-peak bars (or quarantine it with the
   reason). Any arm touching `tableSeat()` should take it.
4. **Charter-readiness diagnostic** — still blocked until a
   band reaches national (sibling sim-scalerank-a is the live
   attempt); do not run it on a competent band that never gets
   there. (Carried from leg 2.)
5. **Feast-bundle completion** — the bundle never completes
   (open finding 2026-11-11, sim-feastfirst-a). (Carried.)
6. **Waiting-talk variety** (scalecensus §7 arm #3, still
   open) — confirmed again on this band. (Carried.)
7. **Death-cause recorder** (scalecensus §7 arm #4, still
   open). (Carried.)
8. **Voice findings from this run:** none new — the two leg-2
   voice findings are FIXED by this arm (see §9); the
   Algorithm trailer spam is reproduced with identical counts
   (already filed — not re-filed).

## §8. Infrastructure

- **Write flap:** probed `git update-ref refs/heads/probe HEAD`
  before every material write (prereg, pilot, band, analysis
  JSON) — all passed. No flap window hit this run.
- **Heartbeat:** `worktree-heartbeat.sh sim-seatvoice-a`
  reported "registry lock held > 120s — heartbeat skipped,
  retry later" TWICE (~07:17Z and ~08:15Z; registry contention,
  likely the sibling rejudge-b run holding the lock — same
  contention leg 2 hit twice). No heartbeat landed this run.
  The worktree stayed registered throughout; it was dirty
  (uncommitted work) the whole run, so the reaper could not
  have touched it in any case. Recorded here, not hidden.
- **Machine:** no restart hit this run.
- **Proof test:** 52/52 GREEN before the pilot (all three
  kinds × both gate states, end-to-end through the real
  `ladderDeliverCapstone()`, plus driver determinism).
- **Determinism:** seed 113302 full-150d re-run after the
  pilot is byte-identical to its pilot file.
- **No EPERM. No lock contention with the fleshout loop (its
  trees untouched) or with Loop B (its trees, branches, and
  files untouched).**

## §9. Telemetry deviation check + closeout

Run on the after corpus:
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-28/perseed-seatvoice-a-arm/*.json'
--metrics national,table,wins,exiled --allow-recorder-corpus`

- LOUD: national 12 → 0. LOUD: wins 16 → 0. Table and
  exiled did not fire.
- Verdict: **regime artifact, no investigation item,
  baseline NOT rolled.** Same as leg 1 (§9) and leg 2 (§9):
  the baseline's own `_regime` note says it is the winseat
  regime (full win-side stack, national 12/16, wins 16/16)
  and forbids comparing pre-seat / readiness substrates
  against it — wins are structurally ~0 there. This band is
  competent verbatim + one policy verb, no seat stack, and
  the two nearest competent bands agree (scalecensus
  113101–113108: national 0/8, wins 0/8; launchfit
  111101–111108: national 0/8, wins 0/8). The one change
  this leg makes (two `say()` strings) moves no number on
  the wall — the corpus diff proves it — so there is nothing
  to investigate and nothing to roll.

Closeout (this run): [to be completed at landing — heartbeat
retry outcome, commit hashes, merge result].
