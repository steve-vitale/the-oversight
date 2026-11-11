# Godpath / godhood — first numbers: pilot results (arm sim-godpathfirst-a)

Run fleshout-20261111T1115Z, Loop A. Coverage Program Tier 3 (Steve
order 2026-11-10 11:11 CST "Measure all"). Adopted by a fresh worker
from the dead 1315Z run; this file judges the pilot the dead worker
left behind. Prereg: `evidence/2026-11-11/sim-godpathfirst-a-prereg.md`
(binding; not rewritten). Base (anchor) `0be63dbce`. Proof
`scripts/test-godpathfirst-a.js` **65/65 green** (was 61/61 at commit
`2d01a784f`; +4 Amendment 1 checks, see below).

## Verdict: NO-GO (narrow, mechanistically explained)

8 of 9 GO rows pass. The one miss is the recognitions row: reconcile
residue 1, not 0. The single unmatched event is a fully-classified
tele event — devon_okafor recognised hunter/stalker on day 117,
seed 190366 — whose holder was killed by a monster on day 118 before
the next daily snapshot could record his class. The snapshot is
daily; a recognition on a holder's last living day leaves no snapshot
trace. The event itself has holder + path + subclass + day; the miss
is in the reconcile bar, not the capture. Per MEASUREMENT.md §14 the
miss is NO-GO, never re-scored mid-run. The metric revision (reconcile
tolerance for holders dead within 1 day of the tele event) is proposed
for the NEXT run, in Metric review below. No confirm band is spent;
there is no lever here to land. This is a measurement arm: the
first-numbers capture itself is the deliverable, and it is complete
except for that one reconcile row.

## Amendment 1 (pre-evidence, dead worker's fixes, adopted + verified)

The pilot's first analyzer pass showed 14 recognition residue and 4
ascension residue that were all one cause: **the scholar is an
office, not a person.** `snap.bearer` is the living villager holding
the scholar mantle and changes on every death; the first-pass
reconcilers keyed appearances by the string `'player'`, so a mantle
copy of the same person's class/godhood/gift counted twice (once as
a villager, once as the scholar). Amendment 1 re-keys every
reconciler by PERSON (`personOf`: an event's `'player'` maps to the
bearer of that day; snapshot rows use their own `snap.bearer`), so a
mantle copy is one appearance. It also normalises ability ids (the
scholar's abilities arrive as full objects, villagers' as id
strings), reads `decision.pick` on villager picks, and treats an
empty `{}` class record (a bearer with no class) as no class.
Attribution changes, the metric does not: every recognition /
ascension must still be attributed exactly once. The instrument got
the matching `idList`/`classOrNull` normalisation. Proof grew 61/61
→ 65/65 with 4 new checks (villager `decision.pick` shape, object-form
scholar abilities, mantle-copy recognition = one appearance,
mantle-copy ascension = one ascension). All adopted, all green.

## Header (pre-registered)

- **Primary metric:** complete first-numbers capture of the godpath /
  godhood ladder in a lived village — every level-up sheet classified
  by holder + track + offers + lean; every class recognition by
  holder + path + subclass; every deed observation/completion by god
  + holder; every ascension attempt by holder + god + outcome; every
  capstone gift by holder + god + item; every god-verb cast by ability
  + verb + holder; metrics 1–10 counted or explicitly marked
  unmeasurable.
- **GO threshold:** the 9-row GO table in the prereg (sheets /
  recognitions / ascensions / verbs 0 unclassified; every wrap live
  or marked dead; neutrality 8/8 exact; 0 instrument errors;
  complete capture with per-seed tables + quoted sense scenes;
  engagement floor ≥1 godpath-opportunity event band-wide).
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail max).
  Why 150d: the road is mid-to-late-game by construction (minDay 80
  ascension floor, deedClassDays 10, ~8 level-ups spread across the
  run); sibling first-numbers pilots ran 150d with median survival
  122.5–147d; the capable-bot godpath measurement used the same 150d.
  The horizon measures class formation + deed progress + ascension,
  not post-ascension play (a god ascended on day 140 has ~10 days to
  use the verb — a 0 capstone-verb count after a late ascension is
  read as horizon-limited, not as a broken verb).
