# sim-gorgeharness-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-gorgeharness-a (Loop A, food-economy / narration).
Run: fleshout-20261106T1115Z. Axis: food-economy.
Assignment: lingerer-gorge follow-up with the REVISED metric, then
build the already-reasoned gate/relay fix (follow-up to arm
sim-lingergorge-a, run fleshout-20261106T0821Z).
Base HEAD at prereg time: cc4345e1e (worktree sim-gorgeharness-a;
main-tree HEAD is the same commit — the worktree IS current
master; b5fb49607, the 0821Z base, is an ancestor).

No single canon doc covers endDay position-blind narration or the
linger-gorge; docs/ was checked — no lingerer/gorge/haven-growth
doc exists. The design lives in evidence/2026-11-05/
sim-gossipcensus-a.md, sim-enddaybeats-a.md (+ prereg),
sim-enddaybeats-fix-a.md (+ prereg), and evidence/2026-11-06/
sim-lingergorge-a.md (+ prereg). CANON.md was read first; no canon
is invented here. The enddaybeats fix (477fa724d, landed master)
is IN this base — this arm follows its pattern and does not
re-litigate it. Sibling arm sim-awaynaming-rereg-a owns the relay
internals; this arm does NOT touch relay internals. It only calls
sayHavenNews (the public relay entry point the tale already uses)
for one line and gates two say calls in havenGrowth.js.

## The question, precisely

After the fix, are gorge lines still delivered while the scholar
is away from Haven — judged by FIRING-TIME position, any phase,
on any away night — at what rate vs the before-leg rate on
identical seeds, and do the at-Haven gorge lines still fire?

## Census facts (carried from sim-lingergorge-a, NOT re-measured here)

The 0821Z arm was DIAG-NO-GO on its stranded-sleep metric (0
gorge lines in 49 stranded sleep windows) but observed the real
defect outside that metric: 3 gorge lines reached scholars on
combat-blocked wild nights, delivered in the HARNESS phase the
morning after — outside any sleep window:

- s49003, night of d43 → morning of d44 (scholar at grove
  (4,8); d43 evening "blocked-combat", inside=false): TWO gorge
  lines in the same morning firing (The Redactor, 1,400 kcal;
  The Influencer, 730 kcal).
- s49014, night of d27 → morning of d28 (scholar at creek
  (4,8); d27 evening "blocked-combat", inside=false): ONE gorge
  line (the Grief Counselor).

