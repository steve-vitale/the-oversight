# sim-warmfuel-b — warmth fuel: what the fire costs in strand nights

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0007Z,
arm sim-warmfuel-b, axis food-economy. Worktree sim-warmfuel-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero new policy files, zero edits to any existing policy
file. Sibling trees never touched; main tree never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-warmfuel-b-prereg.md (commit
9d3866655). Pinned base f52f08600550b0da8159849ffcfd5665c75e04f0
(worktree HEAD at prereg time). Primary metric: the
protected-log counterfactual on the 15215 strand —
sequential shortening plus the independent rescued count,
both reported, the GO clause judging the shortening.
GO threshold, used exactly as tasked: GO iff the
protected-log counterfactual shortens the 15215 strand
by >=3 nights on a majority of strand legs AND
warmth-log consumption is observed on >=3 strand
nights. The prereg's pre-run operationalization of
"majority of strand legs" (warmth-live strand legs only,
guard reported alongside as vacuously 0) is part of the
binding prereg, not a mid-run adjustment; see Metric
review for the literal-reading note.

Prior evidence read in full before designing anything:
sim-kcalshort-b.md (failure-mode census), sim-fedexile-b.md
(2230Z substrate), sim-strandbank-b.md (strand-bank
re-derivation). Instruments reused, not reinvented:
scripts/kcalshort-trace-b.js verbatim as the recorder
driver (OUTDIR override only), scripts/woodday-trace-b.js
verbatim as the fresh-baseline driver (OUTDIR override
only), the kcalshort classification logic (raw gates,
never the bridge skip) copied with attribution into
scripts/analyze-warmfuel-b.js.

## Fresh baselines — NO DRIFT on this base

| leg | creek | still | rescued | warmth acted | log-spent |
|-----|-------|-------|---------|--------------|-----------|
| guard (fresh) | 12 | 3 | 9 | 0 | 0 |
| ON (fresh) | 18 | 10 | 8 | 6 | 4 |

Exactly kcalshort's, fedexile's, and strandbank's fresh
numbers. The recorder legs reproduce them EXACTLY on
every per-seed creek/still/rescued count, every strand's
nights, and every strand evening's woods (EQUIVALENCE
BAR: holds on both legs, proven by
scripts/test-warmfuel-b.js). The recorder is proven
behavior-neutral; every number below is measured on
the true trajectory. The strand set is re-derived, not
inherited: only 15215 strands on this base too (fourth
consecutive base: wakeforage, pressb, kcalshort, now
this pin). 15009 has ZERO creek evenings on both legs
— it does not strand, does not even visit a creek
evening. Pilot gate (prereg step 1, gate-only): first
8 bank seeds, ON leg, 8/8 survived 30 days, errs 0,
warmth records present with the full field set, 15215
wwActed 6 — PASS; the judged corpora are single
complete 10-seed runs per leg, pilot files never mixed
in (pilot dir removed before commit; its gate numbers
are quoted here from the pilot run log).

## 1. THE WARMTH-FUEL LEDGER (first half of the question)

ON leg, strand 15215 nights 7–16. Warmth acted on 6
strand nights (8, 9, 10, 11, 12, 13); 2 of those were
failed fires that spent nothing (nights 8 and 10,
fireLit false, -70 kcal each for the attempt); 4 were
lit fires that spent a bridge log each:

| spend night | woodBefore → woodAfter | fireLit | evening class that night |
|-------------|------------------------|---------|--------------------------|
| 9 | 4 → 3 | true | kcal-only (4 logs, 0 kcal) |
| 11 | 3 → 2 | true | both (3 logs, 0 kcal) |
| 12 | 2 → 1 | true | both (2 logs, 0 kcal) |
| 13 | 1 → 0 | true | both (1 log, 0 kcal) |