- **Seeds:** 190361–190368 (8 seeds, prereg freshness search recorded
  in the prereg; band NOT re-picked on adoption).
- **Policies (two legs, identical seeds):** control — competent
  verbatim, default env, instrument ON (the judged leg); neutral —
  control policy, instrument OFF (end-of-run wall numbers + days +
  end pantry kcal + deaths only). No src/js change.
- **Balanced panel (§15):** none — measurement arm with no lever
  change and no before/after arms, so there is no panel comparison
  to fabricate (same position as sim-abilityfirst-a,
  sim-relayfirst-a, sim-trustfirst-a). The control/neutral legs are
  the neutrality proof, not a panel.

## GO table — judged row by row

| GO check | Bar | Result | Verdict |
|---|---|---|---|
| Every level-up sheet classified, none 'unclassified' | 0 unclassified sheets | 251 sheets, 0 unclassified; 753 offers, 0 no-path offers; 0 empty shelves | GO |
| Every class recognition classified, none 'unclassified' | 0 unclassified recognitions (tele + snapshot reconcile) | 23 tele events, 22 snapshot appearances, **residue 1** (devon_okafor, s190366, d117 — recognised on his last living day, dead d118) | **NO-GO** |
| Every ascension attempt classified, none 'unclassified' | 0 unclassified ascension events | 5 fresh, 5 ceremonies, 5 active, 5 gifts; residue 0 on all 8 seeds | GO |
| Every god-verb cast classified, none 'unclassified' | 0 unclassified verb uses (tele godpath_verb + useAbility reconcile) | 461 uses, 47 tele verbs, 0 tele-unclassified, 0 use residue | GO * |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or fixture-proven and marked dead | 14 wraps live band-wide; capstone verbs + villagerCast dead-under-competent (fixture-proven) — see caveat below | GO |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds | **8/8 exact** (days, pantry kcal, death count identical on every seed) | GO |
| Instrument errors | 0 on all seeds, all legs | 0 | GO |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted | tables below; scenes quoted below | GO |
| Engagement floor | ≥1 godpath-opportunity event band-wide, else uninterpretable | **3,376** opportunity events | GO |

\* GO-row-4 caveat (does not change the row's stated bar, but the
number must not be misread): the instrument's capstone-verb count is
0, and that zero is **wrong as evidence of no use**. The S.Godhood
namespace verb wraps are dead by construction — the capstone verbs
actually fire through the `godverbs.js` daily god hook, which teles
`god_verb` (not `godpath_verb`, which the instrument listens for)
and records use in the snapshot `_godDay` map. Two real uses are
proven in the snapshots: fatima_hassan used Feed the Multitude on
day 80, seed 190368 (her ascension day), and ingrid_vik used it on
day 151, seed 190366 (tail day, past the 150d horizon). The
`god_verb` tele events were never recorded (not in the instrument's
tele filter) and the "Feed the Multitude" say line falls outside the
driver's say regex. Metric 7's capstone-verb sub-count is therefore
an instrument undercount, not a game zero. Fix for the next run:
listen to `god_verb` + read `_godDay` from snapshots (see Metric
review). The row passes on its written bar (tele `godpath_verb` +
`useAbility` reconcile at 0); the capstone-verb capture is the gap.

## Wall numbers (the scale wall, every run)

- **National 0 / 8, table 0 / 8, wins 0 / 8.** No village reached
  national, the table, or a win.
- **Wave 4 unlocks: 8/8 seeds. Wave 5 unlocks: 3/8** (190365, 190366,
  190367).
- **Median survival 115d** (sorted days 58, 83, 89, 112, 115, 130,
  150, 150; 2/8 survived to day 150).
- **Deaths 659 over 887 village-days.**
- **Standing:** max 475 (s190366); scale rank regional on 7/8 seeds,
  village on 1/8 (s190362, died day 58).
