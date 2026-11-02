# sim-trustbleed-a — does anything recover trust after a refusal?

Run: fleshout-loop-a-20261102T0045Z, arm sim-trustbleed-a, axis scale-onramp.
Worktree branch: sim-trustbleed-a. Prereg:
evidence/2026-11-01/sim-trustbleed-a-prereg.md — committed BEFORE any
judged sim (commit 69593034). Judged against it below; no bar was
changed mid-run. DIAG/instrument only: zero `src/js` changes, no gates,
stages, deed bars, or win prices touched, nothing from the #1538
steve-call queue built. No [needs-eyes] (measurement only).
Panel (§15): NOT APPLICABLE — single-arm DIAG census on identical
seeds, same declaration class as muster3/musterroster-adopt.

## Verdict (prereg rule): recovery EXISTS — and the 2315 bleed is not a refusal doom loop

- Recovery EXISTS: ≥1 link on ≥2 pilot seeds re-reaches the trusted
  tier (trust ≥ 70 AND opinion ≥ 10, titans.json trustedAt 70 /
  trustedOpinion 10) after the first refused Herald attempt — met on
  THREE seeds: 90111 (all three links, days 76–77), 90221 (Stonebridge
  day 91, Thornfield day 89), 90220 (Thornfield day 172).
- The named recovery mechanism is the ordinary relationship system,
  not anything refusal-specific: weekly grain tending (+8 per link,
  tendLink), weekly tribute (+1, paid or waived), shared-granary court
  feasts (+10 landing on 90111; on 90260 the feast's +7 is gagged by
  mourning — "theirs waits"), and accepting a linked fire's road food
  (+4). Refusals do not interrupt it.
- The 2315 bleed is REAL but misattributed: on the intervened 90111
  twin (call sounded day 72, same as musterroster-adopt), the bleed
  reproduces exactly (69→4, 48→0, 57→0, all links broken day 103,
  village lost day 107, 92 refused attempts). Its cause is NOT the
  refusals — it is the sounded-but-unfed muster: −2 trust per mustered
  link per day of hunger upkeep (titans.js titanMusterUpkeep), firing
  every day from day 73 to day 107 while the muster is fed 0–270 of
  7,000–9,000 kcal/day. The refusals keep coming because the muster
  never reaches 10 blades (6 allies + declining Haven blades 3→2→1),
  so the Herald is never fought, the muster never resolves, and the
  hunger never stops. That is the doom loop — sounded-muster hunger,
  not refusal. The delivery spec for a future arm is below; nothing
  was built in this run.

## Pilot band (MODE=observe, no call sounded)

Screen (preregistered): base 90201 upward, cap 60 seeds, qualifier =
≥1 REFUSED Herald attempt AND ≥1 active link on the first-refusal
day. Scanned 90201–90260 (60 seeds): 6 qualifiers (10%) — 90215,
90220, 90221, 90233, 90236, 90260, in scan order. The prereg aimed
for 7 fresh + 90111 = 8; the screen yielded 6, so the pilot band is
7 seeds, not 8. This is a screen outcome, not a moved bar: the
verdict rule needs ≥2 seeds and fires cleanly on 7, and no further
qualifiers exist inside the preregistered screen. Confirm (12–16
seeds) was NOT run: instrument GO was met (below) but the screen is
exhausted — there are no next qualifiers to confirm on without
extending the screen past its preregistered cap, which this arm does
not do. The low yield itself is a finding: under this policy stack,
35/60 screen seeds win (lesser-seat wins, days ~90–120) before or
without ever meeting the Herald, censoring the titan window — the
same censoring the heraldarr2 screen filtered with gameDays > 120
AND won == 0.

