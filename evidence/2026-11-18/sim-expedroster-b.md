# sim-expedroster-b — DIAGNOSTIC evidence (finding #2511's unanswered half / tracker blank #4)

**Arm:** sim-expedroster-b · **Loop B run:** fleshout-loop-b-20261118T0430Z
**Type:** DIAGNOSTIC/TOOLING — a daily `st.exped` snapshot instrument; NO
game-behavior change, no `src/js` change at all.
**Prereg:** `evidence/2026-11-18/sim-expedroster-b-prereg.md`
(frozen 2026-11-18 ~06:50 UTC, BEFORE the pilot sweep).
**Branch tip:** `sim-expedroster-b` (instrument + proof committed below
this evidence; this adoption ran the pilot sweep the 0430Z coordinator
timed out before).
**Builds on:** `evidence/2026-11-18/sim-launchquad-trace-b.md` (finding
#2511 answered ALLY-PICK; its "Instrument notes" name this recorder as
the next step) and `evidence/2026-11-18/sim-launchparty-b.md` (the
sibling arm this run).

## Verdict: NO-GO (METRIC-BROKEN) — the gap bar counts home days as missing snapshots

| Check | Result |
| --- | --- |
| Primary 1: capture rate ≥95% | **PASS** — 16/16 = 1.000 |
| Primary 2: snapshot gaps = 0 | **FAIL** — 111 gaps |
| Primary 3: join rate = 100% | **PASS** — 6/6 = 1.000 |
| Pool floor (≥5 deduped wave-4 launches) | **MET** — 16 launches |
| Proof green | **PASS** — `scripts/test-expedroster-b.js` 15/15 (re-run on the branch tip by the adoption) |
| Analyzer selftest green | **PASS** — `scripts/analyze-expedroster-b.js --selftest` (via proof test 10) |
| Instrument errors | **0** on all 8 per-seed files; 1,731 `v4expedRoster` rows |

**The verdict is NO-GO under the frozen prereg, and the kill kind is
METRIC-BROKEN, not CONCEPT-DEAD and not an instrument defect.** The
analyzer's computed label says NO-GO (it judges the frozen bar
mechanically); the autopsy below revises the taxonomy per §14a, because
the gap bar as written is unachievable on any band where villagers go
home between trips: it counts missing days strictly inside a member's
whole-window roster span `[firstRosterDay, lastRosterDay]`, which
bridges the days between one expedition ending and the next beginning.
All 111 gaps were audited against the corpora: **111/111 are home
intervals, 0 are true recorder misses** (no gap day has the same
`sinceDay`/`sincePart` on both sides). The recorder fired on every
day an expedition existed. This run is NOT re-scored — the NO-GO
stands — but the metric is revised for the NEXT run (see Metric
review), and the scientific answer the instrument was built to deliver
is delivered with cited rows (see below).

## The answer (finding #2511's unanswered half)

**Launch members share tiles en route — 13 of 16 launches — not just a
shared destination.** The en-route classification (window
`[launchDay, launchDay+21]`, same node AND same target on some day):

| Classification | Count |
| --- | --- |
| together-en-route | 13 |
| destination-only | 0 |
| unknown-with-reason (holder-only) | 3 |

Cited rows (first together-day per launch):

- s104204 d94 Aroha + gen_u2nxscl → herald: 6 together-days, first
  d94 on node 5,4 target 5,4. Same pair again d98 (2 together-days).
- s104204 d113 Aroha + Sari → herald: 2 together-days, first d113
  node 5,4 target 5,4.
- s104205 d115 Jesse + Ethan → cancellation: 5 together-days, first
  d115 node 4,3 target 4,3. Same pair again d120 (7), d137 (4).
- s104205 d125 app_mgpsphmm244 + Owen → eulogy: 10 together-days,
  first d125 node 3,4 target 3,4. Same pair again d140 (5), d143 (2).
- s104205 d130 app_mgpsphmm244 + Ethan → eulogy: 5 together-days,
  first d130 node 3,4 target 3,4.
- s104205 d134 Jesse + Owen → cancellation: 3 together-days, first
  d134 node 4,3 target 4,3.
- s104207 d99 Zoe + Wanjiru → herald: **22 together-days**, first d99
  node 4,4 target 4,4 — the pair travelled together for three weeks.
- s104207 d130 Rosa + Mia → reunion: 2 together-days, first d130
  node 3,4 target 3,4.