- The wall stands: villages reach regional and wave 4–5, but none
  converts that into national/table. Godhood does not move the wall
  on this band — 5 ascensions happened and still national 0, table 0.

## Per-seed table (wall + ladder spine)

| seed | days | end | wave | rank | standing | pantry kcal | deaths | sheets | recogs | ascensions | verb uses |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 190361 | 150 | survived | 4 | regional | 199 | 0 | 112 | 43 | 3 | 0 | 97 |
| 190362 | 58 | village-lost | 4 | village | 100 | 0 | 48 | 13 | 0 | 0 | 0 |
| 190363 | 83 | village-lost | 4 | regional | 199 | 2,292 | 69 | 22 | 2 | 1 living_garden | 73 |
| 190364 | 130 | village-lost | 4 | regional | 199 | 1,045 | 106 | 35 | 4 | 1 apex_predator | 72 |
| 190365 | 112 | village-lost | 5 | regional | 345 | 0 | 63 | 27 | 3 | 1 living_garden | 119 |
| 190366 | 150 | survived | 5 | regional | 475 | 8,783 | 118 | 50 | 5 tele / 4 snap | 1 living_garden | 50 |
| 190367 | 115 | village-lost | 5 | regional | 250 | 3,700 | 70 | 38 | 4 | 0 | 7 |
| 190368 | 89 | village-lost | 4 | regional | 199 | 0 | 73 | 23 | 2 | 1 living_garden | 43 |
| **band** | **887** | **2 survived** | **4: 8/8, 5: 3/8** | **regional 7/8** | **max 475** | — | **659** | **251** | **23 tele / 22 snap** | **5** | **461** |

## Metric 1 — Level-up sheets (251 sheets, 0 unclassified)

Sheets by track (band): field 122, craft 53, combat 49, social 19,
strange 8. The strange track is nearly starved (8/251). Leaned
sheets 33, job-leaned 28; offers on the recognised path 0 band-wide
— no holder was ever recognised *before* their sheets leaned to the
path, i.e. leaning only ever runs on the job path pre-recognition.
Empty shelves 0. Player picks 144, villager picks 152, villager
keeps 0 (no villager ever kept their kit over a pick on this band).

Player picks by path: hunter 42, brawler 30, forager 25, survivalist
14, drifter 12, explorer 8, socialite 5, caregiver 3, miser 3,
shieldbearer 2. Villager picks by path: forager 51, hunter 34,
explorer 26, socialite 21, brawler 15, caregiver 2, survivalist 2,
drifter 1. Villagers learn all three offers (learns 8,921 band-wide:
1,095 / 528 / 702 / 1,166 / 753 / 2,331 / 766 / 580 per seed).

