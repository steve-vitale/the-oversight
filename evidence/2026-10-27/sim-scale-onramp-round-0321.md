# sim-scale-onramp-round-0321 — coordinator evidence

Run: fleshout-20261027T0321Z. Axis: scale-onramp (topmost, converging;
the standing directive stands — see convergence state below). Both arms
DIAG-GO, both MEASUREMENT ONLY (zero src/js, no default flips, no game
lever proposed). Merged locally, pending ship (the ship loop owns
version bumps, pushes, and live verification).

## Run start — stale-lock recovery (disclosed)

The previous A-loop run's lock (fleshout-20261027T0105Z, created
01:05Z) was 135 minutes old at run start and its worktree heartbeat
(sim-finalloss-a, 02:59Z) was 22+ minutes stale with no file activity
in the last 15 minutes. Per the concurrency guard both triggers fire:
the lock was deleted, the dead claim retired to
fleshout-20261027T0105Z.json.DEAD, and this run proceeded, noting
"stale-lock recovery" here. The dead run's two arms were handled as
follows, and neither was re-touched by this run:

- sim-arroworigin-a had ALREADY LANDED on master (95368c8b5,
  DIAG-GO: both single arrows traced to starting stash — founder
  73676, joiner-population 73672). Verified on master at run start;
  its findings-backlog line is marked fixed by this run's closeout.
- sim-finalloss-a remains IN-FLIGHT in tree sim-finalloss-a (only an
  untracked prereg file at last check). NOT touched, NOT re-claimed,
  NOT merged by this run. The next A run checks that tree before
  re-claiming the final-loss blank.

Sibling loop B's live claim (fleshout-loop-b-20261027T0049Z,
food-economy: stockdoors + bothgrow) was NOT touched. B landed
bothgrow (c8770e7f4) during this run's registration window; its
stockdoors tree (b55b484ec at closeout) is still active. Rotation
file left at 3 (convergence work does not cycle it).

## Arms (one shared band, two independent recorders)

Substrate for both arms: scripts/policies/tableseat-nowait.js, seeds
73671–73678, 180-day death-aware horizon. Baseline reference: the
1920Z band table. Both arms replicate it EXACTLY on all judged fields
(see wall numbers) — no base delta to explain, despite the base
moving twice under this run (see infrastructure).

### Arm 1 — sim-monsterknowledge-a (14136e8a5, proof 1743/0)

DIAG-GO. Follows sim-meetrule-a (20261026T2141Z), whose G1 KNOWLEDGE
was marked MISSING: no engine path supplies a live monster's tile to
villager routing. This arm inventories every candidate channel and
scans the band for monster-location knowledge events.

- Inventory C1–C16 complete, zero unexamined, zero invented. No engine
  path supplies a live monster's tile to villager routing — verified
  by absence checks (villager-objectives, villager-mapmem,
  villager-agency never call worldMonsters()). Two near-misses:
  gossip's danger score only gates departures (go/ask/tighten/defer
  — no identity, no tile); the shelter-muster gate DOES read live
  monster tiles but spends that knowledge on barricading the hall.
- Band scan complete, 0 unclassified: 18,883 monster-days (780
  wave-4). Objective-target matches (E1, 1,726 days) are coincidence,
  not knowledge — targets are set without reading monsters; of 277
  wave-4 E1 events, 71 never travel and only 5 events band-wide
  stepped toward a wave-4 tile, all ordinary errands (water x3,
  visit, explore) whose target happened to hold a monster. Gossip
  names a live monster on 3 monster-days total, 0 for wave-4 (a
  single feast-draw entry naming a wave-1 crow, no tile). Muster
  covers 88.6% of wave-4 monster-days: the village's dominant
  response to a known wave-4 monster is hiding.
- Specification only (not a lever proposal): a real link would need a
  live-tile store, a writer that survives monster wander, a reader in
  the objective system, a pursuit reason that survives the muster
  gate, and a villager voice for it. Until then meetrule's 7/24
  reachable fraction stays conditional and the unconditional count
  stays 0 by construction.
- Evidence: evidence/2026-10-27/sim-monsterknowledge-a.md + prereg +
  perseed-monsterknowledge-a/ (16 rows). Proof:
  scripts/test-monsterknowledge-a.js, 1743 PASS 0 FAIL, re-run green
  on the rebased branch and on merged master.

