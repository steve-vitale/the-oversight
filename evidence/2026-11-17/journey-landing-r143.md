# Journey landing r143 — run note (2026-11-17)

Lane A leg 0 LANDING. Run `journey-landing-20261117T2044Z`, scheduled
Tue 2026-11-17 14:45 CST. Base master `1aba45367`
(sim-winnability-round-1820 closeout). Seeds 1212–1221 (fresh band —
zero hits in `evidence/` for the band), 28d, r143 driver (r142 driver
verbatim except header/seeds/OUTDIR). BEFORE corpus
`landing-r143-after`; AFTER-FIX corpus `landing-r143-after-fix`
(matched band, same seeds, fix in place). Prereg:
`journey-landing-r143-prereg.md` (amended mid-run — see F1).

## Q1 — regression watch on the post-r142 master: ONE BAR MISS, FIXED IN-RUN

The run's question: does the post-r142 master (succession r231
mourning lines; crisis r230 quote-aware pagination; social-life r234
DRY2 fix; sim-nondeathplan-b win-plan-dies-on-any-removal) hold the
landing bars on a fresh band? Metric revisions adopted from r142:
pocket bar binds `pocketFights = 0` (stuckTurns a watch); M-PR1 scored
only over established ask_favor sittings, dlg:help counting as the
stage-0 offer.

### Binding bars (BEFORE → AFTER-FIX)

| Bar | BEFORE | AFTER-FIX | Verdict |
|---|---|---|---|
| M1 10/10 alive d28 | 10/10 (pop 11–12) | 10/10 | PASS |
| M2 System contact 10/10 by d9 | 10/10 (all d8) | 10/10 | PASS |
| M3 fight-log 0 unknown/mixed | 0 unknown (14 fights) | 0 unknown (15 fights) | PASS |
| zero-DMG invariant | PASS (1 zero-DMG, B-scholar-stood-through) | PASS (2 zero-DMG, both B-shape) | PASS |
| practice movedCells ≥50, seedsWithMove 10/10 | 97 cells, 10/10, skill0→pos 63 | 96 cells, 10/10, skill0→pos 63 | PASS |
| pocket 0 pocket fights / stuckTurns watch | 0 / 0 | 0 / 0 | PASS |
| D1 garbled labels | 0 | 0 | PASS |
| HEED-V verbatim filler loop | 0 | 0 | PASS |
| M-PR1 revised never-offered ≤15% of established | 0/13 = 0% (raw 1/15) | 0/13 = 0% | PASS |
| personal/small bridge 0 repeats | 0 / 0 (personal 30, small 7) | 0 / 0 (personal 31, small 7) | PASS |
| presshop farUnreached | 1 (reported only; H-ROUTE) | 1 (same) | — |
| R66 starvation deaths 0, starvingWarnings 0 | 0 / 0 | 0 / 0 | PASS |
| amnesia 0, Miriam "That's settled" 0, fellBack 0 | 0 / 0 / 0 | 0 / 0 / 0 | PASS |
| nodloop LOOP=0 | 0 (105 sittings) | 0 (105 sittings) | PASS |
| verbatimRepeats 0 | **18** (exempted 7) | **0** (exempted 7) | **MISS → FIXED** |
| **scholar deaths ≤2** | 0 | 0 | PASS |
| **silentTurns 0** | 0 | 0 | PASS |
| fleeStuckTurns / dodgeStuckTurns / closeStuckTurns | 2 / 0 / 0 | 1 / 0 / 0 | watch |
| contests fired=ended, orphanEnds 0 | 17 / 17 / 0 | 17 / 17 / 0 | PASS |
| hungry-at-horizon | 5/10 | 4/10 | PATTERN (watch) |
| outingchain kept vs broken | 4 vs 3 (open 21) | 4 vs 3 (open 20) | — |
| win plans at d14 / d28 | 0 / 2 seeds (3 holders) | 0 / 2 seeds (3 holders) | — |

