# sim-xphalf-b — prereg

**Arm:** sim-xphalf-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0013Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3), bisect follow-up · **Findings:** #1885 · **Branch:** sim-xphalf-b, rebased onto master `ba9859e13` (read in the main tree before any judged work) · **Prereg committed before any judged sweep.**

## The question

The frozen-band bisect (`evidence/2026-11-07/sim-frozenband-bisect-b.md`) partitioned the xp-gear collapse (`50881fbf2`) into two halves on band 53001–53008:

- **P1 — C2 minus the gear retune (XP/synergy/deed half only):** median **150d**, sits **4/8** — HEALTHY by the prereg bars — BUT per-seed wild: 53002 heals 79→150d, 53001 gains a seat (d92), 53006 restores (150d, sat d91) — while **53003 crashes to 45d, 53005 to 62d, 53007 to 55d**.
- **P2 — C1 plus the gear retune only:** median 76d, sits 2/8 — AMBIGUOUS, carries most of the median collapse.

**Question: what kills the three P1 early-death seeds (53003/53005/53007)?** Diagnose the early-death mechanism on all three and contrast against the five P1 survivors (which deaths, what causes, what was different — roster thinning, food, fights, sickness — and whether the mechanism is the same early-violent-death thinning the bisect named for C2, or something else).

## Corpus status (checked before this prereg)

`/tmp/bisect-frozenband/` **does not exist** (verified `ls`: no such directory). The bisect's P1 and C1 corpora are gone — they were working data in /tmp, never committed. This arm therefore **re-runs P1 fresh** with the bisect's exact P1 construction (below) and **re-runs C1 fresh** as the healthy contrast. This is a re-run of lost corpora, not a new design; the frozen band stays a diagnostic instrument, not a tuning target. No new seeds.

## P1 construction (exact — verified from the xp-gear diff, not assumed)

The gear retune in `50881fbf2` is **entirely** `src/data/items.json`: 38 `protection` lines changed (3→5, 5→8, 10→15, 15→23, 30→45, 40→60, 20→30, 35→53, 1→2, 2→3, plus matching `baseEffect` text). The C1→C2 diff over `src/js` + `src/data/tracks.json` contains **zero** `protection` hits. Everything else in the landing (tracks.json synergies; abilityActions/fieldFights/game/godpath/safetynets/skill-teaching/tracks.js XP/synergy/deed code) is the XP half.

- **P1 = checkout `50881fbf2` (C2), then restore `src/data/items.json` from `16369893c` (C1).** No other file moves.
- **C1 = checkout `16369893c`, no modification.**
- Instrument (frozen, exactly as the bisect): `scripts/doorwalk-b-driver-20261107.js` + `scripts/policies/competent-doorwalk-b.js` copied untracked from the branch tip (they do not exist at C1/C2); all other instrument files are the in-tree versions at the candidate SHA. Verified before this prereg: driver, doorwalk policy, `sim-harness.js`, `sitstep-instrument-20261107.js`, `competent-stageally-a`, `competent-rally-bankkiller-b` are **byte-identical** between the bisect tip `a2e005cbe` and current master `ba9859e13` (only `sweep-compare.js` moved, +16 lines, and the doorwalk driver never requires it). The instrument reproduces exactly.
- Invocation per sweep: `DAYS=150 SEEDS=53001..53008 RUN=doorwalk-baseline POLICY=baseline OUTDIR=/tmp/xphalf-p1/ node scripts/doorwalk-b-driver-20261107.js` (P1) and `OUTDIR=/tmp/xphalf-c1/` (C1). A construction marker file is written into each OUTDIR at sweep time (candidate SHA + items.json source SHA + driver anchor).
- Detached checkouts for sweeps only; commits always made on the branch tip. The untracked driver/policy copies are deleted before returning to the branch tip, so they are never committed.

## Seeds, horizon, policy

- **Seeds:** 53001–53008, FROZEN, deliberately reused — the bisect's band. NO new seeds.
- **Horizon:** 150d, death-aware (`runDays` stops on village death / win, +10d tail max). Same as the bisect.
- **Policy:** doorwalk baseline leg (`TAKESEAT_B=1`, `DOORWALK_B` off). One leg per sweep; seeds sequential in one process per the driver.

## Bisect P1 reference (the reproduction bar)

