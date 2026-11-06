# sim-lingergorge-a — EVIDENCE (arm completion, Loop A fleshout-20261106T0821Z)

Worker: sim-lingergorge-a (Loop A, food-economy / narration).
Run: fleshout-20261106T0821Z — CENSUS arm (no fix built).
Prereg: evidence/2026-11-06/sim-lingergorge-a-prereg.md (committed
BEFORE any judged sim, 877d6c32f; base b5fb49607). Instrument:
scripts/policies/lingergorge-diag.js (wrapper — the judged parent
module is untouched), driver scripts/lingergorge-trace-a.js, proof
scripts/test-lingergorge-a.js. Base for this arm: branch
sim-lingergorge-a at 8d17f1a12 (tree = b5fb49607 + prereg +
instrument/driver/proof). Horizon 60 loop-days, policies
bankfood(warmed(woodcarry(nighttravel))) over competent, env gates
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1.
Seeds 49001–49040 (pilot 49001–49008, screen 49009–49040);
extension 49041–49064 NOT triggered.

## Verdict — DIAG-NO-GO (census did not confirm the defect; no fix built)

The powered census finds ZERO gorge lines in stranded sleep
windows (0/49 windows, 8 stranding seeds) — the pre-registered
primary metric does not confirm the defect, so per the prereg and
the assignment no fix is built, no after leg is run, and no panel
is compared. The power bar passed (49 >= 20 windows, 8 >= 4
seeds), so this is a verdict, not INSUFFICIENT-DATA. The defect
class is nevertheless REAL and observed in the same census outside
the pre-registered metric (§3): 3 gorge lines reached scholars on
combat-blocked wild nights, delivered in the harness phase the
morning after — outside both the stranded definition and the sleep
window. That is the follow-up arm's starting point, with a revised
metric pre-registered (see §3 and "metric review"). The drift-off
beat is unmeasurable on this substrate: 0 drift-off lines fired
anywhere in 40 seeds (§7).

Per-beat census table (stranded-sleep windows, BEFORE leg, 40 seeds):

| Beat | Before | Background (non-stranded sleep) | Census verdict |
|---|---|---|---|
| GORGE nightly | 0/49 windows, 0 lines | 32/2229 windows (1.44%), 55 lines | NOT CONFIRMED in the pre-registered metric |
| GORGE-DRIFTOFF | 0/49 windows, 0 lines | 0/2229 windows; 0 lines total, all phases | UNMEASURABLE (never fires) |
| FRAGMENTS (regression control) | 0/49 | — | parent fix HOLDS |
| PANTRY-deposit (regression control) | 0/49 | — | parent fix HOLDS |
| RAID-CALL / RAID-LINE / RAID-AFTERMATH | 0/49 | — | parent fix HOLDS |
| OVERHEAR / TALE / BURST / SETTLE / WITNESS | 0/49 | — | controls stay 0 |

## §1 — The census, and why 0/49 is a NO-GO, not a pass

Expected gorge hits at the background rate: 49 windows × 1.44%
≈ 0.7 windows. Observing 0 is entirely consistent with the
background rate (P(0) ≈ 49%) — the census cannot distinguish
"position-blind at the background rate" from "never fires
stranded" at this rarity. The gorge is a rare-coincidence beat,
not a steady drip: it needs a lingering raider AND a stranding on
the same night, and on this band those never coincided in a sleep
window. The five stranding seeds with the longest strandings
(49031: 8 nights, 49034: 9, 49036: 12) had ZERO gorge lines in
their entire runs — no lingerer ever gorged on those seeds at
all. The seeds with the most gorge lines (49003: 24, 49014: 11,
49016: 9) never stranded. The before leg therefore supplies no
baseline delta for a fix to move: an after leg would also read 0,
a vacuous GO that proves nothing. Building the gate on this
evidence would be fixing an unmeasured beat. The prereg bound
this run to the stranded-sleep metric; the metric did not
confirm; the fix is not built. §3 records what the same census
DID observe outside that metric, for the next run — it is not
used to re-score this one.

## §2 — Before leg (judged first; no fix existed)

