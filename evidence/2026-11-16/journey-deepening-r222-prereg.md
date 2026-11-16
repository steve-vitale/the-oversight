# Journey deepening r222 — prereg

- Run: r222, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218)
- Run id: playtest-a-20261116T0620Z (lock loop-a-20261116T062004Z)
- Base: master 209704334 (worktree journey-deepening, registered 06:24Z; master moved past 3853257d6 after the 06:20 pull — sim-seedattach-a evidence landed in between)
- Policy: competent, single arm, linger-guard ON (current master; r218 settled guard stays)
- Seeds: 102001–102008 (8 seeds)
- Seed-band freshness check (local_seed_band_freshness): searched all of
  `hidden_files/evidence/` — 0 hits in *.md preregs for each of 102001–102008
  as a seed/band token, 0 hits in *.log panel headers (`SEED 10200[1-8]`).
  A loose substring grep matched 10 Oct files (testdrive-pilot, ambient,
  crumbdefault censuses) — those are kcal/timestamp substrings, adjudicated
  NOT seed uses. Band is fresh. Files searched: the whole evidence tree
  (2026-10-15 through 2026-11-16).
- Driver: fork of scripts/journey-deepening-r218-20261115.js (r218 → r222,
  band + tag + EVIDIR date only; no picker/policy change). Analyzer: fork of
  scripts/analyze-journey-deepening-r218-20261115.js + new
  summarizeTrickPipeline section (Q1) + proof test fork.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md § Monster counters
  (waves 1–2 carry a `counter` field — the lateral trick; waves 3–5 carry
  none, signature counterplay is learnable via noteVillagerTrickObservation
  into state.villagerTricks).

## Q1 — TRICK-KNOWLEDGE PIPELINE (primary)

Why: the 0430Z aidgate adoption (Nov 16) found door consults trick-hold
6/7 — the binding constraint on the winnability chain is trick knowledge
at the door. Deepening (days 40–80) is where that knowledge should
accumulate. This panel measures the pipeline end-to-end, per seed, at day 80:
slain-unknown types → counter discovered (discoverMonsterCounter) →
teachable (counterTeachable non-null) → taught (askAbout beasttricks) →
wave-3 signature tricks held (state.villagerTricks) → wave-4 fights/kills
with knowledge held.

Bound metrics (per seed, panel totals in the analyzer):
- slainUnknown80: distinct monster types slain ≥1 with no counter known at d80
- countersDiscovered: counterEvents by d80 (discoverMonsterCounter fires)
- teachableDays: NOT USED — the daily teachableDays sampler was dropped in
  r10 (empty 8/8; intent covered by counterEvents + beastAsks). The
  teachable signal is `teachableBefore` non-null across beastAsks (5-day ask
  ticks in knowledgePlay).
- beastAsks by class: taught / none-no-counter / none-other (r92 classifier)
- tricksHeld80: distinct (villager, monster) entries in state.villagerTricks at d80
- w4fights / w4kills / w5ever: wave-4 fights, wave-4 kills, wave-5 ever faced

Interesting if ANY holds (GO = a finding worth a fix or a lever brief):
- <50% of slain-unknown countered types are taught by d80, OR
- wave-4 kills happen with 0 trick knowledge held by the fighters, OR
- the pipeline stalls at ONE identifiable step on ≥6/8 seeds (e.g. teachable
  never non-null despite slain-unknown countered types; or taught never
  fires despite teachable days; or counters never discovered despite kills).
A miss on all three = NO-GO: the pipeline flows; the door problem sits
elsewhere (teaching/scouting/lingerer-hunt per the aidgate note).

## Q2 — FAVORLESS-ASK WATCH (r221 blank carry, watch only)

r221 (establishment) found 20/73 raised asks (27%) never materialized into
a committable favor — want stayed ask_favor for the whole sitting, no favor
kind ever attached; clusters on distressed villagers. This run watches
whether the same shape reproduces in deepening sittings (analyzer favor
ledger). No verdict here — next establishment run owns Q1 on this.

## Q3 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING
LAW): does the NPC want something, do options engage/deflect it, do endings
resolve/plant/owe? Note verbatim lines.

## Watches (no verdicts unless the bar trips)

- Scholar deaths (standing metric, r138 rule): ≤2/panel = WATCH, ≥3 =
  investigate wild-travel risk.
- Survival vs r218 guard-ON arm (8 seeds, 100d): survival count + median lived.
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache
  /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/deepening.json --current
  'evidence/2026-11-16/journey-deepening-r222-seed*.json'`. Known LOUD
  schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on
  that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
