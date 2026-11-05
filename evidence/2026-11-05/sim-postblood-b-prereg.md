# Post-blood killer deaths — PRE-REGISTRATION (arm sim-postblood-b)

Run: fleshout-loop-b-20261105T0618Z. Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Committed BEFORE any judged sim. Instrument-only;
ZERO src/js changes, no policy probe variant, no gate/price/deed/
readyDemand change. A BUILD follows ONLY if a mechanism is found — do
not presume one, do not design the contest-shield in this arm.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave 5 demands 2 LIVING
  villagers with wave-4+ kills. No canon invented here.
- `docs/CONTESTS.md`: casting is weighted by notability (ONE shared
  weight: deed depth + impact); "the player is the surest star and is
  taken first when castable"; the System's whim is a 10% uniform path,
  announced. Contests + TV shows share a ~2/week budget; contests begin
  ~day 14–21. Death is on the table; corpses, funerals, gossip.

## Code-read before this prereg (not canon, stated with file/function names)

- `src/js/contests.js` `notabilityWeight(vid)` (line ~318) is the ONE
  shared casting weight for contests and shows. `NOTABILITY_IMPACT`
  lists `wave3Kill: 4` and `wave2Kill: 3` — but there is NO `wave4Kill`
  entry, and NO call site in real gameplay adds `wave2Kill` or
  `wave3Kill` (the only `addNotability(..., 'wave2Kill')` calls are in
  `src/js/debug-scenarios.js`); `recordWaveKill` (`src/js/game.js`)
  adds no notability of any kind. A wave-4 kill therefore does NOT raise
  a killer's contest/show casting weight through the notability channel.
- What CAN still take a fresh killer fast: the scholar is taken first
  when castable ("surest star"), regardless of deeds — so a
  scholar-killer's show exposure rides the player slot, not killer
  status. NPC killers are drawn weighted by notability, which a wave-4
  kill does not raise. The casting recency repel (recently-cast notables
  discounted ≤2d ×0.25, 3–5d ×0.5, 6–10d ×0.75) does NOT apply to the
  player-first slot or the whim path.
- Death-cause wiring for the show bucket: scholar contest deaths call
  `playerDeath('contest')` (`contests.js` `_contestDie`, line ~5490);
  scholar arena deaths call `playerDeath('the arena')` (`ledger.js`
  `arenaDeath`, `game.js` `tbFightDeathCause` returns 'the arena' while
  `state.arenaContest` is live). Both land in `fallen` with that literal
  cause (`ledger.js` playerDeath fallen push defaults only when the
  caller passes none). NPC contest deaths go through
  `_cxKillContestant`, which pushes a `fallen` entry with cause
  `'contest'` literally. So SHOW = fallen cause 'contest' or 'the
  arena', split cleanly by the killerdeath playerDeath-wrap + fallen
  literal — no new taxonomy.
- `src/js/ledger.js` playerDeath fallen push defaults cause to 'the
  wild' when the caller passes none — a bare 'the wild' is a RESIDUAL,
  not a cause, until split (killerdeath prior art, reused here).

## Prior evidence read (not re-run, not re-proved)

- Pooled committed corpora (coordinator pre-analysis,
  `hidden_files/fleshout-loop-b-20261105T0618Z-postblood-preanalysis.md`):
  16 killers, 11 deaths. Death-cause split: wild/monster 7, show
  (arena/contest) 3, expedition 1. Died within 7d of first blood 6/11;
  within 1d 2/11 — BOTH show deaths (Boris 99154 contest d+1; Marcus
  99157 arena d+0). Baseline-only median alive-after-first-blood 5d
  (mean 13.1d, range 0–66d). Caveats carried forward: n=16 is small;
  standaccum2 seeds 99117–99126 killers exist only in the band summary
  with firstDay/deathDay and NO cause; two killers show death=None with
  a village-lost horizon (alive at village loss, NOT "survived").
- `evidence/2026-11-05/sim-secondkiller-b.md`: Boris dies in a contest
  the day after first blood; Marcus dies in the arena the same day; only
  Sigrun lives.
