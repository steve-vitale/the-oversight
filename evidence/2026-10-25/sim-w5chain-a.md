# sim-w5chain-a — the wave-5 eligibility chain PER SEED CLASS (axis scale-onramp)

Run: fleshout loop A, 2026-10-25, run fleshout-20261025T1915Z.
DIAG ONLY — zero src/js changes, zero default flips, instrument/recorder
only. Recorders reused verbatim: scripts/policies/raftdraft-diag.js,
scripts/policies/spawnsrc-diag.js, scripts/policies/w5births-diag.js.
New this run: scripts/test-w5chain-diag-sweep.js (the w5births sweep
copied verbatim except evid dir / mode label — same composition, same
seeds, same control gate) and scripts/test-w5chain-diag.js (the
per-class analyzer over that corpus). This arm designs and lands NO fix.
A complete chain diagnosis plus a named next blank IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  wave 4 = w3 rung + gated standing >= 100; wave 5 = w3 rung + gated
  standing >= 200 AND wave-4 faced; readiness gates hold waves 4-5:
  wave-5 demands 4 armored @ P>=15 / 6 armed / 3 tricks / 2 living
  wave-4 killers; plenty counts at most 100 toward the wave-5 bar;
  peak ratchet floors the gated total once a wave releases).
  Read from code, never invented: unlockedWave() in game.js (w3 rung
  + gated >= t5 + w4faced -> 5); villageStandingTotal() /
  waveCombatReadiness() / waveUnlockReady() in standing.js (defer5:
  capped >= t5 && !rd5.ready && peak < 5 -> bound 199); spawnWaveTarget()
  in game.js (top 5 -> 55% 5 / 20% 4 / 12% 3 / 8% 2 / 5% 1);
  monsterWavePool() filters by unlockedWave(); maintainWorldMonsters,
  tile-entry spawn, and castMonster all pick their target wave through
  spawnWaveTarget(pool) on that filtered pool — so no spawn path can
  birth wave 5 while unlockedWave() < 5 (verified by grep, see the
  births-side section; scripted/titan spawns are counted in the
  spawnsrc census by source, not assumed away).
- Context read first: evidence/2026-10-25/sim-scale-onramp-round-1815.md
  (published control band below) and sim-w5births-a.md (per-seed
  classification: FACED4 3, READINESS4 1, SPAWN4 1, STANDING100 1,
  STANDING200 2; wave-5 births 0, eligible moments 0, max pool top 4,
  spawn targeting exonerated). The 1815Z run's next blank (2) is this
  run's question: the same chain, cut PER SEED CLASS instead of per
  seed — national-reached vs not, crossed with wave-4-reached vs not
  — with the binding leg named per class, including whether any seed
  ever held all four defer5 bars simultaneously and for how many days.
