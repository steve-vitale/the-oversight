# sim-spandraw-census-a — span-draw census across ability types, long-day real play

Run: oversight-flesh-out-loop (loop A), run fleshout-20261106T0315Z,
arm sim-spandraw-census-a, axis food-economy. DIAG/measurement ONLY:
ZERO src/js changes, ZERO default flips, ZERO changes to any existing
analyzer, sweep, capture, or policy (competent.js untouched). New
files only: a long-day policy wrapper, a playpath driver vendored
from playpath-b, and the proof script. This arm answers
sim-findings item #1245 (2026-10-27, food-economy/ledger): only
cultivate spans are proven to swallow an endDay; other useAbility
spans that cross a day boundary could create the same direct+meal
double-count. Classification only; no fix.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-11-06/sim-spandraw-census-a-prereg.md, committed as 336f83903 BEFORE any judged sim, plus the evening-work amendment committed as 728ae0ebb, also before any judged sim)

- LEG 1 — census pilot gate: DIAG-GO. All 8 pilot seeds completed
  without sweep crash; every payload carries nestEvents,
  directRecords, mealDrawRecords; the analyzer classifies 100%
  of fired keys (4 keys, no unclassified span); the per-key
  table is published below; every NOT-FIRED ability id carries
  its owned/never-owned split (138 ids: 23 owned-but-unfired,
  115 never-owned); wall numbers recorded.
- LEG 2 — playpath-longday pilot gate: DIAG-GO. All 120
  instances completed without driver crash; every genuinely
  attempted tap carries spanEnter+spanExit for its key (565/565,
  strict proof); every tap-window span is classified (15-key
  table, no unclassified span); tap-position distribution
  published (min 0, median 417, max 507; 16 in-window taps);
  the 9954 replay control still classifies cultivate as PROVEN
  (3,820 kcal) through the census analyzer (proof C3).
