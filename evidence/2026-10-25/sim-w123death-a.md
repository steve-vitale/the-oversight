# sim-w123death-a — wave-1/2/3 field-death scope (axis scale-onramp, DIAG ONLY)

Run: fleshout-20261025T1027Z, loop A (oversight-flesh-out-loop).
Axis: scale-onramp (converging, standing directive: villages never scale
past village in sims; wall numbers reported every run). DIAG ONLY — zero
src/js changes, measurement record only (evidence + proof/analyzer script
+ corpus, like the earlier deathcensus arm). No fix is bundled with this
diagnosis; the fix is a later arm. No sibling tree, branch, claim file,
tracker, or lock touched. No push, no version bump, no live verification.

## PRE-REGISTRATION (binding — written BEFORE any classification)

- Question: what ARE the wave-1/2/3 field deaths, as mechanism classes?
  The deathcensus arm (sim-deathcensus-a, same band) proved field fights
  are the single largest villager-death source (12/27) and that the
  wave-4 one-shot class (3 deaths) and the nearly-dead-entry class are
  now measured and killed as cures by the bought-round arms. What is
  NOT yet scoped: the wave-1/2/3 field deaths as their own mechanism
  classes. This arm scopes them.
- Substrate (shared, identical to the published controls): policy
  scripts/policies/tableseat-nowait.js — leanlinkrescue courtship
  (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1), no wait leg.
  Seeds 73671–73678, 180d death-aware horizon (dead villages stop, +10d
  tail max). Measurement: the deathcensus recorder
  (scripts/policies/deathcensus-diag.js, DEATHCENSUS=1) reused unchanged
  via scripts/test-deathcensus-diag-sweep.js runOne, plus this arm's own
  analyzer (scripts/test-w123death-diag-sweep.js) over this arm's own
  corpus (evidence/2026-10-25/perseed-sim-w123death-a/). Nothing about
  the substrate was improvised.
- CONTROL REPLICATION GATE (must pass before any classification is
  trusted; mismatch = STOP, do not classify, report the mismatch):
  this arm's control re-run must match the published controls EXACTLY:
  won 4/8, median survival all-runs 150d, wins-excluded median 180d,
  national-ever 8/8, national-final 7/8, table invited 5, table entered
  4, wave-4 reach 5/8, wave-5 reach 0/8, max arc 4, death teles (mixed
  total) 261, kind-filtered villager deaths 27, death-context split
  field 12 / other 12 / raid 1 / arena 1 / tb 1.
- CLASSIFICATION SCHEME (mutually exclusive, applied in this priority
  order — a death gets exactly one class, the first that matches):
  1. POST-FLEE RE-ENCOUNTER — the villager had a field fight ending
     vFlee on the same vid+day as the death fight. (Precedence is
     deliberate: it is a distinct behavioral mechanism, and it is the
     sibling postflee arm's input. Soundness note: a villager who dies
     in a field fight cannot fight again that day, so any other field
     fight row for the same vid+day necessarily precedes the death
     fight — the same-day vFlee therefore did happen earlier that day,
     even though the recorder stores resolve and direct rows in
     separate arrays with no cross-array timestamp.)
  2. NEARLY-DEAD ENTRY — entry HP fraction < 0.15 (strictly below
     15%), not post-flee.
  3. ONE-ROUND ≥50% — rounds == 1 AND entry HP fraction >= 0.50, not
     post-flee, not nearly-dead.
  4. MULTI-ROUND GRIND — rounds >= 2 AND entry HP fraction >= 0.15,
     not post-flee. (Includes the even fight lost and the 0-damage
     grind; the dealt/taken numbers are reported per death so a
     0-damage sub-pattern stays visible inside the class, not hidden
     by it.)
  5. OTHER — anything else (in practice: rounds == 1 with entry HP
     in [0.15, 0.50), or rounds unrecorded). 'Other' is never a dumping
     ground: each 'other' death carries a written mechanism in the
     table.