TOTAL: 4 bridge logs consumed, on 4 strand nights.
This settles the kcalshort prose gap: kcalshort's prose
named spends on nights 9, 11, 13, while strandbank's
post-evening woods implied a fourth spend on night 12
— the warmth record itself confirms night 12 (2 → 1,
fireLit true). Misses on the strand: night 7
ticks-short (47 ticks < 48 fire cost, correctly missed),
nights 14–16 no-wood (pack already empty — the fire
cannot spend what is gone). Guard leg: warmth off,
acted 0, spent 0, on all 3 strand nights (miss reason
lever-off). Ledger cross-checks, all clean (0
mismatches): warmth.woodBefore equals evening logs on
every strand evening with a warmth record, and
woodBefore − woodAfter equals logSpent on every spend
night. Evening woods ON walk 4, 4, 4, 3, 3, 2, 1, 0, 0,
0 — each step down is exactly one spend night, and no
step down occurs on any other night: the pack never
recovers inside the strand, and no wood is gained on
any strand day.

## 2. THE PROTECTED-LOG COUNTERFACTUAL (second half)

Accounting, not re-simulation (prereg definitions):
preservedBefore(e) = logs spent by warmth on EARLIER
strand evenings of the same strand (a night's own spend
happens after that night's bridge decision and cannot
fund its own bridge); cfLogs(e) = logs(e) +
preservedBefore(e); kcal and ticks held at observed
values (preserving a log refunds no fire kcal — the
conservative choice). Independently rescued =
wood-only AND cfLogs >= 4 (full gate check run).
Both-evenings can never be independently rescued, no
matter how large cfLogs grows.

### ON leg counterfactual table (15215, nights 7–16)

| night | class | logs | kcal | ticks | preserved | cfLogs | rescued? |
|-------|-------|------|------|-------|-----------|--------|----------|
| 7 | ticks-only | 4 | 2254 | 47 | 0 | 4 | no (ticks) |
| 8 | kcal-only | 4 | 0 | 239 | 0 | 4 | no (kcal) |
| 9 | kcal-only | 4 | 0 | 109 | 0 | 4 | no (kcal) |
| 10 | wood-only | 3 | 240 | 238 | 1 | 4 | YES |
| 11 | both | 3 | 0 | 111 | 1 | 4 | no (kcal also 0) |
| 12 | both | 2 | 0 | 239 | 2 | 4 | no (kcal also 0) |
| 13 | both | 1 | 0 | 111 | 3 | 4 | no (kcal also 0) |
| 14 | wood-only | 0 | 240 | 238 | 4 | 4 | YES |
| 15 | both | 0 | 0 | 111 | 4 | 4 | no (kcal also 0) |
| 16 | both | 0 | 0 | 111 | 4 | 4 | no (kcal also 0) |

Read the table carefully, because it is the whole
answer in one place: by night 11, preserved logs alone
would give the villager a bridge's worth of logs on
EVERY remaining evening (cfLogs 4 throughout) — and
it would still be stranded on nights 11, 12, 13, 15,
16, because kcal is 0 on all five. Logs are necessary
but not sufficient past night 10; food binds every
late evening jointly with wood, exactly as kcalshort
found. The both-evenings are shown as NOT rescued even
where cfLogs reaches 4 — that is the kcalshort rule
applied mechanically, not a judgment call.

- Independent rescued count (ON): 2 nights (10, 14).
  Night 10: 3 observed logs + 1 preserved (night 9's
  spend) = 4, with 240 kcal and 238 ticks — all three
  gates pass. Night 14: 0 observed + 4 preserved = 4,
  with 240 kcal and 238 ticks — all three gates pass.
- First rescue: night 10. Sequential shortening: the
  bridge builds on night 10, so still evenings are
  7, 8, 9 only (3) instead of 7–16 (10) — SHORTENING
  = 7 NIGHTS. Nights 11–16 are avoided, not
  individually rescued: no both-evening among them is
  claimed as rescued, and nothing is claimed about
  what those nights would have looked like, because
  in the counterfactual world they do not occur.
  The shortening assumes only that days up to night
  10 are unchanged (true by construction — preserved
  logs change the pack count, not prior days' food,
  time, or route) and that the bridge builds on
  night 10 (true by definition — all gates pass).
