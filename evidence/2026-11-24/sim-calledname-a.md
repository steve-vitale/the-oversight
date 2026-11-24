# sim-calledname-a — drift lines + journal speak the use-name

**Run:** Loop A fleshout-20261124T1215Z, axis scale-onramp · **Arm:** sim-calledname-a ·
**Base:** `c329b477d` (master tip at worktree creation) · **Band:** 109431–109446
(departteach pooled 16-seed band, REPLAY — no new seeds spent) · **Branch:**
`sim-calledname-a`, worktree `~/workspace/worktrees/sim-calledname-a` ·
**Prereg:** `evidence/2026-11-24/sim-calledname-a-prereg.md` (frozen 2026-11-24
12:29 UTC; re-anchor note below) · **Findings:** sim-findings.md lines 2742
(#2741: calledName drift line speaks the true name) + 2743 (#2742: no canon
doc covers the overheard name-reveal channel).

## 1. The defect — findings #2741 + #2742

When a companion has a bestowed use-name (Ash), the departure beat says "Ash"
(beatName → npcName) but the teach's drift line speaks the TRUE first name
("Ashley"), because `revealName` (game.js) read `v.name`, not `npcName`. The
journal's name entry did the same (journal.js read `vp.name` directly). After
the teach, `displayName` renders her as "Ash" everywhere — only the drift
line and the journal disagreed with the village. The overheard-chat path
(game.js:19504) already speaks the use-name itself; only the drift line it
triggers leaked the true name. Coordinator decision (1115Z run, Steve can
overrule): the drift line speaks the USE-name. The journal follows it for
consistency (see §8 — Steve/coordinator can overrule the journal half
separately).

## 2. The fix — commit `3a6e4fec` [needs-eyes]

Two one-token edits, no flag, no new system:

1. `src/js/game.js`, `revealName`: `const first = (v && v.name) ?
   String(v.name).split(' ')[0] : 'Someone';` → `const first =
   this.npcName(vid);` — `npcName` already returns "Someone" for a nameless
   record, so the NAMELESS guard behavior is preserved. All three channels
   (intro / overheard / gesture) speak the use-name when one exists, else
   the true name, exactly as before.
2. `src/js/journal.js`, the revealName wrap: `const first = (vp.name ||
   'Someone').split(' ')[0];` → `const first = (typeof this.npcName ===
   'function' ? this.npcName(vid) : (vp.name || 'Someone').split(' ')[0]);`
   — the journal's name entry records what the scholar actually heard.
3. `docs/KNOWLEDGE.md`: a line registering the overheard channel and its
   scope ("Overheard names are earned too" — name only; mechanics stays
   gated on `goalsKnown`/`systemArrived`; the spoken name is the use-name
   when one exists, else the true name). This closes finding #2742.

Nothing else changes: `knownNames` writes, the `systemArrived` /
already-known early returns, `canShow` gating, the beat text, and every
caller are untouched.

**Re-anchor (recorded, not hidden):** the prereg froze FROZEN_BASE as the
prereg commit (`c5c048654`), on the departteach pattern of running with
the fix uncommitted. This arm committed the fix first (the task brief
directs committing the work), so honoring that anchor would have needed a
detached-HEAD checkout + cherry-pick dance; the checkout stalled 22 min
on a full-tree re-hash (the worktree is 22 GB; the index repair had
emptied stat info) and was killed with HEAD and worktree intact. The
anchor therefore moved to the fix commit `3a6e4fec`, which contains the
prereg commit as an ancestor; the corpora record `anchorCommit` +
`gameSha` + `winplanSha`, so code identity is still proven exactly.
Coordinator may overrule and demand a re-run on the prereg anchor
instead.

**Adoption note (finisher, 2026-11-24 ~14:00Z):** the 1215Z coordinator
timed out after running the before-leg replay with the fix reverted in
the worktree, and the restore step (from `/tmp/calledname-fix-backup`)
died with the VM restart ~11:28Z, which wiped /tmp. No data was lost:
the fix was committed at `3a6e4fec`, so the finisher restored
`src/js/game.js` + `src/js/journal.js` from the fix commit itself
(`git checkout HEAD --`), kept the worktree's re-anchored driver (the
instrument actually used for the replay), re-ran the proof test 19/19,
verified the B3 sensitivity split 11/8 on base code, and ran the two
control analyzer comparisons in §5. The lock had already been deleted
by stale-lock recovery (same-call cat + run_id verify; no live
coordinator process, heartbeats 15–60 min stale).

