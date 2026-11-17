# journey-scale r228 — muster + march (Mon 2026-11-16 22:45 CST / 05:18–06:45Z)

**Leg:** scale (days 80–140), rotation 3. **Seeds:** MATCHED 135613–135614 only
(the powered subset where r227's muster completed). **Arms:** A = r227 arm-B
policy verbatim (muster ON, march OFF — replication control); B = muster +
march (the march step is the ONLY policy difference). DAYCAP=140, policy
`scalecourt-traderoad-r113-linkraise-sit` + muster (both arms) + march (B
only). Sortie inert both arms.

## Verdicts

- **Q1 MARCH: GO.** On 135614 arm B the march arrived at the lair 4/4
  ready-muster days, the coalition fight started the next day, and THE
  HERALD fell (engine outcomes: slain, blades 8, result won). Arm A sat
  with a ready muster 6 days and never fought (0 fought, 0 slain). The
  march is what puts the scholar in the room; without it the muster waits
  forever. Wave-4 kills B 35 vs A 32. Cost bar holds (lived-days 282 vs
  281, +0.4%; no B-only collapse; starvation 0 = 0; committed Haven blades
  who died on B: 0).
- **Q1 MUSTER: GO on the thin band** (titan slain 1 on B, 0 on A) — but the
  band is one seed: 135613's muster never completed on the new base (see
  replication failure below), so the muster verdict rests on 135614 alone.
- **Q1 NATIONAL: NO-GO on the wall** (both arms, measurement not a gate).
  No national, no full seat either arm; the titan kill moved nothing on
  the ladder (tribute/national unchanged). The wall moved from "the muster
  sits ready" to "the fight engages" — the next wall is the deed gate
  opening and a capstone actually delivering.
- **Q2 guards: all GO/HOLD.** Spoken-raise GO (0 not-offered-spoken, ≥1
  properly answered per arm). Vetbar 0 disagreements. Trap-line 0 defects.
  Betrayal sibling 0 defects. Nod-loop 0 streaks ≥4. Lived-days per-seed
  mean 140.5/141.0 vs rolling mean 119 (18.1%/18.5%, inside ±25%).
  Lesser seat priced 2/2 per arm (bar ≥1/2). Books close, unattributed 0,
  teleOnly 0 both arms. Telemetry `maxGameDay` quiet both arms vs
  baseline 468; baseline NOT rolled.

## The march, as it happened (135614 arm B)

- Muster called d134: 8 allied blades + 3 Haven blades (Safae, Yara,
  Riley) = 11 against the 10 needed. Ready d134–137 (4 days).
- March: d134–135 the scholar was already on the lair tile [4,4]
  (onTile); d136–137 the base policy had taken him away to [2,4] and the
  march walked him back (arrived 4/4). Pending encounters: 0.
- d138 the fight was already live when the muster step ran (held
  'tbfight' — the meeting engaged during the base daily while the scholar
  stood on the lair tile). 11 allies joined on the field; Ella brought
  down The Herald; "🌅 THE HERALD FALLS. The realm exhales." Relic: The
  First Omen. "The coalition walks home. Fewer than marched out."
