# sim-pocketcall-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, arm sim-pocketcall-a, axis scale-onramp, run
fleshout-20261031T0726Z. Arm type: DIAG ONLY — zero src/js changes,
zero policy-default flips, zero edits to existing files (including
scripts/policies/deadfall-b.js, reused VERBATIM). The deliverable is
a landed instrument set + census + this evidence. Nothing in this
arm changes the game, so no [needs-eyes] is expected.
Worktree branch: sim-pocketcall-a. Base anchor at prereg time: the
worktree HEAD when the judged sweep runs (recorded per seed as
anchorCommit in the per-seed JSONs). The anchor differs from
sim-deadfall-b's b2518ece2, so judged numbers are judged on THIS
base only; any comparison with deadfall-b's corpus is labeled a
reproduction check (fight identity + volley fight), never quoted
as current, and a mismatch is reported as base movement, never
smoothed (mustercall lesson).

## Canon (read first; no invention)

- docs/CANON.md read. NO canon doc covers a villager pocket-call /
  home ammo top-up design: the manifest's table has no such doc.
  This is stated here rather than inventing canon. The census
  therefore copies CODE precedent, not a canon design: the
  departure pocketing rule (game.js villagerPocketAmmo, gap-ammo
  2026-10-27: called ONLY from departure sites — resolvePatrol
  and startExpedition — AFTER gear-up and AFTER the sit-out
  checks, never mid-fight, never for the player), the deadfall
  duty (deadfall-b prototype code, present in this worktree's
  game.js), and the code's own sensed-contact channels (below).
- Perception law (Steve 2026-10-28): villagers are real people
  with eyes — they know who's around only through their own
  senses: seeing someone in the same place, hearing a shout,
  following someone they've seen. No global roster or "who is
  around" list is fed into any decision here, and none is used
  even as a census input: the sensed-contact test below reads
  ONLY the fighter's own node/position, the scholar's own
  node/position, the travelling crew the fighter is in, and the
  fighter's own party membership. It never iterates the roster,
  never calls a "who is around" helper (no npcsOnNode, no
  campPeopleIds, no partyMembers), and never derives reachability
  from a roster scan. A fighter counts as reachable only through
  one of the four sensed channels below.

## Question (from deadfall-b §Blanks, stickfiber-b rank 2)

Deadfall-b landed the supply rung on its band (pile sticks > 0 on
16/16, craft attempts 35) but still saw exactly ONE volley fight
in the whole band (Maya Singh, s85103 d41). The remaining hole is
the CALL that reaches fighters who never depart. This arm sizes
and scopes that hole on the same seed band (85101-85116), on the
deadfall-staffed substrate: of every ranged fight, how many
fighters were never called at all, how many were called-to-depart
but never went, how many went out but stayed dry (and where),
and how many walked in armed — and, for the never-called, how
many were even reachable through sensed contact at fight time.
This arm does NOT design or build the call; it measures the hole
the design must fill.

## Substrate decision (stated up front, one paragraph)

Deadfall staffing ON is the substrate, because supply is now the
measured rung: deadfall-b proved pile sticks exist on 16/16 seeds
under this staffing, so a census run with staffing OFF would
re-measure the already-closed supply block (pile sticks 0, bows
material-blocked) instead of the call block, and every dry bow
fight would be ambiguous between "no call" and "no sticks to
call with". With staffing ON, the pile at fight time separates
the two: a dry bow fight with pile sticks/fiber sufficient for
its recipe is call-blocked (the call is the binding block), while
a dry bow fight with a short pile is still supply-blocked (the
rung is not yet sufficient at that moment, e.g. a transiently
empty pile or a failed blind roll). The census therefore reports
both splits for every dry ranged fight — supply-blocked vs
call-blocked — on the staffed substrate, and the verdict never
claims a call effect that is really a supply effect. The
staffing layer is scripts/policies/deadfall-b.js VERBATIM
(DEADFALL_B=1); it is not edited, forked, or re-tuned here.

## Substrate (shared supply band, so numbers are comparable)

