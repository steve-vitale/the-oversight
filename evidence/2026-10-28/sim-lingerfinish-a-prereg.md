# sim-lingerfinish-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0634Z. Axis: scale-onramp
(the blocking axis). Worker: sim-lingerfinish-a. Tracker blank 1:
WOUND-SELECTIVE LINGERER FINISHING composed with the
tableseat-nowait substrate, judged on finishes against the
linger-vis control (evidence/2026-10-28/sim-lingerer-vis-a.md:
engaged 36, finished 11, all 11 scholar TB wins, villager field
finishes 0/40).
Worktree: `~/workspace/worktrees/sim-lingerfinish-a` (branch
sim-lingerfinish-a). Base: master 3cb5f8b82 (already contains
the world-HP TB rule, sim-w4tbkill-a phase B GO, and the
wallwounds lingerer-restore cap). The coordinator owns the loop
claim file and the lock file; this worker neither writes nor
deletes claim files or lock files. Gating code and deed bars
are NEVER touched (Steve 2026-10-27 gating freeze).

## Phase discipline (binding)

PHASE 1 (this arm, policy-side ONLY): scripts/policies/
lingerfinish.js — a policy that wraps tableseat-nowait and, on
each day, answers wounded lingerers through the game's own
verbs: a village sortie (answerLingerer('sortie'), villager
field fights) for treelines the village can plausibly finish,
and a scholar march (travelTo + triggerEncounter, TB fight)
for the most-wounded remaining lingerer. ZERO src/js changes
in phase 1. If phase 1 meets GO, the policy lands as a
default-OFF instrument (landing it as competent play is a
coordinator/Steve call, not this arm's); if it misses GO, the
policy file is DELETED before commit (killed arms leave no
trace) and the verdict is NO-GO stated plainly.
PHASE 2 (only if phase 1 cannot act without a hook, and only
as a separately judged re-proposal): the narrow lingerer
visibility narration clause from sim-lingerer-vis-a (same
class, knowledge-gated display name only, no stats, no
spawn/damage/routing change), with detgate proof and
revert-if-NOGO discipline. Phase 2 is NOT judged here and
must never be silently folded into phase 1's verdict.
Phase 1 vs phase 2 are reported separately, always.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave 4 =
  the Mirror Draft; lingerer siege fiction: a besieging raider
  the scholar fled from or lost to goes back to the treeline;
  "Monster encounters are fought, not rolled", Steve
  2026-10-08 — both channels below are real blow-by-blow
  fights, never outcome tables).
- docs/TABLE.md where relevant (table sanctity: while the
  table sits, raiders hold the treeline but do not gorge —
  both channels hold during tableActive, never engage
  mid-finale).
- No canon invented. The policy uses existing verbs only
  (answerLingerer, travelTo, triggerEncounter, inviteToParty)
  and existing gates (scholar HP, party, pantry, muster).
  "If you don't know, it doesn't show" is respected: the
  policy reads world-monster HP state (the same state
  gorgedrive reads), never a true name, wave number, or
  narration line — no policy parses say-lines or transcripts.

## Code read first (the acting-policy question, answered from code)

- SORTIE (src/js/havenGrowth.js lingererSortie +
  answerLingerer): the village's own played answer — mustered
  fighters (never the player), real rations (2000 kcal per
  fighter), one played fieldFight per lingerer IN TURN, the
  leader fighting wounded from the last one, a fallen leader
  breaking the sortie. NO policy in the substrate calls
  answerLingerer('sortie') (grepped scripts/policies/;
  sortie fieldFights = 0 in the linger-vis corpus).
  LIMITATION (disclosed, drives the gates below): the sortie
  takes NO target argument — it fights ALL lingering raiders
  in world order. A policy can therefore control WHEN a
  sortie fires, never WHOM it fights first. The sortie gate
  below is a whole-treeline gate for exactly this reason.
- SCHOLAR MARCH (scripts/policies/gorgedrive.js pattern):
  travelTo(m.tx, m.ty) + triggerEncounter(m.id), with the
  tile-verification rule (monsterAt(scholar tile) must BE the
  target, never remove the wrong entity), scholar-HP gates
  (>=50% wave 5, >=35% lower waves), and the party gate
  (never alone when villagers could come; invite up to 2
  honest invites, hold if help exists but nobody comes).
  Gorgedrive wraps leadfeast, NEVER tableseat-nowait, and
  sorts haven-tile-first, NOT wound-selective. This arm does
  NOT edit gorgedrive.js or tableseat-nowait.js: lingerfinish.js
  is a NEW file that composes the same march pattern over
  tableseatNowait with wound-selective targeting.
