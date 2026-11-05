# TB retreat-and-refind — CONFIRM VERDICT: NO-GO (arm sim-tbretreat-b-confirm)

Run: fleshout-loop-b-20261105T1611Z (confirm of the 1423Z pilot).
Axis: scale-onramp / winnability chain. Prereg:
`evidence/2026-11-05/sim-tbretreat-b-prereg.md` (G1–G4 binding, same
thresholds as the pilot). Lever: TBRETREAT_RESTORE — a fled TB fight
against an ordinary wild wave-4+ beast leaves the beast wounded on its
own tile instead of deleting it. Branch: sim-tbretreat-b, rebased onto
master e5e6aa59b (commit 88eb26931; rebase clean, no conflicts).
Proof `scripts/test-tbretreat-20261105.js`: 19/19 before the rebase AND
after it. Instrument errors: 0 in all 24 files.

## Confirm band 99731–99742 — verified FRESH

Whole-token grep of each candidate seed across ALL dated preregs
(`evidence/*/sim-*-prereg.md`): zero hits, per seed (0/12 each).
Whole-token grep across all dated evidence `.md` files: zero hits.
No perseed filename in `evidence/` or the goal `hidden_files/` names
any 99731–99742 seed. Bonus checks: no `"seed": 99731…99742` field in
any evidence JSON; no hits in goal `hidden_files/` `.md`. The band
avoids every named band (991xx/992xx/993xx/996xx/99721–99728/736xx).
Corpus: `evidence/2026-11-05/perseed-tbretreat-b-confirm/` — 24
files, 12 seeds 99731–99742 × baseline/armed, 150d death-aware,
competent-tbretreat-b wrapper (frozen staypolicy 50/50 trigger,
unchanged). Anchor commit for the confirm legs: 436c0ca2b (the
rebased branch tip; the two confirm legs ran after the rebase).

## Verdict — confirm NO-GO (G1 fails at scale)

| Gate | Bar | Result | Holds |
|---|---|---|---|
| G1 retreat survival | fled / trigger-fired wave-4 TB fights ≥ 25% (armed) | 5 exits / 49 trigger fires = **10.2%** | NO |
| G2 re-find within 7d | re-found / retreated beasts ≥ 25% (armed) | 2 / 2 = **100%**, gap 1d each | YES — THIN (2 retreated beasts < 4, so per the prereg the verdict would rest on G1+G3+G4 + the mechanism check) |
| G3 kill rate not halved | armed wave-4 kill rate ≥ ½ baseline | baseline 1/97 = 1.0%, armed 6/112 = 5.4%, ratio **5.20×** | YES |
| G4 survival not harmed | armed median survival ≥ 0.8× baseline | baseline 100.5d, armed 86.5d, ratio **0.86×** | YES |

Analyzer verdict object: `{"g1":{"holds":false},"g2":{"holds":true,"thin":true},
"g3":{"holds":true},"g4":{"holds":true},"go":false}` from
`scripts/tbretreat-analyze-20261105.js <corpus> tbretreat-baseline
tbretreat-armed`. Per the pilot prereg and the confirm brief, a
confirm NO-GO ends the arm: the src/js lever change is reverted (no
src/js trace remains) and the policy wrapper is deleted; the
instrument/driver/analyzer/proof stay as the measurement record.
The revert is in this branch as its own commit after this evidence.

## Before / after (identical seeds 99731–99742)

- Wave-4 fights: baseline 97 (60 TB + 37 field), armed 112 (74 TB +
  38 field). Armed fought more TB fights because villages lived to
  re-meet beasts — and because the wrapper's flee decisions cascade
  the runDays stream (see the 99732 divergence below).
- Wave-4 kills (strict same-day matched = kill-log, 0 unmatched on
  EITHER leg): baseline 1, armed 6. The midnight-spanning
  kill-matching limitation did NOT bite on this band (unmatched
  0/0), so the pilot's proposed ±1-day join changes no number here.
