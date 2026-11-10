# Raiser-seat arm — PRE-REGISTRATION (arm sim-raiserseat-a)

Run: fleshout-20261110T1415Z (Loop A). Axis: scale-onramp /
winnability chain. The 150206 exception from sim-talkturn-a
(evidence/2026-11-10/sim-talkturn-a.md, run
fleshout-20261110T1215Z): the raiser never gets a seat.
Committed BEFORE any judged computation. Policy-side change
only (`scripts/policies/competent.js` talkScore), zero src/js.
Do NOT move readyDemand numbers or any win price/deed gate.
Do NOT change the accept/decline picker (the scholar-never-
says-no finding, 27/27 accepts, is a separate design question
— leave it).

Base: worktree tip a80b2d789 at spawn (recorded here; re-verify
at landing — if master has moved, rebase onto the explicit
current master SHA and re-run proof green).

## Canon read before this prereg

- `docs/CANON.md` (manifest). No canon doc covers village-link
  raising, polity formation, or held-conversation target
  picking as a system; the mechanics below are grounded in
  code, not invented canon. `docs/CONVERSATIONS.md` covers
  dialogue/talk generally (no link-raise section, no target-
  picker section) — the talk behavior below is grounded in
  `scripts/policies/competent.js` and
  `src/js/bond-initiation.js`, not in the canon doc.
  `docs/SCALE.md` is the scale-ladder canon: a polity is one
  primary with >= 3 SEASONED subordinates; seasoned = 30+ days
  old AND trust 40+.

## The pattern, pinned from cited evidence (what it IS)

sim-talkturn-a, band 150201–150208, COMPETENT_TALK=1 armed vs
flag-off control, 150d: armed formed second links on 7/8 seeds
(20 via raise) vs control 0/8; polities 6/8 vs 0/8; wave-5
unlocks 7/8 vs 2/8; national/table/wins 0/8 both legs. The one
armed seed that stayed at one link is the exception that names
this fix. On 150206 the villagers staged 28 link raises and
every one expired unanswered while the scholar held 1,251
conversation turns. The top raiser (devon_okafor, trust 96–100,
`build_standing` 1, knew 3 villages) got 5 turns in the first
200 turn events while others got 29–34. `talkScore` rewards
strangers (+20−bond) and the least-talked-to (+10−count), so
the most trusted, most-talked-to villager — the one carrying
the standing goal and staging the raises — systematically
ranks out of the two daily seats. The raise is never refused;
it is never sat with.

## Mechanism, decided with evidence (the probe)

Before this prereg, one scratch probe ran on the failing seed
only (`/tmp/raiserseat-probe.js`, seed 150206, COMPETENT_TALK=1,
NOT a judged computation — no pilot or confirm seed ran before
this commit; the probe sized the mechanism, it judges nothing).
Each day it recomputed `talkScore` for every alive villager
plus pending-raise status plus commLevel, as pure reads. Result
on 150206: 73 days with a pending raise; a raiser would make
the top-2 seats on base score alone on 0/73 days; the bonus a
raiser needed to make top-2 was min +1, median +6, p90 +14,
max +21. The competition was NEVER a want-bearer on this seed
(all top competitors want=0); it was strangers (stranger
14–20) and grieving strangers (grief 50, e.g. d40–41, d87–89,
a grieving stranger at 70 vs a grieving raiser at 50–57). On
3 of the 73 days every pending raiser was unanswerable
(commLevel 'none').

DECISION — a score signal in `talkScore`, not a hard seat-hold:
a raiser with an answerable pending link raise gets +35.
- +35 > 30 (the whole stranger + least-talked-to spread), so a
  raiser outranks ANY stranger even from a zero base — the
  literal task requirement, guaranteed, not just on 150206.
- +35 < 50 (grief alone) and < 100 (an unresolved want), so
  comfort and direct wants keep their priority; the raise only
  displaces stranger/count seating, which is exactly the
  observed failure mode. On 150206 +35 covers every pending-
  raise day (max needed +21) with margin, including the
  grieving-raiser days (their own base already carries the
  grief points: 57+35=92 > 70).
- A hard seat-hold was NOT chosen: it would override the
  meaning-first ranking even against wants, and the probe shows
  the observed failure needs +21 at most — a hold is a bigger
  behavioral change than the evidence calls for. If the pilot
  shows residual 150206-class seeds (a want-bearer or grieving
  stranger outranking a low-base raiser on another seed), the
  metric review names the seat-hold (or a larger bonus) as the
  next step — the pilot adjudicates, this prereg does not
  pre-decide it.
