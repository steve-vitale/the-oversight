# sim-allystart-b — EVIDENCE (ADOPTION, 1930Z arm finished 2130Z)

**Arm:** sim-allystart-b · **Loop B run:** fleshout-loop-b-20261124T2130Z
(adoption of the stranded 1930Z arm) · **Type:** BUILD — default-OFF lever,
pilot (8 seeds, before/after on identical seeds). **Finding:** #2600,
"ALLIES NEVER START IN THE FIGHT" (`evidence/2026-11-24/sim-basedmg-b.md`,
DIAG-GO).
**Prereg (frozen, binding):** `evidence/2026-11-24/sim-allystart-b-prereg.md`
(commit 403358e0d). **Branch:** `sim-allystart-b` (worktree
`~/workspace/worktrees/sim-allystart-b`). **Base at run:** `6297eb21c`;
rebased onto master tip at closeout (see §9).
**Lever commit:** 15ff9f030 (`src/js/villager-agency.js` helper
`allyStartAtDoor()`; `ALLYSTART=1` makes `expeditionMonster` pass
`allyFromStart: true`; off-mode byte-identical).

## Verdict: NO-GO — kill-share bar missed (0.040 vs ≥ 0.15)

Judged ONLY against the frozen prereg bars (§14 — no re-scoring).
The lever works exactly as built — allies are in the fight from round 1
in 25/25 meetings and damage/round more than triples — but it does not
produce wave-4 kills: 1 kill in 25 meetings. The timing lever alone is
not a kill lever.

