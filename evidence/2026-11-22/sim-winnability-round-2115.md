# Loop A 2115Z round record — finisher closeout

**Run:** fleshout-20261122T2115Z · **Loop:** A · **Axis:** scale-onramp
(converging, NOT converged)
**Base master:** `f2d03db92` (deepening r269) · **Coordinator timed out:**
~23:15:39Z, before closeout · **Finisher closeout:** this record
**Merge tip:** `ead9ffce2` (ff-only onto `c0bf92fca`, the ship bump of
`52b71428f`)

## Arms

| Arm | Verdict | Lever | Landing |
|---|---|---|---|
| sim-homebody-a | **INCONCLUSIVE** (zero-launch rule: control 4 launches < 5 floor; primary +1 vs +4) | `e62603af0` — range-0 holder's wave-4+ plan moves to a walkable companion at depart time | **REVERTED** (not landed). Instrument + evidence landed: `65617e9cb` + `918de0d72` |
| sim-dawnchoke-a | **NO-GO** (det-gate only; all judged bars pass) | `4ac23b12f` — retire `PROFILEGATE4`: forager companions may answer staged wave-4+ plans | **REVERTED** (not landed). Instrument + evidence landed: `dc754a7cc` + `ead9ffce2` |
| sim-wornstack-a | **DEFERRED** | — | Nothing to land. Branch exists at master tip; deleted at closeout. |

Evidence: `evidence/2026-11-22/sim-homebody-a.md` (INCONCLUSIVE),
`evidence/2026-11-22/sim-dawnchoke-a.md` (NO-GO det-gate). Preregs
frozen before any judged run (homebody ~21:35 UTC, dawnchoke
~22:15 UTC). Band 107423–107430, 8 seeds, 150d, competent verbatim,
substrate `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`.

## What each arm found

