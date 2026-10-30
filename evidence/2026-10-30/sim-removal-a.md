# sim-removal-a — unexplained-removal census (DIAG-GO)

**Verdict: DIAG-GO** (every GO bar met; one verdict carries a disclosed
window caveat — see the algorithm chain below — and scholarmelt's own
verdicts are NOT re-scored here).
Run: flesh-out loop, run fleshout-20261030T0855Z, axis scale-onramp
(blocking axis, converging, NOT converged). Sibling Loop B live on
food-economy the whole run — NOT touched. DIAG ONLY — no game changes,
no default flip, no gate move, no deed-bar move. Merged locally,
pending ship. No push, no version bump, no live verification (the
batch ship job owns deploys).

Prereg: `evidence/2026-10-30/sim-removal-a-prereg.md` (committed
before any judged analysis: 276f3ceb6; a retry-loop misfire then
landed an empty follow-up commit 5604 with the same message and the
same tree — no content change, disclosed here, not hidden).
Corpus: `evidence/2026-10-30/perseed-removal-a/` (row + enriched
census per seed), analysis: `evidence/2026-10-30/sim-removal-a-analysis.json`.
Instruments: `scripts/policies/removal-diag.js` (record-only
removeWorldMonster + spawnWorldMonster wraps, object-identity uid),
`scripts/sweep-removal-a.js`, `scripts/analyze-removal-a.js`,
fixtures `scripts/test-removal-a.js`. Cross-reference corpus (never
re-judged): `evidence/2026-10-30/perseed-scholarmelt-a/`.

## What was asked

Which code path removes each wild wave-4 beast on the band — with a
taxonomy that includes LOSTSIGHT-REMOVE, FLED-BOLT, FLED-GAVE-UP,
GLASSWING-TRAP-VANISH, CURIOUS-FADE, TITAN-FALL-CLEANUP, SCHOLAR-MELT
(cross-referenced from scholarmelt, never re-judged),
SCHOLAR-RESTORED / SPAWN-ENDED where applicable, VILLAGE-GONE, and
honest UNCLASSIFIED. The instrument is new: every removal and every
spawn is recorded with its call stack and the monster object's
identity (uid), so a beast's trajectory is a uid's day-by-day path,
never a hp+tile adjacency guess. The two no-story chains and the
three unexplained (4,4) drops from the 0738Z run each had to get a
verdict or a named missing instrument.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — 276f3ceb6 before any judged analysis (plus empty 5604, disclosed above) |
| Pilot gate | fixtures + 1-seed determinism + substrate identity before full sweep | PASS — fixtures 32/32; pilot s75102 row-minus-removal byte-identical to chainclose; removal instrument observed 23 removals on the pilot seed, including the eulogy lost-sight row in form |
| Seeds | 16/16 valid | PASS — 16/16 rows (days > 0, all recorder errs 0, no overflow), census present/sorted/within-1 on all 16, every census entry carries a uid |
| Substrate | every row minus `removal` byte-identical to chainclose | PASS — 16/16 |
| Chain-end completeness | every BEAST-VANISHED chain carries a taxonomy class or honest UNCLASSIFIED | PASS — 4/4 classified, 0 UNCLASSIFIED (algorithm carries an EDGE flag, see below) |
| Vanished-set diagnostic | agrees with recurrence's 4 pairs | PASS — {75102\|algorithm, 75102\|eulogy, 75116\|audit, 75116\|suburb} |
| Named cases | 2 chains + 3 drops each get a verdict or named instrument | PASS — 2/2 chains classified, 3/3 drops reproduced and classified |
| Determinism | 1 seed re-run, row + census byte-identical, scratch removed | PASS — seed 75102: row IDENTICAL, census IDENTICAL, DETERMINISM-PASS, scratch removed (see instrument lesson) |
| Sense | logs/traces/rows for every judged chain read end to end | PASS — all 4 chains' villager logs + matched scholar traces + removal rows read (see sense section) |
| Fixtures | test script green | PASS — FIXTURES-PASS 32/32 |
| Uid consistency | (analyzer leg) one uid never carries two monster ids | PASS — 0 conflicts |

