# Journey landing r142 — run note (2026-11-17)

Lane A leg 0 LANDING. Run `journey-landing-20261117T1229Z`, scheduled
Tue 2026-11-17 05:45 CST. Base master `3cb0782e5` (journey-scale r233
closeout + sim-sametick-a adoption addendum). Seeds 1192–1201, 28d, r142
driver (r141 driver verbatim except header/seeds/OUTDIR). Corpus
`landing-r142-after` under the goal hidden_files evidence dir. Prereg:
`journey-landing-r142-prereg.md`.

## Q1 — regression watch on the post-r141 master: TWO BAR MISSES

The run's question: does the post-r141 master (establishment r231
deferred-ask guard; deathcleanup-b win-plan-dies-with-villager;
planignite-fix; scale r233 titan refusal) hold the landing bars on a
fresh band, and does the r141 metric-review M-PR1 revision hold?
Metric revision adopted from r141's review: M-PR1 scored only over
sittings where the want established, a dlg:help offer counting as the
stage-0 offer.

### Binding bars

| Bar | r142 | Verdict |
|---|---|---|
| M1 10/10 alive d28 | 10/10 | PASS |
| M2 System contact 10/10 by d9 | 10/10 (9×d8, 1×d9) | PASS |
| M3 fight-log 0 unknown/mixed | 0 unknown (16 fights) | PASS |
| zero-DMG invariant | PASS (1 zero-DMG, B-scholar-stood-through, classified) | PASS |
| practice movedCells ≥50, seedsWithMove 10/10 | 92 cells, 10/10, skill0→pos 61 | PASS |
| pocket watch 0 pocket fights / 0 stuck turns | 0 / **1** | **MISS** (stuck-turn half) |
| D1 garbled labels | 0 | PASS |
| HEED-V verbatim filler loop | 0 | PASS |
| M-PR1 revised never-offered ≤15% of established | **1/16 = 6.25%** (raw 3/19) | PASS |
| personal/small bridge 0 repeats | 0 / 0 (personal 22, small 8) | PASS |
| presshop farUnreached | 0 (reported only) | — |
| R66 starvation deaths 0, starvingWarnings 0 | **1** / 0 | **MISS** |
| amnesia 0, Miriam "That's settled" 0, fellBack 0 | 0 / 0 / 0 | PASS |
| nodloop LOOP=0 | 0 (105 sittings) | PASS |
| verbatimRepeats 0 | 0 (exempted 6, all genuine re-poses) | PASS |
| **scholar deaths ≤2** | **2** (Austin d10 the wild; Linda d25 starvation; mantles d11/d26, latency 1) | PASS |
| **silentTurns 0** | 0 | PASS |
| fleeStuckTurns / dodgeStuckTurns / closeStuckTurns | 0 / 1 / 1 | — (one turn, see F2) |

### FINDING F1 — R66 misses: a scholar starves at home with a full pantry (seed 1198, Linda, d25)

The panel's one starvation death is the scholar herself. Linda dies of
starvation on day 25 at Haven; the autopsy reads scholarKcal 1266,
packKcal 0, pantryEdible 22087, pop 10. Her personal-kcal series tells
the story: 2190–2390 on days 1–2, then 1000–1660 for the next three
weeks (dip to 519 on day 16), never once back above 1700 — she lived
hand-to-mouth the whole fortnight while the pantry held 8k–47k kcal.

The label is honest, not a mislabel: `resolveDay`
(src/js/engine/calories.js) subtracts the nightly need (2200) from the
scholar's kcal, and sets killedBy='starvation' when the deficit is
≥500 and health hits zero that night. Linda went to bed on ~1266,
the night took 2200, the deficit (~934) did the last damage to a
health bar already chipped by earlier hungry nights. The village meal
does feed the scholar (villageMeal: 1000/2000/2200 by trust, capped by
room under the 2400 cap) — but a 2000-kcal meal against a 2200 nightly
need plus a full day's action costs leaves nothing banked. She ate
every night and still starved: the margin, not the meal, is the story.

