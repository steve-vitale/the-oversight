# Journey endgame r110 — PRE-REGISTRATION (lane B, 2026-11-02, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at closeout — verified by re-read after
landing; closeout write so a failed run does not skip the leg, per
r103/r104/r105/r109 precedent). Run number basis: last numbered Lane B
run is r109 (endgame, landed 2026-11-02). This run is r110. Slug:
journey2-endgame (free at registration; r109 used it and released it).

Run-start incident (infrastructure, not measurement): worktree
registration failed 13 consecutive times (21:57–22:07Z) on the known
intermittent EPERM flap on `.git/refs/heads/` lock writes (create OK,
write() EPERM; the same burst also left a 0-byte draft file whose
inode then refused every rewrite until deleted and rewritten fresh).
Registration succeeded 22:12Z on the next attempt; heartbeat verified
in the registry (22:15:34Z). No ref surgery was performed on the main
tree; no sibling work was touched. The lock for this run
(2026-11-02T21:55:46Z) is held throughout and deleted at closeout.

Substrate: r109 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Instrument + evidence only for the sweep; any blank fix decided AFTER
the sweep, on its own proof test, narration only — if it touches seat
logic or any gate, do NOT land it (gating freeze, Steve 2026-10-27
16:53, stands).

NEW IN r110 (r109's metric review, applied to THIS run's probe and
analyzer, never retro-fitted to r109):
1. MENTION-KIND 'producer-name': kindOf110 adds 'producer-name' for
   the producers-naming beat ("producers name it:") before the 'other'
   fallback. Cleaned-presence stays presence/crew-beat kinds ONLY, so
   this changes the 'other' residual, not any presence verdict. Bar:
   'other' empties on seeds that name a Producer, or the residual is
   named beat by beat.
2. SECOND-VETERAN, channel + pair-lifetime (analyzer-side, no probe
   change): each killLog entry (day, mid) is matched against
   fightCensus.fights — a vKill fight ending that day on that monster
   with turnsObserved is 'census'; a matching fight with anatomy null
   is 'fast'; no matching fight is 'villager-side'. Pair lifetime is
   days from the second-bank kill to the first pair death, sit, or
   scatter (peakLivingVetKillers + death records + satDay/loss day).
   Question: what kills a banked pair, and can a player deliberately
   repeat the bank (census channel) or not (villager-side channel)?
3. STRIKE RE-TEST ON CURRENT HEAD: r109's 121-round Strike standoff
   (89606 d103, player fleeing every round into a barrier, 0 damage,
   generic "It got away" end) predates the monster-commitment build
   (de884988a, in HEAD for this run). The question is whether the
   same shape recurs on current HEAD — a timeout end still labeled
   mFlee, or a withdraw under the explicit Picket Line component.
   If it recurs, the fix candidate is narration + census-label only
   (a timeout end is not a flee), never a combat-outcome change
   mid-measurement; the fix lands only with its own proof test and
   only if it does not re-score this block.

R110 QUESTION (r109's metric review, "next run's question, named"):
the banked pair — on the waves road, what keeps a second living
veteran alive long enough, at standing 200, through a sit? And can
the player deliberately repeat the bank?
- SECOND-VETERAN ANATOMY (descriptive + coverage bar): for every
  veteran-counted kill, killer, kill day, other living veterans that
  day, gap to the previous kill, previous-killer fate, KILL CHANNEL
  (census / fast / villager-side), and PAIR LIFETIME (days from
  second-bank kill to first pair death / sit / scatter). Coverage
  bar (>=90% of veteran-counted kills carry killer + previous-killer
  fate + channel) is binding.
- KILL-ANATOMY (kept): by census-fight outcome, median party size,
  turns, damage vs pool, damage share, feastedAtOpen share, monster
  count. Threshold-vs-control question stays open.
- W5-FORK (cleaned, positive list, plus producer-name kind): with
  the new kind, does 'other' empty? Does any fresh uw=5 seed read
  FACED, BLOCKED-ONLY, MENTIONED-NOT-FACED (cleaned), or
  NEVER-ARRIVED? Feast-rate sub-question stays dormant.
- M17 (revised binding, carried): surged seed passes with a named
  spend, other-kind receipt, or surge-unspent; only a
  spent-but-unreceipted seed is a capture gap (NO-GO).

Seeds (fresh, verified unused: no prior endgame note or endgame
probe script contains 89701-89707 as a seed): 89701-89703 waves
(capable+deedhunt+vetcommit+greedy+armory+fullseat diag), 89704
forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat
diag, greedy OFF, armory OFF), 89705-89707 wavesnw (waves +
NOWALKIN_W4).

Bindings (carried from r109, unchanged except the three items
above): M1-guard, M2-census, M2c-engine-coverage, M2d-gate-named,
M3-conversion (tally), M3b-peak (>=1 waves seed peaks >=2 living
veterans), M4-wave5-or-full (>=1/6 waves seeds unlocks wave 5 or
earns the full seat), M5-voicing-canonical,
M5b-relay-branch-tabulation (walkedBranch from tableState only,
walkedMoral separate), M6-guard-named, M7-people (2 beats
sense-read in full), M8-exit-canon, M10-fullseat-gap,
M11-standing-peak, M12-bar-record, M13-release-snapshot,
M14-invite-classification, M15-feast-census, M16-dusk-census,
M17-surge-mode (revised, above), M18-ghost-scan, M19-grant-log,
M20-standing-trace, M21-audit-crosscheck, M22-feast-hold,
REG-r35-audit, REG-r37-satpenalty, VETCONV-recon,
LOSSKIND-classified, W5-question (GO iff >=1 uw=5 seed AND every
uw=5 seed's records complete), KILL-ANATOMY-coverage (>=90% of
multi-turn census fights carry anatomy), SECOND-VETERAN-coverage
(>=90% of veteran-counted kills carry killer + previous-killer
fate + channel). M4b retired (INFO only). PRIMARY gates on all
except M3/M4b (tally/question metrics). A miss is NO-GO, never
re-scored mid-run; metric doubts go under "metric review" for the
NEXT run.

Pilot gate (per MEASUREMENT.md §9-12): pilot = 89701 + 89705 +
89704 at full 180d. Expand to the full 7 iff the pilot shows
>=1 sat (any seat/walk), >=1 census fight, and >=1 classified
village loss OR >=1 sat with no loss (the r101/r105/r109 gate
shape: a pilot with no loss at all but 2+ sats still expands,
since loss classification is then exercised by the full sweep's
scatter seeds if any; if the pilot shows 0 sats the run stops
and documents). Pilot seeds must reproduce BYTE-IDENTICALLY
in the full sweep (JSON snapshotted to
evidence/2026-11-02/r110-pilot/ before the sweep overwrites
them). Determinism leg: DET GREEN byte-identical on 89701
(2x 120d).
