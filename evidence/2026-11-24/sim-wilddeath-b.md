# What actually kills a veteran "in the wild" — Loop B, run fleshout-loop-b-20261124T2230Z, arm sim-wilddeath-b (DIAG)

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes.
Anchor: HEAD `6b837b1c1` at leg time (instrument commit; prereg
`9cca2b33b` on `b48b195db`). Instrument: the standing-gearready
instrument reused VERBATIM as the base, plus a new wilddeath
capture layer (`scripts/wilddeath-b-instrument-20261124.js`):
call-through wraps on `playerDeath` and `registerDeath` recording
the cause argument AS PASSED, a stack trace naming the call site,
the live `tbfight`, the scholar's live where-context, and a say
tail. Proof `scripts/test-wilddeath-b-20261124.js` 11/11 before
the leg (re-run green on the branch tip after it — see Proof).
Policy `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Horizon 150 days, death-aware. Seeds 109447–109462
(16) — a FRESH band on identical spec. Balanced panel (§15):
INAPPLICABLE — a census, no before/after change.

Prereg: `evidence/2026-11-24/sim-wilddeath-b-prereg.md` (committed
before any judged sim). Staging (§9): pilot = seeds 109447–109454
(instrument fires, wild deaths captured with stacks, veteran join
works), confirm = 109455–109462, both judged against the same
frozen bars. One runtime restart is NOT in this arm's story — the
flap is (see Infrastructure): the pilot's seed 109450 run finished
in memory twice with its file write refused (0-byte file left
behind both times); it completed on the next clear window. No seed
was run twice to completion — a seed counts only when its file
parses, and the driver refuses to overwrite.

## Verdict — DIAG-GO (all 4 frozen bars pass)

| # | Frozen bar | Result |
|---|-----------|--------|
| 1 | Classification completeness — every "the wild" veteran death carries exactly one taxonomy class; 0 unclassified, 0 wild veteran deaths without a death row | **PASS — 18/18 classified, 0 unclassified** |
| 2 | Instrument health — 0 instrument errors; 0 parse errors; proof green before the leg and on the tip; determinism replay byte-identical | **PASS — 0 errors; seed 109447 run twice, every attribution stream identical (files differ only in the RUN slot)** |
| 3 | Dominant wild-killer named with counts and coverage, every death carrying its evidence | **PASS — WILD-TB-FIGHT, 18/18 veteran wild deaths (100%), 95/95 of all wild deaths; every death names its monster(s) + wave(s)** |
| 4 | Veteran census reproduced — every wave-4+ killer carries exactly one terminal status; 0 unclassified | **PASS — 35/35 killers classified, 0 unclassified** |

## The answer, in one line

**"The wild" is not exposure, not an expedition leg, not a
wandering encounter. It is a lost played field fight against a
monster.** Every one of the 95 wild deaths on this band — all 18
veteran ones and all 77 non-veteran ones — is a scholar losing a
turn-based field fight (`tbEnd`, game.js:48334) to a monster, with
the cause stamped by `tbFightDeathCause` (game.js:47978). The
code-level hypothesis in the prereg holds on 95/95 deaths: no
wild death came through the ledger default (0 with an undefined
cause argument), none was a literal 'the wild' passed by hand,
none was a non-scholar death. The census question is answered;
what remains is a fight question, not an attribution question.

## Pooled numbers (16 seeds, this arm's own corpus)

- Killers (wave-4+ blooded): **35** on 14 seeds; 2 seeds blooded
  nobody (109453, 109459). Terminal statuses: dead 27,
  alive-at-end 8, departed 0, unclassified 0.
- Blooding→death (27 dead killers): median **12 days**, max 73,
  min 0; 4 same-day deaths. The veteran window is short: half
  are dead within 12 days of blooding.
- Death-cause split (27 dead killers): **"the wild" 18 (67%)**,
  dehydration 3, contest 2, "a stranger" 2, monster 1,
  "the night" 1. On the vetpair band the wild share was 12/21
  (57%) — the shape holds on a fresh band, slightly heavier.
- Wild deaths (all causes, all victims): **95** on 16 seeds
  (every seed has at least 2). ALL 95 are `player:true` —
  scholar deaths; ZERO non-scholar wild deaths. All 95 classify
  WILD-TB-FIGHT. WILD-DEFAULT 0, WILD-EXPLICIT 0, WILD-TB-OTHER 0,
  WILD-NON-SCHOLAR 0, UNCLASSIFIED 0.
- Wave-4+ kills (deduped log entries only): wave-4 **52**,
  wave-5 **6**.
- Overlap (vetpair census re-proven on the fresh band): **164
  event-overlap days, 13 windows, on 9 seeds**; max 3 living
  veterans at once. The pair is common here, not rare — the
  fresh band overlaps more than vetpair's 92 days on 4 seeds.

## Per-seed table

| seed | days | end | scale | maxW | door | killers | dead/alive | wild | wildVet | w4f | w5f | w4k | w5k | overlap ev |
|------|------|-----|-------|------|------|---------|------------|------|---------|-----|-----|-----|-----|------------|
| 109447 | 150 | survived | regional | 5 | 5 | 3 | 2/1 | 9 | 1 | T | T | 4 | 1 | 29 |
| 109448 | 150 | survived | regional | 5 | 5 | 4 | 3/1 | 6 | 3 | T | T | 4 | 1 | 4 |
| 109449 | 150 | survived | regional | 5 | 5 | 2 | 0/2 | 2 | 0 | T | F | 3 | 0 | 38 |
| 109450 | 150 | survived | regional | 5 | 5 | 4 | 3/1 | 2 | 2 | T | F | 5 | 0 | 29 |
| 109451 | 137 | lost | regional | 4 | 4 | 1 | 1/0 | 8 | 0 | T | F | 1 | 0 | 0 |
| 109452 | 86 | lost | regional | 4 | 4 | 2 | 2/0 | 9 | 2 | T | F | 2 | 0 | 0 |
| 109453 | 90 | lost | regional | 4 | 4 | 0 | 0/0 | 10 | 0 | T | F | 0 | 0 | 0 |
| 109454 | 150 | survived | regional | 5 | 5 | 3 | 2/1 | 2 | 1 | T | T | 7 | 0 | 8 |
| 109455 | 150 | survived | regional | 5 | 5 | 3 | 3/0 | 2 | 1 | T | T | 8 | 1 | 27 |
| 109456 | 146 | lost | regional | 5 | 5 | 2 | 2/0 | 5 | 1 | T | T | 3 | 0 | 5 |
| 109457 | 150 | survived | regional | 4 | 4 | 1 | 1/0 | 4 | 1 | T | F | 2 | 0 | 0 |
| 109458 | 146 | lost | regional | 4 | 4 | 1 | 1/0 | 6 | 1 | T | F | 1 | 0 | 0 |
| 109459 | 97 | lost | regional | 4 | 4 | 0 | 0/0 | 12 | 0 | T | F | 0 | 0 | 0 |
| 109460 | 150 | survived | regional | 5 | 5 | 3 | 3/0 | 9 | 3 | T | T | 3 | 1 | 2 |
| 109461 | 150 | survived | regional | 5 | 5 | 4 | 2/2 | 4 | 1 | T | T | 3 | 2 | 22 |
| 109462 | 150 | survived | regional | 4 | 4 | 2 | 2/0 | 5 | 1 | T | F | 6 | 0 | 0 |

## Attribution table (all 18 wild veteran deaths)

Every row: the victim was the scholar, departed, killed in a
`tbEnd` loss (site `Object.tbEnd @ js/game.js:48334` on all 18),
cause argument the string 'the wild' as returned by
`tbFightDeathCause` (never the ledger default). Fighters = live
`tbfight` size at death (scholar + allies + monsters).
Pending encounter 0/18, at camp 0/18, in tent 0/18.

| seed | veteran | blood | death | after | monsters (wave) | fighters | tile | part |
|------|---------|-------|-------|-------|-----------------|----------|------|------|
| 109447 | onni_korhonen (Onni) | 131 | 149 | 18 | editor ×2 (w5) | 3 | trail_edge | 3 |
| 109448 | sam_wilson (Sam) | 77 | 88 | 11 | reunion ×3 (w4) | 7 | haven | 1 |
| 109448 | diana_osei (Diana) | 110 | 111 | 1 | audit (w4) | 2 | haven | 1 |
| 109448 | app_mgpspjol608 (Willie) | 95 | 147 | 52 | editor ×2 (w5) | 3 | haven | 2 |
| 109450 | rosa_mendez (Rosa) | 42 | 79 | 37 | reunion (w4) | 2 | trail_edge | 3 |
| 109450 | miguel_santos (Miguel) | 91 | 91 | 0 | reunion ×3 (w4) | 6 | haven | 2 |
| 109452 | gen_cvgtpk0 (Dwayne) | 35 | 38 | 3 | suburb (w4) | 3 | grove | 2 |
| 109452 | gen_4f7tii3 (Rahul) | 56 | 68 | 12 | eulogy (w4) | 3 | haven | 1 |
| 109454 | gen_muyu3ns (Jaxon) | 122 | 134 | 12 | algorithm (w4) | 3 | haven | 3 |
| 109455 | gen_drexyej (Rashed) | 135 | 145 | 10 | suburb ×2 (w4) | 4 | trail_edge | 1 |
| 109456 | amina_diallo (Amina) | 86 | 116 | 30 | reunion (w4) | 2 | haven | 3 |
| 109457 | gen_7b6cxnp (Haibo) | 80 | 119 | 39 | reunion (w4) | 2 | meadow | 3 |
| 109458 | nino_kapanadze (Nino) | 73 | 73 | 0 | eulogy (w4) | 3 | haven | 3 |
| 109460 | gen_ll2kq4k (Logan) | 91 | 91 | 0 | eulogy (w4) | 2 | haven | 3 |
| 109460 | miguel_santos (Miguel) | 112 | 113 | 1 | suburb (w4) | 2 | haven | 2 |
| 109460 | app_mgpspjlv939 (Saengduean) | 98 | 144 | 46 | reunion ×2 (w4) | 4 | grove | 2 |
| 109461 | victor_lopez (Victor) | 132 | 132 | 0 | timeslot ×2 (w5) | 3 | haven | 3 |
| 109462 | ruby_callaghan (Ruby) | 103 | 109 | 6 | eulogy (w4) | 2 | haven | 2 |

Monster counts across the 18 deaths (27 mentions — some fights
have 2–3 monsters): **reunion 11, editor 4, suburb 4, eulogy 4,
timeslot 2, audit 1, algorithm 1**. Waves: w4 21, w5 6. Fights:
8/18 with a villager ally standing, 10/18 the scholar alone.
Day parts spread 1/2/3 (4/6/8) — no dawn deaths. Tiles: haven
12, trail_edge 3, grove 2, meadow 1 — twelve read the haven tile
while departed, so the tile type alone does not place the death
away from home; the departed flag does.

## What the fights are (the mechanism, plain words)

The scholar goes out alone or with one or two companions,
meets a wave-4 or wave-5 monster in the open, and loses the
played fight. The Reunion is the commonest killer — it mirrors
the party, so a party of four meets three of them, and the
mirror's returned moves ("YOUR MOVE, back at you") do the
killing. Four veterans blood and die on the SAME day: they earn
the title in the fight that kills them (Miguel 109450 kills a
reunion pyrrhically and dies to the other two in the same fight;
Victor 109461 bloods on a wave-5 timeslot and dies to two of
them the same day). Six of the 18 deaths are wave-5 monsters
(editors and timeslots) — veterans do not only die to the wave
that made them; the next wave up takes them too. The other
veteran death causes are small and named: dehydration 3,
contest 2, "a stranger" 2, monster 1, "the night" 1 — the wild
is the only big one, and it is fights.

One asymmetry worth naming: in the SAME fight, the scholar's
death is stamped "the wild" while a companion's is stamped
"combat" or "monster" — Sam Wilson's fight on 109448 kills
Olivia Bennett and Caleb Jones with cause "combat" the same day
Sam dies "the wild". The fight is one event; the label depends
on which death pipeline the victim routes through (scholar via
`tbFightDeathCause`, companions via the fight settlement). Any
future census that counts "wild" deaths as non-fight deaths
will misread this.

## Sense-test — three death traces, read whole

**Sam Wilson, 109448, day 88** (11 days a veteran). Four people
walk into three wave-4 Reunions: Sam, Olivia Bennett, Caleb
Jones, Naran Tumen. The tail reads as a fight, not a label:
"Reunion 2's Your Move hits you for 15." / "Another face
surfaces — someone you brought, or someone who brought you.
'You didn't think we'd come alone?' The dead gather. (Allied
monsters +4 damage, 2 turns.)" / "Armor absorbs 57." / "Reunion
3's Your Move hits you for 13." / "You go down." Olivia and
Caleb die in the same fight ("combat"); Naran walks out alive.
A party of four lost to three mirrors — the mirror cap that
protects the ARENA does not protect the wild.

**Miguel Santos, 109450, day 91** (blooded and died the same
day). Six fighters: Miguel, Sari Wulandari, Greta Hansen vs
three Reunions. Greta hits one for 14; "A face goes still —
released. The mass shudders." — one reunion dies, and the kill
is Miguel's pyrrhic veteran-making kill, logged the same day.
Then the mirror answers: "Faces surface on its body — your own
snarl. It knows 'strike' — it watched you do it 5 times. YOUR
MOVE, back at you." / "Armor absorbs 53." / "Your own move,
returned hits you for 10." / "You go down." Sari and Greta
survive. He earned the title and died holding it within the one
fight. Another villager dies of "monster" the same day.

**Onni Korhonen, 109447, day 149** (18 days a veteran). Alone
on a trail edge, day-part 3, against TWO wave-5 Editors — no
allies, no party. "You're not where it landed. Clean dodge." /
"📺 +15 style — dodged Cut!" — he dodges once, cleanly — then
"✂️ RERUN ×2 The Editor's turn" / "💥 Trim!" / "Armor absorbs
39." / "Editor's Trim hits you for 27." / "You go down." He
blooded eighteen days earlier killing a wave-5 editor; two more
editors end him. The trace reads as a person who knew the fight
and lost it anyway.

All three traces end with the same sysSay line — "OH. Oh no.
...The gamblers are very quiet." — the loss beat firing on a
wild fight, identical each time. It is the arena audience's
line, spoken for a fight in the wild; a voice note, not a
verdict — the line is the loss beat, and it is honest about the
loss. (Filed in sim-findings.md.)

## Village assessment (plain words)

Sixteen villages, and the wild is not mysterious anymore — it
is the field. Scholars walk out, meet monsters, and lose real
fights: 95 scholar deaths in the wild across 16 villages, every
one a lost fight, none an exposure or a road accident or a
mystery. Veterans die the same way everyone else dies out
there, only more so: two of every three dead veterans die in
the wild, and the ones who live longest after blooding (52, 46,
39, 37 days) still die to the same fights. The villages that
survive to day 150 do it with their veterans mostly dead — 27
of 35 killers dead, 8 standing — and the door opens on 9 seeds
anyway, because blooding keeps pace with dying on the door
seeds (164 overlap days). The binding fact is unchanged from
vetpair: veterans live about twelve days after blooding, and
the village must blood the next one before the last one falls
in a field fight. The next lever is not attribution — it is the
fight itself: parties that survive Reunion mirrors, veterans
who do not walk out alone (10 of 18 died solo), and the wave-5
monsters that take veterans who already beat wave 4.

## Wall numbers (this census)

Wins 0/16. National (scaleRank) 0/16, table 0/16 (no seed
reached national, and the table requires it). Wave-5 unlocks
9/16, wave-5 faced 7/16, wave-5 kills 6. Wave-4 faced 16/16.
Median survival 150 days (CENSORED — 10/16 survived to the
horizon; sorted 86, 90, 97, 137, 146, 146, 150×10), max 150
(censored). These are this census's own numbers on anchor
`6b837b1c1`, not pooled with the vetpair corpus.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- THE HYPOTHESIS HELD ON 95/95: the prereg's code map said
  only `tbEnd`→`tbFightDeathCause` can stamp a scholar death
  'the wild', and the instrument proves it per death — same
  call site on all 18 veteran deaths, cause argument 'the wild'
  on all 18, undefined on 0. The verdict is still DIAG-GO
  because the bars were about classification completeness and
  instrument health, not about which class would win; a
  100%-one-class result is the census succeeding, not a bar
  failure. A 100% share also means the taxonomy's other classes
  were never exercised live (WILD-DEFAULT, WILD-EXPLICIT,
  WILD-TB-OTHER, WILD-NON-SCHOLAR all 0) — they were proven
  only by fixtures. That is a coverage note, not a miss: the
  classes exist for the next band where a non-fight wild death
  may appear.
- REUNION DENOMINATOR UNMEASURED: reunion is 11/27 monster
  mentions, but this corpus counts only deaths, not contacts —
  whether Reunion kills out of proportion to its spawn share
  cannot be judged here. The bloodcluster corpus (fieldFight
  rows by wave) holds the contact denominator; a next arm can
  join the two without new sims. Do NOT claim Reunion is
  over-lethal from this census alone.
- TILE READING: 12/18 deaths read tile 'haven' while departed.
  The tile type is where the scholar stands, not a proof the
  fight was at home — departed is the away-from-home flag.
  Future instruments should not use tile type as the
  away-from-home test.
- SAME-FIGHT DIFFERENT LABELS: companions in the scholar's
  fatal fight die "combat"/"monster" while the scholar dies
  "the wild" (Sam's fight, 109448). Any census counting "the
  wild" as non-fight deaths misreads the engine. The
  vetattrition "WILD" shares (76/139) should be re-read as
  mostly lost field fights, not exposure — this arm's evidence
  file is the correction to cite, not a re-score of that arm.
- MEDIAN: 150 is CENSORED (10/16 survived to the horizon).
  Report it as "150 (censored)", never as a survival claim.
- DEPARTED: 0/35 killers departed — the departed terminal
  status was never exercised on this band either (same as
  vetpair). It stays in the taxonomy but is unvalidated by live
  data.
- DETERMINISM: the replay leg passed with every attribution
  stream identical — the harness is deterministic on this anchor
  for this band.

## Next blanks, in order

1. The fight, not the label: veterans die losing played field
   fights, 10/18 solo, Reunion the commonest killer. Next levers
   are the win-fielddmg lane (damage + staying in field fights)
   and the persistent-party build (veterans hunting together
   instead of walking out alone) — coordinate with, do not
   duplicate, those lanes. This census is the measurement they
   build against.
2. Reunion in the wild: is the wild Reunion pack over-lethal
   relative to its spawn share? Needs the contact denominator
   (bloodcluster fieldFight rows) joined to this census's death
   rows — no new sims required.
3. Same-fight different labels: the scholar/companion cause
   asymmetry ("the wild" vs "combat"/"monster" for one fight)
   is a labeling wart worth a small fix or at least a canon
   note, so future censuses do not re-learn it.
4. The loss beat's gambler line ("OH. Oh no. ...The gamblers
   are very quiet.") fires on wild fights — voice note, filed
   in sim-findings.md.

## Infrastructure

Write flap (EPERM on fresh-file writes) struck repeatedly
through this run; all windows cleared on their own, nothing
lost:
- ~00:0x–00:08 UTC: prereg commit refused (mass-deletion guard
  fired on a flap-emptied private index); cleared 00:08:46;
  prereg committed 9cca2b33b after 3 EPERM retries inside
  safe-commit.
- ~00:10–00:26 UTC (~16 min): instrument commit refused the
  same way; cleared 00:26:49; committed 6b837b1c1.
- ~00:30–00:38 UTC: pilot seed 109450's file write refused
  twice (0-byte file left behind both times); seed completed
  on the next clear window (00:45:16).
- ~00:39–00:43 UTC: pilot seeds 109451–109452 write-refused
  (109451 took 4 attempts); clear after 00:43; confirm leg ran
  clean on first attempts throughout.
- Safe-commit index clobber struck on all 3 commits (prereg,
  instrument, corpus): the main index showed the committed
  files staged-deleted while byte-identical on disk. Repaired
  each time with the documented pipe (`git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info`), verified
  status empty + diff HEAD empty + hash-object matches. The
  commits themselves were always correct.
- One empty commit (835468d23) was created when safe-commit.sh
  was passed a directory path — the script does not accept
  directories ("Unable to add <dir> to database"). It was
  reset --soft on this private branch (unmerged, mine alone)
  and the corpus recommitted with explicit file paths as
  5518e4683 (17 files, verified by `git show --stat`).

## Proof and landing

- Proof: `scripts/test-wilddeath-b-20261124.js` — 11/11 PASS
  (fixture + live harness smoke), green before the leg and
  re-run green on the branch tip after the legs.
- Determinism replay leg: seed 109447 twice, every attribution
  stream identical (deathEvents, killEvents, playerDeaths,
  regDeaths, daily); the two files differ only in the RUN slot
  (`wilddeath-b` vs `wilddeath-b-replay`). Replay file NOT
  pooled into the 16-seed summaries.
- Commits (this worktree branch sim-wilddeath-b; coordinator
  merges via --ff-only; ready to merge, pending ship — no push,
  no bump, no live verification by this worker):
  - `9cca2b33b` sim-wilddeath-b prereg (before any judged sim)
  - `6b837b1c1` sim-wilddeath-b instrument: death-capture wraps
    + driver + analyzer + proof test (11/11)
  - `5518e4683` sim-wilddeath-b corpus: 16 judged per-seed
    JSONs + 109447 replay
  - (evidence commit follows)
- Files: prereg + evidence in
  `evidence/2026-11-24/sim-wilddeath-b*.md`; per-seed JSONs in
  `evidence/2026-11-24/perseed-wilddeath-b/` (16 judged files +
  1 replay file, `-wilddeath-b-replay` in the RUN slot).
- Telemetry deviation check (body step 10): NOT APPLICABLE in
  the pilot's sense — a census with no before/after change; the
  scale-wall baseline carries a DO NOT compare note for
  pre-seat substrates. The wall numbers above are the report.
- Convergence state: DIAG-GO — the census question is answered
  ("the wild" is lost field fights, named per death); the next
  work is a BUILD question (the fight itself), owned by the
  adjacent lanes.