- EXTENSION RULE: TRIGGERED. The pilot showed 16 day-crossing
  tap-window spans, so LEG 2 was extended to 16 seeds
  (47009-47016, 120 more instances) per the prereg. LEG 1 was
  NOT extended (0 day-crossing spans there, per the prereg's
  "extend LEG 1 only if LEG 1 itself shows a day-crossing
  span").
- PROMOTION RULE: TRIGGERED on the pilot (8 keys met
  PROMOTED-REAL-PLAY), so the 12-seed confirm band
  (47017-47028, 180 instances) ran and recurrence was judged
  there. Of the 8 pilot-promoted keys, ALL 8 recurred on the
  confirm band — see the promotion table. long_table.share_pot
  met the pilot rule but did NOT recur on confirm: per the
  prereg it is a CANDIDATE, not PROMOTED, reported as such and
  never rounded up.
- LEG 3 — controls: DIAG-GO. (a) 9954 replay: green_whisper.
  cultivate PROVEN, 3,820 kcal (proof C3). (b) Design-b tracker
  boundary instance through the tap-window path: crossed, 11
  internal draws, 11 endDay-framed, exclusions 5,990 kcal
  (proof C1/C2).

## Overall verdict: 8 KEYS PROMOTED-REAL-PLAY — the span-draw class is real in played days, not just in probes

The long-day policy did what playpath-b's follow-up asked for:
played evenings now reach the last hour (max dayTicks 507-508,
vs 478 before), and when a tap lands within its key's cost of
the boundary, the night falls inside it. Across 28 seeds, 420
instances, 2,100 tap-days: 1,951 attempted taps, 29 in-window
taps, and EVERY in-window tap crossed (29/29) — the mechanism
in its cleanest form. Eight keys are PROMOTED-REAL-PLAY by the
pre-registered rule (pilot promotion + confirm recurrence):
ambush.lay_wait, blood_trail.follow_blood,
game_sense.read_sign, molt.shed_skin,
patient_aim.clean_shot, scarecrow.stage_injury,
stalk.stalk_prey, tracker.track. Four more are CANDIDATES
(promoted on one band only, never rounded up):
long_table.share_pot (pilot + extension, no confirm
recurrence), thief.steal_pantry (extension-only — and its one
crossing was a REFUSED tap), trophy_room.mark
(extension-only), fear_aura.menace (confirm-only). Three keys
never crossed on any band: animal_ken.read_beast,
intimidating_presence.end_it_before, war_cry.challenge.
Cultivate's real-play double-count was ALSO reproduced under
this policy: one evening-garden green_whisper.cultivate span
crossed a day boundary with 4 endDay draws and 2,450 kcal of
item-matched exclusions (seed 47008) — the second real-play
cultivate case after the 9954 belongseek replay, and the first
under competent-family play. The already-wired span-keyed
dedup rule covers all of them uniformly (it scopes by span,
not by ability); no new dedup work is implied by this arm,
and none is claimed. Total item-matched exclusions across the
combined playpath corpora: 51,280 kcal (tap-window spans
48,830 + the cultivate policy span 2,450).

## LEG 1 — competent census table (judged corpus, 8 seeds 47001-47008, 100d max death-aware)

| ability.action | classification | spans | day-crossing | records created | span-internal draws | excl kcal | seeds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| green_thumb.cultivate | NO-DAY-CROSSING | 201 | 0 | 0 | 0 | 0 | 7 |
| green_whisper.cultivate | NO-DAY-CROSSING | 118 | 0 | 0 | 0 | 0 | 6 |
| rage.unleash_rage | NO-DAY-CROSSING | 36 | 0 | 0 | 0 | 0 | 3 |
| war_cry.bellow | NO-DAY-CROSSING | 2 | 0 | 0 | 0 | 0 | 1 |

Totals: 357 spans, 0 day-crossing spans, 0 span-internal draws,
0 exclusions, 0 unmatched links, 0 ambiguous spans on every
seed. The zeros are measured (the detector ran and found
nothing), not a missing instrument: the same detector on the
9954 replay finds 3,820 kcal on one span.

NEW SURFACE vs census-b (cultivate-only): rage.unleash_rage
(36 spans, 3 seeds) and war_cry.bellow (2 spans, 1 seed) fire
through useAbility on this band. They are combat-context
actions: by the structural rule (tickAction no-ops mid-fight)
they cannot day-cross, and none did — their classification is
consistent with the rule, not an exception to it. The likely
route is in-fight ability casts through useAbility (game.js
~36755 notes rage/trade_of_blows flags are set by
useAbility); the nest logger carries no caller frame on
spanEnter, so the exact in-fight caller is NOT traced — stated
as a limit, not claimed. The difference from census-b is the
band, not the instrument: this band reached wave 4 on 4 seeds
and fought more, so more combat casts fired.

NOT-FIRED-ON-BAND (138 of 142 ability ids; never a bare zero):
fired ids green_thumb, green_whisper, rage, war_cry (4). The
other 138 split by the post-run ownership snapshot
(end-of-run observation only — an ability owned mid-run and
lost before post-run can be missed; that limit is stated, and
it can only move an id from never-owned to owned-but-unfired,
never the reverse):
- Owned-but-unfired (23 ids): iron_stomach, rain_dancer,
  loud_chewer, lucky_rock, bird_whisperer, scream_cheese,
  taste_vision, cold_blooded, echo_location, beard_moss,
  dowsing, phoenix_clause, night_eyes, translator,
  pyrokinesis, bloodhound, beast_calm, the_touch, trophy_room,
  feast_engine, cornucopia, foresight, harvest_table. Several
  are passive modifiers or combat/context abilities, not
  tappable actions — "owned but never tapped through
  useAbility" is not a defect claim for them, and this census
  does not make one.
- Never-owned-on-band (115 ids): no player or villager held
  them at post-run on any of the 8 seeds. A statement about
  this band's grants, not about the abilities: no defect is
  claimed for any of them.

## LEG 2 — playpath-longday tables (tap-window spans only)

"Attempted" = button read ok AND tap issued via
activateAbility (no target). "Succeeded" = useAbility returned
true. "Impl-refused" = button ok, tap issued, impl returned
false. In-window = dayTicksBefore >= 512 - ticks(key), where
ticks(key) = max(1, round(time_min/2)): molt 30 (>=482),
lay_wait / stage_injury / share_pot 15 (>=497), clean_shot /
follow_blood 10 (>=502), track / read_sign / stalk 8 (>=504),
steal / read_beast / mark / menace 5 (>=507), end_it_before /
challenge 3 (>=509).

### Pilot (8 seeds 47001-47008, 600 tap-days, 565 attempted)

| key | attempted | succeeded | button-refused | impl-refused | spans | crossing | int. draws | endDay draws | excl kcal | in-window | max pos | classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tracker.track | 40 | 36 | 0 | 4 | 40 | 1 | 2 | 2 | 1,374 | 1 | 506 | PROMOTED-REAL-PLAY |
| thief.steal_pantry | 40 | 0 | 0 | 40 | 40 | 0 | 0 | 0 | 0 | 0 | 506 | TAPPED-NO-CROSSING |
| game_sense.read_sign | 40 | 36 | 0 | 4 | 40 | 1 | 2 | 2 | 1,374 | 1 | 506 | PROMOTED-REAL-PLAY |
| patient_aim.clean_shot | 40 | 36 | 0 | 4 | 40 | 3 | 8 | 8 | 3,285 | 3 | 506 | PROMOTED-REAL-PLAY |
| stalk.stalk_prey | 40 | 36 | 0 | 4 | 40 | 1 | 2 | 2 | 1,374 | 1 | 506 | PROMOTED-REAL-PLAY |
| blood_trail.follow_blood | 40 | 36 | 0 | 4 | 40 | 3 | 8 | 8 | 3,285 | 3 | 506 | PROMOTED-REAL-PLAY |
| ambush.lay_wait | 40 | 36 | 0 | 4 | 40 | 2 | 4 | 4 | 2,485 | 2 | 506 | PROMOTED-REAL-PLAY |
| animal_ken.read_beast | 40 | 35 | 0 | 5 | 40 | 0 | 0 | 0 | 0 | 0 | 503 | TAPPED-NO-CROSSING |
| scarecrow.stage_injury | 40 | 36 | 0 | 4 | 40 | 2 | 4 | 4 | 2,485 | 2 | 506 | PROMOTED-REAL-PLAY |
| molt.shed_skin | 17 | 14 | 23 | 3 | 17 | 1 | 2 | 2 | 1,111 | 1 | 503 | PROMOTED-REAL-PLAY |
| fear_aura.menace | 40 | 34 | 0 | 6 | 40 | 0 | 0 | 0 | 0 | 0 | 503 | TAPPED-NO-CROSSING |
| intimidating_presence.end_it_before | 39 | 35 | 1 | 4 | 39 | 0 | 0 | 0 | 0 | 0 | 507 | TAPPED-NO-CROSSING |
| war_cry.challenge | 39 | 32 | 1 | 7 | 39 | 0 | 0 | 0 | 0 | 0 | 507 | TAPPED-NO-CROSSING |
| trophy_room.mark | 33 | 29 | 7 | 4 | 33 | 0 | 0 | 0 | 0 | 0 | 506 | TAPPED-NO-CROSSING |
| long_table.share_pot | 37 | 31 | 2 | 6 | 37 | 2 | 4 | 4 | 2,252 | 2 | 504 | PROMOTED-REAL-PLAY |

Pilot totals: 600 tap-days, 565 attempted, 498 succeeded,
34 button-refused, 67 impl-refused, 2 skipped (in-combat),
565 tap-window spans, 16 crossings, 32 internal draws (all
endDay-framed), 18,025 kcal excluded. Tap positions: min 0,
median 417, p90 468, max 507 — vs playpath-b's median 405,
max 478. Evening work added a median of 6 ticks per tap day
(p90 38, max 102, mean 17.4); 6 rounds most evenings.

### Extension (8 seeds 47009-47016, 600 tap-days)

| key | attempted | spans | crossing | int. draws | excl kcal | classification |
| --- | --- | --- | --- | --- | --- | --- |
| ambush.lay_wait | 37 | 37 | 1 | 4 | 1,450 | PROMOTED-REAL-PLAY |
| animal_ken.read_beast | 39 | 39 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| blood_trail.follow_blood | 37 | 37 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| fear_aura.menace | 40 | 40 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| game_sense.read_sign | 37 | 37 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| intimidating_presence.end_it_before | 38 | 38 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| long_table.share_pot | 38 | 38 | 1 | 4 | 1,450 | PROMOTED-REAL-PLAY |
| molt.shed_skin | 20 | 20 | 2 | 8 | 3,100 | PROMOTED-REAL-PLAY |
| patient_aim.clean_shot | 39 | 39 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| scarecrow.stage_injury | 37 | 37 | 1 | 4 | 1,450 | PROMOTED-REAL-PLAY |
| stalk.stalk_prey | 37 | 37 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| thief.steal_pantry | 39 | 39 | 1 | 2 | 562 | PROMOTED-REAL-PLAY |
| tracker.track | 37 | 37 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| trophy_room.mark | 40 | 40 | 1 | 2 | 750 | PROMOTED-REAL-PLAY |
| war_cry.challenge | 38 | 38 | 0 | 0 | 0 | TAPPED-NO-CROSSING |

Extension totals: 6 crossing spans, 24 internal draws (all
endDay-framed), 9,812 kcal excluded. Thief's crossing is the
refused tap (see below); all others succeeded.

### Confirm (12 seeds 47017-47028, 900 tap-days)

| key | attempted | spans | crossing | int. draws | excl kcal | classification |
| --- | --- | --- | --- | --- | --- | --- |
| ambush.lay_wait | 58 | 58 | 1 | 3 | 2,400 | PROMOTED-REAL-PLAY |
| animal_ken.read_beast | 59 | 59 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| blood_trail.follow_blood | 58 | 58 | 1 | 3 | 2,400 | PROMOTED-REAL-PLAY |
| fear_aura.menace | 59 | 59 | 1 | 3 | 3,000 | PROMOTED-REAL-PLAY |
| game_sense.read_sign | 58 | 58 | 1 | 4 | 2,399 | PROMOTED-REAL-PLAY |
| intimidating_presence.end_it_before | 57 | 57 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| long_table.share_pot | 58 | 58 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| molt.shed_skin | 28 | 28 | 1 | 3 | 2,446 | PROMOTED-REAL-PLAY |
| patient_aim.clean_shot | 58 | 58 | 1 | 3 | 2,400 | PROMOTED-REAL-PLAY |
| scarecrow.stage_injury | 58 | 58 | 1 | 2 | 1,200 | PROMOTED-REAL-PLAY |
| stalk.stalk_prey | 58 | 58 | 1 | 4 | 2,399 | PROMOTED-REAL-PLAY |
| thief.steal_pantry | 58 | 58 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| tracker.track | 58 | 58 | 1 | 4 | 2,399 | PROMOTED-REAL-PLAY |
| trophy_room.mark | 50 | 50 | 0 | 0 | 0 | TAPPED-NO-CROSSING |
| war_cry.challenge | 58 | 58 | 0 | 0 | 0 | TAPPED-NO-CROSSING |

Confirm totals: 7 crossing spans, 24 internal draws (all
endDay-framed), 20,993 kcal excluded.

### Promotion judgment (pilot + extension + confirm)

PROMOTED-REAL-PLAY (pilot promotion AND confirm recurrence):
ambush.lay_wait (2+1+1 crossings), blood_trail.follow_blood
(3+0+1), game_sense.read_sign (1+0+1), molt.shed_skin
(1+2+1), patient_aim.clean_shot (3+0+1),
scarecrow.stage_injury (2+1+1), stalk.stalk_prey (1+0+1),
tracker.track (1+0+1). All 8 pilot-promoted keys recurred on
the confirm band.

CANDIDATE, not promoted (per the prereg, never rounded up):
- long_table.share_pot — promoted on pilot (2 crossings)
  AND extension (1), but 0 crossings on the 12-seed confirm.
  The confirm band is the judge; it failed it. Record: 3
  crossings on 2 of 3 bands, 3,702 kcal.
- thief.steal_pantry — extension-only (1 crossing, 562 kcal),
  0 on pilot and confirm. Its crossing was a REFUSED tap
  (see below).
- trophy_room.mark — extension-only (1 crossing, 750 kcal),
  0 on pilot and confirm.
- fear_aura.menace — confirm-only (1 crossing, 3,000 kcal),
  0 on pilot and extension.

NEVER CROSSED on any band (2,100 tap-days): animal_ken.
read_beast, intimidating_presence.end_it_before,
war_cry.challenge. All three had in-window counts of 0 on
every band — their taps never sat within their key's cost of
the boundary (max positions 503, 507, 507 against thresholds
507, 509, 509). The near-misses are positional, not
mechanical: end_it_before and challenge need 509+, and the
latest played tap ever recorded is 508.

### Combined tap-window totals (28 seeds, 2,100 tap-days, 1,951 attempted)

| key | attempted | succeeded | impl-refused | crossing | int. draws | excl kcal | in-window |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ambush.lay_wait | 135 | 126 | 9 | 4 | 11 | 6,335 | 4 |
| blood_trail.follow_blood | 135 | 126 | 9 | 4 | 11 | 5,685 | 4 |
| game_sense.read_sign | 135 | 126 | 9 | 2 | 6 | 3,773 | 2 |
| patient_aim.clean_shot | 137 | 127 | 10 | 4 | 11 | 5,685 | 4 |
| stalk.stalk_prey | 135 | 126 | 9 | 2 | 6 | 3,773 | 2 |
| tracker.track | 135 | 126 | 9 | 2 | 6 | 3,773 | 2 |
| scarecrow.stage_injury | 135 | 126 | 9 | 4 | 10 | 5,135 | 4 |
| molt.shed_skin | 65 | 52 | 13 | 4 | 13 | 6,657 | 4 |
| long_table.share_pot | 133 | 126 | 7 | 3 | 8 | 3,702 | 3 |
| fear_aura.menace | 139 | 130 | 9 | 1 | 3 | 3,000 | 1 |
| thief.steal_pantry | 137 | 1 | 136 | 1 | 2 | 562 | 1 |
| trophy_room.mark | 123 | 113 | 10 | 1 | 2 | 750 | 1 |
| animal_ken.read_beast | 138 | 131 | 7 | 0 | 0 | 0 | 0 |
| intimidating_presence.end_it_before | 134 | 126 | 8 | 0 | 0 | 0 | 0 |
| war_cry.challenge | 135 | 122 | 13 | 0 | 0 | 0 | 0 |

In-window taps equal crossings exactly (29 = 29) on every
key: a tap placed within its cost of the boundary ALWAYS
crossed, and no tap outside the window ever did. Button
refusals combined (147): "Already molted this week." 68,
"Running on empty — eat first." 55, "Trophy Room: no kills
recorded yet" 15, once-a-day flags 9 (challenge 3,
end_it_before 3, share_pot 3). Skipped (in-combat): 2.