- PER-EXPOSURE DEFINITION (pre-registered): field fights = field-context
  rows (resolve non-raid + direct non-arena) with outcome in
  {vKill, vDie, vFlee, mFlee}. 'Evade' rows are NOT fights (the
  pre-fight evade check decides contact, not outcome — fieldFights.js
  header) and are excluded from the denominator; an including-evade
  rate is reported as a sensitivity only. Rates are split wave-1/2/3
  vs wave-4+ (wave >= 4), and per wave 1, 2, 3 as well.
- POST-FLEE RE-ENCOUNTER COUNTING (pre-registered, two numbers, both
  reported, neither hidden):
  (a) PROVABLE (same-array): a field fight row that follows a field
      vFlee row for the same vid+day earlier in the SAME recorder
      array (resolve order / direct order are chronological within
      an array). Split by outcome: ending vDie (post-flee deaths)
      vs survived (vKill/mFlee/vFlee).
  (b) CO-OCCURRENCE (ceiling): vid+days carrying both a field vFlee
      and another field fight row (any array). For vDie vid+days this
      is exact by the death-final argument above; for survived
      vid+days it is a ceiling, because cross-array order is not
      recorded and the survived fight could precede the flee.
  This arm counts independently and does not coordinate with the
  sibling postflee arm mid-run.
- DIAG-GO BAR (set up front — 'large and clean enough' means all of):
  (a) the control replication gate passes exactly;
  (b) recorder errors 0 on the armed arm;
  (c) ONE class other than 'other' covers >= 5 wave-1/2/3 field deaths
      AND >= 50% of wave-1/2/3 field deaths, with all its members
      sharing the single class definition (no 'other' split inside
      the class);
  (d) the proposed primary's guard legs are all measurable on this
      band (national-ever, wave-4-or-win, raid deaths, composition-proof
      survival, as in prior runs).
  If no class meets (c), the verdict is DIAG-NO-GO, the largest class
  is named with its shortfall, and the proposed primary is reported as
  a CANDIDATE (with its bar), not as a GO.
- Pilot only: 8 seeds, no confirm spend.
- Horizon + why: 180d death-aware (reachability band; dead villages
  stop, wins end days 90–150). Seeds are the standing scale-wall band,
  reused intentionally for control comparability.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law),
  and the fieldFights.js header (there is no separate field-fight canon
  doc; Steve 2026-10-08: fights are blow-by-blow, never a table).
  No canon was invented for this arm.
- Balanced panel (§15): NOT run as a compare, deliberately — there is
  no lever in this run, so there is no before/after pair to compare;
  the comparison that matters is the control replication gate above
  (this arm's baseline + armed vs the published controls on identical
  seeds), which the analyzer prints in full.

## VERDICT: DIAG-GO

- (a) PASS: the control replication gate passes EXACTLY on every
  headline (see below), on the analyzed corpus.
- (b) PASS: recorder errors 0 on the armed arm.
- (c) PASS: ONE class other than 'other' — POST-FLEE RE-ENCOUNTER —
  covers 6 wave-1/2/3 field deaths, which is >= 5 AND 67% of the 9
  wave-1/2/3 field deaths, and all 6 members share the single class
  definition (same-day flee, then a death fight, with the death
  fight's entry HP exactly equal to the flee fight's exit HP in 6/6
  cases — see the chain table). No 'other' death exists in the
  classification at all (0 'other' among all 12 field deaths).
- (d) PASS: every proposed guard leg is measurable on this band
  (national-ever, wave-4-or-win union, raid deaths, composition-proof
  survival, starvation+sickness — all defined below from prior arms).
- Caveat carried openly (not a verdict change): the proposed primary
  sits on the sibling postflee arm's territory — this arm counted
  post-flee independently and did not coordinate with that arm
  mid-run, per the brief. The coordinator must deconflict before the
  next companion arm starts: either this proposal becomes that arm's
  primary, or the sibling arm absorbs it and this proposal becomes
  confirmation. The numbers below are the same either way.
