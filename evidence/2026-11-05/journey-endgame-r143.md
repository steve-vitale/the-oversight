# Journey endgame r143 — RUN NOTE (lane B, leg 4, 2026-11-05)

Leg 4 (endgame). Rotation-b read 4 at run start; **written to 5 (social life)
at closeout** — the landing verified, so the leg advances per the prereg.

Run number basis: latest completed Lane B endgame run is r140 (2026-11-05
10:00 CST, closed out by the main session after the coordinator timed out).
r141 (social life) and r142 (succession) completed since. This run is r143.

**Closeout:** the coordinator timed out at ~23:58Z before finishing. The main
session closed it out per INSPECT HELD WORK after verifying death: lock
run_id `loop2-20261105T225535Z` read first; registry heartbeat 23:57:08Z was
fresh (~4 min) but provably an orphan heartbeat LOOP (pid 27847, `while true;
worktree-heartbeat.sh journey2-endgame`, zero worker processes — the r138 /
r140 / r141 pattern). The loop was killed, then the closeout ran: proof
tests re-verified, gate re-run on the rebased tree, fixes + evidence
committed, ff-merged. No game work was invented in closeout — every fix and
every measurement below is the run's own, verified from its files.

## Pre-registration

`evidence/2026-11-05/journey-endgame-r143-prereg.md` (written before any
scored seed). Substrate r140 EXACTLY — capable + deedhunt + vetcommit +
greedy deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1, TELEMETRY_FULL=1,
RELAYGREY=1. 180d, death-aware (+10d tail max). Pilot seeds 89701 (waves),
89702 (waves), 89704 (forcedrift control), 89705 (wavesnw) — deliberate
matched-seed reuse vs r140, same probe policy, only the game code changed.

Head delta since r140 (e5e6aa59b → e39227114): combat.js +7 (r140 Fix A
harry-when-stuck), finale-campaign.js +14/− (r140 F2/F3), game.js +81 (r141
haven-news relay — narration timing only), sigW5.js +13/− (r140 F1 fiDealt).
No gate, price, deed, seat, or table change; gating freeze stands.

Run-start incidents: lock none present; main tree clean; disk 24%;
reaper removed build-departmeal (4.1h stale, branch kept); registration
slow (~6 min, load ~8) but clean; master at pull time e39227114. While this
run was in flight, master moved twice under it (Loop B 2130Z refind-confirm
GO landing `5194acd46`, Lane A journey-scale r102 closeout `4c7bf78cc`) —
the closeout rebased onto `4c7bf78cc`, no conflicts, proof tests re-run
green after the rebase.

## Pilot verdicts (pre-fix, from the run's analyzer)

`evidence/2026-11-05/journey-endgame-r143-analysis.txt` + per-seed JSONs in
`perseed-endgame-r143/`. **PRIMARY-BINDINGS NO-GO** — the road bindings
(M3-conversion, M3b-peak, M4-wave5-or-full, W5-question) all NO-GO, which
is the expected closed-road reading on this leg, not a pilot failure.

GO: M1-guard 4/4 (89701 honest-death, 89702 announced d90, 89704
honest-death, 89705 honest-death); M2-census; M2c engine coverage 3/3;
M2d gate-named 2/2; M2b attribution 2/2; M8 exit-canon (1 mFlee, matched);
MFLEE-routed-coverage 1/1; KILL-ANATOMY 12/12; M6 guard-named-deferred
(89702 veteran-banked); M10 full-seat-gap (89702 [w5:0/2]); M11 standing
peak; M12 bar-record; M15 feast census; M16 dusk census; M17 surge-mode;
M18 ghost-scan; M19 grant-log; M20 standing-trace; M21 audit-crosscheck;
M22 feast-hold; REG-r35/r37; VETCONV-recon 3/3; SECOND-VETERAN coverage
3/3; FIRENARR captured (12 lines); HURTRETURN captured (2 lines);
FALLEN-ambush 4/4; LOSSKIND classified 3/3. M5-voicing-canonical VACUOUS
(r124 rule: control dead before window, no relay final in block). M9-supply
INFO only (37 blocked arrivals).

### Per-seed headlines (pre-fix)

