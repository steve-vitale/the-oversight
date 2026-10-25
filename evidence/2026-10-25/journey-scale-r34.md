# journey-scale r34 — WHAT GROWS COVENANT TRUST (2026-10-25, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261025T1443Z. Rotation read 3 → leg 3 SCALE
(days 80–140); write 3→0 on completion.
**Base:** master@4f99a66b6 (pulled at run start).
**Driver:** `scripts/journey-scale-r34-20261025.js` (r33 driver + daily trust
instrument only; picker cap inherited, R32 SUMMARY label fixed to R34).
**Analyzer:** `scripts/analyze-scale-r34-20261025.js` (r33 analyzer + daily
trust-delta attribution). **Proof test:**
`scripts/test-journey-scale-r34-trustdelta.js` (14/14 on r34, RED on r33).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED from r33.
Standing scalecourt.js untouched. Zero src/js changes.
**Pre-register:** `evidence/2026-10-25/journey-scale-r34-prereg.md` (written
before any sim).
**Seeds:** MATCHED to r30–r33: 85001–85004. Same horizon (DAYCAP=150,
death-aware stop). Pilot seed 85001 ran first and passed the prereg gate
(1 pilgrimage, 132 covenant snapshots, no crash) before the other three
launched — then died at d71 (see Divergence below).

## Pre-registered leg question

r33 measured the split but could not explain it: covenants formed ≤ d77
climb to season (peaks 65–89); covenants formed ≥ d91 stall at peak 35–38
and decay, never reaching trust 40 — while primary-sub links climb and
the policy's tended counter is 0 everywhere. r34's instrument is the one
r33 asked for: DAILY trust snapshots per link plus every new entry in the
engine's own day-attributed link book (history is capped at 40 entries,
so only daily diffing preserves it).

## The instrument (driver only, one change)

Every simulated day, after the policy's daily step, the driver snapshots
every active link (trust, poolLive, lastKeptDay, mourningUntil, arrears,
pending flags) and diffs each link's history against the previous day,
appending only NEW entries as trustEvents. Weekly census, govWatch,
transcripts, and picker cap are all r33-identical.

## Verdicts (binding — none re-scored)

- **TRUST1 pool-phase mechanism: NO-GO as written.** poolLive never went
  live on 3/4 seeds, and on the 4th (85002) only on the final day (d150,
  the national day itself). There is no pre/post-pool comparison to judge:
  the pool regime is unobserved, not refuted. The pool hypothesis is
  carried open, NOT confirmed and NOT claimed dead.