| Seed | P1 days (bisect) | P1 note |
|---|---|---|
| 53001 | 150 | gains a seat (d92) |
| 53002 | 150 | heals 79→150d |
| 53003 | **45** | early death |
| 53004 | 150 | (median arithmetic: 5 seeds at 150d) |
| 53005 | **62** | early death |
| 53006 | 150 | sat d91 |
| 53007 | **55** | early death |
| 53008 | 150 | (median arithmetic: 5 seeds at 150d) |

Median 150d, sits 4/8. The three early-death days (45/62/55) and the median/sits are the reproduction bar. The bisect did not publish 53004/53008 per-seed days for P1; a survivor-seed difference from 150d is disclosed, not hidden, and investigated before any diagnosis is trusted.

## C1 reference (healthy contrast, bisect)

Median 150d, sits 5/8; at C1 **no village loses anyone before d28** (bisect mechanism §1). Per-seed: 53001 150, 53002 79, 53003 150 sat d90, 53004 150 sat d94, 53005 97 sat d90, 53006 150 sat d93, 53007 86, 53008 150 sat d90.

## Mechanism classification (pre-registered — the judge)

For each of the three early-death seeds, the mechanism is classified from the corpus (`fallen` + `deathSays` + daily `living` trajectory + `waveKillLog`/`killerTrack` + `teleDeaths`):

- **Violent-thinning** (the bisect's C2 mechanism): the first three deaths are violent (monster / contest / betrayal / ambush / 'the wild' combat) AND the first death falls before d28 AND living drops below 8 by d30.
- **Attrition-after-thinning:** early violent deaths thin the roster, but the village's death day is set by a late cluster of starvation / thirst / sickness deaths (≥3 in the final 15 days).
- **Starvation-first / sickness-first / other:** the first death is starvation/thirst/sickness (not violent), or no violent death precedes the collapse — named as found, with victims/days/causes quoted.
- **Unclassified:** the corpus does not name the mechanism (missing/contradictory fields) — recorded as such, never guessed.

The contrast table covers, for all 8 P1 seeds: first-death day, deaths by d30, deaths by d60, cause mix (violent / starvation / thirst / sickness / wounds / 'the wild'), living at d30 and d60, fights and wave-4 kills to death day, and seat/standing. The diagnosis must name, per early-death seed, what the survivors did differently on the same fields (or state that no difference is visible).

One collapsed village's trajectory is read in plain words in the evidence file (sense-testing: read the `deathSays` lines, not just the counts).

## GO bars (binding, §14)

- **GO (diagnosis):** the mechanism is classified on **all 3** early-death seeds under the rule above AND the contrast table shows the survivors' difference on the same fields AND the P1 reproduction bar is met (three early-death days 45/62/55, median 150d, sits 4/8) AND the C1 reproduction bar is met (median 150d, sits 5/8, no death before d28).
- **Reproduction bars (instrument):** P1: three early seeds exactly 45/62/55d, median 150d, sits 4/8. C1: median 150d, sits 5/8, first death ≥ d28 on all seeds. A miss on either is an instrument/base problem, NOT a diagnosis — stop, report it, do not classify.
- **Proof bars:** `scripts/test-xphalf-20261107.js` green (analyzer on fixture JSONs: death census, living trajectory, first-divergence, mechanism classification incl. an unclassified case; A/A smoke on the C1 corpus).
- **NO-GO:** any early-death seed unclassified, or a reproduction bar missed, or the contrast table shows no visible difference and the mechanism is asserted anyway.

## Non-goals

- DIAG only: zero src/js changes. If the diagnosis fingers a fixable game change, document the fix shape with its own prereg sketch — do NOT build the fix in this arm.
- No balanced-panel compare (§15): the question is what kills three seeds in a frozen replay, judged by the same frozen instrument that produced the bisect's P1 numbers. The driver IS the frozen instrument; the endpoint reproductions are the validity check (same justification as the bisect).
- No fresh band, no confirm sweep, no landing, no merge — report ready-to-merge; the coordinator lands it.

## Metric review (pre-registered note)

- The primary metric (mechanism classified on all 3 early-death seeds + contrast) is a diagnosis, not a lever threshold; there is no friendlier re-scoring available — the classification rule above is the judge. If the P1 reproduction bar fails, the metric is not wrong, the construction/instrument is — that is a NO-GO with cause, recorded here.
- Known gap, disclosed up front: the bisect published only the three early-death days + median/sits for P1, not the full per-seed table; 53004/53008 P1 days are inferred (150d) from the median, not quoted. If the re-run puts either below 150d, the reproduction bar is re-examined in the evidence file's metric review before any diagnosis is trusted.