- FIELD DAMAGE (src/js/fieldFights.js): a villager strikes
  roll([4+wb, 8+wb]) per round (wb = round(wbonus/2)) plus a
  ranged volley when armed — roughly a dozen damage per
  round per fighter before the monster's own damage lands.
  A party can therefore plausibly finish a lingerer at a few
  dozen HP in a round or two, plausibly drive off one at
  ~150 HP at real cost, and cannot plausibly finish a
  600–975 HP wave-4 lingerer at 0.75 fraction. The sortie
  gate's numbers (min <= 80, sum <= 300) follow from this,
  not from tuning: 80 HP is ~2 rounds of party damage for
  the weakest lingerer; 300 HP total is the treeline a
  3-fighter party can work through without the leader
  certainly breaking first.
- TB DAMAGE + WORLD HP (sim-w4tbkill-a phase B, in base):
  TB fights now start at the monster's world HP, so a
  toll-wounded lingerer enters TB wounded instead of fresh.
  The scholar's TB channel is therefore the plausible
  finisher for big wounded lingerers (hundreds of HP) that
  no villager party can take — the march target is the
  most-wounded remaining lingerer by fraction, the prey the
  village cannot finish but the scholar might.
- LINGERER HP AT TREELINE (linger-vis control corpus, design
  input only — NOT the judged baseline): 40 toll-wounded
  instances, waves w4 18 / w3 16 / w2 4 / w1 2; 13 at fraction
  <= 0.5, the rest mostly exactly 0.75 (fresh toll only).
  Snapshot days show whole treelines at 1 HP sitting for
  days (e.g. 75101 d112: hushwolf 1/50, sunbasker 1/45,
  paparazzo 1/70) — near-dead lingerers the village never
  answers. Days with any lingerer <= 80 HP: 70 seed-days
  across 8 seeds; days with a whole treeline summing <= 300
  with a <= 80 member: frequent enough to fire (see the
  analyzer's sortie-counter audit, never a pre-claim).
- PANTRY (game.js pantryKcalLive(v)): sortie cost is
  2000 x muster (muster <= 3, so <= 6000). The policy gate
  (>= 12000, i.e. 2x max cost) exists because lingererSortie
  pays whatever _removePantryKcal returns and proceeds
  regardless — the policy is the ONLY affordability check.
- KILLER IDENTITY (finding 1268, open): TB finishes are the
  scholar's fight by construction (fighter 'p' is the
  scholar; party villagers join but the win is the scholar's
  TB fight). Field/resolve finishes carry vid on the event
  row; the analyzer compares vid against the sweep row's
  end-state scholarId (Game.villagerId) and reports
  scholar-field separately from villager-field. LIMITATION
  (disclosed): end-state scholarId can differ from the
  scholar's id at fight time if succession changed the
  scholar mid-run; field fighters are villagers by
  construction of the field engine (scholar fights are TB),
  so a field vid equal to end-state scholarId is reported
  as scholar-field and NOT counted toward leg (c) — the
  conservative reading.

## The policy (stated before it is written; file scripts/policies/lingerfinish.js)

Gate: LINGERFINISH=1. Gate OFF: daily delegates to
tableseatNowait byte-identically (detgate pins this).
Gate ON, once per loop-day, AFTER base.daily, in order:

STEP 1 — SORTIE (villager field channel). Fire at most once
per 6 game days (ctx._lfLastSortieDay; 6 matches the ~6-night
lingerers drift window — one muster per siege cohort), only
if ALL hold:
  (a) lingering monsters exist; min current HP <= 80;
      sum of current HP over all lingerers <= 300.
  (b) >= 2 healthy villagers at home (health > 40, not away,
      not the scholar) — a proxy; the sortie's own muster
      (>= 2) is authoritative and returns no-fighters
      harmlessly if the bench is bare.
  (c) pantry readable AND >= 12000 kcal (via
      pantryKcalLive, else cached pantryKcal, else summed
      pantry items; if all reads fail, HOLD — never march
      on an unreadable pantry).
  (d) NOT tableActive; NOT Game.over; no live TB fight; no
      pendingEncounter; scholar not sleeping, not insideTent.
  On fire: Game.answerLingerer('sortie'); record the return
  (ok/cleared/broke/remaining/paid) in ctx counters. If the
  sortie BROKE (vFlee/vDie), skip Step 2 that day — do not
  compound a broken party with a scholar march.
