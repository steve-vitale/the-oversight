# sim-sense3-b — the third-ally sense investigation (finding #2619)

**Verdict: GO.** The binding sense condition is identified with encounter-level
evidence on two live corpora, and a concrete next lever shape follows from it.
No game code changed on this arm; the slot stays absent on master.

**The answer in one paragraph.** The third ally never enters a live wave-4+
fight because of a two-gate wall, and the fresh band caught the first gate
failing while the designated band caught the second. **Gate 1 — the dissolving
quad:** a quad launch is launcher + three named companions, but the launch is
a one-dawn decision, re-scored daily — the launcher may not travel with the
party, and companions churn overnight — so the sense at the fight returns
only whoever is still standing with the fighter. On the fresh band all three
counted quad launches dissolved before the fight (0 three-vid encounters in
143). **Gate 2 — the three-hopeless-round wall:** even when the sense does
return three companions, the third shout needs a third hopeless round
(rounds 2, 3, 4 — one shout per hopeless round), and live wave-4 fights end
first. On the designated band the sense returned three companions eight
times and every one of those fights ended with at most one shout. The
finding's premise was wrong at the sense level — the sense *does* return a
third companion sometimes — but right about the outcome: the slot never fires
live, because a three-vid fight never survives to the third hopeless round.

## 1. The mechanism, named

**THE DISSOLVING QUAD + THE THREE-HOPELESS-ROUND WALL.**

### Gate 1 — the dissolving quad (the sense condition)

The sense at a fight is pure co-location: the expedition route passes the
full sense return uncapped (`src/js/villager-agency.js:662`, `allies:
allyVids.length`), and the fight's `allyVids` is whoever is standing with
the fighter when the fight starts. Nothing in the launch binds the party
together. A launch record's `partySize: 4` counts the *launcher* plus three
named companions — and the launcher is a decision-maker, not necessarily a
traveler.

Encounter-level evidence, fresh band (106251–106258):

- **106253, visjoin_56's two quads.** Day 60 visjoin_56 launches jorge_silva
  + dale_hoffman + chen_wei to hunt an eater; day 64 visjoin_56 launches
  jorge_silva + lucas_brown + chen_wei to hunt the same eater. Visjoin
  never travels with either party. Visjoin's own five wave-4 fights (d58,
  d59, d70, d77, d77) are all 2-vid, all `world-tick` or `aid` origin —
  never the launched expedition — and visjoin dies to a monster on d77.
  Jorge's expedition fights after the launches (d65 reunion, d73
  congregation, d78 congregation, d85 algorithm) all carry 2 vids:
  jorge + chen_wei + lucas_brown — the day-64 party *minus the launcher*.
  The "quad" was a stay-home launcher plus a traveling trio.
- **106257, olivia_bennett's quad.** Day 126 olivia launches gen_o1xtjq7 +
  elena_petrova + nadia_khoury to hunt a eulogy. Olivia *does* travel —
  she is the fighter the next day — but the party has churned overnight:
  the d127 algorithm fight carries elena_petrova + brian_otieno. Nadia
  dropped out, gen_o1xtjq7 dropped out, brian (never named in the launch)
  joined. Traveling is necessary but not sufficient; the named party does
  not survive a single dawn re-scoring.
- **Fresh band total: 3 counted quad launches → 0 three-vid encounters.**
  No gate row ever saw `sensedSize: 4` (52 gate rows, max sensedSize 3).

The designated band shows the same gate passing when a party stays together:

- **106184, tashi_sherpa's three quads.** Tashi launches the same four
  people (tashi + jorge + daniyar + sofia) on d102, d127, d131, and the
  four travel as a unit: d131 jorge fights a suburb monster with
  daniyar + sofia + tashi beside him; d133 tashi fights an eater and a
  eulogy with daniyar + jorge + sofia. The launcher travels, the party
  holds, the sense returns 3.
- **106188, sari_wulandari's quads.** The d138 reunion fight carries
  app_mgpspku1753 + ethan_hunt + sari — the launcher in the fight as a
  companion. The d140 timeslot fight carries a churned quad
  (app_mgpspku1753 + ethan_hunt + sanne_bakker, sari swapped for sanne)
  — still four people, still a three-vid sense.
- **106188 d57** proves the sense is pure co-location: two three-vid fights
  (sam_wilson vs congregation, olivia_bennett vs eulogy) happened 81 days
  *before* the recorded quad launches. No launch produced them; three
  companions happened to be standing together. The launch does not create
  the sense — co-location does.