- PILOT 49001–49008: 0 stranded sleep windows across 0 stranding
  seeds — misses the power bar by construction, as the prereg
  predicted, and triggers the pre-registered screen. Incidence
  0/0, reported not hidden. daysAlive: 60, 60, 60, 60, 54, 60,
  60, 60 (7 survived 60d, 49005 village-lost d54).
- SCREEN 49009–49040 (32 seeds, every seed run, stranding or
  not).
- POOLED BEFORE (40 seeds): 49 stranded sleep windows, 47
  stranded upkeep windows, across 8 stranding seeds; 2229
  non-stranded sleep windows. POWER BAR PASSED (49 >= 20 windows,
  8 >= 4 seeds). Transcript errors 0. Days alive: 29/40 survived
  60d; 11 village-lost (49005 d54, 49012 d42, 49014 d56, 49018
  d55, 49019 d51, 49023 d24, 49028 d59, 49031 d34, 49036 d49,
  49037 d59, 49040 d57).
- GORGE totals (all phases): 80 lines across the band; 69 fired
  with the scholar at Haven, 11 with the scholar away by the
  position marker — of which 8 fired on haven tiles
  (scholarAtHaven() true — the scholar was on Haven grounds but
  not "inside"; NOT the defect, and the pre-registered gate would
  let them through anyway) and 3 fired genuinely away (§3).
- DRIFT-OFF totals (all phases): 0 lines. No lingerer anywhere
  in 40 seeds reached its ~6-night clock on a night the game
  reported — the clock loses the race to kills/crisis resolution
  every time on this substrate (§7).
- Upkeep windows are clean by mechanism, as in the parent arm:
  0 family hits in 47 stranded upkeep windows (and 0 in the
  non-stranded upkeep tallies) — the gorge never fires in upkeep.

Per-seed before detail (daysAlive / end / stranded nights /
stranded sleep windows / gorge total):
49001 60 survived 0/0 0; 49002 60 survived 0/0 0; 49003 60
survived 0/0 24; 49004 60 survived 0/0 0; 49005 54 lost 0/0 0;
49006 60 survived 0/0 0; 49007 60 survived 0/0 4; 49008 60
survived 0/0 0; 49009 60 survived 0/0 0; 49010 60 survived 0/0 0;
49011 60 survived 0/0 0; 49012 42 lost 0/0 8; 49013 60 survived
0/0 0; 49014 56 lost 0/0 11; 49015 60 survived 0/0 0; 49016 60
survived 0/0 9; 49017 60 survived 0/0 0; 49018 55 lost 0/0 6;
49019 51 lost 0/0 0; 49020 60 survived 4/4 0; 49021 60 survived
0/0 0; 49022 60 survived 2/2 0; 49023 24 lost 0/0 0; 49024 60
survived 0/0 1; 49025 60 survived 2/2 3; 49026 60 survived 6/6 4;
49027 60 survived 0/0 0; 49028 59 lost 6/6 2; 49029 60 survived
0/0 4; 49030 60 survived 0/0 1; 49031 34 lost 8/8 0; 49032 60
survived 0/0 0; 49033 60 survived 0/0 0; 49034 60 survived 9/9 0;
49035 60 survived 0/0 0; 49036 49 lost 12/12 0; 49037 59 lost 0/0
1; 49038 60 survived 0/0 0; 49039 60 survived 0/0 0; 49040 57
lost 0/0 2.

Stranded loop-days per stranding seed: 49020 d4–d7
(out-of-reach, forest_floor); 49022 d47–d48 (out-of-reach,
forest_floor); 49025 d8–d9 (out-of-reach, forest_floor); 49026
d25, d54–d58 (out-of-reach, forest_floor/creek); 49028 d52–d53,
d56–d59 (out-of-reach, creek); 49031 d27–d34 (travel-refused,
creek); 49034 d25–d30, d35–d37 (out-of-reach/travel-refused,
forest_floor); 49036 d24–d31, d34–d37 (travel-refused,
creek/forest_floor).

## §3 — What the census DID observe outside the metric (finding, not a re-score)

Three gorge lines reached scholars who spent the night OUT —
not by travel-refused/out-of-reach (the pre-registered stranded
definition) but because COMBAT blocked their return — and were
delivered in the HARNESS phase the morning after, outside any
sleep window:

