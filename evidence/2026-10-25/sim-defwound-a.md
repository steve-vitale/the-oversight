# sim-defwound-a — defender-fight wound manufacture (axis scale-onramp)

Run: fleshout-20261025T1915Z (Sun 2026-10-25 ~14:15 CDT onward).
Axis: scale-onramp (converging). Carried blank from findings
#990 (defender-fight wound manufacture unaddressed) and #977
(raid-toll remedy undecided: toll floor vs break-line exception vs
defender finish, each needing its own pre-registered arm — the
first two ran at 0535Z; this run is the third). This worker does
not edit the findings file.
DIAG + ONE RULE ONLY, in two stages, in order. No toll change. No
survivability companion bundled. No other game-code change.

## PRE-REGISTRATION (binding — judged only against this)

Substrate (shared, both stages): tableseat-nowait — leanlinkrescue
courtship (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1),
no wait leg. Seeds 73671–73678, 180d death-aware horizon (runDays
stops on death/win; 180 is the cap, not a fixed horizon). Control
band = the published 1815 band (evidence/2026-10-25/
sim-scale-onramp-round-1815.md): deaths 234, national-ever 7/8,
wins 4/8, wave-4 6/8, wave-5 0/8, raids 85, raiders 361, pool 1494,
pool wave-3+ 107, median survival 135d.

