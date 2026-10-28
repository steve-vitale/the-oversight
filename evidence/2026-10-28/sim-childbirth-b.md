# sim-childbirth-b — a births band for child pantry eats: DIAG-NO-GO (structural, not a policy artifact)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T0444Z,
axis food-economy, arm sim-childbirth-b. Base: master at worktree
creation (outflowzero lineage; prereg commit d40488d7d, instruments
commit 4b65f6275). Measurement only: zero src/js changes, no
default flips, no lever. Judged ONLY against
evidence/2026-10-28/sim-childbirth-b-prereg.md, committed BEFORE
any judged probe as d40488d7d.

## Verdict against the pre-registered bar: DIAG-NO-GO

| leg | result |
|-----|--------|
| G1: >= 1 unscripted `npc-child-pantry` record, kcal > 0, units == 1 | 0 records, 0 calls, all 8 seeds — FAIL |
| G2: record on a seed with a positioned home roster child | n/a (no record, no home child anywhere) — FAIL |

Per the prereg's confirm rule, NO confirm band was spent: a
DIAG-NO-GO with a counted structural explanation has nothing to
confirm. No scripted children were counted as unscripted — the
fixture from outflowzero is not re-judged here, and no fixture
ran in this arm at all.

## What the band found: children exist in the world, never at your fire

The births band WORKED as a band — it found children, and it
found a real birth — and still recorded zero child pantry eats,
because the children and the pantry live in different villages
that the turn engine never connects.

| seed | days | end | home children start/end | distant villages generated | distant living children | distant living birthDay members | child calls/records |
|------|------|-----|-------------------------|----------------------------|-------------------------|----------------------------------|---------------------|
| 10410 | 300 | survived | 0 / 0 | 7 | 12 | 0 | 0 / 0 |
| 10411 | 268 | village-lost | 0 / 0 | 3 | 3 | 0 | 0 / 0 |
| 10412 | 300 | survived | 0 / 0 | 3 | 5 | 0 | 0 / 0 |
| 10413 | 300 | survived | 0 / 0 | 1 | 2 | 0 | 0 / 0 |
| 10414 | 21 | village-lost | 0 / 0 | 0 | 0 | 0 | 0 / 0 |
| 10415 | 159 | village-lost | 0 / 0 | 6 | 8 | 0 | 0 / 0 |
| 10416 | 22 | village-lost | 0 / 0 | 2 | 3 | 0 | 0 / 0 |
| 10417 | 300 | survived | 0 / 0 | 7 | 7 | 0 | 0 / 0 |
| **pooled** | **1670 village-days, median 300** | | **0 / 0 in 96 roster slots** | **29** | **40** | **0** | **0 / 0** |

Home roster ages at end: minimum 19 on every seed (19-71
overall) — the home roster never held a child at setup or at
end, on any seed. Home roster size only shrank (12 -> 1-9)
as villagers died; no arrival, no birth, no child ever joined
it.

And yet the world is full of children: 40 living children
across the 29 distant villages the competent policy approached
(about 30% of distant rosters, exactly the generation rate).
Plus one REAL birth, in the game's own words, from seed 10417:

> "👶 A baby was born to Nora on day 293 — still unnamed. They
> say they're holding the name." (Ashford village news)

So the 270-day gate is not hypothetical: a village approached
late (Ashford, day 296) did roll a birth in its post-270
window. But the end census shows Ashford with 7 roster members,
6 living, 0 living members carrying a `birthDay` — the day-293
baby did not survive to the end census. The corpus does not
retain member-level death records, so this is inference from
counts, not a named record: one Ashford member died between the
birth and the end census, and no living member carries a
birthDay. Either way the baby never ate from any pantry: it
lived (if at all) in Ashford's abstract roster, where food is
a scalar `pantryKcal`, not pantry stacks, and where no villager
ever takes a turn.

## Why: the code-read explanation (verified, not assumed)

The prereg's structural hypothesis survived the band intact.
All references src/js/game.js unless noted:

