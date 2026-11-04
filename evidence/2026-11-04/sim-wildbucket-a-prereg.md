# sim-wildbucket-a — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T2230Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-wildbucket-a. Axis: food-economy.
Arm: WILDBUCKET — decompose the death-cause bucket "the wild"
(findings item from sim-exphurt-24-a, out-of-scope finding 3:
41.0% of 283 deaths on band 99933–99956 bucketed as "the wild",
not a cause; future death-share reporting should split it before
citing shares). The coordinator owns the findings backlog file;
this arm does not touch it, nor any hidden_files file, nor any
sibling worktree, nor the main tree.
No game-code change in this arm: MEASUREMENT ONLY. If a game-code
change is needed to record a missing field, that is OUT of scope
— documented as the named next blank, never changed mid-run.
No [needs-eyes] commit: nothing player-facing changes.

## CONTEXT (carried forward, not re-litigated)

- The bucket is the registerDeath cause string 'the wild' as
  recorded by the exphurt-24-a sweep's registerDeath wrapper
  (283 deaths, 116 'the wild', 58 monster, 28 starvation,
  20 sickness, 14 'a wound that wouldn't close', rest smaller).
  This arm re-measures it on fresh seeds with a RICHER death
  record (context snapshot at death time), it does not re-judge
  the exphurt-24-a numbers.
- Code-read producers of 'the wild' for person-kind deaths
  (to be confirmed or refuted empirically, never assumed):
  (a) ledger.js playerDeath default `cause || 'the wild'` when
  called with no cause; (b) game.js tbFightDeathCause: a
  proven wild turn-based fight (≥1 monster fighter, no hostile
  fighter, no arena/betrayal/table/coalition flag) reads
  'the wild' and is passed to playerDeath from tbEnd('lost').
  No bare playerDeath() caller was found in src/; every other
  named playerDeath caller passes a named cause ('contest',
  'the arena', 'the hunt', 'the expedition', or the hurt cause).
  The empirical question is which producer(s) actually fire
  and what finer-grained fields the engine already records at
  that moment (tbfight fighters, hurt history, away record,
  corpse monsterId) — the analyzer may use ONLY those.
- Canon read first: docs/CANON.md; MONSTER-WAVES.md (wave law,
  monster roster) and DISEASES.md (disease pools) skimmed for
  death-cause conventions. No canon doc covers death-cause
  attribution — that still holds; the mechanism is code-read,
  not invented canon.

## GUARDRAILS (unchanged)

- No gate, price, deed bar, or win-price change in this arm.
- No game-code change at all: no death-mechanic change, no
  cause-string change, no RNG-draw change.
- The analyzer assigns a specific proximate cause ONLY when a
  recorded field or a quoted transcript line supports it.
  Every other bucketed death stays residual, with its reason
  recorded. No invented causes, ever.

## INSTRUMENT (new, this arm)

- NEW scripts/sweep-wildbucket-a.js: same harness/policy/runDays
  pattern and same env gates as scripts/sweep-exphurt-24-a.js
  (read that script, do not guess): competent policy, 100d
  death-aware cap, PLENTYDEPRI=1, DEPOSITGATE=1, post-hurthome
  guard (Game.shouldHurtReturn must exist). It refuses any
  seed list other than the pre-registered band for its stage
  (pilot band, then confirm band — two refusal modes in one
  script, selected by STAGE env). Corpus directories:
  evidence/2026-11-04/perseed-wildbucket-a-pilot/ and
  evidence/2026-11-04/perseed-wildbucket-a-confirm/.
- Per death (registerDeath wrapper, BEFORE the original runs),
  the sweep records a rich death record: day, part, who
  (villagerId), name, kind, cause as passed, player flag
  (opts.player), killerId, monsterId/monsterName (opts),
  live-tbfight snapshot (fighters: kind/monsterId/name, or
  null when no live fight), away record for the dead
  (purpose, duration, or null), departed flag, tile type,
  last hurt for that villager (cause, dmg, day, part, or null),
  sick record (name/diagnosed, or null), village health, and
  a bounded transcript window (last 15 Game.say lines before
  the death, truncated). It also wraps hurtVillager to keep
  the last-hurt history and Game.say for the window.
- NEW scripts/analyze-wildbucket-a.js: classifies each
  cause=='the wild' death record by the rules below, and
  reports the split table (counts + shares) plus the residual
  with reasons, for the pilot band and (if run) the confirm
  band, and for the pooled judged set. Classification is a
  pure function over the recorded fields (lib-style, exported
  for the proof test).
- NEW scripts/test-wildbucket-a.js: proof for this arm —
  sweep seed-list refusal (accepts exactly the pilot band in
  pilot mode and exactly the confirm band in confirm mode,
  refuses any other list), and the analyzer's classification
  rules on fixtures (one fixture per rule branch, including
  the residual branches). Must be green BEFORE the judged
  sims.

## DESIGN (pinned)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (comparability with the
  exphurt-24-a band that produced the bucket; dead villages
  stop simulating). Death-aware, never a fixed horizon
  extended to chase deaths: the cap is the same 100d the
  bucket was observed under, so the split is comparable.
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit).
- Seeds: pilot band 99957–99964 (8 seeds, fresh — no
  evidence/ filename carries a seed in 99957–99980, checked
  before this prereg commit). Confirm band 99965–99980
  (16 seeds, fresh, same check). No other seeds, no staging,
  no expansion, no horizon extension, no seed re-picking.
  If the pilot sniff test fails, the run ends — it does not
  shop for seeds.