- **TRUST2 late-bond stall: NOT CONFIRMED — formation day is the wrong
  discriminator.** Late-formed bonds did NOT uniformly stall: 85002's
  d93–100 bonds reached 49–52 (ever40 on all three), while 85003's
  d88–89 bonds stalled at 25–28 and 85004's d71 bond at 24. The stall
  holds on 2/3 late-bond seeds but the 85002 exception breaks the
  formation-day rule — and the exception is explained by gains, not by
  formation day (see Mechanisms). r33's "late stall" generalizes to
  "crisis-bled stall" (r35's pre-registered question).
- **PICK-G picker-cap guard: GO.** All 5 transcripts that exist (85001
  died before d90, 85003 before d120 — death-aware stop, not missing
  data): max consecutive dlg:more/goon 0, 0, 0, 0, 1; post-deflect goon 0.
  The inherited cap did not regress.
- **BONDS/NATIONAL (report-only):** third bond by d110: 85001 had 3
  covenants by d28 (then died d71); 85002 had 3 by d100; 85003 had 2;
  85004 had 1. National by d140: 0/4 — 85002 reached national on d150,
  ten days past the window. Counts moved with the base (see Divergence),
  not the instrument.
- **L5 stay-green: GO.** Every ending voiced in full: 85001 die-out
  ("No one is left to pick up the Codex. The village dies out"),
  85003 famine scatter ("Haven couldn't hold... people started
  walking"), 85002/85004 alive at the cap (no ending owed).

## Mechanisms verified in the wild (day-attributed, not just in code)

- **Deeds feed the bond, silently.** Every villager deed grants each
  covenant/trade link +1..+4 (`recordDeed` in hierarchy.js: gain =
  min(4, max(1, round(magnitude/4))), NO history note, NO say line —
  only lastKeptDay stamps it). Gain days are SHARED across all covenant
  links on a seed (85001: d29, 34, 36, 43, 44, 46, 48, 50, 55, 57, 59, 60,
  64; 85002: d109, 110, 111, 113, 114, 115, 120, 121, 123, 129, 134, 141,
  149; 85003: only d92, 96, 106). A player cannot see this movement: the
  voiced half of trust (crises) works, the silent half is a legibility
  blank (see Blanks).
- **Deaths tax the bond, aloud, at −2 a death.** Every bearer death
  fires a leader-death crisis on every covenant link (−10 trigger; the
  policy concedes, +8) — net −2 per death when trigger and concession
  land the same day, −1/−2 split across days when they straddle the
  snapshot. Policy answers every crisis with concede (policy line 93–94;
  every crisis in the run has a matching concession note).
- **The arithmetic closes per link.** 85001 (3 links, identical): 30 +
  accord gift +10 + deed gains ≈ +20 − 5 crises × 2 ≈ 51 final (peak 55;
  residual +1 from a crisis day offset by a same-day deed). 85002
  village_2: 30 + deed/council gains − 2 crises → 52 final (national
  day itself: 38 → 49 on village_1, including the +8 council war-pact
  gain). 85003 village_2: 30 + 3 deed gains − 4 crises × 2 = 25 (final
  26, residual +1). 85004 village_0: 30 + 15 deed gains − 6 crises × 2
  − silent drops (below) = 24 final.
- **Accord gifts are not guaranteed.** 85001's three covenants each got a
  first-gesture gift (+10, 2,000–2,200 kcal); 85002/85003/85004's covenants
  got NO accord entry at all — yet 85002's still seasoned on deeds +
  council alone. The accord is a head start, not the mechanism.
- **Formation day does not predict seasoning; crisis rate vs deed rate
  does.** 85002's late bonds: 2–5 crises over ~50 days + 14–19 deed-gain
  days → seasoned. 85003's bonds: 4 crises in 22 days + 3 deed-gain days
  → bled to 25–28. 85004's bond: 6 crises over 80 days + 13 deed-gain
  days → 24 (plus silent drops). 85001's bonds: 5 crises over 44 days +
  14 deed-gain days + accord → 51.
- **Silent −4/−5 drops: unattributed, reported, not explained.** Four
  instances, all within 1–3 days after a crisis, with NO history entry
  and lastKeptDay unchanged: 85004 village_0 d123 (−5) and d143 (−5),
  85002 village_2 d147 (−5), 85002 village_spl d127 (−4). The engine's
  book does not name a writer for them (renegotiateLink's −5 is
  subordinate-only; the −8 succession haircut runs on primary-sub links
  via successionCrisis, not on covenant links). Small against total
  movement, but a real gap: r35 needs _trustGain call-site logging to
  attribute silent moves exactly, because the book alone cannot.

## Divergence (base movement, instrument proven neutral)

r33's 85001 (global d83, alive to d150) now DIES OUT at d71 on current
master: arena deaths chain the bearers (d70: five player-flagged arena
deaths; d71: two more; "No one is left to pick up the Codex"). CONTROL:
the unmodified r33 driver on the same base, same seed, produced the
BYTE-IDENTICAL outcome line (day 71, pop 0/0, pantry 10,338, covenants
42/42/42) — the die-out is base movement between r33's f810314b8 and
4f99a66b6 (belltoad/postflee/poolpres landings among others), NOT the
r34 instrument. Which landing moved the arena chain is a bisect for the
contest/arena lane, not this run. 85002 also moved: r33 regional →
r34 national d150 + lesser seat. Matched seeds are matched at world-gen
only, restated.

## Village assessments (plain words)

- **85001 (died out d71):** the league that seasoned and then lost its
  speakers. Three covenants at trust 51–55, seasoned, plus a primary-sub
  at 24 and falling — and nobody left to carry the mantle. The village
  did not starve (pantry 10,338); it ran out of people.
- **85002 (national d150, alive 10/10, lesser seat waiting):** the realm
  that arrived at the table hungry. Three covenants at 49–52 after the
  national council jump, pantry 348 — global was never reached, but the
  table approach is real.
- **85003 (scattered d110):** the famine village. Pantry empty on the
  fifth hungry day, people walked in different directions. Its two
  covenants bled out with it (25–28, never seasoned) — four bearer
  deaths in 22 days, three deed-gain days.
- **85004 (alive d151, regional, lesser seat waiting):** the thin village
  that held. Pantry 1,000, one covenant at 24 (six crises, sparse deeds),
  its primary-sub bond collapsed to trust 0 under arrears (8 arrears
  notes, repeated demands) — the subordinate road broke while the
  covenant road limped.

## People check (SENSE-TESTING LAW — 5 transcripts read in full)

- **85002-d120 Elena (ask_favor, pantry run):** GO. Details engaged
  ("I did the count twice. The count doesn't change."), deflect taken
  with consequence ("They won't ask twice"), clean leave.
- **85002-d90 Ariana (ask_favor, hungry hands):** GO, short. Commit made
  ("I'll come back to help"), resolution ("I won't forget who fed me").
- **85003-d90 Joshua (seek_taken, taken kin):** GO, strong. The game
  knows Theo died d89 in the arena ("Theo's gone") — Joshua's question
  is coherent with the world, and the commit ("Even asking is more than
  the silence") lands.
- **85004-d90 Dorothy (curious, regrets):** GO. "I regret the ordinary
  days I rushed through... I'd pay anything for one annoyed morning now"
  — a villager with a past, not a menu.
- **85004-d120 Dorothy (ask_favor stage 2, quietly mapping the roads
  out):** DRIVER DROP, not a content fail. The opening is a real want
  (a villager planning to leave, quietly), but its choices are
  betrayal:accept/decline, which the driver's picker does not handle —
  so the driver leaves immediately and the thread is never engaged.
  Next run's driver should handle betrayal choices (engage/deflect),
  then judge the content.

## Blanks filled / fixed this run

1. **Daily trust instrument (driver + analyzer + proof):** the r34 arm.
   Proven by the proof test (extracts the driver's real snapshot/diff
   functions: formed/pool/capped-history/inactive cases) and by the
   matched 4-seed run (220 + 337 + 131 + 196 snapshots; 63 + 57 + 36 +
   48 engine-book events; control-identical pilot outcome).
2. **Driver label fix:** the r33 driver's summary header now prints
   "R34 SUMMARY" (r33 blank (d), cosmetic, console only).
3. **Documented, NOT fixed this run (discipline — each needs its own arm):**
   - (a) **Silent deed gains:** recordDeed's +1..+4 per deed has no line
     and no book entry. A player cannot see why covenant trust moves.
     The fix is a voice/note for deed gains, not a number change.
   - (b) **Silent −4/−5 drops:** 4 instances, writer not in the book
     (see Mechanisms). Needs _trustGain call-site logging (r35
     instrument), not a guess.
   - (c) **Betrayal-choice driver drop:** 85004-d120 (see People check).
   - (d) **Post-pool regime still unobserved:** no run has yet lived
     past national with covenant links to measure pool-week trust
     movement. r35 should pre-register a post-national window, not
     another pre-national split.
   - (e) **85001 base-movement die-out:** needs an arena/contest-lane
     bisect (control proved it is not this run's instrument).
   - (f) **Carried from r33, still open:** "Come see what I found"
     plant-drop; closing-line mismatch after a commit. Not re-judged.

## Reachable / fun / winnable (leg 3)

- **Reachable: YES, with a caveat.** The covenant road forms on 3/4
  seeds, the seasoned bar is reachable when deeds outrun deaths, and
  the lesser seat waits on 3/4 seeds. The caveat is the die-out class:
  a village can season its league and still die in the arena before
  the table — reachable, but fragile.
- **Fun: PARTLY.** The voiced half (crises, concessions, council) reads
  as real politics. The silent half (deed gains) is invisible to the
  player — trust moves for reasons the game never says. That invisibility
  is the leg's main fun blank.
- **Winnable: APPROACHING, not arrived.** Lesser seat 3/4, national 1/4,
  full seat 0/4, wave 5 0/4 — the scale wall above national/table is
  untouched, consistent with the scale-onramp picture.

## Metric review

- No metric re-scored mid-run. TRUST1/TRUST2 were judged exactly as
  pre-registered (pool-phase split; late-bond stall bar). Both missed on
  the letter, and both misses are informative rather than empty: the
  pool regime never arrived (TRUST1 unjudged, not refuted), and the
  late-bond rule is refuted by a deed-explained exception (TRUST2).
- **Instrument lesson for the NEXT run:** weekly samples hid the
  mechanism; daily snapshots found it — but daily snapshots still
  cannot attribute moves the engine never books (deed gains, silent
  drops). r35's instrument must log _trustGain call sites (or the
  analyzer will keep inferring from lastKeptDay stamps).
- **Snapshot-cadence caveat:** snapshots are per policy.daily call, not
  strictly per game day — 85001 shows duplicate-day snapshots (d34
  twice) and missing days (d33). Duplicate days contribute 0 delta and
  missing days merge into the next day's delta; both are harmless at
  weekly granularity, and no verdict depends on single-day precision
  except the crisis-day nets, which were verified against the book
  entries directly.
- **Telemetry check:** LOUD on 5 of 6 scale baseline metrics — ALL
  EXPLAINED as instrument-shape mismatch, same as r30–r33: r34 census
  JSONs carry no markerCounts/fightsTotal/maxGameDay fields (that
  baseline is from a different instrument). The mechanisms are
  present in-capture: national on 85002 (d150), pool/council lines,
  defense calls answered. Baseline NOT rolled (shape mismatch, and
  rolling a driver-arm run into the baseline would bake the arm in).
  tableTele 0→0, no LOUD line.
- **Test suites:** proof test 14/14 (r34) + RED on r33 (as designed);
  r33 picker proof still 14/14; `check.js --only trustdelta` 1 passed.
  Full --quick NOT run (zero src/js changes; same precedent as
  deepening r44/r45/r46 — instrument-only runs run the proof + targeted
  check, not the 23-minute full set with its standing 8 pre-existing
  failures).

## Ops

- Worktree journey-scale registered, heartbeated throughout (loop +
  manual heartbeats), to be released and removed at the end; branch
  deleted after merge; main tree verified clean. No version bump/push
  (ship loop owns it). Merged locally, pending ship — no version tag,
  no push. Lock deleted at end. Rotation-a 3→0 on completion.
