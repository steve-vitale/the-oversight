# sim-chainkill-a — PREREGISTRATION (binding, committed BEFORE any judged census)

Run: fleshout loop, run fleshout-20261028T2115Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-chainkill-a.
Assignment: wounded-beast CHAINING diagnosis ONLY — zero src/js, zero
game-behavior changes, zero default flips, zero policy changes. This
arm classifies and quantifies; it does not build the fix. The blank
is a measurement blank: a complete, classified census IS the fill.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law, wave-4 bands
850–1500 HP, damage 35–95). No canon doc covers wounded-beast
chaining identity — the identity rule below is derived from code
mechanisms, not invented canon, and is stated exactly so it can be
checked:

- World beasts persist as objects in state.worldMonsters (game.js
  worldMonsters / monsterAt / spawnWorldMonster): one monster per
  tile, wandering adjacent tiles between ticks (wanderWorldMonsters,
  35% move chance per tick, never onto occupied/safe tiles).
- fieldFights.js end-of-fight writeback: "wounds persist onto the
  world entity" — when the outcome is not vKill, m.hp =
  rec.mHpLeft. A surviving beast therefore re-enters the world at
  exactly the HP the fight left it at.
- Router (game.js resolveWildMonsterEncounter): vKill removes the
  beast (removeWorldMonster); alreadyDead clears a 0-HP corpse;
  mFlee moves the beast one tile and leaves it alive ("It's still
  out there, somewhere."); vFlee/vDie leave it on its tile at
  mHpLeft (hurtVillager only touches the villager).
- No world-level regen was found: the only monster HP increases
  in code are in-fight mechanics (e.g. the wave-2 landlord's
  land-rent heal inside a fight). A between-fight heal would
  BREAK a chain under the rule below (conservative: a missed
  link, never a false link).
- The recorder carries NO persistent beast identity: world
  monsters have no _spawnSeq (verified: seq is null on every
  meeting in the predecessor corpora), and the recorder stores
  mid, mTile, mHpStart, mHpLeft — not an object id. HP arithmetic
  is therefore the ONLY identity channel available in census
  data, exactly as the retreatdiag finding used it (850 → 817 →
  790). This arm does not pretend otherwise.

## Fresh band (this arm's own census, base code)

- Seeds 75101–75116 (16, wider than the usual 8 — justified below),
  scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware (runDays
  stops on death/win, as in the predecessor sweeps), competent
  policy, fieldparty-form-diag recorder only, reused VERBATIM
  (never edited). No outdoorcrew layer, no other policy layer.
- WHY 16 SEEDS: chains need REPEAT meetings of the same beast.
  The 8-seed retreatdiag fresh band held only 24 judged meetings
  in total; a chain is a repeat-meeting event inside that small
  set, so 8 seeds risks a census of one or two chains. Seeds are
  nearly free (Steve 2026-10-13); doubling the band doubles
  repeat-meeting opportunities at the same substrate. The first-8
  subset (75101–75108) is compared to the retreatdiag fresh band
  as a diagnostic (same substrate, same code lineage — exact
  judged-count match expected only if the code is unchanged;
  a count mismatch with the shape intact is a diagnostic note,
  NOT a gate failure; a shape break IS a gate failure).
- CONTROL-SHAPE GATE (must pass BEFORE any chain is judged):
  on this base-code band, judgedA (resolve/patrol/aid, wave-4,
  field, villager-led) formed 0 AND kills 0, AND judgedB
  (resolve/patrol) formed 0 AND kills 0 — the known control
  shape (1528Z control: 24 field meetings all solo, field kills
  0; retreatdiag fresh: judgedA 24 formed 0 kills 0, judgedB 18
  formed 0 kills 0). FORMED def verbatim from the retreatdiag
  sweep: crewRaw minus leader non-empty AND (calledHelp OR
  joinedAllyVid non-null). If the shape does NOT match, the
  census instrument is suspect: STOP, report, do not judge
  chains against a broken census.
- CORPUS LEGS (with the gate): 16/16 rows, days > 0,
  recorder errs 0, overflow 0.
- Wall numbers for the fresh band (reported, never claimed as
  movement): national ever/final, table invited/entered, wins
  (lesser/full), wave-4/5 reach, median survival, death-cause
  shares. NO wall movement is claimed from re-analysis alone —
  the fresh band is a census, not an intervention.

## Chain definition (exact — the identity rule)

- UNIVERSE U: every meeting in the band corpus with wave == 4,
  channel == 'field', caller in {resolve, patrol, aid}, leader
  NOT the scholar. (JudgedA def verbatim; aid fights are field
  fights at the haven door under the same fieldFight engine.)
- ORDER: per seed, the meetings array's file order (recorder
  append order = chronological). Day/part must be
  non-decreasing in that order; any violation is reported as
  an ordering anomaly and the affected meetings are excluded
  from chaining (counted, not silently ordered).
