# sim-scale-onramp-round-0320 — COORDINATOR RUN EVIDENCE (fleshout-20261028T0320Z, axis scale-onramp)

**Run:** fleshout-20261028T0320Z · **Axis:** scale-onramp (standing directive — still
stands: see convergence note) · **Type:** coordinator run — 2 DIAG arms, both
landed locally, pending ship (no push, no version bump).
**Commits (post-rebase):** arm 1 (tbhp) `2b330ec24` (prereg) + `e61f3428f`
(instruments) + `81ddd7776` (evidence + corpus); arm 2 (damage) `e0dc3ad82`
(prereg) + `d5622152f` (instruments) + `d84fefe29` (evidence) + `c45953e08`
(corpus). Sibling journey-establishment commit `f29bfa3f3` landed on top of
both arms after their merges (zero overlap, no action). Zero `src/js` changes
in either arm — DIAG measurement only, no game change lands from this round.
**Sibling lanes NOT touched:** B loop food-economy (live claim 0231Z at run
start, new claim 0330Z + tree sim-onceaday-b observed during closeout),
tackle-armor, journey*, gap-*, panel-contract-rulings trees.

## Why this round: two tracker blanks, and one blank deliberately NOT re-run

The 0221Z tracker review left three blanks in order: (1) whether waiting
matters on bands where the seat stays unready longer, (2) the unrecorded
inter-fight damage source, (3) the TB-start-HP causal gap for wound2. Blank
(1) was NOT re-run: sim-waitlong-a (run fleshout-20261027T1215Z,
evidence/2026-10-27/sim-waitlong-a.md, backlog line 1212) already closed the
wait leg on TWO bands — 1955Z (short latency, delta 0) and a qualified
longer-latency band (74001–74008, seat-only latency 9 days on 74004, delta
still 0) — with the mechanism proven (zero Haven blocks in 24 configs; the
wait leg only fixes not-at-Haven, which never fired). Its convergence note
says explicitly to stop spending arms on the wait leg. The 0221Z
carry-forward of the waiting blank is stale against that closure; this round
records the correction here and in the tracker update rather than burning a
third band on a closed question. This round takes blanks (2) and (3).

## PRE-REGISTRATION (binding, coordinator-level; each worker also committed its own prereg before any judged sweep)

- Substrate (both arms, VERBATIM): tableseat-nowait (`LEANLINKRESCUE=1`,
  `TABLESEATNOWAIT=1`), 180 loop-days, death-aware.
- Seeds (pilot): 75101–75108 — the declared parity-baseline band.
- Parity rule: judged ONLY against `evidence/2026-10-27/perseed-w4channel-rebaseline/`
  (the declared census parity baseline). The retired w4channel-a corpus was
  never used for parity, and neither the lethality verdict nor the rebaseline
  verdict was re-scored.
- Arm 1 (sim-w4tbhp-a) GO legs: (a) both-base corpora complete, (b) detgate
  passes on BOTH bases, (c) comparison table published + causal verdict
  stated. INCONCLUSIVE-blocked (not NO-GO) if the pre-wound2 code cannot run
  the recorders.
- Arm 2 (sim-w4damage-a) GO legs: source named with a trace for at least 4
  of 5 re-derived drops + a named next step. NON-REPRODUCED (not NO-GO) if
  the drops do not re-derive on current base. NO-GO if drops re-derive but the
  source stays unnamed, traces published.
- Cost bar: NOT APPLICABLE — DIAG arms, no game change, no player-facing
  effect to cost. Stated in both preregs, not waived mid-run.
- Balanced panel (§15): attempted by both arms; see metric review.

## Arm results (both judged on their pre-registered bars, no re-scoring)

### Arm 1 — sim-w4tbhp-a: GO (wound2 does NOT cause below-max player TB starts)

Commits `2b330ec24` / `e61f3428f` / `81ddd7776`. Evidence
`evidence/2026-10-28/sim-w4tbhp-a.md`, corpus
`evidence/2026-10-28/perseed-w4tbhp-a/` (8 post + 8 pre rows + summary +
analysis + sense). Pre-wound2 side run from the parent commit `20010c093`
(wound2 `ac9f1987b` verified ancestor) via a plain extracted scratch tree
(never a git worktree, never registered, deleted after the corpus was
committed).
- POST (base `3264dbb80`): 28 TB fights, player below-max 10/28 (35.7%),
  lowest 9/100 — reproducing the rebase band's 10 rows exactly.
