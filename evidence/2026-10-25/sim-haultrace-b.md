# sim-haultrace-b — first traces for the haulinvert-b code-proven haul classes

Run: oversight-flesh-out-loop-b-20261025T1849Z, arm sim-haultrace-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-haultrace-b`,
branch sim-haultrace-b.

Status: PRE-REGISTERED — the header below was fixed before any pilot
in this run. This arm proves the INSTRUMENT ONLY (first traces for
the four code-proven classes). It does NOT re-judge haulinvert-b's
GO, haulcount-b's GO, or any rot verdict, and it does NOT judge any
verdict on the pilot seeds (fresh seeds 9410–9417, not a deciding
corpus).

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder). The four classes come from the haulinvert-b derivation
  table (evidence/2026-10-25/sim-haulinvert-b.md), measured from
  every stockPantry/depositPantryPieces call site — not invented
  here. The counting definitions of sim-haulcount-b
  (evidence/2026-10-25/sim-haulcount-b.md) and the inversion rule
  of sim-haulinvert-b are adopted unchanged.

## PRE-REGISTRATION (binding — judged only against this, no re-scoring)

- Step 1 (corpus search, always): search ALL committed per-seed corpora you can find under evidence/ (haulinvert-b-corpus, haulcount-b-corpus, perseed-deathrow-b, and any other haulcount/haulinvert corpora) for a first trace of EACH of the 4 classes (Expedition meat, Buried cache, Genesis fruit, custom haulLabels) under the inverted predicate. Record per class: searched corpora + file count, FOUND (seed + file + trace line, verbatim) or zero traces.
- Step 2 (bounded pilot, only for classes with zero traces in Step 1): at most 8 seeds, reusing the existing haulcount recorder + inverted predicate (no new recorder, no new game tap), on a substrate you state with reasons as most likely to exercise that class. If no plausible policy/substrate exercises a class, say so explicitly and report NOT-FOUND without running a junk pilot — a justified NOT-FOUND is a result, not a failure.
- GO for this arm: a verdict recorded for ALL 4 classes (FOUND with trace, or NOT-FOUND with corpora searched + pilot tried or reasoned no-pilot), PLUS a stated adoption verdict: can the inverted predicate now be adopted as the primary haul measure in the next deciding rot corpus (yes/no + exactly what remains unproven). Tribute grain must still be reported in its own bucket, never folded into aid, in any new trace.
- This arm is instrument-only: ZERO src/js game changes. No behavior line moves, no new Game field. A counting-only tap is NOT authorized here (reuse only).
- Balanced panel (§15): no before/after lever pair exists in this arm; the compare-mode outputs are the comparison of record; say so in the evidence file.

## Step 2 plan (fixed BEFORE the pilot ran)

Classes with zero traces after Step 1: Buried cache, Genesis
fruit, custom haulLabels. (Expedition meat was FOUND in Step 1 —
no pilot for it; the pilot watches it secondarily.)

- Buried cache: NO-PILOT (reasoned, not skipped). The deposit
  path is betrayal.js inviteReward kind='cache' (1 of 4 picks),
  reached only via acceptInvite → resolveInvite — a player
  conversation verb. Verified this run: acceptInvite has NO
  production caller anywhere in src/js (only journey/test
  scripts call it directly), and NO sweep policy calls
  acceptInvite or pendingInvite. The sweep instrument supports
  only leadfeast/belongfeast, neither of which accepts invites.
  A leadfeast pilot cannot exercise this class, so running one
  for it would be a junk pilot.
- Genesis fruit: NO-PILOT (reasoned, not skipped). The pantry
  path is game.js checkGenesis: a genesis_seed must be obtained
  (alien loot), planted at a haven tile via the player verb
  plantGenesis, and the player must be ELSEWHERE when it
  yields (standing on the tile sends the fruit to the pack,
  not the pantry). Verified this run: NO policy calls
  plantGenesis or touches genesis_seed (only a godpath test
  does). No sweep substrate exercises it.
- Custom haulLabels: PILOT (8 seeds, the Step 2 budget). This
  class is different from the two above: its mechanism is
  NPC-autonomous, not a player verb. A villager with a
  remembered carcass site gets a mapmem HAUL objective,
  travels, butchers, and returns via
  villager-objectives.js:1521 stockPantry(hk, hn) where hn =
  ho.haulName = the site's haulLabel (monsterDisplayName for
  monsters, common name for animals) or 'Hauled meat' when
  falsy. And the knowledge gate does NOT block animal
  carcasses: mapmemFoodKnown returns true for kind 'animal'
  with no gate — so an animal-carcass haul deposits a custom
  label (e.g. an animal common name) with no reveal step.
  Substrate, chosen for maximum exposure: leadfeast / pd1,
  100d death-aware, fresh seeds 9410–9417, HAULCOUNT_TRACE=1.
  Reasons: (1) mapmem hauls run under leadfeast without any
  policy action; (2) pd1's depri drain pulls the pantry down,
  tripping the HAUL-objective need-gate (pantry < 5000 or
  hunger > 50, villager-mapmem.js) more often than pd0;
  (3) pd1 survived 100d on all 8 haulinvert pilot seeds, giving
  carcasses and returns the full horizon; (4) TRACE=1 records
  invHaul flags, so any label found here is a trace UNDER
  the inverted predicate proper, not just a name mention.
  The pilot also watches Expedition meat secondarily: a new
  haulinvert-trace instance would upgrade that class from
  "found in a non-inverted recorder" to "found under the
  inverted predicate."

## STEP 1 RESULTS — corpus search (completed before the pilot)

Scope actually searched (all committed JSON under evidence/,
because per-seed corpora live in JSON; design mentions in .md
are not traces and are reported separately below):

- evidence/2026-10-25/haulinvert-b-corpus/: 22 files (16
  per-seed + 2 summaries + 4 traces). The 4 traces hold 1,331
  stored events; zero events carry any of the 4 class names.
- evidence/2026-10-25/haulcount-b-corpus/: 22 files (16
  per-seed + 2 summaries + 4 traces). Zero events carry any of
  the 4 class names.
- evidence/2026-10-25/perseed-deathrow-b/: 41 per-seed files.
  Zero mentions of any of the 4 class names (deathRows only —
  no deposit events exist in these files at all).
- All other haulcount/haulinvert corpora: NONE exist. The two
  corpora above are the only ones matching those names.
- Full-tree sweep: all 23,286 committed JSON files under
  evidence/ were scanned for the three literal names
  ('Expedition meat', 'Buried cache', 'Genesis fruit'), and
  all 40 committed *trace*.json files were enumerated by
  stock-event name (1,944 stock events total). Every deposit
  label set was also enumerated from pantryByLabel /
  stockPantryMeat arrays across the tree.
- Non-JSON design mentions are NOT traces: 'Genesis fruit'
  appears outside JSON only in evidence/2026-10-25/
  sim-haulinvert-b.md and sim-food-round-1752.md (design
  discussion of the class itself). No transcript, log, or
  summary outside JSON carries a Genesis fruit deposit.

### Per-class Step 1 verdicts

- Expedition meat: FOUND (deposit events, non-inverted
  recorders — no haulinvert trace contains it yet). 7 files,
  9 events, all stockPantry deposit records:
  - evidence/2026-10-19/journey-deepening-r20-competent-9301.json
    (seed 9301, policy competent): stockPantryMeat array,
    `{"day": 71, "name": "Expedition meat", "kcal": 500}`
  - evidence/2026-10-19/journey-deepening-r20-deed-seeking-9301.json
    (seed 9301, policy deed-seeking):
    `{"day": 72, "name": "Expedition meat", "kcal": 500}`
  - evidence/2026-10-19/journey-deepening-r21-competent-9401.json
    (seed 9401, policy competent):
    `{"day": 55, "name": "Expedition meat", "kcal": 75}`
  - evidence/2026-10-19/perseed-killaudit/belongfeast-99103.json
    (seed 99103, policy belongfeast): deposit list,
    `{"day": 151, "label": "Expedition meat", "kcal": 1250}`,
    corroborated by pantryByLabel `"Expedition meat": 1250`
  - evidence/2026-10-20/journey-deepening-r23-competent-9603.json
    (seed 9603, policy competent):
    `{"day": 30, "name": "Expedition meat", "kcal": 70}` and
    `{"day": 70, "name": "Expedition meat", "kcal": 70}`
  - evidence/2026-10-20/journey-deepening-r25-competent-9802.json
    (seed 9802, policy competent):
    `{"day": 38, "name": "Expedition meat", "kcal": 75}` and
    `{"day": 42, "name": "Expedition meat", "kcal": 75}`
  - evidence/2026-10-20/journey-deepening-r25-competent-9804.json
    (seed 9804, policy competent):
    `{"day": 101, "name": "Expedition meat", "kcal": 70}`
  Under the inverted predicate this name is NOT in the
  exclusion list, so every one of these deposits counts as a
  haul by construction. What remains unproven for this class
  is only an instance recorded by the haulinvert recorder
  itself (invHaul flag) — the pilot watches for one.
  Corroboration (not traces): spoilage narration in 6
  pitstaff/w5gate/awayvoice files ("The village threw out
  spoiled stores: Foraged food, Expedition meat, Expedition
  haul...") proves Expedition meat items sat in pantries
  long enough to spoil — the deposit story, not a deposit
  event.
- Buried cache: ZERO deposit traces. 13 mentions across 7
  JSON files, all corroboration, none a deposit event:
  spoilage narration (journey-social-life-r6-30303.json:
  "The village threw out spoiled stores: Buried cache,
  Foraged food.") and replay-summary pantry diffs
  (conversation-final-r7-*, favor-final-r3-*,
  haven-access-*: pantry item paths whose 'after' name is
  'Buried cache', including 'Buried cache (dried)'). Those
  prove a Buried cache item reached a pantry in scripted
  replay runs — but no recorder ever captured its deposit
  event, and no haulinvert/haulcount trace contains it.
- Genesis fruit: ZERO traces, ZERO mentions in all 23,286
  JSON files. No deposit event, no pantry item, no narration
  line anywhere in the committed corpora. (Outside JSON,
  only the two design mentions above.)
- Custom haulLabels: ZERO traces. Definition applied: a
  stock deposit name outside the census set (Foraged food,
  Game meat, Garden harvest, Fish catch, Expedition haul,
  Aid crew haul, Snared meat, Pit meat (X), Hauled meat,
  Emergency hunt meat) AND outside the exclusion set (exact
  names + 'Aid from ' / 'Remedy stores from ' prefixes).
  Across all 40 trace files (1,944 stock events) the only
  names are census + exclusion names — no monster display
  name, no animal common name, no other label. Across all
  pantryByLabel / stockPantryMeat label sets tree-wide, the
  only non-census, non-exclusion label is 'Expedition meat'
  itself (7 files above). 'Pit meat (Wild Boar)' appears in
  label sets but matches the census Pit meat (X) pattern.
  So no custom label has ever been recorded by any recorder.

## STEP 2 RESULTS — bounded pilot (custom haulLabels)

Pilot corpus: evidence/2026-10-25/perseed-haultrace-b/ — 8
per-seed files + 8 trace files + 1 sweep summary. Anchor
2018a499 (the instrument tip at pilot time). Substrate as
pre-registered: leadfeast / pd1, 100d death-aware, fresh
seeds 9410–9417, HAULCOUNT_TRACE=1, reused
scripts/sweep-haulinvert-b.js unmodified. 7 seeds ran the
full 100d; seed 9412's village was lost at day 44 (death-aware
stop, as designed).

### Per-seed pilot table (exact; inv == haul on every row)

seed | days | haulActions/haulKcal (= inv) | stockExcl actions/kcal | homeExcl (tribute) actions/kcal | foreign | deposits | wave | national | win
9410 | 100 | 182 / 85,333 | 5 / 11,930 | 1 / 2,920 | 0 | 188 / 100,183 | 1–4 | yes | no
9411 | 100 | 229 / 100,485 | 5 / 8,697 | 7 / 30,000 | 0 | 241 / 139,182 | 1–4 | yes | no
9412 | 44 | 166 / 81,411 | 0 / 0 | 0 / 0 | 0 | 166 / 81,411 | 1–3 | no | no
9413 | 100 | 153 / 106,061 | 2 / 1,870 | 1 / 4,000 | 0 | 156 / 111,931 | 1–4 | no | no
9414 | 100 | 192 / 104,417 | 4 / 7,388 | 0 / 0 | 0 | 196 / 111,805 | 1–4 | yes | no
9415 | 100 | 239 / 171,282 | 4 / 7,639 | 1 / 4,000 | 0 | 244 / 182,921 | 1–4 | yes | no
9416 | 100 | 195 / 115,139 | 7 / 16,035 | 6 / 29,000 | 0 | 208 / 160,174 | 1–4 | yes | no
9417 | 100 | 323 / 181,236 | 7 / 12,196 | 16 / 67,000 | 0 | 346 / 260,432 | 1–4 | yes | no

### Trace scan (the verdict-bearing result)

8 traces, 2,076 stored events in total (per-file: 243,
275, 167, 198, 253, 304, 241, 395 — max 395, well under
the 1000 cap, so event-level recomputation is complete). Stock-event names, exhaustive:
Foraged food 1,122; Fish catch 364; Snared meat 60;
Expedition haul 31; Garden harvest 1; Pit meat
(White-tailed Deer) 4, (Wild Boar) 3, (Raccoon) 3; Aid from
Stonebridge 10, Emberhold 8, Thornfield 7, Ashford 3;
System-replicated stew 2, System-replicated (enthusiastic)
meal 1; Trial feast 3.

- Custom haulLabels: ZERO. No monster display name, no
  animal common name, no other label in any of the 2,076
  events. The need-gated mapmem haul either did not complete
  on any of these 8 runs, or completed only for unrevealed
  flesh (which bypasses stockPantry as 0-kcal direct pantry
  pushes and leaves no deposit event at all).
- Expedition meat: ZERO in this pilot — no upgrade to an
  inverted-predicate trace instance. The class stays FOUND
  via the Step 1 recorders only.
- Buried cache / Genesis fruit: ZERO, as expected from the
  no-pilot reasoning (no invite accepts, no genesis plants
  can occur under leadfeast).
- Stock-excluded names are exactly the aid/System set
  (Aid from Stonebridge/Emberhold/Thornfield/Ashford,
  System-replicated stew/(enthusiastic) meal, Trial feast).
  No unexplained excluded name, no unexplained newly-counted
  name — because nothing new was counted: inv == haul
  exactly on all 8 files, delta +0/+0, the same zero-delta
  shape as the haulinvert pilot itself.

## Final verdict table

class | verdict | basis
Expedition meat | FOUND | 9 deposit events in 7 files (Step 1, non-inverted recorders; verbatim lines above). No haulinvert-trace instance yet.
Buried cache | NOT-FOUND as a trace (pilot: reasoned no-pilot) | Zero deposit events in all 23,303 JSON files; corroboration only (spoilage narration + replay pantry diffs). No sweep substrate can exercise acceptInvite.
Genesis fruit | NOT-FOUND (pilot: reasoned no-pilot) | Zero mentions in all 23,303 JSON files; only 2 design mentions outside JSON. No sweep substrate plants genesis_seed.
Custom haulLabels | NOT-FOUND (pilot: tried, 8 seeds) | Zero non-census, non-exclusion stock names in all 40 pre-existing traces (1,944 events) AND all 8 pilot traces (2,076 events). The substrate genuinely runs mapmem hauls; the label simply never fired.

GO for this arm: MET. A verdict is recorded for all 4
classes, each with its corpora + file counts (Step 1) and
either a trace, a pilot tried, or a reasoned no-pilot.

## Adoption verdict

YES — the inverted predicate can now be adopted as the
primary haul measure in the next deciding rot corpus, with
exactly this remaining unproven:

1. No haulinvert-trace instance of Expedition meat yet
   (FOUND via other recorders; the inversion counts it by
   construction, but the flag-level proof — an event with
   invHaul true and name 'Expedition meat' in a haulinvert
   trace — has not been captured).
2. Buried cache, Genesis fruit, and custom haulLabels have
   never produced a deposit event in ANY recorder, so their
   adoption is by code-reading + construction only: the
   inversion counts them IF they fire, and the pilot proves
   it does not misfire on anything else. The first future
   trace showing one of these names is the confirmation
   event for that class, not a predicate fix — exactly as
   haulinvert-b stated.
3. The foreign bucket (non-home pieces deposits) is still
   unexercised everywhere (0 on all 8 pilot files, 0 on all
   16 haulinvert pilot files). It is proven by code reading
   only.

What adoption does NOT need: another pilot on the same
substrate expecting a different number. The zero-delta shape
(inv == haul) held on 16 haulinvert pilot files + 8 new
pilot files, and the exclusion side is fully explained on
every trace. Re-running leadfeast seeds to chase a rare
label would be grinding a substrate that has already said
no twice.

## Tribute-bucket check

Tribute grain is reported in its own bucket on every pilot
file and every pilot trace, never folded into aid and never
into hauls. Per-file home-excluded (tribute pieces)
actions/kcal: 9410: 1/2,920; 9411: 7/30,000; 9412: 0/0;
9413: 1/4,000; 9414: 0/0; 9415: 1/4,000; 9416: 6/29,000;
9417: 16/67,000. Trace-level check: every home-excluded
pieces event carries a 'Tribute grain from X' name
(Emberhold 18, Stonebridge 8, Thornfield 6 across the 8
traces), and no stock-excluded event carries a Tribute
name. The 67,000-kcal file (9417) is the standing warning
from haulinvert-b, confirmed again: most of the
deposits-minus-hauls gap on tribute files is tribute grain,
not aid — any future summary that collapses the buckets
will misread the pantry story.

## SENSE-TESTING: what the traces, and their absence, mean

The pilot villages read like villages. Day-1 forages land,
trappers bring species-named meat (White-tailed Deer, Wild
Boar, Raccoon — Wild Boar is new against the haulinvert
pilot's species list, the same trap lines working on new
ground), named villages send aid (Stonebridge, Thornfield,
Ashford, Emberhold — Ashford is new here too), and tribute
grain arrives in whole stacks (up to 67,000 kcal on one
file: a subordinate village's obligation, not a haul, and
the buckets keep it honest). Six of eight villages reached
national; none won; one died at day 44. That is the
food-economy story the inverted predicate now measures:
hauls in the 81,000–181,000 kcal range per 100 days, with
aid and tribute visible beside them instead of silently
mixed in.

The absences are the honest part. Expedition meat fired in
older probes (days 30–151, 70–1,250 kcal — a killer's
butchered known-safe meat coming home) but not in these 8
fresh runs: it is a sometimes-event, gated on a revealed
kill, not a staple. Buried cache and Genesis fruit never
fired because no bot in the sweep's policy set ever walks
out on an invite or plants an alien seed — those are
player verbs, and a bot corpus will never show them no
matter how many seeds it burns. That is not a defect in
the predicate; it is a fact about what bot corpora can
prove, and it bounds the adoption verdict above. Custom
labels are the subtler absence: animal carcasses ARE
known-safe by default, so the gate is not knowledge — it
is the haul itself. Either villagers' need-gated carcass
hauls rarely complete within 100 days (the pantry usually
stays above the need line under leadfeast, and carcasses
rot on a 3-day clock while the round trip runs long), or
the hauls that do complete carry unrevealed monster flesh
that bypasses the deposit recorder entirely. Both shapes
point the same way: the label's absence says more about
carcass-haul rarity than about the predicate's coverage.
The predicate stands ready for the day a label fires; the
pilot's job was to check the trap is set, not to force the
catch.

## Metric review (filled after the results, §14 — revisions apply to the NEXT run)

- "FOUND" NEEDS A RECORDER QUALIFIER. This run's Expedition
  meat verdict is FOUND-via-other-recorders, not
  FOUND-under-the-inverted-predicate. Future first-trace
  arms should state the recorder in the verdict itself
  (found-in-X), because a name in a probe array and a name
  in the deciding recorder are different strengths of proof.
  The adoption verdict above carries this distinction.
- THE PILOT BUDGET WAS SPENT ON THE RIGHT CLASS ONLY.
  Buried cache and Genesis fruit got reasoned no-pilots,
  and the pilot's zero on both is consistent with — not
  evidence for — those reasonings. A future arm that wants
  a Buried cache or Genesis fruit trace must NOT use the
  sweep policies: it needs a bespoke harness that accepts
  invites or plants genesis seeds (a journey-style script,
  not a sweep), and its pre-registration should say so.
- CUSTOM-LABEL PILOTS NEED A NEED-GATED SUBSTRATE. If a
  future arm chases custom labels again, leadfeast/pd1 at
  100d is now a twice-tried substrate with zero hits. The
  next attempt should change the conditions that gate the
  haul — a hungrier village (pantry under the 5,000-kcal
  need line), a longer horizon, or a policy that walks
  villagers past carcasses — and pre-register that change
  as the point of the run, not just more seeds.
- TRIBUTE SCALE KEEPS GROWING. The largest tribute file
  grew from 50,000 kcal (haulinvert pilot) to 67,000 kcal
  (this pilot, seed 9417). The bucket separation is not a
  nicety; at this scale a collapsed "excluded" total would
  swamp the aid signal entirely on tribute-heavy files.


## Diff review (instrument-only evidence)

- ZERO src/js changes in this arm: no game file touched, no
  new Game field, no counting tap (none authorized, none
  used). The pilot reuses scripts/sweep-haulinvert-b.js and
  scripts/sweep-haulcount-b.js exactly as committed.
- scripts/test-haultrace-b.js: NEW FILE (proof only — search
  coverage + verdict recomputation on the committed corpora
  + pilot corpus).
- evidence/2026-10-25/perseed-haultrace-b/: NEW — pilot
  per-seed + trace files (never /tmp).
- evidence/2026-10-25/sim-haultrace-b.md: NEW (this file).
- Nothing else touched.

## Proof

- node --check on the proof test: clean.
- node scripts/test-haultrace-b.js => 172 PASS, 0 FAIL
  (T1 static + T2 verdict recomputation on the committed
  corpora + T3 pilot corpus closure/tribute/trace checks).
- node scripts/test-haultrace-b.js --full => 174 PASS, 0 FAIL
  (adds the whole-tree literal scan: 23,303 JSON files under
  evidence/; Genesis-fruit files 0, Buried-cache files 7,
  Expedition-meat files 19 — file-mention counts, not event
  counts; the event-level verdicts are the T2 checks above).
- Pilot determinism: not re-run (no before/after pair in
  this arm); the sweep's own trace re-run property from
  haulinvert-b stands, and the pilot corpus is committed
  byte-as-run.
- Node harness: the pilot reuses scripts/sweep-haulinvert-b.js
  unmodified (sim-harness loadGame/setupGame/runDays;
  Math.random seeded before eval by the harness). No
  Game.save stub. No jest run (no jest suites touch this
  instrument; the proof test is the designated suite).
- Standing verdicts re-judged: NONE. haulinvert-b GO,
  haulcount-b GO, and all rot verdicts stand. The pilot
  seeds (9410–9417) are fresh and carry no verdict.

## Scope compliance

Instrument reuse + proof test + pilot corpus + evidence
only. No push, no version bump, no live verification.
Merged locally, pending ship, by the coordinator.
Balanced panel (§15): no before/after lever pair exists in
this arm; the compare-mode outputs are the comparison of
record — there is no lever landing to panel, and no verdict
is re-judged here.
