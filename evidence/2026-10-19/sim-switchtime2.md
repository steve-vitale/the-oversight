# sim-switchtime-2 — the v3-switch MOMENTUM gate (flesh-out loop arm sim-switchtime-2)

Run: fleshout-20261019T2115Z (coordinator run; arm brief), arm sim-switchtime-2. Axis: scale-onramp (the blocking axis).
Lever: POLICY-SIDE momentum gate on belongseek's v3 consolidator switch
(scripts/policies/switchtime2.js + [switchtime2]-delimited gate lines in
scripts/policies/belongseek.js). Zero src/js changes.

Canon: docs/CANON.md (read first), docs/SCALE.md (regional links / diplomacy /
polities / seasoning — the canon doc for this target: "Seasoned = 30+ days old
AND trust 40+", "four fires under one head is a realm", foreign consolidation
"pair -> 3-fire -> 4-realm in ~4-8 weeks" on an engaged run, "drift-only never
passes a pair"). The momentum rule itself is a new design call (Muse
2026-10-19, Steve can overrule — numbered below).

Named next from sim-switchtime (evidence/2026-10-19/sim-switchtime.md,
KILLED-AT-PILOT): the static 5-fire "strictly better" bar blocked all walks on
the stall seeds but was too strict — on s64202/s64207 national arrived via the
NEW realm (d72/d81) BEFORE any bond seasoned, so keeping the 2-fire bond
forfeited the consolidating realm. The walk isn't pure tax; the bar was wrong.
This arm gates the walk on the rival realm's consolidation MOMENTUM instead.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY:** belongfeast-ONLY mean seasoned-link-days per run >= 1.2x the
control belongfeast mean. The switchtime arm's 1.25x 16-run bar oversampled
the inert leadfeast side (leadfeast armed is byte-identical to control by
design — the gate never engages on the lead road). 8 belongfeast runs, honest.
control belongfeast mean (committed seasonblock corpus) = 28.25 -> GO >= 33.90
(recomputed by the analyzer from the corpus at full precision, not
hardcoded).
A miss is NO-GO, never re-scored mid-run (§14).

**GUARDRAILS (all vs the pre-registered control):** national >= control-1
(count); wave-4 unlocks within +/-2 of control (count); starvation <=
same-probe fresh-control+1; no new death mode (vs the same-probe fresh
control); median survival not worse by >10d.

**Horizon:** 180d death-aware (dead villages stop simulating; the honest
surface for a pre-seat scale question).

**Seeds:** 64201–64208 (the feastgap/seasonblock seed set) x
{leadfeast, belongfeast} = 16 paired runs per condition, identical seeds,
SWITCHTIME2=1 armed only. Control = the committed seasonblock corpus
(evidence/2026-10-19/perseed-seasonblock), reused fidelity-gated. The
same-probe fresh gate-off re-sweep (perseed-switchtime2-control) doubles as
the fidelity gate and the same-probe death-channel baseline.

**Substrate (this arm):** the seasonblock substrate, verbatim:
`withSeatDrive(withWinDefer(withReposition(TF base)))` on {leadfeast,
belongfeast} tribfloor bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1
(SEATDRIVE='0' -> seatdrive pure delegation; REPOSITION unset -> inert;
VETREL unset -> companion-veteran channel OFF; KILLDISC=1 -> read-only kill
census). Armed adds SWITCHTIME2=1 — the ONLY delta. BELONG_V3 unset
(matches the corpus: the d55-57 walks are the v2 consolidator switch).

**Instruments:** scripts/probe-switchtime2-20261019.js (copy of the
switchtime probe: same bond census, beat/death/flow instruments; env-switched
EVID dirs perseed-switchtime2-{armed,control}; the policy ctx's _switch2Gate
counters captured into the per-seed JSON when SWITCHTIME2=1 only),
scripts/analyze-switchtime2-20261019.js (before/after + guardrails; primary =
belongfeast-only 1.2x bar), scripts/test-switchtime2.js (proof: 13 fixture
groups RED->GREEN (mechanism, momentum math, blocked-retry semantics, hook
wiring via the real rideConsolidator) + DET armed byte-identical + leadfeast
invariance + measurement honesty — GREEN before the sweep).