| Seed | First refusal | Herald attempts (refused/fought) | Links at refusal | Recovery (trusted tier) | End |
|---|---|---|---|---|---|
| 90111 | day 72 | 130 / 0 | Emberhold 69, Stonebridge 48, Thornfield 57 | all 3, days 76–77 | lost day 140, maxWave 5 |
| 90215 | day 114 | 8 / 0 | Emberhold 77, Thornfield 92, Ashford 84 | none (all already ≥ tier; see note) | won day 122, maxWave 4 |
| 90220 | day 121 | 133 / 0 | Emberhold 43, Stonebridge 44, Thornfield 56 | Thornfield day 172 | survived 181d, maxWave 4 |
| 90221 | day 83 | 3 / 0 | Emberhold 91, Stonebridge 68, Thornfield 68 | Stonebridge 91, Thornfield 89 | lost day 100, maxWave 4 |
| 90233 | day 90 | 5 / 0 | Stonebridge 65, Ashford 73, Hungry Road II 47 | none (2 days to end) | won day 92, maxWave 4 |
| 90236 | day 95 | 45 / 0 | Emberhold 88, Stonebridge 92, Thornfield 53 | none (already ≥ tier or below, never crossed) | won day 104, maxWave 4 |
| 90260 | day 77 | 64 / 0 | Emberhold 84, Thornfield 69, Stonebridge 67 | none | won day 96, maxWave 4 |

Notes: "already ≥ tier" — 90215's links sit at 77/92/84 at first
refusal and stay trusted; staying trusted is not a recovery event
per the prereg, correctly. 90233's village ends 2 days after first
refusal (won day 92), so its post-refusal window is 2 days — data,
not a recovery test. 90260's links fall after refusal (net −11/−20/
−16) but stay active at 73/49/51 — decline without doom. Zero links
dissolve anywhere in the observe band: all 21 links end `active`.

Refusal-day check: on 6 of 7 pilot seeds, NO link changes trust on
the first-refusal day at all. The exception, 90260 day 77, is a
coincidence with a named cause: all three links take −8 the same day
from succession haircuts ("pressed tribute down in Haven's chaos",
funeral line "speak for Gani" that day) — a Haven leader death, not
the refusal. The court feast the same day (+7, "theirs waits" for
grieving fires) is gagged by mourning, so the net is −8. No pilot
seed ever sounds the call (soundTitanCall 0 everywhere), so no
−8 call-refusal ever fires in the observe band.

## The intervened twin (MODE=intervene, seed 90111 — diagnostic, not judged)

Reproduces the 2315Z timeline exactly: call sounded day 72, 6 allies
(2+2+2) + Haven commit, 92 refused Herald attempts, village lost
day 107, maxWave 4, national 0 — vs observe 130 attempts, day 140,
maxWave 5, national 1 (end-rank). The same seed, the same policy
stack, the only difference the sounded call — so the bleed belongs
to the intervention, not the refusals.

Causal census, intervened 90111 (110 deltas, 0 unattributed):

| Cause | Movement | Deltas | What it is |
|---|---|---|---|
| muster-hunger | −110 | 55 | −2/link/day, every day 73–107 |
| succession | −108 | 12 | leader-death haircuts −8/−10 |
| titan (night strikes) | −31 | 4 | Herald strikes allied village −5 (titans.js:291) |
| tended | +72 | 9 | grain tending +8, last on day 85 |
| tribute | +27 | 12 | weekly +1 (paid/waived) |
| say-trust (road food) | +56 | 14 | accepting a fire's road food +4 |
| muster-hunger+food-accept | +8 net | 4 | hunger −2 + food +4 = +2 days |

