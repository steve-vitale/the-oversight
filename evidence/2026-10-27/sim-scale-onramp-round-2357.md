# sim-scale-onramp-round-2357 — ADOPTION RUN: the dead 2147Z pair landed, and the paired verdict is zero on both sides

Run: fleshout-20261027T2357Z, axis scale-onramp (the blocking axis).
Loop B live on food-economy for the whole run (2352Z claim, arms
sim-raidcapture-b + sim-refusalprecheck-b, NOT touched). The tackle-all
loop is live on its own trees (NOT touched). This run adopted the dead
2147Z A round's two arms — it ran NO new sweep. Both arms are DIAG /
MEASUREMENT ONLY: zero src/js, zero default flips, merged locally
pending ship.

## Stale-lock recovery at start (disclosed, not hidden)

The 2147Z run's lock (fleshout-20261027T2147Z, created 21:48:19Z) was
still on disk at 23:48Z, but its worktrees' heartbeats were 21:50:58Z
(~118 min stale, past the 15-min guard) and its trees were otherwise
finished: sim-w4channel-a committed-but-unmerged, sim-w4abstain-a
evidence + corpus written but uncommitted. Per the guard, the run was
DEAD no matter how fresh the lock looked; the lock was also past the
90-min fallback. Lock deleted, 2147Z claim retired to .DEAD, this run's
lock + claim (fleshout-20261027T2357Z) created before any other work.
Nothing of the dead run's was discarded: both arms are landed below.

## Arm 1 — sim-w4channel-a (ADOPTED, landed as 715938318)

The 2147Z worker's census, committed as b075adbc5, rebased twice
(first onto 8ac521d01, then onto e5bab2883 after the abstain merge),
proof re-run green after every rebase and on merged master
(validator exit 0, G1 rows=8 errs=0, G6 substrate PASS, legs all
true, GO-candidate true). Evidence:
evidence/2026-10-27/sim-w4channel-a.md (+ prereg, corpus
perseed-w4channel-a/, 8 rows + summary + analysis + sense-75104).

Verdict GO (binding prereg, no re-score): the channel census
completes, and conversion is zero on every channel. Arrivals 11,
engaged 6 (54.5%), killed 0 (0% of engaged, 0% of arrivals).
24 fight events by channel: player-tb-world 13/0 (all 13 scholar
turn-based fights LOST), villager-field 8/0 (5 seq-linked: 4 flees,
1 death; 3 unlinked evades, 0 rounds, 0 damage), contest 2/0,
other 1/0 (feast-draw mismatch), raid-defender 0, trap 0,
non-world-TB 0 — the w4funnel strike door did NOT reproduce at
wave 4 on this band (zero null-origin wave-4 TB fights). Outcomes:
still-present 9, melted 2 (lost-fight dissolutions, not kills).
Narrowest stage: ENGAGED -> KILLED, a reversal of the w4funnel
order (there: never-fought 81.8%) explained by the 47-day median
arrival window — meeting stops being the excuse when monsters
get time.

## Arm 2 — sim-w4abstain-a (ADOPTED, landed as e5bab2883)

The 2147Z worker's abstention census: corpus + evidence verified
(8 rows parse, summary/analysis agree with the evidence numbers),
proofs re-run green before and after rebase (policy 35/35,
validator hard gates G1–G10 PASS, DIAG-GO), the one pending section
(telemetry deviation check) filled by the adoption worker, then
committed (10c889b58, 15 files + sweep log, message + file list
verified), rebased onto 0f6b898b, proofs green again, merged
--ff-only by the coordinator, proofs green on merged master
(policy 35/35, validator DIAG-GO). Evidence:
evidence/2026-10-27/sim-w4abstain-a.md (+ prereg, corpus
perseed-w4abstain-a/, 8 rows + summary + analysis + detgate +
2 sense files, sweep-w4abstain-a.log — the judged sweep's complete
log, kept deliberately).

Verdict DIAG-GO (binding prereg, no re-score): villager conversion
zero under player abstention. The player never struck a wave-4
monster (0 strikes in wave-4 fights, 0 wave-4 kills; 6 wave-4 fights
fled whole, 19 abstention turns). Villagers fought wave-4 monsters
7 times, all on seed 75104, all field context, all against the
Suburb except one against the Eater: 3 fled, 4 died, 0 killed.
20 wave-4 arrivals 100% classified (15 still-present, 3 melted
after fled player fights — melts, not kills — 2 departed).
Activation gate held on every checkable channel; the pending-hook
layer contributed nothing (0 drive-offs, 0 pending-seen) because
feast draws are faced inside upkeep before any policy hook runs
— a confirmed timing fact, not a broken hook.

