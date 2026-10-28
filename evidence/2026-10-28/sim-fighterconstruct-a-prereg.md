# sim-fighterconstruct-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0527Z. Axis: scale-onramp
(the blocking axis). Worker: sim-fighterconstruct-a. Tracker blank 3 /
backlog #1301 — fighter-construction footnote audit.
Worktree: `~/workspace/worktrees/sim-fighterconstruct-a` (branch
sim-fighterconstruct-a).
AUDIT / MEASUREMENT ONLY — zero src/js changes, zero policy changes
to game behavior, no game lever, no game fix proposed or landed.
Documentation IS the deliverable: an audit of monster TB fighter
construction that closes or bounds the footnote below. This arm does
NOT re-score the w4tbhp, w4damage, or w4convert verdicts or corpora.

## The footnote (why this arm exists)

sim-w4tbhp-a proved wound2 does NOT cause below-max player TB
starts, but left a footnote on the monster control: 2 post-wound2
TB fights start the MONSTER below max — 75102 d166 audit
1140/1211 (94.1%) and 75106 d143 audit 1268/1298 (97.7%) — the
same fights, same deficits, pre-wound2, and the deficits do not
track the world wound (75102 d166: world instance 825/1100,
fighter deficit 71 vs world deficit 275; 75106 d143 is a
feast-draw fight whose tile monster is a wave-1 cliffhanger
1/70, so no world-audit wound exists to leak at all). This arm
audits monster TB fighter construction and closes or bounds
that footnote on the 75101–75108 band.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 = the Mirror
  Draft, bands anchored: damage 35–95, HP 850–1500, pierce
  0.2–0.5; gate village standing >= 100; combat-readiness
  gates the standing unlock).
- docs/MEASUREMENT.md sections 9–12 and 14–15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the
  code reading governs the audit and the difference is reported.

## Code read before this prereg (construction, game.js startCombat)

Monster TB fighters are built FRESH in startCombat, never copied
from the world monster:

- Normal / snake / pack fighters: `hp` is a fresh roll
  `mdef.hp[0] + floor(random * (mdef.hp[1] - mdef.hp[0]))` and
  `maxHp` is set to exactly that roll (`hp, maxHp: hp`).
- Veteran: `hp = round(hp * 1.5)` applied to the roll BEFORE the
  fighter literal, so hp and maxHp scale together (audit veteran
  range would be ~1650–1950, not 1100–1300).
- Pack-leader extra packmate: `hp = round(hp * 0.7)`,
  `maxHp = round(hp * 0.7)` — together again.
- The world monster's HP is NEVER copied into the fighter:
  worldMonster is read only for the veteran flag, the spawn
  position, beamPhase and gwGrounded. The tile HP at fight start
  is a different number from a different roll.
- After the fighters are built, startCombat runs its tail INSIDE
  the same call, before any outer recorder can snapshot:
  Godpath beginApexHunt (read-only for HP — it records a
  `full: hp === maxHp` flag and writes no HP), the per-monster
  batch-2 init (phases/patter, no HP), and then OPENING TURNS:
  `turnIdx = -1; tbBeginTurn(); if (!tbIsPlayerTurn())
  tbAdvance()` in node (window stub deleted, so the sync path).
  tbAdvance routes AI turns in turnOrder (speed desc; ties
  player, then villagers, then monsters) until the player's
  turn lands. Player speed is base 3 minus burden penalty
  (min 1); villager speed is 2–4 (age/temper/HP); audit speed
  is 2. A villager faster than the player therefore acts
  BEFORE the recorder's post-startCombat snapshot, and its
  strike lands through tbDamage before the snapshot is taken.
- The nonworldkill recorder snapshots fighters AFTER
  startCombat returns, so its "TB-start" HP is really
  post-opening-turn HP, not construction HP. The w4tbhp
  metric-review note 3 already flagged this definition.
- Two post-startCombat writers that do NOT touch the start
  snapshot, by wrap order: (a) the door-flee re-engage
  wound-honoring claim in reengageWaitingMonsters runs AFTER
  startCombat returns (mf.hp = min(maxHp, stashed w.hp)) —
  after the recorder's post-record, so it can move tbEnd HP
  but never start HP; (b) overtime scaling wraps startCombat
  and multiplies hp and maxHp by the SAME factor (rounded),
  so a full fighter stays full.
- Direct-build fights (encounters.js alien duels, justice /
  party fights) bypass startCombat and carry no monster def;
  they are NOT in this census's unit (see Definitions) and
  are reported separately, never folded in.

