# sim-stock9762-b — PRE-REGISTRATION (written BEFORE any new sweep or name-level analysis, 2026-10-26)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1930Z, axis
food-economy. Measurement only: zero src/js changes, no default flips, no
throttle or garden redesign. The throttle-keying ruling itself is Steve's
call — this arm MEASURES, it does not decide it, and it changes no keying.

## Question (verbatim blank from sim-throttledays-b, out-of-arm observation)

"What 9762 stocks that the other seeds don't, since it is the one seed
where the throttle's drain reading and the village's real stockpile line
up." Seed 9762 is the exception on the gardenbar band: 99 engaged garden
resolutions, only 36 disagree (36.4%) at the >4 bar, median need-days
4.34, median freshKcal 89,967, median drain 42.5 — while every other seed
is 100% disagreement with median freshKcal 16k–45k (throttledays evidence:
9760: 30,297; 9761: 32,950; 9763: 16,196; 9764: 44,608; 9765: 24,250;
9766: 17,310; 9767: 38,522).

## Prior knowledge (what was known BEFORE this prereg — nothing more)

- The throttledays/gardenbar numbers above, from the brief and the
  committed evidence files (read before writing this prereg).
- A key-shape check of the committed corpora (no name-level
  decomposition computed): throttledays per-seed files carry
  throttleEvents.resolutions with freshKcal/totalKcal totals only, and
  gardenbar per-seed files carry inflows (door/name/kcal) plus garden
  snapshots — neither carries a per-item pantry composition snapshot.
  That absence is WHY this arm re-runs the band with a new recorder
  (below) instead of analyzing the committed corpora alone.
- No per-name, per-channel, or per-foodState breakdown of any seed's
  pantry has been computed before this prereg. The channel-by-name
  decomposition below is computed only AFTER this file exists.

## Band (identical to the gardenbar band, for comparability)

- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Seeds: 9760–9767 (8 seeds; this band IS the pilot — a decomposition,
  not a lever effect, so no confirm band is spent).
- Horizon: 100d, death-aware (run ends early if the village is lost;
  daysAlive reported per seed).

## Instrument (DIAG only, new files only)

- Reuses scripts/inflow-capture.js, scripts/garden-capture.js, and
  scripts/throttledays-capture.js UNCHANGED. The sibling files are NOT
  modified (throttledays-capture.js, stockdoor-capture.js,
  garden-capture.js, inflow-capture.js all stay byte-identical).
- NEW scripts/stock9762-capture.js, installed AFTER throttledays-capture
  (it wraps resolveOneAssignment a further time; it does not modify any
  existing capture). It reads state, delegates with identical arguments,
  `this`, and return value, and writes ONLY to the caller's arrays. No
  Game.state write, no RNG consumption, no say/log write. All reads are
  try/catch isolated; a throwing read yields null fields, never a game
  write.
- At entry to every garden resolution it records a pantry-composition
  snapshot (aggregated buckets, not raw items, to keep the corpus
  small): day, vid, throttle flag (cross-check vs garden-capture and
  throttledays flags), freshKcal (Game.pantryFreshKcal()), totalKcal,
  roster, and per-bucket {channel, freshKcal, nonFreshKcal,
  spoiledKcal, stacks} where:
  - channel = the pantry item's name verbatim (the stock door's name:
    'Foraged food', 'Game meat', 'Garden harvest', 'Fish catch',
    'Genesis fruit', 'Weregild', 'Hoarder's interest', 'Buried
    cache', ...; deposit/pantryAdd items keep their item name).
  - fresh vs nonFresh vs spoiled uses the SAME rule as
    pantryFreshKcal: nonFresh = foodState 'preserved'/'rendered' or
    foodKind 'pemmican'; spoiled = Game.isSpoiled(it) true (when the
    function exists); fresh = everything else counted by
    pantryFreshKcal. The snapshot's summed freshKcal MUST rebuild the
    recorder's pantryFreshKcal() value (cross-check, tolerance 0 —
    both sum the same items; any mismatch is reported, not hidden).
  - A bucket's foodState mix is NOT split further: the question is
    which stocking channel explains the fresh gap, and fresh is the
    throttle's numerator.
- The sweep's daily policy wrapper ALSO records one day-end composition
  snapshot per day (same bucket shape, via the capture's snapshot
  function) so the stockpile trajectory is visible, not just
  resolution-entry moments.
- NEW scripts/sweep-stock9762-b.js (same band/env assertions, same
  death/wall capture as sweep-throttledays-b.js, plus the new recorder
  and day-end snapshots), scripts/analyze-stock9762-b.js, and
  scripts/test-stock9762-b.js (proof). Corpus:
  evidence/2026-10-26/sim-stock9762-b-corpus/ (8 per-seed JSONs).
- Canon read: docs/CANON.md + docs/GARDENS.md + docs/PRESERVATION.md
  (ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d). Nothing invented.

## Control reproduction (fixed here, before judging)

