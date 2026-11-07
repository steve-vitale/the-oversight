# sim-lingergorge-a — REGRESSION VERIFICATION EVIDENCE (adoption run)

Worker: sim-lingergorge-a (adoption run fleshout-2026-11-07T1021Z, axis
food-economy / narration). Prereg:
evidence/2026-11-07/sim-lingergorge-a-prereg.md (commit 5ca013914,
rebased onto master ed070c955 — see §0). Finding #1792 (the
linger-gorge nightly line fires in stranded windows — a stranded
scholar hears gorge narration meant for the fire; sim-findings.md
line ~1792, [claimed] by the dead 0715Z run).

## VERDICT: CENSUS-GO, PROOF-NOT-GREEN (shared anchor only)

The gate verification itself PASSES on every substantive count: **0
away-delivered gorge lines out of 212 total across 40 seeds, 0 away
linger-endDays against 89 haven linger-endDays, power bar passed,
guardrail (i) passed, det-gate holds, 0 classification
disagreements, 0 ungrouped lines.** The carried before leg had 3 away
deliveries; the after leg has none, and the at-Haven gorge is not
silenced — it fires MORE (212 vs 80 carried).

The verdict is NOT an unqualified GO because the prereg's verdict
rule requires "both proof tests are green" and they are 31/33 and
40/42. The ONLY failures in either suite are the two checks on the
shared 15003 loop-day-7 gossip anchor — a 'Word gets around the
haven' line in a non-stranded sleep window, unrelated to the gorge
gate. A focused probe (see §3) shows the anchor's underlying fact
still holds on current master: the word line still fires in
non-stranded sleep windows inside Haven, on loop-days 16 (×2) and
39 — only the pinned DAY moved (7 → 16/39). This is substrate
drift of the pinned day, the exact case the prereg's anchor section
anticipated ("reported as a finding (substrate drift), not silently
re-anchored").

Per the adoption brief, a verification that does not pass the
prereg's bar as literally written is documented and STOPPED — no
fix is built, and none is needed: the landed gate 6aeba1c88 holds.
The anchor re-pin decision is the coordinator's: the same shared
anchor blocks the sibling mootsummon arm (31/33 + 58/60, "anchor
decision pending" per the 0715Z tracker entry), so the re-pin
should land once, consistently, not per arm. **Finding #1792 stays
[claimed] pending that coordinator decision; it is NOT marked
[fixed] by this run.** If the coordinator re-pins the anchor
(day 7 → 16) and re-runs the two proof suites green, this
evidence supports a clean GO with no further sims needed — the
census is complete and judged.

## §0 — Adoption, rebase, corpus completeness

- Adopted stranded arm: prereg commit only (b813d2313) on the
  branch; the 0715Z worker went silent ~09:17Z with the corpus
  uncommitted.
- Master SHA read in ~/workspace/the-scattering immediately
  before rebasing: ed070c955 (unchanged from the 10:21Z brief).
  Rebased onto the explicit SHA, no sequencer quirk, clean:
  branch tip 5ca013914, `git log master..HEAD` = the prereg
  commit only.
- Corpus as found: after/ legs gorgeharness-s49001..49039 present
  (39/40), all parsing clean. **Missing: s49040 only.** The
  previous worker ran the pilot (49001–49008) and the screen
  through 49039, then went silent one seed short of the
  pre-registered 40.
- Seed 49040 run by this worker with the UNCHANGED reused driver
  (scripts/gorgeharness-trace-a.js, SEEDS=49040, DAYS=60,
  OUTDIR=evidence/2026-11-07/sim-lingergorge-a-corpus/after/,
  env gates verbatim from the prereg): survived 60d, 0 away / 4
  haven gorge lines, 1 haven linger-endDay, 0 disagreements, 0
  ungrouped. Completed legs were NOT re-run; their files were
  verified parseable and pooled as-is.
- Corpus now COMPLETE: 40/40 legs, 49001–49040.
- No src/js change in this run. No new scripts. The only files
  committed by this run: the 40-leg corpus (39 adopted + 1 run)
  and this evidence file.

## §1 — Primary metric (revised, per prereg)

Gorge lines delivered while scholarAtHaven() is FALSE at FIRING
TIME, any phase, any away night. Firing-time position = nearest
pre-endday marker at or before the line's idx; the old
marker-based positionAt is the cross-check (disagreements
reported).

| | carried BEFORE (gorgeharness-a, base cc4345e1e) | AFTER (this run, master ed070c955) |
|---|---|---|
| total gorge lines | 83 | **212** |
| away-delivered | 3 | **0** |
| at-Haven delivered | 80 | **212** |
| away linger-endDays | 2 | **0** |
| haven linger-endDays | 39 | **89** |
| drift-off lines (away / haven) | 0 / 0 | 0 / 0 |
| classification disagreements | — | 0 |
| ungrouped lines | — | 0 |

- POWER BAR (pre-registered): total gorge ≥ 20 AND away
  linger-endDays reported. **PASSED**: 212 total; the "away
  linger-endDays reported" half is vacuous in the after leg
  because there are 0 away linger-endDays at all — the
  denominator the bar was guarding against (a silent gorge)
  is absent the other way: 89 haven linger-endDays show the
  gorge fired abundantly.
- GUARDRAIL (i) — no silencing of at-Haven delivery: after-leg
  at-Haven ≥ 50% of carried before (80). **PASSED**: 212 ≥ 40
  (265% of before). The gate suppresses delivery away, not the
  gorge itself.
- GUARDRAIL (ii) — det-gate: instrument ON vs OFF identical on
  seed 17021. **HOLDS** in both proof suites (see §3).
- GUARDRAIL (iii) — trajectory caveat: per-seed daysAlive is
  NOT expected to match the carried before leg (231+ commits
  of other landed arms between bases). Median daysAlive 60 in
  both legs; 17/40 seeds changed daysAlive (see table §2).
  Divergences are substrate drift, attributed as such; the
  gate verdict does not depend on trajectory identity.
- GUARDRAIL (iv) — no gate/price/deed-rule change: **no src/js
  change at all in this run.**
- GUARDRAIL (v) — regression anchors: the 3 documented away
  deliveries (s49003 d43→d44 grove, 2 lines; s49014 d27→d28
  creek, 1 line) read **0 away deliveries on the after leg** —
  BUT the trajectories did not reproduce exactly (see §2), so
  per the guardrail this is reported as a finding, not a
  clean re-anchor: the verdict rests on the band-wide 0-away
  count, which is unambiguous.
- EXTENSION RULE: not triggered (power bar passed on the
  40-seed band; no 49041–49064 extension run).

## §2 — Per-seed table

seed | daysAlive before → after | gorge before (away) | gorge after (away) | linger-endDays after
49001 | 60 → 60 | 0 (0) | 1 (0) | 1
49002 | 60 → 60 | 0 (0) | 1 (0) | 1
49003 | 60 → 60 | 24 (2) | 18 (0) | 6
49004 | 60 → 60 | 0 (0) | 5 (0) | 3
49005 | 54 → 60 | 0 (0) | 0 (0) | 0
49006 | 60 → 60 | 0 (0) | 2 (0) | 2
49007 | 60 → 60 | 10 (0) | 7 (0) | 3
49008 | 60 → 56 | 0 (0) | 3 (0) | 1
49009 | 60 → 60 | 0 (0) | 21 (0) | 7
49010 | 60 → 60 | 0 (0) | 0 (0) | 0
49011 | 60 → 57 | 0 (0) | 0 (0) | 0
49012 | 42 → 60 | 8 (0) | 5 (0) | 3
49013 | 60 → 59 | 0 (0) | 10 (0) | 5
49014 | 56 → 60 | 11 (1) | 12 (0) | 5
49015 | 60 → 60 | 0 (0) | 15 (0) | 4
49016 | 60 → 60 | 0 (0) | 7 (0) | 2
49017 | 60 → 53 | 0 (0) | 6 (0) | 2
49018 | 55 → 60 | 6 (0) | 0 (0) | 0
49019 | 51 → 60 | 0 (0) | 0 (0) | 0
49020 | 60 → 60 | 0 (0) | 0 (0) | 0
49021 | 60 → 60 | 0 (0) | 3 (0) | 3
49022 | 60 → 60 | 0 (0) | 0 (0) | 0
49023 | 24 → 40 | 0 (0) | 0 (0) | 0
49024 | 60 → 60 | 1 (0) | 8 (0) | 5
49025 | 60 → 60 | 1 (0) | 14 (0) | 5
49026 | 60 → 60 | 4 (0) | 1 (0) | 1
49027 | 60 → 51 | 0 (0) | 4 (0) | 2
49028 | 59 → 60 | 2 (0) | 20 (0) | 6
49029 | 60 → 60 | 13 (0) | 0 (0) | 0
49030 | 60 → 60 | 0 (0) | 0 (0) | 0
49031 | 34 → 60 | 0 (0) | 0 (0) | 0
49032 | 60 → 60 | 0 (0) | 1 (0) | 1
49033 | 60 → 60 | 0 (0) | 3 (0) | 2
49034 | 60 → 60 | 0 (0) | 0 (0) | 0
49035 | 60 → 60 | 0 (0) | 7 (0) | 3
49036 | 49 → 60 | 0 (0) | 1 (0) | 1
49037 | 59 → 60 | 1 (0) | 21 (0) | 9
49038 | 60 → 52 | 0 (0) | 5 (0) | 2
49039 | 60 → 60 | 0 (0) | 7 (0) | 3
49040 | 57 → 60 | 2 (0) | 4 (0) | 1

Before-leg per-seed totals re-pooled from the carried corpus
(evidence/2026-11-06/sim-gorgeharness-a-corpus/before/):
total 83, away 3, haven 80, linger-endDays 41 — exactly the
prereg's carried facts.

Anchor reads (guardrail v): s49003 after = 18 haven lines on
loop-days 41, 43, 50, 52, 53 (6 haven linger-endDays), 0 away;
s49014 after = 12 haven lines on loop-days 30, 47, … (5 haven
linger-endDays), 0 away. The before leg's specific away
nights (s49003 d43→d44 grove; s49014 d27→d28 creek) do not
reproduce as trajectories on current master — the sieges form
on different nights (e.g. s49003 now gorges on d41/d43/d50/
d52/d53 instead of d44). That is substrate drift in siege
formation, not a gate miss: on the after trajectories the
scholar is at Haven on every gorge night, including the
harness-phase nights that were the defect channel.

Anomalous-pattern reads (prereg: any seed whose gorge-count
pattern looks anomalous gets a read):
- Zero-gorge seeds (12 of 40: 49005, 49010, 49011, 49018,
  49019, 49020, 49022, 49023, 49029, 49030, 49031, 49034):
  read s49005 — 0 "lingering" mentions in the whole
  transcript (840 lines), 8 raid mentions, maxWave 3. No
  lingering raider ever formed on that seed, so no gorge
  could fire. Zero lines = no siege, not silencing.
- High-gorge seeds (49009: 21, 49028: 20, 49037: 21): each
  is a long multi-night siege (7/6/9 linger-endDays). All
  lines atHaven:true, including harness-phase lines — e.g.
  s49009 loop-day 52 harness: "🌙 Night. The lingering The
  Redactor gorges at the treeline — 600 kcal gone from the
  stores…"; s49037 loop-day 41 harness: "…The lingering
  Ugly-Eyes gorges at the treeline — 1,200 kcal gone…";
  s49028 loop-day 51 harness: "…The lingering Big Loud
  gorges at the treeline — 1,105 kcal gone…". The harness
  phase is the exact channel that produced the before leg's
  3 away deliveries; on current master it delivers 0 away.
- Empty-pantry gorge variant: 0 lines in the after leg (all
  212 are the got>0 variant). The stores were never empty at
  gorge time on this substrate; the variant is unexercised
  by the corpus but covered by unit leg B10 in both proof
  suites (green).

Held-volume accounting (guardrail i): pendingHavenNews depth
per evening, read-only, 2,345 evenings pooled: max 14, mean
0.046. No unbounded queue growth; the gate queues nothing
for the nightly line by design (ephemeral: tonight's kcal).

Drift-off: 0 lines in either leg, away or haven — the ~6-night
clock never wins its race on this substrate (same as the
carried before leg). The relay is therefore judged by B11
unit evidence (green in both suites), not by the corpus, per
the prereg.

## §3 — Proof tests (on the rebased base ed070c955)

Env gates verbatim from the prereg (COMPETENT_FEAST=0
SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel
WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1).

- scripts/test-lingergorge-a.js: **31/33** — 31 ok, 2 FAIL.
- scripts/test-gorgeharness-a.js: **40/42** — 40 ok, 2 FAIL.
- The ONLY failures in either suite are the two shared-anchor
  checks (identical failure in both files):
  - "non-stranded anchor: 15003 loop-day-7 sleep window has a
    Word-gets-around line" — no 'word' hit on loop-day 7.
  - "non-stranded anchor: that hit fires inside Haven" —
    vacuous (no day-7 hit to check).
- Everything else green in both suites, including: all gorge
  classifier checks, all B9/B10/B11 gate/relay scenario
  checks (away says 0 nightly lines, kcal still taken, offer
  still recorded, drift-off queued away / said at Haven),
  det-gate ON vs OFF identical on 17021, 17021 re-pin
  (60d survived, 0 stranded nights, 0 stranded sleep
  windows, 0 burst events — matches the prereg's current-
  substrate facts), and the revised-metric sanity checks
  (totals agree across instruments; linger-endDays account
  for every gorge/drift-off line).

Anchor probe (this run, /tmp/probe-15003-word.js — reuses the
judged oneInstance/analyzeInstance, seed 15003, 60 days,
same env): daysAlive 60, survived, 60 non-stranded sleep
windows. 'Word gets around the haven' hits in non-stranded
sleep windows, all position.inside === true, tile 'haven':
- loop-day 16, idx 2332: "Word gets around the haven.
  Whatever that thing was — every fire has a theory tonight."
- loop-day 16, idx 2334: "Word gets around the haven.
  Whatever that thing was — everyone's talking about it now."
- loop-day 39, idx 5160: "Word gets around the haven.
  Whatever that thing was — the haven's talking about
  nothing else."

The anchor's FACT holds (the gossip line still fires in a
non-stranded sleep window inside Haven); only the pinned DAY
moved, 7 → 16/39. Substrate drift, same class as the 17021
anchor's repeated re-pins (57d lost → 60d survived → 52d
lost → 60d survived). The test asserts the day, so it fails;
the instrument is not contaminated (det-gate holds) and the
gorge gate is not implicated — the anchor is a gossip-line
position check, not a gorge check. No test file was edited
in this run; the re-pin is left to the coordinator (see
verdict).

Note for the coordinator: the mootsummon arm hit the identical
two failures (its 31/33 + 58/60). A single re-pin of the
shared anchor (day 7 → 16) across test-lingergorge-a.js,
test-gorgeharness-a.js, test-mootsummon-a.js and
test-mootgate-a.js, with the probe above as the recorded
evidence, would clear all four suites. This run deliberately
did not do that unilaterally.

## §4 — Sense test (SENSE-TESTING LAW)

Every gorge line in the after corpus was read with its firing
context; there is no residual away hit to quote (0 away).
Representative at-Haven lines, all with atHaven === true on
both the firing-time (pre-endday) and cross-check readings:

- s49003, loop-day 41, sleep phase: "🌙 Night. The lingering
  Loud-Eyes gorges at the treeline — 746 kcal gone from the
  stores. Endure it (they drift off within ~6 nights — the
  gorge is the price), or send a sortie: fighters, rations,
  real risk."
- s49003, loop-day 43, harness phase: "🌙 Night. The
  lingering Big Big gorges at the treeline — 1,371 kcal gone
  from the stores. Endure it (they drift off within ~6
  nights — the gorge is the price), or send a sortie:
  fighters, rations, real risk."
- s49003, loop-day 52, sleep phase: "🌙 Night. The lingering
  Static gorges at the treeline — 1,200 kcal gone from the
  stores. Endure it (they drift off within ~6 nights — the
  gorge is the price), or send a sortie: fighters, rations,
  real risk."

Per beat: reads-true (the kcal loss, the endure/sortie choice,
and the ~6-night drift clock are all honest at the fire) /
gated (no line reaches a scholar away from Haven — 0/212) /
relayed-true (the drift-off line waits for the fire via
sayHavenNews; B11 unit evidence green; no corpus instance
because the drift clock never fires on this substrate) /
still-wrong: nothing. A gated gorge never invites a sortie
from the wild — the invitation is spoken only where a sortie
can actually be launched.

One coherence note, not a defect: the same monster name can
gorge twice in one night with different kcal (e.g. s49003
d52: "The Eulogy … 715 kcal" and "The Eulogy … 1,450 kcal"
in the same endDay; two separate lingerers sharing a
display name). A player at the fire hears the same beast
named twice with two different takes — slightly odd, but
the names are display names for distinct lingerers, and
the counts are honest. Filed as an observation, not a
finding; no action in this arm.

## §5 — Secondary deliverable: state.lastLingererOffer readers

Verdict: **DEAD STATE in the shipped game.**

Grep of the whole tree (src/js AND scripts/ AND docs/) on
master ed070c955:
- The only src/js mention is the WRITER,
  src/js/havenGrowth.js:275 — `this.state.lastLingererOffer
  = { key, name, day }`, recorded on every linger-endDay
  whether the line was said or gated (B9 unit check green:
  away still records the offer).
- Readers exist ONLY in sim/test tooling:
  scripts/policies/sortieretry.js:27 and
  scripts/policies/sortietarget.js:32 (bot policies that
  aim a sortie at the last announced offer),
  scripts/sortietarget-fixture.js:64, and the sortieretry /
  sortietarget test files. No docs/ mention.
- No src/js reader, no UI reader, no other game system
  consumes the record. In the shipped game the offer is
  written nightly and never read — announcement memory with
  no audience. (The record does real work for the sim bots'
  sortie policies, which is presumably why it was kept.)
- No recording change made (the fix does not need it), per
  the prereg.

## §6 — Code facts (verified by read on master ed070c955)

- src/js/havenGrowth.js:264 — the nightly gorge lines
  (got>0 at :266, empty-pantry at :268) are wrapped in
  `if (this.scholarAtHaven && this.scholarAtHaven())` —
  the landed gate (6aeba1c88), still in place.
- :234 — the drift-off line already calls `sayHavenNews(...,
  'raid')` — the landed relay.
- Mechanics above the gate (take draw, raidPillage kcal
  loss, drift clock, lastLingererOffer recording) run
  identically either way; the gate consumes no RNG.

## §7 — Metric review

- The revised metric (firing-time position, any phase, any
  away night) proved correct: it caught exactly the channel
  the retired stranded-window metric missed, and the
  cross-check (positionAt vs pre-endday marker) agreed on
  all 212 lines (0 disagreements). No revision proposed.
- The verdict rule's "both proof tests are green" clause
  binds this run to PROOF-NOT-GREEN on a shared anchor that
  is not part of the gate under test. For the NEXT run:
  consider splitting the verdict so a drifted shared anchor
  cannot hold a clean gate census hostage — e.g. "gate
  verdict" (census + gate-specific proof legs) separate from
  "anchor health" (shared anchors, re-pinnable by correction
  commit with probe evidence). This run does NOT re-score
  itself under that friendlier rule; the verdict above
  stands as pre-registered.
- The power bar's "away linger-endDays reported" half is
  vacuous when the gate works perfectly (0 away
  linger-endDays). It still did its job as a tripwire
  against a silent gorge (89 haven linger-endDays prove
  the gorge fired). No change proposed.
- No fresh before leg was possible or needed; the carried
  before corpus re-pooled exactly (83/3/80/41).

## §8 — Panel scope decision (stands, pre-registered)

No fresh §15 balanced-panel compare was run. gorgeharness-a
already ran it for this exact fix on this exact band (every
paired delta exactly 0); a fresh compare on current master
would measure 231+ commits of other arms' landed gameplay
changes, not this fix. The panel evidence stands cited, not
re-run. No repair was built, so the panel question does not
re-open.

## §9 — Wall numbers (carried, NOT re-measured)

This is a narration verification corpus; it records no scale
outcomes. Carried state from the 1041Z round (0915Z run, 24
distinct seeds): wins 0/24, national 0/24, table 0/24,
wave-5 0/24, readiness-5-ready days 0/24.

## §10 — Deliverables checklist

- [x] evidence/2026-11-07/sim-lingergorge-a-prereg.md
  (committed before any judged sim; rebased onto ed070c955
  as 5ca013914)
- [x] evidence/2026-11-07/sim-lingergorge-a.md (this file)
- [x] evidence/2026-11-07/sim-lingergorge-a-corpus/after/
  (40/40 per-seed JSON; judged lines with firing-time
  position + pre-endday markers; linger-endDay table;
  pendingHavenNews depth series; per-beat line counts)
- [x] No new scripts, no src/js change. Proof tests run on
  the rebased base: 31/33 + 40/42 (anchor-only failures,
  probe-verified drift).
- [ ] sim-findings.md #1792: left [claimed] — coordinator
  decision (anchor re-pin) pending. NOT marked [fixed] by
  this run.

## §11 — What this run did NOT do (explicit)

- Did not re-run completed corpus legs (reused after
  verifying they parse).
- Did not rebuild the gate/relay fix — it is already landed
  (6aeba1c88) and the verification shows it holds.
- Did not re-pin the 15003 anchor or edit any test — the
  shared-anchor decision belongs to the coordinator (it
  also blocks the sibling mootsummon arm).
- Did not run `node scripts/check.js --quick` (finishersize
  gate owns the gate slot) and did not run concurrent jest.
- Did not push, bump versions, or verify live. Branch is
  ready for the coordinator to merge --ff-only (see report).
