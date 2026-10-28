# Journey social r62 — THE B7 FIX-SCORING RUN (lane B, 2026-10-28)

Leg 5 (social life), cycle r62. Follows r61 (dry-family census on
the PRE-B7 base: 2.245 dry/convo, dry9 99.8%, end-on-dry 65.7%).

Rotation-b read 5 at run start. This run ADVANCES rotation-b to 6
at closeout: leg 5's named-next question from r61's metric review
is the B7 fix-scoring run, which this run carries. (Rotation
note: r61 advanced 5 -> 6, but the file read 5 again at this run's
start — the endgame r59 adoption's 4 -> 5 write landed after r61
and clobbered it, the same class as the r59/r60/r61 clobbers. The
fleet's latest intent before this run was therefore social-next,
and leg 5 also carries the named-next question.)

## PRE-REGISTER (written before any r62 seed ran — see prereg.md)

**Leg questions:** (Q1) does B7 move the full dry-family census?
(Q2) does it move end-on-dry + the train-line rate? (Q3) cold-open
dry rate, first measurement (first NPC 'them' line matching one of
the 12 deflection lines, per conversation)? (Q4) people: 0
fabricated-history flags, weak endings <= 1? (Q5) guardrails
report-only vs r61?
**Arms (fresh seeds 5701-5704, smoke 5705 30d, DAYCAP=140,
death-aware):** ALL linger, seeded-speaker steering ON (constant,
excluded from the natural funnel, as r56-r61). No control arm:
r61's per-seed JSONs are the share-level comparison; no
turn-identity comparison claimed (fresh seeds; B7 changes
trajectories chaotically). Policy is r61's verbatim except seeds,
evidence dir, and the cold-open instrumentation (driver-only,
zero src/js).
**Bindings:** F1 dry-family < 1.0/convo pooled (r61: 2.245);
F2 end-on-dry < 20% pooled (r61: 65.7%); M5 5 sense-reads, 0
fabricated flags, weak <= 1, >= 2 dry-bearing or cold-open;
COLD rate reported per seed + pooled, no bar (first measurement);
D1/D2 census completeness; G guardrails report-only; NO-REGRESSION
check.js --quick at the standing profile (278/9).

## VERDICT: B7 GO — the fix transfers to natural runs

Both bars pass by wide margins, on all four seeds individually as
well as pooled. The dry wart that r60/r61 measured for two runs
is, on this band, closed:

- F1: pooled dry-family 0.266/convo (r61: 2.245) — an 8.4x drop,
  0.734 under the 1.0 bar. Per seed: 0.182 / 0.185 / 0.448 /
  0.297 — every seed passes F1 alone.
- F2: pooled end-on-dry 0.0% (r61: 65.7%) — ZERO of 1618
  conversations end on a dry line, on any seed. The ending wart
  is gone, not reduced.
- Train-line rate: 0.191/convo (r61: 0.912) — a 4.8x drop.
- Pool split: ALL remaining dry is dry9 (431/431, 100.0%);
  self3 is 0. The self-repeat pool B7 did not target is already
  empty on this band; the residual is run-ledger dry only.
- Share of conversations with >= 1 dry line: 20.0% (r61's
  train-line share was 89.1% on r60's sample; r61's dry share
  was not pooled in its note, but per-seed dry counts imply
  ~90%+). Four in five conversations now contain no dry line
  at all; histogram pooled: 0 dry lines 1294, 1 line 250,
  2 lines 58, 3+ lines 16.
- Mechanism: preceding-pick split topic 283 / other 148 (no
  react split reported — the driver's prePick classes are
  topic/react/other and react came out 0; the remaining dry
  follows a topic ask or an 'other' pick, never a reaction).
  Follows: question 241 / other 182 / recap 6 / close 2 /
  no-follow 0 — every remaining dry line is followed by a
  real line; the stall no longer strands a conversation.
