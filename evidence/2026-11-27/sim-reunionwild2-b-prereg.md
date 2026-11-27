# sim-reunionwild2-b — PREREG (frozen before any judged sim)

**Arm:** sim-reunionwild2-b · **Loop B run:** fleshout-loop-b-20261127T1930Z, arm 2 of 2
**Axis:** winnability-chain · **Answers:** the Reunionwild findings cluster —
sim-findings.md lines 2756–2759 (bloodcluster table, herald TB entry,
Eulogy absorb print, same-day succession deaths).
**Anchor:** `7f5bd3d14` (master at prereg time; branch sim-reunionwild2-b
fast-forwarded to it, 0 unique commits before this prereg).
**Substrate:** competent policy verbatim (`scripts/policies/competent`),
150d death-aware horizon, `scripts/sim-harness.js`. No src/js change
before the judged baseline leg.

## 0. Seed-band freshness (verified pre-prereg)

Seeds **111501–111508** (8). Grep across every `*.md` under `evidence/`
(including all `*prereg*.md`) for `11150[1-8]`: **zero hits** — the band
is unused. Coordinator's 2026-11-27 freshness check agrees; this grep is
the arm's own re-verification, recorded here.

## 1. The four items, in plain words

1. **HERALD NEVER ENTERS TB (primary DIAG).** On band 109310–109325,
   84/84 `startCombat` calls with mid `herald` were refused while a
   fight was live (`rebuilt=false`), 0 genuine TB starts, 0 wild
   deaths, 19 field contacts. Is the herald field-only by design
   (refused calls are noise) or is its TB entry broken (a whole
   monster never reaches the fight the deaths come from)?
2. **BLOODCLUSTER PER-SEED TABLE MISMATCH (evidence correction).**
   The published per-seed "W4 contacts" column in
   `evidence/2026-11-24/sim-bloodcluster-b.md` §5 does not reproduce
   from the raw per-seed JSONs on 10 of 16 seeds (e.g. 109312: table
   61 vs 56 field + 12 genuine TB = 68), though pooled totals
   reproduce exactly (300 contacts; door 167 / non-door 133).
3. **EULOGY ARMOR-ABSORB PRINT (narration fix).** Seed 109456 day
   116, a scholar dies to a Eulogy's narrated death and the trace
   prints "Armor absorbs 9735" on the same beat before "You go
   down." The doom bypasses armor but the absorb line still fires
   with a nonsense number.
4. **SAME-DAY SUCCESSION DEATHS (DIAG).** Seed 109460 day 144,
   Saengduean dies to two Reunions and Brian, succeeding her the
   same day, dies to an Editor the same day. Is the successor thrown
   into the predecessor's live fight, or did two separate fatal
   fights land on one day?

## 2. Code read before the prereg (grounds the bars, not judged)

- **Herald entry path.** `startCombat` refuses when a fight is live
  (game.js ~36043, NO SILENT CLOBBER rule, 2026-10-09: re-entering a
  live fight rebuilt fighters from stale scholar.health). The
  herald is an ordinary world monster otherwise: it wanders with a
  Haven-ward steer (game.js ~21082, build-herald-steer 2026-11-01)
  and enters TB through the same contact/bump calls as every other
  kind (`this.startCombat(m.id)`, game.js ~24871–25085 stance
  machine; "Face it" pending flow; debug scenario `w4herald`
  constructs the fight directly, so the fight itself is
  buildable). Nothing in `src/data/monsters.json` marks the herald
  field-only (`aggression: 'heraldic'`, wave 4, HP 700–900). The
  anomaly is the *pattern* of the calls: 84/84 refused, while
  other kinds get genuine starts — and herald is 84 of the 92
  refused w4+ starts band-wide. The fresh-band instrument records
  the live-fight context at each refused call to classify it.
