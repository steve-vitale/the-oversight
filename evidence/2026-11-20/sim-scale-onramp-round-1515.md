# sim-scale-onramp-round-1515 — ADOPTION RUN (Loop A, fleshout-20261120T1515Z)

**Axis:** scale-onramp (converging, NOT converged). **Run type:** adoption of the
dead 1315Z run — both its arms finished in place, nothing re-done, nothing lost.
**Master at run start:** 0106e423c (Loop B 1230Z round record). **Master at closeout:**
85115230d (presence-a 34c28809d + evade-a 85115230d, both merged locally, pending ship).
**No push, no version bump, no live verification** — the ship loop owns deploys.

## Stale-lock recovery

Lock `fleshout-20261120T1315Z` (created 13:15:54Z) found at run start. Its trees'
heartbeats were 14:14:38Z/39Z (>15 min stale), both its workers were `done` with
timeout reports, no live coordinator processes, no running subagents from that run.
Dead by every guard. Lock deleted (same-call cat + delete), claim retired to
`.DEAD`, my lock + claim written (`fleshout-20261120T1515Z`, 15:27:21Z).
Pre-flight: main tree clean, disk 48%. `worktree-reap.sh` skipped — registry lock
held by a concurrent sibling reaper run; no cleanup this run (no dead trees of
mine to reap; the two adopted trees were live-registered).

## Host write flap

A write flap (EPERM on fresh-file writes, 0-byte files left behind) was ACTIVE at
run start: probes failed 15:20Z in workspace, /tmp, and .git. It cleared between
15:20Z and 15:26Z; every later probe passed (3/3 before each worker's first commit,
3/3 before each rebase). The flap is what killed the 1315Z run (its workers timed
out ~14:14–14:30Z during an earlier window; Loop B's 1430Z run also stood down on
it, flap active 14:51–15:13Z). No work was lost to it this run: the one flap
casualty found in the adopted trees was `scripts/build-evade-panels-a.js` at
0 bytes — rewritten from the depmat clone before the pilot.

## Arm 1 — sim-presence-a: NO-GO (PARTICIPATION, bar 4 also fails)

Branch `sim-presence-a`, landed 34c28809d (prereg 4feb8ca41 + evidence+instrument
commit 353a62c5b rebased twice). Evidence: `evidence/2026-11-20/sim-presence-a.md`
(+ prereg, analysis, panel, 16 per-seed corpora). Instrument only — `src/` is
byte-identical to master; the lever leaves no trace. 8 seeds × 2 legs, band
107051–107058, 150d, competent. Control reproduces the cellgate ARM corpus
exactly (fidelity PASS).

| Bar | Ctl | Arm | Result |
|---|---|---|---|
| 1. Holder-days ≥ 40 | 194 | 194 | PASS |
| 2. Armed entries ≥ 3 | 2 | 2 | **FAIL** |
| 3. Armed volleys ≥ 2 | 1 | 2 | PASS |
| 4. Guardrail, strict 1.00× | 3.95 | **4.22** | **FAIL** |
| 5. Starvation ≤ ctl+2 | 4 | 4 | PASS |

The draft worked — once. Seed 107057, day 87: naran_tumen, adjacent with a loaded
searcaster, was drafted into the lead of the Algorithm fight instead of yara_haddad
(who dies in round 1 on control). He fired the second armed wave-4+ volley in
finding #2599's history (2 shots, 1 hit, 64 dmg), fought 7 rounds, called for help,
and the party fled alive. But one fire converts an existing entry (ally → lead)
rather than adding a third, so bar 2 misses by one entry for the third consecutive
arm. Bar 4 fails on the same single seed: the skipped pick draw shifted the RNG
stream (+10 deaths, meetings 59→49, standing 650→525); the drafted fight itself
saved lives. Seven of eight seeds are byte-identical between legs. Panel (§15)
`review_required` on deaths regression_watch, corroborating the frozen guardrail.

