# sim-spanpromo-b — real-play promotion band for the 15 probe-proven span keys

Run: oversight-flesh-out-loop-b, arm sim-spanpromo-b, axis
food-economy. DIAG/measurement ONLY: ZERO src/js changes, ZERO
default flips, ZERO changes to any existing analyzer, sweep,
capture, or to scripts/dedupspan-ledger-b.js /
scripts/census-spandraw-b.js. One NEW script, allowed by the
prereg for the det-gate leg only:
scripts/detgate-spanpromo-b.js (instrument OFF vs ON on one
seed). The judged sweep is scripts/sweep-spandraw-census-b.js
UNchanged with PERSEED_DIR pointed at this arm's corpus, and
the judged classifier is scripts/census-spandraw-b.js
unchanged.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-27/sim-spanpromo-b-prereg.md, committed as 834b2a90 BEFORE any judged sweep)

- LEG 1 — pilot gate: GO. All 8 pilot seeds completed
  without sweep crash; every pilot payload carries
  nestEvents, directRecords, and mealDrawRecords; every
  fired key is classified (no unclassified key).
- LEG 2 — promotion judgment: GO. The per-key table below
  publishes, for each of the 15 keys, spans, day-crossing
  spans, span-internal draws, exclusion kcal, seeds with
  spans, seeds with exclusions, classification, and zero
  attribution. A band that meets LEG 2 is a completed band
  even though its answer is "no key promotes" — see the
  overall verdict.
- LEG 3 — confirm: NOT TRIGGERED. No key met the census
  PROVEN rule on any pilot seed, so no confirm band
  (10021-10032) was run. Per the prereg, a negative
  promotion band is a result, not a failure, and burning
  12 seeds on zero signal would add nothing.
- LEG 4 — controls: GO. (a) Det-gate: instrument OFF vs ON
  on seed 10012 are IDENTICAL on every compared field
  (daysAlive 100, endReason survived, rank village,
  national false, table false, win false, waveReach [1,2],
  deaths 4, deathCauses arena 2 / monster 1 / contest 1) —
  the instrument changes nothing; only its own output
  differs (nestEvents 0 vs 426, which is the recorder
  recording, not a game outcome). (b) The 9954 belongseek
  replay control still classifies cultivate as PROVEN with
  3,820 kcal exclusions through the same analyzer (proof
  F1/F2 green) — the instrument is consistent, so the
  band's zeros are measured zeros, not a broken detector.

## Overall verdict: NO PROMOTIONS — all 15 keys stay PROBE-PROVEN (mechanism, not real play)

On an unscripted competent-policy band (8 fresh seeds
10012-10019, 100d max death-aware), NOT ONE of the 15
probe-proven keys fired through useAbility at all — zero
spans, zero crossings, zero exclusions, on every key, on
every seed. There is nothing to promote: promotion requires
a key to recur with a day-boundary exclusion in real play,
and these keys do not recur in real play under this policy
because they do not fire. This is the census's
cultivate-only-surface finding, re-tested on fresh seeds
and confirmed, not a new surprise: in node sims the only
game-code useAbility caller is cultivateGarden (player
path); UI buttons live in app.js, excluded from node; and
villager casts bypass useAbility entirely. The probe proved
these keys COULD swallow a night if tapped at the last
hour; this band proves competent-policy play never taps
them at any hour. Until a band runs under a policy (or a
UI-driven play path) that actually taps arbitrary ability
actions, the keys stay PROBE-PROVEN and must never be
quoted as real-play double-counts or savings. The
follow-up is a different instrument, not more competent
seeds — more seeds under this policy would only add more
cultivate spans by the same mechanism.

## The 15-key table (judged corpus, 8 seeds, competent-nofeast, 100d max death-aware)

"Owned" is the post-run abilityOwnership snapshot (player or
villager ownership at post-run; an ability owned mid-run and
lost before post-run can be missed — stated, not hidden).

| key | spans | crossing | int. draws | excl kcal | seeds w/ spans | seeds w/ excl | classification | zero attribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tracker.track | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| thief.steal_pantry | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| game_sense.read_sign | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| patient_aim.clean_shot | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| stalk.stalk_prey | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| blood_trail.follow_blood | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| ambush.lay_wait | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| animal_ken.read_beast | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| scarecrow.stage_injury | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| molt.shed_skin | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| fear_aura.menace | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| intimidating_presence.end_it_before | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |
| war_cry.challenge | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: OWNED-BUT-UNFIRED on 4 seeds (10013, 10014, 10016, 10018) — including player-owned on 10014, still never tapped |
| trophy_room.mark | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: OWNED-BUT-UNFIRED on 4 seeds (10012, 10017, 10018, 10019, villager-owned) |
| long_table.share_pot | 0 | 0 | 0 | 0 | 0 | 0 | STAYS PROBE-PROVEN | policy: never tapped; fixture: never owned on band |

The two owned-but-unfired keys are the sharpest form of
this negative result: even where the village owned the
ability, competent policy never tapped it through
useAbility. Ownership without a tap is not a near-miss for
promotion — promotion needs a span, and there is none.

