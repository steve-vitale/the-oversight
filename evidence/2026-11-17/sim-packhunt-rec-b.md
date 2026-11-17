# sim-packhunt-rec-b — Pack Hunt recorder fix (finding #2497)

Arm: instrument fix, zero game-code change. Prereg:
evidence/2026-11-17/sim-packhunt-rec-b-prereg.md (committed before any
code change, 68502215). Branch: sim-packhunt-rec-b. No new sim band —
the verdict rests on the frozen band 103601–103608 from
sim-partysize-allycap-b.

## What was wrong

The post-call HP recovery (`recoverMHpStart`,
scripts/fightallycap-driver-20261117.js, the #2488 recorder repair)
recovered spawned monster HP as `rec.mHpLeft + rec.mDealt`. A
Beastmaster's Pack Hunt harries the monster for 2–4 per round as a side
effect on the lead body — src/js/godpath.js `fieldStrike`:
`c.lead.hp -= hd`, log line `the pack harries it for N.` — counted in
NO dealt total (`gpOut.dealt` never includes it; no `rec.mDealt`
addition exists on that path). So the recovery understated spawn HP on
Beastmaster fights, and any damage share using recovered HP
(`mDealt / mHpStart`) overstated the Beastmaster's share slightly.
The recovery's comment ("Wave-4/5 monsters are pack-1, so mDealt is
lead-only and the sum is exact") was wrong for Beastmasters.

Canon: no canon doc covers the sim recorder (docs/CANON.md lists no
recorder doc). The fix is grounded in src/js/godpath.js `fieldStrike`
and the frozen fight logs, not in invented canon.

## The fix (confined to the HP recovery)

scripts/fightallycap-driver-20261117.js only — the landed copy of the
recorder (its `recoverMHpStart` body is byte-identical to the unmerged
partysize driver's copy in the held tree sim-partysize-b; that branch
file is not touched and needs the same patch if ever revived):
- New `packHarryTotal(rec)`: sums `the pack harries it for N.` lines
  in the record's log (0 when the log is absent or no harry fired).
  Exported for the proof test.
- `recoverMHpStart` now returns `mHpStart = mHpLeft + mDealt +
  packHarryTotal(rec)` on fought non-kill rows, and returns
  `mPackDealt` on every path (0 when no harry fired; still reported
  on vKill rows, where HP stays null by definition).
- The driver stores `row.mPackDealt` on every v4encounters row, so
  future corpora carry the pack channel explicitly.
- The wrong "lead-only and exact" comment is corrected in place, with
  the Bird Strike scope boundary noted (see below).
- NOT touched: the analyzer's verdict logic (it prints GO on unjudged
  B2 by design — left alone); any game code (`src/` diff is 0).

## Before / after — the 6 known mismatch rows

Frozen band 103601–103608, 320 encounter rows. Pre-fix, exactly 6 rows
disagreed with CONTACTREC's `rec.mHpStart`; all 6 reconcile exactly
after the fix (fixed = stored `mHpStart` + parsed pack total):

| seed | leg | day | monster | outcome | diff | harries | before (mHpStart) | after (fixed) | CONTACTREC |
|------|-----|-----|---------|---------|------|---------|-------------------|---------------|------------|
| 103604 | ctl | 95 | congregation | vFlee | 9 | 4+2+3 | 923 | 932 | 932 |
| 103606 | arm | 133 | editor | vFlee | 7 | 2+3+2 | 1848 | 1855 | 1855 |
| 103606 | arm | 135 | editor | vFlee | 12 | 4+4+4 | 1488 | 1500 | 1500 |
| 103606 | arm | 136 | editor | vFlee | 10 | 2+4+4 | 1122 | 1132 | 1132 |
| 103606 | arm | 137 | editor | vFlee | 7 | 3+2+2 | 964 | 971 | 971 |
| 103606 | arm | 141 | editor | vDie | 9 | 3+4+2 | 331 | 340 | 340 |

One of the six is on the CONTROL leg (FIGHTALLY2 off), so this is not
an ally-cap artifact. A 7th harry row on the band (103605 arm d101 vs
audit, pack 10) is a vKill: HP stays null by definition, pack total
still reported — the fix correctly leaves it alone. No other row on
the band carries a harry line; no Bird Strike line (`the birds tear
at it for N.`) exists anywhere on the band.

## No-verdict-move re-check (frozen analyses re-run)

