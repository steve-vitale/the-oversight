# journey-scale r103 — run note (lane A, leg 3 SCALE)

**Run id:** laneA-scale-2026-11-06T0715Z (scheduled 00:45 CST 2026-11-06).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 25%. Base master@fc7608ba3 at worktree creation. Rotation read 3
-> scale; 3->0 written at closeout (see closeout). Prereg:
evidence/2026-11-06/journey-scale-r103-prereg.md (committed 211358195
BEFORE any scored seed ran; proof test 31/31). Heartbeats:
registration ~07:15Z, 600s loop throughout.

## Q1 — NATIONAL-STAGING BLOCK (primary, diagnostic)

**Verdict: the block is named — RUNG first, then TRUST. No shape ever
qualified on any seed; the staging code never failed to stage anything
that qualified.**

331 natGate rows across 4 fresh seeds (92701–92704). Gate days:
RUNG 296, NO-SHAPE 35, everything else 0. `firstQual={}` on every
seed — no shape (lead / belong / covenant / trade) ever qualified.
`stageExpectedMaxRun=0` — the staging code is behaving correctly;
nothing that should stage fails to stage.

- **RUNG dominates.** The Regional Dawn lands day 47 on ALL four
  seeds (first link formed day 25 on all four; the Dawn waits for a
  21+ day bond, so it lands d46–47 uniformly). The rung therefore
  matures day 76 on every seed. The villages die on days 74, 77, 82,
  101 — so the national window is 0 days (92704 dies 3 days before
  the rung matures), 1 day (92701), 8 days (92703), 26 days (92702).
  The ladder's pacing and the death curve leave almost no national
  window: a village must survive ~30 days past regional before the
  rung even opens.
- **Inside NO-SHAPE, the binding sub-gate is TRUST, not age.** The
  closest seed, 92702, holds 3 covenant links by day 101 — but 0
  seasoned: trusts 12 / 34 / 29 at ages 37 / 20 / 20 days. Its trade
  link is trust 29 at 6 days. The lead links on the other seeds are
  48–57 days old — the 30-day season is met — but sit at trust
  14 / 21 / 24. Across the whole panel, ZERO seasoned peers exist
  (r102's band had 3 on one seed). Links form at trust 30 and then
  COOL: nothing tends them up to the 40 bar. The policy never presses
  tendLink (tended=0, tendPeer=0 on all four seeds; TEND_PEER is
  opt-in and off). Whether that is a policy gap or an engine gap is
  the next run's question (see metric review) — this run names the
  gate, it does not pick the side.
- **BELONG never opens.** `belong=-` on all 331 rows: Haven never
  holds a subordinate link, so 1 of the 6 roads is untested by this
  policy. A foreign 4-realm EXISTS on 92703/92704 (foreignMax=4) —
  the precondition sits there unused because Haven never joins it.
  The policy courts for lead/covenant/trade and never seeks
  belonging.
- **The r102 mixed-shape hypothesis does NOT reproduce as the
  block.** r102's 85504 had 3 seasoned peers split across shapes
  (1 lead + 2 covenant). This panel never seasons even one peer, so
  shape-mixing cannot be the block here — the block is one rung
  earlier: no seasoned links at all. Both panels point the same way
  (national needs 3 seasoned links in ONE shape, and the panel never
  produces them), but for different proximate reasons. Seed variance
  in link tending is the honest read; no claim about which run's band
  is typical.
- **Viewership is NOT the binding constraint.** Viewership peaks at
  49–60 on all four seeds — above the global bar of 32. Global waits
  on national, and national never arrives.

Per-seed gates: 92701 RUNG 74 / NO-SHAPE 1 (rung-ready d76, died
d77, 1 peer trust 21/51d); 92702 RUNG 75 / NO-SHAPE 26 (rung-ready
d76, died d101, 3 covenants 0 seasoned); 92703 RUNG 74 / NO-SHAPE 8
(rung-ready d76, died d82, foreignMax 4, 1 peer trust 14/57d); 92704
RUNG 73 / NO-SHAPE 0 (died d74, rung 3 days short, foreignMax 4).

## Q1b — DRAIN RESIDUAL (report-only)

**The r102 residual REPRODUCES and its mechanism is narrowed to the
analyzer's inputs — the per-night formula is retired (see metric
review).** 178 pilgrimage nights. Outside ±10 (drain vs
burn−50×drank, non-cap): 17, in three classes:

