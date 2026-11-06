# sim-mootgate-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-mootgate-a (Loop A, food-economy / narration).
Run: fleshout-20261106T1115Z, axis food-economy, arm sim-mootgate-a.
Assignment: BUILD the named moot-convening gate (follow-up to arm
sim-mootsummon-a, run fleshout-20261106T0821Z) and prove it
before/after on identical seeds.

Base HEAD at prereg time: cc4345e1e (branch sim-mootgate-a,
2026-11-06; master has moved since the 0821Z corpus base
b5fb49607). No single canon doc covers moots / justice /
trials — no MOOT/TRIAL/JUSTICE canon doc exists in docs/
(checked 2026-11-06; CANON.md registers no moot doc). The design
lives in docs/CANON.md (read first) and in the precedent evidence
below. No canon is invented here.

## Precedent (read, not re-measured)

- evidence/2026-11-06/sim-mootsummon-a.md + prereg
  sim-mootsummon-a-prereg.md: the defect, powered on 40 seeds
  (48001–48040): trial moots summon a stranded scholar (1/22
  stranded sleep windows, 4.5% vs 43/2,185 non-stranded, 2.0%)
  with no position gate anywhere in the trial-moot path
  (tallyVotes names the scholar a voter without asking where
  they are); the vote can only be cast in conversation at the
  fire, so a stranded scholar cannot answer and 52/56 moots
  resolve via the 2-day backstop without them. The fix named
  there — and built here — is to GATE the trial moot's
  convening on the scholar being at Haven.
- Metric-review items from sim-mootsummon-a, incorporated here:
  (1) loop-day primary rate (summons on stranded loop-days,
  any phase — 12/56 summonses fired in harness phase, so the
  sleep window can undercount); (2) case-identity follow-up
  (accused set from the LIVE line) with a 5-day follow-up
  window (the 3-day window was too short when moots overlap —
  48020 ld13/ld17 share one ld19 backstop); (3) dead-case
  line classifier (betrayal.js ghost-trial closure ~1170 —
  "the moot doesn't try the dead") so never-resolved cases
  can be classified as closed-by-accused-death vs stuck.

## The fix (named, built here)

GATE the trial moot's convening on the scholar being at Haven:
npcMootTick / playerCaseTick skip convening while the scholar
is not inside Haven — the same position question the
haven-news/raid-call family asks (`scholarAtHaven()`,
game.js ~23090: standing on the haven tile). The LIVE
broadcast, the call line, the summons, and awaitingPlayerVote
all wait together. The 2-day backstop is UNTOUCHED (it covers
silence AFTER the summons, which can then only happen at the
fire, where silence is a choice). The petition moot needs NO
fix (player-convened, synchronous, cannot summon while away
by construction). The gate is placed in the two ticks BEFORE
any announcement line is said, so a held case burns no
"first time" convening line while the scholar is away, and
consumes no trial RNG while held. Player-convened recall via
conversation (betrayal.js ~4613, callMoot from convoChoices)
is NOT gated: it is a deliberate player act, and the player
is present in the conversation that calls it. That residual
is named in the evidence, not hidden.

## Primary metric

Summons on stranded LOOP-DAYS, any phase (loop-day rate, per
mootsummon metric-review item 1 — not just the sleep-window
rate): stranded loop-days holding >= 1 summons line /
stranded loop-days, before vs after on IDENTICAL seeds.
The sleep-window rate is reported alongside for comparability
with the mootsummon census. The petition moot is tracked by
kind and must stay 0 stranded (it cannot summon while away
by construction).

- GO threshold (all three must hold):
  (a) after-leg stranded-loop-day summons = 0 (before was
      1/22 loop-days on the 0821Z corpus);
  (b) non-stranded moot convening preserved: after-leg
      non-stranded summons windows >= 50% of the before-leg
      count (moots still convene at Haven — the gate must
      delay moots, not kill them);
  (c) no survival regression: median daysAlive after >=
      before − 10d.
- STALL MEASURE (reported, no GO bar): held-open case
  duration — for each case, days from convene-eligibility
  (c.day + mootIn) to convening, from per-evening case
  snapshots in the driver; report max/median among cases
  held while the scholar was away. If any case is held
  > 14 days, flag it as a finding (report it, no GO bar).
- VERDICT RULE: GO iff (a) + (b) + (c) all hold on the
  judged legs. A miss on any leg is NO-GO, never re-scored
  against a friendlier metric mid-run.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (dead villages stop simulating).
- Policies: bankfood(warmed(woodcarry(nighttravel))) over
  competent, env gates COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1
  WOODWARM=0 BANKFOOD=1 STRANDNARR=1 (the mootsummon leg,
  verbatim). COMPETENT_TALK unset (default OFF — the sim
  policy never takes a conversation choice, as in
  mootsummon-a; no vote is ever cast in sims, stranded or
  not, so resolution is observed via the backstop / dead-case
  line only).
- SEEDS: 48001–48040 (the full mootsummon judged band),
  BOTH legs re-run on current master. No pilot/screen split:
  the before leg is a re-measurement on the same band, the
  after leg is the judged comparison; 40 seeds each, every
  seed run, stranding or not.
- SEQUENCING: (1) prereg commit; (2) instrument + proof
  commit (diag extension + new driver + proof test, no
  src/js); (3) BEFORE leg on current master (unfixed code),
  commit corpus; (4) game-code fix commit ([needs-eyes]);
  (5) AFTER leg, commit corpus; (6) evidence.
