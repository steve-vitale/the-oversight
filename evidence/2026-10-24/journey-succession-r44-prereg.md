# Journey succession r44 — CLOSE THE INSTRUMENT GAPS (lane B, pre-registration 2026-10-24)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
r43 answered its question (the r42 flatline was a dial artifact: the village
warms, the office entry does not track it) and left three documented
instrument gaps, not game findings. This run closes them, on the same regime
as r43 so the comparison is apples-to-apples. No game change is proposed or
expected; this is an instrument run. If a gap closes, the NEXT run's bars
change; this run's bars below bind regardless.

## The three gaps (from r43's run note)

1. M3 echo filter misses real mentions. Tele-style week-2 dead-bearer
   mentions were 4–5 per seed while the echo filter's villager-talk-format
   count was 0. The mentions exist in say-log formats the regex does not
   match. The filter, not the village, is the suspect.
2. Chain deaths' causes are not captured. r43 tracked only the first death
   in detail; 24002's Minh and 24004's Ivan died in the window and their
   causes are unknown, not guessed.
3. Office-entry writers between handoffs are unattributed. The code's
   known writers are public events (phoenix aftermath/broadcast, phoenix
   gift +10), but no say dump was kept, so no movement day was tied to an
   event.

## Leg question

Do the three r43 instrument gaps close with (a) a widened echo filter,
(b) all-deaths tracking, and (c) a daily office series correlated with
public-event say lines — without inventing causes or attributions the
evidence does not support?

## What the instrument now does (r43 driver + three additions)

- ECHO V2: same week-2 window and same funeral-arc exclusion as r43's
  filter, but WITHOUT the villager-talk format restriction: every say-log
  line naming the dead bearer's first name counts, plus the convo-line
  matches r43 already counted. Reported side-by-side with r43's old
  filter on the SAME logs, so the comparison cannot be gamed by a new
  seed band. A first-name collision check (another living villager
  sharing the dead bearer's first name) is reported with the count;
  a collision makes a v2 hit ambiguous, not false.
- ALL DEATHS: every mantle pass in the post-death window is recorded
  (dead bearer, new bearer, detected day) and, at detection, matched
  against the village fallen list and the lineage list for a cause.
  A chain death with no fallen/lineage cause is reported as UNKNOWN
  with the reason, never guessed from the say log.
- OFFICE DAILY: the office entry is snapshotted every post-death day
  (not just at checkpoints). At the end, every day the entry moved is
  listed with that day's public-event say lines (phoenix / broadcast /
  gift / System marks), or with "no public-event line that day" when
  there is none. Correlation is reported as correlation, not cause.

## What counts as an interesting finding

- V2 recovers the tele-style mentions (v2 >= old on a seed) AND the
  sampled v2 hits read as genuine mentions of the dead bearer: the
  filter was the problem, and the next run may use v2 as its M3 bar.
- V2 recovers counts but its hits are mostly System/funeral-adjacent
  lines the funeral-arc exclusion should have caught: the exclusion,
  not the format, needs the fix.
- A chain death lands with a cause from fallen/lineage: the gap is
  closed mechanically. A chain death lands UNKNOWN: the gap is real
  and named (which list missed it, and why).
- An office movement day lines up with a public-event line: a named
  writer candidate. Movement days with no public-event line: the
  writers list is incomplete, and that incompleteness is the finding.
- Any stay-green regression (funeral arc, machinery, meal gate):
  REAL BUG, fail loudly — same as every succession run.

## Seeds / policy / horizon

Seeds 25001–25004 (fresh band: no prior succession script or succession
evidence file uses 250xx). Policy: competent (same as r41–r43).
Horizon: phase A competent, then 30d competent play as the successor.
Death-aware stop (+10d tail).
- 25001, 25002: EARLY_KILL_DAY=10 — the low-trust regime, same as r43.
- 25003, 25004: standard 40d phase A — contrast regime.
Kill via the REAL playerDeath ('a hushwolf') unless the mantle passes
organically in phase A (honored per the standing rule).
Convo checkpoints: d+3, +7, +14, +30 (2 top-trust villagers each).

## Bindings (§14 — a miss is NO-GO, never re-scored mid-run)

- E1 (echo v2 readable + comparable): old-filter and v2 counts both
  reported on 4/4 seeds. V2 GO bar (two parts, both required): (a)
  RECONCILIATION — v2Say + arcExcluded == tele week-2 name-match
  count on 4/4 seeds, proving v2 loses nothing except the
  funeral-arc lines it means to exclude; (b) GENUINENESS — the DELTA
  hits (v2 say lines the old format filter missed) are >=80%
  genuine mentions of the dead bearer on sense-read (delta samples
  saved in the run note). Note, stated now so it cannot be fudged
  later: v2 >= old holds by construction (v2 drops a restriction),
  so it is NOT itself evidence — the reconciliation and the delta
  genuineness are the evidence.
- E2 (all deaths tracked): every chain mantle in the window has a
  cause entry (fallen/lineage) or an explicit UNKNOWN on 4/4 seeds.
  A chain mantle with NO record at all = INSTRUMENT-MISSING.
- E3 (office daily complete): a daily office value on every post-death
  day on 4/4 seeds, and every movement day listed with its candidate
  lines or "none". A gap day = INSTRUMENT-MISSING.
- S5 stay-green (r41–r43 regressions): M1 funeral arc >=3/4, M4
  machinery 4/4 (linOk + moOk), MG2 meal gate 0 voice violations on
  4/4 seeds. Meal audit is voice-only (r42 metric review).
- S6 people: 0 identity failures across sense-read transcripts
  (grief-excluded wire, raw and filtered both reported).
- Classification rule (fixed now): climb = delta >= +3, flat within
  ±2, fall <= −3, mantle panel vs last panel — same as r43.
- The r43 dial names stand: "office entry" = public standing,
  "village mean" = live social warmth. Do not re-merge them.