- **Eulogy doom path.** `sigEulogyHook` (src/js/sigW4.js ~562):
  when verses hit 0 it narrates the ending, then — unless
  `maybeCheatDeath('p')` cheats — calls
  `game.tbDamage('p', 9999, 'the narrated ending', m.key,
  { quiet: true })`. `tbDamage` (game.js ~40548) runs the full
  armor block on that 9999: `absorb = min(final-1,
  round(final * r))` with `r = armorReduction(prot, pierce)`,
  prints `Armor absorbs ${absorb}.` whenever `absorb > 0`, and
  feeds `BA.onBlocked(absorb)` (Retribution). With heavy armor
  (r ≈ 0.97) that prints "Armor absorbs 9735" and still kills
  (9999 − 9735 = 264). The `{ quiet: true }` does NOT gate the
  absorb line. The 9999 is the only doom-scale `tbDamage` call in
  `src/js` (other 9999s are timestamps/spoilDay/z-index). The
  doom bypasses armor by design ("you die as narrated") but the
  engine still runs armor math on it — that is the defect's shape.
- **Succession corpus (already landed, read-only).** The wilddeath
  corpus file for seed 109460 already carries both day-144 scholar
  deaths as `playerDeaths` rows with distinct `tb.fightId`s
  (`fmgpspln9_3ko2kq`: Saengduean vs two Reunions, Brian alive as
  a villager fighter; `fmgpsplnu_85n94a`: Brian as scholar vs an
  Editor with a fresh party). The formal verdict goes through the
  analyzer in §5 (the fightId-distinctness test), not this read.

## 3. Fresh-band instrument (frozen)

New files (scripts only, zero src/js):
- `scripts/reunionwild2-b-driver-20261127.js` — RUN
  `reunionwild2-b`, `DAYS=150 SEEDS=111501,...,111508`, competent
  verbatim, out `evidence/2026-11-27/perseed-reunionwild2-b/`,
  refuses to overwrite. Same shape as the bloodcluster driver.
- `scripts/reunionwild2-b-instrument-20261127.js` — the
  bloodcluster-b instrument (`scripts/bloodcluster-b-instrument-20261124.js`)
  required VERBATIM as the base (fieldFight + startCombat wraps,
  tbKillCtx, daily snapshots, kill/death events), PLUS two
  additive, call-through, RNG-neutral annotations, frozen here:
  (a) **live-fight context on every tbStarts row** — captured
  BEFORE the wrapped `startCombat` runs: the live `tbfight`'s
  `fightId`, monster ids, and `over` flag (null when no fight is
  live); attached to the row the inner wrap pushes. This is the
  herald-refusal classifier.
  (b) **playerDeath wrap mirroring the wilddeath instrument**
  (`scripts/wilddeath-b-instrument-20261124.js` ~116–210) —
  one row per scholar death with `tb.fightId`, `monsterIds`,
  `monsterWaves`, `sayTail`, `victimName`, day. This is the
  succession classifier on the fresh band.
- `scripts/reunionwild2-b-analyze-20261127.js` — the four
  analyzers in one script (herald classification, bloodcluster
  recompute, succession classification, wall numbers).
- `scripts/test-reunionwild2-b.js` — proof: determinism (same
  inputs, same outputs twice) + spot-checks against the frozen
  numbers in §6 + the Eulogy repro (item 3, §4).

## 4. Per-item bars (frozen — a miss is NO-GO, never re-scored)

### Item 1 — Herald (DIAG)
- **Classification completeness:** every herald `tbStarts` row on
  the fresh band carries a class: GENUINE (`rebuilt !== false`)
  or REFUSED-WITH-LIVE-FIGHT (live `fightId` + monster ids) or
  REFUSED-WITH-NO-LIVE-FIGHT (live fight null/over — an
  instrument-or-engine anomaly, counted separately).
- **Retry outcome:** for every refused herald call, whether the
  same seed later records a herald contact of any channel
  (fieldFight row or genuine TB start) after the refusal day.
  A herald that never fights again on that seed while the band
  runs is named, not assumed gone.
- **Band audibility:** ≥ 20 herald `startCombat` calls observed
  band-wide. Fewer → the band is silent on the question:
  DIAG-NO-GO, targeted replay follows (not a verdict).
