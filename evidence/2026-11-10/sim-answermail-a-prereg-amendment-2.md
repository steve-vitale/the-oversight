# sim-answermail-a — prereg amendment 2 (confirm band)

Committed BEFORE any confirm computation (the pilot is judged GO;
no confirm leg has run). Amends
evidence/2026-11-10/sim-answermail-a-prereg.md.

## Pilot result (for the record — the judged numbers live in the evidence file)

Pilot (band 99101-99108, 8 seeds/leg): primary 8/8 seasoned armed
vs 1/8 control (GO >= 5); cost bar PASS (starvation 0 armed vs 5
control, arm-only 0; median 130.5 vs bar 96.4); fidelity all pass
(accord 8/8, tends 41, renegotiation silences 0, instrument errors
0, reconciliation 202/202, unattributed 0). Verdict: pilot GO.
Confirm is owed per the prereg.

## Confirm band: 120101-120116 (16 seeds)

- Freshness check (local_seed_band_freshness skill): grepped every
  dated prereg under `evidence/` (`evidence/*/sim-*-prereg*.md`)
  and all dated evidence .md files for the 1201xx range — ZERO hits.
  The 1200xx hits found in the first search are float fragments
  (`freshDays 9.120001552585` in an orphan screen jsonl), not seeds;
  the 991xx/992xx/993xx/994xx/996xx/997xx/998xx ranges are all
  heavily used with scattered seeds, and 110001-110016 is the
  wallbase band. 120101-120116 is unused. Searched files: all
  `evidence/*/sim-*-prereg*.md` plus `evidence/**/*.md` for
  `1201[0-9][0-9]`.
- Confirm legs: `RUN=answermail-confirm-base POLICY=competent` and
  `RUN=answermail-confirm-armed POLICY=answermail`, same driver,
  same 150d death-aware horizon, same default env. Per-seed JSON to
  the same corpus dir (`evidence/2026-11-10/perseed-answermail-a/`,
  distinct RUN names, no overwrite). Analyzer + panel builder take
  the band from `SEEDS` env (16 seeds) and the runs from argv/env.
- Same GO bar, scaled to 16 seeds: primary seasoned >= 10/16
  (the pilot's 8/8 scaled proportionally from the 5/8 pilot bar:
  5/8 = 62.5% -> 10/16); cost bar unchanged in form (starvation
  armed <= control + 2 totals AND <= 2 arm-only; median armed >=
  0.8 x control median on the confirm band's own control leg).
  Fidelity gates unchanged (accord answers >= 16, tends > 0,
  renegotiation silences 0, instrument errors 0, unattributed 0).
- The confirm judges the same lever on fresh seeds; the pilot
  numbers stand as the pilot verdict and are not re-judged.
