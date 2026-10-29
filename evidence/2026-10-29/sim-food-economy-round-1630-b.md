# sim-food-economy-round-1630-b — coordinator evidence (loop B, 2026-10-29 1630Z)

Run: fleshout-loop-b-20261029T1630Z, axis food-economy (converging).
Loop A live on scale-onramp at run start (1615Z breakline/tbovertime2,
NOT touched — A landed its round mid-run as 1be29f7c9 and its claim +
lock were gone by closeout checks) -> B worked food-economy, the
second axis. Build lanes live on arrival (build-returns) — NOT touched.
Claim + lock written before any sims; deleted at closeout.
Stale B trees from earlier runs (sim-nighttravel-bank-b,
sim-nighttravel-verdict-b, sim-creekpath-armc-b, all with uncommitted
changes) were left alone throughout — the reaper refuses them, and
they belong to earlier runs, not this one.

## Arm 1 — sim-woodcarry3-b: GO, lever lands default-OFF

Backlog #1423 follow-up (the 1530Z run's explicit next-run note).
Rebuilds the daytime wood-carrying precondition lever from the
woodcarry/woodcarry2 prereg spec (morning carry: deficit-sized honest
takeWood transaction, pile floor 8, kcal floor 60; evening bridge on a
creek refusal; lacking-line on still-refused tails), POLICY-SIDE ONLY,
zero src/js, zero default flips. The 1530Z design flaw is fixed by
construction: the judged driver strips BOTH the thief grant and the
taps (neither judged), and the OFF leg reproduces the blockscreen2
census EXACTLY (13025: 14-16, 20-21, 24-30; 13067: 4-5; 13268: 5-10,
12-20, 23-30; 13276: 4-13). No post-hoc seeds added; the prereg's
fallback rule was not triggered.

- Prereg committed ee3c5004d (rebased 4768e940a, then 6bb0f18de)
  before any judged leg. Primary: episode rescue rate >= 0.50 with
  min-n >= 8 OFF-leg episodes. Result: 8 episodes, rescued 8/8 =
  1.000 (Wilson 95% 0.806-1.000). Verdict GO.
- Before/after (30d death-aware legs, substrate COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, detour OFF): creek
  evenings OFF 47 -> ON 5; inside evenings OFF 73 -> ON 120 (+47);
  every ON seed spends all 30 evenings inside (13025: 18->30,
  13067: 28->30, 13268: 7->30, 13276: 20->30). Carries 11 acted, min
  pile after a carry 11 (floor 8 never breached); bridges 5
  attempted, 5 built, all completed entries (13268 day 28 re-bridges
  after a storm takes the day-5 bridge — counts in the evening
  share, correctly not in the episode rate). Player deaths OFF 6
  vs ON 2 (sickness, wild — neither carry-caused).
- Guards: unclassified 0/0, classifier errors 0/0, divergence
  audit ok on all 4 seeds (first difference day 2, first lever
  action day 2), wrapper/driver rescue agreement 0 disagreements.
- Honesty guard VACUOUS a third consecutive run: 0 still-refused
  ON creek evenings, so the lacking-line is unit-proven (T3) but
  still unplayed (backlog #1424 stays open; new staged-evening
  item appended).
