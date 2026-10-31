# sim-pocketdesign-a — the pocket-call DESIGN-INPUTS census (DIAG-GO on all four inputs)

Run: Loop A worker, arm sim-pocketdesign-a, axis scale-onramp, run
fleshout-20261031T0915Z. DIAG ONLY: zero src/js changes, zero
policy-default flips, zero edits to existing files
(scripts/policies/deadfall-b.js and scripts/policies/delegate.js
reused VERBATIM as layers; delegate is a policy variant — the
existing delegating-player layer — not a game change).
The deliverable is a landed instrument set + this census.
Worktree branch: sim-pocketdesign-a. Base anchor: this worktree's
HEAD at sweep time (recorded per seed as anchorCommit in the
per-seed JSONs).
Pre-registration: evidence/2026-10-31/sim-pocketdesign-a-prereg.md
(written BEFORE any judged sims, plus a v2 addendum written
before confirm judgments; judged against it below).
Instrument: scripts/pocketdesign-diag-20261031.js (PDIAG=1,
read-only, installed on top of ammo-diag + supply-diag +
stickfiber-diag + pocketcall-diag, all verbatim) +
scripts/pocketdesign-sweep-20261031.js (pocketcall-sweep logic +
PD instrument + PDSTACK patrol|supply) +
scripts/pocketdesign-analyze-20261031.js (derives every judged
number from the per-seed JSONs only).
Proof: scripts/test-pocketdesign-20261031.js — 43/43 GREEN
(attributeGate fixtures incl. site-aware patrol rule, nodeDelta
fixtures, static read-only scan, synthetic corpus through the
real analyzer, live gate on NON-band seed 85901, 60d, patrol
stack, byte-identical re-run, zero errors).
No [needs-eyes] (measurement only; nothing player-facing ships).
Panel (§15): NOT APPLICABLE, none fabricated — single-base DIAG
measurement on alternative bands (S-PATROL is a measurement
band, not a before/after lever arm), same declaration as
pocketcall-a. A later lever arm reusing this corpus as its
baseline runs the panel then.

## Verdict: DIAG-GO on all four inputs (judged exactly against the prereg)

1. INPUT 1 PATROL BAND — GO (band found). Screen bar (≥ 8
   resolvePatrol calls on ≥ 2 seeds) met on S-PATROL: 141 calls
   on 6/8 screening seeds, re-verified on the v2 instrument
   re-run. Confirm band (16 seeds): 374 patrol calls on 14/16
   seeds. PASS.
2. INPUT 2 SAT-OUT GATE ATTRIBUTION — GO. 211/211 sat-outs
   attributed (100% ≥ 80%), n = 211 ≥ 20, zero 'other', zero
   integrity flags. PASS.
3. INPUT 3 TOP-UP MOMENT — GO. Timeline completeness 7/7
   (100%); every dry-at-meeting fight classified into exactly
   one preregistered sub-class (never-pocketed-in-outing 5,
   pocket-failed 1, spent-in-outing 0, timeline-other 0); the
   band-wide spend-timing table is published below. PASS.
4. INPUT 4 CROSS-NODE SHOUT INPUTS — GO. Shout-row completeness
   7/7 (100%); the 6-fighter call-design population tabulated by
   node delta (d0:1, d1:3, d2:2) and by channel (C1:1, C2:0,
   C3:1, C4:0, union 2, unreachable 4). PASS.

## Pilot + screen + confirm (instrument v2 note)

