# Journey social r60 — THE STALL-CENSUS RUN (lane B, 2026-10-27)

Leg 5 (social life), cycle r60. Follows r59 (party-trim fix:
'ask:others' protected; no-offer 53.4% -> 9.2%, conversion
55.6% -> 73.6%). r59's metric review named r60's question:
the stall beat ("...Sorry, lost my train of thought.") measured
at 1.0 per conversation in the 5-read sense set only — is that
rate real, or a read-set selection artifact?

Rotation-b read 5 at run start and IS advanced to 6 by this run:
the r57->r58->r59 'others' arc closed with r59's fix, and r59's
metric review named r60's question, which this run carries.
(Rotation note: r59's adoption claimed 5 -> 6, but the file
read 5 at this run's start — the endgame r56 adoption's 4 -> 5
write landed after r59's adoption and clobbered it. The fleet's
latest intent before this run was therefore social-next, and
leg 5 also carries the named-next question.)

## PRE-REGISTER (written before any r60 seed ran — see prereg.md)

**Leg questions:** (Q1) census: stalls per conversation and
share of conversations with >= 1 stall, across full runs.
(Q2) mechanism: which path produces the stall lines, which
pick precedes each, what follows it. (Q3) guardrails
(report-only): r59's fix holds on fresh seeds.
**Arms:** fresh seeds 5501-5504, smoke 5505 30d, DAYCAP=140,
death-aware. ALL linger, seeded-speaker steering ON (constant,
excluded from the natural funnel, as r56-r59). No control arm:
r59's per-seed JSONs are the guardrail comparison, share-level
only (fresh seeds, no turn-identity comparison claimed).
**Bindings:** S1 census reported for all 4 seeds; S2 mechanism
split reported; M5 5 sense-reads, 0 fabricated-history flags,
<= 1 weak, >= 2 stall-bearing; M6 report-only; NO-REGRESSION
check.js --quick at the standing profile (278/9). The < 0.5
stall-rate bar proposed by r59 was deliberately NOT adopted
as a pass/fail bar for this run — scoring a measurement run
against a rate invented before the census exists would be
re-scoring by another name. The bar proposal goes to the NEXT
run's prereg, with this run's rate as its baseline.
**Interesting-finding rule (pre-registered):** pooled
stalls/convo >= 0.5 => systemic wart, fix run warranted;
< 0.2 => r59's 5/5 was read-set selection, wart minor.

## The instrument (driver-only, zero src/js)

Fork of the r59 driver (scripts/journey-social-r60-20261027.js):
every transcript line matching /lost my train of thought/i is
counted per conversation, with the preceding pick and the
following line recorded; aggregated into r.stallCensus
(total convos, stalls, stalls/convo, share with >= 1 stall,
0/1/2/3+ histogram, preceding-pick split, follows list).
Analyzer: scripts/analyze-journey-social-r60-funnel-20261027.js
(follow classes: another-stall / close / recap / question /
other; no-follow counted separately). Pilot (smoke 5505 PASS;
seed 5503 at 40d: stall 90/121 = 0.74/convo, 74.4% with >= 1)
validated the instrument before the full run; the pilot's
short-horizon 5503 file was overwritten by the full run as
the prereg noted.

## Full-run results (4 seeds, full horizon, death-aware)

| seed | days | alive | deep2 | convos | stalls | stalls/convo | share >= 1 stall | no-offer | late picks |
|------|------|-------|-------|--------|--------|--------------|------------------|----------|------------|
| 5501 | 141 | 7 | 18 | 444 | 407 | 0.917 | 91.7% | 45/414 (10.9%) | 118 |
| 5502 | 140 | 7 | 40 | 444 | 410 | 0.923 | 92.3% | 40/414 (9.7%) | 95 |
| 5503 | 141 | 8 | 15 | 444 | 365 | 0.822 | 82.2% | 37/414 (8.9%) | 105 |
| 5504 | 141 | 8 | 20 | 444 | 400 | 0.901 | 90.1% | 30/414 (7.2%) | 125 |
| POOLED | | 30 | 93 | 1776 | 1582 | 0.891 | 89.1% | 152/1656 (9.2%) | 443 |

### S1 CENSUS: PASS — the wart is systemic, not selection

Pooled 0.891 stalls per conversation, 89.1% of conversations
contain >= 1 stall. Histogram (pooled): 0 stalls 194 convos,
exactly 1 stall 1582 convos, 2+ stalls ZERO. r59's 1.0/convo
in the read set was not a selection artifact — it slightly
understated nothing: the census rate (0.89) is the same order
of magnitude, and every conversation's train-line count is
0 or 1, never more. Per the pre-registered rule (>= 0.5):
SYSTEMIC WART, fix run warranted, this census is the baseline.

