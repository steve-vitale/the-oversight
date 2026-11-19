# sim-rageholder-survey-b — FROZEN prereg (Loop B 2130Z run, arm sim-rageholder-survey-b)

**Frozen:** 2026-11-19 ~22:00 UTC, BEFORE any survey sim. Base master
`5e38f3f7b` (sim-scale-onramp-round-1815 adoption closeout: bowcraft
CONFIRM GO + turn-on, fusioncell fix NO-GO reverted, slingstone
DIAG-NO-GO). Branch `sim-rageholder-survey-b`, rebased onto
`5e38f3f7b` before freezing (branch was at `2ea70f298`, an ancestor
of master; rebase is a fast-forward, no commits replayed).
**Instrument anchor:** `d2ead8d9d` (survey driver + analyzer + proof
test). **Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 first 12 `150229eda010` — NOTE: the policy file changed since
launchfunnel-b's frozen sha (`729af71ccddd`); bowcraft turn-on and
the 1815Z adoption landed in between. This survey uses the CURRENT
file verbatim on all 32 seeds; the change is recorded here rather
than silently carried. Holder rates are this tip's, not launchfunnel's.
**Diagnostic:** survey-only — ZERO `src/js` game-code changes. The
instrument is a new driver + analyzer in `scripts/` (pure reads of
the fight record `rec` + the full fight log, the laterage recorder
verbatim apart from arm/mode/output naming); the game is untouched.
No game-code fix is built by this arm; if the survey designates a
band, the laterage re-run is the next arm's work.

## The question (finding #2614)

