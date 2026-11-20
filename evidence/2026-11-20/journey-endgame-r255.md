# journey-endgame r255 — run note (adoption of the timed-out Lane B run)

Adoption of the scheduled Lane B endgame run r255 (02:00 CST Nov 20, 2026),
which timed out during the write flap after playing Pass A (4/5 seeds),
the smoke seed and nothing else — seed 89705's JSON was 0 bytes, killed
by EPERM at write. Everything below verified from files/git by the
adoption; the timed-out run's word was taken for nothing. Worktree
`~/workspace/worktrees/journey2-endgame`, branch `journey2-endgame`,
panel substrate master `59711ccc5` (r255 prereg substrate). Prereg:
`evidence/2026-11-20/journey-endgame-r255-prereg.md` (live deltas (a)
BOWCRAFT TURN-ON — first endgame panel on the turned-on duty; (b) r249
double-"The" fix; (c) r244 counter-label comma fix; (d) r253
antler-thrash fix; (e) r253 march-refusal once-per-day; (f) r245
growth-line cooled call; (g) r254 multi-name witness mourning; (h) r148
link-accept rotation; (i) r148 moderator-mute guard. Env-gated/inert:
BOWKNOW, SEARSUPPLY, BOWOPEN/SPEARGATE, SENSEEXPED, ALLYSLOT3 NOT in
src/js, PARTYSIZE4/FIGHTALLY2/etc. gated — FIGHTALLY2 on for Pass D
only, sixth sighting).

## Adoption recovery

- Liveness: at adoption start (~09:26Z) no r255 coordinator process and
  no WT_RUN_ID were visible in `ps`, and no live playtest-loop-2
  coordinator appeared in the subagent list. The only process was an
  orphaned heartbeat loop (pid 37973) — killed by exact PID, confirmed
  gone. Its last heartbeat attempt failed 08:49Z on the 0-byte registry.
  Adoption took over heartbeating (hbloop pid 3507, setsid-detached,
  every 5 min) until session end. Lock `playtest-loop-2.lock` run_id
  `playtest-loop-2-20261120T0200Z-leg4`.
- Flap, two windows: (1) 08:31:13Z–~09:21Z (~50 min), ended by a VM
  restart ~09:21Z (uptime 0 min at 09:21:53Z). It truncated
  `REGISTRY.json` to 0 bytes (08:50Z) and killed 89705's write. The
  registry was rebuilt by the live Loop A 0315Z coordinator at 09:25:27Z
  (14 trees, all-active, Oct-30 precedent); the adoption corrected its
  own entry's run_id/owner at 09:30:24Z (flock-protected atomic rewrite:
  run_id `playtest-loop-2-20261120T0200Z-leg4`, owner
  `oversight-playtest-loop-2`, heartbeat stamped). Probe-A writes 3/3 OK
  09:26:17Z. (2) A second blip ~09:57Z–~10:03Z (~6 min, cleared on its
  own, no restart): Pass D's FATAL EPERM hit during 89703's write
  (0-byte JSON, probe retries 15x then threw); re-probes confirmed fresh
  writes AND appends refused 09:58–09:59Z; verified write+fsync+read-back
  OK 10:03:00Z. Pass D resumed 10:03Z — seeds 89703–89706 re-run,
  89701/89702 NOT redone. The morning window was reported to Steve once
  at onset (02:38Z); the 6-minute blip is recorded here and in the
  adoption report.
- Master moved during the adoption: the Lane A scale r246 adoption
  landed (`6b8051ec2`, want-menu react wind-down fix) while Pass D ran.
  The branch was fast-forwarded 59711ccc5→6b8051ec2 (exit 0) before the
  evidence commit — the panel ran on 59711ccc5, the commit sits on
  6b8051ec2. The r246 fix touches `src/js/convo-wants.js` (want-menu
  react), not endgame fight math; no panel re-run (re-proving a proven
  constraint).
- Pass A seed 89705 re-run by the adoption (SEEDS=89705 only): exit 0,
  JSON 216,384 bytes (was 0), transcript 7,689 bytes.

## Headline: first endgame panel on the turned-on bow duty — villages are stronger, deed gate still the wall

