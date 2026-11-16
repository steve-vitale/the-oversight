# Journey landing r139 — run note (2026-11-16)

**Run:** `journey-landing-20261116T0847Z`, Lane A leg 0 landing, days 1–14, horizon d28.
**Base:** local master `2fd2dad1f` (journey-scale r223). **Seeds:** fresh band **1162–1171**
(verified fresh — zero prior hits in `evidence/`; landing bands used before include
1142–1151, 1122–1131, 1083–1092, 1073–1082, 1063–1072, 1053–1062, 1043–1052).
**Driver:** `scripts/journey-landing-r139-20261116.js` (r138 driver verbatim except
OUTDIR, header, seeds, and the verbatim instrument fix below). **Prereg:**
`evidence/2026-11-16/journey-landing-r139-prereg.md` (+ addendum: pilot finding and
instrument fix, 2026-11-16T09:2xZ).

## Q1 — regression watch on the post-r138 master: REGRESSION FOUND

The watch did its job. Two findings, one pre-registered bar missed, one new live
defect in a core landing conversation path. This run changed **no game code**
(driver-only verbatim instrument fix + proof tests), so there is nothing to hold
back from landing; both items go to the fix queue with the fix shape sketched
below.

**Changes since r138's base (`2a7d3c857`):** exactly three `src/js/` files
(29 insertions, 2 deletions) — `conversation.js` +10 (crisis r223 F1: five
convoDriftNote stage-direction tails now matched by convoSnippetIsStageDirection,
so resume openers can't quote a drift note as memory); `villager-agency.js`
+19/−1 (sim-launchdef-a profile-gate bypass: a bid-and-selected `party_launch`
commit bypasses the dawn profile gate); `build.js` version stamp only.

### Binding bars

| Bar | r139 | Verdict |
|---|---|---|
| M1 alive at d28 | 10/10 | PASS |
| M2 System contact by d9 | 10/10 (d8–d9) | PASS |
| M3 fight triggers unknown/mixed | 0 (9 pending-face / 12 other, all classified) | PASS |
| zero-DMG invariant | 21 fights, 5 zero-DMG, all classified, 0 violations | PASS |
| practice movedCells ≥50, seedsWithMove 10/10 | 96, 10/10 (skill0→pos 55) | PASS |
| pocket fights / stuck turns | 0 pocket fights; 1 stuck-fight flag = driver artifact (see below) | PASS* |
| D1 garbled labels | 0 | PASS |
| HEED-V | 0 | PASS |
| M-PR1 max per-seed never-offered ≤1 | 1 (24 sittings: 18 offered, 18 picked, 16 promised, 2 stated, 2 never-offered) | PASS |
| personal bridge 0 / small bridge 0 | 0 / 0 | PASS |
| presshop farUnreached (reported only) | 0 (101 attempts, 0 fails, 22 together-stopped, hopReached 12) | — |
| R66 starvation deaths 0 / starvingWarnings 0 | **1 / 0 — gate reads HUNGRY** | **MISS** |
| amnesia | 0 | PASS |
| Miriam "That's settled" | 0 | PASS |
| fellBack | 0 | PASS |
| nodloop LOOP | 0 (8 nv sittings) | PASS |
| verbatimRepeats | **1** (Olivia — real) | **MISS (bar 0)** |
| verbatimRepeatsExempted | 3 (all spot-checked genuine re-poses) | — |

\* The move-refusals analyzer flags 1 stuck fight (seed 1168 d20 vs The Paparazzo,
42 failed moves, 0 strikes). Read in full from the fight log: the scholar DID
move on turn 1 ((8,0)→(6,1)), then the fight driver kept issuing move attempts
to every destination tile after the move budget was spent — the engine refused
each with "No movement left this turn" (the first refusal says so; the rest
are silent repeats of the same refusal). The fight resolved fine (allies killed
the Paparazzo; scholar ended hp 76, won). Not a stuck fight — a driver wart
(the fight driver should stop after the first budget refusal) and an analyzer
wart (the stuckFight definition counts budget-spent retries as stuck). Fix
owed next run; see metric review. `fleeStuckTurns` 2 (r138: 1), `dodgeStuckTurns`
1, `closeStuckTurns` 1 — same spam, same reading.

### Verbatim table

| Sitting | Line | Call |
|---|---|---|
| 1164-d5 Zoe | "Did you sleep? I kept hearing things out past the treeline." | EXEMPT (opener re-pose) |
| 1164-d6 Henry | "Is there someone here you don't trust? Be honest." | EXEMPT (resume re-pose) |
| 1168-d5 Nadia | "What's your first memory? Like, ever. The earliest thing." | EXEMPT (opener re-pose) |
| 1165-d9 Olivia | "Sure — what's on your mind?" (turns 5 and 26, both replies to `[dlg:subject]`) | **REAL** |

**Olivia (carried finding, NOT re-scored away):** one of six lines in the `small`
bridge pool (`src/js/convo-beats.js` BRIDGES.small), picked via `convoPickCycle`
with a keep-3 window that is global-recency-based (r153 cross-key reset). The
sitting used the small pool 6 times (5 distinct lines); the pool exhausted, the
reset freed the line after three other-pool servings pushed it out of the keep
window, and the reshuffle re-served it. The r127 comment's "seven small-bridges
before any repeat" does not hold when other pools' servings dilute the keep
window. No game change this run — the fix touches shared pick-cycle machinery
used by every pool and is not a safe mid-panel change. Fix owed: per-sitting
bridge memory or a bar revision (metric review).

**Instrument fix (driver-only, zero src/js, landed in this run):** the pilot
(seeds 1162–1165) first read `verbatimRepeats: 2`, both re-poses. The Henry
shape (1164-d6) showed the r138 opener rule missing a deliberate re-pose when
the sitting opens with a greeting and the question is spoken on the next turn.
Fix: the driver records, at each want-thread resume take, the THEM index the
re-posed line will occupy, and `scripts/landing-verbatim.js` gained an optional
5th arg `reposeIndices` (a duplicate is exempt when its occurrence index is a
recorded repose index; at most one exemption per line and per index).
Proof test `scripts/test-landing-r139-verbatim-repose-greeting-20261116.js`:
**23/23 pass** on a real Henry-shape sitting; the r138 proof test still
**19/19** (no regression). Pilot re-run with the fixed driver:
`verbatimRepeats: 1, verbatimRepeatsExempted: 2`.

**Drift-note F1 (crisis r223 fix) HOLDS live:** 7 drift-note beats fired this
panel (1162-d5 Maya, 1162-d11 Omar, 1163-d9 Jorge, 1166-d4 Viola, 1167-d8
Zarina, 1169-d9 Zoltan — each exactly once, as the sitting's opening narration
beat). **Zero quoted as a resume opener's memory.**

### FINDING F1 (new, the big one): warn_you heed goes silent — live defect

Both warn_you sittings this panel hit it (Dmitri 1162-d14, Meera 1170-d12).
The player picks "I'll be careful." and the NPC cycles three acknowledgment
lines ("Good. I mean it — watch yourself out there." / "Promise me that.
Please." / "Thank you. I needed to hear you say it."), then goes **silent**:
the no-repeat ledger in `sayLine` blocks the 4th+ picks, and the heed handler
(`src/js/convo-dialogue.js`, `dlg:heed`) passes no `fallback`, so `sayLine`
returns null and the turn speaks nothing. The want never leaves stage 2; the
sitting only ends on the wind-down budget. In Dmitri's sitting the player said
"I'll be careful" 8 times and heard back 3 times, then silence 5 turns running.

This is the same defect class the deepening arc already fixed for staying
(`dlg:stay` comment: "staying on loop used to cycle the same 3 lines verbatim
forever, the want stalling at stage 2... Now the fourth stay deepens — the
weight gets said out loud — and the want resolves as 'comforted' instead of
looping. No filler loop, no stall."). Heed never got that fix. It violates the
standing **no silent actions** rule in a path a real player hits in the first
fortnight — a villager warning you is one of the first things that happens.

Proved, not just read: a forced-want probe (`/tmp/probe-heed-force.js`,
staged warn_you, 8 heed picks) shows heeds 1–3 spoken, heeds 4–8 silent
(transcript grows by the player's line only), want stuck at stage 2 throughout.
**Fix owed (src/js, next build, not this run):** heed deepens on the 4th pick
(or resolves as 'warned' after the first heed), same shape as the stay fix —
plus a fallback so a blocked heed still speaks instead of going silent.

**Driver logging wart found while proving F1:** the transcript file logs the
handler's returned line (`r.line`) for every turn, even when `sayLine`
blocked it and nothing was spoken — so the file shows lines the player never
saw (Dmitri's file reads as a verbatim cycle; the truth is 3 spoken lines +
5 silent turns). The verbatim MET is unaffected (it reads `c.transcript`, the
ground truth — which is why the panel correctly counts 0 heed repeats), but
people-check readings of transcript files can be fooled on blocked turns.
Fix owed: driver should detect turns where the transcript gains no THEM entry
("phantom line" detector); see metric review.

### The panel's big move: everything got busier

Fights **21 vs 12** on r138, monster kills **286 vs 234**, hunt reps **0 → 16**,
presshop attempts **54 → 101**, favors broken **1 → 4** (promised 16, kept 12,
broken 4, accepted 19; r138: 13/7/1), scholar-turn moves **54 vs 9**. The
activity increase is broad, not one metric. Candidates: fresh-band composition
vs the profile-gate bypass (sim-launchdef-a: `party_launch` commits bypass the
dawn profile gate → more departures → more encounters, more hunt practice,
more presshop attempts). **Not adjudicated** — carried as an open question; a
matched-band A/B (same seeds, bypass on/off) is owed before any claim.

**Hunt moves:** H1-ESTABLISHED retires. Hunt assignments now resolve in the
landing window (16 reps across 11 villagers, max 4 per villager), but no
villager reaches 8 reps — the first rung is still out of reach in 28d.
New verdict: **H0-ESTABLISHED** (hunt assignments happen, first rung out of
reach).

**Scholar deaths: 1 → METRIC EARNED.** Chris (seed 1164, spawn Chris
gen_jwj53iq) died d28 in the contest gauntlet (participants Chris + Henry;
popSeries 12→11 at d28). Series: r136: 0, r137: 2, r138: 2, r139: 1 — third
consecutive panel with scholar deaths. Succession latency unmeasurable (death
on horizon day d28; the successor takes over after the panel ends). Metric
binds from r140; candidate bar ≤1 per 10-seed panel (metric review).

**Starvation / R66: BAR MISS — gate reads HUNGRY.** `starvationDeaths=1`
(Kwame, NPC, seed 1169 d28, pantryAtDeath=3000, cause class F — famine vs
doorstep undetermined), `scholarDeaths=1` on 1/10 seeds, unexplained=0.
Driver MET reads starvationDeaths=0 (its per-day death scan missed the d28
horizon-day death — instrument timing artifact, not a re-score). Judged by the
gate, the series' established R66 instrument, as r138 did. `starvingWarnings`
0, `dehydratedWarnings` 0. **Hungry at horizon: 6/10** (1164: 632/person,
1165: 514, 1167: 1284, 1168: 1218, 1169: 273, 1171: 1128) vs 4/10 on r137/r138.
FED: 1162 (5385), 1163 (2705), 1166 (2405), 1170 (3829). r104 flags
"HORIZON PANTRY (r60 Q-A): seeds=10 hungry=6 PATTERN (collapse recurs —
lever work candidate)".

**Deaths (census/r104): 8 human deaths** (r138: 10). 1162 none; 1163 none;
1164 Chris d28 arena (scholar); 1165 Francisco d22 ambush; 1166 Valeria d7
ambush; 1167 Liam d28 monster; 1168 none; 1169 Dale d11 ambush + Kwame d28
starvation (NPC); 1170 Meera d23 monster; 1171 Ursula d6 ambush. Grief watch
holds (0/8 miss — all registered).

**Flesh (monster-meat tail):** arrivalSeeds 7/10, testSeeds 9, exitSeeds 5,
stuckSeeds 2, openSeeds 5, noArrivalTested 2, noArrivalUntested 1 → CHANNEL
OPENS.

**Contest ledger: GO** (fired 25, ended 22, openAtHorizon 3, orphanEnds 0,
deathsWithContext 1, deathsMissing 0, joinArtifacts 0, wildArenaDeaths 0,
driverDisagreements 0). STARVATION adjudication GO (every death assigned a
cause class).

**Dialogue counters:** HEED 0, D2 verbatim warning repeats 0, D3 0,
WARNED-BUT-UNRESOLVED 0, fabricHistoryFlags 0, maras 0, justSaid 0,
commaStutter 0, punctStutter 0, declineDry 0, thirdPersonFavorHead 0,
deathMislabels 0. fledBad 2, fled 4.

**Outings:** favors 38 (r138: 34), waits 9, departs 11, kept 9 (outingchain;
MET favorKept 12 — a 3-count gap between instruments, observation only),
broken 4, open 27. Tele: dep/tog/ret/talk tracked per seed in the analyzers
log.

**Topic dwell (105 sittings):** want 132, personal 46, small 37, goal 21,
village 6, plans 3, past 1, gossip 0, grief 0, cheer 0. Probe sittings 10;
subjFrom: want 17, personal 10, small 8, village 2, goal 1.

## Village assessment (plain words)

Ten villages, twelve people each, all ten still standing at day 28. Eight
people died across the panel — five to monsters or ambushes, one scholar in
the arena, one to starvation, one to a monster on the last day. Nobody's
village scattered. The System made contact with every village by day 8 or 9,
and every village was killing monsters by the end of the fortnight (286 kills
between them). People are practicing — 96 skill cells moved, 55 villagers went
from knowing nothing to knowing something — and for the first time, hunting
practice is actually happening (16 reps; nobody's good at it yet, but they're
doing it). Favors are being made and mostly kept (12 kept, 4 broken).

The worry is food. Six of the ten villages end the month hungry — under 2,000
calories per person in the pantry, two of them under 650 — and one villager,
Kwame, starved on the last day with 3,000 calories sitting in the pantry. That
last detail is the sharp one: the food was there, the person still starved.
The pattern has now repeated three panels running (4/10 hungry, 4/10, now
6/10). The villages survive, but they survive hungry, and the hunger is
getting worse, not better.

## People check (Q2) — 5 full transcripts read

1. **Henry, 1164-d6 (curious, re-pose). PASS.** Opens with a staged talk
   request; Henry wants to know whether there's someone the player doesn't
   trust. Two deflections get visibly colder ("Sure." The warmth drains out
   of their eyes. / "Forget I said anything. What did you want?"). The
   re-pose is framed by the player's own choice ("We never finished — who
   you don't trust.") and reads as a person returning to an unfinished
   question. The naming debate is alive: the fire argued about a raccoon with
   too many fingers, Henry reports the vote tally with names. His personal
   answer is vivid ("I taught myself making do. The System was no help — I
   asked for a sandwich."). Wind-down works.
2. **Zoe, 1164-d5 (curious, opener re-pose). PASS.** Worried about noises
   past the treeline; deflects shut her down ("Okay." Something shutters. /
   "Fine." Their face closes like a door.). Concrete and lived: her plan is to
   eat something that isn't from a can; 2 people injured, tension about who's
   in charge; she's a plumber — "none of that prepared me for any of this."
   Nit: "Good question." opens two of her answers in one sitting.
3. **Nadia, 1168-d5 (curious, opener re-pose). PASS.** Same shape as Zoe,
   same honest deflection consequences. Guarded and dry ("The others think
   I've got it together. Cute. Very cute. Good talking."), plans to teach
   someone tomorrow — "Knowledge shouldn't sit still." Nit: "You want to know
   about that? Okay." opens three answers in one sitting.
4. **Dmitri, 1162-d14 (warn_you). FAIL — F1, the heed silent loop.** See
   above. The second warn_you sitting (Meera, 1170-d12) shows the same shape
   (7 heed picks, same 3-line cycle in the file, same silence underneath).
5. **Devon, 1169-d12 (seek_comfort). PASS (short sitting).** Grieving Dale,
   ambushed the day before — the grief is grounded in this village's own
   history ("There's still the matter of the ambush of Dale. Nobody's settled
   it."), and the case menu is live: go back to the site, name the witnesses,
   follow the food, call a moot. The driver left after one turn, so the
   sitting is short, but what is there is coherent and earned.

All three exempted re-poses read as deliberate, framed returns to an
unfinished question — not glitches. No fabricated shared history in any of
the five. No drift-note tail quoted as memory anywhere in the corpus.

**Lead-in nit (observation only):** topic answers repeat their lead-in within
a sitting ("Good question." x2; "You want to know about that? Okay." x3).
The answers differ, so no verbatim line repeats — but the ear hears the same
hinge three times in five minutes. Worth a look when the bridge pool gets its
per-sitting memory.

## Q3 — telemetry

`node scripts/telemetry-check.js` vs `telemetry-baselines/landing-split.json`:
**quiet** (10 files, 5 metrics, no large deviations). Baseline NOT rolled.
Current aggregates vs baseline: systemDay 82 (81), villagerDeaths 8 (9),
monsterKills 286 (217, +32% — under the 0.6 LOUD threshold), folTelemetry.fires
16 (15), starvAutopsies 0 (0). The monster-kills move tracks the fights
increase (21 vs 12) and is carried under the open question in Q1, not rolled
into the baseline — a fresh-band composition move is not a regime change.

## Q4 — gate

`node scripts/check.js --quick` (worktree, `--cacheDirectory=/tmp/jest-cache-playtest`):
**334 passed, 6 failed** in 807s (r138: 334/6 in 793s — identical counts and
identical failure signatures). All 6 verified **not attributable to this run's
change**: none of the six failing files references any file this run changed
(driver, `landing-verbatim.js`, proof test, evidence), and this run changed no
`src/js`. The six are the standing set, same messages as r138:

- `test-measurement-proof-update.js` + `test-measurement-workflow.js` —
  measurement-proof staleness pair ("Proof source inputs are not current" /
  "retained neutrality proof covers the current Game/controller/harness
  inputs"). Standing; refresh owed via `scripts/balance-proof-update.js`
  (maintenance, not this run).
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3 fails:
  retained browser input vs current source; boot inputs covered; current
  phone evidence required — index.html). Standing; refresh owed via
  `scripts/phone-frame-proof-update.js`.
- `test-living-garden-deed-attainment.js` +
  `test-one-person-army-deed-attainment.js` — both hit the 120s check.js cap
  (load timeouts under 4-parallel jest; deed-attainment sims).
- `test-ladder-bundle-20261108.js` — control "200 monster turns WITHOUT
  delivery fire the ambient raid — fires 0" (78 passed, 1 failed).

**0 attributable to this run's change.** Proof tests re-run on this tree:
verbatim-repose (r139) 23/23, verbatim-repose (r138) 19/19, zero-DMG invariant
PASS (fixtures + 3 corpora; r139 corpus analyzer: 21 fights, 5 zero-DMG, 0
unclassified). Standalone (not in the gate list): `test-convo-engine-trust.js`
6 pass / 1 fail on the verbatim closeLine — same pre-existing result as r137/r138,
carried as an observation.

## Metric review (proposals for r140, nothing binds this run)

1. **Scholar-death metric EARNED — propose bar ≤1 per 10-seed panel from
   r140.** Third consecutive panel with scholar deaths (r137: 2, r138: 2,
   r139: 1). If r140 also lands ≥1, the bar starts binding on a real trend,
   not a single panel.
2. **Olivia bridge repeat — fix owed.** Per-sitting bridge memory (a pool
   line served once per sitting, like the re-pose rule's one-per-line cap) or
   a bar revision. The shared pick-cycle machinery is the risk; the fix
   belongs in a build arm with its own panel, not a mid-panel patch.
3. **Heed loop (F1) — fix owed, shape sketched.** Heed deepens on the 4th
   pick (or resolves as 'warned' after the first heed), same shape as the
   stay fix; and a fallback so a blocked heed still speaks. Also propose a
   **phantom-line detector** in the driver: log when a `convoTurn` returns a
   line that never lands in `c.transcript` — the current file logging masks
   silent turns by printing `r.line`. A `silentTurns` counter would have
   caught F1 in the pilot instead of the people check.
4. **Fights 21 vs 12 — open question, matched-band A/B owed.** Same seeds,
   profile-gate bypass on/off, before any claim about the bypass or the band.
5. **Hungry 6/10 + R66 HUNGRY — carry.** Third panel of the collapse pattern;
   lever work candidate (already carried).
6. **StuckFight definition — carve-out owed.** Ignore moves refused with "No
   movement left this turn" (budget-spent retries), or teach the fight driver
   to stop after the first budget refusal. The 1168-d20 flag is an artifact.
7. **Hunt bar — H1 retires, H0 stands.** First rung (8 reps) still out of
   reach in 28d; watch whether hunt reps keep climbing as departures rise.
8. **Favors broken 4 vs 1 — watch item.** One panel is not a trend; watch
   r140 before calling it a rise.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Hunt assignments never resolve in the landing window — **RETIRED, replaced
  by H0 above** (assignments now resolve; first rung still out of reach).
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail pre-existing
  on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (maintenance, not this
  run, unless the gate shows them moved).
- Hungry-at-horizon watch (r137/r138 both 4/10; r139 now 6/10 — see Q1).

## Landing

[LANDING SECTION — fill after merge]

## Infrastructure notes

- Heartbeat loop died mid-run (PID 62298 gone by 09:39Z); the manual
  heartbeat at 09:39Z covered the gap and the loop was restarted (PID 19659,
  fresh 09:40Z). The registry never went stale enough to trigger a reaper
  removal — the tree stayed registered and active throughout.
- Probes used for F1 (`/tmp/probe-heed.js`, `/tmp/probe-heed-seeds.js`,
  `/tmp/probe-heed-force.js`) are diagnostics in /tmp, not committed. The
  forced-want probe is the one that proved the mechanism; it is not a test
  (it forces the want rather than staging it naturally — warn_you never fired
  in 40 fresh-game rosters at day 20, which is itself a note: the want needs
  village history behind it).
