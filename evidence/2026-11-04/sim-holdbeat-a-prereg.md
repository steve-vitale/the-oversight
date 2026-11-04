# Hold-beat diagnostic — Loop A, run fleshout-20261104T0820Z, arm sim-holdbeat-a

Axis: scale-onramp / winnability chain. DIAG-ONLY arm: zero src/js
changes, zero policy-file changes, zero gate/price/deed/standing/
veteran-counting changes. If any lever is found, it is documented
as a finding for the coordinator — this arm judges NO lever.

## Canon read

docs/CANON.md read first. No canon doc covers standing, the
wave-5 door, or veteran counting — stated here instead of
inventing canon (same gap sim-standacc-b recorded). The door
rule used below is read from code, not assumed: src/js/
standing.js `villageStandingTotal()` (gated total; release
records `_standingPeakWave`; deferral holds fire
`_standingHoldBeat`) and `waveCombatReadiness(5)` (veterans =
living roster members with a wave-4+ kill in
`state.waveKillLog`; wave-3 kills do NOT count, per
sim-standacc-b — narration celebrating wave-3 kills as
"veteran kills" is show language, not the gate count, and the
two are never conflated in this arm).

## The two questions (from sim-killconv-a findings)

Q1 — TWO-VETERAN OVERLAP RELEASE OUTCOME: killconv reported
99110 holding 2 living veterans d108–d109 (lena_ruiz + nadia_
khoury, both d108 kills; nadia died d109 in the next fight)
but did NOT instrument standing/door/release on that window.
Question: on the overlap window, was the wave-5 door open on
any standing-sufficient day (capped >= 200), and did a
release event fire or fail to fire? An overlap re-cited
without door state is NOT an answer.

Q2 — HOLD-BEAT TIMING: killconv reported a hold beat saying
"blood your fighters (0 of 2 veterans)" inside 99101 d134's
kill end block, immediately after the kill. Question: does
that beat read BEFORE the kill is credited to the veteran
count (a read-order artifact — the beat's readiness snapshot
predates the kill credit) or AFTER (a real count gap)?
Mechanism, not symptom; neither is claimed as a bug without
proof.

## Instruments (reuse, not re-invention)

- Daily snapshots: the sim-standacc-b instrument shape
  (`standacc-instrument-20261104.js` logic, re-implemented
  as `holdbeat-instrument-20261104.js` with additions below):
  daily `villageStanding()` breakdown (war/diplomacy/plenty),
  `standingPlentyCappedTotal()` (capped vs 200), readiness-5
  bars + veterans recount from `waveKillLog` (wave-4+ killers,
  living), `_standingPeakWave()` (door state), scale rank,
  wave-4/5 faced. The snapshot NEVER calls
  `villageStandingTotal()` or `unlockedWave()` (both
  side-effecting: peak recording + beats) — door opens are
  observed only as the ENGINE announces them (release
  say-lines + peak transitions between daily snapshots).
  ONE end-of-run `unlockedWave()` call is reported
  separately and never counted as a natural door-open.
- Q1 additions: per-day overlap flag (living-veteran recount
  >= 2), standing-sufficient flag (capped >= 200), ready flag
  (readiness-5 ready), and the count of NATURAL
  `villageStandingTotal()` calls per day (call-through wrap,
  RNG-neutral) — so "release never evaluated" can be told
  apart from "evaluated and held".
