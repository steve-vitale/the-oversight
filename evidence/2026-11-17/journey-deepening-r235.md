# Journey — deepening r235 (2026-11-17)

**Leg:** deepening (days 40–80, DAYCAP 100) · **Base:** master `3d9517838`
(journey-establishment r232 closeout) · **Seeds:** 103601–103608, fresh
(full freshness check in the prereg; 0 hits anywhere; rejected
103401–103408 = journey-scale r233, 103501–103512 =
sim-planignconfirm-b) · **Policy:** competent + muster policy (r227
verbatim, driver-only) + march step (r228 verbatim, driver-only) ·
**Arms:** SINGLE (verification panel on current master — the refusal
fix is already landed; no A/B split) · **Driver:**
`scripts/journey-deepening-r235-20261117.js` · **Analyzer:**
`scripts/analyze-journey-deepening-r235-20261117.js` (new
summarizeRefusalHeard + summarizeCoalitionGap; slain-field + march
carried verbatim) · **Prereg:**
`evidence/2026-11-17/journey-deepening-r235-prereg.md`
(run id `playtest-a-20261117T1644Z`).

**Registration note:** the first registration attempt (16:46Z) failed
after 18 min — both `git worktree add` attempts checked out 100% then
failed at `fatal: Could not reset index file to revision 'HEAD'`
during a host write flap (flap-watch EPERM at write() from 17:02Z;
direct `git update-ref` probes rc=128 at 17:05/17:09/17:14Z). The
flap cleared with a VM replacement (probe green 17:20:12Z, new boot);
the retry registered in ~6.5 min. Branch `journey-deepening` was
created by the first attempt and reused. The /tmp prereg draft was
lost in the VM replacement and rewritten into the worktree. No src
change is involved in the delay; the panel base is unchanged.

## Pre-registered questions

- **Q1 — REFUSAL-ONCE-A-DAY, WILD VERIFICATION (primary, single arm):**
  the scale-r233 fix (fdf79a680) dedupes the spoken muster-gate
  refusal to once per titan per day; outcomes still recorded per
  refusal. It was proven only by its proof test (25/25, red 17/8)
  and never observed in the wild. GO requires all three: every
  refusal day heard exactly once; >= 1 multi-refusal day heard once
  (the dedupe engages); 0 days heard > 1.
- **Q2 — COALITION CHOKE (secondary, diagnostic, r232 metric-review
  owed):** the 10-blade bar. Per seed: max blades while a titan is
  present, days at 7–9 / at 9, longest run at 9, days to ready. This
  run measures the distribution and PROPOSES the re-pointed bar; no
  bar was set in advance.
- **Q3 — PEOPLE CHECK:** read 1–2 full transcripts (convo days 45/60/80)
  in full; also read the muster/march/fight voice on >= 1 seed.
- **Q4 — CENSUS + reachable/fun/winnable.** Carried: w4stuck1 (old bar,
  continuity only), trick pipeline, w4fights/w4kills, banked veterans,
  w5 unlocked/faced/killed.

## Q1 — REFUSAL-HEARD: GO

- **Refused=30, spoken=13, badDays=0, dedupeDays=3, campaignRefused=0
  → REFUSAL-HEARD-GO.** All three prereg bullets hold.
- The scale-r233 shape reproduced exactly and the dedupe answered it:
  **103602 day 97 — 9 refused outcomes, heard ONCE.** 103603 day 98 —
  6 refused, heard once. 103605 day 72 — 5 refused, heard once, then
  7 more single-refusal days (73–78, 81) each heard once. 103608 day
  59 — 1 refused, heard once. Four seeds had no refusals at all.
- The line still fires when it should: no refusal day was silenced
  to 0, and no day heard the line twice. The campaign-gate refusal
  never fired on this band (0) — that path stays a watch, not a
  finding.
- The fix is now verified in the wild, not just by its proof test.
  The r232-owed blank is closed.

## Q2 — COALITION CHOKE: MEASURED (re-pointed bar proposed)

- **Reached 10 blades: 4/8** (103604: 12, 103606: 11, 103607: 11,
  103608: 10). **Stuck at 7–9 blades: 7/8.** The choke is still the
  binding wall — and this band measures it precisely:
  - **103601: 27 CONSECUTIVE days at exactly 9 blades** (one short),
    36 of 37 watch days at 7–9. The village called twice (d64, d73),
    gathered 6 allies + 3 Haven, and sat one blade short for a month.
  - **103605: 9-day run at 9**, 31 of 32 days short — and the village
    LOST (day 82, scatter-hunger) still one blade short of the muster
    that might have saved it.
  - 103606: 17 days at 9, then reached 11 on day 95 — 18 days from
    first watch to ready. The slow climb that DID make it.
  - 103608: 10 days to ready; 103607: 1 day to ready; 103604: 2 days
    to ready (12 blades).
