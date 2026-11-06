# Propose-first probe — PRE-REGISTRATION (arm sim-proposefirst-b)

Run: fleshout-loop-b-20261106T1130Z. Loop B winnability-chain arm:
0730Z blank #6 / linkseek blank #5 — travel-leg marginal value.
Committed BEFORE any judged sim. POLICY-SIDE ONLY, zero src/js.
No gate / price / deed / readyDemand change. No game-code change.
Do NOT rebuild villager-initiated bonds (separate main-session
build). Do NOT touch Loop A's live arms or trees
(sim-mootgate-a, sim-gorgeharness-a). Do NOT touch the sim-hold-b
tree (sibling adoption arm in this same run).

## Canon read before this prereg

- `docs/CANON.md` (manifest). No canon doc covers link trust /
  tribute mechanics in full — the mechanism lives in
  `src/js/standing.js` (`_linkRegionalPlus`),
  `src/js/hierarchy.js` (`polityOf`, `tendLink`, `linkTick`,
  `successionCrisis`, `theirLeaderDied`, `answerRenegotiation`,
  `_trustGain`, `_linkNeglected`) and the leadcourt/linkseek
  policy; this prereg invents no canon, it only re-orders the
  policy's verbs.
- `evidence/2026-11-06/sim-linkseek-b.md` + its prereg (the
  GO/GO this continues): under competent play the scholar knows
  other villages by day 4 on 15/16 seeds and never once proposes
  a bond (0 proposeLink calls on 16/16 baseline seeds). When the
  seeking policy asks: 47 proposals, 45 accepted outright, 2
  counter-offers (both answered next day and formed), 0 declines,
  0 shut doors. Bonds form at trust 30, season at 30 days if
  trust holds 40+. But the FIRST proposal comes late — 25–58
  days — even though villages are known by day 4.

## Grounding verified in code before the pilot (not assumed)

- `proposeLink` needs only KNOWLEDGE, not presence
  (linkseek prereg grounding). `studyVillageCodex` needs dist
  <= 2 and gives +3 opinion once per village. `judgeLink`
  (hierarchy.js): base 38 + representative standing/2 (max 20)
  + opinion/2 + allied 15 + strength diff (max 15) + subordinate
  10 + generosity 8 (opinion 5+ and tribute >= 3000) + R()*20-10.
  Score >= 55 forms; 35–54 stages a counter.
