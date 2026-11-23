# sim-rearm-b — PREREG (frozen)

**Arm:** sim-rearm-b · **Loop B run:** fleshout-loop-b-20261123T1830Z
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2717
`[claimed]` — NO RE-ARM PATH EXISTS FOR SEARCASTERS
(sim-killbundle-b §5/§8)
**Type:** BUILD + JUDGE a lever (REARM_CELLS=1, env-gated, no default
flip) — the corpse-transfer re-arm path. Game-code change in this arm
(`src/js/corpses.js` + one endDay hook in `src/js/game.js`); the
instrument extends the killbundle driver/analyzer.
**Base:** worktree `~/workspace/worktrees/sim-rearm-b`, branch
`sim-rearm-b`, HEAD `dbe748d46`
**Frozen:** 2026-11-23 ~19:00 UTC, before any judged run. No judged run
has run.

## 1. The question (from the brief + killbundle-b §5)

Both staged holders who fired spent both cells in one volley and never
gained another cell by any route — no kill-loot cell drops to a holder,
no grants, no corpse takes by a holder. The gun is a two-shot weapon
for its whole life. The only second life observed is the scholar
taking a gun/cell from a holder's corpse (2 of 17 arrivals). Does a
corpse-transfer path — another villager taking the cells (and the gun)
from a dead holder's corpse — give the gun a second life?

## 2. Carried numbers (killbundle-b, NOT re-derived)

- Staged leg (16 forced armed arrivals, seeds 107533–107548): 2
  holders fired (Emma Larsen d51 wave-4 suburb 2 shots/1 hit/68 dmg;
  Caleb Jones d100 wave-5 spoiler 2 shots/2 hits/132 dmg); both died
  dry (d86, d115, the wild). The other 14 staged holders: 12 died
  holding their 2 cells (wild ×9, contest, dehydration, wound — see
  killbundle-b §3), 2 survived 150d holding cells. Per-arrival fire
  rate 2/16 = 12.5% (Wilson 3.5–36.0%); per-fight fire rate at wave
  4+: 2/2; below wave 4: 0/100 (CELLGATE).
- Matched leg (49 seeds): 1 natural arrival (Jorge Silva d19), 0
  volleys, died d92 in the wild with the gun still loaded on his
  unburied corpse. Scholar-path recovery: Elena Petrova's gun + 1
  cell (d78), a cell from Yuki Mori's corpse (d116) — **2 of 17
  arrivals**.
- Expected supply on a fresh 16-seed staged leg: ~12 staged holders
  die holding cells (killbundle-b observed 12/16); ~6 on an 8-seed
  pilot. Supply is fat by construction — the INCONCLUSIVE clause
  (§7) exists for a freak outcome, not an expected one.

## 3. Code read (grounding — done before designing anything)