Pilot (85101–85108, S-PATROL): PD instrument fires on all 8,
errors 0 on all 8 (ammo + supply + stickfiber + PC + PD),
PD volley rows join 1:1 with ammo-diag wave ≥ 4 fight rows on
every pilot seed, PD pocket-seq counts equal ammo-diag
pocketCalls counts on every pilot seed, 5 wave ≥ 4 fights —
pilot GO. The v1 screen run passed the same bars but exposed
two instrument gaps (callerOf misread every ranged fight as
other:Object.<anonymous>; fought-by-wave missing for low-wave
patrol fights). Both were fixed in v2 BEFORE confirm judgments
(named `fieldFight` wrapper; departure rows carry
volleyDuringWaves/Ranged/Shots), and the screen seeds were
re-run with v2: every v1 seed line reproduced EXACTLY (same
fights, patrol counts, pockets, objective departures), proving
v2 trajectory-neutral. All judged numbers below come from v2.
The contingent S-ASSIGN layer was never written (screen passed
on S-PATROL) and the S-SUPPLY fallback was never run. No clean
negative was needed for any input.

## The answer, in plain words

The call design now has its four measured inputs, and the
picture is sharper — and stranger — than the supply band
suggested. First, patrols DO fire once someone actually assigns
them: on the delegating-player band, 374 patrols walked in
sixteen villages, and 257 of the 258 that went out met a
monster — the perimeter is never empty (exactly one uneventful
patrol band-wide). Patrols fight small beasts (165 wave-1, 37
wave-2, 54 wave-3, and a single wave-4 meeting, a melee
patroller fleeing a Suburb). Second, nobody sits out
mysteriously anymore: all 211 sat-outs are explained, and the
explanation is almost always the same — hurt, no healer (206
heal, 5 sick, 0 range, 0 other). The range gate never fires,
because the village never even asks a homebody to leave. Third,
dryness on this band is almost never about spent pockets: five
of six dry fighters were never called at all, and the sixth
went out properly and still got nothing — because the pile had
no fiber for ten days while sitting on 2,002 stones. The bow's
chain breaks on fiber, not sticks. Fourth, the shout inputs
say a one-node shout would reach four of six dry fighters and
a two-node shout all six — but two of the six were ALREADY
reachable (one standing on the same node as the leader, one
marching in the crew) and still fought dry. Reachability is
not the missing piece; a trigger is. The call must fire on
something — a departure, a sighting, a muster — not merely be
possible.

## Band numbers (judged band, 16 seeds, S-PATROL stack)

- Wave ≥ 4 fights: 20 (non-ranged 13). Ranged: 7. Lower-wave
  fights counted only: 1,779 (fieldFight calls 1,799).
- Class counts (pocketcall priority order ARMED >
  NEVER-CALLED > NEVER-DEPARTED > DRY-AT-HOME > DRY-AT-FIGHT):
  ARMED 1, NEVER-CALLED 5, NEVER-DEPARTED 0, DRY-AT-HOME 0,
  DRY-AT-FIGHT 1. Anomalies 0. Join problems 0, pocket-seq
  problems 0, instrument errors 0/0/0/0/0.
- By weapon: sling 2 (1 ARMED, 1 NEVER-CALLED), bow 1
  (NEVER-CALLED), crude_bow 4 (3 NEVER-CALLED, 1 DRY-AT-FIGHT).
  By caller: expeditionMonster 2, resolveWildMonsterEncounter
  3, aidFight 2. No patrol ranged fight at wave ≥ 4 occurs
  (the single wave-4 patrol fight is melee — see Input 1).
