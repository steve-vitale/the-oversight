# Winnability-push funnel tracking (arm 3) — pre-registration

Committed BEFORE any judged after-panel run. Measurement only: zero
`src/js` changes, zero policy changes, zero default flips. New files
only: this prereg, the extension instrument
(`scripts/winfunnel-ext-instrument-20261103.js`), the driver
(`scripts/winfunnel-driver-20261103.js`, baseline driver + extension
instrument), the analyzer (`scripts/winfunnel-analyze-20261103.js`),
and the per-seed corpus + evidence. The baseline stage instrument,
driver policy, and analyzer chain logic are reused verbatim so the
after-numbers are comparable to the baseline on the same seeds.

## Baseline (already on file, NOT re-run)

`evidence/2026-11-03/sim-w5faced-competent-a.md`, 20-seed competent
corpus (`evidence/2026-11-03/perseed-w5faced-competent-a/`, RUN
`compdiag`, anchor 4daf2b73a-era master): wave-5 unlocked 1/20, faced
1/20, killed 0/20, national 0/20. The wall was the readiness-5 release
(armor 4 @P>=15, weapons 6 armed, 2 living veterans with wave-4+ kills;
the one release got veterans 0->1->2 on d92->d95).

## After panel (this arm)

- Seeds: the SAME 20 — 98901–98908, 98911–98922.
- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
  default env. Horizon: 180 days, death-aware. Mode string:
  `competent-w5faced` (unchanged, manifest-only).
- Code under test: current master at panel start, which includes arm 1
  (3688fa9bf, wild ally-join via live sensing helper) and arm 2
  (d8f334da8, field-fight damage + staying). Master tip is recorded at
  panel start AND panel end; if master moves mid-panel, the panel is
  re-run on the final tip so the after-numbers are clean — no mixing
  tips silently.
- Staging: seed 98901 runs first as the instrument check (errors must
  be 0 and extension fields sane); the remaining 19 follow only if it
  is clean. If the first seed's instrument is broken, NO further runs:
  the run reports the instrument failure loudly.

## Metrics (per seed and pooled, denominator = all 20 runs)

- Veterans banked: max over daily snapshots of readiness5.veterans
  (living roster members with a wave-4+ kill, per standing.js), plus
  end value. Pooled: seeds reaching >= 2 at any day.
- Readiness-5 releases: seeds with >= 1 daily snapshot where
  readiness5.ready is true; first such day reported. (Release is the
  gate event; unlock may follow via the standing ratchet.)
- Wave-5 unlocks (first day unlocked >= 5), facings (distinct kinds at
  end), fights (starts + fields), kills (TB-joined + field vKill) —
  same definitions as the baseline analyzer.
- National reached: national/global on ANY daily scale snapshot or at
  run end (context for arm 4). End-only rank also reported.
- Wild ally-join rate: field fights (extension rows) carrying >= 1
  ally (opts.allies / opts.allyVids) over all field fights, pooled and
  per seed; sensing-helper calls and hit rate reported alongside so a
  zero join rate can be told apart from a silent helper.
- Descriptive only: days, end reason, wins, table latch, wave-4
  unlocks, median survival. Gating freeze and perception law are NOT
  tested or changed here; a binding gate/price is reported as a
  finding for Steve.

## Complete when

1. All 20 seeds finish with `instrumentErrors` = 0 and every wrapper
   fire count reported alongside any zero cited for it.
2. Analyzer reproduces the per-seed chain for every seed, and the
   aggregate reports population rates (denominator = all runs) first,
   conditional rates labeled second.
3. Master tip at panel start equals master tip at panel end (or the
   panel was re-run clean on the final tip, with mid-panel commits
   named in evidence).
4. Before/after table is reported with the baseline numbers quoted
   from the baseline evidence file, not re-derived from a re-run.