- **Villagers never loot corpses at all today.** Grep over
  `src/js/*.js`: every corpse-take path (`corpseTakeItem`,
  `corpseLootAll`, `lootCorpse`, `_corpseTakeStack`) moves items into
  the *scholar's* pack, range-gated on the scholar's position, and is
  called only from app.js (player UI) and abilityActions.js (the
  scholar's loot ability). No villager code path touches a corpse.
  The design call's premise ("extend the existing scholar corpse-take
  to villagers") therefore means: build the first villager corpse-take,
  reusing the corpse's own death-pack shape — not wiring an existing
  villager path.
- **The corpse holds the gun + 1 cell, not 2.** `generatePossessions`
  (corpses.js) writes one `units:1` entry per gear id, so the staged
  holder's `{itemId:'fusion_cell', units:2}` stack collapses to 1 cell
  on the corpse — this is also why the scholar took only 1 cell where
  2 were carried (killbundle-b §7). A corpse take therefore moves at
  most **1 fusion cell** (plus the gun). A re-armed holder gets a
  1-shot volley at wave 4+. Fixing the collapse is a separate arm;
  this one measures the transfer with the supply the corpse actually
  holds. Stated here, not hidden.
- **The gun is re-seatable.** `person.items` holds the gun (bare
  `'searcaster'` string, as `villagerKillLoot` pushes it) and
  `autoEquip` seats it from items; `villagerGearUp(vid, false)` is
  the game's own re-equip path (fight-time safe, no RNG). The take
  calls it after moving a gun, so a second-life holder's gun is
  equipped and can volley.
- **Perception channels that exist in code:** `corpse.witnesses`
  (fight participants, via `fightWitnesses`, passed by the combat
  death branches in game.js ~40922) and `campPeopleIds('haven')`
  (living people physically at Haven). There is no per-villager
  wild-tile position to query — a wild corpse after the death moment
  is unreachable by any villager-side read. The design therefore has
  exactly two channels: death-time witness take + daily Haven sweep.
  Wild-corpses-after-death recovery (an expedition to the death site)
  is NOT in this arm; if witness takes are 0 with fat supply, that is
  the named next question, not a re-score.
- **Canon:** docs/CANON.md + the corpses.js header read. No canon doc
  covers re-arming or corpse transfer; the corpse system's own canon
  (death is knowledge, looting has weight, the village watches) is the
  grounding. The take is voiced (`say`, naming the dead) and teled
  (`rearm_take`); it carries no villager trauma ledger — villagers
  have none, and inventing one is out of scope. Recorded, not hidden.

## 4. Band freshness (local_seed_band_freshness skill)

- **Staged band: 107533–107548 (16 seeds) — REUSED BY DESIGN.** The
  same staged seeds as killbundle-b (its staged subset), used for
  BOTH legs (control + armed). No new band is introduced anywhere in
  this arm: the arrivals are staged, not sampled, so no fresh-band
  verification applies to the arrival supply — but the reuse itself
  was checked: grepped every dated prereg under `evidence/` for
  `107533` — hits in sim-killarrive-b-prereg.md (matched band
  107533–107581), sim-killbundle-b-prereg.md (staged subset
  107533–107548), sim-gatehorizon-b-prereg.md (known-held list),
  sim-muster-a-prereg.md and sim-planform-a-prereg.md (reservations
  naming the band). All name the killarrive/killbundle band; none
  reserves 107533–107548 against staged reuse. The reuse is the same
  kind killbundle-b made of the killarrive band, and is recorded here
  so the next worker does not re-grep it as fresh.
- Nearest reservations, none overlapping: Loop A holds 107501–107532
  (launchsilence-a); Loop B screened 107471–107494
  (gateavoid-doorrich-b); killrate-a used 107313–107320.

## 5. Instrument (frozen design)

- Driver `scripts/killlootbundle-driver-a.js` (extended, same file the
  killbundle arm extended): + `REARM_CELLS` flag (`rearmOn`,
  `rearmPresent` source check on corpses.js), + wrap of
  `villagerRearmFromCorpse` → `rearmTakeEvents` [{day, taker,
  corpseVid, corpseId, kind, gun, cells, channel}], + `cells` on the
  corpse rows of the daily gun census. STOP: REARM_CELLS=1 without
  the lever code present. No STOP requiring REARM (the control leg
  runs with it unset). RUN token `killlootbundle-a` UNCHANGED
  (analyzer hardcodes it); fresh OUTDIRs `perseed-rearm-b-ctl` and
  `perseed-rearm-b-arm`. Driver hardcodes
  `evidence/2026-11-21/<OUTDIR>` — corpora land under 2026-11-21
  although this arm's evidence is 2026-11-23; recorded, not moved.
- **Leg 1 — control (staged):** MODE=arm, KILLBUNDLE=1, STAGE_SEAR=1,
  REARM unset, seeds 107533–107548 (16), same substrate (§5). The
  lever code is present but inert: `_rearmCellsOn()` false on every
  call, zero draws, zero side effects.
- **Leg 2 — armed (staged):** identical + REARM_CELLS=1.
- **Substrate (both legs, identical to killbundle-b):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset;
  `PRESENCE` unset. Horizon 150d death-aware. Policy: competent
  (verbatim).
- **Analyzer** `scripts/analyze-killlootbundle-a.js` (extended):
  per-seed rearm fields (rearmEvents, rearmCellTakes,
  secondLifeTakes, rearmTakeDays incl. channel, secondLifeHolders,
  rearmVolleys, rearmVolleyDays, supplyDeaths, scholarTakes) +
  `judgeRearmCompare` + `--rearm-compare` CLI + selftest fixtures
  (31 checks). The old `--compare` (killbundle rule) is untouched.
- **Arm test (NEW):** `scripts/test-rearm-b.js` — frozen-band checks,
  sizing arithmetic, driver-export + presence checks, live proof
  (`--live`: staged holder dies with a witness → witness takes gun +
  1 cell, equips, fires 1 shot at wave 4; REARM-off control → no
  take, corpse keeps gun + cell; dry-holder / armed-holder / no-cell
  / scholar-exclusion guards), corpus validation modes (`--dir-ctl`
  16 control files, `--dir-arm` 16 armed files).
- **Panel builder (NEW):** `scripts/build-rearm-panels-b.js` (clone of
  build-killlootbundle-panels-a.js with rearm defaults: seeds
  107533–107548, before perseed-rearm-b-ctl, after
  perseed-rearm-b-arm, mode arm/arm — both legs are MODE=arm).
- **Parallelism:** 2 processes × 4 seeds (pilot, 8 seeds/leg), then
  2 processes × 4 seeds (confirm remainder, 8 seeds/leg), sequential
  within each process. If the run window ends mid-band, corpus +
  progress note are committed and the exact done-seed list reported
  (coordinator adopts; nothing faked or extrapolated).

## 6. Definitions (frozen — killbundle-b §6, extended explicitly)

- **Kill-loot searcaster arrival / armed arrival / bundled arrival /
  kill-loot volley / per-arrival fire rate:** as killbundle-b §6.
- **Re-arm (EXTENDED — this is the definition this arm judges):** a
  kill-loot holder gaining a `fusion_cell` AFTER their first volley
  (killbundle §6), **OR** a holder gaining a `fusion_cell` while
  holding a dry searcaster at any point — the take re-arms a gun
  that never fired, which is the common case since CELLGATE holds
  most volleys — **OR** a second villager becoming a holder via
  corpse take (gun + cells). The observable event is the same in all
  three: one `rearmTakeEvents` record. `kind: 'rearm'` = dry holder
  takes cells only; `kind: 'second-life'` = gun-less villager takes
  gun + cells.
- **Re-arm event:** one `rearmTakeEvents` record on a leg.
- **Second-life volley:** a `volleyEvents` record with
  `rwId === 'searcaster'`, `shots > 0`, and `vid` equal to a rearm
  taker of that seed, on/after that taker's take day (either kind —
  the taker is always a second villager holding cells taken from a
  corpse).