sim-laterage-b NO-GO'd METRIC-BROKEN: its band (106111–106118)
produced **1 observable Rage fight** (floor 8) in 127 wave-4+
encounters. The taxonomy instrument works (0 unclassified, 0
anomalies on the fight that exists) but a 1-fight taxonomy cannot
carry a fire-round distribution or a dominant-cause call. The
starvation is upstream of the firing gate: only **3 holder-fights
in 127 encounters, all on one seed (106113)** — 2 evades before
contact, 1 fight that fires R1. The laterage metric review names
the fix: "survey bands by `holdsRage` rate and run the taxonomy
where holders actually fight." Finding #2614 is this arm's
question. This arm IS that survey: screen 4 fresh bands, rank by
measured holder-fight rate, and publish the holder-rich band as
the designated band for the laterage re-run. The survey does NOT
re-run the laterage diagnostic.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-19/sim-laterage-b.md` + prereg — the NO-GO
  METRIC-BROKEN verdict, the 3-in-127 holder count (all on
  106113), the Diana d76 fight (fires R1 at 35 HP, 0/3 doubled,
  vFlee at 2 HP), the standing-199 stall (5/8), and the metric
  review (§6) that orders this survey.
- `evidence/2026-11-19/sim-launchfunnel-b.md` + prereg — the
  survey design to mirror (4 bands × 8 seeds, ~15 min, frozen
  ranking, GO bar calibrated to the re-run's floor) and its
  lessons: launch/holder richness is lumpy (carried by 1–2 seeds
  per band), event counts vs instance counts must not be mixed,
  and the survey substrate must match the re-run's (see below).
- Finding #2614 in the goal `hidden_files/sim-findings.md` and
  finding #2616 (survey-designated band's rate does not transfer
  to a different substrate — the partysurvive re-run measured 9
  launches / 2 quads where launchfunnel-b designated 17 / 9,
  because ALLYSLOT3 was ported for the re-run but not the survey).

## Band freshness (verified 2026-11-19, before freezing)

**Seeds: 106121–106128, 106131–106138, 106141–106148,
106151–106158 (4 bands × 8 = 32 seeds).**
Search scope (local_seed_band_freshness): (1) exact-seed greps
over all `evidence/*/sim-*-prereg.md` — 0 hits for all 32 seeds;
(2) range greps over all `evidence/**/*.md` — 0 hits; (3) greps
over `scripts/` — 0 hits; (4) greps over goal
`hidden_files/sim-findings.md` + `hidden_files/convergence-tracker.md`
— 0 hits; (5) filename search over `evidence/` + `scripts/` — no
file name contains any candidate seed; (6) re-run after the
rebase onto `5e38f3f7b` (Loop A round evidence) — still 0 hits in
preregs, dated `.md`, scripts, and goal hidden files. Every
apparent hit was adjudicated by hand: a broad grep over the whole
goal `hidden_files/` tree (incl. archived October evidence JSON)
returned 10 files, ALL false positives of the documented class —
pantry-kcal values (`"pantryFreshAfter": 106142`,
`"pantryFreshAfter": 106158`, `"pantryFreshAfter": 106126`,
`"pantryFreshAfter": 106123`, `"pantry": 106155` ×2 files) and
float fragments (`15.972067039106145`,
`14943.338831061334`, `220.00067081061366`,
`447.25771061221985` — the candidate digits appear inside a
decimal). None is a seed use. **Bands FRESH.**
Collisions recorded so the next worker does not repeat them:
105931–105938 dmgshape-b; 105941–105948; 106001–106008
freestrike-b / ragepreempt-b; 106051–106058, 106061–106068,
106071–106078, 106081–106088 launchfunnel-b; 106101 named in
sim-bowopen-a-prereg.md / sim-speargate-a-prereg.md; 104770–104777
fightcap-b; 106111–106118 laterage-b; 107001–107008,
107011–107018, 107021–107028 (slingstone-b + later Loop B arms).

## Substrate (env flags only — no port, no src change)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`,
**the laterage-b substrate exactly** — all five flags are landed
code on this tip (grep-verified on `5e38f3f7b`: SENSEEXPED ×5 in
`src/js/party-wiring.js`, FIGHTALLY2 ×17 in
`src/js/fieldFights.js`, Rage fire condition + Rage line +
nextN consumption ×1 each in `src/js/godpath.js`; the driver
asserts flags AND code presence and stops loudly on mismatch).
ALLYSLOT3 is DELIBERATELY NOT ported — finding #2616: the
laterage re-run will run the laterage substrate, which never
ported ALLYSLOT3 (laterage prereg: "the ALLYSLOT3 slot is NOT
ported"), so the survey must measure holder rate under that same
substrate or the designation will not transfer. The RAGEFREE /
FIELDCAPDMG carrier is NOT used (held-branch code, not on
master) and the FREESTRIKE ordering is NOT ported — real Rage
(`godpath.js` fieldAct) on master substrate. Zero `src/` lines
change in this arm by construction.

## Legs (one per band, recorder ON)

One leg per band, differing ONLY by SEEDS. No OFF leg (the
question is a rate screen, not a lever — there is nothing to turn
off) and no REC leg (D1 repeatability is proven for this copy at
30d by the proof test; the recorder is the laterage wrap verbatim,
proven by that arm). A band's 8 seeds run sequentially in one
driver invocation. Horizon 150d, death-aware (dead villages stop,
+10d tail max) — 150d because a holder-rich band must show
holders across the wave-4 window, not one lucky early fight;
death-aware because a band that loses villages early cannot host
a re-run.

## Instrument (the laterage recorder, renamed — not rebuilt)

- `scripts/rageholder-driver-b.js` — a copy of
  `scripts/laterage-driver-b.js` (the proven instrument). Deltas,
  all recorded here: (1) arm/mode `rageholder-survey-b` /
  `rageholder` (corpus files self-describe mode/arm); (2) output
  evidence dir per band (`OUTDIR` env, e.g.
  `perseed-rageholder-survey-b-106121-106128`); (3) file names
  `rageholder-survey-b-s<seed>-<RUN>-rageholder.json`; (4) header
  comment reworded to the survey purpose. The fieldFight wrap,
  the wave ≥ 4 + uncapped-log recording, the wall fields, and the
  `writeRobust` flap-hardened write are unchanged. All wraps
  remain pure reads + driver-local writes; no game-state writes,
  no RNG.
- `scripts/analyze-rageholder-survey-b.js` — the survey ranker
  (new). Counts per band from the `v4encounters` rows (frozen
  definitions below), checks flag/log agreement on every
  rageFired row, computes the wall numbers (same `wallOf` as
  analyze-laterage-b.js), ranks, judges the frozen bars, writes
  `evidence/2026-11-19/rageholder-survey-b-survey.json`.
- `scripts/test-rageholder-survey-b.js` — proof (**16/16 green**
  in ~64s on `5e38f3f7b`, commit `d2ead8d9d`): analyzer
  `--selftest` 6/6 (incl. the laterage 127-encounter / 3-holder
  shape replayed exactly, the three mismatch kinds, ranking,
  wall, mislabel guard); a live 5d driver smoke on survey seed
  106121 (exit 0, 0 instrument errors, corpus self-describes
  mode/arm/substrate); mislabel guards (driver refuses wrong
  MODE; analyzer refuses the laterage corpus with CORPUS
  MISMATCH); D1 repeatability at 30d on seed 106121 (two runs,
  identical encounter + holder + fired counts; corpora deleted
  afterwards).

## Counting (frozen definitions)

- **Wave-4+ encounter:** a `v4encounters` row (the laterage
  recorder: `Game.fieldFight` wrapped, wave ≥ 4, `mdef.id`
  present). Same population as laterage-b — the re-run's pool is
  counted on the identical instrument.
- **Holder-fight (PRIMARY):** a wave-4+ encounter row with
  `holdsRage === true` — a Rage holder reaching a wave-4+ fight.
  **Same definition as laterage-b**, which counted 3 in 127
  INCLUDING 2 evades with rounds 0 ("evade before contact").
  Evades count here too: the fight was entered with a holder
  present. The contact subset (`holdsRage && rounds > 0`) is
  reported beside the primary on every band, so a band whose
  holders mostly evade cannot hide behind the primary.
- **Holder-fight rate:** holder-fights / encounters, per band.
- **Rage fight:** a row with `rageFired === true`. Must be a
  subset of holder-fights: a fired row without `holdsRage`, a
  fired row whose full log contains no Rage line ("eyes go red
  ... (Rage)"), or a Rage line on a row whose flag is false, is a
  **mismatch** (instrument failure, counted per band).
- **Ranking:** holder-fights desc, then holder-fight rate desc,
  then rage-fights desc, then median survival desc.

## Primary metric (frozen)

Holder-fights per 8-seed band (event count above), with
holder-fight rate as the co-primary, on the survey substrate.

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **Holder-rich band:** at least one screened band meets
   **≥ 8 holder-fights per 8 seeds.**
   Justification: 8 is laterage's pool floor carried one step
   upstream. Every Rage fight needs a holder-fight first
   (`rageFired ⊆ holdsRage` — the firing gate can only fire on a
   holder who is in the fight), so a band with < 8 holder-fights
   cannot yield 8 observable Rage fights for the re-run, whatever
   the firing gate does. The floor prices the re-run's need, not
   the survey's hopes: laterage's band managed 3, so 8 is a real
   bar, not a re-label of the observed rate.
2. **Instrument validity:** all files parse (8/8 per band), 0
   instrument errors on every file, proof test green + D1 green.
3. **Flag/log agreement:** 0 mismatches on all screened bands
   (every rageFired row holds Rage and carries a Rage line; no
   Rage line without the flag).
4. **Designation:** the best band (by the frozen ranking) is
   published as the designated band for the laterage re-run, with
   its seed range and per-seed holder map in the evidence file.

If no band meets bar 1, the verdict is **NO-GO** — report the
best band and its rate, do NOT lower the bar mid-run; the bar
question goes in "metric review".

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — per band.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote the holder-fight lines on the best band
(at least one holder fight end to end — the Rage line if it
fires, the evade/flee lines if it does not). Judge meaning,
coherence, consequences — never just counts. The evidence
carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **Holder-fights ≠ Rage fights.** The survey designates on
   the upstream pool. A band with 8+ holder-fights can still
   starve the re-run if its holders evade before contact (the
   laterage shape: 2 of 3 evaded) or never fire. The contact
   subset and the rage-fight count are reported beside the
   primary so the re-run's prereg can price its floor from the
   contact rate, not the headline rate — and the re-run
   re-verifies its pool on arrival, per its own prereg.
2. **Holder rate is substrate-sensitive** (finding #2616): the
   ranking holds under the laterage substrate. A band's rate
   under a different flag set may differ — the designation names
   the substrate it was measured under, and the re-run must use
   that substrate.
3. **Lumpiness** (launchfunnel-b lesson): a band's holder rate
   may ride on 1–2 seeds. The per-seed map is published with the
   designation; the re-run runs the full designated band and
   reports per-seed holder-fights alongside the total.
4. **No canon doc covers Rage-holder acquisition** (no doc in
   docs/CANON.md covers how a villager comes to hold Rage, or
   expedition destination picking). The counting is
   code-grounded (rec.holdsRage / rec.rageFired + the Rage log
   line), not canon-invented. Canon read: docs/CANON.md,
   docs/MONSTER-WAVES.md.

## Files

- Prereg: `evidence/2026-11-19/sim-rageholder-survey-b-prereg.md` (this file)
- Instrument: `scripts/rageholder-driver-b.js`,
  `scripts/analyze-rageholder-survey-b.js`,
  `scripts/test-rageholder-survey-b.js` (commit `d2ead8d9d`)
- Corpora: `evidence/2026-11-19/perseed-rageholder-survey-b-<band>/`
  (8 files each; band dirs named by seed range, e.g.
  `perseed-rageholder-survey-b-106121-106128`)
- Survey: `evidence/2026-11-19/rageholder-survey-b-survey.json`
- Evidence: `evidence/2026-11-19/sim-rageholder-survey-b.md`
- `src/` diff: 0 lines (DIAG survey, recorder wraps only).