The sweep reuses the gardenbar/throttledays instrument, so the
gardenbar trajectory MUST reproduce exactly: 761 garden resolutions,
750 engaged (98.6%), 11 NPC sows, 3,167 keeper turns, 32 beds,
235 player sows. If those counts reproduce exactly, the band is "the
gardenbar band, reproduced". If they differ, the band re-labels as "a
fresh 8-seed competent-nofeast 100d band", the diffs are reported, and
the decomposition verdict still stands on THIS band's engaged
resolutions — the reproduction miss is reported, not hidden, and never
used to re-score the GO bar. (The new recorder is read-only, so a
reproduction miss would itself be a loud finding about recorder
neutrality.)

## PRIMARY metric (judged ONLY against this)

Unit: garden resolutions with throttle flag true (engaged resolutions),
at resolution entry — the same moments whose freshKcal medians define
the 9762 gap. Day-end snapshots are secondary/context only and are NOT
part of the GO computation.

Per seed S and channel C:
- medFresh[S][C] = median of bucket C's freshKcal across S's engaged
  resolutions (0 when the bucket is absent from a resolution; the
  median is over ALL of S's engaged resolutions, not only ones where
  C appears — so a channel present on few days cannot win on a
  handful of big days).
- medFresh[S] = median of total freshKcal across S's engaged
  resolutions (must reproduce the throttledays medians up to rounding:
  9762 ≈ 89,967; the check is reported, not judged).

Gap definition (fixed here):
- totalGap = medFresh[9762] − median over the other 7 seeds of
  medFresh[S].
- channelGap[C] = medFresh[9762][C] − median over the other 7 seeds of
  medFresh[S][C].
- channelShare[C] = channelGap[C] / totalGap. (Medians do not sum
  exactly across channels; the residual — 1 minus the sum of all
  channel shares — is reported. A large residual is itself reported
  under "metric review", not used to re-score.)
- A channel is "present across the band" on 9762 iff BOTH: (a) it has
  freshKcal > 0 on >= 80% of 9762's engaged resolutions, AND (b) it
  has freshKcal > 0 on >= 50 distinct days among 9762's engaged
  resolutions. (This is the anti-single-day-spike leg: a one-day
  windfall cannot pass even if its median were large.)

GO (a measurement GO, not a design ruling) iff ALL of:
  1. Control reproduction exact (761/750/11/3167/32/235) OR, if not
     exact, the miss is reported and the band is re-labeled per the
     control section above — in that case this leg is NO-GO and the
     verdict is NO-GO (a fresh band cannot claim the gardenbar gap).
     NOTE: this leg is strict by design — see "metric review" if it
     ever binds.
  2. Snapshot rebuild: summed bucket freshKcal equals
     pantryFreshKcal() on >= 99% of engaged resolutions (mismatches
     listed, not hidden).
  3. There exists a channel C, or a named set of at most 3 channels
     each with channelShare >= 10%, such that the (combined) share
     is >= 50% of totalGap AND every channel in the set is "present
     across the band" on 9762 per the definition above.
A miss on ANY leg is NO-GO, never re-scored against a friendlier
decomposition (no switching to means, cumulative inflows, or day-end
snapshots to rescue a failed median leg). Metric doubts go under
"metric review" and propose the revision for the NEXT run.

## Secondary figures (reported, not judged)

- Mean-based decomposition (same channels, means instead of medians)
  for contrast only — reported, never judged.
- Cumulative inflow decomposition from the committed gardenbar inflows
  (door × name totals per seed) and from this run's own inflows, for
  contrast with the snapshot stock: inflows are flows, snapshots are
  stocks; a channel can dominate inflows yet not dominate the
  stockpile (draw/spoil), and vice versa. Reported, never judged.
- Day-end snapshot trajectory: per-seed median day-end freshKcal and
  per-channel medians, for contrast with resolution-entry medians.
- Per-channel presence table for 9762: share of engaged resolutions
  with freshKcal > 0, distinct days present, median when present.
- Preserved/rendered/pemmican (nonFresh) composition per seed: the
  fresh gap is the question, but if 9762's edge were preserved stock
  misread as fresh, that would show here — reported.
- Garden-harvest channel check: gardenbar found ripe == 0 on all
  800 seed-days, so 'Garden harvest' freshKcal is expected ~0 on all
  seeds; any non-zero value is reported as a loud surprise.
- Wall numbers for the band (band facts, not arm findings): national /
  table / wins, wave 4/5 reach, median survival, death-cause shares.
- Four-realm formation, Arc reach, trap acquisition, counter
  discovery/kill, young-link succession: reported ONLY if the corpus
  carries them; otherwise recorded as "not recorded in this corpus,
  not estimated" (never invented).

## Pilot gate

This 8-seed band IS the pilot. No confirm band is spent: this is a
decomposition of a known gap, not a lever effect to confirm.

## Sense (SENSE-TESTING LAW)

At least one 9762 pantry/garden sequence read in full (garden say-lines
+ the day's snapshot composition), judged for meaning: does villager
talk about plenty/scarcity match the measured stockpile that day?
Quoted with day, freshKcal, need-days, and the channel breakdown.

## Metric review

Every evidence file carries a "metric review" section (MEASUREMENT.md
section 14). If this metric proves wrong, the revision is proposed
there for the NEXT run — never re-scored mid-run.
