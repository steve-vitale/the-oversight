# sim-killscred-a — kills-earned cred danger-branch routing diagnosis (DIAG-GO)

Run: Loop A worker, arm sim-killscred-a, axis scale-onramp, run
fleshout-20261031T1535Z. DIAG ONLY: zero src/js changes, zero
policy-default flips, zero lever built. The deliverable is the
routing diagnosis + design sketch for the sim-findings item
"KILLS-EARNED CRED DANGER-BRANCH LEVER" (Loop A
sim-patrolsilent-a, finding N1, DIAG-GO).
Worktree branch: sim-killscred-a. Base anchor: 18da20b58
(this worktree's HEAD; patrolsilent's anchor 19b3e1ae0 IS an
ancestor of it, so base drift was possible — but see §Base
drift: all 16 headline trajectories reproduce exactly).
Pre-registration: evidence/2026-10-31/sim-killscred-a-prereg.md
(written BEFORE any judged sims; committed before the pilot
sweep started).
Instrument: scripts/patrolsilent-diag-20261031.js (v2, reused
verbatim) + scripts/patrolsilent-sweep-20261031.js (S-PATROL
stack verbatim, EVID redirected to this arm's corpus).
Analyzer: scripts/killscred-analyze-20261031.js (this arm's
join: delegateBeat row = the pick; non-delegate-only beat =
pre-claimed; holder-beats = beats where the snapshot already
shows kills > 0).
Proof: scripts/test-killscred-20261031.js — 21/21 GREEN
(synthetic branch-classification cases, judged-corpus
reconciliation, det-gate byte-identity).
No [needs-eyes] (measurement only; nothing player-facing ships).
Panel (§15): NOT APPLICABLE, none fabricated — single-base DIAG
census, not a before/after lever comparison (same declaration
as patrolsilent-a). A later lever arm reusing this corpus as
its baseline runs the panel then.

## Verdict: DIAG-GO (judged exactly against the prereg)

1. Pilot (8 seeds) — GO. Instrument errors 0 on every seed.
2. Routing table for EVERY kills-earned holder on every pilot
   seed — GO, and extended to the full 16-seed band on confirm.
   85111 and 85114 confirm 0 patrol attempts ON THIS BASE
   (not assumed from patrolsilent — re-measured).
3. Losing code point named exactly and consistent with the
   branch counts — GO (see §The losing code point).
4. Design sketch (NOT built) with predicted effect + risks — GO
   (see §Design sketch).
5. Recorder errors 0 on all 16 judged seeds; det-gate: 85111
   and 85114 re-run byte-identical (full per-seed JSON) — GO.
6. Sense read of a trapped holder's day — GO (see §Sense test).

## The answer, in plain words

The danger branch never gets a chance to say no — it never
gets asked. The leader's pick order checks the day job (or the
cooking skill) first and returns on the spot, so a villager
who earned combat credit by killing is still filed under
their trade for every single assignment. The mechanic who
killed three times mends 271 times and is never once asked
to walk the perimeter; the farmer who killed twice cooks 257
times and is never once asked either. Their kills are in the
record — the branch that would act on the record sits below
five early returns that never let it run. Where no day job
intercepts, the danger branch works fine: the same band's
unrouted killers patrol 6–33 times each, and occupation
holders with no fit route patrol 7–64 times. The loss is
narrow, total, and located: it is the order of the branches,
not the danger roll, not trust, not presence, not the engine.

## The losing code point

scripts/policies/delegate.js, pickTask (lines 102-130). The
fit-first block returns BEFORE the danger branch is evaluated:

- line 108: `if ((spec.cook || 0) >= 2 || (spec.preserver || 0)
  >= 2) return 'cook';` — this is what traps the 85114 farmer:
  src/js/food.js specialistSkill + SPECIALTIES.preserver gives
  a farmer preserver 2, so a farmer routes to cook on skill
  alone, before the farmer->garden occupation check below it
  is even reached.
- line 111: `if (/carpenter|mechanic|engineer|tailor|seamstress/
  .test(occ)) return 'mend';` — this is what traps the 85111
  mechanic: occupation alone, no roll, no kill check.
