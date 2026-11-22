# sim-killloot16-a — PREREG (frozen)

**Arm:** sim-killloot16-a · **Loop A run:** fleshout-20261122T0215Z, arm 2 of 3
**Axis:** scale-onramp · **Finding:** #2649 (kill-loot bundle)
**Type:** LEVER re-judge — 16-seed band (arrival rate in honest sims)
**Base master:** `4266e6cce` (worktree `~/workspace/worktrees/sim-killloot16-a`,
branch `sim-killloot16-a`)
**Frozen:** 2026-11-22 ~02:30 UTC, before any judged run. No judged run has run.

## 1. The question (from the brief + finding #2649)

The kill-loot bundle's fixture is GO (evidence/2026-11-21/
sim-killlootfixture-a.md): the bundled kill-loot gun fires 2 shots in a
forced wave-4 Herald fight; dry control 0. What remains is the arrival
rate in honest sims. This arm runs the frozen 16-seed band
107281–107296 (fixture prereg §7) on the same instrument as the pilot
(`scripts/killlootbundle-driver-a.js` +
`scripts/analyze-killlootbundle-a.js --compare` +
`scripts/build-killlootbundle-panels-a.js` + `scripts/balance-panel.js
compare`, §15).

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/CONTESTS.md read (prize funnel: the
  2-cell bundle shape is taken from the contest-prize code, as in the
  pilot prereg §2). **No canon doc covers the kill-loot bundle** — said
  here rather than inventing canon.
- `villagerKillLoot(vid, mdef)` (game.js:8181): with `KILLBUNDLE=1` and a
  `'searcaster'` roll it pushes 2 `fusion_cell` entries to the same
  holder as the gun. Adds zero RNG draws. Default OFF (env-gated).
- Volley path (`fieldFights.js` fieldFight): a searcaster volley spends
  1 fusion cell per shot; CELLGATE holds fire below wave 4 — a bundled
  kill-loot gun's cells survive to wave 4+, and a volley from it is the
  observable "supply reached a fight".
- Static prior: kill-loot searcaster arrivals are rare — 1 in 8 seeds on
  the grantrate band (107237 day 71); 0 in 8 on the killlootbundle pilot
  band (107261–107268). P(≥1 arrival on a 16-seed band) ≈ 88% at the
  grantrate rate. The verdict table (§6) handles the zero-arrival case
  honestly instead of re-scoring it.

## 3. Base note — rebased BEFORE the band (brief deviation, recorded)

The brief said master had moved to 4266e6cce with "evidence + scripts
only for your files — no src/js overlap with this arm" and to rebase
before finishing. That claim is WRONG on the src/js part: the diff
0ea9789d7..4266e6cce touches `src/js/fieldFights.js` (+279/−, DOORFLEE2
env-gated hold + ally3 fields), `src/js/game.js` (ALLYSLOT3 env-gated
wild-router cap), `party-wiring.js`, `villager-agency.js`,
`villager-brain.js`, `win-plan.js`. Both new levers are env-gated
default-OFF and this arm's substrate sets neither `ALLYSLOT3` nor
`DOORFLEE2`, so off-mode behavior is the old behavior — but the volley
path itself (fieldFights.js) changed, so running 85 min of sims on the
stale base and rebasing after would have left the corpus on a superseded
base. This arm therefore rebased FIRST (fast-forward, no local commits,
no conflicts: worktree was at 0ea9789d7, clean) and re-ran the instrument
checks on the new base (proof 12/12, selftest 17/17 — green, §7). The
band runs on 4266e6cce; the corpus `anchorCommit` records it.

## 4. Band freshness (local_seed_band_freshness skill)

- **Band: 107281–107296 (16 seeds), frozen by the fixture prereg §7.**
  Re-verified before this prereg: grepped every prereg under
  `evidence/*/sim-*-prereg.md` and every `evidence/*/sim-*.md` for the
  standalone tokens 107281–107296.
