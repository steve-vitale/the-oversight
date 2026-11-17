# sim-wave5face-b — evidence (DIAG: do the released villages face wave 5?)

Run: fleshout-loop-b-20261116T2230Z (Loop B), axis winnability chain, arm
sim-wave5face-b — DIAG follow-up: seed 102706 released on the final day
(d151) — does it face wave 5? (tracker blank #8). Branch
`sim-wave5face-b` (worktree `~/workspace/worktrees/sim-wave5face-b`).
Frozen prereg: `evidence/2026-11-16/sim-wave5face-b-prereg.md` (commit
`414117e11`). Instrument: `scripts/wave5face-driver-20261116.js`,
`scripts/wave5face-analyze-20261116.js`,
`scripts/test-wave5face-b.js`, `scripts/wave5face-sense-20261116.js`
(reused stand199 instrument `scripts/standing199-instrument-20261110.js`
untouched). Anchor (both legs): the instrument commit. Policy:
competent verbatim, sha256
`df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`.
Band 102701–102708 (8 seeds, REUSED from sim-stand199-b — the named
follow-up on those exact seeds, not a fresh-band question), horizon
200d death-aware, OFF leg first (recorder off) then ON leg (recorder
on). No balanced panel (DIAG, no game change). No canon doc covers
the standing / scale system specifically (prereg CANON GAP, recorded
not invented); wave law from `docs/MONSTER-WAVES.md`.

## VERDICT — DIAG GO

All 4 frozen GO bars hold (see §GO bars). The instrument is valid and
the table is trustworthy. The verdict is the facing table itself:

**Yes — every released village faces wave 5, and fast. 5 of 5
released seeds faced by d200 (first facing 0–15 days after release),
15 engagements, 3 killed / 8 fled / 4 died. 102706, the seed this arm
exists for, released d151 and faced 3 wave-5 types starting d158
(Nielsen, then Timeslot, then Editor). But nobody survives the open
door: 0 of 8 villages alive at d200, national by rank 0/8, table 0,
wins 0. The facing is real; the wave-5 surviving is not.**

## Facing table — per released seed

| seed | release | first faced | days to face | engagements | killed | fled | died | w5 kills | fate by d200 |
|------|---------|-------------|--------------|-------------|--------|------|------|----------|--------------|
| 102701 | d102 | d109 editor | 7 | 3 | 2 | 1 | 0 | 2 | lost d126 |
| 102702 | d98 | d98 rerun | 0 | 3 | 0 | 0 | 3 | 0 | lost d160 |
| 102703 | d154 | d169 editor | 15 | 3 | 0 | 3 | 0 | 0 | lost d191 |
| 102704 | d115 | d118 cancellation | 3 | 3 | 1 | 1 | 1 | 1 | lost d146 |
| 102706 | d151 | d158 nielsen | 7 | 3 | 0 | 3 | 0 | 4 | lost d183 |

Released set in THIS run: 5 seeds — one more than stand199's 4.
102703 released d154, after the 150d horizon; the 150d-prefix check
is 8/8 identical to the committed stand199 ON corpus, so this is a
genuine 200d-horizon finding, not base drift (the r140 policy /
conversation changes moved nothing on this band). The other three
seeds (102705, 102707, 102708) stayed defer5-pinned to the end
(short: veterans, all three) and never faced wave 5.

Engagement outcomes, all 15: killed 3, fled 8, died 4. (See
§Correction 1 for why these totals differ from the prereg note's
claim — the corpus and the analyzer's re-derivation are the
authority, and the facing verdict is unchanged either way.)

## 102706, the seed this arm exists for

Released d151 on the post-horizon snapshot of the 150d run — the
door opened on the last possible day. In the 200d run it faced wave
5 three times: Nielsen d158 (fled, after a villager died to the wild
that day — see Correction 1), Timeslot d163 (fled), Editor d175
(fled). It killed 4 wave-5 monsters in total (w5kills 4) without any
killed engagement — the kills were of types already faced (the deed
feed dedupes by monster id, so repeat-type fights record no new
engagement) or via paths the wrap cannot see. Standing peaked at 525
(the highest on the band), the village still lost d183. The door
opened, the village walked through it, fought, killed, and died
anyway.

## 102702 — every facing cost a life

Three engagements (Rerun d98, Editor d144, Cancellation d155), three
death-days, zero kills. It is the only seed where no engagement ended
fled or killed. Its village lasted longest of the early releasers
(d160) and still lost. Wave-5 facing, on this seed, is a casualty
list, not a campaign.

## Wall numbers — ON leg (OFF leg beside it for the neutrality read)

| | ON leg | OFF leg |
|--|--------|---------|
| national by standing ≥200 | 5/8 | 5/8 |
| national by scaleRank | 0/8 | 0/8 |
| national or global | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave 4 unlocked | 8/8 | 8/8 |
| wave 5 unlocked | 5/8 | 5/8 |
| wave 5 faced (released seeds) | 5/5 | — (recorder off) |
| median survival | 139d | 139d |
| survived to 200d | 0/8 | 0/8 |
| wave-4 kills (total) | 28 | 28 |
| wave-5 kills (total) | 7 | 7 |
| deaths (total) | 128 | 128 |

Per-seed OFF/ON wall fields agree exactly (days, standing,
scaleRank, deaths, w4kills, w5kills identical per seed). **D2
full-band: 0 divergences** — the recorder moved nothing. Standing
199 recurs only as the pin that 3 seeds never escape; the 5 released
seeds all climbed past it (peak gated 300–525).

## Sense-testing

Sense leg: seed 102706 re-run with `captureSysSay`, trajectory
identity guard vs the ON corpus — **identical, 0 diffs, 181/181
days**. 1,777 System lines captured, 81 matching the facing filter.

The release IS voiced, and it reads like a show greenlight:

> "📡 The fifth draft stays in the wings. It wants a village that
> can fight — blood your fighters (0 of 2 veterans)."
> (repeated, counting up to 1 of 2, then:)
> "📡 RATINGS ARE UP... the Producers have greenlit the fifth draft.
> Wave 5 talent has been released."
> "📺 WAVE LEDGER — wave 5's bar is full (2/2 — kills only, not
> near-misses). That's the whole ledger — the village has bloodied
> the Producers themselves. No further casting directives. You're
> the show now."