**Before/after comparison:** through scripts/balance-panel.js per §15 — the
panel is the instrument, the pre-registered threshold is the judge. Panel
runs mirror the switchtime arm's: --out panel-switchtime2-before (SWITCHTIME2
unset) then --out panel-switchtime2-after (SWITCHTIME2=1), 8 seeds x
belongfeast, 180d, then compare.

**No [needs-eyes]**: policy-side only, no player-facing change.

## Design calls (Muse 2026-10-19 — Steve can overrule)

1. **Momentum window = 21 trailing days, growth bar = +1 fire.** Canon's
   consolidation pace (pair -> 4-realm in ~4-8 weeks engaged; drift-only
   never passes a pair) means fires arrive weeks apart — a 14d window would
   miss a realm that consolidated 18 days ago. 21d catches one step.
2. **History baseline = oldest snapshot inside the window.** A candidate first
   observed <21d ago is measured from first sighting (day-one delta 0 ->
   blocked). The realm must prove itself; unknown = not growing.
3. **The >=4-fire bar stays in rideConsolidator, not in the gate.** The gate
   answers only "is the candidate growing?". Never walk into a realm that
   isn't growing — even a 5-fire one.
4. **The gate fires only for bonds past the 30-day age bar.** Younger bonds
   keep v2 behavior (the walk on a young bond is courtship, not a seasoned
   bet). Canon: seasoned = 30+ days old AND trust 40+.
5. **Blocked switch consumes no once-per-run flag — retries daily**, same as
   switchtime. A late-consolidating rival can still win the walk.

## Backlog check (before designing)

- #670 [open] SWITCHTIME-2: MOMENTUM GATE — this arm IS that item (answered
  on landing; marked here, coordinator owns the backlog write).
- #673 [open] GOOD-STANDING BAR VARIANT — game-code, explicitly "NOT
  implemented" without coordinator approval. NOT touched by this arm.
- #668 [steve-call] SUCCESSION COST STACK — Steve's call. NOT touched.
- No do-not-rerun item covers the momentum gate (the pit-staffing
  do-not-rerun is a different lane).

## Results

Pilot: 16 runs armed (SWITCHTIME2=1), 8 seeds x {leadfeast, belongfeast}, 180d
death-aware, 0 instrument errors, 0 bad files. Control = the committed
seasonblock corpus, fidelity-gated (see below); the same-probe gate-off
re-sweep (perseed-switchtime2-control) doubles as the death-channel baseline.

**FIDELITY GATE: PASS.** The gate-off re-sweep is trajectory-identical to the
committed seasonblock corpus on 16/16 runs: gameDays, national, maxWave,
seasoned-link-days, the full bond census, beats, and hashes all match.
Byte-compare differs only in the `deathChannels` key — present in this
probe's output, absent from the seasonblock corpus (that probe predates the
instrument). The 3 landed src/js commits between the corpus base (8c055140a)
and this tree (acdd91e83) moved nothing on these trajectories. The
pre-registered control stands.

**PRIMARY: NO-GO.** belongfeast-only mean seasoned-link-days per run:
control 28.25 -> armed 28.25 (x1.00). GO needed >= 33.90 (1.2x). Missed
clean — the armed trajectories are byte-identical to control on the primary.
Per §14 the run is NO-GO — not re-scored.

**Mechanism attribution (from the gate counters):** the switch fired on 5/8
belongfeast seeds (s64201, s64202, s64203, s64204, s64207 — not on s64205/
s64206/s64208 where no walk was attempted). Every single walk was allowed
with reason `momentum-ok`: all five candidates were genuinely consolidating
(3->4 fires in the trailing 12–14d: s64201 d55 delta+1/window12d, s64202 d55
delta+1/window12d, s64207 d57 delta+1/window14d). Blocks: 0 across 16 runs.
The momentum gate permitted exactly the walks the v2 switch wanted — it is a
rubber stamp on this seed set. A gate that can only RESTRICT walks cannot
move anything on a corpus where the unrestricted decision is always
momentum-ok.

**GUARDRAILS (all vs the pre-registered control):** national 4 vs 4 (ok);
wave-4 unlocks 5 vs 5 (ok); starvation 5 vs same-probe fresh 5 (ok); no new
death mode (ok); median survival 116d vs 116d (ok). Lead guardrails all ok
(byte-identical trajectories). ALL guardrails pass — trivially, since armed
== control.

