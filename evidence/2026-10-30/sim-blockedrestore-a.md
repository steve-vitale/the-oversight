# sim-blockedrestore-a — blocked-restore census (DIAG-GO)

**Verdict: DIAG-GO** (every GO bar met; the census is complete,
the anchor reproduces exactly, and the 1-HP question is answered
under the prereg rule: COMMON BUT NOT THE RULE — 4 of 13 blocks,
not the majority, not a rarity).
Run: flesh-out loop, run fleshout-20261030T1015Z, worker
sim-blockedrestore-a, axis scale-onramp (blocking axis, converging,
NOT converged). DIAG ONLY — no game changes, no default flip, no
gate move, no deed-bar move. No [needs-eyes]: this arm changes no
feel, combat, or UI — it only analyzes an already-recorded corpus.
Committed on branch, pending coordinator merge. No push, no version
bump, no live verification (the batch ship job owns deploys).

Prereg: `evidence/2026-10-30/sim-blockedrestore-a-prereg.md` (committed
a9f4fc65, BEFORE any judged analysis).
Corpus (read-only, untouched): `evidence/2026-10-30/perseed-draftflag-a/`
(the draftflag corpus — this arm ran NO new sweep and NO new sims).
Analysis: `evidence/2026-10-30/sim-blockedrestore-a-analysis.json`.
Analyzer: `scripts/analyze-blockedrestore-a.js` (pure: reads corpus
JSON, never touches game state, never writes into the corpus).
Fixtures: `scripts/test-blockedrestore-a.js`.

## What was asked

Draftflag's secondary leg answered ONE case: scholar fightSeq 23
(s75116, d159) was not restored because origin tile (4,4) was held
at tbEnd by uid 33, a 1-HP wave-3 callback besieger. This arm
generalizes band-wide: how often do scholar tb-combat restores fail
on tile occupancy, and is the 1-HP blocker pattern a rarity or a
rule? The analyzer censuses the tbEnd events already in the
draftflag corpus — no new recorder, per the assignment.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — a9f4fc65 before any judged analysis |
| Pilot gate | fixtures + seed 75102 reproduction + corpus integrity + instrument firing before full census judged | PASS — fixtures 46/46; pilot s75102 reproduced its 12 tbend rows, recon MATCH, valid; corpus untouched; pilot diag tbEndWithOrigin 12, errs 0 |
| Seeds | 16/16 valid | PASS — 16/16 (days > 0, errs 0, overflow empty, census sorted + lastDay within 1) |
| Substrate | corpus byte-unchanged + per-seed tbend reconciliation + row-minus-additive identity vs chainclose | PASS — corpus untouched (git status clean on the corpus dir); recon MATCH 16/16; identity re-verified 16/16 in the fixture leg |
| Census completeness | every tbend 'lost' classified, zero unclassified; every dissolved counted as UNMEASURED with hook named; anchor exact; blocker uid/hp/wave/tile on every BLOCKED row | PASS — 24/24 lost classified, 0 unclassified; 120 dissolved counted UNMEASURED; anchor exact; 13/13 BLOCKED rows carry full blocker fields |
| Determinism | analyzer run twice, byte-identical, scratch removed | PASS — DETERMINISM-PASS, scratch removed |
| Sense | anchor chain + >= 2 further BLOCKED rows' census/draft context read end to end | PASS — anchor chain, s75110 triple chain, s75113 anaconda chain read end to end (see sense section) |
| Fixtures | test script green before judged census analyzed | PASS — FIXTURES-PASS 46/46 |

**Formal verdict is DIAG-GO.** The 1-HP pattern sub-verdict is
COMMON BUT NOT THE RULE under the prereg rule (see below) — a
sub-verdict, not a census failure. Draftflag's, scholarmelt's, and
removal's verdicts are carried, never re-judged: no draftflag
target is re-scored under a different window here.

## The mechanism (read from code, as preregistered)

