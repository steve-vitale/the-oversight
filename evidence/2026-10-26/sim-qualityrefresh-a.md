# sim-qualityrefresh-a — the QUALITY-STEP refresh question (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, arm sim-qualityrefresh-a.
DIAG ONLY — zero src/js changes, zero default flips, policy-side /
instrument only. This arm designs and lands NO game fix. Answering
whether a refresh grant's quality actually steps up when the re-feast
is better, or whether quality/mult never change on refresh, IS the
deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md,
  src/js/feastBuff.js header + grant method + src/data/feast-surge.json
  (durationNights 2, refeast policy refresh / quality best, feastDraw
  chance 1.0). No canon doc covers feast-quality steering directly —
  the quality formula lives in src/js/game.js hostFeast (read from
  code, never invented): score starts 1; +1 served variety >= 4;
  +1 cooked-meat centerpiece; +1 table heart (highest-trust guest,
  always present when anyone showed); +1 turnout >= 0.9 with
  invited >= 5; -1 per-head served < 300 kcal; -1 invited < 4;
  then quality = max(0, min(2, score) - coldSeats), where each
  fusion-reactor guest (host excluded — host reactor refuses the
  grant outright) is a cold seat; then the LEGEND GATE: quality 2
  needs a story on the table (variety >= 4 OR meat) AND invited
  >= 4, else it drops to 1. Consequence, stated now: a thin
  quality-0 feast is nearly unreachable through guest count alone
  (score >= 2 whenever anyone showed, and both deductions firing
  needs invited < 4 AND per-head < 300, which the 1500-kcal floor
  makes arithmetically hard); the reachable quality levers for a
  policy are (a) cold seats — include reactor guests to drag
  quality down, exclude them to lift it — and (b) the story /
  invited-count gates for legend. The step this arm hunts is
  therefore most plausibly 1 -> 2 (a dragged-down fresh feast
  refreshed by a clean, storied one), not 0 -> 2.
- Context read first: evidence/2026-10-26/sim-feastrefresh-a.md
  (the refresh branch exercised: 14 refresh grants, all quality 1
  / mult 2.03, identical to their pre-buff values — "better
  quality wins" held only trivially; draws on refresh 0; window
  extended 14/14 and reset to grantDay+2 14/14; refusal census
  reactor 127, devotion 0, other 0; the one named gap carried
  forward here: no thin-feast-refreshed-by-legendary-feast case
  has ever been measured). The sibling arm in this run
  (sim-deedtest-a) works a different question; its uncommitted
  work is NOT read or reused here. Loop B is live on
  food-economy in its own trees — not touched, not read.
- Mechanism, READ FROM CODE (never invented):
  - grantFeastBuff gates in order: reactor online => refusal;
    devotion unarmed => refusal; an EXISTING live buff =>
    REFRESH branch: nq = max(existing.quality, q), mult =
    qualityUplift[nq] * surge * arcBurn recomputed (never
    multiplied onto itself), untilDay = grant day +
    durationNights (2), returns refreshed:true, NO draw call,
    NO draw field; otherwise FRESH branch (sets s.feastBuff,
    calls drawFeastScavenger exactly once).
  - Code-level consequence, stated now: a quality step on
    refresh happens IFF the refresh feast's quality q exceeds
    the live buff's quality. The code CAN step (max, not
    last-wins, not keep-old). The open question is purely
    whether any re-feast on this substrate ever carries a
    higher q than the buff it refreshes.
  - hostFeast draws the pantry cost (pantryDraw) BEFORE it
    calls grantFeastBuff. A refused feast still costs dinner.
    The hostFeast report (rep) carries ok, quality, spent,
    served, showed, invited, surgeSpent, buffGranted, draw,
    and the score factors (variety, centerpiece, heart,
    turnout, invitedN, showedN, perHead) — the recorder in
    this arm captures rep verbatim, so refused-feast pantry
    cost is priced from real reports, not inferred.
