# sim-frozenband-bisect-b — prereg

**Arm:** sim-frozenband-bisect-b (DIAG, zero src/js expected) · **Run:** fleshout-loop-b-20261107T2030Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3), open from the 1430Z review · **Findings:** #1885 (this arm is its named next step) · **Branch:** sim-frozenband-bisect-b, cut at master a2e005cbe · **Base for sweeps:** candidate SHAs inside 62ca38845..cf22937b8, checked out in the worktree (detached) for sweeps only; commits always made on the branch tip.

## The question

WHICH landing in the range 62ca38845..cf22937b8 collapsed the frozen band 53001–53008's survival? (1430Z record, findings #1885: re-running the takeseat substrate — doorwalk driver, both legs, 150d — on cf22937b8, villages die 54–92d, median ~70d vs 150d capped on 62ca38845, sits 5/8→0/8, wins 0/8; substrate sanity still passes, lesser 4/8, but 53004/53005/53006 die before the day-90 floor and 53008 lives to d92, seat earned d55, 2 preview-ready days, never sits — 8× "not-ready: Finish the current encounter" skips, then dies d92. Baseline==armed exactly on all 8 seeds, doorwalk never fires, 0 instrument errors. The lever is exonerated; the collapse is substrate movement.)

## Candidate set (wider than one-commit-at-a-time — driftwide lesson, findings #1082)

The range is linear, 17 commits, no merges. Classification by `git show --stat` + `git diff --name-only` per commit:

### A. Game-code landings (the bisect candidates — only 3 in the range)

| # | SHA | Landing | Files moved (src/js / src/data) |
|---|-----|---------|----------------------------------|
| C1 | `16369893c` | journey-deepening r114: gate bond/link decisions on shared words | `src/js/bond-initiation.js` (+49) |
| C2 | `50881fbf2` | xp-gear: synergy bonus + healing deed coverage + gear protection retune (Steve 2026-11-05) | `src/data/items.json`, `src/data/tracks.json`, `src/js/abilityActions.js`, `fieldFights.js`, `game.js`, `godpath.js`, `safetynets.js`, `skill-teaching.js`, `tracks.js` |
| C3 | `7943fd58a` | xp-gear: patrol deed — first combat threshold reachable in everyday play (r104 follow-up) | `src/data/tracks.json` (+1), `src/js/game.js` (+11) |

### B. Scripts / evidence-only commits (cannot move game trajectories — verified by construction)

- r114 prereg/driver/proof (`f4128b42d`, `316f30000`), r114 run note (`8ee8dcfb6`).
- xp-gear panel driver / after-panels / run notes (`d8798d50d`, `ed9e9d6d5`, `12bb0ed0f`, `e2c91d08f`, `30e5aca90`).
- Measurement-proof refreshes ×3 (`ae07b4bf5`, `4108b1020`, `9aa2698fc`) — `scripts/balance-proof.json` pins only.
- r108 prereg/driver/proof (`20d446e09`) — ADDS `scripts/policies/scalecourt-nogate-morntrace3-linkraise.js`, but the replay instrument never requires it: no `require` of linkraise in `competent-linkfeast-b`, `competent-stageally-a`, `competent-rally-bankkiller-b`, `sim-harness.js`, `sitstep-instrument-20261107.js`, `competent-doorwalk-b`, or the doorwalk driver. Ruled out by construction; the sweep design itself is the check (see fallback below).
- r108 run note (`2d2b0412e`), r108 rebase addendum (`cf22937b8`) — evidence only.

### C. Policy / substrate history

- The replay substrate is byte-untouched in the range: `git diff --name-only 62ca38845..cf22937b8` over the driver, `sim-harness.js`, `sitstep-instrument-20261107.js`, `competent-linkfeast-b`, `competent-stageally-a`, `competent-rally-bankkiller-b`, `sweep-compare.js` returns ONLY the new linkraise file (B above). `src/js/table.js`, `table-feared.js` untouched (1430Z verified).
- The doorwalk driver + `competent-doorwalk-b` policy are byte-identical between the 1430Z tooling commit (`f4d7fb495`) and this branch tip (`a2e005cbe`) — the instrument is the 1430Z instrument, frozen.

### D. Harness inputs

- `sim-harness.js` untouched in the range; seeded `Math.random` before eval, deterministic sim clock, unchanged. The driver is run with `REPO` = the worktree at the candidate SHA; only `src/js` + `src/data` move between sweeps (plus the frozen instrument files copied in untracked — see Instrument below).

### E. Base misattribution (the alternative to a landing cause)

- Healthy endpoint `62ca38845` was verified by the 1430Z coordinator's re-baseline reproducing the 1330Z takeseat corpus exactly; collapsed endpoint `cf22937b8` comes from the coordinator's re-baseline whose corpora live only in /tmp (not committed). This arm re-reproduces BOTH endpoints with the same frozen instrument before bisecting: a failed endpoint reproduction is an instrument/base problem, NOT a flip, and stops the bisect.

## Replay instrument (frozen)

- Driver: `scripts/doorwalk-b-driver-20261107.js`, BASELINE leg only (`POLICY=baseline`: `TAKESEAT_B=1`, `DOORWALK_B` unset — sits happen, doors never walked). The collapse shows in the baseline leg (1430Z: baseline==armed exactly on the collapsed tip), so the armed leg is not run.
- The driver + `scripts/policies/competent-doorwalk-b.js` do not exist at candidate SHAs (created by the 1430Z doorwalk arm, landed later). Fixed copies from this branch tip are placed in the worktree UNTRACKED for sweeps (they survive `git checkout <sha>`; they are deleted before returning to the branch tip, so they are never committed). All other instrument files are the in-tree versions at the candidate SHA — verified byte-identical across the range (C above).
- Invocation per SHA: `DAYS=150 SEEDS=53001..53008 RUN=doorwalk-baseline POLICY=baseline OUTDIR=/tmp/bisect-frozenband/<sha>/ node scripts/doorwalk-b-driver-20261107.js` (OUTDIR in /tmp: corpora are bisect working data, not committed evidence; the flip table + mechanism quotes go in the evidence file).
- Analyzer: `scripts/analyze-frozenband-bisect-20261107.js` (new, committed) — reads two OUTDIRs, prints the per-seed flip table (days, endReason, seat/sat day, standing, maxWave, wave-4 kills, deaths) + median + sits. Proof: `scripts/test-frozenband-bisect-20261107.js` (analyzer on fixture JSONs + flip classification + A/A smoke).