The hunger metronome: the hunger line fires all 35 days 73–107
("The muster is hungry — 0 of 9,000 kcal fed", later 0–270 of
7,000–8,000 as Haven blades decline). 55 link-days × −2 = −110.
Weekly arithmetic against it: hunger −14/week/link vs tending +8
(once/week/link) + tribute +1 = −5/week even when tended perfectly
— before succession haircuts and night strikes. And tending stops
landing: lastKeptDay freezes at 85 while mourningUntil chains
85→93→104 through the death cascade, and _trustGain (the single
choke point for ALL gains) returns 0 during mourning — while hunger
is a direct assignment that bypasses the choke entirely. Losses
continue during grief; gains do not. That asymmetry is the loop's
engine, and it is invisible in the game's own records: hunger writes
NO link.history entry (the attribution channel is blank for 55
deltas until this instrument names them from the hunger line), and
the hunger line itself never states a number ("loyalty strains when
the food runs thin").

Endgame of the loop: day 103, all three links break simultaneously
(history kind `broken`, "Link broken (succession)") — Emberhold at
trust 4 included — matching the 2315 "no active links by day 103"
exactly. The village then dies day 107 with no allies left.

## Pooled observe-band census (430 deltas, 0 unattributed)

Tended +536 (66), tribute +271/−122 (169), say-trust +483/−21 (99,
mostly road-food +4s; the −21 is one gift-revocation day on 90260
— "They take back the trust your gift earned. (Trust −7.)" on all
three links at once),
succession −401 (51), titan strikes −140 net (29), court +82 (5),
accord +94 (5, first-gesture gifts), aid +13 (1), renegotiation
−24 net (5). Instrument GO met: unattributed share 0.000 (bar
≤ 0.10), instrumentErrors 0, musterErrs 0 on all 7 pilot seeds.
Validator scripts/test-trustbleed-a.js cross-checks every pilot
file independently (first-refusal day, pre-refusal trust, recovery
day, trust-at-130, final trust, unattributed count): all PASS,
7/7 files.

Census limitation, stated: on composite days (several mechanisms
one day — e.g. 90111 day 77: court feast +10 and tending +8 land
together for +18; day 76 Thornfield: tended +8 and titan strike −5
net +3), the delta is attributed to the first named mechanism and
the net is carried under that cause. Completeness is unaffected
(0 unattributed), but cause totals on composite days are net, not
parted. The headline patterns (hunger metronome, succession drag,
tended lift) rest on single-mechanism days, where attribution is
exact.

## Sense-test (SENSE-TESTING LAW — transcripts read)

- Refusal narration never mentions trust. Every muster-refusal
  line in the band is the gate's arithmetic: "You cannot face this
  alone — sound the call, muster 10 allied blades (you have N).
  This is not courage. This is arithmetic." The player is told the
  blade count, never that trust is at stake — which is honest in
  the observe band (refusals cost nothing) and a trap in the
  intervened band (the cost arrives later, via hunger, unnumbered).
- The hunger line is the only warning the sounded muster gives,
  and it understates: "Bellies remember who feeds them. (loyalty
  strains when the food runs thin.)" No number, no per-link effect,
  no history entry. A player watching the link screen would see
  trust fall 2/day with no event attached — the exact "silent trust
  loss" the task asked about, confirmed on the intervened twin and
  absent (correctly) on refusal days.
- Drift warnings work as designed (trust_drift_is_voiced): when a
  seasoned-age link crosses below 40 trending down, the village
  says the bond is cooling, once per crossing, no numbers. They
  fire in both bands (observe: 90220 Stonebridge day 127,
  Emberhold day 140; intervened: all three crossings) — and they
  correctly never appear as a delta cause, because the watch
  writes no trust: it is voice only, and this instrument does not
  let voice claim a number.
