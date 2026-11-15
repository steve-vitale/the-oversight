# journey-landing r135 — RUN NOTE (Lane A, leg 0 LANDING)

**Run id:** playtest-loop-20261115T051930Z (scheduled Sat 2026-11-14 22:45 CST).
**Base:** local master `542c6ecc2` at registration; r129 branch rebased onto
`783487438` (journey-crisis r208) before its landing; r135 branch rebased
onto post-landing master (`b9b226430`, incl. sim-funeral-mend-b).
**Rotation:** read 0 → wrote 0→1 at run start (read back: 1). Next leg:
establishment.
**Worktree:** `~/workspace/worktrees/journey-landing-r135` (branch
`journey-landing-r135`). The canonical `journey-landing` slug was blocked by
the held r129 branch (registry tree-removed-branch-kept); the stale entry was
released as `abandoned` (branch kept, r134 precedent) and this run registered
under the fresh slug. Heartbeat landed at registration; hbloop every 10 min.
**VM replacement:** the host VM was replaced at 06:00Z mid-run — the first
gate run (244/340 scripts, 5 F) and the first heartbeat loop died with it.
Both were restarted after the replacement; the partial gate log is preserved
as `journey-landing-r135-gate-vm-killed.log`. Nothing was lost (all work is
in git or on persistent disk).
**Prereg:** `evidence/2026-11-14/journey-landing-r135-prereg.md`.

## Q1 (PRIMARY) — r129 FORAGE probe: BENIGN DIVERGENCE, RE-BASELINED, LANDED

**The owed detail, answered:** on fixed code, Chantal Mukendi picks **EAT on
day 28 (twice)** instead of the FORAGE she picks on master. The probe driver
(`scripts/probe-person-trust-forage-r135.js`, wraps `Game.objPick` with
day + villager + kind + target, plus a death capture) reproduces both sides
bit-identically to the r129 adoption record:
- Master: kinds {LEAVE:2, WATER:198, EAT:59, VISIT:11, FORAGE:2, SEEK:19},
  maxTrust 53, entries 46, trustedOpen 2, living 8, picks 291.
- Fixed (r129 fix applied): {LEAVE:2, WATER:215, EAT:62, VISIT:11,
  FORAGE:1, SEEK:19}, maxTrust 75, entries 54, trustedOpen 5, living 9,
  picks 310.
- Traces: `landing-r135-probe-{master,fixed}-trace.jsonl` (goal hidden_files).

**The mechanism (the lost errand, named):** Chantal's only two FORAGE picks
on master are d2 (target 4,5) and **d28 (target 4,3)**; on fixed code only
the d2 one survives. Her full pick history is byte-identical on both sides
through day 24, then diverges from day 25. The upstream cause is the day-22
wild fight: on master, Benoit Lambert and Pavel Dubinin die "in the wild" on
d22 and Minh Roth stops picking after d21; on fixed code nobody dies in that
fight (an extra hushwolf is killed d22 instead) — Benoit dies of dehydration
on d29, a different and later cause. The fix's stacked-spawn half (first
monster no longer spawns on the scholar's tile) is the only combat change,
and the extra hushwolf kill on fixed code points at it. Two extra survivors
shift the errand mix (WATER +17, EAT +3, picks +19) and the shared RNG
stream, so Chantal's hunger/lottery state on d28 has her eat instead of
forage.

**Verdict: benign divergence, not a foraging regression.** No forage site is
unreachable; Chantal forages fine on d2 on both sides; nobody is worse off on
fixed code (living 9 vs 8, maxTrust 75 vs 53, trustedOpen 5 vs 2). Per the
repo rule (AGENTS.md: a test that breaks because the design changed on
purpose is updated in the same commit, with the reason stated), the
person-trust baseline was re-pinned FORAGE 2→1 in the test with the mechanism
documented in its comment — a re-baseline, not a waiver or a loosened
assertion; the bar shape (±25%) is unchanged.

**Landing of r129 (branch `journey-landing`, rebased onto `783487438`):**
- Rebase: clean, no conflicts. New tip: fix (413252eb4) + drivers/note
  (31f00daf2) + re-baseline (7b3992e75).
- Proof tests on the rebased tip: person-trust PASS all 19 (FORAGE:1 vs
  baseline 1); pocket ALL GREEN; thread-label ALL GREEN.
- Gate: `node scripts/check.js --quick`, **335 passed, 5 failed in 705s**
  (log `evidence/2026-11-14/journey-landing-r135-gate.log`). Adjudication —
  0 attributable:
  - `test-measurement-proof-update.js` + `test-measurement-workflow.js` —
    "Proof source inputs are not current" / neutrality-proof staleness pair
    (standing set; the r129 src/js change staled it, owed to proof refresh).
  - `test-phone-frame-proof.js` — phone receipt staleness (standing set;
    refresh needs a browser run, owed separately).
  - `test-living-garden-deed-attainment.js` + `test-one-person-army-deed-
    attainment.js` — 120s timeouts in the parallel run; **PASS standalone**
    (exit 0, logs `...-gate-standalone-....log`) — load artifacts.
  - person-trust PASSES. Gate verdict: **GO**.