**Formal verdict is DIAG-GO.** The algorithm chain's EDGE flag is a
caveat on its window, not a missing verdict: the removal row exists,
classifies cleanly, and is disclosed as falling on the chain's last
day rather than strictly after it. Scholarmelt's verdict for that
chain stays INSUFFICIENT-DATA under its own prereg — this arm does
not promote it, because this arm's window is a removal-row window,
not scholarmelt's dayStart window.

## The 4 vanished chains (all resolved)

### RESOLVED — s75102 eulogy 853: LOSTSIGHT-REMOVE

- Chain: n=4, d55-59, remaining HP 853, lastSeen d61, firstAbsentDay
  d62, finalDay 85. Census uid 25, present d57-61 at (4,4), gone d62.
- Removal row: seq 41, d62, eulogy hp=853, tile (4,4), detail-grid
  (mx 0, my 8), stance null, **lostSight=7**, stack monsterTurn →
  tickAction. Code order matches: monsterTurn checks lostSight
  before the stance machine, and removes at lostSight > 6.
- No scholar fight, no villager fight, no fledMonsters entry, no
  tb fight live. The beast sat at the haven tile for days after
  its last meeting (d59), unseen by any target, and the world
  dropped it for losing the trail. This is the code path
  scholarmelt's ranked-next #1 named as its strongest candidate
  (game.js lostSight > 6 → removeWorldMonster), now proven on a
  row, not a guess.

### RESOLVED — s75116 audit 785: SCHOLAR-MELT (cross-ref, as judged)

- Chain: n=1, d139, remaining HP 785, firstAbsentDay 140,
  finalDay 180. This is scholarmelt's judged melt, re-confirmed
  here by an independent row: removal seq 48, d140, audit hp=785,
  tile (4,4), uid 28 — the same uid spawned d132 (1100), tolled
  to 825, censused d133-139 at 825, met d139 (825→785) — lifted
  by startCombat d140, scholarmelt fightSeq 21 (lost, fighter
  785→661 alive, no restore). Cross-reference only: the melt
  class comes from scholarmelt's classification, the removal
  row corroborates its day, hp, tile, and identity.

### RESOLVED — s75116 suburb 1285: SCHOLAR-MELT via a toll bridge (uid-proven)

- Chain: n=1, d140, remaining HP 1285, lastSeen d158,
  firstAbsentDay 159, finalDay 180. Census uid 29: spawned d140
  (1300), met d140 (1300→1285, Miguel dies), roams d141-158 at
  1285, gone d159.
- Removal row: seq 59, d159, suburb hp=960, tile (4,4),
  **lingering=true**, uid 29 — the SAME object. Between the
  d158 snapshot (1285, lingering false, tile (6,4)) and the
  d159 removal, the beast was drafted to the siege: tile → (4,4),
  lingering flips false→true, and hp 1285→960 — exactly
  round(1300 × 0.25) = 325, the havenGrowth palisade toll.
  Then scholar fightSeq 23 (d159, lift 960, lingering, lost,
  fighter 960→885 alive, no restore) melts it.