- Sense: day-2 carry reads as a person packing ("You take 4 logs
  from the woodpile for the road home. (12 left for the
  hearth.)"); day-5 rescue resolves from honest refusal lines
  into a played homecoming ("You walk back into Haven...
  The village is glad to see you.").
- Coordinator proof re-run post-rebase: T1-T12 pass except T12
  determinism NOT-CHECKED without --det files; the worker's
  byte-identical cmp determinism check (seed 13268 ON) stands,
  as in prior runs.
- Merged 84eba8a86 (prereg/instruments 6bb0f18de + GO evidence
  84eba8a86, rebased onto the fightorigin merge). Lands as a
  default-OFF instrument only (WOODCARRY=1 to enable; no driver
  adopts it by default).

## Arm 2 — sim-fightorigin-b: GO, measurement only

Backlog #1373 (named next arm from sim-morningpersist-b). Builds a
fight-origin recorder (fighters + pendingEncounter provenance at
every fight-drive entry), DIAG ONLY, zero src/js, zero policy
changes. Prereg 2feb7424d before any judged run; amendment
0b3f1825b (also pre-confirm) corrected the pending-resolved
definition after the pilot proved the original clause mechanically
impossible (the harness clears pending flags before calling
startCombat — the detector is now the pending-transition log +
caller stack). A second pilot-diagnosed fix (foSeq ordering
counter; pilot morning completeness 14/19 -> 19/19) also predates
the judged confirm run. Both are documented in the arm evidence's
metric review, not mid-run re-scores.

- Judged band: morningpersist confirm band 10710-10725, 30
  loop-days, substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1, POLICY=insideevening. Completeness 100%:
  miss-interval drives 4/4 full, flee-drive subset 3/3, all
  morning-interval drives 36/36 full, 0 unclassified.
- Neutrality (mandatory): recorder OFF vs ON 16/16 seeds
  deep-equal. Determinism: seed 10712 re-run byte-identical.
  Proof PROOF-GREEN (T1-T7), re-run by coordinator post-rebase
  on the merged-base tree with the same command.
- Answer to #1373: every dawn fight behind the misses arrived the
  same way — a haven raid. havenRaidTick set a pending encounter,
  announced as a BREACH, resolved by the harness pending block
  into a fight inside the hall; the player then fled through the
  hall doors (the morningpersist mover, re-confirmed). 10712/21:
  MURKCAP (wave 1, 65 HP, solo) + Kelsey, Onni, Luis. 10720/18:
  HUSHPUPPY pack (4 hushwolves 50/58/62/52 HP) + 4 villagers;
  a second fight the same interval (solo belltoad 58 HP,
  direct-live, started by a monster turn during wait-3) explains
  the (5,6) morning read. 10713/28 (new miss, see below):
  HUSHPUPPY pack + 4 villagers, raid pending set during sleep.
- Reproduction verdict (reported separately per prereg):
  10712/21 reproduces, 10720/18 reproduces, 10722/30 does NOT
  reproduce (morning 30 stays inside at (4,7)); new miss
  10713/28 appears on the same band. Proven master drift, not
  recorder perturbation: the recorder-OFF control shows the same
  miss set (denom 406 vs morningpersist's 411). Both target-set
  readings pass (all miss-interval drives 4/4, reproduced-only
  subset 3/3). Backlog drift item appended; do NOT quote the
  morningpersist miss set as current.
- Sense: coherent — the breach is announced, the monster named,
  the flee witnessed. Gap documented, not chased: the game never
  says the arrival WAS a raid (vs a monster wandering in); a
  raid fight's say window interleaves night-raid casualty
  narration with fight-start lines without flagging raid
  aftermath (backlog item appended).
- Merged 02a65323f (prereg 6b7e246a6, amendment 83e696833,
  tooling f22d7f88b, evidence 02a65323f).

## Wall (both arms, 30d legs — NOT movement)

national/table/wins NOT OBSERVABLE on 30-day evening/morning legs,
reported not claimed. Fightorigin corpus: scale 'village',
standing 0 on all 16 seeds; wave 4-5 reach 0 (max unlocked 3 on one
seed, 2 on twelve, 1 on three); wave kills 91 (wave 1: 83, wave 2:
8); median survival 30 loop-days (all 16 survived). Woodcarry3
corpus: median survival 30/30, all 8 legs survive. No wall movement
claimed.

## Telemetry deviation check (both corpora, --sweep-rows)

3 LOUD lines each (national 12->0, table 16->0, wins 16->0), the
KNOWN regime-artifact class: the WINSEAT baseline vs pre-seat
30d corpora that cannot show national/table/wins. Exiled: no LOUD
line on either corpus. Baseline NOT rolled, no new investigation
— identical to the 1530Z run's finding.

## Infrastructure

- Master moved twice under the run: loop-A 1615Z landing
  (1be29f7c9) + journey succession r70 (c13469c89) before the
  first merge attempt, then journey scale r53 (23e3ecc54) between
  the fightorigin rebase and the woodcarry3 merge (first
  woodcarry3 --ff-only failed "Not possible to fast-forward",
  aborted cleanly, no state changed). Both branches rebased clean
  (zero src/js, zero file overlap between arms or with the
  sibling landings); proofs re-run green after every rebase and
  on the merged master order (fightorigin merged first as
  02a65323f, woodcarry3 re-rebased onto it and merged as
  84eba8a86). check.js --quick NOT re-run at coordinator level
  (zero src/js in both arms; arm proofs are the landing gate).
- Safe-commit index clobber hit worker commits on both arms
  (worker-repaired via HEAD-blob cacheinfo, verified status
  empty + diff HEAD empty). Registry operations slow under
  sibling load (registrations ~2-4 min each, heartbeat chains
  similar); no ref surgery performed.
- Trees released done-merged, branches deleted, main tree clean
  at closeout (master 84eba8a86).

food-economy stays converging (NOT converged): the woodcarry
lever is proven at power and lands default-OFF, and the dawn-fight
origin question is answered by measurement — but no game-code
fix landed this run and no default flipped. scale-onramp stays
converging (untouched; sibling loop A lane). Claim deleted; lock
deleted.
Evidence: evidence/2026-10-29/sim-food-economy-round-1630-b.md
(coordinator, this file) + sim-woodcarry3-b-prereg.md +
sim-woodcarry3-b.md + sim-woodcarry3-b-analysis.json +
sim-woodcarry3-b-corpus-off/ + sim-woodcarry3-b-corpus-on/ +
sim-fightorigin-b-prereg.md + sim-fightorigin-b.md +
sim-fightorigin-b-analysis.json + sim-fightorigin-b-pilot-analysis.json
+ sim-fightorigin-b-corpus/ + sim-fightorigin-b-corpus-off/ +
sim-fightorigin-b-corpus-rerun/ (all on master, merged locally
pending ship).
