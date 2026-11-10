# sim-wave5kill-a — the "blooded" lever: pilot GO, confirm on fresh band 99867–99882

- Arm: sim-wave5kill-a (Loop A, adoption run fleshout-20261110T0827Z — adopted the
  dead run fleshout-20261110T0615Z's half-finished arm; claim fleshout-20261110T0615Z
  marked .DEAD, stale-lock recovery by the coordinator run).
- Branch: sim-wave5kill-a; worktree `~/workspace/worktrees/sim-wave5kill-a`.
- Prereg: evidence/2026-11-10/sim-wave5kill-a-prereg.md (commit 05342afe2,
  rebased by this run onto explicit master `a6ed956f5` — prereg commit replayed
  as `c164b57cd`, rebase clean, zero conflicts; roundcap-b changed zero src/js).
- Axis: scale-onramp / winnability chain. The chain binds at the wave-5 KILL.
- Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-5 bands anchored:
  damage 50–130, HP 1000–2200; apex is a 7–10 round fight for a godhood build
  at ~220 dmg/round). No canon doc covers a veteran combat bonus — the lever
  is a new balance number on the existing veteran concept, not a canon rewrite.

## The lever — "blooded" (unchanged from prereg)

Once the village has a living veteran (a wave-4+ killer in
`state.waveKillLog`, the readiness gate's own read through
`waveCombatReadiness(5)`), its fighters hit wave-5 monsters harder
(dmgMult 1.5) and take less from them (inMult 0.75) — field + tactical,
volley untouched. Config `Game.bloodedCfg()` in src/js/standing.js;
`villageBlooded()` / `bloodedLine()` beside it. Hooks in
src/js/fieldFights.js (leader strike, ally strike, incoming after armor)
and src/js/game.js (`tbDamage` outgoing + incoming). No gate, price, deed,
readiness, volley, spear, or ammo change. Narration names it once per fight:
"Blooded — the village knows where the Producers bleed. (Strikes hit 1.5×
as hard; their blows land at 0.75× strength.)"

## Adoption state (inherited, verified)

- Lever diff uncommitted on adoption: 150 insertions, additive only
  (fieldFights.js +50, game.js +53, standing.js +47). Still additive-only
  after this run's edits: `git diff` shows zero deletions.
- Test scripts/test-wave5kill-a.js untracked on adoption; pilot half-run:
  before-legs 8/8 present, armed legs 4/8 (99641–99644).
- Proof + sizing re-run by this run TWICE (inherited code, then again after
  the rebase + the empty-catch fixes below): **35 passed, 0 failed** both
  times. Sizing pick verified, not re-picked: **dmgMult 1.5 / inMult 0.75** —
  the smallest rung whose projected grind (6 field meetings + 3 TB fights)
  closes a 1600-HP Cancellation (grind 2334 vs control 1518). The committed
  default matches the pick.
- Rebase: read `git rev-parse master` in the main tree immediately before
  rebasing (`a6ed956f50ca78309fec4dcefb3502128efdc9b0`); the first attempt
  was refused because the lever diff was uncommitted, so the work was
  stashed (`-u`), the rebase run clean, and the stash popped intact
  (diff still 150 insertions, zero deletions). No conflict, nothing forced.
- Before-leg re-verification (step 4): before leg 99641 re-run on the
  rebased tree with the lever stashed aside, to /tmp — output is
  **byte-identical to the recorded before leg except the anchorCommit**
  (05342afe21cc → c164b57cd627), 496,414 bytes each. No re-run of the other
  7 before legs was needed.

## Empty-catch fix (repo AGENTS.md rule 6)

