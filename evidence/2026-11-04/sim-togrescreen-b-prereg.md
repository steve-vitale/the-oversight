# Togrescreen-b prereg — FRESH-SEED re-screen of SIGDMG / GEAR / TRICKHOLD (Loop B, run fleshout-loop-b-20261104T0550Z)

## Question
On the 0445Z pinned-base run, SIGDMG, GEAR, and TRICKHOLD were left
NON-ATTRIBUTED on pilot alone (0 class flips on 89702/89704/89705),
while gearoff/trickoff moved sat days −9 to −23 and swung fight
counts/kills heavily without changing pilot classes, and sigoff moved
89705's sat day (113 → 108). Pilot non-attribution covers only those
three seeds' classes. Does any of the three flip outcome class on a
FRESH seed set? MORALE is already CREDITED (mixed direction, 3/7
flips) — it is NOT re-litigated here; no moraleoff variant is run.

## Pinned-base method (game code is NEVER committed)
- Pinned base: master commit ff1725835, r118's exact base. Verified
  before any sim: arm-2 commit d8f334da8 IS an ancestor of ff1725835
  (checked 2026-11-04: yes), so the pinned base already has arm 2 ON.
  V-full = the pinned game tree, unmodified.
- Branch starts at current master (for evidence/scripts commits).
  For sims, the pinned game tree is checked out into the worktree
  (`git checkout ff1725835 -- src index.html scripts`), then the
  toggle tooling scripts plus this arm's new rescreen scripts are
  copied back from branch HEAD (`git show HEAD:scripts/<name>`),
  exactly as 0445Z did for its three tooling scripts. This keeps
  branch HEAD untouched, so no game-code commit can happen while
  pinned; evidence/scripts commits happen only after restoring
  src/index.html/scripts to HEAD. (The brief's "detach HEAD" wording
  is implemented by this equivalent pinned-tree checkout, the
  method 0445Z verified reproduces r118 deterministically; the
  branch never leaves its HEAD, which is strictly safer.)
- Variant construction BEFORE any sim: after reverting all four
  levers, `git diff d8f334da8^ -- src/js/` must be empty (V-alloff
  byte-equal to pre-arm2 blobs), via
  scripts/apply-toggle-variant-20261104.py verify-alloff. If not,
  STOP and report a construction failure.
- Variant game code is restored to the pinned tree after each
  variant's run (`restore`); the final restore returns src/ +
  index.html (+ scripts/) to HEAD. Verified with
  `git diff HEAD -- src/ index.html scripts/` empty and
  `git status --short` showing only intended files before any
  commit. Uncommitted leftovers = FAIL LOUDLY. Killed variants
  leave no trace.

## Primary metric (binding)
Per-seed outcome class on FRESH seeds 89801–89808 (never used by
89701–89707 runs; the 898xx band is fresh to this arm): scattered /
won-lesser (+ sat day) / won-full / wave-5 reached iff
veterans.unlockedWave >= 5 OR satWaves.w5 > 0. A variant FLIPS a
seed iff its class differs from same-base V-full on that seed.
GO threshold per sub-lever (pre-registered, binding): CREDITED iff
≥2 class flips on the fresh set, otherwise NON-ATTRIBUTED.
Trajectory moves (sat-day deltas, fight-count/kill swings) are
reported descriptively for every variant — never write "no effect"
for a 0/1-flip variant. A miss is NO-GO, never re-scored against
a friendlier metric mid-run. Every evidence file carries a
"metric review" section.

Outcome class rules (classifier:
scripts/classify-togrescreen-b-20261104.js, a seeds-parameterized
copy of the 0445Z classifier, same class rules):
- satDay set + satSeatKind → `won-<seat>`.
- endReason village-lost, no sat → `scattered`.
- wave-5 reached iff veterans.unlockedWave >= 5 OR satWaves.w5 > 0.

## Seed plan (fresh band, same policy composition as 0445Z)
Probe: scripts/probe-togrescreen-b-20261104.js = the 0445Z probe
verbatim except its PLAN map extended for the fresh band (the
probe defaults unknown seeds to the 'grey' plan, which would NOT
be the 0445Z policy — hence the copy):
- 89801–89803: waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag)
- 89804: forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat diag, greedy OFF, armory OFF)
- 89805–89808: wavesnw (waves + CAPABLE_NOWALKIN_W4=1)
Policy (0445Z, identifiable from its evidence/prereg and the probe
header): competent-player policy = capable+deedhunt, greedy
deferral defaults MAXTIER 4 / LASTDAY 145, armorydrive +
fullseat-diag + vetguard on waves seeds.
Env: FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1
CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1.
Horizon: 180d death-aware (dead villages stop simulating; +10d
tail max per loop standing rule), matching 0445Z/0330Z — because
the question is outcome class, which is only settled at sit or
scatter, and 180d bounds the run while covering the observed
sat-day range (d48–d113 on the judged block).

## Staged design (judge against this header)
- STAGE 0 — construction + determinism gate (fresh seeds have no
  r118 reference, so the gate is NOT reproduction): (a) all
  variants construct cleanly (sigoff, gearoff, trickoff, alloff);
  (b) alloff verified byte-equal to pre-arm2 blobs; (c) V-full
  runs complete on all 8 fresh seeds with empty .err files;
  (d) a 2-seed V-full repeat run is bit-identical (per-seed JSON
  + transcript bytes). GATE (binding): all four must pass. On
  gate FAIL: STOP per this prereg, report the failure, spend
  nothing further.
- STAGE 1 — fresh screen (5 variants × 8 seeds = 40 runs):
  V-full, sigoff, gearoff, trickoff, plus a V-alloff control
  (descriptive only — no unregistered combos; alloff is run
  because the gate already constructs it and it anchors the
  interaction shape descriptively, as in 0445Z).
- Verdict per sub-lever: CREDITED iff ≥2 fresh-set class flips
  vs V-full; else NON-ATTRIBUTED with trajectory moves tabled.
- Sense-testing: for each flipped seed, read transcript/say-lines
  and judge whether the flip reads as people acting (not counts).
  Genuine out-of-arm findings go to hidden_files/sim-findings.md
  in its format (do not chase them).

## Scale-wall numbers (report every run)
national / table / wins, wave 4–5 unlocks and facing, median
survival, wave reach 1–5, for the judged corpora (per-seed files
carry these; block tallies in plain words too).

## DIAG ONLY
Scripts + instruments + evidence. NO src/js game-code changes
land from this arm. Commit with scripts/safe-commit.sh only.
No push, no bump, no live verification — report 'committed on
branch sim-togrescreen-b, pending coordinator merge'.

## Metric review (for the NEXT run, not this one)
To be filled at closeout.