## Candidate inputs (binding — the analyzer tests EACH of these
## against EACH below-max start; a start is TRACED only by the
## rule in "Classification rule" below)

- C0 def roll: mdef.hp range (audit [1100,1300]); a maxHp
  outside the range (or outside the veteran range, if the
  veteran flag applied) would implicate the roll/scaling.
- C1 veteran x1.5: scales hp and maxHp together — can move
  maxHp, cannot move the fraction.
- C2 packmate x0.7: same — moves maxHp, not the fraction.
- C3 snake segments: same — hp == maxHp per segment.
- C4 overtime scaling: same factor both sides — fraction
  unchanged.
- C5 world-HP leakage: no copy in startCombat — predicted
  REFUTED; the test is fighter deficit vs world deficit and
  the feast-draw case (no world monster of the fought type).
- C6 door-flee re-engage wound claim: runs after the
  snapshot — predicted NOT a start-HP input; the test is the
  door (re-engage fights must show the claim only at tbEnd).
- C7 recorder rounding: fighters carry integer HP; roundHp
  cannot create a 30–71 deficit.
- C8 opening turns inside startCombat (the prime suspect):
  villager-ally strikes via tbDamage before the snapshot;
  monster strikes damage others, never itself; status ticks
  (seTickFighter) cannot bite a fresh fighter with no
  statuses; Godpath beginApexHunt writes no HP. The test is
  exact: construction HP (first-tbAdvance-entry snapshot)
  plus opening tbDamage events on that fighter must sum to
  the start deficit (see Classification rule). A corollary
  prediction, tested on the whole census: a below-max start
  requires at least one villager ally ordered before the
  player (speed > player speed, or tie-broken ahead) — a
  solo fight, or a fight where the player is first in order,
  must show the monster at full HP at snapshot.
- C9 direct-build fights: outside the census unit; counted
  separately, never classified as below-max starts.
- C10 player-ability opening effects (fear_aura hesitate,
  pocket_sand blind): set flags, not HP — predicted no input;
  tested by the opening-event join (no tbDamage event from
  them, no deficit without a strike event).

## Definitions (reused VERBATIM from the w4tbhp prereg where
## stated, plus this arm's construction join)

- TB FIGHT (this arm): a wave-4 nonworldkill start that is not
  excluded by classifyStart and not refused (pre.liveFight
  false). Same-call start-and-end fights (fightIdSource
  'end-row') carry no start fighters in the recorder and are
  INCOMPLETE, never estimated (see GO rule).
- TB-START ROW (judged unit, same as w4tbhp): one TB fight,
  carrying the startCombat post-call fighter snapshot from
  nonworldkill starts: monster fighter hp/maxHp at start
  (kind 'monster'). A start is BELOW-MAX when hp < maxHp
  (strictly). Rows with a null monster fighter are
  INCOMPLETE and count against completeness.
- CONSTRUCTION ROW (new this arm, fighterconstruct recorder):
  the fighter snapshot taken at the FIRST tbAdvance entry
  inside that startCombat call (after fighter creation and
  batch-2 init, before any AI turn acts), plus every
  tbDamage event on any fighter during that startCombat
  call (target key/kind, source label/key, pre-HP, post-HP,
  returned landed damage). Construction HP is the
  pre-opening-turn HP; start HP minus construction HP is
  the opening-turn movement.
- CENSUS: ALL wave-4 TB monster start-HP vs max on the band
  (every start, full and below-max, with channel/door,
  origin, monster type, def range, world HP where present,
  construction HP, opening damage sum, residual).

## Classification rule (binding — the analyzer implements
## exactly this; it exits non-zero on any unclassified
## below-max start)

For each below-max monster TB start, compute:
  deficit D = maxHp - startHp (from the nonworldkill snapshot)
  construction deficit Cd = maxHp - constructionHp (from the
  fighterconstruct construction snapshot, same fightId)
  opening damage S = sum over tbDamage events on that
  monster fighter during that startCombat call of
  (preHp - postHp)
- TRACED-to-C8 (opening turns) iff Cd == 0 AND S == D, with
  at least one contributing tbDamage event from a villager
  ally (source key v_* / ally) — the event list is cited.
- TRACED-to-a-construction-input iff Cd > 0 AND the
  construction snapshot itself is below max, with the input
  named from C0–C4 (maxHp outside the applicable range, or
  a named post-construction writer that ran before the
  first tbAdvance entry — none is known in code; if one
  appears it is named with its code site, never guessed).