- **89701 waves: village-LOST — scattered d80**, pantry 0, alive 1.
  (r140: scattered d53. The flip PERSISTS — still a scatter, no lesser
  win, just later. The r140 away-ration attribution stands as the leading
  hypothesis, still not proven.)
- **89702 waves: WON LESSER** — announced d90, sat d102, alive 5,
  path witness / branch light, final:wayback. Standing peak 199.
  Guard veteran-banked; gap [w5:0/2].
- **89704 forcedrift: village-lost — no-successor d40**, alive 0.
- **89705 wavesnw: village-LOST — scattered d99**, pantry 0, alive 2.

Tally: lesser 1/4, full 0/4, wave-5 unlocked 0/4, faced 0/4. Deaths
dominated by the wild; 1 ambush death (Owen, d8, 89704 — recorded in
fallen). No sit-day deaths (SIT-DAY-DEATHS dedupe still open).

## Dark re-verify (pre-fix AND post-fix — identical)

Full dark probe re-run as r143 (`perseed-endgame-r143-dark/`,
`journey-endgame-r143-dark.log`) and again after the fixes
(`journey-endgame-r143-dark-postfix.log`): **7 variants, same result both
times** — v1a 26/27 (D2-twist-fired curdled instead: the expected
by-design non-ok named in the prereg), v1b 23/23, v1c 24/24, v2 18/18,
v3 25/25, v4 20/20, v5 17/17.

- **S1-sitter-coda GO:** the v3 walk-out line names the sitter, Amelia
  Moon — not Bill Palmer — in both runs.
- **S2-dark-holds GO:** D1–D4/D6 green on the new substrate, same steps
  and expectations as r138/r140.

## r140-fix verification in the wild (closeout greps)

Verified by the main session across ALL r143 pilot + dark transcripts
(pre- and post-fix): zero `(MOVE works.)` lines, zero `You takes`,
zero `(N total)` triangular finale totals. **V-F1, V-F2, V-F3 all hold.**
V-FixA: harry fires for stuck helpers in the wild (pre-fix 89701
transcript carries 27 harry lines). The gap the dark probe exposed was
NOT Fix A — it was the help branch (see Ruth diagnosis).

## Ruth diagnosis — the find of this run

Dark probe v1a-loss/v1b-honest: Ruth harries every round in v1c-tank
(Fix A working) but waits silently 3× in the losing walks. Diagnostic
probe `scripts/probe-ruth-wait-v1a-r143-20261105.js`,
`perseed-endgame-r143-diag-ruth-v1a/ruth-decide.json` (pre-fix behavior,
same geometry as the proof test):