- Pilot sniff test (NOT a verdict gate): the pilot yields a
  usable bucket sample iff it records >= 5 cause=='the wild'
  deaths. Fewer → INSUFFICIENT-DATA (bucket too thin on this
  band to split), confirm not run.
- Gate on instrument health for the judged set: every seed
  in the run band completes, instrument errors 0, every
  death record carries day/who/cause (no malformed records).
  A seed that fails to complete invalidates its band.

## PRE-REGISTERED CLASSIFICATION RULES (judged exactly, §14)

Unit: one registerDeath record with cause exactly 'the wild'.
Rules apply in priority order; the first matching rule wins.
A rule fires only on the field it names — no inference across
rules, no transcript-guessing beyond a quoted line.

1. TB-MONSTER (certain): live tbfight snapshot at death has
   >= 1 fighter with kind 'monster' and no fighter with kind
   'hostile' → specific cause "monster kill, turn-based wild
   fight" (+ monster name when a monster fighter carries a
   monsterId/name). Traces to the tbfight snapshot.
2. CORPSE-MONSTER (certain): no rule-1 match, but the death
   record's own monsterId/monsterName is non-null →
   specific cause "monster kill (monsterId on record)".
   Traces to the opts field.
3. LAST-HURT-MONSTER (probable): no rule-1/2 match, but the
   last hurt for the dead has cause 'monster' on the SAME day
   as the death → specific cause "monster kill, probable
   (last hurt monster, same day)". Reported as probable, and
   the certain-only share is reported alongside the primary.
4. RESIDUAL (unassigned): no rule matches → residual, with
   the reason recorded: one of "no tbfight, no monsterId, no
   same-day monster hurt" / "tbfight present but no monster
   fighter" / "last hurt non-monster or older than same day"
   (the analyzer records the actual fields, the report quotes
   the reason counts). Residual is NEVER folded into a cause.

Non-'the wild' deaths are counted for the comparability
share (wild share of all deaths) but are NOT classified by
these rules and never enter the primary denominator.

## PRE-REGISTERED METRICS (judged exactly against this header, §14)

- PRIMARY: among 'the wild'-bucket deaths in the judged set
  (pilot alone if confirm not run; pooled pilot+confirm if
  confirm runs — the pooled set is the judged set, stated
  here in advance, not chosen after seeing numbers), the
  share assigned a specific proximate cause by rules 1–3.
- SECONDARY (reported with the primary, never substituted):
  certain-only share (rules 1–2); largest single residual
  reason share; wild share of all deaths; per-rule counts.
- SENSE: 1–2 death transcript lines from the bucket quoted
  and judged for meaning (does the game tell the player or
  the village anything meaningful about how that person
  died?), or a stated absence if the window is empty.
- Instrument health: seeds complete, errors 0, malformed
  death records 0 across the judged set.

## PRE-REGISTERED JUDGMENT

- GO threshold: primary share >= 0.80 AND no single residual
  reason above 0.10 of the bucket.
- Verdict rules, exhaustive:
  - Pilot bucket < 5 wild deaths → INSUFFICIENT-DATA (bucket
    too thin; confirm not run; verdict is neither GO nor
    NO-GO, not a kill of the decomposition idea).
  - Judged set meets GO threshold → GO (the bucket splits;
    future death-share reporting must use the split, and the
    analyzer + rules land as the reporting instrument).
  - Judged set primary < 0.80, or any single residual reason
    > 0.10 → NO-GO (the bucket does not split on records the
    engine actually writes; the evidence names the largest
    residual reason and the field that would be needed).
  - If the engine's telemetry genuinely cannot split it
    (primary < 0.80 AND the residual analysis shows a named
    field absent from EVERY residual record — e.g. no
    tbfight snapshot, no monsterId, no hurt history on any
    residual death) → DIAG verdict instead of NO-GO, naming
    exactly which field is missing, proven by the residual
    records (the analyzer prints the absent-field census),
    not asserted. DIAG and NO-GO are distinct: DIAG requires
    the absent-field census; a merely low primary without it
    is NO-GO.
  - If instrument health fails (a seed incomplete, errors
    > 0, or malformed records > 0): verdict
    INSUFFICIENT-DATA (instrument failure), reported loudly,
    not scored.
- A miss is never re-scored against a friendlier metric
  mid-run. The certain-only share, the probable share, and
  the residual reasons are comparability detail; none
  substitutes for the primary. If a rule proves wrong, it
  goes under "metric review" for the NEXT run.
- §15 BALANCED PANEL — DECLARED INAPPLICABLE here, in
  advance: scripts/balance-panel.js measures scale/cohort
  metrics, not death-record text; it cannot ingest death
  records. No panel compare file is attached, deliberately.
  The applicable before/after comparison (matched-seed
  re-run) belongs to a future arm that changes reporting,
  which this measurement-only arm does not become.

## WHAT LANDS, WHAT DOES NOT

- LANDS (coordinator merges; worker does not push, bump, or
  verify live): this prereg; the sweep + analyzer + proof
  test; the pilot corpus (and confirm corpus if run); the
  evidence file.
- DOES NOT LAND: no game-code change; no cause-string change;
  no gate/price/deed change; no sibling files; no
  hidden_files files.