- `evidence/2026-11-05/sim-killerdeath-b.md`: retention kept killers
  home longer (Yuki lived 66d past first blood) but deaths that took
  retained killers happened AT HOME (arena, expedition); Dmitri died in
  the arena the day after retention.
- `evidence/2026-11-05/sim-standaccum2-b.md` + `standaccum2-band-
  summary.json`: killers sequential, never coexisting; kill-to-death
  median 11d.

## Question

What kills fresh wave-4 killers, and how fast — and whether the show
(contest/arena) preferentially takes them.

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99171–99186 (16 seeds, never used by prior arms),
  competent policy VERBATIM, 150d death-aware horizon (dead villages
  stop simulating, +10d tail max via runDays). 16 seeds, not 8: the
  pooled n=16 is thin and this DIAG needs killers.
- Stage 0 smoke (2 seeds, 99171–99172, to /tmp, NOT judged):
  instrument fires — killer identity, first-blood day, death day +
  split cause, roster death ledger, exposure-day counters. Smoke result
  (not a judged number): 0 instrument errors on both seeds.
- Instrument: `scripts/killerdeath-instrument-20261105.js` REUSED
  verbatim (recordWaveKill kill-time scholar capture, playerDeath wrap,
  killer tracker, daily snapshots, fallen + deadMap finalize). Driver:
  `scripts/postblood-driver-20261105.js` (killerdeath driver copy with
  postblood naming; OUTDIR `evidence/2026-11-05/perseed-postblood-b/`).
  Analyzer: `scripts/postblood-analyze-20261105.js` (reuses
  killerdeath-analyze `killerFates`/`classifySeed` for per-killer fates;
  adds the roster death ledger, the fresh-window exposure rates, and
  the show-take comparisons). Proof:
  `scripts/test-postblood-20261105.js`.

## Definitions (fixed before the judged band)

- Wave-4 killer: a villager id with ≥1 wave-4+ entry in
  `state.waveKillLog`. First blood = earliest such entry's day.
- Fresh killer / fresh window: days [firstDay, firstDay+7]. A killer
  who dies with killToDeathDays ≤ 7 is a FRESH-KILLER DEATH.
- Death-cause split: the killerdeath splitter, reused unchanged:
  monster:<name> (fallen monsterId/monsterName) > scholar-death:<causeArg>:
  <at-haven|away>:<in-combat|pending-encounter|not-in-combat>
  (playerDeath wrap) > literal fallen cause; bare 'the wild' with no
  split evidence is 'the wild (unsplit residual)', its own bucket,
  never cited as a cause. Cause BUCKETS for the verdict: SHOW =
  cause 'contest' or 'the arena' (literal or via scholar ctx);
  WILD/MONSTER = monster:* or literal 'monster' or 'combat' or
  'the wild (unsplit residual)' reported separately from split wild
  (see metric review); EXPEDITION = 'the expedition'; OTHER = every
  other literal cause (thirst, wound, phoenix link, …).
- Roster death ledger: every `fallen` entry in the band, deduped to one
  row per villagerId (earliest day), classified into the same buckets
  with the same splitter (scholarDeaths ctx applies to any scholar
  death, killer or not). Non-killer roster deaths = ledger rows whose
  villagerId is not a wave-4 killer.
- Exposure: fresh-killer-days = killerTrack rows with
  deadInFallen=false and day in [firstDay, firstDay+7], summed over
  killers. Roster-days = Σ daily.living over seeds. Non-fresh
  roster-days = roster-days − fresh-killer-days. Rates are show deaths
  per 100 exposure-days in each pool (fresh-killer show deaths /
  fresh-killer-days; non-killer show deaths / non-fresh roster-days).
- Censoring: a killer with deathDay null (alive at horizon, or no death
  record at village loss) is CENSORED, never "survived". Censored
  killers are excluded from death-cause shares and from the
  kill-to-death median, and are counted separately.

## Primary metric (binding — judge only against this)

For every wave-4 killer: days from first blood to death + death-cause
split (bucketed as above), PLUS the show's take rate on fresh killers
vs the show's take rate on the general roster, in BOTH forms:

1. SHARE form: show share among fresh-killer deaths (died ≤7d after
   first blood) vs show share among non-killer roster deaths.
