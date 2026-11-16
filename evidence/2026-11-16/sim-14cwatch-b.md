# sim-14cwatch-b — §14c watch on seed 100633: STOPPED at determinism D1 (tip drift)

**Verdict: STOPPED — no judged sim ran, no band spent, no verdict on
reproduction.** The frozen determinism check (D1) failed: the control
leg on re-confirm seed 100633 does not reproduce the re-confirm's
published per-seed numbers on this tip. Per the arm brief, a D1
failure means stop and report — do not silently re-baseline. This
file is the record of that stop.

Run: fleshout-loop-b-20261116T1530Z (Loop B), arm sim-14cwatch-b
Axis: winnability chain. Tracker blank #7 first half / 0430Z blank
#4: §14c watch on seed 100633.
Branch: sim-14cwatch-b — worktree ~/workspace/worktrees/sim-14cwatch-b
Tip at stop: 47477d874 (sim-winnability-round-1321 coordinator
evidence). Worktree clean at stop.
Date: 2026-11-16.

## The question (unanswered)

The 0430Z courtship re-confirm (band 100621–100636, 200d) tripped
the §14c guardrail on seed 100633: villager deaths 68 armed vs 39
control (+74%), a real rate increase (33.8 vs 23.4 deaths/100d),
and seed 100628 sat exactly at +50% (72 vs 48). The question was
whether it reproduces on a fresh band or was a one-seed artifact.
That question is NOT answered by this arm — no fresh-band sim ran.

## Canon note

docs/CANON.md was read in full. **No canon doc covers
courtship/diplomacy death effects** — the manifest's nearest docs
are docs/CONVERSATIONS.md (dialogue/talk/gossip) and docs/MAP.md
(travel); neither says anything about whether courtship or
diplomacy changes who dies in combat. Nothing was invented to
fill the gap; the prereg was never written because the arm stopped
at the instrument check before any judged sim.

## What the re-confirm numbers actually were (re-derived from its corpus)

Before writing the prereg, the re-confirm corpus was re-read to
pin the classifier the brief told this arm to reuse. Finding: the
driver's `villagerCombatDeaths` field counts **all** non-player
deaths, not combat deaths. On seed 100633:

| leg | driver field | true combat (kind `monster`, player false) | non-combat villager |
|---|---|---|---|
| control | 39 | 36 (30 `villager combat` + 6 `combat`) | 3 (thirst 1, starvation 1, `monster` 1) |
| armed | 68 | 66 (43 + 23) | 2 (`monster` 2) |

So the guardrail trip is, in combat-only terms, **66 vs 36
(+83%)**, not 68 vs 39 (+74%). Band-wide (16 seeds, pooled,
exposure = sum of daily roster size from the series):

- Combat deaths pooled: control 1280, armed 1126 — **ratio 0.88**
- Combat rate per 1000 villager-days: control 54.95, armed 50.16
  — **ratio 0.913**
- Per-seed combat-count ratios (armed/control): 0.45–1.83; only
  2/16 seeds ≥1.5 (100628 at 1.73, 100633 at 1.83); non-combat
  villager deaths are flat (93 control vs 92 armed).

Read: on the re-confirm band the armed leg kills FEWER villagers
in combat overall; 100633 (and 100628) are per-seed outliers
against a band-wide pattern of armed ≤ control. That is the
context a fresh-band rerun would have tested — a pooled ratio
near 0.9 would have said NOT REPRODUCED; a pooled ratio ≥1.5
would have said REPRODUCED. The frozen decision rule was never
written because the arm stopped first.

## D1 — determinism check (the stop)

Check: `oneRun(100633, 'competent-covenant-b', {days: 200})`
from scripts/onlylead-driver-20261115.js (reused verbatim, zero
driver edits), compared field-by-field against the stored
re-confirm record
`evidence/2026-11-16/perseed-courtship-reconfirm-b-control/courtship-reconfirm-b-s100633-competent-covenant-b-courtship-reconfirm-b.json`
(anchorCommit 04b45a930, the re-confirm instrument commit).
Env: defaults (COUNTER_ANSWER, COMPETENT_FLEE_REPAIR,
ANSWERMAIL_DRIVE all unset), matching the re-confirm.