- lines 114-118 (danger branch, reached only if no fit branch
  fired): `if (hp >= 60 && combatCred(Game, vid))` then 35%
  patrol / 25% hunt. combatCred (lines 62-70) DOES count
  kills (agency monsterKills > 0) — the evaluation is correct
  but unreachable for fit-routed holders.
- The 85108 fisherman is the same block in a third shape:
  line 108 fires first (fisherman preserver 3 -> cook) and
  beats line 109's fisherman->fish occupation check — skill
  outranks the occupation it belongs to.

What does NOT lose the branch (measured, not assumed):
- The danger roll: on danger-reaching holders it hits 60-67%
  of cred beats (e.g. paramedic 38/57, trail lead 47/70),
  matching the 35% + 25% design.
- Trust: the mechanic's trust never drops below 20 across
  the run (range 20-95), so even the trust gate would have
  let his patrols stand. The farmer's trust ranges 0-62, so
  some of his hypothetical patrols would refuse downstream —
  but attempts would still be nonzero.
- Presence: scholar at Haven 100% of beats on both trapped
  seeds (600/600, 321/321).
- Engine gates (Game.assignTask, src/js/game.js line 6395):
  downstream of the pick; zero attempts means the pick never
  happened, not that the engine refused it.
- Non-delegate paths: non-delegate patrol rows are 0 for
  every kills-earned holder on every seed — silent on all
  paths, as in patrolsilent.

## Per-seed routing table (this arm's corpus, this base)