tbEnd restores a lifted worldOrigin only when the result is not
'won' and (the origin is not a lingerer, or it is a lingerer lost
to or fled from — a routed lingerer broke and ran, a slain one is
gone). The restore is then attempted only if the fighter copy is
still standing, the origin is not already in the world list, and
`monsterAt(origin.tx, origin.ty)` is empty. `monsterAt` is
`worldMonsters().find(...)` — the FIRST monster listed at that
tile. The census below shows why that first-match detail matters:
several lingerers can be listed at (4,4) at once (the raid draft
and the dawn re-pin move them onto the haven tile without checking
occupancy), so "occupied" at guard time means "at least one fellow
besieger is still listed at the treeline tile" — not a strict
one-monster-per-tile invariant, which the wander rules enforce
elsewhere but the raid paths do not.

## Census numbers (the judged counts)

All 102 tbend events (worldOrigin tbEnd calls) in the corpus:

| Result | Total | Restored | Blocked | By-design not restored | Unmeasured-cause |
|---|---|---|---|---|---|
| won | 66 | 0 | 0 | 66 | 0 |
| routed | 12 | 0 | 0 | 12 | 0 |
| lost | 24 | 11 | 13 | 0 | 0 |
| fled | 0 | 0 | 0 | 0 | 0 |
| **ALL** | **102** | **11** | **13** | **78** | **0** |

Read it plainly:

- Of the 24 scholar losses against lifted origins — the only
  population where a lingerer loss should restore — 11 restored
  (45.8%) and 13 melted on tile occupancy (54.2%). There is no
  third outcome in this corpus: **every lost lingerer either came
  back or was blocked, and the block was always a named fellow
  monster on the tile.** Zero UNMEASURED-cause rows anywhere in
  the census: the prereg's named gap (fighter-standing state at
  tbEnd) never materialized — no eligible not-restored row lacked
  an occupant, so no row needed the missing hook.
- The 78 by-design rows are not failures: 66 'won' (the beast was
  slain — nothing to restore) and 12 routed lingerers (the code
  deliberately does not restore a lingerer that broke and ran).
  All 12 routed events in the corpus are lingerers, so no routed
  non-lingerer restore was observed either way.
- Fled: ZERO tbend events with result 'fled' in the corpus. The
  fled half of the lingerer-keeps rule (fled → restore) is
  therefore unobserved here — not a zero rate, an empty
  population. A band where the scholar flees a lingerer fight
  would be needed to exercise it.
- Dissolved: 120 scholarmelt meetings with result
  'dissolved-no-tbend' (s75102: 32, s75104: 45, s75105: 43, all
  other seeds 0). They ended without a tbEnd call, so they have
  no tbend event by construction and are UNMEASURED for the
  blocked question — missing hook: a dissolve-path recorder.
  They are counted, never folded into the blocked count.
- Scholarmelt linkage (context only): 71 lost meetings band-wide;
  all 24 tbend 'lost' events link to a lost meeting on the same
  seed/day/id/hp (24/24 linked, 0 unlinked). The other 47 lost
  meetings are non-origin fights (wild roaming scholar fights),
  outside the restore question.

## Blocker breakdown (all 13 BLOCKED rows)

Every blocker stood on the haven tile (4,4): 13/13. Every blocker
was raidBorn (13/13) — a fellow besieger, never a wild passer-by.
11/13 were lingering at tbEnd; the other 2 (spool uid 51, eulogy
uid 48, both s75113) were raidBorn with lingering already cleared
by the drift valve but still standing on the tile — expired
lingering does not clear the tile, so they still block.

- By blocker hp: 1 HP: 4 rows (30.8%); > 1 HP: 9 rows (hp 7, 130,
  142, 181, 658, 712, 750, 750, 850 — including a full-HP 850
  influencer). The typical blocker is a healthy fellow besieger,
  not a cripple.
- By blocker wave: wave 1: 2, wave 2: 1, wave 3: 5, wave 4: 5.
- By blocker id: callback 2 rows, all others 1 row each
  (influencer, hushwolf, eater, strike, anaconda_empress,
  redactor, spool, eulogy, chorus_line, algorithm,
  warranty_caller). 12 distinct blockers across 6 seeds
  (75102, 75105, 75110, 75113, 75114, 75116).
