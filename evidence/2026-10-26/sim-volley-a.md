# sim-volley-a — volley / party / opening-move decomposition (axis scale-onramp)

Run: flesh-out loop, run fleshout-20261026T2141Z, arm sim-volley-a.
DIAG / MEASUREMENT ONLY — zero src/js changes, no default flips, no
demand-number moves, no combat/volley/party/intent code changes.
No [needs-eyes]: measurement only (re-checked at close).

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5). docs/PARTY.md read for party dynamics. No design is
invented here. Where a code number differs from a canon band, the row
reports the code number and the difference is noted, not smoothed over.

Question (findings blank #2, sim-w4dmg-a, run fleshout-20261026T2016Z,
evidence/2026-10-26/sim-w4dmg-a.md): wave-4 field source split volley 0 /
ally 6 / close-in 248 across 12 fights; 11/12 fought alone, 10/12 open as
'learn' (the engine's learn-first default). Answer, from code + rows:
(a) a complete volley-condition gate table — every condition the ranged
opening requires, read from code, with how often each condition blocks
across all field fights on the band; (b) party-formation conditions
enumerated with counts — why no party forms around a known monster
(solo vs party fight counts, ally-call conditions and their failure
counts); (c) the opening-move distribution reproduced (learn vs engage)
with the learn-first default's trigger conditions.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate: tableseat-nowait (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1,
  seat legs only), seeds 73671-73678, 180d death-aware horizon (runDays
  stops on Game.over).
- Re-baseline FIRST: plain tableseat-nowait, 8 seeds, compared
  field-by-field against the 1920Z band table (wins 2/8, national-ever
  6/8, national-final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5 0/8,
  median 152d, deaths 307, starvation 1). Any base delta is reported
  field-by-field, never silently absorbed. The current HEAD is
  896f2ac39 (2016Z coordinator evidence); the w4dmg base was 628ceb21e,
  so a delta is possible and is a finding, not a failure.
- Baseline: plain tableseat-nowait, own replication (8 seeds), NOT
  another arm's corpus. Armed: tableseat-nowait wrapped with two
  observational recorders: volley-diag (NEW, VOLLEYDIAG=1: per-field-
  fight volley-gate decomposition + party-potential + intentWhy) and
  w4dmg-diag (W4DMG=1, verbatim reuse, field + tbEnd rows — cross-check
  only: armed field-fight counts and volley/ally/intent totals must
  agree between the two recorders). Recorders never write game state,
  draw no RNG, never throw into the engine (errors counted). They never
  call villageStandingTotal() or unlockedWave() mid-run. The volley
  recorder's villagerFightAllies() read and villageKnowsTrick() read are
  pure reads taken pre-fight for classification only; they are NOT
  fed back into the engine (the engine's own ally inputs are
  opts.allies/allyVids, recorded verbatim).
- Volley gate table (code-read from src/js/fieldFights.js, volley
  section, in engine order; one mutually exclusive class per fight):
  - G0-preempt-evade: opts.awareness evade return fires before the
    volley section (fight never reaches volley code).
  - G0-preempt-alreadyDead: hp<=0 corpse return fires before volley.
  - G1-no-equipment-api: S.equipment or rangedWeaponOf missing.
  - G2-no-ranged-equipped: equipped.ranged is null (rangedWeaponOf
    returns null).
  - G3-ranged-def-missing: equipped ranged entry's item def not found
    in data.items.
  - G4-weapon-field-missing: def exists but def.weapon is null.
  - G5-ammo-field-missing: weapon exists but weapon.ammo is null
    (the spear class: range>1 counts as ranged for the equip slot —
    equipment.js isRangedWeapon — but carries no ammo, so the volley
    branch is skipped and rec.volley stays null).
  - G6-bow-no-ammo: ammo field present, carried ammo count 0
    (rec.volley = {shots:0,...}, narrated "but no arrows").
  - G7-fires: ammo count > 0 (rec.volley shots >= 1; shots, hits, dmg
    recorded; maxShots = clamp(1+floor(range/mSpeed),1,4)).
  - G8-exception-suspect: rec.volley is null although the pre-fight
    state passes G1-G6 with ammo > 0 (the volley try/catch swallowed a
    throw — counted, never explained away).
  Gate state is classified from the engine-mirror person lookup
  (data.villagers then background_survivors, as the volley code does
  it), post-fight equipped state (fieldFight gear-ups at entry, so
  post-fight equipped IS fight equipped; volley ammo spend changes
  ammo counts, not the weapon), and the pre-fight ammo count (gear-up
  consumes no ammo). Carried-but-unequipped ranged items and carried
  ammo units are recorded alongside, so "no bow in the village" can be
  split from "bow in the pack, not equipped".
  Volley questions are answered over ALL field fights on the band
  (all waves), with the wave-4 subset broken out — the prior arm's
  "volley 0" is a wave-4 number; the gate table must say whether the
  volley ever fires at all, on any wave.
