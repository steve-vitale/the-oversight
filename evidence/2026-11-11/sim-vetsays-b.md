# sim-vetsays-b — SAY_RE elder filter fix (finding #2271)

Loop B arm, run fleshout-loop-b-20261111T2330Z. Instrument-only fix: no new
sims, no re-judgment of any verdict. Prereg:
`evidence/2026-11-11/sim-vetsays-b-prereg.md`. Proof:
`scripts/test-vetsays-b.js` (green, exit 0).

## 1. What was wrong

Finding #2271 (sim-findings.md, 2026-11-11): the veteran-filtered say
capture regex `/elder/` matched "Elderberry" — on seed 190393 most of the
148 captured lines were Elderberry identification chains. The survival read
was unaffected; the sense-test sample was diluted.

## 2. Correction to the finding's location (verified first)

The finding locates the regex "in the shared SAY_RE
(scripts/vetfirst-instrument-20261111.js, reused unmodified by the
vetphantom/survivalcontrol drivers)". That location is wrong: the instrument
file `scripts/vetfirst-instrument-20261111.js` contains NO SAY_RE and NO
"elder" at all (verified by grep). The regex is duplicated, byte-identical,
in THREE driver files — the drivers each wrap `Game.say` with their own
copy:

- `scripts/vetfirst-driver-20261111.js:63`
- `scripts/vetphantom-driver-20261111.js:106`
- `scripts/survivalcontrol-driver-20261111.js:105`

Repo-wide grep for the pattern string `pack-leader|put down` confirms these
three are the complete set of copies. Other drivers carry differently-worded
SAY_REs for other topics (ability, cook, corrupt, …) — not copies, out of
scope. The instrument file needed no change.

## 3. The fix (one token, three files, same change)

`scarred|elder|pack-leader` → `scarred|\belder\b|pack-leader` in each of the
three drivers. No `src/` change, no driver logic change. The word boundary
rejects "Elderberry" (`elder` followed by `b`, a word character — no
boundary), "elderly", and plural "elders", while accepting standalone
"elder" ("A Elder veteran", "Elder Glasswing Darter", "Ground Elder") and
possessives ("Elder's", boundary before `'`).

## 4. Before / after on the already-judged corpus (no new sims)

Corpus: `evidence/2026-11-11/perseed-survivalcontrol-b/*.json`, 8 seeds
190391–190398, survivalcontrol pilot-fix leg on master. The fixed filter was
re-applied in memory by the proof test; the corpus files were NOT rewritten
(they are the already-judged record).

| seed | old capture | new capture | dropped | Elderberry kept | word-elder old → new |
|------|------------|-------------|---------|-----------------|----------------------|
| 190391 | 33 | 23 | 10 | 0 | 3 → 3 |
| 190392 | 39 | 32 | 7 | 0 | 3 → 3 |
| 190393 | 148 | 28 | 120 | 0 | 5 → 5 |
| 190394 | 57 | 48 | 9 | 0 | 12 → 12 |
| 190395 | 27 | 21 | 6 | 0 | 7 → 7 |
| 190396 | 65 | 61 | 4 | 0 | 0 → 0 |
| 190397 | 51 | 39 | 12 | 0 | 0 → 0 |
| 190398 | 32 | 28 | 4 | 0 | 5 → 5 |
| **total** | **452** | **280** | **172** | **0** | **35 → 35** |

Dropped-line inventory (all 172, classified): **116 Elderberry**-substring
lines + **56 plural-"elders"** lines. The 56 are all one repeated
foraging-basket flavor line — `"sitting with the elders instead"` — about
village elders, not the veteran monster variant; dropping them is the fix
working as intended, not a false negative. Zero dropped lines contain the
standalone word "elder".

