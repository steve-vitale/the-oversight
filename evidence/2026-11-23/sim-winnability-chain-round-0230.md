# sim-winnability-chain-round-0230 — Loop B 0230Z adoption

**Run:** `fleshout-loop-b-20261123T0230Z`, axis winnability-chain. The
scheduled occurrence timed out at its 3600s cap (~10:30Z) with Arm 2
landed and Arm 1's screen half-run. Adopted and finished by the adoption
coordinator: Arm 1's screen completed (band 2 finished, band 3 screened),
verdict adjudicated against the frozen prereg, evidence committed, proofs
re-run on the rebased tip, gate run, worktree released, claim retired,
lock deleted. All claims verified from git/files, not from worker reports.

**Base (worktree):** master `80e7da0bc` (journey-establishment r271).
**Rebased tip:** `4787c98a2` on shipped master `fdd7042b8` (see Arm 1).
**Zero `src/` changes across the whole round** — both arms are
instrument/evidence-only. No default flip anywhere.

## Arm 1 — sim-gateavoid-doorrich-b: DIAG-NO-GO on supply

Evidence: `evidence/2026-11-23/sim-gateavoid-doorrich-b.md` (prereg
`sim-gateavoid-doorrich-b-prereg.md`). Commit `4787c98a2` (branch
`sim-gateavoid-doorrich-b`, ff-merged [MERGE — filled at merge]).
The gate ran on its identical-content predecessor `93b1f3c49`; the
second rebase onto the shipped tip `fdd7042b8` (scale r273 + version
bump) changed no file in this commit — the ship diff is 10 files
(r273 evidence + new r273 scripts + index.html/sw.js/version.json/
build.js version tag), zero touches to this arm's instrument, to
check.js, or to `villager-agency.js` — so the gate result stands for
the merged tip per precedent, and the smoke re-run below confirms the
proofs on it.

The door-richer re-judge of the leader-projection gate — the 0030Z round
record's named next step after gateavoid-b NO-GO D1 METRIC-BROKEN (a
1-door 0%-bad pool). The question: on a band with more doors, does the
projection gate (refuse a door when the leader's projected HP after two
focused rounds is ≤ 25) reduce bad outcomes? The prereg freezes a screen:
at most 3 fresh 8-seed bands, judged only on the CONTROL probe; a band
qualifies iff the control shows ≥ 4 pool doors with ≥ 2 bad; if none
qualifies, DIAG-NO-GO on supply and STOP — no judged legs.

**Screen (all three bands, control config, anchor `80e7da0bcf29` verified
on every corpus file, policy `1884c8852d38`):**

| Band | Fought doors | Pool (leader ≤ 75 HP) | Bad | Qualifies? |
|---|---|---|---|---|
| 107471–107478 | 3 (3 vKill) | 1 | 0 | NO |
| 107479–107486 | 7 (7 vKill) | 1 | 0 | NO |
| 107487–107494 | 2 (1 vKill, 1 vDie) | 1 | 1 | NO |

Band 2 was left 7/8 at timeout (seed 107486 unrun); the adoption ran it
(exit 0, anchor verified) before adjudicating. Band 3 is the frozen
third and last band — no fourth band was screened.

**The pool, all three bands (one door each):**

| Seed | Day | Monster | Leader HP | projHp2 | Outcome |
|---|---|---|---|---|---|
| 107473 | 126 | strike | 55 | 5 | vKill (GOOD) |
| 107482 | 99 | suburb | 61 | 11 | vKill (GOOD) |
| 107493 | 103 | reunion | 62 | 12 | vDie (BAD — the only bad pool door in 24 seeds) |

12 fought doors across 24 seeds; 11 vKill, 1 vDie, 0 vFlee. Only 3 of
12 leaders entered at ≤ 75 HP. D1–D6 are unjudged, not failed. The
screen rule is vindicated, not broken: exactly 1 pool door per band,
three bands running, is a pattern — two compounding scarcities (fought
doors are rare; leaders rarely enter them hurt). Screening more fresh
bands is NOT the recommended next step; the evidence file's metric
review names the next supply strategies (re-judge on the leaderproj
probe's pool-rich history, stage pool doors deliberately, or widen the
pool definition as a supply question).