- Substrate (shared, landed pattern): tableseat-nowait
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + raftdraft (RAFTDRAFT=1) +
  spawnsrc (SPAWNSRC=1) + w5births (W5BIRTHS=1) recorders. Seeds
  73671-73678, 180d death-aware horizon (runDays stops on death/win;
  180 is the cap). Pilot = this 8-seed band; NO confirm spend (a
  confirm is a follow-up run's pre-registration).
- Recorder neutrality (gate, stated before the sweep): recorders draw
  no RNG, throw nothing into the engine, return every original value
  untouched; w5births NEVER calls villageStandingTotal() or
  unlockedWave() mid-run (pure reads only; gated/proxy reconstructed
  in the analyzer from the standing.js formula). The armed band must
  reproduce the published control band EXACTLY (below) or STOP and
  report the deviation — no judging on a moved baseline.
- CONTROL (published control band, poolpres/spawnsrc/w5births):
  deaths 234, national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8,
  raids 85, raiders 361, pool 1,494, pool wave-3+ 107, median survival
  135d, starvation 5.
- PRIMARY (DIAG-GO requires ALL of):
  (a) gate trace complete for >=95% of seeds: per seed, daily points
      present with zero point errors and zero recorder errors, and
      samples present at days 30/60/120/180 (for a seed ending before
      a sample day, the end/death/win point substitutes and is
      flagged as such) plus at death/win. 7/8 = 87.5% fails the bar,
      so in practice this requires 8/8.
  (b) per-class table — seeds classed by national-reached
      (row.nationalEver) vs not, crossed with wave-4-reached
      (harness waveReach >= 4; proxyMax >= 4 reported alongside,
      any disagreement printed as RECONCILIATION, never silently
      resolved) — with the binding leg named per class, including
      whether any seed ever held all four defer5 bars simultaneously
      (rd5.ready on a daily point; short[] verified empty) and for
      how many DISTINCT days (a day counts once even when the daily
      hook fires twice on it), plus days with all-four AND capped
      >= 200, and days fully eligible (all-four + capped >= 200 +
      faced4 > 0).
  (c) the births-side check: wave-5 births by source (spawnsrc
      census), spawnWaveTarget calls at pool top 5 and returning
      target 5, and the verdict — either a non-defer5 gate blocked a
      birth attempt (named gate + numbers: standing / readiness /
      spawn source) or "defer5 only" with numbers. "No eligible
      moment ever occurred" is a verdict only if the gate trace
      shows which chain stage never cleared on each seed.
  (d) sense: one gate-relevant transcript excerpt read and quoted
      (a defer5 hold beat or a wave-4 moment from a sense-only replay
      on a band seed, labelled NON-MEASURED — narration replays
      never enter the census).
  Any leg missing = DIAG-NO-GO.
- Definitions (fixed before sweeping, analyzer header repeats them):
  distinct-day counting throughout; sample(t) = the last daily point
  with day <= t (or the first point if none); end sample = the last
  daily point. rd5 bars met: armored >= 4, armed >= 6, tricks >= 3,
  veterans >= 2 (standingCfg readyDemand[5]). Binding leg per seed =
  the leg with the fewest distinct days met over the full trace
  (ties listed in full). Binding leg per class = the leg binding the
  most seeds in the class (ties listed in full), with the class's
  pooled days-met per leg alongside. Chain stages per seed, in
  order: capped >= 200 ever? rd5.ready ever? faced4 ever? proxy 5
  ever? The first stage never reached is the seed's binding stage.
- SENSE plan: a sense-only narration replay (like
  scripts/sense-defer5gate.js) on the band seed that actually reaches
  capped >= 200, capturing the defer5 hold beat in context. It is
  NON-MEASURED and never enters any count.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md §14):
  pre-registered metrics bind the run — a miss is NO-GO, never
  re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest per-seed
  recorder corpora (ninth sighting, carried) — the sweep-compare
  table + analyzer output are attached instead, and telemetry-check
  is NOT run on recorder rows (standing instruction: its counts are
  wrong on recorder rows).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO

- (a) Gate trace complete 8/8 seeds (100%, bar >= 95%): every seed's
  daily points present with zero point errors and zero recorder
  errors, samples at 30/60/120/180 present (end-substituted where
  flagged below) plus the death/win end point. Analyzer gate PASS
  (scripts/test-w5chain-diag.js exits 0): trace complete 8/8,
  reconciliations 0, ready-with-short inconsistencies 0.
- (b) Per-class table below, all four classes reported (one empty —
  that emptiness is itself a finding). Binding leg named per class.
  All-four-bars days: ZERO on every seed, every class.
- (c) Births-side check below: wave-5 births 0 by every source,
  top-5 target calls 0, target-5 returns 0. Verdict: NOT "defer5
  only" — defer5 was the binding hold on exactly one seed, and only
  after wave 4 opened; the other seven seeds were blocked upstream
  before defer5 could ever apply (numbers below).
- (d) Sense excerpt read and quoted below (defer5 hold beat, d134
  replay on seed 73675, NON-MEASURED).
