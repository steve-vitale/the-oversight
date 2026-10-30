# sim-refusalsay-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1427Z, worker
sim-refusalsay-a. Axis: scale-onramp (blocking axis, converging,
NOT converged). Finding #1539, from run fleshout-20261030T1315Z
arm sim-dissolveprobe-a (evidence/2026-10-30/sim-dissolveprobe-a.md):
the 120 "dissolved" herald fights are TITAN-ENTRY-GATE REFUSALS
(solo scholar Herald face refused by the titans.js startCombat
wrapper before core startCombat runs — 4-event probe logs, zero
live fights), but muster-branch identification still rests on code
elimination because say text was never captured, so NO have/need
number per row may be quoted yet. This arm closes that last inch:
capture the gate say text on each refusal row and re-judge under
this revised prereg only.

DIAG ONLY. No game change, no src/js change, no gate move, no
deed-bar move, no default flip. The instrument is a NEW policy-side
recorder layering on top of the untouched scholarmelt recorder
(zero edits to scripts/policies/dissolveprobe-diag.js,
scripts/policies/scholarmelt-diag.js, or any game file). If
implementing the instrument would change game behavior, STOP and
report that instead of landing a behavior change. No [needs-eyes]:
this arm changes no feel, combat, or UI — it only records.

The prior run's DIAG-NO-GO on its own bars stands as history. This
run judges ONLY under the revised bars below. No GO from the prior
run's bars is claimed here, and no bar below is re-scored mid-run
(docs/MEASUREMENT.md §14: pre-registered metrics bind the run; a
miss is NO-GO, never re-scored against a friendlier metric; doubts
go under "metric review" in the evidence file, and every evidence
file carries a "metric review" section).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; the dissolved
population is wave-4 herald titans). NO CANON-registered doc covers
a scholar-fight dissolve specifically, and no canon doc covers the
titan entry gate's say text — the gate mechanism below is read from
code (titans.js startCombat wrapper, finale-campaign.js
titanEntryGate) and stated exactly so it can be checked, and is NOT
canon. docs/ABILITY-REFUSALS.md covers ability-action refusals, not
titan entry gates, and is not a source for this arm's gate text.

## Mechanism, read from code (leads, NOT findings)

- titans.js startCombat wrapper, for a titanDef mid: it asks
  Game.titanEntryGate(titanId). finale-campaign.js titanEntryGate
  returns null for every titanId except 'finale' — so for herald
  there is NO campaign override, and the flat hard gate applies.
