# Loop A round fleshout-20261118T2015Z — scale-onramp (TIMEOUT ADOPTION CLOSEOUT)

Run fleshout-20261118T2015Z, Loop A, axis scale-onramp. The scheduled
execution hit its 2h timeout and stopped with arm 1 landed and arms 2–3
incomplete. This adoption finished arms 2–3, wrote the round evidence,
and closed out. All three arms LANDED; nothing held.

## Arm 1 — sim-partyform-diag-a: DIAG GO, LANDED `c0151cb53`

Finding #2547 diagnosed: why a party-stage plan finds no companion in
35 days. Four distinct failure shapes across 9 seeds (104601–104608 +
104708, 150d, competent, VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
WILDAVOID=1 WILDSEEDPLAN=1), no game-code change. The seedplan fix
stays HELD on branch sim-wildavoid-seedplan-b, untouched; the
diagnostic-only staging was reverted before commit.

- **Shape A — the leaver (#2560):** Yuki Mori (104607) holds a
  party-stage plan 35 holder-days (d106–140, exact reproduction) and is
  never scored once — 0 `objPick`, 0 `vbrainScorePick`, 0
  `winPlanDepart`, 0 `winPlanHavenTick`. Her away entry is
  `{purpose:'leave', sinceDay:1, duration:999}`; she is never at Haven.
  Root: `winPlanSeedFromFight` seeds plans onto any villager who
  flees/avoids a wave-3+ beast, including one who left on day 1; the
  plan machinery never sees a villager who is away. Correction to the
  1515Z reading: `dawnbidCensus` is a plan-existence census, not a bid
  record — the plan existed 35 days and was never scored, which is worse
  than a failed bid. The fiction disagrees with the mechanics: she is
  vividly present in village talk through d133 while the plan system
  treats her as gone since day 1.
- **Shape B — scored, pool empty, ranger-gated (#2561):** holders scored
  against an empty pool — `findCompanion` requires profile
  wanderer/explorer; the trusted, present, armed villagers are foragers
  and homebodies. desmond_clarke 6d (25 `notRanger` first-fails),
  katarina_novak 9d, dmitri_sokolov 50d (41 score calls, 40 `party_wait`
  acts, eligible 0/50).
- **Shape C — scored, companion found, holder range-0 (#2562):**
  david_kim 97d, 91 score calls, 15 `party_launch` score actions, 32
  `vbrainExecuteDepart` calls all returning `hold`, block `range-0` on
  97/97 days. Profile homebody → `npcMaxDist` 0. The plan stages and
  even launches, but the holder physically cannot depart.
- **Shape D — the scholar-holder (#2563, confirms #2542):** oliver_moore
  43 holder-days; his forage away entry froze 25 consecutive days
  (d101–125) after succession made him the player character around
  d100 — every NPC system skips `villagerId`, so his away entry never
  processes and never returns. A scholar-holder's expedition never
  returns: the concrete cost of #2542's open Steve-call.

Secondary: `winPlanSeedFromFight` fires twice per flee (idempotent
retarget, harmless). Proof `scripts/test-partyform-diag-a.js` ALL PASS.
Full detail: `evidence/2026-11-18/sim-partyform-diag-a.md`.

## Arm 2 — sim-foodgate-instr-a: GO, LANDED `a531ed8be`

Carrier food-gate instrumentation (finding #2557-A — the Loop B reuse of
#2557 the same day is a different finding, the post-quad launch
drought; this arm cites #2557-A throughout). The instrument lands on
master on its own (engine-side flags only, no behavior change) and
measures both gates with counts.

- Engaged held fights, arm leg (N = 11): tier gate 5/11 ever hit a
  tier-blocked round; hunger gate 0/6 among tier-unblocked; carrier
  fires 6/11. Never-fired decomposition (5): tier-denied 3,
  hunger-denied 0, trick-displaced 1, other 1 (won too fast for Rage
  to matter).
- Ctl leg (real Rage, N = 22): tier 5/22, hunger 1/17, fires 9/22 —
  the gates bite real Rage too, at lower rates.
- Panel (§15): `review_required` — investigated, not a re-score. Every
  observed metric identical (village deaths 85.75 = 85.75, community
  loss 0.375 = 0.375, survival 1 = 1); the label is the screen-only
  caveat, no material signal.
- Sense test: a fired fight narrates Rage ("Desmond's eyes go red.
  Next 3 strikes hit twice as hard. (Rage)"); tier-blocked fights
  narrate ordinary strikes with no contradiction — but the gate is
  silent in narration, a gap for the carrier retune, not an instrument
  defect.
- Proof 38/38 GREEN; analyzer selftest 17/17 GREEN (both re-run on the
  rebased tip at adoption).
- Metric review: tier-blocked-round ≠ fight-denied — 2 of the 5 blocked
  fights still fired later, so per-fight denial is 3/11, not 5/11.
  Hunger gate never bit on the arm leg (0/6, small denominator; ctl
  shows 1/17 — real but rare on this band).
- Full detail: `evidence/2026-11-18/sim-foodgate-instr-a.md`. The
  carrier staging lived in scratch tree sim-foodgate-measure only
  (verified byte-identical to the committed files, then removed); the
  pristine corpus was deleted after the panel build.

## Arm 3 — sim-ladderbase-cause-a: GO, LANDED `3523b2303`

Ladder-bundle control root cause (finding #2559-A). **Finding #2559-A
is CLOSED as a control defect, not a game defect.**

- Root cause: `dc8cbd3f3` (2026-11-15, "linger holds the treeline")
  added `if (m.lingering) return;` to `monsterTurn()`'s ambient-contact
  path — deliberate design (CASCADE, Steve 2026-10-16 design call #8).
  The ladder-bundle test (introduced 2026-11-08, claiming green) set
  `m.lingering = true` in its control rig and looped `monsterTurn()`
  200 times expecting the ambient raid — a rig that was true when
  written and impossible after the guard. Section C could never fire;
  section A passed vacuously.
- Fix (test rigs only, NO game code): remove `m.lingering = true`
  from the ladder-bundle mercy rig (`08cab0c98`); regression test
  pinning the distinction (`16313a16f`, GREEN); sanctity-gate rig
  un-linger in sections A and E (`3523b2303` — the adoption found the
  sibling E2 failure the arm worker left uncommitted: the HEAD version
  of the sanctity test fails E2 on master, verified by running it).
- Verification on the rebased tip: ladder-bundle 79/79 (was 78 + 1
  failed), lingering-raid-control GREEN, sanctity-gate GREEN (was RED).
- The gate's standing "ladder-bundle control" failure should clear on
  the next full gate run; if it does not, the failure moved and needs
  re-adjudication.
- Full detail: `evidence/2026-11-18/sim-ladderbase-cause-a.md`.

**Numbering note:** two different findings were called #2559 the same
day — the ladder-bundle control failure (1715Z round's usage, now
#2559-A to disambiguate) and the quad-fights cap (Loop B partysize4-b,
line 2564 of the findings file). They are distinct findings; #2559-A
is the ladder one and it is closed. The quad-fights #2559 stays open.

## Wall (pooled across the run's sims)

Foodgate band 104601–104608, 150d, competent (ctl leg = master +
instrument, the honest master read): survived 5/8, wave-4 8/8, wave-5
6/8, national 0/8, table 0/8, wins 0/8, median survival 150d. One
seed reached standing 600 (regional rank — national is not standing
alone). Partyform band (9 seeds incl. confirm 104708): survived 4/9,
lost d64, d65, d100, d111, d126.

The wall stands where the 1715Z round left it: national 0, table 0,
wins 0. What moved is the diagnosis, not the wall: party formation
fails at four different gates the plan system never checks (#2560–
#2563), and the carrier's non-fires now have counts (tier-denied 3,
hunger-denied 0, trick 1, too-fast 1).

## Findings

- #2547 DIAGNOSED (four shapes) — design calls now owed, not
  measurements: (a) seed only onto villagers actually in the village
  (or re-check holder presence at dawn); (b) widen `findCompanion`
  beyond ranger profiles or score the holder's range at staging;
  (c) decide what a scholar-holder's plan should do (#2542's open
  Steve-call, now with the frozen-away-entry cost attached).
- #2557-A measured (GO) — next carrier retune argues from 3/11
  tier-denial, not 5/11 ever-blocked; hunger-gate rate needs a
  hungrier band.
- #2559-A FIXED (ladder-bundle control) — closed as a control defect.
- #2560 / #2561 / #2562 / #2563 appended (party-formation shapes).
- #2559 (quad-fights cap) stays OPEN — belongs to the fightcap arm.

## Gate

`node scripts/check.js --quick` on the final tip (branch
sim-winnability-round-2015, master a531ed8be + this evidence file,
which cannot change test outcomes): **339 passed, 5 failed in 689s,
0 attributable.** Full log:
goal `hidden_files/evidence/2026-11-18/sim-scale-onramp-round-2015-gate.log`.

1. `test-measurement-proof-update.js` (exit 1, 1.4s) — "Proof source
   inputs are not current". Standing staleness pair, part 1.
2. `test-measurement-workflow.js` (exit 1, 1.1s) — "retained
   neutrality proof covers the current Game/controller/harness
   inputs". Standing staleness pair, part 2. Both were already failing
   in the 1735Z round's gate (338/6) before this run's arms landed,
   so they pre-date this run; the foodgate instrument changes no
   behavior and creates no new staleness cause. The neutrality proof
   needs a refresh (`balance-proof-update.js`) — standing maintenance,
   not an adoption task (it would re-baseline measurement).
3. `test-phone-frame-proof.js` (exit 1, 1.9s) — phone receipt stale
   (index.html + data files). Standing.
4. `test-living-garden-deed-attainment.js` (TIMEOUT 120s) — passes
   solo in 63s with a 240s window (exit 0); load artifact under the
   4-parallel run.
5. `test-one-person-army-deed-attainment.js` (TIMEOUT 120s) — passes
   solo (exit 0); load artifact.

**Ladder-bundle control: CONFIRMED FIXED.** It is absent from this
gate's failure list — it was failing in the 1735Z round's gate and in
the 1715Z round's gate, and now passes (79/79 in the arm's
verification, green here). The standing "ladder-bundle control"
failure is cleared. No cache-flags failure this run.

## Telemetry

Deviation check attempted against the scale-wall baseline
(`hidden_files/telemetry-baselines/scale-wall.json`, winseat regime:
national 12/16, table 16/16, wins 16/16): **telemetry-check refused
the recorder corpora** ("all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs"), as in
prior rounds. Baseline NOT rolled — and must not be: the baseline's
own note forbids comparing pre-seat substrates against it (wins are
structurally ~0 there; a forced compare would fire a spurious LOUD
"wins disappeared" regime artifact). No deviation line to
investigate; the wall numbers above are read from the committed
sweep-compare corpora directly.

## Closeout (adoption)

- Arm 1 already on master at adoption start (`c0151cb53`).
- Arm 3: sanctity-gate rig fix found + verified by the adoption (HEAD
  version of the test fails E2 on master; fixed version GREEN);
  landed as `3523b2303` on master, merged ff-only exit 0 by the
  adoption (the arm-branch commit `efafcf788` rebased into it; the
  deepening r238 run later branched from that tip). Safe-commit index
  clobber struck; repaired via the ls-tree -r pipe, blobs verified.
- Arm 2: balance-panel compare run by the adoption
  (`review_required`, investigated — no material signal); evidence
  merged as `cedbe56f2` (rebased from `a531ed8be` onto the r238 tip
  `8aa995d3b` after master moved under the adoption; final merge
  `1dc8b1641`), merged ff-only exit 0. Pristine corpus deleted;
  scratch tree sim-foodgate-measure verified byte-identical to the
  committed files and removed. Safe-commit index clobber struck;
  repaired via the ls-tree -r pipe, blobs verified.
- Worktrees sim-partyform-diag-a (already released by the run),
  sim-ladderbase-cause-a, sim-foodgate-instr-a, sim-foodgate-measure:
  all released, removed, branches deleted. No HELD work from this run
  except the pre-existing held branches (seedplan-b, fieldcarrier-a),
  untouched.
- Lock `fleshout-20261118T2015Z` deleted last after run_id
  verification; claim `fleshout-20261118T2015Z.json` retired to .DEAD.
  Main tree clean at closeout.
