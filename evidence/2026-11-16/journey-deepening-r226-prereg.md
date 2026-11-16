# Journey deepening r226 — prereg

- Run: r226, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222)
- Run id: playtest-a-20261116T0945Z (lock playtest-loop-a-2026-11-16T15:43:53Z)
- Base: master 47477d874 (worktree journey-deepening, registered 15:48Z; registration queued ~8 min on the registry lock — live reaper self-contention, same as r222)
- Policy: competent, single arm, linger-guard ON (current master; r218 settled guard stays)
- Seeds: 102301–102308 (8 seeds)
- Seed-band freshness check (local_seed_band_freshness): searched all of
  `evidence/` (repo) — 0 hits in *.md preregs and 0 hits in *.log panel
  headers for each of 102301–102308; the loose substring "1023" hit one
  file (evidence/2026-11-11/sim-finalvoice-b-prereg.md line 47) — a test
  filename list (test-*-20261023.js), adjudicated NOT a seed use. Hidden
  evidence (`hidden_files/evidence/`) per-seed filename check: 0 files
  for 102301/102302/102303/102305/102306/102307/102308; "102304" hit 3
  files (2026-11-08/medheadcount-a panel-before/after case JSONs) —
  adjudicated NOT a seed use: the hit is a substring inside floating-point
  kcal values (e.g. 18360.89321023043) in corpora whose recorded seed is
  42. Band is fresh. Files searched: the whole repo evidence tree
  (2026-10-15 through 2026-11-16) + the whole hidden evidence tree.
- Driver: fork of scripts/journey-deepening-r222-20261116.js (r222 → r226,
  band + tag + EVIDIR date only, plus the r226 instruments below; no
  picker/policy change). Analyzer: fork of
  scripts/analyze-journey-deepening-r222-20261116.js + new
  summarizeTitanMuster section (Q1) + wave-split stall fields in
  summarizeTrickPipeline (r222 metric-review owed item) + proof test fork.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave law, wave-4
  gate: standing >= 100 + readiness bars; wave-4 roster; observation
  channel: 2 survived encounters → trick). NO canon doc covers
  titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json
  (Herald: wave 4, minAllies 10, monster "herald"; omen needs wave >= 4
  AND scaleRank regional+, 0.10/day; no_solo_titans hard-refuses
  startCombat without a complete muster; commit_own_is_explicit) and in
  r223's pinned mechanism (scale leg, same master lineage).

## Q1 — TITAN MUSTER + WAVE-4 RE-ENCOUNTERS (primary)

Why: two findings converge on this leg. (1) r223 scale (days 80–140)
found the Herald UNFIGHTABLE: 151 meetings, 0 fights — the muster was
never sounded, Haven never committed its blades, and the sortie path was
closed by the driver HP gate; the titan gorged on the stores and drifted
off. (2) r222 deepening found wave-4 signature tricks stalled at ONE
observation on 6/8 seeds — the village meets a wave-4 type once, survives,
and never meets it again before day 100. Deepening (days 40–80) is where
the Herald FIRST arrives (omen needs wave 4 + regional; r222: wave 4
reached 8/8, regional 8/8 by day 40). This panel measures whether the
muster ever gets built in the window where it first matters, and whether
wave-4 types ever get their second observation.

Bound metrics (per seed, panel totals in the analyzer):
- heraldOmen: state.titans.omens.herald {stage, day} at end (stage 0 = never
  staged; 1 = named; 2 = located).
- titanDays: days the herald monster is present in the daily monsterWatch
  census (id 'herald'), first/last day, HP first/last. Lingerer days are
  the herald-present days with lingering=true.
- musterVerbs: driver-wrap counts of Game.soundTitanCall /
  Game.titanCommitOwn / Game.titanWarCouncil (pure logging wraps; the
  competent policy is not expected to call them — a 0 with a working
  counter is data, not absence of instrument).
- musterEnd: state.titans.musters.herald allies/haven counts vs minAllies
  10; titanMusterReady(herald) at end; state.titans.slain.herald.
- w4obs: per wave-4 type obsCounts at end (0/1/2) from trickEnd; types
  stuck at 1; wave-4 tricksHeld.
- w4fights / w4kills (existing summarizeWave4 / trick pipeline).

Interesting if ANY holds (GO = a finding worth a fix or a lever brief):
- muster verbs fire 0 times panel-wide while the Herald is present >= 1
  day on >= 1 seed (the r223 blank reproduces in deepening), OR
- >= 6/8 seeds have >= 1 wave-4 type stuck at obs=1 at day 100 (the r222
  thin spot reproduces), OR
- a muster completes (titanMusterReady true) or a titan fight happens
  (new behavior — document how it got there).
A miss on all three = NO-GO: no muster in deepening either, but also no
re-encounter starvation — the door problem sits in the scale window or
elsewhere.

## Q2 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING
LAW): does the NPC want something, do options engage/deflect it, do endings
resolve/plant/owe? Note verbatim lines.

## Q3 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was
missing). Judge reachable / fun / winnable for deepening.

## Instrument change (r222 metric-review owed)

summarizeTrickPipeline gains wave-split stall fields: stallW12 (the old
single stall restricted to wave 1–2 types) and stallW3plus (restricted to
wave 3+ types), so a healthy low-wave pipeline cannot hide a stalled
wave-4 pipeline. The old `stall` field is kept verbatim for comparability
with r218/r222.

## Watches (no verdicts unless the bar trips)

- Scholar deaths (standing metric, r138 rule as corrected by r222's metric
  review): compare against the r218 guard-ON arm (30 total, 22 wild), NOT
  the establishment ≤2/panel bar — that bar is an establishment-leg bar.
- Survival vs r222 (6/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores
  (r223: 800–1,200 kcal/night) — counted only if the analyzer scan finds
  them; no verdict.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache
  /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/deepening.json --current
  'evidence/2026-11-16/journey-deepening-r226-seed*.json'`. Known LOUD
  schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on
  that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