## What did fire (for contrast, same band)

| ability.action | classification | spans | day-crossing | spans creating a record | span-internal draws | excl kcal | seeds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| green_thumb.cultivate | NO-DAY-CROSSING | 273 | 0 | 0 | 0 | 0 | 5 |
| green_whisper.cultivate | NO-DAY-CROSSING | 160 | 0 | 0 | 0 | 0 | 3 |

433 cultivate spans, and the double-count needs three
things at once — a day-crossing span, a span-internal meal
draw, and a created direct record. Real-play cultivate
spans have NONE of the three: zero crossings, zero
internal draws, zero records created (directAfter always
equals directBefore). Cultivate's real-play proof remains
solely the belongseek 9954 replay, exactly as before; this
band does not re-judge it, and its competent-policy
silence matches the census band's.

## Per-seed table

| seed | days | end | rank | wave | deaths | spans | draw pairs | span-internal draws | unmatched | excl kcal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10012 | 100 | survived | village | 2 | 4 | 55 | 158 | 0 | 0 | 0 |
| 10013 | 100 | survived | village | 3 | 4 | 85 | 225 | 0 | 0 | 0 |
| 10014 | 100 | survived | village | 3 | 1 | 92 | 288 | 0 | 0 | 0 |
| 10015 | 100 | survived | village | 2 | 2 | 90 | 191 | 0 | 0 | 0 |
| 10016 | 100 | survived | village | 3 | 5 | 27 | 317 | 0 | 0 | 0 |
| 10017 | 100 | survived | village | 3 | 1 | 84 | 185 | 0 | 0 | 0 |
| 10018 | 100 | survived | village | 2 | 0 | 0 | 320 | 0 | 0 | 0 |
| 10019 | 100 | survived | village | 3 | 6 | 0 | 500 | 0 | 0 | 0 |

Totals: 433 spans, 2,184 meal-draw pairs, 0 span-internal
draws, 0 unmatched links, 0 ambiguous spans, 0 kcal
excluded, 0 records changed. The two zero-span seeds
(10018, 10019) are explained, not anomalous: the player
owns no green source on either (the census's zero-span
pattern), while villagers own green_whisper — and villager
garden work bypasses useAbility, so it creates no span.
Nest-event accounting cross-checks exactly (e.g. seed
10012: 55 spans x 2 + 158 draws x 2 = 426 events).

## Sense-testing (read end-to-end, judged on meaning)

No key promoted, so there is no promoted-key transcript
to read — stated plainly, not filled in. The closest
real-play span the band actually produced is the first
span on seed 10012, read in full:

| evt | event | day | note |
| --- | --- | --- | --- |
| 171 | spanEnter green_whisper.cultivate | 46 | the garden tap opens |
| 172 | spanExit green_whisper.cultivate | 46 | closes the same day, directBefore = directAfter = 84 (no record) |

ZERO events fall strictly inside the span. Judgment: this
is real play, and it is the opposite shape from the probe
trace. The probe's tracker tap held a night with 11 meal
draws inside it; the real-play garden tap holds nothing at
all — it opens and closes back-to-back mid-day, no dinner
inside, no pantry record created. In plain words: the
gardener works the garden and is done before dark, so no
night ever falls inside the tap and no meal can be
double-counted through it. The village's nights, on this
band, happen entirely outside ability spans: 2,184 meal
draws, all outside spans, all counted once. No villager
transcript line names any span (the cultnest arms already
established this surface is silent in speech); silence is
reported, not filled in.

## Wall numbers (stated, not estimated; regime: competent-nofeast, 100d max death-aware)

- National: 0/8. Table: 0/8. Wins: 0/8.
- Wave reach: max wave 3; wave 4-5 reach: 0/8.
- Survival: all 8 villages survived to the 100d cap, so
  median survival is 100 AT CAP (not a death median — no
  village died, so no death median exists on this band),
  max 100.
- Deaths: 23 villager deaths inside surviving villages.
  Causes: the arena 10, monster 5, contest 3, ambush 2,
  night court 1, choir toad 1, "a toad like a war drum" 1.
  These are villager deaths, not village deaths — every
  village lived to day 100.
- This is ledger work, not a reachability claim: the band
  was built to test span promotion, and its wall numbers
  are reported because the run asks for them, not inflated
  into one.

## Village assessment (plain words)

Eight fresh villages, all still standing at day 100 — a
sturdy band, not a struggling one. They garden daily (433
taps), eat together every night (2,184 meal draws, none of
them inside a tap), lose villagers to the arena and to
monsters in single digits, and never get past wave 3 or
village rank. Nobody in these villages ever tracked a
trail, stole from the pantry, read a beast, shed a skin,
or shared a long-table pot through the game's ability
channel — not because they lacked the powers (two of the
powers were owned and never used), but because the daily
play of a competent village never reaches for them. The
village that this band shows is a gardening village: its
one ability habit is the garden, done in daylight, done
before dark. Blanks filled: (1) the real-play promotion
question itself — answered NO for all 15 keys on this
policy, with the owned-but-unfired split as the evidence;
(2) the det-gate neutrality proof for the nest logger,
which the census sweep could not show on its own.
Documented, not fixed: the follow-up instrument — a band
under a policy (or a UI-driven play path) that actually
taps arbitrary ability actions — is what any future
promotion claim needs, and it is a new instrument, not
more seeds here.