- Guard leg counterfactual: preserved 0 on all 3
  strand nights (no warmth logs exist to protect),
  rescued 0, shortening 0 — vacuously, by
  construction. The guard strand is already the
  3-night strand the ON counterfactual restores:
  protected-log ON (3 still nights) = guard (3 still
  nights). Warmth's extension (3 → 10) is exactly
  undone, night for night, by protecting its fuel.

## 3. THE #1568 ANSWER (plain words)

On strand nights the warmth fire consumes 4 bridge
logs, on 4 nights (15215 ON nights 9, 11, 12, 13).
If those logs had been preserved for the bridge, the
strand would shorten by 7 nights — from 10 still
nights to 3 — because the very first wood-only night
after the first spend, night 10, would have built
its bridge (4 logs, 240 kcal, 238 ticks) and the
villager would have walked home that night instead
of spending six more nights at the creek. That is
the strand-length answer, and it is large: warmth
fuel accounts for the ENTIRE extension, 7 of 7
nights, not a fraction of it.

But the per-night answer is smaller and must travel
with it, or the headline misleads: only 2 individual
nights are rescued by protected logs on their own
terms (nights 10 and 14, the only wood-only nights).
Every other late evening fails on food too, and no
amount of preserved wood rescues a night with 0 kcal
in hand. So protecting the logs fixes the strand's
length only because it fixes it EARLY — at night 10,
before the food collapse of nights 11–16 sets in. A
protection that arrived late (say, only from night
12 on) would rescue nothing: night 12 is a
both-evening, night 13 is a both-evening, and night
14's rescue is moot once night 10 has already built
the bridge. The design moral, stated as measurement
rather than prescription: bridge-log protection is
worth exactly one early night here — the first
wood-only night after the first spend — and after
that night, the strand's binding problem is food,
not wood. Any fix that protects logs without feeding
the villager still leaves a villager who, on nights
11–16, holds a bridge's worth of logs and 0 kcal.

## Sense-test (law — read end to end, judged for meaning)

