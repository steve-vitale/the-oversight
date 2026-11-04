# Tend-through recovery leg — Loop B, arm sim-recovery-tend-b

Axis: scale-onramp / winnability chain (wild ally-join → wave-4 kills →
veterans → readiness-5 release → wave-5 facing → full seat). This arm
tests ONLY the tend-through leg of the recovery question. It never
tests zombie-clearing, never bundles both legs, and never touches the
sibling tree sim-recovery-zombie-b.

This is one of two separately-tested recovery legs. The other leg's
results are not pooled with this leg's numbers, and no claim about
zombie-clearing is made here.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. docs/SCALE.md read: 1 season =
  30 days (Steve 2026-10-11); a polity is one primary with >= 3 SEASONED
  subordinates; seasoned = 30+ days old AND trust 40+ (links form at
  trust 30 — tending required); national cannot stage until Haven has
  been regional for a full season. No canon doc covers the diplomacy
  pipeline's day-to-day trust mechanics in the same detail — stated
  here instead of inventing canon; the trust mechanics are read from
  src/js/hierarchy.js headers and linkTick code, as in polityfrag.
- Trust mechanics, as found in code (current anchor, not taken on
  faith): weekly linkTick for Haven-primary links — full tribute +1
  trust, partial tribute -1 with the shortfall riding as arrears,
  nothing at all -2 with full arrears; tending (policy verb, NOT
  engine) +8, weekly, gated in the leadcourt POLICY on pantry >
  20,000 kcal; engine tendLink itself costs 1,500 kcal (partial
  credit if the pantry holds less, zero if bare), is once per week
  per link, and refuses during mourning. Speaker deaths cost a link
  -8 (succession haircut) with a 7-day mourning window in which
  gains are choked. The neglect snap kills only trust < 20 with no
  upkeep for 14+ days — tending counts as upkeep. scaleRank() reads
  live flags only: globalLive → 'global', nationalLive →
  'national', networkLive → 'regional', else 'village'.

## Question (from polityfrag, run 0830Z — not re-litigated)

With leadcourt verbatim, diplomacy HOLDS or COLLAPSES, never
flickers or recovers: of 5 seeds ever reaching diplomacy > 0, 2
hold to village death, 3 collapse exactly once with 0 recoveries
(pooled hold-share 274/343 = 0.799). Every drop is a weakest-link
trust-unseason after a 40–82 day pantry-gated tending gap
(leadcourt tends only when pantry > 20,000 kcal). One seed (99402)
resumed tending d97/d110/d111 including the dropped link, yet
trust still fell 21 → 0. A trust-0 link still counts as an active
subordinate, so no replacement is ever proposed.

Question for THIS leg: if tending never stops for the pantry gate
— tending weekly through thin pantries, at whatever partial credit
the pantry actually holds — do the baseline-collapsed polities
hold instead of dropping, or recover after a drop? This leg judges
tending CONTINUITY only. It does not judge re-proposal,
arrears-forgiveness, or any zombie-clearing mechanism: under
tend-through, a trust-0 active link still counts as a subordinate
and still blocks replacement, exactly as in baseline.

## Pre-registration (committed before any judged sim)