- Merge: ff-only into master, exit 0, new master `7b3992e75`; main tree
  clean. Branch `journey-landing` deleted by the reaper (merged); registry
  entry released as done-merged.
- The r129 terrain-pocket + D1 label fixes are now on master — the held
  branch is closed. The r132/r134 carried item is resolved.

## Q2 — Fresh landing panel (regression watch, post-fix master)

Driver `scripts/journey-landing-r135-20261114.js` (r134 driver verbatim
except OUTDIR/header), seeds 1142–1151, DAYS=28. Corpus
`landing-r135-after/` (124 files, 104 transcripts). Analyzers:
`evidence/2026-11-14/journey-landing-r135-analyzers.log`.

- **M1 ALIVE-D14:** 10/10 alive at d28 (over=no on all seeds). **M2 SYSTEM
  CONTACT:** 10/10 by d9 (d8 on nine, d9 on 1149). **M3 FIGHT-LOG:** 7
  fights, byTrigger {} — 0 unknown/mixed.
- **Zero-DMG invariant:** PASS (7 fights, 0 violations; r134 had 1).
  Scholar-turns: player-wait 1, player-move 4, player-barrier-exit 0,
  player-ability 0; no living 0-strike ≥3-move fight (B-shape 0).
- **Practice:** movedCells d1→d28=94 (r134: 98), seedsWithMove 10/10,
  skill0→pos 56 (r134: 47), practiceReps 2540. GO. Hunt reps **0**
  (17th panel running — H1-ESTABLISHED carries). Kills total 217.
- **Pocket watch:** 0 pocket fights, 0 stuck turns. **Move-refusals:**
  byReason {}, stuckFights 0.
- **D1 watch: 0 garbled-label renders** (r134: 7) — the fix is live in the
  panel. The menu now reads "We never finished — that warning." /
  "We never finished — the village." in the transcripts.
- **HEED:** WARNED-BUT-UNRESOLVED 0; D3 0; D2 0. The analyzer's "HEED
  filler loop: 1" is the carried legacy watch item (same sitting shape as
  r131/r132/r134 — Dauletkhan's warn_you, 1150 d6, 16 turns, heed offered
  4×, never taken by the driver's topic probe; the NPC *did* engage when
  the driver took the resume — see People check).
- **M-PR1:** max per-seed never-offered 1 (1144 d8 settled, 1146 d9,
  1148 d8 — one each). PASS by the r129 bar.
- **Personal bridge:** 0 repeats in a sitting (104 sittings, 16 servings).
  **Small bridge:** 0 repeats. **Presshop:** farUnreached=1 — identical to
  the previous panel (r131→r132→r134→r135 unchanged).
  **Outingchain:** CHAIN-COMPLETES-FAR (asked 24, kept 6, farHaul 5).
- **R66 HUNGRY:** starvation deaths 0, starvingWarnings 0.
- **1130-d6 amnesia shape:** 0 recurrences (transcript grep).
  **Miriam line:** 0 "That's settled". **Deflect-fallback:** 0 `fellBack`.
- **Mantle latency:** vacuous (no mantle pass fired).
- **Nodloop:** LOOP=0 — 8 nv sittings, winddown surfaced everywhere, all
  closed via leave.

## Q3 — People check (M5, sense-read, 5 full transcripts)

