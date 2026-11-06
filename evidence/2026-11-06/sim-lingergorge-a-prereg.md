# sim-lingergorge-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-lingergorge-a (Loop A, food-economy / narration).
Run: fleshout-20261106T0821Z. Coordinator claim:
`hidden_files/lever-claims/fleshout-20261106T0821Z.json`
(axis food-economy, arm sim-lingergorge-a).
Assignment: BUILD the lingerer-gorge gate/relay decision — the
nightly 🌙 gorge line still fires in stranded sleep windows and is
not in any family the enddaybeats fix touched.
Base HEAD at prereg time: b5fb49607 (worktree sim-lingergorge-a).

No single canon doc covers endDay position-blind narration; the
design lives in evidence/2026-11-05/sim-gossipcensus-a.md,
evidence/2026-11-05/sim-enddaybeats-a.md (+ prereg), and
evidence/2026-11-05/sim-enddaybeats-fix-a.md (+ prereg). CANON.md
was read first; no canon is invented here. The enddaybeats fix
(477fa724d, landed master) is IN this base — this arm follows its
pattern and does not re-litigate it. Sibling arm
sim-awaynaming-rereg-a owns the relay internals; this arm does NOT
touch relay internals. It only ADDS one caller to sayHavenNews (the
public relay entry point the tale already uses) and gates two say
calls in havenGrowth.js.

## The question, precisely

After the fix, does the nightly lingerer-gorge 🌙 line still fire
inside a stranded scholar's sleep window, at what rate vs the
before-leg rate on identical seeds, do the stranded-window hits
that remain (if any) read wrong — and does the one-time drift-off
line (the gorge ending) still reach the scholar honestly on return?

## Census facts (carried, not re-measured here — re-run on the fresh band below)

Enddaybeats-fix-a enumeration (§7, 40-seed panel 46001–46040,
BEFORE and AFTER legs): the nightly lingerer-gorge 🌙 line fires
in stranded windows, 6 lines on BOTH legs, seed 46014, loop-days
59–60 — three lingering raiders each night (The Redactor, The Big
Beast, The Eater), the scholar stranded at forest_floor (7,7),
out-of-reach. Verbatim, before leg (after leg identical — the line
was untouched by that fix):

- d59: "🌙 Night. The lingering The Redactor gorges at the treeline
  — 1,200 kcal gone from the stores. Endure it (they drift off
  within ~6 nights — the gorge is the price), or send a sortie:
  fighters, rations, real risk."
- d59: "🌙 Night. The lingering The Big Beast gorges at the treeline
  — 1,663 kcal gone from the stores. Endure it (they drift off
  within ~6 nights — the gorge is the price), or send a sortie:
  fighters, rations, real risk."
- d59: "🌙 Night. The lingering The Eater gorges at the treeline —
  950 kcal gone from the stores. Endure it (they drift off within
  ~6 nights — the gorge is the price), or send a sortie: fighters,
  rations, real risk."
- d60: same three raiders, 1,200 / 1,486 / 1,143 kcal.

The 46001–46040 corpus is STALE on current master and is NEVER a
baseline: this arm re-runs the census on the fresh band below, on
current master, before building anything. If the census does NOT
confirm the defect at/above background, the verdict is DIAG-NO-GO
and no fix is built.

## Code facts (read, not assumed — verified by grep on base b5fb49607)

- Site: `havenGrowthDaily` (src/js/havenGrowth.js ~205–262), runs
  from the progDaily wrap, i.e. every endDay. Per lingering raider
  (m.lingering, hp > 0, re-pinned to the Haven tile): drift clock
  (~6 nights, then `lingering = false` + the drift-off say);
  TABLE SANCTITY (`tableActive()` → continue, no gorge, no say);
  `take = round((500 + floor(R()*1000)) * overtime)`; `got =
  raidPillage(v, take)` (mechanics — the kcal loss); then the
  nightly say.
