# sim-courtship-rework-b — re-pilot of the courtship-deeds lever (Loop B, 1810Z run)

**Verdict: PILOT NO-GO.** G1 GO, G3 GO, cost bar PASS — but G2 FAILS: the
stall is narrower, not gone. One seed (100646) burns 54 zero-movement
pilgrim-days against a band-wide bar of ≤8, and one staged covenant beat
(100648) died with the village on its staging day, unanswered. The
combination rule (prereg §"Combination rule") makes any FAIL a NO-GO; no
bar is re-scored mid-run. **No confirm run — the confirm band 100621–100636
stays fresh and unspent.**

## What this run was

The 1630Z pilot (sim-courtship-b) proved the gate open (covenant staged 3/8,
opinion 10 by median day 6 vs 57 baseline) but failed its cost bar
(starvation 5 vs 0). Diagnosis, frozen in the prereg
(sim-courtship-rework-b-prereg.md), showed the starvation was trajectory,
not aid spend — every death sat 8–43 days after the last aid, in endgame
collapse troughs — and the stall was a single rubble tile at (4,6) that the
greedy `walkTo` could not route around, stranding the scholar for 156 days
on seed 100604. The rework (policy-side only, zero `src/js`):

- `walkTo` tries EVERY offered target nearest-first, pre-checked with a
  pure-read `pathBlocked()` (destination + intermediate scan), never steps
  away from the destination, stops only when no offered step moves.
- A stale drop (day − startDay > 14) walks home, says the stale line, and
  retires a village after 2 stale drops.
- The pilgrimage is voiced: start / stale / return lines, all containing
  'codex'.

Pilot: 8 seeds × 2 policies, 200d death-aware, identical seeds, fresh
controls on the current tip. Band **100641–100648** (verified fresh).
Baseline `competent-covenant-b` vs reworked `competent-courtship-b`.
RUN=`courtship-rework-b`, anchor commit `f8f6265b9`. 16/16 configs ran,
0 instrument errors.

## Prereg gates

| Gate | Bar | Result | Verdict |
|---|---|---|---|
| G1 instrument validity | full series + shape roll + daily opinion + daily pos + pilgrim state on all 16; 0 errors; every staged beat classified; UNCLASSIFIED ≤1/8; pilgrim rollup present | 16/16 complete, 0 errors, UNCLASSIFIED 0, pilgrim rollup on every armed record | **GO** |
| G2 the lever | covenant staged ≥3/8; every staged beat answered 'pact' and sat; stall read: zero-move continuation pilgrim-days band-wide ≤8 AND stale drops band-wide ≤4 | staged **8/8**; 7/8 beats answered sat, 100648 unanswered (village died d67, its staging day); zero-move **54** (all on 100646) vs ≤8; stale drops **4** vs ≤4 | **FAIL** |
| G3 lever-only | zero `src/js`; proof tests green at recorded baselines | 0 `src/js` files changed; test-courtship-rework-b 58/58; test-courtship-b 57/57 (was 56/57 — the rework fixed the old failing smoke, see metric review); test-covenant-b 33/33; test-onlylead-b 29/29; test-onlylead2-b 24/25 (known drift, unchanged) | **GO** |
| Cost bar (veto) | starvation ≤ baseline+2 AND median survival ≥0.8× baseline | starvation **0 vs 2**; median survival **169.5d vs 189.5d (0.895×)** | **PASS** |

## Per-seed per-shape table (armed leg, competent-courtship-b)

| seed | days | end | scale | covenant | national answer | first op-10 | max op | w4 kills | w5 kills |
|---|---|---|---|---|---|---|---|---|---|
| 100641 | 111 | village-lost | national | STAGED sat 1/1 | d84 sat | d29 | 39 | 1 | 0 |
| 100642 | 145 | village-lost | national | STAGED sat 1/1 | d72 sat | d20 | 49 | 5 | 0 |
| 100643 | 195 | village-lost | national | STAGED sat 1/1 | d62 sat | d8 | 71 | 5 | 0 |
| 100644 | 168 | village-lost | national | STAGED sat 1/1 | d63 sat | d4 | 42 | 5 | 1 |
| 100645 | 171 | village-lost | national | STAGED sat 1/1 | d68 sat | d16 | 69 | 6 | 6 |
| 100646 | 200 | survived | national | STAGED sat 1/1 | d136 sat | d83 | 37 | 2 | 0 |
| 100647 | 172 | village-lost | regional | STAGED sat 1/1 | d68 sat | d16 | 47 | 6 | 1 |
| 100648 | 67 | village-lost | regional | STAGED sat 0/0 | — (beat staged d67, village died d67) | d4 | 21 | 0 | 0 |