## 3. Proof test — `scripts/test-calledname-a.js`

**19/19 PASS** (first run by the arm; re-run green by the finisher after
the restore). §A code pins (revealName reads npcName; journal wrap
reads npcName; the 19504 caller speaks npcName and calls
`revealName(otherId, 'overheard')`). §B staged fixtures on the real
Game (pre-System, day 6, holder known / companion unknown — the
departteach repro shape): B1 direct `revealName(vid, 'overheard')` on
Ash (true "Ashley Kim", calledName "Ash River"): drift line says "Ash"
(never "Ashley"), `knownNames` set, `displayName` "Ash", journal name
entry "Ash". B2 real `winPlanDepartLaunchBeat` with Ash as companion:
beat line "…with Ash after Herald…", drift line "…Ash…". B3 no-use-name
companion Mara: drift line says "Mara" (true name, exactly as before).
B4 intro + gesture channels on Ash: both speak "Ash". B5 already-known
idempotent + post-System no-op. B6 nameless record: "Someone", no throw.
B7 no over-reveal: mechanics still gated after the teach; journal holds
a name-only entry.

**B3 sensitivity (verified by the finisher, not taken on trust):** the
same test run on base code (`c329b477d` game.js/journal.js checked out
into the worktree, then restored from the fix commit) gives **11 passed,
8 failed** — exactly the claimed split: the use-name assertions (B1/B2/
B4, plus the B7 journal-name check) fail speaking "Ashley" everywhere,
and the no-use-name pins (B3/B5/B6) pass. The instrument detects the
fix's absence.

## 4. Corpus replay — departteach band on fixed code

Driver: `scripts/calledname-driver-a.js` (byte-copy of the departteach
driver, re-anchored to the fix commit — §2). Substrate env identical to
departteach: `GUNRATE=1 CELLGATE=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1`; `KILLBUNDLE`,
`LEND`, `PRESENCE`, `HPGATE`, `PINQUAD`, `PLANRESEED` unset. Policy
`competent` verbatim. Horizon 150d death-aware. Seeds 109431–109446.

- **Arm leg** (`evidence/2026-11-24/perseed-calledname-a-arm/`, 16 files):
  replay on the FIXED code. `anchorCommit 3a6e4fec`, `gameSha
  e5fb4ad9aeb0`, `winplanSha 040d95c8a92a`, `brainSha f9cf9be25ede`,
  `policySha 1884c8852d38`, 0 instrument errors on all 16 files.
- **Before leg** (`evidence/2026-11-24/perseed-calledname-a-before/`, 16
  files): the same driver on the SAME seeds with the fix reverted in the
  worktree (game.js/journal.js at base). `anchorCommit 3a6e4fec`,
  `gameSha 950901f3fdcc` — the unfixed game hash, identical to the
  recorded departteach arm corpora — `winplanSha 040d95c8a92a`,
  `brainSha f9cf9be25ede`, 0 instrument errors on all 16 files. This leg
  is the control the prereg did not foresee needing (see §5): it isolates
  the fix from everything else that moved since the departteach recording.
- **Recorded before-leg** (`evidence/2026-11-24/perseed-departteach-a-arm/`,
  16 files): the departteach arm corpora from the 0915Z round.
  `anchorCommit 68c229aa`, `gameSha 950901f3fdcc`, `winplanSha
  040d95c8a92a`, `brainSha dc247673d540`, `policySha 1884c8852d38`.

**0 use-named drift lines in either replay corpus** (no file in either
dir mentions "Ash" at all): the 5 recorded teaches are Lucas, Alfredo,
Howard, Ethan, Paola, none bestowed a use-name in sims — the naming
rite is a player action, sims never bestow. Per the prereg §6
denominator honesty, B1 is therefore carried by the proof test alone
and the corpus contributes B2 identity only. That is stated here, not
re-scored as a corpus pass of B1.

## 5. Analyzer — `scripts/analyze-departteach-a.js`

**`--selftest` 15/15 PASS.** Three comparisons run (all exit 0, 0
instrument errors):

