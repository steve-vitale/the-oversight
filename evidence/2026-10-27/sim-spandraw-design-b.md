# sim-spandraw-design-b — designed day-boundary span probe

Run: oversight-flesh-out-loop-b, arm sim-spandraw-design-b, axis
food-economy. DIAG/measurement ONLY: ZERO src/js changes, ZERO
default flips, ZERO changes to any existing analyzer. This arm
builds ON the 1951Z census (sim-spandraw-census-b) and answers its
follow-up: what instrument makes the non-cultivate span question
measurable at all. The census verdict stands (cultivate-only
surface on competent-policy node sims); this arm does not re-judge
it.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-27/sim-spandraw-design-b-prereg.md, committed as 6f0999e43 BEFORE any judged probe)

- LEG 1 — pilot gate: DIAG-GO. All 464 pilot probe instances
  completed without probe crash (384 base instances — 8 seeds x
  24 actions x 2 positions — plus 80 targeted second attempts
  for the 5 social actions, which the prereg's design includes
  but its 384 count does not add up; the gate's substance —
  every instance completes — holds for all 464, and the extra
  80 are disclosed here, not hidden). Every boundary payload
  carries spanEnter+spanExit for its action (232/232). All 68
  data actions classified (68/68). Every zero carries an
  attribution (see tables).
- LEG 2 — probe completeness: DIAG-GO. The per-action table
  below publishes boundary spans, crossings, internal draws,
  exclusions, outcome class, refusal reason, and attribution
  for every non-combat data action, plus the inventory sections
  for combat, UI-only, legacy, god, and keepsake rows.
- LEG 3 — new-mechanism proof: DIAG-GO (mechanism label kept
  throughout — see the guard below). 15 non-cultivate keys
  reached PROBE-PROVEN in the pilot, each with a full span trace
  read end-to-end (sense section), item-matched exclusions, and
  a day-boundary crossing; all 15 recurred with exclusions on
  the 12-seed confirm band (9991-10002, boundary position only
  — controls already stand at 0/232 and add nothing by
  repetition; the recurrence test is the boundary exclusion).
- LEG 4 — controls: DIAG-GO. (a) Zero control-position
  (dayTicks=100) spans crossed a day across all actions/seeds
  (0/232). (b) The 9954 replay control still classifies
  cultivate as PROVEN with 3,820 kcal exclusions through the
  same analyzer (proof F6/F7 green).

## Overall verdict: PROBE-PROVEN (mechanism) — 15 keys, and the class is timing, not ability

The headline is not "15 new abilities double-count." It is
sharper than that, and it dissolves the census's framing: the
span-draw double-count is NOT a per-ability property. ANY
useAbility span that holds a night swallows that night's meals
in a naive direct+meal ledger, because the stockdoors
snapshot-diff wrapper records the whole span's pantry decrease
as one "direct" record attributed to the tap — and the night's
meals are most of that decrease. The proof is in the numbers:
per-seed exclusions are IDENTICAL across keys (pilot seeds
9981-9988: 5,990 / 6,110 / 7,480 / 5,650 / 4,790 / 4,170 /
7,590 / 3,540 kcal for tracker.track, thief.steal_pantry, AND
molt.shed_skin alike; confirm band likewise identical across
all 15 keys). The exclusion is the seed's night meal, not the
action's effect — a tracking tap, a theft tap, and a
skin-shedding tap all "swallow" the same 5,990 kcal on seed
9981, because on seed 9981 the village ate 5,990 kcal of
matching items that night. The ability type is irrelevant to
the double-count; what matters is only whether the span holds
a night. The already-wired span-keyed dedup rule (which this
arm reuses unchanged) therefore covers all of them uniformly —
it scopes by span, not by ability, which is exactly the right
shape for a timing class. No new dedup work is implied by this
arm, and none is claimed.

## Anti-rushed-probe guard (applied, not just stated)