The binding constraint moved again — to contact: the holder is never on a wave-4+
monster's tile at tick time (`poolOnTile` 0/12,529 rows); only ~22 distinct
world-tick fights in 8 seeds had a holder pooled at all. Transfers: 0 in 16 seeds;
three gun vanishes repeat exactly on both legs (finding #2624 answered: the vanish
is deterministic and lever-independent; its sink is still unrecorded). Wall:
national 0/16, table null (not instrumented), wins 0/16, wave 5 6/16, median 146d
both legs. Five findings appended to `sim-findings.md` (draft telemetry, contact
pool, vanish/transfer closure, strict-guardrail cascade proposal, bow-generic
volley narration).

## Arm 2 — sim-evade-a: NO-GO (consistency + guardrail fail)

Branch `sim-evade-a`, landed 85115230d (3 commits: prereg+probe, lever+instruments,
evidence+revert). Evidence: `evidence/2026-11-20/sim-evade-a.md` (+ prereg,
analysis, panel, 8+8+2 per-seed corpora). Instrument only — `src/` byte-identical
to master; the lever leaves no trace. 8 seeds × 2 legs, band 107051–107058, 150d,
competent. Control reproduces the depmat ctl corpus on 7/8 seeds; seed 107055
flipped (survived 150d → lost d138) because the base moved (`db6f4d7ce`,
journey-scale r246 want-menu fix) between the depmat anchor and this run —
recorded, never re-judged; band-total deltas are entirely the 107055 flip.

| Bar | Result |
|---|---|
| (1) Pool floor, spearSeen ≥ 10 | PASS — arm 37 (ctl 104) |
| (2) Gate replication 1.000 both legs | PASS — 37/37, 104/104 |
| (3) Attributable-served ≥ 3 | PASS — arm 8, scopeLeak 0 |
| (4) Served-bow volley join ≥ 1 | PASS — arm 1 (107051 d35, Ximena, crude_bow, 2 shots / 2 hits / 27 dmg, 6 rounds, vFlee) |
| (5) Consistency | **FAIL** — departures 401 vs 481 (Δ 0.166 > 0.05); spearSeen 37 vs 104 (Δ 0.644 > 0.10) |
| (6) Guardrail, deaths/engaged | **FAIL** — 36.73 (808/22) vs 35.12 (878/25); absolute deaths fell, denominator thinned faster |
| (7) EVADEOBS mechanism ≥ 1 | PASS — arm 44; awareness-evades recording obs: ctl 0/46, arm 28/32 |

The evade wall is fixed as a mechanism: the closed loop (no trick → no seek →
evade → no observation) now opens in live play — 8 trick-learnings on outcome
'evade', trick-known species 4 → 7, trick holds 37 → 15, served leads engaged 3
vs evaded 2 (depmat arm: 0/5 engaged). The serve half is confirmed (8
attributable). But the pilot fails on the comparison itself: a day-2 lever
cascades the villages apart, and serving eats its own spear pool (a served
villager's slot becomes a bow, so spearSeen shrinks *because the mechanism
works*). Finding #2590 stays open. Panel (§15) `review_required`, 8 paired
cases; deaths/run 109.75 → 101, community loss 0.375 → 0.125. Wall: wave 4 8/8
both, wave 5 4/8 ctl / 5/8 arm, median 150d both, wins 0 (structural, pre-seat
regime), national/table not recorded on this driver. Sense-test: transcripts read
like people (Ximena's volley fight; trick-learnings voiced right); one gap — the
fight log doesn't mark the trick-learning moment (telemetry knows, story doesn't).

## Wall (this run's judged corpora, 32 configs)

