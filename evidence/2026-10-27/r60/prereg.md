# Journey social r60 — PRE-REGISTER (lane B, 2026-10-27)

Written before any r60 seed ran. Leg 5 (social life), cycle r60.
Rotation-b read 5 at run start. This run ADVANCES rotation-b to 6
at closeout if it lands: the r57->r58->r59 'others' arc closed
with r59's displacement fix, and r59's metric review named r60's
question (the stall beat). No open question names r61 for leg 5;
if this run fails its reporting bindings, rotation stays 5 with
the reason recorded.

Note on the rotation file: r59's adoption note claimed the file
was advanced 5 -> 6, but the file read 5 at this run's start —
the endgame r56 adoption (2026-10-27 ~07:00 CDT) wrote 4 -> 5
after r59's adoption, clobbering it. The fleet's latest intent
before this run was therefore social-next, and leg 5 also carries
the named-next question, so leg 5 is correct on both readings.

## Follows

r59 (lane B, 2026-10-26, adopted + landed 2026-10-27): party-trim
fix protects 'ask:others' (src/js/party-formal.js). No-offer rate
53.4% -> 9.2%, 'others' conversion 55.6% -> 73.6%, late picks
81 -> 428, displacedParty residual 0/390. Measured wart: the
stall beat ("...Sorry, lost my train of thought.") appears in
ALL FIVE sense-reads, once each — 1.0 per conversation in the
read set. r59's metric review: that rate is measured in the
read set only (bondy / wrapserve / late / seeded selections —
long, deep conversations, not a census); a run that wants to
reduce it should pre-register a stall-rate bar (e.g. stalls
per conversation < 0.5) and a mechanism. This run IS that
measurement run: it establishes the true census rate and the
mechanism. It does NOT adopt < 0.5 as a pass/fail bar yet —
scoring a measurement run against a rate invented before the
census exists would be re-scoring by another name. The bar
proposal goes to the NEXT run's prereg, with this run's rate
as its baseline.

## Leg questions

- (Q1) CENSUS: across full runs, what is the stall rate —
  stalls per conversation, and share of conversations containing
  >= 1 stall? Is r59's 1.0/convo representative, or a
  read-set selection artifact?
- (Q2) MECHANISM: which path produces the stall lines — the
  dry-line fallback after a react/agree/silence pick, a ledger
  fallback, or something else? What pick precedes each stall,
  and what follows it (recap, close, new topic, another stall)?
  A stall that ends a conversation is a different defect from
  a stall that recovers into a recap.
- (Q3) GUARDRAILS (report-only, not bars): does r59's fix hold
  on fresh seeds — no-offer rate, 'others' conversion, deep2
  formation, late picks — in r59's range? The fix is already
  landed; this run guards it, it does not re-test it.

## Arms (fresh seeds 5501-5504, smoke 5505 30d, DAYCAP=140, death-aware)

ALL linger, seeded-speaker steering ON (constant, excluded from
the natural funnel, as r56-r59). No control arm: r59's per-seed
JSONs are the guardrail comparison, share-level only (fresh
seeds, so no turn-identity comparison is claimed). Policy is
r59's policy verbatim except the r60 stall instrumentation
(driver-only, zero src/js): every transcript line matching
/lost my train of thought/i is counted per conversation, with
the preceding pick and the following line recorded.

## Bindings (a miss is NO-GO, never re-scored)

- S1 census reported for all 4 seeds: total conversations,
  total stall lines, stalls per conversation, share of
  conversations with >= 1 stall, stalls per deep conversation.
  A seed with zero instrumented conversations fails S1.
- S2 mechanism reported: stall-preceding pick distribution
  (react/agree/silence vs topic picks vs other) and stall-follow
  classes (close / recap / new-topic / another-stall / other)
  pooled across seeds. A census with no mechanism split fails S2.
- M5 people: 5 sense-reads, 0 fabricated-history flags,
  <= 1 weak; at least 2 of the 5 must be stall-bearing
  conversations (so the read set judges the wart, not just
  the warm talk).
- M6 report-only: villages alive at horizon.
- NO-REGRESSION check.js --quick at the standing profile
  (278 passed / 9 failed). Driver-only changes must not move it.
- Interesting-finding rule (pre-registered, not a bar):
  pooled stalls/convo >= 0.5 => systemic wart, fix run
  warranted with this census as baseline; < 0.2 => r59's
  5/5 was read-set selection, wart minor; in between =>
  mechanism (Q2) decides which fix shape, if any.

## Pilot (before the full run)

Smoke 5505 (30d) + seed 5503 at DAYCAP=40: stall census
non-empty, follows captured, funnel live. Pilot files are a
distinct seed (5505) plus a short-horizon 5503 file; the full
run regenerates 5503 at full horizon under the same filename
(pilot short file overwritten by the full run — noted here so
the overwrite is expected, not a surprise).

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate — r57-r59's exact set). LOUD lines
investigated before any baseline roll; baseline NOT rolled on
a schema artifact (r54-r59 precedent: deep2 newly-appeared is
the old baseline predating the key).
