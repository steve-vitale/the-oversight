# Journey landing — r137 (Lane A, leg 0: days 1–14, horizon d28)

Run id: `journey-landing-20261115T2059Z`. Base: `abc52dce1` (journey-scale r215).
Panel: seeds 1142–1151, DAYS=28, driver `scripts/journey-landing-r137-20261115.js`
(r136 driver verbatim except OUTDIR + header). Corpus:
`hidden_files/evidence/2026-11-15/landing-r137-after/` (124 files, 104 transcripts).
Prereg: `evidence/2026-11-15/journey-landing-r137-prereg.md`.

## Q1 — want-thread resume re-pose fix: LANDED, proven, and confirmed live

**The defect (r136):** picking "We never finished — <question>" on a deflected
curious question spoke only a generic acknowledgment ("About needing to be
alone — yeah, we never did get back to that."). The question was never
re-asked and the thread died. Two confirmed takes (Liam 1144-d6, Yara 1142-d5).

**The fix** (`src/js/conversation.js`, `alive:thread:want` handler, +49/−1): when
the resume beat is null and the live want is a question-want (today only
curious) with a known, unanswered question id, re-hang THE SAME question via
the question machinery and speak the question itself, bare. The want reopens
(stage 3→1) so a later answer engages it. The r121 first-reveal guard and the
HEED-ENGAGE path are untouched; the generic line stays as fallback.

**Proof test** `scripts/test-convo-want-resume-repose-20261115.js`: **21 pass,
0 fail** post-fix (was 5 pass / 9 fail on the defect assertions pre-fix).

**Panel watch (live confirmation):** the r137 panel took the resume choice
**8 times** — and **0 times** did the generic acknowledgment follow (r136: 4
times). The re-posed lines are the questions themselves, asked again in the
person's own words: "What's something from your old life that's actually
useful here?", "What's your first memory? Like, ever. The earliest thing.",
"Did you sleep? I kept hearing things out past the treeline.", "Okay, real
question: what's the funniest thing you've seen since we got here?". The
answer menu is offered and the want reopens at stage 1. The fix works on live
data, not just in the test.

## Q2 — panel bars (r137 vs r136)

| Bar | r136 | r137 | Verdict |
|---|---|---|---|
| Alive at d28 | 10/10 | **10/10** (over=no all seeds) | PASS |
| System contact by d9 | d8 (d9 on 1149) | **d8 (d9 on 1149)** | PASS |
| Unknown/mixed fight triggers | 0 | **0** | PASS |
| Zero-DMG invariant | — | **PASS** (12 fights, 0 violations; `test-landing-r115-zerodmg-invariant.js`) | PASS |
| Practice movedCells | 94 | **93** (10/10 seeds moved) | PASS |
| Practice skill0→pos | 56 | **58** | PASS |
| Pocket (terrain) | 0/0 | **0/0** | PASS |
| D1 garbled labels | 0 | **0** | PASS |
| HEED-V | 0 (proposal) | **0** | PASS (binds) |
| HEED | 1 | **0** | PASS (movement, see metric review) |
| M-PR1 max never-offered per seed | ≤1 | **≤1** (3 never-offered across 22 sittings, max 1/seed) | PASS |
| Bridges repeats | 0 | **0** (personal 0/18 servings, small 0) | PASS |
| Presshop farUnreached | 1 | **0** | reported (see metric review) |
| R66 starvation | 0/0 | **0/0** (0 starvation deaths, 0 starving warnings) | PASS |
| Amnesia (1130-d6) | 0 | **0** | PASS |
| Miriam line | 0 | **0** | PASS |
| fellBack | 0 | **0** | PASS |
| Nodloop LOOP | 0 | **0** (8 nv sittings, winddown everywhere) | PASS |

**Fights:** 12 (r136: 7). Two zero-DMG fights, both the no-strikes shape —
the monster routed in round 1 before any strike, full HP, no killer
(1143 d17 Lockpick w1 with ally Aki; 1146 d22 The Understudy w2 with ally
Elijah). The invariant (a scholar standing through rounds dealing 0) is
0 violations. Historical band for zero-DMG is 2–4; this is normal.
Scholar turns: player-wait 0, player-move 9, player-barrier-exit 0,
player-ability 0; 4/12 fights carry verb data. Move refusals: 0 stuck fights.

**Practice:** movedCells 93, skill0→pos 58, practiceReps 2,904 (r136: 2,540).
**Hunt:** huntReps 0 again — H1-ESTABLISHED carries (no hunt assignments
resolve in the landing window). Monster kills 234 (r136: 217).

**Outings:** favors 34 (r136: 28), kept 7 (r136: 6), broken 1 (r136: 3),
farHaul 5, nearHaul 2, CHAIN-COMPLETES-FAR. Presshop attempts 54 (r136: 88),
pressFailTotal 0, togetherStopped 11.

**Commit-offer (M-PR1):** 22 sittings, offered 18, picked 18, promised 13,
stated 5, neverOffered 3, settled 2. The 5 stated refusals are all the honest
road refusal ("I'm away from Haven, out on the road… find me when I'm back") —
a person refusing a promise they can't keep, not a defect.

**Want engagement:** curious 70, ask_favor 22, none 8, seek_taken 2,
seek_comfort 1, just_company 1.

**Topic dwell:** 104 sittings, want dwell 145, personal 39, plans 15,
gossip 11, village 8. Same shape as prior runs: most topics can't repeat in
a sitting (STARVED: grief, cheer, goal, past, plans, gossip, secret, small);
only personal and want are trigger-capable.

## Village assessment (plain words)

Ten villages, all alive at day 28. The first fortnight does what it should:
people meet the System around day 8, start asking each other real questions,
and settle into work — wood, stone, water, cooking — with skills visibly
moving (58 people learned something they couldn't do on day 1).

Ten people died (r136: 9). Four to ambushes, four to monsters, one lost in
the wild, one to sickness. Two of the dead were the scholar — Rosa, lost in
the wild on day 11 (seed 1144), and Sophia, sick on day 27 (seed 1149). Both
times the village handed the role on the same day or the next (Aaliyah, then
Roman), so the story kept going. That is the first panel with scholar deaths
since the re-pin; the succession worked, but it is worth watching whether
scholar deaths become a regular thing.

Nobody starved. Four villages end the month thin on food (under 2,000 kcal
per person) — the same count as r136, different villages — and none of them
slid into a starvation spiral. The pantry is tight, not collapsing.

The conversations are the healthiest part of the leg. People ask about each
other's old lives, plans for tomorrow, how the village is holding up — and
when you walk away from a question and come back to it, they now ask it
again instead of nodding it away. Favors get kept more often than broken
(7 kept, 1 broken), and when someone can't promise, they say so honestly
rather than promising and vanishing.

What is still missing: nobody goes hunting in the landing window (hunt reps
0, as in every panel — the work is still waiting on a lever, not a
measurement). Four villages end hungry. And the scholar can now die in the
first month — twice this panel — which the next runs should keep an eye on.

## Q3 — people check (5 full transcripts read)

- **1144-d5, Greta (curious):** deflected at the opener, came back with "We
  never finished — the talking-to-strangers part." Greta re-asks the question
  herself ("…Hi. Sorry. I'm not good at the talking-to-strangers part. Mark
  my words.") and the answer menu opens. The thread lives again. Ends
  deflected only because the probe deflects a second time — the question was
  there to answer.
- **1146-d7, David (curious):** same shape, clean re-pose ("What's something
  from your old life that's actually useful here?"). David's plan for
  tomorrow: "one good meal, one good conversation, one night of real sleep."
  A person, not a menu.
- **1148-d6, unnamed woman in her 60s (curious):** re-pose works; winddown
  lands a real line ("The fire's the real leader here. We just orbit it and
  pretend we're in charge.").
- **1142-d13, Jesse (ask_favor):** Jesse wants pantry-run hands, the player
  commits, Jesse gives a concrete meet ("The creek bend, past the treeline,
  morning, early. Bring your pack and your knife."). Then the unsettled
  ambush against Jesse surfaces ("Nobody's settled the ambush against me
  yet.") with real investigation choices. Promise kept on the books, case
  still open — resolve and plant in one sitting.
- **1150-d7, Hassan (ask_favor):** Hassan asks for a forage; the player
  commits; Hassan refuses the promise honestly because he's out on the road.
  Resolution "stated", not a false promise.

**Bar verdict:** holds across all five. NPCs want something, options engage
or deflect, endings resolve, plant, or owe. No fabricated shared history, no
filler loops. The one repeated line the verbatim counter flags is the
deliberate re-pose itself (see metric review).

## Q4 — telemetry

`node scripts/telemetry-check.js` vs `telemetry-baselines/landing-split.json`:
**quiet** (10 files, 5 metrics, no large deviations). r137 totals
81/10/234/8/0 vs baseline 81/9/217/15/0 (systemDay / villagerDeaths /
monsterKills / fires / starvAutopsies). No LOUD line; baseline NOT rolled.

## Reachable / fun / winnable

- **Reachable:** yes. System contact day 8–9 on all ten seeds; the first
  fortnight's content (questions, favors, outings, cases, naming) all fires.
- **Fun:** yes, and better than r136 — the resume fix removes a real
  dead-end in conversation, the single most-touched surface in the leg.
  Conversations now reward coming back to a question.
- **Winnable:** the leg is the on-ramp, not the win; villages survive,
  skills move, favors keep. The chain past the landing is unchanged by
  this run.

## Gate

`node scripts/check.js --quick` (worktree, `--cacheDirectory=/tmp/jest-cache-playtest`):
**333 passed, 7 failed** in 616s (second run with full log saved as
`journey-landing-r137-gate.log`; first run 333/7 in 592s — same seven).
All 7 verified **pre-existing on pristine HEAD `abc52dce1`** by stash
comparison (fix set aside, each failing test re-run — identical failures):

- `test-measurement-proof-update.js` + `test-measurement-workflow.js` —
  measurement-proof staleness pair ("retained neutrality proof covers the
  current Game/controller/harness inputs"). Standing; the proofs are stale
  against the r215 base, not this change. Refresh owed via
  `scripts/balance-proof-update.js` (maintenance, not this run).
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3 fails:
  retained browser input vs current source; boot inputs covered; current
  phone evidence required — index.html). Standing; refresh owed via
  `scripts/phone-frame-proof-update.js`.
- `test-living-garden-deed-attainment.js` +
  `test-one-person-army-deed-attainment.js` — both hit the 120s check.js cap
  on both gate runs (load timeouts under 4-parallel jest; deed-attainment
  sims, no conversation path in the failure).
- `test-ladder-bundle-20261108.js` — control "200 monster turns WITHOUT
  delivery fire the ambient raid — fires 0". Pre-existing on pristine.
- `test-person-trust-20261108.js` — HAUL:3 vs 0 (byte-identical panel on
  pristine; baseline re-pin owed — see metric review).

**0 attributable to this run's change.** Proof tests re-run on the restored
tree: re-pose 21/21, r215 seed-resume 17/17. Standalone (not in the gate
list): `test-convo-engine-trust.js` 6 pass / 1 fail on the verbatim
closeLine — pre-existing on pristine, carried as an observation.

## Regression adjudication

- `test-convo-engine-trust.js`: 6 pass, 1 fail — "zero verbatim NPC repeats
  across both conversations — 'Good talk. I feel like I know you a little
  better now.'" (curious closeLine, single-line pool, spoken in two
  sittings). **Pre-existing on pristine HEAD `abc52dce1`** (verified by
  stash comparison — identical with/without the fix). Carried as an
  observation; out of prereg scope.
- `test-person-trust-20261108.js`: 18 pass, 1 fail — "HAUL:3 vs 0". Panel
  moved on the r215 base vs r136 (maxTrust 75→70, entries 54→52,
  trustedOpen 5→3, WATER 215→204, EAT 62→53, VISIT 11→15, HAUL 0→3).
  **Pre-existing on pristine HEAD** (byte-identical with/without the fix).
  Baseline re-pin owed — see metric review. Do NOT re-pin mid-run.
- Green: r215 seed-resume test 17/17; HEED-V analyzer test 6/6; bar-shape
  test 18/18; `test-landing-r117-zerodmg-v2.js` PASS (fixtures + 3
  historical corpora); zero-DMG invariant PASS on the r137 corpus
  (12 fights, 0 violations).

## Metric review

- **HEED 1→0:** the r136 HEED (Dauletkhan 1150-d6 sitting) no longer flags on
  r137. Panel movement, not a fix — no code in this run touches HEED. The
  bar (0) is met; nothing to revise.
- **Presshop farUnreached 1→0:** the carried six-panel shape (farUnreached
  exactly 1) broke. Attempts fell 88→54 while togetherStopped stayed 11.
  The metric's premise (a far press always fails to reach once per panel)
  may be a small-sample artifact rather than a law. Propose for the next
  run: drop farUnreached from the binding set to a reported number, or
  re-derive the expected band from a wider window.
- **Person-trust baseline re-pin (carried):** HAUL 0→3 on the r215 base is a
  base movement, not this run's change. The instrument owner should re-pin
  the person-trust baseline on the r215 base before the next landing run
  treats it as a regression.
- **Verbatim-repeat counter vs deliberate re-poses:** the driver's MET
  `verbatimRepeats=4` on r137 are the four re-posed questions whose text
  exactly equals the opener (1146, 1147, 1148, 1150). The re-pose IS a
  repeat by design — the NPC is asking again because the player came back.
  The counter should exempt same-qid re-hangs, or the run note should
  record them as expected. Propose the exemption for the next run; no bar
  depends on it today.
- **Hungry-at-horizon 4/10, unchanged:** r136 also had 4 hungry seeds
  (1145, 1147, 1148, 1151 vs r137's 1145, 1146, 1147, 1151). The r104
  "PATTERN" label is a standing watch, not a regression. R66 gate still
  NOT-HUNGRY (0 slide seeds).
- **Scholar deaths 0→2:** no bar binds scholar deaths, and succession
  latency was 0 and 1 day. Watch it on the next panel; if it recurs, it
  may deserve a metric.

## Carried (unchanged)

- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
- Hunt assignments still never resolve in the landing window (H1-ESTABLISHED).
- NV sittings share one closing template (palms-pressed goodbye) — middles
  are their own; observation only.
- Analyzer vs transcript streak count (r134 carry — analyzer maxSameStreak=1
  on nv sittings vs transcript summary maxStreak=4–5; no bar depends on it).

## Landing

Fix + proof test + run note, committed in the worktree, merged ff-only to
master. **Merged locally, pending ship.** No bump, no push, no live check
(ship loop owns those).
