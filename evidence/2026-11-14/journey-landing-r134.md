# journey-landing r134 — RUN NOTE (Lane A, leg 0 LANDING, verification run)

**Run id:** loop-a-20261114T164500Z (scheduled Sat 2026-11-14 16:45 CST, started 22:43Z).
**Base:** local master `007c61738`. Prereg:
`evidence/2026-11-14/journey-landing-r134-prereg.md`.
**Worktree** `~/workspace/worktrees/journey-landing-r134` (branch
`journey-landing-r134`).
**Recovery at start:** no lock existed. Registry showed `journey-landing` ACTIVE
with heartbeat 21:56:09Z (~47 min stale) — the r133 run, dead in registration.
Retired it (`worktree-release.sh journey-landing abandoned`); the reaper removed
the worktree dir with the r129 branch KEPT at 6b99d6a90. Re-registered under the
fresh slug `journey-landing-r134` from master (~16 min under box load — waited it
out; r133 died at this step). Heartbeat landed 23:06:35Z, hbloop every 10 min.
**Rotation:** read 0, wrote 0→1 at run start (read back). Next leg: establishment.
**src/js delta since the r132 fix:** Reunion arena balance only (arena-only
clone); no landing-window code changed.

## Q1 (PRIMARY) — NOD-LOOP FIX REGRESSION: HOLDS

Panel seeds 1142–1151 (r121 carried band), DAYS=28, driver
`scripts/journey-landing-r134-20261114.js` (r132 driver verbatim except
OUTDIR/header).
- **Repeat-nod probe (pilot, 3 seeds, NV_REPEAT_NOD=1):** LOOP=0 — 3 nv sittings,
  3 picks each, maxSameStreak=2, winddown surfaced at pick 2, all closed via
  leave. Corpus `landing-r134-pilot-nodloop/`.
- **Standing-picker panel (10 seeds):** 8 nv sittings, 5–7 picks each,
  maxSameStreak=1, winddown surfaced everywhere, all closed via leave. LOOP=0.
  Corpus `landing-r134-after/`.
