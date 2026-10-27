# sim-arroworigin-a — where does the village's single arrow come from?

Run: fleshout-20261027T0105Z. Arm: sim-arroworigin-a. Axis: scale-onramp.
Substrate: scripts/policies/tableseat-nowait.js, seeds 73671–73678, 180-day
death-aware horizon. Measurement only: no game code changed, no defaults
flipped, no lever proposed. Verdict: **DIAG-GO**.

## The question

Arm sim-ammostorage-a (run fleshout-20261026T2317Z,
evidence/2026-10-26/sim-ammostorage-a.md) found a micro-blank: on seeds
73672 (arrow present from day 40) and 73676 (from day 1), the entire village
arrow economy is exactly one arrow in one person's personal stash — never
carried, never spent, never joined by a second arrow. The other 6 seeds never
hold an arrow on any daily snapshot. How does that single arrow arrive:
starting stash, early craft, loot, or trade? This arm answers with a trace,
not a guess.

## Pre-registration (binding)

Written before any sweeping at
evidence/2026-10-27/sim-arroworigin-a-prereg.md. The bar, as written:
a named source (starting stash / craft event with crafter + day / loot
event / trade event) on BOTH arrow seeds 73672 and 73676, plus zero-arrow
confirmation across the other 6 seeds, plus recorder neutrality
(days/gameDays/ts/starvation identical recorder on/off, at least a det-gate
seed). A miss would have been DIAG-NO-GO, never re-scored mid-run. One
prereg gap found during the run is documented openly under Metric review
below; it does not change the bar's outcome, because both sources are named
with record citations either way.

## The answer, in one paragraph

Both arrows arrive the same way: **starting stash**. Every person is dealt
an opening set of 8 belongings when their person-record is first made —
two tools, one weapon, two pieces of clothing, two sentimental keepsakes,
and one wild-card item. An arrow can only enter through that wild-card
slot (it is not a tool, weapon, clothing, or keepsake). The person then
keeps 5 and stashes 3; sentimental keepsakes and weapons and armor outrank
an arrow, which scores only a small random nudge, so the arrow lands in
the stash. On 73676 the holder is a founder, so the arrow is there from
day 1. On 73672 the holder is a late joiner whose person-record is first
made on day 40, so the arrow appears that day. No craft, loot, or trade is
involved on either seed. The full mechanism, with record citations, is
below.

## Before / after numbers (identical seeds)

Baseline (plain tableseat-nowait) vs armed (tableseat-nowait + the
arroworigin recorder) are identical on every band field, and both match
the 1920Z band table exactly — no base delta to report:

| field | baseline | armed | 1920Z |
|---|---|---|---|
| wins | 2/8 | 2/8 | 2/8 |
| national-ever | 6/8 | 6/8 | 6/8 |
| national-final | 5/8 | 5/8 | 5/8 |
| table reached | 4/8 | 4/8 | 4/8 |
| entered | 2/8 | 2/8 | 2/8 |
| wave 4 | 6/8 | 6/8 | 6/8 |
| wave 5 | 0/8 | 0/8 | 0/8 |
| median survival | 152d | 152d | 152d |
| deaths | 307 | 307 | 307 |
| starvation deaths | 1 | 1 | 1 |

Per-seed baseline (= armed on days/gameDays/ts/starvation, all 8 seeds):
73671 180d/48 deaths, 73672 180d/51, 73673 124d/32, 73674 142d/won/28,
73675 180d/26, 73676 144d/won/43, 73677 152d/41, 73678 104d/38/starved 1.
Recorder neutrality: G2 PASS 8/8 (days, gameDays, ts, starvation, faced,
kill-log tuples all identical). Det-gate seed 73671: recorder-off run
matches the recorder-on run exactly (180d/181 gameDays/tsNationalDay 107),
no recorder surface, no installed wraps. Cost bar met: armed starvation
(1) equals baseline starvation (1); armed median (152d) equals baseline
median (152d).

Wall numbers: the table is reached on 4/8 seeds and entered (seat taken)
on 2/8 (73674 day 142, 73676 day 144, both lesser seats on the feared
path). Wave 4 is reached on 6/8; wave 5 on 0/8 — the wave-5 wall stands
in this substrate. That wall is a separate arm's blank, not this one's.

## The trace

### Seed 73676 — Jesse Cortez, founder, day 1

- First arrow day 1, stashed 1, carried 0, and the record never changes:
  day 1 and day 144 are byte-identical (same carried items, same stash,
  same opening pool). Zero change events across the whole run.
- Holder record (day 1, from corpus s73676-armed.json, holderDetail):
  carried [notebook, mixtape, alien_carapace, kitchen_knife, chefs_knife],
  stashed [arrow, titan_belt, camp_pot], opening pool [chefs_knife,
  camp_pot, kitchen_knife, alien_carapace, titan_belt, mixtape, notebook,
  arrow] — the arrow is the 8th and last member, the wild-card slot.
- A day-1 deep dive confirms Jesse is a live villager from day 1 (in the
  village list, in the roster, full belongings from the first snapshot).
  This is the founder case: the arrow is dealt with his opening set at
  game start and stashed by the keep-5 choice.