- The hard gate checks titanMusterReady('herald'): mustered allied
  blades + committed Haven blades >= minAllies (10, from
  src/data/titans.json herald def). Failing it, the wrapper calls
  Game.say('⛔ ' + def.title + ' does not notice you the way prey
  notices a hunter. It notices you the way weather notices a
  field. You cannot face this alone — sound the call, muster ' +
  def.minAllies + ' allied blades (you have ' + have + '). This
  is not courage. This is arithmetic.'), records
  titanRecordOutcome(titanId, 'refused', {gate: 'muster', have,
  need}), and returns null WITHOUT calling core startCombat.
- For 'finale' only, a campaign refusal says a campaign reason
  instead (node-order text with no numbers, or a surviving-blades
  floor text with numbers) and records gate 'campaign'.
- Node sims stub Game.say/sysSay to no-ops in sim-harness.js, but
  the probe wraps Game.say AFTER load, so the wrapper still
  captures the first argument at the wrap layer even though the
  delegate is a no-op. Capturing say arguments therefore changes
  no game trajectory: the delegate, the return value, and the RNG
  stream are untouched.
- The prior probe recorded say ENTER/EXIT events without their
  arguments, so its log proves a one-say refusal but carries no
  have/need numbers. This arm adds first-argument capture to say /
  sysSay window events and nothing else.

## The build (NEW files only)

- `scripts/policies/refusalsay-diag.js` (new; zero edits to any
  existing recorder, policy, or game file): a policy-side in-call
  probe, gated by REFUSALSAY=1, installed at sweep setup + daily
  hook AFTER the scholarmelt install (same position the
  dissolveprobe occupied; DISSOLVEPROBE is NOT set and the
  dissolveprobe is NOT installed in this sweep, so its
  removeWorldMonster wrap cannot re-enter the stack).
  Same discipline as the other recorders: delegate, record after,
  never throw into the engine (recording errors are counted, an
  engine throw is recorded and RETHROWN unchanged), draw no RNG,
  write nothing to game state (the event log lives on the
  scholarmelt meeting row + the probe store's diag, never on
  Game), return the original value untouched.
- Wrapped functions (each guarded by typeof-function at install; a
  missing function is a counted probe diag error, never a crash):
  startCombat (window bracketing only), tbBeginTurn, tbAdvance,
  tbEnd, tbEndCheck, tbBarrierExit, tbMonsterTurn, tbVillagerTurn,
  tbRoundWrap, tbDamage, maybeCheatDeath, playerDeath,
  identifyMonster, combatWitnessReact, villageEvent, observe,
  playerMonster, tele, say, sysSay, audioEvent, plus S.Godpath
  beginApexHunt / observeApexHunt / finishApexHunt /
  finishWardRescues / finishTacticalEscape when present at
  install time. NOTE THE DELIBERATE OMISSION: removeWorldMonster
  is NOT wrapped. Its body-gap information was marginal and its
  stack cost is proven (the prior run's substrate leg failed on
  exactly its one-frame shift of the removal recorder's 8-frame
  stack window). Wraps outside an active startCombat window are a
  fast pass-through (flag check only).
- Event record (per wrapped call, entry + exit): fn name, phase,
  callStack snapshot (the probe's own nesting of wrapped calls
  inside this window, innermost last), tbfight state ('null' |
  'live' | 'over'), fight result, turnIdx, round, fighter counts
  (total, monsters alive, monsters fighting), player fighter HP,
  current fighter key. ADDITIONALLY, on say / sysSay ENTER events
  only, `argText`: the first argument stringified and truncated
  to 1000 characters (the titan gate text is ~230 characters; no
  other function's arguments are captured). On the FIRST event
  where the state leaves 'live' (to 'over' or 'null'), the record
  additionally carries stackNames: the Error stack parsed to
  FUNCTION NAMES ONLY (file paths, line numbers, and worktree
  slugs are stripped — a stack name containing '/' is dropped),
  so the corpus carries no filesystem paths from this probe.
- Window close: the claimed-set attach rule (binding, below).
  The buffer is capped (2000 events per window; overflow is
  flagged, never silently truncated into a false bracket). The
  probe store itself is NOT serialized into the corpus row; only
  its diag counters ride inside the scholarmelt diag literal (see
  sweep delta), so the substrate leg (row-minus-scholarmelt) is
  unaffected by construction.
- `scripts/sweep-refusalsay-a.js` (new): VERBATIM copy of
  scripts/sweep-dissolveprobe-a.js with exactly these deltas:
  default EVID dir perseed-refusalsay-a; header comment updated;
  REFUSALSAY=1 set in runOne alongside the other env flags and
  DISSOLVEPROBE NOT set; refusalsay install at setup + daily
  AFTER the scholarmelt install (replacing the dissolveprobe
  install lines); the scholarmelt diag literal extended with
  `refusalsay: { errs, errors, overflow, installed, windows,
  attached }` (INSIDE the scholarmelt field — stripped by the
  substrate comparison, so the substrate leg still tests the
  game, not the probe) instead of the dissolveprobe literal.
  Summary-mode validity additionally requires refusalsay errs 0,
  overflow empty, installed true, and windows > 0. Every other
  line is byte-identical to the dissolveprobe sweep, including
  seeds, 180d death-aware horizon, tableseat-nowait policy, and
  env LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  W4DPR=1, BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1,
  REMOVAL=1, SCHOLARMELT=1, DRAFTFLAG=1.
- `scripts/analyze-refusalsay-a.js` (new): REUSES the
  dissolvecause analyzer's analyze() by require for
  classification, cause/HP coverage, substrate, and wall numbers
  (never re-implemented), reuses the dissolveprobe analyzer's
  computeBracket() by require for live-window rows (call/gap,
  never re-implemented), and adds the refusal-bracket analysis
  (rule below), the gate parser (rules below), the
  frame-reconciled substrate diagnostic (below), and the
  confirm-band substrate n/a handling (below). Fixtures:
  scripts/test-refusalsay-a.js.

## Refusal bracket rule (binding)

For each dissolved row carrying a probe log, in order:

- everLive = any event with state 'live'. sayCalls = the number
  of say / sysSay ENTER events in the window. sayTexts = their
  argText values in order. tbEndSeen = any event with fn 'tbEnd'.
  exitState = the startCombat exit event's state.
- If everLive is true, the row is NOT a refusal: judge it with the
  prior computeBracket rule (call / gap / unbracketed reasons
  'no-null-event', 'missing-log'), reported as such.
- If everLive is false AND sayCalls == 1 AND exitState == 'null'
  AND tbEndSeen == false, the row takes the REFUSAL bracket:
  windowKind = 'refusal', windowCall = 'refusal:' + gate (gate
  per the parser below), windowContext = the parsed titan title
  when present, else null. tbEndSeen and the event count are
  reported alongside.
- Otherwise the row is UNBRACKETED with reason: 'missing-log'
  (no probe log or empty events), 'never-live-no-say'
  (everLive false, sayCalls == 0), 'never-live-multi-say'
  (everLive false, sayCalls != 1), 'refusal-exit-not-null'
  (everLive false, sayCalls == 1, exitState != 'null'),
  'refusal-tbend-seen' (everLive false, sayCalls == 1, tbEndSeen
  true). UNBRACKETED rows and rows with no probe log do NOT count
  toward any bracket rate.
- A bracket COUNTS toward the bracket rate iff windowKind is
  'refusal', 'call', or 'gap'. The refusal distribution is
  reported in full: every gate value with counts, and for every
  refusal row its parsed have / need (or null) and its say text.

## Gate parser (binding)

Applied to sayTexts[0] (the single say call's text) for refusal
rows, in order:

- MUSTER: /muster (\d+) allied blades \(you have (\d+)\)/ matches
  → gate = 'muster', need = group 1 as integer, have = group 2
  as integer, gateSource = 'say-text'. Titan title, when present,
  is parsed by /^⛔\s+(.+?)\s+does not notice you/ → windowContext.
- CAMPAIGN-FLOOR: /demands (\d+) surviving blades — the march
  has (\d+)/ matches → gate = 'campaign', need = group 1, have =
  group 2, gateSource = 'say-text'.
- CAMPAIGN-NODE: /THE HEART is not here yet/ matches → gate =
  'campaign', have = null, need = null (no numbers in the text;
  gate identified, have/need not applicable), gateSource =
  'say-text'.
- Otherwise, if sayTexts[0] is a non-empty string → gate =
  'unknown-say', have = null, need = null, gateSource =
  'say-text-unparsed'. This counts as a refusal bracket but NOT
  as a gate-identified row.
- Otherwise (say event exists but argText is missing or empty —
  an instrument capture failure, not a game fact) → gate =
  'elimination', have = null, need = null, gateSource =
  'elimination'. Elimination may name 'muster' as the branch
  ONLY for intendedMid 'herald' (titanEntryGate null for herald,
  so the muster branch is the only branch that can refuse
  herald); for any other intendedMid the elimination value is
  'elimination-unknown'. Elimination rows count as refusal
  brackets but NOT as gate-identified rows, and NO have/need
  number may be quoted from an elimination row.

## Claimed-set attach rule (binding)

The install closure holds a `claimed` set of scholarmelt meeting
row objects (object identity, never serialized). Each startCombat
buffer records at entry: entryRows (the set of meeting objects
present), entryMaxSeq (the maximum fightSeq present, or -1), the
entryMaxRow (the row with entryMaxSeq, or null), and
entryMaxRowOpen (whether entryMaxRow.result == null at entry).
At window close, the buffer claims every meeting row r such that
r is NOT in `claimed` AND (r is NOT in entryRows OR (r ===
entryMaxRow AND entryMaxRowOpen)). Claimed rows are added to
`claimed` and counted in store.attached. Cases, stated so the
fixtures can check each:

- Probe OUTSIDE recorder (the sweep order): the new row is pushed
  by the recorder pre AFTER the probe entry, so it is not in
  entryRows → claimed. Exact.
- Probe INSIDE recorder (fixture order only): the new row is
  pushed by the outer recorder pre BEFORE the probe entry, so it
  IS entryMaxRow with result null at entry → claimed. Exact.
- Nested startCombat windows: the inner buffer closes first and
  claims its row; the outer buffer's close skips it via
  `claimed`. The outer window's true log is therefore never
  attached to the inner row, and vice versa.
- Orphan-end rows (a tbEnd for a fight whose start was not
  recorded, created OUTSIDE any probe window): present at the
  next window's entry, with a result already recorded (not the
  entryMaxRow, or not open) → NOT claimed by that window. The
  prior arm's attached-exceeds-windows orphan leak is closed by
  this rule.
- A pending dissolved row left over from an earlier window was
  already claimed by its own window's close → skipped via
  `claimed` at every later window.

## Corpus and substrate (binding)

- Pilot sweep: seeds 75101-75108, 180d death-aware horizon,
  tableseat-nowait policy, env as in the sweep delta above.
  EVID: evidence/2026-10-30/perseed-refusalsay-a/ (fresh dir;
  the dissolvecause, draftflag, and dissolveprobe corpora are
  READ-ONLY and untouched).
- Confirm sweep (ONLY if the pilot meets its revised bars):
  seeds 75117-75128 (12 seeds, fresh to this arm — the
  75109-75116 band is NOT used as the confirm band because the
  dissolvecause corpus already shows it contains ZERO dissolved
  rows, so it cannot confirm say-text capture on any refusal).
  EVID: evidence/2026-10-30/perseed-refusalsay-a-confirm/.
  The confirm band has NO draftflag comparator corpus, so the
  substrate leg is NOT judged on the confirm band (reported as
  not-applicable there, never as a pass); the pilot substrate
  leg stands as this arm's substrate verdict. Confirm validity
  is judged on per-seed validity + census shape only.
- Substrate leg (pilot seeds only), written as "identical modulo
  recorded filesystem paths AND recorder wrapper frames" from
  the start: row-minus-scholarmelt vs the draftflag corpus rows
  on pilot seeds, judged by the analyzer's normalized comparison
  (worktree paths normalized, as in the dissolvecause analyzer)
  OR by its frame-reconciled comparison — the frame-reconciled
  comparison passes a seed ONLY when a recursive diff of the
  normalized stripped rows shows ZERO differences outside
  removal-stack frame/func text (every diff path must lie under
  a `.stack.` field, and the reconciliation must name the
  stripped frames as probe/recorder wrapper frames). Any game
  field difference (HP, days, counts, meetings, census values)
  fails the leg outright, on either comparison. Census files
  byte-identical on pilot seeds is required separately under
  both comparisons. Both the normalized result and the
  frame-reconciled result are reported per seed; the leg judges
  the OR, with the reconciliation evidence attached — never a
  bare claim.
- DISSOLVED POPULATION — every scholarmelt meeting in the fresh
  corpus with result 'dissolved-no-tbend'. Each dissolved row is
  classified exactly one way by the reused classifier AND carries
  (or lacks) a probe log + bracket. A dissolved row with a
  null/empty probe log is a probe-coverage failure, counted
  against the GO bar — never dropped from the denominator.
- Balanced panel (MEASUREMENT.md §15): the panel driver runs its
  own before/after lever sims and installs no refusalsay probe,
  so it cannot measure this DIAG-only instrument arm — there is
  no lever before/after to compare, and no panel compare .md is
  fabricated for one. The §15 comparison for this arm is the
  identical-seed substrate + wall recomputation against the
  draftflag / dissolvecause corpora (same seeds, same policy,
  same horizon), stated here so the omission is a declared
  non-applicability, not a gap. If a panel compare is demanded
  for a future lever arm, it belongs to that arm's prereg.

## GO thresholds (binding)

- Prereg committed BEFORE any judged analysis: PASS required.
  (Corpus reads, code reads, and the prior arm's counts above
  preceded this prereg as design input; this arm's judged numbers
  come only from this arm's fresh sweeps.)
- Fixtures: scripts/test-refusalsay-a.js green before the judged
  analysis: probe window attach by claimed-set under BOTH wrap
  orders (probe outside recorder, probe inside recorder);
  nested windows claim exactly once (inner claims, outer does
  not re-claim); orphan-end rows are NOT claimed by the next
  window; say/sysSay first-argument capture on window events
  (muster text captured verbatim, truncated at 1000 chars,
  other functions capture no arguments); NO removeWorldMonster
  wrap (WRAP_NAMES excludes it and the install counts no error
  for its absence); refusal bracket on synthetic never-live +
  single-say logs with muster have/need parsed, campaign-floor
  have/need parsed, campaign-node gate identified with
  have/need null, unknown-say text not gate-identified, and
  missing-argText falling back to elimination (herald → muster
  branch named, other mid → elimination-unknown); multi-say
  and no-say never-live logs unbracketed with the exact reasons
  above; live-window call/gap brackets still compute via the
  reused rule; a live fight gets no refusal bracket; an engine
  throw inside a wrapped call is rethrown unchanged and the
  window still closes; stackNames carry no '/' path characters;
  buffer cap flags overflow; probe delegation returns the orig
  value and preserves tbfight identity on a non-dissolving call.
- Pilot gate (8 seeds 75101-75108, before any confirm spend):
  fixtures green + pilot sweep rows valid (days > 0,
  scholarmelt errs 0, REFUSALSAY errs 0, refusalsay overflow
  empty, installed true, windows > 0, census sorted + lastDay
  within 1) + instrument firing evidenced (pilot dissolved rows
  reproduced, > 0, carrying probe logs; probe windows > 0) +
  substrate leg on pilot seeds (above). A failed pilot gate
  stops the run. If the pilot band reproduces 0 dissolved rows,
  the pilot gate FAILS as an instrument/reproduction NO-GO (the
  probe cannot capture say text for a population that is
  absent) — it is never a pass by absence.
- Seeds: 8/8 valid on the pilot sweep; 12/12 valid on the
  confirm sweep (same validity criteria).
- Probe coverage: refusalSayProbe present (a non-empty events
  array) on >= 95% of dissolved rows, pilot and confirm bands
  separately.
- Bracket rate: a counting bracket (refusal, call, or gap, per
  the rule above) on >= 95% of probe-carrying dissolved rows,
  pilot and confirm bands separately.
- Refusal share: reported in full on both bands (refusal rows /
  probe-carrying dissolved rows, with the full gate distribution
  and the dominant gate named). No separate bar: the refusal
  share IS the finding, and the gate-identified / have-need
  bars below are the bars on it.
- Gate identification: >= 95% of refusal-bracket rows have gate
  identified from say text (gateSource 'say-text', gate
  'muster' or 'campaign'), pilot and confirm bands separately.
- Have/need capture: >= 95% of muster-gate refusal rows carry
  parsed have AND need integers from say text, pilot and
  confirm bands separately. Have/need values are reported per
  row in the analysis (never quoted from elimination rows).
- Classification completeness: every dissolved row classified
  (exactly one fate each), 0 UNCLASSIFIED — carried from
  dissolvecause's rule, re-checked here, both bands.
- Substrate: as above, pilot seeds (normalized OR
  frame-reconciled, census byte-identical). Any game-field
  divergence is investigated before judging; the probe must not
  move the game.
- Sense: at least 2 refusal chains read end to end on the pilot
  band (a same-seed day-cluster of dissolved rows plus the say
  text of one row each plus the census snapshots bracketing it:
  does the refusal cohere with the fight the scholar was in,
  does the have/need text make sense against the muster state,
  does anything read as a melt), plus at least 1 additional
  chain on the confirm band when the confirm band yields
  dissolved rows. Say text is now captured, so sense evidence
  includes the actual gate text quoted — no longer structured
  trace alone.
- Wall numbers: recomputed from the fresh corpus rows (same
  definitions as dissolvecause: wins, national ever/final,
  table reached/entered, wave reach, median survival, deaths)
  and checked against the dissolveprobe pilot numbers on the
  identical pilot seeds; any divergence is reported, never
  smoothed (divergence is EXPECTED to be zero if the substrate
  leg holds — a nonzero divergence contradicts the substrate
  leg and is investigated, not averaged). Confirm-band wall
  numbers are reported on their own band, with no smoothing
  against the pilot band.

## Confirm verdict rule (binding)

- Confirm GO iff pilot DIAG-GO (below) AND confirm band yields
  >= 20 dissolved rows AND 12/12 valid AND coverage >= 95% AND
  bracket rate >= 95% AND gate identification >= 95% AND
  muster have/need capture >= 95% AND classification
  completeness (0 UNCLASSIFIED) AND confirm sense (>= 1 chain).
- If the confirm band yields < 20 dissolved rows, the confirm
  verdict is CONFIRM-INCONCLUSIVE: the pilot verdict stands
  alone, no confirm GO is claimed, and the band's zero/low
  count is reported as a property of the band (herald clusters
  are seed-dependent — the 75109-75116 band already showed 0),
  NOT as an instrument failure and NOT as a pass. A
  confirm-inconclusive result never upgrades or downgrades the
  pilot verdict.
- DIAG-GO (pilot) iff prereg PASS + pilot gate PASS + 8/8 seeds
  + probe coverage PASS + bracket rate PASS + gate
  identification PASS + have/need capture PASS + classification
  completeness PASS + substrate PASS + sense PASS + fixtures
  PASS.
- DIAG-NO-GO on any failed pilot leg, including 0 dissolved rows
  reproduced, or any rate below its bar even if the gate text
  looks right on the rows that did capture. A miss is NO-GO,
  never re-scored against a friendlier metric mid-run; metric
  doubts go under "metric review" for the NEXT run. Every
  evidence file carries a "metric review" section.
- NO lever verdict: this arm proposes no damage buff, gate move,
  deed-bar move, or any game change. The probe is an instrument;
  its gate text names follow-up work, but no fix lands here.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Refusalsay policy + sweep copy + analyzer + fixtures,
   committed before the judged analysis is run (fixture bar
   green first).
3. Pilot: seeds 75101-75108 — fixtures + per-seed validity +
   instrument firing + substrate leg — before the confirm sweep
   is judged.
4. Confirm (only if pilot DIAG-GO): fresh band 75117-75128,
   judged under the confirm rule above; sense read per the bar
   above when dissolved rows exist.
5. Evidence evidence/2026-10-30/sim-refusalsay-a.md with a
   prereg-legs table, the judged refusal numbers in full (gate
   distribution, have/need per row or per-row summary), the
   dominant gate plainly, sense notes quoting gate text, wall
   numbers (recomputed, pilot vs dissolveprobe + confirm band
   separately), plain-words village assessment, metric review,
   and ranked next.
6. No src/js change, no push, no bump, no live verification, no
   merge to master by this worker (the coordinator merges;
   sibling loop B may move master under this branch — rebase
   cleanly at the end and re-run the proof; rebase conflict =
   FAIL LOUDLY, no force, no merge).

## Node harness

The sweep runs through scripts/sim-harness.js (the shared kit:
seeded Math.random before eval, full src/js list in index.html
order minus DOM-only files, window stubbed then deleted for sync
combat, never stubbing Game.save). No jest is run by this arm;
any jest invocation would use
--cacheDirectory=/tmp/jest-cache-sim-refusalsay-a and never run
concurrently with another jest.