- Human moments that do land: road-food accepts ("Kenji clasps
  your runner's shoulder. 'That's what the fire network is FOR.'
  (Trust +4.)"), court feasts ("They count it anyway"), funeral
  lines ("At the grave, ... speak for ... — '... trusted them. We
  saw it.'"). No robotic repetition beyond the game's own repeated
  gate line across 133 refusals on 90220 — that repetition IS the
  stuck gate, already documented, not new.
- Raid "(Trust −10.)" lines do NOT move link trust: on observe
  days where the raider is itself a linked village (Thornfield
  raids days 73–74 on 90111), the raider's link shows zero delta.
  Raid trust is a different trust (standing with the raider, not
  the link's trust) — the analyzer excludes raid lines from link
  attribution for this reason, and the evidence does not claim
  raids as a trust cause. The narration is ambiguous about whose
  trust falls; flagged for the backlog, not fixed here.

## Wall numbers (this arm's band only, never pooled with other arms)

Pilot band (7 seeds, MODE=observe, end-of-run fields — national =
end scaleRank national/global, NOT ever-national; see metric
review): national 6/7, table 4/7, wins 4/7, wave-4 reach 7/7,
wave-5 reach 1/7 (90111 only), median survival 104d, max 181d.
Death-cause shares (run samples, n=247, not a full census):
combat 120, villager combat 62, the wild 34, monster 9, arena 6,
expedition 6, wound 2, ambush 2, starvation/dehydration/The
Suburb/The Eater/stranger/the night 1 each.
Intervened twin (diagnostic, 1 seed): national 0, table 0, won 0,
maxWave 4, 107d, village-lost.
Screen band (60 seeds, 90201–90260, end fields): national 46/60,
table 39/60, wins 35/60, refused-Herald qualifiers 6/60.

## Village assessment (plain words)

Left alone, the village's friendships hold through the Herald's
refusals. It keeps being told "you can't face this alone," keeps
not facing it, and its allies do not punish it for asking — the
grain keeps flowing the other way, the feasts keep being shared,
and three fires climb back over the trusted line while being
refused 133 times. The friendships that do die are the ones the
village itself commits to a war it cannot feed: sound the call,
feed nobody, and every day each ally quietly loses a little more
faith — two points, every day, with no letter, no ledger entry,
no number anywhere — until grief piles on grief, the tending
stops working because everyone is mourning, and one more funeral
snaps all three bonds on the same day. The village doesn't lose
its friends by asking. It loses them by mustering hungry.

## Delivery spec for a future arm (NOT built here — design, with numbers)

The sounded-muster hunger loop, in the order a future arm should
take it (each item measured before/after on identical seeds):

1. NUMBER AND NOTE THE COST (cheapest, narration-only): the hunger
   line must state the trust price ("trust −2 per fire per day")
   and titanMusterUpkeep must write a link.history entry per link
   per day (kind `muster-hunger`, amount −2). This alone turns a
   silent bleed into a legible one; it changes no balance. Judge
   by: hunger deltas attributable from history alone, 0 unattributed.
2. FEED FROM THE PANTRY, NOT ONLY THE SCHOLAR'S PACK: upkeep today
   draws via playerPackSpend (0–270 of 7,000–9,000 kcal/day landed
   under this policy — the scholar's pack cannot carry an army).
   Spec: draw upkeep from Haven's pantry first (tribute grain
   lives there), scholar's pack second, and say which source fed
   how much. Measure pantry weeks-to-empty at 9 blades before
   landing; if the pantry cannot carry it either, the honest
   answer is (3), not a bigger draw.
3. SAY THE BREAK-EVEN ALOUD: breaking a short muster costs −5
   trust once per link (titans.js break path) vs −2/day/link
   forever while it stands. When a muster has been short for 7
   days, say so ("break it for −5 once, or keep bleeding −2 a
   day") — the rational choice exists today but nothing tells
   the player. Judge by: short musters broken before day-103
   snaps on identical seeds.
4. CLOSE THE CEILING LOOP (the 2315 quota bind, still open): a
   muster at 6 allies + declining Haven blades can never reach
   10, so hunger is perpetual by construction. Any fix to (1)–(3)
   must be judged together with quota-at-trigger: either the
   muster resolves (fight or release) or the hunger stops. A
   hunger fix that leaves short musters standing forever still
   bleeds, slower.
5. MOURNING ASYMMETRY (measure, then rule): gains go through the
   _trustGain mourning choke, hunger does not. A future arm
   should measure whether hunger during mourning is intended
   (grief should not be a trust tax with no recovery path) and,
   if not, route hunger through the same choke or pause it while
   a link grieves. This is a design ruling to confirm, not a
   silent retune — flag it steve-call if the measurement is
   contested.

## Blanks filled / documented

- FILLED (evidence): the refusal doom loop is DISPROVEN as stated
  — refusals move trust by exactly 0 on 6/7 pilot seeds (the 7th
  is a succession coincidence, verified); trusted-tier recovery
  after refusals is proven on 3 seeds with a named mechanism.
- FILLED (evidence): the 2315 bleed is fully attributed — hunger
  −110, succession −108, titan strikes −31, against tended +72,
  tribute +27, road food +56 on the intervened twin; 0
  unattributed on both twins.
- DOCUMENTED (not fixed, out of scope): the sounded-muster hunger
  loop + delivery spec above; the day-103 succession snap (all
  links incl. trust-4 Emberhold — what makes a link snap-eligible
  at trust 4 deserves its own instrument); raid-trust narration
  ambiguity; refused-Herald rarity under this stack (10% yield,
  early wins censor the window).
- NOT touched per task bounds: #1538 steve-call queue, gates,
  stages, deed bars, win prices, any src/js.

## Metric review (no bar changed here)

1. "Dips below tier, then re-reaches" counts links already below
   tier at first refusal (90221's 68s, 90220's 56, 90111's 69/48/
   57). Those events are continuations of a climb through
   refusals, not repairs of refusal damage — which is precisely
   the question ("does anything recover trust after a refusal?"
   reads as "can trust reach the tier despite refusals?"), but a
   future arm that wants repair-after-damage must pre-register a
   stricter rule (link AT tier at refusal, then below, then back).
   The verdict stands as written; the distinction is recorded,
   not used to re-score.
2. trustAt130 for seeds ending before day 130 (90221/90233/90236/
   90260) is the final value, not a day-130 value — the tables
   above use it as net-to-end for those seeds. A future arm
   should name the field net-to-last-observed when the horizon
   is death-aware.
3. Composite-day attribution (first named mechanism carries the
   net) keeps the census complete but smears cause totals on
   multi-mechanism days. A future instrument could snapshot at
   day-part granularity to part composites; daily granularity was
   sufficient for the verdict because the headline mechanisms
   each own dozens of single-mechanism days.
4. National here is END-of-run scaleRank, not ever-national: the
   2315 round's telemetry-check note (tool 0 vs worker ever-1 on
   85106) is the same distinction. Named here so the next
   comparison does not mix them.
5. Confirm not run (screen exhausted, §pilot band). This is a
   prereg outcome, not a skipped gate: GO was met, but the
   preregistered screen contains no further qualifiers. A future
   arm wanting a confirm must pre-register a new screen (and
   should expect ~10% yield under this stack, or screen on the
   tableseat-nowait substrate where Herald contact is common).
6. Policy-stack shorthand correction (from the prereg, before any
   sim): the task named tableseat-nowait + wavegate-diag, but the
   musterroster replay — the stack that produced the bleed —
   uses leadfeast + windefer + seatdrive + fullseat-diag. This
   arm used the latter, so the intervened twin reproduces 90111
   exactly (92 refusals, day 107). Using the other substrate
   would not have reproduced the reported timeline.

## Corpus

evidence/2026-11-01/perseed-trustbleed-a/ — pilot/ (7 per-seed
observe JSONs, judged), pilot-analysis.json (analyzer output),
diag-s90111-intervene.json + diag-s90111-intervene-analysis.json
(diagnostic twin), screen-*.stdout/stderr (60-seed screen record).
Instruments scripts/trustbleed-replay-20261101.js,
scripts/trustbleed-analyze-20261101.js;
validator scripts/test-trustbleed-a.js (7/7 files PASS, verdict
recomputed independently: recoveryExists=true,
recoverySeeds=[90111,90220,90221]).
