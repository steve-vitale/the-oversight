# sim-lingerer-vis-a — PRE-REGISTRATION (written BEFORE any judged sweep and BEFORE any game-code change)

Run: fleshout loop, run fleshout-20261028T0527Z. Axis: scale-onramp
(the blocking axis). Worker: sim-lingerer-vis-a. Tracker blank 1 —
visibility for toll-wounded lingerers (the open half of the
wallwounds fix: game.js tbEnd lingerer restore = min(pre-fight
world HP, fighter end HP), landed as 1af4ddfd9, GO 4/4).
Worktree: `~/workspace/worktrees/sim-lingerer-vis-a` (branch
sim-lingerer-vis-a).
VISIBILITY ARM (not a mechanics arm): one small game-code
narration change, measured before/after on identical seeds. If
any GO leg below misses, the game-code change is REVERTED
byte-clean, evidence + instruments only are left, and the
verdict is NO-GO stated plainly. The acting-policy alternative
(a wound-selective lingerer answer composed with this
substrate) is the NAMED NEXT STEP if visibility alone moves
nothing — never this arm's silent pivot.

## Base — stated explicitly (verified before this prereg was written)

- Base at worktree creation: 5ef4d5bad (batch-ship version bump
  on 065e31dc5, round 0416 coordinator evidence). The wallwounds
  fix 1af4ddfd9 is IN this base (tbEnd lingerer branch carries
  the _preHp min() cap — grepped, lines 43778-43779).
- `git diff 1af4ddfd9..HEAD -- src/` is ONE line in
  src/js/build.js (a version stamp from the batch bump) and
  nothing else: zero game-logic change since the wallwounds
  AFTER band. Trajectories on this base are therefore expected
  to reproduce the wallwounds AFTER band exactly. Any diff is
  diagnosed, never hidden, and never forced back to old numbers.
- The coordinator owns the loop claim file for this run; this
  worker neither writes nor deletes claim files.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave 4 =
  the Mirror Draft; lingerer siege fiction: a besieging raider
  the scholar fled from or lost to goes back to the treeline).
- docs/TABLE.md where relevant (table sanctity: while the table
  sits, raiders hold the treeline but do not gorge — the
  visibility clause must not touch sanctity, and the census
  counts engagements only outside sanctity by construction,
  since no gorge/fight routing fires mid-finale).
- No canon invented. The change adds words only: no spawn,
  draft, damage, crisis, economy, or routing value is touched.
  "If you don't know, it doesn't show" is respected: the clause
  uses the knowledge-gated display name (mname) already used by
  the line it extends, never a true name, wave number, or HP
  number. The village sees a wound, not a stat block.

## Code read first (the visibility question, answered from code)

- RAID BEAT (src/js/havenGrowth.js havenRaidTick): names the
  raiders once per raid, then one generic sentence — "The
  palisade's stakes take their toll as they come over the
  wall." No per-monster toll, no victims, no numbers. Toll
  arithmetic (same function, before the defenders loop):
  wall = round(maxHp * 0.25); hp = max(1, hp - wall), only when
  havenTier() >= 2 (palisade). The w4damage recorder proves it
  at event level (raidTick changes with tollExact + wall).
- LINGER-BIRTH LINE (havenGrowth.js, defenders loop, the
  else-branch — "nobody met this one"): `Nobody met
  ${articlePhrase(mname(m))} — it's still out there at the
  treeline. It'll gorge every night until it's driven off.`
  This is the ONE site chosen: it fires per-monster, exactly
  when a raider becomes a lingerer, AFTER the toll loop has
  already cut it, and it already names the monster in the
  village's language. The raid beat is once-per-raid and the
  gorge beat (havenGrowthDaily) already names the gorge kcal
  nightly — neither is the decision moment; the linger-birth
  line is. A second linger-birth site exists (the
  pendingEncounter branch: live raiders held at the treeline
  under one generic line) — deliberately NOT touched: one
  change, one site, disclosed as a known gap.
- GORGE BEAT (havenGrowthDaily): per-night, per-lingerer,
  names the monster + gorge kcal, no wound language. Left
  untouched (see above).
- LINGERER UI ROW (src/js/app.js, DOM only): names lingerers
  + Endure/Sortie buttons. DOM-only surfaces cannot move node
  sims and sim policies never click buttons — not a sim
  measurement site, noted only.