Control leg (competent-covenant-b): covenant staged 4/8 (100645, 100646,
100647, 100648 — the last three qualified but only 100645/100646/100647
seasoned enough to stage; 100648 control staged with sat 1/1), lead 0/8,
conquest 0/8, belong 0/8, trade 0/8, UNCLASSIFIED 0. Armed leg: lead 0/8,
conquest 0/8, belong 0/8, trade 0/8, UNCLASSIFIED 0 — the isolation held
(no lead staging on the courtship leg).

## Opinion trajectories

First day max-known-opinion reached 10, per seed:

| seed | armed | control |
|---|---|---|
| 100641 | d29 | d140 |
| 100642 | d20 | d58 |
| 100643 | d8 | d67 |
| 100644 | d4 | d138 |
| 100645 | d16 | d55 |
| 100646 | d83 | d46 |
| 100647 | d16 | d44 |
| 100648 | d4 | d31 |
| **median** | **d16** | **d56.5** |

The lever still opens opinion far earlier than baseline (16 vs 56.5), but
slower than the 1630Z armed leg (median d6) — the 1630Z number was flattered
by stalls that left the scholar out courting while the village waited; the
rework's scholar comes home, and 100646's 54 stalled days drag the median.
Max opinion armed 21–71 (median 44.5) vs control 12–62 (median 37).

## Deeds table (armed leg)

| seed | aids (kcal) | studies | pilgrimages | pilgrim-days | stale drops | walk refusals | tends paid (kcal) |
|---|---|---|---|---|---|---|---|
| 100641 | 0 (0) | 2 | 2 | 4 | 0 | 15 | 11 (16,500) |
| 100642 | 3 (6,000) | 4 | 4 | 8 | 0 | 0 | 15 (22,500) |
| 100643 | 3 (6,000) | 2 | 2 | 3 | 0 | 5 | 15 (22,500) |
| 100644 | 3 (6,000) | 1 | 1 | 2 | 0 | 0 | 10 (15,000) |
| 100645 | 3 (6,000) | 3 | 3 | 6 | 0 | 14 | 10 (15,000) |
| 100646 | 4 (8,000) | 4 | 8 | 63 | 4 | 277 | 12 (18,000) |
| 100647 | 3 (6,000) | 3 | 3 | 6 | 0 | 3 | 10 (15,000) |
| 100648 | 4 (8,000) | 2 | 2 | 4 | 0 | 2 | 11 (16,500) |
| **total** | **23 (46,000)** | **21** | **25** | **96** | **4** | **316** | **94 (141,000)** |

Aid note (prereg amendment, pre-pilot): seed 100641 pays 0 aid — not a
defect. Studies complete d13/d17, opinion 10 arrives d29 without aid,
links form d32/33, and the counters account for every non-pilgrim day
exactly (13 pantry-blocked + 12 no-candidate + 78 cap-blocked = 103 =
111 days − 8 pilgrimage days). The aid is a gate-opener, not a quota: on a
fast seed the studies + contest wins open the gate before the aid window
opens. Verb counts band-wide: `studyVillageCodex:policy` 21,
`aidVillage:policy` 23, `proposeCovenant:policy` 474,
`_formPeerLink:policy` 43.

## Wall numbers

| | control | armed |
|---|---|---|
| Won (table) | 0/8 | 0/8 |
| National ever | 3/8 | **6/8** |
| Table / seat takes | 0 / 0 | 0 / 0 |
| Wave 5 ever | 4/8 | 3/8 |
| Wave-4 kills (total) | 31 | 30 |
| Wave-5 kills (total) | 9 | 8 |
| Survived 200d | 4/8 | 1/8 |
| Median survival | 189.5d | 169.5d |
| Starvation deaths | 2 | **0** |
| Total deaths | 81, 82, 69, 74, 114, 106, 83, 144 (mean 94.1) | 65, 74, 105, 89, 128, 50, 100, 96 (mean 88.4) |

National doubled (6/8 vs 3/8) and starvation went to zero, but survival
fell (1/8 vs 4/8) and deaths-per-100-days rose — the panel flags both as
`regression_watch` (see §15). The armed leg's extra national access did
not convert into survival: the villages that reach national still die
fighting (combat is 85–94% of all deaths on both legs).

## Starvation split (preregged: per seed vs aid kcal paid before death day AND vs pilgrim-days before death day)

Armed leg: **zero starvation deaths on all 8 seeds** — the split is empty
by construction. The lever paid 46,000 kcal of aid across the band and
starved nobody. Control leg starved 2: seed 100646 (1 death, survived
200d) and seed 100648 (1 death, survived 200d) — both on the leg that paid
no aid at all.

Per-seed armed starvation vs spend/absence:

