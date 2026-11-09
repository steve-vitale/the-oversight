# sim-radsource-a — scholar radiation-source attribution (instrument fix)

Run: fleshout-loop, Loop A, axis scale-onramp (instrument arm). Arm:
sim-radsource-a. Branch: sim-radsource-a. Base: 17777346b (worktree
HEAD at prereg time; the judged corpus was recorded by the radsnap arm
on base 91869f106 — see below). Prereg:
evidence/2026-11-09/sim-radsource-a-prereg.md (committed d376539a1
BEFORE any judged computation). Verdict: **GO**.

No `[needs-eyes]`: instrument-only fix, zero `src/js` changes, no feel /
combat / UI change. No cure behavior changed anywhere. No fresh sweep:
the judged corpus is the RECORDED radsnap corpus (see Prereg).

## The gap

Scholar `radiation_sickness` onsets arrive via
`contractDisease('radiation_sickness', {})` with NO source string —
the sole scholar contraction site is `src/js/feastBuff.js:389` (pellet
boost; verified by grep: no other scholar `contractDisease` call for
this id exists in `src/js/`). The sweep's `vectorForScholarSource`
mapped the source STRING only, so all 13 radiation onsets on the
radsnap band (all scholar, all s96301, d128–d150) landed as
`vector: 'unattributed'`, and the analyzer honestly reported them
unattributed under G4 (13/13). Filed as backlog 2026-11-09
(sim-radsnap-a findings).

Canon ground (docs/DISEASES.md, mundane-pool table, added 2026-11-09):
radiation's vector is "the pellet's invisible fire, taken in a boost at
a time — NOT a germ". The disease id itself is the source evidence:
there is exactly one vector, so attribution from the id is sound, not
a guess. No canon invented.

## What changed and why

Two layers, both in `scripts/` — the same rule in both, so they can
never disagree:

1. RECORDER — `scripts/sweep-feveranat-a.js`: new shared helper
   `vectorForDiseaseId(effectId)` returns `{ vector: "the pellet's
   invisible fire", evidence: ... }` for `radiation_sickness` and
   `null` for every other id. `vectorForScholarSource(src, effectId)`
   consults it FIRST, before the source map (the source is empty for
   this id, so the map can never answer). The `applyStatus`-direct
   mundane branch uses the same helper, so a radiation onset arriving
   without `contractDisease` is attributed the same way. No other id
   is touched by the rule; `vectorSource` keeps naming the observing
   wrapper (`contractDisease` / `applyStatus-direct`) in both paths.
2. ANALYZER — `scripts/analyze-feveranat-a.js`: in `finish()`, an
   episode whose `diseaseId` is `radiation_sickness` and whose RECORDED
   vector is missing / `'unattributed'` is re-derived to the pellet
   vector, with `vectorSource` marked `'disease-id (analyzer)'` and
   the evidence naming the re-derivation. A recorded vector is NEVER
   overridden. F3 counts + names the re-derived episodes (`disease-id
   re-derived=13 ...`), so a future recorder regression shows up as a
   nonzero count instead of being silently papered over. The
   corroboration label now reads "(source-string / disease-id
   evidence)". This layer is what fixes the RECORDED radsnap corpus on
   re-run; the recorder layer is what fixes future sweeps at record
   time. The rule is documented in the analyzer header alongside the
   other episode-join rules.

NOT changed: any `src/js` file, any cure behavior, any vector mapping
for any other disease, the snapshot/G3 rules, the same-tick synthesis
(radiation duty cures are still counted as captured cures with an
unrecorded onset — no onset exists to attribute).

## Before / after (analyzer re-run on the RECORDED radsnap corpus)

Corpus: `evidence/2026-11-09/radsnap-a-corpus/` (8 competent + 8 bare
+ summary; seeds 96301–96308, competent, 150d). The analyzer is pure
analysis (reads JSON, no game code), so the base drift between the
recording base and this base does not affect the re-run. Baseline run
captured pre-fix; post-fix run diffed against it (full diff in the
Metric review; the two outputs live only as the before/after
evidence quoted here — the corpus files themselves are untouched).

Baseline (pre-fix analyzer, reproduced — matches the radsnap evidence
exactly):