- PRE (parent `20010c093`): 35 TB fights, player below-max 10/35 (28.6%),
  lowest 46/100.
- 7 below-max rows are fight-identical on both sides (same seed, day,
  monster, HP number); 25 of 28 post fights are fight-identical overall.
  The scholar walked in wounded before wound2 existed, because TB entry
  already read village.health — exactly what wound2's own diff comment says.
- Monster control: full HP at start in 32/35 pre, 26/28 post. The 2 post
  exceptions (audit 94.1%, 97.7%) are the same fights pre and post, and
  their deficits do not track the world wound — a pre-existing
  fighter-construction footnote to the "monster always walks in fresh"
  claim, filed as a new backlog item, not a wound2 effect.
- Parity post-vs-rebaseline: EXACT (all 8 seeds, headlines + TB fight counts
  by channel). Detgates pass on both bases (post 132/132, tsNationalDay 77
  both; pre 166/166, tsNationalDay 77 both — cross-base day difference
  disclosed as the prereg-authorized amendment; each detgate judged
  internally).
- The comparison is near-single-mechanism: substrate, recorders, and harness
  byte-identical parent→HEAD; the only game-code drift is `fieldFights.js`
  (wound2) + `abilityActions.js` (refusalprecheck, verified no HP/fighter
  touch). Trajectory divergence is confined to 2 seeds (75101 runs 34d
  shorter post, 75108 15d longer post) — wound2's field-ally effect, not a
  TB-start effect.
- Coordinator post-rebase proof: analyzer re-run on the rebased checkout,
  exit 0, parity EXACT, worktree clean (see Infrastructure notes for why no
  full re-sweep was needed).

### Arm 2 — sim-w4damage-a: GO (5 of 5 drops traced)

Commits `e0dc3ad82` / `d5622152f` / `d84fefe29` / `c45953e08`. Evidence
`evidence/2026-10-28/sim-w4damage-a.md`, corpus
`evidence/2026-10-28/perseed-w4damage-a/` (8 rows + summary + analysis).
- Detgate PASS on the old numbers exactly (75101: 132/132 days,
  tsNationalDay 77) — no amendment needed. Parity EXACT vs the rebaseline
  corpus only. Substrate gate PASS (courtship 121, 8/8 active). Recorder
  errors 0 on all 8 recorders. Bypass census empty (0 wave-4 world fights
  outside the old fight record) — the patrol/aid/sortie suspect is dead on
  this band.
- Drop table (all re-derived on current base, all traced, same seq, inside
  the interval): 75106/47 algorithm d96 991 → d97 741 (−250): raid toll
  d96, wall 250, exact. 75106/55 eulogy d127 900 → d129 740 (−160): raid
  toll d127 −225 + TB lingerer restore d129 +65 (fighter end 740). 75106/57
  eulogy d140 900 → d144 675 (−225): raid toll d141, wall 225, exact.
  75108/28 reunion d95 1154 → d100 854 (−300): raid toll d98, wall 300,
  exact. 75108/29 reunion d89 1170 → d98 870 (−300): raid toll d98, wall
  300 (the raidTick post-read 851 adds the defender fight 870→851, which is
  the next row's own damage, not gap damage).
- Plain-words answer: there was no secret damage source — there was a wall,
  and a homecoming. Four drops are the palisade taking its quarter-health
  toll when raiders come over the wall. The old census never saw it because
  it only read fight rows, and a wall is not a fight. The fifth drop only
  looked like a drop: a losing lingerer goes back to the treeline at the
  fight's ending health, not the wall's — so a toll-wounded lingerer can
  come home healed. The same-day 65-HP wobble is the same story told twice
  (TB start read pre-fight 675, later field fights read post-restore 740).
- Disclosure (analyzer fix, not a re-score): the analyzer's first run judged
  NO-GO (3/5 traced, 2 partial) due to two instrument bugs — unsplit
  raidTick windows (havenRaidTick drives defender fights inside the tick, so
  −319 conflated toll −300 + fight −19) and a missing TB-restore join. The
  worker fixed the instrument, re-proved on the unchanged corpus with no
  re-sweep, and the re-run judges GO 5/5. The GO rule, prereg, and corpus
  were not changed, and the original NO-GO run is disclosed in the arm
  evidence. Coordinator post-rebase proof re-ran the fixed analyzer: exit 0,
  `VERDICT: GO (judged 5/5)`, parity EXACT, worktree clean.
- Named next step (for a fix arm, not landed here): "wall wounds,
  finished" — either make lingerer TB restore take min(pre-fight world HP,
  fighter end HP) so a lost fight never heals a toll wound, or keep the
  restore and add visibility (name toll-wounded lingerers so a finishing
  trip is a real choice). Filed as a new backlog item; measured on identical
  seeds before landing.