The fight itself does NOT read as a fight. 60+ of the 81 facing
lines are the identical tick "✂️ RERUN ×4 The Editor's turn",
repeated round after round. The System announces the door opening
with fanfare and then narrates the combat as a repeated ledger tick.
Documented as a sense observation, not a verdict change: the facing
is measured by the deed feed, not by these lines.

## Village assessment

The villages on this band look like the release is a door, not a
road: every village that gets through it meets the Producers within
two weeks, and every one of them is dead by d200 — the longest-lived
released village (102703, d191) faced three types and killed none.
The standing wall is not the binding constraint past release; the
binding constraint is surviving the facing itself. Three villages
never release at all (veterans-short to the end), so the defer5 gate
still grounds 3/8 of the band. The wave-5 kill count (7) exceeds the
engagement-kill count (3) because the deed feed counts only the
first fight per type — the lower-bound caveat is load-bearing on
kills, not on facing.

## GO bars (frozen prereg §Primary metric)

1. **All 8 seeds produce valid corpora, 0 instrument errors** —
   PASS. 8 OFF + 8 ON files parse as JSON; `instrumentErrors` 0 on
   every ON file; reconciliation: recorded engagements ==
   `waveEngaged(5)` on every ON file (`facingReconcileMismatch:
   false` on all 8).
2. **Proof green** — PASS. `node scripts/test-wave5face-b.js`:
   **69 passed, 0 failed** on the instrument tip (commit
   `c6e9c07aa`). The worker's log records 42/42 at instrument
   time; the Correction 1 commit added fixtures (corrected-outcome
   + rederive cross-check), raising the count to 69 — verified by
   the adoption re-run below. D1 determinism + D2 neutrality green
   inside the proof; D3 analyzer re-derivation green (mismatch 0).
3. **Facing answered for ≥3 released seeds** — PASS. 5/5 released
   seeds answered (all faced); no seed died before its release day
   among the released set.
4. **Wall numbers reported** — PASS. Table above; ON national-by-
   standing 5, national-by-rank 0, table 0, wins 0, wave 4/5 8/5,
   median survival 139d, wave-4 kills 28, wave-5 kills 7, deaths
   128; OFF identical.

## Metric review (do NOT re-score; for the next run)

- **200d answered 102706.** Released d151, first faced d158
  (Nielsen), 3 types faced, 0 killed engagements, 4 w5 kills,
  lost d183. The question is closed: the d151 release faces wave 5.
- **Engagement without a kill is now measured: 12 of 15
  engagements end fled or died.** Only 3 of 15 end killed. The
  facing is common; the killing is rare.
- **Released set changed vs stand199 (+102703, d154).** 150d-prefix
  8/8 identical — no base drift; the extra release is a horizon
  effect, not a policy effect.
- **The lower-bound caveat is load-bearing on kills, not facing.**
  w5kills 7 vs engagement-kills 3: 102706's 4 kills produced no
  killed engagement (repeat-type dedupe / unseen paths). Any next
  arm that judges wave-5 KILLS must wrap the kill paths directly,
  not read them off engagements.