- **106186, the dissolving counter-example on the designated band.** Four
  quad departs (d47, d49, d49, d50) with the launcher changing between
  days (gen_ewl57ng → pavel_dubinin) and the same trio re-launched with
  `target: null` — and zero three-vid fights. A quad that keeps being
  re-decided never arrives as a quad.

### Gate 2 — the three-hopeless-round wall (the ladder condition)

The shout ladder is an else-if chain: one branch per round's break check,
hopeless first evaluated at round ≥ 2 (`src/js/fieldFights.js:2534`; the
prereg cites :2538 — see the correction note in §7). Shout 1 earliest
round 2 (line 2635), shout 2 earliest round 3 (line 2671), and the ported
third branch earliest round 4. So the third companion needs **three
hopeless rounds** — rounds 2, 3, and 4 all hopeless — and on master there
is no third branch at all (`ally3Vid` null, no "shouts a third time" line).

Encounter-level evidence, designated band (106181–106188, 156 encounters):

| three-vid fight | rounds | shouts | how it ended |
|---|---|---|---|
| 106184 d131 suburb, jorge | 1 | 0 | signature exit, round 1 |
| 106184 d133 eater, tashi | 0 | 0 | evade — no fight |
| 106184 d133 eulogy, tashi | 2 | 1 | low-HP flee, same check as shout 1 |
| 106184 d135 eulogy, tashi | 0 | 0 | contact-finish kill, 0 rounds |
| 106188 d57 congregation, sam | 0 | 0 | evade — no fight |
| 106188 d57 eulogy, olivia | 3 | 1 | death the round after shout 1 |
| 106188 d138 reunion, app_mgpspl50867 | 3 | 1 | low-HP flee, same check as shout 1 |
| 106188 d140 timeslot, app_mgpspl50867 | 1 | 0 | signature exit, round 1 |

End-cause taxonomy: 2 evade, 1 contact-finish, 2 signature-exit, 2 low-HP
flee, 1 death. **Maximum shouts in any three-vid fight: 1.** The two
low-HP flees fired in the *same* break check as the first shout — the
fighter shouts and runs in one breath ("past holding"). The Eulogy trick
rounds suppress hopeless while the fighter is above 25% HP (COUNTERWIRE,
`fieldFights.js` 2579–2593); after shout 1 the party-pool morale can
suppress the next hopeless round. Entry HP is not the discriminator
(median 84 for three-vid fights, 81 for two-vid).

The ladder itself works when fights last — corpus-wide, 42/47 fights of
≥ 4 rounds fired shout 2 (89%), and on the fresh band 30/39 (77%). The
constraint is rounds, not the sense.

### The door that never opens for launches

Entry path 1 — at the door — is closed by construction. The engine's
third-ally door block sits inside `if (opts.allyFromStart...)`
(`src/js/fieldFights.js:1404`). The only setter of `allyFromStart` in
src is `aidFight` (`src/js/comms.js:672`), and it **overwrites**
`opts.allyVids` with the crisis's foreign aid parties (line 663) before
setting the flag. A launch companion can never be at the door.
`allyFromStart` is false on all 156 designated-band encounters and all
143 fresh-band encounters.

### Router caps (secondary, not binding for quads)

On master only the expedition route can deliver 3 vids to a fight: the
wild router slices to 2 (cap 3 only with the port, `src/js/game.js`
~21144); the patrol router slices to 2 even with the port (`game.js`
~8385, `pAllyVids.length < 2`, untouched by the port commit `a1cd6cdc0`).
All 8 designated-band three-vid fights are expedition origin. This matters
for the lever: pinning the expedition party is sufficient; the wild and
patrol routes need no change.

## 2. Judged numbers — the frozen bars

