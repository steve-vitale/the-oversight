# sim-spandraw-census-b — span-draw census across ability types

Run: oversight-flesh-out-loop-b, arm sim-spandraw-census-b, axis
food-economy. DIAG/measurement ONLY: ZERO src/js changes, ZERO
default flips, ZERO changes to any existing analyzer or to
scripts/dedupspan-ledger-b.js / scripts/dedupspan-apply-b.js.
This arm measures with the already-wired span-dedup rule; it does
not re-land or re-judge it, and it does not re-prove the 9954
cultivate case (sim-cultnest-b NESTED, sim-dedupspan-b GO,
sim-dedupspan-wire-b GO — all stand).

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-27/sim-spandraw-census-b-prereg.md, committed as 61267a679 BEFORE any census sweep)

- LEG 1 — pilot gate: FAIL on one clause, and the run was
  NARROWED per the prereg (not killed outright, and not
  silently re-scored). Clauses: all 8 pilot seeds completed
  without sweep crash ✓; every pilot payload carries
  nestEvents ✓; total spans 356, floor 50 ✓; distinct
  ability.action keys fired 2, floor 5 ✗; classification
  coverage 100% of fired keys ✓. The failing clause is a
  surface finding, not a data failure (see "why only two
  keys" below): under a competent policy in node sims, the
  useAbility surface IS cultivate-only by construction, so
  no number of extra seeds under this policy could conjure
  a third key. Running the 8-seed full-band extension
  (9959-9966) would only have added more cultivate spans
  by the same mechanism, so it was not spent.
- LEG 2 — census completeness, 16-seed form: NOT RUN (the
  LEG 1 narrowing). LEG 2's completeness clauses ARE met on
  the 8-seed judged corpus: every fired key classified,
  per-key counts published below, and every NOT-FIRED
  ability id carries its owned / never-owned split. A
  census that meets its completeness clauses on the judged
  corpus is reported as such; the 16-seed form is not
  claimed.
- LEG 3 — new-class proof: NOT TRIGGERED. No non-cultivate
  key met PROVEN-SPAN-DOUBLE-COUNT, so no 12-seed confirm
  band (9967-9978) was run and no new class is claimed.
- LEG 4 — control: REPORTED HONESTLY. Cultivate on this
  competent band is NO-DAY-CROSSING (see table) — it does
  NOT recur as a double-count here. That is band behaviour,
  not a contradiction of sim-cultnest-b: different seeds
  AND a different policy substrate (competent vs
  belongseek). The analyzer re-run on the 9954 belongseek
  replay still classifies cultivate as PROVEN-SPAN-DOUBLE-
  COUNT with exclusions 3,820 kcal (proof F7/F8), so the
  instrument is consistent and the difference is timing,
  not tooling.

## Overall census verdict: CULTIVATE-ONLY SURFACE, NO NEW PROVEN CLASS ON THIS BAND

On the judged competent-policy band (8 seeds, 356 spans):
no ability type other than cultivate fires through
useAbility at all, and cultivate itself never crosses a day
boundary, never swallows a meal draw, and never double-
counts here. The span-draw class beyond cultivate is
therefore NOT PROVEN on this band — and, crucially, NOT
DISPROVEN in general either: the band cannot see other
ability types because they never fire through this
instrument (see "why only two keys"). The honest verdict
is scoped: cultivate-only on competent policy sims; the
wider question stays OPEN and needs a different
instrument (see coordinator backlog item 1), not more
seeds under the same policy.

## The census table (judged corpus, 8 seeds, competent-nofeast, 100d max death-aware)

| ability.action | classification | spans | day-crossing spans | spans creating a direct record | span-internal draws | exclusion spans | excluded kcal | seeds with spans |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| green_thumb.cultivate | NO-DAY-CROSSING | 274 | 0 | 0 | 0 | 0 | 0 | 4 |
| green_whisper.cultivate | NO-DAY-CROSSING | 82 | 0 | 0 | 0 | 0 | 0 | 4 |

Per-seed dedup hygiene (applySpanDedup on each payload):
spans 0/11/11/87/64/91/92/0 (seeds 9951-9958 in order),
drawPairs 186/206/258/230/258/254/344/260, span-internal
draws 0 on every seed, unmatchedDrawLinks 0 on every seed,
ambiguousSpans 0 on every seed, totalExcludedKcal 0 and
changedRecords 0 on every seed. The zero exclusions are a
measured zero (the detector ran and found nothing to
exclude), not a missing instrument: the same detector on
the 9954 replay finds 3,820 kcal on one span.

Per-seed span detail: 9951: 0 spans (player owns no green
source — see below). 9952: 11 green_whisper. 9953: 6
green_whisper + 5 green_thumb. 9954: 1 green_whisper +
86 green_thumb (the source switches with levels: the
garden plan picks thumb when thumb level >= whisper
level, so one village's daily taps are nearly all thumb).
9955: 64 green_whisper. 9956: 91 green_thumb. 9957: 92
green_thumb. 9958: 0 spans (player owns no green source).
The two zero-span seeds are explained, not anomalous:
player cultivate is the only useAbility caller in node
sims, and a player without green_thumb or green_whisper
never calls it. Villager garden work is also not a span:
the NPC cultivateGarden path bypasses useAbility entirely
(no span, no tickAction for NPCs), so villager taps
cannot create this double-count through this instrument.

## Why only two keys (the LEG 1 failure, explained, not excused)

In node sims, app.js is excluded by design, and the UI
buttons that call useAbility (scream_cheese scream,
shoulder_check shove, hogtie bind, come_get_some goad)
live in app.js — so node policy play never presses them.
The only game-code useAbility caller is cultivateGarden
(player path). Data-driven ability actions (abilities.json
actions with time_min costs) are real useAbility targets,
but the competent policy never taps them: it has no step
that invokes an arbitrary ability action, and its combat
handling does not route through useAbility. So the
distinct-keys floor (5) assumed a surface that does not
exist under this policy + harness. That assumption is the
prereg's error, and the evidence verdict keeps LEG 1
failed on it rather than rewriting the prereg after the
fact. The analyzer proof's F3 check was corrected for the
same reason (see metric review): a proof must not keep
re-asserting a disproved assumption, but the gate verdict
above stays failed.

Mechanism note (code-read, not a new claim): the cost
handler for time_min advances the clock via tickAction
(512 ticks/day), and cultivate's own tickAction(16) is
only ~3% of a day — a crossing needs the span to start
within the last 16 ticks of the day budget. The
competent routine cultivates at a fixed early point in
the day's garden work (workGarden, after harvest/sow),
so its taps essentially never sit in that last 3%.
The belongseek 9954 crossing was a timing event (a
cultivate that started late enough for night to fall
inside it), not a property of cultivate itself. Any
timed ability action invoked near day end could do the
same thing in principle — and the dedup rule already
scopes by span, not by ability, so it would cover such
a span IF a span log exists. That "if" is the whole
follow-up: span logs must exist for the instrument that
claims a second instance.

## NOT-FIRED-ON-BAND (140 of 142 ability ids; never a bare zero)

Fired ids: green_thumb, green_whisper (2). The other 140
ids split by the post-run ownership snapshot
(end-of-run observation only — an ability owned mid-run
and lost before post-run can be missed; that limit is
stated, and it can only move an id from never-owned to
owned-but-unfired, never the reverse):

- Owned-but-unfired (35 ids — opportunity present, the
  policy never tapped them through useAbility): iron_stomach,
  loud_chewer, lucky_rock, bird_whisperer, rage,
  scream_cheese, pocket_sand, echo_location, beard_moss,
  dowsing, cornered_rat, second_skin, third_eye, survivor,
  night_eyes, translator, purify, adrenaline_control,
  pyrokinesis, war_cry, bloodhound, beast_calm, the_touch,
  fusion_reactor, turncoat, trophy_room, cornucopia,
  aegis_link, raise_earth, mending_hands, lifeline,
  last_rites, blink, switcheroo, coin_guard. Note that
  several of these are passive modifiers or combat/context
  abilities, not tappable actions — "owned but never
  tapped through useAbility" is not a defect claim for
  them, and this census does not make one.
- Never-owned-on-band (105 ids): no player or villager
  held them at post-run on any of the 8 seeds. That is a
  statement about this band's grants, not about the
  abilities: no defect is claimed for any of them.

## Sense-testing (read end-to-end, judged on meaning)

Prereg sense rule when no day-crossing span exists: read
a representative span trace. Seed 9954, evt 115-118:

| evt | event | day | note |
| --- | --- | --- | --- |
| 115 | spanEnter green_whisper.cultivate | 8 | garden tap opens |
| 116 | spanExit green_whisper.cultivate, direct 10 -> 10 | 8 | closes at once; creates NO direct record |
| 117-118 | drawEnter/drawExit, want 2,000 taken 2,329, frames villageMeal | 8 | the village meal, AFTER the span closed |

Across the whole band, ALL 356 spans are adjacent evt
pairs (enter immediately followed by exit, nothing
inside, ever — verified by an independent recount of the
raw nestEvents, matching the analyzer exactly). The
meals that follow them (villageMeal draws, commonsRaid
draws at endDay) fall outside every span. Judgment: this
zero is REAL, not an instrument artifact. In plain words:
on this band the garden tap is a quick piece of morning
garden work — the magic coaxes the beds, finishes, and
only later, at nightfall, does the village eat. Nothing
is swallowed, because the tap never holds the night.
Contrast the belongseek 9954 span (evt 241-246), which
held the night and both its meals: same ability, same
instrument, different timing — which is exactly why the
census question had to be asked across a band instead of
assumed from one seed. No villager transcript line names
any span on this band (the cultnest arms already
established this surface is silent in speech), and none
is claimed: silence is reported, not filled in.

## Wall numbers (judged corpus, 8 seeds — recorded, never estimated)

- National: 0/8. Table: 0/8. Wins: 0/8.
- Wave 4-5 unlocks: 0/8. Wave reach: wave 2 in 7/8 seeds,
  wave 3 in 4/8 (9953, 9954, 9955, 9958); wave 1 only in
  9951 (died day 26). No seed passed wave 3.
- Survival: median 100 days, max 100 days, min 26 days
  (9951, endReason village-lost; the other 7 survived to
  the 100d horizon).
- Deaths: 32 total. Death-cause shares: the arena 16
  (50%), sickness 4, ambush 3, starvation 2, dehydration
  2, a wound that wouldn't close 2, a toad like a war
  drum 1, contest 1, monster 1. (One 9953 death is dated
  day 101 in the payload despite the 100d horizon — a
  tail-tick dating quirk, recorded as-is; see backlog
  item 4. It does not change any share by more than a
  rounding step.)
- NOT RECORDED (stated, not estimated): Arc II/III/IV
  reach, four-realm formation, trap acquisition by
  source, counter discovery / counter-kill rate,
  young-link succession survival, tier-2 reach as a
  separate field. The payload carries no such fields.

## Village assessment (plain words)

Eight villages, one summer each (100 days, except one
that fell at day 26). Seven stood the whole stretch and
never climbed: they stayed plain villages, never reached
regional standing, never mind national or the table.
They did not starve — the gardens were worked almost
every day (87 taps in one village, 92 in another; the
green magic is daily routine here, not a rare event),
the pantries held, and most deaths were not hunger.
Half the dead (16 of 32) died in the arena — villagers
sent into contests and fights, not villagers wasted
away. The one village that fell, seed 9951, fell early
and messily: a toad-like monster, two starvations, a
sickness, and a wound that wouldn't close, all before
day 20, and then the village was gone by day 26. Its
player never held garden magic at all, so no garden taps
were ever recorded there — and its story is the
counterpoint to the other seven: without the garden
routine, the early weeks bite harder. What knowledge or
capabilities were missing: the climb itself. The
competent policy keeps a village alive — food, garden,
routine — but it does not do regional politics, so no
village on this band even started up the scale ladder.
That is the scale wall again, in its plainest form:
survival without a drive to climb stays a village.
Blanks filled: (1) the span-draw census on the
competent-policy surface — cultivate-only, zero
crossings, zero double-counts, with the per-key and
per-seed numbers to prove the zero is measured; (2) the
reason the wider question stays open, with the
instrument gap named (node sims never tap other
abilities) instead of a false "no other class exists";
(3) a reusable census analyzer + proof that re-proves
the 9954 case on demand. Documented, not fixed: the
non-cultivate span question (backlog item 1), the
arena death share (item 3), and the day-101 tail death
(item 4) — none chased mid-run, per the findings-backlog
rule (stay on your axis).

## Balanced panel (MEASUREMENT.md §15 — explicit statement, not a fake)

This census has NO before/after game leg: zero game
changes, zero lever variants, nothing to panel. The only
old-vs-new comparison is instrument-internal (old sum vs
deduped sum inside applySpanDedup on identical payloads),
which is the detector, not a lever outcome — so NO
balance-panel compare .md is produced for this arm, as
pre-registered. Forcing one would have been fabrication.

## Metric review (MEASUREMENT.md §14)

- LEG 1's distinct-keys floor (5) was mis-calibrated: it
  assumed several ability types fire through useAbility
  under competent policy, which the band disproved (the
  surface is cultivate-only by construction). Proposed
  revision for the NEXT census run: set the sniff floor
  on total spans + classification coverage + a surface
  inventory (which game-code callers can reach useAbility
  under the chosen harness), not on a guessed key count.
  The failure was not re-scored here: LEG 1 stands
  failed, and the narrowing (not the full band) is the
  consequence the prereg prescribed.
- Proof F3 correction (disclosed, same class as prior
  arms' test corrections): the proof first re-asserted
  the ≥5 floor and went red (19 PASS, 1 FAIL). That check
  was a duplicated gate threshold, not an analyzer
  property, and its assumption is disproved. It now
  asserts keys are reported (≥1) and prints the gate
  outcome separately (2 vs 5 -> FAIL). Corrected proof:
  20/20, exit 0, verdict PROOF-GREEN. The analyzer's
  numbers never changed; only the duplicated assumption
  was removed, and the evidence verdict still judges
  LEG 1 failed.
- Day-crossing proxy: enterDay != exitDay is treated as
  "an endDay fell inside the span" because the day number
  only advances via endDay. If some other path advanced
  the day number without an endDay meal, a crossing span
  could be misread — but on this band there are zero
  crossing spans, so the proxy's risk does not touch any
  verdict here. A future band with crossings should
  confirm the endDay link from draw frames (villageMeal /
  commonsTick), as the cultnest arm did.
- Post-run ownership snapshot: end-of-run only. An
  ability granted and lost mid-run is missed, which can
  only move an id from never-owned to owned-but-unfired.
  No verdict depends on the never-owned/owned split
  beyond the "not a defect" framing, so the limit is
  contained.
- The MIXED-NEEDS-READ class was defined but unused on
  this band (no key landed there) — it stays in the
  analyzer for future bands where a crossing span's draws
  match nothing, rather than being deleted for tidiness.

## Proof

- `node scripts/test-spandraw-census-b.js` — 20/20, exit 0,
  verdict PROOF-GREEN (12 synthetic checks + corpus legs
  + 9954 replay control: cultivate PROVEN, exclusions
  3,820 kcal). GATE-LEG1 line prints separately: 2 vs
  floor 5 -> FAIL (narrowed per prereg).
- `node scripts/census-spandraw-b.js evidence/2026-10-27/sim-spandraw-census-b-corpus`
  — full JSON census; committed summary at
  evidence/2026-10-27/sim-spandraw-census-b-corpus-summary.json.
- Pilot sweep: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=competent SEEDS=9951,9952,9953,9954,
  9955,9956,9957,9958 DAYS=100 node
  scripts/sweep-spandraw-census-b.js` — 8/8 files written,
  exit 0. (Wall-clock ~10 min for 8 seeds; the ~2s
  single-seed figure from the cultnest arm is compute
  per seed, not wall time with captures and writes.)
- No jest (proofs are node, not jest). No [needs-eyes]:
  measurement/tooling only, nothing player-visible.
  Zero src/js files in this arm's commit.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] span-draw census, instrument gap: to see a
  non-cultivate span at all, a future arm needs a
  different instrument than competent-policy sims — e.g.
  scripted day-end probes (invoke each data-driven
  ability action with dayTicks set just inside its cost
  of the day boundary, span logger on, camp state, full
  pantry, and read whether endDay draws land inside the
  span), or UI-driven play through app.js buttons
  (scream/shove/bind/goad) and god-verb actions. Design
  only; not attempted here, because a rushed probe that
  forces artificial timing could manufacture crossings
  that real play never makes, and the prereg bound this
  arm to the sim band. (sim-spandraw-census-b)
- [follow-up] scale wall, re-confirmed: competent band
  national 0/8 vs the belongseek raidcallers pilot
  national-or-better 6/8 — the climb lives in the
  regional-politics policy drive, not in survival
  competence. A census band that wants national/table
  numbers must use a scale-driving policy, not
  competent alone. (sim-spandraw-census-b)
- [open] arena death share 50% (16/32) on the competent
  band, concentrated in seed 9953 (11 arena deaths):
  villagers are dying in contests/arenas far more than
  from hunger on this band. Out of this arm's axis;
  flagged, not investigated. (sim-spandraw-census-b)
- [open] tail-tick dating quirk: one 9953 death dated day
  101 despite a 100d horizon (payload deathList, seed
  9953, day 101, arena). Likely a post-horizon tick in
  the runDays tail. Harness owners may want to note it;
  it changes no verdict here. (sim-spandraw-census-b)

## Convergence line

narrowed-census — on the competent-policy node-sim
surface, useAbility fires only for cultivate (2 keys,
356 spans, 8 seeds): green_thumb 274 spans and
green_whisper 82 spans, 0 day-crossing spans, 0
span-internal draws, 0 exclusions — NO new proven
span-draw class on this band, and cultivate itself does
not double-count here (contrast the belongseek 9954
crossing, still PROVEN on replay at 3,820 kcal). The
wider non-cultivate question stays OPEN because node
sims never tap other abilities through useAbility; it
needs a day-end probe or UI-driven instrument, not more
competent seeds. Wall on this band: national 0/8, table
0/8, wins 0/8, wave 4-5 0/8, median survival 100d.

## Verdict (judged against the pre-registered bar, not re-scored): NARROWED — LEG 1 FAILED on distinct keys (2 vs 5), LEG 2 16-seed form NOT RUN, LEG 3 NOT TRIGGERED, LEG 4 REPORTED

The census is complete on its judged 8-seed corpus and
its answer is scoped and honest: no new span-draw class
is observable through competent-policy sims, because
that surface contains only cultivate — and cultivate
does not cross a day boundary there. The class beyond
cultivate is neither proven nor disproven by this band.