All 9 empty `catch (e) {}` blocks in the NEW lever code now report via
`console.warn('[blooded] …', e)` (the fieldFights.js godpath precedent):
fieldFights.js incoming / leader strike / ally strike (3), game.js TB
incoming / TB outgoing / TB source lookup (3), standing.js bloodedCfg env
read / bloodedLine cfg read / villageBlooded readiness read (3). One
near-miss while editing: the second edit briefly landed the warn on the
pre-existing FEASTED hook's identical inner catch in game.js; caught by
the diff check and reverted — the feasted hook is byte-identical to
upstream again, and the full diff remains pure insertions. The test file's
own `catch (e) {}` (gear-up probe in freshVillage) is harness code, not
lever code, and was left as inherited.

## Stage 2 — wild pilot (8 seeds 99641–99648, competent verbatim, 150d)

Driver scripts/wave5face-driver-20261109.js, RUN=wave5kill-before /
wave5kill-a, corpus evidence/2026-11-10/perseed-wave5kill-a/ (16 legs).
Analyzer scripts/wave5face-analyze-20261109.js run over the corpus
(wall numbers below are the analyzer's per-run split, recomputed from the
raw JSONs by run). Baseline check: the before run reproduces the
wave5face-b band exactly — 75 meetings, 25 TB scholar deaths — so the
re-baseline is sound.

### Judged numbers (before → armed)

| Metric | Before (control) | Armed (blooded 1.5 / 0.75) | Bar | Verdict |
|---|---|---|---|---|
| Wave-5 kills | 0 | **6** | GO ≥ 2 (from 0) | MET |
| Wave-5 scholar deaths per meeting (fight-attributed: TB scholar-death endings + field scholar-fighter vDie) | 25 / 75 = **0.333** | 28 / 99 = **0.283** | down vs control | MET |
| Wave-5 scholar deaths per meeting (loose check: + scholarDeaths rows on a wave-5 field-fight day) | 31 / 75 = 0.413 | 32 / 99 = 0.323 | down vs control | MET (agrees) |
| Villager (non-scholar) combat deaths per meeting, field vDie | 6 / 75 = 0.080 | 5 / 99 = 0.051 | reported | down |
| Villager deaths to a wave-5 monster (fallen, field + TB) | 6 (0.080/meeting) | 5 (0.051/meeting) | reported | down |
| Starvation deaths (fallen cause) | 5 | 5 | ≤ control+2 | MET |
| Median survival (upper median, analyzer convention) | 117d | 148d | ≥ 0.8× control (93.6d) | MET |
| Overshoot watch | — | 6 kills | ≥ 7 → GO-with-overshoot | NOT triggered (but 1 short — see below) |

**PILOT VERDICT: GO.** Both halves of the primary hold (6 kills from 0,
scholar deaths per meeting down on both attribution readings), the cost
bar holds (starvation flat at 5, median survival up 117 → 148d). Not
GO-with-overshoot: 6 < 7 — but it is one kill short of the overshoot line,
so the confirm must watch the kill count, not just the GO bar.

### Per-seed table

| Seed | Run | Days | End | Standing | Max wave | W5 kills | Meetings (F/TB) | Scholar deaths in W5 meetings | Villager field deaths |
|---|---|---|---|---|---|---|---|---|---|
| 99641 | before | 103 | village-lost | 300 | 5 | 0 | 21 (13/8) | 8 | 2 |
| 99641 | armed | 131 | village-lost | 375 | 5 | **3** | 44 (34/10) | 8 | 3 |
| 99642 | before | 150 | survived | 199 | 4 | 0 | 0 | 0 | 0 |
| 99642 | armed | 150 | survived | 199 | 4 | 0 | 0 | 0 | 0 |
| 99643 | before | 147 | village-lost | 300 | 5 | 0 | 26 (18/8) | 8 | 1 |
| 99643 | armed | 148 | village-lost | 375 | 5 | **1** | 11 (7/4) | 3 | 0 |
| 99644 | before | 116 | village-lost | 325 | 5 | 0 | 3 (2/1) | 1 | 0 |
| 99644 | armed | 149 | village-lost | 425 | 5 | **2** | 27 (18/9) | 7 | 1 |
| 99645 | before | 110 | village-lost | 335 | 5 | 0 | 25 (16/9) | 8 | 3 |
| 99645 | armed | 104 | village-lost | 335 | 5 | 0 | 17 (7/10) | 10 | 1 |
| 99646 | before | 150 | village-lost | 175 | 4 | 0 | 0 | 0 | 0 |
| 99646 | armed | 150 | village-lost | 175 | 4 | 0 | 0 | 0 | 0 |
| 99647 | before | 117 | village-lost | 199 | 4 | 0 | 0 | 0 | 0 |
| 99647 | armed | 117 | village-lost | 199 | 4 | 0 | 0 | 0 | 0 |
| 99648 | before | 68 | village-lost | 100 | 4 | 0 | 0 | 0 | 0 |
| 99648 | armed | 68 | village-lost | 100 | 4 | 0 | 0 | 0 | 0 |

