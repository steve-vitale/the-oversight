# sim-scale-onramp-round-0205 — coordinator evidence (axis scale-onramp — 2 arms LANDED, merged locally pending ship)

Run: fleshout-20261025T0205Z (Sat 2026-10-24 21:05 CDT). Axis: scale-onramp
(converging). Loop B live on food-economy at run start (claim
fleshout-loop-b-20261025T0030Z, arms sim-fullpantry-casecount-b +
sim-awayration-cover-b, heartbeats fresh) — NOT touched. This run
worked the topmost non-converged axis not named in any live claim:
scale-onramp. No sibling claim, tree, or file was touched at any
point; sibling landings below are master-tip moves only.

## PRE-REGISTRATION (coordinator level, binding)

- Substrate (both arms, shared): tableseat-nowait — leanlinkrescue
  courtship (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1),
  no wait leg. Seeds 73671–73678, 180d death-aware — the SAME band
  as standing99 / vetkill / vetshape / encounter-a / arenadeath,
  reuse intentional: these are re-measurements of those seeds with
  new recorders, not fresh bands.
- Both arms are DIAG ONLY: new default-OFF policy recorders, zero
  src/js, no default flips, no readyDemand moves. A DIAG-GO is a
  measurement verdict, not a game change.
- Primary metric per arm: its own pre-registered DIAG-GO gates
  (G1 det-gate, G2 neutrality, G3 corpus integrity, G4 hypothesis
  decision), judged in each arm's evidence file. A miss would have
  been NO-GO, never re-scored.
- Deciding cost bar (scalemetric, carried over): starvation ≤
  control+2 on totals AND arm-only deaths AND median ≥ 0.8× control
  median — reported diagnostically for pure-read recorders (both
  recorders are neutral by construction, so the bar is trivially
  met and is not the verdict).
- Balanced panel (§15): attempted by both arms; both threw the known
  error (`TypeError: Cannot read properties of undefined (reading
  'days')` in `scripts/lib/balance-scorecard.js` `comparePanels`) —
  the panel requires panel-driver output, not per-seed sweep rows.
  Sweep-compare tables are the comparison for this run, on identical
  seeds, judged against the pre-registered bars. Panel-contract lane
  not touched.

## Arm 1 — sim-wave2enc-a (dba34a1c8 after rebase; originally 0f42f7c51)

Wave-2 encounter/kill-opportunity diag on the 73674 stall.
Recorder: scripts/policies/wave2enc-diag.js (WAVE2ENC=1),
sweep scripts/test-wave2enc-diag-sweep.js, proof
scripts/test-wave2enc-diag.js (16/16, re-run green post-rebase
and on merged master). Corpus:
evidence/2026-10-24/perseed-wave2enc-a/ (16/16 rows + summary.json).
Evidence: evidence/2026-10-24/sim-wave2enc-a.md.
DIAG-GO: G1 PASS, G2 PASS (8/8 identical days/gameDays/ts/
starvation, death breakdown identical 261 = 261), G3 PASS
(event rows persisted, not counts alone), G4 PASS (all 8 seeds
classified, focus seed 73674 classified).

- 73674 is KILLED-BELOW-BAR, not NEVER-SPAWNED and not
  FOUGHT-LOST: 10 wave-2 spawns, 59 field fights + 1 tb fight,
  6 faced types, exactly 1 kill (day 92, elena_petrova vs heckler),
  end ledger 1/4, gate never opened. Spawns exist, fights exist,
  villagers do not die (vDie 0) — the stall is kill conversion.
- The mechanism, in the rows: field outcomes vKill 1, vDie 0,
  vFlee 2, mFlee 49, evade 7. 30 of the 49 mFlee rows end with the
  monster at exactly 1 HP, 43 of 49 at ≤ 7 HP. Band-wide: 139 of
  260 mFlee rows at exactly 1 HP, 225 of 260 at ≤ 7 HP. The
  monster is beaten to a sliver and then leaves instead of dying.
- Player tb fights convert (26 won-kill of 31 band-wide);
  villager field fights leak (27 vKill of 358). Counter kills pay
  when they happen and the per-type cap eats repeats (73678: 5
  understudy kills → 2 points) — but with 1 kill, breadth and cap
  are both untested on 73674, because the second kill never happens.
- Sense read (73674, days 178–181): the game does NOT tell the
  village how to meet a wave-2 monster in this window — it does
  not even name one. The village reads alive (Raj's unannounced
  branches, Aisha weeping over a gift, riders bringing word the
  village is called the Feared) — the blank is not lifelessness,
  it is that nothing treats the missing wave-2 kills as a problem
  anyone owns.

## Arm 2 — sim-fieldfinish-a (723d48f5f after two rebases; originally f0d2f5a93)