- New this run, policy-side only:
  scripts/policies/qualityrefresh.js (QUALITYREFRESH=1,
  HOSTFEASTREC=1). It wraps the COMMITTED feastrefresh policy
  (FEASTREFRESH=1, FEASTDRAWDRIVEOFF=1,
  COMPETENT_SEEK_FIGHTS=0 on the armed arm only — drive-off
  keeps the devotion armed, which is what makes a refresh
  reachable) and adds exactly one steering leg: in upkeep,
  BEFORE delegating, at dusk, at haven, armed (prog.feastSurge
  truthy), host reactor offline, with a LIVE buff
  (direct-read s.feastBuff with day < untilDay — never
  feastedActive(), which clears expired buffs), and with at
  least one reactor guest among the feastPlan guests and at
  least one non-reactor guest to invite, it hosts the feast
  itself with guests = the non-reactor invitable guests only
  (reactor guests excluded — the documented cold-seat lever,
  exercised through the player's own guest choice, which
  hostFeast accepts via opts.guests). All other honest gates
  still apply: dusk-only, at-haven, one feast/day
  (s.feastDay), recentGives >= 1500 in the last 7 days,
  feastPlan ok, have >= subset-cost * 1.5. Fresh feasts are
  NEVER steered — they delegate untouched, so the low side
  of any step is the ordinary (reactor-inclusive) feast, and
  only the refresh side is lifted. If no reactor guest is
  present, or the refresh guest list would be empty, or any
  gate fails, the leg does nothing and the feastrefresh
  behavior runs unchanged.
  The same file carries a hostFeast recorder
  (withHostfeastRec, HOSTFEASTREC=1): wraps Game.hostFeast,
  records rep verbatim AFTER delegating (quality, spent,
  served, showed, invited, surgeSpent, buffGranted, draw,
  factors) plus coldSeats computed by direct
  npcHasAbility(vid, 'fusion_reactor') reads on the showed
  guests, host-reactor state, and the live-buff-before
  direct read. It writes nothing to game state, draws no
  RNG, returns the original value untouched. It installs
  idempotently in daily AND in upkeep (the harness runs
  upkeep before the first daily, so a daily-only install
  would miss loop-day-1 feasts; feasts start far later,
  but the double install is the honest pattern).
  Default OFF for both legs: QUALITYREFRESH unset and
  HOSTFEASTREC unset -> the qualityrefresh policy delegates
  to feastrefresh byte-identically, and the recorder installs
  nothing (the det-gate pins off == plain tableseat-nowait
  on days/gameDays/ts, with no qr/hf surface and no wraps).
- Recorders reused VERBATIM (policy-side only, never
  edited): scripts/policies/feastdraw-diag.js (FEASTDRAW=1)
  and scripts/policies/nonworldkill-diag.js (NONWORLDKILL=1).
  Grant rows already carry preBuff, preDraw, postDraw,
  refreshed, mult, quality; the hostFeast records join to
  grant rows by day (a dusk feast's grant lands the same
  day; one feast/day, so the join is unique).
- Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, scripts/policies/tableseat-nowait.js),
  180d death-aware horizon (runDays stops on death/win;
  180 is the cap, not a fixed horizon). Run your OWN control
  side on identical seeds in the same sweep — never a copied
  sibling corpus, never judged against the stale 234-death
  band. The control arm is tableseat-nowait + feastdraw-diag
  + nonworldkill-diag + hostFeast recorder ONLY (the
  recorder is measurement, not steering; the control's
  trajectory agreement vs the 0215Z rebaseline table is
  checked and reported, never assumed). Authoritative
  rebaseline reference (0126Z, comparison only — if this
  run's control disagrees, report plainly, never reconcile
  silently): deaths 260, national-ever 6/8, national-final
  5/8, table 4/8, entered 4/8, wins 4/8 (lesser seat only),
  wave-4 5/8, wave-5 0/8, Arc IV 4/8, median 143d, starvation
  9, raids 85, raiders 352, pool 1527, pool wave-3+ 132.
  National-ever reads must pair tsNationalDay with maxRank
  (transient-national instrument note).
- DIAG-GO rule (binding, ALL of (a) and (b) required):
  (a) at least one refresh grant with pre-buff quality LOWER
  than refresh quality (or a mult change) observed and
  recorded with the feast qualities cited, OR a code-level
  proof that refresh quality cannot step on this substrate
  plus corpus evidence that all refreshes hold quality/mult
  — the code-level proof must name the substrate mechanism
  (why feast quality is invariant here), not merely assert
  it; a bare "0 steps observed" without that mechanism is
  NOT this leg, it is an open question carried forward;
  (b) the refresh window semantics re-confirmed (untilDay
  +1 AND reset to grantDay+2, no stacking) on this run's
  own refresh grants (or, if this run observes zero
  refresh grants, on the method proof plus a stated
  no-refresh corpus — that combination satisfies (b) but
  never (a) on its own).