- **Floor artifact, 9 nights (one seed, 92701):** the scholar's
  village_1 pilgrimage strands at (3,4) trail_edge, days 54–63, at
  hyd 0 with an empty pack and 0 drinks — drain 0 because there is
  nothing left to drain (first night 36→0, then 0→0 eight times).
  Same class as cap-clipping, at the bottom. The scholar sits ONE
  TILE from Haven for 10 days at 0 hydration on a 4th-attempt retry
  instead of walking home to drink — the retry loop holds it out.
  Named as a watch item below, not a metric.
- **Drain exactly 14, 12 nights (fresh seeds, same signature as
  r102's 4):** all at Haven, all with 1 drink, hyd 95→81 / 87→73 /
  100→86. All twelve fit a midnight burn of exactly 64 minus the
  +50 drink (drinkWater restores flat +50, capped at 100; verified
  in code). The analyzer's burn formula is the engine's formula
  verbatim (`30 + dayBurn + floor(dayTicks/32)`, engine/calories.js)
  — the gap is INPUTS: it feeds postCourt ticks (259–466) and
  postCourt weather, while the engine burns on sleep-time dayTicks
  and night weather. The implied sleep-time burn (64) exceeds every
  postCourt-ticks prediction (49–62) on those nights. The exact-14
  constancy across mixed postCourt weathers/ticks means the
  sleep-time inputs land near-constant on Haven nights; the
  discriminator (log the real midnight burn + sleep-time dayTicks
  and night weather) is named for the next run, not built here.
- **One outlier (d77, hyd 23→50):** drain −27 — floor at 0 plus the
  +50 drink, same arithmetic. Not a mechanism.
- **No-drink nights: 11** (r102: 0) — nine are the 92701 floor run;
  the rest are single dry nights. The separator still holds: drain
  separates on pack water / tile water.

## Q2 — CENSUS CONTINUITY (report-only)

| seed | end | rank | seat | arc | seasoned peers (final) | scatter gap |
|---|---|---|---|---|---|---|
| 92701 | d77 pop 0/0 pantry 2303 | regional | lesser waiting | 4 | 0 (lead 21/51d) | link d25, Dawn d47 |
| 92702 | d101 pop 1/1 pantry 0 | regional | lesser waiting | 4 | 0 (cov 12/37d, 34/20d, 29/20d; trade 29/6d) | link d25, Dawn d47 |
| 92703 | d82 pop 1/1 pantry 0 | regional | lesser waiting | 4 | 0 (lead 14/57d) | link d25, Dawn d47 |
| 92704 | d74 pop 0/0 pantry 0 | regional | lesser waiting | 4 | 0 (lead 24/48d) | link d25, Dawn d47 |

National staged 0/4; courtNational answers 0/4. Same as r93–r102.
Max wave 4 / 4 / 3 / 4. Deaths fight-heavy on every seed
(92701: expedition 37, villager combat 25, combat 13 of 93;
92702: 24/12/10 of 53; 92703: 30/5/11 of 58; 92704: 26/10/8 of
60). Starvation 0–2 per seed. Same shape as r105–r107.

## Q3 — PEOPLE CHECK (sense law)

Corpus: **1 sitting read in full** (92702 day 90 — the only seed
alive at day 90; the other three died d74–d82, so no day-120
sitting exists either. Corpus size reported, not padded). REAL.

- **Day 90 Caitlin (hunting guide, gentle, trust 40, seek_comfort
  planted d87):** opens on the want — "About whatever's been
  weighing on me — I don't want to be alone with my head right
  now." The player comforts, stays, she opens up ("I don't know
  if I'm doing any of this right."), invites a trap-line walk
  (betrayal accept), and gifts a real tool ("Here. I made an
  extra." — a decent tool, oiled and kept). The want advances
  stage 1 → 3. Coherent, in-character, a real gift changes hands.
  Flat note, stated not hidden: the stay-chain repeats twice
  ("I'll stay a while." / "I'm not going anywhere." ×2) — driver
  picker looping stay, same class as r106/r107's repetition, not
  a game defect. Gossip picks 0 (GOSSIP_FIRST off by default in
  this clone; the sitting is real without it).

## Q4 — WATER CONTROL (report-only)

Walk-outs 9 (92701: 2, 92702: 2, 92703: 2, 92704: 3): **dry 0,
partial 1, wet 8.** The phenomenon is still absent on this base —
third consecutive run (r100 control, r102 control, r103). The
r102 deferral stands: no fill-placement test is owed until a dry
walk-out reappears. Note the asymmetry Q1b found: the walk-out
gate is wet, but a trip can still strand the scholar dry for 10
days (92701 d54–63) — the gate measures departure, not the trip.
Resets: 2 / 1 / 1 / 0 SLEEP-WAITS — small, no loop.

## Village assessment, in plain words

Four villages, all the same story with different endings. Every one
finds its first neighbor on day 25, hears the Regional Dawn on day
47, and then waits: the next rung cannot open until day 76, and
three of the four villages are dead before or just after it opens.
The one that lives longest makes it twenty-six days into the open
window and still never sits a court — not because the law is against
it, but because none of its friendships ever warms to the trust a
realm stands on. Its three league friends sit at trust 12, 29, 34
after weeks of knowing each other; its oldest friend has known it
for 57 days and trusts it less than the day they met. Nobody tends
these bonds — the village never visits, never gifts, never tends —
and the bonds cool. One village's scholar spends ten days dying of
thirst one tile from home, too stubborn to walk back for a drink.
All four die with the lesser seat already waiting, the table priced
and patient, and no nation behind them.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — PARTLY, unchanged from r96–r102.** Regional on 4/4
  seeds (Dawn d47, uniform); national staged 0/4. The covenant road
  opens (92702 banks three covenant links) but nothing seasons.
- **FUN — YES, with the same honest caveat.** The one conversation
  is genuinely good (Caitlin's trap-line invitation and the gifted
  tool). The dull spot is the death band: two villages die before
  the leg's window (day 80) even opens, and all four die with a
  lesser seat waiting.
- **WINNABLE — NOT YET.** No national, no global, no full seat on
  any seed; no wave-5 content faced; no kill claimed. The binding
  link is now named: the rung matures at day 76 and no link reaches
  trust 40.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/scale.json, metrics
nationalLive,scaleRank, current = fresh 927xx 4-seed panel:
**quiet (4 files, 2 metrics, no large deviations).** Same caveat
as r93–r102: that baseline is an old aggregate shape, so "quiet"
means "no large deviation on these two metrics", not a clean bill.
Baseline NOT rolled forward.

## Metric review

- **Q1's diagnostic worked as designed:** the gate taxonomy names
  the block per seed (RUNG vs NO-SHAPE vs STAGE-EXPECTED) and the
  per-shape counts name the sub-gate (trust, not age). No
  re-scoring was done: Q1 is a diagnostic with no threshold, and
  the note says so.
- **Next run's question (proposed, not built here):** TEND_PEER=1
  on this band — does pressing tendLink on below-40 links season
  them and stage a national beat? If yes, the block is policy-side
  (the standing competent policy should tend); if no, it is
  engine-side (trust gains too weak / cooling too strong). That is
  a policy arm with its own prereg, not a same-run change.
- **The per-night burn formula is RETIRED** (r102 metric review's
  either/or, decided): the formula is the engine's formula fed
  stale inputs (postCourt ticks/weather vs sleep-time values), and
  the exact-14 residual is the artifact of that gap. The next run
  carries only the separator check (drain separates on pack water
  / tile water) plus, if it wants the last step, a sleep-time
  burn/ticks/weather instrument as the discriminator. No
  re-scoring: Q1b was report-only.
- **The 92701 thirst stranding is a watch item, not a metric:** a
  4th-attempt pilgrimage holds the scholar at (3,4) for 10 days at
  0 hydration instead of returning one tile home. If a later panel
  reproduces a multi-day dry stranding, the question is whether
  retry persistence needs a return-home threshold — a design
  question, not a tweak.
- **BELONG is untested by this policy** (belong=- on all 331 rows
  while a foreign 4-realm exists on 2/4 seeds). A belong-seeking
  policy arm would be needed to test that road; not proposed as
  the next run — the tend question comes first.
- **Driver bug found and fixed mid-run (disclosed):** the first
  panel run accumulated natGateWatch rows across seeds
  (92703: 183 rows, 92704: 256 rows) because the new watch was
  missing from playSeed's per-seed reset list. The polluted
  evidence was deleted, the reset added (commit 166756b9a), and
  the full panel re-run clean (row counts 75/101/82/73 = each
  seed's own days). No scored verdict rests on the polluted run:
  the census fields were unaffected, but the nat-gate counts would
  have been wrong, so the re-run was owed, not optional.
- **Safe-commit index clobber struck twice this run** (prereg
  commit 211358195, driver-fix commit 166756b9a) — same class as
  the 2026-10-22 lesson: the commit is correct, the main index
  lies (staged-as-deleted / 1-line diff). Repaired both times via
  HEAD-blob cacheinfo, verified clean. The pattern is now 3+ runs
  in a row; the reaper/cleanup risk it poses (a lying index) is
  worth a look by the main session, not this run.
- No pre-registered metric was re-scored mid-run.

## Harness

Policy: scalecourt-nogate-morntrace3 (standing, UNCHANGED).
Driver: scripts/journey-scale-r103-20261106.js (r99 driver,
labels/seeds/EVIDIR only + natGateWatch instrument + per-seed
reset fix). Analyzer:
scripts/analyze-journey-scale-r103-20261106.js (r102 analyzer +
classifyNatGate/summarizeNatGate, exported). Proof:
scripts/test-journey-scale-r103-natgate-20261106.js (31/31; not on
the green list, same precedent as the r102 proof tests — do not add
it). Per-seed evidence: evidence/2026-11-06/journey-scale-r103/ +
analysis txt. Prereg + this note in repo evidence/2026-11-06/.
Smoke seed 92700 x DAYCAP=45 proved the driver + natGate emission
(45 rows, RUNG 45, seasoned<=active holds); smoke outputs deleted
per the prereg. Pilot seed 92701 passed (no crash, pilgrimages=5).
Duplicate-day note: the daily hook fires twice on day 2 across ALL
watches (wantwatch/hungerwatch too — pre-existing r99 lineage
behavior), so nat-gate counts carry +1 row on day 2. Disclosed;
immaterial (1 row in 331).

## Closeout (filled after the check gate)
- check.js --quick: 283 passed, 7 failed in 588s (log
  evidence/2026-11-06/journey-scale-r103-checkquick.log). All 7
  adjudicated, none new — EXACTLY r107's 7: 6 standing pre-existing
  (proof-update, workflow freshness, mobile-combat-cadence,
  occupation-panels, phone-frame-proof stale receipt,
  establishment-r20-fixes racks-full voice "expected 2 got 1")
  + 1 flaky capable-bot (passed r106, failed the 278/12 run
  before — load roulette, not code; this run touches no combat
  code). trust-observer-neutrality PASSED this run (60s, in the
  slowest list but not the FAIL list). No failure touches
  hierarchy.js / betrayal.js / conversation code. This run changed
  NO src/js (only new scripts/ + evidence/), so none of the 7 can
  be caused by it. Targeted proof on the touched area: natgate
  proof test 31/31.
- (rebase/merge/release/rotation filled below as they land)
