# sim-gunholder-census-b — PREREG (frozen)

**Arm:** sim-gunholder-census-b · **Loop B run:** fleshout-loop-b-20261124T0630Z
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2725 `[open]`
— TAKERS DON'T FIGHT (sim-rearm-witness-b, run
fleshout-loop-b-20261124T0230Z, verdict NO-GO, merged 32168a66f,
evidence/2026-11-24/sim-rearm-witness-b.md §11)
**Type:** DIAGNOSTIC census — no game-code change, no lever, no
before/after. A neutral recorder + analyzer on the rearm substrate.
**Base:** worktree `~/workspace/worktrees/sim-gunholder-b`, branch
`sim-gunholder-b`, HEAD `60f6e7436` at run start (current master at
adoption; verified clean before any work).
**Frozen:** 2026-11-24 ~07:10 UTC, before any judged run. No judged
run has run.

## 1. The question (from the brief + rearm-witness-b §11)

The wild-corpse expedition witness channel converts every wild
gun-corpse it meets (2/2 takes, second-life, gun + 2 cells) — but
both takers never fired: Ella Johnson (seed 107737, took d73, held
a loaded gun 77 days, 0 volleys) and Wanjiru Kamau (seed 107741,
took d97, 33 days loaded, 0 volleys). The re-arm path is no longer
the binding constraint on the gun chain. The sim-findings entry
names the next step: "a census of what gun-holders actually do
with a loaded gun — fights faced by wave, pick/role, and fire
decisions — before any new re-arm lever." This census answers it.

## 2. Carried numbers (rearm-witness-b §11, NOT re-derived)