- Secondary deliverable (NOT verdict input): price REFUSED
  feasts — pantry kcal spent on refused feasts per seed,
  from hostFeast rep.spent where buffGranted is false,
  split by grant refusal reason (reactor / devotion /
  other) and by armed-vs-unarmed (surgeSpent > 0 vs 0).
  The 0215Z refresh arm saw seed 73675 lose day 93 on 18
  refused attempts; this arm prices that loss in kcal.
- Guardrails (diagnostic, reported not verdict-flipping):
  starvation, median survival, national-ever, wins on the
  control vs armed sides. The armed side's delta vs control
  is (daily feast cadence + drive-off draws + no feasted
  patrol + refresh-guest steering) — grant-level quality
  classification is mechanism-clean; wall-number deltas are
  DIAGNOSTIC SIDE EFFECTS ONLY, never a lever verdict,
  which this DIAG arm does not pre-register.
- Definitions (fixed before sweeping, analyzer header
  repeats them): same as feastrefresh-a (REFRESH GRANT =
  grant row granted + refreshed; DRAWS ON REFRESH = draw
  rows with drawn true whose grantIdx is a refresh grant's
  index; WINDOW EXTENDED = post-snapshot untilDay >
  preBuff.untilDay; WINDOW RESET-TO-FRESH-LENGTH =
  post-snapshot untilDay == refresh grant day + 2;
  QUALITY STEP = a refresh grant whose post quality >
  preBuff quality (equivalently grant quality > preBuff
  quality, since post quality = max(pre, grant) by code —
  both are recorded and must agree, or the disagreement
  itself is the finding); MULT CHANGE = refresh grant
  mult != preBuff mult; REFUSED-FEAST COST = hostFeast
  rep.spent summed over feasts whose grant row is refused
  (grant why-text classifies reactor / devotion / other),
  plus rep.spent over hosted feasts with buffGranted false
  and no grant row (reported separately, never merged
  silently); STEERED FEAST = a hostFeast record with
  steered true (the qualityrefresh leg hosted it with a
  reactor-excluded guest list).
- SENSE plan: (1) one quality-step moment (or, if none, one
  refresh moment) in plain words from the corpus — feast
  days, guest lists, cold seats, quality/mult/untilDay
  steps, what the game said; (2) one transcript snippet
  around a refresh (does the refresh line name the new
  quality honestly when it steps, or does it repeat the
  old line?); (3) a villager-behavior spot check (do the
  excluded reactor guests read as snubbed anywhere, or is
  exclusion silent? — a sense question, not a code claim).
- PILOT GATE: the fixed shared band IS the pilot — 8 seeds,
  both arms, identical seeds, before any further spend. No
  confirm beyond the band: the brief fixes the band at
  73671-73678, and seeds are the band, not a sample to
  extend.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot
  ingest per-seed recorder corpora (known limitation,
  carried) — the sweep-compare table + analyzer output
  are attached instead; do NOT run telemetry-check on
  recorder rows (its counts are wrong on recorder rows —
  standing instruction).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO via leg (a)'s alternative — refresh quality CAN step
## in code, and CANNOT step on this substrate, for a named mechanism

- (a) Step observed: NO — 0 steps in 14 refresh grants, 0 mult
  changes. Corpus holds: all 14 refresh grants hold quality 1 /
  mult 2.03, identical to their pre-buff values. Code-level proof
  that refresh quality cannot step ON THIS SUBSTRATE (the
  mechanism, not an assertion): every granted feast on both arms
  computes quality 1 — see "Why quality is always 1" below — so
  every fresh buff is q1 and every re-feast is q1, and
  max(1, 1) = 1 by the code's own rule. The method proof
  (scripts/test-qualityrefresh-a.js, 29/29) proves the code DOES
  step when the re-feast is better: a q0 fresh grant refreshed
  by a q2 grant steps to quality 2 and mult 2.4 -> 3.0, and a q2
  fresh grant refreshed by a q0 grant holds quality 2 (best
  wins, not last wins). The answer to the brief's question is
  therefore split exactly where the code splits it: the refresh
  rule steps; this substrate never gives it a better feast to
  step with. A bare "0 steps observed" would not have satisfied
  leg (a); the mechanism + the method proof together do.
- (b) Window semantics re-confirmed on this run's own refresh
  grants: untilDay +1 AND reset to grantDay+2 on 14/14, no
  stacking (every refresh line reads "stoked higher, not
  doubled", same mult, same window word). Draws on refresh: 0
  (no header contradiction). Classification complete:
  analyzer unclassified 0 on both arms; recorder errors 0 on
  all three recorders, both arms; no overflow; every refresh
  grant matched to a same-day host record (unmatchedHost 0);
  host quality == grant quality on all 24 granted quality-arm
  feasts (hostQualityMismatch 0); step-agreement failures 0
  (grant-quality step and post-quality step agree everywhere).
- Unit proof: scripts/test-qualityrefresh-a.js 29/29 (analyzer
  checks + liveBuffDirect purity + steering-leg stub checks +
  method-level step/hold proof on the real grant code).
- Live det-gate: PASS (seed 73671, policy-off ==
  plain tableseat-nowait: days 180/180, gameDays 181/181,
  tsNationalDay 77/77, no qr/hf/fr/fd surface, no wraps
  installed).
- Steering leg: PROVEN FUNCTIONAL, NEVER FIRED. The stub
  checks prove it hosts a reactor-excluded guest list exactly
  when a live buff meets a reactor guest, and stands down
  otherwise (no reactor guest; expired buff). In sims it fired
  0 times on 14 refresh dusks because no refresh dusk had an
  invitable reactor guest — guest cold seats are 0 on all 163
  hosted feasts on both arms. Its non-firing is a substrate
  finding, not an instrument failure.
- Guardrails (diagnostic only, per the pre-registration —
  NOT verdict-flipping for this DIAG arm): the quality arm's
  band numbers are byte-identical in trajectory to the 0215Z
  refresh arm (same days/won/deaths per seed — the steering
  leg changed nothing, because it never fired), so the
  guardrail picture is the 0215Z picture carried forward:
  starvation total 9 vs control 9 (PASS on total);
  median over non-won seeds 180d vs 0.8x180d (PASS);
  national-ever 7 vs 6-1 (PASS); wins 0 vs 4-1 (FAIL —
  diagnostic side effect of daily feasting + drive-off,
  reported, not hidden); per-seed starvation: 73673 quality
  4 vs control 0 (excess +4, FAIL as a diagnostic side
  effect — the same daily-feast pantry drain 0215Z priced).

## THE COMPARISON TABLE (identical seeds 73671-73678, 180d death-aware)

| arm | won | median | medianNonWon | natEver | natFinal | table | entered | wave4 | wave5 | ArcIV | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| control (always-face, 7d cadence) | 4/8 | 143d | 180d | 6/8 | 5/8 | 4/8 | 4/8 | 5/8 | 0/8 | 4/8 | 9 | 260 |
| quality (daily cadence + drive-off + steering) | 0/8 | 180d | 180d | 7/8 | 4/8 | 0/8 | 0/8 | 5/8 | 0/8 | 0/8 | 9 | 274 |

| arm | grants (fresh/refreshed/refused) | draws | faced | driven-off | kills | wave-4 draws | wave-4 kills |
|---|---|---|---|---|---|---|---|
| control | 12 (5/0/7) | 5 | 5 | 0 | 4 | 1 | 1 |
| quality | 151 (10/14/127) | 10 | 0 | 10 | 0 | 0 | 0 |

Control-agreement: this run's own control side reproduces the
rebaseline authoritative table EXACTLY on all 8 seeds (days,
won, deaths — 8/8 agree). The control is current; no drift to
report. The hostFeast recorder changed no control trajectory
(the agreement is the proof).

Per-seed, control -> quality:

| seed | control | quality | grants (f/r/ref) | refused cost (kcal) |
|---|---|---|---|---|
| 73671 | 180d survived, 31 deaths, 0 grants | IDENTICAL | 0 | 0 |
| 73672 | won d97, 25 deaths, 2 draws faced | 180d survived global, 24 deaths | 100 (4/3/93 reactor) | 203,158 |
| 73673 | won d124, 28 deaths, 1 draw faced | lost d159, 56 deaths, 4 starv | 17 (6/11/0) | 0 |
| 73674 | won d163, 30 deaths, 1 draw faced | 180d survived global, 26 deaths | 12 (0/0/12 reactor) | 33,402 |
| 73675 | 180d survived, 38 deaths, 3 refused | lost d93, 27 deaths | 18 (0/0/18 reactor) | 38,078 |
| 73676 | lost d70, 31 deaths, 0 grants | IDENTICAL | 0 | 0 |
| 73677 | lost d143, 43 deaths, 0 grants | IDENTICAL | 0 | 0 |
| 73678 | won d116, 34 deaths, 1 draw faced+wave-4 kill | 180d survived global, 36 deaths | 4 (0/0/4 reactor) | 9,192 |

The three no-grant seeds (73671, 73676, 73677) are
byte-identical trajectories between arms — the quality
instrument changes NOTHING when no feast is hosted.

## THE ANSWER, FIRST (plain words)

A refresh grant's quality DOES step up when the re-feast is
better — the code takes the better of the two qualities, never
the newer one and never the older one — but on this band no
re-feast is ever better, because every feast the villages
host is the same middling feast. Fourteen refreshes, fourteen
times quality 1 in, quality 1 out, multiplier 2.03 in, 2.03
out. The step was tested two ways: in a loaded game, a thin
feast refreshed by a legendary one steps cleanly to quality 2
and a higher multiplier, and a legendary feast refreshed by a
thin one stays legendary; in sims, the better feast never
arrives. The reason is in the feast's own math, read off 163
hosted feasts: a feast only becomes legendary when the table
shows a story — four different foods, or cooked meat — and
the villages' granted feasts never show either (one to three
staples, cooked meat never drawn at feast time). Without a
story, even the richest table is capped back to a proper
feast. And the one lever that could drag a fresh feast down
so a refresh could lift it — a fusion-reactor guest's cold
seat — never appears either: no guest at any feast on either
arm carries a reactor. So the refresh branch is healthy, the
step rule is real, and the substrate starves it of inputs:
same feast in, same feast out, fourteen times.

## WHY QUALITY IS ALWAYS 1 (the substrate mechanism, from the corpus)

Granted feasts, both arms (control 5, quality 24 — all q1,
all mult 2.03, all surge 1.5):

- Story never true: served variety 1–3 on every granted feast
  (control: v1 4, v2 4... counted over hosted feasts below);
  cooked-meat centerpiece NEVER true on any of the 163 hosted
  feasts on either arm (0/163). So the legend gate fires on
  every score>=2 feast: pre-gate quality 2 is capped to 1.
- Score-1 feasts are already 1: small guest lists (invited
  < 4, −1) with base 1 + heart 1 = 1 — no gate needed.
- Per-head served never drops below 300 kcal on a granted
  feast (lowest seen: 400), so the thin deduction never
  fires; guest cold seats are 0 on every feast, and the host
  is never reactor-online on a granted feast (else the grant
  is refused outright).
- Surge is 1.5 on every granted feast, so mult is always
  uplift(1) 1.35 × 1.5 = 2.03. No wedding-ring ×2 or other
  surge variation appears on this band, and Arc IV (which
  would multiply the buff hotter) is 0/8 on the quality arm,
  so no arc-burn mult change either.

All hosted feasts (granted + refused), for completeness:
control 12 hosted: quality q1 11, q0 1; variety v1 4, v2 4,
v3 3, v4 1; meat centerpiece 0; guest cold seats 0.
Quality 151 hosted: quality q1 107, q0 44; variety v1 68,
v2 48, v3 28, v4 5, v5 2; meat centerpiece 0; guest cold
seats 0. The v4/v5 feasts are the tell, not a
counter-example: all 7 occur on host-reactor feasts, so
their grants are refused (reactor ceiling) — a four-food
table exists on this band only after the host goes reactor,
when no buff can grant at all. And the q0 feasts are the
host cold seat made visible: score 1 (small guest list)
minus the host's own reactor seat = 0. The recorder's
coldSeats counts guest seats only; the host seat is the
record's hostReactor flag — on granted feasts it is always
false, so guest cold 0 means true cold 0 there. On refused
feasts the host seat is the whole q0 story.

Consequence, stated plainly for the NEXT arm: a live quality
step needs a GRANTED feast with a story — variety >= 4 or
cooked meat in the pantry draw — on either side of the
refresh (a storied refresh after a plain fresh, or a plain
refresh after a storied fresh held down by... nothing on
this band drags a granted feast down, so the step must come
from the refresh side gaining a story). Pantry-composition
steering (a feast timed to a hunt's cooked meat, or to a
four-food pantry) is the lever; guest-list steering is
exhausted on this band (no reactor guests to exclude, and
excluding them would only matter if a fresh feast had been
dragged down in the first place).

## THE REFRESH GRANTS, NUMBER BY NUMBER

All 14 refresh grants (quality arm; days from the say-line
corpus, which captured all 14):

| seed | refresh days | pre quality -> grant quality -> post quality | mult |
|---|---|---|---|
| 73672 | 61, 62, 69 | 1 -> 1 -> 1 (all three) | 2.03 throughout |
| 73673 | 41, 42, 43, 44, 47, 48, 51, 52, 67, 71, 72 | 1 -> 1 -> 1 (all eleven) | 2.03 throughout |

- Window semantics re-confirmed 14/14 on every leg: every
  refresh moved untilDay from preBuff.untilDay to
  preBuff.untilDay + 1 AND to grantDay + 2 (both held every
  time, as on a daily cadence). No refresh left the window
  unchanged, shortened it, or stacked a second window.
- Draws on refresh: 0. No draw row carries a refresh
  grant's index on any seed.
- Circling draws at refresh: 0 in sims (same structural
  fact as 0215Z: a draw is answered before the next dusk).
  Method-proven to survive untouched (see the unit proof).
- Steered refresh feasts: 0. No refresh feast excluded a
  reactor guest, because no refresh dusk had one to exclude.
- Subsequent grants after refresh: identical in shape to
  0215Z (chains broken by gap days, the reactor ceiling,
  and village end) — the quality arm's trajectories match
  the 0215Z refresh arm seed for seed, since steering never
  fired.

## REFUSED FEESTS, PRICED (the secondary deliverable)

Pantry kcal spent on hosted feasts whose buff was refused,
from hostFeast rep.spent (real reports, not inferred):

| seed | control refused cost | quality refused cost | quality attempts |
|---|---|---|---|
| 73672 | 0 | 203,158 | 93 reactor, armed |
| 73674 | 8,701 | 33,402 | 12 reactor, armed |
| 73675 | 7,791 | 38,078 | 18 reactor, armed |
| 73678 | 1,600 | 9,192 | 4 reactor, armed |
| others | 0 | 0 | — |
| TOTAL | 18,092 | 283,830 | 127 reactor, armed |

- Every refused kcal on both arms is armed + reactor:
  refusedArmed 283,830, refusedUnarmed 0, refusal reasons
  reactor 127, devotion 0, other 0. No unarmed feast was
  hosted on either arm, so the devotion gate cost nothing
  in pantry terms here — the reactor ceiling is the entire
  refused-feast bill.
- The 0215Z loss, priced: seed 73675's 18 daily refused
  attempts cost 38,078 kcal before the village lost on day
  93 — but the loss is NOT starvation deaths (73675 quality
  starvation deaths: 0; the village lost with 27 deaths by
  other causes, final pantry 1,300). The drain is real, the
  mechanism of the loss is collapse, not starvation — stated
  so the price is not over-read.
- The 73672 bill (203,158 kcal over 93 attempts, ~2,184
  per attempt) is the daily-cadence pinging cost: the base
  policy would back off to a fortnightly cadence under a
  reactor, but the daily-cadence instrument pings the
  ceiling every evening. The refusal REASON is real; the
  daily rate is instrument behavior, not base-policy
  behavior (same honesty note as 0215Z). 73672 could afford
  it (final pantry 36,761, 8 people) and still won nothing.
- Control-side note: even at the competent 7-day cadence, a
  village pays for refused feasts — 73674's control self
  paid 8,701 kcal for 3 reactor refusals and still won
  (day 163). Refused feasts are a real pantry tax in normal
  play too, not just an instrument artifact.

## SENSE-TESTING READ (refresh lines + villager spot check)

All 14 refresh lines are byte-identical in form (only the
day differs): "The feast carries you on — the fire is
stoked higher, not doubled. FEASTED ×2.03 until tomorrow's
dawn (6 parts left): a proper feast. (Re-feast refreshes; it
never stacks.)" The line is honest about what happened —
same multiplier, same window word, same quality name —
because nothing changed: the feast that refreshed was the
same proper feast as the feast that started the buff. There
is no step narration to judge, because no step occurred;
had a step occurred, the line's quality name ("a legendary
spread") and multiplier would be the honest witnesses, and
the method proof's grant line is the same template with the
new values. What the repetition DOES show, fourteen times
running, is the 0215Z telegraphing note unchanged: nothing
in the line says the window was about to expire, or that
feasting tonight (rather than tomorrow) is what kept it
alive — the player who feasts daily gets refreshes without
ever being told the cadence is the trick.
Villager-behavior spot check: the excluded-guest question
is moot in sims (no reactor guest was ever excluded — the
leg never fired), so no snubbed-guest texture exists to
read. What the host records DO show is a feast-village
texture worth one line: the guest of honor rotates (Divya,
Enrique, Jorge, Li, Pamela, James, Tashi...), turnout is
usually total (1.0) but sags when guests are sick
(73673 d66: 5/6; d67: 2/3; d70: 1/2), and the feast
shrinks with the village — late 73673 feasts seat 1–3
guests, not 6–7. The village that feasts daily is still a
village of named people at a fire, not a buff timer — and
the pantry ledger is the honest counterweight (73673 ends
at 0 kcal, 4 people).

## VILLAGE ASSESSMENT (plain words)

Three villages never met a feast under either policy and
lived identical lives. Of the five that did, the quality
arm replays the 0215Z refresh arm seed for seed, because
the new steering never fired: 73672 became the
daily-feasting village that refreshed three times, then
spent 203,158 kcal pinging the reactor ceiling for 110
days, surviving to day 180 at global rank with a fat pantry
and no seat; 73673 became the feast-village that ate
itself — eleven refreshes, six draws driven off, pantry run
to zero by day 159; 73674, 73675, and 73678 are the
ceiling's villages, paying 33,402 / 38,078 / 9,192 kcal for
nothing but honest refusals, losing (73675) or stalling
where their control selves won. The wall numbers say the
same as 0215Z: national-ever actually rose (7/8 vs 6/8 —
73675's quality self reached global transiently, tsNationalDay
77 with maxRank global, where its control self never left
regional), but national-final fell (4/8 vs 5/8), the table
went to zero, and wave-5 stayed unborn on both arms. The
one new wall-relevant fact is negative and useful: guest
steering cannot move this band at all, because the guest
pool never contains the lever it steers.

## WALL NUMBERS

Control: national-ever 6/8, national-final 5/8, table
invited 4/8, entered 4/8, wins 4/8, wave-4 reached 5/8,
wave-5 0/8, Arc IV 4/8, median survival 143d, max 180d,
deaths 260, starvation 9. Death-cause shares (of 260):
villager combat 162 (62.3% — 'villager combat' 78 +
'combat' 84), player arena 32 (12.3%), villager sickness
16, expedition 11, starvation 9, ambush 5, wound-that-
wouldn't-close 5, villager monster 5, player contest 3,
villager alien 3, player dehydration 3, and 1 each for
Bulldozer, Paparazzo, Living Wire, lockjaw, the night,
thirst, player starvation 2 (counted in the 9).
Quality: national-ever 7/8, national-final 4/8, table
0/8, entered 0/8, wins 0/8, wave-4 reached 5/8, wave-5
0/8, Arc IV 0/8, median survival 180d, median non-won
180d, max 180d, deaths 274, starvation 9. Death-cause
shares (of 274): villager combat 166 (60.6% —
'villager combat' 88 + 'combat' 78), player arena 38
(13.9%), expedition 16, villager sickness 15 + player
sickness 1, starvation 9 (villager 8 + player 1), ambush 4,
wound-that-wouldn't-close 6, villager monster 6, villager
alien 4, player contest 3, and 1 each for Bulldozer,
lockjaw, experiment, Paparazzo, dehydration, the night.
The wall stands on both arms: wave-5 0/8, and the quality
arm produced zero wave-4 veterans from draws against the
control's one.

## BLANKS FILLED OR DOCUMENTED

- FILLED (the assigned blank, the 0215Z named gap): the
  quality-step refresh question, answered two ways — in
  code it steps (method proof: q0->q2 steps, q2->q0 holds,
  window resets, no draw, circling draw survives); on this
  substrate it cannot step (mechanism: every granted feast
  is q1, because story never true + no cold seats + surge
  always 1.5, proven over 163 hosted feasts with factors).
- FILLED (mechanism, corrected by data): the q0 feasts on
  this band are the HOST's reactor seat (score 1 minus host
  cold 1), not guest seats — the recorder's coldSeats counts
  guests only, and the host seat is the hostReactor flag;
  on granted feasts hostReactor is always false, so guest
  cold 0 means true cold 0 there. The v4/v5 feasts exist
  only on host-reactor (refused) feasts — variety arrives
  too late, after the ceiling closes.