Whether that margin is right is a balance/policy question, not a code
defect I can fix blind in this run: is a scholar at home with a full
pantry supposed to live this close to the edge, or should the meal (or
the competent policy's daytime eating) bank more? Carried as the
finding to answer — with the numbers, not a fix. The R66 gate line
reads HUNGRY (starvation death); the telemetry starvAutopsies line
moves 0→1 against the baseline (the only metric move on the panel).

### FINDING F2 — pocket bar misses on one stuck turn: the board-sweep (seed 1193, d11)

One fight, one stuck turn. The scholar stands at [8,8] with moveLeft=1
and the close-fix sweep tries 43 destinations in a single turn segment
— [5,5], [5,6], [5,7], [4,4]… the whole board — every one failing
"Too far — 1 squares left." (the first speaks the line; the other 42
are deduped repeats, classified silent-noline by the analyzer's own
rule). The scholar strikes once, the fight is won in 3 rounds, hpEnd
74. No pocket (0 pocket fights), no stuck fight, no movedLie — but the
bar as written ("0 stuck turns") misses 1–0.

Player-facing, the symptom is mild: one "Too far" line, a scholar who
stands still for a turn while allies win the fight. The sweep itself is
the close fix working as built (it tries up to N destinations per
turn); with moveLeft=1 from a corner, none of them can ever land. The
metric-review proposal: bind the bar on pocketFights (the shape) and
keep stuckTurns as a watch, since the sweep inflates failed moves by
construction — the analyzer's own header says so. Panel move totals:
59 moves, 44 failed (42 silent-noline, 1 toofar, 1 nopath), 0
movedLie, 0 stuckFights. r141 for comparison: 14 moves, 1 failed
(occupied).

### FINDING F3 — hunt reps 0 (H1), explained as band variance, not a regression

HUNTPRACTICE: kills=222, huntReps=0, huntMax=0, huntVillagers>0=0 —
no hunt assignment resolved on any seed. The series settles it:
r137: 0, r138: 0, r139: 16, r140: 20, r141: 23, r142: 0. Hunt
assignments are a rare, lumpy dawn event; two earlier panels also read
zero with no game change behind them, and nothing in this run's src/js
diff touches dawn assignments (the deferred-ask guard is dialogue,
deathcleanup fires only on death, planignite is env-gated OFF on this
panel — PLANFIX unset, so the lever never armed). The first rung (8
reps) stays out of reach in 28d on all six panels. No defect claim.

### Watch items (reported, not binding)

- **Hungry at horizon 4/10** — eases again (r139/r140 6, r141 5, r142
  4). Hungry seeds at 755, 992, 286, 1491 kcal/person. The collapse
  pattern persists but keeps easing one notch a panel; lever work
  candidate, still carried.
- **Favors kept 7 vs broken 4** (outingchain; MET kept 9 vs broken 4) —
  keep-ahead a second panel running (r141 tied 7–7, watch closed).
- **Fights 16** (r139: 21, r138: 12, r140: 17, r141: 7) — back up
  after the r141 low. Matched-band A/B (profile-gate bypass on/off)
  still owed before any claim about the bypass or the band.
- **Contests**: 20 fired, 19 ended, 1 open at horizon (seed 1193, The
  Vigil, fired day 28 — a boundary artifact, not an orphan), 0 orphan
  ends, deathsWithContext 0, deathsMissing 0 — GO.
- **Flesh**: CHANNEL OPENS — arrival 7/10, tests 10/10, exit (into
  pantry) 7/10 (r141: 9/10 deposits).
- **Practice**: 92 moved cells, 10/10 seeds, skill0→pos 61.
- **statedAfterPick 1** (r141: 7) — the away-guard watch does NOT
  trigger (needs ≥6). The one case is the honest away-guard refusal
  (1194-d11 Xavier).
- **Plan watch**: seed 1197 holds 3 win-plans at d14 and d28 — a
  village DID start plans inside the fortnight, through the normal
  wave-3+ seeding path. (PLANFIX was off on this panel, so the
  planignite fix itself is unmeasured here; the r141 finding that the
  store "never switches on until a wave-3 fight, a kill, or a narrow
  escape" still describes 9/10 villages. Addendum: while this run was
  in flight, the planignite CONFIRM landed on master
  (sim-planignconfirm-b, 2a49a1e82): NO-GO — kills/departure 0.289 →
  0.115, deaths +25.7%; the lever stays env-gated OFF. The planignite
  fix is not going live; the plan-store wake-up question stays open
  for a different lever.)
- **Deferred-ask guard (r231)**: 0 "It's already handled" lines in any
  transcript. The trigger case did not fire live — no stage-0 favorless
  ask_favor sitting pressed dlg:help — so the guard is neither
  confirmed nor contradicted on this panel, same as C3c/C3d. The two
  dlg:help presses that engaged (1192-d11 Tom, 1194-d11 Xavier) both
  went to live asks. Proof tests stand.
- **C3c/C3d**: no live firing — no [recap] pick anywhere (recap was
  offered in 1198-d13 and 1192-d5, never taken), no stale-favor resume.
- **Fabric history**: 1 flag, a false positive — "Twelve people"
  spoken with a living roster of exactly 12 (1193-d6). The detector
  flags the count word regardless of truth. No fabricated history.
- **Lead-in nit grows**: "Good question." ×22 across 15 sittings
  (r141: ×8 across 7); "Huh. Let me think about that." ×14 across 10
  sittings. Same two hinges prefacing topic answers, more often.
- **Gossip template**: "X is back. Walked in like they'd never left."
  ×3 in one sitting (1194-d12 Yara: Xavier, Rafael, Maya) — same
  sentence frame, different names. Not verbatim, but the ear hears the
  frame three times.
- **Presshop**: attempts 120, pressFailTotal 1 (honest empty-patch),
  farUnreached 0, hopReached 24.
- **Zero-DMG**: 1, class others-killed, B-scholar-stood-through,
  trigger pending-face (1194-d10: allies kill the Lockpick for 47
  while the scholar stands through 2 rounds, 0 strikes). Classified,
  invariant holds.
- **M-PR1 detail**: sittings=19 offered=15 picked=15 promised=14
  statedAfterPick=1 neverOffered=3 settled=1. The three never-offered:
  1196-d7 and 1199-d5 are resolution=unestablished (want never pinned;
  1199-d5 did offer [dlg:help], untaken in a topic probe) — excluded
  per the revised denominator. The one that counts, 1194-d13 Meera, is
  a turn-0 leave: the want was stage 2 fromSeed, the player left
  immediately, no commit or help was ever offered — a probe-shape
  artifact, NOT a repeat of r141's F1 (an engaged sitting with a
  stated same-day need and no accept path). That F1 shape does not
  recur on r142.