1. The ONLY birth code is `simVillageDay` (~10068-10101):
   `village.day >= 270 && Math.random() < 0.005`, given >= 2
   partnered adults aged 18-40, pushes a baby onto
   `village.roster`. It runs ONLY for distant villages — via
   `catchUpSim` (on first approach) and `tickJoinedVillage`
   (the joined village, from endDay). It NEVER runs on
   `state.village`, the player's home village.
2. Distant villages start with children (`genVillageRoster`,
   ~9894-9917: 30% ages 1-14) — but those children live in
   `otherVillages[].roster`, a separate array.
3. The child-eat door (`npcChildAction` hunger branch, ~20878:
   hunger > 60, fear <= 70, pantry holds a kcal>0 stack -> eat
   exactly 1 unit of the first such stack, hunger -30) is
   reachable ONLY through `npcTakeAction` (~20651) from
   `villagerTurn` (~20537), which iterates ONLY
   `state.village.roster` ids holding a grid position.
   `npcsOnNode` (~16327) and `ensureVillagerPositions`
   (~16358) likewise filter ONLY `state.village.roster`.
   Distant children never get positions, never take turns,
   never touch a pantry — on any policy, not just competent.
4. The home roster cannot gain a child by any other path:
   `genCharacter` draws age from occupation bands with
   `minAge >= 19` (~1055-1056); `npcAge` falls back to 30 for
   unknown ids (~17867); ages only rise. Visitors, arrivals
   and succession all draw from the same adult generation.
5. Canon note (stated, not invented): docs/KIN.md says
   "Children of KEPT adults (villagers who remained) stayed
   with the villages and grew up normally." The code does not
   implement that sentence for the home village: kept adults'
   children are never generated into the home roster, and no
   home birth path exists. This is a fiction/code gap, not a
   policy gap — a different policy cannot fix it.

## The village without children (sense note)

What 1,670 village-days without a child at the fire look like:
a dozen adults who eat, fight, and die as adults. Deaths on
the band (104 total): the arena 53, contests 12, sickness 8,
monsters 6, wounds that wouldn't close 5, combat 4, the
expedition 3, ambush 3, starvation 3, the rest singletons.
Nobody is ever fed first because they are small; nobody tugs
a sleeve hungry; nobody is named by a parent holding a name
for the bearer — except once, far away, in Ashford, where a
baby was born on day 293 and was gone before the census.
The world HAS children (40 of them, in villages you visit),
but your fire is adults-only from day 1 to day 300. That is
the blank: the home village is a village with no next
generation in it, and nothing in play ever changes that.

## Wall numbers (reported, not judged)

National 0/8, table 0/8, wins 0/8 (competent-nofeast,
SEATDRIVE=0 — a pre-seat band, so zeros are the regime, not
a finding). Wave reach: max wave 4 (2/8 seeds), wave 5 0/8.
Median survival 300d (4 seeds hit the 300d cap; 4 villages
lost at days 21, 22, 159, 268). Death-cause shares above.

Telemetry-deviation check (loop-B body step 10):
`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-28/sim-childbirth-b-corpus/*.json' --metrics
national,table,wins,exiled` returns 3 LOUD lines (national
12 -> 0, table 16 -> 0, wins 16 -> 0). All three are REGIME
artifacts: the baseline is a seat-drive band and this band
is competent-nofeast with SEATDRIVE=0, so 0 national/table/
wins is the expected substrate — same class as the
outflowzero note. Baseline NOT rolled.

## Named next instrument (prereg candidate CONFIRMED)

A home-village birth path mirroring `simVillageDay`'s birth
block into the home village's daily tick. A home-born baby
WOULD reach the door: a `state.village.roster` id gets grid
positions via `ensureVillagerPositions` and turns via
`villagerTurn`, so its hunger branch could fire unscripted.
Distant births alone never can — that half of the problem is
closed by this band, not open. This is a GAME CHANGE, not a
measurement, and it changes who lives in Haven (KIN canon
supports kept adults' children existing, but the design call
— births at home, children at generation, or both — is
Steve's, not this arm's). No code was changed here.