2. RATE form: show deaths per 100 fresh-killer-days vs show deaths per
   100 non-fresh roster-days.

Secondary split (reported, never re-scored): show share among
non-killer SCHOLAR deaths vs non-killer NPC deaths — this separates
"the show takes the scholar first" from "the show takes killers".

## Verdict rule (pre-registered, RANKED, not a GO/NO-GO on a lever)

(a) SHOW-PREFERENTIAL SELECTION implicated iff ALL of: ≥4 fresh-killer
deaths in the band; show share among fresh-killer deaths ≥ 2× the show
share among non-killer roster deaths; AND the rate form agrees (show
deaths per 100 fresh-killer-days ≥ 2× the non-fresh roster rate).
Corroboration (not required): ≥2 killer show deaths at 0–1d after
first blood while wild killer deaths spread over days 2+.
If (a) holds, the named next blank is a BUILD investigation (what
selection path takes them — player-first slot vs whim vs scheduling —
before any shield is designed).

(b) WILD EXPOSURE as the dominant window-killer iff: wild/monster is
the largest cause bucket among fresh-killer deaths AND the show share
among fresh-killer deaths is < 1.5× the non-killer base rate. Then the
next blank is a finishing/exposure lever, not a show lever.

(c) NEITHER / UNDERPOWERED iff: fewer than 4 fresh-killer deaths, or
the share form and the rate form point in opposite directions, or (a)
and (b) both fail their margins. Say so plainly; do not over-claim.
The verdict is then "underpowered — no mechanism implicated" and the
named next blank is a bigger band or a different instrument, not a
build.

## Secondary (reported, never re-scored)

- Kill-to-death median (dead killers only, n stated) + range; share of
  dead killers dying ≤7d and ≤1d after first blood.
- Death-cause split over ALL dead wave-4 killers (not just fresh).
- Killer channel mix (player vs NPC via kill-time scholar capture).
- Max simultaneous living killers per seed; seeds with a living pair.
- Wall numbers every run: wins, national, table, wave 4-5 unlocks,
  wave 4-5 faced, median survival days.
- Per-killer trajectories for the closest seed. Closest seed = highest
  maxSimultaneous, tie-broken by longest killer survival (alive at end
  beats any death span; else max kill-to-death days).
- Roster ledger totals: total roster deaths, show share overall, and
  the scholar-vs-NPC split above.

## Metric review (per §14; filled at verdict time, not now)

- Whether the 7d fresh window was the right window (sensitivity: 3d
  and 14d cuts reported alongside, not re-scored).
- Whether 'the wild (unsplit residual)' deaths among killers, if any,
  could hide show deaths (last-seen tracker context inspected).
- Whether killer scarcity on this band thinned the fresh-death count
  below the (a) threshold — and what band size a re-run would need.
- Whether the share form and rate form agreed or conflicted.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: single-arm instrument run, no
Game-root change and no policy variant to compare. No balance-panel
compare exists for it, and none is attached. Telemetry deviation check
(loop-body step 10) is ATTEMPTED; if the tool refuses recorder corpora
(as it did for killerdeath-b), that refusal is reported and wall
numbers are reported directly instead of via a forced flag.

## Sense-testing law

Read at least one killer's death window in the transcript (death-day
say lines in the corpus, plus death context): judge meaning,
coherence, consequences — never just counts.

## Proof (committed with this prereg, before judged sims)

`scripts/test-postblood-20261105.js` — fixture tests for the roster
classifier (contest/arena → SHOW; monster-threaded → WILD/MONSTER;
expedition; bare 'the wild' residual; scholar-ctx split of a 'the
wild' fallen entry; fresh-window boundary at 7d vs 8d; exposure-rate
math; scholar-vs-NPC split), live harness smoke 5d, off/on neutrality
leg 10d seed 99171 (identical days, endReason, kill-log length, 0
instrument errors). Instrument reused:
`scripts/killerdeath-instrument-20261105.js`. Driver:
`scripts/postblood-driver-20261105.js`. Analyzer:
`scripts/postblood-analyze-20261105.js`.