- LINK: meeting B links to meeting A iff ALL hold: same seed;
  same mid; A earlier in order than B; A.mHpLeft and B.mHpStart
  both non-null integers; B.mHpStart == A.mHpLeft exactly;
  A.mHpLeft > 0; A.outcome is not 'vKill' and not
  'alreadyDead' (a killed beast is removed, a corpse is
  cleared — neither can be re-met; a link from such a
  predecessor, if ever observed, is flagged IMPOSSIBLE-LINK,
  see below).
- PREDECESSOR CHOICE: the MOST RECENT matching A. Ambiguity
  flags (a flagged link still links, but its chain is marked
  FLAGGED and never counts as a clean chain kill):
  (i) AMBIGUOUS: 2+ matching A's exist for B;
  (ii) FORK: the chosen A already has a successor (one beast
  cannot yield two next fights at the same HP — two beasts of
  one type at one HP value is the collision this catches);
  (iii) IMPOSSIBLE-LINK: the chosen A ended vKill /
  alreadyDead (should not happen; a code-or-recorder anomaly
  if it does).
- CHAIN: a maximal sequence of >= 2 meetings connected by
  links. Singletons (no link in or out) are UNCHAINED
  meetings, counted but not chains.
- TILE IS NOT IDENTITY: beasts wander, so mTile may change
  between linked meetings. Tile distance between linked
  meetings is AUDITED (reported as a distribution), never a
  filter — a same-HP link across a far tile is still a link
  under this rule, and is visible as such in the audit.
- CENSORING, STATED UP FRONT (not discovered mid-run):
  (a) Scholar (player) fights are NOT in U (different engine
  path, startCombat, not the fieldFight recorder). Player
  damage can wound a beast between villager meetings —
  breaking a chain invisibly (next villager mHpStart matches
  no prior mHpLeft) or starting a new chain at a pre-wounded
  HP. Chain damage below is therefore VILLAGER-OBSERVED
  damage only; total damage to the beast is >= it.
  (b) A beast met once, then never again in the run, may
  still be alive at horizon, player-killed later, or
  otherwise gone — the census cannot see past the last
  villager meeting. STILL-ALIVE below means "alive at its
  last villager meeting", with this censoring stated.
  (c) Two beasts of one type wounded to the same HP value
  can false-link. The ambiguity flags + tile audit are the
  guard; a flagged chain kill is reported as flagged, never
  as clean.

## Classification (by the chain's TERMINAL meeting outcome)

- KILL: terminal outcome vKill → finished by a later party.
  (Clean only if the chain carries no flag; flagged kills are
  reported separately and never pooled into the clean count.)
- DRIVE-OFF: terminal outcome mFlee → beast driven off
  (alive, displaced one tile by the router).
- STILL-ALIVE: terminal outcome vFlee, vDie, or evade →
  beast alive in the world at its last villager meeting
  (writeback rule above); fate after that meeting censored
  per (b).
- BEAST-GONE: terminal outcome alreadyDead → corpse cleared;
  the beast was already at 0 HP. Report whether the preceding
  link left 0 HP (a simultaneous-fall chain end — damage
  finished it in effect, without a vKill line).
- OTHER: any chain whose terminal outcome is none of the
  above, or whose terminal fields are missing. Must be 0.

## Questions and metrics (fixed before judging)

- PRIMARY Q: does any chained wounded beast ever get finished
  with a kill? Answer = clean KILL count (flagged kills
  listed separately; a flagged kill does NOT answer "yes"
  cleanly, and is reported as such).
- SECONDARY (per chain): length (meetings), span in days
  (last.day - first.day), same-day vs multi-day, total
  villager-observed damage (sum of mDealt over chain
  meetings), max chain damage across chains, per-meeting DPR
  (mDealt/rounds), chain mean DPR, terminal HP (mHpLeft of
  the terminal meeting), rounds-to-kill at chain DPR
  (terminal HP / chain mean DPR) vs the 15-round cap,
  formed-vs-solo composition of chain meetings (on base
  code, formed is expected 0 — chains here are SOLO chains
  unless the gate surprises us).