- **Supply death:** a staged (kill-loot) holder who died holding
  cells — computed from the corpus as: holder in `deaths` AND NOT
  (their last sear-volley on/before the death day left `ammoLeft`
  0 with no later re-arm take to them before death). Never-volleyed
  holders count. This is the re-arm opportunity count.
- **Scholar-path take (context only):** a `corpseTakeEvents` record
  with `itemId` in (`fusion_cell`, `searcaster`) whose `corpseVid`
  is a kill-loot holder. Killbundle-b measured 2 of 17 arrivals.

## 7. Frozen bars (judge: analyzer --rearm-compare + tier tally + panel + arm test)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — analyzer `--selftest` 31/31 + `test-rearm-b.js` pre-run + `--live` green, all re-run on this base; 0 instrument errors on all 16 ctl + 16 armed files; single anchor + policySha per corpus; `rearmPresent` true on every file; ctl files `rearmOn` false, armed files `rearmOn` true | all must hold |
| 2 | **Bundle intact** — every kill-loot searcaster arrival on BOTH legs carries exactly 2 cells (`klBundled == klArrivals`, `klDry == 0`, per leg) | must hold for GO |
| 3 | **Primary, re-arm events** — armed-leg `rearmEvents ≥ 1` | ≥ 1 for GO |
| 4 | **Primary, second-life volley** — armed-leg `rearmVolleys ≥ 1` (a rearm taker firing the gun on/after the take day) | ≥ 1 for GO |
| 5 | **Control clean** — ctl-leg `rearmEvents == 0` (REARM unset ⇒ zero takes; a take on control means the env gate is broken) | must hold for GO |
| 6 | **Supply** — armed-leg `supplyDeaths ≥ 1` (a staged holder died holding cells) | ≥ 1, else INCONCLUSIVE |
| 7 | **Guardrails** (analyzer `--rearm-compare` ctl vs armed) — starvation-death delta ≤ +2, median-survival delta ≥ −20 | must hold for GO |
| 8 | **Balanced panel (§15)** — panels built ctl vs armed (16 staged seeds) via `scripts/build-rearm-panels-b.js`; `node scripts/balance-panel.js compare` completes; decision `review_required`; every metric status ∈ {descriptive, no_material_signal, not_observed, insufficient} (no regression signal) | must hold for GO |
| 9 | **Scholar-path context + sense-test delivered** — scholar takes of gun/cells on the control leg recorded (compare with killbundle-b 2/17), tier-4 rates per leg reported (tally script; not a bar — both legs are staged, so the forced searcaster inflates both equally), and one re-arm story read as a village story (does the village notice the gun changing hands, is it voiced honestly) | must be delivered |