- Party-formation conditions (code-read; fieldFights.js ally machinery
  + party-wiring.js + the three world routes game.js resolvePatrol /
  resolveWildMonsterEncounter, havenGrowth.js sortie, and
  villager-agency.js expeditionMonster):
  - Potential (opts): opts.allies count and opts.allyVids list as
    passed by the caller, verbatim. World routes feed opts from the
    _outdoorCrew snapshot (trust-ordered, capped at 2 in the list,
    count unbounded); the expedition route feeds opts from
    villagerFightAllies() (outdoor crew by live assignment + earshot
    nodes, trust floor 15, player excluded, capped at 2).
  - Entry: allyFromStart (round-1 entry; NO world/expedition caller
    passes it — verified by grep, counted from opts) vs the hopeless
    mid-fight call (hopeless && !helpCalled && allies > 0 &&
    allyVids.length && intent !== 'learn' — the learn intent BLOCKS
    the call; a learn-intent fight can only call after flipping to
    engage on a good exchange at round >= 2, and learn fights flee
    at round >= 3 when not winning, so the call window is narrow).
  - Actual: calledHelp / allyVid / allyDealt from the record.
  - Diagnostic potentials recorded pre-fight (classification only):
    _outdoorCrew snapshot size and trusted (>=15, roster, not the
    fighter) count; villagerFightAllies() result count. Failure
    counts are reported per condition: no opts allies, opts allies
    but learn-blocked (fight ends learn without ever flipping),
    opts allies but never hopeless, opts allies but hopeless while
    learn (call blocked that round), ally called but allyDealt 0.
  - Party vs solo counts are reported for wave-4 fights and for all
    field fights: solo = opts.allies 0; potential-party = opts.allies
    > 0; actual-party = calledHelp true. A fight with opts allies
    but no call is NOT a party fight.
- Opening-move distribution (code-read from fieldFights.js intent
  section, Steve 2026-10-13 learn-first):
  - intent = 'engage' iff villageKnowsTrick(mid) OR opts.allies > 0,
    else 'learn' (intentWhy: trick-known / party / learn-first;
    fallback 'engage' on exception). Mid-fight flips recorded from
    the final record only as intent (the record's intent field is
    the FINAL intent; intentWhy is the ENTRY reason — both recorded,
    and a final-intent vs entry-reason mismatch implies a flip).
    The analyzer reports entry-reason distribution AND final-intent
    distribution separately, never conflated.
  - Reproduction check: wave-4 final-intent counts must reproduce
    the w4dmg arm's 10 learn / 2 engage (same substrate, same seeds,
    G2-identical trajectories); any deviation is a finding, not a
    re-score.
- Cost bar: armed starvation total <= baseline starvation total + 2
  AND armed median days >= 0.8 x baseline median days. G2 identity
  preferred: armed == baseline exactly on days/gameDays/ts/starvation.
- Det-gate: recorders unset == unwrapped on one seed (days/gameDays/ts
  identical, no recorder surface, no installed wraps).
- Cross-checks (a seed is fully decomposed only if all hold):
  (a) volley-diag field rows count == w4dmg-diag field rows count on
  that seed (two independent wraps of the same fights); (b) wave-4
  volley-diag rows count == w4dmg wave-4 rows count; (c) every
  volley-diag row carries exactly one gate class; (d) recorder errors
  zero, overflow zero; (e) wave-4 final-intent counts reproduce
  w4dmg (10 learn / 2 engage) on the band.