- The distribution (max totals 9, 7, 7, 12, 9, 11, 11, 10; median
  10) says the bar is a coin flip on this band, not a far wall — but
  a coin flip that leaves a village sitting 27 days at 9 is still a
  wall. **Proposed re-pointed bar for the next run: COALITION-REACH
  = seeds reaching 10 blades, bar >= 6/8** (this band 4/8, r232 3/8
  — the bar demands real movement). Secondary watch: longest
  one-short run (this band 27 days).

## Muster / march / titan

- **Called 8/8, ready 1/8 at end, fought 3 seeds, slain 2 titans**
  (MUSTER-SLAIN). End-state ready understates the machine: 4 seeds
  reached 10 blades during the run; two fought and won after
  standing down, so they end unready with a dead titan.
- **March: 16 march-days, 15 arrived, 4 fought on march, 2 slain on
  march, 4 full-strength fights, 2 full-strength slain →
  MARCH-SLAIN.** A marched muster kills full-strength Heralds (103607
  d98, 103608 d65).
- 103608 re-called (calls d53, d54, d62) and gathered 18 allies
  across calls — the call can be sounded again and the village keeps
  answering. 103604 reached 12 blades, fought d88, routed.
- Villagers maul Heralds in the field without finishing them: 103602's
  Herald fell to 263/700, 103603's to 94/700 — both still alive at day
  100. **Slain-field: 0 opportunities** (third panel running: r227
  1/8, r232 0/16, r235 0/8 — 1 opportunity in 32 seeds). The fix is
  judged by its proof test, as the prereg provides.
- Herald gorge: no analyzer scan hit (watch only, no verdict).

## Q4 — census

- **Survival 7/8** (r232: 8/8). 103605 village-lost day 82 —
  scatter-hunger, pantry 0 kcal at end. Pop at end 6–11. All villages
  reached wave 4; ladder stage 3 at d80 on all 8 seeds.
- **Wave 4: 37 fights, 8 kills, killsPerSeed 1.0** (r232: 22/4, 0.5).
  Per-seed: 103601 1/1, 103602 4/0, 103603 6/0, 103604 5/0, 103605 3/0,
  103606 2/1, 103607 6/5, 103608 10/1. **Banked veterans (2+): 1/8.
  Wave 5 unlocked: 1/8, faced 1, killed 1** (r232: 0/8) — **103607
  unlocked day 84, faced 2 distinct wave-5 monsters, killed both**
  (party sizes 3 and 6, 2 deaths in the wave-5 fights). The door
  opened on one seed, and it went through it fighting.
- **w4stuck1 (old bar): 7/8 — PASSES the >= 6/8 bar this run**
  (r232: 4/8). The bar flips run to run (4/8 → 7/8) while the
  binding wall stays the coalition — confirming r232's metric-review
  point that it measures a different wall than the one that binds.
  It is retired in favor of COALITION-REACH (see metric review).
- **Trick pipeline: TRICK-PIPELINE-FLOWS**, taughtRate=null (no
  countered wave 1–2 types), learnedRate 0.529, w4killsKnown=1,
  w4killsUnknown=7.
- **Scholar deaths: 26 total, 19 wild** (r232: 17 total, 13 wild).
  103608 died 7 times (5 wild); 103607 died once (0 wild) and killed
  5 wave-4 + 2 wave-5 monsters. The variance is enormous — the same
  band holds both the scholar who cannot stay alive and the scholar
  who clears wave 5.