| Bar | Frozen bar (prereg) | Observed | Verdict |
|---|---|---|---|
| M1 reproduction | Analyzer reproduces the frozen dmgshape census exactly: 156 encounters, 8 three-vid, 0 `ally3Vid`, max 1 shout in three-vid fights, `allyFromStart` 0/156, shout-2 rate 42/47 in fights ≥ 4 rounds | Exact — asserted in proof test §5, `test-sense3-b.js` 20/20 | **PASS** |
| M2 ladder proof (staged) | Geared quad vs a monster, 3 vids, no `allyFromStart`: shout 1 round 2, shout 2 round 3, no third shout exists | Proof test §2: holder 200 HP / companions 100 HP vs gavel, 15 rounds, `shoutRound` 2, `shout2Round` 3, `ally3Vid` null, no third-shout line, `shout3Round` undefined. Fighter died round 15; the ladder claims hold regardless. | **PASS** |
| M3a fresh leg, door | `allyFromStart` 0 on every fresh-leg encounter | 0/143 | **PASS** |
| M3b fresh leg, three-vid shouts | Among fresh-leg three-vid encounters, IF ANY, shouts ≤ 1 each | **Zero three-vid encounters** — "no replication possible on this band" per the frozen prereg (vacuous, not a pass, not a refutation). The three counted quad launches all dissolved before the fight (§1, Gate 1) — which is itself evidence for the mechanism, not a hole in it. | **VACUOUS** |
| M3c fresh leg, ladder control | Shout 2 fires in ≥ 75% of fresh-leg fights ≥ 4 rounds (reference 42/47 = 89%) | 30/39 = 77% | **PASS** |
| M4 door closure | `allyFromStart` setter unique to `aidFight` + overwrite verified by grep, AND 0/156 + 0/N | Setter unique (`comms.js:672`, overwrite line 663); 0/156 designated, 0/143 fresh | **PASS** |
| M5 deliverable | Named mechanism with encounter-level evidence + concrete next lever shape | §1 above; §3 below | **PASS** |

**Falsifiers checked, none fired:** no fresh-leg three-vid fight fired 2
shouts; the live-shape staged fixture fired 1 shout (proof test §3:
fighter at live median entry HP 84 with corpus-average gear vs wave-4
`audit`, 2 rounds, 1 shout, `vFlee` — the corpus taxonomy's prediction,
observed); no round-4+ three-vid fight with no third hopeless round (no
three-vid fight reached round 4 at all); no `allyFromStart: true` row in
either corpus.

**Instrument consistency:** the SHOUTREC cross-check (recorded shout rounds
vs joined-ally fields) is clean on the fresh corpus — `shoutCrossBad: 0`
across 143 encounters. On the designated corpus the check is null
(unverifiable, not a failure: the dmgshape driver never recorded the
shout-round fields).

## 3. The next lever shape (for the next arm)

**PIN THE QUAD + OPEN THE DOOR.** One lever, two sequential parts — fixing
either gate alone leaves the slot at 0, so they are built and paneled as
one lever with the staged fixtures as proof:

1. **Pin the launch (fixes Gate 1).** When a quad launches (launcher + 3
   named companions), the expedition carries the *pinned* party: the
   launcher travels with the named companions, and the party is not
   re-scored or re-formed between launch and the first fight. The fight's
   `allyVids` = the pinned party (minus anyone dead). The sense then
   returns 3 because the four are actually together — which is what
   tashi's d131–d135 party already does by accident.
2. **Open the door for a pinned quad (fixes Gate 2).** A pinned quad's
   three companions enter at the door (`allyFromStart` for the launch
   party — the same door path `aidFight` uses), so the third ally is in
   the fight from round 1 instead of waiting for a third hopeless round
   that live fights never produce.
   - *Alternative if the door is judged too strong:* the third companion
     joins on the **second** hopeless round (compress the ladder for the
     third shout only). The next arm preregs which variant it builds.
   - *Measurement:* prereg a panel — quad launches with the lever vs the
     sense3-b control band — measuring `ally3Vid` rate, `ally3Dealt`,
     and wave-4 kill conversion. The staged fixtures (`test-sense3-b.js`
     §2/§3) are the proof tests for the instrument.
   - *Guardrails:* win prices and deed gates untouched; the lever changes
     only how a launched party arrives and enters a fight.

## 4. Wall numbers (descriptive only — instrument arm, no lever)

| | dmgshape corpus (106181–106188) | sense3 fresh corpus (106251–106258) |
|---|---|---|
| seeds | 8 | 8 |
| encounters (wave-4+) | 156 | 143 |
| launches / quads | 16 / 6 | 4 / 3 |
| wins | 0 | 0 |
| national (standing ≥ 200) | 0 (3) | 0 (3) |
| table | 0 | 0 |
| wave 5 unlocked | 3/8 | 3/8 |
| wave 4 unlocked | 7/8 | 8/8 |
| survived 150d | 5/8 | 3/8 |
| median survival | 151d | 136d |
| deaths (all causes) | 711 | 682 |
| villages lost | 3/8 (d113, d128, d129) | 5/8 (d113, d128, d129, d136, d94) |

