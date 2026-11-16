# Journey landing — r138 (Lane A, leg 0: days 1–14, horizon d28)

Run id: `journey-landing-20261116T0423Z`. Base: `2a7d3c857` (journey endgame
r219 + journey-scale r219).
Panel: seeds 1142–1151, DAYS=28, driver `scripts/journey-landing-r138-20261116.js`
(r137 driver verbatim except OUTDIR + header + the Q1 exemption). Corpus:
`hidden_files/evidence/2026-11-16/landing-r138-after/` (124 files, 104 transcripts).
Prereg: `evidence/2026-11-16/journey-landing-r138-prereg.md`.

## Q1 — verbatim-repeat counter: the deliberate re-pose is now exempt (r137 metric-review proposal, IMPLEMENTED)

**The defect (r137):** the r137 fix re-poses the same curious question
when the player picks the want-thread resume — and the driver's verbatim
counter counted all four r137 re-poses as VERBATIM REPEATS (seeds 1146,
1147, 1148, 1150). Verified against the saved r137 corpus before writing
the fix: each sitting's opener is a single THEM line, the curious question
itself; the resume take is followed immediately by the same question text.

**The fix** (driver-only instrument, zero src/js):
- New shared module `scripts/landing-verbatim.js` exporting
  `splitVerbatimDupes(dupes, themNorm, openerCount, resumeTakes)` →
  `{ real, exempted }`. A duplicate is EXEMPT when its FIRST occurrence
  is one of the sitting's opener THEM lines AND the sitting took a
  want-thread resume — at most one occurrence per distinct line per
  sitting. No '?' test: one of the four r137 re-poses ends in a period
  ("What's your first memory? Like, ever. The earliest thing.").
  Exempted lines are counted separately (`MET.verbatimRepeatsExempted`)
  and logged, so an explosion stays visible.
- r138 driver requires the module; the proof test imports the SAME
  function (no duplicated predicate to drift).