- CONTROL GATE: EXACT reproduction (see below). The classification
  is judged on a trajectory the recorders did not move. Detgate
  PASS (seed 73671: baseline vs recorders-OFF days 180/181,
  tsNationalDay 77 both, no diag surface, no wraps installed,
  post-setup world 0).

## CONTROL GATE — EXACT REPRODUCTION (gate, not a claim)

Armed band (tableseat-nowait + raftdraft + spawnsrc + w5births)
reproduces the published control band on every headline: raids 85,
raiders 361, deaths 234, national-ever 7/8, national-final 6/8,
table invited 4/8, entered 4/8, wins 4/8 (all lesser seat), median
survival 135d, wave-3 8/8, wave-4 6/8, wave-5 0/8, starvation 5,
pool total 1,494, pool wave-3+ 107. Per-seed trajectories match the
control seed for seed (73671 survived 180d 16 raids/74 raiders;
73672 won lesser d97 7/28; 73673 won lesser d124 7/30; 73674
survived 180d 14/65; 73675 won lesser d135 13/56; 73676
village-lost d70 7/28 starv 4; 73677 village-lost d143 12/45;
73678 won lesser d116 9/35 starv 1). Corpus: PASS, recorder
errors 0 on all three recorders, no overflow.

## THE ANSWER, FIRST (plain words)

Cut the band by national and wave-4 and the wave-5 chain does not
change its mind — it breaks on the same leg in every class. No
village on this band ever held all four wave-5 readiness bars at
once, not for a single day: the veterans bar (two LIVING wave-4
killers) was met on zero days on all eight seeds, while armor,
weapons, and tricks were met on hundreds of days each. Worse than
"never two": seven of eight villages never had even ONE living
wave-4 killer at any daily point of the run. The best village in
the band had one, for two days, and still needed a second. So the
wave-5 door is not stuck on a close call — the village never
assembles the fighting proof the door asks for, because wave-4
monsters are barely fought (2 of 8 villages ever faced one) and
barely killed (1 kill on the whole band). National reach does not
rescue the chain: six of the seven national villages reached wave
4 and still broke on veterans; the one national village that did
not reach wave 4 broke on the wave-4 veterans bar instead (pinned
at standing 99 for 58 days by the same kind of lock, one wave
earlier). And the one village that was not national at all died at
day 70 with standing 50 — it never got near any of this. The
empty class matters too: there is no national-without-wave-4
village except the pinned one, and no non-national village that
reached wave 4 — on this band, reaching national and reaching wave
4 travel together, and neither travels to wave 5.

## PER-CLASS TABLE (the deliverable)

Classes: nationalEver (row) x harness waveReach >= 4 (column).
Binding leg = fewest distinct days met (ties in full); legMetSum =
pooled distinct days each leg was met across the class's seeds.

| class | seeds | binding leg (seeds bound) | legMetSum armored / armed / tricks / veterans | days all-four | days full-eligible | stages reached capped200 / rd5ready / faced4 / proxy5 |
|---|---|---|---|---|---|---|
| nat x w4 | 73671, 73672, 73674, 73675, 73677, 73678 (6) | veterans (6/6) | 487 / 828 / 803 / 0 | 0 | 0 | 1 / 0 / 2 / 0 |
| nat x no-w4 | 73673 (1) | veterans (1/1) | 119 / 120 / 118 / 0 | 0 | 0 | 0 / 0 / 0 / 0 |
| nonat x w4 | — (empty) | — | — | — | — | — |
| nonat x no-w4 | 73676 (1) | veterans (1/1) | 55 / 53 / 61 / 0 | 0 | 0 | 0 / 0 / 0 / 0 |

Per-class reading:

- nat x w4 (the class that should be closest — six villages that
  both scaled to national and opened wave 4): veterans binds all
  six. Armor met on 487 seed-days, weapons on 828, tricks on 803,
  veterans on none. Only one seed in the class ever reached capped
  standing 200 (73675); only two ever faced wave 4 (73677, 73678);
  none ever held all four bars, none ever reached full eligibility.
  Reaching national and wave 4 buys nothing at the wave-5 door
  without a second living wave-4 killer.