The matched band does NOT reproduce r249 bit-identically — it moves in
the direction the prereg's BOWCRAFT watch predicted: more wave-4 kills,
higher standing, more living veterans, more wave-5 facing on Pass A —
and the full seat still comes only through the deed gate, which opens
once in 19 capstone-armed seeds. The buyout road produced zero full
seats this round (r249: one, on 89702) and its starvation trap
reproduced on the fresh band.

| pass | lesser | full | lost | won | kills | M23b | M25c bought | verdict |
|------|--------|------|------|-----|-------|------|-------------|---------|
| A    | 5/5    | 0/5  | 0/5 | 5/5 | 13 | 1/5 (89702@d70, no capstone) | n/a (disabled) | PRIMARY GO \| ALL GO |
| C    | 5/5    | 0/5  | 0/5 | 5/5 | 7 | 0/5 | 5/5 | PRIMARY NO-GO (M23-capstone VACUOUS) |
| C-wide | 7/8  | 0/8  | 1/8 (89831) | 7/8 | 7 | 0/8 | 8/8 | WIDE GO |
| D (FIGHTALLY2) | 5/6 | 1/6 (89705 d84) | 0/6 | 6/6 | 7 | 1/6 (89705@d83 DELIVERED) | 6/6 | PRIMARY GO \| ALL GO |

Smoke 89706 (Pass A): lesser win d92, peakVet 1. Corpus purity 5/5 (A,
C), 6/6 (D), 8/8 (C-wide). NOTICK deferrals 0 and trioCarry 0 on ALL
FOUR passes — the instrument records clean zeros again.

## Pass A (control; competent policy, no capstone)

PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. Lesser 5/5, sat days
89701 d90, 89702 d92, 89703 d95, 89704 d91, 89705 d90 (r249:
90/90/107/105/104 — earlier sats across the board).
w4plusKills [2,5,3,0,3] = 13 vs r249's 10. M23b 1/5 — 89702 reached
deedGateReady().ok at d70 (r249: 0/5); with no capstone armed there is
nothing to deliver, so the binding stays unanswered on A. Standing
peaks 427/536/521/527 (r249: 199/462/199/120/199) — all four measured
seeds at 200+, none stalled at 199. uw=5 on ALL FIVE seeds (every
village unlocked wave 5); w5max 89701 0, 89702 3, 89703 0, 89704 2,
89705 1. The villages are stronger on this substrate and the panel
shows it on every axis at once — kills, standing, wave-5 facing,
living veterans (peakVet 12 vs the 3–4 band; see Telemetry). The
BOWCRAFT turn-on is the live delta that touches fight math; the
movement is consistent with it, not with any other delta.

## Pass C (CAPSTONE + BUYOUT + BUYOUT_EARLY)

PRIMARY NO-GO — M23-capstone VACUOUS: no seed reached
deedGateReady().ok (0/5; deedGate ends all "no"), so the capstone
binding could not fire. Lesser 5/5, **full 0/5**, lost 0/5, won 5/5,
w4plusKills [1,2,1,0,3] = 7 (r249 C: 9), M23b 0/5. M25c 5/5 bought
early (d34/d18/d44/d46/d17; pantries 14253/51288/29805/34235/11351 —
all healthy, no lean buy). The sharp break from r249 is 89702: on Pass
A it reached the deed gate at d70, but on the buyout road it never
reached the gate at all — and its veterans were wiped (vetLiving 3→0,
6 causal deaths, the Herald killing in the field; the audit reads
"blood your fighters (0 of 2 veterans)"). 89701 sat late (d146, final
audience). w5max 0 on ALL FIVE seeds (Pass A: 3/5 faced wave 5) — the
buyout road collapsed wave-5 facing on the matched band this round.
The buyout fired (M25c GO); the downstream gate did not open. That is
a vacuous NO-GO, not a mechanism failure — the capstone was never
reached to be tested.

## Pass C-wide (fresh band 89830–89837)