- s49003, night of d43 → morning of d44 (scholar at grove
  (4,8); d43 evening "blocked-combat", inside=false):
  "🌙 Night. The lingering The Redactor gorges at the treeline —
  1,400 kcal gone from the stores. Endure it (they drift off
  within ~6 nights — the gorge is the price), or send a sortie:
  fighters, rations, real risk."
  and in the same morning firing: "🌙 Night. The lingering The
  Influencer gorges at the treeline — 730 kcal gone from the
  stores. Endure it (they drift off within ~6 nights — the gorge
  is the price), or send a sortie: fighters, rations, real risk."
- s49014, night of d27 → morning of d28 (scholar at creek (4,8);
  d27 evening "blocked-combat", inside=false): one gorge line,
  the Grief Counselor (d28 harness firing, 1 line).

Mechanism read (code + corpus, consistent): a wild-sleep night
runs its endDay (progDaily → havenGrowthDaily → gorge) at the
morning boundary, in the harness phase, while a hall-sleep night
runs it inside sleep — the same loop-day carries both a harness
firing (the previous wild night's report) and a sleep firing (the
current night's report) when the scholar returns: s49003 d44
shows 2 harness + 2 sleep lines for the same two lingerers, d52
the same shape, d55 1+1 for one lingerer. The stranded-sleep
metric therefore misses the wild-night delivery channel by
construction: the line is never inside a wild night's sleep
window, because the wild night's endDay fires the next morning.
The 46014 parent-corpus lines (6, inside stranded sleep windows)
remain the proof that the line CAN land inside a sleep window on
another substrate — the phase of the delivery is substrate- and
sleep-type-dependent, which is itself a finding.

Sense verdict on the 3 lines: STILL WRONG, same defect class as
the parent arm — a nightly haven report + a sortie invitation
("send a sortie: fighters, rations, real risk") delivered to a
scholar asleep at a grove/creek who cannot see the treeline and
cannot answer the sortie from the wild. The follow-up arm's job:
pre-register the revised primary metric FIRST (gorge lines
delivered while scholarAtHaven() is false, ANY phase, on ANY away
night — stranded + combat-blocked + otherwise out — judged by
firing-time position), then build the gate/relay fix against it.
The gate/relay decision itself is already reasoned in the prereg
(gorge GATE-suppress, drift-off RELAY) and needs no re-deciding —
only a metric that can see the delivery channel. This arm does
not build it: the binding metric did not confirm, and a fix
judged on a metric written after the data is not a measurement.

## §4 — Sense test (non-stranded delivery reads true)

At Haven the line reads true — it is a good line; the defect is
delivery position, not prose. Verbatim non-stranded gorge lines,
s49003 (scholar inside Haven at fire time):

- d44: "🌙 Night. The lingering The Redactor gorges at the
  treeline — 600 kcal gone from the stores. Endure it (they drift
  off within ~6 nights — the gorge is the price), or send a
  sortie: fighters, rations, real risk."
- d44: "🌙 Night. The lingering The Influencer gorges at the
  treeline — 1,000 kcal gone from the stores. Endure it (they
  drift off within ~6 nights — the gorge is the price), or send a
  sortie: fighters, rations, real risk."
- d52: "🌙 Night. The lingering mosquito gorges at the treeline —
  650 kcal gone from the stores. Endure it (they drift off within
  ~6 nights — the gorge is the price), or send a sortie: fighters,
  rations, real risk."
- d52: "🌙 Night. The lingering The Reunion gorges at the treeline
  — 1,500 kcal gone from the stores. Endure it (they drift off
  within ~6 nights — the gorge is the price), or send a sortie:
  fighters, rations, real risk."

Contrast: the same words at a grove (4,8) the morning after a
blocked-combat night (§3) invite a sortie the scholar cannot
launch and report a treeline they cannot see. The line is fine
at the fire; it is wrong in the wild.

## §5 — Controls + parent-fix regression

Every classified family beat is 0 in the 49 stranded sleep
windows (tallies in the verdict table): fragments 0, pantry 0,
raid-call/line/aftermath 0, overhear 0, tale 0, burst 0, settle 0,
witness 0. The enddaybeats fix HOLDS on current master — no
fireside line reaches a stranded scholar's sleep window on this
band at all. The stranded upkeep windows are likewise clean (47
windows, 0 hits of any kind). Held-volume accounting
(pendingHavenNews depth, read-only): max depth 7 (seed 49031),
final depth 0 on every seed — the relay queue drains; no queued
item was lost.

## §6 — "Other" enumeration (full scan of the 49 stranded sleep windows)

The 49 stranded sleep windows hold 1,123 unclassified lines —
all sleep-loop prose and village-activity reports, no haven-side
fireside beat of any kind. Top patterns (normalized):

- 45× "You settle into the cold ground. Sleep takes you."
- 40× "— DAY N DAWN — The world wakes. Animals are active."
- 39× "<name>'s stomach is a fist. Eat — anything real, now."
- 38× "You camp wild tonight — no hall meal, but the pantry
  still reaches you through System requisition. Eat from your
  pack."
- 31× quoted speech fragments; 27× "Dawn. You wake stiff and
  cold. (+N health, energy restored...)"
- 25× "Sleeping rough means the cold ground — heal ~N."
- 20× "⚠ WARNING: reserves critical. Eat tomorrow or the spiral
  begins."; 15× "⚠ STARVING: health and energy falling. You went
  to bed on an empty stomach."; 13× food-keeping advice
  ("Your food keeps days, not weeks. Smoke it over a fire...")
- 12× "You wake with a start — something is wrong."; 11× cold
  shivering lines; 10× "Rain. Steady, cold, honest rain."
- 9× "🪵 Priya hauls back N wood. The pile grows."; 8× "🍲 Priya
  cooked for the haven — meals stretched."; 8× "🪨 Deborah pries
  N stone loose from the creek bed."

Read: a stranded scholar's sleep window reads as a scholar
sleeping rough — cold ground, hunger, weather, System lines,
villagers working. Nothing in them claims the fire. The
stranded-window narration is coherent now that the family beats
are gated; the remaining position-blind delivery is the
harness-phase morning-after channel (§3), which this
enumeration's window scope does not cover.

## §7 — Drift-off: unmeasurable on this substrate

0 drift-off lines in 40 seeds, all phases, all positions. The
~6-night drift clock never wins its race on this band: lingerers
are killed, driven off, or their crisis resolves before the
clock expires, or no lingerer is present at all (5 of the 8
stranding seeds had 0 gorge lines in their entire runs). The
pre-registered RELAY decision for the drift-off line stands as
reasoning, but there is no corpus instance to judge it against —
a follow-up arm must first establish a substrate where the line
fires (e.g. a staged lingerer held past the clock, as the proof
test's B11 does in unit form) before any relay can be measured.
The proof test's B11 scenario (drift-off queues while away,
delivers verbatim on return) remains the only evidence for the
relay path, and it is unit evidence, not corpus evidence.

## §8 — Proof test, det-gate, anchors (no src/js changed in this arm)

- Proof: scripts/test-lingergorge-a.js — 29/33 checks pass on
  the UNFIXED code. The 4 red checks are exactly the fix's
  behaviors (B9 gorge gate away, B10 empty-pantry gate away,
  B11 drift-off relay away ×2), red as expected before the fix
  exists — they are the pre-registered acceptance tests for the
  follow-up arm, not failures. All classifier checks (11/11),
  mechanics checks (kcal still taken, offer still recorded,
  linger still ends), det-gate, and anchors are green.
- One check passes VACUOUSLY pre-fix and must be re-read after
  the fix: "drift-off: flush delivers it verbatim on return"
  passes now only because the line was said directly while away
  (count 1 from the direct say); after the fix it must pass
  because the line was queued and then flushed. The
  discriminating check is "drift-off: away queues it as kind
  raid", which is red now and must go green with the fix.
- Det-gate: instrument ON vs OFF identical on seed 17021 (bankfood
  evenings/mornings/first-upkeep kcal series + daysAlive/end).
- 17021 RE-PIN (as found on base b5fb49607): 60 days, SURVIVED, 0
  stranded nights — moved again from the parent arm's 52d
  village-lost (set on master ec56fdf04). Substrate drift, not
  instrument drift: the ON/OFF pair agrees (60d survived both),
  and the anchor has now moved three times (57d lost → 60d
  survived → 52d lost → 60d survived). Future arms: re-pin, never
  assume.
- Non-stranded anchor: seed 15003 loop-day-7 sleep window still
  contains a 'Word gets around the haven' line with the scholar
  inside Haven at fire time — reproduces on this base (15003
  itself is now 48d village-lost with 4 stranded nights d37–d40,
  vs the gossipcensus's 30d/8 nights — the trajectory moved, the
  anchor held).
- No src/js was modified in this arm. No balanced panel was run:
  there is no after leg to compare (DIAG-NO-GO, no fix built).
  node --check clean on all three new scripts. check.js --quick
  was NOT run: no src/js changed, no existing test was touched,
  and the new scripts are not on the green list — the relevant
  verification is the proof test above.

## §9 — Band freshness re-verified (step 2 of the assignment)

Band 49001–49040 + extension 49041–49064, verified 2026-11-06
~08:30Z (whole-token grep, git grep over the worktree index +
rg; results in the prereg). Two candidates rejected before it
(47001–47040 named by sibling sim-spandraw-census-a's prereg;
48001–48064 — 48045 named as a seed BAND in sim-shelling-b.md).
Extension NOT triggered (before leg powered: 49 windows / 8
seeds). No other seeds were run for the judged census; the
det-gate/anchor seeds (17021, 15003) are instrument seeds, not
band seeds.

## Metric review (binding — proposals for the NEXT run, not re-scores)

1. THE STRANDED-SLEEP METRIC MISSES THE HARNESS-PHASE CHANNEL
   (proved this run): the gorge's nightly firing lands in the
   harness phase the morning after a wild night, not inside the
   wild night's sleep window — so a beat can reach an away
   scholar every night and still score 0/49 on the
   stranded-sleep metric. Proposal: the follow-up arm's primary
   metric counts gorge lines delivered while scholarAtHaven() is
   false, ANY phase, on ANY away night (stranded +
   combat-blocked + otherwise out), judged by firing-time
   position. The wild-sleep morning-boundary endDay path needs
   its own mechanism note in the prereg.
2. THE STRANDED DEFINITION IS NARROW (proved this run): the 3
   observed away deliveries were on combat-blocked nights
   ("blocked-combat", "walk-interrupted-combat"), not
   travel-refused/out-of-reach. The stranded definition counts
   only nighttravel outcomes; combat-blocked returns are the
   same lived experience (scholar sleeps out, hears the haven
   report) under a different label. Proposal: define the away
   night by the scholar's position at the firing time, not by
   the evening's travel outcome.
3. THE POWER BAR MEASURES WINDOWS, NOT OPPORTUNITIES (proved
   this run): 49 powered windows with 0 gorge hits because the
   beat needs a lingerer AND an away night together — 5 of 8
   stranding seeds never had a lingerer at all. Proposal: for
   rare beats, power the census on beat-opportunities (e.g.
   lingerer-nights) or condition the denominator on nights a
   lingerer was present; a window bar alone cannot confirm a
   rare beat.
4. THE DRIFT-OFF BEAT NEEDS A STAGED SUBSTRATE (proved this
   run): 0 lines in 40 seeds. A corpus census cannot judge a
   relay for a line that never fires; the follow-up must stage
   the clock (or accept the unit scenario as the relay evidence
   and judge only the gate).
5. NO DISPLAY-NAME UNIQUENESS (minor, observed): s49003 d58
   shows 4 sleep-phase gorge lines for 3 distinct lingerer
   names — one name appears twice, plausibly two entities
   sharing a display name. Not a defect claim; a counting
   caveat for any per-name analysis.
6. No metric was re-scored mid-run. The §3 finding is reported
   as a finding for the next run's pre-registration, not used to
   change this run's verdict.

## Findings for the coordinator (append to sim-findings.md)

- [open] 2026-11-06 — narration/position — LINGERER-GORGE
  NIGHTLY LINE REACHES AWAY SCHOLARS ON COMBAT-BLOCKED NIGHTS,
  HARNESS PHASE (sim-lingergorge-a,
  evidence/2026-11-06/sim-lingergorge-a.md): powered census (40
  seeds, band 49001–49040) finds 0 gorge lines in 49 stranded
  sleep windows (DIAG-NO-GO on the pre-registered metric), BUT 3
  gorge lines reached scholars on combat-blocked wild nights
  (s49003 d43 grove, s49014 d27 creek), delivered in the harness
  phase the morning after — the wild night's endDay fires at the
  morning boundary, outside the sleep window. Same defect class
  as the parent arm (nightly report + unanswerable sortie
  invitation). Follow-up arm needs the revised metric
  (scholarAtHaven()-false delivery, any phase, any away night)
  pre-registered BEFORE building the gate/relay fix (decisions
  already reasoned in the prereg: gorge GATE, drift-off RELAY).
- [open] 2026-11-06 — narration/position — DRIFT-OFF LINE NEVER
  FIRES IN CORPUS (sim-lingergorge-a,
  evidence/2026-11-06/sim-lingergorge-a.md): 0 drift-off lines in
  40 seeds, all phases — the ~6-night clock never wins its race
  on this substrate. A follow-up must stage the clock before any
  relay can be measured.
- [open] 2026-11-06 — mechanics/state — LASTLINGEREROFFER
  WRITTEN BUT NEVER READ (sim-lingergorge-a, code read on base
  b5fb49607): state.lastLingererOffer is written in
  havenGrowthDaily (havenGrowth.js:260, "the gorge line IS the
  offer — record what was just announced, so an answer can aim at
  it") but a grep of src/ finds NO reader anywhere — the sortie
  buttons evidently aim another way. Either the offer memory is
  dead state or its reader lives outside src/js; worth a code
  read before anyone leans on it.
- [open] 2026-11-06 — instruments/substrate — 17021 ANCHOR
  DRIFTED AGAIN (sim-lingergorge-a,
  evidence/2026-11-06/sim-lingergorge-a.md): 17021 is now 60d
  SURVIVED, 0 stranded (was 52d village-lost on master
  ec56fdf04; before that 60d survived, before that 57d lost).
  Future arms must re-pin, never assume.

## Wall numbers (carried, NOT re-measured — per prereg)

Carried from the 1041Z round (0915Z run, 24 distinct seeds): wins
0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24. This narration corpus records no
scale outcomes. This corpus's own scale facts (not wall numbers):
29/40 survived 60d, 11 village-lost; no wave/national/table
outcomes recorded by this instrument.

## Deliverables

- evidence/2026-11-06/sim-lingergorge-a-prereg.md (877d6c32f,
  committed BEFORE any judged sim)
- evidence/2026-11-06/sim-lingergorge-a.md (this file)
- evidence/2026-11-06/sim-lingergorge-a-corpus/before/ (40
  seeds, judged windows + every classified line + per-loop-day
  counts; stranded sleep windows in full transcript;
  pendingHavenNews depth series; per-beat total line counts)
- scripts/policies/lingergorge-diag.js (NEW wrapper module: gorge
  classifiers on top of the judged enddaybeats-diag — the parent
  module itself is NOT modified)
- scripts/lingergorge-trace-a.js (driver: the parent arm's driver
  with ONLY the disclosed changes — OUTDIR/prefix, gorge
  classification via the wrapper, per-beat total line counts)
- scripts/test-lingergorge-a.js (proof: 29/33 on unfixed code —
  the 4 red checks are the follow-up arm's acceptance tests for
  the gate/relay fix, documented in §8)
- src/js: NO CHANGES in this arm (DIAG-NO-GO — no fix built).
  No push, no bump, no live verification (coordinator merges;
  ship loop owns deploys).

## Run note

No src/js change, so no check.js run and no merge conflict
surface: the coordinator merges the prereg + instrument +
evidence commits onto master. The worktree contains only
committed work after the evidence commit (verify with git
status). The 17021/15003 det-gate probe outputs in
/tmp/lingergorge-detgate/ are scratch, not evidence — the
proof test re-runs them in-process.
