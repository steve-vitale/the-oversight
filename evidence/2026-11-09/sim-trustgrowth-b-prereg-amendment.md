# Trust-growth + polity probe — PREREG AMENDMENT 1 (instrument v2)

Committed BEFORE the judged run. The v1 pilot corpus
(`evidence/2026-11-09/perseed-trustgrowth-b/trustgrowth-s*-trustgrowth-pilot.json`,
RUN `trustgrowth-pilot`, anchor 9d4323d1a) is a SHAKEDOWN, not the
judged run: it exposed an instrument defect that makes its
attribution accounting unjudgeable, so the judged run is re-run as
RUN `trustgrowth-pilot-v2` under this amendment. Same seeds
(99101–99108), same policy (competent verbatim), same horizon
(150d death-aware), same DIAG-GO bars. Nothing about the question
or the bars changes — only the instrument.

## What the shakedown showed (and why v1 cannot be judged)

The v1 instrument wrapped `Game._trustGain` only, on the prereg's
premise (from the hierarchy.js header) that "every trust gain
routes through _trustGain". The pilot's own data refutes the
premise on current master:

- Seed 99102's link climbs 30 → 40 with only 4 logged gains (+1
  each, all `linkTick` tribute-weekly). The missing climbs are
  visible in the link's history notes and the say sample: `aid:
  Gave Emberhold 1,500 kcal aid. Credit stands.` on d20 (+4),
  and further +4s on d24/d53 with no history note at all.
- Band-wide reconciliation: 11 reconciled link-days against
  unattributed-up 241 and unattributed-down 141. The instrument
  was blind to most trust movement, so DIAG-GO clause 2 (every
  trust-up event attributed) cannot be judged on v1 — the
  accounting is incomplete by construction, not by a game finding.

## The defect, grounded in code (found by reading the pilot)

1. **Direct `link.trust` writes bypass `_trustGain`.** `comms.js`:
   `aidAskVillage` +3, `aidHelpArrived` +2, `repayAidDebt` +3.
   `safetynets.js`: `answerAidOffer` +4 / −3, `answerAidBeg`
   +4 / −2 / −5-or-−10, `resolveAidOut` +3 / −2. `titans.js`:
   night strike −5, muster −8, −5, trust→0, −2, −10. The
   hierarchy.js header claim covers hierarchy.js only; the aid /
   titan roads write the link directly.
2. **Day-phase offset.** Settlement gains (e.g. the weekly
   `linkTick` +1) are logged under day d but first appear in the
   snapshot of day d+1 (the driver snapshots at the end of
   `policy.daily`, before the engine's settlement). Day-matched
   reconciliation therefore misattributes even the gains v1 did
   log.
3. **History-note magnitudes are text-sensitive, not kind-fixed.**
   Kind `succession` covers both the −8 young-link haircut
   ("grief delays the verdict") and the zero-move "Another death
   while the link already grieves" note; kind `renegotiation`
   carries a stated −6, not the −5 the v1 map assumed. Kind-based
   down attribution cannot be trusted.

## Instrument v2 (what changes)

- **Property interception (the fix for defect 1).** At every daily
  snapshot the instrument installs, on each link object, a
  `trust` getter/setter (via `Object.defineProperty`,
  configurable, enumerable, value held in a closure; a `WeakSet`
  keeps installation idempotent). EVERY write to `link.trust` —
  `_trustGain` or direct — is logged as one event: {seq, day,
  linkId, other, old, new, delta, stack, via:'setter'}. The
  setter never alters a value. Known gap, stated: a write
  landing between a link's formation and its first snapshot is
  not setter-logged (formation sets trust 30 in the object
  literal, before any setter exists); the `_trustGain` wrap
  below still catches choke gains in that window.
- **`_trustGain` wrap kept (cross-check + gap cover).** The v1
  wrap stays, now also stamping each event with `seq`. The
  analyzer dedupes: a wrap event is dropped when a setter event
  with the same link + day and a `_trustGain` frame in its stack
  exists (paired in seq order); wrap events with no setter twin
  are kept (the formation-day gap).
- **Sequence intervals (the fix for defect 2).** A global counter
  increments on every logged event; each snapshot records `seq`
  (the counter at snapshot time). The analyzer attributes events
  to the snapshot interval `(prevSnap.seq, curSnap.seq]` — exact,
  independent of day numbering or phase.
- **Cause map extended (the fix for defect 3).** Causes are
  classified from the event's caller stack, never from history
  kinds: tend / tribute-weekly / arrears-settle /
  paytribute-full / arrears-forgive / accord-gift / accord-word /
  accord-visit / demand-honor / demand-refused / prove-worth /
  renegotiation-answer / renegotiation-silence (−6) /
  national-choice / oath / succession-haircut (−8) /
  their-speaker-died (−8) / aid-accept (+3, comms) /
  aid-arrived (+2) / aid-debt-repaid (+3) / aid-offer-accept (+4)
  / aid-offer-refuse (−3) / aid-beg-give (+4) / aid-beg-short
  (−2) / aid-beg-refuse (−5/−10) / aid-out-accept (+3) /
  aid-out-refused (−2) / tribute-thin (−1) / tribute-nothing
  (−2) / arrears-short (−6) / sabotage (−4) / titan-event /
  other-named:<fn> / unattributed. History notes are a
  cross-check only (an unattributed event is reported with its
  same-interval history kinds attached). The old kind→magnitude
  map is retained in the analyzer as that fallback, not as the
  attribution source.
- **Non-perturbation proof (stated in advance).** The v2
  trajectories must reproduce the standaccum-b band exactly
  (days 132/58/132/150/109/87/150/62, standings
  270/199/199/199/150/199/199/25): if any seed's days or
  standing differ, the setter is perturbing the run and the pilot
  is void. The proof test adds a setter-capture leg (a direct
  write is logged with its caller) and a seq-interval leg.

## What does NOT change

DIAG-GO bars (all four clauses), trajectory classes, seeds,
policy, horizon, the polity-blocking rule, the wall numbers.
The v1 corpus is kept in evidence as the shakedown that forced
v2; no v1 number is cited as a finding. The judged verdict is
read off `trustgrowth-pilot-v2` alone.