| Comparison | meta | line | struct | teach | totals |
|---|---|---|---|---|---|
| Recorded departteach-arm → calledname-arm (preregged) | 8 | 7 | 8 | 10 | taught 5=5, drift 5=5, deaths 1509→1533, launches 51→48 |
| Recorded departteach-arm → calledname-before (control 1) | 8 | 7 | 8 | 10 | taught 5=5, drift 5=5, deaths 1509→1533, launches 51→48 |
| calledname-before → calledname-arm (control 2) | **0** | **0** | **0** | 10 | taught 5=5, drift 5=5, deaths 1533=1533, launches 48=48 |

The preregged comparison FAILS its written bar (meta/line/struct all
non-empty — e.g. seed 109434: deaths 81→64, launches 5→0, days 150→69,
survived→village-lost; seed 109433: 8 beats → 3). But control 1
reproduces the failure EXACTLY on identical code: the same 8 meta
mismatches, the same 7 line mismatches, the same totals (deaths
1509→1533, launches 51→48 in both). The divergence is therefore NOT
caused by the fix — it is the replay failing to reproduce the recorded
corpora. Two causes, both documented: (a) the substrate moved between
the departteach recording (0915Z) and this replay — `brainSha`
dc247673d540 → f9cf9be25ede (villager-brain.js changed; rearm-witness,
holdrepeat and other landings in between); (b) the deepening-r278
per-seed isolation leak — outcomes are position-dependent within a
process, so a replay in a different driver process is not expected to
reproduce recorded corpora byte-for-byte.

Control 2 is the valid no-regression comparison — same driver, same
process shape, same seeds, only the fix differs — and it is clean:
**0 meta, 0 line, 0 struct mismatches; deaths, launches, days,
endReason, teach counts and drift counts identical on all 16 seeds.**
The fix changes nothing in the wild.

The `teach: 10` entries in all three comparisons are the analyzer's
known mislabel, declared non-judged in the prereg §5: the analyzer
assumes the before leg is a control that teaches 0, but the before leg
here teaches 5 (it IS the departteach arm corpora). Totals confirm
taught 5 = taught 5 and drift 5 = 5 in every comparison. The analyzer's
verdict label (`EXTEND-BAND`) fires on the meta mismatches and is not
judged, per the prereg.

**B2 adjudication (same shape as holdrepeat-fix-a §4):** B2-as-written
FAILS on the recorded comparison, but the failure is demonstrated
instrumental — the control reproduces it on identical code — and the
valid within-driver comparison passes 0/0/0. B2 is adjudicated PASS on
the substantive fields. The fix is trajectory-neutral on measured
evidence.

## 6. Wall numbers (arm leg, 16 seeds)

Wins 0/16, national 0/16 (standing max 525), table 0/16, wave-5 reached
9/16, wave-4 reached 16/16, median survival 136.5d, survived 6/16
(village-lost 10/16). The departteach pooled band read the same wall
(wins 0, national 0, table 0, wave-5 9/16, median 134.5d). The scale
wall stands, unchanged by this arm — as expected: a name-consistency
fix is not a scale lever.

## 7. Sense test — staged fixtures (no wild use-named line exists to quote)

From the proof test fixtures (real Game, §3): the beat says "…with Ash
after Herald…", the drift line says "…Ash…", `displayName` reads "Ash",
the journal reads "Ash (overheard by the fire)". Pre-fix, the same
fixtures said "Ashley" in the drift line, the intro, the gesture, and
the journal — four surfaces disagreeing with the beat the village
already hears. Post-fix all four agree, and the no-use-name control
(Mara) is byte-identical to before. In the wild corpora there is no
use-named drift line to read aloud — sims never bestow a use-name, so
the wild sense-test is the absence itself, plus the 0/0/0 trajectory
identity in §5.

## 8. Village assessment (plain words)

Nothing in the village moved, and that is the result. Sixteen villages
lived the same 150 days with the fix as without it — the same deaths,
the same launches, the same endings, seed for seed. The only thing that
changed is what a villager is called when the scholar first hears her
name by the fire: the village already calls her Ash, the beat already
calls her Ash, and now the drift line and the journal call her Ash too.
The one open judgment is the journal's: recording the use-name makes
the scholar's private note agree with what was actually heard, but a
case could be made that the journal should keep the true name as the
scholar's own record. The drift line decision is the coordinator's
(1115Z, Steve can overrule); the journal follows it here for
consistency, and either half can be reverted alone — they are two
one-token edits in two files.

## 9. Judgment vs frozen bars

- **B1 (PRIMARY — mechanism, proof test): PASS** — 19/19 post-fix;
  drift lines, beat, displayName and journal all speak the use-name on
  staged use-named companions.