- Why scholarmelt called this a near-miss: its prereg matching
  required lift hp == chain hp (960 ≠ 1285), so it correctly
  refused the match under its own rules. This arm does NOT
  overturn that: scholarmelt's chain verdict stands as
  INSUFFICIENT-DATA under its prereg. What this arm proves with
  a new instrument is the identity the hp rule could not see:
  the 960 lingerer IS the 1285 wild beast, bridged by one
  exact toll. The draft event itself is NOT recorded (no draft
  recorder exists — spawnhp ranked-next #2, still open), so
  the draft/toll mechanism is signature-inferred (exact amount
  + haven tile + lingering flip + uid continuity), while the
  object identity is directly proven by uid.
- Note: a lingering raider lost by the scholar is normally
  restored by tbEnd — here it was not (restoredIdentity false
  in scholarmelt). The corpus does not say why (the restore
  requires the origin tile to be unoccupied at tbEnd); the
  melt is empirical, the blocked-restore reason is not
  resolved here and is ranked-next, not guessed.

### RESOLVED (EDGE) — s75102 algorithm 959: SCHOLAR-MELT, same-day edge

- Chain: n=4, d65-71, remaining HP 959, firstAbsentDay 72,
  finalDay 85. Removal row: seq 47, d71, algorithm hp=959, tile
  (4,4), startCombat; scholarmelt fightSeq 21, d71, lift 959,
  lost, fighter 959→957 alive, no restore → SCHOLAR-FLEE-MELT
  there.
- EDGE flag: the removal day (71) equals the chain's last
  meeting day, so it falls outside this prereg's primary
  window (lastSeen, firstAbsentDay] — lastSeen is null here
  (the beast is gone by the first post snapshot), and the
  primary window as implemented is (71, 72]. The verdict
  rests on the edge row, disclosed as such. The ordering
  argument is scholarmelt's and still stands: the d71
  villager meeting ends with the beast alive at 959 (Ursula
  dies, 0 dealt that meeting), so meeting-then-fight is the
  only order consistent with both events plus gone-by-d72.
  A next-run prereg with a [lastDay, firstAbsentDay] window
  plus part-stamped ordering would make this primary; this
  arm does not widen its own window mid-run to claim that.

## The 3 unexplained (4,4) drops (all reproduced, all resolved)

All three reproduce exactly on uid trajectories (same uid, same
tile (4,4), same endpoints) and all three are the same mechanism:
a scholar fight against a lingering besieger, lost by the scholar,
whose fighter wounds survive the restore — the siege continues
weaker. Each has EXACTLY ONE matching scholarmelt fight
(lift == drop-from, restoredHp == drop-to, lingering, (4,4)):

| Drop | Snapshots | Scholar fight | Wound |
|---|---|---|---|
| s75105 suburb 975→872 | d127→128 | fightSeq 25, d128, lift 975, lost, restored 872 | 103 |
| s75114 reunion 900→745 | d125→126 | fightSeq 29, d126, lift 900, lost, restored 745 | 155 |
| s75114 algorithm 750→624 | d158→159 | fightSeq 42, d159, lift 750, lost, restored 624 | 126 |

Phase note (carried, and now systematic): in all three, the
fight's dayStart equals the drop's LATER snapshot day (toDay).
Snapshots are start-of-day state, so a fight recorded on day D
can land before day D's snapshot in the day-boundary phase —
the same phase behavior scholarmelt noted for the audit fight.
The hp-exact lift→restore match is the identity proof, not the
day label alone. None of the three amounts is toll-shaped
(tolls would be 325 / 300 / 250), and none has a villager
meeting on the drop day — the tb-restored-wound class is the
only fit, and it fits exactly three times.

## Band census (removal rows, not fight counts)

- 27 wave-4-type removal rows band-wide (all channels/flags —
  this is a row count, NOT scholarmelt's fight census, and the
  two must not be compared like-for-like): SCHOLAR-MELT 15,
  SCHOLAR-RESTORED 9 (lifts that came back — not ends),
  LOSTSIGHT-REMOVE 2, SCHOLAR-KILL 1 (s75110 strike, tolled
  1000→750, scholar-killed d82). Spawns recorded: 601.
- The second LOSTSIGHT-REMOVE is a bonus resolution, not a
  chain end: s75113 eulogy, tolled 900→675 d113, removed
  d114 at lostSight 7 — the "d113 tolled eulogy [that] vanished
  with no meeting" from spawnhp. It never had a field meeting,
  so it is an unmet-streak end, not a chain end, but the row
  resolves it all the same.
- Taxonomy classes with ZERO wave-4 rows on this band:
  FLED-BOLT, FLED-GAVE-UP, GLASSWING-TRAP-VANISH, CURIOUS-FADE,
  TITAN-FALL-CLEANUP, CAMPAIGN-CLEAR, VILLAGER-KILL (as a
  removal class — villager kills of wave-4 beasts end chains
  as FINISHED meetings, and there are none among the wild
  chains; see fates). These classes are code-read, not
  observed for wave-4 here — coverage note, not a gap.
- 10 wild wave-4 chains total: 4 BEAST-VANISHED (all resolved
  above), 4 NEVER-CROSSED (still present at run end, villagers
  never re-met them despite field days in the window), 2
  VILLAGE-GONE (run ended within 7d of the last meeting).
  No wild wave-4 chain was FINISHED by villagers on this band.
- 29 uid-trajectory drops band-wide, 0 DROP-UNCLASSIFIED:
  DROP-VILLAGER-FIGHT 7, DROP-SCHOLAR-RESTORED-WOUND 4 (the
  three named + s75102 herald 700→679 via a dissolved
  restored fight), DROP-RAID-TOLL 18 (all exact 25% amounts
  with haven-tile moves — the toll signature, now with uid
  continuity behind it). The per-id method finds only 28:
  it misses s75102 reunion 1200→1185 (a twin-pair artifact —
  two same-id entries on one day, first-entry picks the wrong
  one). The uid method is strictly better; future drop work
  should use it, not per-id.
- Census-phase corollary: the s75105 suburb toll drop
  1300→975 (d122→123, tile (4,3)→(4,4)) and the s75114
  algorithm toll drop 1000→750 (d157→158) are the toll
  signature on the same objects that later produce the named
  restored-wound drops — one beast can be tolled, then
  scholar-wounded, in sequence. Wounds compose; the census
  alone cannot separate them without the event rows.

## Wall numbers (this band's own corpus, report-only)

Identical to chainclose/spawnhp/scholarmelt (a consequence of
the byte-identical rows, reported here as this run's own
corpus, never as a before/after): wins 9/16 (all lesser, full
0), national ever 13/16, national final 11/16, table reached
12/16, table entered 9/16, wave reach 16/16/14/9/0, median
survival 118d, deaths 527. Telemetry vs the scale-wall baseline
is the coordinator's step (this worker reports the numbers,
not the baseline roll).