```
F3 VECTOR ATTRIBUTION: by vector={"tick":123,"unattributed":13,"wound":27,"unsafe food":6,"food":2,"dirty water":3,"raw food":1}
  attributed=162/175 unattributed=13
    UNATTRIBUTED seed=96301 scholar (scholar) radiation_sickness onset d128 via contractDisease — contractDisease source not in map:
    ... (13 lines, all scholar radiation_sickness, s96301 d128–d150)
  corroboration (NPC): wound 15/24; tick 72/123; gut-rot 0/0; scholar onsets by vector (source-string evidence)={"unattributed":13,"wound":3,"food":2,"dirty water":3}
G3 CORPUS: PASS — all legs valid (8 recorded + 8 bare; every onset accounted for; exempted un-snapshot-able: s96301 d128 + d150 bearer deaths)
G2 NEUTRALITY: PASS — recorded == bare on all 8 seeds
G4 CLASSIFICATION: 175 episode(s) on 8/8 seeds — 13 honestly unattributed (listed under F3 with the sensor gap named)
DIAGNOSIS VERDICT: COMPLETE — 175 episode(s) classified (162 attributed, 13 unattributed-with-gap-named)
```

After (post-fix analyzer, same recorded corpus):

```
F3 VECTOR ATTRIBUTION: by vector={"tick":123,"the pellet's invisible fire":13,"wound":27,"unsafe food":6,"food":2,"dirty water":3,"raw food":1}
  attributed=175/175 unattributed=0
  disease-id re-derived=13 episode(s) recorded unattributed, attributed from the disease id (radiation_sickness → the pellet's invisible fire)
  corroboration (NPC): wound 15/24; tick 72/123; gut-rot 0/0; scholar onsets by vector (source-string / disease-id evidence)={"the pellet's invisible fire":13,"wound":3,"food":2,"dirty water":3}
G3 CORPUS: PASS — (identical line)
G2 NEUTRALITY: PASS — (identical line)
G4 CLASSIFICATION: 175 episode(s) on 8/8 seeds — EVERY episode classified by vector + treatment + outcome
DIAGNOSIS VERDICT: COMPLETE — 175 episode(s) classified (175 attributed, 0 unattributed-with-gap-named)
```

The stdout diff between the two runs is confined to the F3/G4
attribution lines (F3 by-vector line, attributed/unattributed counts,
the 13 UNATTRIBUTED listing lines disappearing, the new re-derived
line, the scholar-by-vector line, the G4 line, the verdict line).
F1/F2/F4/F5/F6, G3, G2, and every NPC corroboration number are
byte-identical. The F3 map equals the prereg's exact map (key order
differs — first-seen order — the counts per vector are exact).

Second corpus check: the post-fix analyzer on the prefix corpus
(`radsnap-a-corpus-prefix`, pre-fix recorder, same 13 onsets) reports
the IDENTICAL F3 map (13 re-derived, unattributed 0) and G4 EVERY
classified — while G3 stays FAIL there with the same 9 unaccounted
snapshot-gap onsets. The vector fix does not paper over the snapshot
gap: G3 (snapshots) and G4 (vectors) stay separate, as designed.

## Proof test

`node scripts/test-radsource-a.js` — **7 passed, 0 failed**:

- L1 static: the id rule exists in both files at the right places,
  exact vector string in both; id rule consulted first; both
  wrappers pass/use it; analyzer re-derivation guard + F3 count line.