### S2 MECHANISM: PASS — the dry-line pool, first draw

The train line is convoDryLine's FIRST draw: conversation.js
convoDryLine() returns DRY[used] in order from the 12-line
convoDeflectionLines pool, and the train line is entry 1.
That alone explains the 0-or-1 histogram: a second dry
fallback in the same conversation draws "Hm. Never mind —
go on." (use 2), then "Actually, forget it." (use 3), etc.
The train line is therefore NOT a once-per-conversation
rule — it is the first draw of a recurring fallback family.
Preceding-pick split (pooled): topic 1084 (68.5%), react
294 (18.6%), other 204 (12.9%). Stalls follow ALL pick types,
topic-dominated: the no-repeat block (sayLine: self-block
within the sitting, or the 48-entry run ledger blocking a
line another villager said recently) fires on ordinary topic
asks, not just on react/silence filler. Follow classes
(pooled, 1582 stalls): question 907 (57.3%), other 463
(29.3%), recap 3 (0.2%), close 0 by classifier, no-follow
209 (13.2% — the stall is the conversation's last line).
After a stall the conversation almost never closes or
recaps; it pivots to a fresh question or other content —
except the 13.2% where it ends on the stumble.

### The census understates the dry burden (sample evidence)

Post-hoc count of ALL 12 deflection-pool lines across the
160 saved transcripts (selected sample — bondy / wrapserve /
late / seeded / stall-top — so shares are sample-level, not
census): 152 files contain the train line, and 109 of those
also contain a sibling dry line. Sibling totals: "Never mind
— go on." 110, "Actually, forget it." 67, "Where was I?
Gone." 36, "went clean out of my head" 15, "not coming
back" 3, "Lost it. The thought" 1 — 232 sibling dry lines
against 152 train lines in the sample. The full dry-fallback
burden is roughly 2.5x the train-only census in sample terms.
The Claire late-d100 read (below) shows all five draws in a
single conversation. Zero self-repeat-pool lines ("I just
said…", "We've covered this one.") appear in the sample.
A fix run must target dry-fallback FREQUENCY (why so many
blocks fire — prime suspect: the run ledger treating a
player re-asking different villagers the same question as
parroting), not the train line's wording. That hypothesis
is named here, not implemented: this run is measurement.

### M5 people: NO-GO on the floor (2 weak, limit 1)

5 reads, 0 fabricated-history flags, 2 weak endings — the
floor (<= 1 weak) FAILS on the letter, and the failure IS
the finding: the stall-as-last-word ending pattern the
census counts at 13.2% is what makes the reads weak.
- STRONG-ish: s5501-stall-1-Marvin (day 4, stall-bearing):
  warm, coherent — a tell, a stance — stall mid-wind-down,
  then a resolving close ("This was good." They mean it.).
- WEAK: s5502-stall-1-Sofia (day 4, stall-bearing): good
  content (water-carrier stance, moot bet, sassafras
  teaching with a laugh, a resolving "Feels better said out
  loud.") — then the stall as the LAST line, no close.
- PASS: s5501-bondy-1-Francesca (day 7): stall as the cold
  open, then a full recovery — gossip, "Claire's been
  polishing that story. The unpolished version: a
  Veterinarian. Keep my name out of it.", Marvin garden-talk
  knack, warm close. No fabrication.
- MEDIUM (not weak — delivers and closes warmly, but the
  texture is the wart): s5501-late-d100-Claire (day 100):
  FIVE dry draws in 13 turns (train, never-mind,
  forget-it, where-was-I, out-of-my-head) around real
  content — Mara trust ("I'd trust Mara with my pack."),
  the Riddle Me This win, the Taking ("They just... took
  you. Came back like nothing happened. It wasn't
  nothing."). The cascade, not the content, is the defect.
- WEAK: s5501-seeded-d37-Francesca (day 37, seeded crack):
  grievance served (Claire, trail, unforgiven), then a
  driver-persistence resume triple ("Still on the others."
  with honest escalation "As I said — / Like I said —"),
  then the stall as the LAST line, no close.
No fabricated shared history in any read; the "You asked me
that before. It's a different question now." line is the
game's honest repeat-ask acknowledgment, not a flag.

### M6 guardrail + Q3: villages hold, fix holds

All 4 villages alive at horizon (7/7/8/8). No-offer pooled
9.2% (r59: 9.2%), picks 287/255/255/320 (r59: 262-294),
late picks 118/95/105/125 (r59: 97-112), knackSame 0 all
seeds. The r59 fix holds on fresh seeds; the stall wart is
independent of it.

## Village assessment (plain words)

Four villages that talk — and stumble — constantly. Seed
5501's seven kept 18 deep friendships and asked about each
other 287 times without being steered; 5502's seven, 255
times with 40 deep pairs; 5503's eight, 255 times; 5504's
eight, 320 times. The talk is warm and specific: who to
trust with your pack, who won what on the cameras, who
still hasn't forgiven whom from the trail. But in nine
conversations out of ten, somebody loses their train of
thought mid-talk — usually once, sometimes (as Claire's
day-100 talk shows) five times in one sitting, each stumble
a different flavor of "never mind." Most talks recover into
a new question; about one in eight just ends on the
stumble, with no goodbye. Nothing here is broken in the
sense of missing content — the village remembers each other
fine. The defect is texture: the conversation system
apologizes for itself too often, because its no-repeat guard
treats ordinary repeated questions as parroting.

## Reachable / fun / winnable (social leg)

- **Reachable:** 'others' converts as in r59 (guardrails
  hold). The stall beat is reachable everywhere — that is
  the problem, not the prize.
- **Fun:** the transcripts are the evidence — Marvin's tell,
  Claire's Taking line, Francesca's unpolished story. The
  fun tax is the stall family: 0.89 train lines per
  conversation, ~2.5x that in dry lines by sample, 13.2%
  of stalls ending the conversation.
- **Winnable:** not this leg's question; 4/4 villages kept
  social fabric intact to their horizons.

## Metric review (§14)

- S1: PASS (census reported all 4 seeds; pooled 0.891).
- S2: PASS (mechanism split reported: prePick + follows +
  pool-order explanation).
- M5: NO-GO on the floor (2 weak > 1 allowed; 0 fabricated
  flags). Not re-scored: the two weak reads are named above,
  and the floor miss is carried as the fix run's evidence.
- M6: report-only (7/7/8/8 alive).
- Q3 guardrails: report-only, hold (see above).
- No bar was re-scored mid-run. The r59 < 0.5 proposal is
  NOT adopted retroactively for r60; it goes to the next
  run's prereg with 0.891 as its baseline, and the fix run
  should additionally pre-register a dry-family rate (all
  12 deflection lines), since the train-only count
  understates the burden ~2.5x in sample terms.
- Open items carried forward (not this run's job): party_role
  live exercise (still funnel-absent — no party named in
  these runs; covered by r59's proof test only); the run-
  ledger-vs-repeated-question hypothesis as the fix run's
  mechanism to test; wind-down silence stalls (both stallTop
  reads show silence-preceded wind-down stalls) as a second
  fix-run question.

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate — r57-r59's exact set):
- Result: 1 LOUD line — l3.deep2 newly appeared (baseline 0
  -> current pooled 93, n=4 files).
- Verdict: EXPLAINED schema artifact, not a bug — deep2 is
  the current formation key the old baseline predates (same
  practice as r54-r59: baseline NOT rolled). l3.bonds and
  dryRate quiet.

## Regressions

- check.js --quick on the r60 tree: (see CHECK-QUICK section
  below; filled after the suite finishes — run note written
  while the suite runs, section completed before commit).

## Infra notes

- Heartbeat loop lesson (second sighting of the 2026-10-25
  class): the first nohup loop (absolute script path,
  output to /dev/null) died silently — registry heartbeat
  stayed 13:00:26Z while the run continued. Caught by an
  explicit registry read; repaired with the sibling pattern
  (cwd = main tree, relative script path, output to a log
  file, sleep 540) and verified by process + log + registry
  read (13:08:14Z). Manual heartbeat also landed 13:07:11Z.
  Never trust a silenced loop; always read back the registry.
- Full run: smoke PASS, 4 seeds, flush 0 lost to EPERM flap.
- Pilot short-horizon 5503 file overwritten by the full run
  as prereg-noted; pilot log kept (driver-pilot.log).

## CHECK-QUICK (filled after suite completion)

- check.js --quick on the r60 tree: 278 passed, 9 failed in
  383s — EXACTLY the standing profile (278/9). Full output
  saved (never piped to tail): hidden_files/
  journey2-social-r60-checkquick.log.
- The 9 failing scripts are the standing set, all 9 named:
  test-hide-discovery, test-measurement-comparison,
  test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-parity-20261014,
  test-establishment-r20-fixes-20261020 (racks-voice).
  Zero src/js changes in this run (driver + analyzer only),
  so no new failure is attributable to r60. NO-REGRESSION
  gate PASSES.
