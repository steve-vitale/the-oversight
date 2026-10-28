# sim-outdoorcrew-a — PRE-REGISTRATION (binding, committed BEFORE any judged sweep)

Run: fleshout-20261028T1628Z, axis scale-onramp (blocking axis).
Arm: sim-outdoorcrew-a — OUTDOOR CREW / JOINT OUTINGS, the policy-side
alternative route to the same named blank as sibling arm sim-fieldfeed-a
(which wires game code; this arm touches NO src/js behaviour — policy
only, plus pure-read recorders).

## Question
Can a competent-like POLICY legitimately populate the outdoor crew —
villagers going out TOGETHER (joint foraging outings, one of Steve's
seven ordered villager-rationality items, 2026-10-27) — so that when
one member meets a monster, crew-mates are already present via the
EXISTING crew path (`_outdoorCrew` snapshot in `resolveAssignments`,
read by `resolveWildMonsterEncounter` / `resolvePatrol`), with zero
game-code change?

## Prior numbers (control, run fleshout-20261028T1528Z, evidence
`evidence/2026-10-28/sim-scale-onramp-round-1528.md`)
Shared band, tableseat-nowait verbatim, LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, 180d death-aware: universe 44, faced 21, engaged 21,
KILLED 2 (both TB scholar-led); field wave-4 meetings 24, all solo,
field kills 0; crew raw non-empty 0/1,272 meetings (all waves);
demand-met 2/50; national ever 7/8, final 6/8; table invited 4/8,
entered 3/8; wins 3/8, all lesser, full seat 0/8; wave-4 reach 6/8,
wave-5 0/8; median survival 146d; deaths 286; starvation 1.

## Substrate (verbatim, pilot band)
Seeds 75101–75108, tableseat-nowait verbatim PLUS the outdoorcrew
policy layer (scripts/policies/outdoorcrew.js, OUTDOORCREW=1),
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware (runDays stops
on death/win; 180 is the cap, never a fixed horizon). Recorder:
scripts/policies/fieldparty-form-diag.js reused VERBATIM (FIELDPARTY=1).
No src/js change, no monster-stat / wave-gate / table-gate / spawn-rate
change. No radar: the policy never reads monster positions and never
routes anyone to a monster tile; crew-mates count only because they
were sent out together on the same outing. Willingness follows the
existing engine gate: assignments go through `Game.assignTask`, whose
`checkObedience` (trust gate + reluctant roll) and <40 HP outdoor
refusal are never bypassed; refusals are counted, never forced.

## Policy (summary; the file is the spec)
`outdoorcrew.js` wraps tableseat-nowait: in `upkeep` (after base
upkeep), when OUTDOORCREW=1, the scholar is at Haven, the village has
>=6 living roster, and no outdoor task is currently assigned, it
assigns a PAIR of free villagers (not scholar, not gardenKeeper,
alive, village.health >= 40 where known, trust-descending) to
`forage` via `Game.assignTask(..., {via: 'in-person'})`, and counts
attempts / assigned / refused in ctx (`oc*`). When OUTDOORCREW is
unset it delegates byte-identically (det-gate below). Pair size 2 is
deliberate: the wild path caps allyVids at 2 and joins at most 1, so
a pair is exactly the party the engine can express. Food distortion
is self-bounded by the engine's own prodThrottle (pantry > 4 fresh
days redirects forage to wood/water/stone before any yield or
depletion); lean-time foraging is genuine need, and is reported via
the wall/food secondaries, never hidden.

