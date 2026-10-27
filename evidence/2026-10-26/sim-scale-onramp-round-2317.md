# sim-scale-onramp-round-2317 — coordinator evidence (axis scale-onramp)

Run: flesh-out loop, run fleshout-20261026T2317Z. Axis scale-onramp
(converging, NOT converged). Sibling loop B live on food-economy the
whole run (claim fleshout-loop-b-20261026T2309Z, cattailband +
driedpath, NOT touched); B landed its coordinator evidence
(e69842153) mid-run and both A branches rebased cleanly onto it,
re-proved, then merged ff-only. No file overlap anywhere (arms vs
each other, arms vs B range). MEASUREMENT ONLY — zero src/js, no
default flips, no lever proposals, no steve-call items smuggled
(TB channel reset and situation-blind table talk were explicitly
out of scope for both arms).

Pre-registration (run-level): take the 2141Z next blanks in order —
(1) storage-level ammo census, (2) 213-HP SEQ51 gap trace — each arm
with its own pre-registered DIAG-GO bar in its prereg file, on the
shared tableseat-nowait substrate, seeds 73671–73678, 180d
death-aware horizon, re-baseline vs the 1920Z band table first.
Both arms re-baselined EXACT and passed their recorder-neutrality
(G2) gates 8/8, so the two corpora are directly comparable and the
wall numbers below are one band, twice measured.

## Arm 1 — sim-ammostorage-a (24828c416, proof 161/0): DIAG-GO

Question: volley-a found 0 carried ammo in 1179 field fights, but
saw only the fighter. Does ammo sit in village storage and never
reach a pack? Answer, fight-time census on 1179/1179 fights and
12/12 wave-4 fights, gates exact vs volley-a on all 8 seeds:

- Stone → sits in storage, never reaches packs. Communal pile > 0
  at 1172/1179 fight moments; fight-row median 189 stones, max 724
  (per-seed maxima 101–724). All 100 G6 sling fights had stone in
  the pile. Sharpest row: 73673 d105, sling vs algorithm, 346
  stones in the pile, fighter carries 0.
- Arrow → one arrow, one person, two seeds. The entire village
  arrow economy on 73672 (from day 40) and 73676 (from day 1) is
  exactly one arrow in one person's personal stash, never carried,
  never communal, never spent. The other 6 seeds never hold an
  arrow on any of 1206 daily snapshots.
- Bolt → never acquired at all. Zero in every bucket, every
  fight, every snapshot — despite 122 crossbow fights that need
  bolts. Heartseeker arrows and fusion cells: likewise never
  acquired.
- Carried-but-not-equipped: rejected (0 fighters carry ammo
  unequipped; only 8 fights carry a spare ranged weapon, still
  zero ammo). No-storage-concept: rejected (storage exists —
  communal pile, sections, personal stashes, pantry — but no
  section accepts ammo and no code path moves ammo into a pack).

Evidence: evidence/2026-10-26/sim-ammostorage-a.md + prereg +
perseed-ammostorage-a/ (16 per-seed JSONs + summary.json).
Reading discipline carried forward: fight-row sums are presence
counts, not holdings — holdings are daily maxima. The village
holds at most one arrow; any future quote of "202 stashed
arrows" from a fight-row sum would misread this corpus.

## Arm 2 — sim-seq51gap-a (841ce5c31, proof 182/0): DIAG-GO

Question: w4dmg-a's documented gap — 73672 influencer seq51, field
end 799 HP (d143), tb-start tile read 586 HP (d148), no recorded
fight in between. Answer, daily world-entity HP tick, window days
143–148 all present, exactly 2 steps, both accounted:

- d143 field fight ends 799 (damage 24, villager flees).
- d144 tick: 799 HP, tile 4,5, right next to Haven 4,4.
- d145 tick: 586 HP, lingering true, lingerSince 144,
  lastRaidDay 136 → 144. The 213 HP went to the day-144 night's
  palisade raid wall: drop 213 == round(850 × 0.25) exactly,
  havenTier 3, drafted as the nearest monster to Haven, unmet by
  defenders, so it lingered from day 144 until the day-148 tb
  bump. No seq51 field fight occurred days 144–148 (verified).
- The day-148 tb-start tile read (586) agrees with the
  day-145–147 ticks (586), so the tile-vs-entity measurement
  difference alternative is ruled out for this window.

Band-wide unaccounted after the arm's disclosed analyzer
corrections: drops 0, rises 0 — every wave-4 HP change in the
corpus is accounted (incl. seq45 day-112 chained C3 restores,
five exact; seq26 C2 with the 1-HP floor, 175 → 1; seq41 C2 via
tick-row raid detection; seq43 phantom pair from no-fight titan
startCombat bumps, excluded as non-fights and counted).
Sense note: the raid wall itself leaves no per-monster
transcript trace — a player would experience the weakening
without an in-fiction reason (filed as a findings-blank, not a
lever). New blank: the final-loss non-restore — C3 restores work
between chained same-day fights, but the entity never reappears
in daily ticks after the chain's final loss (seq51 post-tb
restore prediction 850 fails; entity absent from tick day 148
onward despite apparently met conditions).