Method: the partysize analyzer (scripts/analyze-partysize-b.js) was
copied to /tmp (original untouched — it writes its output into its own
tree) and run twice: (a) baseline, on read-only copies of the frozen
corpora; (b) corrected, on copies with the fixed recovery applied
(`mHpStart += pack`, `mPackDealt` recorded; 6 rows changed, total
pack 64 across the band incl. the vKill row's 10).
- Baseline re-run is BYTE-IDENTICAL to the frozen
  partysize-allycap-b-analysis.json — the re-run setup is faithful.
- Corrected re-run differs from baseline in exactly 20 JSON paths,
  all accounted for: recMismatch 1/5 → 0/0 (leg totals, per-seed,
  bars); the 6 rows' `mHpStart` corrected; the 6 rows' per-meeting
  shares ticking down (e.g. 0.4894 → 0.4765, 0.1473 → 0.1459 — the
  overstated Beastmaster shares corrected); plus the scratch-dir
  basenames in the output header (an artifact of the re-run setup,
  not a measurement).
- Nothing else moves: B1 PASS, B2 UNJUDGEABLE (fewer than 3 size-4
  launched fought meetings with a captured share), B3 PASS,
  instrument CLEAN, missingHp 0/0, launched mean share ctl 0.0185 /
  arm 0.4, size-4 mean share arm 1.0, wall numbers identical
  (ctl: nationalStanding 1, nationalRank 0, table 0, wins 0, wave4
  7/8, wave5 1/8, median survival 151; arm: nationalStanding 4,
  nationalRank 0, table 0, wins 0, wave4 8/8, wave5 4/8, median
  148.5). The 6 rows are not launched meetings, so no launched share
  moves at all.
- Verdict: the analyzer prints GO on both re-runs (its mechanical
  verdict passes on unjudged B2 by design — untouched, per brief).
  The run's reported NO-GO came from the prereg's B2-unjudged rule,
  which still holds (B2 stays unjudged). No verdict moves either way.

## Proof

scripts/test-packhunt-rec-b.js — PASS, 48/48 checks, on the branch
tip (node scripts/test-packhunt-rec-b.js):
- §1 synthetic: pack parser (sums harry lines, ignores strike lines,
  0 on missing log), fixed recovery on fought rows with/without
  harry, evade/alreadyDead/rounds-0 null rules, vKill null-HP with
  pack reported, null-record and field-less pre-call fallbacks,
  negative clamp, and the Bird Strike boundary (bird-tear lines are
  NOT counted — asserted explicitly, see findings).
- §2 frozen rows: all 6 rows embedded verbatim (stored log lines,
  mDealt, mHpStart, mHpStartRec) — stored mHpStart + parsed pack ==
  CONTACTREC exactly, and the fixed recovery returns CONTACTREC
  exactly on each reconstructed record.
- §3 live harness (seed 103601): a staged Pack Hunt holder
  (`npcAbilities = ['pack_hunt']`) fighting a wave-4 editor through
  the real fieldFight harries for 9; the fixed recovery equals
  CONTACTREC (1839 = 1775 + 55 + 9, inside the def range
  [1500,1900]). A fresh-load no-pack control recovers by the old sum
  exactly (1564 = 1556 + 8, pack 0).

Regression: scripts/test-fightallycap-b.js still 22/22 green;
`node --check` on the edited driver passes; `git diff --stat -- src/`
is empty.

## Metric review

The primary metric proved right as stated: the 6 rows reconcile to 0
mismatch, with the reconciliation computable directly from the frozen
rows (stored mHpStart + parsed pack total) without any new sims. One
wording correction for the record: the prereg said "re-deriving every
row's recovered HP with the fixed rule" — the frozen rows do not store
mHpLeft, so the re-derivation is `mHpStart + pack` (algebraically the
fixed rule, since stored mHpStart IS mHpLeft + mDealt), plus the
analyzer re-run on corrected corpora. No metric change is proposed:
the next damage bar can now use recovered HP, with `mPackDealt`
available as the explicit pack channel. The Bird Strike sibling
channel stays out of scope (zero lines on the frozen band) and is
filed as finding #2501; the same hole in analyze-killfail-a.js is
finding #2502. Neither was folded in unproven.

## Scale wall (from the frozen re-run, unchanged)

National standing 1/8 ctl, 4/8 arm; national rank 0/8 both; table 0/8;
wins 0/8; wave 4 reached 7/8 ctl, 8/8 arm; wave 5 unlocked 1/8 ctl,
4/8 arm; median survival 151d ctl, 148.5d arm.

## Out of scope, filed not chased

- Finding #2501 (sim-findings.md): Bird Strike harries 8–12/round
  via the same side-effect shape in `fieldStrike` ("the birds tear
  at it for N.") and is likewise absent from `rec.mDealt`. Zero bird
  lines on this band, so it is unmeasured — a follow-up arm, not
  folded in here.
- Finding #2502 (sim-findings.md): analyze-killfail-a.js
  `effectiveMhp` "reconstructed" method (`mHpLeft + mDealt`,
  claimed "exact unless the monster healed or grew") has the same
  Pack Hunt hole; a Beastmaster fight it classifies understates entry
  HP by the harry total. Separate analyzer, separate arm.
- The unmerged partysize driver in the held tree carries the
  byte-identical old recovery; if that branch is ever revived it
  needs this same patch (and its recorder test's exact-shape
  assertions updated for the new `mPackDealt` return field).