- Ella Johnson, s107737 arm: expedition take d73 (gun + 2 cells,
  from Sam Wilson's corpse). Census rows d74–d150: **77
  equipped-loaded holder-days**, 0 searcaster volleys, 0 fights
  as lead with any ranged weapon (absent from volleyEvents
  entirely). Died never; village survived 150d, wave 5, standing
  430.
- Wanjiru Kamau, s107741 arm: expedition take d97 (gun + 2 cells,
  from Diana Osei's corpse). Census rows d98–d124: **27
  equipped-loaded holder-days**; take-to-death span 33 days (died
  d130 sickness). 0 searcaster volleys. She DID lead 2 searcaster
  fights post-take — d102 wave-2 giant mosquito, d106 wave-1
  sunbasker — both shots 0, ammoLeft 2: CELLGATE holds (wave < 4,
  cells > 0). Before the take she was a working bow fighter
  (volleys d6–d95, bow then apex bow, up to 105 dmg in a fight).
  Her gun left her hands d124 (scholar equipped a searcaster
  that day); her corpse at d130 still held a gun + 2 cells — a
  custody puzzle the new instrument must be able to retrace, not
  guess at.
- Sam Wilson, s107737 arm (the staged arrival): led **24
  searcaster fights**, all shots 0, all waves 1–3 (CELLGATE
  holds), died d73 holding 2 cells — the corpse Ella took.
- Rearm-b base rates: per-arrival fire rate 12.5% (2/16 staged
  holders fired); per-fight fire rate at wave 4+: 2/2; below
  wave 4: 0/100 (CELLGATE).
- The two takers alone supplied 77 + 27 = **104 census
  holder-days on 8 seeds**; staged arrivals hold for weeks each.
  The pilot floor (§7 bar 3) is set at 60 — about 60% of the
  takers-only count, deliberately low so a thin pilot reads as a
  supply failure, not a census.

## 3. Code read (grounding — done before designing anything)

- **The volley fires only for the LEAD fighter.**
  `fieldFight(vid, mdef, m, opts)` (fieldFights.js) computes the
  opening volley from `vp = getPerson(vid)` — the lead's equipped
  ranged weapon. Allies (opts.allies / allyVids, rec.allyVid /
  ally2Vid / ally3Vid) join in-round as melee combatants; no ally
  ever gets a volley. A gun-holder who is picked as an ally can
  never fire by construction. This is the first structural
  suspect, and the census must count ally-days separately.
- **The lead is picked, not chosen.** Wild tick
  (`villagerMonsterTick`, game.js): a monster on a tile with
  villagers picks a RANDOM villager on that node
  (`npcIds[Math.floor(Math.random()*npcIds.length)]`) →
  `resolveWildMonsterEncounter(vid, m)` → `fieldFight` with
  allies sensed live (`villagerFightAllies`: co-tasked or
  co-located, trust-ordered, cap 2). Expedition leg
  (villager-agency.js): the expedition LEADER is the lead, allies
  from the same sense. Raid / aid / contest / sortie routes call
  `fieldFight` directly with their own leads. The census wraps
  `fieldFight` (every route) AND `resolveWildMonsterEncounter`
  (wild picks + candidate list), so pick/role is observed, not
  inferred.
- **CELLGATE holds fire below wave 4** (fieldFights.js, env-gated
  CELLGATE=1, floor 4 by default): a searcaster lead facing wave
  < 4 with cells > 0 gets `rec.volley = { shots: 0, ... }` and
  the hold line. The hold needs cells to save — a cell-less gun
  says "no fusion cells" instead. The census reads the reason off
  the fight record (wave, cells at fight start, volley), not off
  the narration.
- **Evade precedes the volley.** The awareness check
  (fieldFights.js ~line 905–935) can return outcome 'evade'
  before the volley block runs; an evading lead never reaches a
  fire decision. 'alreadyDead' returns earlier still. Both are
  their own holder-day classes (§6).
- **Gun custody is traceable without game code.** The
  killlootbundle driver's `gunLocationsOf` census (daily: every
  searcaster by location — equipped / carried / stashed /
  scholar / stash / corpse — with cells for equipped guns) plus
  its grant / kill-loot / rearm-take / corpse-take event wraps
  already reconstruct who held which gun each day. This arm
  reuses those wraps verbatim and adds the fight + encounter
  wraps. **Zero src/js changes** — the census is a driver-side
  recorder only. (If a hook ever proves necessary, it would be a
  neutral env-gated recorder, default OFF, proof-tested; none is
  expected.)
- **Canon:** docs/CANON.md + docs/MONSTER-WAVES.md read (§§ wave
  4/5 gates, readiness bars, "monster encounters are fought,
  not rolled"). No canon doc covers gun-holder behavior or the
  searcaster's fire discipline — said here rather than inventing
  canon. The CELLGATE hold is a measured lever (sim-cellgate-a),
  not canon.

## 4. Band freshness (local_seed_band_freshness skill)

- **Pilot band: 107750–107757 (8 seeds) — FRESH.**
  Searched `grep -rhoE "107[0-9]{3}" evidence/*/sim-*-prereg.md`
  (all dates): highest named seed is 107749 (the rearm-witness
  staged band 107734–107749; its pilot 107734–107741 is the
  judged band this census must NOT reuse). Searched
  `evidence/*/sim-*.md` + `sim-*.json` for `10775[0-9]`: no
  hits (one false hit is a decimal delta in a panel JSON, not a
  seed). Searched the convergence tracker for `1077*`: only the
  10758–10773 bands appear. The live Loop B claim
  (`fleshout-loop-b-20261124T0630Z.json`) names this arm and no
  seed band; the live Loop A claim (scale-onramp, 0615Z) names no
  seed band. No collision anywhere: 107750–107757 is named
  nowhere.
- The two known takes (seeds 107737 / 107741) are used as
  FIXTURE / REPRO cases only (analyzer `--fixture` against the
  existing witness corpora), never as judged pilot seeds.

## 5. Instrument (frozen design)

- Driver `scripts/gunholder-census-driver-b.js` (NEW; reuses
  `scripts/killlootbundle-driver-a.js` exports — `gunLocationsOf`,
  `rangedKitOf`, `countItemIn`, `cellCountIn`, `stageFirstKillLoot`,
  `snapshotGunCells`, `diffGunCells` — reuse, don't rebuild).
  Single leg, MODE=arm, RUN=gunholder-census-b. Wraps (pure reads
  + driver-local writes; every game function runs exactly once,
  untouched):
  - `fieldFight` — EVERY call (not just volley ones): day, lead
    vid, opts.allyVids, mdef wave/id, outcome, rec.volley (may
    be null), pre-call lead ranged kit (rwId + ammo count),
    rec.allyVid/ally2Vid/ally3Vid (who actually joined),
    rec.intent, rounds, vTaken, calledHelp.
  - `resolveWildMonsterEncounter` — pre-call candidates =
    `npcsOnNode(m.tx, m.ty)` filtered to roster; post: picked
    vid, monster wave/id, avoided flag, raid flag. (The
    fieldFight wrap fires inside it too; the two records link by
    day + vid + mid.)
  - `villagerRearmFromCorpse`, `alienLootGrant`,
    `villagerKillLoot` (with STAGE_SEAR staging), `_corpseTakeStack`,
    `registerDeath` — copied from the killlootbundle driver with
    attribution (grant / take / supply-corpse rows).
  - Daily census in the policy.daily wrapper: `gunLocationsOf`
    per day (v4gunLoc rows, as before) + `packCellsByVid` for
    vids holding a searcaster anywhere (cells a non-equipped
    holder still carries — needed for the carried-loaded side
    table and custody retracing).
  - STOP checks (exit 2, loud): MODE=arm; REARM_CELLS=1,
    KILLBUNDLE=1, STAGE_SEAR=1, GUNRATE=1, CELLGATE=1,
    VETREENGAGE=1, PARTYSIZE4=1, FLEEREPAIR2=1, FIGHTALLY2=1,
    SENSEEXPED=1, BOWOPEN=1, SPEARGATE=1; LEND unset, PRESENCE
    unset; REARM / CELLGATE / KILLBUNDLE lever code present;
    SEEDS required; refuse to overwrite an existing per-seed file.
  - OUTDIR `evidence/2026-11-24/perseed-gunholder-census-b/`,
    files `gunholder-census-b-s<seed>-gunholder-census-b-arm.json`.
- Analyzer `scripts/analyze-gunholder-census-b.js` (NEW):
  `analyzeSeed` → per-seed holder census (holders, acquisition
  source, holder-days by class, fights led/allied by wave,
  custody chain, fate); `analyzeLeg` → leg totals; `judgeLeg`
  → the frozen bars; `--selftest` (synthetic fixtures incl. all
  nine classes + precedence + fixture numbers); `--fixture
  <file> <vid>` (reproduce a known holder's holder-days +
  searcaster volleys from an OLD killlootbundle-format file:
  Ella 77 / 0, Wanjiru 27 / 0 — old files lack fightEvents, so
  the fixture mode verifies counts only, never classification).
- Arm test `scripts/test-gunholder-census-b.js` (NEW): frozen-band
  checks, driver-export + presence checks, `--live` proof on the
  harness (T1 lead wave-4 fires → `fired`; T2 lead wave-2 holds
  → `led-cellgate-hold`; T3 holder as ally → `ally-no-fire`;
  T4 holder with no fight in a day → `no-fight`; T5 holder as
  wild-node candidate, another picked → `not-picked`; T6 lead
  evades → `led-evaded`; T7 gun with 0 cells leads wave-4 →
  `led-no-cells`; T8 fixture check Ella 77/0 + Wanjiru 27/0),
  `--dir-arm` corpus validation (8 files, mode arm, all substrate
  flags on, one shared anchor, policySha matches competent.js,
  0 instrument errors, 8 staged arrivals bundled).
- **Parallelism:** ONE process, 8 seeds sequential (the driver
  loops seeds in-process). No parallel drivers — the box
  OOM-killed 16 concurrent drivers on 2026-11-24 ~04:22Z.

## 6. Definitions (frozen)

- **Loaded gun:** a searcaster equipped in the ranged slot with
  fusion cells > 0 in the holder's items. Carried-but-unequipped
  guns and cell-less guns are NOT loaded (they cannot fire); they
  are counted in the side tables, never in the primary
  denominator.
- **Equipped-loaded holder-day:** one daily-census row in which a
  living villager (never the scholar — scholar holder-days are a
  side table) shows `loc: 'equipped'`, vid, cells > 0. The
  denominator. (Census rows run once per scholar-day; the
  witness band missed 1 of 133 days — a day with no row simply
  contributes no holder-day. Recorded, not patched.)
- **Holder-day classes — exactly one per holder-day, precedence
  frozen (fired wins; else the FIRST led fight of the day
  decides among led-*; else ally; else not-picked; else
  no-fight):**
  1. `fired` — holder was lead in ≥1 fight that day with volley
     shots > 0.
  2. `led-cellgate-hold` — first led fight: wave < CELLGATE_FLOOR
     (4), cells > 0 at fight start, volley shots 0.
  3. `led-no-cells` — first led fight: gun equipped, 0 cells at
     fight start, volley shots 0.
  4. `led-evaded` — first led fight outcome 'evade' (volley
     never reached).
  5. `led-already-dead` — first led fight outcome 'alreadyDead'.
  6. `led-other` — first led fight, volley 0, none of 2–5 (any
     occurrence is listed fight-by-fight in the evidence; a
     wave-4+ fight with cells > 0 and shots 0 here is a defect
     signal, not a rounding error).
  7. `ally-no-fire` — holder was a joined ally
     (rec.allyVid/ally2Vid/ally3Vid) in ≥1 fight that day, never
     lead. (Allies never get a volley by construction.)
  8. `not-picked` — holder was a candidate in ≥1 encounter that
     day (wild-node candidate list, or a fight's allyVids) where
     someone else was lead, and holder was neither lead nor
     joined ally in any fight that day.
  9. `no-fight` — none of the above: held a loaded gun all day
     and no fight touched them.
- **Fights faced by wave:** per holder, counts of fights LED by
  monster wave and fights ALLIED by monster wave (from
  fightEvents; a fight counts for every wave it was).
- **Acquisition source (per holder):** staged (kill-loot
  searcaster arrival), contest-prize, rearm-take (channel),
  other-grant (alienLootGrant caller), unknown (first seen in a
  census row with no event — flagged, never guessed).
- **Holder fate (per holder, end of seed):** still-holding
  (equipped + loaded at last census row), dry (equipped, 0
  cells), gun-lost (no searcaster anywhere), dead (day + cause),
  gun-on-corpse (corpse loc with their vid). A dead holder's
  gun-on-corpse is still supply — the census says so, the next
  arm decides what to do with it.
- **Custody chain:** per gun, the day-by-day sequence of
  (holder, location) from census rows + acquisition / take /
  grant events. A move with no event behind it is reported as
  `unexplained` (as in Wanjiru d124) — never invented.

## 7. Frozen bars (judge: analyzer --dir + test --dir-arm + --live)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — analyzer `--selftest` green + `test-gunholder-census-b.js` pre-run + `--live` green, all on this base; 0 instrument errors on all 8 pilot files; single anchor + policySha per corpus; `rearmPresent` true on every file; `rearmOn` true; 8 staged arrivals bundled (`klBundled == klArrivals`, `klDry == 0`) | all must hold |
| 2 | **Classification completeness** — every equipped-loaded holder-day classified into exactly one of the nine classes; 0 unclassified; class counts sum to total holder-days (analyzer asserts the sum per seed) | must hold for COMPLETE |
| 3 | **Supply floor** — equipped-loaded holder-days ≥ 60 across the 8-seed pilot | ≥ 60, else INCONCLUSIVE-by-supply |
| 4 | **Sense-test delivered** — the two known takes' traces read end to end from the witness corpora (Ella s107737, Wanjiru s107741) AND at least two new holder traces from the pilot band read end to end (take/acquisition → every fight → fate, in plain words) | must be delivered |
| 5 | **Wall numbers recorded** — wins / national / table (table not instrumented by this driver — recorded as not instrumented, never faked) / wave-5 unlocks + wave-5 faced (measurable: fightEvents carry wave) / median survival | must be recorded |
| 6 | **No game-code change** — zero src/js diffs in this arm (neutral recorder only); if a hook proved necessary it is env-gated, default OFF, proof-tested — and this bar records which case held | must hold as stated |

**Verdict rule (frozen, DIAGNOSTIC vocabulary — there is no
lever to GO/NO-GO):** COMPLETE = bars 1, 2, 4, 5, 6 pass AND bar
3 passes. INCONCLUSIVE-by-supply = bar 3 fails with bars 1, 2
pass (the pilot could not supply enough holder-days to classify;
the verdict is thin supply, not a kill). INCOMPLETE = bar 1 or
bar 2 fails (the instrument or the classification is broken; fix
the instrument, do not publish a census). The census finding
itself is the distribution: the dominant class(es) name the next
lever — ≥50% `no-fight` means encounter supply binds; a
`led-cellgate-hold` plurality means the CELLGATE floor binds;
`not-picked` plurality means pick logic binds; `ally-no-fire`
plurality means the lead-only volley binds. That reading is the
deliverable; it is not a re-score of any bar.

**Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
before/after change exists to compare.** No panel is built, no
compare is run; stated here explicitly so the absence is a
design fact, not an omission. (Same standing as any DIAG arm:
the panel is the instrument for before/after comparisons, and
there is no after.)

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/analyze-gunholder-census-b.js --selftest` → green;
  `node scripts/test-gunholder-census-b.js` → green; `node
  scripts/test-gunholder-census-b.js --live` → green;
  lineage: `node scripts/analyze-killlootbundle-a.js --selftest`
  → green (reused driver helpers intact); `node
  scripts/test-rearm-witness-b.js --live` → green (substrate
  channels still behave on this base).
- **Pilot (judged):** 8 seeds 107750–107757, single leg MODE=arm,
  substrate §5, horizon 150d death-aware, competent verbatim,
  ONE process sequential. Instrument check (anchor, policySha,
  0 errors, flags, staged arrivals) before judging.
- **Analysis (judged):** analyzer `--dir` on the corpus;
  test `--dir-arm` corpus validation; census table + per-holder
  detail in the evidence file; sense-test traces (Ella,
  Wanjiru, + 2 new holders); wall numbers; custody chains for
  every gun with an unexplained move.
- **Metric review** (to be filled in the evidence file; §14 — no
  in-run re-scoring: a miss is judged as written, and any metric
  that proves wrong is proposed for the NEXT run, never swapped
  here).
- **Sim-findings:** mark line 2725 `claimed` on this commit;
  mark `fixed` only if the census lands with its finding
  delivered (the census IS the next step the entry asked for).

## 9. Infra notes

- The prereg commits BEFORE any judged run (this commit: prereg
  + findings-claimed only; instrument commits after, before the
  pilot). The pilot corpus will carry the prereg-commit anchor.
- The pilot runs on one process sequentially — the 2026-11-24
  ~04:22Z OOM kill (16 concurrent drivers) is the reason; do not
  "speed it up" with parallel legs.
- If the run window ends mid-band, corpus + progress note are
  committed and the exact done-seed list reported (coordinator
  adopts; nothing faked or extrapolated).
- `days` vs `gameDays`: the analyzer judges survival on
  `gameDays` (same field rearm-b / rearm-witness-b used); the raw
  per-seed `days` field can read up to 8 days higher. Recorded
  so the next reader doesn't misread it.
