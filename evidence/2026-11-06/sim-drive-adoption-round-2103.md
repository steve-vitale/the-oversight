# sim-drive-adoption-round-2103 — Loop A adoption run (self-improvement drive + scale-onramp)

- Run: `fleshout-20261106T2103Z`, Loop A, axis self-improvement drive
  (Steve 2026-11-06 10:22 CST) + scale-onramp / winnability chain
- Coordinator adoption of the dead 1916Z run's stranded arms; no new
  trees, no new seed bands, no gate/price/deed/readyDemand change
- Master at run start: `c7bf1e308`; master at closeout: `2df1052b5`
- Loop B LIVE on its 1730Z claim the whole run (sim-survivaltime-b +
  sim-ragerepress-b + sim-midnightkill-b) — NOT touched

## Stale-lock recovery

Lock `fleshout-20261106T1916Z` (created 19:16:28Z) was 107 minutes old
at run start (21:03Z), past the 90-minute fallback; its two registered
trees' heartbeats were 19:37/19:39Z (~24 min stale, past the 15-minute
guard) and no live processes ran in its trees — dead per the guard.
Lock deleted, claim retired to `.DEAD` with a disposition note. Of the
1916Z run's three adopted arms, entrycensus-a had already landed
(`328c59f91` on master); drive-practice-a and wanderspawn-a were
stranded with commits and were adopted by this run.

## Arm 1 — sim-drive-practice-a: LANDED, pilot GO stands

- Commit `2b9b0371e` "practice moves competence (pilot GO, 14/16 moved,
  baseline 0) [needs-eyes]" — merged `--ff-only` onto `f4dafd387`.
- Lever, in plain words: villagers now get better at work by doing it.
  Before, how good a villager was at a job was fixed at birth by their
  old occupation. Now every finished day's work counts as practice, and
  after enough practice (8 days for the first step, then 12, then 16)
  they step up one rung — 0.7 to 1.0 to 1.2 to 1.3 to 1.4, never above
  what a natural would reach. When someone steps up, the game says so
  in plain words ("getting the hang of stonework"). No new system, no
  ability grants, no gate or price touched; scope is the
  competence/practice regions of `src/js/game.js` only.
- Prereg bar (band 99451–99458, 8 seeds pilot, 80d death-aware,
  competent policy verbatim): armed ≥50% of practicing villagers move
  ≥1 competence cell, baseline 0. Met: armed 14/16 moved (87.5%),
  baseline 0 cells, 0 decreases anywhere, 312 practice reps.
- Closeout work this run: rebased twice as master moved (onto
  `c7bf1e308`, then `f4dafd387` stayrecover), proof
  `scripts/test-drive-practice-a.js` ALL GREEN on the final rebased tip
  and again on merged master (UNIT1/UNIT2/UNIT3/INTEGRATION, incl. the
  in-game practice line). `check.js --quick` on the rebased tip: 283
  passed, 7 failed — the standing pre-existing profile (same 7 files),
  none implicating this arm.
- Arm evidence: `evidence/2026-11-06/sim-drive-practice-a.md` +
  prereg `sim-drive-practice-a-prereg.md` + per-seed JSON corpora
  (contaminated first baseline preserved under
  `drive-practice-contaminated-baseline/`).

## Arm 2 — sim-wanderspawn-a: LANDED, GO stands

- Commits `610876144` (prereg) / `18359d824` (fix) / `2df1052b5`
  (finished evidence) — merged `--ff-only` onto `ba6d89846`.
- Lever, in plain words: the world quietly lied — the most dangerous
  beasts could be born as weak as a sick deer (20 HP), wander for
  months, and fold to a single swing, and the record books counted it
  as a triumph. Bare-`{id}` spawns now resolve their real defined HP
  in `spawnWorldMonster` (wanderer, trap, all three finale nodes,
  debug button); the veteran flag is honored.
- Prereg bar (band 53001–53008 reused committed corpus, 150d
  death-aware): zero wave-4+ spawns at 20 HP in the reproduction probe
  plus the d149 1-round-kill shape gone on the fixed leg; guard: no new
  death mode. Both met: proof `scripts/test-wanderspawn-20261106.js`
  21/21 green (RED pre-fix, 12 failures); after leg holds zero 1-round
  solo wave-4+ wins; final-base sim leg 150d survived, 11 wave-4 kills.