## The paired comparison (the coordinator's job, done here)

Same seeds 75101–75108, same substrate (tableseat-nowait VERBATIM,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware), two policies:
player fights (channel) vs player abstains (abstain). The two bands
are paired by seed + substrate, NOT identical trajectories — the
abstention policy itself diverges the runs (fleeing vs fighting
changes days, deaths, and later arrivals), so arrival counts differ
(11 world births on the channel band vs 20 arrivals on the abstain
band) and per-seed ends differ. The comparison is therefore about
the kill step, not about re-running one band through the other
policy:

- Kills: 0 (channel, player fighting) vs 0 (abstain, player
  abstaining). The scholar's sword adds ZERO wave-4 kills on this
  band. Villagers alone also kill zero. No channel kills wave-4
  monsters here, with or without the scholar's sword.
- What this does and does not do to the census family: the
  family's "scholar is the only recorded killer identity"
  (vetsurvive / w5seq / w4funnel) is NEITHER replicated NOR
  contradicted — a zero-kill band cannot speak to killer
  identity, and both arms say so plainly. What the pair DOES
  settle on this band: the binding step is fight lethality, not
  the scholar's presence. The next arm must measure the damage
  gap (see below), not manufacture more meetings or re-test
  whose sword it is.
- Wins: channel 5/8 vs abstain 6/8, all lesser seat, full seat
  0/16, wave-5 unlock 0/16. Abstaining from wave-4 fights costs
  nothing on the win path here (one-seed difference on a paired
  8-seed band — an observation, not a lever verdict; no claim
  that abstention helps wins is made).

## Wall numbers (paired bands, NOT pooled n=16)

| field | channel (player fights) | abstain (player abstains) |
|---|---|---|
| national ever / final | 7/8 / 6/8 | 7/8 / 6/8 |
| table invited / entered | 5/8 / 5/8 | 6/8 / 6/8 |
| wins (lesser / full) | 5/8 (5 / 0) | 6/8 (6 / 0) |
| wave-4 unlock | 3/8 | 3/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 145d | 152d (upper-median; conventional 148.5) |
| starvation deaths | 1 | 1 |

National is NOT the wall on either band (7/8 reach it); the lesser
seat is the live path (11 wins across the pair, all lesser); the
full seat is still nobody's story, and wave 5 still unlocks nowhere.

## Village assessment (plain words)

Five or six of these eight villages win through the lesser seat and
go home; the rest die, one before day 35. Seven reach national
standing at some point. But only three ever reach wave 4, only two
ever meet a wave-4 monster in a fight, and none ever kills one.
The village that goes furthest into the draft meets the Mirror
Draft seven times in one monster, loses every fight, watches a
villager die to the second Reunion, and dies itself the day after
the last lost fight. The village that fights the most wave-4
fights loses six turn-based fights to a single Eulogy and watches
it melt on its own final day — not killed, just gone. The
villagers themselves read as people throughout (they name the
monsters, argue about them, circle the cookfire, keep sowing and
teaching while the monsters pace the treeline) — and their answer
to a wave-4 monster is always the same: endure it, name it, and
let it stay. If wave 4 is supposed to be the System building
monsters out of us, on this band it built them, introduced them,
and watched us lose to them without ever landing a killing blow.

## Blanks filled or documented

- FILLED (answered, with numbers): the 2036Z round's top blank —
  wave-4 encounter→kill conversion by channel on a fresh band
  (arrivals 11, engaged 6, killed 0, 24 fights by channel, narrowest
  stage engaged → killed) — plus the paired question the 2147Z
  round posed with it (does the scholar's sword gate wave-4 kills?
  No: 0 vs 0 on this band).
- FILLED (negative, measured): the non-world-TB channel is EMPTY
  at wave 4 on this band (0 null-origin TB fights) — the w4funnel
  strike door did not reproduce; the feast-draw and contest doors
  that did fire at wave 4 produced only mismatch losses.