Evidence: evidence/2026-10-26/sim-seq51gap-a.md + prereg +
sense .txt + perseed-seq51gap-a/ (16 per-seed JSONs +
summary.json).

## Wall numbers (both arms agree exactly — one band, twice measured)

Wins 2/8, national-ever 6/8, national-final 5/8, table 4/8,
entered 2/8, wave-4 6/8, wave-5 0/8, wave-4 kills 0/8, median
survival 152d, max 180d, deaths 307, starvation 1, max Arc 4.
Death-cause shares (seq51gap corpus): villager combat 41.0%,
villager-vs-villager combat 27.7%, player arena 14.0%, expedition
4.2%, rest small. The wall is unwinnable fights plus unmet
monsters, not hunger.

## Village assessment, in plain words

The village is the same village the last three rounds measured —
it reaches the wider world (national in 6 of 8 runs) and even
sits at the lesser table twice, but it cannot kill the wave-4
monsters and cannot reach wave 5 or the full seat. This round
closed two mysteries that made that wall look stranger than it
is. First, the fighters are not just unlucky with ranged weapons
— the ammunition is not where the fighting is. Stones pile up
by the hundreds at home and never get put in a pocket; arrows
barely exist (one arrow, in one person's stash, on two seeds);
crossbow bolts are never made at all, even though villagers
carry crossbows into 122 fights. Second, the monster that
seemed to lose 213 health for no reason actually lost it to the
night raid wall — the palisade toll took exactly a quarter of
its health while nobody was watching, and the monster then
lingered by the village for days. So the wall now has three
priced layers, not two: monsters are unmet (no one is sent to
them), unbeatable (field damage ~24 per meeting vs 850+ health,
and the big-damage channel resets every time), and unequipped
(the ranged weapons the village owns have nothing to shoot
with). Nothing in this round changes the game — both arms were
measurements — so the wall numbers did not move, and were not
expected to. What moved is the explanation: the equipment gap
is now a storage-to-pack gap, not a supply mystery, and the
213-HP gap is closed, not open.

## Blanks filled or documented

- FILLED (measurement): storage-level ammo census — stone
  piled never pocketed, arrows down to one stashed unit, bolts
  never made (ammostorage DIAG-GO).
- FILLED (measurement): 213-HP SEQ51 gap — day-144 palisade
  raid wall, drop == round(850 × 0.25), lingering to d148
  (seq51gap DIAG-GO).
- DOCUMENTED (findings backlog, 3 lines appended): single-arrow
  arrival micro-blank; final-loss non-restore; raid wall leaves
  no per-monster transcript trace.
- CARRIED, not touched: TB channel reset (steve-call); 213-HP
  SEQ51 gap is now closed and drops off the carried list;
  situation-blind table talk (ruling pending); dead-entry drop
  ruling (Steve, carried); remaining 1354Z steve-calls.

## Metric review

Pre-registered DIAG bars judged as written, never re-scored:
ammostorage required ≥95% fight-time census rows and 100% of
wave-4 fights — delivered 100%/100%. Seq51gap required every
window day present and every change accounted or explicitly
unaccounted with candidates — delivered fully-accounted, 0
unaccounted band-wide. No metric proved wrong this run; no
revision proposed. The telemetry deviation check's LOUD lines
(national 12→0, wins 16→0, both corpora) are the known
regime + recorder-row artifact class from prior rounds (the
checker reads top-level keys that recorder rows do not carry;
the WINSEAT baseline is a different regime from this pre-seat
substrate) — baseline NOT rolled, no new investigation, same
adjudication as 2016Z/2141Z. Both arms' own wall numbers were
verified in their proofs (re-baseline EXACT), so the LOUD
lines contradict no measured number.

## Infrastructure

- Sibling B landed mid-run (e69842153); both A branches
  rebased cleanly (ammostorage once, seq51gap twice — the
  second rebase after the first merge moved master), re-proved
  after every rebase (161/0 and 182/0), then merged ff-only.
  No conflicts, no file overlap.
- Safe-commit index clobber hit both worker commits (reported
  by both arms, repaired via HEAD-blob cacheinfo, commits
  verified correct); it did NOT hit this coordinator commit
  (status verified empty after commit — see closeout).
- No EPERM flap on .git ref writes this run. Worktree
  registration was slow (~5 min/tree, sibling git contention)
  — delay, not failure.
- check.js --quick NOT re-run (zero src/js; arm proofs are the
  attributable evidence), consistent with 2016Z/2141Z.

## Tracker note (for the tracker update)

scale-onramp stays converging (NOT converged): wave 5 still
0/8, wave-4 kills still 0/8, full seat unreached — but the two
2141Z next blanks are now closed with named causes, and the
wall's mechanism gains a third priced layer (unequipped:
storage-to-pack ammo gap). food-economy stays converging
(untouched; sibling loop B). Rotation left at 3 (convergence
work does not cycle it). Claim deleted; lock deleted.
Merged locally, pending ship — the ship job owns version
bumps, pushes, and live verification.