- Closeout work this run: coordinator repaired the worktree's index
  clobber on the evidence file (worktree hash verified byte-identical
  to the HEAD blob; `git status` empty after repair). Worker rebased
  three times as master moved (`c7bf1e308` → `f4dafd387` → `2f67b721c`
  → `ba6d89846` survivaltime armor retune), proof 21/21 green on every
  base including the final one and again on merged master.
  `check.js --quick`: 283 passed, 7 failed in 897s on the `2f67b721c`
  base (one behind final; the `ba6d89846` delta touches
  `src/js/game.js`/`fieldFights.js`, so that run is a stated caveat,
  not a claim about the final base — the arm's own proof gate is green
  on the exact tip). Coordinator re-ran `check.js --quick` on merged
  master `2df1052b5`: **283 passed, 7 failed in 662s** — the same 7
  pre-existing files, none implicating either arm.
- The fix removes a spurious kill, so wall numbers dip by design:
  wave-4 kills 3 → 1 (the d149 Congregation was never a real kill; the
  d89 Strike never happens on the shifted trajectory), wave-4 reach
  6/8 → 5/8, median survival 87d → 91d (rose). No metric re-scored.
- Arm evidence: `evidence/2026-11-06/sim-wanderspawn-a.md` + per-seed
  corpora `perseed-wanderspawn-a-before/` and
  `perseed-wanderspawn-a-after/`.

## Arm 3 — sim-entrycensus-a: ALREADY LANDED, verify only

- Commit `328c59f91` on master before this run started; evidence +
  prereg + JSON on master; branch and worktree already gone.
- Verdict GO: census complete across every listed corpus; 7 artifact
  traces and 3 artifact kills (one more kill than the frozen-tool first
  pass) classified or explicitly marked unclassifiable-with-reason. Two
  past verdicts counted the artifact kills (stageally confirm's only
  post-first-blood kill; tbretreat pilot's only baseline kill plus one
  of its three armed kills) — neither verdict flips (the confirm was
  already NO-GO; the pilot's GO rests on its retreat gates), but the
  kill evidence underneath both is thinner than the ledgers say, and
  the pilot's only surviving village ends with zero living wave-4
  killers.
- Arm evidence: `evidence/2026-11-06/sim-entrycensus-a.md` (+
  `sim-entrycensus-a-prereg.md`, `sim-entrycensus-a.json`).

## Wall numbers (this run's judged corpora)

| | drive-practice baseline (99451–99458) | drive-practice armed | wanderspawn before (53001–53008) | wanderspawn after |
|---|---|---|---|---|
| National | 0/8 | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 | 0/8 | 0/8 |
| Wave 4–5 unlocks | — | — | wave 4 on 6/8, wave 5 on 0/8 | wave 4 on 5/8, wave 5 on 0/8 |
| Median survival | — | — | 87d | 91d |
| Wave-4 kills | — | — | 3 (1 spurious) | 1 (genuine) |

The wall did not move: no village reaches national, the table, or a
win on either band before or after. The drive-practice pilot measures
the haven-labor half of the drive (competent policy barely assigns
hunt/patrol/scout/teach/tend, so the combat half is unmeasured — see
metric review). The wanderspawn fix removes a spurious kill; it was
never a scale fix. Full-seat reach stays 0; wave-5 kills stay 0; no
village banks two living wave-4 killers and sits. The standing
directive stands.

## Village assessment (plain words)

Two different kinds of honesty landed. First, villagers can finally
get better at the work they actually do — a librarian who spends
winters cutting stone stops being bad at it forever, and the game says
so out loud when they improve. That is the first rung of Steve's
self-improvement drive made real: competence now has an input from
lived experience, not just the job a villager had before all this
started. Second, the record books stopped lying: the beasts that used
to be born crippled now arrive at their real strength, so a wave-4
kill in the ledger means a village actually beat a wave-4 beast. One
village's whole claim to wave-4 strength rested on that lie. Neither
change opens the on-ramp — villages still stall below national and no
one sits — but both change what the numbers underneath the wall mean,
and the wall is now measured on honest kills and on villagers who can
grow.

## Metric review

- Pre-registered metrics bound both arms; no metric was swapped,
  re-cut, or re-thresholded mid-run. Both primaries were met as
  registered (drive-practice 14/16 ≥ 50% bar, baseline 0;
  wanderspawn zero 20-HP spawns + zero 1-round solo wave-4 wins after).
- Drive-practice metric limitation, carried forward: the pilot counts
  haven-labor practice only (garden/fish/wood/stone/deadfall/water).
  Steve's 2026-11-06 11:48 CST ruling — reward ALL paths, not just
  killing; judge role formation across all five tracks (combat, field,
  social, craft, strange) — means the next drive measurement must not
  read this pilot as role formation. A forager, crafter, talker, or
  explorer must progress toward their role just as a fighter does;
  this pilot proves the mechanism moves competence, not that roles
  form. The 2026-11-05 role census (competence 0 cells, skill 0→
  positive for 0 villagers) is the baseline to beat on every track.
- Wanderspawn metric note: the pre-registered wall-number dip (kills
  3 → 1) is correctness, reported as designed in the prereg — a fix
  that removes a fake kill is not a failed lever.
- Entrycensus metric note: the census bar was completeness of
  classification, not a count of artifacts found; the count (7 traces,
  3 kills) is a finding, not a threshold.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: inapplicable to both arms (takes
  panel.json.gz pairs, not per-seed recorder corpora; no panel files
  were produced for either leg). Before/after comparison is the
  identical-seed corpus tables above, per the arms' evidence.
- `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-06/perseed-wanderspawn-a-after/*.json' --metrics
  national,table,wins,exiled`: REFUSED on merged master (same refusal
  the arm recorded: recorder-corpus input — "all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not runs").
  No LOUD lines, no deviation to investigate (after-leg wall numbers
  unchanged from the before leg), baseline NOT rolled.

## Infrastructure

- Master moved four times under the run (stayrecover `f4dafd387`,
  drive-practice landing, journey-landing, survivaltime armor retune
  `ba6d89846`); both branches rebased clean onto explicit master SHAs,
  proofs green on every base and on merged master. No EPERM flap
  blocked this run; one runtime restart mid-run wiped `/tmp` and
  killed a wanderspawn check run (re-run with output to
  `~/workspace/wanderspawn-check-final.log`, kept as evidence).
- Safe-commit index clobber hit the wanderspawn worktree's index
  (evidence file only) — repaired by the coordinator via HEAD-blob
  cacheinfo, worktree hash verified byte-identical first; commit
  verified correct after repair. Main tree clean at closeout.
- `check.js --quick` on merged master `2df1052b5`: 283 passed, 7
  failed in 662s. The 7 are the standing pre-existing set
  (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  capable-bot, establishment-r20-fixes). Two of them have fresh
  follow-up notes this run: the capable-bot food-deed failure was
  proven pre-existing on pure master and filed as sim-findings #1830
  (needs an owner, likely stayrecover); the measurement neutrality
  proof staleness is already open as #1353 (refresh via
  `scripts/balance-proof-update.js` is owed after Game-input changes).
