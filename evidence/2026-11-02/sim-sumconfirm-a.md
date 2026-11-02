# sim-sumconfirm-a — sum-trigger muster call, CONFIRM (12 fresh screen qualifiers)

Run: fleshout-loop-a-20261102T0445Z, arm sim-sumconfirm-a, axis scale-onramp.
Worktree branch: sim-sumconfirm-a. Anchor: confirm runs on worktree HEAD
489ce5e90 (prereg + resumed-screen corpus committed BEFORE any judged
replay). Prereg: evidence/2026-11-02/sim-sumconfirm-a-prereg.md —
judged against it below; no bar was changed mid-run. POLICY-SIDE ONLY:
zero `src/js` changes, policy `scripts/policies/sumtrigger.js` UNCHANGED
from the pilot, no gates, stages, deed bars, or win prices touched, no
trustedAt / trustedOpinion / quota (6/2) / need (10) values changed,
nothing from the #1538 steve-call queue built, no food-economy work,
no Layer-2 titan work. No [needs-eyes] (policy measurement only,
nothing player-facing ships).
Panel (§15): NOT APPLICABLE — trigger-moment census with an
event-triggered intervention (sound-at-refusal via a startCombat
interceptor), not a sweep-compare policy run; the panel driver
consumes sweep-compare rows under its observer, which this replay
harness cannot produce. Same declaration class as sumtrigger /
quotatrigger / muster3 / musterroster-adopt. Before/after is done
directly on identical seeds against the screen corpus. No panel
fabricated.

## Verdict: NO-GO (confirm) — the rule holds exactly where it fires, but it fires on 8/12, one seed short of the bar, and median survival slips

Validator scripts/test-sumconfirm-a.js, 0 game load, rerunnable from
the corpus alone: 2 fails, both hard prereg bars. The other three
bars PASS outright, and the pilot's core claims reproduce on fresh
seeds — projection exact 8/8, same-day-or-next-day fight 8/8,
Herald slain 8/8, guardrails clean 8/8. This NO-GO is a verdict on
the confirm bars, not a kill of the sum rule: the rule's exactness
and fight conversion confirmed; its frequency on this band (8/12)
and the band's median survival (99d vs screen 109.5d) missed.

Prereg verdict, bar by bar:

(a) Trigger defined on >= 9/12 — FAIL, 8/12. The four undefined
seeds are 95447 (max faithful 7), 95464 (max faithful 9 — one blade
short), 95478 (max faithful 6), 95512 (max faithful 3). The miss
turns on one seed: had 95464's single refused link been clear of
arrears, its faithful total would be 11 and the bar would read
9/12. That counterfactual is reported, not scored — the bar is
8/12 and it fails.
(b) Sounded yield >= 10 AND projectedAllies == soundedAllies on
EVERY sounded seed — PASS, 8/8. Yields 10–19 (allies 10–16, Haven
0–3); projection equals sounded blade for blade on all 8,
including the exact-10 seed 95454 (10 allies + 0 Haven) and the
14-blade snapshot-zero seed 95477 (snapshot 0 -> sounded 14).
(c) Fight outcome + muster casualties RECORDED for every sounded
call — PASS, 8/8. Every sounded call fought (7 same-day, 1
next-day — see below), Herald slain 8/8, tbHerald 'won' 8/8,
per-responder fates 8/8, Haven fates 8/8. (Reporting bar, as
pre-registered: the outcome is measured, not gated on "won" —
though all 8 were in fact won.)
(d) Guardrails on every sounded seed — PASS, 8/8. Link count
unchanged 3->3 on all 8, every responder verified, instrument +
muster + interceptor + projection errors all 0.
(e) Median survival no worse than the no-call screen median for
these same 12 seeds — FAIL, 99d vs screen 109.5d. Sorted replay
days: 82, 85, 90, 91, 95, 96, 102, 109, 132, 141, 168, 181;
median (96 + 102) / 2 = 99d. Screen median for the same seeds:
(109 + 110) / 2 = 109.5d. The gap is driven by tail moves, not by
fight deaths (see wall section): 95462's village-lost moves
157d -> 82d, and three undefined seeds flip from lesser-seat wins
to village-lost on generation-noise timelines (see metric review).
A miss is a miss — the bar does not get re-scored — but the
mechanism matters for the next arm, and it is not "the muster
fight kills villages": only one sounded fight cost any allied
lives (3 on 95453), and no sounded seed's village-lost day
coincides with its fight day except through the later "the wild"
bleed on 95462 (below).

