# sim-instrument-a — instrument blanks #3 + #4 (tooling-only arm)

**Arm:** sim-instrument-a · **Loop A run:** fleshout-20261124T1815Z · **Axis:** scale-onramp
**Branch:** `sim-instrument-a`, base master `04918a1e2` (Version bump 36a420d16-20261124-182835).
**Blanks:** #3 (analyzer label fix) + #4 (gate-replication counters) from the
"Next blanks" list in `evidence/2026-11-24/sim-scale-onramp-round-1715.md`.
**Canon:** `docs/CANON.md` + `docs/MONSTER-WAVES.md` read. No canon doc covers the
sim analyzers / drivers — stated here rather than inventing one. The SPEARGATE
definitions below are cited from code (`src/js/game.js` `villagerStageBow`,
`src/js/villager-agency.js:523-524` call site), not canon.
**No `src/js` changes. No wall numbers** (tooling-only arm — no sims were judged;
the proof test + analyzer selftests are the gate, per the brief).

## Fix 1 — fightcap analyzer label (blank #3)

**Problem.** `scripts/analyze-fightcap-a.js` `judge()` returned `DIAG-GO` with kind
`THIN-POOL` whenever the trio+ pool was thin (n < 10) — while the frozen prereg
ladder requires pair-inclusive n ≥ 10 for `DIAG-GO`. A reader seeing `DIAG-GO`
in the analysis JSON thinks the recheck passed its bar; it did not, by one
meeting (recheck arm pair n = 9).

**Change (label only).** The thin-pool verdict is now **`DIAG-THIN`** (kind stays
`THIN-POOL`). No computation, threshold, or classification changed: the
`!poolOk` branch is the only line touched, plus its selftest expectation and a
comment explaining why the name must never read `DIAG-GO` again.

**Companion update (same commit, same reason).** `scripts/test-fightcap-recheck-a.js`
§B pinned the old label (`judge verdict DIAG-GO kind THIN-POOL`); updated to
`DIAG-THIN` (check + header comment). Repo rule (AGENTS.md): a test that breaks
because the design changed on purpose is updated in the same commit, and the
change is said here. No other consumer keys off the fightcap verdict string:
`analyze-fightcap-dmg-a.js` reuses only `legStats` (own judge), and the sibling
confirm arm judges by its own prereg numbers, not by this string — its numbers
are untouched (see reproduction below).

**Brief wording note.** The brief said "an n ≥ 10 input with full classification
yields DIAG-GO". That name was never the non-thin verdict: `judge()` returns
`GO` on a full pool with all bars passing and `DIAG-GO` only on a thin one.
Renaming the thin-pool verdict to `DIAG-THIN` leaves `GO` exactly as it was;
changing the full-pool pass verdict to `DIAG-GO` would have violated the
label-only constraint and the reproduction requirement. The proof test pins
`GO` for the full-pool case and `DIAG-THIN` for the thin-pool case, and fails
if `DIAG-GO` ever appears again.

## Fix 2 — bowopen gate-replication counters (blank #4)

