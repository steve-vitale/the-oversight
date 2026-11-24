# sim-rearm-witness-b — PREREG (frozen)

**Arm:** sim-rearm-witness-b · **Loop B run:** fleshout-loop-b-20261124T0230Z
(ADOPTION of the dead run fleshout-loop-b-20261123T2322Z)
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2717
`[fixed]` — NO RE-ARM PATH EXISTS FOR SEARCASTERS, open thread #1:
witness channel 0/4 takes; 9/13 supply deaths with no take
(sim-rearm-b §10)
**Type:** BUILD + JUDGE a lever (REARM_CELLS=1, env-gated, no default
flip) — the wild-corpse expedition witness channel for the
corpse-transfer re-arm path. Game-code change in this arm
(`src/js/corpses.js` + one hook each in `src/js/villager-agency.js`
and `src/js/villager-objectives.js`); the instrument extends the
killbundle driver/analyzer.
**Base:** worktree `~/workspace/worktrees/sim-rearm-witness-b`, branch
`sim-rearm-witness-b`, HEAD `f5d2c3caa` at adoption, brought to
current master `7344d8a56` before any judged run (manual ff — see
§9: three restarts killed the `git merge --ff-only` attempts;
update-ref + pathspec checkout, blob-verified). Zero branch commits
to rebase.
**Frozen:** 2026-11-24 ~03:30 UTC, before any judged run. No judged
run has run.

## 1. The question (from the brief + rearm-b §10)

Rearm-b proved the corpse-transfer re-arm: 4 second-life takes on 16
staged seeds, all through the daily Haven sweep, 1 second-life volley
(66 dmg vs a wave-5 Cancellation). The death-time witness channel
never fired (0/4) and 9 of 13 supply deaths produced no take at all:
the holder died in the wild, the gun lay on a wild corpse, and no
villager ever came to it. The prereg named the next question: a
wild-corpse expedition — go to the death site. Does a villager who
WITNESSES a wild corpse while on expedition — who actually walks
onto the death node — take the gun + cells from it?

## 2. Carried numbers (rearm-b, NOT re-derived)

- Staged leg (16 forced armed arrivals, seeds 107533–107548): 13
  supply deaths (staged holders who died holding cells); 4 re-arm
  takes, all Haven channel, all second-life (gun + 2 cells each);
  1 second-life volley (s107542, d122, 2 shots / 1 hit / 66 dmg vs
  a wave-5 Cancellation). Witness channel 0 takes; 9/13 supply
  deaths unconverted.
- Per-arrival fire rate 12.5% (2/16 staged holders fired in
  killbundle-b); per-fight fire rate at wave 4+: 2/2; below wave 4:
  0/100 (CELLGATE).
- Expected supply on a fresh 16-seed staged leg: ~12–13 staged
  holders die holding cells; ~6 on an 8-seed pilot. The
  INCONCLUSIVE clause (§7) exists for a freak outcome, not an
  expected one.

## 3. Code read (grounding — done before designing anything)

- **The transfer path is reused, not rebuilt.**
  `villagerRearmFromCorpse(c, takerVid, channel)` (corpses.js) is
  the one take: need-gated (dry holder takes cells only, 'rearm';
  gun-less villager takes gun + cells, 'second-life'; an already
  armed holder takes nothing), cells-gated (no cells on the corpse,
  no take), env-gated (`_rearmCellsOn()` — REARM_CELLS=1), voiced
  (`say`, naming the dead) and teled (`rearm_take`, with `channel`).
  This arm adds one caller, not a second transfer.
- **The perception ground already exists and is already used for
  corpses.** `mapmemNoticeNode(vid, nx, ny)` (villager-mapmem.js)
  is called as villagers move — "they see what's on the node
  they're standing on. Fresh corpses become remembered sites" —
  and is called from `objAwayStep` for every away walker. The
  villager's node position is real: `npcNode(vid)` / `npcSetNode`
  move them step by step (agency expeditions: one node per leg in
  `expeditionLeg`; objective trips: one node per part in
  `objAwayStep`, which also returns the walker home). The corpse's
  node is real too: `registerDeath` stores `node: {x, y}` (the
  world-map node of the death), the same coordinate space the
  Haven sweep already compares against.
