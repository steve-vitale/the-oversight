# journey-scale r62 — Lane A, leg 3 SCALE (2026-10-31)

**Run id:** oversight-playtest-loop-20261031T1443Z (scheduled 09:45 CDT 2026-10-31; lock created 14:43:57Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
Note on the repeated leg: r61's note promised the 3→0 write at its
closeout, but the rotation file still read 3 at this run's start —
the same anomaly r61 recorded about r60. Staying on scale is
queue-correct under the body (play THIS run's leg as read).
**Base:** master@47162b801 at worktree creation. **Zero src/js changed
by this run** — measurement plus one driver, one instrument driver,
three analyzers (labels/EVIDIR only, plus the read-only pellet
instrument), and evidence. The nofetch patch was temporary and
reverted (verified 0 diff lines, marker gone).
**Pre-register:** evidence/2026-10-31/journey-scale-r62-prereg.md
(written and committed before any seed ran).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; drivers read only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Main-tree .git EPERM flap (2026-10-23 class, recurred):** ref writes
  in ~/workspace/the-scattering/.git failed with Operation not
  permitted ~14:47–14:57Z (packed-refs rewrite, loose-ref creation,
  and direct probe writes into .git all failed; ordinary writes
  outside .git worked after ~14:52Z). Nothing was forced. The stale
  `journey-scale` branch could not be deleted (ancestor check passed
  — it is fully merged into master — but the delete needs a
  packed-refs rewrite), so the run registered under the fresh slug
  `journey-scale-r62` instead. The stale branch pointer is left in
  place for a later quiet moment; it is merged and harmless. Merge
  at closeout targets branch journey-scale-r62.
- **Heartbeat:** manual heartbeat at registration verified landed
  (15:03:11Z, re-verified 15:13:12Z) plus a 10-minute background loop
  with its log in goal hidden_files (journey-scale-r62-heartbeat.log).
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r56–r61: after a correct private-index commit, the
  worktree's main index showed both committed files staged-as-deleted
  plus untracked. Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git
  status` empty, `git diff HEAD` empty. The commit itself was
  correct (4491fa75).

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R62: PARITY IS DEAD ON ARRIVAL — first-divergence audit done, quad reported descriptively
The prereg's verdict rule fired on the pilot: ANY scalar difference
triggers r52's first-divergence audit before any attribution. The
audit result: **the capture diverges at line 6** — the opening
itself. Same scholar (Alejandra Wieczorek, line cook, Columbus),
but the starting pack differs: r61 has Mixtape, Daughter's Drawing,
Tasting Spoon, Knife roll, Busker's harmonica; r62 has Photo album
in place of Daughter's Drawing. That keepsake swap is the
lootabilities gift-pool re-roll, documented in the landing itself
(Arm 1 correction II: shard_spear's alien origin "re-rolls every
seeded gift/generation stream"). The range since r61's base
(3c03d468b..HEAD -- src/js/ + src/data/) is not just the self-craft
duty: it includes items.json, monsters.json, regions.json and
reward-economy.json loot-pool changes. Policy
(scripts/policies/scalecourt-nogate.js) is UNCHANGED in the range,
and loadGame's mode string is a manifest label only, not an RNG
input — so the divergence is the base's generation re-roll, not a
driver bug. Parity vs r61 was therefore never a live question on
this base, and the quad below is DESCRIPTIVE (fresh worlds on the
new base), not a parity comparison. No scalar was re-scored against
a friendlier metric; the parity question is answered "not
applicable — base re-rolled generation," with the audit as evidence.

**Pilot-gate judgment, disclosed:** the prereg's pilot gate
(pilgrimages == 0 → STOP) fired literally on 85001 (pilg 0). The
gate's intent — detect a broken or empty run — is NOT met: the
pilot is a complete, instrumented run that ends in a voiced
day-28 scatter (see below). Pilgrimages are a late-scale behavior
a day-28 scatter cannot reach, so pilg 0 here is an expected
consequence of an early ending, not breakage. The run continued
descriptively on that disclosed judgment, exactly as r61 disclosed
its Q2 judgment call. The next prereg should gate on crash or
empty capture, not on pilgrimages, for early-ending seeds.

| seed | end | seat/arc | bars at census | deaths | maxWave | pilg | fusion | abilities |
|---|---|---|---|---|---|---|---|---|
| 85001 | SCATTERED d28, 3/3, pantry 0 | none arc3 | MISS w2=2, w3=0, cont=1, rank=village, foodDeeds=F | 19 | 2 | 0 | F | green_whisper, green_thumb, lucky_rock |
| 85002 | ALIVE d181, 8/8, pantry 92,669 | none arc3 | MISS w3=0, foodDeeds=F | 13 | 2 | 34 | T | green_whisper, scream_cheese |
| 85003 | ALIVE d181, 6/6, pantry 2,438 | none arc3 | MISS foodDeeds=F | 48 | 4 | 69 | T | bloodhound, lucky_rock, green_whisper, trophy_room |
| 85004 | DEAD d169, 0/0, pantry 0 | lesser arc4 waiting+announced | ALL-BARS | 73 | 4 | 5 | F | beast_calm |

Descriptive quad count: ALIVE 2/4, SCATTERED 1/4, DEAD 1/4; lesser
seat 1/4; full seat 0/4; wave 5 reached 0/4 (maxWave 4 at best).
**Weapon-craft lines: 0 on all four seeds** (capture lines matching
/spent the afternoon at the workbench and made/) — the new
self-craft duty never fires on this leg's policy path, same class
as r61's deadfall finding. **Deadfall-duty lines: 0 on all four**
(the 5 deadfall mentions on 85001 are prose, as in r61). So a real
player following this competent line would never meet either new
duty in the scale window — a reachability note for those duties'
own lanes, not a scale-leg bug.
**85001's story, plain words:** the re-rolled world starves. The
pantry hits zero repeatedly from day 25; Dale (d20), Biplob (d21),
Leo (d25), Heinrich and Magnus (d27), Victor (d28) each starve with
their own mourned line, and on the third hungry day the village
scatters with three survivors walking in different directions
("Haven couldn't hold... The scattering, again"). Coherent and
voiced, not broken — a hard world, not a broken sim.
**85002's warning:** a village can survive to the cap rich
(92,669 kcal, 34 pilgrimages, covenant trusts 98/93) and still sit
at arc 3 with ZERO wave-3 monsters faced in 181 days (maxWave 2).
The climb's survival machinery works; the wave-3 meeting does not
arrive on its own on this world.

### 2. ARC-GATE AUDIT (r61 open item, re-read — NO new seeds): DECOMPOSED, and the pellet trap is the mechanism
Scoring rule fixed from code before reading results (prereg §2):
lesser-seat bars w1>=4, w2>=4, w3>=3, contests>=2, crises>=2, rank
regional+, stage>=2, foodDeeds — scored at CENSUS
(tableSeatDetail), not at the last wantwatch sample. Sentiment vs
feastSurge split: RESONANCE HARMONICS fires in ALL 16 r60 wide-band
captures, so every foodDeeds miss on that band is the feastSurge
half specifically (a feasted combat use or landed bonus healing
never banked).

| seed | current (r60 wide) | nofetch (r60 wide) |
|---|---|---|
| 85101 | lesser arc4 ALL-BARS | none arc3 MISS foodDeeds=F |
| 85102 | lesser arc4 ALL-BARS | none arc3 MISS w3=1, foodDeeds=F |
| 85103 | lesser arc4 ALL-BARS | lesser arc3 ALL-BARS (tick-lag, see below) |
| 85104 | lesser arc4 ALL-BARS | lesser arc4 ALL-BARS |
| 85105 | lesser arc4 ALL-BARS | none arc3 MISS w3=2 |
| 85106 | lesser arc4 ALL-BARS | none arc3 MISS foodDeeds=F |
| 85107 | none arc3 MISS foodDeeds=F | none arc3 MISS foodDeeds=F (shared, not a divergence) |
| 85108 | lesser arc4 ALL-BARS | none arc3 MISS foodDeeds=F |

**Decomposition, not a chain:** the nofetch arc lag is foodDeeds on
4 divergent arms (85101, 85102, 85106, 85108), wave-3 breadth on 2
(85102 also foodDeeds; 85105 alone, one short at w3=2), and one
measurement-timing case (85103). No single bar covers all divergent
seeds, so no single-mechanism claim is made. The pellet evidence
 sharpens the foodDeeds class: the pellet (fusion reactor) was
installed in 14/16 wide-band arms, and the day-90+ table beat names
the trap aloud with the right variant per arm ("NO HUNGER ON THE
RECORD" for never-banked bearers; "THE FIRE BURNED BEFORE THE
PELLET" for bearers who banked first). The trap is a known game
rule with a voiced out ("The mantle may pass to hungrier hands"),
not a bug — but on this band it is the dominant arc3 mechanism.
**85103 nofetch, measurement-timing class:** bars ALL met at census
(w3=3) but arc still 3 with seat lesser at census — the w3 bar
flipped on the final tick, after the last checkArc promotion pass.
Had the run ticked one more day, arc 4 should have followed. This
is a promotion-tick lag, not a progression failure, and it is why
bars are scored at census, not at the last daily sample.
**85107 is not a fetch divergence:** both arms miss foodDeeds.
Counting more bands would re-roll the same lottery; the next run's
question is the timing instrument (Q3), not another band count.

### 3. PELLET-TIMING INSTRUMENT (new, measurement only): PURITY PROVEN, SIMPLE ORDER HYPOTHESIS REFUTED, TRUE PREDICTOR FOUND
**Gate revision, disclosed:** the prereg gated Q3 on 0-line capture
diffs vs r60's wide captures. That gate is INVALID on this base —
the base re-rolled generation (Q1 audit), so any re-run diverges
from r60 from line 6 regardless of instrument purity. The gate was
revised, not waived: purity is now checked SAME-BASE (pellet driver
vs r62 driver on the same seeds, same base), which is the correct
purity test for a read-only instrument. The timing verdict rule
itself is unchanged.
**Purity: PASSED.** Pellet driver vs r62 driver on quad seeds
85001–85004: 0-line capture diffs on all four, identical scalars.
The instrument (daily pelletOnline + feastSurgeUsed + sentimentTaught
+ arc + seat, all reads) does not move the sim.
**Quad timing:** 85004 (arc4): surge banked d30, never pellet,
arc4 d81. 85002 (arc3): sentiment d20, pellet d23, surge never.
85003 (arc3): sentiment d20, pellet d88, surge never. 85001
(scattered d28): sentiment d13, no pellet, no surge.
**Wide-band timing (new base, matched seeds, current vs nofetch):**

| seed | current: pellet / surge / order → arc | nofetch: pellet / surge / order → arc |
|---|---|---|
| 85101 | 23 / 126 / pellet-before-bank → arc4 | 75 / — / pellet-only → arc3 |
| 85102 | 17 / — / pellet-only → arc3 | 38 / 73 / pellet-before-bank → arc4 |
| 85103 | — / 68 / surge-only → arc4 | 20 / — / pellet-only → arc3 |
| 85104 | 48 / 24 / bank-before-pellet → arc3 (w3=1) | 113 / 23 / bank-before-pellet → arc4 |
| 85105 | — / 30 / surge-only → arc4 | — / — / neither → arc3 |
| 85106 | 78 / — / pellet-only → arc3 | 23 / — / pellet-only → arc3 |
| 85107 | 36 / 118 / pellet-before-bank → arc4 | 69 / — / pellet-only → arc3 |
| 85108 | 97 / 49 / bank-before-pellet → arc4 | — / 46 / surge-only → arc4 |

Current wide: arc4 5/8; nofetch wide: arc4 3/8 (matched-seed
comparison on the new base; r60's band is a different base and is
not compared here).
**The simple order hypothesis is REFUTED:** pellet-before-bank
arms reach arc4 (85101C, 85107C, 85102N), and a bank-before-pellet
arm sits at arc3 (85104C, w3-short). What the flag transitions
prove instead: in all three pellet-before-bank arc4 cases, the
pellet went OFFLINE before the surge was banked (85101C pellet
23–83, surge 126; 85107C pellet 36–42, surge 118; 85102N pellet
38–45, surge 73) — the mantle passed and the new bearer banked.
**True predictor on this band:** a surge EVER banked (by whoever
holds the mantle at the time). All 8 arc4 arms banked a surge; 7
of 8 arc3 arms never banked (6 pellet-only + 1 neither); the one
banked arc3 arm (85104C) misses w3 alone. Pellet-online-at-end +
never-banked = blocked (6/6 arc3). **Fetch association,
descriptive only:** current arms bank surges on 6/8 seeds vs
nofetch 3/8, with one reversal (85102: current never banks,
nofetch banks). No gear→feast→surge step is traced, so no fetch
causation is claimed — the association is a lottery outcome on 8
seeds until a traced chain exists. No fix landing follows from Q3
alone. The next run's instrument should record the scholar id at
each pellet transition, so a mantle pass is proven rather than
inferred from the flag going offline.

### 4. PEOPLE CHECK (sense law — all 6 Q1 quad transcripts read in full)
5 of 6 fully real, 1 partial blemish (same class as r58–r61, not a
new break). No fabricated shared history, no static menus, no
filler loops beyond the noted tail.
- **85002 d90 Luis (favor, sickness):** need owns the opener,
  commits ("I'll come back to help"), stage 2→3, ends resolved
  ("Thank you. Whatever you can do — thank you").
- **85002 d120 Luis (dream question):** answer lands ("Then it's
  not gone. Not really"), goon thins friendliness — a real beat
  about holding at arm's length. Stage 1→2.
- **85003 d90 Dale (blemish, known class):** grief opener is real
  ("Every laugh out there feels wrong today"), betrayal:accept is
  TAKEN with consequence (Dale teaches slope-reading for water on
  the way — an invitation taken, exactly the rationality item),
  comfort engages ("You're kind. Don't let this place change
  that") — but the gossip tail drifts generic (forage reports,
  "People are talking about Olivia"). Opening real, tail filler.
- **85003 d120 Lucas (dream question):** Chicago street-lengthening
  dream, specific and human. Stage 1→2.
- **85004 d90 Rowan (alone-time question):** answer engages
  ("Solitude's a resource too. Scarcer than food, some days"),
  goon pulls back half a step — deflection with body language.
- **85004 d120 Regina (old-life skill question):** patience answer
  lands ("You're an asset"), goon gives crossing-guard
  people-reading — occupation-grounded, specific.
No recurrence in this sample of Irving displacement,
Thabo withdrawal-only talk, or the Boris nod-loop (none arose).

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: the climb's machinery fires (courts, covenants,
  pilgrimages up to 69 on one seed, national/global voicing) and
  survival-to-cap is common — but neither new duty (self-craft,
  deadfall) fires once on this leg's policy path, so a real player
  on this competent line would never meet them in the scale window.
  The wave-3 meeting is the scarcer reachability problem: a rich,
  cap-surviving village (85002) faced zero wave-3 monsters in 181
  days.
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing, the starvation scatter
  is mourned villager by villager rather than tallied, and the
  pellet trap is now NAMED aloud with its way out ("The mantle may
  pass to hungrier hands"). The thin spot remains the gossip tail
  (Dale) — a blemish, not a break.
- WINNABLE: not shown, again. The lesser seat waits on 1/4 quad
  seeds and 5/8 + 3/8 wide-band arms; the full seat stays unwon
  (wave 5 reached 0 everywhere). Survival is no longer the binding
  constraint on this band — banking a feast surge before the arc
  can price the run is, with wave-3 breadth second. The pellet is
  not a wall: it is a timer the mantle pass can beat, and three
  arms this run prove the pass works.

## TABLE-APPROACH (standing, report-only)
Quad, end state: 85001 seat none arc3; 85002 seat none arc3;
85003 seat none arc3; 85004 lesser arc4 waiting+announced (then
wiped d169). Wide current: lesser arc4 on 5/8 (85101, 85103, 85105,
85107, 85108); wide nofetch: lesser arc4 on 3/8 (85102, 85104,
85108). Full seat 0 everywhere; wave 5 reached 0 everywhere.

## BARRIER PIN (standing instrument)
Barrier-dump line counts per Q1 seed: 85001: 0, 85002: 0, 85003: 4,
85004: 2. No new guard-break signal. The pin stands in its r55
form; it does not overturn.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores),
  plus the r61 end-state class (ALIVE / SCATTERED / DEAD) and the
  weapon-craft-line and deadfall-duty-line counts.
- r61's PARITY verdict is NOT extended and NOT re-scored: parity
  is not applicable on this base (generation re-roll proven by the
  line-6 first divergence + the loot-pool commits' own re-roll
  notes). The quad is reported descriptively under the same
  scalars; no number was re-scored against a friendlier metric.
- The Q3 gate revision (same-base purity instead of cross-base
  reproduction) is a method correction with a stated, evidenced
  reason (base moved), not a metric re-score: the timing verdict
  rule (order separates arc4/arc3 with at most the two named
  exceptions) was applied as written and FAILED — the simple order
  hypothesis is refuted, and the surge-ever-banked predictor is
  reported as the finding, not as a re-scored pass. The two named
  exceptions do not cover the refutation (85101C/85107C/85102N
  pellet-before-bank arc4s are counterexamples, not exceptions).
- The Q1 pilot-gate judgment (continue descriptively despite
  pilg==0) is disclosed above with its reason; the gate's literal
  condition fired for a benign cause (early scatter). Next prereg
  should gate on crash/empty capture instead.
- r61's arc-lag observation is SUPERSEDED in kind, not re-scored:
  r61 named arc lag without bars; r62 names the bars (foodDeeds
  vs w3 vs tick-lag) on r60's band and the surge-banking predictor
  on the new band.
- r58's Irving-displacement answer STANDS unre-tested (no Irving
  transcript arose). r58's subject-menu correction STANDS
  unre-tested (no subject-first arm here). r58's Boris nod-loop
  stands UNRE-TESTED (no Boris transcript arose). r56's
  chooseAbility-unguarded note stands (no duplicate ability id in
  any control seed's abilitiesHeld — all lists distinct). r52's
  barrier pin stands in its r55 form (see above).
- No metric was re-scored mid-run.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-10-31/journey-scale-r62/journey-scale-r62-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line: `census.pantryKcal newly appeared: baseline 0 ->
current 95107 (n=4 files)`, exit 0. **Verdict: EXPLAINED, not a
bug.** The baseline is the old-base quad's SUMS (day 579, popAlive
1, pantry 0, maxWave 16, pilgrimages 69 — the r60/r61 lineage where
all four villages ended dead/scattered with empty pantries). The
r62 quad sums are day 559, popAlive 17, pantry 95,107, maxWave 12,
pilgrimages 108. The pantry jump is two cap-surviving villages on
re-rolled worlds, one holding 92,669 kcal — the direct consequence
of the documented base re-roll, not a telemetry or game defect.
Comparing sums across a re-rolled base is apples-to-oranges, which
is why the baseline is NOT rolled on this run's numbers (prereg
decision stands).

## Tests
- `node --check` clean on the r62 driver, the pellet driver, and
  both analyzers (at creation; the pellet driver had one patch
  syntax error caught by --check and fixed before any seed ran).
- Pellet-instrument purity: 0-line capture diffs vs the r62 driver
  on all four quad seeds (see Q3).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **284 passed, 6 failed in 440s** (290 scripts).
- The 6 are EXACTLY r57–r61's 6 pre-existing assertion-failure
  scripts, same families, same signatures —
  measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof, and
  the establishment-r20 family
  (test-establishment-r20-fixes-20261020.js: "NEW: next day voices
  once more (gate resets daily): expected 2, got 1"). No quick-list
  test imports this run's scripts, and this run's change set is
  drivers + analyzers + evidence with ZERO src/js, so it cannot
  have caused any of the 6.
- Suite side effect, checked not assumed: the suite regenerated
  docs/ONTOLOGY.md's villager-build Provides line to include the
  landed villagerWeaponCraftDay() entry (verified: running
  validate-ontology.js reproduces exactly this state and reports
  "Ontology matches code. Release permitted."). That refresh is
  committed separately as a validator-generated docs update, not
  folded into the measurement commit.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
Master at worktree creation: 47162b801. At closeout master had moved
to 9f22a0838 on sibling evidence-only merges (no src/js in that
range, no ONTOLOGY.md touch) — branch rebased cleanly onto it,
proof tests re-run after rebase (node --check on all four scripts;
pellet-driver quad re-run: identical scalars, 0-line capture diffs
on all four seeds). Merged locally via `git merge --ff-only
journey-scale-r62` → master d7c270005, pending ship (no bump, no
push, no live verify — ship loop owns those).
Branch commits: c44d079fc (prereg + driver), 9f3c09ba7 (quad +
pellet-timing wide band, 404 files), d7c270005 (ontology validator
refresh). Worktree released + branch deleted at closeout; final
main-tree status clean.