- DAMAGE-ARM FIT: for each chain's terminal HP, rounds at
  57/round and at 80/round (the retreatdiag damage-arm target
  for fresh beasts) vs the 15-round cap; count chains whose
  terminal HP fits the cap at 57 (HP <= 855) and at 80
  (HP <= 1200). This tests whether chaining COMBINED with
  the damage arm's target would finish wounded beasts inside
  the cap — the secondary question, answered with numbers,
  not vibes.
- CENSUS TOTALS: judged meetings, unchained meetings, chains
  found, chains by class, flagged links/chains, tile-distance
  audit, ordering anomalies (must be 0 or excluded+counted).

## Secondary analysis (NOT the judged census, never pooled)

The same analyzer, same rule, run over the two FORMED-party
predecessor corpora (different substrates — never pooled with
the primary band, never substituted for it):
- evidence/2026-10-28/perseed-fieldfeed-a/ (s<seed>-armed.json,
  fieldfeed.meetings) — home of the known chain (75106 d118
  influencer 850 → 817 → 790, same day, same tile, two formed
  parties). Classifying its full extent answers whether THAT
  chain ever finished.
- evidence/2026-10-28/perseed-shoutgate-a/ (s<seed>-armed.json,
  fieldparty.meetings) — the other formed-party corpus.
Both corpora are read-only. Their verdicts (shoutgate NO-GO,
fieldfeed pilot-GO-only) are NOT re-judged; only chains are
classified, under this prereg's rule.

## Sense-testing law (transcripts read + quoted)

- S1 (corpus-derived): the published fieldfeed chain beats —
  75106 d118 Elmarie vs Ratio (sim-fieldfeed-a.md sense note)
  plus the Mateo link fight's numbers from the retreatdiag
  table (same-day, same tile, same beast by HP arithmetic).
  Judge: do the two fights read as one wearing-down, or as
  two accidents that happen to share HP?
- S2 (fresh fixture, base code): a two-fight chain replay —
  kitted pair A vs an influencer entity at 850 (maxHp 850),
  then kitted pair B vs the SAME entity object (HP carried
  by the engine writeback; the fixture asserts fight 2's
  mHpStart == fight 1's mHpLeft). Full logs of both fights
  quoted. The fixture's job is the carry + the reading, not
  a kill claim: any outcome is reported, none is failed on
  (unlike the retreatdiag shape check — a chain fixture that
  killed would be a finding, not a contradiction).
- SENSE VERDICT categories: COHERENT-WEARING-DOWN (successive
  fights read as parties wearing one beast down, including
  any recognition-or-its-absence judged honestly) /
  DISCONNECTED-ACCIDENTS (no thread between fights) / MIXED.
  If the logs never name the beast as the same wounded one,
  that is a NARRATION blank to name, not a mechanism claim.

## Bars (judge against this header; a miss is DIAG-NO-GO)

- CENSUS-VALIDITY: 16/16 rows, errs 0, overflow 0, control
  shape matches (formed 0, kills 0 on BOTH judged cuts).
- CLASSIFICATION BAR: 100% of found chains classified into
  the scheme above, OTHER = 0.
- SENSE BAR: >= 2 chain transcripts read + quoted (S1 + S2).
- DIAG-GO BAR: census valid AND every chain classified AND
  >= 2 sense transcripts read + quoted AND one ranked next
  step named with numbers. Any leg missed → DIAG-NO-GO. No
  re-scoring against a friendlier metric mid-run; metric
  doubts go under "metric review" in the evidence file.

## What this arm does NOT do

No src/js change, no policy change, no default flip, no fight
routing, no feed, no roster read, no push, no bump, no live
verification. No re-judgment of predecessor verdicts. No wall
movement claimed from re-analysis. No panel artifact (standing
exception: the panel has no census-ingest mode; identical-seed
before/after corpora are the §15 substitute, as in prior
rounds). Instruments: scripts/test-chainkill-a-sweep.js (fresh
band), scripts/test-chainkill-a.js (chain analyzer + judge),
scripts/test-chainkill-a-sense.js (chain fixture replay).
Each must pass `node --check`; analyzer + sense must print
green after every rebase. Never run concurrent jest;
cache dir /tmp/jest-cache-sim-chainkill-a (no jest expected
— node scripts only; the rule is recorded, not waived).
Never touch docs/ONTOLOGY.md (known sibling transient, 0
bytes in the main tree — left alone). Never touch sibling
loop-B trees/branches or their claims.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
