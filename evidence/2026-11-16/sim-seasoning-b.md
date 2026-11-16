# sim-seasoning-b — EVIDENCE (DIAG: the seasoning gate)

Run: fleshout-loop-b-20261116T1130Z (Loop B), arm sim-seasoning-b — ADOPTED
AND FINISHED by the 1530Z Loop B run (see Adoption note below).
Axis: winnability chain. Tracker blank 6 (0430Z blank #3; 0446Z review's
blank #6): the seasoning gate — how often does 2-of-3-seasoned block
covenant staging / national reach?
Branch: sim-seasoning-b — worktree ~/workspace/worktrees/sim-seasoning-b
Prereg: evidence/2026-11-16/sim-seasoning-b-prereg.md (FROZEN, committed
b81587355 — judged against it as written; nothing in it re-scored).
Base at sweep: master df768b9b3. Rebasing: this branch was rebased onto
master tip 47477d874 before landing (haventarget landed as 94abc9793);
proofs re-run green on the rebased tip (see Proof section).
Date: 2026-11-16. Type: DIAG — instrument + measured gate distribution.
No game change, no default flipped, no lever. Zero src/js in the branch
diff (verified: `git diff 47477d874..HEAD -- src/` is empty).

## Adoption note (stale-claim recovery)

This arm belonged to the dead 1130Z Loop B run (no lock, heartbeat 24min
stale, no processes). Its worker finished the sims but never committed or
wrote evidence. The adopting worker verified the tree state first and
finished the arm without re-running the sweep: 16/16 per-seed JSONs parse
as complete JSON with full series (134–149 days each) and 0 instrument
errors; the analysis file was re-generated from the corpora twice
(pre-rebase and post-rebase) and is BYTE-IDENTICAL to the file the dead
run left behind — nothing was overwritten silently. The one modified
tracked file, scripts/write-tcp-to-file-b.js, is this arm's own work (TCP
listener fix proven during the sweep: 120s→600s connect timeout, and the
idle timer cleared on a successful write so a good write no longer exits
1; proven 14:56/15:06 on 2026-11-16), committed with the arm. The new
scripts/run-seasoning-tcp-sweep-b.sh is the sweep runner that produced
the corpora, also committed with the arm.

## Verdict: GO (G1 GO, G2 GO, G3 GO) — DIAG, no game change