- **OVERLAP FOUND (recorded, assessed, proceeding — see below):**
  `sim-tier4pool-a` used band **107271–107282**, which overlaps this
  band at seeds **107281 and 107282** (a different lever, TIER4POOL,
  different substrate). The fixture prereg §5 missed this because
  tier4pool's prereg lived in a sibling worktree, unmerged, when the
  fixture arm grepped its own tree — a worktree-visibility artifact,
  not a fresh-band failure at the time.
- **Assessment (why proceeding on the frozen band):** (a) the overlap is
  2 of 16 seeds, under a different lever whose env (TIER4POOL) does not
  touch the kill-loot roll — the kill-loot trajectories under THIS
  substrate are fresh observations; (b) the verdict is a within-band
  ctl-vs-arm contrast on identical seeds, so any seed-level
  idiosyncrasy cancels in the comparison; (c) the band was frozen
  before any kill-loot band outcome existed on it — no selection on
  kill-loot results; (d) the two overlapping seeds were already run as
  kill-loot ctl smoke by the fixture arm (unjudged, 0 arrivals on both
  — if anything an unfavorable draw, not a cherry-pick). The
  coordinator froze this band knowing the smoke; this overlap is
  recorded here for the record and the coordinator may overrule.
- Forbidden bands from prior briefs (106751–106766, 107221–107228,
  107191–107198, 107131–107138, 107111–107118, 107091–107098,
  107081–107088, 107051–107058, 107021–107028) do not overlap
  107281–107296. Nearest other used bands: 107261–107268
  (killlootbundle-a pilot), 107237–107248 (grantrate / shelterdraft).

## 5. Instrument (frozen design — reuse unchanged)

- `scripts/killlootbundle-driver-a.js` + `scripts/analyze-killlootbundle-a.js`
  + `scripts/build-killlootbundle-panels-a.js` + `scripts/balance-panel.js`
  reused UNCHANGED from the pilot/fixture (proof 12/12, selftest 17/17
  re-run on this base, §7).
- **RUN id / OUTDIR (frozen choice):** `RUN=killlootbundle-a` UNCHANGED
  and fresh OUTDIRs `perseed-killloot16-a-ctl` /
  `perseed-killloot16-a-arm`. Reason: the analyzer's `loadDir` regex and
  the panel builder hardcode the RUN token `killlootbundle-a` in
  filenames — a fresh RUN id would make the corpus invisible to both.
  A fresh OUTDIR avoids the driver's overwrite refusal (the fixture
  smoke used OUTDIR `perseed-killlootfixture-a-ctl` with the same RUN,
  so the two ctl seeds 107281/107282 already on disk are in a different
  directory and are NOT re-used or overwritten).
- **Driver date dir (known quirk):** the driver hardcodes
  `evidence/2026-11-21/<OUTDIR>` — the corpus lands under 2026-11-21
  although this arm's evidence is 2026-11-22. Reused unchanged per the
  brief; recorded here, not silently moved.
- **Parallelism:** the band runs as 4 detached processes (2 legs × 2
  seed-halves of 8), each a separate node process with its own SEEDS
  subset, same RUN/OUTDIR per leg — per-seed filenames never collide
  across processes. Sequential estimate ~85 min; 4-way ~25–40 min
  under load. If the run window ends mid-band, the corpus + a progress
  note are committed and the exact done-seed list reported (coordinator
  adopts; nothing faked or extrapolated).

## 6. Definitions (frozen — pilot prereg §5 verbatim)

- **Kill-loot arrival:** a `villagerKillLoot` event with
  `dropId === 'searcaster'`.
- **Bundled arrival:** a kill-loot arrival whose snapshot diff shows
  `cellsGained === 2` on the same holder, same call.
- **Kill-loot volley:** a `fieldFight` volley with `shots > 0` from a
  fighter whose equipped ranged weapon is `searcaster` AND who is in
  the kill-loot-holder set (received a kill-loot searcaster earlier in
  the run).