Definitions (fixed before any sim, same in both stages):
- Defender fight = a resolveWildMonsterEncounter row with opts.raid
  (havenRaidTick's defender fights; one defender per raider).
- Break line = 0.15 wave>=2, 0.25 wave 1 (fieldFights.js mBreak).
- Below-line survivor EVENT = a defender fight ending mFlee with
  the world entity below the line at fight end (the wound persists
  onto the entity: fieldFight sets m.hp = mHpLeft for every outcome
  except vKill).
- MANUFACTURED event = the entity STARTED at/above the line and
  ended below it (this fight wrote the wound). PRE-WOUNDED event =
  the entity started below the line already (toll, or an earlier
  fight, wounded it first). Events are counted per fight; distinct
  ENTITIES are counted separately (one entity re-met many times is
  one entity, many events).
- Re-meet = a later resolve row (any context: raid or field) for
  the same instance (spawnsrc _spawnSeq — m.id is the SPECIES id,
  never an instance id). A re-meet is a phantom meeting when it
  ends rounds-0 mFlee (the break check fires before round 1).
- Finished = a later resolve row for the same instance ending
  vKill (a villager fight finished it). Player-fight endings
  (tbEnd settlements in the oldcore removal record) are reported
  separately and never counted as villager finishes.

STAGE 1 — DIAG-GO iff (a) detgate PASS (recorders OFF delegates
byte-identically on days/gameDays/ts, no diag surface, no wraps
installed); (b) corpus complete on 8/8 seeds with zero recorder
errors and zero overflow; (c) neutrality EXACT against the 1815
band on raids, raiders, deaths, national-ever, wins, median days
(any deviation = STOP, recorder not neutral); (d) the manufacture
split (manufactured vs pre-wounded, by wave), the re-meet rate,
and the finish rate are all reported with numbers, plus one
defender-fight transcript read. Any leg missing = DIAG-NO-GO.

STAGE 2 — ONE RULE ONLY, chosen from Stage 1 (see "Rule choice"
below): (a) DEFENDER FINISH, narrow scope, exactly as specified
under "Stage 2 implementation". NOT (b) defender retreat (rejected
for the stated reason — the choice is made here, before
implementing, and is not revisited mid-pilot).
GO bars (all required, pilot 8 seeds on identical seeds, armed
= Stage 1 control + the rule ONLY, measured by the same recorder):
- PRIMARY: defender below-line survivor EVENTS down by at least
  30% vs Stage 1 control (260 → ≤182).
- SECOND LEG (at least one): defender villager kills up (25 → more)
  OR re-meet events of below-line survivors down (877 → fewer).
- COST GUARDS: mixed death-tele total no worse than control +10%
  (234 → ≤257); wins no worse than control (4/8).
- PROOF GATES: directed first-divergence check PASS on every seed
  (the control's first defender-manufactured fight, same day/vid/
  instance, ends vKill in the armed run — see "Stage 2 proof");
  check.js --only fieldfight green (2 passed, 0 failed, as on the
  control branch); node --check clean on both touched files.
A miss on ANY bar = NO-GO: revert the game code, land record only.
Diagnostics (reported, never bars): kind-filtered villager deaths
(the deathcensus correction — mixed totals mix monster kills and
scholar successions with villager deaths), national-ever, wave-4/5
reach, median survival, starvation, defender vDie.

## STAGE 1 VERDICT: DIAG-GO (all four legs pass)

- (a) DETGATE PASS: seed 73671, baseline days=180 gameDays=181
  ts={tsNationalDay:77} vs wrapped-with-recorders-OFF identical on
  all three, diagSurface=false, wrapsInstalled=false,
  postSetupWorld=0.
- (b) CORPUS PASS: 8/8 seeds, all four recorders errs=0,
  overflow=0 on every seed (one check bug found and fixed during
  this run: the summary gate tested the defwound overflow object's
  KEY count, but the store initializes it as {resolveFights: 0} —
  a zero counter, not an overflow. The gate now tests overflow
  VALUES. All values were 0 on all seeds; no data was re-run or
  patched, only the gate).
- (c) NEUTRALITY EXACT: raids 85, raiders 361, deaths 234,
  national-ever 7/8, wins 4/8, median 135d, pool 1494, pool wave-3+
  107 — every 1815 headline reproduced exactly. Per-seed lines
  also match the 1815 pilot (73671 survived 180d/16 raids/31
  deaths; 73672 won d97/7 raids/25 deaths; 73673 won d124/7 raids/
  28 deaths; 73674 survived 180d/14 raids/18 deaths; 73675 won
  d135/13 raids/24 deaths; 73676 village-lost d70/7 raids/31
  deaths; 73677 village-lost d143/12 raids/43 deaths; 73678 won
  d116/9 raids/34 deaths).
- (d) Numbers below; transcript read below.

## STAGE 1 NUMBERS (control band, 8 seeds)

Defender fights: 322 total — mFlee 263, vFlee 34, vKill 25, vDie 0.
(Contrast with the deathcensus band's 342/299/20/1: a different
master, a different band — this run's control is the 1815 band,
reproduced exactly, and all Stage 2 comparisons use it.)

Below-line wounds from defender fights:
- mFlee-below-line EVENTS: 260 (0.81 per defender fight).
- MANUFACTURED by the defender fight: 56 events (21.5% of the
  260) — by wave: w1 37, w2 15, w3 4.
- PRE-WOUNDED (started below the line already): 204 events
  (78.5%) — by wave: w1 152, w2 45, w3 7.
- Untagged (no instance seq): 0. Other below-line ends (vFlee/
  evade leaving a wound): 0. Defender fights STARTING below the
  line: 204 — every one of them ends mFlee, none ends vKill.
- Defender vKills (25) all start above the line (w1 12, w2 13,
  w3+ 0); the lowest vKill start fraction is 0.20 on a wave-2
  entity (above its 0.15 line).
- Field contrast (non-raid resolve fights): mFlee-below-line 441,
  manufactured 69, pre-wounded 372; field fights starting below
  the line: 372.

The per-seed manufacture table (defender fights / mFlee-below /
manufactured / pre-wounded / vKill):
73671: 65 / 55 / 6 / 49 / 3. 73672: 25 / 17 / 6 / 11 / 2.
73673: 27 / 23 / 2 / 21 / 2. 73674: 62 / 53 / 6 / 47 / 4.
73675: 48 / 39 / 9 / 30 / 5. 73676: 22 / 18 / 8 / 10 / 3.
73677: 42 / 33 / 10 / 23 / 1. 73678: 31 / 22 / 9 / 13 / 5.
Pre-wounded dominates on every seed.

Re-meet (the mill):
- Wound EVENTS: 260; DISTINCT survivor entities: 108.
- Re-met at least once: 204/260 events (78.5%).
- TOTAL re-meets: 877 — and ALL 877 are rounds-0 mFlee.
  Not one re-meet is a real fight.
- FINISHED by a later villager fight: 0/260 events (0.000).
  No villager fight, defender or field, ever finishes a
  below-line entity on this band.
- Manufactured-only re-meets: 56 events, 43 re-met (76.8%),
  247 total re-meets, 0 finished. Pre-wounded-only: 204 events,
  161 re-met, 630 total re-meets, 0 finished.
- HP rises between fights: 0 events. Wounds never heal — the
  no-heal-path code read is confirmed empirically.

Final fates of the 108 distinct survivor entities:
still-present at run end 87 (80.6%); removed by a PLAYER fight
14 kills + 6 melts (tbEnd settlements in the oldcore record);
removed by monsterTurn departure 1; vanished 0. So the only
exits from the mill are the scholar's own fights (20/108) —
villagers never close it, and four-fifths of the wounded are
still standing when the run ends.

Where the mill is fed (first below-line end per entity, all
132 entities that ever end below line in any context):
defender-manufactured 56, field-manufactured 72,
arrived-wounded (no prior fight manufactured the wound — the
toll is the only known pre-fight wound source) 4. The toll is
NOT the main manufacturer — consistent with the 0535 tollfloor
finding (only 4 attributable above-line crossings there).
Pre-wounded defender events by the entity's first-wound source:
field-manufactured entities 111, defender-manufactured 88,
arrived-wounded 5. Re-meets by first-wound source:
defender-manufactured entities 577 (65.8% of all 877),
field-manufactured 293, arrived-wounded 7. Defender-wounded
entities are re-met far more often than field-wounded ones
(577/56 = 10.3 re-meets each vs 293/72 = 4.1) — plausibly
because defender-wounded entities stay near Haven, where the
nearest-first raid draft keeps pulling them back in (stated as
a hypothesis, not measured — the draft is nearest-first by
construction, havenGrowth.js havenRaidTick).

First-wound source does NOT predict fate: manufactured-first
entities end still-present 45/56, player-kill 8, player-melt 3;
pre-wounded-first entities end still-present 42/52, player-kill
6, player-melt 3, departure 1.

## RULE CHOICE (made from Stage 1, before implementing)

Chosen: (a) DEFENDER FINISH, narrow scope — a defender fight
finishes a monster IT DROPS below the break line, instead of
letting it flee wounded. Rejected: (b) defender retreat.
Reasons, in order:
1. Both rules statically project past the -30% bar, but for
   different reasons. Narrow (a) removes the 56 manufactured
   events AND the 88 pre-wounded defender echoes belonging to
   those same entities (they die at manufacture instead of
   echoing) — a static projection of 260 → ~116 events (-55%)
   and 877 → ~300 re-meets (-66%), with defender kills 25 → ~81.
   Narrow (b) (wounds do not persist: restore pre-fight HP)
   projects the same event reduction, but only by erasing dealt
   damage — the fight's rounds show damage, then the world shows
   it gone. (a) is the honest rule: the damage stands, the
   monster dies, the existing vKill path (corpse, loot, deed,
   trust) follows. (b) as full restore (retreats unwounded at
   full HP) would additionally erase toll/field wounds the
   defender fight never dealt — dishonest and out of scope.
2. Defenders already kill (25/322) — finishing what they drop
   extends an existing behavior, it does not invent one. The
   0535 defendfinish arm is NOT this rule: that arm finished
   already-below-line raiders at the raid-tick level (130
   finishes, toll entities included) and NO-GO'd on median/wave-4
   guards. This rule touches only fights that DROP a monster
   below the line during the fight itself (56 fights), and
   leaves met-below-line phantoms untouched (they still
   rounds-0 flee — the residual mill, honestly reported, is
   the next run's question, not this rule's silent expansion).
3. (b) would make old stock MORE immortal (wounded entities
   leave healthy and echo as real fights), against the 1815
   open question of whether surviving-core near-immortality is
   intended. (a) moves the wounded subset out of the pool
   through a fight the village already wins.

## STAGE 2 IMPLEMENTATION (pre-registered scope — NOT YET LANDED)

Files: src/js/game.js (one line), src/js/fieldFights.js (two
gated checks). Nothing else. No toll change. No companion. No
deed/loot/ledger tuning (the vKill path's existing rewards
follow automatically and are reported, not tuned).
- game.js resolveWildMonsterEncounter: the fieldFight call
  passes { allies, allyVids } today — add raid: !!opts.raid.
  The aid path (aidFight) is NOT touched and receives no flag.
  opts.raid is read nowhere in fieldFights.js today, so no other
  caller is affected (patrols, sorties, contests, arena pass no
  raid flag).
- fieldFights.js: capture the lead's start fraction before the
  volley (members[0] is the world entity for world fights).
  Gate BOTH break-line mFlee checks on the narrow condition:
  skip the mFlee iff opts.raid AND the lead started at/above
  the break line (i.e. this fight dropped it, or the volley
  dropped it). A monster that STARTS below the line still
  rounds-0 flees exactly as today (the met-below-line case is
  out of scope by design). The two checks: (1) the post-volley
  check (unconditional top-level check after the volley block —
  this is the rounds-0 gate for start-below-line entities);
  (2) the in-round check after each round. Untouched: round-cap
  decision (measured residual: 1/322 defender fights reach the
  15-round cap), trick-dismissal mFlees (offer_food, starve-out,
  bore, ToS — bounded: wave-3+ defender manufactured events are
  only 4), vFlee, vDie, arena (opts.noFlee), aidFight.
- Narration: no new lines. A finished defender fight uses the
  existing vKill summary ("killed the X alone — N rounds, Z
  taken. Word travels fast.") and the existing raid defense
  beat counts it under "put down". The [needs-eyes] flag on the
  Stage 2 commit covers the feel change (defenders now kill at
  the wall instead of driving off).

## STAGE 2 PROOF (pre-registered)

- Directed first-divergence check, per seed: take the control
  corpus's first defender-manufactured event (day, vid, seq);
  find the armed run's row with the same day+vid+seq (the
  trajectory is identical up to that fight, so the raid and the
  defender assignment are identical); assert the armed outcome
  is vKill with rounds >= the control fight's rounds. Any seed
  where the fight is absent or ends otherwise = investigate,
  never pass by default.
- Pilot aggregates (the GO bars above) from the same recorder
  on identical seeds, armed vs the Stage 1 control corpus.

## SENSE-TESTING (transcript, on the Stage 1 trajectory)

Seed 73671, transcript tap (corpusMatch=true — the lines below
are from the exact Stage 1 run, not a narration replay). The
day-8 manufacture and its echoes, same instance (seq 2):
- d8 [raid] defender vs drumbelly_tanuki, rounds=3,
  1.00 → 0.11, mFlee, manufactured: "Brunhilde stood down the
  Drum-Belly and kept walking — 3 rounds, bloodied but
  breathing. It's still out there, somewhere."
- d22 [raid] same instance, rounds=0, 0.11 → 0.11, mFlee,
  pre-wounded; d30 same, rounds=0; d60 rounds=0, 0.02 → 0.02;
  d72 rounds=0, 0.02 → 0.02. The awayNews line for every echo
  is the same boilerplate: "stared down the Drum-Belly and it
  backed off — 0 rounds, not a scratch on them. It's still out
  there, somewhere."
Judged as a story: the village tells the same two sentences
about this animal for five months — once as a real fight
("bloodied but breathing"), then two dozen times as a
non-event ("not a scratch"). The sentence "It's still out
there, somewhere" is the most honest line in the game: it IS
still out there, at 1–2 HP, being stared down again next
week. A defender finish would end this animal's story on day
8 with a kill line instead of twenty-three identical shrugs.
(The full 65-row defender transcript for 73671 is in
evidence/2026-10-25/sim-defwound-a-sense.txt.)

## VILLAGE ASSESSMENT (plain words)

These are the same villages as the 1815 band, trajectory for
trajectory — Stage 1 changes nothing, so the news is what was
learned. The wall works: 322 defender fights cost zero
villager deaths, and 25 raiders were put down outright. But
most of what the wall does is not fighting — it is staring.
Two-thirds of defender fights start against a monster that is
already wounded, and every one of those ends before round 1
with the same line. The village is not being attacked by an
army; it is being visited, over and over, by the same wounded
animals it already beat, which never heal, never leave, and
never get finished — except when the scholar walks out and
does it personally. The wound population is not mostly the
wall's fault: the wall writes about a fifth of it, the field
writes more, the toll writes almost none. But the wall is
where the mill spins fastest, because the wounded stay near
home and the draft keeps pulling the nearest teeth back to
the door.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No metric was re-scored mid-run. Stage 1 was judged exactly
  against its four DIAG legs; the corpus-gate fix (overflow
  VALUE vs KEY count) changed a check implementation, not a
  threshold or a number, and is disclosed above.
- Death-tele totals are NOT villager deaths (deathcensus
  correction, carried): the 234 control headline mixes monster
  kills, scholar successions, and villager deaths. The Stage 2
  cost guard uses the brief's metric (mixed total ≤ +10%) for
  comparability with the published band, and reports the
  kind-filtered villager deaths alongside as a diagnostic —
  if the two disagree, the disagreement is reported, not
  resolved by swapping the bar.
- Events vs entities: the 260/877/56 counts are EVENTS (per
  fight); the 108 count is ENTITIES. The Stage 2 primary bar
  is on events (the deathcensus counting convention); the
  entity view is reported alongside so a bar pass built on
  re-counting the same animal is visible.
- Balanced panel (§15): NOT run as a compare, deliberately —
  the panel cannot ingest per-seed recorder corpora (ninth
  sighting across runs, same known error class). The
  sweep-compare tables on identical seeds (Stage 1 control
  corpus vs Stage 2 pilot corpus) are the comparison of record.
- The 0535 band (deaths 261, defender fights 342) is NOT this
  run's control: master moved between 0535Z and 1815Z, and the
  1815 band (deaths 234, defender fights 322) is the current
  control, reproduced exactly here. No 0535 number is used as
  a bar in this run.

## INSTRUMENT NOTES

- New: scripts/policies/defwound-diag.js (resolve-level rows:
  raid flag, instance seq via spawnsrc, start/end HP fractions,
  manufactured/pre-wounded split, rounds-0 flag, transcript tap)
  + scripts/test-defwound-diag-sweep.js (--one/--summary/
  --detgate/--transcript) + scripts/test-defwound-diag.js
  (analyzer unit proof, 25/25).
- Reused VERBATIM (never edited): raftdraft-diag, spawnsrc-diag,
  oldcore-diag, tableseat-nowait, sim-harness.
- Corpus: evidence/2026-10-25/perseed-defwound-a/ (8 per-seed
  JSONs + summary.json, in the worktree evidence dir — never
  /tmp). Sense file: evidence/2026-10-25/sim-defwound-a-sense.txt.
- What the recorder cannot see (stated, not hidden): player
  (tb) fights have no resolve rows — their endings reach this
  analysis only as oldcore removal kinds (kill/melt), never as
  fight detail; trick-dismissal mFlees are not distinguished
  from break-line mFlees in resolve rows (bounded residual, see
  Stage 2 scope); the "nearest-first draft keeps re-pulling
  Haven-near wounded" mechanism is a hypothesis from the
  re-meet asymmetry, not a measured draft trace.

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. STAGE 2 of this run (defender finish, pre-registered above)
   — pending at the time this Stage 1 record is committed.
2. The residual mill: met-below-line phantoms (204 defender
   events, 877 re-meets) that narrow (a) deliberately leaves
   untouched — field-manufactured (72 entities) and toll-fed
   remnants keep echoing. Whether defenders should finish a
   crippled beast they MEET (not just one they drop) is a
   separate rule with its own loot/ledger scale, and likely
   needs Steve's design ruling before any arm touches it.
3. Defender-fight narration repetition: the awayNews lines for
   defender fights are two boilerplate sentences repeated
   dozens of times (see Sense) — a narration blank, not a
   mechanics blank.
4. The 1815 near-immortality question (is surviving-core
   near-immortality intended?) — this run's fates (87/108
   still-present) add weight but do not settle it; still a
   Steve ruling.

scale-onramp stays converging (NOT converged): Stage 1 is a
DIAG — it names the rule precisely, but no lever moved yet,
the full seat is still unreached, and wave 5 is still 0/8.
The standing directive stands.
food-economy untouched (sibling loop B).
Convergence state: converging.

[STAGE 2 PENDING — this record will be extended by the Stage 2
commit, or closed as DIAG-only if Stage 2 NO-GOs. The
pre-registration above binds that judgment.]