| seed | starvation | aid kcal paid | pilgrim-days before death day |
|---|---|---|---|
| 100641 | 0 | 0 (never fired) | 4 (last pilgrimage ended d18; died d111) |
| 100642 | 0 | 6,000 | 8 (died d145) |
| 100643 | 0 | 6,000 | 3 (died d195) |
| 100644 | 0 | 6,000 | 2 (died d168) |
| 100645 | 0 | 8,000 | 6 (died d171) |
| 100646 | 0 | 8,000 | 63 (survived) |
| 100647 | 0 | 6,000 | 6 (died d172) |
| 100648 | 0 | 8,000 | 4 (died d67) |

The prereg diagnosis is confirmed in direction: the 1630Z armed leg
starved 5 with the scholar stranded up to 156 days; this leg strands the
scholar at most 14 days per trip and starves 0. The cost bar passes
because the stall fix IS the cost fix, as the prereg predicted.

§14c guardrail (villager combat deaths >50% over the before-leg, named per
seed): **seed 100643 only — 92 vs 55 (+67%).** All other seeds are within
the guardrail (100641 56 vs 70; 100642 58 vs 67; 100644 78 vs 59, +32%;
100645 118 vs 106; 100646 40 vs 93; 100647 88 vs 80; 100648 90 vs 132).
100643's extra combat deaths come with its longest run (195d, national
held 133 days) — a longer exposure to wave-4/5 fighting, not a starvation
spillover. Named here, not hidden.

## The stall that remains — seed 100646 (mechanism proven, not guessed)

Band-wide zero-movement continuation pilgrim-days: **54** (bar ≤8), all on
100646. Stale drops band-wide: **4** (bar ≤4, exactly at the bar), all on
100646. The other seven seeds: 0 zero-move days, 0 stale drops, 2–8
pilgrim-days each — the rework fixed the stall everywhere else. On 100646:
8 pilgrimages, 63 pilgrim-days, 277 walk refusals, 4 stale drops, 4
studies, 4 aids — the village still survived 200d and reached national,
so the stall cost scholar-days, not the village.

Day-by-day (series positions): the scholar sits at Haven (4,4) d11–d41 on
a pilgrimage to village_2 (30 days, never moves), walks home on a stale
drop, re-picks village_3, walks to (4,2) d47, sits d48–d60, re-picks after
the second stale, walks to (4,2) again d63/d67, sits d68–d80+. The stale
machinery works as designed (drops at 14 days, walks home, retires a
village after 2 drops — village_2 is never picked again after d41).

Why it cannot move — probed live at day 0 (`/tmp/probe-646-map.js`,
diagnostic, no corpus): village_2 sits at (1,4), village_3 at (1,2).
A BFS over the 9×9 with `travelBlockage` as the oracle finds paths:
(4,4)→(4,3)→(3,3)→(2,3)→(1,3)→(1,4). But the first step, (4,4)→(4,3),
moves AWAY from the destination (distance 3→4), because the direct west
step (3,4) is blocked by a **creek**, and the south-west approach is
walled by rubble at (3,5)/(2,6). The rework's `walkTo` forbids every step
that increases distance to the target — the never-steps-away guard I added
to prevent oscillation. From (4,4) the only passable offered step is
(4,3), and the guard vetoes it; from (4,2) the same shape repeats
((4,1)/(4,3) both step away; (3,2) creek, (5,2) rubble). Every offered
step is either blocked or vetoed, so the scholar stands still for 14 days,
drops stale, and — because the village is still the nearest below-bar
unstudied candidate and has only 1 stale — re-picks it and burns another
14 days. The twice-stale retirement stops it only after 28 wasted days
per village.

So the remaining defect is precise: **the greedy walk cannot take a
detour whose first step moves away from the destination.** A single
rubble tile was the 1630Z cause; a creek + rubble pocket that forces a
northward detour is this run's cause. The fix is real pathfinding
(BFS in the policy, `travelBlockage` as oracle, single-step moves) or a
bounded step-away allowance — owed to the next rework, not patched here
(prereg frozen; verdict stands).

## Sense-testing

The pilgrimage is no longer silent — 21 pilgrimage mentions and 9 stale
mentions reach the corpora (1630Z: zero played lines across 44
pilgrimages). Quoted verbatim:

- Start (s100641 d11): *"You set out on the pilgrimage road to
  Stonebridge's fire — their codex waits, and the covenant road is walked,
  not wished."*
- Return (s100641 d14): *"You walk back into Haven, Stonebridge's codex
  still open in your head."*
- Stale (s100646 d26): *"The road to Thornfield's fire will not open —
  fourteen days of refused paths. You turn for home; their codex stays
  unread."*
- Stale again (s100646 d61): *"The road to Ashford's fire will not open —
  fourteen days of refused paths. You turn for home; their codex stays
  unread."*