## Village assessment (plain words)

Ten villages, all alive at day 28. The System reached every one by day
8 or 9. Eight villagers died across the ten villages — ambushes took 4,
monsters 2, the wild took the scholar Austin on day 10 (seed 1194;
Duc took the mantle the next day), and starvation took the scholar
Linda on day 25 (seed 1198; Miguel took the mantle the next day). Two
villages lost nobody at all. Nobody else starved. The pantry is still
the standing worry: 4 of 10 villages end the fortnight under 2000
calories per person in store, one of them at 286 — the same collapse
shape as the last five panels, easing one notch, and nobody in the
villages is fixing it. Favors mostly stay open (23 of 34), and this
panel more keep than break. The monster-meat channel is open where it
needs to be: 7 of 10 villages got flesh in, all 10 tested it, 7 got it
into the pantry. People are learning to fight (92 practice cells
moved, 61 skills lifted off zero) and 222 monsters died to villager
hands — but no villager was ever assigned a hunt in the fortnight, and
only 16 real fights happened. One village (1197) is already carrying
three win-plans by day 14; the other nine have none. The villages
survive the fortnight. They do not yet look like they will win the
year.

## People check (Q2) — 5 full transcripts read

All five read as people, not menus. No fabricated shared history in
any of them. The one fabric-history flag is a true count (see watch
items).