- **Why mapmem never covers this case:** `mapmemRemember`
  explicitly refuses person corpses ("people are grief, not
  groceries — never a haul site"), so a dead holder's gun is
  invisible to the haul system by design. The re-arm channels
  are the only villager corpse-take, and neither reaches a wild
  node: the witness channel fires only at death-time for fight
  witnesses, the Haven sweep only for corpses on the Haven node.
  The wild node is the gap, and the walker standing on it is the
  perception.
- **The two hooks are disjoint by construction.** `objAwayStep`
  returns early for agency expeditions (`ast.exped[rid]`), and
  `expeditionLeg` runs only for agency expeditions (from
  `agencyTick`, after `npcNodeTravel`). No villager is stepped by
  both hooks in one tick, so no double-take is possible.
- **No new env flag.** The channel lives under the same
  REARM_CELLS=1 gate as the witness + Haven channels (the gate
  is inside `villagerRearmFromCorpse`; the new step calls it and
  nothing else). Control leg (REARM unset) is byte-identical in
  behavior: the hooks run a read-only corpse scan and the take
  returns null on the gate. No RNG is drawn anywhere in the new
  path (candidate order is corpse-list order; the take draws
  nothing), so the armed leg diverges from control only at the
  first take.
- **No stage gate, by consistency.** A corpse's cells are
  takeable until buried or looted (the Haven sweep has no stage
  gate either). A gun on a months-old skeleton is still a gun;
  the take line names the dead either way. Recorded, not hidden.
- **Haven-node exclusion.** The step fires only on non-Haven
  nodes: a walker stepping onto the Haven node is covered by the
  daily Haven sweep, and the channels must stay attributable
  (every 'expedition' take is a wild corpse, by construction).
- **Canon:** docs/CANON.md + the corpses.js header read. No canon
  doc covers re-arming or corpse transfer; the corpse system's
  own canon (death is knowledge, looting has weight, the village
  watches) is the grounding, as in rearm-b. The take is voiced
  and teled; it carries no villager trauma ledger — villagers
  have none, and inventing one is out of scope. Recorded, not
  hidden.

## 4. Band freshness (local_seed_band_freshness skill)

- **Staged band: 107734–107749 (16 seeds) — FRESH.**
  Searched: `grep -rhoE "107[0-9]{3}" evidence/*/sim-*-prereg.md`
  (all dates) — highest named seed is 107669; the 107670–107733
  band the sibling arm holds (per this run's brief) is not in any
  prereg (it is a live-claim hold, not a judged band). Searched
  the convergence tracker for `1077*` — only the 10758–10773
  bands appear. Searched live/dead lever-claims
  (`hidden_files/lever-claims/*.json`) — the live Loop A claim
  (`fleshout-20261124T0215Z.json`, arms sim-launchdiag-a /
  sim-departname-a) names no seed band. No collision anywhere:
  107734–107749 is named nowhere.
- The band is fresh, not reused: the arrivals are staged, so the
  supply is the same staged supply rearm-b had (one forced armed
  arrival per seed), but the SEEDS are new — the villages are new,
  the walks are new, the deaths are new. The comparison that
  matters (control vs armed) runs on identical seeds within this
  band, as in rearm-b.

## 5. Instrument (frozen design)

- Driver `scripts/killlootbundle-driver-a.js` (extended, same file
  the killbundle/rearm arms extended): + `REARM_PRESENT` now also
  requires `villagerRearmExpeditionStep` in corpses.js (STOP:
  REARM_CELLS=1 without the expedition-channel code present); +
  wrap of `registerDeath` recording `supplyCorpseRows` [{day,
  corpseVid, node {x,y}, cells}] for person corpses with cells
  at registration (pure read + driver-local write; the game
  function runs exactly once, untouched) — this gives the exact
  wild-supply denominator for the evidence table. The existing
  `villagerRearmFromCorpse` wrap already records `channel`, so
  'expedition' takes flow into `rearmTakeEvents` with no further
  driver change. STOP: REARM_CELLS=1 without the lever code
  present. RUN token `killlootbundle-a` UNCHANGED (analyzer
  hardcodes it); fresh OUTDIRs `perseed-rearm-witness-b-ctl` and
  `perseed-rearm-witness-b-arm`. Driver hardcodes
  `evidence/2026-11-21/<OUTDIR>` — corpora land under 2026-11-21
  although this arm's evidence is 2026-11-24; recorded, not
  moved (same as rearm-b).
- **Leg 1 — control (staged):** MODE=arm, KILLBUNDLE=1, STAGE_SEAR=1,
  REARM unset, seeds 107734–107749 (16), same substrate (§5). The
  lever code is present but inert: `_rearmCellsOn()` false on every
  call, zero draws, zero side effects.
- **Leg 2 — armed (staged):** identical + REARM_CELLS=1.
- **Substrate (both legs, identical to rearm-b):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset;
  `PRESENCE` unset. Horizon 150d death-aware. Policy: competent
  (verbatim).
- **Analyzer** `scripts/analyze-killlootbundle-a.js` (extended):
  per-seed + per-leg `expeditionRearmEvents` (rearmTakeEvents
  with channel 'expedition'), `expeditionRearmVolleys` (searcaster
  volleys with shots > 0 by an expedition taker on/after their
  take day), `wildSupplyDeaths` (supply deaths whose
  supplyCorpseRows node is not the Haven node), +
  `judgeRearmWitnessCompare` + selftest fixtures (extended count).
  The old `--rearm-compare` (rearm-b rule) is untouched.
- **Arm test (NEW):** `scripts/test-rearm-witness-b.js` — frozen-band
  checks, sizing arithmetic, driver-export + presence checks,
  live proof (`--live`: staged holder dies in the wild with cells
  on a wild node + a needy villager steps onto that node on
  expedition → takes gun + cells, equips, fires 1 shot at wave 4;
  REARM-off control → no take, corpse keeps gun + cells;
  dry-holder / armed-holder / no-cell / scholar-exclusion /
  Haven-node-exclusion guards), corpus validation modes
  (`--dir-ctl` 16 control files, `--dir-arm` 16 armed files).
- **Panel builder (NEW):** `scripts/build-rearm-witness-panels-b.js`
  (clone of build-rearm-panels-b.js with witness defaults: seeds
  107734–107749, before perseed-rearm-witness-b-ctl, after
  perseed-rearm-witness-b-arm, mode arm/arm — both legs are
  MODE=arm).
- **Parallelism:** 2 processes × 4 seeds (pilot, 8 seeds/leg), then
  2 processes × 4 seeds (confirm remainder, 8 seeds/leg),
  sequential within each process. If the run window ends mid-band,
  corpus + progress note are committed and the exact done-seed
  list reported (coordinator adopts; nothing faked or
  extrapolated).

## 6. Definitions (frozen — rearm-b §6, extended explicitly)

- **Kill-loot searcaster arrival / armed arrival / bundled arrival /
  kill-loot volley / per-arrival fire rate / re-arm event /
  second-life volley / supply death / scholar-path take:** as
  rearm-b §6.
- **Expedition re-arm event:** one `rearmTakeEvents` record with
  `channel === 'expedition'` — a villager who stepped onto the
  wild node where a dead holder's corpse lay, while away on an
  expedition/objective trip, taking gun + cells ('second-life')
  or cells only ('rearm') from that corpse. The record's `day` is
  the take day; `taker` is the walker; `corpseVid` is the dead
  holder.
- **Expedition second-life volley:** a `volleyEvents` record with
  `rwId === 'searcaster'`, `shots > 0`, and `vid` equal to an
  expedition taker of that seed, on/after that taker's take day.
- **Wild supply death:** a supply death (rearm-b §6) whose
  supplyCorpseRows entry has a node that is NOT the Haven node
  (Haven node = village px/py at run end, recorded per seed file).
  A supply death with no supplyCorpseRows entry is listed as
  unknown in the evidence and does NOT count as wild (the bar
  uses total supply; see §7).
- **Wild conversion rate:** expedition re-arm events / wild supply
  deaths on the armed leg (diagnostic, not a bar).

## 7. Frozen bars (judge: analyzer --rearm-witness-compare + tier tally + panel + arm test)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — analyzer `--selftest` green (extended count) + `test-rearm-witness-b.js` pre-run + `--live` green, all re-run on this base; 0 instrument errors on all 16 ctl + 16 armed files; single anchor + policySha per corpus; `rearmPresent` true on every file; ctl files `rearmOn` false, armed files `rearmOn` true | all must hold |
| 2 | **Bundle intact** — every kill-loot searcaster arrival on BOTH legs carries exactly 2 cells (`klBundled == klArrivals`, `klDry == 0`, per leg) | must hold for GO |
| 3 | **Primary, expedition takes** — armed-leg `expeditionRearmEvents ≥ 2` | ≥ 2 for GO |
| 4 | **Primary, expedition volley** — armed-leg `expeditionRearmVolleys ≥ 1` (an expedition taker firing the gun on/after the take day) | ≥ 1 for GO |
| 5 | **Control clean** — ctl-leg `rearmEvents == 0` (all channels; REARM unset ⇒ zero takes; a take on control means the env gate is broken) | must hold for GO |
| 6 | **Supply** — armed-leg `supplyDeaths ≥ 1` (a staged holder died holding cells; rearm-b's definition, robust to the new instrument piece) | ≥ 1, else INCONCLUSIVE |
| 7 | **Guardrails** (analyzer `--rearm-witness-compare` ctl vs armed) — starvation-death delta ≤ +2, median-survival delta ≥ −20 | must hold for GO |
| 8 | **Balanced panel (§15)** — panels built ctl vs armed (16 staged seeds) via `scripts/build-rearm-witness-panels-b.js`; `node scripts/balance-panel.js compare` completes; decision `review_required`; every metric status ∈ {descriptive, no_material_signal, not_observed, insufficient} (no regression signal) | must hold for GO |
| 9 | **Scholar-path context + sense-test delivered** — scholar takes of gun/cells on the control leg recorded (compare with rearm-b 3/16), tier-4 rates per leg reported (tally script; not a bar — both legs are staged, so the forced searcaster inflates both equally), and one expedition take read as a village story (does the walker notice the body, is it voiced honestly, does the gun speak again) | must be delivered |

**Verdict rule (frozen):** GO = bars 1, 2, 5, 7, 8 pass AND bar 3
passes AND bar 4 passes. NO-GO = bar 6 passes (supply ≥ 1) AND
(bar 3 fails OR bar 4 fails) OR any of bars 1, 2, 5, 7, 8 fails.
INCONCLUSIVE = bar 6 fails (supply 0) AND bars 1, 2, 5, 7, 8 pass
(a thin supply can't be re-scored as a miss or a pass after the
fact). A miss is NO-GO, never re-scored against a friendlier metric
mid-run (§14).
**Base-rate note (frozen in advance):** the staged per-arrival fire
rate is 12.5%, so if the armed leg yields N expedition takes,
P(≥1 expedition volley) ≈ 1 − 0.875^N — about 23% at N=2, 41% at
N=4. The bar is strict by design (proof-of-effect: the observable
effect is a walker taking corpse-taken cells on a wild node *and
firing*). A takes>0 / volleys=0 confirm is NO-GO with the take
rate as the delivered finding and the next question (volley
frequency — the same CELLGATE wall) named, not a re-score. The
take bar (≥ 2) is the mechanism bar; the volley bar is the
proof-of-effect bar. Rearm-b's metric review proposed grading the
volley bar; this prereg keeps it hard, as rearm-b did, so the two
arms are judged to the same standard.
**Pilot continue rule (frozen):** pilot = 8 staged seeds per leg
(107734–107741). Continue to confirm iff the instrument is valid
on the 8+8 files AND armed-pilot `supplyDeaths ≥ 1` AND
armed-pilot `expeditionRearmEvents ≥ 1` (the take is visible).
If supply ≥ 1 but expedition takes 0 → NO-GO at pilot: the
mechanism did not fire where it should have — kill the arm, no
confirm spend. If supply 0 → INCONCLUSIVE-thin: stop, diagnose
the supply. The pilot does NOT require a volley; the volley bar
is judged on the full 16.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/analyze-killlootbundle-a.js
  --selftest` → green (extended count); `node scripts/test-killbundle-b.js` → green
  (re-run on this base, instrument lineage intact);
  `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14;
  `node scripts/test-rearm-b.js` → green (lineage: the Haven +
  witness channels still behave);
  `node scripts/test-rearm-witness-b.js` → pre-run checks green;
  `node scripts/test-rearm-witness-b.js --live` → live proof green
  (take + equip + wave-4 volley on new code; no take on REARM-off
  control) — all re-run on the rebased base.
- **Pilot (judged):** 8 staged seeds per leg, 107734–107741 (control
  first, then armed; 2 processes × 4 seeds each). Instrument check
  (anchor, policySha, 0 errors, rearmOn flags, stageSearOn) + pilot
  continue rule (§7) before any confirm spend.
- **Confirm (judged):** remaining 8 staged seeds per leg,
  107742–107749.
- **Analysis (judged):** analyzer `--dir` per leg;
  `--rearm-witness-compare` ctl vs armed; tier tally per leg; panel
  build + compare; per-seed staged table in the evidence file
  (columns: seed, staged arrival day/holder, cells, holder death
  with cells? + corpse node (wild/Haven), corpse-take events by
  whom + channel, expedition takes, expedition volleys,
  shots/hits/dmg) for both legs.
- **Wall numbers** recorded: wins, national, table (not instrumented
  by this driver — recorded as not instrumented, never faked), wave
  4–5 unlocks, median/max survival.
- **Sense-test:** read the census/volley/take records for the first
  expedition take(s) as a village story; the driver records no
  dialogue text, so the sense-test judges from equip/carry/fight
  behavior, the engine's own say lines (visible in the live test,
  not the corpus), and the take/volley records — said plainly, not
  faked.
- **Canon:** docs/CANON.md + corpses.js header read (§3); no canon
  doc covers corpse-transfer re-arm — said here rather than
  inventing canon.

## 9. Infra notes

- **Metric review** (to be filled in the evidence file).
- The prereg + game-code change + driver/analyzer/test/panel
  changes commit AFTER the pre-flight re-run on the rebased base
  and BEFORE any judged seed runs. The judged corpora will carry
  the prereg-commit anchor (recorded in the evidence file); the
  ctl-vs-armed comparison is unaffected because both legs run on
  that one anchor.
- **Panel exit code:** `balance-panel.js compare` exits 2 when its
  decision is `review_required` (the tool's own convention: exit 0
  only on `no_material_signal`). The compare completing and writing
  the panel files is the pass condition, not the exit code. Recorded
  so the next reader doesn't misread it (same as rearm-b §9).
- **Machine restarts + the slow merge:** this run's adoption started
  02:38Z; the machine restarted ~03:04Z, ~03:15Z and ~03:27Z (uptime
  1:35 / 1:46 / 1:00 on re-check), each killing a `git merge
  --ff-only` attempt mid-checkout. The first merge attempt failed on
  a stale `index.lock` (01:31Z, from the dead 2322Z run) — removed
  after verifying no live holder; the pipe through `tail -3` masked
  the failure (lesson: never pipe a merge through tail; capture the
  exit code). The merge's cost is the full-index refresh (a 21-file,
  6-commit ff takes 5m39s wall / 24s CPU under load), so after the
  third restart killed the fourth attempt, the branch was brought to
  master by hand: `git update-ref refs/heads/sim-rearm-witness-b
  7344d8a56` (after verifying HEAD was an ancestor of FETCH_HEAD)
  + pathspec `git checkout HEAD -- <21 files>`, verified by
  blob-hash comparison (`git hash-object` vs `git ls-tree HEAD`)
  on the changed files. The prereg was written while the merge ran.
  The 21-file diff touches none of this arm's files (only
  src/js/convo-wants.js among src), so no edit conflicted.