STEP 2 — MARCH (scholar TB channel). Re-scan lingerers
(post-sortie set). Target = most-wounded by HP fraction
(hp < maxHp required; maxHp from the entity or the monster
def's base HP; tie-break: haven-tile first, then lowest
absolute HP) — RESTRICTED to lingerers that are
first-on-their-tile (monsterAt(tx, ty) === the entity).
ENGINE LIMIT (disclosed, found while proof-testing):
startCombat fights playerMonster() = monsterAt(scholar tile)
= the FIRST world monster on that tile, so a most-wounded
lingerers stacked behind another entity on the haven tile
cannot be the TB target; marching there would fight the
wrong entity. The march therefore picks the most-wounded
among the fightable (first-on-tile) set — wound-selective
within what the engine can actually fight, with the same
no-wrong-entity guarantee as gorgedrive's verification
(which would instead hold on every stacked treeline).
Fire only if:
  (a) a wounded lingerer exists (hp < maxHp).
  (b) scholar HP >= 50% for wave-5 targets, >= 35%
      otherwise (wave from the def, as gorgedrive).
  (c) party gate as gorgedrive: if no companions and
      healthy villagers at home with trust >= 20 exist,
      invite up to 2 honestly; if help exists but nobody
      comes, HOLD; if nobody exists, engage alone.
  (d) one answer per monster id per game day (ctx key
      id+day; INHERITED gorgedrive pattern — id-keyed, not
      seq-keyed, so two same-type lingerers on one day share
      the key; disclosed, not silently fixed).
  (e) same sanctity/guards as Step 1.
  On fire: travelTo(target tile) if needed, verify
  monsterAt(scholar tile) === target, else verify-failed
  counter and stop; triggerEncounter(target.id); say one
  honest march line (same shape as gorgedrive's, naming the
  knowledge-gated display name, never a stat).
Counters (ctx, captured into the sweep row as lf.*):
lfDaysSawWounded, lfSortieCalls, lfSortieCleared,
lfSortieBroke, lfSortieHeld* (reason counts), lfMarchEngagements,
lfMarchHeld* (reason counts), lfMarchVerifyFailed.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Baseline band: scripts/policies/tableseat-nowait.js VERBATIM
  + the w4damage recorder stack VERBATIM (raftdraft-diag,
  spawnsrc-diag, oldcore-diag, w5births-diag, defwound-diag,
  nonworldkill-diag, tbdmg-rebase-diag, w4damage-diag) with
  on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1, TBDMG=1, W4DMG=1.
- Armed band: IDENTICAL recorder stack + the lingerfinish
  policy (LINGERFINISH=1) composed over tableseatNowait.
  The ONLY difference between bands is the policy.
- Env (both bands, full set): LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT unset, plus the recorder
  switches above; armed adds LINGERFINISH=1.
- Sweep driver: NEW file scripts/test-lingerfinish-sweep.js
  (a copy of scripts/test-w4damage-sweep.js differing ONLY
  in corpus dir, labels, row filename policy tag, the base
  policy per band, and the lf.* ctx capture — the original
  is untouched). Rows are s<seed>-armed.json in BOTH dirs
  (recorder-armed rows; the band dir, not the filename,
  carries the policy difference — same convention as
  linger-vis). CONTROL corpus ->
  evidence/2026-10-28/perseed-lingerfinish-a/control/,
  ARMED corpus -> .../armed/.
- NEVER edited: tableseat-nowait.js, gorgedrive.js, any
  existing recorder file, or any existing sweep/analyzer
  file. New files only: scripts/policies/lingerfinish.js,
  scripts/test-lingerfinish-sweep.js,
  scripts/test-lingerfinish.js (analyzer / proof validator),
  scripts/test-lingerfinish-proof.js (unit + detgate-construction
  proof), scripts/test-lingerfinish-sense.js (sense replay,
  NON-MEASURED, sortie/march-line presence only),
  this prereg, the evidence file, the corpus dirs.
- Seeds 75101-75108, horizon 180d DEATH-AWARE (runDays stops
  on death/win; +10d tail max). The 8-seed band IS the pilot
  and the judged band (MEASUREMENT.md §§9-12). NEVER a fixed
  200d without justification; none is claimed here.

## Census definitions (BINDING — the analyzer implements exactly these)

Reused VERBATIM from linger-vis (same analyzer logic, new
judging + killer-identity reporting):
- TOLL-WOUNDED LINGERER INSTANCE (per seed, per spawnsrc seq,
  per toll day): (1) a w4damage raidTick changes row with
  tollExact=true and wall > 0 for that seq; AND (2) a
  w4damage daily snapshot on/after the toll day with
  lingering=true for that seq. Linger-start day = first such
  snapshot.
- ENGAGED (instance, day STRICTLY AFTER the toll day): any
  w4damage fieldFight row, defwound resolve row, nonworldkill
  start (tileMonster.seq), or oldcore tbEnd row for that seq.
  Instances counted once.
- FINISHED (instance, day STRICTLY AFTER the toll day):
  fieldFight vKill, defwound resolve vKill, or tbdmg tbEnd
  result 'won' joined by fightId to a nonworldkill start with
  tileMonster.seq == seq. Oldcore removals are corroboration
  only, never a primary finish.