- NIGHTLY GORGE LINE, two variants, one say site each
  (havenGrowth.js:252 / :254):
  - got > 0: `🌙 Night. The lingering ${mn} gorges at the
    treeline — ${got} kcal gone from the stores. Endure it
    (they drift off within ~6 nights — the gorge is the price),
    or send a sortie: fighters, rations, real risk.`
  - got == 0 (empty-pantry re-voice, master r143): `🌙 Night.
    The lingering ${mn} circles the treeline, sniffing at empty
    stores — nothing left to take. Endure it (they drift off
    within ~6 nights), or send a sortie: fighters, rations,
    real risk.`
  Both are the same nightly report + the same sortie invitation,
  actionable only at Haven (a sortie is fighters + rations + real
  risk, launched from the Haven beats panel while the raider
  lingers). No other say site carries the nightly gorge line
  (the "You endure it." line at :834 is the player's endure-action
  response; "still hold the treeline — the gorge goes on" at :959
  is a sortie-resolution line — neither is the nightly report).
- DRIFT-OFF LINE (havenGrowth.js:229, once per lingerer, when the
  ~6-night clock expires): `🌙 The lingering ${mn0} paces the
  treeline one last night, then melts back into the dark. The
  gorge is over — the village outlasted it.` One-time news: the
  siege ending stays true on return.
- SORTIE OFFER STATE (havenGrowth.js:260): after the nightly say,
  `state.lastLingererOffer = { key: lingerKeyFor(m), name: mn,
  day }` is recorded. It is STATE, not narration — a grep of
  src/ finds NO reader of lastLingererOffer anywhere (the sortie
  buttons evidently aim another way; see Findings). The fix does
  NOT touch this recording: the offer is real whether or not the
  absent scholar hears the line, and the next night at Haven
  delivers a fresh gorge line while the siege continues.
- RELAY (game.js ~23081–23135, as the enddaybeats fix used it):
  `scholarAtHaven()` is the physical test (standing on the haven
  tile). `sayHavenNews(text, kind, mid)` says immediately iff at
  Haven, else queues in `state.pendingHavenNews` (cap 20, oldest
  dropped); `flushHavenNews` (called at the top of endDay,
  ~32699) delivers on a night spent at Haven. Kind 'raid' passes
  the flush filters unfiltered. NO RNG is consumed on either
  path: the line text is built the same way first.
- RNG: the nightly `take` draw (R()) and `raidPillage` run BEFORE
  the say on both paths, untouched. Gating the say consumes no
  RNG; relaying the drift-off line consumes no RNG. The
  before/after trajectories are therefore expected IDENTICAL
  (stronger than the parent arm, which carried a disclosed
  one-draw shift from the deferred gossip beat). Any divergence
  is a finding to investigate, not background.

## Fix direction per beat (pre-registered — the decision, with reason)

Two honest shapes only: GATE vs RELAY vs LEAVE. Suppression is
used ONLY for ephemeral lines; news is always relayed, never
suppressed.

