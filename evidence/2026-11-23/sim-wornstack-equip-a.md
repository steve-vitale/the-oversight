# sim-wornstack-equip-a — scholar equip/unequip worn-stack collapse (finding #2707)

Arm: sim-wornstack-equip-a (Loop A, axis scale-onramp)
Run: fleshout-20261123T0815Z
Verdict: **GO — fix landed as its own commit** (proof 21/21 new, 9/21 old)
Finding: #2707 (open, sim-findings.md). Sibling of #2698 (mantleBecome,
  FIXED ff17699c7). Frozen prereg:
  evidence/2026-11-23/sim-wornstack-equip-a-prereg.md
Proof test: scripts/test-wornstack-equip-a.js

## What the fix does, in plain words

When you wear something from your pack, the game used to take the whole
stack out of the pack and put one copy on your body — but the copy
forgot how many were in the stack. Wearing a stack of two stone knives
destroyed one knife; wearing a 2-cell stack as a trinket lost the second
cell. Taking it off again was no rescue: unequip always put exactly one
back. The round trip pack → body → pack lost one unit of anything
stacked. The same collapse already bit succession (#2698, fixed); this
was the player's own hands doing it.

The fix carries the stack size onto the worn copy (only when there is
more than one — a single item still wears bare, exactly as before) and
puts the same number back when you take it off. Overwriting one worn
stack with another now returns the displaced stack whole, too. Nothing
is granted: it only stops destroying units the player already owned.
No player-visible behavior change beyond the missing units coming home.

## Canon note

READ docs/CANON.md first. No canon doc covers equip/unequip stack
units — nothing was invented. The fix follows the already-landed
mantle rule (#2698, same >1 carry rule as toScholarItem #807) and the
honest single-unit rule the accessory path already uses.

## Changes

- `src/js/game.js` `equip()` — worn entry carries `units` when the
  source stack holds more than one; the displaced piece on overwrite
  returns with its own units (`_displaced.units || 1`) instead of a
  hardcoded 1.
- `src/js/game.js` `unequip()` — pushes the worn entry's own units
  (`eq.units || 1`) instead of a hardcoded 1.
- `scripts/gunloss-recorder-a.js` — the scholar census counted worn
  cells per slot (`cellsEq += 1`), which under-read a worn 2-cell stack
  by one and would have reported a phantom loss after this fix (it
  already misread after the mantle fix). It now counts the worn
  entry's units. Snap shape unchanged; the analyzer is untouched.
  Finding #2707 itself names this recorder correction as the follow-up.
- `scripts/test-gunloss-a.js` — four assertions updated: they encoded
  the old collapse as expected behavior (worn 1 cell, total 1,
  scholar +1, net loss 1 cell). The honest readings after the mantle
  fix + recorder fix are 2 / 2 / +2 / 0 cells. Design changed on
  purpose; the test was updated in the same commit, per repo rules.

Audited, no change: `keepsakes.js` equipAccessory (moves exactly one
unit — honest already) and its unequip wrapper (returns the whole
entry, units intact); `equipment.js` migrateEquipment (moves slot keys
only, never rebuilds entries); `villager-build.js` mantleBecome
(already fixed, ff17699c7).

## Proof results (old code vs new code)

Proof test `scripts/test-wornstack-equip-a.js`, staged fixture: stone
knife units:2 ×2 + fusion_cell units:2 + stone knife units:1 (the
geared shape omar carried on seed 107369).

| check | old code | new code |
|---|---|---|
| weapon round-trip: worn knife carries units:2 | FAIL (bare entry) | PASS |
| weapon round-trip: pack holds 5 again after unequip | FAIL (pack=4) | PASS |
| trinket round-trip: worn cell carries units:2 | FAIL (bare entry) | PASS |
| trinket round-trip: pack holds 2 cells again | FAIL (pack=1) | PASS |
| displacement: displaced stack comes home units:2 | FAIL (pack=2) | PASS |
| displacement + totals conserved at every step | FAIL (total 3–4) | PASS |
| single unit stays bare, no inflation | PASS | PASS |
| staging / slot-landing checks | PASS | PASS |
| **total** | **9/21** | **21/21** |

Old-code failures are exactly the stack/conservation assertions; the
staging, slot-landing, and single-unit-bare checks pass on old code,
proving the test measures the defect, not the harness. (One nuance
against the frozen bar 6: the conservation checks also fail on old
code — they count the same lost units, so they fail as a consequence
of the defect rather than independently. The final "single: pack holds
5" check fails on old code only because earlier sections already lost
knives — cumulative pack state, same defect.)

Regressions, all on fixed code:
- `scripts/test-wornstack-mantle-a.js` — 13/13.
- `scripts/test-gunloss-a.js` — 42/42 (after the four stale-collapse
  assertions above were updated to the fixed reality).
- `scripts/analyze-gunloss-a.js --selftest` — 20/20.

## Metric review

This is a fix + proof-test arm, not a balance lever: no before/after
sim panel, no seed band — the binding metric is the round-trip
itself, per the frozen prereg. The round-trip proved sufficient: it
caught all three collapse sites (equip seat, unequip return,
displaced-piece return) and the coupled instrument misread. One
metric weakness found while running it: the frozen bar 6 ("FAILS
exactly the stack assertions and passes the rest") was too narrow —
conservation checks fail on old code too, because they count the same
lost units. Proposed revision for the NEXT run's prereg template:
word the control bar as "fails exactly the defect-measuring
assertions (stack + conservation) and passes the harness checks
(staging, slot-landing, single-unit)". Not re-scored mid-run.

## Diag (non-gating): Omar's corpse thread, existing corpora only

Question: omar's corpse (searcaster + worn cell, day 136, seed
107369) was never looted — is scholar-corpse gear ever taken on the
gunloss band?

From the gunloss corpus itself
(`evidence/2026-11-22/perseed-gunloss-a-diag/gunloss-a-s107369-gunloss-a-diag.json`,
145 days, 1 seed):
- 50 corpseTakeEvents, ALL `toKind: "scholar"` — the only corpse
  looting the instrument sees is the scholar looting corpses. Zero
  searcaster/fusion_cell takes. Zero takes on days 134–137; the single
  take after Omar's day-136 death is a suburb trophy on day 138.
  Omar's gun + worn cell were never taken. This reproduces the
  gunloss-a verdict (0 matching corpse-takes) from the corpus file.
- 8 scholar deaths on the band (player:true rows); Omar day 136 "the
  wild" is the last. After a scholar dies, succession makes a new
  scholar — a different person, wherever they are — while the dead
  scholar's corpse sits where they died, in the wild.

From the corpsecap band (`evidence/2026-11-21/sim-corpsecap-a.md`,
seeds 107271–107278, 150d): 32 gun-days stranded on corpses; both
stranded guns survived the cap. ONE was recovered — by the scholar,
the day its holder died (seed 107275: the scholar strips the whole
death pack in one pass, nine `loot_taken` rows including searcaster +
fusion_cell). The other sat on its corpse 27 days to run end
(107277). The follow-on on 107275 proves the pattern: gen_mw19eak
takes the gun day 113, dies day 116 in the wild, and the gun sits on
HIS corpse untaken while the village collapses (days 116–120,
village-lost day 121).

Answer: scholar-corpse gear IS taken — but only by the living
scholar, only as a same-day bulk strip, and only when the scholar
happens to be at the corpse. A scholar who dies in the wild leaves
gear the next scholar never goes back for. Omar's case is the norm,
not the exception. Caveat: the gunloss corpus's corpseTakeEvents
record scholar takes only — whether villagers ever loot a scholar's
corpse is unmeasured on this band, not proven absent. No lever
proposed: the corpse system (silent bulk take, no grief beat) is a
design question already filed in corpsecap §5, and this diag does not
block the fix.

Stale-corpus note: `evidence/2026-11-22/gunloss-a-analysis.json`
still carries the OLD readings for the day-134 mantle event
(scholarCells: 1, delta scholarCells +1, net loss 1 cell) — it was
computed with the old recorder. The per-seed file's event deltas are
likewise pre-fix. Not recomputed: no new sweeps were authorized for
this arm, and re-analysis cannot change event deltas recorded by the
old instrument. A future gunloss re-run will read 0 net loss for the
same transfer.

## Check.js --quick (run twice)

- Run 1 (default jobs): 339 passed, 5 failed in 606s.
- Run 2 (--jobs 2, full log): 339 passed, 5 failed in 1291s. The five:
  - `test-one-person-army-deed-attainment.js` and
    `test-living-garden-deed-attainment.js` — 120s timeout each under
    check.js; both pass standalone (one-person-army exit 0 in ~140s;
    neither touches equip/unequip — only a setup `s.equipped = {}`).
    Pre-existing slowness under parallel load, not this change.
  - `test-measurement-proof-update.js`,
    `test-measurement-workflow.js`, `test-phone-frame-proof.js` — fast
    failures, all proof-freshness (stale neutrality/phone receipts).
    Proven pre-existing: all three fail identically with this arm's
    changes stashed (base commit 80e7da0bc). Out of scope here —
    refreshing the measurement proof needs a fresh real
    observer-neutral re-observation, and the phone-frame proof needs
    actual browser receipts per MOBILE-PLAYTEST.md. Flagged to the
    coordinator; not fixed in this arm.

## Out-of-scope findings (for the coordinator)

- Pre-existing stale proofs at this worktree's base (80e7da0bc):
  `test-measurement-proof-update.js`,
  `test-measurement-workflow.js`, `test-phone-frame-proof.js` all fail
  with this arm's changes stashed. The measurement proof needs a fresh
  real observer-neutral re-observation; the phone-frame proof needs
  actual browser receipts. Neither is this arm's to refresh.
- None new beyond the diag above. The recorder correction and the
  four stale test assertions were inside this arm's scope (named in
  #2707 and the frozen prereg) and are landed here.
