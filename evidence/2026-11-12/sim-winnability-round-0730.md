# sim-winnability-round-0730 — Loop B 0730Z coordinator evidence

Run: `fleshout-loop-b-20261112T0730Z` (Loop B, 2026-11-12 01:30 CST / 07:30Z).
Axis: winnability chain. Base at run start: master `d98aae0f0` (journey-endgame r185).
Loop A live on its 0715Z claim (scale-onramp bisect ROUND 4: sim-bisect-origin-a +
sim-bisect-mergebase-a + sim-repin-a) — NOT touched. A landed round 4 mid-run as
`fed635f1f` (origin ORIGIN_COLLAPSED 2/8, merge-base MERGEBASE_COLLAPSED 1/8 +
RANK_STALL 0/8, repin test-only; collapse + stall both predate PRs #118–121).
Re-point queue fully disposed before this run (arm-2 toggle CLOSED 2026-11-06
toggle-confirm family; flee-repair port is a Steve call, held branch
sim-fleerepair-a; standing accumulation answered by the veterans-lock
decomposition + tribute-delivery diag); coverage program complete on measurement.
No new food-economy arm (parked). 1830Z blank #2 (survival-collapse control leg)
answered by the 0630Z mcconfirm-ctrl-b fresh-band control (5/16, median 138d).

## Pre-flight

- No B lock at run start; lock created 07:30Z, claim written before any sims.
- Main tree clean (`git status --short` empty); disk 37%; `worktree-reap.sh` ran
  (11/16 active; LOUD lines only other owners' uncommitted trees, untouched).
- Proof-test state verified by the coordinator at run start on tip `d98aae0f0`:
  `scripts/godpath/test-measurement-proof-update.js` FAILS, "Proof source inputs
  are not current" (b6 panel stale) — the premise of arm 1.
- Fresh-band check (coordinator, recorded in the synergy prereg): band
  190501–190508 searched across `evidence/*/sim-*-prereg.md` (zero hits) and
  all evidence `.md` files (zero standalone-token hits); full-evidence grep hits
  are incidental numeric substrings in per-seed JSON corpora (e.g. `"ate":
  1905021`), not seed reservations; no forbidden/contaminated band list exists.

## Arm 1 — sim-proofrefresh-b7: LANDED `fefc29406` — GO 12/12

Measurement-proof refresh round 7 (1830Z next blank #1, re-opened). No src/js
change, no game change. Worker: prereg `4948ea966`, proof test `b11f65862`,
panel + re-point + evidence `fefc29406`. Base never moved during the arm — no
rebase needed. Coordinator re-verified on the branch tip before merging:
`scripts/test-proofrefresh-b7.js` 12/12 green, `test-measurement-proof-update.js`
9/9 green. Merged `--ff-only`, ancestor verified, tree released done-merged,
branch deleted.

- Stale proof reproduced first: exactly **14 manifest keys differ** from the
  retained b6 panel after 68 master commits (game.js, table.js, progression.js,
  conversation.js, convo-beats.js, bond-initiation.js, villager-agency.js,
  storage.js, build.js, regions.json, statusEffects.json, index.html, competent
  policy rename).
- Fresh panel: `node scripts/balance-panel.js --out .proofrefresh-b7-panel --n 16
  --days 150` (same seeds/policies/days as b5/b6; no new seed band consumed).
  Saved as NEW file `evidence/2026-11-12/neutral-proofrefresh-b7.json.gz`
  (sha256 `67736e5343826e0c632fe08fadd6a131482a9a177184fcc4eb3ceee9468d9a65`);
  `scripts/balance-proof.json` re-pointed. Panel log/err kept; `cases/` cache
  deleted at closeout.
- Proof 12/12: validate passes, proof-update exits 0, workflow 9/9, cache-flags
  4/4, ontology 138 systems, neutrality 4/4 match, rows 64/64, neutrality
  reproduces b6 and b5, sourcesStable true, both b6 and b5 panels FAIL validate
  as stale-input negative checks.
- Wall (panel rows, 64 rows / 150d): national 15/64, wins 16/64 (all capable
  16/16; other policies 0/16), entered 16/64, wave-5 reach 17/64, wave-4+
  64/64, Arc IV 57/64, median survival 90d, max 150d, vests 23, village-lost
  41. Note: `row.table` is 57/64 and tracks Arc-IV reach, not entered/won —
  b5's "table 15/64" was entered==won, so entered 16/64 is the like-for-like
  comparison (stated in the arm evidence).
- Caveats: the panel parent died silently TWICE mid-run (49/68, then 65/68
  cached cases) under heavy parallel load (Loop A cache-flags work concurrent).
  No error output, no `.error.json`, memory fine (4.5 GB available) — cause
  undetermined. Both resumes reused the panel's own case cache exactly (3 stale
  `.json.tmp` partials removed per the b6 precedent); second resume under
  `setsid` completed cleanly. Recorded in the arm evidence, not chased.
  Safe-commit index clobber on 2 commits, repaired via the `ls-tree -r` pipe.
- No telemetry deviation check: the arm played no lever and the panel is a
  single retained .gz, not per-seed evidence — noted in the arm evidence.

## Arm 2 — sim-synergydisc-b: LANDED `ad2bd13fd` — GO

Dawn-resonance discovery build for double-passive synergy pairs (findings
line 2280; tracker 0130Z blank #2 follow-up: "needs a Steve call or a dedicated
build arm"). Worker commits: prereg `5cc36caf7`, panel-case fix `b96d34361`,
build `ce653cdab`, telemetry note `76750e04d`; rebased by the coordinator onto
explicit master `fed635f1f` clean (A's round-4 landing moved master mid-run;
zero file overlap), proof re-run green on the rebased tree. Merged `--ff-only`,
ancestor verified, tree released done-merged, branch deleted.

- Built: dawn resonance (`src/js/game.js`, +92 lines, 0 deletions). At dawn the
  System notes a held double-passive synergy pair — `checkSynergyDiscovery`
  runs for one leg, the other resonates as passive-held. 3 dawns co-held =
  unlock (sustained = 3-dawn streak). No new narration; the synergies' own
  tease/unlock lines fire. The filter is computed from data + trigger set at
  runtime, so a future data change that gives a pair a trigger drops it
  automatically. The other 47 synergies are untouched. Design call documented
  in the prereg (Steve can overrule): dawn resonance over ambient hooks,
  discovery-on-grant, and surge widening; discovery stays System-granted per
  canon law.
- Correction to the 0230Z verdict (re-derived, not trusted): the class is
  **10, not 11**. `war_chest` is rescued by `blood_magic`'s legacy activation
  — a live "Blood Price" button with no `actions` array, missed by the
  actions-only derivation. Proof test asserts 0 dawn attempts for it, then 1
  attempt from one Blood Price use. Findings line 2280 corrected 11→10 and
  marked [fixed] at landing. Secondary count also doesn't reproduce (31, not
  36/57) — method difference, no build impact.
- Verdict GO (prereg bar met in full): diagnostic (seed 20261011, god policy,
  94d, stall script verbatim) before 0 discovered / cornered_fury 0 attempts
  → after **2 discovered: cornered_fury AND stand_together** (both 3/3),
  cornered_fury attempts 3; ringcraft unchanged at 2; grants/trajectory
  otherwise identical. Coordinator re-ran the stall script on the rebased
  tree: discovered `["stand_together","cornered_fury"]`, cornered_fury
  attempts=3 — verdict reproduces exactly.
- Proof `scripts/test-synergydisc-b.js`: **41/41** on the rebased tree
  (re-run by the coordinator): all 10 progress 1/dawn; war_chest / ringcraft /
  closed_loop 0 dawn progress; unheld legs 0.
- Fresh band (190501–190508, competent, 150d, balanced panel): cost bar
  **passes** — starvation 3→4 (bar ≤5), median 138.5→123.5d (bar ≥110.8d).
  Wall: national 0/8→0/8, table (invitations) 8/8→7/8, sittings 0/8→0/8,
  wins 0/8→0/8, wave-5 reach 1→2 seeds.
- Panel compare: **review_required** — disclosed, not hidden. Two exploratory
  signals on 8 seeds (village deaths/100d, NPC named-class access).
  Investigated by the worker: the dawn path consumes **no RNG** in the harness
  (verified every function it touches), so divergence is gameplay-mediated
  (synergies unlocking change outcomes); a 16-seed holdout is owed as
  follow-up. The pre-registered GO bar (diagnostic + cost bar) governs the
  verdict per §14 metric binding; the exploratory signals are diagnostics, not
  a re-score. Holdout queued as next blank #1.
- `check.js --quick` on the branch: 335 passed, 5 failed — all attributed, none
  the arm's: 3 fail identically on pristine HEAD (measurement-proof-update,
  measurement-workflow, phone-frame-proof — retained proofs already stale on
  base `d98aae0f0`); 2 deed tests are 120s load timeouts, pass solo, single-seed
  timing identical with/without the change (3.60s vs 3.66s user CPU,
  byte-identical output). Human-combat-parity failed once on the write flap,
  passed on re-run. No green claimed that wasn't seen.
- Sense test in the arm evidence (tease/unlock lines fire in the System voice).

## Telemetry deviation check

Worker ran it on the after-panel rows: `wall: table=7/8 entered=0/8 won=0/8`;
`LOUD: national disappeared: baseline 12 -> current 0`; `LOUD: wins
disappeared: baseline 16 -> current 0`. Both LOUD lines are the regime artifact
the baseline itself warns about: the baseline is the winseat regime (win-stack
flags on, 16/16 wins), while this panel is a competent-policy substrate with no
win-stack flags, where national/wins are structurally 0 on BOTH legs (before:
national 0/8, wins 0/8; after: 0/8, 0/8). Not a change caused by this arm —
the before leg reads identically. Coordinator re-run: the tool REFUSED the
committed corpus (`.gz` unparseable as JSON; `cases/*.json` glob finds no
top-level `seed` rows — seeds live at `/identity/seed` and `/result/row/seed`).
Recorded, not waived, baseline NOT rolled. No investigation item.

## Proof-staleness consequence (b8 owed)

The synergy `game.js` change stales the b7 panel: the coordinator verified on
the rebased tree that `test-measurement-proof-update.js` FAILS, "Proof source
inputs are not current" (exit 1). The b7 panel is current for the code it was
generated on; a round-8 refresh is owed as the next run's first job (same
cadence as b5→b6). Phone-frame-proof is also stale on the base (pre-existing,
not this run's).

## Infrastructure

- Service restart interrupted the first registration round (orphan branch
  `sim-proofrefresh-b7` at master tip + empty worktree dir with only an
  `evidence/` subdir; branch deleted, dir removed, both registrations re-run
  clean). Registry-lock contention slowed registrations/releases (~2–5 min
  each); nothing failed.
- Safe-commit index clobber struck the proofrefresh worker twice and the
  synergy worker on all 3 commits — repaired every time with the `git ls-tree
  -r HEAD | git update-index --add --index-info` pipe, commits verified
  correct. One safe-commit refusal (directory path + EPERM flap on /tmp
  private-index writes) in the synergy worker, recovered. No EPERM flap
  blocked this run's landings.
- Master moved twice under the run (proofrefresh merge `fefc29406`, A's round-4
  landing `fed635f1f`); synergy rebased once onto the explicit SHA, proofs
  re-run green, merged ff-only. No pipe masked any exit code.
- `check.js --quick` on merged master: [PENDING — fill in before commit.]

## Wall (this run's judged corpora)

- b7 panel (64 rows, 150d): national 15/64, wins 16/64, entered 16/64,
  wave-5 17/64, median 90d.
- Synergy band (16 configs, 150d): national 0/16, wins 0/16, wave-5 3/16,
  median 138.5d before / 123.5d after.

scale-onramp stays converging (NOT converged): wins still come only through
default-OFF courtship + seat instruments on the panel's capable leg, wave 5
still 0 on the synergy band's win column, and the collapse predates the
reconcile PRs (A's round 4) — the cause is still unlocated. Next blanks, in
order: (1) 16-seed holdout for the synergy deaths/named-class signals
(fresh band, same cost bar + panel compare); (2) measurement-proof refresh
round 8 (b7 staled by the synergy game.js change); (3) loop A's bisect
outcome sets the next winnability arm — do not pre-claim it while A is live;
(4) synergy discovery alternatives (ambient notes, discovery-on-grant) remain
unbuilt — the dawn resonance is one shape, not the only one. Claim deleted;
lock deleted.
