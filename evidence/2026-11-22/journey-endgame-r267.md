# Journey endgame r267 — run note (Lane B, leg 4 ENDGAME)

Run: `playtest-loop-2-20261122T1055Z`, Lane B leg 4 endgame, substrate `dd740ad83`.
Prereg: `evidence/2026-11-22/journey-endgame-r267-prereg.md`. Probe:
`scripts/probe-endgame-r267-20261122.js`. Analyzer:
`scripts/analyze-endgame-r267-20261122.js`. Clone:
`scripts/clone-endgame-r267.py`. Pass script:
`scripts/run-endgame-r267-passes.sh`. Telemetry baseline:
`hidden_files/telemetry-baselines/endgame.json` (uw 22 / won 4 / peakVet 3
per the r263 revert).

## Headline

The tribute experiment is VOID for the second straight run — and this
time the reason is measured precisely. The pilot (4 fresh seeds,
107329–107332) never opened the deed gate on any seed, so no capstone
delivery attempt could fire at all. The new W5-FACING census names
why: 0/4 seeds faced 2 distinct wave-5 types — three faced ZERO
wave-5 monsters, one faced a single type. The stall unblocked on 2/4
seeds and neither converted; the charter is still unreachable
(0/250 peak>=3 days, zero active trade links anywhere). Per the
frozen PILOT FIRST rule, the pilot STOPPED here — the full band was
not burned on a question whose precondition never occurred. The
binding constraint on the full seat on this band is the wave-5
facing bar, not tribute readiness, not the stall, not damage: parties
kill fine (7 vKills, median 90% of monster HP) — the late monsters
simply never arrive to be faced.

## The pilot (Pass T, TRIBUTE_FIRST=1, seeds 107329–107332)

Flags: FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1
CAPABLE_VETGUARD=1 RELAYGREY=1 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1
TRIBUTE_FIRST=1. PILOT_EXIT:0, all four seeds wrote JSONs +
transcripts. All four announced d90, sat lesser, won=true. 0 full
seats.

- **107329 (wavesnw): sat lesser d99 (deferred 9d, guard=wait), won.**
  uw=4, 1 living veteran (peak 1). Deed gate never ok (w5=0).
  Scholar Giancarlo died d78 in the wild killing The Big Beast;
  Sanne (relay holder) died d94; the village sat 9 days later and
  won. 0 capstone attempts. Tribute ready 0/73 peak>=3 days.
  Bought the bundle early d27.
- **107330 (wavesnw): sat lesser d90, won.** uw=5 (unlocked d70),
  2 living veterans (peak 2). Deed gate never ok (w5=0 — unlocked
  wave 5 but faced NO wave-5 monster in the 20-day window).
  0 capstone attempts. Tribute ready 21/65 peak>=3 days but
  ready+payable 0/21. Bought d30.
- **107331 (waves): sat lesser d91 (deferred 1d), won.** uw=4,
  1 living veteran. Deed gate never ok (w5=0). 0 capstone attempts.
  Tribute ready 0/62. Bought d44.
- **107332 (waves): sat lesser d90, won.** uw=5 (unlocked d67),
  3 living veterans (peak 3). Deed gate never ok (w5=1 — faced
  cancellation only, d80). 0 capstone attempts. Tribute ready
  24/50 peak>=3 days, ready+payable 6/50 — but deedGateOk on 0 of
  those 6. Bought d42.

## Q1 TRIBUTE-FIRST — VOID (policy never engaged, second run)

Analyzer: `GO TRIBUTE-FIRST: VOID: no military_tribute delivery
fired — policy did not engage; experiment unanswered, not failed`.
The precondition (a deedGate-ok day) never occurred on any pilot
seed. The mining sharpens the VOID's shape: tribute WAS ready+payable
on 6 days (107332) — and the gate was shut on all 6. The policy is
blocked by the gate, not by tribute readiness. Per the frozen PILOT
FIRST rule, the T8 expansion did NOT run. The mechanism itself was
proven by test on r264 (5/5): tribute-first flips the delivery to
military_tribute when ready+payable. The wild experiment still awaits
a band where the gate opens. The r264 proof test
(test-endgame-r264-tribute-first.js) was NOT re-run this run — the
probe code carrying the flag is verbatim from r264 (diff-verified),
so the mechanism stands as proven on r264; re-running the same test
against the same record would re-prove it.