- **Holder-days with cells:** daily census days on which a kill-loot
  holder's equipped searcaster shows `cells > 0`.
- **Guardrails (scalemetric):** starvation deaths per leg + median
  survival; panel compare ctl → arm must show no material signal on
  either (the lever adds ammo, never food — a starvation move is a
  real bug, not noise).

## 7. Frozen bars (judge: the analyzer on the full band + panel compare)

Re-frozen verbatim from the pilot prereg §6, with bar 3 promoted from
pilot (8 seeds) to this 16-seed confirm. The fixture's bar 2 (forced
volley GO) is a prerequisite already passed, not re-judged here.

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof test 100% + analyzer `--selftest` pass; 0 instrument errors; every kill-loot searcaster drop carries a cells-at-arrival diff | all must hold |
| 2 | **Mechanism proof** — proof test: KILLBUNDLE=1 bundles exactly 2 cells on a forced searcaster drop, 0 when off, 0 for non-searcaster drops | all must hold |
| 3 | **Band GO** — arm leg: ≥ 1 bundled kill-loot arrival AND ≥ 1 kill-loot volley (shots > 0). Control leg: 0 bundled arrivals | all must hold for GO |
| 4 | **Coverage** — 100% of kill-loot searcaster drops attributed with cells-at-arrival; 100% of gun arrivals (contest + kill-loot) counted; 0 unclassified searcaster sources | all must hold |
| 5 | **Guardrails** — panel compare ctl → arm: no material signal on starvation deaths or median survival; total gun arrivals reported (contest + kill-loot) | all must hold |

**Zero-arrival rule (frozen, no re-scoring):** kill-loot arrivals are
rare (≈1 per 8 seeds on the grantrate band). If BOTH legs see 0
kill-loot searcaster arrivals, bar 3 is **INCONCLUSIVE** (not GO, not
NO-GO): the mechanism stands proven by bar 2 only, and the band cannot
judge the arrival rate — the evidence says so and names the next step
(wider band or the already-GO fixture as the standing answer). If
arrivals exist but no kill-loot volley fires, bar 3 is **NO-GO** on the
"reaches a fight" half. A miss is NO-GO, never re-scored against a
friendlier metric mid-run (§14).

GO = all five bars pass. GO means: kill-loot guns now arrive with ammo
and at least one fires in a real fight, with no scale-metric cost.
NO-GO = revert the game code before commit; keep instrument + evidence.
(The lever is env-gated default-OFF; a NO-GO leaves it off as it stands.)

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-killlootbundle-a.js`
  → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` →
  17/17 — both re-run on base 4266e6cce. Green.
- **Band (judged):** 16 seeds, **107281–107296**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). Two legs, ctl vs arm, identical
  seeds + substrate; only `KILLBUNDLE` differs. Substrate (both legs):
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset;
  `PRESENCE` unset; `ALLYSLOT3` unset; `DOORFLEE2` unset.
- **Per-seed arrival table + volley counts** in fights where a bundled
  gun is held: reported in the evidence file from the analyzer output
  (per-seed JSONs in `evidence/2026-11-21/perseed-killloot16-a-ctl` /
  `-arm`).
- **Wall numbers** recorded per leg: wins, national, table (not
  instrumented by this driver — recorded as not instrumented, never
  faked), wave 4–5 unlocks, median survival.
- **Panel (§15):** `node scripts/build-killlootbundle-panels-a.js
  --out evidence/2026-11-22/killloot16-a-panel --before
  evidence/2026-11-21/perseed-killloot16-a-ctl --after
  evidence/2026-11-21/perseed-killloot16-a-arm --seeds
  107281,...,107296` then `node scripts/balance-panel.js compare`.
- **Sense-test:** read the transcript/volley log of any fight where a
  bundled gun fires; judge whether it reads as a person fighting.
- **Canon:** docs/CONTESTS.md (prize funnel); no canon doc covers the
  kill-loot bundle — the bundle shape is code-derived (see §2), said
  here rather than inventing canon.

## 9. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