- DIAG-GO iff (a) volley-condition gate table complete with
  per-condition block counts over all field fights AND the wave-4
  subset, AND (b) party-formation conditions enumerated with counts
  (potential vs actual, per-condition failure counts), AND (c)
  opening-move distribution reproduced with learn-first trigger
  conditions. NO-GO if the volley condition source cannot be located
  in code (report substrate-missing, never invent it). Otherwise
  DIAG-NO-GO, bar honored.
- BALANCED PANEL (§15): balance-panel.js has no corpus-ingest mode
  (standing limitation from prior arms) — for this no-lever DIAG arm,
  leg-exact determinism is the comparison: baseline vs armed G2
  identity on identical seeds, plus the w4dmg cross-check above. No
  panel file is produced or faked. scripts/telemetry-check.js is NOT
  run on recorder rows (its counts are wrong on recorder rows).
- Sense-testing: one NON-MEASURED narration-on replay of the seed
  with the most wave-4 fights (chosen after the census); judge in
  plain words whether volley/party/learn read sensically in the
  narration (does anyone nock an arrow? does anyone shout for help?
  does learning read as a choice?). Never census rows as sense
  evidence.
- DIAG ONLY: no readyDemand moves, no VETSHAPE flip, no src/js
  default change, no combat-code change. No [needs-eyes] flag:
  measurement only.

## RESULTS (appended after the run)
### Verdict: DIAG-GO (8/8 seeds fully decomposed; gate table complete; party conditions enumerated; intent reproduced 10/2)

- G1 det-gate: PASS. Seed 73671, recorders unset == unwrapped:
  days 180, gameDays 181, ts {tsNationalDay: 107} on both sides,
  no recorder surface, no installed wraps.
- G2 recorder neutrality: PASS, 8/8 seeds identical on
  days/gameDays/ts/starvation; faced-map agreement 8/8, kill-log
  agreement 8/8 (exact entry tuples d/mid/w/by/via).
- G3 corpus integrity: PASS. 16/16 rows in
  evidence/2026-10-26/perseed-volley-a/ + summary.json; every armed
  row carries volley-diag field rows + w4dmg-diag field rows, counts
  equal on all 8 seeds (field and wave-4), every row carries exactly
  one gate class, recorder errors zero, overflow zero, noRecord zero.
- Cost bar: PASS. Armed starvation 1 <= baseline 1 + 2; armed median
  152 >= 0.8 x baseline median 152 (identical — via G2 identity).
- Detail: --detail 73672 censusMatch=true (fieldAll 162, field4 5,
  identical wave-4 gate sets on re-run).
- Proof: scripts/test-volley-a.js — 152 PASS, 0 FAIL (every summary
  number re-derived from the rows, including both recorders' volley
  and ally totals agreeing on wave-4 rows).

### RE-BASELINE (base 896f2ac39) — EXACT vs the 1920Z table

Band aggregates vs the 1920Z table: wins 2/8, national-ever 6/8,
national-final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5 0/8,
median 152d, deaths 307, starvation 1 — every field identical, per
seed as well as in aggregate (73671 180d/48 deaths, 73672 180d/51,
73673 124d/32, 73674 142d/won/28, 73675 180d/26, 73676 144d/won/43,
73677 152d/41, 73678 104d/38/starved 1). The 2016Z base reproduces
the 1920Z trajectories on this band exactly, so this arm's numbers
sit on the same trajectories the w4dmg arm decomposed — no base
delta to carry, and no silent absorption anywhere.

### (a) THE VOLLEY GATE TABLE — the ranged opening NEVER fires

All field fights on the band: 1179 (waves 1: 744, 2: 285, 3: 138,
4: 12). Volley damage total: 0. Volley shots > 0: 0 fights.
G7-fires: 0. G8-exception-suspect: 0. G1-no-equipment-api: 0.
The volley code is reachable and intact (G6 rows prove the branch
runs and narrates "but no arrows"); it simply never has anything
to fire with.