- **B2 (NO-REGRESSION — corpus replay): ADJUDICATED PASS** (§5) —
  0/0/0 mismatches on the valid within-driver comparison; the preregged
  recorded comparison fails 8/7/8 for demonstrated instrumental
  reasons (control reproduces it on identical code).
- **B3 (SENSITIVITY): PASS** — pre-fix run 11 pass / 8 fail, verified
  by the finisher (use-name assertions fail, no-use-name pins pass).
- **B4 (NO OVER-REVEAL): PASS** — B3 + B7 green; no other fixture
  surface changes.
- **B5 (INSTRUMENT): PASS** — analyzer `--selftest` 15/15; 0 instrument
  errors on all 16 replay files in all three comparisons.
- **B6 (PILOT GATE): GO** — B1+B2+B3+B4+B5 all pass as adjudicated.
  No confirm spend: the corpus is a replay, not a new band.

**Verdict: GO.** The drift line and the journal now speak the name the
village already uses, proven on staged fixtures and proven to move
nothing in the wild.

## 10. Metric review

- **The recorded-corpus comparison is not a valid B2 instrument across
  a moved substrate.** The departteach corpora were recorded on a
  different `brainSha`; the replay cannot reproduce them even on
  identical code (control 1: same 8/7/8). Future narration-fix arms
  should pre-register a same-driver before-leg replay as the B2
  reference — this arm's `perseed-calledname-a-before/` is that pattern
  — and treat a recorded-corpus compare as descriptive only.
- **Analyzer labels mislead when before != ctl.** The `EXTEND-BAND`
  verdict and the 10 teach mismatches both assume the before leg
  teaches 0. The prereg declared the label non-judged; the raw fields
  are the judgment. A future analyzer pass could take a `--before-teaches`
  flag, but no instrument change is owed by this arm.
- **The corpus is the wrong instrument for a narration-consistency
  fix, except as no-regression.** B1 is carried by the proof test
  alone (0 use-named drift lines in the wild corpora, as expected).
  Proposed revision for the next run, per the prereg §8: narration
  fixes judge on the fixture + a corpus no-regression replay, with no
  teach-rate bar at all.
- **Journal question (open, Steve/coordinator can overrule):** is
  recording the use-name in the journal the right call, or should the
  journal keep the true name as the scholar's private note? The drift
  line decision is theirs; the journal follows it here.

## 11. Closeout

- Game code: `src/js/game.js` (revealName), `src/js/journal.js`
  (revealName wrap) — two one-token edits, both in commit `3a6e4fec`.
- Docs: `docs/KNOWLEDGE.md` (+15 lines, overheard channel registered)
  — same commit.
- New files: `scripts/calledname-driver-a.js` (1100 lines, re-anchored
  to the fix commit — committed with the adoption commit below),
  `scripts/test-calledname-a.js` (19/19),
  `evidence/2026-11-24/sim-calledname-a-prereg.md`,
  `evidence/2026-11-24/sim-calledname-a.md` (this file),
  `evidence/2026-11-24/calledname-a-analysis.json`,
  `evidence/2026-11-24/calledname-a-analysis-before-vs-recorded.json`,
  `evidence/2026-11-24/calledname-a-analysis-before-vs-arm.json`,
  corpora `evidence/2026-11-24/perseed-calledname-a-arm/` (16 files) +
  `evidence/2026-11-24/perseed-calledname-a-before/` (16 files).
- Findings #2741 + #2742 updated in hidden_files/sim-findings.md
  (status [open] → [fixed]) with the adoption annotation; line numbers
  verified by grep (2742 = drift line, 2743 = canon doc).
- Adoption: finisher restored the fix from the committed fix (the /tmp
  backup was wiped by the VM restart), re-ran proof 19/19, verified B3
  11/8, ran all three analyzer comparisons, wrote this evidence. The
  driver re-anchor + corpora + analyses + this file land in the adoption
  commit on branch `sim-calledname-a`.

## 12. Convergence state

Axis scale-onramp: converging. The calledName drift line now speaks the
use-name (finding #2741 FIXED) and the overheard channel is registered
in canon (finding #2742 FIXED). Next blanks in order: (1) wave-4 fight
recheck #2538/#2544 (sim-fightcap-recheck-a never registered — cap hit
16/16; carries to the next Loop A run as blank #1); (2) a seat-answering
variant that walks doors other than Feared (path diversity).
