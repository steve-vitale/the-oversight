# Journey endgame r225 — Lane B leg 4 (2026-11-16)

Leg 4 (endgame). Rotation-b read 4 at run start (r224 succession landed,
rotation 7->4). This run plays leg 4 and writes 5 at closeout after a
verified landing.

Substrate: master b659acdd5 exactly (sim-gateconfirm-a tip). F5 fix arm
committed pre-panel: a04b9cd13 (settled-favor variants + proof test +
prereg + panel tooling). Analyzer clone proven 9/9 on r219 corpora.

## Adoption note

The scheduled coordinator (run_id journey2-endgame-20261116-0955Z) hit the
3600s cron timeout at ~10:56Z before closeout: gate checks and telemetry
were pending, no run note existed, no landing, rotation not advanced,
lock/hbloop cleanup not done. Adopted by the main session: run verified
dead (timeout + no hbloop process + no processes in tree; last heartbeat
10:54:33Z was the dead hbloop's final 5-min tick), tree heartbeated
10:56:52Z, panel verdicts extracted from the finished chain logs (no
number re-scored), gate + telemetry run by the adopter, run note written
here, evidence committed, rebased onto master, proofs re-run, merged.

## Panel verdicts

### Pass A-live (matched 89701–89705, CAPSTONE/BUYOUT off) — PRIMARY NO-GO

- Lesser 5/5, full 0/5, village-lost 0/5. ROAD-TALLY earned 0 sat 0.
- **M23b GATE-OK TALLY 1/5** — 89704@d82 reached deedGateReady().ok
  (r219 pass A: 0/5). The gate opened on a matched seed for the first
  time in this leg's recent panels.
- **89704 (forcedrift) FACED WAVE 5: w5max 3, uw 5, peakVet 3, standing
  691, wavesOk TRUE** (r219 pass A: w5max 0, uw 4). The profilegate
  bypass (delta (d)) moved the door on a matched seed — the first
  matched-seed wave-5 facing since r219's 89705 (w5max 1). No full seat:
  the capstone leg is disabled on pass A by design, and the seat's
  binding was the capstone deed, never delivered.
- All other seeds: lesser, w5max 0, uw 4, standing peak 199 (M11: 4/4
  at-199, 0 at-200+). 89701 sat d95, 89702 d90, 89703 d97, 89705 d91.
- Bindings: M1 GO, M2 GO, M2c GO, M2d GO, CORPUS-PURITY GO 5/5, M2b GO
  5/5, M8 GO, MFLEE GO, M5 GO, M5b GO, M6 GO, M10 GO, M11 GO, M12 GO,
  M13 GO (vacuous), M14 GO, M15 GO, M16 GO, M17 GO, KILL-ANATOMY GO
  25/25, M18 GO, M19 GO, M20 GO, M21 GO, M22 GO, REG GO, VETCONV GO,
  SECOND-VETERAN GO, FIRENARR GO, HURTRETURN GO, FALLEN GO,
  V-WAITVARIETY GO, LOSSKIND GO (vacuous), L-PEAK GO, M23/M24/M24b/M25c
  GO (disabled-leg vacuous). M3b NO-GO (peak 0/4) and M4 NO-GO (0/4) —
  the expected shape when no seed takes a full seat.
- Starvation: Wanda Xi d15 on 89701 (pre-sitting, sat lesser d95).
  No other starvation deaths on pass A.

### Pass C-live (matched, CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — PRIMARY NO-GO

- Lesser 5/5, full **0/5** — REGRESSION vs r219 pass C (3/5 full:
  89702 d63, 89704 d92, 89705 d84). ROAD-TALLY earned 0 sat 0.
- M23b GATE-OK TALLY **0/5** (r219 pass C: 3/5). M23-capstone NO-GO
  VACUOUS (no seed reached deedGate ok). M24/M24b vacuous GO.
- M25c buyout-early GO: 5/5 bought early (89701 d39, 89702 d20,
  89703 d55, 89704 d37, 89705 d25; ~8,200 kcal spent each). The buy-out
  road's mechanism works — the bundles fired, the pantry paid — but the
  deed gate never opened on this substrate's trajectories, so no full
  seat converted. **Attribution: trajectory re-roll, not a road defect.**
  No gate or buyout code changed since r219 (deltas (a)–(c) are dialogue
  quality with RNG-draw shifting, (d) is the profilegate bypass); pass A
  89704 reached gate-ok d82 while pass C 89704 did not — same seed,
  different env, different trajectory. The road is intact; the gate is
  the binding wall on this roll.
- W5-question NO-GO on pass C: no uw=5 seed (89704's pass-A facing did
  not reproduce on pass C). Bindings otherwise as pass A (M1/M2/M2c/
  M2d/CORPUS-PURITY/M2b/M8/MFLEE/M5/M5b/M6/M10/M11/M12/M15/M16/M17/
  KILL-ANATOMY 34/34/M18/M19/M20/M21/M22/REG/VETCONV/SECOND-VETERAN/
  FIRENARR/HURTRETURN/FALLEN/V-WAITVARIETY/LOSSKIND/L-PEAK all GO;
  M3b NO-GO, M4 NO-GO).
- Starvation: Wanda Xi d15 again on 89701 (pre-buyout; the d39 buyout
  did not cause it). No other starvation deaths on pass C.
- Analyzer exit code 1 on pass C — the expected non-zero exit for a
  PRIMARY NO-GO verdict, not an infrastructure failure.

### Pass C-wide (fresh 89740–89747, buyout on) — WIDE-VERDICT GO (M25c + purity)

- Lesser 7/8, lost 1/8, full 0/8. M25c GO: 7/7 bought (89745 never
  bought — the village died first). CORPUS-PURITY GO 8/8.
- **89746 FACED WAVE 5: w5max 2, uw 5, standing 619, peakVet 2,
  wavesOk TRUE** — the first fresh-band wave-5 facing in this leg's
  C-wide panels (r219 C-wide: 0/8, w5max 0/8). Sat lesser d108; the
  seat's binding was crises (crisesOk false), not waves. The door opens
  on fresh seeds too.
- **89745 LOST d27** — three starvation deaths by d26 (Brendan d22,
  Monique d26, Killa d26). The village never reached the sitting. A
  survival-collapse note for a fresh seed, not a defect: the game is
  hard early and the village starved before its pantry ever filled.
- Starvation on the other seeds: Roberto Xiao d23 (89740), Gladys
  Vitale d65 + Victoria d83 (89741), Esteban Nolan d8 (89747).
- All other C-wide seeds: lesser, w5max 0, uw 4, standing 145–199.
  89741 and 89747 sat with foodDeeds false as a second binding.

### Smoke (89706, pass-A policy, full horizon)

Sat d110 lesser, uw 4, w5max 0, alive 8. Harness + timing fine.

## F5 fix — landed, proof green, wild check vacuous

- Fix: settled-favor "it's handled" singleton (conversation.js:7160)
  now cycles 3 honest variants via convoPickCycle
  ('settledfavor:handled', F4c class) + fallback to the original line.
- Proof test scripts/test-journey-endgame-r225-f5-settled-favor-20261116.js:
  GREEN 22/22 on fixed code, RED 3/3 on unfixed code (verified by the
  run; re-run by the adopter on the rebased tip — see gate section).
- Wild check: **0 hits for the old singleton line AND 0 hits for the
  two new variant lines across all 18 panel transcripts** — the
  settled-favor branch never fired in this panel, so the wild check is
  vacuous: no F5-class dry hit, and no live exercise of the fix. The
  proof test stands as the evidence; the next panel that re-asks a
  settled favor will exercise it in the wild.

## People check (Q6) — the finales read as people

- **89704 pass A (dark relay):** the audit names the ledger honestly
  (5 wave-4, 3 wave-5 fought; full seat wants the capstone deed), and
  the relay choice lands with consequences: "Poran makes a sound that
  isn't a word. Poran's brother is in that row. Poran watched you
  sign. Poran will remember the exact shape of your hand when you did
  it. The village doesn't cheer. The village has never been this quiet."
  Named people, remembered actions, a village that reacts.
- **89746 C-wide (beloved):** "You spend it all — the love, the light,
  the finale slot — on people the cameras never found. You name the
  unfilmed villages. You name the dead." And the closing sting holds:
  "in rows of humming glass, the little ones are still napping...
  The oversight is the looking away." A finale with a point of view.
- **Funeral-mend fired + voiced (Q10):** 89703 pass A — "Grace's
  funeral feast: 6,000 kcal from the pantry, and every shaken fire is
  fed... (Trust mended — the -8 bought back with grain.)" The first
  realm-hold lever working, and it says so out loud.
- **Doubled-quotes fix holds:** zero `SYSTEM: ""` lines in all 18
  transcripts.
- **159-turn Algorithm fight did NOT recur (Q7):** longest fight in the
  panel is 73 turns; Algorithm fights end talkDown/otherEnd.
- **fastW4 diedInFight gap did NOT recur (Q8):** zero `diedInFight:[]`
  in the corpora; M2b attribution GO on pass A (5/5) and pass C (2/3
  named, one day-window-only causal — the known fallback shape, not
  the r171 gap).

## Village assessment (plain words)

Five matched villages all lived to sit at the table on day 90 and all
took the lesser seat — nobody died out, nobody starved except one
woman on one seed. The villages are competent at surviving and at
gathering standing, and they stop exactly at the same wall every time:
standing caps at 199, wave 5 stays unfaced, and the full seat needs a
deed nobody delivers. Two seeds broke through the wall this round —
89704 on the matched band and 89746 on fresh seeds both faced wave 5,
both with living veterans in camp — but facing isn't sitting, and the
deed gate stayed shut on the buyout road's roll. On the fresh band one
village died young and hungry (89745, three starvation deaths before
day 27), which is the game being hard, not broken. The finales, when
they come, are genuinely felt — the dark relay's silence, the beloved's
naming of the dead.

## Reachable / fun / winnable

- Reachable: yes — every seed reached the table, the audit, and a
  finale; the buyout road fired 5/5 matched and 7/7 fresh.
- Fun: yes — the finales land (see people check), the funeral-mend
  voice works, fights resolve with real anatomy.
- Winnable: **not yet, and the shape of the wall moved but did not
  fall.** Wave 5 was faced on 2 of 13 panel seeds (89704 matched,
  89746 fresh) — the first time the door has opened on a fresh band —
  but no seed on any pass took a full seat, and the buyout road that
  converted 3/5 last round converted 0/5 this round on a trajectory
  re-roll. The win question is still the wave-5-facing + gate-ok
  question, and the gate is the binding wall on this roll.

## Telemetry

`telemetry-check.js` vs the r188 baseline (pass-A sums uw 22, won 4,
peakVet 8): **quiet** — r225 pass-A sums uw 21, won 5/5, peakVet 6;
no large deviations. Baseline NOT rolled (same regime).

## Metric review (§14)

- M23b adopted in r219; tally this run: pass A 1/5 (first matched
  gate-ok), pass C 0/5. The tally moves with trajectories — it is an
  observation, not a verdict.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r219; no
  'over' attempt and no announce-after-refusal in this panel).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD — GO on every pass).
  M25c buyout-early (HOLD — GO 5/5 matched, 7/7 fresh). M24b
  (HOLD — vacuous on every pass so far).