Wall numbers (per run): national 0/8 → 0/8, table/wins 0/8 → 0/8,
wave-4 unlocks 4/8 → 4/8, wave-5 unlocks 4/8 → 4/8, wave-4 kills 27 → 34.
Four seeds (99642, 99646–99648) never reach wave 5 on either leg, so the
pilot's judged action sits on the four released seeds — the lever changes
nothing where the village never meets a Producer, as designed.

### The six kills (all with a living veteran on the day — condition verified)

- 99641 d124: Editor, by Ines Duarte (player, TB, 36 rounds). Ines was
  not herself a veteran; the village's veteran Tom Baker (wave-4 kill
  d110) made the whole village blooded — the condition is village-level
  by design, and this kill is the proof it works that way.
- 99641 d126: Spoiler, by Miguel Santos (companion, TB, 20 rounds).
  Tom Baker (veteran, kill d110) fought beside him.
- 99641 d128: Timeslot, by Miguel Santos (wild, field, 4 rounds).
  Miguel was the veteran himself (fighterHadKill, veteranAtMeeting).
- 99643 d113: Spoiler, by Lena Ruiz (player, TB, 15 rounds). Lena was a
  veteran herself (wave-4 kill d105); 3 living veterans that day.
- 99644 d87: Editor, by gen_6dojkij (player, TB, 20 rounds). Both
  fighters veterans (kills d62, d72/85).
- 99644 d126: Spoiler, by Zoltan Nagy (player, TB, 6 rounds). Fast finish.

No kill happened on a day without a living veteran. The field vKill is
the only field kill; the other five came through TB — the grind the
sizing projected (field chips + TB finishes) is what actually happened.

### The failure mode on 99645 (why the lever is not a blanket buff)

99645 armed killed 0, and its scholars died in 10 of 10 TB meetings
(10 scholar deaths, 0.59/meeting — worse than its own before leg). The
village held a living veteran on only 36 days (9 days with 2+), against
70–87 on the killing seeds — its veterans kept dying, so the blooded
condition kept going dark exactly when Producers arrived. The lever's
effect is gated on veteran survival; a village that cannot keep a veteran
alive gets nothing from it. That is the design working as specified, and
it bounds the lever: it rewards villages that already banked a veteran,
it does not rescue villages that cannot.

### Village assessment (plain words)

The village that learns to kill Producers is the village that already has
someone who killed the tier below and kept them alive. On 99641 the story
is Miguel: he killed a wave-4 beast, lived, taught the village where the
new monsters bleed, and then killed a Timeslot himself in four rounds
while the village's scholars finished an Editor and a Spoiler the same
week. On 99644 two veterans carried the village to two Producer kills.
On 99645 the veterans died and the scholars died after them, ten times
over — the same wall as before, just with a name on it now. Nothing about
food changed (starvation flat at 5 each side); villages lived longer on
the armed legs (median 148 vs 117 days) because their fighters stopped
dying quite so fast in Producer fights. National, the table, and the win
are still 0/8 — the kill is one link, not the chain. The wall numbers
have not moved; the binding link has.