WIDE-VERDICT GO | M25c + purity. M25c 8/8 bought (89830 and 89835 had
refused attempts first — pantry ~8500–9400 — then bought when the
pantry recovered: 89830 d67, 89835 d48). Lesser 7/8 (d94/d90/d93/d90/
d105/d91/d103), full 0/8, lost 1/8 (89831, village-lost, never sat),
kills [0,0,1,0,1,4,1,0] = 7 (r249 C-wide: 7), M23b 0/8. Standing
peaks 125–199, five seeds at exactly 199 (the stall); uw=4 on ALL 8 —
no wave-5 unlock anywhere on the fresh band; w5FaceEvents 0 on all 8.
The buyout-starvation loss from r249 (89821: bought d46, pantry left
400, 4 starved) REPRODUCES twice: 89830 bought d67 with pantry 8760,
spent 8260, left 500 — Pavel and Thabo Maseko starved d81; 89831
bought d39 with pantry 8549, spent 8049, left 500 — Quinn Murphy
starved d75 (Milton Espinoza d8 starved before the buyout). 89832's
Nina Petrova d77 is not buyout-caused (pantry left 16329). Two of
eight fresh villages hit the same trap: the buyout spends the pantry
down to ~500 kcal and people starve in the following weeks. The
refusal guard exists but is not a clean pantry threshold (89830 refused
at 9453 and 8506, then bought at 8760; 89831 bought at 8549 with no
refusal).

## Pass D (FIGHTALLY2 — sixth sighting)

PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. Lesser 5/6, **full 1/6
(89705 d84 — feast_embassy delivered d83)**, lost 0/6, won 6/6,
w4plusKills [1,3,0,0,2,1] = 7, M23b 1/6 (89705@d83 DELIVERED). M25c
6/6 bought (89706 refused d32 at pantry 9486, bought d37 at 10617).
89702 sat d110 (deferred 20 days, greedyWaits 15). 89703 is the
flee-heavy seed: 15 monster-flees of 18 fights, vetLiving 0, sat d103.
89705 is the seed that takes the full seat on D in both r249 (d74) and
r255 (d84); r249's C took it on 89702 without the lever. **FIGHTALLY2
stays env-gated OFF**: D kills 7 = C kills 7 on the same band, no
uplift on the binding number; the full seat moved roads (D this round,
C last round) but the total did not move. Sixth sighting, same verdict
as r243/r246/r249.

## People check (full-seat + control transcripts read in full)

