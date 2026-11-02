# Journey endgame r105 — PRE-REGISTRATION (lane B, 2026-11-02, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at closeout — verified by re-read after
landing; closeout write chosen over run-start write so a failed run
does not skip the leg, per r103/r104 precedent). Run number basis:
last numbered Lane B run is r104 (succession, landed 2026-11-02).
This run is r105. Slug deviation, documented: the body slug
journey2-endgame was free this run (no local branch, no directory),
so no -r105 suffix was needed; registered clean at 09:00:06Z
heartbeat, verified in the registry after registration.

Substrate: r101 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Instrument + evidence only; ZERO gate changes (gating freeze,
Steve 2026-10-27 16:53, stands). Any blank fix decided AFTER the
sweep, on its own proof test, narration only — if it touches seat
logic or any gate, do NOT land it.

NEW IN r105 (read-only instrumentation, no policy change — the
three gaps r101's metric review named, applied to THIS run's probe
and analyzer, never retro-fitted to r101):
1. KILL-ANATOMY: snapFighters carries per-fighter detail; every
   fight open stores openSnap; at close the record carries
   anatomy {partySize, partyKeys, monsterCount, openMonsterHp,
   closeMonsterHp, dmgDealt, feastedAtStart}. Fast single-call
   fights carry anatomy:null and stay OUT of anatomy tallies.
2. MENTION-KIND marker-first: kindOf105 checks line markers
   before content — 'ability-text' for ABILITY-marker lines,
   'broadcast' for ANY SYSTEM line, 'proverb' for a standalone
   quoted one-liner — then r101's content rules. Cleaned-presence
   is now presence/crew-beat kinds ONLY (positive list).
3. M17 SURGE ARMING/SPEND SPLIT: surge-spend receipts sampled at
   every policy.fight call (pre + post) as well as dusk/post-daily;
   the summary carries surgeEndState {banked, used, useReceipt}.

R105 QUESTION (r101's metric review, "next run's question, named"):
the kill wall — on the waves road, what turns a wave-4 fight into
a kill?
- KILL-ANATOMY (descriptive first measurement + coverage bar):
  by census-fight outcome, median party size, turns, damage dealt
  vs monster HP pool, damage share, feasted share, monster count.
  No outcome bar this run — one block cannot set a kill recipe;
  the coverage bar (anatomy on >=90% of multi-turn census fights)
  is the binding, so a thin decomposition cannot pass silently.
- W5-FORK (cleaned, positive list): with ability-text, proverb,
  and every SYSTEM line now excluded by kind, does any fresh
  uw=5 seed read FACED, BLOCKED-ONLY, MENTIONED-NOT-FACED
  (cleaned), or NEVER-ARRIVED? The feast-rate sub-question stays
  dormant until an unlock exists to rate.
- M17 (revised binding, declared here): a surged seed passes with
  a named spend, an other-kind spend receipt, or as surge-unspent
  (still banked at end, no receipt); only a spent-but-unreceipted
  seed is a capture gap (NO-GO).

Seeds (fresh, verified unused in prior endgame notes and in the
evidence tree): 89501-89503 waves (capable+deedhunt+vetcommit+
greedy+armory+fullseat diag), 89504 forcedrift control (capable +
relaygrey FORCEDRIFT=1 + fullseat diag, greedy OFF, armory OFF),
89505-89507 wavesnw (waves + NOWALKIN_W4).

Bindings (carried from r101, unchanged except M17 + KILL-ANATOMY
as declared above): M1-guard, M2-census, M2c-engine-coverage,
M2d-gate-named, M3-conversion (tally), M3b-peak (>=1 waves seed
peaks >=2 living veterans), M4-wave5-or-full (>=1/6 waves seeds
unlocks wave 5 or earns the full seat), M5-voicing-canonical,
M5b-relay-branch-tabulation, M6-guard-named, M7-people (2 beats
sense-read in full), M8-exit-canon, M10-fullseat-gap,
M11-standing-peak, M12-bar-record, M13-release-snapshot,
M14-invite-classification, M15-feast-census, M16-dusk-census,
M17-surge-mode (revised, above), M18-ghost-scan, M19-grant-log,
M20-standing-trace, M21-audit-crosscheck, M22-feast-hold,
REG-r35-audit, REG-r37-satpenalty, VETCONV-recon, LOSSKIND-classified,
W5-question (GO iff >=1 uw=5 seed AND every uw=5 seed's records
complete), KILL-ANATOMY-coverage (>=90% of multi-turn census fights
carry anatomy). M4b retired (INFO only). PRIMARY gates on all
except M3/M4b (tally/question metrics). A miss is NO-GO, never
re-scored mid-run; metric doubts go under "metric review" for the
NEXT run.

Pilot gate (per MEASUREMENT.md §9-12): pilot = 89501 + 89505 +
89504 at full 180d. Expand to the full 7 iff the pilot shows >=1
sat (any seat/walk), >=1 census fight, and >=1 classified village
loss OR >=1 sat with no loss (the r101 gate shape: a pilot with no
loss at all but 2+ sats still expands, since loss classification
is then exercised by the full sweep's scatter seeds if any; if the
pilot shows 0 sats the run stops and documents). Pilot seeds must
reproduce BYTE-IDENTICALLY in the full sweep (JSON snapshotted to
evidence/2026-11-02/r105-pilot/ before the sweep overwrites them).
Determinism leg: DET GREEN byte-identical on 89501 (2x 120d).