| gate | all fights | wave-4 | what it means, in plain words |
|---|---|---|---|
| G0-preempt-evade | 46 (3.9%) | 0 | Awareness evade returns before volley code runs. Waves 1-2 only — wave-4 fights never evade, because world fights pass no awareness flag at all. |
| G2-no-ranged-equipped | 518 (43.9%) | 9 | No ranged weapon equipped. Carried-but-unequipped ranged items: 0 of these 518. Carried ammo units: 0 of 518. The fighter has no bow in hand, none in the pack, and no arrows anywhere on them. |
| G6-bow-no-ammo | 389 (33.0%) | 2 | Bow/sling/crossbow equipped, ammo count exactly 0 — rec.volley = {shots:0}. Crossbow/bolt 122, crude_bow/arrow 112, sling/stone 83, bow/arrow 50, phase_sling/stone 17, starfall_bow/arrow 3, apex_bow/arrow 2. Carried ammo-class units: 0 on all 389. |
| G5-ammo-field-missing | 226 (19.2%) | 1 | A spear sits in the ranged slot (fire_hardened_spear 126, hunting_spear 100) and spears carry no ammo field, so the volley branch is skipped and rec.volley stays null. Range > 1 makes a spear "ranged" for equipping (equipment.js isRangedWeapon) but not a bow for firing. |
| G7-fires | 0 | 0 | Never. No fighter in 1179 fights carries a single ammo unit at fight time (carriedAmmoUnits > 0: 0/1179). |
| G8-exception-suspect | 0 | 0 | No swallowed throw hides a firing volley. |
| G1 / G3 / G4 | 0 | 0 | Equipment API present, defs resolve, weapon fields present whenever a ranged item is equipped. |

Wave-4 gate rows, one by one (damage in parens):
73671 influencer d172 G2 (19), suburb d176 G6 crossbow/bolt-0 (18),
suburb d178 G2 (23); 73672 herald d137 G2 (23), influencer d139 G2
(27), herald d141 G2 (23), influencer d143 G2 (24), herald d144 G2
(31); 73673 algorithm d105 G6 sling/stone-0 (0), eater d122 G5
fire_hardened_spear (0); 73675 influencer d90 G2 (39); 73677 eulogy
d151 G2 (27). Gate damage totals: G2 236, G6 18, G5 0 — the volley
contributes nothing because it never happens, not because it misses
(shots are never loosed, so hit chance never rolls).

CORRECTION to the w4dmg evidence (stated, not hidden): w4dmg said
"volley null on all 12 rows". Precisely: rec.volley is null on 10
rows and {shots:0} on 2 rows (the G6 bow-no-ammo fights). The
w4dmg damage total (volley 0) was correct; the "null on all 12"
phrasing was not. This arm's gate table supersedes that sentence.

The volley story in one line: the village equips bows (389 fights)
and spears-as-ranged (226 fights) but no fighter ever carries ammo
into a fight — arrows, bolts, and stones are all at zero on all
1179 fighters at fight time. Whether ammo exists in village storage
but never reaches a fighter's pack was NOT measured (the recorder
sees only the fighter); that is the next blank, not a claim made
here. What is measured is complete: at the moment of the fight,
there is nothing to loose.

### (b) PARTY FORMATION — two disjoint systems, and the world route's is empty

Field fights split cleanly by route, and the split explains everything:

- WORLD fights (non-ephemeral entity, patrol/wild/sortie routes):
  1029 fights (87.3%). opts.allies > 0: 0. opts.allyVids: always
  empty. Reason, read from code: patrol (game.js resolvePatrol),
  wild (game.js resolveWildMonsterEncounter), and sortie
  (havenGrowth.js) all feed opts from the _outdoorCrew SNAPSHOT —
  and _outdoorCrew is 0 at every one of the 1179 fight moments
  (crewSize 0/1179, crewTrusted 0/1179). The snapshot is the party
  system for world fights, and it is empty whenever a fight
  happens. The diagnostic read says villagers who WOULD answer
  exist: villagerFightAllies() returns >= 1 ally on 990/1179 fights
  (84.0%), and on 959 fights where opts is 0 — but world routes
  never call villagerFightAllies, so those willing allies never
  enter the opts at all. The party machinery is not broken; it is
  never fed, on the route where wave-4 monsters are actually met.