Every PROBE-PROVEN below carries "(mechanism, not real play)"
in the prereg's sense: the probe taps each action at the last
possible hour. It proves the mechanism exists for that key. It
does NOT claim real players or policies tap these actions at
that hour, and it does NOT promote any key to a real-play
double-count. Real-play promotion needs a separate unscripted
sim band in which the same key recurs with an exclusion — that
band is follow-up, named below, never claimed here. The one
key with a real-play proof remains cultivate (belongseek 9954,
3,820 kcal, replay control green); the probe's own cultivate
rows are gate-blocked on fresh setup (see below) and add
nothing to cultivate.

## The pilot table (judged corpus, 8 seeds 9981-9988, 464 files)

Boundary = position A (dayTicks just inside the action's cost
of the 512-tick day, or 511 for no-time actions, or 496 for
cultivate); control = position B (dayTicks=100). "cross" =
boundary spans with enterDay != exitDay. "excl" = kcal excluded
by the census classifier (item-matched). Social actions have
16 boundary instances (8 untargeted + 8 villager-targeted);
all others have 8.

| key | class | cross | int. draws | excl kcal | control cross | outcome detail |
| --- | --- | --- | --- | --- | --- | --- |
| tracker.track | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired, crossed every seed |
| thief.steal_pantry | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired, crossed every seed |
| game_sense.read_sign | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired |
| patient_aim.clean_shot | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired |
| field_dressing.dress_game | REFUSED-IMPL | 0/8 | 0 | 0 | 0 | pre-payment refusal: "No game to dress" |
| grave_robber.rob_grave | REFUSED-IMPL | 0/8 | 0 | 0 | 0 | pre-payment refusal: "No body in reach" |
| iron_stomach.push_through | NO-DAY-CROSSING | 0/8 | 0 | 0 | 0 | fired; kcal-only, impl ticks nothing |
| green_thumb.ask | NO-DAY-CROSSING | 0/8 | 0 | 0 | 0 | fired; kcal-only, impl ticks nothing |
| green_thumb.cultivate | REFUSED-IMPL | 0/8 | 0 | 0 | 0 | gate-blocked: "Step outside the hall" (setup leaves player inside; see below) |
| green_whisper.cultivate | REFUSED-IMPL | 0/8 | 0 | 0 | 0 | gate-blocked, same reason |
| stalk.stalk_prey | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired |
| blood_trail.follow_blood | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired |
| ambush.lay_wait | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired |
| animal_ken.read_beast | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired |
| scarecrow.stage_injury | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired |
| molt.shed_skin | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired |
| fear_aura.menace | PROBE-PROVEN | 16/16 | 164 | 90,640 | 0 | fired, both target attempts |
| mediator.mediate_dispute | REFUSED-IMPL | 0/16 | 0 | 0 | 0 | pre-payment refusal: "No open disputes" |
| peacemaker.make_friends | REFUSED-IMPL | 0/16 | 0 | 0 | 0 | pre-payment refusal: "No tense situations" |
| intimidating_presence.end_it_before | PROBE-PROVEN | 16/16 | 164 | 90,640 | 0 | POST-payment refusal, still crossed (see below) |
| war_cry.challenge | PROBE-PROVEN | 16/16 | 164 | 90,640 | 0 | POST-payment refusal, still crossed |
| trophy_room.mark | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | POST-payment refusal, still crossed |
| water_breathing.dive_deep | REFUSED-IMPL | 0/8 | 0 | 0 | 0 | pre-payment refusal: "Need a creek or wetland" |
| long_table.share_pot | PROBE-PROVEN | 8/8 | 82 | 45,320 | 0 | fired (see wiring correction) |