1. **Ingrid, 1198-d13 (warn_you)** — PASS. Heeds 1–3 are the ack
   lines ("Promise me that. Please." / "Thank you. I needed to hear
   you say it." / "Good. I mean it — watch yourself out there.");
   heed 4 deepens ("You hear me, right? Not the words — the part
   underneath. I'm scared, and I'm asking you not to make me watch it
   happen."), stage 3, resolution `heeded`. The heed fix holds — the
   same textbook shape as r141's Andres sitting. 0 silent turns.
2. **Tom, 1192-d11 (ask_favor, stage-0 help)** — PASS, and the best
   shape on the panel. Stage-0 want, dlg:help offered and taken
   ("Honestly? I'm alright right now. Just good to talk."), the need
   surfaces over two depth beats ("The stores won't stretch past
   tomorrow..." → "Come forage with me tomorrow"), the commit menu
   appears, the player commits, Tom names the plan ("The far treeline,
   past the rocks, before the heat sets in. Pack and knife. We travel
   light."), resolution promised. The r230 dlg:help fix working end
   to end.
3. **Xavier, 1194-d11 (ask_favor, dlg:help, away-guard)** — PASS.
   "I asked Austin about the pantry run — Austin's gone. Still need
   hands. Are you in?" — the want names the dead scholar honestly
   (Austin died the day before, d10). The player commits and gets the
   honest away-guard refusal ("I'm out on the road, away from Haven
   — no dawn meet while I'm out"). Resolution stated, correctly.
4. **David, 1192-d5 (curious, resume-take)** — PASS. He asks what
   the player misses; the player deflects twice and the question dies
   where it stood ("Okay." Something shutters, just slightly. /
   "Fine." Their face closes like a door.). The resume re-pose is
   genuine ("We never finished — what you miss most." → the question
   asked again). Real content throughout: his plan ("I want to go
   further than I've gone. Not running — exploring."), the village
   state (2 injured, tension about who's in charge). The "Huh. Let me
   think about that." hinge appears twice — the lead-in nit.
5. **Yara, 1194-d12 (seek_comfort)** — PASS as people, with a soft
   note. She opens grieving ("Have you — sorry. I keep thinking about
   them."), the player comforts, she thanks them — and then the whole
   sitting drifts into gossip depth (7 beats: Xavier's back, Rafael's
   back, Elif hauling, Rowan the farmer, Maya the dockworker) and the
   grief thread is never returned to. The want ends stage 3,
   resolution engaged — but the engagement is with gossip, not the
   comfort. Honest enough (people do deflect grief into small talk),
   and the gossip frame repeats ("X is back. Walked in like they'd
   never left." ×3) — see watch items.

## Q3 — telemetry

`node scripts/telemetry-check.js` vs
`telemetry-baselines/landing-split.json`:
**quiet** (10 files, 5 metrics, no large deviations). Current vs
baseline: systemDay 81 (81), villagerDeaths 8 (9), monsterKills 222
(217, +2%), folTelemetry.fires 14 (15), starvAutopsies 1 (0 — the
Linda death, already the Q1 finding). Baseline NOT rolled.
(One self-inflicted LOUD line on the first invocation — bare
`folTelemetry` instead of `folTelemetry.fires` summed the `calls`
field to 8148; re-run with the dotted metric is quiet. Not a game
deviation.)

## Q4 — gate

`node scripts/check.js --quick` (worktree,
`--cacheDirectory=/tmp/jest-cache-playtest`): **334 passed, 6 failed
in 830s** (r141: 332/8). Adjudication: 0 attributable to this run
(this run changed no src/js — driver, prereg, evidence only).

Standing 4 files, identical messages to r141:
- `test-measurement-proof-update.js` +
  `test-measurement-workflow.js` — measurement-proof staleness pair.
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3
  fails, same messages as r141).
- `test-ladder-bundle-20261108.js` — same control fail (200 monster
  turns WITHOUT delivery fire the ambient raid — fires 0).

Load 2, adjudicated NOT attributable — both hit the 120s check.js cap
under 4-parallel jest, same as r141, and both pass standalone on this
tree, run sequentially after the gate:
- `test-living-garden-deed-attainment.js` (120s timeout → 8/8
  standalone).
- `test-one-person-army-deed-attainment.js` (120s timeout → 7/7
  standalone).

Better than r141 by 2 files: `test-trust-observer-neutrality.js` and
`test-measurement-cache-flags.js`, both failing on r141 (timeout and
load/EPERM-flap respectively), pass inside this gate.

## Metric review (proposals for r143, nothing binds this run)

1. **Pocket bar — bind the shape, watch the turns.** r142 misses the
   bar as written (0 pocket fights / 1 stuck turn) on a single turn
   produced by the close fix's board-sweep, in a fight the scholar's
   side won. Propose: pocketFights = 0 binds; stuckTurns reported as
   a watch (a panel with ≥2 stuck turns, or a stuck turn in a LOST
   fight, reopens the question).
2. **M-PR1 revised scoring holds.** 1/16 = 6.25% on the fresh band;
   the one case is a turn-0 leave, not an engaged sitting. Keep the
   revised denominator (established sittings only, dlg:help counts as
   the stage-0 offer). If a future panel's revised never-offered case
   is again a turn-0 leave, consider excluding sittings the player
   left on turn 0.
3. **R66 — the starvation margin is now the question.** A scholar at
   home with a full pantry lived hand-to-mouth for three weeks and
   died on a 934-kcal nightly deficit. The bar (0 starvation deaths)
   did its job by firing. The follow-up belongs to a balance/policy
   arm: meal share vs daily burn for a Haven-bound scholar, and
   whether the competent policy should bank food during the day. Do
   not re-score the bar; answer the margin question.
4. **Hunt H1/H0 oscillation is band variance.** Series 0, 0, 16, 20,
   23, 0 — no bar, no claim. The matched-band A/B question (fights
   21/12/17/7/16) stays owed.
5. **Lead-in nit is growing, not shrinking.** "Good question." 8 → 22
   across the last two panels. Worth a look when the bridge pool gets
   its per-sitting memory; the hinges are the same family.
6. **Telemetry baseline — do NOT roll.** Quiet panel; the baseline
   stays r136-pinned. The starvAutopsies 0→1 is the finding, not a
   reason to move the baseline.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel; NOT this run. Did not
  recur on r142 (verbatimRepeats 0, goal pool 1 serving, 0 repeats).
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim
  about the bypass or the band.
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10.
- Stated same-day need with no commit path (r141 F1, 1189-d14) —
  design question (dawn-meet-shaped commit vs same-day accept),
  documented for Steve/design call, not fixed here. Did not recur on
  r142 (the one revised never-offered case is a turn-0 leave).
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d. (r142 reads H1 — same rung, no
  assignments at all; see F3.)
- Lead-in nit (r139/r140/r141/r142): topic answers repeat their
  lead-in within a sitting. Observation only; worth a look when the
  bridge pool gets its per-sitting memory.
