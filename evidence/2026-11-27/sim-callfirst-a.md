# sim-callfirst-a — EVIDENCE (NO-GO, CONCEPT-DEAD)

**Arm:** sim-callfirst-a · **Loop A run:** fleshout-20261128T0015Z · **Branch:** `sim-callfirst-a`
**Axis:** scale-onramp (the blocking axis; standing directive applies).
**Prereg:** `evidence/2026-11-27/sim-callfirst-a-prereg.md` (frozen 2026-11-28 ~00:55 UTC,
before any judged sim; committed e8d886a72). **Type:** LEVER PROBE, policy-side only —
no src/js changes. The lever lives in `scripts/policies/callfirst-a.js` (env-flagged,
default OFF) and is applied by the driver wrapping `Game.villagerFightAllies`.
**Base at pilot:** 94d7fef13 (worktree HEAD; prereg e8d886a72 + instruments 94d7fef13).
**Corpus:** `evidence/2026-11-27/perseed-callfirst-a-ctl/` + `perseed-callfirst-a-arm/`
(8 per-seed JSONs each).
**Analysis:** `evidence/2026-11-27/callfirst-a-analysis.json`.
**§15 panel:** `evidence/2026-11-27/callfirst-a-panel.md` (+ `.json`, `-before.json.gz`,
`-after.json.gz`), built by `scripts/build-callfirst-a-panels.js`.
**Determinism rerun:** `evidence/2026-11-27/perseed-callfirst-a-rerun/` (seed 112201 ctl,
hash-identical to the pilot file — see §6).

## §0. Verdict — NO-GO, CONCEPT-DEAD

The lever engaged exactly as designed — 17,250 reorders across the armed leg, the
strongest ally first in every fought fight with 2+ allies (23/23) — and the
fingerprint is visible in the damage shares (ally1 18.0% → 29.7%, lead 72.5% →
58.2%). It still kills nothing, and median damage per round went DOWN, not up.
The concept fails on its merits: calling the strongest ally first does not get
more damage into the opening rounds, because the opening rounds are not ordered
by the call-in list — they are ordered by the shout ladder's timing, and the
first ally still enters on round 3 in both legs.

| Frozen bar (§2) | Bar | Measured | Pass? |
|---|---|---|---|
| Pool floor, control | ≥ 8 fought fights | 9 | ✅ |
| Pool floor, armed | ≥ 8 fought fights | 23 | ✅ |
| Armed wave-4 vKills | ≥ 2 | 0 | ❌ |
| Median party dpr, armed vs control | ≥ 1.25x | 0.85x (40.0 vs 47.3) | ❌ |
| Starvation deaths, armed vs control | ≤ control + 2 | 6 vs 0 | ❌ |
| Median survival, armed vs control | ≥ 0.8x | 0.97x (146 vs 150.5d) | ✅ |
| Instrument errors, both legs | 0 | 0 | ✅ |
| Reorder check, armed leg | strongest first in every 2+ ally fight | 23/23 | ✅ |
| Lever engaged | ≥ 1 reorder fired | 17,250 | ✅ |

