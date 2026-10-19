# sim-switchtime — the v3-switch DISCIPLINE (flesh-out loop arm sim-switchtime)

Run: fleshout-20261019T2115Z, arm sim-switchtime. Axis: scale-onramp (the blocking axis).
Lever: POLICY-SIDE discipline on belongseek's v3 consolidator switch
(scripts/policies/switchtime.js + gate lines in scripts/policies/belongseek.js).
Zero src/js changes.

Canon: docs/CANON.md (read first), docs/SCALE.md (regional links / diplomacy /
polities / seasoning — the canon doc for this target: "Seasoned = 30+ days old
AND trust 40+", "four fires under one head is a realm"). The 5-fire
"strictly better" bar is a new design call (Muse 2026-10-19, Steve can
overrule) — the engine's belonging diplomacy leg needs the foreign realm at
>= 4 fires (src/js/standing.js _linkRegionalPlus); the discipline says a
seasoned bond is only ever spent on something the old bond could never
become — a realm already at 5 fires.

Named next from sim-seasonblock (evidence/2026-10-19/sim-seasonblock.md):
the consolidator switch fired at d55-57 — 5-7 days AFTER the first bond
crossed the 30-day age bar — walking age-35/37 bonds into 4-fire primaries,
and the re-courts died pre-seasoning on 2/3 stall seeds. The discipline:
never walk a bond that has already crossed the 30-day age bar unless the
candidate primary's realm has >= 5 fires. A blocked switch consumes no
"once per run" flag — it retries daily, so a late-consolidating rival can
still win the walk.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY:** mean seasoned-link-days per run across the 16-run corpus (sum
over bond-day census records of links with seasoned==true and status
active, per run, averaged over 8 seeds x {leadfeast, belongfeast}) >=
1.25x the control corpus mean. Control corpus mean = 107.4 -> GO >= 134.2.
Note: the lever only engages on the belong road — leadfeast armed is
byte-identical to control (verified in the proof test), so all movement
must come from belongfeast. Per-policy means reported as supporting
detail (control: leadfeast 186.5, belongfeast 28.3).
A miss is NO-GO, never re-scored mid-run (§14).

**GUARDRAILS (all vs the pre-registered control):** national >= control-1;
wave-4 unlocks within +/-2 of control; starvation <= control+1; no new death
mode; median survival not worse by >10d. (Starvation / death modes measured
armed vs the fresh same-probe control, disclosed below.)

**Horizon:** 180d death-aware (dead villages stop simulating; the honest
surface for a pre-seat scale question).

**Seeds:** 64201–64208 (the feastgap/seasonblock seed set) x
{leadfeast, belongfeast} = 16 runs per condition, paired on identical seeds.
Pilot only — no confirm spend unless the pilot GOes.

**Substrate (this arm):** the seasonblock substrate, verbatim:
`withSeatDrive(withWinDefer(withReposition(TF base)))` on {leadfeast,
belongfeast} tribfloor bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1
(SEATDRIVE='0' -> seatdrive pure delegation; REPOSITION unset -> inert;
VETREL unset -> companion-veteran channel OFF; KILLDISC=1 -> read-only kill
census). Armed adds SWITCHTIME=1 — the ONLY delta.

**Instruments:** scripts/probe-switchtime-20261019.js (copy of the
seasonblock probe: same bond census, beat/death/flow instruments; adds the
policy ctx's _switchGate counters to the per-seed JSON when SWITCHTIME=1,
and a compact deathChannels summary), scripts/analyze-switchtime-20261019.js
(before/after + guardrails), scripts/test-switchtime.js (proof: 12 unit
fixtures + D0 gate-off byte-identical + armed mechanism + lead invariance —
19/19 GREEN before the sweep).

**Before/after comparison:** through scripts/balance-panel.js per §15 — see
below (the panel is the instrument, the pre-registered threshold is the
judge).

**No [needs-eyes]**: policy-side only, no player-facing change.

## Results

Pilot: 16 runs control (fresh re-sweep, SWITCHTIME unset) + 16 runs armed
(SWITCHTIME=1), 8 seeds x {leadfeast, belongfeast}, 180d death-aware, 0
instrument errors, 0 bad files. The fresh control is byte-identical to the
landed seasonblock corpus on 16/16 files (the probe copy is faithful, the
gate-off path is pure delegation, master behaviorally unchanged) — the
pre-registered control stands.

**PRIMARY: NO-GO.** Mean seasoned-link-days per run across the 16-run
corpus: control 107.4 -> armed 113.7 (x1.06). GO needed >= 134.2 (1.25x).
Missed. Per §14 the run is NO-GO — not re-scored.

Per-policy: leadfeast 186.5 -> 186.5 (byte-identical 8/8 — the gate never
engages on the lead road, as designed). belongfeast 28.3 -> 40.9 (x1.45):
the mechanism works directionally — the d55-57 walks were blocked on all
three stall seeds (s64201: 21 blocks, s64202: 42, s64207: 77, all
'seasoned-bond-no-5fire-rival'; zero walks before d100), the bonds were
kept and kept their seasoned age, and on s64207 the switch stayed live and
fired at d134 into a >=5-fire realm (the strictly-better clause, verified
live: the re-courted bond's census fires >= 5).

**GUARDRAILS (belongfeast):** national 2 vs 4 — MISS (threshold: >=
control-1 = 3). wave-4 unlocks 6 vs 5 (ok). Median survival 113.5d vs 116d
(ok, within 10d). Starvation 5 vs 5 (ok, same-probe control). No new death
mode (ok). Lead guardrails all ok (identical trajectories).

**Verdict: KILL at pilot.** The primary missed and a guardrail regressed.
Per the kill protocol the policy file is deleted and belongseek.js reverted;
instruments (probe, analyzer) + evidence land.

### Why national dropped (attribution, from the corpora)

- s64202: control walked at d55, re-courted d66, reached national d81 —
  BEFORE any bond seasoned (the re-court was age 15). National arrived via
  the new realm's standing, not via seasoned-link diplomacy. Armed: 42
  blocks, no walk ever (no >=5-fire rival appeared), the kept 2-fire bond's
  realm never consolidated; the village died d96 with no national.
- s64207: control walked d57 into 4-fire Thornfield, national d72 (again
  before the bond seasoned at d87). Armed: walk delayed to d134 into a
  >=5-fire Thornfield; the village survived to d182 (control died d150) but
  never reached national — the re-court at d134 needed 30 days to season
  and the succession tribute ratchet (7,500 -> 11,250/wk, arrears from
  d161) was already running.

The discipline's theory was wrong in one load-bearing place: it treated
the walk as pure tax (restart the 30-day clock), but on these seeds the
walk's real value was moving INTO the consolidating realm — national
arrived through the new realm, never through the kept bond's seasoning.
The 5-fire "strictly better" bar is too strict when the current realm sits
at 2 fires forever: waiting for a 5-fire rival forfeits the 4-fire realm
that would have carried national. A next arm should gate on the rival's
consolidation MOMENTUM (is the rival's realm growing toward 4+?), not on a
static 5-fire bar — and should pre-register dip-grant days or national
reach, not raw seasoned-link-days (see metric review).

### The wall on this substrate (armed, 16 runs)

national 8/16 (lead 6/8, belong 2/8), table 13/16, wins 0/16, wave-4 12/16,
wave-5 0/16, median survival ~113d. Control: national 10/16, table 12/16,
wins 0/16, wave-4 11/16, median ~116d.

## Village assessment

What the villages looked like: 16 villages on the feastgap substrate with
the switch disciplined. The belong villages kept their day-20 bonds through
the d55-57 window for the first time — tributes paid steadily into 2-fire
primaries (Stonebridge on s64207 held trust in the 90s through d133),
succession churn unchanged (8-11 successions per stall run), the tribute
ratchet unchanged (grief leverage still ratchets 5,000 -> 7,500 ->
11,250/wk per qualifying succession).

Who thrived and who died and why: s64207's village SURVIVED the full 180d
for the first time on this substrate (control died d150) — the kept bond
never broke, so the succession neglect snap never fired; the village
ground on. But survival without scale: no national, no dip (the kept
realm's 2 fires never consolidated). s64201's village died d75 (control
d86) — keeping the bond didn't save it; the pantry and the field grind
decided. The divergence between roads is unchanged: lead's 3 bonds season
together and land +102; belong's single bond is now kept, not walked, and
still can't buy a consolidating realm on its own.

What was missing: not trust, not tribute discipline — a realm that
consolidates. The discipline kept the bond; it couldn't conjure the
fourth fire. The walk, for all its tax, was the only verb that moved the
village into a realm with momentum.

## Sense-testing (SENSE-TESTING LAW)

Read: the link histories + beat captures on the armed stall seeds, and the
engine's break narration (src/js/hierarchy.js breakLink).

**The walk is narrated aloud.** The seasonblock sense question is answered:
breakLink(how='walked') says "Haven walks from the table cleanly — no
blades, no hard words. The bond ends where it stood, honestly." plus an
ovEvent ('Haven walked from the table cleanly', faith-broken, direction
haven) and a gossip seed. On the armed runs the d55-57 walks simply never
happen, so the line doesn't fire; on s64207 the d134 walk fires it once —
reads sensically: the village held a bond for 114 days, then walked when
a 5-fire realm showed its hand.

**The blocked switch is invisible in the fiction — correctly.** Nothing is
said on a blocked day; the bond just continues. No beat claims a walk that
didn't happen; the census and the fiction agree everywhere checked.

**Blanks (robotic/static):** none in the beat text. One fiction note: the
tribute ratchet beats still read as designed (grief leverage named aloud
each time, the spent-card idiom honest).

## Metric review (§14 — for the NEXT run, not this one)

1. **seasoned-link-days counts seasoning-in-place.** The _linkSeasoned flag
   (age>=30, trust>=40) accumulates on the kept 2-fire bond without ever
   granting dip (rplus needs >=4 fires). The primary moved x1.45 on
   belongfeast while the thing the axis cares about (dip days, national)
   went the wrong way. A next arm should pre-register dip-grant days or
   national reach as the primary.
2. **The 5-fire bar was the wrong strictness.** "Strictly better" assumed
   the kept bond was worth keeping; on 2-fire-forever primaries the 4-fire
   rival the switch wanted was the better move. Gate on consolidation
   momentum, not a static fire count.
3. **Lead in the corpus dilutes the primary.** Half the 16-run corpus is
   structurally incapable of moving (byte-identical by design). A
   belong-road lever's primary should be judged on the belongfeast
   half-corpus — or the corpus should be all-belongfeast.
4. No re-score: the NO-GO stands on the pre-registered bar.

## Named nexts

1. **sim-switchtime-2 (momentum gate):** walk the seasoned bond when a
   rival realm's fire count is GROWING toward 4+ (consolidation momentum),
   not at a static 5-fire bar. Pre-register dip-grant days (primary) +
   national reach (guardrail, binding).
2. **steve-call (standing):** the seasonblock steve-call is still open —
   whether the succession haircut/gag/ratchet stack is the intended price
   on the belong road. This arm adds: the ratchet now bankrupts the tribute
   on kept bonds too (s64207 armed: 11,250/wk arrears from d161).

## Out-of-arm findings

(none new — the succession-cost question above is the standing steve-call,
not a new finding)

## Convergence

**killed-at-pilot.** The lever missed its primary (x1.06 vs 1.25x GO) and
regressed a guardrail (national 2 vs 4, threshold >=3). The axis stays
converging: the mechanism is real (x1.45 seasoned-link-days on belongfeast,
walks blocked day-exact, strictly-better walk verified live) but the
theory was wrong — keeping the bond forfeits the consolidating realm that
national actually needs. The wall stands: wins 0/16, wave-5 0/16.

## Balanced panel (§15)

Ran per §15: `balance-panel.js --out panel-switchtime-before` (SWITCHTIME
unset) then `--out panel-switchtime-after` (SWITCHTIME=1), 8 seeds x
belongfeast (the registry policy that routes through belongseek — the gate
engages), 180d, then `compare`. Decision: **review_required** (attached:
evidence/2026-10-19/panel-switchtime-compare.md).

The panel corroborates the probe's guardrail miss on an independent
substrate (raw feastscale belongfeast, no tribfloor/windefer/seatdrive):
National scale access 0.625 -> 0.5 (regression_watch), Community loss rate
0.625 -> 0.75 (regression_watch), Player deaths per run 4.25 -> 4.5
(regression_watch); all other metrics no_material_signal. Per §15 the
panel is evidence, not the judge — and it agrees with the judge: NO-GO.

Committed per §15: panel.json.gz (before/after) + the compare .md/.json.
The cases/ caches were deleted, never committed.

## Files

- scripts/probe-switchtime-20261019.js — sweep probe (seasonblock-probe
  copy: env-switched EVID dirs, _switchGate capture when SWITCHTIME=1,
  deathChannels summary; gate-off byte-identical to the seasonblock corpus
  16/16)
- scripts/analyze-switchtime-20261019.js — before/after + guardrails
  (primary = mean seasoned-link-days per run, 16-run corpus; GO >= 134.2)
- scripts/test-switchtime.js — proof (19/19 GREEN pre-sweep; DELETED on
  kill — it requires the deleted policy module)
- evidence/2026-10-19/perseed-switchtime-control/{leadfeast,belongfeast}/s64201–s64208.json — fresh control corpus
- evidence/2026-10-19/perseed-switchtime-armed/{leadfeast,belongfeast}/s64201–s64208.json — armed corpus
- evidence/2026-10-19/switchtime-compare.json — analyzer output
- evidence/2026-10-19/sim-switchtime.md — this file
- DELETED on kill: scripts/policies/switchtime.js (the lever), its gate
  lines in scripts/policies/belongseek.js (reverted to HEAD)