- Outcomes (ranged): vFlee 2, vDie 4, mFlee 1, vKill 0.
- Volley (ranged): 1 fight with shots, 4 shots, 73 damage
  (Ruby, the ARMED fight — the band's only volley).
- Departures band-wide: 559 pocket-site calls, 348 went, 211
  sat-out (37.7%). Objective departures (context only):
  7,159. Expedition returns: 78.

## INPUT 1 — Patrol band: FOUND on S-PATROL (delegate + deadfall)

- Calls: 374 on 14/16 seeds. By seed: 85101:1, 85102:15,
  85103:43, 85104:0, 85105:34, 85106:9, 85107:0, 85108:39,
  85109:4, 85110:46, 85111:33, 85112:18, 85113:3, 85114:48,
  85115:4, 85116:77.
- Outcomes: heal-sat-out 116, uneventful 1, fought 257.
  257/258 went patrols fought (99.6%). The one uneventful
  patrol is the band's only "walks an empty perimeter" case.
- Fought split by wave (departure-based, primary): wave-1 165,
  wave-2 37, wave-3 54, wave-4 1. The wave-4 patrol fight is
  s85113 d198, visjoin_191 (Hugo, melee, no ranged weapon) vs
  The Suburb, outcome vFlee — see §Sense test. Caller-based
  patrol ranged fights: 0 (correct, but only because
  ammo-diag records wave ≥ 4 fights and this fight is melee;
  caller-based counts must never be quoted as "patrol ranged
  fights" without the wave qualifier — see §Metric review).
- Patrol ranged fights (departure-based): 95 of 257 fought
  patrols had a ranged weapon (volley object non-null) — all
  at waves 1–3. Patrols DO produce ranged fighting; they just
  almost never meet wave ≥ 4 beasts (1/257).
- Assignment funnel: assignTask patrol attempts 429, standing
  301, refused 128, patrol calls 374. Calls = 301 (from
  assignTask-standing) + 73 (residual from non-assignTask
  paths: deal/appeal/task-lead assignments, which the
  instrument does not count) − unknown resolution-gate losses
  (standing assignments deleted at resolution when HP < 40,
  unquantified — see §Metric review). Per-seed extremes:
  s85114: 12 attempts but 48 calls (other paths dominate);
  s85109: 41 attempts, 36 refused, 5 stood, 4 called (a dying
  village refusing the leader); s85108: 10 attempts, 39 calls.
- Patrol-silent seeds: 85104 and 85107 record ZERO patrol
  assignTask attempts (not a patrol-call failure — the
  assignment never happened). Deadfall hauls there are nonzero
  (5, 7), so Haven presence is not literally zero; whether the
  binding constraint is scholar-at-Haven upkeep presence or
  combat-cred availability is unmeasured — backlog item B1,
  not chased here (staying on axis).

## INPUT 2 — Sat-out gate attribution: 211/211 (100%)

- Gate table: heal 206 (97.6%), sick 5 (2.4%), range 0, other 0.
  Per site: startExpedition heal 90 + sick 5 = 95; resolvePatrol
  heal 116. Integrity flags: 0 (no heal-true-but-went, no
  went-without-away, no range-attributed-but-cached-maxD≥1).
- Sat-out rate: 211/559 = 37.7% of pocket-site departure calls
  (pocketcall supply band: 95/203 = 46.8% — different policy
  band, labeled, never claimed as a lever effect; no panel was
  run).
- RANGE IS STRUCTURALLY ZERO (finding, not missing data):
  startExpedition is only ever invoked for wanderers/explorers
  (agencyTick's profile filter), so a homebody (maxD 0) never
  reaches the range gate; resolvePatrol has no range gate at
  all. The 'range' attribution exists in the instrument but
  has no live population on either band measured so far.
- Concentration: sat-outs pile onto repeat villagers —
  hannah_kim 42 sat-outs on s85114 (HP at sat-out spanning
  19–68, never healed: no healer, so the gate benches her
  permanently while the leader keeps re-assigning her),
  gen_ou258z1 36 on s85111, then 16/16/16/15. The gate split
  alone understates this: the same hurt people sit out again
  and again (see §Sense test + backlog B4).
- Side observation (not a gate): the d198 wave-4 patrol
  departure row shows sickBefore=true — patrols do NOT screen
  sickness (resolvePatrol has no sick gate), so a feverish
  patroller walked out and fought a Suburb. Expeditions screen
  sick; patrols don't (backlog B2, a parity question).

## INPUT 3 — Top-up moment: priced, not re-proposed

Timeline completeness 7/7. Dry sub-classes: never-pocketed-
in-outing 5, pocket-failed 1, spent-in-outing 0,
timeline-other 0. The Jovan spent-in-outing pattern from the
supply band does NOT reproduce on this band (0 cases) — the
top-up design must still cover it (it is proven on the other
band), but on THIS band the priced moments are different:

(a) FIRST-CALL MOMENT (dominant here, 5/6 dry): the five
    never-called fighters never pocketed in any outing — four
    never departed at all (no outing), one pattern repeated
    across seeds. A departure-only top-up cannot help them at
    all; they need a first call.
(b) POCKET-FAILED MOMENT (1/6 dry, mechanism priced exactly):
    gen_ou258z1 (Bo), s85111: bow since day 2, went on
    expedition day 127, pocket call added 0 arrows
    (crafted=0 — the craft attempt never ran). Cause: the pile
    held FIBER 0 for days 120–130 while holding sticks 7 and
    stone 2,002. Arrow recipe needs fiber; the bow chain breaks
    on fiber, not sticks (backlog B3). His earlier pockets show
    the chain working when fiber exists (days 13–14 crafted
    batches of 5) and failing the same way on days 109–117.
    He fought dry day 131 and died.
(c) WORKING CHAIN (the ARMED fight, priced step by step):
    ruby_callaghan, s85102: pocketed 6 stones day 20, spent
    them across low-wave volleys days 22–27 (2+1+1+2 = 6,
    empty by day 27); re-pocketed 6 day 54, spent 2 day 57;
    topped up 4→6 at departure day 74; spent 1 on ducks day
    74; fired 4/73 into the wave-4 Suburb day 78 with 1 stone
    left. Departure top-up WORKED here — because the meeting
    came 4 days into the outing, not late, and because stones
    (unlike arrows) come straight from the pile reservoir.
(d) BAND-WIDE BURN: low-wave volleys 126 fights / 284 shots —
    volleys fire regularly below wave 4, so ammo DOES burn
    before wave-4 meetings in general; it just didn't produce
    a spent-in-outing dry case on this band (the dry fighters
    never got ammo to burn). Pockets band-wide: 348 (= went
    departures, exactly, as the went definition requires);
    274 added zero carried — almost all weaponless villagers
    (pocket early-returns with no weapon), not failures;
    craft attempts 50, failed rolls 23 (46%).

## INPUT 4 — Cross-node shout inputs: the range table

Call-design population = 6 (5 NEVER-CALLED + 1 DRY-AT-FIGHT).
By node delta (fighter ↔ scholar, Manhattan): d0:1, d1:3,
d2:2. By channel: C1:1, C2:0, C3:1, C4:0, union 2,
unreachable 4. Scholar at Haven at fight time: 3/6. Fight
optAllies > 0: 4/6. Fighter distance from Haven: 0,0,1,1,2,0
(all within 2 nodes of home). Per fighter:

- s85105 d74 nikolai_volkov, bow, eulogy, vDie: delta d0,
  scholar at Haven, fighter at Haven, C1 TRUE (same node),
  crew no, party no, optAllies 1 (Tarek). The leader stood
  where he stood. Still no arrows.
- s85106 d52 app_mgpsphn2492, crude_bow, algorithm, vDie:
  delta d1 (adjacent node), scholar out, C-all absent,
  optAllies 1. Adjacent-node non-contact, re-affirmed.
- s85111 d131 gen_ou258z1, crude_bow, reunion, vDie:
  delta d2, scholar at Haven, fighter 2 nodes from Haven,
  C-all absent, optAllies 1 (Sofia). The pocket-failed case.
- s85111 d196 visjoin_184, sling, herald, mFlee: delta d2,
  scholar out, C-all absent, optAllies 0. The only call-pop
  fighter with nobody attached to the fight at all.
- s85113 d149 nadia_khoury, crude_bow, algorithm, vFlee:
  delta d1, scholar at Haven, C3 TRUE (in the crew, 2 alive
  crew others), optAllies 2 (Elijah + Giulia). In the crew,
  allies joined — still no arrows.
- s85114 d81 app_mgpspj4r335, crude_bow, algorithm, vDie:
  delta d1, scholar out, C-all absent, optAllies 0.

Design inputs, stated as measurements: a shout range of
Chebyshev ≤ 1 (same + adjacent node) covers 4/6; range 2
covers 6/6. C2 (same-grid ≤ 1) fires 0 times on two consecutive
bands — grid positions are null even for the on-node fighter
(see §Metric review: C2 may be unpopulated, not out of range).
C4 (party) fires 0 times. And the two REACHABLE-but-never-
called cases (nikolai d0/C1, nadia C3) prove reachability is
not the binding constraint: the call needs a TRIGGER (a
departure, a sighting, a muster), because help channels already
reach these fighters mid-fight (optAllies > 0 on 4/6 — allies
charge in, bolts don't).

## Wall numbers (honest, same caveats as pocketcall)

National 9/16, table reached 14/16, wins 10/16, wave 4 unlocked
14/16, wave 5 unlocked 2/16, median survival 90 days, max 201
days. Table/win flags are the policy stack's substrate flags,
not ordinary-play claims. Cross-band note (labeled, never an
effect claim — no panel was run): pocketcall's supply band
read national 12/16, table 11/16, wins 11/16, wave 4 10/16,
wave 5 0/16, median 95d, max 202d. The bands differ by the
delegate layer; whether delegate moves any wall number is a
future panel arm's question, not this census's finding. Arc
II/III/IV reach, four-realm formation, trap acquisition by
source, counter discovery/kill rates, and young-link succession
survival are NOT instrumented in this substrate and are NOT
reported.

## Sense test (SENSE-TESTING LAW)

Five transcripts read as scenes (ammo-diag log copies):

1. ARMED — Ruby, s85102 d78 (volley 4/73, vFlee):
   "Ruby walks straight into The Suburb. No avoiding it. /
   Ruby sees The Suburb coming and nocks an arrow — the fight
   opens at range (4 shots). / loosed — 26 / loosed — 22 /
   loosed wide — the arrow buries itself in the dirt. (spent) /
   loosed — 25 / Ruby lowers the bow — The Suburb is on them
   now. (3/4 hit) / ... / Ruby sees how this ends — and runs
   while running still works."
   Judgment: the volley reads as a real opening that changes
   nothing about the outcome class — 73 damage against a
   1,400+ HP Suburb is ~5%. Second data point (after Maya's
   48) for the volley-as-win question, still open: volleys
   soften, they don't decide wave-4 fights.
2. NEVER-CALLED, same-node — Nikolai, s85105 d74 (vDie):
   "Nikolai has Bow but no arrows — the string stays drawn,
   useless. / R1: Nikolai strikes for 16 / R1: Final Chapter
   hits Nikolai for 41 (59 left) / R2: Nikolai stops mid-fight
   and binds the wound — field medicine, +20 HP. / Nikolai is
   losing — shouts for help! Tarek charges in! / R3: Final
   Chapter hits Nikolai for 50 (0 left)"
   Judgment: the scene is coherent and the absence is sharp —
   he fights, treats his own wound, his shout IS answered
   (Tarek charges in), and he still dies with an undrawn bow
   on the same node as the leader. The shout that brings a
   swordsman is not the shout that brings a bolt.
3. NEVER-CALLED, crew — Nadia, s85113 d149 (vFlee):
   "Nadia has Crude bow but no arrows — the string stays drawn,
   useless. / ... / Nadia is losing — shouts for help! Elijah
   charges in! / Elijah answered Nadia's shout, but Nadia is
   past holding — they run while running still works."
   Judgment: same lesson from the crew side — she marched
   with the crew, the crew answered, the quiver stayed empty.
   A call design that leans on "the crew will handle it" has
   to explain why the crew carries swords but no arrows.
4. DRY-AT-FIGHT, pocket-failed — Bo, s85111 d131 (vDie):
   "Bo walks straight into The Reunion. No avoiding it. / Bo
   has Crude bow but no arrows — the string stays drawn,
   useless. / ... / R1: Bo's eyes go red. Next 3 strikes hit
   twice as hard. (Rage) / Bo is losing — shouts for help!
   Sofia charges in! / R3: Bo strikes for 108 (x2.5) / Bo
   draws its eye — 'Me. I'm the problem.' The beast turns. /
   R3: Your Move hits Bo for 44 (0 left)"
   Judgment: reads like a person, not a broken bow — Rage,
   a 108-damage strike, a line of dialogue, an ally joining,
   and death anyway. The dryness never announces itself as a
   bug; it announces itself as a bow with no arrows, which is
   exactly what it is. His arc (sat out hurt days 112–115,
   went day 117, went day 127 into a fiber-empty pile, died
   day 131) is the census's most complete human story.
5. PATROL, wave-4 — Hugo, s85113 d198 (vFlee):
   "R1: Hugo strikes for 17 / R1: HOA Fine hits Hugo for 44
   (47 left) / R2: Property Tax hits Hugo for 28 (19 left) /
   Hugo is losing — shouts for help! Giulia charges in! /
   Giulia answered Hugo's shout, but Hugo is past holding —
   they run while running still works."
   Judgment: nothing in the log says "patrol" — a patrol fight
   reads exactly like a wild fight. If patrols are meant to
   feel like deliberate perimeter work, their narration doesn't
   carry it; the fight log alone cannot tell a patrol from a
   chance meeting. (Narration observation, not a verdict —
   the departure row proves it was a patrol; the scene does
   not.)
Sat-out sense read (traced gates, no say-lines in corpus —
stated honestly): hannah_kim sat out 42 times at 19–68 HP with
no healer ever patching her. That reads as a village failing
a hurt member, not as a filter working: the leader keeps
asking, she keeps resting, nobody heals her. The gate is
honest; the system around it is not.

## What the village looked like, in plain words

A village where the leader finally delegates — and the moment
someone is asked to walk the perimeter, the perimeter is full:
patrols meet something nearly every time out, mostly small
beasts, once something huge. A village where the hurt keep
getting asked and keep resting, where the pile holds thousands
of stones and no fiber at all, where the bow woman who does
everything right still flees a Suburb, and where two fighters
die dry within shouting distance of the people who could have
armed them — one standing on the leader's own node, one
marching in the crew. The supply rung holds. The call is still
the whole hole for ranged fighters, and now it has a shape
with numbers: it must fire on a trigger (not on reachability),
it must reach fighters who never depart (5/6 of the dry), it
must survive a fiber drought (the pile can be full and still
useless for bows), and it must top up mid-outing for the
Jovan pattern proven on the other band — even though this
band's dryness is dominated by the first call, not the top-up.

## Findings for the coordinator (reported here, NOT edited into hidden_files/sim-findings.md — coordinator owns that file)

- B1 (new): PATROL-SILENT SEEDS (85104, 85107). Zero patrol
  assignTask attempts despite nonzero deadfall hauls — the
  assignment never happened, so the cause (scholar-at-Haven
  upkeep presence vs combat-cred availability) is unmeasured.
  Needs a scholar-presence + combat-cred census before any
  claim about patrol coverage.
- B2 (new): PATROLS DON'T SCREEN SICKNESS. s85113 d198: a
  sick patroller (sickBefore=true) walked out and fought a
  wave-4 Suburb. Expeditions screen sick; patrols don't. Parity
  question for the coordinator.
- B3 (new): FIBER DROUGHT BREAKS BOWS. s85111 days 120–130:
  pile fiber 0, sticks 7, stone 2,002 — bow ammo's binding
  material is fiber, and the deadfall duty hauls sticks, not
  fiber. A future supply arm should price fiber, not sticks.
- B4 (new): REPEAT SAT-OUT CONCENTRATION. hannah_kim 42×,
  gen_ou258z1 36× — the heal gate without a healer permanently
  benches the same people while the leader keeps re-assigning
  them. Design question: back off re-assignment after N
  sat-outs, or get healing to them?
- B5 (new): UNEVENTFUL PATROLS ~0 (1/258 went). nearestWorld-
  Monster essentially always finds something near Haven — the
  "walks an empty perimeter" branch almost never happens on
  this band. Patrol narration/expectations should assume a
  meeting, not quiet.
- B6 (new): C2 GRID CHANNEL NEVER POPULATES. fighterGrid null
  for all call-pop fighters on two consecutive bands, even the
  on-node one — C2 = 0 means "unpopulated", not "out of
  range", until a code read establishes when village.positions
  entries exist.

## Metric review (for the NEXT run, never a re-score of this one)

1. The assignment funnel does not close: assignTask is not the
   only assignment path (deal/appeal/task-leads uncounted) and
   standing assignments lost to the <40 HP resolution gate are
   unquantified, so the residual (73) is a lower bound on
   non-assignTask calls, not an exact count. A future funnel
   census should wrap the deal/appeal assignment writes and
   the resolveAssignments HP-gate branch.
2. Caller-based "patrol ranged fights" is 0 by construction
   for low-wave fights (ammo-diag records wave ≥ 4 fights
   only). Departure-based is the primary patrol-ranged metric;
   caller-based must always carry its wave qualifier.
3. C2's grid channel never fires in the wild on either band.
   Until a code read establishes when village.positions
   entries exist for villagers, C2 = 0 must be reported as
   "unpopulated", never as "fighters out of grid range".
4. 'Range' attribution has no live population on either band
   (agency profile filter upstream; no range gate on patrols).
   A future attribution census should either retire 'range' as
   a live gate or instrument the upstream profile filter as
   the gate (never-invoked vs sat-out).
5. awayAfter on patrol departure rows is polluted by stale
   objective-away entries (patrols don't set away; objDepart
   does). Never use awayAfter for patrols — the analyzer
   already restricts the went-without-away check to
   expeditions, but a future reader of the raw rows could be
   misled.
6. Sat-out reporting should include per-villager concentration
   (top repeat sat-outers), not just the gate split — the gate
   split alone hides that the same hurt people sit out dozens
   of times.

## Convergence state

converging — the scale-onramp axis measurement: the pocket-call
design inputs are now fully measured (patrol band found,
sat-out gates attributed 100%, top-up moments priced, shout
inputs tabulated by range), but the call itself is still
undesigned and unbuilt.

## Files

- Pre-registration: evidence/2026-10-31/sim-pocketdesign-a-prereg.md
  (including the v2 instrument addendum)
- Evidence: evidence/2026-10-31/sim-pocketdesign-a.md (this file)
- Instrument: scripts/pocketdesign-diag-20261031.js (PDIAG=1, v2)
- Sweep: scripts/pocketdesign-sweep-20261031.js (PDSTACK patrol|supply)
- Analyzer: scripts/pocketdesign-analyze-20261031.js
- Proof: scripts/test-pocketdesign-20261031.js (43/43 GREEN)
- Corpora: evidence/2026-10-31/perseed-pocketdesign-a/patrol/
  s85101–s85116.json (S-PATROL stack; v2 instrument throughout)
- Reused, unmodified: scripts/ammo-diag-20261031.js,
  scripts/supply-diag-20261031.js,
  scripts/stickfiber-diag-20261031.js,
  scripts/pocketcall-diag-20261031.js,
  scripts/policies/deadfall-b.js (VERBATIM staffing),
  scripts/policies/delegate.js (VERBATIM delegating-player layer)
- Probe outputs (quoted above, /tmp, not committed):
  /tmp/pd-screen-analyze.txt, /tmp/pd-screen2-analyze.txt,
  /tmp/pd-full-analyze.txt