- Source: **starting stash (founder)**.

### Seed 73672 — Petra Novak, late joiner, day 40

- First arrow day 40, stashed 1, carried 0, and it never moves: 141 arrow
  days (day 40–180), same holder, same stash, same opening pool at day 180
  as at day 40. Exactly one change event in the whole run, on day 40.
- The day-40 change event is the signature of a person-record being made,
  not of an item being gained: previous carried/stashed lists are EMPTY,
  and the new record arrives whole — carried [paperback, tote_bag,
  hunting_spear, denim_jacket, work_gloves], stashed [arrow, gilded_pack,
  the_ledger]. An existing villager gaining an arrow would show
  non-empty previous belongings.
- Holder record (day 40, from corpus s73672-armed.json, holderDetail):
  opening pool [the_ledger, gilded_pack, hunting_spear, work_gloves,
  denim_jacket, tote_bag, paperback, arrow] — again the arrow is the 8th
  and last member, the wild-card slot. The keep-5 split matches the
  keep-5 scoring exactly: the two keepsakes (+1000 each) and the spear
  (weapon bonus 30 × 10) and the two armor pieces (protection 4 × 5 and
  2 × 5) are carried; the two tools carry no tool bonus in their data, so
  they score only the small random nudge, same as the arrow, and all
  three lose — the arrow's company in the stash is exactly the two
  scoreless tools.
- A day-by-day deep dive confirms Petra is NOT a live villager before day
  40: days 1–39 she exists only as an unmade background-seed entry (no
  belongings, no pool, no arrows). On day 40 she appears in the village
  list with the full record above. Her background entry (glazier, Prague,
  "Cut glass for fifteen years. Hands steady, eyes better.") is the seed
  that gets made into a person that day, through the recruit path that
  turns a bare roster id into a full person (ensureRosterPerson /
  hydrateSeed in src/js/game.js).
- The recorder's "first roster day" for Petra reads day 1. That is a
  recorder artifact, not a game fact: the recorder counts the static
  background list as roster presence, so every background seed "appears"
  on day 1. Her live-villager day is 40, established by the deep dive
  and the day-40 population event. See Metric review.
- Source: **starting stash (joiner-population — person-record made on
  day 40 with its opening pool)**.

### Why not craft, loot, or trade

- Craft: the arrow recipe is player-only and makes 5 arrows at a time
  into the player's own inventory. The player's arrow count is 0 on every
  day of both arrow seeds, and no 5-unit gain ever appears. Non-player
  armor crafting makes armor only, never ammo. No craft event exists.
- Loot: the arrow carries no alien origin, so it is not in the alien loot
  pool, and the field-fight loot path draws from the same pool. A loot
  arrival would also arrive carried, on a kill day, by the killer —
  neither arrow is ever carried, and neither holder gains on a kill day
  (Petra's only event is the day-40 population; Jesse has no events).
- Trade / gift / corpse loot: a transfer predicts a donor's arrow count
  falling as the holder's rises, or a prior holder's death before the
  gain. Neither seed has any donor fall, any carried movement, or any
  prior holder. The single arrow is the only arrow that ever exists on
  either seed.
- Scholar inventory: 0 arrows on all days of both seeds, ruling out any
  scholar-craft-then-gift chain.

### The other 6 seeds: zero arrows, confirmed

Armed daily census, every day, all persons: 73671 (180 days), 73673
(124 days), 73674 (142 days), 73675 (180 days), 73677 (152 days), 73678
(104 days) — max total 0, no holders, no change events, no scholar
arrows. Cross-check against the ammostorage corpus: first-arrow day and
max agree on all 8 seeds (73672: 40/1, 73676: 1/1, others: none/0).

## Sense note (what a player would and wouldn't see)

A narration replay of the 73672 run (240 lines, through day 180)
contains zero lines about the arrow or its holder's arrow. That is
exactly what a starting-stash arrival predicts: nothing announces it,
nothing spends it, nothing points at it. By day 180 the player character
herself is Petra — the replay shows her holding her tote bag, one of her
keepsakes — and still never sees the arrow tucked in her own stash. A
player could play the whole run and never learn the village owns an
arrow at all. The arrow is a census fact, not a play fact. (Side shape
worth noting for whoever owns ranged combat: the village keeps being
dealt bows with no arrows — the scholar's opening pool holds a sling on
73671, a crude bow on 73672, a bow on 73676, and a crossbow on 73675 —
while the only arrows in the village sit unused in two stashes. That is
an observation, not a lever proposal.)

## Metric review

- Prereg-gap finding (joiner rule): the prereg's named-source rule for
  starting stash counted a holder whose recorder first-roster-day equals
  the arrow day. For background-survivor seeds that rule misfires: the
  recorder's first-seen day is day 1 for every background seed by
  construction (it counts the static list), while the live-villager day
  can be much later. The verdict does not rest on that rule as written:
  Petra's joiner case rests on the day-40 population event (empty
  previous lists) plus the deep-dive villager-list transition, both
  cited above. For the NEXT run, the rule should define join day as
  first live-villager day (membership in the village list), not recorder
  first-seen day. This is a documented refinement, not a mid-run
  re-score: both sources were named with record citations under either
  reading.