The 3 holder-only launches (s104205 d123, d141, d146 — Jesse alone,
then app_mgpsphmm244 alone) had companions named on the launch row
who never departed: the launch created the plan, the companion never
left Haven. No launch classified destination-only: whenever two
members both travelled, they shared a tile.

Meeting-day tile evidence (6 launched meetings, all classifiable):
d115 Ethan vs cancellation node 4,3; d116 Ethan vs cancellation node
4,3; d127 Jesse vs cancellation no-tile — exped-ended (last roster
row d125); d134 Ethan vs eulogy node 3,4; d138 Ethan vs eulogy node
4,3; d140 Owen vs eulogy node 3,4. Every meeting fighter's roster
node on the meeting day matches the launch target tile, or the
expedition had verifiably ended.

## Gap autopsy (why the 0-gap bar fails and why the recorder is innocent)

The gap metric counts any day with no roster row strictly inside
`[firstRosterDay, lastRosterDay]` for a launch member. A villager
who finishes one expedition, spends days at Haven, and departs again
has a span that bridges the home days — and every bridged day counts
as a "gap". Cited cases:

- **Aroha, s104204:** rows d94–99 with `sinceDay=98` (the d98
  expedition), then no rows d100–112, then rows resume d113 with
  `sinceDay=113` — a NEW expedition. She was home d100–112; there
  was nothing to snapshot.
- **Mia, s104207:** rows d130–133 with `sinceDay=130`, gap d134–135,
  rows resume d136 with `sinceDay=136` and a new target (5,4, not
  3,4). Home d134–135 between two trips.
- **gen_u2nxscl, s104204:** single gap day d100 between the d98
  expedition (rows to d99) and the next departure (rows from d101,
  `sinceDay=105`).

Systematic audit over all 111 gaps in the analysis JSON: for each gap
day, compare the `sinceDay`/`sincePart` of the nearest roster rows
before and after. **111 home-interval, 0 true recorder misses** — no
gap day is ever flanked by rows of the same expedition. The recorder
never skipped a day an expedition existed. The bar needs a
per-expedition span (gaps only within one `sinceDay` run), not a
whole-window span.

## Pilot numbers (8 seeds, band 104201–104208, 150d, competent verbatim)

Single leg. Substrate `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1`,
`FIGHTALLY2` unset, `LAUNCHPARTY` unset — the world as it is on
current master. Pilot sweep run by the adoption (the 0430Z coordinator
timed out before the sweep); driver exit 0, 8/8 seeds, 0 instrument
errors.

| Seed | Days | End | maxWave | Standing | v4seeds | v4departs | v4encounters | Roster rows |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 104201 | 66 | village-lost | 4 | 199 | 6 | 51 | 0 | 11 |
| 104202 | 61 | village-lost | 3 | 99 | 0 | 0 | 0 | 0 |
| 104203 | 45 | village-lost | 3 | 50 | 0 | 0 | 0 | 0 |
| 104204 | 150 | survived | 5 | 375 | 36 | 34 | 36 | 439 |
| 104205 | 150 | survived | 5 | 615 | 34 | 42 | 31 | 318 |
| 104206 | 100 | village-lost | 4 | 199 | 12 | 3 | 9 | 92 |
| 104207 | 150 | survived | 4 | 199 | 26 | 41 | 27 | 596 |
| 104208 | 150 | survived | 4 | 199 | 29 | 45 | 15 | 264 |