- FILLED (secondary deliverable): refused feasts priced in
  real pantry kcal per seed (quality total 283,830, all
  reactor, all armed; control total 18,092, same split).
  The 0215Z 73675 loss is priced at 38,078 kcal and
  re-characterized: a collapse, not starvation deaths.
- FILLED (instrument): the qualityrefresh steering leg is
  proven functional on stubs and proven inert on this band
  (0 firings, 0 trajectory changes) — a future arm can reuse
  it where reactor guests exist, and will know to check
  firing counts first.
- DOCUMENTED, NOT FIXED (named next blanks, proposed for
  the coordinator to number): (1) a live quality step still
  needs a storied GRANTED feast — pantry-composition
  steering (feast timed to cooked meat or a four-food
  pantry) is the next arm's lever, guest steering is
  exhausted here; (2) cooked meat NEVER appears in a feast
  draw on this band (0/163) — whether meat reaches the
  pantry cooked at all, or is eaten/spoiled first, is a
  pantry-composition question worth one probe; (3) the
  refresh line's missing expiry telegraph (why tonight
  matters) carries from 0215Z, still a narration note, not
  a fix made here; (4) the devotion gate cost nothing in
  pantry terms here (no unarmed feast hosted) — its price
  is still unmeasured anywhere.
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z,
  Steve rulings pending); the 23% pool wave-3+ bar
  re-derivation (tileentry question, still open).