- **Dauletkhan (1150 d6, warn_you):** the warning lands via the resume
  ("I don't know what's moving out there, but something is. Keep your eyes
  up past the treeline."), the sitting wanders through real answers (3
  injured + the tension, named plainly), crossing-guard past ("Old wiring,
  new world"), fears ("Footsteps that stop"), and the wind-down delivers
  the ending: "The uniform, the title, all of it — gone. What's left is
  just me." The want ends engaged (stage 3). PASS — the HEED counter still
  flags it (heed offered 4×, never taken), but every brush-off is a
  different line; the loop is the driver's dodge, not NPC repetition.
- **Sanne (1144 d5, curious):** "Can we talk? Just... talk. Like people
  used to." The player deflects twice, asks one real question ("Sleep's
  the real currency now. I'm rich in dreams and broke in rest."), then
  leaves; she lets them go dryly ("Do try to stay alive. The paperwork
  otherwise is murder."). Want ends unestablished — honest consequence.
  PASS. The r134 WATCH (want-thread resume acknowledges without re-asking)
  gets **no second sample**: the resume was offered twice and the driver
  never took it. Carries, still one sample.
- **Elif (1143 d2, nv):** Turkish, no shared words; nods thin into a
  shared look and a palms-pressed goodbye ("This was good. They mean it.").
  4 exchanges, each distinct. PASS.
- **Fabrice (1150 d2, nv):** same fix shape, own voice ("Hé... tu parles
  français ? Non ? ...merde." / "Fuck you." — grinning, proud of the one
  English he knows). PASS. Observation (not a defect): both nv sittings
  close with the identical template lines (palms-pressed goodbye + "Come
  back anytime") — the closing is shared, the middles are their own.
- **Kupe (1143 d6, curious):** opens with a real question ("Did you
  sleep? I kept hearing things out past the treeline."); the player
  deflects at turn 0 and Kupe notices ("Okay." Something shutters, just
  slightly.). Every later brush-off is different; the tension thread
  delivers ("You feel that? The air before a storm."); the want ends
  deflected, honestly. PASS.

## Q4 — Telemetry

`telemetry-check.js` on the r135 panel vs `landing-split.json` (re-seeded
r131): **quiet** (10 files, 4 metrics, no large deviations). Baseline NOT
rolled (panel carries no new information vs r131/r132/r134).

## Village assessment — plain words

All ten villages come through the first month whole: nobody's village
scattered, 111 of 120 people still alive. Four died, all to monsters
(days 17, 23, 25, 26); a few others walked away from Haven rather than
dying. The System makes contact on day 8 in nearly every village (day 9
on one). People are talking: 104 sittings across the panel, wants mostly
curious (77) with favors asked (16) and warnings given (3); six
pantry-run favors were kept and six far hauls came home. The scholars are
still strangers (trust 10–42 in the sittings read), but practice is
moving — 94 cells of it, every village. Nobody starved. The villages are
missing the same thing as ever: a reason to go looking for trouble
instead of waiting for it — nobody has hunted on purpose in seventeen
panels running — and a second pair of hands that knows what it's doing.
The landing itself — first fortnight, first System contact, survival
basics — is reachable, makes sense, and holds together, and the
garbled menu label that haunted the last three panels is gone.

## Verdicts

- **Reachable:** YES — System contact 10/10 by d9, favors offered and kept,
  fights firing, D1 label fixed and visible.
- **Fun:** YES — conversations carry real wants and land real lines; the
  nonverbal sittings close; the warn_you sitting resolves with a real
  ending instead of looping.
- **Winnable:** YES for this leg (the leg is the first month, and all ten
  villages live through it with food and company). The longer climb is
  still the scale leg's question, not this one's.

## Gate (r135 branch)

`node scripts/check.js --quick` in the worktree: **330 passed, 10 failed
in 1328s** (log `evidence/2026-11-14/journey-landing-r135-gate-r135.log`).
Adjudication — 0 attributable:
- `test-measurement-proof-update.js` + `test-measurement-workflow.js` —
  staleness pair (standing set; the r129 src/js change staled it).
- `test-phone-frame-proof.js` — phone receipt staleness (standing set).
- `test-measurement-cache-flags.js` — "both actual CLI configurations
  complete valid neutral panels" in the parallel run; **PASS standalone
  (4/4)** — the documented box-load artifact (r187), not the change.
- Six 120s timeouts in the parallel run (box load avg 7+ during the gate):
  living-garden, one-person-army, occupation-panels,
  trust-observer-neutrality, synergy-stall, capable-bot — **all PASS
  standalone (exit 0)**; occupation-panels 25/25. Load artifacts.
- Gate verdict: **GO**.

## Landing (r135 branch)

[PENDING — merge follows the gate verdict above.]

## Metric review

- The person-trust bar's brittleness is now measured, not just noted: a
  baseline count of 1 under ±25% admits only exactly 1, so any
  single-errand flip fails the test. Proposed for the NEXT run: an absolute
  ±1 allowance for baseline counts under 4 (or equivalent), decided then,
  not applied mid-run here. The bar bound this run as written.
- HEED-loop counter vs driver dodge: the counter flags the Dauletkhan
  sitting again, but the sitting resolves engaged with distinct lines —
  the counter cannot tell an NPC loop (verbatim brush-off repeats, the
  r129 defect) from a player dodge (fresh lines each time). Proposed: the
  counter should weigh verbatim repetition, not just offer-count. Next run.
- Analyzer vs transcript streak count: carries from r134 (analyzer
  maxSameStreak=1 on nv sittings vs transcript summary maxStreak=4–5; the
  analyzer counts same-pick runs, the summary counts the sitting length).
  No bar depends on the difference.
- Presshop bar "identical to the previous panel" keeps carrying; the shape
  (farUnreached=1) has now repeated r131→r132→r134→r135 unchanged.
- No metric proved wrong this run beyond the items above; no revision
  applied mid-run.

## Carried (unchanged)

- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
- WATCH: want-thread resume acknowledges without re-asking on the
  curious/dream thread (1144 d5, r134) — no second sample on this panel;
  still one sample.
- HEED filler-loop shape (Dauletkhan warn_you, 1150 d6) — legacy watch item;
  the sitting itself now resolves engaged.
- Hunt assignments still never resolve in the landing window (H1-ESTABLISHED).
- NV sittings share one closing template (palms-pressed goodbye) — middles
  are their own; observation only.