## The all-spans census (policy spans included, 420 files, 28 seeds)

The census analyzer over the same three playpath corpora
classifies EVERY span, not just tap windows — policy
cultivate spans from evening garden work included:

| ability.action | classification | spans | day-crossing | records created | int. draws | excl kcal |
| --- | --- | --- | --- | --- | --- | --- |
| ambush.lay_wait | PROVEN-SPAN-DOUBLE-COUNT | 135 | 4 | 4 | 11 | 6,335 |
| blood_trail.follow_blood | PROVEN-SPAN-DOUBLE-COUNT | 135 | 4 | 4 | 11 | 5,685 |
| game_sense.read_sign | PROVEN-SPAN-DOUBLE-COUNT | 135 | 2 | 2 | 6 | 3,773 |
| patient_aim.clean_shot | PROVEN-SPAN-DOUBLE-COUNT | 137 | 4 | 4 | 11 | 5,685 |
| stalk.stalk_prey | PROVEN-SPAN-DOUBLE-COUNT | 135 | 2 | 2 | 6 | 3,773 |
| tracker.track | PROVEN-SPAN-DOUBLE-COUNT | 135 | 2 | 2 | 6 | 3,773 |
| scarecrow.stage_injury | PROVEN-SPAN-DOUBLE-COUNT | 135 | 4 | 4 | 10 | 5,135 |
| molt.shed_skin | PROVEN-SPAN-DOUBLE-COUNT | 65 | 4 | 4 | 13 | 6,657 |
| long_table.share_pot | PROVEN-SPAN-DOUBLE-COUNT | 133 | 3 | 3 | 8 | 3,702 |
| fear_aura.menace | PROVEN-SPAN-DOUBLE-COUNT | 139 | 1 | 1 | 3 | 3,000 |
| thief.steal_pantry | PROVEN-SPAN-DOUBLE-COUNT | 137 | 1 | 1 | 2 | 562 |
| trophy_room.mark | PROVEN-SPAN-DOUBLE-COUNT | 123 | 1 | 1 | 2 | 750 |
| green_thumb.cultivate | NO-DAY-CROSSING | 476 | 0 | 0 | 0 | 0 |
| green_whisper.cultivate | PROVEN-SPAN-DOUBLE-COUNT | 109 | 1 | 1 | 4 | 2,450 |
| animal_ken.read_beast | NO-DAY-CROSSING | 138 | 0 | 0 | 0 | 0 |
| intimidating_presence.end_it_before | NO-DAY-CROSSING | 138 | 0 | 0 | 0 | 0 |
| war_cry.challenge | NO-DAY-CROSSING | 135 | 0 | 0 | 0 | 0 |
| fear_aura.loom | NO-DAY-CROSSING | 34 | 0 | 0 | 0 | 0 |
| war_cry.bellow | NO-DAY-CROSSING | 4 | 0 | 0 | 0 | 0 |

