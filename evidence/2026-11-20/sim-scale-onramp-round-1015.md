# sim-scale-onramp-round-1015 — Loop A run fleshout-20261120T1015Z

**Run:** fleshout-20261120T1015Z · **Axis:** scale-onramp (CONVERGING, NOT converged)
**Base:** master ec0a42913 at run start; master 683c9a6e5 at adoption closeout.
**Arms (2 planned, 1 judged):** sim-cellgate-a (#2599) + sim-evade-a (STOOD DOWN, never
spawned), band 107051–107058 reused, 8 seeds × 2 legs, 150d, competent verbatim,
substrate VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1
+ BOWOPEN=1 + SPEARGATE=1 + GUNRATE=1.

## Verdicts — cellgate NO-GO, landed (instrument + evidence only, game code reverted)

### sim-cellgate-a — NO-GO kind PARTICIPATION (adoption-merged, rebased tip 873b3d47c)
Evidence: `evidence/2026-11-20/sim-cellgate-a.md`; prereg
`evidence/2026-11-20/sim-cellgate-a-prereg.md` (commit c6715520a).
Lever: CELLGATE=1 wave-gated searcaster volley — below wave 4 the volley is held
(zero shots, zero cells spent, honest hold line); wave 4+ fires as before.
Frozen bars: holder cell-days 58 → **182** (gate proven); holder-days 177 → **194**
(≥40 PASS); armed-holder entries **2** (≥3 FAIL, misses by one); armed volleys
**1** (≥1 PASS — the first armed wave-4+ searcaster volley in this finding's
history: Lautaro, day 117, 2 shots, 1 hit, 67 damage, vKill); guardrail
deaths/engaged 3.95 vs 4.55 ctl (PASS), median 146d vs 150d (PASS).
Root cause, proven: the gate works exactly as built — zero low-wave burns on the
arm leg (ctl burned 4/4 cell-loss days on low-wave led kills) — but the armed-entry
pool is thin: holders walk into a wave-4+ fight carrying cells exactly twice in
8 seeds. The binding constraint moved from cell survival (fixed by this arm) to
holder PRESENCE at wave-4+ fights.
Next lever: **lead-side / presence-side for #2599** — get the armed holder into
the wave-4+ fights (or the gun to the fighters already going). A bigger bundle
is NOT the next lever: it would only add a second volley to a gun that already
reaches the right fight once. Instrument bug found (not a verdict item): the
analyzer's `armedLeads` counter is NEVER incremented (init, read, asserted 0 —
no code path adds to it); the next arm that counts leads must fix it first.
Proof test 12/12 pre-pilot (9/12 post-revert, hold assertions only); gunrate
proof 39/39 pre-pilot (26/39 post-revert); analyzer selftest 45/45.
Panel `review_required` (community-loss raw count; frozen guardrail passes).

### sim-evade-a — STOOD DOWN, never spawned
Registration failed on the 11:02Z flap (git ref write EPERM); the worktree
disappeared mid-registration during the jam (branch sim-evade-a still exists,
no work lost). Nothing built, nothing judged. The evade wall (#2590) stays
the next lever for the serve half: all 5 served spear-holders who led wave-4+
meetings evaded (depmat).

## Wall numbers (cellgate band, 16 seeds)
- National **0/16**, wins **0/16**, wave 4 16/16, wave 5 6/16 (3/8 both legs),
  median survival 150d ctl / 146d arm. Community lost 3/8 ctl, 4/8 arm.
- Standing pinned at 199 on four seeds per leg (the wave-4 floor). The scale
  wall stands: nothing reached national or the table.

## Infrastructure (this run + adoption)
- Write flap windows ~11:02–11:22Z (ended by VM replacement ~11:22Z) and
  ~11:47–~12:05Z (ended without a restart; probes ALL-OK from ~12:02Z).
  The flap blocked the prereg commit, the gunrate-driver clone, the analyzer
  selftest's /tmp writes, and heartbeats; the pilot ran through a thin
  wrapper (`scripts/cellgate-driver-wrap-a.js`) requiring the judged gunrate
  driver as a module. Five corpus writes fell back to `@@FALLBACK` stdout
  dumps and were recovered byte-verified from the sweep logs; no seed lost.
- The coordinator timed out during closeout: commit b70f883d4 (18 files) was
  unverified, the safe-commit index clobber unrepaired, 16 per-seed corpora
  uncommitted, worktree dirty. Adoption (this closeout): verified the
  coordinator dead (no processes, heartbeat stale 11:23Z), probed writes OK,
  verified b70f883d4 (18 files, hashes match HEAD), repaired the clobber
  twice via the ls-tree -r pipe (once for the 18 files, once after the
  corpora commit 636ef9053), committed the 16 corpora, rebased clean onto
  683c9a6e5 (new tip 873b3d47c), re-ran proofs on the rebased tip
  (cellgate 9/12, gunrate 26/39, analyzer selftest 45/45 — all exactly
  the post-revert record), fresh check.js --quick 335/9 in 1350s, 0
  attributable (see Gate below), ff-only merge, telemetry check (LOUD
  lines are the documented regime artifact — see Telemetry below). No push,
  no bump, no live verification — merged locally, pending ship.
- Master moved under the run: ship 407168f1d-20261120-114057 landed during
  the adoption (r246 + r255 adoptions, 0530Z closeout, 0315Z round).

## Gate (adoption re-run, fresh on rebased tip 873b3d47c)
`node scripts/check.js --quick`: **335 passed, 9 failed in 1350s, 0
attributable** (log `evidence/2026-11-20/check-quick-1015-adopt.log`).
The 9, by class — all standing set, all pre-existing: five 120s timeouts
(living-garden-deed-attainment, occupation-panels,
one-person-army-deed-attainment, trust-observer-neutrality,
test-capable-bot-20261014 — the last re-run standalone 42/42 PASS, exit 0,
so its timeout is load-slowness, as the 0530Z adoption also found);
three stale retained proofs (measurement-proof-update,
measurement-workflow, phone-frame-proof — the staleness pair + phone-frame
receipt); one measurement-cache-flags (4 assertions, observer/cache
identity). No contest, loot, prize, searcaster, cell, or volley test
failed, and the landed `src/` diff is zero — none is attributable to
this arm. Identical 335/9 to the run's own post-revert record on the
branch base.

## Telemetry (adoption re-run)
`telemetry-check.js` against the scale-wall baseline on both legs
(`--allow-recorder-corpus`, log
`evidence/2026-11-20/telemetry-round-1015-cellgate.log`): LOUD on both
legs — national 12 → 0, table 16 → 0, wins 16 → 0. Investigated, NOT a
deviation: the baseline file's own `_regime` note says verbatim "DO NOT
compare pre-seat / courtship / readiness substrates against this
baseline — wins are structurally ~0 there and telemetry-check will fire
a spurious LOUD 'wins disappeared'." This band is a pre-seat substrate
(0/16 national, 0/16 wins on BOTH legs — arm and control identical),
so the LOUD is the documented regime artifact. No baseline rolled,
same as the 0315Z round.
