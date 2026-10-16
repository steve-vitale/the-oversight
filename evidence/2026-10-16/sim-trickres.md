# sim-trickres — metric-revised CONFIRM of the landed counterwire layer (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop, run_id fleshout-20261016T1041Z (worker sim-trickres).
**Type:** MEASUREMENT arm (zero src/js, zero policy changes — scripts/ + evidence/2026-10-16/ only).
**Spec:** evidence/2026-10-16/sim-counterwire.md, "Metric review" section. The counterwire arm
landed 26 villagerTrickDefs + 15 field-AI actuable gates and measured 30 wave-3+ trick
executions in 8 pilot runs, but its pre-registered PRIMARY (counter-executed KILLS >0) was
misdesigned — the trick game's value is non-lethal resolutions (redactor starves out, focus
group leaves, suburb walked away from, eulogy dismisses you kindly), which a kill-only metric
scores as failures. This arm builds the resolution instrument the metric review prescribed
and runs the confirm.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the landed counterwire layer wires 26 villagerTrickDefs + 15 field-AI actuable
gates + TB-path kill attribution. Measured on the resolution metric (not the kill metric),
does the layer produce real trick resolutions — kills AND non-lethal outcomes the trick drove?

**PRIMARY (binding):** GO iff trick RESOLUTIONS >0 on the 16-run treatment sweep, where a
resolution = a fight vs a known-trick species ending in
(a) a trick-attributed kill with non-empty trickLog, OR
(b) mFlee/vFlee with >=2 trick actions in that fight's trickLog (the trick drove the outcome).
A miss is NO-GO, never re-scored mid-run.

**Resolution classifier** (scripts/trickres-classify-20261016.js, unit-tested in
scripts/test-trickres-20261016.js):
- FIELD fight: outcome 'vKill' + trickLog>=1 + waveKillLog join (same mid, ±1d, trick
  non-empty) → kill-resolution. 'vKill' + trickLog>=1 but no join → diagnostic
  "unattributed kill" (engine path that kills without stamping — NOT a resolution).
- FIELD fight: outcome 'mFlee'/'vFlee' + trickLog>=2 → flee-resolution (non-lethal).
  'mFlee'/'vFlee' + exactly 1 trick token → diagnostic "single-token flee" (offer_food,
  suburb leave, eater poison resolve on one action — EXCLUDED by the >=2 metric as written;
  reported separately, never re-scored into the GO).
- TB fight: per-mid performance logged + waveKillLog trick-attributed kill (same mid, ±1d)
  → kill-resolution. (No knownStart requirement on TB: checkMonsterCounter discovers on
  performance — discovery-on-performance is legitimate counterplay; knownStart recorded as
  diagnostic.)
- "Known-trick species": field path gates on known12||knownSig (engine-enforced —
  trickLog non-empty implies knownStart; the instrument asserts this). TB path: a
  performance logged implies the species bears a trick (counter def or villagerTrickDef).

**SECONDARY (directional, keep):** mean field deaths/run WITHIN wave-3+-reached runs,
treatment vs identical-seed control.

**Guardrails:** national >= control-2 · wave reach not worse · no new death mode ·
median survival report-only (pre-seat).

**Substrate:** pre-seat courtship — SEATDRIVE=0 explicit, FEASTSCALE_R13=1, TRIBFLOOR=1,
SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1, WINDEFER=1, NODEWITNESS=1 (the witness channel
feeds learnings). Policies: TF.leadfeast / TF.belongfeast (tribfloor courtship-road stack).
**Seeds:** 8 FRESH [981,982,983,984,985,986,987,988] x {leadfeast, belongfeast} = 16 runs/arm.
FRESH = 0 per-seed filename hits across evidence/ (verified 2026-10-16 before the run).
**Horizon:** 180d death-aware (wave-3 unlocks ~d40, wave-4 ~d76 on this substrate — dead
villages stop simulating, +10d tail max).
**Control:** base-commit archive af818ee2 (parent of 44de021d, the first counterwire
game-code commit) loaded via REPO= — identical seeds, identical policies, identical env;
only the layer differs. ~/workspace/base-archives/counterwire-base/.
**Gates before spend:** proof (classifier unit RED->GREEN + instrument honesty) · det-gate
(sweep instrument-vs-bare byte-identical on identical seeds) · SMOKE green on 20d run.
**Layer decomposition** (diagnostic, NOT re-scoring): legacy (w1/2 counter defs +
spool/chorus_line/buffering, present on base) vs counterwire-new (26 villagerTrickDefs
entries) vs TB-attribution (new channel — base tbEnd passes no trick detail, so TB
resolutions are 0 on control by construction).
**Per-seed JSONs:** evidence/2026-10-16/perseed-trickres/ (exact numeric keys
national/table/won/exiled + wins alias) · beats: evidence/2026-10-16/trickres-beats/ ·
sweep: scripts/sweep-trickres-20261016.js · analyzer: scripts/analyze-trickres-20261016.js.