Seeds 85101-85116, policy stack
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))) +
withDeadfall staffing (DEADFALL_B=1), env FEASTSCALE_R13=1
TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1,
death-aware horizon (DAYS=200 cap; dead villages stop, +10d tail
max, per the harness — matching deadfall-b's horizon, read from
its sweep, not assumed). Instruments, all read-only, installed
in this order: AMMODIAG=1 (ammo-diag-20261031.js, verbatim) +
SUPPLYDIAG=1 (supply-diag-20261031.js, verbatim) +
STICKFIBERDIAG=1 (stickfiber-diag-20261031.js, verbatim) +
PCDIAG=1 (NEW scripts/pocketcall-diag-20261031.js, this arm).
Sweep: NEW scripts/pocketcall-sweep-20261031.js (deadfall-sweep
logic + the PC instrument + PC fields in the per-seed JSON),
writing evidence/2026-10-31/perseed-pocketcall-a/census/
s<seed>.json ONCE. Analyzer: NEW
scripts/pocketcall-analyze-20261031.js (derives every judged
number from the per-seed JSONs only, no re-simulation). Proof:
NEW scripts/test-pocketcall-20261031.js (pure classification +
sensed-contact fixtures; static read-only scan of the instrument;
live gate on NON-band seed 85901, 60d, staffing ON, byte-identical
re-run — band seeds never appear in the proof, so proof runs are
not judged sims). The proof must be green BEFORE judged sims are
judged.

## Universe (scope, stated so "every" is auditable)

"EVERY ranged fight" means every wave >= 4 field fight whose
fighter carries or is equipped with a ranged weapon
(rangedAmmoId non-null in the ammo-diag fight record) — the same
universe as ammo-a / supply-b / stickfiber-b / deadfall-b, whose
instrument records wave >= 4 fights in full and counts lower-wave
fights only (fieldFightCalls / lowWaveFights reported alongside
so the censoring is visible, not hidden). A ranged fight whose
fighter's weapon is identified only post-fight (carried but
unequipped at entry, auto-equipped by fight entry gear-up) counts
exactly as in ammo-diag (post-fight weapon identity, pre-fight
ammo quantity). Non-ranged wave >= 4 fights are counted in the
fight total but never enter a class.

## Class definitions (binding — mutually exclusive by priority order)

Measured per ranged fight, at fight entry (before the fight's
own volley spends anything), from the ammo-diag fight record
plus the PC instrument's fight-time row:

- A (armed-carried): carriedNeeded > 0 — the fighter's pre-fight
  pack holds at least 1 unit of the ammo their (post-entry)
  ranged weapon shoots. Volley shots/damage are reported
  separately and never define the class (an armed fighter may
  still fire 0 shots if the volley engine so decides).
- P (pocket calls before fight): the count of
  villagerPocketAmmo invocations for this vid recorded before
  this fight's record is pushed. The ammo-diag pocket wrapper
  appends on EVERY invocation (even an early return with no
  weapon), so P counts calls, not successes. For a patrol fight,
  P includes the current patrol's own pocket call: pocketing
  runs inside resolvePatrol BEFORE fieldFight, so at fight entry
  that call is already recorded. This is intended: the patrol
  departure delivered the fighter to this fight.
- D (departure calls before fight): the count of
  startExpedition / resolvePatrol invocations for this vid
  recorded before this fight's record is pushed, counted by the
  PC instrument's own pre-call increment — so, like P, it
  includes an in-progress patrol call that produced this fight
  (the ammo-diag departure wrapper appends only AFTER the
  original returns, i.e. after the fight, so D must NOT be read
  from that list at fight time; the PC pre-count is the honest
  one). D and P are therefore counted on the same "before the
  fight record" boundary.
- W (went departures before fight): departure calls before
  fight whose post-call state shows the fighter actually went
  out — defined uniformly as: the pocket-invocation count for
  this vid increased during that departure call. This is exact
  for both sites, because pocketing runs after the sit-out
  gates in both: startExpedition (gear-up, heal sit-out, sick
  sit-out, maxD sit-out, THEN pocket, then away set) and
  resolvePatrol (gear-up, heal sit-out, THEN pocket). A
  departure call with no pocket increase is a call that sat
  out before pocketing — the fighter did not go. (For
  expeditions the away/exped set is recorded alongside as a
  cross-check; a went call must also show away/exped set, and
  any went-without-away expedition call is a finding, not a
  dropped row.)
- H (at home at fight entry): the fighter's raw nodePos equals
  the Haven node (village px/py) at fight entry. The complement
  (node elsewhere, or node unknown with away/on-expedition set)
  is out-at-fight. Node unknown with neither away nor
  expedition set falls back to at-home and is counted as
  node-unknown (reported, never silently assigned).

Classes, applied in this priority order (first match wins, so
the counts sum exactly to the ranged-fight total):

1. ARMED — A true. (Carried ammo into the fight, whatever their
   call/departure history.)
