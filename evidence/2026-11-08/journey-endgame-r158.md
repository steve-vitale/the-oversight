# journey-endgame r158 — Lane B, leg 4 (endgame) — 2026-11-08

Run: r158, leg 4 (endgame). Rotation-b read 4 at start; write 5 at closeout.
Lock: `playtest-loop-2.lock`, run_id `2026-11-08T12:58:59Z`.
Worktree: `journey2-endgame`, branch `journey2-endgame`, base master `4fe571095`.
Prereg: `evidence/2026-11-08/journey-endgame-r158-prereg.md` (written before any scored seed).

## The question

Matched re-run of r156's 5 seeds on the ladder substrate (leg 1 + leg 2
landed since r156): does the staged Standing ladder open the lesser seat
without the feast gate, and does anything in the endgame read wrong now
that the seat prices on ladder points instead of one dinner?

Seeds: 89701 (waves), 89702 (waves), 89703 (waves), 89704 (forcedrift,
experimental ex-control), 89705 (wavesnw). Same probe policy as r156.
180 days each.

## What happened, seed by seed (plain words)

**89701 — the village scattered.** Only Sofia Chen was left alive by day
73, pantry empty, and the village broke apart on the third hungry day.
Ethan Hunt killed two wave-4 beasts (an Eater on day 47, an Algorithm on
day 64) before the village fell apart. The cruel detail: this village had
already climbed to National Standing by day 27 and the lesser seat was
priced on day 35 — but a seat offer means nothing to a village that
cannot hold together, and the table never announced before the day-90
floor. The ladder does not save a village that starves.

**89702 — sat the lesser seat, feared, pledged the terror.** Announced
day 90, sat day 95, four people left (Ivy Wang, Meera Reddy, Wanjiru
Kamau, Nadia Khoury), pantry 8,413. Two living veterans (Nadia, Meera).
Wave 5 was faced twice — a Timeslot on day 83, an Editor on day 90.
Final choice: pledge humanity's fear as a standing shield, never a
sword. Sat five days earlier than r156 (day 100).

**89703 — sat the lesser seat, defiant, walked away.** Announced day 96
(six days late — the seat priced late), sat day 102, TEN people left,
pantry 10,050. This village barely fought: four fights all run, one
wave-4 kill (a Herald on day 99, by a newcomer). It climbed to National
on talking, exploring and foraging (Fight 6, Forage 30, Explore 33) —
the ladder rewarding a village that does not fight is the ladder doing
what it was approved to do. Final choice: refuse every price and walk.
The scholar was exiled all run — 40 feast plans refused with "Exile
means exile. The fire isn't yours to open." — and the seat came anyway,
because the seat no longer needs the feast. That is the ladder's
clearest effect in this run: exile still locks the feast, but it no
longer locks the seat.

**89704 — sat the lesser seat, relay, dark, became the voice.**
Announced day 90, sat day 90, eight people left, pantry 6,306. The only
seed where the wave-5 readiness bar was fully met (2 veterans, 7
armored, 8 armed) — and wave 5 never arrived: six wave-4 arrivals
blocked, no wave-5 monster ever showed in the window. Final choice:
become the relay's voice; the merge completes and the System finally
says the bearer's name right. Final pick moved again across runs
(voice → merge → voice).

**89705 — sat the lesser seat, feared, showed mercy.** Announced day 90,
sat day 91, six people left, pantry 27,208 — the richest village.
Diana Osei killed two Reunions (days 83 and 88), faced wave 5 (an
Editor, day 91), and died in a Reunion fight on day 89 — the day before
the village sat. The veteran who opened wave 5 did not live to see the
seat. Final choice: mercy from the feared one. Sat seven days earlier
than r156 (day 98).

Tally: lesser 4/5, full 0/5. Wave-5 unlocked on 3/5 (89702, 89704,
89705), faced on 2/5 (89702, 89705). r156 was lesser 4/5, full 0/5,
unlocked 1/5, faced 1/5.

## The ladder, measured