- BALANCED PANEL (§15): the judged comparison is the
  identical-seed mootgate driver (before vs after legs on
  the same 40 seeds, same env gates, same policies). The
  balance panel measures survival/scale outcomes, not moot
  summons delivery; survival guard (c) is measured per-seed
  inside both legs. No separate panel run; the reason is
  stated here, not hidden.

## Seed-band note (deliberate reuse, not a fresh-band claim)

48001–48040 is DELIBERATE before/after reuse of the
mootsummon judged band (named in
sim-mootsummon-a-prereg.md), not a fresh-band claim. Reuse
is intentional: a before/after comparison is only valid on
identical seeds. No other live run uses this band (Loop B
is on 53001–53008 / 58001–59001). The committed mootsummon
corpus (evidence/2026-11-06/sim-mootsummon-a-corpus/) is a
CROSS-CHECK only, never the judged before leg — master
moved since base b5fb49607, so both legs are re-run on
current master (cc4345e1e).

## Instrument

Reuse and extend the mootsummon instrument
(scripts/policies/mootsummon-diag.js +
scripts/mootsummon-trace-a.js). New driver
scripts/mootgate-trace-a.js (the mootsummon driver with
ONLY the disclosed changes: 5-day follow-up, case identity
from the LIVE line, dead-case line classifier kept in the
trim, per-evening case snapshots for the stall measure,
loop-day primary rate). The diag extension adds:
isDeadCaseLine ("<X> is gone — the moot doesn't try the
dead"), accusedSetFromLive (names between "TONIGHT: " and
" stand accused"), and 'dead-case' to the beat kinds.
Follow-up per summons: backstop / exiled / verdict-count /
verdict / vote-cast / vote-lands within 5 loop-days +
dead-case line naming one of the accused (case-identity
match) + still-open-at-end flag. Track the two
never-resolved mootsummon cases (48006 loop-day 19, 48039
loop-day 13) and say whether they closed by accused-death
or are stuck at awaitingPlayerVote — in the NEW before leg
(if the events reproduce) and in the after leg.

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood
evening records, morning records, first-upkeep kcal series,
and daily-entry scholar kcal must be identical. Any
divergence = instrument contamination; the run stops and
the instrument is fixed first.

## Anchors (judged in the proof test, before the pilot)

- 17021 CURRENT-SUBSTRATE FACTS (verify — do not assume):
  the mootsummon re-pin says 17021 is 60d SURVIVED, 0
  stranded nights on base b5fb49607. The proof test asserts
  the mootgate driver reproduces 17021's CURRENT-substrate
  daysAlive and stranded-night count on THIS master
  (cc4345e1e). If it does not match the re-pin, that is
  reported as a finding (substrate drift), not silently
  re-anchored — the proof is revised to pin the measured
  facts with the drift documented.
- 15003 loop-day-7 gossip anchor (strandnarr-a §2): the
  proof test asserts the driver captures a `Word gets around
  the haven` line inside the loop-day-7 sleep window on seed
  15003, classified non-stranded sleep with the scholar
  inside Haven.
- 48006 loop-day 9 (the mootsummon hit): the BEFORE leg must
  reproduce a summons on stranded loop-day 9 (the defect
  still live pre-fix — if it does not reproduce, that is
  substrate drift to report, and the before-leg rate is
  still the judged before); the AFTER leg must NOT summon
  there (anchor for the GO bar (a)). The proof test asserts
  the after-leg fact on the fixed code (one 48006 instance).

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO per
the rules above, never re-scored against a friendlier
metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file with a revision
proposed for the NEXT run. Every evidence file carries a
"metric review" section.

## Wall numbers (carried, NOT re-measured)

Carried state from the 1041Z round (0915Z run, 24 distinct
seeds): wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24. Consistent with the 0028Z
round (evidence/2026-11-05/sim-winnability-round-0030.md):
wins lesser-only, full seat 0, wave-5 kills 0.

## Deliverables

- evidence/2026-11-06/sim-mootgate-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-06/sim-mootgate-a.md (verdict, loop-day
  primary rate before/after, sleep-window rate alongside,
  kind split, resolutions incl. dead-case classification,
  stall measure, sense verdicts, metric review, wall
  numbers)
- evidence/2026-11-06/sim-mootgate-a-corpus-before/ (40
  per-seed JSON, unfixed code) and
  evidence/2026-11-06/sim-mootgate-a-corpus-after/ (40
  per-seed JSON, fixed code)
- scripts/policies/mootsummon-diag.js (extension: dead-case
  classifier + accused-set extraction + 'dead-case' beat
  kind; existing classifiers untouched)
- scripts/mootgate-trace-a.js (driver: mootsummon driver +
  5-day follow-up + case identity + dead-case trim +
  per-evening case snapshots + loop-day primary)
- scripts/test-mootgate-a.js (proof: unit classifiers +
  case-identity + follow-up + det-gate + anchors +
  gate unit/integration tests incl. 48006 anchor)
- src/js/betrayal.js (the gate, in npcMootTick /
  playerCaseTick only; backstop untouched; petition moot
  untouched) — commit message MUST include [needs-eyes]
  (feel change: justice timing).
- No push, no bump, no live verification (coordinator
  merges; ship loop owns deploys).