Holder = kills-earned (snapshot monsterKills > 0). holderBeats
= at-Haven beats after the first kill. credVB = delegate picks
with hp >= 60 (patrolsilent's definition, reconciled exactly).
fitShare = fit picks / delegate picks on holder-beats.
Duty = post-kill delegate picks (all-beats totals in text).

- s85101: 111d, nat 1, table 1, won 1, w4. patrol 15.
  Kills holders: NONE. Occ-cred contrast: police officer,
  15 patrol picks, 0 fit picks.
- s85102: 111d, village-lost, nat 1, table 0, won 0, w4.
  patrol 9. Kills holders: NONE. Occ-cred: police officer,
  9 patrol, 0 fit.
- s85103: 90d, nat 0, table 1, won 1, w4. patrol 47.
  Kills holders: NONE. Occ-cred: infantry soldier 44 patrol
  0 fit; hunter 3 patrol 0 fit.
- s85104: 90d, nat 1, table 1, won 1, w4. patrol 64.
  Kills holders: NONE. Occ-cred: firefighter, 64 patrol,
  0 fit.
- s85105: 92d, nat 1, table 1, won 1, w4. patrol 13.
  - HVAC tech, 1 kill (day 7): holderBeats 213, patrol 13,
    hunt 13, credVB 51, credFit 0, credDanger 51, fitShare 0.
    Tax: 147 hp-low beats (hp < 60) — the hp gate, not fit,
    is this holder's main throttle.
  - Trail crew lead, 1 kill (day 15): holderBeats 15, all
    rest (mean hp 8.6) — wounded, not trapped.
- s85106: 96d, nat 1, table 1, won 1, w4. patrol 52.
  - Firefighter (occ-cred + 1 kill, day 33): holderBeats 64,
    patrol 19, hunt 11, credVB 50, credFit 0, credDanger 50.
  - Wild food forager, 1 kill (day 45): holderBeats 64,
    patrol 13, hunt 5, credVB 25, credFit 0, credDanger 25.
- s85107 SILENT (CRED, patrolsilent's cause, re-measured):
  102d, village-lost, nat 1, table 0, won 0, w4. patrol 0.
  Kills holders: NONE; no occ-cred holder either.
- s85108: 92d, nat 0, table 1, won 1, w4. patrol 64.
  - Fisherman, 2 kills (day 3): holderBeats 33, patrol 0,
    hunt 0, credVB 9, credFit 9, credDanger 0, fitShare 0.80
    (24 cook, 6 rest). FIT-TRAPPED, skill shape: preserver 3
    -> cook beats fisherman -> fish.
  - Fishing guide, 2 kills (day 39): holderBeats 11, patrol 0,
    hunt 0, credVB 4, credFit 4, credDanger 0, fitShare 0.40
    (4 cook, 6 rest). FIT-TRAPPED, skill shape: preserver 2
    -> cook. All-beats cook 98 (the trap predates the kills).
  - Paramedic, 1 kill (day 42): holderBeats 76, patrol 19,
    hunt 19, credVB 57, credFit 0, credDanger 57, fitShare 0.
    The danger branch working as designed.
  - Blacksmith, 1 kill (day 83): holderBeats 17, ALL
    already-assigned (held forage 17/17), credVB 0, patrol 0.
    NOT fit-trapped — never reaches pickTask at all (see
    §Other funnels).
  - Occ-cred contrast: infantry soldier, 45 patrol, 0 fit.
- s85109: 131d, village-lost, nat 0, table 0, won 0, w4.
  patrol 8.
  - Army medic, 1 kill (day 79): holderBeats 122, patrol 6,
    hunt 3, credVB 13, credFit 0, credDanger 13. 107/122 beats
    already-assigned, held hunt 106 times — one danger pick
    held across many beats (see §Other funnels).
  - Occ-cred contrast: night security guard, 2 patrol.
- s85110: 90d, nat 0, table 1, won 1, w4. patrol 13.
  - Street artist, 1 kill (day 28): holderBeats 63, patrol 13,
    hunt 7, credVB 26, credFit 0, credDanger 26, fitShare 0.
    Pre-claimed 18 (water staffing), preClaimedCred 13.
    The kills-earned holder who DOES patrol.
- s85111 SILENT (FIT-FIRST, re-measured on this base):
  201d, survived, nat 1, table 0, won 0, w3. patrol 0.
  - Mechanic, 3 kills (days 132/155/176): holderBeats 207,
    patrol 0, hunt 0, credVB 197, credFit 197, credDanger 0,
    fitShare 0.961 (199 mend, 8 rest). All-beats duty: mend
    271, rest 8 — every delegate pick in the run's 201 days
    is mend or rest. The village's entire mend total (271)
    is this one villager. Non-delegate patrol rows 0.
- s85112: 114d, nat 1, table 1, won 1, w4. patrol 65.
  Kills holders: NONE. Occ-cred: firefighter 13 patrol 0 fit;
  firefighter 52 patrol 0 fit.
- s85113: 62d, village-lost, nat 0, table 0, won 0, w2.
  patrol 42. Kills holders: NONE. Occ-cred: police officer
  7 patrol 0 fit; night security guard 35 patrol 0 fit.
- s85114 SILENT (FIT-FIRST, re-measured on this base):
  107d, nat 1, table 1, won 1, w4. patrol 0.
  - Farmer, 2 kills (day 50): holderBeats 172, patrol 0,
    hunt 0, credVB 109, credFit 109, credDanger 0,
    fitShare 0.978 (132 cook, 3 rest, 15 already-assigned,
    22 pre-claimed). All-beats duty: cook 257, rest 3.
    PreClaimedCred 13 (water staffing). The village's cook
    total is 332; the farmer does 257 (77%). Non-delegate
    patrol rows 0.
- s85115: 90d, nat 0, table 1, won 1, w4. patrol 36.
  - ESL teacher, 1 kill (day 90, the run's last day):
    holderBeats 3, all already-assigned (held water) — too
    small a sample to classify; reported, not forced.
  - Occ-cred contrast: infantry soldier, 36 patrol, 0 fit.
- s85116: 92d, nat 1, table 1, won 1, w4. patrol 41.
  - Trail crew lead, 3 kills (day 11): holderBeats 84,
    patrol 33, hunt 14, credVB 70, credFit 0, credDanger 70,
    fitShare 0. The most patrolled kills-earned holder on
    the band.
  - Occ-cred contrast: hunter, 8 patrol, 0 fit.

Band totals: 14 kills-earned holders on 9 seeds; 7 seeds have
none. Fit-trapped with credVB > 0: 4 holders on 3 seeds
(85111 mechanic, 85114 farmer, 85108 fisherman + fishing
guide). Danger-reaching kills holders: 7 (85105 HVAC, 85106
firefighter + forager, 85108 paramedic, 85109 medic, 85110
artist, 85116 trail lead). Held-starved or wounded: 3
(85108 blacksmith, 85115 teacher, 85105 trail lead).

## Other funnels (found, not chased — documented for the next arm)

- HELD-ASSIGNMENT STARVATION: a holder who always arrives at
  the beat already holding an assignment never reaches
  pickTask. 85108 blacksmith: 17/17 holder-beats held
  (forage). 85109 medic: 107/122 held (hunt 106) — here the
  held task IS danger, so holding helps; the funnel cuts
  both ways. A danger-before-fit lever alone does not fix a
  holder who never gets picked at all; the held-assignment
  lifecycle (why water/forage assignments persist across
  beats — patrolsilent's UNTRACED item) is the adjacent
  question.
- HP GATE TAX: 85105 HVAC tech spends 147/213 holder-beats
  below hp 60 doing need tasks. The hp gate is a real
  throttle for fragile killers, distinct from fit-first.
- SKILL-BEATS-OCCUPATION: the cook branch (skill) precedes
  every occupation branch, so a fisherman with preserver 3
  cooks instead of fishing. Any fit reorder must decide the
  skill-vs-occupation order too, not just fit-vs-danger.

## Design sketch (NOT built — for the next arm)

Option A — danger-before-fit when monsterKills > 0 (the
brief's named shape): move the danger block in pickTask
above the fit-first block, gated on kills > 0 only (not on
occupation cred, so occupation holders' behavior is
unchanged). A kills-earned holder with hp >= 60 then rolls
35% patrol / 25% hunt on every delegate beat they reach;
fit duties are picked only on the 40% fallthrough or when
hp < 60 / pre-claimed / already-assigned.
- Predicted effect, first-order (danger-roll math only,
  before held-assignment effects): 85111 mechanic, credVB
  197 -> ~69 patrol attempts (197 x 0.35) and ~49 hunt
  picks, from 0/0. 85114 farmer, credVB 109 -> ~38 patrol
  attempts and ~27 hunt picks, from 0/0 (the 13
  preClaimedCred beats stay water-claimed: competent
  staffing runs before delegateBeat, so the override does
  not touch them). 85108 fisherman (credVB 9) -> ~3 patrol
  attempts; fishing guide (credVB 4) -> ~1. Held-assignment
  persistence will pull realized re-rolls down from these
  first-order numbers (a stood patrol held across beats
  blocks re-picks) — the next arm must report attempts AND
  held-patrol beats, not attempts alone.
- Risks: (1) SPECIALIST STARVATION — the trapped holders ARE
  the specialist economy: the mechanic is 100% of the
  village's mending (271/271) and the farmer 77% of its
  cooking (257/332). Diverting ~60% of their beats to
  danger/need leaves those duties nearly uncovered unless
  someone else picks them up; the next arm must measure
  mend/cook totals before/after, not just patrol. (2)
  TRUST REFUSALS — the farmer's trust dips to 0, so a share
  of his new patrol attempts will refuse at the engine gate
  (attempts still count; stood share is the honest metric).
  The mechanic's trust never drops below 20, so his should
  stand. (3) HP EXPOSURE — danger picks send a 60-hp
  villager out; the 85105 HVAC shape (fragile killer) shows
  what repeated exposure costs. (4) SCOPE CREEP — the same
  block traps occupation-cred holders with fit routes (the
  fisherman shape generalizes); gating on kills > 0 only is
  the narrow fix, and the next arm should say whether it
  stays narrow.
Option B — kills-cred override, narrower: keep fit-first, but
let a kills-earned holder roll danger FIRST on a subset of
beats (e.g. one danger roll per day, or only when another
villager already covers the fit duty that beat). Predicted
effect is smaller (bounded by the subset rule) but the
starvation risk is bounded the same way. The sole-coverage
guard variant (override only when the holder is NOT the
village's only provider of that fit duty) would NOT fire on
85111 (sole mender) or 85114 (near-sole cook) — it predicts
~0 change on exactly the two seeds that motivate the lever,
so it is documented here as a NON-starter for this finding,
not a safe alternative.

## Sense test (SENSE-TESTING LAW)

Day 140 on seed 85111, from the corpus: the mechanic is at
hp 94 with 1 kill in the record, and the leader asks him to
mend at all three parts — morning, midday, evening — while
the rest of the village is asked for water, wood, teaching,
foraging, stone. Nobody on the whole village is asked to do
anything dangerous that day, or any day: the village's
201-day delegate totals contain water 1122, wood 1202,
forage 622, stone 432, scout 307, teach 211, cook 49, mend
271 — and no patrol, no hunt, ever. The mechanic's kills
keep arriving anyway (first kill day 132, second day 155,
third day 176): he meets monsters somewhere out there and
survives them, comes home, and is handed a workbench again.
The village reads as a place that knows how to keep its
tools fixed and its pantry filled, and has simply never
connected "this person has killed three times" with "this
person could walk the treeline." That is a coherent village
with a blind spot in its leader's rulebook, not a broken
counter.

## Wall numbers (this substrate, labeled as patrolsilent's)

national 10/16, table 11/16, wins 11/16, wave 4 reached 14/16,
wave 5 reached 0/16, median survival 94 days, max 201 days.
Arc II/III/IV reach, four-realm formation, trap acquisition by
source, counter discovery/counter-kill rates, and young-link
succession survival are NOT instrumented in this substrate
and are NOT reported.

## Base drift

Patrolsilent ran on 19b3e1ae0; this run on 18da20b58 (which
includes patrolsilent's own landing plus journey-scale r62
work). All 16 seeds reproduce patrolsilent's headline numbers
exactly (days, beats, at-Haven beats, assigns, patrol
attempts, deadfall hauls, wall flags — compared seed by
seed from the sweep logs). The base move did not move this
band's trajectories on the compared headlines. Full-JSON
comparison was not run (anchor differs by construction);
the claim is headline-identical, not byte-identical, except
for the det-gate pair, which ARE byte-identical re-runs on
this base.

## Metric review (for the NEXT run, never a re-score of this one)

1. The prereg's "branch taken at each decision point" needed
   two counting frames to reconcile with patrolsilent: the
   holder-beat branch table (all delegate picks, any hp)
   AND the credVB frame (hp >= 60 only). Future preregs
   should name credVB explicitly alongside the branch table,
   and name all-beats duty vs post-kill duty up front —
   patrolsilent's "271x/257x" totals are all-beats totals,
   and only the all-beats frame reproduces them.
2. "Kills-earned holder" needs a first-kill rule in the
   prereg (this run: beats count from the first snapshot
   showing kills > 0). A holder killed on the run's last day
   (85115 teacher, 3 beats) is unclassifiable; future
   preregs should set a minimum holder-beats floor for the
   trapped/free verdict.
3. Held-assignment beats need their held task in the table
   (this run added heldTasks mid-analysis); a held-danger
   beat (85109 medic's hunt) is the opposite of a held-need
   beat, and the branch table alone cannot tell them apart.
4. The danger-roll prediction in a design sketch must state
   its held-assignment caveat (this run does): first-order
   roll math overstates realized attempts when stood
   assignments persist across beats.

## Convergence state

converging — the scale-onramp axis measurement: the
kills-cred danger-branch question is answered with a located
code point, exact branch counts, and a priced design sketch.
No game change landed in this run (measurement only). The
next arm is a BUILD arm (danger-before-fit for kills > 0, or
the narrower override), judged against this corpus as its
baseline through the §15 panel.

## Files

- Pre-registration: evidence/2026-10-31/sim-killscred-a-prereg.md
- Evidence: evidence/2026-10-31/sim-killscred-a.md (this file)
- Analyzer: scripts/killscred-analyze-20261031.js
- Proof: scripts/test-killscred-20261031.js (21/21 GREEN)
- Full-band routing table: evidence/2026-10-31/sim-killscred-a-table.json
- Corpora: evidence/2026-10-31/perseed-killscred-a/
  s85101–s85116.json (16 seeds, this base)
- Det-gate corpus: evidence/2026-10-31/perseed-killscred-a-det/
  s85111.json, s85114.json (byte-identical re-runs)
- Sweep logs: evidence/2026-10-31/sim-killscred-a-pilot.stdout.log,
  sim-killscred-a-confirm.stdout.log,
  sim-killscred-a-det.stdout.log (+ .stderr.log files, empty)
- Reused, unmodified: scripts/patrolsilent-diag-20261031.js (v2),
  scripts/patrolsilent-sweep-20261031.js,
  scripts/policies/delegate.js, and the full S-PATROL policy
  stack — policy variants, not game changes