2. NEVER-CALLED — A false, P == 0 AND D == 0. (No pocket call
   ever reached them, and no departure was ever even invoked
   for them. The task's "wild encounter, no departure".)
3. NEVER-DEPARTED — A false, D > 0 AND P == 0. (At least one
   departure was invoked for them, but every one sat out before
   pocketing — "called but did not go". The analyzer verifies
   W == 0 for every fight in this class; any fight with W > 0
   here is a classification bug and fails the proof gate.)
4. DRY-AT-HOME — A false, P > 0, H true. (Pocketing ran at least
   once, but they walk into this fight dry while at home:
   craft failed, ammo spent in an earlier fight, or the pocket
   predates the weapon — the analyzer reports the
   weapon-first-seen vs last-pocket ordering as a sub-note, not
   as a separate class.)
5. DRY-AT-FIGHT — A false, P > 0, H false. (Pocketing ran at
   least once, but they walk into this fight dry while out in
   the field.)

Cross-tab published alongside (so any relabeling is possible
without re-running): P×D×A counts, caller class per class,
weapon per class, and for dry fights the pile-at-fight
supply split (below). A fight that fits no class, or fits two
under the priority order, is a completeness failure, not a
rounding error.

## Supply-blocked vs call-blocked (dry fights only)

For every dry ranged fight (classes 2–5), the pile at fight
time (ammo-diag pile row) is compared with the fighter's recipe:
- Bow/crossbow (arrow/bolt): supply-blocked if pile stick < 2,
  or (arrow only) pile fiber < 1, at fight time; else
  call-blocked (the pile could have armed them — the missing
  piece is a call reaching them, or a pocketing that kept the
  ammo, not the pile).
- Sling (stone): supply-blocked if pile stone == 0 at fight
  time; else call-blocked (stones are the pile's reservoir —
  supply-b's finding, re-checked here, not inherited).
The split is reported per class and band-wide. A dry fight is
never double-counted: supply-blocked and call-blocked partition
the dry set.

## Sensed-contact test (binding definition)

For every NEVER-CALLED fight (class 2; reported secondarily
for NEVER-DEPARTED fights, labeled secondary), the PC row
records four channels at fight entry, each with its witness
value. Reachable = C1 OR C2 OR C3 OR C4. All reads are raw
state reads; the instrument calls NO Game method that
initializes state (no npcNode, no npcInside, no campPeopleIds,
no partyMembers, no stashState, no agencyState, no
ensureVillagerPositions — the static scan in the proof enforces
this list). Missing raw entries record null (unknown), never a
defaulted Haven (npcNode's default would invent one).

- C1 SEEN-SAME-NODE: the fighter's raw nodePos {nx, ny} equals
  the scholar's current node {map.px, map.py}. Witness: both
  node pairs. (The leader and the fighter stand on the same
  world node — the leader can see them.)
- C2 SEEN-SAME-GRID: the fighter has a raw grid position
  (village positions[vid] {mx, my}) and the scholar's grid
  position (scholar.mx ?? 4, scholar.my ?? 4 — the perceive.js
  person-hint origin) is within Chebyshev distance <= 1 of it.
  Witness: both grid pairs + distance. (The perceive.js
  person-hint range: a person within 1 tile is noticed.)
  C2 is only meaningful when both are on the same node; a
  grid pair recorded while nodes differ is reported as
  C2-stale and does NOT count toward reachable.
- C3 SHOUT-CREW: the fighter is in the raw travelling crew
  (Game._outdoorCrew) AND at least one other living roster
  member is in that same crew array at fight entry (living =
  raw village health map, default 100 when absent — the
  campPeopleIds default, read raw). Witness: crew-mate ids.
  (The code's own party-up shout channel: resolveWildMonster-
  Encounter / resolvePatrol build allies from this crew — "a
  villager jumped in the wild can call to whoever's out there
  with them". The crew is a co-present travelling group, not a
  roster query: the test reads the crew array the fighter is
  already in, never scans the roster for candidates.)
- C4 PARTY-FOLLOW: the fighter is in the raw travelling party
  (village.party includes vid) at fight entry. Witness: party
  membership boolean. (The fighter travels with the scholar —
  following someone the caller has seen, by construction.)
  Overlap with C1/C2 is reported per channel AND as a union:
  per-channel counts, pairwise overlaps, and the union count
  are all published, so "reachable" is never a single opaque
  number.

A never-called fighter with reachable == false is UNREACHABLE-
AT-FIGHT-TIME: no sensed channel existed at the moment a call
would have had to reach them (a call design must therefore
reach them EARLIER — at home before they scatter, or through
a channel that persists, not at the fight). A clean zero
reachable with its reason (e.g. "all never-called fighters
were on nodes the scholar was not on, outside the crew, and
outside the party") satisfies DIAG-GO exactly as a nonzero
count does — the bar is sizing, not a direction.

## Primary metric + DIAG-GO bars (binding)

DIAG-GO iff ALL of:
1. Classification completeness 100%: every wave >= 4 ranged
   fight in the band corpus carries a class (1–5), a sensed
   row (for classes 2–3), and a supply split (for dry fights);
   class counts sum exactly to the ranged-fight total; zero
   unclassified, zero double-classified; zero classification
   anomalies (a NEVER-DEPARTED fight with W > 0 contradicts the
   class definition and fails integrity); instrument errors 0
   on all seeds (ammo + supply + stickfiber + PC).
2. Every class count reported with n (including a clean zero
   class with its reason, e.g. "0 never-departed because every
   departure call in the band reached pocketing").
3. The sensed-reachable never-called subset is sized: the
   union count, the per-channel counts, and the unreachable
   count are all reported with n — including a clean zero
   union with its reason (which channels were absent, on how
   many fights).
4. Wall numbers + volley reproduction reported (below), and
   at least one fight transcript read per class present in the
   band (sense-testing section, quoted, not just counted).
5. At least 1 ranged fight band-wide; fewer is
   INSUFFICIENT-DATA (the census question is then unanswerable
   on this band), not GO and not NO-GO.

A miss on any of 1–4 is DIAG-NO-GO, never re-scored against a
friendlier metric mid-run. Metric doubts go under "metric
review" in the evidence file for the NEXT run.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot (85101–85108) GO requires: PC instrument fires on all 8
pilot seeds (per-seed JSONs valid: days > 0, PC fight rows
present-or-empty with a reason, PC departure rows present);
instrument errors 0 on all 8; PC fight rows join 1:1 with
ammo-diag wave >= 4 fight rows on every pilot seed (join key:
order among wave >= 4 fights; any length mismatch is a pilot
failure, not a rounding note); AND >= 1 wave >= 4 fight of any
kind on the pilot (proves fight capture works). Pilot size is
NOT the verdict: the confirm carries it. If the pilot fails on
instrument grounds, the verdict is DIAG-NO-GO (no confirm spend
on a broken instrument).

## Confirm

Seeds 85109–85116 (band total 16) if the pilot passes; the
confirm is judged on the same bars at band scale.

## Wall numbers + volley reproduction (reported every run)

National / table / wins / wave 4 / wave 5 / median + max
survival from the per-seed JSONs (same caveats as deadfall-b:
table/win flags are the policy stack's substrate flags, not
ordinary-play claims; Arc II/III/IV reach, four-realm formation,
trap acquisition by source, counter discovery/kill rates, and
young-link succession survival are NOT instrumented in this
substrate and are NOT reported). Volley: total volley fights /
shots / damage on this substrate, and the reproduction check
against deadfall-b's prototype corpus: does the Maya Singh
s85103 d41 4-shot volley reproduce on this base (same seed,
day, vid, weapon, shots), and what class are the OTHER ranged
fights in? A non-reproduction is reported with its divergence
(first differing fight identity), never hidden.

## Panel (§15)

Single-base DIAG measurement: no before/after comparison exists
in this arm (the deadfall-b prototype corpus is a cross-base
historical corpus, not a panel before/after on this base), so
`scripts/balance-panel.js` does not apply. No panel compare is
attached and none is fabricated — the same declaration
mustercall-b made. A later lever arm reusing this corpus as its
baseline runs the panel then.

## Sense-testing (SENSE-TESTING LAW)

Read at least one fight transcript (the ammo-diag log copy in
the corpus) per class present in the band, plus the sensed row
for at least one reachable and one unreachable never-called
fighter. Judge: does a bow fighter walking into a fight dry read
like a person (did they have a reason to be dry — weapon new,
pocket failed, never called — or does the scene pretend
otherwise); does a never-called fighter standing nearby while a
fight happens next door read as a real absence (nobody could
have reached them) or as a design hole (someone stood next to
them and said nothing)? Quote the stretches in the evidence
file. Counts alone do not pass this arm.

## Metric review

(To be filled at end of run. Doubts about the metric go here and
apply to the NEXT run, never to re-score this one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement, not a lever.)