- 1-HP blockers, in full: hushwolf uid 13 (wave 1, s75105 d126),
  warranty_caller uid 21 (wave 2, s75116 d111), callback uid 33
  (wave 3, s75116 d159 AND d162 — the same beast blocking twice).
  All four 1-HP rows are time-order floor-corroborated: each
  blocker has a draft row ending at hp 1 on a raid day BEFORE
  the tbend day (hushwolf d99/d122, warranty_caller d100/d108,
  callback d158). The 1-HP class is real, and it is the wall
  floor's signature — but it is 4 of 13, not the story.

**1-HP pattern verdict (prereg rule): COMMON BUT NOT THE RULE.**
n = 13 (>= 4, so a pattern verdict is licensed), k/n = 4/13 =
30.8% — between the rarity bar (<= 25%) and the rule bar
(> 50%). The 1-HP blocker is a recurring character (3 distinct
beasts, 2 seeds, one of them blocking twice), but most blocks
(9/13) are healthy besiegers. The fightSeq 23 case that motivated
this arm is the minority pattern, not the rule — and not a
freak case either.

## The 13 blocked rows (blocker stated, prereg completeness)

| Seed | Day | Origin (lost) | Blocker uid/hp/wave/tile |
|---|---|---|---|
| 75102 | 84 | focus_group uid 32, 192, w3 | influencer uid 35, 850/850, w4, (4,4) |
| 75105 | 126 | gallowdeer uid 8, 1, w1 | hushwolf uid 13, 1/50, w1, (4,4) |
| 75110 | 81 | algorithm uid 24, 750, w4 | eater uid 25, 712/950, w4, (4,4) |
| 75110 | 81 | eater uid 25, 712, w4 | strike uid 26, 750/1000, w4, (4,4) |
| 75113 | 61 | paparazzo uid 27, 1, w2 | anaconda_empress uid 28, 7/90, w1, (4,4) |
| 75113 | 113 | spool uid 41, 1, w3 | redactor uid 46, 130/260, w3, (4,4) |
| 75113 | 128 | anaconda_empress uid 11, 1, w1 | spool uid 51, 181/280, w3, (4,4) |
| 75113 | 137 | spool uid 43, 1, w3 | eulogy uid 48, 658/900, w4, (4,4) |
| 75113 | 150 | terms_of_service uid 45, 243, w3 | chorus_line uid 60, 142/300, w3, (4,4) |
| 75114 | 159 | callback uid 42, 130, w3 | algorithm uid 45, 750/1000, w4, (4,4) |
| 75116 | 111 | statickite uid 17, 1, w2 | warranty_caller uid 21, 1/80, w2, (4,4) |
| 75116 | 159 | suburb uid 29, 960, w4 | callback uid 33, 1/260, w3, (4,4) |
| 75116 | 162 | eulogy uid 35, 675, w4 | callback uid 33, 1/260, w3, (4,4) |

Chains worth noticing (not new judgments, just the shape of the
census): on s75110 the scholar loses to algorithm, blocked by
eater, then loses to eater, blocked by strike — the siege drains
one beast per loss, each loss blocked by the next beast in line.
On s75102 the full-HP influencer blocks focus_group on d84, then
is itself fought three times on d86 and restores each time
(850 → 415 → 229, wounded deeper each fight) once it is the last
besieger standing. The restore works fine — when the tile is
finally clear.

## Wall numbers (this band's own corpus, report-only)

Identical to draftflag (a consequence of the untouched substrate,
reported here as this run's own corpus, never as a before/after):
wins 9/16 (all lesser, full 0, carried from draftflag), national
ever 13/16, national final 11/16, table reached 12/16, table
entered 9/16, wave reach 16/16/14/9/0, median survival 118d,
deaths 527. Telemetry vs the scale-wall baseline is the
coordinator's step (this worker reports the numbers, not the
baseline roll).

## Reachability verdict