Fresh per-seed: 106251 survived, wave 4, standing 199, 8 encounters;
106252 survived, wave 5, standing 565, 34 encounters; 106253 village-lost
d113, wave 5, standing 275, 16 encounters; 106254 village-lost d128, wave
4, standing 199, 9 encounters; 106255 village-lost d129, wave 4, standing
199, 21 encounters; 106256 village-lost d136, wave 4, standing 199, 30
encounters; 106257 survived, wave 5, standing 440, 24 encounters; 106258
village-lost d94, wave 4, standing 150, 1 encounter. The band is
launch-thin as the prereg anticipated (4 launches vs 16 on the designated
band); no seeds were dropped and the band was not re-scoped.

## 5. Sense-test: reading the fights

All three-vid fights on the designated band were read in full for the
prereg; three fresh-band fights were read end to end here. The lines make
sense as things people would say and do — the failure is timing, not
coherence.

- **106253 d77, visjoin_56 (Elisa) vs Herald — 4 rounds, shout round 4,
  vFlee.** Rounds 2–3 carry the trick line — "Elisa holds the line — they
  know how this one is fought, and have not had their turn to prove it."
  — so the first hopeless round does not come until round 4, when Elisa
  is at 17 HP: "Elisa is losing — shouts for help! Wei charges in! / Wei
  answered Elisa's shout, but Elisa is past holding — they run while
  running still works." The shout and the flee land in the same break
  check. Sensical and bleak: the help arrives as the fighter leaves.
  This is the low-HP flee pattern from the designated band, live.