## Confirm table (12 seeds, DAYS=180, frozen quotatrigger stack)

| Seed | First contact | Trigger | Proj allies+Haven | Sounded | Haven | Fought | Slain | Tail |
|---|---|---|---|---|---|---|---|---|
| 95447 | day 94 | UNDEFINED | max 4+3=7 | — | — | — | — | village-lost day 132 |
| 95448 | day 89 | day 89 (1st refusal) | 16+3=19 | 16 | 3 | day 89 | yes | village-lost day 102 |
| 95453 | day 95 | day 95 (1st refusal) | 11+2=13 | 11 | 2 | day 95 | yes | won day 96 (lesser seat) |
| 95454 | day 86 | day 86 (1st refusal) | 10+0=10 | 10 | 0 | day 86 | yes | village-lost day 90 |
| 95462 | day 74 | day 74 (1st refusal) | 12+1=13 | 12 | 1 | day 74 | yes | village-lost day 82 |
| 95463 | day 170 | day 170 (1st refusal) | 14+1=15 | 14 | 1 | day 170 | yes | survived 181 |
| 95464 | day 128 | UNDEFINED | max 8+1=9 | — | — | — | — | village-lost day 141 |
| 95477 | day 95 | day 95 (1st refusal) | 14+2=16 | 14 | 2 | day 95 | yes | won day 95 (lesser seat) |
| 95478 | day 104 | UNDEFINED | max 3+3=6 | — | — | — | — | won day 109 (lesser seat) |
| 95492 | day 81 | day 81 (1st refusal) | 14+3=17 | 14 | 3 | day 81 | yes | won day 91 (lesser seat), maxWave 5 |
| 95495 | day 147 | day 147 (1st refusal) | 16+3=19 | 16 | 3 | day 148 | yes | won day 168 (lesser seat) |
| 95512 | day 73 | UNDEFINED | max 0+3=3 | — | — | — | — | village-lost day 85 |

Every sounded seed fired on its FIRST refusal row (1 projection
row each) — no long pre-trigger tails in the confirm band, and
every trigger day matches the screen's first-refusal day exactly.
First contact matches the screen on all 12 seeds, sounded or not.

## The undefined seeds: arrears is the systematic blocker, again