Unchanged by this arm (measurement only): waves 1-4 reachable,
wave 5 unreachable on this band (0/16), the table reachable
only through the lesser seat, the full seat unreached. What
this arm changes is the wall's plumbing, not its height: a
scholar loss against a lifted besieger now has a measured
fate — restore 46%, melt-on-occupancy 54% — and the melt is
never mysterious: it is always a named fellow besieger still
standing on the treeline tile. Nothing here moves a gate or a
deed bar.

## Village assessment (plain words)

When the scholar loses a fight against a beast from the siege,
the beast usually does not come back — not because the rule
failed, but because the treeline is crowded. The village's
besiegers all stand on the same patch of ground at the haven's
edge, and the scholar's loss only sends the loser home if it
was the last one standing there. More often, another besieger
is already on that patch — sometimes a great healthy beast at
full strength, sometimes a wounded one down to a single point
of strength that the wall's toll left standing — and the loser
melts instead. The siege then drains one beast at a time: each
loss melts the loser against the next beast in line, until the
last one is left and finally comes back, fight after fight,
wounded deeper each time. The 1-HP blocker that started this
census is real — the same little callback beast blocked two
great beasts three days apart and came back itself in between —
but it is the exception that proves the rule: most of the time
the beast in the way is healthy, and the melt is just what a
crowded treeline does.

## Sense notes (chains read end to end)

- SENSE-PASS on the anchor + two further blocked chains + the
  anaconda correction. Node-sim stubs Game.say to no-op, so
  there is no say transcript; sense evidence is the structured
  trace (tbend events, draft events, census trajectories,
  scholarmelt meetings), stated as such.
- Anchor chain, re-verified (s75116): callback drafted d151
  (260 → 35, fought composition), re-drafted d158 (35 → 1,
  wall floor), pinned (4,4) lingering. Census d159 shows both
  callback (1 HP) and eulogy (675) at (4,4) — the stack is real.
  Suburb fight d159 (tbend seq 27) lost, blocked by callback at
  (4,4); callback's own fight the same day (tbend seq 28,
  origin tile (3,4) — it had wandered off the treeline before
  its fight) lost, RESTORED at 1 HP and re-pinned to (4,4)
  (census d160–162); eulogy fight d162 lost, blocked by the
  same callback again. One 1-HP beast, two blocks, one restore
  in between — the blocker persists, it is not consumed.
- s75110 triple chain: raid d79 drafts algorithm, eater, and
  strike together (exact tolls 250/238/250, all to (4,4)
  lingering). Census d80 shows all three at (4,4); census d81
  shows only strike — algorithm and eater melted on their
  d81 losses, each blocked by the next beast in line. The
  queue drains in order, and the census days line up with the
  draft night exactly.
- s75113 anaconda correction (a limit of the analyzer's
  floor flag, disclosed, not hidden): the analyzer's
  floorDraftRow field is "ever floored in this seed", not
  "floored before this tbend". The anaconda blocker (hp 7 at
  d61) has a floor draft row — but dated d64, AFTER the block.
  At block time it was a legitimate 7-HP lingerer at (4,4)
  (censused d58–62), floored to 1 only later when it was
  re-drafted while roaming (d64 raid, ending at (5,5)). The
  judged time-ordered floor count is therefore 4 (the four
  1-HP rows), not the analyzer's ever-floored 5. The pattern
  verdict is unaffected (it counts blocker hp, not the floor
  flag), but a future analyzer revision should time-order
  the corroboration field.
- A sense flag, not a verdict: the restored influencer on
  s75102 (850 → 415 → 229 across three d86 fights) shows the
  restore capping at pre-fight wounds working as written —
  each loss deepens the wounds, never heals them. Whether a
  lost lingerer SHOULD melt whenever a fellow besieger
  stands on the tile (54% of losses) or should queue/displace
  is a design question for a later arm, not a finding of this
  one. The mechanism is proven; its desirability is not this
  arm's call.

## Metric review

- The prereg bound the run and was honored: no metric was
  re-scored mid-run. The classification rules come from the
  tbEnd code as written (won/routed-lingerer by-design, tile
  occupancy judged on occupantBefore only), and every lost
  row fell into exactly one class with zero unclassified.