Judged ON corpus, seed 15215, night 10 — the
first-rescue night, the night the counterfactual
turns on. The day reads as a coherent hungry day
that works: travel to wetland, "You work the patch
with practiced hands: 8× Purslane (240 kcal). This
patch is picked clean", travel back to creek, eat
the Purslane, then the honest refusal ("No bridge
tonight — the pack holds 3 logs, and a bridge
needs 4"), then the warmth attempt fails honestly
("Nothing. Your arms ache. But your hands know a
little more than they did. (-70 kcal, 48 ticks of
work, gone either way.)") — the record agrees
(warmth acted true, fireLit false, logSpent 0,
240 → 170 kcal). PASS, with the same quiet gap
kcalshort noted, now visible on the pivotal night:
nothing in the narration connects night 9's fire to
night 10's refusal. Night 9's own tail shows the
refusal on kcal ("No bridge tonight — 0 kcal in
hand, and the lashing takes 60") followed by the
fire catching ("The tinder catches. A real flame,
breathing. You feed it twigs — fire. Yours. (-0
kcal, 48 ticks.) (It will burn down. Feed it
branches or a log to keep it alive.)") — the spend
is narrated as feeding the fire, but no line states
the pack lost a bridge log, and night 10's refusal
judges the post-spend pack without mentioning it.
A player reading only the story would never learn
that warmth cost the bridge; they would learn only
that the bridge needs one more log. The numbers are
honest at every step; the connection between them is
not spoken. (Filed below as an out-of-scope
narration observation for the coordinator, not a
wording change proposed here.)

Night 14, the second independent rescue, reads the
same shape from the other end: "You eat Purslane
(240 kcal)" then "No bridge tonight — the pack
holds 0 logs, and a bridge needs 4" — a fed
villager stopped by an empty pack, with the
counterfactual 4 preserved logs sitting invisibly
in the fire's history. One ambient wrinkle, same
class as prior arms, not a census failure:
"fragments by the fire" gossip lines run on
stranded days, including fireless nights.

## Village assessment (plain words)

The banked villages are the same working villages
the strand arms have always seen: all 10 survived
30 days on both legs (ceiling effect of the window
+ banking selection, not a survival claim). The
story this arm adds is a price tag on a trade the
villager never gets to weigh: four nights of warmth
cost four bridge logs, and those four logs cost
seven nights of strand — because the first log
spent is the one that breaks the bridge on the
very next fed night, and the nights after that
are lost to hunger as much as to wood. The village
at home is not poor through any of this: the home
pantry holds 21,968 kcal on night 7 and grows to
30,581 by night 16, while the stranded villager
carries no food at all on most nights. The strand
is not a scarcity story. It is a distance story
with a fire in the middle of it: warmth tonight,
paid for with the way home tomorrow, and after
tomorrow, with hunger that wood cannot fix.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Creek/bridge content
reached (ON: 18 creek evenings, 8 rescued; guard: 12
creek evenings, 9 rescued). Waves 1–2 in 9/10 banked
villages on the ON leg (15215 reaches wave 1 only),
wave 3 in 1/10 (15439); waves 4–5 not reached in this
30-day window (same window as kcalshort/fedexile/
strandbank).

## Wall numbers

NOT OBSERVABLE as reachability on 30-day evening legs
(pre-seat, no field) — reported, never claimed.
Observed counts on the ON leg, all 10 seeds alive at
day 30: national 0, table 0, wins 0 (structurally
unreachable in this band, not a wall measurement);
wave reach: wave 1 in 10/10, wave 2 in 8/10, wave 3
in 1/10 (15439), waves 4–5 in 0/10; median survival
30 days (ceiling — all seeds survived the window);
harness death-sample counts 6–18 per seed (village
deaths over the 30 days as recorded by the harness,
not a mortality claim). Guard leg wall numbers are
identical on wave reach and survival (15215: 6
deaths guard vs 8 ON — the longer ON trajectory's
extra entries, same class as fedexile's finding).

## Proof

scripts/test-warmfuel-b.js: 103/103 checks pass
(counterfactual unit cases incl. the kcalshort ON
table as a function fixture — total 4, spend nights
4, cfLogs, rescued [10, 14], firstRescue 10,
shortening 7; both-evening at cfLogs 4 never
rescued; same-evening spend excluded from its own
cfLogs; failed fire spends nothing; ticks-only and
kcal-only never rescued; empty/no-rescue shortening
0; classify unit cases for all eight classes + null
handling + kcalLive fallback; census totals
recomputed from the corpora; per-seed equivalence
recorder == fresh master baselines on creek/still/
rescued + strand nights, both legs; 100% classified,
0 unclassified, 0 recorder errors, 0 pantry/pack
errs, 0 ledger mismatches, 0 kcal fallbacks on
strand evenings, every strand evening carrying a
warmth record; determinism 15215 ON byte-identical;
tracked-diff guard: src/ and scripts/policies/
empty vs pinned base f52f08600).

## Metric review

- The sequential-shortening vs independent-rescued
  split is the load-bearing distinction of this run,
  and the prereg's decision to report BOTH with the
  GO clause judging the shortening is what keeps the
  headline honest: shortening 7 answers "how many
  strand nights would shorten", rescued 2 answers
  "how many nights does protected wood rescue on
  their own terms". A future prereg that quoted only
  one of the two would mislead in opposite
  directions (7 alone hides the food binding; 2
  alone hides that the strand ends at night 10).
  Keep the pair, always.
- The "majority of strand legs" operationalization
  (warmth-live legs as the judged set) is flagged
  here as the run's one threshold-design note, as
  the prereg promised: under a literal both-legs
  reading (guard + ON, majority = both), the bar
  would be unsatisfiable by construction on any run
  with a warmth-off control leg, since guard
  shortening is 0 vacuously. That reading would
  make the threshold test the experimental design
  rather than the fuel, and it is not the reading
  judged here. If the coordinator intended the
  literal reading, the verdict under it is NO-GO
  (guard 0 < 3) — and, separately, under an
  independent-rescued reading of "shortens", the
  verdict would also be NO-GO (2 < 3). Both
  alternative verdicts are computable from the
  table above without re-running anything; the
  judged verdict follows the prereg as written.
- Holding kcal at observed values in the
  counterfactual is conservative in the right
  direction: a real protected-log world in which
  the fire burned other fuel would keep its fire
  kcal cost too (the fire still burns 48 ticks of
  work), so refunding kcal would only ever help
  the counterfactual — and it would not change
  night 10 (240 kcal already passes) or any
  both-evening's kcal failure (0 stays 0 unless the
  whole day is re-simulated, which this accounting
  explicitly does not do). No metric revision is
  proposed for the counterfactual's kcal handling.
- The 30-day window still contains the full strand
  cycle on this base (guard 7–9, ON 7–16, both <
  30); no horizon revision is proposed.
- The §15 panel non-applicability declaration held:
  with zero game-root changes, there was nothing
  to panel, and the guard/ON contrast is a
  within-instrument toggle, not a second root. A
  future arm that changes a policy default or src/
  must NOT reuse this declaration.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — food-economy/narration —
  WARMTH SPEND NEVER CONNECTED TO THE BRIDGE
  REFUSAL (this arm, re-confirmation of kcalshort's
  first-failure-line finding, now on the pivotal
  night): night 9's fire line narrates feeding the
  fire but never states a bridge log left the pack,
  and night 10's refusal judges the post-spend pack
  (3 logs) without mentioning night 9's spend. A
  player reading only the story cannot learn that
  warmth cost the bridge. Whether a line should
  connect them is a design call. (evidence: this
  file; judged ON corpus, 15215 nights 9–10.)
- [open, re-confirmed] 2026-10-30 — food-economy/drift —
  15009 STRAND LOSS STANDS, FOURTH BASE: 15009 has
  0 creek evenings on both legs on base f52f08600,
  exactly as on the wakeforage, pressb, and kcalshort
  bases. (evidence: this file's fresh baselines.)

## Verdict

DIAG-GO. Bar (a): warmth-fuel ledger complete for
100% of strand evenings on both legs (guard 3/3, ON
10/10), every evening classified with gap numbers
AND its warmth record, total logs and spend nights
stated per leg (ON: 4 logs, 4 nights; guard: 0, 0),
zero unclassified, zero missing warmth records.
Bar (b): counterfactual table complete per strand
evening (preservedBefore, cfLogs, rescued with gate
check), firstRescue and sequential shortening per
leg (ON: firstRescue night 10, shortening 7; guard:
none, 0), both-evenings explicitly NOT rescued even
where cfLogs reaches 4. Bar (c): GO threshold as
written — shortening 7 >= 3 on the warmth-live
strand leg AND spend nights 4 >= 3 — PASS, with the
independent rescued count (2) reported alongside and
the alternative readings addressed in metric review,
not substituted. Bar (d): determinism 15215 ON
byte-identical; proof suite 103/103 green.

## Files

- Prereg: evidence/2026-10-30/sim-warmfuel-b-prereg.md
  (commit 9d3866655)
- Evidence (this file): evidence/2026-10-30/sim-warmfuel-b.md
- Analyzer: scripts/analyze-warmfuel-b.js; proof:
  scripts/test-warmfuel-b.js (recorder driver reused
  verbatim: scripts/kcalshort-trace-b.js; baseline
  driver reused verbatim: scripts/woodday-trace-b.js)
- Fresh baselines: evidence/2026-10-30/
  sim-warmfuel-b-corpus-base-guard, -base-on;
  censuses: sim-warmfuel-b-census-base-{guard,on}.json
- Judged recorder corpora: evidence/2026-10-30/
  sim-warmfuel-b-corpus-guard, -corpus-on;
  censuses: sim-warmfuel-b-census-{guard,on}.json
- Determinism: evidence/2026-10-30/
  sim-warmfuel-b-corpus-determinism (15215 ON re-run,
  byte-identical to the judged ON 15215 file)
- Pilot (gate-only, dir removed before commit; gate
  numbers quoted in this file from the pilot run log)