- ANSWERABILITY GATE: the bonus applies only when the ask
  would actually appear in the talk menu — `commLevel(vid)`
  is not 'none' (fail-open if commLevel is missing/throws,
  matching `bondChoices`' own fail-open rule). Grounding, per
  the task: the raise is a real pending ask the village knows
  about (it appears in the talk menu when the scholar sits with
  the raiser). With no shared language the ask never appears
  (`bondChoices` returns nothing at commLevel 'none` —
  secondlink-a blank 3), so no seat is spent on it. The signal
  only prioritizes TALKING to the raiser; it never decides the
  link for anyone (accept/decline picker untouched).
- Env gate `RAISER_SEAT=1`, default OFF (mirroring
  `COMPETENT_TALK`): control leg = flag unset → `talkScore`
  byte-identical to the talkturn-a policy. The landing decision
  (default the signal on) is a coordinator/Steve call, not
  this arm's.

## GO / NO-GO bars (binding — judge only against this)

Primary metric (conjunction — both halves must hold):
(a) SECOND LINKS FORMED per 8 seeds, armed vs control.
(b) 150206-CLASS SEEDS ELIMINATED: a 150206-class seed is
defined as >= 10 link stagings with 0 link picks on that
seed (stagings = `stagedTele` total link stagings; link picks
= `talk.linkPicks`, `link:` choice picks in held sittings).
150206 itself is the class exemplar: 28 stagings, 0 picks.

- GO candidate: armed second links >= control second links
  (no regression against the talkturn-a substrate) AND armed
  150206-class count == 0.
- NO-GO: armed second links < control, OR any armed seed is
  150206-class.
- Contingency, pre-registered: if the control leg contains 0
  150206-class seeds (the class fails to reproduce on current
  master — the control is the talkturn-a policy on a moved
  master, see Method), half (b) is vacuous and the verdict
  rests on half (a) alone; the evidence will state this
  plainly rather than claim an elimination that was never
  tested. A miss is NO-GO, never re-scored against a friendlier
  metric mid-run. Metric problems go under "metric review" for
  the NEXT run.
- A GO candidate goes to a FRESH confirm band (checked at
  confirm time per the seed-band-freshness skill) before any
  landing claim. 150209–150216 is RESERVED for tendexact-a's
  confirm (run claim fleshout-20261110T1415Z) — do NOT take it.

Secondary (reported, never the judge): raises answered
(accepted + refused tele events) vs expired, per leg; first-link
source per seed; talk mechanism per seed (held sittings, turns,
link picks, talks with a raiser while a raise was pending,
seats to raisers, unanswerable-pending days); counters staged;
seasoned links; polities; control-vs-talkturn-a-armed
diagnostic comparison (same seeds, moved master — diagnostic,
not a validity gate).

Cost bar (binding deciding bar — the per-day revision from the
talkturn-a metric review, pre-registered here WITH its
rationale): deaths per 100 village-days armed <= control +
10% AND starvation deaths armed <= control + 2 AND arm-only
starvation (armed starvation deaths on seeds where control
starvation = 0) <= control starvation total AND median
survival armed >= 0.8x control median. "Deaths per 100
village-days" = total villager deaths / total village-days
lived x 100, per leg (village-days = sum of per-seed days).
"Starvation" = cause matching /starvation|hunger/i (harness
live capture `result.samples.deaths`).
RATIONALE for the per-day revision: the raw-total clause
(`total deaths armed <= control total`) is twice-proven to
measure days lived, not lives cost — talkturn-a: 696 vs 603
at identical per-day rates (0.707 vs 0.708 per village-day);
a village that lives longer accumulates more deaths at an
unchanged daily rate, so the raw-total clause punishes exactly
the survival it is meant to protect. The per-day clause
measures the rate; the starvation and median clauses are kept
as written. NOTE (disclosed, not re-scored): when control
starvation total is 0 — as in talkturn-a, 0 both legs — the
arm-only leg caps at 0, i.e. any armed starvation death on a
control-zero seed fails it. That zero-tolerance property is
the collapse the answermail-drive-a metric review flagged; the
bar as directed by the run brief is kept as written and judged
as written. If the cost bar fails, a GO candidate is HELD, not
landed (same rule as talkturn-a).

## Method

- Policy: `scripts/policies/competent.js` `{competent}` with the
  `RAISER_SEAT` gate added (default OFF). BOTH legs run
  `COMPETENT_TALK=1` (the talkturn-a substrate — held
  conversations on everywhere). Armed leg: `RAISER_SEAT=1`.
  Control leg: flag unset (identical seeds, identical code —
  the ONLY difference is the env var, set explicitly by the
  driver per leg so ambient env cannot leak across legs).
- Seeds: 150201–150208, IDENTICAL on both legs. Freshness
  check (this prereg, before any judged seed — full grep of
  dated preregs under `evidence/` for the band, per the
  seed-band-freshness skill): the band IS named — it is USED,
  not fresh. Namings found: `evidence/2026-11-10/sim-talkturn-a-prereg.md`
  (pilot band 150201–150208, confirm 150209–150216);
  `evidence/2026-11-10/sim-answermail-drive-a-prereg.md`
  (pilot band 150201–150208, confirm 150209–150216); run claim
  `hidden_files/lever-claims/fleshout-20261110T1415Z.json`
  (sim-tendexact-a adoption: armed 150201–150206, base
  150201–150208; confirm 150209–150216 reserved for
  tendexact-a). No standalone forbidden/contaminated band list
  exists under `evidence/`. IDENTICAL-SEED REUSE
  JUSTIFICATION (recorded here, as the skill requires): this
  run is a before/after comparison on identical seeds against
  the talkturn-a substrate, not a fresh-band claim — the control
  leg IS the talkturn-a policy (COMPETENT_TALK=1, no picker
  change), so reusing its band is the comparison itself; the
  task brief directs this band explicitly. The confirm band, if
  the pilot GOes, is a FRESH band checked at confirm time.
- Horizon: 150 days, death-aware (dead villages stop
  simulating; harness runDays death handling), to match
  talkturn-a / secondlink-a.
- Instrument: reuse of the secondlink-a recorder, unchanged
  (`scripts/secondlink-instrument-20261110.js` — daily
  snapshots, method wraps, lazy `tele('bond_proposed')`
  capture) and the talkturn-a talk recorder (adapted into the
  raiserseat driver: talk events gain the talked-to villager's
  commLevel; a daily pending-raise census with commLevel per
  pending raiser is recorded). New driver
  (`scripts/raiserseat-driver-20261110.js`, adapted from the
  talkturn driver): per-seed JSON to
  `evidence/2026-11-10/perseed-raiserseat-a/` (refuses to
  overwrite); sets/deletes `RAISER_SEAT` per leg and forces
  `COMPETENT_TALK=1` on both legs. New analyzer
  (`scripts/raiserseat-analyze-20261110.js`): reuses
  `talkturn-analyze-20261110.js` `analyzeSeedTalkturn` for
  classification/fates/wall, adds the 150206-class count, the
  per-day death-rate cost bar (with arm-only starvation), and
  the unanswerable-pending / seats-to-raisers reporting.
- Proof: `scripts/test-raiserseat-a.js` — RED->GREEN: (a)
  `raiserSeatOn()` env gate on/off; (b) `talkScore` unit legs
  on a fake Game: an answerable raiser with a pending ask
  outranks a stranger (+35 beats the stranger max 30 from a
  zero base; the 150206-shaped case: base 8 vs stranger 29 →
  43 > 29); no pending raise = picker unchanged (scores equal
  the old talkScore exactly); unanswerable raiser (commLevel
  'none') = no bonus; a want-bearer still outranks a low-base
  raiser (priority preserved: 0+35 < 100); (c) analyzer
  150206-class detection + revised cost bar (per-day, arm-only,
  starvation, median) on synthetic per-seed JSON; (d) live
  harness miniature (12d, seed 150201): flag-ON run takes real
  held turns with zero instrument errors and is deterministic
  across identical runs; flag-OFF run is byte-identical to
  plain competent on days + standing (the control leg is a true
  control — the gate adds nothing when off).
- Sense-test (SENSE-TESTING LAW): read at least one transcript
  / case where a raise is now answered and judge whether the
  conversation reads like people talking (a villager asking
  for a seat, the scholar sitting down with them), not a queue
  being drained; quote the lines.
- Scale-wall numbers every run: national / table / wins, wave
  4–5 unlocks, median survival, seasoning count, polities.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run, both legs), death-aware horizons,
  pre-registration (this file), metric binding (§14), balanced
  panel (§15 — the armed-vs-control comparison on identical
  seeds is the instrument, the pre-registered threshold is the
  judge; no panel file is fabricated).