- linkseek's sequence per day (read `scripts/policies/
  linkseek.js`): after `competent.daily`, (1) TRAVEL leg,
  day>=15, pantry>12000, roster>=4: walk toward the nearest
  KNOWN village with NO LINK (perception-gated), study its
  codex at dist<=2 (+3 opinion, once); (2) PROPOSE leg,
  day>=25, pantry>12000, no pending counter/accord/national,
  one/day, 7-day cooldown per village, stop at 3 subordinate
  links, tribute 4000, asSubordinate false. Travel+study sit
  BEFORE the ask in linkseek's sequence, although the proposal
  itself does not need presence. That ordering is exactly what
  this arm tests.
- The linkseek run's first-proposal range (25–58) is consistent
  with the day>=25 floor plus the pantry>12000 guard (and, on
  56003, first-known day 33). Travel time and scholar position
  CANNOT delay a proposal in linkseek's code (propose is not
  distance-gated) — the open question is whether proposing
  earlier, without the travel/study warm-up, changes anything:
  earlier seasoning starts, colder asks (no +3 study opinion,
  so more counter-band outcomes), and travel spent only on
  bonded villages.

## The lever (policy-side only)

`scripts/policies/linkseek-proposefirst.js` = linkseek verbatim
+ propose-first, NOTHING else:
- PROPOSE on first contact: the day a village first becomes
  known (`Game.knowsVillage` true — lore / generated / delivered
  rumor, never a roster), it becomes a proposal candidate THAT
  SAME DAY. NO day>=25 floor. Candidates ordered earliest-known
  first (first-contact order, tracked in ctx), not otherVillages
  order. One/day, 7-day cooldown per village, stop at 3
  subordinate links, tribute 4000, asSubordinate false,
  pantry>12000 guard on proposing — all other leadcourt
  parameters verbatim.
- TRAVEL re-targeted to LINKED villages only: walk to a village
  already bonded with, study its codex there, be present to
  tend. Same guards as linkseek (day>=15, pantry>12000,
  living>=4, one leg/day). NO travel to an unlinked village:
  the ask goes first.
- Counter/accord/national/global answers, weekly tending
  (pantry>20000), defense calls: verbatim from linkseek.
- STATED CONSEQUENCE (not discovered later): cold proposals
  carry no +3 study opinion, so `judgeLink` may land in the
  counter band (35–54) more often than linkseek's warmed
  proposals did. Counters are answered the next day and form —
  the outcome split (formed / counter / declined / shut-door)
  is the analyzer's record of whether colder asks cost anything.

## Primary question

How much of the first-proposal delay (25–58 days in linkseek)
is the travel leg, and does proposing on first contact change
anything — first-proposal day, seasoned links by day 150,
or the outcome split?

## GO bar (binding — judge only against this)

GO iff ALL of:
1. EARLIER: median first-proposal day ARMED (proposefirst) <=
   median first-proposal day BASELINE (linkseek) − 7 days, on
   identical pilot seeds. Both legs must propose on >= 6/8
   seeds for the median to be meaningful; fewer, and the
   clause FAILS (recorded, not re-scored).
2. NO SEASONING LOSS: pooled seasoned links ARMED >= pooled
   seasoned links BASELINE across the 8 pilot seeds
   (seasoned = `_linkSeasoned` true, derived from snapshot
   transitions by the analyzer).
3. Guards hold: median survival armed >= 0.8x baseline median
   survival; total wave-4 ledger points armed >= 0.5x baseline
   total (wave-4 kill proxy = `waveLedgerPoints(4)` summed
   across seeds; if the baseline total is 0 the guard is
   vacuous and is recorded as such, not as a pass-with-evidence).
A miss on any clause is NO-GO, never re-scored against a
friendlier metric mid-run. Metric problems go under "metric
review" for the NEXT run. DIAG: whatever the verdict, the
per-village first-known -> first-propose lag table answers
how much of the remaining delay is the pantry guard vs the
travel leg vs the (removed) day floor.

## Method

- Two legs per seed, identical seeds, sequential `loadGame`
  calls (separate harness loads, same seed, so trajectories
  start identical and diverge only where the policies differ):
  BASELINE `linkseek` (the landed policy), ARMED
  `linkseek-proposefirst`. Default env. No policy variants
  beyond these two. (`competent` is NOT re-run: its 0-proposal
  pin is already established on 16 seeds by sim-linkseek-b.)
- Seeds: pilot 72001–72008. Horizon: 150 days, death-aware
  (dead villages stop simulating; +10d tail max). Pilot scale:
  this 8-seed pilot; confirm 8 fresh seeds (78001–78008,
  reserved) ONLY on pilot GO; pooled pilot + confirm = 16
  seeds, judged on the same bars.
- Instrument: `scripts/linkseek-instrument-20261106.js` reused
  UNTOUCHED (daily standing breakdown, ledger, full link roll,
  feasts, readiness-5, per-snapshot KNOWLEDGE roll, court
  counters). First-proposal day and first-contact day are
  DERIVED by the analyzer from the court log + knowledge roll —
  no instrument extension was needed, so no wrapper was written.
- Driver (`scripts/proposefirst-driver-20261106.js`): modeled on
  the linkseek driver; runs both legs per seed, writes per-seed
  JSON to `evidence/2026-11-06/perseed-proposefirst-b/` (sims
  write once, on purpose; refuses to overwrite). Say-lines with
  the linkseek driver's TIGHT filter.
- Analyzer (`scripts/proposefirst-analyze-20261106.js`): per-seed
  first-proposal day + first-known -> first-propose lag per
  village + GO/guard verdict + wall numbers. Balanced panel
  (§15): attempted via `scripts/balance-panel.js`; if it
  refuses the policy-vs-policy shape (linkseek precedent), the
  §15 instrument is the matched-seed paired comparison on
  identical seeds that this analyzer performs — never a
  fabricated compare.
- Scale-wall numbers every run: wins / national / table, wave
  4–5 unlocks and facings, wave-4 kills, wave-5 kills,
  readiness-5-ready days, median survival, per leg.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run), death-aware horizons, pre-registration
  (this file), metric binding (§14), balanced panel (§15).

## Seed-band freshness (mandatory, verified this run)

- Pilot band 72001–72008: FRESH. Searched all committed
  preregs (`evidence/*/sim-*-prereg.md`), all evidence `.md`
  (`evidence/ --include='*.md'`, per-seed JSONs excluded from
  the text search; per-seed filenames checked separately via
  `find evidence -name '*7200*'` — 0 hits), the convergence
  tracker, and the forbidden lists below. 0 hits on every
  seed in the band.
- Confirm band 78001–78008: FRESH by the same search (only
  hit anywhere is the substring `7800` inside seed 97800's
  file `evidence/2026-11-02/perseed-creekwood-a/
  cw-base-s97800.json` — a different seed, not a band naming).
  Reserved for this run's confirms only.
- REJECTED bands (collision recorded so the next worker does
  not repeat them): 60001–60004 (journey-scale r5/r23
  scalecourt pilot, `evidence/2026-10-12/journey-scale-r5.md`
  + `evidence/2026-10-23/journey-scale-r23.md`); 61001/61007/
  61008 (tracker + `evidence/2026-10-30/sim-axeacq-b-prereg.md`);
  62001/62003/62005/62006/62008 (homeward/food rounds,
  2026-11-02); 63001–63004/63008; 64001–64008; 65001/65008;
  66001–66008; 67001/67008; 68001/68005/68008; 69001/69005/
  69008; 70001–70008; 71001–71006; 73001/73003/73005/73008;
  74001–74008; 75001–75008; 76001–76008; 77001–77003/77008;
  79001–79004/79006/79008; 80001–80004/80008.
- FORBIDDEN (task brief, never re-pick): 56001–56008,
  57001–57008 (linkseek), 58001–58008, 59001–59008 (hold),
  53001–53008 (stageally-confirm), 55001–55008
  (stageally/finishprobe), 991xx ranges.

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the median-first-proposal
  GO bar, the pooled-seasoned bar, and the ledger-point wave-4
  proxy held up; whether the pantry guard (kept verbatim) or the
  counter band dominated the remaining delay.