**Proof battery (frozen base):** M1 18/18, M2 35/35, M2w 16/16, M3 29/29,
M3d 49/49, M3e 25/25, M3f 48/48, M3g 43/43, M3h 50/50, M3i 55/55, M3j
36/36 — all GREEN (proofs log 09:07–10:14Z, post-freeze, by the
timed-out run). M3k `test-gateavoid-screen-b.js` (NEW) 11/11 GREEN and
analyzer selftest 39/39 GREEN, re-run by the adoption on the same base.
**Rebased-tip re-run (tip `93b1f3c49`, 10:41–10:51Z, by the adoption):**
full battery green, 0 failed — M1 18/18, M2 35/35 (+ pinquaddoor
analyzer selftest 26/26), M2w 16/16, M3 29/29, M3d 49/49, M3e 25/25,
M3f 48/48, M3g 43/43, M3h 50/50, M3i 55/55, M3j 36/36, M3k 11/11,
gateavoid analyzer selftest 39/39. No §1 freeze-time failures (this
arm's tests carry no anchor tripwire). The rebase brought in r268
scripts, the 0815Z arms (incl. the homebody-holder handoff touching
win-plan.js/villager-brain.js) and the r272 convo-wants fix; the
instrument files and `villager-agency.js` are byte-identical across the
rebase, and the battery confirms the arm's proofs hold on the new tip.
Log: `/tmp/rebased-battery-0230.log` (outside the repo).

**Sense-test read:** the durable gate-avoid log fired 4 times across the
24 seeds, all `hold` kind (never `proj` — the gate is off in the control
config, as designed): 107478 d40 Lan 9 HP vs eater ("gave eater room —
Lan is too hurt to hold a door (9 HP)"), 107481 d112 Rafael 20 HP vs
audit, 107482 d107 Kåre 2 HP vs editor, 107487 d91 Ehab 3 HP vs strike.
The log-vs-notes gap is 0 on these seeds; the blind channel is not the
binding constraint — the pool itself is missing.

**Wall (24 screened seeds, control config):** wins 0/24, standing ≥ 200
15/24, table not measured on this instrument; wave 4 24/24, wave 5
15/24; median survival 148d, survived 11/24, deaths 2,403.

## Arm 2 — sim-launchfield-horizonfix-b: DIAG-GO on completeness

Evidence: `evidence/2026-11-23/sim-launchfield-horizonfix-b.md`.
Commit `39e1a8ec1` (landed by the timed-out run before the timeout;
verified ancestor of HEAD by the adoption).

The horizon-exclusion clause extension: a zero-row final day counts as
horizon-truncated. The confirm band (107447–107454) flips DIAG-NO-GO →
**DIAG-GO** on exactly one firing — seed 107447, visjoin_134/editor,
day 150, parts 0–3, all `horizon-truncated` (4 parts / 1 instance-day).
Pilot band (107439–107446) re-judges unchanged (DIAG-GO, zero firings).
Reproduction exact 10/10 on both bands. Proof 64/66 on the rebased
worktree (2 §1 by-design freeze-time failures), selftest 86/86. No new
sims, no legs re-run — the amended analyzer re-reads the existing
frozen corpora; zero `src/js` changes. Completeness is now closed on
the 150d horizon for this instrument (for the zero-row-final-day shape);
the launch mechanism itself is still DENIED on both bands (pool eligible
0 on every snapshot) — that is the winnability chain's open build, not
this arm's.

## Gate

check.js --quick on the rebased tip `93b1f3c49` (log
`hidden_files/check-quick-0230.log`, run 11:27:45–11:43:15Z):
**339 passed, 5 failed in 929s, GATE-EXIT=1. 0 attributable.**
- 2 × 120s timeouts under load (exit null):
  `test-living-garden-deed-attainment.js` (120.1s),
  `test-one-person-army-deed-attainment.js` (120.1s) — re-ran green
  standalone, serialized, on the same tip (log
  `hidden_files/check-quick-0230-standalone.log`, 11:46–11:50Z:
  living-garden 8 passed / 0 failed EXIT=0, one-person-army 7 passed /
  0 failed EXIT=0) — load flakes, confirmed.
- 3 × standing staleness set (none touches any 0230Z arm file — this
  round adds one proof test + evidence only, zero `src/` changes):
  `test-measurement-proof-update.js` ("Proof source inputs are not
  current"), `test-measurement-workflow.js` ("retained neutrality proof
  covers the current Game/controller/harness inputs"),
  `test-phone-frame-proof.js` (stale phone receipt, index.html).
- The other three usual timeout suspects passed this run
  (occupation-panels, trust-observer-neutrality at 115s, capable-bot) —
  the timeout set varies run to run with load, as before.

Gate history for this round: the first gate attempt (11:12:39Z) was
killed by a machine restart at ~11:24Z (uptime 0 min; its /tmp log was
lost with the tmpfs — the re-run above writes its log to the goal
hidden_files, which survives restarts). A second gate attempt died
earlier at ~11:08Z when flap window 15 (11:05:34–~11:10:44Z, ~5 min)
refused its writes — and a concurrent check.js (journey-scale r273's
gate, 339/5) was stopped by the adoption the moment it was spotted,
before either gate had finished; the r273 gate ran first and finished
clean. Flap window 16 (~11:20–~11:22Z, ~2 min) truncated the
worktree's `docs/ONTOLOGY.md` to 0 bytes at 11:21Z during the first
gate attempt — restored byte-identical from HEAD (hash `6725ee9c`,
354,686 bytes) before the re-run; the main-tree copy was never touched.
Both windows are short blips; neither lost work.

## Telemetry

Ran `node scripts/telemetry-check.js --baseline <goal>/hidden_files/
telemetry-baselines/scale-wall.json --current <glob> --metrics
national,table,wins --sweep-rows --allow-recorder-corpus` against all
three screen corpora globs (8 seeds each): exactly the same 3 LOUD
lines on every band — national 12 → 0, table 16 → 0, wins 16 → 0.
These are the known regime artifact (pre-seat competent-policy
substrate vs the WINSEAT-regime baseline; the baseline's own `_regime`
note predicts it), the same 3 lines every round gets on recorder
corpora. **Baseline NOT rolled.** No judged legs exist, so there is no
balanced-panel compare to run — M5 is not applicable, not passed.

## Closeout

- Arm 1 branch `sim-gateavoid-doorrich-b` rebased onto `fdd7042b8`
  (the shipped tip), smoke re-run green on the new tip (M3j 36/36,
  M3k 11/11, gateavoid selftest 39/39), ff-merged [MERGE TIP],
  worktree released, branch deleted.
- Arm 2 commit `39e1a8ec1` was already on master at adoption start; no
  rebase or re-merge was needed for it.
- Tracker: winnability-chain axis updated [TRACKER — filled at closeout].
- Claim `hidden_files/lever-claims/fleshout-loop-b-20261123T0230Z.json`
  retired to `.DEAD`; lock `fleshout-loop-b.lock` deleted LAST after
  same-call per-line verification that it still held
  `fleshout-loop-b-20261123T0230Z`.
- Safe-commit index clobber struck on the Arm 1 commit (all 38 files
  staged-as-deleted) — repaired via
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`,
  verified status empty + diff HEAD empty + hash-object match.
- Main tree clean at closeout [VERIFY — filled at closeout].

## Findings / open threads

- The leader-projection gate's D1 stays unjudged (third consecutive
  supply failure: leaderproj-b's 1-note diag, gateavoid-b's 1-door
  0%-bad pool, this arm's 1-door-per-band screen). The next run must
  change the SUPPLY, not the −20pp bar (see the Arm 1 evidence
  metric review).
- The 107493 reunion vDie (leader 62 HP, pool door, leader death) is
  the one data point the next run wants — the first pool door whose
  outcome the armed leg could plausibly have changed.
- Winnability chain: wins 0/24 on this round's screen corpora, 0/16 on
  the horizonfix re-judged corpora; wave 5 reached by a majority here
  (15/24) but nothing wins. The launch mechanism (pool eligible 0 on
  every snapshot) remains the chain's open build.
