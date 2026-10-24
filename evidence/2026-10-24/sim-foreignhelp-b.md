# sim-foreignhelp-b: foreign-help / aid-crisis comms chain (DIAG + probe)

- run: fleshout-20261024T0925Z, axis scale-onramp, worker arm sim-foreignhelp-b
- claim: findings-backlog #872 (marked claimed by coordinator; worker does not
  touch sim-findings.md)
- mode: Phase 1 DIAG census (instrument-only, zero src/js) + Phase 2
  policy-side probe (one NEW policy file, zero src/js). No game-code change
  anywhere in this arm.
- question (#872): "the comms chain's four call tiers produced zero arrived
  allies on competent-policy sims; the 'aid' half of the aid-crisis is
  unexercised. Policy-side blank: does any policy ever call for help in a
  way that arrives, or is the chain decorative?"
- answer in one line: the chain is NOT decorative — competent policies
  simply never call. When a policy does call (maximal probe), allies arrive
  in 13/16 configs and 7/8 seeds with no survival regression. The binding
  gate is policy-side (never calls), with a second, engine-side cadence gate
  behind it (75% of resolved crises end before the policy's daily tick).

## Pre-registration (binding, MEASUREMENT.md §14)

- PRIMARY (DIAG): the gate, named with counts — calls per tier + arrivals on
  the pilot. DIAG-GO iff the census names the gate with counts (calls per
  tier + arrivals) on the pilot.
- SECONDARY (LEVER, Phase 2 only if DIAG finds a policy-touchable gate): one
  policy-side variant that calls earlier/louder, same baseline seeds.
  LEVER GO iff foreign-help arrivals >0 in >=3/8 pilot seeds AND no survival
  regression (median survival not worse than baseline; no new death-mode
  spike).
- Horizon: 180d death-aware (dead villages stop; +10d tail max is the
  harness's own endReason, villages end on loss). Seeds: FRESH band
  70311–70318 (verified unused: aidcrisis used 701xx, wallseg/postunlock
  used 702xx; no 703xx file existed anywhere in evidence/ or scripts/ at
  run start). Policies: leadfeast + belongfeast via armorvillage.armedFor,
  pinned substrate IDENTICAL to the aidcrisis census (FEASTSCALE_R13=1
  TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1
  ARMORVILLAGE=1; BLOODRESTRAINT/VETFORMATION/LINKFORM unset). Pilot 8
  seeds x 2 policies = 16 configs per mode; no confirm spend before the
  pilot passed (the pilot IS the judged sample for both bars).
- Convergence state: DIAG-GO, LEVER GO (pilot scope — see "what GO does and
  does not mean" below).

## Canon

No dedicated aid-crisis/comms canon doc exists — said explicitly rather than
inventing one. The chain is canonized in docs/ONTOLOGY.md (comms chain:
raiseAidCrisis, four tiers with honest costs, aidAskVillage standing>=ask,
aidHelpArrived, aidFight blow-by-blow) and in src/js/comms.js's own header
(four_tiers_honest_costs, signal_is_indiscriminate, runner_road_danger,
help_fights_blow_by_blow). Wave law from docs/MONSTER-WAVES.md; contests
from docs/CONTESTS.md (read for context; this arm does not touch contests).

## Instruments (zero src/js)

- scripts/sim-foreignhelp-b-instrument.js — comms-chain recorder installed ON
  TOP of scripts/vetaidcrisis-instrument.js: every callForHelp {tier, ret},
  every aidAskVillage verdict {via, villageId, verdict, trustBefore},
  every aidHelpArrived {villageId, partySize, result}, per-raise
  precondition snapshots (active links with trust, known-village count,
  integration stage, cry abilities held), per-resolve verbatim engine
  crisis.calls + helpAtDoor + attracted + pendingHelp left, and the first
  crisis's Game.say transcript. RNG-neutral (call-through wraps, no
  Math.random reads, no state mutation beyond recorder arrays).
  FH_SENSE_ALL=1 (sense runs only) additionally records arrival/help beat
  lines for every crisis.
- scripts/sim-foreignhelp-b-sweep.js — pilot census composer (baseline +
  callall modes, resume-safe, sha256-after-write, EPERM write-retry with
  real monotonic-clock backoff + fresh-process shell-cat fallback; see
  "infrastructure" below).
- scripts/policies/sim-foreignhelp-b-callall.js — the Phase 2 probe policy
  (SIMFOREIGNHELP_CALLALL=1, default OFF, pure delegation when off): on the
  first daily tick that sees a crisis with no call placed yet, calls runner,
  then signal, then system (stage 2+), then cry (if held), once per tier
  per crisis. A MAXIMAL probe, not a landing candidate: its costs are real
  and documented in the file (signal raises attracted, runner can die,
  system costs a favor, all tiers double-ask the same villages).
- scripts/sim-foreignhelp-b-analyze.js — corpus aggregator (gate counts,
  wall numbers, survival medians, per-config rows).
- scripts/test-sim-foreignhelp-b.js — proof test E1–E5 (corpus complete,
  zero instrument errors, gate named, transcript present, seed-band
  hygiene; E4 callall placements exist). ALL GREEN for both modes.
- Corpora: evidence/2026-10-24/perseed-foreignhelp/ (16 baseline + 16
  callall JSONs, anchor 73d344a8769b) + sense run
  evidence/2026-10-24/perseed-foreignhelp-sense/s70311-lead-callall.json
  (byte-identical judged fields to the corpus config — determinism spot
  check: same 27 calls / 65 asks / 27 arrivals).

## Phase 1 — DIAG census (baseline: competent policies as-is)

16/16 configs, zero instrument errors. Raised 170, resolved 167, live at end
3. Resolutions: fought 151, moved-on 16. Crisis duration median 1 day
(136/167 resolve the next day; max 7). Raise waves: w1 60, w2 50, w3 29,
w4 27, w5 4.

| gate count | baseline |
|---|---|
| calls, all tiers (runner/signal/system/cry) | 0 / 0 / 0 / 0 |
| aidAskVillage verdicts | 0 |
| aidHelpArrived events | 0 |
| crises with helpAtDoor > 0 | 0 / 167 |
| crises with attracted > 0 | 0 |
| raises with ZERO active links (uncallable) | 48 / 170 |
| raises with a link at trust >= 35 (callable: the AID_ASK_TRUST floor) | 114 / 170 |
| raises at integration stage >= 2 (system relay available) | 162 / 170 |
| raises with a cry ability held | 14 / 170 |
| active links seen across raises | 239 |

DIAG-GO: the gate is POLICY-NEVER-CALLS, named with counts. Preconditions
do NOT explain the zero: 114 raises had a callable link (trust >= 35,
several at trust 64–79), 162 had the system relay available, and still zero
calls, zero asks, zero arrivals. The 48 zero-link raises are real but are
the minority (28%) — and they are early-game raises (days 8–24 in the
smoke config), before the village has any links at all. The chain is
policy-untouched, not engine-broken: nothing in the engine was ever asked.

Wall numbers, baseline (per policy in the paired table below): national
5/16 (lead 5/8, belong 0/8), table 11/16 (lead 5/8, belong 6/8), won 0/16,
wave-4 unlock 14/16, wave-5 unlock 3/16, median survival 117.5d (lead 118,
belong 116.5). All villages end village-lost except 70317-belong
(survived 180d); 70316 dies day 20 on BOTH policies (an early hard seed,
not a policy effect).

## Phase 2 — probe (callall: maximal calling, same seeds)

The DIAG gate is policy-touchable, so Phase 2 ran: same 16 configs, same
seeds, the callall probe wrapped around the same base. 16/16 configs, zero
instrument errors.

| gate count | callall |
|---|---|
| calls by tier (runner/signal/system/cry) | 44 / 44 / 44 / 12 (total 144) |
| resolved crises with >= 1 call | 44 / 176 |
| resolved crises with NO call | 132 / 176 (75%) |
| aidAskVillage verdicts | 302 |
| — signal accepted / refused | 94 / 26 |
| — system accepted / refused | 91 / 29 |
| — runner accepted / refused / nolink | 34 / 12 / 1 |
| — cry accepted / refused | 10 / 5 |
| aidHelpArrived events (arrived / stood-down) | 204 / 25 (total 229) |
| resolved crises with helpAtDoor > 0 | 35 / 176 |
| configs with >= 1 arrival crisis | 13 / 16 |
| seeds with >= 1 arrival crisis | 7 / 8 |
| crises with attracted > 0 (every signal call raises it) | 44 / 176 |
| runner road deaths (cause 'aid-runner') | 4 (lead only) |

Per policy: lead — resolved 93, called 29, help crises 24, calls
29/29/29/7, arrivals 168 arrived + 17 stood-down, runner deaths 4.
Belong — resolved 83, called 15, help crises 11, calls 15/15/15/5,
arrivals 36 arrived + 8 stood-down, runner deaths 0. (Belong's
calls==asks==arrivals pattern on several configs reflects fewer links:
one ask per call rather than lead's broadcast asks to all links.)

LEVER GO (pilot scope): arrivals >0 in 7/8 seeds (>=3 required) AND
median survival 142.5d vs baseline 117.5d (lead 147 vs 118, belong 117.5
vs 116.5; paired median diff +5d, mean +7.1d) AND no death-mode spike
(death-cause shares near-identical; totals 635 -> 656; the only new cause
is 'aid-runner' x4, the probe's honest, attributable road-danger cost —
not a spike). Proof test E1–E5 ALL GREEN for callall.

### The second gate (behind the first): cadence

75% of resolved crises (132/176) STILL got no call even under maximal
calling. Why: the policy's daily tick runs once per loop-day, at the end
of the day (sim-harness runDays: 3 part-waits with fights, then daily,
then sleep), while the median crisis lasts 1 day and usually resolves
'fought' in the day's own fights before the daily tick ever sees it.
The call window is therefore: the crisis must survive the day's fights
to reach the evening daily — which happens exactly when the scholar
CAN'T clear the door alone (later, higher-wave crises). Evidence: in
the sense run, crises d8–d85 all resolve 'fought' the next day with no
calls; from d92 on, crises last 6+ days and calls land, asks accept, and
parties march in. This cadence gate is engine-side (tick order + 1-day
median crisis), not policy-side — a future arm that wants calls on
1-day crises needs an intra-day trigger (e.g. a crisis-raise hook), not
a louder daily policy. Flagged as a finding, not built (out of scope
for a policy-side arm; engine change needs a steve-call if pursued).

### What GO does and does not mean

GO means: the comms chain is policy-reachable — calling produces real
arrivals (named leaders, real party sizes, blow-by-blow allies at the
door) at no pilot survival cost. GO does NOT mean "land callall": callall
is a maximal probe with deliberate costs (every signal call raises
attracted and blocks fleeing; runners died 4 times; the system takes a
favor per relay; signal+system double-ask the same villages, producing
two parties with the same faces — a probe artifact visible in the sense
lines). The follow-up arm is a single-tier comparison (runner vs signal,
one call per crisis) before anything lands as competent play.

### Honest wiggles (reported, not hidden)

- Wave-5 unlocks 3 -> 1 (70311-lead and 70317-lead lose wave 5 under
  callall; only 70317-belong keeps it). National per-config: 70315-lead
  loses national (1 -> 0); 70318-lead gains table (0 -> 1). Totals:
  national 5/16 both modes, table 11/16 both modes, wins 0 both modes.
  On 16 configs these are trajectory-divergence wiggles, not a bar
  failure (the pre-registered bar is median survival + death-mode, both
  pass) — but a confirm run should watch wave-5/national, since callall
  changes which fights happen and therefore standing.
- Runner asks refuse far more than signal/system on lead (8 refused vs
  21 accepted, and 8/8 refused on the first callall config): the runner's
  verdict lands days later via commsTick (trust may have moved, the far
  village may be mid-crisis, or the holder softened the plea, -12 score).
  The instrument records verdicts but NOT refusal reasons (the engine
  says them aloud and writes them to link history, which this instrument
  does not read) — refusal-reason attribution is a follow-up instrument
  gap, noted in metric review.
- Stood-down 25: parties that marched but arrived after the door went
  quiet — the "too late" class. Real, counted, and small next to 204
  arrived.

## Reachability verdict

- The aid-crisis channel itself: reachable (170 raised / 167 resolved on
  baseline; waves 1–5 all raise crises, w5: 4 raises).
- The comms chain's HELP half: UNREACHABLE under competent policies
  (0/167) but REACHABLE under calling policies (35/176 resolved crises
  with allies at the door; 204 arrived parties). It was never
  decorative — it was never invoked.
- Waves 1–5 unlocks, regional -> national, table, win flag: national
  5/16, table 11/16, wins 0/16 on both modes. The scale wall stands
  (wins 0), but national/table reach is real on this seed band, unlike
  the 2026-10-12 wall census (national 0, table 0) — the base has moved
  since, as aidcrisis also reported.

## Village assessment (plain words)

What the villages looked like: fed, armoring villages that fight their
own door alone. On baseline, the village looks to the scholar and the
scholar answers alone — 151 crises fought to quiet, zero calls placed,
zero allies ever walking in, even on villages holding links at trust 79
with the relay available. On callall, the same villages become places
other villages march to: Thornfield, Stonebridge, and The Hungry Road
send named people (Ines Nguyen, Yuki Brooks, Elena Fischer) with
counted parties, named faces, and stated costs ("3,600 kcal of work, or
the trust of it"), and they head home afterward with "the debt stands."
Who thrived: villages with high-trust links (trust 64–100) — their calls
accept and their doors fill. Who died: runners on the road (4, lead
only) and the usual chair-grinder deaths (combat dominates both modes).
What knowledge/capabilities were missing: nothing engine-side — the
capability (call tiers, asks, arrivals, blow-by-blow ally fights) was
all present and working; the missing piece was a policy that uses it.
Blank filled: #872 is answered (policy-never-calls, not decorative) and
the chain is proven reachable with counts.

## Sense check (SENSE-TESTING LAW)

Read end-to-end: the 70311-lead baseline first-crisis transcript (124
say lines, d8–d9) and the callall sense lines for the same seed (106
arrival/help beat lines across all crises). Judgments:

- The crisis arc reads as designed and meaningful: "🚨 ... is at Haven's
  door. The village looks to you." -> villagers mend, teach, gossip,
  argue by the fire (Paola's trade-story confrontation, Ava teaching
  Ghost Pipe, Elif reading the sky) -> the scholar fights White Noise
  alone -> "The door is quiet. Haven breathes." -> the-siege beat fires
  ("They came in the night for the pantry — and the village met them at
  the door with blades and fire"). Villagers act like people throughout;
  nothing robotic, nothing repeated verbatim except the system beats.
- What did NOT read sensibly on baseline: the village looks to the
  scholar and the scholar ONLY — four call-for-help options are
  announced in the fiction ("Four ways to call... Each with honest
  costs") and then never used in 16 runs. The promise is spoken, never
  kept. That is the #872 blank in fiction form.
- On callall, the kept promise reads sensibly: acceptances name the
  speaker, the village, the party size, and the cost ("Old friends
  don't count the grain... 4 of us — we're coming. Hold the door."
  / "Our foragers leave our fields... 3,600 kcal of work, or the trust
  of it."); arrivals name leader + faces ("🥁 Yuki Brooks of Stonebridge
  walks in with 2 — Yuki Brooks, Rosa Fischer, Malik Tanaka. 'We're
  here. Where's the teeth?'"); departures close the loop ("heads home —
  the door is quiet. The debt stands."). Consequences are real: trust
  moves, debts stand, runners die, attracted smoke draws company.
- Two wrinkles, both named not hidden: (1) the probe's double-ask —
  signal + system both accepted by the same village yields two parties
  with identical faces (Ines 4 + Ines 4); sensible as "two asks, two
  parties" but it is a maximal-calling artifact, and a single-tier policy
  would not show it. (2) Early crises resolving in 1 day with no call
  while the fiction says "the village looks to you" — the scholar
  answers alone before anyone could be called; that is the cadence gate
  in fiction form, and it is honest (the door was cleared, not ignored).
- Instrument footnote: the baseline first-transcript is missing its
  literal 🚨 raise line (capture started after the raise announcement
  spoke); fixed mid-run in the instrument so callall transcripts include
  it. The baseline sense judgment above uses the raiseSnap + code line
  for the announcement and the full d8–d9 arc otherwise.

## New findings (for the coordinator to append to sim-findings.md)

- [open] 2026-10-24 — foreign-help cadence gate — 75% of resolved crises
  (132/176) end before the policy's once-a-day tick under maximal
  calling; median crisis lasts 1 day. A call policy can only reach
  crises that survive the day's fights. (sim-foreignhelp-b evidence.)
- [open] 2026-10-24 — runner-ask refusal skew — runner asks refuse more
  than signal/system asks on lead (8 refused vs 21 accepted; 8/8 on one
  config); refusal reasons (trust vs their-crisis vs score) are not
  recorded by this instrument — needs link-history attribution.
  (sim-foreignhelp-b evidence.)
- [open] 2026-10-24 — callall double-ask artifact — calling signal +
  system yields two accepted parties with identical faces from one
  village; a landing policy must pick one tier per crisis, not all.
  (sim-foreignhelp-b evidence.)
- [open] 2026-10-24 — callall wave-5/national wiggle — wave-5 unlocks
  3 -> 1 and 70315-lead loses national under callall at pilot scale;
  watch on any confirm run. (sim-foreignhelp-b evidence.)

## Metric review

- The pre-registered DIAG bar (gate named with counts) worked as written
  and was met exactly: calls per tier (0/0/0/0 baseline; 44/44/44/12
  callall) + arrivals (0 baseline; 204 arrived + 25 stood-down callall).
  No re-scoring was needed.
- The LEVER bar's "no survival regression" leg was judged on paired
  medians (142.5 vs 117.5) + paired diffs (median +5d, mean +7.1d) +
  death-cause shares (no spike). The wave-5/national wiggle is NOT part
  of the pre-registered bar and was not used to fail or pass the arm —
  it is reported as a watch item for the NEXT run, per §14.
- Balanced panel (§15): NOT run, and invalid-by-construction for this
  comparison — scripts/balance-panel.js runs its own fixed-registry
  policies (capable/risk-aware/socialite/winseek) on its own seed set
  and cannot ingest existing corpora or the armorvillage lead/belong x
  703xx arms; its `compare` subcommand compares two panel outputs, not
  a baseline/probe corpus pair. The comparison here is instead: identical
  seeds, identical pinned substrate, identical instrument, before/after
  on the judged fields — with the panel's role (instrument vs judge)
  preserved by the pre-registered bar. If a future panel gains a
  corpus-ingest mode, re-running this pair through it is cheap (both
  corpora are committed).
- Proposed revision for the NEXT run: record aidAskVillage refusal
  REASONS (read the link-note kind the engine writes: trust / mid-crisis
  / didn't-carry) so the runner-refusal skew can be attributed; and
  record the call-to-arrival latency in parts (askedDay -> arrival day)
  so the "too late" (stood-down) class can be split by tier.
- Instrument bug found and fixed mid-run (see sense footnote): transcript
  capture started after the raise announcement. The fix (capture before
  oRaise) is in the committed instrument; baseline transcripts carry the
  footnote, callall transcripts are complete.

## Infrastructure (LOUD, for the coordinator)

- Container EPERM write flap hit this run repeatedly (evidence-dir
  writes failing with EPERM, leaving 0-byte files, across ~09:30–09:50
  UTC): the baseline sweep died twice on the 70312-lead write, and a
  20-attempt retry loop with a Date.now backoff fired all attempts in
  one second (the harness freezes Date.now — fixed to performance.now
  monotonic backoff). Fresh processes wrote 80KB files fine while the
  sweep process failed 16+ times, then the flap cleared and the same
  writes landed. Final state is clean: all 32 corpus files + sense file
  present with sha256-after-write verified. No ref surgery was done on
  any tree. Lesson recorded in the sweep script's comments (monotonic
  backoff + fresh-process shell-cat fallback); the flap itself is
  container-level, not this arm's code.
- No sibling worktrees touched; no main-tree writes; no pushes, bumps,
  or live verification (ship loop owns those).

## Paired wall table (baseline -> callall, gameDays)

| seed-policy | days | national | table | maxWave |
|---|---|---|---|---|
| 70311-belong | 118 -> 101 | 0 -> 0 | 1 -> 0 | 4 -> 3 |
| 70311-lead | 118 -> 145 | 0 -> 1 | 1 -> 1 | 5 -> 4 |
| 70312-belong | 114 -> 130 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70312-lead | 118 -> 143 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70313-belong | 113 -> 106 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70313-lead | 144 -> 149 | 1 -> 1 | 0 -> 0 | 4 -> 4 |
| 70314-belong | 117 -> 142 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70314-lead | 115 -> 143 | 1 -> 1 | 1 -> 1 | 4 -> 4 |
| 70315-belong | 116 -> 106 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70315-lead | 114 -> 151 | 1 -> 0 | 1 -> 1 | 4 -> 4 |
| 70316-belong | 20 -> 20 | 0 -> 0 | 0 -> 0 | 1 -> 1 |
| 70316-lead | 20 -> 20 | 0 -> 0 | 0 -> 0 | 1 -> 1 |
| 70317-belong | 181 -> 181 | 0 -> 0 | 0 -> 0 | 5 -> 5 |
| 70317-lead | 179 -> 160 | 1 -> 1 | 1 -> 1 | 5 -> 4 |
| 70318-belong | 123 -> 129 | 0 -> 0 | 1 -> 1 | 4 -> 4 |
| 70318-lead | 180 -> 178 | 1 -> 1 | 0 -> 1 | 4 -> 4 |

Branch sim-foreignhelp-b, anchor 73d344a8769b, ready for coordinator merge
(merge locally, pending ship — no push/bump/live verification by this
worker). Verdict: DIAG-GO (gate = policy-never-calls, counts above) and
LEVER GO at pilot scope (arrivals in 7/8 seeds, median survival 142.5d
vs 117.5d baseline, no death-mode spike). Landing callall itself is NOT
recommended; the next arm is a single-tier call comparison.