- nat x no-w4 (73673 alone): the defer4 pin, one wave earlier —
  standing 122, gated pinned at 99 for the whole late run, because
  its wave-3 killer count (the wave-4 veterans bar) was 0 at every
  daily point while armor/weapons/tricks all passed. The same leg,
  the same shape, one rung down: the village that wins through the
  lesser seat without wave 4 is still a veterans story, not a
  standing story.
- nonat x w4 (empty): no village reached wave 4 without also
  reaching national on this band. That is a band fact (n=8), not a
  structural claim — but it means there is no "wave-4 without
  scale" class to contrast against, and any future arm that wants
  one must manufacture it (a wave-4-reaching non-national seed) or
  say so.
- nonat x no-w4 (73676 alone): died day 70, max standing 50, never
  near any gate. Its binding leg is veterans only in the formal
  sense (0 days met, like every seed) — substantively it is a
  standing-100 story: the chain never started. The class table
  keeps the formal leg and this sentence keeps it honest.

## PER-SEED TABLE

Columns: seed | class | end | maxRaw / maxCapped (day) |
maxGated | first events | legMet veterans (vetMax, days with >=1) |
days all-four | days defer5 active | binding stage.

| seed | class | end | maxRaw / maxCapped | maxGated | first | vet (max, days>=1) | all-four | defer5 days | binding stage |
|---|---|---|---|---|---|---|---|---|---|
| 73671 | nat x w4 | survived 180d | 127 / 127 (d177) | 127 | proxy4 d177 | 0 (0, 0d) | 0 | 0 | capped200 |
| 73672 | nat x w4 | won lesser d97 | 167 / 167 (d67) | 167 | proxy4 d60 | 0 (0, 0d) | 0 | 0 | capped200 |
| 73673 | nat x no-w4 | won lesser d124 | 122 / 122 (d66) | 99 | — (never proxy4) | 0 (0, 0d) | 0 | 0 | capped200 |
| 73674 | nat x w4 | survived 180d | 167 / 167 (d157) | 167 | proxy4 d157 | 0 (0, 0d) | 0 | 0 | capped200 |
| 73675 | nat x w4 | won lesser d135 | 267 / 227 (d134) | 199 | capped200 d99, proxy4 d134 | 0 (0, 0d) | 0 | 37 | rd5ready |
| 73676 | nonat x no-w4 | village-lost d70 | 50 / 50 (d70) | 50 | — | 0 (0, 0d) | 0 | 0 | capped200 |
| 73677 | nat x w4 | village-lost d143 | 127 / 127 (d125) | 127 | proxy4 d125, faced4 d136 | 0 (0, 0d) | 0 | 0 | capped200 |
| 73678 | nat x w4 | won lesser d116 | 172 / 172 (d115) | 172 | proxy4 d113, faced4 d115 | 0 (1, 2d) | 0 | 0 | capped200 |

Notes on the per-seed rows:

- "Binding stage" is the first chain stage never reached (capped
  >= 200 ever? rd5.ready ever? faced4 ever? proxy 5 ever?). Seven
  seeds bind at capped200 — they never even reached the standing
  number — and 73675 alone binds at rd5ready (it reached capped
  200 on day 99 but never rd5.ready). No seed binds at faced4 or
  proxy5 as its FIRST unreached stage, because faced4 is downstream
  of the standing number in this ordering; 73677/73678 reached
  faced4 but still bind at capped200 (127 and 172 — 73 and 28 short
  of 200).
- 73678 is the band's furthest-played wave-4 story and still
  stops two legs short at once: one living wave-4 killer (2 days
  only, days 115–116) against a demand of two, and standing 172
  against 200. Even doubling its veterans would not have opened
  wave 5; even reaching 200 would not have either, without the
  second veteran. It is the only seed where two legs co-bind, and
  neither alone explains the stop.
