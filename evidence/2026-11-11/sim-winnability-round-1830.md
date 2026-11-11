# Loop B 1830Z — winnability chain round (coordinator evidence)

Run `fleshout-loop-b-20261111T1830Z`, Loop B (oversight-flesh-out-loop-b), axis
scale-onramp / winnability chain. Scheduled 2026-11-11 12:30 CST (18:30 UTC),
closed ~20:30Z. All three arms landed on local master, pending ship (no push,
no version bump — the batch ship job owns deploys).

Master path this run: `3eec28a81` → `f2c35954b` (arm 1) → `fe7b4f9f3` (Loop A
siegefirst pilot, landed between my arms) → `56f68d1f8` (arm 2) →
`13e6f40ae` (arm 3, final tip).

## Arms at a glance

| Arm | Verdict | Landing commit |
|---|---|---|
| 1 sim-proofrefresh-b — measurement-proof refresh (tracker blank #1, twice owed) | GO 12/12 | `f2c35954b` |
| 2 sim-tributedeliv-b — tribute-delivery diag (findings #2255) | DIAG-GO | `56f68d1f8` |
| 3 sim-mournblooded-b — hold beats mourn the blooded (findings #472) | GO, #472 fixed | `13e6f40ae` |

## Arm 1 — the measurement proof is current again (GO)

The gate that proves our measurements are real had gone stale: the version
bump in the batch ship (bead0e9bb) moved two files the proof's manifest
tracks (`src/js/build.js`, `index.html`), so
`node scripts/godpath/test-measurement-proof-update.js` failed on master with
"Proof source inputs are not current". The arm ran a fresh balanced panel
(seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9], policies
[capable, risk-aware, socialite, winseek], 150 days, Columbus, Ohio — 64 rows)
and re-pointed `scripts/balance-proof.json` at it
(`evidence/2026-11-11/neutral-proofrefresh-b5.json.gz`).

- Before: proof test FAILS, exit 1.
- After: proof test exits 0, 9/9 legs pass; arm proof `test-proofrefresh-b5.js`
  12/12 (old panels correctly refused, neutrality holds on all four policies,
  64 rows complete). Coordinator re-ran both on the branch before merging.
  (Caveat: arm 3's later `standing.js` change staled the proof again on
  merged master — see Metric review; a fresh panel run is owed.)
- Panel wall rows: national/table/wins 15/64, wave-5 18/64, median survival 90d.
- Commits: `26560e728` (prereg), `361a5c590` (proof test), `c5a23bf0c` (panel +
  re-point), `f2c35954b` (evidence).

## Arm 2 — tribute delivery: ready is not payable (DIAG-GO)

The question was why villages that reach tribute readiness never deliver the
military tribute (the deed that buys the next step toward the table). The arm
instrumented the delivery path (zero game-code changes) and ran 10 seeds:
fresh band 190411–190418 plus a re-trace of the two vetphantom ready seeds
190393/190397, competent policy, 150 days, death-aware.

- **The named blocker, confirmed on every ready day: PAYABLE_SHORT, 9/9.**
  Readiness counts the scholar; delivery needs two payable veterans (never
  the scholar). Every ready day read veterans 2 / payable 1 — the scholar
  plus one. The delivery gate's own count agrees exactly.
- **Second branch confirmed: 0 delivery attempts in 1,146 snapshot-days.**
  The competent policy never calls the Haven delivery entry point. But the
  pair never stood, so how the policy behaves on a live pair is still
  unmeasured.
- **Deeper finding: a payable pair (≥2) never stood on any day of any seed**
  (max payable 1 everywhere). The blocker is upstream — villages die before
  banking two living payable veterans.
- **Succession trap (seed 190416):** the only ready window (days 103–111)
  closed when the scholar starved on day 111 and the one payable killer
  inherited the scholar's chair on day 113 — veterans 1 / payable 0.
- **Sense test: the military tribute is voiceless.** 181 tribute lines across
  the 10 seeds, none mention the deed, veterans, table, or seat — all are
  food/link tribute. Nothing names the deed even during the 9 ready days.
- Wall numbers (10 seeds; fresh band of 8 in parens): national 0, table 0,
  wins 0; wave-4 unlocks 10/10, wave-5 2/10 (1/8 band); median survival 131d
  (band 130d); survived 1/10 (band 1/8).
- **Loud flag: survival collapsed vs the vetphantom band** (6/8 survived,
  median 150d). Deaths are combat, not hunger (591/737 combat/expedition/
  wild; starvation 4). This needs a control leg before anyone blames the
  reconcile merge — recorded here, not judged.
- Re-trace MISMATCH (void, not instrument failure): both vetphantom seeds
  failed to reproduce on the moved master (lost day 149/142, 0 ready days vs
  survived 150d, ready 2/1). Cause verified: master moved — the reconcile
  branch is an ancestor of the current tip, with 4,677 src/js insertions
  across 22 files since the vetphantom anchor. 0 instrument errors. The
  verdict rides on the fresh band alone.
- Commits (rebased): `2aa2d6386` (prereg), `a73250707` (instrument + driver +
  analyzer + proof 55/55), `56f68d1f8` (evidence + 10-seed corpus).
- #2255 disposition: prime suspect confirmed as the binding condition on
  every ready day; second branch confirmed; new upstream finding (pair never
  stands) + succession trap + voiceless tribute + survival-collapse flag.
  Steve-call items still open: what the scholar pays when the pair is
  scholar+1; the voiceless tribute.

## Arm 3 — hold beats now mourn the blooded (GO, #472 fixed)

The hold beat used to fall back "(1 of 2 veterans)" → "(0 of 2 veterans)"
silently when a blooded veteran died between snapshots — the village was told
the truth about the bar, not about the death that moved it. The fix, all in
`src/js/standing.js` (+140/−21), no count logic, no readiness gate, no win
price or deed gate touched:

1. `livingVeteranIds(w)` — the SET behind the veteran count, so the gate and
   the mourning can never drift apart.
2. `_standingMournFallen` — diffs the living-veteran set across hold-beat
   firings; a veteran is mourned only with positive evidence of death
   (`deathSeen` or a memorial entry). A count drop with no death evidence
   (exile, flight, roster move, snapshot noise) stays silent. Each death is
   mourned exactly once, on the first hold beat after it.
3. One short line in the hold beat's own System voice, naming the fallen
   veteran and the beast they blooded: "📡 Kwame blooded The Congregation —
   and the cameras lost them. One veteran fewer tonight. Remember the name."

- Proof `scripts/test-mournblooded-b.js`: 2/2 death-day transitions voiced,
  0 false voicings on 7 non-death transitions (fixture, seed 99107, 63 staged
  days). Coordinator re-ran it after rebase; exit 0, and the eulogy line
  fires in the output ("Jerome was blooded — and the cameras lost them.").
- Commit: `13e6f40ae` (single commit: prereg + fix + proof + evidence).
- Note: the fix lives in `standing.js`, not `game.js` — the hold beat reads
  readiness from `standing.js`, which is where the veteran set lives.

## The village, in plain words

Villages reach the fourth wave reliably now (10 out of 10 seeds) but almost
never live long enough to bank two fighting veterans who are still alive and
not the scholar — that pair never stood on a single day of any seed. The one
window that did open closed the hard way: the scholar starved, and the one
killer left inherited the scholar's chair instead of standing beside them.
The tribute itself never says its own name anywhere in the village's words.
The wall stands: no village reached national, the table, or a win on any
panel this run. The chain's binding link is still "two living payable
veterans" — and the villages are dying in combat before they get there.

## Reachability verdict

- Wave 4: reachable (10/10). Wave 5: faced on 2/10.
- National / table / wins: 0 everywhere, on this band and on the refreshed
  64-row proof panel (15/64 national/table/wins rows are the panel's
  historical spread, not this run's band).
- Scale-onramp axis: converging, NOT converged.

## Metric review

- Arm 2's re-trace leg is void (master moved under it) — the fresh band
  carries the verdict; re-traces against pre-reconcile anchors should not be
  attempted without re-basing the expectation. The survival-collapse flag
  (1/10 survived vs 6/8 on the vetphantom band) is a same-run investigation
  item for a control leg, not a verdict about the reconcile merge.
- Arm 3 is fixture-verified, not band-verified (a fiction fix; no sim band
  ran). Wall numbers N/A with reason, per its prereg.
- Arm 1's panel was generated on 49ca310fa and the proof re-run on the
  rebased tip 3eec28a81; coordinator re-ran both proof tests on the branch
  before merging (both green there). **CORRECTION — the re-point does NOT
  validate on merged master:** `test-measurement-proof-update.js` FAILS on
  the final tip `13e6f40ae` with "Proof source inputs are not current"
  (exit 1, verified by the coordinator after all three merges). Arm 3's
  `src/js/standing.js` change moved a manifest input after arm 1's panel
  was generated, so the fresh panel is stale again. A fresh panel run is
  OWED as the next run's first job — the proof-refresh blank re-opens, it
  is not closed by this run. The panel and re-point on master are still the
  newest available; they are stale by one game-code change, not by the
  version bump.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline <scale-wall.json> --current
'evidence/2026-11-11/perseed-tributedeliv-b/*.json' --metrics
national,table,wins,exiled` — the tool REFUSED the input: all 10 rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs; recorder
corpora are compared with sweep-compare tables, never against a run baseline.
No LOUD line, no baseline roll (recorder corpora are never rolled into a run
baseline). Reported honestly as refused.

## Infrastructure

- **Container write flap (18:43–19:29Z):** `.git` ref/index writes denied
  with EPERM while plain file writes worked; blocked all three worktree
  registrations through two retry rounds; cleared on the third retry. All
  three trees registered ~19:29:26Z.
- **Runtime restart (~19:37Z):** interrupted the arm-2 worker mid-flight and
  killed the coordinator's 15-minute sleep timer. The worker's tree held only
  the uncommitted prereg; resumed via `subagent.resume`, committed the prereg
  first, rebased onto explicit master `3eec28a81`, finished clean (DIAG-GO).
- **Loop A landing during closeout (~20:21Z):** Loop A landed its siegefirst
  pilot (`fe7b4f9f3`) while I was merging arm 2 — my first merge attempt hit
  a transient `.git/index.lock` held by Loop A's merge. Verified no git
  process was running, the lock was gone, rebased arm 2 onto the new master
  `fe7b4f9f3`, re-ran proof 55/55, merged clean.
- **Arm-1 release slow (~4 min):** `worktree-release.sh` + `git worktree
  remove` took ~236s once; the other two releases took ~10s. Outlier, no
  cause established.
- **Arm-3 tree flap artifact:** a `docs/ONTOLOGY.md` modification appeared in
  the arm-3 worktree (uncommitted, not in the worker's scope). The worker's
  own closeout reverted it — the landed diff touches only prereg, evidence,
  proof test, and `src/js/standing.js`. No ONTOLOGY.md change landed.
- **Orphan branches from the failed registrations:** `sim-proofrefresh-b`
  and `sim-proofrefresh-b2`, both at master `3b4aa8123`, no worktrees, no
  registry entries — deleted at closeout after verifying tip == master.
  (`sim-proofrefresh-b3` in packed-refs belongs to an earlier run — left alone.)
- A stale `.git/refs/heads/probe-a.lock` (0 bytes, 2026-11-11 18:49Z) from
  another process was observed and left alone.

## Blanks filled / documented

- Filled: #472 — hold beats mourn the blooded.
- Half-filled, re-opened: measurement proof refreshed (blank #1, twice owed)
  — the panel and re-point landed, but arm 3's `standing.js` change staled
  the proof again on merged master (see Metric review). A fresh panel run is
  owed next; the blank is NOT closed.
- Documented: #2255 answered — tribute readiness is not payable; the pair
  never stands; the tribute is voiceless; survival collapsed vs the
  vetphantom band (control leg owed).
- Still open: the winnability chain's binding link (two living payable
  veterans); what the scholar pays when the pair is scholar+1 (Steve call);
  the voiceless tribute (Steve call); survival-collapse control leg.
