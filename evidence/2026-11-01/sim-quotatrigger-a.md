# sim-quotatrigger-a — muster quota at the trusted-tier trigger

Run: fleshout-loop-a-20261102T0045Z, arm sim-quotatrigger-a, axis scale-onramp.
Worktree branch: sim-quotatrigger-a. Anchor: pilot runs on worktree HEAD
e1964953f (instrument commit; prereg c71fc1679 committed BEFORE any judged
sim). Prereg: evidence/2026-11-01/sim-quotatrigger-a-prereg.md — judged
against it below; no bar was changed mid-run. DIAG only: zero `src/js`
changes, no gates, stages, deed bars, or win prices touched, nothing from
the #1538 steve-call queue built. No [needs-eyes] (measurement only).
Panel (§15): NOT APPLICABLE — single-arm DIAG census with a
snapshot-vs-actual comparison at the same trigger moment on identical
seeds, not a panel policy comparison (same declaration class as
muster3 / musterroster-adopt).

## Verdict: NO-GO (pilot) — the trusted-tier call always closes the ceiling, but the trigger itself is too rare

Trigger defined on 5/8 pilot seeds (bar >= 6/8 — FAIL, the only failed
bar). Among trigger-defined seeds, ready-after-commit is 5/5 (bar >= 2/3
— PASS) and every guardrail holds (link count unchanged 3->3 on all 5,
every responder verified, instruments clean). Per the prereg pilot gate,
NO confirm spend was made. This is NOT a concept kill: the measurement
succeeded and the question is answered in both directions — WHEN the
trusted-tier moment exists, the call closes the ceiling with room to
spare (yields 11–17, need 10, before Haven even commits); but on 3/8
seeds the moment never arrives, and one of those (95423) would probably
have been ready anyway under a less strict trigger. The deliverable is
the delivery spec below, not a built change.

## Pilot table (8 seeds, DAYS=180, frozen musterroster stack)

| Seed | First contact | Trigger | Snap yield | Sounded yield | Haven | Ready | Tail |
|---|---|---|---|---|---|---|---|
| 90111 | day 72 | day 88 | 3 | 14 | 3 | TRUE | died day 99, maxWave 4 |
| 95411 | day 72 | UNDEFINED | — | — | — | — | died day 88, maxWave 4 |
| 95423 | day 115 | UNDEFINED | — | — | — | — | died day 117, maxWave 4 |
| 95425 | day 157 | UNDEFINED | — | — | — | — | survived 180, maxWave 4 |
| 95434 | day 138 | day 138 | 7 | 11 | 3 | TRUE | survived 180, maxWave 5 |
| 95437 | day 180 | day 180 | 4 | 13 | 3 | TRUE | survived 180, maxWave 4 |
| 95438 | day 86 | day 86 | 0 | 11 | 2 | TRUE | won day 90, maxWave 4 |
| 95446 | day 71 | day 71 | 6 | 17 | 2 | TRUE | won day 93, maxWave 5 |

Validator (scripts/test-quotatrigger-a.js, corpus-only): trigger-rate
FAIL 5/8, ready-among-defined PASS 5/5, guardrails PASS. Overall NO-GO.

## The trust race, in three shapes

The race is decided BEFORE contact, not during it. Trust does not climb
while the Herald is in contact — it holds flat or bleeds — so a seed
either arrives at first contact already trusted, or it (almost) never
gets there:

1. ALREADY-TRUSTED AT ARRIVAL (4 seeds: 95434, 95437, 95438, 95446).
   First refusal IS the trigger. Every link already >= 70 trust and
   >= 10 opinion (95434's third link sits exactly on the boundary,
   trust 70). Yields 11–17, all ready.
2. GAP-CLIMB (1 seed: 90111). First contact day 72 at base tier
   (69/48/57, quota 2); refusals stop days 76–87; trust climbs in the
   quiet gap to 100/84/83 and the day-88 refusal triggers. The ONLY
   pilot seed where waiting during/after contact paid off — and the
   payoff came from the gap, not from the refusals.
