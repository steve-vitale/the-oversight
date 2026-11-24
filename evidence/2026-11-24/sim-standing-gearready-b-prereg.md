# Standing accumulation on gear-ready seeds — Loop B, run fleshout-loop-b-20261124T0530Z, arm sim-standing-gearready-b

Axis: winnability chain (re-point 2026-11-03). DIAG-ONLY arm: zero
src/js changes. This arm re-measures, on CURRENT master, the 99107
pattern from evidence/2026-11-14/sim-standing99107-b.md ("Next
blanks" #4, the 2130Z blank #4, still open from the re-point
queue): on seeds where the village is gear-ready (all four bars
met for days), standing sits short of release. It decomposes
standing income per day by source AND decomposes the step to
national rank, so the next arm knows WHAT is missing before any
gate/price discussion. Gates and prices stay UNTOUCHED unless
Steve orders otherwise; this arm measures only.

## The question, pinned down from the 99107 corpus + the findings

The 99107 corpus IS located (no re-derivation needed):
evidence/2026-11-14/sim-standing99107-b.md, prereg
evidence/2026-11-14/sim-standing99107-b-prereg.md, per-seed JSONs
in evidence/2026-11-14/perseed-standing99107-b/ (8 files, anchor
`c0bbaa071`). Its verdict: the 11-03 pattern (ready days with
standing short) did NOT reproduce — standing was war-only and
ample (capped >= 200 on 6/8 seeds, best 500), readiness-ready
days occurred on exactly one seed (99102, 7 days), the door
opened the same day, and the wall past standing was veterans
(317 standing-ok-but-not-ready village-days, short bar veterans
throughout). Diplomacy was 0 on all 8 seeds (at most one link,
never a realm); plenty was feast-starved (~1 feast per 60+
village-days); wave 5 unlocked 1/8, faced 0/8; national 0/8.