## Q2 W5-FACING — first run; the gate's w5 bar binds

Analyzer: `GO W5-FACING: 4 seeds reached the table, distinct w5
types faced distribution {"0":3,"1":1}; w5>=2 (deed-gate bar) 0/4`.
Three independent sections agree: W5-question (107329 no-uw5,
107330 MENTIONED-NOT-FACED, 107331 no-uw5, 107332 FACED
[cancellation]), M10-fullseat-gap (w5 0/2, 0/2, 0/2, 1/2), M21
audit (w5 0, 0, 0, 1). The two seeds that unlocked wave 5 had
20-day (107330) and 23-day (107332) windows from unlock to sitting
and faced 0 and 1 types in them. M9-supply: blockedW5=0 across the
panel — no wave-5 arrival was ever blocked; the monsters simply
never arrived to be faced. Filed as a DESIGN OBSERVATION, not a
defect: the deed gate's w5>=2 bar is Steve's design; the measurement
is that on this fresh band no village reaches it. Whether the bar or
the wave-5 arrival rate wants tuning is a Steve call. No game change
made here.

## Q3 STALL FATES — second run, in days

Analyzer: `GO STALL-FATES: 4/4 seeds stalled, 98.6 stall-days total,
fates {"REGRESSION":1,"UNBLOCK":2,"PERSIST":1}; UNBLOCK->full 0/2
(r263: 4/6) — 107329:38.1d REGRESSION d94 dgOk=never sat=lesser |
107330:18.1d UNBLOCK d70 dgOk=never sat=lesser | 107331:31.3d
PERSIST dgOk=never sat=lesser | 107332:11.0d UNBLOCK d67 dgOk=never
sat=lesser`. Both unblocks sat lesser with the gate never opening —
unblocking is necessary but not sufficient, again. Pooled with r263
(4/6 converted) and r264 (0/2): UNBLOCK->full 4/10. The REGRESSION
(107329) is the scholar-death seed: the stall broke the other way
when the veteran count fell.

## Q4 M25d — no new data

0 bought-seed losses on 4 bought seeds (all four bought early and
won). The r263 reading (1/13, at the bar) stands; the next run with
bought seeds decides whether 1/13 was the edge or the middle.
M25c-buyout-early GO (4 eligible early-days, 0 skipped, 25 early
attempts, 4 bought).

## Q5 DIALOGUE HOLDS — people check (read in full)