- DOCUMENTED, NOT FIXED (named next blank): a wave-4 LETHALITY
  census — per wave-4 fight, damage dealt, rounds, monster HP left,
  fighter HP left, by channel; the distribution of single-fight
  damage vs monster max HP (how far is the closest loss?); whether
  any channel ever deals >50% of a wave-4 monster's HP in one
  fight. DIAG-GO when every wave-4 fight on the band has a damage
  record and the closest-loss gap is named. Rationale: this round
  proved conversion is zero across channels with and without the
  scholar's sword; the next arm must measure the damage gap before
  any lever touches meeting rates, or the loops will keep
  manufacturing meetings that end in losses.
- DOCUMENTED (abstain metric-review items, for the next run, never
  applied here): sense replays should window on the seed's wave-4
  window, not the horizon tail; orphan strikes (47, no resolvable
  fight ID) are a measurement blind spot; "melted" naming reads
  like a player kill and must be annotated wherever reported;
  the validator should pick one median convention and label it;
  the pending-hook layer is currently untestable by census design
  (feast draws never sit pending at driveContests time).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. Each arm was judged exactly
against its own pre-registered GO legs (channel: 5 legs, all PASS;
abstain: legs (a)–(d), all true, DIAG-GO). The coordinator's
paired comparison uses only the two arms' judged numbers plus
their stated caveats — no new verdict was manufactured from
unjudged columns. Doubts recorded above apply to the NEXT run.

Balanced panel (§15): same standing exception as the census-family
corpora, sixth round — scripts/balance-panel.js has NO
corpus-ingest mode (it builds panels from live roots, not census
rows). No panel artifact was faked; the sweep tables + analyzer
outputs are the comparison of record.

## Telemetry deviation check (loop body step 10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/perseed-w4channel-a/*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national 12→0, table
−69% 16→5, wins 16→0, n=10 files). Same command on
perseed-w4abstain-a → 3 LOUD lines (national 12→0, table −62%
16→6, wins 16→0, n=11 files). Verdict: KNOWN ARTIFACT, no
investigation, baseline NOT rolled — two independent reasons,
both documented (same as the arms' own checks): (a) the baseline's
own regime note forbids comparing a ~100%-win winseat suite to a
tableseat-nowait census substrate; (b) the field-shape artifact
(per-seed rows carry nationalEver/entered/won, not top-level
national/table/wins paths; summary/analysis/detgate are the extra
files). Real wall numbers are in the table above. No exiled LOUD
line on either corpus.

## Infrastructure notes

- Sequential merge dance: abstain merged first (it had rebased
  onto the then-current master 0f6b898b); channel rebased a second
  time onto the abstain merge and then merged. Both merges
  --ff-only, both proofs green on merged master, both trees
  released done-merged, worktrees removed, branches deleted.
- Safe-commit index clobber hit the abstain adoption commit
  (bogus staged deletions for all 15 files, commit itself
  correct) — repaired via HEAD-blob cacheinfo, verified status
  empty + diff HEAD empty. No clobber on the coordinator commit
  (checked the same way).
- Registry lock flock contention all run: heartbeat calls queued
  behind many sibling reaps/heartbeats (17 PIDs on REGISTRY.lock
  at one check); heartbeats took up to ~86s, waited out, nothing
  killed. The stale 21:50Z heartbeats on the adopted trees were
  NOT treated as death — the adoption work itself was the proof
  of life, and both trees were released properly at the end.
- worktree-reap.sh at run start removed nothing: 16/16 trees
  active at cap (several with uncommitted changes, never
  auto-removed). Adoption of existing trees was the only path
  for new work this run; future runs that need a fresh tree must
  wait for a release or adopt, not force the cap.
- Master moved twice under the run before the merges (sibling
  ontology commit 0f6b898b, then the abstain merge itself); zero
  file overlap with either arm; no EPERM flap blocked this run's
  writes. No jest run: zero src/js changed, and the arm proofs
  are the attributable verification (census-family precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added).
- Main tree clean at closeout; both arms merged locally, pending
  ship. No push, no bump, no live verification (ship-loop line).

## Findings appended to backlog

- [open] wave-4 lethality census (this round's named next arm —
  see "Blanks" above).
- [open] scholar-sword paired zero (this round's paired verdict —
  0 kills with the scholar fighting vs 0 with the scholar
  abstaining on identical seeds/substrate; fight lethality, not
  the scholar's presence, is the binding step).