- Proof gates: G2 recorder neutrality PASS (8/8 seeds identical on
  days/gameDays/ts/starvation/deaths in the analyzed corpus);
  check.js --only fieldfight — 2 passed, 0 failed.

## CONTROL REPLICATION GATE: PASS (exact, every headline)

Analyzed corpus: the deathcensus corpus
(evidence/2026-10-25/perseed-deathcensus-a/, same worktree, same
substrate, same seeds, same recorder) — see "Instrument notes" for
WHY this corpus, and what this arm's own re-run proved about it.
This arm's own re-run completed baseline 8/8 + armed 73671 before the
host EPERM flap blocked all further corpus writes; that completed
portion matches the deathcensus corpus EXACTLY on headlines, deaths,
analysis, and substantive fight fields (sole diff: a null
awayNewsLast key present in this arm's rows). The gate below is
therefore a gate on the analyzed corpus, verified equivalent on the
completed re-run portion.

| Headline | Published | Analyzed corpus |
|---|---|---|
| won | 4/8 | 4/8 |
| median survival, all runs | 150d | 150d |
| median survival, wins excluded | 180d | 180d |
| national-ever | 8/8 | 8/8 |
| national-final | 7/8 | 7/8 |
| table invited / entered | 5 / 4 | 5 / 4 |
| wave-4 reach | 5/8 | 5/8 |
| wave-5 reach | 0/8 | 0/8 |
| max arc | 4 | 4 |
| death teles (mixed total) | 261 | 261 |
| kind-filtered villager deaths | 27 | 27 |
| death-context split | field 12 / other 12 / raid 1 / arena 1 / tb 1 | field 12 / other 12 / raid 1 / arena 1 / tb 1 |

Per-seed survival days (control): 73671: 93, 73672: 106 (win),
73673: 134 (win), 73674: 180, 73675: 180, 73676: 174, 73677: 98 (win),
73678: 150 (win). All-8 mean 139.4d; villages dying before day 100: 2
(93, 98). Non-winners: 4 (73671, 73674, 73675, 73676), so the
wins-excluded median binds under the composition-proof rule.
Wave-4-or-win union (control): wave-4 seeds {73671, 73672, 73673,
73676, 73678} + win seeds {73672, 73673, 73677, 73678} = 6/8.
Starvation+sickness control recount: starvation 3 + sickness 3 = 6.

## CLASSIFICATION TABLE — all 12 control field deaths

Classes in pre-registered priority order (post-flee > nearly-dead >
one-round >=50% > multi-round grind > other). "Entry" = villager HP
fraction at death-fight start; "dealt" = damage the villager dealt;
"flee earlier" = a field fight ending vFlee for the same villager on
the same day (death-final argument: a villager dead in a field fight
cannot fight again that day, so any other same-day field row precedes
the death fight). The chain columns are the finding: for every
post-flee death, the death fight's entry HP EQUALS the flee fight's
exit HP, and (in 4/6) the death fight's monster entry HP equals the
flee fight's monster exit HP — the same wounded monster, met again
the same day, at exactly the HP the villager fled with.

| Seed/day | Villager vs monster (wave) | Rounds | Entry | Dealt/taken | Flee earlier same day (flee fight exit HP -> death entry HP) | One-round | Class |
|---|---|---|---|---|---|---|---|
| 73671/d89 | ursula_weber vs eater (4) | 1 | 0.87 | 0 / 103 | no | yes | one-round >=50% |
| 73672/d43 | priya_nair vs understudy (2) | 4 | 0.45 | 51 / 50 | YES — understudy vFlee 2 rounds, villager 73 -> 45, monster 105 -> 70; death fight enters 45 / monster 70 | no | post-flee re-encounter |
| 73672/d56 | ethan_hunt vs ad_break (3) | 1 | 0.09 | 19 / 13 | YES — ad_break vFlee 2 rounds, villager 32 -> 9, monster 98 -> 62; death fight enters 9 / monster 62 | yes | post-flee re-encounter |
| 73673/d8 | gen_te50r63 vs gallowdeer (1) | 1 | 0.07 | 0 / 13 | YES — TWO gallowdeer vFlees: 25 -> 19, then 19 -> 7, monster 114 -> 93 -> 69; death fight enters 7 / monster 69 (plus a bulldozer mFlee the same day, 47 -> 25 — four field fights in one day) | yes | post-flee re-encounter |
| 73673/d107 | gen_in9ciwi vs suburb (4) | 1 | 0.52 | 0 / 69 | no | yes | one-round >=50% |
| 73674/d17 | diana_osei vs hushwolf (1) | 1 | 0.11 | 0 / 20 | YES — hushwolf chain: mFlee 97 -> 39 (took 78 while the monster fled), vFlee 39 -> 11, monster full 50; death fight enters 11 / monster full 50 (fresh hushwolf, not the wounded one) | yes | post-flee re-encounter |
| 73675/d30 | gen_uzmmgq0 vs nevermore (1) | 1 | 0.07 | 0 / 10 | no | yes | nearly-dead entry |
| 73675/d146 | nina_petrova vs focus_group (3) | 1 | 0.11 | 0 / 23 | YES — focus_group vFlee 3 rounds, villager 91 -> 11 (took 80, dealt 0), monster 155 -> 155; death fight enters 11 / monster 155 | yes | post-flee re-encounter |
| 73676/d18 | gen_g8rx4z0 vs hushwolf (1) | 1 | 0.06 | 0 / 9 | YES — hushwolf chain: mFlee 100 -> 30 (took 70 while the monster fled), vFlee 30 -> 6, monster 50 -> 38; death fight enters 6 / monster 38 (fresh-full monster in the vFlee fight, wounded in the death fight) | yes | post-flee re-encounter |
| 73676/d171 | visjoin_165 vs suburb (4) | 1 | 0.52 | 9 / 87 | no | yes | one-round >=50% |
| 73677/d67 | nora_wilson vs belltoad (1) | 3 | 1.00 | 0 / 105 | no | no | multi-round grind |
| 73677/d68 | gen_ed0l37r vs belltoad (1) | 2 | 0.73 | 0 / 76 | no | no | multi-round grind |

Class totals, all 12 field deaths: post-flee re-encounter 6,
one-round >=50% 3 (all wave 4 — the already-killed class),
multi-round grind 2 (both belltoad, both 0 dealt — see below),
nearly-dead entry 1, other 0.
Class totals, wave-1/2/3 only (9 deaths): post-flee 6 (67%),
multi-round grind 2 (22%), nearly-dead entry 1 (11%), other 0.

THE OVERLAP, STATED NOT HIDDEN: without the priority order, the
nearly-dead count among field deaths would be 6, not 1 — five of the
six post-flee deaths ALSO entered below 15% HP (Ethan 0.09, gallowdeer
0.07, Diana 0.11, Nina 0.11, hushwolf 0.06; only Priya at 0.45 does
not). The priority order does not manufacture the post-flee class:
the flee fights CAUSED the nearly-dead entries. In 6/6 post-flee
deaths the death entry HP equals the flee exit HP exactly, and the
villager took the damage that put them below 15% (where applicable)
IN the flee fight(s) — e.g. Nina 91 -> 11 in one flee fight, Diana
97 -> 39 -> 11 across two fights, Ethan 87 -> 58 -> 32 across day 55
then 32 -> 9 on day 56 before dying. "Nearly-dead entry" as a
standalone class would therefore aim at the symptom (being hurt when
met) while "post-flee re-encounter" aims at the cause (being met
again, the same day, at flee-exit HP, with no recovery between).
The pure nearly-dead remainder is exactly one death: the nevermore
villager at 0.07 HP with no same-day flee — the only field death
where "don't go out hurt" is the whole story.

THE BELLTOAD PAIR (multi-round grind, open mechanism — NOT solved
here): both villagers entered healthy (1.00, 0.73), faced the same
40%-HP belltoad on consecutive days (d67, d68 — monster HP unchanged
at 0.40 because neither villager dealt any damage), dealt 0 damage
over 2–3 rounds, and took 105 / 76 damage. Why a healthy villager
deals 0 over multiple rounds against a wounded toad is still unknown
(the deathcensus arm flagged it; this arm confirms it twice more
with the same monster at the same HP). A companion aimed at
post-flee does not touch this pair — that is a separate blank (see
"Next blank"), and the proposed bar below does not count these two
deaths as post-flee saves.

## PER-EXPOSURE RATES (field deaths / field fights; fights exclude evade)

Field fights = field-context rows with outcome in {vKill, vDie,
vFlee, mFlee}; evade rows (122) are not fights (the pre-fight evade
check decides contact — fieldFights.js header) and are excluded, with
the including-evade rate as a sensitivity.

| Wave class | Field fights | Field deaths | Deaths per fight |
|---|---|---|---|
| wave 1 | 561 | 6 | 1.07% |
| wave 2 | 239 | 1 | 0.42% |
| wave 3 | 59 | 2 | 3.39% |
| wave 4+ | 4 | 3 | 75% — DENOMINATOR WARNING: only 4 wave-4+ field fights exist on this band; this is not a rate to act on, it is a statement that wave-4 field meetings are almost always fatal (the 3 wave-4 one-shot deaths) |
| wave 1/2/3 | 859 | 9 | 1.05% |
| all field | 863 | 12 | 1.39% |
| including evade (sensitivity) | 985 | 12 | 1.22% |

No unexpected outcomes in field rows (0 rows outside the four fight
outcomes + evade). Wave-3 field exposure is thin (59 fights) but its
rate (3.39%) is ~3x wave 1's — driven by the two wave-3 post-flee
deaths (Ethan, Nina), not by wave-3 fights being generally lethal.

## POST-FLEE SAME-DAY RE-ENCOUNTERS (band-wide, counted independently)

Two numbers, per the pre-registration (neither hidden):

(a) PROVABLE (same-array — a field fight row following a field vFlee
    row for the same villager+day earlier in the same recorder
    array): 31 post-flee fights — 6 ending in death, 25 survived
    (vKill/mFlee/vFlee). The 6 deaths are exactly the 6 post-flee
    deaths in the classification table (same seeds, days, villagers).
(b) CO-OCCURRENCE (ceiling — villager+days carrying both a field
    vFlee and another field fight row, any array): 38 villager-days
    — 6 with a death, 32 survived-only. For death days this is exact
    (death-final argument); for survived days it is a ceiling, because
    cross-array order is not recorded.

LETHALITY CONTRAST (the number the next arm should feel): post-flee
fights kill at 6/31 = 19.4%, while all other field fights kill at
6/832 = 0.72% — a post-flee re-encounter fight is ~27x as lethal as
an ordinary field fight on this band. The reason is visible in the
chain table: the villager re-enters at flee-exit HP (often below
15%) against the same (or a fresh) monster, with no healing between
fights. Fleeing, as the engine currently runs it, does not end the
day's danger — it starts a countdown to the next meeting.
Survivals matter too: 25 post-flee fights were survived, including
villagers who fled the same monster 3–4 times in one day and lived
(e.g. Sanne vs hushwolf, 4 flees on d20). A companion that merely
blocks re-encounters will change those 25 trajectories as well —
that is a guard consideration for the next arm, not a reason to
dismiss the class: the deaths are 6, the survivals are 25, and any
lever must be judged on both.

## PROPOSED NEXT PRIMARY + BAR (scoped, single class)

PRIMARY (next companion arm, same band: tableseat-nowait, seeds
73671–73678, 180d death-aware horizon, pilot 8 seeds): the
POST-FLEE RE-ENCOUNTER class, exactly as defined here (a field death
on a villager+day that already carries a field vFlee — the
classification above is the control measurement).
GO requires ALL of (pilot bars, adapted from the boughtflee arm's
bar set so the arms stay comparable):
- Post-flee field deaths: 6 -> <= 2 (save at least 4 of 6).
- Total field deaths: 12 -> <= 9 (the arm must actually reduce
  field deaths, not relabel them; and the reduction must come from
  the post-flee class — the by-class table, not just the total,
  is the judge).
- One-round >=50% field deaths: 3 -> <= 3 (must not grow — the
  wave-4 one-shot class is already killed as a cure; a post-flee
  lever that pushes villagers into standing and dying to wave-4
  damage fails here).
- Composition-proof survival (boughtflee definition): wins-excluded
  median binds only if >= 4 non-winners in BOTH control and armed;
  otherwise judge on the full 8-seed distribution — armed all-8 mean
  >= control all-8 mean (139.4d) AND armed villages dying before day
  100 <= control count + 1 (control: 2, so <= 3).
- National-ever >= 6/8 (control 8/8; the prior arm's bar).
- Wave-4-or-win (union count) >= 5/8 (control 6/8; the prior arm's
  bar).
- Kind-filtered raid villager deaths <= 2 (control 1; raid defense
  must not break).
- Starvation+sickness <= control recount + 2 (control 6, so <= 8).
- A directed probe proving the lever fires on a post-flee
  re-encounter (and proving raid/arena routes are untouched).
If pilot GO: confirm on 12 fresh seeds 73679–73690, same policy /
horizon, pro-rata legs (post-flee deaths <= 3, field deaths <= 13,
same guard legs at 12-seed scale: national-ever >= 9/12,
wave-4-or-win >= 8/12, raid <= 3, starvation+sickness <=
confirm-control recount + 3), with the confirm control run on the
same fresh seeds — never judged against the pilot baseline.

## WALL NUMBERS

National-ever 8/8, national-final 7/8, table invited 5, table entered
4, wins 4/8 (lesser seat only), wave-4 reach 5/8, wave-5 reach 0/8,
median survival 150d all runs / 180d wins-excluded, max arc 4.
Unchanged from the published controls — this is a DIAG, no lever
moved, the full seat is still unreached and wave 5 is still 0/8.
Scale-onramp stays the blocking axis.

## VILLAGE ASSESSMENT (plain words)

The villages look the same as they have all week: they reach the
region, most get invited to the table, four sit down and win the
lesser seat, and nobody reaches the full seat or wave 5. What this
arm adds is the story behind the field-death number everyone has
been quoting. A villager does not usually die because one monster
was too strong. A villager dies because they meet a monster, run
from it hurt, and then — the same day, sometimes within the same
round of ticks — meet it again, still hurt, with nothing in between
to heal them or get them home. Priya ran from the Understudy at 73
health, met it again at 45, and lost a four-round fight she might
have won fresh. Ethan ran from the Ad Break four times over two
days, bleeding 87 down to 9, and died on the fifth meeting. Diana
and her hushwolf fought three times in one day. The village does
not lose people to single heroic defeats; it loses them to a
grinding same-day attrition that fleeing was supposed to prevent
but doesn't — fleeing just pauses the fight, it doesn't end the
day. The raids, the fights everyone watches, cost one villager in
342 fights. The field, the fight nobody watches, costs twelve — and
six of those twelve are this one pattern: fled, met again, died.
Fix the space between fleeing and the next meeting — give the
fleeing villager a way to actually get out, or a day to recover —
and half the field deaths have nowhere to come from. The other
deaths need other fixes: three healthy villagers one-shotted by
wave-4 monsters (a different, already-scoped problem), two villagers
who couldn't scratch a wounded toad (a mystery, not a lever yet),
and one villager caught hurt by a Nevermore with no flee in the
story at all.

## SENSE-TESTING (transcript tap, on the census trajectory)

Transcript re-run for seed 73672 reproduced the census trajectory
exactly (censusMatch=true, days 106, villager deaths 5, field 2).
Full sense file: evidence/2026-10-25/sim-w123death-a-sense.txt
(the re-run's own sense-file write to /tmp was lost to the flap, so
the two lines below are transcribed verbatim from the re-run's
stdout — the tap's lines, not a narration replay's).

> 💀 The Understudy killed Priya in 4 rounds. The village mourns.
> (d43: Priya vs understudy, wave 2, 4 rounds, entered at 45% HP after
> fleeing the same monster earlier the same day at 73 -> 45 HP,
> dealt 51, took 50 — an even fight, lost, by a villager who had
> already spent her health fleeing.)
> 💀 The Ad Break killed Ethan in 1 round. The village mourns.
> (d56: Ethan vs ad_break, wave 3, 1 round, entered at 9% HP after
> four ad_break fights over two days, 87 -> 58 -> 32 -> 9 -> 0,
> dealt 19, took 13, monster ended below the line at 0.13.)

Judged as stories: Priya's death reads as a fight she could
plausibly have survived — the tragedy is not the monster's
strength but that she met it twice. Ethan's reads as an ending
written the day before — by the time the death line fires, the
villager has been dying across four meetings. Both readings point
the same way as the numbers: the failure is not in the death
fight, it is in the space between fights.

## INSTRUMENT NOTES

- New: scripts/test-w123death-diag-sweep.js (sweep + --resume +
  --analyze-only + --transcript modes; classification, per-exposure,
  and both post-flee counts in one analyzer; --analyze-only analyzes
  an existing corpus without running sims). Reused unchanged:
  scripts/policies/deathcensus-diag.js + scripts/
  test-deathcensus-diag-sweep.js runOne (baseline + armed, identical
  seeds, same invocation as the published controls).
- THE FLAP (loud, with consequences): at ~10:48 UTC the host EPERM
  write flap (the known container class from AGENTS.md) began
  blocking corpus writes in this worktree — the shared writer lost
  seed 73672's armed row twice, then this arm's robust retry writer
  (10-min retry loop, alternating node-fs and shell-base64) ran
  ~40 minutes without landing a single write, while shell probes
  succeeded only in seconds-long windows (11:04, 11:30). Disk is
  fine (25% used); sibling sweeps are fighting the same flap
  (awayvoice's own .tmp-resume file is visible). What the flap
  cost and did not cost: this arm's own re-run completed baseline
  8/8 + armed 73671 (all written before 10:48); armed 73672–73678
  were computed up to four times and lost at write time each time.
  NOTHING unique was lost — the sims are deterministic, and the
  deathcensus corpus in this same worktree (written before the
  flap, same substrate/seeds/recorder) is trajectory-identical to
  this arm's re-run on every completed portion (baseline 8/8:
  headlines + deaths identical; armed 73671: headlines + deaths +
  analysis identical, substantive fight fields identical — the sole
  diff is a null awayNewsLast key in this arm's rows). The
  classification above is therefore analyzed over the deathcensus
  corpus, with the equivalence proven and stated here — NOT
  silently substituted. The transcript re-run (73672) independently
  re-proved the trajectory (censusMatch=true). What is missing
  because of the flap: this arm's own perseed corpus for armed
  73672–73678 and its summary.json — they do not exist, and this
  evidence file says so instead of pretending otherwise. Re-running
  --resume after the flap clears will materialize them (the analyzer
  is deterministic over the same corpus), and the coordinator can
  verify the classification matches this file exactly.
- Analyzer bug found and fixed during this run: the provable
  post-flee loop labeled every row 'direct' (it compared an array
  to a freshly filtered copy — always false). Totals were
  unaffected (the loop iterated the right arrays); only the src
  label was wrong. Fixed to track the source string explicitly;
  totals re-verified after the fix (provable 31 = 6 deaths + 25
  survivals, unchanged).
- What the recorder cannot see (carried from deathcensus, still
  true): ally falls inside a field fight; monster HP fractions for
  def-only fights (m == null); cross-array fight order (hence the
  two post-flee numbers — provable vs ceiling — instead of one);
  and the WHY behind 0-damage multi-round deaths (the belltoad
  pair). The same-monster identity claim above rests on HP
  carry-over (exact in 4/6 post-flee deaths); in the 2 hushwolf
  chains the death fight's monster is at full HP, so entity identity
  is NOT claimed there — only the same-day, same-type re-encounter
  at flee-exit villager HP, which the rows prove directly.
- Corpus of record for this analysis:
  evidence/2026-10-25/perseed-deathcensus-a/ (16 per-seed JSONs +
  summary.json, committed by the deathcensus arm). This arm's own
  partial corpus: evidence/2026-10-25/perseed-sim-w123death-a/
  (baseline 8/8 + armed 73671 only — see above). Analyzer:
  scripts/test-w123death-diag-sweep.js --analyze-only with
  CORPUS_DIR=evidence/2026-10-25/perseed-deathcensus-a reproduces
  every number in this file.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- Classification priority is a metric choice, and it is disclosed:
  post-flee takes precedence over nearly-dead, so the nearly-dead
  class reads 1 instead of 6. The raw overlap (5 post-flee deaths
  also below 15% entry) is reported in full above, so no future arm
  can mistake the priority-ordered table for the raw counts. If a
  future arm pre-registers the reverse priority, its nearly-dead
  count will be 6 and its post-flee count will be 1 (nevermore is
  the only pure nearly-dead death; Priya is the only post-flee
  death above 15% entry) — the chain table lets either arm verify
  its own count.
- Field-death totals here (12) are kind-filtered attributed detail
  rows (context 'field'), the same definition the boughtflee arm
  used for its <= 9 bar — comparable across arms. Per-exposure rates
  are reported alongside raw counts (boughtflee's rule: the raw
  count binds, the rate informs).
- Wave-4+ per-exposure (3/4 = 75%) is NOT a usable rate — the
  denominator is 4 fights. It is reported with the warning attached
  and must not be quoted without it.
- Death-tele totals (261) are still mixed totals (192 monster + 42
  scholar + 27 villager, per deathcensus) and are never used in any
  bar in this file.
- The control gate was judged on the analyzed corpus with the
  equivalence proof above — a deviation from "your own re-run"
  forced by the flap, disclosed in full, not hidden. If the
  coordinator requires a fully own-corpus gate, the --resume path
  exists and the classification must match this file exactly (the
  analyzer is deterministic); until then, this file's gate claim is
  "PASS on the trajectory-identical corpus," not "PASS on a
  complete own re-run."

## NEXT BLANK

1. Post-flee companion (this run's named primary): the space between
   fleeing and the next meeting — a lever that lets a fleeing
   villager actually disengage for the day (or recover before the
   next meeting), judged on the bar above. Coordinate with the
   sibling postflee arm before starting (see the verdict caveat).
2. Belltoad 0-damage deaths (2/band, same 40%-HP toad, consecutive
   days): why do healthy villagers deal 0 over 2–3 rounds? Fight-row
   forensics (weapon/gear state at entry is not in the rows — the
   recorder would need it), not a lever yet.
3. Own-corpus completion: re-run --resume after the flap clears so
   perseed-sim-w123death-a/ holds armed 73672–73678 + summary.json,
   and verify the classification matches this file exactly.
4. Pure nearly-dead remainder (1 death, nevermore at 0.07 HP, no
   flee): if a future arm wants the "don't go out hurt" lever, its
   target on this band is exactly one death — it cannot justify
   itself on this band's numbers alone.

Convergence state: converging (NOT converged — this is a DIAG; it
names the next primary with numbers, but no lever moved, the full
seat is still unreached, and wave 5 is still 0/8).