## Reachability verdict

Unchanged by this arm (measurement only): waves 1-4 reachable,
wave 5 unreachable on this band (0/16), the table reachable
only through the lesser seat, the full seat unreached. What
this arm changes is the wall's plumbing, not its height: the
two "vanish with no story" chains now have stories, and the
three "wound with no fight" drops now have fights. Nothing
here moves a gate or a deed bar.

## Village assessment (plain words)

The village in this band does not lose its hardest beasts to
mystery — it loses them to three ordinary mechanisms, each
now caught on a row. Most often the scholar meets a beast and
loses, and the beast simply melts away instead of staying on
the map: that is the scholar-melt sink, and it took three of
the four vanished chains (one of them only after the beast
had been drafted to the siege and taxed by the wall). The
fourth beast did something quieter: it sat at the haven
treeline for days after its last fight, nobody came to it,
and the world stopped seeing it — after seven ticks of
losing the trail, it was gone, with no fight and no farewell.
And the beasts that stay do not stay unwounded: when the
scholar fights a besieger and loses, the besieger still comes
back hurt — the scholar's blows land even in defeat, and the
siege gets weaker by exactly that much, three times over.
The village's hardest beasts are not mysterious in their
comings and goings anymore — but one thing still is: a
lingering raider that should have been put back after the
scholar's loss was not put back, and the corpus does not say
why. That is the next measurement's job, not a lever's.

## Sense notes (logs read end to end)

- SENSE-PASS on all 4 chains + all 3 drops. Villager logs cohere
  with the removal rows in every case: the algorithm chain's
  d71 meeting leaves the beast standing at 959 (Ursula dies,
  0 dealt); the eulogy chain's meetings wound 900→853 and then
  stop after d59 while the beast sits at (4,4) through d61;
  the audit chain is one clean losing fight (Miguel + Isabel,
  825→785, Miguel flees at 1 HP); the suburb chain is one
  strike and a death (Miguel, 1300→1285), then 18 days of
  roaming, then the siege draft and the scholar's losing
  fight. The drop fights cohere too: in each, the scholar
  loses but the fighter's end HP equals the restored HP
  exactly — defeat still wounds the siege.
- Limitation, stated plainly: node-sim stubs Game.say to
  no-op, so there is no say transcript for any of this —
  evidence is the structured trace (removal/spawn rows,
  census uid trajectory, fieldparty logs, scholarmelt
  traces). The "lost your trail" line for the eulogy removal
  is code text, not observed narration in this corpus; a
  browser play pass would be needed to hear it.