- UNEXPLAINED iff neither holds: Cd > 0 with no named
  construction input, or Cd == 0 but S != D (residual
  D - S printed, with the event list cited). Unexplained
  starts are counted and every row is cited in the
  evidence; they are never folded into "traced".
- A below-max start whose construction snapshot is missing
  (recorder gap) is UNCLASSIFIED, not unexplained: it fails
  the GO rule the same way (see GO rule).

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, AUDIT: scripts/policies/tableseat-nowait.js
  VERBATIM (never edited), env LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1 (TABLEDEFIANT unset), PLUS recorder
  on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1, TBDMG=1, W4DMG=1,
  FIGHTERCONSTRUCT=1 (the new recorder only).
- NEVER edited: tableseat-nowait.js, any existing recorder
  file, or any src/js file. New instruments only (one sweep
  copy, one new recorder, one analyzer, one sense script).
- Recorders reused verbatim, policy-side only:
  raftdraft-diag, spawnsrc-diag, oldcore-diag, w5births-diag,
  defwound-diag, nonworldkill-diag, tbdmg-rebase-diag,
  w4damage-diag, plus the w4convert sweep-side read-only
  scholar-history capture (a property read, no RNG moved;
  parity below proves it again). No recorder draws RNG,
  throws into the engine, or returns anything but the
  original value. The new recorder records AFTER delegating
  for tbDamage (pre/post HP around the call) and at
  tbAdvance entry (a pure read), writes nothing to game
  state (store arrays only, plus the same installed-flag
  class the other recorders use), and returns the original
  value untouched.

## Instruments (COPIES ONLY, originals untouched, plus one new)

- scripts/test-fighterconstruct-sweep.js (copy of
  test-w4convert-sweep.js), differing ONLY in: default
  corpus dir (evidence/2026-10-28/perseed-fighterconstruct-a),
  labels, the loadGame mode label (a manifest label only),
  require-path renames to the -fighterconstruct instrument
  names, and the addition of the fighterconstruct recorder
  to the composition + detgate (see below). Verified by
  diff before the judged sweep: every changed line is one
  of those renames/additions; no logic, channel rule, gate,
  or recorder wiring changed.
- scripts/policies/fighterconstruct-diag.js (NEW, policy-side
  only): wraps startCombat (depth flag only, no HP logic),
  tbAdvance (first-entry-per-startCombat construction
  snapshot: fightId, order, fighters with key/kind/
  monsterId/villagerId/hp/maxHp/speed), and tbDamage
  (during a startCombat call only: target key/kind, source
  label/key, pre-HP, post-HP, returned value). On-switch
  FIGHTERCONSTRUCT=1; unset it delegates byte-identically:
  no wraps installed, no ctx surface, no record.
- scripts/test-fighterconstruct.js (NEW analyzer, proof
  validator): reads the corpus rows, builds the TB-start
  census + construction join, runs unit checks on its own
  deficit/sum logic, checks parity vs the w4damage corpus,
  and prints the census table + classification table +
  verdict legs. Exit 1 on any hard gate failure (corpus
  incomplete, recorder errors > 0, overflow > 0, or any
  below-max start unclassified/unexplained-and-uncounted
  — see Classification rule: unexplained starts are
  COUNTED and cited, but any below-max start that is
  neither traced nor counted as unexplained, or any
  missing construction snapshot, exits 1). The analyzer
  never re-scores a verdict: it prints the tables; the
  evidence judges them against this prereg.
- scripts/test-fighterconstruct-sense.js (copy of the
  w4convert sense script, labels only): NON-MEASURED
  narration replay only.

## Corpus

- evidence/2026-10-28/perseed-fighterconstruct-a/
  s<seed>-armed.json (8 rows), plus summary.json from the
  sweep's --summary mode, plus analysis.json from the
  analyzer's --out mode.
- The sweep runs on the worktree base with the instruments
  above. Wall numbers are reported for THIS band only, never
  pooled with any other band.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the monster TB-start-HP audit — every below-max
wave-4 monster TB start on the band classified.