## Wall numbers (this band only, never pooled — both arms agree exactly)

| | this band (75101–75108, tableseat-nowait) |
|---|---|
| national ever / final | 7/8 / 5/8 |
| table invited / entered | 6/8 / 3/8 |
| wins | 3/8 (3 lesser / 0 full, all Feared-path first-option) |
| wave-4 unlock | 5/8 |
| wave-5 unlock | 0/8 |
| median survival | 162d upper / 154d conventional (days 90, 114, 132, 146, 162, 177, 180, 180) |
| deaths | 299 (starvation 2, both 75108) |

## Reachability verdict

- The lesser seat and the win flag remain REACHABLE on this substrate (3/8
  entered, 3/8 won) — unchanged from the 0144Z/0221Z bands, as expected for a
  DIAG round on the same substrate.
- The full seat is still 0/8 and wave 5 still 0/8. Nothing in this round moves
  the wall past national; it explains two of the wall's measurement gaps
  (where inter-fight damage comes from, and what wound2 does and does not
  cause) without changing the wall's shape.
- The herald-175 item stays unclosed in its original form (zero herald
  fights on this band, heralds at full 700 HP at end) — the gap CLASS is now
  explained (toll + restore), but no herald was ever fought, so no herald
  instance is traced. Do not cite this round as closing the herald item.

## Village assessment (plain words)

These villages are the same strong courtship villages as the last two rounds:
they climb to national, three sit down at the lesser seat and win, the rest
grind on. What this round adds is the fine print under two mysteries. First,
the wall itself wounds: when raiders come over the palisade, the stakes take
a quarter of the attacker's health, and the village never names which
monster it wounded — the wound is real but anonymous, so nobody ever walks
out to finish it. Second, a wounded scholar walks into a turn-based fight
wounded, and that was already true before the wound-carryover change — the
change everyone suspected is innocent of this particular wound. And the
homecoming has a catch: a monster that loses a fight but lingers goes home
at the fight's ending health, which can be HIGHER than the health it walked
in with after the wall wounded it. The village knows the wall takes a toll
— the raid beat says so — but it does not know the toll wounded a named
monster, and it has no behavior for finishing one. That missing finishing
trip is now a specified fix proposal, not a vague blank.

## Sense-testing notes (from the arms, non-measured replays)

- TBHP arm: 75104 replay confirms the wave-4 absence in words (0 Mirror
  Draft mentions); 75103 supplement shows the Mirror Draft thread; no beat
  narrates a wounded scholar entering a fight.