**§14a kill classification: CONCEPT-DEAD (as a kill lever).** The concept
under test was "companions who set out together fighting together from
round 1 closes the kill gap." The mechanism fired perfectly and its
direct effect passed its bar (median dpr 80 vs bar 60), so the *mechanic*
is proven; the *kill claim* is dead on this pilot — fights still end by
the party fleeing with the monster at ~24% HP left, because the party's
HP runs out first. The binding constraint has moved to damage-per-
survived-round vs monster HP and to staying power, which is the
arm-2 toggle / flee-repair territory, not entry timing. The lever stays
available default-OFF on this branch for a possible future re-prereg
with a damage-based primary bar; this run does NOT land it.
**Branch is not to be merged on this verdict** (coordinator's call).

## Bars (frozen prereg)

| Bar | Ctl | Arm | Bar | Result |
|---|---|---|---|---|
| Pool floor (pair-inclusive engaged launched wave-4+ meetings) | n=27 | n=25 | n ≥ 10 | PASS |
| Kill share | 0.000 (0/27) | **0.040 (1/25)** | arm ≥ 0.15 | **FAIL** |
| Median damage/round | 25.7 | **80** | arm ≥ 60 | PASS |
| Starvation deaths (total) | 1 | 0 | arm ≤ ctl+2 | PASS |
| Starvation deaths (villager) | 0 | 0 | arm ≤ ctl+2 | PASS |
| Median survival | 142.5d | 150d | arm ≥ 0.8× ctl | PASS |
| Instrument errors | 0 | 0 | 0 | PASS |
| Proof test | 31/31 green | — | green | PASS |
| Analyzer selftest | 10/10 green | — | green | PASS |

## Before / after (judged population: pair-inclusive engaged launched wave-4+ expedition meetings)

| Metric | Ctl (ALLYSTART off) | Arm (ALLYSTART=1) |
|---|---|---|
| Meetings n | 27 | 25 |
| Kills (vKill) | 0 (0.000) | 1 (0.040) |
| Wins (vKill + mFlee) | 0 (0.000) | 3 (0.120) |
| Party flees (vFlee) | 20 | 21 |
| Party dies (vDie) | 7 | 1 |
| Monster flees (mFlee) | 0 | 2 |
| Median damage/round | 25.7 | 80 |
| Mean damage/round | 35.5 | 76.8 |
| Median round-1 strikers | 0 | 2 (mean 2.32) |
| Median round-1 ally strikers | 0 | 2 (mean 1.84) |
| allyFromStart share | 0/27 | 25/25 |
| Door meetings / shout meetings | 0 / 24 | 25 / 0 |
| vFlee rounds (mean) | 4.9 | 5.57 |
| vFlee damage dealt (mean) | 247.7 strikes parsed | 455.1 strikes parsed |

## Control cross-check vs basedmg (zero drift)

The fresh control reproduces the basedmg corpus EXACTLY on the judged
population: kill share 0/27, median dpr 25.7, 20/27 vFlee — identical to
`evidence/2026-11-24/sim-basedmg-b.md`. No master drift between the
basedmg base (`c78100ff4`) and this arm's base (`6297eb21c`) on this
band. The fresh off-mode leg also proves off-mode byte-identity in the
same breath as it controls the arm, as the prereg intended.

## Wall numbers (reported every run; table not instrumented — null, never faked)

| Metric | Ctl | Arm |
|---|---|---|
| Wins (table) | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 |
| Table | null (not instrumented) | null |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 4/8 | 4/8 |
| Median survival | 142.5d | 150d |
| Community lost | 5/8 | 2/8 |
| Villages surviving 150d | 3/8 | 6/8 |
| Starvation deaths | 1 total / 0 villager | 0 / 0 |

Per-seed arm: 109501 lost d94 (standing 199, w4); 109502 survived d150
(199, w4); 109503 survived d150 (500, w5); 109504 survived d150 (375,
w5); 109505 lost d89 (199, w4); 109506 survived d150 (450, w5); 109507
survived d150 (590, w5); 109508 survived d150 (199, w4). Per-seed ctl:
109501 survived d150 (595, w5); 109502 lost d111 (199, w4); 109503 lost
d118 (300, w5); 109504 survived d150 (150, w4); 109505 lost d138 (550,
w5); 109506 lost d135 (125, w4); 109507 survived d150 (199, w4); 109508
lost d147 (400, w5).

## §15 balanced panel (instrument, not judge)

`evidence/2026-11-24/allystart-b-panel.md` (built by
`scripts/build-allystart-b-panels.js`, compared with
`scripts/balance-panel.js`, 8 paired seeds). Decision:
**review_required**. Community loss 0.625 → 0.25 (no material signal);
village deaths per run 111.25 → 115.25 (regression_watch, but the 95%
exploratory interval −36.5 to +35.25 straddles zero — noise at this n);
national 0 → 0, table wins 0 → 0. The panel agrees with the judged
verdict: no win/national movement, survival-side movement inside noise.

## Encounter-gear fixture (Steve 2026-11-13)

The judged fixture is the encounter itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh un-geared
solo scholar. Judged meetings: party size 3 in both legs. Arm vFlee
meetings: min armor P 18.8 mean, mean armor P 33.5, 2.0 abilities per
member. The single arm kill (seed 109503, day 122): party of 3, min
armor P 40, mean armor P 48, 4.0 abilities per member — Mai carrying a
godslayer spear (rangedB 85), Jovan a crossbow, Greta a crossbow.
Ctl vFlee meetings: min armor P 21.0 mean, mean armor P 30.4, 1.6
abilities per member. The fixture is encounter gear, as staged.

## Sense-test (best + worst arm meetings, read in full)

**Best — the only kill. Seed 109503, day 122, THE EATER, 11 rounds,
1075 damage dealt, party takes 70.** Reads as people, start to finish.
Jovan walks into the Eater; Greta and Mai are already at the door and
charge in with him. All three strike in round 1 (Jovan 21, Mai 53,
Greta 20). Jovan draws its eye — "Me. I'm the problem." — and bellows a
war cry; mid-fight he stops to bind a wound with field medicine (+20
HP). The Eater, wounded past its line, holds its ground and will not
leave. Round 11, Jovan lands the last 23 damage. This is the fight the
lever was built for: companions who set out together, fighting together
from the first round, grinding a 1000+ HP monster down over eleven
rounds. Nothing robotic about it.

**Worst — the only party death. Seed 109501, day 71, The Reunion, 3
rounds, 173 damage dealt of 1290 HP, party takes 70 and Sam dies.**
Also reads as people — and shows exactly why the kill bar missed. All
three strike in round 1 (Sam 30, Ethan 13, Hendrik 24); Sam draws its
eye and takes 36, then 34. In round 3 Sam tries the Reunion's own game —
stands on one foot and recites a poem mid-fight, and the Reunion
falters; it has nothing to wear — then Sam dies to a 34-damage hit
through armor P=10. The lever fired (everyone in from round 1); the
Reunion simply hits for 34–36 a round and the party's HP runs out in
three rounds. Entry timing cannot fix intake.

**Typical — seed 109503, day 109, The Audit, 11 rounds, 880 of 1157 HP
dealt, party flees.** The party grinds the Audit to 277 HP left, Zoe
down to 20 HP, and runs "while running still works." Sensible — they
are losing the war of attrition — and it is the shape of the miss: 21
of 25 arm meetings end this way, with the monster at roughly a quarter
health. The party deals ~80/round and survives ~5.6 rounds; wave-4
monsters need ~1100 HP ground down. The gap is ~30% more damage or
staying power, not entry timing.

## Village assessment (plain words)

The villages look the same from the outside in both legs — same wave
unlocks, same standing bands, nobody reaches national, nobody wins —
but inside the fights the arm leg is a different village. In the
control, the lead walks into a wave-4 monster alone, shouts while
losing, and a friend trickles in on round 3 or 4; the party dies 7
times in 27 meetings. With the lever on, the three who set out together
are all there from the first blow, the party dies once in 25 meetings,
two monsters flee, and villages survive twice as often (6 of 8 reach
day 150 vs 3 of 8). But surviving the fight is not winning it: the
party still walks away from 21 of 25 wave-4 monsters, and only one
monster in the whole arm leg actually died. The village is tougher and
braver with its friends beside it from the start — and still not
strong enough to kill what it meets. The next lever has to be damage
or staying power, not arrival time.

## Metric review (for the NEXT run, §14)

- The kill-share bar (≥ 0.15) was set against a mechanism that moves
  damage, not kills. Damage tripled and passed its bar; kills moved
  0 → 1. At pilot n=25 a kill bar of 0.15 needs 4 kills; the lever
  produced the damage for roughly one. If this lever is ever
  re-judged, the primary bar should be damage/round (or wins incl.
  monster flees), with kill share secondary — a coordinator/Steve call,
  not a re-score of this run.
- Funnel asymmetry worth a look next run: arm leg recorded 72 wave-4+
  encounters vs 54 ctl, with 36 evade-excluded vs 17 ctl, yet the
  judged pools are near-identical (25 vs 27). The extra arm encounters
  are mostly evades; whether surviving villages meet (and dodge) more
  monsters, or this is seed noise, is unjudged here.
- Panel regression_watch on village deaths (111.25 → 115.25) is
  interval-straddling noise at n=8; the analyzer's own cost bars
  (starvation 0 vs 1, median survival 150 vs 142.5) pass cleanly.
- The single arm kill took 11 rounds and 1075 damage — the wave-4 HP
  band (850–1500, MONSTER-WAVES.md) against ~80 dmg/round means even
  a perfect-entry fight needs 11–19 rounds; the party survives ~5.6.
  Any future kill lever has to close that arithmetic, not just the
  first round.

## Infrastructure notes

- Proof test `scripts/test-allystart-b.js`: 31/31 green before the band
  (slow under sibling load, ~15.5 min; the §3 smoke runs two full
  2-seed driver passes in-process). Analyzer `--selftest`: 10/10 green.
- Instrument errors 0 on all 16 per-seed files, both legs.
- Policy sha verified at run time: `1884c8852d38` (competent verbatim,
  matches prereg). Substrate frozen as prereg:
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`;
  carrier flags FIELDCAPDMG/RAGEFREE/FREESTRIKE asserted OFF on both
  legs (per-file metadata confirms).
- safe-commit.sh clobber struck TWICE on the control-leg commits
  (index showed committed files staged-as-deleted; worktree files
  byte-identical to HEAD). Repaired both times with the AGENTS.md
  pipe (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); both commits verified correct by `git show --stat`.
  safe-commit.sh also refuses directory paths — the per-seed dir had
  to be committed as an explicit 8-file list.
- Write flap: no recurrence this run (the earlier flap cleared
  ~21:32Z; all writes went through).

## Corpus

- Prereg: `evidence/2026-11-24/sim-allystart-b-prereg.md` (403358e0d)
- Analysis JSON: `evidence/2026-11-24/allystart-b-analysis.json`
  (verdict NO-GO, bars listed above)
- Control leg: `evidence/2026-11-24/perseed-allystart-b-ctl/` (8 seeds,
  committed 26dc48147 + e2559f975)
- Arm leg: `evidence/2026-11-24/perseed-allystart-b-arm/` (8 seeds,
  driver exit 0, errors 0)
- Logs: `evidence/2026-11-24/allystart-b-ctl.log/.err`,
  `evidence/2026-11-24/allystart-b-arm.log/.err`
- Panel: `evidence/2026-11-24/allystart-b-panel.md` (+
  `allystart-b-panel-before/after.json.gz`)
- Proof: `scripts/test-allystart-b.js` (31/31); analyzer
  `scripts/analyze-allystart-b.js` (`--selftest` 10/10); driver
  `scripts/allystart-driver-b.js`; panel builder
  `scripts/build-allystart-b-panels.js`
