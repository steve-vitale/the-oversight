# Readiness-vs-ladder veteran phantom — pre-registration (arm sim-vetphantom-b)

Run fleshout-loop-b-20261111T1630Z, Loop B. Coverage Program Tier 2
veterans re-measure (Steve order 2026-11-10 11:11 CST "Measure all").
Written and committed BEFORE any judged band sim. Base commit
5157782a4 (local master; rebased from 965e8d04e at run start — no
conflicts, fix commit 5d16916f4 in ancestry on both).

**Fix-verification arm, no new src/js change by this arm.** The fix
already landed before this arm (journey-scale r131, commit 5d16916f4,
local master): one line in `src/js/standing.js`
`waveCombatReadiness.isLiving` — `if (roster.indexOf(vid) < 0) return
false;` — mirroring `ladder.js countLivingVeterans`. This arm VERIFIES
it with the named-next targeted fixture (already sensitivity-proven,
see below) and a fresh 8-seed control-vs-fix band. If the fixture or
the band fails, the verdict is NO-GO and the fix is re-opened — this
arm does not re-fix standing.js itself.

## Canon

- docs/CANON.md read first. **There is NO VETERANS.md in docs/** — no
  canon doc covers veterans as a system. The nearest canon is
  docs/MONSTER-WAVES.md § "Combat readiness gates the standing unlock"
  (design call #4, 2026-10-16): VETERANS = living roster members with a
  recorded kill of a wave-(w-1)+ monster in `state.waveKillLog`. Demand
  (sim starting points, not canon; Steve can overrule): wave 4 needs 1
  veteran (killed wave-3+); wave 5 needs 2 (killed wave-4+). Nothing is
  invented here; the code citations below are the source of truth.
- The defect (vetfirst-b, evidence/2026-11-11/sim-vetfirst-b.md §9,
  seed 190305): `waveCombatReadiness(4).veterans` = 1 while
  `_ladderLivingVeterans(4)` = 0 and the instrument's final snapshot =
  0, on the final day (d121) when the roster emptied. Mechanism read in
  code: `countLivingVeterans` (ladder.js) requires the killer to be ON
  the village roster before checking `vpOf(vid).dead`;
  `waveCombatReadiness` (standing.js) had no roster check — its
  `isLiving` returned true for anyone whose `vp` record exists and is
  not marked dead. The TB combat death path (`game.js tbVillagerFalls`)
  removes the villager from the roster but never sets `vp.dead` (unlike
  `removeVillager('killed'/'ambushed')`, "DEAD IS DEAD 2026-10-08"), so
  a TB-fallen veteran keeps a live-reading vp record. Phantom identified
  by elimination as Tama King (wave-3-only killer, died d121 in
  combat; readiness(5) correctly read 0, so the wave-4 killer Mireille
  Elenga's record was dead).
- The wider `tbVillagerFalls` vp.dead lie is NOT fixed by the r131 line
  (carried — it touches every vp.dead reader and needs a panel). This
  arm does not fix it either; the fixture documents the lie persisting
  (vp.dead still false the day after the fall) as a carried item.

## Fixture (sensitivity already proven, before the band)

`scripts/test-vetphantom-b.js` (43 assertions): a roster villager is
given a wave-3 (Tama shape) or wave-4 (Mireille shape) kill in
`state.waveKillLog`, then killed down the TB path
(`tbVillagerFalls`); all THREE counts — readiness, ladder, instrument
recomputation (`vetfirst-instrument-20261111.js livingVeterans`, the
same rule vetfirst-b used) — are read on the death day AND the day
after (one competent day via the shared harness). Plus a
`removeVillager` control, a no-undercount case (one fallen + one
living veteran), and the scholar-kill case (Steve RULED 2026-11-10:
scholar counts).

- On the FIXED tree: **43 passed, 0 failed.**
- On PRE-FIX standing.js (`git show 5d16916f4^:src/js/standing.js`,
  swapped in, run, fixed file restored): **34 passed, 9 failed, exit
  1** — the phantom reproduces exactly as vetfirst-b saw it
  (death day AND day after: r4=1 vs l3=0 vs i3=0; r5=1 vs l4=0 vs
  i4=0; one-fallen-one-living reads r4=2 vs 1/1). The fixture is
  sensitive to the defect and green on the fix. The fixed file was
  restored byte-identical afterwards (sha checked; tree clean apart
  from this arm's new files).

## Amendment 1 (before any analysis, after the control leg ran)

The GO row "Fix-leg bar agreement 8/8 (w4 + w5, end of run)" as
first worded — "readiness == ladder == instrument" — is imprecise
for the w4 bar: `waveCombatReadiness(4).veterans` counts wave-3+
killers while `_ladderLivingVeterans(4)` counts wave-4+ killers, so
comparing them directly is comparing two different bars (a living
wave-3-only veteran correctly reads ready4=1, ladder4=0 — exactly
what fix-leg seed 190391 shows). The corrected rule is the vetfirst
rule (`scripts/vetfirst-analyze-20261111.js` line 222, which judged
vetfirst-b 7/8): w4 bar = readiness(4) == instrument vetsW3;
w5 bar = readiness(5) == _ladderLivingVeterans(4) == instrument
vetsW4. The w4-bar ladder read, `_ladderLivingVeterans(3)`, is proven
live by the fixture (test-vetphantom-b.js reads it in every section,
43/43 on fixed code); the instrument's vetsW3 recomputes it by the
same rule. This corrects the comparison definition before analysis —
it is not a re-scoring of a judged miss. The analyzer was corrected
to match in the same change.

## Primary metric + GO threshold

Primary metric: **bar agreement** — readiness == ladder == instrument
on every seed's final snapshot (w4 bar: readiness(4) vs
_ladderLivingVeterans(4) vs instrument w3 count; w5 bar:
readiness(5) vs _ladderLivingVeterans(4) vs instrument w4 count),
plus zero phantom days on the fix leg (daily engine-vs-instrument
disagreement), plus no regression in wall numbers vs control.

GO (judged by `scripts/vetphantom-analyze-20261111.js`, exit 0):

| GO row | Bar |
|---|---|
| Fix-leg bar agreement, end of run | 8/8 seeds agree on w4 AND w5 |
| Zero phantom days on the fix leg | 0 daily disagreements, all seeds |
| Wins not below control | wins_fix >= wins_control |
| National reach not below control | national_fix >= national_control |
| Wave-5 unlocks not below control | wave5_fix >= wave5_control |
| Median survival within ±25% of control | ratio 0.75–1.25 |
| Instrument errors | 0 on all seeds, all legs |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14). Table/full-seat
reach is REPORTED (tribute ready/delivered, blooded) but is not a GO
row: vetfirst-b found the tribute never ready on 8/8, so 0-vs-0 at
this band size carries no regression signal.

Secondary (reported, not judged): phantom days on the control leg
(expected ≥1 seed, per vetfirst-b 1/8 and journey-scale r131's 20
phantom days on 1/4 seeds — if control shows 0, the band cannot
demonstrate the fix's effect and the fixture stands as the
reproduction evidence); shadow-prevented days on the fix leg (days the
old rule would have counted a phantom on the same trajectory).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: same as vetfirst-b for comparability; veterans form late
  (wave-3+ kills need wave 3 unlocked ~day 25+ plus standing) and the
  retention question needs the late game; sibling first-numbers pilots
  ran 150d with median survival 122.5–140d, so 150d captures the full
  village life.
- **Seeds: 190391–190398 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 19039[1-8]:
    zero hits.
  - Searched all dated evidence `.md` (recursive grep,
    `--include='*.md'`) for 19039[1-8]: zero hits.
  - Searched goal `hidden_files/` for 19039[1-8]: zero hits.
  - No perseed directory names any seed 190391–190398.
  - Named used bands avoided (all non-overlapping): vetfirst
    190301–190308, justice/dutyfirst 190311–190318, godpath
    190361–190368, fans 190371–190378, corruption 190381–190388.
  - NOTE: an unfiltered recursive grep over evidence/ (including
    .json corpora) matched digit runs inside long floats — the same
    false-positive class vetfirst-b documented (e.g. 555.190301…).
    The skill's .md scope is clean; JSON float matches do not reserve
    the band.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, pre-fix standing.js
    (5d16916f4 reverted), vetfirst instrument ON. The judged
    before-leg.
  - **fix:** competent verbatim, fixed standing.js (r131 line
    present), vetfirst instrument ON. The judged after-leg.
  - The driver (`scripts/vetphantom-driver-20261111.js`) REFUSES to
    run when the on-disk standing.js does not match the requested leg
    (ROSTER CHECK marker + sha256 recorded per seed), so a leg can
    never be mislabeled. No commit happens between legs.
  - NO neutral leg: the two legs are before/after, not instrument
    on/off; the instrument is identical on both legs, so any
    instrument effect cancels. Trajectories MAY diverge after the
    first phantom day (the fix changes gate reads) — that is the
    effect being measured, not contamination; the GO rows judge wall
    numbers, not exact trajectory equality.

## Instrument

Reused, not rewritten: `scripts/vetfirst-instrument-20261111.js`
(7 wraps + daily snapshot, proven by test-vetfirst-b.js 47/47 and
vetfirst-b 16/16 runs with 0 errors). The driver adds, per snapshot,
a live SHADOW old-rule count (distinct killers with wave-(w-1)+
kills whose vp record exists and is not dead, WITHOUT the roster
check) — the pre-fix rule on the same trajectory. On the fix leg,
shadow-minus-instrument is the phantom days the fix prevented.
Analyzer: `scripts/vetphantom-analyze-20261111.js` (triple
agreement, phantom days, shadow-prevented days, wall numbers, GO
rows, exit 1 on NO-GO). Proof: `scripts/test-vetphantom-b.js`
(43/43 green on fixed code, 34/43 + exit 1 on pre-fix code).

## Balanced panel (§15)

After the band: `node scripts/balance-panel.js --out
<before-panel> --n 8 --days 150 --policies competent` on the
pre-fix standing.js, the same on the fixed standing.js, then
`node scripts/balance-panel.js compare --before <before-panel
json.gz> --after <after-panel json.gz> --out <prefix>`; attach the
compare .md to the evidence file. The panel is the instrument, the
pre-registered threshold is the judge. If the panel cannot run in
the run window, record why and rely on the driver's identical-seed
control/fix legs as the before/after comparison (same seeds, same
instrument, same policy).

## Guards (reported, never verdict-flipping post-hoc)

- If the instrument changes any numeric field vs the recorder-free
  baseline, the arm is NO-GO on neutrality (vetfirst-b proved the
  instrument neutral 8/8 exact on this substrate; the instrument is
  unchanged here).
- If the engine's veteran-bar reads disagree with the instrument
  recomputation on any fix-leg seed, the arm is NO-GO on the bar
  check and the disagreement is the finding (never silently
  reconciled).
- Telemetry deviation check (Loop B body step 10):
  `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current '<per-seed-evidence-glob>' --metrics
  national,table,wins,exiled`. Any LOUD line is a same-run
  investigation item.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