## Results

Sweep: 32 runs (8 fresh seeds [981–988] x {leadfeast, belongfeast} x {treatment, control}),
180d death-aware, pre-seat courtship substrate. Proof 12/12 (classifier RED→GREEN, det-gate
byte-identical ×2 seeds, SMOKE green). Analyzer: scripts/analyze-trickres-20261016.js.

### PRIMARY: 131 resolutions on the 16-run treatment sweep → GO

| | treatment (16) | control (16) |
|---|---|---|
| resolutions | **131** (kills 69, non-lethal flees 62) | 43 (kills 0, non-lethal flees 43) |
| path | tb 68, field 63 | tb 0, field 43 |
| layer | counterwire-new 45, legacy 86 | counterwire-new 0, legacy 43 |
| single-token-flee diagnostics | 34 | 6 |
| unattributed kills | 0 | 0 |
| KNOWN-VIOLATIONS | 0 | 0 |

**The 45 counterwire-new resolutions** (the landed layer's distinctive value — all field/flee,
all non-lethal, the exact fiction the metric review named): redactor starve-out 30, eulogy
kind-dismissal 7, focus_group bore-out 7, terms_of_service loophole-dismissal 1. Zero on
control by construction (no defs, no gates on the base).

**The 68 TB-path trick-attributed kills** (the new attribution channel): hushwolf 11,
drumbelly_tanuki 10, giant_mosquito 6, cliffhanger 5, gallowdeer 5, paparazzo 4, alien_tick 3,
voice_mimic_radio 3, sanjun 3, warranty_caller 3, mirrormoth 2, union_rep 2, belltoad 2,
landlord 2, review_drone 2, mirror_stag 2, + 8 more. All legacy species — these kills
happened on control too, but were invisible to every metric (base tbEnd passes no trick
detail). The layer didn't create these kills; it made them countable.

**Legacy field resolutions**: treatment 18 vs control 43 (spool 11 vs 36, buffering 3 vs 2,
sanjun 2 vs 3, chorus_line 0 vs 1, hummice 1 vs 1, belltoad 1 vs 0). The control fights
spool more to flee-resolution; trajectories diverge (trick-aware morale + w3+ tricks change
who lives to fight what). Net is still +88 for treatment.

### Dismiss-beat audit (diagnostic, not re-scoring)
Of the 45 counterwire-new flee-resolutions, 32 carry the engine's own dismiss beat in the
fight log (starved out / bored out of the room / DISMISSED — the trick genuinely ended the
fight) and 13 do not (trick mid-execution when the villager fled: 2 contradicts then fled,
2 quiets then fled). The binding ≥2 metric counts all 45; the strictest honest reading
(32 clean non-lethal + 69 kills = 101) is still GO by two orders of magnitude.

### SECONDARY: field deaths/run within wave-3+-reached runs → down (directional)
Treatment 34.47 vs control 36.13 (15/16 pairs reached wave 3+ on both arms). The direction
the counterwire pilot hoped for, now measured — small, but the executions are real.

### Guardrails: all HOLD
- national: treatment 10/16 = control 10/16 (need ≥ 8) — HOLD.
- wave reach: max 5 = max 5 — HOLD.
- new death mode: none — HOLD. (The analyzer's first pass flagged "The Congregation" as
  treatment-only; investigation: it's a named-monster kill attribution (1 death), same class
  as control-only "The Callback"/"Big Big"/"The Reunion" (1 each). The analyzer now
  normalizes monster names to the combat mode; mode sets identical.)
- median survival (report-only): treatment 127d vs control 138d.

### Wall numbers (this substrate, pre-seat courtship)
national 10/16 · table 15/16 · wins 0/16 · wave-4 13/16 · wave-5 9/16 · median ~127–138d.
Consistent with the tracker's pre-seat wall (national 9–12/16, table 13/16, wins 0/16).

