# Journey social r61 — THE DRY-FAMILY CENSUS RUN (lane B, 2026-10-27)

Leg 5 (social life), cycle r61. Follows r60 (train-line census:
0.891/convo, 89.1% with >= 1 stall, sample dry burden ~2.5x).
r60's metric review named this run's question: the FULL 12-line
dry-family census. This run IS that measurement run.

Rotation-b read 5 at run start and IS advanced to 6 by this run:
leg 5's named-next question is carried here, and no open
question names r62 for leg 5. (Rotation note: r60 advanced 5
-> 6, but the file read 5 again at this run's start — the
endgame r57 adoption's 4 -> 5 write landed after r60 and
clobbered it, the same class as the r59/r60 clobber. The
fleet's latest intent before this run was therefore
social-next, and leg 5 also carries the named-next question.)

## PRE-REGISTER (written before any r61 seed ran — see prereg.md)

**Leg questions:** (Q1) full dry-family census + pool split.
(Q2) mechanism: preceding pick, follows, end-on-dry share,
engine-counter cross-check. (Q3) guardrails (report-only):
r59's fix holds on fresh seeds.
**Arms:** fresh seeds 5601-5604, smoke 5605 30d, DAYCAP=140,
death-aware. ALL linger, seeded-speaker steering ON (constant,
excluded from the natural funnel, as r56-r60). No control arm:
r60's per-seed JSONs are the guardrail + train-line comparison,
share-level only.
**Bindings:** D1 census all 4 seeds; D2 mechanism split;
G guardrails report-only; M5 5 sense-reads, 0 fabricated-
history flags, >= 2 dry-bearing, weak count REPORTED (not a
floor bar for this measurement run — no fix is in it to move
the count; the floor returns as a bar for the fix run, with
this run's count as its baseline); NO-REGRESSION check.js
--quick at the standing profile (278/9). Bars explicitly NOT
adopted here (they belong to the fix run, scored against this
census): train stalls/convo < 0.5, any dry-family rate bar,
M5 weak floor.
**Interesting-finding rules (pre-registered):** dry >= 2.0 =>
fix bar must be on the dry-family rate, not the train rate;
first-9 >= 80% => fix belongs in ledger/block logic, not line
wording; end-on-dry >= 10% => fix run must pre-register an
end-on-dry bar. ALL THREE FIRED (see below).

## Why no fix in this run (decision, documented for overrule)

A sibling lane (gap-social, oversight-gap-closure) is ALREADY
working exactly this system: registered purpose "gap closure
B7+B15: dry-fallback frequency + gift lines", branch carrying
"Triage B7 dry-fallback frequency: exempt conversation grammar
from the run ledger" (980c5aa17, not on master). Landing a
second, competing conversation.js dry fix from Lane B would
collide at merge and duplicate owned work. Lane B therefore did
NOT touch src/js this run. Instead this run delivers what r60
said the fix run needs and did not yet have: the full 12-line
census + mechanism split. The census + this note go to
gap-closure via evidence; the fix itself stays theirs. If
their fix lands first, the next Lane B social run scores it
against this census. (Their branch base is old and its diff
vs master is noisy — 441 files, mostly stale-base deletions —
so no port was attempted from here; their lane owns the
rebase.)

## The instrument (driver-only, zero src/js)

Fork of the r60 driver (scripts/journey-social-r61-20261027.js):
every transcript line matching any of the 12
convoDeflectionLines (quote-normalized) is counted per
conversation, with pool (first-9 run-ledger dry vs last-3
self-repeat), preceding pick, following line, end-on-dry flag
(last NPC line is a deflection), and per-convo engine counters
(convoGet dryLines / selfRepeatLines) as a cross-check.
Analyzer: scripts/analyze-journey-social-r61-funnel-20261027.js.
Smoke 5605 PASS (bond census + wraps + funnel live) before
the full run; 0 files lost to the EPERM flap (flush per seed).

## Full-run results (4 seeds, full horizon, death-aware)

| seed | days | alive | deep2 | convos | dry | dry/convo | share >= 1 dry | dry9 | self3 | endDry |
|------|------|-------|-------|--------|-----|-----------|----------------|------|-------|--------|
| 5601 | 142 | 8 | 24 | 444 | 1048 | 2.36 | 93.5% | 1045 | 3 | 285 (64.2%) |
| 5602 | 124 | 0 | 26 | 375 | 773 | 2.06 | 88.3% | 773 | 0 | 232 (61.9%) |
| 5603 | 141 | 9 | 30 | 444 | 919 | 2.07 | 90.5% | 913 | 6 | 301 (67.8%) |
| 5604 | 141 | 10 | 45 | 444 | 1093 | 2.46 | 92.6% | 1093 | 0 | 304 (68.5%) |
| POOLED | | 27 | 125 | 1707 | 3833 | 2.245 | 91.3% | 3824 | 9 | 1122 (65.7%) |

### D1 CENSUS: PASS — the wart is 2.5x the train count, as sampled

Pooled 2.245 dry lines per conversation, 91.3% of conversations
with >= 1 dry line. Per-convo histogram (pooled): 0 dry 148,
1: 411, 2: 471, 3: 362, 4: 211, 5+: 104. The train-only census
understated the burden exactly as r60's sample suggested:
train 0.912/convo here (r60: 0.891 — reproduces), dry-to-train
ratio 2.46x (r60 sample estimate: ~2.5x — census confirms it).
Pool split: first-9 run-ledger dry 3824 (99.8%), last-3
self-repeat 9 (0.2%). The self-repeat pool is effectively
DORMANT in driven play; the wart is one pool, not two.
Counter cross-check: engine counters total 3840 (dryLines
3825 + selfRepeatLines 15) vs transcript census 3833 — a 7-line
gap, explained by the transcript's 200-entry cap (old lines
shift off long conversations) and draws that never reach the
transcript. The census is, if anything, a slight UNDERCOUNT.