- A sense flag, not a verdict: the eulogy lost-sight removal
  happens on the player-side monsterTurn (the player-tile
  monster's turn). The beast sat at (4,4) — the haven tile —
  while the scholar presumably moved elsewhere; the code
  counts visibility to ANY target (player or villager), so
  its removal means no target was visible for 7 ticks. That
  reads as "the beast waited at the treeline and nobody came"
  — coherent, but whether a haven-pinned beast SHOULD be
  able to lose sight this way (as opposed to lingering as a
  siege) is a design question for a later arm, not a finding
  of this one.

## Metric review

- The prereg bound the run and was honored: no metric was
  re-scored mid-run. The algorithm EDGE is the one place the
  prereg's window wording proved ambiguous (lastSeen null
  makes "(lastSeen, firstAbsentDay]" undefined at its lower
  end). Proposed for the NEXT run only: define the removal
  window as [chain lastDay, firstAbsentDay] with the
  primary/edge distinction kept as a report field, and add
  part-stamped ordering for same-day meeting→fight pairs
  (the scholarmelt same-day prereg, still owed).
- The band-removal print label in the analyzer's first run
  ("wild w4 removals") was loose — the count covers all
  wave-4-type rows regardless of channel/flag. Fixed in the
  analyzer before the final analysis run; the evidence here
  uses the correct label. Numbers unchanged.
- Instrument lesson (test fix, landed in this arm): the first
  determinism helper called process.exit() inside try, which
  skips the finally block — the scratch dir survived the
  first DETERMINISM-PASS. Fixed to exit only after the
  finally runs; the re-run passes with the scratch actually
  removed. Future test scripts with scratch dirs must not
  exit inside try.
- Stack-frame limitation (disclosed, not hidden): removal
  rows carry V8 stack frames including the worktree-absolute
  harness path. Determinism holds within one worktree (the
  gate as defined); a cross-worktree byte comparison would
  differ on those frames. A future instrument revision could
  strip harness frames to worktree-relative paths.
- No metric is proposed for revision on substance: the
  taxonomy, the uid method, and the drop classes all worked
  as preregistered, with zero UNCLASSIFIED in either
  universe (4 chains, 29 drops).

## RANKED NEXT (with numbers — no lever built here)

1. DRAFT RECORDER (turn the toll inference into proof).
   The suburb bridge (1285→960) and the audit pre-d133 draft
   (1100→825, day still undatable from this corpus) both rest
   on toll signature + uid continuity. A record-only draft
   recorder (day, entity uid, hp/maxHp before/after, palisade
   flag) would date both directly and confirm the palisade
   condition instead of inferring it.
2. SAME-DAY WINDOW + PART-STAMPED ORDERING (scholarmelt
   next-run prereg, still owed). The algorithm EDGE row
   (removal day == chain last day) becomes primary under a
   [lastDay, firstAbsentDay] window; part stamps would prove
   meeting-then-fight order instead of arguing it.
3. BLOCKED LINGERER RESTORE (why fightSeq 23 was not
   restored). The tbEnd restore requires the origin tile to
   be unoccupied; the corpus does not record the tile
   occupancy at tbEnd. A restore-guard recorder (or a
   targeted fixture) would say whether the (4,4) tile was
   occupied at d159 tbEnd — and whether "lost to a lingerer,
   siege continues" ever fails this way in live play.
4. UID-CARRYING CHAIN MATCHER. Hp-exact chain matching
   systematically misses drafted instances (suburb 1285→960
   is the proof). Future chain arms should match by census
   uid first, hp second, so toll-bridged chains are never
   again reported as "different instances".
5. FLED-CLASS COVERAGE. FLED-BOLT / FLED-GAVE-UP (and
   CAMPAIGN-CLEAR / TITAN-FALL-CLEANUP) have zero wave-4
   rows on this band. A band where a wave-4 beast flees
   across a grid edge would exercise them; until then they
   stay code-read classes, not observed ones.
6. LOST-SIGHT AT HAVEN (design question, Steve-call if
   pursued). Should a beast pinned at the haven tile be
   able to lose sight and fade, or should haven presence
   anchor it? The eulogy rows prove the mechanism; whether
   it is the intended story is not this arm's call.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it). What converged further is the removal
plumbing: the unexplained-removal sink is now empty on this
band (4/4 chains, 29/29 drops classified, 0 UNCLASSIFIED in
either universe).