- EXPEDITION fights (ephemeral meeting + awareness flag):
  102 fights (8.6%). opts.allies > 0: 31. Of those 31: called 5
  (16.1%), never-hopeless 26 (83.9%). The 5 called fights are all
  hopeless-call entries (opts.allyFromStart false on all 5; every
  one everHopeless true, intent engage via party, allyDealt 0-19):
  73674 terms_of_service, 73675 sanjun x2, 73675 influencer
  (the wave-4 one, allyDealt 6), 73677 belltoad. The 26
  never-hopeless break down as evade 14, mFlee 7, vKill 4,
  vFlee 1 — fights that ended before hopelessness, or were won
  outright, so no call was ever needed. Ally damage band-wide:
  37 HP total (wave-4: 6 HP, all from the single called fight).
- Remaining 48 fights (ephemeral, no awareness flag) are contest
  and other non-expedition ephemeral meetings: opts.allies 0 on
  all 48, no party route feeds them either.

Party failure counts, band-wide (1179 fights):
- solo-potential (opts.allies 0): 1148 (97.4%).
- potential, never hopeless (no call needed): 26 (2.2%).
- called (actual party): 5 (0.4%).
- potential-learn-blocked: 0. potential-hopeless-engage-nocall: 0.
The learn-block on the hopeless call (fieldFights.js: call requires
intent !== 'learn') is structurally VACUOUS for party fights: a
fight with opts.allies > 0 enters as engage (party reason) by
construction, and a fight that enters as learn has opts.allies 0
by construction (learn ⟺ not trick-known AND opts 0) — so there
is no fight in which a learn intent stands between a waiting ally
and the call. The binding party constraint is not the learn
block; it is that world fights start with opts 0 because the crew
snapshot is empty, and expedition fights are only 102 of 1179.

Wave-4 party rows: solo-potential 11, called 1 (73675 ephemeral
influencer, opts 1, allyDealt 6, vFlee). The 11 solo wave-4 fights
include 5 that turn everHopeless (all 73672 fights) — hopeless,
alone, with no ally machinery even in reach: opts 0, crew 0,
while villagerFightAllies() would have returned 2 on all five.
That is the wave-4 party story in one row: the village has people
who would come, on a route the fight never takes.

AllyFromStart correction (prereg error, disclosed): the prereg
said no caller passes allyFromStart. Wrong: comms.js aidFight
passes allyFromStart=true for arrived aid parties. It does not
change this band's numbers — optsAllyFromStart is false on all
1179 recorded fights (no aid-crisis field fight occurred on the
band) — but the claim is corrected here so a future arm does not
inherit it.

### (c) OPENING-MOVE DISTRIBUTION — learn-first, reproduced

Final intent, all waves: engage 977 (82.9%), learn 202 (17.1%).
Entry intent (inferred from intentWhy, since the record's
intentWhy is overwritten by a good-exchange flip): entry-learn
337 (learn-first 202 + good-exchange flips 135), entry-engage
842 (trick-known 822 + party 20). Flips learn→engage on a good
exchange at round >= 2: 135 fights (waves 1: 75, 2: 50, 3: 10,
4: 0). Wave 4 never flips — no wave-4 fight ever shows a good
exchange, consistent with the w4dmg DPS desert (median 23 damage
against 448-1000 HP pools).

Wave-4 final intent: learn 10, engage 2 — REPRODUCED EXACTLY from
w4dmg (10/2). Entry reasons wave-4: learn-first 10, trick-known
1 (73672 herald d144 — the one wave-4 fight where the village
knows the trick), party 1 (73675 ephemeral influencer — the one
wave-4 fight with opts allies). Trick-known on wave-4 fights:
1/12; trick-known is the only wave-4 engage route besides party,
and it fires once.