| field | stored (re-confirm) | rerun (this tip) |
|---|---|---|
| gameDays | 167 | **171** |
| days | 166 | **171** |
| endReason | village-lost | village-lost |
| scaleRank | regional | regional |
| maxWave | 4 | **5** |
| standing | 199 | **455** |
| deaths | 52 | **55** |
| villagerCombatDeaths | 39 | **43** |
| waveKills | {1:17, 2:13, 3:8, 4:3} | **{1:21, 2:14, 3:7, 4:5}** |
| seriesDays | 165 | **169** |
| verbEvents | 102 | **106** |
| linkLines | 900 | 900 |
| deaths identical in order | — | **no** |

**D1: FAIL.** The same seed, same policy, same driver, same env
produces a different village on this tip: it lives 4 days longer,
reaches wave 5, and ends with more than double the standing.

## D1 is drift, not nondeterminism (self-repeat)

The check was run twice in separate fresh processes; the second
rerun reproduced the first rerun EXACTLY (gameDays 171,
standing 455, deaths 55, waveKills {1:21, 2:14, 3:7, 4:5}).
The instrument is deterministic on this tip. The divergence is
tip drift in the game, not a broken driver.

Drift surface: 18 `src/js` commits between the re-confirm
instrument commit 04b45a930 and this tip 47477d874 (112 commits
total), including journey r223/r224/r225 (conversation/stage
changes) and the seedpaths / launchdef / profilegate / dawnbid
vetparty seed-call arms (each landed then reverted — net-zero
in the final tree, but the journey changes remain). No single
commit was bisected; that is the coordinator's call, not this
arm's — the brief says stop, not bisect.

## Seed-band freshness (verified, NOT spent)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
exact-seed grep over all dated preregs
(`evidence/*/sim-*-prereg.md`), the convergence tracker, scripts/,
evidence filenames, and evidence `sim-*.md` files:

- **102221–102228: FRESH** — zero hits anywhere. (The only
  "1022" hits in goal hidden_files are kcal literals, e.g.
  "+1022 kcal", not seeds.)
- 102231–102238: FRESH — zero hits anywhere (reserve, unverified
  beyond the same grep).

Neither band was spent: no judged sim ran, no per-seed file was
written, no prereg froze a spend. The coordinator may reuse
102221–102228 for the rerun of this arm.

Never-reuse bands (unchanged): 102201–102208 (seasoning),
102141–102148 (Loop A live), 100621–100636 (re-confirm),
100601–100608, 100641–100648, 100761–100768.

## What was NOT done (per the stop)

- No prereg was frozen or committed (a prereg freezing a decision
  rule against a non-reproducing baseline would be misleading).
- No fresh-band sim ran; no `perseed-14cwatch-b-*` corpora exist.
- No `scripts/test-14cwatch-b.js` was written — the measurement
  it would prove never ran. The D1 check script lived in /tmp
  and is not committed; the comparison table above is the record.
- No analyzer was written; no panel was built.
- No verdict (REPRODUCED / NOT REPRODUCED / INCONCLUSIVE) exists.
- No claim file, no tracker edit, no sim-findings.md edit.

## What the coordinator needs to decide

1. **Re-baseline or re-anchor?** The D1 failure blocks the arm
   as briefed. Options: (a) re-run the arm with fresh baselines
   recorded on the current tip (the armed-vs-control comparison
   on one fresh band is internally valid on any tip — the
   re-confirm numbers are motivation, not the judge); (b) check
   out the re-confirm base and run the fresh band there, then
   rebase; (c) bisect which of the 18 src/js commits moved
   seed 100633 before re-running.
2. **The classifier correction stands regardless:** any rerun
   should define combat deaths as kind `monster` AND player
   false (66 vs 36 on 100633, +83%), and report the driver's
   `villagerCombatDeaths` field as all-villager deaths — the two
   differ by the non-combat villager deaths (3 vs 2 on 100633).
3. **The band-wide context matters for the rerun's bar:** on the
   re-confirm band the pooled combat ratio was 0.88 with only
   2/16 seeds ≥1.5. A fresh-band pooled ratio ≥1.5 would be a
   genuine reversal of that pattern, not a confirmation of the
   band's own trend.

## Files changed (this arm)

- `evidence/2026-11-16/sim-14cwatch-b.md` — this file (the stop
  record). Zero `src/js`. Zero policy edits. Zero driver edits.

## Commit

Evidence-only commit via scripts/safe-commit.sh. No push, no
version bump. Report: "STOPPED at D1 — tip drift, no judged sim,
band unspent".
