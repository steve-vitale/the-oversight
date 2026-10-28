# sim-w4convert-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0416Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4convert-a. Backlog #1267.
Worktree: `~/workspace/worktrees/sim-w4convert-a` (branch
sim-w4convert-a).
CENSUS / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no meeting-rate change, no lethality re-judgement.
This arm does NOT re-judge the lethality corpus or re-score the
lethality verdict, and does NOT touch meeting rates or any game
lever. The deliverable is knowledge: the wave-4 encounter -> kill
conversion census. Documentation IS the deliverable; no game
change lands from it.

## Question

Across recent bands wave-4 kills are ~0 (vetsurvive: 1 kill per
8-seed band, 3/24 seeds; lethality arms: 0 kills on 75101-75108).
The question moves upstream from killer survivorship: why do
villages meet wave 4 and kill nothing, or never meet it? Census,
per seed, by channel: faced -> engaged -> killed. Killer identity
(scholar/player vs villager, backlog #1268) is a first-class field,
and faced kinds per seed are reported.

## Base — stated explicitly (verified before this prereg was written)

- Base commit at worktree creation: bcf137c40 ("sim-onceaday-b
  evidence: report, det-gate pair, balanced panels + compare (all
  deltas 0)").
- The w4damage base 3264dbb80 IS an ancestor of bcf137c40
  (verified with `git merge-base --is-ancestor`). This band is
  therefore POST-w4damage code, and base drift between the
  w4damage corpus and this band is POSSIBLE and EXPECTED to be
  handled by re-derivation, not assumed away. If master moves under
  this run, rebase inside this worktree, re-run the proof, and
  report the move — never merge master in, never touch the main
  tree, never touch a sibling lane.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 = the Mirror
  Draft, gate village standing >= 100; bands anchored: damage
  35-95, HP 850-1500, pierce 0.2-0.5; "a 4-6 round fight for a
  godhood build (~220 dmg/round)"; combat-readiness gates the
  standing unlock: wave 4 needs 3 armored (P >= 10), 5 armed,
  3 tricks, 1 veteran with a wave-3+ kill; villager kills score
  the ledger exactly like the player's; engagements feed the
  endgame deed bars only, never wave unlocks).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the
  code reading governs the census and the difference is reported.
- Deed-feed note (code-read, progression.js recordDeedFight):
  deedState().wavesFaced is TYPE-level, value = wave number
  (not a count): a key with value 4 means that monster TYPE was
  fought blow-by-blow at least once. It is a cross-check on
  faced types, never an instance count and never a kill count.

## Prior evidence read first (this arm's definitions come from these)

- evidence/2026-10-28/sim-w4damage-a.md + sim-w4damage-a-prereg.md
  (the substrate below is VERBATIM from that prereg; the
  instrument stack below is the w4damage stack reused verbatim,
  plus one sweep-side read-only scholar-history capture, see
  "New instrument").
- evidence/2026-10-27/sim-w4lethality-rebase.md (the lethality
  corpus: 0 kills on 75101-75108; NOT re-judged here).
- Prior-band spot reads (w4damage corpus only, used to DEFINE
  the census, never as this band's result): on 75106/75108 every
  wave-4 field fight ended vFlee or vDie (never vKill, never
  mFlee), and every world-origin wave-4 TB fight ended 'lost'.
  Those are the patterns this census is built to count, not
  findings claimed in advance for this band.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, CENSUS: scripts/policies/tableseat-nowait.js
  VERBATIM (never edited), env LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1 (TABLEDEFIANT unset), PLUS recorder
  on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1, TBDMG=1 (via the tbdmg-rebase-diag
  copy), PLUS W4DMG=1 (w4damage-diag).
- NEVER edited: tableseat-nowait.js, any existing recorder file,
  or any src/js file. New files only (one sweep copy, one
  analyzer, one sense script, see below).
- Recorders reused verbatim, policy-side only: raftdraft-diag,
  spawnsrc-diag, oldcore-diag, w5births-diag, defwound-diag,
  nonworldkill-diag, tbdmg-rebase-diag, w4damage-diag. No
  recorder draws RNG, throws into the engine, or returns
  anything but the original value.

## New instrument (this arm only, policy-side, zero src/js)

- scripts/test-w4convert-sweep.js (copy of
  test-w4damage-sweep.js, differing ONLY in corpus dir
  (evidence/2026-10-28/perseed-w4convert-a/), labels, loadGame
  mode label, and ONE sweep-side addition: the runOne daily
  wrapper records a read-only scholar history — {day,
  scholarId} from the Game.villagerId property read, once per
  day, appended to the row as scholarHistory — so killer
  classification survives scholar succession instead of using
  only the end-of-run scholar id. A property read cannot move
  RNG; the detgate below proves neutrality, and parity vs the
  w4damage corpus proves the addition changed nothing. The
  original w4damage sweep is untouched).
- scripts/test-w4convert.js (new analyzer, proof validator):
  builds the per-instance census from the corpus rows (no
  re-simulation), validates rows, checks parity vs the w4damage
  corpus, and prints the conversion table + per-seed census +
  verdict. Exit 0 only when the judged legs below pass; any
  leg failure exits 1 with the leg named.
- scripts/test-w4convert-sense.js (non-measured replay only,
  same say/sysSay tap pattern as test-w4damage-sense.js;
  replay text never enters any count, and the replay
  trajectory shift is stated, not hidden).

## Census definitions (BINDING — the analyzer implements exactly these)

UNIVERSE: every spawnsrc fresh spawn with wave == 4, keyed by
its spawnsrc seq. A scripted-titan herald spawn counts as a
spawn and is flagged as such, never silently dropped. Re-entries
(fled-monster recovery, TB lingerer restore) are NOT new
universe members — they re-attach to their birth seq.

FACED (instance-level): the seq appears in >= 1 of:
  (a) a defwound resolve row (field or raid context);
  (b) a w4damage fieldFight row;
  (c) a w4damage raidTick change row (drafted to Haven — the
      raid-faced record; a drafted raider with no defender
      fight row is still raid-faced, and is counted as such);
  (d) a nonworldkill world-origin start whose tileMonster.seq
      == seq (TB-faced);
  (e) an oldcore tbEnd with seq (TB-faced, redundant with (d)).
  An instance's channel set is the union of channels that
  touched it. Channels, as the engine actually records them:
  field = defwound/w4damage context 'field' (caller class
  resolve / aid / patrol / sortie / villager-agency / other
  reported from the w4damage caller field); raid = defwound
  context 'raid' OR a raidTick change row; TB = a
  nonworldkill/tbdmg/oldcore TB join. No other channel names
  are invented; anything matching none of the above is
  reported as 'other' with its record cited, never folded
  into field/raid/TB.

ENGAGED: faced AND >= 1 fight row with rounds >= 1 in any
channel (defwound/w4damage rounds, or a TB fight whose tbdmg
final round >= 1). A rounds-0 row is faced-but-NOT-engaged
(the defwound doc's phantom meeting: a re-meet that costs
zero rounds is a meeting, not a fight).

KILLED: >= 1 of: a field/raid fight row with outcome vKill
for the seq; an oldcore removal with kind containing 'kill'
for the seq; a TB kill — a nonworldkill-joined tbEnd with
result 'won' AND the monster fighter hp <= 0 / alive false
/ fled false. (TB 'routed' is NOT a kill: the monster fled
or the fight routed with the monster alive.)

KILLER IDENTITY (first-class, per kill):
  - Field/raid kill: the defwound/w4damage vid, verbatim,
    classified scholar vs villager by the scholar history:
    vid == scholarId on the kill day => scholar, else
    villager. The vid is always printed; the classification
    is never printed without it.
  - TB kill: 'scholar-led TB party' — the recorders carry
    fighter keys (p + villager allies) but no killing-blow
    attribution, so no individual is named for a TB kill;
    the fighter-key list is printed instead. Naming an
    individual for a TB kill would be invention.
  - A kill with no attribution in any record (e.g. a
    removal-kind kill with no matching fight row) is
    'unattributed' AND counts toward unclassified (see GO
    rule) — it is not silently assigned to a channel's
    usual killer.

NEVER-MET vs MET-BUT-NO-KILL (the split the task asks for):
  - never-met = universe member with zero faced records,
    broken by end-state: still-present at end (in the
    oldcore finalPresent list) / removed without a fight
    (removal kind cited) / vanished (neither present nor
    removed — must be 0, or each vanished seq is named).
  - met-but-no-kill = faced member with no kill record,
    broken by channel set and by last outcome (last field
    outcome, last TB result, raid-drafted-only flag) and
    by end-state.
  - Conversion rates are reported per channel as
    faced -> engaged -> killed, where a channel's faced
    count is instances touched by that channel, its
    engaged count is instances engaged through that
    channel, and its killed count is instances killed
    through that channel. An instance touched by two
    channels counts in both channels' faced counts but
    once in the band total — the per-channel rows sum
    ABOVE the band total when instances multi-touch,
    and that is stated, never hidden.

NON-WORLD WAVE-4 FIGHTS (reconciliation, not census):
nonworldkill wave-4 starts whose origin is not world-origin,
or whose tileMonster.seq is null or mismatches the argued
monster, are counted separately as non-world wave-4 TB
fights. They are faced in the deed sense (a type was fought)
but are NOT world instances and must NOT inflate the world
census. The deed-faced wave-4 type set per seed is reported
alongside, so a seed with deed-faced types but zero world
spawns (e.g. a contest/feast wave-4 fight) reconciles
instead of looking like a census miss.

FACED KINDS PER SEED: (1) spawn-source distribution over the
universe (tile-entry / maintain / wanderer-contact /
scripted-titan / other / unknown, as spawnsrc classifies
them); (2) deed-faced wave-4 type set; (3) encounter-channel
counts (field / raid / TB / multi-touch).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: census completeness on the current base.

GO RULE (CENSUS, judged ONLY against this prereg):
  GO = 8/8 seeds complete (row per seed, days > 0, every
  recorder clean: errs 0, no overflow) AND every wave-4
  faced instance classified faced/engaged/killed with
  channel + killer identity AND unclassified faced
  instances = 0 AND conversion rates by channel reported
  AND at least one mechanism hypothesis for zero
  conversion grounded in the counts (not a lever claim).
  DIAG-NO-GO = unclassified > 0, with the gap named
  (which instances, which record is missing).
  NO-GO is NOT a verdict about kills being low: a complete
  census showing 0 kills is a GO census with a 0-conversion
  finding. A kill-rate disappointment is never re-scored
  as a census failure, and a census gap is never hidden
  behind a low kill rate.
  No confirm band unless a census gap needs a re-proved
  instrument — then the confirm band is pre-registered
  BEFORE running it (seeds, horizon, GO threshold), never
  run first and justified after.

DETGATE (pre-sweep STOP gate): seed 75101, baseline (plain
tableseat-nowait, no recorders) vs wrapped (ALL recorders
composed, every on-switch UNSET, including W4DMG): days,
gameDays, and tsNationalDay must be equal, with no diag ctx
surface and no wraps installed. The old detgate numbers
were 132/132 days, tsNationalDay 77. If base drift moved
those numbers on the CURRENT base, DO NOT force the old
numbers: prove same-base neutrality the way sim-waitlong-a
did — run the PRIOR instrument stack (the w4damage stack,
recorders-OFF) on this base and show it diverges identically
(same new numbers) — and disclose the amendment loudly in
the evidence file (old numbers, new numbers, prior-stack
check result). Detgate PASS on this base's own numbers,
with the amendment disclosed, is a PASS; detgate FAIL
(baseline != recorders-OFF on this base) is a STOP. If the
detgate differs from 132/132/77, STOP and report the
divergence before judging any sweep — do not judge a
diverged corpus.

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
lethality verdict or the w4damage verdict/corpus.

SUBSTRATE-ACTIVATION GATE (binding, same as both
predecessors): band courtship combined > 0 AND >= 6/8 seeds
with non-zero combined courtship. If the gate FAILS, the
sweep is INVALID (not NO-GO): no verdict is judged, the
failure is reported loudly, and the run stops for an env
fix. Expected from the w4damage band: combined 121, 8/8
active.

SENSE RULE (binding): sense seed = the seed with the most
faced wave-4 instances on THIS band's corpus (tie -> lowest
seed) — a deterministic rule, not a narrative pick. Window
= that seed's first wave-4 faced day minus 10 to last
wave-4 faced day plus 10, from THIS band's corpus, capped
at the seed's actual end day. The sense note reads ONE
faced-but-not-killed wave-4 encounter from that window
(field or TB, whichever the window's first faced-not-killed
instance is) in plain words: what the village actually did,
round by round as the beats tell it. Non-measured narration
replay (say/sysSay taps); replay text never enters any
count, and the replay trajectory shift is stated, not
hidden.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
pilot for a census. If its completeness gates pass, it is
the judged band. If parity fails, that is a diagnosis to
report (see PARITY RULE), not a reason to re-sweep fresh
seeds silently. If the gap is a pure instrument bug that
can be fixed and re-proved, the fix, the re-proof, and the
re-sweep are all disclosed, and the original failed pilot
rows are kept, never overwritten silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare and
record the outcome. The known scorecard TypeError failure
mode is documented in prior arms — if it fails the same
way, say so and use the paired sweep-compare tables (this
band vs the w4damage corpus, identical seeds/policy/
substrate) as the section-15 substitute. No panel artifact
will be faked. Note: this arm changes nothing in the game,
so the panel is expected to show zero movement; a
non-zero panel delta would itself be a parity failure to
investigate.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall baseline,
metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-w4convert-a/*.json), report LOUD
lines with verdict, do NOT roll the baseline on an
unexplained LOUD line (the baseline's WINSEAT regime
forbids comparing it to a tableseat-nowait census substrate,
and per-seed rows carry nationalEver/entered/won, not
top-level national/table/wins paths — say which artifact
class applies, or investigate if a line fits neither).

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