## Sense-test (transcripts from the pilot corpus)

- The blooded line reads. It fired 54 times in armed field-fight logs
  (0 in before legs) and in the spoken says on d98/d104/d124/d126/d129
  (99641), d87/d89/d126 (99644), d65 (99645). It names the numbers
  honestly — "Strikes hit 1.5× as hard; their blows land at 0.75×
  strength" — and fires once per fight, whichever half lands first.
- The 99641 d128 field kill reads as a fight, not a number: Miguel opens
  at range with a bow, binds a wound mid-fight (+20 HP, field medicine),
  takes a Reschedule, the blooded line lands in R1, and he finishes with
  two strikes of 36 and 38 ("The lead falls — the pack's coordination
  shatters"). Brawler's Instinct fires mid-fight; the Timeslot holds its
  ground past its wound line. Coherent throughout.
- The TB kills read as grinds, not stomps: 36 rounds for the d124 Editor
  (the scholar survives a long fight), 20 rounds for d126, 15 for d113,
  6 for the d126 Spoiler. The long ones are the village wearing a
  Producer down across many turns — the multi-meeting grind the sizing
  projected, now visible in a single fight.
- The 99645 counter-story also reads: scholars walk into TB fights with
  Producers and die, ten times, with the blooded line nearly silent
  (once in the field logs) because no veteran lived to teach it. The
  narration never claims a bonus that is not there.
- Finding #2063 (repeated failed walk-in) was observed in passing and
  left alone — out of scope for this arm.

## Metric review

- The sizing ladder's field rounds bar (median rounds survived ≥ 4)
  proved unachievable by construction, as recorded in the test header:
  situational morale flees at round 2 whenever the fight is hopeless,
  and hopelessness is decided on a pre-lever survival read. The pick
  rule was revised in the test header before the pilot (grind projection
  instead of the rounds bar); the pilot's judged bars were unchanged by
  the revision, and the pilot's outcome does not depend on it.
- The TB sizing's death share (scholar dies in 20/20 constructed TB
  streams at the picked rung) looked alarming at sizing time, but the
  wild pilot contradicts it as a verdict: real TB fights killed 6
  Producers and the scholar death rate per meeting FELL. The constructed
  TB fight (a lone scholar + party vs a fresh 1600-HP Cancellation at
  close range, striking every turn) is harsher than the wild mixture —
  the sizing's TB leg is a stress test, not a forecast. No metric change
  is proposed for the confirm; the pilot bars bind as written.
- Attribution note: the prereg's "31 scholar deaths" baseline counts 25
  TB scholar-deaths + 6 field ones. The 6 field ones reproduce exactly
  two ways on this corpus — scholarDeaths rows on a wave-5 field-fight
  day (6) and villagers fallen to a wave-5 monster (6) — while the strict
  fight-attributed count (field fighter is the scholar and dies) is 0.
  The judged per-meeting metric is the strict one (0.333 → 0.283); the
  loose reading agrees (0.413 → 0.323), so the verdict does not hinge on
  the attribution. The confirm will report both readings again.
- The overshoot watch (≥ 7 kills) nearly tripped at 6. The confirm's
  kill count is the number to watch: a confirm at ≥ 7 on 16 seeds would
  still be GO-with-overshoot per the prereg, and would argue for a
  smaller rung next run rather than landing this one as-is.

## Confirm (pilot GO — running)

- Fresh band **99867–99882** (16 seeds), chosen by full freshness search
  per the local_seed_band_freshness skill: every 997xx/998xx/995xx/994xx
  seed named in `evidence/*/sim-*-prereg.md` was listed; the first
  candidate 99701–99716 was REJECTED (99701, 99702, 99707, 99708, 99711,
  99713, 99714, 99716 all named — roundcap-b, approachconf-b,
  sigoff-confirm-b, vetrest-b, gearoff-confirm-b). 99867–99882 has ZERO
  hits in any `evidence/**/*.md` file and no corpus directory. Search
  scope: all 700 `evidence/*/sim-*-prereg.md` files plus the full
  evidence tree for the chosen band.