**Problem.** Neither the bowopen driver nor the analyzer emitted `spearSeen` /
`spearPassed`, so the prereg's gate-replication check (`spearPassed/spearSeen
== 1.0` both legs) was unmeasurable. The bowknow-a precedent cited in the
prereg had those counts; this instrument (a clone of the speargate driver)
did not. Note the precedent's shape: bowknow-a ran `BOWOPEN=1` on BOTH legs,
so staging (and the gate telemetry inside it) ran on both legs. In the
bowopen-recheck the legs differ by `BOWOPEN` itself, so on the ctl leg staging
never runs and the gate is never reached — the counters are genuinely
unobservable there, not zero.

**Definitions** (from `src/js/game.js` `villagerStageBow` + the
`villager-agency.js` departure call site; one `villagerStageBow` call = one
departure gear-up, after gear-up/heal-check/sick/range gates, before pocketing
ammo):
- `spearSeen` — departures whose equipped ranged entry is a spear: a melee
  weapon sitting in the ranged slot, carrying no `weapon.ammo`. Counted by the
  game code on every staging call that sees one (pure observation).
- `spearPassed` — of those, the ones the gate passes over to the sources
  (`SPEARGATE` on only — the gate read uses `volleyWeaponOf` when on,
  `rangedWeaponOf` when off). `spearPassed <= spearSeen` by construction:
  the pass bump happens only inside the same sighting, when the gate is on.

**Driver change** (`scripts/bowopen-driver-recheck-a.js`): each per-seed output
now carries explicit top-level `spearSeen` / `spearPassed`, read from the live
`village.bowOpen` counters at run end, and the per-seed CLI log line carries
them too. When staging never ran (`BOWOPEN` off — the ctl leg),
`village.bowOpen` is absent and both counters are **`null` (unobserved),
never 0**: a zero would claim the gate saw nobody, which is unmeasured. When
staging ran, a missing key means zero seen (the game bumps the key only on
sighting), so `bowOpen`-present yields an exact count, including a true 0.

**Analyzer change** (`scripts/analyze-bowopen-a.js`): `legStats()` aggregates
the driver's explicit per-seed fields into per-leg `spearSeen` / `spearPassed`
/ `spearPassRate`, plus `spearCountersKnown` and `spearFiles` (how many valid
files carried the counters). A leg is KNOWN only when EVERY valid file carries
both fields; otherwise the leg reports **unknown (`null`, known false)** —
never a partial sum, never 0, never a faked rate. A known leg with zero seen
has rate `null` (0/0 is undefined), which is distinct from unknown. The
analyzer reads the driver's explicit fields ONLY — never the legacy `bowOpen`
object (see the hand-read note below). `judge()` is unchanged: the counters
explain the gate-replication check, they are not a verdict bar, and the
bowopen-recheck **NO-GO stands as judged** (not re-scored).

**Hand-read note (not analyzer output).** The raw `bowOpen` objects inside the
bowopen-recheck arm corpora incidentally carry the game-code telemetry:
arm total `spearSeen 30 / spearPassed 30` (5 of 8 files carry the key; the
other 3 saw zero spear-holders), ctl `bowOpen` null on all 8 files. That
corroborates the gate passing everything it sees on the arm leg — but the
analyzer still reports the recheck corpora as unknown, because those corpora
predate the driver fields the analyzer's contract reads. The distinction is
deliberate: only driver-emitted fields under the defined contract count as
measured.

## Proof test — `scripts/test-instrument-a.js` (new, 19 checks)

Written FIRST, failing before the fix (4 passed / 15 failed pre-fix), green
after (19/19, exit 0, ~60s):
- **§A label (5 checks):** thin pool n=5 and n=9 → `DIAG-THIN` / `THIN-POOL`,
  never `DIAG-GO`; full pool n=12 all-pass → `GO` (unchanged); full pool
  under bar → `NO-GO` (unchanged).
- **§B analyzer counters (5 checks):** synthetic with-counters leg aggregates
  (6/6, rate 1.0, known); without-counters leg unknown (null, never 0, never
  a faked rate); mixed leg unknown (no partial sum); the real bowopen-recheck
  ctl AND arm corpora unknown on both legs.
- **§C driver smoke (9 checks):** two 30d sims via `oneRun` — arm seed 110201
  (BOWOPEN=1): counters present, `passed <= seen`, staging ran; the analyzer
  reports the smoked arm corpus with the same numbers. Ctl seed 110202
  (BOWOPEN unset): counters `null`, `bowOpen` null; the analyzer reports the
  smoked ctl corpus as unknown. Smoke corpora live in `os.tmpdir()`; nothing
  is written into the repo.

## Verification

- **(a) Nov 18 frozen fightcap corpora reproduce identically.** Fresh analysis
  vs `evidence/2026-11-18/fightcap-a-analysis.json`: deep-equal except the
  verdict string (`DIAG-GO` → `DIAG-THIN`, kind still `THIN-POOL`). Arm trio+
  3 meetings, arm pair 22 (4 wins, 2 kills), ctl pair 4.
- **(b) fightcap-recheck corpora reproduce identically.** Fresh analysis vs
  `evidence/2026-11-24/fightcap-recheck-a-analysis.json`: deep-equal except
  the verdict string (`DIAG-GO` → `DIAG-THIN`). Arm trio+ 5 meetings, arm
  pair 9 (0 kills), ctl pair 3.
- **(c) bowopen-recheck corpora analyze identically.** Fresh analysis vs
  `evidence/2026-11-24/bowopen-recheck-a-analysis.json`: every pre-existing
  field deep-equal; verdict unchanged `NO-GO`; new spear fields unknown
  (null/null/null/false) on ctl, arm, ctlPair, and armPair. Arm pair 11
  meetings, kill share 0, damage/round 36.5; ctl pair 21.
- **Selftests green:** `analyze-fightcap-a.js --selftest` **20/20** (unchanged
  count); `analyze-bowopen-a.js --selftest` **37/37** (33 old + 4 new spear
  checks: aggregate 10/9 rate 0.9; unknown without fields; unknown mixed;
  known-zero distinct from unknown).
- **Dependent analyzers green:** `analyze-fightcap-dmg-a.js --selftest`
  **10/10**; `analyze-arrowsupply-a.js --selftest` **28/28** (it reuses
  bowopen `legStats`; additive fields only).
- **Recheck proof test green:** `scripts/test-fightcap-recheck-a.js`
  **29/29** (exit 0, incl. §B regression + §C driver smokes).
- **Driver CLI end-to-end smoke:** one arm seed via the CLI (30d, seed 110201,
  full substrate + `BOWOPEN=1`): exit 0, log line carries
  `"spearSeen":0,"spearPassed":0`; written corpus file carries the same
  (19 staging calls: alreadyHad 13, noSource 6 — zero spear-holders departed,
  so 0/0 is a true known-zero). Smoke corpus dir removed afterwards;
  worktree clean.

## Files

- `scripts/analyze-fightcap-a.js` — thin-pool verdict `DIAG-GO` → `DIAG-THIN`
  (+ selftest expectation, + comment).
- `scripts/analyze-bowopen-a.js` — per-leg `spearSeen` / `spearPassed` /
  `spearPassRate` / `spearCountersKnown` / `spearFiles` aggregation with
  unknown-on-missing rule (+ 4 selftest checks).
- `scripts/bowopen-driver-recheck-a.js` — explicit per-seed `spearSeen` /
  `spearPassed` on the output + CLI log line (+ header comment).
- `scripts/test-instrument-a.js` — new proof test, 19/19.
- `scripts/test-fightcap-recheck-a.js` — §B label expectation `DIAG-GO` →
  `DIAG-THIN` (same-commit update, see Fix 1).
- (this evidence file)

No files of the confirm arm (`sim-fightcap-confirm-a`) or the bowopen /
fightcap corpora were modified. No `check.js` full gate was run (tooling
only; no `src/` change) — the proof test + analyzer selftests are the gate,
per the brief.

## Commits (branch sim-instrument-a)

- (to follow — instrument fixes + proof test + evidence, one commit)