Since then the 199 stall has RECURRED on later bands, and the
question has inverted a second time (findings #2617, #2687):
- sim-laterage-b (2026-11-19, evidence/2026-11-19/sim-laterage-b.md):
  5/8 seeds sit at exactly standing 199 (106113, 106114, 106115,
  106117, 106118); wave 4 reached 7/8, wave 5 reached 2/8, wins
  0/8, national 0/8. Mechanism per #837 (defer5 gate).
- sim-launchfield-refreeze-b (2026-11-22,
  evidence/2026-11-22/sim-launchfield-refreeze-b.md): 4/8 villages
  end at exactly 199 (107387, 107388, 107389, 107390); seed
  107385 reached standing 600 and STAYED regional; national by
  scaleRank 0/8 while national by standing >= 200 is 2/8 — "the
  rank definition, not the points, is the wall." The System says
  it aloud on 107385 day 55: "FINALES need a NATION. You've got
  a region; now make it a REALM." — while the village sits at
  regional rank with standing 600.

So the pinned question has TWO halves, and this arm measures
both on one fresh band on current master:
(a) THE 199 STALL: does it recur, and what holds it — the
readiness deferral (defer5: capped >= 200, readiness-5 not
ready, gated total held at 199) or the plenty cap (raw >= 200,
capped < 200, held at 199)? Which readiness bar is short on
the held days?
(b) THE RANK STEP: when standing is >= 200, what blocks the
step to NATIONAL rank — the polity never forms (too few links /
links never season / no realm), a national beat stages but is
never answered (pendingNational), the one-rung-per-season gate
(networkLiveDay + 30), a refused scale, or a realm that
dissolves? The 99107 instrument recorded scaleRank and links
but never classified the national blocker per day; this arm
adds that classification.

## Door / release rule, as found in code (re-verified at this anchor)

From `src/js/standing.js` (UNCHANGED since the 99107 anchor —
`git log --since 2026-11-14 -- src/js/standing.js` is EMPTY at
prereg time; the rule below is the same code, re-read, not
assumed): standing = war (25 per wave-3+ ledger kill point) +
diplomacy (34 per seasoned REGIONAL+ link) + plenty (20 per
major feast, quality >= 1); t4 = 100, t5 = 200; plenty counts
at most 100 toward the t5 bar (capped total). Release to wave 5
requires capped >= 200 AND readiness-5 ready (armored 4 @ P>=15,
armed 6, tricks 3, veterans 2 living); while capped >= 200 but
not ready the gated total holds at t5-1 = 199 (`villageStandingTotal`,
holds `{bound: t5-1, kind: 'defer5'}`); raw >= 200 with capped <
200 holds at 199 as well (`kind: 'cap'`). `unlockedWave() == 5`
additionally requires the wave-3 rung (day >= 25 AND wave-2
ledger >= bar) AND wave-4 faced. The five ladder tracks feed
the LADDER (`src/js/ladder.js`), NOT standing; tribute feeds no
standing reader in src/js. Both zeros are VERIFIED empirically
below, not assumed.

National rank (docs/SCALE.md + `src/js/hierarchy.js`): `scaleRank()`
reads the `nationalLive` flag. National is a LIVE state, not a
title: a polity (LEAD: Haven primary of >= 3 seasoned
subordinates; BELONG: subordinate in good standing to a primary
whose realm holds >= 4; COVENANT/TRADE: >= 3 seasoned peer
links) stages a played beat (`state.pendingNational`), and the
beat's answer sets `nationalLive`. One rung per season:
national cannot stage until Haven has been regional a full
season (`networkLiveDay + 30`). Seasoned = 30+ days old AND
trust 40+. If the realm dissolves with no qualifying polity and
no pending beat, `nationalLive` clears aloud. Refusing the
scale (`state.scaleRefused`) closes the road permanently.

## Calibration gate — the pattern may have MOVED (again)

The 99107 arm already proved the anchor moves under old
numbers (99107: 80 days at 1819 → 38 days at the ready5 anchor
→ 82 days at the 99107 anchor). The refreeze band (Nov 22) is
the newest sighting, on yet another anchor. RE-BASELINE
(binding on this arm): the 99107 numbers and the refreeze
numbers are PREVIOUS anchors and must NOT be pooled with this
arm's numbers and must NOT be cited as this arm's baseline.
This arm's baseline is its own judged leg on the current
anchor (HEAD `e5dd61e96` at prereg time). Any comparison to
11-14 or 11-22 in the evidence file is descriptive,
anchor-move-aware, never a before/after claim.

## Seed-band freshness (§3 — verified before choosing the band)

Candidate band 109301–109308 (pilot, 8 seeds).
- Token check: grep for `10930[0-9]` / `10931[0-9]` across
  ALL of evidence/ (`*.md`) returns ZERO hits — no prereg,
  evidence file, or corpus names any seed in 109301–109308.
- Claims/tracker check: grep for `10930` in
  hidden_files/lever-claims/ (live + .DEAD) and
  hidden_files/convergence-tracker.md returns ZERO hits.
- Contaminated-band list (journey-landing-r117, the standing
  record; recent preregs confirm no separate list file exists
  under evidence/): 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042,
  1043–1052, 1053–1062, 1063–1072, 1073–1082, 1083–1092.
  109301–109308 is in none of them.
- Nearest used bands: 109201–109208 (gatehorizon pilot),
  109209–109216 (gatehorizon, RESERVED unspent — not used),
  107617–107632 (muster), 107533–107548 (cellgate/rearm),
  107447–107454 (launchfield-horizon-b), 106111–106118
  (laterage), 99101–99108 (standing99107). No overlap, no
  adjacency.
- Confirm band (conditional, see below): 109309–109324.
  Freshness to be RE-VERIFIED at confirm time before any
  confirm sim runs; it is named here only so the pilot cannot
  silently expand into it.

## Pre-registration (binding, §11/§14)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM
  (the CURRENT file at this anchor), default env. No env
  overrides.
- Seeds (pilot): 109301–109308. Horizon: 150 days,
  death-aware (dead villages stop simulating; never a fixed
  200d). 150d covers the 99107 ready window with headroom and
  matches the reachability question (waves 4–5, national,
  table, wins).
- Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
  before/after change; no comparison is fabricated.
- Primary metric: per-seed standing decomposition completeness
  + national-blocker classification completeness (see DIAG-GO
  bar), NOT a reach count.
- Primary questions:
  (a) Does the 199 stall recur on current master, and what
      holds it — defer5 (which readiness bar short) or the
      plenty cap? Days at gated 199, split by hold kind.
  (b) What standing income is missing on stalled seeds —
      decompose standing points per day by source: war per
      wave (3/4/5) and per monster type (cap-aware), diplomacy
      per link (seasoned? regional+? kind?), plenty per feast
      (day, quality), plus the capped-vs-raw gap and the
      plenty-cap bite.
  (c) When standing is >= 200, what blocks national rank —
      per-day national-blocker classification: links active /
      seasoned / regional+, Haven polity size + shape, pending
      national beat (shape, day, answered?), networkLiveDay +
      30 gate, scaleRefused, nationalLive ever / lost.
  (d) Do readiness-ready days occur, and when they do, does
      the door open the same day — i.e. on ready days, is
      capped < 200 (standing gates), capped >= 200 with peak
      < 5 for another reason (classify it), or does the peak
      release?
  (e) Wave-5 unlock vs faced: unlock is not facing (wave-5
      engaged/kills, not the unlock number).
- Confirm rule (pre-registered): the 8-seed pilot IS the
  judged leg for the DIAG-GO bar. A 12–16-seed confirm band
  (109309–109324, freshness re-verified first) runs ONLY if
  the pilot leaves the stall classification open — i.e. any
  seed's 199-hold kind is unclassified, or 0/8 seeds stall
  (recurrence rate unmeasured), or any seed's national
  blocker is UNCLASSIFIED. If the pilot classifies every
  stall and every national block, no confirm spend.

## DIAG-GO bar (pre-registered; no threshold on reach counts)

GO requires ALL of:
1. All 8 seeds measured with a complete per-day standing
   decomposition from first day to village death or horizon:
   war points per wave + per-type ledger, diplomacy per-link
   (seasoned / regional+ / kind / tribute marker), plenty
   per-feast (day, quality, bundle flag), raw, capped,
   plenty-cap bite, gated total + hold kind (defer5 / cap /
   none, derived WITHOUT calling the side-effecting
   `villageStandingTotal()`), peak, deferral5, readiness-5
   and -4 bars, w4faced, w5faced, w3 rung, scale rank, ladder
   track totals, PLUS the national fields: pendingNational
   (shape/day), nationalLive, networkLive, networkLiveDay,
   scaleRefused, Haven polity (size/shape/led), foreign
   polity count.
2. Standing reconciliation: EVERY war-point delta reconciles
   to a kill event in `state.waveKillLog` / the ledger
   (per-type cap respected — a third kill of one type pays 0);
   EVERY diplomacy delta reconciles to a link seasoning or
   regional+ transition (named link, named day); EVERY plenty
   delta reconciles to a feast-log entry (named day, quality);
   0 unclassified standing deltas on any seed.
3. 0 unclassified release/door events: every peak transition
   to 5 and every release say-line is classified (natural
   release, end-call-release, or explained artifact); 0
   release lines without a matching peak state, 0 peak
   transitions without a line or a stated engine path.
4. Instrument health: 0 instrument errors, 0 orphan events
   (0 unlinked wave-3+ kill rows, 0 veteran-recount mismatches
   between the gate count and the instrument's independent
   waveKillLog recount, 0 feast rows the instrument cannot
   classify).
5. Track/tribute verification: ladder track totals and tribute
   markers recorded on all 8 seeds; the standing-attribution
   table names any track or tribute contribution found, or
   records 0 with the evidence (per-seed totals) for it.
6. National-blocker classification: every seed gets a named
   national block — `reached-national`, `never-regional`,
   `no-polity` (with the limiting count: links / seasoned /
   realm), `polity-unanswered` (pendingNational shape + day),
   `polity-dissolved` (nationalLive was set, then cleared),
   `scale-refused`, or `season-gate` (regional < 30 days old)
   — with the supporting per-day evidence; 0 seeds
   UNCLASSIFIED.

A miss on any leg is DIAG-NO-GO and is reported as such; no
metric is re-scored mid-run (§14). No threshold is set on how
many villages stall at 199 or reach national — this is a
diagnostic.

## Instrument deltas vs the 99107 instrument (carried from its metric review)

- Standing-line capture cap raised 400 → 2000 AND a separate
  UNCAPPED release-line stream (`releaseLines`, wave-5 release
  regex only) so the door line is never lost to saturation on
  long runs (99107 lost it on 99102 at the 400 cap).
- Pooled median is the STANDARD median (sorted middle / mean
  of two middles), not the analyzer's old upper-middle value
  (99107 evidence reported 120.5 by hand; the analyzer said
  125).
- New per-snapshot national fields (see leg 1) and a
  `gatedTotal` / `holdKind` derivation (pure, from capped +
  readiness + peak + raw — never a `villageStandingTotal()`
  call inside the snapshot).
- Everything else is the 99107 instrument verbatim: the
  snapshot never calls `villageStandingTotal()` or
  `unlockedWave()`; door-open events are observed as the
  engine announces them, never manufactured; ONE end-of-run
  `unlockedWave()` call after the run, reported separately.

## Sense-testing law

Transcripts are read: standing/hold/release say-lines, the
national-beat lines (court/oath/council/charter), and a sample
of kill-beat / feast lines per seed are judged for meaning,
coherence, repetition, and robotic behavior — never just
counts. The sense sample lives in the per-seed JSONs
(`standingLines`, `releaseLines`, `saySample`) and is quoted
in the evidence file.

## Deliverables

- `scripts/standing-gearready-b-instrument-20261124.js`,
  `scripts/standing-gearready-b-driver-20261124.js`,
  `scripts/standing-gearready-b-analyze-20261124.js`,
  `scripts/test-standing-gearready-b-20261124.js` (proof:
  decomposition math, per-type cap, link seasoning /
  regional+ classification, feast classification, release
  classification incl. the uncapped release stream, gated /
  hold-kind derivation, national-blocker classification,
  standard median, live-harness smoke) — green BEFORE the
  judged leg.
- Per-seed JSONs under
  `evidence/2026-11-24/perseed-standing-gearready-b/`.
- Evidence `evidence/2026-11-24/sim-standing-gearready-b.md`
  with a "metric review" section (§14; no in-run re-scoring)
  and the wall numbers (national / table / wins, wave 4–5
  unlocks, median survival).
- Zero src/js changes. No push, no bump, no live verification
  (coordinator merges --ff-only; ship loop owns deploys).