**Verdict: KILL at pilot.** The primary missed at x1.00 and the mechanism is
proven inert (0 blocks, 5/5 momentum-ok walks, trajectories byte-identical).
Per the kill protocol the policy layer is deleted and belongseek.js reverted;
instruments (probe, analyzer, fidelity comparator) + evidence land.

### The wall on this substrate (armed, 16 runs)

national 10/16 (lead 6/8, belong 4/8), table 12/16, wins 0/16, wave-4 11/16,
wave-5 0/16, median survival 110d (max 182d). Identical to control on every
count — the wall stands exactly where seasonblock left it.

## Village assessment

What the villages looked like: byte-identical to the seasonblock villages —
because the trajectories are. The belong villages walk at d55-57 into the
consolidating realm exactly as the v2 switch wanted: s64207's d57 walk into
village_2 (4 fires, grown 3->4 over the trailing 14 days) re-courts at trust
33, tends to 63 by d70, and the village reaches national (same as control)
before dying village-lost at d150. s64201's d55 walk re-courts at trust ~30
and the village dies d86 with the bond at age 29 (same as control). Nothing
about the villages changed — the lever didn't.

Who thrived and who died and why: same as the seasonblock assessment, verbatim
— the momentum gate changed no decision, so no village's fate differs by a
single day. The divergence between roads is unchanged: lead's 3 bonds season
together (+102); belong's single bond walks at d55-57 into the growing realm.

What was missing: a walk-timing lever with anything to bite on. The v2
switch's walks are already momentum-perfect on this seed set — every candidate
it picks is consolidating. There is no flat-candidate walk to block, so no
momentum rule can separate from v2 here. The binding constraints remain the
ones the backlog already names: dip-HOLDING through succession (#673,
good-standing bar variant — game-code) and the succession cost stack (#668,
steve-call).

## Sense-testing (SENSE-TESTING LAW)

Read: the link histories on all five armed walk seeds + the beat captures
around the walk days.

**The allowed walk narrates exactly as control.** link.history[] records
'Link broken (walked).' day-exact (s64207 d57, s64201 d55), and the breakLink
say line fires as verified in the switchtime read ("Haven walks from the
table cleanly — no blades, no hard words. The bond ends where it stood,
honestly."). The momentum-ok decision is invisible in the fiction — correctly:
the walk happens, the gate's reasoning doesn't narrate, and no beat claims
anything the census contradicts.

**The blocked path never fired in the wild** (0 blocks / 16 runs), so its
fiction-invisibility is code-true but untested in the wild: the block path
emits no beats by construction (the bond just continues, same as switchtime's
blocked days). Noted as a limit, not a finding.

**The bond-is-young and oath-summons beats read as designed** on the walked
seeds (s64207 d69 young-link beat on the re-courted bond at true age 12, d71
Binding oath summons) — the re-courted bond's fiction matches its true age
everywhere checked.

**Blanks (robotic/static):** none in the beat text. One carry-forward from
seasonblock: the walk's say line isn't in this instrument's beat filter, so
the sense read leans on link.history[] + the engine text verified last run.

## Metric review (§14 — for the NEXT run, not this one)

1. **The primary was honest this time** — belongfeast-only 1.2x, no lead
   dilution, full-precision bar (28.25 -> 33.90). The lever missed at x1.00
   with the mechanism proven inert. No metric complaint; no re-score.
2. **A restrict-only gate needs a corpus where restriction can fire.**
   Pre-registering a downstream metric (seasoned-link-days) for a gate that
   never blocks is a category error — the pilot correctly killed it fast,
   but a cheaper mechanism metric (walk-count / block-rate vs control on the
   stall seeds) would have killed it in the preview run. Next switch-timing
   arm: pre-register the mechanism metric first, the downstream metric only
   if the mechanism fires.
3. **Observed consolidation is faster than the canon pace.** The canon pace
   (pair -> 4-realm in ~4-8 weeks) motivated the 21d window, but the actual
   growth steps on these seeds landed inside 12–14d windows. The 21d window
   was harmless (baseline = oldest-in-window), but a future arm should note
   engaged-run consolidation runs quicker than the doc's drift-calibrated
   pace.
4. No re-score: the NO-GO stands on the pre-registered bar.

## Named nexts

1. **The walk-timing lane is exhausted on this seed set — do not rerun**
   another v3-switch-timing variant here without a new seed set (one with
   flat-candidate walks) or a new mechanism (e.g. walking EARLIER into
   growing realms, or delaying for the re-court score — both need fresh
   pre-registration). Two consecutive arms (switchtime, switchtime-2) now
   bound it: too-strict loses national, momentum-perfect is inert.
2. **#673 (good-standing bar variant, game-code)** and **#668 (steve-call:
   succession cost stack)** remain the live nexts on the dip-holding half —
   untouched by this arm.