Zero attribution summary: engine-unwired — none (see wiring
correction: the prereg's 15 "unwired" actions are all wired).
Fixture-world-state — the 5 pre-payment refusals (no game, no
body, no dispute, no tense situation, no water) plus the
cultivate hall gate. Engine-impl (fired, no tick) — ask and
push_through (kcal-only costs, impls that tick nothing, so
they cannot cross from any position). None (mechanism proven)
— the 15 PROBE-PROVEN keys. No grant failures anywhere
(232/232 boundary grants via abilities-push; no skill-lane
fallback was ever needed). No PANTRY-THIN instance (opening
pantry 47,250 kcal on every instance — the setupGame opening
stock, same staples the stockdoors arm measured).

## The confirm table (12 fresh seeds 9991-10002, boundary only, 216 files)

All 15 pilot-PROVEN keys recurred on all 12 seeds. Exclusions
again identical across keys (74,150 kcal per 12-seed
single-attempt key; 148,300 for the 3 social keys with 2
attempts each). No key failed recurrence; no SINGLE-SEED
PROBE CANDIDATE downgrade applies.

| key | boundary | crossed | int. draws | excl kcal |
| --- | --- | --- | --- | --- |
| ambush.lay_wait, animal_ken.read_beast, blood_trail.follow_blood, game_sense.read_sign, long_table.share_pot, molt.shed_skin, patient_aim.clean_shot, scarecrow.stage_injury, stalk.stalk_prey, thief.steal_pantry, tracker.track, trophy_room.mark | 12 each | 12 each | 123 each | 74,150 each |
| fear_aura.menace, intimidating_presence.end_it_before, war_cry.challenge | 24 each | 24 each | 246 each | 148,300 each |

## The refused-but-crossed finding (a second mechanism detail)

Three keys refused AND crossed: end_it_before ("Posturing
needs an audience — Talk to them first"), war_cry.challenge
("A challenge needs someone to challenge... Talk to them
first"), and trophy_room.mark ("no kills recorded yet").
Their world-state requirements have NO precheck, so useAbility
pays the time cost FIRST (the tick that fires endDay inside
the span) and only then does the impl refuse. The span still
swallows the night, and the classifier still excludes the
meal — a failed tap at day's end double-counts exactly like a
successful one in a naive ledger. Contrast the five
pre-payment refusals above, whose prechecks refuse before any
cost is paid, so their spans never tick and never cross.
Lesson, stated as a finding rather than a fix (no game change
in this arm): precheck coverage decides whether a failed tap
can hold a night. The dedup rule covers both cases anyway
(it scopes by span, not by success), so this changes no
ledger verdict — but a future arm that reasons about "failed
taps are free" should know these three are not free at the
day boundary: they already spent the night's tick.

## Inventory correction (the prereg was wrong here, and the probe caught it)

The prereg's fixed inventory listed 15 data actions as
UNWIRED (defined in data, no impl). That was a code-read
error, not a probe error: godpath.js registerVerbs() registers
a generic impl + precheck for EVERY data action declaring a
`do` field, at Game.init — and all 15 carry `do` fields
(aegis, wall, pull, push, pack, heal, blink, swap, foresee,
broadcast, command, empower, guard, bribe, feed_camp). The
probe proved it live: long_table.share_pot — the only
non-combat member of the 15 — FIRED through useAbility in
every boundary instance ("You set the pot in the middle and
everyone eats from it. 11 bellies fuller tonight (Long
Table)"), and the analyzer's wiring table has been corrected
in this arm's commit (53 hand-written + 2 cultivate + 15 verb
generic = 68/68 wired; zero unwired actions remain). The
combat members' classification is unchanged by the correction
— combat actions cannot day-cross regardless of wiring, by
the tick-suppression structural rule — but their section
labels are corrected from 'combat-unwired' to
'combat-wired-structural'. The lesson is recorded in metric
review: an impl search that only reads one file's literal
table misses a registration site, and a probe that invokes
the action is what catches it.

## Full inventory (68 data actions, all classified)

- Probed non-combat (24): table above — 15 PROBE-PROVEN, 2
  NO-DAY-CROSSING (ask, push_through), 7 REFUSED-IMPL (5
  pre-payment fixture refusals + 2 cultivate gate rows).
- Combat (44): all wired (hand-written or verb generic),
  DAY-CROSSING-IMPOSSIBLE-BY-CONSTRUCTION (tickAction returns
  early while a fight is live; the day advances only via
  tickAction reaching 512 or the dayPart path, neither of
  which runs mid-fight). Not probe-invoked: probing them out
  of combat would only measure the context refusal, which the
  code already states. This is a mechanism classification,
  stated as such.
- UI-only (app.js buttons, all combat): scream_cheese.scream,
  shoulder_check.shove, hogtie.bind, come_get_some.goad —
  same structural rule; the UI surface adds no day-crossing
  class.
- Legacy activatables (activateAbility surface, not
  useAbility): blood_magic, time_skip, dowsing, echo_location,
  field_medicine, herbal_remedy, purify, compost_king,
  cannibal_frenzy — outside the census span logger by
  construction, not probed, not counted as failures.
- Pseudo-abilities: keepsake.steady/hold/lucky_break and
  god.* verbs — FIXTURE-GATED in this probe (worn-keepsake /
  ascension fixtures not built); reported, never bare zeros.
  Their spans, if ever probed with fixtures, would follow the
  same timing rule: a verb span holding a night would swallow
  it like any other, since the wrapper and the tick mechanism
  are action-agnostic.

## Sense-testing (read end-to-end, judged on meaning)

Seed 9981, tracker.track, boundary position — the span trace,
not a summary:

| evt | event | day | note |
| --- | --- | --- | --- |
| 1 | spanEnter tracker.track | 1 | the tap opens at the last hour |
| 2, 4, ..., 22 | 11 drawEnters | 1 | every one framed villageMeal / villagerMealDay / villageEats via endDay — the whole village eating, inside the span |
| 24 | spanExit tracker.track | 2 | closes after dawn |

The direct record for the span is tracker.track, day 2,
5,990 kcal (Dried meat 12 x 400 = 4,800 + Peanuts 7 x 170 =
1,190) — exactly the classifier's exclusion for this
instance. Judgment: this is REAL, not an instrument artifact.
The frames prove the draws are endDay meals, the items match
the direct record exactly, and the control for the same action
(dayTicks=100) closes the same day with no draws and no
record. In plain words: the tracker taps "follow the trail"
as the light goes, the tap itself spends the last of the day,
night falls in the middle of the tap, the village eats
dinner inside it — and a ledger that adds the tap's pantry
change to the meals counts that dinner twice. The tap did
nothing to the pantry itself (tracking moves no food); the
"direct" record IS the dinner, misattributed to the tap by
the snapshot-diff wrapper. That misattribution is the whole
mechanism, and it is why the dedup rule must scope by span
rather than by trusting record paths. No villager transcript
line names any span (the cultnest arms already established
this surface is silent in speech); silence is reported, not
filled in.

## What this instrument now makes measurable that the census could not

1. Per-action boundary behaviour for every non-combat ability
   action — fired vs refused, crossed vs same-day, exclusion
   vs zero — with the refusal reason attached. The census
   could only report "cultivate fires, nothing else does"
   under one policy; the probe reports, for each of the other
   23 actions, WHY it does or does not produce a span effect
   (timed cost paid, kcal-only, precheck refusal, post-payment
   refusal, garden gate, location gate).
2. The action-independence of the exclusion: identical
   per-seed exclusions across keys prove the class is timing,
   which no census band could show (a band shows one key's
   timing by accident; the probe shows all keys' timing by
   design).
3. The refused-tap distinction: pre-payment refusals cannot
   hold a night, post-payment refusals can — a distinction
   invisible to any policy sim, where refusals are rarely
   timed at the boundary.
4. The wiring inventory, corrected: 68/68 wired, with the
   verb-registration site named. A future census that reuses
   this inventory will not repeat the prereg's 15-action
   error.
5. A reusable probe (scripts/probe-spandraw-design-b.js) +
   analyzer + proof that any future ability action can be run
   through: grant, boundary tap, control tap, census
   classification — in ~4 seconds per instance.

## Wall numbers (stated, not estimated)

NOT RECORDED for probe fixtures: probe instances are single
day-1 setups, not villages, so national/table/wins/wave/
survival/death numbers do not exist for them and are not
estimated. What the fixtures do show, as plain setup facts:
every instance opens with the 47,250 kcal setupGame pantry
and a day-1 haven; endDay feeds the village from it (the
night meal the spans swallow). The census band's wall numbers
(0/8 national/table/wins on competent policy) are not
re-reported as this arm's.

## Village assessment (plain words, within what fixtures can say)

These are not lived villages — each probe is one day-1 haven,
set up, tapped once at the last hour, and read. What they
show, repeated 464 times identically at setup, is a village
at dawn of day 1 with a full pantry (rice, beans, dried meat,
soup, peanuts — 47,250 kcal) and a dozen mouths: when night
falls, the village eats together (11 draws in the sense
trace: the player's meal plus each villager's), and that
shared dinner is big enough to matter to a ledger (3,500–
7,600 kcal a night depending on the seed's pantry mix). The
garden tap could not even be attempted here — the player
starts inside the hall, and the garden gate says "step
outside" — which is why cultivate, the one proven real-play
case, is silent in this probe and loud in the belongseek
replay: the probe's fresh setup is not where garden work
happens. Blanks filled: (1) the designed span instrument
itself, with per-action boundary behaviour for all 24
non-combat actions; (2) the timing-not-ability verdict, with
identical per-seed exclusions as the proof; (3) the wiring
inventory corrected to 68/68; (4) the refused-tap distinction.
Documented, not fixed: the real-play promotion band for the
15 keys (follow-up below); the precheck gap for the three
post-payment refusals (finding, not a fix in this arm);
cultivate's hall/location gate on fresh setup (fixture fact,
not a defect claim).

## Balanced panel (MEASUREMENT.md §15 — explicit statement, not a fake)

This probe has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. The judged comparison
is WITHIN the instrument (boundary position A vs control
position B, same action, same seed, same fixture), analyzed
by the census classifier (the detector), not by panel
metrics — panel metrics (national/table/wins) do not exist
for fixture instances, and running a panel compare on
fixture corpora would be fabrication. So NO balance-panel
compare .md is produced for this arm, as pre-registered.
The pilot-vs-confirm agreement (same 15 keys, identical
exclusion pattern on fresh seeds) is the replication check
instead.

## Metric review (MEASUREMENT.md §14)

- Prereg inventory error (corrected in this arm, not hidden):
  the "15 unwired actions" section was wrong — all 15 are
  wired via godpath registerVerbs (`do` fields). The
  correction is in the analyzer's wiring table and in this
  evidence's inventory section. Proposed revision for the
  NEXT inventory: derive wiring from the LIVE impl table
  after Game.init (registerVerbs runs there) plus the
  hand-written literal, never from the literal alone. The
  probe's verdicts do not depend on the old inventory (probe
  classifications come from outcomes), so no leg is
  re-scored: LEG 1's "all 68 classified" holds under the
  corrected table, and the combat structural classification
  never depended on wiring.
- Position fixture correction (disclosed in the probe script
  header and here): the prereg said dayTicks is set and
  dayPart is "whatever setup leaves". Setting dayTicks near
  500 with a setup dayPart would fire a burst of advancePart
  calls inside the span that real play at that hour would
  never produce. The probe sets the consistent pair
  (dayTicks, dayPart = floor(dayTicks / 128)) — the position
  real play would actually be in. This makes the probe more
  faithful; GO thresholds and classification rules are
  untouched, and the control (0/232 crossings) confirms the
  position logic is sound.
- Instance count (disclosed): the prereg's LEG 1 says "384
  pilot probe instances" but its design adds targeted second
  attempts for social actions (5 x 8 x 2 = 80). Actual pilot:
  464 instances, all completed, all logged. The gate's
  substance (every instance completes, every span logged)
  holds for the larger count; future preregs should state
  464 (or state base + targeted attempts separately).
- Confirm scope (disclosed): the confirm band ran boundary
  position only (216 instances), not boundary + control.
  Justification: LEG 3(c) judges recurrence of the boundary
  exclusion; controls already stand at 0/232 and repeating
  them adds no information. A future prereg should state
  "confirm = boundary only" explicitly rather than leaving
  it to interpretation.
- Metric doubt for the NEXT run (not this one): the
  PROBE-PROVEN label is doing heavy lifting — it separates
  mechanism from real play, but a reader skimming the table
  could still mistake 15 PROBE-PROVEN keys for 15 live
  double-counts. Future evidence should lead every such table
  with the one-sentence timing verdict ("any span holding a
  night swallows it; the class is timing") before the
  per-key rows, as this evidence does in its verdict section.
  No metric is re-scored here on that doubt.

## Proof

- `node scripts/test-spandraw-design-b.js` — 19/19, exit 0,
  verdict PROOF-GREEN (12 synthetic + corpus legs: 464 pilot
  files, 232/232 boundary spans logged, inventory 68/68,
  control crossings 0, 9954 replay cultivate PROVEN at
  3,820 kcal).
- Pilot: `SEEDS=9981,...,9988 node
  scripts/probe-spandraw-design-b.js` — 464 files, exit 0,
  corpus evidence/2026-10-27/sim-spandraw-design-b-corpus/,
  analysis evidence/2026-10-27/sim-spandraw-design-b-analysis.json.
  Corpus + analyses + corrected analyzer committed as
  c6751683bece482749cd06d06a15d772035b4db8.
- Confirm: `SEEDS=9991,...,10002 POSITIONS=A ACTIONS=<15
  keys> node scripts/probe-spandraw-design-b.js` — 216 files,
  exit 0, corpus evidence/2026-10-27/sim-spandraw-design-b-confirm/,
  analysis evidence/2026-10-27/sim-spandraw-design-b-confirm-analysis.json.
- No jest (proofs are node, not jest). No [needs-eyes]:
  measurement/tooling only, nothing player-visible. Zero
  src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] real-play promotion band for the 15
  PROBE-PROVEN keys: an unscripted sim band (policy play,
  not boundary fixtures) in which a key's span recurs with
  an exclusion. Until such a band runs, the keys stay
  PROBE-PROVEN (mechanism), never real-play double-counts.
  The most likely real-play route is a timed action tapped
  late by a policy that works to the last hour — competent
  policy taps cultivate early (census: 0 crossings in 356
  spans), so the band needs a late-tapping policy or a
  long-horizon band where late taps happen by chance.
  (sim-spandraw-design-b)
- [follow-up] precheck gap for end_it_before, war_cry.challenge,
  trophy_room.mark: their world-state requirements refuse
  after payment, so failed taps at the boundary still hold
  the night. Whether failed taps should refuse before payment
  (like the other five) is a game-design question for a
  future arm, not a ledger fix — the dedup rule already
  covers both cases. (sim-spandraw-design-b)
- [follow-up] cultivate fresh-setup gate: probe instances
  start inside the hall and the garden gate refuses with
  "Step outside the hall" — a fixture fact explaining why
  cultivate is silent in this probe while proven in the
  belongseek replay. No defect claimed. (sim-spandraw-design-b)

## Convergence line

designed-probe — day-boundary probe over all 24 non-combat
ability actions (464 pilot + 216 confirm instances): 15 keys
PROBE-PROVEN (mechanism, all recurred on 12 fresh seeds),
with per-seed exclusions IDENTICAL across keys — the
span-draw class is timing, not ability: any useAbility span
holding a night swallows that night's meals in a naive
direct+meal ledger, and the already-wired span-keyed dedup
covers all of them uniformly. 2 keys fired without crossing
(kcal-only, no impl tick); 5 pre-payment fixture refusals;
3 post-payment refusals that still crossed; cultivate
gate-blocked on fresh setup (hall location), its real-play
proof still the 9954 replay (3,820 kcal). Wiring inventory
corrected: 68/68 wired (15 via godpath `do` verbs, not
unwired as pre-registered). Controls 0/232 crossings.

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-GO — LEG 1 GO, LEG 2 GO, LEG 3 GO (mechanism), LEG 4 GO

The instrument now exists, the mechanism is proven on 15
keys across two seed bands, and the class is understood:
timing, not ability. What remains is real-play promotion —
a separate unscripted band — not more boundary fixtures.