## Seeds, horizon, policy

- **Seeds:** 53001–53008, FROZEN, deliberately reused — already named in the 1430Z prereg. NO new seeds; no fresh band is assigned by this arm.
- **Horizon:** 150d, death-aware (`runDays` stops on village death / win, +10d tail max). Matches both endpoints; reachability question (wave 4–5, table, sits).
- **Policy:** doorwalk baseline leg (takeseat substrate + sit drive, door drive off). One leg per sweep; seeds sequential in one process per the driver.

## Healthy-endpoint reference (doorwalk baseline leg, base 62ca38845 — sim-doorwalk-b.md per-seed table)

| Seed | Days | End | Standing | Max wave | Seat | Sat |
|------|------|-----|----------|----------|------|-----|
| 53001 | 150 | survived | 175 | 4 | none | — |
| 53002 | 79 | village-lost | 125 | 4 | none | — |
| 53003 | 150 | survived | 344 | 5 | lesser | d90 |
| 53004 | 150 | survived | 260 | 5 | lesser | d94 |
| 53005 | 97 | lost | 230 | 5 | lesser | d90 |
| 53006 | 150 | survived | 834 | 4 | lesser | d93 |
| 53007 | 86 | village-lost | 99 | 3 | none | — |
| 53008 | 150 | survived | 199 | 4 | lesser | d90 |

Median 150d, sits 5/8, lesser 5/8, wins 0/8 (baseline leg never walks a door).

## Collapsed-endpoint reference (1430Z coordinator re-baseline, cf22937b8 — /tmp corpora, not committed)

Villages die 54–92d, median ~70d, sits 0/8, wins 0/8; lesser 4/8 (53004/53005/53006/53008); 53004/53005/53006 die before the day-90 floor; 53008 lives to d92, seat earned d55, 2 preview-ready days, never sits (8× "not-ready: Finish the current encounter").

## Bisect order (binary search over the 3 game-code landings)

1. **Stage 0 — smoke:** 1 seed (53001) at L0, instrument check only (driver runs, JSON written, 0 instrument errors). Not judged.
2. **Endpoint reproduction:** full 8-seed baseline sweeps at L0 = `62ca38845` and L1 = `cf22937b8`, in that order. Both must reproduce their reference tables (L0: median 150d, sits 5/8; L1: median ≤90d, sits 0/8). If either fails → STOP, report instrument/base problem, do not bisect.
3. **Midpoint:** C2 = `50881fbf2` (xp-gear). If C2 is collapsed (median ≤90d AND sits ≤1/8) → the flip is in {C1, C2}: test C1 = `16369893c`. If C2 is healthy (median ≥120d AND sits ≥4/8) → the flip is in {C3} (or outside the game-code set): test C3 = `7943fd58a`.
4. **Attribution:** the flip is the interval between the last healthy game-code commit and the first collapsed one. The landing AT the collapsed end of the interval is the fingered landing.
5. **Fallback (all of C1/C2/C3 healthy while L1 collapsed):** test the scripts-only commits in order — `20d446e09` (linkraise add) first, then the proof-refresh pins — and re-examine base attribution (E). Verdict NO-GO with the narrowed set, not a guessed landing.

## GO bars (binding, §14)

- **GO (bisect):** the flip interval is identified AND the fingered landing is named with per-seed trajectory evidence pinning the mechanism — which seeds' death days moved, and what kills the villages now that did not kill them before (death causes / who dies / when, from `deathSays`, `fallen`, `killerTrack`, daily rows; one collapsed village's trajectory read in plain words in the evidence file).
- **Endpoint bars (instrument):** L0 median 150d + sits 5/8; L1 median ≤90d + sits 0/8. A miss on either is an instrument/base failure, not a bisect result.
- **Flip bars:** a commit counts as COLLAPSED only if median ≤90d AND sits ≤1/8; HEALTHY only if median ≥120d AND sits ≥4/8. Anything between is AMBIGUOUS — report it as such, run the adjacent commit, and do not force the attribution.
- **Proof bars:** `scripts/test-frozenband-bisect-20261107.js` green (analyzer + flip classification + A/A smoke); analyzer output attached to the evidence file as the flip table.

## Non-goals

- DIAG only: zero src/js changes. If the bisect fingers a fixable game change, document the fix shape with its own prereg sketch — do NOT build the fix in this arm.
- No balanced-panel compare (§15): the question is which historical landing moved survival, judged by the same frozen replay instrument that produced both endpoints. The panel compares lever before/after; here the driver IS the frozen instrument, and the endpoint reproductions are the validity check.
- No fresh band, no confirm sweep, no landing, no merge — report ready-to-merge; the coordinator lands it.

## Metric review (pre-registered note)

- The primary metric (median survival + sits on the frozen band) is the 1430Z collapse signature itself; no friendlier re-scoring is available — the flip bars above are the judge. If the collapse turns out to be a base-misattribution artifact (endpoints fail to reproduce), the metric is not wrong, the endpoints are — that is a NO-GO with cause, recorded here.