- Damage arm: 75104 threadless (0 wave-4 arrivals, won lesser d90) →
  supplemented by 75106. The raid beat DOES name the toll in words ("The
  palisade's stakes take their toll as they come over the wall") but never
  per-monster, and no beat names a restore or routes a finishing trip — the
  village knows the wall takes a toll, not that it wounds a named monster.

## Metric review (binding section)

- Pre-registered metrics held: no re-scoring. The damage arm's analyzer fix
  changed the instrument, not the metric, the prereg, or the corpus — the
  original NO-GO run is disclosed in the arm evidence, and the GO re-run was
  judged on the unchanged corpus. The tbhp arm's cross-base day difference
  (pre detgate 166 vs post 132) was handled by the prereg-authorized
  internal-detgate amendment, not by moving a threshold.
- "Table invited ever" is NON-DISCRIMINATING (both arms: 6/8 invited on a
  substrate where entered is the discriminating measure) — reaffirmed, not
  re-litigated.
- Wall numbers above are band-only, never pooled with the 0144Z/0221Z bands
  — same seeds and substrate, but this round's corpora are independent
  measurements, and pooling would double-count the same villages.
- Balanced panel (§15): ATTEMPTED by both arms, NOT INGESTED — same failure
  class as every seat/census arm before it: `balance-panel.js compare`
  ingests panel-driver output (panel.json.gz), not per-seed sweep corpora,
  and there is no corpus-ingest mode. No panel artifact was faked; the
  paired analyzer tables above (identical seeds, parity EXACT, detgate PASS)
  are this run's before/after comparison.

## Telemetry deviation check

Commands (on merged master): `node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-28/perseed-w4damage-a/*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national 12→0, table −62%
16→6, wins 16→0, n=10); same command on `perseed-w4tbhp-a/*.json` → 2 LOUD
lines (national 12→0, wins 16→0, n=18). VERDICT: all are the known artifact
class — (a) the baseline's WINSEAT regime forbids comparison to a
tableseat-nowait census substrate, (b) per-seed rows carry
nationalEver/entered/won, not top-level national/table/wins paths, so the
check reads 0 by construction, while the arms' own aggregates measure
national ever 7/8, entered 3/8, wins 3/8. Baseline NOT rolled. No exiled LOUD
line on either corpus.

## Infrastructure notes

- Pre-flight: main tree showed a 1-line `docs/ONTOLOGY.md` modification at
  run start (a sibling's live edit: the you_become_that_villager languages +
  stashed alignment, later landed as journey-endgame r58 `f147eb2e6`). Per
  the standing sibling-edit precedent it was left alone, never reset; a
  re-check 2 minutes later showed the tree clean, and the run proceeded on a
  clean pre-flight. Disk 17% — fine. Reap left all sibling trees alone.
- Registry-lock contention queued worktree registration (~85s) and
  heartbeats; waited out, nothing killed. No EPERM flap blocked coordinator
  writes, but BOTH workers hit it (tbhp: a silently 0-byte scratch archive
  extraction, caught only because the pre detgate failed — existence is not
  content, verify sizes after archive extraction; damage: a truncated sweep
  copy rebuilt through the file tools and diff-verified). Safe-commit index
  clobber hit all worker commits (bogus staged deletions, commits correct)
  — repaired via HEAD-blob cacheinfo each time, verified by hash.
- Master moved twice under the run before the merges (5 journey-endgame
  commits r58/r59, then journey-establishment r50 after both merges). The
  pre-merge delta (worker base `3264dbb80` → `c3e2ce7d0`) contains ZERO
  `src/`, `src/data`, or `scripts/policies/` changes (docs + evidence
  only) — so the game, policies, and instruments are byte-identical and a
  full re-sweep post-rebase could not differ except via nondeterminism. The
  post-rebase proofs are therefore analyzer re-runs on the rebased checkout
  (tbhp: exit 0, parity EXACT; damage: exit 0, `VERDICT: GO (judged 5/5)`),
  plus clean rebases (3/3, 4/4, zero conflicts) and clean worktrees — stated
  here so a later reader does not mistake this for a skipped proof. A
  full re-sweep remains available if a future rebase ever carries game code.
- Coordinator proof re-runs used `--out` to /tmp, so no analysis.json
  timestamp churn was committed. No jest (zero `src/js`; arm analyzers are
  the attributable verification per census precedent). Main tree clean at
  closeout (`f29bfa3f3`). Merged locally, pending ship. No push, no bump,
  no live verification (ship-loop line).
- Sibling observation (not touched): loop-B's 0231Z tree vanished mid-run
  while its claim file remained, and a new B claim (0330Z) + tree
  (sim-onceaday-b) appeared during closeout — consistent with a B closeout
  + new run, not a coordinator concern. The 0231Z claim file was left alone.

## Convergence note

scale-onramp stays CONVERGING, not converged. Two tracker blanks are now
answered on measured evidence (inter-fight damage = palisade raid toll +
TB lingerer restore; wound2 does NOT cause below-max player TB starts), but
no lethality fix has landed, the full seat is still 0, and wave 5 still
unlocks nowhere. The directive stands until the tracker records this axis
converged on measured evidence. Next blanks, in order: (1) the
wall-wounds-finished fix arm (new backlog item — min-restore vs visibility,
measured on identical seeds before landing); (2) path diversity (#917) or
the full seat (#920) per the waitlong-a recommendation; (3) the monster
fighter-construction footnote audit (2 sub-max starts, same fights pre/post).
food-economy stays converging (untouched; sibling B loop live). Rotation
left at 3 (axis work, not lever rotation — no rotation advance claimed).
Claim deleted; lock deleted.

## Findings

Backlog: the two 2026-10-27 [open] lines that motivated this round (inter-fight
damage, TB-start-HP causal gap) are annotated fixed-answered in
`hidden_files/sim-findings.md` (measurement answers, not code fixes). Two new
[open] items appended: wall-wounds-finished fix proposal, monster
fighter-construction footnote.