- WAVE (per instance): the spawnsrc spawn wave for that seq
  (first spawn row with that seq); instances with no spawn
  wave are reported as wave-unknown and excluded from leg
  (d) only, never silently assigned.
- KILLER CLASS (per finish): field/resolve finish with
  vid == row end-state scholarId => scholar-field; field/
  resolve finish with vid != scholarId (or scholarId null)
  => villager-field; TB finish => scholar-TB (by
  construction). Field finishes with caller 'sortie' are
  reported as a sub-count of villager-field (the sortie's
  own proof), never as a separate GO leg.
- NEVER counted: raid-night defender fights on the toll day
  itself; engagements/finishes of non-toll lingerers;
  engagements/finishes of toll-wounded non-lingerers;
  sense-replay text (never enters any count).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: finishes of toll-wounded lingerer instances, ARMED
vs BASELINE on identical seeds, split by killer class.

GO RULE (judged ONLY against this prereg, ALL legs must pass;
a miss on ANY leg is NO-GO and the policy file is DELETED
before commit — killed arms leave no trace):

  (a) BAND VALIDITY: 8 rows per band, every recorder clean
      (errs 0, no overflow), analyzer exit 0.
  (b) SUBSTRATE GATE on both bands (else that band is
      INVALID, not NO-GO, and the run stops for an env fix):
      courtship combined > 0 AND >= 6/8 seeds active.
  (c) VILLAGER FIELD FINISHES (the deciding leg): villager-
      field finishes (field + resolve, non-scholar vid, as
      defined above) ARMED >= BASELINE + 2. Baseline is
      expected to be 0 (linger-vis: 0/40) but the FRESH
      baseline is the judge, never the old corpus number.
  (d) WAVE-4 FINISHES: total wave-4 toll-wounded lingerer
      instances finished via ANY channel ARMED > BASELINE.
  (e) COST BAR: starvation deaths (ARMED total) <=
      starvation deaths (BASELINE total) + 2; starvation
      deaths among ARMED-only dead seeds (seeds dead in
      ARMED but not dead in BASELINE) <= 2; median survival
      (ARMED) >= 0.8 x median survival (BASELINE).
  (f) DETGATE: lingerfinish OFF + recorders OFF delegates
      byte-identically to plain tableseatNowait on 75101
      (days, gameDays, ts equal, no lf.* ctx surface, no
      wraps installed). The sweep's --detgate mode pins it.
  (g) KILLER-IDENTITY REPORTING: the analyzer prints the
      scholar-TB / villager-field / scholar-field split per
      band as a first-class table; a missing split is an
      analyzer failure, not a pass.

  NO-GO handling: delete scripts/policies/lingerfinish.js
  (and any sweep-driver-only references that would break
  without it — the driver must still run its baseline mode
  cleanly), leave evidence + analyzer + corpora committed,
  and say NO-GO plainly with the failing leg named. Do NOT
  silently switch to a narration clause, a different gate,
  or a second policy; phase 2 (narration clause) is a
  separately judged re-proposal, never this arm's rescue.

SENSE RULE (binding): non-measured replay only, using the
new scripts/test-lingerfinish-sense.js (same say/sysSay tap
pattern as test-lingerer-vis-sense.js VERBATIM in method, new
file for the sortie/march line regexes). Replay text proves
wording and presence only, never counts, and any replay
trajectory shift vs the judged corpus is stated, not hidden.
The sense questions: when the village sorties, does the
march read like people deciding to finish a hurt beast at
their treeline — and does any line contradict the wound,
the cost, or the risk (a sortie that reads free, or a
scholar march that reads certain)? Plus the one-encounter
plain-words read: read ONE sortie or march from a
non-measured replay in plain words; replay text never
enters any count.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed BASELINE band
is run first and judged for band validity (leg a) +
substrate gate (leg b) + detgate (leg f) before the armed
band is judged. If the baseline band is INVALID, the armed
band is not judged and the run ends INVALID-band, reported
as such. Instrument bugs found in the pilot are fixed,
re-proved, and disclosed, with original pilot rows kept,
never overwritten silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare and
record the outcome. The known limitation is documented in
prior arms (no corpus-ingest mode for a single-arm census
corpus; the tool compares panel files from live roots, not
census rows). If it fails the same way, say so explicitly
(standing exception: no corpus-ingest mode) and use the
paired before/after sweep tables + analyzer outputs (this
band vs itself, identical seeds/policy/substrate except the
judged policy) as the section-15 substitute. No panel
artifact will be faked.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall baseline,
metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-lingerfinish-a/control/*.json and
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
