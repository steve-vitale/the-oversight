# journey-scale r113 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-20261109T0345Z (scheduled 03:45 CST 2026-11-09).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3). NOTE: r112's
prereg already promised this write and the file still read 3 at this
run's start — verify the write by re-reading the file at closeout.
**Base:** local master `60eb9a5bb` ("journey-deepening r121: adoption
record — r120 closeout + gate adjudication + rumor-walker fix").
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — raise answers read only live
pending raises from named villagers, answered in a real conversation
with the raiser; the sit drive reads only the engine's own preview.
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the fix for
one of r112's two named full-seat walls — the trade-route wall — and
measures the other wall's open sub-question (wild wave-4 facing). It
is not a re-proof of a proven constraint: the ladder r112 measured
is the ladder this run measures, but the POLICY is new (trade-road
pursuit), so the panel below is a genuine before/after on the
full-seat question.

## Standing context (read before scoring)

- **r112 (2026-11-09, band 97901–97904, base db7fb1c6a): VETERAN
  WALL unanimous (scholar 5/5 wave-4 kills, villager 0); SEASONING
  SEASONS 4/4; LADDER OPENS 4/4; lesser seat won 3/4; full seat
  priced 0/4.** Capstones ready: none, any seed. The full seat's two
  walls, named precisely: (1) the veteran wall — villagers never kill
  a wave-4 monster, so the tribute deed can never be paid; (2) the
  trade-route wall — no trade route is ever formed, so the charter
  can never be sealed. The embassy (feast bundle) is the only
  capstone ever delivered on this leg (r111's 97803). Raise-talk
  defects stable across r111→r112 (echo 15/15, unvoiced 3/15,
  unanswered 9/15) — carried, re-counted, not re-litigated.
- **What changed on master since r112's base (db7fb1c6a..60eb9a5bb,
  src/js diff read for this prereg):** deepening r120/r121 only —
  secret-response fix (a villager's confession now gets an answer),
  rumor-flow walker answers a confession, panel expansion. NO
  hierarchy.js / ladder.js / table.js / fieldFights.js change. The
  trade mechanism this run exercises is byte-identical to r112's.
  The base move is disclosed, not hidden: the before-panel is
  r112's published band (same seeds, r112 base); a same-base
  control re-run is out of scope for this run's budget.
- **The trade-charter mechanism, read from code (not inferred):**
  - `trade_charter` ready = ≥1 active trade link with
    `chartered=true` + national+ scale (`ladder.js`).
  - `chartered=true` is set ONLY by answering the Charter (trade)
    national beat with sign/bargain (`hierarchy.js:2884,2898`).
  - The Charter beat stages ONLY while national is not yet live,
    and only if no earlier shape qualifies (`hierarchy.js:2501,2547`;
    candidates in order lead → belong → covenant → trade, first
    qualifying non-deferred shape stages).
  - 'walk' defers ONLY covenant/trade beats (`answerNationalChoice`:
    lead offers feast/host/cold/refuse; belong's walk breaks the
    link and refuses the scale permanently). Once LEAD stages, the
    player must take the First Court or refuse the scale — the
    charter is foreclosed either way.
  - When national dissolves, `chartered` resets to false
    (`hierarchy.js:2461-2462`). The seal is strictly tied to the
    trade-road national beat.
  - The TRADE road needs 3 SEASONED trade links (30+ days, trust
    40+) to qualify (`_tradePolity`); peer proposals need opinion
    ≥10 (deterministic refuse below the bar).
  - So the charter is reachable ONLY on runs that reach national
    via the TRADE road itself — which requires trade to qualify
    BEFORE lead/belong/covenant do.
- **Why r112 never got there (the policy's own numbers):** the
  scalecourt policy proposes covenant first and trade only after
  3 covenant links are active (`scalecourt-nogate-morntrace3.js`:
  `covN < 3 ? 'covenant' : trN < 3 ? 'trade'`). On r112 no seed
  ever reached covN=3 (97901 lead 4/5 cov 0/0; 97902 lead 5/6 cov
  0/0; 97903 lead 1/3 cov 2/3; 97904 lead 2/3 cov 0/0) — so trade
  was NEVER proposed on any seed (trade=0/0 everywhere). And
  lead qualified first on two seeds, which would have staged the
  First Court and foreclosed the charter even if trade had been
  proposed. The subs that built lead came from raise-accepts
  (`proposeLink(vid, {asSubordinate: true})` in
  `competent-linkdrive-b.js:385`) plus the first-link proposeLink.
- **The fix (POLICY-SIDE ONLY, zero src/js):** a trade-road policy
  that plays as a competent player who wants the charter:
  (1) propose TRADE first, covenant second, while the trade window
  is open (to day 120), covenant first after it closes; (2) cap
  Haven-primary subordinates at 1 while the window is open, by
  leaving raise-answers unanswered (they expire; the villager may
  re-raise after cooldown — holding costs time, not the road) —
  lead needs 3 subs, so it cannot qualify before trade; (3) answer
  national beats: trade → sign, covenant → walk while the window
  is open (defer 14d, the designed "walking picks the road"
  mechanic), pact once it closes, lead → feast, belong → swear
  (never walk belong — it breaks the link and refuses the scale).
  The window (not a snapshot count) decides: villages keep
  arriving, so a count taken at the 3rd raise cannot see the
  trade partner who becomes known a week later (pilot addendum 2).
  The game already supports every step; the bot just never took
  them. If the trade road still fails, the failure is the game's,
  not the bot's — and this run will say which step failed.

## Q1 — THE TRADE ROAD: does a competent player who wants the charter get it? (binding, BUILD)

Instrument `scripts/traderoad-instrument-20261109.js` (new; the
r112 ladder instrument is required unchanged, not copied): a
delegating wrapper on `Game.answerNationalChoice` logging
{day, shape, how} for every beat answer, plus a daily trade-road
snapshot {subs, trN, trSeasoned, covN, viable, sealed, charteredLinks,
candidates} and the `pickTradeBeat` / `tradeViable` pure helpers
(proof-tested). The driver uses the new trade-road policy
(`scripts/policies/scalecourt-traderoad-r113.js` + linkraise +
sit clones, all POLICY-SIDE, zero src/js) and the same delivery
verb as r112 (trade_charter → feast_embassy → military_tribute).

**Mechanism bars (checked in order; the first that fires names the
wall — or the win):**
- **CHARTER-SEALED** — `trade_charter` ready on ≥2/4 seeds (the
  Charter beat staged and signed/bargained). DELIVERED on ≥1/4
  is the stronger form, reported alongside.
- **WALL-PROPOSE** — trade proposals <3 on ≥3/4 seeds: the
  policy could not even propose three routes (candidates, opinion
  bar, or counters — name which).
- **WALL-SEASON** — ≥3 trade links proposed on ≥2/4 seeds but <3
  seasoned trade links on all of them: routes form but never
  season (trust, deaths, link breaks — name which).
- **WALL-BEAT** — 3 seasoned trade links on ≥1 seed but the
  Charter beat never staged: another shape qualified first and
  could not be walked from (name the shape + why the walk failed).
- **WALL-SEAL** — Charter beat staged on ≥1 seed but no seal
  (beat died aloud — the league came apart before the ink dried).
- **MIXED** — none fires: report the per-seed step reached
  (proposed / formed / seasoned / staged / sealed / delivered).
Secondary (report-only): per-seed first-trade-proposal day, first
seasoned-trade day, Charter staged day, charteredLinks, sub-cap
skips (raises left pending to hold lead below 3), covenant walks.

## Q2 — WILD WAVE-4: do villagers face wave-4 monsters in the wild and lose, or do the spawns never reach them? (binding, MEASURE)

r112's metric-review open sub-question. The kill log only records
kills; field-fight losses are not in it. The instrument wraps
`Game.fieldFight` (pure delegation — call through, record the
returned record): {day, vid, class (scholar/villager by the
day-joined rule), mid, wave (from mdef.wave), outcome, rounds}.
Outcomes: 'evade' (saw it, gave it room — no contact), 'vKill',
'vDie', 'vFlee', 'mFlee', 'alreadyDead'. A villager-class call vs
a wave-4+ monster IS a reach; outcome in {vKill, vDie, vFlee,
mFlee} IS a face.
- **FACES** — ≥1 villager-class w4+ fieldFight with a fight
  outcome (not evade) on ≥2/4 seeds: villagers do meet wave-4
  beasts in the wild and fight them (report vDie/vFlee/vKill
  split + median rounds).
- **REACHES-AVOIDS** — villager-class w4+ calls on ≥2/4 seeds
  but ALL evade: the spawns reach them and they give them room.
- **NEVER-REACHES** — 0 villager-class w4+ fieldFight calls on
  ≥3/4 seeds: wave-4 spawns never reach villagers in the wild.
- **MIXED** — anything else; report the per-seed table.
Secondary (report-only): scholar-class w4+ field fights, w1–w3
villager fight outcomes (the baseline they DO win), vDie causes
joined to the death watch.

## Q3 — LADDER OPENS + LESSER SEAT, on the trade-road policy (confirm)

National (ladder stage 3) reached on ≥2/4 seeds = OPENS; exactly
1/4 = PARTIAL; 0/4 = STALLS. Lesser seat PRICED on ≥2/4 = HOLDS;
1/4 = THIN; 0/4 = REGRESSION (the trade-road policy broke the
lesser-seat path — investigate before any further trade work).
PRICED, not taken: the pilot addendum defers the lesser sit
(SEATDRIVE=0 — the offer stands, the player is chasing the full
seat), so "won" is unmeasurable by design and the price is the
comparable half (r112: priced d43–d49 on 4/4).
Same bars as r112, re-run because the policy changed.

## Q4 — PEOPLE CHECK (sense law)

CONVO_DAYS [90, 120] transcripts read in full + ALL raise-answer
talks read in full. Re-count accept echo / brush-off close /
unvoiced raise / unanswered invitation (carried from r111/r112,
not re-litigated). Senseless count must be 0 to claim the people
check clean.

## Secondaries (report-only, not judged)

- **Veteran wall re-check:** killAttr end state per seed (r112:
  scholar 5 / villager 0 band-wide). Any villager wave-4 kill is
  news — name the killer and the fate.
- **Capstone delivery** (same verb as r112, same order:
  trade_charter → feast_embassy → military_tribute). First-ready
  day per kind + delivered kind/day. A capstone ready on ≥1 seed
  with 0 delivered is a DRIVER-VERB failure, named explicitly.
- **Full seat priced day per seed** (headline number, report-only;
  the deed gate is a separate wall — r111/r112: no village ever
  faced wave 5).
- **sentimentTaught day per seed.**
- **Minting-balance bar:** explore capped on ≥3/4 seeds AND fight
  mints <5 on ≥3/4 = GAP-CONFIRMED; else the per-track split.
- **Cash-out watch / Pellet-radiation watch / National-global
  staging / Table approach / Village assessment / D-THING, bonds,
  betrayals / Raise ledger / Realm dissolve, re-stage / Feast
  bundle:** carried from r112, report-only.

## Seed band — MATCHED PANEL, not a fresh band

- **Seeds 97901–97904 (the r112 band), reused as a matched
  before/after panel** (§15): before = r112's published band on
  the r112 policy + r112 base; after = this run's trade-road
  policy on the current base. The policy is the only intended
  delta; the base move (db7fb1c6a → 60eb9a5bb, deepening-only,
  no hierarchy/ladder/table/fieldFights change) is disclosed
  above. This is NOT a freshness claim: 97901–97904 are used,
  named in the r112 prereg, and must never be presented as fresh.
- Freshness re-check (per local_seed_band_freshness): grepped ALL
  dated preregs (`evidence/*/sim-*-prereg.md` +
  `evidence/*/journey-*-prereg.md`) for each seed as a whole
  token — the ONLY hits are the r112 prereg and this prereg. No
  forbidden-band collision (99201–99208 contaminated band
  untouched; 97801–97804 r111, 98000–98099, 97501–97516,
  98601–98616, 99001–99016 all disjoint).

## Method

- PILOT GATE: baseline seed 97901 runs first. Crash, recorder
  errors > 0, or a reggate file with 0 rows → STOP, do not score
  the band. Pilot also gates the new instruments: if the
  fieldFight watch records 0 rows on the pilot while the census
  shows villager-combat deaths > 0, STOP — the watch is blind
  (INCOMPLETE, not a verdict). Pilot also gates the trade road:
  if 0 trade proposals fire by day 60 on the pilot, STOP and
  diagnose the propose path before burning the band (the fix
  itself is broken, not the game).
- DAYCAP=180, death-aware (a dead/scattered village stops; +10d
  tail max). Horizon reason (§10): same as r107–r112.
- Policy: the new trade-road stack
  (`scalecourt-traderoad-r113-linkraise-sit`), unchanged through
  the band — frozen in this prereg, do not tune mid-band. The
  sit/modal layers stay live (r110 proved them GO). Single leg:
  this is a BUILD + MEASURE of the trade road and the wild-w4
  question, not a lever test on the ladder.
- Telemetry: `telemetry-check.js` against
  `telemetry-baselines/scale.json` after evidence is written
  (metrics: fightsTotal,fightsByWave.4,maxGameDay). The driver
  emits those three keys at the trust-JSON top level. Any LOUD
  line is a same-run investigation item before the baseline rolls
  forward with --update-baseline. Do NOT roll a baseline forward
  over an unexplained LOUD line.
- **Gate note (carried, not hidden):** the full `check.js --quick`
  gate will NOT run inside this run unless it completes quickly —
  the r112 gate (294/6, all adjudicated pre-existing) ran on the
  line this base descends from, and this run changes ZERO src/js
  (scripts + evidence only). The r113 proof tests + pilot evidence
  are the regression cover, as for r107–r112. `check.js --quick`
  is attempted at the end and its result (green or timed-out) is
  reported honestly.

## Pilot addendum (written after the 97901 pilot, before the band)

Pilot seed 97901 ran full DAYCAP 180 (ended d90, lesser seat WON,
pop 7/7, pantry 108,444, 0 instrument errors, 86 reggate rows,
49 wild fights logged). Two pilot-found defects, both fixed before
the band (policy + driver only, zero src/js; the band re-runs 97901
with the fixed stack and the pilot's 97901 files are superseded):

1. **Sub-cap guard never engaged (POLICY defect, not the game):**
   viability read false through the whole early raise window
   (d24–d41) because no village is at opinion 10 before the climb
   (courtship starts d25), so all 3 raises were answered and subs
   reached 4 with 0 sub-cap skips — the guard's opinion-10 rule was
   blind to the climb. Fixed: `tradeViable` is now the COUNT rule
   (live trade links + unlinked known villages +1 for a pending
   counter ≥ 3, the road's bar). The instrument snapshots the
   climbable pool (`pool`) alongside `candidates` so the analyzer
   can see the road's raw material.
2. **Lesser-seat win ends the run before a charter can seal
   (DRIVER defect, not the game):** the pilot won the lesser seat
   at d90 and ended, with the first trade link formed d47 (seasoned
   d77, then trust-dipped below the bar d78 on a Herald strike) —
   a charter needs 3 seasoned trade links, ~d95+ on this pace.
   Fixed: the driver runs with SEATDRIVE=0 — the table offer is
   STANDING (Steve 2026-11-06), so a competent player chasing the
   FULL seat lets the lesser seat wait instead of taking it and
   ending the run. Q3 is re-scoped: lesser seat PRICED (not taken)
   on ≥2/4 = HOLDS; the price is the measurable half, the taking
   is deferred by design. The delivery verb still delivers a ready
   capstone; the full seat is judged by PRICED, not taken.

Pilot headline (unscored, single seed): TRADE ROAD 1 link by d47,
0 seasoned held (trust flicker d77→d78); WILD W4: 3 villager
wave-4 field fights, ALL vFlee (they meet the beasts and flee —
0 wild w4 kills, 0 wild w4 deaths; vs 42 vKill on w1–w3); VETERAN
WALL CRACKED: 1 wave-4 kill by a VILLAGER, who LIVES (w4total 1,
scholar 0, villager 1, living 1) — the first living villager
wave-4 killer on this leg (r112 band-wide: scholar 5, villager 0).
Sub trust decays below the seasoned bar even on 66-day-old links
(village_2: 40 → 6 by d90) — seasoning is trust-limited here, not
age-limited. All to be judged on the band, not the pilot.

3. **Count-rule guard still never engaged (PILOT RE-RUN defect):**
   the re-run pilot (SEATDRIVE=0, run to d181) still shows
   maxSubs=4, subCapSkips=0. At the 3rd raise (d38) only 4 villages
   were known and 2 were already subs, so the count read 2 < 3 and
   the guard lifted; the 5th village (the trade partner) only became
   known ~d46. A snapshot rule cannot see villages still arriving.
   Fixed: the DECISIONS now use the WINDOW rule — the trade road is
   pursued to day 120 (past the charter's earliest seal ~d95), and
   inside the window the policy (a) proposes trade first, covenant
   second, (b) holds subs at 1 (no raise-answer forms a 2nd sub),
   (c) walks covenant beats; after d120 it falls back to the base
   (covenant-first, pact, unguarded raises). The count rule stays as
   the instrument's live read of formable routes, not a decision
   input. Re-run pilot headline (unscored): run to d181, NO lesser
   sit (SEATDRIVE=0 works); military_tribute DELIVERED d107 — 2
   living villager wave-4 veterans, the first tribute delivery on
   this leg; wild w4: 7 calls (6 vFlee, 1 vKILL in the wild); trade
   still 1 link (the guard fix is what the re-run pilot now tests).

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed trade proposals (count + days), trade links
  formed/seasoned (counts + first days), Charter beat staged day
  + answer, charteredLinks, trade_charter first-ready day,
  delivered kind/day, sub-cap skips, covenant walks, villager-
  class w4+ fieldFight calls by outcome (evade/vKill/vDie/vFlee/
  mFlee) + rounds, per-seed first-day-reached per ladder stage
  1/2/3 (or never), peak stage, counted + shortfall + capped
  tracks at end, per-track totals, bundleStages, first-ready day
  per capstone kind + reason when not ready, delivered kind/day
  (or never), first priced day per seat kind (lesser/full),
  sentimentTaught day, killAttr end state. A miss is INCOMPLETE,
  never re-scored against a friendlier metric mid-run.
- SECONDARY (report-only): survived days, end cause, pop alive/end,
  national/global, seat priced, transcript senseless count (must be
  0 to claim the people check clean), raise-talk senseless count
  (must be 0), dissolve/re-stage count per seed, capstone delivery
  attempts (kind, day, ok, reason), cash-out events, pellet
  radiation deaths.
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