### D2 MECHANISM: PASS — ledger dry, topic-led, tail-concentrated

Preceding-pick split (pooled, all dry lines): topic 1780
(46.4%), react 1539 (40.2%), other 514 (13.4%). Two different
populations inside that split: mid-conversation dry lines are
topic-led (the run ledger blocking ordinary topic asks — r60's
hypothesis holds for the mid-stream population), while the
tail population is react/silence-led (see endDry below).
Follow classes (pooled, 3833 dry lines): new question 1616
(42.2%), other 791 (20.6%), another dry 286 (7.5%), recap 13
(0.3%), close 5 (0.1%), no-follow 1122 (29.3%). Mid-stream dry
lines mostly RECOVER into a fresh question; almost never into
a recap or a close — the conversation pivots, it does not
resolve.
End-on-dry: 1122 conversations (65.7%) end on a dry line, and
noFollow == endDry on every seed — whenever the last NPC line
is dry, it is also the transcript's last line. This is NOT
r60's 13.2%: that was train-lines only. The dry-family
ending wart is five times that rate. Mechanism (sense-reads):
the wind-down cue ("I should get back to it" / "I should go")
is followed by silence picks that emit dry lines instead of a
farewell — one silence turn can emit THREE dry lines — and the
dry-streak wind-down then closes the conversation with no
spoken goodbye. The driver over-runs wind-down cues (it picks
leave only when nothing else is offered), so 65.7% is a
driver-policy-INTERACTED measure: a player who leaves at the
cue sees fewer dry endings. But the engine side is real either
way: silence after wind-down answers with dry lines, and the
close after a dry streak has no farewell line.
Cold-open wart (read-set observation, NOT census — dryTurns
turn numbers are not persisted per seed): all three dry-top
reads open with a dry line on the very first pick ("Can I ask
you something else?" -> train line). The intended opener is
a shared pool line, so the 48-entry run ledger blocks the
first beat of the conversation. A fix that only tunes tail
behavior leaves the cold open untouched.

### M5 people: 5 reads, 0 fabricated-history flags, 4 weak endings

- STRONG, dry-free: s5601-bondy-1-Nathan (day 8): old-rift
  grievance ("Otto. We don't... it's old. Older than the
  scattering"), a food-sharing story, an evolving stance
  ("Has it changed? Everything changes."). A person talking.
- WEAK (dry ending): s5602-dry-1-Ruben (day 56): real content
  (Chloe gossip, Jae close-read, Rut King naming) — then the
  wind-down cue, silence, and a dry TRIPLE as the last lines,
  no goodbye. 7 dry lines in 13 turns.
- WEAK (dry AFTER goodbye): s5601-dry-1-Autumn (day 18): the
  conversation says "I should go. You know where to find me."
  — then a silence pick produces one more dry line as the
  literal last line. The goodbye does not stick.
- MEDIUM-WEAK (dry ending): s5601-late-d100-Autumn (day 100):
  Valeria gossip, Nathan's return, an honest resume ("Real
  talk — As I said — Still on the gossip.") — then the
  wind-down cue, silence, and a dry triple, no goodbye.
- WEAK (dry ending): s5603-dry-1-Elijah (day 20): Sarah
  close-read, a teaching moment (American Hazelnut, "I never
  knew that."), a gossip chain — then silence and a dry
  double, no goodbye.
No fabricated shared history in any read; the "You asked me
that before. It's a different question now." line is the
game's honest repeat-ask acknowledgment, not a flag. Weak
count 4/5 is REPORTED, not scored (see bindings): it is the
fix run's baseline, and it matches the census (65.7% endDry)
rather than contradicting it.

### G guardrails + Q3: fix holds, villages hold (one arena wipe)

No-offer pooled 172/1588 = 10.8% (r60: 9.2% — same range),
late picks 399 (r60: 443), deep2 125 (r60: 93 — up), knackSame
0 all seeds. The r59 fix holds on fresh seeds. Villages:
5601 8 alive, 5603 9 alive, 5604 10 alive; 5602 wiped at day
124 (alive 0, scattered) — 12 of its 17 deaths are "the
arena", a crisis-leg story, not a social-leg failure; the
death-aware horizon stopped the sim there rather than ticking
a dead village. Not this run's question; not chased.

## Village assessment (plain words)

Four villages that talk constantly — and apologize for talking
constantly. Seed 5601's eight kept 24 deep friendships and
asked about each other 336 times unsteered; 5603's nine, 30
deep pairs; 5604's ten, 45 deep pairs. The talk itself is
warm and specific: who keeps you sane, who shared food
without being asked, who came back like they'd never left,
what everyone's calling the beast this week. But in nine
conversations out of ten, somebody loses their train of
thought — usually twice, sometimes seven times in one
sitting — and in two conversations out of three, the talk
doesn't end with a goodbye at all: it fizzles into "never
mind" two or three times and then just stops. The self-repeat
excuses ("I just said — did you miss it?") basically never
appear; every apology is the same family, the run-ledger one.
Nothing here is missing content — the village remembers each
other fine. The defect is texture and endings: the
conversation system apologizes for itself too often, and
when it winds down it has no farewell.

## Reachable / fun / winnable (social leg)

- **Reachable:** 'others' converts as in r59/r60 (guardrails
  hold). The dry beat is reachable everywhere — that is the
  problem, not the prize.
- **Fun:** the transcripts are the evidence — Nathan's Otto
  story, Elijah's hazelnut teaching, the gossip chains. The
  fun tax is the dry family: 2.25 apologies per conversation,
  91% of conversations touched, 66% ending on one.
- **Winnable:** not this leg's question; 3/4 villages kept
  social fabric intact to their horizons, the fourth lost to
  the arena, not to talk.

## Metric review (§14)

- D1: PASS (census reported all 4 seeds; pooled 2.245).
- D2: PASS (mechanism split reported: prePick + follows +
  pool split + end-on-dry + counter cross-check).
- G: report-only (no-offer 10.8%, late picks 399, deep2 125,
  alive 8/0/9/10).
- M5: REPORTED (5 reads, 0 fabricated flags, 4 weak endings;
  weak count carried as the fix run's baseline, not scored
  here per the prereg).
- NO-REGRESSION: check.js --quick on the r61 tree (see
  CHECK-QUICK section below; filled after the suite finishes
  — run note written while the suite runs, section completed
  before commit).
- No bar was re-scored mid-run. The pre-registered
  interesting-finding rules ALL FIRED: dry >= 2.0 (2.245) =>
  the fix run's bar MUST be set on the dry-family rate, not
  the train rate; first-9 >= 80% (99.8%) => the fix belongs in
  ledger/block logic, not line wording; end-on-dry >= 10%
  (65.7%) => the fix run MUST pre-register an end-on-dry bar.
  Proposed fix-run bars (for the fixing lane, not adopted
  here): dry-family < 1.0/convo AND end-on-dry < 20% AND
  cold-open dry measured (new instrument: dryTurns turn-0
  rate — this run's driver records turn numbers only in
  transcript headers, so the fix run needs the turn-0 rate
  persisted per seed).
- Open items carried forward (not this run's job): the fix
  itself (gap-social, B7); the arena-wipe story on 5602
  (crisis leg); party_role live exercise (still funnel-
  absent — no party named in these runs; covered by r59's
  proof test only).

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate — r57-r60's exact set):
- Result: 1 LOUD line — l3.deep2 newly appeared (baseline 0
  -> current pooled 125, n=4 files).
- Verdict: EXPLAINED schema artifact, not a bug — deep2 is
  the current formation key the old baseline predates (same
  practice as r54-r60: baseline NOT rolled). l3.bonds and
  dryRate quiet.

## Regressions

- check.js --quick on the r61 tree: (see CHECK-QUICK section
  below; filled after the suite finishes — run note written
  while the suite runs, section completed before commit).

## Infra notes

- Heartbeat loop: nohup loop (cwd = main tree, relative
  script path, output to a log file, sleep 540) per the r60
  lesson; registry heartbeat verified by read-back after
  start (21:06 UTC) and during the run (21:15 UTC).
- Driver-launch hiccup (no harm): the launching exec
  session's relative-path tail/ls failed (its cwd reset),
  but the nohup driver survived and ran to DONE; smoke PASS
  was confirmed from the absolute-path log. Lesson: read
  driver logs by absolute path after a backgrounded launch.
- Full run: smoke PASS, 4 seeds, flush 0 lost to EPERM flap.
- 5602's village died at day 124 (arena wipe); death-aware
  horizon applied, no dead-village ticking.

## CHECK-QUICK (filled after suite completion)

- check.js --quick on the r61 tree: 278 passed, 9 failed in 459s —
  EXACTLY the standing profile (278/9). Full output saved:
  hidden_files/journey2-social-r61-checkquick.log.
- The 9 failing scripts are the standing set, all 9 named:
  test-hide-discovery, test-measurement-comparison,
  test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-parity-20261014,
  test-establishment-r20-fixes-20261020 (racks-voice).
  Zero src/js changes in this run (driver + analyzer only),
  so no new failure is attributable to r61. NO-REGRESSION
  gate PASSES.