### FINDING F1 — the same line, 18 times: an already-confessed doubt never retires (seed 1213 d11, Mia)

The panel's one bar miss is a single sitting. Mia volunteers a secret
("I'm practicing what I would say if I ever saw my family again"), the
player declines a betrayal invite and sits with her, then the driver
presses `[confront:d_lzjmip2]` ("You said something odd the other day.
Let's talk about it."). Four distinct deflection lines follow ("We went
over this…" / "I told you the truth…" / "That again?…" / "You're really
going to make me say it again?…"), then the identical line "That one's
told already. Ask me something else." repeats verbatim on turns 12–29
(18×). The sitting runs the full 30-turn driver cap and ends stage 3,
resolution unestablished.

The 30-turn length is probe-constructed (the R55 wind-down probe's
NO-LEAVE substitution re-offered the confront on every turn), but the
underlying game facts are real: the option stays offered after the
doubt is settled, and the fallback is a single fixed line.

Root cause, verified in code and by repro: the volunteered secret sets
`confessedThisSitting = true` on the convo object (r172
one-confession-per-sitting guard). Every confront press then lands on
the `confessedThisSitting` deflect branch in `confrontDoubt`
(`src/js/truth.js`, ~line 1650) and identically in `confrontTheft`
(~line 1810): it serves a `staleConfessed` pool line (4 variants) or
the hardcoded fallback when the pool is ledger-blocked, pushes
evidence, and does NOT call `resolveDoubt` — "the doubt stays open and
the evidence grows" (the code's own comment). The doubt's lie is a
different, still-live lie, so the 1515 stale path (which does resolve)
never fires. The menu keeps offering the same `confront:<id>` forever.

Why the spent-choices ledger did not save it: `convoSpendChoice` is
honored by `finalizeMenu` inside `buildMenu`, but truth.js wraps
`Game.convoChoices` and appends the confront item AFTER `buildMenu`
returns — the same bypass class as the betrayal extras fixed in crisis
r85 (comment at `src/js/betrayal.js:4518`). The line itself is not new:
"That one's told already…" lives in `src/js/truth.js` at lines 1516,
1661, 1812, introduced by Lane B commit `70f6035ea` (r187 succession),
which predates r142's base — the shape existed on r142 but did not fire
on that band.

**Fix** (`src/js/truth.js`, 40 insertions / 3 deletions, this run):
1. `confrontDoubt` and `confrontTheft`: a new
   `alreadyConfessedDeflect` flag, set in each `confessedThisSitting`
   deflect branch and returned in the shared tail.
2. The `convoTurn` wrapper: when the result carries the flag, spend
   the choice via `convoSpendChoice(vid, choiceId)` before returning
   the menu — so the returned menu already excludes it.
3. The `convoChoices` wrapper: filter the doubts list with
   `!spent['confront:' + d.id]` (spent read from `c.spent`), following
   the r85 betrayal precedent — otherwise the appended item bypasses
   `finalizeMenu`'s filter.

Design call (documented in the code comments): normal deflects (live
lie, press again to mount evidence — the detective loop) are
deliberately NOT spent; only the already-confessed branch, where no
re-press this sitting can ever pay off. The doubt stays open (no
`resolveDoubt`), so the option returns in a new sitting (spent is
per-sitting; `startConvo` resets).

**Proof** (`scripts/test-journey-landing-r143-confront-stale-20261117.js`,
16/16 green; red on unfixed code — the menu still listed the confront
id). Three cases: (1) doubt path — live lie + slip doubt, flag set;
stale line, doubt open, menu spent, new sitting re-offers; (2) theft
path — same shape via `confrontTheft`; (3) control — live lie, flag
clear, one deflect forced; doubt open AND menu still offers the option
(detective loop intact).

**Matched-band before/after (§15):** same seeds 1212–1221, 28d, fix in
place, corpus `landing-r143-after-fix`. verbatimRepeats 18→0, exempted
7→7, everything else holds (table above). The Mia sitting itself, read
live in the fix corpus: 23 presses of the same confront id → 4
presses of four different doubt ids, each serving a distinct
deflection line and retiring; 30 turns → 14; resolution unestablished
→ engaged; the fallback line 0 occurrences. The fix adds no
`Math.random` calls, so trajectories match except where an
already-confessed press diverges (one extra fight, 15 vs 14; one
fewer favor asked, 27 vs 28; hungry-at-horizon 5→4 — all within
divergence noise, no bar moves).

## Village assessment (plain words)

Ten villages, all ten alive at day 28 with 11–12 people each. Four
villagers died, all in ambushes out in the wild (Nathan d7, Devon d11,
Ella d14, one unnamed d17) — nobody starved, nobody died at home. The
scholar never died. The System made contact on day 8 in every village.

The first fortnight is a settling-in: people learn each other's names,
the pantry fills in big foraging hauls (one village banked ~25,000 kcal
in a single day late in the run), and the first fights are small —
animals and early monsters, 14 fights across the panel before the fix,
15 after. Villagers practice: every village's people moved their skills
forward (96–97 cells of competence moved across the panel, all ten
seeds). Nobody hunts yet as a formal assignment — 215 kills happened,
but all as opportunistic fights, never a hunt task resolving (H1
established again; same as r142).

By day 28 two villages are already making plans — three people holding
win-plans, two party fights fought, three stage advances — which is
early for landing but real: the villages are not just surviving, they
are starting to aim. Favors mostly stay open (20–21 of 27–28), four
kept against three broken; the broken ones are all pantry-run promises
(Aria, Zoe, Ethan). The pantry is the standing worry: half the villages
are hungry at the horizon (5/10 before, 4/10 after) — same pattern as
every recent landing run, a lever-work candidate, not a regression.

Contests fire and end cleanly (17 fired, 17 ended, none left open).
The villages feel alive: people warn each other about the wild, ask
for help with the pantry run, grieve (Ingrid, two days after Nathan's
death, sits heavy and asks only to be talked to for a while).

## People check (5 full transcripts read)

- **Mia, 1213-d11 (F1).** Honest for eight turns — a volunteered
  secret, a declined invitation, real deflection lines — then the loop.
  After the fix the same sitting reads like a person: four different
  doubts pressed once each, each answered once, the conversation ending
  naturally in 14 turns.
- **Naran, 1212-d8 (warn_you).** PASS. Heeds 1–3 are the acknowledgement
  lines, the fourth deepens ("I've watched people walk out sure and
  not walk back. Don't be the next one I have to stop waiting for."),
  stage 3, resolution `heeded`. The heed fix holds.
- **Katarina, 1212-d9 (ask_favor, promised).** PASS. The want is stated
  plainly ("About the pantry run — still need hands. Are you in?"), the
  player commits, she names the plan ("The north treeline by the fallen
  oak, at sunup. Bring the big pack if you have it."), resolution
  promised — and the outing actually happened (1,240 kcal delivered).
- **Vasyl, 1212-d6 (resume-take).** PASS. "We never finished — your
  useful old-life skills." re-poses the question honestly; the player
  deflects twice and the question dies where it stood ("Right." They
  look away). A soldier who was infantry, now "whatever today needs."
- **Ingrid, 1214-d9 (seek_comfort).** PASS, best of the panel. "They
  shake their head, then nod — both true at once. 'Talk to me a bit.
  That helps more than anything.'" Two days after Nathan's death. The
  mourning topic ("How are you holding up? About… them.") was offered
  in the menu but the driver did not pick it — the r231 mourning lines
  stay unmeasured live.

## M-PR1 adjudication (revised denominator)

Analyzer: sittings=15 offered=9 picked=9 promised=7 statedAfterPick=2
neverOffered=1 settled=5 — identical on both corpora. The one
never-offered sitting is 1213-d6 (Jose): a 3-turn topic-probe sitting
where the driver paged the menu twice and left before the want engaged
— the favor was never stated, no commit was ever owed. The second
unestablished sitting, 1219-d7 (Eamonn), is the settled-favor shape:
the player pressed `[dlg:help]`, the NPC answered "It's already
handled. Thank you for asking." Both read `want final: stage=3
resolution=unestablished`, but the sitting annotations show stage 0
throughout — the final stage counts tail beats (beast-naming), not the
favor. Revised denominator (established sittings only): 0/13 = 0%.
PASS, comfortably under 15%. statedAfterPick=2 (1213-d8, 1221-d8) are
both the honest away-guard refusal (committed, villager states they
cannot meet while away) — watch threshold ≥6 not triggered.

## Watches

- **Mourning (r231): UNMEASURED.** Zero mourning lines spoken in
  either corpus; grief topic dwell=0, servings=0. The mourning menu
  option did surface (Ingrid 1214-d9, two days after Nathan's death)
  but was never picked. The r231 fix's live behavior is neither
  confirmed nor contradicted.
- **r231 deferred-ask guard: UNMEASURED, closest shape yet.** 1219-d7
  pressed `[dlg:help]` on a stage-0 ask_favor want and got the settled
  line ("It's already handled."). No favor activity for Eamonn appears
  anywhere in the run log — he never asked, was never promised, never
  delivered — so no live need waited behind the want and the settled
  answer reads honest. The guard's trigger case (live need + settled
  short-circuit) did not fire. Needs a targeted probe, not panel luck.
- **Dry lines (r234/r230):** 0 empty THEM lines across the BEFORE
  corpus (grep); R68 PARTY dry=0; WIND-DOWN MORE empty=0. Clean.
- **farUnreached=1 (reported only):** seed 1221, Ethan's pantry-run
  favor, far node (7,0) unreachable by evening — H-ROUTE class (route
  planning, not hop mechanics). Same on both corpora.
- **sim-nondeathplan-b watch:** 0 deathCleanups / 0 removalCleanups in
  the win-plan totals; no plan oddity after deaths or departures; no
  store ignition by a death or a leave.
- **Succession:** VACUOUS (zero holder deaths). Grief watch holds (all
  registered), griefMiss 0/4.
- **R68 PARTY** offered 8, spoken 8, dry 0, accepted 5 — PARTY-GO.
  **R67 CASE** 7/7 match — LABELING-GO. R69 ARMOR GO; R70 OUTING GO;
  R71 COMPLETION-GO; R72 CHAIN-CLASSIFIED; R73 NARROW=7,
  keptInsideNarrow=4. R88 EAT-ON-ARRIVAL GO; doorstep UNTESTED. WD
  PROBE GATE-A/B GO. WIND-DOWN MORE picks 9, empty 0, GO.

## Q3 — telemetry

`telemetry-check.js` vs `landing-split.json` (r136-pinned baseline),
metrics fights/villagerDeaths/scholarDeaths/feasts/contestsFired:
**quiet on both corpora** (10 files, 5 metrics, no large deviations).
No baseline roll (r142 also quiet).

## Q4 — gate

## Q4 — gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
(detached nohup, log `journey-landing-r143-gate2.log`): **334 passed, 6
failed in 798s — 0 attributable. GATE GO.** A first foreground attempt
was killed by SIGTERM at ~11 min with no output file (runtime cap on
backgrounded exec, not a test failure); the detached re-run completed.

The 6 failures, each adjudicated against pristine `truth.js` (stashed,
re-run, restored — fix intact, syntax OK):
- test-measurement-proof-update.js — "Proof source inputs are not
  current"; fails identically on pristine truth.js. Pre-existing.
- test-measurement-workflow.js — "retained neutrality proof covers the
  current Game/controller/harness inputs"; 8 passed / 1 failed on
  pristine too. Pre-existing.
- test-phone-frame-proof.js — 3 fails (retained browser inputs stale;
  receipt stale/missing: index.html); identical on pristine truth.js.
  Pre-existing.
- test-ladder-bundle-20261108.js — control "200 monster turns WITHOUT
  delivery fire the ambient raid — fires 0"; 78 passed / 1 failed on
  pristine too. Pre-existing.
- test-living-garden-deed-attainment.js and
  test-one-person-army-deed-attainment.js — 120s TIMEOUT each under
  gate load; r142 standing timeouts (both passed standalone 8/8 and
  7/7). The F1 fix is dialogue-only (no RNG calls, no compute change);
  not re-run standalone, adjudicated as standing load timeouts, not
  attributable.

All six match r142's standing failures exactly.

## Metric review

1. **M-PR1 denominator wording (new):** the "want final" stage counts
   tail beats, so stage alone cannot tell "established" — both
   unestablished sittings read stage 3. Propose: exclude
   `resolution=unestablished` sittings from the denominator regardless
   of final stage, since "unestablished" is the engine's own verdict
   that the want never engaged. Does not change this run's verdict
   (0/13 either way; raw 1/15 = 6.7% also passes).
2. **r231 guard needs a targeted probe (new):** panel luck has now
   failed twice to fire the trigger case. A proof test (stage-0 want
   with a known live favor, press dlg:help, read the line) is the way
   to measure it, not another 10-seed panel.
3. **verbatimRepeats bar (r143 F1):** the bar held — it caught a real
   loop the panel would otherwise have shipped. No revision; the fix
   is the response.
4. **Carried from r142:** R66 starvation-margin question stays a
   balance/policy arm question (meal share vs daily burn), not this
   run; matched-band A/B question for fight counts (21/12/17/7/16)
   still owed; teach the shared chooser to take nv:accept (r197 lane
   decision owed); Olivia bridge repeat + goal-pool repeat fix owed in
   the bridge-memory build arm, not this run; planignite fix is NOT
   going live (sim-planignconfirm-b NO-GO); plan-store wake-up question
   stays open for a different lever.

## Carried items

- r142 items above, unchanged.
- F1 follow-up: none — fixed, proof-tested, matched-band verified.
- Mourning lines (r231) and the deferred-ask guard: still unmeasured
  live; targeted probes owed, not more panel luck.

## Run mechanics

- Lock `playtest-loop.lock` (run_id
  `laneA-2026-11-17T20:44:00Z`), deleted at closeout. Rotation file
  `journey-rotation-a.txt` 0→1 at closeout.
- Worktree `journey-landing` (branch `journey-landing`, base
  `1aba45367`), registered via `worktree-register.sh`; heartbeat loop
  every 10 min for the whole run.
- **Master moved mid-run:** main HEAD is now `db8a289bf`
  (sim-fightallycap-b landed) vs worktree base `1aba45367`. Per body
  step 8 the branch is rebased onto the new master and the proof test
  re-run before merging.
- Files: `src/js/truth.js` (fix), `scripts/journey-landing-r143-20261117.js`
  (driver), `scripts/test-journey-landing-r143-confront-stale-20261117.js`
  (proof test), `evidence/2026-11-17/journey-landing-r143-prereg.md`
  (amended), `evidence/2026-11-17/journey-landing-r143.md` (this note),
  `evidence/2026-11-17/journey-landing-r143-{pilot,full,analyzers}.log`,
  `evidence/2026-11-17/journey-landing-r143-{full-fix,analyzers-fix}.log`,
  `evidence/2026-11-17/journey-landing-r143-gate2.log`. Corpora under
  goal hidden_files `evidence/2026-11-17/landing-r143-after/` and
  `landing-r143-after-fix/`.
- Scratch repro `scripts/repro-confront-stale-r143.js` deleted before
  commit (superseded by the proof test).
- Commit message carries `[needs-eyes]`: the F1 fix is dialogue /
  conversation feel — Steve should be able to play it.
