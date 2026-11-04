# Journey leg: DEEPENING (days 40–80) R93 — "REGIONAL AT ZERO STANDING — PARADOX OR TWO RULERS?" — 2026-11-04

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r93 plays deepening, writes 2->3
at closeout. Base: master f01f7f026 at worktree creation. Policy:
competent (pinned, r92 driver lineage + r93 standing-trace /
last-living-census instruments). Seeds: fresh 93601–93604
(fresh-band check: r92 used 93501–93504, r91 93401–93404). Horizon:
DAY CAP=100, death-aware stop. Smoke seed 93600 (outside the main band)
x DAYCAP=45 proves the r93 driver (standingTrace + lastLivingCensus
populated, no gameplay effect) before the main run; smoke outputs
deleted after the check.

Context: r92 (same leg, same day) left two metric-review items, and
this run answers both instead of re-measuring anything else. It does
NOT re-judge wave 4 (r90), the knowledge economy (r91), or beast-trick
teaching (r92). No game change is pre-committed: if the trace shows
an instrument artifact (e.g. standing read at a collapsed state, or
the wrong field), the instrument is fixed with a proof test; if it
shows a game state, it is documented as the finding and the levers
are left alone (gates untouched, as ordered).

Mechanism hypothesis, from code read before any seed ran
(docs/CANON.md + standing.js villageStanding() + hierarchy.js
scaleRank(), NOT from run data): scale and standing are two
different rulers. scaleRank() reads the networkLive /
nationalLive / globalLive flags — Regional Dawn fires when a bond
is 21+ days old. villageStanding() sums war (wave-3/4/5 ledger
points) + diplomacy (links that are BOTH seasoned — 30+ days old
and trust 40+ — AND participating in a regional-plus polity) +
plenty (quality feasts). A village can therefore be regional
with standing exactly 0: its bond is old enough for the Dawn
(21+ days) but not yet seasoned-and-polity (30+ days, trust 40+),
and it has banked no wave-3+ ledger kills and no quality feasts.
r92's 93503 snapshot (day 50, pop 6, regional, standing 0) is
predicted by this shape, not a paradox — provided its link was
younger than 30 days or below trust 40 at day 50, or outside a
regional-plus polity. The trace decides: if every regional-at-zero
day shows an unseasoned / non-polity link and zero war + zero
feasts, the hypothesis is CONFIRMED and the r92 item closes as
"two rulers, no bug"; if any regional-at-zero day shows a
seasoned regional-plus link (diplomacy should be > 0) or war /
feast points that the total omits, it is a real bug to fix.

## Leg question

In the deepening window under natural competent play: on every day
a village reads regional, what is its standing breakdown
(war/diplomacy/plenty, links, feasts), how old and how trusted is
its link, and does regional-at-zero-standing always coincide with
an unseasoned or non-polity link? Secondarily: what is the
plantsKnown distribution at each seed's LAST-LIVING census (not
just the final census, which is empty on lost villages)?

## Binding metrics (NO-GO never re-scored; revisions go to metric review)

- S-TRACE (primary): per seed, daily standingTrace entries
  (day, raw standing total + war/diplomacy/plenty + warPts/links/
  feasts, scale, pop, networkLive). Classified per seed:
  firstRegionalDay, standing + breakdown at firstRegionalDay,
  firstStandingPositiveDay, standing + breakdown at the
  last-living deed checkpoint, and every regional day's link
  state (age/trust/seasoned from deedLog linkSnap).
  Verdict classes: EXPLAINED (regional-at-zero days all show
  unseasoned or non-polity links + zero war + zero feasts) or
  UNEXPLAINED (any regional day with a seasoned regional-plus
  link, or war/feast points, yet total 0).
- P-DIST-LL (primary, r92 metric review item): per seed, the
  plantsKnown DISTRIBUTION (sorted list, median, min, max) from
  lastLivingCensus — the last daily snapshot with a living
  roster — not the final census. Lost villages must now have a
  distribution, not an empty record.
- K-CONTEXT (carried, not re-judged): lessons ok/total,
  knowCounts experiment / traderDeep / moot, regional propose
  outcomes, standing + active links at the last-living snapshot,
  scale.
- M4 people — >=10 transcripts sense-read (days 45/60/80),
  0 senseless, under ROTATED choices (r92 rotation kept). Count
  judged over sittings the panel actually produced (r92 metric
  review: an early-death seed yields no sittings and is not a
  conversation failure); if fewer than 10 sittings exist, the
  shortfall is reported as panel composition, and an extra
  sitting on a surviving seed is added only if pre-registered
  here — it is: one extra day-80 sitting on the first surviving
  seed if the panel yields <10 sittings.
- M5 winnable (descriptive, not a gate) — villages with endReason
  survived.
- STAY-GREEN: death-honesty mislabels == 0.

## Instrument notes (disclosed)

- The daily trace reads villageStanding() (the raw breakdown),
  NOT villageStandingTotal() (the gated number with
  readiness-deferral holds and the peak ratchet). The gated total
  can only sit BELOW the raw total when raw >= 100 (t4) or >= 200
  (t5); a gated 0 therefore implies a raw 0, so the raw trace
  explains a zero either way. Where the two could differ (raw
  >= 100), both are reported: deedLog carries the gated total at
  checkpoints, the trace carries the raw breakdown daily.
- The trace is a harness-only read (zero gameplay effect); it
  never calls villageStandingTotal(), so it cannot itself trip
  a release beat or move the peak ratchet.
- Transcript choice rotation is unchanged from r92.