- Council (s100641 d83): *"🤝 The founding council: speakers from
  Stonebridge, Thornfield, Emberhold sit in a circle — no throne, no
  kneeling. This league needs its first act. Swear the war-PACT (mutual
  defense — any member's call is answered, or refused aloud), found the
  shared POOL (2,000 kcal a week from every fire into one granary, drawn
  in famine), or WALK from this table for now. Or REFUSE the scale itself
  — stay a fr…"*
- Staging (s100646 d135): *"📓 Codex: National beat staged: covenant
  (4 villages)."*

Judgment: the pilgrimage lines read well — plain, in-voice, and they name
the thing that is actually happening (the road will not open; the codex
stays unread). The stale line is the best of the three: it tells the
player WHY the trip failed in the fiction's own terms. Two blemishes:
(1) the return line ("codex still open in your head") fires even when the
study just completed and the codex is now read — it should distinguish a
completed study from a turn-home; (2) the engine's own return line ("You
walk back into Haven. N Codex entries. The village is glad to see you.")
still fires on adjacent days, so a returning scholar can produce two
homecoming lines in a row. Neither is a verdict item; both are polish for
the next pass.

## §15 balanced panel (instrument, not judge)

`scripts/build-courtship-rework-panels-20261115.js` from the two per-seed
dirs; output `evidence/2026-11-15/courtship-rework-b-panel.{json,md}`.
Decision: **review_required** (8 paired cases). National scale access
0.50 → 0.75 (+0.25, no material signal, CI −0.375 to 0.75). Village
deaths per run 94.1 → 88.4 (−5.75, no material signal). Village deaths
per 100 days 55.2 → 64.7 (+9.46, `regression_watch`, CI spans 0).
Community loss 0.50 → 0.875 (+0.375, `regression_watch`). Table win rate
0 → 0. The panel agrees with the preregged bars: the lever moves national
access up and starvation to zero, and does not move wins — while the
survival picture gets worse in rate terms. The panel does not overturn the
NO-GO; it sharpens the question the next rework must answer (why national
access without survival).

## Metric review

1. **G2's stall bar was set band-wide, and one seed broke it.** The bar
   (≤8 zero-move days band-wide) was written when the stall was a
   band-wide phenomenon (354 pilgrim-days, 1630Z). The rework fixed 7/8
   seeds completely; the bar correctly fails the run anyway — a
   per-seed bar (e.g. ≤8 per seed, or ≤2 seeds over the line) would have
   passed this run, but the band-wide bar is what was frozen, and the
   stall on 100646 is real (54 days of a scholar standing still is not a
   measurement artifact). No re-score; the next run may pre-register a
   per-seed stall bar alongside the band-wide one.
2. **The 'pact' + sat clause needs a death-on-staging-day reading.**
   100648's beat staged on the day the village died. The clause as
   written counts it as not-sat. A future prereg should say explicitly
   whether a beat that stages on the village's death day counts as
   unanswered (current reading) or is excluded from the denominator.
   Either way it would not change this verdict (the stall bar fails
   independently).
3. **test-courtship-b moved 56/57 → 57/57.** The one previously-failing
   check (study deed fires on seed 100601's smoke) now passes because
   the rework's walk reaches the village. That is the lever fixing the
   instrument's live smoke, not drift and not a test edit — no test was
   edited to go green. Recorded here so the change is not mistaken for
   baseline drift.
4. **The aid's value is on slow seeds, not fast ones.** On 100641 the
   gate opens without aid; on 100642–100648 the aid fires 3–4 times.
   The prereg's Stage-0 amendment (aid ≥ 1 OR counters-accounted window)
   proved necessary and correct. A future lever revision could consider
   whether the aid should fire earlier (before the first study) so it
   matters on fast seeds too — but that is a design question, not a
   measurement fix.
5. **National access without survival is the open winnability question.**
   Armed 6/8 national vs control 3/8, yet armed survival 1/8 vs 4/8 and
   wave-5 kills flat (8 vs 9). The covenant road gets villages to the
   national table; the wave-4/5 fighting then kills them. The next arm
   should look at what happens AFTER national, not at the road to it.
6. **100648's early death (d67, 96 deaths, 90 combat) is a fighting
   collapse, not a lever cost.** The control on the same seed survived
   200d with 144 deaths. The armed leg's faster link formation (links
   d15/24/25) pulled the village into national contention while its
   fighters were still thin — a candidate mechanism for the survival
   drop, worth a diagnostic, not a verdict item here.

## What stays open

- The pilgrimage stall (findings backlog): narrowed from band-wide to one
  seed's creek/rubble pocket, but NOT fixed — the bar fails. Next rework:
  BFS pathfinding in the policy (or a bounded step-away allowance), then
  re-pilot on a fresh band.
- The confirm band 100621–100636 stays fresh and unspent.
- The covenant road itself is proven open (8/8 staged, 7/8 sat) — the
  lever works where the scholar can walk. The winnability gap is now
  downstream: national access without survival.