- 73675's 37 defer5 days run day 99–135, but defer5 only becomes
  the BINDING hold (gated 199) on days 134–135, after wave 4
  releases: before that the tighter defer4 hold pins the gated
  total at 99 (see the d120 sample: holds [defer4, defer5],
  gated 99). The 37-day count is "defer5 active", not "defer5
  binding" — the evidence keeps the two apart.
- Per-seed full legMet (distinct days met, armored/armed/tricks/
  veterans): 73671 170/172/173/0; 73672 47/95/88/0; 73673
  119/120/118/0; 73674 52/178/172/0; 73675 32/133/127/0; 73676
  55/53/61/0; 73677 74/136/132/0; 73678 112/114/111/0. Armor is the
  thinnest of the three passing legs on 73672/73674/73675 (47, 52,
  32 days) but never the binder — veterans is 0 everywhere, by a
  margin of 32+ days on every seed.

## GATE TRACE — SAMPLES AT 30/60/120/180 + END (leg a, in full)

Sample(t) = last daily point with day <= t; [END-SUB] = the seed
had already ended, so the sample IS the death/win end point.
Gated = reconstructed gated total (standing.js formula); holds as
named. Standing is 0 at day 30 on all eight seeds — the standing
sources (wave-3+ ledger kills, seasoned regional+ links, major
feasts) have not paid out yet that early, on any trajectory.

| seed | d30 (raw/capped/gated, holds) | d60 | d120 | d180 | end |
|---|---|---|---|---|---|
| 73671 | 0/0/0, none | 102/102/99, defer4 | 102/102/99, defer4 | 25/25/100, none | d180, same |
| 73672 | 0/0/0, none | 147/147/147, none | d97 [END-SUB] 167/167/167, none | d97 [END-SUB], same | d97 win |
| 73673 | 0/0/0, none | 20/20/20, none | 122/122/99, defer4 | d124 [END-SUB] 122/122/99, defer4 | d124 win |
| 73674 | 0/0/0, none | 0/0/0, none | 142/142/99, defer4 | 167/167/167, none | d180, same |
| 73675 | 0/0/0, none | 40/40/40, none | 222/202/99, defer4+defer5 | d135 [END-SUB] 267/227/199, defer5 | d135 win |
| 73676 | 0/0/0, none | 0/0/0, none | d70 [END-SUB] 50/50/50, none | d70 [END-SUB], same | d70 lost |
| 73677 | 0/0/0, none | 0/0/0, none | 102/102/99, defer4 | d142 [END-SUB] 127/127/127, none | d142 lost |
| 73678 | 0/0/0, none | 0/0/0, none | d116 [END-SUB] 172/172/172, none | d116 [END-SUB], same | d116 win |

Trace completeness per seed: points 70–180 (distinct days
68–178, duplicates from the daily hook firing twice on some days),
point errors 0, recorder errors 0, on all eight. Harness wave-4
verdict agrees with reconstructed proxyMax on all eight (no
RECONCILIATION notes).

## BIRTHS-SIDE CHECK (leg c) — NOT "defer5 only"

Band totals: 309 spawnWaveTarget calls; pool-top distribution
top 4: 15 calls, top 5: 0 calls; returns at top 4: 4 in 10/15 (67%,
designed 60%), at top 5: none ever offered, none ever returned.
Wave-5 births: 0, by every source. Total births 323: wave 1: 181,
wave 2: 95, wave 3: 36, wave 4: 11, wave 5: 0. Wave-4 births by
source: tile-entry 9, scripted-titan 2 (73671 tile-entry 1,
73672 scripted-titan 1 + tile-entry 1, 73674 scripted-titan 1 +
tile-entry 2, 73677 tile-entry 4, 73678 tile-entry 1 = 11).

- Standing gate: 7/8 seeds never reached capped 200 (max capped
  50–172), so no spawn path could ever see an unlocked wave 5 —
  monsterWavePool() filters by unlockedWave(), and maintain,
  tile-entry, and castMonster all pick through spawnWaveTarget on
  that filtered pool (grep-verified in game.js). Standing blocked
  wave 5 before any other gate was reached.