Same defect class: a nightly haven report + an unanswerable
sortie invitation ("send a sortie: fighters, rations, real
risk") delivered to a scholar asleep in the wild who cannot see
the treeline and cannot launch a sortie. Before-leg totals on
that corpus (40 seeds, 49001–49040): 80 gorge lines, 69 fired
with the scholar at Haven, 11 with the scholar away by the
position marker — 8 on haven tiles (scholarAtHaven() true, NOT
the defect) and the 3 genuinely away above. Drift-off: 0 lines
in 40 seeds, all phases — the ~6-night clock never wins its
race on this substrate.

## Mechanism note — the wild-sleep morning-boundary endDay path

This is the channel the old metric could not see, and the
prereg records it before any judged sim:

- A hall-sleep night runs its endDay (progDaily →
  havenGrowthDaily → gorge) INSIDE sleep: the gorge line lands
  in the sleep phase, inside the sleep window.
- A wild-sleep night runs its endDay at the MORNING BOUNDARY,
  in the harness phase: the gorge line for that night lands the
  next morning, OUTSIDE the wild night's sleep window. The same
  loop-day can therefore carry BOTH a harness firing (the
  previous wild night's report) and a sleep firing (the current
  night's report) when the scholar returns (s49003 d44: 2
  harness + 2 sleep lines for the same two lingerers).
- A third firing site: the day-budget-exhaustion endDay can fire
  inside the DAILY phase, after the scholar has travelled during
  the day. A daily-start marker (the scholar's position at the
  START of the loop-day) is therefore STALE for a daily-phase
  firing — it can read Haven for a scholar who has since walked
  out, or wild for a scholar who has since walked home.

Consequence for the instrument: firing-time position must come
from a marker snapped IMMEDIATELY BEFORE each endDay call, not
from the nearest phase marker. This arm's driver wraps
Game.endDay (driver-side instrumentation only, no src/js change)
and snaps a `pre-endday` marker carrying
`atHaven: Game.scholarAtHaven()` at that moment. Every gorge /
drift-off line's firing-time position is the nearest pre-endday
marker at or before its idx. The old arm's marker-based
positionAt is kept as a CROSS-CHECK only (the two must agree on
atHaven for sleep/harness firings; any disagreement is a finding,
not silently resolved).

## Code facts (read, not assumed — verified by grep on base cc4345e1e)

- Site: `havenGrowthDaily` (src/js/havenGrowth.js ~203–262),
  runs from the progDaily wrap (havenGrowth.js:983–989), i.e.
  every endDay. Per lingering raider (m.lingering, hp > 0,
  re-pinned to the Haven tile): drift clock (~6 nights, then
  `lingering = false` + the drift-off say); TABLE SANCTITY
  (`tableActive()` → continue, no gorge, no say); `take =
  round((500 + floor(R()*1000)) * overtime)`; `got =
  raidPillage(v, take)` (mechanics — the kcal loss); then the
  nightly say. havenGrowthDaily is called ONLY via the progDaily
  wrap — every gorge/drift-off line fires inside an endDay call,
  so the pre-endday marker covers every firing.
- NIGHTLY GORGE LINE, two variants, one say site each
  (havenGrowth.js:252 / :254): got > 0 gorges line; got == 0
  circles/empty-stores line. Both are the same nightly report +
  the same sortie invitation, actionable only at Haven. No other
  say site carries the nightly gorge line (the "You endure it."
  line at :834 is the player's endure-action response; "still
  hold the treeline — the gorge goes on" at :959 is a
  sortie-resolution line — neither is the nightly report).
- DRIFT-OFF LINE (havenGrowth.js:229, once per lingerer, when
  the ~6-night clock expires): `🌙 The lingering ${mn0} paces
  the treeline one last night, then melts back into the dark.
  The gorge is over — the village outlasted it.` One-time news:
  the siege ending stays true on return.
- SORTIE OFFER STATE (havenGrowth.js:260): after the nightly
  say, `state.lastLingererOffer = { key, name, day }` is
  recorded. The fix does NOT touch this recording: the offer is
  real whether or not the absent scholar hears the line, and the
  next night at Haven delivers a fresh gorge line while the
  siege continues. (Secondary deliverable: verify by grep
  whether any reader exists, including outside src/js — see
  Deliverables.)
- RELAY (game.js ~23090–23135, as the enddaybeats fix used it):
  `scholarAtHaven()` is the physical test (location 'haven' OR
  standing on a haven tile). `sayHavenNews(text, kind, mid)`
  says immediately iff at Haven, else queues in
  `state.pendingHavenNews` (cap 20, oldest dropped);
  `flushHavenNews` (called at the top of endDay, ~32700)
  delivers on a night spent at Haven. Kind 'raid' passes the
  flush filters unfiltered. NO RNG is consumed on either path:
  the line text is built the same way first.
- RNG: the nightly `take` draw (R()) and `raidPillage` run
  BEFORE the say on both paths, untouched. Gating the say
  consumes no RNG; relaying the drift-off line consumes no RNG.
  The before/after trajectories are therefore expected
  IDENTICAL. Any divergence is a finding to investigate, not
  background.

## Fix direction per beat (pre-registered — already reasoned, no re-deciding)

Decisions from the lingergorge prereg, carried verbatim. Two
honest shapes only: GATE vs RELAY vs LEAVE. Suppression is used
ONLY for ephemeral lines; news is always relayed, never
suppressed.

| Beat | Direction | Reason |
|---|---|---|
| GORGE nightly (both variants) | GATE-suppress (no queue) | Ephemeral nightly report (that night's kcal) + a sortie invitation actionable only at Haven — the same split as the 🚨 raid call, which gated. RELAY is the wrong shape: the line fires once per lingering raider per night (3/night observed), so a 6-night stranding would queue up to ~18 stale nightly reports into the shared 20-cap relay and evict real news — the exact failure mode that killed the gossipfix arm. On return, the next night's gorge line fires fresh if the siege continues. Mechanics untouched: raidPillage kcal take, drift clock, lastLingererOffer recording. |
| GORGE-DRIFTOFF (one-time) | RELAY via sayHavenNews, kind 'raid' | One-time news, stays true on return ("the gorge is over — the village outlasted it"); fires at most once per lingerer, so no queue flooding. Follows the "Nobody met" linger-line precedent (already relayed, kind 'raid'). Mechanics untouched. |

DRIFT-OFF STAGING DECISION (lingergorge metric review item 4):
0 drift-off lines fired in 40 seeds on the old corpus — the
~6-night clock never wins its race on this substrate. This arm
does NOT stage the clock in the corpus. The proof test's B11
scenario (drift-off queues while away, delivers verbatim on
return) is the relay evidence, and the corpus judges ONLY the
gate. Corpus drift-off counts are reported, not judged.

NOT touched, per this prereg: the endure-action response (:834),
the sortie-resolution line (:959), relay internals, the raid
family (already gated/relayed), tale/burst/settle/witness
(controls), moot/nightfall/direct-address (LEAVE — the parent
arm's follow-up items, not this arm's).

## Primary metric (REVISED — from lingergorge metric review items 1–3)

PRIMARY: gorge lines delivered while scholarAtHaven() is FALSE
at FIRING TIME, ANY phase, on ANY away night (stranded +
combat-blocked + otherwise out). A hit counts iff the gorge
line's nearest pre-endday marker reports atHaven === false.
Both nightly variants count (got > 0 and empty-pantry). The
stranded-sleep window metric is RETIRED for this beat — it
missed the harness-phase channel by construction.

COUNTING RULES (bind this run):
- Firing-time position is the nearest `pre-endday` marker at or
  before the line's idx. The old marker-based positionAt is a
  cross-check: for every gorge hit, both readings are recorded;
  a disagreement is reported as a finding with the line quoted.
- A drift-off line queued while away and flushed on return
  counts as a HAVEN delivery (it is said at the fire, on
  return), never as an away delivery.
- A gorge line fired on haven tiles (scholarAtHaven() true, the
  scholar on Haven grounds but not "inside") is a Haven
  delivery, NOT the defect — the gate lets it through by
  design, and the guard counts it as Haven delivery.

OPPORTUNITY UNIT (metric review item 3 — a window bar alone
cannot confirm a rare beat): a LINGER-ENDDAY is one endDay
pass with >= 1 lingering raider present, measured by >= 1
gorge or drift-off line fired in that pass (grouped by the
pre-endday marker the lines belong to). Table-active passes
with lingerers present but no line are unobservable in the
transcript and excluded (table-active is endgame-only; none
expected in 60d competent runs — if one occurs it is reported).
An AWAY LINGER-ENDDAY is a linger-endDay whose pre-endday
marker reports atHaven === false.

POWER BAR (pre-registered, applied to the BEFORE leg): away
linger-endDays >= 2 AND total gorge lines (all positions) >= 20
across the band. Rationale: the old corpus had exactly 2 away
linger-endDays and 80 gorge lines; the bar requires the re-run
to reproduce at least that much opportunity before any GO is
claimed. If the before leg misses the bar, the verdict is
INSUFFICIENT-DATA, never re-scored.

DEFECT-REPRODUCTION PRECONDITION: GO additionally requires the
before leg to show >= 1 away-delivered gorge line. If the
before leg is powered but shows 0 away lines, the defect did
not reproduce on current master and the verdict is DIAG-NO-GO
(the fix is not corpus-judged; the unit proof is reported
separately).

VERDICT RULE (pre-registered): GO iff the before leg is powered
AND the defect reproduced (>= 1 away line) AND the after leg
shows 0 away-delivered gorge lines AND guardrail (i) passes
AND the det-gate holds AND the balanced-panel compare decision
is `no_material_signal` AND the B11 relay unit checks are green.
A residual away hit in the after leg is NO-GO for the gate,
quoted verbatim with the missed path named. The arm verdict is
GO only if the gate is GO; the relay is judged by B11 unit
evidence, not by the corpus.

GUARDRAILS (pre-registered):
(i) NO SILENCING of at-Haven delivery. After-leg at-Haven gorge
count >= 50% of the before-leg at-Haven gorge count — the gate
suppresses delivery away, not the gorge itself. Mechanics
guards (unit B9/B10): kcal still taken, offer still recorded,
linger still ends, away queues nothing for the nightly line.
Held-volume accounting: the driver records `pendingHavenNews`
depth per evening (read-only); report max/mean depth per seed
and the count of queued items never delivered at run end.
(ii) DET-GATE: instrument ON vs OFF identical on seed 17021
(before leg, driver proof) and on the fixed code (after leg,
proof test). Any divergence = instrument contamination; stop.
(iii) TRAJECTORY IDENTITY: daysAlive per seed before vs after
reported; a narration-only change with no RNG on either path
should leave trajectories IDENTICAL. Divergences are
attributed, not hidden.
(iv) NO gate/price/deed-RULE change: the fix touches only say
calls (two says gated on scholarAtHaven(), one say →
sayHavenNews). The balanced-panel compare decision must be
`no_material_signal`, or any signal is investigated and
explained before landing.
(v) REGRESSION ANCHORS: the 3 documented away deliveries
(s49003 d43→d44 grove, 2 lines; s49014 d27→d28 creek, 1 line)
must read 0 away deliveries on the after leg — IF reproduced
in the before leg. If the before leg does not reproduce them
(substrate drift), that is reported as a finding, not silently
re-anchored.

SENSE TEST (SENSE-TESTING LAW): every residual away hit is
quoted verbatim with its full firing context read; the relayed
drift-off delivery on return is read in the unit scenario (does
the queued "gorge is over" line read true at the fire on
return, or stale?); per beat: reads-true / gated /
relayed-true / still-wrong. A gated gorge must read true at the
fire and never invite a sortie from the wild.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (same substrate as the parent arm; dead
  villages stop simulating, so 60 is a cap, not a sentence).
- Policies: bankfood(warmed(woodcarry(nighttravel))) over
  competent, env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 WOODWARM=0
  BANKFOOD=1 STRANDNARR=1 (the parent arm's leg, verbatim).
- PILOT (8 seeds, judged first, before any confirm spend):
  49001–49008.
- SCREEN / CONFIRM (runs ONLY after the pilot): the same driver
  over 49009–49040 (32 fresh seeds). Every seed in the band
  runs, stranding or not, so the screen cannot inflate the rate
  by selection.
- EXTENSION RULE (pre-registered): if either leg's pooled
  pilot+screen misses the POWER BAR (away linger-endDays < 2
  or total gorge lines < 20), extend BOTH legs with 49041–49064
  (24 seeds, verified fresh by the 0821Z arm) and re-pool. No
  cherry-picking, no other seeds. The GO threshold then applies
  to the pooled judged seeds.
- SEQUENCING (pre-registered, because the fix changes the code
  the before leg runs on): (1) prereg commit; (2) instrument +
  driver + proof commit (no src/js); (3) proof baseline on
  unfixed code — expect 29/33 (the 4 red acceptance checks: B9
  gorge gate away, B10 empty-pantry gate away, B11 drift-off
  relay away ×2); (4) BEFORE pilot → judge baseline; (5)
  BEFORE screen; (6) BEFORE balanced panel; (7) implement fix →
  proof test green 33/33; (8) AFTER pilot → judge; (9) AFTER
  screen; (10) AFTER balanced panel; (11) panel compare +
  evidence. The before leg is fully spent before the fix exists;
  the after leg mirrors it seed for seed.
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
- SEED-BAND NOTE: 49001–49040 is DELIBERATE before/after reuse
  of the lingergorge judged band (named in
  sim-lingergorge-a-prereg.md), NOT a fresh-band claim. Reuse is
  intentional: the before/after comparison must run on the same
  seeds that produced the defect observation. No other live run
  uses this band (Loop B is on 53001–53008 / 58001–59001 per the
  assignment). Extension 49041–49064 was verified fresh by the
  0821Z arm (whole-token grep over all dated preregs + all
  evidence + sim-findings.md + scripts/ + docs/ + forbidden-band
  lists; two candidates rejected before it). The committed
  lingergorge before corpus
  (evidence/2026-11-06/sim-lingergorge-a-corpus/before/) is a
  CROSS-CHECK ONLY, never the judged before leg — master moved
  since the 0821Z corpus, so BOTH legs are re-run on current
  master.

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood evening
records, morning records, first-upkeep kcal series, and daily-entry
scholar kcal must be identical. Any divergence = instrument
contamination; the run stops and the instrument is fixed first.
The driver adds the same read-only pendingHavenNews depth
observation as the parent arm's driver, plus the read-only
pre-endday marker (a snapshot, no state edit); the det-gate
covers the whole driver.

## Anchor reproduction (judged in the proof test, before the pilot)

- 17021 CURRENT-SUBSTRATE FACTS (re-pin, verify — do not
  assume): the anchor has drifted three times (gossipcensus
  re-pin: 57d village-lost, 0 stranded; enddaybeats-fix-a
  re-pin: 60d survived; lingergorge re-pin on b5fb49607: 60d
  SURVIVED, 0 stranded). The proof test asserts the fix driver
  reproduces the 17021 facts AS FOUND on this base (recorded,
  not assumed) and asserts ON-vs-OFF identity. If the facts
  moved again, that is reported as a finding (substrate drift),
  not silently re-anchored.
- Known non-stranded sleep-window gossip hit: seed 15003 loop-day
  7 (strandnarr-a §2). The proof test asserts the driver captures
  a `Word gets around the haven` line inside the loop-day-7 sleep
  window on seed 15003, classified non-stranded sleep with the
  scholar inside Haven at fire time. If the exact loop-day does
  not reproduce, that is reported as a finding (substrate drift),
  not silently re-anchored.
- The 3 documented away deliveries (s49003 d43→d44, s49014
  d27→d28) are regression anchors for the AFTER leg, not proof
  anchors: the corpus is re-run on current master, so those
  trajectories may not reproduce. Away deliveries are
  established by the before leg itself.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO /
INSUFFICIENT-DATA / DIAG-NO-GO per the rules above, never
re-scored against a friendlier metric mid-run. If a metric
proves wrong, it goes under "metric review" in the evidence file
with a revision proposed for the NEXT run. Every evidence file
carries a "metric review" section. The counting rule above
(firing-time position via pre-endday markers) binds this run
from the start.

## Wall numbers (carried, NOT re-measured)

This is a narration fix corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24.

## Deliverables

- evidence/2026-11-06/sim-gorgeharness-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-06/sim-gorgeharness-a.md (verdict per beat,
  rates with denominators, every away hit quoted verbatim,
  sense verdict per beat, metric review, panel compare attached)
- evidence/2026-11-06/sim-gorgeharness-a-corpus/before/ and
  .../after/ (per-seed JSON: judged lines with firing-time
  position + pre-endday markers; linger-endDay table;
  pendingHavenNews depth series; per-beat total line counts)
- scripts/policies/gorgeharness-diag.js (NEW wrapper module:
  firing-time atHaven classification + linger-endDay grouping
  on top of the judged lingergorge classifiers — the parent
  modules are NOT modified)
- scripts/gorgeharness-trace-a.js (NEW driver: the lingergorge
  driver with ONLY the disclosed changes — OUTDIR/prefix for
  the gorgeharness corpus, the read-only pre-endday marker
  wrap, the revised-metric analysis)
- scripts/test-gorgeharness-a.js (NEW proof: unit classifiers +
  revised-metric unit scenarios + per-beat gate/relay unit
  scenarios B9/B10/B11 (with the B11 non-vacuous read: the
  flush delivery must come FROM the queue, not from a direct
  say) + det-gate + anchors)
- src/js fix, one commit with [needs-eyes] (narration/feel):
  havenGrowth.js only (nightly gorge gate, drift-off relay).
  No relay-internal change, no gate/price/deed-rule change, no
  push, no bump, no live verification (coordinator merges; ship
  loop owns deploys).
- SECONDARY CODE-READ DELIVERABLE (in the evidence file):
  state.lastLingererOffer reader verdict — grep the whole tree
  (src/js AND scripts/ AND docs/) for readers; report DEAD
  STATE in the shipped game vs FOUND READER, naming each reader
  and what it does with the offer. Do not change the recording
  unless the fix needs it (it does not — see Code facts).