## Balanced panel (MEASUREMENT.md §15 — explicit statement, not a fake)

This band has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. The judged
comparison is WITHIN the instrument (real-play spans vs
the probe's boundary spans, same classifier, same dedup
rule), and panel metrics (national/table/wins) are
reported as wall numbers from the band's own payloads,
not as a before/after comparison. So NO balance-panel
compare .md is produced for this arm, as pre-registered.

## Metric review (MEASUREMENT.md §14)

- No metric is re-scored here. The promotion bar
  (PROVEN rule + >=3 confirm seeds) was never reached
  because no key met the PROVEN rule on any pilot seed,
  so LEG 3 correctly never triggered.
- Metric doubt for the NEXT run (not this one): the
  "owned-but-unfired" split is post-run ownership, so it
  can miss an ability owned mid-run and lost before
  post-run. On this band that limitation cuts in favor of
  the verdict, not against it: even the ownership the
  snapshot DOES see produced zero taps, so a missed
  mid-run ownership could only add more owned-but-unfired
  cases, never a promotion. A future promotion band that
  DOES see taps should track ownership over time, not just
  at post-run.
- Seed note (disclosed): pilot seed 10013's only prior
  dated-.md mention is a call-count column in a release
  table, not a seed — disclosed in the prereg, not a
  collision, and its band behaviour (85 spans, 0
  exclusions) is unremarkable against the other seeds.

## Proof

- `node scripts/test-spanpromo-b.js` — 15/15, exit 0,
  verdict PROOF-GREEN (4 synthetic legs: boundary+match
  PROVEN, same-day NO-DAY-CROSSING, unmatched crossing
  MIXED-NEEDS-READ, crossing-without-record not PROVEN;
  corpus legs: 8 files, all carrying nestEvents /
  directRecords / mealDrawRecords, analyzer wall seeds 8,
  no unclassified key, full 15-key table printed from
  measurement; 9954 replay control F1/F2 green at
  3,820 kcal). Note: an early proof run mid-sweep read a
  2-file partial corpus and correctly reported PROOF-RED
  on the incomplete corpus (E1/E5) — the proof is strict
  about corpus completeness, and the final run above is
  on the complete 8-file corpus.
- Det-gate: `DETGATE_MODE=off|on node
  scripts/detgate-spanpromo-b.js` (seed 10012, same
  substrate) — OFF vs ON identical on all compared
  fields (see LEG 4).
- Pilot: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 SEEDS=10012,...,10019 DAYS=100
  PERSEED_DIR=evidence/2026-10-27/sim-spanpromo-b-corpus
  node scripts/sweep-spandraw-census-b.js` — 8 files,
  exit 0, corpus evidence/2026-10-27/
  sim-spanpromo-b-corpus/, analysis
  evidence/2026-10-27/sim-spanpromo-b-analysis.json.
- No jest (proofs are node, not jest). No [needs-eyes]:
  measurement/tooling only, nothing player-visible. Zero
  src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] backlog item "REAL-PLAY PROMOTION BAND FOR
  PROBE-PROVEN SPAN KEYS" (sim-findings.md line 1279) is
  now ANSWERED for competent policy: no key promotes; all
  15 stay PROBE-PROVEN. The item should NOT be re-run
  under competent policy. What remains is a NEW instrument
  question (a tapping policy or UI-driven play path), not
  a re-run of this band. (sim-spanpromo-b)

## Convergence line

real-play-promotion — unscripted competent-policy band, 8
fresh seeds 10012-10019, 100d max death-aware: 0/15 keys
promoted; all 15 stay PROBE-PROVEN (mechanism). 433
cultivate spans, all NO-DAY-CROSSING with zero records
and zero internal draws; 2,184 meal draws, all outside
spans; 0 kcal excluded on the band. 13 keys never owned on
the band; war_cry and trophy_room owned-but-unfired on 4
seeds each. Det-gate OFF vs ON identical (seed 10012);
9954 replay control green at 3,820 kcal. No confirm band
(zero pilot signal, per prereg). Wall: 0/8 national /
table / wins, max wave 3, all 8 villages survived to the
100d cap, 23 villager deaths.

## Verdict (judged against the pre-registered bar, not re-scored): NO PROMOTIONS — LEG 1 GO, LEG 2 GO, LEG 3 NOT TRIGGERED, LEG 4 GO

The promotion band ran, the instrument is proven neutral,
the detector is proven consistent, and the answer is
plain: in real competent-policy play, these 15 keys do not
fire, so they do not double-count, and they stay
PROBE-PROVEN until a band that actually taps them exists.