| Beat | Direction | Reason |
|---|---|---|
| GORGE nightly (both variants) | GATE-suppress (no queue) | Ephemeral nightly report (that night's kcal) + a sortie invitation actionable only at Haven — the same split as the 🚨 raid call, which gated. RELAY is the wrong shape here: the line fires once per lingering raider per night (3/night observed), so a 6-night stranding would queue up to ~18 stale nightly reports into the shared 20-cap relay and evict real news — the exact failure mode that killed the gossipfix arm (12-entry cap dropping lines). On return, the next night's gorge line fires fresh if the siege continues. Mechanics untouched: raidPillage kcal take, drift clock, lastLingererOffer recording. |
| GORGE-DRIFTOFF (one-time) | RELAY via sayHavenNews, kind 'raid' | One-time news, stays true on return ("the gorge is over — the village outlasted it"); fires at most once per lingerer, so no queue flooding. Follows the "Nobody met" linger-line precedent (already relayed, kind 'raid'). Mechanics untouched. |

NOT touched, per this prereg: the endure-action response (:834),
the sortie-resolution line (:959), relay internals, the raid family
(already gated/relayed), tale/burst/settle/witness (controls),
moot/nightfall/direct-address (LEAVE — the parent arm's follow-up
items, not this arm's).

## Primary metric (per beat, sleep comparison)

Same window machinery as the parent arm (strandnarr-diag recorder
+ enddaybeats classification, reused verbatim; the gorge family is
classified by the NEW wrapper module
scripts/policies/lingergorge-diag.js, which adds ONLY the gorge
regexes on top of the judged instrument — no change to the parent
module): stranded night = a loop-day evening whose nighttravel
outcome is `travel-refused` or `out-of-reach` AND the scholar is
not inside Haven at daily exit. PRIMARY per beat K: stranded
sleep windows containing >= 1 K line / stranded sleep windows,
AFTER vs BEFORE on identical seeds, with verbatim quotes of every
residual stranded-window hit. Upkeep windows are a MECHANISM CHECK
only (expected 0 for every beat), never part of the verdict.

COUNTING RULE (adopted from the parent arm's metric review item
1, pre-registered here, not applied retroactively there): a hit
counts as stranded only if the scholar is still away at the hit's
FIRING-TIME position (recorded per hit by the classifier's
positionAt marker). A window spanning a mid-window return
(46022 d8 in the parent arm) scores its post-return hits as
return deliveries, not stranded hits. The strict window-label
count is stated alongside for comparability.

- POWER BAR (pre-registered, applied to EACH leg): >= 20 stranded
  sleep windows observed across >= 4 stranding seeds, in the
  BEFORE leg AND in the AFTER leg (pooled pilot + screen +
  extension if triggered). If either leg fails, the verdict for
  the affected beats is INSUFFICIENT-DATA, never re-scored.
- VERDICT RULE (pre-registered): GO per beat iff the after leg
  is powered AND the beat's stranded-sleep incidence is 0 windows
  (gorge, gorge-driftoff) AND the controls stay 0 (tale, burst,
  settle, witness; fragments/pantry re-measured as regression
  controls — the parent fix is in this base, so a non-zero
  before-leg there is substrate drift to report, not this arm's
  verdict) AND guardrail (i) passes AND the relayed drift-off
  delivery reads true in the sense test. A residual hit is NO-GO
  for that beat, quoted verbatim with the missed path named. The
  arm verdict is GO only if both beats are GO; otherwise it names
  the failing beats and stays open.
- GUARDRAILS (pre-registered):
  (i) NO SILENCING of non-stranded delivery. For the GATED beat
  (gorge): non-stranded sleep-window rate before vs after within
  ±3pp (the gate fires only while away, so non-stranded delivery
  is untouched by construction). For the RELAYED beat
  (gorge-driftoff): total per-beat line counts across the band
  before vs after within ±5% (relayed lines are still said, just
  later); any shortfall must be explained line by line. The
  driver records per-beat TOTAL line counts (all phases) in the
  per-seed summary (the parent arm's metric-review item 3 —
  total-count measurability — adopted here). Held-volume
  accounting: the driver records `pendingHavenNews` depth per
  evening (read-only); report max/mean depth per seed and the
  count of queued items never delivered at run end.
  (ii) DET-GATE: instrument ON vs OFF identical on seed 17021
  (before leg, driver proof) and on the fixed code (after leg,
  proof test). Any divergence = instrument contamination; stop.
  (iii) TRAJECTORY IDENTITY: daysAlive per seed before vs after
  reported; a narration-only change with no RNG on either path
  should leave trajectories IDENTICAL. Divergences are
  attributed, not hidden.
  (iv) NO gate/price/deed-RULE change: the fix touches only say
  calls (one say → sayHavenNews). The balanced-panel compare
  decision must be `no_material_signal`, or any signal is
  investigated and explained before landing.
- SENSE TEST (SENSE-TESTING LAW): every residual stranded-window
  hit is quoted verbatim with its full sleep window read; the
  relayed drift-off delivery on return is read (does the queued
  "gorge is over" line read true at the fire on return, or
  stale?); per beat: reads-true / gated / relayed-true /
  still-wrong.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (same substrate as the parent arm; dead
  villages stop simulating, so 60 is a cap, not a sentence).
- Policies: bankfood(warmed(woodcarry(nighttravel))) over
  competent, env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 WOODWARM=0
  BANKFOOD=1 STRANDNARR=1 (the parent arm's leg, verbatim).
- PILOT (8 seeds, judged first, before any confirm spend):
  49001–49008. Expected from the parent rate (~0.55 stranded
  windows/seed): ~4–5 stranded windows — the pilot is expected
  to MISS the power bar by construction and trigger the
  pre-registered screen below. The pilot is still judged (its
  incidence is reported, not hidden).
- SCREEN / CONFIRM (pre-registered, runs ONLY after the pilot):
  the same driver over 49009–49040 (32 fresh seeds). Every seed
  in the band runs, stranding or not, so the screen cannot inflate
  the rate by selection.
- EXTENSION RULE (pre-registered): if either leg's pooled
  pilot+screen stranded windows are < 20 (or < 4 stranding
  seeds), extend BOTH legs with 49041–49064 (24 fresh seeds,
  verified fresh below) and re-pool. No cherry-picking, no other
  seeds.
- SEQUENCING (pre-registered, because the fix changes the code
  the before leg runs on): (1) prereg commit; (2) instrument +
  driver commit (no src/js); (3) BEFORE pilot → judge baseline;
  (4) BEFORE screen; (5) BEFORE balanced panel; (6) implement fix
  → proof test green; (7) AFTER pilot → judge; (8) AFTER screen;
  (9) AFTER balanced panel; (10) panel compare + evidence. The
  before leg is fully spent before the fix exists; the after leg
  mirrors it seed for seed.
- BALANCED PANEL (§15): before/after comparisons run through
  `scripts/balance-panel.js` — the panel is the instrument, the
  pre-registered threshold is the judge. Panel invocation (both
  legs): `node scripts/balance-panel.js --out <panel-dir> --seeds
  49001,49002,49003,49004,49005,49006,49007,49008 --policies
  capable,risk-aware,socialite,winseek --days 60`, then
  `node scripts/balance-panel.js compare --before <before-panel>/
  panel.json.gz --after <after-panel>/panel.json.gz --out <prefix>`.
  The compare .md is attached to the evidence file. Decision must
  be `no_material_signal` (guardrail (iv)).

## Band freshness (verified BEFORE any judged sim)

Fresh band 49001–49040 (pilot + screen), extension 49041–49064.
Search scope and result (whole-token grep, run 2026-11-06
~08:30Z, via git grep over the worktree index + rg):

- ALL dated preregs (evidence/*/sim-*-prereg.md): ZERO 49xxx
  tokens in 49001–49064.
- ALL evidence .md (evidence/ --include='*.md'): the only
  in-band tokens are INCIDENTAL, none a seed-band naming:
  49007 is a substring of a commit hash
  (e685bbb033573254440c197a164e12a2649007f1) in
  sim-creekpath-b.md; 49016 is a pantry-kcal table value in
  sim-preservesched-b.md (a data column alongside 48120/49776).
  49065 occurs ×3 (sim-deferguard.md, journey-deepening-r22.md,
  docs/DECISIONS.md) — outside the band.
- sim-findings.md: ZERO tokens in 49001–49064.
- scripts/ + docs/: in-band tokens are INCIDENTAL: 49001 is a
  substring of the 6-digit seed 349001 in
  test-journey-establishment-r68-topiclabels.js; 49050 is a
  substring of a sha256 hash in scripts/phone-frame-proof.json.
  49000 occurs ×5 (test-depositgate-b*.js, test-drifter-round3.js)
  — outside the band, a kcal value.
- Forbidden-band lists (99201–99248, named in the 2026-11-04
  preregs sim-standacc-b, sim-diplo-b, sim-tendfloor-guard-b,
  sim-tendbelow-b): the band does not touch them.
- Filenames: no file anywhere in the worktree or the goal
  hidden_files carries a 49001–49064 token in its name.
- REJECTED candidates, verified used: 47001–47040 (sibling arm
  sim-spandraw-census-a's prereg, 2026-11-06, names 47001, 47008,
  47009, 47016, 47017, 47028 — found by the prereg check, which
  is why the check runs BEFORE the first judged sim); 48001–
  48064 (48045 is NAMED as a seed BAND in
  evidence/2026-11-01/sim-shelling-b.md line 85 — a band table
  row; the prereg-only check would have missed this, the
  all-evidence check caught it).
- OUT-OF-SCOPE note (per the parent arm's §10): whole-token
  49xxx values DO occur inside archived per-seed JSON corpora
  (goal hidden_files/) as measurement values (pantry kcal etc.);
  raw JSON corpora were never in scope, because any 5-digit band
  collides with some measurement value somewhere. No collision
  in scope; the band stands.

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood evening
records, morning records, first-upkeep kcal series, and daily-entry
scholar kcal must be identical. Any divergence = instrument
contamination; the run stops and the instrument is fixed first.
The driver adds the same read-only pendingHavenNews depth
observation as the parent arm's driver; the det-gate covers the
whole driver.

## Anchor reproduction (judged in the proof test, before the pilot)

- 17021 CURRENT-SUBSTRATE FACTS (re-pin, verify — do not
  assume): the anchor has drifted twice (gossipcensus re-pin: 57d
  village-lost, 0 stranded; enddaybeats-fix-a re-pin: 60d
  survived; test-only re-pin 14930f086: 52d village-lost). The
  proof test asserts the fix driver reproduces the 17021 facts
  AS FOUND on this base (recorded, not assumed) and asserts
  ON-vs-OFF identity. If the facts moved again, that is reported
  as a finding (substrate drift), not silently re-anchored.
- Known non-stranded sleep-window gossip hit: seed 15003 loop-day
  7 (strandnarr-a §2). The proof test asserts the driver captures
  a `Word gets around the haven` line inside the loop-day-7 sleep
  window on seed 15003, classified non-stranded sleep with the
  scholar inside Haven at fire time. If the exact loop-day does
  not reproduce, that is reported as a finding (substrate drift),
  not silently re-anchored.
- The census stranded hits are NOT proof anchors: the 46001–
  46040 corpus is stale on current master, so those trajectories
  may not reproduce. Stranded windows are established by the
  pilot+screen itself.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO /
INSUFFICIENT-DATA per the rules above, never re-scored against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file with a revision proposed for
the NEXT run. Every evidence file carries a "metric review"
section. The counting rule above (firing-time position) is the
parent arm's metric-review item 1, adopted here at prereg time —
it binds this run from the start.

## Wall numbers (carried, NOT re-measured)

This is a narration fix corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24.

## Deliverables

- evidence/2026-11-06/sim-lingergorge-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-06/sim-lingergorge-a.md (verdict per beat,
  rates with denominators, every stranded-window hit quoted
  verbatim, sense verdict per beat, metric review, "other"
  enumeration, panel compare attached)
- evidence/2026-11-06/sim-lingergorge-a-corpus/before/ and
  .../after/ (per-seed JSON: judged windows + every classified
  line + per-loop-day counts; stranded sleep windows kept in full
  transcript; pendingHavenNews depth series; per-beat total line
  counts)
- scripts/policies/lingergorge-diag.js (NEW wrapper module: gorge
  classifiers on top of the judged enddaybeats-diag — the parent
  module itself is NOT modified)
- scripts/lingergorge-trace-a.js (driver: the parent arm's driver
  with ONLY the disclosed changes — OUTDIR/prefix for the gorge
  corpus, gorge classification via the wrapper, per-beat total
  line counts in the summary)
- scripts/test-lingergorge-a.js (proof: unit classifiers +
  per-beat gate/relay unit scenarios + det-gate + anchors)
- src/js fix, one commit with [needs-eyes] (narration/feel):
  havenGrowth.js only (nightly gorge gate, drift-off relay).
  No relay-internal change, no gate/price/deed-rule change, no
  push, no bump, no live verification (coordinator merges; ship
  loop owns deploys).