Wounded-repeat / field-finish diag on wave-3+ field fights.
Recorder: scripts/policies/fieldfinish-diag.js (FIELDFINISH=1),
sweep scripts/test-fieldfinish-diag-sweep.js (+ resume driver
scripts/test-fieldfinish-resume.js), det-gate re-run green
post-rebase and on merged master (the arm has no standalone
proof file; --detgate is its G1 proof). Corpus:
evidence/2026-10-24/perseed-fieldfinish-a/ (16/16 rows +
summary.json, 1,362 field fights band-wide). Evidence:
evidence/2026-10-24/sim-fieldfinish-a.md.
DIAG-GO: G1 PASS, G2 PASS (8/8 identical, kill-log exact-tuple
agreement 8/8), G3 PASS (persisted fight rows), G4 HYPOTHESIS IN
against the pre-registered bar (focus 3/3, band 14 vs bar 5).

- The mechanism, in plain words: villagers DO wound wave-3
  monsters down over successive fights — the wound arc works.
  What breaks is the last step. A wave-2+ monster flees the
  moment its wounds drop below 15% of full health (the break
  line in fieldFights.js), and wounds persist onto the world
  entity, so the next villager who meets it finds it already
  below the line and the fight ends before a single blow:
  round 0, outcome mFlee, 0 damage, health unchanged. The same
  entity repeats that zero-round flight at every meeting,
  forever. It is not unkillable in principle — it is unkillable
  in practice, because the only one who can still reach it is
  the player (all 11 wave-3+ kills are player/companion tb kills).
- Focus reproductions (detail census-matched): 73675 chorus_line
  300→257→199→43, then ten meetings d93–d156 all mFlee round 0
  at 1/300; 73677 chorus_line 300→75→43, then 43→43 round 0
  twice (43/300 = 0.143 < 0.15, break line 45 HP, volley damage
  exactly 0 — no bow involved, so the break check is
  unconditional, not volley-driven); 73678 spool
  280→236→178→167→28, then 1→1 round 0 twice.
- Band context (wave-3+ field fights, n = 87): vFlee 42,
  mFlee 36, vDie 6, evade 3, vKill 0. mFlee split: rounds 0 → 19,
  rounds ≥1 → 17. Volley drive-offs = 0 band-wide, so no
  volley row inflates the count. Health at mFlee: min 1,
  p25 1, median 33, p75 75, max 255.
- The stuck state is band-wide, not wave-3-only: 452 field
  fights across all waves start at exactly 1 HP. The next blank
  is the ORIGIN of those 1-HP arrivals, not another proof of the
  stuck state: 73675 chorus_line jumps 43 (d91) → 1 (d93) and
  73678 spool 28 (d73) → 1 (d82) with no recorded field fight
  and no tb fight in between. Candidates, not claims: the tb
  door-flee stash floor, a trap/wanderer respawn path, or a
  second entity of the type wounded elsewhere.

## Cross-arm verdict — one mechanism, two rungs

Two independent recorders, built by separate workers on the same
band, converge on the same engine behavior: field fights do not
finish wounded monsters. At wave 2 it starves the wave-3 gate
(73674: 1 ledger point, gate never opened, despite 60 fights).
At wave 3 it starves the veteran/readiness bars (0 villager
field kills in 87 wave-3+ fights, so no kill exists for any
demand shape to count). Spawn opportunity, contact, and villager
survivability are all ruled OUT on the stalled seed by rows,
not by argument. The next work is NOT another spawn lever, NOT
a demand-number move, and NOT a re-proof of the stuck state:
(1) trace one 1-HP arrival to its source; (2) a field-finish
conversion lever (pursuit, a finishing blow, a hold, a no-flee
condition below the break line) — designed, not yet built,
and a game-code change, so it belongs to a future arm with
its own pre-registration, not to this diag run.

## Wall numbers (this run, both arms replicate encounter-a exactly)

National ever 8/8, national-or-higher final 7/8, table invited
5/8, table entered 4/8, wins 4/8 (all lesser seat — the full
seat remains unreached), wave 4 reach 5/8, wave 5 reach 0/8,
max arc 4, median survival 150 days, max 180 days. Death-cause
shares: combat 82% (215/261), starvation 3, expedition 16,
monster 11, rest small. The standing directive stands: wins
come only via default-OFF instruments and the lesser seat;
wave 5 still 0; and now the wall has a named mechanical cause
rather than a missing number.

## Village assessment (plain words)

The village in this band is alive and competent at everything
except the one thing the scale ladder counts. It feeds itself,
holds national rank, answers the table's lesser seat, and its
people act like people — they leave gifts without announcement,
weep over generosity, carry word of their reputation home.
Fighters meet monsters constantly (358 wave-2 field fights,
87 wave-3+ field fights on this band) and walk away alive.
What they cannot do is finish a wounded monster: again and
again the beast is beaten to a sliver and slips away, and the
next villager who meets it finds it already too hurt to fight
at all — a fight that ends before it starts, repeated forever.
Nobody in the fiction notices or owns that failure; the
System's veteran line goes unanswered while the village
carries on. The knowledge missing is not a codex entry — it
is a finishing move the village does not have, and a prompt
that never names the monster it needs to blood.