Every seed reached National Standing (peak 3): counted 43 / 57 / 77 /
68 / 61 against the 40-point bar. No capstone delivered on any seed (no
probe policy delivers one — the full seat's capstone leg is UNMEASURED
this run, as preregistered; it is an instrument limit, not a ladder
verdict). No feast bundle completed on any seed — the ladder climbed
without the +4 bundle bonus ever firing; the bundle deed did not fire
in bot play on 5 seeds (descriptive, for the leg-2 panel).

The ladder was carried by Explore almost everywhere (breadth + links),
not by fighting: 89701 Explore 42, 89702 Explore 42, 89703 Explore 33,
89704 Explore 32, 89705 Explore 47. Fight contributed 3–8 points per
seed. The per-track cap bit (Explore capped at 24 on four seeds).

M10 gaps, ladder terms: 89702's only missing full-seat piece is the
capstone; 89703 is missing wave-5 faces (0/2) + capstone; 89705 is
missing one wave-5 face (1/2) + capstone. No phantom surge gap — the
M10 revision works.

Standing peaks: 199 / 501 / 199 / 277 / 642. The two wave-5 seeds
released past the old 199 hold (501, 642) once wave 5 unlocked; the
wave-4-held seeds stayed at 199.

## Bindings verdict

PRIMARY-BINDINGS **GO** | PRIMARY **GO** | ALL **NO-GO** (solely
M3-conversion, below). Full analyzer output:
`evidence/2026-11-08/journey-endgame-r158-analysis.txt`.

- M1-guard GO 5/5. M2-census GO, M2c GO, M2d GO (22/22 uncommitted
  fights classified). M5-voicing GO (89704 crossed + voiced). M5b GO.
  M6 GO (deferrals named: roster, veteran-banked ×2). M10 GO (gaps
  above). M11 GO. M12 GO. M13 GO (release snapshots d74, d83).
  M15/M16/M17 GO. KILL-ANATOMY 44/44. M18/M19/M20/M21/M22 GO.
  VETCONV GO. SECOND-VETERAN GO (second veteran d73, d83).
  FIRENARR/HURTRETURN captured. FALLEN-ambush GO (89705: 1).
  V-WAITVARIETY GO. LOSSKIND GO (89701 scattering). L-PEAK GO 5/5.
- M4-wave5-or-full **GO** (2/4 — 89702 and 89705 reached wave 5). The
  wave-5 leg of M4 passes; the full-seat leg is unmeasured (instrument
  limit, above).
- W5-question **GO**: both wave-5 seeds FACED wave 5 (89702: Timeslot
  d83, Editor d90; 89705: Editor d91). First run in this series with
  two waves seeds facing wave 5.
- M3-conversion **NO-GO**: armB (wavesnw, 89705) kills 3 vs armA
  (waves) kills 6. The not-walking-in arm did not out-kill the
  walking-in arm on these seeds. A tally miss, not a pilot failure —
  recorded under metric review, not re-scored.

## The fix this run: the audit stuttered the ladder's name

The seat's audit line — the single most-read ladder sentence in the
game — repeated the top rung's name: "Ladder — National Standing
National Standing reached (Fight 6 · ...)". It fired on all four
sitting seeds. Root cause: `ladderLine()` in `src/js/ladder.js` builds
`Ladder — ${stageName} ${target}` where the top-rung target was itself
`${stageName} reached`. One-line fix: the top-rung target is now just
`reached`, so the line reads "Ladder — National Standing reached
(Fight 6 · ...)". The mid-rung form was already right ("Ladder —
Village Standing 16/26 to Regional Standing (...)") and is unchanged.

Proof: `scripts/test-ladder-line-r158.js` — 9 checks. It FAILS on the
pre-fix code (the duplicated line, printed) and PASSES after the fix.
Post-fix re-run of seed 89702 (full 180-day pilot seed, identical
trajectory: ann 90, sat 95, lesser, alive 4) shows the fixed audit
line in the real endgame flow. The other three sitting seeds' pilot
transcripts still carry the pre-fix line (they were not re-run); the
proof test + the 89702 re-run are the evidence.

