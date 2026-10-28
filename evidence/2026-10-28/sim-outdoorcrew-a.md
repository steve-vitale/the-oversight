# sim-outdoorcrew-a — joint foraging outings: can a policy feed the outdoor crew?

Run: fleshout-20261028T1628Z, axis scale-onramp (blocking axis).
Worker: sim-outdoorcrew-a. Worktree branch sim-outdoorcrew-a.
POLICY ONLY — zero src/js behaviour change, no monster-stat /
wave-gate / table-gate / spawn-rate change. Default-OFF policy
(OUTDOORCREW=1 only); this arm's verdict is NO-GO, so the policy
variant was DELETED from the final tree (see "What was deleted"),
leaving instruments + evidence + corpus. The policy file survives
in branch history (commit 4fd54f3e) for any re-run; the sweep and
sense scripts say so when the module is absent.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-outdoorcrew-a-prereg.md (commit 596ebdac).
Instruments: scripts/policies/outdoorcrew.js (DELETED at verdict —
see below), scripts/test-outdoorcrew-a-sweep.js (lean sweep),
scripts/test-outdoorcrew-a.js (analyzer / verdict judge),
scripts/test-outdoorcrew-a-proof.js (mechanism proof, rewritten
after the verdict to prove the crew path with direct engine
assignments so it stays green on the final tree),
scripts/test-outdoorcrew-a-sense.js (non-measured replay only).
Recorder: scripts/policies/fieldparty-form-diag.js reused VERBATIM.
Corpus: evidence/2026-10-28/perseed-outdoorcrew-a/ (8 rows +
summary.json + analysis.txt). Sense log:
evidence/2026-10-28/sim-outdoorcrew-a-sense.log.
Det-gate: PASS (seed 75101, full 180d death-aware: layer OFF =
plain tableseat-nowait, days 132/132, tsNationalDay 77/77, no oc*
ctx surface — exactly the 1528 control seed's numbers).

## Plain words first

The feed works. The fight doesn't follow.

On the last run, wild meetings never saw a party because the
village never sent anyone out together — the crew list was empty
in 1,272 out of 1,272 meetings. This run sent villagers out in
pairs, on forage outings, every part of every day — 1,881 pairs,
3,839 villagers sent out — and the crew list filled: 629 of 907
meetings on the band had crew-mates standing by, and 17 of the
19 wave-4 field meetings had a crew-mate in the fight's own
input. That is the missing feed, fed, by policy alone, with no
game-code change.

But no party ever formed at wave 4. Not one. The reason is one
step further down, and it is measured, not guessed: a crew-mate
only joins when the fight turns hopeless — the leader is losing
slowly enough that the game registers a hopeless trajectory and
the leader shouts. Wave-4 fights never get there. Every crewed
wave-4 meeting ended in 1 or 2 rounds, leader fled (9) or dead
(10), with the hopeless flag false in all 17. The beast hits so
hard that the leader is gone, or has already run, before the
shout can exist. The crew-mate was out there — the fight's
input names them — but the fiction never shows them, and the
mechanic never calls them in.

The contrast proves it is a wave-4 timing problem, not a broken
feed. At wave 3, the same policy, the same crew path, formed
parties in 8 of 16 field meetings: the fight lasted 3–5 rounds,
the hopeless flag fired, the mate charged in — and then they
still fled (all 8 ended vFlee; a mate's few points of damage do
not turn a 240–420 HP beast). So the crew path is alive, the
shout works, and even a formed party does not win at wave 3,
let alone wave 4. Feeding the crew was necessary and is now
done; it is not sufficient, and the next blank is the shout
gate itself — fights that end before hopelessness — not the
feed.

The village also got slightly worse on this band, not better.
Median survival fell from 146 days to 118 (the guard bar was
117, so it passes by one day — barely, and in the wrong
direction), deaths rose 286 to 306, wins fell 3 to 2, national
standing fell 7/8 ever to 6/8, table entries 3 to 2. Starvation
stayed at 1, so the outings did not starve anyone; but nothing
on the wall improved except wave-4 reach (6/8 to 7/8, one seed,
noise-level). Sending people out together did not move the
scale wall, because the parties it creates never get to fight
at wave 4.

## Verdict: NO-GO, sub-class FED-NO-FORM (binding prereg, no re-score)

- Primary: FORMED wave-4 field meetings = 0, GO required >= 1.
  FAIL (deciding leg).
- Mechanism check: crewRaw non-empty meetings = 633/907
  all-waves (control 0/1,272) — the mechanism FIRED, massively.
  This is why the verdict is FED-NO-FORM, not UNFED and not
  DIAG-NO-GO: the crew path is feedable from the policy side
  (the proof test shows the assignment → snapshot → fieldFight
  chain end to end), and the band fed it. What failed is the
  shout that turns a fed crew into a fighting party at wave 4.
- Guards: median 118d >= 117d PASS (by 1 day); starvation 1
  <= 2 PASS. Guards passing does not rescue a failed primary.
- No confirm band was run (kill-fast rule in the prereg: a
  failed pilot spends nothing further). Policy variant deleted;
  instruments + evidence only.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101–75108, tableseat-nowait verbatim PLUS the
  outdoorcrew layer (OUTDOORCREW=1), LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, 180d death-aware.
- Corpus validity: 8/8 rows, days > 0, recorder errs 0, no
  overflow (sweep summary: CORPUS PASS). Courtship substrate:
  combined 108, 8/8 seeds active (control 110) — the shared
  substrate reproduced; the delta is the outing layer.
- Trajectories diverged from control, as policy arms do (new
  RNG draws from obedience rolls and forage resolutions): judged
  meetings concentrate on 75103 (14) and 75105 (3), where
  control had 75106 (15) and 75108 (9). Before/after here means
  identical seed inputs, not identical trajectories — the same
  reading prior arms use. The meeting-level mechanism numbers
  (crew fed or not) do not depend on which seed hosts them.

## Wall numbers (THIS band vs 1528 control)

| field | this band (75101–75108) | control |
|---|---|---|
| national ever / final | 6/8 / 4/8 | 7/8 / 6/8 |
| table invited / entered | 3/8 / 2/8 | 4/8 / 3/8 |
| wins (lesser / full) | 2/8 (2 / 0) | 3/8 (3 / 0) |
| wave-4 reach / wave-5 | 7/8 / 0/8 | 6/8 / 0/8 |
| median survival | 118d | 146d |
| deaths total / starvation | 306 / 1 | 286 / 1 |
| courtship combined | 108 | 110 |

Per-seed: 75101: 92d, won (lesser); 75102: 107d; 75103: 109d;
75104: 90d, won (lesser); 75105: 165d; 75106: 180d; 75107: 129d;
75108: 118d. Death causes (band): villager combat 110,
villager-vs-villager combat 75, player arena 52, villager
monster 19, sickness 17+1, expedition 9, wounds 7, rest small.
No outing-specific death cause exists to attribute the +20
deaths to outings directly; the honest statement is the band
total and the direction, not a causal claim the corpus cannot
support (control's cause split was not published).

## The formation table (the judged measurement)

JUDGED SET: wave 4, channel field, caller resolve / patrol /
aid, leader a villager (the 1528 set; aid = aidFight routing of
a resolve/patrol meeting, same stated reason). CREWED = filtered
crew non-empty (crewRaw minus the leader — the engine's own
filter; raw counts alongside, never merged). FORMED = CREWED and
calledHelp true OR joinedAllyVid non-null.

| class | n / 19 | meaning |
|---|---|---|
| CREWED, unformed | 17 | crew-mate in the fight input, no shout, no join |
| UNCREWED | 2 | crewRaw empty (both aid-routed, both 75103) |
| FORMED | 0 | — |

Outcomes on the judged set: vDie 10, vFlee 9, vKill 0.
Rounds: 1 (13) or 2 (4) on crewed meetings — never more.
everHopeless: false on all 17 crewed meetings. Intent:
engage on all 17 (the crew flips intent from learn-first to
engage — a real effect: no learn-withdrawal at round 3, because
no crewed fight reaches round 3). Tile-could-form: 13/19
(armed other villager on the monster tile). Party-size>=2
(engineAllies >= 1): 17/19 — the engine counts the party even
when the mate never joins; reported as a secondary, never
substituted for FORMED.
Crew size on judged meetings: 1 mate in 16, 2 mates in 1
(75108 d96, eater, vDie 2 rounds).
Wave-4 field kills, all callers: 0 (control also 0).
Wave-4 meetings, all channels: 27 (field 19, raid 5, other 3);
outcomes vDie 12, vFlee 12, evade 3.

All-waves mechanism: crewRaw non-empty 633/907 meetings
(wave 1: 498/730, wave 2: 91/121, wave 3: 21/29, wave 4: 23/27),
filtered crewed 629/907, vs control raw 0/1,272. The feed is
not marginal or seed-specific — it is the band's normal state
now.

The 2 uncrewed judged meetings (75103 d93 suburb vDie, d107
eulogy vFlee, both aid-routed, crewRaw []) are consistent
with empty-part lapses, not a systematic aid hole: 6 of 8
aid-routed judged meetings WERE crewed, and the band counts
60 empty parts (parts where the layer assigned nobody — all
refused, scholar away from Haven, or too few free villagers).
Coverage is high, not total, and the two gaps change no
finding: even at 19/19 crewed, FORMED would still be 0, since
no crewed meeting shouted.

## Why no shout (the mechanism, one level down)

fieldFights.js: the hopeless branch fires only when the round's
trajectory is hopeless AND allies > 0 AND allyVids remain AND
intent !== 'learn'. Crew presence satisfies three of those
(intent becomes 'engage' precisely because allies > 0). The
failing leg is the trajectory: `hopeless` is computed from
damage-exchange trajectory (rtd < rtk * 0.85, loosened
2026-10-13), and wave-4 beasts (850–1500 HP arrivals per
1528; damage that ends a villager in 1–2 rounds) end the fight
by death or by the break-line flee before any round registers
hopeless. The prior band's shape (all wave-4 meetings 1–2
rounds, 0 joins) is reproduced WITH the crew fed — the feed
was never the binding gate at wave 4; fight length was, one
step behind it. At wave 3 the same gate passes: 8 formed
meetings, all rounds 3–5, everHopeless true, ally damage 0–9,
all ending vFlee. A formed party at wave 3 still flees; the
shout is a rescue that arrives too late to win, not a win
condition.

Correction to a 1528 open question (blank 2 there): the trust
floor (villagerFightAllies, trust >= 15) does NOT apply to the
wild crew path. The wild code trust-SORTS the crew and caps
allyVids at 2, but applies no floor — an untrusted crew-mate
still counts for party size, intent, and hold bonus, and is
still named in allyVids. Trust matters here only upstream, in
assignTask's obedience gate (see refusals below). A future
fed-but-unanswered class should therefore be defined on the
hopeless gate (FED-NO-SHOUT: crew present, everHopeless
false), not on trust.

## Joint-outing frequency (secondary)

Band: pairs 1,881, singles 77, assigned 3,839, refused 1,181,
empty parts 60, counted upkeeps 2,018. Per seed, pairs range
132 (75102) to 459 (75106, the 180-day seed) — roughly a pair
in most counted parts. Refusals are the obedience gate doing
its job honestly: ~24% of assignment attempts refused (trust
< 20 outright, or the <40 reluctant roll), counted, never
forced. The pair is trust-descending, so the same high-trust
villagers recur as the outing partner (Olivia Bennett in
nearly every 75103 meeting window) — stable, not rotating.

Food context: the engine's prodThrottle (pantry > 4 fresh days
redirects forage to wood/water/stone before yield or
depletion) bounds the outing food effect by construction, and
the band's starvation (1, same as control) and wall direction
(worse, not better) give no sign of a food windfall. No food
claim is made from this arm; a food-focused arm would need
its own pantry instrument, which this lean sweep did not carry.