### Telemetry
`telemetry-check.js` vs scale-wall.json: 3 LOUD, all EXPLAINED — national 12→20 and table
16→30 are n-mismatch artifacts (32-file mixed glob vs 16-run baseline; per-arm 10/16 and
15/16 match the tracker's pre-seat wall); wins 16→0 is the substrate-mismatch class
(baseline = win-side stack; these runs are pre-seat by design; own control 0=0). Baseline
NOT rolled (coordinator's call).

## Sense-reads (SENSE-TESTING LAW — transcripts read, not just counts)

**Sense-read 1 — Owen vs the Redactor, day 63 (leadfeast s981, treatment).** The village
learned the counter on day 53 ("Go quiet — starve the redaction"). Ten days later Owen
meets one in the field: R1 "Owen goes quiet — no strikes, no shouts, nothing to redact.
(1/3)", R2 "(2/3)" — "Owen's quiet starves the redaction — the The Redactor's attacks come
thin. 32 → 16", "46 → 23" — R3 "(3/3)": "the Redactor starves — nothing left to redact. It
folds out of the fight. (Starved out.)" → mFlee. The fiction is exactly as promised: the
trick is legible round by round, the weakening is quantified, the resolution is narrated.
Verdict: PASS — meaning, coherence, consequence all present. (Cosmetic: "the The Redactor's"
doubled article — filed to sim-findings, not chased.)

**Sense-read 2 — James vs the Focus Group, day 70 (leadfeast s982, treatment).** R1 "James
is deliberately boring — recites bus schedules. The eye-heads droop. (1/3)", R2 "counts
ceiling tiles. A mouth-head yawns. (2/3)", R3 "describes paint drying, in detail. The murmur
thins. (3/3)": "the murmur drifts off — nobody is watching. They LEAVE. (Bored out of the
room.)" → mFlee. Undertale made legible: the counterplay is a performance (boredom as a
weapon), the monster's defeat is disinterest, not death. Verdict: PASS — the wackiest
counter in the set reads as comedy with stakes, not as a stat check.

**Counterpoint read — the goodbye that wasn't enough.** Across 16 treatment runs, villagers
spoke the callback farewell 16 times (Tariq, Elif, Jacob, Robin, Boris, Ruby, Valeria…):
"speak to the face — as THEM, the way they laughed — and says the goodbye properly. The
face loses coherence." Then fled anyway (vFlee, 1 token — correctly excluded from
resolutions). The beat is poignant and the exclusion is honest: the trick did its job
(face-shift bonus disabled) but didn't end the fight. The metric doesn't overclaim.

## Metric review (§14)

- **The revised metric worked.** The kill-only metric scored the counterwire pilot's 30
  executions as 0; the resolution metric scores this confirm's treatment at 131 (45 of them
  the non-lethal resolutions the old metric was blind to). The metric review's prescription
  is validated: measure what the tricks actually do.
- **The ≥2 bar is honest but loose.** 13/45 new flee-resolutions are mid-execution flees
  (2 quiets/2 contradicts, then fled) with no dismiss beat. The dismiss-beat audit (32/45
  clean) is the sharper instrument. PROPOSED for the next run: PRIMARY = resolutions with
  the engine's dismiss beat OR trick-attributed kill; keep the ≥2 definition as a reported
  secondary for comparability. No re-scoring of this run: GO stands on the pre-registered
  metric.
- **The (b)-style death-rate secondary stays underpowered but directional.** −1.66 deaths/run
  on a base of ~35 across 16 runs is suggestive, not conclusive. With 45 non-lethal
  resolutions, the per-resolution effect is small — the tricks buy survival at the margin,
  exactly as the counterwire pilot hypothesized ("the tricks buy survival, not damage").
- **No re-scoring:** GO stands on the pre-registered PRIMARY as written.

## Convergence state

scale-onramp: **converging** (measurement arm — the landed layer's value is now measured on
its own terms: 45 non-lethal trick resolutions + 68 newly-visible TB trick kills + field
death-rate down, all guardrails HOLD). The directive lift remains a Steve call per the
tracker; this run adds the trick game's measured value to the lift evidence but does not
itself lift.

## Blank-fill record

- FILLED (instrument): the resolution instrument the counterwire metric review prescribed —
  scripts/trickres-instrument-20261016.js (per-fight trickLog aggregation field+TB,
  seq-stamped tele capture, read-only; det-gate byte-identical), scripts/sweep-trickres-20261016.js
  (REPO= treatment-vs-control), scripts/analyze-trickres-20261016.js (waveKillLog-join
  classifier, layer decomposition, guardrails), scripts/test-trickres-20261016.js (12/12:
  classifier RED→GREEN on 12 synthetic arcs, det-gate ×2 seeds, SMOKE).
- FILLED (measurement): the confirm — PRIMARY GO (131 resolutions), SECONDARY down,
  guardrails HOLD, dismiss-beat audit, 2 sense-reads PASS.
- DOCUMENTED (not fixed — out of scope): doubled "the The Redactor's" article (filed to
  sim-findings); 13/45 new resolutions are mid-execution flees the ≥2 bar admits (metric
  review proposes the dismiss-beat refinement for the next run); eulogy's kind dismissal
  never completed in 16 runs (7/7 fled after ≤2 contradicts — the 3-contradict bar may be
  unreachable in live fights; named for the execution-window work).
- DOCUMENTED (substrate): control runs log "fatal: not a git repository" stderr noise — the
  base archive has no .git; harmless (sims complete, output valid).