- Q2 additions: a single global sequence counter across ALL
  captured events in a run. Every event carries `seq`:
  `recordWaveKill` / `recordPyrrhicKill` entry + exit (with
  waveKillLog length before/after, killer, wave), every
  captured say/sysSay line (classified: hold beat / veteran-
  kill beat / release beat / other standing line), and
  `villageStandingTotal()` entry/exit. In the say wrap, when
  a line matches the hold-beat shape ("blood your fighters
  (N of M veterans)"), the instrument ALSO records, at that
  exact moment, the live `waveCombatReadiness(5).veterans`
  value and waveKillLog length (read-only reads) — the beat's
  own contemporaneous count, not an end-of-day recount.
  Best-effort beast HP at kill time from `Game.tbfight` (null
  outside TB) for the sense test.
- Kill/death attribution reuses the killconv instrument's
  lessons: leader-death-first classification is NOT needed
  here (no TB census), but field kills recorded after
  `fieldFight` returns are attributed by same-day kill-event
  rows, not by a field-call link (killconv finding).

## Seeds, policy, horizon

- Policy: `scripts/policies/competent.js` `{competent}`
  VERBATIM at this anchor, default env.
- PILOT (targeted re-runs, run first): 99110 (Q1 window) +
  99101 (Q2 beat) — the instrument must capture door state
  on 99110 and beat order on 99101 before the fresh band is
  spent. If it cannot, fix the instrument, do not spend the
  band.
- Fresh band: 99701–99708. Freshness verified 2026-11-04:
  no `evidence/2026-11-04/*.md` filename and no dated
  evidence `.md` in that directory mentions 99701–99708
  (grep over the day's `.md` files returned nothing; the
  9910x band and journey bands are the only seeds in use).
  If any collision had been found, a fresh band would have
  been picked and named here — none was.
- Horizon: 140 days, death-aware (dead villages stop; +10d
  tail max as implemented by runDays). WHY 140: both target
  events sit at d108–d134 in the old corpus; 140 covers
  them plus tail without simulating months past death.
- Anchor-move rule: do NOT pool with the old corpus, do NOT
  cite old numbers as baseline. The old d108–d109 window and
  d134 beat are TARGETS to re-find, not baselines. If the
  current anchor does not reproduce them, that is reported
  as non-reproduction, and Q1/Q2 are answered from whatever
  overlap windows / kill-day hold beats the new runs DO
  produce — or INSUFFICIENT-DATA if none occur.

## DIAG bar (pre-registered, binding)

DIAG-GO iff BOTH questions get a definitive mechanism answer
supported by instrumented evidence:
- Q1: for EVERY day of EVERY overlap window found in the
  judged legs, the window table states living-veteran count,
  readiness-5 veteran readout, standing breakdown + capped
  total, peak/door state, natural gate-evaluation count,
  and whether a wave-5 release event fired that day. If NO
  overlap window occurs in any judged leg, Q1 is answered
  "no overlap window occurred at this anchor on these
  seeds" with the closest approach stated (max living
  veterans held, and on what days) — that counts as a
  definitive answer only if the daily instrument demonstrably
  captured veteran counts on all legs (0 instrument errors
  on the veteran recount path).
- Q2: credit-vs-beat order proven on at least one kill case:
  a hold beat and a kill-credit event on the same day/seed
  with `seq` ordering plus the beat-moment veteran count,
  stating whether the beat read pre-credit or post-credit
  state. If no kill-day hold beat occurs, Q2 is answered
  from the general ordering evidence (kill-credit seq vs
  gate-evaluation seq on kill days) or INSUFFICIENT-DATA if
  even that cannot be shown.
Otherwise: DIAG-NO-CANDIDATE (a question answered as "not a
mechanism, explain why" — e.g. beat provably reads
post-credit state, or the door provably evaluated and held
on a standing-insufficient day) or INSUFFICIENT-DATA (state
exactly what was missing: no overlap window AND no
kill-day beat, instrument failure, etc.). A miss is NO-GO,
never re-scored against a friendlier question mid-run.

## Balanced panel (§15)

INAPPLICABLE: purely diagnostic, no before/after change, no
variant. No comparison is fabricated and none is attached.
Stated explicitly, not omitted silently.

## Sense-test (SENSE-TESTING LAW)

Read at least 2 transcripts from the judged legs: one
veteran-kill beat and one hold beat. Judge whether the
narration reads sensibly to a player — fresh kill vs mop-up
distinction (beast HP at kill time where captured), and beat
timing vs what just happened. Out-of-arm gaps go in the
evidence file's findings section for the coordinator to
append; hidden_files files are NOT edited by this worker.

## Proof

`scripts/test-holdbeat-20261104.js` must be green BEFORE the
pilot leg: fixture tests for (a) seq ordering (kill before
beat vs beat before kill both classifiable), (b) overlap-
window table construction from synthetic daily snapshots,
(c) hold-beat classification + beat-moment veteran capture,
(d) live harness smoke (short run, zero instrument errors,
natural gate-call counting works). Re-run green after any
instrument fix.

## Metric review

Carried in the evidence file (§14 — no in-run re-scoring).