- Same primary + cost bar as the pilot (≥ 2 wave-5 kills from the
  confirm-before count, scholar deaths per meeting down, starvation ≤
  control+2, median survival ≥ 0.8× control). Overshoot watch carries
  over: ≥ 7 kills on the 16-seed band → GO-with-overshoot.
- Balance panel (§15): `scripts/balance-panel.js` compare (16 matched
  seeds, reconciled policies) as the guard instrument — the panel never
  overrides the pre-registered verdict.
- Corpus: evidence/2026-11-10/perseed-wave5kill-confirm/ (RUN
  wave5kill-confirm-before / wave5kill-confirm-a).

## Confirm results (16 seeds 99867–99882, competent verbatim, 150d)

Corpus evidence/2026-11-10/perseed-wave5kill-confirm/ (32 legs).
Analyzer: scripts/wave5face-analyze-20261109.js over the corpus —
combined wall: national 0, table 0, wins 0, wave-4 unlocks 30/32,
wave-5 unlocks 10/32, wave-5 kills 8, wave-4 kills 108,
median survival 135d. Per-run split below is recomputed from the raw
JSONs by run (same definitions as the pilot).

### Judged numbers (confirm-before → confirm-armed)

| Metric | Before (control) | Armed (blooded 1.5 / 0.75) | Bar | Verdict |
|---|---|---|---|---|
| Wave-5 kills | 2 | **6** (+4) | GO: armed ≥ control + 2 (see note) | MET |
| Wave-5 scholar deaths per meeting (strict) | 11 / 33 = **0.333** | 4 / 41 = **0.098** | down vs control | MET |
| Wave-5 scholar deaths per meeting (loose) | 12 / 33 = 0.364 | 6 / 41 = 0.146 | down vs control | MET (agrees) |
| Villager (non-scholar) combat deaths per meeting, field vDie | 3 / 33 = 0.091 | 4 / 41 = 0.098 | reported | flat (+1 death, small-n) |
| Villager deaths to a wave-5 monster (fallen) | 3 (0.091/meeting) | 4 (0.098/meeting) | reported | flat (+1, small-n) |
| Starvation deaths (fallen cause) | 1 | 1 | ≤ control+2 | MET |
| Median survival | 135d | 135d | ≥ 0.8× control (108d) | MET |
| Overshoot watch | — | 6 kills | ≥ 7 → GO-with-overshoot | NOT triggered |

**CONFIRM VERDICT: GO.** Every pre-registered bar holds on the fresh
band. The kill bar needs one honest note: the prereg wrote it as "≥ 2
wave-5 kills (from 0)" against the pilot's 0-kill baseline, but this
fresh band's control already kills 2 (99868 and 99875 each killed one
without the lever — wave-5 kills are rare but not impossible unlevered).
The bar was therefore judged in its intent-preserving form — the lever
must ADD at least 2 kills over its own control (armed ≥ control + 2 =
4) — which is the stricter reading, not a friendlier one: 6 ≥ 4 holds,
and the literal reading (≥ 2 total) holds too. No re-scoring happened;
the numbers are reported both ways so the next reader can see it.

### The six confirm kills

- 99868 d120: Editor, by Dale Hoffman (player, TB). The SAME kill
  happens on the before leg — same day, same killer, same monster.
  The lever did not make this kill; what it changed is what came
  after: the armed village survived to 150 days (before: 128) and
  stayed released 35 days (before: 12).
- 99875 d98: Network Note, by James Okonkwo (player, TB). 2 living
  veterans that day. (The before leg's only kill on this seed was an
  Editor on d99, also by James — a day later, a different monster.)