## Blanks filled or documented

- FILLED (measurement): wave-2 stall decomposed (KILLED-BELOW-BAR
  with the 1-HP flee rows); wave-3 field-finish hypothesis ruled
  IN with a pre-registered bar and three census-matched focus
  reproductions. Both recorders are committed instruments a
  future arm can reuse.
- DOCUMENTED (not built): 1-HP arrival origin (trace arm next);
  field-finish conversion lever (future game-code arm);
  mFlee-reason capture gap (wave2enc rows carry outcome + HP
  only — the conversion arm must record the deciding log line
  per mFlee row); contact lateness on 73674 (first spawn day 47,
  first fight day 73 — secondary, not the stall); faced-type
  counts understate kill breadth under the cap (measure
  kills-by-type next time).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-24/perseed-<arm>-a/*.json' --metrics
national,table,wins,exiled` on both corpora: 2 LOUD lines
each (national 12 -> 0, wins 16 -> 0, n = 17 files). Both are
the known artifact class, not a real deviation: the script
reads top-level national/wins paths that per-seed rows do not
carry (rows carry nationalEver/entered/won — this run's
national ever is 8/8, wins 4/8), and the WINSEAT baseline's
own regime note forbids comparing it to a pre-seat
measurement corpus. Baseline NOT rolled. No new investigation;
the same LOUD lines appeared on the 1822Z, 1955Z, and leg2drift
corpora for the same reason.

## Infrastructure

- Worktree registration took ~6.5 min for two trees (slow, not
  failed); both registered clean. Pre-flight reap removed
  nothing (all active trees carry uncommitted changes or fresh
  heartbeats); sibling B trees untouched throughout.
- Master moved 3 times under this run from sibling lanes
  (awayration-cover-b 675495a6c, journey endgame r49 00e556a46,
  journey scale r31 1691f2dc4) — zero file overlap with either
  arm in all three cases. Wave2enc rebased once, fieldfinish
  twice (second rebase forced by a master move during its
  51s detgate re-run; the retry merged in the same call).
  Proofs re-ran green after every rebase (wave2enc 16 checks;
  fieldfinish det-gate). No conflicts, no force, no ref surgery.
- Sweep-process deaths hit BOTH arms the same way (first sweep
  died mid-armed-arm; wave2enc's /tmp log was wiped by a
  sibling cleanup, fieldfinish's process vanished with no
  error). Both recovered from incremental corpus rows without
  re-running completed seeds (wave2enc: PIDS subset +
  --resummarize; fieldfinish: per-seed resume driver). Lesson
  restated for the next run: never redirect a sweep log to
  /tmp; incremental writes are what saved both corpora.
- Safe-commit index clobber hit the fieldfinish worker's
  commit (committed files shown as staged-deleted, bytes
  identical to HEAD) — repaired by the worker with the
  cacheinfo recipe, commit intact, verified clean by the
  coordinator before merge. No clobber on either coordinator
  merge (both verified with `git status --short` empty).
- No EPERM flap blocked this run's commits or merges (contrast
  1822Z/1955Z). The flap class remains a standing risk, not a
  finding of this run.

## Metric review

- The pre-registered bars worked as written on both arms; no
  mid-run re-scoring. G2 per-seed identity (not just medians)
  is the right strength for wrap-based recorders — thousands
  of wrap firings leaked nowhere on either arm.
- The event-rows requirement (from encounter-a's metric
  review) paid off twice: the 1-HP pattern is visible ONLY in
  rows (mHpLeft per fight). Counts alone would have shown
  "49 mFlee" and forced another re-run to ask "at what HP?".
- "Median days" as a cost bar is uninformative for pure-read
  arms (150 vs 150 by construction); per-seed identity plus
  identical classifications is the informative neutrality
  proof. Stated again so the next run does not mistake the
  median for the proof.
- Telemetry-check as specified reads paths the per-seed rows
  do not carry; until it reads nationalEver/entered/won (or
  the baseline regime is restated), its LOUD lines on
  measurement corpora will keep being artifacts. Proposed for
  the NEXT run's pre-registration, not changed post-hoc here.

## Convergence state

Axis scale-onramp: stays converging (NOT converged). The
mechanism behind the wall is now measured, not guessed — a
wounded monster below its break line flees before the first
strike, forever, on both rungs — but no fix has landed, wins
are still only via default-OFF instruments and the lesser
seat, the full seat is still unreached, and wave 5 is still 0.
The directive stands until the tracker records this axis
converged on measured evidence. Next blanks, in order:
(1) trace one 1-HP arrival to its source; (2) a field-finish
conversion lever with its own pre-registration. food-economy
stays converging (untouched; sibling B loop). Rotation left
at 3 (convergence work does not cycle it). Claim deleted;
lock deleted. Evidence: this file + sim-wave2enc-a.md +
sim-fieldfinish-a.md (commits dba34a1c8 + 723d48f5f,
merged locally pending ship).
