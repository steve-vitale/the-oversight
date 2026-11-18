# sim-analyzer2513-b — prereg (finding #2513)

Run: `sim-analyzer2513-b` · Loop B · 2026-11-18 · axis: winnability chain
Finding: #2513 — `scripts/analyze-fleerepair2-b.js` hard-codes an 8-seed
instrument check, so its verdict field reads NO-GO on any larger corpus.

## Canon
Read `docs/CANON.md` first. **No canon doc covers the sim analyzer** — the
manifest lists design docs for game systems (diseases, bears, waves,
contests…); the fleerepair2 analyzer is measurement tooling, not a game
system. Nothing is invented here; the fix is confined to the analyzer script.

## The defect (verified by the coordinator; lines re-checked in-worktree)
`scripts/analyze-fleerepair2-b.js` lines 299–300:

```js
const instrClean = ctlS.instrumentErrors === 0 && armS.instrumentErrors === 0 &&
  ctlS.files === 8 && armS.files === 8 && ctlS.missingHp === 0 && armS.missingHp === 0;
```

The `files === 8` constant was written when every panel was 8 seeds. On the
16-seed re-judge2 band the corpus is complete (16/16 files both legs,
0 instrument errors, missingHp 0, B1/B2/B3 all passing) yet the analyzer's
own verdict field says NO-GO solely on that constant — see
`evidence/2026-11-17/fleerepair2-rejudge2-b-analysis.json`
(verdict NO-GO, ctl files 16) and
`evidence/2026-11-17/sim-fleerepair2-rejudge2-b.md`. The prereg's instrument
criterion for that run (16/16 files) was met; the merge decision cited the
evidence file, not the analyzer's verdict field.

## The fix (one file: `scripts/analyze-fleerepair2-b.js` only; no `src/js` change)
Parameterize the file-count check. **Choice (picked, frozen): expected seed
count derived from the corpus itself** — not an env var. The two legs are
matched corpora from one driver run, so a complete corpus has the same file
count on both legs:

- `expectedFiles = max(ctl files, arm files)` — the fuller leg sets the bar;
  a leg short of it is a truncated corpus and reads instrument DIRTY.
- Plus seed-set equality: the sorted seed lists of the two legs must match
  (a count match with different seeds would be a false clean). Both legs
  carry the same seed band by construction; a mismatch is an instrument
  defect, never a lever effect.
- `expectedFiles` is reported in the `instrument` bar of the analysis JSON
  so the bar a run was judged against is visible in the output.
- Everything else (B1/B2/B3 judges, drift check, missingHp, error counts)
  is untouched.

Known limit, stated honestly: if BOTH legs lost the same seed file, the
corpus-derived expected count cannot see it (both legs agree at the lower
count). That failure needs the driver's seed list, which lives outside the
analyzer; the driver logs already record it. The check catches the real
failure mode — one leg truncated — and any leg mismatch.

## Corpora (frozen, on master — no new sims in this run)
- 16-seed re-judge2: `evidence/2026-11-17/perseed-fleerepair2-rejudge2-b-ctl`
  and `-arm` (seeds 103601–103616, 16 files each).
- 8-seed original: `evidence/2026-11-17/perseed-fleerepair2-b-ctl` and
  `-arm` (seeds 104001–104008, 8 files each).
- 8-seed published NO-GO pair: `evidence/2026-11-17/perseed-fleerepair2-b-diag`
  (ctl, seeds 103601–103608) and
  `evidence/2026-11-17/perseed-fleerepair2-rejudge-b-arm`
  (arm, seeds 103601–103608).

**Naming correction to the brief (verified before writing this prereg):**
the brief named the 8-seed check as "perseed-fleerepair2-b-ctl and -arm"
with "B1 PASS, B2 6→5". That pair is actually **GO, B2 6→7**
(`fleerepair2-b-analysis.json`, and `sim-fleerepair2-b.md` verdicts it
NO-GO only on the fresh-panel B1-unjudgeable calibration gate, not on B2).
The published NO-GO with **B1 PASS, B2 6→5** is the re-judge pair
(diag-ctl + rejudge-b-arm, `fleerepair2-rejudge-b-analysis.json`,
`sim-fleerepair2-rejudge-b.md`). Both 8-seed pairs are checked below, so
the no-behavior-change claim is tested on the pair the brief named AND on
the pair its parenthetical describes.

## Horizon / seeds / policies
- Horizon: n/a — no sims are run. This is an analyzer-only fix judged on
  frozen corpora; nothing is re-simulated, so no death-aware horizon applies.
- Seeds: the frozen corpora above (8 + 8 + 16 per leg as listed).
- Policies: none — no sims, no policy variants.

## GO bar (frozen — judge the run against this header)
(a) The analyzer's verdict field reads **GO** on the 16-seed rejudge2
    corpora (run with `FLEEREPAIR2_ANALYSIS_OUT` to a scratch path so the
    frozen `fleerepair2-rejudge2-b-analysis.json` is never clobbered).
(b) B1/B2/B3 numbers on rejudge2 are **identical** to the evidence-file
    numbers: ctl suburbLaunchedMeetings 3, w4kills 13, deaths 1448;
    arm 0, 13, 1417. (B1 PASS, B2 PASS 13→13, B3 PASS.)
(c) Proof test `scripts/test-analyzer2513-b.js` green: the parameterized
    check reads 8 on an 8-seed corpus, 16 on a 16-seed corpus, and still
    reads dirty on a genuinely short corpus (7 of 8 files).
(d) No behavior change on the 8-seed corpora, before vs after the fix:
    - b-ctl/b-arm pair: verdict GO, B2 6→7, instrument CLEAN — identical.
    - diag-ctl/rejudge-b-arm pair: verdict NO-GO, B1 PASS, B2 6→5,
      instrument CLEAN — identical, and the NO-GO is for the B2 reason,
      not an instrument reason.

## Metric review
Pre-registered metrics bind this run: the verdict field on rejudge2, the
B1/B2/B3 numbers in (b), and the two 8-seed no-change checks in (d). A miss
on any of them is NO-GO for this arm, never re-scored against a friendlier
metric. If the metric proves wrong (e.g. the seed-set equality check turns
out to flag a legitimate corpus), that goes under "metric review" in the
evidence file and is proposed for the NEXT run.
