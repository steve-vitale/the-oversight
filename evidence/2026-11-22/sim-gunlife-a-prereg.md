# sim-gunlife-a — PREREG (frozen)

**Arm:** sim-gunlife-a · **Loop A run:** fleshout-20261122T0815Z
**Axis:** scale-onramp · **Finding:** #2667 (CONTEST GUNS NEVER FIRE)
**Type:** DIAG (descriptive trace — no lever, no contrast leg)
**Base master:** `67a87d1b5` (worktree `~/workspace/worktrees/sim-gunlife-a`,
branch `sim-gunlife-a`)
**Frozen:** 2026-11-22 ~04:30 UTC, before any judged run. No judged run has run.

## 1. The question (from the brief + finding #2667)

On the killloot16 band (107281–107296, 150d, competent), 15 contest
searcaster grants per leg arrived and **0 searcaster volleys fired from
any source** — the guns sit in packs through wave-4 and wave-5 fights
without ever opening one. This arm traces one granted gun's life and
names the mechanism: for every contest searcaster grant on a fresh band,
record holder, equipped days, wave-4+ fights entered while held, volley
attempts, cells held, and final disposition. The next step after this
trace is a lever — this arm is the trace, not the fix.

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/CONTESTS.md read (prize funnel: a
  contest win can grant a searcaster + 2 fusion cells; the prize is the
  high-risk/high-reward contract — "a contest you survive should change
  your game"). **No canon doc covers why a granted gun would never fire**
  — said here rather than inventing canon.
- Volley path (`fieldFights.js` `fieldFight`, read on this base): the
  opening volley is the LEAD fighter's (`vid`) own ranged kit only —
  allies in the same fight get no volley of their own. `rec.volley` is
  non-null iff the lead has a ranged weapon with an ammo id. Shots > 0
  = fired; shots 0 with ammo left + wave < 4 + searcaster = CELLGATE
  hold ("holds the Searcaster — the beast is below wave 4"); shots 0
  with ammo 0 = dry ("the trigger clicks on nothing"). So a gun fires
  only when its holder LEADS a wave-4+ fight WITH the gun equipped AND
  cells on hand — three gates, any one of which can be the mechanism.
- Grant shape (killloot16 corpus, seed 107281, read before this prereg):
  a contest prize's `gains` diff names the holder (a villager id, or
  `__scholar__`); the contest `who` is often `"player"` while the gun
  goes to the GUNRATE fighter (`predictedFighter` matches the holder).
  A grant arrives `carried` on day 0 and `equipped` from day +1. Guns
  move between holders through transfers the instrument does not log
  (corpsecap-a §4: a second gun ends up equipped on a living villager
  with no grant, corpse-take, or drop event) — a holder change with no
  event is recorded as an unattributed transfer, never forced.
- Known instrument pitfall (finding #2635 / corpsecap-a §3): the holder
  census (`gunLocationsOf`) double-counts a taken gun on a dead holder's
  equipped slot — `generatePossessions` copies the dead person's gear
  to the corpse without removing it from the dead record — and the
  killloot analyzer's holder-days count is blind to a scholar-equipped
  gun (it only counts `loc === 'equipped'`). The tracer therefore
  SKIPS `equipped` rows for holders flagged dead in that day's
  `personFlags` and COUNTS `scholar-equipped` rows as equipped days for
  `__scholar__`; both behaviors are proven in the proof test.

## 3. Base note — rebased BEFORE the band (brief deviation, recorded)

The brief said master had moved to `4681e740f` (Loop B sim-hypofloor-b
merge) and to rebase onto it. Master has since moved TWO commits further
(`86b644152`, `67a87d1b5` — journey succession r266, evidence-only
transcripts + panel scripts). The branch fast-forwarded with zero local
commits, no conflicts, to the current tip `67a87d1b5`, which INCLUDES
`4681e740f` — rebasing onto the named commit instead would have left the
band two commits behind master and unmergeable by the coordinator's
`--ff-only` merge. Recorded here, not silently done.
**Hypofloor verification (as briefed):** commit `4681e740f` touches none
of this arm's files (its files: hypofloor-b evidence/analysis, scripts/
analyze-hypofloor-b.js, pinquaddoor-driver-b.js, test-hypofloor-b.js,
plus `src/js/fieldFights.js` +45/−0). The fieldFights.js change is the
HYPOFLOOR env-gated (HYPOFLOOR=1) floor on hypothetical HP in the
pinned-door flee-decision pool only — off-mode byte-identical, no new
RNG, and it does not touch the volley block. This substrate does not set
HYPOFLOOR. The two succession commits touch only evidence transcripts
and journey scripts.