## Out-of-arm findings

(none new — the walk-timing exhaustion above is this arm's verdict, not a
new finding)

## Convergence

**killed-at-pilot.** The lever missed its primary at x1.00 (mechanism proven
inert: 0 blocks, 5/5 momentum-ok walks, trajectories byte-identical to
control) with all guardrails passing. The axis stays converging: the
momentum gate is the second consecutive v3-switch-timing arm to fail on this
seed set (switchtime: too strict, lost national; switchtime-2: inert). The
wall stands: national 10/16, table 12/16, wins 0/16, wave-5 0/16.

## Balanced panel (§15)

Ran per §15: `balance-panel.js --out panel-switchtime2-before` (SWITCHTIME2
unset) then `--out panel-switchtime2-after` (SWITCHTIME2=1), 8 seeds x
belongfeast, 180d, then `compare`. Decision: **review_required**, but every
metric reads 0.0000 paired delta — all no_material_signal / descriptive.
(Attached: evidence/2026-10-19/panel-switchtime2-compare.md.)

The panel corroborates the probe's verdict on an independent substrate (raw
feastscale belongfeast, no tribfloor/windefer/seatdrive): National scale
access 0.625 -> 0.625, Community loss rate 0.625 -> 0.625, Player deaths per
run 4.25 -> 4.25 — the lever moves nothing anywhere measured. Per §15 the
panel is evidence, not the judge — and it agrees with the judge: NO-GO.

Committed per §15: panel.json.gz (before/after) + the compare .md/.json.
The cases/ caches were deleted, never committed.

## Files

- scripts/probe-switchtime2-20261019.js — sweep probe (switchtime-probe copy:
  env-switched EVID dirs, _switch2Gate capture when SWITCHTIME2=1)
- scripts/analyze-switchtime2-20261019.js — before/after + guardrails
  (primary = belongfeast-only mean seasoned-link-days >= 1.2x control)
- scripts/compare-fidelity-20261019.js — fidelity gate: gate-off re-sweep vs
  the committed seasonblock corpus (16/16 trajectory-identical; byte differs
  only in the added deathChannels instrument)
- evidence/2026-10-19/perseed-switchtime2-armed/{leadfeast,belongfeast}/s64201–s64208.json — armed corpus (SWITCHTIME2=1)
- evidence/2026-10-19/perseed-switchtime2-control/{leadfeast,belongfeast}/s64201–s64208.json — gate-off re-sweep (fidelity gate + same-probe death-channel baseline)
- evidence/2026-10-19/switchtime2-compare.json — analyzer output
- evidence/2026-10-19/panel-switchtime2-{before,after}/panel.json.gz + panel-switchtime2-compare.{json,md} — §15 balanced panel (cases/ deleted)
- evidence/2026-10-19/sim-switchtime2.md — this file
- DELETED on kill: scripts/policies/switchtime2.js (the lever), its
  [switchtime2]-delimited gate lines + test hook in scripts/policies/belongseek.js
  (reverted to HEAD — the diff was purely the 24 added lines), and
  scripts/test-switchtime2.js (required the deleted layer; proof record: 22/22
  GREEN pre-sweep — 13 fixture groups RED->GREEN incl. real-rideConsolidator
  mechanism/blocked-retry fixtures, DET armed byte-identical 2/2, leadfeast
  invariance, measurement honesty pinning 28.25 -> 33.90)
- Zero src/js changes throughout.