All four undefined seeds are blocked by arrears refusals (a link
with arrears > 0 sends nobody under `soundTitanCall`'s own rule),
not by the trust tier and not by a weakest-link veto:

- 95447: Emberhold in arrears from the first row (9750, growing
  to 12000); by day 124 ALL THREE links are in arrears and the
  faithful total falls to 3. Naive never reaches 10 either (max
  naive 9) — this seed is not ready under any counting rule.
  37 projection rows, screen count 59 (timeline diverged after
  the first-row generation — see metric review).
- 95464: the one-blade miss. All 3 refusals fall on day 128:
  Emberhold trust 69 (one point under the tier), opinion 6,
  arrears 3000 -> refused, contributes 0; Stonebridge 6, Thornfield
  2, Haven 1 = faithful 9. Naive 11. Had Emberhold been clear of
  arrears it would contribute 2 (quota 2, free 3) and the total
  would be 11: ready. The blocker is arrears, not the 69 trust.
- 95478: two links in arrears (Emberhold 26000, Thornfield 11000);
  only Stonebridge contributes (quota 6 capped by free 3) for
  faithful 6, Haven up to 3. Naive 10 on 14 rows. 20 projection
  rows, matching the screen count exactly — and the only
  undefined seed with ZERO projection-generation rows (see below).
- 95512: all three links in arrears at the best row (4000 /
  16980 / 4000) — every link refuses, faithful allies 0, Haven 3
  = 3. Naive 12 on all 29 rows. The naive rule would have sounded
  a muster the call itself refuses three times over.

The naive-vs-faithful fork, now measured on fresh seeds: naive
would have fired on 3 of the 4 undefined seeds (95464, 95478,
95512) and would have sent musters the call refuses. The
faithful rule correctly never fires on any of them. The pilot's
95423 lesson generalizes: the deploy rule must respect the call's
refusal rule, or it over-sounds into refused musters.

## Fight outcome + muster casualties, confirm band

- 8/8 sounded calls convert to a fight, Herald slain 8/8,
  tbHerald 'won' 8/8, no later refusals, no later fights, muster
  released after victory. 7/8 fought the SAME day as the trigger;
  the exception is 95495: trigger refusal day 147 (cls REFUSED,
  reason MUSTER-GATE), fight day 148 (cls FOUGHT). The pilot's
  6/6 same-day record becomes 7/8 same-day, 1/8 next-day. Bar (c)
  is "recorded", so this passes — but a deploy claim of
  "same-day fight" is now 13/14 across pilot + confirm, not
  14/14. Mechanism for the one-day slip is not established (the
  refusal may stage the fight on the next day boundary); reported
  as observed.
- Allied casualties: ZERO on 7/8 fights. The exception is 95453:
  3 of 11 allied responders died IN the fight, all day 95, cause
  'combat', day-matched to the fight (Darius Lund of Stonebridge,
  Zoe Khan and Darius Zhang of Thornfield) — 3 of 13 muster
  members (23%). The fight was still won the same day and the
  village still won the lesser seat day 96. The fourth day-95
  death is the Herald itself (kind 'monster'), not a person.
- Haven casualties: ZERO in-fight on all 8 seeds. The run-end
  fate check flags 4 Haven blades 'off-roster' (95448: 3, 95462:
  1), but the deaths lookup corrects the reading exactly as in
  the pilot: all four died DAYS after their fights as later
  bearers, all cause 'the wild' (days 92/93/100 on 95448, day 77
  on 95462) — not in the titan fight. Day-matched fight-day
  deaths on 95448 and 95462 are the Herald alone.
- 95454: ready with ZERO Haven commit. The two commit taps found
  no volunteers (havenFates []), yet readyAfter is true because
  allies alone hit exactly 10. The ready bar counts allies +
  Haven commit, and 10 + 0 = 10 is ready — the call does not need
  Haven's blades when the villages bring ten themselves.
- 95462 tail note (not a casualty claim): the village won the
  fight day 74 with zero allied/Haven fight deaths, then lost
  four villagers to 'the wild' days 75–77 and the village itself
  day 82 (screen: village-lost day 157). The fight did not kill
  the village; the week after it did. Whether muster absence
  contributed to the 'the wild' bleed is NOT established by this
  instrument — the fight and the bleed are adjacent, not proven
  causal. Reported as a tail observation (n=1), never as "the
  muster kills villages".

## Snapshot undercount, re-measured at the trigger

Snapshot callYield vs sounded allies at first-row triggers:
95448: 16 -> 16 (no undercount — rosters pre-existing, trigger
row generated nothing); 95453: 8 -> 11; 95454: 8 -> 10; 95462:
10 -> 12; 95463: 6 -> 14; 95477: 0 -> 14 (all three links
rosterless); 95492: 12 -> 14; 95495: 6 -> 16. Range 0–14.
Projection == sounded on 8/8 remains the strong form of the fix:
counting generation makes the projection exact, not merely less
wrong — including on 95448, where the snapshot was already exact
and the projection still matched it.

## Sense-test (SENSE-TESTING LAW — transcripts read)

All 8 trigger calls read humanly: one fire answering at a time,
named people, the trust-holds line carrying the social
consequence ("they are counting on you"). No list-fed narration
— quota and refusal still come from trust/opinion/arrears only;
the roster only names who answers. Two wrinkles, both carried
from earlier arms, not new: (1) duplicate first names inside a
single call persist (95495: Wren Hassan + Wren Ali, Alba Marsh +
Alba Mendez; 95477: Tariq Moreau + Tariq Petrov; 95495 also has
Ibrahim Hassan sharing a surname with Wren Hassan). Named people,
but the collisions read slightly less like distinct villagers.
(2) 95495's third answering fire is Ashford, not Thornfield —
linked allies again include villages beyond the core three, as
in the pilot (splinter villages answered there). The call reaches
whoever is actually linked, which reads right.

## Wall numbers (bands kept separate, never pooled)

Confirm intervened (12 seeds): national(end) 9/12, table 6/12,
won 5/12, wave-4 12/12, wave-5 1/12 (95492 — the band's only
wave-5 reach, and a screen-to-replay gain: screen maxWave 4 ->
replay maxWave 5), median survival 99d, max 181d; ends:
village-lost 6, over-other (lesser-seat win) 5, survived 1.
No full-seat win on any confirm seed under either band — wins
here are lesser-seat wins, as in the pilot.
Screen no-call (same 12 seeds): national(end) 9/12, table 8/12,
won 8/12, wave-4 12/12, wave-5 0/12, median 109.5d, max 181d;
ends: over-other 8, village-lost 3, survived 1.
Per-seed tail moves (screen -> replay): 95447 over-other 138d
-> lost 132d; 95448 lost 110d -> lost 102d; 95453 over-other
102d -> over-other 96d, national 1 -> 0 (END-rank flip after a
lesser-seat win, same definition caveat as pilot 90111);
95454 lost 92d -> lost 90d; 95462 lost 157d -> lost 82d (the big
move, see above); 95463 survived 181d -> survived 181d
(identical); 95464 over-other 137d -> lost 141d; 95477
over-other 96d -> over-other 95d; 95478 over-other 109d ->
over-other 109d (identical — the zero-generation seed);
95492 over-other 90d -> over-other 91d + wave-5; 95495
over-other 167d -> over-other 168d; 95512 over-other 90d ->
lost 85d.
Death-cause shares, confirm (448 deaths) vs screen band (434):
combat 212 vs 207, villager combat 84 vs 85, the wild 82 vs 64,
expedition 23 vs 22, monster 11 vs 13, ambush 7 vs 7, contest 5
vs 7, the arena 6 vs 6, starvation 3 vs 5, a wound that wouldn't
close 4 vs 5, a stranger 3 vs 3, sickness 3 vs 3, dehydration 1
vs 1, bad belly 1 vs 1, plus confirm-only 'the expedition' 1,
'Night Court' 1, 'The Algorithm' 1 (screen has the same three
latter names at 2/1/1 — the bands share the shape) and
screen-only 'thirst' 1. The intervention does not distort the
death profile into a new shape: the muster fight's 3 casualties
sit inside the normal 'combat' share, and the largest delta
('the wild' +18) tracks the tail-diverged villages (notably
95462's post-fight bleed), not the fights themselves.

## Village assessment (plain words)

On eight seeds the village had done enough of the slow work —
not necessarily all of it, but enough added up, and in one case
exactly ten blades with none of Haven's own — so when the Herald
came, the call went out, ten to sixteen blades marched alongside
zero to three of Haven's own, and the sky-tyrant died, seven
times the same day and once the next. The fight is not free: on
one seed three named allies did not come home. But the muster is
not a death sentence either — seven fights cost no allied lives
at all, and Haven's own blades all came home from every fight.
On four seeds the village had not done the work, and the shape
of "not done" is now specific: friendships in arrears. One fire
behind on its dues, two fires, all three fires — the call refuses
what the dues refuse, and no counting trick makes ten blades out
of friendships that owe. The village that was one blade short
shows how close this runs: a single cleared debt would have
sounded the call. The call is ready when the sum says so, and
the sum is honest now: it counts the people the call itself
brings into being, and it refuses the musters the call itself
would refuse.

## Metric review (no bar changed here)

1. TRIGGER FREQUENCY (the failed bar, now bounded): pilot 6/8,
   confirm 8/12 — pooled 14/20 (70%), but the bands are NEVER
   pooled for the verdict, and the confirm bar is 8/12 against
   9/12. One seed short, and the nearest miss is one blade short
   behind an arrears refusal. A future arm that wants a higher
   trigger rate must address arrears (tribute economics, not the
   trigger rule) — that work is out of this arm's scope and is
   flagged, not built, here.
2. MEDIAN SURVIVAL (the failed bar, mechanism noted): the 10.5d
   median gap is tail moves, not fight deaths. Sounded seeds'
   tails move because the intervention (a sounded call + a
   fought battle) changes the timeline by design; undefined
   seeds' tails move because projection generation consumes RNG
   (item 3). A future prereg that judges median survival on an
   intervened band should say which of those two movements it is
   willing to count — this one counted both, and failed on both.
3. GENERATION SIDE EFFECT (pre-registered, now measured on
   undefined seeds too): the pilot bounded it to sounded seeds
   with long pre-trigger tails. The confirm shows it moves
   NON-sounding seeds as well — but only when generation
   actually happens. 95478 (0 generation rows) is identical to
   its screen row on every reported field (refusal count 20,
   days 109, same end). 95464 (1 generation row, day 128) moves
   137d -> 141d and flips win -> lost. 95447 (1 generation row,
   day 94) moves 59 -> 37 refusal rows, 138d -> 132d, win ->
   lost. 95512 (1 generation row, day 73) moves 26 -> 29 rows,
   90d -> 85d, win -> lost. The contrast is clean: generation
   rows > 0 -> tail moved (3/3); generation rows = 0 -> tail
   identical (1/1). A deployed projection UI carries the same
   cost, and any deploy arm must still choose lazy vs eager
   generation explicitly — now with the added note that even a
   never-sounding projection perturbs the timeline it measures.
4. NEXT-DAY FIGHT (new observation): 95495 fought day 148 after
   a day-147 trigger. "Same-day fight" is 13/14 across pilot +
   confirm (bands kept separate for verdicts; the fraction is
   descriptive only). A future instrument should record the
   staging reason for a next-day fight, if one exists in code.
5. HAVEN FATE CONFLATION (instrument limitation, corrected by
   lookup, as in the pilot): end-of-run 'off-roster' does NOT
   mean fight death. Day-matched deaths are the casualty count.
   A future instrument should record Haven fates at fight end +
   run end separately.
6. NATIONAL DEFINITION: END scale rank, same as quotatrigger /
   sumtrigger. 95453's national 1 -> 0 flip is an END rank flip
   after its lesser-seat win, not a claim about ever-national.
7. PANEL (§15): not applicable (see header). No panel fabricated.
8. CHECK SCOPE: unit proof (16/16, reused unchanged) + corpus
   validator (NO-GO, 2 fails) are the run's tests. The repo-wide
   check.js green list was not run: this arm touches no src/js
   and changes no game behavior, and prior DIAG arms judged on
   the same basis.

## Corpus

evidence/2026-11-02/perseed-sumconfirm-a/ — screen{1..6}.stdout
/.stderr (resumed no-call screen, 66 seeds 95447–95512, 12
qualifiers), confirm.stdout/.stderr (combined 12-seed replay
lines), confirm-s<seed>.json (12 judged per-seed files, each
carrying projectionTrajectory, triggerProjection, fightOutcome,
transcript, wall fields, deaths, hashes).
Instruments: scripts/sumtrigger-replay-20261101.js (pilot replay,
unchanged), scripts/sumconfirm-split-20261101.js (idle splitter
for the confirm dir), scripts/test-sumconfirm-a.js (validator,
NO-GO 2 fails), scripts/test-sumtrigger-policy.js (unit proof,
reused unchanged, 16/16), policy variant
scripts/policies/sumtrigger.js (UNCHANGED from the pilot).
Baselines: the resumed screen corpus above (no-call, same 12
seeds); pilot corpus evidence/2026-11-02/perseed-sumtrigger-a/
for cross-band description only, never pooled.

## Blanks filled / documented

- FILLED (evidence): sum trigger confirmed on 12 fresh seeds —
  8/12 fire, projection exact 8/8, fight + slain 8/8, casualties
  measured (95453: 3 allied dead; all other fights zero
  allied/Haven fight deaths), snapshot undercount re-measured
  (range 0–14 at first-row triggers), arrears established as the
  systematic undefined-seed blocker (3/4 seeds blocked by
  arrears refusals, 95464 by a single one), naive over-sounding
  proven on fresh seeds (naive fires on 3/4 undefined seeds the
  faithful rule correctly refuses), next-day fight observed for
  the first time (95495: trigger 147, fight 148), exact-10
  ready with zero Haven commit (95454).
- DOCUMENTED (not fixed, out of scope or follow-up): (1)
  projection-time generation moves timelines even on
  never-sounding seeds (3/3 moved with generation rows, 1/1
  identical without) — deploy must choose lazy vs eager
  generation; (2) median-survival bar conflates intervention
  tails with generation noise (metric review item 2); (3)
  roster first-name collisions inside a call (carried from
  quotatrigger/sumtrigger); (4) 95462's post-fight 'the wild'
  bleed (157d -> 82d) is adjacent to the fight, not proven
  causal; (5) next-day fight staging reason unestablished.
- NOT touched per task bounds: #1538 steve-call queue, gates,
  stages, deed bars, win prices, trustedAt / trustedOpinion /
  quota / need values, food economy, Layer-2 titan work, sibling
  trees/branches, hidden_files (tracker/claims/findings —
  coordinator-owned).

## Convergence state

scale-onramp: converging, NOT converged. The WHEN-to-sound
question now stands on pilot + confirm evidence: the faithful
sum trigger fires more often than every-link (pilot 6/8 vs 5/8;
confirm 8/12 on fresh seeds), never over-sounds (projection
exact 14/14 across both bands, naive divergences correctly
refused), and converts to a won fight 14/14 with measured,
bounded casualties. But the confirm bars missed (trigger 8/12
vs 9/12, median 99d vs 109.5d), no game change was built in this
run (policy variant only, pending coordinator merge + a deploy
arm's lazy/eager generation call), and the full seat remains
unwon on every confirm seed (wins are lesser-seat wins, as in
the baseline). The binding constraint visible from this band is
no longer the trigger rule — it is arrears: friendships in debt
refuse the call, and the next move on this axis is a tribute /
arrears question, not another trigger retune.