- Recorder caveat: the recorder's all-persons census includes the
  static background list, so a background survivor's "first roster day"
  in new-person records is day 1 even when they are not a live villager
  yet. The live-villager signal is village-list membership, not recorder
  presence. Future recorder work should record village-list membership
  alongside first-seen day.
- Transcription note: corpus files reached the disk by stdout
  transcription (see Infrastructure) because exec-channel file writes
  were blocked. One file (73671 baseline) was transcribed with
  alphabetically sorted JSON keys instead of run order; all values were
  verified identical to the run, and the summary + proof compare faced
  and table-state maps semantically (sorted keys) for that reason. Key
  order carries no game meaning; no value was altered.
- Proof: scripts/test-arroworigin-a.js re-derives every summary number
  from the per-seed rows (band vs 1920Z, G2 identity per seed, diag
  cleanliness, daily arithmetic, per-seed arrival checks, ammostorage
  cross-check, death band). Result: 213 PASS, 0 FAIL.
- Det-gate: PASS (seed 73671, recorder-off == recorder-on). Detail
  reproduction: PASS on both arrow seeds (fresh deterministic re-runs
  reproduce days/gameDays/first-arrow day/max/holder exactly).

## Infrastructure: session-write poisoning (read before reusing this path)

During this run, file-content writes from exec-channel processes failed
while reads, directory listing, and stdout kept working. The pattern,
reproduced several times: after a process in a session runs the game
harness (even load-only, no sim days), that session's own file-content
writes fail with EPERM (the file is created 0-byte; the open succeeds,
the write fails). Shell redirection of harness output to a file lands an
empty file (exit 0 with stdout-only redirect; exit 1 with both streams
redirected, error text swallowed). Python writes in such a session
report success but land 0 bytes; shell echo reports EPERM. Fresh
sessions that never ran the harness write fine in the same minutes —
except that the flap also appears intermittently in fresh sessions, so
"fresh" is not a guarantee either. The one reliable write channel
observed throughout is the runtime file tool (muse.write).

Retracted hypotheses (do not re-derive from these): (1) a game engine
module breaking writes — a bisect appeared to isolate it, but later
fresh-process probes failed and succeeded in ways that showed the
bisect result was coincidence with a flap window. (2) module requires
poisoning writes — a controlled repeat (3 trials with require, 3
without) passed 6/6; the earlier joint failure was a flap window.

Failed workarounds (kept in scripts/test-arroworigin-diag-sweep.js as
documentation, not relied on): writer-child corpus writes (a writer child
of a poisoned parent fails too, and one spawned before the harness runs
also fails — the effect is session-wide, not fork-time state); patient
retry (60 attempts over ~26 min; an earlier parent exhausted 23+
attempts over ~9 min without success); a session-health gate (passed at
session start, then the sweep's first corpus write still failed).

Adopted corpus path: children print ROWJSON on stdout (stdout flows
fine from poisoned sessions) and never write files; the corpus files
are written by the runtime file tool from the printed ROWJSON, then
verified in a fresh session (JSON parses; seed/policy/days match; for
armed rows, first-arrow day / max / holder fields sane; baseline vs
armed band fields identical). The compact ROWJSON v2 print (slim daily
rows + holderDetail/holderLast + scholarFirstFullPool) exists to keep
each printed row transcribable. The mechanism of the poisoning itself
is unidentified and is reported as such. Note the contradiction that
bounds it: the ammostorage arm wrote its full corpus successfully from
sim processes at 01:08 on 2026-10-27, while this arm's writes began
failing from 01:27 onward — something in the environment changed in
that window, or the flap is intermittent at a longer timescale.

## Next blanks, in order

1. The wave-5 wall in this substrate (wave 5 reached 0/8; table entered
   2/8, both lesser seats on the feared path). Owned by other arms.
2. The bow-without-arrows shape: opening pools keep dealing bows,
   slings, and crossbows while the only arrows sit unused in stashes,
   and no villager ever carries, trades, or spends one. Whether ranged
   play should ever connect the two is a design question for whoever
   owns ranged combat — not a lever proposed here.
3. Recorder hygiene: record live-villager membership (village-list
   presence) alongside first-seen day, so the next arm's joiner rule
   does not need a deep dive to tell a placeholder record from a person.
   Measurement hygiene only, not a game change.

## Files

- Evidence: evidence/2026-10-27/sim-arroworigin-a.md (this file)
- Pre-registration: evidence/2026-10-27/sim-arroworigin-a-prereg.md
- Recorder: scripts/policies/arroworigin-diag.js
- Sweep harness: scripts/test-arroworigin-diag-sweep.js
- Proof: scripts/test-arroworigin-a.js (213 PASS, 0 FAIL)
- Corpus: evidence/2026-10-27/perseed-arroworigin-a/ (16 per-seed files
  + summary.json; verdict DIAG-GO)

No [needs-eyes]: measurement only, nothing here changes what Steve
would play.
