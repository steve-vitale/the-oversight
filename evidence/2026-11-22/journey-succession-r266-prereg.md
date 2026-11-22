# Journey succession r266 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r266 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r266: follows succession r263 (2026-11-21,
landed; rotation-b 7→4 was its closeout's job — the file reads 7
because the endgame/social/crisis closeouts cycled it back through
4→5→6→7; this run plays the leg the file says, 7, and writes 4).
Base: master `e67224635` at registration. Lock: playtest-loop-2.lock
run_id `playtest-loop-2-20261122T0800Z` (own, created at run start;
stale-lock recovery: a prior lock `playtest-loop-2-20261122T0100Z`,
created 06:55:34Z, had NO registered tree and NO heartbeat — dead by
the guard's letter, deleted, noted in the run note; main tree clean,
disk 41%). Worktree: `~/workspace/worktrees/journey2-succession`
(registered; registration took ~5.5 min — the checkout is ~15G of
tracked evidence; a stale orphan dir of the same slug, flap-damaged
and holding nothing unique, was moved to recoverable trash first —
trash_id 20261122-080101-485b12e0874c4642a982c501d0df3abc, expires
2026-12-22; heartbeat loop `journey2-succession-hbloop-r266.sh`
every 5 min, setsid; the write flap is ACTIVE at run start —
registry writes refused since ~07:55Z, heartbeat 08:06:37Z, retries
ongoing).

## Standing state (why this run plays leg 7, and what it carries)

r263 succession (2026-11-21) ended SUPPLY-ZERO: 29 person corpses
panel-wide, 0 with witnesses; WIT-SIT v2 staged 0 sittings. Its
metric review filed the next step verbatim: "run a cheap SUPPLY
SCREEN first — many seeds, corpse census only, no full panel — to
find seeds where a witnessed person death actually occurs, then
stage WIT-SIT v2 on THOSE seeds. Do not re-run a fresh band hoping
for supply." It also filed the diagnostic question: "WHY do person
corpses never carry witnesses while monster corpses always do? The
witness-population rule (registerDeath / combat attribution) needs
one read before the next staging panel." This run IS that step, in
two parts: (1) the diagnostic read, done before play and recorded
below; (2) the supply screen, a wide fresh band with staging live.

Carried from r263: the WIT-SIT v2 instrument (cap 4, second sitting,
sitSeq), the MOURN-TEMPLATE double-stage-pair exemption, the r262
M12 escalator-cap fix and M4 strip — no new game change is planned
this run. No canon doc covers succession/mantle (CANON.md grep
empty; r54/r91 preregs, unchanged) — none invented here. Gating
freeze (2026-10-27) stands; no gate, deed-bar, standing, wave, or
table-price change is in scope.

## Diagnostic read (done before play — the witness-population rule)

Read `src/js/corpses.js` registerDeath + fightWitnesses, and every
registerDeath call site in `src/js/game.js`, `alienPlayers.js`,
`betrayal.js`, `app.js`. Findings, stated before the screen so the
screen's cause×witness breakdown can be judged against them:

- `registerDeath` defaults `witnesses: opts.witnesses || []` — empty
  unless the call site passes them. Witnesses are NEVER computed
  inside registerDeath; they are supplied (or not) by each caller.