GO RULE (AUDIT, judged ONLY against this prereg):
  GO = 8/8 seeds complete with clean recorders (row per
  seed, days > 0, every recorder clean: errs 0, no
  overflow, incomplete TB starts 0) AND every below-max
  wave-4 monster TB start classified (traced to a named
  construction input, or counted as unexplained with its
  row cited) AND the "monster always walks in fresh" claim
  corrected in writing (confirmed, qualified, or refuted
  with the counts).
  DIAG-NO-GO = an audit that explains the 75102/75106
  deficits but leaves other below-max starts unclassified
  (or with missing construction snapshots), with the gap
  named (which starts, which record is missing).
  A complete audit showing unexplained starts is NOT
  automatically NO-GO — unexplained starts that are counted
  and cited satisfy the classification leg, and the claim
  correction then carries them as the bound ("fresh except
  N counted exceptions, of which M unexplained"). What
  fails is an UNCLASSIFIED start, not an unexplained one.
  No re-scoring mid-run; metric doubts go under a
  mandatory "metric review" section, and any revision
  applies to the NEXT run, never this one.

DETGATE (pre-sweep STOP gate): seed 75101, baseline (plain
tableseat-nowait, no recorders) vs wrapped (ALL recorders
composed, every on-switch UNSET, including
FIGHTERCONSTRUCT): days, gameDays, and tsNationalDay must
be equal, with no diag ctx surface and no wraps installed
(including no _fighterconstructDiagInstalled flag). The
prior-base numbers were 132/132 days, tsNationalDay 77.
If base drift moved them, prove same-base neutrality the
way sim-w4convert-a did (the prior instrument stack,
recorders-OFF, on this base diverging identically) and
disclose old vs new numbers loudly; never force old
numbers. A detgate FAIL (baseline != recorders-OFF on
this base) stops the judged sweep.

PARITY RULE (binding, do not soften): judge parity ONLY
against evidence/2026-10-28/perseed-w4damage-a/ (the
immediate predecessor, same substrate + w4damage layer).
Per-seed days, gameDays, won, waveReach, nationalEver/
Final, table, entered, deathTotal, courtship combined,
AND wave-4 defwound rows by context, wave-4 nonworldkill
starts, and wave-4 spawn seq sets must match, or the
divergence must be diagnosed with a detgate PASS proving
recorder neutrality (base drift is then the diagnosis,
stated with the per-seed diffs — never hidden, never
re-scored against a retired corpus). NEVER re-score the
w4tbhp, w4damage, or w4convert verdicts or corpora.

SUBSTRATE-ACTIVATION GATE (binding, same as predecessors):
band courtship combined > 0 AND >= 6/8 seeds with non-zero
combined courtship. If the gate FAILS, the sweep is
INVALID (not NO-GO): no verdict is judged, the failure is
reported loudly, and the run stops for an env fix.
Expected from the w4damage band: combined 121, 8/8 active.

SENSE RULE (binding): read ONE below-max-start TB fight in
plain words if one re-derives on this band (the sense
seed is the lowest seed with a below-max monster start on
this band; the window is that fight's day minus 10 to
plus 10, capped at the seed's end day). If NO below-max
monster start re-derives on this band, say so plainly and
use the committed 75102 d166 / 75106 d143 rows as the
sense anchors, cited as prior-band rows, not this band's.
Sense is non-measured (say/sysSay taps); replay text never
enters any count, and the replay trajectory shift is
stated, not hidden. Sense is a supporting note, not a
verdict leg (the verdict legs are the GO rule above).

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
pilot for a census. If its completeness gates pass, it is
the judged band. If parity fails, that is a diagnosis to
report, not a reason to re-sweep fresh seeds silently. If
the gap is a pure instrument bug that can be fixed and
re-proved, the fix, the re-proof, and the re-sweep are all
disclosed, and the original failed pilot rows are kept,
never overwritten silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: scripts/balance-panel.js has NO corpus-ingest
mode for a single-arm census corpus (standing exception,
sixth-plus round — the tool builds panels from live roots,
not census rows). This arm will ATTEMPT the panel compare
and record the outcome; if it fails that way, say so and
use the paired sweep-compare tables as the section-15
substitute. No panel artifact will be faked. This arm
changes nothing in the game, so the panel is expected to
show zero movement.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall baseline,
metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-fighterconstruct-a/*.json),
report LOUD lines with verdict, do NOT roll the baseline
on an unexplained LOUD line (the baseline's WINSEAT regime
forbids comparing it to a tableseat-nowait census
substrate, and per-seed rows carry nationalEver/entered/
won, not top-level national/table/wins paths — say which
artifact class applies, or investigate if a line fits
neither).

## No confirm band unless needed

No confirm band is pre-registered. If the verdict needs one
(e.g. a borderline classification that a second seed band
would settle), pre-register it in a prereg amendment BEFORE
running it, with its own GO threshold — never run it first
and justify later.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