Learn-first trigger conditions (code-read, fieldFights.js intent
section, Steve 2026-10-13): intent = 'engage' iff
villageKnowsTrick(mid) OR opts.allies > 0; else 'learn'
(intentWhy learn-first). Mid-fight: learn + round >= 2 + winning
→ engage ('good-exchange'); learn + round >= 3 + not winning →
vFlee ('seen enough — withdraws to report back'). The learn-first
default is therefore not a personality quirk: on wave-4 fights it
is the arithmetic outcome of trick-known 1/12 and opts allies
1/12. A villager walks up to a Mirror Draft monster to learn
because the village knows no trick for it and nobody came with
them — and the learn fight then flees at round >= 3 when not
winning, which on this band is every learn fight that lasts that
long.

Intent by wave (final): wave 1 engage 631 / learn 113; wave 2
246 / 39; wave 3 98 / 40; wave 4 2 / 10. The learn share rises
with wave (15.2% → 13.7% → 29.0% → 83.3%): the less the village
knows, the more it sends villagers in to learn — and the more
those learning fights cost a flight or a death.

### SENSE-TEST (NON-MEASURED replay, seed 73672 — census shape reproduced)

Replay (narration on): days 180, survived, maxWave 4, volley
(SENSE-ONLY): field4 = 5, byGate G2 x5, volleyDmg 0 — the census
shape, not a fresh run. The ring holds only the last 240 lines
(d178-180, endgame), so it cannot show the d137-144 wave-4 fights
directly (same ring-window limit as the w4dmg sense). What it does
show: the Herald appears only as weather — "THE HERALD fed in the
night — 0 kcal gone from your stores. It is eating the realm
while you deliberate." No line in 240 lines nocks an arrow, draws
a bow, looses a volley, shouts for help, or gathers a party; the
one combat line is a wave-3 Callback show fight ("COMBAT! THE
CALLBACK! ... ROUND 1 — FIGHT!"). Plain-words judgment: in
narration as in rows, wave-4 monsters are something that happens
to the realm while the village deliberates — never something the
village walks out to meet prepared, together, at range. The
narration never promises a volley or a party that the rows then
fail to deliver; it simply never imagines them.

### VILLAGERS ACTING LIKE PEOPLE (sampled from the same corpus)

- Villagers DO carry bows into fights (389 fights) — the intent to
  fight at range is there in the gear. What they never carry is
  the arrow: the ranged fighter is a person with a bow and an
  empty quiver, every time, on every wave. That reads less like
  caution and more like a supply line that ends before the fight.
- Villagers DO answer shouts when the machinery feeds them: all 5
  called fights are expedition fights where villagerFightAllies
  supplied the names, and the ally damage (6-19 HP) is real help,
  not decoration. The people-like failure is upstream: the world
  routes ask an empty snapshot instead of the willing villagers
  standing (per the diagnostic read) within earshot.
- The learn-first fights read as people-like caution with a real
  cost: 10 wave-4 villagers go in to learn, and the narration's
  own logic ("seen enough — withdraws to report back") is the
  humane version of what the rows show (8 vFlee / 4 vDie across
  the 12 wave-4 fights). What is not people-like is the repetition
  without adaptation: the same herald met three times by the same
  village, each time alone, each time learn-first, each time
  fled — the village remembers the monster (wounds persist) but
  never changes the approach (no party, no volley, no trick).

### WALL NUMBERS (this run's judged corpora — baseline = armed, G2 identical)

Wins 2/8, national-ever 6/8, national-final 5/8, table waiting
4/8, entered 2/8, wave-1 8/8, wave-2 8/8, wave-3 8/8, wave-4 6/8,
wave-5 0/8, median 152d, max 180d, deaths 307, starvation 1, max
Arc 4. Wave-4 kills 0/8 seeds, wave-4+ killers peak 0 everywhere —
the veterans bar is still empty, now decomposed one level deeper:
the volley never fires (0/1179), the party never forms around a
world monster (0/1029 world fights with opts allies), and the
learn-first default fires exactly when the village knows nothing
and nobody came (10/12 wave-4 fights).

### METRIC REVIEW (§14 — binding, no mid-run re-scores)

- The DIAG-GO bar is judged exactly as pre-registered: (a) gate
  table complete with per-condition block counts over all 1179
  field fights AND the wave-4 subset (G2 518/9, G6 389/2, G5 226/1,
  G0-evade 46/0, G7 0/0, G8 0/0); (b) party conditions enumerated
  with counts (solo-potential 1148, potential-never-hopeless 26,
  called 5; wave-4 solo 11, called 1; per-condition failure counts
  above); (c) opening-move distribution reproduced (wave-4 final
  intent 10 learn / 2 engage, exactly as w4dmg) with learn-first
  trigger conditions. No metric was re-scored.
- Two prereg corrections, disclosed (neither changes the verdict):
  (1) The prereg said intentWhy is the ENTRY reason. Wrong: the
  record's intentWhy is overwritten by a good-exchange flip, so it
  is the FINAL reason. Entry intent is inferred as learn-first +
  good-exchange (entry-learn) vs trick-known + party
  (entry-engage) — 337 / 842 band-wide, 10 / 2 on wave-4. The
  final-intent reproduction (10/2) is unaffected, since final
  intent is recorded directly. (2) The prereg said no caller
  passes allyFromStart. Wrong: comms.js aidFight does. It fires
  on 0/1179 fights on this band, so no number changes, but the
  claim is corrected above.
- One classifier note for the NEXT run: the gate fallback
  ("volley null + ammo field present → G6") never fired (G6 rows
  all carry rec.volley {shots:0} as expected, and G8 stayed 0),
  but a future recorder should capture the engine's own ammo
  count directly rather than inferring it from pre/post state.
- One finding that sharpens, not re-scores, the bar: "fully
  decomposed" passes vacuously on zero-encounter seeds (73674,
  73676, 73678 have no wave-4 fights) — same note as w4dmg.
  The band-level gate table does not depend on those seeds (the
  1179-fight denominator is dominated by wave 1-3 fights), but a
  future wave-4-only bar should require a minimum wave-4
  encounter count per seed separately.