**Kill classification (§14a): CONCEPT-DEAD.** The mechanism was staged (17,250
reorders; 23/23 reorder check), the metric was fair (kill bar ≥ 2 against a
23-fight pool; dpr bar 1.25x against the leadworst probe's +26% lead-only lift),
and the concept failed on its merits — 0 kills, median dpr DOWN 15%, and the
cost bar breached (6 starvation deaths vs 0). Do not retry without a new
mechanism. The disposition: the policy file + driver + analyzer + evidence
land as the record; the lever does NOT ship (policy-side, default OFF — there
is nothing to revert in src/js, and the flag stays unset). No confirm spend.

## §1. The numbers, fight by fight (32 fought expedition wave-4 fights)

Columns: seed, day, monster, rounds, outcome, mHpStart, mDealt, party dpr,
lead wb, ally wbs (entry order), damage lead/ally1/ally2, first-strike round
ally1/ally2. mFlee = the monster fled (the only one in the corpus).

**Control leg (9 fights, 0 vKills, 6 vFlee, 3 vDie):**

| Seed | Day | Monster | Rounds | Outcome | mHpStart | mDealt | dpr | Lead wb | Ally wbs | Dmg L/A1/A2 | 1st strike A1/A2 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 112201 | 42 | reunion | 3 | vDie | 1277 | 142 | 47.3 | 17 | 18/14 | 119/23/0 | 3/— |
| 112201 | 42 | algorithm | 4 | vDie | 1037 | 194 | 48.5 | 18 | 14/4 | 148/37/9 | 3/4 |
| 112202 | 53 | congregation | 2 | vFlee | 1091 | 76 | 38.0 | 14 | 17/14 | 76/0/0 | —/— |
| 112203 | 118 | suburb | 4 | vFlee | 1326 | 80 | 20.0 | 3 | 18/8 | 19/49/12 | 3/4 |
| 112205 | 60 | audit | 4 | vFlee | 1241 | 192 | 48.0 | 17 | 9/14 | 134/40/18 | 3/4 |
| 112205 | 120 | reunion | 4 | vFlee | 1230 | 180 | 45.0 | 15 | 17/9 | 101/58/21 | 3/4 |
| 112206 | 112 | algorithm | 4 | vFlee | 1155 | 160 | 40.0 | 19 | 6/14 | 117/21/22 | 3/4 |
| 112206 | 113 | congregation | 1 | vDie | 959 | 79 | 79.0 | 19 | 15/6 | 79/0/0 | —/— |
| 112207 | 39 | eulogy | 5 | vFlee | 984 | 382 | 76.4 | 32 | 7/17 | 283/39/60 | 3/4 |

**Armed leg (23 fights, 0 vKills, 17 vFlee, 5 vDie, 1 mFlee):**

| Seed | Day | Monster | Rounds | Outcome | mHpStart | mDealt | dpr | Lead wb | Ally wbs | Dmg L/A1/A2 | 1st strike A1/A2 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 112201 | 54 | congregation | 1 | mFlee | 981 | 49 | 49.0 | 17 | 17/8 | 49/0/0 | —/— |
| 112201 | 59 | strike | 3 | vDie | 1077 | 143 | 47.7 | 17 | 8/4 | 127/16/0 | 3/— |
| 112203 | 99 | reunion | 4 | vFlee | 1389 | 89 | 22.3 | 6 | 12/8 | 37/37/15 | 3/4 |
| 112203 | 104 | reunion | 2 | vDie | 1266 | 11 | 5.5 | 6 | 20/14 | 11/0/0 | —/— |
| 112204 | 65 | reunion | 7 | vFlee | 1349 | 309 | 44.1 | 10 | 20/15 | 100/129/80 | 3/4 |
| 112204 | 86 | influencer | 4 | vFlee | 923 | 216 | 54.0 | 13 | 28/17 | 102/89/25 | 3/4 |
| 112204 | 86 | congregation | 5 | vFlee | 903 | 342 | 68.4 | 28 | 17/15 | 236/66/40 | 3/4 |
| 112204 | 95 | reunion | 4 | vFlee | 1290 | 174 | 43.5 | 17 | 15/15 | 109/43/22 | 3/4 |
| 112204 | 99 | eulogy | 3 | vDie | 1042 | 122 | 40.7 | 8 | 28/17 | 80/42/0 | 3/— |
| 112204 | 112 | eater | 3 | vDie | 1101 | 33 | 11.0 | 15 | 15/10 | 33/0/0 | —/— |
| 112204 | 118 | influencer | 14 | vFlee | 962 | 310 | 22.1 | 15 | 10/8 | 260/34/16 | 13/14 |
| 112204 | 126 | reunion | 9 | vFlee | 1268 | 238 | 26.4 | 15 | 12/8 | 186/39/13 | 8/9 |
| 112204 | 139 | influencer | 14 | vFlee | 865 | 372 | 26.6 | 15 | 29/22 | 273/71/28 | 13/14 |
| 112205 | 108 | timeslot | 4 | vFlee | 1520 | 142 | 35.5 | 12 | 17/7 | 78/47/17 | 3/4 |
| 112205 | 112 | editor | 4 | vFlee | 1626 | 163 | 40.8 | 17 | 15/7 | 103/42/18 | 3/4 |
| 112205 | 118 | algorithm | 9 | vFlee | 1004 | 419 | 46.6 | 17 | 15/7 | 181/143/95 | 3/4 |
| 112205 | 118 | network_note | 4 | vFlee | 1165 | 134 | 33.5 | 7 | 17/15 | 70/45/19 | 3/4 |
| 112205 | 122 | reunion | 3 | vFlee | 1206 | 67 | 22.3 | 7 | 17/15 | 43/24/0 | 3/— |
| 112205 | 124 | algorithm | 13 | vFlee | 1015 | 767 | 59.0 | 15 | 17/7 | 343/265/159 | 3/4 |
| 112205 | 125 | eater | 4 | vDie | 1086 | 85 | 21.3 | 7 | 17/15 | 61/24/0 | 3/— |
| 112205 | 130 | influencer | 2 | vFlee | 1028 | 21 | 10.5 | 17 | 17/15 | 21/0/0 | —/— |
| 112205 | 130 | suburb | 15 | vFlee | 1351 | 673 | 44.9 | 15 | 17/17 | 326/300/47 | 3/4 |
| 112207 | 34 | audit | 4 | vFlee | 1174 | 160 | 40.0 | 18 | 12/4 | 105/42/13 | 3/4 |

**Pooled:**

| | Control | Armed |
|---|---|---|
| Fought expedition w4 fights | 9 | 23 |
| vKills / vFlee / vDie / mFlee | 0 / 6 / 3 / 0 | 0 / 17 / 5 / 1 |
| Party dpr mean / median / max | 49.1 / 47.3 / 79.0 | 35.5 / 40.0 / 68.4 |
| Fights reaching ≥ 111 dpr | 0 | 0 |
| Total party damage | 1485 | 5039 |
| Damage share lead / ally1 / ally2 / ally3 | 72.5% / 18.0% / 9.6% / 0 | 58.2% / 29.7% / 12.0% / 0 |
| Median rounds until first ally strike | 3 | 3 |
| First-strike round median, lead / ally1 / ally2 | 1 / 3 / 4 | 1 / 3 / 4 |
| Strike-parse coverage | 1.000 | 1.000 |
| Reconciliation residual | 0.000 | 0.000 |
| Tally-vs-parsed max diff | 0 | 0 |

## §2. Secondaries — what the lever did and did not move

**The fingerprint is real.** The reorder changed WHO deals the damage: ally1's
share rose 18.0% → 29.7% while the lead's fell 72.5% → 58.2%, and the
parsed-per-role cross-check agrees with the tally split exactly on both legs
(max diff 0). The strongest ally really is answering the first shout now —
in the transcripts (§5) the wb-17 ally charges in on round 3 ahead of the
wb-15 ally. The lever is not a no-op and it is not mis-measured.

**The timing did not move at all.** Median rounds until the first ally strike
is 3 in both legs; first-strike round medians are 1 / 3 / 4 (lead / ally1 /
ally2) in both legs, identical. The shout ladder fires when the lead is
losing (hopeless-gated), not on a schedule — reordering the list cannot make
the first shout come sooner. In the armed leg's long fights the allies arrive
even later in absolute terms (first ally strike on rounds 8, 13, 14 in the
R9/R14 fights on seed 112204): the lead holds on alone for 8–13 rounds before
the hopeless branch fires at all. The opening rounds are still solo — the
lever reorders the queue behind a door that opens on the same schedule.

**Median dpr fell while total damage rose.** The armed leg dealt 5039 damage
across 23 fights vs 1485 across 9 — but its median fight is worse (40.0 vs
47.3). The pool itself grew: 56 wave-4+ encounter rows in the armed leg vs
31 in control, and the fought share rose (23/56 vs 9/31). The lever's
villages fight MORE wave-4 fights and worse ones — the extra fights are
short, low-dpr losses (5.5, 10.5, 11.0 dpr) that drag the median down. This
is trajectory divergence (identical seeds diverge once the lever changes a
fight's outcome — the leadworst note applies here too), not a per-fight
damage effect: on a per-fight basis the reorder's only measured effect is
the share flip. Either way the frozen dpr bar judges as written: 0.85x is a
miss, and the miss is not a measurement artifact — the median fight in the
armed leg really is a worse fight.

**The cost bar breached, concentrated in losing villages.** Starvation
deaths 6 vs 0 (bar ≤ 2): seed 112204 days 95/139/142, seed 112206 days
54/66, seed 112207 day 109 — all villagers, all on seeds whose villages
were lost or struggling. Community loss 1 → 5; total deaths 784 → 888;
median survival 146 vs 150.5d (0.97x, passes). The §15 panel independently
flags the same cost: village deaths per 100 days 67.1 → 91.1 (regression
signal, interval 7.2–39.4, does not straddle zero) and community loss
0.125 → 0.625 (regression signal). Whether the starvation is lever-caused
(the strongest villagers get pulled into fights first and more often) or
divergence noise, the primary bars fail on their merits regardless — the
classification does not hinge on the cost bar.

## §3. The mechanism autopsy — why strongest-first cannot work

The prereg's expectation was half right: the kill bar was expected to miss.
It was wrong about the dpr bar "partially closing" — it went down. The
mechanism, now measured:

1. **The shout ladder is timing-gated, not order-gated.** Allies join when
   the lead is losing (fieldFights.js hopeless branch), which on this band
   is round 3 at the earliest and round 8–14 in long fights. Reordering the
   list changes WHICH ally the first shout summons, never WHEN the shout
   fires. The strongest ally's strikes move from round 4 to round 3 at
   best — one round earlier, worth ~20–35 damage in a fight that needs
   ~500 more.
2. **The lead is still the hammer.** Even in the armed leg the lead deals
   58.2% of party damage. The strongest ally's extra strikes cannot close
   a 65-dpr gap (partydmg-a) when the whole party's median output is 40.
3. **More contact is not more winning.** The armed leg's villages fought
   23 wave-4 fights instead of 9 and unlocked wave 5 on 6/8 seeds (vs 3/8)
   — but lost 5 villages (vs 1) and won nothing. The lever buys contact,
   not kills.

The next lever on this axis should attack the shout timing itself (when the
first ally is allowed in — e.g. allies joining from round 1 when the party
travels together, or the hopeless threshold) or total party damage, not the
call-in order. Call-in order is closed as a lever.

## §4. Wall numbers (scale-onramp axis)

| Metric | Control (8 seeds) | Armed (8 seeds) |
|---|---|---|
| National reached | 0 / 8 | 0 / 8 |
| Table | null (not instrumented — never faked) | null |
| Wins | 0 / 8 | 0 / 8 |
| Wave-4 unlocked | 8 / 8 | 8 / 8 |
| Wave-5 unlocked | 3 / 8 | 6 / 8 |
| Median survival | 150.5 days | 146 days |
| Community lost | 1 / 8 | 5 / 8 |
| Scale ranks at end | regional 8 | regional 8 |
| Deaths | 784 total — starvation 0 | 888 total — starvation 6 |
| Standing at end (per seed) | 510, 320, 199, 175, 199, 175, 165, 505 | 199, 250, 390, 375, 450, 125, 480, 440 |

The scale wall stands: waves 4–5 unlock, villages still reach neither
national nor the table, and no seed wins on either leg. Death-cause shares:
control — expedition 284 (36.2%), villager combat 303 (38.6%), combat 119
(15.2%), the wild 37 (4.7%), starvation 0; armed — expedition 346 (39.0%),
villager combat 317 (35.7%), combat 123 (13.9%), starvation 6 (0.7%), the
wild 23 (2.6%).

## §5. Sense-testing — two armed-leg wave-4 fights (read in full)

SENSE-TESTING LAW: judge meaning, not counts. Both fights below are
expedition-origin wave-4 fights, staged by the competent policy: geared
villagers with parties, never fresh un-geared solo scholars.

### (a) The best armed fight — Joshua, Asher, Omar vs The Congregation, seed 112204, day 86 (5 rounds, 68.4 dpr, fled)

Joshua (starfall bow, wb 28) opens with a 4-shot volley (2 hit, 62 damage),
fights alone for two rounds, shouts at 37 HP — Asher (wb 17, the stronger
ally) charges in on round 3, Omar (wb 15) on round 4. Five rounds, 342
damage, and they flee with the monster at 561 HP because Joshua is at 20 HP.

> Joshua walks straight into The Congregation. No avoiding it.
> Joshua sees The Congregation coming and nocks an arrow — the fight opens at range (4 shots).
> R1: Joshua strikes for 43 (x1.3) (798 left)
> R2: Absolution hits Joshua for 16 (37 left)
> R2: Joshua stops mid-fight and binds the wound — field medicine, +20 HP.
> Joshua is losing — shouts for help! Asher charges in!
> R3: Joshua strikes for 42 (x1.3) (756 left)
> R3: Asher strikes for 21 (735 left)
> Joshua is still losing — shouts again! Omar charges in!
> R4: Joshua strikes for 46 (x1.3) (689 left)
> R4: Asher strikes for 21 (668 left)
> R4: Omar strikes for 20 (648 left)
> R5: Joshua strikes for 43 (x1.3) (605 left)
> R5: Asher strikes for 24 (581 left)
> R5: Omar strikes for 20 (561 left)
> R5: Absolution hits Joshua for 15 (20 left)
> Joshua sees how this ends — and runs while running still works.

Reads sensibly — and it is the lever working exactly as designed and still
not being enough: the stronger ally DOES answer first, the party swings
together for three rounds, and they still flee with the monster at 561 HP
(62% health). The volley, the field medicine, the two shouts, the flee at
20 HP all read as people making choices. One honest note: the lead's
strikes (42–46) are twice the allies' (20–24) even though the allies'
weapons are comparable (wb 17/15 vs 28) — the x1.3 multiplier on the lead's
strikes is doing visible work the allies don't get.

### (b) A typical armed fight — Samuel, Catalina, Dineo vs The Audit, seed 112207, day 34 (4 rounds, 40.0 dpr, fled, one ally dies)

Samuel (wb 18) fights alone for two rounds, shouts — Catalina (wb 12,
the stronger ally) charges in on round 3, Dineo (wb 4, kitchen knife)
on round 4 — and Dineo dies the same round she arrives.

> Samuel walks straight into The Audit. No avoiding it.
> R1: Assessment hits Samuel for 22 (58 left)
> R1: Samuel strikes for 28 (x1.3) (1146 left)
> R2: Samuel strikes for 33 (x1.3) (1113 left)
> R2: Assessment hits Samuel for 22 (36 left)
> Samuel is losing — shouts for help! Catalina charges in!
> R3: Samuel strikes for 29 (x1.3) (1084 left)
> R3: Catalina strikes for 21 (x1.3) (1063 left)
> Samuel is still losing — shouts again! Dineo charges in!
> R4: Samuel strikes for 15 (audited — half strength) (x1.3) (1048 left)
> R4: Catalina strikes for 21 (x1.3) (1027 left)
> R4: Dineo strikes for 13 (x1.3) (1014 left)
> R4: Assessment hits Dineo for 45 (0 left)
> Dineo goes down!
> Samuel sees how this ends — and runs while running still works.

Reads sensibly and grimly: the reorder put the stronger ally first, but
the second shout still sends the weakest villager into a losing fight to
die on arrival — she gets one 13-damage strike and a 45-damage Assessment
in return. Nothing robotic, nothing repeated verbatim. The audit's
half-strength trick lands mid-fight and reads as the monster fighting
back, not a system error.

**Judgment:** both transcripts read as coherent stories of geared villagers
fighting wave-4 monsters — the stronger ally visibly answers the first
shout, the shouts come when the lead is losing, the flees come at low HP.
The call-in order is now strongest-first and it reads that way. What the
transcripts also show is the mechanism verdict in miniature: the first ally
still arrives on round 3, the lead still fights alone for two rounds, and
the second call still feeds the weakest villager in last.

## §6. Instrument notes (what the corpus proved about the instruments)

- **Determinism, byte-identical:** seed 112201 control re-run after the
  pilot is hash-identical to the pilot file (sha256
  3f7722a45915c66720a35e75d4f015c886ea81e4d303d3f9df78561c447f0fb6,
  both files). The partydmg §6 `rowSeq` reset fix works — reruns are
  byte-identical without stripping. Baselines replicate exactly.
- **Tally semantics correction (caught during analysis, before the
  verdict was read):** the analyzer's first draft summed the row's
  `leadDealt + allyDealt + ally2Dealt + ally3Dealt` as the per-role
  split — which double-counts ally2/ally3, because the engine's
  `rec.allyDealt` is the TOTAL ally damage ("their own dealt tally
  (rec.ally2Dealt) feeding the shared rec.allyDealt total",
  fieldFights.js:2706-2723, 2730-2746). The first-draft shares
  (ctl lead 66.1% / ally1 25.1% / ally2 8.7%) were wrong. Fixed
  before judging: ally1 = allyDealt − ally2Dealt − ally3Dealt
  (lead = mDealt − allyDealt), which sums to mDealt exactly; the
  corrected shares are ctl 72.5/18.0/9.6 and arm 58.2/29.7/12.0.
  The tally-vs-parsed cross-check (new in the analyzer) now reads
  max diff 0 on both legs, and reconciliation is 0.000 on both.
  Partydmg-a's role split stands — it was parsed-strike based and
  never used the tallies this way. **The verdict does not depend on
  the correction:** kills, dpr, starvation, and survival are all
  read off outcomes / mDealt / deaths, never off the role split.
  The correction is recorded here so the next arm does not repeat
  the misread — and so the frozen dpr/kill bars were judged on the
  same numbers either way.
- **Coverage 1.000, reconciliation 0.000, tally-parse max diff 0,**
  both legs: every strike line attributes to a known fighter and
  every point of mDealt is itemized. The instrument is exact.
- **The reorder check is a real check:** 23/23 armed fights show
  wb non-increasing in entry order; the control leg shows 6/9
  (the partydmg order reproduced — the first-called ally is the
  weaker one in a third of control fights).
- **The pool is lumpy, again.** Seed 112204 carries 9 of the 23
  armed fights and 112205 carries 10; seeds 112201/112202/112203/
  112206/112207/112208 carry 0–2 each. The control pool (9) is
  small enough that its median (47.3) is a 9-fight median — the
  dpr bar is judged as written, but a confirm band would want the
  same lumpiness noted. No confirm is spent: the verdict is NO-GO.
- **Safe-commit clobber, three times:** after the prereg commit
  (e8d886a72) and the instruments commit (94d7fef13) the main index
  showed the committed files as staged-deleted. Both commits are
  correct on disk; the index was repaired from HEAD blobs
  (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`) and verified (`git status` clean, `git diff HEAD`
  empty) after each. Third strike pending on the evidence commit —
  same repair if it lands there.
- **Write flap:** probes (`git update-ref refs/heads/probe HEAD`)
  passed before every material write in this arm. No flap window
  was hit during this run.
- **Seed-band freshness, re-verified by this arm:** 112201–112208
  appear in no evidence file except the partydmg prereg + evidence
  (named-but-never-used fallback) and this arm's own files. No
  dedicated forbidden/contaminated band list exists in the goal
  hidden_files.
- **Proof test 28/28 + analyzer selftest 17/17** (re-run green
  after the tally-semantics fix; the fix added 2 selftest checks).

## §7. Metric review (frozen bars judge as written — no re-scoring)

- **The prereg's expectation is half overturned.** The kill bar
  was expected to miss, and it did (0 kills). The dpr bar was
  expected to "partially close" — it went DOWN (0.85x). The
  falsifier (≥ 2 armed vKills, or median dpr ≥ 1.25x) did not
  occur in either form. The verdict is NO-GO either way: the
  lever's job was to produce kills and lift dpr, and it did
  neither.
- **The starvation bar did more work than expected.** It was
  frozen as a guardrail (≤ control + 2); it breached at 6 vs 0,
  concentrated in three losing villages. Whether that is
  lever-caused or divergence noise is not settled by this band —
  but the verdict does not hinge on it: kills and dpr miss
  independently. Proposal for the NEXT run: any follow-up arm on
  wave-4 fights should pre-register the fought-share (fought /
  encountered) as a secondary, so pool growth from trajectory
  divergence is visible instead of arriving as a surprise in the
  dpr median.
- **The pool floor (≥ 8) was the right size for the armed leg
  (23) and barely met for the control leg (9).** A 9-fight
  control median is noisy — but the armed median (23 fights) is
  the one that has to clear 1.25x, and it is 0.85x with room to
  spare in the wrong direction. No metric change is proposed for
  the frozen bars. The bars judged as written.
- **No re-scoring happened.** Kills, dpr, starvation, survival,
  errors, reorder, engaged — all judged against the frozen bars
  as written. The tally-semantics fix (§6) corrected the
  instrument's role split before the verdict was read; it changed
  no frozen bar and no judged number except the secondary shares.

## §8. Next arm (named from the proof)

1. **Shout timing (the open question this probe leaves,
   sharpened).** The first ally still enters on round 3 at best
   (median, both legs) and round 8–14 in long fights — the
   hopeless gate, not the call-in order, sets when help arrives.
   The next arm measures the shout gate itself: when the
   hopeless branch fires, how many rounds the lead fights alone
   across the band, and what the fight would look like if the
   party entered together from round 1 (or on a lower hopeless
   threshold). That is a timing diagnostic, not an order tweak.
2. **The flee-at-low-HP rule (partydmg-a §8.2, still open).**
   The best armed fight fled with the monster at 561 HP and the
   lead at 20 HP; the typical one fled after the weakest ally
   died on arrival. How often does a party flee a fight it would
   win next round, and what HP threshold drives it?
3. **The 4th seat (partydmg-a §8.3, still open).** Every fight
   on this band had at most 3 fighters; ally3 dealt 0 damage on
   both legs. Whether the seat never fills or never joins is
   still a census question.

## §9. Village assessment (plain words)

Eight villages, 150 days each (death-aware). The control
villages: seven survived the full 150 days, one was lost on day
115; they ended regional, at standings 165–510, having fought
nine wave-4 fights between them and killed nothing. The armed
villages: three survived, five were lost between days 67 and
146; they ended regional too, at standings 125–480, having
fought twenty-three wave-4 fights and killed nothing — and
starved six villagers the control villages never starved.

The parties in these villages fight wave-4 monsters the way the
numbers say: three villagers walk in, the leader swings first
with whatever is in their hands, the strongest friend now
answers the first shout instead of the weakest — and it does not
matter, because the shout still comes on round 3 and the monster
still has 60–85% of its health when the party runs. The strongest
friend's strikes are worth more than the weakest friend's, and
the party's damage still falls short by half. The blank this run
filled is the call-in itself: the order was never the binding
constraint. The strongest ally arriving first is a better story
and a worse median — the villages that call their best fighters
first fight more, lose more, and starve more, while still
killing nothing. The blank that remains is the shout itself —
why help only arrives when the leader is already losing, and
why a party walks away from a monster it could kill next round.

## §10. §15 balanced panel (instrument, not judge)

`evidence/2026-11-27/callfirst-a-panel.md` (8 paired seeds).
Decision: **review_required**. National 0 → 0, table wins 0 → 0,
community loss 0.125 → 0.625 (paired delta +0.5, 95%
exploratory interval 0.125–0.875 — regression signal); village
deaths per run 98 → 111 (paired delta +13, interval −9.75 to
+35.75 — regression watch, straddles zero); village deaths per
100 days 67.08 → 91.14 (paired delta +24.06, interval 7.22–
39.38 — regression signal). Survival-30/60 1 → 1. The panel
agrees with the judged verdict and strengthens the cost side:
the armed leg's villages die more per day and lose communities
more often, with no win/national movement to trade against it.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
`hidden_files/telemetry-baselines/scale-wall.json` REFUSED the
corpus by design: the per-seed files carry top-level
`anchorCommit`, so the tool treats them as sweep recorder rows,
not runs ("compared with sweep-compare tables, never against a
run baseline here"). No baseline was rolled forward. The raw wall
numbers are in §4 (national 0, table 0, wins 0 both legs) — no
LOUD deviation to investigate, and no `--update-baseline` was run.

## Convergence state

Scale-onramp axis: still the blocking axis. Wall numbers on this
band: national 0/8 both legs, table 0, wins 0, wave-4 unlocked
8/8, wave-5 3 ctl / 6 arm, median survival 150.5d ctl / 146d
arm. Call-in order is now measured and closed as a lever: the
strongest ally really does answer first (share flip + 23/23
reorder check + 17,250 reorders), the first ally still arrives
on round 3, median dpr falls, kills stay at zero, and the cost
bars breach. The binding constraint sits one level down — the
shout timing itself (§8.1), not who the shout summons.

## Canon note

`docs/CANON.md` and `docs/MONSTER-WAVES.md` read; wave-4 band
(damage 35–95, HP 850–1500) cited from canon. No canon doc
covers call-in order, the shout ladder, or the wave-4 kill line
— the ~111/round line is a leadworst-a measurement, not canon;
the reorder rule is this arm's lever definition, frozen in the
prereg, not a canon claim. Mechanism cited from code
(`party-wiring.js` villagerFightAllies, `villager-agency.js`
expeditionMonster, `fieldFights.js` shout ladder + tally
semantics).