Totals: 51,280 kcal excluded, 0 ambiguous spans, 0
unmatched draw links. The tap-window and all-spans tables
agree exactly on every key (48,830 tap-window + 2,450
cultivate = 51,280). Two further keys appear only in the
all-spans census: fear_aura.loom (34 spans, 4 seeds — a second
fear_aura action firing through useAbility, presumably from
in-fight casts; 0 crossings) and war_cry.bellow (4 spans,
2 seeds; 0 crossings). Neither was a census target; both are
reported, not claimed as findings.

The cultivate case (seed 47008, instance fear_aura.menace,
evt 113-122, day 5→6): an evening-garden
green_whisper.cultivate span held the night — 4 internal
draws, all endDay-framed (villageMeal 2,000 kcal +
villagerMealDay draws 848/300/650), 5 item-matched exclusions
totaling 2,450 kcal (Foraged food 1×200 + Dried beans
6×150/4×150/2×150/3×150). The direct record (seq 10) IS the
night's dinner, misattributed to the garden tap by the
snapshot-diff wrapper — the same mechanism as the 9954
belongseek case, now in policy-played days under a
competent-family policy. It did NOT recur on the extension or
confirm bands (1 crossing in 28 seeds): cultivate under this
policy crosses rarely, because evening garden work usually
finishes before the last hour.