- L2 function leg (ACTUAL functions extracted from the sweep file,
  eval'd in one shared scope): radiation attributes from the id with
  empty/null/undefined/arbitrary source; the source map still answers
  for every other id (`the creek water` → `dirty water`,
  `a tick bite` → `tick (ambient)`, `a mosquito bite` →
  `mosquito (ambient)`, `a heatwave mosquito bite` →
  `mosquito (heatwave)`, `a cut gone wrong`/`a dirty cut` → `wound`,
  `a botched tick removal` → `tick-removal botch`,
  `the roasted deer` → `food`); empty/unknown source for a
  non-radiation id stays `unattributed` (control); the helper returns
  null for `disease`, `wound_fever`, `tick_attached`.
- L3 live game: the engine contracts radiation with `{}` on this
  base (premise holds); `seDef` pool/class unchanged (mundane /
  radiation).
- L4 judged corpus: post-fix analyzer on the recorded radsnap corpus
  — exact F3 map, 175/175 attributed, re-derived=13, no UNATTRIBUTED
  lines, G3 PASS, G2 PASS, G4 EVERY classified, verdict 175/0,
  scholar by-vector exact.
- L5 per-episode control (via exported `buildEpisodes`): the corpus
  files still carry 13 radiation onsets recorded `unattributed` (the
  fix is analyzer-side; the corpus is untouched), and for every
  NON-radiation disease the recorded onset vectors equal the built
  episode vectors — no non-radiation vector moved. Synthesized
  same-tick episodes (no onset) excluded.
- L6 prefix corpus: same F3 map + 13 re-derived; G3 still FAIL with
  the same 9 unaccounted onsets; G2 PASS.

Regression suites re-run green after the change (no other consumer of
the touched code moved):

- `node scripts/test-radsnap-a.js` — **13 passed, 0 failed**.
- `node scripts/test-feveranat-a.js` — **11 passed, 0 failed**
  (includes live `oneRun` runs through the modified sweep).
- `node scripts/test-poolcapture-bar-a.js` — **8 passed, 0 failed**
  (medicduty calibration re-read unchanged: capture 52.6%, treated
  35/135, sameTick 30).

Note: `node scripts/check.js --quick` was NOT run in this tree — the
brief forbids concurrent jest and a sibling worker may run it; the
proof test + the three regression suites above are the verification
for this instrument-only arm. The proof test must be re-run after any
rebase.

## Wall numbers (same recorded corpus — unchanged by construction)

national 0/8, table 0, wins 0, waveReach {1:8, 2:8, 3:8, 4:7, 5:2},
medianSurvival 120d, max 150d. No trajectory moved: the analyzer
re-run reads the same files.

## Village assessment (brief — instrument arm)

Nothing new about the villages: this arm only changes how the
instrument names what it already saw. What it now names is that the
s96301 pellet bearer took 13 boosts into radiation sickness across
d128–d150 — roughly every other day — and kept fighting through it.
The radiation cost is doing visible work in the wild, and the
instrument can now say so instead of reporting 13 honest unknowns.

## Metric review

- The GO bar was met exactly as written: 13/13 attributed with the
  pellet vector, the exact prereg F3 map (counts per vector; key order
  is first-seen and differs from the prereg's listing order, which is
  not a drift — the map is compared order-insensitively in L4), and
  the stdout diff confined to F3/G4 attribution lines. No metric was
  re-scored mid-run.
- The two-layer design stayed necessary, and neither layer proved
  redundant: the analyzer layer is what fixes the recorded corpus
  (the judged measurement), the recorder layer is what fixes future
  sweeps (proven by L2/L3 + the live oneRun regression in
  test-feveranat-a). If only the analyzer layer had landed, every
  future sweep would keep recording radiation as unattributed and
  leaning on the re-derivation; if only the recorder layer had
  landed, the recorded radsnap corpus would still report 13
  unattributed on re-run. The F3 re-derived count line exists so the
  analyzer layer's use stays visible: on a fresh sweep under the
  fixed recorder it must read 0.
- One judgment call worth recording: the analyzer re-derivation could
  mask a future recorder regression if nobody watched the count.
  That is why the count is printed in F3 (not silent) and why L4
  asserts `re-derived=13` on THIS corpus — on a future fixed-recorder
  corpus the same leg shape should assert `re-derived=0`. A future
  arm that re-sweeps this band should add that assertion rather than
  re-using the 13.
- No fresh sweep was run, by prereg design: the judged corpus is the
  recorded one, and the recorder change cannot alter recorded data.
  A fresh sweep would re-record the same 13 onsets with the vector
  baked in at record time — worth doing if the band is ever re-swept
  for another reason, as a live end-to-end confirmation of the
  recorder layer (currently proven by the extracted-function leg + the
  live oneRun regression, not by a radiation onset flowing through
  the installed wrapper — the wrapper is installed inside `oneRun`
  and radiation only fires at d128+ on one seed, so no cheap live
  leg exists).

## Findings for the backlog

- `sweep-sicknessdiag-b.js` carries the same `vectorForScholarSource`
  shape and the same gap (its contractDisease wrapper also maps the
  source string only), so its scholar radiation onsets are likewise
  unattributed. The identical id rule (`vectorForDiseaseId`) applies
  there; this arm left it alone because its GO bar is measured on
  the feveranat corpus only. Appended to
  `hidden_files/sim-findings.md` as `[open]`.