- Loop B's 1730Z run was live throughout (its survivaltime arm landed
  `ba6d89846` mid-run); nothing of Loop B's was touched.

## Findings appended

- #1830 (new, open): capable-bot food-deed assertion fails on master
  (proven pre-existing on pure master `2f67b721c`, likely stayrecover).

## Next blanks (for the loop, not this run)

1. **Role formation across all five tracks** (Steve 2026-11-06 11:48
   CST ruling): the practice mechanism is proven on haven labor; the
   next drive measurement judges whether roles actually form —
   forager, crafter, talker, explorer as well as fighter — against the
   2026-11-05 census baseline. The 64-seed drive-build run is owed
   before anyone leans on the drive either way (16-seed signal: pairs
   of living wave-4 killers on 2 seeds where the old code formed none,
   kills 5 → 9, but villages shorter and fewer alive — price or noise
   undecided).
2. **Finale campaign at full HP:** a sim that actually reaches a
   finale campaign node now faces a 700/900/1800-HP node instead of a
   20-HP one; no sim on this band reaches a finale, so the
   campaign-node fight at full HP is proven in the harness, not in a
   live campaign.
3. **20-HP census follow-through:** entrycensus-a sized the artifact
   kills in the listed corpora; the congtrace next blank (2) is
   closed for those corpora. Any new corpus should be census-checked
   the same way before its wave-4 kills are cited.
4. **Capable-bot food-deed failure (#1830)** wants an owner
   (likely stayrecover); **measurement neutrality proof refresh**
   (#1353) is owed after Game-input changes.

scale-onramp stays converging (NOT converged): national is reached
reliably only by default-OFF policy instruments elsewhere, wins here
are 0 everywhere, the full seat is still unreached, wave 5 still 0.
food-economy stays converging (untouched; sibling B loop).
Claim deleted; lock deleted.