## The refused tap that still double-counted (thief, extension)

Seed 47015, tapDay 6, dayTicks 507, day 8→9: the thief tap
was button-ok, the span opened, the impl refused AFTER
payment — "The pantry is in the hall. Your hands are not.
(Light Fingers)" — but the paid time tick had already fired
endDay inside the span: 2 endDay-framed internal draws, 562
kcal excluded, tapResult false. This is the first live
refused-but-crossed double-count in real play: design-b
predicted the class (post-payment refusals can hold a night)
from boundary fixtures, and here it happened in a played
evening. The dedup rule covers it (it scopes by span, not by
success), so no ledger verdict changes — but any future arm
reasoning "failed taps are free" must know this one was not:
it spent the night's tick and swallowed 562 kcal of dinner.

## Thief, in full (the hall gate, and the one time it opened)

Thief attempted 137 taps across the three bands and succeeded
exactly ONCE: seed 47019, tapDay 7, dayTicks 313 — "The food
disappears. Magic. (It's not magic. Nobody saw. Light
Fingers.)" (−120 kcal). The other 136 attempts were
impl-refused on the hall gate (havenStoresAccess 'none' at
tap time), plus 4 grant-loss refusals. Playpath-b's 37/37
hall-refusal finding stands, with one exception now recorded:
the gate opened once, on a mid-day tap, and the lift worked
exactly as the fiction promises. Whether a played position
ever opens hall stores in the first week is no longer a pure
no — it opened once in 28 instances.

