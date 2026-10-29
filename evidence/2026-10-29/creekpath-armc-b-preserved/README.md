# Held Loop B originals — preservation record (gaps coordinator #2, 2026-10-29)

Three 0330Z-era Loop B trees (sim-nighttravel-bank-b, sim-nighttravel-verdict-b,
sim-creekpath-armc-b) sat dirty for a day with their owners long done. Byte-level
inspection found nearly everything in them ALREADY on master via rebased copies —
this commit preserves the only unique content found. Everything else in those
trees is redundant; the trees are released after this commit and their branches
are KEPT as backup (not deleted: their commits are byte-duplicated on master,
not git-merged, so `branch -d` would refuse — kept deliberately).

## Verified already on master (no landing needed)

- Bank scan 0c8409f69: 449/449 files byte-identical on master.
- Bank prereg ffa772515: 2/2 files byte-identical on master.
- Bank instrument 3efb6f6e8: 5/6 identical; the one differ, scripts/policies/
  nighttravel.js, is SUPERSEDED — master carries the newer evening-detour code
  (2b25b7155); the bank instrument predates it. Nothing to land.
- Verdict adoption bf3b685c9: 457/457 files byte-identical to the bank scan;
  the adoption itself is on master as 723b96814. Redundant.
- Verdict untracked corpora (3 dirs, 17 files): 17/17 byte-identical on master.
- Creekpath untracked corpora (2 dirs), prereg, and 3 scripts (analyze /
  transcript / test): 28/28 byte-identical on master.

## Preserved here (the only unique content)

`competent-goHomeStanding-original.js` + `competent-variant.patch` — the
original creekpath Arm C standing-go-home variant (killed at pilot). The
LIVE standing-home rule on master is the RETRY (d122dcdda, GO under a new
causal-window prereg). The original differs from the retry by EXACTLY one
guard: it checks `Game.playerAtHaven()` and skips when already at haven;
the retry lacks that guard. Trace counters (standingHomeDays/Detours) are
identical. The patch is against the Arm C tree's base, not current master;
the extracted function is the authoritative copy.

## Deliberately NOT preserved: bank corpus dir (0-byte EPERM debris)

`evidence/2026-10-28/sim-nighttravel-bank-b-corpus-insideevening/` (8 files,
seeds 11031, 11149, 11307, 11322, 11360, 11390, 11429, 11439) looked
path-unique, but every file is 0 BYTES (written 02:09–02:23 Oct 29, matching
the container EPERM write-flap pattern that left 0-byte JSONs elsewhere).
They hold no measurements — the real same-seed data is the scan files on
master (75–92 KB each). Empty files preserve nothing, so they are NOT
committed here; they die with the bank tree as scratch.

HISTORICAL EVIDENCE ONLY. Do not land the preserved variant as a policy change
without a new prereg — Arm C was killed at pilot, and the retry is the live rule.