### Arm 2 — sim-raidtrace-a (fd3bcd83d, proof 157/0)

DIAG-GO. Follows sim-seq51gap-a (20261026T2317Z): the day-144
palisade raid wall dropped seq51 799 -> 586 with no per-monster
transcript trace. This arm measures that blank band-wide.

- All 16 tier-2/3 palisade raid walls affecting tracked wave-4
  monsters classified traced vs untraced with ZERO unclassified:
  16 traced, 0 untraced (all havenTier 3; tier-2 walls present: 0).
- Toll-quantified: 0/16. Every wall's raid window names the monster
  (RAID line list, plus a singled-out escalation line for the raid's
  biggest raider) and carries exactly one generic toll sentence
  ("The palisade's stakes take their toll as they come over the
  wall") — but no window states any monster's wall amount, post-wall
  HP, or weakened state. Strongest case: 73675 seq26 herald, day-162
  wall 175 -> 1 HP (the wall formula's floor), framed in transcript
  as an undiminished lingering threat ("it'll gorge every night
  until it's driven off"). The prior arm's "narratively silent"
  finding survives band-wide in its quantified form: named, never
  quantified.
- Sense samples: 3 raid-day transcripts read and quoted. A player who
  fought a monster at pre-wall HP and met it later weaker would know,
  at best, that the stakes took a toll on a night it was listed as a
  raider — not how much it lost.
- Specification (not a proposal): a future narration fix would need
  to show, under this same measurement, a raid-window line per wall
  naming that monster AND stating its wound as a number (wall amount
  or post-wall HP) or a legible weakened state tied to that monster.
  A generic toll sentence, a biggest-raider hint, or a
  lingering-threat line does not close the blank. Any narration
  change still needs Steve's ruling (table-talk ruling family).
- Transcript-vs-census divergence (disclosed, not hidden): census
  walls 14 vs transcript walls 16 — the entire difference is seed
  73677, where narration-on diverges from narration-off (168d/44
  deaths/2 walls vs 152d/41 deaths/0 walls); all other seeds match
  exactly. The verdict judges the transcript denominator per the
  prereg, with the divergence explained as likely log-dependent
  reads under live say/sysSay; the emit wrapper itself is proven
  neutral within narration-on by the det-gate; no attribution test
  was run. That attribution test is a named next blank.
- Evidence: evidence/2026-10-27/sim-raidtrace-a.md + prereg +
  perseed-raidtrace-a/ (16 census rows, 8 transcript rows +
  docs, raidtrace-classification.json). Proof:
  scripts/test-raidtrace-a.js, 157 PASS 0 FAIL, re-run green on
  the rebased branch and on merged master.

## Wall numbers (both arms agree exactly; baseline = armed)

wins 2/8, national-ever 6/8, national-final 5/8, table 4/8, entered
2/8, wave-4 6/8, wave-5 0/8, wave-4 kills 0/8, median survival 152d
(max 180d), deaths 307, starvation 1. Death causes (raidtrace
census): villager combat 41.0%, villager-vs-villager combat 27.7%,
player arena 14.0%, rest scattered; hunger is not the wall.

## Village assessment (plain words)

These villages mostly survive and mostly reach national standing, but
they don't finish the game — only 2 in 8 win, only 2 in 8 ever enter
the table, none reaches wave 5, and nobody kills a wave-4 monster on
any seed. Two quiet mechanisms frame that wall. First, the palisade
does real work the villagers get no credit for: it wounds monsters
that are then lingered past or fought to a flee, never finished — and
the story never tells the player how much was taken. Second, the
villagers can't march to a monster they only know as weather at the
treeline: their monster-talk names almost nothing and no place, and
the one system that does know where the monster is uses that
knowledge to hide everyone inside. The village is not failing to act
like people — people who only know "something is out at the
treeline" also can't march to its tile. Deaths come from fighting —
villagers fighting each other and the arena — not hunger.

## Metric review (for the NEXT run; pre-registration is never re-scored)

- Both arms judged against prereg bars written before sweeping;
  neither bar was re-scored. Both DIAG-GO bars met with margin
  (monsterknowledge: inventory + scan complete, 0 unclassified;
  raidtrace: 16/16 classified, 3 sense samples, both det-gates PASS,
  cost bars PASS on both arms).
- Raidtrace instrument correction (disclosed in the arm evidence):
  the first classifier counted the RAID line's raider-count digit
  ("3 raiders") as a wound amount and falsely reported
  toll-quantified 16/16; it was fixed to the prereg's strict
  definition (monster name + wall amount or post-wall HP in the same
  line) before the evidence was written, with the primary
  traced/untraced rule untouched. The correction is why the headline
  is 0/16, not 16/16.
- Monsterknowledge instrument correction: census day is scholar day,
  which stalls (days 2 and 4 repeat at run start), so detail checks
  now match by day+villager+kind+target; sweep totals never had this
  bug.
- Telemetry deviation check (this run, both corpora, metrics
  national/table/wins/exiled): 2 LOUD lines each (national 12->0,
  wins 16->0). BOTH ARE ARTIFACTS, baseline NOT rolled, no
  investigation item: (1) regime — the scale-wall baseline's own
  _regime note says "DO NOT compare pre-seat / courtship / readiness
  substrates against this baseline"; both arms run the
  tableseat-nowait (pre-seat) substrate, not the winseat stack;
  (2) field shape — the script reads top-level national/wins paths
  while per-seed rows carry nationalEver/entered/won (armed band
  nationalEver 6/8, wins 2/8, not 0). No table/exiled LOUD lines.
- Sense-testing note: raidtrace's 3 quoted raid-day transcripts and
  monsterknowledge's 73677 sense replay were read for meaning, not
  counts. The most report-like villager line ("Rotimi came back from
  the treeline white-faced. Saw it too.") names no monster and no
  place — that absence IS the finding.

## Infrastructure

- Worktree registration slow (~8 min for both trees, sibling git
  contention) — delay, not failure. Both trees heartbeated at
  registration and at landing.
- Master moved twice under this run from sibling lanes (journey
  succession r51, journey-landing r59, zero file overlap with either
  arm). Both branches rebased clean in their own worktrees
  (monsterknowledge onto journey r51, raidtrace onto journey r59),
  proofs re-ran green after every rebase and on merged master.
  ff-only correctly refused the diverged branches before each
  rebase; no conflicts, no force.
- Safe-commit index clobber hit BOTH worker commits (staged-deletion
  variant) — repaired via HEAD-blob cacheinfo each time, commits
  verified correct (hashes above), worktrees verified clean.
  No EPERM flap blocked this run.
- check.js --quick NOT re-run: zero src/js, zero green-list files,
  and the attributable evidence is the arm proofs on merged master
  (1743/0 + 157/0). The standing 280/7 pre-existing profile was last
  recorded by the 2315Z/2215Z runs.

## Convergence state

scale-onramp stays converging (NOT converged): wave 5 still 0/8,
wave-4 kills still 0/8, full seat unreached, wins still only through
default-OFF courtship + seat instruments and only through the lesser
seat. What moved this run is the wall's legibility, twice over: the
raid wall is now measured as named-but-never-quantified (0/16), and
the monster-knowledge link is now inventoried as missing with a
specification for what would need to exist. Neither is a lever, and
neither moves a demand number. food-economy stays converging
(untouched; sibling loop B). Claim deleted; lock deleted.

## Next blanks, in order

1. The final-loss non-restore blank — CHECK tree sim-finalloss-a
   before re-claiming (in-flight from the dead 0105Z run; if its
   worker has since landed, mark the findings line fixed from its
   evidence instead of re-running it).
2. Raid-wall toll-quantified narration — specification ready
   (raidtrace-a), but any narration change needs Steve's ruling
   (table-talk ruling family); do not land a voice change on this
   evidence alone.
3. Monster-knowledge link specification — design ruling, not a lever;
   do not propose the routing behavior until the link exists.
4. 73677 transcript-vs-census divergence attribution test
   (narration-on vs narration-off on one seed).
5. TB channel reset, situation-blind table talk, dead-entry drop,
   and the remaining 1354Z steve-calls — all still ruling-pending,
   skipped again this run.