## Sense note (75103, NON-MEASURED replay, window d60–d107)

The replay's taps land on the corpus's meetings (d64 Tom vs
audit, the d67–d69 algorithm run, d80–d88 suburb, d93 suburb
uncrewed, d107 eulogy uncrewed — the narration-shifted replay
still walks the same ground), so the wording judgment is
grounded in the judged meetings, not invented.

Outings read like individuals going out, not like people going
out together. The narration lines are always singular — "Ella
heads out to forage. 'Back before dark. Probably.'", "Greta
returns from foraging the wilds: +344 kcal" — never "Ella and
Greta head out together." The one joint phrase in the game is
the engine's own throttle line: "Chantal peeks into the
pantry, then turns the foraging party back. 'Plenty for days.'"
So the togetherness this arm creates exists only in the
assignment list, not in any line a player reads. Worse, when
the leader dies, the fiction is silent about the mate: Tom's
death is announced ("The Loud Beast killed Tom in 2 rounds.
The village mourns." — replay wording; corpus: audit, vDie,
2 rounds, crew Olivia) with no "nobody came" beat and no
mention that Olivia was out there with him. A player would
never know a crew existed. That silence is the sense version
of the mechanism finding: fed but unjoined is invisible.

The one place the fiction DOES show togetherness is the
wave-3 shout: in the replay, visjoin_82 vs callback d84
(Olivia joins, vFlee, 3 rounds) and mia vs callback d90
(Olivia joins, vDie, 3 rounds) match the corpus's formed
meetings. When the shout fires, the mate's arrival is a real
beat. It just never fires at wave 4.

