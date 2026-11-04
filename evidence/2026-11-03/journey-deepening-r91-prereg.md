# Journey leg: DEEPENING (days 40–80) R91 — "DOES THE KNOWLEDGE ECONOMY MOVE?" — 2026-11-03

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r91 plays deepening, writes 2->3
at closeout. Base: master dbfeb63eb at worktree creation. Policy:
competent (pinned, r90 driver lineage). Seeds: fresh 93401–93404
(fresh-band check: r90 used 93301–93304, r89 93201–93204). Horizon:
DAY CAP=100, death-aware stop. Smoke seed 93400 (outside the main band)
x DAYCAP=45 proves the r91 driver (incl. the transcript choice-rotation
fix) before the main run; smoke outputs deleted after the check.

Context: r90 (earlier today, same leg) already measured wild wave-4
fights exhaustively (1 kill / 26 fights, readiness-met seeds at 0/5) —
re-running that panel the same day would be re-proving a proven
constraint, against Steve's 2026-11-01 deliver-over-measure direction.
This run therefore does NOT re-judge wave 4. It asks the deepening
window's other open question: under natural competent play, does the
knowledge economy actually move — do villagers teach and learn, do
experiment / trader-deepening / moot beats fire, do regional links form
and stay active, does standing climb — while wave-3 fights serve only
as a combat comparison base.

Two r90 blanks ride along as tooling fixes, not game changes:
(1) transcript capture rotated its choices (r90's "Tell me more" x9
filler-loop shape): the r91 driver blocks dlg:more / dlg:details after
2 consecutive such picks in one sitting, so a sitting cannot be
more-spam by construction; the strict "0 senseless" bar is KEPT.
(2) telemetry baseline shape: deepening.json carried no seed count, so
r90's 4-seed sums printed false LOUD lines. Before this run's
telemetry check, the baseline is reseeded from r90's own 4-seed panel
sums with an explicit _meta {n: 4, panel: "r90 93301-93304"} label
(old file kept as deepening.json.20261103-pre-n.bak); r91's check is
then a true 4-seed-sum vs 4-seed-sum comparison. The reseed uses only
already-investigated r90 evidence (r90 verdict: EXPLAINED shape error,
not a bug) — no new measurement is baked in silently.

## Leg question

In the deepening window under natural competent play: do villagers
teach/learn genuinely (lessons with ok=true, beast-trick teaching),
do knowledge beats fire (experiment, trader-deepening, moot lines),
do regional links form and stay active, and does standing climb
toward the wave-4 gate (standing >= 100) — and what does the village
look like at day 80 / at its last pre-collapse snapshot?

## Binding metrics (NO-GO never re-scored; revisions go to metric review)

- K-LESSON (diagnostic): ship.lessons count + ok rate per seed;
  beasttricksAsked / beasttricksTaught from ctxSummary. A lesson counts
  only if ok=true; failed lessons are reported separately, never folded
  into the count.
- K-MARKERS (diagnostic): knowCounts experiment / traderDeep / moot
  per seed (captured-text counts, r7 method).
- K-LINKS (diagnostic): regionalLog propose outcomes (linked /
  counter / declined) per seed; active hierarchy links + standingTotal
  at the LAST deedLog snapshot with a living roster (pre-collapse
  rule from r90 metric review — final snapshots on lost villages are
  post-collapse zeros and prove nothing); scale rank at end.
- K-CODEX (diagnostic): deedLog codexL2 / sharedKnowN / traderDeepN
  at the same last-living snapshot; plantsKnown mean from final
  census (alive villagers only).
- W3-BASE (comparison only): wild wave-3 fight outcome classes +
  median fought damage fraction (clamped [0,1], r90 method).
- M4 people — >=10 transcripts sense-read (days 45/60/80),
  0 senseless, under ROTATED choices. Bar: the NPC wants something,
  options engage or deflect it, endings resolve/plant/owe; no
  fabricated shared history, no filler loops.
- M5 winnable (descriptive, not a gate) — villages with endReason
  survived.
- STAY-GREEN: death-honesty mislabels == 0.

## What would count as interesting

- A seed with zero ok lessons across 100 days (teaching never fires
  in the window).
- A traderDeep line firing in captured text (deep knowledge moving
  villager to villager, not just the scholar).
- A regional link formed inside the window that is still active at
  the last-living snapshot (links as durable structure, not churn).
- Standing crossing 100 inside the window on a surviving seed (the
  wave-4 gate reached from deepening play alone).
- A transcript where the rotated picker reaches a want resolution
  (promised / stated) that the more-spam capture missed.

## Instruments (r91 additions, harness-only, zero gameplay effect)

- pickChoice rotation: module-level more-streak per sitting, reset at
  each runConversation start; after 2 consecutive dlg:more /
  dlg:details picks, those ids are excluded from the ENGAGE pass for
  the rest of the sitting (react / engage2 / deflect tiers still
  available). Proof-tested on fixtures before the main run.
- Analyzer r91: summarizes K-LESSON / K-MARKERS / K-LINKS / K-CODEX
  from the existing per-seed JSON fields (no new driver output
  fields), plus W3-BASE, M5, STAY-GREEN, transcript repeat scan.