- Pass C's PRIMARY NO-GO after r219's GO is a trajectory re-roll, not
  a metric failure — no metric revision proposed. The M23b tally's
  trajectory sensitivity is worth watching across the next two panels
  before treating any single round's 0/5 as a road verdict.

## Gate

`node scripts/check.js --quick` in the worktree (adopter re-run, first
run killed by a VM replacement at ~11:07Z): **334 passed, 6 failed in
561s** — the standing profile, 0 attributable. Failures:
measurement-proof staleness pair (test-measurement-proof-update.js,
test-measurement-workflow.js — "retained neutrality proof covers the
current Game/controller/harness inputs"), phone-frame-proof stale
receipt (3 sub-fails, "Phone receipt source is stale or missing:
index.html"), ladder-bundle guard side-effect
(test-ladder-bundle-20261108.js — "control: 200 monster turns WITHOUT
delivery fire the ambient raid"), plus two exact-120s timeouts
(test-living-garden-deed-attainment.js, test-one-person-army-
deed-attainment.js — both named intermittent load artifacts; re-run
standalone below). Log:
evidence/2026-11-16/journey-endgame-r225-gate.log.

Standalone re-runs of the two 120s timeouts (quiet box, after the
gate): living-garden 8 passed 0 failed (exit 0),
one-person-army 7 passed 0 failed (exit 0) — both load artifacts,
confirmed green standalone.

Analyzer clone test (quiet box, after the gate): re-ran
scripts/analyze-endgame-r225-20261116.js against all three corpora
(pass A, pass C, pass C-wide) and diffed stdout against the chain
logs — **byte-identical on all three** (0 diff lines each; M23b 1/5
on pass A exact). The earlier 2–3 moving failures were gate
concurrency, not an analyzer defect.

## Blanks / fix items

- None filed. The F5 fix is landed (this run). The pass C 0/5 is a
  re-roll, not a defect — no lever killed, no code changed in response.
  The 89745 d27 starvation loss is a village-assessment note, not a
  defect. Next endgame run watches: (1) does M23b go ok again on the
  buyout road, or does the 0/5 repeat; (2) does the F5 settled-favor
  branch fire in the wild; (3) does a wave-5-facing seed convert to a
  full seat.
