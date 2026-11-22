# sim-vanishtile-a — VANISH-TILING TRACER FIX + DETERMINISTIC RE-ANALYSIS (finding line 2675)

- Arm: sim-vanishtile-a, Loop A run fleshout-20261122T1115Z, DIAG/instrument
  arm (no lever, no new band).
- Axis: scale-onramp · Finding: tracker blank #2 / sim-findings line 2675
  (VANISHED-GUN TRACE DOESN'T TILE).
- Base: worktree HEAD `87b2122f3` at arm start; prereg `49907461e` + tracer
  fix `626bcfcb1`.
- Prereg: `evidence/2026-11-22/sim-vanishtile-a-prereg.md` (content frozen
  ~06:10 UTC, committed `49907461e` — before any judged re-analysis).
- Instrument: tracer `scripts/analyze-gunlife-a.js` (fixed in this arm) +
  proof test `scripts/test-gunlife-a.js` (unchanged). No game-code change.
- Corpus (frozen, NO NEW BAND): `evidence/2026-11-21/perseed-gunlife-a-ctl/`
  (8 files, seeds 107321–107328). Anchor verified on all 8 files before
  the re-analysis: `anchorCommit:
  01ff4956f9d88ed2b4c012ef1c7d9cbc26ff8c6a` (prefix `01ff4956f`, the
  gunlife instrument commit) on every file.
- Analysis: `node scripts/analyze-gunlife-a.js --dir
  evidence/2026-11-21/perseed-gunlife-a-ctl --out
  evidence/2026-11-22/gunlife-a-analysis-vanishtile.json` → exit 0. The
  judged gunlife-a analysis (`gunlife-a-analysis.json`) was NOT
  overwritten.

## Verdict: GO on instrument + tiling — 8/8 grants traced; attribution PROVEN

The tracer fix closes the tiling gap: the vanish grant's rows now tile
grant day to the last census day (terminal `vanished` state range
days 105–150), so the re-analysis traces **8/8 grants** (was 7/8). The
7 previously-traced grants reproduce with mechanisms byte-identical
(the only diffs are the new additive `vanishedDays: 0` field — §3).
Attribution is **PROVEN**: the corpus dates the corpse's exit to day
105, and a code-exhaustive read shows the corpse-cap cull is the only
path that removes a corpse from the world — see §4 for the dated rows
and the proof structure, including its one honest caveat (the direct
live-list-length reading is not in this corpus; the proof is by
elimination, not a direct count).

The gunlife-a verdict is NOT re-scored: it stands at 7/8 GO. This
re-analysis is its own judged result.

## Frozen-bar table (prereg §5)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| (a) Instrument validity (test-gunlife-a.js still 11/11 AND tracer selftest green WITH new rowsComplete assertion on vanish fixture 7 + regression fixture for a mid-run vanish) | all must hold | test-gunlife-a 11/11; tracer selftest 36/36 (was 25/25 — 11 new checks: 3 on fixture 7, 8 on new fixture 9) | ✅ |
| (b) TILING (re-analysis reproduces the 7 traced grants' mechanisms byte-identical or with every diff documented AND the vanish grant's rows tile to the last census day — rowsComplete true, 8/8) | all must hold for GO | 7/7 mechanisms byte-identical; only diffs are the additive `vanishedDays: 0` field; vanish grant states now 72–104 corpse + 105–150 vanished, rowsComplete true, 8/8 traced | ✅ |
| (c) ATTRIBUTION (vanished gun gets a dated mechanism from the corpus: corpse-cap cull proven OR honest UNPROVABLE-IN-CORPUS with the next step named) | named either way | PROVEN — dated corpus rows (§4) + code-exhaustive single remover; next telemetry named (§4, §7) | ✅ |

GO = (a) + (b) + (c)-named. All three hold.

## 1. The fix (tracer only, `scripts/analyze-gunlife-a.js`)

- A terminal `vanished` state range closes the tiling at the vanish:
  when a vanish is detected, the trace records `vanishDay` /
  `vanishHolder`, and after the daily loop appends
  `{from: vanishDay, to: lastCensusDay, loc: 'vanished'}` — but only
  when no later state re-covers the gun (a reappearance after a vanish
  would overlap; that gap is left visible rather than forced).
- The `vanished` range counts as `vanishedDays` (new trace field — not
  equipped, carried, corpse, or unseen), and days in it do not count as
  fights-entered-while-held (the holder demonstrably holds no gun
  there).
- Selftest: fixture 7 now asserts `rowsComplete === true`, the terminal
  range `{from: 5, to: 5, loc: 'vanished'}`, and `vanishedDays === 1`
  (the assertions whose absence let the gap pass the frozen selftest).
  New fixture 9 is the mid-run vanish regression: grant day 3, corpse
  days 5–6, vanish day 7 of a 10-day run — asserts the terminal range
  tiles 7–10, `vanishedDays === 4`, `corpseDays === 2`,
  `equippedDays === 1`, mechanism `unexplained-vanish`, disposition
  `vanished-from-census`.
- Mechanism names are unchanged: the vanish grant still classifies
  `unexplained-vanish` (the vanish is still unexplained at the event
  level); the attribution verdict lives in this evidence file, not in
  the mechanism string. No game code touched.

## 2. Re-analysis table (all 8 grants, before → after)

| Grant | Mechanism (before → after) | rowsComplete (before → after) | States after fix |
| --- | --- | --- | --- |
| s107321-seq4-gen_wog0qul | equipped-never-led-wave4+ → same | true → true | unchanged (vanishedDays 0) |
| s107321-seq18-sigrun_eiriksdottir | equipped-never-led-wave4+ → same | true → true | unchanged (vanishedDays 0) |
| s107321-seq22-sigrun_eiriksdottir | equipped-never-led-wave4+ → same | true → true | unchanged (vanishedDays 0) |
| s107323-seq17-gen_c0j2d8m | unexplained-vanish → same | **false → true** | corpse 72–104 + **vanished 105–150** (vanishedDays 46) |
| s107323-seq18-chen_wei | fired → same | true → true | unchanged (vanishedDays 0) |
| s107323-seq25-hannah_kim | fired → same | true → true | unchanged (vanishedDays 0) |
| s107323-seq37-yuki_mori | never-equipped → same | true → true | unchanged (vanishedDays 0) |
| s107326-seq16-gen_joga8nx | equipped-never-led-wave4+ → same | true → true | unchanged (vanishedDays 0) |

Mechanism counts after the fix: equipped-never-led-wave4+ 4, fired 2,
never-equipped 1, unexplained-vanish 1 — identical to gunlife-a.
Sear volleys 1, kill-loot searcasters 0, total arrivals 8 — identical.
Per-seed table identical (checked field-by-field). The re-analysis
diff, grant by grant, is exactly three changes on the vanish grant
(terminal state appended, rowsComplete false→true, vanishedDays 46)
plus the additive `vanishedDays: 0` on the other seven — nothing else
moved.

## 3. Wall numbers (re-read from the re-analysis, not copied blindly)

| Metric | Re-analysis (8 seeds) | gunlife-a (for comparison) |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National | 0/8 | 0/8 |
| Table | not instrumented by this driver (recorded, never faked) | same |
| Wave 5 unlocks | 4/8 | 4/8 |
| Wave 4 unlocks | 8/8 | 8/8 |
| Median survival | 150d | 150d |
| Villages lost | 3/8 | 3/8 |
| Deaths | 921 (starvation 2) | 921 (starvation 2) |

Identical to gunlife-a, as a deterministic re-analysis of the same
corpus must be. The scale wall still binds — regional is the ceiling
on all 8 seeds, no national, no wins — but the wall is not this arm's
question; the numbers are reported because the standing directive
requires them every run.

## 4. Attribution — the vanished gun, dated rows

**Verdict: PROVEN** (by elimination — see the proof structure and its
caveat at the end of this section).

### Dated corpus rows (seed 107323, from the frozen corpus)

- The corpse entry `corpse_72_2vdszs` (cvid `gen_c0j2d8m`, kind
  `villager`, buried false) is present in the daily gun census every
  day 72–104 holding 1 searcaster, and **absent from day 105 onward**
  (checked days 105–112; absent through the horizon). The world gun
  total falls 2→1 on day 105 with no event.
- Zero searcaster corpse-take events in the seed (51 corpse-take
  events total, none for a searcaster) — the gun was never looted off
  the corpse.
- A death registered on day 105: a `nevermore` (monster, expedition
  cause) — a new corpse entering the world that day, the cull's
  trigger shape (a registration pushing the list over the cap).
- Corpse age on day 105: 33 days (died day 72). Stage 4 (`bones`,
  cull-eligible) from day 80 — eligible for 25 days before the vanish.
- Cumulative deaths by day 105: 155 (all kinds), 10 person/villager.
  The live corpse-list length is NOT in the corpus (the census records
  only gun-bearing locations, not the full corpse list) — this is the
  one datum the corpus cannot supply.

### Code read (this base, `src/js/corpses.js` + whole-`src/js` grep)

- The cap cull (`corpses.js` ~248–253): when a death registers a new
  corpse and the corpse list length exceeds 40, the oldest stage-4
  corpse is spliced out of the list — items-and-all, silently, with no
  event and no telemetry. Stage 4 is `bones`, reached at 8+ days since
  death.
- It is the ONLY remover: a grep over all of `src/js` finds exactly
  one `.splice` on the corpse list (that cull) and no other assignment
  to `state.corpses`.
- The alternatives cannot explain the exit: burial only sets
  `buried=true` (the corpse stays in the list, and the census lists a
  corpse's gun whether buried or not — `gunLocationsOf` in the driver
  counts any corpse holding a searcaster, buried flag recorded, never
  filtered); butchering (`corruption.js corpseButcher`) only sets
  `butchered=true` and adds meat to the butcher's inventory — it never
  touches the corpse's items or the list, and it is a player-UI action
  in any case; looting is recorded as corpse-take events, of which
  there are none for this gun.
- The census itself reads `Game.corpses()` directly, so the entry's
  absence from day 105 means the corpse is no longer in the world
  list (or holds no gun — ruled out by the total falling 2→1 and no
  take event).

### Proof structure and caveat

The corpus dates the corpse's exit (day 105). The code read
establishes, exhaustively for this codebase, that the cap cull is the
only way a corpse leaves the world list. Exit + only-exit ⇒ the cull
removed it — the list-length condition (> 40) is entailed by the cull
having fired, since the cull only fires above 40. The caveat: the
direct reading "the list stood at 41 when the day-105 corpse
registered" is not observable in this corpus, so the proof is by
elimination over code + dated exit, not by a direct count. The next
telemetry that would make it a direct observation: a cull tele event
(culled corpse id + live list length at the cull) or a live
corpse-count census in the driver.

## 5. Sense-test — the vanish, read from the record

gen_c0j2d8m wins an exchange contest on day 72 and dies the same day,
a searcaster with 2 cells on his body. For 33 days the gun lies on his
corpse in the census — nobody takes it, nobody buries him, nobody
butchers him. On day 105 a nevermore dies on an expedition somewhere
in the world, a new corpse is registered, and the world's corpse list
tips over its limit: the oldest bones go. His is among them. The gun
goes into the ground with nothing and no one — no event, no witness,
no line in any log, just a world total ticking 2→1. It reads sensibly
as a world that quietly forgets its dead: the gun didn't get stolen or
lost, it got cleaned up with the body it was lying on. The unsettling
part is the silence — a 2-cell gun, won in a contest the same day its
holder died, erased by a janitor rule nobody in the village could see
happen. That silence is the instrument gap this arm closes on the
record side; the game side (no cull event at all) is a finding, not a
fix for this arm (§7).

## 6. Instrument notes and deviations

- **Prereg committed before any judged re-analysis** (`49907461e`),
  then the tracer fix committed (`626bcfcb1`), then the re-analysis.
  No judged numbers were produced before the prereg.
- **Index clobber (known class, twice).** After each safe-commit the
  main index lied about the committed file (staged-as-deleted after
  the prereg commit; `MM` after the tracer commit). Repaired both
  times with the `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; verified empty status +
  empty diff HEAD + hash-object match after each repair. Both commits
  are correct on disk.
- **No new band, no new seeds, no game-code change.** The analysis is
  deterministic on the frozen corpus; the re-analysis output is a new
  file (`gunlife-a-analysis-vanishtile.json`), the judged gunlife-a
  analysis untouched.
- **check.js --quick NOT completed (not claimed green).** Started after
  the fix; after ~6.5 min with zero output it was stopped. The box was
  saturated at the time (load ~15.8, a sibling's check suite running
  since 12:00 UTC with its own cache dir) and the run was competing
  with it — the tracer's own proof tests (selftest 36/36,
  test-gunlife-a 11/11) are the binding verification for this
  tracer-only arm and are green. A full check.js pass was not obtained
  on this worktree; the coordinator should not read this arm as
  check.js-green.
- **Canon:** docs/CANON.md read. No canon doc covers corpse culling
  or the gun-vanish — said here rather than inventing canon.

## 7. Findings (for the coordinator to append to sim-findings.md)

- [fixed] 2026-11-22 — items / instrument — VANISHED-GUN TRACE
  DOESN'T TILE (sim-findings line 2675): FIXED by sim-vanishtile-a
  (Loop A run fleshout-20261122T1115Z,
  evidence/2026-11-22/sim-vanishtile-a.md, verdict GO, 8/8 traced):
  terminal `vanished` state range closes the tiling at the vanish
  (fixture 7 now asserts rowsComplete; new fixture 9 covers a
  mid-run vanish); selftest 36/36, test-gunlife-a 11/11.
- [answered] 2026-11-22 — items / corpses — VANISHED GUN WAS A
  CORPSE-CAP CULL: the s107323-seq17 gun's attribution is PROVEN by
  sim-vanishtile-a (same evidence): the corpse entry
  `corpse_72_2vdszs` leaves the census on day 105 (present days
  72–104), world total 2→1, zero searcaster corpse-takes, a new corpse
  registered day 105, and the cap cull (corpses.js ~248–253) is the
  only path that removes a corpse from the world list (single splice
  in all of src/js; burial/butchering only flag). Proof is by
  elimination — the direct live-list-length reading is not in this
  corpus.
- [open] 2026-11-22 — items / instrument — CORPSE-CAP CULL HAS NO
  EVENT: the cull splices the oldest stage-4 corpse out of the world
  silently — no event, no telemetry — so a gun (or any item) on a
  culled corpse vanishes from every census with no witness. Next
  step: a cull tele event (culled corpse id + live list length) or a
  live corpse-count census in the driver, so the next attribution is
  a direct observation instead of an elimination.

## 8. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged re-analysis** (prereg content
  ~06:10 UTC, committed `49907461e`, re-analysis launched after):
  all three bars pass; bar (b) passes at 8/8 against the tiling
  requirement, with the vanish grant's rows now tiling to day 150.
  No bar was re-scored. The gunlife-a verdict was not re-scored (it
  stands at 7/8 GO); this re-analysis is its own judged result.
- **The PROVEN bar's definition was written for a direct reading.**
  The prereg defined attribution PROVEN as the corpus showing the
  list hitting the cap AND the culled corpse being gen_c0j2d8m's.
  What the corpus actually supplies is the culled corpse's dated
  exit; the list-length half is entailed, not observed. The proof
  obtained (elimination over an exhaustive code read) is arguably as
  strong, but it is a different shape from the frozen definition.
  Proposed revision for the next run: define PROVEN as either a
  direct dated reading (list length + culled id) OR a dated exit plus
  an exhaustive single-remover code read, and name which shape the
  proof took. The verdict does not turn on this revision — bar (c)
  requires the attribution to be *named* either way — but the next
  arm should not have to stretch the definition mid-run.
- **The `vanishedDays` field is additive, not a re-score.** The 7
  previously-traced grants carry `vanishedDays: 0` in the new output;
  no mechanism, state, event, or count on them changed. The field
  exists so a future reader can see the vanish range is a counted
  state, not a gap.

## Files

- Prereg: `evidence/2026-11-22/sim-vanishtile-a-prereg.md`
  (`49907461e`)
- Evidence: `evidence/2026-11-22/sim-vanishtile-a.md` (this file)
- Tracer: `scripts/analyze-gunlife-a.js` (selftest 36/36)
  (`626bcfcb1`)
- Proof test: `scripts/test-gunlife-a.js` (11/11, unchanged)
- Re-analysis: `evidence/2026-11-22/gunlife-a-analysis-vanishtile.json`
- Corpus (frozen): `evidence/2026-11-21/perseed-gunlife-a-ctl/` (8 files,
  anchor `01ff4956f` on all 8)
- Prior analysis (untouched):
  `evidence/2026-11-22/gunlife-a-analysis.json`

## Run identity

- **Base:** worktree HEAD `87b2122f3` (master) at arm start.
- **Pre-flight (NOT judged):** `node scripts/test-gunlife-a.js` →
  11/11; `node scripts/analyze-gunlife-a.js --selftest` → 36/36 (after
  the fix; 25/25 before, on the unfixed tracer).
- **Re-analysis (judged):** `node scripts/analyze-gunlife-a.js --dir
  evidence/2026-11-21/perseed-gunlife-a-ctl --out
  evidence/2026-11-22/gunlife-a-analysis-vanishtile.json` → exit 0,
  verdict GO, 8 grants, 8 traced.
