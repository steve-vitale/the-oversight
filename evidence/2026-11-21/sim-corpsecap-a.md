# sim-corpsecap-a — corpse-cap gun sink DIAG (finding #2635 follow-up)

- Arm: sim-corpsecap-a (DIAG), Loop A run fleshout-20261121T2315Z, arm 1 of 3.
- Base master: `c55bc8503` (worktree `~/workspace/worktrees/sim-corpsecap-a`;
  fetched tip `cb20cd650` is an ancestor of this HEAD — the worktree already
  sat on the current master tip; no rebase was needed at cut).
- Prereg: `evidence/2026-11-21/sim-corpsecap-a-prereg.md` (committed `315b20c34`,
  frozen ~23:25 UTC 2026-11-21, before any judged sim).
- Instrument commits: `110736f74` (driver + analyzer + panel builder + proof
  test).
- Horizon: 150d death-aware. Seeds: 107271–107278 (fresh band, verified unused).
  Policy: competent (verbatim). Substrate: `GUNRATE=1 CELLGATE=1` +
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1
  SPEARGATE=1` (same as grantrate/tier4access/killlootbundle). `LEND` unset,
  `PRESENCE` unset.
- One leg (diag). No lever phase ran: the frozen diag rule fires on 0 losses.

## Verdict: DIAG-NO-GO on the sink

**The cap is real, it fires constantly, and it ate zero guns on this band.**
301 cap culls across 8 villages in 150 days — the corpse list sits pinned at
its 40-cap with 38–40 bones corpses on every late census — and **0 cap gun
losses**: not one culled corpse carried a searcaster. 32 gun-days stranded on
corpses (27 on one corpse, 5 on another), both guns survived: one was
recovered by the scholar the day its holder died, the other is still sitting
on its corpse at the end of the run, 76 death-days behind the cull frontier.
Per the frozen diag rule (prereg §6 bar 3), **no lever is built and none is
forced**: the CORPSECAP exemption stays unwritten, no game code changed.
The 107237 loss (grantrate §4) is real but rare — it needs a fast-dying
village and a long-unrecovered corpse gun, and this band had neither at once.

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| Instrument validity (proof test 100% + analyzer selftest + 0 errors + every cull carries corpse id + items + census contiguous) | all must hold | proof test 30/30 green (staged cull caught live: gun total 1→0); analyzer selftest 32/32 green; instrumentErrors 0; cullInvariantBad 0 (301/301 culls satisfy stage-4 + pre ≥ 40 + post == pre); censusGapBad false | ✅ |
| Coverage (100% prize↔roll joins; 100% searcaster grants attributed; 0 unexplained gun losses) | all must hold | 199/199 prize calls joined; 6/6 searcaster grants attributed (all contest-prize); 0 unjoined, 0 orphan rolls, 0 unattributed grants, 0 ungranted searcaster rolls; 0 gun-total losses, 0 unexplained | ✅ |
| Answer quantified (per-seed table + culls + cap gun losses + gun-days stranded + wall numbers) | all must hold | §1–§5 below: per-seed table, 301 culls, 0 losses, 32 stranded gun-days, wall numbers | ✅ |
| Diag rule (≥ 1 cap gun loss → build lever; 0 → DIAG-NO-GO) | frozen rule | 0 cap gun losses → **DIAG-NO-GO on the sink** | ✅ (rule fired) |
| Lever GO | n/a — lever phase did not run | — | — |

## Wall numbers (diag leg, 8 seeds)

| Metric | Value |
| --- | --- |
| Wins | 0/8 |
| National scale access | 0/8 |
| Table | not instrumented (null) |
| Wave 5 reached | 3/8 (107272, 107273, 107277) |
| Wave 4 reached | 8/8 |
| Median survival | 150.5 days |
| Community lost | 2/8 (107274 d121, 107275 d121) |
| Standing at end | 199, 455, 490, 175, 199, 199, 315, 175 |
| Starvation deaths | 0 on all 8 seeds |

The scale wall still binds: no village reaches national, none wins. This arm
was a diag on the corpse-cap sink, not a scale lever — the wall numbers are
recorded, not moved.

## Per-seed table (diag)

| Seed | Days | End | Wave | Standing | Deaths | Culls | Cap gun losses | Gun-days stranded | Searcaster grants (days) | Corpse-takes of a gun |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107271 | 151 | survived | 4 | 199 | 59 | 19 | 0 | 0 | 0 | 0 |
| 107272 | 150 | survived | 5 | 455 | 93 | 53 | 0 | 0 | 0 | 0 |
| 107273 | 151 | survived | 5 | 490 | 102 | 62 | 0 | 0 | 0 | 0 |
| 107274 | 121 | village-lost | 4 | 175 | 70 | 29 | 0 | 0 | 0 | 0 |
| 107275 | 120 | village-lost | 4 | 199 | 75 | 35 | 0 | 5 | 1 (93) | 1 (d113) |
| 107276 | 150 | survived | 4 | 199 | 81 | 41 | 0 | 0 | 2 (126, 150) | 0 |
| 107277 | 152 | survived | 5 | 315 | 82 | 42 | 0 | 27 | 2 (93, 95) | 0 |
| 107278 | 151 | survived | 4 | 175 | 60 | 20 | 0 | 0 | 1 (119) | 0 |
| **Band** | | **2 lost / 6 survived** | | | **622** | **301** | **0** | **32** | **6** | **1** |

Band totals: 130 contests fired, 199 prize rolls, 25 tier-4 rolls, 6
searcaster grants (4.6% per contest, 3.0% per prize roll — the grantrate
rate reproduced almost exactly: 4.2% / 3.0% there). 4 of 8 villages never
see a gun; the two granting seeds that got a second grant (107276 days
126+150, 107277 days 93+95 — both second grants to the SAME holder) are
new against grantrate's 0 second grants, and are a grant-stream fact, not
a cap fact. 0 kill-loot searcaster drops on the band.

## 1. The cap, measured — a FIFO queue ~40 deep

The splice fires exactly as the code read says, 301 times: whenever a death
pushes the list past 40, the oldest stage-4 ('bones', 8+ days) corpse is
removed, items and all. The analyzer's invariant holds on all 301 culls
(culled corpse always stage 4, pre-call list ≥ 40, post-call list == pre-call
list: one pushed, one spliced). The list sits pinned at 40 from the early
game on every seed (maxCorpseListLen 40, maxBones 38–40) — the cap is not a
rare edge, it is the steady state once a village has buried 40 dead.

What the cap eats is therefore decided by QUEUE POSITION, not by the gun:
a corpse gun is safe until the FIFO frontier drains to it, and the frontier
advances one corpse per death, oldest first. The two stranded guns show the
arithmetic:

- **107277 — the 27-day stranded gun, still alive at the end.**
  gen_3nav8pt wins two guns (days 93, 95; 4 cells — both grants redirect to
  him). He is the scholar when he dies "the wild" day 125; one gun lands on
  his corpse (`corpse_125_qjcl3u`), the other is equipped on the living
  xavier_dubois (a transfer the instrument does not attribute — see §4).
  The corpse gun sits 27 days (125–151), never taken, never culled. Why
  not culled: the 9 culls after day 125 take corpses that died days 43–49
  — the frontier is 76 death-days behind the gun corpse. At the post-125
  death rate (9 deaths in 26 days, frontier advancing ~0.67 death-days per
  cull), reaching the day-125 corpse needs ~110 more deaths, ~300+ days.
  The gun would outlive the run by a wide margin.
- **107275 — the 5-day stranded gun, recovered.** giulia_bianchi wins the
  gun day 93 (redirect matched, 2 cells), dies "alien" day 113, and the
  scholar takes the searcaster from her corpse the same day (the band's
  only corpse-gun recovery). The 5 stranded gun-days (116–120) belong to a
  SECOND corpse gun: the scholar who took it (gen_mw19eak, the new player
  vessel) dies "the wild" day 116 and the gun lands on his corpse, where
  it sits untaken while the village collapses (village-lost day 121).
  It was never culled either — 5 days is far short of the frontier.

The 107237 loss is the same arithmetic with a faster clock: 106 deaths by
day 149 (~0.71/day) drove the frontier to a corpse that had sat 62 days.
On this band the death rates run 60–102 per 150 days and no corpse gun
ever sits long enough, unrecovered, for the frontier to reach it. The cap
is a sink with a long fuse: it needs a fast-dying village AND a
long-unrecovered gun at once.

## 2. Why the diag rule fires NO-GO — and what would change it

The frozen rule is a count, not a judgement: 0 cap gun losses on the band
means no lever. Three facts make that count honest rather than a
sampling artifact:

1. **The cap was exercised hard.** 301 culls is not a quiet band — the
   splice fired on every seed (19–62 times each). The instrument saw the
   mechanism work; it just never saw a gun in the culled corpse.
2. **Guns were at risk and survived.** 6 grants, 2 guns on corpses (32
   stranded gun-days), 1 recovery. The exposure existed; the loss did not.
3. **The loss condition is quantified, not hand-waved.** A corpse gun is
   lost only when the FIFO frontier reaches it: ~40 deaths after the
   corpse joins the list at stage 4, i.e. roughly (40 ÷ death-rate) days
   after death, and only if unrecovered that whole time. On this band's
   death rates that is 60–300+ days — longer than a gun typically sits
   unrecovered (the longest observed: 27 days and counting).

A future band with a higher death rate (or a longer horizon) could still
show a loss; the lever condition stays as frozen: a band with ≥ 1 cap gun
loss is the trigger to build the CORPSECAP exemption. Until then the
cheapest correct statement is that the cap is a real but rarely-firing
sink, and the binding gun-supply constraint on this band remains the grant
rate (4 of 8 villages never see a gun at all).

## 3. Census phantom (instrument note — does not touch the verdict)

On 107275 the gun census reads total **2** from day 113 on, although only
one gun ever entered the world (1 grant, 0 kill-loot drops, 1 prize roll
returning 'searcaster'). Mechanism, read from code: `generatePossessions`
(`corpses.js:309`) builds the corpse's death pack as NEW entries copied
from the dead person's gear ids — it never removes anything from the dead
person's record. giulia_bianchi dies day 113 keeping the gun in her items
and her equipped slot; her corpse gets a second copy; the scholar takes
the corpse copy. From then on the census counts both the ghost on the dead
record ("equipped giulia_bianchi", cells 2 — her items still hold the 2
cells) and the live gun (scholar pack → scholar equipped → gen_mw19eak's
corpse). The ghost can never be wielded — its holder is dead — so it is a
census over-count, not a game duplication of a usable gun. It does not
touch the verdict: cap gun losses are read from the culled corpse's own
items (direct, not via the census), gun-days stranded count corpse rows
only, and the coverage bar (0 unexplained losses) holds because the total
never falls. The phantom is inherited from the grantrate/vanishcause
census (`gunLocationsOf`); a future instrument pass could exclude dead
holders' equipped slots. Recorded here, not fixed here — it is outside
this arm's axis and it changes no judged number.

## 4. The xavier transfer (uninstrumented, total conserved)

On 107277 the second of gen_3nav8pt's two guns ends up equipped on the
living xavier_dubois (0 cells) while the first sits on gen_3nav8pt's
corpse. The instrument does not record how it moved (no grant, no
corpse-take, no drop event on the band) — the same "unexplained holder
change" family as finding #2650, but with the gun total conserved at 2,
so it is not a sink and not a loss. Not chased: it is a transfer question,
not a cap question.

## 5. Sense-test — the gun is looted, not mourned

Read the full telemetry for seed 107275, days 110–120
(`scripts/sense-corpsecap-a.js`, same env, TELEMETRY_FULL=1; the driver
wraps consume no RNG, so the trajectory reproduces the pilot corpus
exactly — days 121, village-lost, matched). It reads as efficient
looting, not a human moment:

- Day 113 dawn: `death` giulia_bianchi, cause "alien". That night the
  scholar strips her whole death pack in one pass — nine `loot_taken`
  rows in a row (swat_vest, work_gloves, arrow, phase_blade,
  deep_earth_boots, **searcaster**, fusion_cell, protein_bar, trail_mix).
  The gun is one line among nine, with no grief beat, no pause, no
  village reaction anywhere in the slice. The death pack is a bulk take.
- Day 116 midday: gen_mw19eak — the scholar who took the gun three days
  earlier — dies "the wild", HP 0, and the mantle passes to sofia_chen
  (`mantle_become`, 5 abilities, 10 gear). The gun lands on his corpse
  and sits there untaken while the village collapses (pantry 1,400 by
  day 116, village-lost day 121). Nobody mentions it; nobody goes back
  for it. The gun outlived two holders in a week, and the village's
  answer the second time was nothing — because the village was dying.
- The recovery that saved the gun (day 113) and the stranding that kept
  it (days 116–120) are both invisible in the words: the gun's story is
  legible only in the census, never in the narration. Corpse looting as
  built is a silent bulk take; whether a dead friend's gun deserves a
  beat of its own is a design question for the corpse system, not a cap
  question.

## 6. Instrument neutrality (no second leg)

The prereg's frozen bars require no second leg, and none was run. The
neutrality evidence: (a) every driver wrap is a pure read + driver-local
write — no `Math.random` call, no game-state write, every game function
runs exactly once; (b) the proof test's staged cull and the analyzer
selftest are green; (c) the sense re-run of seed 107275 WITHOUT any wraps
reproduces the pilot trajectory exactly (121 days, village-lost). The
panel builder (`scripts/build-corpsecap-panels-a.js`) is committed
unexercised — it exists for the lever phase, which the frozen rule did
not trigger.

## Metric review

- The frozen diag rule (0 losses → DIAG-NO-GO, build nothing) worked as
  designed: it stopped a lever that would have been built on one seed's
  anecdote (107237) rather than on a measured band rate. No bar was
  re-scored; the only judgement call was the sense read (§5), which is
  qualitative by design.
- The census phantom (§3) is a metric-review item for the NEXT gun
  census, not this one: `gunLocationsOf` counts a dead holder's equipped
  slot as a live gun. On this band it inflated one seed's end total
  (107275: 2 instead of 1) and nothing else — the primary metric reads
  corpse items directly and is unaffected. A future census should skip
  `equipped` rows for holders flagged dead.
- The "second grant" observation (107276, 107277 — both second grants to
  the same holder) contradicts grantrate's "no second grants" on its band
  and is worth one line in the grant-rate picture: second grants happen,
  but they concentrate on the holder who already has a gun (redirect
  matched both times), so they deepen one holder rather than spreading
  supply. Not chased — grant-stream territory, not cap territory.
- No `check.js` run: this arm changed no game code and no test-affecting
  source (driver/analyzer/builder/proof-test/sense scripts only, plus
  evidence). The proof test (30/30) and analyzer selftest (32/32) are
  the green checks for the instrument.

## Files

- Prereg: `evidence/2026-11-21/sim-corpsecap-a-prereg.md` (`315b20c34`)
- Instrument: `scripts/corpsecap-driver-a.js`, `scripts/analyze-corpsecap-a.js`,
  `scripts/build-corpsecap-panels-a.js`, `scripts/test-corpsecap-a.js`,
  `scripts/sense-corpsecap-a.js` (`110736f74` for the first four; the sense
  script lands with this evidence)
- Corpus: `evidence/2026-11-21/perseed-corpsecap-a-diag/` (8 per-seed JSONs)
- Analysis: `evidence/2026-11-21/corpsecap-a-diag-analysis.json`
  (verdict DIAG-NO-GO)
- Evidence: `evidence/2026-11-21/sim-corpsecap-a.md` (this file)
