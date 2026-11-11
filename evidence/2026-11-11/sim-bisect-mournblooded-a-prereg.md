# Survival-collapse bisect, ARM B (the suspect) — pre-registration (arm sim-bisect-mournblooded-a)

Run fleshout-20261111T2317Z, Loop B, axis scale-onramp / winnability
chain (tracker 2030Z next blank 1). Written and committed BEFORE any
judged sim. Base: this worktree's branch `sim-bisect-mournblooded-a`,
pinned at `13e6f40ae` — the sim-mournblooded-b commit (hold beat
mourns the blooded, standing.js +140/−21). Verified at run start with
`git log --oneline -1`.

**Instrument-only arm — ZERO src/js changes.** This arm runs the
survival control ON the suspect commit to test whether it reproduces
the collapse. It changes no game code and builds nothing.

## The question

The survivalcontrol arm (evidence/2026-11-11/sim-survivalcontrol-b.md)
proved a MASTER_CHANGE: the same 8 seeds (190391–190398) that
survived 6/8 on the vetphantom fix leg (base 3f136f07e, anchor
7d93e418a) survive 1/8 on master d33ca69f9 (median 150d → 126d).
Coordinator archaeology shows the ONLY src/js change between the two
bases is 13e6f40ae — the mournblooded standing.js commit, this arm's
base. This arm runs the control on that commit. If it reproduces the
collapse, the suspect is implicated; if it does not, the suspect is
exonerated and the bisect reopens (the reconcile merge / dawn scorer
remain the other candidates named by survivalcontrol-b §8).

The suspect's own evidence (evidence/2026-11-11/sim-mournblooded-b.md)
never ran a sim band — wall numbers N/A — so this measurement is new.
The suspect commit touches only the hold/standing area: a new
`livingVeteranIds(w)` helper (the set behind the veteran count),
`_standingMournFallen` (a hold-beat eulogy line for a fallen veteran,
spoken only on positive death evidence), and the hold-beat hook for
defer4/defer5. It touches no count logic, no readiness gate, no win
price / deed gate — so a survival collapse from it would be a surprise
mechanism (e.g. a per-beat side effect), which is exactly what this
bisect step tests.

## Canon

docs/CANON.md read first. docs/MONSTER-WAVES.md design call #4
(combat readiness gates the standing unlock; VETERANS = living
roster members with a recorded wave-(w-1)+ kill in state.waveKillLog)
and Steve's 2026-11-10 scholar-counts ruling ground the veteran-bar
reads, same as vetphantom-b / survivalcontrol-b. No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on this
branch (base 13e6f40ae + instrument only)**, vs the vetphantom fix
leg's 6/8 (median 150d) and the survivalcontrol leg's 1/8 (median
126d, both on the same seeds).

| Outcome | Verdict |
|---|---|
| **≤2/8 survive** | **MOURNBLOODED IMPLICATED** — the suspect commit reproduces the survivalcontrol collapse (1/8) on identical seeds; the bisect narrows to standing.js |
| **≥5/8 survive** | **MOURNBLOODED EXONERATED** — the suspect does not reproduce the collapse; the bisect reopens (reconcile merge / dawn scorer). Report plainly; do NOT re-judge |
| **3–4/8 survive** | **INCONCLUSIVE** — a bigger band is owed before anyone blames or clears the suspect |

The analyzer (`scripts/bisect-mournblooded-analyze-20261111.js`)
judges this rule and exits 0 only when it can classify the outcome
under it (any of the three verdicts is a classified outcome; exit 1
only on instrument failure, corpus incompleteness, or an
unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) / 126d (survivalcontrol); death-cause shares — the
profile must stay ≥90% combat / expedition / wild; a cause shift
(e.g. starvation or sickness appearing) means the commit changed
more than survival; wave 4–5 unlocks; national / table / wins;
standing range; tribute-ready days; eulogy-line count (whether the
hold-beat eulogy line fires in the corpus and how often — context
for the mechanism arm, not a verdict input).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to both
  prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom and survivalcontrol.** A control / bisect re-runs the
  same seeds on different code; that is the point of a bisect, not a
  freshness violation. The seed-band freshness rule exists to stop
  re-using a band as if it were a fresh measurement; this arm
  explicitly re-uses it as a matched control and says so here, in
  the prereg, before any sim.
- **Policy: competent verbatim, SINGLE leg on this branch.** The
  vetphantom roster-check fix is already in this commit (marker
  `roster.indexOf(vid)` in the readiness `isLiving`, verified at run
  start at standing.js:233 and :283), so there is no pre-fix control
  variant to rebuild — the driver refuses to run unless the fix
  marker is present (leg guard, same as survivalcontrol-driver).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` reused
  unmodified (already at this base, byte-identical to master's
  copy — verified by diff at run start) + the driver's live shadow
  old-rule count per snapshot, exactly as survivalcontrol-driver.
  Driver: `scripts/bisect-mournblooded-driver-20261111.js` — a copy
  of survivalcontrol-driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-bisect-mournblooded-a/`, RUN =
  `bisect-mournblooded-pilot`, arm = `bisect-mournblooded`, mode
  fixed to `fix` only. Analyzer:
  `scripts/bisect-mournblooded-analyze-20261111.js`. Proof:
  `scripts/test-bisect-mournblooded-a.js`.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-mournblooded-a/` —
  8 per-seed JSONs; summary
  `evidence/2026-11-11/bisect-mournblooded-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg (old base) vs this bisect leg (suspect commit) vs the
survivalcontrol leg (current master) on identical seeds — the
analyzer's decision rule is the judge. Same standing as
tributedeliv-b §7 and survivalcontrol-b §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The survivalcontrol verdict (MASTER_CHANGE) is NOT re-judged
  here. Only the fresh 8-seed bisect leg on the suspect commit is
  judged here.
- An EXONERATED verdict does not clear the reconcile merge or the
  dawn scorer — it clears only this commit. Say so in the evidence.
- Telemetry deviation check (Loop B body step 10): attempted if
  the tool accepts the corpus; the tool refused recorder-corpus
  input on vetphantom-b and survivalcontrol-b. Recorded, not
  waived.
- No game-code change by this arm; no `[needs-eyes]` applies (no
  feel/combat/UI change — nothing for Steve to playtest).

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