3. NEVER-TRUSTED (3 seeds):
   - 95411 LOW-FLAT: trusts 41/31/34 at first contact, wobbling
     41->36 on Emberhold across 27 refusals days 72–79, village dead
     day 88. Never within 29 points of the tier.
   - 95423 WEAKEST-LINK: two links ARE trusted (72/20, 70/28, quota 6)
     but the third sits at 46/28 (quota 2). All 11 refusals fall on one
     day (115); village dead day 117. Under a sum rule the day-115
     quotas sum to 6+6+2 = 14 — almost certainly ready — but the
     every-link trigger vetoes it. This seed is the counterexample to
     the prereg's trigger definition (see metric review).
   - 95425 BLEED: Emberhold climbs 97->99 (trusted throughout) while
     Stonebridge bleeds 62->49->46 and Thornfield 53->45->46 across
     the contact burst days 157–162; the 163–178 gap recovers almost
     nothing (46/46 at the day-179 refusals). Contact erodes the very
     trust the quota needs — the 2315Z doom-loop shape, reproduced on
     a fresh seed.

## Four mechanism findings (all from the corpus, not assumed)

1. TRIGGER -> SAME-DAY FIGHT, 5/5. Every triggered seed records a
   FOUGHT Herald attempt on the trigger day itself, immediately after
   the sounded call, and the Herald dies in combat in the sampled
   deaths on all 5. After the trigger day there are no further Herald
   attempts on any triggered seed (the corpus's refusedAfter=1 is the
   trigger refusal itself — the filter is day >= trigger day, not
   day > trigger day; see metric review). The ready muster converts
   to a fight at once; whether the muster survives it is NOT recorded
   by this instrument (limitation, see findings).
2. SNAPSHOT UNDERCOUNTS EVERY TRIGGERED CALL by 5–11 blades
   (snap 3/7/4/0/6 vs actual 14/11/13/11/17). The snapshot counts only
   pre-call free faces, and rosterless links show facesFree 0 — but
   the call itself generates those rosters (every triggered seed had
   1–3 rosterless links at trigger, and every one produced named
   responders from the generated roster). A snapshot-judged yield
   would underrate every trusted-tier call. Sounded yield is the
   metric; snapshot yield is not a predictor.
3. ROSTER-GENERATION HOLDS AT THE TRIGGER. Every responder on all 5
   triggered calls verified as a named living adult on its village's
   roster at call time (validator responders-verified PASS, zero
   problems). Allies are not only Emberhold/Stonebridge/Thornfield:
   triggered calls include splinter villages (The Bloodied, The Red
   Table, The Red Table II, The Red Table III) as linked allies.
