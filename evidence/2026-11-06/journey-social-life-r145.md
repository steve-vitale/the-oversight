# Journey social life r145 — run note (Lane B, 2026-11-06)

Leg 5 (social life). Seeds 42001–42004, DAYCAP 140, policy journey
(socialite base + real conversations). Base: master cc4345e1e (post-r144
endgame closeout; includes smallfixes pocket_sand flee-order +
raid-cooldown). Prereg: `journey-social-life-r145-prereg.md` (seed band
42001–42004 verified fresh, full-scope check). The coordinator timed out
at the 3600s hard limit; the gate, run note, commit, merge, and release
were completed by the main session in closeout.

## Panel

All 4 villages LOST, d58–d63 (42001 d58, 42002 d59, 42003 d63, 42004 d60).
0/4 past d100 — sixth consecutive short panel (sequence 1/4, 1/4, 0/4,
1/4, 0/4, 0/4). Full convs 40/37/?/56; natural ends 36/31/?/56.
Deaths dominated by the wild (11, 7 on the two read seeds) + monsters.

## Pre-registered verdicts (BINDING, §14)

- **M1 arming motive — GO.** 2 plots, both grievance-linked at arming
  (d7 Raj→Ava, grievance; d8 Carlos→Hank, grievance+prove). No plot
  armed after d30 (drought bound not re-broken, not re-confirmed).
  Grievance-holder → later leader: 0 cases. Accomplices cold while
  leader hot: not broken (accMotives grievance 0 on both).
- **M2 villager-initiated bonds — still open (seventh datapoint).**
  propose* calls 0 across the panel; lure NPC:accept 2; end bonds
  [64, 49, 79, 60]. No villager-initiated bond proposal occurred.
  Bond records STILL carry no initiator field — NPC-initiated
  formation cannot be inferred from end bonds (carry-forward from
  r141/r144, still open; the bond-initiate build's panel needs it).
- **M3 invite refusal — report only.** Party decline 14 / accept 10;
  lure accept 2 (both NPC-invited, by bearer).
- **M4 sense — GO.** Two talk-request transcripts read as real people
  (Ines: florist reading people, Lisbon songs; Oliver: "Trust is slow
  out here. It's the one thing the System can't grant us."). Endings
  resolve. Caveat: the goal-thread generic-reply pattern RECURS —
  "Tell me more" ×6 in the Oliver thread, "Take your time" ×3 in the
  Ines thread. The menu code read was not completed before timeout;
  a quick grep shows the goal-thread reply path defaults to generic
  "Tell me more" labels while a deflect choice exists in the question
  flow — whether it fires on leadership bids is unverified. HELD for
  design decision, not a wiring bug proven.
- **M5 census guardrail — fails.** 0/4 past d100: all dark-channel
  verdicts are within-window only, reported that way.
- **M6 gossip-position — NO-GO.** 30 burstAway lines emitted while
  away across the panel (6, 8 on the read seeds; settle/witness/tale
  0 away). Mechanism FULLY DIAGNOSED: the sim-awaynaming-cap-a gate
  uses `playerAtHaven()` (radius-1) while the metric's strict test
  uses `scholarAtHaven()` (on-tile) — lines emitted from one tile out
  count as away. Resolution deferred to design call.
  Debates alive, not silenced: 109 kicked, 108 settled.
- **M7 dedupe fix holds — HOLDS.** 0 of the 44 M4 near-dup flags sit
  in a fixed pool. All 44 are in pools left as legitimate variety
  (B-first-meeting, C-friendship, D-talk-request same-openings).
  The fix is not reopened.

## Job C — full-pool convo dedupe scan + fix

Scanned all 89 pools / 968 lines in src/data/characterGen.json.
1 exact-dupe adjudicated NOT a defect ("Yes." offered by two different
questions, never co-present). 42 first-3-word collision groups: 13 true
same-beat pairs fixed data-only (committed 06f91b363, proof RED→GREEN);
29 same-opening/different-beat groups left as legitimate variety.
Cross-structure near-dupes found late in the run: 16 goalFollow lines
rewritten (this closeout commit), proof test extended to the
cross-structure band. Full-pool scan after the fix: 33 collision
groups, no new groups vs the r145 baseline. Proof
`scripts/test-convo-dedupe-r145.js`: PASS — 88 pools, no exact dupes,
13 removed lines gone, 13 replacements present, all fixed openings
unique, 16 cross-structure lines gone, 16 replacements present, no
def/follow same-beat pair.

## Gate (closeout, main session)

`node scripts/check.js --quick` in this worktree, post-rebase onto
30fe8dc00: **280 passed, 10 failed in 1250s**. All 10 failures are
the standing set, adjudicated: measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof (stale phone receipt; characterGen.json is listed
among its boot inputs because this run changed it — the failure is
the standing receipt requirement, not a content regression),
establishment-r20-fixes, measurement-cache-flags (intermittent
under load), and 120s timeouts on trust-observer-neutrality,
synergy-stall, capable-bot (capable-bot is a base failure).
No failure touches a r145 file. Dedupe proof re-run post-rebase:
PASS (88 pools). r108 pkeep test (new file from master): 13/13.

## Telemetry

Social baseline `telemetry-baselines/social.json`, l3.* metrics:
LOUD-disappeared l3.* lines confirmed as known schema drift (the
social driver never emits l3.* fields), no other LOUD lines.
Baseline NOT rolled on a single 4-seed panel.

## Reachable / fun / winnable

- Reachable: social content fires (40–56 full conversations per
  village, moots 1–2, plots arm and spring) — but only inside a
  ~60-day window; no village lives to see late social content.
- Fun: the conversations read as people, with real wants and
  resolving endings; the generic-reply loops ("Tell me more" ×6)
  are the visible drag.
- Winnable: not judged by this leg; survival (0/4 past d100) is the
  standing wall, not a social finding.

## Metric review

- M6's radius-1 vs on-tile mismatch is a metric/instrument
  disagreement, not a game-behavior finding: the gate and the metric
  ask different position questions. The next run should align them
  (or pre-register which one judges) before re-scoring M6.
- M4's near-dup scan flags same-openings in variety pools at a steady
  rate (44 flags / 185 transcripts) — the flag rate is a variety
  measure, not a defect count; do not read it as 44 defects.
- M5's short-panel sequence is a standing survival fact (sixth
  consecutive); the social leg cannot judge late content until
  villages live past d100.

## Carry-forwards

- Bond records need an initiator field before the bond-initiate
  panel can judge NPC-initiated formation (r141/r144/r145).
- M6 design call: align the awaynaming gate (radius-1) with the
  metric (on-tile), or pre-register the radius-1 reading.
- Goal-thread generic replies: held for design decision (r144/r145).
- Cross-structure dedupe scan is a new check worth keeping in the
  dedupe proof (16 lines caught that the same-beat scan missed).