**Proof test** `scripts/test-landing-r138-verbatim-repose-20261116.js`:
**19 pass, 0 fail** on a REAL re-pose sitting (scripted Liam shape,
qid=q_skill, "What's something you're good at that nobody here knows
about?"): the re-posed question is exempted exactly once, nothing else
counts; the no-resume and no-opener controls count it as real; a
mid-sitting duplicate stays real; a third speaking counts as real;
inputs never mutated; edge inputs behave.

**Panel watch (live confirmation):** the r138 panel took the resume
**8 times** (same as r137) — the 4 curious re-poses all re-posed the
question, 0 generic acknowledgments. `verbatimRepeats` reads **0**,
`verbatimRepeatsExempted` reads **4**, and the four exempted lines are
exactly the four re-posed questions (1146-day7 David, 1147-day5 Aroha,
1148-day6 the woman in her 60s, 1150-day5 the gap-toothed man —
spot-checked against their transcripts). The 4 favor-thread resumes
("that foraging help") speak fresh urgency lines, not opener repeats,
and produced no exemption. The fix works on live data, not just in
the test.

## Q1b — person-trust baseline re-pin (r137 carry, DONE)

r137 carried: HAUL 0→3 on the r215 base is base movement; re-pin owed.
This run: the panel on the r219 base is **byte-identical** to r137's
({maxTrust:70, entries:52, trustedOpen:3, kinds:{LEAVE:2, WATER:204,
EAT:53, VISIT:15, FORAGE:1, SEEK:19, HAUL:3}}) — the drift is stable
across two bases, not a flaky read. Mechanism class is RNG-stream drift
(same as the r135 FORAGE flip): the r215 base changes that moved it
(the curious-resume stutter fix + a trust-test harness fix) touch no
hauling or dawn-scorer code. Re-pinned **HAUL 0 → 3 only** (the only
failing kind; WATER/EAT pass tolerance, VISIT is not in the bar), with
the measured panel recorded in the header comment. Bar shape unchanged.
`test-person-trust-20261108.js` now **19/19** (was 18/1 on r137) —
which is why this run's gate reads 334/6 against r137's 333/7.

## Q2 — panel bars (r138 vs r137 — the panel is game-state-identical to r137)

Every metric below matches r137 exactly; the scale r219 + endgame r219
base changes moved NOTHING in the landing window.

| Bar | r137 | r138 | Verdict |
|---|---|---|---|
| Alive at d28 | 10/10 | **10/10** (over=no all seeds) | PASS |
| System contact by d9 | d8 (d9 on 1149) | **d8 (d9 on 1149)** | PASS |
| Unknown/mixed fight triggers | 0 | **0** (pendingFace 11/1, all classified) | PASS |
| Zero-DMG invariant | PASS (12 fights) | **PASS (12 fights, 0 violations)** | PASS |
| Practice movedCells | 93 | **93** (10/10 seeds moved) | PASS |
| Practice skill0→pos | 58 | **58** | PASS |
| Pocket (terrain) | 0/0 | **0/0** | PASS |
| D1 garbled labels | 0 | **0** | PASS |
| HEED-V | 0 | **0** | PASS (binds) |
| HEED | 0 | **0** | PASS |
| M-PR1 max never-offered per seed | ≤1 | **≤1** (3 never-offered, max 1/seed) | PASS |
| Bridges repeats | 0 | **0** (personal 0/18, small 0) | PASS |
| Presshop farUnreached | 0 (reported) | **0** (reported only) | reported |
| R66 starvation | 0/0 | **0/0** (0 starvation deaths, 0 starving warnings) | PASS |
| Amnesia (1130-d6) | 0 | **0** (only hit is the player's own `a_blur` answer option) | PASS |
| Miriam line | 0 | **0** | PASS |
| fellBack | 0 | **0** | PASS |
| Nodloop LOOP | 0 | **0** (8 nv sittings, winddown everywhere) | PASS |
| verbatimRepeats / exempted | 4 / — | **0 / 4** (Q1) | PASS |

**Fights:** 12 (r137: 12). Two zero-DMG fights, both the no-strikes shape —
the monster routed in round 1 before any strike (1143 d17 Lockpick w1
with ally Aki; 1146 d22 The Understudy w2 with ally Elijah). Scholar
turns: player-wait 0, player-move 9, player-barrier-exit 0,
player-ability 0. Move refusals: 0 stuck fights (fleeStuckTurns 1, same
as r137 — a single stuck flee turn, not a stuck fight).

**Practice:** movedCells 93, skill0→pos 58, practiceReps 2,904 (all
identical to r137). **Hunt:** huntReps 0 again — H1-ESTABLISHED carries.
Monster kills 234 (r137: 234).

**Outings:** favors 34 (r137: 34), kept 7, broken 1, farHaul 5, nearHaul 2,
CHAIN-COMPLETES-FAR. Presshop attempts 54, pressFailTotal 0,
togetherStopped 11 (all identical to r137).

**Commit-offer (M-PR1):** 22 sittings, offered 18, picked 18, promised 13,
stated 5, neverOffered 3, settled 2 (identical to r137, same per-sitting
rows). The 5 stated refusals are all the honest road refusal.

**Want engagement:** curious 70, ask_favor 22, none 8, seek_taken 2,
seek_comfort 1, just_company 1 (identical to r137).

**Topic dwell:** 104 sittings, want dwell 145, personal 39, plans 15,
gossip 11, village 8 (identical to r137).

## Village assessment (plain words)

Ten villages, all alive at day 28. The first fortnight does what it should:
people meet the System around day 8, start asking each other real questions,
and settle into work — wood, stone, water, cooking — with skills visibly
moving (58 people learned something they couldn't do on day 1).

Ten people died (r137: 10). Four to ambushes, three to monsters, one lost
in the wild, one to sickness, one to the Gavel. Two of the dead were the
scholar — Rosa, lost in the wild on day 11 (seed 1144), and Sophia, sick
on day 27 (seed 1149) — the same two as r137, same days, same causes.
Both times the village handed the role on the same day or the next
(Aaliyah d11, latency 0; Roman d28, latency 1), so the story kept going.

Nobody starved. Four villages end the month thin on food (under 2,000 kcal
per person) — the same four as r137 (1145, 1146, 1147, 1151) — and none of
them slid into a starvation spiral. The pantry is tight, not collapsing.

The conversations are the healthiest part of the leg. People ask about
each other's old lives, first memories, how they slept — and when you
walk away from a question and come back to it, they ask it again instead
of nodding it away. Favors get kept more often than broken (7 kept,
1 broken), and when someone can't promise, they say so honestly rather
than promising and vanishing.

What is still missing: nobody goes hunting in the landing window (hunt reps
0, as in every panel — the work is still waiting on a lever, not a
measurement). Four villages end hungry. And the scholar died in the first
month on two panels running now (r137 and r138) — if it recurs a third
panel, it earns a metric.

## Q3 — people check (5 full transcripts read)

- **1146-d7, David (curious re-pose):** deflected twice, came back with
  "We never finished — your useful old-life skills." David re-asks the
  question himself; the probe deflects again and the question stays open
  — owed, not killed. His plan: "one good meal, one good conversation,
  one night of real sleep." The beast-naming vote at the end is alive
  and specific.
- **1147-d5, Aroha (curious re-pose):** re-pose clean ("What's your first
  memory? Like, ever. The earliest thing."). Real content: "2 people are
  injured; there's tension about who's in charge" and "I keep thinking
  about the water situation. If I can figure out a better way to carry
  it, that changes everything." Closes "This was nice. Don't be a
  stranger — we're twelve people, it's hard."
- **1148-d6, unnamed woman in her 60s (curious re-pose):** re-pose clean;
  her plan is "Sleep. That's the plan. Real sleep, not the kind where
  one ear stays open." She catches herself burdening the player
  ("Sorry — I shouldn't load that on you."). Winddown lands a real line
  ("The fire's the real leader here. We just orbit it and pretend we're
  in charge.").
- **1150-d5, gap-toothed man (curious re-pose):** re-pose clean; his plan
  is "I'm going to fix the thing that's been bothering me. You know the
  one. Everyone has one." His past life: "Being a crossing guard feels
  like a past life. Sometimes I wonder if I dreamed it."
- **1149-d6, Desmond (ask_favor + favor-thread resume):** Desmond asks for
  forage help with a concrete reason and meet; the player commits; the
  resume ("We never finished — that foraging help") re-states the stakes
  ("The stores won't stretch past tomorrow, and I'm not choosing who
  eats."). Mid-sitting: "What if the monsters are scared of us too?
  We're the aliens here." The naming debate ("Roman is pushing 'Sir
  Blinds-A-Lot'") and the winddown ("First light. The pantry's counting
  on us.") close a sitting that ends promised — and the favor was kept
  (540 kcal delivered d8).

**Bar verdict:** holds across all five. NPCs want something, options engage
or deflect, endings resolve, plant, or owe. No fabricated shared history, no
filler loops. The one repeated line the verbatim counter used to flag is
the deliberate re-pose itself — now exempted, and spot-checked.

## Q4 — telemetry

`node scripts/telemetry-check.js` vs `telemetry-baselines/landing-split.json`:
**quiet** (10 files, 5 metrics, no large deviations). Baseline NOT rolled.

## Gate

`node scripts/check.js --quick` (worktree, `--cacheDirectory=/tmp/jest-cache-playtest`):
**334 passed, 6 failed** in 793s (r137: 333/7 — the difference is exactly
the person-trust test, now green after the Q1b re-pin). All 6 verified
**pre-existing on pristine HEAD `2a7d3c857`** by stash comparison (my
changes stashed as `09d04f0a`, each failing test re-run on the clean tree,
identical failures; stash restored via the same commit and dropped):

- `test-measurement-proof-update.js` + `test-measurement-workflow.js` —
  measurement-proof staleness pair ("Proof source inputs are not
  current" / "retained neutrality proof covers the current
  Game/controller/harness inputs"). Standing; refresh owed via
  `scripts/balance-proof-update.js` (maintenance, not this run).
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3 fails:
  retained browser input vs current source; boot inputs covered;
  current phone evidence required — index.html). Standing; refresh owed
  via `scripts/phone-frame-proof-update.js`.
- `test-living-garden-deed-attainment.js` +
  `test-one-person-army-deed-attainment.js` — both hit the 120s check.js
  cap (load timeouts under 4-parallel jest; deed-attainment sims).
- `test-ladder-bundle-20261108.js` — control "200 monster turns WITHOUT
  delivery fire the ambient raid — fires 0" (78 passed, 1 failed).
  Pre-existing on pristine.

**0 attributable to this run's change.** Proof tests re-run on the restored
tree: verbatim-repose 19/19, person-trust 19/19, r137 re-pose 21/21,
seed-resume 17/17, HEED-V analyzer 6/6, zero-DMG invariant PASS on the
r138 corpus (12 fights, 0 violations). Standalone (not in the gate list):
`test-convo-engine-trust.js` 6 pass / 1 fail on the verbatim closeLine —
pre-existing on pristine, carried as an observation (same as r137).

## Regression adjudication

- `test-convo-engine-trust.js`: 6 pass, 1 fail — "zero verbatim NPC repeats
  across both conversations — 'Good talk. I feel like I know you a little
  better now.'" (curious closeLine, single-line pool, spoken in two
  sittings). **Pre-existing on pristine HEAD `2a7d3c857`** (verified by
  stash comparison — identical with/without this run's changes). Carried
  as an observation; out of prereg scope.
- Gate heartbeat note: the registry lock was held by sibling registrations
  (sim-profilegate-a, journey2-5) and then the reaper cron for a ~20-min
  stretch mid-gate, so heartbeat attempts timed out and the last good
  heartbeat went ~16 min stale once. The worktree was dirty throughout,
  so the reaper could not have touched it; heartbeat landed immediately
  after the lock freed. No work lost. (The reaper/register lock-holding
  design is the known 2026-11-12 self-contention item, still awaiting a
  Steve nod on the fix.)

## Metric review

- **farUnreached demoted (prereg):** the carried six-panel shape (exactly
  1 per panel) broke on r137 (0) and reads 0 again on r138. The premise
  was a small-sample artifact, not a law. farUnreached is reported only
  from this run; no bar binds it.
- **Scholar deaths 2, second panel running:** r136: 0, r137: 2, r138: 2
  (same two deaths, same days, same causes, succession latency 0 and 1).
  No bar binds yet — if it recurs a third panel running, it earns a
  metric. Watch on r139.
- **Hungry-at-horizon 4/10, unchanged:** same four seeds as r137 (1145,
  1146, 1147, 1151). The r104 "PATTERN" label is a standing watch, not a
  regression. R66 gate still NOT-HUNGRY (0 slide seeds).
- **Panel identical to r137:** every counted metric matches r137 exactly
  (practice, kills, fights, outings, presshop, want engagement, topic
  dwell, commit-offer, scholar deaths, hungry seeds). The r219 base
  changes moved nothing in the landing window — the regression watch is
  quiet, and the Q1 exemption is the only thing that changed the read
  (verbatimRepeats 4 → 0, exempted 4).
- **wantThreadResumeTakes MET reads 1, not 8:** the counter is reset per
  seed (R42: per-seed meaningful), so the final MET value is only the
  last seed's count. The panel total (8 takes) is read off the transcripts.
  Not a defect — but a future reader of the MET dump should know.

## Carried (unchanged)

- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
- Hunt assignments still never resolve in the landing window (H1-ESTABLISHED).
- NV sittings share one closing template (palms-pressed goodbye) — middles
  are their own; observation only.
- Analyzer vs transcript streak count (r134 carry — analyzer maxSameStreak=1
  on nv sittings vs transcript summary maxStreak=4–5; no bar depends on it).
- Measurement-proof + phone-frame-proof staleness pair (refresh owed via
  the update scripts — maintenance, not this run).

## Landing

Q1 exemption + proof test + Q1b re-pin + run note + prereg, committed in
the worktree, merged ff-only to master. **Merged locally, pending ship.**
No bump, no push, no live check (ship loop owns those).