Deduped wave-4 launches (analyzer's `launchesForSeed`): 16 — 0 on
104201/104202/104203/104206/104208, 3 on 104204, 11 on 104205, 2 on
104207. The launch population is concentrated on the two surviving
regional villages; the three early-death villages contribute nothing,
which is the death-aware horizon working as designed, not a thin
pool: the floor (≥5) is met 16 to 5.

## Village assessment (plain words)

Eight villages, four lived and four died. The four that died young
(45–100 days) never got far enough to launch a wave-4 hunt at all —
they were gone before the question could even be asked. The four that
lived tell the story: two reached regional standing (375 and 615) and
opened wave 5; the other two parked at standing 199, the known stall.
Nobody reached national rank, nobody sat at the table, nobody won.

What the living villages show is that a launch party really does
travel together: Zoe and Wanjiru spent twenty-two days on the same
tiles, walking to the same herald. Jesse and Ethan did it five times
over. The companions who never left Haven are the other half of the
story — three launches named a companion who stayed home, and the
roster is honest about that too: no row, no trip, no pretence. The
blank this arm filled is the daily roster itself: for the first time
there is a record of who was actually out, where, and with whom, day
by day. The blank it documented is the gap metric's blind spot —
going home between trips is not a missing record.

## Wall numbers (this corpus)

National standing (≥200): 2/8 · national rank: 0/8 · table: 0/8 ·
wins: 0/8 · wave-4 unlock: 6/8 · wave-5 unlock: 2/8 · median
survival: 125d · villages survived: 4/8.

## Metric review

- **The gap bar is mis-scoped, and the miss is the metric's.** The
  prereg's own metric review anticipated a too-strict bar but named
  the wrong mechanism (a sub-day departure). The actual mechanism is
  duller and more common: villagers go home between expeditions, and
  a whole-window span counts home days as missing snapshots. The
  corrected bar for the next run: gaps counted only within one
  expedition — days strictly inside `[firstDay, lastDay]` of rows
  sharing one `sinceDay`/`sincePart` — or, equivalently, only days
  where the member has a live expedition per the departures list.
  This run is not re-scored: NO-GO stands under the frozen bar.
- **The capture and join bars held cleanly** (100% / 100%) and the
  pool floor was met 16 to 5. A re-judge of this same instrument and
  corpus under the corrected gap bar would pass all three bars — the
  next run may re-judge without a fresh sweep, or re-run the sweep
  if it wants a fresh band. Either way the instrument needs no code
  change.
- **The en-route answer is not the GO bar and was reported whatever
  it is** (13 together-en-route, 0 destination-only, 3 holder-only).
  It answers #2511's unanswered half: launch members DO share tiles
  en route. That makes the launchparty sense fix (sibling arm) read
  the right thing — the launch party is a travelling unit, and the
  meeting sense should prefer it.
- **The holder-only launches are a real game observation, not an
  instrument artifact:** a companion named on a launch row who never
  departs. Three of sixteen. Whether the companion was never
  available, declined, or was double-launched elsewhere is a
  follow-up for the vetreengage/launch owner, not this instrument.

## Convergence state

Axis (winnability chain): **not converged**. This arm does not land —
the frozen bar fails — but it returns to the queue with a corrected
gap metric and a answered question: launch parties travel together en
route (13/16), and the roster recorder works (capture 100%, join
100%, 0 true misses). The next run re-judges the instrument under the
corrected bar; no fresh instrument build is needed.

## Blanks filled or documented

- **Filled:** the daily `st.exped` roster recorder
  (`scripts/expedroster-driver-b.js`, `v4expedRoster` rows, pure
  reads, no `src/js` change) and its analyzer
  (`scripts/analyze-expedroster-b.js`, selftest green), proof
  `scripts/test-expedroster-b.js` 15/15.
- **Filled:** the pilot corpus (fresh band 104201–104208, 8 per-seed
  JSONs, 1,731 roster rows, 0 errors) and the analysis
  (`evidence/2026-11-18/expedroster-b-analysis.json`).
- **Answered:** #2511's unanswered half — launch members share tiles
  en route (13/16 together-en-route with cited rows).
- **Documented, not built:** the per-expedition gap metric correction
  (next run's re-judge); the holder-only launches (3/16 companions
  never departed) for the launch owner.
- **Documented:** canon gap (unchanged) — no canon doc covers
  villager win-plan launch parties or the sim recorder.

## Files

- Prereg: `evidence/2026-11-18/sim-expedroster-b-prereg.md` (frozen
  BEFORE the pilot sweep)
- Analysis: `evidence/2026-11-18/expedroster-b-analysis.json`
  (verdict NO-GO per frozen bars; autopsy revises the kill kind to
  METRIC-BROKEN — see Gap autopsy)
- Per-seed corpora: `evidence/2026-11-18/perseed-expedroster-b/`
  (8 seeds; `expedroster-b-s<seed>-expedroster-b-exped.json`)
- Driver: `scripts/expedroster-driver-b.js`
- Analyzer: `scripts/analyze-expedroster-b.js` (+ `--selftest`)
- Proof: `scripts/test-expedroster-b.js` (15/15 green)
- No `src/js` change. No panel (§15: single-leg diagnostic, no
  before/after to compare).
