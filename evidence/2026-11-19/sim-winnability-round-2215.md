# Scale-onramp round 2215Z — adoption closeout (Loop A, axis scale-onramp)

**Run:** fleshout-20261119T2215Z · **Adoption agent:** 31c69d8c · **Master at closeout:** `6863c7b7b` (tip before this closeout commit; the arm merges landed at `677d40057`, then Loop B's deadtarget-diag-b landed `6863c7b7b` during closeout)
**Status: merged locally, pending ship.** Both arms verified from files/corpora (never from
the timed-out run's word), merged ff-only, gated, findings updated, worktrees released,
claim retired, lock deleted. No push, no version bump.

## What happened to the run

The run timed out at its 2-hour limit with arm 1 (fusioncell-participation) mid-sweep
(seeds 107032–107033 done, 107034–107038 unrun) and arm 2 (spearstage) fully designed but
unbuilt (prereg committed, no proof test, no analyzer, no pilot). The adoption finished
both from the frozen preregs: the fusioncell sweep was run to 8/8, analyzed, paneled, and
judged; the spearstage proof test and analyzer were written, self-tested, and the pilot
was run on a fresh paired band. No flap during this adoption (the 22:03–23:40Z window had
already cleared on a machine replacement). The main tree was dirty at adoption start
(102 staged entries from the Lane A r244 follow-up adoption's failed ff-only merge when
master moved under it) — the adoption did not touch the main tree's index; the r244
adoption repaired it and landed (`8bd330f22`, then ship bump `1cb6ce2e1`). Both branches
were rebased onto the moving tip before merging. The spearstage ff-merge failed once
(exit 128, diverging branches — the fusioncell merge had moved master first); the failure
was a clean pre-check abort (main tree stayed 0 entries), the branch was rebased onto the
new tip, proofs re-run, and the merge landed. The safe-commit index clobber struck on all
three arm commits (fusioncell evidence, spearstage instrument, spearstage evidence) —
repaired each time via `git ls-tree -r HEAD | git update-index --add --index-info`;
every commit verified correct. The 18:15 Loop A occurrence found both worktrees'
heartbeats 17–18 min stale and stood down correctly; heartbeats were re-stamped on
receipt and kept under 15 min for the rest of the adoption.

## Arm 1 — sim-fusioncell-participation-a: DIAG-GO (#2599 answered)

The follow-up to the 1815Z fusioncell fix (NO-GO, reverted): who leads wave-4+ fights, and
why do armed parties flee? Fresh band 107031–107038, 8 seeds × 150d, single leg,
substrate SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1.

- All three frozen bars hold: lead rule attributed 125/125 = 1.000 (bar ≥ 0.80);
  flee cause classified 75/75 = 1.000, unclassified 0 (bar ≥ 0.80, ≤ 2); pool floors
  125 meetings / 75 flees (floors 25 / 8). Analyzer selftest 39/39.
- Who leads: world-tick 61/125 (49% — fights arrive unled), expedition-holder 34,
  aid 30. Why they flee: hopeless-after-help 53/75 (71% — engaged, called help, still
  cannot win), floor-hp 11, wise-leave 11. The dominant flee is a correct read of an
  unwinnable fight — the damage wall, not a courage wall.
- Armed-holder pool is EMPTY: 0 armed entries, 0 armed leads, 0 armed volleys in 125
  meetings. One level up: **0 searcaster holders in all 8 villages** (5 single-cell
  appearances, max 1 cell ever, 79 cell-holder-days). The 1815Z finding (one armed
  holder never leads) is sharpened: on a fresh band there is no armed-holder population
  at all. **#2599 ANSWERED at the supply level — the next lever is searcaster supply
  to villagers, not holder bravery.**
- Panel: single-leg zero-delta screen (`review_required`, won 0→0, tied 8/8).
  Wall: wave 4 8/8, wave 5 4/8, national 0/8, wins 0/8, median 143d, deaths 614
  (6.20 per engaged meeting), standing-199 stall 4/8.
- Merged ff-only: prereg `ac81f22d0`, instrument `303d5f418`, smoke `09797c5bd`,
  evidence `4d1a80e55`. Evidence: `evidence/2026-11-19/sim-fusioncell-participation-a.md`.

## Arm 2 — sim-spearstage-a: NO-GO, killed cleanly (#2590 stays open on the serve half)

Gate+source TOGETHER under live BOWCRAFT ground. The SPEARGATE fix is already landed;
this arm measures whether passed spear-holders actually get served. Fresh paired band
107041–107048, 8 seeds × 2 legs × 150d, legs differing only by SPEARGATE.

- Gate replication is PERFECT: pool 49 (floor 10), pass rate 49/49 = 1.000, ctl pass 0,
  alreadyHad consistency delta 0 (101 vs 150−49), noSource consistency delta 0
  (130 vs 81+49). Proofs: spearstage test 26/26, analyzer selftest 49/49, speargate
  31/31, bowcraft 58/58, all re-run green after each rebase.
- **SERVED FAILS: arm staged 1 − ctl staged 1 = 0 (bar ≥ 3).** FromStash 0, fromArmory
  0, crafted 1 on BOTH legs — the single crafted bow came from a non-spear departure;
  the 2 craftedFails are the same seeded-identical departures on both legs. **48 of
  49 passed spear-holders land in noSource.**
- **Volley-rate rise FAILS: 0.500 − 0.500 = +0.000 (bar ≥ +0.10).** Fight populations
  byte-identical both legs (pair 10 meetings, trio+ 6; funnel 27 encounters, 13 pair
  launches). All cost bars pass trivially because nothing changed — the gate is
  provably harmless and provably inert on this band.
- Why: a departure craft needs PERSONAL bow knowledge (lv[bow] ≥ 1, seeded only by
  seeing an equipped bow) plus materials, and no bows sit in stash/armory. The proof
  test shows the craft fires the moment knowledge + materials are present — in live
  play they almost never are for spear-holders. **The blind spot is closed at the
  classification step and open at the supply step: the next lever is bow-knowledge
  reach for spear-holders (or bows in stash/armory), not the gate.**
- Metric review owed: the frozen noSource consistency bar as written (no term for
  staged) is satisfiable only while arm.staged ≤ 3, meeting SERVED exactly at 3. It
  did NOT bind here (staged 1, delta 0), so the verdict is clean — but the partition
  formula (minus arm.staged) must replace it before any run that could serve 4+.
- Panel compare `review_required`, every observed metric delta 0 (won 0→0, deaths
  101→101, communityLost 0.375→0.375). Wall: wave 4 8/8, wave 5 7/8, national 0/8,
  wins 0/8, median 150d, community lost 3/8.
- Merged ff-only: prereg `813684856`, instrument `9dcb6e40e`, evidence `677d40057`.
  Evidence: `evidence/2026-11-19/sim-spearstage-a.md`.

## Gate

- `node scripts/check.js --quick`, full log `evidence/2026-11-19/check-quick-round-2215.log`:
  **339 passed, 5 failed — 0 attributable.** The 5 are the standing set: the
  measurement-proof staleness pair (`test-measurement-proof-update.js`,
  `test-measurement-workflow.js` — proof re-sign round 22 still owed), the stale
  phone-frame receipt (`test-phone-frame-proof.js`), and two 120s timeouts under
  load (`test-living-garden-deed-attainment.js`, `test-one-person-army-deed-attainment.js`).
  This round changed no game code (fusioncell is evidence-only; spearstage measures
  an already-landed fix), so nothing here can be a regression from it. Gate 339/5,
  same count as round 1815Z.

## Open items carried forward

- #2599 CLOSED (answered: searcaster supply is the binding constraint). Next lever:
  searcaster supply to villagers.
- #2590 OPEN on the serve half (gate half confirmed). Next lever: bow-knowledge reach
  for spear-holders, or bows in stash/armory.
- Metric review owed: noSource consistency bar needs the partition formula before any
  run that could serve 4+ spear-holders.
- Standing-199 stall recurs on both bands (fusioncell 4/8, spearstage 1/8 at exactly
  199 — seed 107042); the wall list is unchanged: launch decision + damage, deed gate
  after national, wave-5 survival, party decay by death.
- No game-code change lands from this round (fusioncell is evidence-only; spearstage
  measures an already-landed fix and kills its serve bar). Nothing to ship beyond the
  evidence and instrument.