Sense verdict: the outings do not yet read like joint outings
— they read like parallel solo errands that happen to share
a task. A narration line that names the pair ("Ella and Greta
head out together") and a death/flee line that names the
unjoined mate would be needed before a player could feel what
this arm measured. That is a narration blank, not a mechanism
claim, and it is not chased here.

## Metric review (filled at judging time)

- PRIMARY DEFINITION HELD. FORMED required an actually-
  fighting second fighter (calledHelp or joinedAllyVid), not
  the engine's party-size count (17/19) and not mere crew
  presence (17/19). Substituting either would have flipped
  the verdict on a count that never fought — the prereg's
  definition is what kept this NO-GO honest.
- FED-NO-FORM vs UNFED. The prereg named both sub-classes in
  advance; the band lands squarely in FED-NO-FORM (crewed 17,
  formed 0, mechanism 633/907). UNFED would have meant the
  snapshot never reaches meetings; DIAG-NO-GO would have
  meant assignments never stick. Neither happened — the
  proof test had already shown the chain end to end before
  the band ran.
- MEDIAN GUARD (barely passed, wrong direction). 118d clears
  117d by one day while falling 28 days below control. The
  guard as written passes; the direction should still be
  reported as a cost, not hidden behind the pass. A future
  prereg for an outing-style arm should consider a
  no-worse-than-control median leg alongside the floor.
- DEMAND CENSUS NOT CARRIED. This lean sweep did not include
  the w4convert demand recorder, so universe/faced/engaged/
  killed and demand-met are NOT reported here (1528's
  control numbers are quoted for wall context only, never
  recomputed). Meeting-level numbers (19 judged, 0 kills)
  are the arm's own and are complete.
- PANEL. Standing exception as in 1415Z/1528Z: balance-panel
  has no census-ingest mode; paired before/after tables are
  the §15 substitute. No panel artifact faked.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus path
  for the coordinator's check is
  evidence/2026-10-28/perseed-outdoorcrew-a/*.json (metrics
  national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact classes if LOUD lines appear, as in 1528: the
  baseline's regime does not match this substrate, and
  per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The corpus's real
  wall numbers are nationalEver 6/8, entered 2/8, wins 2/8.
  Baseline NOT rolled by this arm; the coordinator judges
  any LOUD lines.

## Blanks filled or documented

FILLED (by policy, measured, then reverted on NO-GO): the
outdoor-crew feed from the policy side. A competent-like
policy CAN populate _outdoorCrew (629/907 meetings crewed vs
0/1,272) with zero game-code change, under the existing
assignment + obedience gates, without radar and without
forcing joins. The 1528 "feed the wild meeting" blank's
policy branch is answered: the feed works.

DOCUMENTED (not chased, for the next arm + backlog):
1. SHOUT/HOPELESS GATE AT WAVE 4 (the next blank, in order):
   wave-4 fights end in 1–2 rounds before everHopeless fires,
   so a fed crew never joins. A fix arm must address fight
   length / the hopeless trajectory / an earlier join (e.g.
   a from-start join for a crew that walked out together —
   currently aidFight-only), pre-registering FORMED on a
   fought wave-4 field party as here, with FED-NO-SHOUT
   (crew present, everHopeless false) as the named class.
   Whether an earlier join is a design change or a rules
   change is a coordinator/Steve call, not decided here.
2. NARRATION BLANK: joint outings have no joint line, and
   unjoined crew-mates are never named in death/flee lines
   (sense note above). A fed-but-unjoined death should read
   as such, or the player cannot feel the system.
3. STABLE-PAIR ROTATION: trust-descending selection makes
   one veteran the permanent partner. Rotation (or a reason
   the same pair keeps going out) would read more like
   people choosing, less like a mechanism sorting.
4. WALL COST: outings softened the wall on this band
   (median −28d, deaths +20, wins −1) while passing guards.
   Any future outing arm should pre-register a no-worse-
   than-control wall leg, not just a floor.

## What was deleted (NO-GO discipline)

- scripts/policies/outdoorcrew.js — DELETED from the final
  tree in the closing commit. It remains in branch history
  (commit 4fd54f3e, instruments commit) for re-runs; the
  sweep and sense scripts exit with that pointer when the
  module is absent.
- scripts/test-outdoorcrew-probe.js — scratch probe, never
  committed, deleted (not a deliverable).
- Left in tree: sweep, analyzer, proof (rewritten to prove
  the crew path with direct engine assignments, so it stays
  green without the policy file), sense script, prereg,
  this evidence, corpus, sense log.

## Infrastructure notes

- Proof test (pre-deletion run): PROOF-GREEN — pair assigned
  via the policy upkeep, snapshot carried both members,
  crewed wild meeting passed allies=1 with the mate named,
  solo control passed allies=0, layer OFF added no oc* keys
  and no forage assignment. Post-verdict, the committed
  proof test proves the same crew path with direct engine
  assignments (assignTask → resolveAssignments → wild
  meeting) and re-ran green on the final tree.
- Safe-commit index clobber hit all three worker commits
  (prereg, instruments, det-gate fix) — repaired each time
  via HEAD-blob cacheinfo, hash-verified, never reset.
  Status verified empty (except the deleted probe scratch,
  removed before the final commit) after every commit.
- check.js --quick NOT re-run: zero src/js, zero green-list
  files (standing profile as in 1528); new scripts pass
  `node --check` and the proof test green.
- No push, no bump, no live verification (ship-loop line).
  Merged locally, pending ship — via the coordinator.

## Convergence

scale-onramp stays converging (NOT converged): the feed half
of the 1528 decomposition is now closed by policy, but the
wave-4 party itself still never fights — 0 formed, 0 field
kills, full seat 0/8, wave 5 0/8. The directive stands until
the tracker records this axis converged on measured evidence.
Next blank in order: the shout/hopeless gate (item 1 above),
then the sibling game-code feed arm's comparison (whether
wiring villagerFightAllies into the wild routers changes the
shout picture — it should not, by itself: the same hopeless
gate binds there too, unless the wiring also changes when
allies join).