- Readiness gate (defer5): active on 1/8 seeds (73675, 37 days),
  binding on that seed only for its last 2 days (days 134–135,
  gated 199). On the other 7 seeds defer5 days = 0 — the gate never
  engaged because capped 200 was never reached (or, on 73673's
  defer4 pin, because wave 4 never released). Readiness blocked
  wave 5 on one seed, at the end of its run, after a 35-day defer4
  block on the same leg family.
- Spawn-source gate: 0 attempts blocked. No wave-5 birth was ever
  attempted: no spawnWaveTarget call ever saw pool top 5, so no
  spawn path (maintain, tile-entry, wanderer-contact, trap,
  scripted-titan) ever had a wave-5 candidate to pick or refuse.
  Scripted bypass check: wave-5 defs exist in data (cancellation,
  editor, rerun, spoiler, timeslot, nielsen, finale and the finale
  crew) and finale/network scripted spawns bypass the pool filter
  in principle — but the spawnsrc census shows ZERO scripted
  wave-5 births on this band (scripted sources birthed wave-4
  titans twice, wave-1 hushwolves 24 times, nothing wave-5), and no
  finale was reached. The bypass did not fire; it is not the block
  here, and any future arm claiming it must first produce a
  scripted wave-5 birth on a band that reaches a finale.
- Targeting, again exonerated: 10/15 top-4 returns at 4 (w5births
  found the same) — the lottery picks the newest wave when offered
  it. It was never offered wave 5.

So the (c) verdict, stated exactly: wave-5 births were blocked by
gates OTHER than defer5 on 7/8 seeds (standing number first, then
the wave-4 chain), and on the eighth seed by defer4-then-defer5 —
defer5 alone explains nothing on this band except 73675's last two
days. "Defer5 only" is FALSE with numbers.

## SENSE-TESTING READ (leg d, NON-MEASURED)

Sense-only narration replay (scripts/test-w5chain-sense.js), seed
73675, tableseat-nowait, 135 days — the replay's trajectories are
NOT census data; only the quoted beat text is evidence, and it is
evidence about what the player HEARS, not about counts. The replay
fired the defer5 hold beat on day 134 — the same day the census
says wave 4 released (proxy4 d134) — immediately after the wave-4
release beat:

> 📡 RATINGS ARE UP... Wave 4 talent has been released. The Mirror Draft opens.
> 📡 The fifth draft stays in the wings. It wants a village that can fight — blood your fighters (0 of 2 veterans).

Sense judgment: the beat is honest and well-placed. It names the
exact binding leg (veterans 0 of 2) with no other bar short, it
arrives at the moment the previous door opens (so the player
hears "one door opens, the next is already named"), and it does
not name the wave-5 title (knowledge-gated, per the 2026-10-21
discipline). The wrinkle is the one the numbers already state:
the village hears this beat on day 134 and wins through the lesser
seat on day 135 — the beat is a doorbell rung as the village
leaves. What the player never hears on this band is a second
veteran arriving, because it never happens. The preceding defer4
beats in the same replay ("The next act is still waiting — blood
your fighters (0 of 1 veterans)", days 125/132) show the same leg
naming the wave-4 door first — the player is told, twice over and
correctly, that fighters' blood is the missing proof.

## VILLAGE ASSESSMENT (plain words)

These are the same eight villages as the shared band, trajectory
for trajectory, so the news is the cut, not new fates. Six of them
scaled to national and opened wave 4 — the villages the scale
work has been trying to build — and every one of them stood at
the wave-5 door with armor on, weapons in hand, and tricks
learned, and nobody who had killed a wave-4 monster and lived.
The fighting proof is the whole story: wave-4 monsters barely
show up (11 births on the band, most in the last weeks), barely
get fought (two villages ever faced one), and almost never get
killed (one kill, by one person, alive for two days). The village
that came closest to wave 5 by the numbers — standing 227, wave 4
opened — never faced a wave-4 monster at all, because wave 4
opened on its second-to-last day. The village that did kill a
wave-4 monster won the next day. There is no version of this band
where wave 5 was a near miss on readiness alone: it was a near
miss on nothing, because the chain's fighting link never formed.

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with numbers): the wave-5 eligibility chain
  per seed class — classes built, binding leg named per class
  (veterans everywhere), all-four-bars days counted (0 everywhere,
  with the veteran-depth split: 7 seeds never even 1 living wave-4
  killer, 1 seed 1 killer for 2 days), samples at 30/60/120/180 +
  end published, births-side verdict given (NOT defer5-only).
