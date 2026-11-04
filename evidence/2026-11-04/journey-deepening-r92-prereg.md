# Journey leg: DEEPENING (days 40–80) R92 — "WHY IS BEAST-TRICK TEACHING THIN?" — 2026-11-04

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r92 plays deepening, writes 2->3
at closeout. Base: master a5ade6579 at worktree creation. Policy:
competent (pinned, r91 driver lineage). Seeds: fresh 93501–93504
(fresh-band check: r91 used 93401–93404, r90 93301–93304). Horizon:
DAY CAP=100, death-aware stop. Smoke seed 93500 (outside the main band)
x DAYCAP=45 proves the r92 driver (incl. the beast-ask decomposition
instrument) before the main run; smoke outputs deleted after the check.

Context: r91 (2026-11-03, same leg) answered its question — the
knowledge economy moves (128/141 ok lessons, links 3/3 late seeds,
standing 125–199) — but left one sharp edge as a candidate question,
not a verdict: beast-trick teaching is thin, asked 34 times but
taught only 4. This run decomposes that thinness instead of
re-measuring it. It does NOT re-judge wave 4 (r90, same-day panel)
or re-judge the knowledge economy (r91). No game change is
pre-committed: if the decomposition shows a bug (e.g. asks firing
where no trick can ever be taught, or a teachable trick refused),
it is fixed with a proof test; if it shows a design shape (e.g.
most slain types simply have no counter defined), it is documented
as a design call for Steve / the winnability arms, with per-type
numbers, and the levers are left alone (gates untouched, as ordered).

Mechanism hypothesis, from code read before any seed ran
(docs/CANON.md + game.js askAbout/counterTeachable, NOT from run
data): the driver asks whenever some slain type is unknown
(slain >= 1 && !known), but counterTeachable() — the real gate —
additionally requires that type to carry a `counter` definition
(and, via the non-lethal channel, counts observed >= 2). An ask
therefore teaches if and only if counterTeachable() is non-null
at ask time. Asked-not-taught asks should decompose into:
(A) no slain-unknown type has a counter definition (the kill can
never yield a trick — a content gap, not a teaching failure);
(B) a teachable trick exists but the ask still returns none
(a real bug — expected zero);
(C) repeated futile asks on an unchanged unteachable state
(the every-5-days driver re-asking the same dead end, inflating
the asked count — a harness artifact to report, not a game bug).
The instrument records, per ask, the trigger type, the full
slain-unknown list, which of them lack counters, counterTeachable()
before the ask, and the ask result (taught id / none).

## Leg question

In the deepening window under natural competent play: of every
beast-trick ask, how many teach, how many hit each no-teach class
(A/B/C above), which monster types are slain-but-counterless, and
does a taught trick then show up as used knowledge (villageKnowsTrick
/ monsterCounters) in later fights against that type?

## Binding metrics (NO-GO never re-scored; revisions go to metric review)

- B-ASK (primary): per-seed beastAsks entries classified taught /
  none-no-counter / none-other; panel totals per class; distinct
  slain-but-counterless types with slain counts; repeat-ask runs
  (same unteachable state asked again on a later 5-day tick).
- B-USE (diagnostic): for each taught trick, whether the village
  record (monsterCounters / villagerTricks) still holds it at the
  seed's last-living snapshot, and whether any later wild fight
  against that type is recorded (fought at all — lethality
  comparison is NOT claimed on this sample size).
- K-CONTEXT (carried, not re-judged): lessons ok/total, knowCounts
  experiment / traderDeep / moot, regional propose outcomes,
  standing + active links at the last-living snapshot, scale.
- P-DIST (r91 metric review item): per-villager plantsKnown
  DISTRIBUTION on alive villagers at final census (sorted list,
  median, min, max) — not just the mean.
- M4 people — >=10 transcripts sense-read (days 45/60/80),
  0 senseless, under ROTATED choices (r91 rotation kept). Count
  judged over sittings the panel actually produced (r91 metric
  review: an early-death seed yields no sittings and is not a
  conversation failure); if fewer than 10 sittings exist, the
  shortfall is reported as panel composition, and an extra
  sitting on a surviving seed is added only if pre-registered
  here — it is: one extra day-80 sitting on the first surviving
  seed if the panel yields <10 sittings.
- M5 winnable (descriptive, not a gate) — villages with endReason
  survived.
- STAY-GREEN: death-honesty mislabels == 0.

## What would count as interesting

- Class B (teachable-but-refused) > 0 on any seed: a live bug,
  fixed in this run with a proof test.
- A single counterless type dominating the no-teach asks (e.g.
  one wave-2/3 type slain often, never teachable): a named
  content gap with a concrete fill (a counter definition) as a
  proposal, not a silent edit.
- Taught tricks vanishing from the village record by the
  last-living snapshot (knowledge taught but not kept).
- A transcript where a villager teaches a trick unprompted in
  conversation (the NPC-side channel), or where an ask returns
  the honest "told you every trick" line after all tricks are
  known (the honest-none path working as designed).

## Instruments (r92 additions, harness-only, zero gameplay effect)

- knowledgePlay records beastAsks[] per ask: day, trigger type,
  slainUnknown list, noCounter list, teachableBefore, taught id
  or none, plus a pure classifyBeastAsk() helper (exported,
  proof-tested) tagging taught / none-no-counter / none-other.
- Analyzer r92: B-ASK class totals + counterless-type table +
  repeat-ask detection + P-DIST distribution, on top of the r91
  K-context / W3-base / M5 / STAY-GREEN summaries. No new driver
  output fields beyond beastAsks[] in ctxSummary.