## NEXT-BLANK PROPOSAL (concrete next arm)

Next arm: a PANTRY-STORY refresh arm (DIAG, same band, same
recorders + hostFeast recorder). Pre-registration sketch:
(1) a policy that watches the pantry draw preview (feastPlan
menu / pantry copy) and hosts the refresh feast only when
the preview shows variety >= 4 or cooked meat — or, if the
daily window forces the feast tonight regardless, records
the preview honestly and lets the step fail openly; the
lever is pantry composition (hunt timing, haul timing),
not guest lists; (2) record whether a storied refresh
steps quality/mult and whether the narration names the new
quality; (3) the lever question for the scale wall: none —
this is a branch-completeness arm, and it must not be
scored as a wall lever. If pantry-story feasts prove
unreachable on this band too (meat never cooked, variety
never 4 at grant time), that itself is the finding, and the
arm reports it instead of forcing it.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No GO leg or guardrail line was re-scored mid-run. The run
was judged exactly against its pre-registered header: leg
(a) step observed OR code-level proof that refresh quality
cannot step on this substrate plus corpus evidence that all
refreshes hold quality/mult — achieved via the alternative
(0 steps; 14/14 holds; method proof that the code steps
when the re-feast is better; substrate mechanism — every
granted feast q1 — proven over 163 hosted feasts with
factors, not asserted); leg (b) window re-confirmed
(14/14 extended, 14/14 reset, no stacking — achieved).
Guardrails were pre-registered as reported-not-verdict-
flipping for this DIAG arm, and are reported as such:
starvation total PASS (9 vs 9), median-non-won PASS (180d
vs 144d), national-ever PASS (7 vs >= 5), per-seed
starvation FAIL (73673 +4), wins FAIL (0 vs >= 3) — the
failures are diagnostic side effects of the daily-feast +
drive-off posture, not a re-scored verdict. Two method
notes, neither a revision: (1) the sweep ran one seed per
exec call with each per-seed row verified on disk before
the next (the background-session-vanish class from prior
runs was avoided by never trusting loop output — the
summary was computed from the 16 on-disk rows); (2) the
say-line capture was narrowed to refresh + LEGENDARY lines
(cap 200) and captured all 14 refresh lines, so the sense
read is quoted from the corpus, not reconstructed. The
telemetry-check and balanced panel were NOT run, per the
standing exception for recorder rows (panel cannot ingest
per-seed recorder corpora). The sweep-compare table +
analyzer output are the comparison of record. The
telemetry baseline was NOT rolled. No game code changed in
this run; no [needs-eyes] flag applies (DIAG-only, no
narration or behavior added; the sense read found a
telegraphing note, not a narration gap needing eyes).

## Infrastructure notes

- Sweep: scripts/test-qualityrefresh-sweep.js (two arms,
  control + quality, identical seeds; feastdraw-diag +
  nonworldkill-diag + hostfeast recorders). Corpus:
  evidence/2026-10-26/perseed-sim-qualityrefresh-a/ (16 rows
  + summary.json). Policy:
  scripts/policies/qualityrefresh.js (QUALITYREFRESH=1,
  HOSTFEASTREC=1, FEASTREFRESH=1, FEASTDRAWDRIVEOFF=1,
  COMPETENT_SEEK_FIGHTS=0 on the quality arm only).
  Unit + method proof: scripts/test-qualityrefresh-a.js
  (29/29). Det-gate: PASS (seed 73671, policy-off ==
  tableseat-nowait).
- Commit: sim-qualityrefresh-a, DIAG-GO via leg (a)'s
  alternative (refresh quality steps in code, cannot step
  on this substrate for a named mechanism; refused feasts
  priced), zero src/js diff. Ready for coordinator merge;
  NOT pushed, NOT bumped, live NOT verified (coordinator/
  ship-loop line, not this arm's).

