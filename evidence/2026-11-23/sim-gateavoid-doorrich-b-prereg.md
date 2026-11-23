# sim-gateavoid-doorrich-b — FROZEN prereg (Loop B run fleshout-loop-b-20261123T0230Z)

**Frozen:** 2026-11-23 ~09:05 UTC, BEFORE any judged sim (screen, probe, or
leg). Base master `80e7da0bc` (full
`80e7da0bcf29d0b5017384ead04cbad652114c5c`, "journey-establishment r271:
SLEEP-RETRY works (29/29), desync re-shaped to daily-phase roll,
SILENT-ARRIVAL re-read"). Branch `sim-gateavoid-doorrich-b`, worktree
`~/workspace/worktrees/sim-gateavoid-doorrich-b`. Run
`fleshout-loop-b-20261123T0230Z`, arm `sim-gateavoid-doorrich-b` (the
door-richer re-judge of the leader-projection gate — the 0030Z round
record's named next step after the gateavoid NO-GO).

## The question (0030Z round record, next step after sim-gateavoid-b)

sim-gateavoid-b proved the instrument (durable gate-avoid log, D6 passes;
the armed leg's 'proj' avoid on the only pool door is attributed from the
log — zero surviving notes for it) but D1 (bad-outcome rate drop >= 20pp)
is mathematically unpassable on band 107391–107398: the control pool
collapsed to a single door that was already GOOD (vKill). D2–D6 all PASS;
M5 PASS. The verdict was NO-GO kind METRIC-BROKEN — the band's fault, not
the lever's. This arm re-judges the SAME gate on a door-richer band: a
band whose CONTROL probe shows >= 4 pool doors with >= 2 bad, so D1 can
bind. The gate itself stays env-gated OFF; NO default flip. Zero `src/`
changes in this arm — the instrument is already on master (merged
a8ff84fd8); this arm reuses it verbatim.

## The mechanism (carried from the gateavoid-b prereg, verified on this base)

Door parties form at the door-open decision in `src/js/villager-agency.js`
`expeditionMonster`. Three gates sit there, in order, after the `_pinDoor`
computation and before `fieldFight`: HPGATE (whole party, any member <
25 HP → 'hold'), LEADERHPGATE (leader < 25 HP → 'lead', subsumed),
LEADERPROJ (leader projected ≤ 25 HP after two rounds at 25/round, i.e.
leader HP ≤ 75 → 'proj'). Each fire appends one record to the durable
`st.gateAvoids` log (`{ day, vid, mid, kind, name, hp, projHp2, note }`)
and the driver stamps it verbatim on the corpus file as `gateAvoidLog`.
The analyzer attributes avoided doors from the LOG (seed + day + monster).

## THE D1 RULE — carried VERBATIM from the gateavoid-b / leaderproj preregs

The pool is the CONTROL leg's fought doors whose leader entered ≤ 75 HP
(projHp2 ≤ 25); the armed leg is scored on the SAME door (same seed + day
+ monster). GOOD: the projection gate avoided it (a 'proj' log entry on
the same seed + day + monster), the armed party killed the monster, or
the monster fled. BAD: the armed party fled or died, the door diverged
away with no log entry, or ANOTHER gate ('hold'/'lead') avoided it.
D1 GO: armed bad rate ≤ control bad rate − 20pp, where the control bad
rate is the vFlee+vDie share of its own pool. The pool must be non-empty;
an empty control pool is UNMEASURABLE and FAILS. The day-window matching
proposal is NOT adopted here: D1 stays on the frozen same-day rule, and
divergence stays BAD by design.

## Screen rule — FROZEN (the pilot gate for this arm)

Screen fresh 8-seed bands with the gateavoid probe (control config, same
driver + env as the judged control leg). A band QUALIFIES iff its CONTROL
probe shows **>= 4 pool doors with >= 2 bad** (pool = control fought doors
whose leader entered ≤ 75 HP; bad = vFlee+vDie share of that pool, as the
analyzer reports `projPool` / `projPoolBad`). Take the FIRST qualifying
band. Screen AT MOST 3 bands; if none qualifies, report DIAG-NO-GO on
supply and STOP (do not burn more bands). Screen bands in order:
107471–107478, then 107479–107486, then 107487–107494. The qualifying
band's probe IS the pilot gate: the judged control leg re-runs the same 8
seeds under the same config and MUST reproduce the probe's door table
(tripwire — see below); no separate 12–16-seed confirm spend unless D1
passes and a confirm band is pre-registered (then screened fresh the same
way — a next-run decision, not frozen here).

**Why >= 4 pool / >= 2 bad:** on the gateavoid band the pool was 1 door /
0 bad, so D1 was unpassable before the armed leg ran. A 4-door pool with
>= 2 bad gives the armed leg a real reduction to make (2 bad → 0 bad is a
50pp drop, passing the −20pp bar; 2 bad → 1 bad is 25pp, also passing),
while a 4-door pool keeps D2/D3 from being single-door noise quite as
badly as the 2-door band was. The threshold is a supply floor, not a
verdict — D1 is still judged on the frozen −20pp rule against the
qualifying band's own control bad rate.

## Seed-band freshness — CHECKED before freeze (local_seed_band_freshness skill)

- Searched `evidence/*/sim-*-prereg.md` (git grep, committed files) for
  107471–107499: ZERO hits.
- Searched `evidence/*/*.md` (git grep, committed files) for 10747x /
  1075xx: hits ONLY for 107501–107508 (journey-endgame-r270 prereg +
  evidence — the known-avoid band named in the brief).
- Searched `evidence/*/*.md` for 107455–107469: ZERO hits in evidence —
  but Loop A's LIVE claim
  (`hidden_files/lever-claims/fleshout-20261123T0815Z.json`, read
  2026-11-23 ~09:00 UTC) assigns **107455–107470** to
  sim-homebody-metric-a (fresh 16-seed band). Screen bands start at
  107471, immediately above it — NO overlap, NO dip below 107471.
- Known used — avoided, per the brief: 107501–107508, 108001–108008,
  and every band named in Nov 22–23 evidence (107415–107422,
  107423–107430, 107431–107438, 107439–107446, 107447–107454). None of
  the three screen bands (107471–107478, 107479–107486, 107487–107494)
  appears in any of those.
- Screen bands are therefore FRESH at freeze time. If a screen band is
  found named elsewhere after the run starts, the freshness skill's
  correction rule applies (correction commit naming the missed source).

## Design — paired pilot on the qualifying band

- **Control leg:** substrate + `DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`.
- **Armed leg:** control flags + `LEADERPROJ=1`, nothing else. Same
  seeds, same policy, same horizon. The only difference between the legs
  is the projection gate.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1
  HPGATE=1`.
  (SUBSTRATE NOTE — read this before judging the brief against this
  file: the arm brief lists the substrate without PINQUAD/DMGPIN. They
  are carried here because the gateavoid-b bars this arm judges under
  REQUIRE them: D5 demands `pinquadFlag` '1' AND `dmgpinFlag` '1' on
  every corpus file, and the pin-quad door formation + damage pin are
  the door mechanics the probe screens. Dropping them would fail D5 by
  construction and change the doors under test. Coordinator may overrule;
  until then this file is the frozen substrate.)
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at freeze
  time (sha256sum in the worktree). IDENTICAL to the gateavoid band.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail max).
- **Legs chunked at 4 seeds per call** (a 16-seed single call was
  SIGTERMed before; per-seed files persist across kills; resume, never
  re-run completed seeds. The driver refuses to overwrite, exit 3).
- **Driver env:** `EVIDENCE_DATE=2026-11-23
  CORPUS_PREFIX=gateavoid-doorrich-b RUN=gateavoid-doorrich-b
  OUTDIR=perseed-gateavoid-doorrich-b-probe` (screens) /
  `perseed-gateavoid-doorrich-b-control` /
  `perseed-gateavoid-doorrich-b-armed` (+ `LEADERPROJ=1` armed only).
  Corpus files
  `gateavoid-doorrich-b-s<seed>-gateavoid-doorrich-b-pinquaddoor.json`.
- **Probe determinism tripwire:** the judged control leg re-runs the
  qualifying band's seeds under the same config on the same base and
  MUST reproduce the probe's door table. If the judged control differs
  from the probe, STOP and investigate (the code moved under the run);
  do not judge the armed leg against a drifted control. The tripwire
  is the probe table on THIS base, stated in the evidence file before
  the legs run.
- **Master movement:** if master moves after the legs start, this arm
  does NOT rebase mid-run — the anchor is frozen at `80e7da0bc` and the
  legs judge on it; the coordinator merges afterward.

## Frozen bars (a miss is NO-GO, never re-scored)

The panel census of wave-4+ encounters (`v4encounters` rows) on both
legs, through the gateavoid analyzer (`scripts/analyze-gateavoid-b.js`,
reused verbatim from master), plus a node one-liner over the raw corpora
for the door table (the dmgpin method).

**GO requires ALL of:**

- (M1) **Port gate:** `test-allyslot3-b.js` 18/18 on this tree.
- (M2) **Staged pin proof** (`scripts/test-pinquaddoor-b.js`): 35/35.
- (M2w) **Wide-instrument proof** (`scripts/test-pinquaddoor-wide-b.js`
  + analyzer selftest): 16/16.
- (M3) **Damage proof** (`scripts/test-dmgpin-b.js`): 29/29.
- (M3d) **Staying proof** (`scripts/test-doorflee2-b.js`): 49/49.
- (M3e) **Downedtwice regression** (`scripts/test-downedtwice-b.js`):
  exit 0, **25/25**.
- (M3f) **Floor proof** (`scripts/test-hypofloor-b.js`): 48/48.
- (M3g) **Whole-party gate proof** (`scripts/test-hpgate-b.js`): 43/43.
- (M3h) **Leader-gate proof** (`scripts/test-leaderhpgate-b.js`): 50/50.
- (M3i) **Projection-gate proof** (`scripts/test-leaderproj-b.js`):
  55/55.
- (M3j) **Durable-log proof** (`scripts/test-gateavoid-b.js`): 36/36.
- (M3k) **Screen-rule proof** (`scripts/test-gateavoid-screen-b.js`,
  NEW): the screen qualification rule (>= 4 pool doors with >= 2 bad)
  proved on fixtures — the gateavoid-b probe corpus (pool 1, bad 0)
  does NOT qualify; a synthetic 4-pool / 2-bad fixture DOES qualify;
  a 4-pool / 1-bad fixture does NOT; a 3-pool / 2-bad fixture does
  NOT. Target count recorded at build (see "Instrument").
- (M4) **Panel bars** (control vs armed +LEADERPROJ, same seeds, same
  policy):
  - (D1) **Bad-outcome rate on the matched projection pool, PRIMARY
    (VERBATIM):** armed bad rate ≤ control bad rate − 20pp, control
    bad rate = vFlee+vDie share of its own pool. Empty control pool
    is UNMEASURABLE and FAILS.
  - (D2) **Kill rate per FOUGHT door:** armed vKill rate per fought
    door ≥ control rate − 2pp.
  - (D3) **Damage guard:** armed TOTAL damage per door/fight ≥ 0.9×
    control.
  - (D4) **Mechanism engagement:** armed `leaderprojFires` ≥ 1.
  - (D5) **Substrate sanity (+ the log):** every control corpus file
    carries `leaderprojFlag` null AND `leaderhpgateFlag` null AND
    `hpgateFlag` '1' AND `hypofloorFlag` '1' AND `doorflee2Flag` '1'
    AND `dmgpinFlag` '1' AND `pinquadFlag` '1'; every armed file
    carries `leaderprojFlag` '1' AND `leaderhpgateFlag` null AND
    `hpgateFlag` '1' AND `hypofloorFlag` '1' AND `doorflee2Flag` '1'
    AND `dmgpinFlag` '1' AND `pinquadFlag` '1'; every corpus file
    carries `leaderprojFires` as a number AND `hpgateFires` as a
    number AND `leaderhpgateFires` as a number AND `gateAvoidNotes`
    as an array AND `gateAvoidLog` as an array AND `anchorCommit`
    equal to the frozen base (§"Anchor rule") and `policySha`
    `1884c8852d38`.
  - (D6) **Durability:** per leg, `gateAvoidLog` length equals the
    total gate fires AND the per-kind log counts equal the per-kind
    counters, with no entry of unknown kind.
  - **SUPPLY rule (frozen):** if the CONTROL leg yields ZERO fought
    doors, D2/D3 are unmeasurable and the verdict is NO-GO kind
    SUPPLY-THIN, not a lever failure.
- (M5) **Guardrail — no regression:** the balanced-panel compare
  returns `review_required` with NO `regression_signal` on village
  deaths / deaths-per-100d. **AND the scalemetric deciding cost bar:**
  GO requires starvation ≤ control+2 on totals AND arm-only deaths
  AND median survival ≥ 0.8× control median; death counts diagnostic
  only. A breach of either half is NO-GO.
- (M6) **Deliverable:** evidence file with the frozen-bar table, the
  screen table (each screened band + its probe pool/bad counts +
  qualify/reject), the door-fight table (every fought door, both legs),
  the matched-pool table (every control pool door with its armed
  outcome), wall numbers, a sense-test transcript read (at least one
  avoided/fought door quoted — if a gate avoid happens, quote the
  avoided meeting's persisted log entry and the nearest fought door),
  the diag table (§1 of the doorflee evidence), the balanced-panel
  compare output attached, and a metric-review section; corpora under
  `evidence/2026-11-23/perseed-gateavoid-doorrich-b-probe-<band>/` and
  `...-control/` and `...-armed/`.

A miss on any of M1–M5 is NO-GO, never re-scored against a friendlier
metric. If the metric proves wrong, write it under "metric review" and
propose the revision for the NEXT run. A NO-GO is classified per §14a
(CONCEPT-DEAD / METRIC-BROKEN / SUBSTRATE-MISSING) in the evidence
file's verdict section.

## Secondary (REPORTED, not binding — do not re-score the primaries)

- (S1) Hold census: `doorHold` rounds per leg, fights with a hold,
  `everHopeless` fights per leg.
- (S2) **Conversion census:** matched-seed door pairs (same seed + day
  + monster): control vFlee → armed vKill (conversion), control vFlee
  → armed vFlee at a later round (later-flee), control vFlee → armed
  identical (no-change), control door with NO armed counterpart
  (avoided — reported with its S9 attribution).
- (S3) Leader-death census: `vDie` doors per leg + the leader HP at
  death.
- (S4) Pin-subset B1 rate (wave-4+ and all-waves, fought subset) —
  RATE ONLY, no ≥3-row floor.
- (S5) Door-fight table: every fought door — seed, day, monster,
  rounds, dealt, derived entry HP, outcome, D/round, fleeHpFrac,
  doorHold rounds, party HP at flee time, leader entry HP,
  projection band.
- (S6) Wall numbers: wins / national (by scaleRank ≥ 2 AND by
  standing ≥ 200) / table, wave 4–5 unlocks, median survival,
  deaths, villages lost, starvation — control vs armed.
- (S7) Sub-floor census: fought doors where the LEADER entered below
  25 HP, both legs + fought doors where ANY party member entered below
  25 HP as read from the gate-avoid log.
- (S8) Gate-fire census: `hpgateFires` + `leaderhpgateFires` +
  `leaderprojFires` summed per leg, plus the gate-avoid notes AND the
  durable log; the log-vs-notes gap (log entries minus surviving
  notes) reported as the measured size of the old blind channel.
- (S8c) The armed leg's 'proj' log entries: each one quoted with its
  forecast (leader HP, projHp2).
- (S9) Avoided-doors census: control doors with no armed counterpart
  row, ATTRIBUTED via the armed leg's durable log: 'proj' / 'lead' /
  'hold' / 'divergence'.
- (S10) Leader-projection census: per fought door, the leader's
  projection band (dead1 / dead2 / collapse2 / safe) and projected HP
  after one/two rounds; per fired door (log entry), the fired member's
  projection and whether the fired door's leader was projected-dead.
- (S11) D1fought (reported secondary): flee rate on fought
  projection-pool doors per leg.
- (S12) Per-seed village-fate secondary (gateavoid-b metric review):
  for each avoided pool door, the seed's village fate on each leg
  (survived / lost + day) — the open question whether avoiding a
  winnable door costs the village more than it saves the leader.
- (S13) Fires-per-pool-door secondary: armed `leaderprojFires` per
  control pool door (D4's single-fire bar is thin; this says how
  often the gate actually met the pool).

## Base + substrate (verified, not assumed)

- Base: master `80e7da0bc` at arm start. The worktree HEAD at freeze
  IS the frozen base; the anchor stamped on every corpus file is
  `80e7da0bc` (full `80e7da0bcf29d0b5017384ead04cbad652114c5c`). This
  base is LATER than the gateavoid base `0b3993e80` — the intervening
  master commits are the gateavoid landing (a8ff84fd8), the
  launchfield-horizon landing (86e5bd38e), and journey-establishment
  r271 (80e7da0bc). The probe + judged legs both run on this base, so
  the comparison is self-consistent; the tripwire guards the
  probe→legs step.
- The substrate (PINQUAD + DMGPIN + DOORFLEE2 + HYPOFLOOR + HPGATE +
  LEADERPROJ) is ON this base: the LEADERPROJ lever and the GATEAVOID
  log are both in the tree (landed a8ff84fd8). NO port from any held
  branch was needed; the held branches are NOT merged, NOT modified,
  NOT rebased.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at freeze
  time.

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at load
  time. The FROZEN BASE is master `80e7da0bc` (full
  `80e7da0bcf29d0b5017384ead04cbad652114c5c`). **Nothing is committed
  before the judged legs run** — the prereg, the screen test, and the
  proof runs all happen with HEAD still at the frozen base, so the
  stamped anchor IS the frozen base. The final commit happens only
  AFTER the legs + evidence are written.
- The evidence verifies `anchorCommit` on EVERY corpus file against
  the frozen base; a mismatch voids that leg.
- **If anything is committed before the judged legs, the legs must be
  re-run after a dated prereg CORRECTION** — never amend the expected
  anchor post-hoc.

## Instrument (reused verbatim from master + one NEW screen test)

- Driver: `scripts/pinquaddoor-driver-b.js` — on master already
  (gateavoid arm's version, incl. the `gateAvoidLog` stamp). No edits.
- Analyzer: `scripts/analyze-gateavoid-b.js` — on master already,
  reused verbatim. Selftest target 39/39.
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3),
  `scripts/test-doorflee2-b.js` (M3d),
  `scripts/test-downedtwice-b.js` (M3e),
  `scripts/test-hypofloor-b.js` (M3f),
  `scripts/test-hpgate-b.js` (M3g),
  `scripts/test-leaderhpgate-b.js` (M3h),
  `scripts/test-leaderproj-b.js` (M3i) — on master already, run
  verbatim;
  `scripts/test-gateavoid-b.js` (M3j) — on master already, run
  verbatim.
- **NEW:** `scripts/test-gateavoid-screen-b.js` (M3k) — proves the
  screen rule on fixtures: reads a corpus dir (or a minimal fixture
  shaped like the analyzer's per-file summary) and reports
  `projPool` / `projPoolBad` / qualifies. Fixtures: the gateavoid-b
  probe corpus (pool 1, bad 0 → NOT qualified) + synthetic fixtures
  (4-pool/2-bad → qualifies; 4-pool/1-bad → not; 3-pool/2-bad →
  not). The test asserts the rule, not the data: a control
  mis-implementation that qualified the 1-door pool would fail.
  Old-code-fails control: the rule with the pool threshold dropped
  to >= 1 would qualify the gateavoid-b probe corpus — the test
  asserts it does NOT qualify, so the dropped-threshold variant
  fails.
- Panel: `scripts/build-pinquaddoor-b-panels.js` — on master already,
  run verbatim as
  `RUN=gateavoid-doorrich-b CORPUS_PREFIX=gateavoid-doorrich-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-23/gateavoid-doorrich-b-panel --before
  evidence/2026-11-23/perseed-gateavoid-doorrich-b-control --after
  evidence/2026-11-23/perseed-gateavoid-doorrich-b-armed --seeds
  <qualifying band> --before-seeds <same>` +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file.

## Proofs (to run after freezing, before judged legs, on this tree)

- M1 `test-allyslot3-b.js` **18/18** (target).
- M2 `test-pinquaddoor-b.js` **35/35** (target).
- M2w `test-pinquaddoor-wide-b.js` **16/16** (target).
- M3 `test-dmgpin-b.js` **29/29** (target).
- M3d `test-doorflee2-b.js` **49/49** (target).
- M3e `test-downedtwice-b.js` **exit 0, 25/25** (target).
- M3f `test-hypofloor-b.js` **48/48** (target).
- M3g `test-hpgate-b.js` **43/43** (target).
- M3h `test-leaderhpgate-b.js` **50/50** (target).
- M3i `test-leaderproj-b.js` **55/55** (target).
- M3j `test-gateavoid-b.js` **36/36** (target).
- M3k `test-gateavoid-screen-b.js` **(target count recorded at build)**.
- Analyzer selftest `analyze-gateavoid-b.js --selftest` (target:
  39/39 green).
- NOTE: a `test-gateavoid-b.js` run was started ~08:56Z as a rehearsal
  BEFORE this prereg file was written (the instrument check on the new
  base). It is NOT the judged M3j — the judged M3j is the post-freeze
  re-run recorded in the evidence file.

## Expectation (not a bar)

The first screen band (107471–107478) qualifies or it does not — the
screen decides, not the expectation. If a band qualifies, the pilot is
expected to GO on D1 if the durable log attributes the pool doors the
gate refused, with D2/D3 passing on the remaining fought doors and D4
≥ 1 and D6 complete. If the armed leg's `leaderprojFires` is 0, STOP:
the gate's condition never met a door on this band, and the verdict
must be re-derived from the mechanism, not from the frozen
expectation. If the control leg yields 0 fought doors, the verdict is
NO-GO kind SUPPLY-THIN per the frozen rule.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-23/gateavoid-doorrich-b-legs.log`
  (one JSON line per seed + EXIT lines; screen runs tee to
  `evidence/2026-11-23/gateavoid-doorrich-b-screen.log`).
- Evidence: `evidence/2026-11-23/sim-gateavoid-doorrich-b.md` (verdict,
  frozen-bar table, screen table, door-fight table, matched-pool table,
  wall numbers, sense-test transcript read, metric review) +
  `gateavoid-doorrich-b-panel.md` + panel JSONs + analysis JSON
  (analyzer --json over both corpus dirs).
- `check.js --quick`: attempted once after any src change, but
  SERIALIZED — pgrep for any running check.js first and wait until
  none is running; never run two concurrently. (This arm makes zero
  src changes, so no check.js run is owed; the proof tests are plain
  node, not jest, so they run without adding a jest process.)
- Write flap: intermittent EPERM on fresh-file writes is active this
  week (last window Nov 23 ~05:45–07:27Z, ~102 min). Probes run before
  writes that matter; a blocked final commit leaves files on disk
  intact for coordinator adoption, never forced. Never remove an
  index.lock on a ps grep alone.
- Git slowness: index-touching git commands can run minutes under
  hot-tree load. Prefer commit-to-commit reads (`git show` /
  `git diff <commit> <commit>`) and `git grep`, which stay fast.
- VM replacement: if a process dies or the machine restarts under this
  run, re-establish state from disk and report it — do not redo
  finished work silently.

## Metric review (adopted from gateavoid-b §"Metric review" — this run is judged as frozen)

- **D1 is carried verbatim; only the band changes.** The door-richer
  band is the fix the gateavoid-b metric review named for the
  unpassable D1. The screen rule (>= 4 pool / >= 2 bad) is the supply
  floor that makes D1 bindable; it is frozen here, not tuned after
  seeing a screen.
- **Divergence stays BAD by design** — the day-window matching
  proposal does NOT return in this run; if divergence still decides
  D1, it returns in this arm's metric review for the NEXT run.
- **D2/D3 on a thin band are noise, not signal** (leaderproj metric
  review, confirmed twice). A 4-door pool is still thin — do not
  over-read D2/D3 here; D1 + D4 + D6 + S2/S9 carry the verdict.
- **D4's bar (≥ 1 fire) is still weak as written** — S13 (fires per
  pool door) is the new secondary that says how thin the evidence is.
- **The 107394 d120 loss** (armed village lost 7 days after the avoid;
  control survived) is carried as S12: every avoided pool door gets a
  per-seed village-fate line on both legs.
- **If NO screen band qualifies**, the verdict is DIAG-NO-GO on
  supply, not a lever verdict — the question (does the projection gate
  reduce bad outcomes on a door-rich band?) stays open for a different
  supply strategy (e.g. a wider screen, or a band chosen from the
  leaderproj probe's richer history), and the metric review must say
  so plainly instead of re-scoring D1 on a thin band.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (damage
  35–95, HP 850–1500, "a 4-6 round fight"; no canon doc prices a
  morale read, a hypothetical-HP floor, a commitment hold, or an HP
  gate — the gate is a sim lever, judged door by door; the log is an
  instrument on the same gates).
- `evidence/2026-11-23/sim-gateavoid-b.md` (the NO-GO kind
  METRIC-BROKEN, the 1-door 0%-bad pool, the D6 instrument proof, the
  d120 loss) + its frozen prereg (D1–D6 carried verbatim here).
- `evidence/2026-11-23/sim-winnability-round-0030.md` (the adoption
  record; the named next step is this arm).
- `evidence/2026-11-22/sim-leaderproj-b.md` + its frozen prereg (the
  original D1 rule, the 8-fires / 1-note diag, the d113 sense test —
  the forecast was right about the leader).
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, §14a kill taxonomy, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md` —
  screen bands verified fresh above; Loop A's live claim read for
  its band assignment (107455–107470).
- The scalemetric deciding cost bar (convergence-tracker.md):
  starvation ≤ control+2 (totals AND arm-only) AND median ≥ 0.8×
  control median.

## Files

- Prereg: `evidence/2026-11-23/sim-gateavoid-doorrich-b-prereg.md`
  (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js`,
  `scripts/analyze-gateavoid-b.js`,
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-doorflee2-b.js`, `scripts/test-downedtwice-b.js`,
  `scripts/test-hypofloor-b.js`, `scripts/test-hpgate-b.js`,
  `scripts/test-leaderhpgate-b.js`, `scripts/test-leaderproj-b.js`,
  `scripts/test-gateavoid-b.js` (all on master already),
  `scripts/test-gateavoid-screen-b.js` (M3k, NEW),
  `scripts/build-pinquaddoor-b-panels.js`
- Screen corpora (control config, per screened band):
  `evidence/2026-11-23/perseed-gateavoid-doorrich-b-screen-107471/`
  (+ `-107479/`, `-107487/` only if screened)
- Corpora (fresh, judged, on the qualifying band):
  `evidence/2026-11-23/perseed-gateavoid-doorrich-b-control/`
  (8 files) + `evidence/2026-11-23/perseed-gateavoid-doorrich-b-armed/`
  (8 files). NOTE: the qualifying band's screen corpus IS the control
  probe, not the judged control leg — the judged control leg re-runs
  the same seeds fresh (tripwire) and writes its own corpus dir.
- Analysis: `evidence/2026-11-23/gateavoid-doorrich-b-analysis.json`
  (analyzer --json over both corpus dirs) + screen analysis JSONs per
  screened band (`gateavoid-doorrich-b-screen-107471-analysis.json`,
  etc.)
- Panel: `evidence/2026-11-23/gateavoid-doorrich-b-panel.md` + panel
  JSONs
- Evidence: `evidence/2026-11-23/sim-gateavoid-doorrich-b.md`
- Legs log: `evidence/2026-11-23/gateavoid-doorrich-b-legs.log`
- Screen log: `evidence/2026-11-23/gateavoid-doorrich-b-screen.log`
- `src/` diff: NONE. No default flip.