- Carried conversation watches: FIZZLE-FIX HOLDS (0 dry sittings),
  DOUBLE-ASK 0, MENU-FLIP 0 flips, LADDER-OPENS + minted 5/5 tracks,
  BOND-TELEMETRY PRESENT (168 tele, 90 proposals, 45% accept),
  Q1-REQUESTS REACHED. GOALS-FAULT tracks bank_veterans and knowledge
  (0 lined) are pre-existing program notes, not this run's question.
  RE-ASK-ORPHAN: 15 orphans, 14 fromSeed-origin, 1 true-no-thread
  (r232's shape).

## Q3 — people check

Read in full: **103602 day 60 — Ursula (mortician, gentle, trust 2)**
and **103601 day 73 — Olivia (social worker, warm, trust 89).** Both
pass the sense test.

- Ursula wants the player to be careful — the stores are running
  thin, and she is trying to still have the player here tomorrow
  ("I'm not trying to fence you in. I'm trying to still have you
  here tomorrow. That's the whole of it."). The promise is extracted
  honestly, the resolution is `heeded`, and the sitting then turns to
  a second, different beat — help hauling, and she presses an extra
  tool into the player's hand ("I made an extra"). A real moment from
  a mortician who has seen what the wild does.
- Olivia carries two asks in one sitting: a link proposal to The
  Bloodied (the player declines the betrayal branch, then accepts the
  link — the two menus stay distinct) and a creek water run. The
  commit gets an honest deferral (she's out on the road, no dawn
  meet — find her when she's back), and the want stays `stated`, not
  `promised` — honest, not a bug.
- Nits (pre-existing, r232-documented, not this run's fix): Ursula's
  middle has three near-identical heed exchanges ("I'll be careful" /
  "I hear you. I'll watch myself" twice) — a small filler loop before
  the line that lands. The winddown repeats the closing line verbatim
  ("I should go. Take care of yourself, okay?" as both). The
  favor-requirements line is the same system wording across
  villagers; the winddown ("...Think about it? I'll be around.")
  repeats verbatim across sittings.
- **Muster/march/fight voice:** the refusal line itself is Q1's
  instrument — read in the wild, not just counted: "⛔ THE HERALD
  does not notice you the way prey notices a hunter. It notices you
  the way weather notices a field. You cannot face this alone — sound
  the call, muster 10 allied blades (you have 7). This is not
  courage. This is arithmetic." Heard once per day even on the
  9-refusal day — the voice now behaves like a person who said it
  once and won't repeat themself.

## TableActive distinction — investigated, NOT landed (documented)

The scale-r233 owed item: the muster step's sanctity gate cannot tell
a live table sequence from the mercy window (103405: 78
present-held rows over 74 days). The code read this run:

- `tableActive()` (table.js:938) is true in THREE cases: (1)
  `T.winDeferred` — the win-day-floor deferral window, no modal open;
  (2) `pg.ladderCapstone && phase !== 'done'` — LADDER MERCY, from
  capstone delivery until the finale resolves (a village that
  delivers and never sits stays under sanctity indefinitely); (3)
  `pg.tableDone && phase !== 'done'` — the table is actually sitting.
  Only (3) is a live sequence the scholar is inside.
- The march step's sanctity hold (`G.tableActive()` → held
  'tableActive') uses the whole predicate, so a delivered village
  can never march — the mercy window, which protects villagers from
  UNCHOSEN stakes, blocks a CHOSEN one (the coalition march, like
  the table's own trial-by-combat, is the village's own stake).
- The fix shape: a new derived query `tableSitting()` — true only
  for case (3) (`pg.tableDone && T.phase && T.phase !== 'done`;
  winDeferred and mercy excluded, no new persisted fields) — and the
  march sanctity gate uses it instead of `tableActive()`. Proof test
  shape: synthetic Game with ladderCapstone set + phase null →
  tableSitting false, tableActive true, march proceeds; with
  tableDone + phase 'paths' → tableSitting true, march held.
- **Why not landed here:** the pool is EMPTY on the deepening leg —
  0 tableActive-held march rows on this band, no capstone delivered
  within DAYCAP 100 (stage 3 reached, capstone needs the readiness
  bars). A fix landed here would be proof-test-only with no wild
  pool, and it touches a live march path. The panel re-check belongs
  on the scale leg, where the pool lives (delivery ~d62 + long
  window). Owed to the next scale run, with this evidence cited.

## Village assessment (plain words)

Eight villages, seven alive at day 100. The Herald came to all eight.
Four mustered ten blades and marched — two killed him outright, one
was routed, one fought and won after standing down. Two more villages
spent the whole window one blade short: one sat at nine blades for
twenty-seven straight days, calling and waiting while the Herald fed;
the other lost its village to hunger still one blade short. The
scholar is no longer turned away ten times a day — on the worst day
he was refused nine times and heard it once, which is how a person
talks. One village broke through further than any deepening village
in a while: it banked its veterans, opened the wave-5 door on day 84,
and killed two wave-5 monsters. The people themselves are alive and
talking like people — a mortician asking you to stay alive, a social
worker asking for hands on a water run — but the coalition is still
the wall: ten blades is a coin flip, and a coin flip that lasts a
month is a wall.

## Reachable / fun / winnable

- **Reachable: YES for wave 4 + the muster, YES for wave 5 on one
  seed.** The call sounds, the muster forms, the march arrives, the
  fight engages at full strength and kills. One seed opened wave 5
  and killed in it.
- **Fun: PARTLY.** The muster fight is a real event (won twice,
  routed once). The stuck seeds are not fun: weeks at nine blades
  with no new information about what would close the one-blade gap —
  and the village that lost to hunger while one short never got to
  find out.
- **Winnable: NO on this band.** Wave 5 unlocked 1/8, killed 1/8 —
  the door opened, but the deed gate never opened and no seat was
  taken. The binding wall is still the veteran bar (banked2 1/8) and
  the deed gate, with the coalition choke one step upstream. The
  refusal fix does not move winnability; it stops the same refusal
  being shouted nine times a day.

## Gate / telemetry

- **Gate: `node scripts/check.js --quick` in the worktree — 330 passed,
  10 failed in 1187s** (box load peaked 14.29 mid-run; r232's gate was
  334/6 in 838s). Adjudication: all 10 are the standing set, **zero
  attributable to this run** — the worktree changes are tooling-only
  (r235 driver/analyzer/proof tests + evidence) and none of the 10
  suites touches titans, the muster, or the journey harness. (1)
  test-measurement-proof-update — staleness ("Proof source inputs are
  not current"). (2) test-measurement-workflow — staleness ("retained
  neutrality proof covers the current Game/controller/harness
  inputs"). (3) test-phone-frame-proof — staleness trio (retained
  browser inputs / boot-input coverage / phone evidence required).
  (4) test-ladder-bundle-20261108 — control "200 monster turns
  WITHOUT delivery fire the ambient raid — fires 0" (same standing
  failure as r226/r227/r232). (5) test-measurement-cache-flags —
  0/4 (the documented box-load artifact, AGENTS.md 2026-11-12; same
  as scale r233). (6)–(10) five 120s timeouts —
  living-garden-deed-attainment, occupation-panels,
  one-person-army-deed-attainment, trust-observer-neutrality,
  capable-bot (the deed-attainment timeout class; the gate ran ~1.4×
  slower than r232's under load 14). **Gate: GO (0 attributable).**
  Standalone re-run of the timeout class on the quieter box:
  test-capable-bot-20261014.js passes 40/40 (load 2.77) — the
  timeouts are a load artifact, not a regression.
- **Telemetry: quiet on the full panel** (8 files, 4 metrics —
  w3fights, engaged.w3, fightsTotal, fightsByWave.3 — no large
  deviations). Baseline NOT rolled (no LOUD lines).

## Metric review

- **w4stuck1 bar (≥6/8): retire it.** It passed this run at 7/8
  after missing at 4/8 twice (r227, r232) — while the binding wall
  (the coalition) did not move. A bar that flips run to run while
  the wall stays put measures noise, not the wall. Replaced by
  COALITION-REACH (seeds reaching 10 blades, proposed bar ≥6/8;
  this band 4/8, r232 3/8) with the longest one-short run as a
  secondary watch (this band 27 days).
- **The refusal-spam bar (worst day ≥10) is validated:** it caught
  the shape at exactly 9 refused on 103602's worst day, and the
  dedupe answered it (heard 1). The bar's shape (worst day, what
  the player feels) is right; keep it, and keep the per-seed
  worst-day line in the output.
- **The slain-field opportunity pool is thinner than any prereg
  assumed** (1 opportunity in 32 seeds across r227/r232/r235).
  Villagers maul Heralds to 94–263 HP in the field without
  finishing them. A before/after panel on fresh seeds cannot judge
  this fix in the wild; the proof test carries the verdict, and the
  panel should stop spending a primary question on it.
- **Ready→fight latency (r228 owed, r232 closed):** this band 1, 2,
  10, 18 days to ready; fights on the ready day or the day after.
  The march does not sit ready for weeks. Bar stays closed.

## Closeout

- **Commits (branch `journey-deepening`):** `9ccf48d7a` prereg +
  driver/analyzer + proof tests (tooling only; analyzer 60/60,
  muster 12/12, march 11/11 green on the branch tip); run-note
  commit (to be filled). Safe-commit index clobber struck on commit 1
  (staged-as-deleted pattern); repaired via the `ls-tree -r` pipe,
  blobs verified against HEAD, tree clean after the repair.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those). (Merge + release + rotation +
  lock steps recorded in the run's memory log.)
- Rotation 2→3 written with read-back; lock deleted at closeout
  after run_id verification.
- Worktree released (`merged`), branch deleted; final reap sweep
  clean. Main tree verified clean after the merge.
- The r235 panel corpus (per-seed JSONs + convo transcripts + analyzer
  log + gate log) lives under the goal hidden_files evidence dir for
  2026-11-17 (outside the repo, per the journey-lane pattern); the
  repo evidence dir holds the prereg and this run note.