**Verdict rule (frozen):** GO = bars 1, 2, 5, 7, 8 pass AND bar 3
passes AND bar 4 passes. NO-GO = bar 6 passes (supply ≥ 1) AND
(bar 3 fails OR bar 4 fails) OR any of bars 1, 2, 5, 7, 8 fails.
INCONCLUSIVE = bar 6 fails (supply 0) AND bars 1, 2, 5, 7, 8 pass
(a thin supply can't be re-scored as a miss or a pass after the
fact). A miss is NO-GO, never re-scored against a friendlier metric
mid-run (§14).
**Base-rate note (frozen in advance):** the staged per-arrival fire
rate is 12.5%, so if the armed leg yields N takes, P(≥1
second-life volley) ≈ 1 − 0.875^N — about 55% at N≈6. The bar is
strict by design (proof-of-effect: the observable effect is a
second villager holding corpse-taken cells *and firing*). A
takes>0 / volleys=0 confirm is NO-GO with the take rate as the
delivered finding and the next question (volley frequency — the same
CELLGATE wall) named, not a re-score.
**Pilot continue rule (frozen):** pilot = 8 staged seeds per leg
(107533–107540). Continue to confirm iff the instrument is valid on
the 8+8 files AND armed-pilot `supplyDeaths ≥ 1` AND armed-pilot
`rearmEvents ≥ 1` (the take is visible). If supply ≥ 1 but
rearmEvents 0 → NO-GO at pilot: the mechanism did not fire where it
should have — kill the arm, no confirm spend. If supply 0 →
INCONCLUSIVE-thin: stop, diagnose the supply. The pilot does NOT
require a volley; the volley bar is judged on the full 16.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/analyze-killlootbundle-a.js
  --selftest` → 31/31; `node scripts/test-killbundle-b.js` → green
  (re-run on this base, instrument lineage intact);
  `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14;
  `node scripts/test-rearm-b.js` → pre-run checks green;
  `node scripts/test-rearm-b.js --live` → live proof green (take +
  equip + wave-4 volley on new code; no take on REARM-off control) —
  all re-run on base `dbe748d46`.
- **Pilot (judged):** 8 staged seeds per leg, 107533–107540 (control
  first, then armed; 2 processes × 4 seeds each). Instrument check
  (anchor, policySha, 0 errors, rearmOn flags, stageSearOn) + pilot
  continue rule (§7) before any confirm spend.
- **Confirm (judged):** remaining 8 staged seeds per leg,
  107541–107548.
- **Analysis (judged):** analyzer `--dir` per leg;
  `--rearm-compare` ctl vs armed; tier tally per leg; panel build +
  compare; per-seed staged table in the evidence file (columns:
  seed, staged arrival day/holder, cells, holder death with cells?,
  corpse-take events by whom, second-life holders, second-life
  volleys, shots/hits/dmg) for both legs.
- **Wall numbers** recorded: wins, national, table (not instrumented
  by this driver — recorded as not instrumented, never faked), wave
  4–5 unlocks, median/max survival.
- **Sense-test:** read the census/volley/take records for the first
  re-arm(s) as a village story; the driver records no dialogue text,
  so the sense-test judges from equip/carry/fight behavior, the
  engine's own say lines (visible in the live test, not the corpus),
  and the take/volley records — said plainly, not faked.
- **Canon:** docs/CANON.md + corpses.js header read (§3); no canon
  doc covers corpse-transfer re-arm — said here rather than inventing
  canon.

## 9. Infra notes

- **Metric review** (to be filled in the evidence file).
- The prereg + game-code change + driver/analyzer/test/panel
  changes commit AFTER the pre-flight re-run on base `dbe748d46`
  and BEFORE any judged seed runs. The judged corpora will carry
  the prereg-commit anchor (recorded in the evidence file); the
  ctl-vs-armed comparison is unaffected because both legs run on
  that one anchor.
- **Panel exit code:** `balance-panel.js compare` exits 2 when its
  decision is `review_required` (the tool's own convention: exit 0
  only on `no_material_signal`). The compare completing and writing
  the panel files is the pass condition, not the exit code. Recorded
  so the next reader doesn't misread it (same as killbundle-b §9).