Ruth is 'helpful', body-distance 2 from the Finale, full HP, 0 moves.
Rounds 1–2 she harries (player healthy → Fix A strike branch). Rounds
3–5 the player is hurt (<70%), so the HELP branch fires first — she
tries to close on the player, cannot reach them (0 moves, blocked), and
returns `'wait'` WITHOUT ever reaching the strike/harry logic below.
**Fix A patched only the strike branch; the help branch kept the silent
wait.** And `tbVillagerTurn` had no narration branch for `'wait'` at all
(r140's planned Fix B never landed), so the turn was silent in the
transcript.

## Fixes landed [needs-eyes]

Commit `030e34cd8` (rebased; pre-rebase `b55028a4b`):

- **Fix C — help-branch fallback** (`src/js/engine/combat.js` +9): when
  the hurt player cannot be reached, the helper fights from where she
  stands — strike if the foe is adjacent, harry if it is in range (≤3).
  No second move: her steps were spent closing on the player.
- **Fix B — narrated waits** (`src/js/game.js` +5): any unhandled
  action (`'wait'`) in `tbVillagerTurn` says "`<name>` holds and
  watches." No turn is ever silent. (Canon: no silent actions. This is
  r140's planned Fix B, finally landed.)
- **Gorge fix — empty pantry** (`src/js/havenGrowth.js` +9/−1): when the
  stores are empty the lingering raider takes 0 kcal, so "gorges — 0 kcal
  gone" contradicted itself. Now: "circles the treeline, sniffing at
  empty stores — nothing left to take."

Proof tests (`scripts/test-ruth-wait-v1a-r143-20261105.js`,
`scripts/test-lingerer-empty-pantry-r143-20261105.js`) — verified by the
main session on the final rebased tree, both PASS:

- Ruth test: A1 harry (the bug), A2 help still fires when the hurt
  player IS reachable, A3 Fix A regression control, A4 wait when the foe
  is out of range (no invented harry), A5 strike when adjacent; Part B
  replays the v1a walk — 0 silent turns, Ruth harries 5/5 (was 2 harry +
  3 silent waits); Part C stages a live field fight and asserts a
  genuine out-of-range wait is narrated. RED evidence: the diagnostic
  probe's `ruth-decide.json`, generated pre-fix, shows harry 2 + wait 3
  on the same geometry — the test is non-vacuous.
- Lingerer test: control line still gorges with a real kcal count,
  empty-pantry line says the stores are empty, zero-gorge lines empty.

## Post-fix pilot (descriptive only — same 4 seeds, no verdict)

`perseed-endgame-r143-postfix/`, `journey-endgame-r143-pilot-postfix.log`.
89701 / 89704 / 89705 headlines unchanged. **89702 moved:** still WON
LESSER, but sat d108 (was d102), alive 7 (was 5), census 6 → 12 fights,
path witness → beloved, final final:wayback → final:quiet. Fix C moved
wild fight outcomes on the sitting seed — same-run observation only, not
a road claim. No re-verdict was pre-registered for the post-fix pilot
and none is claimed.

**Fix B wild volume (observation, not a revert):** "holds and watches"
fires 120× on 89701 and 62× on 89705 post-fix (0 pre-fix) — wait-heavy
fights now narrate every wait, and the lines cluster (three villagers
waiting in a row read near-identically). The alternative was silent
turns, which was the diagnosed defect; the repetition is a feel note
for the next endgame run, not a reason to revert.

## Gate

`node scripts/check.js --quick` on the final rebased tree (branch tip
`a1ed1a0ef`, base `4c7bf78cc`): **284 passed, 6 failed in 704s** — the
standing 6, identical to r99/r100/r106/r141/1830Z/r129:
measurement-proof-update, measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-fixes. No new
failures. Full log: goal hidden_files `r143-checkquick-20261105.log`.
(The run's own gate, started before the gorge fix, was killed mid-run by
the coordinator timeout — its partial log
`evidence/2026-11-05/journey-endgame-r143-checkquick.log` is kept as-is
as evidence of the killed run, not as a gate result. The proof tests were
re-run green after the rebase: ruth 5/5 harries, 0 silent turns;
lingerer's empty-pantry line + zero-gorge check.)

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/endgame.json
--current 'evidence/2026-11-05/perseed-endgame-r143/*.json' --metrics
national,table,wins,exiled`: **quiet** (4 files, 4 metrics, no large
deviations). Baseline NOT rolled.

## Verdicts

- REACHABLE: partly — the lesser seat is reachable (89702, third pilot
  in a row at 1/4); the full seat and wave 5 are not.
- FUN: yes — the sitting seed's finale reads as people (Ruth's waits are
  now fought or voiced; the dark walks resolve with named twists).
- WINNABLE: not yet — full seat 0/4, wave-5 kills 0 everywhere, and the
  second-veteran bar never forms (peak 1 living veteran).

## Metric review

- SIT-DAY-DEATHS dedupe (r124 proposal) stays open until a sitting seed
  with a sit-day death recurs.
- The 89701 flip investigation stays open: the scatter persists (d80 vs
  d53), so the away-ration attribution is still the leading hypothesis,
  still not proven — the next data point is a later endgame run, not
  another measurement arm on this one.
- Fix B volume: if the "holds and watches" line reads repetitively in
  wait-heavy fights, a varied hold line (or a once-per-fight cap) is the
  follow-up — feel work for the next endgame run, not this one.
- M5-voicing-canonical was vacuous again (control dead before window);
  the r124 rule keeps it unmeasured, not failed.
- Telemetry baseline re-seed is a panel decision, not this run's;
  baseline NOT rolled on a quiet check.

## Held items (carried)

- Firenarr LOUD caveat (deploy firings agree with old-tracer firings on
  only 1/8 pilot seeds) — open coordinator/Steve call, unchanged by
  this run.
- The 89701 flip investigation (above).
- Fix B hold-line variety (above).