What the re-filtered 280-line sample now holds: the veteran-variant label
("A Elder veteran"), monster names ("Elder Glasswing Darter", "Elder The
Ugly Beast"), plant IDs ("Ground Elder", "European Elder"), and lines
matching the other alternatives (veteran / blooded / scarred / pack-leader /
etc.). The 190393 sample collapses from 148 lines (112 Elderberry) to 28
genuine lines — the dilution the finding reported is gone.

## 5. Verdict: GO

Against the preregistered thresholds (binding):

- (a) 0 Elderberry-chain lines in the re-filtered capture, all 8 seeds —
  PASS (0 kept on every seed; 0 total).
- (b) No false negatives — PASS: 0 dropped lines contain /\belder\b/i;
  every dropped line is Elderberry-substring (116) or plural-"elders" (56);
  per-seed word-elder counts identical before/after (35 → 35).
- (c) Proof test `scripts/test-vetsays-b.js` green — PASS (exit 0; all
  unit cases + corpus assertions pass, including OLD-filter bug
  reproduction on the Elderberry lines and acceptance of genuine elder
  lines).

## 6. Reachability / village assessment

N/A — instrument-only arm, no new sim band. No game code changed, so no
content reachability or villager-behavior verdict is produced or changed by
this run. The survivalcontrol MASTER_CHANGE verdict is untouched (not
re-run, not re-judged).

## 7. Scale-wall numbers

N/A with reason: instrument-only arm, no new sim band — no national /
table / wins / wave 4–5 unlock / median survival numbers are produced or
changed.

## 8. Blanks filled / documented

- FILLED: finding #2271 — the filter is tightened in all three copies; the
  proof test pins the pattern (extracted from the driver files themselves)
  so a future edit that re-opens the substring match fails loudly.
  Coordinator marks #2271 fixed on landing.
- DOCUMENTED (residual, not a GO criterion): plant IDs "Ground Elder" /
  "European Elder" still match `\belder\b` — they are plant-identification
  lines, not veteran lines. Small residual imprecision (a handful of the
  280 kept lines); excluding them would need a semantic filter, not a
  regex, and is out of scope here. The next arm reusing the filter should
  know. Also documented: the finding's location was the instrument file;
  the regex actually lives in the three drivers (see §2).

## 9. Metric review

The preregistered metric proved correct — no revision proposed. Two
observations for the next run, neither a re-score: (i) the strict reading
of (a) (0 lines containing /elderberry/i, not just 0 lines captured
*solely* via `elder`) was the right call — in this corpus no Elderberry
line also matches another alternative, so both readings agree (0 kept);
(ii) the "elders" plural class was not named in the task's GO text but
fell out of the line-set comparison; the prereg's (b2) two-class rule
covered it before the test ran, and all 56 turned out to be the same
repeated village-elders flavor line.

## Run notes

- `node scripts/test-vetsays-b.js` — PASS, exit 0 (full output in the run
  report; 0 failures across unit cases + 8-seed corpus re-filter).
- `node scripts/check.js --quick` — DID NOT COMPLETE: the process was
  killed by SIGTERM at ~31 min (1885 s, exitSignal 15) before printing its
  failure list, so no per-test verdict exists from that run. Partial
  progress ("340 scripts, 4 parallel (quick)") showed ~20 F's among the
  dots. Those F's are definitionally unrelated to this change: `check.js`
  jobs are godpath validate/ladder + `scripts/godpath/test-*.js` +
  `scripts/green-list.txt`, and grep confirms NO green-list entry mentions
  vetfirst / vetphantom / survivalcontrol / driver-2026, and no test file
  requires any of the three edited drivers — the edited files are not
  check.js jobs and are not imported by any job. The box was heavily
  contended at the time (load average 12.9 on 1.5 shared CPUs; a sibling
  bisect sim and a second check.js run concurrent; per-job timeout is
  120 s), so load-flake timeouts are the likely cause, but that is not
  proven — the failure names are unrecoverable from the killed run and no
  re-run of the full 340-script suite was attempted (another ~30 min under
  load for a suite that cannot cover this change). The sibling
  sim-medname-b check.js process was also gone when checked afterwards.
  Targeted neighbor coverage instead (all green, run sequentially after
  the fix): `test-vetfirst-b.js` 47 passed / 0 failed;
  `test-vetphantom-b.js` 43 passed / 0 failed;
  `test-survivalcontrol-b.js` 41 passed / 0 failed; plus
  `node --check` clean on all three edited drivers and the new test.
- No write-flap hit on this run's writes.
- Files changed: `scripts/vetfirst-driver-20261111.js`,
  `scripts/vetphantom-driver-20261111.js`,
  `scripts/survivalcontrol-driver-20261111.js`,
  `scripts/test-vetsays-b.js` (new), `evidence/2026-11-11/sim-vetsays-b.md`
  (this file), `evidence/2026-11-11/sim-vetsays-b-prereg.md` (new).