- TB endings: baseline 60 TB fights → 59 deaths, 0 fled, 1
  kill-or-rout. Armed 74 TB fights → 62 deaths, **5 fled**, 6
  kill-or-rout, 1 other. The 5 flees did not reduce TB deaths in
  count — armed fought 14 more TB fights, so deaths rose anyway.
  Scholar deaths overall: 107 → 110 (106 in combat on both legs).
  Field deaths: 12 → 14; field flees: 22 → 21.
- Damage: median damage fraction 0.0424 → 0.0397. The lever adds no
  damage, as the prereg said.
- Trigger diagnostics (armed): 49 fires, 5 exits, 87 flee turns,
  0 stuck fallbacks, **22 sealed fallbacks**. The pilot saw 1 sealed
  fallback in 11 firings; at scale the 50/50 line fires late and
  the barrier is sealed far more often than the pilot suggested —
  22 sealed vs 5 exits. The trigger fires, the fighter turns for
  the barrier, and the way out is shut. This is the G1 story: the
  exit rate is not a property of the restore at all, it is the
  staypolicy trigger's lateness, and 49 firings is enough to say so
  (10.2% vs the pilot's 45.5% on 11 firings and staypolicy-a's 35%
  on 17 — the pilot's G1 was a small-denominator fluke).
- Mechanism check: 5 fled TB fights → all 5 with a tile origin →
  2 restored, fidelity 2/2 (restored HP == min(pre-HP, primary end
  HP) both times). The 3 non-restores are by design, not misses:
  all 3 went through the titan/lingering restore path (the old
  code owns them; tbRetreatOrigin is never recorded for them, and
  R2 requires worldOrigin absent). Origin recorded 17 times on the
  armed leg; the other 12 recorded origins ended in death (R3: no
  restore on 'lost') or a win. The restore fired ~always when its
  conditions held — the mechanism is not the failure. The failure
  is that the exit almost never happens.
- Chain decomposition: TB→TB pairs — baseline 32 pairs, 13 resets
  (40.6%); armed 46 pairs, 10 resets (21.7%), 30 continuations, 6
  further-wounded. The reset share roughly halved, the same
  direction as the pilot (baseline 4/8, armed 0/13). Field→TB lift
  fidelity: baseline 56/56, armed 67/67. Wounded-exit re-finds
  (chain C, field + TB): baseline 15/30 re-found (14 within 7d),
  armed 18/32 (16 within 7d), gap median 2d both legs.
- Kill conversion by entry bucket (TB): baseline middle 1/35,
  fresh 0/25, wounded 0/0; armed wounded 0/2, middle 2/48, fresh
  4/24 (16.7%). Four of the six armed kills were FRESH-entry
  fights. The restore channel produced zero kills: the two
  restored beasts were re-found twice and fled twice, and no
  re-find fight in this confirm ended in a kill either.
- Re-find detail (armed, 2 retreated beasts — both the same beast):
  reunion s99733 day 84, restored 1200 HP at (5,4) → re-found day
  85, gap 1d, TB lift, re-find fight ended in flee, no kill, 0
  later kills. Same beast, day 85, restored 1200 HP at (5,4) →
  re-found day 86, gap 1d, field, ended in flee, no kill, 0 later
  kills. The beast sat at 1200 HP across three encounters; nobody
  hurt it in the two TB re-finds (0 damage both times), the field
  party dealt 49, the next party dealt 24 and lost Ava.
- Per-seed divergence (policy-side arms cascade the RNG stream, so
  per-seed days are noise and the aggregates are the verdict):
  s99732 baseline 99d / 17 fights → armed 57d / 6 fights; s99737
  102d → 71d; s99738 111d → 141d. s99739 died day 21 at wave 2 on
  both legs, byte-identical — the lever never fires before wave 4.
  s99731 died day 86 on both legs with standing 199 both times.

## Per-seed table

| Seed | Leg | Days | End | W4 fights | W4 kills (matched) | Killers ever | Living killers | Standing |
|---|---|---|---|---|---|---|---|---|
| 99731 | base / armed | 86 / 86 | lost / lost | 5 / 12 | 0 / 0 | – / – | – / – | 199 / 199 |
| 99732 | base / armed | 99 / 57 | lost / lost | 17 / 6 | 0 / 0 | – / – | – / – | 199 / 145 |
| 99733 | base / armed | 109 / 123 | lost / lost | 9 / 16 | 0 / 2 | – / Victor, Mwangi | – / 0* | 145 / 199 |
| 99734 | base / armed | 79 / 87 | lost / lost | 9 / 6 | 0 / 0 | – / – | – / – | 120 / 145 |
| 99735 | base / armed | 84 / 81 | lost / lost | 8 / 15 | 1 / 2 | Oliver / Oliver, Jesse | 0 / 0 | 199 / 199 |
| 99736 | base / armed | 107 / 115 | lost / lost | 7 / 12 | 0 / 0 | – / – | – / – | 145 / 195 |
| 99737 | base / armed | 102 / 71 | lost / lost | 8 / 8 | 0 / 0 | – / – | – / – | 100 / 125 |
| 99738 | base / armed | 111 / 141 | lost / lost | 12 / 11 | 0 / 2 | – / Kelly, Valeria | – / Valeria | 145 / 195 |
| 99739 | base / armed | 21 / 21 | lost / lost | 0 / 0 | 0 / 0 | – / – | – / – | 0 / 0 |
| 99740 | base / armed | 70 / 74 | lost / lost | 9 / 9 | 0 / 0 | – / – | – / – | 150 / 150 |
| 99741 | base / armed | 119 / 133 | lost / lost | 1 / 6 | 0 / 0 | – / – | – / – | 165 / 165 |
| 99742 | base / armed | 128 / 114 | lost / lost | 12 / 11 | 0 / 0 | – / – | – / – | 199 / 199 |

\* s99733 armed: the readiness snapshot read 1 veteran on days
123–124, but the final record has both killers dead — Victor died
day 115 in the wild, Mwangi (visjoin_102) killed the influencer day
122, became scholar, and died in a contest day 124. The day-124
snapshot was taken before that contest death processed. Living
killers by the final record: 0. Either way the village ended short
of the 2 living veterans wave 5 asks for.

## Scale-wall numbers (both legs)

Wins 0 / 0, national 0 / 0, table 0 / 0, wave-4 unlocks 11 / 11,
wave-4 faced 11 / 11, wave-5 unlocks 0 / 0, wave-5 faced 0 / 0,
readiness-5-ready days 0 / 0, median survival 100.5d / 86.5d. Eleven
of twelve seeds reached wave 4 on both legs (only 99739 died at
wave 2) — a far richer judged population than the pilot's 2 of 8,
which is what makes this NO-GO a verdict instead of a thin read.
Standing sat at 199 on four seeds per leg, held at t5-1 by
readiness: the veterans bar never reached 2 living (best: 1 living
veteran on armed 99738 at the end; armed 99733 read 1 on its final
days and ended with 0). No seed released a ready force, no seed
opened the wave-5 door, no seed won.

Telemetry deviation check: ATTEMPTED. `telemetry-check.js` refused
the corpus: "refusing recorder-corpus input: all 24 --current rows
carry top-level anchorCommit, so they are sweep recorder rows, not
runs." No compare was fabricated; wall numbers above are reported
directly. (Same refusal as the pilot's 16-file corpus.)

Balanced panel (§15): ATTEMPTED, cannot run on this corpus.
`balance-panel.js --help` requires `--out <panel-directory>` and the
code installs its own observer into fresh live sims under registered
policies — it takes no corpus input and offers no two-corpus
comparison, and `competent-tbretreat-b` is not in its registry.
Running it would re-run different policies on different seeds and
answer nothing about this arm's before/after. No compare `.md`
exists; none is fabricated. The analyzer's two-leg compare above is
the before/after instrument for this arm.

## Village assessment (plain words)

Eleven villages in twelve got far enough to meet a wave-4 beast,
and the story is the same one the pilot told, only louder: people
throwing themselves at one monster, one after another, until the
village runs out of people — and now, most of the time, the ones
who try to walk away can't get out either.

Seed 99733 is the reunion grind. Devon meets the same Reunion two
days running, deals no damage either time, and slips away at the
same wound both times — the restore keeps the beast exactly where
he left it, at exactly 1200 health, and he goes back and finds it
there. Then Wanjiru takes a party of three out and hurts it a
little; Ava takes a party of three out the next day, hurts it a
little more, and dies. The same village's Victor kills an
influencer on day 114 and dies in the wild the next day; Mwangi
kills another influencer on day 122, becomes the scholar, and dies
in a contest on day 124. The village dies with the beast still
standing.

Seed 99738 is the closest thing to a win in the band. Kelly kills
a wave-4 beast and then dies in the night at Haven — not in a
fight, just the night. Valeria kills one too and is still alive at
the end, the village's one living wave-4 killer, standing 195 —
five short of the 200 the fifth wave asks for, and one veteran
short of the two it needs. The village lived 141 days, the longest
in the band, and still died a veteran short.

Seed 99735 is the one baseline kill: Oliver banked a wave-4 kill
with the flag off, and banked another with it on, Jesse beside
him. Seed 99732 is the warning about reading single seeds: the
armed leg died 42 days sooner with a third of the fights, because
one early flee decision pulls the whole run onto a different track.
The aggregates are the verdict, not any one village.

So: the restore works exactly as designed — a retreated beast stays
wounded on its tile, the village finds it again the next day at the
same wound, twice out of twice. But the retreat itself almost never
happens. The trigger fires 49 times and the fighter gets out 5
times; 22 times the barrier is sealed shut when they turn for it.
The lever was built on the pilot's 5-exits-in-11-firings, and at
twelve seeds that number was a small-sample fluke. Nothing in this
confirm shows the restore changing the funnel: kills came fresh,
not wounded; no re-find ended in a kill; the veterans bar never
reached 2; the wave-5 door never opened.

## Sense-testing (read end to end, seed 99733 armed, days 84–87)

The sequence reads like people, not counters. Devon hurts nothing,
judges himself beaten at 47% health, and leaves through the
barrier — then goes back the next day to the same ground, finds
the same beast at the same wound, and leaves again the same way.
It is the same man, the same wound, the same exit, twice: a hurt
man going back to look, not to fight. Wanjiru then takes two
companions and deals 49 damage before leaving; Ava takes two
companions, deals 24, and dies, and the Codex turns its own page:
"Ava is dead. You didn't ask. It knew." The Reunion's own fiction
lands on day 84 — "Everyone you've buried, standing up" — and the
grind it names is exactly what happens over the next three days.

Two cracks, both named as findings, neither a verdict input. First,
the restore say line ("You slip away — it stays where you left
it, bleeding") was NOT captured in this confirm's corpus — not
because the line didn't fire (the pilot captured it twice, and the
restore fired with fidelity 2/2 here), but because the driver's
fightLines buffer hit its 200-line cap on day 71, filled with
pack-full spam, thirteen days before the first restore. Late-game
say lines are invisible in this corpus by construction. Second,
Devon's two re-finds are mechanically identical — same fighter,
same 47% exit, zero damage, one round on the second visit — because
the trigger fires on entry HP: a hurt fighter walks straight back
in and straight back out. It reads as a man checking, which is
plausible, but it is the trigger deciding, not the man.

## Metric review (§14)

- G1 was the honest primary and it failed cleanly: 5/49 = 10.2%
  against a 25% bar, on a band where 11 of 12 seeds reached wave 4
  (vs 2 of 8 in the pilot). The pilot's 45.5% on 11 firings is now
  explained as small-denominator noise, and staypolicy-a's 35% on
  17 firings looks the same way. Any future disengage lever must
  pre-register against a 50-firing denominator, not an 11-firing
  one, and must name the sealed-fallback rate as a secondary: 22
  sealed in 49 firings is the mechanism that kills G1, and it was
  invisible at pilot scale (1 sealed in 11).
- G2 held at 100% but on 2 beasts — thin again, as the guard
  anticipated. The re-find machinery (restore → next-day re-meet
  at exact HP) reproduced perfectly, twice, on the same beast.
  Thinness no longer matters for the verdict: G1 fails outright.
- G3 held with room (5.20×), but the "improvement" is 6 vs 1
  matched kills and 4 of the 6 armed kills were fresh-entry — the
  restore channel contributed zero kills. The evidence must not be
  read as a damage claim; the lever cannot add damage and didn't
  (damage fraction 0.0424 → 0.0397).
- G4 held at 0.86×, but the armed median is again LOWER (86.5d vs
  100.5d), driven by the armed leg's early deaths on s99732 (57d
  vs 99d) and s99737 (71d vs 102d). Survival is not the lever's
  claim; the bar is no-harm and it passed, but the direction is
  the same as the pilot's (0.82×) — two runs in a row, lower.
- The strict re-find rule (exact-HP equality) excluded no real
  re-meet: both re-finds matched exactly (1200 → 1200).
- The day-boundary kill-matching limitation did NOT bite here:
  unmatched kills 0 on both legs, so the pilot's proposed ±1-day
  join changes no number on this band. It stays a proposal for the
  next thin-band arm, unvalidated.
- The 50/50 trigger line fired where specified (49 fires, all on
  the line) and its lateness is now the headline: 22 sealed
  fallbacks, 5 exits. The earlier-line variant is still
  staypolicy's named follow-up — but this confirm says the
  follow-up must be judged on exits-per-firing at 12+ seeds, not
  on a pilot band.

## Named next blank

The exit, not the restore. The restore is proven: it fires when
its conditions hold (fidelity 2/2 here, 3/3 in the pilot), the
beast is re-found the next day at the same wound (2/2 here), and
the grind can in principle continue without a death. But the
fighter almost never gets out — 5 exits in 49 trigger firings,
22 sealed fallbacks — so the restore almost never gets to matter.
The next arm is the one staypolicy already named and this confirm
now proves necessary: an earlier disengage line (or a
sealed-barrier fix — whatever keeps the way out open), judged on
exits-per-firing at 12+ seeds with the sealed rate named as a
secondary. Until the exit works, the restore is a proven mechanism
waiting on a door that is usually shut. Also named: the fightLines
200-line cap (see findings) — the next instrument that needs a
late-game say line must raise the cap or filter the pack spam, or
it will measure nothing after day ~70.

## Findings backlog

- [open] 2026-11-05 — measurement — the tbretreat driver's
  fightLines buffer caps at 200 lines and filled with pack-full
  spam by day 71 on s99733 armed, thirteen days before the first
  restore — so no restore say line (or barrier line) from day 84+
  is visible in the confirm corpus. A follow-up instrument that
  needs a late-game say line must raise the cap or filter the
  pack-spam lines. (sim-tbretreat-b-confirm evidence.)
- [open] 2026-11-05 — measurement — strict same-day kill matching
  loses real kills that span midnight (s99723 armed reunion kill
  fought day 53, logged day 54); propose a ±1-day join for the
  next run. (sim-tbretreat-b evidence; NOT reproduced in the
  confirm — unmatched kills 0/0 on band 99731–99742 — so the
  proposal stays unvalidated.)

## Run notes

- Proof 19/19 before rebase and after rebase onto master e5e6aa59b
  (local master tip; origin/master 45c134fab was already contained
  in the branch, so `git rebase origin/master` was a no-op and the
  rebase ran onto local master; clean, no conflicts).
- Heartbeat sim-tbretreat-b succeeded twice during the run (first
  attempt timed out at 120s on the jammed registry lock; retry
  succeeded).
- No src/js change beyond the committed lever (game.js
  TBRETREAT_RESTORE, flag-gated, default OFF). No policy change
  beyond the committed wrapper. Confirm NO-GO: the lever is
  reverted and the wrapper deleted in the follow-up commit on this
  branch; instrument/driver/analyzer/proof stay as the record.
- The barrier-line contradiction from the pilot ("melts back into
  the wilds" vs "stays where you left it, bleeding") could NOT be
  re-checked in this corpus — no barrier line was captured after
  the day-71 cap. The pilot's finding stands open.