Backlog line for the coordinator to append to
hidden_files/sim-findings.md (not appended by this worker:
loop A is live on the shared goal files, and this worker's
area is its worktree):
`- [open] 2026-10-28 — food-economy/childbirth — HOME
VILLAGE NEVER HAS CHILDREN, SO CHILD PANTRY EATS ARE
STRUCTURALLY IMPOSSIBLE UNSCRIPTED (lever loop B arm
sim-childbirth-b, run fleshout-loop-b-20261028T0444Z,
evidence/2026-10-28/sim-childbirth-b.md, DIAG-NO-GO): 0
children in 96 home roster slots over 1,670 village-days
(300d cap) while 40 children lived in 29 approached distant
villages plus one real post-270 birth (Ashford, day 293,
seed 10417, gone before end census); the only birth code
(simVillageDay, game.js ~10068) runs solely for distant
villages and villagerTurn/npcsOnNode/ensureVillagerPositions
filter state.village.roster only, so distant children never
take turns or touch a pantry. Named next instrument: a
home-village birth path (game change, Steve-call — KIN says
kept adults' children stayed with the villages, but no code
implements it at home).`

## Method notes and caveats (honest)

- Corpus: evidence/2026-10-28/sim-childbirth-b-corpus/ (8
  files, sweep exit 0). Instrument:
  scripts/sweep-childbirth-b.js (stockdoors capture reused
  UNCHANGED + home setup/end census + distant census);
  analyzer scripts/analyze-childbirth-b.js (verdict
  DIAG-NO-GO, exit 0 on a complete corpus).
- Reproducibility caveat (observed, not judged): a single-seed
  diagnostic re-run of seed 10417 (scripts/
  diag-childbirth-10417.js, same seed/policy/horizon/capture)
  did NOT reproduce the sweep's Ashford (roster 9 vs 7, day
  298 vs 296, no birth news). The judged record is the sweep
  corpus, internally consistent across its 8 seeds; the
  diagnostic run is not a reproduction and was not used to
  judge. Single-seed re-runs of multi-seed single-process
  sweeps should not be treated as reproductions until the
  harness's "never two harnesses in one process" rule and the
  sweep pattern are reconciled — a harness note, not a
  finding about births.
- The distant-births census counts LIVING members with
  `birthDay` set at end; a birth that dies before the end
  census is visible only via news lines (as Ashford's was).
  Future bands should snapshot distant rosters at approach
  time, not only at end, if birth survival is the question.

## Metric review (section 14)

The bar worked as written: G1/G2 cleanly separated "a real
child eat happened" from "children merely exist," and the
DIAG-NO-GO branch carried exactly the explanation the prereg
asked for (code-read cause + village-days + named next
instrument). No definition proved wrong; no revision proposed
for the next run. One instrument improvement for the next
run (not a metric change): snapshot distant rosters at
approach as well as at end, so a birth's survival is a
record, not an inference from counts.

## Panel statement (section 15)

No balance-panel comparison exists: measurement only, no
lever, no game-code change, no before/after leg. The standing
panel exception applies — corpus is census rows with no
panel-ingest mode, stated explicitly, no panel faked. (Same
exception as outflowzero.)

## Proof

- scripts/sweep-childbirth-b.js + scripts/analyze-childbirth-b.js
  (committed 4b65f6275a54835906823dca8abfb77145917d74);
  diagnostic scripts/diag-childbirth-10417.js (committed
  with this evidence).
- Analyzer output on the 8-file corpus: verdict DIAG-NO-GO,
  G1 0, home children 0/0, distant villages 29, distant
  children 40, distant living birthDay members 0, birth news
  lines 1 (Ashford day 293), village-days 1670, median
  survival 300, national/table/wins 0/8, wave max 4.
- Prereg: evidence/2026-10-28/sim-childbirth-b-prereg.md
  (d40488d7d3618323bdea79f2bdc75b71ec7a8e36, before any
  judged probe). This evidence file + corpus + diagnostic
  script committed below; commit hash recorded in the
  worker's final report.