- DOCUMENTED, NOT FIXED (named next blank, for a follow-up run):
  the wave-4 kill funnel — faced-to-killed conversion and veteran
  survival. On this band: 2 faced seeds, 1 kill, 1 veteran alive
  for 2 days, 0 second veterans ever. The follow-up question is
  whether the funnel is thin because wave-4 monsters arrive too
  late / too rarely to be fought (11 births, mostly late), because
  fights against them are not survived (73677 faced, 0 kills), or
  because the veteran must SURVIVE to count (the revolving-door
  note from w5births, now measured at wave 5 too: the only veteran
  on the band lived 2 days). Whether readiness should remember a
  dead veteran — cumulative kills vs living veterans — is a Steve
  design ruling, not a finding this diag settles; the diag's job
  was to show that the living-veterans reading leaves the bar at
  zero on 8/8 seeds. Pre-registration sketch for that run: same
  band, same recorders, plus a kill-funnel census (wave-4
  encounters by outcome: fought / fled / killed / killer-died,
  with killer survival days) — DIAG-GO when every wave-4 encounter
  on the band is outcome-classified.
- CARRIED (not chased here): the empty nonat x w4 class (no
  wave-4-without-national seed on this band); the melt
  fiction-vs-mechanics gap and surviving-core near-immortality
  (1815Z, Steve rulings pending); the 23% pool wave-3+ bar
  re-derivation (tileentry question, still open).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its four pre-registered DIAG-GO legs (a) trace complete
8/8, (b) per-class table with binding legs + all-four days,
(c) births-side verdict with numbers, (d) gate-relevant sense
excerpt. Two method notes, neither a revision: (1) the analyzer's
first print showed `complete` as an object (a truthiness artifact
— the value was the end point, not a boolean); fixed to an
explicit Boolean and re-run, corpus untouched, gate result
unchanged (8/8). (2) "Days met" for the veterans leg means days
with >= 2 living wave-4 killers (the demand); the evidence also
reports the looser ">= 1" count (vetMax / daysVet1plus) so the
0-days-met headline cannot be misread as "no veteran ever
existed" — one did, for two days, on 73678. The telemetry-check
and balanced panel were NOT run, per the standing exception for
recorder rows (panel cannot ingest per-seed recorder corpora —
ninth sighting). The sweep-compare table + analyzer output are
the comparison of record. The telemetry baseline was NOT rolled.
No game code changed in this run; no [needs-eyes] flag applies
(DIAG-only, no narration or behavior added — the sense script
only READS beats on a replay, it adds none to the game).

## Infrastructure notes

- Sweep: scripts/test-w5chain-diag-sweep.js is the w5births sweep
  copied verbatim except evid dir / mode label; composition,
  seeds, and control gate identical. Corpus:
  evidence/2026-10-25/perseed-sim-w5chain-a/ (8 rows + summary.json
  + analysis.json). Analyzer: scripts/test-w5chain-diag.js.
  Sense: scripts/test-w5chain-sense.js (NON-MEASURED replay only).
- Detgate PASS (see Control gate). No EPERM flap blocked this
  run's writes; all 8 rows wrote first try.
- Commit: sim-w5chain-a, DIAG-GO, zero src/js diff. Ready for
  coordinator merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