## 4. Band freshness (local_seed_band_freshness skill)

- **Band: 107321–107328 (8 seeds).** Verified before this prereg:
  grepped every prereg under `evidence/*/sim-*-prereg.md` and every
  `evidence/*/sim-*.md` for each standalone token 107321, 107322,
  107323, 107324, 107325, 107326, 107327, 107328 — **0 hits on all 8**
  (run in the main tree, `grep -rl "\b<seed>\b" evidence/*/sim-*-prereg.md
  evidence/*/sim-*.md`).
- **No collision; no shift needed.** Nearest used bands: 107301–107308
  (Loop B sim-launchstate-b) and 107281–107296 (killloot16) — neither
  overlaps 107321–107328. Forbidden bands from prior briefs
  (106751–106766, 107221–107228, 107191–107198, 107131–107138,
  107111–107118, 107091–107098, 107081–107088, 107051–107058,
  107021–107028) do not overlap it either.

## 5. Instrument (frozen design)

- `scripts/killlootbundle-driver-a.js` reused UNCHANGED from killloot16
  (proof 12/12, selftest 17/17 on the pilot base; re-run on this base
  before the band — see §7). **RUN id / OUTDIR (frozen choice):**
  `RUN=killlootbundle-a` UNCHANGED and fresh OUTDIR
  `perseed-gunlife-a-ctl`. Reason: the driver's `loadDir` regex and the
  analyzer hardcode the RUN token `killlootbundle-a` in filenames — a
  fresh RUN id would make the corpus invisible. A fresh OUTDIR avoids
  the driver's overwrite refusal.
- **Driver date dir (known quirk):** the driver hardcodes
  `evidence/2026-11-21/<OUTDIR>` — the corpus lands under 2026-11-21
  although this arm's evidence is 2026-11-22. Reused unchanged per the
  brief; recorded here, not silently moved.
- **New tracer:** `scripts/analyze-gunlife-a.js` (does not touch the
  existing analyzer): reads the per-seed JSONs, builds one life per
  contest searcaster grant, and emits per-grant dated life rows from
  the daily census (`v4gunLoc`) + fight records (`volleyEvents`) +
  grant/corpse-take/death records. `node scripts/analyze-gunlife-a.js
  --dir <dir> --out <file>`; `--selftest` runs the staged checks.
- **Single leg (diag):** MODE=ctl only, KILLBUNDLE unset. No lever to
  contrast; no arm leg exists.
- **Parallelism:** the 8 seeds run as 2 detached processes (4 seeds
  each), same RUN/OUTDIR — per-seed filenames never collide across
  processes. Sequential estimate ~35 min; 2-way ~20 min under load.

## 6. Definitions (frozen)

- **Contest searcaster grant:** a `prizeEvents` entry whose `gains`
  diff contains `gunsGained > 0` for a searcaster (the diff holder is
  the grant holder; `__scholar__` when the scholar holds it).
- **Traced grant:** a grant with a complete dated life table (grant
  day, holder, equipped days, wave-4+ fights entered while held,
  volley attempts with shot breakdown, cells held, final disposition)
  AND a named mechanism from the list below.
- **Equipped day:** a census day on which the (living) holder shows an
  `equipped` row for a searcaster, or `__scholar__` shows a
  `scholar-equipped` row. `equipped` rows for holders flagged dead in
  that day's `personFlags` are SKIPPED (ghost, finding #2635).
- **Equipped day with cells:** an equipped day whose census row carries
  `cells > 0`. Scholar-equipped rows carry no cell count in the census
  — scholar days are counted as equipped days with cells marked `n/a
  (census-blind)`; cells at grant (`cellsAfter`) and cells at last sight
  are reported instead. Never invented.