- SORTIE (havenGrowth.js lingererSortie + answerLingerer):
  the village's own played answer — mustered fighters, real
  rations, blow-by-blow fieldFights, villagers can die. NO
  policy in the substrate calls answerLingerer('sortie')
  (grepped scripts/policies/; sortie fieldFights = 0 in the
  wallwounds corpus sample). The sortie exists in the game
  but has no sim driver — that is a policy blank, not a
  narration blank.
- SPAWN HP (game.js spawnWorldMonster): hp = maxHp = baseHp
  (def hp[0]) unless opts override. So a freshly spawned
  monster is at full; a lingerer's wound at linger-birth is
  its pre-raid wounds (if any) PLUS that night's toll under a
  palisade. The clause is therefore gated on palisade AND
  hp < maxHp at linger-birth: under a palisade the wall cut
  this raider tonight (wall > 0 guaranteed), so "the stakes
  cut it" is true even for a pre-wounded raider; without a
  palisade there is no toll and no clause. The clause claims
  a visible wound, never a number, never a toll amount, never
  that the wall alone caused the whole wound.
- NARRATION HAS NO FEEDBACK PATH (structural fact, grepped):
  Game.say = emit(text, 'narration') — the one text stream.
  No policy in scripts/policies/ parses say-lines, transcripts,
  or awayNews to decide anything (grep: only chatterbox /
  raidtrace record text; gorgedrive writes a line, reads
  worldMonsters). The judged policies read Game state
  (worldMonsters hp, lingering flags), never words. A
  words-only change therefore CANNOT change sim trajectories
  except through an undiscovered side effect — which is
  exactly what the control/armed comparison tests.

## Acting-policy check (task step 2, done BEFORE choosing arms)

- EXISTS, UNCOMPOSED, NOT WOUND-SELECTIVE:
  scripts/policies/gorgedrive.js — the only lingerer-answering
  policy: scholar marches out (travelTo + triggerEncounter)
  to a lingering monster, haven-tile-first, HP-gated scholar
  (>=35% lower waves, >=50% wave 5), party-gated (never alone
  when villagers could come). It wraps leadfeast (feastscale),
  NEVER tableseat-nowait, in any sweep. It reads
  worldMonsters().hp directly and sorts haven-first — it does
  NOT read narration and does NOT prefer wounded lingerers.
  Composing it into both judged bands would move both bands
  equally and still yield zero narration-attributable delta,
  while breaking substrate-verbatim parity with the prior
  bands. It is therefore DOCUMENTED here, not composed into
  the judged bands. Its composition with this substrate, plus
  wounded-first targeting, is the named next blank (see
  NO-GO handling). A composability proof (withGorgeDrive
  builds over tableseatNowait and delegates byte-identically
  with GORGEDRIVE unset) is included in the proof test file
  as a non-judged check, so "can compose" is proven, not
  asserted — but composition is not judged here.
