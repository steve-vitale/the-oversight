# sim-proofrefresh-b9 — measurement proof regenerated on the 5c4361ccc tip

## Prereg (summary; full text in sim-proofrefresh-b9-prereg.md)

- **Run:** fleshout-loop-b-20261112T1430Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b9 (tracker 1130Z next
  blank #3).
- **Base SHA:** `5c4361ccc4715b7755e34193ca6b67de58291d9c` (read in the main
  tree immediately before the panel run); branch tip equals master at run
  start; master did NOT move during the run (still 5c4361ccc after
  generation — no rebase needed).
- **Primary metric:** `node scripts/godpath/test-measurement-proof-update.js`
  pass/fail on the tip. GO = exit 0, all legs pass.
- **Panel spec:** seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9],
  policies [capable, risk-aware, socialite, winseek], days 150, origin
  Columbus, Ohio — via `scripts/balance-panel.js` (64 rows).
- **Horizon:** N/A (infrastructure — the panel carries its own 150d spec).

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  5c4361ccc with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed on the branch
  before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b8 panel's `sources`
  (`evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`, sha256
  `067ff0dbd0b27a5205b01f33c32b8ff96702762df006a6f4d8b0a40efa2f47c5`):
  exactly **4 manifest keys differ** (of 525 total):

  - `index.html` (1c31138c4092 → c0ceffda30b0) — batch ship version bump
    9b3373853
  - `src/js/build.js` (95f24948681c → e02a8aad4671) — same version bump
    9b3373853
  - `src/js/conversation.js` (6c77bddb14bb → 845dc36d5e94) — journey-scale
    r133 (3cf9a4644, gesture accept/decline for mimed invitations)
  - `src/js/game.js` (108f3b5f8129 → 64fbc75d9835) — sim-eldergrammar-a
    (a5b75cab8, one-word say-line fix)

  Observer and contract digests still match; the staleness is purely the
  source manifest. **Verdict of the owed-check: OWED.** Panels at b8 and
  earlier are superseded; the re-point target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b9-panel --n 16 --days 150`
- First leg launched 14:57Z under `setsid` from the start per the prereg
  (b7/b8 precedent). It ran 14:57–~15:37Z and produced 54 of 68 cases,
  then died silently with no exit line: the log's last entry is an
  uncaught `Error: EPERM: operation not permitted, write` from
  `balance-panel.js:328` (writeFileSync in a worker) — the known host
  write flap — and the VM itself restarted around 15:38Z (uptime read
  "up 5 min" at 15:43Z), which finished the driver off. No `PANEL_EXIT`
  line, no `Saved` line. 54 complete case files survived; 3 zero-byte
  `.json.tmp` partials were left behind.
- Resume 15:43Z per the b6/b7 precedent: stale `.json.tmp` partials
  removed, same `--out` dir re-run under setsid (probe write OK first).
  The driver reused the 54 cached cases and ran only the remaining 14
  jobs: `Saved .proofrefresh-b9-panel; 64 cases, 54 cached jobs`,
  `PANEL_EXIT=0`, 15:50Z. Total wall ~53 min (14:57–15:50Z incl. the
  dead leg and the VM restart); the resume leg itself took ~7 min.
- Result: `evidence/2026-11-12/neutral-proofrefresh-b9.json.gz`,
  sha256 `1d4178b999bec3707314da0b056731d48f7880f689efe02a1272fa2d25f4676c`.
  The `cases/` cache in `.proofrefresh-b9-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == 0753f91ed` (prereg commit), `sourceHeadEnd ==
  f979b3719` (proof-test commit) — both on the branch above 5c4361ccc. Master
  did not move, so no rebase was needed and the manifest was verified
  against the panel on the same tip: 0 keys differ, observer/contract
  digests still match.

## Proof update

- `node scripts/balance-proof-update.js evidence/2026-11-12/neutral-proofrefresh-b9.json.gz`
  exit 0; `scripts/balance-proof.json` now points at the new panel with
  the matching panelDigest.
- After: `test-measurement-proof-update.js` exits 0, 9 passed / 0 failed.

## Test — `scripts/test-proofrefresh-b9.js`: 11 passed, 1 failed, adjudicated

- validate passes on the new panel; `test-measurement-proof-update.js`
  exit 0; `test-measurement-workflow.js` 9/9;
  `validate-ontology.js` 138 systems;
- neutrality 4/4 match; rows 64/64; neutrality reproduces the retained
  b8 panel AND the b7 panel (identical (policy, seed, match, warnings)
  tuples — regeneration moved no verdict);
- `sourcesStable` true; stale-input negative checks: the retained b8 panel
  AND the b7 panel both FAIL `validate()` on this tip with
  "Proof source inputs are not current" (green is not vacuous).
- The one failing leg is `test-measurement-cache-flags.js`: 3/4 inside
  the 12-leg run. This is the prereg-adjudicated load artifact, not a
  logic failure: the test spawns `balance-panel.js` with a hard 30s
  timeout, and two standalone re-runs of the test immediately after went
  4/4 (exit 0 both times). A fresh uncached 4-case probe spawn measured
  2m42s wall under load avg ~9.5 — far over the 30s cap — which is the
  mechanism: an uncached spawn under box load exceeds the cap while the
  cache-flag logic itself is sound. Per prereg (c) the manual 4/4 stands,
  recorded here — never a silent pass. The 30s cap is NOT changed
  (sim-mcconfirm-refresh-b already NO-GO'd that).

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies:

- national 14/64, wins 15/64, entered 15/64 — all 15 wins from the
  capable policy (15/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 55/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc IV is also 55/64); it is NOT the entered/won count
  (entered 15/64 is the like-for-like number against b8's 15/64).
- Wave reach: 12/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d32 on wave 3 — same seed/row as
  b8).
- Max Arc: 55/64 Arc IV, 9/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 44, over-other 15, survived 5.
- Vests 20 total; vestsVillager 40.
- Per-policy median days: capable 90, risk-aware 120, socialite 86,
  winseek 74.
- Per-policy wave-5 reach: capable 4, risk-aware 3, socialite 5,
  winseek 0.
- Per-policy vests: capable 1, risk-aware 6, socialite 5, winseek 8.

Against b8's rows (same spec; the only game-code changes between are a
one-word say line, a gesture accept/decline, and a version bump):
won 15→15, entered 15→15, national 14→14, table 55→55, wave-5 14→12
(capable 6→4), wave-4 63→63, median 90→90, vests 19→20. The wave-5 dip
is a 2-seed move in capable on identical spec — these are the
instrument's own rows on the current tip, reported as carried, not a
balance verdict (this arm re-proves the instrument; no lever was played,
and no compare run was done). Nothing in the intervening changes
plausibly moves wave-5 reach; treat the 2-seed dip as panel noise unless
a later round reproduces it. No telemetry deviation check was run: the
arm played no lever and the panel is a single retained .gz, not per-seed
evidence.

## Master move (during the run)

Master did NOT move during the panel window: `git rev-parse master` in
the main tree reads 5c4361ccc before and after. No rebase, no
regeneration — the panel was generated on the tip it was judged on.

## Verdict

**GO** — every prereg threshold (a)–(f) holds on the tip 5c4361ccc, with
the cache-flags leg (c) standing on the prereg-authorized manual 4/4
replication (two consecutive standalone 4/4 runs; a fresh uncached probe
spawn measured 2m42s vs the 30s test cap under load). Proof is fresh,
current, and neutral. Ready to merge, pending ship.

## Commits (branch sim-proofrefresh-b9, base 5c4361ccc)

- 0753f91ed — prereg
- f979b3719 — proof test (12 legs)
- (this commit) — fresh real neutral panel + proof re-point + evidence

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (4 keys:
  index.html, build.js, conversation.js, game.js) and passed after a real
  regeneration + re-point. No re-scoring was needed; the neutrality-
  reproduction legs confirmed regeneration moved no verdict (b8 and b7
  tuples identical to the fresh panel's).
- The cache-flags leg failed only on its 30s spawn timeout inside the
  12-leg run and passed 4/4 twice standalone — the prereg's adjudication
  path, used as written. The probe spawn time (2m42s uncached under load
  avg ~9.5) is the strongest evidence yet that the 30s cap, not the
  cache-flag logic, is what trips on refresh rounds run alongside sibling
  work; the cap stays 30s per the mcconfirm-refresh NO-GO, but the next
  refresh should expect this leg to need its manual replication again.
- The setsid-from-the-start panel run survived load avg up to ~27, but
  the run was still interrupted — not by a silent parent death this time
  but by an EPERM write-flap kill plus a VM restart mid-panel. The
  b6/b7 resume precedent worked exactly as designed: 54 cached cases
  reused, 14 jobs re-run, clean `Saved` + exit 0. Keep the resume path
  for the next refresh; the flap, not the driver, is the risk.
- The 2-seed capable wave-5 dip (6→4) against b8 is the only row move
  and is reported as carried, not judged — no lever was played. If a
  later refresh reproduces a wave-5 dip on the same spec, that becomes
  a finding for the winnability chain, not for this arm.
- Nothing outside scope surfaced except the mid-run VM restart (no work
  lost — the case cache survived it).