- **Decision table (frozen — the verdict is read off it):**
  - (a) ≥ 1 genuine herald TB start → **ENTRY WORKS** — refusals
    are arrived-during-a-fight noise; the herald is field-only
    by circumstance, not by defect. Report the genuine-start
    rate and the retry rate.
  - (b) 0 genuine + every refusal has a live fight AND every
    refused herald later fights (field or genuine TB) on the
    same seed → **NOISE** — the herald gets its fight
    eventually; the refused calls are the engine saying
    "finish this one first."
  - (c) 0 genuine + refusals with NO live fight, OR refusals
    with a live fight but the herald never fights again on
    that seed → **DEFECT NAMED** — TB entry is effectively
    unreachable for the herald; the next step is a fix or a
    Steve-call, decided under the overlap guard below.
  - (d) < 20 herald calls → **SILENT**, DIAG-NO-GO.
- **DIAG-GO** iff classification is complete, the audibility bar
  holds, and the verdict is read off the table above.
- **Fix condition (only under (c)):** build a fix ONLY if the
  defect is proven AND the fix is small AND in the TB-entry
  path AND it does not touch the win-plan/depart path (sibling
  arm 1's area — **OVERLAP GUARD: if the fix would touch that
  path, STOP and report instead of landing**). Fix GO bar:
  on the after-band (same seeds, §7), ≥ 1 genuine herald TB
  start, with no other kind's genuine-TB count degraded beyond
  noise (judged through the §15 panel, §7).

### Item 2 — Bloodcluster table (correction-verification)
- **Recompute definition (frozen):** per seed, W4 contacts =
  fieldFight rows with `wave >= 4` and `outcome !==
  'alreadyDead'` + genuine TB starts with `rebuilt !== false`
  and `wave >= 4`, from the v2 judged JSONs only
  (`evidence/2026-11-24/perseed-bloodcluster-b/*-v2.json`,
  16 files; the `-replay` file excluded). This is the S1
  definition from the reunionwild prereg §2, which reproduces
  the pooled 300.
- **Correction:** the §5 table in
  `evidence/2026-11-24/sim-bloodcluster-b.md` is corrected to
  the recomputed per-seed rows (evidence-only commit; the
  pooled totals and the rest of the evidence are untouched
  unless a recomputed column also disagrees — then the
  disagreement is reported, not silently fixed).
- **Bar: PASS** iff 16/16 rows are recomputed from the raw
  JSONs, the corrected table matches the recompute exactly,
  and the pooled totals still reproduce exactly (**300
  contacts; door 167 / non-door 133**). Any other column that
  fails to reproduce is listed as a further correction, not
  hidden.

### Item 3 — Eulogy absorb print (repro + fix)
- **Repro (frozen shape):** stage the real doom path through
  `sigEulogyHook` with verses exhausted, armored scholar
  (protection high enough that the pre-fix print fires), via
  the shared harness — no stubbed damage, no hand-built
  `tbDamage` call. Capture the `sayTail` of the doom beat.
- **Pre-fix expectation:** the repro FAILS (the absorb line is
  present in the tail, with a nonsense-scale number) — the
  repro must be run on the un-fixed code first and show the
  defect, or the fix proves nothing.
- **Fix (frozen shape):** thread a `bypassArmor` flag from the
  doom call in `sigEulogyHook` through `tbDamage`, skipping
  BOTH armor blocks (player + villager) including the
  `BA.onBlocked(absorb)` Retribution credit when set. No other
  caller sets the flag; `quiet` semantics are untouched (quiet
  callers with real armor keep their honest absorb lines).
  Small fix only — if the threading grows past the damage path,
  stop and report.
- **GO bar:** repro passes after the fix (no absorb line in the
  doom tail; scholar still dies to the narrated ending;
  `maybeCheatDeath` path intact — a cheating scholar survives
  with the cheat line, no absorb line either), `node
  scripts/check.js --quick` green, `node
  scripts/check-wired.js` for any new game-code function
  (none expected — flag threading only).