- **106257 d127, olivia_bennett vs Algorithm — 4 rounds, shouts 2/3,
  vFlee.** The clean ladder: "Olivia is losing — shouts for help! Elena
  charges in!" (round 2), "Olivia is still losing — shouts again! Brian
  charges in!" (round 3), then round 4 Olivia at 17 HP: "Olivia sees how
  this ends — and runs while running still works." The third shout would
  need a round-4 hopeless check; the fighter flees instead. This is the
  fight the d126 quad launch should have produced — but the sensed pair
  is Elena + Brian, not the launched Elena + Nadia + gen_o1xtjq7. The
  quad dissolved overnight; the ladder ran perfectly on the pair that
  remained. Round 1 also shows the fighter trying a peacemaker walk-in
  ("Olivia walks in open-handed — and it goes wrong. It doesn't want
  peace.") and getting punished for it before the shouting starts.
- **106257 d144, gen_o1xtjq7 (Salvatore) vs Network Note — 10 rounds,
  shouts 2/3, vKill.** The long fight the ladder needs: both shouts fire
  on schedule, the trio fights on, the monster dies in round 10.
  Salvatore's Rage ("eyes go red. Next 3 strikes hit twice as hard") and
  Blooded multipliers carry the damage (strikes for 102–110), and gear
  absorbs 58–81 per monster hit. With only 2 vids there is no third shout
  to fire even in a 10-round fight — the ladder has an empty third rung
  on master. The fight reads as a real party kill, not a solo with
  spectators: Nadia and Wanjiru strike every round after joining.

## 6. Metric review

- **Shout counts:** shout 1 fired 54 times, shout 2 fired 33 times on the
  fresh band (designated: 69 / 47). The ladder is alive; the third rung
  is missing, not the ladder.
- **Shout-2 rate in long fights:** 30/39 (77%) fresh vs 42/47 (89%)
  designated. Above the frozen 75% control bar, below the reference —
  the fresh band's long fights are shorter and harder-fought, consistent
  with the lower survival (3/8 vs 5/8).
- **Three-vid rate:** 8/156 (5%) designated, 0/143 (0%) fresh. The
  difference is Gate 1, not sampling noise alone: the fresh band's 3
  quads all dissolved (launcher stayed home twice, party churned once),
  while the designated band's tashi/sari parties held together.
- **Launches:** 4 fresh vs 16 designated — the fresh band is a
  launch-thin band (strikeband-b saw the same shape: 9 launches / 24
  fresh seeds vs 16 / 8 designated). Launch scarcity, not the sense, is
  why the fresh band has no three-vid fights to judge.
- **Wall:** no wins, no national, no table on either band; wave 5 reached
  3/8 on both. The instrument arm changes nothing in the game, so no
  wall movement was expected or is claimed.
- **Instrument errors:** 0 on all 8 fresh files and all 8 designated
  files. `slotAbsent: true`, `allyslot3Flag: null`, policy sha
  `1884c8852d38` on every fresh file. Leg anchor `0b3f965b1b86` (the
  instrument commit).

## 7. Instrument, proof, and notes

- **Prereg:** `evidence/2026-11-20/sim-sense3-b-prereg.md` (commit
  `410beadc7`), frozen before any judged sim. Fresh band 106251–106258
  verified fresh per the survey protocol. Base `d352834ef`.
- **Driver:** `scripts/sense3-driver-b.js` — copy of the dmgshape driver
  with `SLOT_ABSENT` enforced (the leg stops if slot code ever appears)
  and encounter rows gaining `intent` + `shoutRound`/`shout2Round`/
  `shout3Round` (pure reads of the engine's own shout bookkeeping).
- **Analyzer:** `scripts/analyze-sense3-b.js` — selftest 17/17 (synthetic
  classification fixtures, synthetic-dir census, driver smoke on one
  30d seed 106251). Census: `node scripts/analyze-sense3-b.js
  evidence/2026-11-20/perseed-sense3-b --json
  evidence/2026-11-20/sense3-b-analysis.json`.
- **Proof test:** `scripts/test-sense3-b.js` **20/20** — §0 base + slot-absent
  + policy-sha, §1 analyzer selftest, §2 staged ladder fixture (shout
  rounds 2/3, no third branch), §3 staged live-shape fixture (84 HP vs
  audit: 2 rounds, 1 shout, vFlee), §4 driver smoke, §5 frozen-corpus
  reproduction (156 / 8 / 0 / max-1-shout / 0-allyFromStart / 42-of-47 /
  end-cause taxonomy / 6 quads). No `check.js` gate was run — instrument-only
  arm; the proof tests are the gate (dmgshape-b §7.8 precedent).
- **Leg:** 8 seeds, 150d death-aware, substrate `SENSEEXPED=1 PARTYSIZE4=1
  VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 MODE=sense3`,
  no `ALLYSLOT3` in env. Runtime ~7.2 min, exit 0. Corpus
  `evidence/2026-11-20/perseed-sense3-b/` (8 files).
- **Telemetry check:** attempted as
  `node scripts/telemetry-check.js --baseline
  telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-20/perseed-sense3-b/*.json' --metrics
  national,table,wins,exiled` — could not run: the baseline file does not
  exist anywhere reachable (`telemetry-baselines/scale-wall.json` absent
  from this worktree, the main tree, and the goal workspace), so the tool
  died at the baseline read, verbatim: "Error: ENOENT: no such file or
  directory, open 'telemetry-baselines/scale-wall.json'". (The dmgshape-b
  §4 refusal was different — recorder-corpus, baseline present then.)
  No deviation recorded; the wall numbers in §4 are reported directly.
- **Prereg citation correction:** the prereg cites the hopeless
  `round >= 2` gate at `fieldFights.js:2538`; the gate is at line **2534**
  on this base. The claim (hopeless first evaluated at round ≥ 2) is
  correct; only the line number drifted. The prereg is frozen and was not
  edited; the correction is recorded here.
- **Staged gear:** the proof fixtures equip hide_armor + hunting_spear,
  measured back through `S.equipment` at armorP 30 / weapon bonus 30 —
  the top edge of the live launched-quad range (armor P 8–30, median
  ~18–24 from the v4gates rows), per the encounter-gear rule. Live
  quad-gate gear on the fresh band is all armed + armored (e.g. 106253
  d65: armorP 15/19/17; 106257 d127: 32/37/44).
- **No panel:** not a lever before/after — an instrument diagnostic. No
  game-code change, no default flipped, no lever built.

## 8. Blanks and findings notes for the coordinator

- **JUDGED VERDICT: GO** — the binding sense condition is identified
  (the dissolving quad + the three-hopeless-round wall) with
  encounter-level evidence on two live corpora, and the next lever shape
  (pin the quad + open the door) is concrete. M3b is vacuous on this band
  by the frozen prereg's own terms, not a miss: the fresh band could not
  replicate the three-vid case because its quads dissolved — which is
  Gate 1 evidence.
- **The "4th member's damage" question stays unmeasurable from live
  first-fights** until the next arm lands the lever: with the slot
  absent and the wall as it stands, no live fight ever carries a third
  ally, so `ally3Dealt` remains 0 everywhere. The staged fixture is the
  only place the third shout has ever fired (on the ported branch).
- **The next arm's prereg must choose** between the door variant and the
  second-hopeless-round variant of the lever, and must carry the
  encounter-gear rule into its staged proof (geared quad, live median
  entry HP 84).
- **Finding #2619** can be closed as answered (mechanism named); the
  follow-up is the lever arm, not more measurement of the slot.