- Counter cross-check: transcript dry 431 vs engine counters
  448 (+17, +3.9%). r61's gap was -8 (-0.2%). The small
  engine-over-transcript divergence is new and is named here
  for the fixing lane; it does not move either bar (engine
  rate 448/1618 = 0.277/convo, still far under 1.0) and is not
  a verdict input. Plausible source: dry lines spoken outside
  the driver's turn-loop transcript slice (e.g. closing
  sequences) now counted by the engine but not the census.
  Not investigated further in this measurement run.

## COLD OPEN: measured, not a wart (Q3)

Pooled cold-open dry rate: 9/1618 = 0.56% — far under the
pre-registered 10% interesting-finding threshold. Per seed:
5701 1/444 (0.23%), 5702 0/444 (0%), 5703 7/339 (2.07%),
5704 1/391 (0.26%). The cold-open shape is uniform: the
conversation opens with the train line ("...Sorry, lost my
train of thought.") and the NPC immediately recovers with
the bridge ("Sure — what's on your mind?"). As an opener the
line is still senseless (no thought was offered yet), but at
0.56% it is a rare wart, not a systemic one, and it does not
need its own bar. r62 IS the cold-open baseline for any
future run (per-seed rates above; pooled 0.56%).
5703's higher rate (2.07%) rides with its short, hard run
(123d, scattered) and is still a fifth of the threshold.

## Full-run results (4 seeds, full horizon, death-aware)

| seed | days | alive | deep2 | convos | dry | dry/convo | shareWith | dry9 | self3 | endDry | coldOpen | train/convo |
|------|------|-------|-------|--------|-----|-----------|-----------|------|-------|--------|----------|-------------|
| 5701 | 142 | 7 | 15 | 444 | 81 | 0.182 | 15.1% | 81 | 0 | 0 | 1/444 | 0.140 |
| 5702 | 141 | 8 | 40 | 444 | 82 | 0.185 | 16.0% | 82 | 0 | 0 | 0/444 | 0.160 |
| 5703 | 123 | 0 | 25 | 339 | 152 | 0.448 | 26.3% | 152 | 0 | 0 | 7/339 | 0.233 |
| 5704 | 124 | 0 | 47 | 391 | 116 | 0.297 | 24.8% | 116 | 0 | 0 | 1/391 | 0.248 |
| POOLED | | 15 | 127 | 1618 | 431 | 0.266 | 20.0% | 431 | 0 | 0 | 9/1618 | 0.191 |

Seeded cracks (all seeds, as r56-r61): 5701 Aria<>Buse
(crack7 false, serve30 true), 5702 Jenny<>Divya (crack7 true,
serve30 true), 5703 + 5704 pairs served within 30d — the
seeded-crack surface is alive on all seeds, not gated by B7.
Same-speaker knack repeats: 0 on all seeds (cross-speaker
retells 2/1/1/3 — circulation only, as r57-r61).

## Village assessment (plain words)

Four villages, same warm player, and this time the talk works.
5701's seven survivors and 5702's eight talked about each other
285 and 270 times unsteered, formed 15 and 40 deep friendships,
and never once ended a conversation by losing the thread.
5703 scattered at day 123 — sickness took eight, thirst three,
one starved — and 5704's scholar died at day 124 after seven
arena deaths; both are survival stories, not conversation
stories, and both villages still talked cleanly while they
lived (0.448 and 0.297 dry/convo, still under the old bar by
more than half, zero dry endings). What changed since r61 is
not the menu or the player — it is that the goodbyes, bridges,
mood beats and dead-thread shrugs no longer count as content
the ledger then punishes. People say goodbye and mean it now;
the conversation ends because it is over, not because the
system ran out of words. What did not change: on roughly one
conversation in five the NPC still stalls once, always from
the run-ledger pool, and one conversation in ~180 still opens
by losing a train of thought nobody offered.

## M5 people: PASS on flags and floor (0 fabricated, 0 weak endings)

5 distinct sense-reads, all endings strong (warm, resolved
closes). >= 2 dry-bearing/cold-open: 3 cold-open reads + 1
dry-top read (Buse d71 doubles as both — counted once in the
5 distinct conversations below).

- Strong: s5701-late-d100-Brian — "We've officially talked
  this one to death. Pour one out." (others-talk with real
  history), a concrete joint plan ("the ridge above the creek,
  before the heat sets in"), then the favor-requirements
  explainer asked 4 times with ESCALATING answers ("As I said
  — ...", "Like I said — ...", "Still the same thing — ...",
  "I've told you three times now — ...") before a warm close
  ("First light. The pantry's counting on us."). The repeat
  is the driver hammering one question, answered with
  escalation rather than identical looping — observed, not a
  flag.
- Strong: s5702-bondy-1-Divya d8 — Jenny rift "older than the
  scattering", concrete deed ("shared food without being
  asked"), continuity ("Still on the others"), an accepted
  invitation ("Someone should watch your back"), a teach
  offer ("I did this for a living") that trails into one dry
  line, then "This was good." The stall lands after substance,
  not instead of it. The Jenny grievance is the SEEDED crack
  (5702's seeded pair is Jenny<>Divya), not fabricated history.
- Cold-open wart, strong ending: s5701-coldopen-Buse d71 —
  opens on the train line, recovers via the bridge, two more
  dry lines mid-conversation, Turkish line with honest
  partial comprehension ("you're fairly sure"), ends "This
  was good." The opener is senseless; the conversation is not.
- Cold-open wart, strong ending: s5703-coldopen-Mia d104 —
  same shape, Norwegian line ("Forstår du?"), ends "Come
  back anytime." Nonverbal-heavy (nod/smile/watch/point) —
  the mid-convo stalls read almost as word-finding across
  the language gap.
- Cold-open wart, strong ending: s5704-coldopen-Giulia d115 —
  same shape, Italian lines, ends "This was good."
- 0 fabricated-shared-history flags across all 5 reads. The
  weak-ending count falls from r61's 4 to 0 — the floor
  (weak <= 1) PASSES, and the mechanism is visible: endings
  stopped being dry because goodbyes are grammar now.

## Reachable / fun / winnable (social leg)

- **Reachable:** 'others' still converts — unsteered late
  picks 112/99/26/60 (pooled 297; r61: 399, lower here
  because 5703/5704 died inside the late window, not
  because offers fell — no-offer 12.4% vs r61's 10.8%).
- **Fun:** the transcripts are the evidence — Divya's Jenny
  story, Brian's creek plan, Giulia's "brava persona" grin
  all read like people. The fun tax is now small: one stall
  in five conversations, one senseless opener in ~180.
- **Winnable:** not this leg's question; 2/4 villages
  survived to the horizon with social fabric intact
  (deep2 127 pooled vs r61's 125 — formation holds), and
  the two that died died of sickness, thirst, arena and
  monsters, not of conversation.

## Guardrails (report-only, vs r61)

no-offer 187/1513 = 12.4% (r61 10.8% — in range); late picks
297 (r61 399 — confounded by 5703/5704 dying at d123/124
inside the late window; per-seed late picks on the two
full-horizon seeds, 112/99, match r61's range); deep2 127
(r61 125 — holds); alive 7/8/0/0 (r61 8/0/9/10 — different
seeds, death-aware; both r62 deaths are survival stories,
see Village assessment). No guardrail regression attributable
to B7: the conversation system did not get quieter (convos
per surviving seed still 444) or less friendly (deep2 holds).

## Metric review (§14)

- F1: PASS (0.266 < 1.0, pooled and per-seed).
- F2: PASS (0.0% < 20%, pooled and per-seed).
- M5: PASS (0 fabricated flags; weak endings 0 <= 1; 3 of
  the 5 distinct reads are cold-open/dry-bearing, above the
  >= 2 requirement).
- COLD: reported (pooled 0.56%, per-seed above); no bar was
  set or invented — r62 is the baseline.
- D1/D2: PASS (census + mechanism split reported for all 4
  seeds; no seed with zero instrumented conversations).
- G: report-only as specified; no guardrail re-scored as a
  bar.
- NO-REGRESSION: check.js --quick at the standing profile
  (see CHECK-QUICK section below; filled after the suite
  finishes — run note written while the suite runs, section
  completed before commit).
- No bar was re-scored mid-run. The pre-registered
  interesting-finding rules: dry < 1.0 AND endDry < 20% =>
  B7 GO (both fired); cold-open >= 10% did NOT fire (0.56%).
- One method note, not a revision: the engine-counter
  cross-check gap widened from r61's -0.2% to r62's +3.9%
  (engine over transcript). It is disclosed above, not
  hidden, and it is not a verdict input — both counts agree
  on the order of magnitude. A future run that needs an
  exact counter census should capture closing-sequence
  lines in the driver transcript.
- Telemetry-check's dryRate quiet line is NOT cited as
  confirmation of the census: the check's dryRate field
  (driver's totalDry/totalNpc*12, per-seed 2.61-2.95) is a
  different definition from the dry-family census, and its
  gate did not fire for reasons outside this run's question.
  The census + analyzer output are the evidence of record.

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate — r57-r61's exact set):
- Result: 1 LOUD line — l3.deep2 newly appeared (baseline 0
  -> current pooled 127, n=4 files).
- Verdict: EXPLAINED schema artifact, not a bug — deep2 is
  the current formation key the old baseline predates (same
  practice as r57-r61: baseline NOT rolled). l3.bonds quiet.
  r62's deep2 (127) sits in r61's range (125), so the LOUD
  line is the baseline's age, not a movement.

## Regressions

- NO src/js change in this run (driver + analyzer + evidence
  only), so no game regression is possible from this run's
  files. B7 itself is gap-social's landed fix, scored here,
  not changed here.
- check.js --quick (see CHECK-QUICK section below).

## Files landed (tooling + evidence, zero src/js)

- `scripts/journey-social-r62-20261028.js` (driver: r61 fork
  + cold-open instrumentation: per-convo coldOpenDry /
  coldOpenLine, per-seed dryCensus cold-open aggregation,
  one cold-open save per seed, censuses carried into
  r62-verdicts.json)
- `scripts/analyze-journey-social-r62-funnel-20261028.js`
  (pooled census + r61-baseline guardrail lines)
- `evidence/2026-10-28/r62/` (prereg, 4 per-seed JSONs,
  r62-verdicts.json, summaries, transcripts incl. all 5 M5
  reads, run-note.md)

## Infra notes (for the next run)

- Heartbeat: manual heartbeat verified by registry read-back
  at 04:01 UTC; nohup loop (sleep 540) alive and ticking
  (registry 04:01:06 at first check, loop pid verified live;
  the 04:01 timestamp at the 04:09 check was the loop's
  first tick still within the 15-min freshness line, not a
  stall — second tick due ~04:10).
- Driver: smoke PASS, 4 seeds, flush 0 lost to EPERM flap on
  all flushes. Driver log: goal hidden_files
  journey2-social-r62-driver.log.
- Safe-commit index clobber hit the prereg commit (0607a3b06)
  — the known class: commit correct, main index showing
  bogus staged deletions after. Repaired via HEAD-blob
  cacheinfo, verified with `git status --short` empty +
  `git diff HEAD` empty + hash-object matches, before any
  further work. Same repair to be verified after the final
  commit below.
- Rotation-b advanced 5 -> 6 at closeout (crisis next).

## CHECK-QUICK (filled after suite completion)

- check.js --quick on the r62 tree: 278 passed, 9 failed in 655s —
  EXACTLY the current base profile (278/9). Full output saved:
  hidden_files/journey2-social-r62-checkquick.log.
- The 9 failing scripts are the current-base standing set, all 9
  named: test-hide-discovery, test-measurement-comparison,
  test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-sw-audio-cache-20261012,
  test-establishment-r20-fixes-20261020 (racks-voice).
- Set-note vs r61: r61's standing set listed parity-20261014
  instead of sw-audio-cache; the endgame r59 note already
  recorded that base change (parity gear failure GONE on the
  post-r59 base, sw-audio-cache new, per the scale r46 note).
  r62 matches the CURRENT base profile exactly, not r61's
  older list — totals identical (278/9). Zero src/js changes
  in this run (driver + analyzer + evidence only), so no new
  failure is attributable to r62. NO-REGRESSION gate PASSES
  at the current-profile standard.