Also fixed: `docs/TABLE.md` still listed the old lesser-seat food bar
("sentimentTaught + feastSurgeUsed"). `tableSeat()` since leg 2 prices
the lesser seat on sentimentTaught alone + ladder peak ≥ Village
Standing. The doc now says that, citing the code. The diag layer
(`scripts/policies/fullseat-diag.js`) still decomposes the full seat
with the pre-ladder gate — carried as a blank, owed to the ladder
coordinator / leg 4, not changed here.

## Dark probe

7 variants, one failed step: `v1a-loss:D2-twist-fired` — the expected
curdle (the loss variant's D2 twist is supposed to curdle, not pass).
The `seat-lesser` step PASSED on the ladder substrate without any rig
change: the rigged fresh game scores Village Standing (16/26) and
`tableSeat()` returns lesser. The prereg's ladder-rig contingency did
not trigger (verified first with a standalone diag in /tmp, then by
the probe itself).

- S1 HOLDS: the sitter walk-out names **Amelia Moon**, not Bill Palmer.
- S2 HOLDS: D1–D4/D6 hold; v1a curdle is the expected non-ok step.
- The dark rig's "For a full seat" line now names the ladder honestly:
  "only 16 of 40 counted ladder points toward National Standing
  (highest climb: Village Standing)".
- Log: `evidence/2026-11-08/journey-endgame-r158-dark.log`,
  corpora in `perseed-endgame-r158-dark/`.

## People check (full transcripts read)

The four finales read as people, and each final choice matches the
path the village actually earned:

- 89702 feared/pledge: "You pledge it aloud, on the record:
  humanity's fear is a standing shield, never a sword."
- 89703 defiant/walk: "Not one grain." / "No." Twice. "Humanity walks
  — poorer, whole, free. ... The prices are paid. The door stays
  ajar." A village that fought four times in 102 days refusing every
  price and walking reads as earned defiance, not a default.
- 89704 relay/voice: "Become its voice." — the merge completes, "the
  System finally says your name right." Chilling, coherent.
- 89705 feared/mercy: "The most frightening thing you ever did. ...
  the feared one chose gentleness — and that choice echoes longer
  than any threat."

Refusal variety: refusals are voiced per context with consequences
(the army offer in the dark probe: "You say no. The System tilts its
head — genuinely puzzled. ... The mourners exhale."; the defiant
price refusals above). No template repetition found in the endgame
finales. Bond proposals: none observed in the endgame transcripts —
expected; the probe does not drive the conversation system, and
V-BONDINIT is descriptive-only (bond proposals are leg 5's
instrument). Pellet lock: no recurrence on 89702 or any seed (the
pellet passed without locking; M17 surge spends all named).

One voicing wart, noted not fixed: 89705's war path says "On day 88,
Diana put down The Loud Beast. On day 83, Diana put down The Loud
Beast — and 1 more tooth after." Two different beasts sharing one
display name read as the same kill twice. Descriptive; the kills were
real (two Reunion kills, d83/d88).

## Metric review (§14)

- M3-conversion: the armB-vs-armA kill comparison missed (3 vs 6).
  The metric is a road tally, not a binding; the miss stands. It says
  the not-walking-in lever did not convert more kills on these five
  seeds. No re-scoring. Next run: keep the tally; if the panel's
  wavesnw arm keeps trailing, the lever — not the metric — is the
  question.
- M10-fullseat-gap: revised this run (capstone-only gap for a sitting
  seed). The revision behaved: 89702 passes with gap "capstone: none"
  and no phantom surge gap. Keep the revision.
- L-PEAK (new binding this run): every pilot JSON carries the ladder
  snapshot; it held 5/5. Keep.
- The full-seat leg of M4 remains unmeasured until a probe policy
  delivers a capstone or buys out a feast bundle. That is the known
  instrument gap for the next endgame run, not a finding about the
  ladder.

## Gate

[gate section — filled after check.js --quick]

## Telemetry (closeout, 2026-11-08 ~18:10Z, verified by the closing run)

`node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/endgame.json --current 'evidence/2026-11-08/perseed-endgame-r158/*.json' --metrics veterans.unlockedWave,won,peakLivingVeterans` — **quiet** (5 files, 3 metrics, no large deviations), exit 0. Metrics are the r121 post-seat-regime keys only; the r51-era maxTier/satPenalty keys were NOT compared (mixed-regime file, per its own note). Baseline NOT rolled on a quiet check, per the prereg.

## Verdicts

- REACHABLE: yes. The lesser seat opened on 4/5 seeds through the
  ladder, including a village that barely fought. The full seat is
  reachable in principle (capstone + wave-5 faces) but unproven in
  bot play — no bot policy delivers a capstone yet.
- FUN: the finales read as people; the defiant walk and the feared
  mercy are the two strongest endings this leg has produced. The
  audit stutter was the one flat note, and it is fixed.
- WINNABLE: the lesser seat is winnable (4/5). The full seat is not
  yet won in organic play — unchanged from r156 — but the wall moved:
  it is now a capstone delivery + one more wave-5 face, not a feast
  the village may never throw.

## Files

- Prereg: `evidence/2026-11-08/journey-endgame-r158-prereg.md`
- Pilot log: `evidence/2026-11-08/journey-endgame-r158-pilot.log`
  (per-seed: `perseed-endgame-r158/`; 89702 re-run post-fix, same
  trajectory)
- Analysis: `evidence/2026-11-08/journey-endgame-r158-analysis.txt`
- Dark: `evidence/2026-11-08/journey-endgame-r158-dark.log`,
  `perseed-endgame-r158-dark/`
- Instruments: `scripts/probe-endgame-r158-20261108.js`,
  `scripts/analyze-endgame-r158-20261108.js`,
  `scripts/probe-darktable-r158-20261108.js`
- Fix: `src/js/ladder.js` (one line), proof
  `scripts/test-ladder-line-r158.js` (9 checks, fails pre-fix,
  passes post-fix)
- Doc: `docs/TABLE.md` (lesser-seat bar, ladder terms)

## Adoption (this run — Lane B 13:00 CST, 2026-11-08 ~19:00Z)

The 07:00 run timed out in its gate (gate log ends mid-dots, no
summary). This run adopted the orphaned worktree:

- Stale-lock recovery: lock `2026-11-08T12:58:59Z`, registry
  heartbeat 17:56:50Z — 62 min stale (>15 min) → dead run per the
  body rule. Lock deleted, new lock `2026-11-08T19:02:08Z` written.
  Main tree clean (one 0-byte `reap-probe-*` file removed by hand,
  reaper debris), disk 31%.
- `docs/ONTOLOGY.md` found 0-byte in the worktree (all 2105 lines
  deleted, unmentioned anywhere in the r158 note) — a write-flap
  truncation, not an r158 change. Restored from HEAD, verified
  2105 lines, byte-identical. No ONTOLOGY.md change lands.
- `src/js/ladder.js` fix SUPERSEDED: master's ladder leg 3
  (`e1d1c00ff`, r111 "top-rung line fix") landed the IDENTICAL
  one-line change (`? 'reached'`; ladderLine region byte-identical
  between worktree and master). Two runs found the same stutter
  independently; leg 3 landed first. The worktree's ladder.js was
  reverted to its base before commit so the rebase applies cleanly —
  no ladder.js change lands from r158. The proof test
  `scripts/test-ladder-line-r158.js` DOES land and passes on the
  rebased tree (the fix is present via leg 3); its fail-pre-fix
  property was verified by r158 on the old base.
- Rebase target: master `6680d7924` (63 commits ahead of the r158
  base `4fe571095` — pellet boost+cost, medicduty, ladder leg 3,
  Loop A landings). TABLE.md untouched on master in the range;
  ladder.js carries leg 3's tribute-readiness change (scholar
  excluded from veteran counts) which the rebase brings in — the
  r158 pilot ran under the old counting, so its evidence stands as
  a record of substrate `4fe571095`, not a re-measurement.
- Gate + telemetry re-run on the rebased tree: [filled below].

## Gate (adoption re-run, check.js --quick on rebased tree)

[filled after the gate runs]