- 99875 d111: Spoiler, by Ursula Weber (player, TB). 2 living veterans.
- 99875 d116: Editor, by Ursula Weber (player, TB). 1 living veteran.
- 99881 d116: Cancellation, by Elif Demir (player, TB). 2 living
  veterans.
- 99881 d132: Spoiler, by Pavel Dubinin (player, TB, 10 rounds).
  The daily snapshot reads 0 living veterans on d132 — but Pavel
  himself WAS the veteran (wave-4 kill d87, alive through d131) and
  the fight record shows him veteran/alive at fight time. He killed
  the Spoiler, then fought a second Spoiler the same day and died in
  it (fallen d132, "the wild"). The snapshot is end-of-day; the
  condition held when the killing blow landed.

Blooded line fired 27 times in armed field-fight logs (0 in before
legs). The before legs' 2 kills and the armed legs' 6 are all TB kills
except none in the field — the confirm's kills came through the
tactical channel, as the pilot's mostly did.

### What the confirm changes about the pilot story

- The pilot's "0 kills" baseline was band luck, not a law: on fresh
  seeds the control kills 2 in 16. The lever's effect is +4 kills over
  control (2 → 6), not 0 → 6 — a real but modest lift, and the honest
  size of it.
- Scholar deaths per meeting fell much harder on the confirm than on
  the pilot (0.333 → 0.098, from 11 deaths in 33 meetings to 4 in 41)
  — the survivability half is doing as much work as the damage half.
- The villager death rate did NOT improve on the confirm (0.091 →
  0.098, 3 → 4 deaths): the lever keeps scholars alive in Producer
  fights more than it keeps villager fighters alive. Small-n (a
  one-death difference), but it is the one number that did not move the
  right way, and it is reported as such.
- Median survival is flat (135 → 135d) and starvation is flat (1 → 1):
  the lever costs nothing in food or longevity. One seed (99875 armed)
  died earlier than its before leg (122 vs 150 days) while killing
  more — killing Producers does not by itself save a village.
- Wall numbers still have not moved: national 0/16, table/wins 0/16
  on both legs. The wave-5 kill link is now proven closable; the chain
  past it (national, table) is still the wall.

### Balance panel (§15, guard instrument — the panel never overrides the verdict)

### Balance panel (§15, guard instrument — the panel never overrides the verdict)

- Before panel: `node scripts/balance-panel.js --out
  /tmp/wave5kill-confirm-panel-before --policies competent --seeds
  99867,…,99882 --days 150 --par 4` → 16 cases, 0 cached, valid
  (sources stable, neutrality matched, zero warnings). Run on pristine
  code (lever stashed).
- After panel: same invocation, `--out
  /tmp/wave5kill-confirm-panel-after`, lever applied → 16 cases, 0
  cached, valid.
- Compare: `node scripts/balance-panel.js compare --before
  …/panel-before/panel.json.gz --after …/panel-after/panel.json.gz
  --out evidence/2026-11-10/sim-wave5kill-confirm-panel` → decision
  **review_required** (compare exit 2 is the tool's signal for a
  non-clean decision, not a crash; errors: []).
- What the panel flags: exactly two rows, both `regression_watch` —
  village deaths per run 80.875 → 81.3125 (+0.44, 95% interval -0.125
  to 1.25) and village deaths per 100 calendar days 67.19 → 67.49
  (+0.31, interval -2.00 to 3.23). Everything else is
  no_material_signal or descriptive; table win/entry/sitting and
  national access are 0 → 0; player deaths per run actually FELL
  (11.625 → 11.1875); bearer changes fell (11.125 → 10.6875).
- Reading: the flagged uptick is the SAME one-death villager signal
  the judged driver already reports (villager deaths to wave-5
  monsters 3 → 4, field vDie 3 → 4) — more wave-5 meetings means more
  chances for a villager fighter to die, while scholars die much less
  often. The per-100-days interval straddles zero widely, and with ~30
  metrics a watch flag is expected by chance. The judged instrument
  disagrees with any survival regression: median survival flat 135 →
  135d, starvation flat 1 → 1. Per the prereg the panel never overrides
  the pre-registered verdict, and it does not here: the verdict stands
  as GO, with the village-deaths watch carried as the known cost to
  watch on the next run (if the next arm's panel shows the same watch
  growing, the rung is too hot).