National 0/32, table 0 (null — not instrumented on either driver), wins 0/32,
wave 5 reached on 15/32 legs, median survival 146–150d. Nothing reaches national
or the table on either band; both levers are killed cleanly on measured bars.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-20/perseed-presence-a-arm/*.json' --metrics
national,table,wins,exiled --sweep-rows --allow-recorder-corpus`: 3 LOUD lines
(national 12→0, table 16→0, wins 16→0). All three are REGIME artifacts: the
baseline's own `_regime` note forbids comparing pre-seat substrates against the
WINSEAT baseline ("wins are structurally ~0 there"). These corpora are
competent-only, pre-seat regime — no SEATDRIVE/WINPURSUIT stack — so national /
table / wins are structurally 0. Baseline NOT rolled. (The script refuses
recorder-corpus input without `--allow-recorder-corpus` by design; the §15 panel
compares are the instrument for these corpora.)

## Metric review

Both arms judged against frozen bars as written; no re-scoring. Two proposals for
the NEXT run, not this one: (1) presence — the strict 1.00× guardrail cannot tell
a harmful lever from an unlucky cascade (the whole bar-4 failure is one seed's RNG
cascade after a single skipped pick draw, while the drafted fight itself saved
lives); the next presence-adjacent arm should pre-register a guardrail that
separates the drafted fight's own outcome from downstream cascade. (2) evade —
the paired before/after design cannot survive a day-2 lever; the next arm on
#2590 needs a within-run judging design, and the serve/eat-own-pool effect
(spearSeen shrinking because serving works) needs a bar that doesn't punish the
mechanism for working.

## Infrastructure

- Master moved three times under this run (057bfa60f journey-social-life r256,
  0d38a74d1 journey-landing r149, plus the two arm merges); both branches rebased
  cleanly each time (presence twice, evade twice — the evade rebase hit the known
  sequencer quirk on pick 3 and recovered with `git rebase --continue` after
  verifying the pick unapplied, no todo edit, no abort). No overlap with either
  arm's files on any move.
- Safe-commit index clobber struck on both workers' commits (presence twice, evade
  twice); repaired via the `ls-tree -r` + `update-index --index-info` pipe each
  time, commits verified correct. The evade worker used `--force-delete` for the
  intentional NO-GO revert (mass-deletion guard) — the script's documented
  intentional path — after verifying `src/` byte-identical to master; flagged in
  its report, accepted here on that verification.
- Post-revert proof shapes confirmed on the merged bases (not regressions):
  presence gunrate 26/39, cellgate 9/12, presence 10/20, analyzer selftests
  47/47 + 45/45; evade 22/15, depmat 22/21 (43 is the total check count, not a
  pass count — the flag-on checks fail by design on reverted code), analyzer
  selftest 75/75. `check.js --quick` on the reverted trees: presence 334/10,
  evade 336/8 — the standing pre-existing profile (timeouts + stale retained
  proofs + measurement/phone-frame freshness on untouched inputs), none
  attributable to either arm; not re-run a third time.
- `/tmp` (512M tmpfs) hit 100% full mid-run (stale `/tmp/evade-old`, 409M) and
  was cleaned back to ~21% by the evade rebase worker; no sim output was lost.
  Nothing was deleted by the coordinator.
- Hygiene note: both workers' flap probes landed as `evidence/2026-11-20/
  flap-probe-*-{1,2,3}.txt` (6 files, committed with the merges). Probes belong
  in /tmp, not evidence/ — next run's brief should say so.
- The 1315Z run's own note: its workers did the build work; the timeout + flap
  stopped them before any pilot. The adoption recovered everything: presence
  prereg commit + lever code + 5 instruments; evade prereg + 2-seed probe +
  lever code + 4 instruments (minus the 0-byte panel builder, rewritten).

## Convergence state

scale-onramp stays converging (NOT converged): two supply/serve levers killed
cleanly on measured bars (presence: contact pool too thin + strict-guardrail
cascade; evade: mechanism proven, comparison broken); nothing reached national
or the table on either band. Next blanks, in order: (1) #2599 contact — the lend
(prereg shape (b), the gun to the fighters already going), weighed against
diagnosing the 21 distinct draft-miss pairs first; (2) #2590 — the ammo wall
(17/25 engaged meetings enter with 0 ammo) + the 35% roll (17/25 site servings
fail it) + a within-run judging design; (3) the standing walls — launch decision
+ damage, deed gate after national, standing-199 stall — unchanged by this round.
food-economy stays converging (untouched; sibling B loop works winnability chain).
Rotation left at 5 (convergence work does not cycle it). Claim deleted; lock
deleted.