- BALANCED PANEL (§15): attempted, not applicable — same
  recorder-corpus limitation as prior arms (balance-panel.js has
  no corpus-ingest mode). For this no-lever DIAG arm, leg-exact
  determinism is the comparison: baseline vs armed G2 identity on
  identical seeds, plus the two-recorder cross-check (volley vs
  w4dmg totals agree on all wave-4 rows). No panel file is
  produced or faked.
- Telemetry-check was NOT run on recorder rows (its counts are
  wrong on recorder rows — standing instruction from the 0158Z
  evidence).
- check.js NOT run: zero src/js diff in this tree (DIAG arm, one
  new recorder policy + two new scripts + proof only) and sibling
  loops are live; the arm's own proof is the det-gate + G2
  identity + the 152-check proof + the detail census-match.
  node --check clean on all three new scripts.

### PROOF SCRIPTS (all in this tree, all run)

- scripts/policies/volley-diag.js — NEW in this arm. Per-field-
  fight volley-gate / party-potential / intent recorder
  (VOLLEYDIAG=1): gate class in engine order, pre/post ranged
  state, pre-fight ammo count (engine-mirror counting), opts
  verbatim, diagnostic _outdoorCrew + villagerFightAllies reads,
  trickKnown, carried ranged/ammo, everHopeless/everWinning.
- scripts/test-volley-diag-sweep.js — NEW in this arm. Sweep
  (--one per seed via child processes, --summary rebuild,
  --detgate, --detail, --sense). Det-gate PASS, detail
  census-match PASS (73672), sense replay done (NON-MEASURED,
  see above; sense text captured via stdout pipe — see
  infrastructure note).
- scripts/test-volley-a.js — NEW in this arm. Proof: re-derives
  every summary number from the rows; 152 PASS, 0 FAIL (one
  proof bug found and fixed during the run: the proof first read
  w4dmg ally damage from the wrong field name, allyDealt instead
  of the recorder's allyDmg — the corpus was right, the proof
  was wrong; fixed and re-run green).