**Homebody (INCONCLUSIVE).** The mechanism works but the band is
dry: control launches 4 (all on seed 107423, days 99–107, vs the
herald), armed 5 (+1, bar +4). Handoffs 2 — one skip (wave-3,
walking holder), one Dale-class conversion (107429 d146, Naran →
Vaishali vs the reunion, solo, beat true, line: "Naran never
leaves Haven — Vaishali takes the plan and leads the party.").
Homebody holds 5 → 0, selected-blocked share 0.417 → 0.
Guardrails pass (starvation 5/5, survival 141/141). Det-gate
passes (bounds d53/d146; byte-identical pre-bound). Panel
review_required, no material signal. Next step: wider band
(16 seeds) with the bar set against the measured control base
rate; note the converted launch went out solo — the handoff
does not guarantee companions follow.

**Dawnchoke (NO-GO det-gate).** The DIAG quantifies the choke:
241 staged-plan days, 208 choked (0.863); forager-profile holders
choke 139/139 staged days; dominant sub-choke is
party-wait-no-companion (91, all elig=0). The fix opens
`findCompanion` to foragers for wave-4+ holders: attempts 12 → 57
(+45, bar +4), launches 4 → 36, stuck plans departed 2/3
(miguel_santos d63 after 47 staged days — "Miguel sets out with
Miriam after The Strike"; visjoin_87 d97 vs the herald).
Guardrails pass (starvation 6 vs 5, survival 131 vs 141 = 0.93×).
The det-gate fails because its bound detector (first-release row:
forager/homebody holder + staged w4+ plan + NO party_launch
commit) never fires for a fix whose first effect IS a
party_launch commit. Finisher verification: legs byte-identical
until the first extra depart call (days 63–150; 2 seeds identical
the whole run); anchors hand-verified. The failure is a
bound-detector / fix-shape mismatch, not non-determinism — the
judged numbers ARE attributable, but the frozen bar as written
fails, so NO-GO and the lever reverts. Panel review_required
with a REGRESSION signal: village deaths 91.875 → 102.625
(+10.75/run) — departures bought with lives; a re-judge should
price total deaths into its bars. Next step: re-judge with a
corrected bound (first extra depart call) + a total-deaths
guardrail.

**Wornstack (DEFERRED).** No work produced; branch at master tip,
deleted at closeout.

## Decisions (finisher)

- **Both levers REVERTED, zero trace in the game on master.**
  Homebody `e62603af0` (INCONCLUSIVE cannot support landing
  unconditional game code) and dawnchoke `4ac23b12f` (frozen
  det-gate failed → kill protocol). Both commits stay on their
  HELD branches (`sim-homebody-a`, `sim-dawnchoke-a`) with their
  lever-specific proof tests, for a future re-judge.
- **Instruments + evidence LANDED** (55 files, 1,234,773
  insertions, all additions, zero deletions, zero `src/` or
  `docs/` changes). The proof tests were NOT landed: both assert
  their lever on new code and fail on old code, so they would
  fail on the reverted master. They stay on the held branches.
  Pre-flight results recorded at run time: homebody proof 100%
  new-code / fails old-code, analyzer selftest 28/28;
  dawnchoke needwave proof green on base, analyzer selftest
  28/28, proof 100% new-code / fails old-code.
- **Panel-builder crash diagnosed, not flap.** The dawnchoke
  builder defaulted to the cloned needwave-a band (107375–
  107382); it crashed on the missing seed file. The finisher
  ran it with explicit `--seeds 107423,...,107430` and fixed the
  default in the landed instrument. The homebody builder's
  default was already correct. Both §15 panels built and
  compared (homebody review_required/no signal; dawnchoke
  review_required/regression signal).
- **Analyzer selftests re-run green on the landed tree** before
  merging (homebody 28/28, dawnchoke 28/28). The dawnchoke
  analyzer's `anchorChecks` came back `checked: false` — the
  finisher verified anchors by hand; filed as a findings item.
- **Dawnchoke control-driver logs NOT landed** (687K + 1.8M of
  verbose sim stdout; the per-seed corpora are the auditable
  record). The armed-leg logs (3K each) landed. The 0-byte
  `.err` files and the empty pilot4 log were not landed.

## Gate

Serialized round gate on the merged tip `ead9ffce2` (log
`hidden_files/check-quick-2115.log`, run from a script file,
detached via `setsid nohup`; `ps` showed no other `check.js`
before launch): **339 passed, 5 failed in 738s, 0 attributable**
— exactly the standing set: measurement-proof staleness pair
(`test-measurement-proof-update.js`,
`test-measurement-workflow.js`), phone-frame stale receipt
(`test-phone-frame-proof.js`, 3 sub-failures on the stale
`index.html` receipt), 2 × deed-attainment 120s timeouts under
load (`test-living-garden-deed-attainment.js`,
`test-one-person-army-deed-attainment.js`). No failure touches
this round (evidence/tooling-only, zero `src/` changes); none
re-run standalone — all five are the known standing failures.
The Loop B 1630Z adoption's gate started at 00:05Z, seconds
after this gate's 00:05:07Z end; no overlap during the test
run itself and no contention artifacts in the log.

## Telemetry

`telemetry-check.js` against the scale-wall baseline
(`--allow-recorder-corpus --sweep-rows`, metrics
national,table,wins,exiled) on all four leg dirs: exactly the 3
known LOUD regime lines on every dir (national 12 → 0, table
16 → 0, wins 16 → 0, `won=0/8`), exiled quiet, identical on
both legs. EXPLAINED regime artifact (pre-seat competent-policy
substrate vs the winseat-regime baseline). Baseline NOT rolled.
No arm-attributable deviation.

## Findings

Five entries appended to `sim-findings.md` (lines ~2701+):
det-gate bound-detector / fix-shape mismatch (open); analyzer
`anchorChecks` vacuous (open); forager-companion lift buys
departures with lives (open); primary bar vs unmeasured base
rate + solo Dale conversion (open); panel-builder default-seeds
bug (fixed in the landed instrument).

## Tracker

scale-onramp stays converging (NOT converged): wins 0, national
0 everywhere on both arms; the launch-attempt wall is now
measured on both sides — the handoff mechanism works but the
funnel is dry (homebody), and the forager companion gate opens
the funnel but costs lives (dawnchoke). Next blanks, in order:
(1) re-judge the forager-companion lift with a corrected
det-gate bound + total-deaths guardrail; (2) re-judge the
homebody handoff on a wider band (16 seeds) with the bar set
against the measured control base rate; (3) the worn-stack
collapse fix (#2698) + Omar's corpse thread; (4) the 49-seed
kill-loot searcaster arrival band (still unrun, deferred with
rationale). The 1415Z next-blanks list is otherwise unchanged.

## Infrastructure

- **Flap window 9 CLOSED** (21:52:30Z–~23:00Z). Writes probed
  OK before every commit in this closeout (26K probes on home,
  worktrees, /tmp). The machine was replaced ~23:02Z (new boot
  `4ccc4250`); the flap watchdog restarted the watcher (pid
  2877, ALL-OK cycles). No flap window during this closeout.
- **Ship bump during closeout:** master moved `52b71428f` →
  `c0bf92fca` (batch ship, 23:24Z) while the closeout worktree
  was registering; the closeout branched from `c0bf92fca`
  (current master at merge time) and merged ff-only onto it.
- **Safe-commit index clobber struck all three evidence /
  instrument commits** (staged-as-deleted on 23 files, and an
  MM on the edited builder file) — repaired each time via the
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` pipe; every commit verified correct
  (hash-object == HEAD blob) before proceeding. The commits
  were always right; only the main index lied.
- **Registration slowness:** the closeout worktree registration
  took ~10 min (git checkout in D-state under load); `git
  status` scans take minutes on this tree under load — do not
  re-run them in a loop.
- **Gate serialization:** the Loop B 1630Z adoption resume was
  running concurrently; `ps` showed no `check.js` before the
  gate was launched (detached via `setsid nohup`, script file
  `hidden_files/run-gate-2115.sh`, log
  `hidden_files/check-quick-2115.log`).
- **Lock/claim:** claim retired to `.DEAD`; `fleshout-loop.lock`
  deleted last with same-call per-line run_id verification.
- **Worktrees/branches:** the closeout worktree
  `sim-winnability-round-2115` released after the record merge;
  its branch deleted. The arm branches `sim-homebody-a` /
  `sim-dawnchoke-a` stay HELD at their lever tips
  (`e62603af0` / `4ac23b12f`) with their proof tests, for
  re-judgment. `sim-wornstack-a` branch deleted (deferred,
  nothing held).

## Open items

- Re-judge dawnchoke with a corrected det-gate bound + a
  total-deaths guardrail (lever numbers attributable).
- Re-judge homebody on a wider band (16 seeds), bar vs the
  measured control base rate; distinguish solo vs party
  conversions.
- The dawnchoke analyzer's `anchorChecks` is vacuous
  (`checked: false`) — fix the analyzer before the next arm
  relies on it.
- sim-wornstack-a was deferred twice (1915Z total loss, 2115Z
  deferred) — the worn-stack collapse (#2698) still has no arm.