4. PRE-TRIGGER TIMELINES ARE IDENTICAL between the no-call screen and
   the intervened pilot on all 8 seeds (refusal days match exactly,
   including 90111's first-refusal day 72 matching the 2315Z run).
   The instrument does not perturb anything before it sounds — the
   trigger comparison is clean. Intervention DOES change tails: 95434
   goes from a day-173 lesser-seat win (screen) to surviving 180
   unwon (pilot, call sounded day 138); 95446 goes from maxWave 4 /
   won day 90 (screen) to maxWave 5 / won day 93 (pilot). Tail
   observations only (n=1 each), flagged not claimed.

## Sense-test (SENSE-TESTING LAW — transcripts read)

All 5 trigger calls read humanly: one fire answering at a time, named
people, the trust-holds line carrying the social consequence ("they
are counting on you"). No list-fed narration — quota still comes from
trust/opinion only; the roster only names who answers. One wrinkle,
repeated across calls: generated rosters reuse first names inside a
single call — 90111 has Kenji Ford and Kenji Delgado; 95438 has Kira
Khan and Kira Fischer; 95446 has Grace Garcia and Grace Petrov; 95434
has Talia Moreau and Talia Petrov. Named people, but the duplicates
read slightly less like distinct villagers. Minor; filed as a finding.

## Wall numbers (bands kept separate, never pooled)

Pilot (intervened, 8 seeds): national(end) 6/8, table 4/8, won 2/8,
wave-4 8/8, wave-5 2/8 (95434, 95446), median survival 108d, max 180d.
"National" here is END scale rank (see metric review for the
ever-national distinction from 2315Z).
Screen (unintervened, 46 seeds scanned of the 72-seed band):
national(end) 24/46, table 31/46, won 25/46, wave-4 33/46, wave-5 0/46,
median survival 90d, max 181d; ends: village-lost 15, over-other
(lesser-seat win) 25, survived 6. The screen's own story: under this
stack most seeds win the lesser seat around day 90 or die before the
Herald window opens — only 7/46 seeds ever produce a refused Herald
attempt. Contact rarity, not just quota, gates the titan road here.

## Screen honesty note

The screen stopped at 46/72 seeds (95401–95446) once the 7th qualifier
was found. The pilot set (90111 + first 7 qualifiers ascending) is
final at that point by construction — any later qualifier is numbered
higher than 95446 and cannot displace it — so stopping costs the pilot
nothing. The cost is the full-band qualifier rate (7/46 observed, not
7/72) and the confirm pool: a future confirm resumes the SAME screen
at 95447 with the same script and horizon, and its qualifiers follow
the pilot's in ascending order. The screen stdout/stderr for the 46
scanned seeds are committed in the corpus dir as partial-screen
evidence, not presented as a full band.

## Delivery spec (for a FUTURE deploy arm — NOT built here)

What the data supports: sound the call when the muster is READY BY SUM,
not when every link is trusted.

1. TRIGGER RULE (proposed): sound when projected allied yield +
   Haven commit >= need (10), where projected yield sums per-link
   quotas (6 if trusted, else 2) capped by generated-roster free
   adults — i.e. the call's own roster generation must be counted in
   the projection, because pre-call facesFree undercounts by 5–11 on
   every triggered seed. A projection built on snapshot facesFree will
   refuse ready musters (95438: snapshot 0, actual 11).
2. NO WEAKEST-LINK VETO: a single untrusted link must not block a
   ready muster (95423: 6+6+2 = 14 quota with one link at 46 trust).
   The every-link rule in this run's prereg is sufficient but not
   necessary, and it vetoes a ready call.
3. SOUND AT THE FIRST READY MOMENT, not after refusals accumulate:
   contact bursts bleed trust (95425: Stonebridge -16 across one
   burst) and never build it; waiting through refusals loses the
   muster it is waiting for. The one gap-climb seed (90111) argues for
   sounding at the first ready refusal AFTER a quiet gap, never for
   sounding repeatedly into a burst.
4. WHAT THE DEPLOY ARM MUST MEASURE (this instrument cannot): fight
   outcome and muster casualties after the same-day fight (5/5
   triggers fight the same day; Herald death is in-sample but muster
   survival is unrecorded), and the 95434-style tail diversion
   (sounding changed a win into survive-unwon on one seed).
5. WHAT THE SPEC DOES NOT TOUCH: trustedAt (70), trustedOpinion (10),
   trusted/base quotas (6/2), need (10), gates, stages, deed bars, win
   prices, or the #1538 queue. This is a WHEN-to-sound rule, not a
   retune.

## Village assessment (plain words)

The village's friendships are the whole story, and they are decided
before the Herald ever arrives. On five seeds the village had already
done the slow work — every allied fire trusted it — so when the Herald
came, the call went out, eleven to seventeen blades marched, and the
fight happened the same day. On three seeds the friendships were not
there, and asking over and over did not build them: one village was
barely acquainted with anyone, one was held back by a single weak
friendship while its other two fires stood ready, and one watched its
friendships wear thinner with every refusal until the chance was gone.
The call itself is not the problem anymore — real named people answer
it, from villages the player never visited. The problem is timing:
the village must be ready before the Herald arrives, because the
arrival itself does not make it ready.

## Metric review (no bar changed here)

1. TRIGGER DEFINITION (the big one): every-link-trusted is sufficient,
   not necessary. 95423 (two links trusted, one at 46) would almost
   certainly have been ready under a sum rule (quota sum 14). The
   pilot's NO-GO is a verdict on this trigger's FREQUENCY (5/8), not
   on the call's power (5/5 ready when defined). The next run should
   pre-register a sum-based trigger (projected yield + Haven >= 10,
   counting generated rosters) alongside or instead of every-link
   trusted — that is a NEW run's prereg, not a re-score of this one.
2. SNAPSHOT YIELD IS NOT A YIELD METRIC: it undercounts sounded yield
   by 5–11 on every triggered seed (rosterless facesFree 0). Never
   judge a call by its snapshot; judge it by sounded yield.
3. refusedAfter DEFINITION: this corpus's refusedAfter counts day >=
   trigger day, so it is 1 (the trigger refusal) on every triggered
   seed. A future validator should use day > trigger day for
   "after" — the current value must not be read as "one later refusal."
4. NATIONAL DEFINITION: this arm's national is END scale rank
   (scaleRank at run end). The 2315Z worker's ever-national count on
   85106 (1) differs by definition; both are named here so the next
   prereg picks one and says so.
5. SCREEN STOP: see the screen honesty note above. The stop rule
   (stop at 7 qualifiers) was NOT in the prereg; it is disclosed here
   rather than hidden, and it cannot change the pilot set (ascending
   order). A future prereg should state the stop rule up front.
6. PANEL (§15): not applicable (see header). No panel fabricated.

## Corpus

evidence/2026-11-01/perseed-quotatrigger-a/ — pilot-all.stdout/.stderr
(combined 8-seed run lines; pilot.stdout = 90111 line,
pilot-rest.stdout = 7 qualifier lines), pilot-s<seed>.json (8 judged
per-seed files), screen.stdout/.stderr (46-seed partial no-call screen,
95401–95446), validator scripts/test-quotatrigger-a.js (reproduces
NO-GO from the corpus: trigger-rate FAIL 5/8, all other bars PASS).
Instruments: scripts/quotatrigger-replay-20261101.js,
scripts/quotatrigger-split-20261101.js.

## Blanks filled / documented

- FILLED (evidence): trusted-tier trigger judged on 8 fresh seeds —
  5/5 ready when defined, same-day fight 5/5, roster generation holds
  at trigger, pre-trigger timelines proven identical screen-vs-pilot.
- DOCUMENTED (not fixed, out of scope): (1) trigger frequency 5/8
  with the weakest-link counterexample; (2) trust bleed during contact
  bursts (95425, confirming the 2315Z shape); (3) snapshot undercount
  5–11; (4) roster first-name collisions inside a call; (5) fight
  outcome / muster casualties unrecorded by this instrument; (6)
  contact rarity under the seatdrive stack (7/46 refused, 25/46 lesser
  wins censoring the window); (7) 95434 tail diversion (win ->
  survive-unwon after sounding, n=1).
- NOT touched per task bounds: #1538 steve-call queue, gates, stages,
  deed bars, win prices, sibling trees/branches, hidden_files
  (tracker/claims/findings — coordinator-owned).

## Convergence state

scale-onramp: converging, NOT converged. The quota-at-trigger question
is answered (ready 5/5 when the moment exists; the moment itself is
the scarce thing, and the sum-rule counterexample bounds it), but no
game change was built in this run and the full seat remains unwon on
every pilot seed (wins here are lesser-seat wins: 95438 day 90, 95446
day 93).