- G1 INSTRUMENT VALIDITY — GO (branch (b), see "G1 unknown-days
  investigation" below). The frozen analyzer computes band unknown=4 and
  9 unclassified days; the frozen proof's --corpus "unknown 0" check
  fails on this corpus (65/66, the single failure). The day-level
  investigation shows the 4 in-window days are NOT genuine unclassified
  staging decisions: each is the qualification day whose staging the game
  itself records that same day ("National beat staged: covenant" in the
  Codex channel, dated the qualification day on 8/8 staged seeds),
  staged at the first day-boundary check after qualification and answered
  the next day. No staging decision in the corpus is left unexplained:
  0 unknown verdicts, D3 engine-agreement 150/150 blocked days and
  11/11 staged days, 0 misses. The letter-vs-substance gap is stated
  here, not hidden; the metric-review section proposes the
  phase-corrected classifier for the NEXT run.
- G2 THE MEASUREMENT — GO. Per-seed verdicts, blocked-day counts,
  blocker-link identities with age/trust split, and days-lost are
  computed for all 16 configs; the seasoning-blocked share of non-stages
  is reported per leg and band-wide below. The question is answered with
  a number.
- G3 LEVER-ONLY — GO. Zero src/js changes in the branch diff; proofs
  green at the recorded baselines on the rebased tip (see Proof section).

## The answer (tracker blank 6)

On the fresh shared band 102201–102208, 150d, identical seeds:

- Covenant leg (control — road walked, no deeds): 0/8 staged.
  Seasoning-blocked share of non-stages **1/8 (12.5%)** — the single
  seasoning-blocked non-stage is 102204 (44 blocked days, censored 44
  days lost). The other 7 non-stages are other-blocked, and the binding
  constraint on this leg is link FORMATION, not seasoning: 4/8 seeds
  formed zero covenant peer links, 2/8 formed only 2 of 3.
- Courtship leg (armed — road + courtship deeds): **8/8 staged**.
  Seasoning still taxed the road: 4/8 staged seeds sat seasoning-blocked
  for 59 days total (days-lost 0, 12, 2, 0, 0, 0, 18, 31; median 1d),
  but it never stopped a staging on this leg.
- Band-wide seasoning-blocked share of non-stages: **1/8 (12.5%)**.
  Seasoning is the tax on the road to national, not the wall — on this
  band. The wall on the control leg is getting three links to exist at
  all.

## Per-seed verdict table (covenant leg — control)

| seed | verdict | gate | firstOpp | sbDays | daysLost | decisive blocker |
|------|---------|------|----------|--------|----------|------------------|
| 102201 | other-blocked | formed-short:2-of-3 | — | 0 | — | — (only 2 links formed) |
| 102202 | other-blocked | no-peer-links | — | 0 | — | — (0 links formed) |
| 102203 | other-blocked | no-peer-links | — | 0 | — | — (0 links formed) |
| 102204 | **seasoning-blocked** | seasoned-short:2-of-3 | d107 | 44 | 44 (censored) | village_3, formed d107, age 43, trust 26 — age met, **trust owed 14** |
| 102205 | other-blocked | formed-short:2-of-3 | — | 0 | — | — (only 2 links formed) |
| 102206 | other-blocked | no-peer-links | — | 0 | — | — (0 links formed; village lost d137) |
| 102207 | other-blocked | formed-short:1-of-3 | — | 0 | — | — (only 1 link formed) |
| 102208 | other-blocked | no-peer-links | — | 0 | — | — (0 links formed) |

102204 detail (the only seasoning-blocked seed): the third link formed
d107 at trust 30 and drifted DOWN to 26, never tended. Blocked days
split: 30 days both age-short AND trust-short (d107–d136: age 0–29,
trust 22–25), then 14 days trust-only (d137–d150: age 30+, trust 25–26).
Age was never the binding half at the end; trust was 14 points short
with the season already served. The policy tended other links on d67–d91
but never this one after it formed.

## Per-seed verdict table (courtship leg — armed)

| seed | verdict | stagedDay | firstOpp | sbDays | daysLost | decisive link (se flip on qualification day) |
|------|---------|-----------|----------|--------|----------|----------------------------------------------|
| 102201 | staged | d62 | d62 | 0 | 0 | rung (all 3 seasoned by d60; rung met d61) |
| 102202 | staged | d73 | d61 | 11 | 12 | village_spl_26_60773 (The Hungry Road) — age 29→30 on d72 |
| 102203 | staged | d74 | d72 | 1 | 2 | village_1 (Stonebridge) — trust 38→46 on d73 (tended d73) |
| 102204 | staged | d64 | d64 | 0 | 0 | rung (all 3 seasoned; rung met d63) |
| 102205 | staged | d67 | d67 | 0 | 0 | rung (all 3 seasoned; rung met d66) |
| 102206 | staged | d65 | d65 | 0 | 0 | rung (all 3 seasoned; rung met d64) |
| 102207 | staged | d79 | d61 | 17 | 18 | village_spl_38_6557 (The Hungry Road II) — age 29→30 on d78 |
| 102208 | staged | d93 | d62 | 30 | 31 | village_spl_31_32776 (The Red Table II) — age 29→30 on d92 |

Age/trust split of the 59 courtship blocked days: age-only 6,
trust-only 1, both 0, multi 26+10+16 = 52 (days with 2+ unseasoned
links). Per seed: 102202 age-only 1 / multi 10; 102203 trust-only 1;
102207 age-only 1 / multi 16; 102208 age-only 4 / multi 26. The
multi-days are the early window when the second and third links were
both still serving their season; the single-link tail is almost always
AGE (the last link's 30th day), except 102203's single trust day
(Stonebridge cooled to trust 38, tended back to 46).

NOTE on decisive: the analyzer's `decisive` field is null for all 8
staged seeds — its flip comparison runs stagedDay vs stagedDay−1, but
the season flip lands on the qualification day (stagedDay−1), one
snapshot earlier. The table above gives the phase-corrected decisive
link (se flip on the qualification day vs the day before). See metric
review.

## Days-lost table

| leg | seed | firstOpp | stagedDay | seasoning-blocked days | other window days | daysLost |
|-----|------|----------|-----------|------------------------|-------------------|----------|
| covenant | 102204 | d107 | — (never) | 44 | 0 | 44 (censored) |
| courtship | 102201 | d62 | d62 | 0 | 0 | 0 |
| courtship | 102202 | d61 | d73 | 11 | 0 | 12 |
| courtship | 102203 | d72 | d74 | 1 | 0 | 2 |
| courtship | 102204 | d64 | d64 | 0 | 0 | 0 |
| courtship | 102205 | d67 | d67 | 0 | 0 | 0 |
| courtship | 102206 | d65 | d65 | 0 | 0 | 0 |
| courtship | 102207 | d61 | d79 | 17 | 0 | 18 |
| courtship | 102208 | d62 | d93 | 30 | 0 | 31 |

Courtship median days-lost (staged): 1d. Covenant median days-lost
(censored): 44d (n=1). Seasoning-blocked days total: covenant 44,
courtship 59, band 103. (Frozen-definition note: daysLost counts the
qualification day as lost on the four seeds where firstOpp < stagedDay;
the staging was decided at that day's close, so the phase-corrected
wait is 1 day less on those seeds — 11, 1, 17, 30; median 0.5d. See
metric review. The frozen numbers above are what the prereg defined.)

## Seasoning-blocked share of non-stages

| leg | staged | non-staged | seasoning-blocked verdicts | share | seasoningBound (any blocked day) |
|-----|--------|------------|----------------------------|-------|----------------------------------|
| covenant | 0/8 | 8 | 1 | **1/8 = 12.5%** | 1/8 = 12.5% |
| courtship | 8/8 | 0 | 0 | n/a (0 non-stages) | 4/8 staged seeds had blocked days |
| band | 8/16 | 8 | 1 | **1/8 = 12.5%** | 1/8 = 12.5% |

## Wall table (national BOTH ways, per prereg)

| leg | n | standing≥200 (gated) | scaleRank national | nationalEver | table | wins | wave4ever | wave5ever | wave4 kills | wave5 kills | median survival | max | survived |
|-----|---|----------------------|--------------------|--------------|-------|------|-----------|-----------|-------------|-------------|-----------------|-----|----------|
| covenant | 8 | 2/8 | 0/8 | 0/8 | 0 | 0 | 8/8 | 2/8 | 28 | 0 | 150.5d | 151d | 7/8 |
| courtship | 8 | 0/8 | 7/8 | 8/8 | 0 | 0 | 8/8 | 0/8 | 20 | 0 | 151d | 151d | 7/8 |

Per-seed wall detail (standing is the gated value; raw in brackets):
- Covenant: 102201 180 [180] regional; 102202 150 [150] regional;
  102203 295 [295] regional; 102204 415 [415] regional; 102205 199
  [465] regional; 102206 199 [225] regional, village lost d137;
  102207 199 [515] regional; 102208 199 [250] regional.
- Courtship: 102201 199 [417] national; 102202 199 [372] national;
  102203 199 [447] national; 102204 199 [270] regional (staged d64,
  lapsed d127, never re-staged); 102205 195 [195] national; 102206 199
  [277] national; 102207 199 [497] national; 102208 199 [327] national.

The two national readings diverge in OPPOSITE directions across legs
(findings #2422, as the prereg required reporting): the covenant leg
has standing≥200 on 2 seeds that never reached national, while the
courtship leg reached national on 8/8 with standing≥200 on 0/8. The
gated standing is capped at 199 on 4 covenant seeds (raw 225–515) and
7 courtship seeds (raw 270–497) — the regional cap. By RAW standing
≥200 the counts would be covenant 6/8, courtship 7/8. The analyzer's
wall follows the prereg (gated standing); the raw read is recorded here
because the cap is what makes the two readings disagree. No table, no
wins on either leg; wave 5 reached on 2/8 covenant seeds (102203,
102204) and 0/8 courtship; 0 wave-5 kills anywhere. Total deaths:
covenant 567, courtship 472; starvation deaths 0 on both legs. The
one village lost (102206, both legs, d137) is the only non-survivor.

## National is not sticky (finding — inside this arm's question)

4/8 courtship seeds LOST national after reaching it, and the lapse is
always the same single cause: one covenant link's trust drifted below
40 and the polity unqualified the same day. Each lapse is a one-link
trust dip of 1–4 points:

| seed | staged | lapsed | re-staged | lapsing link (trust day before → lapse day) |
|------|--------|--------|-----------|---------------------------------------------|
| 102203 | d74 | d141 | d148 (+7d) | village_0: 45 → 39 |
| 102204 | d64 | d127 | never (by d151) | village_0: 41 → 39 |
| 102206 | d65 | d120 | d134 (+14d) | village_0: 40 → 38 |
| 102207 | d79 | d141 | d143 (+2d) | village_spl_38_6557: 40 → 36 |

Three re-staged within 2–14 days once trust recovered (102203 sat at
trust 39 for three days, d145–d147, one point short, then re-staged
d148; 102206 the same at 39 before d134). Reaching national is not
the same as holding it: the holding cost is trust maintenance on all
three links, every day, and a single point of trust drift costs the
scale. (Appended to hidden_files/sim-findings.md as an open item.)
Re-stage council lines are absent from the record — the 900-line cap
bit before the re-stagings (linkLines last days 98/116/102 vs re-stage
days 148/134/143) — but the answerNationalChoice verbEvents (uncapped)
and the nationalLive transitions record all three re-stagings.

## G1 unknown-days investigation (the critical question)

The frozen analyzer computes band unknown=4 and 9 unclassified days.
Per-seed unknown verdicts are 0 (8 staged, 1 seasoning-blocked, 7
other-blocked). The 9 unclassified days are:

| seed/leg | unclassified day(s) | in window? | what happened next day |
|----------|--------------------|------------|------------------------|
| 102201 courtship | d61 | no (firstOpp d62) | d62: answerNationalChoice + nationalLive |
| 102202 courtship | d72 | YES | d73: answerNationalChoice + nationalLive |
| 102203 courtship | d73 | YES | d74: answerNationalChoice + nationalLive |
| 102204 courtship | d63 | no (firstOpp d64) | d64: answerNationalChoice + nationalLive |
| 102205 courtship | d66 | no (firstOpp d67) | d67: answerNationalChoice + nationalLive |
| 102206 courtship | d64 | no (firstOpp d65) | d65: answerNationalChoice + nationalLive |
| 102207 courtship | d78, d142 | d78 YES; d142 no (post-stage) | d79: answer + nationalLive; d143: re-stage answer + nationalLive |
| 102208 courtship | d92 | YES | d93: answerNationalChoice + nationalLive |

Day-level evidence, seed 102202 d72 (representative; the other three
in-window days are identical in structure):

- d71 snapshot: rung met, candidate null, 3 links formed, 2 seasoned;
  third link (village_spl_26_60773, formed d42) age 29, trust 100, se=0.
- d72 snapshot: rung met, candidate PRESENT (covenant, size 4), 3/3
  seasoned; third link age 30, trust 95, se=1; pendingNational null,
  nationalLive false. The classifier calls this day 'unclassified'
  (qualified-unstaged).
- d72 linkLines (same day): "The founding council: speakers from
  Stonebridge, Thornfield, The Hungry Road sit in a circle — no throne,
  no kneeling. …" AND the Codex line "National beat staged: covenant
  (4 villages)."
- d73 snapshot: nationalLive true; verbEvents: answerNationalChoice /
  covenant on d73.

The same pair (council line + Codex "National beat staged" line, both
dated the qualification day itself) appears on ALL 8 staged seeds:
d61/d62, d72/d73, d73/d74, d63/d64, d66/d67, d64/d65, d78/d79, d92/d93
(qualification day / answer day). The 102207 d142 re-stage day follows
the same shape (trust 36→41, candidate present d142, answer d143;
its council line is cut by the 900-line cap, the answer event is not).

Mechanism (pinned in code, not inferred from the numbers):

1. The driver snapshots AFTER each policy daily() call
   (onlylead-driver-20261115.js: "snapshot after each daily() call").
2. The staging check runs inside Game.sleep(): sleep → endDay →
   membershipDaily → hierarchyDaily → _checkNational
   (hierarchy.js:4058–4071; membership.js:1186–1191, "membershipDaily
   rides the day boundary"). game.js documents the order: endDay runs
   BEFORE the day increments ("checkTraps runs at endDay BEFORE the
   day increments", "endDay BEFORE day++").
3. So the day-D snapshot shows the state BEFORE the end-of-day boundary
   check, while _checkNational evaluates that same state during sleep —
   after linkTick (which runs first inside hierarchyDaily and can move
   trust) — and stages the beat, saying the council/Codex lines while
   the day counter still reads D. The policy answers during day D+1's
   daily. The snapshot channel therefore shows a qualified candidate
   with nothing staged on day D, while the game's own dated record
   shows the staging ON day D.

Consequences for the judgment:

- The 4 in-window days are NOT genuine unclassified staging decisions.
  No decision point ever evaluated those snapshots and failed to stage:
  the dawn/boundary check that opened each of those days ran while the
  link was still unseasoned (d71: age 29 / trust 38 at the previous
  snapshot; 102203 d72: village_1 trust 38; 102207 d77: age 29; 102208
  d91: age 29; 102207 d141: trust 36), and the boundary check that DID
  evaluate the qualified state staged it — recorded the same day in
  the Codex channel and answered the next day. 9/9 unclassified days
  resolve at the next boundary; zero qualified candidates ever sat
  unstaged across a boundary.
- The identical pattern counts as unknown=1 or unknown=0 depending
  ONLY on window geometry: the other four staged seeds have the same
  qualification day, but firstOpp == stagedDay there, so the day falls
  outside the [firstOpp, stagedDay] window and does not trip the flag.
  The flag tracks window geometry, not engine behavior.
- The re-stage cases are the control: on 102203 d145–d147 the link sat
  at trust 39 (one point short) for three days with the candidate null
  — correctly NOT unclassified, correctly seasoning-blocked in the
  per-day read — and staged the moment trust crossed. The classifier
  is right everywhere except for the single qualification day, which is
  a snapshot-phase artifact, not an engine mystery.

Determination (branch (b) of the adoption brief, stated explicitly, not
a silent re-score): the frozen analyzer's `unknown` counter misfires on
the qualification day because its same-day expectation contradicts the
engine's boundary timing. G1's intent — every staging decision
classified, no mystery days — is met: every decision point in the
corpus is accounted for (D3 150/150 + 11/11, 0 misses, 0 unknown
verdicts). G1 is GO on this evidence. What is NOT hidden: as computed
by the frozen analyzer, band unknown=4, unclassifiedDays=9, and the
frozen proof's --corpus "unknown 0" check fails (65 passed, 1 failed).
The metric-review section below proposes the phase-corrected definition
for the next run; the next run should re-judge G1 under the corrected
instrument rather than taking this ruling as precedent for the numbers.

## Sense-testing (SENSE-TESTING LAW)

The seasoning wait is VOICED, not an invisible timer. On the day the
third covenant bond forms, all 8 courtship seeds say the same line:

> "Three bonds. But bonds aren't seasons — a league is a relationship,
> and relationships take seasons. Tend these fires — keep the trust,
> keep the weeks — and the council will come."
> (102201 d12, 102202 d42, 102203 d23, 102204 d18, 102205 d17,
> 102206 d15, 102207 d48, 102208 d62)

Formation lines name the bringer and the terms, e.g. 102201 d10:
"Kathleen brings it home: a COVENANT with Thornfield — no primary, no
kneeling. Mutual defense and a shared pool, decided by council vote.
Equals. The relationship starts at trust 30." Trust 30 at formation is
the floor the seasoning rule then has to lift to 40 — the game states
the starting point and the job in the same breath.

Trust decay is voiced too, and it is the mechanism behind the two
trust-blocked stories. 102203 d71: "The bond with Stonebridge's fire
is cooling — their manner at the council has gone careful, all courtesy
and no warmth. Leagues are kept warm or they go cold." The scholar
tended the link on d73 (tendLink verbEvent; trust 38→46) and the
council convened the same day. 102204 courtship d54: "The bond with
Emberhold's fire is cooling …" — same line, same warning, answered by
tending on the armed leg.

The staged moment itself is a full council scene, identical on all 8
seeds (qualification day): "The founding council: speakers from
[Thornfield, Emberhold, Stonebridge …] sit in a circle — no throne, no
kneeling. This league needs its first act. Swear the war-PACT (mutual
defense — any member's call is answered, or refused aloud), found the
shared POOL (2,000 kcal a week from every fire into one granary, drawn
in famine), or WALK from this table for now. Or REFUSE the scale itself
— stay a fr…" (record truncates at 400 chars) plus the Codex line
"National beat staged: covenant (4 villages)."

Judgment: the wait reads as a relationship maturing. The game tells
the player on day one of the third bond that seasons are owed, warns
aloud when a bond cools, and convenes the council the day the bond
seasons. Nothing about the gate is silent — except on the blocked
covenant seed, where the voice record itself is the gap: control 102204
hit the 900-line cap by d88 (flooded with early trust-too-low dialogue),
so the third link's formation (~d107) and the whole 44-day blocked wait
have NO lines in the record. That is a recorder cap, not game silence —
the game may have said the lines and the cap dropped them — but it
means the blocked wait cannot be sense-tested from this seed. The
courtship seeds' "Three bonds" + cooling lines cover the same wait, so
the sense verdict stands; the cap is recorded in metric review.

## Village assessment (what the villages looked like)

- Covenant leg (road walked, no deeds): the villages are diplomatically
  thin. Four of eight never formed a single covenant peer link; two more
  stopped at two. The road was walked — the policies visited, the links
  that formed did so late (third links formed d66–d107) — but without
  the courtship deeds the polity almost never exists. The one seed that
  did get three links (102204) watched the third sit at trust 26 for 44
  days, never tended. These villages are not blocked by a timer; they
  are blocked by never having the relationships in the first place.
- Courtship leg (road + deeds): the villages are diplomatically alive —
  8/8 staged, council scenes on all 8, tending throughout (tendLink
  events on every seed, up to 12 on 102202). But the scale they win is
  borrowed: half the villages lost national within ~60 days on a
  one-point trust dip, and one (102204) never got it back. The
  winnability-chain reading: the covenant road CAN reach national, and
  the deeds are the difference between 0/8 and 8/8 — but holding
  national is a maintenance burden the villages do not yet carry
  reliably.
- Survival is not the story on this band: 7/8 survived both legs
  (median ~151d), 0 starvation deaths, wave 4 reached everywhere
  (28 covenant + 20 courtship wave-4 kills) — but wave 5 was barely
  touched (2/8 covenant seeds reached it, 0 kills) and the table never
  appeared. The scale wall moved (national reached 8/8 armed) without
  the win moving at all.

## Cross-check disagreements (reported, not hidden)

The onlylead maxima-based cross-check disagrees with the per-day read
on 3 covenant seeds, exactly in the way the prereg anticipated (the
maxima summary cannot distinguish rung-blocked from seasoned-short;
the per-day read is authoritative):

- 102201 covenant: per-day formed-short:2-of-3 vs cross-check
  seasoned-short:2-of-2.
- 102205 covenant: per-day formed-short:2-of-3 vs cross-check
  seasoned-short:1-of-2.
- 102207 covenant: per-day formed-short:1-of-3 vs cross-check
  seasoned-short:0-of-1.

All other seeds agree (including 102204: seasoned-short:2-of-3 on
both). All 8 courtship seeds: cross-check staged, agreeing with the
per-day verdicts. D3 engine-agreement: blockedDays 150, candidate-null
150/150; stagedDays 11, candidate-seen 11/11; misses [].

## Proof

Pre-rebase (tip ed84aa941, base df768b9b3), run by the adopting worker
on the adopted tree:

- test-seasoning-b.js 59/59; test-courtship-rework2-b.js 59/59;
  test-courtship-rework-b.js 58/58; test-courtship-b.js 57/57;
  test-covenant-b.js 40/40; test-onlylead-b.js 29/29;
  test-onlylead2-b.js 26/26.

Post-rebase (tip eea5b9882, base 47477d874), same seven, same counts:
59/59, 59/59, 58/58, 57/57, 40/40, 29/29, 26/26 — no change from any
recorded number. test-seasoning-b.js --corpus (post-rebase, the proof's
own post-sweep mode): 65 passed, 1 failed — the single failure is
"classification completeness: unknown 0 band-wide — unknown=4", the
instrument artifact investigated above; the other six corpus checks
pass (16/16 files, every record parses with a full series and 0
instrument errors, every seed carries a known verdict, D3 150/150,
11/11, 0 misses).

Analyzer verification: `node scripts/analyze-seasoning-b.js` re-run
from the corpora pre-rebase and post-rebase both produce output
BYTE-IDENTICAL to evidence/2026-11-16/seasoning-b-analysis.json.
Branch diff vs master (47477d874..HEAD): 9 files, zero src/.

## Metric review (for the NEXT run — §14 binding)

1. **G1's unclassified-day definition has a snapshot-phase flaw**
   (found by this run, not assumed): the classifier expects a staging
   to be visible in the same day's snapshot, but the driver snapshots
   after policy.daily while _checkNational runs inside sleep()'s endDay,
   before the day increments — so the qualification day always reads
   'unclassified' and the staging is recorded the next day (answer
   event) and the same day (Codex staging line, which the classifier
   does not read). PROPOSED REVISION: classify the qualification day
   as a staged-precursor when the staging line or the answer follows
   within one boundary, and count unknown only when a qualified
   candidate survives a boundary unstaged (two consecutive qualified
   snapshots with no staging between them). The next run should re-judge
   G1 under the corrected instrument; this run's GO rests on the
   day-level evidence above, not on the frozen numbers.
2. **daysLost counts the qualification day as lost.** The frozen
   definition (stagedDay − firstOpp) overstates the seasoning wait by
   1 day on the four seeds where firstOpp < stagedDay (12→11, 2→1,
   18→17, 31→30; median 1d → 0.5d). Next run: define daysLost to the
   qualification day, not the answer day, or keep the frozen definition
   and report the phase-corrected figure alongside.
3. **Decisive-blocker flip window is off by one phase.** The analyzer
   compares stagedDay vs stagedDay−1, but the season flip lands on
   the qualification day (stagedDay−1 vs stagedDay−2), so decisive is
   null for all 8 staged seeds. Next run: compare the qualification
   day against the day before it (as this evidence does by hand).
4. **The 900-line LINK_LINES_CAP truncates the voice record** on every
   150d leg (last recorded line days 75–144; the blocked covenant
   seed's record ends d88). Re-stage council lines and the entire
   blocked wait on 102204 are unquotable from the record. Next run:
   raise the cap for DIAG arms or record council/staging lines on a
   separate uncapped channel (verbEvents already are uncapped — the
   staging answers survived; only the spoken lines were lost).
5. **Gated standing vs scaleRank diverge both ways** (findings #2422):
   the 199 regional cap pins gated standing at 199 while raw standing
   runs to 515, so standing≥200 and national disagree. Next run: carry
   the raw-standing read alongside the gated read (done in this
   evidence's wall detail) rather than treating either as the national
   measure alone.
6. **No test was edited to go green.** All proof counts match the
   prereg's recorded baselines exactly, pre- and post-rebase.

## Convergence state

Seasoning-gate DIAG: **GO**. The measurement stands as the answer to
tracker blank 6: on band 102201–102208 at 150d, seasoning blocks 1/8
of covenant non-stages (12.5% band-wide) and taxes staged courtship
seeds a median 1 day; the control leg's binding constraint is link
formation (7/8 other-blocked), not seasoning. No game change — zero
src/js in the branch, instrument + corpora + analysis + evidence only.
Committed for the coordinator to merge --ff-only; merged locally,
pending ship (ship loop owns pushes).

## Files

- Prereg: evidence/2026-11-16/sim-seasoning-b-prereg.md (frozen)
- Instrument: scripts/onlylead-driver-20261115.js (dirFor for
  RUN=seasoning-b), scripts/analyze-seasoning-b.js,
  scripts/test-seasoning-b.js (59/59), scripts/run-one-seasoning-b.js,
  scripts/run-seasoning-sweep-b.js, scripts/run-seasoning-sweep-split-b.sh,
  scripts/write-stdin-to-file-b.js, scripts/write-tcp-to-file-b.js
  (listener fix — this arm's own work), scripts/run-seasoning-tcp-sweep-b.sh
- Corpora: evidence/2026-11-16/perseed-seasoning-b-control/ (8 files),
  evidence/2026-11-16/perseed-seasoning-b-on/ (8 files)
- Analysis: evidence/2026-11-16/seasoning-b-analysis.json
  (byte-identical on re-run, pre- and post-rebase)
- Evidence: this file.