### Item 4 — Same-day succession deaths (DIAG)
- **Corpus test (frozen):** on the landed wilddeath JSON for
  seed 109460, the two day-144 `playerDeaths` rows: same
  `tb.fightId` → successor thrown into the predecessor's live
  fight; distinct `fightId`s → two separate fatal fights on
  one day (with the successor's fight party/monsters named).
- **Fresh-band watch:** count same-day double scholar deaths
  on 111501–111508 (two `playerDeaths` rows, same seed, same
  day) and classify each the same way. Zero occurrences is a
  reported null, not a verdict — the corpus test carries the
  verdict.
- **DIAG-GO** iff both day-144 deaths' linkage is determined
  from the corpus AND the verdict (same fight vs two fights)
  is stated with the fight contents named AND the next lever
  (if a defect) or the closing note (if two fights) is named.
  Fallback if the corpus rows lack linkage: targeted replay
  of seed 109460 (not a new judged band).

## 5. Wall numbers (reported every band)

Wins / national / table / wave-4 unlock / wave-5 unlock /
wave-5 faced / median survival (censored) for the fresh band
111501–111508, from the instrument's end-of-run state. The
bloodcluster band's wall numbers are the comparison anchor
(0 wins, 0 national, 0 table, w5 unlocked 4/16, faced 3/16,
median survival 150d censored).

## 6. Exploration spot-checks (NOT frozen outcomes — the analyzer must reproduce them from the files; any deviation is a finding)

- Bloodcluster per-seed recompute (frozen definition, §4 item 2):
  109312 is the sharpest published mismatch (table 61 vs 56
  field + 12 genuine TB = 68). Pooled: 300 (door 167 /
  non-door 133).
- Herald on the old band: 84 refused / 0 genuine / 19 field.
- Eulogy repro: pre-fix tail contains "Armor absorbs 9735"
  (seed 109456 day 116; the exact number on the repro seed may
  differ — the bar is presence of an absorb line on the doom
  beat, not the exact 9735).
- Succession: 109460 day 144, two `playerDeaths` rows, distinct
  fightIds (Saengduean vs reunion×2; Brian vs editor). If the
  analyzer finds the same fightId, the §2 read is wrong and
  that is the finding.

## 7. Before/after (§15)

- Item 3 (if the fix lands): the fresh band runs twice on
  identical seeds — baseline (current code) and after (fixed
  code) — compared through `scripts/balance-panel.js`. The fix
  is narration-only with zero mechanical change to any non-doom
  damage (the flag is set only by the doom call), so the
  expected panel outcome is **no movement** on the wall metrics
  and on doom-death counts; any movement is investigated, not
  waved through.
- Item 1 (only if a fix is built under (c)): same seeds,
  baseline vs after, through the panel; the fix GO bar in §4
  item 1 is the judge.
- Items 2 and 4 are evidence/DIAG work with no game change;
  no panel applies.

## 8. Deliverables

- This prereg (committed BEFORE any judged sim).
- `scripts/reunionwild2-b-driver-20261127.js`,
  `scripts/reunionwild2-b-instrument-20261127.js`,
  `scripts/reunionwild2-b-analyze-20261127.js`,
  `scripts/test-reunionwild2-b.js` (proof incl. Eulogy repro).
- Corpus `evidence/2026-11-27/perseed-reunionwild2-b/` (8 files,
  RUN `reunionwild2-b`).
- `evidence/2026-11-27/sim-reunionwild2-b.md` — one verdict per
  item, wall numbers, metric review, sense-test (2–3 death
  traces read as stories).
- Correction to `evidence/2026-11-24/sim-bloodcluster-b.md` §5
  (evidence-only commit).
- Commits: prereg first, then instrument/driver, then corpus,
  then analyzer/proof, then evidence (+ fix commit if item 1
  or 3 builds one). Telemetry deviation check (body step 10)
  on any before/after band; the wall numbers in §5 are the
  report for DIAG-only outcomes.
- Sim-findings lines 2756–2759 annotated as answered/fixed as
  the verdicts direct.

## 9. Metric review (placeholder — filled in the evidence; no in-run re-scoring)

- A miss on any frozen bar is NO-GO for that item, never
  re-scored against a friendlier metric mid-run.
- If a frozen metric proves wrong (e.g. the audibility bar, the
  recompute definition), it is written up under "metric review"
  in the evidence and proposed for the NEXT run.