- Raw panels retained:
  evidence/2026-11-10/sim-wave5kill-confirm-panel-before.json.gz and
  sim-wave5kill-confirm-panel-after.json.gz; compare report
  evidence/2026-11-10/sim-wave5kill-confirm-panel.{json,md}.

## Overall verdict: GO — LAND the lever

Pilot GO and confirm GO on the same pre-registered bars, on two bands
(8 + 16 seeds): wave-5 kills 0 → 6 (pilot) and 2 → 6 (confirm, +4 over
its own control); scholar deaths per meeting down both times (0.333 →
0.283 pilot; 0.333 → 0.098 confirm); cost bar holds both times
(starvation 5 → 5 pilot, 1 → 1 confirm; median survival 117 → 148d
pilot, 135 → 135d confirm). Overshoot watch never triggered (6 kills
both times, under the 7 line). The lever is a modest, gated lift: it
only fires where a village kept a veteran alive, and it costs nothing
in food or longevity. The one cost is a flat-to-slightly-up villager
death rate in Producer fights (panel regression_watch on the same
signal) — reported, not hidden. Wall numbers (national / table / wins)
are still 0 everywhere: the kill link is proven closable, the chain
past it is still the wall, and the next arm should work the link after
the kill.

## Telemetry check

## Telemetry check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-10/perseed-wave5kill-confirm/*.json'
--metrics national,table,wins,exiled` → **refused, as the prereg
anticipated**: "refusing recorder-corpus input: all 32 --current rows
carry top-level anchorCommit, so they are sweep recorder rows, not
runs." Recorded, not re-seeded (per the prereg: do not reseed a
baseline from recorder rows). No LOUD deviation line was produced, so
there is no same-run deviation to investigate; the wall numbers for
this run are in the judged tables above (national 0, table/wins 0 on
both bands, both legs).

## check.js --quick attribution (green list)

- Lever tree, first run (under load 22 with three concurrent checks):
  292 passed, 8 failed in 1044s — failure list lost to a piped tail.
- Pristine tree (lever stashed), same command, full log:
  **294 passed, 6 failed** in 678s.
- Lever tree, re-run with full log (box quiet, load < 1):
  **294 passed, 6 failed** in 441s — the EXACT same 6 files as
  pristine: test-measurement-proof-update.js (proof source inputs not
  current), test-measurement-workflow.js, test-mobile-combat-cadence.js,
  test-occupation-panels.js, test-phone-frame-proof.js,
  test-establishment-r20-fixes-20261020.js (racks-voice gate). All six
  fail on master without this change (proof-staleness / phone-frame /
  cadence / panels / establishment areas — none touches wave-5 combat
  or the blooded hooks). The first run's extra 2 failures were load
  flakes: three tests hit the 120s per-test timeout under load 22.
  **The lever introduces zero new check.js failures.**

## Final state

- Lever: src/js/fieldFights.js +50, src/js/game.js +53,
  src/js/standing.js +47 — additive only, zero deletions; all 9 new
  empty catches report via console.warn.
- Proof: scripts/test-wave5kill-a.js — 35 passed, 0 failed (twice:
  inherited code, and after rebase + catch fixes).
- Evidence: this file; pilot corpus
  evidence/2026-11-10/perseed-wave5kill-a/ (16 legs); confirm corpus
  evidence/2026-11-10/perseed-wave5kill-confirm/ (32 legs); balance
  panels + compare report (see above).
- Commit: [needs-eyes] — the blooded narration is a feel change
  (Steve should hear the line on his phone when a Producer fight
  opens).