## Judged set (analyzer: scripts/test-outdoorcrew-a.js, sweep:
scripts/test-outdoorcrew-a-sweep.js)
Wave-4, channel field, caller resolve / patrol / aid, leader a
villager (the 1528 judged set, aid included for the same stated
reason: aidFight routing of a resolve/patrol meeting). A meeting is:
- CREWED: `crewRaw` non-empty at fight start (engine's own input).
- FORMED: CREWED AND a second fighter actually fights: `calledHelp`
  true OR `joinedAllyVid` non-null (the wild path has no
  allyFromStart, so joined <=> hopeless-shout answer).
- PARTY-SIZE>=2 (secondary only): `engineAllies` >= 1 (the engine's
  party count, leader + allies), reported even when no ally joins,
  so a crewed-but-unshouted meeting is visible, never hidden.

## PRIMARY METRIC (binding) — GO threshold
FORMED wave-4 field meetings on the pilot band >= 1.

MECHANISM CHECK (reported alongside, never substituted for the
primary): crewRaw non-empty meetings on the band (all waves) > 0,
vs 0/1,272 control. If this is 0, the mechanism did not fire at all.

## GUARDS (all must pass for a LAND verdict)
- Median survival >= 117d (80% of 146d control).
- Starvation deaths total <= 2 (control 1).

## SECONDARY (report only, never re-score against)
FORMED count; CREWED count (judged + all-waves); PARTY-SIZE>=2 count;
tile-could-form count (armed other villager on the monster tile,
crew empty or not); field kills by channel; joint-outing frequency
(ocPairs / ocAssigned / ocRefused per seed, from ctx); wall numbers
(national ever/final, table invited/entered, wins lesser/full,
wave-4/5 reach, median, deaths, starvation); deaths by channel;
outing-task yield context (pantry-throttle regime, from the wall
and the sense replay — no new food claim is made from this arm).

## Verdict mapping (fixed in advance, no mid-run re-score)
- GO (LAND candidate): primary >= 1 AND both guards pass on the
  pilot band. Then a confirm band (seeds 75109–75116, own
  control-policy run on the same seeds) is run; LAND requires >= 1
  FORMED wave-4 field meeting in the arm confirm band. If the
  confirm fails, verdict is pilot-GO-only, policy reverted,
  evidence-only.
- NO-GO: primary = 0 on the pilot band. Policy variant deleted,
  instruments + evidence only, no confirm spend. Sub-class
  reported, not re-scored: FED-NO-FORM (CREWED > 0, FORMED 0:
  the crew was fed but no shout ever answered — the next blank
  is fight length / the hopeless gate, not the feed) vs UNFED
  (CREWED 0 on the band despite ocAssigned > 0: the snapshot
  never reaches meetings — a timing finding).
- DIAG-NO-GO: only if the band proves the crew path cannot be fed
  from the policy side at all (ocAssigned = 0 across the band
  despite attempts, with the blocking cause named — e.g.
  obedience / haven / free-pool gates that no competent-like
  policy can pass). That is a clean finding, not a failure:
  policy reverted, zero trace.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT run.

## Det-gate (before judging)
OUTDOORCREW unset on seed 75101, full 180d death-aware: layer-off
run must match plain tableseat-nowait on days/gameDays and carry
no oc* ctx surface. Recorder neutrality is already proven by the
1528 arm's det-gate for the reused recorder; this arm's det-gate
covers the new policy layer only.

## Sense (SENSE-TESTING LAW)
Read at least one transcript/replay of a joint outing that meets a
monster (or, if none, an outing that reads robotic/repeated) and
judge meaning, coherence, relevance, consequences — never just
counts. Question: do joint outings read like people choosing to go
out together, or like a mechanism herding them?

## Panel exception (§15, standing, as in 1415Z/1528Z)
scripts/balance-panel.js `compare` has no census-ingest mode; the
paired before/after tables (this band vs the 1528 control, identical
seeds/substrate) are the §15 substitute. No panel artifact is faked.

## Commit discipline
Policy file is default-OFF (OUTDOORCREW=1 only). A GO verdict means
GO CANDIDATE as an instrument, default-OFF only — landing it as
competent play is a coordinator/Steve call, NOT made by this arm.
If the policy change alters field combat outcomes (it does if it
forms parties): the landing commit carries [needs-eyes].