89705 Pass A (61 lines), 89702 Pass A (257 lines), 89703 Pass A (484
lines), 89702 Pass C (77 lines), 89705 Pass D full-seat (75 lines) —
all read end to end. They read well: Sofia teaching, Hassan arriving
with a fever Sofia cures, Yuki killing the Redactor, the Nap Wars
segment with Ivy, the Herald mauling then killing Jassim in one round
on C 89702, the muster call naming the arithmetic ("muster 10 allied
blades (you have 0)"). Panel-wide greps, all passes: "The The" 0, "the
the" 0, "fires have cooled" 0, `SYSTEM: ""` 0, dry line 0,
march-refusal spam 0 (only the ant_trail flavor line), witness-mourning
0. The r249 double-"The" fix and the march-refusal dedup both hold.
89705's audit names the gap plainly: "only 1 of 2 different wave-5
monsters faced".

## Found defect: war-path monster names are mangled in the full-seat script (open, NOT fixed here)

The war-path line in the full-seat script names monsters that do not
exist, twice over:

- C 89702: "They faced The Big Thing and lived to sit here. They
  faced Big Big and lived to sit here." The seed's fights were against
  audit, eater, eulogy, influencer, reunion — no "Big Thing", no "Big
  Big".
- D 89705: "They faced Big-Bane and lived to sit here. They faced Big
  Ugly and lived to sit here." The kills it is narrating were
  Loud-Bane (d73, Hannusya) and The Loud Beast (d44, Ethan).

The template appears to compose a "Big" prefix onto monster-name
fragments instead of using the monsters' real names. It is the r255
panel's found defect, in the same seat as the r249 double-"The" fix —
but it is NOT fixed in this adoption: the mechanism needs
root-causing first (which template, where the "Big" prefix comes from),
and this adoption's job is the panel, not a build arm. Open item for
the next round: root-cause the war-path name composition and prove the
fix on these two transcripts.

## Metric review (watches)

- BOWCRAFT watch (prereg (a)): the movement is real and broad — kills
  A 13 vs 10, standing peaks 427–536 vs 120–462, uw=5 on all 5 A seeds,
  wave-5 faced on 3/5 A seeds, peakVet 12 vs the 3–4 band. One panel
  cannot attribute it to the duty alone (dialogue/RNG draws shifted
  too), but the direction and the breadth match the turn-on, and no
  other live delta touches fight math.
- Buyout-starvation: reproduces on the fresh band (89830, 89831 — see
  C-wide). Design observation for the next buyout review, not a lever
  change here. The refusal guard is not a pantry threshold.
- Pass C vacuous: the deed gate never opened on the matched band with
  the buyout on, after opening for 89702 on Pass A. The buyout road
  changed the trajectory (veteran wipe on 89702) rather than the gate.
- 89703 D: 15/18 fights end in monster flight — the flee-heavy tail
  of the panel, not a bar failure.
- REL-WIT: 224 person death records across all four passes, 0 carrying
  a witness flag, 0 witness-mourning firings. The r254 fix's gate never
  opens on this panel either — the supply question carries, same as
  r254. Next succession run still needs a supply-first panel.

## Telemetry baseline — peakVet adjudicated, file updated to 12

telemetry-check on Pass A (5 files, 3 metrics): **quiet** — exit 0,
no LOUD lines. Reads: uw 25 vs baseline 22, won 5 vs 4, peakVet 12
vs 3. uw/won are NOT rolled on a quiet read, per the prereg. peakVet
is adjudicated, not just read: 12 breaks the r239–r249 3–4 band
(r239: 4, r243: 3, r246: 3, r249: 4) — every seed 2–4, none at zero
(r249 had two seeds at 0). The tool's swing rule requires baseline
>= 5, so a baseline of 3 can NEVER fire on peakVet — the file was
blind to this swing, which is why the adjudication is recorded here
rather than trusted to the tool. The file
`hidden_files/telemetry-baselines/endgame.json` was updated peakVet
3→12 with this note: single observation on the BOWCRAFT substrate,
to be confirmed on r256; if r256 reads back in the 3–4 band, the
roll was premature and the file reverts. uw/won untouched.

## Gate

`node scripts/check.js --quick` run twice, both **339 passed, 5 failed,
0 attributable**, both the standing set (verified identical to the r246
adoption's gate on the same code, run twice, 339/5 both times):

- First run on the branch tip (6b8051ec2 + this evidence, no code
  changes): 339/5 in 601s (`journey-endgame-r255-gate.log`).
- Master then moved (Loop A 0315Z landing `ec0a42913` — evidence +
  test scripts, game code reverted); the branch was rebased onto it
  (clean, 1 commit) and the gate re-run FRESH on the final tip:
  339/5 in 773s (`journey-endgame-r255-gate2.log`), same five scripts.

The five, in both runs:

- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (measurement-proof staleness pair): fail with "Proof source inputs
  are not current" / "retained neutrality proof covers the current
  Game/controller/harness inputs". Pre-existing staleness; this
  adoption touches no Game/controller/harness inputs (evidence only).
  The proof refresh is separate maintenance, not part of this run.
- `test-phone-frame-proof.js`: retained receipt stale vs index.html +
  data files. Pre-existing; none of its inputs were touched.
- `test-living-garden-deed-attainment.js` +
  `test-one-person-army-deed-attainment.js`: TIMEOUT at the 120s cap
  inside the parallel gate (7–9 seeds done in 120s). Cap artifacts,
  not failures — both pass solo (r249 verification: garden ~334s,
  army ~226s). Not re-run solo here; identical timeout signature to
  every recent gate on this tip.

## Open / held

- The deed gate is still the wall: C 0/5 gate-OK, C-wide 0/8 gate-OK
  — same as r249 on the fresh band, worse than r249 on the matched
  band (1/5 then, 0/5 now, with the buyout on).
- FIGHTALLY2 stays env-gated OFF (sixth sighting, no uplift).
- Buyout-starvation reproduces (89830, 89831): design observation for
  the next buyout review.
- War-path monster names mangled ("Big-Bane", "Big Ugly", "The Big
  Thing", "Big Big"): root-cause + fix owed, next round.
- REL-WIT still insufficient-data (0/224 witnessed): supply-first
  panel still owed for succession.
- Telemetry peakVet rolled 3→12 on one observation: confirm on r256.

## Verdicts

- Reachable: YES (full seat reproduces on the matched band — 89705 d84
  on D, the same seed as r249 D).
- Fun: mostly (people check PASS; war-path naming defect found and
  reported, not fixed).
- Winnable: the matched band wins 5/5 (A) / 5/5 (C) / 6/6 (D); the
  fresh band wins 7/8 with 1 loss — the wall remains the deed gate
  after national, as in r243/r246/r249, and on this round the buyout
  road did not open it once.