## Grant persistence (playpath-b follow-up #1331, now measured at scale)

The setup grant does NOT survive to late tap days: 141 of
1,951 attempted taps (7.2%) arrived with hasAbilityAtTap =
false, every one refused "You don't have that ability.
(<Name>)", tapResult false. It grows with tapDay (pilot: 2 on
day 3, 14 on day 4, 14 on day 5, 17 on day 6, 20 on day 7)
and hits every key roughly equally (~4 per key per band) —
a systematic loss, not a per-key defect. Root cause is STILL
not established (bearer succession vs an ability-list rewrite
mid-run); this arm traced WHEN it happens, not WHY. No
verdict depends on those taps: every crossing tap had
hasAbilityAtTap true, and every key classifies the same with
or without them. The trace is the follow-up's next step, not
this arm's.

## Sense-testing (read end-to-end, judged on meaning)

Seed 47005, tracker.track, tapDay 5 — the full tap window,
not a summary. The tap lands at dayTicks 506 (evening work
added 62 ticks over 6 rounds), game day 6. The span (evt
49→54) holds the night: draw evt 50-51 is the village meal
(want 1,000, taken 1,374 — Foraged food 4×200, Snared meat
174, Dried meat 400), draw evt 52-53 is a villager meal (want
560, taken 400 — Foraged food 2×200). The direct record
(seq 23, day 7, path tracker.track) is EXACTLY the first
draw's items, 1,374 kcal — the exclusion matches the dinner
item-for-item. The second draw's 400 kcal stays counted under
the meal (its Foraged food carries spoilDay 9, the direct
record's spoilDay 8 — no item match, correctly not excluded).
The say window shows the night passing inside the tap:
villagers hauling water and deadfall, gossip by the fire
("You catch fragments by the fire — Aki telling Hassan about
you"), "Village meal: +1374 kcal... (Half ration — they don't
trust you yet.)", a fireside lesson, "— DAY 7 DAWN —", and
only then the track result ("Cold ground. Nothing fresh has
passed here") and "(−40 kcal — food becomes tracker.)".
Judgment: this is REAL, not an instrument artifact. The tap
did nothing to the pantry itself (tracking moves no food);
the "direct" record IS the dinner, misattributed to the tap
because the snapshot-diff wrapper records the whole span's
pantry decrease as one record. The village ate together
inside the tap, and a naive direct+meal ledger counts that
dinner twice. No villager transcript line names any span (the
cultnest arms already established this surface is silent in
speech); silence is reported, not filled in.

## Wall numbers (LEG 1 judged corpus, 8 seeds — recorded, never estimated)

- National: 0/8. Table: 0/8. Wins: 0/8.
- Wave 4-5 unlocks: 4/8 (wave 4 reached on 47002, 47004,
  47006, 47008; wave 5: 0/8). Wave reach: wave 3 on all 8
  seeds, wave 4 on 4.
- Survival: median 83 days, max 100 days, min 38 days
  (47001, village-lost). 6 of 8 villages lost (days 38-92);
  2 survived to the 100d cap.
- Deaths: 116 villager deaths inside the villages.
  Death-cause shares: "the wild" 33, monster 31, starvation
  10, sickness 10, a wound that wouldn't close 5, the phoenix
  link 4, ambush 3, the arena 3, contest 3, combat 2, plus 12
  single named causes (the static kite, the focus group, a
  stranger, dustboar, the landlord, the bright bastard,
  stripes flowing where no wind bl..., the heckler,
  experiment, big ugly, the eater, the loud beast — 1 each).
  The wild + monster dominate (64/116); the arena share that
  topped census-b's band (16/32) is 3/116 here. Different
  band, different deaths — recorded, not compared as a trend.
- NOT RECORDED (stated, not estimated): Arc II/III/IV reach,
  four-realm formation, trap acquisition by source, counter
  discovery / counter-kill rate, young-link succession
  survival, tier-2 reach as a separate field. The payload
  carries no such fields. No wall numbers exist for the 7-day
  playpath instances and none are estimated.

## Village assessment (plain words)

LEG 1's eight villages are a harder band than census-b's:
six of eight fell before day 100 (the earliest at day 38),
and the two that stood reached wave 4 — further than any
census-b village — without climbing past village rank. They
died out in the wild and to monsters (64 of 116 deaths), not
in the arena and not, mostly, of hunger: the gardens were
worked daily (319 cultivate spans), the pantries held, and
starvation took only 10. The village that this band shows is
one that survives the garden and the pantry but not the wild:
it meets the fourth wave and still falls. What knowledge or
capabilities were missing: the climb itself, again — no
village reached regional standing, let alone national or the
table. That is the scale wall, in its plainest form, on a
band that fought further than the last one.

The playpath villages are seven-day villages, played late:
the scholar works the garden, forages twice, talks, and by
evening has the energy — usually — to reach for one more
thing. Most evenings the tap lands mid-day (median 417); on
the evenings the second forage trip runs long, the tap lands
in the last hour (max 507), and when it does, the night falls
inside it and the village eats dinner inside the tap. That is
the whole finding in plain words: a player who works late
will, some evenings, hold the night inside an ability tap —
and a ledger that adds the tap's pantry change to the meals
counts that dinner twice. The dedup rule already prevents
it; this census proves the rule has real work to do.

Blanks filled: (1) the span-draw census across ability types
in real play — 8 keys promoted, 4 candidates, 3 never
crossed, with per-key denominators on 28 seeds; (2) the
cultivate real-play reproduction under competent-family play
(2,450 kcal, seed 47008); (3) the first live refused-but-
crossed double-count (thief, 562 kcal); (4) the grant-loss
pattern measured at scale (141 taps, 7.2%, growing with
tapDay); (5) the long-day instrument itself, with evening
work that genuinely moves taps later (+12 median, +29 max
vs playpath-b). Documented, not fixed: the grant-loss root
cause (when, not why); the rage/bellow in-fight caller
(untraced); the analyzer CLI circular crash (below).

## Balanced panel (MEASUREMENT.md §15 — explicit statement, not a fake)

This census has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. The only old-vs-new
comparison is instrument-internal (boundary vs control
positions inside the probe; old sum vs deduped sum inside
applySpanDedup on identical payloads), which is the detector,
not a lever outcome — so NO balance-panel compare .md is
produced for this arm, as pre-registered. The pilot-vs-
extension-vs-confirm agreement (same 8 keys, same exclusion
pattern on fresh seeds) is the replication check instead.

## Metric review (MEASUREMENT.md §14)

- "SINGLE-SEED CANDIDATE" label vs multi-band candidates:
  the prereg's promotion rule names the confirm band as the
  judge, and long_table (pilot + extension, no confirm
  recurrence) is therefore a CANDIDATE, not PROMOTED — but
  "single-seed" misdescribes it (3 crossings on 2 bands, 2
  seeds). The evidence uses "CANDIDATE" with the full
  per-band record instead of the prereg's label, and does not
  re-score the verdict: long_table is not promoted under the
  rule as written. Proposed revision for the NEXT census: name
  the class "UNCONFIRMED CANDIDATE" and judge it on the
  totality of bands, with the confirm band weighted, not
  absolute.
- Analyzer CLI circular crash (found, worked around,
  disclosed): `node scripts/census-spandraw-b.js <dir>`
  crashes with "Converting circular structure to JSON" on a
  corpus containing span-internal draws — the trace objects
  carry a `span` back-reference through internalDraws, and
  the CLI stringifies them. No prior corpus had internal
  draws outside the probe corpus (which was only ever read
  through censusPayload in-process, never through the CLI),
  so the crash never fired before. The all-spans tables in
  this evidence were produced through censusDir in-process
  with a `span`-key-dropping replacer; the classification
  logic is untouched and the numbers cross-check exactly
  against the tap-window analyzer (48,830 + 2,450 = 51,280).
  The shared analyzer was NOT edited; a future arm that
  needs the CLI on such a corpus should strip the back-
  reference in the trace serialization.
- In-window == crossing, exactly (29 = 29 on every key):
  the crossing is fully determined by tap position, not by
  the key — which is the timing-not-ability verdict again,
  now in real play. A future metric could drop the per-key
  crossing count and report the in-window rate directly;
  this run keeps both, as pre-registered.
- Tap-day vs game-day: tap days are harness days, and a
  daily that crosses midnight makes two harness tap days
  share one game day (the once-a-day refusals). Same note as
  playpath-b, same handling: the mismatch is honest play,
  not a bug.
- Post-run ownership snapshot: end-of-run only (LEG 1).
  An ability granted and lost mid-run is missed, which can
  only move an id from never-owned to owned-but-unfired. No
  verdict depends on the split beyond the "not a defect"
  framing, so the limit is contained.
- LEG 1's harsher band (6/8 villages lost, median 83d) vs
  census-b (1/8 lost, median 100d) is a band difference, not
  an instrument difference: same substrate, fresh seeds. No
  metric is re-scored on it; the wall numbers are reported
  as the judged corpus's own.

## Proof

- `node scripts/test-spandraw-census-a.js` — 8/8, exit 0,
  verdict PROOF-GREEN (synthetic S1-S4 + controls C1-C4:
  design tracker control crossed with 11 draws and 5,990
  kcal; 9954 replay cultivate PROVEN at 3,820 kcal;
  synthetic same-day cultivate NO-DAY-CROSSING).
- `CENSUS_STRICT=1 node scripts/test-spandraw-census-a.js`
  — 17/17, exit 0, verdict PROOF-GREEN (corpus legs: LEG 1
  8 files all carrying nestEvents/directRecords/
  mealDrawRecords; LEG 2 pilot 120 files, 565 attempted taps
  all span-logged, 15-key table; tap positions min 0 median
  417 max 507; LEG 1 analyzer classifies all 4 fired keys).
- LEG 1 sweep: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=competent SEEDS=47001,...,47008
  DAYS=100 PERSEED_DIR=evidence/2026-11-06/
  sim-spandraw-census-a-corpus node
  scripts/sweep-spandraw-census-b.js` — 8/8 files, exit 0.
  Analysis: evidence/2026-11-06/sim-spandraw-census-a-
  analysis.json.
- LEG 2 pilot: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 node scripts/playpath-spandraw-a.js` —
  120 files, exit 0, corpus evidence/2026-11-06/
  sim-spandraw-census-a-playpath/, analysis
  sim-spandraw-census-a-playpath-analysis.json.
- Extension: same driver, SEEDS=47009-47016,
  OUTDIR=evidence/2026-11-06/sim-spandraw-census-a-
  playpath-ext — 120 files, exit 0, analysis
  sim-spandraw-census-a-playpath-ext-analysis.json.
- Confirm: same driver, SEEDS=47017-47028,
  OUTDIR=evidence/2026-11-06/sim-spandraw-census-a-
  playpath-confirm — 180 files, exit 0, analysis
  sim-spandraw-census-a-playpath-confirm-analysis.json.
- All-spans analysis: evidence/2026-11-06/
  sim-spandraw-census-a-playpath-allspans.json (pilot
  corpus; ext/confirm all-spans rows were computed
  in-process per corpus and summed in the evidence table).
- No jest (proofs are node, not jest). No [needs-eyes]:
  measurement/tooling only, nothing player-visible. Zero
  src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] grant persistence, cause still open: 141/1,951
  attempted taps (7.2%) lost the setup grant by tap time,
  growing with tapDay (pilot 2/14/14/17/20 across tap days
  3-7); every one refused "You don't have that ability."
  A future arm should record the ability list at tap time
  (already in this driver as hasAbilityAtTap) AND trace the
  loss event itself (succession? list rewrite?) before reusing
  long tap runs. (sim-spandraw-census-a)
- [follow-up] analyzer CLI circular crash: census-spandraw-b.js
  main() stringifies trace objects carrying a `span`
  back-reference and crashes on any corpus with span-internal
  draws. Worked around in-process here; the CLI needs the
  back-reference stripped in trace serialization. (sim-spandraw-census-a)
- [follow-up] rage.unleash_rage / war_cry.bellow / fear_aura.loom
  firing through useAbility in sims (36/4/34 spans): the
  in-fight caller is untraced (no caller frame on spanEnter).
  A future arm that wants the caller should add a frame
  capture to the nest spanEnter, not guess from the flag
  comment in game.js. (sim-spandraw-census-a)
- [follow-up] thief hall gate opened once (seed 47019, tapDay
  7, dayTicks 313, clean lift). The gate is near-total
  (136/137 refusals) but not absolute; a reachability arm
  could ask what position opens it. (sim-spandraw-census-a)
- [follow-up] end_it_before / war_cry.challenge never crossed
  (thresholds 509+, latest played tap 508): one tick short of
  the window on the best evening. Whether any played day can
  place a 3-tick tap at 509+ is a longer-days question, not a
  defect claim. (sim-spandraw-census-a)

## Convergence line

span-draw-census-longday — two-leg census on fresh band
47001-47028: LEG 1 competent replication (8 seeds, 357 spans,
cultivate 319 + rage 36 + bellow 2, 0 crossings, 0 exclusions;
wall national 0/8, table 0/8, wins 0/8, wave 4 on 4/8, median
survival 83d); LEG 2 playpath-longday (28 seeds, 420
instances, 2,100 tap-days, 1,951 attempted taps): 8 keys
PROMOTED-REAL-PLAY (ambush, blood_trail, game_sense, molt,
patient_aim, scarecrow, stalk, tracker — pilot promotion +
confirm recurrence), 4 candidates (long_table pilot+ext no
confirm; thief ext-only refused crossing 562 kcal; trophy
ext-only; menace confirm-only), 3 never crossed (animal_ken,
end_it_before, war_cry). Cultivate real-play double-count
reproduced (green_whisper, seed 47008, 1 span, 4 endDay draws,
2,450 kcal). Total item-matched exclusions 51,280 kcal; 29/29
in-window taps crossed. Grant-loss measured at scale
(141 taps, 7.2%, growing with tapDay); thief succeeded once
in 137 attempts (seed 47019). Instrument green (strict proof
17/17); no game change; dedup rule already covers the class.

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-GO — LEG 1 GO, LEG 2 GO (pilot + extension + confirm), LEG 3 GO

The census is complete on its judged corpora and its answer
is the one the probes predicted but could not prove in play:
under a policy that works late, ability taps DO hold the
night in real played days, and the naive direct+meal ledger
double-counts the dinner inside them — for 8 keys proven
across two independent bands, for 4 more as candidates, and
for cultivate itself reproduced outside the 9954 replay. The
class is timing, not ability, and the already-wired
span-keyed dedup covers all of it.