- **Monster corpses always carry witnesses, three ways:** the
  bearer's own kills (`game.js:41014`, `witnesses:
  this.fightWitnesses()` — the bearer is in the fight, so at minimum
  the bearer is a witness); villager patrol/wild kills
  (`game.js:8466` + `21596`, `witnesses: [vid]` — the killer villager
  is recorded as the witness); alien-beam kills
  (`alienPlayers.js:3212`, fightWitnesses). r263: 227/227.
- **Person corpses carry witnesses ONLY from `tbDamage` combat
  deaths** (`game.js:40909/40919/40965`, `witnesses:
  this.fightWitnesses(t.villagerId)`) — `fightWitnesses` returns only
  fighters in the LIVE `this.tbfight` on the bearer's tile plus the
  bearer. A person death inside a fight the bearer is fighting in
  gets witnesses; every other person-death path registers none.
- **`hurtVillager` (`game.js:8658`) — the path for ALL off-tile
  villager deaths (field fights, wild monster attacks, expedition
  damage) — passes NO `witnesses` argument at all.** The field-fight
  settlement knows who fought alongside (allies), but hurtVillager
  never receives them. The 4 monster-caused villager deaths on r263
  (Odd, Devon, Suman, Henry) all went through this path:
  witnessN=0 even when allies fought beside them.
- Wound/thirst deaths (`game.js:29859`, `33704`) also pass no
  witnesses. Starvation/sickness/dehydration/stranger/arena/contest
  deaths likewise.
- The two witnessed person deaths ever seen (Vincent + Javier,
  34362; Isabella, 34403) were both combat deaths in a tbfight the
  bearer fought in — consistent with the rule above.

So the supply question is, precisely: **what fraction of person
deaths happen inside a bearer-present tbfight?** The screen measures
that rate across 24 fresh seeds, broken down by cause, against this
map. The asymmetry is structural, not a sampling fluke: the monster
side names a witness for every kill (the killer), the person side
names one only for deaths inside the bearer's own fight.

Filed for Steve (NOT built this run — a game change to grief/gossip/
murder gating, needs his call): thread the field-fight allies as
witnesses in hurtVillager, mirroring the monster side's `[vid]`
killer-as-witness — i.e. a villager who dies in a field fight with
allies present is witnessed by those allies. The screen's numbers
are the evidence for that call.

## Design correction to r263's prescription (recorded before play)

r263's review says "screen first, then stage WIT-SIT v2 on THOSE
seeds." This run stages IN the screen run — one wide band, staging
live — instead of two phases. Reason: r262 proved replay
divergence (the 34403 replay is a fresh trajectory, not a
controlled re-run). Re-running a supplied seed for phase 2 would
likely NOT reproduce its witnessed death, so a two-phase design
would stage on fresh trajectories and measure nothing. Staging
in-trajectory is the only way to measure the pick on supplied
seeds. The screen and the panel are the same run; the analyzer
adjudicates supply first, then the r263 bars on whatever supply
arrived.

## The instrument (no logic change)

Driver `scripts/journey-succession-r266-20261122.js` = r263 driver
with filenames r263 → r266 and EVID 2026-11-21 → 2026-11-22 ONLY
(verified by diff — no logic change). Analyzer
`scripts/analyze-journey-succession-r266-20261122.js` = r263
analyzer, same rename-only fork. Runner
`scripts/run-journey-succession-r266-panel.sh` = r263 runner,
renames + seeds. WIT-SIT v2 unchanged (cap 4, second sitting next
day, different living witness, sitSeq 1|2, MOURN-TEMPLATE
double-stage exemption in the analyzer).

## Bars (binding, §14)

- SUPPLY (binding, the screen's question): witnessed person
  corpses across the 24 fresh seeds. SUPPLY-PRESENT if ≥1;
  SUPPLY-ZERO if 0. Rate reported either way, with the
  cause×witness breakdown judged against the diagnostic map above.
- MONSTER-WITNESS (binding, instrument check): monster corpses
  with witnesses ≥90% panel-wide (r263: 227/227). Below that, the
  census reader is broken and the screen is invalid — a miss here
  is a NO-GO on the instrument, not on the game.
- STAGE (binding, carried, conditional on supply): ≥1 staged
  wit-sit fires on a supplied seed with a living witness speaker,
  inside the fresh window.
- REL-WIT (binding, carried, conditional): PASS = ≥1 judged
  witness-variant serving with rel.witnessed true AND 0 servings
  where not witnessed, on staged sittings, naming the latest dead.
  Fewer than 3 single-fresh draws (fired && freshPersonN==1 &&
  latelyWitnessed) = INSUFFICIENT-DATA on the positive arm. A
  serving naming the WRONG dead = fabrication: FAIL LOUDLY.
- REL-BOND (binding, carried): PASS = ≥1 bond-variant serving
  where close AND 0 servings where not close.
- REL-VET (binding, carried): PASS = ≥1 both-veteran serving on
  ≥10 opener draws in both-veteran convos AND 0 servings where
  either is not a veteran; fewer than 10 opener draws =
  INSUFFICIENT-DATA on arm (a).
- MOURN-TEMPLATE (binding, carried, AMENDED r263): 0 same-speaker
  same-shape firings for different dead AND 0 different-speaker
  same-shape same-dead firings within 5 days, EXCEPT pairs that are
  the two sittings of one double-staged death (same deadId,
  consecutive days, different speakers).
- MOURN-EXHAUST (binding, carried): 0 servings of the exhausted
  line in a mourning sitting.
- MANTLE-FINE (binding, carried, gap-subtraction): 0
  flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
  0 unexplained fineLatency==1, 0 day-skips.
- DRY CENSUS (binding, carried): 0 dry hits of any class.
- WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
  C3c/F2/C3d and the carried landed-fix surfaces.
- C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
- F5 WILD EXERCISE (DESCRIPTIVE, r248 reclassification): firings
  reported per panel + the rolling 5-panel window
  (r233+r245+r248+r254+r258 — r263's window, advanced one panel);
  binding proof is the r225 harness (22/22), re-run on this base.
- CONTROLS (binding, smoke bar S_fixed from r230, as re-baselined
  in r233): smoke 33998 at-death snapshot matches r233's smoke run
  exactly — handoff d6 Heinrich → Grace, relPost bonds 33,
  relD14 50, selfId grace_obi + machinery (pick rank 1, funeral
  INCALL true, selfReq 0 on every seed). If the smoke snapshot
  moves, it is base drift since r233, recorded as such and the bar
  re-baselines by measurement, not adoption.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA.
- POSITIVE CONTROL (descriptive, not binding): seed 34403 (replay,
  known supply — Isabella's witnessed death on the r262
  trajectory) is run as a control, not a fresh-band seed. If it
  yields a witnessed person corpse, the screen instrument is
  validated end-to-end (it detects supply when present). If it
  yields 0, that is replay divergence (proven r262), NOT instrument
  failure — the instrument reads corpses() directly, and the
  MONSTER-WITNESS bar above is the binding instrument check.

If SUPPLY-ZERO: STAGE = NO-GO (supply), REL-WIT =
INSUFFICIENT-DATA, and the run's deliverable is the diagnostic map
above + the screen rate + the filed fix proposal for Steve. The
other bars still adjudicate on the panel as run.

## Panel

- Driver: scripts/journey-succession-r266-20261122.js (r263 driver,
  rename-only fork; EVID 2026-11-22).
- Analyzer: scripts/analyze-journey-succession-r266-20261122.js
  (r263 analyzer, rename-only fork).
- Panel runner: scripts/run-journey-succession-r266-panel.sh
  (r263 runner, renames + seeds).
- Proof tests: no new src/js change is planned this run, so no new
  proof test. The r262 M12 escalator-cap proof, r254 multiwit proof,
  r232 relationship-mourning proof, r225 F5 harness (22/22), and r258
  selfwit proof re-run on this base (WILD CHECK). The pilot seed is
  the instrument test: its stdout.json must show the driver running
  clean on this base before the panel expands.
- Seeds: FRESH BAND 34422–34445 (24 seeds; EARLY_KILL_DAY=40,
  POST_DAYS=70) + positive control 34403 (same config, replay) +
  smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34422 alone; then 34423–34445
  sequentially, then 34403, then smoke. The panel runner is launched
  with nohup so it survives the coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for each of 34422–34445 over
  evidence/*/journey-*-prereg.md and evidence/*/sim-*-prereg.md:
  0 hits each.
- COLLISION recorded: 34421 is named in
  evidence/2026-11-14/sim-transplant16-prereg.md and
  evidence/2026-11-15/journey-deepening-r212-prereg.md — the band
  starts at 34422, not 34421. (The first choice was 34421–34444;
  the collision moved it to 34422–34445; 34445 verified 0 hits.)
- Comparison: 34411–34416 = r263 fresh band (SUPPLY-ZERO);
  34403 = r258/r262 known-supply seed (positive control here,
  replay); 34362/34371–34374 = r248 panel; 34361–34364 = r245;
  34351–34354 = r233; 34341–34344 = r232; 34331–34334 = r231;
  34321–34324 = r230; 34311–34314 = r229; 34301–34304 = r224;
  34291–34294 = r218; 34281–34284 = r209; 34271–34274 = r202;
  34261–34264 = r197; 34251–34254 = r193; 34241–34244 = r187;
  34231–34234 = r183; 34221–34224 = r181; 34211–34218 = r177;
  34201–34208 = r169; 34011–34018 = r169; 33998 = standing smoke
  control.
- Band 34422–34445 is FRESH (34421 excluded by collision).

## What would count as interesting

- ≥1 witnessed person corpse on a FRESH seed (SUPPLY-PRESENT —
  the first fresh-band supply since r248; the screen pays for
  itself and the staged panel measures the pick).
- A witnessed person corpse whose cause is NOT 'combat' (the
  diagnostic map would be wrong — a new witness path exists).
- A monster-caused villager death WITH witnesses (hurtVillager
  threading exists somewhere the read missed).
- 0/24 SUPPLY-ZERO again (the bound sharpens: 0 in 34 fresh seeds
  across r248+r263+r266 — the witness variant is effectively
  unreachable in fresh play; the filed fix proposal becomes the
  run's main outcome).
- A witness-variant serving on a staged sitting (REL-WIT moves
  from INSUFFICIENT-DATA to PASS — the first ever wild witness
  serving).
- A witness-variant serving on a SECOND sitting (sitSeq 2).
- 3+ single-fresh draws with 0 witness servings (the pick, not the
  sitting, is the wall).
- A MOURN-TEMPLATE exemption firing (a double-stage pair sharing a
  shape — the amendment's first use, audited in the run note).
- A relationship variant served WITHOUT the relationship (a
  fabrication). FAIL LOUDLY.
- A DRY hit on ask:lately (emission-block cost, realized).
- A C3d-class erasure / F5-class dry hit / stale-favor resume /
  narration-quote opener (carried-fix regressions).
- Any MANTLE-FINE miss on the fresh band (regression).
- A live-want recap serving (positive evidence the C3d fix
  engages).
- Smoke snapshot move vs r233 (base drift since r233).
- CAP-NC denominator >= 3 for the first time in several runs.
- The positive control 34403 reproducing a witnessed death on a
  third trajectory (supply is a property of the seed's world, not
  one trajectory).

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-22/journey-succession-r266-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r248/r258/r262 precedent): a forced-chain panel
must NOT roll the unforced baseline forward — LOUD lines from forced
deaths are regime, not drift, unless investigation shows a real bug.
Per-file means are the comparison (the tool's sum-vs-mean mismatch
is unresolved since r229).

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r263: measurement-proof staleness pair, phone-frame stale
receipt, deed-attainment 120s timeouts, occupation-panels load
flake; flap/load artifacts during flap windows) are the baseline;
any NEW failure is a stop-and-explain item. No src/js change this
run, so no attributable failure is expected. The gate may go to
adoption if the occurrence times out (r239/r256/r260/r262/r263
precedent) — the proof re-runs + panel are the in-run bar.

## Metric review (carried)

- REL-WIT: this run screens a 24-seed fresh band with staging
  live (r263 metric review, filed, as corrected above). The
  3-draw floor stands.
- WIT-SIT cap stays 4/seed; the pre-death scan shares the cap
  with the post-death scan.
- MOURN-TEMPLATE: double-stage-pair exemption stands, untested in
  the wild (0 double-stage pairs on r263 — no supply); it needs a
  supply panel to prove itself.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances one
  panel.
- Proof refresh rounds 11 + 12 remain owed (measurement-proof track,
  carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried, unchanged
  (checkpoint loop untouched to protect the smoke control).
- m3v2b: carried, not a bar.
- BOWCRAFT bisect for the 34362 drift stays open (not this run's).
- Outing-chain re-tune stays open (conversion 12.9%, r260).
- F5 V3 still never served in the wild.
- Day-skip watch: twenty-sixth straight panel watch.
- Multi-name relationship mourning stays open (not built).
- KIN mourning stays unavailable (no kin signal).