**The slots-full stall (the band's biggest game finding).** Player
pick residue is 54 band-wide, and every one of the 54 is the same
signature: one ability, one bearer, consecutive days, `chooseAbility`
returning null — a level-up sheet pending against full (6/6) slots,
with competent calling `chooseAbility(first offer)` daily and never
supplying the `replaceId` the engine requires for a full-slots
level-up pick. Verified per seed: s190361 loud_chewer d135–140 (6),
s190363 cornucopia d76–77 (2), s190365 pocket_sand d39–44 (6),
s190366 lucky_rock d126–146 (21), s190367 pyrokinesis d112 (1),
s190368 adrenaline_surge d44–61 (18). The engine's line is honest —
"Your slots are full (6/6). Choose which ability Adrenaline Surge
replaces — or keep what you have." — but the policy never answers
it, so the sheet sits pending for up to 18 days and the scholar's
godpath climb stalls: no new path ability can land without a
replacement decision. 27 "slots are full" say lines band-wide, all
verbatim repeats. Villager pick residue is 3, all death-before-next-
snapshot (gen_35t7j1x d46→d47, devon_okafor d117→d118; s190363's
single villager residue unexamined, same signature class).

## Metric 2 — Class recognition (22 snapshot / 23 tele)

First recognition days: 23, —, 27, 38, 41, 30, 50, 29 (s190362
never recognised anyone in 58 days). Recognitions by path: forager
14, hunter 7, survivalist 1. No caregiver, drifter, explorer, miser,
shieldbearer, socialite, brawler, or Farstrider recognition anywhere
(0 Farstrider — the retired path is never newly recognised, as
required). Every recognition is a villager; the scholar's class
arrives only via the bearer (e.g. s190364 hunter/stalker since day
91, bearer mashael_fernandes; s190365 forager/gardener; s190366
survivalist/furnace; s190368 forager/gardener at run end).

One class *change* is recorded: gen_1r4je3x, s190367, recognised
hunter/beastmaster day 50, then hunter/stalker day 88 — the same
person re-recognised under the other subclass. The analyzer counts
re-appearances after a change; class-change tracking deserves its own
metric next run (see Findings).

The one residue: devon_okafor, hunter/stalker, day 117, s190366.
Tele event seq 3016, fully classified. Day-117 snapshot still shows
his class `{}` (snapshot is dawn; the recognition fired mid-day),
and he died to a monster day 118, so no later snapshot ever shows
the class. See Verdict + Metric review.

## Metric 3 — Path progress (the ladder per god)

Band-wide max kit per god (max path-ability count any holder ever
reached): living_garden 5, apex_predator 6, unkillable 4,
one_person_army 3, all_seeing 2, voice_of_the_relay 2,
shepherd_of_the_dead 1, the_between 1, market_god 1,
undying_ward 1. Holders at closeAt (3+ path abilities): only
living_garden and apex_predator ever get holders close, and only
those two ever complete a ladder (living_garden complete on 4
seeds, apex_predator on 1). Miser, shieldbearer, caregiver, drifter
never get past kit 1 on the whole band — their paths are decoration
under competent play, not roads. Synergies are discovered constantly
(the deed/synergy say lines fire from day 5), but the synergy leg
that matters for ascension — a *path* synergy feeding the deed —
is what carries the forager ascensions (see Metric 4).

## Metric 4 — Deeds (129 tele, 0 residue)

Deed observations by event (band): outmatched_escape 58,
field_truth_shared 35, care_survived 24, apex_hunt 12. Tele and
deed-book counts reconcile exactly on all 8 seeds (residue 0).
**Four of the eight authored deeds never fire once in 887
village-days:** market_exchange 0, ward_rescue 0, relay_office 0,
death_refused 0. The two null-deed gods (brawler, forager) are
tracked separately and never complete-by-deed, as designed — but
note the irony: 4 of the 5 ascensions are living_garden (forager),
a null-deed god, so ascension on this band runs entirely on the
discovered-synergy / class-days leg, never on an authored deed.
The deed gate that the capable-bot history says is the binding one
(requireDeed false = 1/1 ascensions; both gates off = 3/8) is, under
competent, simply never engaged for half the pantheon.

## Metric 5 — Ascension (5 ascensions, 5 ceremonies, 5 gifts)

| seed | day | holder | god | route |
|---|---|---|---|---|
| 190363 | 80 | boris_kowalski (villager) | living_garden | class-days / synergy (null deed) |
| 190364 | 123 | mashael_fernandes, as scholar-bearer | apex_predator | deed apex_hunt + class held |
| 190365 | 80 | gen_z39z60s (villager) | living_garden | class-days / synergy |
| 190366 | 120 | ingrid_vik (villager) | living_garden | class-days / synergy |
| 190368 | 80 | fatima_hassan (villager) | living_garden | class-days / synergy |

Ascension attempts (checkGodhood / checkVillagerGodhood +
ascension-attempt wraps): 505 / 151 / 292 / 432 / 372 / 580 / 350 /
245 per seed — the dawn check runs every day for every candidate
and almost always finds the ladder incomplete. Every ascension has
its 5-beat ceremony and its capstone gift (gift residue 0, ceremony
residue 0). Three of the five ascensions land exactly on day 80 —
the minDay floor, not a coincidence: the ladder was complete earlier
and the day gate was the last one holding. Which gate held when
ascension never fired despite a complete ladder: on s190361 two
holders sat at kit 4 (living_garden, apex_predator) with no complete
ladder — the deed/class-days leg never closed; on s190367 apex
reached kit 6 with 2 holders close but 0 complete — again the deed
leg.

**The one-day god.** The s190364 scholar ascension (mashael_fernandes
as bearer, apex_predator, day 123) lasted one snapshot: day-123
snapshot shows recognised + active + capstoneGifted; day 124 shows
class `{}` and godhood `{}` — the bearer died and the successor
starts classless and godless. Ascension does not survive the mantle.
Death/respawn resets it, as the canon says — but in lived play that
means the game's rarest event can vanish overnight without ever
being used (capstone verb use by that holder: none recorded).

## Metric 6 — Capstone gifts (5 gifts, residue 0)

Every ascension's gift lands the same day: Seed Vault
(living_garden) ×4, and the apex_predator capstone item ×1 (the
instrument records the gifted god, not the item id — the Seed Vault
name comes from the capstone say line; the apex item's name is not
in the captured corpus). Gift
events reconcile against the snapshot `capstoneGifted` store with
residue 0 on all seeds. No gift without a ceremony, no ceremony
without a gift. Capstone items present at run end: ingrid_vik
(living_garden, s190366), fatima_hassan (living_garden, s190368,
with `_godDay.feed_multitude: 80`), and the s190368 scholar-bearer
(living_garden — the same fatima, holding the office).

## Metric 7 — God verbs (461 uses, 47 tele verbs, 0 residue)

Verb uses by ability (band): rage 162, green_thumb 120, war_cry 98,
green_whisper 73, pocket_sand 8. Only five path abilities are ever
cast under competent — the whole god-verb life of the band is rage /
war_cry (brawler/combat) and green_thumb / green_whisper
(forager/field) plus pocket_sand. Tele `godpath_verb` events: 47,
all classified, 0 unclassified. Villager casts via the `villagerCast`
wrap: 0 — the wrap is dead by construction (the engine calls the
closure); tele is the recorder, and it records 47. Lifeline/ember
tele events: 0. Verbs refused: the only refusals visible are the
slots-full `chooseAbility` nulls (Metric 1), not verb refusals.
**Capstone verbs: 0 recorded, 2 proven used** — see the GO-row-4
caveat and Metric review. The capstone verbs live in `godverbs.js`'s
daily hook, not behind the wrapped namespace functions.

## Metric 8 — Godhood in the fiction

- Capstone as felt: the Seed Vault capstone text fires on all three
  quoted ascensions (s190363, s190365, s190368, all day 80) —
  identical authored text each time, as designed for a capstone
  item; the "Godhood demands its price" line (200 kcal/day, "Your
  garden needs guards, and everyone knows it") is coherent with the
  forager fiction. The apex_predator capstone text is not in the
  quoted corpus (s190364's say cap was hit before day 123 — see the
  say-cap caveat in Metric 9).
- Mythic form: present at run end for ingrid_vik (living_garden,
  s190366), fatima_hassan (living_garden, s190368), and the s190368
  scholar-bearer (living_garden). No other mythic ids.
- godhoodBargaining (table leverage): snapshot field read where
  present; no bargaining value surfaced on this band (table never
  reached — Metric 10).
- Farstrider: 0 recognitions, as required.

## Metric 9 — Say-line coherence (1,446 godpath say lines)

The driver captures godpath-regex say lines, 200/seed cap. Four
seeds hit the cap (190361, 190364, 190365, 190366 at 200), so the
corpus is early-game-weighted and late ascension/ceremony lines can
be missed (the s190364 apex capstone text is absent for this reason,
not because it didn't fire). Classification of the lines read: no
line was found whose claim contradicts the live state it describes.
Recognition lines name the right person/path/subclass against the
tele record in every case checked ("The System names Kai: Gardener
of the Living Garden" = gen_xymd108, forager/gardener, day 23,
s190361; "The System names Boris: Gardener of the Living Garden",
day 27, s190363; "The System names Mashael: Beastmaster of the Apex
Predator", day 32, s190361). The mantle-update line is coherent too
("The System updates its file: the new bearer is 'Gardener of the
Living Garden.' It had a word for this one before the Codex came.",
s190361 days 47/61) — the fiction tracks the office, not just the
person, which is exactly the Amendment 1 lesson in the game's own
words. Level-up lines match offers ("Ability gained: Lucky Rock
(L1)" after the lucky_rock pick; the same line fires again for a
later bearer — correct, a new person gaining it). Synergy lines name
real discovered synergies with their holders ("Hank has found
something — Field Pharmacy. Days of field_medicine and herbal_remedy
side by side, and now they move as one."). The one incoherence is
repetition, not contradiction: the slots-full line repeats verbatim
every day a sheet is stuck (27 times), and the "INTRUDER REPELLED"
pantry line repeats identically across seeds — both are the engine
saying the same true thing again, not saying something false.

## Metric 10 — Wall numbers

National 0, table 0, wins 0; wave 4 unlocks 8/8, wave 5 unlocks 3/8;
median survival 115d; deaths 659; standing max 475. See Wall
numbers above. Godhood happened (5 ascensions, 22 recognitions,
251 sheets) and the wall did not move.

## Sense-test scenes (quoted)

**Scene 1 — the first naming (s190361, day 23).** "◈ The System
names Kai: Gardener of the Living Garden. The village repeats it at
the fire." Twenty-three days in, the first class in the band is
named, and the village repeats it — the fiction treats class as a
social fact, not a stat. Coherent, and it lands early enough to
matter. (Tele agrees: gen_xymd108, forager/gardener, day 23.)

**Scene 2 — the garden ascends (s190363, day 80).** "✨ CAPSTONE:
Seed Vault. Every seed you have ever pocketed, kept dry and
dreaming. It weighs almost nothing. Almost. It was never going to
drop from a monster. It was always going to be GIVEN — to someone
who'd earned the shape of it." Followed by: "Godhood demands its
price, and the price is not hidden: Once per day. It costs you 200
kcal of your own — the garden gives, but through you. You're not a
fighter. Your garden needs guards, and everyone knows it." A god
arrives as a gift with a price, on the minDay floor, exactly as the
canon prices it. The price line is honest about the weakness the
capstone keeps.

**Scene 3 — the stuck scholar (s190368, days 44–61).** Every day
for 18 days: "Your slots are full (6/6). Choose which ability
Adrenaline Surge replaces — or keep what you have." The System asks
a question no one answers. The scholar holds six abilities and a
pending level-up for over two weeks of game time, and the village
keeps living around the unanswered question. The line is true and
well-written; the scene is a policy gap wearing the fiction's
clothes. (Same scene, shorter, on s190365 days 39–44 and s190366
days 126–146.)

**Scene 4 — the one-day god (s190364, days 123–124).** Day 123: the
scholar-bearer ascends apex_predator, ceremony and Seed-Vault-equivalent
gift in hand. Day 124: the bearer is dead, the office passes, class
`{}` and godhood `{}`. The rarest event in the game, erased by an
ordinary monster the next morning, with no capstone verb ever cast.
The canon says death resets godhood; the scene says the reset can
make ascension a one-day anecdote.

**Scene 5 — the garden feeds (s190368, day 80, reconstructed from
snapshot, not the say corpus).** Fatima ascends living_garden and
the same day Feed the Multitude feeds Haven — `_godDay.feed_multitude
= 80` in her godhood record. The capstone verb works, in the fiction
("kneels and asks. The land answers: N bellies full in Haven today"),
but the instrument never saw it: the say line falls outside the
driver's regex and the tele event (`god_verb`) outside the
instrument's filter. The scene happened; the capture missed it.

## Village assessment (plain words)

Eight villages lived 58–150 days. Two survived to day 150; six
died, mostly to the ordinary grind (659 deaths, monster-heavy).
Every village that lived past a month started naming classes —
gardeners first, then beastmasters and stalkers — and the forager
road is the only one that reliably finishes: four of five gods in
the band are the Living Garden. The scholar's own climb stalls
whenever their six ability slots fill, because nobody ever chooses
what to give up. Half the gods' deeds never happen at all. The
table never appears, national never appears, nobody wins — godhood
or no godhood. What the villages looked like: competent, busy,
recognised, and stuck one rung below the top of every ladder at once.

## Metric review (§14 — for the NEXT run, never re-scored here)

1. **Reconcile tolerance for death.** The recognitions bar (residue
   0) should tolerate a tele event whose holder dies before the next
   daily snapshot (holder dead within 1 day of the event, event
   otherwise fully classified). The devon case is the proof: the
   event is classified, the snapshot physically cannot show it.
   Same tolerance should apply to deeds/ascensions/gifts/picks
   reconcilers (villager pick residue 3 is the same shape).
2. **Picks reconciler: pending-sheet re-picks are a class, not
   residue.** A `chooseAbility` call with return null against a
   still-pending sheet (same ability, same bearer, consecutive
   days) is a refused pick, not an unreconciled one. 54/54 player
   pick residues are this shape. Classify them as `pending-repick`
   and count them separately; the residue bar should then be ~0.
3. **Capstone-verb capture is wrong-path.** The S.Godhood namespace
   wraps never fire; the verbs run through `godverbs.js`'s daily
   hook (tele `god_verb`) and the snapshot `_godDay` map. Next run:
   add `god_verb` to the tele filter, read `_godDay` per holder per
   day from snapshots, and add "Feed the Multitude / kneels /
   bellies full" (and the other capstone-verb say shapes) to the
   driver's say regex. The current capstone-verb 0 must never be
   quoted as "no capstone verb was ever used".
4. **Say cap.** The 200-line/seed cap hits on half the band and
   eats late-game lines (the apex capstone text is missing from the
   corpus). Raise the cap or reserve lines for ascension/ceremony
   days; record the cap hit per seed in the summary.
5. **Class changes need their own metric.** gen_1r4je3x changed
   subclass mid-run (beastmaster → stalker). The current analyzer
   counts re-appearances; a next run should report changes as a
   first-class count (holder, from → to, day).
6. **Engagement floor held, but the floor is low.** 3,376
   opportunity events is ample; the floor did its job (the band is
   interpretable). No change proposed.
7. **The GO table's "0 unclassified" bars are doing real work.**
   The one miss caught a genuine snapshot-timing limit, not noise.
   Keep the bars; apply the tolerance in (1) rather than loosening
   the numbers.

## Findings (lines for the coordinator to append to sim-findings.md)

- [open] 2026-11-11 — godpath — The 6-slot economy stalls the scholar's godpath climb: with full slots, competent calls chooseAbility daily with no replaceId, returns null, and the sheet stays pending for weeks (s190368 adrenaline_surge days 44–61; s190366 lucky_rock days 126–146; 27 "slots are full" lines band-wide). The fiction asks which ability to replace; the policy never answers. (arm sim-godpathfirst-a, evidence/2026-11-11/sim-godpathfirst-a.md)
- [open] 2026-11-11 — godpath — Capstone verbs fire through the godverbs.js daily hook (tele 'god_verb', snapshot _godDay), not the S.Godhood namespace wraps: Feed the Multitude used by fatima_hassan day 80 (s190368) and ingrid_vik day 151 (s190366); the instrument recorded 0 capstone verbs. Capture must listen to 'god_verb' + read _godDay. (arm sim-godpathfirst-a)
- [open] 2026-11-11 — godpath — 4 of 8 authored deeds never observed in 887 village-days (market_exchange, ward_rescue, relay_office, death_refused = 0); only field_truth_shared 35, outmatched_escape 58, care_survived 24, apex_hunt 12 fired. 4 of 5 ascensions are living_garden, a null-deed god — ascension runs on the synergy/class-days leg. (arm sim-godpathfirst-a)
- [open] 2026-11-11 — godpath — Strange track starved (8/251 sheets) and miser/shieldbearer/caregiver/drifter paths never pass kit 1 band-wide; only forager/hunter/survivalist reach closeAt. Under competent play most of the pantheon is decoration. (arm sim-godpathfirst-a)
- [open] 2026-11-11 — godpath — Scholar ascension does not survive the mantle: s190364 bearer ascended apex_predator day 123 and died day 124; the successor starts classless/godless with no capstone verb ever cast. (arm sim-godpathfirst-a)
- [open] 2026-11-11 — godpath — Canon gap (from the prereg, re-confirmed): godpath/godhood has NO dedicated canon doc — the operative canon is docs/godpath/STEVE-ANSWERS.md + docs/COHERENCE-SPINE.md + docs/godpath/PLAN.md + code headers. (arm sim-godpathfirst-a)
- [open] 2026-11-11 — godpath — Class changes happen but are uncounted as such: gen_1r4je3x beastmaster day 50 → stalker day 88 (s190367). Track from → to as a first-class metric. (arm sim-godpathfirst-a)

## Adoption + process notes (disclosed honestly)

- Adopted from the dead 1315Z run. Commit `2d01a784f` (prereg +
  instrument + driver + analyzer + proof, 61/61 green) verified
  (`git log master..sim-godpathfirst-a`, `git show --stat`).
  Uncommitted modifications reviewed diff-by-diff and kept: the
  Amendment 1 analyzer/instrument fixes + 4 proof checks (proof now
  65/65 green). No seed band re-picked, prereg not rewritten, GO bar
  not re-scored.
- Pilot corpus verified complete by count: 16 files in
  `evidence/2026-11-11/perseed-godpathfirst-a/` (8 seeds × control +
  neutral). No seed-leg re-run; no new band.
- Scratch files (`scratch-godpathfirst-diag*.js`,
  `scratch-godpathfirst-summarize.js`,
  `scratch-godpathfirst-summary.txt`) deleted, NOT committed. The
  summary JSON (`godpathfirst-summary-godpathfirst-pilot.json`,
  regenerated with the fixed analyzer) IS committed as an evidence
  artifact; the evidence file above is the judged record, built from
  it.
- Rebase: master read in the main tree immediately before rebasing:
  `8445ab97f` (14 commits ahead of anchor `0be63dbce`). None of
  `src/js/godpath.js`, `godhood.js`, `tracks.js`, `villager-build.js`
  moved in `0be63dbce..8445ab97f`, so the existing corpus is judged
  and the anchor base `0be63dbce` is recorded (per the task's rebase
  rule). Rebased onto the explicit SHA (never bare `git rebase
  master`); proof re-run green post-rebase (see commit message for
  the post-rebase proof count).
- No index clobber was found: `git status` showed plain `M`/`??`
  entries, no staged deletions, so no repair pipe was needed.
- No jest was run (the proof script is plain node, run directly).
  No push, no version bump, no live verification. No [needs-eyes]:
  measurement-only arm, no feel/combat/UI change.
- Balanced panel: none (measurement arm, §15 position recorded in
  the prereg and above). Telemetry check: not run — this arm has no
  lever change and the telemetry-check baseline path in the loop
  body is a coordinator step; the wall numbers above are the
  per-seed record for it.

## Files

- Prereg: `evidence/2026-11-11/sim-godpathfirst-a-prereg.md`
- Evidence (this file): `evidence/2026-11-11/sim-godpathfirst-a.md`
- Per-seed corpus: `evidence/2026-11-11/perseed-godpathfirst-a/` (16 files)
- Band summary: `evidence/2026-11-11/godpathfirst-summary-godpathfirst-pilot.json`
- Instrument: `scripts/godpathfirst-instrument-20261111.js`
- Driver: `scripts/godpathfirst-driver-20261111.js`
- Analyzer: `scripts/godpathfirst-analyze-20261111.js`
- Proof: `scripts/test-godpathfirst-a.js` (65/65 green)