- **Fight entered while held:** a `volleyEvents` entry with `vid` ==
  the holder, dated while the holder holds a gun. COVERAGE LIMIT
  (frozen): the corpus records a fight only when the fighter LEADS it
  AND has a ranged weapon equipped (`rec.volley` non-null) — a holder
  who fights as an ally, or leads with no ranged weapon, leaves no
  record. "0 fights entered" therefore means "0 lead-with-ranged-weapon
  fights observed", and the evidence says so.
- **Volley attempt:** a fight entered while held with `rwId ===
  'searcaster'`. Breakdown: fired (shots > 0); CELLGATE-held (shots 0,
  ammoLeft > 0, wave < 4); dry (shots 0, ammoLeft 0).
- **Mechanism classes (one per grant, named from the trace):**
  `never-equipped` (equipped days 0) · `equipped-never-led-wave4+`
  (equipped, 0 wave-4+ fights entered while held) · `led-with-other-weapon`
  (wave-4+ fights entered, gun never equipped in any of them) ·
  `led-with-gun-dry` (gun fights at wave 4+, all dry) ·
  `cellgate-held-only` (gun fights only below wave 4, all held) ·
  `holder-died-first` (holder dead before any wave-4+ fight while held)
  · `gun-left-holder` (gun transferred/lost before any wave-4+ fight
  while held) · `fired` (shots > 0 — contradicts the 0-volley finding;
  reported if seen) · `unexplained-vanish` (gun leaves all census
  locations with no event — said so, never forced).
- **Final disposition:** last census state of the grant's gun (location,
  holder, cells if visible) + holder alive/dead at end + whether the
  gun is still in the world (census total) at run end.

## 7. Frozen bars (judge: the tracer on the full band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — killlootbundle proof test 100% + analyzer `--selftest` pass on this base; gunlife proof test 100% (scholar-equipped gun seen, dead-holder equipped row skipped, per-grant rows complete on a staged corpus); 0 instrument errors on all 8 seed files | all must hold |
| 2 | **Grant coverage** — 100% of contest searcaster grants on the band appear as traced grants; 0 unclassified searcaster sources; total gun arrivals (contest + kill-loot) counted | all must hold |
| 3 | **GO** — ≥ 80% of contest searcaster grants traced to a named mechanism with per-grant dated rows, AND the mechanism behind 0 volleys named | all must hold for GO |
| 4 | **NO-GO rule** — > 20% of grants unattributed, or the recorder cannot see holder/equip/fight state → NO-GO (never re-scored against a friendlier metric mid-run, §14) | frozen |

**Zero-grant rule (frozen, no re-scoring):** at the killloot16 grant
rate (~15 grants / 16 seeds) an 8-seed band expects ~7 grants, but if
the band sees **0 contest searcaster grants**, there is nothing to
trace and the verdict is **INCONCLUSIVE** (not GO, not NO-GO) — the
evidence says so and names the next step (a wider band). A miss is
NO-GO, never re-scored against a friendlier metric mid-run (§14).

GO = all four bars pass. GO means: the trace names why contest guns
never fire, on ≥ 80% of the band's grants, with dated rows to prove it.
NO-GO = the recorder is blind or the grants won't attribute; the
evidence says which, and the next arm fixes the instrument first.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-killlootbundle-a.js`
  → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` →
  17/17; `node scripts/test-gunlife-a.js` → 100%; `node
  scripts/analyze-gunlife-a.js --selftest` → 100% — all re-run on base
  `67a87d1b5` before any judged run. Green.
- **Band (judged):** 8 seeds, **107321–107328**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). Single leg, MODE=ctl.
  Substrate: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`
  unset; `PRESENCE` unset; `KILLBUNDLE` unset; `HYPOFLOOR` unset.
- **Per-grant life table** in the evidence file from the tracer output
  (per-seed JSONs in `evidence/2026-11-21/perseed-gunlife-a-ctl`).
- **Wall numbers** recorded: wins, national, table (not instrumented
  by this driver — recorded as not instrumented, never faked), wave
  4–5 unlocks, median survival.
- **Sense-test:** re-run one seed with full telemetry (sense script,
  same env — the driver wraps consume no RNG, so the trajectory
  reproduces) and read one holder's transcript aloud: does it read as
  a person carrying a gun?
- **Canon:** docs/CONTESTS.md (prize funnel); no canon doc covers why a
  granted gun never fires — the mechanism is code-derived (see §2),
  said here rather than inventing canon.

## 9. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