- The fix's shape is visible in the words, not just the counters: Elif's second
  nod gets "They nod, holding your gaze a beat longer", Fabrice's "Fuck you." —
  they grin, proud of the one English they know — then the winddown ("A final
  shared look — you both feel the talk running its course") and a real goodbye.
  A 3-exchange nonverbal sitting that feels real, per CONVERSATIONS.md.

## Q2 / Q3 (carried) — BYTE-IDENTICAL TO r131/r132

- **Practice:** movedCells d1→d28=98, seedsWithMove 10/10, skill0→pos 47,
  practiceReps 2814. Hunt reps **0** (16th panel running — H1-ESTABLISHED
  carries). Kills total 229.
- **M1 ALIVE-D14:** 10/10 alive at d28. **M2 SYSTEM CONTACT:** 10/10 by d8.
  **M3 FIGHT-LOG:** 7 fights, byTrigger {pending-face: 1} — no unknown/mixed.
  **Zero-DMG invariant:** PASS (7 fights, 0 violations).
- **HEED regression:** WARNED-BUT-UNRESOLVED **0**; D3 0; D2 0. The analyzer's
  "HEED filler loop: 1" is the carried legacy watch item (same sitting shape as
  r131/r132 — Dauletkhan's warn_you, 1150 d6, 16 turns, heed offered 4×, never
  taken by the driver's topic probe; the NPC *did* engage when the driver took
  the resume — see People check).
- **Pocket watch:** 0 pocket fights, 0 stuck turns. **Move-refusals:** byReason
  {}, stuckFights 0. **Personal bridge:** 0 repeats. **Small bridge:** 0
  repeats. **Presshop:** farUnreached=1 — identical to the previous panel
  (r131/r132: 1). **Outingchain:** CHAIN-COMPLETES-FAR (kept 6, farHaul 6).
- **D1 watch (document only):** garbled label "We never finished —
  themselves." rendered 7× across 6 transcripts (pilot 1×). Fix still only on
  branch `journey-landing` (59ad7c479), awaiting Steve's call. NOT fixed here.
- **1130-d6 amnesia shape:** 0. **Miriam line:** 0 "That's settled".
  **R66 HUNGRY:** starvation deaths 0, starvingWarnings 0.
- **Mantle latency:** vacuous (no mantle pass fired).

## Q4 — TELEMETRY: QUIET

`telemetry-check.js` on the r134 panel vs `landing-split.json` (re-seeded r131):
quiet — 10 files, 4 metrics, no large deviations. Baseline NOT rolled (panel is
byte-identical to r131/r132 on the key metrics; no new information to roll).

## People check — PASS (5 full transcripts read)

- **Elif (1143 d2, nv):** Turkish, no shared words; nods thin into a shared
  look and a palms-pressed goodbye. The NPC wants nothing but company, and the
  sitting gives it and ends it. PASS.
- **Fabrice (1150 d2, nv):** same fix shape, own voice ("Hé... tu parles
  français ? Non ? ...merde."). Closing: "This was good. They mean it." PASS.
- **Bill (1143 d6, ask_favor):** wants a pantry-run partner; the player
  commits, Bill gives a concrete plan ("The creek bend, past the treeline, at
  sunup. Two packs between us."). Favor promised for tomorrow. The long middle
  is the driver's menu paging, but Bill answers every dodge with a different
  nudge, and the wind-down yields a real tell: "I sleep with one ear
  uncovered, always when the fire gets loud." PASS.
- **Dauletkhan (1150 d6, warn_you):** the crossing guard warns about movement
  past the treeline; the resume ("We never finished — that warning") delivers
  the warning itself. Ends with his past falling away: "The uniform, the
  title, all of it — gone. What's left is just me." PASS.
- **gen_ltuzmvz (1144 d5, curious/dreams):** the player deflects the dream
  question at turn 1; the NPC notices ("Something shutters, just slightly")
  and the want ends deflected — honest consequence. WATCH ITEM (not a fix):
  the want-thread resume here only acknowledges ("About what you dream about
  — yeah, we never did get back to that") instead of re-asking, unlike
  Dauletkhan's warning resume, which delivers. One sample each; needs a second
  sample on a later panel before any fix. The D1 garbled label also renders in
  this sitting (counted above).

## Village assessment — plain words

All ten villages come through the first month whole: 12 of 12 alive everywhere,
nobody dead, nobody starving, no grief carried. The System makes contact on day
8 in every village. People are talking: 104 sittings across the panel, wants
mostly curious (75) with favors asked (19) and warnings given (2); six
pantry-run favors were kept and six far hauls came home. The scholars are still
strangers (trust 0–30), but a few villagers in each village have warmed all the
way to 90 — the regulars at the fire. Nobody can fight yet in any serious way
(7 fights in 28 days, 229 kills is the panel's monster tally across all
villages, and no villager has hunted on purpose — the hunt assignment still
never resolves, 16 panels running). What the villages are missing is the same
as ever: a reason to go looking for trouble instead of waiting for it, and a
second pair of hands that knows what it's doing. The landing itself — first
fortnight, first System contact, survival basics — is reachable, makes sense,
and holds together.

## Verdicts

- **Reachable:** YES — System contact d8 on 10/10, first contests firing (1–3
  per village), favors offered and kept.
- **Fun:** YES — conversations carry real wants and land real lines; the
  nonverbal sittings now close instead of looping.
- **Winnable:** YES for this leg (the leg is the first month, and all ten
  villages live through it with food and company). The longer climb is still
  the scale leg's question, not this one's.

## Gate

`node scripts/check.js --quick` in the worktree: **332 passed, 8 failed in
1055s** (log: `evidence/2026-11-14/journey-landing-r134-gate.log`).
Adjudication — 0 attributable:
- `test-measurement-proof-update.js` — "Proof source inputs are not current":
  measurement-proof staleness pair (standing set; the Reunion arena src/js
  change staled it).
- `test-measurement-workflow.js` — "retained neutrality proof covers the
  current Game/controller/harness inputs": the pair's other half (standing set).
- `test-phone-frame-proof.js` — phone-frame receipt staleness (standing set;
  refresh needs a browser run, owed separately).
- `test-living-garden-deed-attainment.js` — 120s timeout in the parallel run;
  **PASS standalone** (exit 0, log `...-gate-standalone-....log`) — load artifact.
- `test-one-person-army-deed-attainment.js` — 120s timeout in the parallel run;
  **PASS standalone** (exit 0) — load artifact.
- `test-occupation-panels.js` — 120s timeout in the parallel run; **PASS
  standalone** (exit 0, 25 passed) — load artifact.
- `test-trust-observer-neutrality.js` — 120s timeout in the parallel run;
  **PASS standalone** (exit 0, 6 passed) — load artifact.
- `test-synergy-stall.js` — 120s timeout in the parallel run; **PASS
  standalone** (exit 0) — load artifact.

All five timeouts are the parallel-run load shape (box heavily loaded by
sibling balance panels); all five pass alone. Gate verdict: **GO**.

## Landing

- (To fill at closeout: rebase/merge, release, lock deletion.)

## Metric review

- Analyzer vs transcript streak count: the nodloop analyzer reports
  maxSameStreak=2 on the pilot sittings while the transcript summary records
  maxStreak=3 (the analyzer excludes the winddown turn's pick). Both agree
  LOOP=false and winddown surfaced; no bar depends on the difference, but the
  next run should note which count it gates on if it ever gates on streaks.
- Presshop bar "identical to the previous panel" keeps carrying; the shape
  (farUnreached=1) has now repeated r131→r132→r134 unchanged.
- No metric proved wrong this run; no revision proposed.

## Carried (unchanged)

- r129 terrain-pocket + D1 garbled-label fixes still live only on branch
  `journey-landing` (59ad7c479 / 6b99d6a90), awaiting Steve's call — NOT
  cherry-picked here.
- r129 fixed-side probe detail (which errand Chantal picks on day 28 on fixed
  code) still owed; `~/workspace/scratch-fixed/` still stale.
- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
- WATCH: want-thread resume acknowledges without re-asking on the curious/dream
  thread (1144 d5) while delivering on warn_you (1150 d6) — needs a second
  sample before any fix.