- Two prereg-wording notes for the NEXT run (not revisions to
  this run's verdict): (a) the analyzer's floorDraftRow
  corroboration must be time-ordered (draft day < tbend day)
  — the anaconda row proves the ever-floored version
  over-counts by one; (b) "tbEnd lost/dissolved row" in the
  assignment needed the population split this prereg made
  (tbend 'lost' events censused; dissolved meetings counted
  UNMEASURED; fled population empty) — a future assignment
  should name the populations outright instead of leaving
  the split to the prereg.
- The fled population being empty is a coverage note, not a
  finding: the fled half of lingererKeeps has zero observations
  on this band, so no fled-rate claim is made in either
  direction.
- Instrument lesson (disclosed): see Infrastructure notes —
  the safe-commit index clobber, same known class, hit both
  commits in this run and was repaired the same way each time.

## Infrastructure notes (disclosed, all repaired)

- safe-commit index-clobber variant (known class from the
  repo's AGENTS.md lessons) hit BOTH commits in this run (the
  prereg commit, 1 file, and the instruments commit, 2 files):
  bogus staged deletions, worktree files intact, commit
  contents verified byte-identical to the worktree files
  before repair; repaired each time via update-index
  --cacheinfo from the HEAD blob and verified `git status`
  clean + `git diff HEAD` empty before proceeding. The
  commits themselves are correct; only the main index lied.
- Corpus untouched: no file under
  evidence/2026-10-30/perseed-draftflag-a/ was written by this
  arm (analyzer output goes to the analysis JSON beside it;
  determinism scratch went to /tmp and was removed). `git
  status` clean on the corpus dir at every commit.
- No jest was run by this arm (analyzer + test are plain node
  scripts over committed JSON); the --cacheDirectory rule is
  vacuous here, recorded as such in the prereg rather than
  claimed.

## RANKED NEXT (with numbers — no lever built here)

1. BLOCKED-RESTORE DESIGN QUESTION (steve-call if pursued):
   a lost lingerer melts whenever ANY fellow besieger still
   stands on the treeline tile — 13/24 losses (54%), all 13
   blockers raidBorn fellow besiegers at (4,4). Should the
   restore displace/queue when the tile is held, or is
   melt-while-the-siege-continues intended? This refines
   draftflag ranked-next #3 (which framed it as a 1-HP
   question): the question is broader than 1-HP — healthy
   besiegers are 9 of the 13 blocks.
2. FLED-WITH-ORIGIN COVERAGE: 0 fled tbend events on this
   band — the fled half of lingererKeeps is unobserved. A
   band or scenario where the scholar flees a lingerer fight
   would exercise it (and would also test whether a fled
   restore blocks the same way).
3. TIME-ORDERED FLOOR CORROBORATION (analyzer fix, no game
   change): floorDraftRow must require draft day < tbend day;
   the anaconda d61/d64 row is the counterexample. One-line
   fix, re-provable on this corpus.
4. DISSOLVE-PATH RECORDER: 120 dissolved meetings, all on
   three seeds (75102: 32, 75104: 45, 75105: 43), zero on the
   other thirteen. What dissolves fights on those seeds — and
   whether dissolved lingerers should have a restore fate at
   all — is unmeasured; the dissolved population is currently
   UNMEASURED by construction.
5. SIEGE-DRAIN DYNAMICS (follow-up census): the s75110 triple
   shows a siege draining one beast per scholar loss. A
   census of siege lifetimes — how often a multi-beast siege
   drains fully through scholar losses vs outlasting the
   scholar — would say whether the 54% melt rate helps or
   hurts the village over a whole siege.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it). What converged further is the restore
plumbing: a scholar loss against a lifted besieger now has a
measured fate (restore 11/24, melt-on-occupancy 13/24, zero
unexplained), the 1-HP blocker is placed as a 4-of-13 minority
pattern with all four rows floor-corroborated in time order,
and the melt's real shape is named — a crowded treeline, not
a crippled gatekeeper.