- **Caveat, plainly:** the Herald was at **1 of 700 HP** when the coalition
  met it — villagers had mauled it to 1 HP in field meetings over months
  (r226's read). The march ENGAGES the fight; the win itself was nearly
  free. The next question is whether the march engages a titan at full
  strength, not a mauled one.
- The muster stood hungry while it waited (fed 120–720 of 11,000 kcal/day;
  trust −2 per fire per day) and the Herald struck a link in the night
  (trust −5) — the waiting has a price even when the fight comes.

## Replication failure — owned prereg error

The prereg claimed "What changed in the game since r227's base: nothing —
this run's base IS r227's landing (410fb8109)." **Wrong direction.**
r227's panel ran on base `a71857271`; `git log a71857271..410fb8109` holds
a large adoption wave (companion guard shipped unconditional;
veteran-re-engagement party lever; establishment r230 `dlg:help` offer;
landing r140 warn_you heed fix; crisis r228 stale-favor/F2 guards; Nov 17
ship bump 947613d28; and more). **The control arm cannot replicate r227's
muster arm — the game moved under it.**

- 135613 on the new base: muster rows 125, called 0, readyDays 0 (r227:
  called d85, ready 29d). The trajectory itself differs (day 141, pop 7/7,
  pantry 21896, lead 1/1, tribArr 1 vs r227's day 140, pop 8/8, pantry
  7843, lead 3/2, tribArr 0). Herald omen stage 2 from d59 (r227: d85),
  present only 14 of 125 located days, short by 1–6 blades on all 14.
- 135614 on the new base: muster DID complete (called d134, ready 4d B /
  6d A) — close to r227's shape (ready 8d) — so the march got its live
  test on one seed, and the matched control still isolates the march.

## Two findings to carry forward

1. **tableActive masks the muster (135613).** 96 of 125 muster rows held
   'tableActive' — but the sanctity check runs before presence, and the
   Herald was absent on those days anyway (the step would have held
   'absent' regardless). `tableActive()` is true whenever a ladder
   capstone has been DELIVERED and the finale hasn't resolved — the mercy
   window, not a live table sequence. The muster step's sanctity gate
   conflates the mercy window with a live table sequence; a village that
   delivers and never sits stays under sanctity for ~96 days. It did not
   change this pilot's outcome (short on every present day regardless),
   but the gate needs the distinction.
2. **The fight joins a day late.** The analyzer's first verdict was NO-GO
   ("arrived but no fight on a march day") because it joined fights to
   march days exactly. The real mechanism is lagged: the march returns
   the scholar to the lair tile, and the meeting engages the NEXT morning
   while he still stands there (d137 march → d138 fight). The join is now
   same-day OR next-day, same titan; proof case (40) pins it. The
   prereg's GO rule as written already covered this — the instrument was
   stricter than the prereg, not the other way round.

## Pilot + panel

All four sims ran as pilots (each ~2.5 min); the "panel" IS the pilots —
no separate panel run was needed. 135613: both arms identical trajectories
(day 141, pop 7/7, pantry 21896, lead 1/1, rank regional, seat lesser,
tribArr 1); muster never ready; march rows 0. 135614: A day 140 pop 9/9
pantry 9670 lead 4/2; B day 141 pop 7/7 pantry 10604 lead 3/2; muster
called both arms; B slew the Herald d138, A fought nothing.

## People check (Q4) — PARTIAL

Read in full: the muster/march/fight voice in the 135614-B capture — the
call, Haven's commit ("Not loaned. Not asked-for. Ours."), the hungry
muster, the night strike, the fight ("You're on your own", 11 allies
join, Ella's scream stunning the Herald, the System broadcast, "The
coalition walks home"). All sensible, no fabricated history, the
consequences land (relic, retellings, a quieter fire). **Not done:** the
d90/d120 full transcripts and the raise-talk read in full — time-boxed out
of this run (hard stop 06:45Z). Owed to the next run.

## Census (Q5, analyzer-measured)

- 135613: 11 deaths both arms (wild 6, stranger 2, Highbeam Deer 1, arena
  1, monster 1); 14 fights (wave-4: 7). Tribute delivered d88 (military,
  ready d87). Lesser d34, stage 3 d20.
- 135614: A 3 deaths, B 5 deaths (wild 4, ambush 1); fights A 34 / B 39
  (wave-4: 25 / 28). Tribute never-ready both arms. Lesser d36, stage 3 d41.
- Spotter: 135613 end — 2 with spotter skill ≥1 (Nair, Sigrun); 135614-B
  end — 0 (was 1 at d90). Sorties: 0 called both arms. W5-instance: no
  wave-5 fights either arm (135613: live wave-5 entities on 54/140 days,
  never fought; 135614: none).

## Infrastructure

- **Write flap 05:21–05:33Z** (~12 min): first worktree registration
  failed on 5 file-write EPERMs; probes failed 05:24Z; waited 600s per
  the flap skill; re-probe passed 05:35:50Z; registration landed ~05:55Z
  after an 18.5-min checkout slowed by registry-lock contention with Loop
  B's 0430Z run (three concurrent registrations). Root cause still
  unestablished; report as ongoing, never solved.
- **Reap skipped** (registry lock held by another reaper run, consecutive
  skips: 2). Main tree clean at pre-flight; disk 45%.
- **Gate:** `node scripts/check.js --quick` launched 06:14Z, landed
  06:29:50Z: **333 passed, 7 failed in 935s** — same totals as r227, 0
  attributable to this run (no src/js change; failing files:
  measurement-proof-update + measurement-workflow [cache-flag load
  artifact — the box ran 4 parallel sims under the gate],
  phone-frame-proof [stale phone receipt], living-garden +
  occupation-panels + one-person-army deed-attainment [120s gate
  timeouts], test-ladder-bundle [standing control failure]). No r228 /
  muster / march file appears in the failure list. Analyzer proof
  112/112 standalone green; analyzer exit 0 on the panel corpora.
- **Merge:** merged locally, pending ship. Commits on `journey-scale`:
  `6b3faa6be` (prereg + driver/analyzer + proofs 108/108), plus this run's
  closeout commit (lagged-join fix + case (40) + this note). No version
  bump, no push, no live check (ship loop owns those). Rotation 3→0
  written (leg complete, merged). Safe-commit index clobber struck on the
  first commit (repaired via the `ls-tree -r` pipe; verified status empty
  + diff HEAD empty).

## Metric review (required)

- The same-day march→fight join was wrong; the lagged join (same day or
  next day, same titan) is the correct instrument — the fight engages the
  morning after the march returns the scholar, and the control arm (6
  ready days, 0 fights) is what proves the march caused it, not the join
  alone. Fixed in the analyzer + proof case (40); the prereg rule needed
  no change.
- The band is thin: a 2-seed matched panel where one seed never completes
  a muster means the MUSTER verdict rests on one seed. The next march
  question (full-strength titan) wants the full 4-seed band or a
  muster-completing band, not this one.
- The lesser-seat bar fix (≥1/2, not <3) and the per-seed-mean guardrail
  fix (119, not a 4-seed sum) from the build stand — both were
  carried-over 4-seed assumptions that would have failed every 2-seed
  panel.
- The replication premise ("base IS r227's landing") was wrong and is
  owned above; future preregs must state the panel's actual base commit
  and the delta from the previous run's base, checked with `git log`,
  before claiming replication.

## Reachable / fun / winnable

- **Reachable:** yes, now — the march makes the titan fight reachable;
  the first engine-slain titan on this band came through a lever, not a
  mauling. **Fun:** the coalition fight reads well (the call, the hungry
  wait, the walk home) — the march turns a waiting room into a road.
  **Winnable:** not by this lever yet — no national, no full seat, the
  wave-5 door never opened on either seed. The titan kill is a door
  opening, not a win; the deed gate is the next wall.