- Reused verbatim: scripts/policies/w4dmg-diag.js (cross-check
  only; no edits).

### INFRASTRUCTURE (loud, as required)

- EPERM FLAP ON EVIDENCE WRITES (mid-run, from ~22:46Z): new-file
  creation under evidence/ fails with EPERM, leaving a 0-byte
  root-owned stub (same container class as the 2026-10-23 .git
  flap and the 2026-10-24 evidence flap). The sweep corpus itself
  was written BEFORE the flap and is intact (16/16 rows +
  summary.json, proof 152/152). The sense text file could not be
  created under evidence/ (three attempts, three 0-byte stubs,
  all removed) nor under the worktree root; appending to the
  EXISTING evidence .md works, so the sense judgment lives in
  this file instead of a standalone sense .txt. The standalone
  sense file is the run's one missing artifact, recorded here
  rather than papered over; re-creating it is a coordinator
  retry once the flap passes, not a re-run (the replay's
  recorder output — field4 5, G2 x5, volleyDmg 0 — is already
  captured above).
- /tmp WRITE QUIRK (sense capture): redirecting the sense
  replay's stdout to a /tmp file kills the process in ~1s with
  exit 1 and empty stderr (reproduced twice); piping through
  head/grep works fine. The sense judgment above comes from
  piped output, never from a /tmp file. Do not redirect node
  harness stdout to /tmp files in this container.
- No safe-commit refusal yet (commit step follows this file);
  the coordinator owns the --ff-only merge. No [needs-eyes]:
  this DIAG arm changes no feel, combat, or UI — that
  assessment did not change during the run.

### BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the complete volley gate table — 1179
  fights, every condition the ranged opening requires, with block
  counts: the volley never fires because no fighter ever carries
  ammo (0/1179), bows without arrows account for 389 fights,
  spears-as-ranged for 226, no ranged weapon for 518.
- FILLED (measurement): the party-formation decomposition — world
  fights never get opts allies because _outdoorCrew is 0 at every
  fight moment, while villagerFightAllies would supply allies on
  84% of fights; expedition fights are the only party route
  (31 fights, 5 called). The learn-block on the hopeless call is
  structurally vacuous (a learn fight has opts 0 by construction).
- FILLED (measurement): the opening-move reproduction — wave-4
  final intent 10 learn / 2 engage, exactly as w4dmg, with
  entry-vs-final split (entry-learn 337 band-wide, 135 flips on
  good exchange, 0 flips on wave 4).
- CORRECTED (prior arm): w4dmg's "volley null on all 12" is now
  "null on 10, {shots:0} on 2" — damage totals unchanged.
- CORRECTED (this arm's prereg): intentWhy is the final reason,
  not the entry reason; comms.js aidFight does pass
  allyFromStart (0/1179 fights here).
- DOCUMENTED, NOT FIXED (next blank): whether ammo exists in
  village storage but never reaches fighter packs — the recorder
  sees only the fighter at fight time. A storage-level ammo
  census is the follow-up measurement.
- DOCUMENTED, NOT FIXED (sense limit): the narration ring holds
  only the last 240 lines (endgame days), so sense replay cannot
  show the wave-4 fight days themselves — the sense judgment
  rests on the replay's recorder agreement plus the absence of
  any bow/arrow/party language in the ring.
- NOT A FINDING: no game bug was found in the volley, party, or
  intent paths — the volley branch runs (G6 narration proves
  it), the party machinery answers when fed (5/5 called fights
  deal real ally damage), and the intent logic follows its
  stated rules exactly. The fights work as designed; the
  village fights them unarmed-at-range, alone, and learning.

Convergence state: scale-onramp stays converging (NOT
converged): wave 5 still 0/8, wave-4 kills still 0/8, and now the
reason has a second decomposition layer — beneath the damage
desert (w4dmg) sits an equipment-and-escort desert: no arrows
ever reach a fighter, no party ever reaches a world monster, and
the learn-first default fires precisely because the village knows
no trick and nobody came. The wall did not move; this arm
measured the two missing supply lines behind it, fight by fight.