Transcripts read in full: 107329 (1054 SAY lines), 107330 (64),
107331 (140), 107332 (58). Defect greps across all four: "dodged
the the" 0, "The The" 0, "three times now" 0, "Names, named." 0,
never-again deflect lines 0. The two "Never again, you said" hits
are the Spare Socks keepsake line ("dry socks are civilization.
Never again, you said") — a memory, not a deflect-promise. No
resume-quote mismatches served; the namebeast topic fired (107332
haven debate: "Ugly-Eyes"; 107331 village settles on "Big Ugly").

- **The succession inside the endgame (107329):** the scholar
  Giancarlo died d78 in the wild killing The Big Beast; Sanne the
  relay-holder died d94 ("a stranger was seen in the area. The
  village is terrified"); the village sat d99 lesser and won. A
  death, a handover, a deferred sitting — and the story reads as
  one story, not three systems colliding.
- **Villagers talk like people:** Vasyl whispering that Mara met a
  stranger who knew things ("I told her she's tired"); Fanie —
  "Wren again. There was food by the hollow this morning — good
  food. Don't ask me how I know it wasn't one of us"; Sanne —
  "Dreamed again. They showed me teeth. Lots of teeth. Be ready to
  fight soon"; Dale the scout — "Something's out there. Big. We see
  it before it sees us — that's our edge"; Fatima of Thornfield
  walking in unannounced with 2,497 kcal, "no tribute, no ceremony.
  Say the word." Wants, warnings, and offers — not filler loops.
- **The audit (all four):** names the shortfall exactly, in the
  village's own numbers ("only 1 of 2 different wave-5 monsters
  faced"; 107330: "only 2 of 3 different wave-4 monsters faced;
  only 0 of 2 different wave-5 monsters faced"). Honest.
- **VACUOUS, not held (two items):** the DEPARTBEAT departure beat
  and the searvoice/crossvoice volley lines cannot be judged from
  this panel — the endgame probe carries no departures/departBeat
  field and no fight-narration lines (grep: zero occurrences of
  Searcaster/crossbow/sling/volley/bolt/stone across all 4 JSONs +
  4 transcripts), and the transcripts cover only the announce→end
  window. The r264 proof tests for those landings stand from their
  own runs; this panel neither confirms nor contradicts them.
- **Carried blemishes (same families as r264, no new F-item):**
  travel-banter pool is thin ("Stay close, yeah?" ×6 across four
  villagers; "Smell that? Something's different here." ×3;
  "The pantry won't fill itself." ×4; "You wait. The light
  changes. Nothing asks anything of you." ×3); the war-path
  namespace stays thin ("Big Ugly" names a three-raider night —
  Loud-Eyes, tick, The Herald — with no signal which one it is;
  "THE HERALD came" sits beside kills with no verb marking arrival
  vs kill, though the "put down" lines do carry days); the store
  warning repeats verbatim ("The store has fallen far from its
  recent high again — the shelves are nearly bare." ×4 on 107329).
  The keepsake refrain ("The feast was the weapon") repeats per
  item by design (test-main67 A-1b); full sentences vary.

## Analyzer verdicts (pilot, 4 seeds)

Analyzer exit 1 (one NO-GO, the pre-existing pilot artifact below).
Log: `evidence/2026-11-22/journey-endgame-r267-analyzer-t.log`.

- **M23-capstone NO-GO (VACUOUS note):** no pass-B seed reached
  deedGateReady().ok — the same fact as TRIBUTE-FIRST VOID, scored
  NO-GO by the pre-existing M23. The capstone leg never engaged.
  The VOID reading is the honest one for a pilot; M23's NO-GO is
  the pre-existing rule for a full pass (r264 metric review).
- **PRIMARY-BINDINGS VACUOUS-UNANSWERED | PRIMARY NO-GO | ALL
  NO-GO** — driven only by M23's vacuous NO-GO. Every other binding
  verdict is GO, including M1-guard (4/4 announced), M6-guard
  (2 deferred named), M20-standing-trace (mech199=true on 4/4),
  M25c-buyout-early, STALL-FATES, TRIBUTE-FIRST (VOID note),
  CHARTER-CENSUS, W5-FACING.
- All other verdicts GO, including M4-wave5-or-full (2/4 unlocked
  w5), M3b-peak (peak>=2 on 2/4, spread 4/4), M10/M11/M12/M13/M14/
  M15/M16/M17/M21/M22, KILL-ANATOMY-coverage (25/25), VETCONV,
  SECOND-VETERAN, FIRENARR/HURTRETURN/FALLEN/V-WAITVARIETY,
  LOSSKIND (vacuous — no village lost), L-PEAK, M24/M24b (VACUOUS
  — no tribute delivery, no scholar+1 day), M5 (VACUOUS — no
  forcedrift control seed in this band), M5b (vacuous GO).

## Village assessment (plain words)

Four villages, all alive at day 90, all won — each by sitting at
the lesser seat and walking out with what they had. The people
fought together (seven monster kills across the four villages, most
of them clean), learned each other's tricks, buried their dead with
feasts, and named the beasts that came for them. One village lost
its scholar twelve days before the table and still sat and won.
But the road to the full seat narrowed to a single missing thing on
every seed: a second late monster to face. Two villages never even
met a wave-5 monster; one met exactly one; the last met one and
watched the other only from the treeline. The tribute sat ready and
payable on six days in the strongest village and was never offered
the choice, because the gate never opened. And the trade charter —
the third door — does not exist in these villages' world at all:
no trade link was ever active on any of the 250 days that mattered.

## Reachable / fun / winnable

- **Reachable: YES (unchanged).** All four villages reached the
  table (announced d90, sat d90–99). The table is not a rumor.
- **Fun: YES, with the carried caveats.** The defiant walk, the
  feared mercy, the beloved finale, and the succession inside the
  endgame all read as real endings with real words; the audit names
  the shortfall honestly; the war path and the keepsakes read as a
  world with people in it. The thin travel-banter pool and the loose
  beast-naming remain the two flat notes, both carried.
- **Winnable: NOT DECIDED on this leg.** The pilot never opened the
  deed gate, so no full seat was in play. The r263 verdict (YES —
  4 full seats) stands unchallenged; this run adds no new full-seat
  evidence either way. The tribute road is still untested in the
  wild; the charter road is unreachable in practice; and now the
  wave-5 facing bar is named as the binding constraint — a village
  can unlock wave 5, bank its veterans, buy its bundle, and still
  sit lesser for want of a second late monster to meet.

## F-item

None. No new finding is filed from r267: the VOID is an experiment
that never engaged (not a defect), the charter and the w5 bar are
design observations (Steve-call), and the stall-fate split is a
second measurement, not a failure. The travel-banter pool and the
war-path namespace stay carried observations.

## Metric review (§14)

- **M20 samples-vs-days — CONFIRMED.** The analyzer's daysAt199
  (112/53/93/32) are still TRACE SAMPLES: 290 samples ≈ 96.7 days
  at ~3.0/day, matching STALL-FATES' 98.6 days. The run note
  reports days; the M20 verdict counts samples. No revision needed
  beyond the r264 correction, which this run followed.
- **peakVet baseline (3):** unchanged — no roll (telemetry quiet;
  pilot peakLivingVeterans 1/2/1/3, within tolerance).
- **FIGHTALLY2:** stays OFF. Tenth sighting not taken — this run
  does not touch it; the turn-on decision is still owed.
- **M25d:** no new data (0 bought-seed losses on 4 bought seeds).
  Bar stays <=1; r263's 1/13 at the limit still awaits the next
  bought band.
- **NOTICK/CARRY:** 0 deferrals, 0 trioCarry — seventh straight
  zero. The instrument keeps measuring nothing; the deferral it was
  built to catch has never fired on seven endgame panels. Carried.
- **M1/M6 on pilots:** M1 passed (4/4 announced); M6 passed
  (2 deferred named). The r264 worry about absolute pilot
  thresholds does not bite on a 4-seed pilot.
- **M23 vs TRIBUTE-FIRST:** same fact, NO-GO under M23 and VOID
  under TRIBUTE-FIRST. The VOID reading is the honest one for a
  pilot; no revision proposed — the run note adjudicates, the
  analyzer stands.
- **W5-FACING (new):** first run of the census; descriptive, no
  bar. The 0/4 result is the finding, not a failure of the
  instrument. Keep as a standing census section.
- **PLANWAKE (live head delta):** no launch-count metric exists in
  this analyzer, so PLANWAKE's ignition effect is visible only
  through chain outcomes — which are unchanged on this pilot (0/4
  full seats, gate never ok, same as r264). The establishment leg
  owns the launch-count measurement; the endgame leg records the
  chain as it now plays. Not a finding, a limitation note.

## Telemetry

`telemetry-check.js` on Pass T (4 files, 3 metrics
veterans.unlockedWave/won/peakLivingVeterans): **quiet**. Baseline
NOT rolled.

## Gate

Certified by the adoption (serialized; the run's own gate timed out
at ~11:54Z under extreme load with a partial 372-byte log, no
summary). Two gate runs: the first on base 87b2122f3 gave 339/5 in
749s, then master moved to be0cfca40 (leadgate + r250 + 0930Z
adoptions, incl. src/js changes), so the branch was rebased and the
gate re-run on the rebased tip 1f093b9e5: **339 passed, 5 failed in
667s, 0 attributable**. The 5 are exactly the standing set:
measurement-proof staleness pair
(test-measurement-proof-update.js, test-measurement-workflow.js),
phone-frame stale receipt (test-phone-frame-proof.js), and two
120s deed-attainment timeouts
(test-living-garden-deed-attainment.js,
test-one-person-army-deed-attainment.js — both pass solo; the
120s cap under load, per r264). Full log:
`evidence/2026-11-22/journey-endgame-r267-gate.log` (also copied to
goal `hidden_files/check-quick-r267-gate.log`).