- NO OTHER ACTING ROUTE: competent/leanlinkrescue meet
  lingerers only organically (monsterTurn contact → TB, or
  defender resolve fights). No "travel to known monsters"
  finishing policy exists in scripts/policies/ (travelTo uses
  are forage/expedition routing; the only lingerer-targeted
  travel is gorgedrive's). Stated plainly: the village has
  words for a finishing trip (sortie button, gorge-drive
  march) but this substrate has no wound-selective finishing
  driver. That is the blank this arm measures around, not
  one it silently fills.

## The change (stated before it is written)

File: src/js/havenGrowth.js, defenders loop else-branch
("Nobody met …") line ONLY. The existing sentence stays
byte-identical; one clause is appended when the gate holds:

  GATE: palisade (the local `palisade` boolean, already in
  scope) AND m.hp < m.maxHp (post-toll wound visible).
  CLAUSE (appended to the same say line, same call, no new
  say, no RNG, no state write):
    " The stakes cut it on the way over the wall — it carries
    the wound at the treeline."

Plain words: the village now names, at the moment a raider
becomes a lingerer, that this particular treeline monster
came over the wall wounded. No numbers, no wave names, no
true names, no severity claim, no new system, no new state,
no behavior change of any kind. [needs-eyes] applies: this
is a feel/narration change Steve should see on his phone —
the commit message will carry [needs-eyes] IF the change
lands; on NO-GO there is no game commit at all.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, VISIBILITY: scripts/policies/tableseat-nowait.js
  VERBATIM (never edited), env LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1 (TABLEDEFIANT unset), PLUS the w4damage
  recorder stack VERBATIM (raftdraft-diag, spawnsrc-diag,
  oldcore-diag, w5births-diag, defwound-diag,
  nonworldkill-diag, tbdmg-rebase-diag, w4damage-diag) with
  on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1, TBDMG=1, W4DMG=1.
- Sweep driver reused VERBATIM: scripts/test-w4damage-sweep.js
  via its EVID env override (no copy, no transcription
  drift): CONTROL corpus ->
  evidence/2026-10-28/perseed-lingerer-vis-a/control/,
  ARMED corpus -> .../armed/. Row files are
  s<seed>-armed.json in each dir, summary.json per dir.
- NEVER edited: tableseat-nowait.js, any existing recorder
  file, or any existing sweep/analyzer file. New files only:
  scripts/test-lingerer-vis.js (analyzer / proof validator),
  scripts/test-lingerer-vis-proof.js (unit + composability
  proof, non-judged except the beat-presence leg's
  construction facts), scripts/test-lingerer-vis-sense.js
  (sense replay, NON-MEASURED, clause-presence only),
  this prereg, the evidence file, the corpus dirs.
- Seeds 75101-75108, horizon 180d DEATH-AWARE (runDays stops
  on death/win; +10d tail max). The 8-seed band IS the pilot
  and the judged band (MEASUREMENT.md §§9-12).

## Census definitions (BINDING — the analyzer implements exactly these)

- TOLL-WOUNDED LINGERER INSTANCE (per seed, per spawnsrc seq):
  (1) a w4damage raidTick changes row with tollExact=true
  and wall > 0 for that seq (observed toll event, never
  computed); AND (2) a w4damage daily snapshot on/after the
  toll day with lingering=true for that seq, before any
  removal of that seq (it became/stayed a lingerer). A seq
  with a toll row but no lingering snapshot is a raider, not
  a lingerer, and is excluded. A lingering snapshot with no
  toll row is a lingerer, not toll-wounded, and is excluded.
  Linger-start day = first lingering snapshot day >= toll day.
- ENGAGED (after linger-start): any of, with day >=
  linger-start day and the same seq: a w4damage fieldFight
  row (any caller: resolve/patrol/aid/sortie/other); a
  defwound resolve row; a nonworldkill start whose
  tileMonster.seq == seq (TB engagement); an oldcore tbEnd
  row with that seq (TB ending). One instance counts once
  per band for the engagement total (engaged instances),
  with per-instance event lists retained for audit. A TB
  engagement that is the lingerer's own re-entry fight is
  still an engagement (the village met it); it is not a
  finish unless won (below).
- FINISHED (after linger-start): any of, same seq, day >=
  linger-start day: a w4damage fieldFight with outcome
  vKill; a defwound resolve row with outcome vKill; a tbdmg
  tbEnd with result 'won' joined by fightId to a nonworldkill
  start whose tileMonster.seq == seq. Oldcore removals are
  corroboration only, never a primary finish (their kinds
  mix kills with melts/exits).
- NEVER counted: raid-night defender fights on the toll day
  itself before linger-start (those are the raid, not a
  finishing trip); engagements of non-toll lingerers;
  engagements of toll-wounded non-lingerers; sense-replay
  text (never enters any count).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: engaged toll-wounded lingerer instances, ARMED vs
CONTROL on identical seeds.

GO RULE (judged ONLY against this prereg, ALL legs must pass;
a miss on ANY leg is NO-GO and the game-code change is
reverted byte-clean):

  (a) CONTROL PARITY vs the wallwounds AFTER band:
  evidence/2026-10-28/perseed-wallwounds-a/after/ — EXACT
  on per-seed days, gameDays, won, waveReach,
  nationalEver/Final, table, entered, deathTotal, courtship
  combined. (Zero game-logic diff makes this the expected
  outcome; any diff is diagnosed in the evidence, never
  hidden, and a real trajectory diff makes the band INVALID
  for judging, not GO.)
  (b) BEAT FIRES: the armed-code sense replay
  (scripts/test-lingerer-vis-sense.js, NON-MEASURED,
  clause-presence only) captures >= 1 line containing the
  new clause for a lingerer, AND the control-code sense
  replay captures 0 such lines. Sense text proves wording
  and presence only, never counts.
  (c) ENGAGEMENT DELTA (the deciding leg): engaged instances
  (ARMED) >= engaged instances (CONTROL) + 1, AND finished
  instances (ARMED) >= finished instances (CONTROL).
  (d) COST BAR: starvation deaths (ARMED total) <=
  starvation deaths (CONTROL total) + 2; starvation deaths
  among ARMED-only dead seeds (seeds dead in ARMED but not
  dead in CONTROL) <= 2; median survival (ARMED) >= 0.8 x
  median survival (CONTROL).
  (e) SUBSTRATE GATE on both bands (else that band is
  INVALID, not NO-GO, and the run stops for an env fix):
  courtship combined > 0 AND >= 6/8 seeds active.
  (f) DETGATE on 75101 PASSES on both code versions
  (within-code neutrality: baseline vs recorders-OFF equal
  on days, gameDays, tsNationalDay). Prior-base numbers were
  132/132 days, tsNationalDay 77 — if base drift moved them,
  the new numbers are disclosed loudly as the same-base
  truth, never forced to 132/132/77. Cross-code detgate
  numbers may differ only by the change's own trajectory
  effect (predicted: none, since the change is words-only);
  any difference is investigated, not smoothed over.
  (g) BAND VALIDITY: 8 rows per band, every recorder clean
  (errs 0, no overflow), analyzer exit 0.

  STRUCTURAL PREDICTION (stated upfront, not a re-score):
  because say() is output-only and no policy reads
  narration, leg (c) is PREDICTED TO MISS with armed
  trajectories byte-identical to control. The run is a
  falsification test of that prediction: a non-zero delta
  would prove an undiscovered narration side effect and
  must be investigated before any GO is claimed, never
  celebrated silently. The expected verdict is therefore
  NO-GO for landing with the measurement landed — and that
  expected NO-GO is a result, not a failure: it proves the
  next blank is an acting policy, not more words.

  NO-GO handling: revert the game-code change by editing
  the clause back out (the original line restored
  byte-identical — verified with git diff against HEAD for
  src/js/havenGrowth.js showing empty after revert, plus
  node --check), leave evidence + instruments committed,
  and say NO-GO plainly with the failing leg named. Do NOT
  silently switch to composing gorgedrive into the judged
  bands, to a sortie policy, or to a second visibility site;
  name the acting policy as the next step.

SENSE RULE (binding): non-measured replay only, using the
new scripts/test-lingerer-vis-sense.js (same say/sysSay tap
pattern as test-w4damage-sense.js VERBATIM in method, new
file for the new clause regex). Replay text proves wording
and presence only, never counts, and any replay trajectory
shift vs the judged corpus is stated, not hidden. The
sense question: when a toll-wounded lingerer is born at the
treeline, does the village now name its wound in its own
language — and does any line contradict the wound (claim a
healed lingerer, a full-strength return)? Plus the
one-encounter plain-words read: read ONE toll-wounded
lingerer encounter from a non-measured replay in plain
words; replay text never enters any count.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed CONTROL band
is run first and judged for parity (leg a) + detgate (leg f)
before the game change is written. If leg (a) fails as a
real trajectory diff (not an instrument bug), the change is
NOT written and the run ends INVALID-band, reported as such.
If the gap is a pure instrument bug that can be fixed and
re-proved, the fix, the re-proof, and the re-sweep are all
disclosed, and the original failed pilot rows are kept,
never overwritten silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare and
record the outcome. The known limitation is documented in
prior arms (no corpus-ingest mode for a single-arm census
corpus; the tool compares panel files from live roots, not
census rows). If it fails the same way, say so and use the
paired before/after sweep tables + analyzer outputs (this
band vs itself, identical seeds/policy/substrate) as the
section-15 substitute. No panel artifact will be faked.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall baseline,
metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-lingerer-vis-a/control/*.json and
.../armed/*.json), report LOUD lines with verdict, do NOT
roll the baseline on an unexplained LOUD line (the
baseline's WINSEAT regime forbids comparing it to a
tableseat-nowait census substrate, and per-seed rows carry
nationalEver/entered/won, not top-level national/table/
wins paths — say which artifact class applies, or
investigate if a line fits neither).

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