- Policy (judged leg): NEW file scripts/policies/leadcourt-
  tendthrough.js, leadcourt with ONLY the pantry > 20,000 tend
  gate removed. Everything else identical to leadcourt verbatim:
  tending still weekly (tendedWeek check unchanged), still
  Haven-primary links only, still 1,500 kcal cost per tend (the
  engine's price, unchanged), proposal gate pantry > 12,000
  unchanged, answer/counter logic unchanged. Do NOT edit
  scripts/policies/leadcourt.js itself. Do NOT touch src/js,
  gates, win prices, or deed gates. Do NOT add a propose/tend
  verb or remove one. Policy id: 'leadcourt-tendthrough'.
- Seeds (judged leg): 99401–99404 + 99409–99412 — identical to
  the polityfrag corpus. No new seeds. The 8 seeds ARE the
  pilot/screening leg; do NOT expand to 12–16 on this worker's
  own authority — report the pilot verdict and let the
  coordinator decide on confirm.
- Horizon (judged leg): 300 days, death-aware (dead villages
  stop simulating; +10d tail max as implemented by runDays).
  WHY 300: the baseline drops sit at d89/d117 in 140d runs and
  polityfrag's 300d window gave post-drop observation to death
  (max survival 146d); 300d preserves the identical window so
  per-seed comparison is like-for-like, while the death-aware
  stop bounds cost. A village alive at 300 is censored,
  reported as survived, not as a win.
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim via a
  new driver (scripts/test-recovery-tend-driver-20261104.js,
  output evidence/2026-11-04/perseed-recovery-tend-b/,
  RUN=recovery-tend) and the polityfrag analyzer
  (scripts/test-polityfrag-analyze-20261104.js) REUSED verbatim
  (not modified, not claimed as this arm's file). The snapshot
  NEVER calls villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately and
  never counted as a natural door-open. The driver refuses to
  overwrite an existing per-seed file.
- Baseline: CITED from evidence/2026-11-04/sim-polityfrag-b.md,
  NOT re-derived by re-running leadcourt (no reproduction
  re-run is needed: the baseline values are the published
  polityfrag pilot, and the tend-through policy changes game
  state from the first sub-20,000 pantry week, so early
  trajectories are expected to diverge by design). Baseline
  per-seed table (days / end scale / maxW / firstDiplo /
  diploDays / holdShare / drops / recov / trajectory / w5
  faced / ready days):
  - 99401: 98 / regional / 4 / — / 0 / — / 0 / 0 / never
    (polity-shape) / no / 0
  - 99402: 143 / regional / 5 / 60 / 29 / 0.345 / 1 / 0 /
    collapses / yes / 27
  - 99403: 118 / regional / 4 / 57 / 60 / 0.968 / 1 / 0 /
    collapses / no / 0
  - 99404: 76 / regional / 4 / — / 0 / — / 0 / 0 / never
    (never-3-seasoned) / no / 0
  - 99409: 111 / global / 4 / 57 / 56 / 1.000 / 0 / 0 /
    holds-to-death / no / 0
  - 99410: 107 / global / 4 / 57 / 51 / 1.000 / 0 / 0 /
    holds-to-death / no / 0
  - 99411: 146 / regional / 4 / 58 / 78 / 0.867 / 1 / 0 /
    collapses / no / 0
  - 99412: 64 / village / 4 / — / 0 / — / 0 / 0 / never
    (died-before-seasoning) / no / 0
  Baseline-collapsed seeds (the GO denominator): 99402, 99403,
  99411. Baseline wall numbers: wins 0/8; end-state scaleRank
  global 2/8, national 0/8, regional 5/8, village 1/8; wave-5
  unlocks 1/8, wave-5 faced 1/8, wave-4 faced 8/8; median
  survival 109 days, max 146 days.
- PRIMARY METRIC (per seed): the polity trajectory + hold-share
  + drop events with cause + recovery events + re-proposals,
  exactly as analyzed by the polityfrag analyzer, plus
  post-drop days lived alongside hold-share (polityfrag's
  metric-review revision, applied here as a REPORTED field,
  not as a judge), plus tend counts per link and tend weeks
  at low pantry (to prove the lever actually fired: tends
  attempted while pantry <= 20,000 kcal).
- GO THRESHOLD (binding): GO iff BOTH legs hold:
  (a) at least 2 of the 3 baseline-collapsed seeds (99402,
  99403, 99411) either hold to village death (trajectory
  holds-to-death, zero drops) or recover (diplomacy 0 → > 0
  after a drop, analyzer recovery event); AND
  (b) no more than 1 seed regresses a survival class vs the
  polityfrag baseline, where survival classes are bands on
  death day: A = survived to the 300d horizon, B = died
  150–299d, C = died 100–149d, D = died < 100d. Baseline
  bands: 99401 D (98), 99402 C (143), 99403 C (118),
  99404 D (76), 99409 C (111), 99410 C (107), 99411 C
  (146), 99412 D (64). A seed that dies in a lower band
  than its baseline band is one regression; a seed that
  survives to horizon is never a regression.
  Otherwise NO-GO. A miss is NO-GO, never re-scored against
  a friendlier metric mid-run. INSUFFICIENT-DATA only if > 2
  seeds carry instrument errors or record zero otherVillages
  at day 1.
- SECONDARY (reported, not judged): wall numbers every run —
  wins, national / table (scaleRank end-state; table not
  instrumented by this arm, stated not faked), wave 4–5
  unlocks (peak transitions) and facing (waveEngaged),
  median/max survival, death-cause shares, ready days.
  Arc reach: not instrumented (stated, not faked).
  LEAD vs BELONG shape reported per seed (99401's mixed
  polity never pays in baseline; tend-through tends only
  Haven-primary links, so a BELONG link is still never
  tended — that shape difference is reported, not fixed).
- SENSE-TEST (SENSE-TESTING LAW): sample say-lines /
  transcripts around drop and recovery days (cooling
  warnings, "realm came apart" lines, tend lines, tribute
  lines if captured); judge whether a held, collapsed, or
  recovered polity reads as a consequence of things
  villagers did, and flag anything robotic, static, or
  repeated.
- BALANCED PANEL (§15): before/after comparison on identical
  seeds (same 8 seeds, baseline cited above, candidate =
  tend-through). The panel instrument is the polityfrag
  analyzer over identical-seed per-seed JSONs; no
  balance-panel.js compare is fabricated — the per-seed
  before/after table IS the panel output for this
  trajectory metric, and any balance-panel.js refusal or
  field-shape mismatch is recorded honestly, not worked
  around by re-scoring.
- HARD LIMITS (binding, honored): no gate/price/deed change;
  no src/js change; no edit to leadcourt.js; no
  zombie-clearing mechanism (no re-proposal of a trust-0
  link, no arrears forgiveness, no debt call-in, no snap
  change); no propose/tend verb added or removed; no file
  owned by the sibling zombie arm touched; no Loop A
  tree/claim/branch touched; no push, no bump, no live
  verification, no merge to master (coordinator merges).

## Metric review (placeholder — completed in the evidence file)

- The evidence file carries the completed metric review:
  what the metric proved, what it missed, and any revision
  proposed for the NEXT run (never applied in-run).