- **Evaded monsters and vDie field fights remain unmeasured.**
  Pre-combat evades never call `recordDeedFight` and villager
  deaths to never-faced types leave no record. The facing count is
  a lower bound by the engine's own deed definition; no seed's
  faced status depends on the gap (every released seed has 3
  recorded engagements).
- **200d was the right horizon** — releases at d154 and facings at
  d158–180 sit past 150d; a 150d horizon would have left 102706
  unanswered and 102703 unreleased. Every village was lost by
  d191, so a longer horizon would add nothing.
- **D2 full-band: 0 divergences.** The recorder moved nothing
  (identical days/standing/deaths/w4kills/w5kills per seed, OFF vs
  ON). 150d-prefix vs stand199: 8/8 identical.

## Correction 1 — the prereg's corrected totals were themselves wrong (adoption finding)

The prereg's Correction 1 note (written by the worker after the
judged sweep, before the evidence) says the corrected outcome
totals are killed 3, fled 10, died 2. **That is wrong. The corrected
corpus and the analyzer's re-derivation say killed 3, fled 8, died
4.** The adoption re-ran the analyzer on the corrected ON corpora
(`node scripts/wave5face-analyze-20261116.js`, exit 0,
`outcomeRederiveMismatches: 0`) and read every engagement out of
the corpus files directly.

What the worker's note missed: the corrected `died` rule (≥1 person
combat death that day — kind `villager`|`person` with cause 'the
wild', 'monster', or a wave-5 id/name) does not only flip the
Nielsen engagement (102706 d158, died → fled — the only death that
day was a monster the villagers killed). It ALSO flips two
engagements the v1 rule had called fled: 102702 d98 Rerun and d155
Cancellation, both days with a real villager wild-death that v1's
kind-read (`monster`/`wild` — kinds that never occur for villager
deaths) could not see. Their `combatDeathsSameDay` counts are 1 and
2 respectively. The two v1 `died` engagements the note names keep
their outcome with reduced counts (102702 d144 Editor 2→1, 102704
d118 Cancellation 4→1 — the monster-death rows no longer inflate
them).

So the full correction is: v1 K3 F9 D3 → corrected K3 F8 D4 (one
flip died→fled, two flips fled→died). The facing verdict is
UNCHANGED (5/5 released faced; 102706 faced 3 types) — only outcome
labels move, and the correction's frozen intent ("a combat death on
the engagement day, plausibly from that day's wave-5 fight") is what
the corpus implements. The on-disk `wave5face-b-analysis.json` was
the stale v1 output; the adoption overwrote it with the corrected
analyzer run (same filename, re-derived values). No GO bar moved:
the bars judge the instrument, and all four hold under the corrected
rule.

## Adoption notes (main session)

- Adopted from the dead 2230Z Loop B run: branch `sim-wave5face-b`,
  3 commits ahead of master at adoption (prereg `414117e11`,
  instrument `516524ba8`, Correction 1 `c6e9c07aa`), corpora +
  analysis + sense file uncommitted, no evidence .md. The worker
  was cancelled before writing the evidence file.
- The sense file (`wave5face-b-s102706-sense.json`) was already on
  disk uncommitted — the worker HAD run the sense leg (trajectory
  identical, 0 diffs). The adoption verified it by reading the
  file, not by re-running it (the script refuses to overwrite).
- Proof re-run on the pre-rebase tip: **69/69** (see §GO bars).
  The 42/42 in the worker's log was the pre-correction count.
- `git diff cc0daf6c9 -- src/` empty on the branch — DIAG,
  recorder wraps only. No game change, no lever. Evidence +
  corpora are the deliverable.
- Rebase onto current master, proof re-run, ff-merge, tree release
  by the adoption (see coordinator evidence).

## Corpora

- ON: `evidence/2026-11-16/perseed-wave5face-b-on/` (8 files +
  `wave5face-b-s102706-sense.json`)
- OFF: `evidence/2026-11-16/perseed-wave5face-b-off/` (8 files)
- Analysis: `evidence/2026-11-16/wave5face-b-analysis.json`
  (analyzer stdout: released 5, facedAmongReleased 5,
  totalEngagements 15, outcomeTotals killed 3 / fled 8 / died 4,
  D2 divergences 0, prefixIdentical 8, instrumentErrors 0,
  reconcileErrors 0, outcomeRederiveMismatches 0)

## Diff check

Zero `src/` changes in the branch diff — DIAG, recorder wraps only
(scripts-side). No game change, no lever, no balance change.
Nothing to land as gameplay; the evidence + corpora are the
deliverable.
